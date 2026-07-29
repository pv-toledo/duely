"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // ajuste o nome se for diferente no seu server.ts

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
