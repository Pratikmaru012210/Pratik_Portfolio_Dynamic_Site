"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500">
      {/* Background glowing blurred orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="relative flex flex-col items-center justify-center">
        {/* Loading Spinner Container */}
        <div className="relative h-20 w-20 flex items-center justify-center">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          
          {/* Rotating Gradient Spinner */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-r-transparent border-t-primary animate-spin" />
          
          {/* Inner Glowing Orb */}
          <div className="h-6 w-6 rounded-full bg-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.85)] animate-pulse" />
        </div>

        {/* Elegant Loading Typography */}
        <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-foreground/80 select-none animate-pulse">
          Loading Portfolio
        </h3>
        <p className="mt-2 text-xs text-foreground/40 select-none tracking-[0.1em]">
          Please wait while we set things up
        </p>
      </div>
    </div>
  );
}
