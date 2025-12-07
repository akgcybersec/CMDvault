import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  db.prepare("DELETE FROM placeholder_values WHERE id = ?").run(Number(id))
  return NextResponse.json({ ok: true })
}
