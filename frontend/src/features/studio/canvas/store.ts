import { create } from "zustand";
import type { Editor } from "ckeditor5";
import type { Layer, LayerPatch } from "../types";

export const editorRegistry = new Map<string, Editor>();

interface CanvasState {
  layers: Layer[];
  focusedLayerId: string | null;
  focusedEditor: Editor | null;
  deleteTarget: string | null;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  sizeChosen: boolean;
  addLayer: (type: "text" | "image") => string;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, patch: LayerPatch) => void;
  setFocus: (layerId: string, editor: Editor) => void;
  clearFocus: () => void;
  selectLayer: (layerId: string) => void;
  requestDelete: (id: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  confirmSize: () => void;
}

let nextLayerId = 3;
let nextZIndex = 3;

const initialLayers: Layer[] = [
  {
    id: "title",
    name: "Main Title",
    type: "text",
    x: 50,
    y: 50,
    width: 200,
    height: 30,
    zIndex: 1,
    html: '<p><span style="font-size:32px;font-family:Inter;">Main Title</span></p>',
    fontFamily: "Inter",
    fontSize: 32,
    color: "#111827",
    backgroundColor: "transparent",
    opacity: 1,
  },
  {
    id: "body",
    name: "Body",
    type: "text",
    x: 50,
    y: 300,
    width: 200,
    height: 30,
    zIndex: 2,
    html: '<p style="font-size:16px;font-family:Inter;">Body text...</p>',
    fontFamily: "Inter",
    fontSize: 16,
    color: "#111827",
    backgroundColor: "transparent",
    opacity: 1,
  },
];

export const useCanvasStore = create<CanvasState>((set) => ({
  layers: initialLayers,
  focusedLayerId: null,
  focusedEditor: null,
  deleteTarget: null,
  canvasWidth: 1200,
  canvasHeight: 630,
  backgroundColor: "#ffffff",
  sizeChosen: false,

  addLayer: (type) => {
    const id = nextLayerId++;
    const z = nextZIndex++;
    const layerId = `layer-${id}`;
    const base = {
      id: layerId,
      name: type === "text" ? "New text layer" : "New image layer",
      x: 30 + (z % 5) * 20,
      y: 30 + (z % 5) * 20,
      width: 200,
      zIndex: z,
    };
    set((state) => ({
      layers: [
        ...state.layers,
        type === "text"
          ? {
              ...base,
              type: "text" as const,
              height: 30,
              html: '<p><span style="font-size:16px;font-family:Inter;">New text layer</span></p>',
              fontFamily: "Inter",
              fontSize: 16,
              color: "#111827",
              backgroundColor: "transparent",
              opacity: 1,
            }
          : {
              ...base,
              type: "image" as const,
              height: 200,
              src: "",
              backgroundColor: "transparent",
              opacity: 1,
            },
      ],
    }));
    return layerId;
  },

  removeLayer: (id) => {
    editorRegistry.delete(id);
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      ...(state.focusedLayerId === id
        ? { focusedLayerId: null, focusedEditor: null }
        : {}),
    }));
  },

  updateLayer: (id, patch) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? ({ ...l, ...patch } as Layer) : l,
      ),
    })),

  setFocus: (layerId, editor) => {
    editorRegistry.set(layerId, editor);
    set({
      focusedLayerId: layerId,
      focusedEditor: editor,
    });
  },

  clearFocus: () => set({ focusedLayerId: null }),

  selectLayer: (layerId) =>
    set({
      focusedLayerId: layerId,
      focusedEditor: editorRegistry.get(layerId) ?? null,
    }),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => {
      const sorted = [...state.layers].sort((a, b) => b.zIndex - a.zIndex);
      const [moved] = sorted.splice(fromIndex, 1);
      const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
      sorted.splice(adjustedTo, 0, moved);
      const reindexed = sorted.map((l, i) => ({
        ...l,
        zIndex: sorted.length - i,
      }));
      return { layers: reindexed };
    }),

  requestDelete: (id) => set({ deleteTarget: id }),

  confirmDelete: () =>
    set((state) => {
      if (!state.deleteTarget) return state;
      editorRegistry.delete(state.deleteTarget);
      return {
        layers: state.layers.filter((l) => l.id !== state.deleteTarget),
        deleteTarget: null,
        ...(state.focusedLayerId === state.deleteTarget
          ? { focusedLayerId: null, focusedEditor: null }
          : {}),
      };
    }),

  cancelDelete: () => set({ deleteTarget: null }),

  setCanvasSize: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  confirmSize: () => set({ sizeChosen: true }),
}));
