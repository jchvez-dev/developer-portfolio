import { Heading, Slider } from "../../components/ui";
import type { Layer } from "./types";
import { PositionInfo } from "./properties/PositionInfo";
import { FontProperties } from "./properties/FontProperties";
import { StyleButtons } from "./properties/StyleButtons";
import { ColorSection } from "./properties/ColorSection";
import { useCanvasStore } from "./canvas/store";

interface Props {
  layer: Layer;
}

export const LayerPropertiesPanel = ({ layer }: Props) => {
  const isText = layer.type === "text";
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  return (
    <div className="h-full border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <Heading
        as="h4"
        className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        Properties
      </Heading>

      <div className="space-y-3">
        {isText ? (
          <>
            <PositionInfo layer={layer} />
            <FontProperties layer={layer} />
            <StyleButtons />
            <ColorSection layer={layer} />
          </>
        ) : (
          <>
            <PositionInfo layer={layer} />
            <ColorSection layer={layer} />
            <Slider
              label="Opacity"
              value={layer.opacity ?? 1}
              min={0}
              max={1}
              step={0.05}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              onChange={(val) => updateLayer(layer.id, { opacity: val })}
            />
          </>
        )}
      </div>
    </div>
  );
};
