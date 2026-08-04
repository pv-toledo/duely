"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FieldError } from "./field-error";

function dateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoStringToDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const displayFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

type DueDatePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  error?: string;
};

export function DueDatePicker({ value, onChange, disabled = false, error }: DueDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? isoStringToDate(value) : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-9 w-full justify-start gap-2 text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            />
          }
        >
          <CalendarIcon className="size-4" />
          {selectedDate ? displayFormatter.format(selectedDate) : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date ? dateToISOString(date) : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <FieldError message={error} />
    </div>
  );
}
