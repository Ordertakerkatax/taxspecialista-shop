import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing validateSession
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

// Import after mocks are set up
const { validateSession } = await import("@/lib/session");
const { db } = await import("@/db");

describe("validateSession", () => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Chain setup: db.select().from().where().limit()
    mockLimit.mockResolvedValue([]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });
  });

  it("returns not_found when session does not exist", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await validateSession("nonexistent-token");

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not_found");
    expect(result.session).toBeNull();
    expect(result.readOnly).toBe(false);
  });

  it("returns expired and readOnly when session is past expiresAt", async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const mockSession = {
      id: "test-session-id",
      paymentId: "test-payment-id",
      email: "test@example.com",
      tier: "basic" as const,
      sessionToken: "test-token-expired",
      activatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
      expiresAt: pastDate,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
    };
    mockLimit.mockResolvedValueOnce([mockSession]);

    const result = await validateSession("test-token-expired");

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("expired");
    expect(result.session).toEqual(mockSession);
    expect(result.readOnly).toBe(true);
  });

  it("returns active and not readOnly when session is valid and not expired", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
    const mockSession = {
      id: "test-session-id",
      paymentId: "test-payment-id",
      email: "test@example.com",
      tier: "comprehensive" as const,
      sessionToken: "test-token-active",
      activatedAt: new Date(),
      expiresAt: futureDate,
      createdAt: new Date(),
    };
    mockLimit.mockResolvedValueOnce([mockSession]);

    const result = await validateSession("test-token-active");

    expect(result.valid).toBe(true);
    expect(result.reason).toBe("active");
    expect(result.session).toEqual(mockSession);
    expect(result.readOnly).toBe(false);
  });
});
