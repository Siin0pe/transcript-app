import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-none px-3 py-1 border-0 border-b-2 border-input bg-transparent text-base font-medium transition-[border-color,background-color] outline-none placeholder:text-muted-foreground hover:bg-muted/50 focus-visible:border-ring focus-visible:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
