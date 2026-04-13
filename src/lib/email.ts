import { Resend } from "resend";
import PaymentReceivedEmail from "@/emails/payment-received";
import PaymentApprovedEmail from "@/emails/payment-approved";
import PaymentRejectedEmail from "@/emails/payment-rejected";
import EscalationNotificationEmail from "@/emails/escalation-notification";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM_EMAIL = "TaxSpecialista Consult <noreply@taxspecialista.com>";

export async function sendPaymentReceivedEmail(submission: {
  id: string;
  email: string;
  tier: string;
  referenceNumber: string;
  amountPhp: number;
}) {
  const resend = getResend();
  if (!resend) return;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/payments`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL!,
    subject: `New Payment: PHP ${submission.amountPhp} - ${submission.referenceNumber}`,
    react: PaymentReceivedEmail({ submission, adminUrl }),
  });
}

export async function sendPaymentApprovedEmail(
  userEmail: string,
  sessionToken: string,
  expiresAt: Date
) {
  const resend = getResend();
  if (!resend) return;
  const consultUrl = `${process.env.NEXT_PUBLIC_APP_URL}/consult/${sessionToken}`;
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: "Your TaxSpecialista Consultation is Ready",
    react: PaymentApprovedEmail({ consultUrl, expiresAt }),
  });
  console.log("[email] Resend response:", JSON.stringify(result));
}

export async function sendPaymentRejectedEmail(
  userEmail: string,
  reason: string
) {
  const resend = getResend();
  if (!resend) return;
  const payUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: "TaxSpecialista Payment Update",
    react: PaymentRejectedEmail({ reason, payUrl }),
  });
}

export async function sendEscalationNotificationEmail(escalation: {
  summary: string;
  reasons: string[];
  severity: "medium" | "high";
  sessionEmail: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/payments`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL!,
    subject: `Escalated Case: ${escalation.severity} - ${escalation.sessionEmail}`,
    react: EscalationNotificationEmail({
      summary: escalation.summary,
      reasons: escalation.reasons,
      severity: escalation.severity,
      sessionEmail: escalation.sessionEmail,
      adminUrl,
    }),
  });
}
