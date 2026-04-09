import { Resend } from "resend";
import PaymentReceivedEmail from "@/emails/payment-received";
import PaymentApprovedEmail from "@/emails/payment-approved";
import PaymentRejectedEmail from "@/emails/payment-rejected";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "TaxSpecialista Consult <noreply@taxspecialista.com>";

export async function sendPaymentReceivedEmail(submission: {
  id: string;
  email: string;
  tier: string;
  referenceNumber: string;
  amountPhp: number;
}) {
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
  const consultUrl = `${process.env.NEXT_PUBLIC_APP_URL}/consult/${sessionToken}`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: "Your TaxSpecialista Consultation is Ready",
    react: PaymentApprovedEmail({ consultUrl, expiresAt }),
  });
}

export async function sendPaymentRejectedEmail(
  userEmail: string,
  reason: string
) {
  const payUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: "TaxSpecialista Payment Update",
    react: PaymentRejectedEmail({ reason, payUrl }),
  });
}
