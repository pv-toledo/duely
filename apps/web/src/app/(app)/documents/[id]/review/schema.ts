import { z } from "zod";
import {
  VEHICLE_DOCUMENT_TYPE_VALUES,
  HEALTH_DOCUMENT_TYPE_VALUES,
  BILLS_DOCUMENT_TYPE_VALUES,
} from "@duely/shared";

const optionalText = () => z.string().trim().nullable();

const baseFields = {
  title: z.string().trim().nullable(),
  subjectName: optionalText(),
  issuerName: optionalText(),
  dueDate: z.string().nullable(),
  hasNoDueDate: z.boolean(),
  reminderOffsetDays: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be zero or greater")
    .nullable(),
};

const vehicleSchema = z.object({
  ...baseFields,
  category: z.literal("vehicle"),
  documentType: z.enum(VEHICLE_DOCUMENT_TYPE_VALUES).nullable(),
  documentNumber: optionalText(),
  plate: optionalText(),
  amount: z.number().nullable(),
});

const healthSchema = z.object({
  ...baseFields,
  category: z.literal("health"),
  documentType: z.enum(HEALTH_DOCUMENT_TYPE_VALUES).nullable(),
  documentDate: z.string().nullable(),
  description: optionalText(),
});

const billsSchema = z.object({
  ...baseFields,
  category: z.literal("bills"),
  documentType: z.enum(BILLS_DOCUMENT_TYPE_VALUES).nullable(),
  documentNumber: optionalText(),
  referencePeriod: optionalText(),
  description: optionalText(),
  amount: z.number().nullable(),
});

export const documentReviewSchema = z
  .discriminatedUnion("category", [vehicleSchema, healthSchema, billsSchema], {
    error: "Category is required",
  })
  .superRefine((data, ctx) => {
    if (!data.title) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "Title is required" });
    }
    if (!data.documentType) {
      ctx.addIssue({
        code: "custom",
        path: ["documentType"],
        message: "Document type is required",
      });
    }
    if (!data.hasNoDueDate && data.dueDate === null) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "Due date is required" });
    }
    if (data.category === "health" && !data.subjectName) {
      ctx.addIssue({
        code: "custom",
        path: ["subjectName"],
        message: "Subject name is required",
      });
    }
    if (data.category === "bills") {
      if (data.amount === null) {
        ctx.addIssue({ code: "custom", path: ["amount"], message: "Amount is required" });
      }
      if (data.documentType === "other" && !data.description) {
        ctx.addIssue({
          code: "custom",
          path: ["description"],
          message: "Description is required",
        });
      }
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
  reminderOffsetDays: string;
};
