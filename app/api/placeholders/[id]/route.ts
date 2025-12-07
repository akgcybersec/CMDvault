import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const body = await request.json()
  const { name } = body as { name?: string }

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 })
  }

  db.prepare("UPDATE placeholders SET name = ? WHERE id = ?").run(name, Number(id))

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  db.prepare("DELETE FROM placeholders WHERE id = ?").run(Number(id))
  return NextResponse.json({ ok: true })
}
