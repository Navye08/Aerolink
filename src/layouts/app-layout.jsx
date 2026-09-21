import Header from "@/components/header";
import {Outlet} from "react-router-dom";
import {Zap, Github} from "lucide-react";

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
            <span>Built with React, Vite, Tailwind & Supabase</span>
            <span>•</span>
            <a
              href="https://github.com/piyush-eon/url-shortener"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Tutorial Baseline by RoadsideCoder</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
