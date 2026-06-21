import { verifySession } from "@/lib/dal/session";
import { getThreadsByUserId, getArchivedThreadsByUserId } from "@/lib/dal/prospects";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import DeleteAccountButton from "./_components/DeleteAccountButton";
import PortalContent from "./_components/PortalContent";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "View your submitted inquiries.",
};

export default async function PortalPage() {
  const { userId, email } = await verifySession();
  const [threads, archivedThreads] = await Promise.all([
    getThreadsByUserId(),
    getArchivedThreadsByUserId(),
  ]);

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
        <p className="text-sm text-muted-foreground font-['Mulish'] mb-10">
          Signed in as: {email}
        </p>

        <PortalContent initialThreads={threads} initialArchivedThreads={archivedThreads} currentUserId={userId} />

        <div className="mt-16 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-destructive font-['Mulish'] mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground font-['Mulish'] mb-4">
            Permanently delete your account and all associated submissions.
          </p>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
