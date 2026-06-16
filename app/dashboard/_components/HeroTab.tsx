"use client";

import { useState, useRef } from "react";
import { Eye, Edit, Mail, Phone, Globe, FileText } from "lucide-react";
import { SocialMediaLink } from "@/types";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";

export interface HeroFormState {
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNumber: string;
  tagline: string;
  shortIntro: string;
  profilePicUrl: string;
  profilePicFileId: string;
  resumeUrl: string;
  resumeFileId: string;
}

interface HeroTabProps {
  heroForm: HeroFormState;
  setHeroForm: React.Dispatch<React.SetStateAction<HeroFormState>>;
  socialLinks: SocialMediaLink[];
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialMediaLink[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchHero: () => Promise<void>;
}

export default function HeroTab({
  heroForm,
  setHeroForm,
  socialLinks,
  setSocialLinks,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchHero,
}: HeroTabProps) {
  const [subTab, setSubTab] = useState<"preview" | "edit">("preview");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialIcon, setNewSocialIcon] = useState("");
  const [newSocialIconFileId, setNewSocialIconFileId] = useState("");

  const profilePicRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const socialIconRef = useRef<HTMLInputElement>(null);

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      await apiRequest(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            ...heroForm,
            socialMediaLinks: socialLinks,
          }),
        },
        token
      );
      showToast("Profile updated successfully!");
      fetchHero();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], heroForm.profilePicFileId);
        setHeroForm((prev) => ({
          ...prev,
          profilePicUrl: res.url,
          profilePicFileId: res.fileId,
        }));
        showToast("Profile picture uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Image upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], heroForm.resumeFileId);
        setHeroForm((prev) => ({
          ...prev,
          resumeUrl: res.url,
          resumeFileId: res.fileId,
        }));
        showToast("Resume document uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Resume upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], newSocialIconFileId);
        setNewSocialIcon(res.url);
        setNewSocialIconFileId(res.fileId);
        showToast("Social media icon uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Icon upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const addSocial = () => {
    if (!newSocialUrl || !newSocialIcon) {
      showToast("Both Social Link URL and Icon are required", "error");
      return;
    }
    setSocialLinks([
      ...socialLinks,
      { url: newSocialUrl, icon: newSocialIcon, iconFileId: newSocialIconFileId || undefined },
    ]);
    setNewSocialUrl("");
    setNewSocialIcon("");
    setNewSocialIconFileId("");
    if (socialIconRef.current) socialIconRef.current.value = "";
  };

  const removeSocial = async (index: number) => {
    const link = socialLinks[index];
    if (link.iconFileId) {
      setLoading(true);
      try {
        await deleteFromImageKit(link.iconFileId);
      } catch (err) {
        console.error("Failed to delete social icon:", err);
      } finally {
        setLoading(false);
      }
    }
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Hero & Profile</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Manage your banner profile information and resume.</p>
        </div>
        <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
          <button
            type="button"
            onClick={() => setSubTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === "preview"
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("edit")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === "edit"
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      {subTab === "preview" ? (
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
                    {heroForm.firstName ? heroForm.firstName[0] : ""}
                    {heroForm.lastName ? heroForm.lastName[0] : ""}
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
        <form
          onSubmit={saveHero}
          className="space-y-6 max-w-4xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl"
        >
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
            className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm sm:text-base hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all shadow-md active:scale-[0.99] cursor-pointer mt-4"
          >
            Save Profile Details
          </button>
        </form>
      )}
    </div>
  );
}
