"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import ThreadView from "./ThreadView";
import { deleteSubmissionAction } from "@/app/actions/deleteSubmission";
import type { UserThread } from "@/lib/dal/prospects";

interface ThreadCardProps {
  thread: UserThread;
  currentUserId: string;
  onDeleted: (rootId: string) => void;
}

export default function ThreadCard({ thread, currentUserId, onDeleted }: ThreadCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleConfirmDelete() {
    const result = await deleteSubmissionAction(thread.root.id);
    if (result.success) {
      onDeleted(thread.root.id);
      setDeleteOpen(false);
    }
  }

  return (
    <li className="p-6 bg-card border border-primary/20 border-t-[3px] border-t-primary">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <time
            dateTime={thread.root.createdAt.toISOString()}
            className="text-xs text-muted-foreground font-['Mulish']"
          >
            {thread.root.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {thread.replies.length > 0 && (
            <span className="text-xs text-muted-foreground font-['Mulish']">
              {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" aria-label="Delete submission">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent role="alertdialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete submission?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this submission. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ThreadView thread={thread} currentUserId={currentUserId} />
    </li>
  );
}
