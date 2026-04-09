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

interface PaymentApprovedEmailProps {
  consultUrl: string;
  expiresAt: Date;
}

export default function PaymentApprovedEmail({
  consultUrl,
  expiresAt,
}: PaymentApprovedEmailProps) {
  const expiryFormatted = new Date(expiresAt).toLocaleString("en-PH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
            Your Consultation is Ready
          </Text>
          <Text style={{ fontSize: "14px", color: "#555555", marginBottom: "24px" }}>
            Your payment has been verified. Click the button below to start your BIR tax dispute consultation.
          </Text>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Section>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Access expires:</strong> {expiryFormatted}
            </Text>
            <Text style={{ fontSize: "13px", color: "#d97706", margin: "4px 0" }}>
              Your session is valid for 24 hours. After expiry, the conversation will be read-only.
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />
          <Button
            href={consultUrl}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Consultation
          </Button>
          <Text style={{ fontSize: "12px", color: "#999999", marginTop: "24px" }}>
            TaxSpecialista Consult — This link is unique to your consultation. Do not share it.
          </Text>
          <Text style={{ fontSize: "11px", color: "#bbbbbb", marginTop: "8px" }}>
            Disclaimer: This consultation provides AI-assisted guidance based on Philippine tax law. It is not formal legal or tax advice. For complex matters, consult a licensed CPA or tax attorney.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
