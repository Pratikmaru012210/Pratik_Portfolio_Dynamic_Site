"use client";

import { useEffect, useState } from "react";
import { homeTxt } from "../../constants/texts";
import Fab from "../Fab";

export default function Hero() {
  const [profile, setProfile] = useState({
    profilePicUrl: "",
    firstName: "",
    lastName: "",
    tagline: "",
    shortIntro: "",
    resumeUrl: "",
    socialMediaLinks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/profile`);
        const data = await res.json();
        if (data && data.data) {
          setProfile({
            profilePicUrl: data.data.profilePicUrl || "",
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            tagline: data.data.tagline || "",
            shortIntro: data.data.shortIntro || "",
            resumeUrl: data.data.resumeUrl || "",
            socialMediaLinks: data.data.socialMediaLinks || [],
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNavigation = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[45vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid mb-4"></div>
        <span className="text-primary text-lg font-medium animate-pulse">Loading Hero...</span>
      </section>
    );
  }

  return (
    <section className="text-center pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Profile Picture */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-3 border-primary p-1 mx-auto mb-6 sm:mb-8 flex items-center justify-center hover:scale-105 transition-transform duration-300">
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
      <h2 className="font-semibold text-lg sm:text-xl md:text-2xl mb-3 flex items-center justify-center gap-2 text-foreground/90">
        <span>{`${homeTxt.greetingPrefix} ${profile.firstName} ${profile.lastName}`}</span>
        <span role="img" aria-label="wave" className="text-xl sm:text-2xl animate-bounce">
          {homeTxt.waveEmoji}
        </span>
      </h2>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight max-w-4xl mx-auto bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
        {profile.tagline}
      </h1>

      {/* Description */}
      <p className="text-foreground/75 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
        {profile.shortIntro}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <button
          onClick={() => handleNavigation("contact")}
          className="w-full sm:w-auto text-center bg-primary text-background rounded-full px-8 py-3.5 text-sm sm:text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:scale-105 shadow-md active:scale-95"
        >
          {homeTxt.connectWithMe}
        </button>
        {profile.resumeUrl && (
          <button
            onClick={() => window.open(profile.resumeUrl, "_blank")}
            className="w-full sm:w-auto text-center border border-primary/40 text-foreground rounded-full px-8 py-3.5 text-sm sm:text-base md:text-lg font-semibold bg-transparent transition-all duration-300 hover:bg-primary/10 hover:border-primary hover:scale-105 shadow-md active:scale-95 cursor-pointer"
          >
            {homeTxt.resume}
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
