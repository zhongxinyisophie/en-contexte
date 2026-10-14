"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useLibrary } from "@/components/library-provider";
import { normalize } from "@/lib/demo";
export default function Words() {
  const { state, ready, addCollection, deleteEntry } = useLibrary();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [name, setName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [error, setError] = useState("");
  const entries = state.entries.filter(
    (e) =>
      (!filter || e.collectionIds.includes(filter)) &&
      normalize(`${e.expression} ${e.main_chunk}`).includes(normalize(search)),
  );
  return (
    <div className="page-wide">
      <div className="eyebrow">VOTRE BIBLIOTHÈQUE PERSONNELLE</div>
      <div className="title-row">
        <div>
          <h1>Les mots qui restent.</h1>
          <p className="intro">
            {state.entries.length} mot{state.entries.length !== 1 ? "s" : ""} à
            retrouver, à revoir, à réutiliser.
          </p>
        </div>
        <Link href="/ajouter" className="button primary">
          <Plus size={17} /> Ajouter un mot
        </Link>
      </div>
      <div className="library-tools">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Rechercher dans mes mots"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un mot ou un chunk…"
          />
        </label>
        <button
          className="button secondary"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus size={16} /> Créer une liste
        </button>
      </div>
      {showCreate && (
        <form
          className="collection-form"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const id = addCollection(name);
              setFilter(id);
              setName("");
              setShowCreate(false);
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <label>
            Nom de la liste
            <input
              autoFocus
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Lectures & idées"
            />
          </label>
          <button className="button primary">Créer</button>
        </form>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="filter-tabs" aria-label="Filtrer par liste">
        <button
          className={!filter ? "selected" : ""}
          onClick={() => setFilter("")}
        >
          Tous les mots <span>{state.entries.length}</span>
        </button>
        {state.collections.map((c) => (
          <button
            className={filter === c.id ? "selected" : ""}
            key={c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.name}{" "}
            <span>
              {
                state.entries.filter((e) => e.collectionIds.includes(c.id))
                  .length
              }
            </span>
          </button>
        ))}
      </div>
      {!ready ? (
        <p>Chargement…</p>
      ) : entries.length ? (
        <div className="word-list">
          {entries.map((e) => (
            <article key={e.id} className="library-word">
              <div>
                <span className="tile-level">
                  {e.level} · {e.register}
                </span>
                <h2>{e.expression}</h2>
                <p className="library-chunk">{e.main_chunk}</p>
                <p className="quiet">{e.definition_fr}</p>
                {e.collectionIds.length > 0 && (
                  <div className="tags">
                    {e.collectionIds.map((id) => (
                      <span key={id}>
                        {state.collections.find((c) => c.id === id)?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="word-actions">
                <Link
                  href={`/ajouter?id=${e.id}`}
                  aria-label={`Modifier ${e.expression}`}
                >
                  <Pencil size={17} />
                </Link>
                <button
                  aria-label={`Supprimer ${e.expression}`}
                  onClick={() => setRemove(e.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              {remove === e.id && (
                <div className="delete-confirm">
                  <p>
                    Supprimer « {e.expression} » et son historique de révision ?
                  </p>
                  <button
                    className="button danger"
                    onClick={() => {
                      try {
                        deleteEntry(e.id);
                        setRemove(null);
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Supprimer
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setRemove(null)}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="editorial-number">Aa</span>
          <h2>
            {search
              ? "Aucun mot trouvé."
              : filter
                ? "Cette liste attend ses premiers mots."
                : "Un premier mot, et tout commence."}
          </h2>
          <p>
            {search
              ? "Essayez un autre mot ou une autre expression."
              : filter
                ? "Lors de l’ajout ou de la modification d’une fiche, choisissez cette liste."
                : "Ajoutez un mot rencontré dans une lecture ou une conversation."}
          </p>
          <Link href="/ajouter" className="button primary">
            Ajouter un mot <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
