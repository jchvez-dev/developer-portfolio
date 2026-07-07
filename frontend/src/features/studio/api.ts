interface LayerProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface Layer {
  id: string;
  type: string;
  properties: LayerProperties;
}

interface ExportPayload {
  canvas: { width: number; height: number; backgroundColor?: string };
  layers: Layer[];
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
