import type { StudyTopic } from "@/lib/study/data";
import { stripTags } from "@/lib/study/math";

/** What Listen reads: the lesson in order, with symbols spelled out for the speech engine. */
export function speechText(t: StudyTopic) {
  const w = t.why;
  return `${t.name}. ${stripTags(t.line)} ${w ? `${w.click} ${w.care} ` : ""}For example: ${stripTags(t.ex.text)} The trap: ${stripTags(t.trap)} Remember it: ${t.hook}`
    .replace(/x̄/g, "x bar").replace(/p̂/g, "p hat").replace(/μ₀/g, "mu zero").replace(/μ/g, "mu").replace(/σ²/g, "sigma squared")
    .replace(/σ/g, "sigma").replace(/√/g, "root ").replace(/H₀/g, "H zero").replace(/H₁/g, "H one").replace(/≥/g, " at least ")
    .replace(/≤/g, " at most ").replace(/−/g, " minus ").replace(/×/g, " times ").replace(/λ/g, "lambda").replace(/α/g, "alpha")
    .replace(/β/g, "beta").replace(/Φ/g, "phi").replace(/\s+/g, " ");
}

