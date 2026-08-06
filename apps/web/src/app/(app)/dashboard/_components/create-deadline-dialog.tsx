"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useController, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { DueDatePicker } from "../../_components/due-date-picker";
import { FieldError } from "../../_components/field-error";
import { FieldLabel } from "../../_components/field-label";
import { nullableNumber } from "../../form-helpers";
import { manualDeadlineSchema, type ManualDeadlineFormInput } from "../schema";
import { createManualDeadlineAction } from "../actions";

const RECURRENCE_ITEMS = [
  { value: "none", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

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

  const dueDateController = useController({ control, name: "dueDate" });
  const recurrenceController = useController({ control, name: "recurrence" });

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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Due date</Label>
              <DueDatePicker
                value={dueDateController.field.value}
                onChange={dueDateController.field.onChange}
                error={dueDateController.fieldState.error?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="amount" optional>
                Amount
              </FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", nullableNumber)}
              />
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                items={RECURRENCE_ITEMS}
                value={recurrenceController.field.value}
                onValueChange={recurrenceController.field.onChange}
              >
                <SelectTrigger id="recurrence" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
