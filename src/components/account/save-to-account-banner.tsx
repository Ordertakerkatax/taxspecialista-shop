"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

interface SaveToAccountBannerProps {
  email: string;
}

export function SaveToAccountBanner({ email }: SaveToAccountBannerProps) {
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
        <p className="text-sm font-medium text-teal-900">
          Save your consultation history
        </p>
        <p className="text-sm text-teal-700 mt-1">
          Create a free account to access this session anytime. Your consultation
          for <span className="font-medium">{email}</span> will be linked automatically.
        </p>
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
