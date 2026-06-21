"use server";

import { z } from "zod";
import { verifySession } from "@/lib/dal/session";
import { createProspect } from "@/lib/dal/prospects";
import type { ProspectRecord } from "@/lib/dal/prospects";

const schema = z.object({
  description: z.string().trim().min(1, "Project description is required"),
  parentId: z.string().optional(),
});

export interface SubmitPortalRequestInput {
  description: string;
  parentId?: string;
}

export type SubmitPortalRequestResult =
  | { success: true; submission: ProspectRecord }
  | { success: false; error?: string; fieldErrors?: Record<string, string> };

export async function submitPortalRequest(
  input: SubmitPortalRequestInput
): Promise<SubmitPortalRequestResult> {
  const { userId } = await verifySession();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "unknown";
      fieldErrors[key] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  try {
    const submission = await createProspect({
      userId,
      description: parsed.data.description,
      ...(parsed.data.parentId ? { parentId: parsed.data.parentId } : {}),
    });

    return { success: true, submission };
  } catch (err) {
    console.error("[submitPortalRequest]", err);
    return { success: false, error: "An error occurred while submitting. Please try again." };
  }
}
