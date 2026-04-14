"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConsultError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
              Please try again or click the consultation link from your email.
              Your session and messages are safe.
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
            <button
              onClick={() => reset()}
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
              )}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
