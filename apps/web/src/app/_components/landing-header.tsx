import Link from "next/link";
import { CtaLink } from "./cta-link";

export function LandingHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Duely
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Sign in
          </Link>
          <CtaLink href="/signup" variant="primary" className="h-9 px-4 text-sm">
            Get started
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
