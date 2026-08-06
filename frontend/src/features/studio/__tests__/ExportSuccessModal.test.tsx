import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportSuccessModal } from "../ExportSuccessModal";

const imagePath = "production-exports/test.png";
const exportId = "canvas_job_123";

const baseProps = {
  open: true,
  onClose: vi.fn(),
  imagePath,
  exportId,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ExportSuccessModal", () => {
  it("renders nothing when not open", () => {
    render(<ExportSuccessModal {...baseProps} open={false} />);
    expect(screen.queryByText("Image generated")).not.toBeInTheDocument();
  });

  it("renders the image preview with the gateway src", () => {
    render(<ExportSuccessModal {...baseProps} />);
    const img = screen.getByRole("img", { name: "Exported canvas" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      `/api/v1/canvas/images/${imagePath}`,
    );
  });

  it("calls onClose when Close is clicked", async () => {
    const onClose = vi.fn();
    render(<ExportSuccessModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("downloads the image as a blob when Download is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(["fake-png"], { type: "image/png" }),
      }),
    );
    Object.assign(URL, {
      createObjectURL: vi.fn().mockReturnValue("blob:mock"),
      revokeObjectURL: vi.fn(),
    });

    let createdAnchor: HTMLAnchorElement | null = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "a") createdAnchor = el as HTMLAnchorElement;
      return el;
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<ExportSuccessModal {...baseProps} />);
    await userEvent.click(screen.getByText("Download"));

    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/canvas/images/${imagePath}`,
    );
    expect(createdAnchor?.href).toBe("blob:mock");
    expect(createdAnchor?.download).toBe(`export-${exportId}.png`);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("shows Downloading state while the download is in flight", async () => {
    let resolveBlob!: (value: Blob) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveBlob = () =>
            resolve({ ok: true, blob: async () => new Blob() });
        }),
      ),
    );
    Object.assign(URL, {
      createObjectURL: vi.fn().mockReturnValue("blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<ExportSuccessModal {...baseProps} />);
    await userEvent.click(screen.getByText("Download"));
    expect(screen.getByText("Downloading...")).toBeInTheDocument();

    await act(async () => {
      resolveBlob(new Blob());
    });
  });
});