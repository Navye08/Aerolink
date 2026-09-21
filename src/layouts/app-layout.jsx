import Header from "@/components/header";
import {Outlet} from "react-router-dom";
import {Zap} from "lucide-react";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Modern SaaS Footer */}
      <footer className="border-t border-gray-800 bg-gray-950/60 py-10 mt-16 text-xs text-gray-400">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-white text-sm">AeroLink</span>
            <span className="text-gray-500">• Production URL Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <span>Engineered with React 18, Vite, Tailwind & Supabase</span>
            <span>•</span>
            <span className="text-gray-500">MIT Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
