import raw from "./data.json";

// Types for the study content. JSON imports widen tuples to arrays, so the shapes are stated here
// once and the file is asserted through them. scripts/check-data.mjs checks the file against them.

/** A string with a little trusted inline HTML in it (<mark>, <b>, <sup>). Rendered by <Html>. */
export type HtmlString = string;

export type LabId = "bell" | "cc" | "coin" | "dice" | "port" | "binom" | "pois" | "z" | "clt" | "ci" | "every" | "test" | "reg";

export type TopicId =
  | "data" | "center" | "spread" | "prob" | "rv" | "two" | "count"
  | "poisson" | "normal" | "clt" | "ci" | "test" | "reg" | "mreg";

export type StudyTopic = {
  id: TopicId;
  n: number;
  name: string;
  short: string;
  line: HtmlString;
  ex: { tag: string; text: HtmlString };
  /** Question, answer, why (all three may hold inline HTML). */
  qa: [q: HtmlString, a: HtmlString, why: HtmlString][];
  trap: HtmlString;
  hook: string;
  /** Title, URL, description. */
  links: [title: string, url: string, about: string][];
  labs: LabId[];
  /** Name, formula. */
  formulas: [name: string, formula: string][];
  why?: { click: string; care: string; uses: [field: string, use: string][] };
  keywords?: string;
};

/** Name, formula, worked example, optional alias. */
export type SheetRow = [name: string, formula: string, example: string, alias?: string];
/** Name, label, the hook itself, what it stands for. */
export type Hook = [name: string, label: string, hook: string, expands: string];
/** Term, topic id, meaning, example. */
export type Term = [term: string, topic: TopicId, meaning: string, example: string];
export type Tool = {
  id: string;
  name: string;
  blurb: string;
  intro: string;
  /** Task, code, optional note. */
  rows: [task: string, code: string, note?: string][];
  download?: [label: string, href: string];
};
/** Category, title, why it is worth it, URL, date checked. */
export type Source = [cat: string, title: string, why: string, url: string, checked: string];

type Range = { min: number; max: number; step: number; init: number; unit: string };
export type Labs = {
  bell: Range & { title: string; sub: string; m: number; s: number };
  cc: Omit<Range, "step"> & { title: string; sub: string; center: number; sdLimit: number };
  diceGiven: string;
  port: { e1: number; s1: number; e2: number; s2: number; rho: number; w: number; ymax: number; name1: string; name2: string };
  binom: { n: number; p: number };
  pois: { l: number };
  z: { m: number; s: number; x: number; mMax: number; sMax: number; xMax: number };
  reg: { title: string; pts: [number, number][]; prefix: string; x: number; y: number };
  every: { title: string; sub: string; vals: number[] };
  test: { title: string; sub: string; mu: number; s: number };
};

/** Numbers the drill generators draw from. */
export type DrillNumbers = {
  dataQs: [q: string, a: string | string[], why: string][];
  tree: { a: string; b: string; na: string; bShort: string; given: string };
  comp: { what: string; one: string };
  normalMu: number[]; normalSd: number[];
  cltMu: number[]; cltSd: number[]; cltItem: string;
  ciZ: { xb: number[]; s: number[] };
  ciT: { xb: number[]; s: number[] };
  ciP: { nn: number[]; verb: string };
  ciN: { sig: number[]; E: number[] };
  ciNp2: number[];
  regB0: number[]; regB1: number[]; regSsr: number[]; regSse: number[]; regTb: number[]; regTse: number[];
  mregVif: number[]; mregMsr: number[]; mregMse: number[]; mregSse: number[]; mregSst: number[]; mregN: number[];
};

export type MathCopy = {
  meangapEx: string; zdistEx: string; zdistMu: number[]; powEx: string; seEx: string;
  seSg: [number[], number[], number[]];
};

export type StudyData = {
  version: string;
  topics: StudyTopic[];
  sheet: Record<TopicId, SheetRow[]>;
  hooks: Hook[];
  K: DrillNumbers;
  math: MathCopy;
  labs: Labs;
  fw: { intro: string; orEx: string; loop: string };
  copy: { heroSub: string; drillIntro: string; mockSaved: string; sheetIntro: string; search: string; trapHead: string };
  tools: Tool[];
  sources: { note: string; cats: string[]; list: Source[] };
  terms: Term[];
};

export const DATA = raw as unknown as StudyData;
export const TOPICS = DATA.topics;
export const TOPIC_IDS = TOPICS.map((t) => t.id);
const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));
export const topicById = (id: string) => BY_ID.get(id as TopicId);
export const isTopicId = (id: unknown): id is TopicId => typeof id === "string" && BY_ID.has(id as TopicId);
export const TOOLS = DATA.tools;
export const toolById = (id: string) => TOOLS.find((t) => t.id === id);
