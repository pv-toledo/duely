"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Credentials, credentialsSchema } from "./schema";
import { headers } from "next/headers";
import { resolveOrigin } from "@/lib/resolve-origin";

export async function signup(credentials: Credentials) {
  const parsed = await credentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    return {
      error: "Invalid data",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/account");
}

export async function login(credentials: Credentials) {
  const parsed = await credentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    return {
      error: "Invalid data",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: error.message,
    };
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
