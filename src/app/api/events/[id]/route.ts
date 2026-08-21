import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore, isValidAdminCode } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isValidAdminCode(req.headers.get("x-admin-code"))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const { id } = await params;
  const store = readStore();
  store.events = store.events.filter((e) => e.id !== id);
  writeStore(store);
  return NextResponse.json({ ok: true });
}