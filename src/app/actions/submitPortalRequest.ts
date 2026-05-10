"use server";

import { z } from "zod";
import { verifySession } from "@/lib/dal/prospects";
import { createProspect } from "@/lib/dal/index";
import type { ProspectRecord } from "@/lib/dal/index";

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

function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  };
}

export async function submitPortalRequest(
  input: SubmitPortalRequestInput
): Promise<SubmitPortalRequestResult> {
  const { userId, email, name } = await verifySession();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "unknown";
      fieldErrors[key] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const { firstName, lastName } = splitName(name || email);

  try {
    const submission = await createProspect({
      firstName,
      lastName,
      email,
      description: parsed.data.description,
      userId,
      ...(parsed.data.parentId ? { parentId: parsed.data.parentId } : {}),
    });

    return { success: true, submission };
  } catch (err) {
    console.error("[submitPortalRequest]", err);
    return { success: false, error: "An error occurred while submitting. Please try again." };
  }
}
