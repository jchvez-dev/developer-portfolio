import { useState } from "react";
import { Button, Heading, Modal } from "../../components/ui";
import { API_URL } from "../../lib/api";

interface ExportSuccessModalProps {
  open: boolean;
  onClose: () => void;
  imagePath: string;
  exportId: string;
}

export const ExportSuccessModal = ({
  open,
  onClose,
  imagePath,
  exportId,
}: ExportSuccessModalProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/canvas/images/${imagePath}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export-${exportId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <Heading as="h3" className="mb-4">
          Image generated
        </Heading>
        <div className="mb-6 flex h-[500px] w-[500px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <img
            src={`${API_URL}/canvas/images/${imagePath}`}
            alt="Exported canvas"
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
