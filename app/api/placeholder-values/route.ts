import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type PlaceholderValueRow = {
  id: number
  set_id: number
  placeholder_name: string
  default_value: string
  created_at: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const setId = searchParams.get("set_id")
  if (!setId) {
    return NextResponse.json({ error: "Missing set_id" }, { status: 400 })
  }

  const rows = db.prepare("SELECT * FROM placeholder_values WHERE set_id = ? ORDER BY placeholder_name ASC").all(Number(setId)) as PlaceholderValueRow[]
  return NextResponse.json(
    rows.map((row) => ({
      id: String(row.id),
      set_id: String(row.set_id),
      placeholder_name: row.placeholder_name,
      default_value: row.default_value,
      created_at: row.created_at,
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const { set_id, placeholder_name, default_value } = body as {
    set_id: string
    placeholder_name: string
    default_value: string
  }
  if (!set_id || !placeholder_name || default_value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const info = db.prepare("INSERT INTO placeholder_values (set_id, placeholder_name, default_value, created_at) VALUES (?, ?, ?, ?)").run(
    Number(set_id),
    placeholder_name,
    default_value,
    now,
  )

  return NextResponse.json(
    {
      id: String(info.lastInsertRowid),
      set_id,
      placeholder_name,
      default_value,
      created_at: now,
    },
    { status: 201 },
  )
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { set_id, placeholder_name, default_value } = body as {
    set_id: string
    placeholder_name: string
    default_value: string
  }
  if (!set_id || !placeholder_name || default_value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const stmt = db.prepare("UPDATE placeholder_values SET default_value = ? WHERE set_id = ? AND placeholder_name = ?")
  const info = stmt.run(default_value, Number(set_id), placeholder_name)

  if (info.changes === 0) {
    // Insert if not exists
    const now = new Date().toISOString()
    db.prepare("INSERT INTO placeholder_values (set_id, placeholder_name, default_value, created_at) VALUES (?, ?, ?, ?)").run(
      Number(set_id),
      placeholder_name,
      default_value,
      now,
    )
  }

  return NextResponse.json({ ok: true })
}
