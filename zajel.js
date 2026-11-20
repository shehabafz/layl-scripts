!function(){"use strict";
let e={
  dbPath:"layl_music_zajel",
  myUsername:localStorage.getItem("pc_username")||null,
  myDisplayName:null,
  db:null,
  adminUsers:[],
  banData:null,
  settings:{
    enabled:!0,
    allowReplies:!0,
    revealMode:!1,
    dailyLimit:0,
    maxMsgLength:60,
    cooldown:0,
    disabledMsg:"زاجل الموسيقى متوقف مؤقتاً للصيانة.",
    badWords:""
  },
  lastSendTime:Number(localStorage.getItem("zajel_last_send")||0),
  isRenderingBtn:!1,
  listenedUser:null,
  isListeningGlobal:!1,
  inbox:{},
  initialLoadDone:!1,
  ytApiKey:"AIzaSyBuDi3N7YkrkLbfBj2JxFxIR-nZZklR8GY",
  localZajelState:{},
  currentPlayingId:null,
  currentPlayingSender:null,
  currentPlayingReceiverName:null,
  toastQueue:[],
  isToasting:!1,
  adminLogsCache:[],
  adminBannedCache:{},
  adminBlocksCache:[]
};

let t={
  sanitizeName:n=>n?n.replace(/[.#$\[\]\/]/g,"_").trim():null,
  escapeHTML:n=>n?String(n).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]||c):"",
  getCleanText(n){if(!n)return null;let c=n.cloneNode(!0);return c.querySelectorAll("img, i, svg, .user-identity-badge-icon, .user-identity-super").forEach(x=>x.remove()),c.textContent.trim()},
  extractUser(n){
    if(!n||n.classList.contains("guest")||n.classList.contains("is-guest")||n.closest(".guest, .is-guest, .guest-user"))return null;
    let a=null,l=null,i=n.querySelector(".message-avatar");
    i&&(a=i.getAttribute("data-username"));
    let r=n.classList.contains("user-identity")?n:n.querySelector(".user-identity");
    r&&(a||(a=r.getAttribute("data-username")||r.getAttribute("data-user-id")),l=t.getCleanText(r.querySelector(".user-identity-name")||r));
    let s=n.querySelector(".message-text")||n.querySelector(".message-body");
    return!a&&s&&(a=s.getAttribute("data-username")),a||(a=n.getAttribute("data-username")||n.getAttribute("data-user")),!a&&l&&e.myUsername&&(l.includes(e.myUsername)||e.myUsername.includes(l))&&(a=e.myUsername),{username:a,displayName:l||a}
  },
  getOnlineUsers(includeSelf=!1){
    let n=[];
    return document.querySelectorAll("#sidebar-users-container .user-identity").forEach(el=>{
      let a=t.extractUser(el);
      a&&a.username&&(includeSelf||a.username!==e.myUsername)&&n.push(a)
    }),n.filter((x,idx,arr)=>arr.findIndex(y=>y.username===x.username)===idx)
  },
  extractYtId(input){
    if(!input)return"";
    let s=input.trim();
    if(/^[a-zA-Z0-9_-]{11}$/.test(s))return s;
    let m=s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return m?m[1]:""
  },
  getTodayKey(){
    let d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return`${y}-${m}-${day}`
  },
  timeAgo(n){
    if(!n)return"";
    let m=Math.floor((Date.now()-n)/6e4);
    if(m<1)return"الآن";
    if(m<60)return`منذ ${m} د`;
    let h=Math.floor(m/60);
    return h<24?`منذ ${h} س`:`منذ ${Math.floor(h/24)} ي`
  },
  formatDate(n){
    if(!n)return"-";
    try{return new Date(n).toLocaleString("ar-EG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return t.timeAgo(n)}
  },
  formatRemaining(exp){
    if(!exp)return"دائم";
    let diff=exp-Date.now();
    if(diff<=0)return"منتهي";
    let mins=Math.ceil(diff/6e4);
    if(mins<60)return`${mins} دقيقة`;
    let hrs=Math.floor(mins/60),remM=mins%60;
    if(hrs<24)return remM?`${hrs} س و ${remM} د`:`${hrs} ساعة`;
    let days=Math.floor(hrs/24),remH=hrs%24;
    return remH?`${days} ي و ${remH} س`:`${days} يوم`
  },
  isCurrentlyBanned(){
    if(!e.banData)return!1;
    if(e.banData.expiresAt&&Date.now()>=e.banData.expiresAt)return!1;
    return!0
  },
  getBanAlertText(){
    let d=e.banData||{};
    let msg="تم منعك من استخدام الزاجل من قبل الإدارة 🚫";
    if(d.reason)msg+=`\nالسبب: ${d.reason}`;
    if(d.expiresAt)msg+=`\nالوقت المتبقي: ${t.formatRemaining(d.expiresAt)}`;
    return msg
  },
  isAdmin(){
    if(!e.myUsername||!e.adminUsers.length)return!1;
    let s=t.sanitizeName(e.myUsername);
    return e.adminUsers.includes(e.myUsername)||(s&&e.adminUsers.includes(s))
  },
  hasBadWords(text){
    if(!text||!e.settings.badWords)return!1;
    let words=String(e.settings.badWords).split(/[,،\n]+/).map(w=>w.trim().toLowerCase()).filter(Boolean);
    if(!words.length)return!1;
    let low=text.toLowerCase();
    return words.some(w=>low.includes(w))
  }
};

let a={
  injectStyles(){
    if(document.getElementById("layl-zajel-styles"))return;
    let s=document.createElement("style");
    s.id="layl-zajel-styles";
    s.innerHTML=`
.zajel-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 11, 20, 0.9); z-index: 2147483647; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); opacity: 0; visibility: hidden; transition: opacity 0.3s ease; direction: rtl; }
.zajel-modal-overlay.active { opacity: 1; visibility: visible; }
.zajel-modal-overlay.minimized { background: transparent; backdrop-filter: none; pointer-events: none; }
.zajel-box { background: linear-gradient(180deg, rgba(28, 31, 56, 0.98) 0%, rgba(18, 20, 36, 0.98) 100%); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; padding: 20px 25px 25px; width: 90%; max-width: 380px; max-height: 85vh; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8); transform: scale(0.9) translateY(20px); opacity: 0; transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; pointer-events: auto; display: flex; flex-direction: column; }
.zajel-modal-overlay.active .zajel-box { transform: scale(1) translateY(0); opacity: 1; }
.zajel-top-controls { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 15px; }
.zajel-top-controls-search { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
.zajel-btn-control { background: rgba(255,255,255,0.1); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: background 0.2s; }
.zajel-btn-control:hover { background: rgba(255,255,255,0.2); }
.zajel-btn-close:hover { background: rgba(239, 68, 68, 0.8); }
.zajel-tabs { display: flex; background: rgba(0,0,0,0.3); border-radius: 12px; margin-bottom: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
.zajel-tab-btn { flex: 1; background: transparent; color: #94a3b8; border: none; padding: 12px 5px; font-family: inherit; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; position: relative; text-align: center; }
.zajel-tab-btn.active { background: rgba(212, 175, 55, 0.15); color: #D4AF37; border-bottom: 2px solid #D4AF37; }
.zajel-views-container { flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 5px; margin-right: -5px; -webkit-overflow-scrolling: touch; }
.zajel-views-container::-webkit-scrollbar { width: 4px; }
.zajel-views-container::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 10px; }
.zajel-view { display: none; }
.zajel-view.active { display: block; }
.zajel-badge-count { background: #ef4444; color: #fff; border-radius: 50%; padding: 2px 6px; font-size: 10px; margin-right: 4px; display: inline-block; }
.zajel-box.minimized { position: fixed !important; bottom: 100px !important; right: 20px !important; left: auto !important; width: 60px !important; height: 60px !important; border-radius: 50% !important; padding: 0 !important; overflow: hidden; transform: scale(1) !important; cursor: grab; border: 2px solid #D4AF37; box-shadow: 0 5px 20px rgba(212,175,55,0.4); z-index: 3; transition: width 0.3s, height 0.3s, border-radius 0.3s, padding 0.3s; }
.zajel-box.minimized:active { cursor: grabbing; }
.zajel-box.minimized .zajel-tabs, .zajel-box.minimized .zajel-top-controls, .zajel-box.minimized .zajel-views-container { display: none !important; }
.zajel-box.minimized::after { content: '🎵'; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(18, 20, 36, 0.8); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #D4AF37; z-index: 10; pointer-events: none; }
.zajel-box.minimized .zajel-iframe-container { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; display: block !important; }
.zajel-header { text-align: center; margin-bottom: 15px; }
.zajel-icon { font-size: 45px; margin-bottom: 10px; animation: zajel-float 3s ease-in-out infinite; display: inline-block; filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5)); }
.zajel-title { color: #D4AF37; font-size: 20px; font-weight: bold; margin: 0; font-family: 'Segoe UI', tahoma, sans-serif; }
.zajel-input-group { margin-bottom: 12px; text-align: right; }
.zajel-label { color: #cbd5e1; font-size: 13px; margin-bottom: 6px; display: block; font-weight: bold; }
.zajel-input { width: 100%; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 10px 15px; border-radius: 12px; font-family: inherit; font-size: 14px; outline: none; transition: border 0.3s; box-sizing: border-box; }
.zajel-input:focus { border-color: #D4AF37; }
.zajel-input option { background: #181b30; color: #fff; }
.zajel-users-container { max-height: 120px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-top: 5px; }
.zajel-users-container::-webkit-scrollbar, .zajel-inbox-scroll::-webkit-scrollbar, .zajel-yt-results-scroll::-webkit-scrollbar { width: 6px; }
.zajel-users-container::-webkit-scrollbar-thumb, .zajel-inbox-scroll::-webkit-scrollbar-thumb, .zajel-yt-results-scroll::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.5); border-radius: 10px; }
.zajel-user-item { padding: 10px 15px; color: #cbd5e1; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; transition: all 0.2s; text-align: right; user-select: none; }
.zajel-user-item:hover { background: rgba(255,255,255,0.05); }
.zajel-user-item.selected { background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-weight: bold; border-left: 3px solid #D4AF37; }
.zajel-btn-send, .zajel-btn-play-self { background: linear-gradient(135deg, #D4AF37, #b59226); color: #161824; border: none; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; font-size: 15px; margin-top: 10px; transition: transform 0.2s; }
.zajel-btn-send:active, .zajel-btn-play-self:active { transform: scale(0.96); }
.zajel-btn-send:disabled, .zajel-btn-play-self:disabled { filter: grayscale(1); cursor: not-allowed; }
.zajel-iframe-container { position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; margin-top: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; }
.zajel-iframe-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; pointer-events: auto; }
.zajel-receiver-text { color: #f8fafc; font-size: 16px; text-align: center; margin-bottom: 15px; line-height: 1.6; }
.zajel-anonymous-badge { display: inline-block; background: rgba(212, 175, 55, 0.15); color: #D4AF37; padding: 5px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; border: 1px dashed rgba(212, 175, 55, 0.4); margin-bottom: 12px; }
.zajel-reveal-banner { background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(212, 175, 55, 0.18)); border: 1px solid rgba(192, 132, 252, 0.45); color: #f3e8ff; border-radius: 10px; padding: 8px 10px; font-size: 12px; text-align: center; margin-bottom: 12px; line-height: 1.5; }
.zajel-msg-content { background: rgba(0,0,0,0.25); padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.2); font-size: 14.5px; color: #f8fafc; font-style: italic; display: inline-block; max-width: 100%; word-wrap: break-word; line-height: 1.6; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); margin-top: 15px; }
.zajel-msg-content::before { content: '"'; color: #D4AF37; font-size: 18px; font-weight: bold; margin-left: 4px; }
.zajel-msg-content::after { content: '"'; color: #D4AF37; font-size: 18px; font-weight: bold; margin-right: 4px; }
.zajel-yt-results-scroll { max-height: 350px; overflow-y: auto; padding-left: 5px; }
.zajel-inbox-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; margin-bottom: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; position: relative; }
.zajel-inbox-item:hover { background: rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.3); }
.zajel-inbox-item.unread { background: rgba(212, 175, 55, 0.08); border-color: rgba(212, 175, 55, 0.4); }
.zajel-inbox-item.read { opacity: 0.7; }
.zajel-unread-dot { position: absolute; top: 10px; left: 10px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; box-shadow: 0 0 5px rgba(239,68,68,0.5); }
.zajel-btn-dark { background: rgba(255,255,255,0.1); color: #fff; border: none; padding: 10px 15px; border-radius: 10px; cursor: pointer; font-weight:bold; transition: 0.3s; width: 100%; }
.zajel-btn-dark:hover { background: rgba(255,255,255,0.2); }
.zajel-btn-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 10px 15px; border-radius: 10px; cursor: pointer; font-weight:bold; transition: 0.3s; width: 100%; }
.zajel-btn-danger:hover { background: rgba(239, 68, 68, 0.4); color: #fff; }
.zajel-reply-box { margin-top: 14px; background: rgba(0,0,0,0.25); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 10px; }
.zajel-reply-row { display: flex; gap: 6px; align-items: center; }
.zajel-reply-btn { background: linear-gradient(135deg, #D4AF37, #b59226); color: #161824; border: none; padding: 9px 14px; border-radius: 10px; font-weight: bold; font-size: 12px; cursor: pointer; white-space: nowrap; }
.zajel-reply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.zajel-reply-done { margin-top: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; padding: 9px 12px; border-radius: 10px; font-size: 12.5px; text-align: right; line-height: 1.5; word-break: break-word; }
.zajel-admin-box { max-width: 560px; width: 94%; padding: 16px 18px 18px; }
.zajel-admin-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.zajel-admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
.zajel-stat-card { background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 7px 4px; text-align: center; }
.zajel-stat-val { font-size: 13.5px; font-weight: bold; color: #D4AF37; }
.zajel-stat-lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }
.zajel-admin-tabs { display: flex; background: rgba(0,0,0,0.3); border-radius: 12px; margin-bottom: 12px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.05); }
.zajel-admin-tabs .zajel-tab-btn { padding: 10px 4px; font-size: 11px; white-space: nowrap; }
.zajel-subtabs { display: flex; gap: 6px; margin-bottom: 10px; }
.zajel-subtab { flex: 1; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 8px; font-size: 11.5px; font-weight: bold; cursor: pointer; font-family: inherit; }
.zajel-subtab.active { background: rgba(212,175,55,0.16); color: #D4AF37; border-color: rgba(212,175,55,0.45); }
.zajel-admin-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; text-align: right; }
.zajel-admin-card-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.zajel-tag { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10.5px; font-weight: bold; }
.zajel-tag-zajel { background: rgba(212,175,55,0.15); color: #D4AF37; }
.zajel-tag-reply { background: rgba(16,185,129,0.15); color: #34d399; }
.zajel-tag-broadcast { background: rgba(245,158,11,0.22); color: #fbbf24; }
.zajel-tag-recalled { background: rgba(239,68,68,0.18); color: #fca5a5; }
.zajel-admin-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.zajel-mini-btn { border: none; border-radius: 8px; padding: 5px 9px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: inherit; }
.zajel-setting-row { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 12px; margin-bottom: 8px; gap: 10px; }
.zajel-switch { position: relative; width: 42px; height: 22px; flex-shrink: 0; }
.zajel-switch input { opacity: 0; width: 0; height: 0; }
.zajel-slider { position: absolute; cursor: pointer; inset: 0; background: #334155; border-radius: 22px; transition: 0.25s; }
.zajel-slider:before { content: ""; position: absolute; height: 16px; width: 16px; right: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.25s; }
.zajel-switch input:checked + .zajel-slider { background: #10b981; }
.zajel-switch input:checked + .zajel-slider:before { transform: translateX(-20px); }
.zajel-top-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-radius: 8px; background: rgba(0,0,0,0.2); margin-bottom: 5px; font-size: 12px; }
@keyframes zajel-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.zajel-toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); background: rgba(22, 24, 43, 0.95); border: 1px solid rgba(212, 175, 55, 0.4); color: #f8fafc; padding: 12px 28px; border-radius: 50px; z-index: 2147483647; font-family: tahoma, sans-serif; font-size: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); pointer-events: none; opacity: 0; backdrop-filter: blur(8px); animation: zajel-toast-anim 3.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; white-space: nowrap; font-weight: bold; }
@keyframes zajel-toast-anim { 0% { opacity: 0; transform: translate(-50%, 0px) scale(0.85); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 85% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -100%) scale(0.85); } }
`;
    document.head.appendChild(s)
  },
  injectButton(){
    if(e.isRenderingBtn||document.getElementById("btn-lail-zajel"))return;
    let n=document.querySelector("#sidebar-settings-container .modern-classic-list")||document.querySelector(".modern-classic-list");
    if(n){
      e.isRenderingBtn=!0;
      let b=document.createElement("button");
      b.id="btn-lail-zajel";
      b.className="modern-classic-item";
      b.type="button";
      b.style.position="relative";
      b.innerHTML=`
<div class="modern-classic-item-content">
<div class="modern-classic-icon-wrapper" style="position:relative; overflow:visible; background: linear-gradient(135deg, #1e1b4b, #312e81); color: #818cf8;">
<i class="fas fa-dove"></i>
<b id="zajel-sidebar-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:#ef4444; color:#fff; border-radius:50px; font-size:10px; height:18px; line-height:18px; min-width:18px; padding:0 4px; text-align:center; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.3); left:auto; bottom:auto; margin:0; width:max-content; white-space:nowrap; z-index:10; box-sizing:border-box;">0</b>
</div>
<span class="modern-classic-text">زاجل الموسيقى</span>
</div>
<i class="fas fa-chevron-left modern-classic-chevron"></i>`;
      n.appendChild(b);
      b.addEventListener("click",()=>l.openModal());
      e.isRenderingBtn=!1;
      l.updateBadges();
      a.injectAdminButton()
    }
  },
  injectAdminButton(){
    if(!t.isAdmin()){
      document.querySelectorAll("#btn-lail-zajel-admin").forEach(x=>x.remove());
      return
    }
    document.querySelectorAll(".modern-classic-list").forEach(list=>{
      if(!list||list.querySelector("#btn-lail-zajel-admin"))return;
      let b=document.createElement("button");
      b.type="button";
      b.className="modern-classic-item";
      b.id="btn-lail-zajel-admin";
      b.innerHTML=`
<div class="modern-classic-item-content">
<div class="modern-classic-icon-wrapper" style="background: linear-gradient(135deg, #27200a, #5c4610); color: #D4AF37;">
<i class="fas fa-sliders-h"></i>
</div>
<span class="modern-classic-text">لوحة تحكم الزاجل</span>
</div>
<i class="fas fa-chevron-left modern-classic-chevron"></i>`;
      b.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();admin.open()});
      let zajelBtn=list.querySelector("#btn-lail-zajel");
      zajelBtn?zajelBtn.insertAdjacentElement("afterend",b):list.appendChild(b)
    })
  },
  showToast(n){e.toastQueue.push(n);a.processToast()},
  processToast(){
    if(e.isToasting||0===e.toastQueue.length)return;
    e.isToasting=!0;
    let n=e.toastQueue.shift(),d=document.createElement("div");
    d.className="zajel-toast";
    d.innerHTML=n;
    document.body.appendChild(d);
    setTimeout(()=>{d.remove();e.isToasting=!1;a.processToast()},3600)
  },
  makeDraggable(){
    let n=document.getElementById("zajel-main-box");
    if(!n)return;
    let d=!1,l,i,r,s,o=0,p=0;
    function c(ev){n.classList.contains("minimized")&&("touchstart"===ev.type?(r=ev.touches[0].clientX-o,s=ev.touches[0].clientY-p):(r=ev.clientX-o,s=ev.clientY-p),(ev.target===n||ev.target.parentNode===n)&&(d=!0))}
    function m(){r=l;s=i;d=!1}
    function u(ev){d&&n.classList.contains("minimized")&&(ev.preventDefault(),"touchmove"===ev.type?(l=ev.touches[0].clientX-r,i=ev.touches[0].clientY-s):(l=ev.clientX-r,i=ev.clientY-s),o=l,p=i,n.style.bottom="auto",n.style.right="auto",n.style.transform=`translate3d(${l}px, ${i}px, 0)`)}
    n.addEventListener("mousedown",c,!1);
    n.addEventListener("touchstart",c,{passive:!1});
    document.addEventListener("mouseup",m,!1);
    document.addEventListener("touchend",m,!1);
    document.addEventListener("mousemove",u,{passive:!1});
    document.addEventListener("touchmove",u,{passive:!1});
    n.addEventListener("click",()=>{n.classList.contains("minimized")&&!d&&a.toggleMinimize()})
  },
  toggleMinimize(){
    let n=document.getElementById("layl-zajel-modal"),b=document.getElementById("zajel-main-box");
    n&&b&&(b.classList.contains("minimized")?(b.classList.remove("minimized"),n.classList.remove("minimized"),b.style.left="auto",b.style.bottom="auto",b.style.top="auto",b.style.transform="translate3d(0,0,0)",b.style.position="relative"):(b.classList.add("minimized"),n.classList.add("minimized"),b.style.transform="translate3d(0,0,0)"))
  }
};

let l={
  applySettingsToUI(){
    let inp=document.getElementById("zajel-msg-input");
    if(inp)inp.maxLength=Number(e.settings.maxMsgLength)||60;
    let banner=document.getElementById("zajel-reveal-banner");
    if(banner)banner.style.display=!0===e.settings.revealMode?"block":"none";
    let lbl=document.getElementById("zajel-to-label");
    if(lbl)lbl.textContent=!0===e.settings.revealMode?"إلى من؟ (يوم الصراحة: سيظهر اسمك للمستلم):":"إلى من؟ (يصل كرسالة مجهولة):"
  },
  refreshUsersList(){
    let listEl=document.getElementById("zajel-users-list");
    if(!listEl)return;
    let users=t.getOnlineUsers(!1),html="";
    if(0===users.length){
      html='<div style="padding:15px; text-align:center; color:#94a3b8; font-size:13px;">لا يوجد أعضاء متواجدين حالياً</div>'
    }else{
      users.forEach(u=>{html+=`<div class="zajel-user-item" data-username="${t.escapeHTML(u.username)}">${t.escapeHTML(u.displayName)}</div>`})
    }
    listEl.innerHTML=html
  },
  clearInputs(){
    ["zajel-search-input","zajel-yt-search-input","zajel-self-yt-search-input","zajel-msg-input","zajel-selected-video-id","zajel-self-selected-video-id"].forEach(id=>{let el=document.getElementById(id);if(el)el.value=""});
    document.querySelectorAll(".zajel-user-item").forEach(el=>el.classList.remove("selected"));
    if(window.LaylZajel){window.LaylZajel.selectedUsername=null;window.LaylZajel.selectedDisplayName=null}
  },
  notifyClose(){
    if(window.LaylZajel&&window.LaylZajel.ytPlayer&&"function"==typeof window.LaylZajel.ytPlayer.destroy){
      window.LaylZajel.ytPlayer.destroy();
      window.LaylZajel.ytPlayer=null
    }
    let n=e.currentPlayingId,s=e.currentPlayingSender;
    if(n&&s&&"مجهول"!==s&&e.db&&e.localZajelState&&e.localZajelState[n]){e.localZajelState[n].closed=!0}
    e.currentPlayingId=null;e.currentPlayingSender=null;e.currentPlayingReceiverName=null
  },
  openModal(){
    let n=document.getElementById("layl-zajel-modal");
    if(!n){
      n=document.createElement("div");
      n.id="layl-zajel-modal";
      n.className="zajel-modal-overlay";
      document.body.appendChild(n);
      n.addEventListener("click",ev=>{ev.target===n&&l.closeModal()});
      n.innerHTML=`
<div class="zajel-box" id="zajel-main-box">
<div class="zajel-top-controls" id="zajel-default-controls">
<button class="zajel-btn-control" title="قائمة المحظورين" onclick="window.LaylZajel.switchTab('blocks')"><i class="fas fa-user-secret" style="font-size:12px;"></i></button>
<button class="zajel-btn-control" id="btn-zajel-minimize" title="تصغير" style="display:none;"><i class="fas fa-compress-arrows-alt"></i></button>
<button class="zajel-btn-control zajel-btn-close" onclick="window.LaylZajel.close()" title="إغلاق"><i class="fas fa-times"></i></button>
</div>
<div class="zajel-top-controls-search" id="zajel-search-controls" style="display:none;">
<div style="display:flex; gap:8px;">
<button class="zajel-btn-control zajel-btn-close" onclick="window.LaylZajel.close()" title="إغلاق"><i class="fas fa-times"></i></button>
<button type="button" class="zajel-btn-control" style="background:rgba(255,255,255,0.1);" onclick="window.LaylZajel.closeSearch()" title="رجوع"><i class="fas fa-arrow-left"></i></button>
</div>
<div style="color:#D4AF37; font-weight:bold; font-size: 16px;">نتائج يوتيوب</div>
</div>
<div class="zajel-tabs">
<button class="zajel-tab-btn active" data-tab="send" onclick="window.LaylZajel.switchTab('send')"><i class="fas fa-paper-plane"></i> إرسال</button>
<button class="zajel-tab-btn" data-tab="inbox" onclick="window.LaylZajel.switchTab('inbox')"><i class="fas fa-inbox"></i> رسائلي <span id="zajel-modal-badge" class="zajel-badge-count" style="display:none;">0</span></button>
<button class="zajel-tab-btn" data-tab="self" onclick="window.LaylZajel.switchTab('self')"><i class="fas fa-headphones-alt"></i> أهدي نفسك</button>
</div>
<div class="zajel-views-container">
<div id="zajel-view-send" class="zajel-view active">
<div id="zajel-reveal-banner" class="zajel-reveal-banner" style="display:none;">🎭 فعالية <b>«يوم الصراحة»</b> مفعّلة الآن — سيظهر اسمك للمستلم بدلاً من مجهول!</div>
<div class="zajel-input-group">
<label id="zajel-to-label" class="zajel-label">إلى من؟ (يصل كرسالة مجهولة):</label>
<input type="text" id="zajel-search-input" class="zajel-input" placeholder="🔍 ابحث بالاسم..." autocomplete="off">
<div id="zajel-users-list" class="zajel-users-container"></div>
</div>
<div class="zajel-input-group">
<label class="zajel-label">ابحث عن مقطع يوتيوب:</label>
<div style="display: flex; gap: 8px;">
<input type="text" id="zajel-yt-search-input" class="zajel-input" placeholder="اكتب اسم الأغنية هنا..." autocomplete="off">
<button type="button" id="btn-yt-search" class="zajel-btn-dark" style="width: auto; padding: 10px 15px;" onclick="window.LaylZajel.performSearch('send')"><i class="fas fa-search"></i></button>
</div>
<input type="hidden" id="zajel-selected-video-id">
</div>
<div class="zajel-input-group">
<label class="zajel-label">رسالة قصيرة (اختياري):</label>
<input type="text" id="zajel-msg-input" class="zajel-input zajel-msg-field" placeholder="اكتب إهداء بسيط..." maxlength="60" autocomplete="off">
</div>
<button id="btn-submit-zajel" class="zajel-btn-send">إرسال الزاجل <i class="fas fa-paper-plane ms-1"></i></button>
</div>
<div id="zajel-view-self" class="zajel-view">
<div class="zajel-header" style="margin-bottom:20px;">
<div class="zajel-icon">🎧</div>
<div style="color: #94a3b8; font-size: 13px; margin-top:5px;">استمع للأغنية التي تحبها في خلفية الشات</div>
</div>
<div class="zajel-input-group">
<label class="zajel-label">ابحث عن مقطع يوتيوب:</label>
<div style="display: flex; gap: 8px;">
<input type="text" id="zajel-self-yt-search-input" class="zajel-input" placeholder="اكتب اسم الأغنية هنا..." autocomplete="off">
<button type="button" id="btn-self-yt-search" class="zajel-btn-dark" style="width: auto; padding: 10px 15px;" onclick="window.LaylZajel.performSearch('self')"><i class="fas fa-search"></i></button>
</div>
<input type="hidden" id="zajel-self-selected-video-id">
</div>
<button id="btn-play-self-zajel" class="zajel-btn-play-self">تشغيل المقطع <i class="fas fa-play ms-1"></i></button>
</div>
<div id="zajel-view-blocks" class="zajel-view">
<div class="zajel-header" style="margin-bottom:15px;">
<div class="zajel-icon" style="font-size:35px; margin-bottom:5px;">🚫</div>
<div style="color: #94a3b8; font-size: 13px;">قائمة الأعضاء المحظورين (مجهولي الهوية)</div>
</div>
<div class="zajel-inbox-scroll" id="zajel-blocks-list"></div>
</div>
<div id="zajel-view-search" class="zajel-view">
<div id="zajel-yt-results" class="zajel-yt-results-scroll"></div>
</div>
<div id="zajel-view-inbox" class="zajel-view">
<div class="zajel-inbox-scroll" id="zajel-inbox-list"></div>
</div>
<div id="zajel-view-player" class="zajel-view">
<div id="zajel-player-content"></div>
<div class="zajel-player-actions" style="margin-top:16px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
<button class="zajel-btn-dark" id="btn-player-back" style="flex:1; min-width:90px; padding:10px 5px; font-size:12px;"><i class="fas fa-arrow-right"></i> رجوع</button>
<button class="zajel-btn-danger" id="btn-zajel-delete" style="flex:1; min-width:90px; padding:10px 5px; font-size:12px;"><i class="fas fa-trash"></i> حذف</button>
<button class="zajel-btn-danger" id="btn-zajel-block" style="flex:1; min-width:90px; padding:10px 5px; font-size:12px; background: rgba(220, 38, 38, 0.2); border-color: rgba(220, 38, 38, 0.4); display:none;"><i class="fas fa-ban"></i> حظر</button>
</div>
</div>
</div>
</div>`;
      l.setupSendForm();
      a.makeDraggable();
      document.getElementById("btn-zajel-minimize").addEventListener("click",ev=>{ev.stopPropagation();a.toggleMinimize()})
    }
    l.refreshUsersList();
    l.applySettingsToUI();
    requestAnimationFrame(()=>n.classList.add("active"));
    let r=Object.values(e.inbox||{}).filter(m=>!m.isRead).length;
    l.switchTab(r>0?"inbox":"send");
    l.renderInboxList();
    l.updateBadges()
  },
  closeModal(){
    l.notifyClose();
    let n=document.getElementById("layl-zajel-modal");
    if(n){
      n.classList.remove("active");
      let c=n.querySelector(".zajel-iframe-container");
      c&&(c.innerHTML="")
    }
    l.clearInputs()
  },
  closeSearch(){
    let ctx=window.LaylZajel?window.LaylZajel.currentSearchContext||"send":"send";
    document.getElementById("zajel-view-search").classList.remove("active");
    document.getElementById(`zajel-view-${ctx}`).classList.add("active");
    let tabs=document.querySelector("#layl-zajel-modal .zajel-tabs");
    tabs&&(tabs.style.display="flex");
    document.getElementById("zajel-search-controls").style.display="none";
    document.getElementById("zajel-default-controls").style.display="flex"
  },
  switchTab(n){
    if("player"!==n)l.notifyClose();
    let m=document.getElementById("layl-zajel-modal");
    if(!m)return;
    if("player"!==n){let c=m.querySelector(".zajel-iframe-container");c&&(c.innerHTML="")}
    m.querySelectorAll(".zajel-view").forEach(v=>v.classList.remove("active"));
    m.querySelectorAll(".zajel-tab-btn").forEach(b=>b.classList.remove("active"));
    let v=document.getElementById(`zajel-view-${n}`),b=m.querySelector(`.zajel-tab-btn[data-tab="${n}"]`);
    v&&v.classList.add("active");
    b&&b.classList.add("active");
    let minBtn=document.getElementById("btn-zajel-minimize");
    minBtn&&(minBtn.style.display="player"===n?"flex":"none");
    let tabs=m.querySelector(".zajel-tabs");
    tabs&&(tabs.style.display="player"===n||"search"===n?"none":"flex");
    let sc=document.getElementById("zajel-search-controls"),dc=document.getElementById("zajel-default-controls");
    "search"===n?(sc.style.display="flex",dc.style.display="none"):(sc.style.display="none",dc.style.display="flex");
    if("blocks"===n)l.renderBlocksList();
    if("send"===n){l.refreshUsersList();l.applySettingsToUI()}
  },
  renderBlocksList(){
    let c=document.getElementById("zajel-blocks-list");
    if(!c)return;
    if(!e.db){c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">غير متصل بالقاعدة</div>';return}
    let myS=t.sanitizeName(e.myUsername);
    c.innerHTML='<div style="text-align:center; color:#D4AF37; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب القائمة...</div>';
    e.db.ref(`${e.dbPath}/blocks/${myS}`).once("value").then(snap=>{
      let blocks=snap.val()||{},keys=Object.keys(blocks);
      if(0===keys.length){
        c.innerHTML=`<div style="text-align:center; padding:30px 10px; color:#64748b;"><i class="fas fa-check-circle" style="font-size:30px; margin-bottom:10px; opacity:0.5;"></i><br>قائمة المحظورين فارغة</div>`;
        return
      }
      window.LaylZajel.currentBlocks=keys;
      let html="";
      keys.forEach((bu,idx)=>{
        let bt=blocks[bu],tt="number"==typeof bt?t.timeAgo(bt):"سابقاً";
        html+=`
<div class="zajel-inbox-item" style="cursor:default;">
<div style="display:flex; align-items:center; gap:10px; flex:1;">
<div style="background:rgba(239, 68, 68, 0.1); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#ef4444;"><i class="fas fa-user-secret"></i></div>
<div style="flex:1;">
<div style="color:#f8fafc; font-weight:bold; font-size:14px;">شخص مجهول ${idx+1}</div>
<div style="color:#94a3b8; font-size:11px;">تم الحظر: ${tt}</div>
</div>
<button class="zajel-btn-danger" style="width:auto; padding:6px 12px; font-size:11px;" onclick="window.LaylZajel.unblockUser(${idx})">إلغاء الحظر</button>
</div>
</div>`
      });
      c.innerHTML=html
    }).catch(()=>{c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">حدث خطأ أثناء جلب البيانات</div>'})
  },
  unblockUser(idx){
    let bu=window.LaylZajel.currentBlocks?window.LaylZajel.currentBlocks[idx]:null;
    if(!bu||!e.db||!confirm("هل أنت متأكد من إلغاء الحظر عن هذا الشخص المجهول؟"))return;
    let myS=t.sanitizeName(e.myUsername);
    e.db.ref(`${e.dbPath}/blocks/${myS}/${bu}`).remove().then(()=>{a.showToast("✅ تم إلغاء الحظر بنجاح");l.renderBlocksList()})
  },
  selectYtVideo(vid,title){
    let ctx=window.LaylZajel?window.LaylZajel.currentSearchContext||"send":"send";
    if("send"===ctx){
      document.getElementById("zajel-selected-video-id").value=vid;
      document.getElementById("zajel-yt-search-input").value=title
    }else if("self"===ctx){
      document.getElementById("zajel-self-selected-video-id").value=vid;
      document.getElementById("zajel-self-yt-search-input").value=title
    }
    l.closeSearch();
    a.showToast("🎶 تم اختيار المقطع بنجاح")
  },
  async performSearch(ctx){
    if(window.LaylZajel)window.LaylZajel.currentSearchContext=ctx;
    let inpId="send"===ctx?"zajel-yt-search-input":"zajel-self-yt-search-input";
    let q=document.getElementById(inpId).value.trim();
    if(!q)return alert("الرجاء كتابة اسم الأغنية للبحث");
    l.switchTab("search");
    let resEl=document.getElementById("zajel-yt-results");
    resEl.innerHTML='<div style="text-align:center; color:#D4AF37; padding: 30px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>جاري البحث...</div>';
    let url=`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(q)}&type=video&key=${e.ytApiKey}`;
    try{
      let resp=await fetch(url),data=await resp.json();
      if(data.error){resEl.innerHTML='<div style="color: #ef4444; text-align:center; padding:10px;">حدث خطأ من يوتيوب. تأكد من تفعيل المفتاح.</div>';return}
      if(!data.items||0===data.items.length){resEl.innerHTML='<div style="color: #94a3b8; text-align:center; padding:10px;">لا توجد نتائج.</div>';return}
      let html="";
      data.items.forEach(item=>{
        let vid=item.id.videoId,title=t.escapeHTML(item.snippet.title),thumb=item.snippet.thumbnails.default.url;
        html+=`
<div class="zajel-inbox-item yt-result-item" onclick="window.LaylZajel.selectYtVideo('${vid}', '${title.replace(/'/g,"\\'")}')" style="display:flex; gap:10px; align-items:center; padding: 8px;">
<img src="${thumb}" style="width: 60px; border-radius: 5px;">
<div style="color: #f8fafc; font-size: 12px; line-height: 1.4; text-align: right; flex:1;">${title}</div>
</div>`
      });
      resEl.innerHTML=html
    }catch{resEl.innerHTML='<div style="color: #ef4444; text-align:center; padding:10px;">حدث خطأ في الاتصال!</div>'}
  },
  setupSendForm(){
    l.refreshUsersList();
    if(window.LaylZajel){window.LaylZajel.selectedUsername=null;window.LaylZajel.selectedDisplayName=null}
    document.getElementById("zajel-search-input").addEventListener("input",function(){
      let q=this.value.toLowerCase().trim();
      document.querySelectorAll(".zajel-user-item").forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q)?"block":"none"})
    });
    document.getElementById("zajel-users-list").addEventListener("click",function(ev){
      let el=ev.target.closest(".zajel-user-item");
      el&&(document.querySelectorAll(".zajel-user-item").forEach(x=>x.classList.remove("selected")),el.classList.add("selected"),window.LaylZajel&&(window.LaylZajel.selectedUsername=el.getAttribute("data-username"),window.LaylZajel.selectedDisplayName=el.textContent.trim()))
    });
    document.getElementById("zajel-yt-search-input").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),window.LaylZajel.performSearch("send"))});
    document.getElementById("zajel-self-yt-search-input").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),window.LaylZajel.performSearch("self"))});
    document.getElementById("btn-submit-zajel").addEventListener("click",()=>{
      let vid=document.getElementById("zajel-selected-video-id")?.value;
      let msg=document.querySelector("#layl-zajel-modal .zajel-msg-field")?.value.trim()||"";
      let u=window.LaylZajel?window.LaylZajel.selectedUsername:null;
      let dn=window.LaylZajel?window.LaylZajel.selectedDisplayName:null;
      if(!u)return alert("الرجاء اختيار العضو أولاً.");
      if(!vid)return alert("الرجاء البحث عن أغنية واختيارها من النتائج.");
      l.sendZajel(u,dn,vid,`https://www.youtube.com/watch?v=${vid}`,msg)
    });
    document.getElementById("btn-play-self-zajel").addEventListener("click",()=>{
      let vid=document.getElementById("zajel-self-selected-video-id")?.value;
      if(!vid)return alert("الرجاء البحث عن أغنية واختيارها من النتائج أولاً.");
      l.playSelfZajel(vid)
    })
  },
  sendZajel(u,dn,vid,ytLink,msg){
    if(!e.db)return alert("غير متصل بقاعدة البيانات!");
    if(!t.isAdmin()&&!1===e.settings.enabled)return alert(e.settings.disabledMsg||"زاجل الموسيقى متوقف مؤقتاً من الإدارة.");
    if(t.isCurrentlyBanned())return alert(t.getBanAlertText());
    let maxLen=Number(e.settings.maxMsgLength)||60;
    if(msg.length>maxLen)return alert(`الحد الأقصى للرسالة هو ${maxLen} حرفاً.`);
    if(t.hasBadWords(msg))return alert("تحتوي رسالتك على كلمات غير مسموح بها.");
    let cd=Number(e.settings.cooldown)||0;
    if(!t.isAdmin()&&cd>0){
      let diff=Math.floor((Date.now()-e.lastSendTime)/1e3);
      if(diff<cd)return alert(`يرجى الانتظار ${cd-diff} ثانية قبل إرسال زاجل جديد.`)
    }
    let btn=document.getElementById("btn-submit-zajel");
    let resetBtn=()=>{btn&&(btn.innerHTML='إرسال الزاجل <i class="fas fa-paper-plane ms-1"></i>',btn.disabled=!1)};
    btn&&(btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التحقق...',btn.disabled=!0);
    let c=t.sanitizeName(u),m=t.sanitizeName(e.myUsername)||"مجهول",today=t.getTodayKey(),dLimit=Number(e.settings.dailyLimit)||0;
    let checks=[e.db.ref(`${e.dbPath}/blocks/${c}/${m}`).once("value")];
    if(!t.isAdmin()&&dLimit>0&&"مجهول"!==m){
      checks.push(e.db.ref(`${e.dbPath}/daily_counts/${today}/${m}`).once("value"))
    }
    Promise.all(checks).then(([blockSnap,dailySnap])=>{
      if(blockSnap.val()){
        alert("هذا العضو قام بحظرك من إرسال الزاجل له 🚫");
        resetBtn();
        return
      }
      let usedToday=dailySnap?Number(dailySnap.val()||0):0;
      if(!t.isAdmin()&&dLimit>0&&usedToday>=dLimit){
        alert(`وصلت للحد اليومي المسموح به (${dLimit} زاجل يومياً). حاول مرة أخرى غداً.`);
        resetBtn();
        return
      }
      btn&&(btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...');
      let ref=e.db.ref(e.dbPath),key=ref.child("inbox").push().key,f=msg&&""!==msg?msg:"بدون_رسالة";
      let isRev=!0===e.settings.revealMode;
      let inboxPayload={
        type:"zajel",
        sender:m,
        receiverName:dn||c,
        videoId:vid,
        message:f,
        customMessage:f,
        isRead:!1,
        timestamp:firebase.database.ServerValue.TIMESTAMP
      };
      if(isRev){
        inboxPayload.revealed=!0;
        inboxPayload.senderDisplayName=e.myDisplayName||e.myUsername||m
      }
      let y={};
      y[`inbox/${c}/${key}`]=inboxPayload;
      y[`logs/${key}`]={type:"zajel",sender:m,receiver:c,videoId:vid,message:f,customMessage:f,youtubeLink:ytLink,revealed:isRev,timestamp:firebase.database.ServerValue.TIMESTAMP};
      if(!t.isAdmin()&&dLimit>0&&"مجهول"!==m){
        y[`daily_counts/${today}/${m}`]=usedToday+1
      }
      ref.update(y).then(()=>{
        e.lastSendTime=Date.now();
        localStorage.setItem("zajel_last_send",String(e.lastSendTime));
        a.showToast(isRev?"🎭 طار زاجل الصراحة بنجاح!":"🕊️ طار الزاجل وسيتم إشعارك عند تشغيله!");
        l.clearInputs();
        l.closeModal();
        resetBtn()
      }).catch(()=>{resetBtn();alert("حدث خطأ أثناء الإرسال.")})
    }).catch(()=>{resetBtn();alert("حدث خطأ أثناء التحقق من الصلاحيات.")})
  },
  sendReply(zajelId){
    let i=e.inbox[zajelId];
    if(!i||!e.db)return;
    if(!t.isAdmin()&&!1===e.settings.enabled)return alert(e.settings.disabledMsg||"زاجل الموسيقى متوقف مؤقتاً.");
    if(!1===e.settings.allowReplies)return alert("ميزة الردود متوقفة حالياً من الإدارة.");
    if(t.isCurrentlyBanned())return alert(t.getBanAlertText());
    if(i.repliedText)return;
    let inp=document.getElementById("zajel-reply-input"),btn=document.getElementById("btn-zajel-send-reply");
    let txt=inp?inp.value.trim():"";
    if(!txt)return alert("اكتب ردّك أولاً.");
    if(txt.length>100)return alert("الرد طويل جداً (الحد الأقصى 100 حرف).");
    if(t.hasBadWords(txt))return alert("يحتوي الرد على كلمات غير مسموح بها.");
    let myS=t.sanitizeName(e.myUsername)||"مجهول",myDisplay=i.receiverName||e.myDisplayName||e.myUsername||"عضو";
    btn&&(btn.disabled=!0,btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>');
    e.db.ref(`${e.dbPath}/blocks/${i.sender}/${myS}`).once("value").then(snap=>{
      if(snap.val()){
        alert("لا يمكنك الرد لأن هذا العضو قام بحظرك 🚫");
        btn&&(btn.disabled=!1,btn.innerHTML='رد <i class="fas fa-reply"></i>');
        return
      }
      let ref=e.db.ref(e.dbPath),replyKey=ref.child("inbox").push().key;
      let origMsg=i.customMessage||i.message||"";
      origMsg="بدون_رسالة"===origMsg?"":origMsg;
      let updates={};
      updates[`inbox/${i.sender}/${replyKey}`]={
        type:"reply",
        sender:myS,
        senderName:myDisplay,
        message:txt,
        originalMsg:origMsg,
        videoId:i.videoId||"",
        isRead:!1,
        timestamp:firebase.database.ServerValue.TIMESTAMP
      };
      updates[`inbox/${myS}/${zajelId}/repliedText`]=txt;
      updates[`logs/${replyKey}`]={
        type:"reply",
        sender:myS,
        receiver:i.sender,
        message:txt,
        videoId:i.videoId||"",
        timestamp:firebase.database.ServerValue.TIMESTAMP
      };
      ref.update(updates).then(()=>{
        a.showToast("💬 تم إرسال ردك بنجاح!");
        let wrap=document.getElementById("zajel-reply-wrapper");
        if(wrap)wrap.innerHTML=`<div class="zajel-reply-done"><i class="fas fa-check-circle"></i> تم إرسال ردك: "${t.escapeHTML(txt)}"</div>`
      }).catch(()=>{
        btn&&(btn.disabled=!1,btn.innerHTML='رد <i class="fas fa-reply"></i>');
        alert("حدث خطأ أثناء إرسال الرد.")
      })
    }).catch(()=>{
      btn&&(btn.disabled=!1,btn.innerHTML='رد <i class="fas fa-reply"></i>');
      alert("حدث خطأ في الاتصال.")
    })
  },
  renderInboxList(){
    let n=document.getElementById("zajel-inbox-list");
    if(!n)return;
    let items=Object.entries(e.inbox||{}).sort((x,y)=>(y[1].timestamp||0)-(x[1].timestamp||0));
    if(0===items.length){
      n.innerHTML=`<div style="text-align:center; padding:30px 10px; color:#64748b;"><i class="fas fa-box-open" style="font-size:30px; margin-bottom:10px; opacity:0.5;"></i><br>صندوق الوارد فارغ</div>`;
      return
    }
    let html="";
    items.forEach(([id,item])=>{
      let isRead=!0===item.isRead,isReply="reply"===item.type,isBroadcast="broadcast"===item.type;
      let bgClass=isRead?"read":"unread",fontW=isRead?"normal":"bold",colorT=isRead?"#94a3b8":"#f8fafc";
      let unreadDot=isRead?"":'<div class="zajel-unread-dot"></div>';
      if(isBroadcast){
        let title=t.escapeHTML(item.senderName||"إدارة الشات");
        let preview=t.escapeHTML((item.message||"").slice(0,32))+(item.message&&item.message.length>32?"...":"");
        html+=`
<div class="zajel-inbox-item ${bgClass}" style="border-color:rgba(245,158,11,0.45);" onclick="window.LaylZajel.playZajel('${id}')">
${unreadDot}
<div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
<div style="background:linear-gradient(135deg, rgba(212,175,55,0.28), rgba(245,158,11,0.18)); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fbbf24; flex-shrink:0;">
<i class="fas fa-bullhorn"></i>
</div>
<div style="min-width:0; flex:1;">
<div style="color:#fbbf24; font-weight:bold; font-size:13.5px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">👑 ${title}</div>
<div style="color:#cbd5e1; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${preview||"إهداء إداري"} • ${t.timeAgo(item.timestamp)}</div>
</div>
</div>
<i class="fas fa-crown" style="color:#fbbf24; font-size:17px; opacity:${isRead?"0.6":"1"}; margin-right:6px;"></i>
</div>`
      }else if(isReply){
        let sName=t.escapeHTML(item.senderName||"عضو");
        let preview=t.escapeHTML((item.message||"").slice(0,32))+(item.message&&item.message.length>32?"...":"");
        html+=`
<div class="zajel-inbox-item ${bgClass}" onclick="window.LaylZajel.playZajel('${id}')">
${unreadDot}
<div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
<div style="background:rgba(16,185,129,0.14); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#10b981; flex-shrink:0;">
<i class="fas fa-reply"></i>
</div>
<div style="min-width:0; flex:1;">
<div style="color:${colorT}; font-weight:${fontW}; font-size:13.5px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">رد من (${sName})</div>
<div style="color:#94a3b8; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">"${preview}" • ${t.timeAgo(item.timestamp)}</div>
</div>
</div>
<i class="fas fa-comment-dots" style="color:#10b981; font-size:18px; opacity:${isRead?"0.6":"1"}; margin-right:6px;"></i>
</div>`
      }else{
        let iconClass=isRead?"fa-envelope-open-text":"fa-envelope";
        let isRev=!0===item.revealed&&item.senderDisplayName;
        let label=isRev?`🎭 زاجل من (${t.escapeHTML(item.senderDisplayName)})`:"زاجل من مجهول";
        html+=`
<div class="zajel-inbox-item ${bgClass}" onclick="window.LaylZajel.playZajel('${id}')">
${unreadDot}
<div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
<div style="background:${isRev?"rgba(168,85,247,0.16)":"rgba(212,175,55,0.1)"}; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:${isRev?"#c084fc":"#D4AF37"}; flex-shrink:0;">
<i class="fas ${iconClass}"></i>
</div>
<div style="min-width:0; flex:1;">
<div style="color:${colorT}; font-weight:${fontW}; font-size:14px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${label}</div>
<div style="color:#94a3b8; font-size:11px;">${t.timeAgo(item.timestamp)}${item.repliedText?' • <span style="color:#34d399;">تم الرد ✓</span>':""}</div>
</div>
</div>
<i class="fas fa-play-circle" style="color:#10b981; font-size:20px; opacity:${isRead?"0.6":"1"};"></i>
</div>`
      }
    });
    n.innerHTML=html
  },
  playZajel(n){
    let i=e.inbox[n];
    if(!i)return;
    let myS=t.sanitizeName(e.myUsername);
    if(e.db&&!i.isRead){e.db.ref(`${e.dbPath}/inbox/${myS}/${n}/isRead`).set(!0)}
    let backBtn=document.getElementById("btn-player-back");
    backBtn.innerHTML='<i class="fas fa-arrow-right"></i> رجوع';
    backBtn.onclick=()=>l.switchTab("inbox");
    let delBtn=document.getElementById("btn-zajel-delete");
    delBtn.style.display="block";
    delBtn.onclick=()=>{
      l.notifyClose();
      if(e.db){e.db.ref(`${e.dbPath}/inbox/${myS}/${n}`).remove().then(()=>{a.showToast("تم الحذف.");l.switchTab("inbox")})}
    };
    let bBtn=document.getElementById("btn-zajel-block");
    if(bBtn){
      if("broadcast"!==i.type&&i.sender&&"مجهول"!==i.sender){
        bBtn.style.display="block";
        bBtn.onclick=()=>{
          if(confirm("هل تريد تأكيد حظر هذا الشخص من إرسال الزاجل لك مستقبلاً؟")){
            e.db&&e.db.ref(`${e.dbPath}/blocks/${myS}/${i.sender}`).set(Date.now()).then(()=>{a.showToast("🚫 تم حظر المرسل ولن تصلك رسائله مجدداً");l.switchTab("inbox")})
          }
        }
      }else{bBtn.style.display="none"}
    }

    if("broadcast"===i.type){
      let title=t.escapeHTML(i.senderName||"إدارة الشات");
      let msg=i.message&&"بدون_رسالة"!==i.message?`<div class="zajel-msg-content" style="margin-top:14px;">${t.escapeHTML(i.message)}</div>`:"";
      let playerBox=i.videoId?'<div class="zajel-iframe-container"><div id="zajel-yt-player-div"></div></div>':"";
      document.getElementById("zajel-player-content").innerHTML=`
<div class="zajel-header" style="margin-bottom:5px;"><div class="zajel-icon">👑</div></div>
<div class="zajel-receiver-text">
<div class="zajel-anonymous-badge" style="border-color:#fbbf24; color:#fbbf24; background:rgba(245,158,11,0.16);"><i class="fas fa-bullhorn"></i> ${title}</div>
<div style="font-size:13.5px; color:#cbd5e1;">إهداء إداري خاص لجميع الأعضاء 🎶</div>
</div>
${playerBox}
${msg?`<div style="text-align:center;">${msg}</div>`:""}`;
      l.switchTab("player");
      if(i.videoId){
        if(window.LaylZajel&&window.LaylZajel.ytPlayer&&"function"==typeof window.LaylZajel.ytPlayer.destroy){window.LaylZajel.ytPlayer.destroy()}
        let iv=setInterval(()=>{if(window.YT&&window.YT.Player){clearInterval(iv);window.LaylZajel.ytPlayer=new window.YT.Player("zajel-yt-player-div",{videoId:i.videoId,playerVars:{autoplay:1}})}},300)
      }
      return
    }

    if("reply"===i.type){
      let sName=t.escapeHTML(i.senderName||"عضو"),msg=t.escapeHTML(i.message||"");
      let origHtml=i.originalMsg?`<div style="font-size:11.5px; color:#94a3b8; margin-top:10px;">إهداؤك السابق: "${t.escapeHTML(i.originalMsg)}"</div>`:"";
      let playOrigBtn=i.videoId?`<button type="button" id="btn-play-reply-orig" class="zajel-btn-dark" style="margin-top:12px; font-size:12px; padding:8px;"><i class="fas fa-play" style="color:#D4AF37;"></i> تشغيل مقطع الزاجل الأصلي</button><div id="zajel-reply-orig-player"></div>`:"";
      document.getElementById("zajel-player-content").innerHTML=`
<div class="zajel-header" style="margin-bottom:5px;"><div class="zajel-icon">💬</div></div>
<div class="zajel-receiver-text">
<div class="zajel-anonymous-badge" style="border-color:#10b981; color:#34d399; background:rgba(16,185,129,0.12);"><i class="fas fa-reply"></i> رد على زاجلك</div>
<div style="font-size:14px; color:#cbd5e1;">من: <b style="color:#D4AF37;">${sName}</b></div>
<div class="zajel-msg-content" style="margin-top:12px;">${msg}</div>
${origHtml}
${playOrigBtn}
</div>`;
      l.switchTab("player");
      let po=document.getElementById("btn-play-reply-orig");
      if(po){
        po.onclick=()=>{
          po.style.display="none";
          document.getElementById("zajel-reply-orig-player").innerHTML='<div class="zajel-iframe-container"><div id="zajel-yt-player-div"></div></div>';
          let iv=setInterval(()=>{if(window.YT&&window.YT.Player){clearInterval(iv);window.LaylZajel.ytPlayer=new window.YT.Player("zajel-yt-player-div",{videoId:i.videoId,playerVars:{autoplay:1}})}},300)
        }
      }
      return
    }

    if(!e.localZajelState)e.localZajelState={};
    if(!e.localZajelState[n])e.localZajelState[n]={};
    e.currentPlayingId=n;e.currentPlayingSender=i.sender;e.currentPlayingReceiverName=i.receiverName||e.myUsername;
    if(!e.localZajelState[n].opened&&i.sender&&"مجهول"!==i.sender&&e.db){e.localZajelState[n].opened=!0}
    let r=i.customMessage||i.messageText||i.zajelMsg||i.message||"",o="";
    if(r&&"string"==typeof r&&"بدون_رسالة"!==r&&""!==r.trim()){o=`<div class="zajel-msg-content" style="margin-top: 15px;">${t.escapeHTML(r.trim())}</div>`}
    let isRev=!0===i.revealed&&i.senderDisplayName;
    let badgeHtml=isRev
      ?`<div class="zajel-anonymous-badge" style="border-color:#c084fc; color:#e9d5ff; background:rgba(168,85,247,0.18);">🎭 يوم الصراحة • من: ${t.escapeHTML(i.senderDisplayName)}</div>`
      :`<div class="zajel-anonymous-badge"><i class="fas fa-mask"></i> زاجل من مجهول</div>`;
    let replyHtml="";
    if(i.sender&&"مجهول"!==i.sender&&!1!==e.settings.allowReplies){
      replyHtml=i.repliedText
        ?`<div id="zajel-reply-wrapper"><div class="zajel-reply-done"><i class="fas fa-check-circle"></i> تم إرسال ردك: "${t.escapeHTML(i.repliedText)}"</div></div>`
        :`<div id="zajel-reply-wrapper" class="zajel-reply-box">
<div style="font-size:11.5px; color:#94a3b8; margin-bottom:6px; text-align:right;"><i class="fas fa-reply" style="color:#D4AF37;"></i> أرسل رداً قصيراً للمرسل:</div>
<div class="zajel-reply-row">
<input type="text" id="zajel-reply-input" class="zajel-input" style="padding:8px 12px; font-size:12.5px;" placeholder="اكتب ردك هنا..." maxlength="100" autocomplete="off">
<button type="button" id="btn-zajel-send-reply" class="zajel-reply-btn">رد <i class="fas fa-reply"></i></button>
</div>
</div>`
    }
    document.getElementById("zajel-player-content").innerHTML=`
<div class="zajel-header" style="margin-bottom:5px;"><div class="zajel-icon">${isRev?"🎭":"💌"}</div></div>
<div class="zajel-receiver-text">
${badgeHtml}<br>
<div style="font-size:14px; color:#94a3b8; margin-top:5px; line-height:1.6;">${isRev?`أهدى لك <b>${t.escapeHTML(i.senderDisplayName)}</b> هذه المقطوعة 🎶`:"شخص ما أهدى لك هذه المقطوعة 🎶"}<br>يمكنك الاستماع أو التصغير</div>
</div>
<div class="zajel-iframe-container"><div id="zajel-yt-player-div"></div></div>
${o?`<div style="text-align: center;">${o}</div>`:""}
${replyHtml}`;
    let sBtn=document.getElementById("btn-zajel-send-reply"),rInp=document.getElementById("zajel-reply-input");
    sBtn&&(sBtn.onclick=()=>l.sendReply(n));
    rInp&&(rInp.addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),l.sendReply(n))}));
    l.switchTab("player");
    if(window.LaylZajel&&window.LaylZajel.ytPlayer&&"function"==typeof window.LaylZajel.ytPlayer.destroy){window.LaylZajel.ytPlayer.destroy()}
    let u=setInterval(()=>{
      if(window.YT&&window.YT.Player){
        clearInterval(u);
        window.LaylZajel.ytPlayer=new window.YT.Player("zajel-yt-player-div",{
          videoId:i.videoId,
          playerVars:{autoplay:1},
          events:{
            onStateChange:ev=>{
              let st=ev.data,id=e.currentPlayingId,snd=e.currentPlayingSender,rec=e.currentPlayingReceiverName;
              if(id&&snd&&"مجهول"!==snd&&e.db&&1===st&&!e.localZajelState[id].hasPlayed){
                e.localZajelState[id].hasPlayed=!0;
                e.db.ref(`${e.dbPath}/notifications/${snd}`).push({type:"playing",receiverName:rec,timestamp:Date.now()})
              }
            }
          }
        })
      }
    },300)
  },
  playSelfZajel(vid){
    document.getElementById("zajel-player-content").innerHTML=`
<div class="zajel-header" style="margin-bottom:5px;"><div class="zajel-icon">🎧</div></div>
<div class="zajel-receiver-text">
<div class="zajel-anonymous-badge" style="border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.1);"><i class="fas fa-music"></i> أهديت نفسك</div><br>
<div style="font-size:14px; color:#94a3b8; margin-top:5px; line-height:1.6;">استماع ممتع 🎶<br>يمكنك الاستماع أو التصغير</div>
</div>
<div class="zajel-iframe-container"><div id="zajel-yt-player-div"></div></div>`;
    let backBtn=document.getElementById("btn-player-back");
    backBtn.innerHTML='<i class="fas fa-arrow-right"></i> رجوع';
    backBtn.onclick=()=>l.switchTab("self");
    document.getElementById("btn-zajel-delete").style.display="none";
    let bBtn=document.getElementById("btn-zajel-block");
    bBtn&&(bBtn.style.display="none");
    l.switchTab("player");
    if(window.LaylZajel&&window.LaylZajel.ytPlayer&&"function"==typeof window.LaylZajel.ytPlayer.destroy){window.LaylZajel.ytPlayer.destroy()}
    let r=setInterval(()=>{if(window.YT&&window.YT.Player){clearInterval(r);window.LaylZajel.ytPlayer=new window.YT.Player("zajel-yt-player-div",{videoId:vid,playerVars:{autoplay:1}})}},300)
  },
  updateBadges(){
    let count=Object.values(e.inbox||{}).filter(m=>!m.isRead).length;
    let sb=document.getElementById("zajel-sidebar-badge");
    sb&&(sb.innerText=count,sb.style.display=count>0?"inline-block":"none");
    let mb=document.getElementById("zajel-modal-badge");
    mb&&(mb.innerText=count,mb.style.display=count>0?"inline-block":"none")
  },
  bindUserListeners(){
    if(!e.db)return;
    let myS=t.sanitizeName(e.myUsername);
    if(!myS||e.listenedUser===myS)return;
    if(e.listenedUser){
      e.db.ref(`${e.dbPath}/inbox/${e.listenedUser}`).off();
      e.db.ref(`${e.dbPath}/notifications/${e.listenedUser}`).off();
      e.db.ref(`${e.dbPath}/banned/${e.listenedUser}`).off()
    }
    e.listenedUser=myS;
    e.initialLoadDone=!1;
    e.inbox={};
    e.db.ref(`${e.dbPath}/inbox/${myS}`).on("value",snap=>{
      let val=snap.val()||{},oldKeys=Object.keys(e.inbox||{}),newKeys=Object.keys(val);
      e.inbox=val;
      l.updateBadges();
      l.renderInboxList();
      let added=newKeys.filter(k=>!oldKeys.includes(k));
      if(added.length>0&&e.initialLoadDone){
        let last=val[added[added.length-1]];
        if(last&&"broadcast"===last.type)a.showToast("👑 وصلك إهداء إداري في زاجل الموسيقى!");
        else if(last&&"reply"===last.type)a.showToast("💬 وصلك رد جديد على زاجلك! تفقد رسائلك");
        else a.showToast("💌 وصلك زاجل جديد! تفقد صندوق رسائلك")
      }
      e.initialLoadDone=!0
    });
    e.db.ref(`${e.dbPath}/notifications/${myS}`).on("child_added",snap=>{
      let v=snap.val();
      if(!v)return;
      if("playing"===v.type)a.showToast(`▶️ (${t.escapeHTML(v.receiverName||"الطرف الآخر")}) قام بتشغيل المقطع`);
      snap.ref.remove().catch(()=>{})
    });
    e.db.ref(`${e.dbPath}/banned/${myS}`).on("value",snap=>{
      let v=snap.val();
      e.banData=v&&"object"==typeof v?v:v?{reason:"",expiresAt:null}:null
    });
    a.injectAdminButton()
  },
  bindGlobalListeners(){
    if(!e.db||e.isListeningGlobal)return;
    e.isListeningGlobal=!0;
    e.db.ref("admins").on("value",snap=>{
      let v=snap.val()||{};
      e.adminUsers=Object.keys(v);
      a.injectAdminButton()
    });
    e.db.ref(`${e.dbPath}/settings`).on("value",snap=>{
      let v=snap.val();
      if(v&&"object"==typeof v){
        e.settings=Object.assign({},e.settings,v);
        l.applySettingsToUI()
      }
    })
  }
};

let admin={
  open(){
    if(!t.isAdmin())return alert("هذه اللوحة متاحة للإدارة فقط.");
    let ov=document.getElementById("zajel-admin-modal");
    ov&&ov.remove();
    ov=document.createElement("div");
    ov.id="zajel-admin-modal";
    ov.className="zajel-modal-overlay";
    ov.innerHTML=`
<div class="zajel-box zajel-admin-box">
<div class="zajel-admin-header">
<div style="display:flex; align-items:center; gap:8px; color:#D4AF37; font-weight:bold; font-size:15px;">
<i class="fas fa-sliders-h"></i> لوحة تحكم الزاجل
</div>
<div style="display:flex; gap:6px;">
<button class="zajel-btn-control" id="zajel-admin-refresh" title="تحديث"><i class="fas fa-sync-alt" style="font-size:12px;"></i></button>
<button class="zajel-btn-control zajel-btn-close" id="zajel-admin-close" title="إغلاق"><i class="fas fa-times"></i></button>
</div>
</div>
<div class="zajel-admin-stats">
<div class="zajel-stat-card"><div class="zajel-stat-val" id="za-stat-status">...</div><div class="zajel-stat-lbl">النظام</div></div>
<div class="zajel-stat-card"><div class="zajel-stat-val" id="za-stat-reveal">...</div><div class="zajel-stat-lbl">الصراحة</div></div>
<div class="zajel-stat-card"><div class="zajel-stat-val" id="za-stat-logs">0</div><div class="zajel-stat-lbl">السجلات</div></div>
<div class="zajel-stat-card"><div class="zajel-stat-val" id="za-stat-banned">0</div><div class="zajel-stat-lbl">المحظورون</div></div>
</div>
<div class="zajel-admin-tabs">
<button class="zajel-tab-btn active" data-atab="logs"><i class="fas fa-history"></i> السجل</button>
<button class="zajel-tab-btn" data-atab="banned"><i class="fas fa-user-slash"></i> الحظر</button>
<button class="zajel-tab-btn" data-atab="broadcast"><i class="fas fa-bullhorn"></i> بث</button>
<button class="zajel-tab-btn" data-atab="stats"><i class="fas fa-trophy"></i> توب</button>
<button class="zajel-tab-btn" data-atab="settings"><i class="fas fa-cog"></i> إعدادات</button>
</div>
<div class="zajel-views-container">
<div id="za-view-logs" class="zajel-view active">
<div style="display:flex; gap:6px; margin-bottom:10px;">
<input type="text" id="za-log-search" class="zajel-input" style="padding:8px 10px; font-size:12.5px;" placeholder="🔍 ابحث بالمرسل، المستلم، أو النص..." autocomplete="off">
<select id="za-log-filter" class="zajel-input" style="width:92px; padding:8px 5px; font-size:11.5px;">
<option value="all">الكل</option>
<option value="zajel">زاجل</option>
<option value="reply">ردود</option>
<option value="broadcast">بث إداري</option>
</select>
</div>
<div id="za-logs-list"></div>
</div>
<div id="za-view-banned" class="zajel-view">
<div class="zajel-subtabs">
<button type="button" class="zajel-subtab active" data-bsub="global"><i class="fas fa-ban"></i> الحظر العام</button>
<button type="button" class="zajel-subtab" data-bsub="personal"><i class="fas fa-user-secret"></i> كشف الحظر الشخصي</button>
</div>
<div id="za-bsub-global">
<div class="zajel-admin-card" style="margin-bottom:12px;">
<div style="font-size:12px; color:#D4AF37; font-weight:bold; margin-bottom:8px;">حظر عضو من استخدام الزاجل (مؤقت أو دائم)</div>
<div style="display:flex; flex-direction:column; gap:6px;">
<div style="display:flex; gap:6px;">
<input type="text" id="za-ban-user" class="zajel-input" style="padding:8px 10px; font-size:12.5px; flex:1;" placeholder="اسم المستخدم (Username)" autocomplete="off">
<select id="za-ban-duration" class="zajel-input" style="width:110px; padding:8px 6px; font-size:12px;">
<option value="permanent">دائم</option>
<option value="1h">ساعة</option>
<option value="6h">6 ساعات</option>
<option value="24h">24 ساعة</option>
<option value="3d">3 أيام</option>
<option value="7d">أسبوع</option>
</select>
</div>
<input type="text" id="za-ban-reason" class="zajel-input" style="padding:8px 10px; font-size:12.5px;" placeholder="السبب (اختياري)" autocomplete="off">
<button type="button" id="za-btn-add-ban" class="zajel-btn-danger" style="padding:8px; font-size:12.5px;"><i class="fas fa-ban"></i> تنفيذ الحظر</button>
</div>
</div>
<div id="za-banned-list"></div>
</div>
<div id="za-bsub-personal" style="display:none;">
<div style="display:flex; gap:6px; margin-bottom:8px;">
<input type="text" id="za-blocks-search" class="zajel-input" style="padding:8px 10px; font-size:12px;" placeholder="🔍 ابحث باسم الحاضر أو المحظور..." autocomplete="off">
<button type="button" id="za-btn-reload-blocks" class="zajel-btn-dark" style="width:auto; padding:8px 12px; font-size:12px;"><i class="fas fa-sync-alt"></i></button>
</div>
<div id="za-personal-blocks-list"></div>
</div>
</div>
<div id="za-view-broadcast" class="zajel-view">
<div class="zajel-admin-card">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
<div style="color:#fbbf24; font-weight:bold; font-size:13px;"><i class="fas fa-crown"></i> إرسال زاجل إداري جماعي</div>
<span id="za-bc-online-count" class="zajel-tag zajel-tag-broadcast">0 متواجد</span>
</div>
<div class="zajel-input-group" style="margin-bottom:8px;">
<label class="zajel-label" style="font-size:11.5px;">اسم المرسل الظاهر:</label>
<input type="text" id="za-bc-title" class="zajel-input" style="padding:8px 10px; font-size:12.5px;" value="إدارة شات ليل">
</div>
<div class="zajel-input-group" style="margin-bottom:8px;">
<label class="zajel-label" style="font-size:11.5px;">مقطع يوتيوب (اختياري — رابط مباشر أو بحث):</label>
<div style="display:flex; gap:6px;">
<input type="text" id="za-bc-yt" class="zajel-input" style="padding:8px 10px; font-size:12.5px;" placeholder="الصق رابط يوتيوب أو اكتب اسم أغنية..." autocomplete="off">
<button type="button" id="za-bc-yt-search-btn" class="zajel-btn-dark" style="width:auto; padding:8px 12px; font-size:12px;" title="بحث يوتيوب"><i class="fas fa-search"></i></button>
</div>
<input type="hidden" id="za-bc-vid">
<div id="za-bc-yt-results" style="max-height:150px; overflow-y:auto; margin-top:6px;"></div>
</div>
<div class="zajel-input-group" style="margin-bottom:10px;">
<label class="zajel-label" style="font-size:11.5px;">الرسالة / التهنئة:</label>
<textarea id="za-bc-msg" class="zajel-input" rows="2" maxlength="160" style="padding:8px 10px; font-size:12.5px; resize:none;" placeholder="اكتب رسالة البث الجماعي..."></textarea>
</div>
<label style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#cbd5e1; margin-bottom:10px; cursor:pointer;">
<input type="checkbox" id="za-bc-include-self" checked> إرسال نسخة لصندوقي أيضاً للمعاينة
</label>
<button type="button" id="za-btn-send-bc" class="zajel-btn-send" style="padding:10px; font-size:13px; margin-top:0;"><i class="fas fa-bullhorn"></i> إرسال لجميع المتواجدين الآن</button>
</div>
</div>
<div id="za-view-stats" class="zajel-view">
<div id="za-top-stats-body"></div>
</div>
<div id="za-view-settings" class="zajel-view">
<div class="zajel-setting-row">
<div><div style="color:#f8fafc; font-size:12.5px; font-weight:bold;">تفعيل نظام الزاجل</div><div style="color:#94a3b8; font-size:10.5px;">إيقافه يمنع الأعضاء من الإرسال والرد</div></div>
<label class="zajel-switch"><input type="checkbox" id="za-set-enabled"><span class="zajel-slider"></span></label>
</div>
<div class="zajel-setting-row">
<div><div style="color:#f8fafc; font-size:12.5px; font-weight:bold;">تفعيل ميزة الردود القصيرة</div><div style="color:#94a3b8; font-size:10.5px;">السماح للمستلم بالرد على الزاجل</div></div>
<label class="zajel-switch"><input type="checkbox" id="za-set-replies"><span class="zajel-slider"></span></label>
</div>
<div class="zajel-setting-row" style="border-color:rgba(192,132,252,0.3);">
<div><div style="color:#e9d5ff; font-size:12.5px; font-weight:bold;">🎭 وضع «يوم الصراحة»</div><div style="color:#94a3b8; font-size:10.5px;">يكشف اسم المرسل في الرسائل الجديدة أثناء التفعيل</div></div>
<label class="zajel-switch"><input type="checkbox" id="za-set-reveal"><span class="zajel-slider"></span></label>
</div>
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:8px;">
<div>
<label class="zajel-label" style="font-size:11px;">السقف اليومي</label>
<input type="number" id="za-set-daily" class="zajel-input" style="padding:7px; font-size:12.5px;" min="0" max="500" placeholder="0 = مفتوح">
</div>
<div>
<label class="zajel-label" style="font-size:11px;">طول الرسالة</label>
<input type="number" id="za-set-maxlen" class="zajel-input" style="padding:7px; font-size:12.5px;" min="20" max="200">
</div>
<div>
<label class="zajel-label" style="font-size:11px;">انتظار (ثانية)</label>
<input type="number" id="za-set-cooldown" class="zajel-input" style="padding:7px; font-size:12.5px;" min="0" max="3600">
</div>
</div>
<div style="font-size:10.5px; color:#94a3b8; margin:-4px 0 8px;">* اجعل السقف اليومي أو الانتظار <b>0</b> لجعله مفتوحاً بدون حد.</div>
<div class="zajel-input-group" style="margin-bottom:8px;">
<label class="zajel-label" style="font-size:11.5px;">رسالة التوقف للصيانة</label>
<input type="text" id="za-set-disabledmsg" class="zajel-input" style="padding:8px 10px; font-size:12px;">
</div>
<div class="zajel-input-group" style="margin-bottom:10px;">
<label class="zajel-label" style="font-size:11.5px;">فلتر الكلمات الممنوعة (افصل بينها بفاصلة ,)</label>
<textarea id="za-set-badwords" class="zajel-input" rows="2" style="padding:8px 10px; font-size:12px; resize:none;" placeholder="كلمة1, كلمة2, ..."></textarea>
</div>
<button type="button" id="za-btn-save-settings" class="zajel-btn-send" style="padding:10px; font-size:13px; margin-top:0; margin-bottom:14px;"><i class="fas fa-save"></i> حفظ الإعدادات</button>
<div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
<div style="color:#94a3b8; font-size:12px; font-weight:bold; margin-bottom:8px;"><i class="fas fa-broom"></i> أدوات الصيانة والتنظيف</div>
<div style="display:flex; flex-direction:column; gap:6px;">
<button type="button" id="za-btn-clean-old" class="zajel-btn-dark" style="padding:8px; font-size:12px;">تنظيف السجلات الأقدم من 7 أيام</button>
<button type="button" id="za-btn-clean-daily" class="zajel-btn-dark" style="padding:8px; font-size:12px;">تنظيف عدادات السقف اليومي القديمة</button>
<button type="button" id="za-btn-clean-notifs" class="zajel-btn-dark" style="padding:8px; font-size:12px;">مسح إشعارات التشغيل العالقة</button>
<button type="button" id="za-btn-clear-logs" class="zajel-btn-danger" style="padding:8px; font-size:12px;"><i class="fas fa-trash-alt"></i> مسح جميع السجلات نهائياً</button>
</div>
</div>
</div>
</div>
</div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&admin.close()});
    document.getElementById("zajel-admin-close").onclick=()=>admin.close();
    document.getElementById("zajel-admin-refresh").onclick=()=>{
      admin.loadLogs();
      admin.loadBanned();
      admin.populateSettings();
      admin.updateBroadcastCount();
      a.showToast("🔄 تم تحديث البيانات")
    };
    ov.querySelectorAll("[data-atab]").forEach(btn=>{
      btn.onclick=()=>admin.switchTab(btn.getAttribute("data-atab"))
    });
    ov.querySelectorAll("[data-bsub]").forEach(btn=>{
      btn.onclick=()=>{
        let sub=btn.getAttribute("data-bsub");
        ov.querySelectorAll("[data-bsub]").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("za-bsub-global").style.display="global"===sub?"block":"none";
        document.getElementById("za-bsub-personal").style.display="personal"===sub?"block":"none";
        if("personal"===sub)admin.loadPersonalBlocks()
      }
    });
    document.getElementById("za-log-search").oninput=()=>admin.renderLogs();
    document.getElementById("za-log-filter").onchange=()=>admin.renderLogs();
    document.getElementById("za-blocks-search").oninput=()=>admin.renderPersonalBlocks();
    document.getElementById("za-btn-reload-blocks").onclick=()=>admin.loadPersonalBlocks();
    document.getElementById("za-btn-add-ban").onclick=()=>{
      let u=document.getElementById("za-ban-user").value.trim();
      let r=document.getElementById("za-ban-reason").value.trim();
      let dur=document.getElementById("za-ban-duration").value;
      if(!u)return alert("اكتب اسم المستخدم أولاً.");
      admin.banUser(u,r,dur).then(()=>{
        document.getElementById("za-ban-user").value="";
        document.getElementById("za-ban-reason").value="";
        document.getElementById("za-ban-duration").value="permanent"
      })
    };
    document.getElementById("za-bc-yt-search-btn").onclick=()=>admin.searchBroadcastYt();
    document.getElementById("za-bc-yt").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),admin.searchBroadcastYt())});
    document.getElementById("za-bc-yt").addEventListener("input",function(){
      let vid=t.extractYtId(this.value);
      if(vid)document.getElementById("za-bc-vid").value=vid
    });
    document.getElementById("za-btn-send-bc").onclick=()=>admin.sendBroadcast();
    document.getElementById("za-btn-save-settings").onclick=()=>admin.saveSettings();
    document.getElementById("za-btn-clean-old").onclick=()=>admin.cleanOldLogs(7);
    document.getElementById("za-btn-clean-daily").onclick=()=>admin.cleanOldDailyCounts();
    document.getElementById("za-btn-clean-notifs").onclick=()=>admin.clearNotifs();
    document.getElementById("za-btn-clear-logs").onclick=()=>admin.clearAllLogs();
    requestAnimationFrame(()=>ov.classList.add("active"));
    admin.populateSettings();
    admin.updateBroadcastCount();
    admin.loadLogs();
    admin.loadBanned()
  },
  switchTab(tab){
    let ov=document.getElementById("zajel-admin-modal");
    if(!ov)return;
    ov.querySelectorAll("[data-atab]").forEach(x=>x.classList.toggle("active",x.getAttribute("data-atab")===tab));
    ov.querySelectorAll(".zajel-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`za-view-${tab}`);
    v&&v.classList.add("active");
    if("broadcast"===tab)admin.updateBroadcastCount();
    if("stats"===tab)admin.renderTopStats()
  },
  close(){
    let ov=document.getElementById("zajel-admin-modal");
    ov&&ov.remove()
  },
  updateStats(){
    let st=document.getElementById("za-stat-status");
    if(st){st.textContent=!1===e.settings.enabled?"متوقف":"مفعّل";st.style.color=!1===e.settings.enabled?"#f87171":"#34d399"}
    let rv=document.getElementById("za-stat-reveal");
    if(rv){rv.textContent=!0===e.settings.revealMode?"مفعّل":"مجهول";rv.style.color=!0===e.settings.revealMode?"#c084fc":"#94a3b8"}
    let lg=document.getElementById("za-stat-logs");
    lg&&(lg.textContent=e.adminLogsCache.length);
    let bn=document.getElementById("za-stat-banned");
    if(bn){
      let activeCnt=Object.values(e.adminBannedCache||{}).filter(d=>!d||!d.expiresAt||Date.now()<d.expiresAt).length;
      bn.textContent=activeCnt
    }
  },
  populateSettings(){
    let en=document.getElementById("za-set-enabled");if(!en)return;
    en.checked=!1!==e.settings.enabled;
    document.getElementById("za-set-replies").checked=!1!==e.settings.allowReplies;
    document.getElementById("za-set-reveal").checked=!0===e.settings.revealMode;
    document.getElementById("za-set-daily").value=Number(e.settings.dailyLimit)||0;
    document.getElementById("za-set-maxlen").value=Number(e.settings.maxMsgLength)||60;
    document.getElementById("za-set-cooldown").value=Number(e.settings.cooldown)||0;
    document.getElementById("za-set-disabledmsg").value=e.settings.disabledMsg||"";
    document.getElementById("za-set-badwords").value=e.settings.badWords||"";
    admin.updateStats()
  },
  saveSettings(){
    if(!e.db)return;
    let payload={
      enabled:document.getElementById("za-set-enabled").checked,
      allowReplies:document.getElementById("za-set-replies").checked,
      revealMode:document.getElementById("za-set-reveal").checked,
      dailyLimit:Math.max(0,Number(document.getElementById("za-set-daily").value)||0),
      maxMsgLength:Math.max(20,Math.min(200,Number(document.getElementById("za-set-maxlen").value)||60)),
      cooldown:Math.max(0,Number(document.getElementById("za-set-cooldown").value)||0),
      disabledMsg:document.getElementById("za-set-disabledmsg").value.trim()||"زاجل الموسيقى متوقف مؤقتاً للصيانة.",
      badWords:document.getElementById("za-set-badwords").value.trim()
    };
    e.db.ref(`${e.dbPath}/settings`).set(payload).then(()=>{
      e.settings=payload;
      l.applySettingsToUI();
      admin.updateStats();
      a.showToast("✅ تم حفظ إعدادات الزاجل")
    }).catch(()=>alert("❌ فشل الحفظ: تأكد من صلاحيات Firebase للآدمن."))
  },
  loadLogs(){
    let c=document.getElementById("za-logs-list");
    if(!c||!e.db)return;
    c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:25px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل السجل...</div>';
    e.db.ref(`${e.dbPath}/logs`).limitToLast(200).once("value").then(snap=>{
      let val=snap.val()||{};
      e.adminLogsCache=Object.entries(val).map(([id,d])=>Object.assign({id},d)).sort((x,y)=>(y.timestamp||0)-(x.timestamp||0));
      admin.updateStats();
      admin.renderLogs();
      let stView=document.getElementById("za-view-stats");
      if(stView&&stView.classList.contains("active"))admin.renderTopStats()
    }).catch(()=>{c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">تعذر تحميل السجل.</div>'})
  },
  renderLogs(){
    let c=document.getElementById("za-logs-list");
    if(!c)return;
    let q=(document.getElementById("za-log-search")?.value||"").trim().toLowerCase();
    let f=document.getElementById("za-log-filter")?.value||"all";
    let list=e.adminLogsCache.filter(item=>{
      let tp=item.type||"zajel";
      if("all"!==f&&tp!==f)return!1;
      if(!q)return!0;
      let hay=`${item.sender||""} ${item.receiver||""} ${item.message||item.customMessage||""}`.toLowerCase();
      return hay.includes(q)
    });
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:25px;">لا توجد سجلات مطابقة.</div>';return}
    let html="";
    list.forEach(item=>{
      let tp=item.type||"zajel",isReply="reply"===tp,isBc="broadcast"===tp;
      let tagClass=isBc?"zajel-tag-broadcast":isReply?"zajel-tag-reply":"zajel-tag-zajel";
      let tagText=isBc?"👑 بث إداري":isReply?"💬 رد":item.revealed?"🎭 صراحة":"💌 زاجل";
      let msg=item.customMessage||item.message||"";
      msg="بدون_رسالة"===msg?"<span style='color:#64748b;'>(بدون رسالة)</span>":`"${t.escapeHTML(msg)}"`;
      let ytBtn=item.videoId?`<a href="https://www.youtube.com/watch?v=${encodeURIComponent(item.videoId)}" target="_blank" rel="noopener" class="zajel-mini-btn" style="background:rgba(239,68,68,0.18); color:#fca5a5; text-decoration:none;"><i class="fab fa-youtube"></i> المقطع</a>`:"";
      let recallBtn=!isBc&&item.receiver&&!item.recalled?`<button type="button" class="zajel-mini-btn za-act-recall" data-id="${t.escapeHTML(item.id)}" data-rec="${t.escapeHTML(item.receiver)}" style="background:rgba(239,68,68,0.2); color:#f87171;"><i class="fas fa-undo"></i> سحب من الوارد</button>`:"";
      let recalledTag=item.recalled?'<span class="zajel-tag zajel-tag-recalled">تم السحب</span>':"";
      html+=`
<div class="zajel-admin-card">
<div class="zajel-admin-card-top">
<div style="display:flex; gap:5px; align-items:center;">
<span class="zajel-tag ${tagClass}">${tagText}</span>
${recalledTag}
</div>
<span style="font-size:10.5px; color:#94a3b8;">${t.formatDate(item.timestamp)}</span>
</div>
<div style="font-size:12.5px; color:#e2e8f0; margin-bottom:4px;">
<span style="color:#94a3b8;">من:</span> <b style="color:#D4AF37;">${t.escapeHTML(item.sender||"مجهول")}</b>
<span style="color:#64748b; margin:0 5px;">←</span>
<span style="color:#94a3b8;">إلى:</span> <b style="color:#38bdf8;">${t.escapeHTML(item.receiver||"-")}</b>
</div>
<div style="font-size:12px; color:#cbd5e1; background:rgba(0,0,0,0.2); padding:6px 8px; border-radius:8px; word-break:break-word;">${msg}</div>
<div class="zajel-admin-actions">
${ytBtn}
${recallBtn}
${!isBc&&item.sender&&"مجهول"!==item.sender?`<button type="button" class="zajel-mini-btn za-act-ban" data-user="${t.escapeHTML(item.sender)}" style="background:rgba(245,158,11,0.18); color:#fbbf24;"><i class="fas fa-ban"></i> حظر المرسل</button>`:""}
<button type="button" class="zajel-mini-btn za-act-del" data-id="${t.escapeHTML(item.id)}" style="background:rgba(255,255,255,0.08); color:#cbd5e1;"><i class="fas fa-trash"></i> حذف السجل</button>
</div>
</div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".za-act-recall").forEach(b=>{
      b.onclick=()=>{
        let id=b.getAttribute("data-id"),rec=b.getAttribute("data-rec");
        if(!confirm(`سحب هذه الرسالة وحذفها فوراً من صندوق وارد (${rec})؟`))return;
        let updates={};
        updates[`inbox/${rec}/${id}`]=null;
        updates[`logs/${id}/recalled`]=!0;
        e.db.ref(e.dbPath).update(updates).then(()=>{
          let target=e.adminLogsCache.find(x=>x.id===id);
          if(target)target.recalled=!0;
          admin.renderLogs();
          a.showToast("↩️ تم سحب الرسالة من صندوق المستلم")
        }).catch(()=>alert("❌ فشل السحب: تحقق من صلاحيات Firebase."))
      }
    });
    c.querySelectorAll(".za-act-del").forEach(b=>{
      b.onclick=()=>{
        let id=b.getAttribute("data-id");
        if(!confirm("حذف هذا السجل من الأرشيف؟"))return;
        e.db.ref(`${e.dbPath}/logs/${id}`).remove().then(()=>{
          e.adminLogsCache=e.adminLogsCache.filter(x=>x.id!==id);
          admin.updateStats();
          admin.renderLogs();
          a.showToast("تم حذف السجل")
        }).catch(()=>alert("❌ لا تملك صلاحية الحذف."))
      }
    });
    c.querySelectorAll(".za-act-ban").forEach(b=>{
      b.onclick=()=>{
        let u=b.getAttribute("data-user");
        admin.switchTab("banned");
        let ov=document.getElementById("zajel-admin-modal");
        ov&&ov.querySelector('[data-bsub="global"]')?.click();
        let inp=document.getElementById("za-ban-user");
        if(inp){inp.value=u;inp.focus()}
        a.showToast(`اختر مدة الحظر لـ (${u}) ثم اضغط تنفيذ`)
      }
    })
  },
  loadBanned(){
    let c=document.getElementById("za-banned-list");
    if(!c||!e.db)return;
    e.db.ref(`${e.dbPath}/banned`).once("value").then(snap=>{
      let val=snap.val()||{};
      e.adminBannedCache=val;
      admin.updateStats();
      let keys=Object.keys(val);
      if(!keys.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:20px;">لا يوجد أعضاء محظورون من النظام.</div>';return}
      let html="";
      keys.forEach(k=>{
        let d=val[k]||{};
        let expired=d.expiresAt&&Date.now()>=d.expiresAt;
        let rem=t.formatRemaining(d.expiresAt);
        let badge=expired
          ?'<span class="zajel-tag" style="background:rgba(148,163,184,0.18); color:#94a3b8;">منتهي</span>'
          :`<span class="zajel-tag" style="background:rgba(239,68,68,0.18); color:#fca5a5;">${d.expiresAt?`متبقي: ${rem}`:"دائم"}</span>`;
        html+=`
<div class="zajel-admin-card" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
<div style="min-width:0; flex:1;">
<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:3px;">
<span style="color:#f8fafc; font-weight:bold; font-size:13px;">${t.escapeHTML(k)}</span>
${badge}
</div>
<div style="color:#94a3b8; font-size:11px;">${d.reason?t.escapeHTML(d.reason):"بدون سبب"} • ${t.formatDate(d.timestamp)}</div>
</div>
<button type="button" class="zajel-mini-btn za-act-unban" data-user="${t.escapeHTML(k)}" style="background:rgba(16,185,129,0.2); color:#34d399; white-space:nowrap;">${expired?"إزالة":"فك الحظر"}</button>
</div>`
      });
      c.innerHTML=html;
      c.querySelectorAll(".za-act-unban").forEach(b=>{
        b.onclick=()=>{
          let u=b.getAttribute("data-user");
          if(!confirm(`فك الحظر عن (${u})؟`))return;
          e.db.ref(`${e.dbPath}/banned/${u}`).remove().then(()=>{a.showToast("✅ تم فك الحظر");admin.loadBanned()}).catch(()=>alert("❌ فشل فك الحظر."))
        }
      })
    }).catch(()=>{c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">تعذر جلب القائمة.</div>'})
  },
  banUser(username,reason,duration="permanent"){
    let s=t.sanitizeName(username);
    if(!s||!e.db)return Promise.resolve();
    let durMap={"1h":36e5,"6h":216e5,"24h":864e5,"3d":2592e5,"7d":6048e5};
    let ms=durMap[duration]||null;
    let expiresAt=ms?Date.now()+ms:null;
    return e.db.ref(`${e.dbPath}/banned/${s}`).set({
      reason:reason||"",
      bannedBy:e.myUsername||"admin",
      expiresAt:expiresAt,
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).then(()=>{
      a.showToast(`🚫 تم حظر (${username}) ${expiresAt?`لمدة ${t.formatRemaining(expiresAt)}`:"بشكل دائم"}`);
      admin.loadBanned()
    }).catch(()=>alert("❌ فشل الحظر: تحقق من صلاحيات Firebase."))
  },
  loadPersonalBlocks(){
    let c=document.getElementById("za-personal-blocks-list");
    if(!c||!e.db)return;
    c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:20px;"><i class="fas fa-spinner fa-spin"></i> جاري فحص قوائم الحظر...</div>';
    e.db.ref(`${e.dbPath}/blocks`).once("value").then(snap=>{
      let val=snap.val()||{},arr=[];
      Object.entries(val).forEach(([blocker,map])=>{
        if(map&&"object"==typeof map){
          Object.entries(map).forEach(([blocked,ts])=>{
            arr.push({blocker,blocked,timestamp:"number"==typeof ts?ts:0})
          })
        }
      });
      arr.sort((x,y)=>(y.timestamp||0)-(x.timestamp||0));
      e.adminBlocksCache=arr;
      admin.renderPersonalBlocks()
    }).catch(()=>{c.innerHTML='<div style="text-align:center; color:#ef4444; padding:20px;">تعذر قراءة قوائم الحظر.</div>'})
  },
  renderPersonalBlocks(){
    let c=document.getElementById("za-personal-blocks-list");
    if(!c)return;
    let q=(document.getElementById("za-blocks-search")?.value||"").trim().toLowerCase();
    let list=e.adminBlocksCache.filter(x=>!q||x.blocker.toLowerCase().includes(q)||x.blocked.toLowerCase().includes(q));
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:20px;">لا توجد حالات حظر شخصي مسجلة.</div>';return}
    let html="";
    list.forEach(item=>{
      html+=`
<div class="zajel-admin-card" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
<div style="min-width:0; flex:1; font-size:12px;">
<div><b style="color:#38bdf8;">${t.escapeHTML(item.blocker)}</b> <span style="color:#94a3b8;">حظر</span> <b style="color:#f87171;">${t.escapeHTML(item.blocked)}</b></div>
<div style="color:#64748b; font-size:10.5px; margin-top:2px;">${item.timestamp?t.formatDate(item.timestamp):"سابقاً"}</div>
</div>
<button type="button" class="zajel-mini-btn za-act-del-pblock" data-blocker="${t.escapeHTML(item.blocker)}" data-blocked="${t.escapeHTML(item.blocked)}" style="background:rgba(255,255,255,0.08); color:#e2e8f0; white-space:nowrap;">إلغاء</button>
</div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".za-act-del-pblock").forEach(b=>{
      b.onclick=()=>{
        let blkr=b.getAttribute("data-blocker"),blkd=b.getAttribute("data-blocked");
        if(!confirm(`إزالة الحظر الشخصي بين (${blkr}) و (${blkd})؟`))return;
        e.db.ref(`${e.dbPath}/blocks/${blkr}/${blkd}`).remove().then(()=>{
          e.adminBlocksCache=e.adminBlocksCache.filter(x=>!(x.blocker===blkr&&x.blocked===blkd));
          admin.renderPersonalBlocks();
          a.showToast("✅ تم إلغاء الحظر الشخصي")
        }).catch(()=>alert("❌ فشل الإلغاء."))
      }
    })
  },
  updateBroadcastCount(){
    let el=document.getElementById("za-bc-online-count");
    if(!el)return;
    let inc=document.getElementById("za-bc-include-self")?.checked;
    let cnt=t.getOnlineUsers(Boolean(inc)).length;
    el.textContent=`${cnt} متواجد`
  },
  async searchBroadcastYt(){
    let q=(document.getElementById("za-bc-yt")?.value||"").trim();
    let resBox=document.getElementById("za-bc-yt-results");
    if(!q||!resBox)return;
    let directId=t.extractYtId(q);
    if(directId){
      document.getElementById("za-bc-vid").value=directId;
      resBox.innerHTML=`<div style="color:#34d399; font-size:11.5px; padding:4px;">✅ تم التعرف على المقطع: ${directId}</div>`;
      return
    }
    resBox.innerHTML='<div style="text-align:center; color:#D4AF37; padding:10px; font-size:12px;"><i class="fas fa-spinner fa-spin"></i> جاري البحث...</div>';
    try{
      let resp=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(q)}&type=video&key=${e.ytApiKey}`);
      let data=await resp.json();
      if(data.error||!data.items||!data.items.length){
        resBox.innerHTML='<div style="color:#94a3b8; font-size:11.5px; text-align:center; padding:8px;">لا توجد نتائج.</div>';
        return
      }
      let html="";
      data.items.forEach(item=>{
        let vid=item.id.videoId,title=t.escapeHTML(item.snippet.title),thumb=item.snippet.thumbnails.default.url;
        html+=`
<div class="zajel-inbox-item za-bc-pick" data-vid="${vid}" data-title="${title}" style="padding:6px; margin-bottom:5px; gap:8px;">
<img src="${thumb}" style="width:48px; border-radius:4px;">
<div style="font-size:11.5px; color:#f8fafc; flex:1; text-align:right;">${title}</div>
</div>`
      });
      resBox.innerHTML=html;
      resBox.querySelectorAll(".za-bc-pick").forEach(el=>{
        el.onclick=()=>{
          document.getElementById("za-bc-vid").value=el.getAttribute("data-vid");
          document.getElementById("za-bc-yt").value=el.getAttribute("data-title");
          resBox.innerHTML=`<div style="color:#34d399; font-size:11.5px; padding:4px;">✅ تم اختيار المقطع</div>`
        }
      })
    }catch{resBox.innerHTML='<div style="color:#ef4444; font-size:11.5px; text-align:center; padding:8px;">خطأ في الاتصال.</div>'}
  },
  sendBroadcast(){
    if(!e.db)return alert("غير متصل بالقاعدة.");
    let title=(document.getElementById("za-bc-title")?.value||"").trim()||"إدارة شات ليل";
    let msg=(document.getElementById("za-bc-msg")?.value||"").trim();
    let rawYt=(document.getElementById("za-bc-yt")?.value||"").trim();
    let vid=document.getElementById("za-bc-vid")?.value||t.extractYtId(rawYt)||"";
    let incSelf=Boolean(document.getElementById("za-bc-include-self")?.checked);
    if(!msg&&!vid)return alert("أدخل رسالة أو اختر مقطع يوتيوب أولاً.");
    let users=t.getOnlineUsers(incSelf);
    if(!users.length)return alert("لا يوجد أعضاء متواجدون حالياً في القائمة.");
    if(!confirm(`إرسال هذا الزاجل الإداري إلى (${users.length}) عضو متواجد الآن؟`))return;
    let btn=document.getElementById("za-btn-send-bc");
    btn&&(btn.disabled=!0,btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري البث...');
    let ref=e.db.ref(e.dbPath),bcKey=ref.child("logs").push().key,updates={};
    let sentTargets=new Set;
    users.forEach(u=>{
      let san=t.sanitizeName(u.username);
      if(!san||sentTargets.has(san))return;
      sentTargets.add(san);
      updates[`inbox/${san}/${bcKey}`]={
        type:"broadcast",
        sender:"admin_broadcast",
        senderName:title,
        videoId:vid,
        message:msg||"بدون_رسالة",
        customMessage:msg||"بدون_رسالة",
        isRead:!1,
        timestamp:firebase.database.ServerValue.TIMESTAMP
      }
    });
    updates[`logs/${bcKey}`]={
      type:"broadcast",
      sender:e.myUsername||"admin",
      receiver:`بث جماعي (${sentTargets.size} عضو)`,
      videoId:vid,
      message:msg||"بدون_رسالة",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    };
    ref.update(updates).then(()=>{
      a.showToast(`👑 تم بث الزاجل الإداري إلى ${sentTargets.size} عضو!`);
      document.getElementById("za-bc-msg").value="";
      document.getElementById("za-bc-yt").value="";
      document.getElementById("za-bc-vid").value="";
      document.getElementById("za-bc-yt-results").innerHTML="";
      btn&&(btn.disabled=!1,btn.innerHTML='<i class="fas fa-bullhorn"></i> إرسال لجميع المتواجدين الآن');
      admin.loadLogs()
    }).catch(()=>{
      btn&&(btn.disabled=!1,btn.innerHTML='<i class="fas fa-bullhorn"></i> إرسال لجميع المتواجدين الآن');
      alert("❌ فشل البث الجماعي.")
    })
  },
  renderTopStats(){
    let c=document.getElementById("za-top-stats-body");
    if(!c)return;
    let logs=e.adminLogsCache||[];
    if(!logs.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:25px;">لا توجد بيانات كافية في السجل.</div>';return}
    let senders={},receivers={},videos={},zCnt=0,rCnt=0,bCnt=0;
    logs.forEach(item=>{
      let tp=item.type||"zajel";
      if("broadcast"===tp){bCnt++;return}
      if("reply"===tp){rCnt++;return}
      zCnt++;
      if(item.sender&&"مجهول"!==item.sender)senders[item.sender]=(senders[item.sender]||0)+1;
      if(item.receiver)receivers[item.receiver]=(receivers[item.receiver]||0)+1;
      if(item.videoId)videos[item.videoId]=(videos[item.videoId]||0)+1
    });
    let top5=obj=>Object.entries(obj).sort((x,y)=>y[1]-x[1]).slice(0,5);
    let medals=["🥇","🥈","🥉","4.","5."];
    let makeList=(arr,isVid)=>{
      if(!arr.length)return'<div style="color:#64748b; font-size:11.5px; text-align:center; padding:8px;">لا توجد بيانات</div>';
      return arr.map(([k,cnt],idx)=>`
<div class="zajel-top-row">
<div style="display:flex; align-items:center; gap:6px; min-width:0;">
<span>${medals[idx]}</span>
${isVid?`<a href="https://www.youtube.com/watch?v=${encodeURIComponent(k)}" target="_blank" rel="noopener" style="color:#fca5a5; text-decoration:none; direction:ltr;">${t.escapeHTML(k)} <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>`:`<b style="color:#f8fafc; overflow:hidden; text-overflow:ellipsis;">${t.escapeHTML(k)}</b>`}
</div>
<span class="zajel-tag zajel-tag-zajel">${cnt}</span>
</div>`).join("")
    };
    c.innerHTML=`
<div class="zajel-admin-card" style="display:flex; justify-content:space-around; text-align:center; font-size:12px;">
<div><div style="color:#D4AF37; font-weight:bold; font-size:15px;">${zCnt}</div><div style="color:#94a3b8; font-size:11px;">زاجل</div></div>
<div><div style="color:#34d399; font-weight:bold; font-size:15px;">${rCnt}</div><div style="color:#94a3b8; font-size:11px;">ردود</div></div>
<div><div style="color:#fbbf24; font-weight:bold; font-size:15px;">${bCnt}</div><div style="color:#94a3b8; font-size:11px;">بث إداري</div></div>
</div>
<div class="zajel-admin-card">
<div style="color:#D4AF37; font-weight:bold; font-size:12.5px; margin-bottom:8px;"><i class="fas fa-paper-plane"></i> أكثر الأعضاء إرسالاً</div>
${makeList(top5(senders),!1)}
</div>
<div class="zajel-admin-card">
<div style="color:#38bdf8; font-weight:bold; font-size:12.5px; margin-bottom:8px;"><i class="fas fa-heart"></i> أكثر الأعضاء استقبالاً</div>
${makeList(top5(receivers),!1)}
</div>
<div class="zajel-admin-card">
<div style="color:#fca5a5; font-weight:bold; font-size:12.5px; margin-bottom:8px;"><i class="fab fa-youtube"></i> أكثر المقاطع إهداءً</div>
${makeList(top5(videos),!0)}
</div>`
  },
  cleanOldLogs(days){
    if(!e.db||!confirm(`حذف جميع السجلات الأقدم من ${days} أيام؟`))return;
    let cutoff=Date.now()-days*864e5;
    e.db.ref(`${e.dbPath}/logs`).once("value").then(snap=>{
      let val=snap.val()||{},updates={},cnt=0;
      Object.entries(val).forEach(([k,v])=>{if(!v||!v.timestamp||v.timestamp<cutoff){updates[k]=null;cnt++}});
      if(!cnt)return a.showToast("لا توجد سجلات قديمة للتنظيف");
      e.db.ref(`${e.dbPath}/logs`).update(updates).then(()=>{a.showToast(`🧹 تم تنظيف ${cnt} سجل قديم`);admin.loadLogs()})
    }).catch(()=>alert("❌ فشل التنظيف."))
  },
  cleanOldDailyCounts(){
    if(!e.db||!confirm("حذف عدادات السقف اليومي للأيام السابقة؟"))return;
    let today=t.getTodayKey();
    e.db.ref(`${e.dbPath}/daily_counts`).once("value").then(snap=>{
      let val=snap.val()||{},updates={},cnt=0;
      Object.keys(val).forEach(dayKey=>{if(dayKey!==today){updates[dayKey]=null;cnt++}});
      if(!cnt)return a.showToast("لا توجد عدادات قديمة");
      e.db.ref(`${e.dbPath}/daily_counts`).update(updates).then(()=>a.showToast(`🧹 تم تنظيف عدادات ${cnt} يوم سابق`))
    }).catch(()=>alert("❌ فشل التنظيف."))
  },
  clearNotifs(){
    if(!e.db||!confirm("مسح جميع إشعارات التشغيل العالقة؟"))return;
    e.db.ref(`${e.dbPath}/notifications`).remove().then(()=>a.showToast("🧹 تم مسح الإشعارات العالقة")).catch(()=>alert("❌ فشل المسح."))
  },
  clearAllLogs(){
    if(!e.db||!confirm("هل أنت متأكد من مسح جميع سجلات الزاجل نهائياً؟"))return;
    e.db.ref(`${e.dbPath}/logs`).remove().then(()=>{a.showToast("🗑️ تم مسح السجل بالكامل");admin.loadLogs()}).catch(()=>alert("❌ فشل المسح."))
  }
};

let i=()=>{
  let setU=id=>{
    let el=document.getElementById(id);
    if(el&&el.value){
      let u=el.value.trim();
      u&&(e.myUsername=u,localStorage.setItem("pc_username",u),l.bindUserListeners())
    }
  };
  document.body.addEventListener("click",ev=>{
    ev.target.closest("#member-login-btn")&&setU("member-username");
    ev.target.closest("#register-btn")&&setU("register-username")
  });
  document.body.addEventListener("submit",ev=>{
    "member-login-form"===ev.target.id&&setU("member-username");
    "register-form"===ev.target.id&&setU("register-username")
  });
  document.body.addEventListener("keydown",ev=>{
    "Enter"===ev.key&&(ev.target.closest("#member-login-form")&&setU("member-username"),ev.target.closest("#register-form")&&setU("register-username"))
  })
};

let r=()=>{
  new MutationObserver(muts=>{
    let needBtn=!1;
    if(!document.getElementById("btn-lail-zajel")||(t.isAdmin()&&!document.getElementById("btn-lail-zajel-admin"))){
      document.querySelector("#sidebar-settings-container .modern-classic-list, .modern-classic-list")&&(needBtn=!0)
    }
    for(let m of muts){
      if("childList"===m.type){
        for(let node of m.addedNodes){
          if(1===node.nodeType){
            let els=node.querySelectorAll?node.querySelectorAll(".message-row, .msg-status-login, .user-join-message, .styled-sys-msg, .sys-msg-login"):[];
            [node,...Array.from(els)].forEach(el=>{
              if(el&&el.classList){
                let u=t.extractUser(el);
                u&&u.username&&(el.classList.contains("msg-self")||el.querySelector(".msg-self"))&&(e.myUsername=u.username,e.myDisplayName=u.displayName||u.username,localStorage.setItem("pc_username",e.myUsername),l.bindUserListeners())
              }
            })
          }
        }
      }
    }
    if(needBtn){
      document.getElementById("btn-lail-zajel")||a.injectButton();
      a.injectAdminButton()
    }
  }).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-username","class"]})
};

window.LaylZajelApiKey=e.ytApiKey;
window.LaylZajel={
  open:l.openModal,
  close:l.closeModal,
  switchTab:l.switchTab,
  toggleMinimize:a.toggleMinimize,
  playZajel:l.playZajel,
  selectYtVideo:l.selectYtVideo,
  closeSearch:l.closeSearch,
  performSearch:l.performSearch,
  showToast:a.showToast,
  unblockUser:l.unblockUser,
  sendReply:l.sendReply,
  openAdmin:admin.open,
  closeAdmin:admin.close
};

(()=>{
  a.injectStyles();
  i();
  if(!window.YT){
    let sc=document.createElement("script");
    sc.src="https://www.youtube.com/iframe_api";
    document.head.appendChild(sc)
  }
  let el=document.querySelector(".my-message, .msg-self, #profile-header-classic-bar, .sidebar-content .user-identity");
  if(el){
    let u=t.extractUser(el);
    u&&u.username&&(e.myUsername=u.username,e.myDisplayName=u.displayName||u.username,localStorage.setItem("pc_username",e.myUsername))
  }
  let boot=()=>{
    if("undefined"!=typeof firebase&&firebase.database&&firebase.apps.length>0){
      e.db=firebase.database();
      l.bindGlobalListeners();
      l.bindUserListeners()
    }else{setTimeout(boot,500)}
  };
  boot();
  r();
  setTimeout(()=>{document.getElementById("btn-lail-zajel")||a.injectButton();a.injectAdminButton()},1e3)
})()}();
