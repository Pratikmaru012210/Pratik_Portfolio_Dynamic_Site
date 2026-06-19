"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

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
  const [dynamicSections, setDynamicSections] = useState<{ name: string; id: string }[]>([]);

  // Fetch logo name from backend
  useEffect(() => {
    const fetchLogoName = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data?.data?.firstName) {
          setLogoName(data.data.firstName);
        }
      } catch {
        // silently ignore
      }
    };
    const fetchDynamicSections = async () => {
      try {
        const res = await fetch("/api/dynamic-sections");
        const data = await res.json();
        if (data?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setDynamicSections(data.data.map((s: any) => ({ name: s.name, id: `dynamic-${s._id}` })));
        }
      } catch {
        // silently ignore
      }
    };
    fetchLogoName();
    fetchDynamicSections();
  }, []);

  // ── Scroll-based active section tracker ──────────────────────────────────
  // Picks the section whose top edge is closest to (but still above) the
  // navbar height (64 px + a small buffer). Falls back to the last section
  // when scrolled all the way to the bottom.
  const updateActiveSection = useCallback(() => {
    if (pathname !== "/") return;
    if (window.location.hash === "#contact") return;

    const NAVBAR_HEIGHT = 80; // px — a bit more than h-16 (64 px)
    let bestId = "home";
    let bestTop = -Infinity;

    const allSectionIds = [...SECTION_IDS, ...dynamicSections.map(s => s.id)];

    for (const id of allSectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // The section whose top is ≤ NAVBAR_HEIGHT and is as large as possible
      if (rect.top <= NAVBAR_HEIGHT && rect.top > bestTop) {
        bestTop = rect.top;
        bestId = id;
      }
    }
    setActiveSection((prevId) => bestId);
  }, [pathname]);

  // Sync the URL hash safely after render whenever activeSection changes
  useEffect(() => {
    if (pathname === "/" && activeSection) {
      window.history.replaceState(null, "", `#${activeSection}`);
    }
  }, [activeSection, pathname]);

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
    const allSectionIds = [...SECTION_IDS, ...dynamicSections.map(s => s.id)];
    if (hash && allSectionIds.includes(hash)) {
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
      // Delay scrolling until the menu collapse transition completes (300ms)
      // to avoid incorrect target position calculations due to collapsing layout shifts.
      setTimeout(() => {
        scrollToSection(id);
      }, 300);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/45 backdrop-blur-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-baseline space-x-0.5">
              <span className="text-primary text-2xl font-extrabold tracking-tight transition-all duration-300 group-hover:opacity-90">
                {logoName}
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary select-none align-baseline" />
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
                    href={pathname === "/" ? `#${link.id}` : `/#${link.id}`}
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

              {dynamicSections.length > 0 && (
                <div className="relative group">
                  <button className={`flex items-center gap-1 px-3 py-2 text-body-sm font-medium transition-colors duration-200 hover:text-primary ${dynamicSections.some(s => s.id === activeSection) ? "text-primary" : "text-foreground/80"}`}>
                    More <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  {/* Invisible bridge: fills the gap so moving mouse down doesn't close the dropdown */}
                  <div className="absolute top-full left-0 w-full h-2 bg-transparent" />
                  <div className="absolute top-[calc(100%+0.5rem)] right-0 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden py-2 backdrop-blur-md
                    opacity-0 invisible translate-y-1
                    group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                    transition-all duration-200 ease-out">
                    {dynamicSections.map(sec => (
                      <Link
                        key={sec.id}
                        href={pathname === "/" ? `#${sec.id}` : `/#${sec.id}`}
                        onClick={(e) => {
                          handleNavLinkClick(e, sec.id);
                        }}
                        className={`block px-4 py-2 text-sm transition-colors hover:bg-white/5 hover:text-primary ${activeSection === sec.id ? "text-primary bg-primary/5" : "text-foreground/80"}`}
                      >
                        {sec.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isLoaded && isSignedIn && (
                <Link
                  href="/dashboard"
                  className={`relative px-3 py-2 text-body-sm font-medium transition-colors duration-200 hover:text-primary group ${pathname === "/dashboard" ? "text-primary" : "text-foreground/80"
                    }`}
                >
                  Dashboard
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${pathname === "/dashboard" ? "w-full" : "w-0 group-hover:w-full"
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
        className={`md:hidden grid transition-all duration-300 ease-in-out ${isOpen
          ? "grid-rows-[1fr] opacity-100 border-t border-border/40"
          : "grid-rows-[0fr] opacity-0"
          } bg-background/60 backdrop-blur-lg`}
        id="mobile-menu"
      >
        <div className="overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const isActive = pathname === "/" && activeSection === link.id;
              return (
                <Link
                  key={link.name}
                  href={pathname === "/" ? `#${link.id}` : `/#${link.id}`}
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

            {dynamicSections.length > 0 && (
              <div className="py-2 border-t border-b border-border/20 my-2">
                <div className="px-3 py-1 text-xs font-semibold text-foreground/50 uppercase tracking-wider">More</div>
                {dynamicSections.map(sec => (
                  <Link
                    key={sec.id}
                    href={pathname === "/" ? `#${sec.id}` : `/#${sec.id}`}
                    onClick={(e) => handleMobileNavLinkClick(e, sec.id)}
                    className={`block rounded-lg px-3 py-2 text-body-sm font-medium transition-all duration-200 ${pathname === "/" && activeSection === sec.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
                      }`}
                  >
                    {sec.name}
                  </Link>
                ))}
              </div>
            )}

            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-body-sm font-medium transition-all duration-200 ${pathname === "/dashboard"
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
                  <button className="w-full cursor-pointer rounded-lg bg-primary/10 hover:bg-primary/20 px-4 py-2.5 text-center text-sm font-semibold text-primary border border-primary/30 transition-all duration-200 shadow-sm">
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
      </div>
    </nav>
  );
}
