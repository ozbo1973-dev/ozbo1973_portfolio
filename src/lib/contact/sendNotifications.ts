import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { CustomerConfirmationEmail } from "@/components/customer-confirmation-email";
import { MagicLinkEmail } from "@/components/magic-link-email";
import { ReplyNotificationEmail } from "@/components/reply-notification-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactNotificationData {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
}

export async function sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<void> {
  const from = process.env.NOTIFICATION_EMAIL!;
  try {
    await resend.emails.send({
      from: `Brady Bovero <${from}>`,
      to: email,
      subject: "Your sign-in link",
      react: await MagicLinkEmail({ magicLinkUrl }),
    });
  } catch (emailError) {
    console.error("Failed to send magic link email:", emailError);
  }
}

export interface ReplyNotificationData {
  to: string;
  senderName: string;
  replyBody: string;
  magicLinkUrl?: string;
}

export async function sendReplyNotification(data: ReplyNotificationData): Promise<void> {
  const from = process.env.NOTIFICATION_EMAIL!;
  const { to, senderName, replyBody, magicLinkUrl } = data;
  try {
    await resend.emails.send({
      from: `Brady Bovero <${from}>`,
      to,
      subject: `New reply from ${senderName}`,
      react: ReplyNotificationEmail({ senderName, replyBody, magicLinkUrl }),
    });
  } catch (emailError) {
    console.error("Failed to send reply notification:", emailError);
  }
}

export async function sendNotifications(data: ContactNotificationData, magicLinkUrl?: string): Promise<void> {
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
      react: await CustomerConfirmationEmail({ firstName, lastName, magicLinkUrl }),
    });
  } catch (emailError) {
    console.error("Failed to send email notification:", emailError);
  }
}
