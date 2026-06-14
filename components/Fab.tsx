"use client";

import React, { useState } from "react";

export interface FabAction {
  icon: string;
  url: string;
}

export interface FabProps {
  actions?: FabAction[];
}

const Fab: React.FC<FabProps> = ({ actions }: FabProps) => {
  const [open, setOpen] = useState(false);

  const handleActionClick = () => {
    setOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Options */}
      {open && (
        <div className="flex flex-col items-center gap-3 mb-2 rounded-full p-2.5 bg-background/80 border border-border/40 backdrop-blur-md animate-fade-in">
          {actions?.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionClick()}
              className="w-12 h-12 rounded-full bg-primary text-background shadow-md flex items-center justify-center hover:bg-primary/95 transition-all duration-200 p-2 border border-border hover:scale-105"
              type="button"
            >
              <a href={action.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={action.icon}
                  alt="Social icon"
                  className="w-6 h-6 object-contain filter invert dark:invert-0"
                />
              </a>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full text-foreground shadow-lg flex items-center justify-center bg-primary/20 border border-primary/30 hover:bg-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
        type="button"
      >
        <span className="text-xl">{open ? "❌" : "👀"}</span>
      </button>
    </div>
  );
};

export default Fab;
