"use client";

import { DeadlineRow } from "@/app/(app)/_components/deadline-row";
import { DeadlineHistoryRow } from "@/app/(app)/deadlines/_components/deadline-history-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemoStore } from "@/lib/demo/demo-store";
import { DemoCreateDeadlineButton } from "../_components/demo-create-deadline-button";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DemoDeadlinesPage() {
  const { activeDeadlines, doneDeadlines, dismissedDeadlines, markDeadline } = useDemoStore();
  const todayStr = toDateString(new Date());

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-normal tracking-tight">Deadlines</h1>
        <DemoCreateDeadlineButton />
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
                onStatusChange={markDeadline}
                disableDocumentLink
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
