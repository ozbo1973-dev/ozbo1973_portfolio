"use client";

import { cn } from "@/lib/utils";
import MessageList from "./MessageList";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface AdminContentProps {
  submissions: AdminSubmissionRecord[];
}

export default function AdminContent({ submissions }: AdminContentProps) {
  return (
    <section aria-label="Inbox">
      <h2
        className={cn(
          "text-xl font-semibold mb-6 font-['Mulish']",
          "text-foreground"
        )}
      >
        Inbox
      </h2>
      <MessageList submissions={submissions} />
    </section>
  );
}
