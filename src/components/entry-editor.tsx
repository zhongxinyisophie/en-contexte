"use client";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useLibrary } from "./library-provider";
import type { VocabularyEntry } from "@/lib/types";
import Link from "next/link";
export function EntryEditor({
  entry,
  id,
  initialCollections = [],
}: {
  entry: VocabularyEntry;
  id?: string;
  initialCollections?: string[];
}) {
  const { state, saveEntry } = useLibrary();
  const [draft, setDraft] = useState(entry);
  const [collections, setCollections] = useState(initialCollections);
  const [editing, setEditing] = useState(!entry.definition_fr);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(id);
  function field(key: keyof VocabularyEntry, value: string) {
    setDraft({ ...draft, [key]: value });
    setSaved(false);
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (
      !draft.expression.trim() ||
      !draft.definition_fr.trim() ||
      !draft.main_chunk.trim() ||
      !draft.example_fr.trim()
    ) {
      setError("Complétez le mot, la définition, le chunk et l’exemple.");
      setEditing(true);
      return;
    }
    try {
      setSavedId(
        saveEntry(
          {
            ...draft,
            expression: draft.expression.trim(),
            definition_fr: draft.definition_fr.trim(),
            main_chunk: draft.main_chunk.trim(),
            example_fr: draft.example_fr.trim(),
          },
          collections,
          savedId,
        ),
      );
      setSaved(true);
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <form onSubmit={save} className="editor">
      <div className="editor-heading">
        <span className="eyebrow">
          {id ? "VOTRE FICHE" : "UN MOT · UN CHUNK · UN CONTEXTE"}
        </span>
        <button
          type="button"
          className="text-button"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Aperçu" : "Modifier la fiche"}
        </button>
      </div>
      {editing ? (
        <div className="edit-fields">
          <label>
            Mot ou expression
            <input
              required
              value={draft.expression}
              onChange={(e) => field("expression", e.target.value)}
            />
          </label>
          <label>
            Définition en français
            <textarea
              required
              value={draft.definition_fr}
              onChange={(e) => field("definition_fr", e.target.value)}
              rows={2}
            />
          </label>
          <label>
            Chunk principal
            <input
              required
              value={draft.main_chunk}
              onChange={(e) => field("main_chunk", e.target.value)}
            />
          </label>
          <label>
            Exemple en français
            <textarea
              required
              value={draft.example_fr}
              onChange={(e) => field("example_fr", e.target.value)}
              rows={3}
            />
          </label>
          <div className="field-pair">
            <label>
              Niveau
              <select
                value={draft.level}
                onChange={(e) => field("level", e.target.value)}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Registre
              <select
                value={draft.register}
                onChange={(e) => field("register", e.target.value)}
              >
                {["courant", "soutenu", "familier"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="entry-title">
            <h2>{draft.expression}</h2>
            <span className="pill">
              {draft.level} · {draft.register}
            </span>
          </div>
          <p className="definition">{draft.definition_fr}</p>
          <div className="chunk-block">
            <span className="eyebrow">LE CHUNK À RETENIR</span>
            <h3>{draft.main_chunk}</h3>
          </div>
          <p className="example">{draft.example_fr}</p>
        </>
      )}
      <span className="source-label">{draft.example_type}</span>
      <details>
        <summary>
          Traduction chinoise{" "}
          {draft.other_chunks.length > 0 ? "& autres associations" : ""}
        </summary>
        <label>
          中文释义（可选）
          <input
            value={draft.definition_zh ?? ""}
            onChange={(e) => field("definition_zh", e.target.value)}
          />
        </label>
        {draft.other_chunks.length > 0 && (
          <div className="other-chunks">
            {draft.other_chunks.map((c) => (
              <span key={c.id}>{c.text}</span>
            ))}
          </div>
        )}
      </details>
      <details>
        <summary>
          Ajouter à une liste{" "}
          {collections.length ? `(${collections.length})` : ""}
        </summary>
        {state.collections.length ? (
          state.collections.map((c) => (
            <label className="checkbox" key={c.id}>
              <input
                type="checkbox"
                checked={collections.includes(c.id)}
                onChange={(e) => {
                  setSaved(false);
                  setCollections(
                    e.target.checked
                      ? [...collections, c.id]
                      : collections.filter((i) => i !== c.id),
                  );
                }}
              />
              {c.name}
            </label>
          ))
        ) : (
          <p className="quiet">
            Créez vos listes dans <Link href="/mes-mots">Mes mots</Link>.
          </p>
        )}
      </details>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="save-row">
        <button type="submit" className="button primary" disabled={saved}>
          {saved ? (
            <>
              <Check size={17} /> Fiche enregistrée
            </>
          ) : savedId ? (
            "Enregistrer les modifications"
          ) : (
            "Enregistrer ce mot"
          )}
          {!saved && <ArrowRight size={16} />}
        </button>
        {saved && (
          <Link href="/mes-mots" className="text-button">
            Voir mes mots →
          </Link>
        )}
      </div>
    </form>
  );
}
