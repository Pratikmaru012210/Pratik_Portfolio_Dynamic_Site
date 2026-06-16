"use client";

import { aboutTxt } from "../../constants/texts";
import { Skill } from "@/types";

interface AboutProps {
  introduction: string;
  skills: Skill[];
}

export default function About({ introduction, skills }: AboutProps) {
  return (
    <section className="flex flex-col items-center w-full pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Introduction Label */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-overline text-foreground/50">{aboutTxt.introduction}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>

      {/* Main Heading with accent bar */}
      <div className="text-center mb-8">
        <h1 className="text-heading bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent inline-block">
          {aboutTxt.about}
        </h1>
        {/* Decorative underline */}
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      </div>

      {/* Introduction Text — styled callout card */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto mb-12 sm:mb-14 lg:mb-16 px-2 sm:px-0">
        <div className="glass-card rounded-2xl px-6 py-5 border-l-2 border-l-primary/60 text-body text-foreground/80 leading-relaxed text-left sm:text-center">
          {introduction}
        </div>
      </div>

      {/* Skills Section */}
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* Skills Grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {skills.map((skill: Skill, idx: number) => {
            const displayIcon = skill.icon.includes("imagekit.io")
              ? `${skill.icon}?tr=w-80,h-80,bg-FFFFFF00,fit-contain`
              : skill.icon;
            return (
              <div
                key={idx}
                tabIndex={0}
                className="glass-card relative group rounded-2xl p-2 sm:p-3.5 flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] hover:scale-110 active:scale-110 focus:scale-110 focus:outline-none hover:border-primary/50 focus:border-primary/50 hover:shadow-[0_0_25px_8px_rgba(var(--primary-rgb),0.35)] cursor-pointer"
              >
                <img
                  src={displayIcon}
                  alt={skill.skill + " icon"}
                  className="w-6 h-6 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 object-contain filter transition-transform duration-300 group-hover:scale-105 group-focus:scale-105 group-active:scale-105"
                />

                {/* Tooltip (visible on hover, long-press, or tap) */}
                <div className="text-caption absolute bottom-full mb-3 px-3 py-1.5 bg-neutral-950/90 text-foreground border border-white/10 backdrop-blur-md font-semibold rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-lg pointer-events-none select-none">
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
