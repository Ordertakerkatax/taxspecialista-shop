export const SESSION_EXPIRY_HOURS = {
  basic: 12,
  comprehensive: 24,
} as const;

export const PRICING_TIERS = {
  basic: {
    name: "Quick Guidance",
    price: 2000,
    currency: "PHP",
    description: "Understand your BIR situation — stage identification, deadline computation, risk assessment, and a draft acknowledgment letter to buy time.",
    includes: [
      "AI-powered situation analysis",
      "Deadline and prescription computation",
      "Risk assessment and next steps",
      "Draft acknowledgment letter",
    ],
    excludes: [
      "Compliance and response letter drafting",
      "Defense strategy analysis",
      "Escalation to tax professional",
    ],
  },
  comprehensive: {
    name: "Full Consultation",
    price: 5000,
    currency: "PHP",
    description: "Complete advisory with actionable documents — defense strategies, response letters, legal citations, and escalation to a tax professional for complex cases.",
    includes: [
      "Everything in Quick Guidance",
      "Draft compliance, NOD response, and acknowledgment letters",
      "Defense strategy with legal citations",
      "Escalation to tax professional for complex cases",
    ],
    excludes: [],
  },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

export const REJECTION_REASONS = [
  "Amount mismatch",
  "Invalid reference number",
  "Duplicate submission",
  "Other",
] as const;
