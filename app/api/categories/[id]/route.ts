import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const body = await request.json()
  const { name } = body as { name?: string }

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 })
  }

  db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, Number(id))

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const numericId = Number(id)

  const deleteCommands = db.prepare("DELETE FROM commands WHERE category_id = ?")
  const deleteCategory = db.prepare("DELETE FROM categories WHERE id = ?")

  const transaction = db.transaction((categoryId: number) => {
    deleteCommands.run(categoryId)
    deleteCategory.run(categoryId)
  })

  transaction(numericId)

  return NextResponse.json({ ok: true })
}
