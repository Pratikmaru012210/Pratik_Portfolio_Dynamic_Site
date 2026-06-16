"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X } from "lucide-react";

export interface FabAction {
  icon: string;
  url: string;
}

export interface FabProps {
  actions?: FabAction[];
}

const Fab: React.FC<FabProps> = ({ actions }: FabProps) => {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkHashAndOpen = () => {
      if (window.location.hash === "#contact") {
        setOpen(true);
      }
    };

    // Run on mount
    checkHashAndOpen();

    const handleOpenFab = () => {
      setOpen(true);
    };

    window.addEventListener("open-fab", handleOpenFab);
    window.addEventListener("hashchange", checkHashAndOpen);

    return () => {
      window.removeEventListener("open-fab", handleOpenFab);
      window.removeEventListener("hashchange", checkHashAndOpen);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionClick = () => {
    setOpen(false);
  };

  return (
    <div ref={fabRef} className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Options */}
      {open && (
        <div className="flex flex-col items-center gap-3 mb-2 rounded-3xl p-2 bg-neutral-900/60 border border-white/10 backdrop-blur-lg shadow-2xl animate-fade-in">
          {actions?.map((action, idx) => (
            <a
              key={idx}
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleActionClick()}
              className="w-14 h-14 rounded-full bg-neutral-950/40 text-foreground shadow-md flex items-center justify-center hover:bg-primary/20 border border-white/5 hover:border-primary/40 transition-all duration-300 p-3 hover:scale-110 cursor-pointer"
            >
              <img
                src={action.icon}
                alt="Social icon"
                className="w-8 h-8 object-contain filter invert dark:invert-0"
              />
            </a>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center bg-primary border border-primary/40 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        type="button"
        aria-label="Toggle contact menu"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default Fab;
