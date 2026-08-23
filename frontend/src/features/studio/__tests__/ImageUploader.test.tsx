import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageUploader } from "../ImageUploader";

const mockUploadImage = vi.fn();
vi.mock("../api", () => ({
  uploadImage: (...args: unknown[]) => mockUploadImage(...args),
}));

const originalImage = globalThis.Image;

beforeEach(() => {
  mockUploadImage.mockReset();
  globalThis.Image = class {
    naturalWidth = 800;
    naturalHeight = 600;
    onload: (() => void) | null = null;
    set src(_val: string) {
      this.onload?.();
    }
  } as unknown as typeof Image;

  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(function (
    this: FileReader,
  ) {
    Object.defineProperty(this, "result", { value: "data:image/png;base64," });
    this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
  });
});

afterEach(() => {
  globalThis.Image = originalImage;
  vi.restoreAllMocks();
});

const onClose = vi.fn();
const onUploaded = vi.fn();

afterEach(() => {
  onClose.mockReset();
  onUploaded.mockReset();
});

const findFileInput = (): HTMLInputElement =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;

describe("ImageUploader", () => {
  it("renders nothing when closed", () => {
    render(
      <ImageUploader open={false} onClose={onClose} onUploaded={onUploaded} />,
    );
    expect(screen.queryByText("Upload Image")).not.toBeInTheDocument();
  });

  it("renders the modal when open", () => {
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop/)).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows error for invalid file type", () => {
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const input = findFileInput();
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
  });

  it("shows error for file exceeding 10MB", async () => {
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    const blob = new Blob(["x".repeat(11 * 1024 * 1024)], {
      type: "image/png",
    });
    const file = new File([blob], "large.png", { type: "image/png" });
    await userEvent.upload(findFileInput(), file);
    expect(screen.getByText(/File size exceeds/)).toBeInTheDocument();
  });

  it("shows file info and Upload button after valid file selection", async () => {
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    const file = new File(["test"], "test.png", { type: "image/png" });
    await userEvent.upload(findFileInput(), file);
    expect(await screen.findByText("test.png")).toBeInTheDocument();
    expect(await screen.findByText("Upload")).toBeInTheDocument();
  });

  it("calls uploadImage and onUploaded on successful upload", async () => {
    mockUploadImage.mockResolvedValue({
      assetUrl: "user-uploads/sess_1/test.webp",
      sessionId: "sess_1",
    });
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    const file = new File(["test"], "test.png", { type: "image/png" });
    await userEvent.upload(findFileInput(), file);
    await screen.findByText("Upload");
    await userEvent.click(screen.getByText("Upload"));
    await vi.waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file, undefined);
      expect(onUploaded).toHaveBeenCalledWith(
        "user-uploads/sess_1/test.webp",
        800,
        600,
      );
    });
  });

  it("shows error message on upload failure", async () => {
    mockUploadImage.mockRejectedValue(new Error("Upload failed"));
    render(
      <ImageUploader open={true} onClose={onClose} onUploaded={onUploaded} />,
    );
    const file = new File(["test"], "test.png", { type: "image/png" });
    await userEvent.upload(findFileInput(), file);
    await screen.findByText("Upload");
    await userEvent.click(screen.getByText("Upload"));
    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });
});
