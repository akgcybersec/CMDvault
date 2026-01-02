import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const contentType = file.type || "application/octet-stream"
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 })
    }

    const ext = contentType.split("/")[1] ? `.${contentType.split("/")[1]}` : ""
    const filename = `${randomUUID()}${ext}`

    const uploadsDir = path.join(process.cwd(), "data", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await fs.writeFile(path.join(uploadsDir, filename), buffer)

    return NextResponse.json({ name: filename, url: `/api/uploads/${filename}` }, { status: 201 })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
