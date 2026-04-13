import { NextRequest } from "next/server";
import { Resend } from "resend";

/**
 * Temporary debug endpoint to test Resend email delivery.
 * DELETE THIS FILE after confirming email works.
 *
 * Usage: GET /api/test-email?to=your@email.com
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to");

  if (!to) {
    return Response.json({ error: "Pass ?to=your@email.com" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json({ error: "RESEND_API_KEY not set in environment" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: "TaxSpecialista Consult <noreply@taxspecialista.com>",
      to,
      subject: "TaxSpecialista Email Test",
      html: "<p>If you see this, Resend is working correctly.</p>",
    });

    return Response.json({ success: true, result });
  } catch (e) {
    return Response.json({
      success: false,
      error: (e as Error).message,
      details: JSON.stringify(e),
    }, { status: 500 });
  }
}
