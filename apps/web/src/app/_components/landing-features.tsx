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
    description:
      "Duely accepts JPEGs, PNGs, and even HEIC photos straight from your iPhone, converting them automatically.",
  },
  {
    icon: CheckCircle2,
    title: "Built for real life",
    description:
      "Bills, vehicle documents, health records. Duely gives all of adult life's paperwork one place to live.",
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
            <h3 className="flex items-center gap-2 font-medium">
              <feature.icon className="size-4 text-muted-foreground" />
              {feature.title}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
