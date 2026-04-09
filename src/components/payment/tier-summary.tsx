import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS, type TierKey } from "@/lib/constants";

interface TierSummaryProps {
  tier: TierKey;
}

export function TierSummary({ tier }: TierSummaryProps) {
  const tierInfo = PRICING_TIERS[tier];
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{tierInfo.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{tierInfo.description}</p>
      </div>
      <Badge className="bg-teal-600 text-white text-sm px-3 py-1 h-auto">
        PHP {tierInfo.price.toLocaleString()}
      </Badge>
    </div>
  );
}
