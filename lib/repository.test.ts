import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY, localStorageRepository } from "./repository";

describe("localStorageRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates versioned demo data on first load", () => {
    const state = localStorageRepository.load();
    expect(state.version).toBe(1);
    expect(state.ledgers.length).toBeGreaterThan(0);
    expect(state.transactions.length).toBeGreaterThan(0);
    expect(state.currentLedgerId).toBe(state.ledgers[0].id);
  });

  it("recovers from corrupted data", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    const state = localStorageRepository.load();
    expect(state.ledgers.length).toBeGreaterThan(0);
    expect(() => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "")).not.toThrow();
  });

  it("persists session and ledger state", () => {
    const state = localStorageRepository.load();
    localStorageRepository.save({ ...state, session: { name: "Vincent" } });
    expect(localStorageRepository.load().session).toEqual({ name: "Vincent" });
  });

  it("preserves a supplied session when rebuilding demo data", () => {
    expect(localStorageRepository.reset({ name: "Vincent" }).session).toEqual({
      name: "Vincent",
    });
  });

  it("falls back to memory when LocalStorage writes are unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(() => localStorageRepository.reset()).not.toThrow();
    expect(localStorageRepository.load().ledgers.length).toBeGreaterThan(0);
  });
});
