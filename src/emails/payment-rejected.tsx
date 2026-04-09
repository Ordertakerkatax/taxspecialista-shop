import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Section,
  Hr,
} from "@react-email/components";

interface PaymentRejectedEmailProps {
  reason: string;
  payUrl: string;
}

export default function PaymentRejectedEmail({
  reason,
  payUrl,
}: PaymentRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
            Payment Verification Update
          </Text>
          <Text style={{ fontSize: "14px", color: "#555555", marginBottom: "24px" }}>
            We were unable to verify your payment submission. Please review the details below and resubmit.
          </Text>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Section>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Reason:</strong> {reason}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Text style={{ fontSize: "14px", color: "#555555", marginBottom: "16px" }}>
            Please ensure you are submitting the correct reference number and payment amount. If you believe this is an error, please resubmit with a clear screenshot of your payment confirmation.
          </Text>
          <Button
            href={payUrl}
            style={{
              backgroundColor: "#0070f3",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Resubmit Payment
          </Button>
          <Text style={{ fontSize: "12px", color: "#999999", marginTop: "24px" }}>
            TaxSpecialista Consult — If you continue to have issues, please contact us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
