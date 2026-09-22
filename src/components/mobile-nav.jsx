import {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Plus,
  Zap,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {logout} from "@/services/authService";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";
import {isMockMode} from "@/db/supabase";
import LinkModal from "@/components/link-modal";

export default function MobileNav({onCreateSuccess}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();
  const {fn: fnLogout} = useFetch(logout);

  const handleLogout = async () => {
    setIsOpen(false);
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
      <header className="lg:hidden sticky top-0 z-40 border-b border-border-subtle bg-surface/90 backdrop-blur-md px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xs">
            <Zap className="h-3.5 w-3.5 text-white fill-white" />
          </div>
          <span className="text-sm font-bold text-foreground">AeroLink</span>
        </Link>

        {/* Right CTA + Hamburger */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-2.5 bg-primary hover:bg-blue-500 text-white text-xs gap-1 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Link</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Slide-out Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur-md p-5 flex flex-col justify-between animate-fade-in border-b border-border-subtle">
          <div className="space-y-4">
            {isMockMode && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Demo Mode Active (Local Storage Fallback)</span>
              </div>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User info & Logout */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="w-8 h-8 rounded-md ring-1 ring-border-subtle">
                <AvatarImage
                  src={user?.user_metadata?.profile_pic || "/logo.png"}
                  alt={user?.user_metadata?.name || "User"}
                />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                  {user?.email?.slice(0, 2)?.toUpperCase() || "AL"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user?.user_metadata?.name || "Account"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-xs text-rose-400 hover:text-rose-300 border-border-subtle hover:bg-rose-500/10 gap-2 h-9"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      )}

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
