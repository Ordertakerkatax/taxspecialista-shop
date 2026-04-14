"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateEscalation } from "@/app/admin/payments/actions";

interface EscalationRecord {
  id: string;
  summary: string;
  complexityReasons: string[];
  severity: "medium" | "high";
  status: "pending" | "reviewed" | "resolved";
  sessionEmail: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewerNotes: string | null;
}

interface EscalationSectionProps {
  escalations: EscalationRecord[];
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

function SeverityBadge({ severity }: { severity: "medium" | "high" }) {
  if (severity === "high") {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200" aria-label="Severity: High">
        High
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200" aria-label="Severity: Medium">
      Medium
    </Badge>
  );
}

function StatusBadge({ status }: { status: "pending" | "reviewed" | "resolved" }) {
  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200" aria-label="Status: Pending">
        Pending
      </Badge>
    );
  }
  if (status === "reviewed") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200" aria-label="Status: Reviewed">
        Reviewed
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-800 border-green-200" aria-label="Status: Resolved">
      Resolved
    </Badge>
  );
}

function EscalationCard({ escalation }: { escalation: EscalationRecord }) {
  const [isPending, startTransition] = useTransition();
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveNotes, setResolveNotes] = useState("");

  function handleMarkReviewed() {
    startTransition(async () => {
      await updateEscalation(escalation.id, "reviewed");
    });
  }

  function handleResolve() {
    startTransition(async () => {
      await updateEscalation(escalation.id, "resolved", resolveNotes || undefined);
      setShowResolveForm(false);
      setResolveNotes("");
    });
  }

  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{escalation.sessionEmail}</p>
          <p className="text-xs text-gray-500">{formatDate(escalation.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SeverityBadge severity={escalation.severity} />
          <StatusBadge status={escalation.status} />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 leading-relaxed">{escalation.summary}</p>

      {/* Complexity reasons */}
      {escalation.complexityReasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {escalation.complexityReasons.map((reason) => (
            <Badge key={reason} variant="outline" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>
      )}

      {/* Reviewer notes (if resolved) */}
      {escalation.reviewerNotes && (
        <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Reviewer Notes</p>
          <p className="text-sm text-gray-700">{escalation.reviewerNotes}</p>
          {escalation.reviewedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Reviewed {formatDate(escalation.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {(escalation.status === "pending" || escalation.status === "reviewed") && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {escalation.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 min-h-[44px]"
                onClick={handleMarkReviewed}
                disabled={isPending}
                aria-label={`Mark escalation from ${escalation.sessionEmail} as reviewed`}
              >
                {isPending ? "Updating..." : "Mark Reviewed"}
              </Button>
            )}
            {!showResolveForm && (
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white min-h-[44px]"
                onClick={() => setShowResolveForm(true)}
                disabled={isPending}
                aria-label={`Resolve escalation from ${escalation.sessionEmail}`}
              >
                Resolve
              </Button>
            )}
          </div>

          {showResolveForm && (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Add reviewer notes (optional)..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                aria-label="Reviewer notes"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white min-h-[44px]"
                  onClick={handleResolve}
                  disabled={isPending}
                >
                  {isPending ? "Resolving..." : "Confirm Resolve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => {
                    setShowResolveForm(false);
                    setResolveNotes("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EscalationSection({ escalations }: EscalationSectionProps) {
  if (escalations.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Escalated Cases</h3>
        <p className="text-gray-500">
          Cases flagged for tax professional review will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {escalations.map((escalation) => (
        <EscalationCard key={escalation.id} escalation={escalation} />
      ))}
    </div>
  );
}
