import db from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
  const user = stmt.get(username, password)

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
