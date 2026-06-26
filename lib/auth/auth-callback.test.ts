import { describe, expect, it, vi } from "vitest";

import { createUserDataPayload, handleAuthCallback } from "./auth-callback";

describe("createUserDataPayload", () => {
  it("maps a Supabase user to the app user_data row", () => {
    expect(
      createUserDataPayload({
        id: "user-1",
        email: "vincent@example.com",
        user_metadata: {
          full_name: "Vincent Chen",
          avatar_url: "https://example.com/avatar.png",
        },
      }),
    ).toEqual({
      uid: "user-1",
      nickname: "Vincent Chen",
      avatar_url: "https://example.com/avatar.png",
    });
  });
});

describe("handleAuthCallback", () => {
  it("exchanges the OAuth code and upserts the signed-in user profile", async () => {
    const user = {
      id: "user-1",
      email: "vincent@example.com",
      user_metadata: {
        name: "Vincent",
        picture: "https://example.com/picture.png",
      },
    };
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    const getUser = vi.fn().mockResolvedValue({ data: { user }, error: null });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });

    const result = await handleAuthCallback(
      {
        auth: {
          exchangeCodeForSession,
          getUser,
        },
        from,
      },
      "oauth-code",
    );

    expect(result).toEqual({
      ok: true,
      userData: {
        uid: "user-1",
        nickname: "Vincent",
        avatar_url: "https://example.com/picture.png",
      },
    });
    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
    expect(from).toHaveBeenCalledWith("user_data");
    expect(upsert).toHaveBeenCalledWith(
      {
        uid: "user-1",
        nickname: "Vincent",
        avatar_url: "https://example.com/picture.png",
      },
      { onConflict: "uid" },
    );
  });
});
