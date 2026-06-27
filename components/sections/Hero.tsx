"use client";

import { homeTxt } from "../../constants/texts";
import { Send, Eye, Download } from "lucide-react";
import { ProfileData } from "@/types";

interface HeroProps {
  profile: ProfileData;
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
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-2 border-primary/40 p-0 mx-auto mb-6 sm:mb-8 flex items-center justify-center hover:scale-105 transition-all duration-300 bg-transparent shadow-[0_0_35px_8px_rgba(var(--primary-rgb),0.45)] ring-4 ring-primary/10 hover:shadow-[0_0_50px_12px_rgba(var(--primary-rgb),0.6)] hover:border-primary/60">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-white/40"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl border-2 border-white/40">
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white rounded-full px-8 py-3.5 text-body-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] active:scale-95"
        >
          <Send className="h-5 w-5" />
          <span>{homeTxt.connectWithMe}</span>
        </button>
        {profile.resumeUrl && (
          <div className="w-full sm:w-auto flex items-stretch border border-primary/30 text-foreground rounded-full bg-neutral-900/40 backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] overflow-hidden divide-x divide-primary/20">
            {/* View Resume (70%) */}
            <button
              onClick={() => window.open(profile.resumeUrl, "_blank")}
              className="flex-[7] sm:flex-initial flex items-center justify-center gap-2 pl-6 pr-4 py-3.5 text-body-sm font-semibold hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer bg-transparent"
              title="View Resume"
            >
              <Eye className="h-5 w-5 text-primary" />
              <span>{homeTxt.resume}</span>
            </button>
            {/* Download Resume (30%) */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  let downloadUrl = profile.resumeUrl;
                  if (downloadUrl.includes("imagekit.io")) {
                    const separator = downloadUrl.includes("?") ? "&" : "?";
                    downloadUrl = `${downloadUrl}${separator}ik-attachment=true`;
                  }

                  // Try to fetch as blob (handles standard CORS-enabled origins)
                  const response = await fetch(downloadUrl);
                  if (!response.ok) throw new Error("Network response was not ok");
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);

                  const link = document.createElement("a");
                  link.href = blobUrl;
                  link.setAttribute("download", "Resume.pdf");
                  document.body.appendChild(link);
                  link.click();

                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                  console.warn("Direct download failed, falling back to window.open", error);
                  // Fallback: trigger download by opening URL with attachment parameter
                  let fallbackUrl = profile.resumeUrl;
                  const separator = fallbackUrl.includes("?") ? "&" : "?";
                  fallbackUrl = `${fallbackUrl}${separator}ik-attachment=true`;
                  window.open(fallbackUrl, "_blank");
                }
              }}
              className="flex-[3] sm:flex-initial flex items-center justify-center px-4 py-3.5 hover:bg-white/5 active:scale-[0.95] transition-all cursor-pointer bg-transparent"
              title="Download Resume"
            >
              <Download className="h-5 w-5 text-foreground/80 hover:text-primary transition-colors" />
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
