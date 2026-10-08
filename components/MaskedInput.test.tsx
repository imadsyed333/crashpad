/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PHONE_MASK } from "@/lib/mask";
import { MaskedInput } from "./MaskedInput";

describe("MaskedInput", () => {
  it("applies the phone mask on change", () => {
    const onChange = vi.fn();
    render(
      <MaskedInput
        label="Phone number"
        value=""
        onChange={onChange}
        mask={PHONE_MASK}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "4165551234" } });
    expect(onChange).toHaveBeenCalledWith("(416) 555-1234");
  });
});
