"use client";

import type { UserThread, UserThreadRecord } from "@/lib/dal/prospects";

interface ThreadViewProps {
  thread: UserThread;
  currentUserId: string;
}

function MessageBubble({
  record,
  isCurrentUser,
}: {
  record: UserThreadRecord;
  isCurrentUser: boolean;
}) {
  return (
    <li
      className={`p-4 border rounded-sm ${
        isCurrentUser
          ? "bg-card border-border"
          : "bg-primary/5 border-primary/30 ml-4"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <span className="text-xs font-semibold font-['Mulish'] text-muted-foreground">
          {isCurrentUser ? "You" : "Brady (Admin)"}
        </span>
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

export default function ThreadView({ thread, currentUserId }: ThreadViewProps) {
  const allMessages = [thread.root, ...thread.replies];

  return (
    <div className="mt-4">
      <ul className="space-y-3" aria-label="Thread messages">
        {allMessages.map((record) => (
          <MessageBubble
            key={record.id}
            record={record}
            isCurrentUser={record.userId === currentUserId}
          />
        ))}
      </ul>
    </div>
  );
}
