import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

// Mock db and validateSession before route import
vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock("@/lib/session", () => ({
  validateSession: vi.fn(),
}));

vi.mock("@/lib/ai/chat-config", () => ({
  anthropic: vi.fn().mockReturnValue({}),
  CHAT_MODEL: "claude-sonnet-4-5-20241022",
  MAX_MESSAGES_BASIC: 30,
  MAX_MESSAGES_COMPREHENSIVE: 100,
}));

vi.mock("ai", () => ({
  streamText: vi.fn().mockReturnValue({
    toDataStreamResponse: vi.fn().mockReturnValue(new Response("stream", { status: 200 })),
  }),
}));

import { validateSession } from "@/lib/session";
import { POST } from "@/app/api/chat/route";

describe("Chat API route - session validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Test 1: returns 401 when no sessionToken in request body", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Session token required");
  });

  it("Test 2: returns 403 when session is expired", async () => {
    vi.mocked(validateSession).mockResolvedValueOnce({
      valid: false,
      reason: "expired",
      session: { id: "sess-1", tier: "basic" } as any,
      readOnly: true,
    });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [], sessionToken: "expired-token" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe("Session expired");
  });

  it("Test 3: returns 403 when session is not found", async () => {
    vi.mocked(validateSession).mockResolvedValueOnce({
      valid: false,
      reason: "not_found",
      session: null,
      readOnly: false,
    });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [], sessionToken: "nonexistent-token" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe("Invalid session");
  });
});

describe("System prompt content", () => {
  it("Test 4: contains LOA legal reference NIRC Section 228", () => {
    const prompt = buildSystemPrompt("basic");
    expect(prompt).toContain("NIRC Section 228");
  });

  it("Test 4b: contains LOA legal reference RMO 44-2010", () => {
    const prompt = buildSystemPrompt("basic");
    expect(prompt).toContain("RMO 44-2010");
  });

  it("Test 5: instructs footnote citation format with [1]", () => {
    const prompt = buildSystemPrompt("basic");
    expect(prompt).toContain("[1]");
  });

  it("Test 6: includes disclaimer instruction about formal legal advice", () => {
    const prompt = buildSystemPrompt("basic");
    expect(prompt).toContain("not constitute formal legal");
  });

  it("comprehensive tier prompt contains COMPREHENSIVE consultation text", () => {
    const prompt = buildSystemPrompt("comprehensive");
    expect(prompt).toContain("COMPREHENSIVE consultation");
  });

  it("basic tier prompt contains BASIC consultation text", () => {
    const prompt = buildSystemPrompt("basic");
    expect(prompt).toContain("BASIC consultation");
  });
});
