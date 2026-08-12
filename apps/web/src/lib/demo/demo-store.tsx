"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DashboardDeadline } from "@/app/(app)/_components/deadline-row";
import type { DeadlineHistoryItem } from "@/app/(app)/deadlines/_components/deadline-history-row";
import type { RecentDocument } from "@/app/(app)/dashboard/_components/recent-documents";
import type { ReviewConfirmPayload } from "@/app/(app)/documents/[id]/review/_components/review-form";
import type { DocumentLanguage } from "@duely/shared";
import { isRecurringInterval, addInterval } from "@/app/(app)/recurrence";
import { DEMO_DEADLINES, DEMO_DEADLINE_HISTORY, DEMO_DOCUMENTS } from "./mock-data";

type HistoryEntry = { entry: DeadlineHistoryItem; actionLabel: "Completed" | "Dismissed" };

type DemoStoreValue = {
  activeDeadlines: DashboardDeadline[];
  doneDeadlines: DeadlineHistoryItem[];
  dismissedDeadlines: DeadlineHistoryItem[];
  documents: RecentDocument[];
  markDeadline: (id: string, status: "done" | "dismissed") => void;
  confirmReview: (documentId: string, payload: ReviewConfirmPayload) => { success: boolean };
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [activeDeadlines, setActiveDeadlines] = useState<DashboardDeadline[]>(DEMO_DEADLINES);
  const [history, setHistory] = useState<HistoryEntry[]>(DEMO_DEADLINE_HISTORY);
  const [documents, setDocuments] = useState<RecentDocument[]>(DEMO_DOCUMENTS);

  const markDeadline = useCallback(
    (id: string, status: "done" | "dismissed") => {
      const target = activeDeadlines.find((deadline) => deadline.id === id);
      if (!target) return;

      const remaining = activeDeadlines.filter((deadline) => deadline.id !== id);
      const actionLabel = status === "done" ? "Completed" : "Dismissed";

      const next =
        status === "done" && isRecurringInterval(target.recurrence)
          ? [
              ...remaining,
              {
                ...target,
                id: `${target.id}-next-${Date.now()}`,
                due_date: addInterval(target.due_date, target.recurrence),
              },
            ]
          : remaining;

      setActiveDeadlines(next);
      setHistory((current) => [
        {
          actionLabel,
          entry: {
            id: target.id,
            title: target.title,
            due_date: target.due_date,
            amount: target.amount,
            recurrence: target.recurrence,
            updated_at: new Date().toISOString(),
            document_id: target.document_id,
            documents: target.documents,
          },
        },
        ...current,
      ]);
    },
    [activeDeadlines]
  );

  const confirmReview = useCallback((documentId: string, payload: ReviewConfirmPayload) => {
    setDocuments((current) =>
      current.map((doc) =>
        doc.id === documentId ? { ...doc, status: "archived" as const, title: payload.title } : doc
      )
    );

    if (payload.dueDate) {
      setActiveDeadlines((current) => [
        ...current,
        {
          id: `${documentId}-deadline-${Date.now()}`,
          title: payload.title,
          due_date: payload.dueDate as string,
          amount: payload.amount,
          recurrence: "none",
          reminder_offset_days: payload.reminderOffsetDays,
          document_id: documentId,
          documents: { search_language: "en" as DocumentLanguage },
        },
      ]);
    }

    return { success: true };
  }, []);

  const value = useMemo<DemoStoreValue>(
    () => ({
      activeDeadlines,
      doneDeadlines: history.filter((h) => h.actionLabel === "Completed").map((h) => h.entry),
      dismissedDeadlines: history.filter((h) => h.actionLabel === "Dismissed").map((h) => h.entry),
      documents,
      markDeadline,
      confirmReview,
    }),
    [activeDeadlines, history, documents, markDeadline, confirmReview]
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}
