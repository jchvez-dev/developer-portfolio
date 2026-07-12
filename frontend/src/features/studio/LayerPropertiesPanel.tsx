import { useCanvasStore, editorRegistry } from "./canvas/store";
import { Dropdown, Heading, Button, Text } from "../../components/ui";
import { BoldIcon, ItalicIcon } from "@heroicons/react/24/outline";
import type { TextLayerData } from "./types";
import { FontSizeDropdown } from "./FontSizeDropdown";
import { ColorPickerButton } from "./ColorPickerButton";

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

export const LayerPropertiesPanel = ({ layer }: Props) => {
  const updateLayer = useCanvasStore((s) => s.updateLayer);
  const focusedEditor = useCanvasStore((s) => s.focusedEditor);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);

  const getEditor = () => focusedEditor ?? (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);

  const exec = (cmd: string, payload?: unknown) => {
    const editor = getEditor();
    if (editor) {
      if (payload !== undefined) editor.execute(cmd, payload);
      else editor.execute(cmd);
    }
  };

  return (
    <div className="h-full border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <Heading
        as="h4"
        className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        Properties
      </Heading>

      <div className="space-y-3">
        <div>
          <Text small muted className="mb-1 block">
            Position
          </Text>
          <Text small muted className="text-xs">
            X: {layer.x} | Y: {layer.y} | W: {layer.width} | H: {layer.height}
          </Text>
        </div>

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

        <div>
          <Text small muted className="mb-1 block">
            Style
          </Text>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<BoldIcon className="h-4 w-4" />}
              onMouseDown={(e) => {
                e.preventDefault();
                exec("bold");
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<ItalicIcon className="h-4 w-4" />}
              onMouseDown={(e) => {
                e.preventDefault();
                exec("italic");
              }}
            />
          </div>
        </div>

        <div>
          <Text small muted className="mb-1 block">
            Color
          </Text>
          <ColorPickerButton />
        </div>
      </div>
    </div>
  );
};
