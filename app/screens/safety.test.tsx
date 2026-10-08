/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SafetyScreen } from "./safety";

beforeEach(() => {
  window.history.replaceState(null, "", "/collisions/form/safety");
});

describe("SafetyScreen", () => {
  it("continues to the details screen", () => {
    render(<SafetyScreen />);
    fireEvent.click(screen.getByRole("button", { name: /i'm safe/i }));
    expect(window.location.pathname).toBe("/collisions/form/details");
  });
});
