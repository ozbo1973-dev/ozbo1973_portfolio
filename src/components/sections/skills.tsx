import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import SectionHeader from "./header";
import { SectionMainButton } from "./main-button";

type SkillProps = {
  name: string;
  level: string;
  progress: number;
  icon?: React.ReactNode;
};

const skills: SkillProps[] = [
  { name: "React", level: "Advanced", progress: 90 },
  { name: "Next.js", level: "Advanced", progress: 85 },
  { name: "TypeScript", level: "Advanced", progress: 85 },
  { name: "Node.js", level: "Intermediate", progress: 75 },
  { name: "Python", level: "Intermediate", progress: 70 },
  { name: "AWS", level: "Intermediate", progress: 65 },
];

function SkillCard({ name, level, progress, icon }: SkillProps) {
  return (
    <div className="w-36 h-48 p-4 bg-card flex flex-col justify-start items-center gap-3">
      <div className="w-full h-20 max-w-32 relative overflow-hidden">
        {icon ? (
          icon
        ) : (
          <div className="w-24 h-14 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-4 outline-offset-[-2px] outline-border" />
        )}
      </div>
      <div className="w-56 text-center text-foreground text-base font-extrabold font-['Mulish'] uppercase tracking-wider">
        {name}
      </div>
      <div className="self-stretch text-center text-foreground/80 text-xs font-light font-['Mulish'] uppercase tracking-wide">
        {level}
      </div>
      <div className="self-stretch h-5 relative bg-muted">
        <div
          className="h-5 absolute left-0 top-0 bg-primary/30"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <SectionWrapper>
      {/* Header - Responsive */}
      <SectionHeader>My Skills</SectionHeader>

      {/* Skills Grid - Responsive */}
      <div
        className={cn(
          "w-full",
          "py-[3px] md:py-5 lg:py-8",
          "px-2.5 md:px-4 lg:px-8",
          "pb-12 md:pb-16 lg:pb-20",
          "inline-flex justify-center",
          "items-start gap-8",
          "flex-wrap content-start"
        )}
      >
        {skills.map((skill) => (
          <SkillCard key={skill.name} {...skill} />
        ))}
      </div>

      {/* Resume Button */}
      <div className="w-full py-10 flex justify-center">
        <SectionMainButton href="/resume.pdf" download>
          Download Resume
        </SectionMainButton>
      </div>
    </SectionWrapper>
  );
}
