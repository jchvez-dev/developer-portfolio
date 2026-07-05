import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Section = ({ id, title, description, children, className = '' }: SectionProps) => (
  <section id={id} className={`mx-auto max-w-3xl py-16 ${className}`}>
    {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
    {description && <p className="mt-4 text-gray-600 dark:text-gray-400">{description}</p>}
    {children}
  </section>
);
