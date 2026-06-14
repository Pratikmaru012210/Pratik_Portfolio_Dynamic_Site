"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";

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
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
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
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10">
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

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-foreground/60 mt-1">Manage all visual aspects of your portfolio website.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/40 gap-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "hero", label: "Hero & Profile" },
            { id: "about", label: "About & Skills" },
            { id: "services", label: "Services" },
            { id: "projects", label: "Projects/Work" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "hero" | "about" | "services" | "projects")}
              className={`pb-3 text-sm sm:text-base font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING SHIM */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-xs">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid"></div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: HERO / PROFILE
            ========================================== */}
        {activeTab === "hero" && (
          <form onSubmit={saveHero} className="space-y-6 max-w-4xl bg-primary/5 border border-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold border-b border-border/20 pb-3">Edit Profile Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={heroForm.firstName}
                  onChange={(e) => setHeroForm({ ...heroForm, firstName: e.target.value })}
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={heroForm.lastName}
                  onChange={(e) => setHeroForm({ ...heroForm, lastName: e.target.value })}
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
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
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={heroForm.phoneNumber}
                  onChange={(e) => setHeroForm({ ...heroForm, phoneNumber: e.target.value })}
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
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
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm mb-2"
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
                  className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm mb-2"
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
                className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Short Introduction *</label>
              <textarea
                required
                rows={4}
                value={heroForm.shortIntro}
                onChange={(e) => setHeroForm({ ...heroForm, shortIntro: e.target.value })}
                className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
              />
            </div>

            {/* Social Links Sub-form */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h3 className="font-bold text-md text-primary">Social Media Links</h3>
              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                <input
                  type="text"
                  placeholder="Profile URL (e.g. https://github.com/username)"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  className="flex-1 bg-background text-foreground px-4 py-2.5 border border-border/60 rounded-xl text-xs sm:text-sm w-full"
                />
                <div className="flex-1 w-full flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Icon URL (Optional)"
                    value={newSocialIcon}
                    onChange={(e) => setNewSocialIcon(e.target.value)}
                    className="bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-xs"
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
                  className="bg-primary/20 text-primary border border-primary/30 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/30 transition-all text-sm cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Social pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {socialLinks.length === 0 && (
                  <span className="text-xs italic text-foreground/50">No social media links added yet.</span>
                )}
                {socialLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border/40 text-xs text-foreground/90 font-medium"
                  >
                    {link.icon && <img src={link.icon} alt="" className="w-4 h-4 object-contain filter invert dark:invert-0" />}
                    <span className="max-w-[150px] truncate">{link.url}</span>
                    <button
                      type="button"
                      onClick={() => removeSocial(idx)}
                      className="text-red-500 hover:text-red-650 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background rounded-xl py-3 font-bold text-sm sm:text-base hover:bg-primary/95 transition-all shadow-md active:scale-98 cursor-pointer mt-4"
            >
              Save Profile Details
            </button>
          </form>
        )}

        {/* ==========================================
            TAB CONTENT: ABOUT & SKILLS
            ========================================== */}
        {activeTab === "about" && (
          <form onSubmit={saveAbout} className="space-y-6 max-w-4xl bg-primary/5 border border-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold border-b border-border/20 pb-3">Edit About Me</h2>
            <div>
              <label className="block text-sm font-semibold mb-1">Bio/Introduction *</label>
              <textarea
                required
                rows={6}
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 border border-border/60 rounded-xl text-sm"
              />
            </div>

            {/* Skills Sub-form */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h3 className="font-bold text-md text-primary">Skills List</h3>
              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                <input
                  type="text"
                  placeholder="Skill name (e.g. React)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-background text-foreground px-4 py-2.5 border border-border/60 rounded-xl text-xs sm:text-sm w-full"
                />
                <div className="flex-1 w-full flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Icon Image URL"
                    value={newSkillIcon}
                    onChange={(e) => setNewSkillIcon(e.target.value)}
                    className="bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-xs w-full"
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
                  className="bg-primary/20 text-primary border border-primary/30 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/30 transition-all text-sm cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              {/* Skills pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {skills.length === 0 && (
                  <span className="text-xs italic text-foreground/50">No skills added yet.</span>
                )}
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-background border border-border/60 text-xs text-foreground/90 font-medium hover:border-primary/50 transition-all"
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
              className="w-full bg-primary text-background rounded-xl py-3 font-bold text-sm sm:text-base hover:bg-primary/95 transition-all shadow-md active:scale-98 cursor-pointer mt-4"
            >
              Save About & Skills
            </button>
          </form>
        )}

        {/* ==========================================
            TAB CONTENT: SERVICES
            ========================================== */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form */}
            <form onSubmit={saveService} className="lg:col-span-1 space-y-5 bg-primary/5 border border-border/60 rounded-2xl p-6">
              <h2 className="text-lg font-bold border-b border-border/20 pb-2">
                {serviceForm._id ? "Edit Service" : "Add Service"}
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.service}
                  onChange={(e) => setServiceForm({ ...serviceForm, service: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="w-full bg-background text-foreground px-4 py-2.5 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Icon Image URL</label>
                <input
                  type="text"
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  placeholder="Paste URL or upload file below"
                  className="w-full bg-background text-foreground px-4 py-2.5 border border-border/60 rounded-xl text-sm mb-2"
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
                  rows={4}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe what you offer..."
                  className="w-full bg-background text-foreground px-4 py-2.5 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-background rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Save Service
                </button>
                {serviceForm._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
                      if (serviceIconRef.current) serviceIconRef.current.value = "";
                    }}
                    className="px-4 bg-foreground/10 rounded-xl text-foreground font-semibold hover:bg-foreground/20 text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold">Existing Services ({services.length})</h2>
              {services.length === 0 && (
                <div className="text-center p-8 border border-dashed border-border/50 rounded-2xl text-foreground/50 text-sm">
                  No services added yet. Use the form to create one.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv._id}
                    className="p-5 bg-background border border-border/60 rounded-xl flex flex-col hover:border-primary/40 transition-all relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {srv.icon && <img src={srv.icon} alt="" className="w-8 h-8 object-contain" />}
                      <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setServiceForm({
                            _id: srv._id || "",
                            service: srv.service,
                            icon: srv.icon,
                            iconFileId: srv.iconFileId || "",
                            description: srv.description
                          })}
                          className="px-2.5 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold hover:bg-primary/20 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteService(srv)}
                          className="px-2.5 py-1 text-[11px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-semibold hover:bg-red-500/20 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">{srv.service}</h3>
                    <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed">{srv.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT: PROJECTS
            ========================================== */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form */}
            <form onSubmit={saveProject} className="lg:col-span-1 space-y-4 bg-primary/5 border border-border/60 rounded-2xl p-6">
              <h2 className="text-lg font-bold border-b border-border/20 pb-2">
                {projectForm._id ? "Edit Project" : "Add Project"}
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-0.5">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                  placeholder="e.g. E-Commerce Platform"
                  className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-sm"
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
                  className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-sm mb-2"
                />
                <input
                  type="file"
                  ref={projectImageRef}
                  onChange={handleProjectImageChange}
                  accept="image/*,video/*"
                  className="w-full text-xs text-foreground/75 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-0.5">GitHub Link</label>
                  <input
                    type="text"
                    value={projectForm.gitHubLink}
                    onChange={(e) => setProjectForm({ ...projectForm, gitHubLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-0.5">Live Demo Link</label>
                  <input
                    type="text"
                    value={projectForm.liveLink}
                    onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-xs sm:text-sm"
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
                  className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-0.5">Problem Solved</label>
                <textarea
                  rows={2}
                  value={projectForm.problemSolve}
                  onChange={(e) => setProjectForm({ ...projectForm, problemSolve: e.target.value })}
                  placeholder="What challenges did this project solve?"
                  className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-0.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe your project work..."
                  className="w-full bg-background text-foreground px-4 py-2 border border-border/60 rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-background rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Save Project
                </button>
                {projectForm._id && (
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
                    }}
                    className="px-4 bg-foreground/10 rounded-xl text-foreground font-semibold hover:bg-foreground/20 text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold">Existing Projects ({projects.length})</h2>
              {projects.length === 0 && (
                <div className="text-center p-8 border border-dashed border-border/50 rounded-2xl text-foreground/50 text-sm">
                  No projects added yet. Use the form to create one.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    className="p-5 bg-background border border-border/60 rounded-xl flex flex-col hover:border-primary/40 transition-all relative group"
                  >
                    <div className="w-full h-32 bg-foreground/5 rounded-lg overflow-hidden mb-3">
                      <img src={proj.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{proj.projectName}</h3>
                      <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
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
                            })
                          }
                          className="px-2.5 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold hover:bg-primary/20 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(proj)}
                          className="px-2.5 py-1 text-[11px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-semibold hover:bg-red-500/20 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed mb-3">{proj.description}</p>
                    {proj.techStack && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {proj.techStack.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                        {proj.techStack.length > 3 && (
                          <span className="text-[10px] text-foreground/50 px-1 py-0.5 font-medium">
                            +{proj.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
