import {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {resolveLinkByAlias, verifyLinkPassword} from "@/services/linkService";
import {recordClick, getClicksForUrl} from "@/services/analyticsService";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {BeatLoader} from "react-spinners";
import {
  Lock,
  Clock,
  PauseCircle,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function RedirectLink() {
  const {id} = useParams();
  const navigate = useNavigate();

  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusState, setStatusState] = useState(null); // 'not_found' | 'disabled' | 'expired' | 'limit_reached' | 'password_required' | 'ready'
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadLink() {
      setLoading(true);
      try {
        const data = await resolveLinkByAlias(id);
        if (!data) {
          setStatusState("not_found");
          setLoading(false);
          return;
        }

        setLinkData(data);

        // Check 1: Active status
        if (data.is_active === false) {
          setStatusState("disabled");
          setLoading(false);
          return;
        }

        // Check 2: Expiration date
        if (data.expires_at) {
          const expiryTime = new Date(data.expires_at).getTime();
          if (Date.now() > expiryTime) {
            setStatusState("expired");
            setLoading(false);
            return;
          }
        }

        // Check 3: Click Limit
        if (data.max_clicks) {
          const clicks = await getClicksForUrl(data.id);
          if (clicks.length >= data.max_clicks) {
            setStatusState("limit_reached");
            setLoading(false);
            return;
          }
        }

        // Check 4: Password Protection
        if (data.is_password_protected) {
          setStatusState("password_required");
          setLoading(false);
          return;
        }

        // All checks passed -> Proceed to redirect and record click
        setStatusState("ready");
        setLoading(false);
        recordClick({urlId: data.id, originalUrl: data.original_url});
      } catch (err) {
        console.error("Error evaluating redirect:", err);
        setStatusState("not_found");
        setLoading(false);
      }
    }

    if (id) loadLink();
  }, [id]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    const trimmedInput = passwordInput.trim();
    if (!trimmedInput) {
      setPasswordError("Please enter the passcode.");
      return;
    }

    setVerifying(true);
    try {
      const isValid = await verifyLinkPassword(linkData.id, trimmedInput);
      if (isValid) {
        setStatusState("ready");
        await recordClick({urlId: linkData.id, originalUrl: linkData.original_url});
      } else {
        setPasswordError("Incorrect passcode. Please try again.");
      }
    } catch (err) {
      console.error("Password verification error:", err);
      setPasswordError("Failed to verify passcode. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // 1. Loading / Redirecting State
  if (loading || statusState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm px-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-1 animate-pulse">
          <Zap className="h-6 w-6 text-white fill-white" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Redirecting to destination
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            aerolink.in/{id}
          </p>
        </div>
        <div className="w-32 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <div className="w-full h-full bg-primary animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Not Found (404) State
  if (statusState === "not_found") {
    return (
      <div className="p-8 bg-surface border border-border-strong rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted-foreground mx-auto">
          <FileQuestion className="h-6 w-6 text-rose-400" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">Link Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The short link you are trying to visit does not exist or may have been deleted.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          className="w-full bg-primary hover:bg-blue-500 text-white text-xs font-medium h-9 active:scale-[0.98] transition-all"
        >
          Go to AeroLink
        </Button>
      </div>
    );
  }

  // 3. Disabled / Paused Link State
  if (statusState === "disabled") {
    return (
      <div className="p-8 bg-surface border border-border-strong rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
          <PauseCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">Link Unavailable</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This link is currently paused or inactive. Please contact the link owner.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full text-xs border-border-subtle hover:bg-surface-elevated h-9 active:scale-[0.98] transition-all"
        >
          Go to AeroLink
        </Button>
      </div>
    );
  }

  // 4. Expired Link State
  if (statusState === "expired") {
    return (
      <div className="p-8 bg-surface border border-border-strong rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <Clock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">Link Expired</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This short link reached its expiration date on{" "}
            <span className="font-mono text-foreground font-medium">
              {new Date(linkData.expires_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>{" "}
            and is no longer accepting visits.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full text-xs border-border-subtle hover:bg-surface-elevated h-9 active:scale-[0.98] transition-all"
        >
          Go to AeroLink
        </Button>
      </div>
    );
  }

  // 5. Click Limit Reached State
  if (statusState === "limit_reached") {
    return (
      <div className="p-8 bg-surface border border-border-strong rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">Access Limit Reached</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This link was configured with a visitor cap of{" "}
            <span className="font-mono text-foreground font-medium">
              {linkData.max_clicks} clicks
            </span>
            , which has now been fulfilled.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full text-xs border-border-subtle hover:bg-surface-elevated h-9 active:scale-[0.98] transition-all"
        >
          Go to AeroLink
        </Button>
      </div>
    );
  }

  // 6. Password Protected Challenge State
  if (statusState === "password_required") {
    return (
      <div className="p-6 sm:p-8 bg-surface border border-border-strong rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold text-foreground">
            This link is protected
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The owner requires a passcode before redirecting you to the destination.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Enter passcode..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              className={`h-10 bg-surface-elevated border-border-subtle text-xs focus-visible:ring-primary ${
                passwordError ? "border-rose-500" : ""
              }`}
              autoFocus
            />
            {passwordError && (
              <span className="text-[11px] text-rose-400 font-medium block">
                {passwordError}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={verifying}
            className="w-full h-10 bg-primary hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {verifying ? (
              <BeatLoader size={6} color="white" />
            ) : (
              <>
                <span>Continue to destination</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Powered by AeroLink
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
