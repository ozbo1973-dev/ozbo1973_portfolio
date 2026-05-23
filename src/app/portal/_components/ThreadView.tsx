"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UserThread, UserThreadRecord } from "@/lib/dal/prospects";
import { createUserReplyAction } from "@/app/actions/createUserReply";

interface ThreadViewProps {
  thread: UserThread;
  currentUserId: string;
  isArchived?: boolean;
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
      className={cn(
        "p-4 border rounded-sm",
        isCurrentUser ? "bg-card border-border" : "bg-primary/5 border-primary/30 ml-4",
      )}
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

export default function ThreadView({ thread, currentUserId, isArchived = false }: ThreadViewProps) {
  const [optimisticReplies, setOptimisticReplies] = useState<UserThreadRecord[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allMessages = [thread.root, ...thread.replies, ...optimisticReplies];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const optimistic: UserThreadRecord = {
      id: `optimistic-${Date.now()}`,
      userId: currentUserId,
      description: trimmed,
      createdAt: new Date(),
    };

    setOptimisticReplies((prev) => [...prev, optimistic]);
    setBody("");
    setError(null);

    startTransition(async () => {
      const result = await createUserReplyAction(thread.root.id, trimmed);
      if (!result.success) {
        setOptimisticReplies((prev) => prev.filter((r) => r.id !== optimistic.id));
        setBody(trimmed);
        setError(result.error);
        textareaRef.current?.focus();
      }
    });
  }

  return (
    <div className="flex flex-col h-full p-6">
      <ul className="flex-1 overflow-y-auto space-y-3" aria-label="Thread messages">
        {allMessages.map((record) => (
          <MessageBubble
            key={record.id}
            record={record}
            isCurrentUser={record.userId === currentUserId}
          />
        ))}
      </ul>
      {!isArchived && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 shrink-0">
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply…"
            rows={3}
            disabled={isPending}
            aria-label="Reply body"
            className="font-['Mulish']"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive font-['Mulish']">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending || !body.trim()}>
              {isPending ? "Sending…" : "Send Reply"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
