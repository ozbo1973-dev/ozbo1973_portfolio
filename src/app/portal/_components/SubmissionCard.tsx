"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
import { deleteSubmissionAction } from "@/app/actions/deleteSubmission";
import type { ProspectRecord } from "@/lib/dal/prospects";

interface SubmissionCardProps {
  submission: ProspectRecord;
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(false);

  if (deleted) return null;

  async function handleConfirm() {
    const result = await deleteSubmissionAction(submission.id);
    if (result.success) {
      setDeleted(true);
      setOpen(false);
    }
  }

  return (
    <li
      className={cn(
        "p-6",
        "bg-card border border-primary/20 border-t-[3px] border-t-primary"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
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
          <AlertDialog open={open} onOpenChange={setOpen}>
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
                <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-sm text-foreground font-['Mulish'] leading-relaxed">
          {submission.description}
        </p>
      </div>
    </li>
  );
}
