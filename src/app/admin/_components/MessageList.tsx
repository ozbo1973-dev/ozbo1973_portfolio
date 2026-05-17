"use client";

import MessageCard from "./MessageCard";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface MessageListProps {
  submissions: AdminSubmissionRecord[];
  emptyMessage: string;
  onArchive?: (submission: AdminSubmissionRecord) => void;
}

export default function MessageList({ submissions, emptyMessage, onArchive }: MessageListProps) {
  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground font-['Mulish'] text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {submissions.map((sub) => (
        <MessageCard key={sub.id} submission={sub} onArchive={onArchive} />
      ))}
    </ul>
  );
}
