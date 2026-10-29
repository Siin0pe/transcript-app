import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-0 border-l-2 border-yellow-300 bg-white/5 px-3 py-2.5 leading-relaxed text-base font-medium transition-[border-color,background-color] outline-none placeholder:text-neutral-500 hover:bg-white/5 focus-visible:border-cyan-400 focus-visible:bg-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-600",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
