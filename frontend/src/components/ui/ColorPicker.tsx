import { useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  icon?: ReactNode;
  label?: string;
}

export const ColorPicker = ({ value, onChange, icon, label }: ColorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="relative"
      onMouseDown={(e) => {
        e.preventDefault();
        inputRef.current?.click();
      }}
    >
      {icon ?? <span className="font-medium">{label ?? "A"}</span>}
      <span
        className="inline-block w-3 h-3 rounded-sm ml-1 border border-gray-300"
        style={{ backgroundColor: value }}
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
        onInput={(e) => onChange(e.currentTarget.value)}
      />
    </Button>
  );
};
