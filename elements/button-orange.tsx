import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonOrangeVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border border-[#905320] bg-gradient-to-br from-[#4D3C32] to-[#342720] text-white rounded-full hover:border-[#4B372C] hover:shadow-[0_0_20px_rgba(144,83,32,0.4)]",
        light: "border border-[#905320] bg-gradient-to-br from-[#4D3C32]/60 to-[#342720]/60 text-white rounded-full hover:from-[#4D3C32] hover:to-[#342720]",
        outline: "border-2 border-[#905320] bg-transparent text-[#905320] rounded-full hover:bg-[#4D3C32]/20 hover:border-[#4B372C]",
        ghost: "text-[#905320] rounded-full hover:bg-[#4D3C32]/30 hover:text-[#905320]",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonOrangeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonOrangeVariants> {}

const ButtonOrange = React.forwardRef<HTMLButtonElement, ButtonOrangeProps>(
  ({ className, variant, size, ...props }, ref) => {
    if (variant === "default") {
      return (
        <div className="relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#905320] via-[#905320] to-[#4b372c]">
          <button
            className={cn(buttonOrangeVariants({ variant, size, className }), "rounded-full")}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    return (
      <button
        className={cn(buttonOrangeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ButtonOrange.displayName = "ButtonOrange"

export { ButtonOrange, buttonOrangeVariants }
