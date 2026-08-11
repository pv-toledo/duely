"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveOrigin } from "@/lib/resolve-origin";

import { signupSchema, loginSchema, type SignupCredentials, type LoginCredentials } from "./schema";
import { resolveSafeRedirect } from "@/lib/safe-direct";

export async function signup(credentials: SignupCredentials, next?: string) {
  const parsed = signupSchema.safeParse(credentials);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect(resolveSafeRedirect(next, "/documents"));
}

export async function login(credentials: LoginCredentials, next?: string) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect(resolveSafeRedirect(next, "/documents"));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle(next?: string) {
  const origin = resolveOrigin((await headers()).get("origin"));
  const supabase = await createClient();

  const redirectTo = new URL(`${origin}/auth/callback`);
  if (next) {
    redirectTo.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
