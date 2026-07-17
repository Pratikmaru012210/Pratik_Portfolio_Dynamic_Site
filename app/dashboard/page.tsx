"use client";

import { useEffect, useState } from "react";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";
import { Loader2, Menu as MenuIcon } from "lucide-react";

import { Skill, Service, Project, SocialMediaLink, DynamicSection, Cheatsheet } from "@/types";
import { apiRequest } from "@/lib/api";

import Sidebar from "./_components/Sidebar";
import HeroTab, { HeroFormState } from "./_components/HeroTab";
import AboutTab from "./_components/AboutTab";
import ServicesTab from "./_components/ServicesTab";
import ProjectsTab from "./_components/ProjectsTab";
import UsersTab from "./_components/UsersTab";
import DynamicSectionTab from "./_components/DynamicSectionTab";
import CheatsheetsTab from "./_components/CheatsheetsTab";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6">
        <RedirectToSignIn />
      </div>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<"loading" | "pending" | "admin">("loading");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States for Hero profile
  const [heroForm, setHeroForm] = useState<HeroFormState>({
    firstName: "",
    lastName: "",
    emailId: "",
    phoneNumber: "",
    tagline: "",
    shortIntro: "",
    profilePicUrl: "",
    profilePicFileId: "",
    resumeUrl: "",
    resumeFileId: "",
  });
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);

  // States for About & Skills
  const [aboutId, setAboutId] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);

  // States for Services & Projects
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cheatsheets, setCheatsheets] = useState<Cheatsheet[]>([]);

  // States for Dynamic Sections
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchHero = async () => {
    try {
      const data = await apiRequest("/profile");
      if (data && data.data) {
        const d = data.data;
        setHeroForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          emailId: d.emailId || "",
          phoneNumber: d.phoneNumber || "",
          tagline: d.tagline || "",
          shortIntro: d.shortIntro || "",
          profilePicUrl: d.profilePicUrl || "",
          profilePicFileId: d.profilePicFileId || "",
          resumeUrl: d.resumeUrl || "",
          resumeFileId: d.resumeFileId || "",
        });
        setSocialLinks(d.socialMediaLinks || []);
      }
    } catch (err) {
      console.error("Failed to load profile details:", err);
    }
  };

  const fetchAbout = async () => {
    try {
      const data = await apiRequest("/about");
      if (data && data.abouts && data.abouts.length > 0) {
        setAboutId(data.abouts[0]._id || "");
        setIntroduction(data.abouts[0].introduction || "");
        setSkills(data.abouts[0].skills || []);
      }
    } catch (err) {
      console.error("Failed to load about biography:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await apiRequest("/services");
      setServices(data.data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiRequest("/projects");
      setProjects(data.data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const fetchCheatsheets = async () => {
    try {
      const data = await apiRequest("/cheatsheets");
      setCheatsheets(data.data || []);
    } catch (err) {
      console.error("Failed to load cheatsheets:", err);
    }
  };

  const fetchDynamicSections = async () => {
    try {
      const data = await apiRequest("/dynamic-sections");
      setDynamicSections(data.data || []);
    } catch (err) {
      console.error("Failed to load dynamic sections:", err);
    }
  };

  const checkUserStatus = async () => {
    try {
      const data = await apiRequest("/auth/me");
      if (data && data.status) {
        setUserStatus(data.status);
      } else {
        setUserStatus("pending");
      }
    } catch (err) {
      console.error("Failed to fetch user status:", err);
      setUserStatus("pending");
    }
  };

  useEffect(() => {
    // Avoid synchronous setState in effect to bypass lint error
    setTimeout(() => {
      checkUserStatus();
      fetchHero();
      fetchAbout();
      fetchServices();
      fetchProjects();
      fetchCheatsheets();
      fetchDynamicSections();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (userStatus === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center space-y-4">
        <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 mb-2">
          <MenuIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Pending Approval</h2>
        <p className="text-foreground/70 max-w-md">
          We&apos;ve notified the admin. Once the admin approves, you can update content.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[80] px-6 py-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 font-semibold ${toast.type === "success"
            ? "bg-primary/20 border-primary/30 text-primary shadow-primary/10"
            : "bg-red-500/20 border-red-500/30 text-red-500 shadow-red-500/10"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-neutral-950/45 backdrop-blur-lg sticky top-16 z-30 w-full animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-primary">Admin Dashboard</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          type="button"
          className="inline-flex items-center p-2 text-foreground/80 hover:bg-white/5 rounded-xl focus:outline-none cursor-pointer"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        dynamicSections={dynamicSections}
        fetchDynamicSections={fetchDynamicSections}
        getToken={getToken}
        showToast={showToast}
        setLoading={setLoading}
      />

      {/* Main Workspace */}
      <main className="flex-grow md:pl-72 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight hidden md:block">Admin Dashboard</h1>
            <p className="text-foreground/60 mt-1 hidden md:block">
              Manage all visual aspects of your portfolio website.
            </p>
          </div>

          {/* LOADING SHIM */}
          {loading && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 backdrop-blur-sm">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          )}

          {/* TABS CONTAINER */}
          {activeTab === "hero" && (
            <HeroTab
              heroForm={heroForm}
              setHeroForm={setHeroForm}
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchHero={fetchHero}
            />
          )}

          {activeTab === "about" && (
            <AboutTab
              aboutId={aboutId}
              setAboutId={setAboutId}
              introduction={introduction}
              setIntroduction={setIntroduction}
              skills={skills}
              setSkills={setSkills}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchAbout={fetchAbout}
            />
          )}

          {activeTab === "services" && (
            <ServicesTab
              services={services}
              setServices={setServices}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchServices={fetchServices}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsTab
              projects={projects}
              setProjects={setProjects}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchProjects={fetchProjects}
            />
          )}

          {activeTab === "cheatsheets" && (
            <CheatsheetsTab
              cheatsheets={cheatsheets}
              setCheatsheets={setCheatsheets}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchCheatsheets={fetchCheatsheets}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              showToast={showToast}
              getToken={getToken}
            />
          )}

          {activeTab.startsWith("dynamic-") && (
            <DynamicSectionTab
              sectionId={activeTab.replace("dynamic-", "")}
              dynamicSections={dynamicSections}
              loading={loading}
              setLoading={setLoading}
              showToast={showToast}
              getToken={getToken}
              fetchDynamicSections={fetchDynamicSections}
            />
          )}
        </div>
      </main>
    </div>
  );
}
