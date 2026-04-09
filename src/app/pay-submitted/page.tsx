import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Submitted | TaxSpecialista Consult",
};

interface PaySubmittedPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function PaySubmittedPage({ searchParams }: PaySubmittedPageProps) {
  const resolvedParams = await searchParams;
  const email = resolvedParams.email ? decodeURIComponent(resolvedParams.email) : "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-[480px] w-full">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Submitted Successfully
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed">
            We have received your payment proof. You will receive an email at{" "}
            {email ? (
              <span className="font-semibold text-gray-900">{email}</span>
            ) : (
              "your email address"
            )}{" "}
            with your consultation link once your payment is verified. This typically takes a few hours during business hours.
          </p>

          <p className="text-sm text-gray-500">
            You can safely close this page. Check your email for next steps.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="text-sm text-teal-600 hover:underline"
            >
              &larr; Return to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
