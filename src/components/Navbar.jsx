import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ page, onNavigate, onOpenModal }) {
  const { user, logout } = useAuth();

  const trialLeft = user ? Math.max(0, 3 - (user.trial_used || 0)) : 0;

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => onNavigate("home")}>
        <div className="nav-dot" />
        Fresh<span>Sense</span>
      </div>

      <ul className="nav-links">
        {["home", "about", "ai", "contact", ...(user ? ["dashboard"] : [])].map(p => (
          <li key={p}>
            <a
              className={page === p ? "active" : ""}
              onClick={() => onNavigate(p)}
            >
              {p === "ai" ? "Our AI" : (p === "dashboard" && user?.is_admin ? "Admin Panel" : p.charAt(0).toUpperCase() + p.slice(1))}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        {!user ? (
          <div className="guest-actions">
            <button className="btn-ghost" onClick={() => onOpenModal("login")}>Log In</button>
            <button className="btn-primary" onClick={() => onOpenModal("signup")}>Get Started</button>
          </div>
        ) : (
          <div className="user-badge">
            <div className="avatar">{user.fname[0].toUpperCase()}</div>
            <span className="user-name-nav">{user.fname}</span>
            {user.is_pro ? (
              <div className="trial-badge trial-badge--pro">✦ Pro</div>
            ) : (
              <div className="trial-badge">{trialLeft} free left</div>
            )}
            <button
              className="btn-ghost btn-ghost--sm"
              onClick={logout}
            >
              Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}