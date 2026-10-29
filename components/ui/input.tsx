import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-none px-3 py-1 border-0 border-b-2 border-yellow-300 bg-transparent text-base font-medium transition-[border-color,background-color] outline-none placeholder:text-neutral-500 hover:bg-white/5 focus-visible:border-cyan-400 focus-visible:bg-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-600",
        className
      )}
      {...props}
    />
  )
}

export { Input }
