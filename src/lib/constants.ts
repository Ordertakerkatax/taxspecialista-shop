export const SESSION_EXPIRY_HOURS = 24;

export const PRICING_TIERS = {
  basic: {
    name: "Basic Consultation",
    price: 2000,
    currency: "PHP",
    description: "Immediate guidance on BIR correspondence — deadlines, risks, and draft acknowledgment letters.",
  },
  comprehensive: {
    name: "Comprehensive Consultation",
    price: 5000,
    currency: "PHP",
    description: "In-depth analysis with detailed legal citations, defense strategies, and draft compliance letters.",
  },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

export const REJECTION_REASONS = [
  "Amount mismatch",
  "Invalid reference number",
  "Duplicate submission",
  "Other",
] as const;
