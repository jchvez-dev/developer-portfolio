import { Dropdown, Text } from "../../../components/ui";
import type { TextLayerData } from "../types";
import { FontSizeDropdown } from "../FontSizeDropdown";
import { useCanvasStore } from "../canvas/store";

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter" },
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "monospace", value: "monospace" },
  { label: "sans-serif", value: "sans-serif" },
];

interface Props {
  layer: TextLayerData;
}

export const FontProperties = ({ layer }: Props) => {
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  return (
    <>
      <div>
        <Text small muted className="mb-1 block">
          Font Family
        </Text>
        <Dropdown
          value={layer.fontFamily}
          options={FONT_FAMILIES}
          onChange={(val) => updateLayer(layer.id, { fontFamily: val })}
        />
      </div>

      <div>
        <Text small muted className="mb-1 block">
          Font Size
        </Text>
        <FontSizeDropdown />
      </div>
    </>
  );
};
