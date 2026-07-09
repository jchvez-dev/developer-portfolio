import { useRef, useState, useCallback, type DragEvent } from "react";
import {
  Bars3Icon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button, Heading, Text } from "../../components/ui";
import { useCanvasStore } from "./canvas/store";
import type { LayerType } from "./types";

const DRAG_OVER_CLASS = "border-t-2 border-accent";

interface LayerTypeIconProps {
  type: LayerType;
  className?: string;
}

const LayerTypeIcon = ({
  type,
  className = "h-4 w-4 text-gray-400",
}: LayerTypeIconProps) => {
  switch (type) {
    case "text":
      return <DocumentTextIcon className={className} />;
    case "image":
      return <PhotoIcon className={className} />;
  }
};

export const LayerPanel = () => {
  const layers = useCanvasStore((s) => s.layers);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const selectLayer = useCanvasStore((s) => s.selectLayer);
  const requestDelete = useCanvasStore((s) => s.requestDelete);
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

  if (sorted.length === 0) {
    return (
      <div className="flex w-72 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <Heading
          as="h4"
          className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
        >
          Layers
        </Heading>
        <Text muted small className="text-xs">
          No layers
        </Text>
      </div>
    );
  }

  return (
    <div className="border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <Heading
        as="h4"
        className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        Layers ({sorted.length})
      </Heading>
      <ul className="flex w-72 flex-col overflow-y-auto space-y-1 h-9/10 scrollbar-thin scrollbar-thumb-gray-500">
        {sorted.map((layer, index) => {
          const isFocused = focusedLayerId === layer.id;
          const isDropTarget = dropIndex === index;

          return (
            <li
              key={layer.id}
              onDragOver={handleDragOver(index)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={() => selectLayer(layer.id)}
              className={`
                group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
                ${isFocused ? "bg-accent/10 text-accent" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                ${isDropTarget ? DRAG_OVER_CLASS : "border-t-2 border-transparent"}
              `}
            >
              <span
                draggable
                onDragStart={handleDragStart(index)}
                className="cursor-grab active:cursor-grabbing"
              >
                <Bars3Icon className="h-4 w-4 shrink-0 text-gray-400" />
              </span>
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                {layer.id}
              </span>
              <LayerTypeIcon type={layer.type} />
              <Button
                size="sm"
                shape="pill"
                variant="danger"
                icon={<XMarkIcon className="h-3 w-3" />}
                className="!p-1 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  requestDelete(layer.id);
                }}
                aria-label={`Delete ${layer.id}`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
