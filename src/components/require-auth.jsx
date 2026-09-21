import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {UrlState} from "@/context";
import {BarLoader} from "react-spinners";

function RequireAuth({children}) {
  const navigate = useNavigate();

  const {loading, isAuthenticated} = UrlState();

  useEffect(() => {
    if (!isAuthenticated && loading === false) navigate("/auth");
  }, [isAuthenticated, loading, navigate]);

  if (loading || loading === null)
    return <BarLoader width={"100%"} color="#36d7b7" />;

  if (isAuthenticated) return children;

  return null;
}

export default RequireAuth;
