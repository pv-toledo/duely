import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildDefaultReviewValues } from "./defaults";
import { ReviewForm } from "./_components/review-form";

export default async function DocumentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select(
      "id, status, category, document_type, subject_name, issuer_name, original_filename, storage_path"
    )
    .eq("id", id)
    .single();

  if (documentError || !document) {
    notFound();
  }

  if (document.status !== "needs_review") {
    redirect("/documents");
  }

  const { data: extraction, error: extractionError } = await supabase
    .from("extractions")
    .select("raw_response")
    .eq("document_id", id)
    .single();

  if (extractionError || !extraction) {
    notFound();
  }

  const { data: signedUrlData } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, 3600);

  const defaultValues = buildDefaultReviewValues(document, extraction.raw_response);

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row">
      <div className="lg:w-1/2">
        {signedUrlData?.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrlData.signedUrl}
            alt={document.original_filename}
            className="w-full rounded-lg border border-border"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the document image.</p>
        )}
      </div>
      <div className="flex flex-col gap-4 lg:w-1/2">
        <ReviewForm documentId={document.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
