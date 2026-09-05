"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Clock,
  Image as ImageIcon,
  Clapperboard,
  Trash2,
  Mail,
} from "lucide-react";
import { getStats, resetStats } from "@/lib/analytics";
import {
  getEvents,
  getQuotes,
  deleteQuote,
} from "@/lib/store";
import type { AnalyticsRecord, EventItem, QuoteRequest } from "@/lib/types";
import EventManager from "./EventManager";

type Tab = "events" | "stats" | "quotes";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("events");
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
    { id: "events" as Tab, label: "Événements", icon: ImageIcon },
    { id: "stats" as Tab, label: "Statistiques", icon: Users },
    { id: "quotes" as Tab, label: "Demandes", icon: Mail },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-dim">
            Pilotage du site — gestion des événements et demandes de devis.
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