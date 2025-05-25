import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  lastName,
  email,
  description,
}) => (
  <div>
    <h1>New Contact Form Submission</h1>
    <p>You have received a new contact form submission:</p>

    <div
      style={{ margin: "20px 0", padding: "20px", border: "1px solid #ddd" }}
    >
      <h2>Contact Details:</h2>
      <p>
        <strong>Name:</strong> {firstName} {lastName}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>

      <h2>Project Description:</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>
    </div>

    <p>Please respond to this inquiry as soon as possible.</p>
  </div>
);
