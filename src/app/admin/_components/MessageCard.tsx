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
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface MessageCardProps {
  submission: AdminSubmissionRecord;
  onArchive?: (submission: AdminSubmissionRecord) => void;
  onDelete?: (submission: AdminSubmissionRecord) => void;
  onViewThread?: (submission: AdminSubmissionRecord) => void;
}

export default function MessageCard({ submission, onArchive, onDelete, onViewThread }: MessageCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleConfirmDelete() {
    if (!onDelete) return;
    onDelete(submission);
    setDeleteOpen(false);
  }

  return (
    <li className="p-6 bg-card border border-primary/20 border-t-[3px] border-t-primary">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground font-['Mulish']">
              {submission.sender.name}
            </span>
            <span className="text-xs text-muted-foreground font-['Mulish']">
              {submission.sender.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {submission.replyCount > 0 && (
              <span className="text-xs text-muted-foreground font-['Mulish']">
                {submission.replyCount} {submission.replyCount === 1 ? "reply" : "replies"}
              </span>
            )}
            <time
              dateTime={submission.createdAt.toISOString()}
              className="text-xs text-muted-foreground font-['Mulish']"
            >
              {submission.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {onViewThread && (
              <Button
                variant="outline"
                size="sm"
                aria-label="View thread"
                onClick={() => onViewThread(submission)}
              >
                View Thread
              </Button>
            )}
            {onArchive && (
              <Button
                variant="outline"
                size="sm"
                aria-label="Archive submission"
                onClick={() => onArchive(submission)}
              >
                Archive
              </Button>
            )}
            {onDelete && (
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
            )}
          </div>
        </div>
        <p className="text-sm text-foreground font-['Mulish'] leading-relaxed">
          {submission.description}
        </p>
      </div>
    </li>
  );
}
