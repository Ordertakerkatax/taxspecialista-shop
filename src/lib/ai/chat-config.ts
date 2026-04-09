import { createAnthropic } from "@ai-sdk/anthropic";

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CHAT_MODEL = "claude-sonnet-4-5-20241022";

export const MAX_MESSAGES_BASIC = 30;
export const MAX_MESSAGES_COMPREHENSIVE = 100;
