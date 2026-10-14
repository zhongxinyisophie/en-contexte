"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { demoEntries, findDemo } from "@/lib/demo";
import { useLibrary } from "@/components/library-provider";
import { EntryEditor } from "@/components/entry-editor";
import type { VocabularyEntry } from "@/lib/types";
export default function AddPage() {
  return (
    <Suspense fallback={<p>Chargement…</p>}>
      <AddContent />
    </Suspense>
  );
}
function AddContent() {
  const { state, ready } = useLibrary();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [chosen, setEntry] = useState<VocabularyEntry | null>(null);
  const [revision, setRevision] = useState(0);
  const [manual, setManual] = useState(false);
  const [searching, setSearching] = useState(false);
  const editId = searching ? undefined : (params.get("id") ?? undefined);
  const personal = state.entries.find((e) => e.id === editId);
  const entry = personal ?? chosen;
  const collections = personal?.collectionIds ?? [];
  function lookup(value: string) {
    const found = findDemo(value);
    setSearching(true);
    setManual(!found);
    setEntry(
      found ?? {
        id: "",
        expression: value.trim(),
        definition_fr: "",
        definition_zh: "",
        main_chunk: "",
        example_fr: "",
        example_type: "Exemple personnel",
        level: "B2",
        register: "courant",
        tags: [],
        other_chunks: [],
      },
    );
    setRevision((r) => r + 1);
  }
  return (
    <div className="page-narrow">
      <div className="eyebrow">REPÉRER · GARDER UNE TRACE</div>
      <h1>
        {editId ? "Un mot, à votre façon." : "Quel mot vous accompagne ?"}
      </h1>
      <p className="intro">
        Gardez une expression utile, pas seulement une traduction.
      </p>
      <div className="demo-notice">
        <span className="tiny-dot" />
        <p>
          Version de démonstration · 20 fiches pré-écrites.
          <br />
          <span>Aucune IA ni recherche de corpus n’est connectée.</span>
        </p>
      </div>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) lookup(query);
        }}
      >
        <Search size={19} />
        <input
          aria-label="Mot ou expression à ajouter"
          placeholder="Un mot ou une expression…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          maxLength={200}
        />
        <button className="button primary" disabled={!ready}>
          Rechercher
        </button>
      </form>
      {!entry && (
        <div className="suggestions">
          <span className="quiet">Pour essayer</span>
          {["enjeu", "avoir beau", "prendre du recul"].map((w) => (
            <button
              key={w}
              onClick={() => {
                setQuery(w);
                lookup(w);
              }}
            >
              {w} ↗
            </button>
          ))}
        </div>
      )}
      {manual && entry && (
        <p className="manual-note">
          Ce mot ne figure pas dans les {demoEntries.length} fiches de
          démonstration. Complétez votre propre fiche ci-dessous.
        </p>
      )}
      {entry && (
        <EntryEditor
          key={`${editId ?? entry.expression}-${revision}`}
          entry={entry}
          id={editId}
          initialCollections={collections}
        />
      )}{" "}
      {!entry && (
        <div className="add-explanation">
          <span className="editorial-number">Aa</span>
          <h2>
            Moins à apprendre.
            <br />
            Plus à retenir.
          </h2>
          <p>
            Une définition courte, un chunk utile, une phrase naturelle. Le
            reste se découvre quand vous en avez besoin.
          </p>
        </div>
      )}
    </div>
  );
}
