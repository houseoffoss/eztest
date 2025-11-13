import * as React from "react"
import { cn } from "@/lib/utils"

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  dense?: boolean
  separator?: boolean
}

export function FilterBar({ children, dense = false, separator = false, className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4",
        dense ? "py-1" : "py-2",
        separator && "divide-x divide-white/10 [&>*]:pr-3 [&>*+*]:pl-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default FilterBar
