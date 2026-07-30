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
import type { DocumentStatus } from "@duely/shared";
import { deleteDocumentAction } from "../actions";
import { DocumentStatusBadge } from "./document-status-badge";

export function DocumentRow({
  id,
  originalFilename,
  status,
  createdAt,
}: {
  id: string;
  originalFilename: string;
  status: DocumentStatus;
  createdAt: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteDocumentAction(id);
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <span className="min-w-0 flex-1 truncate text-sm font-medium" title={originalFilename}>
        {truncateFilename(originalFilename)}
      </span>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(createdAt).toLocaleDateString("en-US")}
        </span>
        <DocumentStatusBadge status={status} />
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isPending}
            aria-label="Delete document"
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
