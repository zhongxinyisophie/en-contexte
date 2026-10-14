export interface Chunk {
  id: string;
  text: string;
}
export interface Example {
  text: string;
  type: "Exemple pédagogique" | "Exemple personnel";
  sourceUrl?: string;
}
export interface VocabularyEntry {
  id: string;
  expression: string;
  definition_fr: string;
  definition_zh?: string;
  main_chunk: string;
  example_fr: string;
  example_type: Example["type"];
  level: string;
  register: string;
  tags: string[];
  other_chunks: Chunk[];
}
export interface PersonalEntry extends VocabularyEntry {
  collectionIds: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Collection {
  id: string;
  name: string;
}
export interface ReviewCard {
  id: string;
  entryId: string;
  dueAt: string;
  repetitions: number;
  intervalDays: number;
}
export interface ReviewResult {
  id: string;
  cardId: string;
  entryId: string;
  rating: "again" | "understood";
  reviewedAt: string;
  nextDueAt: string;
  scheduler: "prototype-v1";
}
export interface LibraryState {
  version: 1;
  entries: PersonalEntry[];
  collections: Collection[];
  cards: ReviewCard[];
  results: ReviewResult[];
}
export interface RecommendationProvider {
  recommend(expression: string): Promise<VocabularyEntry | null>;
}
export interface CorpusProvider {
  search(expression: string): Promise<Example[]>;
}
export interface LibraryRepository {
  load(): Promise<LibraryState>;
  save(state: LibraryState): Promise<void>;
}
export interface VocabularyImporter {
  parse(input: string): Promise<VocabularyEntry[]>;
}
