
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

// Use Dopamind brand: 
// - Track: bg-input when off, bg-mint-green when on
// - Thumb: bg-white + blue border when off, bg-mint-green + white border when on, NEVER yellow.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Track styles
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // bg-mint-green for checked, input for unchecked
      "data-[state=checked]:bg-mint-green data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb: transition, rounded, size
        "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform",
        // Blue border for thumb always
        "border-2",
        // Move thumb right when checked
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        // Thumb color: mint when checked, white when unchecked
        "data-[state=checked]:bg-mint-green data-[state=unchecked]:bg-white",
        // Border: white when checked, blue when unchecked for visibility
        "data-[state=checked]:border-white data-[state=unchecked]:border-deep-blue"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

