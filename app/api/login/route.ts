import db from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { username, password } = await request.json()
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?")
  const user = stmt.get(username) as { id: number; username: string; password: string } | undefined

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const storedPassword = user.password

  // If password looks like a bcrypt hash, verify using bcrypt
  if (storedPassword.startsWith("$2")) {
    const ok = bcrypt.compareSync(password, storedPassword)
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  }

  // Legacy plaintext password support: compare directly once, then upgrade to hash
  if (storedPassword === password) {
    const newHash = bcrypt.hashSync(password, 10)
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newHash, user.id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
