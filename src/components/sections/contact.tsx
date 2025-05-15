import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import SectionHeader from "./header";

export default function ContactSection() {
  return (
    <SectionWrapper>
      <SectionHeader>Contact Me</SectionHeader>

      <div
        className={cn(
          "w-full max-w-[1360px] mx-auto",
          "p-4 md:p-6 lg:p-7",
          "bg-slate-800 rounded-[3px]",
          "bg-[url('/images/contact-bg.png')] bg-cover bg-center bg-no-repeat"
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            "p-4 md:p-6 lg:px-14 lg:py-2.5",
            "bg-card",
            "outline-8 outline-offset-[-9px] outline-border",
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
          <form className="w-full max-w-[900px] space-y-8">
            {/* Name Fields */}
            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-2",
                "gap-5 md:gap-5 lg:gap-14"
              )}
            >
              <Input
                type="text"
                placeholder="First Name"
                className={cn(
                  "h-14",
                  "bg-background",
                  "border-2 border-primary",
                  "text-base font-semibold font-['Mulish']",
                  "placeholder:text-muted-foreground"
                )}
              />
              <Input
                type="text"
                placeholder="Last Name"
                className={cn(
                  "h-14",
                  "bg-background",
                  "border-2 border-primary",
                  "text-base font-semibold font-['Mulish']",
                  "placeholder:text-muted-foreground"
                )}
              />
            </div>

            {/* Email Field */}
            <Input
              type="email"
              placeholder="Email"
              className={cn(
                "h-14",
                "bg-background",
                "border-2 border-primary",
                "text-base font-semibold font-['Mulish']",
                "placeholder:text-muted-foreground"
              )}
            />

            {/* Message Field */}
            <Textarea
              placeholder="Question or brief description of project in mind"
              className={cn(
                "min-h-[192px] md:min-h-[192px] lg:min-h-[320px]",
                "bg-background",
                "border-2 border-primary",
                "text-base font-semibold font-['Mulish']",
                "placeholder:text-muted-foreground",
                "resize-none"
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-center md:justify-end">
              <Button
                type="submit"
                className={cn(
                  "w-56 md:w-96 lg:w-40",
                  "h-14",
                  "rounded-3xl",
                  "bg-primary hover:bg-primary/90",
                  "text-base font-bold font-['Mulish']"
                )}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SectionWrapper>
  );
}
