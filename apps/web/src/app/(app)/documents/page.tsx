import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "./_components/document-upload";
import { DocumentList, type DocumentListItem } from "./_components/document-list";
import { QuotaPausedBanner } from "./_components/quota-paused-banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      "id, original_filename, status, created_at, category, document_type, subject_name, issuer_name, title, search_language, extractions(document_number, plate, description, reference_period)"
    )
    .order("created_at", { ascending: false });

  const { data: quotaStatus } = await supabase
    .from("extraction_status")
    .select("paused_until")
    .eq("key", "gemini_daily_quota")
    .maybeSingle();

  const pausedUntil =
    quotaStatus?.paused_until && new Date(quotaStatus.paused_until) > new Date()
      ? quotaStatus.paused_until
      : null;

  return (
    <div className="flex w-full flex-col gap-8">
      <h1 className="font-display text-3xl font-normal tracking-tight">Documents</h1>

      {pausedUntil && <QuotaPausedBanner pausedUntil={pausedUntil} />}

      <DocumentUpload />

      {error ? (
        <p className="text-sm text-muted-foreground">Couldn&apos;t load your documents.</p>
      ) : (
        <DocumentList initialDocuments={(documents ?? []) as DocumentListItem[]} />
      )}
    </div>
  );
}
