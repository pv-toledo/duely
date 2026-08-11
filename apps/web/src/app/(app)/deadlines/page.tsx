import { createClient } from "@/lib/supabase/server";
import { isDocumentLanguage } from "../documents/labels";
import { DeadlineRow, type DashboardDeadline } from "../_components/deadline-row";
import { DeadlineHistoryRow, type DeadlineHistoryItem } from "./_components/deadline-history-row";
import { CreateDeadlineDialog } from "../_components/create-deadline-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const metadata: Metadata = {
  title: "Deadlines",
};

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const todayStr = toDateString(new Date());

  const { data } = await supabase
    .from("deadlines")
    .select(
      "id, title, due_date, amount, recurrence, status, updated_at, reminder_offset_days, document_id, documents(search_language)"
    )
    .order("due_date", { ascending: true });

  const rows = (data ?? []).map((row) => {
    const rawLanguage = row.documents?.search_language ?? null;
    return {
      ...row,
      documents: {
        search_language: rawLanguage && isDocumentLanguage(rawLanguage) ? rawLanguage : null,
      },
    };
  });

  const activeDeadlines: DashboardDeadline[] = rows.filter((row) => row.status === "active");

  const doneDeadlines: DeadlineHistoryItem[] = rows
    .filter((row) => row.status === "done")
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));

  const dismissedDeadlines: DeadlineHistoryItem[] = rows
    .filter((row) => row.status === "dismissed")
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-normal tracking-tight">Deadlines</h1>
        <CreateDeadlineDialog />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeDeadlines.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({doneDeadlines.length})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({dismissedDeadlines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex flex-col gap-2 pt-4">
          {activeDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active deadlines.</p>
          ) : (
            activeDeadlines.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={deadline}
                isOverdue={deadline.due_date < todayStr}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="done" className="flex flex-col gap-2 pt-4">
          {doneDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed deadlines yet.</p>
          ) : (
            doneDeadlines.map((deadline) => (
              <DeadlineHistoryRow key={deadline.id} deadline={deadline} actionLabel="Completed" />
            ))
          )}
        </TabsContent>

        <TabsContent value="dismissed" className="flex flex-col gap-2 pt-4">
          {dismissedDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dismissed deadlines.</p>
          ) : (
            dismissedDeadlines.map((deadline) => (
              <DeadlineHistoryRow key={deadline.id} deadline={deadline} actionLabel="Dismissed" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
