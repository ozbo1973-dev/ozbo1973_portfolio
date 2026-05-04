"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { submitContactForm } from "@/app/actions/submitContactForm";
import { SECTION_IDS } from "@/lib/config";
import { useState } from "react";
import type { ContactFormData } from "@/app/actions/submitContactForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ContactSection() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    description: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        router.push(result.redirect ?? "/verify-email");
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: ContactFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <SectionWrapper
      id={SECTION_IDS[4]}
      bgImage="/images/contact-bg.png"
      title="Contact Me"
    >
      <div className="flex flex-col mx-auto items-center justify-center w-[95%] md:w-[75%] min-h-screen">
        <div
          className={cn(
            "w-full my-auto",
            "p-4 md:p-6 lg:px-14 lg:py-8",
            "bg-card",
            "border border-primary/20 border-t-[3px] border-t-primary",
            "flex flex-col justify-center items-center",
            "gap-7 md:gap-12 lg:gap-11"
          )}
        >
            {/* Form Header */}
            <div className="w-full text-center">
              <h3 className="text-3xl md:text-3xl lg:text-5xl font-bold font-['Inter'] leading-[60.10px]">
                <span className="text-foreground">Fill the Form To </span>
                <span className="text-primary">Contact Me</span>
              </h3>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[900px] space-y-8"
              autoComplete="off"
            >
              {/* Honeypot field for bot detection */}
              <div style={{ display: "none" }} aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Name Fields */}
              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2",
                  "gap-5 md:gap-5 lg:gap-14"
                )}
              >
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={cn(
                    "h-14",
                    "bg-background",
                    "border-2 border-primary",
                    "text-base font-semibold font-['Mulish']",
                    "placeholder:text-muted-foreground"
                  )}
                  required
                />
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={cn(
                    "h-14",
                    "bg-background",
                    "border-2 border-primary",
                    "text-base font-semibold font-['Mulish']",
                    "placeholder:text-muted-foreground"
                  )}
                  required
                />
              </div>

              {/* Email Field */}
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={cn(
                  "h-14",
                  "bg-background",
                  "border-2 border-primary",
                  "text-base font-semibold font-['Mulish']",
                  "placeholder:text-muted-foreground"
                )}
                required
              />

              {/* Message Field */}
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Question or brief description of project in mind"
                className={cn(
                  "min-h-[192px] md:min-h-[192px] lg:min-h-[320px]",
                  "bg-background",
                  "border-2 border-primary",
                  "text-base font-semibold font-['Mulish']",
                  "placeholder:text-muted-foreground",
                  "resize-none"
                )}
                required
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full md:w-auto md:min-w-40",
                    "h-14",
                    "rounded-3xl",
                    "bg-primary hover:bg-primary/90",
                    "text-base font-bold font-['Mulish']"
                  )}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
      </div>
    </SectionWrapper>
  );
}
