import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export const runtime = "nodejs"

interface RouteParams {
  params: Promise<{ name: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { name } = await params

    // basic path traversal protection
    if (name.includes("/") || name.includes("\\") || name.includes("..")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "data", "uploads", name)
    const buffer = await fs.readFile(filePath)

    const ext = path.extname(name).toLowerCase()
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "application/octet-stream"

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
