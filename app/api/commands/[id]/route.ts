import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()

    // Check for duplicate name if name is being updated
    if (updates.name !== undefined) {
      const existingCommand = db.prepare("SELECT id FROM commands WHERE LOWER(name) = LOWER(?) AND id != ?").get(updates.name.trim(), Number(id)) as { id: number } | undefined
      
      if (existingCommand) {
        return NextResponse.json({ error: `A command with the name "${updates.name.trim()}" already exists` }, { status: 409 })
      }
    }

    const fields: string[] = []
    const values: unknown[] = []

    if (updates.name !== undefined) {
      fields.push("name = ?")
      values.push(updates.name.trim())
    }
    if (updates.command !== undefined) {
      fields.push("command = ?")
      values.push(updates.command)
    }
    if (updates.description !== undefined) {
      fields.push("description = ?")
      values.push(updates.description)
    }
    if (updates.is_multi_step !== undefined) {
      fields.push("is_multi_step = ?")
      values.push(Number(updates.is_multi_step))
    }

    if (fields.length === 0) {
      return NextResponse.json({ ok: true })
    }

    values.push(Number(id))
    const sql = `UPDATE commands SET ${fields.join(", ")} WHERE id = ?`
    db.prepare(sql).run(...values)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating command:', error)
    return NextResponse.json({ error: 'Failed to update command' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    db.prepare("DELETE FROM commands WHERE id = ?").run(Number(id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting command:', error)
    return NextResponse.json({ error: 'Failed to delete command' }, { status: 500 })
  }
}
