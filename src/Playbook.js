/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";

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

// ── PLAYER POSITIONS (5 on court) ──
const PLAYER_COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7"];
const POSITION_LABELS = ["PG","SG","SF","PF","C"];
const DEFAULT_PLAYERS = [
  { id:1, label:"PG", x:0.5,  y:0.85, color:"#ef4444" },
  { id:2, label:"SG", x:0.25, y:0.70, color:"#3b82f6" },
  { id:3, label:"SF", x:0.75, y:0.70, color:"#22c55e" },
  { id:4, label:"PF", x:0.3,  y:0.45, color:"#f59e0b" },
  { id:5, label:"C",  x:0.7,  y:0.45, color:"#a855f7" },
];

const LINE_TYPES = [
  { id:"pass",    label:"Pass",    color:"#facc15", dash:[]           , arrow:true  },
  { id:"cut",     label:"Cut",     color:"#4ade80", dash:[8,4]        , arrow:true  },
  { id:"dribble", label:"Dribble", color:"#60a5fa", dash:[4,4]        , arrow:true  },
  { id:"screen",  label:"Screen",  color:"#fb923c", dash:[]           , arrow:false },
];

const PLAY_CATEGORIES = ["Offense","Defense","Set Plays","Out of Bounds","Transition","Press Break"];

// ── COURT SVG ──
function Court({ width, height }) {
  const scaleX = w => w * width;
  const scaleY = h => h * height;
  const stroke = "#2a5c2a";
  const lw = 1.5;
  return (
    <g>
      {/* Court background */}
      <rect x={0} y={0} width={width} height={height} fill="#1a3a1a" rx={4}/>
      {/* Outer boundary */}
      <rect x={scaleX(0.04)} y={scaleY(0.03)} width={scaleX(0.92)} height={scaleY(0.94)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Half court line */}
      <line x1={scaleX(0.04)} y1={scaleY(0.5)} x2={scaleX(0.96)} y2={scaleY(0.5)} stroke={stroke} strokeWidth={lw}/>
      {/* Center circle */}
      <circle cx={scaleX(0.5)} cy={scaleY(0.5)} r={scaleX(0.08)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Top key */}
      <rect x={scaleX(0.33)} y={scaleY(0.03)} width={scaleX(0.34)} height={scaleY(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Top lane */}
      <rect x={scaleX(0.38)} y={scaleY(0.03)} width={scaleX(0.24)} height={scaleY(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Top free-throw circle */}
      <circle cx={scaleX(0.5)} cy={scaleY(0.31)} r={scaleX(0.09)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Top basket */}
      <circle cx={scaleX(0.5)} cy={scaleY(0.08)} r={scaleX(0.025)} fill="none" stroke={stroke} strokeWidth={2}/>
      <line x1={scaleX(0.46)} y1={scaleY(0.065)} x2={scaleX(0.54)} y2={scaleY(0.065)} stroke={stroke} strokeWidth={2}/>
      {/* Top 3pt arc */}
      <path d={`M ${scaleX(0.15)} ${scaleY(0.03)} Q ${scaleX(0.5)} ${scaleY(0.42)} ${scaleX(0.85)} ${scaleY(0.03)}`} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Bottom key */}
      <rect x={scaleX(0.33)} y={scaleY(0.69)} width={scaleX(0.34)} height={scaleY(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Bottom lane */}
      <rect x={scaleX(0.38)} y={scaleY(0.69)} width={scaleX(0.24)} height={scaleY(0.28)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Bottom free-throw circle */}
      <circle cx={scaleX(0.5)} cy={scaleY(0.69)} r={scaleX(0.09)} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Bottom basket */}
      <circle cx={scaleX(0.5)} cy={scaleY(0.92)} r={scaleX(0.025)} fill="none" stroke={stroke} strokeWidth={2}/>
      <line x1={scaleX(0.46)} y1={scaleY(0.935)} x2={scaleX(0.54)} y2={scaleY(0.935)} stroke={stroke} strokeWidth={2}/>
      {/* Bottom 3pt arc */}
      <path d={`M ${scaleX(0.15)} ${scaleY(0.97)} Q ${scaleX(0.5)} ${scaleY(0.58)} ${scaleX(0.85)} ${scaleY(0.97)}`} fill="none" stroke={stroke} strokeWidth={lw}/>
      {/* Paint areas shading */}
      <rect x={scaleX(0.33)} y={scaleY(0.03)} width={scaleX(0.34)} height={scaleY(0.28)} fill="#1e4a1e" opacity={0.5}/>
      <rect x={scaleX(0.33)} y={scaleY(0.69)} width={scaleX(0.34)} height={scaleY(0.28)} fill="#1e4a1e" opacity={0.5}/>
    </g>
  );
}

// ── ARROW HELPER ──
function arrowHead(x1,y1,x2,y2,color) {
  const angle = Math.atan2(y2-y1, x2-x1);
  const len = 10;
  const a1 = angle - Math.PI/6;
  const a2 = angle + Math.PI/6;
  return <polygon
    points={`${x2},${y2} ${x2-len*Math.cos(a1)},${y2-len*Math.sin(a1)} ${x2-len*Math.cos(a2)},${y2-len*Math.sin(a2)}`}
    fill={color}/>;
}

// ── PLAY EDITOR ──
function PlayEditor({ play, onSave, onCancel, readOnly }) {
  const svgRef = useRef(null);
  const [players, setPlayers] = useState(play?.players || DEFAULT_PLAYERS.map(p=>({...p})));
  const [lines, setLines] = useState(play?.lines || []);
  const [lineType, setLineType] = useState("pass");
  const [tool, setTool] = useState("select"); // select | draw | player
  const [dragging, setDragging] = useState(null);
  const [drawing, setDrawing] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [animPlayers, setAnimPlayers] = useState(null);
  const [name, setName] = useState(play?.name || "New Play");
  const [category, setCategory] = useState(play?.category || "Offense");
  const [notes, setNotes] = useState(play?.notes || "");
  const animRef = useRef(null);

  const W = 380, H = 540;

  const getSVGPos = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return {x:0,y:0};
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (readOnly || animating) return;
    const pos = getSVGPos(e);
    if (tool === "select") {
      const hit = players.find(p => Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H) < 18);
      if (hit) setDragging(hit.id);
    } else if (tool === "draw") {
      const hit = players.find(p => Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H) < 18);
      if (hit) setDrawing({ fromId: hit.id, x1: hit.x, y1: hit.y, x2: pos.x, y2: pos.y });
    }
  }, [tool, players, readOnly, animating, getSVGPos]);

  const handleMouseMove = useCallback((e) => {
    if (readOnly || animating) return;
    const pos = getSVGPos(e);
    if (dragging !== null) {
      setPlayers(ps => ps.map(p => p.id === dragging ? {...p, x: Math.max(0.05,Math.min(0.95,pos.x)), y: Math.max(0.05,Math.min(0.95,pos.y))} : p));
    }
    if (drawing) setDrawing(d => ({...d, x2: pos.x, y2: pos.y}));
  }, [dragging, drawing, readOnly, animating, getSVGPos]);

  const handleMouseUp = useCallback((e) => {
    if (readOnly || animating) return;
    const pos = getSVGPos(e);
    if (dragging !== null) setDragging(null);
    if (drawing) {
      const hit = players.find(p => p.id !== drawing.fromId && Math.hypot((p.x-pos.x)*W,(p.y-pos.y)*H) < 18);
      const toId = hit ? hit.id : null;
      const lt = LINE_TYPES.find(l=>l.id===lineType);
      setLines(ls => [...ls, { id: Date.now(), type: lineType, color: lt.color, dash: lt.dash, arrow: lt.arrow,
        fromId: drawing.fromId, toId, x1: drawing.x1, y1: drawing.y1, x2: pos.x, y2: pos.y }]);
      setDrawing(null);
    }
  }, [drawing, dragging, players, lineType, readOnly, animating, getSVGPos]);

  const clearLines = () => setLines([]);
  const resetPlayers = () => setPlayers(DEFAULT_PLAYERS.map(p=>({...p})));
  const undoLine = () => setLines(ls => ls.slice(0,-1));

  // Animation: move players along their lines step by step
  const startAnim = () => {
    if (lines.length === 0) return;
    setAnimStep(0);
    setAnimPlayers(players.map(p=>({...p})));
    setAnimating(true);
  };

  useEffect(() => {
    if (!animating) return;
    const steps = lines.length;
    let step = 0;
    const run = () => {
      if (step >= steps) { setAnimating(false); setAnimPlayers(null); return; }
      const line = lines[step];
      if (line.toId) {
        setAnimPlayers(prev => prev.map(p => p.id === line.fromId ? {...p, x: line.x2, y: line.y2} : p));
      }
      setAnimStep(step+1);
      step++;
      animRef.current = setTimeout(run, 700);
    };
    animRef.current = setTimeout(run, 300);
    return () => clearTimeout(animRef.current);
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [animating]);

  const stopAnim = () => { clearTimeout(animRef.current); setAnimating(false); setAnimPlayers(null); };
  const displayPlayers = animating && animPlayers ? animPlayers : players;

  const save = () => onSave({ ...play, name, category, notes, players, lines, id: play?.id || Date.now() });

  return (
    <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
      {/* Left: Canvas */}
      <div style={{flex:"none"}}>
        {!readOnly && (
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {/* Tools */}
            <button onClick={()=>setTool("select")} style={S.btn(tool==="select"?"active":"secondary")}>🖱️ Select</button>
            <button onClick={()=>setTool("draw")} style={S.btn(tool==="draw"?"active":"secondary")}>✏️ Draw</button>
            <div style={{width:1,background:BRAND.border,margin:"0 4px"}}/>
            {LINE_TYPES.map(lt=>(
              <button key={lt.id} onClick={()=>{setLineType(lt.id);setTool("draw");}}
                style={{...S.btn(lineType===lt.id&&tool==="draw"?"active":"secondary"), borderLeft:`3px solid ${lt.color}`}}>
                {lt.label}
              </button>
            ))}
            <div style={{width:1,background:BRAND.border,margin:"0 4px"}}/>
            <button onClick={undoLine} style={S.btn("secondary")}>↩️ Undo</button>
            <button onClick={clearLines} style={S.btn("danger")}>🗑️ Lines</button>
            <button onClick={resetPlayers} style={S.btn("danger")}>🔄 Reset</button>
          </div>
        )}
        {/* SVG Court */}
        <svg ref={svgRef} width={W} height={H} style={{display:"block",borderRadius:10,cursor:tool==="draw"?"crosshair":"default",userSelect:"none",border:`1px solid ${BRAND.border}`}}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
          <Court width={W} height={H}/>
          {/* Lines */}
          {lines.map((ln,i) => {
            const x1=ln.x1*W, y1=ln.y1*H, x2=ln.x2*W, y2=ln.y2*H;
            const animated = animating && animStep > i;
            return (
              <g key={ln.id} opacity={animated?1:0.9}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ln.color} strokeWidth={2.5}
                  strokeDasharray={ln.dash.join(",")} opacity={0.9}/>
                {ln.arrow && arrowHead(x1,y1,x2,y2,ln.color)}
                {animated && <circle cx={x2} cy={y2} r={5} fill={ln.color} opacity={0.6}/>}
              </g>
            );
          })}
          {/* Drawing preview */}
          {drawing && (
            <line x1={drawing.x1*W} y1={drawing.y1*H} x2={drawing.x2*W} y2={drawing.y2*H}
              stroke={LINE_TYPES.find(l=>l.id===lineType)?.color||"#fff"} strokeWidth={2} strokeDasharray="6,3" opacity={0.7}/>
          )}
          {/* Players */}
          {displayPlayers.map(p => (
            <g key={p.id} style={{transition:animating?"all 0.6s ease":"none"}}>
              <circle cx={p.x*W} cy={p.y*H} r={16} fill={p.color} stroke="#fff" strokeWidth={2} opacity={0.92}/>
              <text x={p.x*W} y={p.y*H+5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{p.label}</text>
            </g>
          ))}
          {/* Anim step counter */}
          {animating && (
            <text x={W-10} y={20} textAnchor="end" fill={BRAND.gold} fontSize={12} fontWeight={700}>Step {animStep}/{lines.length}</text>
          )}
        </svg>
        {/* Animation controls */}
        <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center"}}>
          {animating
            ? <button onClick={stopAnim} style={S.btn("danger")}>⏹ Stop</button>
            : <button onClick={startAnim} disabled={lines.length===0} style={{...S.btn("green"),opacity:lines.length===0?0.5:1}}>▶ Animate Play</button>
          }
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

      {/* Right: Play details */}
      <div style={{flex:1,minWidth:220}}>
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
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Coach Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{...S.input,height:90,resize:"vertical"}} placeholder="Describe the play, key reads, timing…"/>
            </div>
            <div style={{background:BRAND.charcoal,borderRadius:10,padding:14,marginBottom:14,fontSize:12,color:BRAND.textSecondary,lineHeight:1.7}}>
              <div style={{fontWeight:700,color:BRAND.textPrimary,marginBottom:6}}>How to draw:</div>
              <div>1️⃣ <b>Select</b> — drag players to positions</div>
              <div>2️⃣ <b>Draw</b> + pick line type — click a player, drag to target</div>
              <div>3️⃣ Press <b>▶ Animate</b> to preview the play</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onCancel} style={S.btn("secondary")}>Cancel</button>
              <button onClick={save} style={S.btn("gold")}>💾 Save Play</button>
            </div>
          </>
        ) : (
          <>
            <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>{play.name}</div>
            <div style={{marginBottom:10}}><span style={S.pill(BRAND.gold)}>{play.category}</span></div>
            {play.notes && (
              <div style={{...S.card,fontSize:13,color:BRAND.textSecondary,lineHeight:1.7}}>
                <div style={{fontWeight:700,color:BRAND.textPrimary,marginBottom:6}}>📋 Coach Notes</div>
                {play.notes}
              </div>
            )}
            <div style={{...S.card,fontSize:12,color:BRAND.textSecondary}}>
              <div style={{fontWeight:600,color:BRAND.textPrimary,marginBottom:8}}>Play Actions ({play.lines.length})</div>
              {play.lines.map((ln,i)=>{
                const lt=LINE_TYPES.find(l=>l.id===ln.type);
                const from=play.players.find(p=>p.id===ln.fromId);
                const to=play.players.find(p=>p.id===ln.toId);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                    <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={lt?.color||"#fff"} strokeWidth={2} strokeDasharray={(lt?.dash||[]).join(",")}/></svg>
                    <span style={{color:lt?.color}}>{lt?.label}</span>
                    <span>{from?.label} {to?`→ ${to.label}`:""}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={onCancel} style={S.btn("secondary")}>← Back to Playbook</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN PLAYBOOK MODULE ──
const SAMPLE_PLAYS = [
  {
    id:1, name:"Pick & Roll", category:"Offense", notes:"PG sets up the pick & roll with the C at the elbow. SG cuts baseline. PF spots up at the corner.",
    players: DEFAULT_PLAYERS.map(p=>({...p})),
    lines:[
      {id:101,type:"dribble",color:"#60a5fa",dash:[4,4],arrow:true,fromId:1,toId:null,x1:0.5,y1:0.85,x2:0.5,y2:0.65},
      {id:102,type:"screen",color:"#fb923c",dash:[],arrow:false,fromId:5,toId:null,x1:0.7,y1:0.45,x2:0.5,y2:0.6},
      {id:103,type:"pass",color:"#facc15",dash:[],arrow:true,fromId:1,toId:4,x1:0.5,y1:0.65,x2:0.3,y2:0.45},
      {id:104,type:"cut",color:"#4ade80",dash:[8,4],arrow:true,fromId:2,toId:null,x1:0.25,y1:0.70,x2:0.4,y2:0.25},
    ]
  },
  {
    id:2, name:"Triangle Offense", category:"Set Plays", notes:"Classic triangle formation. Ball starts at the wing, with post presence and perimeter spacing.",
    players:[
      {id:1,label:"PG",x:0.5,y:0.80,color:"#ef4444"},
      {id:2,label:"SG",x:0.2,y:0.65,color:"#3b82f6"},
      {id:3,label:"SF",x:0.8,y:0.65,color:"#22c55e"},
      {id:4,label:"PF",x:0.2,y:0.40,color:"#f59e0b"},
      {id:5,label:"C", x:0.5,y:0.30,color:"#a855f7"},
    ],
    lines:[
      {id:201,type:"pass",color:"#facc15",dash:[],arrow:true,fromId:1,toId:2,x1:0.5,y1:0.80,x2:0.2,y2:0.65},
      {id:202,type:"cut",color:"#4ade80",dash:[8,4],arrow:true,fromId:3,toId:5,x1:0.8,y1:0.65,x2:0.6,y2:0.30},
      {id:203,type:"pass",color:"#facc15",dash:[],arrow:true,fromId:2,toId:5,x1:0.2,y1:0.65,x2:0.5,y2:0.30},
    ]
  },
];

export default function Playbook({ isAdmin }) {
  const [plays, setPlays] = useState(SAMPLE_PLAYS);
  const [view, setView] = useState("list"); // list | editor | viewer
  const [activePlay, setActivePlay] = useState(null);
  const [filterCat, setFilterCat] = useState("All");

  const filtered = plays.filter(p => filterCat==="All" || p.category===filterCat);
  const catCounts = Object.fromEntries(PLAY_CATEGORIES.map(c=>[c,plays.filter(p=>p.category===c).length]));

  const openNew = () => { setActivePlay(null); setView("editor"); };
  const openEdit = (p) => { setActivePlay(p); setView("editor"); };
  const openView = (p) => { setActivePlay(p); setView("viewer"); };
  const deletePlay = (id) => { if(window.confirm("Delete this play?")) setPlays(ps=>ps.filter(p=>p.id!==id)); };
  const savePlay = (p) => {
    setPlays(ps => ps.find(x=>x.id===p.id) ? ps.map(x=>x.id===p.id?p:x) : [...ps,p]);
    setView("list");
  };

  if (view==="editor") return (
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:18}}>{activePlay?"Edit Play":"New Play"}</h1>
      <PlayEditor play={activePlay} onSave={savePlay} onCancel={()=>setView("list")} readOnly={false}/>
    </div>
  );

  if (view==="viewer") return (
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:18}}>📖 {activePlay?.name}</h1>
      <PlayEditor play={activePlay} onSave={()=>{}} onCancel={()=>setView("list")} readOnly={true}/>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>📖 Playbook</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>{plays.length} plays · Drag players · Draw actions · Animate</p>
        </div>
        {isAdmin && <button onClick={openNew} style={S.btn("gold")}>+ New Play</button>}
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>setFilterCat("All")} style={{...S.btn(filterCat==="All"?"primary":"secondary"),fontSize:11}}>All ({plays.length})</button>
        {PLAY_CATEGORIES.filter(c=>catCounts[c]>0||isAdmin).map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{...S.btn(filterCat===c?"primary":"secondary"),fontSize:11}}>
            {c} {catCounts[c]>0&&`(${catCounts[c]})`}
          </button>
        ))}
      </div>

      {/* Play cards */}
      {filtered.length===0 ? (
        <div style={{...S.card,textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:40,marginBottom:10}}>📋</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No plays yet</div>
          <div style={{fontSize:13,color:BRAND.textSecondary,marginBottom:16}}>
            {isAdmin?"Click '+ New Play' to draw your first play.":"No plays have been added by the coach yet."}
          </div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card,marginBottom:0}}>
              {/* Mini court preview */}
              <div style={{marginBottom:12,borderRadius:8,overflow:"hidden",cursor:"pointer"}} onClick={()=>openView(p)}>
                <svg width="100%" viewBox={`0 0 380 200`} style={{display:"block"}}>
                  <Court width={380} height={380}/>
                  {p.lines.map((ln,i)=>(
                    <line key={i} x1={ln.x1*380} y1={ln.y1*200} x2={ln.x2*380} y2={ln.y2*200}
                      stroke={ln.color} strokeWidth={2} strokeDasharray={ln.dash.join(",")} opacity={0.8}/>
                  ))}
                  {p.players.map(pl=>(
                    <g key={pl.id}>
                      <circle cx={pl.x*380} cy={pl.y*200} r={11} fill={pl.color} stroke="#fff" strokeWidth={1.5}/>
                      <text x={pl.x*380} y={pl.y*200+4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>{pl.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{p.name}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={S.pill(BRAND.gold)}>{p.category}</span>
                    <span style={{fontSize:11,color:BRAND.textSecondary,marginTop:2}}>{p.lines.length} actions</span>
                  </div>
                  {p.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:6,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.notes}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={()=>openView(p)} style={{...S.btn("green"),flex:1,justifyContent:"center"}}>▶ View & Animate</button>
                {isAdmin && <>
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
