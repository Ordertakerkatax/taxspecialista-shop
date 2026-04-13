export const dynamic = "force-dynamic";

import { db } from "@/db";
import { paymentSubmissions, consultationSessions } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { PaymentTable } from "@/components/admin/payment-table";
import { EscalationSection } from "@/components/admin/escalation-section";
import { getEscalations } from "@/lib/escalation";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type ViewTab = "payments" | "escalations";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const VIEW_TABS: { label: string; value: ViewTab }[] = [
  { label: "Payments", value: "payments" },
  { label: "Escalations", value: "escalations" },
];

interface AdminPaymentsPageProps {
  searchParams: Promise<{ status?: string; view?: string }>;
}

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const resolvedParams = await searchParams;

  const rawView = resolvedParams.view;
  const viewTab: ViewTab =
    rawView === "escalations" ? "escalations" : "payments";

  const rawStatus = resolvedParams.status;
  const statusFilter: StatusFilter =
    rawStatus === "pending" || rawStatus === "approved" || rawStatus === "rejected"
      ? rawStatus
      : "all";

  const pageTitle = viewTab === "escalations" ? "Escalation Queue" : "Payment Verification";

  // Quick stats
  const [pendingPayments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(paymentSubmissions)
    .where(eq(paymentSubmissions.status, "pending"));

  const [activeSessions] = await db
    .select({ count: sql<number>`count(*)` })
    .from(consultationSessions)
    .where(gt(consultationSessions.expiresAt, new Date()));

  const [todayRevenue] = await db
    .select({ total: sql<number>`coalesce(sum(amount_php), 0)` })
    .from(paymentSubmissions)
    .where(and(
      eq(paymentSubmissions.status, "approved"),
      gt(paymentSubmissions.reviewedAt, sql`current_date`)
    ));

  const pendingEscalations = await getEscalations();
  const pendingEscCount = pendingEscalations.filter(e => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending Payments</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{pendingPayments.count}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Active Sessions</p>
          <p className="text-2xl font-semibold text-teal-600 mt-1">{activeSessions.count}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Today&apos;s Revenue</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            PHP {Number(todayRevenue.total).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending Escalations</p>
          <p className={`text-2xl font-semibold mt-1 ${pendingEscCount > 0 ? "text-red-600" : "text-gray-400"}`}>
            {pendingEscCount}
          </p>
        </div>
      </div>

      {/* Top-level view tabs */}
      <nav className="flex gap-1 border-b border-gray-300">
        {VIEW_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/payments?view=${tab.value}`}
            className={[
              "px-5 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors",
              viewTab === tab.value
                ? "border-teal-600 text-teal-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {viewTab === "escalations" ? (
        <EscalationsView />
      ) : (
        <PaymentsView statusFilter={statusFilter} />
      )}
    </div>
  );
}

async function EscalationsView() {
  const escalations = await getEscalations();
  return <EscalationSection escalations={escalations} />;
}

async function PaymentsView({ statusFilter }: { statusFilter: StatusFilter }) {
  const payments = await db
    .select()
    .from(paymentSubmissions)
    .where(
      statusFilter !== "all"
        ? eq(paymentSubmissions.status, statusFilter)
        : undefined
    )
    .orderBy(desc(paymentSubmissions.createdAt));

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <nav className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/payments?view=payments&status=${tab.value}`}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors",
              statusFilter === tab.value
                ? "border-teal-600 text-teal-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <PaymentTable payments={payments} />
    </div>
  );
}
