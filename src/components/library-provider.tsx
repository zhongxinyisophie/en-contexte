"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { emptyState, parseState, STORAGE_KEY } from "@/lib/storage";
import { prototypeScheduler } from "@/lib/scheduler";
import { normalize } from "@/lib/demo";
import type {
  LibraryState,
  PersonalEntry,
  ReviewResult,
  VocabularyEntry,
} from "@/lib/types";
interface LibraryContext {
  state: LibraryState;
  ready: boolean;
  error: string;
  saveEntry: (
    entry: VocabularyEntry,
    collections: string[],
    id?: string,
  ) => string;
  deleteEntry: (id: string) => void;
  addCollection: (name: string) => string;
  rate: (entryId: string, rating: ReviewResult["rating"]) => void;
}
const Context = createContext<LibraryContext | null>(null);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(emptyState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  // Hydrate browser-only persistence after SSR; the initial server/client render must match.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(parseState(localStorage.getItem(STORAGE_KEY)));
    } catch {
      setError(
        "Impossible de lire vos données. Elles sont conservées : vérifiez le stockage du navigateur avant de continuer.",
      );
    }
    setReady(true);
  }, []);
  function commit(next: LibraryState) {
    try {
      if (error)
        throw new Error(
          "Le stockage est indisponible. Rechargez la page après avoir vérifié vos données.",
        );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Impossible d’enregistrer.";
      setError(message);
      throw new Error(message);
    }
  }
  function saveEntry(
    entry: VocabularyEntry,
    collectionIds: string[],
    id?: string,
  ) {
    const duplicate = state.entries.find(
      (e) =>
        normalize(e.expression) === normalize(entry.expression) && e.id !== id,
    );
    if (duplicate)
      throw new Error(
        "Ce mot existe déjà dans votre bibliothèque. Vous pouvez le modifier dans Mes mots.",
      );
    const now = new Date().toISOString();
    const entryId = id ?? crypto.randomUUID();
    const old = state.entries.find((e) => e.id === id);
    const personal: PersonalEntry = {
      ...entry,
      id: entryId,
      collectionIds,
      createdAt: old?.createdAt ?? now,
      updatedAt: now,
    };
    commit({
      ...state,
      entries: old
        ? state.entries.map((e) => (e.id === id ? personal : e))
        : [personal, ...state.entries],
      cards: old
        ? state.cards
        : [
            ...state.cards,
            {
              id: crypto.randomUUID(),
              entryId,
              dueAt: now,
              repetitions: 0,
              intervalDays: 0,
            },
          ],
    });
    return entryId;
  }
  function deleteEntry(id: string) {
    commit({
      ...state,
      entries: state.entries.filter((e) => e.id !== id),
      cards: state.cards.filter((c) => c.entryId !== id),
      results: state.results.filter((r) => r.entryId !== id),
    });
  }
  function addCollection(name: string) {
    const clean = name.trim();
    if (!clean) throw new Error("Donnez un nom à votre liste.");
    if (state.collections.some((c) => normalize(c.name) === normalize(clean)))
      throw new Error("Cette liste existe déjà.");
    const id = crypto.randomUUID();
    commit({
      ...state,
      collections: [...state.collections, { id, name: clean }],
    });
    return id;
  }
  function rate(entryId: string, rating: ReviewResult["rating"]) {
    const card = state.cards.find((c) => c.entryId === entryId);
    if (!card) return;
    const now = new Date();
    const next = prototypeScheduler.schedule(card, rating, now);
    commit({
      ...state,
      cards: state.cards.map((c) => (c.id === card.id ? next : c)),
      results: [
        ...state.results,
        {
          id: crypto.randomUUID(),
          cardId: card.id,
          entryId,
          rating,
          reviewedAt: now.toISOString(),
          nextDueAt: next.dueAt,
          scheduler: "prototype-v1",
        },
      ],
    });
  }
  return (
    <Context.Provider
      value={{
        state,
        ready,
        error,
        saveEntry,
        deleteEntry,
        addCollection,
        rate,
      }}
    >
      {error && (
        <div role="alert" className="storage-error">
          {error}
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useLibrary() {
  const value = useContext(Context);
  if (!value) throw new Error("LibraryProvider missing");
  return value;
}
