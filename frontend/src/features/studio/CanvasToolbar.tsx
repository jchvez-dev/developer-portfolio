import type { Editor } from 'ckeditor5';
import { Button, Dropdown } from '../../components/ui';

const fontSizes = ['12px', '16px', '24px', '32px', '48px', '64px'];

const toolbarBtns = [
  { label: 'Undo', cmd: 'undo' },
  { label: 'Redo', cmd: 'redo' },
  { label: 'B', cmd: 'bold', className: 'font-bold' },
  { label: 'I', cmd: 'italic', className: 'italic' },
  { label: 'OL', cmd: 'numberedList' },
  { label: 'UL', cmd: 'bulletedList' },
];

interface CanvasToolbarProps {
  focusedEditor: Editor | null;
  onAddLayer: () => void;
}

export const CanvasToolbar = ({ focusedEditor, onAddLayer }: CanvasToolbarProps) => (
  <div className="mb-2 flex flex-wrap items-center gap-1">
    <Button variant="primary" size="sm" onClick={onAddLayer}>
      + Add Layer
    </Button>

    <Dropdown
      value="32px"
      options={fontSizes.map(s => ({ label: s, value: s }))}
      disabled={!focusedEditor}
      onChange={(v) => focusedEditor?.execute('fontSize', { value: v })}
    />

    {toolbarBtns.map(btn => (
      <Button
        key={btn.label}
        variant="secondary"
        disabled={!focusedEditor}
        onMouseDown={(e) => {
          e.preventDefault();
          if (focusedEditor) {
            focusedEditor.execute(btn.cmd);
          }
        }}
        size="sm"
        className={btn.className ?? ''}
      >
        {btn.label}
      </Button>
    ))}
  </div>
);
