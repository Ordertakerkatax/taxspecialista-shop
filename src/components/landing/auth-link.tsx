"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AuthLink() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/account/history"
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          My Account
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        Sign In
      </button>
    </SignInButton>
  );
}
