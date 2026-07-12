import { ColorPicker, Button } from "../../components/ui";
import { PaintBrushIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { TextLayerData } from "./types";
import { useCanvasStore } from "./canvas/store";

interface Props {
  layer: TextLayerData;
}

export const TextBgColorPicker = ({ layer }: Props) => {
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  return (
    <div className="flex items-center gap-1">
      <ColorPicker
        value={
          layer.backgroundColor && layer.backgroundColor !== "transparent"
            ? layer.backgroundColor
            : "#ffffff"
        }
        onChange={(val) => updateLayer(layer.id, { backgroundColor: val })}
        icon={<PaintBrushIcon className="h-4 w-4" />}
      />
      {layer.backgroundColor && layer.backgroundColor !== "transparent" && (
        <Button
          variant="secondary"
          size="sm"
          icon={<XMarkIcon className="h-3 w-3" />}
          onMouseDown={(e) => {
            e.preventDefault();
            updateLayer(layer.id, { backgroundColor: "transparent" });
          }}
          title="Remove background"
        />
      )}
    </div>
  );
};
