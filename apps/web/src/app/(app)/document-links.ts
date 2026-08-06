import type { DocumentStatus } from "@duely/shared";

export function getDocumentHref(id: string, status: DocumentStatus): string | null {
  if (status === "needs_review") {
    return `/documents/${id}/review`;
  }
  if (status === "archived") {
    return `/documents/${id}`;
  }
  return null;
}

export function getDocumentAriaLabel(status: DocumentStatus, originalFilename: string): string {
  return status === "needs_review" ? `Review ${originalFilename}` : `View ${originalFilename}`;
}
