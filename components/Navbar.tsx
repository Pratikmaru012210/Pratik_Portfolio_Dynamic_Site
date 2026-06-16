"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

// Section IDs in document order
const SECTION_IDS = ["home", "about", "services", "testimonials", "contact"];

const navLinks = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Services", id: "services" },
  { name: "Testimonials", id: "testimonials" },
  { name: "Contact", id: "contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");
  const [logoName, setLogoName] = useState("DevPortfolio");

  // Fetch logo name from backend
  useEffect(() => {
    const fetchLogoName = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/profile`);
        const data = await res.json();
        if (data?.data?.firstName) {
          setLogoName(data.data.firstName);
        }
      } catch {
        // silently ignore
      }
    };
    fetchLogoName();
  }, []);

  // ── Scroll-based active section tracker ──────────────────────────────────
  // Picks the section whose top edge is closest to (but still above) the
  // navbar height (64 px + a small buffer). Falls back to the last section
  // when scrolled all the way to the bottom.
  const updateActiveSection = useCallback(() => {
    if (pathname !== "/") return;

    const NAVBAR_HEIGHT = 80; // px — a bit more than h-16 (64 px)
    let bestId = "home";
    let bestTop = -Infinity;

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // The section whose top is ≤ NAVBAR_HEIGHT and is as large as possible
      if (rect.top <= NAVBAR_HEIGHT && rect.top > bestTop) {
        bestTop = rect.top;
        bestId = id;
      }
    }

    setActiveSection(bestId);
    // Update URL hash without triggering a navigation / scroll
    window.history.replaceState(null, "", `#${bestId}`);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    // Run once on mount so the initial hash is correct
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [pathname, updateActiveSection]);

  // ── Sync active section when landing with a hash in the URL ──────────────
  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTION_IDS.includes(hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection(hash);
    }
  }, [pathname]);

  // ── Click handlers ────────────────────────────────────────────────────────
  const scrollToSection = (id: string) => {
    if (id === "contact") {
      window.dispatchEvent(new CustomEvent("open-fab"));
      window.history.replaceState(null, "", `#${id}`);
      setActiveSection(id);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // URL will be updated by the scroll listener automatically,
      // but set it immediately so the click feels instant.
      window.history.replaceState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      scrollToSection(id);
    }
    // If on a different page, let the href navigate normally to /#id
  };

  const handleMobileNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsOpen(false);
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/45 backdrop-blur-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent transition-all duration-300 group-hover:opacity-90">
                {logoName}
                <span className="text-primary font-black select-none">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === "/" && activeSection === link.id;
                return (
                  <Link
                    key={link.name}
                    href={`#${link.id}`}
                    onClick={(e) => handleNavLinkClick(e, link.id)}
                    className={`relative px-3 py-2 text-body-sm font-medium transition-colors duration-200 hover:text-primary group ${isActive ? "text-primary" : "text-foreground/80"
                      }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                    />
                  </Link>
                );
              })}
              {isLoaded && isSignedIn && (
                <Link
                  href="/admin/dashboard"
                  className={`relative px-3 py-2 text-body-sm font-medium transition-colors duration-200 hover:text-primary group ${pathname === "/admin/dashboard" ? "text-primary" : "text-foreground/80"
                    }`}
                >
                  Dashboard
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${pathname === "/admin/dashboard" ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Right Section: Clerk Auth */}
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
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu panel */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${isOpen
          ? "max-h-96 opacity-100 border-t border-border/40"
          : "max-h-0 opacity-0 overflow-hidden"
          } bg-background/60 backdrop-blur-lg`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-4 py-3">
          {navLinks.map((link) => {
            const isActive = pathname === "/" && activeSection === link.id;
            return (
              <Link
                key={link.name}
                href={`#${link.id}`}
                onClick={(e) => handleMobileNavLinkClick(e, link.id)}
                className={`block rounded-lg px-3 py-2 text-body-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
          {isLoaded && isSignedIn && (
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-body-sm font-medium transition-all duration-200 ${pathname === "/admin/dashboard"
                ? "bg-primary/10 text-primary"
                : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
                }`}
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
