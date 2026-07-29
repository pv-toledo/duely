import { DocumentStatus } from "@duely/shared";

const STATUS_STYLES: Record<DocumentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-border text-muted-foreground" },
  processing: { label: "Processing", className: "border-border text-muted-foreground" },
  needs_review: {
    label: "Needs review",
    className: "border-transparent bg-warning-bg text-warning",
  },
  archived: { label: "Archived", className: "border-transparent bg-success-bg text-success" },
  failed: { label: "Failed", className: "border-transparent bg-destructive-bg text-destructive" },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
