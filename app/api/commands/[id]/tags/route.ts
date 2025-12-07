import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { tagIds } = await request.json()

    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'tagIds must be an array' }, { status: 400 })
    }

    const commandId = Number(id)
    const now = new Date().toISOString()

    // Delete existing command tags
    db.prepare("DELETE FROM command_tags WHERE command_id = ?").run(commandId)

    // Add new tags
    if (tagIds.length > 0) {
      const insertTag = db.prepare("INSERT INTO command_tags (command_id, tag_id, created_at) VALUES (?, ?, ?)")
      for (const tagId of tagIds) {
        insertTag.run(commandId, Number(tagId), now)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating command tags:', error)
    return NextResponse.json({ error: 'Failed to update command tags' }, { status: 500 })
  }
}
