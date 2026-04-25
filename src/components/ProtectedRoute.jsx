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

  if (isAuth === null) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!isAuth) return <Navigate to="/login" />;
  return children;
}