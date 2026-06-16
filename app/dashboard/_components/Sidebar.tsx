"use client";

import { User, FileText, Briefcase, Code, X as XIcon } from "lucide-react";

interface SidebarProps {
  activeTab: "hero" | "about" | "services" | "projects" | "users";
  setActiveTab: (tab: "hero" | "about" | "services" | "projects" | "users") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) {
  const tabs = [
    { id: "hero", label: "Hero & Profile", icon: <User className="w-5 h-5" /> },
    { id: "about", label: "About & Skills", icon: <FileText className="w-5 h-5" /> },
    { id: "services", label: "Services", icon: <Briefcase className="w-5 h-5" /> },
    { id: "projects", label: "Projects/Work", icon: <Code className="w-5 h-5" /> },
    { id: "users", label: "User Management", icon: <User className="w-5 h-5" /> },
  ] as const;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-neutral-950/45 border-r border-white/5 backdrop-blur-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
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
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
