!function () {
    "use strict";
    if (window.laylFollowPrivacyLoaded) return;
    window.laylFollowPrivacyLoaded = !0;

    const DB_PATH = "layl_follow_privacy";
    const CACHE_TTL = 45000;

    const MODE_META = {
        all: { label: "الكل", desc: "متاحة لجميع أعضاء الشات", icon: "fas fa-globe" },
        friends: { label: "الأصدقاء فقط", desc: "تظهر لمن بينكما صداقة مؤكدة فقط", icon: "fas fa-user-friends" },
        custom: { label: "أشخاص محددون", desc: "تختارهم بنفسك بالاسم أو المعرّف", icon: "fas fa-user-check" },
        none: { label: "مغلق عن الكل", desc: "لا يمكن لأحد غيرك رؤية القائمة", icon: "fas fa-lock" }
    };

    const state = {
        db: null,
        myUsername: localStorage.getItem("pc_username") || null,
        myUserId: null,
        admins: new Set(),
        cache: new Map(),
        pending: new Map(),
        currentOwner: null,
        modalOwner: null,
        modalOwnerFriend: !1,
        bypassEl: null,
        stylesDone: !1,
        draft: null,
        draftTab: "followers"
    };

    const sanitizeKey = s => s ? String(s).replace(/[.#$\[\]\/]/g, "_").trim() : null;
    const normKey = s => {
        const k = sanitizeKey(s);
        return k ? k.toLowerCase() : null;
    };
    const esc = s => String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function getCleanText(el) {
        if (!el) return "";
        const c = el.cloneNode(!0);
        c.querySelectorAll("img, i, svg, .user-identity-badge-icon, .user-identity-super").forEach(x => x.remove());
        return c.textContent.replace(/\s+/g, " ").trim();
    }

    function defaultPrivacy() {
        return {
            followers: { mode: "all", allowed: {} },
            following: { mode: "all", allowed: {} }
        };
    }

    function normalizePrivacyData(raw) {
        const base = defaultPrivacy();
        if (!raw || "object" !== typeof raw) return base;
        ["followers", "following"].forEach(k => {
            const src = raw[k];
            if (!src || "object" !== typeof src) return;
            const m = src.mode;
            base[k].mode = MODE_META[m] ? m : "all";
            if (src.allowed && "object" === typeof src.allowed) {
                const cleanAllowed = {};
                Object.entries(src.allowed).forEach(([ak, av]) => {
                    if (!av) return;
                    const uname = ("object" === typeof av ? av.username : null) || ak;
                    const dn = ("object" === typeof av ? av.displayName : null) || uname;
                    const sk = sanitizeKey(uname) || ak;
                    if (sk) cleanAllowed[sk] = { username: String(uname).trim(), displayName: String(dn).trim() };
                });
                base[k].allowed = cleanAllowed;
            }
        });
        return base;
    }

    // ==================== التعرف على العضو الحالي والإدارة ====================
    function refreshMe() {
        const cu = window.state?.currentUser;
        if (cu) {
            if (cu.username) {
                state.myUsername = String(cu.username).trim();
                try { localStorage.setItem("pc_username", state.myUsername); } catch (e) {}
            }
            const id = cu.id ?? cu.userId;
            if (id !== undefined && id !== null) state.myUserId = Number(id);
        } else if (!state.myUsername) {
            const saved = localStorage.getItem("pc_username");
            if (saved) state.myUsername = saved;
        }
    }

    function isAdmin() {
        refreshMe();
        const cu = window.state?.currentUser;
        if (cu && (!0 === cu.isRootAdmin || 1 === Number(cu.id ?? cu.userId))) return !0;
        const nk = normKey(state.myUsername);
        return Boolean(nk && state.admins.has(nk));
    }

    function isGuestMe() {
        refreshMe();
        const cu = window.state?.currentUser;
        if (cu && (!0 === cu.isGuest || "guest" === String(cu.role || "").toLowerCase())) return !0;
        return !state.myUsername;
    }

    function isSelfOwner(owner) {
        if (!owner) return !1;
        refreshMe();
        const myNk = normKey(state.myUsername);
        if (myNk && owner.keyLower && myNk === owner.keyLower) return !0;
        if (state.myUserId && owner.userId && Number(state.myUserId) === Number(owner.userId)) return !0;
        return !1;
    }

    function getProfileOwner() {
        const modal = document.getElementById("userProfileModal");
        if (!modal) return null;
        const idEl = modal.querySelector("#profile-header-topic-container .user-identity, #profile-mid-username .user-identity");
        if (!idEl) return null;
        const username = (idEl.getAttribute("data-username") || "").trim();
        const uidRaw = idEl.getAttribute("data-user-id");
        const key = sanitizeKey(username);
        if (!key) return null;
        const displayName = getCleanText(idEl.querySelector(".user-identity-name") || idEl) || username;
        return {
            username,
            key,
            keyLower: key.toLowerCase(),
            userId: uidRaw ? Number(uidRaw) : null,
            displayName
        };
    }

    function isFriendWithCurrentProfile() {
        const wrap = document.getElementById("profile-follow-btn-container");
        const btn = document.getElementById("btn-profile-friend");
        if (!wrap || !btn) return !1;
        if (wrap.classList.contains("d-none") || btn.classList.contains("d-none")) return !1;
        return "friends" === btn.getAttribute("data-status");
    }

    function canViewList(owner, listType, data, isFriendFlag) {
        if (!owner || isSelfOwner(owner) || isAdmin()) return !0;
        const cfg = data?.[listType];
        const mode = cfg?.mode || "all";
        if ("all" === mode) return !0;
        if ("none" === mode) return !1;
        if ("friends" === mode) return Boolean(isFriendFlag);
        if ("custom" === mode) {
            refreshMe();
            const myNk = normKey(state.myUsername);
            if (!myNk || !cfg?.allowed) return !1;
            const entries = Object.entries(cfg.allowed);
            for (let i = 0; i < entries.length; i++) {
                const [ak, av] = entries[i];
                if (normKey(ak) === myNk || normKey(av?.username) === myNk) return !0;
            }
            return !1;
        }
        return !0;
    }

    // ==================== الاتصال بـ Firebase مع كاش ذكي ====================
    function getCachedPrivacy(ownerKey) {
        const hit = state.cache.get(ownerKey);
        if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
        return null;
    }

    function fetchPrivacy(ownerKey, force = !1) {
        if (!ownerKey) return Promise.resolve(defaultPrivacy());
        if (!force) {
            const hit = getCachedPrivacy(ownerKey);
            if (hit) return Promise.resolve(hit);
        }
        if (state.pending.has(ownerKey)) return state.pending.get(ownerKey);
        if (!state.db) return Promise.resolve(defaultPrivacy());

        const p = state.db.ref(`${DB_PATH}/${ownerKey}`).once("value").then(snap => {
            const data = normalizePrivacyData(snap.val());
            state.cache.set(ownerKey, { data, ts: Date.now() });
            state.pending.delete(ownerKey);
            return data;
        }).catch(() => {
            state.pending.delete(ownerKey);
            return defaultPrivacy();
        });
        state.pending.set(ownerKey, p);
        return p;
    }

    function savePrivacy(ownerKey, payload) {
        if (!state.db || !ownerKey) return Promise.reject(new Error("no_db"));
        const clean = normalizePrivacyData(payload);
        clean.updatedAt = firebase.database.ServerValue.TIMESTAMP;
        return state.db.ref(`${DB_PATH}/${ownerKey}`).set(clean).then(() => {
            state.cache.set(ownerKey, { data: normalizePrivacyData(clean), ts: Date.now() });
            return clean;
        });
    }

    // ==================== الأنماط والتنبيهات ====================
    function injectStyles() {
        if (state.stylesDone || document.getElementById("lfp-styles")) { state.stylesDone = !0; return; }
        state.stylesDone = !0;
        const st = document.createElement("style");
        st.id = "lfp-styles";
        st.textContent = `
        .lfp-stat-rel{position:relative!important}
        .lfp-stat-badge{
            position:absolute;top:2px;left:3px;font-size:8px;line-height:1;
            pointer-events:none;opacity:.82;
        }
        .lfp-tab-lock{
            font-size:8.5px;margin-inline-start:4px;opacity:.78;vertical-align:middle;
        }
        .lfp-ico-locked{color:#dc2626}
        .lfp-ico-owner{color:#d97706}
        .lfp-ico-admin{color:#7c3aed}
        .lfp-btn-locked{opacity:.88}
        .lfp-tab-locked{opacity:.68!important;cursor:not-allowed!important}

        #lfp-follow-modal-btn{
            background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.24);
            color:#fff;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;
            cursor:pointer;display:inline-flex;align-items:center;gap:4px;
            margin-inline-start:auto;margin-inline-end:8px;
            font-family:inherit;transition:background .15s ease;
        }
        #lfp-follow-modal-btn:hover{background:rgba(255,255,255,.22)}
        #lfp-follow-modal-btn i{font-size:9.5px;opacity:.9}

        #lfp-toast{
            position:fixed;bottom:82px;left:50%;transform:translateX(-50%) translateY(10px);
            background:#131627;border:1px solid rgba(212,175,55,.7);color:#fde68a;
            padding:8px 18px;border-radius:26px;font-size:12.5px;font-weight:800;
            box-shadow:0 10px 26px rgba(0,0,0,.6);z-index:2147483647;
            opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;
            direction:rtl;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;
            font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;
        }
        #lfp-toast.lfp-err{background:#2d1118;border-color:#ef4444;color:#fecaca}
        #lfp-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

        #lfp-modal{
            position:fixed;inset:0;z-index:2147483646;direction:rtl;
            background:rgba(8,10,20,.82);backdrop-filter:blur(5px);
            display:flex;align-items:center;justify-content:center;padding:12px;
            font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;
            box-sizing:border-box;
        }
        .lfp-card{
            width:100%;max-width:410px;max-height:86vh;max-height:86dvh;
            background:linear-gradient(180deg,#1a1e36 0%,#111425 100%);
            border:1px solid rgba(212,175,55,.42);border-radius:18px;
            box-shadow:0 20px 55px rgba(0,0,0,.78);color:#f8fafc;
            display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;
        }
        .lfp-head{
            display:flex;align-items:center;justify-content:space-between;gap:8px;
            padding:12px 15px;border-bottom:1px solid rgba(255,255,255,.08);
            background:rgba(212,175,55,.08);flex-shrink:0;
        }
        .lfp-title{font-size:14.5px;font-weight:800;color:#fde68a;display:flex;align-items:center;gap:7px}
        .lfp-close{
            width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;
            background:rgba(255,255,255,.1);color:#e2e8f0;
            display:inline-flex;align-items:center;justify-content:center;font-size:13px;
        }
        .lfp-close:hover{background:#ef4444;color:#fff}
        .lfp-tabs{
            display:flex;gap:6px;padding:10px 14px 8px;flex-shrink:0;
            border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.18);
        }
        .lfp-tab{
            flex:1;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.09);
            background:rgba(255,255,255,.05);color:#94a3b8;font-size:12.5px;font-weight:800;
            cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;
        }
        .lfp-tab.active{background:rgba(212,175,55,.18);color:#fde68a;border-color:rgba(212,175,55,.55)}
        .lfp-tab-dot{font-size:10px;padding:1px 6px;border-radius:12px;background:rgba(255,255,255,.08);color:#cbd5e1}
        .lfp-tab.active .lfp-tab-dot{background:rgba(212,175,55,.25);color:#fde68a}
        .lfp-body{
            flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 14px;-webkit-overflow-scrolling:touch;
        }
        .lfp-body::-webkit-scrollbar{width:5px}
        .lfp-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lfp-opt{
            width:100%;display:flex;align-items:center;gap:10px;text-align:right;
            background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);
            border-radius:12px;padding:9px 11px;margin-bottom:7px;cursor:pointer;
            color:#f8fafc;font-family:inherit;box-sizing:border-box;
        }
        .lfp-opt:hover{background:rgba(255,255,255,.07)}
        .lfp-opt.active{background:rgba(212,175,55,.14);border-color:#D4AF37}
        .lfp-opt-ico{
            width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.07);
            display:flex;align-items:center;justify-content:center;font-size:14px;color:#cbd5e1;flex-shrink:0;
        }
        .lfp-opt.active .lfp-opt-ico{background:rgba(212,175,55,.22);color:#D4AF37}
        .lfp-opt-txt{flex:1;min-width:0}
        .lfp-opt-lbl{font-size:13px;font-weight:800;color:#fff}
        .lfp-opt-desc{font-size:11px;color:#94a3b8;margin-top:1px}
        .lfp-radio{
            width:18px;height:18px;border-radius:50%;border:2px solid #64748b;flex-shrink:0;
            display:flex;align-items:center;justify-content:center;
        }
        .lfp-opt.active .lfp-radio{border-color:#D4AF37;background:#D4AF37}
        .lfp-opt.active .lfp-radio::after{content:"";width:7px;height:7px;border-radius:50%;background:#111}

        .lfp-custom-box{
            margin-top:10px;background:rgba(0,0,0,.26);border:1px solid rgba(212,175,55,.28);
            border-radius:12px;padding:10px;
        }
        .lfp-sub-hdr{
            display:flex;align-items:center;justify-content:space-between;gap:6px;
            font-size:11.5px;font-weight:800;color:#fde68a;margin-bottom:8px;
        }
        .lfp-copy-btn{
            background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.38);color:#7dd3fc;
            border-radius:8px;padding:3px 8px;font-size:10.5px;font-weight:700;cursor:pointer;font-family:inherit;
        }
        .lfp-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}
        .lfp-chip{
            display:inline-flex;align-items:center;gap:5px;padding:3px 8px 3px 6px;
            border-radius:18px;background:rgba(212,175,55,.16);border:1px solid rgba(212,175,55,.45);
            color:#fef3c7;font-size:11.5px;font-weight:700;max-width:100%;
        }
        .lfp-chip-x{
            background:rgba(239,68,68,.25);color:#fecaca;border:none;width:17px;height:17px;
            border-radius:50%;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
        }
        .lfp-search{
            width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);
            color:#fff;padding:8px 11px;border-radius:10px;font-size:13px;outline:none;
            font-family:inherit;box-sizing:border-box;
        }
        .lfp-search:focus{border-color:#D4AF37}
        .lfp-pick-list{
            margin-top:6px;max-height:135px;overflow-y:auto;border-radius:10px;
            background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.07);
        }
        .lfp-pick-item{
            width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.05);
            color:#e2e8f0;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;
            gap:8px;cursor:pointer;font-family:inherit;font-size:12px;text-align:right;
        }
        .lfp-pick-item:hover{background:rgba(212,175,55,.12)}
        .lfp-pick-item.picked{color:#34d399;background:rgba(16,185,129,.1)}
        .lfp-manual-btn{
            width:100%;margin-top:6px;padding:7px 10px;border-radius:9px;
            background:rgba(16,185,129,.14);border:1px dashed rgba(16,185,129,.45);
            color:#6ee7b7;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;
        }
        .lfp-foot{
            display:flex;gap:8px;padding:11px 14px;border-top:1px solid rgba(255,255,255,.08);
            background:rgba(0,0,0,.2);flex-shrink:0;
        }
        .lfp-save{
            flex:1;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;border:none;
            padding:10px;border-radius:11px;font-size:13.5px;font-weight:900;cursor:pointer;font-family:inherit;
        }
        .lfp-save:disabled{opacity:.6;cursor:not-allowed}
        .lfp-cancel{
            background:rgba(255,255,255,.09);color:#e2e8f0;border:none;padding:10px 14px;
            border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;
        }
        `;
        (document.head || document.documentElement).appendChild(st);
    }

    let toastTimer = null;
    function showToast(msg, isErr = !1) {
        injectStyles();
        let el = document.getElementById("lfp-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "lfp-toast";
            document.body.appendChild(el);
        }
        clearTimeout(toastTimer);
        el.classList.toggle("lfp-err", Boolean(isErr));
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add("show"));
        toastTimer = setTimeout(() => el.classList.remove("show"), 2700);
    }

    // ==================== جلب قائمة الأعضاء للاختيار ====================
    function getSelectableUsers() {
        refreshMe();
        const myNk = normKey(state.myUsername);
        const seen = new Map();
        const collect = sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.closest(".guest, .is-guest, .guest-user")) return;
                const u = (el.getAttribute("data-username") || "").trim();
                const nk = normKey(u);
                if (!u || !nk || nk === myNk || seen.has(nk)) return;
                const dn = getCleanText(el.querySelector(".user-identity-name") || el) || u;
                seen.set(nk, { username: u, displayName: dn });
            });
        };
        collect("#sidebar-users-container .user-identity");
        collect("#messages-container .user-identity");
        return Array.from(seen.values());
    }

    // ==================== تحديث شارات البروفايل ونافذة المتابعة ====================
    function applyProfileBadges(owner, data) {
        if (!owner || state.currentOwner?.keyLower !== owner.keyLower) return;
        const self = isSelfOwner(owner);
        const adm = isAdmin();
        const friend = !self && isFriendWithCurrentProfile();

        [
            { type: "followers", id: "profile-followers-btn", baseTitle: "المتابعون" },
            { type: "following", id: "profile-following-btn", baseTitle: "يتابع" }
        ].forEach(cfg => {
            const btn = document.getElementById(cfg.id);
            if (!btn) return;
            btn.classList.add("lfp-stat-rel");
            btn.querySelectorAll(".lfp-stat-badge").forEach(x => x.remove());
            const mode = data?.[cfg.type]?.mode || "all";
            const allowed = canViewList(owner, cfg.type, data, friend);

            if (!allowed) {
                btn.classList.add("lfp-btn-locked");
                btn.title = `${cfg.baseTitle} (خاصة)`;
                const ico = document.createElement("i");
                ico.className = "fas fa-lock lfp-stat-badge lfp-ico-locked";
                btn.appendChild(ico);
            } else {
                btn.classList.remove("lfp-btn-locked");
                if ("all" !== mode && (self || adm)) {
                    const mLabel = MODE_META[mode]?.label || "مقيد";
                    btn.title = self
                        ? `${cfg.baseTitle} (${mLabel})`
                        : `${cfg.baseTitle} (${mLabel} — مفتوح للإدارة)`;
                    const ico = document.createElement("i");
                    ico.className = self
                        ? "fas fa-lock lfp-stat-badge lfp-ico-owner"
                        : "fas fa-shield-alt lfp-stat-badge lfp-ico-admin";
                    btn.appendChild(ico);
                } else {
                    btn.title = cfg.baseTitle;
                }
            }
        });
    }

    let profileSyncSeq = 0;
    function syncProfileUI() {
        const modal = document.getElementById("userProfileModal");
        if (!modal || (!modal.classList.contains("show") && "block" !== modal.style.display)) return;
        const owner = getProfileOwner();
        if (!owner) return;

        injectStyles();
        state.currentOwner = owner;

        const seq = ++profileSyncSeq;
        const cached = getCachedPrivacy(owner.key);
        if (cached) {
            applyProfileBadges(owner, cached);
            setTimeout(() => { if (seq === profileSyncSeq) applyProfileBadges(owner, cached); }, 350);
            return;
        }

        fetchPrivacy(owner.key).then(data => {
            if (seq !== profileSyncSeq) return;
            applyProfileBadges(owner, data);
            setTimeout(() => { if (seq === profileSyncSeq) applyProfileBadges(owner, data); }, 350);
        });
    }

    function syncFollowModalUI() {
        const owner = state.modalOwner;
        const modal = document.getElementById("followListModal");
        if (!modal || !owner) return;
        injectStyles();

        // زر الخصوصية لصاحب الملف داخل نافذة القوائم فقط
        const hdr = modal.querySelector(".modal-header");
        let quickBtn = document.getElementById("lfp-follow-modal-btn");
        if (hdr && isSelfOwner(owner) && !isGuestMe()) {
            if (!quickBtn) {
                quickBtn = document.createElement("button");
                quickBtn.type = "button";
                quickBtn.id = "lfp-follow-modal-btn";
                quickBtn.innerHTML = '<i class="fas fa-lock"></i><span>الخصوصية</span>';
                quickBtn.onclick = ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    openSettingsModal(owner);
                };
                const closeBtn = hdr.querySelector(".btn-close-classic");
                if (closeBtn) closeBtn.insertAdjacentElement("beforebegin", quickBtn);
                else hdr.appendChild(quickBtn);
            }
        } else if (quickBtn) {
            quickBtn.remove();
        }

        fetchPrivacy(owner.key).then(data => {
            if (state.modalOwner?.keyLower !== owner.keyLower) return;
            [
                { type: "followers", id: "tab-followers-btn" },
                { type: "following", id: "tab-following-btn" }
            ].forEach(cfg => {
                const tabBtn = document.getElementById(cfg.id);
                if (!tabBtn) return;
                tabBtn.querySelectorAll(".lfp-tab-lock").forEach(x => x.remove());
                const allowed = canViewList(owner, cfg.type, data, state.modalOwnerFriend);
                tabBtn.classList.toggle("lfp-tab-locked", !allowed);
                if (!allowed) {
                    const ico = document.createElement("i");
                    ico.className = "fas fa-lock lfp-tab-lock lfp-ico-locked";
                    tabBtn.appendChild(ico);
                }
            });
        });
    }

    // ==================== تغليف دالة تبديل التبويبات داخل نافذة المتابعة ====================
    function wrapSwitchFollowTab() {
        if ("function" !== typeof window.switchFollowModalTab || window.switchFollowModalTab.__lfpWrapped) return;
        const orig = window.switchFollowModalTab;
        const wrapped = function (tabName, ...rest) {
            const owner = state.modalOwner;
            const t = "following" === tabName ? "following" : "followers";
            if (owner && !isSelfOwner(owner) && !isAdmin()) {
                const cached = getCachedPrivacy(owner.key);
                if (cached && !canViewList(owner, t, cached, state.modalOwnerFriend)) {
                    showToast("following" === t ? "🔒 قائمة «يتابع» خاصة بهذا العضو" : "🔒 قائمة «المتابعون» خاصة بهذا العضو", !0);
                    return;
                }
            }
            const res = orig.call(this, tabName, ...rest);
            setTimeout(syncFollowModalUI, 60);
            return res;
        };
        wrapped.__lfpWrapped = !0;
        window.switchFollowModalTab = wrapped;
    }

    // ==================== اعتراض الضغط في مرحلة Capture قبل كود الشات ====================
    function blockEvent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
    }

    function blockedToastMsg(listType) {
        return "following" === listType
            ? "🔒 قائمة «يتابع» خاصة بهذا العضو"
            : "🔒 قائمة «المتابعون» خاصة بهذا العضو";
    }

    function bindClickInterceptor() {
        document.addEventListener("click", ev => {
            const target = ev.target;
            if (!target || 1 !== target.nodeType) return;

            const btn = target.closest("#profile-followers-btn, #profile-following-btn, #tab-followers-btn, #tab-following-btn");
            if (!btn) return;
            if (btn === state.bypassEl) return;

            const isProfileBtn = "profile-followers-btn" === btn.id || "profile-following-btn" === btn.id;
            const listType = ("profile-following-btn" === btn.id || "tab-following-btn" === btn.id) ? "following" : "followers";
            const owner = isProfileBtn ? (getProfileOwner() || state.currentOwner) : state.modalOwner;
            if (!owner) return;

            const friendNow = isProfileBtn ? isFriendWithCurrentProfile() : state.modalOwnerFriend;

            if (isSelfOwner(owner) || isAdmin()) {
                if (isProfileBtn) {
                    state.modalOwner = owner;
                    state.modalOwnerFriend = friendNow;
                    wrapSwitchFollowTab();
                    setTimeout(syncFollowModalUI, 120);
                }
                return;
            }

            const cached = getCachedPrivacy(owner.key);
            if (cached) {
                if (!canViewList(owner, listType, cached, friendNow)) {
                    blockEvent(ev);
                    showToast(blockedToastMsg(listType), !0);
                    return;
                }
                if (isProfileBtn) {
                    state.modalOwner = owner;
                    state.modalOwnerFriend = friendNow;
                    wrapSwitchFollowTab();
                    setTimeout(syncFollowModalUI, 120);
                }
                return;
            }

            // إذا لم يصل رد Firebase بعد: نوقف الضغطة مؤقتاً ثم ننفذها فقط إن كان مسموحاً
            blockEvent(ev);
            fetchPrivacy(owner.key).then(data => {
                applyProfileBadges(owner, data);
                if (!canViewList(owner, listType, data, friendNow)) {
                    showToast(blockedToastMsg(listType), !0);
                    return;
                }
                if (isProfileBtn) {
                    state.modalOwner = owner;
                    state.modalOwnerFriend = friendNow;
                    wrapSwitchFollowTab();
                }
                state.bypassEl = btn;
                try { btn.click(); } finally { state.bypassEl = null; }
                if (isProfileBtn) setTimeout(syncFollowModalUI, 120);
            });
        }, !0);

        // منع Bootstrap Modal من خطف التركيز عن خانات البحث داخل نافذة الإعدادات
        document.addEventListener("focusin", ev => {
            if (ev.target?.closest?.("#lfp-modal")) ev.stopImmediatePropagation();
        }, !0);
    }

    // ==================== نافذة إعدادات خصوصية المتابعة لصاحب الملف ====================
    function closeSettingsModal() {
        document.getElementById("lfp-modal")?.remove();
    }

    function openSettingsModal(owner) {
        if (!owner || !isSelfOwner(owner)) return;
        injectStyles();
        closeSettingsModal();

        const ov = document.createElement("div");
        ov.id = "lfp-modal";
        ov.innerHTML = `
            <div class="lfp-card">
                <div class="lfp-head">
                    <div class="lfp-title"><i class="fas fa-user-lock"></i> خصوصية قوائم المتابعة</div>
                    <button type="button" class="lfp-close" id="lfp-close-btn" title="إغلاق"><i class="fas fa-times"></i></button>
                </div>
                <div class="lfp-tabs">
                    <button type="button" class="lfp-tab active" data-ltab="followers">
                        <i class="fas fa-user-friends"></i> المتابعون <span class="lfp-tab-dot" id="lfp-dot-followers">...</span>
                    </button>
                    <button type="button" class="lfp-tab" data-ltab="following">
                        <i class="fas fa-user-check"></i> يتابع <span class="lfp-tab-dot" id="lfp-dot-following">...</span>
                    </button>
                </div>
                <div class="lfp-body" id="lfp-body">
                    <div style="text-align:center;padding:30px;color:#D4AF37;"><i class="fas fa-spinner fa-spin fa-lg"></i></div>
                </div>
                <div class="lfp-foot">
                    <button type="button" class="lfp-save" id="lfp-save-btn"><i class="fas fa-save"></i> حفظ الإعدادات</button>
                    <button type="button" class="lfp-cancel" id="lfp-cancel-btn">إلغاء</button>
                </div>
            </div>`;
        document.body.appendChild(ov);

        ov.addEventListener("click", ev => { if (ev.target === ov) closeSettingsModal(); });
        ov.querySelector("#lfp-close-btn").onclick = closeSettingsModal;
        ov.querySelector("#lfp-cancel-btn").onclick = closeSettingsModal;

        ov.querySelectorAll("[data-ltab]").forEach(btn => {
            btn.onclick = () => {
                state.draftTab = btn.getAttribute("data-ltab");
                ov.querySelectorAll("[data-ltab]").forEach(b => b.classList.toggle("active", b === btn));
                renderSettingsBody();
            };
        });

        ov.querySelector("#lfp-save-btn").onclick = () => {
            if (!state.draft) return;
            const saveBtn = ov.querySelector("#lfp-save-btn");
            saveBtn.disabled = !0;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            savePrivacy(owner.key, state.draft).then(saved => {
                applyProfileBadges(owner, saved);
                syncFollowModalUI();
                closeSettingsModal();
                showToast("✅ تم حفظ إعدادات خصوصية المتابعة");
            }).catch(() => {
                saveBtn.disabled = !1;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ الإعدادات';
                showToast("⚠️ تعذر الحفظ — تأكد من الاتصال وصلاحيات Firebase", !0);
            });
        };

        state.draftTab = "followers";
        fetchPrivacy(owner.key, !0).then(data => {
            state.draft = JSON.parse(JSON.stringify(data));
            updateTabDots();
            renderSettingsBody();
        });
    }

    function updateTabDots() {
        if (!state.draft) return;
        ["followers", "following"].forEach(t => {
            const el = document.getElementById(`lfp-dot-${t}`);
            if (!el) return;
            const m = state.draft[t]?.mode || "all";
            el.textContent = MODE_META[m]?.label || "الكل";
        });
    }

    function renderSettingsBody() {
        const body = document.getElementById("lfp-body");
        if (!body || !state.draft) return;
        const tab = state.draftTab;
        const cfg = state.draft[tab];
        const otherTab = "followers" === tab ? "following" : "followers";
        const otherLabel = "followers" === otherTab ? "المتابعون" : "يتابع";
        const otherCount = Object.keys(state.draft[otherTab]?.allowed || {}).length;

        let html = Object.entries(MODE_META).map(([mKey, meta]) => `
            <button type="button" class="lfp-opt ${cfg.mode === mKey ? "active" : ""}" data-mode="${mKey}">
                <div class="lfp-opt-ico"><i class="${meta.icon}"></i></div>
                <div class="lfp-opt-txt">
                    <div class="lfp-opt-lbl">${meta.label}</div>
                    <div class="lfp-opt-desc">${meta.desc}</div>
                </div>
                <div class="lfp-radio"></div>
            </button>`).join("");

        if ("custom" === cfg.mode) {
            const allowedEntries = Object.entries(cfg.allowed || {});
            const chipsHtml = allowedEntries.length
                ? allowedEntries.map(([k, v]) => `
                    <span class="lfp-chip">
                        <span>${esc(v.displayName || v.username)}</span>
                        <span style="opacity:.65;font-size:10px;direction:ltr;">@${esc(v.username)}</span>
                        <button type="button" class="lfp-chip-x" data-rm="${esc(k)}" title="إزالة">×</button>
                    </span>`).join("")
                : '<div style="font-size:11.5px;color:#94a3b8;padding:3px 2px;">لم تختر أي شخص بعد (القائمة مغلقة حتى تضيف شخصاً)</div>';

            html += `
                <div class="lfp-custom-box">
                    <div class="lfp-sub-hdr">
                        <span>المسموح لهم (${allowedEntries.length})</span>
                        ${otherCount > 0 ? `<button type="button" class="lfp-copy-btn" id="lfp-copy-other"><i class="fas fa-copy"></i> نسخ من «${otherLabel}» (${otherCount})</button>` : ""}
                    </div>
                    <div class="lfp-chips">${chipsHtml}</div>
                    <input type="text" id="lfp-user-search" class="lfp-search" placeholder="🔍 ابحث في المتواجدين أو اكتب @اليوزر..." autocomplete="off">
                    <div id="lfp-pick-wrap"></div>
                </div>`;
        }

        body.innerHTML = html;

        body.querySelectorAll("[data-mode]").forEach(btn => {
            btn.onclick = () => {
                cfg.mode = btn.getAttribute("data-mode");
                updateTabDots();
                renderSettingsBody();
            };
        });

        body.querySelectorAll("[data-rm]").forEach(btn => {
            btn.onclick = () => {
                delete cfg.allowed[btn.getAttribute("data-rm")];
                renderSettingsBody();
            };
        });

        const copyBtn = body.querySelector("#lfp-copy-other");
        if (copyBtn) {
            copyBtn.onclick = () => {
                cfg.allowed = JSON.parse(JSON.stringify(state.draft[otherTab].allowed || {}));
                renderSettingsBody();
                showToast("✅ تم نسخ قائمة المسموحين");
            };
        }

        const searchInp = body.querySelector("#lfp-user-search");
        if (searchInp) {
            const users = getSelectableUsers();
            const renderPicker = () => {
                const wrap = body.querySelector("#lfp-pick-wrap");
                if (!wrap) return;
                const rawQ = searchInp.value.trim();
                const q = rawQ.replace(/^@+/, "").toLowerCase();
                const filtered = users.filter(u =>
                    !q || u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
                ).slice(0, 35);

                const isPicked = uname => {
                    const nk = normKey(uname);
                    return Object.entries(cfg.allowed || {}).some(([ak, av]) => normKey(ak) === nk || normKey(av?.username) === nk);
                };

                let pHtml = "";
                if (filtered.length) {
                    pHtml += '<div class="lfp-pick-list">' + filtered.map(u => {
                        const picked = isPicked(u.username);
                        return `
                            <button type="button" class="lfp-pick-item ${picked ? "picked" : ""}" data-pu="${esc(u.username)}" data-pd="${esc(u.displayName)}">
                                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                    <b>${esc(u.displayName)}</b>
                                    <span style="opacity:.6;font-size:10.5px;margin-right:4px;">@${esc(u.username)}</span>
                                </span>
                                <i class="fas ${picked ? "fa-check-circle" : "fa-plus-circle"}"></i>
                            </button>`;
                    }).join("") + "</div>";
                } else {
                    pHtml += '<div style="font-size:11px;color:#94a3b8;text-align:center;padding:8px 4px;">لا يوجد عضو متصل بهذا الاسم</div>';
                }

                const manualClean = rawQ.replace(/^@+/, "").trim();
                if (manualClean && !isPicked(manualClean)) {
                    pHtml += `<button type="button" class="lfp-manual-btn" id="lfp-add-manual"><i class="fas fa-user-plus"></i> إضافة المعرّف «@${esc(manualClean)}» يدوياً</button>`;
                }
                wrap.innerHTML = pHtml;

                wrap.querySelectorAll("[data-pu]").forEach(item => {
                    item.onclick = () => {
                        const u = item.getAttribute("data-pu");
                        const d = item.getAttribute("data-pd") || u;
                        const sk = sanitizeKey(u);
                        const nk = normKey(u);
                        if (!sk) return;
                        const existingKey = Object.keys(cfg.allowed || {}).find(k => normKey(k) === nk || normKey(cfg.allowed[k]?.username) === nk);
                        if (existingKey) delete cfg.allowed[existingKey];
                        else cfg.allowed[sk] = { username: u, displayName: d };
                        renderSettingsBody();
                    };
                });

                const mBtn = wrap.querySelector("#lfp-add-manual");
                if (mBtn) {
                    mBtn.onclick = () => {
                        const sk = sanitizeKey(manualClean);
                        if (!sk) return;
                        cfg.allowed[sk] = { username: manualClean, displayName: manualClean };
                        renderSettingsBody();
                    };
                }
            };
            searchInp.oninput = renderPicker;
            renderPicker();
        }
    }

    // ==================== مراقب خفيف جداً على نافذة البروفايل فقط ====================
    function attachModalObservers() {
        const profileModal = document.getElementById("userProfileModal");
        if (!profileModal) {
            setTimeout(attachModalObservers, 800);
            return;
        }

        let syncTimer = null;
        const scheduleSync = () => {
            clearTimeout(syncTimer);
            syncTimer = setTimeout(syncProfileUI, 45);
        };

        new MutationObserver(scheduleSync).observe(profileModal, {
            attributes: !0,
            attributeFilter: ["class", "style"]
        });

        const hdrTopic = document.getElementById("profile-header-topic-container");
        if (hdrTopic) {
            new MutationObserver(scheduleSync).observe(hdrTopic, { childList: !0, subtree: !0 });
        }

        const followModal = document.getElementById("followListModal");
        if (followModal) {
            new MutationObserver(() => {
                if (followModal.classList.contains("show") || "block" === followModal.style.display) {
                    wrapSwitchFollowTab();
                    syncFollowModalUI();
                }
            }).observe(followModal, { attributes: !0, attributeFilter: ["class", "style"] });
        }
    }

    function bindLoginCapture() {
        const grab = id => {
            const v = document.getElementById(id)?.value?.trim();
            if (v) {
                state.myUsername = v;
                try { localStorage.setItem("pc_username", v); } catch (e) {}
            }
        };
        document.addEventListener("submit", ev => {
            if ("member-login-form" === ev.target?.id) grab("member-username");
            else if ("register-form" === ev.target?.id) grab("register-username");
        }, !0);
    }

    function bootFirebase(tries = 0) {
        if ("undefined" !== typeof firebase && firebase.database && firebase.apps?.length > 0) {
            state.db = firebase.database();
            state.db.ref("admins").on("value", snap => {
                state.admins.clear();
                Object.keys(snap.val() || {}).forEach(k => {
                    const nk = normKey(k);
                    if (nk) state.admins.add(nk);
                });
            });
            return;
        }
        if (tries < 30) setTimeout(() => bootFirebase(tries + 1), 500);
    }

    window.LaylFollowPrivacy = {
        open() {
            refreshMe();
            const key = sanitizeKey(state.myUsername);
            if (!key) return showToast("⚠️ هذه الميزة للأعضاء المسجلين فقط", !0);
            openSettingsModal({ username: state.myUsername, key, keyLower: key.toLowerCase(), userId: state.myUserId, displayName: state.myUsername });
        }
    };

    bindLoginCapture();
    bindClickInterceptor();
    attachModalObservers();
    bootFirebase();
}();
