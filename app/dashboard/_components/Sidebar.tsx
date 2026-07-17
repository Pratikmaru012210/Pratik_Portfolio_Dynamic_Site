"use client";

import { User, FileText, Briefcase, Code, X as XIcon, Folder, Trash2, ArrowUp, ArrowDown, Plus, FileDown } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { DynamicSection } from "@/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  dynamicSections?: DynamicSection[];
  fetchDynamicSections?: () => void;
  getToken?: () => Promise<string | null>;
  showToast?: (msg: string, type?: "success" | "error") => void;
  setLoading?: (loading: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  dynamicSections = [],
  fetchDynamicSections,
  getToken,
  showToast,
  setLoading,
}: SidebarProps) {
  const tabs = [
    { id: "hero", label: "Hero & Profile", icon: <User className="w-5 h-5" /> },
    { id: "about", label: "About & Skills", icon: <FileText className="w-5 h-5" /> },
    { id: "services", label: "Services", icon: <Briefcase className="w-5 h-5" /> },
    { id: "projects", label: "Projects/Work", icon: <Code className="w-5 h-5" /> },
    { id: "cheatsheets", label: "Cheatsheets", icon: <FileDown className="w-5 h-5" /> },
    { id: "users", label: "User Management", icon: <User className="w-5 h-5" /> },
  ] as const;

  const handleCreateSection = async () => {
    if (!getToken || !showToast || !fetchDynamicSections || !setLoading) return;
    const name = prompt("Enter section name:");
    if (!name) return;
    setLoading(true);
    try {
      const token = await getToken();
      await apiRequest("/dynamic-sections", {
        method: "POST",
        body: JSON.stringify({ name, description: "", order: dynamicSections.length })
      }, token);
      showToast("Section created!");
      fetchDynamicSections();
    } catch (err) {
      showToast("Failed to create section", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!getToken || !showToast || !fetchDynamicSections || !setLoading) return;
    if (!confirm("Are you sure you want to delete this section? All records will be lost.")) return;
    setLoading(true);
    try {
      const token = await getToken();
      await apiRequest(`/dynamic-sections/${id}`, { method: "DELETE" }, token);
      showToast("Section deleted!");
      fetchDynamicSections();
      if (activeTab === `dynamic-${id}`) {
        setActiveTab("hero");
      }
    } catch (err) {
      showToast("Failed to delete section", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!getToken || !showToast || !fetchDynamicSections || !setLoading) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === dynamicSections.length - 1) return;

    setLoading(true);
    try {
      const token = await getToken();
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      const newSections = [...dynamicSections];
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;

      await Promise.all(newSections.map((sec, i) =>
        apiRequest(`/dynamic-sections/${sec._id}`, { method: 'PUT', body: JSON.stringify({ order: i }) }, token)
      ));

      fetchDynamicSections();
    } catch (err) {
      showToast("Failed to reorder sections", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-neutral-950/45 border-r border-white/5 backdrop-blur-lg transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto custom-scrollbar ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col min-h-full px-6 py-6 justify-between">
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
              <div className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2 ml-1">Core Sections</div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 cursor-pointer ${activeTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02] border border-primary/30"
                    : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}

              <div className="mt-8 mb-2 flex items-center justify-between ml-1 pt-4 border-t border-white/5">
                <div className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Dynamic Sections</div>
              </div>

               {dynamicSections.map((sec, index) => (
                <div
                  key={sec._id}
                  onClick={() => {
                    setActiveTab(`dynamic-${sec._id}`);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex flex-col px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 cursor-pointer border ${activeTab === `dynamic-${sec._id}`
                    ? "bg-primary/20 text-white shadow-md shadow-primary/10 scale-[1.02] border-primary/50"
                    : "bg-neutral-900/50 text-foreground/75 border-white/5 hover:bg-white/10 hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 truncate">
                      <Folder className="w-4 h-4 flex-shrink-0 text-primary/70" />
                      <span className="truncate">{sec.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleMoveSection(index, 'up', e)}
                          disabled={index === 0}
                          className="hover:text-primary disabled:opacity-30 disabled:hover:text-inherit"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleMoveSection(index, 'down', e)}
                          disabled={index === dynamicSections.length - 1}
                          className="hover:text-primary disabled:opacity-30 disabled:hover:text-inherit"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => sec._id && handleDeleteSection(sec._id, e)}
                        className="p-1 hover:text-red-500 hover:bg-red-500/10 rounded ml-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleCreateSection}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl text-sm font-bold border-2 border-dashed border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary hover:border-primary/60 transition-all duration-250 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Section
              </button>
            </nav>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="text-xs text-foreground/45 text-center font-medium">Logged in as Admin</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
