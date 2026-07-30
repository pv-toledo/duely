// apps/web/src/app/(app)/layout.tsx
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "./_components/app-sidebar";
import { Topbar } from "./_components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  const email = (claimsData?.claims.email as string | undefined) ?? "";
  const name =
    claimsData?.claims.user_metadata?.full_name ?? claimsData?.claims.user_metadata?.name;

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <Topbar userEmail={email} userName={name} />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
