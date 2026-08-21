import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore, isValidAdminCode } from "@/lib/server-store";
import type { QuoteRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isValidAdminCode(req.headers.get("x-admin-code"))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const { quotes } = readStore();
  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  try {
    const quote = (await req.json()) as QuoteRequest;
    if (!quote?.name || !quote?.email) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const store = readStore();
    store.quotes.unshift({ ...quote, id: `q-${Date.now()}` });
    writeStore(store);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}