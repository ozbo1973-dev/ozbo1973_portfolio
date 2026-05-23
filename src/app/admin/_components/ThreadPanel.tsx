"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AdminThread, AdminSubmissionRecord } from "@/lib/dal/admin";
import { createAdminReplyAction } from "@/app/actions/admin/createAdminReply";

interface ThreadPanelProps {
  thread: AdminThread;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
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
      className={cn(
        "p-4 border rounded-sm",
        isAdmin ? "bg-primary/5 border-primary/30 ml-4" : "bg-card border-border",
      )}
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

export default function ThreadPanel({
  thread,
  adminUserId,
  adminName,
  adminEmail,
}: ThreadPanelProps) {
  const [optimisticReplies, setOptimisticReplies] = useState<AdminSubmissionRecord[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allMessages = [thread.root, ...thread.replies, ...optimisticReplies];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const optimistic: AdminSubmissionRecord = {
      id: `optimistic-${Date.now()}`,
      userId: adminUserId,
      description: trimmed,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
      replyCount: 0,
      sender: { name: adminName, email: adminEmail },
    };

    setOptimisticReplies((prev) => [...prev, optimistic]);
    setBody("");
    setError(null);

    startTransition(async () => {
      const result = await createAdminReplyAction(thread.root.id, trimmed);
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
            isAdmin={record.userId === adminUserId}
          />
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3 shrink-0">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…"
          rows={4}
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
          <Button type="submit" disabled={isPending || !body.trim()}>
            {isPending ? "Sending…" : "Send Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
}
