"use server";
import { z } from "zod";
import connectDB from "../db/connect";
import ProspectiveCustomer from "../models/ProspectiveCustomer";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { CustomerConfirmationEmail } from "@/components/customer-confirmation-email";
import { headers } from "next/headers";
import { blockedUserAgents } from "../config";
import { addSuspiciousIP } from "../security/suspiciousIP";
import {
  checkActionRateLimit,
  trackFailedAttempt,
  isBlacklisted,
} from "../security/rateLimit";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define validation schema
const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(1, "Project description is required"),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export async function submitProspectiveCustomer(
  formData: CustomerFormData & { company?: string }
) {
  // Server-side header checks
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const referer = headersList.get("referer") || "";
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";

  if (blockedUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
    await addSuspiciousIP(ip, "Suspicious user agent");
    return {
      success: false,
      error: "Suspicious user agent detected. Submission blocked.",
    };
  }

  // Server-side honeypot check
  if (formData.company && formData.company.trim() !== "") {
    await addSuspiciousIP(ip, "Honeypot field filled");
    return {
      success: false,
      error: "Bot detected. Submission blocked.",
    };
  }

  // Block if referer is missing or suspicious
  if (
    !referer ||
    (!referer.includes(process.env.NEXT_PUBLIC_APP_URL || "") &&
      !referer.includes("localhost"))
  ) {
    await addSuspiciousIP(ip, "Suspicious referer");
    return {
      success: false,
      error: "Suspicious referer. Submission blocked.",
    };
  }

  // Rate limiting and blacklist check
  if (isBlacklisted(ip)) {
    await addSuspiciousIP(ip, "Blacklisted IP");
    return {
      success: false,
      error: "Too many failed attempts. Try again later.",
    };
  }
  if (!checkActionRateLimit(ip)) {
    await addSuspiciousIP(ip, "Rate limit exceeded");
    trackFailedAttempt(ip);
    return {
      success: false,
      error: "Too many requests. Please wait and try again.",
    };
  }

  try {
    // Validate the input data
    const validatedData = customerSchema.parse(formData);
    // Connect to database
    await connectDB();

    // Create new prospective customer and convert to plain object
    const customerDoc = await ProspectiveCustomer.create(validatedData);
    const customer = {
      id: customerDoc._id.toString(),
      firstName: customerDoc.firstName,
      lastName: customerDoc.lastName,
      email: customerDoc.email,
      description: customerDoc.description,
      createdAt: customerDoc.createdAt,
      updatedAt: customerDoc.updatedAt,
    };

    try {
      // Send notification email to owner
      await resend.emails.send({
        from: `OzBo1973 Portfolio Contact <${process.env.NOTIFICATION_EMAIL}>`, // Update this with your verified domain
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `New Contact Form Submission from ${validatedData.firstName} ${validatedData.lastName}`,
        react: await EmailTemplate({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          description: validatedData.description,
        }),
      });

      // Send confirmation email to customer
      await resend.emails.send({
        from: `Brady Bovero <${process.env.NOTIFICATION_EMAIL}>`, // Update this with your verified domain
        to: validatedData.email,
        subject: "Thank You for Contacting Brady Bovero",
        react: await CustomerConfirmationEmail({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't return error here as the customer data was saved successfully
    }

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error submitting prospective customer:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error:
        "An error occurred while submitting your information. Please try again.",
    };
  }
}
