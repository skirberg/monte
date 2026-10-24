import { TOPICS, type StudyTopic, type TopicId } from "./data";
import { stripTags } from "./math";

/** Lowercase, and spell out the symbols people type as words (x bar, mu, sigma). */
export const norm = (s: string) =>
  String(s).toLowerCase().replace(/x̄|x-bar|xbar/g, "x bar").replace(/μ/g, "mu").replace(/σ/g, "sigma").replace(/\s+/g, " ");

const topicText = (t: StudyTopic) =>
  [t.keywords ?? "", t.name, stripTags(t.line), t.ex.text, t.qa.map((q) => q.join(" ")).join(" "), stripTags(t.trap), t.hook, t.formulas.map((f) => f.join(" ")).join(" ")].join(" ");

const TEXT = new Map<TopicId, string>(TOPICS.map((t) => [t.id, norm(topicText(t))]));
/** True when a topic's text (keywords, lesson, quiz, formulas) contains the search. */
export const topicMatches = (id: TopicId, query: string) => !query || (TEXT.get(id) ?? "").includes(norm(query.trim()));
