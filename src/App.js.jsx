import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── Brand Colors (from logo: crimson red, gold, black, cream) ───
const BRAND = {
  crimson: "#9B1C1C",
  crimsonDark: "#6B0F0F",
  crimsonLight: "#C53030",
  gold: "#D4A017",
  goldLight: "#F0C040",
  black: "#0D0D0D",
  cream: "#F5ECD7",
  charcoal: "#1A1A1A",
  surface: "#111111",
  surfaceLight: "#1E1E1E",
  border: "#2A2A2A",
  textPrimary: "#F0E6D0",
  textSecondary: "#9A8A70",
};

// ─── Logo SVG (Titans winged warrior, schematic) ───
const TitansLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" fill={BRAND.crimson} opacity="0.15" />
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" stroke={BRAND.gold} strokeWidth="1.5" fill="none" />
    <text x="50" y="52" textAnchor="middle" fill={BRAND.gold} fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="3">TITANS</text>
    <text x="50" y="66" textAnchor="middle" fill={BRAND.textSecondary} fontSize="6" fontFamily="serif" letterSpacing="2">ENDERUN</text>
    <line x1="22" y1="58" x2="38" y2="52" stroke={BRAND.gold} strokeWidth="1" opacity="0.6"/>
    <line x1="78" y1="58" x2="62" y2="52" stroke={BRAND.gold} strokeWidth="1" opacity="0.6"/>
    <circle cx="50" cy="50" r="15" stroke={BRAND.crimson} strokeWidth="0.5" fill="none"/>
  </svg>
);

// ─── Seed Data ───
const PLAYERS = [
  { id:1, name:"Marcus Dela Cruz", jersey:3, pos:"PG", yr:"3rd Year", height:'6\'1"', weight:"175 lbs", gpa:3.4, status:"Active", pts:18.2, reb:4.1, ast:7.3, fg:44.2, threept:36.1, ft:82.4, gp:18, stl:1.8, blk:0.3, to:2.4, photo:"MD" },
  { id:2, name:"James Reyes", jersey:11, pos:"SG", yr:"4th Year", height:'6\'3"', weight:"185 lbs", gpa:3.1, status:"Active", pts:15.7, reb:3.8, ast:2.9, fg:41.5, threept:38.7, ft:78.1, gp:18, stl:1.2, blk:0.5, to:1.7, photo:"JR" },
  { id:3, name:"Carlo Santos", jersey:24, pos:"SF", yr:"2nd Year", height:'6\'5"', weight:"200 lbs", gpa:2.9, status:"Active", pts:12.4, reb:6.2, ast:2.1, fg:48.3, threept:28.4, ft:68.9, gp:16, stl:1.1, blk:1.2, to:2.1, photo:"CS" },
  { id:4, name:"Rafael Torres", jersey:32, pos:"PF", yr:"3rd Year", height:'6\'7"', weight:"218 lbs", gpa:3.6, status:"Active", pts:11.1, reb:8.9, ast:1.4, fg:52.1, threept:22.2, ft:71.3, gp:18, stl:0.7, blk:2.1, to:1.8, photo:"RT" },
  { id:5, name:"Andrei Villanueva", jersey:45, pos:"C", yr:"4th Year", height:'6\'9"', weight:"240 lbs", gpa:3.2, status:"Active", pts:9.8, reb:10.2, ast:1.0, fg:58.7, threept:0.0, ft:62.1, gp:17, stl:0.4, blk:3.2, to:1.5, photo:"AV" },
  { id:6, name:"Paolo Mendez", jersey:7, pos:"SG", yr:"2nd Year", height:'6\'2"', weight:"178 lbs", gpa:3.0, status:"Injured", pts:8.3, reb:2.4, ast:3.1, fg:39.2, threept:33.3, ft:76.5, gp:12, stl:1.5, blk:0.2, to:1.9, photo:"PM" },
  { id:7, name:"Luis Castillo", jersey:13, pos:"PG", yr:"1st Year", height:'5\'11"', weight:"163 lbs", gpa:3.8, status:"Active", pts:6.4, reb:1.8, ast:4.2, fg:38.1, threept:31.0, ft:80.0, gp:15, stl:1.3, blk:0.1, to:2.7, photo:"LC" },
  { id:8, name:"Nico Garcia", jersey:21, pos:"PF", yr:"3rd Year", height:'6\'6"', weight:"210 lbs", gpa:2.7, status:"Active", pts:7.9, reb:5.5, ast:1.2, fg:45.8, threept:18.2, ft:65.4, gp:18, stl:0.6, blk:1.4, to:1.3, photo:"NG" },
];

const GAMES = [
  { id:1, opp:"La Salle Falcons", date:"2025-09-10", venue:"Enderun Gym", homeAway:"Home", us:78, them:65, result:"W" },
  { id:2, opp:"Ateneo Blue Eagles", date:"2025-09-17", venue:"Araneta Coliseum", homeAway:"Away", us:61, them:74, result:"L" },
  { id:3, opp:"FEU Tamaraws", date:"2025-09-24", venue:"Enderun Gym", homeAway:"Home", us:82, them:71, result:"W" },
  { id:4, opp:"UST Growling Tigers", date:"2025-10-01", venue:"Filoil Arena", homeAway:"Away", us:69, them:69, result:"OT W" },
  { id:5, opp:"UP Fighting Maroons", date:"2025-10-08", venue:"Enderun Gym", homeAway:"Home", us:85, them:58, result:"W" },
  { id:6, opp:"San Beda Red Lions", date:"2025-10-15", venue:"FilOil Arena", homeAway:"Away", us:55, them:62, result:"L" },
  { id:7, opp:"Letran Knights", date:"2025-10-22", venue:"Enderun Gym", homeAway:"Home", us:91, them:77, result:"W" },
  { id:8, opp:"Mapua Cardinals", date:"2025-10-29", venue:"Enderun Gym", homeAway:"Home", us:74, them:68, result:"W" },
];

const PRACTICES = [
  { id:1, date:"2025-11-04", time:"6:00 AM", type:"Conditioning", location:"Enderun Gym", attendance:14, total:16 },
  { id:2, date:"2025-11-05", time:"6:00 AM", type:"Skill Work", location:"Enderun Gym", attendance:16, total:16 },
  { id:3, date:"2025-11-06", time:"4:00 PM", type:"Film Session", location:"Film Room", attendance:15, total:16 },
  { id:4, date:"2025-11-07", time:"6:00 AM", type:"Full Scrimmage", location:"Enderun Gym", attendance:15, total:16 },
  { id:5, date:"2025-11-10", time:"6:00 AM", type:"Shoot-Around", location:"Enderun Gym", attendance:16, total:16 },
];

const ANNOUNCEMENTS = [
  { id:1, title:"Season 2025–26 Opening Practice", body:"Report to Enderun Gym at 6 AM. Full attendance required. Bring physicals.", date:"2025-11-01", type:"Practice" },
  { id:2, title:"UAAP Registration Deadline", body:"All players must submit eligibility documents to the Office of Student Affairs by November 15.", date:"2025-11-02", type:"Academic" },
  { id:3, title:"Team Bonding Event", body:"Team dinner on November 8 at 7 PM. All players and coaches are invited.", date:"2025-11-03", type:"Social" },
  { id:4, title:"Schedule Change vs. Ateneo", body:"Rescheduled to December 3 at Araneta. New call time is 1:00 PM.", date:"2025-11-04", type:"Schedule" },
];

const ATTENDANCE_TREND = [
  { week:"Wk1", rate:88 }, { week:"Wk2", rate:91 }, { week:"Wk3", rate:94 },
  { week:"Wk4", rate:87 }, { week:"Wk5", rate:96 }, { week:"Wk6", rate:100 },
];

const WIN_LOSS = GAMES.map((g,i) => ({ game: i+1, opp: g.opp.split(" ")[0], us: g.us, them: g.them }));

const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard", icon:"🏠" },
  { id:"roster", label:"Roster", icon:"👥" },
  { id:"stats", label:"Statistics", icon:"📊" },
  { id:"games", label:"Games", icon:"🏀" },
  { id:"attendance", label:"Attendance", icon:"✅" },
  { id:"evaluations", label:"Evaluations", icon:"⭐" },
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"schedule", label:"Schedule", icon:"📅" },
];

// ─── Styles ───
const S = {
  app: { background: BRAND.black, minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: BRAND.textPrimary, display: "flex", flexDirection: "column" },
  header: { background: BRAND.charcoal, borderBottom: `1px solid ${BRAND.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 },
  nav: { background: BRAND.charcoal, width: 220, minHeight: "calc(100vh - 60px)", borderRight: `1px solid ${BRAND.border}`, padding: "16px 0", flexShrink: 0 },
  main: { flex: 1, padding: "28px 32px", overflowY: "auto", background: BRAND.black },
  card: { background: BRAND.surfaceLight, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 },
  cardTitle: { fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: BRAND.textSecondary, marginBottom: 16 },
  statCard: { background: BRAND.surfaceLight, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: "18px 20px", textAlign: "center" },
  statVal: { fontSize: 28, fontWeight: 700, color: BRAND.gold, lineHeight: 1.1 },
  statLabel: { fontSize: 12, color: BRAND.textSecondary, marginTop: 4, letterSpacing: "0.05em" },
  badge: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color === "W" ? "#134a2e" : color === "L" ? "#4a1313" : "#2a2a00", color: color === "W" ? "#4ade80" : color === "L" ? "#f87171" : "#facc15" }),
  pill: (type) => { const m = { Active:"#134a2e", Injured:"#4a1313", Suspended:"#2a2a00" }; const t = { Active:"#4ade80", Injured:"#f87171", Suspended:"#facc15" }; return { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:m[type]||"#222", color:t[type]||"#aaa" }; },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer", color: active ? BRAND.gold : BRAND.textSecondary, background: active ? `${BRAND.crimson}22` : "transparent", borderLeft: active ? `3px solid ${BRAND.crimson}` : "3px solid transparent", fontSize: 14, fontWeight: active ? 600 : 400, transition: "all 0.15s" }),
  input: { background: BRAND.charcoal, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "8px 12px", color: BRAND.textPrimary, fontSize: 14, outline: "none", width: "100%" },
  btn: (variant="primary") => ({ padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none", background: variant==="primary" ? BRAND.crimson : variant==="gold" ? BRAND.gold : BRAND.surfaceLight, color: variant==="gold" ? BRAND.black : BRAND.textPrimary }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BRAND.textSecondary, borderBottom: `1px solid ${BRAND.border}` },
  td: { padding: "12px 14px", fontSize: 13, borderBottom: `1px solid ${BRAND.border}22`, color: BRAND.textPrimary },
};

// ─── Components ───

function Avatar({ initials, size=36, color=BRAND.crimson }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}33`, border:`1.5px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.3, fontWeight:700, color, flexShrink:0 }}>
      {initials}
    </div>
  );
}

function StatCard({ val, label, sub }) {
  return (
    <div style={S.statCard}>
      <div style={S.statVal}>{val}</div>
      <div style={S.statLabel}>{label}</div>
      {sub && <div style={{ fontSize:11, color:BRAND.crimsonLight, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── Dashboard ───
function Dashboard() {
  const wins = GAMES.filter(g=>g.result.includes("W")).length;
  const losses = GAMES.filter(g=>g.result==="L").length;
  const winPct = ((wins/GAMES.length)*100).toFixed(1);
  const avgPts = (GAMES.reduce((a,g)=>a+g.us,0)/GAMES.length).toFixed(1);
  const avgPPG = (PLAYERS.reduce((a,p)=>a+p.pts,0)/PLAYERS.length).toFixed(1);
  const avgRPG = (PLAYERS.reduce((a,p)=>a+p.reb,0)/PLAYERS.length).toFixed(1);
  const avgAPG = (PLAYERS.reduce((a,p)=>a+p.ast,0)/PLAYERS.length).toFixed(1);
  const avgFG = (PLAYERS.reduce((a,p)=>a+p.fg,0)/PLAYERS.length).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:BRAND.textPrimary, margin:0 }}>Dashboard</h1>
        <p style={{ color:BRAND.textSecondary, fontSize:13, margin:"4px 0 0" }}>Season 2025–26 · UAAP Division I</p>
      </div>

      {/* Season Record Banner */}
      <div style={{ background:`linear-gradient(135deg, ${BRAND.crimsonDark}, ${BRAND.charcoal})`, border:`1px solid ${BRAND.crimson}55`, borderRadius:12, padding:"20px 28px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <TitansLogo size={56} />
          <div>
            <div style={{ fontSize:13, color:BRAND.gold, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>Enderun Titans</div>
            <div style={{ fontSize:32, fontWeight:800, color:BRAND.textPrimary, lineHeight:1 }}>{wins}–{losses}</div>
            <div style={{ fontSize:12, color:BRAND.textSecondary }}>Win Pct: {winPct}%</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:32 }}>
          {[["Avg PTS", avgPts], ["Avg PPG/Plyr", avgPPG], ["Practice Att.", "93.2%"]].map(([l,v])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:BRAND.gold }}>{v}</div>
              <div style={{ fontSize:11, color:BRAND.textSecondary }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <StatCard val={PLAYERS.filter(p=>p.status==="Active").length} label="Active Players" />
        <StatCard val={GAMES.length} label="Games Played" />
        <StatCard val={wins} label="Wins" sub={`${winPct}% win rate`} />
        <StatCard val={losses} label="Losses" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        <StatCard val={avgPPG} label="Team PPG" />
        <StatCard val={avgRPG} label="Team RPG" />
        <StatCard val={avgAPG} label="Team APG" />
        <StatCard val={`${avgFG}%`} label="Team FG%" />
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        <div style={S.card}>
          <div style={S.cardTitle}>Win/Loss Score Comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WIN_LOSS} barGap={4}>
              <XAxis dataKey="opp" tick={{ fill:BRAND.textSecondary, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:BRAND.textSecondary, fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, color:BRAND.textPrimary }} />
              <Bar dataKey="us" name="Titans" fill={BRAND.crimson} radius={[3,3,0,0]} />
              <Bar dataKey="them" name="Opponent" fill={BRAND.border} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Practice Attendance Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ATTENDANCE_TREND}>
              <XAxis dataKey="week" tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[80,100]} tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, color:BRAND.textPrimary }} />
              <Line type="monotone" dataKey="rate" stroke={BRAND.gold} strokeWidth={2.5} dot={{ fill:BRAND.gold, r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Games + Announcements */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={S.card}>
          <div style={S.cardTitle}>Recent Games</div>
          {GAMES.slice(-5).reverse().map(g=>(
            <div key={g.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${BRAND.border}22` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:BRAND.textPrimary }}>{g.opp}</div>
                <div style={{ fontSize:11, color:BRAND.textSecondary }}>{g.date} · {g.homeAway}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:14, fontWeight:700, color:BRAND.textPrimary }}>{g.us}–{g.them}</span>
                <span style={S.badge(g.result.includes("W")?"W":"L")}>{g.result}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Announcements</div>
          {ANNOUNCEMENTS.map(a=>(
            <div key={a.id} style={{ padding:"10px 0", borderBottom:`1px solid ${BRAND.border}22` }}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, background:`${BRAND.crimson}33`, color:BRAND.crimsonLight, fontWeight:600, whiteSpace:"nowrap", marginTop:1 }}>{a.type}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:BRAND.textPrimary }}>{a.title}</div>
                  <div style={{ fontSize:11, color:BRAND.textSecondary, marginTop:2 }}>{a.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Roster ───
function Roster() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = PLAYERS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()) || p.pos.includes(search.toUpperCase()));

  if (selected) return <PlayerProfile player={selected} onBack={()=>setSelected(null)} />;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Player Roster</h1>
          <p style={{ color:BRAND.textSecondary, fontSize:13, margin:"4px 0 0" }}>{PLAYERS.length} players · Season 2025–26</p>
        </div>
        <input placeholder="Search player or position…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...S.input, width:240 }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {filtered.map(p=>(
          <div key={p.id} style={{ ...S.card, marginBottom:0, cursor:"pointer", transition:"border-color 0.15s" }} onClick={()=>setSelected(p)}
            onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND.crimson}
            onMouseLeave={e=>e.currentTarget.style.borderColor=BRAND.border}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
              <Avatar initials={p.photo} size={48} />
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:BRAND.textPrimary }}>{p.name}</div>
                <div style={{ fontSize:12, color:BRAND.textSecondary }}>{p.pos} · #{p.jersey} · {p.yr}</div>
              </div>
              <span style={{ ...S.pill(p.status), marginLeft:"auto" }}>{p.status}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[["PTS",p.pts],["REB",p.reb],["AST",p.ast]].map(([l,v])=>(
                <div key={l} style={{ textAlign:"center", background:BRAND.charcoal, borderRadius:8, padding:"8px 4px" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:BRAND.gold }}>{v}</div>
                  <div style={{ fontSize:10, color:BRAND.textSecondary }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerProfile({ player:p, onBack }) {
  const radarData = [
    { sub:"Scoring", val:Math.round(p.pts*4.5) }, { sub:"Rebounding", val:Math.round(p.reb*8) },
    { sub:"Playmaking", val:Math.round(p.ast*9) }, { sub:"Defense", val:Math.round((p.stl+p.blk)*20) },
    { sub:"Efficiency", val:Math.round(p.fg) }, { sub:"FT", val:Math.round(p.ft) },
  ];
  return (
    <div>
      <button onClick={onBack} style={{ ...S.btn("secondary"), marginBottom:24, display:"flex", alignItems:"center", gap:8 }}>← Back to Roster</button>
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>
        <div>
          <div style={{ ...S.card, textAlign:"center" }}>
            <Avatar initials={p.photo} size={80} />
            <div style={{ fontWeight:700, fontSize:18, marginTop:12 }}>{p.name}</div>
            <div style={{ color:BRAND.textSecondary, fontSize:13 }}>{p.pos} · #{p.jersey}</div>
            <span style={{ ...S.pill(p.status), marginTop:8, display:"inline-block" }}>{p.status}</span>
            <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, textAlign:"left" }}>
              {[["Year",p.yr],["Height",p.height],["Weight",p.weight],["GPA",p.gpa]].map(([l,v])=>(
                <div key={l} style={{ background:BRAND.charcoal, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:BRAND.textSecondary, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:BRAND.textPrimary, marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            {[["PTS",p.pts,"per game"],["REB",p.reb,"per game"],["AST",p.ast,"per game"],["FG%",`${p.fg}%`,"field goals"],["3PT%",`${p.threept}%`,"three-point"],["FT%",`${p.ft}%`,"free throws"]].map(([l,v,s])=>(
              <div key={l} style={S.statCard}>
                <div style={S.statVal}>{v}</div>
                <div style={S.statLabel}>{l}</div>
                <div style={{ fontSize:10, color:BRAND.textSecondary, marginTop:2 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Performance Radar</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={BRAND.border} />
                <PolarAngleAxis dataKey="sub" tick={{ fill:BRAND.textSecondary, fontSize:11 }} />
                <Radar dataKey="val" stroke={BRAND.crimson} fill={BRAND.crimson} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[["GP",p.gp],["STL",p.stl],["BLK",p.blk],["TO",p.to]].map(([l,v])=>(
              <div key={l} style={S.statCard}>
                <div style={{ ...S.statVal, fontSize:20 }}>{v}</div>
                <div style={S.statLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Statistics ───
function Statistics() {
  const [sortBy, setSortBy] = useState("pts");
  const sorted = [...PLAYERS].sort((a,b)=>b[sortBy]-a[sortBy]);
  const cols = [
    { key:"pts", label:"PTS" }, { key:"reb", label:"REB" }, { key:"ast", label:"AST" },
    { key:"fg", label:"FG%" }, { key:"threept", label:"3P%" }, { key:"ft", label:"FT%" },
    { key:"stl", label:"STL" }, { key:"blk", label:"BLK" },
  ];

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Statistics</h1>
      <p style={{ color:BRAND.textSecondary, fontSize:13, marginBottom:24 }}>Season 2025–26 averages per game</p>

      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {cols.map(c=>(
          <button key={c.key} onClick={()=>setSortBy(c.key)} style={{ ...S.btn(sortBy===c.key?"primary":"secondary"), padding:"6px 14px", fontSize:12 }}>{c.label}</button>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Individual Player Stats — Sorted by {cols.find(c=>c.key===sortBy)?.label}</div>
        <div style={{ overflowX:"auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Player</th>
                <th style={S.th}>Pos</th>
                <th style={S.th}>GP</th>
                {cols.map(c=><th key={c.key} style={{ ...S.th, color:sortBy===c.key?BRAND.gold:BRAND.textSecondary }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p,i)=>(
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar initials={p.photo} size={28} />
                      <div>
                        <div style={{ fontWeight:600 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:BRAND.textSecondary }}>#{p.jersey}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...S.td, color:BRAND.textSecondary }}>{p.pos}</td>
                  <td style={S.td}>{p.gp}</td>
                  {cols.map(c=>(
                    <td key={c.key} style={{ ...S.td, fontWeight:sortBy===c.key?700:400, color:sortBy===c.key?BRAND.gold:BRAND.textPrimary }}>
                      {c.key.includes("pt")||c.key==="fg"?`${p[c.key]}%`:p[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...S.card, marginTop:20 }}>
        <div style={S.cardTitle}>Points Leaders — Visual</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted.map(p=>({ name:p.name.split(" ")[0], pts:p.pts }))} layout="vertical">
            <XAxis type="number" tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, color:BRAND.textPrimary }} />
            <Bar dataKey="pts" fill={BRAND.crimson} radius={[0,4,4,0]}>
              {sorted.map((_,i)=><Cell key={i} fill={i===0?BRAND.gold:BRAND.crimson} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Games ───
function Games() {
  const [view, setView] = useState("list");
  const wins = GAMES.filter(g=>g.result.includes("W")).length;
  const losses = GAMES.filter(g=>g.result==="L").length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Games</h1>
          <p style={{ color:BRAND.textSecondary, fontSize:13, margin:"4px 0 0" }}>Season record: {wins}W – {losses}L</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setView("list")} style={S.btn(view==="list"?"primary":"secondary")}>List</button>
          <button onClick={()=>setView("chart")} style={S.btn(view==="chart"?"primary":"secondary")}>Chart</button>
        </div>
      </div>

      {view==="list" ? (
        <div style={S.card}>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Opponent</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Venue</th>
              <th style={S.th}>H/A</th>
              <th style={S.th}>Score</th>
              <th style={S.th}>Result</th>
            </tr></thead>
            <tbody>
              {GAMES.map((g,i)=>(
                <tr key={g.id}>
                  <td style={{ ...S.td, color:BRAND.textSecondary }}>{i+1}</td>
                  <td style={{ ...S.td, fontWeight:600 }}>{g.opp}</td>
                  <td style={{ ...S.td, color:BRAND.textSecondary }}>{g.date}</td>
                  <td style={{ ...S.td, color:BRAND.textSecondary, fontSize:12 }}>{g.venue}</td>
                  <td style={S.td}>
                    <span style={{ padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:600, background:g.homeAway==="Home"?`${BRAND.crimson}33`:`${BRAND.border}`, color:g.homeAway==="Home"?BRAND.crimsonLight:BRAND.textSecondary }}>{g.homeAway}</span>
                  </td>
                  <td style={{ ...S.td, fontWeight:700, fontSize:15 }}>{g.us} – {g.them}</td>
                  <td style={S.td}><span style={S.badge(g.result.includes("W")?"W":"L")}>{g.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={S.card}>
            <div style={S.cardTitle}>Score by Game</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={WIN_LOSS}>
                <XAxis dataKey="game" tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:BRAND.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, color:BRAND.textPrimary }} />
                <Bar dataKey="us" name="Titans" fill={BRAND.crimson} radius={[3,3,0,0]} />
                <Bar dataKey="them" name="Opponent" fill="#333" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Win/Loss Breakdown</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={[{name:"Wins",value:wins},{name:"Losses",value:losses}]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                  <Cell fill={BRAND.crimson} />
                  <Cell fill={BRAND.border} />
                </Pie>
                <Tooltip contentStyle={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign:"center", marginTop:-10 }}>
              <span style={{ fontSize:32, fontWeight:800, color:BRAND.gold }}>{wins}–{losses}</span>
              <div style={{ fontSize:12, color:BRAND.textSecondary }}>Season Record</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Attendance ───
function Attendance() {
  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Attendance</h1>
      <p style={{ color:BRAND.textSecondary, fontSize:13, marginBottom:24 }}>Practice & game attendance records</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <StatCard val="93.2%" label="Practice Rate" />
        <StatCard val="97.5%" label="Game Attendance" />
        <StatCard val="4" label="Late Arrivals" />
        <StatCard val="7" label="Excused Absences" />
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Recent Practice Sessions</div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Date</th>
            <th style={S.th}>Type</th>
            <th style={S.th}>Time</th>
            <th style={S.th}>Location</th>
            <th style={S.th}>Present</th>
            <th style={S.th}>Rate</th>
          </tr></thead>
          <tbody>
            {PRACTICES.map(p=>(
              <tr key={p.id}>
                <td style={S.td}>{p.date}</td>
                <td style={{ ...S.td, fontWeight:600 }}>{p.type}</td>
                <td style={{ ...S.td, color:BRAND.textSecondary }}>{p.time}</td>
                <td style={{ ...S.td, color:BRAND.textSecondary }}>{p.location}</td>
                <td style={S.td}>{p.attendance}/{p.total}</td>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:6, background:BRAND.border, borderRadius:3 }}>
                      <div style={{ width:`${(p.attendance/p.total)*100}%`, height:"100%", background:p.attendance===p.total?BRAND.gold:BRAND.crimson, borderRadius:3 }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:p.attendance===p.total?BRAND.gold:BRAND.textPrimary, minWidth:36 }}>{Math.round((p.attendance/p.total)*100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Player Attendance Summary</div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Player</th>
            <th style={S.th}>Present</th>
            <th style={S.th}>Late</th>
            <th style={S.th}>Excused</th>
            <th style={S.th}>Absent</th>
            <th style={S.th}>Rate</th>
          </tr></thead>
          <tbody>
            {PLAYERS.map(p=>{
              const present = Math.floor(Math.random()*2+14);
              const late = Math.floor(Math.random()*2);
              const excused = Math.floor(Math.random()*2);
              const rate = Math.round(((present)/(present+late+excused+1))*100);
              return (
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Avatar initials={p.photo} size={26} />
                      <span style={{ fontWeight:600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ ...S.td, color:"#4ade80" }}>{present}</td>
                  <td style={{ ...S.td, color:BRAND.gold }}>{late}</td>
                  <td style={{ ...S.td, color:BRAND.textSecondary }}>{excused}</td>
                  <td style={{ ...S.td, color:"#f87171" }}>1</td>
                  <td style={{ ...S.td, fontWeight:700, color:rate>90?BRAND.gold:BRAND.textPrimary }}>{rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Evaluations ───
function Evaluations() {
  const [sel, setSel] = useState(PLAYERS[0]);
  const cats = [
    { cat:"Physical", items:["Speed","Agility","Strength","Endurance"] },
    { cat:"Skills", items:["Shooting","Ball Handling","Passing","Defense","Rebounding"] },
    { cat:"Mental", items:["Leadership","Communication","Discipline","Basketball IQ"] },
  ];
  const scores = {};
  [...cats].forEach(c=>c.items.forEach(item=>{ scores[item] = Math.floor(Math.random()*3+6); }));

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Player Evaluations</h1>
      <p style={{ color:BRAND.textSecondary, fontSize:13, marginBottom:24 }}>Scoring scale: 1–10</p>

      <div style={{ display:"flex", gap:24 }}>
        <div style={{ width:220, flexShrink:0 }}>
          <div style={S.card}>
            <div style={S.cardTitle}>Select Player</div>
            {PLAYERS.map(p=>(
              <div key={p.id} onClick={()=>setSel(p)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:sel.id===p.id?`${BRAND.crimson}22`:"transparent", marginBottom:4 }}>
                <Avatar initials={p.photo} size={28} color={sel.id===p.id?BRAND.crimson:BRAND.textSecondary} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:sel.id===p.id?BRAND.textPrimary:BRAND.textSecondary }}>{p.name.split(" ")[0]}</div>
                  <div style={{ fontSize:11, color:BRAND.textSecondary }}>{p.pos}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={S.card}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
              <Avatar initials={sel.photo} size={48} />
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{sel.name}</div>
                <div style={{ fontSize:12, color:BRAND.textSecondary }}>{sel.pos} · #{sel.jersey} · {sel.yr}</div>
              </div>
              <button style={{ ...S.btn("gold"), marginLeft:"auto" }}>Save Evaluation</button>
            </div>
            {cats.map(c=>(
              <div key={c.cat} style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:BRAND.crimsonLight, marginBottom:12 }}>{c.cat}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {c.items.map(item=>{
                    const score = scores[item];
                    return (
                      <div key={item} style={{ background:BRAND.charcoal, borderRadius:8, padding:"10px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:13 }}>{item}</span>
                          <span style={{ fontSize:14, fontWeight:700, color:score>=8?BRAND.gold:score>=6?BRAND.textPrimary:"#f87171" }}>{score}/10</span>
                        </div>
                        <div style={{ height:4, background:BRAND.border, borderRadius:2 }}>
                          <div style={{ width:`${score*10}%`, height:"100%", background:score>=8?BRAND.gold:score>=6?BRAND.crimson:"#ef4444", borderRadius:2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Announcements ───
function Announcements() {
  const colors = { Practice:"#1e3a5f", Academic:"#1a3320", Social:"#2d1f00", Schedule:"#3d1515" };
  const tcolors = { Practice:"#60a5fa", Academic:"#4ade80", Social:"#fbbf24", Schedule:"#f87171" };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Announcements</h1>
          <p style={{ color:BRAND.textSecondary, fontSize:13, margin:"4px 0 0" }}>Team communications & notices</p>
        </div>
        <button style={S.btn("primary")}>+ New Announcement</button>
      </div>
      <div style={{ display:"grid", gap:14 }}>
        {ANNOUNCEMENTS.map(a=>(
          <div key={a.id} style={{ ...S.card, marginBottom:0, borderLeft:`3px solid ${tcolors[a.type]||BRAND.crimson}` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:700, background:colors[a.type]||BRAND.charcoal, color:tcolors[a.type]||BRAND.textPrimary }}>{a.type}</span>
                  <span style={{ fontSize:12, color:BRAND.textSecondary }}>{a.date}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{a.title}</div>
                <div style={{ fontSize:13, color:BRAND.textSecondary, lineHeight:1.6 }}>{a.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Schedule ───
function Schedule() {
  const upcoming = [
    { date:"2025-11-15", time:"5:00 PM", type:"Game", opp:"San Beda Red Lions", venue:"Enderun Gym" },
    { date:"2025-11-18", time:"6:00 AM", type:"Practice", opp:"Conditioning", venue:"Enderun Gym" },
    { date:"2025-11-22", time:"3:00 PM", type:"Game", opp:"Ateneo Blue Eagles", venue:"Araneta Coliseum" },
    { date:"2025-11-25", time:"6:00 AM", type:"Practice", opp:"Film Session", venue:"Film Room" },
    { date:"2025-11-29", time:"4:00 PM", type:"Game", opp:"La Salle Falcons", venue:"Enderun Gym" },
    { date:"2025-12-03", time:"1:00 PM", type:"Game", opp:"Ateneo Blue Eagles", venue:"Araneta Coliseum" },
  ];
  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Schedule</h1>
      <p style={{ color:BRAND.textSecondary, fontSize:13, marginBottom:24 }}>Upcoming games & practice sessions</p>
      <div style={{ display:"grid", gap:12 }}>
        {upcoming.map((ev,i)=>(
          <div key={i} style={{ ...S.card, marginBottom:0, display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:60, textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:11, color:BRAND.textSecondary, textTransform:"uppercase", letterSpacing:"0.06em" }}>{new Date(ev.date).toLocaleString("en",{month:"short"})}</div>
              <div style={{ fontSize:28, fontWeight:800, color:ev.type==="Game"?BRAND.gold:BRAND.textPrimary, lineHeight:1 }}>{new Date(ev.date).getDate()}</div>
            </div>
            <div style={{ width:1, height:48, background:ev.type==="Game"?BRAND.crimson:BRAND.border, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700, background:ev.type==="Game"?`${BRAND.crimson}33`:`${BRAND.border}55`, color:ev.type==="Game"?BRAND.crimsonLight:BRAND.textSecondary }}>{ev.type}</span>
                <span style={{ fontSize:12, color:BRAND.textSecondary }}>{ev.time}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:15 }}>{ev.opp}</div>
              <div style={{ fontSize:12, color:BRAND.textSecondary }}>{ev.venue}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Login Screen ───
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("Head Coach");
  const roles = ["Administrator","Head Coach","Assistant Coach","Team Manager","Player"];

  return (
    <div style={{ background:BRAND.black, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ width:400, textAlign:"center" }}>
        <TitansLogo size={100} />
        <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:BRAND.gold, marginTop:16 }}>Enderun Men's College Basketball</div>
        <h1 style={{ fontSize:24, fontWeight:800, color:BRAND.textPrimary, margin:"8px 0 4px" }}>Management System</h1>
        <p style={{ fontSize:13, color:BRAND.textSecondary, marginBottom:40 }}>Season 2025–26</p>

        <div style={{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:16, padding:32 }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, color:BRAND.textSecondary, marginBottom:6, textAlign:"left" }}>EMAIL</label>
            <input placeholder="coach@enderun.edu.ph" style={{ ...S.input }} defaultValue="coach@enderun.edu.ph" />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, color:BRAND.textSecondary, marginBottom:6, textAlign:"left" }}>PASSWORD</label>
            <input type="password" placeholder="••••••••" style={S.input} defaultValue="password" />
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:12, color:BRAND.textSecondary, marginBottom:6, textAlign:"left" }}>ROLE (Demo)</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{ ...S.input }}>
              {roles.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={onLogin} style={{ ...S.btn("primary"), width:"100%", padding:"12px", fontSize:15, borderRadius:10 }}>Sign In as {role}</button>
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:24 }}>
          {["Supabase Auth","Row-Level Security","Role-Based Access"].map(t=>(
            <span key={t} style={{ fontSize:10, color:BRAND.textSecondary, letterSpacing:"0.04em" }}>✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ───
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)} />;

  const pages = { dashboard:<Dashboard/>, roster:<Roster/>, stats:<Statistics/>, games:<Games/>, attendance:<Attendance/>, evaluations:<Evaluations/>, announcements:<Announcements/>, schedule:<Schedule/> };

  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <TitansLogo size={36} />
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:BRAND.textPrimary, lineHeight:1 }}>Enderun Titans</div>
            <div style={{ fontSize:10, color:BRAND.textSecondary, letterSpacing:"0.08em" }}>BASKETBALL MANAGEMENT</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:12, color:BRAND.textSecondary }}>Season 2025–26</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Avatar initials="HC" size={32} color={BRAND.gold} />
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:BRAND.textPrimary }}>Head Coach</div>
              <div style={{ fontSize:10, color:BRAND.textSecondary }}>Enderun Titans</div>
            </div>
          </div>
          <button onClick={()=>setLoggedIn(false)} style={{ ...S.btn("secondary"), padding:"6px 14px", fontSize:12 }}>Sign Out</button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1 }}>
        {/* Sidebar */}
        <nav style={S.nav}>
          <div style={{ padding:"8px 20px 16px", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:BRAND.textSecondary }}>Navigation</div>
          {NAV_ITEMS.map(item=>(
            <div key={item.id} onClick={()=>setPage(item.id)} style={S.navItem(page===item.id)}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ padding:"20px 20px 8px", marginTop:12, borderTop:`1px solid ${BRAND.border}`, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:BRAND.textSecondary }}>Quick Stats</div>
          <div style={{ padding:"0 16px" }}>
            {[["Record","6W – 2L"],["PPG","74.9"],["Players","8 Active"]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 4px", borderBottom:`1px solid ${BRAND.border}22` }}>
                <span style={{ fontSize:11, color:BRAND.textSecondary }}>{l}</span>
                <span style={{ fontSize:11, fontWeight:700, color:BRAND.gold }}>{v}</span>
              </div>
            ))}
          </div>
        </nav>

        {/* Main */}
        <main style={S.main}>{pages[page]}</main>
      </div>
    </div>
  );
}
