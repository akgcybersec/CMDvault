import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type PlaceholderSetRow = {
  id: number
  name: string
  created_at: string
}

export async function GET() {
  const rows = db.prepare("SELECT * FROM placeholder_sets ORDER BY name ASC").all() as PlaceholderSetRow[]
  return NextResponse.json(
    rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      created_at: row.created_at,
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name } = body as { name: string }
  if (!name || typeof name !== "string" || !/^\w+$/.test(name)) {
    return NextResponse.json({ error: "Invalid set name" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const info = db.prepare("INSERT INTO placeholder_sets (name, created_at) VALUES (?, ?)").run(name, now)

  return NextResponse.json(
    {
      id: String(info.lastInsertRowid),
      name,
      created_at: now,
    },
    { status: 201 },
  )
}
