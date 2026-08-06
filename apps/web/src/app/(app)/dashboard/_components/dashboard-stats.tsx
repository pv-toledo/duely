import { cn } from "@/lib/utils";

export function DashboardStats({
  activeCount,
  overdueCount,
  needsReviewCount,
}: {
  activeCount: number;
  overdueCount: number;
  needsReviewCount: number;
}) {
  const stats = [
    { label: "Active deadlines", value: activeCount, className: "" },
    {
      label: "Overdue",
      value: overdueCount,
      className: overdueCount > 0 ? "text-destructive" : "",
    },
    {
      label: "Awaiting review",
      value: needsReviewCount,
      className: needsReviewCount > 0 ? "text-warning" : "",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 rounded-lg border border-border p-4">
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <span className={cn("font-display text-3xl font-normal tabular-nums", stat.className)}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
