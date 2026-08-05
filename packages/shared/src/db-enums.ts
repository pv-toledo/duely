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

export const VEHICLE_DOCUMENT_TYPE_VALUES = [
  "drivers_license",
  "vehicle_registration",
  "insurance",
] as const;
export type VehicleDocumentType = (typeof VEHICLE_DOCUMENT_TYPE_VALUES)[number];

export const HEALTH_DOCUMENT_TYPE_VALUES = [
  "exam_result",
  "prescription",
  "vaccination_record",
] as const;
export type HealthDocumentType = (typeof HEALTH_DOCUMENT_TYPE_VALUES)[number];

export const BILLS_DOCUMENT_TYPE_VALUES = [
  "utility_water",
  "utility_electricity",
  "utility_gas",
  "condo_fee",
  "internet",
  "credit_card_invoice",
  "other"
] as const;
export type BillsDocumentType = (typeof BILLS_DOCUMENT_TYPE_VALUES)[number];

export const DEADLINE_RECURRENCE_VALUES = ["none", "monthly", "yearly"] as const;
export type DeadlineRecurrence = (typeof DEADLINE_RECURRENCE_VALUES)[number];

export const DEADLINE_STATUS_VALUES = ["active", "done", "dismissed"] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUS_VALUES)[number];

export const DOCUMENT_LANGUAGE_VALUES = ["pt", "en"] as const;
export type DocumentLanguage = (typeof DOCUMENT_LANGUAGE_VALUES)[number];