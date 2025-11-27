import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { currentPassword, newUsername, newPassword } = (await request.json()) as {
    currentPassword: string
    newUsername?: string
    newPassword?: string
  }

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 })
  }

  if (!newUsername && !newPassword) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const user = db.prepare("SELECT * FROM users LIMIT 1").get() as { id: number; username: string; password: string } | undefined

  if (!user || user.password !== currentPassword) {
    return NextResponse.json({ error: "Invalid current password" }, { status: 401 })
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (newUsername && newUsername !== user.username) {
    updates.push("username = ?")
    values.push(newUsername)
  }

  if (newPassword && newPassword.length > 0 && newPassword !== user.password) {
    updates.push("password = ?")
    values.push(newPassword)
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: true })
  }

  values.push(user.id)
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
  db.prepare(sql).run(...values)

  return NextResponse.json({ ok: true })
}
