import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";
import { SECTION_IDS } from "@/lib/config";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiDocker,
  SiClaude,
} from "@icons-pack/react-simple-icons";
import { Bot, BrainCircuit } from "lucide-react";

const PROGRESS = { Beginner: 40, Intermediate: 65, Advanced: 90 } as const;
type Level = keyof typeof PROGRESS;

type SkillProps = {
  name: string;
  level: Level;
  icon: React.ReactNode;
};

const skills: SkillProps[] = [
  { name: "React", level: "Advanced", icon: <SiReact className="text-primary w-12 h-12" /> },
  { name: "Next.js", level: "Advanced", icon: <SiNextdotjs className="text-primary w-12 h-12" /> },
  { name: "TypeScript", level: "Advanced", icon: <SiTypescript className="text-primary w-12 h-12" /> },
  { name: "JavaScript", level: "Intermediate", icon: <SiJavascript className="text-primary w-12 h-12" /> },
  { name: "HTML", level: "Advanced", icon: <SiHtml5 className="text-primary w-12 h-12" /> },
  { name: "CSS", level: "Intermediate", icon: <SiCss className="text-primary w-12 h-12" /> },
  { name: "Node.js", level: "Intermediate", icon: <SiNodedotjs className="text-primary w-12 h-12" /> },
  { name: "Docker", level: "Beginner", icon: <SiDocker className="text-primary w-12 h-12" /> },
  { name: "Claude Code", level: "Intermediate", icon: <SiClaude className="text-primary w-12 h-12" /> },
  { name: "AI Agents", level: "Beginner", icon: <Bot className="text-primary w-12 h-12" /> },
  { name: "AI Engineer", level: "Beginner", icon: <BrainCircuit className="text-primary w-12 h-12" /> },
];

type SkillCardProps = SkillProps & { index: number };

function SkillCard({ name, level, icon, index }: SkillCardProps) {
  const progress = PROGRESS[level];
  return (
    <div
      className={cn(
        "w-36 h-48 p-4 bg-card",
        "flex flex-col justify-start items-center gap-3",
        "border-t-2 border-primary",
        "animate-fade-in",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-full h-20 max-w-32 flex items-center justify-center">
        {icon}
      </div>
      <div className="w-full text-center text-foreground text-base font-extrabold font-['Mulish'] uppercase tracking-wider">
        {name}
      </div>
      <div className="self-stretch text-center text-foreground/80 text-xs font-light font-['Mulish'] uppercase tracking-wide">
        {level}
      </div>
      <div className="self-stretch h-2 relative bg-muted rounded-full overflow-hidden">
        <div
          className="h-2 absolute left-0 top-0 bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function SkillsSection() {
  return (
    <SectionWrapper id={SECTION_IDS[2]} title="My Skills">
      <div
        className={cn(
          "w-full",
          "py-[3px] md:py-5 lg:py-8",
          "px-2.5 md:px-4 lg:px-8",
          "pb-12 md:pb-16 lg:pb-20",
          "inline-flex justify-center",
          "items-start gap-8",
          "flex-wrap content-start",
        )}
      >
        {skills.map((skill, index) => (
          <SkillCard key={skill.name} {...skill} index={index} />
        ))}
      </div>

      <SectionMainButton href="/resume.pdf" download="resume.pdf">
        Download Resume
      </SectionMainButton>
    </SectionWrapper>
  );
}
