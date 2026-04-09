import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "What do I get with a consultation?",
    answer:
      "You receive AI-powered guidance on your specific BIR tax dispute, including relevant legal citations from the NIRC, Revenue Memorandum Orders (RMOs), and Revenue Regulations (RRs). You also get step-by-step action items and response deadline tracking -- all within a 24-hour consultation window.",
  },
  {
    id: "faq-2",
    question: "How does the consultation work?",
    answer:
      "After payment is verified, you receive a secure consultation link by email. You can describe your BIR dispute situation in the chat, and our AI system will provide legally-grounded guidance. The Basic plan covers LOA responses and initial compliance questions; the Comprehensive plan provides in-depth analysis with multiple defense strategies.",
  },
  {
    id: "faq-3",
    question: "Is this legal or tax advice?",
    answer:
      "No. This service provides AI-generated guidance for informational purposes only. It is not formal legal or tax advice and does not create a professional-client relationship. For formal representation or complex matters, we recommend engaging a licensed CPA or tax attorney.",
  },
  {
    id: "faq-4",
    question: "How long is the consultation session?",
    answer:
      "Each consultation session is valid for 24 hours from the time your payment is verified and your consultation link is activated. During this window, you can ask multiple questions related to your BIR dispute.",
  },
  {
    id: "faq-5",
    question: "What payment methods are accepted?",
    answer:
      "We accept GCash (via QR code or GCash number) and bank transfer. No credit card required. After sending payment, you submit your reference number through this website, and we will verify and activate your consultation.",
  },
  {
    id: "faq-6",
    question: "What BIR stages does this cover?",
    answer:
      "In the current version (v1), TaxSpecialista Consult focuses on Letter of Authority (LOA) proceedings -- the initial stage when the BIR notifies you of an examination. This includes responding to LOAs, providing documents, and understanding your rights during the audit process.",
  },
  {
    id: "faq-7",
    question: "How long does payment verification take?",
    answer:
      "Payment verification typically takes a few hours during business hours (Monday to Friday, 9 AM to 6 PM Philippine time). Once verified, you will receive your consultation link by email immediately.",
  },
];

export function FAQ() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <Accordion multiple className="space-y-1">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="bg-white rounded-lg px-4">
              <AccordionTrigger className="py-4 text-base font-medium text-gray-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
