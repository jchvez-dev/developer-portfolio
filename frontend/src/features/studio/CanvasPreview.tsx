import { useState } from "react";
import type { Layer } from "./types";
import { Button, Card, Heading, Text } from "../../components/ui";
import { exportCanvas, type ExportLayer } from "./api";
import { CanvasToolbar } from "./CanvasToolbar";
import { LayerPanel } from "./LayerPanel";
import { LayerPropertiesPanel } from "./LayerPropertiesPanel";
import { TextLayerComponent } from "./TextLayer";
import { ImageLayerComponent } from "./ImageLayer";
import { BackgroundColorPicker } from "./BackgroundColorPicker";
import { DeleteLayerModal } from "./DeleteLayerModal";
import { ArtboardSizePicker } from "./ArtboardSizePicker";
import { useCanvasStore } from "./canvas/store";

const renderLayer = (layer: Layer) => {
  switch (layer.type) {
    case "text":
      return <TextLayerComponent key={layer.id} layer={layer} />;
    case "image":
      return <ImageLayerComponent key={layer.id} layer={layer} />;
  }
};

const toExportPayload = (layer: Layer): ExportLayer | undefined => {
  switch (layer.type) {
    case "text":
      return {
        id: layer.id,
        type: "text",
        properties: {
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          content: layer.html,
          backgroundColor: layer.backgroundColor,
        },
      };
    case "image":
      return {
        id: layer.id,
        type: "image",
        properties: {
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          assetUrl: layer.src,
        },
      };
  }
};

export const CanvasPreview = () => {
  const layers = useCanvasStore((s) => s.layers);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const backgroundColor = useCanvasStore((s) => s.backgroundColor);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);
  const clearFocus = useCanvasStore((s) => s.clearFocus);
  const setBackgroundColor = useCanvasStore((s) => s.setBackgroundColor);

  const sizeChosen = useCanvasStore((s) => s.sizeChosen);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!sizeChosen) return <ArtboardSizePicker />;

  const focusedLayer = focusedLayerId
    ? (layers.find((l) => l.id === focusedLayerId) ?? null)
    : null;

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await exportCanvas({
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor,
        },
        layers: layers.map(toExportPayload),
      });
      setResult(res.downloadUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading as="h3" className="mb-4">
        ({canvasWidth}x{canvasHeight})
      </Heading>

      <CanvasToolbar />

      <Card className="flex gap-6 w-full h-[50vh]">
        <div className="flex w-full overflow-auto p-2 scrollbar-thin scrollbar-thumb-gray-500">
          <div
            className="relative overflow-hidden border-2 border-dashed border-gray-300 m-auto flex-shrink-0 dark:border-gray-700"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) clearFocus();
            }}
          >
            {[...layers].sort((a, b) => a.zIndex - b.zIndex).map(renderLayer)}
          </div>
        </div>
        <div className="w-72">
          {focusedLayer ? (
            <LayerPropertiesPanel layer={focusedLayer} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <Heading
                  as="h4"
                  className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400"
                >
                  Canvas
                </Heading>
                <div className="flex items-center justify-between">
                  <Text small muted>
                    Background
                  </Text>
                  <BackgroundColorPicker
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                    allowTransparent={false}
                  />
                </div>
              </div>
              <LayerPanel />
            </div>
          )}
        </div>
      </Card>

      <div className="mt-4 flex gap-3">
        <Button variant="primary" disabled={loading} onClick={handleExport}>
          {loading ? "Exporting..." : "Export Image"}
        </Button>
      </div>

      {error && (
        <Text small className="mt-2 text-red-600">
          {error}
        </Text>
      )}
      {result && (
        <div className="mt-2">
          <Text small className="text-green-600">
            Image generated:
          </Text>
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

      <DeleteLayerModal />
    </>
  );
};
