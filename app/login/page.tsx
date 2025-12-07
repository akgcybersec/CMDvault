"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyUser, setSession, initializeStorage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useState(() => {
    initializeStorage()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const ok = await verifyUser(username, password)
    if (!ok) {
      setError("Invalid credentials")
      return
    }

    setSession(true)
    router.push("/vault")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-card/95 px-4 py-3 shadow-md shadow-black/50">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/15 text-primary">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold font-mono tracking-[0.18em] text-muted-foreground">
                CMDvault
              </h1>
              <span className="text-[11px] font-mono text-muted-foreground/80">
                Login to manage your commands and notes
              </span>
            </div>
          </div>
        </div>

        <div className="border border-primary/40 bg-card/95 rounded-lg p-6 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-colors duration-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-mono">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-mono"
                placeholder="admin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono"
                placeholder="••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded font-mono text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full font-mono">
              Access Vault
            </Button>

            </form>
        </div>
      </div>
    </div>
  )
}
