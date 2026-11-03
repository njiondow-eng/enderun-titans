/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import "./App.css";

// Responsive hook
function useIsMobile(breakpoint=768){
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<breakpoint);
  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<breakpoint);
    window.addEventListener("resize",handler);
    return()=>window.removeEventListener("resize",handler);
  },[breakpoint]);
  return isMobile;
}
const MobileCtx=createContext(false);
const useMobile=()=>useContext(MobileCtx);
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { supabase } from "./supabaseClient";
import Playbook from "./Playbook";
import UserManager from "./UserManager";

// Safe date parser — handles YYYY-MM-DD and MM/DD/YYYY, returns valid Date or null
const parseDate=d=>{
  if(!d) return null;
  // Already ISO format
  if(/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d+"T00:00:00");
  // MM/DD/YYYY → convert
  if(/^\d{2}\/\d{2}\/\d{4}$/.test(d)){const[m,day,y]=d.split("/");return new Date(`${y}-${m}-${day}T00:00:00`);}
  const dt=new Date(d);
  return isNaN(dt)?null:dt;
};
const fmtMonth=d=>{const dt=parseDate(d);return dt?dt.toLocaleString("en",{month:"short"}):"—";};
const fmtDay=d=>{const dt=parseDate(d);return dt?dt.getDate():"—";};

const BRAND = {
  crimson:"#9B1C1C", crimsonDark:"#6B0F0F", crimsonLight:"#C53030",
  gold:"#D4A017", black:"#0D0D0D", charcoal:"#1A1A1A",
  surfaceLight:"#1E1E1E", border:"#2A2A2A",
  textPrimary:"#F0E6D0", textSecondary:"#9A8A70",
};

const ROLES = {
  HEAD_COACH: "Head Coach",
  TEAM_MANAGER: "Team Manager",
  PLAYER: "Player",
  ASSISTANT: "Assistant Coach",
  CONDITIONING_COACH: "Conditioning Coach",
};
const isAdmin = (role) => role === ROLES.HEAD_COACH || role === ROLES.TEAM_MANAGER;
const isConditioningCoach = (role) => role === ROLES.CONDITIONING_COACH;

const INIT_PLAYERS = [
  { name:"Miekho Joush M. Natinga", jersey:1, pos:"PG", yr:"1st Year", height:"5'10\"", weight:"78 kg", dob:"2006", birthplace:"Malaybalay City, Bukidnon", nationality:"Filipino", course:"BS IHM", phone:"09944829504", email:"miekho082106@gmail.com", status:"Active", pts:8.4, reb:3.1, ast:2.9, fg:38.2, threept:31.0, ft:74.0, gp:10, stl:1.2, blk:0.2, to_:1.8, photo:"MN" },
  { name:"Chance Barnard", jersey:2, pos:"PF", yr:"Grade 11", height:"6'5\"", weight:"94 kg", dob:"06/23/2008", birthplace:"Abidjan", nationality:"Ivorian", course:"ABM", phone:"09151375112", email:"Chancebarnard55@gmail.com", status:"Active", pts:14.2, reb:8.7, ast:1.4, fg:51.3, threept:22.0, ft:68.5, gp:10, stl:0.8, blk:2.1, to_:1.6, photo:"CB" },
  { name:"Juan Luis Alessandro F. Aguilar", jersey:3, pos:"PF", yr:"Grade 12", height:"6'6\"", weight:"90 kg", dob:"8/31/2008", birthplace:"Angeles City, Pampanga", nationality:"Filipino", course:"Grade 12 ABM", phone:"09190758364", email:"jlaguilarftw@gmail.com", status:"Active", pts:12.1, reb:7.4, ast:1.8, fg:48.9, threept:19.5, ft:71.2, gp:10, stl:0.6, blk:1.8, to_:2.0, photo:"JA" },
  { name:"Albert Clifford Jay Libago", jersey:4, pos:"C", yr:"4th Year", height:"6'5\"", weight:"100 kg", dob:"", birthplace:"Poblacion Mambajao, Camiguin", nationality:"Filipino", course:"BS IHM HA", phone:"09565509436", email:"albert.libago@enderuncolleges.com", status:"Active", pts:10.8, reb:9.2, ast:1.0, fg:55.4, threept:0.0, ft:63.1, gp:10, stl:0.5, blk:2.8, to_:1.5, photo:"AL" },
  { name:"Byron Legaspi", jersey:5, pos:"SG", yr:"AY 2026-2027", height:"5'11\"", weight:"82 kg", dob:"October 6, 2006", birthplace:"Muntinlupa", nationality:"Filipino", course:"BS Entrepreneurship", phone:"09604564917", email:"justin.legaspi@enderuncolleges.com", status:"Active", pts:9.3, reb:3.5, ast:3.2, fg:40.1, threept:34.2, ft:77.8, gp:10, stl:1.4, blk:0.3, to_:2.1, photo:"BL" },
  { name:"Carlos Jake Villava-Cua Garcia", jersey:6, pos:"SF", yr:"Sophomore", height:"6'2\"", weight:"81 kg", dob:"December 3, 2005", birthplace:"United Kingdom", nationality:"Filipino/British", course:"BSIHM HA", phone:"09295426898", email:"carlocio8912@gmail.com", status:"Active", pts:11.5, reb:5.1, ast:2.4, fg:43.7, threept:30.5, ft:75.3, gp:10, stl:1.1, blk:0.7, to_:1.9, photo:"CG" },
  { name:"Cyrus Neal Bernardo Ferrer", jersey:7, pos:"PG", yr:"3rd Year", height:"5'11\"", weight:"81 kg", dob:"February 8, 2003", birthplace:"Mandaluyong City", nationality:"Filipino", course:"BSBA Marketing Management", phone:"09151788653", email:"cyrusnealferrer0088@gmail.com", status:"Active", pts:13.7, reb:3.8, ast:5.9, fg:41.2, threept:35.8, ft:80.4, gp:10, stl:1.7, blk:0.2, to_:2.3, photo:"CF" },
  { name:"Aeron Lloyd F. Luague", jersey:8, pos:"PG", yr:"1st Year", height:"6'1\"", weight:"78 kg", dob:"February 1, 2008", birthplace:"Davao City", nationality:"Filipino", course:"BS IHM", phone:"09709117698", email:"aeron.luague@enderuncolleges.com", status:"Active", pts:7.6, reb:2.9, ast:4.1, fg:37.5, threept:29.8, ft:72.1, gp:10, stl:1.3, blk:0.1, to_:2.5, photo:"AL" },
  { name:"Zachary Angelo G. Dionela", jersey:9, pos:"SF", yr:"3rd Year", height:"6'3\"", weight:"85 kg", dob:"03/15/2005", birthplace:"Bacolod City", nationality:"Filipino", course:"BSBA MM", phone:"09456051234", email:"zachary.dionela@enderuncolleges.com", status:"Active", pts:10.2, reb:5.8, ast:2.1, fg:44.6, threept:32.1, ft:76.9, gp:10, stl:1.0, blk:0.9, to_:1.7, photo:"ZD" },
  { name:"Frank Nero Rubang", jersey:10, pos:"PF", yr:"2nd Year", height:"6'2\"", weight:"90 kg", dob:"October 22, 2006", birthplace:"Rosario, Cervantes, Ilocos Sur", nationality:"Filipino", course:"BSIHM", phone:"09513485713", email:"frankneronero60@gmail.com", status:"Active", pts:9.0, reb:6.3, ast:1.5, fg:46.2, threept:20.4, ft:68.7, gp:10, stl:0.7, blk:1.3, to_:1.8, photo:"FR" },
  { name:"Gabe Howe", jersey:11, pos:"SG", yr:"1st Year", height:"5'10\"", weight:"82 kg", dob:"03/26/2003", birthplace:"Las Vegas, NV", nationality:"Filipino", course:"BS IHM", phone:"+1 702-683-2407", email:"Gabe_Howe@outlook.com", status:"Active", pts:11.8, reb:3.4, ast:2.7, fg:42.3, threept:37.5, ft:81.2, gp:10, stl:1.5, blk:0.4, to_:1.6, photo:"GH" },
];

const ADMIN_NAV = [
  { id:"dashboard", label:"Dashboard", icon:"🏠" },
  { id:"roster", label:"Roster", icon:"👥" },
  { id:"stats", label:"Statistics", icon:"📊" },
  { id:"attendance", label:"Attendance", icon:"✅" },
  { id:"practice", label:"Practice", icon:"🏋️" },
  { id:"league", label:"League", icon:"🏆" },
  { id:"health", label:"Health Report", icon:"🏥" },
  { id:"playbook", label:"Playbook", icon:"📖" },
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"users", label:"User Accounts", icon:"🔑" },
];

const PLAYER_NAV = [
  { id:"playerdashboard", label:"Dashboard", icon:"🏠" },
  { id:"myprofile", label:"My Profile", icon:"👤" },
  { id:"mystats", label:"My Stats", icon:"📊" },
  { id:"myattendance", label:"My Attendance", icon:"✅" },
  { id:"myhealth", label:"My Health", icon:"🏥" },
  { id:"schedule", label:"Schedule", icon:"📅" },
  { id:"playbook", label:"Playbook", icon:"📖" },
  { id:"announcements", label:"Announcements", icon:"📢" },
];

const CONDITIONING_NAV = [
  { id:"conditioningdashboard", label:"Dashboard", icon:"🏠" },
  { id:"roster", label:"Roster", icon:"👥" },
  { id:"performance", label:"Performance", icon:"📊" },
  { id:"attendance", label:"Attendance", icon:"✅" },
  { id:"health", label:"Health Report", icon:"🏥" },
  { id:"schedule", label:"Schedule", icon:"📅" },
  { id:"practice", label:"Practice", icon:"🏋️" },
  { id:"announcements", label:"Announcements", icon:"📢" },
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

const TitansLogo=({size=48})=>(
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" fill={BRAND.crimson} opacity="0.15"/>
    <polygon points="50,10 90,35 85,80 50,95 15,80 10,35" stroke={BRAND.gold} strokeWidth="1.5" fill="none"/>
    <text x="50" y="52" textAnchor="middle" fill={BRAND.gold} fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="3">TITANS</text>
    <text x="50" y="66" textAnchor="middle" fill={BRAND.textSecondary} fontSize="6" fontFamily="serif" letterSpacing="2">ENDERUN</text>
    <circle cx="50" cy="50" r="15" stroke={BRAND.crimson} strokeWidth="0.5" fill="none"/>
  </svg>
);

const Avatar=({initials,size=36,color=BRAND.crimson,photoUrl=null})=>(
  photoUrl
    ?<img src={photoUrl} alt={initials} style={{width:size,height:size,borderRadius:"50%",border:`1.5px solid ${color}`,objectFit:"cover",flexShrink:0}}/>
    :<div style={{width:size,height:size,borderRadius:"50%",background:`${color}33`,border:`1.5px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:700,color,flexShrink:0}}>{initials}</div>
);

// ── GLOBAL FormField — defined OUTSIDE all components to prevent focus loss ──
const FormField=({label,field,type="text",opts,form,setForm})=>(
  <div style={{marginBottom:11}}>
    <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{label}</label>
    {opts
      ?<select value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}>
          {opts.map(o=><option key={o}>{o}</option>)}
        </select>
      :<input type={type} value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={S.input}/>
    }
  </div>
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

const Spinner=()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
    <div style={{width:32,height:32,border:`3px solid ${BRAND.border}`,borderTop:`3px solid ${BRAND.gold}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const BLANK_PLAYER={name:"",jersey:"",pos:"PG",yr:"",height:"",weight:"",dob:"",birthplace:"",nationality:"Filipino",course:"",phone:"",email:"",student_id:"",status:"Active",pts:0,reb:0,ast:0,fg:0,threept:0,ft:0,gp:0,stl:0,blk:0,to_:0,plus_minus:0,photo:""};

// ── ROSTER ──
function Roster({players,loadPlayers,loading,readOnly=false}){
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(BLANK_PLAYER);
  const [saving,setSaving]=useState(false);
  const [uploadingPhoto,setUploadingPhoto]=useState(false);

  const filtered=players.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.pos.includes(search.toUpperCase()));

  const openAdd=()=>{ setForm(BLANK_PLAYER); setEditing(null); setShowForm(true); };
  const openEdit=(p)=>{ setForm({...p,to_:p.to_||0}); setEditing(p.id); setShowForm(true); };

  const uploadPhoto=async(file,playerId)=>{
    if(!file||!playerId) return null;
    setUploadingPhoto(true);
    const ext=file.name.split(".").pop();
    const path=`players/${playerId}.${ext}`;
    const{error}=await supabase.storage.from("player-photos").upload(path,file,{upsert:true});
    if(error){ setUploadingPhoto(false); return null; }
    const{data}=supabase.storage.from("player-photos").getPublicUrl(path);
    setUploadingPhoto(false);
    return data.publicUrl;
  };

  const savePlayer=async()=>{
    if(!form.name.trim()) return;
    setSaving(true);
    const photo=form.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    const data={...form,photo,jersey:parseInt(form.jersey)||0,pts:parseFloat(form.pts)||0,reb:parseFloat(form.reb)||0,ast:parseFloat(form.ast)||0,fg:parseFloat(form.fg)||0,threept:parseFloat(form.threept)||0,ft:parseFloat(form.ft)||0,gp:parseInt(form.gp)||0,stl:parseFloat(form.stl)||0,blk:parseFloat(form.blk)||0,to_:parseFloat(form.to_)||0};
    delete data.id; delete data.created_at; delete data._photoFile;
    let savedId=editing;
    if(editing){ await supabase.from("players").update(data).eq("id",editing); }
    else {
      const{data:inserted}=await supabase.from("players").insert([data]).select("id").single();
      if(inserted) savedId=inserted.id;
    }
    // Upload photo if selected
    if(form._photoFile && savedId){
      const url=await uploadPhoto(form._photoFile,savedId);
      if(url) await supabase.from("players").update({photo_url:url}).eq("id",savedId);
    }
    // Auto-create Supabase account if email + student_id provided and no account yet
    if(!editing && form.email.trim() && form.student_id.trim()){
      try{
        const{data:authData,error:authError}=await supabase.auth.signUp({
          email:form.email.trim(),
          password:form.student_id.trim(),
          options:{data:{role:"player",full_name:form.name}}
        });
        if(!authError&&authData.user){
          await supabase.from("user_profiles").insert([{
            id:authData.user.id,role:"player",
            full_name:form.name,player_id:savedId
          }]);
          if(savedId) await supabase.from("players").update({auth_user_id:authData.user.id}).eq("id",savedId);
        }
      }catch(e){ console.warn("Auto account creation failed:",e.message); }
    }
    setSaving(false); setShowForm(false); loadPlayers();
  };

  const deletePlayer=async(id)=>{
    if(!window.confirm("Remove this player?")) return;
    await supabase.from("players").delete().eq("id",id);
    loadPlayers();
  };



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
          {!readOnly&&<button onClick={openAdd} style={S.btn("gold")}>+ Add Player</button>}
        </div>
      </div>
      {loading?<Spinner/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card,marginBottom:0,cursor:"pointer"}}
              onClick={()=>setSelected(p)}
              onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND.crimson}
              onMouseLeave={e=>e.currentTarget.style.borderColor=BRAND.border}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Avatar initials={p.photo||"??"} size={44} photoUrl={p.photo_url||null}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                  <div style={{fontSize:11,color:BRAND.textSecondary}}>{p.pos} · #{p.jersey} · {p.yr}</div>
                  {p.student_id&&<div style={{fontSize:10,color:BRAND.gold,marginTop:1}}>ID: {p.student_id}</div>}
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
              {!readOnly&&<div style={{display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>openEdit(p)} style={{...S.btn("secondary"),flex:1,padding:"6px",fontSize:12}}>✏️ Edit</button>
                <button onClick={()=>deletePlayer(p.id)} style={{...S.btn("danger"),flex:1,padding:"6px",fontSize:12}}>🗑️ Remove</button>
              </div>}
            </div>
          ))}
        </div>
      )}
      {showForm&&(
        <Modal title={editing?"Edit Player":"Add New Player"} onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            {/* Photo Upload */}
            <div style={{gridColumn:"1/-1",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
              <Avatar initials={form.photo||(form.name?form.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase():"??")} size={60} photoUrl={form._photoPreview||form.photo_url||null}/>
              <div>
                <div style={{fontSize:11,color:BRAND.textSecondary,marginBottom:6}}>PHOTO DE PROFIL</div>
                <label style={{...S.btn("secondary"),padding:"6px 14px",fontSize:12,cursor:"pointer",display:"inline-block"}}>
                  📷 {uploadingPhoto?"Uploading…":"Choisir une photo"}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                    const file=e.target.files[0];
                    if(!file) return;
                    const preview=URL.createObjectURL(file);
                    setForm(f=>({...f,_photoFile:file,_photoPreview:preview}));
                  }}/>
                </label>
                {form._photoPreview&&<div style={{fontSize:11,color:"#4ade80",marginTop:4}}>✅ Photo sélectionnée</div>}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}><FormField form={form} setForm={setForm} label="Full Name *" field="name"/></div>
            <FormField form={form} setForm={setForm} label="Jersey #" field="jersey" type="number"/>
            <FormField form={form} setForm={setForm} label="Position" field="pos" opts={["PG","SG","SF","PF","C"]}/>
            <FormField form={form} setForm={setForm} label="Year / Grade" field="yr"/>
            <FormField form={form} setForm={setForm} label="Status" field="status" opts={["Active","Injured","Suspended"]}/>
            <FormField form={form} setForm={setForm} label="Height" field="height"/>
            <FormField form={form} setForm={setForm} label="Weight" field="weight"/>
            <FormField form={form} setForm={setForm} label="Date of Birth" field="dob"/>
            <FormField form={form} setForm={setForm} label="Birthplace" field="birthplace"/>
            <FormField form={form} setForm={setForm} label="Nationality" field="nationality"/>
            <div style={{gridColumn:"1/-1"}}><FormField form={form} setForm={setForm} label="Course / Program" field="course"/></div>
            <FormField form={form} setForm={setForm} label="Phone" field="phone"/>
            <FormField form={form} setForm={setForm} label="Email" field="email"/>
            <FormField form={form} setForm={setForm} label="Student ID" field="student_id"/>
            {!editing&&form.email&&form.student_id&&(
              <div style={{gridColumn:"1/-1",padding:"8px 12px",background:"#134a2e55",border:"1px solid #4ade8055",borderRadius:8,fontSize:12,color:"#4ade80"}}>
                ✅ Un compte de connexion sera créé automatiquement — Email: <b>{form.email}</b> · Mot de passe: <b>{form.student_id}</b>
              </div>
            )}
            <FormField form={form} setForm={setForm} label="GP" field="gp" type="number"/>
            <FormField form={form} setForm={setForm} label="PPG" field="pts" type="number"/>
            <FormField form={form} setForm={setForm} label="RPG" field="reb" type="number"/>
            <FormField form={form} setForm={setForm} label="APG" field="ast" type="number"/>
            <FormField form={form} setForm={setForm} label="FG%" field="fg" type="number"/>
            <FormField form={form} setForm={setForm} label="3PT%" field="threept" type="number"/>
            <FormField form={form} setForm={setForm} label="FT%" field="ft" type="number"/>
            <FormField form={form} setForm={setForm} label="STL" field="stl" type="number"/>
            <FormField form={form} setForm={setForm} label="BLK" field="blk" type="number"/>
            <FormField form={form} setForm={setForm} label="TO" field="to_" type="number"/>
            <FormField form={form} setForm={setForm} label="+/-" field="plus_minus" type="number"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={savePlayer} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":"Save Player"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminPlayerProfile({player:p,onBack,onEdit}){
  const mob=useMobile();
  const radar=[
    {sub:"Scoring",val:Math.min(100,Math.round(p.pts*4.5))},{sub:"Rebounding",val:Math.min(100,Math.round(p.reb*8))},
    {sub:"Playmaking",val:Math.min(100,Math.round(p.ast*9))},{sub:"Defense",val:Math.min(100,Math.round(((p.stl||0)+(p.blk||0))*20))},
    {sub:"FG%",val:Math.round(p.fg)},{sub:"FT%",val:Math.round(p.ft)},
  ];
  return(
    <div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={S.btn("secondary")}>← Back</button>
        <button onClick={onEdit} style={S.btn("gold")}>✏️ Edit Profile</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"280px 1fr",gap:20}}>
        <div style={S.card}>
          <div style={{textAlign:"center"}}>
            <Avatar initials={p.photo||"??"} size={72} photoUrl={p.photo_url||null}/>
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
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["PTS",p.pts,"ppg"],["REB",p.reb,"rpg"],["AST",p.ast,"apg"],["FG%",`${p.fg}%`,""],["3PT%",`${p.threept}%`,""],["FT%",`${p.ft}%`,""]].map(([l,v,s])=>(
              <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l} {s}</div></div>
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
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:10}}>
            {[["GP",p.gp],["STL",p.stl],["BLK",p.blk],["TO",p.to_]].map(([l,v])=>(
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
  const cols=[{k:"pts",l:"PTS"},{k:"reb",l:"REB"},{k:"ast",l:"AST"},{k:"fg",l:"FG%"},{k:"threept",l:"3PT%"},{k:"ft",l:"FT%"},{k:"stl",l:"STL"},{k:"blk",l:"BLK"},{k:"plus_minus",l:"+/-"}];
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
                <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={p.photo||"??"} size={26}/><span style={{fontWeight:600}}>{p.name}</span></div></td>
                <td style={{...S.td,color:BRAND.textSecondary}}>{p.pos}</td>
                <td style={S.td}>{p.gp}</td>
                {cols.map(c=>{
                  const val=p[c.k]??0;
                  const isPM=c.k==="plus_minus";
                  const pmColor=isPM?(val>0?"#4ade80":val<0?"#f87171":BRAND.textSecondary):null;
                  return(
                    <td key={c.k} style={{...S.td,fontWeight:sort===c.k?700:400,color:isPM?pmColor:(sort===c.k?BRAND.gold:BRAND.textPrimary)}}>
                      {isPM?(val>0?`+${val}`:val):(c.k==="fg"||c.k==="threept"||c.k==="ft"?`${val}%`:val)}
                    </td>
                  );
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAttendance({players,readOnly=false}){
  const mob=useMobile();
  const [marks,setMarks]=useState(()=>Object.fromEntries(players.map(p=>[p.id,"Present"])));
  const [session,setSession]=useState({date:new Date().toISOString().split("T")[0],type:"Practice"});
  const [history,setHistory]=useState([]);
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(false);
  const statuses=["Present","Late","Excused","Absent"];
  const colors={Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"};

  useEffect(()=>{ loadHistory(); },[]);

  const loadHistory=async()=>{
    setLoading(true);
    const {data}=await supabase.from("attendance").select("*").order("created_at",{ascending:false}).limit(50);
    if(data) setHistory(data);
    setLoading(false);
  };

  const saveSession=async()=>{
    const rows=players.map(p=>({player_id:p.id,session_date:session.date,session_type:session.type,status:marks[p.id]||"Present"}));
    await supabase.from("attendance").insert(rows);
    setSaved(true); setTimeout(()=>setSaved(false),2000); loadHistory();
  };

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Attendance Management</h1>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[["Total",players.length],["Present",players.filter(p=>marks[p.id]==="Present").length],["Late",players.filter(p=>marks[p.id]==="Late").length],["Absent",players.filter(p=>marks[p.id]==="Absent").length]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <span style={S.cardTitle}>Take Attendance</span>
          <input type="date" value={session.date} onChange={e=>setSession(s=>({...s,date:e.target.value}))} style={{...S.input,width:160}}/>
          <select value={session.type} onChange={e=>setSession(s=>({...s,type:e.target.value}))} style={{...S.input,width:160}}>
            {["Practice","Game","Film Session","Team Activity"].map(t=><option key={t}>{t}</option>)}
          </select>
          {!readOnly&&<button onClick={saveSession} style={S.btn("gold")}>{saved?"✅ Saved!":"💾 Save Session"}</button>}
        </div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Player</th>
            {statuses.map(s=><th key={s} style={{...S.th,color:colors[s]}}>{s}</th>)}
          </tr></thead>
          <tbody>{players.map(p=>(
            <tr key={p.id}>
              <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={p.photo||"??"} size={26}/>{p.name}</div></td>
              {statuses.map(s=>(
                <td key={s} style={S.td}><input type="radio" name={`att-${p.id}`} checked={marks[p.id]===s} onChange={()=>setMarks(m=>({...m,[p.id]:s}))} style={{accentColor:colors[s],width:16,height:16,cursor:"pointer"}}/></td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Recent Sessions (Saved)</div>
        {loading?<Spinner/>:history.length===0?<div style={{color:BRAND.textSecondary,textAlign:"center",padding:20}}>No sessions saved yet.</div>:(
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Date</th><th style={S.th}>Type</th><th style={S.th}>Player</th><th style={S.th}>Status</th>
            </tr></thead>
            <tbody>{history.slice(0,20).map(h=>(
              <tr key={h.id}>
                <td style={S.td}>{h.session_date}</td>
                <td style={S.td}>{h.session_type}</td>
                <td style={S.td}>{players.find(p=>p.id===h.player_id)?.name||"—"}</td>
                <td style={S.td}><span style={{...S.pill(h.status),color:{Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"}[h.status]}}>{h.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Practice({readOnly=false}){
  const [practices,setPractices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({date:"",time:"6:00 AM",type:"Regular Practice",location:"Enderun Gym",objectives:"",notes:""});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ load(); },[]);
  const load=async()=>{ setLoading(true); const{data}=await supabase.from("practices").select("*").order("date",{ascending:true}); if(data)setPractices(data); setLoading(false); };

  const save=async()=>{
    if(!form.date) return; setSaving(true);
    const d={date:form.date,time:form.time,type:form.type,location:form.location,objectives:form.objectives,notes:form.notes};
    if(editing) await supabase.from("practices").update(d).eq("id",editing);
    else await supabase.from("practices").insert([d]);
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const del=async(id)=>{ if(!window.confirm("Delete?")) return; await supabase.from("practices").delete().eq("id",id); load(); };



  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Practice Scheduling</h1>
        {!readOnly&&<button onClick={()=>{setForm({date:"",time:"6:00 AM",type:"Regular Practice",location:"Enderun Gym",objectives:"",notes:""});setEditing(null);setShowForm(true);}} style={S.btn("gold")}>+ New Session</button>}
      </div>
      {loading?<Spinner/>:(
        <div style={{display:"grid",gap:12}}>
          {practices.map(p=>(
            <div key={p.id} style={{...S.card,marginBottom:0}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{width:48,textAlign:"center"}}>
                    <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase"}}>{fmtMonth(p.date)}</div>
                    <div style={{fontSize:24,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{fmtDay(p.date)}</div>
                  </div>
                  <div style={{width:1,height:40,background:BRAND.crimson}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{p.type}</div>
                    <div style={{fontSize:12,color:BRAND.textSecondary}}>{p.time} · {p.location}</div>
                    {p.objectives&&<div style={{fontSize:12,color:BRAND.textSecondary}}>🎯 {p.objectives}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setForm({...p});setEditing(p.id);setShowForm(true);}} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>✏️</button>
                  <button onClick={()=>del(p.id)} style={{...S.btn("danger"),padding:"5px 12px",fontSize:12}}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {practices.length===0&&<div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No practice sessions yet. Add one!</div>}
        </div>
      )}
      {showForm&&(
        <Modal title={editing?"Edit Session":"New Practice Session"} onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}><FormField form={form} setForm={setForm} label="Date *" field="date"/></div>
            <FormField form={form} setForm={setForm} label="Time" field="time"/>
            <FormField form={form} setForm={setForm} label="Type" field="type" opts={["Regular Practice","Skill Work","Film Session","Full Scrimmage","Shoot-Around","Strength & Conditioning","Team Meeting"]}/>
            <FormField form={form} setForm={setForm} label="Location" field="location"/>
          </div>
          <FormField form={form} setForm={setForm} label="Objectives" field="objectives"/>
          <FormField form={form} setForm={setForm} label="Notes" field="notes"/>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":"Save Session"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function League(){
  const [games,setGames]=useState([]);
  const [leagues,setLeagues]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showLeagueForm,setShowLeagueForm]=useState(false);
  const [showGameForm,setShowGameForm]=useState(false);
  const [editingGame,setEditingGame]=useState(null);
  const [activeLeague,setActiveLeague]=useState(null);
  const [expandedLeague,setExpandedLeague]=useState(null);
  const [leagueName,setLeagueName]=useState("");
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({date:"",time:"5:00 PM",opp:"",venue:"Enderun Gym",home_away:"Home",league_name:"",us:"",them:""});

  useEffect(()=>{ load(); },[]);

  const load=async()=>{
    setLoading(true);
    // Load leagues from dedicated table
    const{data:leagueRows}=await supabase.from("leagues").select("name").order("created_at",{ascending:true});
    // Load games
    const{data:gamesData}=await supabase.from("games").select("*").order("date",{ascending:true});
    if(gamesData) setGames(gamesData);
    if(leagueRows){
      // Merge leagues from table + any extra league names found in games (safety net)
      const fromTable=leagueRows.map(r=>r.name);
      const fromGames=gamesData?[...new Set(gamesData.map(g=>g.type||"General"))]:[];
      const merged=[...new Set([...fromTable,...fromGames])];
      setLeagues(merged);
      if(merged.length>0&&!expandedLeague) setExpandedLeague(merged[0]);
    }
    setLoading(false);
  };

  const addLeague=async()=>{
    if(!leagueName.trim()) return;
    const name=leagueName.trim();
    // Persist to Supabase leagues table
    await supabase.from("leagues").insert([{name}]);
    setLeagues(prev=>[...prev,name]);
    setExpandedLeague(name);
    setLeagueName("");
    setShowLeagueForm(false);
  };

  const removeLeague=async(name)=>{
    if(!window.confirm(`Remove league "${name}" and all its games?`)) return;
    await supabase.from("games").delete().eq("type",name);
    await supabase.from("leagues").delete().eq("name",name);
    load();
  };

  const saveGame=async()=>{
    if(!form.opp||!form.date) return; setSaving(true);
    const d={date:form.date,time:form.time,opp:form.opp,venue:form.venue,home_away:form.home_away,type:activeLeague||expandedLeague||"General",us:form.us!==""?parseInt(form.us):null,them:form.them!==""?parseInt(form.them):null};
    if(editingGame) await supabase.from("games").update(d).eq("id",editingGame);
    else await supabase.from("games").insert([d]);
    setSaving(false); setShowGameForm(false); setEditingGame(null); load();
  };

  const delGame=async(id)=>{ if(!window.confirm("Remove game?")) return; await supabase.from("games").delete().eq("id",id); load(); };



  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>League Management</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>{leagues.length} league{leagues.length!==1?"s":""} · {games.length} total games</p>
        </div>
        <button onClick={()=>setShowLeagueForm(true)} style={S.btn("gold")}>+ Add League</button>
      </div>

      {loading?<Spinner/>:leagues.length===0?(
        <div style={{...S.card,textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:40,marginBottom:10}}>🏆</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No leagues yet</div>
          <div style={{fontSize:13,color:BRAND.textSecondary,marginBottom:16}}>Click "+ Add League" to create your first league</div>
        </div>
      ):(
        <div style={{display:"grid",gap:16}}>
          {leagues.map(league=>{
            const leagueGames=games.filter(g=>g.type===league);
            const played=leagueGames.filter(g=>g.us!==null&&g.them!==null);
            const wins=played.filter(g=>g.us>g.them).length;
            const isExpanded=expandedLeague===league;
            return(
              <div key={league} style={{...S.card,marginBottom:0}}>
                {/* League Header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setExpandedLeague(isExpanded?null:league)}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,borderRadius:10,background:`${BRAND.crimson}33`,border:`2px solid ${BRAND.crimson}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏆</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:16,color:BRAND.textPrimary}}>{league}</div>
                      <div style={{fontSize:12,color:BRAND.textSecondary}}>{leagueGames.length} games · {played.length?`${wins}W–${played.length-wins}L`:"No results yet"}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {played.length>0&&(
                      <div style={{textAlign:"center",background:`${BRAND.crimson}22`,borderRadius:8,padding:"6px 14px"}}>
                        <div style={{fontSize:18,fontWeight:800,color:BRAND.gold}}>{wins}–{played.length-wins}</div>
                        <div style={{fontSize:10,color:BRAND.textSecondary}}>W–L</div>
                      </div>
                    )}
                    <button onClick={e=>{e.stopPropagation();setActiveLeague(league);setForm({date:"",time:"5:00 PM",opp:"",venue:"Enderun Gym",home_away:"Home",us:"",them:""});setEditingGame(null);setShowGameForm(true);}} style={{...S.btn("secondary"),padding:"6px 12px",fontSize:12}}>+ Add Game</button>
                    <button onClick={e=>{e.stopPropagation();removeLeague(league);}} style={{...S.btn("danger"),padding:"6px 12px",fontSize:12}}>🗑️</button>
                    <span style={{fontSize:18,color:BRAND.textSecondary,marginLeft:4}}>{isExpanded?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Games List */}
                {isExpanded&&(
                  <div style={{marginTop:16,borderTop:`1px solid ${BRAND.border}`,paddingTop:16}}>
                    {leagueGames.length===0?(
                      <div style={{textAlign:"center",color:BRAND.textSecondary,padding:"16px 0",fontSize:13}}>
                        No games added yet. Click "+ Add Game" above.
                      </div>
                    ):(
                      <div style={{display:"grid",gap:10}}>
                        {leagueGames.map(g=>{
                          const hasScore=g.us!==null&&g.them!==null;
                          const won=hasScore&&g.us>g.them;
                          return(
                            <div key={g.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:BRAND.charcoal,borderRadius:10,borderLeft:`3px solid ${hasScore?(won?BRAND.gold:BRAND.crimson):BRAND.border}`,flexWrap:"wrap",gap:10}}>
                              <div style={{display:"flex",alignItems:"center",gap:14}}>
                                <div style={{width:44,textAlign:"center"}}>
                                  <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase"}}>{fmtMonth(g.date)}</div>
                                  <div style={{fontSize:22,fontWeight:800,color:hasScore?(won?BRAND.gold:BRAND.crimsonLight):BRAND.textPrimary,lineHeight:1}}>{fmtDay(g.date)}</div>
                                </div>
                                <div style={{width:1,height:36,background:BRAND.border}}/>
                                <div>
                                  <div style={{fontWeight:700,fontSize:14}}>vs {g.opp}</div>
                                  <div style={{fontSize:11,color:BRAND.textSecondary}}>{g.time} · {g.home_away} · {g.venue}</div>
                                </div>
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:12}}>
                                {hasScore?(
                                  <div style={{textAlign:"center"}}>
                                    <div style={{fontSize:20,fontWeight:800,color:won?BRAND.gold:BRAND.crimsonLight}}>{g.us}–{g.them}</div>
                                    <div style={{fontSize:11,color:won?"#4ade80":"#f87171",fontWeight:700}}>{won?"WIN":"LOSS"}</div>
                                  </div>
                                ):(
                                  <span style={{fontSize:12,color:BRAND.textSecondary,padding:"4px 10px",background:`${BRAND.border}55`,borderRadius:6}}>Upcoming</span>
                                )}
                                <button onClick={()=>{setActiveLeague(league);setForm({...g,us:g.us??"",them:g.them??""});setEditingGame(g.id);setShowGameForm(true);}} style={{...S.btn("secondary"),padding:"5px 10px",fontSize:11}}>✏️</button>
                                <button onClick={()=>delGame(g.id)} style={{...S.btn("danger"),padding:"5px 10px",fontSize:11}}>🗑️</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add League Modal */}
      {showLeagueForm&&(
        <Modal title="Add New League" onClose={()=>setShowLeagueForm(false)}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:6}}>League Name *</label>
            <input value={leagueName} onChange={e=>setLeagueName(e.target.value)} style={S.input} placeholder="e.g. UAAP Season 89, FilOil Flying V Cup…"/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowLeagueForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={addLeague} style={S.btn("gold")}>Add League</button>
          </div>
        </Modal>
      )}

      {/* Add/Edit Game Modal */}
      {showGameForm&&(
        <Modal title={editingGame?"Edit Game":`Add Game — ${activeLeague}`} onClose={()=>setShowGameForm(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}><FormField form={form} setForm={setForm} label="Opponent *" field="opp"/></div>
            <FormField form={form} setForm={setForm} label="Date *" field="date" type="date"/>
            <FormField form={form} setForm={setForm} label="Time" field="time"/>
            <FormField form={form} setForm={setForm} label="Venue" field="venue"/>
            <FormField form={form} setForm={setForm} label="Home/Away" field="home_away" opts={["Home","Away","Neutral"]}/>
            <FormField form={form} setForm={setForm} label="Our Score (if played)" field="us" type="number"/>
            <FormField form={form} setForm={setForm} label="Opponent Score" field="them" type="number"/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowGameForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={saveGame} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":"Save Game"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminHealth({players,readOnly=false}){
  const [reports,setReports]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({player_id:"",player_name:"",injury:"",severity:"Mild",date:"",return_date:"",status:"Monitoring",notes:""});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ load(); },[]);
  const load=async()=>{ setLoading(true); const{data}=await supabase.from("health_reports").select("*").order("created_at",{ascending:false}); if(data)setReports(data); setLoading(false); };

  const save=async()=>{
    if(!form.player_id||!form.injury) return; setSaving(true);
    const pl=players.find(p=>p.id===parseInt(form.player_id));
    const d={player_id:parseInt(form.player_id),player_name:pl?.name||"",injury:form.injury,severity:form.severity,date:form.date,return_date:form.return_date,status:form.status,notes:form.notes};
    if(editing) await supabase.from("health_reports").update(d).eq("id",editing);
    else await supabase.from("health_reports").insert([d]);
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const del=async(id)=>{ if(!window.confirm("Remove?")) return; await supabase.from("health_reports").delete().eq("id",id); load(); };
  const sevColor={Mild:"#60a5fa",Moderate:"#facc15",Severe:"#f87171"};



  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div><h1 style={{fontSize:20,fontWeight:700,margin:0}}>Health Reports</h1></div>
        {!readOnly&&<button onClick={()=>{setForm({player_id:"",player_name:"",injury:"",severity:"Mild",date:"",return_date:"",status:"Monitoring",notes:""});setEditing(null);setShowForm(true);}} style={S.btn("gold")}>+ New Report</button>}
      </div>
      {loading?<Spinner/>:(
        <div style={{display:"grid",gap:12}}>
          {reports.map(r=>(
            <div key={r.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${sevColor[r.severity]||BRAND.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:sevColor[r.severity],background:`${sevColor[r.severity]}22`,padding:"2px 10px",borderRadius:10}}>{r.severity}</span>
                    <span style={S.pill(r.status)}>{r.status}</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:15}}>{r.player_name}</div>
                  <div style={{fontSize:13,color:BRAND.textSecondary,marginTop:2}}>🩹 {r.injury}</div>
                  <div style={{fontSize:12,color:BRAND.textSecondary,marginTop:4}}>📅 {r.date} {r.return_date&&`· Return: ${r.return_date}`}</div>
                  {r.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:4}}>📝 {r.notes}</div>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setForm({...r,player_id:r.player_id?.toString()||""});setEditing(r.id);setShowForm(true);}} style={{...S.btn("secondary"),padding:"5px 12px",fontSize:12}}>✏️</button>
                  <button onClick={()=>del(r.id)} style={{...S.btn("danger"),padding:"5px 12px",fontSize:12}}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {reports.length===0&&<div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No health reports. All players healthy! 💪</div>}
        </div>
      )}
      {showForm&&(
        <Modal title={editing?"Edit Report":"New Health Report"} onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Player *</label>
            <select value={form.player_id} onChange={e=>setForm(f=>({...f,player_id:e.target.value}))} style={S.input}>
              <option value="">Select player…</option>
              {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <FormField form={form} setForm={setForm} label="Injury / Condition *" field="injury"/>
          <FormField form={form} setForm={setForm} label="Severity" field="severity" opts={["Mild","Moderate","Severe"]}/>
          <FormField form={form} setForm={setForm} label="Status" field="status" opts={["Monitoring","Recovering","Cleared"]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FormField form={form} setForm={setForm} label="Date" field="date" type="date"/>
            <FormField form={form} setForm={setForm} label="Est. Return" field="return_date" type="date"/>
          </div>
          <FormField form={form} setForm={setForm} label="Notes" field="notes"/>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":"Save Report"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Announcements(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const BLANK={title:"",body:"",type:"Practice"};
  const [form,setForm]=useState(BLANK);
  const [saving,setSaving]=useState(false);
  const tcolors={Practice:"#60a5fa",Game:"#f472b6",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};
  const colors={Practice:"#1e3a5f",Game:"#3d1535",Academic:"#1a3320",Social:"#2d1f00",Schedule:"#3d1515",General:"#2a2a2a"};
  const TYPES=["Practice","Game","Academic","Social","Schedule","General"];

  useEffect(()=>{ load(); },[]);
  const load=async()=>{ setLoading(true); const{data}=await supabase.from("announcements").select("*").order("created_at",{ascending:false}); if(data)setItems(data); setLoading(false); };

  const openNew=()=>{ setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit=(a)=>{ setEditing(a.id); setForm({title:a.title,body:a.body||"",type:a.type||"Practice"}); setShowForm(true); };

  const save=async()=>{
    if(!form.title) return; setSaving(true);
    if(editing){
      await supabase.from("announcements").update({title:form.title,body:form.body,type:form.type}).eq("id",editing);
    } else {
      await supabase.from("announcements").insert([{...form,date:new Date().toISOString().split("T")[0]}]);
    }
    setSaving(false); setShowForm(false); setForm(BLANK); setEditing(null); load();
  };

  const del=async(id)=>{ await supabase.from("announcements").delete().eq("id",id); load(); };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Announcements</h1>
        <button onClick={openNew} style={S.btn("gold")}>+ Post Announcement</button>
      </div>
      {loading?<Spinner/>:(
        <div style={{display:"grid",gap:12}}>
          {items.map(a=>(
            <div key={a.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${tcolors[a.type]||BRAND.crimson}`}}>
              <div style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}>
                <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:colors[a.type]||"#222",color:tcolors[a.type]||"#aaa"}}>{a.type}</span>
                <span style={{fontSize:12,color:BRAND.textSecondary}}>{a.date}</span>
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(a)} style={{...S.btn("secondary"),padding:"2px 10px",fontSize:11}}>✏️ Edit</button>
                  <button onClick={()=>del(a.id)} style={{...S.btn("danger"),padding:"2px 10px",fontSize:11}}>Remove</button>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{a.title}</div>
              <div style={{fontSize:13,color:BRAND.textSecondary,lineHeight:1.6}}>{a.body}</div>
            </div>
          ))}
          {items.length===0&&<div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No announcements yet.</div>}
        </div>
      )}
      {showForm&&(
        <Modal title={editing?"Edit Announcement":"New Announcement"} onClose={()=>{setShowForm(false);setEditing(null);}}>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={S.input}/></div>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Message</label><textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} style={{...S.input,height:80,resize:"vertical"}}/></div>
          <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.input}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setEditing(null);}} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} disabled={saving} style={S.btn("gold")}>{saving?"Saving…":editing?"Save Changes":"Post"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ConditioningDashboard({players,setPage}){
  const mob=useMobile();
  const [healthReports,setHealthReports]=useState([]);
  const [attendance,setAttendance]=useState([]);
  useEffect(()=>{
    supabase.from("health_reports").select("*").order("date",{ascending:false}).limit(5).then(({data})=>setHealthReports(data||[]));
    supabase.from("attendance").select("*").order("session_date",{ascending:false}).limit(50).then(({data})=>setAttendance(data||[]));
  },[]);
  const today=new Date().toISOString().split("T")[0];
  const todayAtt=attendance.filter(a=>a.session_date===today);
  const present=todayAtt.filter(a=>a.status==="Present").length;
  const injured=players.filter(p=>p.status==="Injured").length;
  const active=players.filter(p=>p.status==="Active").length;
  return(
    <div style={{width:"100%"}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:22,fontWeight:800,margin:0}}>Conditioning Dashboard</h2>
        <p style={{color:BRAND.textSecondary,fontSize:13,margin:"4px 0 0"}}>Strength & Conditioning — Season 2026–27</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:22}}>
        {[
          {icon:"👥",label:"Active Players",value:active,color:BRAND.crimson},
          {icon:"🏋️",label:"Training Today",value:present||"—",color:BRAND.gold},
          {icon:"🏥",label:"Injured",value:injured,color:"#f97316"},
          {icon:"💪",label:"Full Roster",value:players.length,color:"#60a5fa"},
        ].map(({icon,label,value,color})=>(
          <div key={label} style={{...S.statCard}}>
            <div style={{fontSize:26,marginBottom:4}}>{icon}</div>
            <div style={{fontSize:26,fontWeight:800,color}}>{value}</div>
            <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16}}>
        <div style={S.card}>
          <div style={S.cardTitle}>Roster Status</div>
          {players.slice(0,8).map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${BRAND.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {p.photo_url?<img src={p.photo_url} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}}/>:<div style={{width:32,height:32,borderRadius:"50%",background:BRAND.surfaceDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:BRAND.gold}}>{p.name?.charAt(0)}</div>}
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{p.name?.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{fontSize:11,color:BRAND.textSecondary}}>#{p.jersey} · {p.pos}</div>
                </div>
              </div>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:p.status==="Injured"?"rgba(249,115,22,0.15)":p.status==="Active"?"rgba(74,222,128,0.15)":"rgba(148,163,184,0.15)",color:p.status==="Injured"?"#f97316":p.status==="Active"?"#4ade80":"#94a3b8"}}>{p.status||"Active"}</span>
            </div>
          ))}
          {players.length>8&&<div style={{fontSize:12,color:BRAND.textSecondary,textAlign:"center",paddingTop:8,cursor:"pointer"}} onClick={()=>setPage("roster")}>View all {players.length} players →</div>}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Recent Health Reports</div>
          {healthReports.length===0?<div style={{color:BRAND.textSecondary,fontSize:13,textAlign:"center",padding:"20px 0"}}>All players healthy! 💪</div>:healthReports.map(r=>(
            <div key={r.id} style={{padding:"8px 0",borderBottom:`1px solid ${BRAND.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:600,fontSize:13}}>{r.player_name}</div>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:r.severity==="Severe"?"rgba(239,68,68,0.15)":r.severity==="Moderate"?"rgba(249,115,22,0.15)":"rgba(234,179,8,0.15)",color:r.severity==="Severe"?"#ef4444":r.severity==="Moderate"?"#f97316":"#eab308"}}>{r.severity}</span>
              </div>
              <div style={{fontSize:12,color:BRAND.textSecondary,marginTop:2}}>{r.injury}</div>
            </div>
          ))}
          <div style={{marginTop:12,textAlign:"right"}}><button onClick={()=>setPage("health")} style={{...S.btn("secondary"),fontSize:12,padding:"5px 14px"}}>View All Reports</button></div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({players,loading,setPage}){
  const mob=useMobile();
  const [games,setGames]=useState([]);
  const [leagues,setLeagues]=useState([]);
  const [practices,setPractices]=useState([]);
  const [health,setHealth]=useState([]);
  const [announcements,setAnnouncements]=useState([]);
  const [attendance,setAttendance]=useState([]);

  useEffect(()=>{
    supabase.from("games").select("*").order("date",{ascending:true}).then(({data})=>{ if(data)setGames(data); });
    supabase.from("leagues").select("name").order("created_at",{ascending:true}).then(({data})=>{ if(data)setLeagues(data.map(r=>r.name)); });
    supabase.from("practices").select("*").order("date",{ascending:false}).limit(5).then(({data})=>{ if(data)setPractices(data); });
    supabase.from("health_reports").select("*").order("created_at",{ascending:false}).limit(5).then(({data})=>{ if(data)setHealth(data); });
    supabase.from("announcements").select("*").order("created_at",{ascending:false}).limit(3).then(({data})=>{ if(data)setAnnouncements(data); });
    supabase.from("attendance").select("*").order("created_at",{ascending:false}).limit(20).then(({data})=>{ if(data)setAttendance(data); });
  },[]);

  const avgPts=players.length?(players.reduce((a,p)=>a+p.pts,0)/players.length).toFixed(1):0;
  const avgReb=players.length?(players.reduce((a,p)=>a+p.reb,0)/players.length).toFixed(1):0;
  const avgAst=players.length?(players.reduce((a,p)=>a+p.ast,0)/players.length).toFixed(1):0;
  const avgFg=players.length?(players.reduce((a,p)=>a+p.fg,0)/players.length).toFixed(1):0;
  const played=games.filter(g=>g.us!==null&&g.them!==null);
  const wins=played.filter(g=>g.us>g.them).length;
  const upcoming=games.filter(g=>g.us===null||g.them===null);
  const injured=players.filter(p=>p.status==="Injured").length;
  const activeHealth=health.filter(h=>h.status!=="Cleared").length;
  const todayAtt=attendance.filter(a=>a.session_date===new Date().toISOString().split("T")[0]);
  const attRate=todayAtt.length?Math.round(todayAtt.filter(a=>a.status==="Present").length/todayAtt.length*100):null;

  const QuickCard=({icon,title,value,sub,color,onClick,children})=>(
    <div onClick={onClick} style={{...S.card,marginBottom:0,cursor:"pointer",borderLeft:`3px solid ${color||BRAND.border}`,transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.gold;e.currentTarget.style.background="#252525";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=color||BRAND.border;e.currentTarget.style.background=BRAND.surfaceLight;}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:children?12:0}}>
        <div>
          <div style={{fontSize:11,color:BRAND.textSecondary,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
            <span>{icon}</span><span style={{textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{title}</span>
          </div>
          <div style={{fontSize:28,fontWeight:800,color:color||BRAND.gold,lineHeight:1}}>{value}</div>
          {sub&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:3}}>{sub}</div>}
        </div>
        <span style={{fontSize:18,color:BRAND.textSecondary,marginTop:2}}>→</span>
      </div>
      {children}
    </div>
  );

  return(
    <div>
      {/* Hero Banner */}
      <div style={{background:`linear-gradient(135deg,${BRAND.crimsonDark},${BRAND.charcoal})`,border:`1px solid ${BRAND.crimson}55`,borderRadius:12,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <TitansLogo size={52}/>
          <div>
            <div style={{fontSize:11,color:BRAND.gold,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}>Enderun Titans</div>
            <div style={{fontSize:26,fontWeight:800,color:BRAND.textPrimary,lineHeight:1}}>Men's Basketball</div>
            <div style={{fontSize:12,color:BRAND.textSecondary}}>Season 2026–27 · Click any card to navigate</div>
          </div>
        </div>
        <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
          {[["Players",players.length],["Record",played.length?`${wins}–${played.length-wins}`:"—"],["PPG",avgPts]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:BRAND.gold}}>{v}</div><div style={{fontSize:11,color:BRAND.textSecondary}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Team Stats Row */}
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {players.length>0&&[
          {l:"Scoring Leader",v:[...players].sort((a,b)=>b.pts-a.pts)[0]?.pts,name:[...players].sort((a,b)=>b.pts-a.pts)[0]?.name?.split(" ").slice(0,2).join(" "),unit:"PPG"},
          {l:"Rebounding Leader",v:[...players].sort((a,b)=>b.reb-a.reb)[0]?.reb,name:[...players].sort((a,b)=>b.reb-a.reb)[0]?.name?.split(" ").slice(0,2).join(" "),unit:"RPG"},
          {l:"Assists Leader",v:[...players].sort((a,b)=>b.ast-a.ast)[0]?.ast,name:[...players].sort((a,b)=>b.ast-a.ast)[0]?.name?.split(" ").slice(0,2).join(" "),unit:"APG"},
          {l:"FG% Leader",v:`${[...players].sort((a,b)=>b.fg-a.fg)[0]?.fg}%`,name:[...players].sort((a,b)=>b.fg-a.fg)[0]?.name?.split(" ").slice(0,2).join(" "),unit:"FG%"},
        ].map(({l,v,name,unit})=>(
          <div key={l} style={{...S.statCard,textAlign:"left",padding:"14px 16px"}}>
            <div style={{fontSize:10,color:BRAND.textSecondary,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{v}</div>
            <div style={{fontSize:12,color:BRAND.textSecondary,marginTop:2}}>{unit}</div>
            <div style={{fontSize:12,fontWeight:600,color:BRAND.textPrimary,marginTop:6,borderTop:`1px solid ${BRAND.border}`,paddingTop:6}}>{name}</div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Cards Grid */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:16,marginBottom:16}}>

        {/* Roster Card */}
        <QuickCard icon="👥" title="Roster" value={players.filter(p=>p.status==="Active").length} sub={`${players.length} total · ${injured} injured`} color={BRAND.crimson} onClick={()=>setPage("roster")}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {players.slice(0,4).map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Avatar initials={p.photo||"??"} size={24}/>
                  <span style={{fontSize:12,fontWeight:600}}>{p.name.split(" ").slice(0,2).join(" ")}</span>
                </div>
                <span style={S.pill(p.status)}>{p.status}</span>
              </div>
            ))}
            {players.length>4&&<div style={{fontSize:11,color:BRAND.textSecondary,textAlign:"center"}}>+{players.length-4} more players →</div>}
          </div>
        </QuickCard>

        {/* League Card */}
        <QuickCard icon="🏆" title="League" value={played.length?`${wins}–${played.length-wins}`:"—"} sub={`${leagues.length} league${leagues.length!==1?"s":""} · ${upcoming.length} upcoming`} color={BRAND.gold} onClick={()=>setPage("league")}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {leagues.length>0?(
              leagues.map(league=>{
                const lg=games.filter(g=>g.type===league);
                const lgPlayed=lg.filter(g=>g.us!==null&&g.them!==null);
                const lgWins=lgPlayed.filter(g=>g.us>g.them).length;
                const lgLosses=lgPlayed.length-lgWins;
                return(
                  <div key={league} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",borderRadius:7,background:`${BRAND.border}55`}}>
                    <div style={{fontSize:12,fontWeight:600,color:BRAND.textPrimary}}>🏆 {league}</div>
                    <div style={{fontSize:12,fontWeight:700,color:lgPlayed.length?(lgWins>lgLosses?BRAND.gold:BRAND.crimsonLight):BRAND.textSecondary}}>
                      {lgPlayed.length?`${lgWins}W – ${lgLosses}L`:"No results"}
                    </div>
                  </div>
                );
              })
            ):(
              <div style={{fontSize:12,color:BRAND.textSecondary,textAlign:"center"}}>No leagues yet</div>
            )}
            {upcoming.length>0&&(
              <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:2}}>{upcoming.length} upcoming game{upcoming.length!==1?"s":""} →</div>
            )}
          </div>
        </QuickCard>

        {/* Practice Card */}
        <QuickCard icon="🏋️" title="Practice" value={practices.length} sub="sessions scheduled" color="#a78bfa" onClick={()=>setPage("practice")}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {practices.slice(0,3).map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{p.type}</div>
                  <div style={{fontSize:10,color:BRAND.textSecondary}}>{p.date} · {p.time}</div>
                </div>
                <span style={{fontSize:10,color:"#a78bfa"}}>📍 {p.location?.split(" ")[0]}</span>
              </div>
            ))}
            {practices.length===0&&<div style={{fontSize:12,color:BRAND.textSecondary,textAlign:"center"}}>No sessions yet</div>}
          </div>
        </QuickCard>
      </div>

      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:16,marginBottom:16}}>

        {/* Attendance Card */}
        <QuickCard icon="✅" title="Attendance" value={attRate!==null?`${attRate}%`:"—"} sub={attRate!==null?`Today · ${todayAtt.length} records`:"No session today"} color="#4ade80" onClick={()=>setPage("attendance")}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
            {["Present","Late","Excused","Absent"].map(s=>{
              const count=todayAtt.filter(a=>a.status===s).length;
              const c={Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"}[s];
              return count>0?(
                <div key={s} style={{flex:1,textAlign:"center",background:`${c}11`,borderRadius:8,padding:"6px 4px"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{count}</div>
                  <div style={{fontSize:10,color:BRAND.textSecondary}}>{s}</div>
                </div>
              ):null;
            })}
            {todayAtt.length===0&&<div style={{fontSize:12,color:BRAND.textSecondary,width:"100%",textAlign:"center"}}>No attendance recorded today</div>}
          </div>
        </QuickCard>

        {/* Health Card */}
        <QuickCard icon="🏥" title="Health Report" value={activeHealth} sub={`active reports · ${health.filter(h=>h.status==="Recovering").length} recovering`} color="#fb923c" onClick={()=>setPage("health")}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {health.filter(h=>h.status!=="Cleared").slice(0,3).map(h=>(
              <div key={h.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{h.player_name?.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{fontSize:10,color:BRAND.textSecondary}}>{h.injury?.slice(0,30)}</div>
                </div>
                <span style={{fontSize:10,padding:"2px 6px",borderRadius:6,background:{Mild:"#60a5fa22",Moderate:"#facc1522",Severe:"#f8717122"}[h.severity],color:{Mild:"#60a5fa",Moderate:"#facc15",Severe:"#f87171"}[h.severity]}}>{h.severity}</span>
              </div>
            ))}
            {activeHealth===0&&<div style={{fontSize:12,color:"#4ade80",textAlign:"center"}}>All players healthy! 💪</div>}
          </div>
        </QuickCard>

        {/* Stats Card */}
        <QuickCard icon="📊" title="Statistics" value={`#1`} sub={`${players.length>0?[...players].sort((a,b)=>b.pts-a.pts)[0]?.name?.split(" ").slice(0,2).join(" "):"—"} leads scoring`} color="#60a5fa" onClick={()=>setPage("stats")}>
          {loading?<div style={{fontSize:12,color:BRAND.textSecondary}}>Loading…</div>:(
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={[...players].sort((a,b)=>b.pts-a.pts).slice(0,5).map(p=>({name:p.name.split(" ").pop(),pts:p.pts}))}>
                <XAxis dataKey="name" tick={{fill:BRAND.textSecondary,fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:8,color:BRAND.textPrimary,fontSize:11}}/>
                <Bar dataKey="pts" fill={BRAND.crimson} radius={[3,3,0,0]}>
                  {[...players].sort((a,b)=>b.pts-a.pts).slice(0,5).map((_,i)=><Cell key={i} fill={i===0?BRAND.gold:BRAND.crimson}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </QuickCard>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Announcements Card */}
        <QuickCard icon="📢" title="Announcements" value={announcements.length} sub="recent posts" color="#fbbf24" onClick={()=>setPage("announcements")}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {announcements.slice(0,3).map(a=>{
              const tc={Practice:"#60a5fa",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};
              return(
                <div key={a.id} style={{padding:"6px 0",borderBottom:`1px solid ${BRAND.border}22`}}>
                  <div style={{display:"flex",gap:6,marginBottom:3}}>
                    <span style={{fontSize:10,fontWeight:700,color:tc[a.type]||"#aaa"}}>{a.type}</span>
                    <span style={{fontSize:10,color:BRAND.textSecondary}}>{a.date}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:BRAND.textPrimary}}>{a.title}</div>
                </div>
              );
            })}
            {announcements.length===0&&<div style={{fontSize:12,color:BRAND.textSecondary,textAlign:"center"}}>No announcements yet</div>}
          </div>
        </QuickCard>

        {/* Playbook Card */}
        <QuickCard icon="📖" title="Playbook" value="→" sub="View & animate plays" color={BRAND.gold} onClick={()=>setPage("playbook")}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
            {["Offense","Defense","Set Plays","Transition"].map(cat=>(
              <div key={cat} onClick={e=>{e.stopPropagation();setPage("playbook");}} style={{flex:1,minWidth:80,textAlign:"center",background:`${BRAND.crimson}22`,borderRadius:8,padding:"8px 4px",cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:600,color:BRAND.crimsonLight}}>{cat}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:12,color:BRAND.textSecondary,textAlign:"center"}}>Draw plays · Add frame breakdown · Animate</div>
        </QuickCard>
      </div>
    </div>
  );
}

function PlayerDashboard({player,players,setPage}){
  const mob=useMobile();
  const [practices,setPractices]=useState([]);
  const [games,setGames]=useState([]);
  const [leagues,setLeagues]=useState([]);
  const [attendance,setAttendance]=useState([]);
  const [announcements,setAnnouncements]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const today=new Date(); today.setHours(0,0,0,0);
    Promise.all([
      supabase.from("practices").select("*").order("date",{ascending:true}),
      supabase.from("games").select("*").order("date",{ascending:true}),
      supabase.from("leagues").select("*").order("created_at",{ascending:false}),
      supabase.from("attendance").select("*").eq("player_id",player.id).order("created_at",{ascending:false}).limit(20),
      supabase.from("announcements").select("*").order("created_at",{ascending:false}).limit(3),
    ]).then(([p,g,l,a,ann])=>{
      const now=new Date();
      const parseTime=t=>{if(!t)return 0;const m=t.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!m)return 0;let[,h,min,ap]=m;h=parseInt(h);min=parseInt(min);if(ap.toUpperCase()==="PM"&&h!==12)h+=12;if(ap.toUpperCase()==="AM"&&h===12)h=0;return h*60+min;};
      const isPracticeUpcoming=x=>{const dt=new Date(x.date+"T00:00:00");const dStr=x.date;const todayStr=now.toISOString().split("T")[0];if(dStr>todayStr)return true;if(dStr<todayStr)return false;const mins=parseTime(x.time);const nowMins=now.getHours()*60+now.getMinutes();return mins>nowMins;};
      const todayStr=now.toISOString().split("T")[0];
      setPractices((p.data||[]).filter(isPracticeUpcoming).slice(0,4));
      setGames((g.data||[]).filter(x=>x.date>=todayStr));
      setLeagues(l.data||[]);
      setAttendance(a.data||[]);
      setAnnouncements(ann.data||[]);
      setLoading(false);
    });
  },[player.id]);

  if(loading) return <Spinner/>;

  const today=new Date(); today.setHours(0,0,0,0);
  const playedGames=games.filter(g=>g.us!=null&&g.them!=null);
  const wins=playedGames.filter(g=>g.us>g.them).length;
  const losses=playedGames.filter(g=>g.us<g.them).length;
  const upcomingGames=games.filter(g=>new Date(g.date+"T00:00:00")>=today);

  const activePlayers=players.filter(p=>p.status==="Active"&&p.pts!=null);
  const teamAvg=activePlayers.length?{
    pts:parseFloat((activePlayers.reduce((s,p)=>s+(parseFloat(p.pts)||0),0)/activePlayers.length).toFixed(1)),
    reb:parseFloat((activePlayers.reduce((s,p)=>s+(parseFloat(p.reb)||0),0)/activePlayers.length).toFixed(1)),
    ast:parseFloat((activePlayers.reduce((s,p)=>s+(parseFloat(p.ast)||0),0)/activePlayers.length).toFixed(1)),
    fg:parseFloat((activePlayers.reduce((s,p)=>s+(parseFloat(p.fg)||0),0)/activePlayers.length).toFixed(1)),
    threept:parseFloat((activePlayers.reduce((s,p)=>s+(parseFloat(p.threept)||0),0)/activePlayers.length).toFixed(1)),
  }:{pts:0,reb:0,ast:0,fg:0,threept:0};

  const ppg=parseFloat(player.pts)||0;
  const rpg=parseFloat(player.reb)||0;
  const apg=parseFloat(player.ast)||0;
  const fgp=parseFloat(player.fg)||0;
  const tpp=parseFloat(player.threept)||0;

  const attRate=attendance.length?Math.round((attendance.filter(a=>a.status==="Present").length/attendance.length)*100):null;
  const nextPractice=practices[0];
  const myRank=activePlayers.filter(p=>parseFloat(p.pts||0)>ppg).length+1;

  const fmtDate=d=>{const dt=new Date(d+"T00:00:00");return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});};

  const Bar=({mine,team,max})=>{
    const mPct=max>0?Math.min(100,(mine/max)*100):0;
    const tPct=max>0?Math.min(100,(team/max)*100):0;
    return(
      <div style={{position:"relative",height:6,background:"#1a1a1a",borderRadius:3,margin:"4px 0 12px"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${tPct}%`,background:"#333",borderRadius:3}}/>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${mPct}%`,background:`linear-gradient(90deg,${BRAND.crimson},${BRAND.gold})`,borderRadius:3}}/>
      </div>
    );
  };

  const tcolors={Practice:"#60a5fa",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};

  return(
    <div style={{width:"100%"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h1 style={{fontSize:18,fontWeight:700,margin:0}}>Dashboard</h1>
          <div style={{fontSize:11,color:BRAND.textSecondary,marginTop:2}}>{player.name}</div>
        </div>
        {activePlayers.length>0&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:10,background:`${BRAND.gold}22`,color:BRAND.gold,fontWeight:700,whiteSpace:"nowrap"}}>#{myRank} Scorer</span>}
      </div>

      {/* Quick Stats Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
        <div style={{...S.card,marginBottom:0,textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:26,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{ppg.toFixed(1)}</div>
          <div style={{fontSize:10,color:BRAND.textSecondary,marginTop:4}}>PPG · Points per game</div>
        </div>
        <div style={{...S.card,marginBottom:0,textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:26,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{attRate!=null?`${attRate}%`:"—"}</div>
          <div style={{fontSize:10,color:BRAND.textSecondary,marginTop:4}}>Attendance ({attendance.length} sessions)</div>
        </div>
        <div style={{...S.card,marginBottom:0,textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:26,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{wins}-{losses}</div>
          <div style={{fontSize:10,color:BRAND.textSecondary,marginTop:4}}>Team Record W-L</div>
        </div>
        <div style={{...S.card,marginBottom:0,textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:22,fontWeight:800,color:BRAND.gold,lineHeight:1}}>{nextPractice?fmtDate(nextPractice.date):"—"}</div>
          <div style={{fontSize:10,color:BRAND.textSecondary,marginTop:4}}>{nextPractice?`${nextPractice.type||"Practice"} · Next`:"No upcoming practice"}</div>
        </div>
      </div>

      {/* My Stats vs Team */}
      <div style={{...S.card,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>📊 My Stats vs Team Average</div>
        {[
          {label:"PTS",mine:ppg,team:teamAvg.pts,max:Math.max(ppg,teamAvg.pts,20)},
          {label:"REB",mine:rpg,team:teamAvg.reb,max:Math.max(rpg,teamAvg.reb,15)},
          {label:"AST",mine:apg,team:teamAvg.ast,max:Math.max(apg,teamAvg.ast,10)},
          {label:"FG%",mine:fgp,team:teamAvg.fg,max:100},
          {label:"3PT%",mine:tpp,team:teamAvg.threept,max:100},
        ].map(({label,mine,team,max})=>(
          <div key={label}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
              <span style={{color:BRAND.textSecondary,fontWeight:600}}>{label}</span>
              <span><span style={{color:BRAND.gold,fontWeight:700}}>{mine}</span><span style={{color:"#555",fontSize:11}}> / avg {team}</span></span>
            </div>
            <Bar mine={mine} team={team} max={max}/>
          </div>
        ))}
        <div style={{display:"flex",gap:16,fontSize:10,color:"#555",marginTop:4}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:4,borderRadius:2,background:`linear-gradient(90deg,${BRAND.crimson},${BRAND.gold})`,display:"inline-block"}}/>Me</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:4,borderRadius:2,background:"#333",display:"inline-block"}}/>Team avg</span>
        </div>
      </div>

      {/* Upcoming Schedule — practices + games combined */}
      <div style={{...S.card,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700}}>📅 Upcoming Schedule</div>
          <button onClick={()=>setPage("schedule")} style={{background:"none",border:"none",color:BRAND.gold,fontSize:11,cursor:"pointer",fontWeight:600}}>Full schedule →</button>
        </div>
        {(()=>{
          const upcoming=[
            ...practices.map(p=>({...p,kind:"Practice",title:p.type||"Practice",sub:[p.time,p.location].filter(Boolean).join(" · "),_date:new Date(p.date+"T00:00:00")})),
            ...upcomingGames.slice(0,5).map(g=>({...g,kind:g.type?"League Game":"Game",title:`vs ${g.opp||"TBD"}`,sub:[g.type,g.venue].filter(Boolean).join(" · "),_date:new Date(g.date+"T00:00:00")})),
          ].sort((a,b)=>a._date-b._date).slice(0,6);
          if(upcoming.length===0) return <div style={{fontSize:12,color:BRAND.textSecondary}}>No upcoming events scheduled.</div>;
          return upcoming.map((ev,i)=>{
            const isGame=ev.kind==="Game"||ev.kind==="League Game";
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<upcoming.length-1?"1px solid #1a1a1a":"none"}}>
                <div style={{minWidth:46,textAlign:"center",background:isGame?"#1f0a0a":"#1a1040",borderRadius:8,padding:"5px 6px",flexShrink:0}}>
                  <div style={{fontSize:9,color:isGame?BRAND.crimsonLight:"#a78bfa",fontWeight:600,textTransform:"uppercase"}}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][ev._date.getDay()]}</div>
                  <div style={{fontSize:16,color:isGame?BRAND.gold:"#c4b5fd",fontWeight:800,lineHeight:1.1}}>{ev._date.getDate()}</div>
                  <div style={{fontSize:8,color:"#555",textTransform:"uppercase"}}>{ev._date.toLocaleString("en",{month:"short"})}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4,background:isGame?`${BRAND.crimson}33`:`${BRAND.border}55`,color:isGame?BRAND.crimsonLight:BRAND.textSecondary}}>{ev.kind}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.title}</div>
                  {ev.sub&&<div style={{fontSize:11,color:BRAND.textSecondary}}>{ev.sub}</div>}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Leagues & Tournaments */}
      {leagues.length>0&&(
      <div style={{...S.card,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>🏆 Leagues & Tournaments</div>
        {leagues.map((lg,li)=>{
          const lgGames=games.filter(g=>g.type===lg.name);
          const played=lgGames.filter(g=>g.us!=null&&g.them!=null);
          const lgWins=played.filter(g=>g.us>g.them).length;
          const lgNext=lgGames.filter(g=>new Date(g.date+"T00:00:00")>=today).slice(0,2);
          return(
            <div key={lg.id} style={{marginBottom:li<leagues.length-1?12:0,paddingBottom:li<leagues.length-1?12:0,borderBottom:li<leagues.length-1?"1px solid #1a1a1a":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700,color:BRAND.gold}}>{lg.name}</div>
                {played.length>0&&<span style={{fontSize:11,fontWeight:700,color:lgWins>played.length-lgWins?"#4ade80":BRAND.crimsonLight}}>{lgWins}W – {played.length-lgWins}L</span>}
              </div>
              {lgNext.length===0
                ?<div style={{fontSize:11,color:"#555"}}>No upcoming games in this league</div>
                :lgNext.map(g=>(
                  <div key={g.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,padding:"4px 0",color:BRAND.textSecondary}}>
                    <span style={{minWidth:56,color:BRAND.gold,fontWeight:600}}>{fmtDate(g.date)}</span>
                    <span>vs <strong style={{color:BRAND.textPrimary}}>{g.opp||"TBD"}</strong></span>
                    {g.venue&&<span style={{fontSize:10,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {g.venue}</span>}
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>
      )}

      {/* Announcements */}
      {announcements.length>0&&(
        <div style={{...S.card,marginBottom:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>📢 Announcements</div>
            <button onClick={()=>setPage("announcements")} style={{background:"none",border:"none",color:BRAND.gold,fontSize:11,cursor:"pointer",fontWeight:600}}>View all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {announcements.map(a=>(
              <div key={a.id} style={{background:"#111",borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${tcolors[a.type]||"#888"}`}}>
                <div style={{display:"flex",gap:8,marginBottom:4}}>
                  <span style={{fontSize:10,color:tcolors[a.type]||"#888",fontWeight:700}}>{a.type}</span>
                  <span style={{fontSize:10,color:"#555"}}>{a.date}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{a.title}</div>
                <div style={{fontSize:12,color:BRAND.textSecondary,lineHeight:1.5}}>{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function MyProfile({player,loadPlayers}){
  const mob=useMobile();
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({phone:player.phone||"",email:player.email||"",height:player.height||"",weight:player.weight||""});
  const [saving,setSaving]=useState(false);
  const [photoFile,setPhotoFile]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);
  const [uploadingPhoto,setUploadingPhoto]=useState(false);
  const p=player;

  const handlePhotoChange=e=>{
    const file=e.target.files[0];
    if(!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto=async()=>{
    if(!photoFile||!p.id) return;
    setUploadingPhoto(true);
    const ext=photoFile.name.split(".").pop();
    const path=`players/${p.id}.${ext}`;
    const{error}=await supabase.storage.from("player-photos").upload(path,photoFile,{upsert:true});
    if(!error){
      const{data}=supabase.storage.from("player-photos").getPublicUrl(path);
      await supabase.from("players").update({photo_url:data.publicUrl}).eq("id",p.id);
      await loadPlayers();
    }
    setUploadingPhoto(false); setPhotoFile(null); setPhotoPreview(null);
  };

  const save=async()=>{
    setSaving(true);
    await supabase.from("players").update({phone:form.phone,email:form.email,height:form.height,weight:form.weight}).eq("id",p.id);
    if(photoFile) await uploadPhoto();
    setSaving(false); setEditing(false); loadPlayers();
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>My Profile</h1>
        <button onClick={()=>setEditing(!editing)} style={S.btn("gold")}>{editing?"Cancel":"✏️ Edit My Info"}</button>
      </div>
      {editing?(
        <div style={S.card}>
          <div style={{marginBottom:14,padding:"10px 14px",background:`${BRAND.crimson}22`,borderRadius:8,fontSize:13,color:BRAND.crimsonLight}}>
            ℹ️ You can update your contact info, height, weight and profile photo. Stats are managed by the coaching staff.
          </div>
          {/* Photo upload */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:18,padding:"12px 16px",background:BRAND.charcoal,borderRadius:10}}>
            <Avatar initials={p.photo||"??"} size={60} color={BRAND.gold} photoUrl={photoPreview||p.photo_url||null}/>
            <div>
              <div style={{fontSize:11,color:BRAND.textSecondary,marginBottom:6}}>PHOTO DE PROFIL</div>
              <label style={{...S.btn("secondary"),padding:"6px 14px",fontSize:12,cursor:"pointer",display:"inline-block"}}>
                📷 {uploadingPhoto?"Uploading…":"Changer ma photo"}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoChange}/>
              </label>
              {photoPreview&&<div style={{fontSize:11,color:"#4ade80",marginTop:4}}>✅ Photo sélectionnée — sera sauvegardée avec vos infos</div>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            {[["Phone","phone"],["Email","email"],["Height","height"],["Weight","weight"]].map(([l,f])=>(
              <div key={f} style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>{l}</label>
                <input value={form[f]} onChange={e=>setForm(fm=>({...fm,[f]:e.target.value}))} style={S.input}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setEditing(false);setPhotoFile(null);setPhotoPreview(null);}} style={S.btn("secondary")}>Cancel</button>
            <button onClick={save} disabled={saving||uploadingPhoto} style={S.btn("gold")}>{saving||uploadingPhoto?"Saving…":"Save Changes"}</button>
          </div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"260px 1fr",gap:20}}>
          <div style={S.card}>
            <div style={{textAlign:"center"}}>
              <Avatar initials={p.photo||"??"} size={72} color={BRAND.gold} photoUrl={p.photo_url||null}/>
              <div style={{fontWeight:700,fontSize:17,marginTop:10}}>{p.name}</div>
              <div style={{color:BRAND.textSecondary,fontSize:12}}>#{p.jersey} · {p.pos}</div>
              <span style={{...S.pill(p.status),marginTop:8,display:"inline-block"}}>{p.status}</span>
            </div>
            <div style={{marginTop:14,display:"grid",gap:7}}>
              {[["Year",p.yr],["Height",p.height],["Weight",p.weight],["Nationality",p.nationality],["Course",p.course],["Birthplace",p.birthplace]].map(([l,v])=>v?(
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
            <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:10}}>
              {[["PTS",p.pts,"ppg"],["REB",p.reb,"rpg"],["AST",p.ast,"apg"],["FG%",`${p.fg}%`,""],["3PT%",`${p.threept}%`,""],["FT%",`${p.ft}%`,""]].map(([l,v,s])=>(
                <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l} {s}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyStats({player:p}){
  const mob=useMobile();
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:20}}>My Statistics</h1>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {[["PTS",p.pts,"per game"],["REB",p.reb,"per game"],["AST",p.ast,"per game"],["FG%",`${p.fg}%`,"field goals"],["3PT%",`${p.threept}%`,"three-point"],["FT%",`${p.ft}%`,"free throws"]].map(([l,v,s])=>(
          <div key={l} style={S.statCard}><div style={S.statVal}>{v}</div><div style={S.statLabel}>{l}</div><div style={{fontSize:10,color:BRAND.textSecondary,marginTop:2}}>{s}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:12}}>
        {[["GP",p.gp],["STL",p.stl],["BLK",p.blk],["TO",p.to_]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={{...S.statVal,fontSize:20}}>{v}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>
    </div>
  );
}

function MyAttendance({player}){
  const mob=useMobile();
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(true);
  const sColors={Present:"#4ade80",Late:"#facc15",Excused:"#60a5fa",Absent:"#f87171"};

  useEffect(()=>{
    if(!player?.id) return;
    supabase.from("attendance").select("*").eq("player_id",player.id).order("created_at",{ascending:false}).then(({data})=>{ if(data)setHistory(data); setLoading(false); });
  },[player?.id]);

  const present=history.filter(h=>h.status==="Present").length;
  const late=history.filter(h=>h.status==="Late").length;
  const excused=history.filter(h=>h.status==="Excused").length;
  const absent=history.filter(h=>h.status==="Absent").length;
  const total=history.length;
  const rate=total?Math.round((present+late*0.5)/total*100):0;

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>My Attendance</h1>
      <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:20}}>Your attendance record — managed by the coaching staff.</p>

      <div style={{...S.card,display:"flex",alignItems:"center",gap:20,marginBottom:18}}>
        <Avatar initials={player?.photo||"??"} size={56} color={BRAND.gold}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:16}}>{player?.name}</div>
          <div style={{fontSize:12,color:BRAND.textSecondary,marginBottom:10}}>{player?.pos} · #{player?.jersey}</div>
          <div style={{height:8,background:BRAND.border,borderRadius:4}}>
            <div style={{width:`${rate}%`,height:"100%",background:rate>=90?BRAND.gold:rate>=75?BRAND.crimson:"#f87171",borderRadius:4,transition:"width 0.5s"}}/>
          </div>
          <div style={{fontSize:12,color:rate>=90?BRAND.gold:BRAND.textSecondary,marginTop:4,fontWeight:600}}>{rate}% attendance rate · {total} sessions recorded</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[["Present",present,"#4ade80"],["Late",late,"#facc15"],["Excused",excused,"#60a5fa"],["Absent",absent,"#f87171"]].map(([l,v,c])=>(
          <div key={l} style={{...S.statCard,borderTop:`3px solid ${c}`}}>
            <div style={{...S.statVal,color:c,fontSize:24}}>{v}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Attendance History</div>
        {loading?<div style={{textAlign:"center",padding:20,color:BRAND.textSecondary}}>Loading…</div>
        :history.length===0?(
          <div style={{textAlign:"center",color:BRAND.textSecondary,padding:20}}>No attendance records yet.</div>
        ):(
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Date</th>
              <th style={S.th}>Session</th>
              <th style={S.th}>Status</th>
            </tr></thead>
            <tbody>{history.map(h=>(
              <tr key={h.id}>
                <td style={S.td}>{h.session_date}</td>
                <td style={S.td}>{h.session_type}</td>
                <td style={S.td}>
                  <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:`${sColors[h.status]||"#aaa"}22`,color:sColors[h.status]||"#aaa"}}>{h.status}</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MyHealth({player}){
  const mob=useMobile();
  const [reports,setReports]=useState([]);
  const [loading,setLoading]=useState(true);
  const sevColor={Mild:"#60a5fa",Moderate:"#facc15",Severe:"#f87171"};

  useEffect(()=>{
    if(!player?.id) return;
    supabase.from("health_reports").select("*").eq("player_id",player.id).order("created_at",{ascending:false}).then(({data})=>{ if(data)setReports(data); setLoading(false); });
  },[player?.id]);

  const active=reports.filter(r=>r.status!=="Cleared");
  const cleared=reports.filter(r=>r.status==="Cleared");

  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:6}}>My Health Records</h1>
      <p style={{color:BRAND.textSecondary,fontSize:13,marginBottom:20}}>Health and injury records managed by the coaching staff.</p>

      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[["Total Reports",reports.length,BRAND.textSecondary],["Active",active.length,"#fb923c"],["Cleared",cleared.length,"#4ade80"]].map(([l,v,c])=>(
          <div key={l} style={S.statCard}>
            <div style={{...S.statVal,color:c,fontSize:24}}>{v}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:30,color:BRAND.textSecondary}}>Loading…</div>
      ):reports.length===0?(
        <div style={{...S.card,textAlign:"center",padding:"30px 20px"}}>
          <div style={{fontSize:40,marginBottom:10}}>💪</div>
          <div style={{fontSize:15,fontWeight:600,color:"#4ade80"}}>No health reports on file</div>
          <div style={{fontSize:13,color:BRAND.textSecondary,marginTop:6}}>Stay healthy and keep performing!</div>
        </div>
      ):(
        <div style={{display:"grid",gap:12}}>
          {reports.map(r=>(
            <div key={r.id} style={{...S.card,marginBottom:0,borderLeft:`3px solid ${sevColor[r.severity]||BRAND.border}`}}>
              <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:700,color:sevColor[r.severity],background:`${sevColor[r.severity]}22`,padding:"2px 10px",borderRadius:10}}>{r.severity}</span>
                <span style={S.pill(r.status)}>{r.status}</span>
                <span style={{fontSize:11,color:BRAND.textSecondary,marginLeft:"auto"}}>📅 {r.date}</span>
              </div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>🩹 {r.injury}</div>
              {r.return_date&&<div style={{fontSize:12,color:BRAND.textSecondary}}>Est. Return: {r.return_date}</div>}
              {r.notes&&<div style={{fontSize:12,color:BRAND.textSecondary,marginTop:4}}>📝 {r.notes}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{...S.card,marginTop:20,background:"#1a2a40",borderColor:"#1e3a5f"}}>
        <div style={{fontSize:13,color:"#60a5fa",lineHeight:1.7}}>
          ℹ️ Health records are managed by the Head Coach and Team Manager. If you have an injury or health concern, please report it directly to your coaching staff.
        </div>
      </div>
    </div>
  );
}

function PlayerSchedule(){
  const [practices,setPractices]=useState([]);
  const [games,setGames]=useState([]);
  const [leagues,setLeagues]=useState([]);
  const [tab,setTab]=useState("practices");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      supabase.from("practices").select("*").order("date"),
      supabase.from("games").select("*").order("date"),
      supabase.from("leagues").select("*").order("created_at"),
    ]).then(([p,g,l])=>{
      setPractices(p.data||[]);
      setGames(g.data||[]);
      setLeagues(l.data||[]);
      setLoading(false);
    });
  },[]);

  const now=new Date();
  const todayStr=now.toISOString().split("T")[0];
  const today=new Date(); today.setHours(0,0,0,0);
  const parseTime=t=>{if(!t)return 0;const m=t.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!m)return 0;let[,h,min,ap]=m;h=parseInt(h);min=parseInt(min);if(ap.toUpperCase()==="PM"&&h!==12)h+=12;if(ap.toUpperCase()==="AM"&&h===12)h=0;return h*60+min;};
  const isPracticeUpcoming=p=>{if(p.date>todayStr)return true;if(p.date<todayStr)return false;return parseTime(p.time)>now.getHours()*60+now.getMinutes();};

  const upcomingPractices=practices.filter(isPracticeUpcoming).map(p=>({...p,kind:"Practice",title:p.type||"Practice",subtitle:[p.time,p.location].filter(Boolean).join(" · "),_date:new Date(p.date+"T00:00:00")}));
  const allGames=games.map(g=>({...g,kind:g.type?"League Game":"Game",title:`vs ${g.opp||"TBD"}`,subtitle:[g.type,g.venue,g.home_away].filter(Boolean).join(" · "),_date:new Date(g.date+"T00:00:00")})).sort((a,b)=>b._date-a._date);
  const upcomingGames=allGames.filter(g=>g.date>=todayStr);
  const pastPractices=practices.filter(p=>!isPracticeUpcoming(p)).map(p=>({...p,kind:"Practice",title:p.type||"Practice",subtitle:[p.time,p.location].filter(Boolean).join(" · "),_date:new Date(p.date+"T00:00:00")})).sort((a,b)=>b._date-a._date);

  const kindColor={Practice:BRAND.textSecondary,"Game":BRAND.gold,"League Game":BRAND.crimsonLight};
  const kindBg={Practice:`${BRAND.border}55`,"Game":`${BRAND.gold}22`,"League Game":`${BRAND.crimson}33`};
  const barColor={Practice:BRAND.border,"Game":BRAND.gold,"League Game":BRAND.crimson};

  const leagueNames=leagues.map(l=>l.name);
  const shown=tab==="practices"?upcomingPractices:tab==="games"?allGames:pastPractices;

  const TABS=[
    {id:"practices",label:"🏋️ Practices",count:upcomingPractices.length},
    {id:"games",label:"🏀 Games",count:allGames.length},
    {id:"past",label:"📋 Past Practices",count:pastPractices.length},
  ];

  return(
    <div>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>Team Schedule</h1>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:16,borderBottom:`1px solid ${BRAND.border}`,paddingBottom:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:"none",color:tab===t.id?BRAND.gold:BRAND.textSecondary,borderBottom:tab===t.id?`2px solid ${BRAND.gold}`:"2px solid transparent",marginBottom:-1,transition:"all 0.15s"}}>
            {t.label}{t.count!=null?` (${t.count})`:""}
          </button>
        ))}
      </div>

      {/* League overview pills — only on Games tab */}
      {tab==="games"&&leagueNames.length>0&&(
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {leagueNames.map(name=>{
            const lg=games.filter(g=>g.type===name);
            const played=lg.filter(g=>g.us!=null&&g.them!=null);
            const wins=played.filter(g=>g.us>g.them).length;
            return(
              <div key={name} style={{...S.card,marginBottom:0,padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:13}}>🏆</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:BRAND.gold}}>{name}</div>
                  <div style={{fontSize:10,color:BRAND.textSecondary}}>{played.length?`${wins}W–${played.length-wins}L`:"Season ongoing"} · {lg.length} game{lg.length!==1?"s":""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading?<Spinner/>:shown.length===0?(
        <div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No events to show.</div>
      ):(
        <div style={{display:"grid",gap:10}}>
          {shown.map((ev,i)=>{
            const isPast=ev._date<today;
            const hasResult=ev.us!=null&&ev.them!=null;
            return(
              <div key={i} style={{...S.card,marginBottom:0,display:"flex",alignItems:"center",gap:14,opacity:isPast?0.7:1}}>
                <div style={{width:44,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:9,color:BRAND.textSecondary,textTransform:"uppercase",fontWeight:600}}>{ev._date.toLocaleString("en",{month:"short"})}</div>
                  <div style={{fontSize:22,fontWeight:800,color:isPast?BRAND.textSecondary:kindColor[ev.kind]||BRAND.gold,lineHeight:1}}>{ev._date.getDate()}</div>
                  <div style={{fontSize:9,color:BRAND.textSecondary}}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][ev._date.getDay()]}</div>
                </div>
                <div style={{width:2,height:46,background:barColor[ev.kind]||BRAND.border,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:700,background:kindBg[ev.kind]||`${BRAND.border}55`,color:kindColor[ev.kind]||BRAND.textSecondary,whiteSpace:"nowrap"}}>{ev.kind}</span>
                    {isPast&&hasResult&&<span style={{fontSize:11,fontWeight:700,color:ev.us>ev.them?"#4ade80":BRAND.crimsonLight}}>{ev.us>ev.them?"W":"L"} {ev.us}–{ev.them}</span>}
                    {isPast&&!hasResult&&ev.kind!=="Practice"&&<span style={{fontSize:10,color:"#555"}}>No result</span>}
                    {!isPast&&<span style={{fontSize:10,color:"#4ade80",fontWeight:600}}>Upcoming</span>}
                  </div>
                  <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.title}</div>
                  {ev.subtitle&&<div style={{fontSize:11,color:BRAND.textSecondary,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.subtitle}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlayerAnnouncements(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const tcolors={Practice:"#60a5fa",Academic:"#4ade80",Social:"#fbbf24",Schedule:"#f87171",General:"#aaa"};
  const colors={Practice:"#1e3a5f",Academic:"#1a3320",Social:"#2d1f00",Schedule:"#3d1515",General:"#2a2a2a"};
  useEffect(()=>{ supabase.from("announcements").select("*").order("created_at",{ascending:false}).then(({data})=>{ if(data)setItems(data); setLoading(false); }); },[]);
  return(
    <div>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:20}}>Announcements</h1>
      {loading?<Spinner/>:items.length===0?<div style={{...S.card,textAlign:"center",color:BRAND.textSecondary}}>No announcements yet.</div>:(
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
      )}
    </div>
  );
}

// ── LOGIN ──
function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const handleLogin=async(e)=>{
    e&&e.preventDefault();
    if(!email||!password){ setError("Please enter your email and password."); return; }
    setLoading(true); setError(null);
    try{
      const{data,error:authError}=await supabase.auth.signInWithPassword({email,password});
      if(authError) throw authError;
      const{data:profile}=await supabase.from("user_profiles").select("*").eq("id",data.user.id).single();
      const role=profile?.role||"player";
      const roleMap={"head_coach":ROLES.HEAD_COACH,"team_manager":ROLES.TEAM_MANAGER,"assistant":ROLES.ASSISTANT,"player":ROLES.PLAYER,"conditioning_coach":ROLES.CONDITIONING_COACH};
      let playerData=null;
      if(role==="player"&&profile?.player_id){
        const{data:pl}=await supabase.from("players").select("*").eq("id",profile.player_id).single();
        playerData=pl;
      }
      onLogin(roleMap[role]||ROLES.PLAYER,playerData);
    }catch(err){ setError(err.message||"Login failed. Check your email and password."); }
    setLoading(false);
  };

  return(
    <div style={{background:BRAND.black,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:400,textAlign:"center"}}>
        <TitansLogo size={90}/>
        <div style={{fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:BRAND.gold,marginTop:14}}>Enderun Men's College Basketball</div>
        <h1 style={{fontSize:22,fontWeight:800,color:BRAND.textPrimary,margin:"8px 0 4px"}}>Management System</h1>
        <p style={{fontSize:12,color:BRAND.textSecondary,marginBottom:28}}>Season 2026–27</p>
        <div style={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:14,padding:28}}>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>EMAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={S.input} autoComplete="username" name="email" id="email"/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:5,textAlign:"left"}}>PASSWORD</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={S.input} autoComplete="current-password" name="password" id="password"/>
            </div>
            {error&&<div style={{marginBottom:14,padding:"10px 14px",background:"#4a131333",borderRadius:8,fontSize:12,color:"#f87171",textAlign:"left"}}>⚠️ {error}</div>}
            <button type="submit" disabled={loading} style={{...S.btn("primary"),width:"100%",padding:"12px",fontSize:15,borderRadius:10,justifyContent:"center"}}>{loading?"Signing in…":"Sign In"}</button>
            <div style={{marginTop:14,fontSize:11,color:BRAND.textSecondary}}>No account? Ask the Head Coach to create one for you.</div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── APP ──
export default function App(){
  const isMobile=useIsMobile();
  const [loggedIn,setLoggedIn]=useState(false);
  const [role,setRole]=useState(null);
  const [currentPlayer,setCurrentPlayer]=useState(null);
  const [page,setPage]=useState(()=>{try{return localStorage.getItem("titans_page")||"dashboard";}catch{return"dashboard";}});
  const [navOpen,setNavOpen]=useState(false);
  const [players,setPlayers]=useState([]);
  const [playersLoading,setPlayersLoading]=useState(true);
  const [seeded,setSeeded]=useState(false);
  const [authLoading,setAuthLoading]=useState(true);

  // Persist active page across refreshes
  useEffect(()=>{try{localStorage.setItem("titans_page",page);}catch{}}, [page]);

  const loadPlayers=async()=>{
    setPlayersLoading(true);
    const{data}=await supabase.from("players").select("*").order("jersey",{ascending:true});
    if(data) setPlayers(data);
    setPlayersLoading(false);
    return data;
  };

  // Restore session from Supabase on mount
  useEffect(()=>{
    const restoreSession=async(session)=>{
      if(!session?.user) return false;
      try{
        const{data:profile}=await supabase.from("user_profiles").select("*").eq("id",session.user.id).single();
        if(!profile) return false;
        const roleMap={"head_coach":ROLES.HEAD_COACH,"team_manager":ROLES.TEAM_MANAGER,"assistant":ROLES.ASSISTANT,"player":ROLES.PLAYER,"conditioning_coach":ROLES.CONDITIONING_COACH};
        const r=roleMap[profile.role]||ROLES.PLAYER;
        let playerData=null;
        if(profile.role==="player"&&profile.player_id){
          const{data:pl}=await supabase.from("players").select("*").eq("id",profile.player_id).single();
          playerData=pl;
        }
        setRole(r); setCurrentPlayer(playerData); setLoggedIn(true);
        setPage(isAdmin(r)?"dashboard":isConditioningCoach(r)?"conditioningdashboard":"playerdashboard");
        return true;
      }catch(e){ return false; }
    };

    supabase.auth.getSession().then(({data:{session}})=>{
      restoreSession(session).finally(()=>setAuthLoading(false));
    });

    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!session) { setLoggedIn(false); setRole(null); setCurrentPlayer(null); }
    });
    return()=>subscription.unsubscribe();
  },[]);

  // Seed players if DB is empty
  const seedIfEmpty=async()=>{
    const{data}=await supabase.from("players").select("id").limit(1);
    if(data&&data.length===0&&!seeded){
      setSeeded(true);
      await supabase.from("players").insert(INIT_PLAYERS);
    }
  };

  useEffect(()=>{
    if(loggedIn){ seedIfEmpty().then(()=>loadPlayers()); }
  },[loggedIn]);

  const handleLogin=(r,pl)=>{ setRole(r); setCurrentPlayer(pl); setLoggedIn(true); setPage(isAdmin(r)?"dashboard":isConditioningCoach(r)?"conditioningdashboard":"playerdashboard"); };
  const handleLogout=async()=>{ await supabase.auth.signOut(); setLoggedIn(false); setRole(null); setCurrentPlayer(null); setPage("dashboard"); try{localStorage.removeItem("titans_page");}catch{} };

  if(authLoading) return(
    <div style={{background:"#0D0D0D",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <TitansLogo size={70}/>
        <div style={{color:"#9A8A70",fontSize:13,marginTop:16}}>Loading…</div>
      </div>
    </div>
  );
  if(!loggedIn) return <Login onLogin={handleLogin}/>;

  // Update currentPlayer from fresh players list
  const freshPlayer=currentPlayer&&players.length>0?players.find(p=>p.id===currentPlayer.id)||currentPlayer:currentPlayer;

  const adminPages={
    dashboard:<AdminDashboard players={players} loading={playersLoading} setPage={setPage}/>,
    roster:<Roster players={players} loadPlayers={loadPlayers} loading={playersLoading}/>,
    stats:<Statistics players={players}/>,
    attendance:<AdminAttendance players={players}/>,
    practice:<Practice/>,
    league:<League/>,
    health:<AdminHealth players={players}/>,
    playbook:<Playbook isAdmin={true}/>,
    announcements:<Announcements/>,
    users:<UserManager players={players}/>,
  };

  const playerPages={
    playerdashboard:<PlayerDashboard player={freshPlayer||{}} players={players} setPage={setPage}/>,
    myprofile:<MyProfile player={freshPlayer||{}} loadPlayers={loadPlayers}/>,
    mystats:<MyStats player={freshPlayer||{}}/>,
    myattendance:<MyAttendance player={freshPlayer||{}}/>,
    myhealth:<MyHealth player={freshPlayer||{}}/>,
    schedule:<PlayerSchedule/>,
    playbook:<Playbook isAdmin={false}/>,
    announcements:<PlayerAnnouncements/>,
  };

  const conditioningPages={
    conditioningdashboard:<ConditioningDashboard players={players} setPage={setPage}/>,
    roster:<Roster players={players} loadPlayers={loadPlayers} loading={playersLoading} readOnly={true}/>,
    performance:<Statistics players={players}/>,
    attendance:<AdminAttendance players={players} readOnly={true}/>,
    health:<AdminHealth players={players} readOnly={true}/>,
    schedule:<PlayerSchedule/>,
    practice:<Practice readOnly={true}/>,
    announcements:<PlayerAnnouncements/>,
  };

  const nav=isAdmin(role)?ADMIN_NAV:isConditioningCoach(role)?CONDITIONING_NAV:PLAYER_NAV;
  const pages=isAdmin(role)?adminPages:isConditioningCoach(role)?conditioningPages:playerPages;

  return(
    <MobileCtx.Provider value={isMobile}>
    <div style={S.app}>
      <header style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button
            onClick={()=>setNavOpen(o=>!o)}
            onMouseEnter={()=>setNavOpen(true)}
            style={{background:"none",border:"none",cursor:"pointer",color:BRAND.textPrimary,fontSize:22,lineHeight:1,padding:"4px 6px",display:"flex",alignItems:"center"}}
            aria-label="Toggle menu"
          >
            {navOpen?"✕":"☰"}
          </button>
          <TitansLogo size={34}/>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:BRAND.textPrimary,lineHeight:1}}>Enderun Titans</div>
            <div style={{fontSize:9,color:BRAND.textSecondary,letterSpacing:"0.08em"}}>BASKETBALL MANAGEMENT</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{padding:"3px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:`${BRAND.crimson}22`,color:BRAND.crimsonLight}}>{role}</span>
          {freshPlayer&&<span style={{fontSize:11,color:BRAND.textSecondary,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{freshPlayer.name?.split(" ")[0]}</span>}
          <button onClick={handleLogout} style={{...S.btn("secondary"),padding:"5px 10px",fontSize:11}}>Sign Out</button>
        </div>
      </header>
      <div style={{display:"flex",flex:1,position:"relative"}}>
        {navOpen&&(
          <div
            onClick={()=>setNavOpen(false)}
            style={{position:"fixed",inset:0,top:60,background:"rgba(0,0,0,0.5)",zIndex:99}}
          />
        )}
        <nav
          onMouseLeave={()=>setNavOpen(false)}
          style={{
          ...S.nav,
          position:"fixed",
          top:60,
          left:0,
          bottom:0,
          zIndex:100,
          transform:navOpen?"translateX(0)":"translateX(-100%)",
          transition:"transform 0.25s ease",
          overflowY:"auto",
          boxShadow:navOpen?"4px 0 20px rgba(0,0,0,0.4)":"none",
        }}>
          <div style={{padding:"6px 18px 12px",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.textSecondary}}>
            {isAdmin(role)?"Admin Panel":isConditioningCoach(role)?"Conditioning":"Player Portal"}
          </div>
          {nav.map(item=>(
            <div key={item.id} onClick={()=>{setPage(item.id);setNavOpen(false);}} style={S.navItem(page===item.id)}>
              <span style={{fontSize:15}}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          {isAdmin(role)&&!playersLoading&&(
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
        <main style={{...S.main,width:"100%",padding:isMobile?"14px 12px":"24px 28px"}}>{pages[page]||pages[isAdmin(role)?"dashboard":isConditioningCoach(role)?"conditioningdashboard":"myprofile"]}</main>
      </div>
    </div>
    </MobileCtx.Provider>
  );
}
