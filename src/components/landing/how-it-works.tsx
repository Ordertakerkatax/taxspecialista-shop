import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    title: "Tell us what you received",
    description: "Choose a plan and pay via GCash or bank transfer. No credit card needed.",
  },
  {
    number: 2,
    title: "Get immediate clarity",
    description: "Our AI consultant identifies your deadlines, explains the risks, and drafts an acknowledgment letter to establish your cooperative stance with the BIR.",
  },
  {
    number: 3,
    title: "Know your next steps",
    description: "Receive actionable guidance with legal citations. For complex cases, get a warm referral to ETM Tax Agent Office for professional representation.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="bg-white">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-semibold shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
