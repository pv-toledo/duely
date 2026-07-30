"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "../actions";

function initialFrom(label: string): string {
  return label.slice(0, 1).toUpperCase();
}

export function UserMenu({ userEmail, userName }: { userEmail: string; userName?: string }) {
  const [isPending, startTransition] = useTransition();
  const displayName = userName ?? userEmail;

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
        aria-label="Account menu"
      >
        {initialFrom(displayName)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{displayName}</span>
            {userName && (
              <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
          <LogOut />
          {isPending ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
