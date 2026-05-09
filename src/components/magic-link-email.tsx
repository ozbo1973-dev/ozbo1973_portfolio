import * as React from "react";

interface MagicLinkEmailProps {
  magicLinkUrl: string;
}

export const MagicLinkEmail: React.FC<Readonly<MagicLinkEmailProps>> = ({
  magicLinkUrl,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", color: "#333" }}>
    <h1 style={{ color: "#2563eb" }}>Your Sign-In Link</h1>

    <div style={{ margin: "20px 0", lineHeight: "1.5" }}>
      <p>Use the button below to sign in to your client portal.</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        This link is valid for 24 hours and can only be used once.
      </p>

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

      <p style={{ fontSize: "14px", color: "#666" }}>
        If you did not request this link, you can safely ignore this email.
      </p>
    </div>

    <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
      <p style={{ fontSize: "14px", color: "#666" }}>Best Regards,</p>
      <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>Brady Bovero</p>
      <p style={{ fontSize: "14px", color: "#666" }}>Freelance Web Developer</p>
    </div>
  </div>
);
