import { verifySession, getSubmissionsByUserId } from "@/lib/dal/prospects";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import SubmissionCard from "./_components/SubmissionCard";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "View your submitted inquiries.",
};

export default async function PortalPage() {
  await verifySession();
  const submissions = await getSubmissionsByUserId();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1
          className={cn(
            "text-3xl md:text-4xl font-bold mb-2",
            "font-[family-name:var(--font-playfair)]",
            "text-primary"
          )}
        >
          Client Portal
        </h1>
        <p className="text-muted-foreground font-['Mulish'] mb-10">
          Your submitted inquiries are shown below.
        </p>

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
      </div>
    </div>
  );
}
