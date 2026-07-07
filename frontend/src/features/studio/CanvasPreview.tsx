import { useState, useRef, useCallback } from 'react';
import type { Editor } from 'ckeditor5';
import { Button, Modal } from '../../components/ui';
import { exportCanvas } from './api';
import { CanvasToolbar } from './CanvasToolbar';
import { TextLayerComponent } from './TextLayer';
import type { TextLayer } from './types';

const CANVAS_W = 1200;
const CANVAS_H = 630;

const initialLayers: TextLayer[] = [
  { id: 'title', x: 50, y: 50, width: 200, height: 30, zIndex: 1, html: '<h2>Titulo principal</h2>' },
  { id: 'body', x: 50, y: 300, width: 200, height: 30, zIndex: 2, html: '<p>Texto del cuerpo...</p>' },
];

export const CanvasPreview = () => {
  const [layers, setLayers] = useState<TextLayer[]>(initialLayers);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null);
  const [focusedLayerId, setFocusedLayerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const nextId = useRef(3);
  const nextZIndex = useRef(3);

  const handleChange = useCallback((id: string, html: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, html } : l));
  }, []);

  const addLayer = useCallback(() => {
    const id = nextId.current++;
    const z = nextZIndex.current++;
    setLayers(prev => [...prev, {
      id: `layer-${id}`,
      x: 30 + (z % 5) * 20,
      y: 30 + (z % 5) * 20,
      width: 200,
      height: 30,
      zIndex: z,
      html: '<p>New text layer</p>',
    }]);
  }, []);

  const removeLayer = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setLayers(prev => prev.filter(l => l.id !== deleteTarget));
    if (focusedLayerId === deleteTarget) {
      setFocusedLayerId(null);
      setFocusedEditor(null);
    }
    setDeleteTarget(null);
  }, [deleteTarget, focusedLayerId]);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleLayerFocus = useCallback((layerId: string, editor: Editor) => {
    setFocusedLayerId(layerId);
    setFocusedEditor(editor);
  }, []);

  const handleLayerBlur = useCallback(() => {
    setFocusedLayerId(null);
    setFocusedEditor(null);
  }, []);

  const handleResize = useCallback((id: string, width: number, height: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, width, height } : l));
  }, []);

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
      <h3 className="mb-4 text-lg font-semibold">Canvas Preview ({CANVAS_W}x{CANVAS_H})</h3>

      <CanvasToolbar focusedEditor={focusedEditor} onAddLayer={addLayer} />

      <div
        className="relative overflow-auto border-2 border-dashed border-gray-300 bg-white"
        style={{ width: CANVAS_W, maxHeight: CANVAS_H, minHeight: CANVAS_H }}
      >
        {[...layers]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(layer => (
            <TextLayerComponent
              key={layer.id}
              layer={layer}
              isFocused={focusedLayerId === layer.id}
              onChange={handleChange}
              onRemove={removeLayer}
              onFocus={handleLayerFocus}
              onBlur={handleLayerBlur}
              onResize={handleResize}
            />
          ))
        }
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="primary" disabled={loading} onClick={handleExport}>
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

      <Modal open={deleteTarget !== null} onClose={cancelDelete}>
        <div className="p-6">
          <h3 className="mb-2 text-lg font-semibold dark:text-white">Delete layer</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this layer?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
