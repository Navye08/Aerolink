import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {resolveLinkByAlias, verifyLinkPassword} from "@/services/linkService";
import {recordClick, getClicksForUrl} from "@/services/analyticsService";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BarLoader, BeatLoader} from "react-spinners";
import {
  Lock,
  Clock,
  AlertTriangle,
  FileQuestion,
  ShieldCheck,
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

    if (!passwordInput) {
      setPasswordError("Please enter the link passcode.");
      return;
    }

    setVerifying(true);
    try {
      const isValid = await verifyLinkPassword(linkData.id, passwordInput);
      if (isValid) {
        // Correct passcode -> record click and redirect
        recordClick({urlId: linkData.id, originalUrl: linkData.original_url});
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

  // Loading State
  if (loading || statusState === "ready") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
          <Zap className="h-6 w-6 animate-pulse" />
        </div>
        <BarLoader width={200} color="#3B82F6" height={3} />
        <p className="text-sm font-medium text-gray-300">
          Redirecting to destination...
        </p>
      </div>
    );
  }

  // 1. Not Found (404) State
  if (statusState === "not_found") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 mb-2">
          <FileQuestion className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Link Not Found</h1>
        <p className="text-sm text-gray-400 max-w-sm">
          The short link you are trying to visit does not exist or may have been deleted.
        </p>
        <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-500 mt-2">
          Go to AeroLink Home
        </Button>
      </div>
    );
  }

  // 2. Disabled Link State
  if (statusState === "disabled") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-amber-400 mb-2">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Link Paused</h1>
        <p className="text-sm text-gray-400 max-w-md">
          This short link has been temporarily paused or disabled by its creator.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="border-gray-700 mt-2">
          Return to Home
        </Button>
      </div>
    );
  }

  // 3. Expired Link State
  if (statusState === "expired") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 mb-2">
          <Clock className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Link Expired</h1>
        <p className="text-sm text-gray-400 max-w-md">
          This short link reached its expiration date on{" "}
          <strong className="text-gray-300">
            {new Date(linkData.expires_at).toLocaleString()}
          </strong>{" "}
          and is no longer accessible.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="border-gray-700 mt-2">
          Return to Home
        </Button>
      </div>
    );
  }

  // 4. Click Limit Reached State
  if (statusState === "limit_reached") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-orange-400 mb-2">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Click Limit Reached</h1>
        <p className="text-sm text-gray-400 max-w-md">
          This short link was configured with a maximum visit limit of{" "}
          <strong className="text-gray-300">{linkData.max_clicks} clicks</strong>, which has now
          been reached.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="border-gray-700 mt-2">
          Return to Home
        </Button>
      </div>
    );
  }

  // 5. Password Challenge Form
  if (statusState === "password_required") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-white">
              Passcode Protected
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              The owner of this link requires a passcode before you can proceed to the destination.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <Input
                  type="password"
                  placeholder="Enter passcode..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={`h-11 bg-gray-950/60 border-gray-800 text-sm ${
                    passwordError ? "border-red-500" : ""
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-red-400 font-medium">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={verifying}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2"
              >
                {verifying ? (
                  <BeatLoader size={8} color="white" />
                ) : (
                  <>
                    <span>Unlock & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
