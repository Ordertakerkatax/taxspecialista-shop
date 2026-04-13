import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "How is this different from ChatGPT or other AI tools?",
    answer:
      "General AI tools give generic answers about tax law. TaxSpecialista Consult is purpose-built for Philippine BIR tax disputes. It knows the exact reglementary periods for each type of BIR correspondence, cites specific NIRC sections, Revenue Memorandum Orders, and Revenue Regulations, and generates properly formatted acknowledgment and response letters. The system is built on real case experience from ETM Tax Agent Office, not just training data.",
  },
  {
    id: "faq-2",
    question: "What do I get with a consultation?",
    answer:
      "You get immediate clarity on your BIR situation: what the document means, your reglementary deadline to respond, the risks of inaction, and a draft acknowledgment letter you can file to establish your cooperative stance. The Comprehensive plan adds full advisory with defense strategies and draft response letters.",
  },
  {
    id: "faq-3",
    question: "What types of BIR correspondence does this cover?",
    answer:
      "We cover all major BIR correspondence types: Letter of Authority (LOA), Subpoena Duces Tecum (SDT), Notice for Informal Conference (NIC), Notice of Discrepancy (NOD), Preliminary Assessment Notice (PAN), Final Assessment Notice (FAN), and Final Decision on Disputed Assessment (FDDA). For LOA and SDT, we provide full advisory and document drafting. For assessment notices, we provide acknowledgment letters and general guidance with referral to professional representation.",
  },
  {
    id: "faq-4",
    question: "Is this legal or tax advice?",
    answer:
      "No. This service provides AI-generated guidance for informational purposes only. It is not formal legal or tax advice and does not create a professional-client relationship. All draft documents carry a DRAFT watermark and should be reviewed by a qualified tax professional before filing. For complex matters, we can refer you to ETM Tax Agent Office for professional representation.",
  },
  {
    id: "faq-5",
    question: "Why should I use this instead of going directly to a tax consultant?",
    answer:
      "An initial consultation with a tax professional can cost PHP 5,000 to PHP 15,000 or more, and you may wait days for an appointment. TaxSpecialista Consult gives you immediate, actionable guidance starting at PHP 2,000 so you can respond to the BIR within your deadline. If your case needs professional representation, we connect you to ETM Tax Agent Office with your case already documented and organized.",
  },
  {
    id: "faq-6",
    question: "How long is the consultation session?",
    answer:
      "Each session is valid for 24 hours from activation. The Basic plan includes up to 50 messages; the Comprehensive plan includes up to 100 messages. Most consultations complete within 30 to 60 minutes.",
  },
  {
    id: "faq-7",
    question: "What payment methods are accepted?",
    answer:
      "We accept GCash and bank transfer. No credit card required. After sending payment, submit your reference number through this website. Once verified, your consultation link is sent to your email.",
  },
  {
    id: "faq-8",
    question: "How long does payment verification take?",
    answer:
      "Payment verification typically takes a few hours during business hours (Monday to Friday, 9 AM to 6 PM Philippine time). Once verified, you will receive your consultation link by email immediately.",
  },
  {
    id: "faq-9",
    question: "What if my case is too complex for the AI?",
    answer:
      "Our system automatically detects complex cases involving large tax amounts, fraud allegations, or multiple tax periods. When complexity is flagged, a tax professional from ETM Tax Agent Office reviews your case and reaches out to you directly. This is included at no extra cost.",
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
