export const SESSION_EXPIRY_HOURS = 24;

export const PRICING_TIERS = {
  basic: {
    name: "Basic Consultation",
    price: 1000,
    currency: "PHP",
    description: "Ideal for straightforward LOA responses and initial BIR compliance questions.",
  },
  comprehensive: {
    name: "Comprehensive Consultation",
    price: 2500,
    currency: "PHP",
    description: "In-depth analysis with detailed legal citations, multiple defense strategies, and priority review.",
  },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

export const REJECTION_REASONS = [
  "Amount mismatch",
  "Invalid reference number",
  "Duplicate submission",
  "Other",
] as const;
