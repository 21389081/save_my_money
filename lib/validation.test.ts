import { describe, expect, it } from "vitest";
import { validateLedger, validateTransaction } from "./validation";

describe("validation", () => {
  it("rejects a blank ledger name and non-positive budget", () => {
    expect(validateLedger({ name: " ", initialBudget: 0 })).toEqual({
      name: "請輸入帳本名稱",
      initialBudget: "預算必須大於 0",
    });
  });

  it("rejects empty title, non-positive amount, and future dates", () => {
    expect(
      validateTransaction(
        { title: "", amount: -1, date: "2026-06-23" },
        "2026-06-22",
      ),
    ).toEqual({
      title: "請輸入條目",
      amount: "金額必須大於 0",
      date: "交易日期不可晚於今天",
    });
  });
});
