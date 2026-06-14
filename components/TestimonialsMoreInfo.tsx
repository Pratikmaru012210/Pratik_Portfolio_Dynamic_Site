"use client";

import React from "react";
import CardModal from "./CardModal";
import { ExternalLink } from "lucide-react";

interface TestimonialsMoreInfoProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalRef: React.RefObject<HTMLDivElement | null>;
  data: {
    projectName: string;
    description: string;
    imageUrl: string;
    gitHubLink?: string;
    liveLink?: string;
    techStack?: string[];
    problemSolve?: string;
  };
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

const TestimonialsMoreInfo = ({
  openModal,
  setOpenModal,
  modalRef,
  data,
}: TestimonialsMoreInfoProps) => {
  if (!data) return null;

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  };

  return (
    <CardModal
      openModal={openModal}
      setOpenModal={setOpenModal}
      modalRef={modalRef}
      title={data.projectName}
      className="flex flex-col overflow-hidden max-h-[70vh] sm:max-h-[80vh]"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 sm:space-y-4 px-2 sm:px-3 pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {/* Main Content */}
        <div
          className="w-full h-36 sm:h-56 md:h-64 bg-neutral-950/40 p-1 rounded-2xl cursor-pointer overflow-hidden border border-white/5"
          onClick={() => window.open(data.imageUrl, "_blank")}
        >
          {isVideo(data.imageUrl) ? (
            <video
              src={data.imageUrl}
              className="w-full h-full object-cover rounded-xl border border-white/5"
              controls
            />
          ) : (
            <img
              src={data.imageUrl}
              className="w-full h-full object-cover rounded-xl border border-white/5"
              alt={data.projectName}
            />
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-1.5 bg-neutral-950/40 rounded-2xl p-4 border border-white/5 shadow-inner">
          <div className="text-sm sm:text-base font-bold mb-1 text-primary">
            Description
          </div>
          <div className="text-xs sm:text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
            {data.description}
          </div>
        </div>

        {/* Problem Solved Section */}
        {data.problemSolve && (
          <div className="space-y-1.5 bg-neutral-950/40 rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="text-sm sm:text-base font-bold mb-1 text-primary">
              Problem Solved
            </div>
            <div className="text-xs sm:text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {data.problemSolve}
            </div>
          </div>
        )}

        {/* Tech Stack Tags */}
        {data.techStack && data.techStack.length > 0 && (
          <div className="space-y-2 bg-neutral-950/40 rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="text-sm sm:text-base font-bold text-primary">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-primary border border-primary/20 hover:scale-105 transition-transform duration-200 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 pb-2 border-t border-white/10 mt-4 bg-transparent">
        <div className="flex gap-3 justify-end">
          {data.gitHubLink && (
            <button
              onClick={() => window.open(data.gitHubLink, "_blank")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 border border-primary/25 rounded-full hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4 mr-1.5" />
              GitHub
            </button>
          )}
          {data.liveLink && (
            <button
              onClick={() => window.open(data.liveLink, "_blank")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 border border-primary/25 rounded-full hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Live Demo
            </button>
          )}
        </div>
      </div>
    </CardModal>
  );
};

export default TestimonialsMoreInfo;
