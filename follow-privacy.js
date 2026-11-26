!function () {
    "use strict";
    if (window.laylFollowPrivacyLoaded) return;
    window.laylFollowPrivacyLoaded = !0;

    const DB_PATH = "layl_follow_privacy";
    const ATTEMPTS_SUB = "__attempts__";
    const CACHE_TTL = 45000;
    const MAX_ATTEMPTS = 15;
    const ATTEMPT_COOLDOWN = 60000;

    const MODE_META = {
        all: { label: "الكل", desc: "متاحة لجميع أعضاء الشات", icon: "fas fa-globe" },
        friends: { label: "الأصدقاء فقط", desc: "تظهر لمن بينكما صداقة مؤكدة فقط", icon: "fas fa-user-friends" },
        custom: { label: "أشخاص محددون", desc: "تختار من تسمح لهم بالرؤية فقط", icon: "fas fa-user-check" },
        except: { label: "الكل ما عدا...", desc: "متاحة للجميع باستثناء من تحددهم", icon: "fas fa-user-minus" },
        none: { label: "مغلق عن الكل", desc: "لا يمكن لأحد غيرك رؤية القائمة", icon: "fas fa-lock" }
    };

    const state = {
        db: null,
        myUsername: localStorage.getItem("pc_username") || null,
        myDisplayName: null,
        myUserId: null,
        admins: new Set(),
        cache: new Map(),
        pending: new Map(),
        attemptThrottle: new Map(),
        scrapedFollowUsers: new Map(),
        currentOwner: null,
        modalOwner: null,
        modalOwnerFriend: !1,
        modalActiveTab: "followers",
        bypassEl: null,
        stylesDone: !1,
        draft: null,
        draftTab: "followers",
        attemptsList: null,
        attemptsLoading: !1,
        selectableUsers: null
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

    function timeAgo(ts) {
        if (!ts) return "";
        const m = Math.floor((Date.now() - ts) / 60000);
        if (m < 1) return "الآن";
        if (m < 60) return `منذ ${m} د`;
        const h = Math.floor(m / 60);
        return h < 24 ? `منذ ${h} س` : `منذ ${Math.floor(h / 24)} ي`;
    }

    function defaultListCfg() {
        return { mode: "all", allowed: {}, excluded: {} };
    }

    function defaultPrivacy() {
        return {
            followers: defaultListCfg(),
            following: defaultListCfg(),
            customMsg: "",
            logAttempts: !0
        };
    }

    function cleanUserMap(rawMap) {
        const out = {};
        if (!rawMap || "object" !== typeof rawMap) return out;
        Object.entries(rawMap).forEach(([ak, av]) => {
            if (!av) return;
            const uname = ("object" === typeof av ? av.username : null) || ak;
            const dn = ("object" === typeof av ? av.displayName : null) || uname;
            const nk = normKey(uname) || normKey(ak);
            if (nk) out[nk] = { username: String(uname).trim(), displayName: String(dn).trim() };
        });
        return out;
    }

    function normalizePrivacyData(raw) {
        const base = defaultPrivacy();
        if (!raw || "object" !== typeof raw) return base;
        ["followers", "following"].forEach(k => {
            const src = raw[k];
            if (!src || "object" !== typeof src) return;
            base[k].mode = MODE_META[src.mode] ? src.mode : "all";
            base[k].allowed = cleanUserMap(src.allowed);
            base[k].excluded = cleanUserMap(src.excluded);
        });
        if ("string" === typeof raw.customMsg) base.customMsg = raw.customMsg.trim().slice(0, 50);
        base.logAttempts = !1 !== raw.logAttempts;
        return base;
    }

    function isAnyRestricted(data) {
        return Boolean(data && ("all" !== (data.followers?.mode || "all") || "all" !== (data.following?.mode || "all")));
    }

    // ==================== التعرف على العضو الحالي والإدارة ====================
    function refreshMe() {
        const cu = window.state?.currentUser;
        if (cu) {
            if (cu.username) {
                state.myUsername = String(cu.username).trim();
                try { localStorage.setItem("pc_username", state.myUsername); } catch (e) {}
            }
            const dn = cu.topic || cu.displayName || cu.nickname || cu.username;
            if (dn) state.myDisplayName = String(dn).trim();
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
        const keyLower = normKey(username);
        if (!keyLower) return null;
        const displayName = getCleanText(idEl.querySelector(".user-identity-name") || idEl) || username;
        return {
            username,
            key,
            keyLower,
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

    function mapHasUser(mapObj, targetNk) {
        if (!targetNk || !mapObj || "object" !== typeof mapObj) return !1;
        if (mapObj[targetNk]) return !0;
        const entries = Object.entries(mapObj);
        for (let i = 0; i < entries.length; i++) {
            const [ak, av] = entries[i];
            if (normKey(ak) === targetNk || normKey(av?.username) === targetNk) return !0;
        }
        return !1;
    }

    function canViewList(owner, listType, data, isFriendFlag) {
        if (!owner || isSelfOwner(owner) || isAdmin()) return !0;
        const cfg = data?.[listType];
        const mode = cfg?.mode || "all";
        if ("all" === mode) return !0;
        if ("none" === mode) return !1;
        if ("friends" === mode) return Boolean(isFriendFlag);
        refreshMe();
        const myNk = normKey(state.myUsername);
        if ("custom" === mode) return Boolean(myNk && mapHasUser(cfg?.allowed, myNk));
        if ("except" === mode) return !(myNk && mapHasUser(cfg?.excluded, myNk));
        return !0;
    }

    // ==================== Firebase (موحد بالأحرف الصغيرة + سجل المحاولات) ====================
    function getCachedPrivacy(keyLower) {
        const hit = state.cache.get(keyLower);
        if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
        return null;
    }

    function fetchPrivacy(owner, force = !1) {
        const keyLower = "string" === typeof owner ? normKey(owner) : owner?.keyLower;
        const legacyKey = "object" === typeof owner ? owner?.key : null;
        if (!keyLower) return Promise.resolve(defaultPrivacy());
        if (!force) {
            const hit = getCachedPrivacy(keyLower);
            if (hit) return Promise.resolve(hit);
        }
        if (state.pending.has(keyLower)) return state.pending.get(keyLower);
        if (!state.db) return Promise.resolve(defaultPrivacy());

        const p = state.db.ref(`${DB_PATH}/${keyLower}`).once("value").then(snap => {
            const val = snap.val();
            if (val !== null) return val;
            if (legacyKey && legacyKey !== keyLower) {
                return state.db.ref(`${DB_PATH}/${legacyKey}`).once("value").then(s2 => s2.val());
            }
            return null;
        }).then(raw => {
            const data = normalizePrivacyData(raw);
            state.cache.set(keyLower, { data, ts: Date.now() });
            state.pending.delete(keyLower);
            return data;
        }).catch(() => {
            state.pending.delete(keyLower);
            return defaultPrivacy();
        });
        state.pending.set(keyLower, p);
        return p;
    }

    function savePrivacy(owner, payload) {
        const keyLower = "string" === typeof owner ? normKey(owner) : owner?.keyLower;
        const legacyKey = "object" === typeof owner ? owner?.key : null;
        if (!state.db || !keyLower) return Promise.reject(new Error("no_db"));
        const clean = normalizePrivacyData(payload);
        clean.updatedAt = firebase.database.ServerValue.TIMESTAMP;
        return state.db.ref(`${DB_PATH}/${keyLower}`).set(clean).then(() => {
            state.cache.set(keyLower, { data: normalizePrivacyData(clean), ts: Date.now() });
            if (legacyKey && legacyKey !== keyLower) {
                state.db.ref(`${DB_PATH}/${legacyKey}`).remove().catch(() => {});
            }
            return clean;
        });
    }

    function logBlockedAttempt(owner, listType, data) {
        if (!state.db || !owner?.keyLower || isSelfOwner(owner) || isAdmin()) return;
        if (!1 === data?.logAttempts) return;
        const tKey = `${owner.keyLower}:${listType}`;
        const now = Date.now();
        if (now - (state.attemptThrottle.get(tKey) || 0) < ATTEMPT_COOLDOWN) return;
        state.attemptThrottle.set(tKey, now);

        refreshMe();
        const ref = state.db.ref(`${DB_PATH}/${ATTEMPTS_SUB}/${owner.keyLower}`);
        ref.push({
            username: state.myUsername || "",
            displayName: state.myDisplayName || state.myUsername || "زائر",
            listType,
            ts: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            ref.once("value").then(snap => {
                const val = snap.val();
                if (!val) return;
                const sorted = Object.entries(val).sort((a, b) => (b[1]?.ts || 0) - (a[1]?.ts || 0));
                if (sorted.length <= MAX_ATTEMPTS) return;
                const removals = {};
                for (let i = MAX_ATTEMPTS; i < sorted.length; i++) removals[sorted[i][0]] = null;
                ref.update(removals).catch(() => {});
            }).catch(() => {});
        }).catch(() => {});
    }

    function fetchAttempts(keyLower) {
        if (!state.db || !keyLower) return Promise.resolve([]);
        return state.db.ref(`${DB_PATH}/${ATTEMPTS_SUB}/${keyLower}`).limitToLast(MAX_ATTEMPTS).once("value").then(snap => {
            const val = snap.val() || {};
            return Object.entries(val)
                .map(([id, item]) => Object.assign({ id }, item || {}))
                .sort((a, b) => (b.ts || 0) - (a.ts || 0))
                .slice(0, MAX_ATTEMPTS);
        }).catch(() => []);
    }

    function clearAttempts(keyLower) {
        if (!state.db || !keyLower) return Promise.resolve();
        return state.db.ref(`${DB_PATH}/${ATTEMPTS_SUB}/${keyLower}`).remove();
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
            margin-inline-start:auto;margin-inline-end:8px;position:relative;
            font-family:inherit;transition:background .15s ease,border-color .15s ease;
        }
        #lfp-follow-modal-btn:hover{background:rgba(255,255,255,.22)}
        #lfp-follow-modal-btn i{font-size:9.5px;opacity:.9}
        #lfp-follow-modal-btn.lfp-privacy-active{
            background:rgba(212,175,55,.22);border-color:rgba(212,175,55,.68);color:#fde68a;
        }
        #lfp-follow-modal-btn.lfp-privacy-active i{color:#fbbf24;opacity:1}
        .lfp-active-dot{
            width:6px;height:6px;border-radius:50%;background:#fbbf24;
            box-shadow:0 0 6px rgba(251,191,36,.85);display:none;
        }
        #lfp-follow-modal-btn.lfp-privacy-active .lfp-active-dot{display:inline-block}

        #lfp-admin-bar{
            display:flex;align-items:center;justify-content:space-between;gap:8px;
            padding:5px 10px;background:linear-gradient(90deg,rgba(124,58,237,.12),rgba(212,175,55,.1));
            border-bottom:1px solid rgba(124,58,237,.24);color:#4c1d95;
            font-size:11px;font-weight:700;direction:rtl;
            font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;
        }
        .lfp-admin-bar-txt{display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .lfp-admin-bar-btn{
            flex-shrink:0;background:#6d28d9;color:#fff;border:none;border-radius:6px;
            padding:2px 8px;font-size:10.5px;font-weight:800;cursor:pointer;font-family:inherit;
            display:inline-flex;align-items:center;gap:4px;
        }
        .lfp-admin-bar-btn:hover{background:#5b21b6}

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

        .lfp-overlay{
            position:fixed;inset:0;z-index:2147483646;direction:rtl;
            background:rgba(8,10,20,.82);backdrop-filter:blur(5px);
            display:flex;align-items:center;justify-content:center;padding:12px;
            font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;
            box-sizing:border-box;
        }
        .lfp-card{
            width:100%;max-width:420px;max-height:86vh;max-height:86dvh;
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
        .lfp-title{font-size:14px;font-weight:800;color:#fde68a;display:flex;align-items:center;gap:7px}
        .lfp-close{
            width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;
            background:rgba(255,255,255,.1);color:#e2e8f0;
            display:inline-flex;align-items:center;justify-content:center;font-size:13px;
        }
        .lfp-close:hover{background:#ef4444;color:#fff}
        .lfp-tabs{
            display:flex;gap:5px;padding:9px 12px 8px;flex-shrink:0;
            border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.18);
        }
        .lfp-tab{
            flex:1;padding:7px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.09);
            background:rgba(255,255,255,.05);color:#94a3b8;font-size:11.5px;font-weight:800;
            cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        }
        .lfp-tab.active{background:rgba(212,175,55,.18);color:#fde68a;border-color:rgba(212,175,55,.55)}
        .lfp-tab-dot{font-size:9.5px;padding:1px 6px;border-radius:10px;background:rgba(255,255,255,.08);color:#cbd5e1;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .lfp-tab.active .lfp-tab-dot{background:rgba(212,175,55,.25);color:#fde68a}
        .lfp-body{
            flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 14px;-webkit-overflow-scrolling:touch;
        }
        .lfp-body::-webkit-scrollbar{width:5px}
        .lfp-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lfp-opt{
            width:100%;display:flex;align-items:center;gap:10px;text-align:right;
            background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);
            border-radius:12px;padding:8px 11px;margin-bottom:6px;cursor:pointer;
            color:#f8fafc;font-family:inherit;box-sizing:border-box;
        }
        .lfp-opt:hover{background:rgba(255,255,255,.07)}
        .lfp-opt.active{background:rgba(212,175,55,.14);border-color:#D4AF37}
        .lfp-opt.active[data-mode="except"]{background:rgba(239,68,68,.12);border-color:rgba(248,113,113,.65)}
        .lfp-opt-ico{
            width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.07);
            display:flex;align-items:center;justify-content:center;font-size:13px;color:#cbd5e1;flex-shrink:0;
        }
        .lfp-opt.active .lfp-opt-ico{background:rgba(212,175,55,.22);color:#D4AF37}
        .lfp-opt.active[data-mode="except"] .lfp-opt-ico{background:rgba(239,68,68,.2);color:#f87171}
        .lfp-opt-txt{flex:1;min-width:0}
        .lfp-opt-lbl{font-size:12.5px;font-weight:800;color:#fff}
        .lfp-opt-desc{font-size:10.5px;color:#94a3b8;margin-top:1px}
        .lfp-radio{
            width:17px;height:17px;border-radius:50%;border:2px solid #64748b;flex-shrink:0;
            display:flex;align-items:center;justify-content:center;
        }
        .lfp-opt.active .lfp-radio{border-color:#D4AF37;background:#D4AF37}
        .lfp-opt.active[data-mode="except"] .lfp-radio{border-color:#f87171;background:#f87171}
        .lfp-opt.active .lfp-radio::after{content:"";width:6px;height:6px;border-radius:50%;background:#111}

        .lfp-custom-box{
            margin-top:9px;background:rgba(0,0,0,.26);border:1px solid rgba(212,175,55,.28);
            border-radius:12px;padding:10px;
        }
        .lfp-custom-box.is-except{border-color:rgba(248,113,113,.38)}
        .lfp-sub-hdr{
            display:flex;align-items:center;justify-content:space-between;gap:6px;
            font-size:11.5px;font-weight:800;color:#fde68a;margin-bottom:8px;
        }
        .lfp-custom-box.is-except .lfp-sub-hdr{color:#fca5a5}
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
        .lfp-chip.is-except{background:rgba(239,68,68,.16);border-color:rgba(248,113,113,.5);color:#fee2e2}
        .lfp-chip-x{
            background:rgba(239,68,68,.28);color:#fecaca;border:none;width:17px;height:17px;
            border-radius:50%;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
        }
        .lfp-search{
            width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);
            color:#fff;padding:8px 11px;border-radius:10px;font-size:12.5px;outline:none;
            font-family:inherit;box-sizing:border-box;
        }
        .lfp-search:focus{border-color:#D4AF37}
        .lfp-pick-list{
            margin-top:6px;max-height:138px;overflow-y:auto;border-radius:10px;
            background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.07);
        }
        .lfp-pick-item{
            width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.05);
            color:#e2e8f0;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;
            gap:8px;cursor:pointer;font-family:inherit;font-size:12px;text-align:right;
        }
        .lfp-pick-item:hover{background:rgba(212,175,55,.12)}
        .lfp-pick-item.picked{color:#34d399;background:rgba(16,185,129,.1)}
        .lfp-pick-item.picked-except{color:#fca5a5;background:rgba(239,68,68,.12)}
        .lfp-u-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0;margin-inline-end:5px}
        .lfp-u-dot.on{background:#22c55e}
        .lfp-u-dot.off{background:#64748b}
        .lfp-manual-btn{
            width:100%;margin-top:6px;padding:7px 10px;border-radius:9px;
            background:rgba(16,185,129,.14);border:1px dashed rgba(16,185,129,.45);
            color:#6ee7b7;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;
        }

        .lfp-section{
            background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.07);
            border-radius:12px;padding:10px 11px;margin-bottom:10px;
        }
        .lfp-sec-title{
            display:flex;align-items:center;justify-content:space-between;gap:8px;
            font-size:12px;font-weight:800;color:#fde68a;margin-bottom:7px;
        }
        .lfp-switch{position:relative;width:40px;height:21px;flex-shrink:0;display:inline-block}
        .lfp-switch input{opacity:0;width:0;height:0}
        .lfp-slider{position:absolute;inset:0;background:#334155;border-radius:21px;cursor:pointer;transition:.2s}
        .lfp-slider:before{content:"";position:absolute;width:15px;height:15px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
        .lfp-switch input:checked + .lfp-slider{background:#10b981}
        .lfp-switch input:checked + .lfp-slider:before{transform:translateX(-19px)}

        .lfp-attempt-row{
            display:flex;align-items:center;justify-content:space-between;gap:8px;
            padding:7px 9px;border-radius:9px;background:rgba(255,255,255,.035);
            border:1px solid rgba(255,255,255,.06);margin-bottom:5px;font-size:12px;
        }
        .lfp-tag{
            font-size:10px;font-weight:800;padding:2px 7px;border-radius:12px;white-space:nowrap;
        }
        .lfp-tag-fol{background:rgba(56,189,248,.16);color:#7dd3fc}
        .lfp-tag-ing{background:rgba(16,185,129,.16);color:#6ee7b7}
        .lfp-danger-sm{
            background:rgba(239,68,68,.16);border:1px solid rgba(239,68,68,.38);color:#fca5a5;
            border-radius:8px;padding:3px 9px;font-size:10.5px;font-weight:800;cursor:pointer;font-family:inherit;
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
        .lfp-reset-btn{
            flex:1;background:rgba(239,68,68,.2);border:1px solid rgba(248,113,113,.5);color:#fecaca;
            padding:10px;border-radius:11px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;
        }
        .lfp-reset-btn:hover{background:rgba(239,68,68,.35);color:#fff}
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
        toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
    }

    // ==================== جمع الأعضاء (المتابعون + غير المتصلين + المتواجدون) ====================
    function scrapeFollowListUsers() {
        if (!isSelfOwner(state.modalOwner)) return;
        const cont = document.getElementById("follow-list-container");
        if (!cont) return;
        refreshMe();
        const myNk = normKey(state.myUsername);
        const rows = cont.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const nameEl = row.querySelector(".fw-bold");
            const handleEl = row.querySelector(".text-muted");
            let u = (handleEl?.textContent || "").trim().replace(/^@+/, "");
            if (!u) {
                const oc = row.querySelector("[onclick*='showUserProfile']")?.getAttribute("onclick") || "";
                const m = oc.match(/showUserProfile\(['"]([^'"]+)['"]\)/);
                if (m) u = m[1].trim();
            }
            const nk = normKey(u);
            if (!u || !nk || nk === myNk) continue;
            const dn = (nameEl?.textContent || "").replace(/\s+/g, " ").trim() || u;
            const online = Boolean(row.querySelector(".bg-success"));
            state.scrapedFollowUsers.set(nk, { username: u, displayName: dn, online, fromFollow: !0 });
        }
    }

    function getSelectableUsers() {
        scrapeFollowListUsers();
        refreshMe();
        const myNk = normKey(state.myUsername);
        const merged = new Map();

        state.scrapedFollowUsers.forEach((v, nk) => {
            if (nk !== myNk) merged.set(nk, Object.assign({}, v));
        });

        const collectDOM = (sel, isOnline) => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.closest(".guest, .is-guest, .guest-user")) return;
                const u = (el.getAttribute("data-username") || "").trim();
                const nk = normKey(u);
                if (!u || !nk || nk === myNk) return;
                const dn = getCleanText(el.querySelector(".user-identity-name") || el) || u;
                const prev = merged.get(nk);
                if (prev) {
                    if (isOnline) prev.online = !0;
                    if (dn && dn !== u) prev.displayName = dn;
                } else {
                    merged.set(nk, { username: u, displayName: dn, online: isOnline, fromFollow: !1 });
                }
            });
        };
        collectDOM("#sidebar-users-container .user-identity", !0);
        collectDOM("#messages-container .user-identity", !1);

        return Array.from(merged.values()).sort((a, b) => {
            if (a.fromFollow !== b.fromFollow) return a.fromFollow ? -1 : 1;
            if (a.online !== b.online) return a.online ? -1 : 1;
            return a.displayName.localeCompare(b.displayName, "ar");
        });
    }

    // ==================== تحديث شارات البروفايل ونافذة المتابعة وشريط الآدمن ====================
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
        const cached = getCachedPrivacy(owner.keyLower);
        if (cached) {
            applyProfileBadges(owner, cached);
            setTimeout(() => { if (seq === profileSyncSeq) applyProfileBadges(owner, cached); }, 350);
            return;
        }

        fetchPrivacy(owner).then(data => {
            if (seq !== profileSyncSeq) return;
            applyProfileBadges(owner, data);
            setTimeout(() => { if (seq === profileSyncSeq) applyProfileBadges(owner, data); }, 350);
        });
    }

    function renderAdminBar(modal, owner, data) {
        const existing = document.getElementById("lfp-admin-bar");
        if (!modal || !owner || isSelfOwner(owner) || !isAdmin() || !isAnyRestricted(data)) {
            if (existing) existing.remove();
            return;
        }

        const activeTab = state.modalActiveTab;
        const activeLabel = "following" === activeTab ? "يتابع" : "المتابعون";
        const activeMode = data[activeTab]?.mode || "all";
        const otherTab = "following" === activeTab ? "followers" : "following";
        const otherLabel = "following" === otherTab ? "يتابع" : "المتابعون";
        const otherMode = data[otherTab]?.mode || "all";

        const summary = "all" !== activeMode
            ? `«${activeLabel}» مقيدة (${MODE_META[activeMode]?.label || ""}) — مفتوحة لك بصلاحية الإدارة`
            : `العضو قيّد قائمة «${otherLabel}» (${MODE_META[otherMode]?.label || ""}) — مفتوحة لك بصلاحية الإدارة`;

        let bar = existing;
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "lfp-admin-bar";
            const modalBody = modal.querySelector(".modal-body");
            if (modalBody && modalBody.parentNode) modalBody.parentNode.insertBefore(bar, modalBody);
            else return;
        }
        bar.innerHTML = `
            <span class="lfp-admin-bar-txt"><i class="fas fa-shield-alt"></i><span>${esc(summary)}</span></span>
            <button type="button" class="lfp-admin-bar-btn" id="lfp-admin-inspect-btn"><i class="fas fa-sliders-h"></i> تفاصيل وإدارة</button>`;
        bar.querySelector("#lfp-admin-inspect-btn").onclick = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            openAdminInspectModal(owner);
        };
    }

    function syncFollowModalUI() {
        const owner = state.modalOwner;
        const modal = document.getElementById("followListModal");
        if (!modal || !owner) return;
        injectStyles();

        const hdr = modal.querySelector(".modal-header");
        let quickBtn = document.getElementById("lfp-follow-modal-btn");
        if (hdr && isSelfOwner(owner) && !isGuestMe()) {
            if (!quickBtn) {
                quickBtn = document.createElement("button");
                quickBtn.type = "button";
                quickBtn.id = "lfp-follow-modal-btn";
                quickBtn.innerHTML = '<i class="fas fa-lock"></i><span>الخصوصية</span><span class="lfp-active-dot"></span>';
                quickBtn.onclick = ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    scrapeFollowListUsers();
                    openSettingsModal(owner, state.modalActiveTab);
                };
                const closeBtn = hdr.querySelector(".btn-close-classic");
                if (closeBtn) closeBtn.insertAdjacentElement("beforebegin", quickBtn);
                else hdr.appendChild(quickBtn);
            }
            setTimeout(scrapeFollowListUsers, 450);
        } else if (quickBtn) {
            quickBtn.remove();
        }

        fetchPrivacy(owner).then(data => {
            if (state.modalOwner?.keyLower !== owner.keyLower) return;

            if (quickBtn) {
                const active = isAnyRestricted(data);
                quickBtn.classList.toggle("lfp-privacy-active", active);
                quickBtn.title = active ? "الخصوصية مفعّلة — اضغط للتعديل" : "إعدادات خصوصية المتابعة";
            }

            renderAdminBar(modal, owner, data);

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
    function blockedToastMsg(listType, data) {
        const custom = data?.customMsg?.trim();
        if (custom) return `🔒 ${custom}`;
        return "following" === listType
            ? "🔒 قائمة «يتابع» خاصة بهذا العضو"
            : "🔒 قائمة «المتابعون» خاصة بهذا العضو";
    }

    function wrapSwitchFollowTab() {
        if ("function" !== typeof window.switchFollowModalTab || window.switchFollowModalTab.__lfpWrapped) return;
        const orig = window.switchFollowModalTab;
        const wrapped = function (tabName, ...rest) {
            const owner = state.modalOwner;
            const t = "following" === tabName ? "following" : "followers";
            if (owner && !isSelfOwner(owner) && !isAdmin()) {
                const cached = getCachedPrivacy(owner.keyLower);
                if (cached && !canViewList(owner, t, cached, state.modalOwnerFriend)) {
                    logBlockedAttempt(owner, t, cached);
                    showToast(blockedToastMsg(t, cached), !0);
                    return;
                }
            }
            state.modalActiveTab = t;
            const res = orig.call(this, tabName, ...rest);
            setTimeout(() => {
                scrapeFollowListUsers();
                syncFollowModalUI();
            }, 90);
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
                state.modalActiveTab = listType;
                if (isProfileBtn) {
                    if (isSelfOwner(owner) && state.modalOwner?.keyLower !== owner.keyLower) state.scrapedFollowUsers.clear();
                    state.modalOwner = owner;
                    state.modalOwnerFriend = friendNow;
                    wrapSwitchFollowTab();
                    setTimeout(syncFollowModalUI, 120);
                }
                return;
            }

            const cached = getCachedPrivacy(owner.keyLower);
            if (cached) {
                if (!canViewList(owner, listType, cached, friendNow)) {
                    blockEvent(ev);
                    logBlockedAttempt(owner, listType, cached);
                    showToast(blockedToastMsg(listType, cached), !0);
                    return;
                }
                state.modalActiveTab = listType;
                if (isProfileBtn) {
                    state.modalOwner = owner;
                    state.modalOwnerFriend = friendNow;
                    wrapSwitchFollowTab();
                    setTimeout(syncFollowModalUI, 120);
                }
                return;
            }

            blockEvent(ev);
            fetchPrivacy(owner).then(data => {
                applyProfileBadges(owner, data);
                if (!canViewList(owner, listType, data, friendNow)) {
                    logBlockedAttempt(owner, listType, data);
                    showToast(blockedToastMsg(listType, data), !0);
                    return;
                }
                state.modalActiveTab = listType;
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

        document.addEventListener("focusin", ev => {
            if (ev.target?.closest?.("#lfp-modal, #lfp-admin-modal")) ev.stopImmediatePropagation();
        }, !0);

        document.addEventListener("keydown", ev => {
            if ("Escape" !== ev.key) return;
            const adm = document.getElementById("lfp-admin-modal");
            if (adm) { ev.preventDefault(); ev.stopImmediatePropagation(); adm.remove(); return; }
            const mod = document.getElementById("lfp-modal");
            if (mod) { ev.preventDefault(); ev.stopImmediatePropagation(); mod.remove(); }
        }, !0);
    }

    // ==================== نافذة إعدادات خصوصية المتابعة لصاحب الملف ====================
    function closeSettingsModal() {
        state.selectableUsers = null;
        document.getElementById("lfp-modal")?.remove();
    }

    function openSettingsModal(owner, initialTab = "followers") {
        if (!owner || !isSelfOwner(owner)) return;
        injectStyles();
        closeSettingsModal();

        const startTab = "following" === initialTab ? "following" : "followers";
        state.draftTab = startTab;
        state.attemptsList = null;
        state.attemptsLoading = !1;

        const ov = document.createElement("div");
        ov.id = "lfp-modal";
        ov.className = "lfp-overlay";
        ov.innerHTML = `
            <div class="lfp-card">
                <div class="lfp-head">
                    <div class="lfp-title"><i class="fas fa-user-lock"></i> خصوصية قوائم المتابعة</div>
                    <button type="button" class="lfp-close" id="lfp-close-btn" title="إغلاق"><i class="fas fa-times"></i></button>
                </div>
                <div class="lfp-tabs">
                    <button type="button" class="lfp-tab ${"followers" === startTab ? "active" : ""}" data-ltab="followers">
                        <span><i class="fas fa-user-friends"></i> المتابعون</span>
                        <span class="lfp-tab-dot" id="lfp-dot-followers">...</span>
                    </button>
                    <button type="button" class="lfp-tab ${"following" === startTab ? "active" : ""}" data-ltab="following">
                        <span><i class="fas fa-user-check"></i> يتابع</span>
                        <span class="lfp-tab-dot" id="lfp-dot-following">...</span>
                    </button>
                    <button type="button" class="lfp-tab" data-ltab="more">
                        <span><i class="fas fa-history"></i> السجل والرسالة</span>
                        <span class="lfp-tab-dot" id="lfp-dot-more">خيارات</span>
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
                if ("more" === state.draftTab && null === state.attemptsList && !state.attemptsLoading) {
                    state.attemptsLoading = !0;
                    renderSettingsBody(owner);
                    fetchAttempts(owner.keyLower).then(list => {
                        state.attemptsList = list;
                        state.attemptsLoading = !1;
                        updateTabDots();
                        if ("more" === state.draftTab) renderSettingsBody(owner);
                    });
                } else {
                    renderSettingsBody(owner);
                }
            };
        });

        ov.querySelector("#lfp-save-btn").onclick = () => {
            if (!state.draft) return;
            const saveBtn = ov.querySelector("#lfp-save-btn");
            saveBtn.disabled = !0;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            savePrivacy(owner, state.draft).then(saved => {
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

        fetchPrivacy(owner, !0).then(data => {
            state.draft = JSON.parse(JSON.stringify(data));
            updateTabDots();
            renderSettingsBody(owner);
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
        const moreEl = document.getElementById("lfp-dot-more");
        if (moreEl) {
            if (Array.isArray(state.attemptsList)) moreEl.textContent = `${state.attemptsList.length} محاولة`;
            else moreEl.textContent = !1 === state.draft.logAttempts ? "متوقف" : "مفعّل";
        }
    }

    function renderMoreTab(body, owner) {
        const msgVal = state.draft.customMsg || "";
        const logOn = !1 !== state.draft.logAttempts;

        let attemptsHtml = "";
        if (state.attemptsLoading) {
            attemptsHtml = '<div style="text-align:center;padding:18px;color:#D4AF37;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل السجل...</div>';
        } else if (!state.attemptsList || !state.attemptsList.length) {
            attemptsHtml = '<div style="text-align:center;padding:18px 8px;color:#94a3b8;font-size:12px;">لا توجد محاولات فتح مسجلة حالياً</div>';
        } else {
            attemptsHtml = state.attemptsList.map(it => {
                const isFol = "followers" === it.listType;
                const handle = it.username ? `<span style="opacity:.65;font-size:10.5px;direction:ltr;margin-inline-start:5px;">@${esc(it.username)}</span>` : "";
                return `
                    <div class="lfp-attempt-row">
                        <div style="min-width:0;flex:1;">
                            <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                <b style="color:#fff;">${esc(it.displayName || it.username || "زائر")}</b>${handle}
                            </div>
                            <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${esc(timeAgo(it.ts))}</div>
                        </div>
                        <span class="lfp-tag ${isFol ? "lfp-tag-fol" : "lfp-tag-ing"}">${isFol ? "المتابعون" : "يتابع"}</span>
                    </div>`;
            }).join("");
        }

        body.innerHTML = `
            <div class="lfp-section">
                <div class="lfp-sec-title">
                    <span><i class="fas fa-comment-alt"></i> رسالة القفل المخصصة</span>
                    <span id="lfp-msg-cnt" style="font-size:10.5px;color:#94a3b8;">${msgVal.length}/50</span>
                </div>
                <input type="text" id="lfp-custom-msg" class="lfp-search" maxlength="50" value="${esc(msgVal)}" placeholder="مثال: القائمة للمقربين فقط ✨ (اتركها فارغة للافتراضي)" autocomplete="off">
                <div style="font-size:10.5px;color:#94a3b8;margin-top:5px;">تظهر هذه الجملة للزائر عند محاولة فتح قائمة مقفلة لديك.</div>
            </div>

            <div class="lfp-section">
                <div class="lfp-sec-title" style="margin-bottom:8px;">
                    <div>
                        <div><i class="fas fa-user-secret"></i> من حاول فتح قائمتك؟</div>
                        <div style="font-size:10.5px;color:#94a3b8;font-weight:600;margin-top:2px;">يحفظ آخر ${MAX_ATTEMPTS} محاولة فتح مرفوضة تلقائياً</div>
                    </div>
                    <label class="lfp-switch">
                        <input type="checkbox" id="lfp-log-toggle" ${logOn ? "checked" : ""}>
                        <span class="lfp-slider"></span>
                    </label>
                </div>
                ${state.attemptsList?.length ? `<div style="display:flex;justify-content:flex-end;margin-bottom:7px;"><button type="button" class="lfp-danger-sm" id="lfp-clear-attempts"><i class="fas fa-trash-alt"></i> مسح السجل</button></div>` : ""}
                <div id="lfp-attempts-box">${attemptsHtml}</div>
            </div>`;

        const msgInp = body.querySelector("#lfp-custom-msg");
        const msgCnt = body.querySelector("#lfp-msg-cnt");
        if (msgInp) {
            msgInp.oninput = () => {
                state.draft.customMsg = msgInp.value.slice(0, 50);
                if (msgCnt) msgCnt.textContent = `${state.draft.customMsg.length}/50`;
            };
        }

        const logToggle = body.querySelector("#lfp-log-toggle");
        if (logToggle) {
            logToggle.onchange = () => {
                state.draft.logAttempts = logToggle.checked;
                updateTabDots();
            };
        }

        const clearBtn = body.querySelector("#lfp-clear-attempts");
        if (clearBtn) {
            clearBtn.onclick = () => {
                clearBtn.disabled = !0;
                clearAttempts(owner.keyLower).then(() => {
                    state.attemptsList = [];
                    updateTabDots();
                    renderSettingsBody(owner);
                    showToast("🧹 تم مسح سجل المحاولات");
                }).catch(() => {
                    clearBtn.disabled = !1;
                    showToast("⚠️ تعذر مسح السجل", !0);
                });
            };
        }
    }

    function renderSettingsBody(owner) {
        const body = document.getElementById("lfp-body");
        if (!body || !state.draft) return;
        const tab = state.draftTab;
        if ("more" === tab) {
            renderMoreTab(body, owner);
            return;
        }

        const cfg = state.draft[tab];
        const otherTab = "followers" === tab ? "following" : "followers";
        const otherLabel = "followers" === otherTab ? "المتابعون" : "يتابع";
        const isExcept = "except" === cfg.mode;
        const isCustom = "custom" === cfg.mode;
        const mapField = isExcept ? "excluded" : "allowed";
        const otherMap = state.draft[otherTab]?.[mapField] || {};
        const otherCount = Object.keys(otherMap).length;

        let html = Object.entries(MODE_META).map(([mKey, meta]) => `
            <button type="button" class="lfp-opt ${cfg.mode === mKey ? "active" : ""}" data-mode="${mKey}">
                <div class="lfp-opt-ico"><i class="${meta.icon}"></i></div>
                <div class="lfp-opt-txt">
                    <div class="lfp-opt-lbl">${meta.label}</div>
                    <div class="lfp-opt-desc">${meta.desc}</div>
                </div>
                <div class="lfp-radio"></div>
            </button>`).join("");

        if (isCustom || isExcept) {
            cfg[mapField] || (cfg[mapField] = {});
            html += `
                <div class="lfp-custom-box ${isExcept ? "is-except" : ""}">
                    <div class="lfp-sub-hdr">
                        <span id="lfp-sub-title"></span>
                        ${otherCount > 0 ? `<button type="button" class="lfp-copy-btn" id="lfp-copy-other"><i class="fas fa-copy"></i> نسخ من «${otherLabel}» (${otherCount})</button>` : ""}
                    </div>
                    <div class="lfp-chips" id="lfp-chips-box"></div>
                    <input type="text" id="lfp-user-search" class="lfp-search" placeholder="🔍 ابحث في متابعيك والمتواجدين أو اكتب @اليوزر..." autocomplete="off">
                    <div id="lfp-pick-wrap"></div>
                </div>`;
        }

        body.innerHTML = html;

        body.querySelectorAll("[data-mode]").forEach(btn => {
            btn.onclick = () => {
                cfg.mode = btn.getAttribute("data-mode");
                updateTabDots();
                renderSettingsBody(owner);
            };
        });

        if (isCustom || isExcept) {
            const users = state.selectableUsers || (state.selectableUsers = getSelectableUsers());
            const searchInp = body.querySelector("#lfp-user-search");
            const subTitle = body.querySelector("#lfp-sub-title");
            const chipsBox = body.querySelector("#lfp-chips-box");
            const wrap = body.querySelector("#lfp-pick-wrap");
            const emptyHint = isExcept
                ? "لم تستثنِ أحداً بعد (القائمة مفتوحة للجميع حتى تختار شخصاً)"
                : "لم تختر أي شخص بعد (القائمة مغلقة حتى تضيف شخصاً)";

            const renderChips = () => {
                const targetMap = cfg[mapField] || (cfg[mapField] = {});
                const entries = Object.entries(targetMap);
                if (subTitle) {
                    subTitle.textContent = isExcept ? `المستثنون من الرؤية (${entries.length})` : `المسموح لهم (${entries.length})`;
                }
                if (!chipsBox) return;
                chipsBox.innerHTML = entries.length
                    ? entries.map(([k, v]) => `
                        <span class="lfp-chip ${isExcept ? "is-except" : ""}">
                            <span>${esc(v.displayName || v.username)}</span>
                            <span style="opacity:.65;font-size:10px;direction:ltr;">@${esc(v.username)}</span>
                            <button type="button" class="lfp-chip-x" data-rm="${esc(k)}" title="إزالة">×</button>
                        </span>`).join("")
                    : `<div style="font-size:11.5px;color:#94a3b8;padding:3px 2px;">${emptyHint}</div>`;

                chipsBox.querySelectorAll("[data-rm]").forEach(btn => {
                    btn.onclick = () => {
                        delete (cfg[mapField] || {})[btn.getAttribute("data-rm")];
                        renderChips();
                        renderPicker();
                    };
                });
            };

            const renderPicker = () => {
                if (!wrap || !searchInp) return;
                const prevScroll = wrap.querySelector(".lfp-pick-list")?.scrollTop || 0;
                const targetMap = cfg[mapField] || (cfg[mapField] = {});
                const rawQ = searchInp.value.trim();
                const q = rawQ.replace(/^@+/, "").toLowerCase();
                const filtered = users.filter(u =>
                    !q || u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
                ).slice(0, 40);

                const isPicked = uname => mapHasUser(targetMap, normKey(uname));

                let pHtml = "";
                if (filtered.length) {
                    pHtml += '<div class="lfp-pick-list">' + filtered.map(u => {
                        const picked = isPicked(u.username);
                        const cls = picked ? (isExcept ? "picked-except" : "picked") : "";
                        const ico = picked ? (isExcept ? "fa-ban" : "fa-check-circle") : "fa-plus-circle";
                        return `
                            <button type="button" class="lfp-pick-item ${cls}" data-pu="${esc(u.username)}" data-pd="${esc(u.displayName)}">
                                <span style="display:inline-flex;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                    <span class="lfp-u-dot ${u.online ? "on" : "off"}" title="${u.online ? "متصل" : "غير متصل"}"></span>
                                    <b>${esc(u.displayName)}</b>
                                    <span style="opacity:.6;font-size:10.5px;margin-inline-start:5px;direction:ltr;">@${esc(u.username)}</span>
                                </span>
                                <i class="fas ${ico}"></i>
                            </button>`;
                    }).join("") + "</div>";
                } else {
                    pHtml += '<div style="font-size:11px;color:#94a3b8;text-align:center;padding:8px 4px;">لا يوجد عضو مطابق في القائمة الحالية</div>';
                }

                const manualClean = rawQ.replace(/^@+/, "").trim();
                if (manualClean && !isPicked(manualClean)) {
                    pHtml += `<button type="button" class="lfp-manual-btn" id="lfp-add-manual"><i class="fas fa-user-plus"></i> ${isExcept ? "استثناء" : "إضافة"} المعرّف «@${esc(manualClean)}» يدوياً</button>`;
                }
                wrap.innerHTML = pHtml;

                const listEl = wrap.querySelector(".lfp-pick-list");
                if (listEl && prevScroll) listEl.scrollTop = prevScroll;

                wrap.querySelectorAll("[data-pu]").forEach(item => {
                    item.onclick = () => {
                        const u = item.getAttribute("data-pu");
                        const d = item.getAttribute("data-pd") || u;
                        const nk = normKey(u);
                        if (!nk) return;
                        const existingKey = Object.keys(targetMap).find(k => normKey(k) === nk || normKey(targetMap[k]?.username) === nk);
                        if (existingKey) delete targetMap[existingKey];
                        else targetMap[nk] = { username: u, displayName: d };
                        renderChips();
                        renderPicker();
                    };
                });

                const mBtn = wrap.querySelector("#lfp-add-manual");
                if (mBtn) {
                    mBtn.onclick = () => {
                        const nk = normKey(manualClean);
                        if (!nk) return;
                        targetMap[nk] = { username: manualClean, displayName: manualClean };
                        searchInp.value = "";
                        renderChips();
                        renderPicker();
                    };
                }
            };

            const copyBtn = body.querySelector("#lfp-copy-other");
            if (copyBtn) {
                copyBtn.onclick = () => {
                    cfg[mapField] = JSON.parse(JSON.stringify(otherMap));
                    renderChips();
                    renderPicker();
                    showToast("✅ تم نسخ القائمة بنجاح");
                };
            }

            if (searchInp) searchInp.oninput = renderPicker;
            renderChips();
            renderPicker();
        }
    }

    // ==================== نافذة المعاينة والإدارة السريعة للآدمن ====================
    function openAdminInspectModal(owner) {
        if (!owner || !isAdmin()) return;
        injectStyles();
        document.getElementById("lfp-admin-modal")?.remove();

        const ov = document.createElement("div");
        ov.id = "lfp-admin-modal";
        ov.className = "lfp-overlay";
        ov.innerHTML = `
            <div class="lfp-card">
                <div class="lfp-head">
                    <div class="lfp-title"><i class="fas fa-shield-alt" style="color:#a78bfa;"></i> إدارة خصوصية: ${esc(owner.displayName)}</div>
                    <button type="button" class="lfp-close" id="lfp-adm-close" title="إغلاق"><i class="fas fa-times"></i></button>
                </div>
                <div class="lfp-body" id="lfp-adm-body">
                    <div style="text-align:center;padding:28px;color:#a78bfa;"><i class="fas fa-spinner fa-spin fa-lg"></i></div>
                </div>
                <div class="lfp-foot">
                    <button type="button" class="lfp-reset-btn" id="lfp-adm-reset"><i class="fas fa-unlock"></i> إعادة ضبط للوضع العام (الكل)</button>
                    <button type="button" class="lfp-cancel" id="lfp-adm-cancel">إغلاق</button>
                </div>
            </div>`;
        document.body.appendChild(ov);

        const closeAdm = () => ov.remove();
        ov.addEventListener("click", ev => { if (ev.target === ov) closeAdm(); });
        ov.querySelector("#lfp-adm-close").onclick = closeAdm;
        ov.querySelector("#lfp-adm-cancel").onclick = closeAdm;

        const renderSection = (title, cfg) => {
            const m = cfg?.mode || "all";
            const meta = MODE_META[m] || MODE_META.all;
            const isEx = "except" === m;
            const isCu = "custom" === m;
            const listObj = isEx ? cfg.excluded : isCu ? cfg.allowed : null;
            const entries = listObj ? Object.values(listObj) : [];
            const chips = (isEx || isCu)
                ? `<div class="lfp-chips" style="margin-top:7px;margin-bottom:0;">${
                    entries.length
                        ? entries.map(v => `<span class="lfp-chip ${isEx ? "is-except" : ""}"><span>${esc(v.displayName || v.username)}</span><span style="opacity:.65;font-size:10px;direction:ltr;">@${esc(v.username)}</span></span>`).join("")
                        : '<span style="font-size:11px;color:#94a3b8;">القائمة فارغة</span>'
                }</div>`
                : "";
            return `
                <div class="lfp-section">
                    <div class="lfp-sec-title" style="margin-bottom:2px;">
                        <span>${title}</span>
                        <span class="lfp-tag ${"all" === m ? "lfp-tag-ing" : "lfp-tag-fol"}"><i class="${meta.icon}"></i> ${meta.label}</span>
                    </div>
                    ${chips}
                </div>`;
        };

        fetchPrivacy(owner, !0).then(data => {
            const body = ov.querySelector("#lfp-adm-body");
            if (!body) return;
            const msgBlock = data.customMsg
                ? `<div class="lfp-section"><div class="lfp-sec-title" style="margin-bottom:4px;">رسالة القفل المخصصة</div><div style="font-size:12px;color:#e2e8f0;">«${esc(data.customMsg)}»</div></div>`
                : "";
            body.innerHTML = `
                <div style="font-size:11.5px;color:#94a3b8;margin-bottom:10px;">المعرّف: <b style="color:#fff;direction:ltr;display:inline-block;">@${esc(owner.username)}</b> • سجل المحاولات: <b style="color:${!1 === data.logAttempts ? "#f87171" : "#34d399"};">${!1 === data.logAttempts ? "متوقف" : "مفعّل"}</b></div>
                ${renderSection("قائمة المتابعون", data.followers)}
                ${renderSection("قائمة يتابع", data.following)}
                ${msgBlock}`;

            const resetBtn = ov.querySelector("#lfp-adm-reset");
            resetBtn.onclick = () => {
                if (!confirm(`إعادة ضبط خصوصية المتابعة للعضو (${owner.displayName}) إلى «الكل»؟`)) return;
                resetBtn.disabled = !0;
                resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الضبط...';
                const pub = defaultPrivacy();
                pub.logAttempts = data.logAttempts;
                savePrivacy(owner, pub).then(saved => {
                    applyProfileBadges(owner, saved);
                    syncFollowModalUI();
                    closeAdm();
                    showToast(`✅ تم إعادة ضبط خصوصية (${owner.displayName}) للوضع العام`);
                }).catch(() => {
                    resetBtn.disabled = !1;
                    resetBtn.innerHTML = '<i class="fas fa-unlock"></i> إعادة ضبط للوضع العام (الكل)';
                    showToast("⚠️ تعذر التنفيذ — تحقق من صلاحيات Firebase", !0);
                });
            };
        });
    }

    // ==================== مراقب خفيف جداً على نافذتي البروفايل والمتابعة فقط ====================
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
            const keyLower = normKey(state.myUsername);
            if (!keyLower) return showToast("⚠️ هذه الميزة للأعضاء المسجلين فقط", !0);
            openSettingsModal({
                username: state.myUsername,
                key,
                keyLower,
                userId: state.myUserId,
                displayName: state.myDisplayName || state.myUsername
            }, "followers");
        }
    };

    bindLoginCapture();
    bindClickInterceptor();
    attachModalObservers();
    bootFirebase();
}();
