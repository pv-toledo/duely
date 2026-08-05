export function QuotaPausedBanner({ pausedUntil }: { pausedUntil: string }) {
  const resumeDate = new Date(pausedUntil);

  const dayLabel = resumeDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const timeLabel = resumeDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
      Daily processing limit reached. New documents will resume processing on {dayLabel} at{" "}
      {timeLabel}.
    </div>
  );
}
