"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import SubmissionCard from "./SubmissionCard";
import NewRequestForm from "./NewRequestForm";
import type { ProspectRecord } from "@/lib/dal/index";

interface PortalContentProps {
  initialSubmissions: ProspectRecord[];
}

export default function PortalContent({ initialSubmissions }: PortalContentProps) {
  const [submissions, setSubmissions] = useState<ProspectRecord[]>(initialSubmissions);

  function handleNewSubmission(submission: ProspectRecord) {
    setSubmissions((prev) => [submission, ...prev]);
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
        {submissions.length === 0 ? (
          <p className="text-muted-foreground font-['Mulish'] text-sm">
            No submissions found. Your inquiries will appear here once you submit the contact form.
          </p>
        ) : (
          <ul className="space-y-6">
            {submissions.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
