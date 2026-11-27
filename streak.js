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
  milestones:"10,30,50,100,200,365,500,1000",
  welcomeMessages:""
};

let t={
  db:null,
  cache:JSON.parse(localStorage.getItem(e.cacheKey)||"{}"),
  displayNameMap:new Map,
  myUsername:localStorage.getItem("pc_username")||null,
  isRendering:!1,
  observer:null,
  observerPaused:0,
  pendingFull:!1,
  pendingNodes:new Set,
  renderRaf:null,
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
  rebuildDisplayNameMap(){
    t.displayNameMap.clear();
    for(let[k,v]of Object.entries(t.cache||{})){
      if(!v)continue;
      if(v.displayName){
        let d=v.displayName.trim().toLowerCase();
        d&&!t.displayNameMap.has(d)&&t.displayNameMap.set(d,k)
      }
      if(v.originalName){
        let o2=v.originalName.trim().toLowerCase();
        o2&&!t.displayNameMap.has(o2)&&t.displayNameMap.set(o2,k)
      }
    }
  },
  findUsernameByDisplayName(x){
    if(!x)return null;
    return t.displayNameMap.get(x.trim().toLowerCase())||null
  },
  getCleanText(x){
    if(!x)return null;
    if(!x.firstElementChild||!x.querySelector("img, i, svg, .user-identity-badge-icon, .user-identity-super"))return x.textContent.trim();
    let c=x.cloneNode(!0);
    return c.querySelectorAll("img, i, svg, .user-identity-badge-icon, .user-identity-super").forEach(y=>y.remove()),c.textContent.trim()
  },
  isAdminKey(key){
    if(!key||!t.adminUsers.length)return!1;
    let s=a.sanitizeName(key);
    return t.adminUsers.includes(key)||(s&&t.adminUsers.includes(s))||t.adminUsers.some(ad=>a.sanitizeName(ad)===s)
  },
  isAdmin(){
    return Boolean(t.myUsername&&a.isAdminKey(t.myUsername))
  },
  getRecoveryTarget(){
    let v=Number(t.settings.recoveryTarget);
    return v>0?v:e.recoveryTarget
  },
  getRecoveryMs(){
    let h=Number(t.settings.recoveryHours);
    return(h>0?h:36)*36e5
  },
  getMilestones(){
    let raw=String(t.settings.milestones||"").split(/[,،\s]+/).map(x=>parseInt(x,10)).filter(x=>!isNaN(x)&&x>0);
    return raw.length?raw:e.milestones
  },
  isUserFrozen(d){
    return Boolean(t.settings.globalFreeze||(d&&d.frozenUntil&&d.frozenUntil>Date.now()))
  },
  isGainLocked(d){
    return Boolean(d&&d.gainFrozenUntil&&d.gainFrozenUntil>Date.now())
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
  isBotElement(el){
    if(!el)return!1;
    let item=el.closest(".user-pro-item, .list-group-item, .user-list-item")||el;
    if(item.classList&&(item.classList.contains("bot-user")||item.classList.contains("is-bot")))return!0;
    if("true"===item.getAttribute("data-bot")||"bot"===item.getAttribute("data-type"))return!0;
    let imgs=item.querySelectorAll("img");
    for(let img of imgs){
      let src=(img.getAttribute("src")||"").toLowerCase();
      let orig=(img.getAttribute("data-original-src")||"").toLowerCase();
      if(src.includes("/uploads/bots/")||orig.includes("/uploads/bots/"))return!0
    }
    return!1
  },
  isGhostElement(el,deep){
    if(!el)return!0;
    let item=el.closest(".user-pro-item, .list-group-item, .user-list-item")||el;
    let hasGhostCls=node=>Boolean(node&&node.classList&&(node.classList.contains("ghost-user")||node.classList.contains("is-ghost")||node.classList.contains("offline-user")||node.classList.contains("offline")||node.classList.contains("fake-user")||node.classList.contains("disconnected")||node.classList.contains("user-ghost")));
    if(hasGhostCls(el)||hasGhostCls(item)||item.querySelector(".ghost-user, .is-ghost, .offline-user, .fake-user"))return!0;
    if("true"===item.getAttribute("data-ghost")||"true"===el.getAttribute("data-ghost")||"false"===item.getAttribute("data-online")||"offline"===item.getAttribute("data-status"))return!0;
    let rb=(item.getAttribute("data-real-border")||"").toLowerCase();
    if(rb&&(rb.includes("#808080")||rb.includes("#6c757d")||rb.includes("rgb(128, 128, 128)")||rb.includes("rgb(108, 117, 125)")))return!0;
    let st=(item.getAttribute("style")||"").toLowerCase();
    if(st.includes("border-left")&&(st.includes("#808080")||st.includes("#6c757d")||st.includes("rgb(128, 128, 128)")||st.includes("rgb(108, 117, 125)")))return!0;
    if(deep){
      try{
        let bl=window.getComputedStyle(item).borderLeftColor;
        if("rgb(128, 128, 128)"===bl||"rgb(108, 117, 125)"===bl)return!0
      }catch{}
    }
    return!1
  },
  getSidebarSummary(){
    let real=[],ghosts=[],bots=[],seen=new Set;
    let nodes=document.querySelectorAll("#sidebar-users-container .list-group-item[data-username], #sidebar-users-container .user-pro-item[data-username]");
    if(!nodes.length)nodes=document.querySelectorAll(".users-list .list-group-item[data-username], .users-list .user-pro-item[data-username], #sidebar-users-container .user-identity, .users-list .user-identity");
    nodes.forEach(el=>{
      let item=el.closest(".user-pro-item, .list-group-item, .user-list-item")||el;
      if((item.id||"").toLowerCase().includes("guest"))return;
      let u=n(item);
      if(u&&u.username){
        let san=a.sanitizeName(u.username);
        if(san&&!seen.has(san)){
          seen.add(san);
          let isB=a.isBotElement(item);
          let isG=!isB&&a.isGhostElement(item,!0);
          let obj={username:u.username,san,displayName:u.displayName||u.username,isGhost:isG,isBot:isB};
          if(isB)bots.push(obj);
          else if(isG)ghosts.push(obj);
          else real.push(obj)
        }
      }
    });
    return{real,ghosts,bots,total:real.length+ghosts.length+bots.length}
  },
  getOnlineUsers(){
    return a.getSidebarSummary().real
  },
  getEstimatedDbSizeKB(){
    try{
      let bytes=new Blob([JSON.stringify(t.cache||{})]).size;
      return(bytes/1024).toFixed(1)
    }catch{return"0.0"}
  }
};
a.rebuildDisplayNameMap();

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
      .lsa-box { background: linear-gradient(180deg, rgba(28, 31, 56, 0.98) 0%, rgba(16, 18, 34, 0.99) 100%); border: 1px solid rgba(212, 175, 55, 0.32); border-radius: 20px; width: 95%; max-width: 620px; max-height: 88vh; max-height: 88dvh; padding: 16px 18px 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.85); transform: scale(0.94) translateY(15px); opacity: 0; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; color: #f8fafc; }
      .lsa-sub-box { max-width: 450px; border-color: rgba(212, 175, 55, 0.45); }
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
      .lsa-card-title { font-size: 12.5px; font-weight: 700; color: #D4AF37; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
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
      .lsa-btn-warn { background: rgba(245, 158, 11, 0.18); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.35); }
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
      .lsa-quick-pill { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 5px 9px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: inherit; transition: 0.15s; }
      .lsa-quick-pill:hover, .lsa-quick-pill.active { background: rgba(212,175,55,0.22); border-color: rgba(212,175,55,0.6); color: #D4AF37; }
      .lsa-batch-bar { background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px; }
      .lsa-chk { width: 16px; height: 16px; accent-color: #D4AF37; cursor: pointer; flex-shrink: 0; }
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
    let extras="";
    if(d&&a.isUserFrozen(d))extras+=`<div style="margin-top:10px; font-size:12px; color:#7dd3fc; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); padding:6px 12px; border-radius:10px; display:inline-block;">🛡️ هذه الشعلة محمية بدرع الإدارة${t.settings.globalFreeze?" (حماية شاملة)":` (${a.formatRemaining(d.frozenUntil)})`}</div>`;
    if(d&&Number(d.boostMultiplier)>1)extras+=`<div style="margin-top:8px; font-size:12px; color:#e9d5ff; background:rgba(168,85,247,0.14); border:1px solid rgba(168,85,247,0.3); padding:5px 12px; border-radius:10px; display:inline-block;">⚡ مضاعف VIP نشط (×${d.boostMultiplier})</div>`;
    if(d&&d.bestStreak&&d.bestStreak>Number(streak))extras+=`<div style="margin-top:8px; font-size:11.5px; color:#94a3b8;">أعلى رقم قياسي وصل إليه: <b style="color:#D4AF37;">${a.formatNumber(d.bestStreak)} يوم</b></div>`;
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
          ${extras}
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
    let mult=myD&&Number(myD.boostMultiplier)>1?Number(myD.boostMultiplier):1;
    let boostNote="";
    if(t.settings.doubleMode||mult>1){
      let totalX=(t.settings.doubleMode?2:1)*mult;
      boostNote=`<div style="margin-top:8px; color:#c084fc; font-size:12px; font-weight:bold;">⚡ مضاعف الزيادة (×${totalX}) مفعّل لك اليوم!</div>`
    }
    r.showModal(`
      <div style="text-align:center;">
        <div style="font-size:55px; margin: 0 auto 20px auto; display:inline-block; animation: layl-float 3s ease-in-out infinite;">${ico}</div>
        <h3 style="color:#D4AF37; font-family:'Segoe UI', tahoma, sans-serif; margin:0 0 15px; font-size:18px; font-weight:bold; line-height:1.6;">${a.escapeHTML(pick)}</h3>
        <div style="color:#cbd5e1; font-size:14px; margin-bottom:25px; background:rgba(0,0,0,0.25); padding:20px 15px; border-radius:16px; border:1px solid rgba(255,255,255,0.04);">
          أصبح رصيد شعلتك الان <br>
          <b style="color:#f8fafc; font-size:26px; display:inline-block; margin-top:10px; font-weight:900; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${a.formatNumber(streak)} <span style="color:#94a3b8; font-size:14px; font-weight:normal;">يوم</span></b>
          ${boostNote}
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

let OBSERVER_OPTS={childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-username","data-user-id","class"]};

let o={
  withoutObserver(fn){
    if(!t.observer)return fn();
    0===t.observerPaused&&t.observer.disconnect();
    t.observerPaused++;
    try{return fn()}finally{
      t.observerPaused--;
      0===t.observerPaused&&t.observer.observe(document.body,OBSERVER_OPTS)
    }
  },
  triggerRender(node){
    if(!node){t.pendingFull=!0;t.pendingNodes.clear()}
    else if(!t.pendingFull){t.pendingNodes.add(node)}
    if(!t.renderRaf){
      t.renderRaf=requestAnimationFrame(()=>{
        t.renderRaf=null;
        let full=t.pendingFull,nodes=full?null:Array.from(t.pendingNodes);
        t.pendingFull=!1;
        t.pendingNodes.clear();
        o.executeRender(full,nodes)
      })
    }
  },
  executeRender(full,nodes){
    if(t.isRendering)return;
    t.isRendering=!0;
    try{
      o.withoutObserver(()=>{
        let tm=a.getTodayMidnight(),now=Date.now(),enabled=!1!==t.settings.enabled;
        let chatMin=Number(t.settings.chatBadgeMin)||100,hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
        let targets;
        if(full||!nodes){
          targets=document.querySelectorAll(".user-identity")
        }else{
          let set=new Set;
          for(let nd of nodes){
            if(!nd||!nd.isConnected)continue;
            if(nd.classList&&nd.classList.contains("user-identity")){set.add(nd)}
            else{
              let up=nd.closest&&nd.closest(".user-identity");
              up&&set.add(up);
              nd.querySelectorAll&&nd.querySelectorAll(".user-identity").forEach(x=>set.add(x))
            }
          }
          targets=set
        }
        targets.forEach(idEl=>{
          if(!idEl||!idEl.classList.contains("user-identity")||idEl.closest("#login-overlay.d-none, .guest, .is-guest, .guest-user, .quoted-message, .message-text")||idEl.classList.contains("mention-highlight"))return;
          let itemEl=idEl.closest(".user-pro-item, .list-group-item, .user-list-item");
          let inSide=null!==idEl.closest("#sidebar-users-container, .sidebar-content, .users-list");
          let inProf=null!==idEl.closest("#profile-header-classic-bar, .profile-header");
          let isSys=null!==idEl.closest(".styled-sys-msg, .msg-status-login, .user-join-message");
          let inMsg=null!==idEl.closest(".message-row")&&!isSys;
          let target=null,onAvatar=!1;
          if(inSide&&itemEl){
            let av=itemEl.querySelector(".avatar-with-frame, .avatar-animated-wrapper, .avatar");
            if(!av){let img=itemEl.querySelector("img.avatar-img-inner, img.user-avatar")||itemEl.querySelector("div > img:not(.user-identity-super)");img&&(av=img.parentNode)}
            av&&(target=av,onAvatar=!0)
          }else(inProf||inMsg)&&(target=idEl);
          if(!target)return;
          let badge=onAvatar?target.querySelector(":scope > .night-streak"):idEl.parentNode.querySelector(".night-streak");
          let u=n(idEl.closest(".message-row, .user-pro-item, .list-group-item")||idEl);
          if(!u||!u.username||""===u.username.trim())return;
          let key=a.sanitizeName(u.username),d=t.cache[key],st=d?.streak||0,hid=d?.hidden||!1;
          let expired=!a.isUserFrozen(d)&&(tm-(d?.lastLogin||0)>e.dayInMs);
          let inRec=Boolean(d?.lostStreak&&d?.recoveryDeadline>now);
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
            let disp=u.displayName||u.username,stStr=String(st);
            badge.getAttribute("data-streak")!==stStr&&badge.setAttribute("data-streak",stStr);
            badge.getAttribute("data-name")!==disp&&badge.setAttribute("data-name",disp);
            badge.getAttribute("data-userkey")!==key&&badge.setAttribute("data-userkey",key);
            let txt=`${a.getTierIcon(st,d)} ${a.formatNumber(st)}`;
            badge.textContent!==txt&&(badge.textContent=txt)
          }else{
            badge&&badge.remove()
          }
        });
        o.injectEliteMenuBtn();
        o.injectPrivacyToggle();
        o.injectAdminStreakEditor();
        o.injectAdminPanelBtn()
      })
    }finally{t.isRendering=!1}
  },
  injectEliteMenuBtn(){
    let c=document.getElementById("elite-board-menu-items");
    if(c&&!document.getElementById("btn-streak-leaderboard")){
      o.withoutObserver(()=>{
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
      })
    }
  },
  injectPrivacyToggle(){
    let row=document.getElementById("streak-visibility-row");
    if(!1===t.settings.allowUserHide){row&&"none"!==row.style.display&&o.withoutObserver(()=>{row.style.display="none"});return}
    if(row){""!==row.style.display&&o.withoutObserver(()=>{row.style.display=""});return}
    let c=document.querySelector("#privacy-group .settings-group-content");
    if(c&&!document.getElementById("toggle-streak-visibility-checkbox")){
      o.withoutObserver(()=>{
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
      })
    }
  },
  injectAdminStreakEditor(){
    if(!a.isAdmin()){
      let old=document.getElementById("admin-edit-streak-container");
      old&&o.withoutObserver(()=>old.remove());
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
        inp&&document.activeElement!==inp&&inp.value!==String(cur)&&(inp.value=cur);
        return
      }
      o.withoutObserver(()=>{
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
          let val=Math.max(0,parseInt(document.getElementById("profile-admin-streak-input").value)||0),san=a.sanitizeName(target),tm=a.getTodayMidnight();
          let oldD=t.cache[san]||{},oldVal=oldD.streak||0;
          let payload={
            streak:val,
            bestStreak:Math.max(oldD.bestStreak||0,val),
            lastLogin:tm,
            originalName:target,
            lostStreak:null,
            recoveryDeadline:null
          };
          if(val>=oldVal)payload.adminAlert=`تم تعديل شعلتك إلى "${val}" يوم من قبل الإدارة`;
          else payload.adminPenaltyAlert=`تم خصم وتعديل شعلتك إلى "${val}" يوم من قبل الإدارة`;
          t.db.ref(`${e.dbPath}/${san}`).update(payload).then(()=>{
            admin.logAction("تعديل من البروفايل",target,`${oldVal} ➔ ${val}`);
            this.innerHTML='تم <i class="fas fa-check-double"></i>';
            this.style.backgroundColor="#198754";
            setTimeout(()=>{this.innerHTML='حفظ <i class="fas fa-check"></i>';this.style.backgroundColor=""},2e3)
          }).catch(()=>{alert("حدث خطأ أثناء الحفظ.")})
        })
      })
    }
  },
  injectAdminPanelBtn(){
    if(!a.isAdmin()){
      let olds=document.querySelectorAll("#btn-lail-streak-admin");
      olds.length&&o.withoutObserver(()=>olds.forEach(x=>x.remove()));
      return
    }
    let lists=document.querySelectorAll(".modern-classic-list");
    if(!lists.length)return;
    lists.forEach(list=>{
      if(!list||list.querySelector("#btn-lail-streak-admin"))return;
      o.withoutObserver(()=>{
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
      let baseStep=t.settings.doubleMode?2:1;
      let minRec=Number(t.settings.minStreakForRecovery)||10;
      let defChances=Number(t.settings.defaultChances);
      defChances=isNaN(defChances)?3:defChances;
      let recMs=a.getRecoveryMs();
      setTimeout(()=>{
        ref.transaction(cur=>{
          let disp=displayName||username;
          if(null===cur)return{streak:baseStep,bestStreak:baseStep,lastLogin:tm,originalName:username,displayName:disp,recoveryChances:defChances};
          if(cur.excluded)return;
          let last=cur.lastLogin,st=cur.streak||0,ch=void 0!==cur.recoveryChances?cur.recoveryChances:defChances;
          let diff=Math.round((tm-last)/864e5);
          if(diff<=0){
            if(cur.displayName===disp&&cur.lastLogin===tm)return;
            return{...cur,displayName:disp,lastLogin:tm}
          }
          let isProt=t.settings.globalFreeze||(cur.frozenUntil&&cur.frozenUntil>Date.now());
          if(1===diff||(diff>1&&isProt)){
            let locked=Boolean(cur.gainFrozenUntil&&cur.gainFrozenUntil>Date.now());
            let mult=Number(cur.boostMultiplier)>1?Number(cur.boostMultiplier):1;
            let inc=locked?0:(baseStep*mult);
            let nextSt=st+inc;
            return{...cur,streak:nextSt,bestStreak:Math.max(cur.bestStreak||0,nextSt),lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:ch,lostStreak:cur.lostStreak||null,recoveryDeadline:cur.recoveryDeadline||null,recoveryProgress:cur.recoveryProgress||null}
          }
          return st>=minRec&&ch>0
            ?{...cur,streak:1,bestStreak:Math.max(cur.bestStreak||0,st),lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:ch-1,lostStreak:st,recoveryDeadline:Date.now()+recMs,recoveryProgress:0}
            :{...cur,streak:1,bestStreak:Math.max(cur.bestStreak||0,st),lastLogin:tm,hidden:cur.hidden||!1,originalName:cur.originalName||username,displayName:disp,recoveryChances:defChances,lostStreak:null,recoveryDeadline:null,recoveryProgress:null}
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
            ?(setTimeout(()=>{r.fireConfetti();i.showDailyWelcome(d.lostStreak)},500),{...d,streak:d.lostStreak,bestStreak:Math.max(d.bestStreak||0,d.lostStreak),lastLogin:a.getTodayMidnight(),lostStreak:null,recoveryDeadline:null,recoveryProgress:null})
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
        else{o.withoutObserver(()=>{let div=document.createElement("div");div.id=id;div.innerHTML=html;document.body.appendChild(div)})}
        return
      }
    }
    el&&o.withoutObserver(()=>el.remove())
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
  selectMode:!1,
  selectedKeys:new Set,
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
    admin.selectMode=!1;
    admin.selectedKeys.clear();
    ov=document.createElement("div");
    ov.id="layl-streak-admin-modal";
    ov.className="lsa-overlay";
    ov.innerHTML=`
      <div class="lsa-box">
        <div class="lsa-header">
          <div class="lsa-title"><i class="fas fa-fire-alt"></i> لوحة تحكم الستريك</div>
          <div class="lsa-row" style="gap:6px;">
            <button type="button" class="lsa-ctrl-btn" id="lsa-btn-add-user" title="إضافة/منح ستريك لعضو جديد"><i class="fas fa-user-plus"></i></button>
            <button type="button" class="lsa-ctrl-btn" id="lsa-btn-transfer" title="نقل أو دمج شعلة بين حسابين"><i class="fas fa-exchange-alt"></i></button>
            <button type="button" class="lsa-ctrl-btn" id="lsa-btn-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
            <button type="button" class="lsa-ctrl-btn lsa-ctrl-close" id="lsa-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lsa-stats">
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-active">0</div><div class="lsa-stat-lbl">شعلات نشطة</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-online" style="color:#34d399;">0</div><div class="lsa-stat-lbl">متصل فعلي الآن</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-rec">0</div><div class="lsa-stat-lbl">تحت الاسترجاع</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" id="lsa-st-mode">...</div><div class="lsa-stat-lbl">الوضع الحالي</div></div>
        </div>
        <div class="lsa-tabs">
          <button type="button" class="lsa-tab active" data-ltab="members"><i class="fas fa-users"></i> الأعضاء</button>
          <button type="button" class="lsa-tab" data-ltab="recovery"><i class="fas fa-life-ring"></i> الاسترجاع</button>
          <button type="button" class="lsa-tab" data-ltab="events"><i class="fas fa-bolt"></i> فعاليات وعقاب</button>
          <button type="button" class="lsa-tab" data-ltab="stats"><i class="fas fa-trophy"></i> التوب والإحصاء</button>
          <button type="button" class="lsa-tab" data-ltab="logs"><i class="fas fa-history"></i> السجل</button>
          <button type="button" class="lsa-tab" data-ltab="settings"><i class="fas fa-cog"></i> إعدادات وصيانة</button>
        </div>
        <div class="lsa-body">
          <div id="lsa-view-members" class="lsa-view active">
            <div class="lsa-row" style="margin-bottom:8px;">
              <input type="text" id="lsa-mem-search" class="lsa-input" style="flex:1; min-width:130px;" placeholder="🔍 ابحث بالاسم أو اليوزر أو الملاحظة..." autocomplete="off">
              <select id="lsa-mem-filter" class="lsa-input" style="width:128px;">
                <option value="all">الكل</option>
                <option value="online">🟢 المتصلون فعلياً</option>
                <option value="ghost">👻 تواجد وهمي</option>
                <option value="bot">🤖 البوتات</option>
                <option value="active">النشطون</option>
                <option value="expired">المنطفئون</option>
                <option value="frozen">🛡️ محميون بدرع</option>
                <option value="boosted">⚡ مضاعف VIP</option>
                <option value="locked">🔒 زيادة مجمّدة</option>
                <option value="recovery">تحت الاسترجاع</option>
                <option value="tier100">👑 100+ يوم</option>
                <option value="tier30">⚡ 30-99 يوم</option>
                <option value="hidden">مخفيون</option>
                <option value="excluded">مستبعدون</option>
              </select>
              <select id="lsa-mem-sort" class="lsa-input" style="width:104px;">
                <option value="streak_desc">الأعلى ستريك</option>
                <option value="streak_asc">الأقل ستريك</option>
                <option value="recent">الأحدث دخولاً</option>
                <option value="oldest">الأقدم خمولاً</option>
                <option value="name">أبجدي</option>
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; gap:6px;">
              <div id="lsa-mem-count" style="font-size:11px; color:#94a3b8;"></div>
              <button type="button" id="lsa-btn-toggle-select" class="lsa-btn lsa-btn-dark lsa-mini"><i class="fas fa-check-square"></i> تحديد متعدد</button>
            </div>
            <div id="lsa-batch-wrap" style="display:none;"></div>
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
            <div class="lsa-card" style="background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.3); padding:8px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; font-size:11.5px;">
                <span style="color:#6ee7b7; font-weight:bold;"><i class="fas fa-signal"></i> حالة الاتصال الحقيقي الآن:</span>
                <div class="lsa-row" style="gap:5px;">
                  <span id="lsa-ev-online-badge" class="lsa-tag lsa-tag-green">0 متصل فعلي</span>
                  <span id="lsa-ev-ghost-badge" class="lsa-tag lsa-tag-gray">0 وهمي مستبعد</span>
                  <span id="lsa-ev-bot-badge" class="lsa-tag lsa-tag-purple">0 بوت مستبعد</span>
                </div>
              </div>
            </div>

            <div class="lsa-card" style="border-color:rgba(212,175,55,0.35);">
              <div class="lsa-card-title">
                <span><i class="fas fa-gift"></i> الإهداء والمكافأة الجماعية (+ أيام ستريك)</span>
              </div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div>
                  <label class="lsa-label">الفئة المستهدفة</label>
                  <select id="lsa-gift-scope" class="lsa-input">
                    <option value="online">🟢 المتصلون الآن (فعلياً فقط)</option>
                    <option value="active">🔥 جميع أصحاب الشعلات النشطة</option>
                    <option value="tier30">⚡ أصحاب 30+ يوم</option>
                    <option value="tier100">👑 أصحاب 100+ يوم</option>
                    <option value="all">🌐 جميع المسجلين بالقاعدة</option>
                  </select>
                </div>
                <div>
                  <label class="lsa-label">عدد الأيام المضافة</label>
                  <input type="number" id="lsa-gift-amount" class="lsa-input" value="1" min="0" max="500">
                </div>
              </div>
              <div style="margin-bottom:8px;">
                <label class="lsa-label">رسالة التهنئة والاحتفال (اختياري)</label>
                <input type="text" id="lsa-gift-msg" class="lsa-input" placeholder="مثلاً: هدية الإدارة بمناسبة الفعالية! 🎉">
              </div>
              <button type="button" id="lsa-btn-bulk-gift" class="lsa-btn lsa-btn-gold"><i class="fas fa-paper-plane"></i> تنفيذ الإهداء الجماعي الآن</button>
            </div>

            <div class="lsa-card" style="border-color:rgba(239,68,68,0.42); background:rgba(139,24,54,0.08);">
              <div class="lsa-card-title" style="color:#fca5a5;">
                <span><i class="fas fa-gavel"></i> العقاب الجماعي (خصم أيام / تصفير / تجميد زيادة)</span>
              </div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div>
                  <label class="lsa-label">الفئة المستهدفة</label>
                  <select id="lsa-pen-scope" class="lsa-input">
                    <option value="online">🟢 المتصلون الآن (فعلياً فقط)</option>
                    <option value="active">🔥 جميع أصحاب الشعلات النشطة</option>
                    <option value="tier30">⚡ أصحاب 30+ يوم</option>
                    <option value="tier100">👑 أصحاب 100+ يوم</option>
                    <option value="all">🌐 جميع المسجلين بالقاعدة</option>
                  </select>
                </div>
                <div>
                  <label class="lsa-label">نوع العقاب</label>
                  <select id="lsa-pen-type" class="lsa-input">
                    <option value="deduct">خصم عدد أيام (-)</option>
                    <option value="zero">تصفير الشعلة بالكامل (0)</option>
                    <option value="chance">خصم فرص استرجاع (-)</option>
                    <option value="lock">تجميد زيادة الشعلة (أيام)</option>
                  </select>
                </div>
              </div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div id="lsa-pen-amt-wrap">
                  <label class="lsa-label" id="lsa-pen-amt-lbl">عدد الأيام المخصومة</label>
                  <input type="number" id="lsa-pen-amount" class="lsa-input" value="10" min="1" max="9999">
                </div>
                <div style="display:flex; flex-direction:column; justify-content:center; gap:5px; padding-top:12px;">
                  <label style="display:flex; align-items:center; gap:6px; font-size:11px; color:#cbd5e1; cursor:pointer;">
                    <input type="checkbox" id="lsa-pen-skip-admin" class="lsa-chk" checked> استثناء الإدارة
                  </label>
                  <label style="display:flex; align-items:center; gap:6px; font-size:11px; color:#cbd5e1; cursor:pointer;">
                    <input type="checkbox" id="lsa-pen-skip-frozen" class="lsa-chk" checked> استثناء أصحاب الدرع 🛡️
                  </label>
                </div>
              </div>
              <div style="margin-bottom:8px;">
                <label class="lsa-label">رسالة التحذير / سبب العقاب للعضو (تصل بدون كونفيتي)</label>
                <input type="text" id="lsa-pen-msg" class="lsa-input" placeholder="مثلاً: تم تطبيق خصم جماعي من قبل الإدارة...">
              </div>
              <button type="button" id="lsa-btn-bulk-penalty" class="lsa-btn lsa-btn-crimson"><i class="fas fa-exclamation-triangle"></i> تنفيذ العقاب الجماعي الآن</button>
            </div>

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

            <div class="lsa-card">
              <div class="lsa-card-title"><span><i class="fas fa-user-shield"></i> منح درع حماية جماعي</span></div>
              <div class="lsa-grid-2" style="margin-bottom:8px;">
                <div>
                  <label class="lsa-label">الفئة</label>
                  <select id="lsa-shield-scope" class="lsa-input">
                    <option value="online">🟢 المتصلون الآن (فعلياً فقط)</option>
                    <option value="active">🔥 جميع النشطين</option>
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

            <div class="lsa-card">
              <div class="lsa-card-title" style="color:#e9d5ff;"><span><i class="fas fa-bullhorn"></i> إرسال إعلان/إشعار فوري (بدون تعديل الأرصدة)</span></div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <div>
                  <label class="lsa-label">الفئة</label>
                  <select id="lsa-bc-scope" class="lsa-input">
                    <option value="online">🟢 المتصلون الآن (فعلياً فقط)</option>
                    <option value="active">🔥 جميع النشطين</option>
                  </select>
                </div>
                <div>
                  <label class="lsa-label">نمط الإشعار</label>
                  <select id="lsa-bc-style" class="lsa-input">
                    <option value="info">📢 إعلان رسمي</option>
                    <option value="gift">🎉 تهنئة + كونفيتي</option>
                    <option value="warn">⚠️ تحذير إداري</option>
                  </select>
                </div>
              </div>
              <input type="text" id="lsa-bc-msg" class="lsa-input" style="margin-bottom:8px;" placeholder="اكتب نص الإشعار الذي سيظهر للأعضاء...">
              <button type="button" id="lsa-btn-broadcast" class="lsa-btn lsa-btn-dark" style="width:100%;"><i class="fas fa-broadcast-tower"></i> بث الإشعار الآن</button>
            </div>
          </div>

          <div id="lsa-view-stats" class="lsa-view">
            <div id="lsa-stats-body"></div>
          </div>

          <div id="lsa-view-logs" class="lsa-view">
            <div class="lsa-row" style="margin-bottom:8px;">
              <input type="text" id="lsa-log-search" class="lsa-input" style="flex:1;" placeholder="🔍 ابحث في سجل الإدارة..." autocomplete="off">
              <button type="button" id="lsa-btn-export-logs" class="lsa-btn lsa-btn-info lsa-mini" style="padding:8px 10px;"><i class="fas fa-file-export"></i> تصدير</button>
              <button type="button" id="lsa-btn-clear-logs" class="lsa-btn lsa-btn-danger lsa-mini" style="padding:8px 10px;"><i class="fas fa-trash"></i> مسح</button>
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
            <div style="margin-bottom:8px;">
              <label class="lsa-label">أرقام المعالم الاحتفالية بالكونفيتي (مفصولة بفاصلة)</label>
              <input type="text" id="lsa-set-milestones" class="lsa-input" placeholder="10,30,50,100,200,365,500,1000">
            </div>
            <div style="margin-bottom:10px;">
              <label class="lsa-label">رسائل الترحيب اليومي المخصصة (رسالة في كل سطر — اتركه فارغاً للافتراضي)</label>
              <textarea id="lsa-set-welcomes" class="lsa-input" rows="2" style="resize:vertical;" placeholder="يوم جديد، وشعلة لا تنطفئ..."></textarea>
            </div>
            <button type="button" id="lsa-btn-save-settings" class="lsa-btn lsa-btn-gold" style="margin-bottom:12px;"><i class="fas fa-save"></i> حفظ إعدادات النظام</button>

            <div class="lsa-card" style="border-color:rgba(212,175,55,0.28);">
              <div class="lsa-card-title"><span><i class="fas fa-user-shield"></i> إدارة المشرفين المصرح لهم (admins)</span><span class="lsa-tag lsa-tag-gold" id="lsa-admins-cnt">0</span></div>
              <div class="lsa-row" style="margin-bottom:8px;">
                <input type="text" id="lsa-new-admin-inp" class="lsa-input" style="flex:1;" placeholder="اسم المشرف الجديد (Username)..." autocomplete="off">
                <button type="button" id="lsa-btn-add-admin" class="lsa-btn lsa-btn-success" style="padding:8px 12px;"><i class="fas fa-plus"></i> إضافة</button>
              </div>
              <div id="lsa-admins-list" class="lsa-row" style="gap:5px;"></div>
            </div>

            <div class="lsa-card" style="border-color:rgba(255,255,255,0.12);">
              <div class="lsa-card-title" style="color:#cbd5e1;">
                <span><i class="fas fa-broom"></i> أدوات الصيانة وتخفيف الفايربيس</span>
                <span class="lsa-tag lsa-tag-blue" id="lsa-db-size-tag">0 KB</span>
              </div>
              <button type="button" id="lsa-btn-open-cleaner" class="lsa-btn lsa-btn-crimson" style="margin-bottom:8px;"><i class="fas fa-user-slash"></i> حذف الخاملين نهائياً من القاعدة (+10 / +30 / +60 / مخصص)</button>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <button type="button" id="lsa-btn-open-transfer2" class="lsa-btn lsa-btn-dark"><i class="fas fa-exchange-alt"></i> نقل / دمج شعلة حسابين</button>
                <button type="button" id="lsa-btn-clean-alerts" class="lsa-btn lsa-btn-dark"><i class="fas fa-bell-slash"></i> مسح الإشعارات العالقة</button>
                <button type="button" id="lsa-btn-clean-corrupt" class="lsa-btn lsa-btn-dark"><i class="fas fa-wrench"></i> تنظيف السجلات الفارغة</button>
                <button type="button" id="lsa-btn-reset-chances" class="lsa-btn lsa-btn-dark"><i class="fas fa-sync"></i> تجديد فرص الجميع</button>
              </div>
              <div class="lsa-card-title" style="color:#7dd3fc; margin-top:8px;"><span><i class="fas fa-database"></i> النسخ الاحتياطي والمواسم</span></div>
              <div class="lsa-grid-2" style="margin-bottom:7px;">
                <button type="button" id="lsa-btn-export" class="lsa-btn lsa-btn-info"><i class="fas fa-download"></i> تصدير نسخة JSON</button>
                <button type="button" id="lsa-btn-import" class="lsa-btn lsa-btn-success"><i class="fas fa-upload"></i> استيراد نسخة JSON</button>
              </div>
              <button type="button" id="lsa-btn-season-reset" class="lsa-btn lsa-btn-danger" style="width:100%;"><i class="fas fa-bomb"></i> تصفير الكل لبداية موسم جديد (مع نسخة احتياطية)</button>
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
    document.getElementById("lsa-btn-transfer").onclick=()=>admin.openTransferModal();
    ov.querySelectorAll("[data-ltab]").forEach(btn=>{
      btn.onclick=()=>admin.switchTab(btn.getAttribute("data-ltab"))
    });
    document.getElementById("lsa-mem-search").oninput=()=>admin.renderMembers();
    document.getElementById("lsa-mem-filter").onchange=()=>admin.renderMembers();
    document.getElementById("lsa-mem-sort").onchange=()=>admin.renderMembers();
    document.getElementById("lsa-btn-toggle-select").onclick=()=>{
      admin.selectMode=!admin.selectMode;
      if(!admin.selectMode)admin.selectedKeys.clear();
      admin.renderMembers()
    };
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
    document.getElementById("lsa-pen-type").onchange=function(){
      let v=this.value,wrap=document.getElementById("lsa-pen-amt-wrap"),lbl=document.getElementById("lsa-pen-amt-lbl");
      if("zero"===v){wrap.style.opacity="0.4";document.getElementById("lsa-pen-amount").disabled=!0}
      else{
        wrap.style.opacity="1";document.getElementById("lsa-pen-amount").disabled=!1;
        lbl.textContent="chance"===v?"عدد الفرص المخصومة":"lock"===v?"مدة تجميد الزيادة (أيام)":"عدد الأيام المخصومة"
      }
    };
    document.getElementById("lsa-btn-bulk-penalty").onclick=()=>admin.sendBulkPenalty();
    document.getElementById("lsa-btn-bulk-shield").onclick=()=>admin.grantBulkShield();
    document.getElementById("lsa-btn-broadcast").onclick=()=>admin.sendBroadcast();
    document.getElementById("lsa-log-search").oninput=()=>admin.renderLogs();
    document.getElementById("lsa-btn-export-logs").onclick=()=>admin.exportLogs();
    document.getElementById("lsa-btn-clear-logs").onclick=()=>admin.clearLogs();
    document.getElementById("lsa-set-enabled").onchange=function(){
      admin.patchSetting({enabled:this.checked},this.checked?"✅ تم تفعيل نظام الستريك":"🛑 تم إيقاف نظام الستريك مؤقتاً")
    };
    document.getElementById("lsa-set-hide").onchange=function(){
      admin.patchSetting({allowUserHide:this.checked},this.checked?"✅ تم السماح بإخفاء الشعلة":"🚫 تم منع إخفاء الشعلة")
    };
    document.getElementById("lsa-btn-save-settings").onclick=()=>admin.saveSettings();
    document.getElementById("lsa-btn-add-admin").onclick=()=>admin.addAdminUser();
    document.getElementById("lsa-btn-open-cleaner").onclick=()=>admin.openInactiveCleanerModal();
    document.getElementById("lsa-btn-open-transfer2").onclick=()=>admin.openTransferModal();
    document.getElementById("lsa-btn-clean-alerts").onclick=()=>admin.cleanAlerts();
    document.getElementById("lsa-btn-clean-corrupt").onclick=()=>admin.cleanCorruptRecords();
    document.getElementById("lsa-btn-reset-chances").onclick=()=>admin.resetAllChances();
    document.getElementById("lsa-btn-export").onclick=()=>admin.exportBackup();
    document.getElementById("lsa-btn-import").onclick=()=>document.getElementById("lsa-import-file").click();
    document.getElementById("lsa-import-file").onchange=ev=>admin.importBackup(ev);
    document.getElementById("lsa-btn-season-reset").onclick=()=>admin.seasonReset();

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
    else if("stats"===admin.activeTab)admin.renderStats();
    else if("settings"===admin.activeTab)admin.renderAdminsList()
  },
  updateHeaderStats(){
    if(!document.getElementById("lsa-st-active"))return;
    let tm=a.getTodayMidnight(),activeCnt=0,recCnt=0;
    Object.values(t.cache||{}).forEach(d=>{
      if(!d||"object"!=typeof d)return;
      if(d.lostStreak&&d.recoveryDeadline>Date.now())recCnt++;
      if(a.isUserActive(d,tm))activeCnt++
    });
    let side=a.getSidebarSummary();
    document.getElementById("lsa-st-active").textContent=activeCnt;
    document.getElementById("lsa-st-online").textContent=side.real.length;
    let recEl=document.getElementById("lsa-st-rec");
    recEl.textContent=recCnt;
    recEl.style.color=recCnt>0?"#f87171":"#94a3b8";
    let modeEl=document.getElementById("lsa-st-mode");
    if(!1===t.settings.enabled){modeEl.textContent="متوقف";modeEl.style.color="#f87171"}
    else if(t.settings.globalFreeze){modeEl.textContent="❄️ حماية";modeEl.style.color="#38bdf8"}
    else if(t.settings.doubleMode){modeEl.textContent="⚡ دبل ×2";modeEl.style.color="#c084fc"}
    else{modeEl.textContent="مفعّل";modeEl.style.color="#34d399"}
  },
  getTargetsByScope(scope,opts){
    opts=opts||{};
    let tm=a.getTodayMidnight(),hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    let out=[];
    if("online"===scope){
      out=a.getOnlineUsers().map(u=>({key:u.san,orig:u.username,disp:u.displayName,d:t.cache[u.san]||{}}))
    }else{
      Object.entries(t.cache||{}).forEach(([k,d])=>{
        if(!d||"object"!=typeof d)return;
        if("active"===scope&&!a.isUserActive(d,tm))return;
        if("tier30"===scope&&(!a.isUserActive(d,tm)||(d.streak||0)<miMin))return;
        if("tier100"===scope&&(!a.isUserActive(d,tm)||(d.streak||0)<hiMin))return;
        out.push({key:k,orig:d.originalName||k,disp:d.displayName||d.originalName||k,d})
      })
    }
    return out.filter(x=>{
      if(opts.skipExcluded&&x.d.excluded)return!1;
      if(opts.skipAdmins&&(a.isAdminKey(x.key)||a.isAdminKey(x.orig)))return!1;
      if(opts.skipFrozen&&a.isUserFrozen(x.d))return!1;
      return!0
    })
  },
  renderMembers(){
    let c=document.getElementById("lsa-members-list"),cntEl=document.getElementById("lsa-mem-count"),bw=document.getElementById("lsa-batch-wrap");
    if(!c)return;
    let q=(document.getElementById("lsa-mem-search")?.value||"").trim().toLowerCase();
    let flt=document.getElementById("lsa-mem-filter")?.value||"all";
    let srt=document.getElementById("lsa-mem-sort")?.value||"streak_desc";
    let tm=a.getTodayMidnight(),now=Date.now();
    let side=a.getSidebarSummary();
    let onlineSet=new Set(side.real.map(x=>x.san));
    let ghostSet=new Set(side.ghosts.map(x=>x.san));
    let botSet=new Set(side.bots.map(x=>x.san));
    let hiMin=Number(t.settings.highTierMin)||100,miMin=Number(t.settings.midTierMin)||30;
    let mapEntries=new Map;
    Object.entries(t.cache||{}).forEach(([k,d])=>{if(d&&"object"==typeof d)mapEntries.set(k,d)});
    if("online"===flt){
      side.real.forEach(u=>{if(!mapEntries.has(u.san))mapEntries.set(u.san,{streak:0,originalName:u.username,displayName:u.displayName,lastLogin:0})})
    }else if("bot"===flt){
      side.bots.forEach(u=>{if(!mapEntries.has(u.san))mapEntries.set(u.san,{streak:0,originalName:u.username,displayName:u.displayName,lastLogin:0})})
    }
    let list=Array.from(mapEntries.entries()).map(([k,d])=>{
      let isAct=a.isUserActive(d,tm),isFrz=Boolean(d.frozenUntil&&d.frozenUntil>now),isRec=Boolean(d.lostStreak&&d.recoveryDeadline>now),isLocked=a.isGainLocked(d),mult=Number(d.boostMultiplier)||1;
      return{key:k,d,name:d.displayName||d.originalName||k,orig:d.originalName||k,streak:d.streak||0,isAct,isFrz,isRec,isLocked,mult,isOnline:onlineSet.has(k),isGhost:ghostSet.has(k),isBot:botSet.has(k)}
    }).filter(x=>{
      if("active"===flt&&!x.isAct)return!1;
      if("online"===flt&&!x.isOnline)return!1;
      if("ghost"===flt&&!x.isGhost)return!1;
      if("bot"===flt&&!x.isBot)return!1;
      if("expired"===flt&&(x.isAct||x.isRec||x.d.excluded))return!1;
      if("frozen"===flt&&!x.isFrz)return!1;
      if("boosted"===flt&&!(x.mult>1))return!1;
      if("locked"===flt&&!x.isLocked)return!1;
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
      if("oldest"===srt)return(x.d.lastLogin||0)-(y.d.lastLogin||0);
      if("name"===srt)return x.name.localeCompare(y.name,"ar");
      return y.streak-x.streak
    });
    let shown=list.slice(0,80);
    cntEl&&(cntEl.textContent=`عرض ${shown.length} من أصل ${list.length} عضو`);
    let tglBtn=document.getElementById("lsa-btn-toggle-select");
    if(tglBtn){
      tglBtn.className=`lsa-btn lsa-mini ${admin.selectMode?"lsa-btn-gold":"lsa-btn-dark"}`;
      tglBtn.style.width="auto";
      tglBtn.innerHTML=admin.selectMode?'<i class="fas fa-times"></i> إلغاء التحديد':'<i class="fas fa-check-square"></i> تحديد متعدد'
    }
    if(bw){
      if(admin.selectMode){
        bw.style.display="block";
        bw.innerHTML=`
          <div class="lsa-batch-bar">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
              <span>المحدّدون: <b style="color:#D4AF37;">${admin.selectedKeys.size}</b> عضو</span>
              <div class="lsa-row" style="gap:4px;">
                <button type="button" id="lsa-b-selall" class="lsa-btn lsa-btn-dark lsa-mini">تحديد المعروض</button>
                <button type="button" id="lsa-b-clr" class="lsa-btn lsa-btn-dark lsa-mini">إفراغ</button>
              </div>
            </div>
            <div class="lsa-row" style="gap:4px;">
              <button type="button" id="lsa-b-add" class="lsa-btn lsa-btn-success lsa-mini">+ زيادة أيام</button>
              <button type="button" id="lsa-b-sub" class="lsa-btn lsa-btn-warn lsa-mini">- خصم أيام</button>
              <button type="button" id="lsa-b-shld" class="lsa-btn lsa-btn-info lsa-mini">🛡️ درع 3 أيام</button>
              <button type="button" id="lsa-b-del" class="lsa-btn lsa-btn-danger lsa-mini">🗑️ حذف نهائي</button>
            </div>
          </div>`;
        document.getElementById("lsa-b-selall").onclick=()=>{shown.forEach(x=>admin.selectedKeys.add(x.key));admin.renderMembers()};
        document.getElementById("lsa-b-clr").onclick=()=>{admin.selectedKeys.clear();admin.renderMembers()};
        document.getElementById("lsa-b-add").onclick=()=>admin.batchAdjustStreak(!0);
        document.getElementById("lsa-b-sub").onclick=()=>admin.batchAdjustStreak(!1);
        document.getElementById("lsa-b-shld").onclick=()=>admin.batchShield(3);
        document.getElementById("lsa-b-del").onclick=()=>admin.batchDelete()
      }else{bw.style.display="none";bw.innerHTML=""}
    }
    if(!shown.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:25px;">لا توجد نتائج مطابقة.</div>';
      return
    }
    let html="";
    shown.forEach(x=>{
      let ico=a.getTierIcon(x.streak,x.d);
      let tags=[];
      if(x.isBot)tags.push('<span class="lsa-tag lsa-tag-purple">🤖 بوت</span>');
      else if(x.isOnline)tags.push('<span class="lsa-tag lsa-tag-green">● متصل فعلي</span>');
      else if(x.isGhost)tags.push('<span class="lsa-tag lsa-tag-gray">👻 وهمي</span>');
      if(x.d.excluded)tags.push('<span class="lsa-tag lsa-tag-red">🚫 مستبعد</span>');
      else if(x.isRec)tags.push(`<span class="lsa-tag lsa-tag-red">💨 استرجاع (${x.d.lostStreak})</span>`);
      else if(x.isAct)tags.push('<span class="lsa-tag lsa-tag-gold">نشط</span>');
      else tags.push('<span class="lsa-tag lsa-tag-gray">منطفئ</span>');
      if(x.isFrz)tags.push(`<span class="lsa-tag lsa-tag-blue">🛡️ ${a.formatRemaining(x.d.frozenUntil)}</span>`);
      if(x.mult>1)tags.push(`<span class="lsa-tag lsa-tag-purple">⚡ ×${x.mult}</span>`);
      if(x.isLocked)tags.push(`<span class="lsa-tag lsa-tag-red">🔒 مجمّد ${a.formatRemaining(x.d.gainFrozenUntil)}</span>`);
      if(x.d.hidden)tags.push('<span class="lsa-tag lsa-tag-purple">مخفي</span>');
      if(x.d.hideFromBoard)tags.push('<span class="lsa-tag lsa-tag-gray">بلا توب</span>');
      let noteHtml=x.d.note?`<div style="font-size:11px; color:#fbbf24; margin-top:4px;"><i class="fas fa-sticky-note"></i> ${a.escapeHTML(x.d.note)}</div>`:"";
      let chkHtml=admin.selectMode?`<input type="checkbox" class="lsa-chk lsa-mem-chk" data-key="${a.escapeHTML(x.key)}" ${admin.selectedKeys.has(x.key)?"checked":""}>`:"";
      let reviveBtn=!x.isAct&&!x.d.excluded&&x.streak>0?`<button type="button" class="lsa-btn lsa-btn-info lsa-mini lsa-act-revive" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-heartbeat"></i> إنعاش</button>`:"";
      html+=`
        <div class="lsa-card" style="${admin.selectedKeys.has(x.key)?"border-color:rgba(212,175,55,0.65); background:rgba(212,175,55,0.06);":""}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
            ${chkHtml}
            <div style="min-width:0; flex:1;">
              <div style="font-size:13.5px; font-weight:700; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.escapeHTML(x.name)} <span style="font-size:11px; color:#64748b; font-weight:normal;">(@${a.escapeHTML(x.orig)})</span></div>
              <div class="lsa-row" style="gap:4px; margin-top:4px;">${tags.join("")}</div>
            </div>
            <div style="text-align:center; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:4px 10px; flex-shrink:0;">
              <div style="font-size:15px; font-weight:900; color:#D4AF37;">${ico} ${a.formatNumber(x.streak)}</div>
              <div style="font-size:9.5px; color:#94a3b8;">فرص: ${void 0!==x.d.recoveryChances?x.d.recoveryChances:3}</div>
            </div>
          </div>
          <div style="font-size:10.5px; color:#94a3b8;">آخر دخول: ${a.formatDayDate(x.d.lastLogin)}${x.d.bestStreak?` • قياسي: <b style="color:#cbd5e1;">${a.formatNumber(x.d.bestStreak)}</b>`:""}</div>
          ${noteHtml}
          <div class="lsa-row" style="margin-top:8px; gap:5px;">
            <button type="button" class="lsa-btn lsa-btn-gold lsa-mini lsa-act-edit" data-key="${a.escapeHTML(x.key)}" style="width:auto;"><i class="fas fa-edit"></i> تعديل شامل</button>
            <button type="button" class="lsa-btn lsa-btn-success lsa-mini lsa-act-plus1" data-key="${a.escapeHTML(x.key)}">+1</button>
            <button type="button" class="lsa-btn lsa-btn-warn lsa-mini lsa-act-minus1" data-key="${a.escapeHTML(x.key)}">-1</button>
            ${reviveBtn}
            <button type="button" class="lsa-btn lsa-btn-info lsa-mini lsa-act-shield3" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-shield-alt"></i> ${x.isFrz?"فك الدرع":"درع"}</button>
            <button type="button" class="lsa-btn lsa-btn-danger lsa-mini lsa-act-del" data-key="${a.escapeHTML(x.key)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".lsa-mem-chk").forEach(cb=>cb.onchange=()=>{
      cb.checked?admin.selectedKeys.add(cb.dataset.key):admin.selectedKeys.delete(cb.dataset.key);
      admin.renderMembers()
    });
    c.querySelectorAll(".lsa-act-edit").forEach(b=>b.onclick=()=>admin.openUserEditor(b.dataset.key));
    c.querySelectorAll(".lsa-act-plus1").forEach(b=>b.onclick=()=>admin.quickAddStreak(b.dataset.key,1));
    c.querySelectorAll(".lsa-act-minus1").forEach(b=>b.onclick=()=>admin.quickAddStreak(b.dataset.key,-1));
    c.querySelectorAll(".lsa-act-revive").forEach(b=>b.onclick=()=>admin.reviveUser(b.dataset.key));
    c.querySelectorAll(".lsa-act-shield3").forEach(b=>b.onclick=()=>admin.toggleQuickShield(b.dataset.key));
    c.querySelectorAll(".lsa-act-del").forEach(b=>b.onclick=()=>admin.deleteUser(b.dataset.key))
  },
  batchAdjustStreak(isAdd){
    let keys=Array.from(admin.selectedKeys);
    if(!keys.length)return r.showToast("حدد عضواً واحداً على الأقل أولاً");
    let raw=prompt(isAdd?`كم يوماً تريد إضافته لـ (${keys.length}) عضو؟`:`كم يوماً تريد خصمه من (${keys.length}) عضو؟`,isAdd?"5":"5");
    let amt=parseInt(raw,10);
    if(!amt||amt<=0)return;
    let tm=a.getTodayMidnight(),updates={};
    keys.forEach(k=>{
      let d=t.cache[k]||{},cur=d.streak||0;
      let next=isAdd?cur+amt:Math.max(0,cur-amt);
      updates[`${k}/streak`]=next;
      updates[`${k}/bestStreak`]=Math.max(d.bestStreak||0,next);
      if(isAdd)updates[`${k}/lastLogin`]=tm;
      if(!d.originalName)updates[`${k}/originalName`]=k
    });
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction(isAdd?"زيادة جماعية محددة":"خصم جماعي محدد",`${keys.length} عضو`,isAdd?`+${amt} يوم`:`-${amt} يوم`);
      admin.selectedKeys.clear();
      r.showToast(isAdd?`✅ تمت إضافة +${amt} يوم لـ ${keys.length} عضو`:`⚠️ تم خصم -${amt} يوم من ${keys.length} عضو`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  batchShield(days){
    let keys=Array.from(admin.selectedKeys);
    if(!keys.length)return r.showToast("حدد عضواً واحداً على الأقل أولاً");
    if(!confirm(`منح درع حماية لمدة ${days} أيام إلى (${keys.length}) عضو محدد؟`))return;
    let exp=Date.now()+days*e.dayInMs,updates={};
    keys.forEach(k=>{updates[`${k}/frozenUntil`]=exp});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("درع لمجموعة محددة",`${keys.length} عضو`,`${days} أيام`);
      admin.selectedKeys.clear();
      r.showToast(`🛡️ تم منح الدرع لـ ${keys.length} عضو`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  batchDelete(){
    let keys=Array.from(admin.selectedKeys);
    if(!keys.length)return r.showToast("حدد عضواً واحداً على الأقل أولاً");
    if(!confirm(`حذف (${keys.length}) سجل نهائياً من قاعدة البيانات؟ لا يمكن التراجع!`))return;
    let updates={};
    keys.forEach(k=>{updates[k]=null});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      keys.forEach(k=>delete t.cache[k]);
      a.rebuildDisplayNameMap();
      localStorage.setItem(e.cacheKey,JSON.stringify(t.cache));
      admin.logAction("حذف متعدد",`${keys.length} سجل`,"حذف نهائي من القاعدة");
      admin.selectedKeys.clear();
      admin.refreshAll();
      r.showToast(`🗑️ تم حذف ${keys.length} سجل نهائياً`)
    }).catch(()=>alert("❌ فشل الحذف."))
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
    let isLck=a.isGainLocked(d);
    let curMult=Number(d.boostMultiplier)||1;
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
            </div>`:`<div style="font-size:11.5px; color:#94a3b8; margin-bottom:8px;">المعرّف: <b style="color:#D4AF37;">@${a.escapeHTML(d.originalName||key)}</b> ${isFrz?`• 🛡️ (${a.formatRemaining(d.frozenUntil)})`:""}${d.bestStreak?` • قياسي: ${d.bestStreak}`:""}</div>`}
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
            <button type="button" class="lsa-quick-pill" data-delta="-5">-5</button>
            <button type="button" class="lsa-quick-pill" data-delta="-1">-1</button>
            <button type="button" class="lsa-quick-pill" data-delta="1">+1</button>
            <button type="button" class="lsa-quick-pill" data-delta="5">+5</button>
            <button type="button" class="lsa-quick-pill" data-delta="10">+10</button>
            <button type="button" class="lsa-quick-pill" data-delta="30">+30</button>
            <button type="button" class="lsa-quick-pill" data-delta="0" style="color:#f87171;">تصفير</button>
          </div>
          <div class="lsa-grid-2" style="margin-bottom:9px;">
            <div>
              <label class="lsa-label">🛡️ درع الحماية (ضد الانطفاء)</label>
              <select id="lsa-ed-freeze" class="lsa-input">
                <option value="keep">${isFrz?"إبقاء ("+a.formatRemaining(d.frozenUntil)+")":"بدون درع"}</option>
                <option value="none">إزالة الدرع</option>
                <option value="1">24 ساعة</option>
                <option value="3">3 أيام</option>
                <option value="7">أسبوع (7 أيام)</option>
                <option value="14">أسبوعين</option>
                <option value="30">شهر (30 يوم)</option>
                <option value="3650">حماية دائمة</option>
              </select>
            </div>
            <div>
              <label class="lsa-label">⚡ مضاعف VIP شخصي</label>
              <select id="lsa-ed-mult" class="lsa-input">
                <option value="1" ${1===curMult?"selected":""}>عادي (×1 يومياً)</option>
                <option value="2" ${2===curMult?"selected":""}>دبل VIP (×2 يومياً)</option>
                <option value="3" ${3===curMult?"selected":""}>تريبل ملكي (×3 يومياً)</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:9px;">
            <label class="lsa-label">🔒 عقوبة قفل الزيادة (إيقاف نمو الشعلة بدون مسحها)</label>
            <select id="lsa-ed-lock" class="lsa-input">
              <option value="keep">${isLck?"إبقاء التجميد ("+a.formatRemaining(d.gainFrozenUntil)+")":"غير مجمّد (يزيد طبيعياً)"}</option>
              <option value="none">إزالة تجميد الزيادة</option>
              <option value="1">تجميد الزيادة 24 ساعة</option>
              <option value="3">تجميد الزيادة 3 أيام</option>
              <option value="7">تجميد الزيادة أسبوع</option>
              <option value="30">تجميد الزيادة شهر</option>
            </select>
          </div>
          <div style="margin-bottom:9px;">
            <label class="lsa-label">أيقونة الشعلة المخصصة</label>
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
            <input type="text" id="lsa-ed-note" class="lsa-input" value="${a.escapeHTML(d.note||"")}" placeholder="مثلاً: فائز مسابقة، إجازة سفر، مخالفة...">
          </div>
          <div class="lsa-grid-2" style="margin-bottom:10px;">
            <div>
              <label class="lsa-label">نوع الإشعار للعضو</label>
              <select id="lsa-ed-alert-type" class="lsa-input">
                <option value="gift">🎁 هدية + كونفيتي</option>
                <option value="warn">⚠️ تحذير/عقاب (بدون كونفيتي)</option>
              </select>
            </div>
            <div>
              <label class="lsa-label">نص الإشعار (اختياري)</label>
              <input type="text" id="lsa-ed-alert" class="lsa-input" placeholder="اتركه فارغاً للحفظ الصامت...">
            </div>
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
      let lckVal=document.getElementById("lsa-ed-lock").value;
      let gainFrozenUntil="keep"===lckVal?(d.gainFrozenUntil||null):"none"===lckVal?null:Date.now()+Number(lckVal)*e.dayInMs;
      let mult=Number(document.getElementById("lsa-ed-mult").value)||1;
      let emoji=(document.getElementById("lsa-ed-emoji").value||"").trim()||null;
      let resetToday=document.getElementById("lsa-ed-today").checked;
      let hidden=document.getElementById("lsa-ed-hidden").checked;
      let hideFromBoard=document.getElementById("lsa-ed-hideboard").checked;
      let excluded=document.getElementById("lsa-ed-excluded").checked;
      let note=(document.getElementById("lsa-ed-note").value||"").trim()||null;
      let alertTxt=(document.getElementById("lsa-ed-alert").value||"").trim();
      let alertType=document.getElementById("lsa-ed-alert-type").value;
      let payload={
        streak:newSt,
        bestStreak:Math.max(d.bestStreak||0,newSt),
        recoveryChances:newCh,
        originalName:d.originalName||rawUser,
        displayName:d.displayName||rawUser,
        frozenUntil,
        gainFrozenUntil,
        boostMultiplier:mult>1?mult:null,
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
      if(alertTxt){
        if("warn"===alertType)payload.adminPenaltyAlert=alertTxt;
        else payload.adminAlert=alertTxt
      }
      let oldSt=d.streak||0;
      t.db.ref(`${e.dbPath}/${san}`).update(payload).then(()=>{
        admin.logAction(isNew?"إضافة عضو":"تعديل عضو",rawUser,`${oldSt} ➔ ${newSt}${mult>1?" | ×"+mult:""}${frozenUntil?" | درع":""}${gainFrozenUntil?" | قفل زيادة":""}${excluded?" | مستبعد":""}`);
        r.showToast("✅ تم حفظ بيانات العضو بنجاح");
        sub.remove();
        admin.refreshAll()
      }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  openTransferModal(){
    let sub=document.getElementById("layl-streak-sub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-streak-sub-modal";
    sub.className="lsa-overlay lsa-sub-overlay";
    sub.innerHTML=`
      <div class="lsa-box lsa-sub-box">
        <div class="lsa-header">
          <div class="lsa-title"><i class="fas fa-exchange-alt"></i> نقل أو دمج شعلة بين حسابين</div>
          <button type="button" class="lsa-ctrl-btn lsa-ctrl-close" id="lsa-tr-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lsa-body">
          <div style="font-size:11.5px; color:#94a3b8; margin-bottom:10px; line-height:1.5;">
            استخدم هذه الأداة إذا غيّر عضو اسمه وأردت نقل رصيده ودرعه وإيموجيه المخصص إلى حسابه الجديد.
          </div>
          <div style="margin-bottom:8px;">
            <label class="lsa-label">الحساب المصدر (القديم)</label>
            <input type="text" id="lsa-tr-from" class="lsa-input" placeholder="Username القديم..." autocomplete="off">
          </div>
          <div style="margin-bottom:8px;">
            <label class="lsa-label">الحساب الوجهة (الجديد)</label>
            <input type="text" id="lsa-tr-to" class="lsa-input" placeholder="Username الجديد..." autocomplete="off">
          </div>
          <div style="margin-bottom:9px;">
            <label class="lsa-label">طريقة الدمج إذا كان للجديد رصيد سابق</label>
            <select id="lsa-tr-mode" class="lsa-input">
              <option value="replace">استبدال رصيد الجديد برصيد القديم</option>
              <option value="sum">جمع الرصيدين معاً</option>
              <option value="max">أخذ الرصيد الأعلى بينهما</option>
            </select>
          </div>
          <label style="display:flex; align-items:center; gap:7px; font-size:12px; color:#fca5a5; margin-bottom:12px; cursor:pointer;">
            <input type="checkbox" id="lsa-tr-delold" class="lsa-chk" checked> حذف سجل الحساب القديم نهائياً من قاعدة البيانات بعد النقل
          </label>
          <button type="button" id="lsa-tr-exec" class="lsa-btn lsa-btn-gold"><i class="fas fa-check"></i> تنفيذ النقل الآن</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lsa-tr-close").onclick=()=>sub.remove();
    document.getElementById("lsa-tr-exec").onclick=()=>{
      if(!t.db)return;
      let fromRaw=(document.getElementById("lsa-tr-from").value||"").trim();
      let toRaw=(document.getElementById("lsa-tr-to").value||"").trim();
      let fromKey=a.sanitizeName(fromRaw),toKey=a.sanitizeName(toRaw);
      if(!fromKey||!toKey||fromKey===toKey)return alert("أدخل اسمَي حسابين مختلفين.");
      let src=t.cache[fromKey];
      if(!src)return alert("الحساب المصدر غير موجود في قاعدة الستريك.");
      let dst=t.cache[toKey]||{};
      let mode=document.getElementById("lsa-tr-mode").value;
      let delOld=document.getElementById("lsa-tr-delold").checked;
      let srcSt=src.streak||0,dstSt=dst.streak||0;
      let finalSt="sum"===mode?srcSt+dstSt:"max"===mode?Math.max(srcSt,dstSt):srcSt;
      if(!confirm(`نقل شعلة (${fromRaw}: ${srcSt}) إلى (${toRaw}) ليصبح الرصيد (${finalSt})${delOld?" مع حذف القديم نهائياً":""}؟`))return;
      let updates={};
      updates[toKey]=Object.assign({},dst,{
        streak:finalSt,
        bestStreak:Math.max(src.bestStreak||0,dst.bestStreak||0,finalSt),
        lastLogin:a.getTodayMidnight(),
        originalName:dst.originalName||toRaw,
        displayName:dst.displayName||toRaw,
        recoveryChances:Math.max(src.recoveryChances||0,dst.recoveryChances||0),
        frozenUntil:Math.max(src.frozenUntil||0,dst.frozenUntil||0)||null,
        customEmoji:src.customEmoji||dst.customEmoji||null,
        boostMultiplier:src.boostMultiplier||dst.boostMultiplier||null,
        lostStreak:null,
        recoveryDeadline:null,
        recoveryProgress:null,
        adminAlert:`تم نقل شعلتك بنجاح إلى هذا الحساب برصيد (${finalSt} يوم)! 🔥`
      });
      if(delOld)updates[fromKey]=null;
      t.db.ref(e.dbPath).update(updates).then(()=>{
        if(delOld){delete t.cache[fromKey];a.rebuildDisplayNameMap()}
        admin.logAction("نقل/دمج شعلة",`${fromRaw} ➔ ${toRaw}`,`الرصيد النهائي: ${finalSt} (${mode})`);
        r.showToast(`✅ تم نقل الشعلة إلى (${toRaw}) بنجاح`);
        sub.remove();
        admin.refreshAll()
      }).catch(()=>alert("❌ فشل النقل في Firebase."))
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  openInactiveCleanerModal(){
    let sub=document.getElementById("layl-streak-sub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-streak-sub-modal";
    sub.className="lsa-overlay lsa-sub-overlay";
    sub.innerHTML=`
      <div class="lsa-box lsa-sub-box">
        <div class="lsa-header">
          <div class="lsa-title" style="color:#fca5a5;"><i class="fas fa-user-slash"></i> حذف الخاملين من قاعدة البيانات</div>
          <button type="button" class="lsa-ctrl-btn lsa-ctrl-close" id="lsa-cl-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lsa-body">
          <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:9px; line-height:1.5;">
            اختر مدة الخمول أو اكتب الرقم الذي تريده، وسيتم حذف السجلات المطابقة <b style="color:#fca5a5;">نهائياً من Firebase</b>.
          </div>
          <label class="lsa-label">اختيار سريع لمدة الخمول:</label>
          <div class="lsa-row" style="gap:5px; margin-bottom:10px;">
            <button type="button" class="lsa-quick-pill lsa-cl-preset" data-days="7">+7 أيام</button>
            <button type="button" class="lsa-quick-pill lsa-cl-preset" data-days="10">+10 أيام</button>
            <button type="button" class="lsa-quick-pill lsa-cl-preset" data-days="15">+15 يوم</button>
            <button type="button" class="lsa-quick-pill lsa-cl-preset active" data-days="30">+30 يوم</button>
            <button type="button" class="lsa-quick-pill lsa-cl-preset" data-days="60">+60 يوم</button>
            <button type="button" class="lsa-quick-pill lsa-cl-preset" data-days="90">+90 يوم</button>
          </div>
          <div style="margin-bottom:10px;">
            <label class="lsa-label">أو اكتب عدد أيام الخمول على كيفك:</label>
            <input type="number" id="lsa-cl-days" class="lsa-input" min="1" max="3650" value="30">
          </div>
          <div class="lsa-card" style="padding:8px 10px; margin-bottom:10px;">
            <label style="display:flex; align-items:center; gap:7px; font-size:11.5px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lsa-cl-keep-frozen" class="lsa-chk" checked> عدم حذف أصحاب درع الحماية 🛡️
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:11.5px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lsa-cl-keep-admin" class="lsa-chk" checked> استثناء حسابات الإدارة
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:11.5px; color:#fcd34d; cursor:pointer;">
              <input type="checkbox" id="lsa-cl-only-low" class="lsa-chk"> حصر الحذف في أصحاب ستريك 0 أو 1 فقط
            </label>
          </div>
          <div id="lsa-cl-preview" class="lsa-card" style="background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.3); font-size:11.5px; margin-bottom:10px;"></div>
          <button type="button" id="lsa-cl-exec" class="lsa-btn lsa-btn-crimson"><i class="fas fa-trash-alt"></i> حذف نهائي من قاعدة البيانات</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lsa-cl-close").onclick=()=>sub.remove();
    let getMatches=()=>{
      let days=Math.max(1,parseInt(document.getElementById("lsa-cl-days").value,10)||30);
      let keepFrz=document.getElementById("lsa-cl-keep-frozen").checked;
      let keepAdm=document.getElementById("lsa-cl-keep-admin").checked;
      let onlyLow=document.getElementById("lsa-cl-only-low").checked;
      let cutoff=a.getTodayMidnight()-days*e.dayInMs;
      let matched=[];
      Object.entries(t.cache||{}).forEach(([k,d])=>{
        if(!d||"object"!=typeof d){matched.push({key:k,name:k,st:0});return}
        if(keepFrz&&d.frozenUntil&&d.frozenUntil>Date.now())return;
        if(keepAdm&&(a.isAdminKey(k)||a.isAdminKey(d.originalName)))return;
        if(onlyLow&&(d.streak||0)>1)return;
        if((d.lastLogin||0)<cutoff)matched.push({key:k,name:d.displayName||d.originalName||k,st:d.streak||0})
      });
      return{days,matched}
    };
    let updatePreview=()=>{
      let{days,matched}=getMatches();
      let prev=document.getElementById("lsa-cl-preview"),btn=document.getElementById("lsa-cl-exec");
      if(!matched.length){
        prev.innerHTML=`<div style="color:#6ee7b7; text-align:center;">ممتاز! لا توجد حسابات خاملة منذ أكثر من <b>${days} يوم</b> حسب الشروط المحددة.</div>`;
        btn.innerHTML='<i class="fas fa-check"></i> لا يوجد ما يُحذف';
        btn.disabled=!0;btn.style.opacity="0.5";
        return
      }
      btn.disabled=!1;btn.style.opacity="1";
      btn.innerHTML=`<i class="fas fa-trash-alt"></i> حذف (${matched.length}) حساب نهائياً من القاعدة`;
      let sample=matched.slice(0,12).map(x=>`${a.escapeHTML(x.name)} (${x.st})`).join(" • ");
      prev.innerHTML=`
        <div style="color:#fca5a5; font-weight:bold; margin-bottom:5px;">سيتم حذف (${matched.length}) حساب خامل منذ +${days} يوم كلياً من Firebase:</div>
        <div style="color:#cbd5e1; font-size:10.5px; line-height:1.6;">${sample}${matched.length>12?` ... و ${matched.length-12} آخرين`:""}</div>`
    };
    sub.querySelectorAll(".lsa-cl-preset").forEach(p=>{
      p.onclick=()=>{
        sub.querySelectorAll(".lsa-cl-preset").forEach(x=>x.classList.remove("active"));
        p.classList.add("active");
        document.getElementById("lsa-cl-days").value=p.dataset.days;
        updatePreview()
      }
    });
    document.getElementById("lsa-cl-days").oninput=()=>{
      sub.querySelectorAll(".lsa-cl-preset").forEach(x=>x.classList.toggle("active",x.dataset.days===document.getElementById("lsa-cl-days").value));
      updatePreview()
    };
    document.getElementById("lsa-cl-keep-frozen").onchange=updatePreview;
    document.getElementById("lsa-cl-keep-admin").onchange=updatePreview;
    document.getElementById("lsa-cl-only-low").onchange=updatePreview;
    document.getElementById("lsa-cl-exec").onclick=()=>{
      if(!t.db)return;
      let{days,matched}=getMatches();
      if(!matched.length)return;
      if(!confirm(`تأكيد نهائي: حذف (${matched.length}) حساب خامل لأكثر من (${days}) يوم كلياً من قاعدة البيانات؟\nلا يمكن التراجع عن هذه العملية!`))return;
      let updates={};
      matched.forEach(x=>{updates[x.key]=null});
      t.db.ref(e.dbPath).update(updates).then(()=>{
        matched.forEach(x=>delete t.cache[x.key]);
        a.rebuildDisplayNameMap();
        localStorage.setItem(e.cacheKey,JSON.stringify(t.cache));
        admin.logAction("حذف خاملين نهائي",`${matched.length} سجل`,`خامل أكثر من ${days} يوم`);
        r.showToast(`🧹 تم حذف ${matched.length} حساب نهائياً من قاعدة البيانات`);
        sub.remove();
        admin.refreshAll();
        admin.populateSettingsUI()
      }).catch(()=>alert("❌ فشل الحذف من Firebase."))
    };
    updatePreview();
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  quickAddStreak(key,delta){
    if(!t.db)return;
    let d=t.cache[key]||{originalName:key,displayName:key,streak:0};
    let oldSt=d.streak||0,newSt=Math.max(0,oldSt+delta);
    let payload={streak:newSt,bestStreak:Math.max(d.bestStreak||0,newSt),originalName:d.originalName||key,displayName:d.displayName||key};
    if(delta>0){payload.lastLogin=a.getTodayMidnight();payload.lostStreak=null;payload.recoveryDeadline=null;payload.recoveryProgress=null}
    t.db.ref(`${e.dbPath}/${key}`).update(payload).then(()=>{
      admin.logAction(delta>0?"زيادة سريعة":"خصم سريع",d.originalName||key,`${oldSt} ➔ ${newSt}`);
      r.showToast(`${delta>0?"🔥":"⚠️"} أصبح رصيد (${d.displayName||key}): ${newSt}`)
    }).catch(()=>alert("❌ فشل التحديث."))
  },
  reviveUser(key){
    let d=t.cache[key];
    if(!t.db||!d)return;
    t.db.ref(`${e.dbPath}/${key}`).update({
      lastLogin:a.getTodayMidnight(),
      lostStreak:null,
      recoveryDeadline:null,
      recoveryProgress:null,
      adminAlert:`تم إنعاش شعلتك (${d.streak||0} يوم) وإعادة تفعيلها بواسطة الإدارة! 🔥`
    }).then(()=>{
      admin.logAction("إنعاش شعلة",d.originalName||key,`إعادة تفعيل ${d.streak||0} يوم`);
      r.showToast(`💓 تم إنعاش شعلة (${d.displayName||key})`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
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
    if(!t.db||!confirm(`حذف سجل الستريك للعضو (${d?.displayName||key}) نهائياً من قاعدة البيانات؟`))return;
    t.db.ref(`${e.dbPath}/${key}`).remove().then(()=>{
      delete t.cache[key];
      a.rebuildDisplayNameMap();
      localStorage.setItem(e.cacheKey,JSON.stringify(t.cache));
      admin.logAction("حذف سجل عضو",d?.originalName||key,`الرصيد السابق: ${d?.streak||0}`);
      admin.refreshAll();
      r.showToast("🗑️ تم حذف سجل العضو نهائياً")
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
    let frz=document.getElementById("lsa-ev-freeze"),dbl=document.getElementById("lsa-ev-double");
    let ob=document.getElementById("lsa-ev-online-badge"),gb=document.getElementById("lsa-ev-ghost-badge"),bb=document.getElementById("lsa-ev-bot-badge");
    let side=a.getSidebarSummary();
    frz&&(frz.checked=Boolean(t.settings.globalFreeze));
    dbl&&(dbl.checked=Boolean(t.settings.doubleMode));
    ob&&(ob.textContent=`🟢 ${side.real.length} متصل فعلي`);
    gb&&(gb.textContent=`👻 ${side.ghosts.length} وهمي مستبعد`);
    bb&&(bb.textContent=`🤖 ${side.bots.length} بوت مستبعد`)
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
    let targets=admin.getTargetsByScope(scope,{skipExcluded:!0});
    if(!targets.length)return alert("لا يوجد أعضاء مطابقون لهذه الفئة حالياً.");
    if(!confirm(`تنفيذ الإهداء (+${amt} يوم) إلى (${targets.length}) عضو${"online"===scope?" متصل فعلياً":""}؟`))return;
    let tm=a.getTodayMidnight(),updates={};
    targets.forEach(x=>{
      let curSt=x.d.streak||0,nextSt=curSt+amt;
      if(amt>0){
        updates[`${x.key}/streak`]=nextSt;
        updates[`${x.key}/bestStreak`]=Math.max(x.d.bestStreak||0,nextSt);
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
  sendBulkPenalty(){
    if(!t.db)return;
    let scope=document.getElementById("lsa-pen-scope")?.value||"online";
    let type=document.getElementById("lsa-pen-type")?.value||"deduct";
    let amt=Math.max(1,parseInt(document.getElementById("lsa-pen-amount")?.value)||1);
    let skipAdm=document.getElementById("lsa-pen-skip-admin")?.checked;
    let skipFrz=document.getElementById("lsa-pen-skip-frozen")?.checked;
    let msg=(document.getElementById("lsa-pen-msg")?.value||"").trim();
    let targets=admin.getTargetsByScope(scope,{skipExcluded:!0,skipAdmins:skipAdm,skipFrozen:skipFrz});
    if(!targets.length)return alert("لا يوجد أعضاء مطابقون لهذه الفئة بعد تطبيق الاستثناءات.");
    let desc="zero"===type?"تصفير الشعلة بالكامل":"chance"===type?`خصم ${amt} فرصة استرجاع`:"lock"===type?`تجميد زيادة الشعلة لمدة ${amt} يوم`:`خصم (-${amt}) يوم ستريك`;
    if(!confirm(`تأكيد العقاب الجماعي:\n${desc}\nعلى (${targets.length}) عضو${"online"===scope?" متصل فعلياً":""}؟`))return;
    let updates={};
    targets.forEach(x=>{
      let curSt=x.d.streak||0;
      if("deduct"===type){
        updates[`${x.key}/streak`]=Math.max(0,curSt-amt)
      }else if("zero"===type){
        updates[`${x.key}/streak`]=0;
        updates[`${x.key}/lostStreak`]=null;
        updates[`${x.key}/recoveryDeadline`]=null;
        updates[`${x.key}/recoveryProgress`]=null
      }else if("chance"===type){
        let curCh=void 0!==x.d.recoveryChances?x.d.recoveryChances:(Number(t.settings.defaultChances)||3);
        updates[`${x.key}/recoveryChances`]=Math.max(0,curCh-amt)
      }else if("lock"===type){
        updates[`${x.key}/gainFrozenUntil`]=Date.now()+amt*e.dayInMs
      }
      updates[`${x.key}/originalName`]=x.d.originalName||x.orig;
      updates[`${x.key}/displayName`]=x.d.displayName||x.disp;
      updates[`${x.key}/adminPenaltyAlert`]=msg||`تم تنفيذ إجراء إداري جماعي: ${desc}.`
    });
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("عقاب جماعي",`${targets.length} عضو (${scope})`,`${desc}${msg?" | "+msg:""}`);
      document.getElementById("lsa-pen-msg").value="";
      r.showToast(`⚠️ تم تطبيق العقاب الجماعي على ${targets.length} عضو`)
    }).catch(()=>alert("❌ فشل تنفيذ العقاب الجماعي."))
  },
  grantBulkShield(){
    if(!t.db)return;
    let scope=document.getElementById("lsa-shield-scope")?.value||"online";
    let days=Number(document.getElementById("lsa-shield-days")?.value)||3;
    let targets=admin.getTargetsByScope(scope,{skipExcluded:!0});
    if(!targets.length)return alert("لا يوجد أعضاء في الفئة المختارة.");
    if(!confirm(`منح درع حماية لمدة ${days} يوم إلى (${targets.length}) عضو${"online"===scope?" متصل فعلياً":""}؟`))return;
    let exp=Date.now()+days*e.dayInMs,updates={};
    targets.forEach(x=>{updates[`${x.key}/frozenUntil`]=exp});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("درع جماعي",`${targets.length} عضو (${scope})`,`لمدة ${days} يوم`);
      r.showToast(`🛡️ تم منح الدرع لـ ${targets.length} عضو!`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  sendBroadcast(){
    if(!t.db)return;
    let scope=document.getElementById("lsa-bc-scope")?.value||"online";
    let style=document.getElementById("lsa-bc-style")?.value||"info";
    let msg=(document.getElementById("lsa-bc-msg")?.value||"").trim();
    if(!msg)return alert("اكتب نص الإشعار أولاً.");
    let targets=admin.getTargetsByScope(scope,{skipExcluded:!0});
    if(!targets.length)return alert("لا يوجد أعضاء مطابقون حالياً.");
    if(!confirm(`بث الإشعار إلى (${targets.length}) عضو؟`))return;
    let field="gift"===style?"adminAlert":"warn"===style?"adminPenaltyAlert":"adminAnnouncement";
    let updates={};
    targets.forEach(x=>{updates[`${x.key}/${field}`]=msg});
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("بث إشعار جماعي",`${targets.length} عضو (${scope})`,msg);
      document.getElementById("lsa-bc-msg").value="";
      r.showToast(`📢 تم بث الإشعار لـ ${targets.length} عضو`)
    }).catch(()=>alert("❌ فشل البث."))
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
    let side=a.getSidebarSummary();
    let riskHtml=atRisk.length
      ?atRisk.slice(0,12).map(x=>`
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
        <div class="lsa-card-title">
          <span><i class="fas fa-chart-pie"></i> ملخص قاعدة الستريك</span>
          <span class="lsa-tag lsa-tag-blue">${a.getEstimatedDbSizeKB()} KB</span>
        </div>
        <div class="lsa-grid-3" style="text-align:center; margin-bottom:10px;">
          <div class="lsa-stat"><div class="lsa-stat-val">${total}</div><div class="lsa-stat-lbl">إجمالي السجلات</div></div>
          <div class="lsa-stat"><div class="lsa-stat-val" style="color:#34d399;">${side.real.length} / ${side.ghosts.length} / ${side.bots.length}</div><div class="lsa-stat-lbl">فعلي / وهمي / بوت</div></div>
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
        <div class="lsa-card-title" style="color:#fca5a5;">
          <span><i class="fas fa-exclamation-triangle"></i> رادار الخطر (لم يدخلوا اليوم بعد)</span>
          <div class="lsa-row" style="gap:5px;">
            <span class="lsa-tag lsa-tag-red">${atRisk.length}</span>
            ${atRisk.length?'<button type="button" id="lsa-risk-save-all" class="lsa-btn lsa-btn-info lsa-mini">🛡️ تأمين الكل لليوم</button>':""}
          </div>
        </div>
        ${riskHtml}
      </div>
      <div class="lsa-card">
        <div class="lsa-card-title">
          <span><i class="fas fa-crown"></i> أعلى 25 شعلة (شامل المخفيين)</span>
          <button type="button" id="lsa-btn-copy-top" class="lsa-btn lsa-btn-gold lsa-mini" style="width:auto;"><i class="fas fa-copy"></i> نسخ التوب 10 للشات</button>
        </div>
        ${topHtml}
      </div>`;
    let saveAllBtn=document.getElementById("lsa-risk-save-all");
    if(saveAllBtn){
      saveAllBtn.onclick=()=>{
        if(!t.db||!confirm(`تأمين وتمديد آخر دخول لليوم لجميع المعرّضين للخطر (${atRisk.length} عضو)؟`))return;
        let tmNow=a.getTodayMidnight(),updates={};
        atRisk.forEach(x=>{updates[`${x.key}/lastLogin`]=tmNow});
        t.db.ref(e.dbPath).update(updates).then(()=>{
          admin.logAction("تأمين رادار الخطر",`${atRisk.length} عضو`,"تمديد آخر دخول لليوم");
          r.showToast(`🛡️ تم تأمين ${atRisk.length} شعلة لليوم`)
        })
      }
    }
    let copyBtn=document.getElementById("lsa-btn-copy-top");
    if(copyBtn){
      copyBtn.onclick=()=>{
        let pubTop=allActive.filter(x=>!x.d.hidden&&!x.d.hideFromBoard).slice(0,10);
        if(!pubTop.length)return r.showToast("لا يوجد أبطال متاحون للنسخ");
        let lines=["👑 أبطال شعلة شات ليل (التوب 10) 🔥","━━━━━━━━━━━━━━"];
        pubTop.forEach((x,idx)=>{
          let med=0===idx?"🏆":1===idx?"🥈":2===idx?"🥉":`${idx+1}.`;
          lines.push(`${med} ${x.d.displayName||x.key} — ${x.st} يوم ${a.getTierIcon(x.st,x.d)}`)
        });
        let txt=lines.join("\n");
        navigator.clipboard?navigator.clipboard.writeText(txt).then(()=>r.showToast("📋 تم نسخ قائمة التوب 10 جاهزة للنشر!")).catch(()=>prompt("انسخ القائمة:",txt)):prompt("انسخ القائمة:",txt)
      }
    }
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
    t.db.ref(`${e.adminPath}/logs`).limitToLast(200).once("value").then(snap=>{
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
  exportLogs(){
    if(!t.adminLogs.length)return r.showToast("لا توجد سجلات للتصدير");
    let lines=t.adminLogs.map(x=>`[${a.formatDate(x.timestamp)}] (${x.action}) ${x.admin} -> ${x.target} | ${x.details||""}`);
    let blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    let url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`layl-streaks-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1e3);
    r.showToast("📄 تم تصدير سجل الإدارة")
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
    document.getElementById("lsa-set-milestones").value=t.settings.milestones||defaultSettings.milestones;
    document.getElementById("lsa-set-welcomes").value=t.settings.welcomeMessages||"";
    let sz=document.getElementById("lsa-db-size-tag");
    sz&&(sz.textContent=`${a.getEstimatedDbSizeKB()} KB • ${Object.keys(t.cache||{}).length} سجل`);
    admin.renderAdminsList()
  },
  renderAdminsList(){
    let c=document.getElementById("lsa-admins-list"),cnt=document.getElementById("lsa-admins-cnt");
    if(!c)return;
    cnt&&(cnt.textContent=t.adminUsers.length);
    let mySan=a.sanitizeName(t.myUsername);
    c.innerHTML=t.adminUsers.map(ad=>{
      let isMe=ad===t.myUsername||a.sanitizeName(ad)===mySan;
      return`<span class="lsa-tag lsa-tag-gold" style="padding:4px 8px; font-size:11px;">
        <i class="fas fa-crown"></i> ${a.escapeHTML(ad)}
        ${isMe?'<span style="color:#94a3b8; font-size:9.5px;">(أنت)</span>':`<button type="button" class="lsa-rm-admin" data-ad="${a.escapeHTML(ad)}" style="background:none; border:none; color:#f87171; cursor:pointer; padding:0 3px; font-weight:bold;" title="إزالة">×</button>`}
      </span>`
    }).join("")||'<span style="font-size:11px; color:#64748b;">لا يوجد مشرفون.</span>';
    c.querySelectorAll(".lsa-rm-admin").forEach(b=>b.onclick=()=>{
      let target=b.dataset.ad;
      if(!t.db||!confirm(`إزالة صلاحية المشرف (${target}) من لوحة الستريك؟`))return;
      t.db.ref(`admins/${target}`).remove().then(()=>{
        admin.logAction("إزالة مشرف",target,"سحب الصلاحية");
        r.showToast(`تمت إزالة (${target}) من المشرفين`)
      }).catch(()=>alert("❌ فشل التحديث."))
    })
  },
  addAdminUser(){
    if(!t.db)return;
    let inp=document.getElementById("lsa-new-admin-inp"),raw=(inp?.value||"").trim();
    let san=a.sanitizeName(raw);
    if(!san)return alert("أدخل اسم المستخدم أولاً.");
    t.db.ref(`admins/${san}`).set(!0).then(()=>{
      inp.value="";
      admin.logAction("إضافة مشرف",san,"منح صلاحية اللوحة");
      r.showToast(`👑 تمت إضافة (${san}) إلى الإدارة`)
    }).catch(()=>alert("❌ فشل الإضافة في Firebase."))
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
      milestones:(document.getElementById("lsa-set-milestones").value||"").trim()||defaultSettings.milestones,
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
  cleanAlerts(){
    if(!t.db)return;
    let updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(d&&(d.adminAlert||d.adminPenaltyAlert||d.adminAnnouncement)){
        if(d.adminAlert)updates[`${k}/adminAlert`]=null;
        if(d.adminPenaltyAlert)updates[`${k}/adminPenaltyAlert`]=null;
        if(d.adminAnnouncement)updates[`${k}/adminAnnouncement`]=null;
        cnt++
      }
    });
    if(!cnt)return r.showToast("لا توجد إشعارات عالقة");
    if(!confirm(`مسح الإشعارات العالقة لـ (${cnt}) عضو؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      admin.logAction("مسح الإشعارات العالقة",`${cnt} عضو`,"تنظيف alerts");
      r.showToast(`🧹 تم مسح الإشعارات العالقة لـ ${cnt} عضو`)
    })
  },
  cleanCorruptRecords(){
    if(!t.db)return;
    let updates={},cnt=0;
    Object.entries(t.cache||{}).forEach(([k,d])=>{
      if(!d||"object"!=typeof d||((!d.streak||d.streak<=0)&&!d.lostStreak&&!d.excluded&&!d.frozenUntil)){
        updates[k]=null;cnt++
      }
    });
    if(!cnt)return r.showToast("قاعدة البيانات نظيفة تماماً!");
    if(!confirm(`حذف (${cnt}) سجل فارغ أو برصيد 0 نهائياً من القاعدة؟`))return;
    t.db.ref(e.dbPath).update(updates).then(()=>{
      Object.keys(updates).forEach(k=>delete t.cache[k]);
      a.rebuildDisplayNameMap();
      localStorage.setItem(e.cacheKey,JSON.stringify(t.cache));
      admin.logAction("تنظيف سجلات فارغة",`${cnt} سجل`,"حذف السجلات الصفرية/التالفة");
      admin.populateSettingsUI();
      r.showToast(`🧹 تم حذف ${cnt} سجل فارغ نهائياً`)
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
  seasonReset(){
    if(!t.db)return;
    let cnt=Object.keys(t.cache||{}).length;
    if(!cnt)return r.showToast("القاعدة فارغة بالفعل");
    let word=prompt(`⚠️ تحذير شديد: سيتم تنزيل نسخة احتياطية JSON ثم تصفير وحذف جميع سجلات الستريك (${cnt} سجل) لبداية موسم جديد.\nللتأكيد اكتب كلمة: تصفير`);
    if(!word||"تصفير"!==word.trim())return r.showToast("تم إلغاء عملية التصفير");
    admin.exportBackup();
    t.db.ref(e.dbPath).remove().then(()=>{
      t.cache={};
      a.rebuildDisplayNameMap();
      localStorage.setItem(e.cacheKey,"{}");
      admin.logAction("تصفير موسم جديد",`${cnt} سجل`,"تم أخذ نسخة احتياطية وتصفير القاعدة");
      admin.refreshAll();
      admin.populateSettingsUI();
      r.showToast("🎆 تم تصفير القاعدة لبداية موسم جديد بنجاح!")
    }).catch(()=>alert("❌ فشل التصفير."))
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
        a.isBotElement(el)||a.isGhostElement(el,!0)||(ok=!0)
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
  let obs=new MutationObserver(muts=>{
    let dirty=new Set,needUi=!1;
    if(a.isAdmin()&&!document.getElementById("btn-lail-streak-admin")&&document.querySelector(".modern-classic-list"))needUi=!0;
    for(let m of muts){
      let mt=m.target;
      if(!mt||1!==mt.nodeType)continue;
      if(mt.closest&&mt.closest(".lsa-overlay, .layl-modal-overlay, #login-overlay.d-none"))continue;
      if("attributes"===m.type){
        if(mt.classList?.contains("user-identity")||"userProfileModal"===mt.id)dirty.add(mt)
      }else if("childList"===m.type){
        for(let node of m.addedNodes){
          if(1!==node.nodeType)continue;
          let cls=node.classList;
          if(cls&&(cls.contains("night-streak")||cls.contains("lsa-overlay")||cls.contains("layl-modal-overlay")||cls.contains("lsa-toast")))continue;
          let nid=node.id;
          if("layl-recovery-banner"===nid||"btn-lail-streak-admin"===nid||"btn-streak-leaderboard"===nid||"streak-visibility-row"===nid||"admin-edit-streak-container"===nid)continue;
          let isRow=cls&&(cls.contains("message-row")||cls.contains("msg-status-login")||cls.contains("user-join-message")||cls.contains("styled-sys-msg")||cls.contains("sys-msg-login")||cls.contains("msg-self"));
          let rows=node.querySelectorAll?node.querySelectorAll(".message-row, .msg-status-login, .user-join-message, .styled-sys-msg, .sys-msg-login"):null;
          if(isRow||(rows&&rows.length)){
            let myMsg=cls?.contains("message-row")?node:node.querySelector(".message-row");
            if(myMsg&&t.myUsername&&myMsg.querySelector(`.message-text[data-username="${t.myUsername}"]`)){l.handleRecoveryProgress()}
            let scan=isRow?(rows&&rows.length?[node,...Array.from(rows)]:[node]):Array.from(rows);
            for(let el of scan){
              if(el&&el.classList){
                let isSelf=el.classList.contains("msg-self")||Boolean(el.querySelector(".msg-self"));
                let isLogin=el.classList.contains("msg-status-login")||el.classList.contains("user-join-message")||el.classList.contains("sys-msg-login");
                if(isSelf||isLogin){
                  let u=n(el);
                  if(!a.isBotElement(el)&&!a.isGhostElement(el,!1)&&u&&u.username){
                    isSelf&&(localStorage.setItem("pc_username",u.username),t.myUsername=u.username,o.injectAdminPanelBtn(),o.injectAdminStreakEditor());
                    isLogin&&l.updateUserLogin(u.username,u.displayName)
                  }
                }
              }
            }
          }
          if("elite-board-menu-items"===nid||"privacy-group"===nid||"profile-admin-edit-section"===nid||"btn-lail-zajel-admin"===nid||(cls&&(cls.contains("modern-classic-list")||cls.contains("classic-settings-container")))){
            needUi=!0
          }
          if(isRow||(cls&&(cls.contains("user-pro-item")||cls.contains("list-group-item")||cls.contains("user-identity")))||(node.querySelector&&node.querySelector(".user-identity, .user-identity-name, #sidebar-users-container, #profile-header-classic-bar"))){
            dirty.add(node)
          }else if(node.querySelector&&node.querySelector(".modern-classic-list, #privacy-group, #elite-board-menu-items, #profile-admin-edit-section")){
            needUi=!0
          }
        }
      }
    }
    if(dirty.size){
      dirty.forEach(nd=>o.triggerRender(nd))
    }else if(needUi){
      o.withoutObserver(()=>{
        o.injectEliteMenuBtn();
        o.injectPrivacyToggle();
        o.injectAdminStreakEditor();
        o.injectAdminPanelBtn()
      })
    }
  });
  t.observer=obs;
  obs.observe(document.body,OBSERVER_OPTS)
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
        admin.renderAdminsList();
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
        a.rebuildDisplayNameMap();
        try{localStorage.setItem(e.cacheKey,JSON.stringify(t.cache))}catch{}
        o.triggerRender();
        admin.refreshAll();
        if(t.myUsername&&t.cache[a.sanitizeName(t.myUsername)]){
          let mySan=a.sanitizeName(t.myUsername),cur=t.cache[mySan],day=new Date().toISOString().split("T")[0];
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
            t.db.ref(`${e.dbPath}/${mySan}/adminAlert`).remove()
          }else if(cur.adminPenaltyAlert){
            r.showModal(`
              <div style="text-align:center;">
                <div style="font-size:50px; margin: 0 auto 15px auto;">⚠️</div>
                <h3 style="color:#f87171; margin:0 0 15px; font-family:'Segoe UI', tahoma, sans-serif;">تنبيه من الإدارة</h3>
                <div style="color:#fecaca; font-size:15px; background:rgba(139,24,54,0.2); border:1px solid rgba(239,68,68,0.35); padding:20px 15px; border-radius:16px; line-height: 1.6;">
                  ${a.escapeHTML(cur.adminPenaltyAlert)}
                </div>
                <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-burgundy">حسناً، فهمت</button>
              </div>
            `);
            t.db.ref(`${e.dbPath}/${mySan}/adminPenaltyAlert`).remove()
          }else if(cur.adminAnnouncement){
            r.showModal(`
              <div style="text-align:center;">
                <div style="font-size:50px; margin: 0 auto 15px auto; animation: layl-float 3s infinite;">📢</div>
                <h3 style="color:#7dd3fc; margin:0 0 15px; font-family:'Segoe UI', tahoma, sans-serif;">إعلان من إدارة ليل</h3>
                <div style="color:#e2e8f0; font-size:15px; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); padding:20px 15px; border-radius:16px; line-height: 1.6;">
                  ${a.escapeHTML(cur.adminAnnouncement)}
                </div>
                <button onclick="window.LaylStreaks.closeModal()" class="layl-btn-gold">حسناً</button>
              </div>
            `);
            t.db.ref(`${e.dbPath}/${mySan}/adminAnnouncement`).remove()
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
          if(!cur.excluded&&a.getMilestones().includes(cur.streak)&&!celeb.includes(cur.streak)){
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
        if(!a.isBotElement(el)&&!a.isGhostElement(el,!1)&&u&&u.username)l.updateUserLogin(u.username,u.displayName)
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
