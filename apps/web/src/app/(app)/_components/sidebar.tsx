"use client";
// apps/web/src/app/(app)/_components/sidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [{ label: "Documents", href: "/documents", icon: FileText }];

function BrandMark() {
  return <span className="font-display text-lg font-medium tracking-tight">Duely</span>;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-4 lg:flex">
        <div className="mb-6 px-2">
          <BrandMark />
        </div>
        <NavLinks />
      </aside>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-4">
          <SheetHeader className="px-2">
            <SheetTitle>
              <BrandMark />
            </SheetTitle>
          </SheetHeader>
          <NavLinks onNavigate={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
