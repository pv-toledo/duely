"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useController, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  DOCUMENT_CATEGORY_VALUES,
  VEHICLE_DOCUMENT_TYPE_VALUES,
  HEALTH_DOCUMENT_TYPE_VALUES,
  BILLS_DOCUMENT_TYPE_VALUES,
} from "@duely/shared";

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

import { documentReviewSchema, type ReviewCategory, type ReviewFormInput } from "../schema";
import { confirmDocumentReviewAction } from "../actions";

import { DueDateSection } from "./due-date-section";

import { CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "../../../labels";
import { ReviewDefaultValues } from "../defaults";
import { FieldError } from "@/app/(app)/_components/field-error";
import { nullableNumber } from "@/app/(app)/form-helpers";
import { FieldLabel } from "@/app/(app)/_components/field-label";

const CATEGORY_ITEMS = DOCUMENT_CATEGORY_VALUES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

const DOCUMENT_TYPE_ITEMS_BY_CATEGORY = {
  vehicle: VEHICLE_DOCUMENT_TYPE_VALUES.map((value) => ({
    value,
    label: DOCUMENT_TYPE_LABELS[value],
  })),
  health: HEALTH_DOCUMENT_TYPE_VALUES.map((value) => ({
    value,
    label: DOCUMENT_TYPE_LABELS[value],
  })),
  bills: BILLS_DOCUMENT_TYPE_VALUES.map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] })),
} as const;

const nullableText = { setValueAs: (value: string) => (value === "" ? null : value) };

function toDisplayValue(value: string | null): string {
  return value ?? "";
}

type ReviewFormProps = {
  documentId: string;
  defaultValues: ReviewDefaultValues;
};

export function ReviewForm({ documentId, defaultValues }: ReviewFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(documentReviewSchema) as unknown as Resolver<ReviewFormInput>,
    defaultValues: {
      category: defaultValues.category,
      documentType: defaultValues.documentType,
      subjectName: toDisplayValue(defaultValues.subjectName),
      issuerName: toDisplayValue(defaultValues.issuerName),
      title: defaultValues.title,
      dueDate: defaultValues.dueDate,
      hasNoDueDate: defaultValues.hasNoDueDate,
      amount: defaultValues.amount !== null ? String(defaultValues.amount) : "",
      documentNumber: toDisplayValue(defaultValues.documentNumber),
      plate: toDisplayValue(defaultValues.plate),
      documentDate: toDisplayValue(defaultValues.documentDate),
      description: toDisplayValue(defaultValues.description),
      referencePeriod: toDisplayValue(defaultValues.referencePeriod),
      reminderOffsetDays:
        defaultValues.reminderOffsetDays !== null ? String(defaultValues.reminderOffsetDays) : "",
    },
  });

  const categoryController = useController({ control, name: "category" });
  const documentTypeController = useController({ control, name: "documentType" });
  const hasNoDueDateController = useController({ control, name: "hasNoDueDate" });
  const category = categoryController.field.value;
  const hasNoDueDate = hasNoDueDateController.field.value;

  function handleCategoryChange(value: ReviewCategory | null) {
    categoryController.field.onChange(value);
    setValue("documentType", null);
  }

  async function onSubmit(values: ReviewFormInput) {
    setSubmitError(null);

    const result = await confirmDocumentReviewAction(documentId, {
      category: values.category as string,
      documentType: values.documentType as string,
      subjectName: values.subjectName === "" ? null : values.subjectName,
      issuerName: values.issuerName === "" ? null : values.issuerName,
      title: values.title,
      dueDate: values.hasNoDueDate ? null : values.dueDate,
      amount: values.amount === "" ? null : Number(values.amount),
      documentNumber: values.documentNumber === "" ? null : values.documentNumber,
      plate: values.plate === "" ? null : values.plate,
      documentDate: values.documentDate === "" ? null : values.documentDate,
      description: values.description === "" ? null : values.description,
      referencePeriod: values.referencePeriod === "" ? null : values.referencePeriod,
      reminderOffsetDays:
        values.reminderOffsetDays === "" ? null : Number(values.reminderOffsetDays),
    });

    if (!result.success) {
      setSubmitError("Couldn't confirm this document. Please try again.");
      return;
    }

    router.push("/documents");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-6">
      <p className="text-xs text-muted-foreground">Fields marked (optional) can be left blank.</p>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select items={CATEGORY_ITEMS} value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.category?.message} />
      </div>

      {category && (
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="documentType">Document type</Label>
          <Select
            items={DOCUMENT_TYPE_ITEMS_BY_CATEGORY[category]}
            value={documentTypeController.field.value}
            onValueChange={documentTypeController.field.onChange}
          >
            <SelectTrigger id="documentType" className="w-full">
              <SelectValue placeholder="Select a document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPE_ITEMS_BY_CATEGORY[category].map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.documentType?.message} />
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <FieldLabel htmlFor="subjectName" optional={category !== "health"}>
          Subject name
        </FieldLabel>
        <Input id="subjectName" {...register("subjectName", nullableText)} />
        <FieldError message={errors.subjectName?.message} />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <FieldLabel htmlFor="issuerName" optional>
          Issuer name
        </FieldLabel>
        <Input id="issuerName" {...register("issuerName", nullableText)} />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label>Due date</Label>
        <DueDateSection control={control} />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <FieldLabel htmlFor="reminderOffsetDays" optional>
          Remind me (days before due date)
        </FieldLabel>
        <Input
          id="reminderOffsetDays"
          type="number"
          step="1"
          min="0"
          disabled={hasNoDueDate}
          {...register("reminderOffsetDays", nullableNumber)}
        />
        <FieldError message={errors.reminderOffsetDays?.message} />
      </div>

      {category === "vehicle" && (
        <>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="documentNumber" optional>
              Document number
            </FieldLabel>
            <Input id="documentNumber" {...register("documentNumber", nullableText)} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="plate" optional>
              Plate
            </FieldLabel>
            <Input id="plate" {...register("plate", nullableText)} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="amount" optional>
              Amount
            </FieldLabel>
            <Input id="amount" type="number" step="0.01" {...register("amount", nullableNumber)} />
            <FieldError message={errors.amount?.message} />
          </div>
        </>
      )}

      {category === "health" && (
        <>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="documentDate" optional>
              Document date
            </FieldLabel>
            <Input id="documentDate" type="date" {...register("documentDate", nullableText)} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="description" optional>
              Description
            </FieldLabel>
            <Input id="description" {...register("description", nullableText)} />
          </div>
        </>
      )}

      {category === "bills" && (
        <>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="documentNumber" optional>
              Document number
            </FieldLabel>
            <Input id="documentNumber" {...register("documentNumber", nullableText)} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="referencePeriod" optional>
              Reference period
            </FieldLabel>
            <Input id="referencePeriod" {...register("referencePeriod", nullableText)} />
          </div>
          {documentTypeController.field.value === "other" && (
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel
                htmlFor="description"
                optional={documentTypeController.field.value !== "other"}
              >
                Description
              </FieldLabel>
              <Input id="description" {...register("description", nullableText)} />
              <FieldError message={errors.description?.message} />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount", nullableNumber)} />
            <FieldError message={errors.amount?.message} />
          </div>
        </>
      )}

      <FieldError message={submitError ?? undefined} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Confirming..." : "Confirm"}
      </Button>
    </form>
  );
}
