import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Uses VITE_API_URL from .env (set in Vercel/prod).
// Falls back to empty string in dev so Vite's proxy at vite.config.js handles /api/... calls.
const API = import.meta.env.VITE_API_URL || "";

// ---------- tiny localStorage helpers ----------
const STORAGE_KEY = "auth_user";

function saveToStorage(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}
// -----------------------------------------------

export function AuthProvider({ children }) {
  // Seed from localStorage so the user is never "null" on a hard refresh
  const [user, setUser] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(true);

  // Always keep localStorage in sync with the React state
  function applyUser(u) {
    setUser(u);
    saveToStorage(u);
  }

  // On mount: verify the stored user with the backend (/api/me).
  // If the session cookie is still valid the server returns the latest user object.
  // If it's expired or was never sent (cross-origin cookie blocked) we still have
  // the localStorage copy so the UI doesn't flash "logged out".
  useEffect(() => {
    fetch(`${API}/api/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => {
        if (d.user) {
          // Server confirmed the session — refresh the stored user
          applyUser(d.user);
        }
        // If d.user is null but we have a localStorage copy we keep it;
        // the next prediction call will get a 401 and ask the user to re-login.
      })
      .catch(() => {
        // Network failure (e.g. backend cold-starting on Render free tier).
        // Keep whatever is in localStorage so the UI stays consistent.
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signup = useCallback(async ({ fname, lname, email, password }) => {
    const r = await fetch(`${API}/api/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fname, lname, email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    applyUser(d.user);
    return d.message;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async ({ email, password }) => {
    const r = await fetch(`${API}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    applyUser(d.user);
    return d.message;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(async () => {
    await fetch(`${API}/api/logout`, { method: "POST", credentials: "include" });
    applyUser(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshUser = useCallback(async () => {
    const r = await fetch(`${API}/api/me`, { credentials: "include" });
    const d = await r.json();
    applyUser(d.user || null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUserLocally = useCallback((patch) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  return (
    // API is exported so other components (AIPage, Modals) can use the same base URL
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, refreshUser, updateUserLocally, API }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

