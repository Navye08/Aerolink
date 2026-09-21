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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LinkIcon, LogOut, LayoutDashboard, Zap} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {BarLoader} from "react-spinners";
import {Button} from "./ui/button";
import {UrlState} from "@/context";
import {isMockMode} from "@/db/supabase";

const Header = () => {
  const {loading, fn: fnLogout} = useFetch(logout);
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();

  const handleLogout = async () => {
    await fnLogout();
    fetchUser();
    navigate("/");
  };

  return (
    <>
      <header className="border-b border-gray-800/80 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          {/* Brand Logo & Demo Pill */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
                  AeroLink
                </span>
              </div>
            </Link>

            {isMockMode && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20"
                title="Running in local storage fallback mode."
              >
                Demo Mode
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs font-semibold text-gray-300 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  Dashboard
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-500/30 hover:ring-blue-500 transition-all focus:outline-none">
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={user?.user_metadata?.profile_pic || "/logo.png"}
                        alt={user?.user_metadata?.name || "User"}
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {user?.email?.slice(0, 2).toUpperCase() || "AL"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-white leading-none">
                          {user?.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 leading-none truncate">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <LinkIcon className="mr-2 h-4 w-4 text-blue-400" />
                      <span>My Links</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      {loading && <BarLoader className="w-full" color="#3B82F6" height={2} />}
    </>
  );
};

export default Header;
