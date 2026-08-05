import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AuthPage from "./pages/AuthPage";
import ProblemsPage from "./pages/ProblemsPage"; // IMPORT ADDED HERE
import Loader from "./components/Loader";
import WorkspacePage from "./pages/workspace/WorkspacePage";

axios.defaults.withCredentials = true;

export interface User {
  id: string;
  username: string;
  email: string;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [_user, setUser] = useState<User | null>(null);
  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:3000/auth/me");
      if (res.data.success) {
        setAuthenticated(true);
        setUser(res.data.data);
      } else {
        setAuthenticated(false);
        setUser(null);
      }
    } catch {
      setAuthenticated(false);
      setUser(null);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1200);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            authenticated ? (
              <Navigate to="/problems" replace />
            ) : (
              <AuthPage checkAuth={checkAuth} />
            )
          }
        />
        
        {/* UPDATED ROUTE */}
        <Route
          path="/problems"
          element={
            authenticated ? (
              <ProblemsPage />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/problems/:id"
          element={
            authenticated ? (
              <WorkspacePage />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={authenticated ? "/problems" : "/auth"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}