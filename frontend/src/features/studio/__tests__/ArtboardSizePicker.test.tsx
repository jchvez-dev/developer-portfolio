import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtboardSizePicker } from "../ArtboardSizePicker";
import { useCanvasStore } from "../canvas/store";

const ARTBOARD_PRESETS = [
  "OG Image",
  "Twitter Post",
  "Instagram Square",
  "Instagram Story",
  "YouTube Thumbnail",
  "LinkedIn Banner",
  "Custom",
];

describe("ArtboardSizePicker", () => {
  beforeEach(() => {
    useCanvasStore.setState({
      canvasWidth: 1200,
      canvasHeight: 630,
      sizeChosen: false,
    });
  });

  it("renders heading and all presets", () => {
    render(<ArtboardSizePicker />);
    expect(screen.getByText("Choose Artboard Size")).toBeInTheDocument();
    for (const label of ARTBOARD_PRESETS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("selecting a preset updates store and calls confirmSize", async () => {
    render(<ArtboardSizePicker />);
    await userEvent.click(screen.getByText("Instagram Square"));

    const { canvasWidth, canvasHeight, sizeChosen } =
      useCanvasStore.getState();
    expect(canvasWidth).toBe(1080);
    expect(canvasHeight).toBe(1080);
    expect(sizeChosen).toBe(true);
  });

  it("clicking Custom reveals width/height inputs", async () => {
    render(<ArtboardSizePicker />);
    await userEvent.click(screen.getByText("Custom"));

    expect(screen.getByLabelText("Width")).toBeInTheDocument();
    expect(screen.getByLabelText("Height")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set" })).toBeInTheDocument();
  });

  it("Custom with valid values updates store on Set", async () => {
    render(<ArtboardSizePicker />);
    await userEvent.click(screen.getByText("Custom"));

    const widthInput = screen.getByLabelText("Width");
    const heightInput = screen.getByLabelText("Height");
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "800");
    await userEvent.clear(heightInput);
    await userEvent.type(heightInput, "600");
    await userEvent.click(screen.getByRole("button", { name: "Set" }));

    const { canvasWidth, canvasHeight, sizeChosen } =
      useCanvasStore.getState();
    expect(canvasWidth).toBe(800);
    expect(canvasHeight).toBe(600);
    expect(sizeChosen).toBe(true);
  });

  it("preselected preset is highlighted when dimensions match", () => {
    useCanvasStore.setState({ canvasWidth: 1280, canvasHeight: 720 });
    render(<ArtboardSizePicker />);

    const btn = screen.getByText("YouTube Thumbnail").closest("button");
    expect(btn?.className).toContain("border-blue-500");
  });
});
