"use client";

import * as React from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Pause, Play } from "lucide-react";
import { GALTON, GaltonPile } from "@/remotion/galton-pile";
import { useMediaQuery } from "@/lib/hooks";
import { useMode } from "@/lib/mode";

/** The hero film. Plays only while on screen; with reduced motion or in Focus mode it shows the finished pile. */
export function HeroFilm({ className }: { className?: string }) {
  const ref = React.useRef<PlayerRef>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const focus = useMode() === "focus";
  const still = reduced || focus;
  const [paused, setPaused] = React.useState(false);
  const visible = React.useRef(false);

  React.useEffect(() => {
    const el = box.current;
    const player = ref.current;
    if (!el || !player) return;
    if (still || paused) {
      player.pause();
      if (still) player.seekTo(268);
      return;
    }
    if (visible.current) player.play();
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting) player.play();
        else player.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still, paused]);

  return (
    <div ref={box} className={`relative ${className ?? ""}`}>
      <div
        role="img"
        aria-label="Animation: grains of sand fall through rows of pegs and pile into a bell curve across thirteen bins while the running mean and standard deviation settle near 7 and 1.73."
      >
      <Player
        ref={ref}
        component={GaltonPile}
        durationInFrames={GALTON.durationInFrames}
        fps={GALTON.fps}
        compositionWidth={GALTON.width}
        compositionHeight={GALTON.height}
        style={{ width: "100%", aspectRatio: "1 / 1" }}
        loop
        autoPlay={false}
        initialFrame={still ? 268 : 0}
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense
      />
      </div>
      {!still && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="absolute bottom-0 right-0 grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-paper hover:text-ink"
          aria-label={paused ? "Play the animation" : "Pause the animation"}
          aria-pressed={paused}
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      )}
    </div>
  );
}
