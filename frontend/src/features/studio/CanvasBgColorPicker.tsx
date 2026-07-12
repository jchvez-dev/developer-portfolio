import { PaintBrushIcon } from "@heroicons/react/24/outline";
import { ColorPicker } from "../../components/ui";
import { useCanvasStore } from "./canvas/store";

export const CanvasBgColorPicker = () => {
  const backgroundColor = useCanvasStore((s) => s.backgroundColor);
  const setBackgroundColor = useCanvasStore((s) => s.setBackgroundColor);

  return (
    <ColorPicker
      value={backgroundColor}
      onChange={setBackgroundColor}
      icon={<PaintBrushIcon className="h-4 w-4" />}
    />
  );
};
