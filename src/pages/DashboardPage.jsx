import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user, API } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch(`${API}/api/dashboard/stats`, { credentials: "include" }),
          fetch(`${API}/api/dashboard/history`, { credentials: "include" })
        ]);

        const sData = await sRes.json();
        const hData = await hRes.json();

        if (sRes.ok) setStats(sData);
        if (hRes.ok) setHistory(hData);
      } catch (err) {
        showToast("Failed to sync dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user, showToast]);

  if (loading) return <div className="dash-loading">Syncing your data...</div>;

  if (!user) {
    return (
      <div className="dash-empty">
        <div className="empty-icon">👤</div>
        <h2>Sign in to view your dashboard</h2>
        <p>Your prediction history and stats will appear here once you're logged in.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <div className="dash-welcome">
          <div className="section-tag">Overview</div>
          <h1>Welcome back, {user.fname}</h1>
          <p>Monitor your freshness trends and discount strategies in one place.</p>
        </div>
        {user.is_pro && <div className="pro-pill">✦ Pro Member</div>}
      </header>

      <div className="dash-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">Total Predictions</div>
            <div className="stat-value">{stats?.total_predictions || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🥬</div>
          <div className="stat-info">
            <div className="stat-label">Avg. Freshness</div>
            <div className="stat-value">{stats?.avg_freshness || 0}%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱</div>
          <div className="stat-info">
            <div className="stat-label">Trial Usage</div>
            <div className="stat-value">{user.trial_used}/3</div>
          </div>
        </div>
      </div>

      <div className="dash-main-grid">
        <section className="dash-section dash-history">
          <div className="section-header">
            <h3>Recent Predictions</h3>
            <button className="btn-ghost btn-ghost--sm">Export CSV</button>
          </div>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category / Result</th>
                  <th>Details</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <span className={`type-tag type-${h.type}`}>
                          {h.type === "freshness" ? "🥬 Freshness" : "💸 Discount"}
                        </span>
                      </td>
                      <td>
                        {h.type === "freshness" ? (
                          <div className="res-cell">
                            <strong>{h.category}</strong>
                            <span className={`status-pill status-${h.status.toLowerCase()}`}>{h.status}</span>
                          </div>
                        ) : (
                          <div className="res-cell">
                             <strong>{h.discount}% Discount</strong>
                             <span>₹{h.final_price} Final</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {h.type === "freshness" 
                          ? `Score: ${h.score}% (${h.remaining}d left)`
                          : `Freshness was ${h.freshness}%`
                        }
                      </td>
                      <td>{new Date(h.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-row">No history yet. Start predicting in "Our AI".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dash-section dash-charts">
          <h3>Category Breakdown</h3>
          <div className="chart-placeholder">
             {stats?.category_breakdown && Object.keys(stats.category_breakdown).length > 0 ? (
               <div className="cat-bars">
                 {Object.entries(stats.category_breakdown).map(([cat, count]) => (
                   <div className="cat-bar-row" key={cat}>
                     <div className="cat-label">{cat}</div>
                     <div className="cat-track">
                       <div className="cat-fill" style={{ width: `${Math.min(100, (count / (stats.total_predictions || 1)) * 100)}%` }}></div>
                     </div>
                     <div className="cat-count">{count}</div>
                   </div>
                 ))}
               </div>
             ) : (
               <p style={{ color: "var(--text3)", fontSize: 13 }}>Prediction data will appear as charts here.</p>
             )}
          </div>
          
          <div className="dash-promo-card">
            <h4>Optimize Your Inventory</h4>
            <p>Our ML models are learning from your inputs. Keep predicting to improve accuracy.</p>
          </div>
        </section>
      </div>
    </div>
  );
}