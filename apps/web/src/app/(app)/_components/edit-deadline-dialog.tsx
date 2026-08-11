"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DeadlineFormFields } from "./deadline-form-fields";
import { FieldError } from "./field-error";
import { manualDeadlineSchema, type ManualDeadlineFormInput } from "../deadline-schema";
import { updateManualDeadlineAction } from "../deadline-actions";

export function EditDeadlineDialog({
  deadlineId,
  title,
  dueDate,
  amount,
  recurrence,
  reminderOffsetDays,
}: {
  deadlineId: string;
  title: string;
  dueDate: string;
  amount: number | null;
  recurrence: "none" | "monthly" | "yearly";
  reminderOffsetDays: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ManualDeadlineFormInput>({
    resolver: zodResolver(manualDeadlineSchema) as unknown as Resolver<ManualDeadlineFormInput>,
    defaultValues: {
      title,
      dueDate,
      amount: amount !== null ? String(amount) : "",
      recurrence,
      reminderOffsetDays: reminderOffsetDays !== null ? String(reminderOffsetDays) : "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset({
        title,
        dueDate,
        amount: amount !== null ? String(amount) : "",
        recurrence,
        reminderOffsetDays: reminderOffsetDays !== null ? String(reminderOffsetDays) : "",
      });
      setSubmitError(null);
    }
    setOpen(nextOpen);
  }

  async function onSubmit(values: ManualDeadlineFormInput) {
    setSubmitError(null);

    const result = await updateManualDeadlineAction(deadlineId, {
      title: values.title,
      dueDate: values.dueDate as string,
      amount: values.amount === "" ? null : Number(values.amount),
      recurrence: values.recurrence,
      reminderOffsetDays:
        values.reminderOffsetDays === "" ? null : Number(values.reminderOffsetDays),
    });

    if (!result.success) {
      setSubmitError("Couldn't update this deadline. Please try again.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label="Edit deadline"
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit deadline</DialogTitle>
          <DialogDescription>Update the details of this deadline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DeadlineFormFields control={control} register={register} errors={errors} />

          <FieldError message={submitError ?? undefined} />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
