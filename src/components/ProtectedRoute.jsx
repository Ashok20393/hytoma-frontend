import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/me`, {
        credentials: "include",
      });
      console.log("ProtectedRoute /me status:", res.status);
      setIsAuth(res.status === 200);
    } catch {
      setIsAuth(false);
    }
  };

  if (isAuth === null) return <p>Checking login...</p>;
  if (!isAuth) return <Navigate to="/login" />; 
  return children;
}