import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Card>Default</Card>);
    const el = screen.getByText("Default");
    expect(el.className).toContain("border-gray-200");
    expect(el.className).toContain("bg-gray-50");
  });

  it("applies elevated variant", () => {
    render(<Card variant="elevated">Elevated</Card>);
    const el = screen.getByText("Elevated");
    expect(el.className).toContain("shadow-md");
    expect(el.className).toContain("border-transparent");
  });

  it("applies bordered variant", () => {
    render(<Card variant="bordered">Bordered</Card>);
    const el = screen.getByText("Bordered");
    expect(el.className).toContain("border-gray-300");
    expect(el.className).toContain("bg-transparent");
  });

  it("applies custom className", () => {
    render(<Card className="extra">Content</Card>);
    expect(screen.getByText("Content").className).toContain("extra");
  });
});
