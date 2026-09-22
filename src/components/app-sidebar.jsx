import {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Plus,
  Zap,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {logout} from "@/services/authService";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";
import {isMockMode} from "@/db/supabase";
import LinkModal from "@/components/link-modal";

export default function AppSidebar({onCreateSuccess}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();
  const {fn: fnLogout} = useFetch(logout);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = async () => {
    await fnLogout();
    fetchUser();
    navigate("/");
  };

  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      to: "/dashboard",
      active: location.pathname === "/dashboard" && !location.hash,
    },
    {
      label: "My Links",
      icon: Link2,
      to: "/dashboard#links",
      active: location.pathname === "/dashboard" && location.hash === "#links",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      to: "/dashboard#analytics",
      active: location.pathname === "/dashboard" && location.hash === "#analytics",
    },
  ];

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 border-r border-border-subtle bg-surface/90 backdrop-blur-md h-screen sticky top-0 z-30 select-none p-4 justify-between">
        {/* Top: Logo & Navigation */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  AeroLink
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono border border-primary/20">
                    PRO
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Create Link Button */}
          <div className="px-1">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-primary hover:bg-blue-500 text-white font-medium text-xs h-9 gap-2 shadow-sm shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              Create Link
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Workspace
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.active
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/70"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      item.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom: Demo Badge & User Profile Menu */}
        <div className="space-y-3 pt-4 border-t border-border-subtle">
          {isMockMode && (
            <div className="px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Demo Mode Active</span>
            </div>
          )}

          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-elevated/80 transition-colors text-left group focus:outline-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-7 h-7 rounded-md ring-1 ring-border-subtle">
                    <AvatarImage
                      src={user?.user_metadata?.profile_pic || "/logo.png"}
                      alt={user?.user_metadata?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs rounded-md">
                      {user?.email?.slice(0, 2)?.toUpperCase() || "AL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-foreground truncate leading-snug">
                      {user?.user_metadata?.name || "Account"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-none">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              className="w-56 bg-surface-elevated border-border-strong shadow-xl p-1 mb-2"
            >
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <p className="text-xs font-semibold text-foreground">
                  {user?.user_metadata?.name || "Account"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-subtle" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Global Link Creation Modal triggered from Sidebar */}
      {showCreateModal && (
        <LinkModal
          isOpen={showCreateModal}
          onOpenChange={setShowCreateModal}
          userId={user?.id}
          onSuccess={() => {
            if (onCreateSuccess) onCreateSuccess();
          }}
        />
      )}
    </>
  );
}
