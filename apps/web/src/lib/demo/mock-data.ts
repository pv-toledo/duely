import type { DashboardDeadline } from "@/app/(app)/_components/deadline-row";
import type { DeadlineHistoryItem } from "@/app/(app)/deadlines/_components/deadline-history-row";
import type { RecentDocument } from "@/app/(app)/dashboard/_components/recent-documents";
import { DeadlineRecurrence, DocumentLanguage, DocumentStatus } from "@duely/shared/src/db-enums";

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoNow(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

export const DEMO_DOCUMENTS: RecentDocument[] = [
  {
    id: "demo-doc-electricity",
    original_filename: "conta_luz_agosto.jpg",
    status: "needs_review" satisfies DocumentStatus,
    created_at: isoNow(-1),
    title: null,
  },
  {
    id: "demo-doc-insurance",
    original_filename: "seguro_veiculo.pdf",
    status: "archived" satisfies DocumentStatus,
    created_at: isoNow(-3),
    title: "Vehicle insurance — Porto Seguro",
  },
  {
    id: "demo-doc-exam",
    original_filename: "IMG_4821.heic",
    status: "archived" satisfies DocumentStatus,
    created_at: isoNow(-6),
    title: "Blood work — routine checkup",
  },
  {
    id: "demo-doc-internet",
    original_filename: "fatura_internet.pdf",
    status: "archived" satisfies DocumentStatus,
    created_at: isoNow(-8),
    title: "Internet bill — Claro",
  },
  {
    id: "demo-doc-processing",
    original_filename: "recibo_condominio.jpg",
    status: "processing" satisfies DocumentStatus,
    created_at: isoNow(0),
    title: null,
  },
];

export const DEMO_DEADLINES: DashboardDeadline[] = [
  {
    id: "demo-deadline-electricity",
    title: "Electricity bill",
    due_date: daysFromToday(-2),
    amount: 214.9,
    recurrence: "monthly" satisfies DeadlineRecurrence,
    reminder_offset_days: 3,
    document_id: "demo-doc-electricity",
    documents: { search_language: "pt" as DocumentLanguage },
  },
  {
    id: "demo-deadline-insurance",
    title: "Vehicle insurance renewal",
    due_date: daysFromToday(0),
    amount: 1180,
    recurrence: "yearly" satisfies DeadlineRecurrence,
    reminder_offset_days: 7,
    document_id: "demo-doc-insurance",
    documents: { search_language: "pt" as DocumentLanguage },
  },
  {
    id: "demo-deadline-internet",
    title: "Internet bill",
    due_date: daysFromToday(4),
    amount: 99.9,
    recurrence: "monthly" satisfies DeadlineRecurrence,
    reminder_offset_days: 3,
    document_id: "demo-doc-internet",
    documents: { search_language: "pt" as DocumentLanguage },
  },
  {
    id: "demo-deadline-exam",
    title: "Follow-up exam",
    due_date: daysFromToday(12),
    amount: null,
    recurrence: "none" satisfies DeadlineRecurrence,
    reminder_offset_days: 1,
    document_id: "demo-doc-exam",
    documents: { search_language: "en" as DocumentLanguage },
  },
];

export const DEMO_DEADLINE_HISTORY: Array<{
  entry: DeadlineHistoryItem;
  actionLabel: "Completed" | "Dismissed";
}> = [
  {
    actionLabel: "Completed",
    entry: {
      id: "demo-deadline-water-done",
      title: "Water bill",
      due_date: daysFromToday(-20),
      amount: 78.4,
      updated_at: isoNow(-19),
      document_id: null,
      documents: { search_language: "pt" as DocumentLanguage },
    },
  },
  {
    actionLabel: "Dismissed",
    entry: {
      id: "demo-deadline-gym-dismissed",
      title: "Gym membership renewal",
      due_date: daysFromToday(-15),
      amount: 129,
      updated_at: isoNow(-14),
      document_id: null,
      documents: { search_language: "pt" as DocumentLanguage },
    },
  },
];
