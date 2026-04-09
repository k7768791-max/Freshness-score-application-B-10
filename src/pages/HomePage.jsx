import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const slides = [
    { id: 1, src: "/images/carousel_dashboard.png", alt: "AI Dashboard Overview" },
    { id: 2, src: "/images/carousel_freshness.png", alt: "Predictive Freshness Analysis" },
    { id: 3, src: "/images/carousel_discount.png", alt: "Dynamic Discounting Strategy" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-carousel-wrapper">
      <div className="hero-carousel-inner">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`hero-carousel-slide ${i === current ? "active" : ""}`}
          >
            <img src={slide.src} alt={slide.alt} />
          </div>
        ))}
      </div>
      <div className="hero-carousel-indicators">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`carousel-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ onNavigate, onOpenModal, onOpenPayment }) {
  return (
    <div className="page-home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-tag">✦ AI-Powered Retail Intelligence</div>
        <h1>
          Know Before<br />
          <span className="line2">Products Expire.</span>
        </h1>
        <p>
          FreshSense uses machine learning to predict product freshness and recommend
          optimal discounts — reducing waste and maximizing revenue for modern retailers.
        </p>
        <div className="hero-cta">
          <button className="btn-lg btn-accent-lg" onClick={() => onNavigate("ai")}>
            Try the AI Free →
          </button>
          <button className="btn-lg btn-outline-lg" onClick={() => onNavigate("about")}>
            How It Works
          </button>
        </div>

        <HeroCarousel />

        <div className="hero-stats">
          <div className="stat"><div className="stat-num">93%</div><div className="stat-label">Prediction Accuracy</div></div>
          <div className="stat"><div className="stat-num">40%</div><div className="stat-label">Waste Reduction</div></div>
          <div className="stat"><div className="stat-num">5</div><div className="stat-label">Product Categories</div></div>
          <div className="stat"><div className="stat-num">2</div><div className="stat-label">AI Models</div></div>
        </div>
      </section>

      {/* FEATURES */}
      <div className="section">
        <div className="section-tag">Core Capabilities</div>
        <h2>Everything a smart<br />retailer needs.</h2>
        <p className="section-sub">Two specialized models working together to give you real-time intelligence on perishables.</p>
        <div className="features-grid">
          {[
            { icon: "🥬", title: "Freshness Prediction", desc: "Analyze storage conditions, packaging, weather, and product sensitivity to generate a precise freshness score from 0–100%." },
            { icon: "💸", title: "Dynamic Discounting", desc: "Factor in stock levels, daily sales velocity, demand, season, and cost price to recommend the perfect discount before expiry." },
            { icon: "📊", title: "Shelf Life Estimation", desc: "Rule-based logic combined with ML outputs gives you accurate remaining shelf life predictions per product category." },
            { icon: "⚡", title: "Instant Results", desc: "Get predictions in seconds. No batch processing, no delays — real-time intelligence at every product check-in." },
            { icon: "🧠", title: "Scikit-learn Models", desc: "Production-grade ML models trained on retail datasets, with full feature encoding and category-specific tuning." },
            { icon: "🔐", title: "Secure & Private", desc: "Your product data stays yours. All predictions run server-side with encrypted sessions and no data retention." },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-tag">Workflow</div>
        <h2>Four steps to zero waste.</h2>
        <div className="steps">
          <div className="step"><div className="step-num">1</div><h4>Input Details</h4><p>Enter product category, storage info, and condition data</p></div>
          <div className="step"><div className="step-num">2</div><h4>Freshness Score</h4><p>ML model predicts a 0–100 freshness score instantly</p></div>
          <div className="step"><div className="step-num">3</div><h4>Shelf Life</h4><p>Category rules estimate exact days remaining on shelf</p></div>
          <div className="step"><div className="step-num">4</div><h4>Discount</h4><p>Smart model recommends the perfect discount to clear stock</p></div>
        </div>
      </div>

      {/* PRICING */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-tag">Pricing</div>
        <h2>Simple, transparent pricing.</h2>
        <p className="section-sub">Start free, upgrade when you need more power.</p>
        <div className="pricing-grid">
          {/* Free */}
          <div className="price-card">
            <div className="price-tier">Free</div>
            <div className="price-amount">₹0<span>/mo</span></div>
            <p className="price-desc">3 AI predictions to try out both models — no credit card needed.</p>
            <ul className="price-features">
              <li><span className="ck">✓</span> 3 total predictions</li>
              <li><span className="ck">✓</span> Freshness & Discount models</li>
              <li><span className="ck">✓</span> Shelf life estimation</li>
              <li><span className="xx">✗</span> Unlimited predictions</li>
              <li><span className="xx">✗</span> Priority support</li>
            </ul>
            <button className="btn-primary btn-full" onClick={() => onOpenModal("signup")}>Start Free →</button>
          </div>
          {/* Pro Monthly */}
          <div className="price-card featured">
            <div className="price-badge">POPULAR</div>
            <div className="price-tier">Pro Monthly</div>
            <div className="price-amount">₹499<span>/mo</span></div>
            <p className="price-desc">Unlimited predictions for serious retailers. Cancel anytime.</p>
            <ul className="price-features">
              <li><span className="ck">✓</span> Unlimited predictions</li>
              <li><span className="ck">✓</span> Both AI models</li>
              <li><span className="ck">✓</span> Shelf life estimation</li>
              <li><span className="ck">✓</span> Priority support</li>
              <li><span className="ck">✓</span> Early access features</li>
            </ul>
            <button className="btn-primary btn-full" onClick={() => onOpenPayment("monthly")}>Upgrade to Pro →</button>
          </div>
          {/* Pro Yearly */}
          <div className="price-card">
            <div className="price-tier">Pro Yearly</div>
            <div className="price-amount">₹3999<span>/yr</span></div>
            <p className="price-desc">Best value — save ₹1989 vs monthly. Full access all year.</p>
            <ul className="price-features">
              <li><span className="ck">✓</span> Everything in Pro Monthly</li>
              <li><span className="ck">✓</span> 2 months free</li>
              <li><span className="ck">✓</span> Dedicated onboarding</li>
              <li><span className="ck">✓</span> API access (coming soon)</li>
              <li><span className="ck">✓</span> Custom integrations</li>
            </ul>
            <button className="btn-ghost btn-full" onClick={() => onOpenPayment("yearly")}>Get Yearly →</button>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}