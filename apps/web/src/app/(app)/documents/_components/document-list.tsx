"use client";

import { useEffect, useState } from "react";
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { DocumentStatus } from "@duely/shared";
import { DocumentRow } from "./document-row";

export type DocumentListItem = {
  id: string;
  original_filename: string;
  status: DocumentStatus;
  created_at: string;
};

export function DocumentList({ initialDocuments }: { initialDocuments: DocumentListItem[] }) {
  const [supabase] = useState(() => createClient());
  const [documents, setDocuments] = useState(initialDocuments);

  useEffect(() => {
    const channelName = `documents-changes-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "documents" },
        (payload: RealtimePostgresInsertPayload<DocumentListItem>) => {
          setDocuments((current) => [payload.new, ...current]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "documents" },
        (payload: RealtimePostgresUpdatePayload<DocumentListItem>) => {
          setDocuments((current) =>
            current.map((document) => (document.id === payload.new.id ? payload.new : document))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  function handleDeleted(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}

      {documents.map((document) => (
        <DocumentRow
          key={document.id}
          id={document.id}
          originalFilename={document.original_filename}
          status={document.status}
          createdAt={document.created_at}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
