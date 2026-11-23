import type { Metadata } from "next";
import { Check, Download, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, grid } from "@/components/layout/section";
import { Wordmark } from "@/components/brand/logo";
import { ClearSpace, MinSize, Misuse } from "@/components/brand/kit-drawings";
import { CopyValue } from "@/components/brand/copy-value";
import { GameArt } from "@/components/play/game-art";
import { ToolMark } from "@/components/decide/tool-mark";
import { GAMES } from "@/lib/site-data";
import { TOOLS } from "@/lib/decide/tools";
import { CopyText } from "@/components/copy-text";
import { JsonLd } from "@/components/json-ld";
import { BOILERPLATE, COLORS, COLOR_RULE, FONT_LICENSE, FONT_LINKS, IDEA, KIT, NAME_RULES, TYPE, VOICE, oklchToHex } from "@/lib/brand";
import { NameRow } from "@/components/brand/name-row";
import { SITE_NAME, abs, pageMeta } from "@/lib/seo";
import kit from "@/public/brand/kit.json";

export const metadata: Metadata = pageMeta("/brand/", "Brand", "The Monte brand kit: the logo, mark, app icons and banners to download, the colours, the type and the voice, with ready-to-paste descriptions.");

const h2 = "font-display text-headline font-semibold leading-none";
const card = "rounded-card border border-line bg-paper p-5 md:p-6";
const small = "text-sm text-ink-muted";
const fileLink = "inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-4 hover:decoration-ink";
// A link inside a sentence: running text, so it keeps the line's height.
const textLink = "underline decoration-line-strong underline-offset-4 hover:decoration-ink";

const zipFile = kit.files.find((f) => f.path === "kit.zip")!;
const mb = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`;
const at = (path: string) => `/brand/${path}`;
// The grounds each logo variant is made for, fixed whatever the page's theme: that is the point of a variant.
const tok = (token: string, night = false) => {
  const c = COLORS.find((x) => x.token === token)!;
  return oklchToHex(night ? c.dark : c.light);
};
const GROUND: Record<string, string> = { color: tok("sand"), reversed: tok("paper", true), black: "#ffffff", white: tok("clay") };
const MARK_GROUND: Record<string, string> = { color: tok("sand"), black: "#ffffff", white: tok("clay"), tile: tok("paper", true) };

function Head({ id, title, line }: { id: string; title: string; line?: string }) {
  return (
    <div className="col-span-4 mb-block grid gap-3 md:col-span-12">
      <h2 id={id} className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
        {title}
      </h2>
      {line && <p className="max-w-measure text-lead text-ink-muted">{line}</p>}
    </div>
  );
}

/** A row of plain download links: the vector first, then each size. */
function Files({ items }: { items: [label: string, href: string][] }) {
  return (
    <p className="flex flex-wrap gap-x-3 text-sm">
      {items.map(([label, href]) => (
        <a key={href} href={href} download className={fileLink}>
          {label}
        </a>
      ))}
    </p>
  );
}

type Social = (typeof KIT.social)[number];
/** One banner, small, with its day and night files (the page shows the one that matches its theme). */
function Banner({ s }: { s: Social }) {
  const dk = "dark" in s && s.dark;
  const avatar = s.file === "avatar-400";
  const links: [string, string][] = avatar
    ? [["400", at("social/avatar-400.png")], ["800", at("social/avatar-800.png")]]
    : dk
      ? [["Day", at(`social/${s.file}.png`)], ["Night", at(`social/${s.file}-dark.png`)]]
      : [["PNG", at(`social/${s.file}.png`)]];
  const img = "h-auto w-full rounded-inner border border-line";
  return (
    <figure className="mb-6 grid break-inside-avoid gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={at(`social/${s.file}.png`)} alt="" width={s.w} height={s.h} loading="lazy" decoding="async" className={`${img} ${dk ? "dark:hidden" : ""}`} />
      {dk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={at(`social/${s.file}-dark.png`)} alt="" width={s.w} height={s.h} loading="lazy" decoding="async" className={`${img} hidden dark:block`} />
      )}
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-medium">
          {avatar ? "Avatar" : s.use} <span className="font-mono tabular-nums text-ink-muted">{avatar ? "400, 800" : `${s.w}×${s.h}`}</span>
        </span>
        <Files items={links} />
      </figcaption>
    </figure>
  );
}

/** The public brand kit (DESIGN.md has the reasons; lib/brand.ts has the words; scripts/make-brand.tsx draws every file). */
export default function BrandPage() {
  const wide = KIT.social.filter((s) => s.w / s.h > 1.2);
  const tall = KIT.social.filter((s) => s.w / s.h <= 1.2);
  return (
    <>
      <SiteHeader mode="landing" />
      <JsonLd data={{ "@type": "WebPage", name: `${SITE_NAME} brand`, url: abs("/brand/"), description: BOILERPLATE.short }} />
      <main id="main" tabIndex={-1} className="pb-section outline-none">
        {/* The idea, and the whole kit in one download */}
        <Section top="block" inner={`${grid} gap-y-block`} aria-labelledby="brand-t">
          <div className="col-span-4 grid content-start gap-6 md:col-span-12 lg:col-span-7">
            <h1 id="brand-t" className="sr-only">
              Brand
            </h1>
            <Wordmark className="h-14 sm:h-20" />
            <p className="font-display text-display font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 78" }}>
              {IDEA.line}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href={at("kit.zip")} download className="btn btn-primary">
                <Download className="size-4" aria-hidden />
                Download the kit, {mb(zipFile.bytes)}
              </a>
              <p className={small}>
                {kit.files.length - 1} files, drawn from the site&rsquo;s own code.{" "}
                <a href={at("kit.json")} className={textLink}>
                  kit.json
                </a>
              </p>
            </div>
          </div>
          {/* Where the name comes from, drawn (the same row as /about/) */}
          <NameRow className="col-span-4 self-end md:col-span-12 lg:col-span-5 lg:grid-cols-2" />
        </Section>

        {/* Logo: four variants, each on the ground it is made for */}
        <Section aria-labelledby="logo-t" inner={`${grid} gap-y-6`}>
          <Head id="logo-t" title="Logo" line="Free to use when you link to or write about Monte." />
          {KIT.logo.map((v) => (
            <figure key={v.id} className="col-span-4 grid content-start gap-3 md:col-span-6 lg:col-span-3">
              <div className="grid aspect-[8/5] place-items-center rounded-stage border border-line p-8" style={{ background: GROUND[v.id] }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={at(`logo/monte-logo-${v.id}.svg`)} alt={`The Monte logo, ${v.name.toLowerCase()}`} className="h-10 w-auto sm:h-12" />
              </div>
              <figcaption>
                <p className="font-semibold">{v.name}</p>
                <p className={small}>{v.use}</p>
                <Files items={[["SVG", at(`logo/monte-logo-${v.id}.svg`)], ...KIT.logoWidths.map((w) => [`PNG ${w}`, at(`logo/monte-logo-${v.id}-${w}.png`)] as [string, string])]} />
              </figcaption>
            </figure>
          ))}
        </Section>

        {/* Clear space, the smallest size, and never */}
        <Section aria-labelledby="space-t" inner={`${grid} gap-y-6`}>
          <Head id="space-t" title="Room and size" line={KIT.clearSpace} />
          <div className="col-span-4 grid place-items-center rounded-stage bg-sand p-6 md:col-span-8 md:p-10">
            <ClearSpace />
          </div>
          <div className={`col-span-4 grid content-between gap-6 ${card}`}>
            <div className="grid gap-4">
              <p className="font-semibold">Smallest</p>
              <MinSize lockupPx={KIT.minSize.lockupPx} markPx={KIT.minSize.markPx} />
              <p className={small}>The logo {KIT.minSize.lockupPx} px tall on screen, {KIT.minSize.lockupMm} mm in print. Below that, use the icon.</p>
            </div>
            <ul className="grid list-disc gap-1 pl-5 text-sm">
              {NAME_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="col-span-4 grid gap-3 md:col-span-12">
            <p className="font-semibold">Never</p>
            <Misuse />
          </div>
        </Section>

        {/* The mark alone, and the icons devices use */}
        <Section aria-labelledby="mark-t" inner={`${grid} gap-y-6`}>
          <Head id="mark-t" title="Mark and icons" line="The curve alone, and the app icon." />
          {KIT.mark.map((v) => (
            <figure key={v.id} className="col-span-2 grid content-start gap-3 md:col-span-3">
              <div className="grid aspect-square place-items-center rounded-stage border border-line p-6" style={{ background: MARK_GROUND[v.id] }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={at(`mark/monte-mark-${v.id}.svg`)} alt={`The Monte mark, ${v.name.toLowerCase()}`} className="size-3/4" />
              </div>
              <figcaption>
                <p className="font-semibold">{v.name}</p>
                <p className={small}>{v.use}</p>
                <Files items={[["SVG", at(`mark/monte-mark-${v.id}.svg`)], ...KIT.markSizes.map((s) => [`${s}`, at(`mark/monte-mark-${v.id}-${s}.png`)] as [string, string])]} />
              </figcaption>
            </figure>
          ))}
          <div className={`col-span-4 grid gap-5 md:col-span-12 md:grid-cols-[auto_1fr] md:items-center ${card}`}>
            <div className="flex items-end gap-5">
              {[16, 32, 64, 120].map((s) => (
                <figure key={s} className="grid justify-items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s <= 32 ? at("app/favicon.svg") : at("app/icon-512.png")} alt="" width={s} height={s} className={s > 32 ? "rounded-inner" : undefined} />
                  <figcaption className="font-mono text-xs tabular-nums text-ink-muted">{s}</figcaption>
                </figure>
              ))}
            </div>
            <div className="grid gap-1">
              <p className="font-semibold">App icons</p>
              <p className={small}>The very files the site serves, byte for byte.</p>
              <Files
                items={[
                  ["favicon.svg", at("app/favicon.svg")],
                  ["favicon.ico", at("app/favicon.ico")],
                  ["Apple touch 180", at("app/apple-touch-icon.png")],
                  ["192", at("app/icon-192.png")],
                  ["512", at("app/icon-512.png")],
                  ["Maskable 512", at("app/icon-maskable-512.png")],
                  ["1024", at("app/icon-1024.png")],
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Banners and avatars, each sized for its platform's crop */}
        <Section aria-labelledby="social-t" inner={`${grid} gap-y-6`}>
          <Head id="social-t" title="Banners" line="The home page's board, sized for each platform's crop." />
          <div className="col-span-4 columns-1 gap-x-gutter md:col-span-12 md:columns-2">
            {wide.map((s) => (
              <Banner key={s.file} s={s} />
            ))}
          </div>
          <div className="col-span-4 columns-2 gap-x-gutter md:col-span-12 lg:columns-4">
            {tall.filter((s) => s.file !== "avatar-800").map((s) => (
              <Banner key={s.file} s={s} />
            ))}
          </div>
          <figure className="col-span-4 grid content-start gap-2 md:col-span-6">
            <div className="flex min-h-28 items-center rounded-inner border border-line bg-white p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={at("email/signature-logo@2x.png")} alt="" width={200} height={33} />
            </div>
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-medium">
                Email signature <span className="font-mono tabular-nums text-ink-muted">200 px at 2×</span>
              </span>
              <Files items={[["On white", at("email/signature-logo@2x.png")], ["Transparent", at("email/signature-logo@2x-transparent.png")]]} />
            </figcaption>
          </figure>
        </Section>

        {/* Colour */}
        <Section aria-labelledby="color-t" inner={`${grid} gap-y-6`}>
          <Head id="color-t" title="Colour" line={COLOR_RULE} />
          <ul className="col-span-4 grid gap-3 sm:grid-cols-2 md:col-span-12 lg:grid-cols-5">
            {COLORS.map((c) => (
              <li key={c.token} className="overflow-hidden rounded-card border border-line">
                <div className="grid h-28 grid-cols-2">
                  <span style={{ background: c.light }} />
                  <span style={{ background: c.dark }} />
                </div>
                <div className="grid gap-1 p-4">
                  <p className="font-semibold">{c.name}</p>
                  <p className={small}>{c.use}</p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] items-center gap-x-3">
                    <dt className={small}>Day</dt>
                    <dd>
                      <CopyValue value={oklchToHex(c.light)} label={`${c.name}, day`} />
                    </dd>
                    <dt className={small}>Night</dt>
                    <dd>
                      <CopyValue value={oklchToHex(c.dark)} label={`${c.name}, night`} />
                    </dd>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
          <p className={`col-span-4 max-w-measure md:col-span-12 ${small}`}>
            Press a value to copy it. Every colour with RGB, OKLCH, a CMYK approximation and the contrast of each pair:{" "}
            <a href={at("colors/colors.md")} className={textLink}>
              colors.md
            </a>
            ,{" "}
            <a href={at("colors/tokens.css")} download className={textLink}>
              tokens.css
            </a>
            ,{" "}
            <a href={at("colors/tokens.json")} download className={textLink}>
              tokens.json
            </a>
            , and the source the site is built from,{" "}
            <a href={at("colors/monte.tokens.json")} download className={textLink}>
              monte.tokens.json
            </a>
            .
          </p>
        </Section>

        {/* Type */}
        <Section aria-labelledby="type-t" inner={`${grid} gap-y-6`}>
          <Head id="type-t" title="Type" line="Three free Google fonts, each with one job." />
          <ul className="col-span-4 grid gap-3 md:col-span-12">
            {TYPE.map((t, i) => (
              <li key={t.face} className={`grid gap-3 md:grid-cols-[14rem_1fr] md:items-center ${card}`}>
                <div>
                  <p className={small}>{t.role}</p>
                  <a href={FONT_LINKS[t.face]} className={`font-semibold ${fileLink}`}>
                    {t.face}
                  </a>
                  <p className={small}>{t.use}</p>
                </div>
                <p className={i === 0 ? "font-display text-headline font-semibold leading-none" : i === 1 ? "text-lead" : "font-mono text-heading tabular-nums"}>{t.sample}</p>
              </li>
            ))}
          </ul>
          <p className={`col-span-4 md:col-span-12 ${small}`}>
            All three are free under the{" "}
            <a href={FONT_LICENSE.url} className={textLink}>
              {FONT_LICENSE.name}
            </a>
            , for web, apps and print.
          </p>
        </Section>

        {/* Voice: each principle with a line the site really uses */}
        <Section aria-labelledby="voice-t" inner={`${grid} gap-y-6`}>
          <Head id="voice-t" title="Voice" line={VOICE.register} />
          <ul className="col-span-4 grid gap-3 md:col-span-12">
            {VOICE.principles.map((v) => (
              <li key={v.k} className={`grid gap-3 md:grid-cols-[14rem_1fr_1fr] md:items-start ${card}`}>
                <div>
                  <p className="font-semibold">{v.k}</p>
                  <p className={small}>{v.v}</p>
                </div>
                <div className="flex gap-2.5">
                  <Check className="mt-1 size-4 flex-none text-clay" strokeWidth={3} aria-hidden />
                  <div>
                    <p className="font-medium">
                      <span className="sr-only">Monte says: </span>
                      {v.do}
                    </p>
                    <p className={small}>{v.where}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <X className="mt-1 size-4 flex-none text-ink-muted" strokeWidth={3} aria-hidden />
                  <p className="text-ink-muted">
                    <span className="sr-only">Never: </span>
                    <s className="decoration-line-strong">{v.dont}</s>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className={`col-span-4 grid gap-4 md:col-span-12 md:grid-cols-2 ${card}`}>
            <div>
              <p className="mb-2 font-semibold">Sounds like Monte</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                {VOICE.use.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold">Never</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-ink-muted">
                {VOICE.never.map((w) => (
                  <s key={w} className="decoration-line-strong">
                    {w}
                  </s>
                ))}
              </p>
            </div>
          </div>
        </Section>

        {/* Marks: every game and decision has its own drawing, and each one moves */}
        <Section aria-labelledby="marks-t" inner={`${grid} gap-y-6`}>
          <Head id="marks-t" title="Marks" line="A drawing for every game and decision. Each moves on hover or tap." />
          <ul className="col-span-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:col-span-12 lg:grid-cols-5">
            {[
              ...GAMES.map((g) => ({ file: g.slug, name: g.name, mark: <GameArt slug={g.slug} /> })),
              ...TOOLS.map((t) => ({ file: `decide-${t.id}`, name: t.question, mark: <ToolMark id={t.id} /> })),
            ].map((m) => (
              <li key={m.file}>
                <a href={`/brand/marks/${m.file}.svg`} download className="group grid h-full content-start gap-3 rounded-card border border-line p-3 transition-colors hover:border-ink">
                  <span className="grid aspect-[5/4] place-items-center rounded-inner bg-sand p-3 transition-colors group-hover:bg-sand-2">{m.mark}</span>
                  <span className="flex items-start justify-between gap-2 text-sm font-medium leading-snug">
                    {m.name}
                    <Download className="mt-0.5 size-4 shrink-0 text-ink-muted transition-colors group-hover:text-ink" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* Describe Monte */}
        <Section aria-labelledby="about-t" inner={`${grid} gap-y-6`} last>
          <Head id="about-t" title="Describe Monte" line="For a directory, an article or a profile." />
          {([
            ["One line", BOILERPLATE.tagline],
            ["The idea", IDEA.story],
            ["Short", BOILERPLATE.short],
            ["Long", BOILERPLATE.long],
          ] as const).map(([k, v]) => (
            <div key={k} className={`col-span-4 grid content-between gap-4 md:col-span-6 lg:col-span-3 ${card}`}>
              <div className="grid gap-2">
                <p className={small}>{k}</p>
                <p>{v}</p>
              </div>
              <div>
                <CopyText text={v} />
              </div>
            </div>
          ))}
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
