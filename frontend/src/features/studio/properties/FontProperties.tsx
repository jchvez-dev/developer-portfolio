import { useState, useEffect } from "react";
import { Dropdown, Text } from "../../../components/ui";
import type { TextLayerData } from "../types";
import { FontSizeDropdown } from "../FontSizeDropdown";
import { useCanvasStore, editorRegistry } from "../canvas/store";

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Montserrat", value: "Montserrat" },

];

interface Props {
  layer: TextLayerData;
}

export const FontProperties = ({ layer }: Props) => {
  const updateLayer = useCanvasStore((s) => s.updateLayer);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const focusedEditor = useCanvasStore((s) => s.focusedEditor);

  const [currentFont, setCurrentFont] = useState(layer.fontFamily);

  useEffect(() => {
    const editor =
      focusedEditor ??
      (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);
    if (!editor) return;

    const selection = editor.model.document.selection;
    const update = () => {
      const font = selection.getAttribute("fontFamily") as string | null;
      if (font) setCurrentFont(font);
    };

    update();
    selection.on("change:range", update);
    selection.on("change:attribute", update);

    return () => {
      selection.off("change:range", update);
      selection.off("change:attribute", update);
    };
  }, [focusedEditor, focusedLayerId]);

  const handleChange = (val: string) => {
    setCurrentFont(val);
    updateLayer(layer.id, { fontFamily: val });
    const editor =
      focusedEditor ??
      (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);
    editor?.execute("fontFamily", { value: val });
  };

  return (
    <>
      <div>
        <Text small muted className="mb-1 block">
          Font Family
        </Text>
        <Dropdown
          value={currentFont}
          options={FONT_FAMILIES}
          onChange={handleChange}
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
