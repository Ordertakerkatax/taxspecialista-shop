export const dynamic = "force-dynamic";

import { db } from "@/db";
import { paymentSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { PaymentTable } from "@/components/admin/payment-table";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface AdminPaymentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const resolvedParams = await searchParams;
  const rawStatus = resolvedParams.status;
  const statusFilter: StatusFilter =
    rawStatus === "pending" || rawStatus === "approved" || rawStatus === "rejected"
      ? rawStatus
      : "all";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Payment Verification
      </h1>

      {/* Filter tabs */}
      <nav className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/payments?status=${tab.value}`}
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
