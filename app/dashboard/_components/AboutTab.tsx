"use client";

import { useState, useRef } from "react";
import { Eye, Edit, Cpu } from "lucide-react";
import { Skill } from "@/types";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";

interface AboutTabProps {
  aboutId: string;
  setAboutId: (id: string) => void;
  introduction: string;
  setIntroduction: (intro: string) => void;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchAbout: () => Promise<void>;
}

export default function AboutTab({
  aboutId,
  setAboutId,
  introduction,
  setIntroduction,
  skills,
  setSkills,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchAbout,
}: AboutTabProps) {
  const [subTab, setSubTab] = useState<"preview" | "edit">("preview");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillIcon, setNewSkillIcon] = useState("");
  const [newSkillIconFileId, setNewSkillIconFileId] = useState("");

  const skillIconRef = useRef<HTMLInputElement>(null);

  const saveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const method = aboutId ? "PUT" : "POST";
      const url = aboutId ? `/about/${aboutId}` : "/about";
      await apiRequest(
        url,
        {
          method,
          body: JSON.stringify({ introduction, skills }),
        },
        token
      );
      showToast("About information updated successfully!");
      fetchAbout();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to save details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], newSkillIconFileId);
        setNewSkillIcon(res.url);
        setNewSkillIconFileId(res.fileId);
        showToast("Skill icon uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Skill icon upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const addSkill = () => {
    if (!newSkillName || !newSkillIcon) {
      showToast("Skill Name and Icon are required", "error");
      return;
    }
    setSkills([
      ...skills,
      { skill: newSkillName, icon: newSkillIcon, iconFileId: newSkillIconFileId || undefined },
    ]);
    setNewSkillName("");
    setNewSkillIcon("");
    setNewSkillIconFileId("");
    if (skillIconRef.current) skillIconRef.current.value = "";
  };

  const removeSkill = async (index: number, skillObj: Skill) => {
    if (skillObj.iconFileId) {
      setLoading(true);
      try {
        await deleteFromImageKit(skillObj.iconFileId);
      } catch (err) {
        console.error("Failed to delete skill icon from ImageKit:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!aboutId || !skillObj._id) {
      setSkills(skills.filter((_, i) => i !== index));
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await apiRequest(
        `/about/${aboutId}/skill/${skillObj._id}`,
        {
          method: "DELETE",
        },
        token
      );
      showToast("Skill deleted successfully!");
      fetchAbout();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to delete skill", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">About & Skills</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Manage your bio summary and interactive tech skills.</p>
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
                      <img
                        src={skill.icon}
                        alt={skill.skill}
                        className="w-6 h-6 object-contain group-hover:rotate-6 transition-transform duration-300"
                      />
                    ) : (
                      <Cpu className="w-6 h-6 text-primary" />
                    )}
                    <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors truncate">
                      {skill.skill}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={saveAbout}
          className="space-y-6 max-w-4xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl"
        >
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
            className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm sm:text-base hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all shadow-md active:scale-[0.99] cursor-pointer mt-4"
          >
            Save About & Skills
          </button>
        </form>
      )}
    </div>
  );
}
