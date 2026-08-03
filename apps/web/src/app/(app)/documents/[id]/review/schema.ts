import { z } from "zod";
import {
  VEHICLE_DOCUMENT_TYPE_VALUES,
  HEALTH_DOCUMENT_TYPE_VALUES,
  BILLS_DOCUMENT_TYPE_VALUES,
} from "@duely/shared";

const optionalText = () => z.string().trim().min(1, "This field can't be blank").nullable();

const baseFields = {
  title: z.string().trim().min(1, "Title is required"),
  subjectName: optionalText(),
  issuerName: optionalText(),
  dueDate: z.string().nullable(),
  hasNoDueDate: z.boolean(),
};

const vehicleSchema = z.object({
  ...baseFields,
  category: z.literal("vehicle"),
  documentType: z.enum(VEHICLE_DOCUMENT_TYPE_VALUES),
  documentNumber: optionalText(),
  plate: optionalText(),
  amount: z.number().nullable(),
});

const healthSchema = z.object({
  ...baseFields,
  category: z.literal("health"),
  documentType: z.enum(HEALTH_DOCUMENT_TYPE_VALUES),
  subjectName: z.string().trim().min(1, "Subject name is required"),
  documentDate: z.string().nullable(),
  description: optionalText(),
});

const billsSchema = z.object({
  ...baseFields,
  category: z.literal("bills"),
  documentType: z.enum(BILLS_DOCUMENT_TYPE_VALUES),
  documentNumber: optionalText(),
  referencePeriod: optionalText(),
  amount: z.number({ error: "Amount is required" }),
});

export const documentReviewSchema = z
  .discriminatedUnion("category", [vehicleSchema, healthSchema, billsSchema])
  .superRefine((data, ctx) => {
    if (!data.hasNoDueDate && data.dueDate === null) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due date is required, or mark this document as having no due date.",
      });
    }
  });

export type ReviewCategory = "vehicle" | "health" | "bills";

export type ReviewFormInput = {
  category: ReviewCategory | null;
  documentType: string | null;
  subjectName: string;
  issuerName: string;
  title: string;
  dueDate: string | null;
  hasNoDueDate: boolean;
  amount: string;
  documentNumber: string;
  plate: string;
  documentDate: string;
  description: string;
  referencePeriod: string;
};

export type DocumentReviewValues = z.infer<typeof documentReviewSchema>;
