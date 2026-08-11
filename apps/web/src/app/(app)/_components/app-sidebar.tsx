"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, FileText, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const DEFAULT_NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Deadlines", url: "/deadlines", icon: CalendarClock },
];

export function AppSidebar({
  basePath = "",
  navItems = DEFAULT_NAV_ITEMS,
}: {
  basePath?: string;
  navItems?: typeof DEFAULT_NAV_ITEMS;
} = {}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      {isMobile && (
        <SidebarHeader>
          <span className="px-2 font-display text-lg font-medium tracking-tight">Duely</span>
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const href = `${basePath}${item.url}`;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={pathname === href}
                      tooltip={item.title}
                      render={<Link href={href} onClick={() => setOpenMobile(false)} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
