import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { TopNav } from "./TopNav";
import { AppSidebar } from "./AppSidebar";
import { AppBanner } from "./AppBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-30">
            <TopNav />
          </div>
          <main className="flex-1 overflow-auto pb-20 md:pb-6 data-fullscreen:overflow-hidden data-fullscreen:p-0 data-fullscreen:pb-0">
            <AppBanner />
            <div className="px-4 md:px-6 pb-4 md:pb-6 in-data-fullscreen:p-0 in-data-fullscreen:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
