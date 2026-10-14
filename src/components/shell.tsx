"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Layers, Plus, Sun } from "lucide-react";
const links = [
  ["/", "Aujourd’hui", Sun],
  ["/ajouter", "Ajouter", Plus],
  ["/reviser", "Réviser", Layers],
  ["/mes-mots", "Mes mots", BookOpen],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <>
      <header className="header">
        <Link className="brand" href="/">
          en contexte<span className="brand-dot">.</span>
        </Link>
        <span className="edition">LE FRANÇAIS, EN SITUATION</span>
        <nav aria-label="Navigation principale">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "nav-link active" : "nav-link"}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span>Un mot. Un chunk. Un contexte.</span>
        <span>
          Une petite habitude, un français plus vivant.{" "}
          <ArrowUpRight size={13} />
        </span>
      </footer>
    </>
  );
}
