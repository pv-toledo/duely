import { createClient } from "@/lib/supabase/server";
import { isDocumentLanguage } from "../documents/labels";
import { DashboardStats } from "./_components/dashboard-stats";
import { DeadlineRow, type DashboardDeadline } from "../_components/deadline-row";
import { RecentDocuments, type RecentDocument } from "./_components/recent-documents";
import { CreateDeadlineDialog } from "../_components/create-deadline-dialog";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const todayStr = toDateString(now);
  const in30DaysStr = toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30));

  const [deadlinesResult, activeCountResult, needsReviewCountResult, recentDocumentsResult] =
    await Promise.all([
      supabase
        .from("deadlines")
        .select("id, title, due_date, amount, recurrence, documents(search_language)")
        .eq("status", "active")
        .lte("due_date", in30DaysStr)
        .order("due_date", { ascending: true }),
      supabase.from("deadlines").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "needs_review"),
      supabase
        .from("documents")
        .select("id, original_filename, status, created_at, title")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const deadlines: DashboardDeadline[] = (deadlinesResult.data ?? []).map((row) => {
    const rawLanguage = row.documents?.search_language ?? null;
    return {
      id: row.id,
      title: row.title,
      due_date: row.due_date,
      amount: row.amount,
      recurrence: row.recurrence,
      documents: {
        search_language: rawLanguage && isDocumentLanguage(rawLanguage) ? rawLanguage : null,
      },
    };
  });

  const overdueDeadlines = deadlines.filter((deadline) => deadline.due_date < todayStr);
  const upcomingDeadlines = deadlines.filter((deadline) => deadline.due_date >= todayStr);
  const recentDocuments = (recentDocumentsResult.data ?? []) as RecentDocument[];

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-normal tracking-tight">Dashboard</h1>
        <CreateDeadlineDialog />
      </div>

      <DashboardStats
        activeCount={activeCountResult.count ?? 0}
        overdueCount={overdueDeadlines.length}
        needsReviewCount={needsReviewCountResult.count ?? 0}
      />

      {overdueDeadlines.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Overdue</h2>
          <div className="flex flex-col gap-2">
            {overdueDeadlines.map((deadline) => (
              <DeadlineRow key={deadline.id} deadline={deadline} isOverdue />
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
              <DeadlineRow key={deadline.id} deadline={deadline} isOverdue={false} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Recent documents</h2>
        <RecentDocuments documents={recentDocuments} />
      </section>
    </div>
  );
}
