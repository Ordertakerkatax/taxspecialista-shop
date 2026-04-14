import { NextRequest } from "next/server";
import { Resend } from "resend";
import PaymentApprovedEmail from "@/emails/payment-approved";

/**
 * Temporary debug endpoint to test Resend email delivery.
 * DELETE THIS FILE after confirming email works.
 *
 * Test 1 (plain HTML):  GET /api/test-email?to=your@email.com
 * Test 2 (React email): GET /api/test-email?to=your@email.com&react=1
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to");
  const useReact = request.nextUrl.searchParams.get("react");

  if (!to) {
    return Response.json({ error: "Pass ?to=your@email.com" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json({ error: "RESEND_API_KEY not set in environment" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    if (useReact) {
      // Test with the actual React email template (same as approval flow)
      const result = await resend.emails.send({
        from: "TaxSpecialista Consult <noreply@taxspecialista.com>",
        to,
        subject: "TaxSpecialista React Email Test",
        react: PaymentApprovedEmail({
          consultUrl: "https://consult.taxspecialista.com/consult/test-session",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      });
      return Response.json({ success: true, mode: "react", result });
    }

    // Test with plain HTML
    const result = await resend.emails.send({
      from: "TaxSpecialista Consult <noreply@taxspecialista.com>",
      to,
      subject: "TaxSpecialista Email Test",
      html: "<p>If you see this, Resend is working correctly.</p>",
    });

    return Response.json({ success: true, mode: "html", result });
  } catch (e) {
    return Response.json({
      success: false,
      error: (e as Error).message,
      details: JSON.stringify(e),
    }, { status: 500 });
  }
}
