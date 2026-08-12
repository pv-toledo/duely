"use client";

import { useState, useTransition } from "react";
import { Check, FileText, X } from "lucide-react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocumentLanguage } from "@duely/shared";

import { isRecurringInterval, addInterval } from "../recurrence";
import { updateDeadlineStatusAction } from "../deadline-actions";
import { formatAmount } from "../format-amount";
import { EditDeadlineDialog } from "./edit-deadline-dialog";
import Link from "next/link";

export type DashboardDeadline = {
  id: string;
  title: string;
  due_date: string;
  amount: number | null;
  recurrence: string;
  reminder_offset_days: number | null;
  document_id: string | null;
  documents: { search_language: DocumentLanguage | null } | null;
};

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US");
}

function daysUntil(dueDate: string): number {
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildDoneDescription(deadline: DashboardDeadline): string {
  if (!isRecurringInterval(deadline.recurrence)) {
    return "This deadline will be marked as done and removed from your active list.";
  }
  const nextDate = addInterval(deadline.due_date, deadline.recurrence);
  return `This deadline will be marked as done, and a new one will be created for ${formatDate(nextDate)}.`;
}

export function DeadlineRow({
  deadline,
  isOverdue,
  onStatusChange,
  disableDocumentLink = false,
}: {
  deadline: DashboardDeadline;
  isOverdue: boolean;
  onStatusChange?: (id: string, status: "done" | "dismissed") => void;
  disableDocumentLink?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [doneDialogOpen, setDoneDialogOpen] = useState(false);

  const language = deadline.documents?.search_language ?? null;
  const amountLabel = formatAmount(deadline.amount, language);
  const days = daysUntil(deadline.due_date);

  function handleStatusChange(newStatus: "done" | "dismissed") {
    if (onStatusChange) {
      onStatusChange(deadline.id, newStatus);
      setDoneDialogOpen(false);
      return;
    }
    startTransition(async () => {
      await updateDeadlineStatusAction(deadline.id, newStatus);
      setDoneDialogOpen(false);
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {deadline.document_id && !disableDocumentLink ? (
          <Link
            href={`/documents/${deadline.document_id}`}
            className="min-w-0 truncate text-sm font-medium hover:underline"
            aria-label={`View document for ${deadline.title}`}
          >
            {deadline.title}
          </Link>
        ) : (
          <span className="truncate text-sm font-medium">{deadline.title}</span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">{formatDate(deadline.due_date)}</span>
          {amountLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{amountLabel}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span
            className={cn(
              "tabular-nums",
              isOverdue && "font-medium text-destructive",
              !isOverdue && days === 0 && "font-medium text-warning"
            )}
          >
            {isOverdue
              ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
              : days === 0
                ? "Due today"
                : `In ${days} day${days === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {deadline.document_id === null ? (
          <EditDeadlineDialog
            deadlineId={deadline.id}
            title={deadline.title}
            dueDate={deadline.due_date}
            amount={deadline.amount}
            recurrence={deadline.recurrence as "none" | "monthly" | "yearly"}
            reminderOffsetDays={deadline.reminder_offset_days}
          />
        ) : disableDocumentLink ? (
          <span
            aria-label="View source document (unavailable in demo)"
            title="Sign up to view the source document"
            className="cursor-not-allowed text-muted-foreground/50"
          >
            <FileText className="size-4" />
          </span>
        ) : (
          <Link
            href={`/documents/${deadline.document_id}`}
            aria-label="View source document"
            title="From a scanned document — edit it there"
            className="text-muted-foreground hover:text-foreground"
          >
            <FileText className="size-4" />
          </Link>
        )}
        <Dialog open={doneDialogOpen} onOpenChange={setDoneDialogOpen}>
          <DialogTrigger
            disabled={isPending}
            aria-label="Mark as done"
            className="text-muted-foreground hover:text-success disabled:opacity-50"
          >
            <Check className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as done?</DialogTitle>
              <DialogDescription>{buildDoneDescription(deadline)}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={() => handleStatusChange("done")} disabled={isPending}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            disabled={isPending}
            aria-label="Dismiss deadline"
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <X className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dismiss this deadline?</AlertDialogTitle>
              <AlertDialogDescription>
                {deadline.title} will be removed from your active deadlines. This can&apos;t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusChange("dismissed")}
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                Dismiss
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
