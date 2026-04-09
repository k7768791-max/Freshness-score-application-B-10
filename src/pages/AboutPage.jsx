import React from "react";
import Footer from "../components/Footer";

export default function AboutPage({ onNavigate }) {
  return (
    <div>
      <div className="about-hero">
        <div className="section-tag">Our Mission</div>
        <h2>Built to end<br />preventable food waste.</h2>
        <p className="section-sub" style={{ marginBottom: 48 }}>
          Over 40% of perishable products are discarded due to poor freshness tracking
          and reactive discounting. FreshSense changes that with proactive AI intelligence.
        </p>
        <div className="about-grid">
          <div>
            <h3 className="about-h3">Our Technology Stack</h3>
            <p className="about-p">
              We trained two specialized Random Forest models on retail inventory datasets
              covering 5 product categories. The freshness model analyzes 10 environmental
              and handling features. The discount model synthesizes pricing, stock velocity,
              and demand signals.
            </p>
            <div className="about-visual">
              {[
                { label: "Vegetables", pct: 93 },
                { label: "Dairy",      pct: 89 },
                { label: "Fruits",     pct: 91 },
                { label: "Meat",       pct: 95 },
                { label: "Bakery",     pct: 88 },
              ].map(b => (
                <div className="about-bar" key={b.label}>
                  <div className="bar-label"><span>{b.label}</span><span>{b.pct}%</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${b.pct}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="about-caption">Model accuracy per product category</p>
          </div>
          <div>
            <h3 className="about-h3">Why We Built This</h3>
            <p className="about-p">
              Traditional retail freshness checks are manual, inconsistent, and always reactive.
              By the time a manager notices a product needs discounting, it's often too late —
              the product is already past its prime.
            </p>
            <p className="about-p">
              FreshSense gives retailers a proactive edge. By modeling the exact conditions
              that affect freshness — storage temperature, packaging integrity, humidity,
              handling damage — we predict decline before it happens.
            </p>
            <p className="about-p">
              The result: less waste, better margins, happier customers who always get fresh
              products at fair prices.
            </p>
            <div className="about-stats">
              <div className="about-stat"><div className="about-stat-num">10+</div><div className="about-stat-label">Input Features</div></div>
              <div className="about-stat"><div className="about-stat-num">2</div><div className="about-stat-label">ML Models</div></div>
              <div className="about-stat"><div className="about-stat-num">&lt;1s</div><div className="about-stat-label">Inference Time</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 48 }}>
        <div className="section-tag">Our Team</div>
        <h2>Passionate about retail tech.</h2>
        <div className="team-grid">
          {[
            { init: "A", name: "Arjun Reddy",   role: "ML Engineer" },
            { init: "P", name: "Priya Sharma",  role: "Data Scientist" },
            { init: "K", name: "Kiran Rao",     role: "Full Stack Dev" },
          ].map(t => (
            <div className="team-card" key={t.name}>
              <div className="team-avatar">{t.init}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}