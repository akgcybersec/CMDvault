"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, initializeStorage } from "@/lib/storage"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeStorage()
    const session = getSession()

    if (session) {
      router.push("/vault")
    } else {
      router.push("/login")
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-mono">Loading...</div>
      </div>
    )
  }

  return null
}
