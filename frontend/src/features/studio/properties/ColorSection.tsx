import { Text } from "../../../components/ui";
import type { Layer } from "../types";
import { TextColorPicker } from "../TextColorPicker";
import { BackgroundColorPicker } from "../BackgroundColorPicker";
import { useCanvasStore } from "../canvas/store";

interface Props {
  layer: Layer;
}

export const ColorSection = ({ layer }: Props) => {
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  return (
    <div className="grid grid-cols-2 gap-2">
      {layer.type == "text" && (
        <div>
          <Text small muted className="mb-1 block">
            Color
          </Text>
          <TextColorPicker />
        </div>
      )}
      <div>
        <Text small muted className="mb-1 block">
          Background
        </Text>
        <BackgroundColorPicker
          value={layer.backgroundColor ?? "transparent"}
          onChange={(val) => updateLayer(layer.id, { backgroundColor: val })}
        />
      </div>
    </div>
  );
};
