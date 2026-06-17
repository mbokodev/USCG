import { SidebarContent } from "./SidebarContent";

export function DesktopSidebar() {
  return (
    <div className="hidden lg:flex lg:flex-col w-64 h-screen bg-white border-r border-neutral-200 overflow-hidden">
      <SidebarContent />
    </div>
  );
}
