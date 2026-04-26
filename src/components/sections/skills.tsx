import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiPython,
  SiAmazonwebservices,
} from "@icons-pack/react-simple-icons";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  className?: string;
}>;

type SkillProps = {
  name: string;
  level: string;
  progress: number;
  Icon: IconComponent;
};

const skills: SkillProps[] = [
  { name: "React", level: "Advanced", progress: 90, Icon: SiReact },
  { name: "Next.js", level: "Advanced", progress: 85, Icon: SiNextdotjs },
  { name: "TypeScript", level: "Advanced", progress: 85, Icon: SiTypescript },
  { name: "Node.js", level: "Intermediate", progress: 75, Icon: SiNodedotjs },
  { name: "Python", level: "Intermediate", progress: 70, Icon: SiPython },
  { name: "AWS", level: "Intermediate", progress: 65, Icon: SiAmazonwebservices },
];

function SkillCard({
  name,
  level,
  progress,
  Icon,
  index,
}: SkillProps & { index: number }) {
  return (
    <div
      className={cn(
        "w-36 h-48 p-4 bg-card",
        "flex flex-col justify-start items-center gap-3",
        "border-t-2 border-primary",
        "animate-fade-in opacity-0"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      <div className="w-full h-20 max-w-32 flex items-center justify-center">
        <Icon size={48} className="text-primary" color="currentColor" />
      </div>
      <div className="w-full text-center text-foreground text-base font-extrabold font-['Mulish'] uppercase tracking-wider">
        {name}
      </div>
      <div className="self-stretch text-center text-foreground/80 text-xs font-light font-['Mulish'] uppercase tracking-wide">
        {level}
      </div>
      <div className="self-stretch h-1.5 relative bg-muted rounded-full overflow-hidden">
        <div
          className="h-1.5 absolute left-0 top-0 bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function SkillsSection() {
  return (
    <SectionWrapper id="skills" title="My Skills">
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
