import { Upload, Sparkles, Bell } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Snap or upload",
    description:
      "Photograph a receipt, insurance card, or vehicle document. Anything with a due date or a detail worth remembering.",
  },
  {
    icon: Sparkles,
    title: "AI reads it for you",
    description: "Duely extracts the vendor, amount, dates, and category in seconds.",
  },
  {
    icon: Bell,
    title: "Never miss a deadline",
    description:
      "Get an email reminder exactly when you want it. A day before, a week before, whatever works for you.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-medium">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <step.icon className="size-4" />
                </span>
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
