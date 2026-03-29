import React, { useState } from "react";

const palette = {
  bg: "#FFFAF5",
  yellow: "#FFF0A0",
  yellowLight: "#FFFBE0",
  yellowDark: "#F0C800",
  pink: "#FFD6E0",
  pinkLight: "#FFE8EF",
  pinkDark: "#D4688A",
  rose: "#FFB3C6",
  card: "#FFFFFF",
  text: "#2D1B26",
  textMuted: "#B08090",
  border: "#FAE0E8",
  accent: "#FF9AB5",
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#FFFAF5", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", top: "-100px", right: "-100px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, #FFFBE0 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  blob2: { position: "fixed", bottom: "-120px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, #FFE8EF 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  inner: { position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto", padding: "40px 24px 60px" },
  badge: { display: "inline-block", backgroundColor: "#FFE8EF", color: "#D4688A", fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 14px", borderRadius: "100px", marginBottom: "12px" },
  title: { fontSize: "clamp(26px, 5vw, 40px)", fontWeight: "700", color: "#2D1B26", margin: "0 0 6px", lineHeight: 1.15, fontFamily: "Georgia, serif" },
  subtitle: { fontSize: "14px", color: "#B08090", margin: "0 0 32px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "22px" },
  section: { backgroundColor: "#fff", borderRadius: "22px", padding: "22px", marginBottom: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #FAE0E8" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#2D1B26", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" },
  aiBox: { borderRadius: "16px", border: "1.5px solid #FFB3C6", padding: "18px", background: "linear-gradient(135deg, #FFE8EF88 0%, #FFFBE088 100%)" },
  noData: { textAlign: "center", color: "#B08090", fontSize: "14px", padding: "20px 0" },
};

function computeStats(history) {
  if (!history || history.length === 0) return null;
  const topicCount = {}, memberCount = {}, timeCount = {}, instigatorCount = {};
  history.forEach((item) => {
    const topic = item.topic || "Unknown";
    topicCount[topic] = (topicCount[topic] || 0) + 1;
    (item.members || []).forEach((m) => { memberCount[m] = (memberCount[m] || 0) + 1; });
    const time = item.time || "Unknown";
    timeCount[time] = (timeCount[time] || 0) + 1;
    if (item.instigator) instigatorCount[item.instigator] = (instigatorCount[item.instigator] || 0) + 1;
  });
  const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0];
  return {
    topTopic: top(topicCount)?.[0] || "—",
    topMember: top(memberCount)?.[0] || "—",
    topTime: top(timeCount)?.[0] || "—",
    topInstigator: top(instigatorCount)?.[0] || null,
    total: history.length,
  };
}

export default function Dashboard({ goBack, choresHistory = [], compromiseHistory = [], onReset }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

  console.log('[Dashboard.js] Received choresHistory:', choresHistory);
  console.log('[Dashboard.js] Received compromiseHistory:', compromiseHistory);

  const displayHistory = [
    ...choresHistory.map((h) => ({ ...h, source: "Chores" })),
    ...compromiseHistory.map((h) => ({ ...h, source: "Compromise" })),
  ];
  
  console.log('[Dashboard.js] displayHistory:', displayHistory);

  const stats = computeStats(displayHistory);
  const statCards = stats ? [
    { emoji: "🔥", label: "Top Conflict Topic", value: stats.topTopic, color: "#FFFBE0" },
    { emoji: "👤", label: "Most Involved", value: stats.topMember, color: "#FFE8EF" },
    { emoji: "🕐", label: "Peak Time", value: stats.topTime, color: "#FDFAE0" },
    { emoji: "📋", label: "Total Conflicts", value: `${stats.total}`, color: "#EDFAF3" },
  ] : [];

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAiInsights(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a family conflict analyst. Analyze these conflict records and find patterns.\n\nConflict history:\n${JSON.stringify(displayHistory, null, 2)}\n\nRespond ONLY with a JSON array, no markdown, no explanation:\n[{ "pattern": "Short description", "detail": "Longer explanation" }]` }],
        }),
      });
      const data = await response.json();
      const text = data.content[0].text.trim();
      const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiInsights(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      setError("Something went wrong analyzing patterns. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAiInsights(null);
    setError(null);
    setConfirmReset(false);
    if (onReset) onReset();
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.inner}>
        <div style={styles.badge}>Family Insights</div>
        <h1 style={styles.title}>Conflict Dashboard 🌸</h1>
        <p style={styles.subtitle}>Patterns from your Chores Splitter & Compromise Generator history</p>

        {stats && (
          <div style={styles.statsRow}>
            {statCards.map((s) => (
              <div key={s.label} style={{ borderRadius: "20px", padding: "18px 16px", backgroundColor: s.color, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", transition: "transform 0.2s", cursor: "default" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                <span style={{ fontSize: "24px", marginBottom: "8px", display: "block" }}>{s.emoji}</span>
                <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B08090", marginBottom: "4px" }}>{s.label}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#2D1B26" }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.topInstigator && (
          <div style={{ ...styles.section, borderLeft: "4px solid #FFB3C6" }}>
            <div style={styles.sectionTitle}>💬 Who Usually Starts It?</div>
            <p style={{ fontSize: "14px", color: "#2D1B26", margin: 0, lineHeight: 1.6 }}>
              Based on your history, <strong style={{ color: "#D4688A" }}>{stats.topInstigator}</strong> tends to initiate conflicts most often. This might be worth a gentle family conversation. 💛
            </p>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            📂 Combined Conflict History
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "100px", backgroundColor: "#FFFBE0", fontSize: "11px", fontWeight: "600", color: "#2D1B26", marginLeft: "auto" }}>
              {displayHistory.length} entries
            </span>
          </div>
          {displayHistory.length === 0 ? (
            <div style={styles.noData}>
              No history yet. Use the Chore Splitter and Compromise Generator to build your conflict history! 📝
            </div>
          ) : (
            displayHistory.slice(0, 6).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 13px", borderRadius: "13px", backgroundColor: item.source === "Chores" ? "#FFFBE0" : "#FFE8EF", marginBottom: "9px", fontSize: "14px", color: "#2D1B26" }}>
                <span style={{ fontSize: "18px" }}>{item.source === "Chores" ? "🧹" : "🤝"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", marginBottom: "2px" }}>{item.topic}</div>
                  {item.instigator && <div style={{ fontSize: "12px", color: "#B08090", fontStyle: "italic" }}>Started by {item.instigator}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "100px", backgroundColor: "#FFD6E0", fontSize: "11px", fontWeight: "600", color: "#2D1B26" }}>{(item.members || []).join(" & ")}</span>
                  <span style={{ fontSize: "11px", color: "#B08090" }}>{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          style={{ width: "100%", padding: "15px", background: loading ? "#E8D8DF" : "linear-gradient(135deg, #FFB3C6 0%, #D4688A 100%)", color: loading ? "#B09098" : "#fff", border: "none", borderRadius: "15px", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "700", boxShadow: loading ? "none" : "0 4px 16px #FFB3C688", transition: "transform 0.15s", marginBottom: "14px" }}
          onClick={handleAnalyze}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {loading ? "✨ Analyzing your family patterns…" : "✨ Analyze Conflict Patterns with AI"}
        </button>

        {error && <div style={{ backgroundColor: "#FFE8E8", color: "#CC3333", border: "1px solid #FFBBBB", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", marginBottom: "14px" }}>⚠️ {error}</div>}

        {aiInsights && aiInsights.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🌟 AI Insights</div>
            <div style={styles.aiBox}>
              {aiInsights.map((item, i) => (
                <div key={i} style={{ padding: "11px 0", borderBottom: i === aiInsights.length - 1 ? "none" : "1px dashed #FAE0E8", fontSize: "14px", color: "#2D1B26", lineHeight: 1.6 }}>
                  <strong style={{ color: "#D4688A" }}>{item.pattern}:</strong> {item.detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {!confirmReset ? (
          <button
            style={{ width: "100%", padding: "14px", background: "transparent", color: "#CC3333", border: "2px solid #FFBBBB", borderRadius: "15px", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "background 0.2s", marginBottom: "14px" }}
            onClick={() => setConfirmReset(true)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FFE8E8"; e.currentTarget.style.borderColor = "#FF6B6B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#FFBBBB"; }}
          >
            🗑️ Reset All Data
          </button>
        ) : (
          <div style={{ backgroundColor: "#FFF0F0", border: "2px solid #FFBBBB", borderRadius: "16px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#2D1B26", marginBottom: "16px" }}>
              Are you sure? This will clear all conflict history and insights.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handleReset} style={{ padding: "10px 24px", background: "#CC3333", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                Yes, reset everything
              </button>
              <button onClick={() => setConfirmReset(false)} style={{ padding: "10px 24px", background: "#FFFBE0", color: "#2D1B26", border: "1px solid #F0C80044", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          style={{ padding: "12px 26px", backgroundColor: "#FFFBE0", color: "#2D1B26", border: "1.5px solid #F0C80044", borderRadius: "13px", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "background 0.2s" }}
          onClick={goBack}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF0A0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFBE0")}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}