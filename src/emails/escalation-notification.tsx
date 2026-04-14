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

interface EscalationNotificationEmailProps {
  summary: string;
  reasons: string[];
  severity: "medium" | "high";
  sessionEmail: string;
  adminUrl: string;
}

export default function EscalationNotificationEmail({
  summary,
  reasons,
  severity,
  sessionEmail,
  adminUrl,
}: EscalationNotificationEmailProps) {
  const severityBadgeStyle =
    severity === "high"
      ? {
          display: "inline-block",
          backgroundColor: "#dc2626",
          color: "#ffffff",
          padding: "4px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
        }
      : {
          display: "inline-block",
          backgroundColor: "#d97706",
          color: "#ffffff",
          padding: "4px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
        };

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "sans-serif" }}>
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
          }}
        >
          <Text
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Case Escalation Alert
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#555555",
              marginBottom: "16px",
            }}
          >
            A consultation has been flagged for tax professional review.
          </Text>

          <Section style={{ marginBottom: "16px" }}>
            <span style={severityBadgeStyle}>
              {severity === "high" ? "High Severity" : "Medium Severity"}
            </span>
          </Section>

          <Hr style={{ borderColor: "#e0e0e0", margin: "16px 0" }} />

          <Section>
            <Text style={{ fontSize: "13px", color: "#555555", margin: "4px 0" }}>
              <strong>Client Email:</strong> {sessionEmail}
            </Text>
          </Section>

          <Section style={{ marginTop: "16px" }}>
            <Text
              style={{ fontSize: "13px", fontWeight: "600", color: "#333333", marginBottom: "4px" }}
            >
              Case Summary
            </Text>
            <Text style={{ fontSize: "13px", color: "#555555", lineHeight: "1.6" }}>
              {summary}
            </Text>
          </Section>

          <Section style={{ marginTop: "16px" }}>
            <Text
              style={{ fontSize: "13px", fontWeight: "600", color: "#333333", marginBottom: "8px" }}
            >
              Complexity Factors
            </Text>
            {reasons.map((reason, index) => (
              <Text
                key={index}
                style={{ fontSize: "13px", color: "#555555", margin: "4px 0", paddingLeft: "12px" }}
              >
                • {reason}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e0e0e0", margin: "24px 0 16px" }} />

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

          <Text
            style={{ fontSize: "12px", color: "#999999", marginTop: "24px" }}
          >
            TaxSpecialista Consult — This is an automated notification.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
