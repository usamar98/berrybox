import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b12] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,#4a050b_0%,#991b1b_48%,#f87171_100%)] text-white shadow-[0_0_32px_rgba(185,28,28,0.28)] hover:brightness-110",
        secondary:
          "border border-white/12 bg-white/[0.06] text-white hover:border-[var(--teal)]/50 hover:bg-white/[0.1]",
        ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
        coral:
          "bg-[linear-gradient(135deg,#5f0f0f_0%,#b91c1c_55%,#fb7185_100%)] text-white shadow-[0_0_30px_rgba(185,28,28,0.24)] hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-[3.25rem] px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
