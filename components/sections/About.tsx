"use client";

import { aboutTxt } from "../../constants/texts";

interface Skill {
  skill: string;
  icon: string;
  _id?: string;
}

interface AboutProps {
  introduction: string;
  skills: Skill[];
}

export default function About({ introduction, skills }: AboutProps) {
  return (
    <section className="flex flex-col items-center w-full pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Introduction Label */}
      <div className="text-overline text-center mb-4 text-foreground/50">
        {aboutTxt.introduction}
      </div>

      {/* Main Heading */}
      <h1 className="text-heading text-center mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
        {aboutTxt.about}
      </h1>

      {/* Introduction Text */}
      <div className="text-body text-foreground/80 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center mb-10 sm:mb-12 lg:mb-16 mx-auto px-2 sm:px-4">
        {introduction}
      </div>

      {/* Skills Section */}
      <div className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* Skills Grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {skills.map((skill: Skill, idx: number) => {
            const displayIcon = skill.icon.includes("imagekit.io")
              ? `${skill.icon}?tr=w-80,h-80,bg-FFFFFF00,fit-contain`
              : skill.icon;
            return (
              <div
                key={idx}
                className="glass-card relative group rounded-2xl p-4 flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 hover:scale-110 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(37,99,235,0.25)] cursor-pointer"
              >
                <img
                  src={displayIcon}
                  alt={skill.skill + " icon"}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain filter transition-transform duration-300 group-hover:scale-105"
                />

                {/* Tooltip */}
                <div className="text-caption absolute bottom-full mb-3 px-3 py-1.5 bg-neutral-950/90 text-foreground border border-white/10 backdrop-blur-md font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-lg pointer-events-none select-none">
                  {skill.skill}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-950/90"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
