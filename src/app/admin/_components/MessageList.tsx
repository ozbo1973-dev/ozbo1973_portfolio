"use client";

import MessageCard from "./MessageCard";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface MessageListProps {
  submissions: AdminSubmissionRecord[];
}

export default function MessageList({ submissions }: MessageListProps) {
  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground font-['Mulish'] text-sm">
        No submissions in your inbox.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {submissions.map((sub) => (
        <MessageCard key={sub.id} submission={sub} />
      ))}
    </ul>
  );
}
