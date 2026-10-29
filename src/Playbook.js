/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const BRAND = {
  crimson:"#9B1C1C", crimsonDark:"#6B0F0F", crimsonLight:"#C53030",
  gold:"#D4A017", black:"#0D0D0D", charcoal:"#1A1A1A",
  surfaceLight:"#1E1E1E", border:"#2A2A2A",
  textPrimary:"#F0E6D0", textSecondary:"#9A8A70",
};

const S = {
  btn:(v="primary")=>({ padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, border:"none",
    background:v==="primary"?BRAND.crimson:v==="gold"?BRAND.gold:v==="danger"?"#7f1d1d":v==="green"?"#14532d":v==="active"?`${BRAND.crimson}55`:BRAND.surfaceLight,
    color:v==="gold"?BRAND.black:BRAND.textPrimary, display:"flex", alignItems:"center", gap:6 }),
  input:{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, padding:"8px 12px", color:BRAND.textPrimary, fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  card:{ background:BRAND.surfaceLight, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"16px 20px", marginBottom:16 },
  pill:(c)=>({ padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:600, background:`${c}22`, color:c, display:"inline-block" }),
};

const DEFAULT_PLAYERS = [
  { id:1, label:"PG", x:0.5,  y:0.82, color:"#ef4444" },
  { id:2, label:"SG", x:0.25, y:0.68, color:"#3b82f6" },
  { id:3, label:"SF", x:0.75, y:0.68, color:"#22c55e" },
  { id:4, label:"PF", x:0.3,  y:0.42, color:"#f59e0b" },
  { id:5, label:"C",  x:0.7,  y:0.42, color:"#a855f7" },
];

const DEFAULT_DEFENDERS = [
  { id:11, label:"X1", x:0.5,  y:0.74, color:"#f87171" },
  { id:12, label:"X2", x:0.24, y:0.61, color:"#f87171" },
  { id:13, label:"X3", x:0.76, y:0.61, color:"#f87171" },
  { id:14, label:"X4", x:0.29, y:0.36, color:"#f87171" },
  { id:15, label:"X5", x:0.71, y:0.36, color:"#f87171" },
];

const LINE_TYPES = [
  { id:"pass",    label:"Pass",    color:"#facc15", dash:[],    arrow:true  },
  { id:"cut",     label:"Cut",     color:"#4ade80", dash:[8,4], arrow:true  },
  { id:"dribble", label:"Dribble", color:"#60a5fa", dash:[4,4], arrow:true  },
  { id:"screen",  label:"Screen",  color:"#fb923c", dash:[],    arrow:false },
];

const PLAY_CATEGORIES = ["Offense","Defense","Set Plays","Out of Bounds","Transition","Press Break"];

const QUICK_TAGS = ["Half-court","Full-court","Late game","vs Zone","vs Man","BLOB","SLOB","Pick & Roll","Post up","Fast Break","Horns","Press Break"];

// ── PLAY TEXT PARSER ──
function parsePlayText(text) {
  // Extract name from first heading line
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let name = "";
  let category = "Set Plays";
  let notes = "";
  let tags = [];

  // Find title (first non-emoji meaningful line)
  for (const l of lines) {
    const clean = l.replace(/^[#*\d.)\-•\s🏀📋]+/, "").trim();
    if (clean.length > 3 && clean.length < 80 && !clean.startsWith("Initial") && !clean.startsWith("The Action")) {
      name = clean.replace(/\(.*?\)/g,"").trim();
      break;
    }
  }

  // Detect category + tags from content
  const lower = text.toLowerCase();
  if (lower.includes("pick-and-roll") || lower.includes("ball-screen") || lower.includes("horns") || lower.includes("spain")) {
    tags.push("Pick & Roll"); category = "Set Plays";
  }
  if (lower.includes("half-court")) tags.push("Half-court");
  if (lower.includes("full-court") || lower.includes("fast break") || lower.includes("transition")) { tags.push("Full-court"); category = "Transition"; }
  if (lower.includes("press break")) { tags.push("Press Break"); category = "Press Break"; }
  if (lower.includes("zone")) tags.push("vs Zone");
  if (lower.includes("blob") || lower.includes("out of bound")) { category = "Out of Bounds"; tags.push("BLOB"); }
  if (lower.includes("horns")) tags.push("Horns");
  tags = [...new Set(tags)];

  // Build notes from action text
  const actionStart = text.indexOf("The Action");
  const scoringStart = text.indexOf("Scoring");
  if (actionStart > -1) {
    const end = text.length;
    const rawNotes = text.slice(actionStart, end)
      .replace(/The Action\s*:?\s*/i,"")
      .replace(/Scoring.*?Options\s*:?\s*/i,"💡 Options: ")
      .replace(/^\d+\.\s*/gm,"")
      .replace(/\t/g," ")
      .split("\n").map(l=>l.trim()).filter(Boolean).join("\n");
    notes = rawNotes.slice(0, 600);
  }

  // Parse player positions from ASCII court diagram
  // Look for lines with (1)-(5) or [2]-[4] style
  const playerPositions = {};
  const posMap = {
    // y-zone buckets (court height 0→1, basket at top ~0.03, half-court 0.5)
    // We scan diagram lines for player tokens and map relative position
  };

  // Find diagram section
  const diagramLines = [];
  let inDiagram = false;
  for (const l of lines) {
    if (/[⟂\[\(]/.test(l) && /\d/.test(l)) inDiagram = true;
    if (inDiagram) {
      if (/[⟂\[\(]/.test(l) || /^\s+/.test(l)) diagramLines.push(l);
      else if (diagramLines.length > 0) inDiagram = false;
    }
  }

  // Parse player tokens from diagram
  // (1)=PG, (2)=SG, (3)=SF, (4)=PF, (5)=C
  // [2],[3],[4] = perimeter spot
  const PLAYER_META = [
    {id:1,label:"PG",color:"#ef4444"},
    {id:2,label:"SG",color:"#3b82f6"},
    {id:3,label:"SF",color:"#22c55e"},
    {id:4,label:"PF",color:"#f59e0b"},
    {id:5,label:"C", color:"#a855f7"},
  ];

  // Default fallback positions (spread pick-and-roll spacing)
  const defaultPos = {
    1:{x:0.5, y:0.82},   // PG top of key
    2:{x:0.12,y:0.62},   // SG left corner
    3:{x:0.88,y:0.62},   // SF right corner
    4:{x:0.25,y:0.52},   // PF left wing
    5:{x:0.5, y:0.58},   // C high post
  };

  // Try to read positions from diagram
  if (diagramLines.length > 0) {
    const totalDiagLines = diagramLines.length;
    diagramLines.forEach((dline, rowIdx) => {
      const y = 0.45 + (rowIdx / totalDiagLines) * 0.45; // map to bottom half of court
      // find all player tokens
      const tokenRe = /[\[(](\d)[\])]/g;
      let m;
      while ((m = tokenRe.exec(dline)) !== null) {
        const pid = parseInt(m[1]);
        // x pos proportional to character position
        const x = Math.max(0.08, Math.min(0.92, m.index / Math.max(dline.length, 1)));
        defaultPos[pid] = {x, y};
      }
    });
  }

  const players = PLAYER_META.map(pm => ({
    ...pm,
    x: defaultPos[pm.id]?.x ?? 0.5,
    y: defaultPos[pm.id]?.y ?? 0.7,
  }));

  // Build lines from "The Action" steps
  // Step 1: (5) sets screen on (1)'s defender → line from 5→1 of type "screen"
  // Step 2: (1) drives → line from 1 toward paint
  // Step 3: (5) rolls → line from 5 toward rim
  const actionLines = [];
  const stepsSection = text.slice(text.indexOf("The Action") > -1 ? text.indexOf("The Action") : 0,
    text.indexOf("Scoring") > -1 ? text.indexOf("Scoring") : text.length);

  // Match numbered steps AND bullet points with player references
  const stepRe = /(?:\d+\.\s*|[•\-]\s*)(.+)/g;
  let sm; const steps = [];
  while ((sm = stepRe.exec(stepsSection)) !== null) {
    const line = sm[1].trim();
    if (/\(\d\)/.test(line)) steps.push(line); // only lines that reference a player
  }

  steps.forEach((step, i) => {
    const sLow = step.toLowerCase();
    // Detect who moves and where
    const fromMatch = step.match(/\((\d)\)/);
    const toMatch = step.match(/\((\d)\)[^(]*(?:sets|screen|pass|roll|drive|cut|flare|pop)/i)
      || step.match(/to\s+\((\d)\)/i);

    if (!fromMatch) return;
    const fromId = parseInt(fromMatch[1]);
    const fp = players.find(p=>p.id===fromId);
    if (!fp) return;

    // Determine action type
    let type = "pass", color = "#facc15", dash = [], arrow = true;
    if (sLow.includes("screen") || sLow.includes("sets")) { type="screen"; color="#fb923c"; dash=[]; arrow=false; }
    else if (sLow.includes("roll") || sLow.includes("drive") || sLow.includes("drives")) { type="dribble"; color="#60a5fa"; dash=[4,4]; arrow=true; }
    else if (sLow.includes("cut") || sLow.includes("sprint") || sLow.includes("flare") || sLow.includes("back-screen")) { type="cut"; color="#4ade80"; dash=[8,4]; arrow=true; }
    else if (sLow.includes("pass") || sLow.includes("pass")) { type="pass"; color="#facc15"; }

    // Destination: find explicit (x) reference or use direction keywords
    let x2 = fp.x, y2 = fp.y;
    const destMatch = step.match(/(?:to|toward|into|down to)\s*\((\d)\)/i) || step.match(/to\s*\((\d)\)/i);
    if (destMatch) {
      const tp = players.find(p=>p.id===parseInt(destMatch[1]));
      if (tp) { x2 = tp.x; y2 = tp.y; }
    } else if (sLow.includes("rim") || sLow.includes("basket") || sLow.includes("paint") || sLow.includes("roll")) {
      x2 = 0.5; y2 = 0.12;
    } else if (sLow.includes("corner")) {
      x2 = fromId===2 ? 0.08 : 0.92; y2 = 0.72;
    } else if (sLow.includes("wing") || sLow.includes("pop") || sLow.includes("flare") || sLow.includes("top")) {
      x2 = fromId <= 2 ? 0.2 : 0.8; y2 = 0.6;
    } else if (sLow.includes("downhill") || sLow.includes("toward the middle")) {
      x2 = 0.5; y2 = fp.y - 0.25;
    } else {
      x2 = fp.x; y2 = Math.max(0.1, fp.y - 0.15);
    }

    actionLines.push({
      id: Date.now() + i,
      type, color, dash, arrow,
      fromId,
      x1: fp.x, y1: fp.y,
      x2: Math.max(0.05, Math.min(0.95, x2)),
      y2: Math.max(0.05, Math.min(0.95, y2)),
      toId: destMatch ? parseInt(destMatch[1]) : null,
    });
  });

  return { name, category, tags, notes, players, lines: actionLines };
}

// ── IMPORT MODAL ──
function ImportPlayModal({ onImport, onClose }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("paste"); // paste | preview

  const handleParse = () => {
    if (!text.trim()) return;
    const parsed = parsePlayText(text);
    setPreview(parsed);
    setStep("preview");
  };

  const svgRef = useRef(null);
  const W=300, H=400;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#1A1A1A",border:`1px solid #2A2A2A`,borderRadius:16,padding:24,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{margin:0,fontSize:18,fontWeight:700}}>📥 Import Play from Text</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#9A8A70",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        {step === "paste" && (
          <>
            <p style={{color:"#9A8A70",fontSize:13,marginBottom:12}}>
              Paste a play description — formations, actions, and diagrams are parsed automatically into an interactive play.
            </p>
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              style={{width:"100%",height:240,background:"#0D0D0D",border:"1px solid #2A2A2A",borderRadius:8,
                color:"#F0E6D0",fontSize:12,padding:12,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box",outline:"none"}}
              placeholder={"Paste play text here…\n\nExample:\n1. The Spread Pick-and-Roll\n(5) sets screen at the top of the key.\n(1) drives downhill toward the paint.\n(5) rolls to the rim."}
            />
            <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end"}}>
              <button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13,background:"#1E1E1E",color:"#9A8A70",border:"1px solid #2A2A2A"}}>Cancel</button>
              <button onClick={handleParse} disabled={!text.trim()} style={{padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:"#D4A017",color:"#0D0D0D",border:"none",opacity:text.trim()?1:0.5}}>
                🔍 Parse Play →
              </button>
            </div>
          </>
        )}

        {step === "preview" && preview && (
          <>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
              <div>
                <svg ref={svgRef} width={W} height={H} style={{display:"block",borderRadius:8,border:"1px solid #2A2A2A"}}>
                  <Court width={W} height={H}/>
                  {preview.lines.map((ln,i)=>{
                    const x1=ln.x1*W,y1=ln.y1*H,x2=ln.x2*W,y2=ln.y2*H;
                    const angle=Math.atan2(y2-y1,x2-x1),len=8;
                    const a1=angle-Math.PI/6,a2=angle+Math.PI/6;
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ln.color} strokeWidth={2} strokeDasharray={ln.dash.join(",")} opacity={0.9}/>
                        {ln.arrow&&<polygon points={`${x2},${y2} ${x2-len*Math.cos(a1)},${y2-len*Math.sin(a1)} ${x2-len*Math.cos(a2)},${y2-len*Math.sin(a2)}`} fill={ln.color}/>}
                      </g>
                    );
                  })}
                  {preview.players.map(p=>(
                    <g key={p.id}>
                      <circle cx={p.x*W} cy={p.y*H} r={14} fill={p.color} stroke="#fff" strokeWidth={2}/>
                      <text x={p.x*W} y={p.y*H+5} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>{p.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:11,color:"#9A8A70",display:"block",marginBottom:4}}>Play Name</label>
                  <input value={preview.name} onChange={e=>setPreview(p=>({...p,name:e.target.value}))}
                    style={{background:"#0D0D0D",border:"1px solid #2A2A2A",borderRadius:6,padding:"7px 10px",color:"#F0E6D0",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:11,color:"#9A8A70",display:"block",marginBottom:4}}>Category</label>
                  <select value={preview.category} onChange={e=>setPreview(p=>({...p,category:e.target.value}))}
                    style={{background:"#0D0D0D",border:"1px solid #2A2A2A",borderRadius:6,padding:"7px 10px",color:"#F0E6D0",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}>
                    {PLAY_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:11,color:"#9A8A70",display:"block",marginBottom:4}}>Tags détectés</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {preview.tags.map(t=>(
                      <span key={t} style={{padding:"2px 8px",borderRadius:8,fontSize:11,background:"#D4A01733",color:"#D4A017",border:"1px solid #D4A01766"}}>{t}</span>
                    ))}
                    {preview.tags.length===0&&<span style={{fontSize:12,color:"#9A8A70"}}>Aucun</span>}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:11,color:"#9A8A70",display:"block",marginBottom:4}}>Actions détectées</label>
                  <span style={{fontSize:13,fontWeight:700,color:"#F0E6D0"}}>{preview.lines.length}</span>
                  <span style={{fontSize:11,color:"#9A8A70"}}> lignes / mouvements</span>
                </div>
                {preview.notes&&(
                  <div style={{fontSize:11,color:"#9A8A70",lineHeight:1.6,maxHeight:80,overflowY:"auto",
                    background:"#0D0D0D",borderRadius:6,padding:8}}>
                    {preview.notes.slice(0,200)}{preview.notes.length>200?"…":""}
                  </div>
                )}
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
              <button onClick={()=>setStep("paste")} style={{padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:12,background:"#1E1E1E",color:"#9A8A70",border:"1px solid #2A2A2A"}}>← Modifier le texte</button>
              <button onClick={()=>onImport(preview)} style={{padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:"#9B1C1C",color:"#F0E6D0",border:"none"}}>
                ✅ Importer ce play
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Court({ width, height }) {
  const sx = w => w * width, sy = h => h * height;
  const stroke = "#2a5c2a"; const lw = 1.5;
  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill="#1a3a1a" rx={4}/>
      <rect x={sx(0.04)} y={sy(0.03)} width={sx(0.92)} height={sy(0.94)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <line x1={sx(0.04)} y1={sy(0.5)} x2={sx(0.96)} y2={sy(0.5)} stroke={stroke} strokeWidth={lw}/>
      <circle cx={sx(0.5)} cy={sy(0.5)} r={sx(0.08)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <rect x={sx(0.33)} y={sy(0.03)} width={sx(0.34)} height={sy(0.28)} fill="#1e4a1e" opacity={0.5} stroke={stroke} strokeWidth={lw}/>
      <rect x={sx(0.38)} y={sy(0.03)} width={sx(0.24)} height={sy(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <circle cx={sx(0.5)} cy={sy(0.31)} r={sx(0.09)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <circle cx={sx(0.5)} cy={sy(0.08)} r={sx(0.025)} fill="none" stroke={stroke} strokeWidth={2}/>
      <line x1={sx(0.46)} y1={sy(0.065)} x2={sx(0.54)} y2={sy(0.065)} stroke={stroke} strokeWidth={2}/>
      <path d={`M ${sx(0.15)} ${sy(0.03)} Q ${sx(0.5)} ${sy(0.42)} ${sx(0.85)} ${sy(0.03)}`} fill="none" stroke={stroke} strokeWidth={lw}/>
      <rect x={sx(0.33)} y={sy(0.69)} width={sx(0.34)} height={sy(0.28)} fill="#1e4a1e" opacity={0.5} stroke={stroke} strokeWidth={lw}/>
      <rect x={sx(0.38)} y={sy(0.69)} width={sx(0.24)} height={sy(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <circle cx={sx(0.5)} cy={sy(0.69)} r={sx(0.09)} fill="none" stroke={stroke} strokeWidth={lw}/>
      <circle cx={sx(0.5)} cy={sy(0.92)} r={sx(0.025)} fill="none" stroke={stroke} strokeWidth={2}/>
      <line x1={sx(0.46)} y1={sy(0.935)} x2={sx(0.54)} y2={sy(0.935)} stroke={stroke} strokeWidth={2}/>
      <path d={`M ${sx(0.15)} ${sy(0.97)} Q ${sx(0.5)} ${sy(0.58)} ${sx(0.85)} ${sy(0.97)}`} fill="none" stroke={stroke} strokeWidth={lw}/>
    </g>
  );
}

function arrowHead(x1,y1,x2,y2,color) {
  const angle=Math.atan2(y2-y1,x2-x1), len=10;
  const a1=angle-Math.PI/6, a2=angle+Math.PI/6;
  return <polygon points={`${x2},${y2} ${x2-len*Math.cos(a1)},${y2-len*Math.sin(a1)} ${x2-len*Math.cos(a2)},${y2-len*Math.sin(a2)}`} fill={color}/>;
}

function exportPNG(svgEl, playName) {
  if (!svgEl) return;
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const canvas = document.createElement("canvas");
  canvas.width = svgEl.width.baseVal.value * 2;
  canvas.height = svgEl.height.baseVal.value * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  const img = new Image();
  const blob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const link = document.createElement("a");
    link.download = `${playName||"play"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = url;
}

// ── COURT CANVAS — used for both creating and viewing ──
function CourtCanvas({ players, defenders, lines, showDefenders, animating, animStep, animPlayers,
  tool, lineType, drawing, onMouseDown, onMouseMove, onMouseUp, svgRef, W, H, readOnly }) {
  const displayPlayers = animating && animPlayers ? animPlayers : players;
  return (
    <svg ref={svgRef} width={W} height={H}
      style={{display:"block",borderRadius:10,cursor:(!readOnly&&tool==="draw")?"crosshair":"default",userSelect:"none",border:`1px solid ${BRAND.border}`}}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}>
      <Court width={W} height={H}/>
      {/* Lines */}
      {lines.map((ln,i)=>{
        const x1=ln.x1*W,y1=ln.y1*H,x2=ln.x2*W,y2=ln.y2*H;
        const animated = animating && animStep > i;
        return (
          <g key={ln.id||i} opacity={animated?1:0.9}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ln.color} strokeWidth={2.5} strokeDasharray={ln.dash.join(",")} opacity={0.9}/>
            {ln.arrow && arrowHead(x1,y1,x2,y2,ln.color)}
            {animated && <circle cx={x2} cy={y2} r={6} fill={ln.color} opacity={0.5}/>}
          </g>
        );
      })}
      {/* Preview line while drawing */}
      {drawing && <line x1={drawing.x1*W} y1={drawing.y1*H} x2={drawing.x2*W} y2={drawing.y2*H}
        stroke={LINE_TYPES.find(l=>l.id===lineType)?.color||"#fff"} strokeWidth={2} strokeDasharray="6,3" opacity={0.7}/>}
      {/* Attackers */}
      {displayPlayers.map(p=>(
        <g key={p.id} style={{transition:animating?"all 0.7s ease":"none"}}>
          <circle cx={p.x*W} cy={p.y*H} r={16} fill={p.color} stroke="#fff" strokeWidth={2} opacity={0.92}/>
          <text x={p.x*W} y={p.y*H+5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{p.label}</text>
        </g>
      ))}
      {/* Defenders as X */}
      {showDefenders && defenders.map(d=>(
        <g key={d.id}>
          <line x1={d.x*W-11} y1={d.y*H-11} x2={d.x*W+11} y2={d.y*H+11} stroke={d.color} strokeWidth={3} strokeLinecap="round"/>
          <line x1={d.x*W+11} y1={d.y*H-11} x2={d.x*W-11} y2={d.y*H+11} stroke={d.color} strokeWidth={3} strokeLinecap="round"/>
          <text x={d.x*W} y={d.y*H+24} textAnchor="middle" fill={d.color} fontSize={9} fontWeight={700}>{d.label}</text>
        </g>
      ))}
      {animating && <text x={W-10} y={20} textAnchor="end" fill={BRAND.gold} fontSize={12} fontWeight={700}>Step {animStep}/{lines.length}</text>}
    </svg>
  );
}

// ── PLAY CREATOR (coach) — streamlined ──
function PlayCreator({ play, onSave, onCancel }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const W = 370, H = 510;

  const [players, setPlayers] = useState(play?.players_data || DEFAULT_PLAYERS.map(p=>({...p})));
  const [defenders, setDefenders] = useState(play?.defenders_data?.length ? play.defenders_data : DEFAULT_DEFENDERS.map(d=>({...d})));
  const [showDefenders, setShowDefenders] = useState((play?.defenders_data||[]).length > 0);
  const [lines, setLines] = useState(play?.lines_data || []);
  const [lineType, setLineType] = useState("pass");
  const [tool, setTool] = useState("select"); // "select" | "draw"
  const [dragging, setDragging] = useState(null); // {id, isDefender}
  const [drawing, setDrawing] = useState(null);
  const [name, setName] = useState(play?.name || "");
  const [category, setCategory] = useState(play?.category || "Offense");
  const [tags, setTags] = useState(play?.tags || []);
  const [notes, setNotes] = useState(play?.notes || "");
  const [saving, setSaving] = useState(false);
  // animate
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [animPlayers, setAnimPlayers] = useState(null);

  const allMovable = [...players, ...(showDefenders ? defenders : [])];

  const getSVGPos = useCallback((e) => {
    const svg = svgRef.current; if (!svg) return {x:0,y:0};
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x:(clientX-rect.left)/rect.width, y:(clientY-rect.top)/rect.height };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (animating) return;
    const pos = getSVGPos(e);
    if (tool==="select") {
      const hitD = showDefenders && defenders.find(p=>Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<20);
      if (hitD) { setDragging({id:hitD.id,isDefender:true}); return; }
      const hit = players.find(p=>Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<20);
      if (hit) setDragging({id:hit.id,isDefender:false});
    } else {
      const hit = allMovable.find(p=>Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<20);
      if (hit) setDrawing({fromId:hit.id,x1:hit.x,y1:hit.y,x2:pos.x,y2:pos.y});
    }
  },[tool,players,defenders,showDefenders,animating,getSVGPos,allMovable]);

  const handleMouseMove = useCallback((e) => {
    if (animating) return;
    const pos = getSVGPos(e);
    if (dragging) {
      const clamp = v => Math.max(0.04, Math.min(0.96, v));
      if (dragging.isDefender) setDefenders(ds=>ds.map(p=>p.id===dragging.id?{...p,x:clamp(pos.x),y:clamp(pos.y)}:p));
      else setPlayers(ps=>ps.map(p=>p.id===dragging.id?{...p,x:clamp(pos.x),y:clamp(pos.y)}:p));
    }
    if (drawing) setDrawing(d=>({...d,x2:pos.x,y2:pos.y}));
  },[dragging,drawing,animating,getSVGPos]);

  const handleMouseUp = useCallback((e) => {
    if (animating) return;
    const pos = getSVGPos(e);
    setDragging(null);
    if (drawing) {
      const hit = allMovable.find(p=>p.id!==drawing.fromId&&Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<20);
      const lt = LINE_TYPES.find(l=>l.id===lineType);
      setLines(ls=>[...ls,{id:Date.now(),type:lineType,color:lt.color,dash:lt.dash,arrow:lt.arrow,fromId:drawing.fromId,x1:drawing.x1,y1:drawing.y1,x2:pos.x,y2:pos.y,toId:hit?.id||null}]);
      setDrawing(null);
    }
  },[drawing,allMovable,lineType,animating,getSVGPos]);

  const startAnim = () => {
    if (lines.length===0) return;
    setAnimStep(0); setAnimPlayers(players.map(p=>({...p}))); setAnimating(true);
  };
  useEffect(()=>{
    if (!animating) return;
    let step=0;
    const run=()=>{
      if (step>=lines.length) { setAnimating(false); setAnimPlayers(null); return; }
      const ln=lines[step];
      if (ln.toId) setAnimPlayers(prev=>prev.map(p=>p.id===ln.fromId?{...p,x:ln.x2,y:ln.y2}:p));
      setAnimStep(step+1); step++;
      animRef.current=setTimeout(run,800);
    };
    animRef.current=setTimeout(run,400);
    return ()=>clearTimeout(animRef.current);
  },[animating]);
  const stopAnim=()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimPlayers(null); };

  const toggleTag = t => setTags(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);

  const save = async () => {
    if (!name.trim()) { alert("Please enter a play name"); return; }
    setSaving(true);
    const data = { name:name.trim(), category, tags, notes, players_data:players, defenders_data:showDefenders?defenders:[], lines_data:lines, frames:[] };
    if (play?.id) await supabase.from("plays").update(data).eq("id",play.id);
    else await supabase.from("plays").insert([data]);
    setSaving(false);
    onSave();
  };

  return (
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
      {/* LEFT: Court */}
      <div style={{flex:"none"}}>
        {/* Toolbar */}
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={()=>setTool("select")} style={{...S.btn(tool==="select"?"active":"secondary"),fontSize:11}}>🖱️ Move</button>
          <button onClick={()=>setTool("draw")} style={{...S.btn(tool==="draw"?"active":"secondary"),fontSize:11}}>✏️ Draw</button>
          {tool==="draw" && LINE_TYPES.map(lt=>(
            <button key={lt.id} onClick={()=>setLineType(lt.id)}
              style={{...S.btn(lineType===lt.id?"active":"secondary"),borderLeft:`3px solid ${lt.color}`,fontSize:11}}>
              {lt.label}
            </button>
          ))}
          <button onClick={()=>setLines(ls=>ls.slice(0,-1))} style={{...S.btn("secondary"),fontSize:11}} title="Undo">↩️</button>
          <button onClick={()=>setLines([])} style={{...S.btn("danger"),fontSize:11}} title="Clear lines">🗑️</button>
          <button onClick={()=>setShowDefenders(s=>!s)} style={{...S.btn(showDefenders?"active":"secondary"),fontSize:11,borderLeft:`3px solid #f87171`}}>
            {showDefenders?"✕ Hide X":"✕ Show X"}
          </button>
        </div>

        <CourtCanvas
          svgRef={svgRef} W={W} H={H}
          players={players} defenders={defenders} showDefenders={showDefenders}
          lines={lines} lineType={lineType} tool={tool} drawing={drawing}
          animating={animating} animStep={animStep} animPlayers={animPlayers}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        />

        {/* Bottom controls */}
        <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center",flexWrap:"wrap"}}>
          {animating
            ? <button onClick={stopAnim} style={S.btn("danger")}>⏹ Stop</button>
            : <button onClick={startAnim} disabled={lines.length===0} style={{...S.btn("green"),opacity:lines.length===0?0.4:1}}>▶ Preview Animation</button>
          }
          <button onClick={()=>setPlayers(DEFAULT_PLAYERS.map(p=>({...p})))} style={{...S.btn("secondary"),fontSize:11}}>🔄 Reset</button>
          <button onClick={()=>exportPNG(svgRef.current, name||"play")} style={{...S.btn("secondary"),fontSize:11}}>📥 PNG</button>
        </div>

        {/* Line legend */}
        <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
          {LINE_TYPES.map(lt=>(
            <div key={lt.id} style={{display:"flex",alignItems:"center",gap:4}}>
              <svg width={22} height={8}><line x1={0} y1={4} x2={22} y2={4} stroke={lt.color} strokeWidth={2.5} strokeDasharray={lt.dash.join(",")}/></svg>
              <span style={{fontSize:10,color:BRAND.textSecondary}}>{lt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Play info — compact */}
      <div style={{flex:1,minWidth:220,maxWidth:320}}>
        <div style={{marginBottom:12}}>
          <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Play Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={S.input} placeholder="e.g. Horns Action"/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Category</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={S.input}>
            {PLAY_CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:6}}>Tags <span style={{color:BRAND.border}}>(optional)</span></label>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {QUICK_TAGS.map(t=>(
              <button key={t} onClick={()=>toggleTag(t)}
                style={{padding:"3px 9px",borderRadius:8,fontSize:11,cursor:"pointer",border:"none",
                  background:tags.includes(t)?`${BRAND.gold}33`:BRAND.charcoal,
                  color:tags.includes(t)?BRAND.gold:BRAND.textSecondary,
                  outline:tags.includes(t)?`1px solid ${BRAND.gold}`:`1px solid ${BRAND.border}`}}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Notes <span style={{color:BRAND.border}}>(optional)</span></label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            style={{...S.input,height:60,resize:"vertical"}} placeholder="Key reads, timing…"/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={S.btn("secondary")}>Cancel</button>
          <button onClick={save} disabled={saving} style={{...S.btn("gold"),flex:1,justifyContent:"center"}}>
            {saving?"Saving…":"💾 Save Play"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PLAY VIEWER — interactive replay ──
function PlayViewer({ play, onBack, onEdit, isAdmin }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const W = 370, H = 510;
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [animPlayers, setAnimPlayers] = useState(null);

  const players = play.players_data || DEFAULT_PLAYERS;
  const defenders = play.defenders_data || [];
  const lines = play.lines_data || [];
  const showDefenders = defenders.length > 0;

  const startAnim = () => {
    if (lines.length===0) return;
    setAnimStep(0); setAnimPlayers(players.map(p=>({...p}))); setAnimating(true);
  };
  useEffect(()=>{
    if (!animating) return;
    let step=0;
    const run=()=>{
      if (step>=lines.length) { setAnimating(false); setAnimPlayers(null); return; }
      const ln=lines[step];
      if (ln.toId) setAnimPlayers(prev=>prev.map(p=>p.id===ln.fromId?{...p,x:ln.x2,y:ln.y2}:p));
      setAnimStep(step+1); step++;
      animRef.current=setTimeout(run,800);
    };
    animRef.current=setTimeout(run,400);
    return ()=>clearTimeout(animRef.current);
  },[animating]);
  const stopAnim=()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimPlayers(null); };

  return (
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
      <div style={{flex:"none"}}>
        <CourtCanvas
          svgRef={svgRef} W={W} H={H}
          players={players} defenders={defenders} showDefenders={showDefenders}
          lines={lines} lineType="pass" tool="select" drawing={null}
          animating={animating} animStep={animStep} animPlayers={animPlayers}
          onMouseDown={()=>{}} onMouseMove={()=>{}} onMouseUp={()=>{}}
          readOnly
        />
        <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center",flexWrap:"wrap"}}>
          {animating
            ? <button onClick={stopAnim} style={S.btn("danger")}>⏹ Stop</button>
            : <button onClick={startAnim} disabled={lines.length===0} style={{...S.btn("green"),opacity:lines.length===0?0.4:1}}>▶ Animate Play</button>
          }
          <button onClick={()=>exportPNG(svgRef.current, play.name)} style={{...S.btn("secondary"),fontSize:11}}>📥 PNG</button>
        </div>
        <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
          {LINE_TYPES.map(lt=>(
            <div key={lt.id} style={{display:"flex",alignItems:"center",gap:4}}>
              <svg width={22} height={8}><line x1={0} y1={4} x2={22} y2={4} stroke={lt.color} strokeWidth={2.5} strokeDasharray={lt.dash.join(",")}/></svg>
              <span style={{fontSize:10,color:BRAND.textSecondary}}>{lt.label}</span>
            </div>
          ))}
          {showDefenders&&<div style={{display:"flex",alignItems:"center",gap:4}}>
            <svg width={14} height={14}><line x1={2} y1={2} x2={12} y2={12} stroke="#f87171" strokeWidth={2.5}/><line x1={12} y1={2} x2={2} y2={12} stroke="#f87171" strokeWidth={2.5}/></svg>
            <span style={{fontSize:10,color:BRAND.textSecondary}}>Defender</span>
          </div>}
        </div>
      </div>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontWeight:700,fontSize:20,marginBottom:6}}>{play.name}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
          <span style={S.pill(BRAND.gold)}>{play.category}</span>
          {(play.tags||[]).map(t=><span key={t} style={S.pill("#60a5fa")}>{t}</span>)}
        </div>
        {play.notes&&(
          <div style={{...S.card,fontSize:13,color:BRAND.textSecondary,lineHeight:1.7}}>
            <div style={{fontWeight:600,color:BRAND.textPrimary,marginBottom:4}}>📋 Notes</div>
            {play.notes}
          </div>
        )}
        <div style={{...S.card,fontSize:12,color:BRAND.textSecondary}}>
          <div style={{fontWeight:600,color:BRAND.textPrimary,marginBottom:8}}>Play summary</div>
          <div>{lines.length} action{lines.length!==1?"s":""} drawn</div>
          {showDefenders&&<div style={{color:"#f87171",marginTop:4}}>✕ Defense included</div>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={onBack} style={S.btn("secondary")}>← Playbook</button>
          {isAdmin&&<button onClick={onEdit} style={S.btn("gold")}>✏️ Edit</button>}
        </div>
      </div>
    </div>
  );
}

// ── PLAYBOOK LIST ──
export default function Playbook({ isAdmin }) {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | create | viewer
  const [activePlay, setActivePlay] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("plays").select("*").order("created_at",{ascending:false});
    if (data) setPlays(data);
    setLoading(false);
  };

  const allTags = [...new Set(plays.flatMap(p=>p.tags||[]))];
  const catCounts = Object.fromEntries(PLAY_CATEGORIES.map(c=>[c,plays.filter(p=>p.category===c).length]));

  const filtered = plays.filter(p=>{
    if (filterCat!=="All"&&p.category!==filterCat) return false;
    if (filterTag&&!(p.tags||[]).includes(filterTag)) return false;
    if (search) { const q=search.toLowerCase(); if (!p.name?.toLowerCase().includes(q)&&!(p.tags||[]).some(t=>t.toLowerCase().includes(q))) return false; }
    return true;
  });

  const handleImport = (parsed) => {
    // Open PlayCreator pre-filled with parsed data so coach can draw actions
    setActivePlay({
      _imported: true,
      name: parsed.name || "Imported Play",
      category: parsed.category,
      tags: parsed.tags,
      notes: parsed.notes,
      players_data: parsed.players,
      defenders_data: [],
      lines_data: parsed.lines,
    });
    setShowImport(false);
    setView("create");
  };

  const duplicate = async (p) => {
    await supabase.from("plays").insert([{name:`${p.name} (copy)`,category:p.category,tags:p.tags||[],notes:p.notes,players_data:p.players_data,defenders_data:p.defenders_data||[],lines_data:p.lines_data,frames:[]}]);
    load();
  };
  const del = async (id) => {
    if (!window.confirm("Delete this play?")) return;
    await supabase.from("plays").delete().eq("id",id);
    load();
  };

  if (view==="create") return (
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:18}}>{activePlay?"Edit Play":"New Play"}</h1>
      <PlayCreator play={activePlay} onSave={()=>{setView("list");load();}} onCancel={()=>setView("list")}/>
    </div>
  );

  if (view==="viewer") return (
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:18}}>📖 {activePlay?.name}</h1>
      <PlayViewer play={activePlay} isAdmin={isAdmin}
        onBack={()=>setView("list")}
        onEdit={()=>setView("create")}/>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>📖 Playbook</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>{plays.length} plays</p>
        </div>
        {isAdmin&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowImport(true)} style={S.btn("secondary")}>📥 Import</button>
            <button onClick={()=>{setActivePlay(null);setView("create");}} style={S.btn("gold")}>+ New Play</button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImport && <ImportPlayModal onImport={handleImport} onClose={()=>setShowImport(false)}/>}

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="🔍 Search plays…" style={{...S.input,maxWidth:340,marginBottom:12}}/>

      {/* Category pills */}
      <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
        <button onClick={()=>setFilterCat("All")} style={{...S.btn(filterCat==="All"?"primary":"secondary"),fontSize:11}}>All ({plays.length})</button>
        {PLAY_CATEGORIES.filter(c=>catCounts[c]>0||isAdmin).map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{...S.btn(filterCat===c?"primary":"secondary"),fontSize:11}}>{c} {catCounts[c]>0&&`(${catCounts[c]})`}</button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length>0&&(
        <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,color:BRAND.textSecondary}}>Tag:</span>
          {["", ...allTags].map(t=>(
            <button key={t||"all"} onClick={()=>setFilterTag(t)}
              style={{padding:"2px 9px",borderRadius:8,fontSize:11,cursor:"pointer",border:"none",
                background:filterTag===t?(t?`${BRAND.gold}33`:BRAND.gold):BRAND.charcoal,
                color:filterTag===t?(t?BRAND.gold:BRAND.black):BRAND.textSecondary,
                outline:filterTag===t&&t?`1px solid ${BRAND.gold}`:`1px solid ${BRAND.border}`}}>
              {t||"All"}
            </button>
          ))}
        </div>
      )}

      {/* Plays grid */}
      {loading ? (
        <div style={{textAlign:"center",padding:40,color:BRAND.textSecondary}}>Loading plays…</div>
      ) : filtered.length===0 ? (
        <div style={{...S.card,textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:36,marginBottom:10}}>📋</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No plays yet</div>
          <div style={{fontSize:13,color:BRAND.textSecondary}}>{isAdmin?"Click '+ New Play' to draw your first play.":"No plays from the coach yet."}</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card,marginBottom:0,cursor:"pointer"}} onClick={()=>{setActivePlay(p);setView("viewer");}}>
              {/* Mini court preview */}
              <div style={{borderRadius:8,overflow:"hidden",marginBottom:10,border:`1px solid ${BRAND.border}`}}>
                <svg width="100%" viewBox="0 0 370 200" style={{display:"block"}}>
                  <Court width={370} height={370}/>
                  {(p.lines_data||[]).map((ln,i)=>(
                    <line key={i} x1={ln.x1*370} y1={ln.y1*200} x2={ln.x2*370} y2={ln.y2*200}
                      stroke={ln.color} strokeWidth={2} strokeDasharray={ln.dash?.join(",")||""} opacity={0.85}/>
                  ))}
                  {(p.players_data||DEFAULT_PLAYERS).map(pl=>(
                    <g key={pl.id}>
                      <circle cx={pl.x*370} cy={pl.y*200} r={11} fill={pl.color} stroke="#fff" strokeWidth={1.5}/>
                      <text x={pl.x*370} y={pl.y*200+4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>{pl.label}</text>
                    </g>
                  ))}
                  {(p.defenders_data||[]).map(d=>(
                    <g key={d.id}>
                      <line x1={d.x*370-8} y1={d.y*200-8} x2={d.x*370+8} y2={d.y*200+8} stroke="#f87171" strokeWidth={2.5}/>
                      <line x1={d.x*370+8} y1={d.y*200-8} x2={d.x*370-8} y2={d.y*200+8} stroke="#f87171" strokeWidth={2.5}/>
                    </g>
                  ))}
                </svg>
              </div>
              {/* Info */}
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{p.name}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                <span style={S.pill(BRAND.gold)}>{p.category}</span>
                {(p.tags||[]).slice(0,3).map(t=><span key={t} style={S.pill("#60a5fa")}>{t}</span>)}
                {(p.tags||[]).length>3&&<span style={{fontSize:11,color:BRAND.textSecondary}}>+{(p.tags||[]).length-3}</span>}
              </div>
              {p.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.notes}</div>}
              <div style={{display:"flex",gap:7}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>{setActivePlay(p);setView("viewer");}} style={{...S.btn("green"),flex:1,justifyContent:"center",fontSize:11}}>▶ View</button>
                {isAdmin&&<>
                  <button onClick={()=>{setActivePlay(p);setView("create");}} style={{...S.btn("secondary"),padding:"7px 11px"}} title="Edit">✏️</button>
                  <button onClick={()=>duplicate(p)} style={{...S.btn("secondary"),padding:"7px 11px"}} title="Duplicate">📋</button>
                  <button onClick={()=>del(p.id)} style={{...S.btn("danger"),padding:"7px 11px"}} title="Delete">🗑️</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
