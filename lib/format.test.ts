import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencySymbol } from "./format";

describe("formatCurrency", () => {
  it("formats values with the requested currency code", () => {
    expect(formatCurrency(1200, "USD")).toBe("US$1,200");
  });

  it("uses the familiar input prefix for TWD", () => {
    expect(formatCurrencySymbol("TWD")).toBe("NT$");
  });
});
