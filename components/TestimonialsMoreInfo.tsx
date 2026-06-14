"use client";

import React from "react";
import CardModal from "./CardModal";

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
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 sm:space-y-4 px-2 sm:px-3 pb-2">
        {/* Main Content */}
        <div
          className="w-full h-36 sm:h-56 md:h-64 bg-background p-1 rounded-xl cursor-pointer overflow-hidden"
          onClick={() => window.open(data.imageUrl, "_blank")}
        >
          {isVideo(data.imageUrl) ? (
            <video
              src={data.imageUrl}
              className="w-full h-full object-cover rounded-lg border border-border/40"
              controls
            />
          ) : (
            <img
              src={data.imageUrl}
              className="w-full h-full object-cover rounded-lg border border-border/40"
              alt={data.projectName}
            />
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-1.5 bg-primary/5 rounded-xl p-3 sm:p-4 border border-primary/10">
          <div className="text-sm sm:text-base font-bold mb-1 text-primary">
            Description
          </div>
          <div className="text-xs sm:text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
            {data.description}
          </div>
        </div>

        {/* Problem Solved Section */}
        {data.problemSolve && (
          <div className="space-y-1.5 bg-primary/5 rounded-xl p-3 sm:p-4 border border-primary/10">
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
          <div className="space-y-2 bg-primary/5 rounded-xl p-3.5 sm:p-4 border border-primary/10">
            <div className="text-sm sm:text-base font-bold text-primary">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-primary border border-primary/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm pt-4 pb-2 border-t border-border/20 mt-4">
        <div className="flex gap-3 justify-end">
          {data.gitHubLink && (
            <button
              onClick={() => window.open(data.gitHubLink, "_blank")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 border border-primary/25 rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer"
            >
              🔗 GitHub
            </button>
          )}
          {data.liveLink && (
            <button
              onClick={() => window.open(data.liveLink, "_blank")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 border border-primary/25 rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer"
            >
              👁️ Live Link
            </button>
          )}
        </div>
      </div>
    </CardModal>
  );
};

export default TestimonialsMoreInfo;
