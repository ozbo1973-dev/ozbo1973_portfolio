"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/actions/signIn";

export function SignInForm({ initialSent = false }: { initialSent?: boolean }) {
  const [submitted, setSubmitted] = useState(initialSent);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    await signIn(email);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-center gap-4 text-center py-4",
          "text-muted-foreground font-['Mulish']"
        )}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/30">
          <Mail className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-sm leading-relaxed">
          If an account exists for that email, a sign-in link has been sent. Check your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium font-['Mulish'] text-foreground"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-12 rounded-2xl"
        />
      </div>
      <Button type="submit" className="h-12 rounded-2xl text-base font-semibold font-['Mulish']">
        Send sign-in link
      </Button>
    </form>
  );
}
