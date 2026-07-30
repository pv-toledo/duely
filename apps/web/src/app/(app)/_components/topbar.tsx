"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "./user-menu";

export function Topbar({ userEmail, userName }: { userEmail: string; userName?: string }) {
  const { isMobile } = useSidebar();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
        {isMobile ? (
          <SidebarTrigger />
        ) : (
          <span className="font-display text-2xl tracking-tight">Duely</span>
        )}
        <div className="ml-auto">
          <UserMenu userEmail={userEmail} userName={userName} />
        </div>
      </div>
    </header>
  );
}
