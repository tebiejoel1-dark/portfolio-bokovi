import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore, isValidAdminCode } from "@/lib/server-store";

export const dynamic = "force-dynamic";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (!isValidAdminCode(req.headers.get("x-admin-code"))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const { analytics } = readStore();
  return NextResponse.json({ analytics });
}

export async function POST() {
  const store = readStore();
  const a = store.analytics;
  a.total += 1;
  const t = today();
  const idx = a.daily.findIndex((d) => d.date === t);
  if (idx >= 0) a.daily[idx].count += 1;
  else {
    a.daily.push({ date: t, count: 1 });
    a.daily.sort((x, y) => (x.date < y.date ? -1 : 1));
    if (a.daily.length > 90) a.daily.splice(0, a.daily.length - 90);
  }
  a.lastVisit = new Date().toISOString();
  writeStore(store);
  return NextResponse.json({ ok: true, total: a.total });
}

export async function DELETE(req: NextRequest) {
  if (!isValidAdminCode(req.headers.get("x-admin-code"))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const store = readStore();
  store.analytics = { total: 0, daily: [], lastVisit: "" };
  writeStore(store);
  return NextResponse.json({ ok: true });
}