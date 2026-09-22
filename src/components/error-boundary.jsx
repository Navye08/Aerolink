import {useRouteError, Link} from "react-router-dom";
import {AlertTriangle, RefreshCw, Home, ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === "string" ? error : "An unexpected application error occurred.");

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-surface border border-border-subtle rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            AeroLink encountered an unexpected error while rendering this page. You can try refreshing or returning to the dashboard.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-surface-elevated/70 border border-border-subtle rounded-lg text-left overflow-hidden">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-1">
              Error Details
            </span>
            <code className="text-xs font-mono text-rose-400 break-words block max-h-24 overflow-y-auto">
              {errorMessage}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-medium gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Page</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 border-border-subtle hover:bg-surface-elevated text-foreground h-9 text-xs font-medium gap-2"
          >
            <Link to="/dashboard">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
