"use client";

import { Menu } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Topbar({
  onMenuClick,
  userEmail,
  userName,
}: {
  onMenuClick: () => void;
  userEmail: string;
  userName?: string;
}) {
  return (
    <header className="flex h-14 items-center border-b border-border px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="text-muted-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      <div className="ml-auto">
        <UserMenu userEmail={userEmail} userName={userName} />
      </div>
    </header>
  );
}
