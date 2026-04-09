"use client";

import { useState, useTransition, useOptimistic } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RejectDialog } from "@/components/admin/reject-dialog";
import { approvePayment } from "@/app/admin/payments/actions";
import type { paymentSubmissions } from "@/db/schema";

type PaymentSubmission = typeof paymentSubmissions.$inferSelect;

interface PaymentTableProps {
  payments: PaymentSubmission[];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: PaymentSubmission["status"] }) {
  if (status === "pending") {
    return (
      <Badge
        className="bg-amber-100 text-amber-800 border-amber-200"
        aria-label="Status: Pending"
      >
        Pending
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge
        className="bg-green-100 text-green-800 border-green-200"
        aria-label="Status: Approved"
      >
        Approved
      </Badge>
    );
  }
  return (
    <Badge
      className="bg-red-100 text-red-800 border-red-200"
      aria-label="Status: Rejected"
    >
      Rejected
    </Badge>
  );
}

function TierBadge({ tier }: { tier: PaymentSubmission["tier"] }) {
  return (
    <Badge variant="outline" className="capitalize">
      {tier === "basic" ? "Basic" : "Comprehensive"}
    </Badge>
  );
}

function MethodBadge({ method }: { method: PaymentSubmission["paymentMethod"] }) {
  return (
    <Badge variant="outline" className="capitalize">
      {method === "gcash" ? "GCash" : "Bank Transfer"}
    </Badge>
  );
}

interface PaymentRowProps {
  payment: PaymentSubmission;
  optimisticStatus?: PaymentSubmission["status"];
}

function PaymentRow({ payment, optimisticStatus }: PaymentRowProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const status = optimisticStatus ?? payment.status;

  function handleApprove() {
    startTransition(async () => {
      await approvePayment(payment.id);
    });
  }

  return (
    <>
      <TableRow>
        <TableCell className="text-sm text-gray-600">
          {formatDate(payment.createdAt)}
        </TableCell>
        <TableCell className="text-sm">{payment.email}</TableCell>
        <TableCell>
          <TierBadge tier={payment.tier} />
        </TableCell>
        <TableCell>
          <MethodBadge method={payment.paymentMethod} />
        </TableCell>
        <TableCell className="font-mono text-sm">{payment.referenceNumber}</TableCell>
        <TableCell className="text-sm font-medium">
          {formatAmount(payment.amountPhp)}
        </TableCell>
        <TableCell>
          {payment.screenshotUrl ? (
            <a
              href={payment.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline text-sm"
            >
              View
            </a>
          ) : (
            <span className="text-gray-400 text-sm">N/A</span>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge status={status} />
        </TableCell>
        <TableCell>
          {status === "pending" && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white min-h-[44px]"
                onClick={handleApprove}
                disabled={isPending}
                aria-label={`Approve payment from ${payment.email}`}
              >
                {isPending ? "Approving..." : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 min-h-[44px]"
                onClick={() => setRejectOpen(true)}
                disabled={isPending}
                aria-label={`Reject payment from ${payment.email}`}
              >
                Reject
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      <RejectDialog
        paymentId={payment.id}
        email={payment.email}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </>
  );
}

// Card layout for mobile
function PaymentCard({ payment }: { payment: PaymentSubmission }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approvePayment(payment.id);
    });
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{payment.email}</p>
          <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="flex items-center gap-2">
        <TierBadge tier={payment.tier} />
        <MethodBadge method={payment.paymentMethod} />
      </div>

      <div className="text-sm">
        <span className="text-gray-500">Ref:</span>{" "}
        <span className="font-mono">{payment.referenceNumber}</span>
      </div>

      <div className="text-sm font-medium">{formatAmount(payment.amountPhp)}</div>

      {payment.screenshotUrl && (
        <a
          href={payment.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline text-sm"
        >
          View Screenshot
        </a>
      )}

      {payment.status === "pending" && (
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white min-h-[44px] flex-1"
            onClick={handleApprove}
            disabled={isPending}
            aria-label={`Approve payment from ${payment.email}`}
          >
            {isPending ? "Approving..." : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 min-h-[44px] flex-1"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
            aria-label={`Reject payment from ${payment.email}`}
          >
            Reject
          </Button>
        </div>
      )}

      <RejectDialog
        paymentId={payment.id}
        email={payment.email}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </div>
  );
}

export function PaymentTable({ payments }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Pending Payments
        </h3>
        <p className="text-gray-500">
          All payment submissions have been reviewed. New submissions will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Email</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Tier</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Method</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Reference #</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Screenshot</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-4">
        {payments.map((payment) => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
      </div>
    </>
  );
}
