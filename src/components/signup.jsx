import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import * as Yup from "yup";
import {BeatLoader} from "react-spinners";
import {CheckCircle2} from "lucide-react";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import ErrorAlert from "./error";
import {signup} from "@/db/apiAuth";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";

export default function Signup({onSwitchToLogin}) {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();
  const {fetchUser} = UrlState();

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const handleInputChange = (e) => {
    const {name, value, files} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: null}));
    }
  };

  const {loading, error, fn: fnSignup, data} = useFetch(signup, formData);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (error === null && data) {
        if (data?.session) {
          await fetchUser();
          navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
        } else {
          setSuccessMsg(
            "Account created! Please check your email inbox to confirm your account, or disable 'Confirm email' in Supabase to log in instantly."
          );
        }
      }
    };
    handleAuthRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const handleSignup = async (e) => {
    e?.preventDefault();
    setErrors({});
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Full name is required"),
        email: Yup.string()
          .email("Please enter a valid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().nullable(),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnSignup();
    } catch (error) {
      const newErrors = {};
      if (error?.inner) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({api: error.message});
      }
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-3.5">
      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-relaxed">{successMsg}</span>
        </div>
      )}

      {error && <ErrorAlert message={error?.message} />}

      {/* Name Field */}
      <div className="space-y-1">
        <label htmlFor="signup-name" className="text-xs font-medium text-foreground">
          Full Name
        </label>
        <Input
          id="signup-name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleInputChange}
          className={`h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary ${
            errors.name ? "border-rose-500" : ""
          }`}
          autoComplete="name"
        />
        {errors.name && (
          <span className="text-[11px] text-rose-400 font-medium block">
            {errors.name}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1">
        <label htmlFor="signup-email" className="text-xs font-medium text-foreground">
          Email address
        </label>
        <Input
          id="signup-email"
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
      <div className="space-y-1">
        <label htmlFor="signup-password" className="text-xs font-medium text-foreground">
          Password
        </label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={formData.password}
          onChange={handleInputChange}
          className={`h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary ${
            errors.password ? "border-rose-500" : ""
          }`}
          autoComplete="new-password"
        />
        {errors.password && (
          <span className="text-[11px] text-rose-400 font-medium block">
            {errors.password}
          </span>
        )}
      </div>

      {/* Profile Picture (Optional) */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground flex items-center justify-between">
          <span>Avatar (Optional)</span>
          <span className="text-[10px] text-muted-foreground">PNG, JPG</span>
        </label>
        <div className="relative">
          <input
            id="signup-pic"
            name="profile_pic"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full text-xs text-muted-foreground file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border file:border-border-subtle file:text-xs file:font-medium file:bg-surface-elevated file:text-foreground hover:file:bg-surface cursor-pointer"
          />
        </div>
        {errors.profile_pic && (
          <span className="text-[11px] text-rose-400 font-medium block">
            {errors.profile_pic}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-9 bg-primary hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/25 mt-3"
      >
        {loading ? <BeatLoader size={6} color="white" /> : "Create AeroLink Account"}
      </Button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
}
