"use client";

import React from "react";

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

const Card = ({ testimonial, onMoreInfo }: CardProps) => {
  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  };

  return (
    <div className="my-2 sm:my-3 lg:my-4 relative rounded-xl overflow-hidden w-full min-w-[280px] sm:min-w-[320px] md:min-w-[340px] lg:min-w-[360px] max-w-[300px] sm:max-w-sm md:max-w-md lg:max-w-lg border border-border/40 shadow-md flex flex-col hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all duration-300 bg-primary/5 hover:bg-primary/10">
      {/* Media container */}
      <div
        className="w-full h-40 sm:h-48 md:h-52 lg:h-56 bg-background/50 cursor-pointer overflow-hidden relative group"
        onClick={() => {
          window.open(testimonial.link, "_blank");
        }}
      >
        {isVideo(testimonial.link) ? (
          <video
            src={testimonial.link}
            className="w-full h-full object-cover rounded-t-xl group-hover:scale-102 transition-transform duration-300"
            controls
          />
        ) : (
          <img
            src={testimonial.link}
            className="w-full h-full object-cover rounded-t-xl group-hover:scale-102 transition-transform duration-300"
            alt={testimonial.title}
          />
        )}
      </div>

      {/* Body content */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h5 className="mb-2 text-md sm:text-lg md:text-xl font-bold tracking-tight text-foreground line-clamp-2">
            {testimonial.title}
          </h5>
          <p className="mb-4 text-xs sm:text-sm text-foreground/70 line-clamp-3 leading-relaxed">
            {testimonial.desc.length > 120
              ? testimonial.desc.slice(0, 120) + "..."
              : testimonial.desc}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-start items-center">
          <button
            onClick={onMoreInfo}
            className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            ℹ️ More details
          </button>

          {testimonial.gitHubLink && (
            <button
              onClick={() => window.open(testimonial.gitHubLink, "_blank")}
              className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              🔗 GitHub
            </button>
          )}

          {testimonial.liveLink && (
            <button
              onClick={() => window.open(testimonial.liveLink, "_blank")}
              className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              👁️ Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
