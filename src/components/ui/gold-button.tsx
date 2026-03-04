"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const goldButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-widest uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#F0D060] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] focus-visible:ring-[#D4AF37]",
        outline:
          "border border-[#D4AF37] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] focus-visible:ring-[#D4AF37]",
        ghost:
          "text-[#F5F5F5]/70 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] focus-visible:ring-[#D4AF37]",
        emerald:
          "bg-[#1A1A1A] text-[#F5F5F5] border border-[rgba(212,175,55,0.3)] hover:border-[rgba(212,175,55,0.6)] hover:bg-[#222222] focus-visible:ring-[#D4AF37]",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-6 text-xs",
        lg: "h-12 px-8 text-sm",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface GoldButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof goldButtonVariants> {
  asChild?: boolean;
}

const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(goldButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
GoldButton.displayName = "GoldButton";

// Animated version with Framer Motion
const GoldButtonAnimated = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex"
      >
        <Comp
          ref={ref}
          className={cn(goldButtonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    );
  }
);
GoldButtonAnimated.displayName = "GoldButtonAnimated";

export { GoldButton, GoldButtonAnimated, goldButtonVariants };
