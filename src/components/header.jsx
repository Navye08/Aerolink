import {Link, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {Zap, LayoutDashboard, LogOut, LinkIcon, Sparkles} from "lucide-react";
import {UrlState} from "@/context";
import {logout} from "@/services/authService";
import useFetch from "@/hooks/use-fetch";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {isMockMode} from "@/db/supabase";

export default function Header() {
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();
  const {fn: fnLogout} = useFetch(logout);

  const handleLogout = async () => {
    await fnLogout();
    fetchUser();
    navigate("/");
  };

  return (
    <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              AeroLink
            </span>
          </Link>

          {isMockMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="h-3 w-3" />
              Demo Mode
            </span>
          )}
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#analytics" className="hover:text-foreground transition-colors">
            Analytics
          </a>
          <a href="#security" className="hover:text-foreground transition-colors">
            Security
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        {/* Auth CTA / User Dropdown */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs h-8 font-medium border-border-subtle hover:bg-surface-elevated text-foreground gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                <span>Dashboard</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border-strong hover:ring-primary transition-all focus:outline-none">
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={user?.user_metadata?.profile_pic || "/logo.png"}
                      alt={user?.user_metadata?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                      {user?.email?.slice(0, 2)?.toUpperCase() || "AL"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-surface-elevated border-border-strong shadow-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold text-foreground">
                        {user?.user_metadata?.name || "Account"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border-subtle" />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="text-xs cursor-pointer hover:bg-surface-hover"
                  >
                    <LinkIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span>My Links</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-xs cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-xs h-8 text-muted-foreground hover:text-foreground hover:bg-surface-elevated font-medium active:scale-[0.98] transition-all"
              >
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-xs h-8 bg-primary hover:bg-blue-500 text-white font-medium shadow-sm shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
