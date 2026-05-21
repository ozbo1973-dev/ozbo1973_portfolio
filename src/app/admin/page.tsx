import { verifyAdminSession, getInbox, getArchived } from "@/lib/dal/admin";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import AdminContent from "./_components/AdminContent";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const adminSession = await verifyAdminSession();
  const [inbox, archived] = await Promise.all([getInbox(), getArchived()]);

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
          Admin Console
        </h1>
        <p className="text-muted-foreground font-['Mulish'] mb-10">
          Manage incoming submissions.
        </p>

        <AdminContent initialInbox={inbox} initialArchived={archived} adminUserId={adminSession.userId} />
      </div>
    </div>
  );
}
