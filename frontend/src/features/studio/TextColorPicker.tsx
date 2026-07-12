import { ColorPicker } from "../../components/ui";
import { useTextColor } from "./hooks/useTextColor";

export const TextColorPicker = () => {
  const { textColor, updateColor } = useTextColor();

  return <ColorPicker value={textColor} onChange={updateColor} />;
};
