import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["Vegetables", "Dairy", "Fruits", "Meat", "Bakery"];

function TrialBar({ user, onUpgrade }) {
  const trialLeft = user ? Math.max(0, 3 - (user.trial_used || 0)) : 0;
  const dots = [0, 1, 2].map(i => ({
    used: user && !user.is_pro ? i < (user.trial_used || 0) : !!user?.is_pro
  }));

  return (
    <div className={`trial-bar${user?.is_pro ? " trial-bar--pro" : ""}`}>
      <div className="trial-info">
        <div className="trial-dots">
          {dots.map((d, i) => <div key={i} className={`trial-dot${d.used ? " used" : ""}`} />)}
        </div>
        <span className="trial-text">
          {!user
            ? "Sign in or create a free account to start predicting."
            : user.is_pro
              ? <span><span style={{ color: "var(--accent)" }}>✦ Pro</span> — Unlimited predictions active.</span>
              : `${trialLeft} free prediction${trialLeft === 1 ? "" : "s"} remaining out of 3.`
          }
        </span>
      </div>
      {(!user?.is_pro) && (
        <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }} onClick={onUpgrade}>
          Upgrade to Pro →
        </button>
      )}
    </div>
  );
}

function FreshnessPanel({ user, onNeedAuth, onTrialExhausted, onPredicted }) {
  const { showToast } = useToast();
  const { updateUserLocally } = useAuth();
  const [fields, setFields] = useState({
    category: "Vegetables", days: 7, storage: "fridge", condition: "good",
    packaging: "sealed", display: "fridge", damaged: "no",
    weather: "normal", sensitivity: "low", demand: "medium"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setFields(f => ({ ...f, [k]: e.target.value })); }

  async function predict() {
    if (!user) { onNeedAuth(); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/predict/freshness", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category:         fields.category,
          days_since_arrival: Number(fields.days),
          storage:          fields.storage,
          condition:        fields.condition,
          packaging:        fields.packaging,
          display:          fields.display,
          damaged:          fields.damaged,
          weather:          fields.weather,
          sensitivity:      fields.sensitivity,
          demand:           fields.demand
        })
      });
      const d = await r.json();
      if (r.status === 401) { onNeedAuth(); return; }
      if (r.status === 403) { onTrialExhausted(); return; }
      if (!r.ok) { showToast(d.error || "Prediction failed.", "error"); return; }
      setResult(d);
      updateUserLocally({ trial_used: d.trial_used, is_pro: d.is_pro });
      onPredicted(d.discount_prefill);
      showToast("Freshness prediction complete!", "success");
    } catch {
      showToast("Network error. Is the Flask server running?", "error");
    } finally {
      setLoading(false);
    }
  }

  const statusClass = result ? `status-${result.status.toLowerCase()}` : "";

  return (
    <div className="ai-panel">
      <div className="input-grid">
        <div className="form-group">
          <label>Product Category</label>
          <select className="select-control" value={fields.category} onChange={set("category")}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Days Since Arrival</label>
          <input className="form-control" type="number" min={0} max={20} value={fields.days} onChange={set("days")} />
        </div>
        <div className="form-group">
          <label>Storage Type</label>
          <select className="select-control" value={fields.storage} onChange={set("storage")}>
            <option value="fridge">Fridge</option>
            <option value="room_temp">Room Temperature</option>
            <option value="freezer">Freezer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Storage Condition</label>
          <select className="select-control" value={fields.condition} onChange={set("condition")}>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div className="form-group">
          <label>Packaging Type</label>
          <select className="select-control" value={fields.packaging} onChange={set("packaging")}>
            <option value="sealed">Sealed</option>
            <option value="open">Open</option>
          </select>
        </div>
        <div className="form-group">
          <label>Display Type</label>
          <select className="select-control" value={fields.display} onChange={set("display")}>
            <option value="fridge">Fridge</option>
            <option value="open_shelf">Open Shelf</option>
            <option value="freezer">Freezer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Is Damaged?</label>
          <select className="select-control" value={fields.damaged} onChange={set("damaged")}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Weather Condition</label>
          <select className="select-control" value={fields.weather} onChange={set("weather")}>
            <option value="normal">Normal</option>
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
          </select>
        </div>
        <div className="form-group">
          <label>Product Sensitivity</label>
          <select className="select-control" value={fields.sensitivity} onChange={set("sensitivity")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Demand Level</label>
          <select className="select-control" value={fields.demand} onChange={set("demand")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <button className="btn-primary" style={{ padding: "13px 40px", fontSize: 15 }} onClick={predict} disabled={loading}>
        {loading ? "Predicting…" : "Predict Freshness →"}
      </button>

      {result && (
        <div className="result-card">
          <h3>🥬 Freshness Prediction Result</h3>
          <div className="metric-row">
            <div className="metric"><div className="metric-val">{result.score}%</div><div className="metric-label">Freshness Score</div></div>
            <div className="metric"><div className={`metric-val ${statusClass}`}>{result.status}</div><div className="metric-label">Status</div></div>
            <div className="metric"><div className="metric-val">{result.days_since_arrival} day(s)</div><div className="metric-label">Days Since Arrival</div></div>
            <div className="metric"><div className="metric-val">{result.remaining_shelf_life} day(s)</div><div className="metric-label">Remaining Shelf Life</div></div>
          </div>
          <div className={`alert ${result.status === "High" ? "alert-success" : result.status === "Medium" ? "alert-warning" : "alert-danger"}`} style={{ marginTop: 16 }}>
            {result.status === "High" && "✓ Product freshness is high. No immediate action required."}
            {result.status === "Medium" && "⚠ Product freshness is medium. Consider discounting soon."}
            {result.status === "Low" && "✗ Product freshness is low. Urgent action recommended."}
          </div>
          <div className={`alert ${result.remaining_shelf_life === 0 ? "alert-danger" : result.remaining_shelf_life <= 2 ? "alert-warning" : "alert-success"}`} style={{ marginTop: 8 }}>
            {result.remaining_shelf_life === 0 && "✗ Product is at or past expiry. Remove from shelf immediately."}
            {result.remaining_shelf_life > 0 && result.remaining_shelf_life <= 2 && "⚠ Product is nearing expiry. Apply discount now to clear stock."}
            {result.remaining_shelf_life > 2 && "✓ Product still has usable shelf life remaining."}
          </div>
        </div>
      )}
    </div>
  );
}

function DiscountPanel({ user, prefill, onNeedAuth, onTrialExhausted }) {
  const { showToast } = useToast();
  const { updateUserLocally } = useAuth();
  const [fields, setFields] = useState({
    freshness: prefill?.freshness || 65,
    expiry:    prefill?.expiry || 3,
    price: 41.61, cost: 31.33, stock: 243, sales: 41,
    category: "Vegetables", season: "summer", demand: "low",
    days_arrival: prefill?.days_arrival || 7
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync prefill when freshness panel completes
  React.useEffect(() => {
    if (prefill) {
      setFields(f => ({ ...f,
        freshness: prefill.freshness,
        expiry: prefill.expiry,
        days_arrival: prefill.days_arrival
      }));
    }
  }, [prefill]);

  function set(k) { return e => setFields(f => ({ ...f, [k]: e.target.value })); }

  async function predict() {
    if (!user) { onNeedAuth(); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/predict/discount", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freshness:      Number(fields.freshness),
          days_to_expiry: Number(fields.expiry),
          original_price: Number(fields.price),
          cost_price:     Number(fields.cost),
          stock:          Number(fields.stock),
          daily_sales:    Number(fields.sales),
          demand:         fields.demand,
          season:         fields.season,
          days_since_arrival: Number(fields.days_arrival)
        })
      });
      const d = await r.json();
      if (r.status === 401) { onNeedAuth(); return; }
      if (r.status === 403) { onTrialExhausted(); return; }
      if (!r.ok) { showToast(d.error || "Prediction failed.", "error"); return; }
      setResult(d);
      updateUserLocally({ trial_used: d.trial_used, is_pro: d.is_pro });
      showToast("Discount prediction complete!", "success");
    } catch {
      showToast("Network error. Is the Flask server running?", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-panel">
      <div className="input-grid">
        <div className="form-group"><label>Freshness Score (%)</label><input className="form-control" type="number" min={0} max={100} value={fields.freshness} onChange={set("freshness")} /></div>
        <div className="form-group"><label>Days to Expiry</label><input className="form-control" type="number" min={0} max={30} value={fields.expiry} onChange={set("expiry")} /></div>
        <div className="form-group"><label>Original Price (₹)</label><input className="form-control" type="number" step={0.01} value={fields.price} onChange={set("price")} /></div>
        <div className="form-group"><label>Cost Price (₹)</label><input className="form-control" type="number" step={0.01} value={fields.cost} onChange={set("cost")} /></div>
        <div className="form-group"><label>Current Stock (units)</label><input className="form-control" type="number" value={fields.stock} onChange={set("stock")} /></div>
        <div className="form-group"><label>Daily Sales (units)</label><input className="form-control" type="number" value={fields.sales} onChange={set("sales")} /></div>
        <div className="form-group">
          <label>Product Category</label>
          <select className="select-control" value={fields.category} onChange={set("category")}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Season</label>
          <select className="select-control" value={fields.season} onChange={set("season")}>
            <option value="summer">Summer</option><option value="winter">Winter</option>
            <option value="rainy">Rainy</option><option value="normal">Normal</option>
          </select>
        </div>
        <div className="form-group">
          <label>Demand Level</label>
          <select className="select-control" value={fields.demand} onChange={set("demand")}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
        <div className="form-group"><label>Days Since Arrival</label><input className="form-control" type="number" value={fields.days_arrival} onChange={set("days_arrival")} /></div>
      </div>

      <button className="btn-primary" style={{ padding: "13px 40px", fontSize: 15 }} onClick={predict} disabled={loading}>
        {loading ? "Predicting…" : "Predict Discount →"}
      </button>

      {result && (
        <div className="result-card">
          <h3>💸 Discount Prediction Result</h3>
          <div className="metric-row">
            <div className="metric"><div className="metric-val">{result.discount}%</div><div className="metric-label">Recommended Discount</div></div>
            <div className="metric"><div className="metric-val">₹{result.final_price}</div><div className="metric-label">Final Price After Discount</div></div>
          </div>
          <div className={`alert ${result.discount > 0 ? "alert-success" : "alert-warning"}`} style={{ marginTop: 16 }}>
            {result.discount > 0
              ? `✓ Apply a ${result.discount}% discount. Final price: ₹${result.final_price}. This will help clear stock before expiry.`
              : "⚠ No discount recommended. Product has sufficient shelf life and strong demand."}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIPage({ onOpenModal, onOpenPayment }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("freshness");
  const [lockedOverlay, setLockedOverlay] = useState(false);
  const [discountPrefill, setDiscountPrefill] = useState(null);

  function handleNeedAuth() { onOpenModal("signup"); }
  function handleTrialExhausted() { setLockedOverlay(true); }

  return (
    <div>
      <div className="ai-header">
        <div className="section-tag" style={{ marginBottom: 16 }}>Powered by ML</div>
        <h2 style={{ marginBottom: 8 }}>Our AI Models</h2>
        <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 28 }}>
          Run real predictions using the trained freshness and discount models.
        </p>
        <div className="ai-tabs">
          <button className={`ai-tab${activeTab === "freshness" ? " active" : ""}`} onClick={() => setActiveTab("freshness")}>
            🥬 Freshness Prediction
          </button>
          <button className={`ai-tab${activeTab === "discount" ? " active" : ""}`} onClick={() => setActiveTab("discount")}>
            💸 Discount Prediction
          </button>
        </div>
      </div>

      <div className="ai-content">
        <TrialBar user={user} onUpgrade={() => onOpenPayment("monthly")} />

        {activeTab === "freshness" && (
          <FreshnessPanel
            user={user}
            onNeedAuth={handleNeedAuth}
            onTrialExhausted={handleTrialExhausted}
            onPredicted={prefill => setDiscountPrefill(prefill)}
          />
        )}
        {activeTab === "discount" && (
          <DiscountPanel
            user={user}
            prefill={discountPrefill}
            onNeedAuth={handleNeedAuth}
            onTrialExhausted={handleTrialExhausted}
          />
        )}
      </div>

      {/* Locked overlay */}
      {lockedOverlay && (
        <div className="locked-overlay show">
          <div className="locked-box">
            <div className="lock-icon">🔒</div>
            <h2>Free Trial Used Up</h2>
            <p>You've used all 3 free predictions. Upgrade to Pro for unlimited access to both AI models.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary btn-lg" onClick={() => { onOpenPayment("monthly"); setLockedOverlay(false); }}>
                Upgrade — ₹499/mo →
              </button>
              <button className="btn-ghost btn-lg" onClick={() => setLockedOverlay(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}