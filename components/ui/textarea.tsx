import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-0 border-l-2 border-input bg-muted/40 px-3 py-2.5 leading-relaxed bg-transparent text-base font-medium transition-[border-color,background-color] outline-none placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:border-cyan focus-visible:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red mob:min-h-11",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
