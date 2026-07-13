import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "bordered";
  className?: string;
}

const card = cva("rounded-lg border p-4", {
  variants: {
    variant: {
      default:
        "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50",
      elevated: "border-transparent bg-white shadow-md dark:bg-gray-900",
      bordered: "border-gray-300 bg-transparent dark:border-gray-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Card = ({ children, variant, className }: CardProps) => (
  <div className={cn(card({ variant }), className)}>{children}</div>
);
