import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "pill";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children?: ReactNode;
}

const button = cva(
  "font-medium transition-colors inline-flex items-center justify-center cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover disabled:opacity-50",
        secondary:
          "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
        danger: "bg-red-500 text-white hover:bg-red-700 disabled:opacity-50",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
      },
      shape: {
        square: "rounded-lg",
        pill: "rounded-full",
      },
      hasIconAndChildren: {
        true: "gap-1.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "square",
    },
  },
);

export const Button = ({
  variant = "primary",
  size = "md",
  shape = "square",
  icon,
  iconPosition = "left",
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        button({ variant, size, shape, hasIconAndChildren: !!(icon && children) }),
        className,
      )}
      {...props}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
};
