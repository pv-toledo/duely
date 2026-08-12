import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex h-dvh flex-col items-center justify-center overflow-y-auto px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:top-6 sm:left-6"
      >
        <ArrowLeft className="size-4" />
        Home
      </Link>
      {children}
    </main>
  );
}
