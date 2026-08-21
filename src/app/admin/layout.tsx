import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Pro — BOKOVI",
  description: "Espace professionnel de gestion du site BOKOVI — statistiques, événements, médias.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}