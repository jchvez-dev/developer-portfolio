import { useState, useCallback } from "react";
import { useCanvasStore, editorRegistry } from "./canvas/store";
import { Button } from "../../components/ui";
import { ImageUploader } from "./ImageUploader";

const toolbarBtns = [
  { label: "Undo", cmd: "undo" },
  { label: "Redo", cmd: "redo" },
];

export const CanvasToolbar = () => {
  const focusedEditor = useCanvasStore((s) => s.focusedEditor);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const addLayer = useCanvasStore((s) => s.addLayer);
  const updateLayer = useCanvasStore((s) => s.updateLayer);
  const [showImageUploader, setShowImageUploader] = useState(false);

  const getEditor = () =>
    focusedEditor ??
    (focusedLayerId ? (editorRegistry.get(focusedLayerId) ?? null) : null);

  const exec = (cmd: string, payload?: unknown) => {
    const editor = getEditor();
    if (editor) {
      if (payload !== undefined) editor.execute(cmd, payload);
      else editor.execute(cmd);
    }
  };

  const handleImageUploaded = useCallback(
    (assetUrl: string, origW: number, origH: number) => {
      const layerId = addLayer("image");
      const MAX_LAYER_SIZE = 400;
      const scale = Math.min(MAX_LAYER_SIZE / origW, MAX_LAYER_SIZE / origH, 1);
      const width = Math.round(origW * scale);
      const height = Math.round(origH * scale);
      updateLayer(layerId, { src: assetUrl, width, height });
      setShowImageUploader(false);
    },
    [addLayer, updateLayer],
  );

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1">
      <Button variant="primary" size="sm" onClick={() => addLayer("text")}>
        + Add Text
      </Button>

      <Button size="sm" onClick={() => setShowImageUploader(true)}>
        + Add Image
      </Button>

      {toolbarBtns.map((btn) => (
        <Button
          key={btn.label}
          variant="secondary"
          onMouseDown={(e) => {
            e.preventDefault();
            exec(btn.cmd);
          }}
          size="sm"
        >
          {btn.label}
        </Button>
      ))}

      <ImageUploader
        open={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        onUploaded={handleImageUploaded}
      />
    </div>
  );
};
