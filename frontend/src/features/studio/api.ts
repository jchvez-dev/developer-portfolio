import type { LayerType } from './types';

export interface TextLayerProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export interface ImageLayerProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

export type ExportProperties = TextLayerProperties | ImageLayerProperties;

export interface ExportLayer {
  id: string;
  type: LayerType;
  properties: ExportProperties;
}

interface ExportPayload {
  canvas: { width: number; height: number; backgroundColor?: string };
  layers: ExportLayer[];
}

interface ExportResult {
  success: boolean;
  exportId: string;
  downloadUrl: string;
}

export async function exportCanvas(payload: ExportPayload): Promise<ExportResult> {
  const res = await fetch('/api/v1/canvas/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
