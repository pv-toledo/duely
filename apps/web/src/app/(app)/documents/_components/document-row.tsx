"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { truncateFilename } from "@/lib/format-filename";
import type { DocumentCategory, DocumentLanguage, DocumentStatus } from "@duely/shared";
import { deleteDocumentAction } from "../actions";
import { CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "../labels";
import Link from "next/link";
import { DocumentStatusBadge } from "../../_components/document-status-badge";
import { getDocumentAriaLabel, getDocumentHref } from "../../document-links";

function buildClassificationLabel(
  category: DocumentCategory | null,
  documentType: string | null
): string | null {
  if (!category) {
    return null;
  }
  const categoryLabel = CATEGORY_LABELS[category];
  if (!documentType) {
    return categoryLabel;
  }
  const typeLabel = DOCUMENT_TYPE_LABELS[documentType] ?? documentType;
  return `${categoryLabel} · ${typeLabel}`;
}

export function DocumentRow({
  id,
  originalFilename,
  status,
  createdAt,
  category,
  documentType,
  title,
  searchLanguage,
  onDeleted,
}: {
  id: string;
  originalFilename: string;
  status: DocumentStatus;
  createdAt: string;
  category: DocumentCategory | null;
  documentType: string | null;
  title: string | null;
  searchLanguage: DocumentLanguage | null;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const href = getDocumentHref(id, status);
  const displayName = title ?? truncateFilename(originalFilename);
  const classificationLabel = buildClassificationLabel(category, documentType);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDocumentAction(id);
      if (result.success) {
        onDeleted(id);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {href ? (
          <Link
            href={href}
            className="min-w-0 truncate text-sm font-medium hover:underline"
            title={originalFilename}
          >
            {displayName}
          </Link>
        ) : (
          <span className="min-w-0 truncate text-sm font-medium" title={originalFilename}>
            {displayName}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {classificationLabel && (
            <>
              <span className="truncate">{classificationLabel}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="tabular-nums">{new Date(createdAt).toLocaleDateString("en-US")}</span>
          {searchLanguage && (
            <span className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground uppercase">
              {searchLanguage}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {href ? (
          <Link
            href={href}
            aria-label={getDocumentAriaLabel(status, originalFilename)}
            className="transition-opacity hover:opacity-80"
          >
            <DocumentStatusBadge status={status} />
          </Link>
        ) : (
          <DocumentStatusBadge status={status} />
        )}
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isPending}
            aria-label={getDocumentAriaLabel(status, originalFilename)}
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this document?</AlertDialogTitle>
              <AlertDialogDescription>
                {truncateFilename(originalFilename)} will be permanently removed. This can&apos;t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
