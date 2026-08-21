import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore, isValidAdminCode } from "@/lib/server-store";
import type { EventItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { events } = readStore();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  if (!isValidAdminCode(req.headers.get("x-admin-code"))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  try {
    const event = (await req.json()) as EventItem;
    if (!event?.id || !event?.title) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const store = readStore();
    const idx = store.events.findIndex((e) => e.id === event.id);
    if (idx >= 0) store.events[idx] = event;
    else store.events.unshift(event);
    writeStore(store);
    return NextResponse.json({ ok: true, event });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}