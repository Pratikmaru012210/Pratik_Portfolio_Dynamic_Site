"use client";

import { useState, useRef } from "react";
import { Eye, Plus, Briefcase, Edit, Trash2 } from "lucide-react";
import { Service } from "@/types";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { apiRequest } from "@/lib/api";

interface ServicesTabProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
  fetchServices: () => Promise<void>;
}

export default function ServicesTab({
  services,
  setServices,
  loading,
  setLoading,
  showToast,
  getToken,
  fetchServices,
}: ServicesTabProps) {
  const [subTab, setSubTab] = useState<"preview" | "edit">("preview");
  const [serviceForm, setServiceForm] = useState({
    _id: "",
    service: "",
    icon: "",
    iconFileId: "",
    description: "",
  });

  const serviceIconRef = useRef<HTMLInputElement>(null);

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
      const url = isEdit ? `/services/${serviceForm._id}` : "/services";
      const method = isEdit ? "PATCH" : "POST";
      await apiRequest(
        url,
        {
          method,
          body: JSON.stringify({
            service: serviceForm.service,
            icon: serviceForm.icon,
            iconFileId: serviceForm.iconFileId || undefined,
            description: serviceForm.description,
          }),
        },
        token
      );

      showToast(isEdit ? "Service updated!" : "Service added!");
      setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
      if (serviceIconRef.current) serviceIconRef.current.value = "";
      setSubTab("preview");
      fetchServices();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to save service", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadToImageKit(e.target.files[0], serviceForm.iconFileId);
        setServiceForm((prev) => ({ ...prev, icon: res.url, iconFileId: res.fileId }));
        showToast("Service icon uploaded!");
      } catch (err) {
        const error = err as Error;
        showToast(error.message || "Icon upload failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteService = async (srv: Service) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setLoading(true);
    try {
      if (srv.iconFileId) {
        try {
          await deleteFromImageKit(srv.iconFileId);
        } catch (err) {
          console.error("Failed to delete icon image from ImageKit:", err);
        }
      }
      const token = await getToken();
      await apiRequest(
        `/services/${srv._id}`,
        {
          method: "DELETE",
        },
        token
      );
      showToast("Service deleted!");
      fetchServices();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || "Failed to delete service", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Services</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Manage and preview the services you offer.</p>
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
            <span>Preview ({services.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab("edit");
              setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
              if (serviceIconRef.current) serviceIconRef.current.value = "";
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === "edit" && !serviceForm._id
                ? "bg-primary text-white shadow-md border border-primary/30"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{serviceForm._id ? "Modify Service" : "Add New"}</span>
          </button>
        </div>
      </div>

      {subTab === "edit" ? (
        <form
          onSubmit={saveService}
          className="max-w-2xl bg-neutral-900/35 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-5 animate-fade-in mx-auto shadow-xl"
        >
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
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm hover:bg-primary/95 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all shadow-md cursor-pointer"
            >
              Save Service
            </button>
            <button
              type="button"
              onClick={() => {
                setServiceForm({ _id: "", service: "", icon: "", iconFileId: "", description: "" });
                if (serviceIconRef.current) serviceIconRef.current.value = "";
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
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setServiceForm({
                          _id: srv._id || "",
                          service: srv.service,
                          icon: srv.icon,
                          iconFileId: srv.iconFileId || "",
                          description: srv.description,
                        });
                        setSubTab("edit");
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
                <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                  {srv.service}
                </h3>
                <p className="text-xs text-foreground/75 leading-relaxed flex-grow">{srv.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
