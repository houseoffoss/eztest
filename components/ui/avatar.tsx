"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        // Glass gradient background for avatar root (used when image transparent or fallback)
  "relative flex size-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/50 via-primary/30 to-accent/50 ring-1 ring-inset ring-white/15 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        // Fallback gets a slightly more opaque gradient for readability behind initials
  "flex size-full items-center justify-center rounded-full bg-gradient-to-br from-primary/50 via-primary/30 to-accent/50 text-white font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
