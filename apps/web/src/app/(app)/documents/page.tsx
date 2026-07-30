import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "./_components/document-upload";
import { DocumentStatus } from "@duely/shared";
import { DocumentRow } from "./_components/document-row";

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

      <div className="flex flex-col gap-2">
        {error && (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load your documents.</p>
        )}

        {!error && documents?.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        )}

        {documents?.map((document) => (
          <DocumentRow
            key={document.id}
            id={document.id}
            originalFilename={document.original_filename}
            status={document.status as DocumentStatus}
            createdAt={document.created_at}
          />
        ))}
      </div>
    </div>
  );
}
