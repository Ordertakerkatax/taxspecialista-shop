import { Separator } from "@/components/ui/separator";

export function TrustSignals() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Separator className="mb-8" />
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className="text-base text-gray-700 font-medium">
            Powered by TaxSpecialista and ETM Tax Agent Office -- specializing in BIR tax dispute resolution and taxpayer representation.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Our AI consultation is built on prevailing Philippine tax laws, revenue issuances, and real case experience. Complex cases are escalated to licensed professionals for hands-on representation.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            This service provides AI-generated guidance for informational purposes only. It is not formal legal or tax advice and does not create a professional-client relationship.
          </p>
        </div>
        <Separator className="mt-8" />
      </div>
    </section>
  );
}
