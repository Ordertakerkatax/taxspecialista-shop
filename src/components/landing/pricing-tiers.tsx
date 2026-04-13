"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING_TIERS, type TierKey } from "@/lib/constants";
import { CheckIcon } from "lucide-react";

const tierFeatures: Record<TierKey, string[]> = {
  basic: [
    "Deadline and reglementary period calculations",
    "Risk assessment for your BIR situation",
    "Draft acknowledgment letter (all BIR correspondence types)",
    "Legal basis citations (NIRC, RMOs, RRs)",
    "24-hour consultation window (50 messages)",
  ],
  comprehensive: [
    "Everything in Basic, plus:",
    "Full LOA and SDT advisory with defense strategies",
    "Draft protest, compliance, and SDT response letters",
    "Prescription period and waiver validity checks",
    "Complexity assessment with CPA referral",
    "24-hour consultation window (100 messages)",
  ],
};

export function PricingTiers() {
  const [selectedTier, setSelectedTier] = useState<TierKey | null>(null);
  const router = useRouter();

  const handlePayNow = () => {
    if (selectedTier) {
      router.push(`/pay?tier=${selectedTier}`);
    }
  };

  return (
    <section id="pricing" className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          Choose Your Consultation Plan
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Select the plan that best fits your needs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {(Object.keys(PRICING_TIERS) as TierKey[]).map((tierKey) => {
            const tier = PRICING_TIERS[tierKey];
            const isSelected = selectedTier === tierKey;
            return (
              <Card
                key={tierKey}
                className={`bg-white cursor-pointer transition-all min-h-[44px] ${
                  isSelected
                    ? "border-2 border-teal-600 ring-0"
                    : "border border-gray-200"
                }`}
                onClick={() => setSelectedTier(tierKey)}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {tier.name}
                  </CardTitle>
                  <p className="text-3xl font-semibold text-teal-600 mt-1">
                    PHP {tier.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tierFeatures[tierKey].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckIcon className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
                      isSelected
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "border border-teal-600 text-teal-600 hover:bg-teal-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(tierKey);
                    }}
                  >
                    Choose Plan
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {selectedTier && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handlePayNow}
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              Pay Now -- PHP{" "}
              {PRICING_TIERS[selectedTier].price.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
