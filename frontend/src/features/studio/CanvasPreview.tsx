import { useState } from "react";
import type { Layer } from "./types";
import { Button, Card, Heading, Modal, Text } from "../../components/ui";
import { exportCanvas, type ExportLayer } from "./api";
import { CanvasToolbar } from "./CanvasToolbar";
import { LayerPanel } from "./LayerPanel";
import { TextLayerComponent } from "./TextLayer";
import { useCanvasStore } from "./canvas/store";

const CANVAS_W = 1200;
const CANVAS_H = 630;

const renderLayer = (layer: Layer) => {
  switch (layer.type) {
    case "text":
      return <TextLayerComponent key={layer.id} layer={layer} />;
    case "image":
      return null;
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
          src: layer.src,
        },
      };
  }
};

export const CanvasPreview = () => {
  const layers = useCanvasStore((s) => s.layers);
  const deleteTarget = useCanvasStore((s) => s.deleteTarget);
  const confirmDelete = useCanvasStore((s) => s.confirmDelete);
  const cancelDelete = useCanvasStore((s) => s.cancelDelete);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await exportCanvas({
        canvas: {
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundColor: "#ffffff",
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
        ({CANVAS_W}x{CANVAS_H})
      </Heading>

      <CanvasToolbar />

      <Card className="flex gap-6 w-full h-[50vh]">
        <div className="flex w-full overflow-auto p-2 scrollbar-thin scrollbar-thumb-gray-500">
          <div
            className="relative overflow-hidden border-2 border-dashed border-gray-300 bg-white m-auto flex-shrink-0 dark:border-gray-700"
            style={{ width: CANVAS_W, height: CANVAS_H }}
          >
            {[...layers].sort((a, b) => a.zIndex - b.zIndex).map(renderLayer)}
          </div>
        </div>
        <LayerPanel />
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

      <Modal open={deleteTarget !== null} onClose={cancelDelete}>
        <div className="p-6">
          <h3 className="mb-2 text-lg font-semibold dark:text-white">
            Delete layer
          </h3>
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
    </>
  );
};
