import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DocumentPreview } from "./_components/document-preview";
import { DeleteDocumentButton } from "./_components/delete-document-button";
import {
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
  isDocumentCategory,
  isDocumentLanguage,
} from "../labels";
import type { DocumentLanguage } from "@duely/shared";
import { formatAmount } from "../../format-amount";

function FieldRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">
        {value ?? <span className="text-muted-foreground italic">Not extracted</span>}
      </span>
    </div>
  );
}

function formatDate(value: string | null): string | null {
  return value ? new Date(value).toLocaleDateString("en-US") : null;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select(
      "id, status, category, document_type, subject_name, issuer_name, title, original_filename, storage_path, mime_type, search_language, extractions(document_number, plate, document_date, description, reference_period), deadlines(id, due_date, amount, recurrence, status)"
    )
    .eq("id", id)
    .single();

  if (error || !document) {
    notFound();
  }

  if (document.status !== "archived") {
    redirect("/documents");
  }

  if (!document.category || !isDocumentCategory(document.category)) {
    notFound();
  }
  const category = document.category;

  const language: DocumentLanguage | null =
    document.search_language && isDocumentLanguage(document.search_language)
      ? document.search_language
      : null;

  const { data: signedUrlData } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, 3600);

  const extraction = document.extractions;
  const deadline = document.deadlines[0] ?? null;
  const documentTypeLabel = document.document_type
    ? (DOCUMENT_TYPE_LABELS[document.document_type] ?? document.document_type)
    : null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 lg:flex-row">
      <div className="min-w-0 lg:w-1/2">
        <DocumentPreview
          mimeType={document.mime_type}
          originalFilename={document.original_filename}
          signedUrl={signedUrlData?.signedUrl ?? null}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:w-1/2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-normal tracking-tight">
              {document.title ?? document.original_filename}
            </h1>
            <p className="text-sm text-muted-foreground">
              {CATEGORY_LABELS[category]}
              {documentTypeLabel ? ` · ${documentTypeLabel}` : ""}
              {language ? ` · ${language.toUpperCase()}` : ""}
            </p>
          </div>
          <DeleteDocumentButton
            documentId={document.id}
            originalFilename={document.original_filename}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Subject" value={document.subject_name} />
          <FieldRow label="Issuer" value={document.issuer_name} />

          {category === "vehicle" && (
            <>
              <FieldRow label="Document number" value={extraction?.document_number ?? null} />
              <FieldRow label="Plate" value={extraction?.plate ?? null} />
            </>
          )}

          {category === "health" && (
            <>
              <FieldRow
                label="Document date"
                value={formatDate(extraction?.document_date ?? null)}
              />
              <FieldRow label="Description" value={extraction?.description ?? null} />
            </>
          )}

          {category === "bills" && (
            <>
              <FieldRow label="Document number" value={extraction?.document_number ?? null} />
              <FieldRow label="Reference period" value={extraction?.reference_period ?? null} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <h2 className="text-sm font-medium">Deadline</h2>
          {deadline ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldRow label="Due date" value={formatDate(deadline.due_date)} />
              <FieldRow label="Amount" value={formatAmount(deadline.amount, language)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No deadline linked to this document.</p>
          )}
        </div>
      </div>
    </div>
  );
}
