import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    name: "Compromise Generator",
    link: "/compromise-generator",
    emoji: "✦",
    tagline: "Turn disagreements into fair deals",
    bg: "#FFE5E5",
    accent: "#FF6B6B",
    dark: "#CC3333",
    delay: "0.1s",
  },
  {
    name: "Smart Chore Splitter",
    link: "/chore-splitter",
    emoji: "⊹",
    tagline: "Divide tasks, multiply harmony",
    bg: "#E0FAF8",
    accent: "#4ECDC4",
    dark: "#2A9D8F",
    delay: "0.2s",
  },
  {
    name: "Conflict Insights",
    link: "/dashboard",
    emoji: "◈",
    tagline: "Understand patterns, prevent friction",
    bg: "#FFF8D6",
    accent: "#FFD93D",
    dark: "#B8940A",
    delay: "0.3s",
  },
  {
    name: "Therapy Chat",
    link: "/therapist-chatbot",
    emoji: "💚",
    tagline: "Talk to your AI therapist anytime",
    bg: "#E2F7E4",
    accent: "#6BCB77",
    dark: "#4A8C52",
    delay: "0.4s",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root {
          min-height: 100vh;
          background: #F5F0E8;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
        }

        .hp-root::before {
          content: '';
          position: fixed;
          top: -300px; right: -200px;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, #FFD93D18 0%, transparent 65%);
          pointer-events: none;
        }

        .hp-root::after {
          content: '';
          position: fixed;
          bottom: -250px; left: -200px;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, #FF6B6B12 0%, transparent 65%);
          pointer-events: none;
        }

        .hp-container {
          max-width: 1000px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .hp-header {
          text-align: center;
          margin-bottom: 64px;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hp-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #A0917A;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .hp-eyebrow::before, .hp-eyebrow::after {
          content: '';
          width: 40px; height: 1px;
          background: #C5B9AD;
        }

        .hp-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(52px, 10vw, 96px);
          font-weight: 900;
          line-height: 0.9;
          color: #1C1C1C;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }

        .hp-title-line2 {
          font-style: italic;
          color: #FF6B6B;
          display: block;
        }

        .hp-subtitle {
          font-size: 17px;
          color: #7A6F63;
          font-weight: 300;
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .hp-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (max-width: 700px) {
          .hp-cards { grid-template-columns: 1fr; }
          .hp-title { letter-spacing: -1px; }
        }

        .hp-card {
          border-radius: 28px;
          padding: 36px 28px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation: fadeUp 0.5s ease both;
        }

        .hp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 26px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .hp-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
        }

        .hp-card-emoji {
          font-size: 36px;
          margin-bottom: 20px;
          display: block;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        .hp-card:hover .hp-card-emoji {
          transform: scale(1.2) rotate(15deg);
        }

        .hp-card-name {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1C1C1C;
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .hp-card-tagline {
          font-size: 13px;
          color: #7A6F63;
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 28px;
        }

        .hp-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hp-card:hover .hp-card-btn {
          transform: translateX(4px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        .hp-card-arrow {
          transition: transform 0.2s ease;
        }

        .hp-card:hover .hp-card-arrow {
          transform: translateX(3px);
        }

        .hp-footer {
          text-align: center;
          margin-top: 48px;
          font-size: 12px;
          color: #C5B9AD;
          letter-spacing: 1px;
          animation: fadeUp 0.6s ease 0.4s both;
        }
      `}</style>

      <div className="hp-root">
        <div className="hp-container">
          <div className="hp-header">
            <p className="hp-eyebrow">AI-Powered Family Tools</p>
            <h1 className="hp-title">
              Family
              <em className="hp-title-line2">Harmony</em>
            </h1>
            <p className="hp-subtitle">
              Fewer arguments. Fairer decisions. A happier home — powered by AI.
            </p>
          </div>

          <div className="hp-cards">
            {cards.map((card, i) => (
              <div
                key={card.name}
                className="hp-card"
                style={{
                  background: card.bg,
                  borderColor: hovered === i ? card.accent : 'transparent',
                  animationDelay: card.delay,
                }}
                onClick={() => navigate(card.link)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="hp-card-emoji">{card.emoji}</span>
                <h2 className="hp-card-name">{card.name}</h2>
                <p className="hp-card-tagline">{card.tagline}</p>
                <button
                  className="hp-card-btn"
                  style={{ background: card.accent }}
                >
                  Open
                  <span className="hp-card-arrow">→</span>
                </button>
              </div>
            ))}
          </div>

          <p className="hp-footer">✦ Built with care for families everywhere ✦</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;