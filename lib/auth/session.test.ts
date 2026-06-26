import { describe, expect, it, vi } from "vitest";

import { createSessionFromSupabaseUser, getSessionFromSupabase } from "./session";

describe("createSessionFromSupabaseUser", () => {
  it("uses Google profile names before falling back to email", () => {
    expect(
      createSessionFromSupabaseUser({
        id: "user-1",
        email: "vincent@example.com",
        user_metadata: {
          full_name: "Vincent Chen",
        },
      }),
    ).toEqual({ name: "Vincent Chen" });
  });
});

describe("getSessionFromSupabase", () => {
  it("returns the app session for the current Supabase user", async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "vincent@example.com",
          user_metadata: {
            name: "Vincent",
          },
        },
      },
      error: null,
    });

    await expect(getSessionFromSupabase({ auth: { getUser } })).resolves.toEqual(
      { name: "Vincent" },
    );
  });
});
