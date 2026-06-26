import { describe, expect, it, vi } from "vitest";

import { signInWithGoogle } from "./auth";

describe("signInWithGoogle", () => {
  it("starts Google OAuth and redirects back to the auth callback route", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });

    await signInWithGoogle(
      { auth: { signInWithOAuth } },
      "http://localhost:3000",
    );

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  });
});
