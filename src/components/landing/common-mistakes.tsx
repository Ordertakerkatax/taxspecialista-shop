import { XCircle } from "lucide-react";

const mistakes = [
  {
    mistake: "Submitting all records immediately without strategy",
    reality:
      "Handing over everything at once gives the BIR examiner full control of the narrative. A strategic, phased response protects your position.",
  },
  {
    mistake: "Not checking if the LOA is valid",
    reality:
      "An LOA must be signed by the correct BIR officials, specify the correct taxable year, and match the authorized scope. Invalid LOAs can be challenged.",
  },
  {
    mistake: "Ignoring it and hoping it goes away",
    reality:
      "The BIR does not forget. Ignoring an LOA leads to assessment based on best available evidence — with surcharges and interest — and you lose the right to protest.",
  },
  {
    mistake: "Confusing an LOA with other BIR notices",
    reality:
      "An LOA, Subpoena Duces Tecum, and assessment notices each have different deadlines and require different responses. Using the wrong approach can waive your rights.",
  },
];

export function CommonMistakes() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          What Most Taxpayers Get Wrong
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
          These are the most common mistakes we see — and each one can cost you thousands in unnecessary penalties.
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          {mistakes.map((item) => (
            <div
              key={item.mistake}
              className="bg-white rounded-lg p-5 border border-gray-100"
            >
              <div className="flex gap-3 mb-2">
                <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-base font-medium text-gray-900">
                  {item.mistake}
                </p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed ml-8">
                {item.reality}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
