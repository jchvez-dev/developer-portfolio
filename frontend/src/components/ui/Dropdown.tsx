import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

interface DropdownOption<T extends string | number = string> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string | number = string> {
  value: T;
  options: DropdownOption<T>[];
  disabled?: boolean;
  onChange: (value: T) => void;
}

export const Dropdown = <T extends string | number>({ value, options, disabled, onChange }: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <Button
        variant="secondary"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        className="w-full justify-between px-3 py-1 text-sm"
      >
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <span className="shrink-0">{open ? '▲' : '▼'}</span>
      </Button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded border border-gray-300 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {options.map(opt => (
            <button
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
