import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-0 border-l-2 border-input bg-muted/50 px-3 py-2.5 leading-relaxed text-base font-medium transition-[border-color,background-color] outline-none placeholder:text-muted-foreground hover:bg-muted/50 focus-visible:border-ring focus-visible:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
