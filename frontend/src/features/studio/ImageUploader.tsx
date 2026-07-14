import { useState, useRef, useCallback } from "react";
import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button, Modal, Text } from "../../components/ui";
import { uploadImage } from "./api";

interface ImageUploaderProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (assetUrl: string, width: number, height: number) => void;
}

interface ImageDims {
  width: number;
  height: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const SESSION_KEY = "session-id";

const getSessionId = (): string | undefined => {
  try {
    return localStorage.getItem(SESSION_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

const saveSessionId = (id: string) => {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    /* noop */
  }
};

export const ImageUploader = ({
  open,
  onClose,
  onUploaded,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageDims, setImageDims] = useState<ImageDims | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPreview(null);
    setFile(null);
    setImageDims(null);
    setError(null);
    setUploading(false);
    setDragging(false);
  }, []);

  const handleFile = useCallback((selected: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Invalid file type. Allowed: jpeg, png, webp, gif.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.src = url;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleUpload = async () => {
    if (!file || !imageDims) return;
    setUploading(true);
    setError(null);
    try {
      const sessionId = getSessionId();
      const result = await uploadImage(file, sessionId);
      saveSessionId(result.sessionId);
      onUploaded(result.assetUrl, imageDims.width, imageDims.height);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="w-full max-w-md p-6">
        <Text as="h3" className="mb-4 text-lg font-semibold">
          Upload Image
        </Text>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full rounded object-contain"
            />
          ) : (
            <>
              <PhotoIcon className="mb-2 h-10 w-10 text-gray-400" />
              <Text small muted className="text-center">
                Drag & drop an image here, or click to browse
              </Text>
              <Text small muted className="mt-1 text-xs">
                JPEG, PNG, WebP, GIF up to 10MB
              </Text>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) handleFile(selected);
          }}
        />

        {error && (
          <Text small className="mt-2 text-red-600">
            {error}
          </Text>
        )}

        {file && (
          <div className="mt-4 flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-800">
            <div className="min-w-0 flex-1 truncate">
              <Text small className="truncate">
                {file.name}
              </Text>
              <Text small muted>
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={uploading}
              onClick={handleUpload}
              icon={<ArrowUpTrayIcon className="h-4 w-4" />}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
