import React, { useState, useRef } from "react";

const COLORS = [
  { bg: "#FF6B6B", light: "#FFE5E5", name: "Coral" },
  { bg: "#4ECDC4", light: "#E0FAF8", name: "Teal" },
  { bg: "#FFD93D", light: "#FFF8D6", name: "Amber" },
  { bg: "#A29BFE", light: "#EAE8FF", name: "Violet" },
  { bg: "#6BCB77", light: "#E2F7E4", name: "Sage" },
];

const DEFAULT_PEOPLE = [
  { id: 1, name: "", preference: "", color: COLORS[0] },
  { id: 2, name: "", preference: "", color: COLORS[1] },
];

let idCounter = 3;

export default function CompromiseGenerator({ goBack, onCompromiseGenerated }) {
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const resultRef = useRef(null);

  const addPerson = () => {
    if (people.length >= 5) return;
    setPeople((prev) => [
      ...prev,
      {
        id: idCounter++,
        name: "",
        preference: "",
        color: COLORS[prev.length % COLORS.length],
      },
    ]);
  };

  const removePerson = (id) => {
    if (people.length <= 2) return;
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePerson = (id, field, value) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleGenerate = async () => {
    const incomplete = people.some((p) => !p.preference.trim());
    if (!topic.trim() || incomplete) {
      triggerShake();
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/compromise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          people: people,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Backend request failed");
      }
      
      const parsed = await response.json();
      setResult(parsed);
      if (onCompromiseGenerated) {
        onCompromiseGenerated(topic, people, parsed);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error("Error:", e);
      setError("Backend connection failed. Make sure your server is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setPeople(DEFAULT_PEOPLE.map((p) => ({ ...p, name: "", preference: "" })));
    setTopic("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;0,900;1,300;1,700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F0E8; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .cg-root { min-height: 100vh; background: #F5F0E8; padding: 48px 20px 80px; position: relative; overflow: hidden; }
        .cg-root::before { content: ''; position: fixed; top: -200px; right: -200px; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, #FFD93D33 0%, transparent 70%); pointer-events: none; }
        .cg-root::after { content: ''; position: fixed; bottom: -200px; left: -150px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, #FF6B6B22 0%, transparent 70%); pointer-events: none; }
        .cg-container { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
        .cg-header { text-align: center; margin-bottom: 48px; }
        .cg-eyebrow { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #A0917A; margin-bottom: 12px; }
        .cg-title { font-family: 'Fraunces', serif; font-size: clamp(42px, 8vw, 72px); font-weight: 900; line-height: 0.95; color: #1C1C1C; margin-bottom: 16px; }
        .cg-title em { font-style: italic; color: #FF6B6B; }
        .cg-subtitle { font-family: 'DM Sans', sans-serif; font-size: 15px; color: #7A6F63; font-weight: 300; }
        .cg-card { background: #FFFFFF; border-radius: 24px; padding: 36px; margin-bottom: 20px; border: 1px solid #E8E2D9; box-shadow: 0 2px 20px rgba(0,0,0,0.04); }
        .cg-section-label { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; color: #1C1C1C; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .cg-topic-input { width: 100%; padding: 16px 20px; border: 2px solid #E8E2D9; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; color: #1C1C1C; background: #FAFAF7; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .cg-topic-input:focus { border-color: #FF6B6B; box-shadow: 0 0 0 4px rgba(255,107,107,0.1); background: #fff; }
        .cg-topic-input::placeholder { color: #C5B9AD; }
        .cg-people-grid { display: flex; flex-direction: column; gap: 14px; }
        .cg-person-card { border-radius: 16px; padding: 20px; border: 2px solid transparent; transition: border-color 0.2s, box-shadow 0.2s; position: relative; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .cg-person-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .cg-person-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .cg-person-name-input { flex: 1; border: none; background: transparent; font-family: 'Fraunces', serif; font-size: 15px; font-weight: 700; color: #1C1C1C; outline: none; }
        .cg-person-name-input::placeholder { color: #C5B9AD; font-style: italic; }
        .cg-remove-btn { background: none; border: none; cursor: pointer; color: #C5B9AD; font-size: 18px; line-height: 1; padding: 2px; transition: color 0.2s; margin-left: auto; }
        .cg-remove-btn:hover { color: #FF6B6B; }
        .cg-pref-input { width: 100%; padding: 12px 14px; border: 1.5px solid rgba(0,0,0,0.1); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1C1C1C; background: rgba(255,255,255,0.7); outline: none; resize: vertical; min-height: 72px; transition: border-color 0.2s, box-shadow 0.2s; }
        .cg-pref-input:focus { border-color: rgba(0,0,0,0.25); box-shadow: 0 0 0 3px rgba(0,0,0,0.05); background: #fff; }
        .cg-pref-input::placeholder { color: #B8A89A; }
        .cg-add-btn { width: 100%; padding: 14px; border: 2px dashed #D9D1C5; border-radius: 14px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A0917A; cursor: pointer; transition: all 0.2s; margin-top: 6px; }
        .cg-add-btn:hover:not(:disabled) { border-color: #A0917A; color: #5C5248; background: #F5F0E866; }
        .cg-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
        .cg-generate-btn { width: 100%; padding: 20px; background: #1C1C1C; color: #F5F0E8; border: none; border-radius: 18px; font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 6px 24px rgba(0,0,0,0.18); position: relative; overflow: hidden; letter-spacing: -0.3px; }
        .cg-generate-btn:hover:not(:disabled) { background: #2E2E2E; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.22); }
        .cg-generate-btn:active:not(:disabled) { transform: translateY(0); }
        .cg-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cg-generate-btn.shake { animation: shake 0.5s ease; }
        .cg-btn-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .cg-loading-dots { display: flex; gap: 5px; align-items: center; }
        .cg-loading-dots span { width: 6px; height: 6px; background: #F5F0E8; border-radius: 50%; animation: dot-bounce 1.2s infinite; }
        .cg-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .cg-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }
        .cg-error { text-align: center; color: #CC3333; font-size: 14px; padding: 12px; background: #FFE8E8; border-radius: 10px; margin-top: 12px; }
        .cg-result { animation: fadeUp 0.5s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .cg-result-hero { background: #1C1C1C; border-radius: 24px; padding: 40px; margin-bottom: 16px; color: #F5F0E8; text-align: center; }
        .cg-result-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #7A7068; margin-bottom: 16px; }
        .cg-result-name { font-family: 'Fraunces', serif; font-size: clamp(28px, 5vw, 44px); font-weight: 900; line-height: 1.1; color: #FFD93D; margin-bottom: 16px; }
        .cg-result-tagline { font-size: 15px; color: #A09880; font-style: italic; margin-bottom: 24px; }
        .cg-fairness-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .cg-fairness-badge { background: #2E2E2E; border-radius: 100px; padding: 8px 20px; font-family: 'Fraunces', serif; font-size: 15px; font-weight: 700; color: #6BCB77; }
        .cg-fairness-reason { font-size: 13px; color: #7A7068; max-width: 300px; }
        .cg-result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 500px) { .cg-result-grid { grid-template-columns: 1fr; } }
        .cg-mini-card { border-radius: 16px; padding: 20px; }
        .cg-mini-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #A0917A; margin-bottom: 10px; }
        .cg-person-ack { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .cg-person-ack:last-child { margin-bottom: 0; }
        .cg-ack-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .cg-ack-text { font-size: 13px; color: #5C5248; line-height: 1.5; }
        .cg-compromise-card { background: #FFFFFF; border-radius: 20px; padding: 28px; border: 1px solid #E8E2D9; margin-bottom: 16px; }
        .cg-compromise-label { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #A0917A; margin-bottom: 12px; }
        .cg-compromise-text { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #2E2820; line-height: 1.7; }
        .cg-reset-btn { width: 100%; padding: 16px; border: 2px solid #E8E2D9; border-radius: 14px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #7A6F63; cursor: pointer; transition: all 0.2s; }
        .cg-reset-btn:hover { border-color: #A0917A; color: #1C1C1C; background: #F5F0E866; }
      `}</style>
      <div className="cg-root">
        <div className="cg-container">
          <div className="cg-header">
            <p className="cg-eyebrow">✦ The Art of Meeting in the Middle ✦</p>
            <h1 className="cg-title">Compro<em>mise</em></h1>
            <p className="cg-subtitle">Enter everyone's preferences. Walk away with a fair deal.</p>
          </div>
          {!result ? (
            <>
              <div className="cg-card">
                <p className="cg-section-label"><span>🎯</span> What are you deciding on?</p>
                <input
                  className="cg-topic-input"
                  placeholder="e.g. Where to eat dinner, what movie to watch, weekend plans…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="cg-card">
                <p className="cg-section-label"><span>👥</span> Who's involved?</p>
                <div className="cg-people-grid">
                  {people.map((person, idx) => (
                    <div key={person.id} className="cg-person-card" style={{ background: person.color.light, borderColor: "transparent" }}>
                      <div className="cg-person-header">
                        <div className="cg-person-dot" style={{ background: person.color.bg }} />
                        <input
                          className="cg-person-name-input"
                          placeholder={`Person ${idx + 1}'s name`}
                          value={person.name}
                          onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                        />
                        {people.length > 2 && (
                          <button className="cg-remove-btn" onClick={() => removePerson(person.id)}>×</button>
                        )}
                      </div>
                      <textarea
                        className="cg-pref-input"
                        placeholder={`What does ${person.name.trim() || `Person ${idx + 1}`} want?`}
                        value={person.preference}
                        onChange={(e) => updatePerson(person.id, "preference", e.target.value)}
                      />
                    </div>
                  ))}
                  <button className="cg-add-btn" onClick={addPerson} disabled={people.length >= 5}>
                    + Add another person {people.length >= 5 ? "(max 5)" : ""}
                  </button>
                </div>
              </div>
              <button className={`cg-generate-btn${shake ? " shake" : ""}`} onClick={handleGenerate} disabled={loading}>
                <div className="cg-btn-inner">
                  {loading ? (
                    <>Finding middle ground<div className="cg-loading-dots"><span /><span /><span /></div></>
                  ) : (
                    <>✦ Generate Compromise</>
                  )}
                </div>
              </button>
              {error && <div className="cg-error">{error}</div>}
            </>
          ) : (
            <div className="cg-result" ref={resultRef}>
              <div className="cg-result-hero">
                <p className="cg-result-eyebrow">Your compromise is ready</p>
                <h2 className="cg-result-name">"{result.compromiseName}"</h2>
                <p className="cg-result-tagline">{result.tagline}</p>
                <div className="cg-fairness-row">
                  <div className="cg-fairness-badge">Fairness {result.fairnessScore}/10</div>
                  <p className="cg-fairness-reason">{result.fairnessReason}</p>
                </div>
              </div>
              <div className="cg-result-grid">
                <div className="cg-mini-card" style={{ background: "#FFF8F0" }}>
                  <p className="cg-mini-label">Feelings heard</p>
                  {result.acknowledgements?.map((ack, i) => (
                    <div className="cg-person-ack" key={i}>
                      <div className="cg-ack-dot" style={{ background: people[i]?.color?.bg || "#CCC" }} />
                      <p className="cg-ack-text">{ack}</p>
                    </div>
                  ))}
                </div>
                <div className="cg-mini-card" style={{ background: "#F0FFF4" }}>
                  <p className="cg-mini-label">Core needs</p>
                  {result.coreNeeds?.map((need, i) => (
                    <div className="cg-person-ack" key={i}>
                      <div className="cg-ack-dot" style={{ background: people[i]?.color?.bg || "#CCC" }} />
                      <p className="cg-ack-text">{need}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cg-compromise-card">
                <p className="cg-compromise-label">The compromise</p>
                <p className="cg-compromise-text">{result.compromise}</p>
              </div>
              <button className="cg-reset-btn" onClick={reset}>↩ Start over with a new decision</button>
              <button className="cg-reset-btn" onClick={goBack} style={{ marginTop: '12px' }}>← Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}