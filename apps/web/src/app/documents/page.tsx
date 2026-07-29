import { createClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "./_components/document-status-badge";
import { DocumentUpload } from "./_components/document-upload";
import { DocumentStatus } from "@duely/shared";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, original_filename, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
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
          <div
            key={document.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <span className="truncate text-sm font-medium">{document.original_filename}</span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {new Date(document.created_at).toLocaleDateString("en-US")}
              </span>
              <DocumentStatusBadge status={document.status as DocumentStatus} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
