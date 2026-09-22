import {useEffect, useState} from "react";
import {useNavigate, useSearchParams, Link} from "react-router-dom";
import Login from "@/components/login";
import Signup from "@/components/signup";
import {UrlState} from "@/context";
import {Zap, CheckCircle2, ShieldCheck, QrCode, BarChart3} from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {isAuthenticated, loading} = UrlState();
  const [authMode, setAuthMode] = useState("login");
  const longLink = searchParams.get("createNew");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
  }, [isAuthenticated, loading, navigate, longLink]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-border-strong bg-surface shadow-2xl overflow-hidden">
        {/* Left Side: Brand Value Showcase (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between p-8 bg-surface-elevated border-r border-border-subtle relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xs">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-base font-bold text-foreground">AeroLink</span>
            </Link>

            <div className="space-y-2 pt-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight leading-snug">
                Infrastructure-grade link operations.
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your brand to fast, secure, and insightful short URLs with real-time visitor telemetry.
              </p>
            </div>
          </div>

          {/* Product Highlights */}
          <div className="space-y-3 py-6">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Server-side zero-knowledge passcode protection</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <QrCode className="h-4 w-4 text-primary flex-shrink-0" />
              <span>In-browser vector QR studio (150px to 400px)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-violet-400 flex-shrink-0" />
              <span>Privacy-preserving visitor analytics (GDPR compliant)</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-border-subtle text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>Works with Supabase or offline local Demo Mode.</span>
          </div>
        </div>

        {/* Right Side: Focused Auth Form */}
        <div className="p-6 sm:p-8 flex flex-col justify-center bg-surface">
          {/* Header */}
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-bold text-foreground">
              {longLink
                ? "Sign in to save your link"
                : authMode === "login"
                ? "Welcome back"
                : "Create an account"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {authMode === "login"
                ? "Enter your credentials to access your AeroLink dashboard."
                : "Get started in seconds with free link management."}
            </p>
          </div>

          {/* Switch Tab Pills */}
          <div className="flex p-1 bg-surface-elevated border border-border-subtle rounded-lg mb-5">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${
                authMode === "login"
                  ? "bg-surface text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${
                authMode === "signup"
                  ? "bg-surface text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          {authMode === "login" ? (
            <Login onSwitchToSignup={() => setAuthMode("signup")} />
          ) : (
            <Signup onSwitchToLogin={() => setAuthMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
