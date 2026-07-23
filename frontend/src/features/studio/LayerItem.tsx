import { useRef, useState, useCallback, type DragEvent, type KeyboardEvent } from "react";
import { HiBars3, HiDocumentText, HiPhoto, HiXMark } from "react-icons/hi2";
import { Button } from "../../components/ui";
import type { Layer, LayerType } from "./types";

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
      return <HiDocumentText className={className} />;
    case "image":
      return <HiPhoto className={className} />;
  }
};

interface LayerItemProps {
  layer: Layer;
  isFocused: boolean;
  isDropTarget: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export const LayerItem = ({
  layer,
  isFocused,
  isDropTarget,
  onSelect,
  onDelete,
  onRename,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: LayerItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setEditValue(layer.name);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [layer.name]);

  const finishEditing = useCallback(() => {
    if (editing && editValue.trim()) {
      onRename(layer.id, editValue.trim());
    }
    setEditing(false);
  }, [editing, editValue, layer.id, onRename]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        finishEditing();
      } else if (e.key === "Escape") {
        setEditing(false);
      }
    },
    [finishEditing],
  );

  return (
    <li
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(layer.id)}
      className={`
        group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
        ${isFocused ? "bg-accent/10 text-accent" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
        ${isDropTarget ? DRAG_OVER_CLASS : "border-t-2 border-transparent"}
      `}
    >
      <span
        draggable
        onDragStart={onDragStart}
        className="cursor-grab active:cursor-grabbing"
      >
        <HiBars3 className="h-4 w-4 shrink-0 text-gray-400" />
      </span>
      <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-accent bg-transparent px-1 py-0 text-sm outline-none"
          />
        ) : (
          <span
            className="cursor-text"
            onDoubleClick={startEditing}
            title="Double-click to rename"
          >
            {layer.name || "Untitled"}
          </span>
        )}
      </span>
      <LayerTypeIcon type={layer.type} />
      <Button
        size="sm"
        shape="pill"
        variant="danger"
        icon={<HiXMark className="h-3 w-3" />}
        className="!p-1 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(layer.id);
        }}
        aria-label={`Delete ${layer.id}`}
      />
    </li>
  );
};
