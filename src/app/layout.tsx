import type { Metadata } from "next";
import "./globals.css";
import { LibraryProvider } from "@/components/library-provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "En contexte — Le français, en situation",
  description: "Apprenez le français par les mots, les chunks et le contexte.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <LibraryProvider>
          <Shell>{children}</Shell>
        </LibraryProvider>
      </body>
    </html>
  );
}
