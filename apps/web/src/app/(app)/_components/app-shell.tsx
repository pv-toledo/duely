"use client";
// apps/web/src/app/(app)/_components/app-shell.tsx

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <Sidebar isOpen={isNavOpen} onOpenChange={setIsNavOpen} />
      <div className="flex flex-1 flex-col">
        <Topbar onMenuClick={() => setIsNavOpen(true)} userEmail={userEmail} userName={userName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
