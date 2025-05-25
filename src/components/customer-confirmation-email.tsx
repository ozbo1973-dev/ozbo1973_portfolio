import * as React from "react";

interface CustomerConfirmationEmailProps {
  firstName: string;
  lastName: string;
}

export const CustomerConfirmationEmail: React.FC<
  Readonly<CustomerConfirmationEmailProps>
> = ({ firstName, lastName }) => (
  <div
    style={{ fontFamily: "Arial, sans-serif", padding: "20px", color: "#333" }}
  >
    <h1 style={{ color: "#2563eb" }}>Thank You for Contacting Brady Bovero</h1>

    <div style={{ margin: "20px 0", lineHeight: "1.5" }}>
      <p>
        Dear {firstName} {lastName},
      </p>

      <p>
        Thank you for reaching out through my portfolio website. I have received
        your message and will review it promptly.
      </p>

      <p>
        I aim to respond to all inquiries within 1-2 business days. You can
        expect to hear from me soon with a personalized response to your project
        requirements.
      </p>

      <p>
        In the meantime, if you have any urgent matters, please feel free to
        save my email address for future reference.
      </p>
    </div>

    <div
      style={{
        marginTop: "30px",
        borderTop: "1px solid #eee",
        paddingTop: "20px",
      }}
    >
      <p style={{ fontSize: "14px", color: "#666" }}>Best Regards,</p>
      <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>
        Brady Bovero
      </p>
      <p style={{ fontSize: "14px", color: "#666" }}>Freelance Web Developer</p>
    </div>
  </div>
);
