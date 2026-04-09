import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingTiers } from "@/components/landing/pricing-tiers";
import { TrustSignals } from "@/components/landing/trust-signals";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <PricingTiers />
        <TrustSignals />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
