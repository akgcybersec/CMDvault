import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ commandId: string }> }
) {
  try {
    const { commandId } = await params
    const { steps } = await request.json()
    
    if (!commandId || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'commandId and steps array are required' }, { status: 400 })
    }

    // Delete existing steps for this command
    db.prepare("DELETE FROM command_steps WHERE command_id = ?").run(Number(commandId))

    // Insert new steps
    const now = new Date().toISOString()
    const insertStmt = db.prepare("INSERT INTO command_steps (command_id, step_number, command, comment, created_at) VALUES (?, ?, ?, ?, ?)")
    
    const transaction = db.transaction(() => {
      for (const step of steps) {
        insertStmt.run(Number(commandId), step.step_number, step.command, step.comment || '', now)
      }
    })
    
    transaction()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update command steps' }, { status: 500 })
  }
}
