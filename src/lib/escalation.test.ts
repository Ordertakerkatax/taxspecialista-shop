import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing escalation functions
vi.mock("@/db/index", () => {
  const mockReturning = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();

  const insertMock = {
    values: vi.fn().mockReturnThis(),
    returning: mockReturning,
  };

  const updateMock = {
    set: mockSet,
  };

  mockSet.mockReturnValue({ where: mockWhere });
  mockWhere.mockReturnValue({ returning: mockReturning });

  const selectMock = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
  };

  const db = {
    insert: vi.fn(() => insertMock),
    update: vi.fn(() => updateMock),
    select: vi.fn(() => selectMock),
    _insertMock: insertMock,
    _updateMock: updateMock,
    _selectMock: selectMock,
    _mockReturning: mockReturning,
    _mockWhere: mockWhere,
    _mockSet: mockSet,
  };

  return { db };
});

vi.mock("@/db/schema", () => {
  return {
    escalations: { id: "id", sessionId: "sessionId", status: "status", createdAt: "createdAt" },
    consultationSessions: { id: "id", email: "email" },
    escalationSeverityEnum: {},
    escalationStatusEnum: {},
    Escalation: {},
    NewEscalation: {},
  };
});

vi.mock("drizzle-orm", () => {
  return {
    eq: vi.fn((field, value) => ({ field, value, type: "eq" })),
    desc: vi.fn((field) => ({ field, type: "desc" })),
    sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
      strings,
      values,
      type: "sql",
    })),
  };
});

// Import after mocks are set up
import { db } from "@/db/index";
import { createEscalation, getEscalations, updateEscalationStatus } from "@/lib/escalation";

const mockDb = db as typeof db & {
  _insertMock: { values: ReturnType<typeof vi.fn>; returning: ReturnType<typeof vi.fn> };
  _updateMock: { set: ReturnType<typeof vi.fn> };
  _selectMock: { from: ReturnType<typeof vi.fn>; where: ReturnType<typeof vi.fn>; orderBy: ReturnType<typeof vi.fn>; innerJoin: ReturnType<typeof vi.fn> };
  _mockReturning: ReturnType<typeof vi.fn>;
  _mockWhere: ReturnType<typeof vi.fn>;
  _mockSet: ReturnType<typeof vi.fn>;
};

describe("createEscalation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    mockDb._insertMock.values = vi.fn().mockReturnThis();
    mockDb._insertMock.returning = vi.fn().mockResolvedValue([
      {
        id: "esc-001",
        sessionId: "session-001",
        summary: "Complex LOA case with multiple defects.",
        complexityReasons: JSON.stringify(["Multiple LOA defects", "Tax amount exceeds PHP 1M"]),
        severity: "high",
        status: "pending",
        reviewerNotes: null,
        reviewedAt: null,
        createdAt: new Date("2026-04-10T00:00:00Z"),
      },
    ]);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockDb._insertMock);
  });

  it("stores a record with sessionId, summary, complexityReasons, severity, and status=pending", async () => {
    const input = {
      sessionId: "session-001",
      summary: "Complex LOA case with multiple defects.",
      complexityReasons: ["Multiple LOA defects", "Tax amount exceeds PHP 1M"],
      severity: "high" as const,
    };

    const result = await createEscalation(input);

    expect(db.insert).toHaveBeenCalledOnce();
    expect(mockDb._insertMock.values).toHaveBeenCalledOnce();

    const valuesArg = mockDb._insertMock.values.mock.calls[0][0];
    expect(valuesArg.sessionId).toBe("session-001");
    expect(valuesArg.summary).toBe("Complex LOA case with multiple defects.");
    expect(valuesArg.complexityReasons).toBe(JSON.stringify(["Multiple LOA defects", "Tax amount exceeds PHP 1M"]));
    expect(valuesArg.severity).toBe("high");
    expect(valuesArg.status).toBe("pending");

    expect(result).toMatchObject({
      id: "esc-001",
      sessionId: "session-001",
      status: "pending",
    });
  });
});

describe("getEscalations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const rows = [
      {
        escalations: {
          id: "esc-001",
          sessionId: "session-001",
          summary: "Complex LOA case.",
          complexityReasons: JSON.stringify(["Multiple LOA defects"]),
          severity: "high",
          status: "pending",
          reviewerNotes: null,
          reviewedAt: null,
          createdAt: new Date("2026-04-10T00:00:00Z"),
        },
        consultationSessions: {
          email: "client@example.com",
        },
      },
    ];
    mockDb._selectMock.from = vi.fn().mockReturnThis();
    mockDb._selectMock.innerJoin = vi.fn().mockReturnThis();
    mockDb._selectMock.where = vi.fn().mockReturnThis();
    mockDb._selectMock.orderBy = vi.fn().mockResolvedValue(rows);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockDb._selectMock);
  });

  it("returns all escalations ordered by createdAt desc", async () => {
    const results = await getEscalations();

    expect(db.select).toHaveBeenCalledOnce();
    expect(mockDb._selectMock.from).toHaveBeenCalledOnce();
    expect(mockDb._selectMock.innerJoin).toHaveBeenCalledOnce();
    expect(mockDb._selectMock.orderBy).toHaveBeenCalledOnce();

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("esc-001");
    expect(results[0].sessionEmail).toBe("client@example.com");
    // complexityReasons should be parsed back to string[]
    expect(results[0].complexityReasons).toEqual(["Multiple LOA defects"]);
  });

  it("filters by status when statusFilter is provided", async () => {
    await getEscalations("pending");

    // where() should have been called with the filter
    expect(mockDb._selectMock.where).toHaveBeenCalledOnce();
  });

  it("does not call where() when no status filter is provided", async () => {
    await getEscalations();

    // where() should NOT be called when no filter
    expect(mockDb._selectMock.where).not.toHaveBeenCalled();
  });
});

describe("updateEscalationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const updatedRecord = {
      id: "esc-001",
      status: "reviewed",
      reviewedAt: new Date("2026-04-10T01:00:00Z"),
      reviewerNotes: "Reviewed and acknowledged.",
    };

    const mockWhere = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([updatedRecord]) });
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

    mockDb._mockSet = mockSet;
    mockDb._mockWhere = mockWhere;
  });

  it("changes status, sets reviewedAt, and optionally sets reviewerNotes", async () => {
    const result = await updateEscalationStatus("esc-001", "reviewed", "Reviewed and acknowledged.");

    expect(db.update).toHaveBeenCalledOnce();
    expect(mockDb._mockSet).toHaveBeenCalledOnce();

    const setArg = mockDb._mockSet.mock.calls[0][0];
    expect(setArg.status).toBe("reviewed");
    expect(setArg.reviewedAt).toBeDefined();
    expect(setArg.reviewerNotes).toBe("Reviewed and acknowledged.");

    expect(mockDb._mockWhere).toHaveBeenCalledOnce();

    expect(result).toMatchObject({
      id: "esc-001",
      status: "reviewed",
    });
  });

  it("updates status without reviewerNotes when not provided", async () => {
    await updateEscalationStatus("esc-001", "resolved");

    const setArg = mockDb._mockSet.mock.calls[0][0];
    expect(setArg.status).toBe("resolved");
    expect(setArg.reviewedAt).toBeDefined();
    // reviewerNotes should be undefined when not provided
    expect(setArg.reviewerNotes).toBeUndefined();
  });
});
