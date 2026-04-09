import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TierSummary } from "@/components/payment/tier-summary";
import { PaymentForm } from "@/components/payment/payment-form";
import { PRICING_TIERS, type TierKey } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Payment | TaxSpecialista Consult",
};

interface PayPageProps {
  searchParams: Promise<{ tier?: string }>;
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const resolvedParams = await searchParams;
  const rawTier = resolvedParams.tier;

  // Validate tier parameter
  const validTiers = Object.keys(PRICING_TIERS) as TierKey[];
  const tier: TierKey = validTiers.includes(rawTier as TierKey)
    ? (rawTier as TierKey)
    : redirect("/");

  const amount = PRICING_TIERS[tier].price;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <a href="/" className="text-sm text-teal-600 hover:underline">
            &larr; Back to home
          </a>
        </div>
        <Card className="bg-white">
          <CardContent className="pt-6 pb-6">
            <TierSummary tier={tier} />
            <PaymentForm tier={tier} amount={amount} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
