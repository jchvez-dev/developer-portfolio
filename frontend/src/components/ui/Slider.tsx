import { cn } from "../../lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (v: number) => string;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider = ({
  value,
  min = 0,
  max = 1,
  step = 0.05,
  label,
  formatValue,
  onChange,
  className,
}: SliderProps) => (
  <div className={cn("flex items-center gap-2", className)}>
    {label && (
      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-12">
        {label}
      </span>
    )}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-emerald-600 dark:accent-emerald-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 dark:[&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow"
    />
    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-8 text-right">
      {formatValue ? formatValue(value) : value}
    </span>
  </div>
);
