"use client";

import { SaveToAccountBanner } from "./save-to-account-banner";

/**
 * Thin re-export wrapper so server components can import a client component
 * without having to mark themselves "use client". Props are identical.
 */
export function SaveToAccountBannerServer({ email }: { email: string }) {
  return <SaveToAccountBanner email={email} compact />;
}
