import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const createClient = vi.hoisted(() => vi.fn());
const handleAuthCallback = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

vi.mock("@/lib/auth/auth-callback", () => ({
  handleAuthCallback,
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges the OAuth code and redirects to the requested next path", async () => {
    const supabase = { auth: {}, from: vi.fn() };
    createClient.mockResolvedValue(supabase);
    handleAuthCallback.mockResolvedValue({ ok: true });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc&next=/stats"),
    );

    expect(createClient).toHaveBeenCalled();
    expect(handleAuthCallback).toHaveBeenCalledWith(supabase, "abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/stats",
    );
  });

  it("redirects back to login when the OAuth code is missing", async () => {
    const response = await GET(
      new Request("http://localhost:3000/auth/callback"),
    );

    expect(handleAuthCallback).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=missing_auth_code",
    );
  });
});
