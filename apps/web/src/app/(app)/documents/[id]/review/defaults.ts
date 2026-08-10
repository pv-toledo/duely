import { z } from "zod";
import { DOCUMENT_CATEGORY_VALUES } from "@duely/shared";
import { DOCUMENT_TYPE_LABELS } from "../../labels";

const categorySchema = z.enum(DOCUMENT_CATEGORY_VALUES).nullable().catch(null);

const rawResponseSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("vehicle"),
    due_date: z.string().nullable(),
    document_number: z.string().nullable(),
    plate: z.string().nullable(),
    amount: z.string().nullable(),
  }),
  z.object({
    category: z.literal("health"),
    due_date: z.string().nullable(),
    document_date: z.string().nullable(),
    description: z.string().nullable(),
  }),
  z.object({
    category: z.literal("bills"),
    due_date: z.string().nullable(),
    document_number: z.string().nullable(),
    reference_period: z.string().nullable(),
    amount: z.string().nullable(),
  }),
  z.object({
    category: z.literal("unclear"),
    reason: z.string(),
  }),
]);

type ResidualFields = {
  dueDate: string | null;
  amount: number | null;
  documentNumber: string | null;
  plate: string | null;
  documentDate: string | null;
  description: string | null;
  referencePeriod: string | null;
};

const emptyResidualFields: ResidualFields = {
  dueDate: null,
  amount: null,
  documentNumber: null,
  plate: null,
  documentDate: null,
  description: null,
  referencePeriod: null,
};

function extractResidualFields(rawResponse: unknown): ResidualFields {
  const parsed = rawResponseSchema.safeParse(rawResponse);
  if (!parsed.success) {
    return emptyResidualFields;
  }

  const fields = parsed.data;

  switch (fields.category) {
    case "vehicle":
      return {
        ...emptyResidualFields,
        dueDate: fields.due_date,
        amount: fields.amount !== null ? Number(fields.amount) : null,
        documentNumber: fields.document_number,
        plate: fields.plate,
      };
    case "bills":
      return {
        ...emptyResidualFields,
        dueDate: fields.due_date,
        amount: fields.amount !== null ? Number(fields.amount) : null,
        documentNumber: fields.document_number,
        referencePeriod: fields.reference_period,
      };
    case "health":
      return {
        ...emptyResidualFields,
        dueDate: fields.due_date,
        documentDate: fields.document_date,
        description: fields.description,
      };
    case "unclear":
    default:
      return emptyResidualFields;
  }
}

function generateDefaultTitle(params: {
  documentType: string | null;
  subjectName: string | null;
  originalFilename: string;
}): string {
  if (!params.documentType) {
    return params.originalFilename;
  }
  const label = DOCUMENT_TYPE_LABELS[params.documentType] ?? params.documentType;
  return params.subjectName ? `${label} — ${params.subjectName}` : label;
}

export type ReviewDefaultValues = {
  category: "vehicle" | "health" | "bills" | null;
  documentType: string | null;
  subjectName: string | null;
  issuerName: string | null;
  title: string;
  dueDate: string | null;
  hasNoDueDate: boolean;
  amount: number | null;
  documentNumber: string | null;
  plate: string | null;
  documentDate: string | null;
  description: string | null;
  referencePeriod: string | null;
  reminderOffsetDays: number | null;
};

export function buildDefaultReviewValues(
  document: {
    category: string | null;
    document_type: string | null;
    subject_name: string | null;
    issuer_name: string | null;
    original_filename: string;
  },
  rawResponse: unknown
): ReviewDefaultValues {
  const residual = extractResidualFields(rawResponse);

  return {
    category: categorySchema.parse(document.category),
    documentType: document.document_type,
    subjectName: document.subject_name,
    issuerName: document.issuer_name,
    title: generateDefaultTitle({
      documentType: document.document_type,
      subjectName: document.subject_name,
      originalFilename: document.original_filename,
    }),
    dueDate: residual.dueDate,
    hasNoDueDate: false,
    amount: residual.amount,
    documentNumber: residual.documentNumber,
    plate: residual.plate,
    documentDate: residual.documentDate,
    description: residual.description,
    referencePeriod: residual.referencePeriod,
    reminderOffsetDays: 3,
  };
}
