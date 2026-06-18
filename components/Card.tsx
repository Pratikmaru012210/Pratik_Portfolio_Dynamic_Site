"use client";

import React from "react";
import { Info, ExternalLink } from "lucide-react";
import { formatExternalLink } from "@/lib/utils";

interface CardProps {
  testimonial: {
    title: string;
    link: string;
    desc: string;
    gitHubLink?: string;
    liveLink?: string;
  };
  onMoreInfo?: () => void;
}

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Card = ({ testimonial, onMoreInfo }: CardProps) => {
  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  };

  return (
    <div className="glass-card my-2 sm:my-3 lg:my-4 relative rounded-2xl overflow-hidden w-full min-w-[280px] sm:min-w-[320px] md:min-w-[340px] lg:min-w-[360px] max-w-[300px] sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col hover:scale-[1.03] hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(var(--primary-rgb),0.15)] transition-all duration-300">
      {/* Media container — click opens detail modal */}
      <div
        className="w-full h-40 sm:h-48 md:h-52 lg:h-56 bg-neutral-950/40 cursor-pointer overflow-hidden relative group"
        onClick={onMoreInfo}
      >
        {isVideo(testimonial.link) ? (
          <video
            src={testimonial.link}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={testimonial.link}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={testimonial.title}
          />
        )}
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5" />
            View Details
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h5 className="text-subheading mb-2 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {testimonial.title}
          </h5>
          <p className="text-caption mb-4 text-foreground/70 line-clamp-3">
            {testimonial.desc.length > 120
              ? testimonial.desc.slice(0, 120) + "..."
              : testimonial.desc}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-start items-center">
          <button
            onClick={onMoreInfo}
            className="text-caption inline-flex items-center justify-center px-4 py-2 font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Info className="w-4 h-4 mr-1.5" />
            More details
          </button>

          {testimonial.gitHubLink && (
            <button
              onClick={() => window.open(formatExternalLink(testimonial.gitHubLink || ""), "_blank")}
              className="text-caption inline-flex items-center justify-center px-4 py-2 font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4 mr-1.5" />
              GitHub
            </button>
          )}

          {testimonial.liveLink && (
            <button
              onClick={() => window.open(formatExternalLink(testimonial.liveLink || ""), "_blank")}
              className="text-caption inline-flex items-center justify-center px-4 py-2 font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Live Demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
