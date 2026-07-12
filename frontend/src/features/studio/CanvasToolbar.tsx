import { useCanvasStore, editorRegistry } from './canvas/store';
import { Button } from '../../components/ui';

const toolbarBtns = [
  { label: 'Undo', cmd: 'undo' },
  { label: 'Redo', cmd: 'redo' },
  { label: 'OL', cmd: 'numberedList' },
  { label: 'UL', cmd: 'bulletedList' },
];

export const CanvasToolbar = () => {
  const focusedEditor = useCanvasStore(s => s.focusedEditor);
  const focusedLayerId = useCanvasStore(s => s.focusedLayerId);
  const addLayer = useCanvasStore(s => s.addLayer);

  const getEditor = () => focusedEditor ?? (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null);

  const exec = (cmd: string, payload?: unknown) => {
    const editor = getEditor();
    if (editor) {
      if (payload !== undefined) editor.execute(cmd, payload);
      else editor.execute(cmd);
    }
  };

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1">
      <Button variant="primary" size="sm" onClick={() => addLayer('text')}>
        + Add Layer
      </Button>

      {toolbarBtns.map(btn => (
        <Button
          key={btn.label}
          variant="secondary"
          onMouseDown={(e) => {
            e.preventDefault();
            exec(btn.cmd);
          }}
          size="sm"
          className={btn.className ?? ''}
        >
          {btn.label}
        </Button>
      ))}
    </div>
  );
};
