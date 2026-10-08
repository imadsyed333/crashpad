/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  it("renders a label and a default input", () => {
    render(<Field label="Make" />);
    expect(screen.getByText("Make")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("adds the error class and alert text", () => {
    const { container } = render(
      <Field label="Make" error={["Make must not be empty"]} />,
    );
    expect(container.querySelector("label")).toHaveClass("field", "error");
    expect(screen.getByRole("alert")).toHaveTextContent("Make must not be empty");
  });

  it("does not show an alert when error is empty", () => {
    render(<Field label="Make" error={[]} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
