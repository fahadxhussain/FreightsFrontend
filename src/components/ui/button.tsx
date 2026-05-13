import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-active",
        outline:
          "border-hairline bg-canvas text-ink hover:bg-surface-soft",
        secondary:
          "bg-surface-soft text-ink hover:bg-surface-strong",
        ghost:
          "hover:bg-surface-soft hover:text-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-1.5 px-5 rounded-md",
        xs: "h-8 gap-1 rounded-md px-3 text-xs",
        sm: "h-9 gap-1 rounded-md px-4 text-[0.8rem]",
        lg: "h-11 gap-1.5 px-6 rounded-lg text-base",
        icon: "size-9 rounded-md",
        "icon-xs": "size-8 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
