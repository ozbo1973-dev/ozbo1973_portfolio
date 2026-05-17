"use client";

import { cn } from "@/lib/utils";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

interface MessageCardProps {
  submission: AdminSubmissionRecord;
}

export default function MessageCard({ submission }: MessageCardProps) {
  return (
    <li
      className={cn(
        "p-6",
        "bg-card border border-primary/20 border-t-[3px] border-t-primary"
      )}
    >
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
        </div>
        <p className="text-sm text-foreground font-['Mulish'] leading-relaxed">
          {submission.description}
        </p>
      </div>
    </li>
  );
}
