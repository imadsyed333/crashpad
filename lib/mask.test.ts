import { describe, expect, it } from "vitest";
import { LICENSE_MASK, PHONE_MASK, maskValue } from "./mask";

describe("maskValue", () => {
  it("formats a phone number and inserts punctuation", () => {
    expect(maskValue(PHONE_MASK, "4165551234")).toBe("(416) 555-1234");
  });

  it("keeps a partial phone number", () => {
    expect(maskValue(PHONE_MASK, "416")).toBe("(416");
    expect(maskValue(PHONE_MASK, "4165")).toBe("(416) 5");
  });

  it("drops extra phone characters", () => {
    expect(maskValue(PHONE_MASK, "4165551234999")).toBe("(416) 555-1234");
    expect(maskValue(PHONE_MASK, "abc416-555-1234xyz")).toBe("(416) 555-1234");
  });

  it("formats a license, uppercases the letter, and inserts dashes", () => {
    expect(maskValue(LICENSE_MASK, "a12345678901234")).toBe("A1234-56789-01234");
  });

  it("keeps a partial license", () => {
    expect(maskValue(LICENSE_MASK, "a12")).toBe("A12");
    expect(maskValue(LICENSE_MASK, "A12345")).toBe("A1234-5");
  });

  it("drops extra license characters", () => {
    expect(maskValue(LICENSE_MASK, "a12345678901234999")).toBe("A1234-56789-01234");
    expect(maskValue(LICENSE_MASK, "!!a12-34!!")).toBe("A1234");
  });
});
