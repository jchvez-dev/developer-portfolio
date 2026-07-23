import { useCallback, useRef } from "react";
import { HiArrowsPointingOut, HiPhoto } from "react-icons/hi2";
import { Button } from "../../components/ui";
import type { ImageLayerData } from "./types";
import { useCanvasStore } from "./canvas/store";

interface ImageLayerProps {
  layer: ImageLayerData;
}

export const ImageLayerComponent = ({ layer }: ImageLayerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const selectLayer = useCanvasStore((s) => s.selectLayer);
  const updateLayer = useCanvasStore((s) => s.updateLayer);

  const isFocused = focusedLayerId === layer.id;

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
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [layer.x, layer.y, layer.id, updateLayer, clampX, clampY],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectLayer(layer.id);
    },
    [layer.id, selectLayer],
  );

  return (
    <div
      ref={rootRef}
      className="absolute"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        zIndex: layer.zIndex,
        opacity: layer.opacity ?? 1,
        backgroundColor: layer.backgroundColor ?? "transparent",
        ...(isFocused ? { outline: "2px solid hsl(218, 81.8%, 56.9%)" } : {}),
      }}
      onClick={handleClick}
    >
      {layer.src ? (
        <img
          src={`/api/v1/canvas/images/${layer.src}`}
          alt={layer.name}
          className="h-full w-full rounded pointer-events-none select-none"
          style={{ objectFit: "cover" }}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
          <HiPhoto className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {isFocused && layer.src && (
        <Button
          size="sm"
          shape="pill"
          variant="secondary"
          icon={<HiArrowsPointingOut className="h-4 w-4" />}
          className={`absolute z-50 !cursor-grab bg-white/90 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 left-1/2 -translate-x-1/2 ${
            layer.y < 32 ? "-bottom-8" : "-top-8"
          }`}
          aria-label="Drag layer"
          onPointerDown={handleDragPointerDown}
        />
      )}

      {isFocused && !layer.src && (
        <div
          className="absolute inset-0"
          style={{
            outline: "2px solid hsl(218, 81.8%, 56.9%)",
            borderRadius: "0.25rem",
          }}
        />
      )}
    </div>
  );
};
