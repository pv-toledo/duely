"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { DocumentCategory, DocumentLanguage, DocumentStatus } from "@duely/shared";
import { CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "../labels";
import { DocumentRow } from "./document-row";
import { DocumentFilters, type CategoryFilterValue } from "./document-filters";

export type DocumentListItem = {
  id: string;
  original_filename: string;
  status: DocumentStatus;
  created_at: string;
  category: DocumentCategory | null;
  document_type: string | null;
  subject_name: string | null;
  issuer_name: string | null;
  title: string | null;
  search_language: DocumentLanguage | null;
  extractions: {
    document_number: string | null;
    plate: string | null;
    description: string | null;
    reference_period: string | null;
  } | null;
};

function buildSearchableText(document: DocumentListItem): string {
  const categoryLabel = document.category ? CATEGORY_LABELS[document.category] : null;
  const documentTypeLabel = document.document_type
    ? (DOCUMENT_TYPE_LABELS[document.document_type] ?? document.document_type)
    : null;

  return [
    document.title,
    document.original_filename,
    document.subject_name,
    document.issuer_name,
    categoryLabel,
    documentTypeLabel,
    document.extractions?.document_number,
    document.extractions?.plate,
    document.extractions?.description,
    document.extractions?.reference_period,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const STATUS_PRIORITY: Record<DocumentStatus, number> = {
  pending: 0,
  processing: 0,
  needs_review: 1,
  failed: 2,
  archived: 3,
};

export function DocumentList({ initialDocuments }: { initialDocuments: DocumentListItem[] }) {
  const [supabase] = useState(() => createClient());
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");

  useEffect(() => {
    const channelName = `documents-changes-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "documents" },
        (payload: RealtimePostgresInsertPayload<DocumentListItem>) => {
          const newDocument: DocumentListItem = { ...payload.new, extractions: null };
          setDocuments((current) => [newDocument, ...current]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "documents" },
        (payload: RealtimePostgresUpdatePayload<DocumentListItem>) => {
          setDocuments((current) =>
            current.map((document) =>
              document.id === payload.new.id ? { ...document, ...payload.new } : document
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return documents
      .filter((document) => {
        if (categoryFilter !== "all" && document.category !== categoryFilter) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }
        return buildSearchableText(document).includes(normalizedQuery);
      })
      .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
  }, [documents, searchQuery, categoryFilter]);

  function handleDeleted(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {documents.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}

      {documents.length > 0 && filteredDocuments.length === 0 && (
        <p className="text-sm text-muted-foreground">No documents match your search.</p>
      )}

      <div className="flex flex-col gap-2">
        {filteredDocuments.map((document) => (
          <DocumentRow
            key={document.id}
            id={document.id}
            originalFilename={document.original_filename}
            status={document.status}
            createdAt={document.created_at}
            category={document.category}
            documentType={document.document_type}
            title={document.title}
            searchLanguage={document.search_language}
            onDeleted={handleDeleted}
          />
        ))}
      </div>
    </div>
  );
}
