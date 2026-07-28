export const DOCUMENT_STATUS_VALUES = [
  "pending",
  "processing",
  "needs_review",
  "archived",
  "failed",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUS_VALUES)[number];

export const DOCUMENT_CATEGORY_VALUES = ["vehicle", "health", "bills"] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORY_VALUES)[number];

export const DEADLINE_RECURRENCE_VALUES = ["none", "monthly", "yearly"] as const;
export type DeadlineRecurrence = (typeof DEADLINE_RECURRENCE_VALUES)[number];

export const DEADLINE_STATUS_VALUES = ["active", "done", "dismissed"] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUS_VALUES)[number];