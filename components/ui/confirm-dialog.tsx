"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Trash2, AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmDialogProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 150)
  }

  const handleConfirm = () => {
    onConfirm()
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-150 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={`relative bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-150 transform ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                type === "danger" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-500"
              }`}
            >
              {type === "danger" ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h2 className="text-lg font-semibold font-mono text-foreground">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-muted-foreground font-mono leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            className="font-mono bg-transparent"
          >
            {cancelText}
          </Button>
          <Button
            variant={type === "danger" ? "destructive" : "default"}
            onClick={handleConfirm}
            className="font-mono"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing dialog state
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    type?: "danger" | "warning"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    type?: "danger" | "warning"
  }) => {
    setDialog({ ...options, isOpen: true })
  }

  const close = () => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={close}
      onConfirm={dialog.onConfirm}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      type={dialog.type}
    />
  )

  return { confirm, close, ConfirmDialogComponent }
}
