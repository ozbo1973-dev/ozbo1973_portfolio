import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your client portal.",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/portal");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className={cn(
          "w-full max-w-md",
          "p-8 lg:p-12",
          "bg-card",
          "border border-primary/20 border-t-[3px] border-t-primary",
          "flex flex-col gap-6"
        )}
      >
        <div className="space-y-2">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-bold",
              "font-[family-name:var(--font-playfair)]",
              "text-primary"
            )}
          >
            Sign In
          </h1>
          <p className="text-muted-foreground text-sm font-['Mulish']">
            Enter your email to receive a sign-in link.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
