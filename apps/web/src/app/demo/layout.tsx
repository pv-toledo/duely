"use client";

import type { ReactNode } from "react";
import { CalendarClock, LayoutDashboard } from "lucide-react";
import { AppSidebar } from "../(app)/_components/app-sidebar";
import { DemoTopbar } from "./_components/demo-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DemoStoreProvider } from "@/lib/demo/demo-store";

const DEMO_NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Deadlines", url: "/deadlines", icon: CalendarClock },
];

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoStoreProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar basePath="/demo" navItems={DEMO_NAV_ITEMS} />
        <SidebarInset>
          <DemoTopbar />
          <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DemoStoreProvider>
  );
}
