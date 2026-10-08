/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { DetailsScreen } from "./details";

beforeEach(() => {
  useCollisionFormStore.getState().resetForm();
  window.history.replaceState(null, "", "/collisions/form/details");
});

describe("DetailsScreen", () => {
  it("stays put and shows errors when required fields are empty", () => {
    render(<DetailsScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(window.location.pathname).toBe("/collisions/form/details");
    expect(screen.getAllByText("Don't leave this empty!").length).toBeGreaterThan(0);
  });

  it("goes to media after a location and description", () => {
    render(<DetailsScreen />);
    fireEvent.change(screen.getByRole("textbox", { name: /where are you/i }), {
      target: { value: "near Jane and Finch" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /what happened/i }), {
      target: { value: "A car ran a red light" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(window.location.pathname).toBe("/collisions/form/media");
  });
});
