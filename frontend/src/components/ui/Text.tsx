import { cva } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TextProps {
  as?: ElementType;
  children: ReactNode;
  muted?: boolean;
  small?: boolean;
  className?: string;
}

const text = cva("text-gray-600 dark:text-gray-400", {
  variants: {
    muted: {
      true: "text-gray-400",
    },
    small: {
      true: "text-sm",
    },
  },
});

export const Text = ({ as: Tag = "p", children, muted, small, className }: TextProps) => (
  <Tag className={cn(text({ muted, small }), className)}>{children}</Tag>
);
