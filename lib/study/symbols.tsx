import * as React from "react";

// Statistics letters with a combining bar or hat (x̄, ȳ, p̂) sit wrong in most text fonts: the
// mark drifts onto the next character. These helpers draw the bar and the hat with CSS instead
// (classes in app/study/study.css) and tell screen readers "x bar" and "p hat".

const MARK = /([A-Za-zμσ])([̄̂])/g;
const has = (s: string) => /[̄̂]/.test(s);

/** Plain text with x̄ and p̂ drawn properly. Returns the string unchanged when there is nothing to fix. */
export function sym(text: string): React.ReactNode {
  if (!has(text)) return text;
  const out: React.ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(MARK)) {
    out.push(text.slice(last, m.index));
    out.push(
      m[2] === "̄" ? (
        <span key={i++} className="sym-bar">
          {m[1]}
          <span className="sr-only"> bar</span>
        </span>
      ) : (
        <span key={i++} className="sym-hat">
          {m[1]}
          <span aria-hidden="true" className="sym-hat-mark">
            ˆ
          </span>
          <span className="sr-only"> hat</span>
        </span>
      ),
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

/** The same for trusted content HTML. */
export function symHtml(html: string) {
  if (!has(html)) return html;
  return html.replace(MARK, (_, c: string, mark: string) =>
    mark === "̄"
      ? `<span class="sym-bar">${c}<span class="sr-only"> bar</span></span>`
      : `<span class="sym-hat">${c}<span aria-hidden="true" class="sym-hat-mark">ˆ</span><span class="sr-only"> hat</span></span>`,
  );
}
