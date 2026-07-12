import { useRef, useState, useCallback, type DragEvent } from "react";
import { Heading, Text } from "../../components/ui";
import { useCanvasStore } from "./canvas/store";
import { LayerItem } from "./LayerItem";

export const LayerPanel = () => {
  const layers = useCanvasStore((s) => s.layers);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const selectLayer = useCanvasStore((s) => s.selectLayer);
  const requestDelete = useCanvasStore((s) => s.requestDelete);
  const updateLayer = useCanvasStore((s) => s.updateLayer);
  const reorderLayer = useCanvasStore((s) => s.reorderLayer);

  const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
  const dragIndex = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: DragEvent) => {
      dragIndex.current = index;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const handleDragOver = useCallback(
    (index: number) => (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropIndex(index);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (toVisualIndex: number) => (e: DragEvent) => {
      e.preventDefault();
      const fromVisualIndex = dragIndex.current;
      if (fromVisualIndex !== null && fromVisualIndex !== toVisualIndex) {
        reorderLayer(fromVisualIndex, toVisualIndex);
      }
      dragIndex.current = null;
      setDropIndex(null);
    },
    [reorderLayer],
  );

  const handleDragEnd = useCallback(() => {
    dragIndex.current = null;
    setDropIndex(null);
  }, []);

  const handleRename = useCallback(
    (id: string, name: string) => updateLayer(id, { name }),
    [updateLayer],
  );

  return (
    <div className="h-full border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <Heading
        as="h4"
        className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        Layers{sorted.length > 0 && ` (${sorted.length})`}
      </Heading>
      {sorted.length === 0 ? (
        <Text muted small className="text-xs">
          No layers
        </Text>
      ) : (
        <ul className="flex flex-col overflow-y-auto space-y-1 h-9/10 scrollbar-thin scrollbar-thumb-gray-500">
          {sorted.map((layer, index) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isFocused={focusedLayerId === layer.id}
              isDropTarget={dropIndex === index}
              onSelect={selectLayer}
              onDelete={requestDelete}
              onRename={handleRename}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
