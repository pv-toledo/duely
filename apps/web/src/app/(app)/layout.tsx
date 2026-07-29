import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./_components/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  const email = (claimsData?.claims.email as string | undefined) ?? "";
  // Login por e-mail/senha não coleta nome — só existe pra quem entrou via Google.
  const name =
    claimsData?.claims.user_metadata?.full_name ?? claimsData?.claims.user_metadata?.name;

  return (
    <AppShell userEmail={email} userName={name}>
      {children}
    </AppShell>
  );
}
