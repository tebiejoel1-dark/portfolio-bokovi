"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LayoutDashboard } from "lucide-react";
import { ADMIN_CODE } from "@/lib/content";
import { scrollTo } from "@/lib/gsap";

type Lang = "fr" | "en";

const LINKS: Record<Lang, { label: string; target: string }[]> = {
  fr: [
    { label: "Accueil", target: "hero" },
    { label: "À propos", target: "about" },
    { label: "Travaux", target: "works" },
    { label: "Services", target: "services" },
    { label: "Contact", target: "contact" },
  ],
  en: [
    { label: "Home", target: "hero" },
    { label: "About", target: "about" },
    { label: "Works", target: "works" },
    { label: "Services", target: "services" },
    { label: "Contact", target: "contact" },
  ],
};

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [lang, setLang] = useState<Lang>("fr");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 60);
  }, [searchOpen]);

  // Expose lang globally so other components can use it
  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.dispatchEvent(new CustomEvent("lang-change", { detail: lang }));
  }, [lang]);

  const submit = () => {
    if (query.trim() === ADMIN_CODE) {
      router.push("/admin");
      setQuery("");
      setSearchOpen(false);
    } else if (query.trim().length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const go = (target: string) => {
    setOpen(false);
    setSearchOpen(false);
    setTimeout(() => scrollTo(target === "hero" ? 0 : `#${target}`), 50);
  };

  const links = LINKS[lang];
  const placeholder = lang === "fr"
    ? "Rechercher un projet, un événement…"
    : "Search a project, an event…";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-700 ${
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border-b border-white/[0.06] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <button
            id="nav-logo"
            onClick={() => go("hero")}
            className="font-display text-xl font-extrabold tracking-tight"
          >
            BOKOVI<span className="text-accent">.</span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <button
                key={l.target}
                id={`nav-link-${l.target}`}
                onClick={() => go(l.target)}
                className="group relative text-sm font-medium text-dim transition-colors duration-300 hover:text-foreground"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              id="nav-lang-toggle"
              onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
              className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-dim transition-colors hover:border-accent/50 hover:text-accent"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>

            {/* Search */}
            <button
              id="nav-search"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={lang === "fr" ? "Rechercher" : "Search"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-dim transition-colors hover:border-accent/50 hover:text-foreground"
            >
              {searchOpen ? <X size={15} /> : <Search size={15} />}
            </button>

            {/* Dashboard */}
            <button
              id="nav-dashboard"
              onClick={() => router.push("/admin")}
              aria-label="Dashboard Pro"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-dim transition-colors hover:border-accent/50 hover:text-accent sm:flex"
            >
              <LayoutDashboard size={15} />
            </button>

            {/* Hamburger */}
            <button
              id="nav-hamburger"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-white/10 text-foreground lg:hidden"
            >
              <span
                className={`block h-px w-4 bg-current origin-center transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`}
              />
              <span
                className={`block h-px w-4 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px w-4 bg-current origin-center transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
              />
            </button>
          </div>
        </nav>

        {/* Search bar */}
        {searchOpen && (
          <div className="mx-auto mt-3 max-w-7xl px-5 sm:px-8">
            <div
              className={`glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 ${shake ? "" : ""}`}
              style={shake ? { animation: "shake 0.4s" } : undefined}
            >
              <Search size={17} className="shrink-0 text-dim" />
              <input
                ref={inputRef}
                id="nav-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-dim"
              />
              <button
                id="nav-search-submit"
                onClick={submit}
                className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105"
              >
                OK
              </button>
            </div>
            <p className="mt-2 text-[11px] text-dim">
              {lang === "fr"
                ? <>Conseil : saisis <span className="text-accent">{ADMIN_CODE}</span> pour ouvrir le dashboard pro.</>
                : <>Tip: type <span className="text-accent">{ADMIN_CODE}</span> to open the pro dashboard.</>
              }
            </p>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[55] flex flex-col justify-center bg-black/96 px-8 backdrop-blur-2xl transition-all duration-500 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1">
          {links.map((l, i) => (
            <button
              key={l.target}
              id={`mobile-nav-${l.target}`}
              onClick={() => go(l.target)}
              className="group flex items-center gap-5 border-b border-white/5 py-4 text-left"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="font-display text-sm text-accent/70">0{i + 1}</span>
              <span className="font-display text-4xl font-extrabold text-foreground transition-colors group-hover:text-accent">
                {l.label}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-dim">
            Licht-Frame · Lomé, Togo
          </div>
          <button
            id="mobile-lang-toggle"
            onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-dim hover:text-accent"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>
      </div>
    </>
  );
}