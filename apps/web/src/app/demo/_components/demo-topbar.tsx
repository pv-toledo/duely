"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { CtaLink } from "../../_components/cta-link";

export function DemoTopbar() {
  const { isMobile } = useSidebar();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
        {isMobile ? (
          <SidebarTrigger />
        ) : (
          <span className="font-display text-2xl tracking-tight">Duely</span>
        )}
        <span className="hidden items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground sm:inline-flex">
          <Sparkles className="size-3" />
          Demo mode — changes aren&apos;t saved
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Exit demo
          </Link>
          <CtaLink href="/signup" variant="primary" className="h-9 px-4 text-sm">
            Sign up free
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
