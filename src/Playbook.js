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
  btn:(v="primary")=>({ padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, border:"none",
    background:v==="primary"?BRAND.crimson:v==="gold"?BRAND.gold:v==="danger"?"#7f1d1d":v==="green"?"#14532d":v==="active"?`${BRAND.crimson}55`:BRAND.surfaceLight,
    color:v==="gold"?BRAND.black:BRAND.textPrimary, display:"flex", alignItems:"center", gap:6 }),
  input:{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, padding:"7px 11px", color:BRAND.textPrimary, fontSize:13, outline:"none", width:"100%" },
  card:{ background:BRAND.surfaceLight, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"16px 20px", marginBottom:16 },
  pill:(c)=>({ padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:600, background:`${c}22`, color:c, display:"inline-block" }),
};

const PLAYER_COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7"];
const DEFAULT_PLAYERS = [
  { id:1, label:"PG", x:0.5,  y:0.82, color:"#ef4444" },
  { id:2, label:"SG", x:0.25, y:0.68, color:"#3b82f6" },
  { id:3, label:"SF", x:0.75, y:0.68, color:"#22c55e" },
  { id:4, label:"PF", x:0.3,  y:0.42, color:"#f59e0b" },
  { id:5, label:"C",  x:0.7,  y:0.42, color:"#a855f7" },
];

const LINE_TYPES = [
  { id:"pass",    label:"Pass",    color:"#facc15", dash:[],    arrow:true  },
  { id:"cut",     label:"Cut",     color:"#4ade80", dash:[8,4], arrow:true  },
  { id:"dribble", label:"Dribble", color:"#60a5fa", dash:[4,4], arrow:true  },
  { id:"screen",  label:"Screen",  color:"#fb923c", dash:[],    arrow:false },
];

const PLAY_CATEGORIES = ["Offense","Defense","Set Plays","Out of Bounds","Transition","Press Break"];

// ── Parse text frames into animation steps ──
// Format: "1. PG pass to C | 2. SG cut to basket | 3. PF set screen"
function parseFrames(text, players) {
  if (!text) return [];
  const lines = text.split(/\n|\|/).map(l=>l.trim()).filter(Boolean);
  const frames = [];
  lines.forEach(line => {
    // Remove numbering like "1." or "Step 1:"
    const clean = line.replace(/^(\d+[\.\)]|step\s*\d+[:.]?)\s*/i,"").trim();
    if (!clean) return;
    // Try to parse "X action to/toward Y"
    const actionMap = {
      pass: "pass", passes: "pass",
      cut: "cut", cuts: "cut", "cuts to": "cut",
      dribble: "dribble", dribbles: "dribble", "drives to": "dribble", drives: "dribble",
      screen: "screen", screens: "screen", "sets screen": "screen", "set screen": "screen",
      move: "cut", moves: "cut", runs: "cut",
    };
    let fromLabel = null, toLabel = null, actionType = "pass";
    const lower = clean.toLowerCase();
    // Find action type
    for (const [kw, type] of Object.entries(actionMap)) {
      if (lower.includes(kw)) { actionType = type; break; }
    }
    // Find player labels mentioned
    const labels = ["PG","SG","SF","PF","C"];
    const mentioned = labels.filter(l => lower.includes(l.toLowerCase()));
    if (mentioned.length >= 2) { fromLabel = mentioned[0]; toLabel = mentioned[1]; }
    else if (mentioned.length === 1) { fromLabel = mentioned[0]; }
    const fromPlayer = players.find(p => p.label === fromLabel);
    const toPlayer = players.find(p => p.label === toLabel);
    frames.push({ description: clean, actionType, fromLabel, toLabel, fromId: fromPlayer?.id, toId: toPlayer?.id });
  });
  return frames;
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

// ── PLAY EDITOR ──
function PlayEditor({ play, onSave, onCancel, readOnly }) {
  const svgRef = useRef(null);
  const [players, setPlayers] = useState(play?.players_data || DEFAULT_PLAYERS.map(p=>({...p})));
  const [lines, setLines] = useState(play?.lines_data || []);
  const [lineType, setLineType] = useState("pass");
  const [tool, setTool] = useState("select");
  const [dragging, setDragging] = useState(null);
  const [drawing, setDrawing] = useState(null);
  const [name, setName] = useState(play?.name || "New Play");
  const [category, setCategory] = useState(play?.category || "Offense");
  const [notes, setNotes] = useState(play?.notes || "");
  const [frameText, setFrameText] = useState(play?.frames?.map((f,i)=>`${i+1}. ${f.description||""}`).join("\n")||"");
  const [parsedFrames, setParsedFrames] = useState(play?.frames||[]);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [animPlayers, setAnimPlayers] = useState(null);
  const [animMode, setAnimMode] = useState("draw"); // draw | frames
  const [saving, setSaving] = useState(false);
  const animRef = useRef(null);
  const W = 380, H = 520;

  const getSVGPos = useCallback((e) => {
    const svg = svgRef.current; if (!svg) return {x:0,y:0};
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x:(clientX-rect.left)/rect.width, y:(clientY-rect.top)/rect.height };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (readOnly||animating) return;
    const pos = getSVGPos(e);
    if (tool==="select") {
      const hit = players.find(p=>Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<18);
      if (hit) setDragging(hit.id);
    } else if (tool==="draw") {
      const hit = players.find(p=>Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<18);
      if (hit) setDrawing({fromId:hit.id,x1:hit.x,y1:hit.y,x2:pos.x,y2:pos.y});
    }
  },[tool,players,readOnly,animating,getSVGPos]);

  const handleMouseMove = useCallback((e) => {
    if (readOnly||animating) return;
    const pos = getSVGPos(e);
    if (dragging!==null) setPlayers(ps=>ps.map(p=>p.id===dragging?{...p,x:Math.max(0.05,Math.min(0.95,pos.x)),y:Math.max(0.05,Math.min(0.95,pos.y))}:p));
    if (drawing) setDrawing(d=>({...d,x2:pos.x,y2:pos.y}));
  },[dragging,drawing,readOnly,animating,getSVGPos]);

  const handleMouseUp = useCallback((e) => {
    if (readOnly||animating) return;
    const pos = getSVGPos(e);
    if (dragging!==null) setDragging(null);
    if (drawing) {
      const hit = players.find(p=>p.id!==drawing.fromId&&Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H)<18);
      const lt = LINE_TYPES.find(l=>l.id===lineType);
      setLines(ls=>[...ls,{id:Date.now(),type:lineType,color:lt.color,dash:lt.dash,arrow:lt.arrow,fromId:drawing.fromId,toId:hit?.id||null,x1:drawing.x1,y1:drawing.y1,x2:pos.x,y2:pos.y}]);
      setDrawing(null);
    }
  },[drawing,dragging,players,lineType,readOnly,animating,getSVGPos]);

  // Parse frame text → frames
  const handleFrameTextChange = (txt) => {
    setFrameText(txt);
    const parsed = parseFrames(txt, players);
    setParsedFrames(parsed);
  };

  // Build lines from parsed frames for animation
  const buildFrameLines = () => {
    return parsedFrames.filter(f=>f.fromId).map((f,i)=>{
      const from = players.find(p=>p.id===f.fromId);
      const to = players.find(p=>p.id===f.toId);
      const lt = LINE_TYPES.find(l=>l.id===f.actionType)||LINE_TYPES[0];
      const tx = to?to.x:from.x+(Math.random()*0.3-0.15);
      const ty = to?to.y:from.y-0.2;
      return {id:i,type:lt.id,color:lt.color,dash:lt.dash,arrow:lt.arrow,fromId:f.fromId,toId:f.toId||null,x1:from.x,y1:from.y,x2:tx,y2:ty};
    });
  };

  const activeLines = animMode==="frames" ? buildFrameLines() : lines;

  // Animation
  const startAnim = () => {
    if (activeLines.length===0) return;
    setAnimStep(0); setAnimPlayers(players.map(p=>({...p}))); setAnimating(true);
  };

  useEffect(()=>{
    if (!animating) return;
    const steps = activeLines.length; let step = 0;
    const run = () => {
      if (step>=steps) { setAnimating(false); setAnimPlayers(null); return; }
      const line = activeLines[step];
      if (line.toId) setAnimPlayers(prev=>prev.map(p=>p.id===line.fromId?{...p,x:line.x2,y:line.y2}:p));
      setAnimStep(step+1); step++;
      animRef.current = setTimeout(run, 800);
    };
    animRef.current = setTimeout(run, 400);
    return ()=>clearTimeout(animRef.current);
  },[animating]);

  const stopAnim = () => { clearTimeout(animRef.current); setAnimating(false); setAnimPlayers(null); };
  const displayPlayers = animating&&animPlayers ? animPlayers : players;

  const save = async () => {
    setSaving(true);
    const frames = animMode==="frames" ? parsedFrames : [];
    const data = { name, category, notes, players_data:players, lines_data:lines, frames };
    if (play?.id) await supabase.from("plays").update(data).eq("id",play.id);
    else await supabase.from("plays").insert([data]);
    setSaving(false);
    onSave();
  };

  return (
    <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
      {/* Canvas */}
      <div style={{flex:"none"}}>
        {!readOnly && (
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",gap:4,background:BRAND.charcoal,borderRadius:8,padding:4}}>
              <button onClick={()=>setAnimMode("draw")} style={{...S.btn(animMode==="draw"?"active":"secondary"),fontSize:11}}>✏️ Draw</button>
              <button onClick={()=>setAnimMode("frames")} style={{...S.btn(animMode==="frames"?"active":"secondary"),fontSize:11}}>📋 Frame Breakdown</button>
            </div>
            {animMode==="draw" && <>
              <button onClick={()=>setTool("select")} style={S.btn(tool==="select"?"active":"secondary")}>🖱️ Select</button>
              <button onClick={()=>setTool("draw")} style={S.btn(tool==="draw"?"active":"secondary")}>✏️ Draw</button>
              {LINE_TYPES.map(lt=>(
                <button key={lt.id} onClick={()=>{setLineType(lt.id);setTool("draw");}}
                  style={{...S.btn(lineType===lt.id&&tool==="draw"?"active":"secondary"),borderLeft:`3px solid ${lt.color}`,fontSize:11}}>
                  {lt.label}
                </button>
              ))}
              <button onClick={()=>setLines(ls=>ls.slice(0,-1))} style={S.btn("secondary")}>↩️</button>
              <button onClick={()=>setLines([])} style={S.btn("danger")}>🗑️</button>
            </>}
          </div>
        )}
        <svg ref={svgRef} width={W} height={H}
          style={{display:"block",borderRadius:10,cursor:tool==="draw"&&animMode==="draw"?"crosshair":"default",userSelect:"none",border:`1px solid ${BRAND.border}`}}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
          <Court width={W} height={H}/>
          {/* Lines */}
          {activeLines.map((ln,i)=>{
            const x1=ln.x1*W,y1=ln.y1*H,x2=ln.x2*W,y2=ln.y2*H;
            const animated=animating&&animStep>i;
            return(
              <g key={ln.id||i} opacity={animated?1:0.9}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ln.color} strokeWidth={2.5} strokeDasharray={ln.dash.join(",")} opacity={0.9}/>
                {ln.arrow&&arrowHead(x1,y1,x2,y2,ln.color)}
                {animated&&<circle cx={x2} cy={y2} r={6} fill={ln.color} opacity={0.5}/>}
              </g>
            );
          })}
          {drawing&&<line x1={drawing.x1*W} y1={drawing.y1*H} x2={drawing.x2*W} y2={drawing.y2*H} stroke={LINE_TYPES.find(l=>l.id===lineType)?.color||"#fff"} strokeWidth={2} strokeDasharray="6,3" opacity={0.7}/>}
          {/* Players */}
          {displayPlayers.map(p=>(
            <g key={p.id} style={{transition:animating?"all 0.7s ease":"none"}}>
              <circle cx={p.x*W} cy={p.y*H} r={16} fill={p.color} stroke="#fff" strokeWidth={2} opacity={0.92}/>
              <text x={p.x*W} y={p.y*H+5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{p.label}</text>
            </g>
          ))}
          {animating&&<text x={W-10} y={20} textAnchor="end" fill={BRAND.gold} fontSize={12} fontWeight={700}>Step {animStep}/{activeLines.length}</text>}
          {/* Frame label */}
          {animating&&animMode==="frames"&&parsedFrames[animStep-1]&&(
            <g>
              <rect x={4} y={H-38} width={W-8} height={30} rx={6} fill="#000a"/>
              <text x={W/2} y={H-18} textAnchor="middle" fill={BRAND.gold} fontSize={12}>{parsedFrames[animStep-1].description}</text>
            </g>
          )}
        </svg>
        {/* Anim controls */}
        <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center",flexWrap:"wrap"}}>
          {animating
            ? <button onClick={stopAnim} style={S.btn("danger")}>⏹ Stop</button>
            : <button onClick={startAnim} disabled={activeLines.length===0} style={{...S.btn("green"),opacity:activeLines.length===0?0.5:1}}>▶ Animate Play</button>
          }
          {!readOnly&&<button onClick={()=>setPlayers(DEFAULT_PLAYERS.map(p=>({...p})))} style={S.btn("secondary")}>🔄 Reset Players</button>}
        </div>
        {/* Legend */}
        <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
          {LINE_TYPES.map(lt=>(
            <div key={lt.id} style={{display:"flex",alignItems:"center",gap:5}}>
              <svg width={24} height={8}><line x1={0} y1={4} x2={24} y2={4} stroke={lt.color} strokeWidth={2.5} strokeDasharray={lt.dash.join(",")}/></svg>
              <span style={{fontSize:11,color:BRAND.textSecondary}}>{lt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{flex:1,minWidth:240}}>
        {!readOnly ? (
          <>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Play Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} style={S.input}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Category</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} style={S.input}>
                {PLAY_CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Coach Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{...S.input,height:70,resize:"vertical"}} placeholder="Key reads, timing, options…"/>
            </div>

            {/* Frame Breakdown */}
            <div style={{...S.card,background:BRAND.charcoal,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:BRAND.gold,marginBottom:8}}>📋 Animation Frame Breakdown</div>
              <div style={{fontSize:11,color:BRAND.textSecondary,marginBottom:8,lineHeight:1.6}}>
                Write each action on a new line. Mention player positions (PG, SG, SF, PF, C) and actions (pass, cut, dribble, screen).<br/>
                <span style={{color:BRAND.gold}}>Example:</span><br/>
                1. PG dribble toward C<br/>
                2. C set screen for SG<br/>
                3. PG pass to SF<br/>
                4. SG cut to basket
              </div>
              <textarea
                value={frameText}
                onChange={e=>handleFrameTextChange(e.target.value)}
                style={{...S.input,height:120,resize:"vertical",fontFamily:"monospace",fontSize:12}}
                placeholder={"1. PG pass to C\n2. SG cut to basket\n3. PF set screen for SF\n4. C dribble to elbow"}
              />
              {parsedFrames.length>0&&(
                <div style={{marginTop:10}}>
                  <div style={{fontSize:11,color:BRAND.textSecondary,marginBottom:6}}>Parsed {parsedFrames.length} actions:</div>
                  {parsedFrames.map((f,i)=>{
                    const lt=LINE_TYPES.find(l=>l.id===f.actionType);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                        <span style={{fontSize:11,fontWeight:700,color:BRAND.gold,minWidth:20}}>{i+1}.</span>
                        <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={lt?.color||"#fff"} strokeWidth={2} strokeDasharray={(lt?.dash||[]).join(",")}/></svg>
                        <span style={{fontSize:11,color:lt?.color||"#fff"}}>{lt?.label}</span>
                        <span style={{fontSize:11,color:BRAND.textPrimary}}>{f.fromLabel}{f.toLabel?` → ${f.toLabel}`:""}</span>
                        <span style={{fontSize:10,color:BRAND.textSecondary,flex:1,textAlign:"right"}}>{f.description}</span>
                      </div>
                    );
                  })}
                  <button onClick={()=>{setAnimMode("frames");startAnim();}} style={{...S.btn("green"),marginTop:8,width:"100%",justifyContent:"center"}}>▶ Preview Frame Animation</button>
                </div>
              )}
            </div>

            <div style={{...S.card,background:BRAND.charcoal,marginBottom:12,fontSize:12,color:BRAND.textSecondary,lineHeight:1.7}}>
              <div style={{fontWeight:700,color:BRAND.textPrimary,marginBottom:6}}>How to use:</div>
              <div>🖱️ <b>Select</b> tab → drag players to starting positions</div>
              <div>✏️ <b>Draw</b> tab → click player, drag to target</div>
              <div>📋 <b>Frame Breakdown</b> → type steps, auto-animates</div>
              <div>▶ Press <b>Animate</b> to preview</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onCancel} style={S.btn("secondary")}>Cancel</button>
              <button onClick={save} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":"💾 Save Play"}</button>
            </div>
          </>
        ) : (
          <>
            <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>{play.name}</div>
            <div style={{marginBottom:10}}><span style={S.pill(BRAND.gold)}>{play.category}</span></div>
            {play.notes&&<div style={{...S.card,fontSize:13,color:BRAND.textSecondary,lineHeight:1.7}}><div style={{fontWeight:700,color:BRAND.textPrimary,marginBottom:6}}>📋 Coach Notes</div>{play.notes}</div>}
            {play.frames?.length>0&&(
              <div style={{...S.card}}>
                <div style={{fontWeight:600,color:BRAND.textPrimary,marginBottom:10}}>Animation Steps ({play.frames.length})</div>
                {play.frames.map((f,i)=>{
                  const lt=LINE_TYPES.find(l=>l.id===f.actionType);
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                      <span style={{fontSize:12,fontWeight:700,color:BRAND.gold,minWidth:24}}>{i+1}.</span>
                      <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={lt?.color||"#fff"} strokeWidth={2} strokeDasharray={(lt?.dash||[]).join(",")}/></svg>
                      <span style={{fontSize:12,color:lt?.color}}>{lt?.label}</span>
                      <span style={{fontSize:12}}>{f.fromLabel}{f.toLabel?` → ${f.toLabel}`:""}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {play.lines_data?.length>0&&(
              <div style={{...S.card,fontSize:12,color:BRAND.textSecondary}}>
                <div style={{fontWeight:600,color:BRAND.textPrimary,marginBottom:8}}>Drawn Actions ({play.lines_data.length})</div>
                {play.lines_data.map((ln,i)=>{
                  const lt=LINE_TYPES.find(l=>l.id===ln.type);
                  const from=play.players_data?.find(p=>p.id===ln.fromId);
                  const to=play.players_data?.find(p=>p.id===ln.toId);
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                      <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={lt?.color||"#fff"} strokeWidth={2} strokeDasharray={(lt?.dash||[]).join(",")}/></svg>
                      <span style={{color:lt?.color}}>{lt?.label}</span>
                      <span>{from?.label}{to?` → ${to.label}`:""}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={onCancel} style={S.btn("secondary")}>← Back to Playbook</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── PLAYBOOK MODULE ──
export default function Playbook({ isAdmin }) {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [activePlay, setActivePlay] = useState(null);
  const [filterCat, setFilterCat] = useState("All");

  useEffect(()=>{ loadPlays(); },[]);

  const loadPlays = async () => {
    setLoading(true);
    const { data } = await supabase.from("plays").select("*").order("created_at",{ascending:false});
    if (data) setPlays(data);
    setLoading(false);
  };

  const filtered = plays.filter(p=>filterCat==="All"||p.category===filterCat);
  const catCounts = Object.fromEntries(PLAY_CATEGORIES.map(c=>[c,plays.filter(p=>p.category===c).length]));

  const openNew = () => { setActivePlay(null); setView("editor"); };
  const openEdit = (p) => { setActivePlay(p); setView("editor"); };
  const openView = (p) => { setActivePlay(p); setView("viewer"); };
  const deletePlay = async (id) => {
    if (!window.confirm("Delete this play?")) return;
    await supabase.from("plays").delete().eq("id",id);
    loadPlays();
  };

  if (view==="editor") return (
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:18}}>{activePlay?"Edit Play":"New Play"}</h1>
      <PlayEditor play={activePlay} onSave={()=>{setView("list");loadPlays();}} onCancel={()=>setView("list")} readOnly={false}/>
    </div>
  );

  if (view==="viewer") return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"center"}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>📖 {activePlay?.name}</h1>
        {isAdmin&&<button onClick={()=>openEdit(activePlay)} style={S.btn("gold")}>✏️ Edit</button>}
      </div>
      <PlayEditor play={activePlay} onSave={()=>{setView("list");loadPlays();}} onCancel={()=>setView("list")} readOnly={true}/>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>📖 Playbook</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>{plays.length} plays · Saved to database</p>
        </div>
        {isAdmin&&<button onClick={openNew} style={S.btn("gold")}>+ New Play</button>}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>setFilterCat("All")} style={{...S.btn(filterCat==="All"?"primary":"secondary"),fontSize:11}}>All ({plays.length})</button>
        {PLAY_CATEGORIES.filter(c=>catCounts[c]>0||isAdmin).map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{...S.btn(filterCat===c?"primary":"secondary"),fontSize:11}}>{c} {catCounts[c]>0&&`(${catCounts[c]})`}</button>
        ))}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:40,color:BRAND.textSecondary}}>Loading plays…</div>
      ):filtered.length===0?(
        <div style={{...S.card,textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:40,marginBottom:10}}>📋</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No plays yet</div>
          <div style={{fontSize:13,color:BRAND.textSecondary}}>{isAdmin?"Click '+ New Play' to draw your first play.":"No plays added by the coach yet."}</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card,marginBottom:0}}>
              <div style={{marginBottom:12,borderRadius:8,overflow:"hidden",cursor:"pointer",border:`1px solid ${BRAND.border}`}} onClick={()=>openView(p)}>
                <svg width="100%" viewBox="0 0 380 200" style={{display:"block"}}>
                  <Court width={380} height={380}/>
                  {(p.lines_data||[]).map((ln,i)=>(
                    <line key={i} x1={ln.x1*380} y1={ln.y1*200} x2={ln.x2*380} y2={ln.y2*200} stroke={ln.color} strokeWidth={2} strokeDasharray={ln.dash?.join(",")||""} opacity={0.8}/>
                  ))}
                  {(p.players_data||DEFAULT_PLAYERS).map(pl=>(
                    <g key={pl.id}>
                      <circle cx={pl.x*380} cy={pl.y*200} r={11} fill={pl.color} stroke="#fff" strokeWidth={1.5}/>
                      <text x={pl.x*380} y={pl.y*200+4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>{pl.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{p.name}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={S.pill(BRAND.gold)}>{p.category}</span>
                    {p.lines_data?.length>0&&<span style={{fontSize:11,color:BRAND.textSecondary,marginTop:2}}>{p.lines_data.length} drawn</span>}
                    {p.frames?.length>0&&<span style={{fontSize:11,color:"#60a5fa",marginTop:2}}>📋 {p.frames.length} frames</span>}
                  </div>
                  {p.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:6,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.notes}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>openView(p)} style={{...S.btn("green"),flex:1,justifyContent:"center"}}>▶ View & Animate</button>
                {isAdmin&&<>
                  <button onClick={()=>openEdit(p)} style={{...S.btn("secondary"),padding:"7px 12px"}}>✏️</button>
                  <button onClick={()=>deletePlay(p.id)} style={{...S.btn("danger"),padding:"7px 12px"}}>🗑️</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
