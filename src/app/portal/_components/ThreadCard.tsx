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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ThreadView from "./ThreadView";
import { deleteSubmissionAction } from "@/app/actions/deleteSubmission";
import { archiveSubmissionAction } from "@/app/actions/archiveSubmission";
import type { UserThread } from "@/lib/dal/prospects";

interface ThreadCardProps {
  thread: UserThread;
  currentUserId: string;
  onDeleted: (rootId: string) => void;
  onArchived?: (rootId: string) => void;
}

export default function ThreadCard({ thread, currentUserId, onDeleted, onArchived }: ThreadCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasAdminReplies = thread.replies.some((r) => r.userId !== currentUserId);
  const isArchived = !onArchived;

  async function handleConfirmDelete() {
    const result = await deleteSubmissionAction(thread.root.id);
    if (result.success) {
      onDeleted(thread.root.id);
      setDeleteOpen(false);
    }
  }

  async function handleConfirmArchive() {
    const result = await archiveSubmissionAction(thread.root.id);
    if (result.success) {
      onArchived?.(thread.root.id);
      setArchiveOpen(false);
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="View thread"
            onClick={() => setSheetOpen(true)}
            className="gap-2"
          >
            View Thread
            {thread.replies.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 font-['Mulish'] leading-none">
                {thread.replies.length}
              </span>
            )}
          </Button>

          {!isArchived && hasAdminReplies && (
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Archive submission">
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent role="alertdialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive submission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move this submission and its replies to your archive.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmArchive}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!hasAdminReplies && (
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

      <p className="text-sm text-foreground font-['Mulish'] leading-relaxed truncate">
        {thread.root.description}
      </p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-[family-name:var(--font-playfair)] text-primary">
              Thread
            </SheetTitle>
          </SheetHeader>
          <ThreadView thread={thread} currentUserId={currentUserId} isArchived={isArchived} />
        </SheetContent>
      </Sheet>
    </li>
  );
}
