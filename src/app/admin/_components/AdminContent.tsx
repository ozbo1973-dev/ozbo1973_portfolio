"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";
import ThreadPanel from "./ThreadPanel";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";
import type { AdminThread } from "@/lib/dal/admin";
import { archiveSubmissionAction } from "@/app/actions/admin/archiveSubmission";
import { adminDeleteSubmissionAction } from "@/app/actions/admin/deleteSubmission";
import { getThreadAction } from "@/app/actions/admin/getThread";

type Tab = "inbox" | "archive";

interface AdminContentProps {
  initialInbox: AdminSubmissionRecord[];
  initialArchived: AdminSubmissionRecord[];
  adminUserId: string;
}

export default function AdminContent({ initialInbox, initialArchived, adminUserId }: AdminContentProps) {
  const [tab, setTab] = useState<Tab>("inbox");
  const [inbox, setInbox] = useState<AdminSubmissionRecord[]>(initialInbox);
  const [archived, setArchived] = useState<AdminSubmissionRecord[]>(initialArchived);
  const [activeThread, setActiveThread] = useState<AdminThread | null>(null);

  async function handleDelete(submission: AdminSubmissionRecord) {
    setInbox((prev) => prev.filter((s) => s.id !== submission.id));
    setArchived((prev) => prev.filter((s) => s.id !== submission.id));

    const result = await adminDeleteSubmissionAction(submission.id);
    if (result.success) {
      toast.success("Submission deleted.");
    } else {
      if (submission.archivedAt) {
        setArchived((prev) => [submission, ...prev]);
      } else {
        setInbox((prev) => [submission, ...prev]);
      }
      toast.error("Failed to delete submission.");
    }
  }

  async function handleViewThread(submission: AdminSubmissionRecord) {
    const result = await getThreadAction(submission.id);
    if (result.success) {
      setActiveThread(result.thread);
    } else {
      toast.error("Failed to load thread.");
    }
  }

  async function handleArchive(submission: AdminSubmissionRecord) {
    const optimisticArchivedAt = new Date();
    setInbox((prev) => prev.filter((s) => s.id !== submission.id));
    setArchived((prev) => [{ ...submission, archivedAt: optimisticArchivedAt }, ...prev]);

    const result = await archiveSubmissionAction(submission.id);
    if (result.success) {
      toast.success("Submission archived.");
    } else {
      setInbox((prev) => [submission, ...prev]);
      setArchived((prev) => prev.filter((s) => s.id !== submission.id));
      toast.error("Failed to archive submission.");
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-8" role="tablist" aria-label="Admin tabs">
        <Button
          role="tab"
          aria-selected={tab === "inbox"}
          variant={tab === "inbox" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("inbox")}
        >
          Inbox
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "archive"}
          variant={tab === "archive" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("archive")}
        >
          Archive
        </Button>
      </div>

      {tab === "inbox" && (
        <section aria-label="Inbox">
          <MessageList
            submissions={inbox}
            emptyMessage="No submissions in your inbox."
            onArchive={handleArchive}
            onDelete={handleDelete}
            onViewThread={handleViewThread}
          />
        </section>
      )}

      {tab === "archive" && (
        <section aria-label="Archive">
          <MessageList
            submissions={archived}
            emptyMessage="No archived submissions."
            onDelete={handleDelete}
            onViewThread={handleViewThread}
          />
        </section>
      )}

      {activeThread && (
        <ThreadPanel
          thread={activeThread}
          adminUserId={adminUserId}
          onClose={() => setActiveThread(null)}
        />
      )}
    </div>
  );
}
