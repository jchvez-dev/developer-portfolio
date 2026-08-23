import { useState, useEffect, useRef } from "react";
import { useCkEditor } from "./useCkEditor";

function normalizeColor(color: string | null | undefined): string {
  if (!color) return "#000000";
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

export const useTextColor = () => {
  const { getEditor, exec } = useCkEditor();
  const [textColor, setTextColor] = useState("#000000");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;

    const selection = editor.model.document.selection;
    const update = () => {
      const c = selection.getAttribute("fontColor") as string | null;
      setTextColor(c ? normalizeColor(c) : "#000000");
    };

    update();
    selection.on("change:range", update);
    selection.on("change:attribute", update);

    return () => {
      selection.off("change:range", update);
      selection.off("change:attribute", update);
    };
  }, [getEditor]);

  const updateColor = (val: string) => {
    setTextColor(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      exec("fontColor", { value: val });
    }, 150);
  };

  return { textColor, updateColor };
};
