import {
  DOCUMENT_CATEGORY_VALUES,
  DOCUMENT_LANGUAGE_VALUES,
  type DocumentCategory,
  type DocumentLanguage,
} from "@duely/shared";

export function isDocumentCategory(value: string): value is DocumentCategory {
  return (DOCUMENT_CATEGORY_VALUES as readonly string[]).includes(value);
}

export function isDocumentLanguage(value: string): value is DocumentLanguage {
  return (DOCUMENT_LANGUAGE_VALUES as readonly string[]).includes(value);
}

export const CATEGORY_LABELS: Record<"vehicle" | "health" | "bills", string> = {
  vehicle: "Vehicle",
  health: "Health",
  bills: "Bills",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  drivers_license: "Driver's License",
  vehicle_registration: "Vehicle Registration",
  insurance: "Insurance",
  exam_result: "Exam Result",
  prescription: "Prescription",
  vaccination_record: "Vaccination Record",
  utility_water: "Water Bill",
  utility_electricity: "Electricity Bill",
  utility_gas: "Gas Bill",
  condo_fee: "Condo Fee",
  internet: "Internet Bill",
  credit_card_invoice: "Credit Card Invoice",
  other: "Other",
};
