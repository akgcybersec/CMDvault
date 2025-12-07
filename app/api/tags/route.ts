import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type TagRow = {
  id: number
  name: string
  created_at: string
}

export async function GET() {
  const rows = db.prepare("SELECT * FROM tags ORDER BY name ASC").all() as TagRow[]
  return NextResponse.json(
    rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      created_at: row.created_at,
    })),
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Check for duplicate tag name (case-insensitive)
    const existingTag = db.prepare("SELECT id FROM tags WHERE LOWER(name) = LOWER(?)").get(name.trim()) as { id: number } | undefined
    
    if (existingTag) {
      return NextResponse.json({ error: `A tag with the name "${name.trim()}" already exists` }, { status: 409 })
    }

    const now = new Date().toISOString()
    const info = db.prepare("INSERT INTO tags (name, created_at) VALUES (?, ?)").run(name.trim(), now)

    return NextResponse.json(
      {
        id: String(info.lastInsertRowid),
        name: name.trim(),
        created_at: now,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
