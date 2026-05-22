"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ThreadCard from "./ThreadCard";
import NewRequestForm from "./NewRequestForm";
import type { ProspectRecord } from "@/lib/dal/index";
import type { UserThread } from "@/lib/dal/prospects";

interface PortalContentProps {
  initialThreads: UserThread[];
  currentUserId: string;
}

export default function PortalContent({ initialThreads, currentUserId }: PortalContentProps) {
  const [threads, setThreads] = useState<UserThread[]>(initialThreads);

  function handleNewSubmission(submission: ProspectRecord) {
    const newThread: UserThread = {
      root: {
        id: submission.id,
        userId: submission.userId,
        description: submission.description,
        createdAt: submission.createdAt,
      },
      replies: [],
      latestActivity: submission.createdAt,
    };
    setThreads((prev) => [newThread, ...prev]);
  }

  function handleThreadDeleted(rootId: string) {
    setThreads((prev) => prev.filter((t) => t.root.id !== rootId));
  }

  return (
    <>
      <section aria-label="New request" className="mb-12">
        <h2
          className={cn(
            "text-xl font-semibold mb-4 font-['Mulish']",
            "text-foreground"
          )}
        >
          Submit a New Request
        </h2>
        <NewRequestForm onSubmitted={handleNewSubmission} />
      </section>

      <section aria-label="Your submissions">
        {threads.length === 0 ? (
          <p className="text-muted-foreground font-['Mulish'] text-sm">
            No submissions found. Your inquiries will appear here once you submit the contact form.
          </p>
        ) : (
          <ul className="space-y-6">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.root.id}
                thread={thread}
                currentUserId={currentUserId}
                onDeleted={handleThreadDeleted}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
