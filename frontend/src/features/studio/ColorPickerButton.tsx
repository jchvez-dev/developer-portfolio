import { useRef, useEffect } from 'react';
import { Button } from '../../components/ui';
import { useCanvasStore, editorRegistry } from './canvas/store';

function normalizeColor(color: string | null | undefined): string {
  if (!color) return '#000000';
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return '#000000';
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

export const ColorPickerButton = () => {
  const focusedEditor = useCanvasStore(s => s.focusedEditor);
  const focusedLayerId = useCanvasStore(s => s.focusedLayerId);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const swatchRef = useRef<HTMLSpanElement>(null);

  const getEditor = () => focusedEditor ?? (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);

  const exec = (cmd: string, payload?: unknown) => {
    const editor = getEditor();
    if (editor) {
      if (payload !== undefined) editor.execute(cmd, payload);
      else editor.execute(cmd);
    }
  };

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;

    const selection = editor.model.document.selection;
    const update = () => {
      const color = selection.getAttribute('fontColor') as string | null;
      if (swatchRef.current) {
        swatchRef.current.style.backgroundColor = color ? normalizeColor(color) : '#000000';
      }
    };

    update();
    selection.on('change:range', update);
    selection.on('change:attribute', update);

    return () => {
      selection.off('change:range', update);
      selection.off('change:attribute', update);
    };
  }, [focusedEditor, focusedLayerId]);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="relative"
      onMouseDown={(e) => {
        e.preventDefault();
        let color = '#000000';
        const editor = getEditor();
        if (editor) {
          try {
            const selectionColor = editor.model.document.selection.getAttribute('fontColor') as string | null;
            if (selectionColor) {
              color = normalizeColor(selectionColor);
            }
          } catch {
            // ignore
          }
        }
        if (swatchRef.current) swatchRef.current.style.backgroundColor = color;
        if (inputRef.current) inputRef.current.value = color;
        inputRef.current?.click();
      }}
    >
      <span className="font-medium">A</span>
      <span
        ref={swatchRef}
        className="inline-block w-3 h-3 rounded-sm ml-1"
        style={{ backgroundColor: '#000000' }}
      />
      <input
        ref={inputRef}
        type="color"
        defaultValue="#000000"
        className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
        onInput={(e) => {
          const val = e.currentTarget.value;
          if (swatchRef.current) swatchRef.current.style.backgroundColor = val;
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            exec('fontColor', { value: val });
          }, 150);
        }}
      />
    </Button>
  );
};
