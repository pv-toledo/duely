export function resolveSafeRedirect(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  return next;
}
