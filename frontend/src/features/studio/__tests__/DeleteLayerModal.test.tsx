import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { DeleteLayerModal } from "../DeleteLayerModal";
import { useCanvasStore } from "../canvas/store";

afterEach(() => {
  useCanvasStore.setState({
    layers: [],
    deleteTarget: null,
    focusedLayerId: null,
    focusedEditor: null,
  });
});

describe("DeleteLayerModal", () => {
  it("renders nothing when no layer is targeted for deletion", () => {
    useCanvasStore.setState({ deleteTarget: null });
    render(<DeleteLayerModal />);
    expect(screen.queryByText("Delete layer")).not.toBeInTheDocument();
  });

  it("renders the modal when a layer is targeted for deletion", () => {
    useCanvasStore.setState({
      deleteTarget: "layer-1",
      layers: [
        {
          id: "layer-1",
          name: "Test",
          type: "text",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          zIndex: 1,
          html: "<p>test</p>",
          fontFamily: "Inter",
          fontSize: 16,
          color: "#000",
          backgroundColor: "transparent",
        },
      ],
    });
    render(<DeleteLayerModal />);
    expect(screen.getByText("Delete layer")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this layer?"),
    ).toBeInTheDocument();
  });

  it("clears deleteTarget on Cancel click", async () => {
    useCanvasStore.setState({
      deleteTarget: "layer-1",
      layers: [
        {
          id: "layer-1",
          name: "Test",
          type: "text",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          zIndex: 1,
          html: "<p>test</p>",
          fontFamily: "Inter",
          fontSize: 16,
          color: "#000",
          backgroundColor: "transparent",
        },
      ],
    });
    render(<DeleteLayerModal />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(useCanvasStore.getState().deleteTarget).toBeNull();
  });

  it("removes the layer and clears deleteTarget on Delete click", async () => {
    useCanvasStore.setState({
      deleteTarget: "layer-1",
      layers: [
        {
          id: "layer-1",
          name: "Test",
          type: "text",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          zIndex: 1,
          html: "<p>test</p>",
          fontFamily: "Inter",
          fontSize: 16,
          color: "#000",
          backgroundColor: "transparent",
        },
      ],
    });
    render(<DeleteLayerModal />);
    await userEvent.click(screen.getByText("Delete"));
    const state = useCanvasStore.getState();
    expect(state.deleteTarget).toBeNull();
    expect(state.layers).toHaveLength(0);
  });
});
