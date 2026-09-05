"use client";

import { ADMIN_CODE } from "./content";
import type { EventItem, EventMedia, QuoteRequest } from "./types";
import {
  fetchEventsFromSupabase,
  createEventInSupabase,
  deleteEventFromSupabase,
} from "./supabase";

const QUOTES_KEY = "bk_quotes_v1";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

const ADMIN_HEADERS = { "x-admin-code": ADMIN_CODE };

/**
 * Récupère tous les événements en direct depuis Supabase ('events' & 'event_media')
 */
export async function getEvents(): Promise<EventItem[]> {
  return await fetchEventsFromSupabase();
}

/**
 * Création d'un événement et de ses médias dans Supabase avec gestion try/catch et logs d'erreurs
 */
export async function createEvent(
  eventData: {
    id?: string;
    title: string;
    category: string;
    location: string;
    date: string;
    description: string;
    cover?: string;
    featured?: boolean;
  },
  mediaList: { url: string; publicId: string; kind: "photo" | "video" }[]
) {
  return await createEventInSupabase(eventData, mediaList);
}

/**
 * Supprime un événement et ses médias associés dans Supabase
 */
export async function deleteEvent(id: string): Promise<boolean> {
  return await deleteEventFromSupabase(id);
}

export function createEventId() {
  return uid();
}

export async function getQuotes(): Promise<QuoteRequest[]> {
  try {
    const res = await fetch("/api/quotes", { headers: ADMIN_HEADERS, cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quotes)) return data.quotes;
    }
  } catch {
    /* repli local */
  }
  return read<QuoteRequest[]>(QUOTES_KEY, []);
}

export async function saveQuote(quote: Omit<QuoteRequest, "id" | "date">) {
  try {
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quote, id: uid(), date: new Date().toISOString() }),
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  const quotes = read<QuoteRequest[]>(QUOTES_KEY, []);
  quotes.unshift({ ...quote, id: uid(), date: new Date().toISOString() });
  write(QUOTES_KEY, quotes);
  return false;
}

export async function deleteQuote(id: string) {
  try {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) return true;
  } catch {
    /* repli local */
  }
  write(
    QUOTES_KEY,
    read<QuoteRequest[]>(QUOTES_KEY, []).filter((q) => q.id !== id),
  );
  return false;
}