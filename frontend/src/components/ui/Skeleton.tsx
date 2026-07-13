import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  className?: string;
}

const skeleton = cva("animate-pulse bg-gray-200 dark:bg-gray-800", {
  variants: {
    variant: {
      text: "h-4 w-full rounded",
      circle: "h-10 w-10 rounded-full",
      rect: "h-20 w-full rounded-lg",
    },
  },
  defaultVariants: {
    variant: "text",
  },
});

export const Skeleton = ({ variant, className }: SkeletonProps) => (
  <div className={cn(skeleton({ variant }), className)} />
);
