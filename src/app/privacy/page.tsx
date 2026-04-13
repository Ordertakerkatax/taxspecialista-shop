import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy — TaxSpecialista Consult",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: April 13, 2026</p>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
              <p>
                TaxSpecialista Consult (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is operated by ETM Tax Agent Office. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and consultation services at consult.taxspecialista.com.
              </p>
              <p className="mt-2">
                By using our services, you consent to the collection and use of your information as described in this policy, in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
              <p className="font-medium text-gray-900 mt-3">Account Information</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Email address</li>
                <li>Name (if provided during account creation)</li>
              </ul>
              <p className="font-medium text-gray-900 mt-3">Consultation Data</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Chat messages exchanged during consultation sessions</li>
                <li>Details about your BIR correspondence that you provide (document type, dates, amounts)</li>
                <li>Documents generated during your session (acknowledgment letters, compliance letters)</li>
              </ul>
              <p className="font-medium text-gray-900 mt-3">Payment Information</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Payment reference numbers</li>
                <li>Proof of payment screenshots</li>
                <li>Selected consultation plan and amount</li>
              </ul>
              <p className="font-medium text-gray-900 mt-3">Technical Information</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Session timestamps and duration</li>
                <li>Browser type and device information (collected automatically)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li>To provide AI-powered consultation services and generate advisory documents</li>
                <li>To process and verify your payments</li>
                <li>To send consultation links and session-related notifications to your email</li>
                <li>To link your consultation history to your account (if you create one)</li>
                <li>To detect complex cases that may require referral to a tax professional</li>
                <li>To improve the accuracy and quality of our advisory service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. AI Processing</h2>
              <p>
                Our consultation service uses artificial intelligence to analyze your BIR situation and generate guidance. The information you provide during a consultation session — including details about your BIR correspondence and tax situation — is processed by AI systems to generate responses, calculate deadlines, and draft documents.
              </p>
              <p className="mt-2">
                AI-generated output is for informational purposes only and does not constitute formal legal or tax advice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Third-Party Service Providers</h2>
              <p>
                We use third-party service providers to operate our platform, including providers for authentication, payment processing, file storage, email delivery, and AI processing. These providers access your data only to the extent necessary to perform their services and are bound by their own privacy policies and data protection obligations.
              </p>
              <p className="mt-2">
                We do not sell, rent, or trade your personal information to any third party for marketing or advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Retention</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Chat sessions and consultation data:</strong> Retained for 90 days from the session date, after which they are permanently deleted.</li>
                <li><strong>Payment records:</strong> Retained for 3 years in compliance with Philippine tax record-keeping requirements.</li>
                <li><strong>Account information:</strong> Retained for as long as your account remains active. You may request deletion at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is transmitted using encrypted connections (HTTPS). Access to personal data is restricted to authorized personnel only.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Your Rights Under the Data Privacy Act</h2>
              <p>Under Republic Act No. 10173, you have the right to:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li><strong>Be informed</strong> — Know how your personal data is being collected, used, and processed</li>
                <li><strong>Access</strong> — Obtain a copy of your personal data in our possession</li>
                <li><strong>Correct</strong> — Request correction of inaccurate or incomplete personal data</li>
                <li><strong>Erase or block</strong> — Request deletion or blocking of your personal data under certain conditions</li>
                <li><strong>Object</strong> — Object to the processing of your personal data</li>
                <li><strong>Data portability</strong> — Obtain your personal data in a structured, commonly used format</li>
                <li><strong>Lodge a complaint</strong> — File a complaint with the National Privacy Commission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact Us</h2>
              <p>
                For privacy-related inquiries, data access requests, or to exercise any of your rights under the Data Privacy Act, contact us at:
              </p>
              <p className="mt-2">
                <strong>ETM Tax Agent Office</strong><br />
                Email:{" "}
                <a href="mailto:support@taxspecialista.com" className="text-teal-600 hover:underline">
                  support@taxspecialista.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Continued use of our services after changes are posted constitutes acceptance of the revised policy.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
