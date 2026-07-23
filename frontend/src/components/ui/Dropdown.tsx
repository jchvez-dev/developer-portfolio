import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Text } from "./Text";

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

export const Dropdown = <T extends string | number>({
  value,
  options,
  disabled,
  onChange,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
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
        <Text as="span" className="min-w-0 flex-1 truncate text-left">{value}</Text>
        {open ? <HiChevronUp className="size-4 shrink-0" /> : <HiChevronDown className="size-4 shrink-0" />}
      </Button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded border border-gray-300 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="secondary"
              size="sm"
              shape="square"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full justify-start rounded-none border-0 py-1 text-left"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
