import Link from "next/link";
import type { DocumentStatus } from "@duely/shared";
import { truncateFilename } from "@/lib/format-filename";
import { DocumentStatusBadge } from "../../_components/document-status-badge";
import { getDocumentHref, getDocumentAriaLabel } from "../../document-links";

export type RecentDocument = {
  id: string;
  original_filename: string;
  status: DocumentStatus;
  created_at: string;
  title: string | null;
};

export function RecentDocuments({
  documents,
  disableLinks = false,
  onDocumentClick,
}: {
  documents: RecentDocument[];
  /** When true, renders every row as static (no drill-down). Used by the
   * read-only demo, where /documents/{id} and /documents/{id}/review don't
   * resolve to real data. Defaults to false — production behavior unchanged. */
  disableLinks?: boolean;
  /** Called instead of navigation for needs_review documents when
   * disableLinks is true. Used by the demo to open an in-memory preview.
   * Archived documents stay inert — no preview built for that case yet. */
  onDocumentClick?: (document: RecentDocument) => void;
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((document) => {
        const href = disableLinks ? null : getDocumentHref(document.id, document.status);
        const isClickableFallback =
          disableLinks && Boolean(onDocumentClick) && document.status === "needs_review";
        const displayName = document.title ?? truncateFilename(document.original_filename);
        const ariaLabel = getDocumentAriaLabel(document.status, document.original_filename);

        const content = (
          <>
            <span
              className="min-w-0 flex-1 truncate text-sm font-medium"
              title={document.original_filename}
            >
              {displayName}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {new Date(document.created_at).toLocaleDateString("en-US")}
              </span>
              <DocumentStatusBadge status={document.status} />
            </div>
          </>
        );

        if (href) {
          return (
            <Link
              key={document.id}
              href={href}
              aria-label={ariaLabel}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-opacity hover:opacity-80"
            >
              {content}
            </Link>
          );
        }

        if (isClickableFallback) {
          return (
            <button
              key={document.id}
              type="button"
              onClick={() => onDocumentClick?.(document)}
              aria-label={ariaLabel}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-border p-4 text-left transition-opacity hover:opacity-80"
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={document.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
