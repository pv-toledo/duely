import type { DocumentLanguage } from "@duely/shared";

export function formatAmount(
  value: number | null,
  language: DocumentLanguage | null
): string | null {
  if (value === null) {
    return null;
  }
  // Currency is inferred from document language, not extracted from the
  // document itself -- a deliberate simplification (see docs/ideas.md).
  // Defaults to BRL when language is unknown, matching the app's primary use case.
  const currency = language === "en" ? "USD" : "BRL";
  return value.toLocaleString("en-US", { style: "currency", currency });
}
