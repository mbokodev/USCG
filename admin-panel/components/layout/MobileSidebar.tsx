"use client";

import { useSidebar } from "@/context/SidebarContext";
import { SidebarContent } from "./SidebarContent";
import { X } from "lucide-react";
import { useEffect } from "react";

export function MobileSidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen, closeSidebar]);

  if (!isSidebarOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent />
      </div>
    </div>
  );
}
