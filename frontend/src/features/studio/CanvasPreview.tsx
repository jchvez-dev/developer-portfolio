import { useState } from 'react';
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
} from 'ckeditor5';
import type { Editor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { Button, Dropdown } from '../../components/ui';
import { exportCanvas } from './api';

const Editor = Object.assign(InlineEditor, { EditorWatchdog, ContextWatchdog });

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

interface TextLayer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  html: string;
}

const initialLayers: TextLayer[] = [
  { id: 'title', x: 50, y: 50, width: 500, height: 200, html: '<h2>Titulo principal</h2>' },
  { id: 'body', x: 50, y: 300, width: 500, height: 250, html: '<p>Texto del cuerpo...</p>' },
];

const CANVAS_W = 1200;
const CANVAS_H = 630;

const fontSizes = ['12px', '16px', '24px', '32px', '48px', '64px'];

const toolbarBtns = [
  { label: 'Undo', cmd: 'undo' },
  { label: 'Redo', cmd: 'redo' },
  { label: 'B', cmd: 'bold', className: 'font-bold' },
  { label: 'I', cmd: 'italic', className: 'italic' },
  { label: 'OL', cmd: 'numberedList' },
  { label: 'UL', cmd: 'bulletedList' },
];

export const CanvasPreview = () => {
  const [layers, setLayers] = useState<TextLayer[]>(initialLayers);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null);

  const handleChange = (id: string, html: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, html } : l));
  };

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await exportCanvas({
        canvas: { width: CANVAS_W, height: CANVAS_H, backgroundColor: '#ffffff' },
        layers: layers.map(l => ({
          id: l.id,
          type: 'text',
          properties: {
            x: l.x,
            y: l.y,
            width: l.width,
            height: l.height,
            content: l.html,
            fontSize: 32,
            fontFamily: 'DejaVu-Sans',
            color: '#111827',
          },
        })),
      });
      setResult(res.downloadUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al exportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-full">
      <h3 className="mb-4 text-lg font-semibold">Canvas Preview (1200x630)</h3>

      <div className="mb-2 flex flex-wrap items-center gap-1">
        <Dropdown
          value={'32px'}
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
              if (focusedEditor) focusedEditor.execute(btn.cmd, btn.value !== undefined ? { value: btn.value } : undefined);
            }}
            className={`px-3 py-1 text-sm ${btn.className ?? ''}`}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      <div
        className="relative overflow-auto border-2 border-dashed border-gray-300 bg-white"
        style={{ width: CANVAS_W, maxHeight: CANVAS_H, minHeight: CANVAS_H }}
      >
        {layers.map(layer => (
          <div
            key={layer.id}
            className="absolute"
            style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height }}
          >
            <CKEditor
              editor={Editor}
              config={EDITOR_CONFIG}
              data={layer.html}
              onFocus={(_event, editor) => setFocusedEditor(editor)}
              onChange={(_event, editor) => handleChange(layer.id, editor.getData())}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          variant="primary"
          disabled={loading}
          onClick={handleExport}
        >
          {loading ? 'Exportando...' : 'Exportar imagen'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-2">
          <p className="text-sm text-green-600">Imagen generada:</p>
          <a
            href={result}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
          >
            {result}
          </a>
        </div>
      )}
    </div>
  );
};
