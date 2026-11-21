!function(){"use strict";
let e=document.createElement("style");
e.id="layl-custom-ids-core-styles";
e.innerHTML=`
        @keyframes bgShine { 
            0% { background-position: 0% 50%; } 
            50% { background-position: 100% 50%; } 
            100% { background-position: 0% 50%; } 
        }
        @keyframes royalGlow {
            0% { filter: drop-shadow(0px 0px 1px rgba(184, 134, 11, 0.3)); }
            50% { filter: drop-shadow(0px 0px 4px rgba(184, 134, 11, 0.8)); }
            100% { filter: drop-shadow(0px 0px 1px rgba(184, 134, 11, 0.3)); }
        }
        @keyframes mythicRainbow { 
            0% { background-position: 0% 50%; } 
            50% { background-position: 100% 50%; } 
            100% { background-position: 0% 50%; } 
        }
        @keyframes mythicPulse {
            0% { filter: drop-shadow(0px 0px 2px rgba(255, 0, 255, 0.5)); }
            50% { filter: drop-shadow(0px 0px 8px rgba(0, 255, 255, 0.8)); }
            100% { filter: drop-shadow(0px 0px 2px rgba(255, 0, 255, 0.5)); }
        }
        @keyframes fireFlicker {
            0% { filter: drop-shadow(0px 0px 2px rgba(255,69,0,0.6)); }
            50% { filter: drop-shadow(0px 0px 6px rgba(255,140,0,0.9)); }
            100% { filter: drop-shadow(0px 0px 2px rgba(255,69,0,0.6)); }
        }
        @keyframes cosmicPulse {
            0% { filter: drop-shadow(0px 0px 2px rgba(0, 255, 255, 0.5)); }
            50% { filter: drop-shadow(0px 0px 8px rgba(138, 43, 226, 0.9)); }
            100% { filter: drop-shadow(0px 0px 2px rgba(0, 255, 255, 0.5)); }
        }
        @keyframes emeraldGlow {
            0% { filter: drop-shadow(0px 0px 1px rgba(16, 185, 129, 0.35)); }
            50% { filter: drop-shadow(0px 0px 5px rgba(52, 211, 153, 0.8)); }
            100% { filter: drop-shadow(0px 0px 1px rgba(16, 185, 129, 0.35)); }
        }
        @keyframes rubyGlow {
            0% { filter: drop-shadow(0px 0px 1px rgba(225, 29, 72, 0.35)); }
            50% { filter: drop-shadow(0px 0px 5px rgba(244, 63, 94, 0.8)); }
            100% { filter: drop-shadow(0px 0px 1px rgba(225, 29, 72, 0.35)); }
        }
        @keyframes electricPulse {
            0% { filter: drop-shadow(0px 0px 1px rgba(37, 99, 235, 0.4)); }
            50% { filter: drop-shadow(0px 0px 6px rgba(6, 182, 212, 0.9)); }
            100% { filter: drop-shadow(0px 0px 1px rgba(37, 99, 235, 0.4)); }
        }
        .tier-gold { 
            background: linear-gradient(to right, #734A12, #B8860B, #996515, #B8860B, #734A12) !important; 
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; 
            animation: bgShine 3s linear infinite, royalGlow 2.5s ease-in-out infinite !important; 
        }
        .tier-diamond { 
            background: linear-gradient(45deg, #005A9C, #00E5FF, #005A9C) !important; 
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; 
            filter: drop-shadow(0px 0px 2px rgba(0, 229, 255, 0.3)) !important; 
        }
        .tier-legendary { 
            background: linear-gradient(90deg, #D32F2F, #FF5722, #D32F2F) !important; 
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; 
            animation: bgShine 2.5s linear infinite !important; 
            filter: drop-shadow(0px 0px 2px rgba(255, 87, 34, 0.3)) !important; 
        }
        .tier-mythic { 
            background: linear-gradient(90deg, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000) !important; 
            background-size: 300% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; 
            animation: mythicRainbow 3s linear infinite, mythicPulse 2s ease-in-out infinite !important; font-weight: 900 !important;
        }
        .tier-royal {
            background: linear-gradient(45deg, #4b0082, #ffd700, #8a2be2, #ffd700, #4b0082) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3s linear infinite, royalGlow 2.5s ease-in-out infinite !important; font-weight: 900 !important;
        }
        .tier-inferno {
            background: linear-gradient(to right, #ff0000, #ff4500, #ffa500, #ff4500, #ff0000) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 2s linear infinite, fireFlicker 1.5s ease-in-out infinite !important; font-weight: 900 !important;
        }
        .tier-cosmic {
            background: linear-gradient(90deg, #000000, #00bfff, #8a2be2, #000000) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 4s linear infinite, cosmicPulse 2.5s ease-in-out infinite !important; font-weight: 900 !important;
        }
        .tier-emerald {
            background: linear-gradient(90deg, #065f46, #10b981, #34d399, #10b981, #065f46) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3s linear infinite, emeraldGlow 2.5s ease-in-out infinite !important; font-weight: 800 !important;
        }
        .tier-ruby {
            background: linear-gradient(45deg, #881337, #e11d48, #fb7185, #e11d48, #881337) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 2.8s linear infinite, rubyGlow 2.2s ease-in-out infinite !important; font-weight: 800 !important;
        }
        .tier-platinum {
            background: linear-gradient(90deg, #334155, #94a3b8, #475569, #cbd5e1, #334155) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3s linear infinite !important;
            filter: drop-shadow(0px 0px 1.5px rgba(71, 85, 105, 0.4)) !important; font-weight: 800 !important;
        }
        .tier-rose {
            background: linear-gradient(90deg, #831843, #ec4899, #f472b6, #db2777, #831843) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3.2s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(236, 72, 153, 0.35)) !important; font-weight: 800 !important;
        }
        .tier-obsidian {
            background: linear-gradient(90deg, #09090b, #52525b, #18181b, #a1a1aa, #09090b) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3.5s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.35)) !important; font-weight: 900 !important;
        }
        .tier-aurora {
            background: linear-gradient(90deg, #0f766e, #14b8a6, #6366f1, #a855f7, #0f766e) !important;
            background-size: 250% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3.5s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(99, 102, 241, 0.35)) !important; font-weight: 800 !important;
        }
        .tier-ocean {
            background: linear-gradient(45deg, #0c4a6e, #0284c7, #06b6d4, #0284c7, #0c4a6e) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(2, 132, 199, 0.35)) !important; font-weight: 800 !important;
        }
        .tier-sunset {
            background: linear-gradient(90deg, #6b21a8, #db2777, #ea580c, #d97706, #6b21a8) !important;
            background-size: 250% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3.2s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(234, 88, 12, 0.35)) !important; font-weight: 800 !important;
        }
        .tier-electric {
            background: linear-gradient(90deg, #1e3a8a, #2563eb, #06b6d4, #2563eb, #1e3a8a) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 2.2s linear infinite, electricPulse 2s ease-in-out infinite !important; font-weight: 900 !important;
        }
        .tier-amethyst {
            background: linear-gradient(45deg, #4c1d95, #9333ea, #c084fc, #7e22ce, #4c1d95) !important;
            background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            animation: bgShine 3s linear infinite !important;
            filter: drop-shadow(0px 0px 2px rgba(147, 51, 234, 0.4)) !important; font-weight: 800 !important;
        }
        .custom-id-text { display: inline-block; }
        .custom-tier-opt {
            display: flex; align-items: center; justify-content: space-between;
            padding: 5px 7px; border-radius: 5px; border: 1px solid #e9ecef;
            background: #f8f9fa; cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .custom-tier-opt:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .custom-tier-opt.active { background: #eff6ff; border-color: #3b82f6; }
    `;
document.getElementById("layl-custom-ids-core-styles")||document.head.appendChild(e);

let t={
  default:{label:"إفتراضي",notif:"الإفتراضي"},
  gold:{label:"ذهبي",notif:"الذهبي الملكي"},
  diamond:{label:"ماسي",notif:"الماسي"},
  legendary:{label:"أسطوري",notif:"الأسطوري"},
  mythic:{label:"خرافي",notif:"الخرافي"},
  royal:{label:"ملكي",notif:"الملكي"},
  inferno:{label:"ناري",notif:"الناري"},
  cosmic:{label:"كوني",notif:"الكوني"},
  emerald:{label:"زمردي",notif:"الزمردي"},
  ruby:{label:"ياقوتي",notif:"الياقوتي"},
  platinum:{label:"بلاتيني",notif:"البلاتيني"},
  rose:{label:"وردي لؤلؤي",notif:"الوردي اللؤلؤي"},
  obsidian:{label:"أوبسيديان",notif:"الأوبسيديان"},
  aurora:{label:"شفق قطبي",notif:"الشفق القطبي"},
  ocean:{label:"محيطي",notif:"المحيطي"},
  sunset:{label:"غروب",notif:"الغروب"},
  electric:{label:"برقي",notif:"البرقي"},
  amethyst:{label:"جمشتي",notif:"الجمشتي"}
};
let i=Object.keys(t).map(k=>`tier-${k}`);

let defaultSettings={
  enabled:!0,
  preventDuplicates:!0,
  enableNotifs:!0,
  eventTier:""
};

let r={
  dbPath:"layl_custom_ids_v2",
  notifPath:"layl_custom_notifs",
  adminPath:"layl_custom_ids_admin",
  adminUsers:[]
};

let a={
  cache:{},
  reserved:{},
  adminLogs:[],
  settings:Object.assign({},defaultSettings),
  myUsername:localStorage.getItem("pc_username")||null,
  listenedNotifUser:null,
  db:null,
  toastQueue:[],
  isToasting:!1
};

let n={
  sanitizeName:x=>x?x.replace(/[.#$\[\]\/]/g,"_").trim():null,
  escapeHTML:x=>x?String(x).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]||c):"",
  isAdmin(){
    if(!a.myUsername||!r.adminUsers.length)return!1;
    let s=n.sanitizeName(a.myUsername);
    return r.adminUsers.includes(a.myUsername)||(s&&r.adminUsers.includes(s))
  },
  formatDate(ts){
    if(!ts)return"-";
    try{return new Date(ts).toLocaleString("ar-EG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"-"}
  },
  formatRemaining(exp){
    if(!exp)return"دائم";
    let diff=exp-Date.now();
    if(diff<=0)return"منتهي";
    let hrs=Math.ceil(diff/36e5);
    if(hrs<24)return`${hrs} ساعة`;
    let days=Math.floor(hrs/24),remH=hrs%24;
    return remH&&days<7?`${days} ي و ${remH} س`:`${days} يوم`
  },
  isExpired:d=>Boolean(d&&d.expiresAt&&Date.now()>=d.expiresAt),
  isActive:d=>Boolean(d&&d.id&&!d.paused&&!n.isExpired(d)),
  getDurationText(daysVal){
    if(!daysVal||"permanent"===daysVal)return"بشكل دائم";
    let d=parseInt(daysVal);
    if(1===d)return"لمدة يوم";
    if(3===d)return"لمدة 3 أيام";
    if(7===d)return"لمدة أسبوع";
    if(14===d)return"لمدة أسبوعين";
    if(30===d)return"لمدة شهر";
    if(90===d)return"لمدة 3 شهور";
    if(365===d)return"لمدة سنة";
    return`لمدة ${d} يوم`
  },
  findIdOwners(idNum,excludeKey){
    let target=Number(idNum),owners=[];
    if(!target)return owners;
    Object.entries(a.cache||{}).forEach(([k,d])=>{
      if(k===excludeKey||!d||!d.id)return;
      if(Number(d.id)===target&&!n.isExpired(d))owners.push(k)
    });
    return owners
  },
  getDuplicatesMap(){
    let map={};
    Object.entries(a.cache||{}).forEach(([k,d])=>{
      if(!d||!d.id||n.isExpired(d))return;
      let idStr=String(d.id);
      map[idStr]||(map[idStr]=[]);
      map[idStr].push(k)
    });
    let dups={};
    Object.entries(map).forEach(([idStr,users])=>{if(users.length>1)dups[idStr]=users});
    return dups
  },
  getOnlineUsers(){
    let list=[],seen=new Set;
    document.querySelectorAll("#sidebar-users-container .user-identity").forEach(el=>{
      let u=n.captureUsername(el);
      if(u&&u.username){
        let san=n.sanitizeName(u.username);
        if(san&&!seen.has(san)){seen.add(san);list.push({username:u.username,san,displayName:u.displayName||u.username})}
      }
    });
    return list
  },
  renderIdBadgeHTML(idNum,tierKey,fontSize="13px"){
    let tk=t[tierKey]?tierKey:"gold";
    let cls="default"===tk?"text-muted":`custom-id-text tier-${tk}`;
    return`<span class="lca-id-pill"><span class="${cls}" style="font-size:${fontSize}; font-weight:800; direction:ltr;">#${n.escapeHTML(idNum)}</span></span>`
  },
  showNotification(msg,type="success"){
    let id="custom-id-modal-"+Date.now(),html=`
      <div id="${id}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 9999999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
        <div style="background: #fff; width: 90%; max-width: 320px; border-radius: 16px; padding: 25px 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transform: scale(0.8); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); direction: rtl; font-family: Tahoma, Arial;">
          <div style="width: 65px; height: 65px; border-radius: 50%; background: ${"success"===type?"#f0fdf4":"#fef2f2"}; color: ${"success"===type?"#198754":"#dc3545"}; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 15px;">
            <i class="fas ${"success"===type?"fa-gift":"fa-exclamation-circle"}"></i>
          </div>
          <h4 style="margin: 0 0 8px; color: #333; font-weight: bold; font-size: 18px;">${"success"===type?"تهانينا!":"تنبيه"}</h4>
          <p style="margin: 0 0 20px; color: #666; font-size: 14px; line-height: 1.6;">${msg}</p>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend",html);
    let el=document.getElementById(id);
    requestAnimationFrame(()=>{el.style.opacity="1",el.firstElementChild.style.transform="scale(1)"});
    setTimeout(()=>{let x=document.getElementById(id);x&&(x.style.opacity="0",setTimeout(()=>x.remove(),300))},4e3)
  },
  showToast(msg){a.toastQueue.push(msg);n.processToast()},
  processToast(){
    if(a.isToasting||0===a.toastQueue.length)return;
    a.isToasting=!0;
    let msg=a.toastQueue.shift(),d=document.createElement("div");
    d.className="lca-toast";
    d.innerHTML=msg;
    document.body.appendChild(d);
    setTimeout(()=>{d.remove();a.isToasting=!1;n.processToast()},3300)
  },
  getCleanText(el){
    if(!el)return null;
    let c=el.cloneNode(!0);
    return c.querySelectorAll("img, i, svg, .user-identity-badge-icon, .user-identity-super").forEach(x=>x.remove()),c.textContent.trim()
  },
  captureUsername(el){
    if(!el||el.classList.contains("guest")||el.classList.contains("is-guest")||el.closest(".guest, .is-guest, .guest-user"))return null;
    let u=null,dn=null,av=el.querySelector(".message-avatar");
    av&&(u=av.getAttribute("data-username"));
    let idEl=el.classList.contains("user-identity")?el:el.querySelector(".user-identity");
    idEl&&(u||(u=idEl.getAttribute("data-username")||idEl.getAttribute("data-user-id")),dn=n.getCleanText(idEl.querySelector(".user-identity-name")||idEl));
    let mt=el.querySelector(".message-text")||el.querySelector(".message-body");
    return!u&&mt&&(u=mt.getAttribute("data-username")),u||(u=el.getAttribute("data-username")||el.getAttribute("data-user")),u?{username:u,displayName:dn||u}:null
  },
  updateMyUsername(u){
    if(!u||!u.trim())return;
    let clean=u.trim();
    if(a.myUsername!==clean){
      a.myUsername=clean;
      localStorage.setItem("pc_username",clean);
      s.injectSettingsDashboardBtn();
      l()
    }
  }
};

let o=el=>{
  let u=el.getAttribute("data-username");
  if(!u)return;
  let origId=el.getAttribute("data-user-id");
  if(!origId)return;
  let san=n.sanitizeName(u),d=a.cache[san],customNum=null,tierKey="gold";
  if(!1!==a.settings.enabled&&n.isActive(d)){
    customNum=d.id;
    tierKey=a.settings.eventTier&&t[a.settings.eventTier]?a.settings.eventTier:(d.tier||"gold");
    t[tierKey]||(tierKey="gold")
  }
  let col=el.querySelector(".user-country-id-column");
  if(!col)return;
  let span=null,ch=col.children;
  for(let idx=0;idx<ch.length;idx++){
    let node=ch[idx];
    if("SPAN"===node.tagName&&(node.textContent.trim().startsWith("#")||"true"===node.getAttribute("data-modified"))){span=node;break}
  }
  if(span){
    if(null!==customNum){
      let txt=`#${customNum}`;
      "default"===tierKey
        ?(span.innerHTML!==txt||!span.classList.contains("tier-default")||!span.classList.contains("text-muted")||span.classList.contains("custom-id-text"))&&(span.innerHTML=txt,span.classList.remove("custom-id-text",...i),span.classList.add("text-muted","tier-default"),span.setAttribute("data-modified","true"))
        :span.innerHTML===txt&&span.classList.contains(`tier-${tierKey}`)||(span.innerHTML=txt,span.classList.remove("text-muted",...i),span.classList.add("custom-id-text",`tier-${tierKey}`),span.setAttribute("data-modified","true"))
    }else{
      ("true"===span.getAttribute("data-modified")||span.textContent.trim()!==`#${origId}`)&&(span.innerHTML=`#${origId}`,span.classList.remove("custom-id-text",...i),span.classList.add("text-muted"),span.removeAttribute("data-modified"))
    }
  }
};

let admin={
  activeTab:"members",
  injectStyles(){
    if(document.getElementById("layl-cid-admin-styles"))return;
    let st=document.createElement("style");
    st.id="layl-cid-admin-styles";
    st.innerHTML=`
      .lca-overlay { position: fixed; inset: 0; background: rgba(8, 10, 18, 0.9); z-index: 2147483645; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity: 0; visibility: hidden; transition: opacity 0.25s ease; direction: rtl; font-family: 'Segoe UI', tahoma, sans-serif; }
      .lca-overlay.active { opacity: 1; visibility: visible; }
      .lca-sub-overlay { z-index: 2147483646; background: rgba(6, 8, 16, 0.88); }
      .lca-box { background: linear-gradient(180deg, rgba(28, 31, 56, 0.98) 0%, rgba(16, 18, 34, 0.99) 100%); border: 1px solid rgba(212, 175, 55, 0.34); border-radius: 20px; width: 95%; max-width: 620px; max-height: 88vh; max-height: 88dvh; padding: 16px 18px 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.85); transform: scale(0.94) translateY(15px); opacity: 0; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; color: #f8fafc; }
      .lca-sub-box { max-width: 460px; border-color: rgba(212, 175, 55, 0.45); }
      .lca-overlay.active .lca-box { transform: scale(1) translateY(0); opacity: 1; }
      .lca-header, .lca-stats, .lca-tabs { flex-shrink: 0 !important; }
      .lca-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .lca-title { display: flex; align-items: center; gap: 8px; color: #D4AF37; font-weight: 800; font-size: 15.5px; }
      .lca-ctrl-btn { background: rgba(255,255,255,0.09); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; transition: 0.2s; }
      .lca-ctrl-btn:hover { background: rgba(255,255,255,0.18); }
      .lca-ctrl-close:hover { background: rgba(239, 68, 68, 0.8); }
      .lca-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 11px; }
      .lca-stat { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 7px 4px; text-align: center; }
      .lca-stat-val { font-size: 13.5px; font-weight: 800; color: #D4AF37; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .lca-stat-lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }
      .lca-tabs { display: flex; height: 42px; min-height: 42px; background: rgba(0,0,0,0.34); border-radius: 12px; margin-bottom: 12px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; border: 1px solid rgba(255,255,255,0.05); }
      .lca-tabs::-webkit-scrollbar { display: none; }
      .lca-tab { flex: 1 0 auto; background: transparent; color: #94a3b8; border: none; padding: 0 10px; height: 100%; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: inherit; font-size: 11.5px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; }
      .lca-tab.active { background: rgba(212, 175, 55, 0.16); color: #D4AF37; border-bottom: 2px solid #D4AF37; }
      .lca-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; padding-left: 4px; margin-left: -4px; -webkit-overflow-scrolling: touch; }
      .lca-body::-webkit-scrollbar { width: 5px; }
      .lca-body::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.35); border-radius: 10px; }
      .lca-view { display: none; }
      .lca-view.active { display: block; }
      .lca-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; text-align: right; }
      .lca-card-title { font-size: 12.5px; font-weight: 700; color: #D4AF37; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
      .lca-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      .lca-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
      .lca-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .lca-input { width: 100%; background: rgba(0, 0, 0, 0.34); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 8px 10px; border-radius: 10px; font-family: inherit; font-size: 12.5px; outline: none; box-sizing: border-box; transition: border 0.2s; }
      .lca-input:focus { border-color: #D4AF37; }
      .lca-input option { background: #16182c; color: #fff; }
      .lca-label { display: block; font-size: 11px; color: #cbd5e1; font-weight: 700; margin-bottom: 4px; }
      .lca-btn { border: none; border-radius: 10px; padding: 9px 12px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
      .lca-btn:active { transform: scale(0.97); }
      .lca-btn-gold { background: linear-gradient(135deg, #D4AF37, #b59226); color: #161824; width: 100%; }
      .lca-btn-crimson { background: linear-gradient(135deg, #8b1836, #5c0f22); color: #fff; width: 100%; }
      .lca-btn-dark { background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.08); }
      .lca-btn-dark:hover { background: rgba(255,255,255,0.15); }
      .lca-btn-danger { background: rgba(239, 68, 68, 0.16); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.35); }
      .lca-btn-danger:hover { background: rgba(239, 68, 68, 0.35); color: #fff; }
      .lca-btn-success { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.35); }
      .lca-btn-info { background: rgba(56, 189, 248, 0.16); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3); }
      .lca-btn-warn { background: rgba(245, 158, 11, 0.18); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.35); }
      .lca-mini { padding: 5px 8px; font-size: 11px; border-radius: 8px; }
      .lca-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; }
      .lca-tag-gold { background: rgba(212,175,55,0.18); color: #D4AF37; }
      .lca-tag-green { background: rgba(16,185,129,0.16); color: #34d399; }
      .lca-tag-red { background: rgba(239,68,68,0.18); color: #f87171; }
      .lca-tag-blue { background: rgba(56,189,248,0.18); color: #38bdf8; }
      .lca-tag-purple { background: rgba(168,85,247,0.2); color: #c084fc; }
      .lca-tag-gray { background: rgba(148,163,184,0.18); color: #94a3b8; }
      .lca-id-pill { display: inline-flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid rgba(212,175,55,0.45); border-radius: 8px; padding: 2px 9px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
      .lca-tier-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 200px; overflow-y: auto; padding: 4px; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; }
      .lca-tier-grid::-webkit-scrollbar { width: 4px; }
      .lca-tier-grid::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.35); border-radius: 6px; }
      .lca-tier-card { display: flex; align-items: center; justify-content: space-between; gap: 5px; background: #ffffff; border: 2px solid transparent; border-radius: 8px; padding: 5px 8px; cursor: pointer; transition: 0.15s; }
      .lca-tier-card:hover { border-color: rgba(212,175,55,0.6); }
      .lca-tier-card.active { border-color: #D4AF37; background: #fffbeb; box-shadow: 0 0 0 1px #D4AF37; }
      .lca-setting-row { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 11px; margin-bottom: 7px; gap: 10px; }
      .lca-switch { position: relative; width: 42px; height: 22px; flex-shrink: 0; }
      .lca-switch input { opacity: 0; width: 0; height: 0; }
      .lca-slider { position: absolute; cursor: pointer; inset: 0; background: #334155; border-radius: 22px; transition: 0.25s; }
      .lca-slider:before { content: ""; position: absolute; height: 16px; width: 16px; right: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.25s; }
      .lca-switch input:checked + .lca-slider { background: #10b981; }
      .lca-switch input:checked + .lca-slider:before { transform: translateX(-20px); }
      .lca-prog-wrap { width: 100%; height: 7px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin: 4px 0 7px; }
      .lca-prog-bar { height: 100%; background: linear-gradient(90deg, #8b1836, #D4AF37); border-radius: 10px; }
      .lca-suggest-chip { background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); color: #fcd34d; border-radius: 8px; padding: 4px 8px; font-size: 11.5px; font-weight: bold; cursor: pointer; font-family: inherit; direction: ltr; }
      .lca-suggest-chip:hover { background: rgba(212,175,55,0.28); color: #fff; }
      .lca-toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); background: rgba(20, 22, 40, 0.96); border: 1px solid rgba(212, 175, 55, 0.45); color: #f8fafc; padding: 11px 24px; border-radius: 50px; z-index: 2147483647; font-family: tahoma, sans-serif; font-size: 13.5px; box-shadow: 0 10px 30px rgba(0,0,0,0.75); pointer-events: none; opacity: 0; backdrop-filter: blur(8px); animation: lca-toast-anim 3.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; max-width: 88vw; font-weight: bold; }
      @keyframes lca-toast-anim { 0% { opacity: 0; transform: translate(-50%, 0px) scale(0.85); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 85% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -95%) scale(0.85); } }
      @media (max-width: 500px) { .lca-box { padding: 12px 13px 14px; width: 96%; } .lca-grid-3 { grid-template-columns: repeat(2, 1fr); } .lca-stat-val { font-size: 12px; } }
    `;
    document.head.appendChild(st)
  },
  logAction(action,target,details){
    if(!a.db)return;
    a.db.ref(`${r.adminPath}/logs`).push({
      admin:a.myUsername||"الإدارة",
      action:action||"",
      target:target||"-",
      details:details||"",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).catch(()=>{})
  },
  sendUserNotif(sanUser,message,type="success"){
    if(!a.db||!sanUser||!message||!1===a.settings.enableNotifs)return;
    a.db.ref(`${r.notifPath}/${sanUser}`).push({message,type}).catch(()=>{})
  },
  buildTierGridHTML(selectedTier,previewNum,prefix){
    let pTxt=previewNum?`#${n.escapeHTML(previewNum)}`:"#77";
    return Object.keys(t).map(k=>{
      let cls="default"===k?"text-muted":`custom-id-text tier-${k}`;
      return`
        <div class="lca-tier-card ${prefix}-tier-card ${k===selectedTier?"active":""}" data-tier="${k}">
          <span style="font-size:11px; color:#1e293b; font-weight:800;">${t[k].label}</span>
          <span class="${prefix}-tier-prev ${cls}" style="font-size:12.5px; font-weight:800; direction:ltr;">${pTxt}</span>
        </div>`
    }).join("")
  },
  open(){
    if(!n.isAdmin())return alert("هذه اللوحة متاحة للإدارة فقط.");
    admin.injectStyles();
    let ov=document.getElementById("layl-cid-admin-modal");
    ov&&ov.remove();
    ov=document.createElement("div");
    ov.id="layl-cid-admin-modal";
    ov.className="lca-overlay";
    let tierOptions=Object.keys(t).map(k=>`<option value="${k}">${t[k].label}</option>`).join("");
    let tierFilterOpts=Object.keys(t).map(k=>`<option value="tier:${k}">رتبة: ${t[k].label}</option>`).join("");
    ov.innerHTML=`
      <div class="lca-box">
        <div class="lca-header">
          <div class="lca-title"><i class="fas fa-crown"></i> لوحة تحكم الأرقام المميزة</div>
          <div class="lca-row" style="gap:6px;">
            <button type="button" class="lca-ctrl-btn" id="lca-btn-quick-grant" title="منح رقم مميز جديد"><i class="fas fa-plus"></i></button>
            <button type="button" class="lca-ctrl-btn" id="lca-btn-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
            <button type="button" class="lca-ctrl-btn lca-ctrl-close" id="lca-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lca-stats">
          <div class="lca-stat"><div class="lca-stat-val" id="lca-st-active">0</div><div class="lca-stat-lbl">أرقام نشطة</div></div>
          <div class="lca-stat"><div class="lca-stat-val" id="lca-st-expired">0</div><div class="lca-stat-lbl">منتهية</div></div>
          <div class="lca-stat"><div class="lca-stat-val" id="lca-st-dups">0</div><div class="lca-stat-lbl">تعارض / محجوز</div></div>
          <div class="lca-stat"><div class="lca-stat-val" id="lca-st-status">...</div><div class="lca-stat-lbl">الوضع</div></div>
        </div>
        <div class="lca-tabs">
          <button type="button" class="lca-tab active" data-ctab="members"><i class="fas fa-list-ol"></i> الأرقام</button>
          <button type="button" class="lca-tab" data-ctab="grant"><i class="fas fa-magic"></i> منح ونقل</button>
          <button type="button" class="lca-tab" data-ctab="reserved"><i class="fas fa-lock"></i> الحجز</button>
          <button type="button" class="lca-tab" data-ctab="events"><i class="fas fa-bolt"></i> فعاليات وجماعي</button>
          <button type="button" class="lca-tab" data-ctab="stats"><i class="fas fa-chart-bar"></i> المعرض والإحصاء</button>
          <button type="button" class="lca-tab" data-ctab="logs"><i class="fas fa-history"></i> السجل والصيانة</button>
        </div>
        <div class="lca-body">
          <!-- TAB 1: MEMBERS & IDS -->
          <div id="lca-view-members" class="lca-view active">
            <div class="lca-row" style="margin-bottom:8px;">
              <input type="text" id="lca-search" class="lca-input" style="flex:1; min-width:130px;" placeholder="🔍 ابحث بالاسم، #الرقم، أو الملاحظة..." autocomplete="off">
              <select id="lca-filter" class="lca-input" style="width:125px;">
                <option value="all">الكل</option>
                <option value="active">النشطة فقط</option>
                <option value="online">المتواجدون الآن</option>
                <option value="permanent">الدائمة</option>
                <option value="temp">المؤقتة</option>
                <option value="expiring">تنتهي قريباً</option>
                <option value="expired">المنتهية</option>
                <option value="paused">موقوفة مؤقتاً</option>
                <option value="dups">⚠️ أرقام مكررة</option>
                ${tierFilterOpts}
              </select>
              <select id="lca-sort" class="lca-input" style="width:105px;">
                <option value="id_asc">الأندر (تصاعدي)</option>
                <option value="id_desc">الرقم (تنازلي)</option>
                <option value="recent">الأحدث منحاً</option>
                <option value="exp_soon">الأقرب انتهاءً</option>
                <option value="name">أبجدي</option>
              </select>
            </div>
            <div id="lca-mem-count" style="font-size:11px; color:#94a3b8; margin-bottom:6px;"></div>
            <div id="lca-members-list"></div>
          </div>

          <!-- TAB 2: GRANT & TRANSFER -->
          <div id="lca-view-grant" class="lca-view">
            <div class="lca-card" style="border-color:rgba(212,175,55,0.35);">
              <div class="lca-card-title">
                <span><i class="fas fa-award"></i> منح رقم مميز مباشر</span>
                <button type="button" id="lca-gr-reload-online" class="lca-btn lca-btn-dark lca-mini"><i class="fas fa-users"></i> تحديث المتواجدين</button>
              </div>
              <div class="lca-grid-2" style="margin-bottom:7px;">
                <div>
                  <label class="lca-label">اختر من المتواجدين (سريع)</label>
                  <select id="lca-gr-online" class="lca-input"><option value="">-- اختر عضواً متواجداً --</option></select>
                </div>
                <div>
                  <label class="lca-label">أو اكتب اسم المستخدم (Username)</label>
                  <input type="text" id="lca-gr-user" class="lca-input" placeholder="اسم المستخدم..." autocomplete="off">
                </div>
              </div>
              <div class="lca-grid-2" style="margin-bottom:6px;">
                <div>
                  <label class="lca-label">الرقم المميز</label>
                  <input type="number" id="lca-gr-id" class="lca-input" min="1" placeholder="مثلاً: 77" autocomplete="off">
                </div>
                <div>
                  <label class="lca-label">مدة الصلاحية</label>
                  <select id="lca-gr-dur" class="lca-input">
                    <option value="permanent">دائم</option>
                    <option value="1">يوم واحد</option>
                    <option value="3">3 أيام</option>
                    <option value="7">أسبوع (7 أيام)</option>
                    <option value="14">أسبوعان</option>
                    <option value="30">شهر (30 يوم)</option>
                    <option value="90">3 شهور</option>
                    <option value="365">سنة</option>
                    <option value="custom">مدة مخصصة بالأيام...</option>
                  </select>
                </div>
              </div>
              <div id="lca-gr-custom-dur-wrap" style="display:none; margin-bottom:7px;">
                <label class="lca-label">عدد الأيام المخصص</label>
                <input type="number" id="lca-gr-custom-days" class="lca-input" min="1" max="3650" placeholder="مثلاً: 45">
              </div>
              <div id="lca-gr-avail" style="font-size:11.5px; margin-bottom:7px; min-height:18px;"></div>

              <div style="margin-bottom:8px;">
                <div class="lca-row" style="justify-content:space-between; margin-bottom:4px;">
                  <span class="lca-label" style="margin:0;">اقتراح أرقام نادرة متاحة:</span>
                  <div class="lca-row" style="gap:4px;">
                    <button type="button" class="lca-btn lca-btn-dark lca-mini lca-gen-btn" data-gen="2d">ثنائي</button>
                    <button type="button" class="lca-btn lca-btn-dark lca-mini lca-gen-btn" data-gen="3r">ثلاثي مكرر</button>
                    <button type="button" class="lca-btn lca-btn-dark lca-mini lca-gen-btn" data-gen="4s">رباعي مميز</button>
                  </div>
                </div>
                <div id="lca-gr-suggests" class="lca-row" style="gap:5px;"></div>
              </div>

              <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                  <label class="lca-label" style="margin:0;">اختر الرتبة والتصميم (18 رتبة):</label>
                  <div id="lca-gr-live-box">${n.renderIdBadgeHTML("77","gold","14px")}</div>
                </div>
                <input type="hidden" id="lca-gr-tier" value="gold">
                <div id="lca-gr-tier-grid" class="lca-tier-grid">${admin.buildTierGridHTML("gold","77","gr")}</div>
              </div>

              <div class="lca-grid-2" style="margin-bottom:8px;">
                <div><label class="lca-label">ملاحظة إدارية سرية (اختياري)</label><input type="text" id="lca-gr-note" class="lca-input" placeholder="فائز مسابقة، مزاد..."></div>
                <div><label class="lca-label">رسالة إشعار مخصصة (اختياري)</label><input type="text" id="lca-gr-notif-msg" class="lca-input" placeholder="اتركه فارغاً للافتراضي"></div>
              </div>
              <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#cbd5e1; margin-bottom:9px; cursor:pointer;">
                <input type="checkbox" id="lca-gr-send-notif" checked> إرسال إشعار تهنئة فوري للعضو
              </label>
              <button type="button" id="lca-btn-do-grant" class="lca-btn lca-btn-gold"><i class="fas fa-check-circle"></i> منح وتفعيل الرقم الآن</button>
            </div>

            <div class="lca-card" style="border-color:rgba(56,189,248,0.3);">
              <div class="lca-card-title" style="color:#7dd3fc;"><span><i class="fas fa-exchange-alt"></i> نقل ملكية رقم بين عضوين</span></div>
              <div class="lca-grid-2" style="margin-bottom:8px;">
                <div><label class="lca-label">من العضو (المالك الحالي)</label><input type="text" id="lca-tr-from" class="lca-input" placeholder="Username الحالي"></div>
                <div><label class="lca-label">إلى العضو (المالك الجديد)</label><input type="text" id="lca-tr-to" class="lca-input" placeholder="Username الجديد"></div>
              </div>
              <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#cbd5e1; margin-bottom:8px; cursor:pointer;">
                <input type="checkbox" id="lca-tr-notify" checked> إشعار الطرفين بعملية النقل
              </label>
              <button type="button" id="lca-btn-do-transfer" class="lca-btn lca-btn-info" style="width:100%;"><i class="fas fa-exchange-alt"></i> تنفيذ النقل مع الرتبة والمدة</button>
            </div>
          </div>

          <!-- TAB 3: RESERVED IDS -->
          <div id="lca-view-reserved" class="lca-view">
            <div class="lca-card" style="border-color:rgba(245,158,11,0.35);">
              <div class="lca-card-title" style="color:#fcd34d;"><span><i class="fas fa-lock"></i> حجز رقم نادر للمزادات أو الفعاليات</span></div>
              <div class="lca-grid-2" style="margin-bottom:7px;">
                <div><label class="lca-label">الرقم المراد حجزه</label><input type="number" id="lca-res-id" class="lca-input" min="1" placeholder="مثلاً: 1 أو 10 أو 777"></div>
                <div><label class="lca-label">سبب الحجز / مخصص لـ</label><input type="text" id="lca-res-note" class="lca-input" placeholder="جائزة المسابقة القادمة..."></div>
              </div>
              <button type="button" id="lca-btn-add-res" class="lca-btn lca-btn-warn" style="width:100%;"><i class="fas fa-lock"></i> إضافة الرقم لقائمة الحجز</button>
            </div>
            <div id="lca-reserved-list"></div>
          </div>

          <!-- TAB 4: EVENTS & BULK -->
          <div id="lca-view-events" class="lca-view">
            <div class="lca-card" style="border-color:rgba(192,132,252,0.4);">
              <div class="lca-card-title" style="color:#e9d5ff;"><span><i class="fas fa-theater-masks"></i> وضع المهرجان (توحيد رتبة الأرقام مؤقتاً)</span></div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:8px; line-height:1.5;">
                يعرض جميع الأرقام المميزة النشطة بلون واحد موحّد أثناء الفعالية، وعند إيقافه يعود كل عضو لرتبته الأصلية المحفوظة تلقائياً.
              </div>
              <div class="lca-row">
                <select id="lca-ev-tier" class="lca-input" style="flex:1;">
                  <option value="">-- متوقف (كل عضو برتبته الأصلية) --</option>
                  ${tierOptions}
                </select>
                <button type="button" id="lca-btn-apply-ev-tier" class="lca-btn lca-btn-gold" style="width:auto; padding:8px 14px;">تطبيق</button>
              </div>
            </div>

            <div class="lca-card">
              <div class="lca-card-title"><span><i class="fas fa-calendar-plus"></i> تمديد جماعي للأرقام المؤقتة</span></div>
              <div class="lca-row" style="margin-bottom:7px;">
                <input type="number" id="lca-bulk-ext-days" class="lca-input" style="width:95px;" value="7" min="1" max="365">
                <input type="text" id="lca-bulk-ext-msg" class="lca-input" style="flex:1;" placeholder="رسالة تهنئة اختيارية للجميع...">
              </div>
              <button type="button" id="lca-btn-bulk-extend" class="lca-btn lsa-btn lca-btn-success" style="width:100%;"><i class="fas fa-gift"></i> إضافة الأيام لجميع المؤقتين النشطين</button>
            </div>

            <div class="lca-card">
              <div class="lca-card-title"><span><i class="fas fa-level-up-alt"></i> ترقية / استبدال رتبة جماعي</span></div>
              <div class="lca-grid-2" style="margin-bottom:8px;">
                <div><label class="lca-label">من الرتبة</label><select id="lca-bulk-from-tier" class="lca-input">${tierOptions}</select></div>
                <div><label class="lca-label">إلى الرتبة الجديدة</label><select id="lca-bulk-to-tier" class="lca-input">${tierOptions}</select></div>
              </div>
              <button type="button" id="lca-btn-bulk-tier" class="lca-btn lca-btn-dark" style="width:100%;"><i class="fas fa-sync-alt"></i> تحويل جميع حاملي الرتبة</button>
            </div>

            <div class="lca-card">
              <div class="lca-card-title"><span><i class="fas fa-bullhorn"></i> إشعار جماعي لجميع حاملي الأرقام المميزة</span></div>
              <div class="lca-row" style="margin-bottom:7px;">
                <input type="text" id="lca-bc-msg" class="lca-input" style="flex:1;" placeholder="اكتب رسالة تهنئة أو تنبيه لحاملي الأرقام...">
                <select id="lca-bc-type" class="lca-input" style="width:95px;">
                  <option value="success">تهنئة 🎁</option>
                  <option value="error">تنبيه ⚠️</option>
                </select>
              </div>
              <button type="button" id="lca-btn-send-bc" class="lca-btn lca-btn-crimson"><i class="fas fa-paper-plane"></i> إرسال لجميع أصحاب الأرقام النشطة</button>
            </div>
          </div>

          <!-- TAB 5: STATS & SHOWCASE -->
          <div id="lca-view-stats" class="lca-view">
            <div id="lca-stats-body"></div>
          </div>

          <!-- TAB 6: LOGS, SETTINGS & MAINTENANCE -->
          <div id="lca-view-logs" class="lca-view">
            <div class="lca-card">
              <div class="lca-card-title"><span><i class="fas fa-sliders-h"></i> إعدادات النظام</span></div>
              <div class="lca-setting-row">
                <div><div style="font-size:12px; font-weight:bold;">تفعيل نظام الأرقام المميزة</div><div style="font-size:10.5px; color:#94a3b8;">إيقافه يعيد جميع الأعضاء لأرقامهم الأصلية مؤقتاً</div></div>
                <label class="lca-switch"><input type="checkbox" id="lca-set-enabled"><span class="lca-slider"></span></label>
              </div>
              <div class="lca-setting-row">
                <div><div style="font-size:12px; font-weight:bold;">حماية منع تكرار الأرقام</div><div style="font-size:10.5px; color:#94a3b8;">تنبيه ومنع منح رقم مملوك حالياً لعضو آخر</div></div>
                <label class="lca-switch"><input type="checkbox" id="lca-set-nodup"><span class="lca-slider"></span></label>
              </div>
              <div class="lca-setting-row" style="margin-bottom:0;">
                <div><div style="font-size:12px; font-weight:bold;">إشعارات التهنئة والتنبيه التلقائية</div><div style="font-size:10.5px; color:#94a3b8;">إظهار نافذة الإشعار للعضو عند المنح أو السحب</div></div>
                <label class="lca-switch"><input type="checkbox" id="lca-set-notifs"><span class="lca-slider"></span></label>
              </div>
            </div>

            <div class="lca-card">
              <div class="lca-card-title" style="color:#cbd5e1;"><span><i class="fas fa-broom"></i> الصيانة والنسخ الاحتياطي</span></div>
              <div class="lca-grid-2" style="margin-bottom:7px;">
                <button type="button" id="lca-btn-clean-exp" class="lca-btn lca-btn-danger"><i class="fas fa-eraser"></i> حذف الأرقام المنتهية</button>
                <button type="button" id="lca-btn-clean-notifs" class="lca-btn lca-btn-dark"><i class="fas fa-bell-slash"></i> مسح الإشعارات العالقة</button>
                <button type="button" id="lca-btn-export" class="lca-btn lca-btn-info"><i class="fas fa-download"></i> تصدير نسخة JSON</button>
                <button type="button" id="lca-btn-import" class="lca-btn lca-btn-success"><i class="fas fa-upload"></i> استيراد نسخة JSON</button>
              </div>
              <input type="file" id="lca-import-file" accept=".json,application/json" style="display:none;">
            </div>

            <div class="lca-card">
              <div class="lca-card-title">
                <span><i class="fas fa-history"></i> سجل العمليات الإدارية</span>
                <button type="button" id="lca-btn-clear-logs" class="lca-btn lca-btn-danger lca-mini"><i class="fas fa-trash"></i> مسح السجل</button>
              </div>
              <input type="text" id="lca-log-search" class="lca-input" style="margin-bottom:8px;" placeholder="🔍 ابحث في السجل..." autocomplete="off">
              <div id="lca-logs-list"></div>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&admin.close()});
    document.getElementById("lca-btn-close").onclick=()=>admin.close();
    document.getElementById("lca-btn-refresh").onclick=()=>{admin.refreshAll();admin.loadLogs();n.showToast("🔄 تم تحديث البيانات")};
    document.getElementById("lca-btn-quick-grant").onclick=()=>admin.switchTab("grant");
    ov.querySelectorAll("[data-ctab]").forEach(btn=>{btn.onclick=()=>admin.switchTab(btn.getAttribute("data-ctab"))});

    document.getElementById("lca-search").oninput=()=>admin.renderMembers();
    document.getElementById("lca-filter").onchange=()=>admin.renderMembers();
    document.getElementById("lca-sort").onchange=()=>admin.renderMembers();

    // Grant tab events
    document.getElementById("lca-gr-reload-online").onclick=()=>admin.populateOnlineDropdown();
    document.getElementById("lca-gr-online").onchange=function(){
      if(this.value)document.getElementById("lca-gr-user").value=this.value;
      admin.checkGrantAvailability()
    };
    document.getElementById("lca-gr-user").oninput=()=>admin.checkGrantAvailability();
    document.getElementById("lca-gr-id").oninput=function(){
      let v=this.value.trim()||"77",tk=document.getElementById("lca-gr-tier").value||"gold";
      document.getElementById("lca-gr-live-box").innerHTML=n.renderIdBadgeHTML(v,tk,"14px");
      document.querySelectorAll(".gr-tier-prev").forEach(el=>el.textContent=`#${v}`);
      admin.checkGrantAvailability()
    };
    document.getElementById("lca-gr-dur").onchange=function(){
      document.getElementById("lca-gr-custom-dur-wrap").style.display="custom"===this.value?"block":"none"
    };
    document.getElementById("lca-gr-tier-grid").addEventListener("click",ev=>{
      let card=ev.target.closest(".gr-tier-card");
      if(!card)return;
      let tk=card.dataset.tier;
      document.getElementById("lca-gr-tier").value=tk;
      document.querySelectorAll(".gr-tier-card").forEach(x=>x.classList.toggle("active",x===card));
      let v=document.getElementById("lca-gr-id").value.trim()||"77";
      document.getElementById("lca-gr-live-box").innerHTML=n.renderIdBadgeHTML(v,tk,"14px")
    });
    ov.querySelectorAll(".lca-gen-btn").forEach(b=>b.onclick=()=>admin.generateSuggestions(b.dataset.gen));
    document.getElementById("lca-btn-do-grant").onclick=()=>admin.executeGrant();
    document.getElementById("lca-btn-do-transfer").onclick=()=>admin.executeTransfer();

    // Reserved tab
    document.getElementById("lca-btn-add-res").onclick=()=>admin.addReserved();

    // Events tab
    document.getElementById("lca-btn-apply-ev-tier").onclick=()=>{
      let evT=document.getElementById("lca-ev-tier").value||"";
      admin.patchSetting({eventTier:evT},evT?`🎭 تم تفعيل توحيد الرتبة مؤقتاً (${t[evT].label})`:"✅ تم إنهاء وضع المهرجان وإرجاع رتب الأعضاء")
    };
    document.getElementById("lca-btn-bulk-extend").onclick=()=>admin.bulkExtend();
    document.getElementById("lca-btn-bulk-tier").onclick=()=>admin.bulkChangeTier();
    document.getElementById("lca-btn-send-bc").onclick=()=>admin.sendBroadcastNotif();

    // Settings & Logs tab
    document.getElementById("lca-set-enabled").onchange=function(){
      admin.patchSetting({enabled:this.checked},this.checked?"✅ تم تفعيل نظام الأرقام المميزة":"🛑 تم إيقاف نظام الأرقام مؤقتاً")
    };
    document.getElementById("lca-set-nodup").onchange=function(){
      admin.patchSetting({preventDuplicates:this.checked},this.checked?"🔒 تم تفعيل حماية منع التكرار":"⚠️ تم إيقاف منع التكرار")
    };
    document.getElementById("lca-set-notifs").onchange=function(){
      admin.patchSetting({enableNotifs:this.checked},this.checked?"🔔 تم تفعيل إشعارات الأعضاء":"🔕 تم إيقاف الإشعارات التلقائية")
    };
    document.getElementById("lca-btn-clean-exp").onclick=()=>admin.cleanExpired();
    document.getElementById("lca-btn-clean-notifs").onclick=()=>admin.cleanStuckNotifs();
    document.getElementById("lca-btn-export").onclick=()=>admin.exportBackup();
    document.getElementById("lca-btn-import").onclick=()=>document.getElementById("lca-import-file").click();
    document.getElementById("lca-import-file").onchange=ev=>admin.importBackup(ev);
    document.getElementById("lca-log-search").oninput=()=>admin.renderLogs();
    document.getElementById("lca-btn-clear-logs").onclick=()=>admin.clearLogs();

    requestAnimationFrame(()=>ov.classList.add("active"));
    admin.activeTab="members";
    admin.populateOnlineDropdown();
    admin.generateSuggestions("2d");
    admin.populateSettingsUI();
    admin.refreshAll();
    admin.loadLogs()
  },
  close(){
    let sub=document.getElementById("layl-cid-sub-modal");
    sub&&sub.remove();
    let ov=document.getElementById("layl-cid-admin-modal");
    ov&&ov.remove()
  },
  switchTab(tab){
    let ov=document.getElementById("layl-cid-admin-modal");
    if(!ov)return;
    admin.activeTab=tab;
    ov.querySelectorAll("[data-ctab]").forEach(x=>x.classList.toggle("active",x.getAttribute("data-ctab")===tab));
    ov.querySelectorAll(".lca-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`lca-view-${tab}`);
    v&&v.classList.add("active");
    if("members"===tab)admin.renderMembers();
    else if("grant"===tab){admin.populateOnlineDropdown();admin.checkGrantAvailability()}
    else if("reserved"===tab)admin.renderReserved();
    else if("events"===tab)admin.populateSettingsUI();
    else if("stats"===tab)admin.renderStats();
    else if("logs"===tab){admin.populateSettingsUI();admin.loadLogs()}
  },
  refreshAll(){
    if(!document.getElementById("layl-cid-admin-modal"))return;
    admin.updateHeaderStats();
    if("members"===admin.activeTab)admin.renderMembers();
    else if("reserved"===admin.activeTab)admin.renderReserved();
    else if("stats"===admin.activeTab)admin.renderStats()
  },
  updateHeaderStats(){
    if(!document.getElementById("lca-st-active"))return;
    let act=0,exp=0;
    Object.values(a.cache||{}).forEach(d=>{
      if(!d||!d.id)return;
      n.isExpired(d)?exp++:n.isActive(d)&&act++
    });
    let dupCnt=Object.keys(n.getDuplicatesMap()).length,resCnt=Object.keys(a.reserved||{}).length;
    document.getElementById("lca-st-active").textContent=act;
    let expEl=document.getElementById("lca-st-expired");
    expEl.textContent=exp;expEl.style.color=exp>0?"#f87171":"#94a3b8";
    let dupEl=document.getElementById("lca-st-dups");
    dupEl.textContent=`${dupCnt} / ${resCnt}`;
    dupEl.style.color=dupCnt>0?"#fbbf24":"#38bdf8";
    let stEl=document.getElementById("lca-st-status");
    if(!1===a.settings.enabled){stEl.textContent="متوقف";stEl.style.color="#f87171"}
    else if(a.settings.eventTier&&t[a.settings.eventTier]){stEl.textContent=`🎭 ${t[a.settings.eventTier].label}`;stEl.style.color="#c084fc"}
    else{stEl.textContent="مفعّل";stEl.style.color="#34d399"}
  },
  renderMembers(){
    let c=document.getElementById("lca-members-list"),cntEl=document.getElementById("lca-mem-count");
    if(!c)return;
    let q=(document.getElementById("lca-search")?.value||"").trim().toLowerCase().replace(/^#/,"");
    let flt=document.getElementById("lca-filter")?.value||"all";
    let srt=document.getElementById("lca-sort")?.value||"id_asc";
    let now=Date.now(),soonCut=now+3*864e5;
    let dupsMap=n.getDuplicatesMap();
    let onlineSet=new Set(n.getOnlineUsers().map(x=>x.san));
    let list=Object.entries(a.cache||{}).filter(([,d])=>d&&d.id).map(([k,d])=>{
      let isExp=n.isExpired(d),isAct=n.isActive(d),isDup=Boolean(dupsMap[String(d.id)]&&!isExp);
      return{key:k,d,idNum:Number(d.id)||0,tier:t[d.tier]?d.tier:"gold",isExp,isAct,isDup,isOnline:onlineSet.has(k)}
    }).filter(x=>{
      if("active"===flt&&!x.isAct)return!1;
      if("online"===flt&&!x.isOnline)return!1;
      if("permanent"===flt&&!(x.isAct&&!x.d.expiresAt))return!1;
      if("temp"===flt&&!(x.isAct&&x.d.expiresAt))return!1;
      if("expiring"===flt&&!(x.isAct&&x.d.expiresAt&&x.d.expiresAt<=soonCut))return!1;
      if("expired"===flt&&!x.isExp)return!1;
      if("paused"===flt&&!x.d.paused)return!1;
      if("dups"===flt&&!x.isDup)return!1;
      if(flt.startsWith("tier:")&&x.tier!==flt.slice(5))return!1;
      if(q){
        let hay=`${x.key} ${x.idNum} ${t[x.tier].label} ${x.d.note||""}`.toLowerCase();
        if(!hay.includes(q))return!1
      }
      return!0
    });
    list.sort((x,y)=>{
      if("id_desc"===srt)return y.idNum-x.idNum;
      if("recent"===srt)return(y.d.assignedAt||0)-(x.d.assignedAt||0);
      if("exp_soon"===srt)return(x.d.expiresAt||9e15)-(y.d.expiresAt||9e15);
      if("name"===srt)return x.key.localeCompare(y.key,"ar");
      return x.idNum-y.idNum
    });
    cntEl&&(cntEl.textContent=`عرض ${Math.min(list.length,100)} من أصل ${list.length} رقم مميز`);
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:25px;">لا توجد أرقام مطابقة.</div>';return}
    let html="";
    list.slice(0,100).forEach(x=>{
      let tags=[];
      if(x.isOnline)tags.push('<span class="lca-tag lca-tag-green">● متصل</span>');
      if(x.d.paused)tags.push('<span class="lca-tag lca-tag-purple">⏸️ موقوف مؤقتاً</span>');
      else if(x.isExp)tags.push('<span class="lca-tag lca-tag-red">منتهي</span>');
      else if(x.d.expiresAt)tags.push(`<span class="lca-tag lca-tag-blue">⏳ ${n.formatRemaining(x.d.expiresAt)}</span>`);
      else tags.push('<span class="lca-tag lca-tag-gold">∞ دائم</span>');
      tags.push(`<span class="lca-tag lca-tag-gray">${t[x.tier].label}</span>`);
      if(x.isDup)tags.push('<span class="lca-tag lca-tag-red">⚠️ مكرر</span>');
      let noteHtml=x.d.note?`<div style="font-size:11px; color:#fbbf24; margin-top:4px;"><i class="fas fa-sticky-note"></i> ${n.escapeHTML(x.d.note)}</div>`:"";
      html+=`
        <div class="lca-card" ${x.isDup?'style="border-color:rgba(239,68,68,0.45);"':""}>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">
            <div style="min-width:0; flex:1;">
              <div style="font-size:13.5px; font-weight:700; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.escapeHTML(x.key)}</div>
              <div class="lca-row" style="gap:4px; margin-top:4px;">${tags.join("")}</div>
            </div>
            <div style="flex-shrink:0;">${n.renderIdBadgeHTML(x.idNum,x.tier,"15px")}</div>
          </div>
          ${noteHtml}
          <div class="lca-row" style="margin-top:8px; gap:5px;">
            <button type="button" class="lca-btn lca-btn-gold lca-mini lca-act-edit" data-key="${n.escapeHTML(x.key)}" style="width:auto;"><i class="fas fa-edit"></i> تعديل</button>
            <button type="button" class="lca-btn lca-btn-success lca-mini lca-act-ext" data-key="${n.escapeHTML(x.key)}">+7 أيام</button>
            <button type="button" class="lca-btn lca-btn-info lca-mini lca-act-tr" data-key="${n.escapeHTML(x.key)}"><i class="fas fa-exchange-alt"></i> نقل</button>
            <button type="button" class="lca-btn lca-btn-warn lca-mini lca-act-pause" data-key="${n.escapeHTML(x.key)}">${x.d.paused?"تفعيل":"إيقاف"}</button>
            <button type="button" class="lca-btn lca-btn-danger lca-mini lca-act-del" data-key="${n.escapeHTML(x.key)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    });
    c.innerHTML=html;
    c.querySelectorAll(".lca-act-edit").forEach(b=>b.onclick=()=>admin.openEditorModal(b.dataset.key));
    c.querySelectorAll(".lca-act-ext").forEach(b=>b.onclick=()=>admin.quickExtend(b.dataset.key,7));
    c.querySelectorAll(".lca-act-tr").forEach(b=>b.onclick=()=>{
      admin.switchTab("grant");
      let inp=document.getElementById("lca-tr-from");
      if(inp){inp.value=b.dataset.key;inp.scrollIntoView({behavior:"smooth",block:"center"});document.getElementById("lca-tr-to")?.focus()}
    });
    c.querySelectorAll(".lca-act-pause").forEach(b=>b.onclick=()=>admin.togglePause(b.dataset.key));
    c.querySelectorAll(".lca-act-del").forEach(b=>b.onclick=()=>admin.revokeId(b.dataset.key))
  },
  openEditorModal(key){
    let d=a.cache[key];
    if(!d)return;
    let sub=document.getElementById("layl-cid-sub-modal");
    sub&&sub.remove();
    sub=document.createElement("div");
    sub.id="layl-cid-sub-modal";
    sub.className="lca-overlay lca-sub-overlay";
    let tk=t[d.tier]?d.tier:"gold";
    sub.innerHTML=`
      <div class="lca-box lca-sub-box">
        <div class="lca-header">
          <div class="lca-title"><i class="fas fa-user-edit"></i> تعديل رقم: ${n.escapeHTML(key)}</div>
          <button type="button" class="lca-ctrl-btn lca-ctrl-close" id="lca-sub-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="lca-body">
          <div class="lca-grid-2" style="margin-bottom:8px;">
            <div>
              <label class="lca-label">الرقم المميز</label>
              <input type="number" id="lca-ed-id" class="lca-input" min="1" value="${d.id}">
            </div>
            <div>
              <label class="lca-label">تعديل الصلاحية</label>
              <select id="lca-ed-dur" class="lca-input">
                <option value="keep">إبقاء الحالي (${d.expiresAt?n.formatRemaining(d.expiresAt):"دائم"})</option>
                <option value="permanent">تحويل إلى دائم ∞</option>
                <option value="add7">تمديد +7 أيام</option>
                <option value="add30">تمديد +30 يوم</option>
                <option value="1">يوم من الآن</option>
                <option value="7">أسبوع من الآن</option>
                <option value="30">شهر من الآن</option>
                <option value="90">3 شهور من الآن</option>
                <option value="365">سنة من الآن</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <label class="lca-label" style="margin:0;">الرتبة والشكل:</label>
              <div id="lca-ed-live">${n.renderIdBadgeHTML(d.id,tk,"14px")}</div>
            </div>
            <input type="hidden" id="lca-ed-tier" value="${tk}">
            <div id="lca-ed-tier-grid" class="lca-tier-grid">${admin.buildTierGridHTML(tk,d.id,"ed")}</div>
          </div>
          <div style="margin-bottom:8px;">
            <label class="lca-label">ملاحظة إدارية سرية</label>
            <input type="text" id="lca-ed-note" class="lca-input" value="${n.escapeHTML(d.note||"")}" placeholder="اختياري...">
          </div>
          <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#cbd5e1; margin-bottom:6px; cursor:pointer;">
            <input type="checkbox" id="lca-ed-paused" ${d.paused?"checked":""}> إيقاف مؤقت للرقم (يُخفى دون حذفه)
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#cbd5e1; margin-bottom:10px; cursor:pointer;">
            <input type="checkbox" id="lca-ed-notify"> إرسال إشعار للعضو بالتعديل الجديد
          </label>
          <button type="button" id="lca-ed-save" class="lca-btn lca-btn-gold"><i class="fas fa-save"></i> حفظ التعديلات</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    sub.addEventListener("click",ev=>{ev.target===sub&&sub.remove()});
    document.getElementById("lca-sub-close").onclick=()=>sub.remove();
    document.getElementById("lca-ed-id").oninput=function(){
      let v=this.value.trim()||d.id,ct=document.getElementById("lca-ed-tier").value;
      document.getElementById("lca-ed-live").innerHTML=n.renderIdBadgeHTML(v,ct,"14px");
      sub.querySelectorAll(".ed-tier-prev").forEach(el=>el.textContent=`#${v}`)
    };
    document.getElementById("lca-ed-tier-grid").addEventListener("click",ev=>{
      let card=ev.target.closest(".ed-tier-card");
      if(!card)return;
      let ct=card.dataset.tier;
      document.getElementById("lca-ed-tier").value=ct;
      sub.querySelectorAll(".ed-tier-card").forEach(x=>x.classList.toggle("active",x===card));
      let v=document.getElementById("lca-ed-id").value.trim()||d.id;
      document.getElementById("lca-ed-live").innerHTML=n.renderIdBadgeHTML(v,ct,"14px")
    });
    document.getElementById("lca-ed-save").onclick=()=>{
      if(!a.db)return;
      let newId=parseInt(document.getElementById("lca-ed-id").value);
      if(!newId||newId<1)return alert("أدخل رقماً صحيحاً.");
      let owners=n.findIdOwners(newId,key);
      if(owners.length&&a.settings.preventDuplicates&&!confirm(`⚠️ الرقم #${newId} مملوك حالياً لـ (${owners.join(", ")}). هل تريد المتابعة وتكراره؟`))return;
      let newTier=document.getElementById("lca-ed-tier").value||"gold";
      let dur=document.getElementById("lca-ed-dur").value;
      let nextExp=d.expiresAt||null;
      if("permanent"===dur)nextExp=null;
      else if("add7"===dur)nextExp=Math.max(Date.now(),d.expiresAt||Date.now())+7*864e5;
      else if("add30"===dur)nextExp=Math.max(Date.now(),d.expiresAt||Date.now())+30*864e5;
      else if("keep"!==dur)nextExp=Date.now()+parseInt(dur)*864e5;
      let paused=document.getElementById("lca-ed-paused").checked;
      let note=(document.getElementById("lca-ed-note").value||"").trim()||null;
      let doNotify=document.getElementById("lca-ed-notify").checked;
      let payload={
        id:newId,
        tier:newTier,
        expiresAt:nextExp,
        paused:paused||null,
        note,
        assignedAt:d.assignedAt||Date.now(),
        assignedBy:d.assignedBy||a.myUsername||"الإدارة"
      };
      a.db.ref(`${r.dbPath}/${key}`).set(payload).then(()=>{
        admin.logAction("تعديل رقم",key,`#${d.id} (${t[d.tier]?.label||d.tier}) ➔ #${newId} (${t[newTier].label})`);
        if(doNotify){
          let durLabel=nextExp?`حتى ${new Date(nextExp).toLocaleDateString("ar-EG")}`:"بشكل دائم";
          admin.sendUserNotif(key,`تم تحديث رقمك المميز إلى <b>#${newId}</b> (بتصنيف ${t[newTier].notif}) ${durLabel}.`,"success")
        }
        n.showToast("✅ تم حفظ التعديلات");
        sub.remove()
      }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
    };
    requestAnimationFrame(()=>sub.classList.add("active"))
  },
  quickExtend(key,days){
    let d=a.cache[key];
    if(!a.db||!d)return;
    let base=d.expiresAt&&d.expiresAt>Date.now()?d.expiresAt:Date.now();
    let next=base+days*864e5;
    a.db.ref(`${r.dbPath}/${key}/expiresAt`).set(next).then(()=>{
      admin.logAction("تمديد سريع",key,`#${d.id} (+${days} يوم)`);
      n.showToast(`⏳ تم تمديد #${d.id} لـ (${key}) +${days} أيام`)
    })
  },
  togglePause(key){
    let d=a.cache[key];
    if(!a.db||!d)return;
    let next=!d.paused;
    a.db.ref(`${r.dbPath}/${key}/paused`).set(next||null).then(()=>{
      admin.logAction(next?"إيقاف مؤقت":"إعادة تفعيل",key,`#${d.id}`);
      n.showToast(next?`⏸️ تم إيقاف #${d.id} مؤقتاً`:`▶️ تم إعادة تفعيل #${d.id}`)
    })
  },
  revokeId(key){
    let d=a.cache[key];
    if(!a.db||!d||!confirm(`سحب الرقم المميز (#${d.id}) من (${key})؟`))return;
    a.db.ref(`${r.dbPath}/${key}`).remove().then(()=>{
      admin.sendUserNotif(key,"تم إلغاء رقمك المميز وإعادتك للرقم الأساسي.","error");
      admin.logAction("سحب رقم",key,`إلغاء #${d.id} (${t[d.tier]?.label||d.tier})`);
      n.showToast(`🗑️ تم سحب #${d.id} من (${key})`)
    }).catch(()=>alert("❌ فشل الحذف."))
  },
  populateOnlineDropdown(){
    let sel=document.getElementById("lca-gr-online");
    if(!sel)return;
    let users=n.getOnlineUsers();
    sel.innerHTML='<option value="">-- اختر عضواً متواجداً ('+users.length+') --</option>'+users.map(u=>`<option value="${n.escapeHTML(u.username)}">${n.escapeHTML(u.displayName)} (@${n.escapeHTML(u.username)})</option>`).join("")
  },
  checkGrantAvailability(){
    let el=document.getElementById("lca-gr-avail");
    if(!el)return;
    let rawId=parseInt(document.getElementById("lca-gr-id")?.value);
    let rawU=(document.getElementById("lca-gr-user")?.value||"").trim();
    let sanU=n.sanitizeName(rawU);
    if(!rawId){el.innerHTML="";return}
    let owners=n.findIdOwners(rawId,sanU),res=a.reserved[String(rawId)];
    let msgs=[];
    if(owners.length)msgs.push(`<span style="color:#f87171;">⚠️ مملوك حالياً لـ: <b>${owners.map(n.escapeHTML).join(", ")}</b></span>`);
    if(res)msgs.push(`<span style="color:#fbbf24;">🔒 محجوز: ${n.escapeHTML(res.note||"بدون ملاحظة")}</span>`);
    if(!msgs.length)msgs.push(`<span style="color:#34d399;">✅ الرقم #${rawId} متاح وغير مستخدم</span>`);
    if(sanU&&a.cache[sanU]&&a.cache[sanU].id)msgs.push(`<span style="color:#7dd3fc;">(العضو يملك حالياً #${a.cache[sanU].id})</span>`);
    el.innerHTML=msgs.join(" • ")
  },
  generateSuggestions(mode){
    let box=document.getElementById("lca-gr-suggests");
    if(!box)return;
    let used=new Set;
    Object.values(a.cache||{}).forEach(d=>{if(d&&d.id&&!n.isExpired(d))used.add(Number(d.id))});
    Object.keys(a.reserved||{}).forEach(k=>used.add(Number(k)));
    let pool=[];
    if("2d"===mode){for(let x=10;x<=99;x++)used.has(x)||pool.push(x)}
    else if("3r"===mode){
      [111,222,333,444,555,666,777,888,999,100,200,300,400,500,600,700,800,900,101,202,303,404,505,606,707,808,909].forEach(x=>used.has(x)||pool.push(x))
    }else{
      [1000,1111,2000,2020,2026,2222,3000,3333,4444,5000,5555,6666,7000,7777,8000,8888,9000,9999,1234,4321,1010,2025,5050,7070,9090].forEach(x=>used.has(x)||pool.push(x))
    }
    pool.sort(()=>Math.random()-0.5);
    let picks=pool.slice(0,8);
    if(!picks.length){box.innerHTML='<span style="color:#94a3b8; font-size:11px;">لا توجد أرقام شاغرة في هذه الفئة</span>';return}
    box.innerHTML=picks.map(num=>`<button type="button" class="lca-suggest-chip" data-num="${num}">#${num}</button>`).join("");
    box.querySelectorAll(".lca-suggest-chip").forEach(btn=>{
      btn.onclick=()=>{
        let inp=document.getElementById("lca-gr-id");
        inp.value=btn.dataset.num;
        inp.dispatchEvent(new Event("input"))
      }
    })
  },
  executeGrant(){
    if(!a.db)return alert("غير متصل بالقاعدة.");
    let rawU=(document.getElementById("lca-gr-user")?.value||"").trim();
    let san=n.sanitizeName(rawU);
    let idNum=parseInt(document.getElementById("lca-gr-id")?.value);
    let tierKey=document.getElementById("lca-gr-tier")?.value||"gold";
    let durVal=document.getElementById("lca-gr-dur")?.value||"permanent";
    let customDays=parseInt(document.getElementById("lca-gr-custom-days")?.value)||0;
    let note=(document.getElementById("lca-gr-note")?.value||"").trim()||null;
    let customMsg=(document.getElementById("lca-gr-notif-msg")?.value||"").trim();
    let doNotify=document.getElementById("lca-gr-send-notif")?.checked;
    if(!san)return alert("أدخل اسم المستخدم أولاً.");
    if(!idNum||idNum<1)return alert("أدخل رقماً مميزاً صحيحاً.");
    let owners=n.findIdOwners(idNum,san);
    if(owners.length&&a.settings.preventDuplicates&&!confirm(`⚠️ الرقم #${idNum} مملوك حالياً لـ (${owners.join(", ")}). هل تريد المتابعة ومنحه مع ذلك؟`))return;
    let res=a.reserved[String(idNum)];
    if(res&&!confirm(`🔒 الرقم #${idNum} موجود في قائمة الحجز (${res.note||"بدون ملاحظة"}). هل تريد منحه وإزالته من الحجز؟`))return;
    let exp=null,durDays="permanent";
    if("custom"===durVal){
      if(customDays<1)return alert("أدخل عدد أيام صحيح.");
      exp=Date.now()+customDays*864e5;durDays=customDays
    }else if("permanent"!==durVal){
      durDays=parseInt(durVal);exp=Date.now()+durDays*864e5
    }
    let payload={id:idNum,expiresAt:exp,tier:tierKey,note,assignedAt:Date.now(),assignedBy:a.myUsername||"الإدارة"};
    a.db.ref(`${r.dbPath}/${san}`).set(payload).then(()=>{
      if(res)a.db.ref(`${r.adminPath}/reserved/${idNum}`).remove().catch(()=>{});
      if(doNotify){
        let msg=customMsg||`تم منحك الرقم المميز <b>#${idNum}</b> (بالتصنيف ${t[tierKey].notif}) ${n.getDurationText(durDays)}.`;
        admin.sendUserNotif(san,msg,"success")
      }
      admin.logAction("منح رقم",rawU,`#${idNum} (${t[tierKey].label}) - ${n.getDurationText(durDays)}`);
      document.getElementById("lca-gr-user").value="";
      document.getElementById("lca-gr-id").value="";
      document.getElementById("lca-gr-note").value="";
      document.getElementById("lca-gr-notif-msg").value="";
      document.getElementById("lca-gr-online").value="";
      document.getElementById("lca-gr-avail").innerHTML="";
      n.showToast(`👑 تم منح #${idNum} لـ (${rawU}) بنجاح!`)
    }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
  },
  executeTransfer(){
    if(!a.db)return;
    let fromRaw=(document.getElementById("lca-tr-from")?.value||"").trim();
    let toRaw=(document.getElementById("lca-tr-to")?.value||"").trim();
    let fromKey=n.sanitizeName(fromRaw),toKey=n.sanitizeName(toRaw);
    if(!fromKey||!toKey)return alert("أدخل اسم المالك الحالي والمالك الجديد.");
    if(fromKey===toKey)return alert("لا يمكن النقل لنفس العضو.");
    let src=a.cache[fromKey];
    if(!src||!src.id)return alert(`العضو (${fromRaw}) لا يملك رقماً مميزاً حالياً.`);
    if(a.cache[toKey]&&a.cache[toKey].id&&!confirm(`العضو (${toRaw}) يملك حالياً الرقم #${a.cache[toKey].id}. سيتم استبداله بـ #${src.id}. متابعة؟`))return;
    let doNotify=document.getElementById("lca-tr-notify")?.checked;
    let updates={};
    updates[toKey]=Object.assign({},src,{assignedAt:Date.now(),assignedBy:a.myUsername||"الإدارة"});
    updates[fromKey]=null;
    a.db.ref(r.dbPath).update(updates).then(()=>{
      if(doNotify){
        admin.sendUserNotif(fromKey,`تم نقل ملكية رقمك المميز <b>#${src.id}</b> إلى عضو آخر من قبل الإدارة.`,"error");
        admin.sendUserNotif(toKey,`تم نقل ملكية الرقم المميز <b>#${src.id}</b> (بتصنيف ${t[src.tier]?.notif||"الذهبي"}) إليك!`,"success")
      }
      admin.logAction("نقل ملكية",`${fromRaw} ➔ ${toRaw}`,`الرقم #${src.id} (${t[src.tier]?.label||src.tier})`);
      document.getElementById("lca-tr-from").value="";
      document.getElementById("lca-tr-to").value="";
      n.showToast(`✅ تم نقل #${src.id} من (${fromRaw}) إلى (${toRaw})`)
    }).catch(()=>alert("❌ فشلت عملية النقل."))
  },
  addReserved(){
    if(!a.db)return;
    let num=parseInt(document.getElementById("lca-res-id")?.value);
    let note=(document.getElementById("lca-res-note")?.value||"").trim();
    if(!num||num<1)return alert("أدخل رقماً صحيحاً.");
    let owners=n.findIdOwners(num,null);
    if(owners.length&&!confirm(`ملاحظة: الرقم #${num} مملوك حالياً لـ (${owners.join(", ")}). هل تريد إضافته لقائمة الحجز أيضاً؟`))return;
    a.db.ref(`${r.adminPath}/reserved/${num}`).set({
      note:note||"رقم محجوز للإدارة",
      by:a.myUsername||"الإدارة",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).then(()=>{
      admin.logAction("حجز رقم",`#${num}`,note||"حجز إداري");
      document.getElementById("lca-res-id").value="";
      document.getElementById("lca-res-note").value="";
      n.showToast(`🔒 تم حجز الرقم #${num}`)
    }).catch(()=>alert("❌ فشل الحجز: تأكد من إضافة layl_custom_ids_admin لقواعد Firebase."))
  },
  renderReserved(){
    let c=document.getElementById("lca-reserved-list");
    if(!c)return;
    let entries=Object.entries(a.reserved||{}).sort((x,y)=>Number(x[0])-Number(y[0]));
    if(!entries.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:22px;">لا توجد أرقام محجوزة حالياً.</div>';return}
    c.innerHTML=entries.map(([num,d])=>`
      <div class="lca-card" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
          ${n.renderIdBadgeHTML(num,"gold","14px")}
          <div style="min-width:0; flex:1;">
            <div style="font-size:12.5px; color:#f8fafc; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.escapeHTML(d.note||"محجوز")}</div>
            <div style="font-size:10.5px; color:#94a3b8;">بواسطة: ${n.escapeHTML(d.by||"-")} • ${n.formatDate(d.timestamp)}</div>
          </div>
        </div>
        <div class="lca-row" style="gap:4px; flex-shrink:0;">
          <button type="button" class="lca-btn lca-btn-success lca-mini lca-res-grant" data-num="${n.escapeHTML(num)}">منح</button>
          <button type="button" class="lca-btn lca-btn-danger lca-mini lca-res-del" data-num="${n.escapeHTML(num)}"><i class="fas fa-unlock"></i></button>
        </div>
      </div>`).join("");
    c.querySelectorAll(".lca-res-grant").forEach(b=>b.onclick=()=>{
      admin.switchTab("grant");
      let inp=document.getElementById("lca-gr-id");
      if(inp){inp.value=b.dataset.num;inp.dispatchEvent(new Event("input"));document.getElementById("lca-gr-user")?.focus()}
    });
    c.querySelectorAll(".lca-res-del").forEach(b=>b.onclick=()=>{
      let num=b.dataset.num;
      if(!confirm(`فك الحجز عن الرقم #${num}؟`))return;
      a.db.ref(`${r.adminPath}/reserved/${num}`).remove().then(()=>{
        admin.logAction("فك حجز رقم",`#${num}`,"إزالة من قائمة الحجز");
        n.showToast(`🔓 تم فك الحجز عن #${num}`)
      })
    })
  },
  bulkExtend(){
    if(!a.db)return;
    let days=parseInt(document.getElementById("lca-bulk-ext-days")?.value)||0;
    let msg=(document.getElementById("lca-bulk-ext-msg")?.value||"").trim();
    if(days<1)return alert("أدخل عدد أيام صحيح.");
    let now=Date.now(),updates={},keys=[];
    Object.entries(a.cache||{}).forEach(([k,d])=>{
      if(d&&d.id&&d.expiresAt&&d.expiresAt>now){
        updates[`${k}/expiresAt`]=d.expiresAt+days*864e5;
        keys.push(k)
      }
    });
    if(!keys.length)return n.showToast("لا توجد أرقام مؤقتة نشطة للتمديد");
    if(!confirm(`تمديد صلاحية (${keys.length}) رقم مؤقت بإضافة +${days} يوم؟`))return;
    a.db.ref(r.dbPath).update(updates).then(()=>{
      if(msg)keys.forEach(k=>admin.sendUserNotif(k,msg,"success"));
      admin.logAction("تمديد جماعي",`${keys.length} عضو`,`+${days} يوم`);
      document.getElementById("lca-bulk-ext-msg").value="";
      n.showToast(`🎁 تم تمديد ${keys.length} رقم +${days} يوم!`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  bulkChangeTier(){
    if(!a.db)return;
    let fromT=document.getElementById("lca-bulk-from-tier")?.value;
    let toT=document.getElementById("lca-bulk-to-tier")?.value;
    if(!fromT||!toT||fromT===toT)return alert("اختر رتبتين مختلفتين.");
    let updates={},cnt=0;
    Object.entries(a.cache||{}).forEach(([k,d])=>{
      if(d&&d.id&&(d.tier||"gold")===fromT){updates[`${k}/tier`]=toT;cnt++}
    });
    if(!cnt)return n.showToast(`لا يوجد أعضاء برتبة (${t[fromT].label})`);
    if(!confirm(`تحويل (${cnt}) عضو من (${t[fromT].label}) إلى (${t[toT].label})؟`))return;
    a.db.ref(r.dbPath).update(updates).then(()=>{
      admin.logAction("تحويل رتبة جماعي",`${cnt} عضو`,`${t[fromT].label} ➔ ${t[toT].label}`);
      n.showToast(`✅ تم تحويل ${cnt} عضو إلى (${t[toT].label})`)
    }).catch(()=>alert("❌ فشل التنفيذ."))
  },
  sendBroadcastNotif(){
    if(!a.db)return;
    let msg=(document.getElementById("lca-bc-msg")?.value||"").trim();
    let type=document.getElementById("lca-bc-type")?.value||"success";
    if(!msg)return alert("اكتب رسالة الإشعار أولاً.");
    let targets=Object.entries(a.cache||{}).filter(([,d])=>n.isActive(d)).map(([k])=>k);
    if(!targets.length)return alert("لا يوجد حاملو أرقام نشطة حالياً.");
    if(!confirm(`إرسال هذا الإشعار إلى (${targets.length}) عضو من حاملي الأرقام المميزة؟`))return;
    let updates={};
    let ref=a.db.ref(r.notifPath);
    targets.forEach(k=>{
      let pKey=ref.child(k).push().key;
      updates[`${k}/${pKey}`]={message:msg,type}
    });
    ref.update(updates).then(()=>{
      admin.logAction("بث إشعار VIP",`${targets.length} عضو`,msg);
      document.getElementById("lca-bc-msg").value="";
      n.showToast(`📢 تم إرسال الإشعار إلى ${targets.length} عضو`)
    }).catch(()=>alert("❌ فشل الإرسال."))
  },
  renderStats(){
    let c=document.getElementById("lca-stats-body");
    if(!c)return;
    let now=Date.now(),soonCut=now+3*864e5;
    let activeList=[],expiringSoon=[],tierCounts={},permCnt=0,tempCnt=0;
    Object.entries(a.cache||{}).forEach(([k,d])=>{
      if(!d||!d.id)return;
      if(n.isActive(d)){
        let tk=t[d.tier]?d.tier:"gold";
        tierCounts[tk]=(tierCounts[tk]||0)+1;
        d.expiresAt?(tempCnt++,d.expiresAt<=soonCut&&expiringSoon.push({key:k,d})):permCnt++;
        activeList.push({key:k,d,idNum:Number(d.id)||0})
      }
    });
    activeList.sort((x,y)=>x.idNum-y.idNum);
    expiringSoon.sort((x,y)=>(x.d.expiresAt||0)-(y.d.expiresAt||0));
    let dups=Object.entries(n.getDuplicatesMap());

    let dupsHtml=dups.length
      ?dups.map(([idStr,users])=>`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.28); border-radius:8px; margin-bottom:5px; font-size:12px;">
          <div><b>#${n.escapeHTML(idStr)}</b> مكرر عند: <span style="color:#fecaca;">${users.map(n.escapeHTML).join(" ، ")}</span></div>
          <button type="button" class="lca-btn lca-btn-danger lca-mini lca-st-finddup" data-num="${n.escapeHTML(idStr)}">فحص</button>
        </div>`).join("")
      :'<div style="color:#34d399; font-size:11.5px; text-align:center; padding:6px;">✅ ممتاز! لا توجد أي أرقام مكررة حالياً.</div>';

    let soonHtml=expiringSoon.length
      ?expiringSoon.map(x=>`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(245,158,11,0.09); border:1px solid rgba(245,158,11,0.25); border-radius:8px; margin-bottom:5px; font-size:12px; gap:6px;">
          <div style="display:flex; align-items:center; gap:6px; min-width:0;">
            ${n.renderIdBadgeHTML(x.d.id,x.d.tier,"12px")}
            <b style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.escapeHTML(x.key)}</b>
            <span style="color:#fcd34d; font-size:10.5px;">(${n.formatRemaining(x.d.expiresAt)})</span>
          </div>
          <button type="button" class="lca-btn lca-btn-success lca-mini lca-st-renew" data-key="${n.escapeHTML(x.key)}">+30 يوم</button>
        </div>`).join("")
      :'<div style="color:#64748b; font-size:11.5px; text-align:center; padding:6px;">لا توجد أرقام تنتهي خلال الـ 72 ساعة القادمة.</div>';

    let rareHtml=activeList.slice(0,10).map((x,idx)=>`
      <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:5px; font-size:12px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="min-width:20px; text-align:center;">${0===idx?"🏆":1===idx?"🥈":2===idx?"🥉":idx+1+"."}</span>
          <b style="color:#f8fafc;">${n.escapeHTML(x.key)}</b>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          ${n.renderIdBadgeHTML(x.idNum,x.d.tier,"13px")}
          <button type="button" class="lca-btn lca-btn-dark lca-mini lca-st-edit" data-key="${n.escapeHTML(x.key)}"><i class="fas fa-pen"></i></button>
        </div>
      </div>`).join("")||'<div style="color:#64748b; text-align:center; padding:10px;">لا توجد أرقام نشطة.</div>';

    let totAct=activeList.length||1;
    let tiersBarHtml=Object.entries(tierCounts).sort((x,y)=>y[1]-x[1]).map(([tk,cnt])=>{
      let p=Math.round((cnt/totAct)*100);
      return`<div style="display:flex; justify-content:space-between; font-size:11.5px; color:#cbd5e1;"><span>${t[tk].label}</span><b>${cnt} (${p}%)</b></div><div class="lca-prog-wrap"><div class="lca-prog-bar" style="width:${p}%;"></div></div>`
    }).join("")||'<div style="color:#64748b; font-size:11.5px; text-align:center;">لا توجد بيانات.</div>';

    c.innerHTML=`
      <div class="lca-card">
        <div class="lca-card-title"><span><i class="fas fa-chart-pie"></i> ملخص الأرقام النشطة</span></div>
        <div class="lca-grid-3" style="text-align:center; margin-bottom:10px;">
          <div class="lca-stat"><div class="lca-stat-val">${activeList.length}</div><div class="lca-stat-lbl">نشطة</div></div>
          <div class="lca-stat"><div class="lca-stat-val">${permCnt}</div><div class="lca-stat-lbl">دائمة ∞</div></div>
          <div class="lca-stat"><div class="lca-stat-val">${tempCnt}</div><div class="lca-stat-lbl">مؤقتة ⏳</div></div>
        </div>
        ${tiersBarHtml}
      </div>
      <div class="lca-card" style="border-color:rgba(239,68,68,0.28);">
        <div class="lca-card-title" style="color:#fca5a5;"><span><i class="fas fa-exclamation-triangle"></i> كاشف تعارض الأرقام المكررة</span></div>
        ${dupsHtml}
      </div>
      <div class="lca-card" style="border-color:rgba(245,158,11,0.28);">
        <div class="lca-card-title" style="color:#fcd34d;"><span><i class="fas fa-hourglass-half"></i> رادار قرب الانتهاء (خلال 3 أيام)</span></div>
        ${soonHtml}
      </div>
      <div class="lca-card">
        <div class="lca-card-title"><span><i class="fas fa-gem"></i> أندر 10 أرقام في الشات</span></div>
        ${rareHtml}
      </div>
      <div class="lca-card">
        <div class="lca-card-title">
          <span><i class="fas fa-palette"></i> معرض جميع الرتب (18 رتبة)</span>
          <input type="number" id="lca-showcase-num" class="lca-input" style="width:90px; padding:4px 7px; font-size:11.5px; text-align:center;" value="77" placeholder="الرقم">
        </div>
        <div class="lca-tier-grid" style="max-height:none;">${admin.buildTierGridHTML("","77","sh")}</div>
      </div>`;

    c.querySelectorAll(".lca-st-finddup").forEach(b=>b.onclick=()=>{
      admin.switchTab("members");
      document.getElementById("lca-filter").value="dups";
      document.getElementById("lca-search").value=b.dataset.num;
      admin.renderMembers()
    });
    c.querySelectorAll(".lca-st-renew").forEach(b=>b.onclick=()=>admin.quickExtend(b.dataset.key,30));
    c.querySelectorAll(".lca-st-edit").forEach(b=>b.onclick=()=>admin.openEditorModal(b.dataset.key));
    let scInp=document.getElementById("lca-showcase-num");
    scInp&&(scInp.oninput=function(){
      let v=this.value.trim()||"77";
      c.querySelectorAll(".sh-tier-prev").forEach(el=>el.textContent=`#${v}`)
    })
  },
  populateSettingsUI(){
    let en=document.getElementById("lca-set-enabled");
    if(en){
      en.checked=!1!==a.settings.enabled;
      document.getElementById("lca-set-nodup").checked=!1!==a.settings.preventDuplicates;
      document.getElementById("lca-set-notifs").checked=!1!==a.settings.enableNotifs
    }
    let evSel=document.getElementById("lca-ev-tier");
    if(evSel)evSel.value=a.settings.eventTier||""
  },
  patchSetting(partial,toastMsg){
    if(!a.db)return;
    a.db.ref(`${r.adminPath}/settings`).update(partial).then(()=>{
      a.settings=Object.assign({},a.settings,partial);
      admin.logAction("تعديل إعداد","النظام",Object.entries(partial).map(([k,v])=>`${k}=${v||"off"}`).join(", "));
      s.renderAll();
      admin.updateHeaderStats();
      n.showToast(toastMsg||"✅ تم التحديث")
    }).catch(()=>alert("❌ فشل الحفظ: تأكد من إضافة layl_custom_ids_admin لقواعد Firebase."))
  },
  cleanExpired(){
    if(!a.db)return;
    let updates={},cnt=0;
    Object.entries(a.cache||{}).forEach(([k,d])=>{if(d&&n.isExpired(d)){updates[k]=null;cnt++}});
    if(!cnt)return n.showToast("لا توجد أرقام منتهية حالياً");
    if(!confirm(`حذف (${cnt}) رقم منتهي الصلاحية لتنظيف قاعدة البيانات؟`))return;
    a.db.ref(r.dbPath).update(updates).then(()=>{
      admin.logAction("تنظيف المنتهية",`${cnt} رقم`,"حذف الأرقام منتهية الصلاحية");
      n.showToast(`🧹 تم تنظيف ${cnt} رقم منتهي`)
    }).catch(()=>alert("❌ فشل التنظيف."))
  },
  cleanStuckNotifs(){
    if(!a.db||!confirm("مسح جميع إشعارات الأرقام العالقة غير المقروءة؟"))return;
    a.db.ref(r.notifPath).remove().then(()=>{
      admin.logAction("مسح الإشعارات","النظام","تنظيف layl_custom_notifs");
      n.showToast("🧹 تم مسح الإشعارات العالقة")
    }).catch(()=>alert("❌ فشل المسح."))
  },
  exportBackup(){
    let blob=new Blob([JSON.stringify(a.cache||{},null,2)],{type:"application/json;charset=utf-8"});
    let url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`layl-custom-ids-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1e3);
    n.showToast("💾 تم تحميل النسخة الاحتياطية")
  },
  importBackup(ev){
    let file=ev.target.files&&ev.target.files[0];
    ev.target.value="";
    if(!file||!a.db)return;
    let rd=new FileReader;
    rd.onload=()=>{
      try{
        let parsed=JSON.parse(rd.result);
        if(!parsed||"object"!=typeof parsed||Array.isArray(parsed))return alert("ملف JSON غير صالح.");
        let cnt=Object.keys(parsed).length;
        if(!cnt)return alert("الملف فارغ.");
        let rep=confirm(`تم قراءة (${cnt}) سجل.\nاضغط (موافق / OK) للاستبدال الكامل، أو (إلغاء / Cancel) للدمج مع البيانات الحالية.`);
        if(!confirm(`تأكيد نهائي: ${rep?"استبدال كامل":"دمج"} لـ (${cnt}) رقم؟`))return;
        let op=rep?a.db.ref(r.dbPath).set(parsed):a.db.ref(r.dbPath).update(parsed);
        op.then(()=>{
          admin.logAction("استيراد نسخة احتياطية",`${cnt} رقم`,rep?"استبدال كامل":"دمج");
          n.showToast(`✅ تم استيراد ${cnt} سجل بنجاح`)
        }).catch(()=>alert("❌ فشل الاستيراد."))
      }catch{alert("❌ تعذر قراءة ملف JSON.")}
    };
    rd.readAsText(file)
  },
  loadLogs(){
    let c=document.getElementById("lca-logs-list");
    if(!a.db)return;
    c&&(c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:18px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>');
    a.db.ref(`${r.adminPath}/logs`).limitToLast(150).once("value").then(snap=>{
      let val=snap.val()||{};
      a.adminLogs=Object.entries(val).map(([id,d])=>Object.assign({id},d)).sort((x,y)=>(y.timestamp||0)-(x.timestamp||0));
      admin.renderLogs()
    }).catch(()=>{c&&(c.innerHTML='<div style="text-align:center; color:#ef4444; padding:18px;">تعذر قراءة السجل.</div>')})
  },
  renderLogs(){
    let c=document.getElementById("lca-logs-list");
    if(!c)return;
    let q=(document.getElementById("lca-log-search")?.value||"").trim().toLowerCase();
    let list=a.adminLogs.filter(x=>!q||`${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:18px;">لا توجد سجلات إدارية بعد.</div>';return}
    c.innerHTML=list.map(x=>`
      <div class="lca-card" style="padding:8px 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; gap:6px;">
          <span class="lca-tag lca-tag-gold">${n.escapeHTML(x.action)}</span>
          <span style="font-size:10px; color:#94a3b8;">${n.formatDate(x.timestamp)}</span>
        </div>
        <div style="font-size:12px; color:#e2e8f0;">
          <b style="color:#D4AF37;">${n.escapeHTML(x.admin)}</b>
          <span style="color:#64748b;"> ➔ </span>
          <b style="color:#38bdf8;">${n.escapeHTML(x.target)}</b>
        </div>
        ${x.details?`<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">${n.escapeHTML(x.details)}</div>`:""}
      </div>`).join("")
  },
  clearLogs(){
    if(!a.db||!confirm("مسح جميع سجلات الإدارة للأرقام المميزة؟"))return;
    a.db.ref(`${r.adminPath}/logs`).remove().then(()=>{a.adminLogs=[];admin.renderLogs();n.showToast("🗑️ تم مسح السجل")}).catch(()=>alert("❌ فشل المسح."))
  }
};

let s={
  renderAll(){
    let els=document.querySelectorAll("[data-username]");
    for(let idx=0;idx<els.length;idx++)o(els[idx])
  },
  setupAdminPanel(){
    document.addEventListener("click",ev=>{
      if(ev.target.closest(".js-user-profile-btn")){
        let tries=0,iv=setInterval(()=>{
          document.getElementById("profile-actions-grid")&&document.querySelector("#userProfileModal [data-username]")&&(clearInterval(iv),s.injectAdminEditor());
          ++tries>200&&clearInterval(iv)
        },10)
      }
      let menu=document.getElementById("custom-tier-menu");
      !menu||"none"===menu.style.display||ev.target.closest("#custom-tier-trigger")||ev.target.closest("#custom-tier-menu")||(menu.style.display="none")
    })
  },
  injectSettingsDashboardBtn(){
    if(!n.isAdmin()){
      document.querySelectorAll("#btn-custom-ids-dash").forEach(x=>x.remove());
      return
    }
    document.querySelectorAll(".modern-classic-list").forEach(list=>{
      if(!list||list.querySelector("#btn-custom-ids-dash"))return;
      let btn=document.createElement("button");
      btn.type="button";
      btn.className="modern-classic-item";
      btn.id="btn-custom-ids-dash";
      btn.innerHTML=`
        <div class="modern-classic-item-content">
          <div class="modern-classic-icon-wrapper" style="background: linear-gradient(135deg, #1e293b, #475569); color: #fbbf24;">
            <i class="fas fa-list-ol"></i>
          </div>
          <span class="modern-classic-text">لوحة تحكم الأرقام المميزة</span>
        </div>
        <i class="fas fa-chevron-left modern-classic-chevron"></i>`;
      btn.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();s.showDashboard()});
      let anchor=list.querySelector("#btn-lail-streak-admin")||list.querySelector("#btn-lail-zajel-admin")||list.querySelector("#btn-lail-zajel");
      anchor?anchor.insertAdjacentElement("afterend",btn):list.appendChild(btn)
    })
  },
  injectAdminEditor(){
    if(!n.isAdmin()){
      let old=document.getElementById("admin-edit-custom-id-container");
      old&&old.remove();
      return
    }
    let uEl=document.querySelector(".profile-header-topic[data-username]")||document.querySelector("#userProfileModal [data-username]");
    if(!uEl)return;
    let uname=uEl.getAttribute("data-username"),origId=uEl.getAttribute("data-user-id")||uEl.closest("[data-user-id]")?.getAttribute("data-user-id");
    if(!uname)return;
    let sec=document.getElementById("profile-admin-edit-section");
    if(!sec)return;
    let san=n.sanitizeName(uname),d=a.cache[san],curId=origId,curDur="permanent",curTier="gold";
    if(d&&d.id&&(!d.expiresAt||Date.now()<d.expiresAt)&&(curId=d.id,curTier=d.tier||"gold",d.expiresAt)){
      let remD=Math.ceil((d.expiresAt-Date.now())/864e5);
      curDur=remD<=1?"1":remD<=7?"7":"30"
    }
    t[curTier]||(curTier="gold");
    let prev=document.getElementById("admin-edit-custom-id-container");
    prev&&prev.remove();
    let previewStr=curId?`#${curId}`:"#123";
    let html=`
      <div id="admin-edit-custom-id-container" style="background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius: 4px; padding: 6px; margin-top: 1px; direction: rtl; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 11px; font-weight: bold; color: #495057; white-space: nowrap;">الرقم المميز</span>
          <input type="number" id="profile-admin-custom-id-input" placeholder="الرقم" value="${curId}" style="flex: 1; min-width: 0; padding: 2px 6px; border: 1px solid #ced4da; border-radius: 3px; font-size: 11px; text-align: center; outline: none; height: 24px;">
          <input type="hidden" id="profile-admin-custom-id-tier" value="${curTier}">
          <button type="button" id="custom-tier-trigger" style="flex: 1.25; min-width: 0; padding: 0 5px; border: 1px solid #ced4da; border-radius: 3px; background: #fff; font-size: 11px; height: 24px; display: flex; align-items: center; justify-content: space-between; gap: 3px; cursor: pointer; overflow: hidden;">
            <span id="custom-tier-label" class="${"default"===curTier?"text-muted":`custom-id-text tier-${curTier}`}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">${t[curTier].label}</span>
            <i class="fas fa-chevron-down" style="font-size: 9px; color: #6c757d; flex-shrink: 0;"></i>
          </button>
          <select id="profile-admin-custom-id-duration" style="flex: 1; min-width: 0; padding: 2px; border: 1px solid #ced4da; border-radius: 3px; font-size: 11px; outline: none; height: 24px;">
            <option value="permanent" ${"permanent"===curDur?"selected":""}>دائم</option>
            <option value="1" ${"1"===curDur?"selected":""}>يوم</option>
            <option value="7" ${"7"===curDur?"selected":""}>أسبوع</option>
            <option value="30" ${"30"===curDur?"selected":""}>شهر</option>
          </select>
        </div>
        <div id="custom-tier-menu" style="display: none; grid-template-columns: 1fr 1fr; gap: 4px; background: #fff; border: 1px solid #ced4da; border-radius: 6px; padding: 6px; max-height: 190px; overflow-y: auto; -webkit-overflow-scrolling: touch; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          ${Object.keys(t).map(k=>`
            <div class="custom-tier-opt${k===curTier?" active":""}" data-tier="${k}">
              <span style="font-size: 11px; color: #333; font-weight: bold;">${t[k].label}</span>
              <span class="tier-preview-num ${"default"===k?"text-muted":`custom-id-text tier-${k}`}" style="font-size: 12px; font-weight: bold; direction: ltr;">${previewStr}</span>
            </div>`).join("")}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #fff; border: 1px dashed #dee2e6; border-radius: 4px; padding: 3px 6px; font-size: 11px; color: #6c757d;">
          <span>معاينة الشكل:</span>
          <span id="custom-id-live-preview" class="${"default"===curTier?"text-muted":`custom-id-text tier-${curTier}`}" style="font-size: 13px; font-weight: bold; direction: ltr;">${previewStr}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-save-custom-id" style="flex: 1; border: none; border-radius: 3px; background: #198754; color: #fff; font-weight: bold; cursor: pointer; font-size: 11px; height: 24px;">حفظ <i class="fas fa-check"></i></button>
          <button id="btn-delete-custom-id" style="flex: 1; border: 1px solid #dc3545; background: transparent; color: #dc3545; font-weight: bold; cursor: pointer; font-size: 11px; height: 24px;">حذف <i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    let streakRow=document.getElementById("admin-edit-streak-container");
    streakRow?streakRow.insertAdjacentHTML("afterend",html):sec.insertAdjacentHTML("beforeend",html);

    let trig=document.getElementById("custom-tier-trigger"),menu=document.getElementById("custom-tier-menu"),tierInp=document.getElementById("profile-admin-custom-id-tier"),tierLbl=document.getElementById("custom-tier-label"),livePrev=document.getElementById("custom-id-live-preview"),numInp=document.getElementById("profile-admin-custom-id-input");
    trig.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();menu.style.display="grid"===menu.style.display?"none":"grid"});
    menu.querySelectorAll(".custom-tier-opt").forEach(opt=>{
      opt.addEventListener("click",function(ev){
        ev.preventDefault();ev.stopPropagation();
        let tk=this.getAttribute("data-tier");
        tierInp.value=tk;
        menu.querySelectorAll(".custom-tier-opt").forEach(x=>x.classList.remove("active"));
        this.classList.add("active");
        tierLbl.textContent=t[tk].label;
        tierLbl.className="default"===tk?"text-muted":`custom-id-text tier-${tk}`;
        livePrev.className="default"===tk?"text-muted":`custom-id-text tier-${tk}`;
        menu.style.display="none"
      })
    });
    numInp.addEventListener("input",function(){
      let v=this.value.trim(),txt=v?`#${v}`:"#123";
      livePrev.textContent=txt;
      menu.querySelectorAll(".tier-preview-num").forEach(x=>x.textContent=txt)
    });
    document.getElementById("btn-save-custom-id").addEventListener("click",function(ev){
      if(ev.preventDefault(),!a.db)return alert("غير متصل بالقاعدة.");
      if(!n.isAdmin())return alert("❌ فشل: لا تملك صلاحية الإدارة!");
      let rawId=numInp.value.trim(),tk=tierInp.value,dur=document.getElementById("profile-admin-custom-id-duration").value,parsed=""===rawId?null:parseInt(rawId);
      if(!parsed)return alert("يرجى كتابة رقم صحيح.");
      let owners=n.findIdOwners(parsed,san);
      if(owners.length&&a.settings.preventDuplicates&&!confirm(`⚠️ الرقم #${parsed} مملوك حالياً لـ (${owners.join(", ")}). هل تريد المتابعة؟`))return;
      let exp=null,durTxt="بشكل دائم",notifName=t[tk]?t[tk].notif:"الذهبي الملكي";
      if("permanent"!==dur){
        let days=parseInt(dur);
        exp=Date.now()+864e5*days;
        durTxt=1===days?"لمدة يوم":7===days?"لمدة أسبوع":"لمدة شهر"
      }
      let btn=this,origHtml=btn.innerHTML;
      btn.disabled=!0;
      a.db.ref(`${r.dbPath}/${san}`).set({
        id:parsed,
        expiresAt:exp,
        tier:tk,
        note:d?.note||null,
        assignedAt:Date.now(),
        assignedBy:a.myUsername||"الإدارة"
      }).then(()=>{
        admin.sendUserNotif(san,`تم منحك الرقم المميز <b>#${parsed}</b> (بالتصنيف ${notifName}) ${durTxt}.`,"success");
        admin.logAction("تعديل من البروفايل",uname,`#${parsed} (${t[tk]?.label||tk}) - ${durTxt}`);
        btn.innerHTML='تم <i class="fas fa-check-double"></i>';
        setTimeout(()=>{btn.innerHTML=origHtml;btn.disabled=!1},2e3)
      }).catch(()=>{
        alert("❌ فشل: لا تملك صلاحية الإدارة!");
        btn.innerHTML='مرفوض <i class="fas fa-times"></i>';
        btn.style.background="#dc3545";
        setTimeout(()=>{btn.innerHTML=origHtml;btn.style.background="#198754";btn.disabled=!1},3e3)
      })
    });
    document.getElementById("btn-delete-custom-id").addEventListener("click",function(ev){
      if(ev.preventDefault(),!a.db)return;
      if(!n.isAdmin())return alert("❌ فشل: لا تملك صلاحية الإدارة!");
      let btn=this,origHtml=btn.innerHTML;
      btn.disabled=!0;
      a.db.ref(`${r.dbPath}/${san}`).remove().then(()=>{
        admin.sendUserNotif(san,"تم إلغاء رقمك المميز وإعادتك للرقم الأساسي.","error");
        admin.logAction("حذف من البروفايل",uname,`إلغاء #${curId}`);
        btn.innerHTML='حُذف <i class="fas fa-trash"></i>';
        btn.style.background="#dc3545";
        btn.style.color="#fff";
        numInp.value=origId;
        setTimeout(()=>{btn.innerHTML=origHtml;btn.style.background="transparent";btn.style.color="#dc3545";btn.disabled=!1},2e3)
      }).catch(()=>{
        alert("❌ فشل: لا تملك صلاحية الإدارة!");
        btn.innerHTML='مرفوض <i class="fas fa-times"></i>';
        btn.style.background="#dc3545";
        btn.style.color="#fff";
        setTimeout(()=>{btn.innerHTML=origHtml;btn.style.background="transparent";btn.style.color="#dc3545";btn.disabled=!1},3e3)
      })
    })
  },
  showDashboard(){admin.open()}
};

let l=()=>{
  if(!a.myUsername||!a.db)return;
  let san=n.sanitizeName(a.myUsername);
  if(!san||a.listenedNotifUser===san)return;
  if(a.listenedNotifUser)a.db.ref(`${r.notifPath}/${a.listenedNotifUser}`).off();
  a.listenedNotifUser=san;
  a.db.ref(`${r.notifPath}/${san}`).on("child_added",snap=>{
    let val=snap.val();
    val&&val.message&&(n.showNotification(val.message,val.type),snap.ref.remove())
  })
};

s.setupAdminPanel();
let d=id=>{
  let el=document.getElementById(id);
  if(el&&el.value){let v=el.value.trim();v&&n.updateMyUsername(v)}
};
document.body.addEventListener("click",ev=>{ev.target.closest("#member-login-btn")&&d("member-username");ev.target.closest("#register-btn")&&d("register-username")});
document.body.addEventListener("submit",ev=>{"member-login-form"===ev.target.id&&d("member-username");"register-form"===ev.target.id&&d("register-username")});
document.body.addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.target.closest("#member-login-form")?d("member-username"):ev.target.closest("#register-form")&&d("register-username"))});

let p=document.querySelector(".my-message, .msg-self, #profile-header-classic-bar, .sidebar-content .user-identity");
if(p){let c=n.captureUsername(p);c&&c.username&&n.updateMyUsername(c.username)}

let m=null,u=new Set;
new MutationObserver(muts=>{
  let needBtn=!1;
  if(n.isAdmin()&&!document.getElementById("btn-custom-ids-dash")&&document.querySelector(".modern-classic-list"))needBtn=!0;
  for(let idx=0;idx<muts.length;idx++){
    let mut=muts[idx],tgt=mut.target;
    if("childList"===mut.type){
      let nodes=mut.addedNodes;
      for(let j=0;j<nodes.length;j++){
        let node=nodes[j];
        if(1===node.nodeType){
          node.hasAttribute("data-username")&&u.add(node);
          let sub=node.querySelectorAll("[data-username]");
          for(let k=0;k<sub.length;k++)u.add(sub[k]);
          let par=node.closest?node.closest("[data-username]"):null;
          par&&u.add(par);
          let logins=node.querySelectorAll?node.querySelectorAll(".msg-status-login, .user-join-message, .sys-msg-login"):[];
          [node,...Array.from(logins)].forEach(el=>{
            if(el&&(el.classList.contains("msg-status-login")||el.classList.contains("user-join-message")||el.classList.contains("sys-msg-login"))){
              let cap=n.captureUsername(el);
              cap&&cap.username&&(el.classList.contains("msg-self")||el.querySelector(".msg-self"))&&n.updateMyUsername(cap.username)
            }
          });
          if("btn-lail-streak-admin"===node.id||"btn-lail-zajel-admin"===node.id||(node.classList&&node.classList.contains("modern-classic-list"))||(node.querySelector&&node.querySelector(".modern-classic-list")))needBtn=!0
        }
      }
    }else if("attributes"===mut.type&&1===tgt.nodeType&&tgt.hasAttribute("data-username")){
      u.add(tgt)
    }
  }
  needBtn&&s.injectSettingsDashboardBtn();
  u.size>0&&(cancelAnimationFrame(m),m=requestAnimationFrame(()=>{u.forEach(el=>o(el));u.clear()}))
}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]});

let boot=setInterval(()=>{
  if("undefined"!=typeof firebase&&firebase.apps.length>0){
    clearInterval(boot);
    a.db=firebase.database();
    a.db.ref("admins").on("value",snap=>{
      let v=snap.val()||{};
      r.adminUsers=Object.keys(v);
      s.injectSettingsDashboardBtn();
      n.isAdmin()||admin.close()
    });
    a.db.ref(`${r.adminPath}/settings`).on("value",snap=>{
      let v=snap.val();
      a.settings=v&&"object"==typeof v?Object.assign({},defaultSettings,v):Object.assign({},defaultSettings);
      s.renderAll();
      admin.updateHeaderStats()
    });
    a.db.ref(`${r.adminPath}/reserved`).on("value",snap=>{
      a.reserved=snap.val()||{};
      admin.refreshAll()
    });
    a.db.ref(r.dbPath).on("value",snap=>{
      a.cache=snap.val()||{};
      s.renderAll();
      admin.refreshAll()
    });
    setTimeout(l,1500)
  }
},500);

window.LaylCustomIds={
  openAdmin:admin.open,
  closeAdmin:admin.close
}
}();
