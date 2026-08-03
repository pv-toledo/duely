"use client";

import { useController, type Control } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { DueDatePicker } from "./due-date-picker";
import type { ReviewFormInput } from "../schema";

type DueDateSectionProps = {
  control: Control<ReviewFormInput>;
};

export function DueDateSection({ control }: DueDateSectionProps) {
  const dueDate = useController({ control, name: "dueDate" });
  const hasNoDueDate = useController({ control, name: "hasNoDueDate" });

  function handleCheckedChange(checked: boolean) {
    hasNoDueDate.field.onChange(checked);
    if (checked) {
      dueDate.field.onChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <DueDatePicker
        value={dueDate.field.value}
        onChange={dueDate.field.onChange}
        disabled={hasNoDueDate.field.value}
        error={dueDate.fieldState.error?.message}
      />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={hasNoDueDate.field.value} onCheckedChange={handleCheckedChange} />
        This document has no due date
      </label>
    </div>
  );
}
