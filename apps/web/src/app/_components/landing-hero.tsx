import { CtaLink } from "./cta-link";
import { ReceiptTeaser } from "./receipt-teaser";

export function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Document management, minus the spreadsheet
          </span>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Snap a photo. Duely remembers the rest.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-muted-foreground">
            Duely reads your bills, health records, and vehicle documents, then reminds you before
            anything&apos;s due. No folders. No spreadsheets. No missed deadlines.
          </p>
          <div className="flex w-full flex-col items-center gap-3 self-center sm:w-auto sm:flex-row sm:items-center sm:self-start">
            <CtaLink href="/demo" variant="primary">
              Try the live demo
            </CtaLink>
            <CtaLink href="/signup" variant="outline">
              Sign up free
            </CtaLink>
          </div>
        </div>
        <ReceiptTeaser />
      </div>
    </section>
  );
}
