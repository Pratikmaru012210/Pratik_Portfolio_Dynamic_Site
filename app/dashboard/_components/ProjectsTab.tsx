"use client";

import { useState, useRef } from "react";
import { Eye, Plus, Edit, Trash2, Cpu, ExternalLink } from "lucide-react";
import { Project } from "@/types";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";

const GithubIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ProjectsTabProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchProjects: () => Promise<void>;
}

export default function ProjectsTab({
  projects,
  setProjects,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchProjects,
}: ProjectsTabProps) {
  const [subTab, setSubTab] = useState<"preview" | "edit">("preview");
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

  const projectImageRef = useRef<HTMLInputElement>(null);

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
      const url = isEdit ? `/projects/${projectForm._id}` : "/projects";
      const method = isEdit ? "PATCH" : "POST";
      const techStack = projectForm.techStackRaw
        ? projectForm.techStackRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await apiRequest(
        url,
        {
          method,
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
        },
        token
      );

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
      setSubTab("preview");
      fetchProjects();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to save project", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], projectForm.imageFileId);
        setProjectForm((prev) => ({ ...prev, imageUrl: res.url, imageFileId: res.fileId }));
        showToast("Project image uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Image upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteProject = async (proj: Project) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    try {
      if (proj.imageFileId) {
        try {
          await deleteFromImageKit(proj.imageFileId);
        } catch (err) {
          console.error("Failed to delete project image from ImageKit:", err);
        }
      }
      const token = await getToken();
      await apiRequest(
        `/projects/${proj._id}`,
        {
          method: "DELETE",
        },
        token
      );
      showToast("Project deleted!");
      fetchProjects();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to delete project", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Manage and showcase your portfolio works.</p>
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
            <span>Preview ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab("edit");
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
              subTab === "edit" && !projectForm._id
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{projectForm._id ? "Modify Project" : "Add New"}</span>
          </button>
        </div>
      </div>

      {subTab === "edit" ? (
        <form
          onSubmit={saveProject}
          className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-4 animate-fade-in mx-auto shadow-xl"
        >
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
              <label className="block text-sm font-semibold mb-0.5">Link</label>
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
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all shadow-md cursor-pointer"
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
                setSubTab("preview");
              }}
              className="px-4 bg-white/5 rounded-xl text-foreground font-semibold hover:bg-white/10 text-xs transition-all cursor-pointer border border-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
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
                  <img
                    src={proj.imageUrl}
                    alt={proj.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                        setSubTab("edit");
                      }}
                      className="px-3 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold hover:bg-primary/20 cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProject(proj)}
                      className="px-3 py-1 text-[11px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-semibold hover:bg-red-500/20 cursor-pointer flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                    {proj.projectName}
                  </h3>
                  <p className="text-xs text-foreground/75 leading-relaxed mb-4 line-clamp-3">
                    {proj.description}
                  </p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                      {proj.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/5 px-2 py-0.5 rounded text-[9px] font-bold text-primary/80 border border-primary/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-auto pt-3 border-t border-white/5">
                    {proj.gitHubLink && (
                      <a
                        href={proj.gitHubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <GithubIcon className="w-3 h-3" />
                        GitHub
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
