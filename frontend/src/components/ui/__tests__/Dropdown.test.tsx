import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "../Dropdown";

const options = [
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
];

describe("Dropdown", () => {
  it("renders trigger with current value", () => {
    render(<Dropdown value="red" options={options} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /red/ })).toBeInTheDocument();
  });

  it("shows options when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Dropdown value="red" options={options} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /red/ }));
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("selects an option on click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Dropdown value="red" options={options} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /red/ }));
    await user.click(screen.getByText("Green"));
    expect(onChange).toHaveBeenCalledWith("green");
  });

  it("closes dropdown after selecting an option", async () => {
    const user = userEvent.setup();
    render(<Dropdown value="red" options={options} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /red/ }));
    await user.click(screen.getByText("Green"));
    expect(screen.queryByText("Blue")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown value="red" options={options} onChange={() => {}} disabled />,
    );
    await user.click(screen.getByRole("button", { name: /red/ }));
    expect(screen.queryByText("Green")).not.toBeInTheDocument();
  });
});
