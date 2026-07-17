"use client";

import React, { useState, useRef } from "react";
import { Eye, Plus, FileText, Edit, Trash2, ExternalLink, Download } from "lucide-react";
import { Cheatsheet } from "@/types";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";

interface CheatsheetsTabProps {
  cheatsheets: Cheatsheet[];
  setCheatsheets: React.Dispatch<React.SetStateAction<Cheatsheet[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchCheatsheets: () => Promise<void>;
}

export default function CheatsheetsTab({
  cheatsheets,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchCheatsheets,
}: CheatsheetsTabProps) {
  const [subTab, setSubTab] = useState<"preview" | "edit">("preview");
  const [cheatsheetForm, setCheatsheetForm] = useState({
    _id: "",
    title: "",
    pdfUrl: "",
    pdfFileId: "",
  });

  const pdfInputRef = useRef<HTMLInputElement>(null);

  const saveCheatsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheatsheetForm.title || !cheatsheetForm.pdfUrl || !cheatsheetForm.pdfFileId) {
      showToast("Cheatsheet Title and PDF file are required", "error");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const isEdit = !!cheatsheetForm._id;
      const url = isEdit ? `/cheatsheets/${cheatsheetForm._id}` : "/cheatsheets";
      const method = isEdit ? "PATCH" : "POST";

      await apiRequest(
        url,
        {
          method,
          body: JSON.stringify({
            title: cheatsheetForm.title,
            pdfUrl: cheatsheetForm.pdfUrl,
            pdfFileId: cheatsheetForm.pdfFileId,
          }),
        },
        token
      );

      showToast(isEdit ? "Cheatsheet updated!" : "Cheatsheet added!");
      setCheatsheetForm({ _id: "", title: "", pdfUrl: "", pdfFileId: "" });
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setSubTab("preview");
      fetchCheatsheets();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to save cheatsheet", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        showToast("Only PDF documents are allowed", "error");
        if (pdfInputRef.current) pdfInputRef.current.value = "";
        return;
      }
      setLoading(true);
      try {
        const res = await uploadToImageKit(file, cheatsheetForm.pdfFileId || undefined);
        setCheatsheetForm((prev) => ({
          ...prev,
          pdfUrl: res.url,
          pdfFileId: res.fileId,
        }));
        showToast("PDF document uploaded successfully!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "PDF upload failed", "error");
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteCheatsheet = async (sheet: Cheatsheet) => {
    if (!confirm("Are you sure you want to delete this cheatsheet?")) return;
    setLoading(true);
    try {
      if (sheet.pdfFileId) {
        try {
          await deleteFromImageKit(sheet.pdfFileId);
        } catch (err) {
          console.error("Failed to delete PDF file from ImageKit:", err);
        }
      }
      const token = await getToken();
      await apiRequest(
        `/cheatsheets/${sheet._id}`,
        {
          method: "DELETE",
        },
        token
      );
      showToast("Cheatsheet deleted successfully!");
      fetchCheatsheets();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to delete cheatsheet", "error");
    } finally {
      setLoading(false);
    }
  };

  const forceDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = title.toLowerCase().endsWith(".pdf") ? title : `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const downloadUrl = url.includes("?")
        ? `${url}&ik-attachment=true`
        : `${url}?ik-attachment=true`;
      window.open(downloadUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Cheatsheets</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Manage reference sheets and PDF files.</p>
        </div>
        <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5 backdrop-blur-md w-fit shadow-inner">
          <button
            type="button"
            onClick={() => setSubTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${subTab === "preview"
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview ({cheatsheets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab("edit");
              setCheatsheetForm({ _id: "", title: "", pdfUrl: "", pdfFileId: "" });
              if (pdfInputRef.current) pdfInputRef.current.value = "";
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${subTab === "edit" && !cheatsheetForm._id
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
              }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{cheatsheetForm._id ? "Modify Cheatsheet" : "Add New"}</span>
          </button>
        </div>
      </div>

      {subTab === "edit" ? (
        <form
          onSubmit={saveCheatsheet}
          className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-5 animate-fade-in mx-auto shadow-xl"
        >
          <h3 className="text-lg font-bold border-b border-white/10 pb-2">
            {cheatsheetForm._id ? "Modify Cheatsheet" : "Create New Cheatsheet"}
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-1">Cheatsheet Title *</label>
            <input
              type="text"
              required
              value={cheatsheetForm.title}
              onChange={(e) => setCheatsheetForm({ ...cheatsheetForm, title: e.target.value })}
              placeholder="e.g. FastAPI & Pydantic Validation Guide"
              className="w-full bg-neutral-950/40 text-foreground px-4 py-2.5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Upload PDF Cheatsheet *</label>
            {cheatsheetForm.pdfUrl && (
              <div className="flex items-center gap-2 text-xs bg-primary/10 border border-primary/20 rounded-xl p-3 mb-3 text-primary truncate">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-grow">{cheatsheetForm.pdfUrl}</span>
              </div>
            )}
            <input
              type="file"
              ref={pdfInputRef}
              required={!cheatsheetForm._id && !cheatsheetForm.pdfUrl}
              onChange={handlePdfFileChange}
              accept="application/pdf"
              className="w-full text-xs text-foreground/75 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:cursor-pointer"
            />
            <p className="text-[10px] text-foreground/40 mt-1.5">Only PDF documents are allowed.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !cheatsheetForm.pdfUrl}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Cheatsheet
            </button>
            <button
              type="button"
              onClick={() => {
                setCheatsheetForm({ _id: "", title: "", pdfUrl: "", pdfFileId: "" });
                if (pdfInputRef.current) pdfInputRef.current.value = "";
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
          {cheatsheets.length === 0 && (
            <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-foreground/45 text-sm bg-neutral-900/10">
              No cheatsheets added yet. Click &quot;Add New&quot; to upload one.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cheatsheets.map((sheet) => (
              <div
                key={sheet._id}
                className="p-6 glossy-glass-card rounded-2xl flex flex-col hover:border-primary/45 hover:scale-[1.02] transition-all relative group min-h-[160px]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setCheatsheetForm({
                          _id: sheet._id || "",
                          title: sheet.title,
                          pdfUrl: sheet.pdfUrl,
                          pdfFileId: sheet.pdfFileId || "",
                        });
                        setSubTab("edit");
                      }}
                      className="px-3 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold hover:bg-primary/20 cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCheatsheet(sheet)}
                      className="px-3 py-1 text-[11px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-semibold hover:bg-red-500/20 cursor-pointer flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
                <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors flex-grow">
                  {sheet.title}
                </h3>
                <div className="flex items-center gap-3 pt-3 mt-auto border-t border-white/5">
                  <button
                    onClick={() => window.open(sheet.pdfUrl, "_blank")}
                    className="text-xs text-foreground/60 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>
                  <button
                    onClick={() => forceDownload(sheet.pdfUrl, sheet.title)}
                    className="text-xs text-foreground/60 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
