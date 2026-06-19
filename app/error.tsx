"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for developers
    console.error("Hydration/Server-side Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black px-4 sm:px-6 md:px-8">
      {/* Background glowing red/amber blur orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-red-950/15 blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
        {/* Error Graphic */}
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 mb-6 animate-pulse">
          <AlertTriangle className="h-8 w-8" />
        </div>

        {/* Header */}
        <h2 className="text-subheading text-foreground mb-3 font-extrabold tracking-tight">
          Connection Issue
        </h2>

        {/* Description */}
        <p className="text-body-sm text-foreground/70 mb-8 max-w-sm">
          We couldn&apos;t connect to the database or retrieve the portfolio contents. Please check your internet connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => reset()}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-650 to-primary text-white rounded-full px-6 py-3.5 text-body-sm font-semibold cursor-pointer transition-all duration-300 hover:scale-103 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] active:scale-97"
        >
          <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
