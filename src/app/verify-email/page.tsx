import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Your Email",
  description: "A magic link has been sent to your email address.",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className={cn(
          "w-full max-w-md",
          "p-8 lg:p-12",
          "bg-card",
          "border border-primary/20 border-t-[3px] border-t-primary",
          "flex flex-col items-center gap-6 text-center"
        )}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30">
          <Mail className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>

        <div className="space-y-3">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-bold",
              "font-[family-name:var(--font-playfair)]",
              "text-primary"
            )}
          >
            Check Your Email
          </h1>
          <p className="text-muted-foreground text-base font-['Mulish'] leading-relaxed">
            A magic link has been sent to your inbox. Click the link in the
            email to confirm your message and we&apos;ll be in touch soon.
          </p>
        </div>

        <p className="text-sm text-muted-foreground font-['Mulish']">
          Didn&apos;t receive it? Check your spam folder or reach out directly.
        </p>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full mt-2 h-12 rounded-2xl text-base font-semibold font-['Mulish']"
          )}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
