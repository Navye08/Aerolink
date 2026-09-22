import Header from "@/components/header";
import AppSidebar from "@/components/app-sidebar";
import MobileNav from "@/components/mobile-nav";
import {Outlet, useLocation} from "react-router-dom";
import {Zap} from "lucide-react";

const AppLayout = () => {
  const location = useLocation();

  // Distinguish between Authenticated Workspace views vs. Public Marketing / Auth views
  const isAppRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/link/");

  // Redirect link gateway (/:id) should have minimal standalone presentation
  const isRedirectRoute =
    !isAppRoute &&
    location.pathname !== "/" &&
    location.pathname !== "/auth";

  if (isRedirectRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-300">
        <main className="flex-1 flex items-center justify-center p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  if (isAppRoute) {
    return (
      <div className="min-h-screen flex bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-300">
        {/* Desktop Left Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Navigation Header (< 1024px) */}
          <MobileNav />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Public Landing & Auth Layout
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern SaaS Minimal Footer */}
      <footer className="border-t border-border-subtle bg-surface/60 py-8 text-xs text-muted-foreground mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white fill-white" />
            </div>
            <span className="font-semibold text-foreground text-xs">AeroLink</span>
            <span className="text-muted-foreground/60">• Modern URL Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>React 18 & Vite</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span className="text-muted-foreground/60">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
