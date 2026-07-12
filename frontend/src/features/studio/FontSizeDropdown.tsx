import { useState, useEffect } from 'react';
import { Dropdown } from '../../components/ui';
import { useCanvasStore, editorRegistry } from './canvas/store';

const FONT_SIZES = ['12px', '16px', '24px', '32px', '48px', '64px'];

export const FontSizeDropdown = () => {
  const focusedEditor = useCanvasStore(s => s.focusedEditor);
  const focusedLayerId = useCanvasStore(s => s.focusedLayerId);
  const [currentSize, setCurrentSize] = useState('16px');

  useEffect(() => {
    const editor = focusedEditor ?? (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);
    if (!editor) return;

    const selection = editor.model.document.selection;
    const update = () => {
      const size = selection.getAttribute('fontSize') as string | null;
      setCurrentSize(size ?? '--');
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
    <Dropdown
      value={currentSize}
      options={FONT_SIZES.map(s => ({ label: s, value: s }))}
      onChange={(v) => {
        if (v === '--') return;
        setCurrentSize(v);
        const editor = focusedEditor ?? (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);
        editor?.execute('fontSize', { value: v });
      }}
    />
  );
};
