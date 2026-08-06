import { z } from "zod";

export const manualDeadlineSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    dueDate: z.string().nullable(),
    amount: z.number().nullable(),
    recurrence: z.enum(["none", "monthly", "yearly"]),
  })
  .superRefine((data, ctx) => {
    if (!data.dueDate) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "Due date is required" });
    }
  });

export type ManualDeadlineFormInput = {
  title: string;
  dueDate: string | null;
  amount: string;
  recurrence: "none" | "monthly" | "yearly";
};
