import { useState } from "react";
import { Button, Card, Heading, Text } from "../../components/ui";
import { useCanvasStore } from "./canvas/store";

const ARTBOARD_PRESETS = [
  { label: "OG Image", width: 1200, height: 630 },
  { label: "Twitter Post", width: 1200, height: 675 },
  { label: "Instagram Square", width: 1080, height: 1080 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
  { label: "LinkedIn Banner", width: 1584, height: 396 },
] as const;

const MIN_WIDTH = 1;
const MAX_WIDTH = 3840;
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 2160;

export const ArtboardSizePicker = () => {
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const setCanvasSize = useCanvasStore((s) => s.setCanvasSize);
  const confirmSize = useCanvasStore((s) => s.confirmSize);

  const isCustom = !ARTBOARD_PRESETS.some(
    (p) => p.width === canvasWidth && p.height === canvasHeight,
  );

  const [customWidth, setCustomWidth] = useState(canvasWidth);
  const [customHeight, setCustomHeight] = useState(canvasHeight);
  const [showCustom, setShowCustom] = useState(isCustom);

  const handlePreset = (w: number, h: number) => {
    setCanvasSize(w, h);
    confirmSize();
  };

  const handleCustomConfirm = () => {
    const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, customWidth));
    const h = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, customHeight));
    setCanvasSize(w, h);
    confirmSize();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-lg p-6 shadow-xl">
        <Heading as="h3" className="mb-1">
          Choose Artboard Size
        </Heading>
        <Text small muted className="mb-4">
          Select a preset or set a custom size. This will be set once for this
          session.
        </Text>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {ARTBOARD_PRESETS.map((preset) => {
            const active =
              preset.width === canvasWidth && preset.height === canvasHeight;
            return (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.width, preset.height)}
                className={`rounded border p-3 text-left transition hover:border-blue-500 ${
                  active && !showCustom
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text as="span" className="block font-medium">
                  {preset.label}
                </Text>
                <Text as="span" small muted>
                  {preset.width} x {preset.height}
                </Text>
              </button>
            );
          })}

          <button
            onClick={() => setShowCustom(true)}
            className={`rounded border p-3 text-left transition hover:border-blue-500 ${
              showCustom
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text as="span" className="block font-medium">
              Custom
            </Text>
            <Text as="span" small muted>
              Set your own
            </Text>
          </button>
        </div>

        {showCustom && (
          <div className="mb-4 flex items-end gap-3 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex-1">
              <label htmlFor="artboard-width" className="mb-1 block text-sm text-gray-400 dark:text-gray-400">
                Width
              </label>
              <input
                id="artboard-width"
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                min={MIN_WIDTH}
                max={MAX_WIDTH}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <Text small muted className="pb-1">
              x
            </Text>
            <div className="flex-1">
              <label htmlFor="artboard-height" className="mb-1 block text-sm text-gray-400 dark:text-gray-400">
                Height
              </label>
              <input
                id="artboard-height"
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                min={MIN_HEIGHT}
                max={MAX_HEIGHT}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <Button variant="primary" onClick={handleCustomConfirm}>
              Set
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
