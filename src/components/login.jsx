import {Input} from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {Button} from "./ui/button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import * as Yup from "yup";
import Error from "./error";
import {login} from "@/db/apiAuth";
import {BeatLoader} from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";
import {isMockMode} from "@/db/supabase";

const Login = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
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
  };

  const {loading, error, fn: fnLogin, data} = useFetch(login, formData);
  const {fetchUser} = UrlState();

  useEffect(() => {
    if (error === null && data) {
      fetchUser();
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const handleLogin = async () => {
    setErrors([]);
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid email")
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
      email: "demo@trimrr.in",
      password: "password123",
    };
    setFormData(demoCredentials);
    setErrors({});
    try {
      await login(demoCredentials);
      fetchUser();
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          to your account if you already have one
        </CardDescription>
        {isMockMode && (
          <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 rounded text-amber-300">
            <span className="font-semibold block mb-0.5">💡 Demo Mode Active</span>
            <span>
              Log in with any email and 6+ character password, or click <strong>Quick Demo Login</strong>.
            </span>
          </div>
        )}
        {error && (
          <div className="space-y-1">
            <Error message={error.message} />
            {error.message?.toLowerCase().includes("email not confirmed") && (
              <div className="text-xs text-amber-300 mt-1 bg-amber-500/10 p-2 rounded border border-amber-500/20 leading-relaxed">
                💡 <strong>Email confirmation is required by Supabase.</strong> Either check your inbox, or disable email confirmation in your Supabase Dashboard: <strong>Authentication &gt; Providers &gt; Email &gt; Confirm email (Toggle OFF)</strong>.
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Input
            name="email"
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        {errors.email && <Error message={errors.email} />}
        <div className="space-y-1">
          <Input
            name="password"
            type="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        {errors.password && <Error message={errors.password} />}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        <Button onClick={handleLogin}>
          {loading ? <BeatLoader size={10} color="#36d7b7" /> : "Login"}
        </Button>
        {isMockMode && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDemoLogin}
          >
            Quick Demo Login ⚡
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Login;
