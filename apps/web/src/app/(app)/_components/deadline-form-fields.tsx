"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useController } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DueDatePicker } from "./due-date-picker";
import { FieldError } from "./field-error";
import { FieldLabel } from "./field-label";
import { nullableNumber } from "../form-helpers";
import type { ManualDeadlineFormInput } from "../deadline-schema";

const RECURRENCE_ITEMS = [
  { value: "none", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export function DeadlineFormFields({
  control,
  register,
  errors,
}: {
  control: Control<ManualDeadlineFormInput>;
  register: UseFormRegister<ManualDeadlineFormInput>;
  errors: FieldErrors<ManualDeadlineFormInput>;
}) {
  const dueDateController = useController({ control, name: "dueDate" });
  const recurrenceController = useController({ control, name: "recurrence" });

  return (
    <>
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
        <FieldLabel htmlFor="reminderOffsetDays" optional>
          Remind me (days before due date)
        </FieldLabel>
        <Input
          id="reminderOffsetDays"
          type="number"
          step="1"
          min="0"
          {...register("reminderOffsetDays", nullableNumber)}
        />
        <FieldError message={errors.reminderOffsetDays?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="amount" optional>
          Amount
        </FieldLabel>
        <Input id="amount" type="number" step="0.01" {...register("amount", nullableNumber)} />
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
    </>
  );
}
