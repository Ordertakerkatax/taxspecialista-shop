"use client";

import { useState } from "react";
import { Shield, AlertTriangle, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsentGateProps {
  sessionToken: string;
  onConsented: () => void;
}

const CONSENT_ITEMS = [
  {
    icon: Shield,
    title: "Purpose and Scope",
    text: "This AI consultation is designed to inform you of the urgency, risk, and reglementary deadlines arising from your BIR correspondence (Letter of Authority, Subpoena Duces Tecum, and related notices). It provides general guidance based on prevailing tax laws and revenue issuances. This is not a substitute for formal legal or tax advice from a licensed professional.",
  },
  {
    icon: AlertTriangle,
    title: "Accuracy of Information",
    text: "The recommendations, deadline calculations, and draft documents generated during this session are only as accurate as the information you provide. Incomplete, incorrect, or outdated details may result in inaccurate guidance. You are responsible for verifying all facts, dates, and reference numbers before acting on any recommendation.",
  },
  {
    icon: FileText,
    title: "Use of Draft Documents",
    text: "Any draft letters or documents generated during this consultation carry a DRAFT watermark and are intended for review purposes only. By filing or submitting any draft document as your own, you accept full responsibility for its contents and release TaxSpecialista Consult, ETM Tax Agent Office, and the AI consultation service from any liability arising from its use.",
  },
  {
    icon: Database,
    title: "Data Storage and Privacy",
    text: "Your chat messages, consultation details, and any information you provide (including TIN, amounts, and dates) are stored securely to deliver and improve this service. Chat data is retained for 90 days from your session date, after which it is permanently deleted. Payment records are retained for 3 years per Philippine tax regulations. If your case is flagged as complex, a summary may be shared with a licensed tax professional for follow-up. You may request data deletion at any time by contacting support@taxspecialista.com. See our Privacy Policy for full details.",
  },
] as const;

export function ConsentGate({ sessionToken, onConsented }: ConsentGateProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!accepted) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });

      if (res.ok) {
        onConsented();
      } else {
        setError("Failed to record your consent. Please try again.");
      }
    } catch (err) {
      console.error("[consent] Error:", err);
      setError("A network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">Before We Begin</h1>
          <p className="text-teal-100 text-sm mt-1">
            Please review and accept the following terms to start your consultation.
          </p>
        </div>

        {/* Consent items */}
        <div className="px-6 py-5 space-y-5">
          {CONSENT_ITEMS.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Acceptance */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              I have read and understood the above terms. I accept that the accuracy of this
              consultation depends on the information I provide, and that filing any generated
              draft document as my own releases the service provider from liability.
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <Button
            onClick={handleAccept}
            disabled={!accepted || submitting}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Starting..." : "I Understand \u2014 Start Consultation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
