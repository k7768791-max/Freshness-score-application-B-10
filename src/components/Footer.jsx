import React from "react";

export default function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="foot-logo">Fresh<span>Sense</span> AI</div>
      <p>© 2025 FreshSense. Built to reduce retail waste.</p>
      <div className="foot-links">
        <a onClick={() => onNavigate("about")}>About</a>
        <a onClick={() => onNavigate("contact")}>Contact</a>
        <a onClick={() => onNavigate("ai")}>Our AI</a>
      </div>
    </footer>
  );
}