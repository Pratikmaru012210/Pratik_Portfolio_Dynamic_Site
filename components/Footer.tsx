"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";

interface FooterProps {
  firstName?: string;
  lastName?: string;
}

export default function Footer({ firstName = "", lastName = "" }: FooterProps) {
  const { isSignedIn, isLoaded } = useUser();
  const currentYear = new Date().getFullYear();
  const fullName = `${firstName} ${lastName}`.trim() || "Pratik";

  return (
    <footer className="w-full py-8 px-4 sm:px-6 md:px-8 lg:px-12 bg-transparent text-foreground/50 text-caption font-medium">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Copyright */}
        <div className="text-center sm:text-left select-none tracking-wide">
          © {currentYear} {fullName}. All rights reserved.
        </div>

        {/* Right Side: Sign In Hyperlink */}
        <div className="text-center sm:text-right">
          {!isLoaded ? (
            <div className="h-4 w-12 animate-pulse bg-foreground/10 rounded" />
          ) : isSignedIn ? (
            <Link
              href="/dashboard"
              className="text-foreground/50 hover:text-primary transition-colors duration-200 hover:underline select-none"
            >
              Dashboard
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="text-foreground/50 hover:text-primary transition-colors duration-200 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium text-caption select-none">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </footer>
  );
}
