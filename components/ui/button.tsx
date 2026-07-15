// import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg" | "sm";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        // className={cn(
        //   "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50",

        //   // Variants
        //   variant === "default" &&
        //     "bg-indigo-600 text-white hover:bg-indigo-700",
        //   variant === "outline" &&
        //     "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
        //   variant === "ghost" && "hover:bg-slate-100 text-slate-700",

        //   // Sizes
        //   size === "default" && "h-11 px-6 text-sm",
        //   size === "lg" && "h-14 px-8 text-lg",
        //   size === "sm" && "h-9 px-4 text-sm",

        //   className
        // )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
