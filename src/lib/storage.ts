import type { LibraryState } from "./types";
export const STORAGE_KEY = "en-contexte:library:v1";
export const emptyState = (): LibraryState => ({
  version: 1,
  entries: [],
  collections: [],
  cards: [],
  results: [],
});
export function parseState(raw: string | null): LibraryState {
  if (!raw) return emptyState();
  const s = JSON.parse(raw) as LibraryState;
  if (
    s.version !== 1 ||
    !Array.isArray(s.entries) ||
    !Array.isArray(s.collections) ||
    !Array.isArray(s.cards) ||
    !Array.isArray(s.results)
  )
    throw new Error("Format de données non reconnu.");
  if (
    !s.entries.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.expression === "string" &&
        typeof e.definition_fr === "string" &&
        typeof e.main_chunk === "string" &&
        typeof e.example_fr === "string" &&
        typeof e.level === "string" &&
        typeof e.register === "string" &&
        ["Exemple pédagogique", "Exemple personnel"].includes(e.example_type) &&
        Array.isArray(e.tags) &&
        e.tags.every((t) => typeof t === "string") &&
        Array.isArray(e.collectionIds) &&
        e.collectionIds.every((id) => typeof id === "string") &&
        Array.isArray(e.other_chunks) &&
        e.other_chunks.every(
          (c) => c && typeof c.id === "string" && typeof c.text === "string",
        ) &&
        Number.isFinite(Date.parse(e.createdAt)) &&
        Number.isFinite(Date.parse(e.updatedAt)),
    ) ||
    !s.collections.every(
      (c) => c && typeof c.id === "string" && typeof c.name === "string",
    ) ||
    !s.cards.every(
      (c) =>
        c &&
        typeof c.id === "string" &&
        typeof c.entryId === "string" &&
        Number.isFinite(Date.parse(c.dueAt)) &&
        Number.isInteger(c.repetitions) &&
        c.repetitions >= 0 &&
        Number.isFinite(c.intervalDays) &&
        c.intervalDays >= 0,
    ) ||
    !s.results.every(
      (r) =>
        r &&
        typeof r.id === "string" &&
        typeof r.entryId === "string" &&
        typeof r.cardId === "string" &&
        ["again", "understood"].includes(r.rating) &&
        r.scheduler === "prototype-v1" &&
        Number.isFinite(Date.parse(r.reviewedAt)) &&
        Number.isFinite(Date.parse(r.nextDueAt)),
    )
  )
    throw new Error("Données incomplètes.");
  const entryIds = new Set(s.entries.map((e) => e.id));
  const collectionIds = new Set(s.collections.map((c) => c.id));
  if (
    entryIds.size !== s.entries.length ||
    collectionIds.size !== s.collections.length ||
    s.cards.length !== s.entries.length ||
    new Set(s.cards.map((c) => c.entryId)).size !== s.cards.length ||
    s.cards.some((c) => !entryIds.has(c.entryId)) ||
    s.entries.some((e) => e.collectionIds.some((id) => !collectionIds.has(id)))
  )
    throw new Error("Références de données incohérentes.");
  return s;
}
