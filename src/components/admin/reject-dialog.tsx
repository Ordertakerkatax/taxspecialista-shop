"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REJECTION_REASONS } from "@/lib/constants";
import { rejectPayment } from "@/app/admin/payments/actions";

interface RejectDialogProps {
  paymentId: string;
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({
  paymentId,
  email,
  open,
  onOpenChange,
}: RejectDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleReject() {
    if (!reason) return;
    startTransition(async () => {
      await rejectPayment(paymentId, reason);
      setReason("");
      onOpenChange(false);
    });
  }

  function handleCancel() {
    setReason("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this payment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this payment from {email}? The user will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={reason} onValueChange={(value) => setReason(value ?? "")}>
            <SelectTrigger aria-label="Select rejection reason">
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {REJECTION_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason || isPending}
          >
            {isPending ? "Rejecting..." : "Reject Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
