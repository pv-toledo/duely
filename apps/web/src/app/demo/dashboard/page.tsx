"use client";

import { useState } from "react";
import { DashboardStats } from "@/app/(app)/dashboard/_components/dashboard-stats";
import { DeadlineRow } from "@/app/(app)/_components/deadline-row";
import {
  RecentDocuments,
  type RecentDocument,
} from "@/app/(app)/dashboard/_components/recent-documents";
import { useDemoStore } from "@/lib/demo/demo-store";
import { DemoCreateDeadlineButton } from "../_components/demo-create-deadline-button";
import { DemoReviewDialog } from "../_components/demo-review-dialog";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DemoDashboardPage() {
  const { activeDeadlines, documents, markDeadline } = useDemoStore();
  const now = new Date();
  const todayStr = toDateString(now);
  const in30DaysStr = toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30));
  const [reviewTarget, setReviewTarget] = useState<RecentDocument | null>(null);
  const withinWindow = activeDeadlines.filter((d) => d.due_date <= in30DaysStr);
  const overdueDeadlines = withinWindow.filter((d) => d.due_date < todayStr);
  const upcomingDeadlines = withinWindow.filter((d) => d.due_date >= todayStr);
  const needsReviewCount = documents.filter((d) => d.status === "needs_review").length;

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-normal tracking-tight">Dashboard</h1>
        <DemoCreateDeadlineButton />
      </div>

      <DashboardStats
        activeCount={activeDeadlines.length}
        overdueCount={overdueDeadlines.length}
        needsReviewCount={needsReviewCount}
      />

      {overdueDeadlines.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Overdue</h2>
          <div className="flex flex-col gap-2">
            {overdueDeadlines.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={deadline}
                isOverdue
                onStatusChange={markDeadline}
                disableDocumentLink
              />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Next 30 days</h2>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deadlines in the next 30 days.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={deadline}
                isOverdue={false}
                onStatusChange={markDeadline}
                disableDocumentLink
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Recent documents</h2>
        <RecentDocuments
          documents={documents}
          disableLinks
          onDocumentClick={(doc) => setReviewTarget(doc)}
        />
      </section>

      {reviewTarget && (
        <DemoReviewDialog
          documentId={reviewTarget.id}
          originalFilename={reviewTarget.original_filename}
          open={reviewTarget !== null}
          onOpenChange={(open) => {
            if (!open) setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
}
