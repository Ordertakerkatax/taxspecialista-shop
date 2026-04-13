import { Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
          BIR Tax Dispute Advisory
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight mb-4">
          Received a Letter of Authority from the BIR?
        </h1>
        <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto mb-3">
          How you respond in the next few days determines whether you control the audit — or the BIR does.
        </p>
        <p className="text-base text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
          Get immediate clarity on your deadlines, risks, and next steps — backed by Philippine tax law. Starting at PHP 2,000.
        </p>
        <a
          href="#pricing"
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors min-h-[44px] shadow-sm"
        >
          Get Guidance Now
        </a>

        {/* Quick stat bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-teal-600 shrink-0" />
            <span><strong className="text-gray-900">10 days</strong> before the BIR issues a first notice</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span><strong className="text-gray-900">25–50%</strong> surcharge on deficiency taxes</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <span><strong className="text-gray-900">PHP 2,000</strong> for immediate guidance</span>
          </div>
        </div>
      </div>
    </section>
  );
}
