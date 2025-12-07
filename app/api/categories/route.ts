import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type CategoryRow = {
  id: number
  name: string
  created_at: string
}

export async function GET() {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name ASC").all() as CategoryRow[]
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
  const { name } = body
  const now = new Date().toISOString()

  const info = db.prepare("INSERT INTO categories (name, created_at) VALUES (?, ?)").run(name, now)

  return NextResponse.json(
    {
      id: String(info.lastInsertRowid),
      name,
      created_at: now,
    },
    { status: 201 },
  )
}
