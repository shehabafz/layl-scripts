!function(){"use strict";

const e={
  firebase:{
    apiKey:"AIzaSyC9fdv0xFDVRfUMgBEoI2WVeVi9U5BF3_8",
    authDomain:"layl-codenames.firebaseapp.com",
    projectId:"layl-codenames",
    storageBucket:"layl-codenames.firebasestorage.app",
    messagingSenderId:"651006164506",
    appId:"1:651006164506:web:1541818c0e5a6077415ba3"
  },
  rootPath:"layl_feedback_v1",
  lastSentPrefix:"layl_fb_last_sent_"
};

const defaultSettings={
  enabled:!0,
  allowSuggestions:!0,
  allowComplaints:!0,
  allowTechnical:!0,
  allowPublicBoard:!0,
  allowFollowUp:!0,
  allowRating:!0,
  cooldownMinutes:30,
  dailyLimit:5,
  adminBypassCooldown:!0,
  minLength:10,
  maxLength:800,
  categories:"الإدارة والمشرفين,ميزة أو فكرة جديدة,الأعضاء والغرف,الفعاليات والمسابقات,مشكلة تقنية,أخرى",
  welcomeNotice:"تصل رسالتك مباشرةً لإدارة شات ليل بسرية تامة بينك وبين الإدارة، ويمكنك متابعة المحادثة والرد من تبويب (طلباتي).",
  closedMessage:"صندوق الاقتراحات والشكاوي مغلق مؤقتاً للصيانة، نعود قريباً.",
  bannerText:"",
  bannerType:"info",
  autoReplyEnabled:!1,
  autoReplyText:"تم استلام تذكرتك بنجاح ✅ سيقوم أحد المشرفين بمراجعتها والرد عليك في أقرب وقت.",
  blockedWords:""
};

const defaultTemplates={
  t1:{title:"شكر على اقتراح",text:"شكراً لك على اقتراحك الجميل 🌹 تم استلامه ورفعه للإدارة لدراسته والعمل عليه."},
  t2:{title:"استلام شكوى",text:"تم استلام شكواك بكل سرية 🛡️ وجاري مراجعتها والتحقق منها واتخاذ الإجراء اللازم."},
  t3:{title:"طلب توضيح",text:"شكراً لتواصلك، نرجو تزويدنا بتفاصيل أكثر أو صورة توضيحية عبر الرد داخل هذه التذكرة."},
  t4:{title:"مشكلة تقنية",text:"شكراً لتبليغك 🛠️ تم رصد المشكلة وجاري العمل على إصلاحها في أقرب تحديث."},
  t5:{title:"تم التنفيذ",text:"أبشرك! ✅ تم تنفيذ طلبك ومعالجة ملاحظتك بنجاح، نتمنى لك وقتاً ممتعاً في شات ليل."}
};

const TYPE_META={
  suggestion:{label:"اقتراح",icon:"💡",cls:"lfb-tag-gold"},
  complaint:{label:"شكوى",icon:"🛡️",cls:"lfb-tag-red"},
  technical:{label:"عطل تقني",icon:"🛠️",cls:"lfb-tag-blue"}
};

const STATUS_META={
  new:{label:"جديد",cls:"lfb-tag-red"},
  review:{label:"قيد المراجعة",cls:"lfb-tag-warn"},
  replied:{label:"تم الرد",cls:"lfb-tag-green"},
  implemented:{label:"تم التنفيذ ✅",cls:"lfb-tag-green"},
  rejected:{label:"مرفوض",cls:"lfb-tag-gray"},
  closed:{label:"مغلق",cls:"lfb-tag-gray"}
};

const PRIO_META={
  normal:{label:"عادي",cls:"lfb-tag-gray"},
  important:{label:"مهم",cls:"lfb-tag-warn"},
  urgent:{label:"عاجل",cls:"lfb-tag-red"}
};

const ROADMAP_META={
  studying:{label:"🔍 قيد الدراسة",cls:"lfb-tag-blue"},
  planned:{label:"📋 مخطط له",cls:"lfb-tag-purple"},
  in_progress:{label:"⚙️ قيد التنفيذ",cls:"lfb-tag-warn"},
  done:{label:"✅ تم التنفيذ",cls:"lfb-tag-green"},
  paused:{label:"⏸️ مؤجل",cls:"lfb-tag-gray"}
};

const t={
  db:null,
  myUsername:localStorage.getItem("pc_username")||null,
  myDisplayName:null,
  myKey:null,
  adminUsers:[],
  settings:Object.assign({},defaultSettings),
  templates:Object.assign({},defaultTemplates),
  myTickets:{},
  allTickets:{},
  publicIdeas:{},
  bans:{},
  vipExempt:{},
  myBan:null,
  myVip:!1,
  logs:[],
  prevUnreadUser:-1,
  toastQueue:[],
  isToasting:!1,
  cooldownTimer:null,
  boundUserKey:null,
  adminListenersBound:!1,
  observer:null,
  injectScheduled:!1
};

const a={
  sanitizeName:x=>x?x.replace(/[.#$\[\]\/]/g,"_").trim():null,
  escapeHTML:x=>x?String(x).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]||c):"",
  isSafeUrl:u=>Boolean(u&&/^https?:\/\/[^\s"'<>]+$/i.test(u.trim())),
  getCleanText(el){
    if(!el)return"";
    if(!el.firstElementChild||!el.querySelector("img,i,svg,.user-identity-badge-icon,.user-identity-super"))return el.textContent.trim();
    let c=el.cloneNode(!0);
    c.querySelectorAll("img,i,svg,.user-identity-badge-icon,.user-identity-super").forEach(y=>y.remove());
    return c.textContent.trim()
  },
  detectIdentity(){
    let u=localStorage.getItem("pc_username")||t.myUsername;
    if(!u){
      let el=document.querySelector(".my-message [data-username], .msg-self [data-username], #profile-header-classic-bar [data-username]");
      if(el)u=el.getAttribute("data-username");
      if(!u){
        let h=document.getElementById("addon-user-handle-badge");
        if(h&&h.textContent.trim())u=h.textContent.trim().replace(/^@/,"")
      }
    }
    if(u){
      u=u.trim();
      t.myUsername=u;
      t.myKey=a.sanitizeName(u);
      let dn=null;
      try{
        let item=document.querySelector(`#sidebar-users-container [data-username="${CSS.escape(u)}"]`);
        if(item){
          let nm=item.querySelector(".user-identity-name")||item.querySelector(".user-identity");
          dn=a.getCleanText(nm)
        }
      }catch{}
      t.myDisplayName=dn||t.myDisplayName||u
    }
    return Boolean(t.myKey)
  },
  setIdentity(u){
    if(!u||!u.trim())return;
    let clean=u.trim(),san=a.sanitizeName(clean);
    let changed=san!==t.myKey;
    t.myUsername=clean;
    t.myKey=san;
    t.myDisplayName=t.myDisplayName||clean;
    try{localStorage.setItem("pc_username",clean)}catch{}
    if(changed&&typeof sync!=="undefined"){
      sync.bindUserListeners();
      sync.syncAdminRole()
    }
    injector.injectButtons()
  },
  genCode(){
    let chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",s="LY-";
    for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];
    return s
  },
  isAdminKey(key){
    if(!key||!t.adminUsers.length)return!1;
    let s=a.sanitizeName(key);
    return t.adminUsers.includes(key)||(s&&t.adminUsers.includes(s))||t.adminUsers.some(ad=>a.sanitizeName(ad)===s)
  },
  isAdmin(){
    return Boolean(t.myUsername&&a.isAdminKey(t.myUsername))
  },
  isBypassed(){
    return Boolean((a.isAdmin()&&!1!==t.settings.adminBypassCooldown)||t.myVip)
  },
  getCooldownMs(){
    let m=Number(t.settings.cooldownMinutes);
    return(isNaN(m)||m<0?30:m)*6e4
  },
  getLastSentTs(){
    let localTs=t.myKey?Number(localStorage.getItem(e.lastSentPrefix+t.myKey)||0):0;
    let remoteTs=0;
    Object.values(t.myTickets||{}).forEach(x=>{
      if(x&&x.createdAt&&x.createdAt>remoteTs)remoteTs=x.createdAt
    });
    return Math.max(localTs,remoteTs)
  },
  getCooldownRemaining(){
    if(a.isBypassed())return 0;
    let ms=a.getCooldownMs();
    if(ms<=0)return 0;
    let diff=(a.getLastSentTs()+ms)-Date.now();
    return diff>0?diff:0
  },
  getDailyCount(){
    let cutoff=Date.now()-864e5,c=0;
    Object.values(t.myTickets||{}).forEach(x=>{if(x&&(x.createdAt||0)>=cutoff)c++});
    return c
  },
  findBlockedWord(text){
    let raw=String(t.settings.blockedWords||"").trim();
    if(!raw)return null;
    let low=text.toLowerCase();
    let words=raw.split(/[,،\n]+/).map(w=>w.trim().toLowerCase()).filter(Boolean);
    for(let w of words){if(low.includes(w))return w}
    return null
  },
  formatCountdown(ms){
    let sec=Math.ceil(ms/1e3),m=Math.floor(sec/60),s=sec%60;
    let h=Math.floor(m/60);m=m%60;
    return h>0?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
  },
  formatDate(ts){
    if(!ts)return"-";
    try{return new Date(ts).toLocaleString("ar-EG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"-"}
  },
  formatDurationMin(ms){
    if(!ms||ms<0)return"-";
    let m=Math.round(ms/6e4);
    if(m<60)return`${m} د`;
    let h=Math.floor(m/60),rm=m%60;
    return h<24?(rm?`${h} س ${rm} د`:`${h} ساعة`):`${Math.floor(h/24)} يوم`
  },
  formatRemaining(exp){
    if(!exp)return"دائم";
    let diff=exp-Date.now();
    if(diff<=0)return"منتهي";
    let mins=Math.ceil(diff/6e4);
    if(mins<60)return`${mins} دقيقة`;
    let hrs=Math.floor(mins/60),rm=mins%60;
    if(hrs<24)return rm?`${hrs} س و ${rm} د`:`${hrs} ساعة`;
    let days=Math.floor(hrs/24),rh=hrs%24;
    return rh?`${days} ي و ${rh} س`:`${days} يوم`
  },
  isActiveBan(b){
    return Boolean(b&&(!b.expiresAt||b.expiresAt>Date.now()))
  },
  getCategories(){
    let list=String(t.settings.categories||defaultSettings.categories).split(/[,،\n]+/).map(x=>x.trim()).filter(Boolean);
    return list.length?list:["أخرى"]
  },
  getMessagesArray(x){
    if(!x)return[];
    let arr=[];
    if(x.messages&&"object"==typeof x.messages){
      arr=Object.values(x.messages).filter(Boolean).sort((p,q)=>(p.ts||0)-(q.ts||0))
    }
    if(!arr.length&&x.adminReply){
      arr.push({senderRole:"admin",sender:x.adminReplyBy||"الإدارة",text:x.adminReply,ts:x.adminReplyAt||x.updatedAt||x.createdAt})
    }
    return arr
  },
  getDbSizeKB(){
    try{return(new Blob([JSON.stringify({tickets:t.allTickets,ideas:t.publicIdeas})]).size/1024).toFixed(1)}catch{return"0.0"}
  },
  getUnreadUserCount(){
    let c=0;
    Object.values(t.myTickets||{}).forEach(x=>{
      if(x&&!1===x.userReadReply)c++
    });
    return c
  },
  getUnreadAdminCount(){
    let c=0;
    Object.values(t.allTickets||{}).forEach(x=>{
      if(x&&!x.archived&&("new"===x.status||!0===x.adminReadFollowup))c++
    });
    return c
  },
  updateBadges(){
    let ub=document.getElementById("lfb-user-badge"),uc=a.getUnreadUserCount();
    if(ub){ub.textContent=uc>99?"99+":String(uc);ub.style.display=uc>0?"inline-block":"none"}
    if(t.prevUnreadUser>=0&&uc>t.prevUnreadUser&&!document.getElementById("layl-feedback-user-modal")){
      ui.showToast("📩 وصلك رد جديد من الإدارة في الاقتراحات والشكاوي!")
    }
    t.prevUnreadUser=uc;
    let ab=document.getElementById("lfb-admin-badge"),ac=a.getUnreadAdminCount();
    if(ab){ab.textContent=ac>99?"99+":String(ac);ab.style.display=ac>0?"inline-block":"none"}
  }
};
a.detectIdentity();

const ui={
  injectStyles(){
    if(document.getElementById("layl-feedback-styles"))return;
    let s=document.createElement("style");
    s.id="layl-feedback-styles";
    s.textContent=`
      .lfb-overlay{position:fixed;inset:0;background:rgba(8,10,18,.88);z-index:2147483644;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .22s ease;direction:rtl;font-family:'Segoe UI',tahoma,sans-serif}
      .lfb-overlay.active{opacity:1;visibility:visible}
      .lfb-sub-overlay{z-index:2147483646;background:rgba(5,7,14,.92)}
      .lfb-box{background:linear-gradient(180deg,rgba(26,30,52,.98) 0%,rgba(14,16,30,.99) 100%);border:1px solid rgba(212,175,55,.3);border-radius:20px;width:95%;max-width:500px;max-height:89vh;max-height:89dvh;padding:16px 18px 18px;box-shadow:0 24px 60px rgba(0,0,0,.85);transform:scale(.95) translateY(12px);opacity:0;transition:transform .24s ease,opacity .24s ease;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;color:#f8fafc}
      .lfb-box.lfb-admin-box{max-width:720px}
      .lfb-box.lfb-sub-box{max-width:550px;border-color:rgba(212,175,55,.45)}
      .lfb-overlay.active .lfb-box{transform:scale(1) translateY(0);opacity:1}
      .lfb-header,.lfb-stats,.lfb-tabs{flex-shrink:0}
      .lfb-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08)}
      .lfb-title{display:flex;align-items:center;gap:8px;color:#D4AF37;font-weight:800;font-size:15.5px}
      .lfb-ctrl-btn{background:rgba(255,255,255,.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;transition:background .2s}
      .lfb-ctrl-btn:hover{background:rgba(255,255,255,.18)}
      .lfb-ctrl-close:hover{background:rgba(239,68,68,.8)}
      .lfb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
      .lfb-stat{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 4px;text-align:center}
      .lfb-stat-val{font-size:14px;font-weight:800;color:#D4AF37}
      .lfb-stat-lbl{font-size:10px;color:#94a3b8;margin-top:2px}
      .lfb-tabs{display:flex;height:40px;background:rgba(0,0,0,.34);border-radius:12px;margin-bottom:11px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border:1px solid rgba(255,255,255,.05)}
      .lfb-tabs::-webkit-scrollbar{display:none}
      .lfb-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 10px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;transition:background .2s,color .2s;white-space:nowrap}
      .lfb-tab.active{background:rgba(212,175,55,.16);color:#D4AF37;border-bottom:2px solid #D4AF37}
      .lfb-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding-left:4px;margin-left:-4px;-webkit-overflow-scrolling:touch}
      .lfb-body::-webkit-scrollbar{width:5px}
      .lfb-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
      .lfb-view{display:none}
      .lfb-view.active{display:block}
      .lfb-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;margin-bottom:8px;text-align:right}
      .lfb-card-title{font-size:12.5px;font-weight:700;color:#D4AF37;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
      .lfb-banner{border-radius:11px;padding:8px 11px;font-size:11.5px;line-height:1.55;margin-bottom:9px;display:flex;align-items:flex-start;gap:8px;font-weight:600}
      .lfb-banner-info{background:rgba(56,189,248,.11);border:1px solid rgba(56,189,248,.32);color:#bae6fd}
      .lfb-banner-warn{background:rgba(245,158,11,.13);border:1px solid rgba(245,158,11,.38);color:#fde68a}
      .lfb-banner-success{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);color:#a7f3d0}
      .lfb-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
      .lfb-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
      .lfb-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .lfb-type-card{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:9px 6px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;color:#cbd5e1;font-size:12px;font-weight:700}
      .lfb-type-card.active{background:rgba(212,175,55,.16);border-color:#D4AF37;color:#D4AF37}
      .lfb-type-card span{display:block;font-size:18px;margin-bottom:3px}
      .lfb-input{width:100%;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.11);color:#fff;padding:8px 10px;border-radius:10px;font-family:inherit;font-size:12.5px;outline:none;box-sizing:border-box;transition:border-color .2s}
      .lfb-input:focus{border-color:#D4AF37}
      .lfb-input option{background:#15182b;color:#fff}
      .lfb-label{display:block;font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:4px}
      .lfb-btn{border:none;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .18s,transform .15s;display:inline-flex;align-items:center;justify-content:center;gap:5px}
      .lfb-btn:active{transform:scale(.97)}
      .lfb-btn:disabled{opacity:.48;cursor:not-allowed}
      .lfb-btn-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#141624;width:100%}
      .lfb-btn-crimson{background:linear-gradient(135deg,#8b1836,#5c0f22);color:#fff;width:100%}
      .lfb-btn-dark{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.09)}
      .lfb-btn-dark:hover{background:rgba(255,255,255,.15)}
      .lfb-btn-danger{background:rgba(239,68,68,.16);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
      .lfb-btn-success{background:rgba(16,185,129,.18);color:#6ee7b7;border:1px solid rgba(16,185,129,.35)}
      .lfb-btn-info{background:rgba(56,189,248,.16);color:#7dd3fc;border:1px solid rgba(56,189,248,.3)}
      .lfb-btn-warn{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35)}
      .lfb-btn-purple{background:rgba(168,85,247,.2);color:#e9d5ff;border:1px solid rgba(168,85,247,.38)}
      .lfb-mini{padding:5px 8px;font-size:11px;border-radius:8px}
      .lfb-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700}
      .lfb-tag-gold{background:rgba(212,175,55,.18);color:#D4AF37}
      .lfb-tag-green{background:rgba(16,185,129,.17);color:#34d399}
      .lfb-tag-red{background:rgba(239,68,68,.18);color:#f87171}
      .lfb-tag-blue{background:rgba(56,189,248,.18);color:#38bdf8}
      .lfb-tag-warn{background:rgba(245,158,11,.18);color:#fbbf24}
      .lfb-tag-purple{background:rgba(168,85,247,.2);color:#c084fc}
      .lfb-tag-gray{background:rgba(148,163,184,.18);color:#94a3b8}
      .lfb-user-link{background:none;border:none;color:#7dd3fc;font-weight:800;font-size:12.5px;padding:0;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px}
      .lfb-user-link:hover{color:#D4AF37;text-decoration:underline}
      .lfb-thread{display:flex;flex-direction:column;gap:7px;max-height:230px;overflow-y:auto;padding:8px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);border-radius:11px;margin:8px 0}
      .lfb-msg{padding:8px 10px;border-radius:10px;font-size:12px;line-height:1.55;max-width:92%;word-break:break-word;white-space:pre-wrap}
      .lfb-msg-user{align-self:flex-start;background:rgba(56,189,248,.13);border:1px solid rgba(56,189,248,.28);color:#e0f2fe}
      .lfb-msg-admin{align-self:flex-end;background:rgba(16,185,129,.13);border:1px solid rgba(16,185,129,.3);color:#ecfdf5}
      .lfb-msg-sys{align-self:center;background:rgba(212,175,55,.1);border:1px dashed rgba(212,175,55,.35);color:#fde68a;font-size:11px;text-align:center}
      .lfb-msg-meta{font-size:9.5px;color:#94a3b8;margin-bottom:3px;display:flex;justify-content:space-between;gap:10px}
      .lfb-reply-box{background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.28);border-radius:10px;padding:8px 10px;margin-top:7px;font-size:12px;color:#e2e8f0;line-height:1.55}
      .lfb-note-box{background:rgba(245,158,11,.08);border:1px dashed rgba(245,158,11,.35);border-radius:9px;padding:7px 9px;margin-top:6px;font-size:11px;color:#fde68a}
      .lfb-stars{display:inline-flex;gap:4px;align-items:center}
      .lfb-star-btn{background:none;border:none;font-size:18px;cursor:pointer;color:#475569;padding:0 2px;transition:transform .12s}
      .lfb-star-btn.on{color:#fbbf24}
      .lfb-star-btn:hover{transform:scale(1.15)}
      .lfb-vote-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#cbd5e1;border-radius:10px;padding:6px 10px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;flex-shrink:0}
      .lfb-vote-btn.voted{background:rgba(212,175,55,.22);border-color:#D4AF37;color:#D4AF37}
      .lfb-setting-row{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:9px 11px;margin-bottom:7px;gap:10px}
      .lfb-switch{position:relative;width:42px;height:22px;flex-shrink:0}
      .lfb-switch input{opacity:0;width:0;height:0}
      .lfb-slider{position:absolute;cursor:pointer;inset:0;background:#334155;border-radius:22px;transition:background .22s}
      .lfb-slider:before{content:"";position:absolute;height:16px;width:16px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform .22s}
      .lfb-switch input:checked+.lfb-slider{background:#10b981}
      .lfb-switch input:checked+.lfb-slider:before{transform:translateX(-20px)}
      .lfb-prog-wrap{width:100%;height:7px;background:rgba(255,255,255,.08);border-radius:10px;overflow:hidden;margin:5px 0 8px}
      .lfb-prog-bar{height:100%;background:linear-gradient(90deg,#8b1836,#D4AF37);border-radius:10px}
      .lfb-batch-bar{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.35);border-radius:10px;padding:8px 10px;margin-bottom:8px;display:flex;flex-direction:column;gap:6px}
      .lfb-chk{width:16px;height:16px;accent-color:#D4AF37;cursor:pointer;flex-shrink:0}
      .lfb-pill{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.11);color:#e2e8f0;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}
      .lfb-pill:hover{background:rgba(212,175,55,.2);border-color:rgba(212,175,55,.55);color:#D4AF37}
      .lfb-attach-img{max-width:100%;max-height:170px;border-radius:10px;margin-top:6px;border:1px solid rgba(255,255,255,.12);display:block;object-fit:contain;background:#090b14}
      .lfb-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(20,22,40,.96);border:1px solid rgba(212,175,55,.45);color:#f8fafc;padding:11px 22px;border-radius:50px;z-index:2147483647;font-family:tahoma,sans-serif;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,.75);pointer-events:none;text-align:center;max-width:88vw;font-weight:700;animation:lfb-toast-fade 2.8s forwards ease}
      @keyframes lfb-toast-fade{0%{opacity:0;transform:translate(-50%,-35%)}12%{opacity:1;transform:translate(-50%,-50%)}85%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(-50%,-70%)}}
      .lfb-badge-dot{display:none;position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:50px;font-size:10px;height:18px;line-height:18px;min-width:18px;padding:0 4px;text-align:center;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,.35);white-space:nowrap;z-index:10;box-sizing:border-box}
      @media(max-width:500px){.lfb-box{padding:12px 13px 14px;width:96%}.lfb-stats{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(s)
  },
  showToast(msg){
    t.toastQueue.push(msg);
    ui.processToast()
  },
  processToast(){
    if(t.isToasting||!t.toastQueue.length)return;
    t.isToasting=!0;
    let d=document.createElement("div");
    d.className="lfb-toast";
    d.innerHTML=t.toastQueue.shift();
    document.body.appendChild(d);
    setTimeout(()=>{d.remove();t.isToasting=!1;ui.processToast()},2900)
  }
};

const injector={
  injectButtons(){
    let lists=document.querySelectorAll(".modern-classic-list");
    if(!lists.length)return;
    let adm=a.isAdmin();
    lists.forEach(list=>{
      if(!list.querySelector("#btn-lail-feedback")){
        let b=document.createElement("button");
        b.id="btn-lail-feedback";
        b.type="button";
        b.className="modern-classic-item";
        b.innerHTML=`
          <div class="modern-classic-item-content">
            <div class="modern-classic-icon-wrapper" style="position:relative; overflow:visible; background:linear-gradient(135deg,#0f172a,#1e3a5f); color:#38bdf8;">
              <i class="fas fa-comment-dots"></i>
              <b id="lfb-user-badge" class="lfb-badge-dot">0</b>
            </div>
            <span class="modern-classic-text">الاقتراحات والشكاوي</span>
          </div>
          <i class="fas fa-chevron-left modern-classic-chevron"></i>`;
        b.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();memberUI.open()});
        list.appendChild(b)
      }
      let existingAdmin=list.querySelector("#btn-lail-feedback-admin");
      if(adm){
        if(!existingAdmin){
          let ab=document.createElement("button");
          ab.id="btn-lail-feedback-admin";
          ab.type="button";
          ab.className="modern-classic-item";
          ab.innerHTML=`
            <div class="modern-classic-item-content">
              <div class="modern-classic-icon-wrapper" style="position:relative; overflow:visible; background:linear-gradient(135deg,#3b0764,#6b21a8); color:#D4AF37;">
                <i class="fas fa-inbox"></i>
                <b id="lfb-admin-badge" class="lfb-badge-dot">0</b>
              </div>
              <span class="modern-classic-text">لوحة الاقتراحات والشكاوي</span>
            </div>
            <i class="fas fa-chevron-left modern-classic-chevron"></i>`;
          ab.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();adminUI.open()});
          let anchor=list.querySelector("#btn-lail-streak-admin")||list.querySelector("#btn-lail-zajel-admin")||list.querySelector("#btn-lail-feedback");
          anchor?anchor.insertAdjacentElement("afterend",ab):list.appendChild(ab)
        }
      }else if(existingAdmin){
        existingAdmin.remove()
      }
    });
    a.updateBadges()
  },
  bindLoginHooks(){
    let grab=id=>{
      let el=document.getElementById(id);
      el&&el.value&&a.setIdentity(el.value)
    };
    document.body.addEventListener("click",ev=>{
      ev.target.closest("#member-login-btn")&&grab("member-username");
      ev.target.closest("#register-btn")&&grab("register-username")
    });
    document.body.addEventListener("submit",ev=>{
      "member-login-form"===ev.target.id&&grab("member-username");
      "register-form"===ev.target.id&&grab("register-username")
    });
    document.body.addEventListener("keydown",ev=>{
      if("Enter"===ev.key){
        ev.target.closest("#member-login-form")?grab("member-username"):ev.target.closest("#register-form")&&grab("register-username")
      }
    })
  },
  startObserver(){
    if(t.observer)return;
    t.observer=new MutationObserver(()=>{
      let hasU=Boolean(document.getElementById("btn-lail-feedback"));
      let hasA=!a.isAdmin()||Boolean(document.getElementById("btn-lail-feedback-admin"));
      if(hasU&&hasA)return;
      if(t.injectScheduled)return;
      t.injectScheduled=!0;
      requestAnimationFrame(()=>{
        setTimeout(()=>{t.injectScheduled=!1;a.detectIdentity();injector.injectButtons()},0)
      })
    });
    t.observer.observe(document.body,{childList:!0,subtree:!0})
  }
};

const memberUI={
  activeTab:"send",
  selectedType:"suggestion",
  openTicketId:null,
  open(){
    a.detectIdentity();
    if(t.myKey&&t.boundUserKey!==t.myKey&&typeof sync!=="undefined")sync.bindUserListeners();
    let ov=document.getElementById("layl-feedback-user-modal");
    ov&&ov.remove();
    ov=document.createElement("div");
    ov.id="layl-feedback-user-modal";
    ov.className="lfb-overlay";
    let uc=a.getUnreadUserCount(),showPub=!1!==t.settings.allowPublicBoard;
    ov.innerHTML=`
      <div class="lfb-box">
        <div class="lfb-header">
          <div class="lfb-title"><i class="fas fa-comment-dots"></i> الاقتراحات والشكاوي</div>
          <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-u-close"><i class="fas fa-times"></i></button>
        </div>
        <div id="lfb-u-banner"></div>
        <div class="lfb-tabs">
          <button type="button" class="lfb-tab active" data-utab="send"><i class="fas fa-paper-plane"></i> إرسال جديد</button>
          <button type="button" class="lfb-tab" data-utab="mine"><i class="fas fa-envelope-open-text"></i> طلباتي <span id="lfb-u-tab-cnt" class="lfb-tag lfb-tag-red" style="${uc>0?"":"display:none;"}">${uc}</span></button>
          ${showPub?'<button type="button" class="lfb-tab" data-utab="public"><i class="fas fa-lightbulb"></i> ساحة الاقتراحات</button>':""}
          <button type="button" class="lfb-tab" data-utab="track"><i class="fas fa-search"></i> تتبع</button>
        </div>
        <div class="lfb-body">
          <div id="lfb-uview-send" class="lfb-view active"></div>
          <div id="lfb-uview-mine" class="lfb-view"></div>
          <div id="lfb-uview-public" class="lfb-view"></div>
          <div id="lfb-uview-track" class="lfb-view">
            <div class="lfb-card">
              <div class="lfb-card-title"><span><i class="fas fa-ticket-alt"></i> البحث برقم التذكرة</span></div>
              <div style="font-size:11.5px; color:#94a3b8; margin-bottom:8px;">أدخل رقم التذكرة (مثل <b style="color:#D4AF37;">LY-7X9K2</b>) للاطلاع على حالتها ورد الإدارة.</div>
              <div class="lfb-row" style="margin-bottom:8px;">
                <input type="text" id="lfb-track-inp" class="lfb-input" style="flex:1; text-transform:uppercase; font-family:monospace;" placeholder="LY-XXXXX" autocomplete="off">
                <button type="button" id="lfb-track-btn" class="lfb-btn lfb-btn-gold" style="width:auto; padding:8px 14px;">بحث</button>
              </div>
              <div id="lfb-track-res"></div>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&memberUI.close()});
    document.getElementById("lfb-u-close").onclick=()=>memberUI.close();
    ov.querySelectorAll("[data-utab]").forEach(btn=>{btn.onclick=()=>memberUI.switchTab(btn.dataset.utab)});
    document.getElementById("lfb-track-btn").onclick=()=>memberUI.lookupByCode();
    document.getElementById("lfb-track-inp").addEventListener("keydown",ev=>{"Enter"===ev.key&&memberUI.lookupByCode()});
    memberUI.activeTab="send";
    memberUI.renderBanner();
    memberUI.renderForm();
    memberUI.renderMyTickets();
    showPub&&memberUI.renderPublicBoard();
    requestAnimationFrame(()=>ov.classList.add("active"))
  },
  close(){
    clearInterval(t.cooldownTimer);t.cooldownTimer=null;
    memberUI.openTicketId=null;
    let sub=document.getElementById("layl-feedback-usub-modal");sub&&sub.remove();
    let ov=document.getElementById("layl-feedback-user-modal");ov&&ov.remove()
  },
  renderBanner(){
    let b=document.getElementById("lfb-u-banner");
    if(!b)return;
    let txt=(t.settings.bannerText||"").trim();
    if(!txt){b.innerHTML="";return}
    let tp=t.settings.bannerType||"info";
    let ico="warn"===tp?"fa-exclamation-triangle":"success"===tp?"fa-check-circle":"fa-bullhorn";
    b.innerHTML=`<div class="lfb-banner lfb-banner-${tp}"><i class="fas ${ico}" style="margin-top:2px;"></i><div>${a.escapeHTML(txt)}</div></div>`
  },
  switchTab(tab){
    let ov=document.getElementById("layl-feedback-user-modal");
    if(!ov)return;
    memberUI.activeTab=tab;
    ov.querySelectorAll("[data-utab]").forEach(x=>x.classList.toggle("active",x.dataset.utab===tab));
    ov.querySelectorAll(".lfb-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`lfb-uview-${tab}`);
    v&&v.classList.add("active");
    if("mine"===tab){memberUI.renderMyTickets();memberUI.markRepliesRead()}
    else if("send"===tab)memberUI.renderForm();
    else if("public"===tab)memberUI.renderPublicBoard()
  },
  renderForm(){
    let c=document.getElementById("lfb-uview-send");
    if(!c)return;
    clearInterval(t.cooldownTimer);t.cooldownTimer=null;
    if(!t.myKey){
      c.innerHTML='<div class="lfb-card" style="text-align:center; padding:26px 14px;"><div style="font-size:34px; margin-bottom:8px;">🔐</div><div style="color:#fbbf24; font-weight:700; font-size:14px; margin-bottom:6px;">يلزم تسجيل الدخول أولاً</div><div style="color:#94a3b8; font-size:12px; line-height:1.6;">هذه الميزة متاحة للأعضاء المسجلين فقط. تأكد من الدخول بحسابك أو أرسل رسالة في الشات ثم أعد فتح النافذة.</div></div>';
      return
    }
    if(!1===t.settings.enabled){
      c.innerHTML=`<div class="lfb-card" style="text-align:center; padding:26px 14px;"><div style="font-size:34px; margin-bottom:10px;">🔧</div><div style="color:#fbbf24; font-weight:700; font-size:14px; margin-bottom:6px;">مغلق مؤقتاً</div><div style="color:#94a3b8; font-size:12.5px; line-height:1.6;">${a.escapeHTML(t.settings.closedMessage||defaultSettings.closedMessage)}</div></div>`;
      return
    }
    if(a.isActiveBan(t.myBan)){
      c.innerHTML=`
        <div class="lfb-card" style="text-align:center; padding:24px 14px; border-color:rgba(239,68,68,.4); background:rgba(139,24,54,.12);">
          <div style="font-size:36px; margin-bottom:8px;">🚫</div>
          <div style="color:#fca5a5; font-weight:800; font-size:14.5px; margin-bottom:6px;">تم تقييد الإرسال لحسابك</div>
          <div style="color:#e2e8f0; font-size:12.5px; margin-bottom:8px; line-height:1.6;">${a.escapeHTML(t.myBan.reason||"بسبب إساءة استخدام صندوق الاقتراحات والشكاوي.")}</div>
          <span class="lfb-tag lfb-tag-red">المدة المتبقية: ${a.formatRemaining(t.myBan.expiresAt)}</span>
        </div>`;
      return
    }
    let allowed=[];
    !1!==t.settings.allowSuggestions&&allowed.push("suggestion");
    !1!==t.settings.allowComplaints&&allowed.push("complaint");
    !1!==t.settings.allowTechnical&&allowed.push("technical");
    if(!allowed.length){
      c.innerHTML='<div class="lfb-card" style="text-align:center; color:#94a3b8; padding:22px;">لا توجد أقسام متاحة للإرسال حالياً.</div>';
      return
    }
    if(!allowed.includes(memberUI.selectedType))memberUI.selectedType=allowed[0];
    let cats=a.getCategories(),maxL=Number(t.settings.maxLength)||800;
    let lim=Number(t.settings.dailyLimit)||0,used=a.getDailyCount();
    let typeCards=allowed.map(k=>{
      let m=TYPE_META[k];
      return`<div class="lfb-type-card ${memberUI.selectedType===k?"active":""}" data-ftype="${k}"><span>${m.icon}</span>${m.label}</div>`
    }).join("");
    c.innerHTML=`
      <div class="lfb-banner lfb-banner-info">
        <i class="fas fa-shield-alt" style="font-size:15px; margin-top:2px;"></i>
        <div>${a.escapeHTML(t.settings.welcomeNotice||defaultSettings.welcomeNotice)}</div>
      </div>
      <div id="lfb-cooldown-box" style="display:none; margin-bottom:9px;"></div>
      <div style="margin-bottom:9px;">
        <label class="lfb-label">نوع الرسالة</label>
        <div class="lfb-grid-${allowed.length}">${typeCards}</div>
      </div>
      <div class="lfb-grid-2" style="margin-bottom:9px;">
        <div>
          <label class="lfb-label">القسم / التصنيف</label>
          <select id="lfb-f-cat" class="lfb-input">${cats.map(x=>`<option value="${a.escapeHTML(x)}">${a.escapeHTML(x)}</option>`).join("")}</select>
        </div>
        <div>
          <label class="lfb-label">الأهمية</label>
          <select id="lfb-f-prio" class="lfb-input">
            <option value="normal">عادي</option>
            <option value="important">مهم</option>
            <option value="urgent">عاجل</option>
          </select>
        </div>
      </div>
      <div id="lfb-target-wrap" style="${"complaint"===memberUI.selectedType?"":"display:none;"} margin-bottom:8px;">
        <label class="lfb-label" style="color:#fca5a5;"><i class="fas fa-user-tag"></i> اسم العضو / المشرف المشكو ضده (اختياري)</label>
        <input type="text" id="lfb-f-target" class="lfb-input" maxlength="50" placeholder="اكتب اسمه لتسريع المراجعة...">
      </div>
      <div style="margin-bottom:8px;">
        <label class="lfb-label">عنوان مختصر (اختياري)</label>
        <input type="text" id="lfb-f-subj" class="lfb-input" maxlength="80" placeholder="مثلاً: فكرة فعالية جديدة / ملاحظة على غرفة...">
      </div>
      <div style="margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label class="lfb-label">تفاصيل الرسالة</label>
          <span id="lfb-char-cnt" style="font-size:10.5px; color:#94a3b8;">0 / ${maxL}</span>
        </div>
        <textarea id="lfb-f-msg" class="lfb-input" rows="4" maxlength="${maxL}" style="resize:vertical; line-height:1.6;" placeholder="اكتب اقتراحك أو شكواك بكل وضوح..."></textarea>
      </div>
      <div style="margin-bottom:10px;">
        <label class="lfb-label"><i class="fas fa-image"></i> رابط صورة / دليل (اختياري — رابط مباشر https)</label>
        <input type="url" id="lfb-f-attach" class="lfb-input" maxlength="350" placeholder="https://...">
      </div>
      ${lim>0&&!a.isBypassed()?`<div style="font-size:10.5px; color:#94a3b8; margin-bottom:7px; text-align:center;">المتبقي من حدّك اليومي: <b style="color:#D4AF37;">${Math.max(0,lim-used)} / ${lim}</b></div>`:""}
      <button type="button" id="lfb-f-submit" class="lfb-btn lfb-btn-gold"><i class="fas fa-paper-plane"></i> إرسال للإدارة</button>
    `;
    c.querySelectorAll("[data-ftype]").forEach(card=>{
      card.onclick=()=>{
        memberUI.selectedType=card.dataset.ftype;
        c.querySelectorAll("[data-ftype]").forEach(x=>x.classList.toggle("active",x.dataset.ftype===memberUI.selectedType));
        let tw=document.getElementById("lfb-target-wrap");
        tw&&(tw.style.display="complaint"===memberUI.selectedType?"block":"none")
      }
    });
    let ta=document.getElementById("lfb-f-msg"),cnt=document.getElementById("lfb-char-cnt");
    ta.oninput=()=>{cnt.textContent=`${ta.value.length} / ${maxL}`};
    document.getElementById("lfb-f-submit").onclick=()=>memberUI.submitTicket();
    memberUI.startCooldownTicker()
  },
  startCooldownTicker(){
    let tick=()=>{
      let box=document.getElementById("lfb-cooldown-box"),btn=document.getElementById("lfb-f-submit");
      if(!box||!btn){clearInterval(t.cooldownTimer);t.cooldownTimer=null;return}
      let rem=a.getCooldownRemaining();
      if(rem>0){
        box.style.display="block";
        box.innerHTML=`<div class="lfb-card" style="background:rgba(245,158,11,.1); border-color:rgba(245,158,11,.35); margin:0; font-size:12px; color:#fde68a; display:flex; align-items:center; justify-content:space-between;"><span><i class="fas fa-hourglass-half"></i> وقت الانتظار قبل الإرسال القادم:</span><b style="font-family:monospace; font-size:13.5px; color:#fbbf24;">${a.formatCountdown(rem)}</b></div>`;
        btn.disabled=!0;
        btn.innerHTML=`<i class="fas fa-clock"></i> انتظر ${a.formatCountdown(rem)}`
      }else{
        box.style.display="none";
        btn.disabled=!1;
        btn.innerHTML='<i class="fas fa-paper-plane"></i> إرسال للإدارة';
        clearInterval(t.cooldownTimer);t.cooldownTimer=null
      }
    };
    tick();
    if(a.getCooldownRemaining()>0){
      clearInterval(t.cooldownTimer);
      t.cooldownTimer=setInterval(tick,1e3)
    }
  },
  submitTicket(){
    a.detectIdentity();
    if(!t.myKey)return memberUI.renderForm();
    if(!t.db)return ui.showToast("⏳ جاري الاتصال بقاعدة البيانات...");
    if(!1===t.settings.enabled||a.isActiveBan(t.myBan))return memberUI.renderForm();
    let rem=a.getCooldownRemaining();
    if(rem>0)return ui.showToast(`⏳ يرجى الانتظار ${a.formatCountdown(rem)} قبل إرسال رسالة جديدة`);
    let lim=Number(t.settings.dailyLimit)||0;
    if(lim>0&&!a.isBypassed()&&a.getDailyCount()>=lim){
      return ui.showToast(`⚠️ وصلت للحد اليومي (${lim} رسائل خلال 24 ساعة)`)
    }
    let minL=Number(t.settings.minLength)||10,maxL=Number(t.settings.maxLength)||800;
    let subj=(document.getElementById("lfb-f-subj")?.value||"").trim();
    let msg=(document.getElementById("lfb-f-msg")?.value||"").trim();
    let cat=document.getElementById("lfb-f-cat")?.value||"أخرى";
    let prio=document.getElementById("lfb-f-prio")?.value||"normal";
    let targetUser="complaint"===memberUI.selectedType?(document.getElementById("lfb-f-target")?.value||"").trim():"";
    let attach=(document.getElementById("lfb-f-attach")?.value||"").trim();
    if(msg.length<minL)return ui.showToast(`⚠️ يرجى كتابة تفاصيل أكثر (${minL} أحرف على الأقل)`);
    if(msg.length>maxL)return ui.showToast(`⚠️ الحد الأقصى هو ${maxL} حرف`);
    if(attach&&!a.isSafeUrl(attach))return ui.showToast("⚠️ رابط الدليل يجب أن يبدأ بـ https://");
    let bad=a.findBlockedWord(subj+" "+msg);
    if(bad)return ui.showToast("🚫 تحتوي رسالتك على ألفاظ غير مسموح بها");
    let btn=document.getElementById("lfb-f-submit");
    btn&&(btn.disabled=!0,btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...');
    let ref=t.db.ref(`${e.rootPath}/tickets`).push();
    let id=ref.key,code=a.genCode(),now=Date.now();
    let autoOn=Boolean(t.settings.autoReplyEnabled&&(t.settings.autoReplyText||"").trim());
    let initMsgs={};
    if(autoOn){
      initMsgs.m_auto={senderRole:"system",sender:"رد تلقائي",text:t.settings.autoReplyText.trim(),ts:now+1}
    }
    let ticket={
      id,code,
      userKey:t.myKey,
      username:t.myUsername,
      displayName:t.myDisplayName||t.myUsername,
      type:memberUI.selectedType,
      category:cat,
      priority:prio,
      targetUser:targetUser||null,
      attachmentUrl:attach||null,
      subject:subj||"",
      message:msg,
      status:"new",
      createdAt:now,
      updatedAt:now,
      claimedBy:null,
      adminReply:null,
      adminReplyBy:null,
      adminReplyAt:null,
      userReadReply:!0,
      adminReadFollowup:!1,
      locked:!1,
      rating:null,
      honorBadge:null,
      adminNote:null,
      tag:null,
      pinned:!1,
      archived:!1,
      publicId:null,
      messages:autoOn?initMsgs:null
    };
    let userMirror={
      id,code,type:ticket.type,category:cat,priority:prio,
      targetUser:ticket.targetUser,attachmentUrl:ticket.attachmentUrl,
      subject:ticket.subject,message:msg,status:"new",
      createdAt:now,updatedAt:now,adminReply:null,adminReplyAt:null,
      userReadReply:!0,locked:!1,rating:null,honorBadge:null,
      messages:autoOn?initMsgs:null
    };
    let codeMirror={
      code,type:ticket.type,category:cat,subject:ticket.subject,status:"new",
      createdAt:now,adminReply:null,adminReplyAt:null
    };
    let updates={};
    updates[`${e.rootPath}/tickets/${id}`]=ticket;
    updates[`${e.rootPath}/user_tickets/${t.myKey}/${id}`]=userMirror;
    updates[`${e.rootPath}/codes/${code}`]=codeMirror;
    t.db.ref().update(updates).then(()=>{
      try{localStorage.setItem(e.lastSentPrefix+t.myKey,String(now))}catch{}
      let c=document.getElementById("lfb-uview-send");
      if(c){
        c.innerHTML=`
          <div class="lfb-card" style="text-align:center; padding:22px 14px; border-color:rgba(16,185,129,.4);">
            <div style="font-size:40px; margin-bottom:8px;">✅</div>
            <div style="color:#34d399; font-weight:800; font-size:15.5px; margin-bottom:6px;">تم استلام رسالتك بنجاح!</div>
            <div style="color:#cbd5e1; font-size:12px; margin-bottom:12px; line-height:1.6;">وصلت رسالتك لإدارة شات ليل. يمكنك المتابعة والمحادثة من تبويب (طلباتي) أو عبر رقم التذكرة:</div>
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(0,0,0,.35); border:1px solid rgba(212,175,55,.4); padding:8px 16px; border-radius:12px; margin-bottom:14px;">
              <b style="font-family:monospace; font-size:16px; color:#D4AF37; letter-spacing:1px;">${code}</b>
              <button type="button" id="lfb-copy-code" class="lfb-btn lfb-btn-dark lfb-mini"><i class="fas fa-copy"></i> نسخ</button>
            </div>
            <button type="button" id="lfb-go-mine" class="lfb-btn lfb-btn-gold">الانتقال إلى طلباتي</button>
          </div>`;
        document.getElementById("lfb-copy-code").onclick=()=>{
          navigator.clipboard?navigator.clipboard.writeText(code).then(()=>ui.showToast("📋 تم نسخ رقم التذكرة")):prompt("رقم التذكرة:",code)
        };
        document.getElementById("lfb-go-mine").onclick=()=>memberUI.switchTab("mine")
      }
    }).catch(()=>{
      ui.showToast("❌ تعذر الإرسال، حاول مرة أخرى");
      memberUI.renderForm()
    })
  },
  renderMyTickets(){
    let c=document.getElementById("lfb-uview-mine");
    if(!c)return;
    let tabCnt=document.getElementById("lfb-u-tab-cnt"),uc=a.getUnreadUserCount();
    if(tabCnt){tabCnt.textContent=uc;tabCnt.style.display=uc>0?"inline-flex":"none"}
    let list=Object.values(t.myTickets||{}).filter(Boolean).sort((x,y)=>(y.updatedAt||y.createdAt||0)-(x.updatedAt||x.createdAt||0));
    if(!list.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:30px 10px; font-size:13px;">لم ترسل أي اقتراحات أو شكاوي بعد.</div>';
      return
    }
    c.innerHTML=list.map(x=>{
      let tm=TYPE_META[x.type]||TYPE_META.suggestion;
      let sm=STATUS_META[x.status]||STATUS_META.new;
      let unread=!1===x.userReadReply;
      let msgs=a.getMessagesArray(x),canEdit="new"===x.status&&!x.adminReply;
      return`
        <div class="lfb-card" style="${unread?"border-color:rgba(16,185,129,.6);":""}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap;">
            <div class="lfb-row" style="gap:4px;">
              <span class="lfb-tag ${tm.cls}">${tm.icon} ${tm.label}</span>
              <span class="lfb-tag ${sm.cls}">${sm.label}</span>
              ${unread?'<span class="lfb-tag lfb-tag-red">رد جديد!</span>':""}
              ${x.honorBadge?`<span class="lfb-tag lfb-tag-gold">${a.escapeHTML(x.honorBadge)}</span>`:""}
            </div>
            <span style="font-family:monospace; font-size:11px; color:#D4AF37;">${a.escapeHTML(x.code||"")}</span>
          </div>
          ${x.subject?`<div style="font-size:13px; font-weight:700; color:#f8fafc; margin-bottom:3px;">${a.escapeHTML(x.subject)}</div>`:""}
          <div style="font-size:12px; color:#cbd5e1; white-space:pre-wrap; word-break:break-word; line-height:1.5; max-height:76px; overflow:hidden;">${a.escapeHTML(x.message)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; gap:6px; flex-wrap:wrap;">
            <span style="font-size:10px; color:#64748b;">${a.formatDate(x.createdAt)} • ${msgs.length} رد</span>
            <div class="lfb-row" style="gap:5px;">
              <button type="button" class="lfb-btn lfb-btn-gold lfb-mini lfb-u-open" data-id="${a.escapeHTML(x.id)}" style="width:auto;"><i class="fas fa-comments"></i> فتح والمتابعة</button>
              ${canEdit?`<button type="button" class="lfb-btn lfb-btn-danger lfb-mini lfb-u-cancel" data-id="${a.escapeHTML(x.id)}">سحب</button>`:""}
            </div>
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lfb-u-open").forEach(b=>b.onclick=()=>memberUI.openTicketThread(b.dataset.id));
    c.querySelectorAll(".lfb-u-cancel").forEach(b=>b.onclick=()=>memberUI.withdrawTicket(b.dataset.id));
    if(memberUI.openTicketId&&t.myTickets[memberUI.openTicketId])memberUI.renderUserThreadBody(memberUI.openTicketId)
  },
  openTicketThread(id){
    let x=t.myTickets[id];
    if(!x)return;
    memberUI.openTicketId=id;
    let sub=document.getElementById("layl-feedback-usub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-feedback-usub-modal";
    sub.className="lfb-overlay lfb-sub-overlay";
    sub.innerHTML=`
      <div class="lfb-box lfb-sub-box">
        <div class="lfb-header">
          <div class="lfb-title"><i class="fas fa-ticket-alt"></i> تذكرة ${a.escapeHTML(x.code||"")}</div>
          <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-usub-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lfb-body" id="lfb-usub-body"></div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{if(ev.target===sub){memberUI.openTicketId=null;sub.remove()}});
    document.getElementById("lfb-usub-close").onclick=()=>{memberUI.openTicketId=null;sub.remove()};
    memberUI.renderUserThreadBody(id);
    if(!1===x.userReadReply&&t.db&&t.myKey){
      t.db.ref(`${e.rootPath}/user_tickets/${t.myKey}/${id}/userReadReply`).set(!0).catch(()=>{})
    }
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  renderUserThreadBody(id){
    let b=document.getElementById("lfb-usub-body"),x=t.myTickets[id];
    if(!b||!x)return;
    let tm=TYPE_META[x.type]||TYPE_META.suggestion,sm=STATUS_META[x.status]||STATUS_META.new;
    let msgs=a.getMessagesArray(x);
    let canReply=!1!==t.settings.allowFollowUp&&!x.locked&&"closed"!==x.status&&"rejected"!==x.status&&!a.isActiveBan(t.myBan);
    let canRate=!1!==t.settings.allowRating&&(x.adminReply||"replied"===x.status||"closed"===x.status||"implemented"===x.status);
    let attachHtml=x.attachmentUrl&&a.isSafeUrl(x.attachmentUrl)?`<a href="${a.escapeHTML(x.attachmentUrl)}" target="_blank" rel="noopener"><img src="${a.escapeHTML(x.attachmentUrl)}" class="lfb-attach-img" alt="مرفق"></a>`:"";
    let threadHtml=msgs.length?msgs.map(m=>{
      let cls="admin"===m.senderRole?"lfb-msg-admin":"system"===m.senderRole?"lfb-msg-sys":"lfb-msg-user";
      let who="admin"===m.senderRole?"الإدارة":"system"===m.senderRole?"النظام":"أنت";
      return`<div class="lfb-msg ${cls}"><div class="lfb-msg-meta"><b>${who}</b><span>${a.formatDate(m.ts)}</span></div>${a.escapeHTML(m.text)}</div>`
    }).join(""):'<div style="text-align:center; color:#64748b; font-size:11.5px; padding:12px;">بانتظار مراجعة الإدارة...</div>';
    let ratingHtml=canRate?`
      <div class="lfb-card" style="text-align:center; margin-top:8px;">
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:5px;">${x.rating?`تقييمك للرد: <b style="color:#fbbf24;">${x.rating} / 5 ⭐</b>`:"قيّم جودة وسرعة رد الإدارة:"}</div>
        <div class="lfb-stars">${[1,2,3,4,5].map(n=>`<button type="button" class="lfb-star-btn ${(x.rating||0)>=n?"on":""}" data-star="${n}">★</button>`).join("")}</div>
      </div>`:"";
    b.innerHTML=`
      <div class="lfb-card" style="background:rgba(0,0,0,.26);">
        <div class="lfb-row" style="gap:4px; margin-bottom:5px;">
          <span class="lfb-tag ${tm.cls}">${tm.icon} ${tm.label}</span>
          <span class="lfb-tag ${sm.cls}">${sm.label}</span>
          <span class="lfb-tag lfb-tag-gray">${a.escapeHTML(x.category||"عام")}</span>
          ${x.honorBadge?`<span class="lfb-tag lfb-tag-gold">${a.escapeHTML(x.honorBadge)}</span>`:""}
        </div>
        ${x.targetUser?`<div style="font-size:11px; color:#fca5a5; margin-bottom:4px;">المشكو ضده: <b>${a.escapeHTML(x.targetUser)}</b></div>`:""}
        ${x.subject?`<div style="font-size:13px; font-weight:700; color:#D4AF37; margin-bottom:4px;">${a.escapeHTML(x.subject)}</div>`:""}
        <div style="font-size:12.5px; color:#f1f5f9; white-space:pre-wrap; word-break:break-word; line-height:1.6;">${a.escapeHTML(x.message)}</div>
        ${attachHtml}
      </div>
      <div class="lfb-label" style="margin-top:6px;"><i class="fas fa-comments"></i> سجل المحادثة والردود</div>
      <div class="lfb-thread" id="lfb-u-thread-box">${threadHtml}</div>
      ${canReply?`
        <div class="lfb-row" style="margin-top:6px;">
          <input type="text" id="lfb-u-followup" class="lfb-input" style="flex:1;" maxlength="400" placeholder="أضف رداً أو توضيحاً للإدارة...">
          <button type="button" id="lfb-u-send-fup" class="lfb-btn lfb-btn-gold" style="width:auto; padding:8px 13px;"><i class="fas fa-paper-plane"></i> إرسال</button>
        </div>`:'<div style="font-size:11px; color:#94a3b8; text-align:center; margin-top:6px;">🔒 الردود مغلقة على هذه التذكرة.</div>'}
      ${ratingHtml}
    `;
    let tb=document.getElementById("lfb-u-thread-box");tb&&(tb.scrollTop=tb.scrollHeight);
    let sendBtn=document.getElementById("lfb-u-send-fup"),inp=document.getElementById("lfb-u-followup");
    if(sendBtn&&inp){
      let go=()=>memberUI.sendFollowUp(id,inp.value);
      sendBtn.onclick=go;
      inp.addEventListener("keydown",ev=>{"Enter"===ev.key&&go()})
    }
    b.querySelectorAll(".lfb-star-btn").forEach(st=>st.onclick=()=>memberUI.rateTicket(id,Number(st.dataset.star)))
  },
  sendFollowUp(id,raw){
    if(!t.db||!t.myKey)return;
    let txt=(raw||"").trim();
    if(txt.length<2)return ui.showToast("اكتب رسالة قبل الإرسال");
    if(a.findBlockedWord(txt))return ui.showToast("🚫 تحتوي الرسالة على ألفاظ غير مسموح بها");
    let now=Date.now(),mKey="m_"+now+"_"+Math.floor(Math.random()*999);
    let msgObj={senderRole:"user",sender:t.myDisplayName||t.myUsername,text:txt,ts:now};
    let updates={};
    updates[`${e.rootPath}/tickets/${id}/messages/${mKey}`]=msgObj;
    updates[`${e.rootPath}/tickets/${id}/updatedAt`]=now;
    updates[`${e.rootPath}/tickets/${id}/adminReadFollowup`]=!0;
    updates[`${e.rootPath}/user_tickets/${t.myKey}/${id}/messages/${mKey}`]=msgObj;
    updates[`${e.rootPath}/user_tickets/${t.myKey}/${id}/updatedAt`]=now;
    t.db.ref().update(updates).then(()=>{ui.showToast("✅ تم إرسال متابعتك للإدارة")}).catch(()=>ui.showToast("❌ فشل الإرسال"))
  },
  rateTicket(id,stars){
    if(!t.db||!t.myKey||stars<1||stars>5)return;
    let updates={};
    updates[`${e.rootPath}/tickets/${id}/rating`]=stars;
    updates[`${e.rootPath}/user_tickets/${t.myKey}/${id}/rating`]=stars;
    t.db.ref().update(updates).then(()=>ui.showToast(`⭐ شكراً لتقييمك (${stars}/5)`))
  },
  withdrawTicket(id){
    let x=t.myTickets[id];
    if(!t.db||!t.myKey||!x||"new"!==x.status||x.adminReply)return;
    if(!confirm("سحب وحذف هذا الطلب قبل مراجعته؟"))return;
    let updates={};
    updates[`${e.rootPath}/tickets/${id}`]=null;
    updates[`${e.rootPath}/user_tickets/${t.myKey}/${id}`]=null;
    if(x.code)updates[`${e.rootPath}/codes/${x.code}`]=null;
    t.db.ref().update(updates).then(()=>ui.showToast("🗑️ تم سحب الطلب بنجاح"))
  },
  renderPublicBoard(){
    let c=document.getElementById("lfb-uview-public");
    if(!c)return;
    let list=Object.values(t.publicIdeas||{}).filter(Boolean).sort((x,y)=>{
      if(x.pinned!==y.pinned)return x.pinned?-1:1;
      let vx=Object.keys(x.votes||{}).length,vy=Object.keys(y.votes||{}).length;
      if(vy!==vx)return vy-vx;
      return(y.createdAt||0)-(x.createdAt||0)
    });
    if(!list.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:30px 10px; font-size:12.5px;">لا توجد اقتراحات منشورة للتصويت حالياً. شاركنا فكرتك لتظهر هنا! 💡</div>';
      return
    }
    c.innerHTML=`<div style="font-size:11px; color:#94a3b8; margin-bottom:8px;">صوّت لأفضل الاقتراحات المعتمدة من الإدارة لتعطى الأولوية في التحديثات القادمة:</div>`+list.map(it=>{
      let votes=it.votes||{},cnt=Object.keys(votes).length,voted=Boolean(t.myKey&&votes[t.myKey]);
      let rm=ROADMAP_META[it.roadmapStatus]||ROADMAP_META.studying;
      return`
        <div class="lfb-card" style="${it.pinned?"border-color:rgba(212,175,55,.45);":""}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div style="flex:1; min-width:0;">
              <div class="lfb-row" style="gap:4px; margin-bottom:4px;">
                ${it.pinned?'<span class="lfb-tag lfb-tag-gold">📌 مميز</span>':""}
                <span class="lfb-tag ${rm.cls}">${rm.label}</span>
                <span class="lfb-tag lfb-tag-gray">${a.escapeHTML(it.category||"عام")}</span>
              </div>
              <div style="font-size:13.5px; font-weight:800; color:#f8fafc; margin-bottom:3px;">${a.escapeHTML(it.title||"اقتراح")}</div>
              <div style="font-size:12px; color:#cbd5e1; line-height:1.55; white-space:pre-wrap;">${a.escapeHTML(it.summary||"")}</div>
              <div style="font-size:10px; color:#64748b; margin-top:5px;">${it.showAuthor&&it.authorDisplay?`بواسطة: <b style="color:#7dd3fc;">${a.escapeHTML(it.authorDisplay)}</b> • `:""}${a.formatDate(it.createdAt)}</div>
            </div>
            <button type="button" class="lfb-vote-btn ${voted?"voted":""} lfb-do-vote" data-id="${a.escapeHTML(it.id)}">👍 <span>${cnt}</span></button>
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lfb-do-vote").forEach(b=>b.onclick=()=>memberUI.toggleVote(b.dataset.id))
  },
  toggleVote(ideaId){
    a.detectIdentity();
    if(!t.myKey)return ui.showToast("🔐 سجّل دخولك أولاً للتصويت");
    if(!t.db)return;
    let it=t.publicIdeas[ideaId];
    if(!it)return;
    let voted=Boolean(it.votes&&it.votes[t.myKey]);
    t.db.ref(`${e.rootPath}/public_ideas/${ideaId}/votes/${t.myKey}`).set(voted?null:!0).then(()=>{
      ui.showToast(voted?"تم سحب تصويتك":"👍 تم تسجيل تصويتك للاقتراح!")
    }).catch(()=>ui.showToast("❌ تعذر التصويت"))
  },
  markRepliesRead(){
    if(!t.db||!t.myKey)return;
    let updates={},has=!1;
    Object.values(t.myTickets||{}).forEach(x=>{
      if(x&&x.id&&!1===x.userReadReply){
        updates[`${e.rootPath}/user_tickets/${t.myKey}/${x.id}/userReadReply`]=!0;
        has=!0
      }
    });
    has&&t.db.ref().update(updates).catch(()=>{})
  },
  lookupByCode(){
    let inp=document.getElementById("lfb-track-inp"),res=document.getElementById("lfb-track-res");
    if(!inp||!res||!t.db)return;
    let code=inp.value.trim().toUpperCase().replace(/^#/,"");
    if(!/^[A-Z0-9-]{4,16}$/.test(code)){
      res.innerHTML='<div style="color:#f87171; font-size:12px;">أدخل رقم تذكرة صحيح (مثل LY-XXXXX).</div>';
      return
    }
    res.innerHTML='<div style="color:#D4AF37; font-size:12px; text-align:center; padding:10px;"><i class="fas fa-spinner fa-spin"></i> جاري البحث...</div>';
    t.db.ref(`${e.rootPath}/codes/${code}`).once("value").then(snap=>{
      let d=snap.val();
      if(!d){res.innerHTML='<div style="color:#94a3b8; font-size:12px; text-align:center; padding:10px;">لم يتم العثور على تذكرة بهذا الرقم.</div>';return}
      let tm=TYPE_META[d.type]||TYPE_META.suggestion,sm=STATUS_META[d.status]||STATUS_META.new;
      res.innerHTML=`
        <div class="lfb-card" style="background:rgba(0,0,0,.28); margin-top:6px;">
          <div class="lfb-row" style="justify-content:space-between; margin-bottom:6px;">
            <div class="lfb-row" style="gap:4px;"><span class="lfb-tag ${tm.cls}">${tm.icon} ${tm.label}</span><span class="lfb-tag ${sm.cls}">${sm.label}</span></div>
            <span style="font-size:10.5px; color:#94a3b8;">${a.formatDate(d.createdAt)}</span>
          </div>
          ${d.subject?`<div style="font-size:12.5px; font-weight:700; margin-bottom:4px;">${a.escapeHTML(d.subject)}</div>`:""}
          ${d.adminReply?`<div class="lfb-reply-box"><b style="color:#34d399; font-size:11px; display:block; margin-bottom:4px;">رد الإدارة (${a.formatDate(d.adminReplyAt)}):</b><div style="white-space:pre-wrap;">${a.escapeHTML(d.adminReply)}</div></div>`:'<div style="font-size:11.5px; color:#94a3b8;">لم يصدر رد من الإدارة حتى الآن.</div>'}
        </div>`
    }).catch(()=>{res.innerHTML='<div style="color:#f87171; font-size:12px;">تعذر الاتصال بالقاعدة.</div>'})
  }
};
const adminUI={
  activeTab:"inbox",
  selectMode:!1,
  selectedIds:new Set,
  openTicketId:null,
  logAction(action,target,details){
    if(!t.db)return;
    t.db.ref(`${e.rootPath}/logs`).push({
      admin:t.myUsername||"الإدارة",
      action:action||"",
      target:target||"-",
      details:details||"",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).catch(()=>{})
  },
  open(){
    a.detectIdentity();
    if(!a.isAdmin())return alert("هذه اللوحة متاحة للإدارة فقط.");
    sync.syncAdminRole();
    let ov=document.getElementById("layl-feedback-admin-modal");
    ov&&ov.remove();
    adminUI.selectMode=!1;
    adminUI.selectedIds.clear();
    adminUI.openTicketId=null;
    ov=document.createElement("div");
    ov.id="layl-feedback-admin-modal";
    ov.className="lfb-overlay";
    ov.innerHTML=`
      <div class="lfb-box lfb-admin-box">
        <div class="lfb-header">
          <div class="lfb-title"><i class="fas fa-inbox"></i> لوحة تحكم الاقتراحات والشكاوي</div>
          <div class="lfb-row" style="gap:6px;">
            <button type="button" class="lfb-ctrl-btn" id="lfb-a-export" title="تصدير نسخة احتياطية JSON"><i class="fas fa-download"></i></button>
            <button type="button" class="lfb-ctrl-btn" id="lfb-a-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
            <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-a-close" title="إغلاق"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lfb-stats">
          <div class="lfb-stat"><div class="lfb-stat-val" id="lfb-st-new" style="color:#f87171;">0</div><div class="lfb-stat-lbl">جديد / متابعة</div></div>
          <div class="lfb-stat"><div class="lfb-stat-val" id="lfb-st-rev" style="color:#fbbf24;">0</div><div class="lfb-stat-lbl">قيد المراجعة</div></div>
          <div class="lfb-stat"><div class="lfb-stat-val" id="lfb-st-all">0</div><div class="lfb-stat-lbl">إجمالي التذاكر</div></div>
          <div class="lfb-stat"><div class="lfb-stat-val" id="lfb-st-mode" style="color:#34d399;">مفتوح</div><div class="lfb-stat-lbl">حالة الصندوق</div></div>
        </div>
        <div class="lfb-tabs">
          <button type="button" class="lfb-tab active" data-atab="inbox"><i class="fas fa-envelope"></i> الوارد</button>
          <button type="button" class="lfb-tab" data-atab="public"><i class="fas fa-lightbulb"></i> ساحة التصويت</button>
          <button type="button" class="lfb-tab" data-atab="templates"><i class="fas fa-bolt"></i> الردود الجاهزة</button>
          <button type="button" class="lfb-tab" data-atab="bans"><i class="fas fa-user-shield"></i> الحظر و VIP</button>
          <button type="button" class="lfb-tab" data-atab="stats"><i class="fas fa-chart-bar"></i> الإحصائيات والرادار</button>
          <button type="button" class="lfb-tab" data-atab="logs"><i class="fas fa-history"></i> السجل</button>
          <button type="button" class="lfb-tab" data-atab="settings"><i class="fas fa-cog"></i> إعدادات وصيانة</button>
        </div>
        <div class="lfb-body">
          <div id="lfb-aview-inbox" class="lfb-view active">
            <div class="lfb-row" style="margin-bottom:7px;">
              <input type="text" id="lfb-a-search" class="lfb-input" style="flex:1; min-width:130px;" placeholder="🔍 ابحث بالعضو، المشكو ضده، التذكرة، النص أو الوسم..." autocomplete="off">
              <select id="lfb-a-ftype" class="lfb-input" style="width:105px;">
                <option value="all">كل الأنواع</option>
                <option value="suggestion">💡 اقتراح</option>
                <option value="complaint">🛡️ شكوى</option>
                <option value="technical">🛠️ عطل تقني</option>
              </select>
              <select id="lfb-a-fstatus" class="lfb-input" style="width:125px;">
                <option value="active">النشط (الكل)</option>
                <option value="new">🔴 جديد فقط</option>
                <option value="followup">💬 متابعة جديدة</option>
                <option value="review">🟡 قيد المراجعة</option>
                <option value="replied">🟢 تم الرد</option>
                <option value="implemented">✅ تم التنفيذ</option>
                <option value="rejected">✖️ مرفوض</option>
                <option value="closed">⚫ مغلق</option>
                <option value="pinned">📌 المثبتة</option>
                <option value="mine">👤 مستلمة مني</option>
                <option value="archived">📦 الأرشيف</option>
              </select>
              <select id="lfb-a-sort" class="lfb-input" style="width:105px;">
                <option value="newest">الأحدث تحديثاً</option>
                <option value="created">الأحدث إرسالاً</option>
                <option value="oldest">الأقدم</option>
                <option value="priority">الأكثر استعجالاً</option>
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; gap:6px; flex-wrap:wrap;">
              <div id="lfb-a-count" style="font-size:11px; color:#94a3b8;"></div>
              <div class="lfb-row" style="gap:5px;">
                <button type="button" id="lfb-a-clear-search" class="lfb-btn lfb-btn-dark lfb-mini" style="display:none;"><i class="fas fa-times"></i> إلغاء البحث</button>
                <button type="button" id="lfb-a-toggle-sel" class="lfb-btn lfb-btn-dark lfb-mini"><i class="fas fa-check-square"></i> تحديد متعدد</button>
              </div>
            </div>
            <div id="lfb-a-batch" style="display:none;"></div>
            <div id="lfb-a-list"></div>
          </div>

          <div id="lfb-aview-public" class="lfb-view">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px; flex-wrap:wrap;">
              <span style="font-size:12px; color:#cbd5e1; font-weight:700;">الاقتراحات المنشورة للتصويت العام</span>
              <button type="button" id="lfb-pub-new" class="lfb-btn lfb-btn-gold lfb-mini" style="width:auto;"><i class="fas fa-plus"></i> نشر اقتراح مباشر للتصويت</button>
            </div>
            <div id="lfb-pub-list"></div>
          </div>

          <div id="lfb-aview-templates" class="lfb-view">
            <div class="lfb-card">
              <div class="lfb-card-title"><span><i class="fas fa-plus-circle"></i> إضافة قالب رد سريع</span></div>
              <div style="margin-bottom:7px;"><label class="lfb-label">عنوان القالب</label><input type="text" id="lfb-tpl-title" class="lfb-input" maxlength="40" placeholder="مثلاً: قبول اقتراح / طلب توضيح"></div>
              <div style="margin-bottom:8px;"><label class="lfb-label">نص الرد</label><textarea id="lfb-tpl-text" class="lfb-input" rows="2" style="resize:vertical;" placeholder="اكتب الرد الجاهز..."></textarea></div>
              <button type="button" id="lfb-tpl-add" class="lfb-btn lfb-btn-gold"><i class="fas fa-save"></i> حفظ القالب</button>
            </div>
            <div id="lfb-tpl-list"></div>
          </div>

          <div id="lfb-aview-bans" class="lfb-view">
            <div class="lfb-card" style="border-color:rgba(239,68,68,.35);">
              <div class="lfb-card-title" style="color:#fca5a5;"><span><i class="fas fa-user-slash"></i> حظر عضو من إرسال الاقتراحات والشكاوي</span></div>
              <div class="lfb-grid-2" style="margin-bottom:7px;">
                <div><label class="lfb-label">اسم المستخدم (Username)</label><input type="text" id="lfb-ban-user" class="lfb-input" placeholder="Username..." autocomplete="off"></div>
                <div>
                  <label class="lfb-label">مدة الحظر</label>
                  <select id="lfb-ban-dur" class="lfb-input">
                    <option value="1">ساعة واحدة</option>
                    <option value="24" selected>24 ساعة (يوم)</option>
                    <option value="72">3 أيام</option>
                    <option value="168">أسبوع (7 أيام)</option>
                    <option value="720">شهر (30 يوم)</option>
                    <option value="0">حظر دائم</option>
                  </select>
                </div>
              </div>
              <div style="margin-bottom:8px;"><label class="lfb-label">سبب الحظر (يظهر للعضو)</label><input type="text" id="lfb-ban-reason" class="lfb-input" placeholder="مثلاً: إرسال بلاغات كيدية أو سبام"></div>
              <button type="button" id="lfb-ban-exec" class="lfb-btn lfb-btn-crimson"><i class="fas fa-ban"></i> تطبيق الحظر الآن</button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
              <span style="font-size:11.5px; color:#cbd5e1; font-weight:700;">قائمة المحظورين</span>
              <button type="button" id="lfb-ban-clean-exp" class="lfb-btn lfb-btn-dark lfb-mini"><i class="fas fa-broom"></i> حذف المنتهية</button>
            </div>
            <div id="lfb-bans-list" style="margin-bottom:12px;"></div>

            <div class="lfb-card" style="border-color:rgba(212,175,55,.32);">
              <div class="lfb-card-title"><span><i class="fas fa-star"></i> قائمة استثناء VIP (تجاوز وقت الانتظار والحد اليومي)</span></div>
              <div class="lfb-row" style="margin-bottom:8px;">
                <input type="text" id="lfb-vip-inp" class="lfb-input" style="flex:1;" placeholder="اسم العضو للاستثناء (Username)..." autocomplete="off">
                <button type="button" id="lfb-vip-add" class="lfb-btn lfb-btn-success" style="padding:8px 12px;"><i class="fas fa-plus"></i> إضافة</button>
              </div>
              <div id="lfb-vip-list" class="lfb-row" style="gap:5px;"></div>
            </div>
          </div>

          <div id="lfb-aview-stats" class="lfb-view">
            <div id="lfb-stats-body"></div>
          </div>

          <div id="lfb-aview-logs" class="lfb-view">
            <div class="lfb-row" style="margin-bottom:8px;">
              <input type="text" id="lfb-log-search" class="lfb-input" style="flex:1;" placeholder="🔍 ابحث في سجل العمليات..." autocomplete="off">
              <button type="button" id="lfb-log-export" class="lfb-btn lfb-btn-info lfb-mini" style="padding:8px 10px;"><i class="fas fa-file-export"></i> تصدير</button>
              <button type="button" id="lfb-log-clear" class="lfb-btn lfb-btn-danger lfb-mini" style="padding:8px 10px;"><i class="fas fa-trash"></i> مسح</button>
            </div>
            <div id="lfb-logs-list"></div>
          </div>

          <div id="lfb-aview-settings" class="lfb-view">
            <div class="lfb-setting-row">
              <div><div style="font-size:12.5px; font-weight:700;">فتح صندوق الاقتراحات والشكاوي</div><div style="font-size:10.5px; color:#94a3b8;">إيقافه يمنع الإرسال الجديد ويُظهر رسالة الصيانة</div></div>
              <label class="lfb-switch"><input type="checkbox" id="lfb-s-enabled"><span class="lfb-slider"></span></label>
            </div>
            <div class="lfb-setting-row">
              <div><div style="font-size:12px; font-weight:700;">استثناء الإدارة من وقت الانتظار والحد اليومي</div><div style="font-size:10.5px; color:#94a3b8;">يسمح للمشرفين بالتجربة والإرسال فوراً</div></div>
              <label class="lfb-switch"><input type="checkbox" id="lfb-s-admbypass"><span class="lfb-slider"></span></label>
            </div>
            <div class="lfb-grid-3" style="margin-bottom:7px;">
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-sug" class="lfb-chk"> 💡 الاقتراحات</label>
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-cmp" class="lfb-chk"> 🛡️ الشكاوي</label>
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-tec" class="lfb-chk"> 🛠️ أعطال تقنية</label>
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-pub" class="lfb-chk"> 🗳️ ساحة التصويت</label>
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-fup" class="lfb-chk"> 💬 ردود المتابعة</label>
              <label class="lfb-card" style="margin:0; padding:8px; display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="lfb-s-rat" class="lfb-chk"> ⭐ تقييم الردود</label>
            </div>
            <div class="lfb-grid-2" style="margin-bottom:8px;">
              <div><label class="lfb-label">وقت الانتظار (دقيقة)</label><input type="number" id="lfb-s-cool" class="lfb-input" min="0" max="1440"></div>
              <div><label class="lfb-label">الحد اليومي (0 = مفتوح)</label><input type="number" id="lfb-s-dlim" class="lfb-input" min="0" max="100"></div>
              <div><label class="lfb-label">أدنى طول للرسالة (حرف)</label><input type="number" id="lfb-s-minl" class="lfb-input" min="3" max="200"></div>
              <div><label class="lfb-label">أقصى طول للرسالة (حرف)</label><input type="number" id="lfb-s-maxl" class="lfb-input" min="100" max="3000"></div>
            </div>
            <div class="lfb-card" style="border-color:rgba(56,189,248,.25);">
              <div class="lfb-card-title" style="color:#7dd3fc;"><span><i class="fas fa-bullhorn"></i> شريط إعلان علوي داخل نافذة الأعضاء</span></div>
              <div class="lfb-row" style="margin-bottom:5px;">
                <input type="text" id="lfb-s-bantxt" class="lfb-input" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                <select id="lfb-s-bantype" class="lfb-input" style="width:105px;">
                  <option value="info">📢 معلومة</option>
                  <option value="warn">⚠️ تنبيه</option>
                  <option value="success">✅ خبر سار</option>
                </select>
              </div>
            </div>
            <div class="lfb-card">
              <div class="lfb-setting-row" style="margin-bottom:6px; padding:6px 9px;">
                <span style="font-size:12px; font-weight:700;">🤖 تفعيل الرد التلقائي الفوري عند الاستلام</span>
                <label class="lfb-switch"><input type="checkbox" id="lfb-s-auto"><span class="lfb-slider"></span></label>
              </div>
              <input type="text" id="lfb-s-autotxt" class="lfb-input" placeholder="نص الرد التلقائي...">
            </div>
            <div style="margin-bottom:8px;">
              <label class="lfb-label">التصنيفات المتاحة (مفصولة بفاصلة)</label>
              <input type="text" id="lfb-s-cats" class="lfb-input">
            </div>
            <div style="margin-bottom:8px;">
              <label class="lfb-label">فلتر الكلمات الممنوعة (مفصولة بفاصلة — يمنع الإرسال تلقائياً)</label>
              <textarea id="lfb-s-blocked" class="lfb-input" rows="2" style="resize:vertical;" placeholder="كلمة1, كلمة2, ..."></textarea>
            </div>
            <div style="margin-bottom:8px;">
              <label class="lfb-label">رسالة الترحيب والتنويه أعلى النموذج</label>
              <textarea id="lfb-s-notice" class="lfb-input" rows="2" style="resize:vertical;"></textarea>
            </div>
            <div style="margin-bottom:10px;">
              <label class="lfb-label">رسالة إغلاق الصندوق المؤقت</label>
              <input type="text" id="lfb-s-closed" class="lfb-input">
            </div>
            <button type="button" id="lfb-s-save" class="lfb-btn lfb-btn-gold" style="margin-bottom:12px;"><i class="fas fa-save"></i> حفظ جميع الإعدادات</button>

            <div class="lfb-card" style="border-color:rgba(212,175,55,.28);">
              <div class="lfb-card-title"><span><i class="fas fa-user-shield"></i> المشرفون المصرح لهم (admins)</span><span class="lfb-tag lfb-tag-gold" id="lfb-adm-cnt">0</span></div>
              <div class="lfb-row" style="margin-bottom:8px;">
                <input type="text" id="lfb-new-adm" class="lfb-input" style="flex:1;" placeholder="اسم المشرف الجديد (Username)..." autocomplete="off">
                <button type="button" id="lfb-add-adm" class="lfb-btn lfb-btn-success" style="padding:8px 12px;"><i class="fas fa-plus"></i> إضافة</button>
              </div>
              <div id="lfb-adm-list" class="lfb-row" style="gap:5px;"></div>
            </div>

            <div class="lfb-card">
              <div class="lfb-card-title" style="color:#cbd5e1;">
                <span><i class="fas fa-broom"></i> الصيانة وتخفيف الفايربيس</span>
                <span class="lfb-tag lfb-tag-blue" id="lfb-db-size">0 KB</span>
              </div>
              <div class="lfb-grid-2" style="margin-bottom:7px;">
                <button type="button" id="lfb-m-clean-closed" class="lfb-btn lfb-btn-dark"><i class="fas fa-trash-alt"></i> حذف المغلقة والمؤرشفة</button>
                <button type="button" id="lfb-m-clean-old" class="lfb-btn lfb-btn-dark"><i class="fas fa-clock"></i> حذف الأقدم من 30 يوم</button>
                <button type="button" id="lfb-m-export" class="lfb-btn lfb-btn-info"><i class="fas fa-download"></i> تصدير JSON</button>
                <button type="button" id="lfb-m-import" class="lfb-btn lfb-btn-success"><i class="fas fa-upload"></i> استيراد JSON</button>
              </div>
              <button type="button" id="lfb-m-wipe" class="lfb-btn lfb-btn-danger" style="width:100%;"><i class="fas fa-bomb"></i> تصفير وحذف كل التذاكر (مع نسخة احتياطية)</button>
              <input type="file" id="lfb-m-file" accept=".json,application/json" style="display:none;">
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&adminUI.close()});
    document.getElementById("lfb-a-close").onclick=()=>adminUI.close();
    document.getElementById("lfb-a-refresh").onclick=()=>{adminUI.refreshAll();adminUI.loadLogs();ui.showToast("🔄 تم تحديث البيانات")};
    document.getElementById("lfb-a-export").onclick=()=>adminUI.exportBackup();
    ov.querySelectorAll("[data-atab]").forEach(btn=>{btn.onclick=()=>adminUI.switchTab(btn.dataset.atab)});
    document.getElementById("lfb-a-search").oninput=()=>adminUI.renderInbox();
    document.getElementById("lfb-a-ftype").onchange=()=>adminUI.renderInbox();
    document.getElementById("lfb-a-fstatus").onchange=()=>adminUI.renderInbox();
    document.getElementById("lfb-a-sort").onchange=()=>adminUI.renderInbox();
    document.getElementById("lfb-a-clear-search").onclick=()=>{
      document.getElementById("lfb-a-search").value="";
      document.getElementById("lfb-a-ftype").value="all";
      document.getElementById("lfb-a-fstatus").value="active";
      adminUI.renderInbox()
    };
    document.getElementById("lfb-a-toggle-sel").onclick=()=>{
      adminUI.selectMode=!adminUI.selectMode;
      !adminUI.selectMode&&adminUI.selectedIds.clear();
      adminUI.renderInbox()
    };
    document.getElementById("lfb-pub-new").onclick=()=>adminUI.openNewIdeaModal();
    document.getElementById("lfb-tpl-add").onclick=()=>adminUI.addTemplate();
    document.getElementById("lfb-ban-exec").onclick=()=>adminUI.banUserFromForm();
    document.getElementById("lfb-ban-clean-exp").onclick=()=>adminUI.cleanExpiredBans();
    document.getElementById("lfb-vip-add").onclick=()=>adminUI.addVipExempt();
    document.getElementById("lfb-log-search").oninput=()=>adminUI.renderLogs();
    document.getElementById("lfb-log-export").onclick=()=>adminUI.exportLogs();
    document.getElementById("lfb-log-clear").onclick=()=>adminUI.clearLogs();
    document.getElementById("lfb-s-save").onclick=()=>adminUI.saveSettings();
    document.getElementById("lfb-add-adm").onclick=()=>adminUI.addAdminUser();
    document.getElementById("lfb-m-clean-closed").onclick=()=>adminUI.cleanClosedTickets();
    document.getElementById("lfb-m-clean-old").onclick=()=>adminUI.cleanOldTickets(30);
    document.getElementById("lfb-m-export").onclick=()=>adminUI.exportBackup();
    document.getElementById("lfb-m-import").onclick=()=>document.getElementById("lfb-m-file").click();
    document.getElementById("lfb-m-file").onchange=ev=>adminUI.importBackup(ev);
    document.getElementById("lfb-m-wipe").onclick=()=>adminUI.wipeAllTickets();

    adminUI.activeTab="inbox";
    adminUI.populateSettingsUI();
    adminUI.refreshAll();
    adminUI.loadLogs();
    requestAnimationFrame(()=>ov.classList.add("active"))
  },
  close(){
    adminUI.openTicketId=null;
    let sub=document.getElementById("layl-feedback-sub-modal");sub&&sub.remove();
    let ov=document.getElementById("layl-feedback-admin-modal");ov&&ov.remove()
  },
  switchTab(tab){
    let ov=document.getElementById("layl-feedback-admin-modal");
    if(!ov)return;
    adminUI.activeTab=tab;
    ov.querySelectorAll("[data-atab]").forEach(x=>x.classList.toggle("active",x.dataset.atab===tab));
    ov.querySelectorAll(".lfb-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`lfb-aview-${tab}`);
    v&&v.classList.add("active");
    if("inbox"===tab)adminUI.renderInbox();
    else if("public"===tab)adminUI.renderPublicAdmin();
    else if("templates"===tab)adminUI.renderTemplates();
    else if("bans"===tab)adminUI.renderBans();
    else if("stats"===tab)adminUI.renderStats();
    else if("logs"===tab)adminUI.loadLogs();
    else if("settings"===tab)adminUI.populateSettingsUI()
  },
  refreshAll(){
    if(!document.getElementById("layl-feedback-admin-modal"))return;
    adminUI.updateStatsBar();
    if("inbox"===adminUI.activeTab)adminUI.renderInbox();
    else if("public"===adminUI.activeTab)adminUI.renderPublicAdmin();
    else if("templates"===adminUI.activeTab)adminUI.renderTemplates();
    else if("bans"===adminUI.activeTab)adminUI.renderBans();
    else if("stats"===adminUI.activeTab)adminUI.renderStats();
    else if("settings"===adminUI.activeTab)adminUI.populateSettingsUI();
    if(adminUI.openTicketId&&t.allTickets[adminUI.openTicketId]&&document.getElementById("lfb-asub-thread")){
      adminUI.renderAdminThreadOnly(adminUI.openTicketId)
    }
  },
  updateStatsBar(){
    if(!document.getElementById("lfb-st-new"))return;
    let all=Object.values(t.allTickets||{}).filter(Boolean),nw=0,rv=0;
    all.forEach(x=>{
      if(x.archived)return;
      if("new"===x.status||!0===x.adminReadFollowup)nw++;
      else if("review"===x.status)rv++
    });
    document.getElementById("lfb-st-new").textContent=nw;
    document.getElementById("lfb-st-rev").textContent=rv;
    document.getElementById("lfb-st-all").textContent=all.length;
    let m=document.getElementById("lfb-st-mode");
    if(!1===t.settings.enabled){m.textContent="مغلق";m.style.color="#f87171"}
    else{m.textContent="مفتوح";m.style.color="#34d399"}
  },
  getTargetComplaintCounts(){
    let map={};
    Object.values(t.allTickets||{}).forEach(x=>{
      if(x&&"complaint"===x.type&&x.targetUser){
        let k=x.targetUser.trim().toLowerCase();
        k&&(map[k]=(map[k]||0)+1)
      }
    });
    return map
  },
  renderInbox(){
    let c=document.getElementById("lfb-a-list"),cntEl=document.getElementById("lfb-a-count"),bw=document.getElementById("lfb-a-batch");
    if(!c)return;
    let q=(document.getElementById("lfb-a-search")?.value||"").trim().toLowerCase();
    let fType=document.getElementById("lfb-a-ftype")?.value||"all";
    let fStat=document.getElementById("lfb-a-fstatus")?.value||"active";
    let srt=document.getElementById("lfb-a-sort")?.value||"newest";
    let clrBtn=document.getElementById("lfb-a-clear-search");
    clrBtn&&(clrBtn.style.display=(q||"all"!==fType||"active"!==fStat)?"inline-flex":"none");
    let all=Object.values(t.allTickets||{}).filter(Boolean);
    let userCounts={},targetCounts=adminUI.getTargetComplaintCounts();
    all.forEach(x=>{let k=x.userKey||x.username||"";k&&(userCounts[k]=(userCounts[k]||0)+1)});
    let list=all.filter(x=>{
      if("archived"===fStat){if(!x.archived)return!1}
      else{
        if(x.archived)return!1;
        if("pinned"===fStat&&!x.pinned)return!1;
        else if("followup"===fStat&&!x.adminReadFollowup)return!1;
        else if("mine"===fStat&&x.claimedBy!==t.myUsername)return!1;
        else if(["new","review","replied","implemented","rejected","closed"].includes(fStat)&&x.status!==fStat)return!1
      }
      if("all"!==fType&&x.type!==fType)return!1;
      if(q){
        let hay=`${x.code||""} ${x.username||""} ${x.displayName||""} ${x.targetUser||""} ${x.category||""} ${x.subject||""} ${x.message||""} ${x.adminNote||""} ${x.adminReply||""} ${x.tag||""}`.toLowerCase();
        if(!hay.includes(q))return!1
      }
      return!0
    });
    let prioRank={urgent:3,important:2,normal:1};
    list.sort((x,y)=>{
      if(x.pinned!==y.pinned)return x.pinned?-1:1;
      if("oldest"===srt)return(x.createdAt||0)-(y.createdAt||0);
      if("created"===srt)return(y.createdAt||0)-(x.createdAt||0);
      if("priority"===srt){
        let dp=(prioRank[y.priority]||1)-(prioRank[x.priority]||1);
        if(0!==dp)return dp
      }
      return(y.updatedAt||y.createdAt||0)-(x.updatedAt||x.createdAt||0)
    });
    let shown=list.slice(0,100);
    cntEl&&(cntEl.textContent=`عرض ${shown.length} من أصل ${list.length} تذكرة`);
    let selBtn=document.getElementById("lfb-a-toggle-sel");
    if(selBtn){
      selBtn.className=`lfb-btn lfb-mini ${adminUI.selectMode?"lfb-btn-gold":"lfb-btn-dark"}`;
      selBtn.style.width="auto";
      selBtn.innerHTML=adminUI.selectMode?'<i class="fas fa-times"></i> إلغاء التحديد':'<i class="fas fa-check-square"></i> تحديد متعدد'
    }
    if(bw){
      if(adminUI.selectMode){
        bw.style.display="block";
        bw.innerHTML=`
          <div class="lfb-batch-bar">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
              <span>المحدّد: <b style="color:#D4AF37;">${adminUI.selectedIds.size}</b> تذكرة</span>
              <div class="lfb-row" style="gap:4px;">
                <button type="button" id="lfb-b-all" class="lfb-btn lfb-btn-dark lfb-mini">تحديد المعروض</button>
                <button type="button" id="lfb-b-clr" class="lfb-btn lfb-btn-dark lfb-mini">إفراغ</button>
              </div>
            </div>
            <div class="lfb-row" style="gap:4px;">
              <button type="button" id="lfb-b-rev" class="lfb-btn lfb-btn-warn lfb-mini">قيد المراجعة</button>
              <button type="button" id="lfb-b-imp" class="lfb-btn lfb-btn-success lfb-mini">✅ تم التنفيذ</button>
              <button type="button" id="lfb-b-cls" class="lfb-btn lfb-btn-info lfb-mini">إغلاق</button>
              <button type="button" id="lfb-b-arc" class="lfb-btn lfb-btn-dark lfb-mini">📦 أرشفة</button>
              <button type="button" id="lfb-b-del" class="lfb-btn lfb-btn-danger lfb-mini">🗑️ حذف نهائي</button>
            </div>
          </div>`;
        document.getElementById("lfb-b-all").onclick=()=>{shown.forEach(x=>adminUI.selectedIds.add(x.id));adminUI.renderInbox()};
        document.getElementById("lfb-b-clr").onclick=()=>{adminUI.selectedIds.clear();adminUI.renderInbox()};
        document.getElementById("lfb-b-rev").onclick=()=>adminUI.batchStatus("review");
        document.getElementById("lfb-b-imp").onclick=()=>adminUI.batchStatus("implemented");
        document.getElementById("lfb-b-cls").onclick=()=>adminUI.batchStatus("closed");
        document.getElementById("lfb-b-arc").onclick=()=>adminUI.batchArchive(!0);
        document.getElementById("lfb-b-del").onclick=()=>adminUI.batchDelete()
      }else{bw.style.display="none";bw.innerHTML=""}
    }
    if(!shown.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:28px;">لا توجد تذاكر مطابقة حالياً.</div>';
      return
    }
    c.innerHTML=shown.map(x=>{
      let tm=TYPE_META[x.type]||TYPE_META.suggestion;
      let sm=STATUS_META[x.status]||STATUS_META.new;
      let pm=PRIO_META[x.priority]||PRIO_META.normal;
      let uKey=x.userKey||a.sanitizeName(x.username||"");
      let isBanned=uKey&&a.isActiveBan(t.bans[uKey]);
      let uTotal=userCounts[uKey]||1;
      let tKey=x.targetUser?x.targetUser.trim().toLowerCase():"";
      let tCount=tKey?(targetCounts[tKey]||0):0;
      let chk=adminUI.selectMode?`<input type="checkbox" class="lfb-chk lfb-row-chk" data-id="${a.escapeHTML(x.id)}" ${adminUI.selectedIds.has(x.id)?"checked":""}>`:"";
      let borderStyle=adminUI.selectedIds.has(x.id)?"border-color:rgba(212,175,55,.7); background:rgba(212,175,55,.06);":x.adminReadFollowup?"border-color:rgba(56,189,248,.6);":x.pinned?"border-color:rgba(212,175,55,.45);":"new"===x.status?"border-color:rgba(239,68,68,.4);":"";
      return`
        <div class="lfb-card" style="${borderStyle}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:7px; margin-bottom:5px;">
            ${chk}
            <div style="flex:1; min-width:0;">
              <div class="lfb-row" style="gap:5px; margin-bottom:4px;">
                <button type="button" class="lfb-user-link lfb-filter-user" data-u="${a.escapeHTML(x.username||"")}" title="عرض كل طلبات هذا العضو">
                  <i class="fas fa-user"></i> ${a.escapeHTML(x.displayName||x.username||"عضو")}
                  <span style="font-size:10.5px; color:#94a3b8; font-weight:normal;">(@${a.escapeHTML(x.username||"-")})</span>
                </button>
                ${uTotal>1?`<span class="lfb-tag lfb-tag-purple">${uTotal} تذاكر</span>`:""}
                ${isBanned?'<span class="lfb-tag lfb-tag-red">🚫 محظور</span>':""}
                ${x.rating?`<span class="lfb-tag lfb-tag-gold">⭐ ${x.rating}/5</span>`:""}
              </div>
              <div class="lfb-row" style="gap:4px;">
                ${x.pinned?'<span class="lfb-tag lfb-tag-gold">📌</span>':""}
                ${x.adminReadFollowup?'<span class="lfb-tag lfb-tag-blue">💬 رد جديد من العضو</span>':""}
                <span class="lfb-tag ${tm.cls}">${tm.icon} ${tm.label}</span>
                <span class="lfb-tag ${sm.cls}">${sm.label}</span>
                ${"normal"!==x.priority?`<span class="lfb-tag ${pm.cls}">${pm.label}</span>`:""}
                <span class="lfb-tag lfb-tag-gray">${a.escapeHTML(x.category||"عام")}</span>
                ${x.tag?`<span class="lfb-tag lfb-tag-purple">#${a.escapeHTML(x.tag)}</span>`:""}
                ${x.honorBadge?`<span class="lfb-tag lfb-tag-gold">${a.escapeHTML(x.honorBadge)}</span>`:""}
                ${x.publicId?'<span class="lfb-tag lfb-tag-green">🗳️ منشور</span>':""}
                ${x.locked?'<span class="lfb-tag lfb-tag-gray">🔒 مقفل</span>':""}
                ${x.claimedBy?`<span class="lfb-tag lfb-tag-blue">👤 ${a.escapeHTML(x.claimedBy)}</span>`:""}
              </div>
            </div>
            <div style="text-align:left; flex-shrink:0;">
              <div style="font-family:monospace; font-size:11px; color:#D4AF37; font-weight:700;">${a.escapeHTML(x.code||"")}</div>
              <div style="font-size:9.5px; color:#64748b; margin-top:2px;">${a.formatDate(x.createdAt)}</div>
            </div>
          </div>
          ${x.targetUser?`<div style="font-size:11px; color:#fca5a5; margin-bottom:4px;">ضد: <b>${a.escapeHTML(x.targetUser)}</b> ${tCount>=2?`<span class="lfb-tag lfb-tag-red" style="margin-right:4px;">⚠️ ${tCount} شكاوي ضده</span>`:""}</div>`:""}
          ${x.subject?`<div style="font-size:13px; font-weight:700; color:#f8fafc; margin-bottom:3px;">${a.escapeHTML(x.subject)}</div>`:""}
          <div style="font-size:12px; color:#cbd5e1; white-space:pre-wrap; word-break:break-word; line-height:1.5; max-height:90px; overflow:hidden;">${a.escapeHTML(x.message)}</div>
          ${x.attachmentUrl?'<div style="font-size:10.5px; color:#38bdf8; margin-top:3px;"><i class="fas fa-paperclip"></i> يحتوي على مرفق/دليل</div>':""}
          ${x.adminNote?`<div class="lfb-note-box"><i class="fas fa-lock"></i> ملاحظة سرية: ${a.escapeHTML(x.adminNote)}</div>`:""}
          <div class="lfb-row" style="margin-top:8px; gap:5px;">
            <button type="button" class="lfb-btn lfb-btn-gold lfb-mini lfb-act-open" data-id="${a.escapeHTML(x.id)}" style="width:auto;"><i class="fas fa-comments"></i> إدارة والرد</button>
            <button type="button" class="lfb-btn lfb-btn-info lfb-mini lfb-act-claim" data-id="${a.escapeHTML(x.id)}"><i class="fas fa-hand-paper"></i> ${x.claimedBy===t.myUsername?"إلغاء":"استلام"}</button>
            <button type="button" class="lfb-btn lfb-btn-dark lfb-mini lfb-act-pin" data-id="${a.escapeHTML(x.id)}">${x.pinned?"إلغاء 📌":"📌"}</button>
            <button type="button" class="lfb-btn lfb-btn-dark lfb-mini lfb-act-arc" data-id="${a.escapeHTML(x.id)}">${x.archived?"استعادة":"📦"}</button>
            <button type="button" class="lfb-btn lfb-btn-warn lfb-mini lfb-act-ban" data-u="${a.escapeHTML(x.username||"")}" data-dn="${a.escapeHTML(x.displayName||x.username||"")}"><i class="fas fa-ban"></i></button>
            <button type="button" class="lfb-btn lfb-btn-danger lfb-mini lfb-act-del" data-id="${a.escapeHTML(x.id)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lfb-row-chk").forEach(cb=>cb.onchange=()=>{
      cb.checked?adminUI.selectedIds.add(cb.dataset.id):adminUI.selectedIds.delete(cb.dataset.id);
      adminUI.renderInbox()
    });
    c.querySelectorAll(".lfb-filter-user").forEach(b=>b.onclick=()=>{
      document.getElementById("lfb-a-search").value=b.dataset.u;
      adminUI.renderInbox()
    });
    c.querySelectorAll(".lfb-act-open").forEach(b=>b.onclick=()=>adminUI.openTicketModal(b.dataset.id));
    c.querySelectorAll(".lfb-act-claim").forEach(b=>b.onclick=()=>adminUI.toggleClaim(b.dataset.id));
    c.querySelectorAll(".lfb-act-pin").forEach(b=>b.onclick=()=>adminUI.togglePin(b.dataset.id));
    c.querySelectorAll(".lfb-act-arc").forEach(b=>b.onclick=()=>adminUI.toggleArchive(b.dataset.id));
    c.querySelectorAll(".lfb-act-ban").forEach(b=>b.onclick=()=>adminUI.openBanModal(b.dataset.u,b.dataset.dn));
    c.querySelectorAll(".lfb-act-del").forEach(b=>b.onclick=()=>adminUI.deleteTicket(b.dataset.id))
  },
  openTicketModal(id){
    let x=t.allTickets[id];
    if(!x)return;
    adminUI.openTicketId=id;
    if(x.adminReadFollowup&&t.db){
      t.db.ref(`${e.rootPath}/tickets/${id}/adminReadFollowup`).set(!1).catch(()=>{})
    }
    let sub=document.getElementById("layl-feedback-sub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-feedback-sub-modal";
    sub.className="lfb-overlay lfb-sub-overlay";
    let tm=TYPE_META[x.type]||TYPE_META.suggestion;
    let targetCounts=adminUI.getTargetComplaintCounts();
    let tKey=x.targetUser?x.targetUser.trim().toLowerCase():"",tCnt=tKey?(targetCounts[tKey]||0):0;
    let tpls=Object.entries(t.templates||{}).filter(([,v])=>v&&v.text);
    let tplPills=tpls.map(([k,v])=>`<button type="button" class="lfb-pill lfb-use-tpl" data-k="${a.escapeHTML(k)}">${a.escapeHTML(v.title)}</button>`).join("");
    let adminOpts=`<option value="">— غير مستلمة —</option>`+t.adminUsers.map(ad=>`<option value="${a.escapeHTML(ad)}" ${x.claimedBy===ad?"selected":""}>${a.escapeHTML(ad)}</option>`).join("");
    let attachHtml=x.attachmentUrl&&a.isSafeUrl(x.attachmentUrl)?`<div style="margin-top:6px;"><a href="${a.escapeHTML(x.attachmentUrl)}" target="_blank" rel="noopener" style="font-size:11px; color:#38bdf8;"><i class="fas fa-external-link-alt"></i> فتح المرفق في نافذة جديدة</a><img src="${a.escapeHTML(x.attachmentUrl)}" class="lfb-attach-img" alt="مرفق"></div>`:"";
    sub.innerHTML=`
      <div class="lfb-box lfb-sub-box">
        <div class="lfb-header">
          <div class="lfb-title"><i class="fas fa-ticket-alt"></i> تذكرة ${a.escapeHTML(x.code||"")}</div>
          <div class="lfb-row" style="gap:5px;">
            <button type="button" class="lfb-ctrl-btn" id="lfb-sub-copy" title="نسخ ملخص التذكرة"><i class="fas fa-copy"></i></button>
            <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-sub-close"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lfb-body">
          <div class="lfb-card" style="background:rgba(0,0,0,.28);">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap;">
              <div>
                <b style="color:#7dd3fc; font-size:13.5px;"><i class="fas fa-user"></i> ${a.escapeHTML(x.displayName||x.username||"عضو")}</b>
                <span style="font-size:11px; color:#94a3b8;">(@${a.escapeHTML(x.username||"-")})</span>
              </div>
              <span class="lfb-tag ${tm.cls}">${tm.icon} ${tm.label} • ${a.escapeHTML(x.category||"عام")}</span>
            </div>
            ${x.targetUser?`<div style="font-size:11.5px; color:#fca5a5; margin-bottom:5px;">المشكو ضده: <b>${a.escapeHTML(x.targetUser)}</b> ${tCnt>=2?`<span class="lfb-tag lfb-tag-red">⚠️ رادار: ${tCnt} شكاوي ضده</span>`:""}</div>`:""}
            ${x.subject?`<div style="font-size:13px; font-weight:700; color:#D4AF37; margin-bottom:5px;">${a.escapeHTML(x.subject)}</div>`:""}
            <div style="font-size:12.5px; color:#f1f5f9; white-space:pre-wrap; word-break:break-word; line-height:1.6;">${a.escapeHTML(x.message)}</div>
            ${attachHtml}
            <div class="lfb-row" style="justify-content:space-between; margin-top:8px; font-size:10.5px; color:#94a3b8;">
              <span>${a.formatDate(x.createdAt)}${x.rating?` • تقييم العضو: <b style="color:#fbbf24;">${x.rating}/5 ⭐</b>`:""}</span>
              <div class="lfb-row" style="gap:4px;">
                ${"suggestion"===x.type?`<button type="button" id="lfb-sub-pub" class="lfb-btn lfb-btn-purple lfb-mini"><i class="fas fa-bullhorn"></i> ${x.publicId?"تحديث بساحة التصويت":"نشر للتصويت"}</button>`:""}
                <button type="button" id="lfb-sub-lock" class="lfb-btn lfb-btn-dark lfb-mini">${x.locked?"🔓 فتح الردود":"🔒 قفل الردود"}</button>
                <button type="button" id="lfb-sub-ban" class="lfb-btn lfb-btn-danger lfb-mini"><i class="fas fa-ban"></i> حظر</button>
              </div>
            </div>
          </div>

          <div class="lfb-label"><i class="fas fa-comments"></i> محادثة التذكرة</div>
          <div class="lfb-thread" id="lfb-asub-thread"></div>

          ${tplPills?`<div style="margin-bottom:7px;"><label class="lfb-label">ردود سريعة جاهزة</label><div class="lfb-row" style="gap:4px;">${tplPills}</div></div>`:""}
          <div style="margin-bottom:8px;">
            <label class="lfb-label">إرسال رد جديد للعضو</label>
            <textarea id="lfb-ed-reply" class="lfb-input" rows="2" style="resize:vertical; line-height:1.55;" placeholder="اكتب ردك ليصل للعضو فوراً..."></textarea>
          </div>
          <div class="lfb-grid-2" style="margin-bottom:10px;">
            <button type="button" id="lfb-ed-send" class="lfb-btn lfb-btn-gold"><i class="fas fa-paper-plane"></i> إرسال الرد</button>
            <button type="button" id="lfb-ed-send-close" class="lfb-btn lfb-btn-success"><i class="fas fa-check-double"></i> إرسال وإغلاق التذكرة</button>
          </div>

          <div class="lfb-card" style="background:rgba(0,0,0,.22);">
            <div class="lfb-card-title" style="font-size:12px;"><span><i class="fas fa-sliders-h"></i> تحكم وتصنيف إداري</span></div>
            <div class="lfb-grid-2" style="margin-bottom:7px;">
              <div>
                <label class="lfb-label">الحالة</label>
                <select id="lfb-ed-status" class="lfb-input">
                  <option value="new" ${"new"===x.status?"selected":""}>🔴 جديد</option>
                  <option value="review" ${"review"===x.status?"selected":""}>🟡 قيد المراجعة</option>
                  <option value="replied" ${"replied"===x.status?"selected":""}>🟢 تم الرد</option>
                  <option value="implemented" ${"implemented"===x.status?"selected":""}>✅ تم التنفيذ</option>
                  <option value="rejected" ${"rejected"===x.status?"selected":""}>✖️ مرفوض</option>
                  <option value="closed" ${"closed"===x.status?"selected":""}>⚫ مغلق</option>
                </select>
              </div>
              <div>
                <label class="lfb-label">الأهمية</label>
                <select id="lfb-ed-prio" class="lfb-input">
                  <option value="normal" ${"normal"===x.priority?"selected":""}>عادي</option>
                  <option value="important" ${"important"===x.priority?"selected":""}>مهم</option>
                  <option value="urgent" ${"urgent"===x.priority?"selected":""}>عاجل</option>
                </select>
              </div>
              <div>
                <label class="lfb-label">تعيين / تحويل لمشرف</label>
                <select id="lfb-ed-claim" class="lfb-input">${adminOpts}</select>
              </div>
              <div>
                <label class="lfb-label">وسم داخلي</label>
                <select id="lfb-ed-tag" class="lfb-input">
                  <option value="" ${!x.tag?"selected":""}>بدون وسم</option>
                  <option value="ممتاز" ${"ممتاز"===x.tag?"selected":""}>ممتاز</option>
                  <option value="هام جداً" ${"هام جداً"===x.tag?"selected":""}>هام جداً</option>
                  <option value="تحت التحقق" ${"تحت التحقق"===x.tag?"selected":""}>تحت التحقق</option>
                  <option value="مكرر" ${"مكرر"===x.tag?"selected":""}>مكرر</option>
                  <option value="متابعة لاحقة" ${"متابعة لاحقة"===x.tag?"selected":""}>متابعة لاحقة</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:7px;">
              <label class="lfb-label">وسام شكر وتميّز (يظهر للعضو على تذكرته)</label>
              <select id="lfb-ed-honor" class="lfb-input">
                <option value="" ${!x.honorBadge?"selected":""}>بدون وسام</option>
                <option value="🌟 اقتراح معتمد" ${"🌟 اقتراح معتمد"===x.honorBadge?"selected":""}>🌟 اقتراح معتمد</option>
                <option value="💎 فكرة مميزة" ${"💎 فكرة مميزة"===x.honorBadge?"selected":""}>💎 فكرة مميزة</option>
                <option value="🏅 شكر إداري" ${"🏅 شكر إداري"===x.honorBadge?"selected":""}>🏅 شكر إداري</option>
                <option value="🛡️ مساهمة فعّالة" ${"🛡️ مساهمة فعّالة"===x.honorBadge?"selected":""}>🛡️ مساهمة فعّالة</option>
              </select>
            </div>
            <div style="margin-bottom:8px;">
              <label class="lfb-label" style="color:#fde68a;"><i class="fas fa-lock"></i> ملاحظة سرية بين المشرفين (لا يراها العضو)</label>
              <textarea id="lfb-ed-note" class="lfb-input" rows="2" style="resize:vertical;" placeholder="أضف ملاحظة داخلية...">${a.escapeHTML(x.adminNote||"")}</textarea>
            </div>
            <button type="button" id="lfb-ed-save-meta" class="lfb-btn lfb-btn-dark" style="width:100%;"><i class="fas fa-save"></i> حفظ التصنيف والملاحظة فقط</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{if(ev.target===sub){adminUI.openTicketId=null;sub.remove()}});
    document.getElementById("lfb-sub-close").onclick=()=>{adminUI.openTicketId=null;sub.remove()};
    document.getElementById("lfb-sub-copy").onclick=()=>adminUI.copyTicketSummary(id);
    document.getElementById("lfb-sub-ban").onclick=()=>{adminUI.openTicketId=null;sub.remove();adminUI.openBanModal(x.username||"",x.displayName||x.username||"")};
    document.getElementById("lfb-sub-lock").onclick=()=>adminUI.toggleLock(id);
    let pubBtn=document.getElementById("lfb-sub-pub");
    pubBtn&&(pubBtn.onclick=()=>adminUI.openPublishModal(id));
    sub.querySelectorAll(".lfb-use-tpl").forEach(p=>{
      p.onclick=()=>{
        let tpl=t.templates[p.dataset.k];
        if(tpl)document.getElementById("lfb-ed-reply").value=tpl.text
      }
    });
    document.getElementById("lfb-ed-send").onclick=()=>adminUI.sendAdminReply(id,!1);
    document.getElementById("lfb-ed-send-close").onclick=()=>adminUI.sendAdminReply(id,!0);
    document.getElementById("lfb-ed-save-meta").onclick=()=>adminUI.saveTicketMeta(id);
    adminUI.renderAdminThreadOnly(id);
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  renderAdminThreadOnly(id){
    let tb=document.getElementById("lfb-asub-thread"),x=t.allTickets[id];
    if(!tb||!x)return;
    let msgs=a.getMessagesArray(x);
    tb.innerHTML=msgs.length?msgs.map(m=>{
      let cls="admin"===m.senderRole?"lfb-msg-admin":"system"===m.senderRole?"lfb-msg-sys":"lfb-msg-user";
      return`<div class="lfb-msg ${cls}"><div class="lfb-msg-meta"><b>${a.escapeHTML(m.sender||("admin"===m.senderRole?"الإدارة":"العضو"))}</b><span>${a.formatDate(m.ts)}</span></div>${a.escapeHTML(m.text)}</div>`
    }).join(""):'<div style="text-align:center; color:#64748b; font-size:11.5px; padding:10px;">لا توجد ردود في هذه التذكرة بعد.</div>';
    tb.scrollTop=tb.scrollHeight
  },
  sendAdminReply(id,forceClose){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    let inp=document.getElementById("lfb-ed-reply");
    let reply=(inp?.value||"").trim();
    if(!reply&&!forceClose)return ui.showToast("اكتب الرد أولاً");
    let st=forceClose?"closed":document.getElementById("lfb-ed-status").value;
    if(!forceClose&&reply&&("new"===st||"review"===st))st="replied";
    let prio=document.getElementById("lfb-ed-prio").value;
    let claim=document.getElementById("lfb-ed-claim").value||t.myUsername||null;
    let tag=document.getElementById("lfb-ed-tag").value||null;
    let honor=document.getElementById("lfb-ed-honor").value||null;
    let note=(document.getElementById("lfb-ed-note").value||"").trim()||null;
    let now=Date.now(),mKey="m_"+now+"_"+Math.floor(Math.random()*999);
    let updates={};
    updates[`${e.rootPath}/tickets/${id}/status`]=st;
    updates[`${e.rootPath}/tickets/${id}/priority`]=prio;
    updates[`${e.rootPath}/tickets/${id}/claimedBy`]=claim;
    updates[`${e.rootPath}/tickets/${id}/tag`]=tag;
    updates[`${e.rootPath}/tickets/${id}/honorBadge`]=honor;
    updates[`${e.rootPath}/tickets/${id}/adminNote`]=note;
    updates[`${e.rootPath}/tickets/${id}/adminReadFollowup`]=!1;
    updates[`${e.rootPath}/tickets/${id}/updatedAt`]=now;
    if(reply){
      let msgObj={senderRole:"admin",sender:t.myUsername||"الإدارة",text:reply,ts:now};
      updates[`${e.rootPath}/tickets/${id}/messages/${mKey}`]=msgObj;
      updates[`${e.rootPath}/tickets/${id}/adminReply`]=reply;
      updates[`${e.rootPath}/tickets/${id}/adminReplyBy`]=t.myUsername||"الإدارة";
      updates[`${e.rootPath}/tickets/${id}/adminReplyAt`]=now;
      updates[`${e.rootPath}/tickets/${id}/userReadReply`]=!1;
      if(!x.firstReplyAt)updates[`${e.rootPath}/tickets/${id}/firstReplyAt`]=now;
      if(x.userKey){
        updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/messages/${mKey}`]=msgObj;
        updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/adminReply`]=reply;
        updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/adminReplyAt`]=now;
        updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/userReadReply`]=!1
      }
      if(x.code){
        updates[`${e.rootPath}/codes/${x.code}/adminReply`]=reply;
        updates[`${e.rootPath}/codes/${x.code}/adminReplyAt`]=now
      }
    }
    if(x.userKey){
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/status`]=st;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/priority`]=prio;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/honorBadge`]=honor;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/updatedAt`]=now
    }
    if(x.code)updates[`${e.rootPath}/codes/${x.code}/status`]=st;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction(forceClose?"رد وإغلاق تذكرة":"رد على تذكرة",`${x.username||"-"} (${x.code||""})`,reply?reply.slice(0,60):STATUS_META[st]?.label||st);
      if(inp)inp.value="";
      ui.showToast(forceClose?"✅ تم إغلاق التذكرة وإرسال الرد":"✅ تم إرسال الرد للعضو");
      if(forceClose){
        adminUI.openTicketId=null;
        let sub=document.getElementById("layl-feedback-sub-modal");sub&&sub.remove()
      }
    }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
  },
  saveTicketMeta(id){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    let st=document.getElementById("lfb-ed-status").value;
    let prio=document.getElementById("lfb-ed-prio").value;
    let claim=document.getElementById("lfb-ed-claim").value||null;
    let tag=document.getElementById("lfb-ed-tag").value||null;
    let honor=document.getElementById("lfb-ed-honor").value||null;
    let note=(document.getElementById("lfb-ed-note").value||"").trim()||null;
    let now=Date.now(),updates={};
    updates[`${e.rootPath}/tickets/${id}/status`]=st;
    updates[`${e.rootPath}/tickets/${id}/priority`]=prio;
    updates[`${e.rootPath}/tickets/${id}/claimedBy`]=claim;
    updates[`${e.rootPath}/tickets/${id}/tag`]=tag;
    updates[`${e.rootPath}/tickets/${id}/honorBadge`]=honor;
    updates[`${e.rootPath}/tickets/${id}/adminNote`]=note;
    updates[`${e.rootPath}/tickets/${id}/updatedAt`]=now;
    if(x.userKey){
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/status`]=st;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/priority`]=prio;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/honorBadge`]=honor;
      updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/updatedAt`]=now
    }
    if(x.code)updates[`${e.rootPath}/codes/${x.code}/status`]=st;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("تحديث تصنيف تذكرة",x.code||id,`حالة: ${STATUS_META[st]?.label||st}${claim?" | مستلم: "+claim:""}${honor?" | "+honor:""}`);
      ui.showToast("✅ تم حفظ التعديلات")
    }).catch(()=>alert("❌ فشل الحفظ."))
  },
  toggleLock(id){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    let next=!x.locked,updates={};
    updates[`${e.rootPath}/tickets/${id}/locked`]=next;
    if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/locked`]=next;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction(next?"قفل ردود تذكرة":"فتح ردود تذكرة",x.code||id,x.username||"-");
      let btn=document.getElementById("lfb-sub-lock");
      btn&&(btn.textContent=next?"🔓 فتح الردود":"🔒 قفل الردود");
      ui.showToast(next?"🔒 تم قفل ردود العضو على التذكرة":"🔓 تم فتح الردود للعضو")
    })
  },
  copyTicketSummary(id){
    let x=t.allTickets[id];
    if(!x)return;
    let lines=[
      `🎫 تذكرة: ${x.code||id}`,
      `👤 العضو: ${x.displayName||x.username} (@${x.username})`,
      `📌 النوع: ${(TYPE_META[x.type]?.label||x.type)} | التصنيف: ${x.category||"عام"} | الحالة: ${STATUS_META[x.status]?.label||x.status}`,
      x.targetUser?`⚠️ المشكو ضده: ${x.targetUser}`:null,
      x.subject?`📝 العنوان: ${x.subject}`:null,
      `💬 النص:\n${x.message}`,
      x.adminReply?`✅ آخر رد إداري (${x.adminReplyBy||"الإدارة"}):\n${x.adminReply}`:null
    ].filter(Boolean).join("\n");
    navigator.clipboard?navigator.clipboard.writeText(lines).then(()=>ui.showToast("📋 تم نسخ ملخص التذكرة")):prompt("ملخص التذكرة:",lines)
  },
  toggleClaim(id){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    let next=x.claimedBy===t.myUsername?null:(t.myUsername||"الإدارة");
    let updates={};
    updates[`${e.rootPath}/tickets/${id}/claimedBy`]=next;
    if(next&&"new"===x.status){
      updates[`${e.rootPath}/tickets/${id}/status`]="review";
      if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/status`]="review";
      if(x.code)updates[`${e.rootPath}/codes/${x.code}/status`]="review"
    }
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction(next?"استلام تذكرة":"إلغاء استلام",x.code||id,x.username||"-");
      ui.showToast(next?"👤 تم استلام التذكرة باسمك":"تم إلغاء الاستلام")
    })
  },
  togglePin(id){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    t.db.ref(`${e.rootPath}/tickets/${id}/pinned`).set(!x.pinned).then(()=>{
      ui.showToast(!x.pinned?"📌 تم تثبيت التذكرة":"تم إلغاء التثبيت")
    })
  },
  toggleArchive(id){
    let x=t.allTickets[id];
    if(!t.db||!x)return;
    t.db.ref(`${e.rootPath}/tickets/${id}/archived`).set(!x.archived).then(()=>{
      adminUI.logAction(!x.archived?"أرشفة تذكرة":"استعادة من الأرشيف",x.code||id,x.username||"-");
      ui.showToast(!x.archived?"📦 تم النقل للأرشيف":"تمت الاستعادة للوارد")
    })
  },
  deleteTicket(id){
    let x=t.allTickets[id];
    if(!t.db||!x||!confirm(`حذف تذكرة (${x.code||id}) للعضو (${x.username||"-"}) نهائياً؟`))return;
    let updates={};
    updates[`${e.rootPath}/tickets/${id}`]=null;
    if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}`]=null;
    if(x.code)updates[`${e.rootPath}/codes/${x.code}`]=null;
    if(x.publicId)updates[`${e.rootPath}/public_ideas/${x.publicId}`]=null;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("حذف تذكرة",x.code||id,x.username||"-");
      ui.showToast("🗑️ تم حذف التذكرة نهائياً")
    })
  },
  batchStatus(st){
    let ids=Array.from(adminUI.selectedIds);
    if(!ids.length)return ui.showToast("حدد تذكرة واحدة على الأقل");
    let updates={},now=Date.now();
    ids.forEach(id=>{
      let x=t.allTickets[id];if(!x)return;
      updates[`${e.rootPath}/tickets/${id}/status`]=st;
      updates[`${e.rootPath}/tickets/${id}/updatedAt`]=now;
      if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}/status`]=st;
      if(x.code)updates[`${e.rootPath}/codes/${x.code}/status`]=st
    });
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("تغيير حالة متعدد",`${ids.length} تذكرة`,STATUS_META[st]?.label||st);
      adminUI.selectedIds.clear();
      ui.showToast(`✅ تم تحديث حالة ${ids.length} تذكرة`)
    })
  },
  batchArchive(val){
    let ids=Array.from(adminUI.selectedIds);
    if(!ids.length)return ui.showToast("حدد تذكرة واحدة على الأقل");
    let updates={};
    ids.forEach(id=>{updates[`${e.rootPath}/tickets/${id}/archived`]=val});
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("أرشفة متعددة",`${ids.length} تذكرة`,"نقل للأرشيف");
      adminUI.selectedIds.clear();
      ui.showToast(`📦 تمت أرشفة ${ids.length} تذكرة`)
    })
  },
  batchDelete(){
    let ids=Array.from(adminUI.selectedIds);
    if(!ids.length)return ui.showToast("حدد تذكرة واحدة على الأقل");
    if(!confirm(`حذف (${ids.length}) تذكرة نهائياً من قاعدة البيانات؟`))return;
    let updates={};
    ids.forEach(id=>{
      let x=t.allTickets[id];
      updates[`${e.rootPath}/tickets/${id}`]=null;
      if(x&&x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}`]=null;
      if(x&&x.code)updates[`${e.rootPath}/codes/${x.code}`]=null;
      if(x&&x.publicId)updates[`${e.rootPath}/public_ideas/${x.publicId}`]=null
    });
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("حذف متعدد",`${ids.length} تذكرة`,"حذف نهائي");
      adminUI.selectedIds.clear();
      ui.showToast(`🗑️ تم حذف ${ids.length} تذكرة نهائياً`)
    })
  },
openPublishModal(ticketId){
    let x=t.allTickets[ticketId];
    if(!x)return;
    let existing=x.publicId&&t.publicIdeas[x.publicId]?t.publicIdeas[x.publicId]:null;
    adminUI.openIdeaEditorModal({
      ideaId:x.publicId||null,
      ticketId,
      title:existing?existing.title:(x.subject||x.message.slice(0,55)),
      summary:existing?existing.summary:x.message,
      category:existing?existing.category:(x.category||"عام"),
      roadmapStatus:existing?existing.roadmapStatus:"studying",
      showAuthor:existing?Boolean(existing.showAuthor):!0,
      pinned:existing?Boolean(existing.pinned):!1,
      authorDisplay:x.displayName||x.username||"عضو",
      authorUsername:x.username||""
    })
  },
  openNewIdeaModal(){
    adminUI.openIdeaEditorModal({
      ideaId:null,ticketId:null,title:"",summary:"",
      category:a.getCategories()[0]||"عام",
      roadmapStatus:"studying",showAuthor:!1,pinned:!1,
      authorDisplay:t.myDisplayName||t.myUsername||"الإدارة",
      authorUsername:t.myUsername||""
    })
  },
  openIdeaEditorModal(cfg){
    let sub=document.getElementById("layl-feedback-sub-modal");
    sub&&sub.remove();
    adminUI.openTicketId=null;
    sub=document.createElement("div");
    sub.id="layl-feedback-sub-modal";
    sub.className="lfb-overlay lfb-sub-overlay";
    let cats=a.getCategories();
    if(cfg.category&&!cats.includes(cfg.category))cats.unshift(cfg.category);
    sub.innerHTML=`
      <div class="lfb-box lfb-sub-box">
        <div class="lfb-header">
          <div class="lfb-title"><i class="fas fa-lightbulb"></i> ${cfg.ideaId?"تعديل اقتراح بساحة التصويت":"نشر اقتراح لساحة التصويت"}</div>
          <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-im-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lfb-body">
          <div style="margin-bottom:8px;">
            <label class="lfb-label">عنوان الاقتراح</label>
            <input type="text" id="lfb-im-title" class="lfb-input" maxlength="90" value="${a.escapeHTML(cfg.title)}" placeholder="عنوان واضح ومختصر للاقتراح...">
          </div>
          <div style="margin-bottom:8px;">
            <label class="lfb-label">وصف الاقتراح (يظهر للجميع للتصويت عليه)</label>
            <textarea id="lfb-im-sum" class="lfb-input" rows="3" style="resize:vertical;">${a.escapeHTML(cfg.summary)}</textarea>
          </div>
          <div class="lfb-grid-2" style="margin-bottom:8px;">
            <div>
              <label class="lfb-label">التصنيف</label>
              <select id="lfb-im-cat" class="lfb-input">${cats.map(c=>`<option value="${a.escapeHTML(c)}" ${c===cfg.category?"selected":""}>${a.escapeHTML(c)}</option>`).join("")}</select>
            </div>
            <div>
              <label class="lfb-label">مرحلة التنفيذ</label>
              <select id="lfb-im-rm" class="lfb-input">
                <option value="studying" ${"studying"===cfg.roadmapStatus?"selected":""}>🔍 قيد الدراسة</option>
                <option value="planned" ${"planned"===cfg.roadmapStatus?"selected":""}>📋 مخطط له</option>
                <option value="in_progress" ${"in_progress"===cfg.roadmapStatus?"selected":""}>⚙️ قيد التنفيذ</option>
                <option value="done" ${"done"===cfg.roadmapStatus?"selected":""}>✅ تم التنفيذ</option>
                <option value="paused" ${"paused"===cfg.roadmapStatus?"selected":""}>⏸️ مؤجل</option>
              </select>
            </div>
          </div>
          <div class="lfb-card" style="padding:8px 10px; margin-bottom:10px;">
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; margin-bottom:5px; cursor:pointer;">
              <input type="checkbox" id="lfb-im-author" class="lfb-chk" ${cfg.showAuthor?"checked":""}> إظهار اسم صاحب الاقتراح (${a.escapeHTML(cfg.authorDisplay)})
            </label>
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; cursor:pointer;">
              <input type="checkbox" id="lfb-im-pin" class="lfb-chk" ${cfg.pinned?"checked":""}> 📌 تثبيت الاقتراح في أعلى الساحة
            </label>
          </div>
          <button type="button" id="lfb-im-save" class="lfb-btn lfb-btn-gold"><i class="fas fa-check"></i> ${cfg.ideaId?"حفظ التعديلات":"نشر في ساحة الاقتراحات الآن"}</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lfb-im-close").onclick=()=>sub.remove();
    document.getElementById("lfb-im-save").onclick=()=>{
      if(!t.db)return;
      let title=(document.getElementById("lfb-im-title").value||"").trim();
      let summary=(document.getElementById("lfb-im-sum").value||"").trim();
      let category=document.getElementById("lfb-im-cat").value||"عام";
      let roadmapStatus=document.getElementById("lfb-im-rm").value||"studying";
      let showAuthor=document.getElementById("lfb-im-author").checked;
      let pinned=document.getElementById("lfb-im-pin").checked;
      if(!title||!summary)return alert("أدخل عنوان ووصف الاقتراح.");
      let ideaId=cfg.ideaId||t.db.ref(`${e.rootPath}/public_ideas`).push().key;
      let prev=t.publicIdeas[ideaId]||{};
      let payload={
        id:ideaId,
        ticketId:cfg.ticketId||prev.ticketId||null,
        title,summary,category,roadmapStatus,showAuthor,pinned,
        authorDisplay:prev.authorDisplay||cfg.authorDisplay||"",
        authorUsername:prev.authorUsername||cfg.authorUsername||"",
        votes:prev.votes||null,
        createdAt:prev.createdAt||Date.now(),
        publishedBy:prev.publishedBy||t.myUsername||"الإدارة"
      };
      let updates={};
      updates[`${e.rootPath}/public_ideas/${ideaId}`]=payload;
      if(cfg.ticketId){
        updates[`${e.rootPath}/tickets/${cfg.ticketId}/publicId`]=ideaId;
        if("done"===roadmapStatus){
          updates[`${e.rootPath}/tickets/${cfg.ticketId}/status`]="implemented";
          let tk=t.allTickets[cfg.ticketId];
          if(tk&&tk.userKey)updates[`${e.rootPath}/user_tickets/${tk.userKey}/${cfg.ticketId}/status`]="implemented";
          if(tk&&tk.code)updates[`${e.rootPath}/codes/${tk.code}/status`]="implemented"
        }
      }
      t.db.ref().update(updates).then(()=>{
        adminUI.logAction(cfg.ideaId?"تحديث اقتراح عام":"نشر اقتراح للتصويت",title,ROADMAP_META[roadmapStatus]?.label||roadmapStatus);
        ui.showToast("🗳️ تم نشر/تحديث الاقتراح في ساحة التصويت");
        sub.remove()
      }).catch(()=>alert("❌ فشل الحفظ."))
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  renderPublicAdmin(){
    let c=document.getElementById("lfb-pub-list");
    if(!c)return;
    let list=Object.values(t.publicIdeas||{}).filter(Boolean).sort((x,y)=>{
      if(x.pinned!==y.pinned)return x.pinned?-1:1;
      return Object.keys(y.votes||{}).length-Object.keys(x.votes||{}).length
    });
    if(!list.length){
      c.innerHTML='<div style="text-align:center; color:#64748b; padding:24px;">لا توجد اقتراحات منشورة في الساحة العامة بعد.</div>';
      return
    }
    c.innerHTML=list.map(it=>{
      let cnt=Object.keys(it.votes||{}).length,rm=ROADMAP_META[it.roadmapStatus]||ROADMAP_META.studying;
      return`
        <div class="lfb-card" style="${it.pinned?"border-color:rgba(212,175,55,.45);":""}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:5px;">
            <div style="flex:1; min-width:0;">
              <div class="lfb-row" style="gap:4px; margin-bottom:4px;">
                ${it.pinned?'<span class="lfb-tag lfb-tag-gold">📌 مثبت</span>':""}
                <span class="lfb-tag ${rm.cls}">${rm.label}</span>
                <span class="lfb-tag lfb-tag-gray">${a.escapeHTML(it.category||"عام")}</span>
              </div>
              <div style="font-size:13px; font-weight:700; color:#f8fafc;">${a.escapeHTML(it.title)}</div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-top:3px; white-space:pre-wrap;">${a.escapeHTML(it.summary)}</div>
              <div style="font-size:10px; color:#64748b; margin-top:4px;">بواسطة: ${a.escapeHTML(it.authorDisplay||"-")} ${it.showAuthor?"(ظاهر)":"(مخفي)"} • ${a.formatDate(it.createdAt)}</div>
            </div>
            <div style="text-align:center; background:rgba(212,175,55,.12); border:1px solid rgba(212,175,55,.3); border-radius:10px; padding:5px 10px; flex-shrink:0;">
              <div style="font-size:14px; font-weight:900; color:#D4AF37;">👍 ${cnt}</div>
              <div style="font-size:9.5px; color:#94a3b8;">صوت</div>
            </div>
          </div>
          <div class="lfb-row" style="margin-top:7px; gap:5px;">
            <select class="lfb-input lfb-pub-rm" data-id="${a.escapeHTML(it.id)}" style="width:130px; padding:4px 7px; font-size:11px;">
              <option value="studying" ${"studying"===it.roadmapStatus?"selected":""}>🔍 قيد الدراسة</option>
              <option value="planned" ${"planned"===it.roadmapStatus?"selected":""}>📋 مخطط له</option>
              <option value="in_progress" ${"in_progress"===it.roadmapStatus?"selected":""}>⚙️ قيد التنفيذ</option>
              <option value="done" ${"done"===it.roadmapStatus?"selected":""}>✅ تم التنفيذ</option>
              <option value="paused" ${"paused"===it.roadmapStatus?"selected":""}>⏸️ مؤجل</option>
            </select>
            <button type="button" class="lfb-btn lfb-btn-gold lfb-mini lfb-pub-edit" data-id="${a.escapeHTML(it.id)}" style="width:auto;">تعديل</button>
            <button type="button" class="lfb-btn lfb-btn-dark lfb-mini lfb-pub-pin" data-id="${a.escapeHTML(it.id)}">${it.pinned?"إلغاء 📌":"📌"}</button>
            <button type="button" class="lfb-btn lfb-btn-danger lfb-mini lfb-pub-del" data-id="${a.escapeHTML(it.id)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lfb-pub-rm").forEach(sel=>sel.onchange=()=>{
      let id=sel.dataset.id,val=sel.value,it=t.publicIdeas[id];
      if(!t.db||!it)return;
      let updates={};
      updates[`${e.rootPath}/public_ideas/${id}/roadmapStatus`]=val;
      if("done"===val&&it.ticketId&&t.allTickets[it.ticketId]){
        let tk=t.allTickets[it.ticketId];
        updates[`${e.rootPath}/tickets/${it.ticketId}/status`]="implemented";
        if(tk.userKey)updates[`${e.rootPath}/user_tickets/${tk.userKey}/${it.ticketId}/status`]="implemented";
        if(tk.code)updates[`${e.rootPath}/codes/${tk.code}/status`]="implemented"
      }
      t.db.ref().update(updates).then(()=>ui.showToast("✅ تم تحديث مرحلة التنفيذ"))
    });
    c.querySelectorAll(".lfb-pub-edit").forEach(b=>b.onclick=()=>{
      let it=t.publicIdeas[b.dataset.id];
      if(it)adminUI.openIdeaEditorModal({ideaId:it.id,ticketId:it.ticketId,title:it.title,summary:it.summary,category:it.category,roadmapStatus:it.roadmapStatus,showAuthor:it.showAuthor,pinned:it.pinned,authorDisplay:it.authorDisplay,authorUsername:it.authorUsername})
    });
    c.querySelectorAll(".lfb-pub-pin").forEach(b=>b.onclick=()=>{
      let it=t.publicIdeas[b.dataset.id];
      t.db&&it&&t.db.ref(`${e.rootPath}/public_ideas/${it.id}/pinned`).set(!it.pinned)
    });
    c.querySelectorAll(".lfb-pub-del").forEach(b=>b.onclick=()=>{
      let it=t.publicIdeas[b.dataset.id];
      if(!t.db||!it||!confirm(`حذف الاقتراح (${it.title}) من ساحة التصويت؟`))return;
      let updates={};
      updates[`${e.rootPath}/public_ideas/${it.id}`]=null;
      if(it.ticketId&&t.allTickets[it.ticketId])updates[`${e.rootPath}/tickets/${it.ticketId}/publicId`]=null;
      t.db.ref().update(updates).then(()=>{
        adminUI.logAction("حذف اقتراح عام",it.title,"إزالة من ساحة التصويت");
        ui.showToast("🗑️ تم الحذف من الساحة العامة")
      })
    })
  },
  openBanModal(username,displayName){
    let sub=document.getElementById("layl-feedback-sub-modal");
    sub&&sub.remove();
    adminUI.openTicketId=null;
    sub=document.createElement("div");
    sub.id="layl-feedback-sub-modal";
    sub.className="lfb-overlay lfb-sub-overlay";
    sub.innerHTML=`
      <div class="lfb-box lfb-sub-box">
        <div class="lfb-header">
          <div class="lfb-title" style="color:#fca5a5;"><i class="fas fa-ban"></i> حظر عضو من الصندوق</div>
          <button type="button" class="lfb-ctrl-btn lfb-ctrl-close" id="lfb-bm-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lfb-body">
          <div style="font-size:12px; color:#cbd5e1; margin-bottom:9px;">العضو: <b style="color:#7dd3fc;">${a.escapeHTML(displayName||username)}</b> (@${a.escapeHTML(username)})</div>
          <div style="margin-bottom:8px;">
            <label class="lfb-label">مدة الحظر</label>
            <select id="lfb-bm-dur" class="lfb-input">
              <option value="1">ساعة واحدة</option>
              <option value="24" selected>24 ساعة</option>
              <option value="72">3 أيام</option>
              <option value="168">أسبوع</option>
              <option value="720">شهر</option>
              <option value="0">حظر دائم</option>
            </select>
          </div>
          <div style="margin-bottom:10px;">
            <label class="lfb-label">السبب (يظهر للعضو)</label>
            <input type="text" id="lfb-bm-reason" class="lfb-input" placeholder="مثلاً: إرسال بلاغات كيدية أو سبام">
          </div>
          <button type="button" id="lfb-bm-exec" class="lfb-btn lfb-btn-crimson"><i class="fas fa-ban"></i> تأكيد الحظر</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lfb-bm-close").onclick=()=>sub.remove();
    document.getElementById("lfb-bm-exec").onclick=()=>{
      let hrs=Number(document.getElementById("lfb-bm-dur").value)||0;
      let reason=(document.getElementById("lfb-bm-reason").value||"").trim()||"إساءة استخدام صندوق الاقتراحات والشكاوي";
      adminUI.applyBan(username,displayName,hrs,reason,()=>sub.remove())
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  applyBan(username,displayName,hours,reason,cb){
    let san=a.sanitizeName(username);
    if(!t.db||!san)return alert("أدخل اسم المستخدم أولاً.");
    let exp=hours>0?(Date.now()+hours*36e5):null;
    let payload={
      username,
      displayName:displayName||username,
      reason:reason||"إساءة استخدام الصندوق",
      expiresAt:exp,
      bannedBy:t.myUsername||"الإدارة",
      bannedAt:Date.now()
    };
    t.db.ref(`${e.rootPath}/bans/${san}`).set(payload).then(()=>{
      adminUI.logAction("حظر عضو",username,hours>0?`${hours} ساعة | ${payload.reason}`:`دائم | ${payload.reason}`);
      ui.showToast(`🚫 تم حظر (${username}) من الإرسال`);
      cb&&cb()
    }).catch(()=>alert("❌ فشل تطبيق الحظر."))
  },
  banUserFromForm(){
    let u=(document.getElementById("lfb-ban-user")?.value||"").trim();
    let hrs=Number(document.getElementById("lfb-ban-dur")?.value)||0;
    let rsn=(document.getElementById("lfb-ban-reason")?.value||"").trim();
    if(!u)return alert("أدخل اسم المستخدم أولاً.");
    adminUI.applyBan(u,u,hrs,rsn,()=>{
      document.getElementById("lfb-ban-user").value="";
      document.getElementById("lfb-ban-reason").value=""
    })
  },
  renderBans(){
    let c=document.getElementById("lfb-bans-list");
    if(c){
      let entries=Object.entries(t.bans||{}).filter(([,v])=>v).sort((x,y)=>(y[1].bannedAt||0)-(x[1].bannedAt||0));
      if(!entries.length){
        c.innerHTML='<div style="text-align:center; color:#64748b; padding:16px; font-size:12px;">لا يوجد أعضاء محظورون حالياً.</div>'
      }else{
        c.innerHTML=entries.map(([k,b])=>{
          let act=a.isActiveBan(b);
          return`
            <div class="lfb-card" style="${act?"border-color:rgba(239,68,68,.35);":"opacity:.65;"}">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <div>
                  <b style="color:#f8fafc; font-size:13px;">${a.escapeHTML(b.displayName||b.username||k)}</b>
                  <span style="font-size:11px; color:#94a3b8;">(@${a.escapeHTML(b.username||k)})</span>
                  <span class="lfb-tag ${act?"lfb-tag-red":"lfb-tag-gray"}">${act?a.formatRemaining(b.expiresAt):"منتهي"}</span>
                </div>
                <button type="button" class="lfb-btn lfb-btn-success lfb-mini lfb-unban-btn" data-k="${a.escapeHTML(k)}">فك الحظر</button>
              </div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-top:4px;">السبب: ${a.escapeHTML(b.reason||"-")}</div>
              <div style="font-size:10px; color:#64748b; margin-top:3px;">بواسطة: ${a.escapeHTML(b.bannedBy||"-")} • ${a.formatDate(b.bannedAt)}</div>
            </div>`
        }).join("");
        c.querySelectorAll(".lfb-unban-btn").forEach(btn=>btn.onclick=()=>{
          let k=btn.dataset.k,b=t.bans[k];
          t.db.ref(`${e.rootPath}/bans/${k}`).remove().then(()=>{
            adminUI.logAction("فك حظر",b?.username||k,"إزالة التقييد");
            ui.showToast("✅ تم فك الحظر")
          })
        })
      }
    }
    adminUI.renderVipList()
  },
  cleanExpiredBans(){
    if(!t.db)return;
    let updates={},cnt=0;
    Object.entries(t.bans||{}).forEach(([k,b])=>{
      if(!a.isActiveBan(b)){updates[`${e.rootPath}/bans/${k}`]=null;cnt++}
    });
    if(!cnt)return ui.showToast("لا توجد قيود منتهية");
    t.db.ref().update(updates).then(()=>ui.showToast(`🧹 تم تنظيف ${cnt} حظر منتهٍ`))
  },
  addVipExempt(){
    if(!t.db)return;
    let inp=document.getElementById("lfb-vip-inp"),raw=(inp?.value||"").trim(),san=a.sanitizeName(raw);
    if(!san)return alert("أدخل اسم العضو أولاً.");
    t.db.ref(`${e.rootPath}/vip_exempt/${san}`).set({username:raw,addedBy:t.myUsername||"الإدارة",ts:Date.now()}).then(()=>{
      inp.value="";
      adminUI.logAction("إضافة استثناء VIP",raw,"تجاوز وقت الانتظار");
      ui.showToast(`⭐ تمت إضافة (${raw}) لقائمة VIP`)
    })
  },
  renderVipList(){
    let c=document.getElementById("lfb-vip-list");
    if(!c)return;
    let entries=Object.entries(t.vipExempt||{}).filter(([,v])=>v);
    c.innerHTML=entries.map(([k,v])=>`
      <span class="lfb-tag lfb-tag-gold" style="padding:4px 8px; font-size:11px;">
        ⭐ ${a.escapeHTML((v&&v.username)||k)}
        <button type="button" class="lfb-rm-vip" data-k="${a.escapeHTML(k)}" style="background:none; border:none; color:#f87171; cursor:pointer; font-weight:700;">×</button>
      </span>`).join("")||'<span style="color:#64748b; font-size:11px;">لا يوجد أعضاء مستثنون حالياً.</span>';
    c.querySelectorAll(".lfb-rm-vip").forEach(b=>b.onclick=()=>{
      let k=b.dataset.k;
      t.db&&t.db.ref(`${e.rootPath}/vip_exempt/${k}`).remove().then(()=>{
        adminUI.logAction("إزالة استثناء VIP",k,"إلغاء الاستثناء");
        ui.showToast("تمت الإزالة من قائمة VIP")
      })
    })
  },
  renderTemplates(){
    let c=document.getElementById("lfb-tpl-list");
    if(!c)return;
    let entries=Object.entries(t.templates||{}).filter(([,v])=>v&&v.text);
    if(!entries.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:18px;">لا توجد قوالب محفوظة.</div>';return}
    c.innerHTML=entries.map(([k,v])=>`
      <div class="lfb-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <b style="color:#D4AF37; font-size:12.5px;">${a.escapeHTML(v.title)}</b>
          <button type="button" class="lfb-btn lfb-btn-danger lfb-mini lfb-del-tpl" data-k="${a.escapeHTML(k)}"><i class="fas fa-trash"></i></button>
        </div>
        <div style="font-size:12px; color:#cbd5e1; white-space:pre-wrap;">${a.escapeHTML(v.text)}</div>
      </div>`).join("");
    c.querySelectorAll(".lfb-del-tpl").forEach(b=>b.onclick=()=>{
      if(!t.db||!confirm("حذف هذا القالب؟"))return;
      t.db.ref(`${e.rootPath}/templates/${b.dataset.k}`).remove().then(()=>ui.showToast("🗑️ تم حذف القالب"))
    })
  },
  addTemplate(){
    if(!t.db)return;
    let title=(document.getElementById("lfb-tpl-title")?.value||"").trim();
    let text=(document.getElementById("lfb-tpl-text")?.value||"").trim();
    if(!title||!text)return alert("أدخل عنوان ونص القالب.");
    t.db.ref(`${e.rootPath}/templates`).push({title,text}).then(()=>{
      document.getElementById("lfb-tpl-title").value="";
      document.getElementById("lfb-tpl-text").value="";
      ui.showToast("✅ تم حفظ القالب السريع")
    })
  },
  renderStats(){
    let c=document.getElementById("lfb-stats-body");
    if(!c)return;
    let all=Object.values(t.allTickets||{}).filter(Boolean),tot=all.length;
    let byType={suggestion:0,complaint:0,technical:0},byStat={new:0,review:0,replied:0,implemented:0,rejected:0,closed:0};
    let byCat={},byAdmin={},adminRatings={},byUser={},radar={};
    let replySumMs=0,replyCnt=0,rateSum=0,rateCnt=0;
    all.forEach(x=>{
      byType[x.type]=(byType[x.type]||0)+1;
      byStat[x.status]=(byStat[x.status]||0)+1;
      let cat=x.category||"أخرى";byCat[cat]=(byCat[cat]||0)+1;
      if(x.adminReplyBy){
        byAdmin[x.adminReplyBy]=(byAdmin[x.adminReplyBy]||0)+1;
        if(x.rating){
          adminRatings[x.adminReplyBy]=adminRatings[x.adminReplyBy]||{sum:0,cnt:0};
          adminRatings[x.adminReplyBy].sum+=x.rating;
          adminRatings[x.adminReplyBy].cnt++
        }
      }
      let fAt=x.firstReplyAt||x.adminReplyAt;
      if(fAt&&x.createdAt&&fAt>=x.createdAt){replySumMs+=(fAt-x.createdAt);replyCnt++}
      if(x.rating){rateSum+=x.rating;rateCnt++}
      let un=x.username||"غير معروف";byUser[un]=(byUser[un]||0)+1;
      if("complaint"===x.type&&x.targetUser){
        let tr=x.targetUser.trim();
        tr&&(radar[tr]=(radar[tr]||0)+1)
      }
    });
    let pct=v=>tot?Math.round((v/tot)*100):0;
    let answered=byStat.replied+byStat.implemented+byStat.closed+byStat.rejected;
    let avgResp=replyCnt?a.formatDurationMin(replySumMs/replyCnt):"-";
    let avgRate=rateCnt?(rateSum/rateCnt).toFixed(1)+" ⭐":"-";
    let topAdmins=Object.entries(byAdmin).sort((x,y)=>y[1]-x[1]).slice(0,8);
    let topUsers=Object.entries(byUser).sort((x,y)=>y[1]-x[1]).slice(0,8);
    let topCats=Object.entries(byCat).sort((x,y)=>y[1]-x[1]);
    let topRadar=Object.entries(radar).sort((x,y)=>y[1]-x[1]).slice(0,10);
    c.innerHTML=`
      <div class="lfb-card">
        <div class="lfb-card-title"><span><i class="fas fa-tachometer-alt"></i> مؤشرات الأداء وجودة الرد</span><span class="lfb-tag lfb-tag-blue">${a.getDbSizeKB()} KB • ${tot} تذكرة</span></div>
        <div class="lfb-grid-3" style="margin-bottom:10px;">
          <div class="lfb-stat"><div class="lfb-stat-val" style="color:#34d399;">${pct(answered)}%</div><div class="lfb-stat-lbl">نسبة الإنجاز</div></div>
          <div class="lfb-stat"><div class="lfb-stat-val" style="color:#38bdf8;">${avgResp}</div><div class="lfb-stat-lbl">متوسط سرعة الرد</div></div>
          <div class="lfb-stat"><div class="lfb-stat-val" style="color:#fbbf24;">${avgRate}</div><div class="lfb-stat-lbl">رضا الأعضاء (${rateCnt})</div></div>
        </div>
        <div style="font-size:11.5px;">💡 اقتراحات: <b>${byType.suggestion}</b> (${pct(byType.suggestion)}%)</div>
        <div class="lfb-prog-wrap"><div class="lfb-prog-bar" style="width:${pct(byType.suggestion)}%; background:#D4AF37;"></div></div>
        <div style="font-size:11.5px;">🛡️ شكاوي: <b>${byType.complaint}</b> (${pct(byType.complaint)}%)</div>
        <div class="lfb-prog-wrap"><div class="lfb-prog-bar" style="width:${pct(byType.complaint)}%; background:#ef4444;"></div></div>
        <div style="font-size:11.5px;">🛠️ أعطال تقنية: <b>${byType.technical}</b> (${pct(byType.technical)}%)</div>
        <div class="lfb-prog-wrap"><div class="lfb-prog-bar" style="width:${pct(byType.technical)}%; background:#38bdf8;"></div></div>
      </div>

      <div class="lfb-card" style="border-color:rgba(239,68,68,.35);">
        <div class="lfb-card-title" style="color:#fca5a5;"><span><i class="fas fa-radar"></i> رادار الأكثر شكوى ضدهم</span><span class="lfb-tag lfb-tag-red">${topRadar.length}</span></div>
        ${topRadar.length?topRadar.map(([name,cnt])=>`
          <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; background:rgba(239,68,68,.08); border-radius:8px; margin-bottom:4px; font-size:12px;">
            <button type="button" class="lfb-user-link lfb-st-u" data-u="${a.escapeHTML(name)}" style="color:#fecaca;">${a.escapeHTML(name)}</button>
            <span class="lfb-tag lfb-tag-red">${cnt} ${cnt>1?"شكاوي":"شكوى"}</span>
          </div>`).join(""):'<div style="color:#64748b; font-size:11.5px; text-align:center; padding:8px;">لا توجد شكاوي موجهة ضد أسماء محددة بعد.</div>'}
      </div>

      <div class="lfb-card">
        <div class="lfb-card-title"><span><i class="fas fa-tags"></i> التوزيع حسب التصنيف</span></div>
        <div class="lfb-row" style="gap:5px;">
          ${topCats.map(([k,v])=>`<span class="lfb-tag lfb-tag-gold">${a.escapeHTML(k)}: ${v}</span>`).join("")||'<span style="color:#64748b; font-size:11.5px;">لا توجد بيانات.</span>'}
        </div>
      </div>

      <div class="lfb-grid-2">
        <div class="lfb-card" style="margin:0;">
          <div class="lfb-card-title"><span><i class="fas fa-award"></i> أداء وتقييم المشرفين</span></div>
          ${topAdmins.length?topAdmins.map(([k,v])=>{
            let rObj=adminRatings[k],rTxt=rObj?` • ⭐ ${(rObj.sum/rObj.cnt).toFixed(1)}`:"";
            return`<div style="display:flex; justify-content:space-between; font-size:11.5px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,.04);"><span>${a.escapeHTML(k)}</span><b style="color:#34d399;">${v} رد${rTxt}</b></div>`
          }).join(""):'<div style="color:#64748b; font-size:11px;">لا توجد ردود بعد.</div>'}
        </div>
        <div class="lfb-card" style="margin:0;">
          <div class="lfb-card-title"><span><i class="fas fa-users"></i> الأكثر مشاركة</span></div>
          ${topUsers.length?topUsers.map(([k,v])=>`<div style="display:flex; justify-content:space-between; font-size:11.5px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,.04);"><button type="button" class="lfb-user-link lfb-st-u" data-u="${a.escapeHTML(k)}" style="font-size:11.5px;">${a.escapeHTML(k)}</button><b style="color:#D4AF37;">${v}</b></div>`).join(""):'<div style="color:#64748b; font-size:11px;">لا توجد بيانات.</div>'}
        </div>
      </div>`;
    c.querySelectorAll(".lfb-st-u").forEach(b=>b.onclick=()=>{
      adminUI.switchTab("inbox");
      document.getElementById("lfb-a-search").value=b.dataset.u;
      adminUI.renderInbox()
    })
  },
  loadLogs(){
    let c=document.getElementById("lfb-logs-list");
    if(!t.db)return;
    c&&(c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:18px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>');
    t.db.ref(`${e.rootPath}/logs`).limitToLast(200).once("value").then(snap=>{
      let v=snap.val()||{};
      t.logs=Object.entries(v).map(([id,d])=>Object.assign({id},d)).sort((x,y)=>(y.timestamp||0)-(x.timestamp||0));
      adminUI.renderLogs()
    }).catch(()=>{c&&(c.innerHTML='<div style="text-align:center; color:#f87171; padding:18px;">تعذر قراءة السجل.</div>')})
  },
  renderLogs(){
    let c=document.getElementById("lfb-logs-list");
    if(!c)return;
    let q=(document.getElementById("lfb-log-search")?.value||"").trim().toLowerCase();
    let list=t.logs.filter(x=>!q||`${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:22px;">لا توجد سجلات إدارية بعد.</div>';return}
    c.innerHTML=list.map(x=>`
      <div class="lfb-card" style="padding:8px 10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
          <span class="lfb-tag lfb-tag-gold">${a.escapeHTML(x.action)}</span>
          <span style="font-size:10px; color:#94a3b8;">${a.formatDate(x.timestamp)}</span>
        </div>
        <div style="font-size:12px;"><b style="color:#D4AF37;">${a.escapeHTML(x.admin)}</b> <span style="color:#64748b;">➔</span> <b style="color:#7dd3fc;">${a.escapeHTML(x.target)}</b></div>
        ${x.details?`<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">${a.escapeHTML(x.details)}</div>`:""}
      </div>`).join("")
  },
  exportLogs(){
    if(!t.logs.length)return ui.showToast("لا توجد سجلات للتصدير");
    let txt=t.logs.map(x=>`[${a.formatDate(x.timestamp)}] (${x.action}) ${x.admin} -> ${x.target} | ${x.details||""}`).join("\n");
    let blob=new Blob([txt],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),lk=document.createElement("a");
    lk.href=url;lk.download=`layl-feedback-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(lk);lk.click();lk.remove();setTimeout(()=>URL.revokeObjectURL(url),1e3)
  },
  clearLogs(){
    if(!t.db||!confirm("مسح سجل العمليات بالكامل؟"))return;
    t.db.ref(`${e.rootPath}/logs`).remove().then(()=>{t.logs=[];adminUI.renderLogs();ui.showToast("🗑️ تم مسح السجل")})
  },
  populateSettingsUI(){
    let en=document.getElementById("lfb-s-enabled");
    if(!en)return;
    en.checked=!1!==t.settings.enabled;
    document.getElementById("lfb-s-admbypass").checked=!1!==t.settings.adminBypassCooldown;
    document.getElementById("lfb-s-sug").checked=!1!==t.settings.allowSuggestions;
    document.getElementById("lfb-s-cmp").checked=!1!==t.settings.allowComplaints;
    document.getElementById("lfb-s-tec").checked=!1!==t.settings.allowTechnical;
    document.getElementById("lfb-s-pub").checked=!1!==t.settings.allowPublicBoard;
    document.getElementById("lfb-s-fup").checked=!1!==t.settings.allowFollowUp;
    document.getElementById("lfb-s-rat").checked=!1!==t.settings.allowRating;
    document.getElementById("lfb-s-cool").value=isNaN(Number(t.settings.cooldownMinutes))?30:Number(t.settings.cooldownMinutes);
    document.getElementById("lfb-s-dlim").value=isNaN(Number(t.settings.dailyLimit))?5:Number(t.settings.dailyLimit);
    document.getElementById("lfb-s-minl").value=Number(t.settings.minLength)||10;
    document.getElementById("lfb-s-maxl").value=Number(t.settings.maxLength)||800;
    document.getElementById("lfb-s-bantxt").value=t.settings.bannerText||"";
    document.getElementById("lfb-s-bantype").value=t.settings.bannerType||"info";
    document.getElementById("lfb-s-auto").checked=Boolean(t.settings.autoReplyEnabled);
    document.getElementById("lfb-s-autotxt").value=t.settings.autoReplyText||defaultSettings.autoReplyText;
    document.getElementById("lfb-s-cats").value=t.settings.categories||defaultSettings.categories;
    document.getElementById("lfb-s-blocked").value=t.settings.blockedWords||"";
    document.getElementById("lfb-s-notice").value=t.settings.welcomeNotice||defaultSettings.welcomeNotice;
    document.getElementById("lfb-s-closed").value=t.settings.closedMessage||defaultSettings.closedMessage;
    let sz=document.getElementById("lfb-db-size");
    sz&&(sz.textContent=`${a.getDbSizeKB()} KB • ${Object.keys(t.allTickets||{}).length} تذكرة`);
    adminUI.renderAdminsList()
  },
  saveSettings(){
    if(!t.db)return;
    let payload={
      enabled:document.getElementById("lfb-s-enabled").checked,
      adminBypassCooldown:document.getElementById("lfb-s-admbypass").checked,
      allowSuggestions:document.getElementById("lfb-s-sug").checked,
      allowComplaints:document.getElementById("lfb-s-cmp").checked,
      allowTechnical:document.getElementById("lfb-s-tec").checked,
      allowPublicBoard:document.getElementById("lfb-s-pub").checked,
      allowFollowUp:document.getElementById("lfb-s-fup").checked,
      allowRating:document.getElementById("lfb-s-rat").checked,
      cooldownMinutes:Math.max(0,parseInt(document.getElementById("lfb-s-cool").value,10)||0),
      dailyLimit:Math.max(0,parseInt(document.getElementById("lfb-s-dlim").value,10)||0),
      minLength:Math.max(3,parseInt(document.getElementById("lfb-s-minl").value,10)||10),
      maxLength:Math.max(100,parseInt(document.getElementById("lfb-s-maxl").value,10)||800),
      bannerText:(document.getElementById("lfb-s-bantxt").value||"").trim(),
      bannerType:document.getElementById("lfb-s-bantype").value||"info",
      autoReplyEnabled:document.getElementById("lfb-s-auto").checked,
      autoReplyText:(document.getElementById("lfb-s-autotxt").value||"").trim()||defaultSettings.autoReplyText,
      categories:(document.getElementById("lfb-s-cats").value||"").trim()||defaultSettings.categories,
      blockedWords:(document.getElementById("lfb-s-blocked").value||"").trim(),
      welcomeNotice:(document.getElementById("lfb-s-notice").value||"").trim()||defaultSettings.welcomeNotice,
      closedMessage:(document.getElementById("lfb-s-closed").value||"").trim()||defaultSettings.closedMessage
    };
    t.db.ref(`${e.rootPath}/settings`).set(payload).then(()=>{
      t.settings=payload;
      adminUI.logAction("تحديث الإعدادات","النظام",`انتظار: ${payload.cooldownMinutes} د | حد يومي: ${payload.dailyLimit}`);
      adminUI.updateStatsBar();
      ui.showToast("✅ تم حفظ جميع الإعدادات بنجاح")
    }).catch(()=>alert("❌ فشل الحفظ."))
  },
  renderAdminsList(){
    let c=document.getElementById("lfb-adm-list"),cnt=document.getElementById("lfb-adm-cnt");
    if(!c)return;
    cnt&&(cnt.textContent=t.adminUsers.length);
    let mySan=a.sanitizeName(t.myUsername);
    c.innerHTML=t.adminUsers.map(ad=>{
      let isMe=ad===t.myUsername||a.sanitizeName(ad)===mySan;
      return`<span class="lfb-tag lfb-tag-gold" style="padding:4px 8px; font-size:11px;"><i class="fas fa-crown"></i> ${a.escapeHTML(ad)} ${isMe?'<span style="color:#94a3b8;">(أنت)</span>':`<button type="button" class="lfb-rm-adm" data-ad="${a.escapeHTML(ad)}" style="background:none; border:none; color:#f87171; cursor:pointer; font-weight:700;">×</button>`}</span>`
    }).join("")||'<span style="color:#64748b; font-size:11px;">لا يوجد مشرفون.</span>';
    c.querySelectorAll(".lfb-rm-adm").forEach(b=>b.onclick=()=>{
      let target=b.dataset.ad;
      if(!t.db||!confirm(`إزالة (${target}) من قائمة المشرفين (admins)؟`))return;
      t.db.ref(`admins/${target}`).remove().then(()=>{
        adminUI.logAction("إزالة مشرف",target,"سحب الصلاحية");
        ui.showToast(`تمت إزالة (${target})`)
      })
    })
  },
  addAdminUser(){
    if(!t.db)return;
    let inp=document.getElementById("lfb-new-adm"),san=a.sanitizeName((inp?.value||"").trim());
    if(!san)return alert("أدخل اسم المستخدم أولاً.");
    t.db.ref(`admins/${san}`).set(!0).then(()=>{
      inp.value="";
      adminUI.logAction("إضافة مشرف",san,"منح صلاحية الإدارة");
      ui.showToast(`👑 تمت إضافة (${san})`)
    })
  },
  cleanClosedTickets(){
    if(!t.db)return;
    let updates={},cnt=0;
    Object.values(t.allTickets||{}).forEach(x=>{
      if(x&&("closed"===x.status||"rejected"===x.status||x.archived)){
        updates[`${e.rootPath}/tickets/${x.id}`]=null;
        if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${x.id}`]=null;
        if(x.code)updates[`${e.rootPath}/codes/${x.code}`]=null;
        cnt++
      }
    });
    if(!cnt)return ui.showToast("لا توجد تذاكر مغلقة أو مؤرشفة");
    if(!confirm(`حذف (${cnt}) تذكرة مغلقة/مؤرشفة نهائياً من القاعدة؟`))return;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("تنظيف المغلقة",`${cnt} تذكرة`,"حذف نهائي");
      ui.showToast(`🧹 تم حذف ${cnt} تذكرة`)
    })
  },
  cleanOldTickets(days){
    if(!t.db)return;
    let cutoff=Date.now()-days*864e5,updates={},cnt=0;
    Object.values(t.allTickets||{}).forEach(x=>{
      if(x&&(x.createdAt||0)<cutoff){
        updates[`${e.rootPath}/tickets/${x.id}`]=null;
        if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${x.id}`]=null;
        if(x.code)updates[`${e.rootPath}/codes/${x.code}`]=null;
        cnt++
      }
    });
    if(!cnt)return ui.showToast(`لا توجد تذاكر أقدم من ${days} يوم`);
    if(!confirm(`حذف (${cnt}) تذكرة أقدم من ${days} يوم نهائياً؟`))return;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("تنظيف القديم",`${cnt} تذكرة`,`أقدم من ${days} يوم`);
      ui.showToast(`🧹 تم حذف ${cnt} تذكرة قديمة`)
    })
  },
  exportBackup(){
    let payload={exportedAt:Date.now(),settings:t.settings,templates:t.templates,bans:t.bans,vipExempt:t.vipExempt,publicIdeas:t.publicIdeas,tickets:t.allTickets};
    let blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    let url=URL.createObjectURL(blob),lk=document.createElement("a");
    lk.href=url;lk.download=`layl-feedback-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(lk);lk.click();lk.remove();setTimeout(()=>URL.revokeObjectURL(url),1e3);
    ui.showToast("💾 تم تحميل النسخة الاحتياطية")
  },
  importBackup(ev){
    let file=ev.target.files&&ev.target.files[0];ev.target.value="";
    if(!file||!t.db)return;
    let rdr=new FileReader;
    rdr.onload=()=>{
      try{
        let p=JSON.parse(rdr.result);
        if(!p||"object"!=typeof p)return alert("ملف JSON غير صالح.");
        let tks=p.tickets||p;
        let cnt=Object.keys(tks).length;
        if(!confirm(`استيراد ودمج (${cnt}) تذكرة في قاعدة البيانات؟`))return;
        let updates={};
        Object.entries(tks).forEach(([id,x])=>{
          if(!x||!x.message)return;
          updates[`${e.rootPath}/tickets/${id}`]=x;
          if(x.userKey)updates[`${e.rootPath}/user_tickets/${x.userKey}/${id}`]={id,code:x.code||"",type:x.type||"suggestion",category:x.category||"أخرى",priority:x.priority||"normal",targetUser:x.targetUser||null,attachmentUrl:x.attachmentUrl||null,subject:x.subject||"",message:x.message,status:x.status||"new",createdAt:x.createdAt||Date.now(),updatedAt:x.updatedAt||Date.now(),adminReply:x.adminReply||null,adminReplyAt:x.adminReplyAt||null,userReadReply:!1===x.userReadReply?!1:!0,locked:Boolean(x.locked),rating:x.rating||null,honorBadge:x.honorBadge||null,messages:x.messages||null};
          if(x.code)updates[`${e.rootPath}/codes/${x.code}`]={code:x.code,type:x.type||"suggestion",category:x.category||"أخرى",subject:x.subject||"",status:x.status||"new",createdAt:x.createdAt||Date.now(),adminReply:x.adminReply||null,adminReplyAt:x.adminReplyAt||null}
        });
        if(p.templates)updates[`${e.rootPath}/templates`]=p.templates;
        if(p.publicIdeas)updates[`${e.rootPath}/public_ideas`]=p.publicIdeas;
        if(p.vipExempt)updates[`${e.rootPath}/vip_exempt`]=p.vipExempt;
        t.db.ref().update(updates).then(()=>{
          adminUI.logAction("استيراد نسخة احتياطية",`${cnt} تذكرة`,"دمج بيانات");
          ui.showToast(`✅ تم استيراد ${cnt} تذكرة`)
        })
      }catch{alert("❌ تعذر قراءة الملف.")}
    };
    rdr.readAsText(file)
  },
  wipeAllTickets(){
    if(!t.db)return;
    let cnt=Object.keys(t.allTickets||{}).length;
    if(!cnt)return ui.showToast("الصندوق فارغ بالفعل");
    let word=prompt(`⚠️ سيتم تنزيل نسخة احتياطية ثم حذف جميع التذاكر (${cnt}) نهائياً.\nللتأكيد اكتب: تصفير`);
    if(!word||"تصفير"!==word.trim())return ui.showToast("تم الإلغاء");
    adminUI.exportBackup();
    let updates={};
    updates[`${e.rootPath}/tickets`]=null;
    updates[`${e.rootPath}/user_tickets`]=null;
    updates[`${e.rootPath}/codes`]=null;
    t.db.ref().update(updates).then(()=>{
      adminUI.logAction("تصفير الصندوق",`${cnt} تذكرة`,"حذف شامل مع نسخة احتياطية");
      ui.showToast("🧹 تم تصفير الصندوق بنجاح")
    })
  }
};

const sync={
  bindUserListeners(){
    if(!t.db||!t.myKey)return;
    if(t.boundUserKey===t.myKey)return;
    if(t.boundUserKey){
      t.db.ref(`${e.rootPath}/user_tickets/${t.boundUserKey}`).off();
      t.db.ref(`${e.rootPath}/bans/${t.boundUserKey}`).off();
      t.db.ref(`${e.rootPath}/vip_exempt/${t.boundUserKey}`).off()
    }
    t.boundUserKey=t.myKey;
    t.db.ref(`${e.rootPath}/user_tickets/${t.myKey}`).on("value",snap=>{
      t.myTickets=snap.val()||{};
      a.updateBadges();
      if(document.getElementById("layl-feedback-user-modal")){
        memberUI.renderMyTickets();
        "mine"===memberUI.activeTab&&memberUI.markRepliesRead()
      }
    });
    t.db.ref(`${e.rootPath}/bans/${t.myKey}`).on("value",snap=>{
      t.myBan=snap.val()||null;
      if(document.getElementById("layl-feedback-user-modal")&&"send"===memberUI.activeTab)memberUI.renderForm()
    });
    t.db.ref(`${e.rootPath}/vip_exempt/${t.myKey}`).on("value",snap=>{
      t.myVip=Boolean(snap.val());
      if(document.getElementById("layl-feedback-user-modal")&&"send"===memberUI.activeTab)memberUI.renderForm()
    })
  },
  syncAdminRole(){
    if(!t.db)return;
    let adm=a.isAdmin();
    if(adm&&!t.adminListenersBound){
      t.adminListenersBound=!0;
      t.db.ref(`${e.rootPath}/tickets`).on("value",snap=>{
        t.allTickets=snap.val()||{};
        a.updateBadges();
        adminUI.refreshAll()
      });
      t.db.ref(`${e.rootPath}/bans`).on("value",snap=>{
        t.bans=snap.val()||{};
        adminUI.refreshAll()
      });
      t.db.ref(`${e.rootPath}/vip_exempt`).on("value",snap=>{
        t.vipExempt=snap.val()||{};
        adminUI.refreshAll()
      })
    }else if(!adm&&t.adminListenersBound){
      t.adminListenersBound=!1;
      t.db.ref(`${e.rootPath}/tickets`).off();
      t.db.ref(`${e.rootPath}/bans`).off();
      t.db.ref(`${e.rootPath}/vip_exempt`).off();
      t.allTickets={};t.bans={};t.vipExempt={};
      a.updateBadges();
      adminUI.close()
    }
  },
  boot(){
    if("undefined"==typeof firebase){setTimeout(sync.boot,500);return}
    firebase.apps.length||firebase.initializeApp(e.firebase);
    t.db=firebase.database();
    t.db.ref("admins").on("value",snap=>{
      let v=snap.val()||{};
      t.adminUsers=Object.keys(v);
      a.detectIdentity();
      injector.injectButtons();
      sync.syncAdminRole();
      adminUI.renderAdminsList()
    });
    t.db.ref(`${e.rootPath}/settings`).on("value",snap=>{
      let v=snap.val();
      t.settings=v&&"object"==typeof v?Object.assign({},defaultSettings,v):Object.assign({},defaultSettings);
      if(document.getElementById("layl-feedback-user-modal")){
        memberUI.renderBanner();
        "send"===memberUI.activeTab&&memberUI.renderForm()
      }
      adminUI.refreshAll()
    });
    t.db.ref(`${e.rootPath}/templates`).on("value",snap=>{
      let v=snap.val();
      t.templates=v&&"object"==typeof v?v:Object.assign({},defaultTemplates);
      if(document.getElementById("layl-feedback-admin-modal")&&"templates"===adminUI.activeTab)adminUI.renderTemplates()
    });
    t.db.ref(`${e.rootPath}/public_ideas`).on("value",snap=>{
      t.publicIdeas=snap.val()||{};
      if(document.getElementById("layl-feedback-user-modal")&&"public"===memberUI.activeTab)memberUI.renderPublicBoard();
      if(document.getElementById("layl-feedback-admin-modal")&&"public"===adminUI.activeTab)adminUI.renderPublicAdmin()
    });
    a.detectIdentity();
    sync.bindUserListeners();
    sync.syncAdminRole()
  }
};

(()=>{
  ui.injectStyles();
  injector.bindLoginHooks();
  injector.injectButtons();
  injector.startObserver();
  if("undefined"!=typeof firebase||document.getElementById("firebase-core-script"))sync.boot();
  else{
    let sc=document.createElement("script");
    sc.id="firebase-core-script";
    sc.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
    document.head.appendChild(sc);
    sc.onload=()=>{
      let dbSc=document.createElement("script");
      dbSc.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
      document.head.appendChild(dbSc);
      dbSc.onload=sync.boot
    }
  }
  setTimeout(()=>{a.detectIdentity();injector.injectButtons();sync.bindUserListeners()},1500);
  window.LaylFeedback={
    open:memberUI.open,
    close:memberUI.close,
    openAdmin:adminUI.open,
    closeAdmin:adminUI.close
  }
})();

}();
