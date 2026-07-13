import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
}

const heading = cva("", {
  variants: {
    level: {
      h1: "text-5xl font-bold tracking-tight",
      h2: "text-3xl font-bold tracking-tight",
      h3: "text-lg font-semibold",
      h4: "text-base font-medium",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

export const Heading = ({ as: Tag = "h2", children, className }: HeadingProps) => (
  <Tag className={cn(heading({ level: Tag }), className)}>{children}</Tag>
);
