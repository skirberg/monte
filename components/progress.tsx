"use client";

import * as React from "react";
import { Flame, Snowflake, Trophy } from "lucide-react";
import { track } from "@vercel/analytics";
import { BADGES, CHIPS_FOR, DAILY_GOAL, addXp, bump, exportProgress, getProgress, importProgress, levelOf, localDay, unlockBadge, useProgress, type ProgressEvent } from "@/lib/progress";
import { callout, confetti } from "@/lib/fun";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Turns events from anywhere (study pages, games, /decide/) into progress, and celebrates real milestones. */
export function ProgressBridge() {
  React.useEffect(() => {
    const onXp = (e: Event) => {
      const d = (e as CustomEvent<{ xp: number; reason?: string }>).detail;
      if (d && d.xp > 0) addXp(d.xp, d.reason);
      if (d?.reason === "daily") track("Daily finished");
    };
    const onBadge = (e: Event) => unlockBadge((e as CustomEvent<string>).detail);
    const onCount = (e: Event) => bump((e as CustomEvent<string>).detail);
    const onProgress = (e: Event) => {
      const d = (e as CustomEvent<ProgressEvent>).detail ?? {};
      if (d.levelUp) {
        confetti();
        callout(`Level ${d.levelUp}`, true);
        track("Level up", { level: d.levelUp });
      } else if (d.badge) {
        confetti(40);
        callout(`Badge: ${BADGES[d.badge]?.name ?? d.badge}`, true);
        track("Badge earned", { badge: d.badge });
      } else if (d.goalHit) {
        confetti(50);
        callout("Daily goal done", true);
      }
    };
    window.addEventListener("monte:xp", onXp);
    window.addEventListener("monte:badge", onBadge);
    window.addEventListener("monte:count", onCount);
    window.addEventListener("monte:progress", onProgress);
    return () => {
      window.removeEventListener("monte:xp", onXp);
      window.removeEventListener("monte:badge", onBadge);
      window.removeEventListener("monte:count", onCount);
      window.removeEventListener("monte:progress", onProgress);
    };
  }, []);
  return null;
}

function Ring({ value, size = 28 }: { value: number; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--clay)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, value))}
        style={{ transition: "stroke-dashoffset 500ms cubic-bezier(.2,.8,.2,1)" }}
      />
    </svg>
  );
}

/** Header button: today's goal ring and the streak. Opens the full picture. */
export function ProgressButton() {
  const p = useProgress();
  const [open, setOpen] = React.useState(false);
  const [now] = React.useState(() => Date.now());
  if (!p) return <span className="size-11" aria-hidden />;
  const day = localDay(now);
  const todayXp = p.days[day] ?? 0;
  const lv = levelOf(p.xp);
  const gap = p.lastDay ? Math.round((Date.parse(day) - Date.parse(p.lastDay)) / 864e5) : 99;
  const live = gap <= 1 || gap - 1 <= p.freezes;
  const streak = live ? p.streak : 0;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = localDay(now - (6 - i) * 864e5);
    return { d, xp: p.days[d] ?? 0, label: new Date(d + "T12:00").toLocaleDateString("en-US", { weekday: "narrow" }) };
  });
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-ink transition-colors hover:bg-sand"
        aria-label={`Your progress: level ${lv.level}, ${todayXp} of ${DAILY_GOAL} XP today, ${streak} day streak`}
      >
        <Ring value={todayXp / DAILY_GOAL} />
        <span className="flex items-center gap-0.5 tabular-nums">
          <Flame className={streak ? "size-4 text-clay" : "size-4 text-ink-muted"} />
          {streak}
        </span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-[650]">Your progress</SheetTitle>
            <SheetDescription>Saved in this browser. XP comes from answering, finishing and remembering, never from clicking around.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 px-4 pb-8">
            <section className="grid gap-2">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-3xl font-[650]">Level {lv.level}</p>
                <p className="text-sm text-ink-muted tabular-nums">
                  {lv.into} / {lv.span} XP
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand-2">
                <div className="h-full rounded-full bg-clay transition-[width] duration-500" style={{ width: `${(lv.into / lv.span) * 100}%` }} />
              </div>
              <p className="text-sm text-ink-muted tabular-nums">{p.xp.toLocaleString()} XP in total</p>
            </section>

            <section className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-sand p-3">
                <p className="text-xs text-ink-muted">Today</p>
                <p className="font-display text-2xl font-[650] tabular-nums">{todayXp}</p>
                <p className="text-xs text-ink-muted">of {DAILY_GOAL} XP</p>
              </div>
              <div className="rounded-2xl bg-sand p-3">
                <p className="text-xs text-ink-muted">Streak</p>
                <p className="flex items-center justify-center gap-1 font-display text-2xl font-[650] tabular-nums">
                  <Flame className="size-5 text-clay" /> {streak}
                </p>
                <p className="flex items-center justify-center gap-1 text-xs text-ink-muted">
                  <Snowflake className="size-3" /> {p.freezes} freeze{p.freezes === 1 ? "" : "s"}
                </p>
              </div>
              <div className="rounded-2xl bg-sand p-3">
                <p className="text-xs text-ink-muted">Monte chips</p>
                <p className="font-display text-2xl font-[650] tabular-nums">{p.chips.toLocaleString()}</p>
                <p className="text-xs text-ink-muted">play money</p>
              </div>
            </section>

            <section className="grid gap-2">
              <h3 className="text-sm font-semibold">Last 7 days</h3>
              <div className="flex items-end gap-2" role="img" aria-label={last7.map((x) => `${x.d}: ${x.xp} XP`).join(", ")}>
                {last7.map((x) => (
                  <div key={x.d} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-sand-2">
                      <div
                        className={x.xp >= DAILY_GOAL ? "w-full bg-clay" : "w-full bg-line-strong"}
                        style={{ height: `${Math.min(100, (x.xp / DAILY_GOAL) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-muted">{x.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-muted">A full bar is the daily goal. Every 7 days in a row earns a freeze that saves your streak if you miss one day.</p>
            </section>

            <section className="grid gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Trophy className="size-4" /> Badges, {p.badges.length} of {Object.keys(BADGES).length}
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {Object.entries(BADGES).map(([id, b]) => {
                  const got = p.badges.includes(id);
                  return (
                    <li key={id} className={got ? "rounded-2xl border border-clay bg-clay-tint p-3" : "rounded-2xl border border-line p-3 opacity-70"}>
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-ink-muted">{got ? "Earned" : b.how}</p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <BackupCard />

            <section className="grid gap-1 text-sm text-ink-muted">
              <h3 className="text-sm font-semibold text-ink">How XP and chips work</h3>
              <p>XP measures learning and never goes down: right answer 10, a try 2, finished drill 20, flashcard 3, read a topic to the end 5, quick math 2, election call 5 to 10.</p>
              <p>
                Chips are play money you spend in the games. Learning earns them: {CHIPS_FOR.goal} for the daily goal, {CHIPS_FOR.level} for each level, {CHIPS_FOR.badge} for each badge.
              </p>
              <button
                type="button"
                className="mt-2 inline-flex min-h-11 items-center self-start text-sm text-clay-ink underline-offset-4 hover:underline"
                onClick={() => {
                  if (window.confirm("Reset XP, streak, chips and badges in this browser?")) {
                    localStorage.removeItem("monte-progress");
                    window.dispatchEvent(new CustomEvent("monte:progress", { detail: {} }));
                    void getProgress();
                  }
                }}
              >
                Reset progress
              </button>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function BackupCard() {
  const [msg, setMsg] = React.useState("");
  const [code, setCode] = React.useState("");
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold">Back up or move your progress</h3>
      <p className="text-xs text-ink-muted">
        Progress lives in this browser, so clearing site data or switching phones starts you over. Copy a code here and paste it on any other device, or keep the file.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-medium hover:border-ink"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(exportProgress());
              setMsg("Code copied. Paste it on your other device.");
            } catch {
              setMsg("Could not copy. Use Download instead.");
            }
          }}
        >
          Copy code
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-medium hover:border-ink"
          onClick={() => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([exportProgress()], { type: "text/plain" }));
            a.download = `monte-progress-${localDay()}.txt`;
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          Download backup
        </button>
      </div>
      <form
        className="grid grid-cols-[1fr_auto] gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!code.trim()) return;
          if (!window.confirm("Replace the progress in this browser with the pasted code?")) return;
          const ok = importProgress(code);
          setMsg(ok ? "Restored. Reloading." : "That code didn't work. Copy it again from your other device.");
          if (ok) setTimeout(() => location.reload(), 600);
        }}
      >
        <label className="sr-only" htmlFor="restore-code">Paste a progress code</label>
        <input id="restore-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste a code to restore" className="h-11 min-w-0 rounded-xl border border-line-strong bg-paper px-3 text-base" />
        <button type="submit" className="h-11 rounded-full bg-ink px-4 text-sm font-medium text-paper">Restore</button>
      </form>
      <p className="text-xs text-ink-muted" aria-live="polite">{msg}</p>
    </section>
  );
}
