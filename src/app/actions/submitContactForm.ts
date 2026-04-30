"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getClientIP } from "@/lib/utils";
import { runSecurityGuard, recordGuardRejection } from "@/lib/contact/guard";
import { createProspect } from "@/lib/dal";
import { sendNotifications } from "@/lib/contact/sendNotifications";

const submissionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(1, "Project description is required"),
  company: z.string().optional(),
});

const prospectSchema = submissionSchema.omit({ company: true });

export type ContactFormData = z.infer<typeof submissionSchema>;
type ProspectData = z.infer<typeof prospectSchema>;

export interface ActionResult {
  success: boolean;
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

  const prospectData: ProspectData = prospectSchema.parse(parsed.data);

  try {
    const prospect = await createProspect(prospectData);
    await sendNotifications(prospect);
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "An error occurred while submitting. Please try again." };
  }
}
