import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Heading } from "./Heading";
import { Text } from "./Text";

interface SectionProps {
  id: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Section = ({ id, title, description, children, className }: SectionProps) => (
  <section id={id} className={cn("mx-auto max-w-3xl py-16", className)}>
    {title && <Heading as="h2">{title}</Heading>}
    {description && <Text className="mt-4">{description}</Text>}
    {children}
  </section>
);
