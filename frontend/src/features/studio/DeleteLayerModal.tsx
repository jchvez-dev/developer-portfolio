import { Button, Modal } from "../../components/ui";
import { useCanvasStore } from "./canvas/store";

export const DeleteLayerModal = () => {
  const deleteTarget = useCanvasStore((s) => s.deleteTarget);
  const cancelDelete = useCanvasStore((s) => s.cancelDelete);
  const confirmDelete = useCanvasStore((s) => s.confirmDelete);

  return (
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
  );
};
