"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addInterval, isRecurringInterval } from "./recurrence";

type DeadlineStatus = "done" | "dismissed";

export async function updateDeadlineStatusAction(
  deadlineId: string,
  newStatus: DeadlineStatus
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { data: updatedDeadline, error: updateError } = await supabase
    .from("deadlines")
    .update({ status: newStatus })
    .eq("id", deadlineId)
    .select("title, due_date, amount, recurrence, document_id")
    .single();

  if (updateError || !updatedDeadline) {
    return { success: false };
  }

  if (newStatus === "done" && isRecurringInterval(updatedDeadline.recurrence)) {
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims.sub;

    if (userId) {
      const { error: insertError } = await supabase.from("deadlines").insert({
        user_id: userId,
        document_id: updatedDeadline.document_id,
        title: updatedDeadline.title,
        due_date: addInterval(updatedDeadline.due_date, updatedDeadline.recurrence),
        amount: updatedDeadline.amount,
        recurrence: updatedDeadline.recurrence,
        status: "active",
      });

      if (insertError) {
        console.error("Failed to create next recurring deadline", insertError);
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/deadlines");
  return { success: true };
}

export async function createManualDeadlineAction(input: {
  title: string;
  dueDate: string;
  amount: number | null;
  recurrence: "none" | "monthly" | "yearly";
}): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    return { success: false };
  }

  const { error } = await supabase.from("deadlines").insert({
    user_id: userId,
    document_id: null,
    title: input.title,
    due_date: input.dueDate,
    amount: input.amount,
    recurrence: input.recurrence,
    status: "active",
  });

  if (error) {
    return { success: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/deadlines");
  return { success: true };
}

export async function updateManualDeadlineAction(
  deadlineId: string,
  input: {
    title: string;
    dueDate: string;
    amount: number | null;
    recurrence: "none" | "monthly" | "yearly";
  }
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deadlines")
    .update({
      title: input.title,
      due_date: input.dueDate,
      amount: input.amount,
      recurrence: input.recurrence,
    })
    .eq("id", deadlineId);

  if (error) {
    return { success: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/deadlines");
  return { success: true };
}
