"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Plus, Edit, Trash2, ExternalLink, Settings } from "lucide-react";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";
import { DynamicSection, DynamicRecord } from "@/types";
import { formatExternalLink } from "@/lib/utils";

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

interface DynamicSectionTabProps {
  sectionId: string;
  dynamicSections: DynamicSection[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchDynamicSections: () => Promise<void>;
}

export default function DynamicSectionTab({
  sectionId,
  dynamicSections,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchDynamicSections,
}: DynamicSectionTabProps) {
  const section = dynamicSections.find(s => s._id === sectionId);

  const [subTab, setSubTab] = useState<"preview" | "edit_record" | "edit_section">("preview");

  // Section Meta Form
  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
  });

  // Record Form
  const [recordForm, setRecordForm] = useState({
    _id: "",
    heading: "",
    description: "",
    imageUrl: "",
    imageFileId: "",
    link: "",
    tagsRaw: "",
  });

  const recordImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (section) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSectionForm({
        name: section.name || "",
        description: section.description || "",
      });
    }
  }, [section]);

  if (!section) {
    return <div className="text-center p-12 text-foreground/45">Section not found...</div>;
  }

  const saveSectionMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name) {
      showToast("Section name is required", "error");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      await apiRequest(`/dynamic-sections/${sectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: sectionForm.name,
          description: sectionForm.description,
        })
      }, token);
      showToast("Section settings updated!");
      fetchDynamicSections();
      setSubTab("preview");
    } catch (err) {
      const error = err as Error;
      showToast(error.message || "Failed to update section", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.heading) {
      showToast("Heading is required", "error");
      return;
    }
    setLoading(true);
    try {
      const tags = recordForm.tagsRaw
        ? recordForm.tagsRaw.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const newRecord = {
        _id: recordForm._id ? recordForm._id : undefined,
        heading: recordForm.heading,
        description: recordForm.description,
        imageUrl: recordForm.imageUrl || undefined,
        imageFileId: recordForm.imageFileId || undefined,
        link: recordForm.link || undefined,
        tags,
      };

      let updatedRecords = [...(section.records || [])];

      if (recordForm._id) {
        // Edit existing
        updatedRecords = updatedRecords.map(r => r._id === recordForm._id ? { ...r, ...newRecord } : r);
      } else {
        // Add new
        updatedRecords.push(newRecord);
      }

      const token = await getToken();
      await apiRequest(`/dynamic-sections/${sectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          records: updatedRecords,
        })
      }, token);

      showToast(recordForm._id ? "Record updated!" : "Record added!");
      setSubTab("preview");
      fetchDynamicSections();
    } catch (err) {
      const error = err as Error;
      showToast(error.message || "Failed to save record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], recordForm.imageFileId);
        setRecordForm(prev => ({ ...prev, imageUrl: res.url, imageFileId: res.fileId }));
        showToast("Image uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Image upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setLoading(true);
    try {
      const recordToDelete = section.records.find((r: DynamicRecord) => r._id === recordId);
      if (recordToDelete?.imageFileId) {
        try {
          await deleteFromImageKit(recordToDelete.imageFileId);
        } catch (e) {
          console.error(e);
        }
      }

      const updatedRecords = section.records.filter((r: DynamicRecord) => r._id !== recordId);
      const token = await getToken();
      await apiRequest(`/dynamic-sections/${sectionId}`, {
        method: "PUT",
        body: JSON.stringify({ records: updatedRecords })
      }, token);

      showToast("Record deleted!");
      fetchDynamicSections();
    } catch (err) {
      const error = err as Error;
      showToast(error.message || "Failed to delete record", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">{section.name}</h2>
          <p className="text-xs text-foreground/60 mt-0.5">{section.description || "Manage records in this section."}</p>
        </div>
        <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab("preview")}
            className={`flex items-center whitespace-nowrap gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${subTab === "preview"
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview ({section.records?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab("edit_record");
              setRecordForm({
                _id: "",
                heading: "",
                description: "",
                imageUrl: "",
                imageFileId: "",
                link: "",
                tagsRaw: "",
              });
              if (recordImageRef.current) recordImageRef.current.value = "";
            }}
            className={`flex items-center whitespace-nowrap gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${subTab === "edit_record" && !recordForm._id
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
              }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("edit_section")}
            className={`flex items-center whitespace-nowrap gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${subTab === "edit_section"
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
              }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {subTab === "edit_section" && (
        <form
          onSubmit={saveSectionMeta}
          className="max-w-xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-4 animate-fade-in mx-auto shadow-xl"
        >
          <h3 className="text-lg font-bold border-b border-white/10 pb-2">Section Settings</h3>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Section Name *</label>
            <input
              type="text"
              required
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Section Description (Optional)</label>
            <textarea
              rows={3}
              value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      )}

      {subTab === "edit_record" && (
        <form
          onSubmit={saveRecord}
          className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-4 animate-fade-in mx-auto shadow-xl"
        >
          <h3 className="text-lg font-bold border-b border-white/10 pb-2">
            {recordForm._id ? "Modify Record" : "Add New Record"}
          </h3>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Heading *</label>
            <input
              type="text"
              required
              value={recordForm.heading}
              onChange={(e) => setRecordForm({ ...recordForm, heading: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Image URL (Optional)</label>
            <input
              type="text"
              value={recordForm.imageUrl}
              onChange={(e) => setRecordForm({ ...recordForm, imageUrl: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm mb-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
            <input
              type="file"
              ref={recordImageRef}
              onChange={handleRecordImageChange}
              accept="image/*"
              className="w-full text-xs text-foreground/75 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Link (Optional)</label>
            <input
              type="text"
              value={recordForm.link}
              onChange={(e) => setRecordForm({ ...recordForm, link: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Tags (comma-separated, Optional)</label>
            <input
              type="text"
              value={recordForm.tagsRaw}
              onChange={(e) => setRecordForm({ ...recordForm, tagsRaw: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-0.5">Description (Optional)</label>
            <textarea
              rows={4}
              value={recordForm.description}
              onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              Save Record
            </button>
            <button
              type="button"
              onClick={() => setSubTab("preview")}
              className="px-4 bg-white/5 rounded-xl text-foreground font-semibold hover:bg-white/10 text-xs transition-all cursor-pointer border border-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {subTab === "preview" && (
        <div className="space-y-4 animate-fade-in">
          {(!section.records || section.records.length === 0) && (
            <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-foreground/45 text-sm bg-neutral-900/10">
              No records added yet. Click &quot;Add Record&quot; to begin.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.records?.map((record: DynamicRecord) => (
              <div
                key={record._id}
                className="glass-card rounded-2xl flex flex-col hover:border-primary/45 hover:scale-[1.02] transition-all relative group overflow-hidden"
              >
                {record.imageUrl && (
                  <div className="w-full h-44 bg-neutral-950/40 relative overflow-hidden border-b border-white/5">
                    <img
                      src={record.imageUrl}
                      alt={record.heading}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => {
                      setRecordForm({
                        _id: record._id || "",
                        heading: record.heading,
                        description: record.description || "",
                        imageUrl: record.imageUrl || "",
                        imageFileId: record.imageFileId || "",
                        link: record.link || "",
                        tagsRaw: record.tags ? record.tags.join(", ") : "",
                      });
                      setSubTab("edit_record");
                    }}
                    className="px-3 py-1 text-[11px] bg-primary/90 text-white border border-primary rounded-full font-semibold hover:bg-primary cursor-pointer flex items-center gap-0.5 shadow-md"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => record._id && deleteRecord(record._id)}
                    className="px-3 py-1 text-[11px] bg-red-500/90 text-white border border-red-500 rounded-full font-semibold hover:bg-red-500 cursor-pointer flex items-center gap-0.5 shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>

                <div className={`p-5 flex flex-col flex-grow ${!record.imageUrl ? "mt-4" : ""}`}>
                  <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                    {record.heading}
                  </h3>
                  {record.description && (
                    <p className="text-xs text-foreground/75 leading-relaxed mb-4 line-clamp-3">
                      {record.description}
                    </p>
                  )}
                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                      {record.tags.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-primary/5 px-2 py-0.5 rounded text-[9px] font-bold text-primary/80 border border-primary/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {record.link && (
                    <div className="flex gap-3 mt-auto pt-3 border-t border-white/5">
                      <a
                        href={formatExternalLink(record.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
