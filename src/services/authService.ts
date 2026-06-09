import { supabase } from "@/src/lib/supabase";
import { env } from "@/src/lib/env";

export async function signIn(email: string, password: string) {
  if (!env.isSupabaseConfigured) {
    return {
      data: { user: null, session: null },
      error: new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.")
    };
  }

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!env.isSupabaseConfigured) {
    return { error: null };
  }

  return supabase.auth.signOut();
}

export async function getSession() {
  if (!env.isSupabaseConfigured) {
    return { data: { session: null }, error: null };
  }

  return supabase.auth.getSession();
}
