import type { AnalyticsRecord } from "./types";
import { ADMIN_CODE } from "./content";

const VIEWS_KEY = "bk_views_total";
const DAILY_KEY = "bk_views_daily";
const LAST_VISIT_KEY = "bk_last_visit";
const SESSION_KEY = "bk_session_seen";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export function trackVisit() {
  if (typeof window === "undefined") return;
  const sessionSeen = read(SESSION_KEY, false);
  if (sessionSeen) return;
  write(SESSION_KEY, true);

  const total = read(VIEWS_KEY, 0) + 1;
  write(VIEWS_KEY, total);

  const daily = read<AnalyticsRecord[]>(DAILY_KEY, []);
  const t = today();
  const idx = daily.findIndex((d) => d.date === t);
  if (idx >= 0) {
    daily[idx].count += 1;
  } else {
    daily.push({ date: t, count: 1 });
    daily.sort((a, b) => (a.date < b.date ? -1 : 1));
    if (daily.length > 90) daily.splice(0, daily.length - 90);
  }
  write(DAILY_KEY, daily);
  write(LAST_VISIT_KEY, new Date().toISOString());

  fetch("/api/analytics", { method: "POST", keepalive: true }).catch(() => {});
}

export async function getStats() {
  try {
    const res = await fetch("/api/analytics", {
      headers: { "x-admin-code": ADMIN_CODE },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.analytics) return data.analytics as { total: number; daily: AnalyticsRecord[]; lastVisit: string };
    }
  } catch {
    /* repli local */
  }
  return {
    total: read(VIEWS_KEY, 0),
    daily: read<AnalyticsRecord[]>(DAILY_KEY, []),
    lastVisit: read<string>(LAST_VISIT_KEY, ""),
  };
}

export async function resetStats() {
  write(VIEWS_KEY, 0);
  write(DAILY_KEY, []);
  write(LAST_VISIT_KEY, "");
  try {
    await fetch("/api/analytics", { method: "DELETE", headers: { "x-admin-code": ADMIN_CODE } });
  } catch {
    /* ignoré */
  }
}