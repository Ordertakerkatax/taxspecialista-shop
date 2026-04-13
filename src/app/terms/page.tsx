import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service — TaxSpecialista Consult",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: April 13, 2026</p>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Overview</h2>
              <p>
                TaxSpecialista Consult (&quot;the Service&quot;) is an AI-powered consultation platform operated by ETM Tax Agent Office that provides guidance on Philippine BIR tax dispute proceedings. By using the Service, you agree to these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Nature of the Service</h2>
              <p>
                The Service provides AI-generated guidance for informational purposes only. It is designed to help you understand BIR correspondence, calculate reglementary deadlines, assess risks, and draft procedural documents such as acknowledgment and compliance letters.
              </p>
              <p className="mt-2 font-medium text-gray-900">
                The Service does NOT provide:
              </p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Formal legal or tax advice</li>
                <li>Professional representation before the BIR or any tribunal</li>
                <li>Protest letters or other sensitive legal documents</li>
                <li>Guarantees about the outcome of any BIR proceeding</li>
              </ul>
              <p className="mt-2">
                Use of the Service does not create a professional-client relationship between you and ETM Tax Agent Office.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Disclaimer of Liability</h2>
              <p>
                All AI-generated documents are provided in draft form and should be reviewed by a qualified tax professional before filing with the BIR or any government agency. ETM Tax Agent Office and TaxSpecialista Consult shall not be held liable for any consequences arising from the use of AI-generated guidance or documents without professional review.
              </p>
              <p className="mt-2">
                While we strive for accuracy in citing Philippine tax laws, revenue issuances, and reglementary periods, AI-generated output may contain errors. You are responsible for verifying all information, deadlines, and legal citations before acting on them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Consultation Sessions</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li>Each consultation session is valid for 24 hours from activation.</li>
                <li>The Basic plan includes up to 50 messages; the Comprehensive plan includes up to 100 messages.</li>
                <li>Sessions that exceed the time or message limit are automatically closed.</li>
                <li>Consultation data is retained for 90 days, after which it is permanently deleted.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Payment and Refunds</h2>
              <p>
                Payment is required before a consultation session is activated. We accept payments via GCash and bank transfer. All payments are subject to verification.
              </p>
              <p className="mt-2">
                Refunds may be issued at our discretion in the following cases:
              </p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Payment was verified but the consultation session was never activated due to a technical issue on our end</li>
                <li>Duplicate payment for the same consultation</li>
              </ul>
              <p className="mt-2">
                Refunds are not available for completed or partially used consultation sessions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Referrals to Tax Professionals</h2>
              <p>
                When the Service detects that your case may be too complex for AI-generated guidance, we may refer you to ETM Tax Agent Office or another qualified tax professional. Such referrals are provided as a courtesy and do not constitute an endorsement or guarantee of services.
              </p>
              <p className="mt-2">
                Any engagement with a tax professional is a separate arrangement between you and that professional, subject to their own terms and fees. TaxSpecialista Consult is not a party to that engagement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. User Responsibilities</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li>Provide accurate information about your BIR correspondence and tax situation</li>
                <li>Review all AI-generated documents before filing or acting on them</li>
                <li>Do not rely solely on the Service for time-sensitive BIR compliance — consult a tax professional if in doubt</li>
                <li>Do not use the Service for fraudulent purposes or to evade tax obligations</li>
                <li>Keep your account credentials secure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Intellectual Property</h2>
              <p>
                Documents generated during your consultation session (acknowledgment letters, compliance letters, advisory summaries) are provided for your personal use in responding to your BIR correspondence. The underlying AI system, platform design, and knowledge base remain the intellectual property of ETM Tax Agent Office.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by Philippine law, TaxSpecialista Consult and ETM Tax Agent Office shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service, including but not limited to missed deadlines, incorrect filings, or adverse BIR actions.
              </p>
              <p className="mt-2">
                Our total liability for any claim arising from the Service shall not exceed the amount you paid for the consultation session giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from the use of the Service shall be resolved in the appropriate courts of the Philippines.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Any changes will be posted on this page with an updated effective date. Continued use of the Service after changes are posted constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Contact</h2>
              <p>
                For questions about these Terms of Service, contact us at:
              </p>
              <p className="mt-2">
                <strong>ETM Tax Agent Office</strong><br />
                Email:{" "}
                <a href="mailto:support@taxspecialista.com" className="text-teal-600 hover:underline">
                  support@taxspecialista.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
