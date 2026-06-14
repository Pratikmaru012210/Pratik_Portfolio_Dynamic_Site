"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";
import {
  User,
  FileText,
  Briefcase,
  Code,
  Eye,
  Edit,
  Plus,
  Trash2,
  Menu as MenuIcon,
  X as XIcon,
  Mail,
  Phone,
  Globe,
  FileDown,
  Cpu,
  PlusCircle,
  X,
  ExternalLink,
  Loader2
} from "lucide-react";

interface SocialMediaLink {
  url: string;
  icon: string;
  iconFileId?: string;
}

interface Skill {
  _id?: string;
  skill: string;
  icon: string;
  iconFileId?: string;
}

interface Service {
  _id?: string;
  service: string;
  icon: string;
  iconFileId?: string;
  description: string;
}

interface Project {
  _id?: string;
  projectName: string;
  imageUrl: string;
  imageFileId?: string;
  description: string;
  gitHubLink?: string;
  liveLink?: string;
  techStack?: string[];
  problemSolve?: string;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();

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
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "services" | "projects">("hero");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [heroSubTab, setHeroSubTab] = useState<"preview" | "edit">("preview");
  const [aboutSubTab, setAboutSubTab] = useState<"preview" | "edit">("preview");
  const [servicesSubTab, setServicesSubTab] = useState<"preview" | "edit">("preview");
  const [projectsSubTab, setProjectsSubTab] = useState<"preview" | "edit">("preview");

  const profilePicRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const socialIconRef = useRef<HTMLInputElement>(null);
  const skillIconRef = useRef<HTMLInputElement>(null);
  const serviceIconRef = useRef<HTMLInputElement>(null);
  const projectImageRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const getBaseUrl = () => process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";

  // ==========================================
  // IMAGEKIT UPLOAD & DELETE HELPERS
  // ==========================================
  const deleteFromImageKit = async (fileId: string) => {
    try {
      await fetch(`${getBaseUrl()}/delete/${fileId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete file from ImageKit:", err);
    }
  };

  const uploadToImageKit = async (file: File, previousFileId?: string): Promise<{ url: string; fileId: string } | null> => {
    setLoading(true);
    try {
      if (previousFileId) {
        await deleteFromImageKit(previousFileId);
      }
      const authRes = await fetch(`${getBaseUrl()}/imageKitAuth`);
      if (!authRes.ok) {
        throw new Error("Failed to authenticate with ImageKit backend");
      }
      const { signature, expire, token, publicKey } = await authRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || "Failed to upload file to ImageKit");
      }

      const uploadData = await uploadRes.json();
      return { url: uploadData.url, fileId: uploadData.fileId };
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Image upload failed", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TAB 1: HERO & PROFILE STATE
  // ==========================================
  const [heroForm, setHeroForm] = useState({
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
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialIcon, setNewSocialIcon] = useState("");
  const [newSocialIconFileId, setNewSocialIconFileId] = useState("");

  const fetchHero = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/profile`);
      const data = await res.json();
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
      console.error(err);
    }
  };

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getBaseUrl()}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...heroForm,
          socialMediaLinks: socialLinks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Profile updated successfully!");
        fetchHero();
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], heroForm.profilePicFileId);
      if (res) {
        setHeroForm((prev) => ({ ...prev, profilePicUrl: res.url, profilePicFileId: res.fileId }));
        showToast("Profile picture uploaded!");
      }
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], heroForm.resumeFileId);
      if (res) {
        setHeroForm((prev) => ({ ...prev, resumeUrl: res.url, resumeFileId: res.fileId }));
        showToast("Resume document uploaded!");
      }
    }
  };

  const handleSocialIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], newSocialIconFileId);
      if (res) {
        setNewSocialIcon(res.url);
        setNewSocialIconFileId(res.fileId);
        showToast("Social media icon uploaded!");
      }
    }
  };

  const addSocial = () => {
    if (!newSocialUrl || !newSocialIcon) {
      showToast("Both Social Link URL and Icon are required", "error");
      return;
    }
    setSocialLinks([...socialLinks, { url: newSocialUrl, icon: newSocialIcon, iconFileId: newSocialIconFileId || undefined }]);
    setNewSocialUrl("");
    setNewSocialIcon("");
    setNewSocialIconFileId("");
    if (socialIconRef.current) socialIconRef.current.value = "";
  };

  const removeSocial = async (index: number) => {
    const link = socialLinks[index];
    if (link.iconFileId) {
      await deleteFromImageKit(link.iconFileId);
    }
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // ==========================================
  // TAB 2: ABOUT & SKILLS STATE
  // ==========================================
  const [aboutId, setAboutId] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillIcon, setNewSkillIcon] = useState("");
  const [newSkillIconFileId, setNewSkillIconFileId] = useState("");

  const fetchAbout = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/about`);
      const data = await res.json();
      if (data && data.abouts && data.abouts.length > 0) {
        setAboutId(data.abouts[0]._id || "");
        setIntroduction(data.abouts[0].introduction || "");
        setSkills(data.abouts[0].skills || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const method = aboutId ? "PUT" : "POST";
      const url = aboutId ? `${getBaseUrl()}/about/${aboutId}` : `${getBaseUrl()}/about`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ introduction, skills }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("About information updated successfully!");
        fetchAbout();
      } else {
        showToast(data.error || "Failed to save details", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], newSkillIconFileId);
      if (res) {
        setNewSkillIcon(res.url);
        setNewSkillIconFileId(res.fileId);
        showToast("Skill icon uploaded!");
      }
    }
  };

  const addSkill = () => {
    if (!newSkillName || !newSkillIcon) {
      showToast("Skill Name and Icon are required", "error");
      return;
    }
    setSkills([...skills, { skill: newSkillName, icon: newSkillIcon, iconFileId: newSkillIconFileId || undefined }]);
    setNewSkillName("");
    setNewSkillIcon("");
    setNewSkillIconFileId("");
    if (skillIconRef.current) skillIconRef.current.value = "";
  };

  const removeSkill = async (index: number, skillObj: Skill) => {
    if (skillObj.iconFileId) {
      await deleteFromImageKit(skillObj.iconFileId);
    }

    if (!aboutId || !skillObj._id) {
      setSkills(skills.filter((_, i) => i !== index));
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getBaseUrl()}/about/${aboutId}/skill/${skillObj._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast("Skill deleted successfully!");
        fetchAbout();
      } else {
        showToast("Failed to delete skill", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TAB 3: SERVICES STATE
  // ==========================================
  const [services, setServices] = useState<Service[]>([]);
  const [serviceForm, setServiceForm] = useState({
    _id: "",
    service: "",
    icon: "",
    iconFileId: "",
    description: "",
  });

  const fetchServices = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/services`);
      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.service || !serviceForm.description) {
      showToast("Service Title and Description are required", "error");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const isEdit = !!serviceForm._id;
      const url = isEdit ? `${getBaseUrl()}/services/${serviceForm._id}` : `${getBaseUrl()}/services`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: serviceForm.service,
          icon: serviceForm.icon,
          iconFileId: serviceForm.iconFileId || undefined,
          description: serviceForm.description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Service updated!" : "Service added!");
        setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
        if (serviceIconRef.current) serviceIconRef.current.value = "";
        setServicesSubTab("preview");
        fetchServices();
      } else {
        showToast(data.error || "Failed to save service", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], serviceForm.iconFileId);
      if (res) {
        setServiceForm((prev) => ({ ...prev, icon: res.url, iconFileId: res.fileId }));
        showToast("Service icon uploaded!");
      }
    }
  };

  const deleteService = async (srv: Service) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setLoading(true);
    try {
      if (srv.iconFileId) {
        await deleteFromImageKit(srv.iconFileId);
      }
      const token = await getToken();
      const res = await fetch(`${getBaseUrl()}/services/${srv._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast("Service deleted!");
        fetchServices();
      } else {
        showToast("Failed to delete service", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TAB 4: PROJECTS STATE
  // ==========================================
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState({
    _id: "",
    projectName: "",
    imageUrl: "",
    imageFileId: "",
    description: "",
    gitHubLink: "",
    liveLink: "",
    techStackRaw: "",
    problemSolve: "",
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/projects`);
      const data = await res.json();
      setProjects(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.projectName || !projectForm.imageUrl || !projectForm.description) {
      showToast("Project Name, Image, and Description are required", "error");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const isEdit = !!projectForm._id;
      const url = isEdit ? `${getBaseUrl()}/projects/${projectForm._id}` : `${getBaseUrl()}/projects`;
      const method = isEdit ? "PATCH" : "POST";
      const techStack = projectForm.techStackRaw
        ? projectForm.techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: projectForm.projectName,
          imageUrl: projectForm.imageUrl,
          imageFileId: projectForm.imageFileId || undefined,
          description: projectForm.description,
          gitHubLink: projectForm.gitHubLink || undefined,
          liveLink: projectForm.liveLink || undefined,
          techStack,
          problemSolve: projectForm.problemSolve || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Project updated!" : "Project added!");
        setProjectForm({
          _id: "",
          projectName: "",
          imageUrl: "",
          imageFileId: "",
          description: "",
          gitHubLink: "",
          liveLink: "",
          techStackRaw: "",
          problemSolve: "",
        });
        if (projectImageRef.current) projectImageRef.current.value = "";
        setProjectsSubTab("preview");
        fetchProjects();
      } else {
        showToast(data.error || "Failed to save project", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadToImageKit(e.target.files[0], projectForm.imageFileId);
      if (res) {
        setProjectForm((prev) => ({ ...prev, imageUrl: res.url, imageFileId: res.fileId }));
        showToast("Project image uploaded!");
      }
    }
  };

  const deleteProject = async (proj: Project) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    try {
      if (proj.imageFileId) {
        await deleteFromImageKit(proj.imageFileId);
      }
      const token = await getToken();
      const res = await fetch(`${getBaseUrl()}/projects/${proj._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast("Project deleted!");
        fetchProjects();
      } else {
        showToast("Failed to delete project", "error");
      }
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHero();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAbout();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-6 py-3.5 rounded-xl border shadow-lg transition-all duration-300 font-semibold ${toast.type === "success"
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-neutral-950/45 backdrop-blur-lg sticky top-0 z-30 w-full animate-fade-in">
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
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-neutral-950/45 border-r border-white/5 backdrop-blur-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full px-6 py-6 justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Dashboard
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-foreground/60 hover:text-foreground p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { id: "hero", label: "Hero & Profile", icon: <User className="w-5 h-5" /> },
                { id: "about", label: "About & Skills", icon: <FileText className="w-5 h-5" /> },
                { id: "services", label: "Services", icon: <Briefcase className="w-5 h-5" /> },
                { id: "projects", label: "Projects/Work", icon: <Code className="w-5 h-5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as "hero" | "about" | "services" | "projects");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02] border border-primary/30"
                      : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-xs text-foreground/45 text-center font-medium">Logged in as Admin</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Main Workspace */}
      <main className="flex-grow md:pl-72 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight hidden md:block">Admin Dashboard</h1>
            <p className="text-foreground/60 mt-1 hidden md:block">Manage all visual aspects of your portfolio website.</p>
          </div>

        {/* LOADING SHIM */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: HERO / PROFILE
            ========================================== */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold">Hero & Profile</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Manage your banner profile information and resume.</p>
              </div>
              <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
                <button
                  type="button"
                  onClick={() => setHeroSubTab("preview")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    heroSubTab === "preview"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroSubTab("edit")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    heroSubTab === "edit"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            {heroSubTab === "preview" ? (
              <div className="max-w-4xl glass-card rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Avatar Container */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/30 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    {heroForm.profilePicUrl ? (
                      <img
                        src={heroForm.profilePicUrl}
                        alt="Profile Avatar"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border border-white/10 relative z-10 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 flex items-center justify-center relative z-10">
                        <span className="text-3xl text-foreground/45 font-bold">
                          {heroForm.firstName ? heroForm.firstName[0] : ""}{heroForm.lastName ? heroForm.lastName[0] : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Text Details */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {heroForm.firstName} {heroForm.lastName}
                      </h2>
                      {heroForm.tagline && (
                        <p className="text-sm font-semibold text-primary mt-1 uppercase tracking-wider">
                          {heroForm.tagline}
                        </p>
                      )}
                    </div>
                    
                    {heroForm.shortIntro && (
                      <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                        {heroForm.shortIntro}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 justify-center md:justify-start text-foreground/70">
                        <Mail className="w-4 h-4 text-primary" />
                        <a href={`mailto:${heroForm.emailId}`} className="hover:text-primary transition-colors">
                          {heroForm.emailId}
                        </a>
                      </div>
                      <div className="flex items-center gap-2.5 justify-center md:justify-start text-foreground/70">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{heroForm.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media & Resume Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-6 gap-4">
                  {/* Social Icons */}
                  <div className="flex items-center gap-3">
                    {socialLinks.length === 0 ? (
                      <span className="text-xs italic text-foreground/45">No social media links configured.</span>
                    ) : (
                      socialLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-neutral-900/40 border border-white/5 flex items-center justify-center hover:bg-primary/20 hover:border-primary/45 hover:scale-110 transition-all shadow-sm"
                          title={link.url}
                        >
                          {link.icon ? (
                            <img src={link.icon} alt="" className="w-4 h-4 object-contain filter invert dark:invert-0" />
                          ) : (
                            <Globe className="w-4 h-4 text-primary" />
                          )}
                        </a>
                      ))
                    )}
                  </div>

                  {/* Resume Download/View Button */}
                  {heroForm.resumeUrl && (
                    <a
                      href={heroForm.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-[1.02] text-xs font-semibold tracking-wide transition-all shadow-sm"
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={saveHero} className="space-y-6 max-w-4xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-xl font-bold border-b border-white/10 pb-3">Edit Profile Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.firstName}
                      onChange={(e) => setHeroForm({ ...heroForm, firstName: e.target.value })}
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.lastName}
                      onChange={(e) => setHeroForm({ ...heroForm, lastName: e.target.value })}
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={heroForm.emailId}
                      onChange={(e) => setHeroForm({ ...heroForm, emailId: e.target.value })}
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={heroForm.phoneNumber}
                      onChange={(e) => setHeroForm({ ...heroForm, phoneNumber: e.target.value })}
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Profile Picture URL</label>
                    <input
                      type="text"
                      value={heroForm.profilePicUrl}
                      onChange={(e) => setHeroForm({ ...heroForm, profilePicUrl: e.target.value })}
                      placeholder="Paste URL here..."
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm mb-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                    <input
                      type="file"
                      ref={profilePicRef}
                      onChange={handleProfilePicChange}
                      accept="image/*"
                      className="w-full text-xs text-foreground/75 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Resume Document URL</label>
                    <input
                      type="text"
                      value={heroForm.resumeUrl}
                      onChange={(e) => setHeroForm({ ...heroForm, resumeUrl: e.target.value })}
                      placeholder="Paste URL here..."
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm mb-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                    <input
                      type="file"
                      ref={resumeFileRef}
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx,image/*"
                      className="w-full text-xs text-foreground/75 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={heroForm.tagline}
                    onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Short Introduction *</label>
                  <textarea
                    required
                    rows={4}
                    value={heroForm.shortIntro}
                    onChange={(e) => setHeroForm({ ...heroForm, shortIntro: e.target.value })}
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>

                {/* Social Links Sub-form */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-bold text-md text-primary">Social Media Links</h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <input
                      type="text"
                      placeholder="Profile URL (e.g. https://github.com/username)"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="flex-1 bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-xs sm:text-sm w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                    <div className="flex-1 w-full flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Icon URL (Optional)"
                        value={newSocialIcon}
                        onChange={(e) => setNewSocialIcon(e.target.value)}
                        className="bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-xs w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                      />
                      <input
                        type="file"
                        ref={socialIconRef}
                        onChange={handleSocialIconChange}
                        accept="image/*"
                        className="text-[10px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSocial}
                      className="bg-primary/20 text-primary border border-primary/30 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/30 transition-all text-sm cursor-pointer hover:scale-105 active:scale-95"
                    >
                      Add
                    </button>
                  </div>

                  {/* Social pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {socialLinks.length === 0 && (
                      <span className="text-xs italic text-foreground/45">No social media links added yet.</span>
                    )}
                    {socialLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/40 border border-white/5 text-xs text-foreground/90 font-medium shadow-sm"
                      >
                        {link.icon ? (
                          <img src={link.icon} alt="" className="w-4 h-4 object-contain filter invert dark:invert-0" />
                        ) : (
                          <Globe className="w-4 h-4 text-primary" />
                        )}
                        <span className="max-w-[150px] truncate">{link.url}</span>
                        <button
                          type="button"
                          onClick={() => removeSocial(idx)}
                          className="text-red-500 hover:text-red-650 font-bold ml-1 cursor-pointer text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm sm:text-base hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all shadow-md active:scale-[0.99] cursor-pointer mt-4"
                >
                  Save Profile Details
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: ABOUT & SKILLS
            ========================================== */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">About & Skills</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Manage your bio summary and interactive tech skills.</p>
              </div>
              <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
                <button
                  type="button"
                  onClick={() => setAboutSubTab("preview")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    aboutSubTab === "preview"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAboutSubTab("edit")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    aboutSubTab === "edit"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            {aboutSubTab === "preview" ? (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                {/* Introduction Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-primary">Biography</h3>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {introduction || "No biography details added yet."}
                  </p>
                </div>

                {/* Skills Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
                  <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-primary">Skills List</h3>
                  {skills.length === 0 ? (
                    <p className="text-xs italic text-foreground/45 text-center py-6">No skills added yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 hover:border-primary/40 hover:scale-[1.02] transition-all group cursor-default shadow-sm"
                        >
                          {skill.icon ? (
                            <img src={skill.icon} alt={skill.skill} className="w-6 h-6 object-contain group-hover:rotate-6 transition-transform duration-300" />
                          ) : (
                            <Cpu className="w-6 h-6 text-primary" />
                          )}
                          <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors truncate">{skill.skill}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={saveAbout} className="space-y-6 max-w-4xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-xl font-bold border-b border-white/10 pb-3">Edit About Me</h2>
                <div>
                  <label className="block text-sm font-semibold mb-1">Bio/Introduction *</label>
                  <textarea
                    required
                    rows={6}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-3 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>

                {/* Skills Sub-form */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-bold text-md text-primary">Skills List</h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <input
                      type="text"
                      placeholder="Skill name (e.g. React)"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="flex-1 bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-xs sm:text-sm w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                    <div className="flex-1 w-full flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Icon Image URL"
                        value={newSkillIcon}
                        onChange={(e) => setNewSkillIcon(e.target.value)}
                        className="bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-xs w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                      />
                      <input
                        type="file"
                        ref={skillIconRef}
                        onChange={handleSkillIconChange}
                        accept="image/*"
                        className="text-[10px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-primary/20 text-primary border border-primary/30 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/30 transition-all text-sm cursor-pointer hover:scale-105 active:scale-95"
                    >
                      Add Skill
                    </button>
                  </div>

                  {/* Skills pills */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {skills.length === 0 && (
                      <span className="text-xs italic text-foreground/45">No skills added yet.</span>
                    )}
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-neutral-900/40 border border-white/5 text-xs text-foreground/90 font-medium hover:border-primary/50 transition-all shadow-sm"
                      >
                        {skill.icon && <img src={skill.icon} alt="" className="w-5 h-5 object-contain" />}
                        <span>{skill.skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx, skill)}
                          className="text-red-500 hover:text-red-650 font-bold ml-1 cursor-pointer text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm sm:text-base hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all shadow-md active:scale-[0.99] cursor-pointer mt-4"
                >
                  Save About & Skills
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: SERVICES
            ========================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold">Services</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Manage and preview the services you offer.</p>
              </div>
              <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
                <button
                  type="button"
                  onClick={() => setServicesSubTab("preview")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    servicesSubTab === "preview"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview ({services.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServicesSubTab("edit");
                    setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
                    if (serviceIconRef.current) serviceIconRef.current.value = "";
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    servicesSubTab === "edit"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{serviceForm._id ? "Modify Service" : "Add New"}</span>
                </button>
              </div>
            </div>

            {servicesSubTab === "edit" ? (
              /* Form */
              <form onSubmit={saveService} className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-5 animate-fade-in mx-auto shadow-xl">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2">
                  {serviceForm._id ? "Modify Service" : "Create New Service"}
                </h3>
                <div>
                  <label className="block text-sm font-semibold mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.service}
                    onChange={(e) => setServiceForm({ ...serviceForm, service: e.target.value })}
                    placeholder="e.g. Web Development"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Icon Image URL</label>
                  <input
                    type="text"
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    placeholder="Paste URL or upload file below"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-sm mb-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                  <input
                    type="file"
                    ref={serviceIconRef}
                    onChange={handleServiceIconChange}
                    accept="image/*"
                    className="w-full text-xs text-foreground/75 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description *</label>
                  <textarea
                    required
                    rows={5}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="Describe what you offer..."
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all shadow-md cursor-pointer"
                  >
                    Save Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
                      if (serviceIconRef.current) serviceIconRef.current.value = "";
                      setServicesSubTab("preview");
                    }}
                    className="px-4 bg-white/5 rounded-xl text-foreground font-semibold hover:bg-white/10 text-xs transition-all cursor-pointer border border-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* List */
              <div className="space-y-4 animate-fade-in">
                {services.length === 0 && (
                  <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-foreground/45 text-sm bg-neutral-900/10">
                    No services added yet. Click &quot;Add New&quot; to create one.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((srv) => (
                    <div
                      key={srv._id}
                      className="p-6 glass-card rounded-2xl flex flex-col hover:border-primary/45 hover:scale-[1.02] transition-all relative group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        {srv.icon ? (
                          <img src={srv.icon} alt="" className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold"><Briefcase className="w-5 h-5" /></div>
                        )}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setServiceForm({
                                _id: srv._id || "",
                                service: srv.service,
                                icon: srv.icon,
                                iconFileId: srv.iconFileId || "",
                                description: srv.description
                              });
                              setServicesSubTab("edit");
                            }}
                            className="px-3 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold hover:bg-primary/20 cursor-pointer flex items-center gap-0.5"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteService(srv)}
                            className="px-3 py-1 text-[11px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-semibold hover:bg-red-500/20 cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors">{srv.service}</h3>
                      <p className="text-xs text-foreground/75 leading-relaxed flex-grow">{srv.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: PROJECTS
            ========================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold">Projects</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Manage and showcase your portfolio works.</p>
              </div>
              <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
                <button
                  type="button"
                  onClick={() => setProjectsSubTab("preview")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    projectsSubTab === "preview"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview ({projects.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectsSubTab("edit");
                    setProjectForm({
                      _id: "",
                      projectName: "",
                      imageUrl: "",
                      imageFileId: "",
                      description: "",
                      gitHubLink: "",
                      liveLink: "",
                      techStackRaw: "",
                      problemSolve: "",
                    });
                    if (projectImageRef.current) projectImageRef.current.value = "";
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    projectsSubTab === "edit"
                      ? "bg-primary text-white shadow-md border border-primary/30"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{projectForm._id ? "Modify Project" : "Add New"}</span>
                </button>
              </div>
            </div>

            {projectsSubTab === "edit" ? (
              /* Form */
              <form onSubmit={saveProject} className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-4 animate-fade-in mx-auto shadow-xl">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2">
                  {projectForm._id ? "Modify Project" : "Add New Project"}
                </h3>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.projectName}
                    onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                    placeholder="e.g. E-Commerce Platform"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Image / Video URL *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.imageUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                    placeholder="Image URL or upload below"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm mb-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                  <input
                    type="file"
                    ref={projectImageRef}
                    onChange={handleProjectImageChange}
                    accept="image/*,video/*"
                    className="w-full text-xs text-foreground/75 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-0.5">GitHub Link</label>
                    <input
                      type="text"
                      value={projectForm.gitHubLink}
                      onChange={(e) => setProjectForm({ ...projectForm, gitHubLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-0.5">Live Demo Link</label>
                    <input
                      type="text"
                      value={projectForm.liveLink}
                      onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={projectForm.techStackRaw}
                    onChange={(e) => setProjectForm({ ...projectForm, techStackRaw: e.target.value })}
                    placeholder="React, Tailwind, Node, MongoDB"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Problem Solved</label>
                  <textarea
                    rows={2}
                    value={projectForm.problemSolve}
                    onChange={(e) => setProjectForm({ ...projectForm, problemSolve: e.target.value })}
                    placeholder="What challenges did this project solve?"
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe your project work..."
                    className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all shadow-md cursor-pointer"
                  >
                    Save Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectForm({
                        _id: "",
                        projectName: "",
                        imageUrl: "",
                        imageFileId: "",
                        description: "",
                        gitHubLink: "",
                        liveLink: "",
                        techStackRaw: "",
                        problemSolve: "",
                      });
                      if (projectImageRef.current) projectImageRef.current.value = "";
                      setProjectsSubTab("preview");
                    }}
                    className="px-4 bg-white/5 rounded-xl text-foreground font-semibold hover:bg-white/10 text-xs transition-all cursor-pointer border border-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* List */
              <div className="space-y-4 animate-fade-in">
                {projects.length === 0 && (
                  <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-foreground/45 text-sm bg-neutral-900/10">
                    No projects added yet. Click &quot;Add New&quot; to showcase a project.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj) => (
                    <div
                      key={proj._id}
                      className="glass-card rounded-2xl flex flex-col hover:border-primary/45 hover:scale-[1.02] transition-all relative group overflow-hidden"
                    >
                      <div className="w-full h-44 bg-neutral-950/40 relative overflow-hidden border-b border-white/5">
                        <img src={proj.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setProjectForm({
                                _id: proj._id || "",
                                projectName: proj.projectName,
                                imageUrl: proj.imageUrl,
                                imageFileId: proj.imageFileId || "",
                                description: proj.description,
                                gitHubLink: proj.gitHubLink || "",
                                liveLink: proj.liveLink || "",
                                techStackRaw: proj.techStack ? proj.techStack.join(", ") : "",
                                problemSolve: proj.problemSolve || "",
                              });
                              setProjectsSubTab("edit");
                            }}
                            className="px-3 py-1.5 text-[10px] bg-primary text-white rounded-full font-bold shadow hover:bg-primary/90 cursor-pointer flex items-center gap-0.5"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(proj)}
                            className="px-3 py-1.5 text-[10px] bg-red-650 text-white rounded-full font-bold shadow hover:bg-red-700 cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-extrabold text-foreground text-base mb-2 truncate group-hover:text-primary transition-colors">{proj.projectName}</h3>
                        <p className="text-xs text-foreground/75 leading-relaxed line-clamp-4 mb-4 flex-grow">{proj.description}</p>
                        {proj.techStack && (
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {proj.techStack.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold">
                                {tag}
                              </span>
                            ))}
                            {proj.techStack.length > 3 && (
                              <span className="text-[10px] text-foreground/45 px-1 py-0.5 font-medium">
                                +{proj.techStack.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
