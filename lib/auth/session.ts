import type { Session } from "@/lib/types";

export interface SupabaseSessionUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

interface SupabaseSessionClient {
  auth: {
    getUser(): Promise<{
      data: {
        user: SupabaseSessionUser | null;
      };
      error: { message?: string } | null;
    }>;
  };
}

function getStringMetadata(
  user: SupabaseSessionUser,
  key: string,
): string | undefined {
  const value = user.user_metadata?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

export function createSessionFromSupabaseUser(
  user: SupabaseSessionUser,
): Session {
  return {
    name:
      getStringMetadata(user, "full_name") ??
      getStringMetadata(user, "name") ??
      user.email ??
      user.id,
  };
}

export async function getSessionFromSupabase(
  supabase: SupabaseSessionClient,
): Promise<Session | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return createSessionFromSupabaseUser(user);
}
