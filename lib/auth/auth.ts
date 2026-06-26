interface SupabaseOAuthClient {
  auth: {
    signInWithOAuth(options: {
      provider: "google";
      options: {
        redirectTo: string;
      };
    }): Promise<unknown>;
  };
}

export function getAuthCallbackUrl(origin: string) {
  return `${origin}/auth/callback`;
}

export function signInWithGoogle(
  supabase: SupabaseOAuthClient,
  origin: string,
) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(origin),
    },
  });
}
