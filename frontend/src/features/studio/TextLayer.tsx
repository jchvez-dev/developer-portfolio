import { useCallback, useRef, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  InlineEditor,
  Bold,
  Essentials,
  FontSize,
  Italic,
  List,
  Paragraph,
  Undo,
  EditorWatchdog,
  ContextWatchdog,
  type Editor,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import type { TextLayer } from './types';
import { Button } from '../../components/ui';

const InlineEditorInstance = Object.assign(InlineEditor, { EditorWatchdog, ContextWatchdog });

const EDITOR_CONFIG = {
  licenseKey: 'GPL' as const,
  plugins: [Bold, Essentials, FontSize, Italic, List, Paragraph, Undo],
  fontSize: {
    options: [
      { title: '12px', model: '12px' },
      { title: '16px', model: '16px' },
      { title: '24px', model: '24px' },
      { title: '32px', model: '32px' },
      { title: '48px', model: '48px' },
      { title: '64px', model: '64px' },
    ],
  },
};

interface TextLayerProps {
  layer: TextLayer;
  isFocused: boolean;
  onChange: (id: string, html: string) => void;
  onRemove: (id: string) => void;
  onFocus: (layerId: string, editor: Editor) => void;
  onBlur: () => void;
  onResize: (id: string, width: number, height: number) => void;
}

export const TextLayerComponent = ({ layer, isFocused, onChange, onRemove, onFocus, onBlur, onResize }: TextLayerProps) => {
  const handleChange = useCallback(
    (_event: unknown, editor: Editor) => {
      onChange(layer.id, editor.getData());
    },
    [layer.id, onChange],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(layer.id);
    },
    [layer.id, onRemove],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      onResize(layer.id, Math.round(width), Math.round(height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layer.id, onResize]);

  const handleDeleteMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute"
      style={{
        left: layer.x,
        top: layer.y,
        zIndex: layer.zIndex,
        width: 'fit-content',
      }}
    >
      {isFocused && (
        <Button
          size="sm"
          shape="pill"
          onMouseDown={handleDeleteMouseDown}
          onClick={handleRemove}
          className="absolute -right-2 -top-2 z-50 size-5 p-0 bg-red-500 text-xs text-white hover:bg-red-600"
          aria-label="Remove layer"
        >
          x
        </Button>
      )}
      <CKEditor
        editor={InlineEditorInstance}
        config={EDITOR_CONFIG}
        data={layer.html}
        onFocus={(_event, editor) => onFocus(layer.id, editor)}
        onBlur={onBlur}
        onChange={handleChange}
      />
    </div>
  );
};
