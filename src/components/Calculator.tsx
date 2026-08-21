"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Video,
  Sparkles,
  MapPin,
  CalendarClock,
  Send,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { saveQuote } from "@/lib/store";

const PROJECT_TYPES = [
  { id: "commercial", label: "Commercial / Publicité", icon: Sparkles, base: 250000 },
  { id: "event", label: "Événement (concert, gala, miss…)", icon: CalendarClock, base: 150000 },
  { id: "clip", label: "Clip vidéo / Musique", icon: Video, base: 200000 },
  { id: "mariage", label: "Mariage", icon: Camera, base: 300000 },
  { id: "shooting", label: "Shooting studio / Portrait", icon: Camera, base: 60000 },
  { id: "autre", label: "Autre projet", icon: Sparkles, base: 100000 },
];

const LOCATIONS = ["Lomé", "Hors Lomé (Togo)", "International"];

const DELIVERABLES = [
  { id: "photos", label: "Photos retouchées", price: 50000 },
  { id: "video", label: "Vidéo & montage", price: 100000 },
  { id: "livemontage", label: "Montage live / écran géant", price: 80000 },
  { id: "drone", label: "Prises de vue drone", price: 60000 },
  { id: "social", label: "Contenus réseaux sociaux", price: 40000 },
  { id: "print", label: "Tirages / affiches", price: 30000 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n).replace(/,/g, " ");

export default function Calculator() {
  const root = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);
  const [step, setStep] = useState(0);
  const [project, setProject] = useState(PROJECT_TYPES[0].id);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [deliverables, setDeliverables] = useState<string[]>(["photos"]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-calc]", {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const selectedType = PROJECT_TYPES.find((p) => p.id === project)!;
  const selectedDels = DELIVERABLES.filter((d) => deliverables.includes(d.id));
  const locationMultiplier = location === "International" ? 1.8 : location === "Hors Lomé (Togo)" ? 1.3 : 1;
  const estimate = Math.round(
    (selectedType.base + selectedDels.reduce((s, d) => s + d.price, 0)) * locationMultiplier,
  );

  const toggleDel = (id: string) =>
    setDeliverables((d) =>
      d.includes(id) ? d.filter((x) => x !== id) : [...d, id],
    );

  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Merci de renseigner ton nom, ton email et ton téléphone.");
      return;
    }
    setError("");
    saveQuote({
      projectType: selectedType.label,
      location,
      deliverables: selectedDels.map((d) => d.label),
      ...form,
    }).then(() => setSent(true));
  };

  const labels = ["Projet", "Lieu", "Prestations", "Coordonnées"];

  return (
    <section id="services" ref={root} className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-accent/5 blur-[140px]" />
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div data-calc className="mb-10 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            Devis en 4 étapes
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Calculateur de <span className="text-stroke">projet</span>
          </h2>
        </div>

        <div data-calc className="glass-strong rounded-3xl p-6 sm:p-10">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-black">
                <Check size={28} />
              </div>
              <h3 className="font-display text-2xl font-bold">
                Demande envoyée !
              </h3>
              <p className="max-w-md text-sm text-dim">
                Merci {form.name.split(" ")[0]} ! BOKOVI te recontacte sous 24h
                avec une proposition détaillée pour ton projet{" "}
                {selectedType.label.toLowerCase()}.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setStep(0);
                  setForm({ name: "", email: "", phone: "", message: "" });
                  setDeliverables(["photos"]);
                  setProject(PROJECT_TYPES[0].id);
                  setLocation(LOCATIONS[0]);
                }}
                className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent"
              >
                Nouvelle demande
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                {labels.map((l, i) => (
                  <div key={l} className="flex flex-1 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                        i < step
                          ? "bg-accent text-black"
                          : i === step
                            ? "border border-accent text-accent"
                            : "border border-white/10 text-dim"
                      }`}
                    >
                      {i < step ? <Check size={14} /> : i + 1}
                    </div>
                    <span
                      className={`hidden text-xs sm:block ${
                        i === step ? "text-foreground" : "text-dim"
                      }`}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>

              <div className="min-h-[320px]">
                {step === 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {PROJECT_TYPES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProject(p.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                          project === p.id
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <p.icon size={22} className={project === p.id ? "text-accent" : "text-dim"} />
                        <span className="text-sm font-semibold">{p.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-3">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLocation(l)}
                        className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                          location === l
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <MapPin size={20} className={location === l ? "text-accent" : "text-dim"} />
                        <div>
                          <div className="text-sm font-semibold">{l}</div>
                          <div className="text-xs text-dim">
                            {l === "Lomé"
                              ? "Déplacement inclus dans le devis"
                              : l === "Hors Lomé (Togo)"
                                ? "Frais de déplacement +30%"
                                : "Frais de déplacement +80%"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DELIVERABLES.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => toggleDel(d.id)}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
                          deliverables.includes(d.id)
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span className="text-sm font-medium">{d.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-dim">+{fmt(d.price)}</span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              deliverables.includes(d.id)
                                ? "border-accent bg-accent text-black"
                                : "border-white/20"
                            }`}
                          >
                            {deliverables.includes(d.id) && <Check size={12} />}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nom complet *"
                      className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                    />
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="Email *"
                      className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Téléphone / WhatsApp *"
                      className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent sm:col-span-2"
                    />
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Parle-moi de ton projet (dates, lieu, ambiance…)"
                      rows={3}
                      className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent sm:col-span-2"
                    />
                    {error && <p className="text-xs text-red-400 sm:col-span-2">{error}</p>}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
                <div>
                  <div className="text-xs uppercase tracking-widest text-dim">Estimation indicative</div>
                  <div className="font-display text-2xl font-bold text-accent">
                    {fmt(estimate)} <span className="text-sm text-dim">FCFA</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-dim transition-colors hover:border-white/30 hover:text-foreground"
                    >
                      <ArrowLeft size={16} /> Retour
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
                    >
                      Continuer <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
                    >
                      <Send size={16} /> Envoyer la demande
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}