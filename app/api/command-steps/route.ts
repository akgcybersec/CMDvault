import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface CommandStepRow {
  id: number
  command_id: number
  step_number: number
  command: string
  comment: string
  created_at: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const commandId = searchParams.get('command_id')
  
  if (!commandId) {
    return NextResponse.json({ error: 'command_id is required' }, { status: 400 })
  }

  try {
    const rows = db.prepare("SELECT * FROM command_steps WHERE command_id = ? ORDER BY step_number ASC").all(Number(commandId)) as CommandStepRow[]
    
    return NextResponse.json(
      rows.map((row) => ({
        id: String(row.id),
        command_id: String(row.command_id),
        step_number: row.step_number,
        command: row.command,
        comment: row.comment,
        created_at: row.created_at,
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch command steps' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { command_id, step_number, command, comment = '' } = body
    
    if (!command_id || step_number === undefined || !command) {
      return NextResponse.json({ error: 'command_id, step_number, and command are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const info = db
      .prepare(
        "INSERT INTO command_steps (command_id, step_number, command, comment, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(Number(command_id), step_number, command, comment, now)

    return NextResponse.json(
      {
        id: String(info.lastInsertRowid),
        command_id: String(command_id),
        step_number,
        command,
        comment,
        created_at: now,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create command step' }, { status: 500 })
  }
}
