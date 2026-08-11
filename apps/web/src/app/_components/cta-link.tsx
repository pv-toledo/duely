import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

export function CtaLink({ href, children, variant = "primary", className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors",
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </Link>
  );
}
