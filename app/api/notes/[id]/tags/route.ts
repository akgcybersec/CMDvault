import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const noteId = Number(id)

  try {
    const body = await request.json()
    const { tagIds } = body as { tagIds: string[] }

    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: "tagIds must be an array" }, { status: 400 })
    }

    const now = new Date().toISOString()

    const deleteStmt = db.prepare("DELETE FROM note_tags WHERE note_id = ?")
    deleteStmt.run(noteId)

    if (tagIds.length > 0) {
      const insertStmt = db.prepare(
        "INSERT INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)",
      )

      const insertMany = db.transaction((ids: string[]) => {
        for (const tagId of ids) {
          insertStmt.run(noteId, Number(tagId), now)
        }
      })

      insertMany(tagIds)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating note tags:", error)
    return NextResponse.json({ error: "Failed to update note tags" }, { status: 500 })
  }
}
