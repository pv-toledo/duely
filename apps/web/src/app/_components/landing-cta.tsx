import { CtaLink } from "./cta-link";

export function LandingCta() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          See it for yourself
        </h2>
        <p className="max-w-md text-muted-foreground">
          No signup required to look around. Jump into a live demo, or create your account and start
          with your own documents.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <CtaLink href="/demo" variant="primary" className="w-56 justify-center">
            Try the live demo
          </CtaLink>
          <CtaLink href="/signup" variant="outline" className="w-56 justify-center">
            Sign up free
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
