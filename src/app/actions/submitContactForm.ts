"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getClientIP } from "@/lib/utils";
import { runSecurityGuard, recordGuardRejection } from "@/lib/contact/guard";
import { createProspect } from "@/lib/dal/prospects";
import { sendNotifications } from "@/lib/contact/sendNotifications";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { getUserByEmail } from "@/lib/auth/getUserIdByEmail";

const submissionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(1, "Project description is required"),
  company: z.string().optional(),
});

export type ContactFormData = z.infer<typeof submissionSchema>;

export interface ActionResult {
  success: boolean;
  redirect?: string;
  error?: string;
}

export async function submitContactForm(formData: ContactFormData): Promise<ActionResult> {
  const h = await headers();
  const ip = getClientIP(h);

  const parsed = submissionSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const guard = runSecurityGuard({
    ip,
    userAgent: h.get("user-agent") ?? "",
    referer: h.get("referer") ?? "",
    honeypot: parsed.data.company,
  });

  if (!guard.ok) {
    void recordGuardRejection(ip, guard.reason!);
    return { success: false, error: guard.error };
  }

  const { firstName, lastName, description } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const urlCapture = registerMagicLinkCapture(email);

    await auth.api.signInMagicLink({
      body: { email, callbackURL: "/portal" },
      headers: h,
    });

    const magicLinkUrl = await urlCapture;

    const user = await getUserByEmail(email);
    const prospect = await createProspect({
      userId: user!.id,
      description,
    });

    await sendNotifications({ firstName, lastName, email, description }, magicLinkUrl);

    const redirect = user?.emailVerified ? "/sign-in?sent=true" : "/verify-email";
    return { success: true, redirect };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "An error occurred while submitting. Please try again." };
  }
}
