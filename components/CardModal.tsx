"use client";

import React, { useEffect } from "react";

interface CardModalProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CardModal = ({
  openModal,
  setOpenModal,
  modalRef,
  title,
  children,
  className = "",
}: CardModalProps) => {
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={modalRef}
        className={`bg-background border border-border/60 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] p-5 sm:p-6 md:p-8 mx-2 sm:mx-4 text-foreground flex flex-col transform transition-all duration-300 ease-out animate-fade-in ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">{title}</h3>
          <button
            onClick={() => setOpenModal(false)}
            className="p-1.5 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-primary transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto pr-2 space-y-4 text-foreground/90 flex-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
