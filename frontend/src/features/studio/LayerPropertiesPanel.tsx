import { Heading } from "../../components/ui";
import type { TextLayerData } from "./types";
import { PositionInfo } from "./properties/PositionInfo";
import { FontProperties } from "./properties/FontProperties";
import { StyleButtons } from "./properties/StyleButtons";
import { ColorSection } from "./properties/ColorSection";

interface Props {
  layer: TextLayerData;
}

export const LayerPropertiesPanel = ({ layer }: Props) => (
  <div className="h-full border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
    <Heading
      as="h4"
      className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
    >
      Properties
    </Heading>

    <div className="space-y-3">
      <PositionInfo layer={layer} />
      <FontProperties layer={layer} />
      <StyleButtons />
      <ColorSection layer={layer} />
    </div>
  </div>
);
