import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// ✅ FIX: Use environment variable so production (Vercel) points to the deployed backend.
//         In development, VITE_API_URL is not set so it falls back to "" (empty string),
//         which lets Vite's dev proxy at vite.config.js handle /api/... calls.
const API = "freshness-score-application-b-10-backend-yv3d.onrender.com" || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setUser(d.user || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async ({ fname, lname, email, password }) => {
    const r = await fetch(`${API}/api/signup`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fname, lname, email, password })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setUser(d.user);
    return d.message;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const r = await fetch(`${API}/api/login`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setUser(d.user);
    return d.message;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API}/api/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const r = await fetch(`${API}/api/me`, { credentials: "include" });
    const d = await r.json();
    setUser(d.user || null);
  }, []);

  const updateUserLocally = useCallback((patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  return (
    // ✅ FIX: Export `API` so other components (AIPage, Dashboard, AdminDashboard)
    //         can use the same base URL instead of hardcoding "/api/..."
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshUser, updateUserLocally, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
