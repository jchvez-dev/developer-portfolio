import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageLayerComponent } from "../ImageLayer";
import type { ImageLayerData } from "../types";

const mockSelectLayer = vi.fn();
const mockUpdateLayer = vi.fn();
let mockFocusedLayerId: string | null = null;

vi.mock("../canvas/store", () => ({
  useCanvasStore: (selector: any) => {
    const state = {
      canvasWidth: 1200,
      canvasHeight: 630,
      focusedLayerId: mockFocusedLayerId,
      selectLayer: mockSelectLayer,
      updateLayer: mockUpdateLayer,
    };
    return selector(state);
  },
}));

const baseLayer: ImageLayerData = {
  id: "img-1",
  name: "Test image",
  type: "image",
  x: 100,
  y: 200,
  width: 400,
  height: 300,
  zIndex: 5,
  src: "",
  backgroundColor: "transparent",
  opacity: 1,
};

afterEach(() => {
  mockFocusedLayerId = null;
  vi.clearAllMocks();
});

describe("ImageLayerComponent", () => {
  it("renders placeholder when src is empty", () => {
    const { container } = render(<ImageLayerComponent layer={baseLayer} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders img element when src is provided", () => {
    render(
      <ImageLayerComponent
        layer={{ ...baseLayer, src: "user-uploads/sess/test.webp" }}
      />,
    );
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "/api/v1/canvas/images/user-uploads/sess/test.webp",
    );
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("shows drag handle when focused and src is present", () => {
    mockFocusedLayerId = "img-1";
    render(
      <ImageLayerComponent
        layer={{ ...baseLayer, src: "user-uploads/sess/test.webp" }}
      />,
    );
    expect(screen.getByLabelText("Drag layer")).toBeInTheDocument();
  });

  it("hides drag handle when not focused", () => {
    mockFocusedLayerId = null;
    render(
      <ImageLayerComponent
        layer={{ ...baseLayer, src: "user-uploads/sess/test.webp" }}
      />,
    );
    expect(screen.queryByLabelText("Drag layer")).not.toBeInTheDocument();
  });

  it("hides drag handle when focused but src is empty", () => {
    mockFocusedLayerId = "img-1";
    render(<ImageLayerComponent layer={baseLayer} />);
    expect(screen.queryByLabelText("Drag layer")).not.toBeInTheDocument();
  });

  it("shows focused outline when layer is selected", () => {
    mockFocusedLayerId = "img-1";
    const { container } = render(<ImageLayerComponent layer={baseLayer} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.outline).toBeTruthy();
  });

  it("selects layer on click", async () => {
    render(
      <ImageLayerComponent
        layer={{ ...baseLayer, src: "user-uploads/sess/test.webp" }}
      />,
    );
    await userEvent.click(screen.getByRole("img", { name: "Test image" }));
    expect(mockSelectLayer).toHaveBeenCalledWith("img-1");
  });

  it("renders with correct position and size", () => {
    const { container } = render(<ImageLayerComponent layer={baseLayer} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.left).toBe("100px");
    expect(wrapper.style.top).toBe("200px");
    expect(wrapper.style.width).toBe("400px");
    expect(wrapper.style.height).toBe("300px");
    expect(wrapper.style.zIndex).toBe("5");
    expect(wrapper.style.opacity).toBe("1");
  });
});
