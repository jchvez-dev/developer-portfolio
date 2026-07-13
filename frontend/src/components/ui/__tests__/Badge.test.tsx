import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>React</Badge>);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.className).toContain("bg-gray-100");
    expect(el.className).toContain("text-gray-700");
  });

  it("applies accent variant", () => {
    render(<Badge variant="accent">Accent</Badge>);
    const el = screen.getByText("Accent");
    expect(el.className).toContain("bg-accent/10");
    expect(el.className).toContain("text-accent");
  });

  it("applies custom className", () => {
    render(<Badge className="custom">Styled</Badge>);
    expect(screen.getByText("Styled").className).toContain("custom");
  });
});
