"use server";
import { z } from "zod";
import connectDB from "../db/connect";
import ProspectiveCustomer from "../models/ProspectiveCustomer";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { CustomerConfirmationEmail } from "@/components/customer-confirmation-email";

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

export async function submitProspectiveCustomer(formData: CustomerFormData) {
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
