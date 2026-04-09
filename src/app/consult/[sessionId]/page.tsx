import { validateSession } from "@/lib/session";
import { PRICING_TIERS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  other: {
    referrerPolicy: "no-referrer",
  },
};

interface ConsultPageProps {
  params: Promise<{ sessionId: string }>;
}

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

export default async function ConsultPage({ params }: ConsultPageProps) {
  const { sessionId } = await params;
  const result = await validateSession(sessionId);

  // State 1: Valid (active) session
  if (result.reason === "active") {
    const { session } = result;
    const tierInfo =
      PRICING_TIERS[session.tier as keyof typeof PRICING_TIERS] ??
      PRICING_TIERS.basic;

    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-[768px]">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-8 w-8 text-teal-600" />
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Your Consultation is Ready
                </CardTitle>
              </div>
              <Badge className="w-fit bg-green-100 text-green-800 border-green-200">
                Session Active
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {tierInfo.name}
                </Badge>
              </div>

              <div className="rounded-md bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{session.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Session expires at</span>
                  <span className="font-medium text-gray-900">
                    {formatExpiry(session.expiresAt)}
                  </span>
                </div>
              </div>

              <div className="rounded-md bg-teal-50 border border-teal-200 p-4">
                <p className="text-teal-800 text-sm">
                  Chat functionality is coming in Phase 2. Your session is active and ready.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State 2: Expired session
  if (result.reason === "expired") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-[768px] space-y-4">
          {/* Amber warning banner */}
          <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">
              Session Expired
            </p>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Session Expired
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your 24-hour consultation window has ended. You can still view your
                conversation history below, but new messages cannot be sent.
              </p>

              {/* Placeholder for chat history */}
              <div className="rounded-md bg-gray-50 border border-gray-200 p-6 text-center">
                <p className="text-gray-400 text-sm">
                  Conversation history will appear here.
                </p>
              </div>

              <Link
                href="/"
                className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
              >
                Start a New Consultation
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State 3: Invalid / not found session
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
              This consultation requires a valid payment. If you have already paid,
              check your email for the access link.
            </p>
            <p className="text-gray-500 text-sm">
              This consultation link is invalid. If you believe this is an error,
              contact{" "}
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
