"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/40 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent transition-all duration-300 group-hover:opacity-90">
                DevPortfolio
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  href="/admin/dashboard"
                  className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Section: Clerk Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoaded ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-foreground/10" />
            ) : !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="cursor-pointer rounded-full bg-primary/10 hover:bg-primary/20 px-5 py-2 text-sm font-semibold text-primary border border-primary/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center space-x-2 p-1 rounded-full bg-foreground/5 border border-border/40">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8 hover:scale-105 transition-transform duration-200",
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-foreground/5 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu panel */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 border-t border-border/40" : "max-h-0 opacity-0 overflow-hidden"
        } bg-background/60 backdrop-blur-lg`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/80 hover:bg-foreground/5 hover:text-primary transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
          {isSignedIn && (
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/80 hover:bg-foreground/5 hover:text-primary transition-all duration-200"
            >
              Dashboard
            </Link>
          )}
          <div className="mt-4 border-t border-border/40 pt-4 pb-2">
            {!isLoaded ? (
              <div className="h-9 w-full animate-pulse rounded-lg bg-foreground/10" />
            ) : !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-md hover:bg-primary/95 transition-all duration-200">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center space-x-3 px-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9",
                    },
                  }}
                />
                <span className="text-sm font-medium text-foreground/80">My Account</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
