import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Check, Flame, Lock, RotateCcw, Target, Trophy, Zap } from "lucide-react";
import "./styles.css";

const missions = [
  {
    id: 1,
    title: "Meet the Candle",
    subtitle: "Learn the four prices",
    xp: 50,
    type: "candle",
    prompt: "Tap the HIGH — the highest price reached during this candle.",
  },
  {
    id: 2,
    title: "Bull or Bear?",
    subtitle: "Read candle direction",
    xp: 60,
    type: "bullbear",
    prompt: "Which candles are bullish? Tap every bullish candle.",
  },
  {
    id: 3,
    title: "Who Won?",
    subtitle: "Understand open vs. close",
    xp: 60,
    type: "winner",
    prompt: "The candle opened at 20,000 and closed at 20,080. Who controlled it?",
  },
  {
    id: 4,
    title: "Build the Market",
    subtitle: "Price moves through time",
    xp: 70,
    type: "order",
    prompt: "Put the candles in chronological order: PAST → NOW.",
  },
  {
    id: 5,
    title: "Speed Reader",
    subtitle: "Read the market at a glance",
    xp: 75,
    type: "direction",
    prompt: "You have 5 seconds. What was price generally doing?",
  }
];

function Candle({ bullish=true, onClick, selected, label }) {
  return (
    <button className={`candle-wrap ${selected ? "selected" : ""}`} onClick={onClick} aria-label={label}>
      <span className={`wick ${bullish ? "up" : "down"}`}></span>
      <span className={`body ${bullish ? "up" : "down"}`}></span>
    </button>
  );
}

function Chart({ mode, onAnswer, answers }) {
  const candles = useMemo(() => [
    true, true, false, true, false, false, true, true, true, false,
    true, false, true, true, false, true, true, false, true, true
  ], []);

  if (mode === "candle") {
    return (
      <div className="single-chart">
        <div className="price-axis"><span>20,120</span><span>20,060</span><span>20,000</span><span>19,940</span></div>
        <div className="candle-stage">
          <Candle bullish onClick={() => onAnswer("correct")} label="High" />
          <span className="hotspot high">HIGH</span>
        </div>
      </div>
    );
  }

  if (mode === "bullbear") {
    return (
      <div className="chart-grid">
        {candles.slice(0, 8).map((bull, i) =>
          <Candle key={i} bullish={bull} selected={answers.includes(i)} onClick={() => onAnswer(i)} label={`Candle ${i+1}`} />
        )}
      </div>
    );
  }

  if (mode === "winner") {
    return (
      <div className="winner-chart">
        <div className="metric"><span>OPEN</span><strong>20,000</strong></div>
        <div className="big-candle"><Candle bullish onClick={()=>{}} label="Bullish candle"/></div>
        <div className="metric"><span>CLOSE</span><strong>20,080</strong></div>
      </div>
    );
  }

  if (mode === "order") {
    const order = [2,0,3,1];
    return (
      <div className="order-zone">
        <div className="timeline">PAST <span>──────────────</span> NOW</div>
        <div className="order-cards">
          {[0,1,2,3].map((n) => (
            <button key={n} className="order-card" onClick={() => onAnswer(n)}>
              <span>{["A","B","C","D"][n]}</span>
              <Candle bullish={[true,false,true,false][n]} />
            </button>
          ))}
        </div>
        <p className="hint">Tap the candles in the correct order.</p>
      </div>
    );
  }

  return (
    <div className="speed-chart">
      <div className="speed-label">NQ · 1 MIN · REPLAY</div>
      <div className="mini-candles">
        {candles.map((bull,i) => <Candle key={i} bullish={bull} onClick={()=>{}} label={`Market candle ${i+1}`}/>)}
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [missionIndex, setMissionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [orderClicks, setOrderClicks] = useState([]);

  const mission = missions[missionIndex];

  function start() {
    setScreen("mission");
    setMissionIndex(0);
    setFeedback(null);
    setAnswers([]);
    setOrderClicks([]);
  }

  function complete(correct=true) {
    if (!correct) {
      setFeedback({ok:false, title:"Not quite", text:"Try again. The goal is to understand the market, not just guess."});
      return;
    }
    if (!completed.includes(mission.id)) {
      setXp(v => v + mission.xp);
      setCompleted(v => [...v, mission.id]);
    }
    setFeedback({ok:true, title:"Nice!", text: mission.id === 1
      ? "The High is the highest price reached during the candle."
      : "Excellent. Your market vision is improving."});
  }

  function answer(value) {
    if (mission.type === "bullbear") {
      const correct = [0,1,3,6,7];
      if (!answers.includes(value)) {
        const next = [...answers, value];
        setAnswers(next);
        if (next.length === correct.length) complete(correct.every(x => next.includes(x)));
      }
      return;
    }
    if (mission.type === "winner") {
      complete(value === "buyers");
      return;
    }
    if (mission.type === "order") {
      const correctOrder = [2,0,3,1];
      const next = [...orderClicks, value];
      setOrderClicks(next);
      if (next.length === 4) complete(next.every((v,i)=>v===correctOrder[i]));
      return;
    }
    if (mission.type === "direction") {
      complete(value === "up");
      return;
    }
    complete(value === "correct");
  }

  function nextMission() {
    if (missionIndex < missions.length - 1) {
      setMissionIndex(v => v + 1);
      setFeedback(null);
      setAnswers([]);
      setOrderClicks([]);
    } else {
      setScreen("complete");
    }
  }

  const levelProgress = Math.round((completed.length / missions.length) * 100);

  if (screen === "home") return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">TL</span><span>TRADING <b>LEVELING</b></span></div>
        <div className="top-stats"><span><Zap size={15}/> {xp} XP</span><span><Flame size={15}/> {Math.max(0, completed.length)} COMBO</span></div>
      </header>
      <main className="home">
        <section className="hero">
          <div className="eyebrow">SEASON 01 · THE ROOKIE</div>
          <h1>Train your eyes.<br/><em>Level your trading.</em></h1>
          <p>Learn market structure and ICT concepts by playing through real trading decisions — one skill at a time.</p>
          <button className="primary big" onClick={start}>START TRAINING <ArrowRight size={20}/></button>
        </section>

        <section className="level-card">
          <div className="level-head">
            <div><span className="muted">CURRENT LEVEL</span><h2>01 · READ THE MARKET</h2></div>
            <div className="level-number">01</div>
          </div>
          <div className="progress-line"><span style={{width:`${levelProgress}%`}}/></div>
          <div className="progress-meta"><span>{completed.length}/5 missions completed</span><span>{levelProgress}%</span></div>
          <div className="mission-list">
            {missions.map((m,i)=>(
              <div key={m.id} className={`mission-row ${completed.includes(m.id) ? "done" : ""}`}>
                <div className="mission-icon">{completed.includes(m.id) ? <Check size={17}/> : i===0 ? <Target size={17}/> : <Lock size={16}/>}</div>
                <div><strong>MISSION {String(m.id).padStart(2,"0")} · {m.title}</strong><small>{m.subtitle}</small></div>
                <span className="mission-xp">+{m.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer>Trading Leveling · Educational game prototype · Not financial advice</footer>
    </div>
  );

  if (screen === "complete") return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">TL</span><span>TRADING <b>LEVELING</b></span></div>
        <div className="top-stats"><span><Zap size={15}/> {xp} XP</span></div>
      </header>
      <main className="complete">
        <Trophy size={56}/>
        <div className="eyebrow">LEVEL COMPLETE</div>
        <h1>READ THE MARKET</h1>
        <p>You completed the first five missions and unlocked your first Market Vision score.</p>
        <div className="score-card"><strong>{xp}</strong><span>XP EARNED</span></div>
        <button className="primary" onClick={()=>setScreen("home")}>RETURN TO MAP</button>
      </main>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={()=>setScreen("home")}><div className="brand"><span className="brand-mark">TL</span><span>TRADING <b>LEVELING</b></span></div></button>
        <div className="top-stats"><span>MISSION {String(mission.id).padStart(2,"0")}/05</span><span><Zap size={15}/> {xp} XP</span></div>
      </header>
      <main className="mission-page">
        <div className="mission-title">
          <div><span className="eyebrow">LEVEL 01 · READ THE MARKET</span><h1>{mission.title}</h1><p>{mission.subtitle}</p></div>
          <div className="mission-badge">+{mission.xp} XP</div>
        </div>
        <div className="mission-layout">
          <section className="chart-panel">
            <div className="chart-top"><span>NQ · SIMULATION</span><span>1 MIN</span></div>
            <Chart mode={mission.type} onAnswer={answer} answers={answers}/>
            {mission.type === "winner" && <div className="answer-buttons"><button onClick={()=>answer("buyers")}>🟢 BUYERS</button><button onClick={()=>answer("sellers")}>🔴 SELLERS</button></div>}
            {mission.type === "direction" && <div className="answer-buttons"><button onClick={()=>answer("up")}>↗ MOVING HIGHER</button><button onClick={()=>answer("down")}>↘ MOVING LOWER</button><button onClick={()=>answer("sideways")}>→ SIDEWAYS</button></div>}
          </section>
          <aside className="mission-panel">
            <div className="question-number">MISSION {String(mission.id).padStart(2,"0")}</div>
            <h2>{mission.prompt}</h2>
            <div className="mission-tip"><span>💡</span><p>Take your time. You are training pattern recognition, not predicting the future.</p></div>
            {feedback && (
              <div className={`feedback ${feedback.ok ? "good" : "bad"}`}>
                <div className="feedback-icon">{feedback.ok ? <Check/> : <RotateCcw/>}</div>
                <div><strong>{feedback.title}</strong><p>{feedback.text}</p></div>
              </div>
            )}
            {feedback?.ok && <button className="primary next" onClick={nextMission}>{missionIndex === missions.length-1 ? "FINISH LEVEL" : "NEXT MISSION"} <ArrowRight size={18}/></button>}
          </aside>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
