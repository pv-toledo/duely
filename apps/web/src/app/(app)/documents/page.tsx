import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "./_components/document-upload";
import { DocumentList, type DocumentListItem } from "./_components/document-list";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, original_filename, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex w-full flex-col gap-8">
      <h1 className="font-display text-3xl font-normal tracking-tight">Documents</h1>

      <DocumentUpload />

      {error ? (
        <p className="text-sm text-muted-foreground">Couldn&apos;t load your documents.</p>
      ) : (
        <DocumentList initialDocuments={(documents ?? []) as DocumentListItem[]} />
      )}
    </div>
  );
}
