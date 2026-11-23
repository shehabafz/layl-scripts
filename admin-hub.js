!function(){"use strict";
const HUB_ID = "btn-layl-admin-hub";
const MODAL_ID = "layl-admin-hub-modal";

const PANELS = [
  {
    id: "btn-lail-zajel-admin",
    title: "لوحة تحكم الزاجل",
    desc: "السجل، الحظر، البث، يوم الصراحة",
    icon: "fas fa-sliders-h",
    bg: "linear-gradient(135deg, #27200a, #5c4610)",
    color: "#D4AF37",
    fallback: () => window.LaylZajel?.openAdmin?.()
  },
  {
    id: "btn-lail-streak-admin",
    title: "لوحة تحكم الستريك",
    desc: "الأعضاء، الدروع، الاسترجاع، الطوارئ",
    icon: "fas fa-fire-alt",
    bg: "linear-gradient(135deg, #4a091a, #8b1836)",
    color: "#D4AF37",
    fallback: () => window.LaylStreaks?.openAdmin?.()
  },
  {
    id: "btn-custom-ids-dash",
    title: "الأرقام المميزة",
    desc: "المنح، النقل، الحجز، الرتب الـ 18",
    icon: "fas fa-list-ol",
    bg: "linear-gradient(135deg, #1e293b, #475569)",
    color: "#fbbf24",
    fallback: () => window.LaylCustomIds?.openAdmin?.()
  },
  {
    id: "btn-layl-cal-admin",
    title: "إدارة التقويم",
    desc: "المناسبات، البث، الإعدادات",
    icon: "fas fa-cogs",
    bg: "linear-gradient(135deg, #3b2604, #784c08)",
    color: "#fbbc04",
    fallback: () => window.LaylCal?.openAdminDashboard?.()
  },
  {
    id: "btn-lail-cinema-admin",
    title: "لوحة تحكم السينما",
    desc: "الغرف، الرادار، السهرة والتصويت، السيرفرات والدرع",
    icon: "fas fa-film",
    bg: "linear-gradient(135deg, #450a0a, #991b1b)",
    color: "#fbbf24",
    fallback: () => window.lailCinema?.openAdmin?.()
  },
  {
    id: "btn-lail-feedback-admin",
    title: "لوحة الاقتراحات والشكاوي",
    desc: "التذاكر، ساحة التصويت، الرادار، الحظر والإعدادات",
    icon: "fas fa-inbox",
    bg: "linear-gradient(135deg, #3b0764, #6b21a8)",
    color: "#D4AF37",
    badgeId: "lfb-admin-badge",
    fallback: () => window.LaylFeedback?.openAdmin?.()
  }
];

const watchedBadges = new WeakSet();
const badgeObserver = new MutationObserver(() => updateHubBadges());

function readPanelBadge(p) {
  if (!p.badgeId) return 0;
  const el = document.getElementById(p.badgeId);
  if (!el || el.style.display === "none") return 0;
  const txt = el.textContent.trim();
  if (!txt || txt === "0") return 0;
  const num = parseInt(txt, 10);
  return isNaN(num) ? 0 : num;
}

function watchBadges() {
  for (let i = 0; i < PANELS.length; i++) {
    const bid = PANELS[i].badgeId;
    if (!bid) continue;
    const el = document.getElementById(bid);
    if (el && !watchedBadges.has(el)) {
      watchedBadges.add(el);
      badgeObserver.observe(el, {
        attributes: true,
        attributeFilter: ["style"],
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }
}

function updateHubBadges() {
  let total = 0;
  for (let i = 0; i < PANELS.length; i++) {
    const p = PANELS[i];
    const cnt = readPanelBadge(p);
    total += cnt;
    const cardBadge = document.querySelector(`#${MODAL_ID} .lah-card[data-target="${p.id}"] .lah-badge`);
    if (cardBadge) {
      cardBadge.textContent = cnt > 99 ? "99+" : String(cnt);
      cardBadge.style.display = cnt > 0 ? "inline-block" : "none";
    }
  }
  const label = total > 99 ? "99+" : String(total);
  const hubBadges = document.querySelectorAll(".lah-hub-badge");
  for (let i = 0; i < hubBadges.length; i++) {
    hubBadges[i].textContent = label;
    hubBadges[i].style.display = total > 0 ? "inline-block" : "none";
  }
}

function injectStyles() {
  if (document.getElementById("layl-admin-hub-styles")) return;
  const hideSelectors = PANELS.map(p => `#${p.id}#${p.id}#${p.id}`).join(",\n");
  const s = document.createElement("style");
  s.id = "layl-admin-hub-styles";
  s.innerHTML = `
    ${hideSelectors} {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    #${HUB_ID} .modern-classic-icon-wrapper {
      position: relative !important;
      overflow: visible !important;
    }
    .lah-hub-badge {
      display: none;
      position: absolute;
      top: -5px;
      right: -5px;
      left: auto;
      bottom: auto;
      margin: 0;
      background: #ef4444;
      color: #fff;
      border-radius: 50px;
      font-size: 10px;
      height: 18px;
      line-height: 18px;
      min-width: 18px;
      width: max-content;
      padding: 0 4px;
      text-align: center;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(239, 68, 68, 0.55);
      z-index: 10;
      box-sizing: border-box;
    }
    #${MODAL_ID} {
      position: fixed; inset: 0; background: rgba(8, 10, 18, 0.88);
      z-index: 2147483644; display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      opacity: 0; transition: opacity 0.2s ease; direction: rtl;
      font-family: 'Segoe UI', tahoma, sans-serif;
    }
    #${MODAL_ID}.active { opacity: 1; }
    .lah-box {
      background: linear-gradient(180deg, rgba(28, 31, 56, 0.98) 0%, rgba(16, 18, 34, 0.99) 100%);
      border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px;
      width: 92%; max-width: 440px; max-height: 85vh; max-height: 85dvh;
      padding: 16px 18px 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.85);
      transform: scale(0.95) translateY(12px); transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; color: #f8fafc;
    }
    #${MODAL_ID}.active .lah-box { transform: scale(1) translateY(0); }
    .lah-head {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 12px; margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .lah-title {
      display: flex; align-items: center; gap: 8px;
      color: #D4AF37; font-weight: 800; font-size: 15.5px;
    }
    .lah-close {
      background: rgba(255,255,255,0.09); border: none; color: #fff;
      width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 13px; transition: background 0.2s;
    }
    .lah-close:hover { background: rgba(239, 68, 68, 0.8); }
    .lah-grid {
      display: grid; grid-template-columns: 1fr; gap: 9px;
      overflow-y: auto; -webkit-overflow-scrolling: touch;
    }
    .lah-card {
      display: flex; align-items: center; gap: 12px; width: 100%;
      background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 11px 13px; cursor: pointer;
      text-align: right; color: inherit; font-family: inherit;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      box-sizing: border-box;
    }
    .lah-card:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: rgba(212, 175, 55, 0.45);
    }
    .lah-card:active { transform: scale(0.98); }
    .lah-ico {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    }
    .lah-info { flex: 1; min-width: 0; }
    .lah-name { font-size: 13.5px; font-weight: 800; color: #f8fafc; margin-bottom: 2px; }
    .lah-desc { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lah-badge {
      background: #ef4444; color: #fff; border-radius: 50px;
      font-size: 10.5px; font-weight: 800; padding: 2px 7px; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.45);
    }
    .lah-arrow { color: #64748b; font-size: 12px; flex-shrink: 0; transition: color 0.2s; }
    .lah-card:hover .lah-arrow { color: #D4AF37; }
  `;
  document.head.appendChild(s);
}

function closeHub() {
  const m = document.getElementById(MODAL_ID);
  if (!m) return;
  m.classList.remove("active");
  setTimeout(() => m.remove(), 180);
}

function openHub() {
  let old = document.getElementById(MODAL_ID);
  if (old) old.remove();

  const available = PANELS.filter(p => document.getElementById(p.id));
  if (!available.length) return;

  const ov = document.createElement("div");
  ov.id = MODAL_ID;
  ov.innerHTML = `
    <div class="lah-box">
      <div class="lah-head">
        <div class="lah-title"><i class="fas fa-shield-alt"></i> لوحات التحكم الإدارية</div>
        <button type="button" class="lah-close" id="lah-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
      </div>
      <div class="lah-grid">
        ${available.map(p => {
          const cnt = readPanelBadge(p);
          const badgeHtml = p.badgeId
            ? `<span class="lah-badge" style="display:${cnt > 0 ? "inline-block" : "none"};">${cnt > 99 ? "99+" : cnt}</span>`
            : "";
          return `
          <button type="button" class="lah-card" data-target="${p.id}">
            <div class="lah-ico" style="background:${p.bg}; color:${p.color};">
              <i class="${p.icon}"></i>
            </div>
            <div class="lah-info">
              <div class="lah-name">${p.title}</div>
              <div class="lah-desc">${p.desc}</div>
            </div>
            ${badgeHtml}
            <i class="fas fa-chevron-left lah-arrow"></i>
          </button>`;
        }).join("")}
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener("click", ev => { if (ev.target === ov) closeHub(); });
  document.getElementById("lah-btn-close").onclick = closeHub;

  ov.querySelectorAll(".lah-card").forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute("data-target");
      const panel = PANELS.find(p => p.id === targetId);
      closeHub();
      const orig = document.getElementById(targetId);
      if (orig) orig.click();
      else if (panel && panel.fallback) panel.fallback();
    };
  });

  requestAnimationFrame(() => ov.classList.add("active"));
}

function syncHub(list) {
  if (!list) return;
  let firstOrig = null;
  for (let i = 0; i < PANELS.length; i++) {
    const found = list.querySelector(`#${PANELS[i].id}`);
    if (found) {
      found.style.setProperty("display", "none", "important");
      if (!firstOrig) firstOrig = found;
    }
  }

  const existing = list.querySelector(`#${HUB_ID}`);
  if (!firstOrig) {
    if (existing) existing.remove();
    return;
  }

  if (!existing) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modern-classic-item";
    btn.id = HUB_ID;
    btn.innerHTML = `
      <div class="modern-classic-item-content">
        <div class="modern-classic-icon-wrapper" style="position:relative; overflow:visible; background: linear-gradient(135deg, #4a091a, #8b1836); color: #D4AF37;">
          <i class="fas fa-shield-alt"></i>
          <b class="lah-hub-badge">0</b>
        </div>
        <span class="modern-classic-text">لوحات التحكم الإدارية</span>
      </div>
      <i class="fas fa-chevron-left modern-classic-chevron"></i>`;
    btn.addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openHub();
    });
    firstOrig.insertAdjacentElement("beforebegin", btn);
  }

  watchBadges();
  updateHubBadges();
}

function syncAll() {
  document.querySelectorAll(".modern-classic-list").forEach(syncHub);
}

injectStyles();
syncAll();

const dirty = new Set();
let scheduled = false;

new MutationObserver(muts => {
  for (let i = 0; i < muts.length; i++) {
    const m = muts[i];
    const tgt = m.target;
    if (tgt && tgt.nodeType === 1 && tgt.classList.contains("modern-classic-list")) {
      dirty.add(tgt);
      continue;
    }
    const nodes = m.addedNodes;
    for (let j = 0; j < nodes.length; j++) {
      const node = nodes[j];
      if (node.nodeType !== 1 || node.classList.contains("message-row")) continue;
      if (node.classList.contains("modern-classic-list")) {
        dirty.add(node);
      } else if (node.childElementCount > 0) {
        const inner = node.querySelector(".modern-classic-list");
        if (inner) dirty.add(inner);
      }
    }
  }
  if (dirty.size > 0 && !scheduled) {
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      dirty.forEach(syncHub);
      dirty.clear();
    });
  }
}).observe(document.body, { childList: true, subtree: true });

document.addEventListener("keydown", ev => {
  if (ev.key === "Escape" && document.getElementById(MODAL_ID)) closeHub();
});

setTimeout(syncAll, 800);
setTimeout(() => { watchBadges(); updateHubBadges(); }, 2000);
window.LaylAdminHub = { open: openHub, close: closeHub, refreshBadges: updateHubBadges };
}();
