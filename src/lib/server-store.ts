import fs from "node:fs";
import path from "node:path";
import { SEED_EVENTS } from "@/lib/content";
import type { AnalyticsRecord, EventItem, QuoteRequest } from "@/lib/types";

export interface PersistedStore {
  events: EventItem[];
  quotes: QuoteRequest[];
  analytics: { total: number; daily: AnalyticsRecord[]; lastVisit: string };
}

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

const EMPTY: PersistedStore = {
  events: SEED_EVENTS,
  quotes: [],
  analytics: { total: 0, daily: [], lastVisit: "" },
};

export function readStore(): PersistedStore {
  try {
    if (!fs.existsSync(FILE)) return EMPTY;
    const raw = fs.readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(raw) as PersistedStore;
    return {
      events: parsed.events?.length ? parsed.events : SEED_EVENTS,
      quotes: parsed.quotes ?? [],
      analytics: parsed.analytics ?? EMPTY.analytics,
    };
  } catch {
    return EMPTY;
  }
}

export function writeStore(store: PersistedStore) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function isValidAdminCode(code: string | null): boolean {
  return code === "BOKOVI007#";
}