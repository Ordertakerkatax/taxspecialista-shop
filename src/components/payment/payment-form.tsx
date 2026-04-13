"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";
import { submitPaymentProof, type SubmitPaymentState } from "@/app/pay/submit/actions";
import type { TierKey } from "@/lib/constants";

interface PaymentFormProps {
  tier: TierKey;
  amount: number;
}

const initialState: SubmitPaymentState = {
  success: false,
};

export function PaymentForm({ tier, amount }: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(submitPaymentProof, initialState);
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "bank_transfer">("gcash");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="tier" value={tier} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <input type="hidden" name="screenshotUrl" value={screenshotUrl} />

      {/* Payment method tabs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complete Your Payment
        </h3>
        <Tabs
          defaultValue="gcash"
          onValueChange={(value) =>
            setPaymentMethod(value as "gcash" | "bank_transfer")
          }
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="gcash" className="flex-1">
              GCash
            </TabsTrigger>
            <TabsTrigger value="bank_transfer" className="flex-1">
              Bank Transfer
            </TabsTrigger>
          </TabsList>

          {/* GCash tab */}
          <TabsContent value="gcash">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Scan the QR code below or send payment to the GCash number shown. After paying, return here and submit your reference number.
              </p>
              <div className="flex justify-center">
                <div className="w-full max-w-sm h-96 relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <Image
                    src="/assets/gcash-qr.jpg"
                    alt="GCash QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">GCash Number</span>
                  <span className="font-medium text-gray-900 font-mono">
                    0977-857-XXXX
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount to send</span>
                  <span className="font-semibold text-teal-600">
                    PHP {amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Bank Transfer tab */}
          <TabsContent value="bank_transfer">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Scan the QR code below or transfer the exact amount to the BPI account shown. After transferring, return here and submit your reference number.
              </p>
              <div className="flex justify-center">
                <div className="w-full max-w-sm h-96 relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <Image
                    src="/assets/bpi-qr.png"
                    alt="BPI QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-medium text-gray-900">BPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-medium text-gray-900">Emelson Maestro (TaxSpecial)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-medium text-gray-900 font-mono">
                    2929020785
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount to transfer</span>
                  <span className="font-semibold text-teal-600">
                    PHP {amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Submission form */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <h4 className="text-base font-semibold text-gray-900">
          Submit Payment Proof
        </h4>

        {/* Reference number */}
        <div className="space-y-1.5">
          <Label htmlFor="referenceNumber" className="text-sm font-semibold text-gray-700">
            Payment Reference Number
          </Label>
          <Input
            id="referenceNumber"
            name="referenceNumber"
            type="text"
            required
            placeholder="e.g., 1234567890"
            aria-describedby={
              state.errors?.referenceNumber ? "referenceNumber-error" : undefined
            }
            className={
              state.errors?.referenceNumber ? "border-red-500" : ""
            }
          />
          {state.errors?.referenceNumber && (
            <p
              id="referenceNumber-error"
              className="text-xs text-red-500"
            >
              {state.errors.referenceNumber[0]}
            </p>
          )}
        </div>

        {/* Screenshot upload */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">
            Upload Payment Screenshot (optional)
          </Label>
          <UploadDropzone
            endpoint="paymentScreenshot"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.ufsUrl) {
                setScreenshotUrl(res[0].ufsUrl);
              }
            }}
            onUploadError={() => {
              // Non-blocking: user can proceed without screenshot
            }}
            appearance={{
              container: "border border-gray-200 rounded-lg bg-gray-50 p-4",
              label: "text-sm text-gray-500",
              uploadIcon: "text-gray-400",
              button: "bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700",
            }}
          />
          {screenshotUrl && (
            <p className="text-xs text-green-600">Screenshot uploaded successfully.</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Your Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            aria-describedby="email-helper email-error"
            className={state.errors?.email ? "border-red-500" : ""}
          />
          <p id="email-helper" className="text-xs text-gray-500">
            We will send your consultation link to this email once payment is verified.
          </p>
          {state.errors?.email && (
            <p id="email-error" className="text-xs text-red-500">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        {/* General error */}
        {state.errors && Object.keys(state.errors).length > 0 && (
          <p className="text-sm text-red-500">
            Please check the highlighted fields and try again.
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Payment Proof"}
        </button>
      </div>
    </form>
  );
}
