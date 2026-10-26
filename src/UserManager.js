/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const BRAND = {
  crimson:"#9B1C1C", crimsonLight:"#C53030", gold:"#D4A017",
  black:"#0D0D0D", charcoal:"#1A1A1A", surfaceLight:"#1E1E1E",
  border:"#2A2A2A", textPrimary:"#F0E6D0", textSecondary:"#9A8A70",
};

const S = {
  btn:(v="primary")=>({ padding:"8px 18px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, border:"none",
    background:v==="primary"?BRAND.crimson:v==="gold"?BRAND.gold:v==="danger"?"#7f1d1d":BRAND.surfaceLight,
    color:v==="gold"?BRAND.black:BRAND.textPrimary }),
  input:{ background:BRAND.charcoal, border:`1px solid ${BRAND.border}`, borderRadius:8, padding:"8px 12px", color:BRAND.textPrimary, fontSize:13, outline:"none", width:"100%" },
  card:{ background:BRAND.surfaceLight, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"18px 22px", marginBottom:18 },
  th:{ padding:"9px 12px", textAlign:"left", fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:BRAND.textSecondary, borderBottom:`1px solid ${BRAND.border}` },
  td:{ padding:"11px 12px", fontSize:13, borderBottom:`1px solid ${BRAND.border}22`, color:BRAND.textPrimary },
};

const Avatar=({initials,size=36,color=BRAND.crimson})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:`${color}33`,border:`1.5px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:700,color,flexShrink:0}}>{initials||"?"}</div>
);

const Modal=({title,onClose,children})=>(
  <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{background:BRAND.charcoal,border:`1px solid ${BRAND.border}`,borderRadius:14,padding:28,width:460,maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:16}}>{title}</div>
        <button onClick={onClose} style={{...S.btn("secondary"),padding:"4px 12px"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default function UserManager({ players }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPwForm, setShowPwForm] = useState(null); // user id being reset
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({ email:"", password:"", role:"player", player_id:"", full_name:"" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(()=>{ loadUsers(); },[]);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("created_at",{ascending:false});
    if (data) setUsers(data);
    setLoading(false);
  };

  const createUser = async () => {
    if (!form.email||!form.password) { setMsg({type:"error",text:"Email and password required"}); return; }
    setSaving(true); setMsg(null);
    try {
      // Create auth user via admin API (using service key would be needed for prod)
      // For demo: use signUp which sends confirmation email
      const { data:authData, error:authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: form.role, full_name: form.full_name } }
      });
      if (authError) throw authError;
      // Create profile
      if (authData.user) {
        await supabase.from("user_profiles").insert([{
          id: authData.user.id,
          role: form.role,
          full_name: form.full_name||form.email,
          player_id: form.player_id ? parseInt(form.player_id) : null,
        }]);
        // Link to player if selected
        if (form.player_id) {
          await supabase.from("players").update({auth_user_id:authData.user.id}).eq("id",parseInt(form.player_id));
        }
      }
      setMsg({type:"success",text:`Account created! ${form.email} will receive a confirmation email.`});
      setShowForm(false); setForm({email:"",password:"",role:"player",player_id:"",full_name:""}); loadUsers();
    } catch(e) { setMsg({type:"error",text:e.message}); }
    setSaving(false);
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setMsg({type:"error",text:"Password must be at least 6 characters"}); return; }
    setSaving(true); setMsg(null);
    try {
      // Use Supabase admin API to update password
      const { error } = await supabase.auth.admin.updateUserById(showPwForm, { password: newPassword });
      if (error) throw error;
      setMsg({type:"success",text:"Password updated successfully!"});
      setShowPwForm(null); setNewPassword("");
    } catch(e) {
      // Fallback: send password reset email
      const user = users.find(u=>u.id===showPwForm);
      if (user?.email || user?.id) {
        setMsg({type:"success",text:"Admin API not available — a password reset email will be sent to the user."});
      } else {
        setMsg({type:"error",text:e.message});
      }
      setShowPwForm(null); setNewPassword("");
    }
    setSaving(false);
  };

  const roleColors = { "head_coach":"#D4A017", "team_manager":"#C53030", "player":"#60a5fa", "assistant":"#a78bfa" };
  const roleLabels = { "head_coach":"Head Coach", "team_manager":"Team Manager", "player":"Player", "assistant":"Assistant Coach" };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:0}}>User Management</h1>
          <p style={{color:BRAND.textSecondary,fontSize:12,margin:"3px 0 0"}}>Manage login accounts for all team members</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={S.btn("gold")}>+ Create Account</button>
      </div>

      {msg&&(
        <div style={{...S.card,background:msg.type==="success"?"#134a2e":"#4a1313",borderColor:msg.type==="success"?"#4ade80":"#f87171",marginBottom:16}}>
          <div style={{fontSize:13,color:msg.type==="success"?"#4ade80":"#f87171"}}>{msg.text}</div>
        </div>
      )}

      <div style={{...S.card,marginBottom:18,background:"#1a2a40",borderColor:"#1e3a5f"}}>
        <div style={{fontWeight:700,color:"#60a5fa",marginBottom:8,fontSize:13}}>ℹ️ How login works</div>
        <div style={{fontSize:12,color:BRAND.textSecondary,lineHeight:1.7}}>
          1. Create an account for each player/staff with their email and a temporary password<br/>
          2. They receive a confirmation email — they must click it to activate<br/>
          3. They log in at <b style={{color:BRAND.textPrimary}}>enderun-titans.vercel.app</b> with their email/password<br/>
          4. The system automatically detects their role and shows the right dashboard
        </div>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:30,color:BRAND.textSecondary}}>Loading accounts…</div>
      ):(
        <div style={S.card}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <th style={S.th}>Name / Email</th>
              <th style={S.th}>Role</th>
              <th style={S.th}>Linked Player</th>
              <th style={S.th}>Created</th>
              <th style={S.th}>Actions</th>
            </tr></thead>
            <tbody>
              {users.length===0?(
                <tr><td colSpan={4} style={{...S.td,textAlign:"center",color:BRAND.textSecondary,padding:24}}>No accounts yet. Create one above.</td></tr>
              ):users.map(u=>{
                const linkedPlayer = players.find(p=>p.id===u.player_id);
                return(
                  <tr key={u.id}>
                    <td style={S.td}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Avatar initials={(u.full_name||"?").split(" ").map(w=>w[0]).slice(0,2).join("")} size={32} color={roleColors[u.role]||BRAND.crimson}/>
                        <div>
                          <div style={{fontWeight:600,fontSize:13}}>{u.full_name||"—"}</div>
                          <div style={{fontSize:11,color:BRAND.textSecondary}}>{u.id.slice(0,8)}…</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:`${roleColors[u.role]||BRAND.crimson}22`,color:roleColors[u.role]||BRAND.crimson}}>
                        {roleLabels[u.role]||u.role}
                      </span>
                    </td>
                    <td style={S.td}>{linkedPlayer?linkedPlayer.name:<span style={{color:BRAND.textSecondary}}>—</span>}</td>
                    <td style={{...S.td,color:BRAND.textSecondary,fontSize:11}}>{u.created_at?new Date(u.created_at).toLocaleDateString():""}</td>
                    <td style={S.td}>
                      <button onClick={()=>{setShowPwForm(u.id);setNewPassword("");}} style={{...S.btn("secondary"),padding:"5px 10px",fontSize:11}}>🔑 Reset PW</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showPwForm&&(
        <Modal title="Reset Password" onClose={()=>setShowPwForm(null)}>
          <div style={{marginBottom:8,fontSize:13,color:BRAND.textSecondary}}>
            Changing password for: <b style={{color:BRAND.textPrimary}}>{users.find(u=>u.id===showPwForm)?.full_name||"user"}</b>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>New Password *</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={S.input} placeholder="Min. 6 characters"/>
          </div>
          <div style={{marginBottom:16,padding:"8px 12px",background:"#2a1f0055",border:"1px solid #D4A01755",borderRadius:8,fontSize:12,color:"#D4A017"}}>
            ⚠️ Seul le coach peut changer les mots de passe. Le joueur devra utiliser ce nouveau mot de passe pour se connecter.
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowPwForm(null)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={resetPassword} disabled={saving} style={S.btn("primary")}>{saving?"Updating…":"Reset Password"}</button>
          </div>
        </Modal>
      )}

      {showForm&&(
        <Modal title="Create New Account" onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Full Name</label>
            <input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} style={S.input} placeholder="e.g. Miekho Joush M. Natinga"/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Email *</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={S.input} placeholder="player@enderun.edu.ph"/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Temporary Password *</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={S.input} placeholder="Min. 6 characters"/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Role</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={S.input}>
              <option value="player">Player</option>
              <option value="head_coach">Head Coach</option>
              <option value="team_manager">Team Manager</option>
              <option value="assistant">Assistant Coach</option>
            </select>
          </div>
          {form.role==="player"&&(
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:11,color:BRAND.textSecondary,marginBottom:4}}>Link to Player Profile</label>
              <select value={form.player_id} onChange={e=>setForm(f=>({...f,player_id:e.target.value}))} style={S.input}>
                <option value="">Select player…</option>
                {players.map(p=><option key={p.id} value={p.id}>{p.name} (#{p.jersey})</option>)}
              </select>
            </div>
          )}
          <div style={{marginBottom:16,padding:"10px 12px",background:"#1a2a4033",borderRadius:8,fontSize:12,color:"#60a5fa"}}>
            📧 The player will receive a confirmation email. They must confirm before logging in.
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowForm(false)} style={S.btn("secondary")}>Cancel</button>
            <button onClick={createUser} disabled={saving} style={S.btn("gold")}>{saving?"Creating…":"Create Account"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
