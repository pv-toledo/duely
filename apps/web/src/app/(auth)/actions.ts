"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveOrigin } from "@/lib/resolve-origin";
import { signupSchema, loginSchema, type SignupCredentials, type LoginCredentials } from "./schema";

export async function signup(credentials: SignupCredentials) {
  const parsed = signupSchema.safeParse(credentials);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

export async function login(credentials: LoginCredentials) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const origin = resolveOrigin((await headers()).get("origin"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
