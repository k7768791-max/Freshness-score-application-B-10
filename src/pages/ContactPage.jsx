import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import Footer from "../components/Footer";

export default function ContactPage({ onNavigate }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ fname: "", lname: "", email: "", subject: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSend() {
    if (!form.fname || !form.email || !form.message) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      showToast(d.message, "success");
      setForm({ fname: "", lname: "", email: "", subject: "General Inquiry", message: "" });
    } catch (e) {
      showToast(e.message || "Failed to send.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section">
        <div className="section-tag">Get In Touch</div>
        <h2>We'd love to hear<br />from you.</h2>
        <p className="section-sub" style={{ marginBottom: 48 }}>
          Have questions about pricing, integration, or our models? Drop us a line.
        </p>
        <div className="contact-grid">
          <div>
            {[
              { icon: "📧", label: "Email",         val: "hello@freshsense.ai" },
              { icon: "📍", label: "Location",      val: "Hyderabad, Telangana, India" },
              { icon: "🕐", label: "Response Time", val: "Within 24 business hours" },
              { icon: "💬", label: "Support",       val: "Pro users get priority support" },
            ].map(c => (
              <div className="contact-info-card" key={c.label}>
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ color: "var(--text2)", fontSize: 14 }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form">
            <h3 className="about-h3" style={{ marginBottom: 24 }}>Send a Message</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input className="form-control" placeholder="Arjun" value={form.fname} onChange={set("fname")} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="form-control" placeholder="Reddy" value={form.lname} onChange={set("lname")} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select className="select-control" value={form.subject} onChange={set("subject")}>
                <option>General Inquiry</option>
                <option>Pricing & Plans</option>
                <option>Technical Support</option>
                <option>Partnership</option>
                <option>Model Integration</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="form-control" placeholder="Tell us how we can help..." value={form.message} onChange={set("message")} />
            </div>
            <button className="btn-primary btn-full" style={{ padding: "14px", fontSize: 15 }} onClick={handleSend} disabled={loading}>
              {loading ? "Sending…" : "Send Message →"}
            </button>
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}