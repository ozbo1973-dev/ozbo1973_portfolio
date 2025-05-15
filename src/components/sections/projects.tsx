import React from "react";
import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import SectionHeader from "./header";
import { SectionMainButton } from "./main-button";

type ProjectCardProps = {
  name: string;
  description: string;
  imageUrl?: string;
};

const projects: ProjectCardProps[] = [
  {
    name: "Project Name",
    description:
      "Description of the project. This is test description informati.",
  },
  {
    name: "Project Name",
    description:
      "Description of the project. This is test description informati.",
  },
];

function ProjectCard({ name, description, imageUrl }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-start items-start gap-2",
        "max-w-96 md:max-w-[550px] lg:max-w-[527px]"
      )}
    >
      {/* Image Container */}
      <div className="self-stretch relative overflow-hidden h-44 lg:h-72">
        <div
          className={cn(
            "absolute inset-0 bg-zinc-200",
            "w-96 md:w-[550px] lg:w-[527px]",
            "h-44 lg:h-72"
          )}
        />
        <div
          className={cn(
            "absolute w-16 h-16",
            "left-[188px] md:left-[239px] lg:left-[228px]",
            "top-[50px] lg:top-[112px]"
          )}
        />
      </div>

      {/* Project Title */}
      <div className="self-stretch inline-flex justify-center items-center gap-2.5">
        <div
          className={cn(
            "text-center justify-center",
            "text-slate-800 text-2xl lg:text-3xl",
            "font-bold font-['Mulish']",
            "h-10",
            "w-96 md:flex-1 lg:w-60"
          )}
        >
          {name}
        </div>
      </div>

      {/* Project Description */}
      <div
        className={cn(
          "self-stretch text-center",
          "h-28",
          "text-black text-xl lg:text-3xl",
          "font-normal font-['Mulish']"
        )}
      >
        {description}
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <SectionWrapper>
      <SectionHeader>Featured Projects</SectionHeader>

      {/* Projects Grid */}
      <div
        className={cn(
          "w-full",
          "px-4 md:px-8 lg:px-4",
          "py-2.5 md:py-4 lg:py-20",
          "flex flex-col lg:flex-row",
          "justify-center items-center",
          "gap-4 md:gap-4 lg:gap-40",
          "flex-wrap content-center"
        )}
      >
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>

      {/* View All Projects Button */}
      <SectionMainButton href="/projects">View All Projects</SectionMainButton>
    </SectionWrapper>
  );
}

export default ProjectsSection;
