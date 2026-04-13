"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export function AuthLink() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <Link
        href="/account/history"
        className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        My Account
      </Link>
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
