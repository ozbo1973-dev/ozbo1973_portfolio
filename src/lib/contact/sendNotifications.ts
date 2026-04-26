import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { CustomerConfirmationEmail } from "@/components/customer-confirmation-email";
import type { ProspectData } from "@/lib/dal";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotifications(data: ProspectData): Promise<void> {
  const { firstName, lastName, email, description } = data;
  const from = process.env.NOTIFICATION_EMAIL!;

  try {
    await resend.emails.send({
      from: `OzBo1973 Portfolio Contact <${from}>`,
      to: from,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      react: await EmailTemplate({ firstName, lastName, email, description }),
    });

    await resend.emails.send({
      from: `Brady Bovero <${from}>`,
      to: email,
      subject: "Thank You for Contacting Brady Bovero",
      react: await CustomerConfirmationEmail({ firstName, lastName }),
    });
  } catch (emailError) {
    console.error("Failed to send email notification:", emailError);
  }
}
