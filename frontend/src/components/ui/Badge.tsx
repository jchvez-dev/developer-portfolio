import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "success";
  className?: string;
}

const badge = cva("rounded-full px-3 py-1 text-sm font-medium", {
  variants: {
    variant: {
      default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      accent: "bg-accent/10 text-accent dark:bg-accent/20",
      success: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:bg-emerald-400/10 dark:border-emerald-400/20 dark:text-emerald-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Badge = ({ children, variant, className }: BadgeProps) => {
  return (
    <span className={cn(badge({ variant }), className)}>
      {children}
    </span>
  );
};
