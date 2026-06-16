"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-lg p-3 sm:p-4 animate-fade-in">
      <div
        ref={modalRef}
        className={`glass-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] p-5 sm:p-6 md:p-8 mx-2 sm:mx-4 text-foreground flex flex-col transform transition-all duration-300 ease-out animate-fade-in-up ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="text-heading bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={() => setOpenModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-foreground/75 hover:text-primary transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
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
