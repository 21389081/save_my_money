import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY, localStorageRepository } from "./repository";

describe("localStorageRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a clean empty state on first load", () => {
    const state = localStorageRepository.load();
    expect(state.version).toBe(1);
    expect(state.money_book).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.current_money_book_id).toBeNull();
  });

  it("recovers from corrupted data", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    const state = localStorageRepository.load();
    expect(state.money_book).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.current_money_book_id).toBeNull();
    expect(() => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "")).not.toThrow();
  });

  it("persists session and money book state", () => {
    const state = localStorageRepository.load();
    localStorageRepository.save({ ...state, session: { name: "Vincent" } });
    expect(localStorageRepository.load().session).toEqual({ name: "Vincent" });
  });

  it("preserves a supplied session when rebuilding empty data", () => {
    expect(localStorageRepository.reset({ name: "Vincent" }).session).toEqual({
      name: "Vincent",
    });
  });

  it("falls back to memory when LocalStorage writes are unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(() => localStorageRepository.reset()).not.toThrow();
    expect(localStorageRepository.load().money_book).toEqual([]);
  });
});
