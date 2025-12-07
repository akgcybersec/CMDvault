import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  db.prepare("DELETE FROM notes WHERE id = ?").run(Number(id))
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content } = body as { title?: string; content?: string }

    // Check for duplicate title if title is being updated
    if (title !== undefined) {
      const existingNote = db.prepare("SELECT id FROM notes WHERE LOWER(title) = LOWER(?) AND id != ?").get(title.trim(), Number(id)) as { id: number } | undefined
      
      if (existingNote) {
        return NextResponse.json({ error: `A note with the title "${title.trim()}" already exists` }, { status: 409 })
      }
    }

    const fields: string[] = []
    const values: unknown[] = []

    if (title !== undefined) {
      fields.push("title = ?")
      values.push(title.trim())
    }
    if (content !== undefined) {
      fields.push("content = ?")
      values.push(content)
    }

    if (fields.length === 0) {
      return NextResponse.json({ ok: true })
    }

    values.push(Number(id))
    const sql = `UPDATE notes SET ${fields.join(", ")} WHERE id = ?`
    db.prepare(sql).run(...values)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}
