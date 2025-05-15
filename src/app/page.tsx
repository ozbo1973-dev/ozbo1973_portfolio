import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Skills from "@/components/sections/skills";
import ProjectsSection from "@/components/sections/projects";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <ProjectsSection />
    </main>
  );
}
