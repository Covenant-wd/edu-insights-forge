export const ARCHIVE_CATEGORIES = [
  { key: "lesson-notes", label: "Lesson Notes", blurb: "Termly subject lesson notes, ready to print." },
  { key: "scheme-of-work", label: "Scheme of Work", blurb: "Week-by-week curriculum breakdowns." },
  { key: "exam-series", label: "Exam Series", blurb: "Past questions, CBT practice and marking guides." },
  { key: "ai-prompts", label: "AI Formats & Prompts", blurb: "Prompt templates teachers can copy and use." },
  { key: "ai-class", label: "AI Class for Teachers", blurb: "Guides on running an AI-assisted classroom." },
] as const;

export type ArchiveCategoryKey = (typeof ARCHIVE_CATEGORIES)[number]["key"];

export function archiveCategoryLabel(key: string) {
  return ARCHIVE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
