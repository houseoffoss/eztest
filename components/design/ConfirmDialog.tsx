"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/elements/dialog"
import { Button } from "@/elements/button"
import { ButtonPrimary } from "@/elements/button-primary"

export interface ConfirmDialogProps {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  onConfirm?: () => void | Promise<void>
  variant?: "default" | "glass"
  children: React.ReactNode // trigger
}

export function ConfirmDialog({
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "glass",
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  async function handleConfirm() {
    try {
      setBusy(true)
      await onConfirm?.()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent variant={variant}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="glass" onClick={() => setOpen(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <ButtonPrimary onClick={handleConfirm} disabled={busy}>
            {confirmLabel}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog
