import type { DocumentLanguage } from "@duely/shared";
import { formatAmount } from "../../format-amount";
import { formatRecurrenceLabel } from "../../recurrence";
import Link from "next/link";

export type DeadlineHistoryItem = {
  id: string;
  title: string;
  due_date: string;
  amount: number | null;
  recurrence: string;
  updated_at: string;
  document_id: string | null;
  documents: { search_language: DocumentLanguage | null } | null;
};

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US");
}

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
}

export function DeadlineHistoryRow({
  deadline,
  actionLabel,
  disableDocumentLink = false,
}: {
  deadline: DeadlineHistoryItem;
  actionLabel: "Completed" | "Dismissed";
  disableDocumentLink?: boolean;
}) {
  const language = deadline.documents?.search_language ?? null;
  const amountLabel = formatAmount(deadline.amount, language);
  const recurrenceLabel = formatRecurrenceLabel(deadline.recurrence);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {deadline.document_id && !disableDocumentLink ? (
          <Link
            href={`/documents/${deadline.document_id}`}
            className="min-w-0 truncate text-sm font-medium hover:underline"
            aria-label={`View document for ${deadline.title}`}
          >
            {deadline.title}
          </Link>
        ) : (
          <span className="truncate text-sm font-medium">{deadline.title}</span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">Due {formatDate(deadline.due_date)}</span>
          <span aria-hidden="true">·</span>
          <span>{recurrenceLabel}</span>
          {amountLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{amountLabel}</span>
            </>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {actionLabel} {formatUpdatedAt(deadline.updated_at)}
      </span>
    </div>
  );
}
