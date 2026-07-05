import type { ReactNode } from 'react';

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children: ReactNode;
  className?: string;
}

const styles = {
  h1: 'text-5xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-medium',
};

export const Heading = ({ as: Tag = 'h2', children, className = '' }: HeadingProps) => (
  <Tag className={`${styles[Tag]} ${className}`}>{children}</Tag>
);
