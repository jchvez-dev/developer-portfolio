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
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
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

  const handleDragPointerDown = useCallback((e: React.PointerEvent) => {
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
    el.style.cursor = 'grabbing';

    const onMove = (ev: PointerEvent) => {
      dx = ev.clientX - startX;
      dy = ev.clientY - startY;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const onUp = () => {
      el.style.transform = '';
      el.style.cursor = '';
      const newX = origX + dx;
      const newY = origY + dy;
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      updateLayer(layer.id, { x: Math.round(newX), y: Math.round(newY) });
      if (editorRef.current) {
        setFocus(layer.id, editorRef.current);
        editorRef.current.focus();
      }
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  }, [layer.x, layer.y, layer.id, updateLayer, setFocus]);

  useEffect(() => {
    const el = rootRef.current;
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
      ref={rootRef}
      className="absolute"
      style={{
        left: layer.x,
        top: layer.y,
        zIndex: layer.zIndex,
        width: 'fit-content',
      }}
    >
      {isFocused && (
        <>
          <Button
            size="sm"
            shape="pill"
            variant="secondary"
            icon={<ArrowsPointingOutIcon className="h-4 w-4" />}
            className="absolute -left-5 -top-5 z-50 !cursor-grab bg-white/90 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700"
            aria-label="Drag layer"
            onPointerDown={handleDragPointerDown}
          />
          <Button
            size="sm"
            shape="pill"
            icon={<XMarkIcon className="h-4 w-4" />}
            className="absolute -right-5 -top-5  z-50 p-0 bg-red-500 text-white hover:bg-red-600"
            aria-label="Remove layer"
            onMouseDown={handleDeleteMouseDown}
            onClick={handleRemove}
          />
        </>
      )}
      <CKEditor
        editor={InlineEditorInstance}
        config={EDITOR_CONFIG}
        data={layer.html}
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
