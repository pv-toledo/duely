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
import { DOCUMENT_TYPE_LABELS, CATEGORY_LABELS, type ReviewDefaultValues } from "../defaults";
import { DueDateSection } from "./due-date-section";

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
  bills: BILLS_DOCUMENT_TYPE_VALUES.map((value) => ({
    value,
    label: DOCUMENT_TYPE_LABELS[value],
  })),
} as const;

const nullableText = { setValueAs: (value: string) => (value === "" ? null : value) };
const nullableNumber = {
  setValueAs: (value: string) => (value === "" ? null : Number(value)),
};

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
    },
  });

  const categoryController = useController({ control, name: "category" });
  const category = categoryController.field.value;
  const documentTypeController = useController({ control, name: "documentType" });

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
    });

    if (!result.success) {
      setSubmitError("Couldn't confirm this document. Please try again.");
      return;
    }

    router.push("/documents");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select
          items={CATEGORY_ITEMS}
          value={categoryController.field.value}
          onValueChange={handleCategoryChange}
        >
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
        {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
      </div>

      {category && (
        <div className="flex flex-col gap-1.5">
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
          {errors.documentType && (
            <p className="text-xs text-destructive">{errors.documentType.message}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subjectName">Subject name</Label>
        <Input id="subjectName" {...register("subjectName", nullableText)} />
        {errors.subjectName && (
          <p className="text-xs text-destructive">{errors.subjectName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="issuerName">Issuer name</Label>
        <Input id="issuerName" {...register("issuerName", nullableText)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Due date</Label>
        <DueDateSection control={control} />
      </div>

      {category === "vehicle" && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentNumber">Document number</Label>
            <Input id="documentNumber" {...register("documentNumber", nullableText)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plate">Plate</Label>
            <Input id="plate" {...register("plate", nullableText)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount (optional)</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount", nullableNumber)} />
          </div>
        </>
      )}

      {category === "health" && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentDate">Document date</Label>
            <Input id="documentDate" type="date" {...register("documentDate", nullableText)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description", nullableText)} />
          </div>
        </>
      )}

      {category === "bills" && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentNumber">Document number</Label>
            <Input id="documentNumber" {...register("documentNumber", nullableText)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="referencePeriod">Reference period</Label>
            <Input id="referencePeriod" {...register("referencePeriod", nullableText)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount", nullableNumber)} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
        </>
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Confirming..." : "Confirm"}
      </Button>
    </form>
  );
}
