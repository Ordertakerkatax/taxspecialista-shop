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

interface PaymentReceivedEmailProps {
  submission: {
    id: string;
    email: string;
    tier: string;
    referenceNumber: string;
    amountPhp: number;
  };
  adminUrl: string;
}

export default function PaymentReceivedEmail({
  submission,
  adminUrl,
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
            New Payment Submission
          </Text>
          <Text style={{ fontSize: "14px", color: "#555555", marginBottom: "24px" }}>
            A new payment proof has been submitted and is awaiting your review.
          </Text>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Section>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Submission ID:</strong> {submission.id}
            </Text>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Email:</strong> {submission.email}
            </Text>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Tier:</strong> {submission.tier}
            </Text>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Reference Number:</strong> {submission.referenceNumber}
            </Text>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Amount:</strong> PHP {submission.amountPhp.toLocaleString()}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Button
            href={adminUrl}
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
            Review in Admin Dashboard
          </Button>
          <Text style={{ fontSize: "12px", color: "#999999", marginTop: "24px" }}>
            TaxSpecialista Consult — This is an automated notification.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
