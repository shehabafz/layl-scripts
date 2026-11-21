!function(){"use strict";
let e={
  firebase:{
    apiKey:"AIzaSyC9fdv0xFDVRfUMgBEoI2WVeVi9U5BF3_8",
    authDomain:"layl-codenames.firebaseapp.com",
    projectId:"layl-codenames",
    storageBucket:"layl-codenames.firebasestorage.app",
    messagingSenderId:"651006164506",
    appId:"1:651006164506:web:1541818c0e5a6077415ba3"
  },
  dbPath:"layl_streaks_v3",
  adminPath:"layl_streaks_admin",
  cacheKey:"layl_streaks_cache_v3",
  dayInMs:864e5,
  recoveryTarget:200,
  milestones:[10,30,50,100,200,365,500,1e3]
};

let defaultSettings={
  enabled:!0,
  doubleMode:!1,
  globalFreeze:!1,
  allowUserHide:!0,
  recoveryTarget:200,
  recoveryHours:36,
  minStreakForRecovery:10,
  defaultChances:3,
  chatBadgeMin:100,
  midTierMin:30,
  highTierMin:100,
  leaderboardLimit:10,
  welcomeMessages:""
};

let t={
  db:null,
  cache:JSON.parse(localStorage.getItem(e.cacheKey)||"{}"),
  myUsername:localStorage.getItem("pc_username")||null,
  isRendering:!1,
  adminUsers:[],
  settings:Object.assign({},defaultSettings),
  adminLogs:[],
  toastQueue:[],
  isToasting:!1
};

let a={
  sanitizeName:x=>x?x.replace(/[.#$\[\]\/]/g,"_").trim():null,
  escapeHTML:x=>x?String(x).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]||c):"",
  getTodayMidnight(){let x=new Date;return x.setHours(0,0,0,0),x.getTime()},
  formatNumber:x=>x>=1e9?(x/1e9).toFixed(1).replace(/\.0$/,"")+"B":x>=1e6?(x/1e6).toFixed(1).replace(/\.0$/,"")+"M":x>=1e3?(x/1e3).toFixed(1).replace(/\.0$/,"")+"K":x,
  findUsernameByDisplayName(x){
    if(!x)return null;
    let s=x.trim().toLowerCase();
    for(let[k,v]of Object.entries(t.cache))if(v&&((v.displayName&&v.displayName.trim().toLowerCase()===s)||(v.originalName&&v.originalName.trim().toLowerCase()===s)))return k;
    return null
  },
  getCleanText(x){
    if(!x)return null;
    let c=x.cloneNode(!0);
    return c.querySelectorAll("img, i, svg, .user-identity-badge-icon, .user-identity-super").forEach(y=>y.remove()),c.textContent.trim()
  },
  isAdmin(){
    if(!t.myUsername||!t.adminUsers.length)return!1;
    let s=a.sanitizeName(t.myUsername);
    return t.adminUsers.includes(t.myUsername)||(s&&t.adminUsers.includes(s))
  },
  getRecoveryTarget(){
    let v=Number(t.settings.recoveryTarget);
    return v>0?v:e.recoveryTarget
  },
  getRecoveryMs(){
    let h=Number(t.settings.recoveryHours);
    return(h>0?h:36)*36e5
  },
  isUserFrozen(d){
    return Boolean(t.settings.globalFreeze||(d&&d.frozenUntil&&d.frozenUntil>Date.now()))
  },
  isUserActive(d,todayMid){
    if(!d||!(d.streak>0)||d.excluded)return!1;
    if(d.lostStreak&&d.recoveryDeadline>Date.now())return!1;
    let tm=todayMid||a.getTodayMidnight();
    return a.isUserFrozen(d)||(tm-(d.lastLogin||0)<=e.dayInMs)
  },
  getTierIcon(streak,d){
    if(d&&d.customEmoji)return d.customEmoji;
    let hi=Number(t.settings.highTierMin)||100,mi=Number(t.settings.midTierMin)||30;
    return streak>=hi?"👑":streak>=mi?"⚡":"🔥"
  },
  formatDate(ts){
    if(!ts)return"-";
    try{return new Date(ts).toLocaleString("ar-EG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"-"}
  },
  formatDayDate(ts){
    if(!ts)return"-";
    try{return new Date(ts).toLocaleDateString("ar-EG",{year:"numeric",month:"short",day:"numeric"})}catch{return"-"}
  },
  formatRemaining(exp){
    if(!exp)return"غير محدد";
    if(exp>Date.now()+300*864e5)return"دائم";
    let diff=exp-Date.now();
    if(diff<=0)return"منتهي";
    let mins=Math.ceil(diff/6e4);
    if(mins<60)return`${mins} دقيقة`;
    let hrs=Math.floor(mins/60),rm=mins%60;
    if(hrs<24)return rm?`${hrs} س و ${rm} د`:`${hrs} ساعة`;
    let days=Math.floor(hrs/24),rh=hrs%24;
    return rh?`${days} ي و ${rh} س`:`${days} يوم`
  },
  getOnlineUsers(){
    let list=[],seen=new Set;
    document.querySelectorAll("#sidebar-users-container .user-identity").forEach(el=>{
      let u=n(el);
      if(u&&u.username){
        let san=a.sanitizeName(u.username);
        if(san&&!seen.has(san)){seen.add(san);list.push({username:u.username,san,displayName:u.displayName||u.username})}
      }
    });
    return list
  }
};

let r={
  injectStyles(){
    if(!document.getElementById("layl-streak-styles")){
      let s=document.createElement("style");
      s.id="layl-streak-styles";
      s.innerHTML=`
        .night-streak { cursor: pointer; pointer-events: auto !important; font-size: 9px !important; font-weight: bold !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 2px !important; height: 16px !important; min-height: 16px !important; max-height: 16px !important; line-height: 18px !important; font-family: 'Segoe UI', tahoma, sans-serif !important; z-index: 10 !important; white-space: nowrap !important; flex-shrink: 0 !important; box-sizing: border-box !important; border-radius: 12px !important; transition: opacity 0.2s ease; position: relative; user-select: none; -webkit-tap-highlight-color: transparent; }
        .night-streak.inline-streak { margin: 2px 4px !important; padding: 0 7px !important; vertical-align: middle !important; }
        .night-streak.avatar-streak { position: absolute !important; bottom: 0px !important; left: 50% !important; transform: translateX(-50%) !important; padding: 0 7px !important; z-index: 10 !important; box-shadow: 0px 3px 6px rgba(0,0,0,0.6) !important; text-shadow: 0px 1px 2px rgba(0,0,0,0.9) !important; }
        .night-streak.avatar-streak.streak-low { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .streak-low { color: #e2e8f0 !important; background: rgba(22, 24, 49, 0.85) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
        .streak-mid { color: #fff !important; background: linear-gradient(135deg, #8b1836, #4a091a) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; }
        .streak-high { color: #fff !important; background: linear-gradient(135deg, #d4af37, #9b7e22) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; box-shadow: 0 0 12px rgba(212, 175, 55, 0.4) !important; text-shadow: 0px 1px 2px rgba(0,0,0,0.3) !important;}
        @keyframes layl-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .layl-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 11, 20, 0.85); z-index: 2147483640; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); opacity: 0; visibility: hidden; transition: opacity 0.2s ease; direction: rtl; }
        .layl-modal-overlay.active { opacity: 1; visibility: visible; }
        .layl-modal-box { background: linear-gradient(180deg, rgba(28, 31, 56, 0.95) 0%, rgba(18, 20, 36, 0.98) 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(212, 175, 55, 0.3); border-radius: 24px; padding: 35px 25px; width: 90%; max-width: 360px; box-shadow: 0 25px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05); transform: scale(0.95) translateY(10px); opacity: 0; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .layl-modal-overlay.active .layl-modal-box { transform: scale(1) translateY(0); opacity: 1; }
        .layl-btn-gold { background: linear-gradient(135deg, #D4AF37, #b59226); color: #161824; border: none; padding: 14px; border-radius: 14px; font-weight: 800; cursor: pointer; width: 100%; font-family: 'Segoe UI', tahoma, sans-serif; font-size: 15px; margin-top: 20px; transition: all 0.3s ease; box-shadow: 0 8px 20px rgba(212, 175, 55, 0.25), inset 0 1px 1px rgba(255,255,255,0.4); }
        .layl-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(212, 175, 55, 0.35); }
        .layl-btn-dark { background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 14px; border-radius: 14px; font-weight: bold; cursor: pointer; width: 100%; font-family: 'Segoe UI', tahoma, sans-serif; font-size: 15px; margin-top: 15px; transition: all 0.3s ease; }
        .layl-btn-dark:hover { background: rgba(255,255,255,0.1); color: #fff; transform: translateY(-2px); }
        .layl-btn-burgundy { background: linear-gradient(135deg, #8b1836, #5c0f22); color: #fff; border: none; padding: 14px; border-radius: 14px; font-weight: bold; cursor: pointer; width: 100%; font-family: 'Segoe UI', tahoma, sans-serif; font-size: 15px; margin-top: 20px; transition: all 0.3s ease; box-shadow: 0 8px 20px rgba(139, 24, 54, 0.3), inset 0 1px 1px rgba(255,255,255,0.2); }
        .layl-btn-burgundy:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(139, 24, 54, 0.4); }
        #layl-recovery-banner { position: absolute; top: 70px; left: 50%; transform: translateX(-50%); background: rgba(18, 20, 36, 0.95); color: #cbd5e1; padding: 12px 24px; border-radius: 100px; font-size: 13px; z-index: 1000; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); direction: rtl; font-family: tahoma; font-weight: 600; white-space: nowrap; transition: 0.3s; }
        @media (max-width: 768px) { #layl-recovery-banner { top: 90px; font-size: 11px; padding: 10px 18px; flex-direction: column; gap: 6px; border-radius: 16px; } }
      `;
      document.head.appendChild(s)
    }
    r.injectAdminStyles()
  },
  injectAdminStyles(){
    if(document.getElementById("layl-streak-admin-styles"))return;
    let s=document.createElement("style");
    s.id="layl-streak-admin-styles";
    s.innerHTML=`
      .lsa-overlay { position: fixed; inset: 0; background: rgba(8, 10, 18, 0.9); z-index: 2147483645; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity: 0; visibility: hidden; transition: opacity 0.25s ease; direction: rtl; font-family: 'Segoe UI', tahoma, sans-serif; }
      .lsa-overlay.active { opacity: 1; visibility: visible; }
      .lsa-sub-overlay { z-index: 2147483646; background: rgba(6, 8, 16, 0.88); }
      .lsa-box { background: linear-gradient(180deg, rgba(28, 31, 56, 0.98) 0%, rgba(16, 18, 34, 0.99) 100%); border: 1px solid rgba(212, 175, 55, 0.32); border-radius: 20px; width: 95%; max-width: 600px; max-height: 88vh; max-height: 88dvh; padding: 16px 18px 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.85); transform: scale(0.94) translateY(15px); opacity: 0; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; color: #f8fafc; }
      .lsa-sub-box { max-width: 440px; border-color: rgba(212, 175, 55, 0.45); }
      .lsa-overlay.active .lsa-box { transform: scale(1) translateY(0); opacity: 1; }
      .lsa-header, .lsa-stats, .lsa-tabs { flex-shrink: 0 !important; }
      .lsa-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .lsa-title { display: flex; align-items: center; gap: 8px; color: #D4AF37; font-weight: 800; font-size: 15.5px; }
      .lsa-ctrl-btn { background: rgba(255,255,255,0.09); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; transition: 0.2s; }
      .lsa-ctrl-btn:hover { background: rgba(255,255,255,0.18); }
      .lsa-ctrl-close:hover { background: rgba(239, 68, 68, 0.8); }
      .lsa-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 11px; }
      .lsa-stat { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 7px 4px; text-align: center; }
      .lsa-stat-val { font-size: 13.5px; font-weight: 800; color: #D4AF37; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .lsa-stat-lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }
      .lsa-tabs { display: flex; height: 42px; min-height: 42px; background: rgba(0,0,0,0.34); border-radius: 12px; margin-bottom: 12px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; border: 1px solid rgba(255,255,255,0.05); }
      .lsa-tabs::-webkit-scrollbar { display: none; }
      .lsa-tab { flex: 1 0 auto; background: transparent; color: #94a3b8; border: none; padding: 0 10px; height: 100%; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: inherit; font-size: 11.5px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; }
      .lsa-tab.active { background: rgba(212, 175, 55, 0.16); color: #D4AF37; border-bottom: 2px solid #D4AF37; }
      .lsa-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; padding-left: 4px; margin-left: -4px; -webkit-overflow-scrolling: touch; }
      .lsa-body::-webkit-scrollbar { width: 5px; }
      .lsa-body::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.35); border-radius: 10px; }
      .lsa-view { display: none; }
      .lsa-view.active { display: block; }
      .lsa-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; text-align: right; }
      .lsa-card-title { font-size: 12.5px; font-weight: 700; color: #D4AF37; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; }
      .lsa-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      .lsa-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
      .lsa-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .lsa-input { width: 100%; background: rgba(0, 0, 0, 0.32); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 8px 10px; border-radius: 10px; font-family: inherit; font-size: 12.5px; outline: none; box-sizing: border-box; transition: border 0.2s; }
      .lsa-input:focus { border-color: #D4AF37; }
      .lsa-input option { background: #16182c; color: #fff; }
      .lsa-label { display: block; font-size: 11px; color: #cbd5e1; font-weight: 700; margin-bottom: 4px; }
      .lsa-btn { border: none; border-radius: 10px; padding: 9px 12px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
      .lsa-btn:active { transform: scale(0.97); }
      .lsa-btn-gold { background: linear-gradient(135deg, #D4AF37, #b59226); color: #161824; width: 100%; }
      .lsa-btn-crimson { background: linear-gradient(135deg, #8b1836, #5c0f22); color: #fff; width: 100%; }
      .lsa-btn-dark { background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.08); }
      .lsa-btn-dark:hover { background: rgba(255,255,255,0.14); }
      .lsa-btn-danger { background: rgba(239, 68, 68, 0.16); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.35); }
      .lsa-btn-danger:hover { background: rgba(239, 68, 68, 0.35); color: #fff; }
      .lsa-btn-success { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.35); }
      .lsa-btn-info { background: rgba(56, 189, 248, 0.16); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3); }
      .lsa-mini { padding: 5px 8px; font-size: 11px; border-radius: 8px; }
      .lsa-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; }
      .lsa-tag-gold { background: rgba(212,175,55,0.18); color: #D4AF37; }
      .lsa-tag-green { background: rgba(16,185,129,0.16); color: #34d399; }
      .lsa-tag-red { background: rgba(239,68,68,0.18); color: #f87171; }
      .lsa-tag-blue { background: rgba(56,189,248,0.18); color: #38bdf8; }
      .lsa-tag-purple { background: rgba(168,85,247,0.2); color: #c084fc; }
      .lsa-tag-gray { background: rgba(148,163,184,0.18); color: #94a3b8; }
      .lsa-setting-row { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 11px; margin-bottom: 7px; gap: 10px; }
      .lsa-switch { position: relative; width: 42px; height: 22px; flex-shrink: 0; }
      .lsa-switch input { opacity: 0; width: 0; height: 0; }
      .lsa-slider { position: absolute; cursor: pointer; inset: 0; background: #334155; border-radius: 22px; transition: 0.25s; }
      .lsa-slider:before { content: ""; position: absolute; height: 16px; width: 16px; right: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.25s; }
      .lsa-switch input:checked + .lsa-slider { background: #10b981; }
      .lsa-switch input:checked + .lsa-slider:before { transform: translateX(-20px); }
      .lsa-prog-wrap { width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin: 6px 0; }
      .lsa-prog-bar { height: 100%; background: linear-gradient(90deg, #8b1836, #D4AF37); border-radius: 10px; transition: width 0.3s; }
      .lsa-emoji-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 5px 8px; font-size: 14px; cursor: pointer; color: #fff; }
      .lsa-emoji-btn.active { background: rgba(212,175,55,0.25); border-color: #D4AF37; }
      .lsa-quick-pill { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 4px 8px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: inherit; }
      .lsa-quick-pill:hover { background: rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); color: #D4AF37; }
      .lsa-toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); background: rgba(20, 22, 40, 0.96); border: 1px solid rgba(212, 175, 55, 0.45); color: #f8fafc; padding: 11px 24px; border-radius: 50px; z-index: 2147483647; font-family: tahoma, sans-serif; font-size: 13.5px; box-shadow: 0 10px 30px rgba(0,0,0,0.75); pointer-events: none; opacity: 0; backdrop-filter: blur(8px); animation: lsa-toast-anim 3.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; max-width: 88vw; font-weight: bold; }
      @keyframes lsa-toast-anim { 0% { opacity: 0; transform: translate(-50%, 0px) scale(0.85); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 85% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -95%) scale(0.85); } }
      @media (max-width: 500px) { .lsa-box { padding: 12px 13px 14px; width: 96%; } .lsa-grid-3 { grid-template-columns: repeat(2, 1fr); } .lsa-stat-val { font-size: 12px; } }
    `;
    document.head.appendChild(s)
  },
  showToast(msg){
    t.toastQueue.push(msg);
    r.processToast()
  },
  processToast(){
    if(t.isToasting||0===t.toastQueue.length)return;
    t.isToasting=!0;
    let msg=t.toastQueue.shift(),d=document.createElement("div");
    d.className="lsa-toast";
    d.innerHTML=msg;
    document.body.appendChild(d);
    setTimeout(()=>{d.remove();t.isToasting=!1;r.processToast()},3300)
  },
  showModal(x){
    let m=document.getElementById("layl-dynamic-modal");
    m||((m=document.createElement("div")).id="layl-dynamic-modal",m.className="layl-modal-overlay",document.body.appendChild(m),m.addEventListener("click",ev=>{ev.target===m&&r.closeModal()}));
    m.innerHTML=`<div class="layl-modal-box">${x}</div>`;
    requestAnimationFrame(()=>m.classList.add("active"))
  },
  closeModal(){
    let m=document.getElementById("layl-dynamic-modal");
    m&&(m.classList.remove("active"),setTimeout(()=>m.remove(),300))
  },
  fireConfetti(){
    if(!window.confetti)return;
    let end=Date.now()+4e3;
    !function loop(){
      window.confetti({zIndex:2147483647,particleCount:4,angle:60,spread:55,origin:{x:0},colors:["#D4AF37","#ffffff","#cbd5e1"]});
      window.confetti({zIndex:2147483647,particleCount:4,angle:120,spread:55,origin:{x:1},colors:["#D4AF37","#ffffff","#cbd5e1"]});
      Date.now()<end&&requestAnimationFrame(loop)
    }()
  }
};

let i={
  openLeaderboard(){
    let tm=a.getTodayMidnight(),lim=Number(t.settings.leaderboardLimit)||10;
    let list=Object.keys(t.cache)
      .map(k=>({name:t.cache[k].displayName||k.replace(/_/g," "),data:t.cache[k]}))
      .filter(x=>x.data&&x.data.streak>0&&!x.data.hidden&&!x.data.excluded&&!x.data.hideFromBoard&&a.isUserActive(x.data,tm))
      .sort((x,y)=>y.data.streak-x.data.streak)
      .slice(0,lim);
    let html='<div class="custom-scrollbar" style="max-height: 300px; overflow-y: auto; text-align: right; margin-bottom: 10px; direction: rtl; padding-left: 5px; padding-right: 5px;">';
    0===list.length
      ?html+='<div style="color:#64748b; text-align:center; padding: 30px 10px; font-weight:normal; font-size:14px;">الساحة فارغة، كن أول من يضيء الشعلة.</div>'
      :list.forEach((item,idx)=>{
        let rank=0===idx?"🏆":1===idx?"🥈":2===idx?"🥉":`<span style="color:#64748b; font-size:14px; font-weight:bold;">${idx+1}</span>`;
        let st=item.data.streak,ico=a.getTierIcon(st,item.data);
        html+=`
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); border-radius:12px; margin-bottom:8px; transition: background 0.2s;">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
              <div style="width:28px; height:28px; border-radius:8px; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0;">${rank}</div>
              <span style="color:#f1f5f9; font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.escapeHTML(item.name)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; color:#D4AF37; font-weight:bold; font-size:15px; flex-shrink:0; background:rgba(212,175,55,0.08); padding:4px 10px; border-radius:8px;">
              <span>${a.formatNumber(st)}</span>
              <span style="font-size:13px; filter:grayscale(0.2);">${ico}</span>
            </div>
          </div>`
      });
    html+="</div>";
    r.showModal(`
      <div style="text-align:center; margin-bottom:25px;">
        <div style="font-size:40px; margin: 0 auto 10px auto; display:inline-block; animation: layl-float 3s ease-in-out infinite;">👑</div>
        <h3 style="margin:0; color:#D4AF37; font-family:'Segoe UI', tahoma, sans-serif; font-size:20px; font-weight:800; letter-spacing: 0.5px;">أبطال الشعلة</h3>
        <div style="color:#94a3b8; font-size:13px; margin-top:6px;">النخبة الأكثر استمرارية في شات ليل</div>
      </div>
      ${html}
      <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-dark">إغلاق القائمة</button>
    `)
  },
  openStreakInfo(name,streak,userKey){
    let d=userKey&&t.cache[userKey]?t.cache[userKey]:null;
    let ico=a.getTierIcon(Number(streak)||0,d);
    let shieldNote=d&&a.isUserFrozen(d)?`<div style="margin-top:12px; font-size:12px; color:#7dd3fc; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); padding:6px 12px; border-radius:10px; display:inline-block;">🛡️ هذه الشعلة محمية بدرع الإدارة${t.settings.globalFreeze?" (حماية شاملة)":` (${a.formatRemaining(d.frozenUntil)})`}</div>`:"";
    r.showModal(`
      <div style="text-align:center;">
        <div style="font-size:50px; margin: 0 auto 20px auto; display:inline-block; animation: layl-float 3s ease-in-out infinite; filter: drop-shadow(0 4px 10px rgba(212,175,55,0.3));">${ico}</div>
        <h3 style="margin:0 0 20px; color:#f8fafc; font-family:'Segoe UI', tahoma, sans-serif; font-size:22px; font-weight:800;">شعلة ليل</h3>
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 20px 15px; border-radius: 16px; margin-bottom: 25px;">
          <p style="color:#cbd5e1; font-size:14px; margin:0 0 20px 0; line-height:1.8; font-family:'Segoe UI', tahoma, sans-serif;">
            هذا الرقم يمثل عدد الأيام المتتالية التي أضاء فيها <br><b style="color:#D4AF37; font-size:15px;">${a.escapeHTML(name)}</b> سماء الشات بحضوره.
          </p>
          <div style="display:inline-flex; align-items:center; justify-content:center; gap:12px; background: rgba(212, 175, 55, 0.05); padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.15);">
            <span style="color:#94a3b8; font-size:13px; font-weight:bold;">الرصيد الحالي:</span>
            <span style="color:#D4AF37; font-weight:900; font-size:18px;">${a.formatNumber(streak)} <span style="font-size:12px; font-weight:normal;">يوم</span></span>
          </div>
          ${shieldNote}
        </div>
        <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-gold">حسناً، فهمت</button>
      </div>
    `)
  },
  showDailyWelcome(streak){
    let custom=(t.settings.welcomeMessages||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
    let msgs=custom.length?custom:["يوم جديد، وشعلة لا تنطفئ في سماء ليل..","أنا مستمر.. وكل يوم أكتب حكاية جديدة","حضورك اليوم زاد المكان بريقاً ملكياً!"];
    let pick=msgs[Math.floor(Math.random()*msgs.length)];
    let myD=t.myUsername?t.cache[a.sanitizeName(t.myUsername)]:null;
    let ico=a.getTierIcon(streak,myD);
    r.showModal(`
      <div style="text-align:center;">
        <div style="font-size:55px; margin: 0 auto 20px auto; display:inline-block; animation: layl-float 3s ease-in-out infinite;">${ico}</div>
        <h3 style="color:#D4AF37; font-family:'Segoe UI', tahoma, sans-serif; margin:0 0 15px; font-size:18px; font-weight:bold; line-height:1.6;">${a.escapeHTML(pick)}</h3>
        <div style="color:#cbd5e1; font-size:14px; margin-bottom:25px; background:rgba(0,0,0,0.25); padding:20px 15px; border-radius:16px; border:1px solid rgba(255,255,255,0.04);">
          أصبح رصيد شعلتك الان <br>
          <b style="color:#f8fafc; font-size:26px; display:inline-block; margin-top:10px; font-weight:900; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${a.formatNumber(streak)} <span style="color:#94a3b8; font-size:14px; font-weight:normal;">يوم</span></b>
          ${t.settings.doubleMode?'<div style="margin-top:8px; color:#c084fc; font-size:12px; font-weight:bold;">⚡ فعالية الدبل (×2) مفعّلة اليوم!</div>':""}
        </div>
        <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-gold">مواصلة الإبداع</button>
      </div>
    `)
  },
  showRecoveryChallenge(lost,chances){
    let target=a.getRecoveryTarget();
    r.showModal(`
      <div style="text-align:center;">
        <div style="font-size:50px; margin: 0 auto 20px auto; display:inline-block; filter: grayscale(1) opacity(0.7); animation: layl-float 4s ease-in-out infinite;">💨</div>
        <h3 style="color:#f87171; font-family:'Segoe UI', tahoma, sans-serif; margin:0 0 12px; font-size:20px; font-weight:bold;">انطفأت الشعلة!</h3>
        <p style="color:#94a3b8; font-size:14px; line-height:1.7; margin-bottom:25px;">
          لقد غبت ليوم كامل، فانطفأت شعلتك التي استمرت لـ <b style="color:#f1f5f9;">${lost} يوم</b>.
        </p>
        <div style="background: rgba(139, 24, 54, 0.1); border: 1px solid rgba(139, 24, 54, 0.3); padding: 20px 15px; border-radius: 16px; margin-bottom: 25px;">
          <div style="color:#f87171; font-weight:bold; margin-bottom: 8px; font-size:15px;">🔥 تحدي الاسترجاع</div>
          <div style="color:#cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">أرسل <b style="color:#fff;">${target} رسالة</b> في الشات اليوم لاستعادتها.</div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 12px; font-size: 12px; color: #94a3b8; display: inline-block;">فرص الاسترجاع المتوفرة لديك: <b style="color: #D4AF37; font-size: 14px;">${(chances||0)+1}</b></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-burgundy" style="margin-top:0;">قبلت التحدي!</button>
          <button onclick="window.LaylStreaks.declineRecovery()" class="layl-btn-dark" style="margin-top:0; font-size:13px; padding: 12px;">رفض التحدي والبدء من جديد</button>
        </div>
      </div>
    `)
  }
};

let s=()=>{
  let setU=id=>{
    let el=document.getElementById(id);
    if(el&&el.value){
      let u=el.value.trim();
      u&&(t.myUsername=u,localStorage.setItem("pc_username",u),l.updateUserLogin(u,u),o.injectAdminPanelBtn(),o.injectAdminStreakEditor())
    }
  };
  document.body.addEventListener("click",ev=>{ev.target.closest("#member-login-btn")&&setU("member-username");ev.target.closest("#register-btn")&&setU("register-username")});
  document.body.addEventListener("submit",ev=>{"member-login-form"===ev.target.id&&setU("member-username");"register-form"===ev.target.id&&setU("register-username")});
  document.body.addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.target.closest("#member-login-form")?setU("member-username"):ev.target.closest("#register-form")&&setU("register-username"))})
};

let n=el=>{
  if(!el||el.classList.contains("guest")||el.classList.contains("is-guest")||el.closest(".guest, .is-guest, .guest-user"))return null;
  let u=null,dn=null,av=el.querySelector(".message-avatar");
  av&&(u=av.getAttribute("data-username"));
  let idEl=el.classList.contains("user-identity")?el:el.querySelector(".user-identity");
  idEl&&(u||(u=idEl.getAttribute("data-username")||idEl.getAttribute("data-user-id")),dn=a.getCleanText(idEl.querySelector(".user-identity-name")||idEl));
  let mt=el.querySelector(".message-text")||el.querySelector(".message-body");
  return!u&&mt&&(u=mt.getAttribute("data-username")),u||(u=el.getAttribute("data-username")||el.getAttribute("data-user")),!u&&dn&&t.myUsername&&(dn.includes(t.myUsername)||t.myUsername.includes(dn))&&(u=t.myUsername),!u&&dn&&(u=a.findUsernameByDisplayName(dn)||dn),{username:u,displayName:dn||u}
};

let o={
  triggerRender(){
    t.isRendering||(t.isRendering=!0,requestAnimationFrame(()=>{o.executeRender(),t.isRendering=!1}))
  },
  executeRender(){
    let tm=a.getTodayMidnight(),enabled=!1!==t.settings.enabled;
    let chatMin=Number(t.settings.chatBadgeMin)||100,hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    document.querySelectorAll(".user-identity-name, .user-identity").forEach(el=>{
      let idEl=el.closest(".user-identity")||el;
      if(!idEl||!idEl.classList.contains("user-identity")||idEl.closest(".guest, .is-guest, .guest-user, .quoted-message, .message-text")||idEl.classList.contains("mention-highlight"))return;
      let itemEl=el.closest(".user-pro-item")||el.closest(".list-group-item")||el.closest(".user-list-item");
      let inSide=null!==el.closest("#sidebar-users-container")||null!==el.closest(".sidebar-content")||null!==el.closest(".users-list");
      let inProf=null!==el.closest("#profile-header-classic-bar")||null!==el.closest(".profile-header");
      let isSys=null!==el.closest(".styled-sys-msg")||null!==el.closest(".msg-status-login")||null!==el.closest(".user-join-message");
      let inMsg=null!==el.closest(".message-row")&&!isSys;
      let target=null,onAvatar=!1;
      if(inSide&&itemEl){
        let av=itemEl.querySelector(".avatar-with-frame")||itemEl.querySelector(".avatar");
        if(!av){let img=itemEl.querySelector("img.user-avatar")||itemEl.querySelector("img");img&&(av=img.parentNode)}
        av&&(target=av,onAvatar=!0)
      }else(inProf||inMsg)&&(target=idEl);
      if(!target)return;
      let badge=onAvatar?target.querySelector(":scope > .night-streak"):idEl.parentNode.querySelector(".night-streak");
      let u=n(idEl.closest(".message-row, .user-pro-item, .list-group-item")||idEl);
      if(!u||!u.username||""===u.username.trim())return;
      let key=a.sanitizeName(u.username),d=t.cache[key],st=d?.streak||0,hid=d?.hidden||!1;
      let expired=!a.isUserFrozen(d)&&(tm-(d?.lastLogin||0)>e.dayInMs);
      let inRec=Boolean(d?.lostStreak&&d?.recoveryDeadline>Date.now());
      let show=!1;
      if(enabled&&st>0&&!d?.excluded&&!expired&&!inRec){
        if(inSide&&hid)show=!1;
        else if(inSide||inProf)show=!0;
        else if(inMsg&&st>=chatMin)show=!0
      }
      if(show){
        badge||(badge=document.createElement("span"),onAvatar?target.appendChild(badge):idEl.insertAdjacentElement("afterend",badge));
        let cls=`night-streak ${onAvatar?"avatar-streak":"inline-streak"} ${st>=hiMin?"streak-high":st>=miMin?"streak-mid":"streak-low"}`;
        badge.className!==cls&&(badge.className=cls);
        let disp=u.displayName||u.username;
        badge.setAttribute("data-streak",st);
        badge.setAttribute("data-name",disp);
        badge.setAttribute("data-userkey",key);
        let txt=`${a.getTierIcon(st,d)} ${a.formatNumber(st)}`;
        badge.innerHTML!==txt&&(badge.innerHTML=txt)
      }else{
        badge&&badge.remove()
      }
    });
    o.injectEliteMenuBtn();
    o.injectPrivacyToggle();
    o.injectAdminStreakEditor();
    o.injectAdminPanelBtn()
  },
  injectEliteMenuBtn(){
    let c=document.getElementById("elite-board-menu-items");
    if(c&&!document.getElementById("btn-streak-leaderboard")){
      c.insertAdjacentHTML("beforeend",`
        <button id="btn-streak-leaderboard" class="elite-menu-btn" onclick="window.LaylStreaks.openLeaderboard()">
          <div class="elite-menu-btn-content">
            <div class="elite-menu-icon-wrapper" style="background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #f59e0b;">
              <i class="fas fa-fire-alt"></i>
            </div>
            <span class="elite-menu-text">أبطال الشعلة (الستريك)</span>
          </div>
          <i class="fas fa-chevron-left elite-menu-chevron"></i>
        </button>
      `)
    }
  },
  injectPrivacyToggle(){
    let row=document.getElementById("streak-visibility-row");
    if(!1===t.settings.allowUserHide){row&&(row.style.display="none");return}
    if(row){row.style.display="";return}
    let c=document.querySelector("#privacy-group .settings-group-content");
    if(c&&!document.getElementById("toggle-streak-visibility-checkbox")){
      let html=`
        <div class="classic-settings-toggle-row" id="streak-visibility-row">
          <div class="toggle-label">
            <i class="fa-solid fa-fire-flame-curved"></i>
            <span>إخفاء الشعلة من قائمة المتواجدين</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-streak-visibility-checkbox">
            <span class="slider round"></span>
          </label>
        </div>`;
      let ref=document.getElementById("change-password-trigger-btn");
      ref?ref.insertAdjacentHTML("beforebegin",html):c.insertAdjacentHTML("beforeend",html);
      let cb=document.getElementById("toggle-streak-visibility-checkbox");
      if(t.myUsername){let d=t.cache[a.sanitizeName(t.myUsername)];d&&d.hidden&&(cb.checked=!0)}
      cb.addEventListener("change",function(){
        let val=this.checked;
        if(!t.myUsername||!t.db){alert("الرجاء إرسال رسالة واحدة في الشات أو تحديث الصفحة لتفعيل هويتك بنجاح.");this.checked=!val;return}
        t.db.ref(`${e.dbPath}/${a.sanitizeName(t.myUsername)}/hidden`).set(val).catch(()=>{})
      })
    }
  },
  injectAdminStreakEditor(){
    if(!a.isAdmin()){
      let old=document.getElementById("admin-edit-streak-container");
      old&&old.remove();
      return
    }
    let sec=document.getElementById("profile-admin-edit-section");
    if(sec){
      let u=null,uEl=document.querySelector("#userProfileModal [data-username]");
      uEl&&(u=uEl.getAttribute("data-username"));
      let cur=0,bEl=document.querySelector("#userProfileModal .night-streak");
      if(bEl)cur=parseInt(bEl.getAttribute("data-streak"))||0;
      else if(u){let san=a.sanitizeName(u);t.cache[san]&&(cur=t.cache[san].streak||0)}
      if(document.getElementById("admin-edit-streak-container")){
        let inp=document.getElementById("profile-admin-streak-input");
        inp&&(inp.value=cur);
        return
      }
      let html=`
        <div id="admin-edit-streak-container" class="classic-admin-row">
          <div class="classic-admin-label-text">الشعلة <i class="fas fa-fire ms-1 text-warning"></i></div>
          <div class="classic-admin-input-container">
            <input type="number" id="profile-admin-streak-input" class="classic-admin-input" min="0" max="999999" value="${cur}">
          </div>
          <button id="btn-save-profile-streak" class="classic-admin-action-btn" type="button">
            حفظ <i class="fas fa-check"></i>
          </button>
        </div>`;
      let mov=document.getElementById("move-member-container");
      mov?mov.insertAdjacentHTML("beforebegin",html):sec.insertAdjacentHTML("beforeend",html);
      document.getElementById("btn-save-profile-streak").addEventListener("click",function(ev){
        if(ev.preventDefault(),!t.db){alert("غير متصل بقاعدة البيانات.");return}
        if(!a.isAdmin()){alert("هذه الميزة متاحة للإدارة فقط.");return}
        let target=null,el=document.querySelector("#userProfileModal [data-username]");
        if(el&&(target=el.getAttribute("data-username")),!target){alert("لم يتم العثور على هوية العضو.");return}
        let val=parseInt(document.getElementById("profile-admin-streak-input").value)||0,san=a.sanitizeName(target),tm=a.getTodayMidnight();
        let oldVal=t.cache[san]?.streak||0;
        t.db.ref(`${e.dbPath}/${san}`).update({
          streak:val,
          lastLogin:tm,
          originalName:target,
          lostStreak:null,
          recoveryDeadline:null,
          adminAlert:`تم إضافة "${val}" ستريك لك من قبل صاحب الموقع`
        }).then(()=>{
          admin.logAction("تعديل من البروفايل",target,`${oldVal} ➔ ${val}`);
          this.innerHTML='تم <i class="fas fa-check-double"></i>';
          this.style.backgroundColor="#198754";
          setTimeout(()=>{this.innerHTML='حفظ <i class="fas fa-check"></i>';this.style.backgroundColor=""},2e3)
        }).catch(()=>{alert("حدث خطأ أثناء الحفظ.")})
      })
    }
  },
  injectAdminPanelBtn(){
    if(!a.isAdmin()){
      document.querySelectorAll("#btn-lail-streak-admin").forEach(x=>x.remove());
      return
    }
    document.querySelectorAll(".modern-classic-list").forEach(list=>{
      if(!list||list.querySelector("#btn-lail-streak-admin"))return;
      let b=document.createElement("button");
      b.type="button";
      b.className="modern-classic-item";
      b.id="btn-lail-streak-admin";
      b.innerHTML=`
        <div class="modern-classic-item-content">
          <div class="modern-classic-icon-wrapper" style="background: linear-gradient(135deg, #4a091a, #8b1836); color: #D4AF37;">
            <i class="fas fa-fire-alt"></i>
          </div>
          <span class="modern-classic-text">لوحة تحكم الستريك</span>
        </div>
        <i class="fas fa-chevron-left modern-classic-chevron"></i>`;
      b.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();admin.open()});
      let anchor=list.querySelector("#btn-lail-zajel-admin")||list.querySelector("#btn-lail-zajel");
      anchor?anchor.insertAdjacentElement("afterend",b):list.appendChild(b)
    })
  },
  setupEventDelegation(){
    document.body.addEventListener("click",ev=>{
      let el=ev.target.closest(".night-streak");
      if(el){
        ev.preventDefault();ev.stopPropagation();
        i.openStreakInfo(el.getAttribute("data-name")||"العضو",el.getAttribute("data-streak")||0,el.getAttribute("data-userkey")||null)
      }
    })
  }
};

let l={
  updateUserLogin(username,displayName){
    if(!username||!username.trim()||!1===t.settings.enabled)return;
    let san=a.sanitizeName(username),mySan=a.sanitizeName(t.myUsername);
    if(mySan&&mySan===san&&t.db){
      let ref=t.db.ref(`${e.dbPath}/${san}`),tm=a.getTodayMidnight();
      let step=t.settings.doubleMode?2:1;
      let minRec=Number(t.settings.minStreakForRecovery)||10;
      let defChances=Number(t.settings.defaultChances);
      defChances=isNaN(defChances)?3:defChances;
      let recMs=a.getRecoveryMs();
      setTimeout(()=>{
        ref.transaction(cur=>{
          let disp=displayName||username;
          if(null===cur)return{streak:step,lastLogin:tm,originalName:username,displayName:disp,recoveryChances:defChances};
          if(cur.excluded)return;
          let last=cur.lastLogin,st=cur.streak||0,ch=void 0!==cur.recoveryChances?cur.recoveryChances:defChances;
          let diff=Math.round((tm-last)/864e5);
          if(diff<=0){
            if(cur.displayName===disp&&cur.lastLogin===tm)return;
            return{...cur,displayName:disp,lastLogin:tm}
          }
          let isProt=t.settings.globalFreeze||(cur.frozenUntil&&cur.frozenUntil>Date.now());
          if(1===diff||(diff>1&&isProt)){
            return{...cur,streak:st+step,lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:ch,lostStreak:cur.lostStreak||null,recoveryDeadline:cur.recoveryDeadline||null,recoveryProgress:cur.recoveryProgress||null}
          }
          return st>=minRec&&ch>0
            ?{...cur,streak:1,lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:ch-1,lostStreak:st,recoveryDeadline:Date.now()+recMs,recoveryProgress:0}
            :{...cur,streak:1,lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:defChances,lostStreak:null,recoveryDeadline:null,recoveryProgress:null}
        }).catch(()=>{})
      },500*Math.random())
    }
  },
  handleRecoveryProgress(){
    if(!t.myUsername||!1===t.settings.enabled)return;
    let san=a.sanitizeName(t.myUsername),cur=t.cache[san],target=a.getRecoveryTarget();
    if(cur&&!cur.excluded&&cur.lostStreak&&cur.recoveryDeadline>Date.now()){
      t.db.ref(`${e.dbPath}/${san}`).transaction(d=>{
        if(d&&d.lostStreak){
          let prog=(d.recoveryProgress||0)+1;
          return prog>=target
            ?(setTimeout(()=>{r.fireConfetti();i.showDailyWelcome(d.lostStreak)},500),{...d,streak:d.lostStreak,lastLogin:a.getTodayMidnight(),lostStreak:null,recoveryDeadline:null,recoveryProgress:null})
            :{...d,recoveryProgress:prog}
        }
        return d
      })
    }
  },
  updateRecoveryBanner(){
    let id="layl-recovery-banner",el=document.getElementById(id),target=a.getRecoveryTarget();
    if(t.myUsername&&!1!==t.settings.enabled){
      let cur=t.cache[a.sanitizeName(t.myUsername)];
      if(cur&&!cur.excluded&&cur.lostStreak&&cur.recoveryDeadline>Date.now()){
        let html=`<span>🔥 شعلتك (<b style="color:#fef08a">${cur.lostStreak}</b>) انطفأت! أرسل رسائل لاستردادها (الفرص المتوفرة: ${(cur.recoveryChances||0)+1})</span> <span style="background:rgba(0,0,0,0.3); padding:3px 10px; border-radius:8px;">تقدمك: <b style="color:#fbbf24">${cur.recoveryProgress||0}</b>/${target}</span>`;
        if(el)el.innerHTML=html;
        else{let div=document.createElement("div");div.id=id;div.innerHTML=html;document.body.appendChild(div)}
        return
      }
    }
    el&&el.remove()
  },
  declineRecovery(){
    if(!t.myUsername||!t.db)return;
    let san=a.sanitizeName(t.myUsername);
    t.db.ref(`${e.dbPath}/${san}`).transaction(d=>{
      if(d&&d.lostStreak)return{...d,recoveryChances:(d.recoveryChances||0)+1,lostStreak:null,recoveryDeadline:null,recoveryProgress:null};
      return d
    }).then(()=>{r.closeModal();l.updateRecoveryBanner()}).catch(()=>{})
  }
};

let admin={
  activeTab:"members",
  logAction(action,target,details){
    if(!t.db)return;
    t.db.ref(`${e.adminPath}/logs`).push({
      admin:t.myUsername||"الإدارة",
      action:action||"",
      target:target||"-",
      details:details||"",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).catch(()=>{})
  },
  open(){
    if(!a.isAdmin())return alert("هذه اللوحة متاحة للإدارة فقط.");
    let ov=document.getElementById("layl-streak-admin-modal");
    ov&&ov.remove();
    ov=document.createElement("div");
    ov.id="layl-streak-admin-modal";
    ov.className="lsa-overlay";
    ov.innerHTML=`
      <div class="lsa-box">
        <div class="lsa-header">
          <div class="lsa-title"><i class="fas fa-fire-alt"></i> لوحة تحكم الستريك</div>
          <div class="lsa-row" style="gap:6px;">
            <button type="button" class="lsa-ctrl-btn" id="lsa-btn-add-user" title="إضافة/منح ستريك لعضو جديد"><i class="fas fa-user-plus"></i></button>
            <button type="button" class="lsa-ctrl-btn" id="lsa-btn-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
            <button type="button" class="lsa-ctrl-btn lsa-ctrl-close" id="lsa-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lsa-stats">
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-active">0</div><div class="lsa-stat-lbl">شعلات نشطة</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-max">0</div><div class="lsa-stat-lbl">أعلى شعلة</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-rec">0</div><div class="lsa-stat-lbl">تحت الاسترجاع</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-mode">...</div><div class="lsa-stat-lbl">الوضع الحالي</div></div>
        </div>
        <div class="lsa-tabs">
          <button type="button" class="lsa-tab active" data-ltab="members"><i class="fas fa-users"></i> الأعضاء</button>
          <button type="button" class="lsa-tab" data-ltab="recovery"><i class="fas fa-life-ring"></i> الاسترجاع</button>
          <button type="button" class="lsa-tab" data-ltab="events"><i class="fas fa-bolt"></i> فعاليات وطوارئ</button>
          <button type="button" class="lsa-tab" data-ltab="stats"><i class="fas fa-trophy"></i> التوب والإحصاء</button>
          <button type="button" class="lsa-tab" data-ltab="logs"><i class="fas fa-history"></i> السجل</button>
          <button type="button" class="lsa-tab" data-ltab="settings"><i class="fas fa-cog"></i> إعدادات وصيانة</button>
        </div>
        <div class="lsa-body">
          <div id="lsa-view-members" class="lsa-view active">
            <div class="lsa-row" style="margin-bottom:8px;">
              <input type="text" id="lsa-mem-search" class="lsa-input" style="flex:1; min-width:140px;" placeholder="🔍 ابحث بالاسم أو اليوزر أو الملاحظة..." autocomplete="off">
              <select id="lsa-mem-filter" class="lsa-input" style="width:118px;">
                <option value="all">الكل</option>
                <option value="active">النشطون</option>
                <option value="online">المتواجدون الآن</option>
                <option value="expired">المنطفئون</option>
                <option value="frozen">محميون (درع)</option>
                <option value="recovery">تحت الاسترجاع</option>
                <option value="tier100">👑 100+ يوم</option>
                <option value="tier30">⚡ 30-99 يوم</option>
                <option value="hidden">مخفيون</option>
                <option value="excluded">مستبعدون</option>
              </select>
              <select id="lsa-mem-sort" class="lsa-input" style="width:102px;">
                <option value="streak_desc">الأعلى ستريك</option>
                <option value="streak_asc">الأقل ستريك</option>
                <option value="recent">الأحدث دخولاً</option>
                <option value="name">أبجدي</option>
              </select>
            </div>
            <div id="lsa-mem-count" style="font-size:11px; color:#94a3b8; margin-bottom:6px;"></div>
            <div id="lsa-members-list"></div>
          </div>

          <div id="lsa-view-recovery" class="lsa-view">
            <div class="lsa-card">
              <div class="lsa-card-title">
                <span><i class="fas fa-life-ring"></i> الأعضاء في تحدي الاسترجاع حالياً</span>
                <button type="button" id="lsa-btn-pardon-all" class="lsa-btn lsa-btn-success lsa-mini"><i class="fas fa-magic"></i> عفو شامل للكل</button>
              </div>
              <div id="lsa-recovery-list"></div>
            </div>
            <div class="lsa-card">
              <div class="lsa-card-title"><span><i class="fas fa-redo"></i> تشغيل تحدي استرجاع يدوي لعضو</span></div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div><label class="lsa-label">اسم المستخدم</label><input type="text" id="lsa-mrec-user" class="lsa-input" placeholder="Username"></div>
                <div><label class="lsa-label">الشعلة المراد استرجاعها</label><input type="number" id="lsa-mrec-val" class="lsa-input" min="2" placeholder="مثلاً: 45"></div>
              </div>
              <button type="button" id="lsa-btn-start-mrec" class="lsa-btn lsa-btn-crimson" style="padding:8px;"><i class="fas fa-fire"></i> بدء التحدي للعضو الآن</button>
            </div>
          </div>

          <div id="lsa-view-events" class="lsa-view">
            <div class="lsa-card" style="border-color:rgba(56,189,248,0.35);">
              <div class="lsa-card-title" style="color:#7dd3fc;"><span><i class="fas fa-shield-alt"></i> وضع الطوارئ وإنقاذ الشعلات</span></div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:9px; line-height:1.5;">
                في حال تعطل الشات أو الصيانة، استخدم هذه الأزرار لتمديد آخر دخول للجميع ومنع انطفاء أي شعلة.
              </div>
              <div class="lsa-grid-2" style="margin-bottom:8px;">
                <button type="button" id="lsa-btn-rescue-2d" class="lsa-btn lsa-btn-info"><i class="fas fa-first-aid"></i> إنقاذ نشطاء آخر 48 ساعة</button>
                <button type="button" id="lsa-btn-rescue-4d" class="lsa-btn lsa-btn-info"><i class="fas fa-medkit"></i> إنقاذ آخر 4 أيام</button>
              </div>
              <div class="lsa-setting-row" style="margin-bottom:6px;">
                <div><div style="font-size:12px; font-weight:bold;">❄️ الحماية الشاملة (تجميد جميع الشعلات)</div><div style="font-size:10.5px; color:#94a3b8;">لن تنطفئ شعلة أي عضو عند الغياب أثناء التفعيل</div></div>
                <label class="lsa-switch"><input type="checkbox" id="lsa-ev-freeze"><span class="lsa-slider"></span></label>
              </div>
              <div class="lsa-setting-row" style="margin-bottom:0;">
                <div><div style="font-size:12px; font-weight:bold; color:#e9d5ff;">⚡ فعالية الدبل (×2 ستريك يومياً)</div><div style="font-size:10.5px; color:#94a3b8;">يزيد رصيد كل عضو بيومين عند دخوله اليومي</div></div>
                <label class="lsa-switch"><input type="checkbox" id="lsa-ev-double"><span class="lsa-slider"></span></label>
              </div>
            </div>

            <div class="lsa-card" style="border-color:rgba(212,175,55,0.35);">
              <div class="lsa-card-title">
                <span><i class="fas fa-gift"></i> إهداء جماعي (أيام ستريك + احتفال)</span>
                <span id="lsa-ev-online-badge" class="lsa-tag lsa-tag-gold">0 متواجد</span>
              </div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div>
                  <label class="lsa-label">الفئة المستهدفة</label>
                  <select id="lsa-gift-scope" class="lsa-input">
                    <option value="online">المتواجدون حالياً بالشات</option>
                    <option value="active">جميع أصحاب الشعلات النشطة</option>
                    <option value="tier30">أصحاب 30+ يوم (⚡👑)</option>
                    <option value="tier100">أصحاب 100+ يوم (👑)</option>
                  </select>
                </div>
                <div>
                  <label class="lsa-label">عدد الأيام المضافة (0 = إشعار فقط)</label>
                  <input type="number" id="lsa-gift-amount" class="lsa-input" value="1" min="0" max="500">
                </div>
              </div>
              <div style="margin-bottom:8px;">
                <label class="lsa-label">رسالة التهنئة والاحتفال (اختياري)</label>
                <input type="text" id="lsa-gift-msg" class="lsa-input" placeholder="مثلاً: هدية الإدارة بمناسبة الفعالية! 🎉">
              </div>
              <button type="button" id="lsa-btn-bulk-gift" class="lsa-btn lsa-btn-gold"><i class="fas fa-paper-plane"></i> تنفيذ الإهداء الجماعي الآن</button>
            </div>

            <div class="lsa-card">
              <div class="lsa-card-title"><span><i class="fas fa-user-shield"></i> منح درع حماية جماعي</span></div>
              <div class="lsa-grid-2" style="margin-bottom:8px;">
                <div>
                  <label class="lsa-label">الفئة</label>
                  <select id="lsa-shield-scope" class="lsa-input">
                    <option value="online">المتواجدون الآن</option>
                    <option value="active">جميع النشطين</option>
                  </select>
                </div>
                <div>
                  <label class="lsa-label">مدة الدرع</label>
                  <select id="lsa-shield-days" class="lsa-input">
                    <option value="1">24 ساعة</option>
                    <option value="3" selected>3 أيام</option>
                    <option value="7">أسبوع (7 أيام)</option>
                    <option value="14">أسبوعان</option>
                    <option value="30">شهر</option>
                  </select>
                </div>
              </div>
              <button type="button" id="lsa-btn-bulk-shield" class="lsa-btn lsa-btn-dark" style="width:100%;"><i class="fas fa-shield-alt"></i> تفعيل الدرع للفئة المختارة</button>
            </div>
          </div>

          <div id="lsa-view-stats" class="lsa-view">
            <div id="lsa-stats-body"></div>
          </div>

          <div id="lsa-view-logs" class="lsa-view">
            <div class="lsa-row" style="margin-bottom:8px;">
              <input type="text" id="lsa-log-search" class="lsa-input" style="flex:1;" placeholder="🔍 ابحث في سجل الإدارة..." autocomplete="off">
              <button type="button" id="lsa-btn-clear-logs" class="lsa-btn lsa-btn-danger lsa-mini" style="padding:8px 10px;"><i class="fas fa-trash"></i> مسح السجل</button>
            </div>
            <div id="lsa-logs-list"></div>
          </div>

          <div id="lsa-view-settings" class="lsa-view">
            <div class="lsa-setting-row">
              <div><div style="font-size:12.5px; font-weight:bold;">تفعيل نظام الستريك</div><div style="font-size:10.5px; color:#94a3b8;">إيقافه يخفي الشعلات ويوقف الاحتساب مؤقتاً</div></div>
              <label class="lsa-switch"><input type="checkbox" id="lsa-set-enabled"><span class="lsa-slider"></span></label>
            </div>
            <div class="lsa-setting-row">
              <div><div style="font-size:12.5px; font-weight:bold;">السماح للأعضاء بإخفاء شعلتهم</div><div style="font-size:10.5px; color:#94a3b8;">إظهار/إخفاء زر الخصوصية في الإعدادات</div></div>
              <label class="lsa-switch"><input type="checkbox" id="lsa-set-hide"><span class="lsa-slider"></span></label>
            </div>
            <div class="lsa-grid-3" style="margin-bottom:8px;">
              <div><label class="lsa-label">رسائل الاسترجاع</label><input type="number" id="lsa-set-rectarget" class="lsa-input" min="5" max="2000"></div>
              <div><label class="lsa-label">مهلة الاسترجاع (ساعة)</label><input type="number" id="lsa-set-rechours" class="lsa-input" min="1" max="168"></div>
              <div><label class="lsa-label">أدنى شعلة للتحدي</label><input type="number" id="lsa-set-minrec" class="lsa-input" min="2" max="500"></div>
              <div><label class="lsa-label">فرص الاسترجاع</label><input type="number" id="lsa-set-chances" class="lsa-input" min="0" max="50"></div>
              <div><label class="lsa-label">ظهور بالشات من</label><input type="number" id="lsa-set-chatmin" class="lsa-input" min="1" max="10000"></div>
              <div><label class="lsa-label">عدد أبطال التوب</label><input type="number" id="lsa-set-lblimit" class="lsa-input" min="3" max="100"></div>
              <div><label class="lsa-label">فئة البرق ⚡ من</label><input type="number" id="lsa-set-midmin" class="lsa-input" min="2" max="5000"></div>
              <div><label class="lsa-label">فئة التاج 👑 من</label><input type="number" id="lsa-set-himin" class="lsa-input" min="5" max="10000"></div>
            </div>
            <div style="margin-bottom:10px;">
              <label class="lsa-label">رسائل الترحيب اليومي المخصصة (رسالة في كل سطر — اتركه فارغاً للافتراضي)</label>
              <textarea id="lsa-set-welcomes" class="lsa-input" rows="2" style="resize:vertical;" placeholder="يوم جديد، وشعلة لا تنطفئ..."></textarea>
            </div>
            <button type="button" id="lsa-btn-save-settings" class="lsa-btn lsa-btn-gold" style="margin-bottom:14px;"><i class="fas fa-save"></i> حفظ إعدادات النظام</button>

            <div class="lsa-card" style="border-color:rgba(255,255,255,0.1);">
              <div class="lsa-card-title" style="color:#cbd5e1;"><span><i class="fas fa-broom"></i> أدوات الصيانة وتخفيف الفايربيس</span></div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <button type="button" id="lsa-btn-clean-30" class="lsa-btn lsa-btn-dark"><i class="fas fa-eraser"></i> حذف الخاملين (+30 يوم)</button>
                <button type="button" id="lsa-btn-clean-60" class="lsa-btn lsa-btn-dark"><i class="fas fa-eraser"></i> حذف الخاملين (+60 يوم)</button>
                <button type="button" id="lsa-btn-clean-low" class="lsa-btn lsa-btn-dark"><i class="fas fa-filter"></i> حذف ستريك 1 (+7 أيام)</button>
                <button type="button" id="lsa-btn-clean-alerts" class="lsa-btn lsa-btn-dark"><i class="fas fa-bell-slash"></i> مسح الهدايا العالقة</button>
              </div>
              <button type="button" id="lsa-btn-reset-chances" class="lsa-btn lsa-btn-dark" style="width:100%; margin-bottom:10px;"><i class="fas fa-sync"></i> تجديد فرص الاسترجاع للجميع للافتراضي</button>
              <div class="lsa-card-title" style="color:#7dd3fc; margin-top:4px;"><span><i class="fas fa-database"></i> النسخ الاحتياطي والاستعادة (JSON)</span></div>
              <div class="lsa-grid-2">
                <button type="button" id="lsa-btn-export" class="lsa-btn lsa-btn-info"><i class="fas fa-download"></i> تصدير نسخة JSON</button>
                <button type="button" id="lsa-btn-import" class="lsa-btn lsa-btn-success"><i class="fas fa-upload"></i> استيراد نسخة JSON</button>
              </div>
              <input type="file" id="lsa-import-file" accept=".json,application/json" style="display:none;">
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&admin.close()});
    document.getElementById("lsa-btn-close").onclick=()=>admin.close();
    document.getElementById("lsa-btn-refresh").onclick=()=>{admin.refreshAll();admin.loadLogs();r.showToast("🔄 تم تحديث بيانات اللوحة")};
    document.getElementById("lsa-btn-add-user").onclick=()=>admin.openUserEditor(null);
    ov.querySelectorAll("[data-ltab]").forEach(btn=>{
      btn.onclick=()=>admin.switchTab(btn.getAttribute("data-ltab"))
    });
    document.getElementById("lsa-mem-search").oninput=()=>admin.renderMembers();
    document.getElementById("lsa-mem-filter").onchange=()=>admin.renderMembers();
    document.getElementById("lsa-mem-sort").onchange=()=>admin.renderMembers();
    document.getElementById("lsa-btn-pardon-all").onclick=()=>admin.pardonAllRecovery();
    document.getElementById("lsa-btn-start-mrec").onclick=()=>admin.startManualRecovery();
    document.getElementById("lsa-btn-rescue-2d").onclick=()=>admin.rescueInactive(2);
    document.getElementById("lsa-btn-rescue-4d").onclick=()=>admin.rescueInactive(4);
    document.getElementById("lsa-ev-freeze").onchange=function(){
      admin.patchSetting({globalFreeze:this.checked},this.checked?"❄️ تم تفعيل الحماية الشاملة لجميع الشعلات":"☀️ تم إيقاف الحماية الشاملة")
    };
    document.getElementById("lsa-ev-double").onchange=function(){
      admin.patchSetting({doubleMode:this.checked},this.checked?"⚡ تم تفعيل فعالية الدبل (×2)":"تم إيقاف وضع الدبل")
    };
    document.getElementById("lsa-btn-bulk-gift").onclick=()=>admin.sendBulkGift();
    document.getElementById("lsa-btn-bulk-shield").onclick=()=>admin.grantBulkShield();
    document.getElementById("lsa-log-search").oninput=()=>admin.renderLogs();
    document.getElementById("lsa-btn-clear-logs").onclick=()=>admin.clearLogs();
    document.getElementById("lsa-set-enabled").onchange=function(){
      admin.patchSetting({enabled:this.checked},this.checked?"✅ تم تفعيل نظام الستريك":"🛑 تم إيقاف نظام الستريك مؤقتاً")
    };
    document.getElementById("lsa-set-hide").onchange=function(){
      admin.patchSetting({allowUserHide:this.checked},this.checked?"✅ تم السماح بإخفاء الشعلة":"🚫 تم منع إخفاء الشعلة")
    };
    document.getElementById("lsa-btn-save-settings").onclick=()=>admin.saveSettings();
    document.getElementById("lsa-btn-clean-30").onclick=()=>admin.cleanInactive(30);
    document.getElementById("lsa-btn-clean-60").onclick=()=>admin.cleanInactive(60);
    document.getElementById("lsa-btn-clean-low").onclick=()=>admin.cleanLowStreaks(7);
    document.getElementById("lsa-btn-clean-alerts").onclick=()=>admin.cleanAlerts();
    document.getElementById("lsa-btn-reset-chances").onclick=()=>admin.resetAllChances();
    document.getElementById("lsa-btn-export").onclick=()=>admin.exportBackup();
    document.getElementById("lsa-btn-import").onclick=()=>document.getElementById("lsa-import-file").click();
    document.getElementById("lsa-import-file").onchange=ev=>admin.importBackup(ev);

    requestAnimationFrame(()=>ov.classList.add("active"));
    admin.activeTab="members";
    admin.populateSettingsUI();
    admin.refreshAll();
    admin.loadLogs()
  },
  close(){
    let sub=document.getElementById("layl-streak-sub-modal");
    sub&&sub.remove();
    let ov=document.getElementById("layl-streak-admin-modal");
    ov&&ov.remove()
  },
  switchTab(tab){
    let ov=document.getElementById("layl-streak-admin-modal");
    if(!ov)return;
    admin.activeTab=tab;
    ov.querySelectorAll("[data-ltab]").forEach(x=>x.classList.toggle("active",x.getAttribute("data-ltab")===tab));
    ov.querySelectorAll(".lsa-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`lsa-view-${tab}`);
    v&&v.classList.add("active");
    if("members"===tab)admin.renderMembers();
    else if("recovery"===tab)admin.renderRecovery();
    else if("events"===tab)admin.updateEventsUI();
    else if("stats"===tab)admin.renderStats();
    else if("logs"===tab)admin.loadLogs();
    else if("settings"===tab)admin.populateSettingsUI()
  },
  refreshAll(){
    if(!document.getElementById("layl-streak-admin-modal"))return;
    admin.updateHeaderStats();
    if("members"===admin.activeTab)admin.renderMembers();
    else if("recovery"===admin.activeTab)admin.renderRecovery();
    else if("events"===admin.activeTab)admin.updateEventsUI();
    else if("stats"===admin.activeTab)admin.renderStats()
  },
  updateHeaderStats(){
    if(!document.getElementById("lsa-st-active"))return;
    let tm=a.getTodayMidnight(),activeCnt=0,maxVal=0,recCnt=0;
    Object.values(t.cache||{}).forEach(d=>{
      if(!d||"object"!=typeof d)return;
      if(d.lostStreak&&d.recoveryDeadline>Date.now())recCnt++;
      if(a.isUserActive(d,tm)){
        activeCnt++;
        if((d.streak||0)>maxVal)maxVal=d.streak||0
      }
    });
    document.getElementById("lsa-st-active").textContent=activeCnt;
    document.getElementById("lsa-st-max").textContent=maxVal?a.formatNumber(maxVal):"0";
    let recEl=document.getElementById("lsa-st-rec");
    recEl.textContent=recCnt;
    recEl.style.color=recCnt>0?"#f87171":"#94a3b8";
    let modeEl=document.getElementById("lsa-st-mode");
    if(!1===t.settings.enabled){modeEl.textContent="متوقف";modeEl.style.color="#f87171"}
    else if(t.settings.globalFreeze){modeEl.textContent="❄️ حماية";modeEl.style.color="#38bdf8"}
    else if(t.settings.doubleMode){modeEl.textContent="⚡ دبل ×2";modeEl.style.color="#c084fc"}
    else{modeEl.textContent="مفعّل";modeEl.style.color="#34d399"}
  },
  renderMembers(){
    let c=document.getElementById("lsa-members-list"),cntEl=document.getElementById("lsa-mem-count");
    if(!c)return;
    let q=(document.getElementById("lsa-mem-search")?.value||"").trim().toLowerCase();
    let flt=document.getElementById("lsa-mem-filter")?.value||"all";
    let srt=document.getElementById("lsa-mem-sort")?.value||"streak_desc";
    let tm=a.getTodayMidnight(),now=Date.now();
    let onlineSet=new Set(a.getOnlineUsers().map(x=>x.san));
    let hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    let list=Object.entries(t.cache||{}).filter(([,d])=>d&&"object"==typeof d).map(([k,d])=>{
      let isAct=a.isUserActive(d,tm),isFrz=Boolean(d.frozenUntil&&d.frozenUntil>now),isRec=Boolean(d.lostStreak&&d.recoveryDeadline>now);
      return{key:k,d,name:d.displayName||d.originalName||k,orig:d.originalName||k,streak:d.streak||0,isAct,isFrz,isRec,isOnline:onlineSet.has(k)}
    }).filter(x=>{
      if("active"===flt&&!x.isAct)return!1;
      if("online"===flt&&!x.isOnline)return!1;
      if("expired"===flt&&(x.isAct||x.isRec||x.d.excluded))return!1;
      if("frozen"===flt&&!x.isFrz)return!1;
      if("recovery"===flt&&!x.isRec)return!1;
      if("tier100"===flt&&!(x.isAct&&x.streak>=hiMin))return!1;
      if("tier30"===flt&&!(x.isAct&&x.streak>=miMin&&x.streak<hiMin))return!1;
      if("hidden"===flt&&!(x.d.hidden||x.d.hideFromBoard))return!1;
      if("excluded"===flt&&!x.d.excluded)return!1;
      if(q){
        let hay=`${x.key} ${x.name} ${x.orig} ${x.d.note||""}`.toLowerCase();
        if(!hay.includes(q))return!1
      }
      return!0
    });
    list.sort((x,y)=>{
      if("streak_asc"===srt)return x.streak-y.streak;
      if("recent"===srt)return(y.d.lastLogin||0)-(x.d.lastLogin||0);
      if("name"===srt)return x.name.localeCompare(y.name,"ar");
      return y.streak-x.streak
    });
    cntEl&&(cntEl.textContent=`عرض ${Math.min(list.length,80)} من أصل ${list.length} عضو`);
    if(!list.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:25px;">لا توجد نتائج مطابقة.</div>';
      return
    }
    let html="";
    list.slice(0,80).forEach(x=>{
      let ico=a.getTierIcon(x.streak,x.d);
      let tags=[];
      if(x.isOnline)tags.push('<span class="lsa-tag lsa-tag-green">● متصل</span>');
      if(x.d.excluded)tags.push('<span class="lsa-tag lsa-tag-red">🚫 مستبعد</span>');
      else if(x.isRec)tags.push(`<span class="lsa-tag lsa-tag-red">💨 استرجاع (${x.d.lostStreak})</span>`);
      else if(x.isAct)tags.push('<span class="lsa-tag lsa-tag-gold">نشط</span>');
      else tags.push('<span class="lsa-tag lsa-tag-gray">منطفئ</span>');
      if(x.isFrz)tags.push(`<span class="lsa-tag lsa-tag-blue">🛡️ ${a.formatRemaining(x.d.frozenUntil)}</span>`);
      if(x.d.hidden)tags.push('<span class="lsa-tag lsa-tag-purple">مخفي</span>');
      if(x.d.hideFromBoard)tags.push('<span class="lsa-tag lsa-tag-gray">بلا توب</span>');
      let noteHtml=x.d.note?`<div style="font-size:11px; color:#fbbf24; margin-top:4px;"><i class="fas fa-sticky-note"></i> ${a.escapeHTML(x.d.note)}</div>`:"";
      html+=`
        <div class="lsa-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
            <div style="min-width:0; flex:1;">
              <div style="font-size:13.5px; font-weight:700; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.escapeHTML(x.name)} <span style="font-size:11px; color:#64748b; font-weight:normal;">(@${a.escapeHTML(x.orig)})</span></div>
              <div class="lsa-row" style="gap:4px; margin-top:4px;">${tags.join("")}</div>
            </div>
            <div style="text-align:center; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:4px 10px; flex-shrink:0;">
              <div style="font-size:15px; font-weight:900; color:#D4AF37;">${ico} ${a.formatNumber(x.streak)}</div>
              <div style="font-size:9.5px; color:#94a3b8;">فرص: ${void 0!==x.d.recoveryChances?x.d.recoveryChances:3}</div>
            </div>
          </div>
          <div style="font-size:10.5px; color:#94a3b8;">آخر دخول: ${a.formatDayDate(x.d.lastLogin)}</div>
          ${noteHtml}
          <div class="lsa-row" style="margin-top:8px; gap:5px;">
            <button type="button" class="lsa-btn lsa-btn-gold lsa-mini lsa-act-edit" data-key="${a.escapeHTML(x.key)}" style="width:auto;"><i class="fas fa-edit"></i> تعديل شامل</button>
            <button type="button" class="lsa-btn lsa-btn-success lsa-mini lsa-act-plus1" data-key="${a.escapeHTML(x.key)}">+1 يوم</button>
            <button type="button" class="lsa-btn lsa-btn-info lsa-mini lsa-act-shield3" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-shield-alt"></i> ${x.isFrz?"فك الدرع":"درع 3 أيام"}</button>
            <button type="button" class="lsa-btn lsa-btn-danger lsa-mini lsa-act-del" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".lsa-act-edit").forEach(b=>b.onclick=()=>admin.openUserEditor(b.dataset.key));
    c.querySelectorAll(".lsa-act-plus1").forEach(b=>b.onclick=()=>admin.quickAddStreak(b.dataset.key,1));
    c.querySelectorAll(".lsa-act-shield3").forEach(b=>b.onclick=()=>admin.toggleQuickShield(b.dataset.key));
    c.querySelectorAll(".lsa-act-del").forEach(b=>b.onclick=()=>admin.deleteUser(b.dataset.key))
  },
  openUserEditor(key){
    let isNew=!key,d=key&&t.cache[key]?t.cache[key]:{};
    let sub=document.getElementById("layl-streak-sub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-streak-sub-modal";
    sub.className="lsa-overlay lsa-sub-overlay";
    let emojis=["","🔥","⚡","👑","💎","🦅","🌙","⭐","❤️‍🔥","🛡️","⚜️"];
    let curEmoji=d.customEmoji||"";
    let isFrz=Boolean(d.frozenUntil&&d.frozenUntil>Date.now());
    let emojiBtns=emojis.map(em=>`<button type="button" class="lsa-emoji-btn ${curEmoji===em?"active":""}" data-em="${em}">${em||"افتراضي"}</button>`).join("");
    sub.innerHTML=`
      <div class="lsa-box lsa-sub-box">
        <div class="lsa-header">
          <div class="lsa-title"><i class="fas fa-user-cog"></i> ${isNew?"إضافة/منح ستريك لعضو":"تعديل عضو: "+a.escapeHTML(d.displayName||key)}</div>
          <button type="button" class="lsa-ctrl-btn lsa-ctrl-close" id="lsa-sub-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lsa-body">
          ${isNew?`
            <div style="margin-bottom:8px;">
              <label class="lsa-label">اسم المستخدم (Username)</label>
              <input type="text" id="lsa-ed-user" class="lsa-input" placeholder="اكتب اسم المستخدم بدقة..." autocomplete="off">
            </div>`:`<div style="font-size:11.5px; color:#94a3b8; margin-bottom:8px;">المعرّف: <b style="color:#D4AF37;">@${a.escapeHTML(d.originalName||key)}</b> ${isFrz?`• 🛡️ محمي (${a.formatRemaining(d.frozenUntil)})`:""}</div>`}
          <div class="lsa-grid-2" style="margin-bottom:6px;">
            <div>
              <label class="lsa-label">رصيد الشعلة (الأيام)</label>
              <input type="number" id="lsa-ed-streak" class="lsa-input" min="0" max="999999" value="${d.streak||0}">
            </div>
            <div>
              <label class="lsa-label">فرص الاسترجاع</label>
              <input type="number" id="lsa-ed-chances" class="lsa-input" min="0" max="99" value="${void 0!==d.recoveryChances?d.recoveryChances:(Number(t.settings.defaultChances)||3)}">
            </div>
          </div>
          <div class="lsa-row" style="gap:4px; margin-bottom:10px;">
            <button type="button" class="lsa-quick-pill" data-delta="-10">-10</button>
            <button type="button" class="lsa-quick-pill" data-delta="-1">-1</button>
            <button type="button" class="lsa-quick-pill" data-delta="1">+1</button>
            <button type="button" class="lsa-quick-pill" data-delta="5">+5</button>
            <button type="button" class="lsa-quick-pill" data-delta="10">+10</button>
            <button type="button" class="lsa-quick-pill" data-delta="30">+30</button>
            <button type="button" class="lsa-quick-pill" data-delta="0" style="color:#f87171;">تصفير</button>
          </div>
          <div style="margin-bottom:9px;">
            <label class="lsa-label">🛡️ درع الحماية (تجميد الشعلة)</label>
            <select id="lsa-ed-freeze" class="lsa-input">
              <option value="keep">${isFrz?"إبقاء الدرع الحالي ("+a.formatRemaining(d.frozenUntil)+")":"بدون درع"}</option>
              <option value="none">إزالة الدرع</option>
              <option value="1">حماية 24 ساعة</option>
              <option value="3">حماية 3 أيام</option>
              <option value="7">حماية أسبوع (7 أيام)</option>
              <option value="14">حماية أسبوعين</option>
              <option value="30">حماية شهر (30 يوم)</option>
              <option value="3650">حماية دائمة</option>
            </select>
          </div>
          <div style="margin-bottom:9px;">
            <label class="lsa-label">أيقونة الشعلة المخصصة (تترك افتراضي للوضع العادي)</label>
            <div class="lsa-row" style="gap:4px; margin-bottom:5px;">${emojiBtns}</div>
            <input type="text" id="lsa-ed-emoji" class="lsa-input" maxlength="4" value="${a.escapeHTML(curEmoji)}" placeholder="أو اكتب أي إيموجي مخصص...">
          </div>
          <div class="lsa-card" style="padding:8px 10px; margin-bottom:9px;">
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lsa-ed-today" checked> تنشيط آخر دخول لليوم وإلغاء أي انطفاء
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lsa-ed-hidden" ${d.hidden?"checked":""}> إخفاء الشعلة من قائمة المتواجدين
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lsa-ed-hideboard" ${d.hideFromBoard?"checked":""}> إخفاء العضو من لوحة أبطال الشعلة فقط
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; color:#fca5a5; cursor:pointer;">
              <input type="checkbox" id="lsa-ed-excluded" ${d.excluded?"checked":""}> استبعاد العضو من نظام الستريك بالكامل
            </label>
          </div>
          <div style="margin-bottom:8px;">
            <label class="lsa-label">ملاحظة إدارية (سرية لا يراها العضو)</label>
            <input type="text" id="lsa-ed-note" class="lsa-input" value="${a.escapeHTML(d.note||"")}" placeholder="مثلاً: فائز مسابقة، إجازة سفر...">
          </div>
          <div style="margin-bottom:10px;">
            <label class="lsa-label">🎁 رسالة هدية/إشعار للعضو مع كونفيتي (اختياري)</label>
            <input type="text" id="lsa-ed-alert" class="lsa-input" placeholder="اتركه فارغاً للحفظ الصامت...">
          </div>
          <button type="button" id="lsa-ed-save" class="lsa-btn lsa-btn-gold"><i class="fas fa-check"></i> حفظ التعديلات</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lsa-sub-close").onclick=()=>sub.remove();
    sub.querySelectorAll(".lsa-quick-pill").forEach(btn=>{
      btn.onclick=()=>{
        let inp=document.getElementById("lsa-ed-streak"),delta=Number(btn.dataset.delta);
        inp.value=0===delta?0:Math.max(0,(parseInt(inp.value)||0)+delta)
      }
    });
    sub.querySelectorAll(".lsa-emoji-btn").forEach(btn=>{
      btn.onclick=()=>{
        sub.querySelectorAll(".lsa-emoji-btn").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("lsa-ed-emoji").value=btn.dataset.em
      }
    });
    document.getElementById("lsa-ed-save").onclick=()=>{
      if(!t.db)return alert("غير متصل بالقاعدة.");
      let rawUser=isNew?(document.getElementById("lsa-ed-user")?.value||"").trim():(d.originalName||key);
      let san=isNew?a.sanitizeName(rawUser):key;
      if(!san)return alert("أدخل اسم المستخدم أولاً.");
      let newSt=Math.max(0,parseInt(document.getElementById("lsa-ed-streak").value)||0);
      let newCh=Math.max(0,parseInt(document.getElementById("lsa-ed-chances").value)||0);
      let frzVal=document.getElementById("lsa-ed-freeze").value;
      let frozenUntil="keep"===frzVal?(d.frozenUntil||null):"none"===frzVal?null:Date.now()+Number(frzVal)*e.dayInMs;
      let emoji=(document.getElementById("lsa-ed-emoji").value||"").trim()||null;
      let resetToday=document.getElementById("lsa-ed-today").checked;
      let hidden=document.getElementById("lsa-ed-hidden").checked;
      let hideFromBoard=document.getElementById("lsa-ed-hideboard").checked;
      let excluded=document.getElementById("lsa-ed-excluded").checked;
      let note=(document.getElementById("lsa-ed-note").value||"").trim()||null;
      let alertTxt=(document.getElementById("lsa-ed-alert").value||"").trim();
      let payload={
        streak:newSt,
        recoveryChances:newCh,
        originalName:d.originalName||rawUser,
        displayName:d.displayName||rawUser,
        frozenUntil,
        customEmoji:emoji,
        hidden,
        hideFromBoard,
        excluded,
        note
      };
      if(resetToday||isNew){
        payload.lastLogin=a.getTodayMidnight();
        payload.lostStreak=null;
        payload.recoveryDeadline=null;
        payload.recoveryProgress=null
      }
      if(alertTxt)payload.adminAlert=alertTxt;
      let oldSt=d.streak||0;
      t.db.ref(`${e.dbPath}/${san}`).update(payload).then(()=>{
        admin.logAction(isNew?"إضافة عضو":"تعديل عضو",rawUser,`${oldSt} ➔ ${newSt}${frozenUntil?" | درع":""}${excluded?" | مستبعد":""}`);
        r.showToast("✅ تم حفظ بيانات العضو بنجاح");
        sub.remove();
        admin.refreshAll()
      }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  quickAddStreak(key,delta){
    if(!t.db||!t.cache[key])return;
    let d=t.cache[key],oldSt=d.streak||0,newSt=Math.max(0,oldSt+delta);
    t.db.ref(`${e.dbPath}/${key}`).update({streak:newSt,lastLogin:a.getTodayMidnight(),lostStreak:null,recoveryDeadline:null,recoveryProgress:null}).then(()=>{
      admin.logAction("زيادة سريعة",d.originalName||key,`${oldSt} ➔ ${newSt}`);
      r.showToast(`🔥 تم رفع شعلة (${d.displayName||key}) إلى ${newSt}`)
    }).catch(()=>alert("❌ فشل التحديث."))
  },
  toggleQuickShield(key){
    if(!t.db||!t.cache[key])return;
    let d=t.cache[key],isFrz=Boolean(d.frozenUntil&&d.frozenUntil>Date.now());
    let next=isFrz?null:Date.now()+3*e.dayInMs;
    t.db.ref(`${e.dbPath}/${key}/frozenUntil`).set(next).then(()=>{
      admin.logAction(isFrz?"إزالة درع":"منح درع 3 أيام",d.originalName||key,isFrz?"فك التجميد":"حماية 3 أيام");
      r.showToast(isFrz?"تمت إزالة الدرع":"🛡️ تم تفعيل درع حماية 3 أيام")
    }).catch(()=>alert("❌ فشل التحديث."))
  },
  deleteUser(key){
    let d=t.cache[key];
    if(!t.db||!confirm(`حذف سجل الستريك للعضو (${d?.displayName||key}) نهائياً؟`))return;
    t.db.ref(`${e.dbPath}/${key}`).remove().then(()=>{
      admin.logAction("حذف سجل عضو",d?.originalName||key,`الرصيد السابق: ${d?.streak||0}`);
      r.showToast("🗑️ تم حذف سجل العضو")
    }).catch(()=>alert("❌ فشل الحذف."))
  },
  renderRecovery(){
    let c=document.getElementById("lsa-recovery-list");
    if(!c)return;
    let now=Date.now(),target=a.getRecoveryTarget();
    let list=Object.entries(t.cache||{}).filter(([,d])=>d&&d.lostStreak&&d.recoveryDeadline>now).sort((x,y)=>(y[1].lostStreak||0)-(x[1].lostStreak||0));
    if(!list.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:18px; font-size:12.5px;">لا يوجد أعضاء في تحدي الاسترجاع حالياً.</div>';
      return
    }
    let html="";
    list.forEach(([key,d])=>{
      let prog=d.recoveryProgress||0,pct=Math.min(100,Math.round((prog/target)*100));
      html+=`
        <div class="lsa-card" style="background:rgba(0,0,0,0.22);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <b style="color:#f8fafc; font-size:13px;">${a.escapeHTML(d.displayName||d.originalName||key)}</b>
            <span class="lsa-tag lsa-tag-red">الشعلة المفقودة: ${d.lostStreak} 🔥</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-top:4px;">
            <span>التقدم: <b style="color:#fbbf24;">${prog} / ${target}</b> (${pct}%)</span>
            <span>المتبقي: <b style="color:#7dd3fc;">${a.formatRemaining(d.recoveryDeadline)}</b></span>
          </div>
          <div class="lsa-prog-wrap"><div class="lsa-prog-bar" style="width:${pct}%;"></div></div>
          <div class="lsa-row" style="gap:5px; margin-top:7px;">
            <button type="button" class="lsa-btn lsa-btn-success lsa-mini lsa-rec-pardon" data-key="${a.escapeHTML(key)}"><i class="fas fa-check-circle"></i> عفو وإرجاع فوري</button>
            <button type="button" class="lsa-btn lsa-btn-info lsa-mini lsa-rec-extend" data-key="${a.escapeHTML(key)}"><i class="fas fa-clock"></i> +24 ساعة</button>
            <button type="button" class="lsa-btn lsa-btn-dark lsa-mini lsa-rec-boost" data-key="${a.escapeHTML(key)}">+50 رسالة</button>
            <button type="button" class="lsa-btn lsa-btn-danger lsa-mini lsa-rec-cancel" data-key="${a.escapeHTML(key)}">إلغاء</button>
          </div>
        </div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".lsa-rec-pardon").forEach(b=>b.onclick=()=>admin.pardonOne(b.dataset.key));
    c.querySelectorAll(".lsa-rec-extend").forEach(b=>b.onclick=()=>admin.extendRecovery(b.dataset.key));
    c.querySelectorAll(".lsa-rec-boost").forEach(b=>b.onclick=()=>admin.boostRecovery(b.dataset.key,50));
    c.querySelectorAll(".lsa-rec-cancel").forEach(b=>b.onclick=()=>admin.cancelRecovery(b.dataset.key))
  },
  pardonOne(key){
    let d=t.cache[key];
    if(!t.db||!d||!d.lostStreak)return;
    let restored=d.lostStreak;
    t.db.ref(`${e.dbPath}/${key}`).update({
      streak:restored,
      lastLogin:a.getTodayMidnight(),
      lostStreak:null,
      recoveryDeadline:null,
      recoveryProgress:null,
      adminAlert:`تم استرجاع شعلتك (${restored} يوم) بعفو فوري من الإدارة! 👑`
    }).then(()=>{
      admin.logAction("عفو استرجاع",d.originalName||key,`استعادة ${restored} يوم`);
      r.showToast(`✅ تمت استعادة شعلة (${d.displayName||key})`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  extendRecovery(key){
    let d=t.cache[key];
    if(!t.db||!d||!d.recoveryDeadline)return;
    t.db.ref(`${e.dbPath}/${key}/recoveryDeadline`).set(d.recoveryDeadline+e.dayInMs).then(()=>{
      admin.logAction("تمديد استرجاع",d.originalName||key,"+24 ساعة");
      r.showToast("⏱️ تم تمديد المهلة 24 ساعة")
    })
  },
  boostRecovery(key,add){
    let d=t.cache[key];
    if(!t.db||!d||!d.lostStreak)return;
    let target=a.getRecoveryTarget(),next=(d.recoveryProgress||0)+add;
    if(next>=target){admin.pardonOne(key);return}
    t.db.ref(`${e.dbPath}/${key}/recoveryProgress`).set(next).then(()=>{
      admin.logAction("تعزيز استرجاع",d.originalName||key,`+${add} رسالة (${next}/${target})`);
      r.showToast(`⚡ تم رفع التقدم إلى ${next}/${target}`)
    })
  },
  cancelRecovery(key){
    let d=t.cache[key];
    if(!t.db||!d||!confirm(`إلغاء تحدي الاسترجاع للعضو (${d.displayName||key})؟`))return;
    t.db.ref(`${e.dbPath}/${key}`).update({lostStreak:null,recoveryDeadline:null,recoveryProgress:null}).then(()=>{
      admin.logAction("إلغاء استرجاع",d.originalName||key,"إنهاء التحدي");
      r.showToast("تم إلغاء التحدي")
    })
  },
  pardonAllRecovery(){
    if(!t.db)return;
    let now=Date.now(),tm=a.getTodayMidnight(),updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(d&&d.lostStreak&&d.recoveryDeadline>now){
        updates[`${k}/streak`]=d.lostStreak;
        updates[`${k}/lastLogin`]=tm;
        updates[`${k}/lostStreak`]=null;
        updates[`${k}/recoveryDeadline`]=null;
        updates[`${k}/recoveryProgress`]=null;
        updates[`${k}/adminAlert`]=`تم استرجاع شعلتك (${d.lostStreak} يوم) ضمن عفو شامل من الإدارة! 🎉`;
        cnt++
      }
    });
    if(!cnt)return r.showToast("لا يوجد متحدون حالياً");
    if(!confirm(`استرجاع شعلات (${cnt}) عضو فوراً؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("عفو استرجاع شامل",`${cnt} عضو`,"استرجاع فوري للجميع");
      r.showToast(`🎉 تم العفو عن ${cnt} عضو بنجاح!`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  startManualRecovery(){
    if(!t.db)return;
    let raw=(document.getElementById("lsa-mrec-user")?.value||"").trim();
    let val=parseInt(document.getElementById("lsa-mrec-val")?.value)||0;
    let san=a.sanitizeName(raw);
    if(!san||val<2)return alert("أدخل اسم المستخدم وقيمة الشعلة المفقودة (2 فأكثر).");
    let d=t.cache[san]||{};
    t.db.ref(`${e.dbPath}/${san}`).update({
      originalName:d.originalName||raw,
      displayName:d.displayName||raw,
      streak:1,
      lastLogin:a.getTodayMidnight(),
      lostStreak:val,
      recoveryDeadline:Date.now()+a.getRecoveryMs(),
      recoveryProgress:0
    }).then(()=>{
      admin.logAction("تحدي استرجاع يدوي",raw,`لاسترجاع ${val} يوم`);
      document.getElementById("lsa-mrec-user").value="";
      document.getElementById("lsa-mrec-val").value="";
      r.showToast(`🔥 تم تشغيل تحدي الاسترجاع لـ (${raw})`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  updateEventsUI(){
    let frz=document.getElementById("lsa-ev-freeze"),dbl=document.getElementById("lsa-ev-double"),ob=document.getElementById("lsa-ev-online-badge");
    frz&&(frz.checked=Boolean(t.settings.globalFreeze));
    dbl&&(dbl.checked=Boolean(t.settings.doubleMode));
    ob&&(ob.textContent=`${a.getOnlineUsers().length} متواجد`)
  },
  rescueInactive(daysWindow){
    if(!t.db)return;
    let tm=a.getTodayMidnight(),cutoff=tm-daysWindow*e.dayInMs,updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(d&&!d.excluded&&(d.streak>0||d.lostStreak)&&(d.lastLogin||0)>=cutoff){
        if(d.lastLogin!==tm){updates[`${k}/lastLogin`]=tm;cnt++}
        if(d.lostStreak&&d.recoveryDeadline>Date.now()){
          updates[`${k}/streak`]=d.lostStreak;
          updates[`${k}/lostStreak`]=null;
          updates[`${k}/recoveryDeadline`]=null;
          updates[`${k}/recoveryProgress`]=null
        }
      }
    });
    if(!cnt)return r.showToast("جميع الشعلات في هذا النطاق محمية ونشطة بالفعل");
    if(!confirm(`تمديد آخر دخول لليوم وإنقاذ شعلات (${cnt}) عضو من آخر ${daysWindow} أيام؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("إنقاذ طوارئ",`${cnt} عضو`,`تمديد آخر دخول (نطاق ${daysWindow} أيام)`);
      r.showToast(`🛡️ تم إنقاذ وتمديد ${cnt} شعلة بنجاح!`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  sendBulkGift(){
    if(!t.db)return;
    let scope=document.getElementById("lsa-gift-scope")?.value||"online";
    let amt=Math.max(0,parseInt(document.getElementById("lsa-gift-amount")?.value)||0);
    let msg=(document.getElementById("lsa-gift-msg")?.value||"").trim();
    if(0===amt&&!msg)return alert("حدد عدد الأيام أو اكتب رسالة التهنئة على الأقل.");
    let tm=a.getTodayMidnight(),hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    let targets=[];
    if("online"===scope){
      targets=a.getOnlineUsers().map(u=>({key:u.san,orig:u.username,disp:u.displayName,d:t.cache[u.san]||{}}))
    }else{
      Object.entries(t.cache||{}).forEach(([k,d])=>{
        if(!a.isUserActive(d,tm))return;
        if("tier30"===scope&&(d.streak||0)<miMin)return;
        if("tier100"===scope&&(d.streak||0)<hiMin)return;
        targets.push({key:k,orig:d.originalName||k,disp:d.displayName||k,d})
      })
    }
    if(!targets.length)return alert("لا يوجد أعضاء مطابقون لهذه الفئة حالياً.");
    if(!confirm(`تنفيذ الإهداء (+${amt} يوم) إلى (${targets.length}) عضو؟`))return;
    let updates={};
    targets.forEach(x=>{
      let curSt=x.d.streak||0;
      if(amt>0){
        updates[`${x.key}/streak`]=curSt+amt;
        updates[`${x.key}/lastLogin`]=tm;
        updates[`${x.key}/originalName`]=x.d.originalName||x.orig;
        updates[`${x.key}/displayName`]=x.d.displayName||x.disp;
        if(void 0===x.d.recoveryChances)updates[`${x.key}/recoveryChances`]=Number(t.settings.defaultChances)||3
      }
      if(msg||amt>0){
        updates[`${x.key}/adminAlert`]=msg||`تم إهداؤك +${amt} يوم ستريك من إدارة الشات! 🎉`
      }
    });
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("إهداء جماعي",`${targets.length} عضو (${scope})`,`+${amt} يوم${msg?" | "+msg:""}`);
      document.getElementById("lsa-gift-msg").value="";
      r.showToast(`🎁 تم تنفيذ الإهداء لـ ${targets.length} عضو!`)
    }).catch(()=>alert("❌ فشل الإهداء الجماعي."))
  },
  grantBulkShield(){
    if(!t.db)return;
    let scope=document.getElementById("lsa-shield-scope")?.value||"online";
    let days=Number(document.getElementById("lsa-shield-days")?.value)||3;
    let tm=a.getTodayMidnight(),exp=Date.now()+days*e.dayInMs,keys=[];
    if("online"===scope)keys=a.getOnlineUsers().map(u=>u.san);
    else Object.entries(t.cache||{}).forEach(([k,d])=>{a.isUserActive(d,tm)&&keys.push(k)});
    if(!keys.length)return alert("لا يوجد أعضاء في الفئة المختارة.");
    if(!confirm(`منح درع حماية لمدة ${days} يوم إلى (${keys.length}) عضو؟`))return;
    let updates={};
    keys.forEach(k=>{updates[`${k}/frozenUntil`]=exp});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("درع جماعي",`${keys.length} عضو (${scope})`,`لمدة ${days} يوم`);
      r.showToast(`🛡️ تم منح الدرع لـ ${keys.length} عضو!`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  renderStats(){
    let c=document.getElementById("lsa-stats-body");
    if(!c)return;
    let tm=a.getTodayMidnight(),hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    let total=0,active=0,t100=0,t30=0,tLow=0,inactive=0,sumActive=0;
    let allActive=[],atRisk=[];
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(!d||"object"!=typeof d)return;
      total++;
      if(a.isUserActive(d,tm)){
        active++;
        let st=d.streak||0;
        sumActive+=st;
        if(st>=hiMin)t100++;else if(st>=miMin)t30++;else tLow++;
        allActive.push({key:k,d,st});
        if((d.lastLogin||0)<tm&&!a.isUserFrozen(d))atRisk.push({key:k,d,st})
      }else{inactive++}
    });
    allActive.sort((x,y)=>y.st-x.st);
    atRisk.sort((x,y)=>y.st-x.st);
    let avg=active?Math.round(sumActive/active):0;
    let pct=v=>active?Math.round((v/active)*100):0;
    let riskHtml=atRisk.length
      ?atRisk.slice(0,10).map(x=>`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:8px; margin-bottom:5px; font-size:12px;">
          <div style="min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <b style="color:#fecaca;">${a.escapeHTML(x.d.displayName||x.key)}</b>
            <span style="color:#D4AF37; margin-right:6px;">${a.getTierIcon(x.st,x.d)} ${x.st}</span>
          </div>
          <button type="button" class="lsa-btn lsa-btn-info lsa-mini lsa-risk-save" data-key="${a.escapeHTML(x.key)}">🛡️ حماية اليوم</button>
        </div>`).join("")
      :'<div style="color:#64748b; font-size:11.5px; text-align:center; padding:8px;">ممتاز! جميع أصحاب الشعلات دخلوا اليوم أو محميون.</div>';
    let topHtml=allActive.slice(0,25).map((x,idx)=>{
      let med=0===idx?"🏆":1===idx?"🥈":2===idx?"🥉":`${idx+1}.`;
      let flags=(x.d.hidden?' <span class="lsa-tag lsa-tag-purple">مخفي</span>':"")+(x.d.hideFromBoard?' <span class="lsa-tag lsa-tag-gray">بلا توب</span>':"")+(a.isUserFrozen(x.d)?' <span class="lsa-tag lsa-tag-blue">🛡️</span>':"");
      return`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:5px; font-size:12px; gap:6px;">
          <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
            <span style="min-width:22px; text-align:center;">${med}</span>
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;">${a.escapeHTML(x.d.displayName||x.key)}</span>
            ${flags}
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <span class="lsa-tag lsa-tag-gold">${a.getTierIcon(x.st,x.d)} ${a.formatNumber(x.st)}</span>
            <button type="button" class="lsa-btn lsa-btn-dark lsa-mini lsa-top-edit" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-pen"></i></button>
          </div>
        </div>`
    }).join("")||'<div style="color:#64748b; text-align:center; padding:12px;">لا توجد بيانات.</div>';

    c.innerHTML=`
      <div class="lsa-card">
        <div class="lsa-card-title"><span><i class="fas fa-chart-pie"></i> ملخص قاعدة الستريك</span></div>
        <div class="lsa-grid-3" style="text-align:center; margin-bottom:10px;">
          <div class="lsa-stat"><div class="lsa-stat-val">${total}</div><div class="lsa-stat-lbl">إجمالي المسجلين</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val">${a.formatNumber(sumActive)}</div><div class="lsa-stat-lbl">مجموع الأيام النشطة</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val">${avg} يوم</div><div class="lsa-stat-lbl">متوسط الشعلة</div></div>
        </div>
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:4px;">👑 فئة ${hiMin}+ يوم: <b>${t100}</b> (${pct(t100)}%)</div>
        <div class="lsa-prog-wrap"><div class="lsa-prog-bar" style="width:${pct(t100)}%; background:#D4AF37;"></div></div>
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:4px;">⚡ فئة ${miMin}-${hiMin-1} يوم: <b>${t30}</b> (${pct(t30)}%)</div>
        <div class="lsa-prog-wrap"><div class="lsa-prog-bar" style="width:${pct(t30)}%; background:#8b1836;"></div></div>
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:4px;">🔥 أقل من ${miMin} يوم: <b>${tLow}</b> (${pct(tLow)}%) • خاملون: <b>${inactive}</b></div>
        <div class="lsa-prog-wrap"><div class="lsa-prog-bar" style="width:${pct(tLow)}%; background:#38bdf8;"></div></div>
      </div>
      <div class="lsa-card" style="border-color:rgba(239,68,68,0.3);">
        <div class="lsa-card-title" style="color:#fca5a5;"><span><i class="fas fa-exclamation-triangle"></i> رادار الخطر (لم يدخلوا اليوم بعد)</span><span class="lsa-tag lsa-tag-red">${atRisk.length}</span></div>
        ${riskHtml}
      </div>
      <div class="lsa-card">
        <div class="lsa-card-title"><span><i class="fas fa-crown"></i> أعلى 25 شعلة (شامل المخفيين للآدمن)</span></div>
        ${topHtml}
      </div>`;
    c.querySelectorAll(".lsa-risk-save").forEach(b=>b.onclick=()=>{
      let k=b.dataset.key,d=t.cache[k];
      if(!t.db||!d)return;
      t.db.ref(`${e.dbPath}/${k}/lastLogin`).set(a.getTodayMidnight()).then(()=>{
        admin.logAction("حماية من الرادار",d.originalName||k,"تمديد آخر دخول لليوم");
        r.showToast(`🛡️ تم تأمين شعلة (${d.displayName||k}) لليوم`)
      })
    });
    c.querySelectorAll(".lsa-top-edit").forEach(b=>b.onclick=()=>admin.openUserEditor(b.dataset.key))
  },
  loadLogs(){
    let c=document.getElementById("lsa-logs-list");
    if(!t.db)return;
    c&&(c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>');
    t.db.ref(`${e.adminPath}/logs`).limitToLast(150).once("value").then(snap=>{
      let val=snap.val()||{};
      t.adminLogs=Object.entries(val).map(([id,d])=>Object.assign({id},d)).sort((x,y)=>(y.timestamp||0)-(x.timestamp||0));
      admin.renderLogs()
    }).catch(()=>{c&&(c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">تعذر قراءة السجل.</div>')})
  },
  renderLogs(){
    let c=document.getElementById("lsa-logs-list");
    if(!c)return;
    let q=(document.getElementById("lsa-log-search")?.value||"").trim().toLowerCase();
    let list=t.adminLogs.filter(x=>!q||`${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:22px;">لا توجد سجلات إدارية بعد.</div>';return}
    c.innerHTML=list.map(x=>`
      <div class="lsa-card" style="padding:8px 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:6px;">
          <span class="lsa-tag lsa-tag-gold">${a.escapeHTML(x.action)}</span>
          <span style="font-size:10px; color:#94a3b8;">${a.formatDate(x.timestamp)}</span>
        </div>
        <div style="font-size:12px; color:#e2e8f0;">
          <b style="color:#D4AF37;">${a.escapeHTML(x.admin)}</b>
          <span style="color:#64748b;"> ➔ </span>
          <b style="color:#38bdf8;">${a.escapeHTML(x.target)}</b>
        </div>
        ${x.details?`<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">${a.escapeHTML(x.details)}</div>`:""}
      </div>`).join("")
  },
  clearLogs(){
    if(!t.db||!confirm("مسح سجل العمليات الإدارية بالكامل؟"))return;
    t.db.ref(`${e.adminPath}/logs`).remove().then(()=>{t.adminLogs=[];admin.renderLogs();r.showToast("🗑️ تم مسح السجل")}).catch(()=>alert("❌ فشل المسح."))
  },
  populateSettingsUI(){
    let en=document.getElementById("lsa-set-enabled");
    if(!en)return;
    en.checked=!1!==t.settings.enabled;
    document.getElementById("lsa-set-hide").checked=!1!==t.settings.allowUserHide;
    document.getElementById("lsa-set-rectarget").value=Number(t.settings.recoveryTarget)||200;
    document.getElementById("lsa-set-rechours").value=Number(t.settings.recoveryHours)||36;
    document.getElementById("lsa-set-minrec").value=Number(t.settings.minStreakForRecovery)||10;
    document.getElementById("lsa-set-chances").value=void 0!==t.settings.defaultChances?t.settings.defaultChances:3;
    document.getElementById("lsa-set-chatmin").value=Number(t.settings.chatBadgeMin)||100;
    document.getElementById("lsa-set-lblimit").value=Number(t.settings.leaderboardLimit)||10;
    document.getElementById("lsa-set-midmin").value=Number(t.settings.midTierMin)||30;
    document.getElementById("lsa-set-himin").value=Number(t.settings.highTierMin)||100;
    document.getElementById("lsa-set-welcomes").value=t.settings.welcomeMessages||""
  },
  patchSetting(partial,toastMsg){
    if(!t.db)return;
    t.db.ref(`${e.adminPath}/settings`).update(partial).then(()=>{
      t.settings=Object.assign({},t.settings,partial);
      admin.logAction("تغيير إعداد","النظام",Object.entries(partial).map(([k,v])=>`${k}=${v}`).join(", "));
      o.triggerRender();
      admin.updateHeaderStats();
      r.showToast(toastMsg||"✅ تم التحديث")
    }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
  },
  saveSettings(){
    if(!t.db)return;
    let payload={
      enabled:document.getElementById("lsa-set-enabled").checked,
      allowUserHide:document.getElementById("lsa-set-hide").checked,
      doubleMode:Boolean(t.settings.doubleMode),
      globalFreeze:Boolean(t.settings.globalFreeze),
      recoveryTarget:Math.max(5,parseInt(document.getElementById("lsa-set-rectarget").value)||200),
      recoveryHours:Math.max(1,parseInt(document.getElementById("lsa-set-rechours").value)||36),
      minStreakForRecovery:Math.max(2,parseInt(document.getElementById("lsa-set-minrec").value)||10),
      defaultChances:Math.max(0,parseInt(document.getElementById("lsa-set-chances").value)||0),
      chatBadgeMin:Math.max(1,parseInt(document.getElementById("lsa-set-chatmin").value)||100),
      leaderboardLimit:Math.max(3,parseInt(document.getElementById("lsa-set-lblimit").value)||10),
      midTierMin:Math.max(2,parseInt(document.getElementById("lsa-set-midmin").value)||30),
      highTierMin:Math.max(5,parseInt(document.getElementById("lsa-set-himin").value)||100),
      welcomeMessages:(document.getElementById("lsa-set-welcomes").value||"").trim()
    };
    t.db.ref(`${e.adminPath}/settings`).set(payload).then(()=>{
      t.settings=payload;
      admin.logAction("حفظ الإعدادات","النظام",`الاسترجاع:${payload.recoveryTarget} | الشات:${payload.chatBadgeMin}`);
      o.triggerRender();
      admin.updateHeaderStats();
      r.showToast("✅ تم حفظ جميع الإعدادات")
    }).catch(()=>alert("❌ فشل الحفظ."))
  },
  cleanInactive(days){
    if(!t.db)return;
    let cutoff=a.getTodayMidnight()-days*e.dayInMs,updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(d&&!a.isUserFrozen(d)&&(d.lastLogin||0)<cutoff){updates[k]=null;cnt++}
    });
    if(!cnt)return r.showToast(`لا توجد حسابات خاملة لأكثر من ${days} يوم`);
    if(!confirm(`سيتم حذف (${cnt}) سجل خامل منذ أكثر من ${days} يوم لتخفيف قاعدة البيانات. متابعة؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("تنظيف خاملين",`${cnt} سجل`,`خامل أكثر من ${days} يوم`);
      r.showToast(`🧹 تم تنظيف ${cnt} سجل خامل`)
    }).catch(()=>alert("❌ فشل التنظيف."))
  },
  cleanLowStreaks(days){
    if(!t.db)return;
    let cutoff=a.getTodayMidnight()-days*e.dayInMs,updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(d&&!a.isUserFrozen(d)&&(d.streak||0)<=1&&!d.lostStreak&&(d.lastLogin||0)<cutoff){updates[k]=null;cnt++}
    });
    if(!cnt)return r.showToast("لا توجد سجلات منخفضة قديمة للتنظيف");
    if(!confirm(`حذف (${cnt}) سجل برصيد 1 وخامل لأكثر من ${days} أيام؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("تنظيف ستريك 1",`${cnt} سجل`,`أقدم من ${days} أيام`);
      r.showToast(`🧹 تم حذف ${cnt} سجل`)
    }).catch(()=>alert("❌ فشل التنظيف."))
  },
  cleanAlerts(){
    if(!t.db)return;
    let updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{if(d&&d.adminAlert){updates[`${k}/adminAlert`]=null;cnt++}});
    if(!cnt)return r.showToast("لا توجد إشعارات هدايا عالقة");
    if(!confirm(`مسح (${cnt}) إشعار هدية غير مقروء؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("مسح الهدايا العالقة",`${cnt} عضو`,"تنظيف adminAlert");
      r.showToast(`🧹 تم مسح ${cnt} إشعار عالق`)
    })
  },
  resetAllChances(){
    if(!t.db)return;
    let def=Number(t.settings.defaultChances);def=isNaN(def)?3:def;
    let keys=Object.keys(t.cache||{});
    if(!keys.length)return;
    if(!confirm(`تعيين فرص الاسترجاع لجميع الأعضاء (${keys.length}) إلى (${def})؟`))return;
    let updates={};
    keys.forEach(k=>{updates[`${k}/recoveryChances`]=def});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("تجديد فرص الاسترجاع",`${keys.length} عضو`,`تعيين إلى ${def}`);
      r.showToast(`✅ تم تجديد الفرص لـ ${keys.length} عضو`)
    })
  },
  exportBackup(){
    let data=JSON.stringify(t.cache||{},null,2);
    let blob=new Blob([data],{type:"application/json;charset=utf-8"});
    let url=URL.createObjectURL(blob),link=document.createElement("a");
    let day=new Date().toISOString().split("T")[0];
    link.href=url;link.download=`layl-streaks-backup-${day}.json`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1e3);
    r.showToast("💾 تم تحميل النسخة الاحتياطية")
  },
  importBackup(ev){
    let file=ev.target.files&&ev.target.files[0];
    ev.target.value="";
    if(!file||!t.db)return;
    let reader=new FileReader;
    reader.onload=()=>{
      try{
        let parsed=JSON.parse(reader.result);
        if(!parsed||"object"!=typeof parsed||Array.isArray(parsed))return alert("ملف JSON غير صالح.");
        let cnt=Object.keys(parsed).length;
        if(!cnt)return alert("الملف فارغ.");
        let replace=confirm(`تم قراءة (${cnt}) سجل.\nاضغط (موافق / OK) للاستبدال الكامل، أو (إلغاء / Cancel) للدمج مع البيانات الحالية.`);
        if(!confirm(`تأكيد نهائي: ${replace?"استبدال كامل":"دمج"} لـ (${cnt}) سجل؟`))return;
        let op=replace?t.db.ref(e.dbPath).set(parsed):t.db.ref(e.dbPath).update(parsed);
        op.then(()=>{
          admin.logAction("استيراد نسخة احتياطية",`${cnt} سجل`,replace?"استبدال كامل":"دمج");
          r.showToast(`✅ تم استيراد ${cnt} سجل بنجاح`)
        }).catch(()=>alert("❌ فشل الاستيراد في Firebase."))
      }catch{alert("❌ تعذر قراءة ملف JSON.")}
    };
    reader.readAsText(file)
  }
};

let d=()=>{
  let now=new Date,ms=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0).getTime()-now.getTime();
  setTimeout(()=>{
    if(t.myUsername&&!1!==t.settings.enabled){
      let el=document.querySelector(`#sidebar-users-container [data-username="${t.myUsername}"]`),ok=!1;
      if(el){
        let ghost=el.classList.contains("ghost-user"),st=el.getAttribute("style")||"";
        let gray=st.includes("#6c757d")||st.includes("#808080")||st.includes("rgb(108, 117, 125)")||st.includes("rgb(128, 128, 128)");
        ghost||gray||(ok=!0)
      }else ok=!0;
      ok&&(l.updateUserLogin(t.myUsername,t.myUsername),setTimeout(()=>{
        let san=a.sanitizeName(t.myUsername),cur=t.cache[san],day=new Date().toISOString().split("T")[0];
        localStorage.setItem("layl_streak_welcomed_date",day);
        cur&&!cur.excluded&&(i.showDailyWelcome(cur.streak),(window.confetti||document.getElementById("canvas-confetti"))&&r.fireConfetti());
        o.triggerRender()
      },2e3))
    }else o.triggerRender();
    d()
  },ms+1e3)
};

let c=()=>{
  new MutationObserver(muts=>{
    let need=!1;
    if(a.isAdmin()&&!document.getElementById("btn-lail-streak-admin")&&document.querySelector(".modern-classic-list"))need=!0;
    for(let m of muts){
      if("attributes"===m.type&&(m.target.classList?.contains("user-identity")||"userProfileModal"===m.target.id))need=!0;
      else if("childList"===m.type){
        for(let node of m.addedNodes){
          if(1===node.nodeType){
            let myMsg=node.classList?.contains("message-row")?node:node.querySelector(".message-row");
            if(myMsg&&t.myUsername&&myMsg.querySelector(`.message-text[data-username="${t.myUsername}"]`)){l.handleRecoveryProgress()}
            let rows=node.querySelectorAll?node.querySelectorAll(".message-row, .msg-status-login, .user-join-message, .styled-sys-msg, .sys-msg-login"):[];
            [node,...Array.from(rows)].forEach(el=>{
              if(el&&el.classList){
                let u=n(el);
                let ghost=el.classList.contains("ghost-user")||(el.getAttribute("style")||"").includes("#6c757d")||(el.getAttribute("style")||"").includes("#808080");
                if(!ghost&&u&&u.username){
                  (el.classList.contains("msg-self")||el.querySelector(".msg-self"))&&(localStorage.setItem("pc_username",u.username),t.myUsername=u.username,o.injectAdminPanelBtn(),o.injectAdminStreakEditor());
                  (el.classList.contains("msg-status-login")||el.classList.contains("user-join-message")||el.classList.contains("sys-msg-login"))&&l.updateUserLogin(u.username,u.displayName)
                }
              }
            });
            if("elite-board-menu-items"===node.id||"privacy-group"===node.id||"profile-admin-edit-section"===node.id||"btn-lail-zajel-admin"===node.id||node.classList?.contains("modern-classic-list")||node.classList?.contains("classic-settings-container")||node.classList?.contains("message-row")||node.classList?.contains("user-pro-item")||node.classList?.contains("list-group-item")||node.classList?.contains("user-identity")||node.querySelector(".modern-classic-list, .message-row, .user-pro-item, .list-group-item, .user-identity-name, #sidebar-users-container, #profile-header-classic-bar, #privacy-group, #elite-board-menu-items, #profile-admin-edit-section"))need=!0
          }
        }
      }
    }
    need&&o.triggerRender()
  }).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-username","data-user-id","class"]})
};

(()=>{
  r.injectStyles();
  o.setupEventDelegation();
  s();
  let me=document.querySelector(".my-message, .msg-self, #profile-header-classic-bar, .sidebar-content .user-identity");
  if(me){
    let u=n(me);
    u&&u.username&&(t.myUsername=u.username,localStorage.setItem("pc_username",t.myUsername))
  }
  o.triggerRender();
  d();
  let boot=()=>{
    if("undefined"!=typeof firebase){
      firebase.apps.length||firebase.initializeApp(e.firebase);
      t.db=firebase.database();
      t.db.ref("admins").on("value",snap=>{
        let v=snap.val()||{};
        t.adminUsers=Object.keys(v);
        o.injectAdminPanelBtn();
        o.injectAdminStreakEditor();
        a.isAdmin()||admin.close()
      });
      t.db.ref(`${e.adminPath}/settings`).on("value",snap=>{
        let v=snap.val();
        t.settings=v&&"object"==typeof v?Object.assign({},defaultSettings,v):Object.assign({},defaultSettings);
        o.triggerRender();
        l.updateRecoveryBanner();
        admin.updateHeaderStats()
      });
      t.db.ref(e.dbPath).on("value",snap=>{
        t.cache=snap.val()||{};
        localStorage.setItem(e.cacheKey,JSON.stringify(t.cache));
        o.triggerRender();
        admin.refreshAll();
        if(t.myUsername&&t.cache[a.sanitizeName(t.myUsername)]){
          let cur=t.cache[a.sanitizeName(t.myUsername)],day=new Date().toISOString().split("T")[0];
          l.updateRecoveryBanner();
          if(cur.adminAlert){
            r.showModal(`
              <div style="text-align:center;">
                <div style="font-size:50px; margin: 0 auto 15px auto; animation: layl-float 3s infinite;">🎁</div>
                <h3 style="color:#D4AF37; margin:0 0 15px; font-family:'Segoe UI', tahoma, sans-serif;">هدية من الإدارة</h3>
                <div style="color:#cbd5e1; font-size:15px; background:rgba(0,0,0,0.25); padding:20px 15px; border-radius:16px; border:1px solid rgba(255,255,255,0.04); line-height: 1.6;">
                  ${a.escapeHTML(cur.adminAlert)}
                </div>
                <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-gold">حسناً، شكراً</button>
              </div>
            `);
            r.fireConfetti();
            t.db.ref(`${e.dbPath}/${a.sanitizeName(t.myUsername)}/adminAlert`).remove()
          }
          if(!cur.excluded&&cur.lostStreak&&cur.recoveryDeadline>Date.now()&&window.layl_recovery_shown!==cur.lostStreak){
            window.layl_recovery_shown=cur.lostStreak;
            i.showRecoveryChallenge(cur.lostStreak,cur.recoveryChances)
          }
          if(!cur.excluded&&!cur.lostStreak&&cur.lastLogin===a.getTodayMidnight()&&localStorage.getItem("layl_streak_welcomed_date")!==day){
            localStorage.setItem("layl_streak_welcomed_date",day);
            i.showDailyWelcome(cur.streak)
          }
          let celeb=JSON.parse(localStorage.getItem("layl_streak_celebrated")||"[]");
          if(!cur.excluded&&e.milestones.includes(cur.streak)&&!celeb.includes(cur.streak)){
            celeb.push(cur.streak);
            localStorage.setItem("layl_streak_celebrated",JSON.stringify(celeb));
            if(window.confetti)r.fireConfetti();
            else{
              let sc=document.createElement("script");
              sc.src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
              sc.onload=r.fireConfetti;
              document.head.appendChild(sc)
            }
          }
        }
      });
      document.querySelectorAll(".user-identity, .message-row, .user-pro-item").forEach(el=>{
        let u=n(el);
        let ghost=el.classList.contains("ghost-user")||(el.getAttribute("style")||"").includes("#6c757d")||(el.getAttribute("style")||"").includes("#808080");
        if(!ghost&&u&&u.username)l.updateUserLogin(u.username,u.displayName)
      })
    }else{setTimeout(boot,500)}
  };
  if("undefined"!=typeof firebase||document.getElementById("firebase-core-script"))boot();
  else{
    let sc=document.createElement("script");
    sc.id="firebase-core-script";
    sc.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
    document.head.appendChild(sc);
    sc.onload=()=>{
      let dbSc=document.createElement("script");
      dbSc.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
      document.head.appendChild(dbSc);
      dbSc.onload=boot
    }
  }
  c();
  setTimeout(()=>o.injectAdminPanelBtn(),1e3);
  window.LaylStreaks={
    openLeaderboard:i.openLeaderboard,
    closeModal:r.closeModal,
    declineRecovery:l.declineRecovery,
    openAdmin:admin.open,
    closeAdmin:admin.close
  }
})()}();
