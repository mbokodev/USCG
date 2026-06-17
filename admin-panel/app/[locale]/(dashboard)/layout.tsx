"use client";

import { Sidebar, Header } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will be handled by auth middleware
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden">
      {/* Sidebar - fixed */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Header - fixed */}
        <Header />

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-hidden p-6 flex flex-col">
          <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
