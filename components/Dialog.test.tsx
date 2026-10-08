/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    render(
      <Dialog title="Delete Collision" message="Are you sure?" open={false} onSuccess={() => {}} />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the title when open and Yes calls onSuccess", () => {
    const onSuccess = vi.fn();
    render(
      <Dialog title="Delete Collision" message="Are you sure?" open onSuccess={onSuccess} />,
    );
    expect(screen.getByRole("dialog", { name: "Delete Collision" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("shows Ok and hides No in info mode", () => {
    render(
      <Dialog
        title="Saved Draft"
        message="Your progress has been saved."
        open
        isInfo
        onSuccess={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Ok" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "No" })).toBeNull();
  });
});
