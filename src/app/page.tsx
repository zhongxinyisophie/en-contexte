"use client";
import Link from "next/link";
import { ArrowRight, Plus, ArrowUpRight } from "lucide-react";
import { useLibrary } from "@/components/library-provider";
import { isDue } from "@/lib/scheduler";
export default function Home() {
  const { state, ready } = useLibrary();
  const due = state.cards.filter((c) => isDue(c)).length;
  const fresh = state.cards.filter((c) => c.repetitions === 0).length;
  return (
    <div className="home">
      <div className="eyebrow">
        <span className="tiny-dot" /> VOTRE RENDEZ-VOUS AVEC LE FRANÇAIS
      </div>
      <h1>
        Les mots prennent vie
        <br />
        dans leur <em>contexte.</em>
      </h1>
      <p className="intro">
        Un mot à la fois. Une expression qui reste.
        <br />
        Quelques minutes pour enrichir votre français.
      </p>
      <section className="today-panel">
        <div className="panel-top">
          <span className="eyebrow">AUJOURD’HUI</span>
          <span className="quiet">À votre rythme</span>
        </div>
        <div className="today-content">
          <div className="counts">
            <div>
              <strong>{ready ? due : "—"}</strong>
              <span>mots à réviser</span>
            </div>
            <div>
              <strong>{ready ? fresh : "—"}</strong>
              <span>
                nouveaux mots <small>inclus dans la révision</small>
              </span>
            </div>
          </div>
          <Link href="/reviser" className="button primary">
            Commencer ma révision <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <Link href="/ajouter" className="add-callout">
        <span className="plus-circle">
          <Plus size={21} />
        </span>
        <span>
          <strong>Un mot vous a interpellé ?</strong>
          <span>Ajoutez-le, avec le contexte qui lui donne du sens.</span>
        </span>
        <ArrowUpRight size={21} />
      </Link>
      <section className="recent">
        <div className="section-heading">
          <h2>Vos derniers mots</h2>
          <Link href="/mes-mots">
            Voir ma bibliothèque <ArrowRight size={15} />
          </Link>
        </div>
        {!ready ? (
          <p className="quiet">Chargement de votre bibliothèque…</p>
        ) : state.entries.length ? (
          <div className="recent-grid">
            {state.entries.slice(0, 3).map((e) => (
              <Link
                className="word-tile"
                key={e.id}
                href={`/ajouter?id=${e.id}`}
              >
                <span className="tile-level">
                  {e.level} · {e.register}
                </span>
                <h3>{e.expression}</h3>
                <p>{e.main_chunk}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            <p>Votre premier mot commence ici.</p>
            <span>
              Rencontrez un mot, gardez son expression, retrouvez-le demain.
            </span>
            <Link href="/ajouter">
              Ajouter mon premier mot <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
      <div className="home-note">
        <span>01 / REPÉRER</span>
        <span>02 / MÉMORISER</span>
        <span className="quiet">03 / RÉEMPLOYER · BIENTÔT</span>
      </div>
    </div>
  );
}
