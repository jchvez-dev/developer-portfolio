import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasToolbar } from "../CanvasToolbar";
import { useCanvasStore, editorRegistry } from "../canvas/store";

const mockAddLayer = vi.fn();
const mockUpdateLayer = vi.fn();

const mockEditor = {
  execute: vi.fn(),
};

beforeEach(() => {
  useCanvasStore.setState({
    focusedEditor: null,
    focusedLayerId: null,
    addLayer: mockAddLayer,
    updateLayer: mockUpdateLayer,
  });
  editorRegistry.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("CanvasToolbar", () => {
  it("renders add text button", () => {
    render(<CanvasToolbar />);
    expect(screen.getByText("+ Add Text")).toBeInTheDocument();
  });

  it("renders add image button", () => {
    render(<CanvasToolbar />);
    expect(screen.getByText("+ Add Image")).toBeInTheDocument();
  });

  it("renders undo and redo buttons", () => {
    render(<CanvasToolbar />);
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.getByText("Redo")).toBeInTheDocument();
  });

  it("calls addLayer('text') when Add Text is clicked", async () => {
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("+ Add Text"));
    expect(mockAddLayer).toHaveBeenCalledWith("text");
  });

  it("opens ImageUploader modal when Add Image is clicked", async () => {
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("+ Add Image"));
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
  });

  it("closes ImageUploader modal on Cancel", async () => {
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("+ Add Image"));
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Upload Image")).not.toBeInTheDocument();
  });

  it("executes undo command on focused editor when Undo is clicked", async () => {
    useCanvasStore.setState({ focusedEditor: mockEditor as any });
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("Undo"));
    expect(mockEditor.execute).toHaveBeenCalledWith("undo");
  });

  it("executes redo command on focused editor when Redo is clicked", async () => {
    useCanvasStore.setState({ focusedEditor: mockEditor as any });
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("Redo"));
    expect(mockEditor.execute).toHaveBeenCalledWith("redo");
  });

  it("executes command from editorRegistry when no focusedEditor", async () => {
    editorRegistry.set("layer-1", mockEditor as any);
    useCanvasStore.setState({ focusedLayerId: "layer-1", focusedEditor: null });
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("Undo"));
    expect(mockEditor.execute).toHaveBeenCalledWith("undo");
  });

  it("does not execute command when no editor is available", async () => {
    render(<CanvasToolbar />);
    await userEvent.click(screen.getByText("Undo"));
    expect(mockEditor.execute).not.toHaveBeenCalled();
  });
});
