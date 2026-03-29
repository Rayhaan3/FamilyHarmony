import React, { useState } from 'react';

const PERSON_COLORS = [
  { bg: '#FFE5E5', accent: '#FF6B6B', dot: '#FF6B6B' },
  { bg: '#E0FAF8', accent: '#4ECDC4', dot: '#4ECDC4' },
  { bg: '#FFF8D6', accent: '#FFD93D', dot: '#E6B800' },
  { bg: '#EAE8FF', accent: '#A29BFE', dot: '#A29BFE' },
  { bg: '#E2F7E4', accent: '#6BCB77', dot: '#6BCB77' },
];

const BUSY_OPTIONS = [
  { value: 'less', label: 'Free', icon: '😌' },
  { value: 'medium', label: 'Busy', icon: '😐' },
  { value: 'very', label: 'Slammed', icon: '😩' },
];

let personId = 3;

export default function ChoreSplitter({ onSplit, choreList, loading, error, onChoreHistoryCreated }) {
  const [people, setPeople] = useState([
    { id: 1, name: '', age: '', busy: 'less' },
    { id: 2, name: '', age: '', busy: 'less' },
  ]);
  const [chores, setChores] = useState([]);
  const [choreInput, setChoreInput] = useState('');
  const [shake, setShake] = useState(false);
  const [activeTab, setActiveTab] = useState('people');

  const addPerson = () => {
    if (people.length >= 5) return;
    setPeople([...people, { id: personId++, name: '', age: '', busy: 'less' }]);
  };

  const removePerson = (id) => {
    if (people.length <= 2) return;
    setPeople(people.filter((p) => p.id !== id));
  };

  const updatePerson = (id, field, val) =>
    setPeople(people.map((p) => (p.id === id ? { ...p, [field]: val } : p)));

  const addChore = () => {
    const t = choreInput.trim();
    if (!t) return;
    setChores([...chores, { id: Date.now(), text: t }]);
    setChoreInput('');
  };

  const removeChore = (id) => setChores(chores.filter((c) => c.id !== id));

  const handleSplit = async () => {
    const incomplete = people.some((p) => !p.name.trim());
    if (incomplete || chores.length === 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const members = people.map((p) => ({
      name: p.name.trim(),
      age: p.age || 'unknown age',
      hoursPerWeek: p.busy === 'less' ? 10 : p.busy === 'medium' ? 5 : 2,
      busyLevel: p.busy,
    }));
    const choreTexts = chores.map((c) => c.text);
    const result = await onSplit(members, choreTexts);
    
    // Call the history callback with full details
    if (onChoreHistoryCreated && result) {
      onChoreHistoryCreated(members, choreTexts, result);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cs-root {
          min-height: 100vh;
          background: #F5F0E8;
          padding: 48px 20px 80px;
          font-family: 'DM Sans', sans-serif;
        }

        .cs-container { max-width: 720px; margin: 0 auto; }

        .cs-header { text-align: center; margin-bottom: 36px; }

        .cs-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 3px;
          text-transform: uppercase; color: #A0917A; margin-bottom: 12px;
        }

        .cs-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(40px, 7vw, 64px);
          font-weight: 900; line-height: 0.95; color: #1C1C1C; margin-bottom: 12px;
        }

        .cs-title em { font-style: italic; color: #4ECDC4; }
        .cs-subtitle { font-size: 15px; color: #7A6F63; font-weight: 300; }

        .cs-tabs {
          display: flex; gap: 8px; margin-bottom: 20px;
          background: #EDE8DF; border-radius: 16px; padding: 6px;
        }

        .cs-tab {
          flex: 1; padding: 12px; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; color: #7A6F63; background: transparent;
        }

        .cs-tab.active {
          background: #fff; color: #1C1C1C;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .cs-card {
          background: #fff; border-radius: 24px; padding: 32px;
          margin-bottom: 16px; border: 1px solid #E8E2D9;
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }

        .cs-section-label {
          font-family: 'Fraunces', serif; font-size: 18px;
          font-weight: 700; color: #1C1C1C; margin-bottom: 18px;
        }

        .cs-people-list { display: flex; flex-direction: column; gap: 12px; }

        .cs-person { border-radius: 16px; padding: 18px; animation: slideIn 0.3s ease; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cs-person-row1 {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }

        .cs-person-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        .cs-name-input {
          flex: 1; border: none; background: transparent;
          font-family: 'Fraunces', serif; font-size: 15px;
          font-weight: 700; color: #1C1C1C; outline: none;
        }

        .cs-name-input::placeholder { color: #C5B9AD; font-style: italic; }

        .cs-age-input {
          width: 64px; padding: 6px 10px;
          border: 1.5px solid rgba(0,0,0,0.1); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #1C1C1C; background: rgba(255,255,255,0.7); outline: none;
          text-align: center;
        }

        .cs-remove-btn {
          background: none; border: none; cursor: pointer;
          color: #C5B9AD; font-size: 20px; transition: color 0.2s; line-height: 1;
        }

        .cs-remove-btn:hover { color: #FF6B6B; }

        .cs-busy-row { display: flex; gap: 8px; }

        .cs-busy-btn {
          flex: 1; padding: 8px 4px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.5);
          cursor: pointer; transition: all 0.2s; text-align: center;
        }

        .cs-busy-btn.selected {
          background: #fff; border-color: rgba(0,0,0,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cs-busy-icon { font-size: 18px; display: block; margin-bottom: 2px; }
        .cs-busy-label { font-size: 11px; font-weight: 500; color: #5C5248; }

        .cs-add-person-btn {
          width: 100%; padding: 13px; border: 2px dashed #D9D1C5;
          border-radius: 14px; background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #A0917A; cursor: pointer; transition: all 0.2s; margin-top: 4px;
        }

        .cs-add-person-btn:hover:not(:disabled) { border-color: #A0917A; color: #5C5248; }
        .cs-add-person-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cs-chore-input-row { display: flex; gap: 10px; margin-bottom: 16px; }

        .cs-chore-input {
          flex: 1; padding: 14px 18px; border: 2px solid #E8E2D9;
          border-radius: 14px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: #1C1C1C; background: #FAFAF7; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .cs-chore-input:focus {
          border-color: #4ECDC4;
          box-shadow: 0 0 0 4px rgba(78,205,196,0.1);
          background: #fff;
        }

        .cs-chore-input::placeholder { color: #C5B9AD; }

        .cs-chore-add-btn {
          padding: 14px 22px; background: #1C1C1C; color: #fff;
          border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .cs-chore-add-btn:hover { background: #333; transform: scale(1.02); }

        .cs-empty-chores {
          text-align: center; padding: 40px 20px;
          color: #C5B9AD; font-size: 14px;
          border: 2px dashed #E8E2D9; border-radius: 14px;
          line-height: 1.6;
        }

        .cs-empty-icon { font-size: 36px; margin-bottom: 10px; display: block; }

        .cs-chore-list { display: flex; flex-direction: column; gap: 8px; }

        .cs-chore-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; background: #F8F4EE;
          border-radius: 12px; border: 1px solid #EDE8DF;
          animation: slideIn 0.2s ease;
        }

        .cs-chore-number {
          font-family: 'Fraunces', serif; font-size: 13px;
          font-weight: 700; color: #C5B9AD; width: 20px;
          text-align: center; flex-shrink: 0;
        }

        .cs-chore-text { flex: 1; font-size: 14px; color: #2E2820; }

        .cs-chore-remove {
          background: none; border: none; cursor: pointer;
          color: #C5B9AD; font-size: 18px; transition: color 0.2s; line-height: 1;
        }

        .cs-chore-remove:hover { color: #FF6B6B; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }

        .cs-split-btn {
          width: 100%; padding: 20px; background: #1C1C1C; color: #F5F0E8;
          border: none; border-radius: 18px; font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 6px 24px rgba(0,0,0,0.18);
        }

        .cs-split-btn:hover:not(:disabled) {
          background: #2E2E2E; transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.22);
        }

        .cs-split-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cs-split-btn.shake { animation: shake 0.5s ease; }

        .cs-loading-dots { display: flex; gap: 5px; align-items: center; justify-content: center; }
        .cs-loading-dots span {
          width: 6px; height: 6px; background: #F5F0E8;
          border-radius: 50%; animation: dot-bounce 1.2s infinite;
        }
        .cs-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .cs-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        .cs-error {
          text-align: center; color: #CC3333; font-size: 14px;
          padding: 12px; background: #FFE8E8; border-radius: 10px; margin-top: 12px;
        }

        .cs-result { animation: fadeUp 0.5s ease; margin-top: 20px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cs-result-header {
          background: #1C1C1C; border-radius: 24px; padding: 32px;
          text-align: center; margin-bottom: 16px;
        }

        .cs-result-eyebrow {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: #7A7068; margin-bottom: 10px;
        }

        .cs-result-title {
          font-family: 'Fraunces', serif; font-size: 32px;
          font-weight: 900; color: #4ECDC4;
        }

        .cs-result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }

        .cs-person-result { border-radius: 20px; padding: 24px; }

        .cs-person-result-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }

        .cs-person-result-dot { width: 12px; height: 12px; border-radius: 50%; }

        .cs-person-result-name {
          font-family: 'Fraunces', serif; font-size: 18px;
          font-weight: 700; color: #1C1C1C;
        }

        .cs-chore-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 100px;
          font-size: 13px; color: #2E2820; margin: 4px 4px 0 0;
        }

        .cs-reset-btn {
          width: 100%; padding: 16px; border: 2px solid #E8E2D9;
          border-radius: 14px; background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #7A6F63; cursor: pointer; transition: all 0.2s; margin-top: 16px;
        }

        .cs-reset-btn:hover { border-color: #A0917A; color: #1C1C1C; }
      `}</style>

      <div className="cs-root">
        <div className="cs-container">
          <div className="cs-header">
            <p className="cs-eyebrow">⊹ Fair for everyone ⊹</p>
            <h1 className="cs-title">Chore<em>Split</em></h1>
            <p className="cs-subtitle">Add your people and chores — AI divides them fairly.</p>
          </div>

          {!choreList ? (
            <>
              <div className="cs-tabs">
                <button
                  className={`cs-tab${activeTab === 'people' ? ' active' : ''}`}
                  onClick={() => setActiveTab('people')}
                >
                  👥 People ({people.length})
                </button>
                <button
                  className={`cs-tab${activeTab === 'chores' ? ' active' : ''}`}
                  onClick={() => setActiveTab('chores')}
                >
                  🧹 Chores ({chores.length})
                </button>
              </div>

              {activeTab === 'people' && (
                <div className="cs-card">
                  <p className="cs-section-label">👥 Who's doing chores today?</p>
                  <div className="cs-people-list">
                    {people.map((person, idx) => {
                      const color = PERSON_COLORS[idx % PERSON_COLORS.length];
                      return (
                        <div key={person.id} className="cs-person" style={{ background: color.bg }}>
                          <div className="cs-person-row1">
                            <div className="cs-person-dot" style={{ background: color.dot }} />
                            <input
                              className="cs-name-input"
                              placeholder={`Person ${idx + 1}'s name`}
                              value={person.name}
                              onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                            />
                            <input
                              className="cs-age-input"
                              placeholder="Age"
                              type="number"
                              min="1" max="99"
                              value={person.age}
                              onChange={(e) => updatePerson(person.id, 'age', e.target.value)}
                            />
                            {people.length > 2 && (
                              <button className="cs-remove-btn" onClick={() => removePerson(person.id)}>×</button>
                            )}
                          </div>
                          <div className="cs-busy-row">
                            {BUSY_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                className={`cs-busy-btn${person.busy === opt.value ? ' selected' : ''}`}
                                onClick={() => updatePerson(person.id, 'busy', opt.value)}
                              >
                                <span className="cs-busy-icon">{opt.icon}</span>
                                <span className="cs-busy-label">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <button className="cs-add-person-btn" onClick={addPerson} disabled={people.length >= 5}>
                      + Add another person {people.length >= 5 ? '(max 5)' : ''}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'chores' && (
                <div className="cs-card">
                  <p className="cs-section-label">🧹 What needs to get done?</p>
                  <div className="cs-chore-input-row">
                    <input
                      className="cs-chore-input"
                      placeholder="Type a chore and press Add or Enter…"
                      value={choreInput}
                      onChange={(e) => setChoreInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addChore()}
                    />
                    <button className="cs-chore-add-btn" onClick={addChore}>Add</button>
                  </div>

                  {chores.length === 0 ? (
                    <div className="cs-empty-chores">
                      <span className="cs-empty-icon">🧹</span>
                      No chores added yet.<br />Type a chore above and press Add!
                    </div>
                  ) : (
                    <div className="cs-chore-list">
                      {chores.map((chore, i) => (
                        <div key={chore.id} className="cs-chore-item">
                          <span className="cs-chore-number">{i + 1}</span>
                          <span className="cs-chore-text">{chore.text}</span>
                          <button className="cs-chore-remove" onClick={() => removeChore(chore.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className={`cs-split-btn${shake ? ' shake' : ''}`}
                onClick={handleSplit}
                disabled={loading}
              >
                {loading ? (
                  <div className="cs-loading-dots"><span /><span /><span /></div>
                ) : '⊹ Split Chores Fairly'}
              </button>

              {error && <div className="cs-error">{error}</div>}
            </>
          ) : (
            <div className="cs-result">
              <div className="cs-result-header">
                <p className="cs-result-eyebrow">Chores have been divided</p>
                <h2 className="cs-result-title">Here's the plan ✓</h2>
              </div>
              <div className="cs-result-grid">
                {choreList.map((person, idx) => {
                  const color = PERSON_COLORS[idx % PERSON_COLORS.length];
                  return (
                    <div key={idx} className="cs-person-result" style={{ background: color.bg }}>
                      <div className="cs-person-result-header">
                        <div className="cs-person-result-dot" style={{ background: color.dot }} />
                        <p className="cs-person-result-name">{person.name}</p>
                      </div>
                      <div>
                        {person.chores.map((chore, i) => (
                          <span
                            key={i}
                            className="cs-chore-tag"
                            style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${color.accent}44` }}
                          >
                            🧹 {chore}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="cs-reset-btn" onClick={() => window.location.reload()}>
                ↩ Split new chores
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}