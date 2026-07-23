import { ColorPicker, Button } from "../../components/ui";
import { HiPaintBrush, HiXMark } from "react-icons/hi2";

interface BackgroundColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
}

export const BackgroundColorPicker = ({
  value,
  onChange,
  allowTransparent = true,
}: BackgroundColorPickerProps) => {
  const displayValue = value && value !== "transparent" ? value : "#ffffff";

  return (
    <div className="flex items-center gap-1">
      <ColorPicker
        value={displayValue}
        onChange={onChange}
        icon={<HiPaintBrush className="h-4 w-4" />}
      />
      {allowTransparent && value && value !== "transparent" && (
        <Button
          variant="secondary"
          size="sm"
          icon={<HiXMark className="h-3 w-3" />}
          onMouseDown={(e) => {
            e.preventDefault();
            onChange("transparent");
          }}
          title="Remove background"
        />
      )}
    </div>
  );
};
