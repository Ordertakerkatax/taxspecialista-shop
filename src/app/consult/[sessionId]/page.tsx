import { validateSession } from "@/lib/session";
import { PRICING_TIERS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConsultationWithConsent } from "@/components/chat/consultation-with-consent";
import { currentUser } from "@clerk/nextjs/server";
import { linkSessionsByEmail } from "@/lib/account";
import { SaveToAccountBanner } from "@/components/account/save-to-account-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  other: {
    referrerPolicy: "no-referrer",
  },
};

interface ConsultPageProps {
  params: Promise<{ sessionId: string }>;
}

// Keep for potential future use (e.g., email templates, tooltips)
function formatExpiry(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

// Suppress unused warning — kept intentionally for future use
void formatExpiry;

export default async function ConsultPage({ params }: ConsultPageProps) {
  const { sessionId } = await params;
  const result = await validateSession(sessionId);

  // State 1: Valid (active) session — show live chat (with consent gate if not yet accepted)
  if (result.reason === "active") {
    const { session } = result;
    // Verify tier is a valid key (fallback to basic)
    void (PRICING_TIERS[session.tier as keyof typeof PRICING_TIERS] ?? PRICING_TIERS.basic);

    const existingMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, session.id))
      .orderBy(asc(chatMessages.createdAt));

    return (
      <ConsultationWithConsent
        sessionToken={sessionId}
        alreadyConsented={!!session.consentedAt}
      >
        <div className="min-h-screen bg-gray-50 p-4">
          <ChatInterface
            sessionToken={sessionId}
            sessionId={session.id}
            tier={session.tier as "basic" | "comprehensive"}
            initialMessages={existingMessages.map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))}
            readOnly={false}
          />
        </div>
      </ConsultationWithConsent>
    );
  }

  // State 2: Expired session — show read-only chat history
  if (result.reason === "expired") {
    const expiredMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, result.session.id))
      .orderBy(asc(chatMessages.createdAt));

    // Auto-link: if signed-in user visits an expired session with no userId, link by email
    const user = await currentUser();
    if (user && result.session.userId === null) {
      const userEmail = user.emailAddresses[0]?.emailAddress;
      if (userEmail) {
        await linkSessionsByEmail(user.id, userEmail);
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ChatInterface
          sessionToken={sessionId}
          sessionId={result.session.id}
          tier={result.session.tier as "basic" | "comprehensive"}
          initialMessages={expiredMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }))}
          readOnly={true}
        />
        <SaveToAccountBanner email={result.session.email} />
      </div>
    );
  }

  // State 3: Temporary service error — ask user to retry
  if (result.reason === "db_error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-[480px]">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Temporary Service Issue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We&apos;re having trouble loading your consultation right now.
                This is usually temporary and resolves within a few seconds.
              </p>
              <p className="text-gray-500 text-sm">
                Please try refreshing the page or clicking your consultation
                link from the email again. Your session and messages are safe.
              </p>
              <p className="text-gray-400 text-xs">
                If this continues, contact{" "}
                <a
                  href="mailto:support@taxspecialista.com"
                  className="text-teal-600 hover:underline"
                >
                  support@taxspecialista.com
                </a>
              </p>
              <Link
                href={`/consult/${sessionId}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                )}
              >
                Refresh Page
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State 4: Invalid / not found session — payment-required screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-[480px]">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Consultation Access Required
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This consultation requires a valid payment. If you have already
              paid, check your email for the access link.
            </p>
            <p className="text-gray-500 text-sm">
              This consultation link is invalid. If you believe this is an
              error, contact{" "}
              <a
                href="mailto:support@taxspecialista.com"
                className="text-teal-600 hover:underline"
              >
                support@taxspecialista.com
              </a>
              .
            </p>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
              )}
            >
              Start a New Consultation
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
