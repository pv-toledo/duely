import { FolderOpen, BellRing, ImageIcon, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    title: "Smart vault",
    description: "Every document searchable and filterable, organized automatically by category.",
  },
  {
    icon: BellRing,
    title: "Email reminders",
    description: "Set your own lead time per deadline. Never a surprise bill again.",
  },
  {
    icon: ImageIcon,
    title: "Works with any photo",
    description: "JPEG, PNG, even HEIC straight from your iPhone — Duely handles the conversion.",
  },
  {
    icon: CheckCircle2,
    title: "Built for real life",
    description:
      "Bills, vehicle documents, health records — one place for the paperwork adult life generates.",
  },
];

export function LandingFeatures() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Everything your documents need
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-xl border border-border p-5"
          >
            <feature.icon className="size-5 text-muted-foreground" />
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
