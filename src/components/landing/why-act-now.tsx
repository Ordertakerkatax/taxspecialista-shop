import { Clock, FileWarning, Scale, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  {
    icon: Clock,
    title: "Your Deadline Is Already Running",
    description:
      "From the moment you receive a Letter of Authority, you have a limited reglementary period to respond. Every day you wait is a day closer to losing your right to present your side.",
  },
  {
    icon: FileWarning,
    title: "Silence Means the BIR Decides for You",
    description:
      "If you don't respond, the BIR will assess your tax liability based on their best available evidence — not yours. You lose the chance to present records, explain discrepancies, or contest findings.",
  },
  {
    icon: TrendingDown,
    title: "Penalties Compound Quickly",
    description:
      "A 25% surcharge applies for late compliance. If the BIR determines willful neglect, that jumps to 50% — plus interest at the rate prescribed by law. What starts as a manageable audit can become an unmanageable debt.",
  },
  {
    icon: Scale,
    title: "Early Response Protects Your Rights",
    description:
      "Filing a timely acknowledgment letter establishes your cooperative stance and preserves your right to contest any assessment. It's the single most important step in a BIR audit.",
  },
];

export function WhyActNow() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          Why You Need to Act Now
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
          A Letter of Authority is not just a letter — it is the start of a formal BIR audit. Here is what is at stake.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason) => (
            <Card key={reason.title} className="bg-gray-50 border-0">
              <CardContent className="pt-5 pb-5">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 shrink-0">
                    <reason.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
