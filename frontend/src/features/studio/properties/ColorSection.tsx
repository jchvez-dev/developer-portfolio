import { Text } from "../../../components/ui";
import type { TextLayerData } from "../types";
import { TextColorPicker } from "../TextColorPicker";
import { TextBgColorPicker } from "../TextBgColorPicker";

interface Props {
  layer: TextLayerData;
}

export const ColorSection = ({ layer }: Props) => (
  <div className="grid grid-cols-2 gap-2">
    <div>
      <Text small muted className="mb-1 block">
        Color
      </Text>
      <TextColorPicker />
    </div>
    <div>
      <Text small muted className="mb-1 block">
        Background
      </Text>
      <TextBgColorPicker layer={layer} />
    </div>
  </div>
);
