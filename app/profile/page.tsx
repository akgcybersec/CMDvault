"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!getSession()) {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    if (!newUsername && !newPassword) {
      setError("Enter a new username and/or new password")
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error || "Failed to update profile")
        return
      }

      setSuccess("Profile updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError("Failed to update profile")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-mono text-foreground">Profile</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/vault")}
            className="font-mono bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>

        <div className="border border-primary/40 bg-card/95 rounded-lg p-6 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-colors duration-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-mono">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUsername" className="font-mono">
                New Username (optional)
              </Label>
              <Input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="font-mono"
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-mono">
                New Password (optional)
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-mono"
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-mono"
                placeholder="Only required when changing password"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded font-mono text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-900/20 border border-emerald-500 text-emerald-400 px-4 py-2 rounded font-mono text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full font-mono">
              Update Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
