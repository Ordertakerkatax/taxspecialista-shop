"use client";

import { useState, type ReactNode } from "react";
import { ConsentGate } from "./consent-gate";

interface ConsultationWithConsentProps {
  sessionToken: string;
  alreadyConsented: boolean;
  children: ReactNode;
}

export function ConsultationWithConsent({
  sessionToken,
  alreadyConsented,
  children,
}: ConsultationWithConsentProps) {
  const [consented, setConsented] = useState(alreadyConsented);

  if (!consented) {
    return <ConsentGate sessionToken={sessionToken} onConsented={() => setConsented(true)} />;
  }

  return <>{children}</>;
}
