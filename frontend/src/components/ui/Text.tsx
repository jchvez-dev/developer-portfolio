import type { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  muted?: boolean;
  small?: boolean;
  className?: string;
}

export const Text = ({ children, muted, small, className = '' }: TextProps) => (
  <p
    className={`${muted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'} ${small ? 'text-sm' : ''} ${className}`}
  >
    {children}
  </p>
);
