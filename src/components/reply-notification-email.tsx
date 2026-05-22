import * as React from "react";

interface ReplyNotificationEmailProps {
  senderName: string;
  replyBody: string;
  magicLinkUrl?: string;
}

export const ReplyNotificationEmail: React.FC<Readonly<ReplyNotificationEmailProps>> = ({
  senderName,
  replyBody,
  magicLinkUrl,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", color: "#333" }}>
    <h1 style={{ color: "#2563eb" }}>New Reply from {senderName}</h1>

    <div style={{ margin: "20px 0", lineHeight: "1.5" }}>
      <p>{replyBody}</p>

      {!magicLinkUrl && (
        <p style={{ marginTop: "16px", color: "#555" }}>
          Check the Admin Console to view and respond to this reply.
        </p>
      )}

      {magicLinkUrl && (
        <div
          style={{
            margin: "24px 0",
            padding: "16px",
            background: "#f0f4ff",
            borderRadius: "8px",
            border: "1px solid #c7d7ff",
          }}
        >
          <a
            href={magicLinkUrl}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Sign In to Client Portal
          </a>
        </div>
      )}
    </div>

    <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
      <p style={{ fontSize: "14px", color: "#666" }}>Best Regards,</p>
      <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>Brady Bovero</p>
      <p style={{ fontSize: "14px", color: "#666" }}>Freelance Web Developer</p>
    </div>
  </div>
);
