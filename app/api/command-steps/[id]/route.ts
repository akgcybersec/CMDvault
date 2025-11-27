import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const fields: string[] = []
    const values: any[] = []

    if (updates.command !== undefined) {
      fields.push("command = ?")
      values.push(updates.command)
    }
    if (updates.comment !== undefined) {
      fields.push("comment = ?")
      values.push(updates.comment)
    }

    if (fields.length === 0) {
      return NextResponse.json({ ok: true })
    }

    values.push(Number(id))
    const sql = `UPDATE command_steps SET ${fields.join(", ")} WHERE id = ?`
    db.prepare(sql).run(...values)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update command step' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    db.prepare("DELETE FROM command_steps WHERE id = ?").run(Number(id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete command step' }, { status: 500 })
  }
}
