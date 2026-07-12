import { useCallback } from "react";
import { useCanvasStore, editorRegistry } from "../canvas/store";

export const useCkEditor = () => {
  const focusedEditor = useCanvasStore((s) => s.focusedEditor);
  const focusedLayerId = useCanvasStore((s) => s.focusedLayerId);

  const getEditor = useCallback(
    () =>
      focusedEditor ??
      (focusedLayerId ? editorRegistry.get(focusedLayerId) ?? null : null),
    [focusedEditor, focusedLayerId],
  );

  const exec = useCallback(
    (cmd: string, payload?: unknown) => {
      const editor = getEditor();
      if (editor) {
        if (payload !== undefined) editor.execute(cmd, payload);
        else editor.execute(cmd);
      }
    },
    [getEditor],
  );

  return { getEditor, exec };
};
