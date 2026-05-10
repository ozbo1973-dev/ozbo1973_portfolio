"use client";

import { useState, startTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitPortalRequest } from "@/app/actions/submitPortalRequest";
import type { ProspectRecord } from "@/lib/dal/index";

interface NewRequestFormProps {
  onSubmitted?: (submission: ProspectRecord) => void;
}

export default function NewRequestForm({ onSubmitted }: NewRequestFormProps) {
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    if (!description.trim()) {
      setDescriptionError("Project description is required");
      return false;
    }
    setDescriptionError(null);
    return true;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const result = await submitPortalRequest({ description });

        if (!result.success) {
          if (result.fieldErrors?.description) {
            setDescriptionError(result.fieldErrors.description);
          }
          toast.error("Something went wrong. Please try again.");
          return;
        }

        toast.success("Request submitted successfully");
        setDescription("");
        setDescriptionError(null);
        onSubmitted?.(result.submission);
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-foreground font-['Mulish']"
        >
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your request..."
          rows={4}
          aria-describedby={descriptionError ? "description-error" : undefined}
        />
        {descriptionError && (
          <p
            id="description-error"
            className="text-sm text-destructive font-['Mulish']"
          >
            {descriptionError}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting || !description}>
        {isSubmitting ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
