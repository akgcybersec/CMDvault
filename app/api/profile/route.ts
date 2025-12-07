import db from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

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

  if (!user) {
    return NextResponse.json({ error: "Invalid current password" }, { status: 401 })
  }

  const storedPassword = user.password

  let passwordMatches = false

  if (storedPassword.startsWith("$2")) {
    passwordMatches = bcrypt.compareSync(currentPassword, storedPassword)
  } else if (storedPassword === currentPassword) {
    // Legacy plaintext match – upgrade to hash
    const upgradedHash = bcrypt.hashSync(currentPassword, 10)
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(upgradedHash, user.id)
    passwordMatches = true
  }

  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid current password" }, { status: 401 })
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (newUsername && newUsername !== user.username) {
    updates.push("username = ?")
    values.push(newUsername)
  }

  if (newPassword && newPassword.length > 0 && newPassword !== user.password) {
    const newHash = bcrypt.hashSync(newPassword, 10)
    updates.push("password = ?")
    values.push(newHash)
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: true })
  }

  values.push(user.id)
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
  db.prepare(sql).run(...values)

  return NextResponse.json({ ok: true })
}
