"use client";

import { homeTxt } from "../../constants/texts";
import Fab from "../Fab";
import { Send, FileText } from "lucide-react";

interface SocialMediaLink {
  url: string;
  icon: string;
  iconFileId?: string;
}

interface HeroProps {
  profile: {
    profilePicUrl: string;
    firstName: string;
    lastName: string;
    tagline: string;
    shortIntro: string;
    resumeUrl: string;
    socialMediaLinks: SocialMediaLink[];
  };
}

export default function Hero({ profile }: HeroProps) {
  const handleNavigation = (id: string) => {
    if (id === "contact") {
      window.dispatchEvent(new CustomEvent("open-fab"));
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden text-center pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full glass-glow pointer-events-none -z-10" />

      {/* Profile Picture */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border border-white/10 p-1 mx-auto mb-6 sm:mb-8 flex items-center justify-center hover:scale-105 transition-transform duration-300 bg-neutral-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(37,99,235,0.15)] ring-2 ring-primary/20">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt="Profile"
            className="w-20 h-20 sm:w-26 sm:h-26 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 sm:w-26 sm:h-26 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
            {profile.firstName ? profile.firstName.charAt(0) : "D"}
          </div>
        )}
      </div>

      {/* Greeting */}
      <h2 className="text-subheading mb-3 flex items-center justify-center gap-2 text-foreground/90">
        <span>{`${homeTxt.greetingPrefix} ${profile.firstName} ${profile.lastName}`}</span>
        <span role="img" aria-label="wave" className="animate-bounce">
          {homeTxt.waveEmoji}
        </span>
      </h2>

      {/* Headline */}
      <h1 className="text-display mb-6 max-w-4xl mx-auto bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
        {profile.tagline}
      </h1>

      {/* Description */}
      <p className="text-body text-foreground/75 max-w-2xl mx-auto mb-8">
        {profile.shortIntro}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <button
          onClick={() => handleNavigation("contact")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white rounded-full px-8 py-3.5 text-body-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
        >
          <Send className="h-5 w-5" />
          <span>{homeTxt.connectWithMe}</span>
        </button>
        {profile.resumeUrl && (
          <button
            onClick={() => window.open(profile.resumeUrl, "_blank")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/10 text-foreground rounded-full px-8 py-3.5 text-body-sm font-semibold bg-neutral-900/40 backdrop-blur-md transition-all duration-300 hover:bg-white/5 hover:border-primary/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] active:scale-95 cursor-pointer"
          >
            <FileText className="h-5 w-5 text-primary" />
            <span>{homeTxt.resume}</span>
          </button>
        )}
      </div>

      {/* Float social links FAB at bottom-right of viewport */}
      {profile.socialMediaLinks && profile.socialMediaLinks.length > 0 && (
        <Fab actions={profile.socialMediaLinks} />
      )}
    </section>
  );
}
