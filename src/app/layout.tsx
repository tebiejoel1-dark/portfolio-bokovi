import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "BOKOVI A.V. Ange — Photographe & Vidéaste | Licht-Frame",
  description:
    "Portfolio officiel de BOKOVI A.V. Ange — Photographe & Créateur de contenu. Studio Licht-Frame, Lomé, Togo. Couverture événementielle, shooting portrait, cinématographie. Official portfolio of BOKOVI A.V. Ange — Photographer & Content Creator.",
  keywords: [
    "BOKOVI",
    "photographe",
    "vidéaste",
    "Lomé",
    "Togo",
    "Licht-Frame",
    "miss togo",
    "couverture événementielle",
    "photographer",
    "content creator",
    "Afrique",
    "portrait",
    "shooting",
  ],
  openGraph: {
    title: "BOKOVI A.V. Ange — Photographe & Vidéaste",
    description:
      "Portfolio officiel — Studio Licht-Frame, Lomé, Togo. Photographe & Créateur de contenu.",
    type: "website",
    images: [{ url: "/media/kara/PV3A7454.JPG.jpg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${syne.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}