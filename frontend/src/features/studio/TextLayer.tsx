import { useCallback, useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  InlineEditor,
  Bold,
  Essentials,
  FontColor,
  FontSize,
  Italic,
  List,
  Paragraph,
  Undo,
  EditorWatchdog,
  ContextWatchdog,
  type Editor,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import type { TextLayerData } from "./types";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/ui";
import { useCanvasStore, editorRegistry } from "./canvas/store";

const InlineEditorInstance = Object.assign(InlineEditor, {
  EditorWatchdog,
  ContextWatchdog,
});

const EDITOR_CONFIG = {
  licenseKey: "GPL" as const,
  plugins: [
    Bold,
    Essentials,
    FontColor,
    FontSize,
    Italic,
    List,
    Paragraph,
    Undo,
  ],
  fontSize: {
    options: [
      { title: "12px", model: "12px" },
      { title: "16px", model: "16px" },
      { title: "24px", model: "24px" },
      { title: "32px", model: "32px" },
      { title: "48px", model: "48px" },
      { title: "64px", model: "64px" },
    ],
  },
};

interface TextLayerProps {
  layer: TextLayerData;
}

export const TextLayerComponent = ({ layer }: TextLayerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const setFocus = useCanvasStore((s) => s.setFocus);
  const clearFocus = useCanvasStore((s) => s.clearFocus);
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  const isFocused = focusedLayerId === layer.id;
  useEffect(() => {
    return () => {
      editorRegistry.delete(layer.id);
    };
  }, [layer.id]);

  useEffect(() => {
    if (isFocused && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isFocused]);

  const handleChange = useCallback(
    (_event: unknown, editor: Editor) => {
      updateLayer(layer.id, { html: editor.getData() });
    },
    [layer.id, updateLayer],
  );

  const clampX = useCallback(
    (x: number) => Math.max(0, Math.min(x, canvasWidth - layer.width)),
    [canvasWidth, layer.width],
  );

  const clampY = useCallback(
    (y: number) => Math.max(0, Math.min(y, canvasHeight - layer.height)),
    [canvasHeight, layer.height],
  );

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const el = rootRef.current;
      if (!el) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = layer.x;
      const origY = layer.y;
      let dx = 0;
      let dy = 0;

      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";

      const onMove = (ev: PointerEvent) => {
        dx = ev.clientX - startX;
        dy = ev.clientY - startY;
        const clampedX = clampX(origX + dx);
        const clampedY = clampY(origY + dy);
        const visualDx = clampedX - origX;
        const visualDy = clampedY - origY;
        el.style.transform = `translate(${visualDx}px, ${visualDy}px)`;
      };

      const onUp = () => {
        el.style.transform = "";
        el.style.cursor = "";
        const clampedX = clampX(origX + dx);
        const clampedY = clampY(origY + dy);
        el.style.left = `${clampedX}px`;
        el.style.top = `${clampedY}px`;
        updateLayer(layer.id, {
          x: Math.round(clampedX),
          y: Math.round(clampedY),
        });
        if (editorRef.current) {
          setFocus(layer.id, editorRef.current);
          editorRef.current.focus();
        }
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [layer.x, layer.y, layer.id, updateLayer, setFocus, clampX, clampY],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      updateLayer(layer.id, {
        width: Math.round(width),
        height: Math.round(height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layer.id, updateLayer]);

  return (
    <div
      ref={rootRef}
      className="absolute"
      style={{
        left: layer.x,
        top: layer.y,
        zIndex: layer.zIndex,
        width: "fit-content",
        opacity: layer.opacity ?? 1,
      }}
    >
      {layer.backgroundColor && layer.backgroundColor !== "transparent" && (
        <div
          className="absolute inset-0 pointer-events-none -z-1"
          style={{ backgroundColor: layer.backgroundColor }}
        />
      )}
      {isFocused && (
        <Button
          size="sm"
          shape="pill"
          variant="secondary"
          icon={<ArrowsPointingOutIcon className="h-4 w-4" />}
          className={`absolute z-50 !cursor-grab bg-white/90 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 left-1/2 -translate-x-1/2 ${
            layer.y < 32 ? "-bottom-8" : "-top-8"
          }`}
          aria-label="Drag layer"
          onPointerDown={handleDragPointerDown}
        />
      )}
      <CKEditor
        editor={InlineEditorInstance}
        config={EDITOR_CONFIG}
        data={layer.html}
        onReady={(editor) => {
          editorRef.current = editor;
          editorRegistry.set(layer.id, editor);
          if (isFocused) editor.focus();
        }}
        onFocus={(_event, editor) => {
          editorRef.current = editor;
          setFocus(layer.id, editor);
        }}
        onBlur={clearFocus}
        onChange={handleChange}
      />
    </div>
  );
};
