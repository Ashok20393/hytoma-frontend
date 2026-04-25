import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PublicRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" })
      .then(res =>{ 
        console.log("PublicRoute /me status:", res.status);
        setIsAuth(res.ok)})
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <p>Checking login...</p>;
  if (isAuth) return <Navigate to="/" />;   // already logged in → go to dashboard
  return children;                           // not logged in → show login page
}