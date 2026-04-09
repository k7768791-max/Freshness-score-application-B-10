import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const THEME = {
  accent: "#00d4aa",
  accentGlow: "rgba(0, 212, 170, 0.2)",
  bg: "#05080a",
  surface: "#0c1214",
  surface2: "#141c1e",
  border: "rgba(255,255,255,0.08)",
  text: "#f0f4f5",
  text2: "#94a3b8",
  text3: "#64748b",
  pro: "#00d4aa",
  trial: "#fbbf24",
  admin: "#a855f7",
  danger: "#ef4444"
};

const s = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: THEME.bg,
    color: THEME.text,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  sidebar: {
    width: "280px",
    background: THEME.surface,
    borderRight: `1px solid ${THEME.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "40px 0",
    position: "fixed",
    height: "100vh",
    zIndex: 100
  },
  main: {
    flex: 1,
    marginLeft: "280px",
    padding: "48px 64px",
    maxWidth: "1400px"
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 28px",
    cursor: "pointer",
    color: active ? THEME.accent : THEME.text2,
    background: active ? "rgba(0, 212, 170, 0.05)" : "transparent",
    borderRight: active ? `3px solid ${THEME.accent}` : "3px solid transparent",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "14px",
    fontWeight: active ? "600" : "400"
  }),
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    marginBottom: "48px"
  },
  kpiCard: {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${THEME.border}`,
    borderRadius: "24px",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  statLabel: { fontSize: "13px", color: THEME.text3, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
  statValue: { fontSize: "32px", fontWeight: "800", color: THEME.text, letterSpacing: "-1px" },
  statTrend: (up) => ({ fontSize: "12px", color: up ? THEME.accent : THEME.danger, marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }),
  
  card: {
    background: THEME.surface,
    borderRadius: "24px",
    border: `1px solid ${THEME.border}`,
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)"
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" },
  th: { padding: "16px 24px", fontSize: "11px", fontWeight: "700", color: THEME.text3, textTransform: "uppercase", textAlign: "left" },
  tr: { background: "rgba(255,255,255,0.01)", transition: "all 0.2s" },
  td: { padding: "18px 24px", borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, fontSize: "14px" },
  
  badge: (type) => ({
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    background: `${THEME[type]}15`,
    color: THEME[type],
    border: `1px solid ${THEME[type]}30`
  })
};

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sR, uR] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }),
        fetch("/api/admin/users", { credentials: "include" }),
      ]);
      if (!sR.ok || !uR.ok) throw new Error("Synchronization Failed");
      setStats(await sR.json());
      setUsers(await uR.json());
    } catch (e) {
      showToast("Access restricted or network failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.fname} ${u.lname} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ ...s.container, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div className="admin-spinner"></div>
      <style>{`
        .admin-spinner { width: 40px; height: 40px; border: 3px solid rgba(0,212,170,0.1); border-top-color: #00d4aa; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div style={s.container}>
      <aside style={s.sidebar}>
        <div style={{ padding: "0 32px 40px" }}>
          <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-1px" }}>
            Fresh<span style={{ color: THEME.accent }}>Sense</span>
            <div style={{ fontSize: "10px", color: THEME.text3, letterSpacing: "2px", marginTop: "4px" }}>INTEL ENGINE</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={s.navItem(tab === "overview")} onClick={() => setTab("overview")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Overview
          </div>
          <div style={s.navItem(tab === "users")} onClick={() => setTab("users")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            User Registry
          </div>
          <div style={s.navItem(tab === "analytics")} onClick={() => setTab("analytics")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Analytics
          </div>
        </nav>

        <div style={{ padding: "32px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "16px", border: `1px solid ${THEME.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: THEME.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800" }}>{user?.fname?.[0]}</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user?.fname}</div>
                <div style={{ fontSize: "11px", color: THEME.text3 }}>Admin Access</div>
              </div>
            </div>
            <button onClick={logout} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: THEME.danger, border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Sign Out</button>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "8px" }}>Administration</h1>
            <p style={{ color: THEME.text2 }}>Monitoring project FreshSense growth and performance.</p>
          </div>
          <button onClick={fetchData} style={{ padding: "10px 20px", borderRadius: "12px", background: THEME.surface2, border: `1px solid ${THEME.border}`, color: THEME.text, cursor: "pointer", fontSize: "13px" }}>Refresh Data</button>
        </div>

        {tab === "overview" && (
          <>
            <div style={s.kpiGrid}>
              <div style={s.kpiCard}>
                <div style={s.statLabel}>Total Revenue</div>
                <div style={s.statValue}>₹{stats?.total_revenue.toLocaleString()}</div>
                <div style={s.statTrend(true)}>+12.5% from last month</div>
              </div>
              <div style={s.kpiCard}>
                <div style={s.statLabel}>Pro Members</div>
                <div style={s.statValue}>{stats?.pro_users}</div>
                <div style={s.statTrend(true)}>Healthy conversion</div>
              </div>
              <div style={s.kpiCard}>
                <div style={s.statLabel}>Active Predictions</div>
                <div style={s.statValue}>{stats?.total_predictions}</div>
                <div style={s.statTrend(true)}>Real-time throughput</div>
              </div>
              <div style={s.kpiCard}>
                <div style={s.statLabel}>Total Nodes</div>
                <div style={s.statValue}>{stats?.total_users}</div>
                <div style={s.statTrend(true)}>Connected users</div>
              </div>
            </div>

            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Recent User Activity</h3>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Identity</th>
                    <th style={s.th}>Plan</th>
                    <th style={s.th}>Activity</th>
                    <th style={s.th}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map((u, i) => (
                    <tr key={i} style={s.tr}>
                      <td style={{ ...s.td, borderLeft: `1px solid ${THEME.border}`, borderRadius: "12px 0 0 12px" }}>
                        <div style={{ fontWeight: "600" }}>{u.fname} {u.lname}</div>
                        <div style={{ fontSize: "12px", color: THEME.text3 }}>{u.email}</div>
                      </td>
                      <td style={s.td}><span style={s.badge(u.is_pro ? "pro" : "trial")}>{u.is_pro ? "PRO" : "FREE"}</span></td>
                      <td style={s.td}>{u.history_count} predictions</td>
                      <td style={{ ...s.td, borderRight: `1px solid ${THEME.border}`, borderRadius: "0 12px 12px 0" }}>
                        <span style={s.badge(u.is_admin ? "admin" : "retailer")}>{u.is_admin ? "Admin" : "Retailer"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "users" && (
          <div style={s.card}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Full Registry</h3>
                <input 
                  type="text" 
                  placeholder="Filter by name or email..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: THEME.surface2, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "12px 20px", borderRadius: "12px", width: "300px", outline: "none" }}
                />
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Plan</th>
                    <th style={s.th}>Usage</th>
                    <th style={s.th}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: "600" }}>{u.fname} {u.lname}</td>
                      <td style={{ ...s.td, color: THEME.text2 }}>{u.email}</td>
                      <td style={s.td}><span style={s.badge(u.is_pro ? "pro" : "trial")}>{u.is_pro ? "PRO" : "FREE"}</span></td>
                      <td style={s.td}>{u.history_count} calls</td>
                      <td style={s.td}><span style={s.badge(u.is_admin ? "admin" : "retailer")}>{u.is_admin ? "Admin" : "Retailer"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}

        {tab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
             <div style={s.card}>
               <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Category Distribution</h3>
               <p style={{ color: THEME.text3, marginBottom: "32px", fontSize: "14px" }}>Most active fruit & vegetable segments</p>
               <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                 {Object.entries(stats?.category_usage || {}).map(([cat, count]) => {
                   const percentage = (count / Math.max(stats.total_predictions, 1)) * 100;
                   return (
                     <div key={cat}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                         <span style={{ fontWeight: "600" }}>{cat}</span>
                         <span style={{ color: THEME.text3 }}>{count} calls ({percentage.toFixed(1)}%)</span>
                       </div>
                       <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                         <div style={{ height: "100%", width: `${percentage}%`, background: THEME.accent, borderRadius: "4px", boxShadow: `0 0 15px ${THEME.accent}40` }}></div>
                       </div>
                     </div>
                   );
                 })}
                 {Object.keys(stats?.category_usage || {}).length === 0 && (
                   <div style={{ textAlign: "center", padding: "40px", color: THEME.text3 }}>No activity data available yet.</div>
                 )}
               </div>
             </div>

             <div style={s.card}>
               <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Monetization</h3>
               <p style={{ color: THEME.text3, marginBottom: "32px", fontSize: "14px" }}>Subscription and revenue health</p>
               <div style={{ height: "200px", display: "flex", alignItems: "flex-end", gap: "24px", padding: "0 20px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1, width: "100%", background: THEME.accent, borderRadius: "8px", opacity: 0.2 }}>
                      <div style={{ height: `${(stats?.pro_users / Math.max(stats?.total_users, 1)) * 100}%`, width: "100%", background: THEME.accent, borderRadius: "8px", boxShadow: `0 0 20px ${THEME.accent}40` }}></div>
                    </div>
                    <span style={{ fontSize: "11px", color: THEME.text3 }}>PRO RATIO</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1, width: "100%", background: THEME.admin, borderRadius: "8px", opacity: 0.2 }}>
                      <div style={{ height: "40%", width: "100%", background: THEME.admin, borderRadius: "8px", boxShadow: `0 0 20px ${THEME.admin}40` }}></div>
                    </div>
                    <span style={{ fontSize: "11px", color: THEME.text3 }}>GROWTH</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1, width: "100%", background: THEME.trial, borderRadius: "8px", opacity: 0.2 }}>
                      <div style={{ height: "75%", width: "100%", background: THEME.trial, borderRadius: "8px", boxShadow: `0 0 20px ${THEME.trial}40` }}></div>
                    </div>
                    <span style={{ fontSize: "11px", color: THEME.text3 }}>ENGAGEMENT</span>
                  </div>
               </div>
               <div style={{ marginTop: "32px", borderTop: `1px solid ${THEME.border}`, paddingTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                 <div>
                   <div style={{ fontSize: "11px", color: THEME.text3, textTransform: "uppercase", marginBottom: "4px" }}>LTV Estimator</div>
                   <div style={{ fontSize: "20px", fontWeight: "700" }}>₹499.00</div>
                 </div>
                 <div>
                   <div style={{ fontSize: "11px", color: THEME.text3, textTransform: "uppercase", marginBottom: "4px" }}>Churn Rate</div>
                   <div style={{ fontSize: "20px", fontWeight: "700" }}>0.0%</div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
