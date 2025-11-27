import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type NoteRow = {
  id: number
  title: string
  content: string
  created_at: string
}

export async function GET() {
  const rows = db.prepare("SELECT * FROM notes ORDER BY title ASC").all() as NoteRow[]

  const tagRows = db
    .prepare(
      `SELECT nt.note_id, t.id as tag_id, t.name, t.created_at
       FROM note_tags nt
       JOIN tags t ON t.id = nt.tag_id`,
    )
    .all() as { note_id: number; tag_id: number; name: string; created_at: string }[]

  const tagsByNote = new Map<
    number,
    { id: string; name: string; created_at: string }[]
  >()

  for (const tag of tagRows) {
    const list = tagsByNote.get(tag.note_id) ?? []
    list.push({ id: String(tag.tag_id), name: tag.name, created_at: tag.created_at })
    tagsByNote.set(tag.note_id, list)
  }

  return NextResponse.json(
    rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      tags: tagsByNote.get(row.id) ?? [],
    })),
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content } = body as { title: string; content: string }
    
    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for duplicate note title (case-insensitive)
    const existingNote = db.prepare("SELECT id FROM notes WHERE LOWER(title) = LOWER(?)").get(title.trim()) as { id: number } | undefined
    
    if (existingNote) {
      return NextResponse.json({ error: `A note with the title "${title.trim()}" already exists` }, { status: 409 })
    }

    const now = new Date().toISOString()
    const info = db.prepare("INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)").run(
      title.trim(),
      content,
      now,
    )

    return NextResponse.json(
      {
        id: String(info.lastInsertRowid),
        title: title.trim(),
        content,
        created_at: now,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
