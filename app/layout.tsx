import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CMDvault - Pentester Repository",
  description: "Secure command repository for penetration testing professionals",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-primary/40 bg-card/95 text-xs text-muted-foreground">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-mono">
                  CMDvault · Open source · MIT License
                </span>
                <span className="font-mono">
                  No warranty; authors and contributors are not responsible for misuse.
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:items-end">
                <a
                  href="https://github.com/akgcybersec"
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  GitHub: akgcybersec
                </a>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
