import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Skills from "@/components/sections/skills";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <ProjectsSection />
      {!session && <ContactSection />}
    </main>
  );
}
