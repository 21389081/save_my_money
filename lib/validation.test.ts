import { describe, expect, it } from "vitest";
import { validateMoneyBook, validateTransaction } from "./validation";

describe("validation", () => {
  it("allows a zero initial value while rejecting a blank money book name", () => {
    expect(validateMoneyBook({ name: " ", how_much: 0 })).toEqual({
      name: "請輸入帳本名稱",
    });
  });

  it("rejects negative and non-finite initial values", () => {
    expect(validateMoneyBook({ name: "日常", how_much: -1 })).toEqual({
      how_much: "初始值不可小於 0",
    });
    expect(validateMoneyBook({ name: "日常", how_much: Number.NaN })).toEqual({
      how_much: "初始值不可小於 0",
    });
  });

  it("rejects empty name, non-positive amount, and future dates", () => {
    expect(
      validateTransaction(
        { name: "", how_much: -1, transaction_date: "2026-06-23" },
        "2026-06-22",
      ),
    ).toEqual({
      name: "請輸入條目",
      how_much: "金額必須大於 0",
      transaction_date: "交易日期不可晚於今天",
    });
  });
});
