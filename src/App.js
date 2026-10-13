import React, { useState } from "react";
import Playbook from "./Playbook";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const BRAND = {
  crimson:"#9B1C1C", crimsonDark:"#6B0F0F", crimsonLight:"#C53030",
  gold:"#D4A017", goldLight:"#F0C040", black:"#0D0D0D",
  charcoal:"#1A1A1A", surfaceLight:"#1E1E1E", border:"#2A2A2A",
  textPrimary:"#F0E6D0", textSecondary:"#9A8A70",
};

// ── ROLES ──
const ROLES = {
  HEAD_COACH: "Head Coach",
  TEAM_MANAGER: "Team Manager",
  PLAYER: "Player",
  ASSISTANT: "Assistant Coach",
};

const isAdmin = (role) => role === ROLES.HEAD_COACH || role === ROLES.TEAM_MANAGER;

const INIT_PLAYERS = [
  { id:1, name:"Miekho Joush M. Natinga", jersey:1, pos:"PG", yr:"1st Year", height:"5'10\"", weight:"78 kg", dob:"2006", birthplace:"Malaybalay City, Bukidnon", nationality:"Filipino", course:"BS IHM", phone:"09944829504", email:"miekho082106@gmail.com", status:"Active", pts:8.4, reb:3.1, ast:2.9, fg:38.2, threept:31.0, ft:74.0, gp:10, stl:1.2, blk:0.2, to:1.8, photo:"MN" },
  { id:2, name:"Chance Barnard", jersey:2, pos:"PF", yr:"Grade 11", height:"6'5\"", weight:"94 kg", dob:"06/23/2008", birthplace:"Abidjan", nationality:"Ivorian", course:"ABM", phone:"09151375112", email:"Chancebarnard55@gmail.com", status:"Active", pts:14.2, reb:8.7, ast:1.4, fg:51.3, threept:22.0, ft:68.5, gp:10, stl:0.8, blk:2.1, to:1.6, photo:"CB" },
  { id:3, name:"Juan Luis Alessandro F. Aguilar", jersey:3, pos:"PF", yr:"Grade 12", height:"6'6\"", weight:"90 kg", dob:"8/31/2008", birthplace:"Angeles City, Pampanga", nationality:"Filipino", course:"Grade 12 ABM", phone:"09190758364", email:"jlaguilarftw@gmail.com", status:"Active", pts:12.1, reb:7.4, ast:1.8, fg:48.9, threept:19.5, ft:71.2, gp:10, stl:0.6, blk:1.8, to:2.0, photo:"JA" },
  { id:4, name:"Albert Clifford Jay Libago", jersey:4, pos:"C", yr:"4th Year", height:"6'5\"", weight:"100 kg", dob:"", birthplace:"Poblacion Mambajao, Camiguin", nationality:"Filipino", course:"BS IHM HA", phone:"09565509436", email:"albert.libago@enderuncolleges.com", status:"Active", pts:10.8, reb:9.2, ast:1.0, fg:55.4, threept:0.0, ft:63.1, gp:10, stl:0.5, blk:2.8, to:1.5, photo:"AL" },
  { id:5, name:"Byron Legaspi", jersey:5, pos:"SG", yr:"AY 2026-2027", height:"5'11\"", weight:"82 kg", dob:"October 6, 2006", birthplace:"Muntinlupa", nationality:"Filipino", course:"BS Entrepreneurship", phone:"09604564917", email:"justin.legaspi@enderuncolleges.com", status:"Active", pts:9.3, reb:3.5, ast:3.2, fg:40.1, threept:34.2, ft:77.8, gp:10, stl:1.4, blk:0.3, to:2.1, photo:"BL" },
  { id:6, name:"Carlos Jake Villava-Cua Garcia", jersey:6, pos:"SF", yr:"Sophomore", height:"6'2\"", weight:"81 kg", dob:"December 3, 2005", birthplace:"United Kingdom", nationality:"Filipino/British", course:"BSIHM HA", phone:"09295426898", email:"carlocio8912@gmail.com", status:"Active", pts:11.5, reb:5.1, ast:2.4, fg:43.7, threept:30.5, ft:75.3, gp:10, stl:1.1, blk:0.7, to:1.9, photo:"CG" },
  { id:7, name:"Cyrus Neal Bernardo Ferrer", jersey:7, pos:"PG", yr:"3rd Year", height:"5'11\"", weight:"81 kg", dob:"February 8, 2003", birthplace:"Mandaluyong City", nationality:"Filipino", course:"BSBA Marketing Management", phone:"09151788653", email:"cyrusnealferrer0088@gmail.com", status:"Active", pts:13.7, reb:3.8, ast:5.9, fg:41.2, threept:35.8, ft:80.4, gp:10, stl:1.7, blk:0.2, to:2.3, photo:"CF" },
  { id:8, name:"Aeron Lloyd F. Luague", jersey:8, pos:"PG", yr:"1st Year", height:"6'1\"", weight:"78 kg", dob:"February 1, 2008", birthplace:"Davao City", nationality:"Filipino", course:"BS IHM", phone:"09709117698", email:"aeron.luague@enderuncolleges.com", status:"Active", pts:7.6, reb:2.9, ast:4.1, fg:37.5, threept:29.8, ft:72.1, gp:10, stl:1.3, blk:0.1, to:2.5, photo:"AL" },
  { id:9, name:"Zachary Angelo G. Dionela", jersey:9, pos:"SF", yr:"3rd Year", height:"6'3\"", weight:"85 kg", dob:"03/15/2005", birthplace:"Bacolod City", nationality:"Filipino", course:"BSBA MM", phone:"09456051234", email:"zachary.dionela@enderuncolleges.com", status:"Active", pts:10.2, reb:5.8, ast:2.1, fg:44.6, threept:32.1, ft:76.9, gp:10, stl:1.0, blk:0.9, to:1.7, photo:"ZD" },
  { id:10, name:"Frank Nero Rubang", jersey:10, pos:"PF", yr:"2nd Year", height:"6'2\"", weight:"90 kg", dob:"October 22, 2006", birthplace:"Rosario, Cervantes, Ilocos Sur", nationality:"Filipino", course:"BSIHM", phone:"09513485713", email:"frankneronero60@gmail.com", status:"Active", pts:9.0, reb:6.3, ast:1.5, fg:46.2, threept:20.4, ft:68.7, gp:10, stl:0.7, blk:1.3, to:1.8, photo:"FR" },
  { id:11, name:"Gabe Howe", jersey:11, pos:"SG", yr:"1st Year", height:"5'10\"", weight:"82 kg", dob:"03/26/2003", birthplace:"Las Vegas, NV", nationality:"Filipino", course:"BS IHM", phone:"+1 702-683-2407", email:"Gabe_Howe@outlook.com", status:"Active", pts:11.8, reb:3.4, ast:2.7, fg:42.3, threept:37.5, ft:81.2, gp:10, stl:1.5, blk:0.4, to:1.6, photo:"GH" },
];

const INIT_PRACTICES = [
  { id:1, date:"2026-10-14", time:"6:00 AM", type:"Conditioning", location:"Enderun Gym", objectives:"Improve cardio and agility", notes:"Full team required", attendance:[] },
  { id:2, date:"2026-10-16", time:"6:00 AM", type:"Skill Work", location:"Enderun Gym", objectives:"Shooting drills and ball handling", notes:"", attendance:[] },
  { id:3, date:"2026-10-18", time:"4:00 PM", type:"Film Session", location:"Film Room", objectives:"Review last game footage", notes:"Bring notebooks", attendance:[] },
];

const INIT_LEAGUE = [
  { id:1, date:"2026-10-20", time:"5:00 PM", opp:"La Salle Falcons", venue:"Enderun Gym", homeAway:"Home", type:"League", us:null, them:null },
  { id:2, date:"2026-10-27", time:"3:00 PM", opp:"Ateneo Blue Eagles", venue:"Araneta Coliseum", homeAway:"Away", type:"League", us:null, them:null },
  { id:3, date:"2026-11-03", time:"5:00 PM", opp:"FEU Tamaraws", venue:"Enderun Gym", homeAway:"Home", type:"League", us:null, them:null },
  { id:4, date:"2026-11-10", time:"2:00 PM", opp:"UST Growling Tigers", venue:"FilOil Arena", homeAway:"Away", type:"League", us:null, them:null },
  { id:5, date:"2026-11-17", time:"5:00 PM", opp:"UP Fighting Maroons", venue:"Enderun Gym", homeAway:"Home", type:"League", us:null, them:null },
];

const INIT_HEALTH = [
  { id:1, playerId:6, playerName:"Carlos Jake Villava-Cua Garcia", injury:"Left ankle sprain", severity:"Moderate", date:"2026-10-05", returnDate:"2026-10-25", status:"Recovering", notes:"No contact drills" },
];

const ADMIN_NAV = [
  { id:"dashboard", label:"Dashboard", icon:"🏠" },
  { id:"roster", label:"Roster", icon:"👥" },
  { id:"stats", label:"Statistics", icon:"📊" },
  { id:"attendance", label:"Attendance", icon:"✅" },
  { id:"practice", label:"Practice", icon:"🏋️" },
  { id:"league", label:"League", icon:"🏆" },
  { id:"health", label:"Health Report", icon:"🏥" },
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"playbook", label:"Playbook", icon:"📖" },
];

const PLAYER_NAV = [
  { id:"myprofile", label:"My Profile", icon:"👤" },
  { id:"mystats", label:"My Stats", icon:"📊" },
  { id:"checkin", label:"Check-In", icon:"✅" },
  { id:"healthreport", label:"Report Health", icon:"🏥" },
  { id:"schedule", label:"Schedule", icon:"📅" },
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"playbook", label:"Playbook", icon:"📖" },
];

const S = {
  app:{ background:BRAND.black, minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", color:BRAND.textPrimary, display:"flex", flexDirection:"column" },
  header:{ background:BRAND.charcoal, borderBottom:`1px solid ${BRAND.border}`, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, position:"sticky", top:0, zIndex:50 },
  nav:{ background:BRAND.charcoal, width:210, minHeight:"calc(100vh - 60px)", borderRight:`1px solid ${BRAND.border}`, padding:"12px 0", flexShrink:0 },
  main:{ flex:1, padding:"24px 28px", overflowY:"auto", background:BRAND.black },
  card:{ background:BRAND.surfaceLight, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"18px 22px", marginBottom:18 },
  cardTitle:{ fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:BRAND.textSecondary, marginBottom:14 },
  statCard:{ background:BRAND.surfaceLight, border:`1px solid ${BRAND.border}`, borderRadius:10, padding:"16px 18px", textAlign:"center" },
  statVal:{ fontSize:26, fontWeight:700, color:BRAND.gold, lineHeight:1.1 },
  statLabel:{ fontSize:11, color:BRAND.textSecondary, marginTop:4, letterSpacing:"0.05em" },
  navItem:(a)=>({ display:"flex", alignItems:"center", gap:10, padding:"9px 18px", cursor:"pointer", color:a?BRAND.gold:BRAND.textSecondary, background:a?`${BRAND.crimson}22`:"transparent", borderLeft:a?`3px solid ${BRAND.crimson}`:"3px solid transparent", fontSize:13, fontWeight:a?600:400 }),
  input:{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, padding:"8px 12px", color:BRAND.textPrimary, fontSize:13, outline:"none", width:"100%" },
  btn:(v="primary")=>({ padding:"8px 18px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, border:"none", background:v==="primary"?BRAND.crimson:v==="gold"?BRAND.gold:v==="danger"?"#7f1d1d":v==="green"?"#14532d":BRAND.surfaceLight, color:v==="gold"?BRAND.black:BRAND.textPrimary }),
  table:{ width:"100%", borderCollapse:"collapse" },
  th:{ padding:"9px 12px", textAlign:"left", fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:BRAND.textSecondary, borderBottom:`1px solid ${BRAND.border}` },
  td:{ padding:"11px 12px", fontSize:13, borderBottom:`1px solid ${BRAND.border}22`, color:BRAND.textPrimary },
  pill:(t)=>{ const m={Active:"#134a2e",Injured:"#4a1313",Suspended:"#2a2a00",Recovering:"#2a1f00",Monitoring:"#1a2a40",Cleared:"#134a2e"}; const c={Active:"#4ade80",Injured:"#f87171",Suspended:"#facc15",Recovering:"#fb923c",Monitoring:"#60a5fa",Cleared:"#4ade80"}; return { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:m[t]||"#222", color:c[t]||"#aaa" }; },
};

const TitansLogo = ({size=48})=>(
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" fill={BRAND.crimson} opacity="0.15"/>
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" stroke={BRAND.gold} strokeWidth="1.5" fill="none"/>
    <text x="50" y="52" textAnchor="middle" fill={BRAND.gold} fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="3">TITANS</text>
    <text x="50" y="66" textAnchor="middle" fill={BRAND.textSecondary} fontSize="6" fontFamily="serif" letterSpacing="2">ENDERUN</text>
    <circle cx="50" cy="50" r="15" stroke={BRAND.crimson} strokeWidth="0.5" fill="none"/>
  </svg>
);

const Avatar=({initials,size=36,color=BRAND.crimson})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:`${color}33`,border:`1.5px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:700,color,flexShrink:0}}>{initials}</div>
);

const Modal=({title,onClose,children})=>(
  <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:14,padding:28,width:520,maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:16}}>{title}</div>
        <button onClick={onClose} style={{...S.btn("secondary"),padding:"4px 12px"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const RoleBadge=({role})=>{
  const colors={[ROLES.HEAD_COACH]:BRAND.gold,[ROLES.TEAM_MANAGER]:BRAND.crimsonLight,[ROLES.PLAYER]:"#60a5fa",[ROLES.ASSISTANT]:"#a78bfa"};
  return <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:`${colors[role]}22`,color:colors[role]}}>{role}</span>;
};

const BLANK_PLAYER={name:"",jersey:"",pos:"PG",yr:"",height:"",weight:"",dob:"",birthplace:"",nationality:"Filipino",course:"",phone:"",email:"",status:"Active",pts:0,reb:0,ast:0,fg:0,threept:0,ft:0,gp:0,stl:0,blk:0,to:0};

// ═══════════════════════════════════════
// ADMIN VIEWS
// ═══════════════════════════════════════

function Roster({players,setPlayers}){
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(BLANK_PLAYER);

  const filtered=players.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.pos.includes(search.toUpperCase()));
  const openAdd=()=>{ setForm(BLANK_PLAYER); setEditing(null); setShowForm(true); };
  const openEdit=(p)=>{ setForm({...p}); setEditing(p.id); setShowForm(true); };
  const savePlayer=()=>{
    if(!form.name.trim()) return;
    const photo=form.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    if(editing){ setPlayers(ps=>ps.map(p=>p.id===editing?{...form,id:editing,photo}:p)); }
    else{ setPlayers(ps=>[...ps,{...form,id:Date.now(),photo}]); }
    setShowForm(false);
  };
  const deletePlayer=(id)=>{ if(window.confirm("Remove this player from the roster?")) setPlayers(ps=>ps.filter(p=>p.id!==id)); };

  const F=({label,field,type="text",opts})=>(
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
      {opts?<select value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      :<input type={type} value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:type==="number"?parseFloat(e.target.value)||0:e.target.value}))} style={S.input}/>}
    </div>
  );

  if(selected) return <AdminPlayerProfile player={selected} onBack={()=>setSelected(null)} onEdit={()=>{openEdit(selected);setSelected(null);}}/>;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Player Roster</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>{players.length} players · Season 2026–27</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input,width:200}}/>
          <button onClick={openAdd} style={S.btn("gold")}>+ Add Player</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
        {filtered.map(p=>(
          <div key={p.id} style={{...S.card,marginBottom:0,cursor:"pointer"}}
            onClick={()=>setSelected(p)}
            onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND.crimson}
            onMouseLeave={e=>e.currentTarget.style.borderColor=BRAND.border}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <Avatar initials={p.photo} size={44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                <div style={{fontSize:11,color:BRAND.textSecondary}}>{p.pos} · #{p.jersey} · {p.yr}</div>
              </div>
              <span style={S.pill(p.status)}>{p.status}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              {[["PTS",p.pts],["REB",p.reb],["AST",p.ast]].map(([l,v])=>(
                <div key={l} style={{textAlign:"center",background:BRAND.charcoal,borderRadius:6,padding:"6px 4px"}}>
                  <div style={{fontSize:15,fontWeight:700,color:BRAND.gold}}>{v}</div>
                  <div style={{fontSize:10,color:BRAND.textSecondary}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>openEdit(p)} style={{...S.btn("secondary"),flex:1,padding:"6px",fontSize:12}}>✏️ Edit</button>
              <button onClick={()=>deletePlayer(p.id)} style={{...S.btn("danger"),flex:1,padding:"6px",fontSize:12}}>🗑️ Remove</button>
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <Modal title={editing?"Edit Player":"Add New Player"} onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}><F label="Full Name *" field="name"/></div>
            <F label="Jersey #" field="jersey" type="number"/>
            <F label="Position" field="pos" opts={["PG","SG","SF","PF","C"]}/>
            <F label="Year / Grade" field="yr"/>
            <F label="Status" field="status" opts={["Active","Injured","Suspended"]}/>
            <F label="Height" field="height"/>
            <F label="Weight" field="weight"/>
            <F label="Date of Birth" field="dob"/>
            <F label="Birthplace" field="birthplace"/>
            <F label="Nationality" field="nationality"/>
            <div style={{gridColumn:"1/-1"}}><F label="Course / Program" field="course"/></div>
            <F label="Phone" field="phone"/>
            <div style={{gridColumn:"1/-1"}}><F label="Email" field="email"/></div>
            <F label="GP" field="gp" type="number"/>
            <F label="PPG" field="pts" type="number"/>
            <F label="RPG" field="reb" type="number"/>
            <F label="APG" field="ast" type="number"/>
            <F label="FG%" field="fg" type="number"/>
            <F label="3PT%" field="threept" type="number"/>
            <F label="FT%" field="ft" type="number"/>
            <F label="STL" field="stl" type="number"/>
            <F label="BLK" field="blk" type="number"/>
            <F label="TO" field="to" type="number"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={savePlayer} style={S.btn("gold")}>{editing?"Save Changes":"Add Player"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminPlayerProfile({player:p,onBack,onEdit}){
  const radar=[
    {sub:"Scoring",val:Math.min(100,Math.round(p.pts*4.5))},{sub:"Rebounding",val:Math.min(100,Math.round(p.reb*8))},
    {sub:"Playmaking",val:Math.min(100,Math.round(p.ast*9))},{sub:"Defense",val:Math.min(100,Math.round((p.stl+p.blk)*20))},
    {sub:"FG%",val:Math.round(p.fg)},{sub:"FT%",val:Math.round(p.ft)},
  ];
  return(
    <div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={S.btn("secondary")}>← Back to Roster</button>
        <button onClick={onEdit} style={S.btn("gold")}>✏️ Edit Profile</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
        <div style={S.card}>
          <div style={{textAlign:"center"}}>
            <Avatar initials={p.photo} size={72}/>
            <div style={{fontWeight:700,fontSize:17,marginTop:10}}>{p.name}</div>
            <div style={{color:BRAND.textSecondary,fontSize:12}}>#{p.jersey} · {p.pos}</div>
            <span style={{...S.pill(p.status),marginTop:8,display:"inline-block"}}>{p.status}</span>
          </div>
          <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[["Year",p.yr],["Height",p.height],["Weight",p.weight],["Nationality",p.nationality]].map(([l,v])=>v?(
              <div key={l} style={{background:BRAND.charcoal,borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{v}</div>
              </div>
            ):null)}
            <div style={{gridColumn:"1/-1",background:BRAND.charcoal,borderRadius:7,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase"}}>Course</div>
              <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{p.course}</div>
            </div>
            <div style={{gridColumn:"1/-1",background:BRAND.charcoal,borderRadius:7,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase"}}>Birthplace</div>
              <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{p.birthplace}</div>
            </div>
          </div>
          <div style={{marginTop:10,background:BRAND.charcoal,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase",marginBottom:6}}>Contact</div>
            <div style={{fontSize:12}}>📞 {p.phone}</div>
            <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:4,wordBreak:"break-all"}}>✉️ {p.email}</div>
          </div>
        </div>
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["PTS",p.pts,"ppg"],["REB",p.reb,"rpg"],["AST",p.ast,"apg"],["FG%",`${p.fg}%`,""],["3PT%",`${p.threept}%`,""],["FT%",`${p.ft}%`,""]].map(([l,v,s])=>(
              <div key={l} style={S.statCard}>
                <div style={S.statVal}>{v}</div>
                <div style={S.statLabel}>{l} {s}</div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Performance Radar</div>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={radar}>
                <PolarGrid stroke={BRAND.border}/>
                <PolarAngleAxis dataKey="sub" tick={{fill:BRAND.textSecondary,fontSize:11}}/>
                <Radar dataKey="val" stroke={BRAND.crimson} fill={BRAND.crimson} fillOpacity={0.3}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[["GP",p.gp],["STL",p.stl],["BLK",p.blk],["TO",p.to]].map(([l,v])=>(
              <div key={l} style={S.statCard}><div style={{...S.statVal,fontSize:20}}>{v}</div><div style={S.statLabel}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Statistics({players}){
  const [sort,setSort]=useState("pts");
  const sorted=[...players].sort((a,b)=>b[sort]-a[sort]);
  const cols=[{k:"pts",l:"PTS"},{k:"reb",l:"REB"},{k:"ast",l:"AST"},{k:"fg",l:"FG%"},{k:"threept",l:"3PT%"},{k:"ft",l:"FT%"},{k:"stl",l:"STL"},{k:"blk",l:"BLK"}];
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Statistics</h1>
      <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
        {cols.map(c=><button key={c.k} onClick={()=>setSort(c.k)} style={{...S.btn(sort===c.k?"primary":"secondary"),padding:"5px 13px",fontSize:12}}>{c.l}</button>)}
      </div>
      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Player</th><th style={S.th}>Pos</th><th style={S.th}>GP</th>
              {cols.map(c=><th key={c.k} style={{...S.th,color:sort===c.k?BRAND.gold:BRAND.textSecondary}}>{c.l}</th>)}
            </tr></thead>
            <tbody>{sorted.map(p=>(
              <tr key={p.id}>
                <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={p.photo} size={26}/><span style={{fontWeight:600}}>{p.name}</span></div></td>
                <td style={{...S.td,color:BRAND.textSecondary}}>{p.pos}</td>
                <td style={S.td}>{p.gp}</td>
                {cols.map(c=>(
                  <td key={c.k} style={{...S.td,fontWeight:sort===c.k?700:400,color:sort===c.k?BRAND.gold:BRAND.textPrimary}}>
                    {c.k.includes("t")||c.k==="fg"?`${p[c.k]}%`:p[c.k]}
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Points Leaders</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[...players].sort((a,b)=>b.pts-a.pts).map(p=>({name:p.name.split(" ").pop(),pts:p.pts}))} layout="vertical">
            <XAxis type="number" tick={{fill:BRAND.textSecondary,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis type="category" dataKey="name" tick={{fill:BRAND.textSecondary,fontSize:11}} axisLine={false} tickLine={false} width={80}/>
            <Tooltip contentStyle={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:8,color:BRAND.textPrimary}}/>
            <Bar dataKey="pts" fill={BRAND.crimson} radius={[0,4,4,0]}>
              {[...players].sort((a,b)=>b.pts-a.pts).map((_,i)=><Cell key={i} fill={i===0?BRAND.gold:BRAND.crimson}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AdminAttendance({players}){
  const [records,setRecords]=useState(()=>Object.fromEntries(players.map(p=>[p.id,{present:8,late:1,excused:1,absent:0}])));
  const [marks,setMarks]=useState(()=>Object.fromEntries(players.map(p=>[p.id,"Present"])));
  const [session,setSession]=useState({date:new Date().toISOString().split("T")[0],type:"Practice"});
  const [saved,setSaved]=useState(false);
  const statuses=["Present","Late","Excused","Absent"];
  const colors={Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"};

  const saveSession=()=>{
    setRecords(r=>{
      const nr={...r};
      players.forEach(p=>{
        const key=marks[p.id].toLowerCase().replace(" ","");
        nr[p.id]={...nr[p.id],[key]:(nr[p.id][key]||0)+1};
      });
      return nr;
    });
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Attendance Management</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[["Total",players.length],["Present",players.filter(p=>marks[p.id]==="Present").length],["Late",players.filter(p=>marks[p.id]==="Late").length],["Absent",players.filter(p=>marks[p.id]==="Absent").length]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <span style={S.cardTitle}>Take Attendance</span>
          <input type="date" value={session.date} onChange={e=>setSession(s=>({...s,date:e.target.value}))} style={{...S.input,width:160}}/>
          <select value={session.type} onChange={e=>setSession(s=>({...s,type:e.target.value}))} style={{...S.input,width:160}}>
            {["Practice","Game","Meeting","Film Session"].map(t=><option key={t}>{t}</option>)}
          </select>
          <button onClick={saveSession} style={S.btn("gold")}>{saved?"✅ Saved!":"Save Session"}</button>
        </div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Player</th>
            {statuses.map(s=><th key={s} style={{...S.th,color:colors[s]}}>{s}</th>)}
          </tr></thead>
          <tbody>{players.map(p=>(
            <tr key={p.id}>
              <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={p.photo} size={26}/>{p.name}</div></td>
              {statuses.map(s=>(
                <td key={s} style={S.td}><input type="radio" name={`att-${p.id}`} checked={marks[p.id]===s} onChange={()=>setMarks(m=>({...m,[p.id]:s}))} style={{accentColor:colors[s],width:16,height:16,cursor:"pointer"}}/></td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Season Summary (All Players)</div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Player</th>
            <th style={{...S.th,color:"#4ade80"}}>Present</th>
            <th style={{...S.th,color:"#facc15"}}>Late</th>
            <th style={{...S.th,color:"#60a5fa"}}>Excused</th>
            <th style={{...S.th,color:"#f87171"}}>Absent</th>
            <th style={S.th}>Rate</th>
          </tr></thead>
          <tbody>{players.map(p=>{
            const r=records[p.id]||{present:0,late:0,excused:0,absent:0};
            const total=(r.present||0)+(r.late||0)+(r.excused||0)+(r.absent||0);
            const rate=total?Math.round(((r.present||0)+(r.late||0)*0.5)/total*100):0;
            return(
              <tr key={p.id}>
                <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={p.photo} size={24}/>{p.name}</div></td>
                <td style={{...S.td,color:"#4ade80",fontWeight:600}}>{r.present||0}</td>
                <td style={{...S.td,color:"#facc15"}}>{r.late||0}</td>
                <td style={{...S.td,color:"#60a5fa"}}>{r.excused||0}</td>
                <td style={{...S.td,color:"#f87171"}}>{r.absent||0}</td>
                <td style={S.td}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:5,background:BRAND.border,borderRadius:3}}>
                      <div style={{width:`${rate}%`,height:"100%",background:rate>90?BRAND.gold:BRAND.crimson,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:rate>90?BRAND.gold:BRAND.textPrimary,minWidth:34}}>{rate}%</span>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function Practice({players}){
  const [practices,setPractices]=useState(INIT_PRACTICES);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({date:"",time:"6:00 AM",type:"Conditioning",location:"Enderun Gym",objectives:"",notes:""});
  const [attModal,setAttModal]=useState(null);
  const [attMarks,setAttMarks]=useState({});

  const save=()=>{
    if(!form.date) return;
    if(editing){ setPractices(ps=>ps.map(p=>p.id===editing?{...form,id:editing,attendance:p.attendance}:p)); }
    else{ setPractices(ps=>[...ps,{...form,id:Date.now(),attendance:[]}]); }
    setShowForm(false); setEditing(null);
  };
  const del=(id)=>{ if(window.confirm("Delete session?")) setPractices(ps=>ps.filter(p=>p.id!==id)); };
  const openAtt=(p)=>{ setAttModal(p.id); setAttMarks(Object.fromEntries(players.map(pl=>[pl.id,"Present"]))); };
  const saveAtt=()=>{ setPractices(ps=>ps.map(p=>p.id===attModal?{...p,attendance:players.map(pl=>({id:pl.id,name:pl.name,status:attMarks[pl.id]||"Present"}))}:p)); setAttModal(null); };

  const F=({label,field,opts})=>(
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
      {opts?<select value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      :<input value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}/>}
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Practice Scheduling</h1>
        <button onClick={()=>{setForm({date:"",time:"6:00 AM",type:"Conditioning",location:"Enderun Gym",objectives:"",notes:""});setEditing(null);setShowForm(true);}} style={S.btn("gold")}>+ New Session</button>
      </div>
      <div style={{display:"grid",gap:12}}>
        {[...practices].sort((a,b)=>a.date.localeCompare(b.date)).map(p=>(
          <div key={p.id} style={{...S.card,marginBottom:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:48,textAlign:"center"}}>
                  <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase"}}>{new Date(p.date+"T00:00").toLocaleString("en",{month:"short"})}</div>
                  <div style={{fontSize:24,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{new Date(p.date+"T00:00").getDate()}</div>
                </div>
                <div style={{width:1,height:40,background:BRAND.crimson}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{p.type}</div>
                  <div style={{fontSize:12,color:BRAND.textSecondary}}>{p.time} · {p.location}</div>
                  {p.objectives&&<div style={{fontSize:12,color:BRAND.textSecondary}}>🎯 {p.objectives}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {p.attendance.length>0&&<span style={{fontSize:12,color:BRAND.gold}}>✅ {p.attendance.filter(a=>a.status==="Present").length}/{p.attendance.length}</span>}
                <button onClick={()=>openAtt(p)} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>📋 Attendance</button>
                <button onClick={()=>{setForm({...p});setEditing(p.id);setShowForm(true);}} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>✏️ Edit</button>
                <button onClick={()=>del(p.id)} style={{...S.btn("danger"),padding:"5px 12px",fontSize:12}}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <Modal title={editing?"Edit Session":"New Practice Session"} onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}><F label="Date *" field="date"/></div>
            <F label="Time" field="time"/>
            <F label="Type" field="type" opts={["Conditioning","Skill Work","Film Session","Full Scrimmage","Shoot-Around","Strength & Conditioning","Team Meeting"]}/>
            <F label="Location" field="location"/>
          </div>
          <F label="Objectives" field="objectives"/>
          <F label="Notes" field="notes"/>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} style={S.btn("gold")}>{editing?"Save Changes":"Add Session"}</button>
          </div>
        </Modal>
      )}
      {attModal&&(
        <Modal title="Practice Attendance" onClose={()=>setAttModal(null)}>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Player</th>{["Present","Late","Excused","Absent"].map(s=><th key={s} style={S.th}>{s}</th>)}</tr></thead>
            <tbody>{players.map(p=>(
              <tr key={p.id}>
                <td style={S.td}>{p.name}</td>
                {["Present","Late","Excused","Absent"].map(s=>(
                  <td key={s} style={S.td}><input type="radio" name={`pa-${p.id}`} checked={(attMarks[p.id]||"Present")===s} onChange={()=>setAttMarks(m=>({...m,[p.id]:s}))} style={{cursor:"pointer"}}/></td>
                ))}
              </tr>
            ))}</tbody>
          </table>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:16,gap:10}}>
            <button onClick={()=>setAttModal(null)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={saveAtt} style={S.btn("gold")}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function League(){
  const [games,setGames]=useState(INIT_LEAGUE);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({date:"",time:"5:00 PM",opp:"",venue:"Enderun Gym",homeAway:"Home",type:"League",us:"",them:""});

  const save=()=>{
    if(!form.opp||!form.date) return;
    const obj={...form,id:editing||Date.now(),us:form.us!==""?parseInt(form.us):null,them:form.them!==""?parseInt(form.them):null};
    if(editing) setGames(gs=>gs.map(g=>g.id===editing?obj:g));
    else setGames(gs=>[...gs,obj]);
    setShowForm(false); setEditing(null);
  };
  const del=(id)=>{ if(window.confirm("Remove game?")) setGames(gs=>gs.filter(g=>g.id!==id)); };

  const F=({label,field,type="text",opts})=>(
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
      {opts?<select value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      :<input type={type} value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}/>}
    </div>
  );

  const played=games.filter(g=>g.us!==null&&g.them!==null);
  const wins=played.filter(g=>g.us>g.them).length;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Upcoming League</h1>
          {played.length>0&&<p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>Record: {wins}W – {played.length-wins}L</p>}
        </div>
        <button onClick={()=>{setForm({date:"",time:"5:00 PM",opp:"",venue:"Enderun Gym",homeAway:"Home",type:"League",us:"",them:""});setEditing(null);setShowForm(true);}} style={S.btn("gold")}>+ Add Game</button>
      </div>
      <div style={{display:"grid",gap:12}}>
        {[...games].sort((a,b)=>a.date.localeCompare(b.date)).map(g=>{
          const hasScore=g.us!==null&&g.them!==null;
          const won=hasScore&&g.us>g.them;
          return(
            <div key={g.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${hasScore?(won?BRAND.gold:BRAND.crimson):BRAND.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{width:48,textAlign:"center"}}>
                    <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase"}}>{new Date(g.date+"T00:00").toLocaleString("en",{month:"short"})}</div>
                    <div style={{fontSize:24,fontWeight:800,color:hasScore?(won?BRAND.gold:BRAND.crimsonLight):BRAND.textPrimary,lineHeight:1}}>{new Date(g.date+"T00:00").getDate()}</div>
                  </div>
                  <div style={{width:1,height:40,background:BRAND.border}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>vs {g.opp}</div>
                    <div style={{fontSize:12,color:BRAND.textSecondary}}>{g.time} · {g.homeAway} · {g.venue}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {hasScore&&<div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:won?BRAND.gold:BRAND.crimsonLight}}>{g.us}–{g.them}</div><div style={{fontSize:11,color:won?"#4ade80":"#f87171",fontWeight:700}}>{won?"WIN":"LOSS"}</div></div>}
                  <button onClick={()=>{setForm({...g,us:g.us??""  ,them:g.them??""});setEditing(g.id);setShowForm(true);}} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>✏️ Edit</button>
                  <button onClick={()=>del(g.id)} style={{...S.btn("danger"),padding:"5px 12px",fontSize:12}}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showForm&&(
        <Modal title={editing?"Edit Game":"Add Game"} onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}><F label="Opponent *" field="opp"/></div>
            <F label="Date *" field="date" type="date"/>
            <F label="Time" field="time"/>
            <F label="Venue" field="venue"/>
            <F label="Home/Away" field="homeAway" opts={["Home","Away","Neutral"]}/>
            <F label="Type" field="type" opts={["League","Friendly","Tournament","Exhibition"]}/>
            <F label="Our Score (if played)" field="us" type="number"/>
            <F label="Opponent Score" field="them" type="number"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} style={S.btn("gold")}>{editing?"Save Changes":"Add Game"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminHealth({players}){
  const [reports,setReports]=useState(INIT_HEALTH);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({playerId:"",injury:"",severity:"Mild",date:"",returnDate:"",status:"Monitoring",notes:""});

  const save=()=>{
    if(!form.playerId||!form.injury) return;
    const pl=players.find(p=>p.id===parseInt(form.playerId));
    const obj={...form,id:editing||Date.now(),playerId:parseInt(form.playerId),playerName:pl?.name||""};
    if(editing) setReports(rs=>rs.map(r=>r.id===editing?obj:r));
    else setReports(rs=>[...rs,obj]);
    setShowForm(false); setEditing(null);
  };
  const del=(id)=>{ if(window.confirm("Remove report?")) setReports(rs=>rs.filter(r=>r.id!==id)); };
  const sevColor={Mild:"#60a5fa",Moderate:"#facc15",Severe:"#f87171"};

  const F=({label,field,type="text",opts})=>(
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
      {opts?<select value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      :<input type={type} value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}/>}
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Health Reports</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>All player health & injury records</p>
        </div>
        <button onClick={()=>{setForm({playerId:"",injury:"",severity:"Mild",date:"",returnDate:"",status:"Monitoring",notes:""});setEditing(null);setShowForm(true);}} style={S.btn("gold")}>+ New Report</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {[["Active Reports",reports.filter(r=>r.status!=="Cleared").length],["Recovering",reports.filter(r=>r.status==="Recovering").length],["Cleared",reports.filter(r=>r.status==="Cleared").length]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gap:12}}>
        {reports.map(r=>(
          <div key={r.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${sevColor[r.severity]||BRAND.border}`}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:sevColor[r.severity],background:`${sevColor[r.severity]}22`,padding:"2px 10px",borderRadius:10}}>{r.severity}</span>
                  <span style={S.pill(r.status)}>{r.status}</span>
                </div>
                <div style={{fontWeight:700,fontSize:15}}>{r.playerName}</div>
                <div style={{fontSize:13,color:BRAND.textSecondary,marginTop:2}}>🩹 {r.injury}</div>
                <div style={{fontSize:12,color:BRAND.textSecondary,marginTop:4}}>📅 {r.date} {r.returnDate&&`· Est. Return: ${r.returnDate}`}</div>
                {r.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:4}}>📝 {r.notes}</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setForm({...r,playerId:r.playerId.toString()});setEditing(r.id);setShowForm(true);}} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>✏️ Edit</button>
                <button onClick={()=>del(r.id)} style={{...S.btn("danger"),padding:"5px 12px",fontSize:12}}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {reports.length===0&&<div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No health reports. All players healthy! 💪</div>}
      </div>
      {showForm&&(
        <Modal title={editing?"Edit Report":"New Health Report"} onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Player *</label>
            <select value={form.playerId} onChange={e=>setForm(f=>({...f,playerId:e.target.value}))} style={S.input}>
              <option value="">Select player…</option>
              {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <F label="Injury / Condition *" field="injury"/>
          <F label="Severity" field="severity" opts={["Mild","Moderate","Severe"]}/>
          <F label="Status" field="status" opts={["Monitoring","Recovering","Cleared"]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <F label="Date of Injury" field="date" type="date"/>
            <F label="Estimated Return" field="returnDate" type="date"/>
          </div>
          <F label="Notes / Restrictions" field="notes"/>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} style={S.btn("gold")}>{editing?"Save Changes":"Add Report"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Announcements(){
  const [items,setItems]=useState([
    {id:1,title:"Season 2026–27 Opening Practice",body:"Report to Enderun Gym at 6 AM. Full attendance required. Bring physicals.",date:"2026-10-12",type:"Practice"},
    {id:2,title:"UAAP Registration Deadline",body:"All players must submit eligibility documents to the Office of Student Affairs by October 25.",date:"2026-10-12",type:"Academic"},
    {id:3,title:"Team Bonding Event",body:"Team dinner on October 18 at 7 PM. All players and coaches are invited.",date:"2026-10-12",type:"Social"},
  ]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",body:"",type:"Practice"});
  const colors={Practice:"#1e3a5f",Academic:"#1a3320",Social:"#2d1f00",Schedule:"#3d1515",General:"#2a2a2a"};
  const tcolors={Practice:"#60a5fa",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};
  const save=()=>{ if(!form.title) return; setItems(is=>[{...form,id:Date.now(),date:new Date().toISOString().split("T")[0]},...is]); setShowForm(false); setForm({title:"",body:"",type:"Practice"}); };
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Announcements</h1>
        <button onClick={()=>setShowForm(true)} style={S.btn("gold")}>+ Post Announcement</button>
      </div>
      <div style={{display:"grid",gap:12}}>
        {items.map(a=>(
          <div key={a.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${tcolors[a.type]||BRAND.crimson}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:colors[a.type]||"#222",color:tcolors[a.type]||"#aaa"}}>{a.type}</span>
              <span style={{fontSize:12,color:BRAND.textSecondary}}>{a.date}</span>
              <button onClick={()=>setItems(is=>is.filter(i=>i.id!==a.id))} style={{...S.btn("danger"),padding:"2px 10px",fontSize:11,marginLeft:"auto"}}>Remove</button>
            </div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{a.title}</div>
            <div style={{fontSize:13,color:BRAND.textSecondary,lineHeight:1.6}}>{a.body}</div>
          </div>
        ))}
      </div>
      {showForm&&(
        <Modal title="New Announcement" onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={S.input}/></div>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Message</label><textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} style={{...S.input,height:80,resize:"vertical"}}/></div>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.input}>{["Practice","Academic","Social","Schedule","General"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} style={S.btn("gold")}>Post</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminDashboard({players}){
  const avgPts=(players.reduce((a,p)=>a+p.pts,0)/players.length).toFixed(1);
  const avgReb=(players.reduce((a,p)=>a+p.reb,0)/players.length).toFixed(1);
  const avgAst=(players.reduce((a,p)=>a+p.ast,0)/players.length).toFixed(1);
  const avgFg=(players.reduce((a,p)=>a+p.fg,0)/players.length).toFixed(1);
  const trend=[{w:"Wk1",r:88},{w:"Wk2",r:91},{w:"Wk3",r:94},{w:"Wk4",r:87},{w:"Wk5",r:96},{w:"Wk6",r:100}];
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${BRAND.crimsonDark},${BRAND.charcoal})`,border:`1px solid ${BRAND.crimson}55`,borderRadius:12,padding:"18px 24px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <TitansLogo size={52}/>
          <div>
            <div style={{fontSize:12,color:BRAND.gold,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}>Enderun Titans</div>
            <div style={{fontSize:26,fontWeight:800,color:BRAND.textPrimary,lineHeight:1}}>Men's Basketball</div>
            <div style={{fontSize:12,color:BRAND.textSecondary}}>Season 2026–27</div>
          </div>
        </div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          {[["Players",players.length],["Active",players.filter(p=>p.status==="Active").length],["Injured",players.filter(p=>p.status==="Injured").length]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:BRAND.gold}}>{v}</div><div style={{fontSize:11,color:BRAND.textSecondary}}>{l}</div></div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[["PPG",avgPts],["RPG",avgReb],["APG",avgAst],["FG%",`${avgFg}%`]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>Team {l}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div style={S.card}>
          <div style={S.cardTitle}>Points Leaders</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={[...players].sort((a,b)=>b.pts-a.pts).slice(0,6).map(p=>({name:p.name.split(" ").pop(),pts:p.pts}))}>
              <XAxis dataKey="name" tick={{fill:BRAND.textSecondary,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:BRAND.textSecondary,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:8,color:BRAND.textPrimary}}/>
              <Bar dataKey="pts" fill={BRAND.crimson} radius={[3,3,0,0]}>
                {[...players].sort((a,b)=>b.pts-a.pts).slice(0,6).map((_,i)=><Cell key={i} fill={i===0?BRAND.gold:BRAND.crimson}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Attendance Trend</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trend}>
              <XAxis dataKey="w" tick={{fill:BRAND.textSecondary,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[80,100]} tick={{fill:BRAND.textSecondary,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:8,color:BRAND.textPrimary}}/>
              <Line type="monotone" dataKey="r" stroke={BRAND.gold} strokeWidth={2.5} dot={{fill:BRAND.gold,r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={S.card}>
          <div style={S.cardTitle}>Roster Status</div>
          {players.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Avatar initials={p.photo} size={26}/>
                <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:10,color:BRAND.textSecondary}}>{p.pos} · #{p.jersey}</div></div>
              </div>
              <span style={S.pill(p.status)}>{p.status}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Upcoming Games</div>
          {INIT_LEAGUE.slice(0,5).map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
              <div><div style={{fontSize:13,fontWeight:600}}>vs {g.opp}</div><div style={{fontSize:11,color:BRAND.textSecondary}}>{g.date} · {g.homeAway}</div></div>
              <span style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:`${BRAND.crimson}33`,color:BRAND.crimsonLight}}>{g.homeAway}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PLAYER VIEWS
// ═══════════════════════════════════════

function MyProfile({player,setPlayers,allPlayers}){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({...player});

  const save=()=>{
    setPlayers(ps=>ps.map(p=>p.id===player.id?{...form,id:player.id,photo:player.photo,pts:player.pts,reb:player.reb,ast:player.ast,fg:player.fg,threept:player.threept,ft:player.ft,gp:player.gp,stl:player.stl,blk:player.blk,to:player.to,status:player.status}:p));
    setEditing(false);
  };

  const F=({label,field})=>(
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
      <input value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}/>
    </div>
  );

  const p=player;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>My Profile</h1>
        <button onClick={()=>setEditing(!editing)} style={S.btn("gold")}>{editing?"Cancel":"✏️ Edit My Info"}</button>
      </div>
      {editing?(
        <div style={S.card}>
          <div style={{marginBottom:16,padding:"10px 14px",background:`${BRAND.crimson}22`,borderRadius:8,fontSize:13,color:BRAND.crimsonLight}}>
            ℹ️ You can update your personal contact info. Stats and status are managed by the coaching staff.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <F label="Phone" field="phone"/>
            <F label="Email" field="email"/>
            <F label="Height" field="height"/>
            <F label="Weight" field="weight"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setEditing(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} style={S.btn("gold")}>Save Changes</button>
          </div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:20}}>
          <div style={S.card}>
            <div style={{textAlign:"center"}}>
              <Avatar initials={p.photo} size={72} color={BRAND.gold}/>
              <div style={{fontWeight:700,fontSize:17,marginTop:10}}>{p.name}</div>
              <div style={{color:BRAND.textSecondary,fontSize:12}}>#{p.jersey} · {p.pos}</div>
              <span style={{...S.pill(p.status),marginTop:8,display:"inline-block"}}>{p.status}</span>
            </div>
            <div style={{marginTop:14,display:"grid",gap:7}}>
              {[["Year",p.yr],["Height",p.height],["Weight",p.weight],["Nationality",p.nationality],["Course",p.course],["Birthplace",p.birthplace],["DOB",p.dob]].map(([l,v])=>v?(
                <div key={l} style={{background:BRAND.charcoal,borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{v}</div>
                </div>
              ):null)}
              <div style={{background:BRAND.charcoal,borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase"}}>Contact</div>
                <div style={{fontSize:12,marginTop:2}}>📞 {p.phone}</div>
                <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:3,wordBreak:"break-all"}}>✉️ {p.email}</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[["PTS",p.pts,"ppg"],["REB",p.reb,"rpg"],["AST",p.ast,"apg"],["FG%",`${p.fg}%`,""],["3PT%",`${p.threept}%`,""],["FT%",`${p.ft}%`,""]].map(([l,v,s])=>(
                <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l} {s}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["GP",p.gp],["STL",p.stl],["BLK",p.blk],["TO",p.to]].map(([l,v])=>(
                <div key={l} style={S.statCard}><div style={{...S.statVal,fontSize:20}}>{v}</div><div style={S.statLabel}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyStats({player:p}){
  const radar=[
    {sub:"Scoring",val:Math.min(100,Math.round(p.pts*4.5))},{sub:"Rebounding",val:Math.min(100,Math.round(p.reb*8))},
    {sub:"Playmaking",val:Math.min(100,Math.round(p.ast*9))},{sub:"Defense",val:Math.min(100,Math.round((p.stl+p.blk)*20))},
    {sub:"FG%",val:Math.round(p.fg)},{sub:"FT%",val:Math.round(p.ft)},
  ];
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:20}}>My Statistics</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {[["PTS",p.pts,"per game"],["REB",p.reb,"per game"],["AST",p.ast,"per game"],["FG%",`${p.fg}%`,"field goals"],["3PT%",`${p.threept}%`,"three-point"],["FT%",`${p.ft}%`,"free throws"]].map(([l,v,s])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l}</div><div style={{fontSize:10,color:BRAND.textSecondary,marginTop:2}}>{s}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={S.card}>
          <div style={S.cardTitle}>Performance Radar</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radar}>
              <PolarGrid stroke={BRAND.border}/>
              <PolarAngleAxis dataKey="sub" tick={{fill:BRAND.textSecondary,fontSize:11}}/>
              <Radar dataKey="val" stroke={BRAND.gold} fill={BRAND.gold} fillOpacity={0.25}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Other Stats</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Games Played",p.gp],["Steals",p.stl],["Blocks",p.blk],["Turnovers",p.to]].map(([l,v])=>(
              <div key={l} style={{background:BRAND.charcoal,borderRadius:8,padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:700,color:BRAND.gold}}>{v}</div>
                <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerCheckIn({player}){
  const [status,setStatus]=useState(null);
  const [history]=useState([
    {date:"2026-10-12",session:"Practice",status:"Present"},
    {date:"2026-10-10",session:"Practice",status:"Present"},
    {date:"2026-10-08",session:"Film Session",status:"Late"},
    {date:"2026-10-06",session:"Practice",status:"Present"},
    {date:"2026-10-04",session:"Scrimmage",status:"Present"},
  ]);
  const today=new Date().toISOString().split("T")[0];
  const sColors={Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"};

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Attendance Check-In</h1>
      <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:20}}>Mark your attendance for today's session.</p>

      <div style={{...S.card,textAlign:"center",marginBottom:20}}>
        <Avatar initials={player.photo} size={56} color={BRAND.gold}/>
        <div style={{fontWeight:700,fontSize:18,marginTop:10}}>{player.name}</div>
        <div style={{color:BRAND.textSecondary,fontSize:12,marginBottom:20}}>#{player.jersey} · {player.pos} · {today}</div>

        {status?(
          <div>
            <div style={{fontSize:48,marginBottom:8}}>{status==="Present"?"✅":status==="Late"?"⏰":status==="Excused"?"📋":"❌"}</div>
            <div style={{fontSize:18,fontWeight:700,color:sColors[status],marginBottom:8}}>Marked as {status}</div>
            <button onClick={()=>setStatus(null)} style={{...S.btn("secondary"),marginTop:8}}>Change</button>
          </div>
        ):(
          <div>
            <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:16}}>Select your attendance status:</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:320,margin:"0 auto"}}>
              {["Present","Late","Excused","Absent"].map(s=>(
                <button key={s} onClick={()=>setStatus(s)} style={{...S.btn("secondary"),padding:"16px",fontSize:14,fontWeight:700,borderRadius:10,border:`2px solid ${sColors[s]}44`,color:sColors[s]}}>
                  {s==="Present"?"✅ Present":s==="Late"?"⏰ Late":s==="Excused"?"📋 Excused":"❌ Absent"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>My Attendance History</div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Date</th>
            <th style={S.th}>Session</th>
            <th style={S.th}>Status</th>
          </tr></thead>
          <tbody>{history.map((h,i)=>(
            <tr key={i}>
              <td style={S.td}>{h.date}</td>
              <td style={S.td}>{h.session}</td>
              <td style={S.td}><span style={{...S.pill(h.status),color:sColors[h.status]}}>{h.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerHealthReport({player}){
  const [reports,setReports]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({type:"Injury",description:"",severity:"Mild",date:new Date().toISOString().split("T")[0],notes:""});
  const [submitted,setSubmitted]=useState(false);

  const submit=()=>{
    if(!form.description) return;
    setReports(rs=>[...rs,{...form,id:Date.now(),status:"Reported"}]);
    setShowForm(false);
    setSubmitted(true);
    setTimeout(()=>setSubmitted(false),3000);
  };

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Report Health Issue</h1>
      <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:20}}>Report an injury, pain, or health concern to the coaching staff.</p>

      {submitted&&(
        <div style={{...S.card,background:"#134a2e",borderColor:"#4ade80",marginBottom:18,textAlign:"center"}}>
          <div style={{fontSize:32}}>✅</div>
          <div style={{fontSize:16,fontWeight:700,color:"#4ade80",marginTop:6}}>Report submitted!</div>
          <div style={{fontSize:13,color:BRAND.textSecondary,marginTop:4}}>The coaching staff has been notified.</div>
        </div>
      )}

      <div style={{...S.card,marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <Avatar initials={player.photo} size={44} color={BRAND.gold}/>
          <div>
            <div style={{fontWeight:700}}>{player.name}</div>
            <div style={{fontSize:12,color:BRAND.textSecondary}}>{player.pos} · #{player.jersey}</div>
          </div>
          <button onClick={()=>setShowForm(true)} style={{...S.btn("gold"),marginLeft:"auto"}}>+ Report Issue</button>
        </div>
        <div style={{padding:"14px",background:`${BRAND.crimson}22`,borderRadius:8,fontSize:13,color:BRAND.crimsonLight,lineHeight:1.6}}>
          🏥 If you are experiencing pain, discomfort, or any health concern, please report it immediately. Your health is our priority. Do not hide injuries.
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>My Health Reports</div>
        {reports.length===0?(
          <div style={{textAlign:"center",color:BRAND.textSecondary,padding:"20px 0"}}>No reports submitted. Stay healthy! 💪</div>
        ):reports.map(r=>(
          <div key={r.id} style={{padding:"12px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
            <div style={{display:"flex",gap:8,marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color:"#f87171",background:"#4a131322",padding:"2px 8px",borderRadius:8}}>{r.severity}</span>
              <span style={{fontSize:11,color:BRAND.textSecondary}}>{r.date}</span>
              <span style={{...S.pill("Monitoring"),fontSize:11}}>Reported</span>
            </div>
            <div style={{fontSize:13,fontWeight:600}}>{r.type}</div>
            <div style={{fontSize:12,color:BRAND.textSecondary,marginTop:2}}>{r.description}</div>
          </div>
        ))}
      </div>

      {showForm&&(
        <Modal title="Report Health Issue" onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.input}>
              {["Injury","Pain/Soreness","Illness","Fatigue","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Describe the issue *</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{...S.input,height:80,resize:"vertical"}} placeholder="e.g. Pain in left ankle when running…"/>
          </div>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Severity</label>
            <select value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))} style={S.input}>
              {["Mild","Moderate","Severe"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Additional Notes</label>
            <input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={S.input} placeholder="When did it start, what triggers it…"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={submit} style={S.btn("gold")}>Submit Report</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PlayerSchedule(){
  const items=[...INIT_PRACTICES.map(p=>({...p,kind:"Practice",title:p.type})),...INIT_LEAGUE.map(g=>({...g,kind:"Game",title:`vs ${g.opp}`}))].sort((a,b)=>a.date.localeCompare(b.date));
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Schedule</h1>
      <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:20}}>Upcoming practices and games.</p>
      <div style={{display:"grid",gap:12}}>
        {items.map((ev,i)=>(
          <div key={i} style={{...S.card,marginBottom:0,display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:48,textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase"}}>{new Date(ev.date+"T00:00").toLocaleString("en",{month:"short"})}</div>
              <div style={{fontSize:24,fontWeight:800,color:ev.kind==="Game"?BRAND.gold:BRAND.textPrimary,lineHeight:1}}>{new Date(ev.date+"T00:00").getDate()}</div>
            </div>
            <div style={{width:1,height:44,background:ev.kind==="Game"?BRAND.crimson:BRAND.border}}/>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:ev.kind==="Game"?`${BRAND.crimson}33`:`${BRAND.border}55`,color:ev.kind==="Game"?BRAND.crimsonLight:BRAND.textSecondary}}>{ev.kind}</span>
                <span style={{fontSize:12,color:BRAND.textSecondary}}>{ev.time}</span>
              </div>
              <div style={{fontWeight:700,fontSize:15}}>{ev.title}</div>
              <div style={{fontSize:12,color:BRAND.textSecondary}}>{ev.location||ev.venue} {ev.homeAway&&`· ${ev.homeAway}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerAnnouncements(){
  const items=[
    {id:1,title:"Season 2026–27 Opening Practice",body:"Report to Enderun Gym at 6 AM. Full attendance required. Bring physicals.",date:"2026-10-12",type:"Practice"},
    {id:2,title:"UAAP Registration Deadline",body:"All players must submit eligibility documents to the Office of Student Affairs by October 25.",date:"2026-10-12",type:"Academic"},
    {id:3,title:"Team Bonding Event",body:"Team dinner on October 18 at 7 PM. All players and coaches are invited.",date:"2026-10-12",type:"Social"},
  ];
  const tcolors={Practice:"#60a5fa",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};
  const colors={Practice:"#1e3a5f",Academic:"#1a3320",Social:"#2d1f00",Schedule:"#3d1515",General:"#2a2a2a"};
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:20}}>Announcements</h1>
      <div style={{display:"grid",gap:12}}>
        {items.map(a=>(
          <div key={a.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${tcolors[a.type]||BRAND.crimson}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:colors[a.type]||"#222",color:tcolors[a.type]||"#aaa"}}>{a.type}</span>
              <span style={{fontSize:12,color:BRAND.textSecondary}}>{a.date}</span>
            </div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{a.title}</div>
            <div style={{fontSize:13,color:BRAND.textSecondary,lineHeight:1.6}}>{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════

function Login({onLogin}){
  const [role,setRole]=useState(ROLES.HEAD_COACH);
  const [playerIdx,setPlayerIdx]=useState(0);

  return(
    <div style={{background:BRAND.black,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:400,textAlign:"center"}}>
        <TitansLogo size={90}/>
        <div style={{fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:BRAND.gold,marginTop:14}}>Enderun Men's College Basketball</div>
        <h1 style={{fontSize:22,fontWeight:800,color:BRAND.textPrimary,margin:"8px 0 4px"}}>Management System</h1>
        <p style={{fontSize:12,color:BRAND.textSecondary,marginBottom:28}}>Season 2026–27</p>
        <div style={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:14,padding:28}}>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>EMAIL</label>
            <input placeholder="coach@enderun.edu.ph" style={S.input} defaultValue="coach@enderun.edu.ph"/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>PASSWORD</label>
            <input type="password" style={S.input} defaultValue="password"/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>ROLE</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={S.input}>
              <option value={ROLES.HEAD_COACH}>Head Coach (Admin)</option>
              <option value={ROLES.TEAM_MANAGER}>Team Manager (Admin)</option>
              <option value={ROLES.ASSISTANT}>Assistant Coach</option>
              <option value={ROLES.PLAYER}>Player</option>
            </select>
          </div>
          {role===ROLES.PLAYER&&(
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>SELECT PLAYER (Demo)</label>
              <select value={playerIdx} onChange={e=>setPlayerIdx(parseInt(e.target.value))} style={S.input}>
                {INIT_PLAYERS.map((p,i)=><option key={p.id} value={i}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div style={{marginBottom:20,padding:"8px 12px",background:`${BRAND.border}55`,borderRadius:8,fontSize:11,color:BRAND.textSecondary,textAlign:"left"}}>
            {isAdmin(role)?"🔑 Admin: Full access — manage players, attendance, health & schedule.":role===ROLES.PLAYER?"👤 Player: View own profile & stats, check-in, report health concerns.":"👁️ Assistant: View-only access to team data."}
          </div>
          <button onClick={()=>onLogin(role,playerIdx)} style={{...S.btn("primary"),width:"100%",padding:"11px",fontSize:14,borderRadius:10}}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════

export default function App(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [role,setRole]=useState(null);
  const [playerIdx,setPlayerIdx]=useState(0);
  const [page,setPage]=useState("dashboard");
  const [players,setPlayers]=useState(INIT_PLAYERS);

  const handleLogin=(r,pi)=>{ setRole(r); setPlayerIdx(pi||0); setLoggedIn(true); setPage(isAdmin(r)?"dashboard":"myprofile"); };
  const handleLogout=()=>{ setLoggedIn(false); setRole(null); setPage("dashboard"); };

  if(!loggedIn) return <Login onLogin={handleLogin}/>;

  const currentPlayer=players[playerIdx]||players[0];
  const nav=isAdmin(role)?ADMIN_NAV:PLAYER_NAV;

  const adminPages={
    dashboard:<AdminDashboard players={players}/>,
    roster:<Roster players={players} setPlayers={setPlayers}/>,
    stats:<Statistics players={players}/>,
    attendance:<AdminAttendance players={players}/>,
    practice:<Practice players={players}/>,
    league:<League/>,
    health:<AdminHealth players={players}/>,
    announcements:<Announcements/>,
    playbook:<Playbook isAdmin={true}/>,
  };

  const playerPages={
    myprofile:<MyProfile player={currentPlayer} setPlayers={setPlayers} allPlayers={players}/>,
    mystats:<MyStats player={currentPlayer}/>,
    checkin:<PlayerCheckIn player={currentPlayer}/>,
    healthreport:<PlayerHealthReport player={currentPlayer}/>,
    schedule:<PlayerSchedule/>,
    announcements:<PlayerAnnouncements/>,
    playbook:<Playbook isAdmin={false}/>,
  };

  const pages=isAdmin(role)?adminPages:playerPages;
  const activePage=pages[page]||pages[isAdmin(role)?"dashboard":"myprofile"];

  return(
    <div style={S.app}>
      <header style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <TitansLogo size={34}/>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:BRAND.textPrimary,lineHeight:1}}>Enderun Titans</div>
            <div style={{fontSize:9,color:BRAND.textSecondary,letterSpacing:"0.08em"}}>BASKETBALL MANAGEMENT</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <RoleBadge role={role}/>
          {role===ROLES.PLAYER&&<span style={{fontSize:12,color:BRAND.textSecondary}}>{currentPlayer.name}</span>}
          <button onClick={handleLogout} style={{...S.btn("secondary"),padding:"5px 14px",fontSize:12}}>Sign Out</button>
        </div>
      </header>
      <div style={{display:"flex",flex:1}}>
        <nav style={S.nav}>
          <div style={{padding:"6px 18px 12px",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.textSecondary}}>
            {isAdmin(role)?"Admin Panel":"Player Portal"}
          </div>
          {nav.map(item=>(
            <div key={item.id} onClick={()=>setPage(item.id)} style={S.navItem(page===item.id)}>
              <span style={{fontSize:15}}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          {isAdmin(role)&&(
            <div style={{padding:"16px 16px 8px",marginTop:10,borderTop:`1px solid ${BRAND.border}`}}>
              {[["Players",players.length],["Active",players.filter(p=>p.status==="Active").length]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 4px"}}>
                  <span style={{fontSize:11,color:BRAND.textSecondary}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:700,color:BRAND.gold}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </nav>
        <main style={S.main}>{activePage}</main>
      </div>
    </div>
  );
}
