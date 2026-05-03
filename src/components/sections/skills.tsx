import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";
import { SECTION_IDS } from "@/lib/config";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiPython,
  SiAmazonwebservices,
} from "@icons-pack/react-simple-icons";

type SkillProps = {
  name: string;
  level: string;
  progress: number;
  icon: React.ReactNode;
};

const skills: SkillProps[] = [
  {
    name: "React",
    level: "Advanced",
    progress: 90,
    icon: <SiReact className="text-primary w-12 h-12" />,
  },
  {
    name: "Next.js",
    level: "Advanced",
    progress: 85,
    icon: <SiNextdotjs className="text-primary w-12 h-12" />,
  },
  {
    name: "TypeScript",
    level: "Advanced",
    progress: 85,
    icon: <SiTypescript className="text-primary w-12 h-12" />,
  },
  {
    name: "Node.js",
    level: "Intermediate",
    progress: 75,
    icon: <SiNodedotjs className="text-primary w-12 h-12" />,
  },
  // {
  //   name: "Python",
  //   level: "Intermediate",
  //   progress: 70,
  //   icon: <SiPython className="text-primary w-12 h-12" />,
  // },
  // {
  //   name: "AWS",
  //   level: "Intermediate",
  //   progress: 65,
  //   icon: <SiAmazonwebservices className="text-primary w-12 h-12" />,
  // },
];

type SkillCardProps = SkillProps & { index: number };

function SkillCard({ name, level, progress, icon, index }: SkillCardProps) {
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
      <div className="w-56 text-center text-foreground text-base font-extrabold font-['Mulish'] uppercase tracking-wider">
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
