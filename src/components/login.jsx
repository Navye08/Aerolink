import {useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import * as Yup from "yup";
import {BeatLoader} from "react-spinners";
import {Sparkles, Eye, EyeOff} from "lucide-react";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import ErrorAlert from "./error";
import {login} from "@/db/apiAuth";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";
import {isMockMode} from "@/db/supabase";

export default function Login({onSwitchToSignup}) {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: null}));
    }
  };

  const {loading, error, fn: fnLogin, data} = useFetch(login, formData);
  const {fetchUser} = UrlState();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (error === null && data) {
        await fetchUser();
        navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
      }
    };
    handleAuthRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrors({});
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Please enter a valid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnLogin();
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      email: "demo@aerolink.in",
      password: "password123",
    };
    setFormData(demoCredentials);
    setErrors({});
    try {
      await login(demoCredentials);
      await fetchUser();
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {isMockMode && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Demo Mode Active</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-[11px] font-semibold text-amber-300 hover:underline flex items-center gap-1"
          >
            <span>Quick 1-Click Login</span>
          </button>
        </div>
      )}

      {error && (
        <div className="space-y-1">
          <ErrorAlert message={error.message} />
          {error.message?.toLowerCase()?.includes("email not confirmed") && (
            <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
              <strong>Email confirmation is enabled in your Supabase project.</strong> Please verify your email inbox or disable email confirmation in Supabase Dashboard: <strong>Authentication &gt; Providers &gt; Email &gt; Confirm email (Toggle OFF)</strong>.
            </div>
          )}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-medium text-foreground">
          Email address
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleInputChange}
          className={`h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary ${
            errors.email ? "border-rose-500" : ""
          }`}
          autoComplete="email"
        />
        {errors.email && (
          <span className="text-[11px] text-rose-400 font-medium block">
            {errors.email}
          </span>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs font-medium text-foreground">
            Password
          </label>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className={`h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary pr-8 ${
              errors.password ? "border-rose-500" : ""
            }`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-[11px] text-rose-400 font-medium block">
            {errors.password}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-9 bg-primary hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/25 mt-2"
      >
        {loading ? <BeatLoader size={6} color="white" /> : "Sign in to AeroLink"}
      </Button>

      {/* Switch to Signup */}
      {onSwitchToSignup && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:underline font-medium"
          >
            Create account
          </button>
        </p>
      )}
    </form>
  );
}
