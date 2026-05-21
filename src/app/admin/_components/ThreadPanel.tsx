"use client";

import { Button } from "@/components/ui/button";
import type { AdminThread } from "@/lib/dal/admin";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface ThreadPanelProps {
  thread: AdminThread;
  adminUserId: string;
  onClose: () => void;
}

function MessageBubble({
  record,
  isAdmin,
}: {
  record: AdminSubmissionRecord;
  isAdmin: boolean;
}) {
  return (
    <li
      className={`p-4 border rounded-sm ${
        isAdmin
          ? "bg-primary/5 border-primary/30 ml-4"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground font-['Mulish']">
            {record.sender.name}
          </span>
          {isAdmin && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-['Mulish']">
              Admin
            </span>
          )}
        </div>
        <time
          dateTime={record.createdAt.toISOString()}
          className="text-xs text-muted-foreground font-['Mulish']"
        >
          {record.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <p className="text-sm text-foreground font-['Mulish'] leading-relaxed">
        {record.description}
      </p>
    </li>
  );
}

export default function ThreadPanel({ thread, adminUserId, onClose }: ThreadPanelProps) {
  const allMessages = [thread.root, ...thread.replies];

  return (
    <div className="mt-8 border border-primary/20 border-t-[3px] border-t-primary p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-playfair)] text-primary">
          Thread
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <ul className="space-y-3" aria-label="Thread messages">
        {allMessages.map((record) => (
          <MessageBubble
            key={record.id}
            record={record}
            isAdmin={record.userId === adminUserId}
          />
        ))}
      </ul>
    </div>
  );
}
