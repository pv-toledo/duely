"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DashboardDeadline } from "@/app/(app)/_components/deadline-row";
import type { DeadlineHistoryItem } from "@/app/(app)/deadlines/_components/deadline-history-row";
import { isRecurringInterval, addInterval } from "@/app/(app)/recurrence";
import { DEMO_DEADLINES, DEMO_DEADLINE_HISTORY, DEMO_DOCUMENTS } from "./mock-data";

type HistoryEntry = { entry: DeadlineHistoryItem; actionLabel: "Completed" | "Dismissed" };

type DemoStoreValue = {
  activeDeadlines: DashboardDeadline[];
  doneDeadlines: DeadlineHistoryItem[];
  dismissedDeadlines: DeadlineHistoryItem[];
  documents: typeof DEMO_DOCUMENTS;
  markDeadline: (id: string, status: "done" | "dismissed") => void;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [activeDeadlines, setActiveDeadlines] = useState<DashboardDeadline[]>(DEMO_DEADLINES);
  const [history, setHistory] = useState<HistoryEntry[]>(DEMO_DEADLINE_HISTORY);

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

  const value = useMemo<DemoStoreValue>(
    () => ({
      activeDeadlines,
      doneDeadlines: history.filter((h) => h.actionLabel === "Completed").map((h) => h.entry),
      dismissedDeadlines: history.filter((h) => h.actionLabel === "Dismissed").map((h) => h.entry),
      documents: DEMO_DOCUMENTS,
      markDeadline,
    }),
    [activeDeadlines, history, markDeadline]
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
