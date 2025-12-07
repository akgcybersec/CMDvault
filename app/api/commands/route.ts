import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type CommandRow = {
  id: number
  name: string
  command: string
  description: string
  is_multi_step: number
  created_at: string
}

type TagRow = {
  id: number
  name: string
  created_at: string
}

export async function GET() {
  const rows = db.prepare(`
    SELECT c.*, 
           GROUP_CONCAT(t.name) as tag_names,
           GROUP_CONCAT(t.id) as tag_ids
    FROM commands c
    LEFT JOIN command_tags ct ON c.id = ct.command_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all() as (CommandRow & { tag_names: string; tag_ids: string })[]

  return NextResponse.json(
    rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      command: row.command,
      description: row.description,
      is_multi_step: Boolean(row.is_multi_step),
      created_at: row.created_at,
      tags: row.tag_names ? row.tag_names.split(',').map((name, index) => ({
        id: row.tag_ids.split(',')[index],
        name: name.trim()
      })) : []
    })),
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, command, description, is_multi_step = false, tagIds = [] } = body

    if (!name || !command || !description) {
      return NextResponse.json({ error: 'name, command, and description are required' }, { status: 400 })
    }

    // Check for duplicate command name (case-insensitive)
    const existingCommand = db.prepare("SELECT id FROM commands WHERE LOWER(name) = LOWER(?)").get(name.trim()) as { id: number } | undefined
    
    if (existingCommand) {
      return NextResponse.json({ error: `A command with the name "${name.trim()}" already exists` }, { status: 409 })
    }

    const now = new Date().toISOString()

    const info = db
      .prepare("INSERT INTO commands (name, command, description, is_multi_step, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(name.trim(), command, description, Number(is_multi_step), now)

    const commandId = String(info.lastInsertRowid)

    // Add tags if provided
    if (tagIds.length > 0) {
      const insertTag = db.prepare("INSERT INTO command_tags (command_id, tag_id, created_at) VALUES (?, ?, ?)")
      for (const tagId of tagIds) {
        insertTag.run(Number(commandId), Number(tagId), now)
      }
    }

    return NextResponse.json(
      {
        id: commandId,
        name: name.trim(),
        command,
        description,
        is_multi_step: Boolean(is_multi_step),
        created_at: now,
        tags: tagIds.length > 0 ? tagIds.map((tagId: string) => ({ id: tagId, name: '' })) : []
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating command:', error)
    return NextResponse.json({ error: 'Failed to create command' }, { status: 500 })
  }
}
