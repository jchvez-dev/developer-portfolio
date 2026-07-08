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
import type { TextLayerData } from './types';
import { Button } from '../../components/ui';
import { useCanvasStore } from './canvas/store';

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
  layer: TextLayerData;
}

export const TextLayerComponent = ({ layer }: TextLayerProps) => {
  const focusedLayerId = useCanvasStore(s => s.focusedLayerId);
  const setFocus = useCanvasStore(s => s.setFocus);
  const clearFocus = useCanvasStore(s => s.clearFocus);
  const updateLayer = useCanvasStore(s => s.updateLayer);
  const resizeLayer = useCanvasStore(s => s.resizeLayer);
  const requestDelete = useCanvasStore(s => s.requestDelete);

  const isFocused = focusedLayerId === layer.id;

  const handleChange = useCallback(
    (_event: unknown, editor: Editor) => {
      updateLayer(layer.id, { html: editor.getData() });
    },
    [layer.id, updateLayer],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      requestDelete(layer.id);
    },
    [layer.id, requestDelete],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      resizeLayer(layer.id, Math.round(width), Math.round(height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layer.id, resizeLayer]);

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
        onFocus={(_event, editor) => setFocus(layer.id, editor)}
        onBlur={clearFocus}
        onChange={handleChange}
      />
    </div>
  );
};
