import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSubmissionsByUserId } from "@/lib/dal";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "View your submitted inquiries.",
};

export default async function PortalPage() {
  const h = await headers();
  const sessionData = await auth.api.getSession({ headers: h });

  if (!sessionData?.user) {
    redirect("/");
  }

  const submissions = await getSubmissionsByUserId(sessionData.user.id);

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
              <li
                key={sub.id}
                className={cn(
                  "p-6",
                  "bg-card border border-primary/20 border-t-[3px] border-t-primary"
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="font-semibold text-foreground font-['Mulish']">
                      {sub.firstName} {sub.lastName}
                    </span>
                    <time
                      dateTime={sub.createdAt.toISOString()}
                      className="text-xs text-muted-foreground font-['Mulish']"
                    >
                      {sub.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground font-['Mulish']">{sub.email}</p>
                  <p className="text-sm text-foreground font-['Mulish'] leading-relaxed">
                    {sub.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
