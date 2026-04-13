import { createAnthropic } from "@ai-sdk/anthropic";

export function getAnthropic() {
  // dotenv workaround: Next.js 16 Turbopack doesn't inject .env.local into process.env for route handlers
  let key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    try {
      const fs = require("fs");
      const path = require("path");
      const envPath = path.join(process.cwd(), ".env.local");
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
      if (match) key = match[1].trim();
    } catch {}
  }
  return createAnthropic({
    apiKey: key!,
    baseURL: "https://api.anthropic.com/v1",
  });
}

export const CHAT_MODEL = "claude-sonnet-4-5-20250929" as const;

export const MAX_MESSAGES_BASIC = 50;
export const MAX_MESSAGES_COMPREHENSIVE = 100;
