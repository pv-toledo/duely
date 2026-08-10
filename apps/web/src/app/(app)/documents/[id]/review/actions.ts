"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type ConfirmReviewInput = {
  category: string;
  documentType: string;
  subjectName: string | null;
  issuerName: string | null;
  title: string;
  dueDate: string | null;
  amount: number | null;
  documentNumber: string | null;
  plate: string | null;
  documentDate: string | null;
  description: string | null;
  referencePeriod: string | null;
  reminderOffsetDays: number | null;
};

export type ConfirmReviewFailureReason = "not_authenticated" | "confirm_failed";

type ConfirmReviewResult =
  { success: true } | { success: false; reason: ConfirmReviewFailureReason };

function omitNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
  ) as Partial<T>;
}

export async function confirmDocumentReviewAction(
  documentId: string,
  input: ConfirmReviewInput
): Promise<ConfirmReviewResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, reason: "not_authenticated" };
  }

  const args = {
    ...omitNullish({
      p_document_id: documentId,
      p_category: input.category,
      p_document_type: input.documentType,
      p_subject_name: input.subjectName,
      p_issuer_name: input.issuerName,
      p_title: input.title,
      p_due_date: input.dueDate,
      p_amount: input.amount,
      p_document_number: input.documentNumber,
      p_plate: input.plate,
      p_document_date: input.documentDate,
      p_description: input.description,
      p_reference_period: input.referencePeriod,
    }),
    p_reminder_offset_days: input.reminderOffsetDays,
  } as Database["public"]["Functions"]["confirm_document_review"]["Args"];

  const { error: rpcError } = await supabase.rpc("confirm_document_review", args);

  if (rpcError) {
    return { success: false, reason: "confirm_failed" };
  }

  return { success: true };
}
