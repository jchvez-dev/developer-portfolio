import { Text } from "../../../components/ui";
import type { Layer } from "../types";

interface Props {
  layer: Layer;
}

export const PositionInfo = ({ layer }: Props) => (
  <div>
    <Text small muted className="mb-1 block">
      Position
    </Text>
    <Text small muted className="text-xs">
      X: {layer.x} | Y: {layer.y} | W: {layer.width} | H: {layer.height}
    </Text>
  </div>
);
