import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Check for duplicate tag name if name is being updated
    const existingTag = db.prepare("SELECT id FROM tags WHERE LOWER(name) = LOWER(?) AND id != ?").get(name.trim(), Number(id)) as { id: number } | undefined
    
    if (existingTag) {
      return NextResponse.json({ error: `A tag with the name "${name.trim()}" already exists` }, { status: 409 })
    }

    const now = new Date().toISOString()
    db.prepare("UPDATE tags SET name = ?, created_at = ? WHERE id = ?").run(name.trim(), now, Number(id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    db.prepare("DELETE FROM tags WHERE id = ?").run(Number(id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}
