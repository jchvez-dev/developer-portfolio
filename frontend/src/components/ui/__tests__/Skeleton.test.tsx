import { render } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });

  it("applies text variant by default", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded");
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-full");
  });

  it("applies circle variant", () => {
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-10");
  });

  it("applies rect variant", () => {
    const { container } = render(<Skeleton variant="rect" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-lg");
    expect(el.className).toContain("h-20");
    expect(el.className).toContain("w-full");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-48" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-8");
    expect(el.className).toContain("w-48");
  });

  it("custom className overrides variant size", () => {
    const { container } = render(
      <Skeleton variant="rect" className="h-12 w-12" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-12");
    expect(el.className).toContain("w-12");
    expect(el.className).toContain("rounded-lg");
  });
});
