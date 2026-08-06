"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

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
import { createManualDeadlineAction } from "../deadline-actions";

export function CreateDeadlineDialog() {
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
      title: "",
      dueDate: null,
      amount: "",
      recurrence: "none",
    },
  });

  async function onSubmit(values: ManualDeadlineFormInput) {
    setSubmitError(null);

    const result = await createManualDeadlineAction({
      title: values.title,
      dueDate: values.dueDate as string,
      amount: values.amount === "" ? null : Number(values.amount),
      recurrence: values.recurrence,
    });

    if (!result.success) {
      setSubmitError("Couldn't create this deadline. Please try again.");
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <div className="flex max-w-[12rem] flex-col items-end gap-1">
      <p className="text-right text-xs text-muted-foreground">
        Don&apos;t have a document to scan?
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" />
          Add deadline
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New deadline</DialogTitle>
            <DialogDescription>
              For recurring bills or subscriptions without a physical document.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <DeadlineFormFields control={control} register={register} errors={errors} />

            <FieldError message={submitError ?? undefined} />

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create deadline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
