export function isRecurringInterval(value: string): value is "monthly" | "yearly" {
  return value === "monthly" || value === "yearly";
}

export function addInterval(dueDate: string, recurrence: "monthly" | "yearly"): string {
  const [year, month, day] = dueDate.split("-").map(Number);
  let targetYear = year;
  let targetMonth = month;
  if (recurrence === "monthly") {
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  } else {
    targetYear += 1;
  }
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, lastDayOfTargetMonth);
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

const RECURRENCE_LABELS: Record<"none" | "monthly" | "yearly", string> = {
  none: "One-time",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function formatRecurrenceLabel(value: string): string {
  return value === "monthly" || value === "yearly"
    ? RECURRENCE_LABELS[value]
    : RECURRENCE_LABELS.none;
}
