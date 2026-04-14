import { createAnthropic } from "@ai-sdk/anthropic";

export function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return createAnthropic({ apiKey: key });
}

export const CHAT_MODEL = "claude-sonnet-4-5-20250929" as const;

export const MAX_MESSAGES_BASIC = 30;
export const MAX_MESSAGES_COMPREHENSIVE = 100;
