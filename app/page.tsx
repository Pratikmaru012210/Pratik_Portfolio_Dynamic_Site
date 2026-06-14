"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";

interface SocialMediaLink {
  url: string;
  icon: string;
  iconFileId?: string;
}

interface ProfileData {
  profilePicUrl: string;
  firstName: string;
  lastName: string;
  tagline: string;
  shortIntro: string;
  resumeUrl: string;
  socialMediaLinks: SocialMediaLink[];
}

interface Skill {
  skill: string;
  icon: string;
  _id?: string;
}

interface Service {
  _id: string;
  service: string;
  icon: string;
  description: string;
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  imageUrl: string;
  gitHubLink?: string;
  liveLink?: string;
  techStack?: string[];
  problemSolve?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    profilePicUrl: "",
    firstName: "",
    lastName: "",
    tagline: "",
    shortIntro: "",
    resumeUrl: "",
    socialMediaLinks: [],
  });
  const [aboutIntroduction, setAboutIntroduction] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";
        
        // Fetch all endpoints in parallel
        const [profileRes, aboutRes, servicesRes, projectsRes] = await Promise.all([
          fetch(`${baseUrl}/profile`),
          fetch(`${baseUrl}/about`),
          fetch(`${baseUrl}/services`),
          fetch(`${baseUrl}/projects`),
        ]);

        const [profileData, aboutData, servicesData, projectsData] = await Promise.all([
          profileRes.json(),
          aboutRes.json(),
          servicesRes.json(),
          projectsRes.json(),
        ]);

        if (profileData && profileData.data) {
          setProfile({
            profilePicUrl: profileData.data.profilePicUrl || "",
            firstName: profileData.data.firstName || "",
            lastName: profileData.data.lastName || "",
            tagline: profileData.data.tagline || "",
            shortIntro: profileData.data.shortIntro || "",
            resumeUrl: profileData.data.resumeUrl || "",
            socialMediaLinks: profileData.data.socialMediaLinks || [],
          });
        }

        if (aboutData && aboutData.abouts && aboutData.abouts.length > 0) {
          setAboutIntroduction(aboutData.abouts[0].introduction || "");
          setSkills(aboutData.abouts[0].skills || []);
        }

        setServices(servicesData.data || []);
        setProjects(projectsData.data || []);
      } catch (err) {
        console.error("Error loading portfolio details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary border-solid"></div>
            <div className="absolute animate-ping rounded-full h-10 w-10 bg-primary/20"></div>
          </div>
          <span className="text-primary text-sm font-semibold tracking-wider uppercase animate-pulse">
            Loading Portfolio...
          </span>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "home", component: <Hero profile={profile} /> },
    { id: "about", component: <About introduction={aboutIntroduction} skills={skills} /> },
    { id: "services", component: <Services services={services} /> },
    { id: "testimonials", component: <Testimonials projects={projects} /> },
  ];

  return (
    <div className="relative isolate overflow-hidden min-h-screen">
      {/* Background radial glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-transparent opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto divide-y divide-border/20">
        {sections.map(({ id, component }) => (
          <div key={id} id={id} className="scroll-mt-20">
            {component}
          </div>
        ))}
      </div>

      {/* Decorative blurred background orb on right */}
      <div
        className="absolute inset-x-0 bottom-10 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 to-transparent opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}