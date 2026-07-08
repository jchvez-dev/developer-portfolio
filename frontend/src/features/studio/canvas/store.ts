import { create } from 'zustand';
import type { Editor } from 'ckeditor5';
import type { Layer, LayerPatch } from '../types';

interface CanvasState {
  layers: Layer[];
  focusedLayerId: string | null;
  focusedEditor: Editor | null;
  deleteTarget: string | null;
  addLayer: (type: 'text' | 'image') => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, patch: LayerPatch) => void;
  resizeLayer: (id: string, width: number, height: number) => void;
  setFocus: (layerId: string, editor: Editor) => void;
  clearFocus: () => void;
  requestDelete: (id: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

let nextLayerId = 3;
let nextZIndex = 3;

const initialLayers: Layer[] = [
  { id: 'title', type: 'text', x: 50, y: 50, width: 200, height: 30, zIndex: 1, html: '<h2>Titulo principal</h2>' },
  { id: 'body', type: 'text', x: 50, y: 300, width: 200, height: 30, zIndex: 2, html: '<p>Texto del cuerpo...</p>' },
];

export const useCanvasStore = create<CanvasState>((set) => ({
  layers: initialLayers,
  focusedLayerId: null,
  focusedEditor: null,
  deleteTarget: null,

  addLayer: (type) => {
    const id = nextLayerId++;
    const z = nextZIndex++;
    const base = {
      id: `layer-${id}`,
      x: 30 + (z % 5) * 20,
      y: 30 + (z % 5) * 20,
      width: 200,
      zIndex: z,
    };
    set((state) => ({
      layers: [...state.layers,
        type === 'text'
          ? { ...base, type: 'text' as const, height: 30, html: '<p>New text layer</p>' }
          : { ...base, type: 'image' as const, height: 200, src: '' },
      ],
    }));
  },

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter(l => l.id !== id),
    ...(state.focusedLayerId === id
      ? { focusedLayerId: null, focusedEditor: null }
      : {}),
  })),

  updateLayer: (id, patch) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...patch } as Layer : l),
  })),

  resizeLayer: (id, width, height) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, width, height } : l),
  })),

  setFocus: (layerId, editor) => set({
    focusedLayerId: layerId,
    focusedEditor: editor,
  }),

  clearFocus: () => set({
    focusedLayerId: null,
    focusedEditor: null,
  }),

  requestDelete: (id) => set({ deleteTarget: id }),

  confirmDelete: () => set((state) => {
    if (!state.deleteTarget) return state;
    return {
      layers: state.layers.filter(l => l.id !== state.deleteTarget),
      deleteTarget: null,
      ...(state.focusedLayerId === state.deleteTarget
        ? { focusedLayerId: null, focusedEditor: null }
        : {}),
    };
  }),

  cancelDelete: () => set({ deleteTarget: null }),
}));
