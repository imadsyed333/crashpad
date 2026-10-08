/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollisionList } from "./CollisionList";

describe("CollisionList", () => {
  it("shows the empty state and calls onAdd", () => {
    const onAdd = vi.fn();
    render(<CollisionList onAdd={onAdd} />);
    expect(screen.getByText("No collisions recorded")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add Collision" }));
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
