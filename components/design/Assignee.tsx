import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface AssigneeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  email?: string
  src?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { avatar: "size-6", text: "text-xs" },
  md: { avatar: "size-8", text: "text-sm" },
  lg: { avatar: "size-10", text: "text-base" },
}

export function Assignee({ name, email, src, size = "md", className, ...props }: AssigneeProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Avatar className={sizeMap[size].avatar}>
        {src ? <AvatarImage alt={name} src={src} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <div className={cn("text-white", sizeMap[size].text)}>{name}</div>
        {email ? <div className="text-white/60 text-xs">{email}</div> : null}
      </div>
    </div>
  )
}

export default Assignee
