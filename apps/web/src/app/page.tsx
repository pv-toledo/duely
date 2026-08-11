// apps/web/src/app/page.tsx
import { LandingHeader } from "./_components/landing-header";
import { LandingHero } from "./_components/landing-hero";
import { HowItWorks } from "./_components/how-it-works";
import { LandingFeatures } from "./_components/landing-features";
import { LandingCta } from "./_components/landing-cta";
import { LandingFooter } from "./_components/landing-footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex flex-1 flex-col">
        <LandingHero />
        <HowItWorks />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
