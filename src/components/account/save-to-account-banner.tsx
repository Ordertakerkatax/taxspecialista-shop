"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { History, FileDown, MessageSquareText, LinkIcon } from "lucide-react";

interface SaveToAccountBannerProps {
  email: string;
  /** Use compact layout (no benefits list) for tight spaces like pay-submitted */
  compact?: boolean;
}

const ACCOUNT_BENEFITS = [
  {
    icon: History,
    text: "View your full consultation history anytime",
  },
  {
    icon: FileDown,
    text: "Re-download summaries and transcripts as PDF",
  },
  {
    icon: MessageSquareText,
    text: "Review past chat sessions in read-only mode",
  },
  {
    icon: LinkIcon,
    text: "Previous consultations using this email are linked automatically",
  },
];

export function SaveToAccountBanner({ email, compact = false }: SaveToAccountBannerProps) {
  const { isSignedIn, isLoaded } = useUser();

  // Don't render until Clerk has loaded user state
  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
        <p className="text-sm text-teal-800">
          This consultation is linked to your account.{" "}
          <Link href="/account/history" className="font-medium underline hover:text-teal-600">
            View your consultation history
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-teal-900">
          Create a free account
        </p>
        {compact ? (
          <p className="text-sm text-teal-700 mt-1">
            Access your consultation history, re-download documents, and review past chats anytime.
            All consultations using <span className="font-medium">{email}</span> will be linked automatically — including any previous ones.
          </p>
        ) : (
          <>
            <ul className="mt-2 space-y-1.5">
              {ACCOUNT_BENEFITS.map((benefit) => (
                <li key={benefit.text} className="flex items-center gap-2 text-sm text-teal-700">
                  <benefit.icon className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  {benefit.text}
                </li>
              ))}
            </ul>
            <p className="text-xs text-teal-600 mt-2">
              Sign up with <span className="font-medium">{email}</span> and all your consultations — past and future — will appear in your account automatically.
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <SignUpButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
            Create a free account
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md border border-teal-300 bg-white px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
            Already have an account? Sign in
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
