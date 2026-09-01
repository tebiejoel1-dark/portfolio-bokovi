"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  CalendarDays,
  Clock,
  Image as ImageIcon,
  Clapperboard,
  Trash2,
  Mail,
  CloudUpload,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getStats, resetStats } from "@/lib/analytics";
import {
  getEvents,
  getQuotes,
  deleteQuote,
} from "@/lib/store";
import {
  uploadMediaToCloudinary,
  getCloudinaryPortfolioMedia,
  CLOUDINARY_CONFIG,
} from "@/lib/cloudinary";
import type { AnalyticsRecord, EventItem, EventMedia, QuoteRequest } from "@/lib/types";
import EventManager from "./EventManager";

type Tab = "stats" | "events" | "cloudinary" | "quotes";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("stats");
  const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    daily: AnalyticsRecord[];
    lastVisit: string;
  }>({ total: 0, daily: [], lastVisit: "" });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const bump = () => setRefresh((r) => r + 1);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      getStats().then((s) => {
        if (!cancelled) setStats(s);
      });
      getEvents().then((e) => {
        if (!cancelled) setEvents(e);
      });
      getQuotes().then((q) => {
        if (!cancelled) setQuotes(q);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [refresh]);

  const totalViews = stats.total;
  const daily = stats.daily;
  const maxDay = Math.max(1, ...daily.map((d) => d.count));
  const last30 = daily.slice(-30);
  const weekCount = daily.slice(-7).reduce((s, d) => s + d.count, 0);
  const photoCount = events.reduce(
    (s, e) => s + e.media.filter((m) => m.kind === "photo").length,
    0,
  );
  const videoCount = events.reduce(
    (s, e) => s + e.media.filter((m) => m.kind === "video").length,
    0,
  );

  const navItems = [
    { id: "stats" as Tab, label: "Statistiques", icon: Users },
    { id: "events" as Tab, label: "Événements", icon: ImageIcon },
    { id: "cloudinary" as Tab, label: "Cloudinary HD", icon: CloudUpload },
    { id: "quotes" as Tab, label: "Demandes", icon: Mail },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-dim">
            Pilotage du site — statistiques, événements, upload Cloudinary et demandes de devis.
          </p>
        </div>
        <button
          onClick={() => {
            resetStats().then(bump);
          }}
          className="rounded-full border border-white/10 px-4 py-2 text-xs text-dim transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          Réinitialiser les stats
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              tab === n.id
                ? "bg-accent text-black"
                : "border border-white/10 text-dim hover:border-white/30 hover:text-foreground"
            }`}
          >
            <n.icon size={15} /> {n.label}
            {n.id === "quotes" && quotes.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {quotes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Visites totales"
              value={totalViews.toLocaleString("fr-FR")}
              hint="depuis le lancement"
            />
            <StatCard
              icon={CalendarDays}
              label="Visites 7 jours"
              value={weekCount.toLocaleString("fr-FR")}
              hint="cette semaine"
            />
            <StatCard
              icon={ImageIcon}
              label="Photos en ligne"
              value={photoCount.toLocaleString("fr-FR")}
              hint={`${events.length} événements`}
            />
            <StatCard
              icon={Clapperboard}
              label="Vidéos en ligne"
              value={videoCount.toLocaleString("fr-FR")}
              hint="médias vidéo"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-strong rounded-3xl p-6 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  Visites — 30 derniers jours
                </h3>
                <Clock size={16} className="text-dim" />
              </div>
              {last30.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-dim">
                  Aucune visite enregistrée pour l’instant.
                </div>
              ) : (
                <div className="flex h-40 items-end gap-1">
                  {last30.map((d) => (
                    <div key={d.date} className="group relative flex-1">
                      <div
                        className="chart-bar w-full rounded-t bg-accent/70 transition-all duration-300 hover:bg-accent"
                        style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                      />
                      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[10px] text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {d.date.slice(5)} : {d.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-dim">
                <span>{last30[0]?.date ?? "—"}</span>
                <span>{last30[last30.length - 1]?.date ?? "—"}</span>
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <h3 className="mb-4 font-display text-lg font-bold">
                Activité récente
              </h3>
              <ul className="space-y-3 text-sm">
                {daily
                  .slice(-5)
                  .reverse()
                  .map((d) => (
                    <li key={d.date} className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-dim">{d.date}</span>
                      <span className="font-semibold text-accent">{d.count} visites</span>
                    </li>
                  ))}
                <li className="flex items-center justify-between pt-1">
                  <span className="text-dim">Dernière visite</span>
                  <span className="text-xs">
                    {stats.lastVisit
                      ? new Date(stats.lastVisit).toLocaleString("fr-FR")
                      : "—"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "events" && (
        <EventManager
          events={events}
          bump={bump}
        />
      )}

      {tab === "cloudinary" && <CloudinaryDirectManager />}

      {tab === "quotes" && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold">Demandes de devis reçues</h3>
          {quotes.length === 0 ? (
            <div className="glass-strong flex h-40 flex-col items-center justify-center rounded-3xl text-sm text-dim">
              Aucune demande pour l’instant.
            </div>
          ) : (
            quotes.map((q) => (
              <div key={q.id} className="glass-strong rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-lg font-bold">{q.name}</div>
                    <div className="text-xs text-dim">
                      {q.date ? new Date(q.date).toLocaleString("fr-FR") : ""} {q.phone ? `· ${q.phone}` : ""} · {q.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      deleteQuote(q.id).then(bump);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-dim transition-colors hover:border-red-500/50 hover:text-red-400"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.projectType && (
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold text-accent">
                      {q.projectType}
                    </span>
                  )}
                  {q.type && (
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold text-accent">
                      {q.type}
                    </span>
                  )}
                  {q.location && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-dim">
                      {q.location}
                    </span>
                  )}
                  {(q.deliverables || q.services || []).map((d) => (
                    <span key={d} className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-dim">
                      {d}
                    </span>
                  ))}
                </div>
                {q.message && <p className="mt-3 text-sm text-dim">{q.message}</p>}
                <div className="mt-4 flex gap-2">
                  {q.phone && (
                    <a
                      href={`tel:${q.phone.replace(/\s/g, "")}`}
                      className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
                    >
                      Appeler
                    </a>
                  )}
                  <a
                    href={`mailto:${q.email}`}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-dim transition-colors hover:border-accent hover:text-accent"
                  >
                    Répondre
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

function CloudinaryDirectManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cloudMedia, setCloudMedia] = useState<EventMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [status, setStatus] = useState<{
    isUploading: boolean;
    currentFile: string;
    message: string;
    percent: number;
    error: string;
  }>({
    isUploading: false,
    currentFile: "",
    message: "",
    percent: 0,
    error: "",
  });

  const loadMedia = () => {
    setLoadingMedia(true);
    getCloudinaryPortfolioMedia()
      .then(setCloudMedia)
      .finally(() => setLoadingMedia(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleSelectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setStatus({
        isUploading: true,
        currentFile: file.name,
        message: `Prise en charge de "${file.name}" (${i + 1}/${fileArray.length})...`,
        percent: Math.round(((i + 0.1) / fileArray.length) * 100),
        error: "",
      });

      try {
        await uploadMediaToCloudinary(file, (st) => {
          const stepPercent = Math.round(
            ((i + (st.progressPercent ? st.progressPercent / 100 : 0.5)) / fileArray.length) * 100
          );
          setStatus({
            isUploading: true,
            currentFile: file.name,
            message: st.message,
            percent: Math.min(100, stepPercent),
            error: "",
          });
        });
      } catch (err) {
        console.error(err);
        setStatus((prev) => ({
          ...prev,
          error: `Erreur d'envoi pour "${file.name}".`,
        }));
      }
    }

    setStatus({
      isUploading: false,
      currentFile: "",
      message: "Tous les fichiers ont été envoyés vers Cloudinary !",
      percent: 100,
      error: "",
    });

    loadMedia();
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <CloudUpload className="text-accent" size={22} /> Upload Direct Cloudinary HD
            </h2>
            <p className="mt-1 text-sm text-dim">
              Envoyer des photos (60 Mo - 300 Mo+ compressées WebP client) et des vidéos directement vers Cloudinary.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-dim">
            <span>Preset: <strong className="text-accent">{CLOUDINARY_CONFIG.uploadPreset}</strong></span>
            <span>·</span>
            <span>Tag: <strong className="text-accent">{CLOUDINARY_CONFIG.tag}</strong></span>
          </div>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 p-8 text-center transition-all hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
            <CloudUpload size={28} />
          </div>
          <p className="text-sm font-bold">Clique ici ou glisse tes photos & vidéos</p>
          <p className="mt-1 text-xs text-dim">
            Photos HD (60 Mo à 300 Mo+) converties automatiquement en WebP HD (2560px, qual. 85%) avant l'envoi réseau.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleSelectFiles(e.target.files)}
          />
        </div>

        {status.isUploading && (
          <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs font-bold text-accent">
                  <span className="truncate">{status.currentFile}</span>
                  <span>{status.percent}%</span>
                </div>
                <p className="mt-1 text-xs text-foreground/90">{status.message}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${status.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {status.message && !status.isUploading && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={16} /> {status.message}
          </div>
        )}

        {status.error && (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            {status.error}
          </div>
        )}
      </div>

      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Médias publiés sur Cloudinary ({cloudMedia.length})</h3>
          <button
            onClick={loadMedia}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            Actualiser
          </button>
        </div>

        {loadingMedia ? (
          <div className="flex h-32 items-center justify-center text-xs text-dim">
            <Loader2 className="animate-spin mr-2" size={16} /> Chargement de la galerie Cloudinary...
          </div>
        ) : cloudMedia.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-dim border border-dashed border-white/10 rounded-2xl">
            Aucun média sur Cloudinary avec le tag portfolio_client_1.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {cloudMedia.map((m) => (
              <a
                key={m.id}
                href={m.src}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black"
              >
                {m.kind === "video" ? (
                  <div className="flex h-full w-full items-center justify-center text-accent bg-black/60">
                    <Clapperboard size={24} />
                  </div>
                ) : (
                  <img src={m.src} alt={m.caption} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ExternalLink size={16} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-strong rounded-3xl p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon size={18} />
      </div>
      <div className="font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-medium text-dim">{label}</div>
      <div className="text-[10px] text-dim/60">{hint}</div>
    </div>
  );
}