"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ThreadCard from "./ThreadCard";
import NewRequestForm from "./NewRequestForm";
import type { ProspectRecord } from "@/lib/dal/index";
import type { UserThread } from "@/lib/dal/prospects";

interface PortalContentProps {
  initialThreads: UserThread[];
  initialArchivedThreads: UserThread[];
  currentUserId: string;
}

export default function PortalContent({ initialThreads, initialArchivedThreads, currentUserId }: PortalContentProps) {
  const [threads, setThreads] = useState<UserThread[]>(initialThreads);
  const [archived, setArchived] = useState<UserThread[]>(initialArchivedThreads);

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

  function handleThreadArchived(rootId: string) {
    const thread = threads.find((t) => t.root.id === rootId);
    setThreads((prev) => prev.filter((t) => t.root.id !== rootId));
    if (thread) {
      setArchived((prev) => [thread, ...prev]);
    }
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

      <section aria-label="Your submissions" className="mb-12">
        <h2
          className={cn(
            "text-xl font-semibold mb-4 font-['Mulish']",
            "text-foreground"
          )}
        >
          Your Submissions
        </h2>
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
                onArchived={handleThreadArchived}
              />
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 && (
        <section aria-label="Archived submissions">
          <h2
            className={cn(
              "text-xl font-semibold mb-4 font-['Mulish']",
              "text-muted-foreground"
            )}
          >
            Archived
          </h2>
          <ul className="space-y-6">
            {archived.map((thread) => (
              <ThreadCard
                key={thread.root.id}
                thread={thread}
                currentUserId={currentUserId}
                onDeleted={() => setArchived((prev) => prev.filter((t) => t.root.id !== thread.root.id))}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
