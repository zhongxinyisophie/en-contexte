"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCw, Check, Sparkles } from "lucide-react";
import { useLibrary } from "@/components/library-provider";
import { isDue } from "@/lib/scheduler";
export default function Review() {
  const { state, ready, rate } = useLibrary();
  const [queue, setQueue] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");
  const due = state.cards.filter((c) => isDue(c)).map((c) => c.entryId);
  const ids = queue ?? due;
  const entry = state.entries.find((e) => e.id === ids[index]);
  function rating(value: "again" | "understood") {
    if (!entry) return;
    try {
      if (!queue) setQueue(due);
      rate(entry.id, value);
      setIndex(index + 1);
      setFlipped(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="review-page">
      <div className="eyebrow">MÉMORISER · UN MOT À LA FOIS</div>
      <h1>Un instant pour retenir.</h1>
      <p className="intro">
        Retrouvez l’expression. Laissez le contexte vous guider.
      </p>
      {!ready ? (
        <p>Chargement de vos cartes…</p>
      ) : entry ? (
        <>
          <div className="review-progress">
            <span>
              CARTE {index + 1} / {ids.length}
            </span>
            <span>{ids.length - index} à retrouver</span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${(index / ids.length) * 100}%` }} />
          </div>
          <article className={`flashcard ${flipped ? "flipped" : ""}`}>
            <div className="card-meta">
              <span>
                {flipped ? "LE MOT EN CONTEXTE" : "À VOUS DE RETROUVER"}
              </span>
              <span>
                {entry.level} · {entry.register}
              </span>
            </div>
            <h2>{entry.expression}</h2>
            {flipped ? (
              <>
                <p className="definition">{entry.definition_fr}</p>
                <div className="chunk-block">
                  <span className="eyebrow">LE CHUNK À RETENIR</span>
                  <h3>{entry.main_chunk}</h3>
                </div>
                <p className="example">{entry.example_fr}</p>
                <span className="source-label">{entry.example_type}</span>
                {entry.definition_zh && (
                  <details>
                    <summary>Voir la traduction chinoise</summary>
                    <p>{entry.definition_zh}</p>
                  </details>
                )}
              </>
            ) : (
              <>
                <p className="context-hint">
                  {entry.example_fr.split(entry.main_chunk).length > 1
                    ? entry.example_fr.replace(entry.main_chunk, "[…]")
                    : `Contexte : ${entry.tags.join(", ") || "une expression en situation"}.`}
                </p>
                <p className="quiet">
                  Quel est le sens ? Quelle expression lui est associée ?
                </p>
              </>
            )}
            <button
              className="flip-button"
              onClick={() => setFlipped(!flipped)}
            >
              <RotateCw size={16} />
              {flipped ? "Revoir le recto" : "Retourner la carte"}
            </button>
          </article>
          {flipped ? (
            <div className="ratings">
              <button
                className="button secondary"
                onClick={() => rating("again")}
              >
                Pas encore
              </button>
              <button
                className="button primary"
                onClick={() => rating("understood")}
              >
                <Check size={17} /> J’ai compris
              </button>
            </div>
          ) : (
            <p className="review-tip">
              Prenez un instant, puis retournez la carte.
            </p>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Sparkles size={30} />
          <h2>
            {queue
              ? "C’est tout pour cette fois."
              : state.entries.length
                ? "Vous êtes à jour."
                : "Vos mots vous attendent."}
          </h2>
          <p>
            {queue
              ? `${index} carte${index > 1 ? "s" : ""} revue${index > 1 ? "s" : ""}. Un petit pas qui compte.`
              : state.entries.length
                ? "Revenez lorsque vos prochaines cartes seront prêtes."
                : "Ajoutez votre premier mot pour commencer une révision."}
          </p>
          <Link
            href={state.entries.length ? "/" : "/ajouter"}
            className="button primary"
          >
            {state.entries.length
              ? "Retour à aujourd’hui"
              : "Ajouter mon premier mot"}
            <ArrowRight size={16} />
          </Link>
          {queue && (
            <button
              className="text-button"
              onClick={() => {
                setQueue(null);
                setIndex(0);
                setFlipped(false);
              }}
            >
              Vérifier les cartes disponibles
            </button>
          )}
        </div>
      )}
      <div className="scheduler-note">
        <span className="pill">Prototype de révision</span>
        <p>
          « Pas encore » : dans 10 minutes. « J’ai compris » : dans 1 jour, puis
          intervalle doublé (30 jours maximum). Ce prototype n’utilise pas FSRS.
        </p>
      </div>
    </div>
  );
}
