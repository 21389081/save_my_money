export interface AuthCallbackUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface UserDataPayload {
  uid: string;
  nickname: string;
  avatar_url: string | null;
}

interface ErrorLike {
  message?: string;
}

type AwaitableResult<T> = Promise<T> | PromiseLike<T>;

export interface SupabaseAuthCallbackClient {
  auth: {
    exchangeCodeForSession(code: string): Promise<{ error: ErrorLike | null }>;
    getUser(): Promise<{
      data: {
        user: AuthCallbackUser | null;
      };
      error: ErrorLike | null;
    }>;
  };
  from(table: "user_data"): {
    upsert(
      payload: UserDataPayload,
      options: { onConflict: "uid" },
    ): AwaitableResult<{ error: ErrorLike | null }>;
  };
}

export type AuthCallbackResult =
  | { ok: true; userData: UserDataPayload }
  | {
      ok: false;
      reason:
        | "exchange_failed"
        | "missing_user"
        | "user_fetch_failed"
        | "profile_upsert_failed";
      error?: ErrorLike | null;
    };

function getStringMetadata(
  user: AuthCallbackUser,
  key: string,
): string | undefined {
  const value = user.user_metadata?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

export function createUserDataPayload(
  user: AuthCallbackUser,
): UserDataPayload {
  return {
    uid: user.id,
    nickname:
      getStringMetadata(user, "full_name") ??
      getStringMetadata(user, "name") ??
      user.email ??
      user.id,
    avatar_url:
      getStringMetadata(user, "avatar_url") ??
      getStringMetadata(user, "picture") ??
      null,
  };
}

export async function handleAuthCallback(
  supabase: SupabaseAuthCallbackClient,
  code: string,
): Promise<AuthCallbackResult> {
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return { ok: false, reason: "exchange_failed", error: exchangeError };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { ok: false, reason: "user_fetch_failed", error: userError };
  }

  if (!user) {
    return { ok: false, reason: "missing_user" };
  }

  const userData = createUserDataPayload(user);
  const { error: upsertError } = await supabase
    .from("user_data")
    .upsert(userData, { onConflict: "uid" });

  if (upsertError) {
    return {
      ok: false,
      reason: "profile_upsert_failed",
      error: upsertError,
    };
  }

  return { ok: true, userData };
}
