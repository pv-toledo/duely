export * from "./db-enums";

import type { VehicleDocumentType, HealthDocumentType, BillsDocumentType } from "./db-enums";

export interface VehicleFields {
  document_type: VehicleDocumentType;
  subject_name: string;
  issuer_name: string;
  document_number: string;
  plate: string | null;
  due_date: string; // ISO 8601
  amount: number | null;
}

export interface HealthFields {
  document_type: HealthDocumentType;
  subject_name: string;
  issuer_name: string;
  document_date: string; // ISO 8601
  due_date: string | null; // ISO 8601
  description: string;
}

export interface BillsFields {
  document_type: BillsDocumentType;
  subject_name: string;
  issuer_name: string;
  amount: number;
  due_date: string; // ISO 8601
  reference_period: string;
  document_number: string | null;
}