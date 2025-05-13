import React from "react";

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full min-h-screen bg-background">{children}</section>
  );
}

export default SectionWrapper;
