!function () {
    "use strict";
    if (window.laylRoyalContestLoaded) return;
    window.laylRoyalContestLoaded = !0;

    const FB_CFG = {
        apiKey: "AIzaSyC9fdv0xFDVRfUMgBEoI2WVeVi9U5BF3_8",
        authDomain: "layl-codenames.firebaseapp.com",
        projectId: "layl-codenames",
        storageBucket: "layl-codenames.firebasestorage.app",
        messagingSenderId: "651006164506",
        appId: "1:651006164506:web:1541818c0e5a6077415ba3"
    };

    const ROOT = "layl_royal_contest";

    const DEFAULT_PRIZES = [
        { icon: "fa-medal", title: "وسام «ملك / ملكة الشات»", dur: "لمدة أسبوع" },
        { icon: "fa-scroll", title: "بنر اسم خاص ومميز", dur: "دائم ♾️" },
        { icon: "fa-hashtag", title: "رقم عضوية مميز (من اختيار الفائز)", dur: "لمدة أسبوع" },
        { icon: "fa-crown", title: "ترقية ملك / ملكة الشات (أعلى نك في قائمة المتواجدون)", dur: "لمدة أسبوع" },
        { icon: "fa-id-card", title: "تصميم ملكي خاص لبروفايل العضوية", dur: "لمدة أسبوع" },
        { icon: "fa-comment-dots", title: "تصميم مميز لرسائل الشات العام", dur: "لمدة أسبوع" }
    ];

    const DEFAULT_RULES = "• يحق لكل عضو الترشيح مرة واحدة في الموسم.\n• التصويت حق لكل عضو مسجل مرة واحدة فقط.\n• يُمنع التلاعب أو استخدام حسابات وهمية ويؤدي للاستبعاد الفوري.\n• في حال تعادل المركز الأول تحسم الإدارة النتيجة بالصوت الحاسم.";

    const DEFAULT_SETTINGS = {
        enabled: !0,
        disabledMsg: "مسابقة ملك وملكة الشات متوقفة مؤقتاً للصيانة 👑",
        allowGuestsVote: !1,
        allowSelfVote: !1,
        allowVoteChange: !1,
        requireApproval: !1,
        hideLiveVotes: !1,
        showToastAd: !0,
        maxCandidates: 0,
        vipVoteWeight: 2,
        bannerText: "",
        bannerTheme: "gold",
        welcomeText: "",
        welcomeVersion: 0,
        rulesText: DEFAULT_RULES,
        vipUsers: [],
        subAdmins: []
    };

    const st = {
        db: null,
        admins: [],
        myUser: null,
        myUid: null,
        myHtml: null,
        myAvatar: "",
        state: null,
        settings: Object.assign({}, DEFAULT_SETTINGS),
        prizes: DEFAULT_PRIZES.slice(),
        candidates: {},
        votes: {},
        banned: {},
        hof: {},
        presence: {},
        logs: [],
        presenceRef: null,
        myPresenceRef: null,
        logsRef: null,
        cmdRef: null,
        cmdUser: null,
        uiBuilt: !1,
        adminTab: "control",
        voteFilter: "all",
        voteSearch: "",
        lastPhaseAnnounced: null,
        bootTs: Date.now(),
        timerId: null,
        toastTimer: null,
        adTimer: null,
        fbTries: 0,
        confettiFiredKey: null
    };

    try {
        st.myUser = localStorage.getItem("pc_username") || null;
        st.myUid = localStorage.getItem("pc_userid") || null;
        st.myHtml = localStorage.getItem("pc_userhtml") || null;
    } catch (e) {}

    // حقن تنسيق زر القائمة فوراً (توهج ذهبي + تثبيت بأعلى القائمة)
    if (!document.getElementById("lrc-menu-btn-style")) {
        const ms = document.createElement("style");
        ms.id = "lrc-menu-btn-style";
        ms.textContent = `
        #btn-layl-royal-contest{
            grid-row:1!important;
            grid-column:-2 / -1!important;
        }
        #btn-layl-royal-contest .modern-classic-icon-wrapper{
            position:relative!important;
            overflow:visible!important;
            border:1.5px solid rgba(212,175,55,.85)!important;
            box-shadow:0 0 14px rgba(212,175,55,.55),0 0 24px rgba(251,191,36,.28)!important;
        }
        #btn-layl-royal-contest .modern-classic-icon-wrapper::before{
            content:"";
            position:absolute;
            inset:-3px;
            border-radius:inherit;
            border:2px solid rgba(251,191,36,.92);
            box-shadow:0 0 16px rgba(212,175,55,.75),inset 0 0 8px rgba(251,191,36,.3);
            opacity:.3;
            pointer-events:none;
            animation:lrcGoldPulse 2.4s ease-in-out infinite;
            will-change:opacity;
        }
        @keyframes lrcGoldPulse{0%,100%{opacity:.25}50%{opacity:1}}
        `;
        (document.head || document.documentElement).appendChild(ms);
    }

    const h = {
        san: x => x ? String(x).replace(/[.#$\[\]\/]/g, "_").trim() : "",
        esc: x => String(x || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])),
        sanHtml(html) {
            const t = document.createElement("template");
            t.innerHTML = String(html || "");
            t.content.querySelectorAll("script,style,iframe,object,embed,svg,form,input,link,meta").forEach(n => n.remove());
            t.content.querySelectorAll("*").forEach(el => {
                Array.from(el.attributes).forEach(a => {
                    const n = a.name.toLowerCase(), v = a.value.trim().toLowerCase();
                    if (n.startsWith("on") || v.startsWith("javascript:")) el.removeAttribute(a.name);
                });
            });
            return t.innerHTML;
        },
        isGuest: () => { try { return !localStorage.getItem("pc_username"); } catch (e) { return !0; } },
        isSuperAdmin() {
            const u = st.myUser;
            if (!u || !st.admins.length) return !1;
            const s = h.san(u);
            return st.admins.includes(u) || (s && st.admins.includes(s));
        },
        isSubAdmin() {
            const list = st.settings.subAdmins;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUser || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        isAdmin() { return h.isSuperAdmin() || h.isSubAdmin(); },
        isVip() {
            const list = st.settings.vipUsers;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUser || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        myKey() { return h.san(st.myUser || st.myUid || ""); },
        getMyBan() {
            const k = h.myKey(), b = (k && st.banned && st.banned[k]) ? st.banned[k] : null;
            if (!b) return null;
            if (b.expiresAt && Date.now() >= b.expiresAt) return null;
            return b;
        },
        fmtTime(ms) {
            if (ms < 0) ms = 0;
            const sec = Math.floor(ms / 1000);
            const d = Math.floor(sec / 86400);
            const hr = Math.floor((sec % 86400) / 3600);
            const mn = Math.floor((sec % 3600) / 60);
            const sc = sec % 60;
            return (d > 0 ? `${d} يوم و ` : "") + `${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}:${String(sc).padStart(2, "0")}`;
        },
        fmtRem(exp) {
            if (!exp) return "دائم";
            const diff = exp - Date.now();
            if (diff <= 0) return "منتهي";
            const mins = Math.ceil(diff / 6e4);
            if (mins < 60) return `${mins} د`;
            const hrs = Math.floor(mins / 60);
            return hrs < 24 ? `${hrs} س` : `${Math.floor(hrs / 24)} يوم`;
        },
        fmtDate(ts) {
            if (!ts) return "-";
            try { return new Date(ts).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return "-"; }
        },
        copy(text, msg) {
            const ok = () => showToast(msg || "📋 تم النسخ بنجاح!", 3000, "gold");
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy(text, ok));
            } else fallbackCopy(text, ok);
        },
        detectFromDOM(username) {
            if (!username) return null;
            try {
                const items = document.querySelectorAll("[data-username]");
                for (const el of items) {
                    const u = el.getAttribute("data-username");
                    if (u && u.trim() === username.trim()) {
                        const row = el.closest(".list-group-item, .message-row, .user-pro-item") || el;
                        const uid = row.getAttribute("data-user-id") || el.getAttribute("data-user-id") || st.myUid || "";
                        const idEl = row.querySelector(".user-identity") || row.querySelector(".user-identity-name");
                        const imgEl = row.querySelector("img.message-avatar, img.user-avatar, img");
                        const avatar = imgEl && imgEl.src && /^https?:\/\//i.test(imgEl.src) ? imgEl.src : "";
                        let cleanName = username.trim();
                        if (idEl) {
                            const cl = idEl.cloneNode(!0);
                            cl.querySelectorAll("img,i,svg,.user-identity-badge-icon,.user-identity-super").forEach(x => x.remove());
                            const t = cl.textContent.trim();
                            if (t) cleanName = t;
                        }
                        return { uid, username: username.trim(), displayName: cleanName, html: idEl ? h.sanHtml(idEl.outerHTML) : h.esc(cleanName), avatar };
                    }
                }
            } catch (e) {}
            return null;
        },
        fireConfetti() {
            const run = () => {
                if (!window.confetti) return;
                window.confetti({ particleCount: window.innerWidth < 600 ? 55 : 110, spread: 80, origin: { y: 0.6 }, colors: ["#D4AF37", "#fbbf24", "#ffffff", "#ef4444", "#a855f7"], zIndex: 2147483647 });
            };
            if (window.confetti) return run();
            const sc = document.createElement("script");
            sc.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
            sc.onload = run;
            document.head.appendChild(sc);
        }
    };

    function fallbackCopy(text, ok) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { if (document.execCommand("copy") && ok) ok(); } catch (e) {}
        ta.remove();
    }

    function pinContestBtnIfBlock() {
        const btn = document.getElementById("btn-layl-royal-contest");
        if (!btn || !btn.parentElement) return;
        const list = btn.parentElement;
        const disp = window.getComputedStyle(list).display || "";
        if (disp.includes("grid")) return;
        const visible = Array.from(list.children).filter(el =>
            el.tagName === "BUTTON" && el !== btn && window.getComputedStyle(el).display !== "none"
        );
        if (!visible.length) return;
        const firstTop = visible[0].offsetTop;
        let firstRowCount = 0;
        for (let i = 0; i < visible.length; i++) {
            if (Math.abs(visible[i].offsetTop - firstTop) < 12) firstRowCount++;
            else break;
        }
        if (visible.length > firstRowCount) {
            const refNode = visible[Math.max(0, firstRowCount - 1)];
            if (refNode && btn.nextElementSibling !== refNode) list.insertBefore(btn, refNode);
        } else if (list.lastElementChild !== btn) {
            list.appendChild(btn);
        }
    }

    function computeVoteCounts() {
        const counts = {};
        Object.keys(st.candidates || {}).forEach(k => {
            const c = st.candidates[k];
            if (c) counts[k] = Number(c.bonusVotes) || 0;
        });
        Object.values(st.votes || {}).forEach(v => {
            if (v && v.target && void 0 !== counts[v.target]) counts[v.target] += Math.max(1, Number(v.weight) || 1);
        });
        return counts;
    }

    function getApprovedCandidates(roleFilter = null) {
        return Object.entries(st.candidates || {})
            .filter(([, c]) => c && "pending" !== c.status && (!roleFilter || c.role === roleFilter))
            .map(([k, c]) => Object.assign({ key: k }, c));
    }

    function getTiedLeaders(counts, role = null) {
        const list = getApprovedCandidates(role);
        if (!list.length) return [];
        let max = -1;
        list.forEach(c => { const v = counts[c.key] || 0; if (v > max) max = v; });
        if (max <= 0) return [];
        return list.filter(c => (counts[c.key] || 0) === max);
    }

    function getPhaseInfo() {
        const s = st.state;
        if (!s || "idle" === s.status || "cleared" === s.status) return { phase: "idle", remaining: 0 };
        if (s.paused) return { phase: s.pausedPhase || "nomination", remaining: s.remainingMs || 0, paused: !0 };
        const now = Date.now();
        if (now < s.nomEnd) return { phase: "nomination", remaining: s.nomEnd - now, paused: !1 };
        if (now < s.voteEnd) return { phase: "voting", remaining: s.voteEnd - now, paused: !1 };
        const counts = computeVoteCounts();
        if ("dual" === s.mode) {
            const kTies = getTiedLeaders(counts, "king");
            const qTies = getTiedLeaders(counts, "queen");
            const kNeed = kTies.length > 1 && !s.tieBreakerKing;
            const qNeed = qTies.length > 1 && !s.tieBreakerQueen;
            if (kNeed || qNeed) return { phase: "tiebreaker", remaining: 0, kTies: kNeed ? kTies : [], qTies: qNeed ? qTies : [] };
        } else {
            const ties = getTiedLeaders(counts, null);
            if (ties.length > 1 && !s.tieBreaker) return { phase: "tiebreaker", remaining: 0, ties };
        }
        return { phase: "results", remaining: 0, paused: !1 };
    }

    function setPresence(statusTxt) {
        if (!st.db) return;
        const k = h.myKey();
        if (!k) return;
        if (!statusTxt) {
            if (st.myPresenceRef) { st.myPresenceRef.remove().catch(() => {}); st.myPresenceRef = null; }
            return;
        }
        const ref = st.db.ref(`${ROOT}/presence/${k}`);
        st.myPresenceRef = ref;
        ref.onDisconnect().remove();
        ref.set({ name: st.myUser || k, status: statusTxt, ts: Date.now() }).catch(() => {});
    }

    function showToast(msg, ms = 3800, theme = "") {
        ensureBaseStyles();
        let el = document.getElementById("lrc-toast");
        if (!el) {
            document.body.insertAdjacentHTML("beforeend", '<div id="lrc-toast" class="lrc-toast"></div>');
            el = document.getElementById("lrc-toast");
        }
        clearTimeout(st.toastTimer);
        el.className = "lrc-toast" + ("gold" === theme ? " th-gold" : "red" === theme ? " th-red" : "");
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add("show"));
        st.toastTimer = setTimeout(() => el.classList.remove("show"), ms);
    }

function showBannerToastAd(msg, theme = "gold") {
        if (!1 === st.settings.showToastAd) return;
        ensureBaseStyles();
        let ad = document.getElementById("lrc-live-ad");
        if (!ad) {
            ad = document.createElement("div");
            ad.id = "lrc-live-ad";
            ad.innerHTML = `<div class="lrc-ad-ico"><i class="fas fa-crown"></i></div><div id="lrc-ad-msg"></div><div class="lrc-ad-btns"><button type="button" class="lrc-ad-go" id="lrc-ad-join">دخول</button><button type="button" class="lrc-ad-x" id="lrc-ad-hide" title="إغلاق"><i class="fas fa-times"></i></button></div>`;
            document.body.appendChild(ad);
            document.getElementById("lrc-ad-join").onclick = () => { ad.classList.remove("show"); window.LaylRoyalContest.open(); };
            document.getElementById("lrc-ad-hide").onclick = () => ad.classList.remove("show");
        }
        ad.className = "th-" + (theme || "gold");
        document.getElementById("lrc-ad-msg").textContent = msg;
        clearTimeout(st.adTimer);
        requestAnimationFrame(() => ad.classList.add("show"));
        st.adTimer = setTimeout(() => ad.classList.remove("show"), 12000);
    }

    let phaseWaitId = null;
    function announcePhase(ph) {
        if (!ph || "idle" === ph) {
            st.lastPhaseAnnounced = null;
            clearInterval(phaseWaitId);
            phaseWaitId = null;
            return;
        }
        if (st.lastPhaseAnnounced === ph) return;
        st.lastPhaseAnnounced = ph;
        clearInterval(phaseWaitId);

        const fire = () => {
            if (!1 === st.settings.showToastAd) return;
            if (!h.isAdmin() && !h.isVip() && !1 === st.settings.enabled) return;
            if (document.getElementById("lrc-modal")?.classList.contains("open")) return;
            const cur = getPhaseInfo().phase;
            st.lastPhaseAnnounced = cur;
            if ("nomination" === cur) showBannerToastAd("👑 بدأ الترشيح لملك وملكة الشات! رشّح نفسك الآن.", "gold");
            else if ("voting" === cur) showBannerToastAd("🗳️ بدأ التصويت لملك وملكة الشات! ادخل وصوّت للأفضل.", "gold");
            else if ("tiebreaker" === cur) showBannerToastAd("⚖️ تعادل بالصدارة! بانتظار قرار الإدارة الحاسم.", "red");
            else if ("results" === cur) showBannerToastAd("🏆 ظهرت نتائج ملك/ملكة الشات! ادخل للتهنئة.", "gold");
        };

        const isChatReady = () => {
            const mc = document.getElementById("messages-container");
            const lo = document.getElementById("login-overlay");
            return Boolean(mc && null !== mc.offsetParent && (!lo || lo.classList.contains("d-none") || "none" === window.getComputedStyle(lo).display));
        };

        if (isChatReady()) {
            setTimeout(fire, 1500);
            return;
        }

        let tries = 0;
        phaseWaitId = setInterval(() => {
            if (isChatReady()) {
                clearInterval(phaseWaitId);
                phaseWaitId = null;
                setTimeout(fire, 1500);
            } else if (++tries >= 180) {
                clearInterval(phaseWaitId);
                phaseWaitId = null;
            }
        }, 800);
    }

    function ensureBaseStyles() {
        if (document.getElementById("lrc-styles")) return;
        const s = document.createElement("style");
        s.id = "lrc-styles";
        s.textContent = `
        .lrc-ov{position:fixed;inset:0;background:rgba(6,8,15,.94);z-index:2147483642;display:none;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);direction:rtl;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;padding:12px;box-sizing:border-box}
        .lrc-ov.open{display:flex}
        .lrc-shell{background:linear-gradient(180deg,#151726 0%,#0b0c14 100%);border:1px solid rgba(212,175,55,.4);border-radius:22px;width:100%;max-width:920px;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;overflow:hidden;color:#f8fafc;box-shadow:0 30px 70px rgba(0,0,0,.9),0 0 40px rgba(212,175,55,.12);position:relative}
        .lrc-hdr{padding:14px 20px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(90deg,rgba(212,175,55,.12),rgba(139,92,246,.08));border-bottom:1px solid rgba(212,175,55,.22);flex-shrink:0;gap:10px}
        .lrc-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.12rem;color:#D4AF37;text-shadow:0 2px 10px rgba(212,175,55,.35)}
        .lrc-hbtns{display:flex;gap:7px;align-items:center;flex-shrink:0}
        .lrc-ibtn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;height:34px;padding:0 11px;border-radius:10px;cursor:pointer;font-size:.84rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;transition:.2s;font-family:inherit}
        .lrc-ibtn:hover{background:rgba(212,175,55,.2);border-color:#D4AF37;color:#fff}
        .lrc-ibtn.sq{width:34px;padding:0;justify-content:center}
        .lrc-ibtn.x:hover{background:#ef4444;border-color:#ef4444}
        .lrc-banner{margin:10px 18px 0;padding:9px 14px;border-radius:12px;background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.38);color:#fde68a;font-size:.86rem;font-weight:700;display:none;align-items:center;gap:8px;flex-shrink:0}
        .lrc-banner.th-red{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.4);color:#fecaca}
        .lrc-banner.th-blue{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.4);color:#bfdbfe}
        .lrc-mult-bar{margin:8px 18px 0;padding:8px 14px;border-radius:10px;background:linear-gradient(90deg,rgba(245,158,11,.22),rgba(236,72,153,.18));border:1px solid rgba(251,191,36,.5);color:#fef08a;font-size:.84rem;font-weight:800;text-align:center;display:none;flex-shrink:0}
        .lrc-body{flex:1;overflow-y:auto;padding:18px 20px 26px;-webkit-overflow-scrolling:touch}
        .lrc-body::-webkit-scrollbar{width:6px}
        .lrc-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lrc-hero{text-align:center;padding:18px 16px;background:radial-gradient(circle at top,rgba(212,175,55,.16),transparent 70%);border:1px solid rgba(212,175,55,.22);border-radius:18px;margin-bottom:16px}
        .lrc-hero h2{margin:6px 0 8px;font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,#fde68a,#D4AF37,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lrc-hero p{margin:0 auto;max-width:560px;color:#cbd5e1;font-size:.88rem;line-height:1.65}
        .lrc-timer{display:inline-flex;align-items:center;gap:8px;margin-top:12px;background:rgba(0,0,0,.5);border:1px solid rgba(212,175,55,.45);color:#fbbf24;padding:7px 18px;border-radius:30px;font-family:monospace;font-size:1.08rem;font-weight:900;letter-spacing:1px;direction:ltr}
        .lrc-btn{background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;border:none;padding:10px 18px;border-radius:12px;font-weight:900;font-size:.92rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:.2s;font-family:inherit;box-shadow:0 6px 20px rgba(212,175,55,.25)}
        .lrc-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}
        .lrc-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .lrc-btn-out{background:rgba(255,255,255,.06);color:#fde68a;border:1px solid rgba(212,175,55,.4);box-shadow:none}
        .lrc-btn-out:hover{background:rgba(212,175,55,.15)}
        .lrc-btn-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;box-shadow:0 6px 18px rgba(239,68,68,.25)}
        .lrc-form{background:rgba(255,255,255,.03);border:1px solid rgba(212,175,55,.25);border-radius:16px;padding:16px;margin-bottom:18px}
        .lrc-roles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
        .lrc-role-opt{background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;cursor:pointer;text-align:center;transition:.2s;color:#cbd5e1;font-weight:800;font-size:.92rem}
        .lrc-role-opt.sel-king{border-color:#38bdf8;background:rgba(56,189,248,.14);color:#7dd3fc;box-shadow:0 0 18px rgba(56,189,248,.2)}
        .lrc-role-opt.sel-queen{border-color:#ec4899;background:rgba(236,72,153,.14);color:#f9a8d4;box-shadow:0 0 18px rgba(236,72,153,.2)}
        .lrc-inp{width:100%;box-sizing:border-box;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.14);color:#fff;padding:10px 14px;border-radius:12px;font-family:inherit;font-size:.9rem;outline:none}
        .lrc-inp:focus{border-color:#D4AF37}
        .lrc-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
        .lrc-fbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;padding:7px 14px;border-radius:20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s}
        .lrc-fbtn.active{background:#D4AF37;color:#111;border-color:#D4AF37}
        .lrc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
        .lrc-card{background:linear-gradient(180deg,rgba(30,33,54,.95),rgba(17,19,32,.98));border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:15px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;transition:.25s}
        .lrc-card:hover{transform:translateY(-3px);border-color:rgba(212,175,55,.45);box-shadow:0 12px 26px rgba(0,0,0,.45)}
        .lrc-card.voted{border-color:#10b981;box-shadow:0 0 22px rgba(16,185,129,.22)}
        .lrc-card.king-card{border-top:3px solid #38bdf8}
        .lrc-card.queen-card{border-top:3px solid #ec4899}
        .lrc-role-tag{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:12px;font-size:.7rem;font-weight:800}
        .lrc-role-tag.king{background:rgba(56,189,248,.18);color:#7dd3fc;border:1px solid rgba(56,189,248,.35)}
        .lrc-role-tag.queen{background:rgba(236,72,153,.18);color:#f9a8d4;border:1px solid rgba(236,72,153,.35)}
        .lrc-rank-num{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.45);color:#D4AF37;font-size:.76rem;font-weight:900;padding:3px 8px;border-radius:10px;border:1px solid rgba(212,175,55,.3)}
        .lrc-spot-bdg{margin-top:4px;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;font-size:.7rem;font-weight:900;padding:2px 9px;border-radius:12px}
        .lrc-av{width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:28px;color:#D4AF37;margin:14px 0 8px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
        .lrc-cname{font-size:.98rem;font-weight:800;color:#fff;margin-bottom:4px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        .lrc-cname .user-identity-name{color:#fff!important}
        .lrc-slogan{font-size:.8rem;color:#94a3b8;line-height:1.5;min-height:34px;margin-bottom:9px;word-break:break-word}
        .lrc-bar-wrap{width:100%;background:rgba(255,255,255,.07);height:7px;border-radius:10px;overflow:hidden;margin-bottom:6px}
        .lrc-bar-fill{height:100%;background:linear-gradient(90deg,#D4AF37,#f59e0b);border-radius:10px;transition:width .4s ease}
        .lrc-vstat{font-size:.78rem;color:#fde68a;font-weight:700;margin-bottom:10px}
        .lrc-cacts{display:flex;gap:6px;width:100%;margin-top:auto}
        .lrc-podium{background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(20,22,38,.95));border:2px solid #D4AF37;border-radius:20px;padding:24px 18px;text-align:center;position:relative;margin-bottom:18px;box-shadow:0 0 35px rgba(212,175,55,.2)}
        .lrc-podium .lrc-av{width:104px;height:104px;border-width:3px;margin:10px auto 12px;box-shadow:0 0 28px rgba(212,175,55,.55)}
        .lrc-prize-grid{display:grid;grid-template-columns:1fr;gap:9px;margin-top:10px}
        .lrc-prize-item{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.25);border-radius:14px;padding:10px 13px;text-align:right}
        .lrc-prize-ico{width:36px;height:36px;border-radius:10px;background:rgba(212,175,55,.16);color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .lrc-subov{position:fixed;inset:0;background:rgba(4,6,12,.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);direction:rtl;padding:14px}
        .lrc-subbox{background:linear-gradient(180deg,#1a1d32,#0e101d);border:1px solid rgba(212,175,55,.45);border-radius:20px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto;padding:18px;color:#fff;box-shadow:0 25px 60px rgba(0,0,0,.9)}
        .lrc-mini-fab{position:fixed;bottom:95px;right:20px;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;padding:10px 16px;border-radius:30px;font-weight:900;font-size:.86rem;box-shadow:0 10px 25px rgba(0,0,0,.6);display:none;align-items:center;gap:8px;z-index:2147483643;cursor:pointer;direction:rtl;border:2px solid rgba(255,255,255,.3)}
        .lrc-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#121424;border:1px solid #D4AF37;color:#fff;padding:10px 20px;border-radius:30px;font-size:.86rem;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.75);z-index:2147483647;opacity:0;pointer-events:none;transition:all .35s ease;direction:rtl;max-width:90vw;text-align:center}
        .lrc-toast.th-gold{background:linear-gradient(135deg,#2a210a,#121424);color:#fde68a;border-color:#D4AF37}
        .lrc-toast.th-red{background:linear-gradient(135deg,#351015,#121424);color:#fecaca;border-color:#ef4444}
        .lrc-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

        /* التوست الإعلاني العريض والواضح للانتقال بين المراحل */
        #lrc-live-ad{
            position:fixed;bottom:-120px;left:50%;transform:translateX(-50%);
            width:min(510px,calc(100vw - 22px));
            background:linear-gradient(135deg,#1d1a2c 0%,#0f111c 100%);
            border:1px solid rgba(212,175,55,.65);
            color:#fff;padding:10px 14px;border-radius:16px;
            display:flex;align-items:center;gap:10px;
            z-index:2147483646;opacity:0;visibility:hidden;
            transition:bottom .4s cubic-bezier(.2,.8,.2,1),opacity .3s ease,visibility 0s linear .3s;
            direction:rtl;box-sizing:border-box;
            box-shadow:0 14px 35px rgba(0,0,0,.78),0 0 22px rgba(212,175,55,.18);
        }
        #lrc-live-ad.th-red{border-color:rgba(239,68,68,.75);background:linear-gradient(135deg,#2e1015,#110c14)}
        #lrc-live-ad.th-purple{border-color:rgba(168,85,247,.75);background:linear-gradient(135deg,#221238,#100d1b)}
        #lrc-live-ad.show{bottom:74px;opacity:1;visibility:visible;transition:bottom .4s cubic-bezier(.2,.8,.2,1),opacity .3s ease,visibility 0s linear 0s}
        .lrc-ad-ico{width:32px;height:32px;border-radius:10px;background:rgba(212,175,55,.18);color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        #lrc-ad-msg{flex:1;min-width:0;font-size:12.5px;font-weight:700;line-height:1.45;color:#fef3c7;text-align:right}
        .lrc-ad-btns{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lrc-ad-go{background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;border:none;padding:6px 13px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap}
        .lrc-ad-x{background:rgba(255,255,255,.08);color:#cbd5e1;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:12px}
        .lrc-ad-x:hover{background:rgba(239,68,68,.8);color:#fff}

        @media(max-width:650px){
            .lrc-ov{padding:0}.lrc-shell{max-width:100%;height:100%;max-height:100%;border-radius:0;border:none}
            .lrc-hdr{padding:11px 14px}.lrc-brand{font-size:.98rem}.lrc-ibtn span{display:none}.lrc-body{padding:14px}
            .lrc-grid{grid-template-columns:1fr 1fr;gap:10px}.lrc-card{padding:11px}.lrc-av{width:62px;height:62px}
            #lrc-live-ad{padding:9px 12px;gap:8px}#lrc-ad-msg{font-size:12px}
        }
        @media(max-width:390px){.lrc-grid{grid-template-columns:1fr}}
        `;
        document.head.appendChild(s);
    }

    function ensureUserModal() {
        ensureBaseStyles();
        if (st.uiBuilt) return;
        st.uiBuilt = !0;
        document.body.insertAdjacentHTML("beforeend", `
            <div id="lrc-modal" class="lrc-ov">
                <div class="lrc-shell">
                    <div class="lrc-hdr">
                        <div class="lrc-brand"><i class="fas fa-crown"></i><span id="lrc-hdr-title">مسابقة ملك وملكة الشات</span></div>
                        <div class="lrc-hbtns">
                            <button type="button" class="lrc-ibtn" id="lrc-btn-hof" title="قاعة الشرف"><i class="fas fa-trophy" style="color:#fbbf24;"></i><span>قاعة الشرف</span></button>
                            <button type="button" class="lrc-ibtn" id="lrc-btn-prizes" title="الجوائز والقوانين"><i class="fas fa-gift" style="color:#ec4899;"></i><span>الجوائز</span></button>
                            <button type="button" class="lrc-ibtn sq" id="lrc-btn-min" title="تصغير"><i class="fas fa-minus"></i></button>
                            <button type="button" class="lrc-ibtn sq x" id="lrc-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div id="lrc-banner" class="lrc-banner"><i class="fas fa-bullhorn"></i><span id="lrc-banner-txt"></span></div>
                    <div id="lrc-mult-bar" class="lrc-mult-bar"></div>
                    <div id="lrc-body" class="lrc-body"></div>
                </div>
            </div>
            <div id="lrc-mini-fab" class="lrc-mini-fab"><i class="fas fa-crown"></i><span>ملك وملكة الشات</span></div>
        `);
        const modal = document.getElementById("lrc-modal");
        modal.addEventListener("click", e => { if (e.target === modal) window.LaylRoyalContest.close(); });
        document.getElementById("lrc-btn-close").onclick = () => window.LaylRoyalContest.close();
        document.getElementById("lrc-btn-min").onclick = () => window.LaylRoyalContest.minimize();
        document.getElementById("lrc-btn-prizes").onclick = () => openPrizesModal();
        document.getElementById("lrc-btn-hof").onclick = () => openHofModal();
        document.getElementById("lrc-mini-fab").onclick = () => window.LaylRoyalContest.restore();
    }

    function maybeShowWelcome() {
        const txt = (st.settings.welcomeText || "").trim(), ver = String(st.settings.welcomeVersion || 1);
        try { if (!txt || localStorage.getItem("lrc_welc_v") === ver) return; } catch (e) { return; }
        document.getElementById("lrc-welc-sub")?.remove();
        const ov = document.createElement("div");
        ov.id = "lrc-welc-sub";
        ov.className = "lrc-subov";
        ov.innerHTML = `<div class="lrc-subbox" style="text-align:center;max-width:420px;"><div style="font-size:32px;margin-bottom:6px;">👑</div><h3 style="margin:0 0 10px;color:#D4AF37;">رسالة من إدارة المسابقة</h3><p style="margin:0 0 16px;font-size:.9rem;line-height:1.7;color:#e2e8f0;white-space:pre-line;">${h.esc(txt)}</p><button type="button" id="lrc-welc-ok" class="lrc-btn" style="width:100%;">حسناً، فهمت</button></div>`;
        document.body.appendChild(ov);
        const done = () => { try { localStorage.setItem("lrc_welc_v", ver); } catch (e) {} ov.remove(); };
        ov.onclick = e => { if (e.target === ov) done(); };
        document.getElementById("lrc-welc-ok").onclick = done;
    }

    function openPrizesModal() {
        document.getElementById("lrc-prizes-sub")?.remove();
        const list = Array.isArray(st.prizes) && st.prizes.length ? st.prizes : DEFAULT_PRIZES;
        const rules = (st.settings.rulesText || DEFAULT_RULES).trim();
        const ov = document.createElement("div");
        ov.id = "lrc-prizes-sub";
        ov.className = "lrc-subov";
        ov.innerHTML = `
            <div class="lrc-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.08rem;"><i class="fas fa-gift"></i> الجوائز الملكية والقوانين 👑</b>
                    <button type="button" class="lrc-ibtn sq x" id="lrc-pz-x"><i class="fas fa-times"></i></button>
                </div>
                <div class="lrc-prize-grid">
                    ${list.map((p, i) => `
                        <div class="lrc-prize-item">
                            <div class="lrc-prize-ico"><i class="fas ${h.esc(p.icon || "fa-crown")}"></i></div>
                            <div style="flex:1;">
                                <div style="font-weight:800;font-size:.9rem;color:#fff;">${i + 1}. ${h.esc(p.title)}</div>
                                ${p.dur ? `<div style="font-size:.76rem;color:#D4AF37;margin-top:2px;">${h.esc(p.dur)}</div>` : ""}
                            </div>
                        </div>`).join("")}
                </div>
                ${rules ? `<div style="margin-top:14px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 13px;"><div style="color:#fde68a;font-weight:800;font-size:.86rem;margin-bottom:6px;"><i class="fas fa-gavel"></i> ضوابط المسابقة:</div><div style="font-size:.82rem;color:#cbd5e1;line-height:1.7;white-space:pre-line;">${h.esc(rules)}</div></div>` : ""}
                <button type="button" id="lrc-pz-ok" class="lrc-btn" style="width:100%;margin-top:14px;">مستعد للمنافسة 🔥</button>
            </div>`;
        document.body.appendChild(ov);
        ov.onclick = e => { if (e.target === ov) ov.remove(); };
        document.getElementById("lrc-pz-x").onclick = () => ov.remove();
        document.getElementById("lrc-pz-ok").onclick = () => ov.remove();
    }

    function openHofModal() {
        document.getElementById("lrc-hof-sub")?.remove();
        const list = Object.values(st.hof || {}).sort((a, b) => (b.date || 0) - (a.date || 0));
        const ov = document.createElement("div");
        ov.id = "lrc-hof-sub";
        ov.className = "lrc-subov";
        ov.innerHTML = `
            <div class="lrc-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.08rem;"><i class="fas fa-trophy"></i> قاعة الشرف — ملوك وملكات ليل</b>
                    <button type="button" class="lrc-ibtn sq x" id="lrc-hf-x"><i class="fas fa-times"></i></button>
                </div>
                ${list.length ? list.map(w => `
                    <div class="lrc-prize-item" style="margin-bottom:8px;">
                        ${w.avatar ? `<img src="${h.esc(w.avatar)}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;">` : `<div class="lrc-prize-ico"><i class="fas fa-crown"></i></div>`}
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:900;color:#fff;font-size:.94rem;">${"queen" === w.role ? "👸 ملكة الشات:" : "👑 ملك الشات:"} ${h.esc(w.name)}</div>
                            <div style="font-size:.76rem;color:#D4AF37;margin-top:2px;">الموسم #${h.esc(w.season || 1)} • ${w.votes || 0} صوت • ${h.fmtDate(w.date)}</div>
                        </div>
                    </div>`).join("") : '<div style="text-align:center;color:#64748b;padding:26px;">قاعة الشرف بانتظار أول متوّج باللقب 👑</div>'}
            </div>`;
        document.body.appendChild(ov);
        ov.onclick = e => { if (e.target === ov) ov.remove(); };
        document.getElementById("lrc-hf-x").onclick = () => ov.remove();
    }

    function ensureIdentity() {
        if (st.myUser) {
            const det = h.detectFromDOM(st.myUser);
            if (det) { st.myUid = det.uid || st.myUid; st.myHtml = det.html || st.myHtml; st.myAvatar = det.avatar || st.myAvatar; }
            return !0;
        }
        const raw = prompt("لتأمين مشاركتك في المسابقة 👑\nاكتب اسم المستخدم (Username) الخاص بك في الشات:");
        if (!raw || !raw.trim()) return !1;
        const det = h.detectFromDOM(raw.trim());
        if (!det) { alert("لم يتم العثور على هذا الاسم في الشات حالياً. تأكد من كتابة اسمك بشكل مطابق."); return !1; }
        st.myUser = det.username; st.myUid = det.uid; st.myHtml = det.html; st.myAvatar = det.avatar;
        try {
            localStorage.setItem("pc_username", det.username);
            if (det.uid) localStorage.setItem("pc_userid", det.uid);
            if (det.html) localStorage.setItem("pc_userhtml", det.html);
        } catch (e) {}
        bindCmdListener();
        return !0;
    }

    function renderAvatar(av, role) {
        if (av && /^https?:\/\//i.test(av)) return `<img class="lrc-av" src="${h.esc(av)}" alt="">`;
        return `<div class="lrc-av"><i class="fas ${"queen" === role ? "fa-chess-queen" : "fa-crown"}"></i></div>`;
    }
function renderMainBody() {

    function submitNomination(role) {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (!ensureIdentity()) return;
        const ban = h.getMyBan();
        if (!h.isAdmin() && ban && ("all" === ban.scope || "nom" === ban.scope)) {
            return alert(`تم منعك من الترشيح 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
        }
        const maxC = Number(st.settings.maxCandidates) || 0;
        if (maxC > 0 && Object.keys(st.candidates || {}).length >= maxC && !h.isAdmin()) {
            return showToast("⚠️ اكتمل العدد المسموح للمرشحين.", 3500, "red");
        }
        const key = h.myKey();
        if (!key) return;
        const slogan = (document.getElementById("lrc-slogan-inp")?.value || "").trim().slice(0, 90);
        const det = h.detectFromDOM(st.myUser) || {};
        const needsApp = Boolean(st.settings.requireApproval) && !h.isAdmin();
        st.db.ref(`${ROOT}/candidates/${key}`).set({
            uid: det.uid || st.myUid || "",
            username: st.myUser,
            displayName: det.displayName || st.myUser,
            html: det.html || st.myHtml || h.esc(st.myUser),
            avatar: det.avatar || st.myAvatar || "",
            role, slogan, badge: "", frozen: !1,
            status: needsApp ? "pending" : "approved",
            bonusVotes: 0,
            joinedAt: Date.now()
        }).then(() => {
            showToast(needsApp ? "⏳ تم إرسال ترشيحك لمراجعة الإدارة!" : "👑 تم اعتماد ترشيحك بنجاح!", 3500, "gold");
        }).catch(() => alert("❌ فشل حفظ الترشيح."));
    }

    function castVote(targetKey, targetRole) {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (!st.settings.allowGuestsVote && h.isGuest() && !h.isAdmin()) return alert("التصويت متاح للأعضاء المسجلين فقط 👑");
        if (!ensureIdentity()) return;
        const ban = h.getMyBan();
        if (!h.isAdmin() && ban && ("all" === ban.scope || "vote" === ban.scope)) {
            return alert(`تم منعك من التصويت 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
        }
        const target = st.candidates[targetKey];
        if (!target || target.frozen) return showToast("❄️ التصويت لهذا المرشح مجمد مؤقتاً.", 3000, "red");
        const myK = h.myKey();
        if (!st.settings.allowSelfVote && !h.isAdmin() && myK === targetKey) return showToast("🚫 لا يمكنك التصويت لنفسك!", 3500, "red");
        const isDual = "dual" === st.state?.mode;
        const voteKey = isDual ? `${myK}_${targetRole}` : myK;
        if (st.votes[voteKey] && !st.settings.allowVoteChange) return showToast("⚠️ لقد استخدمت صوتك مسبقاً.", 3000, "red");
        const candName = target.displayName || targetKey;
        if (!confirm(`تأكيد منح صوتك للمرشح (${candName})؟${st.settings.allowVoteChange ? "" : "\nلا يمكن التراجع بعد التصويت."}`)) return;

        let weight = Math.max(1, Number(st.state?.voteMultiplier) || 1);
        if (h.isVip()) weight = Math.max(weight, Number(st.settings.vipVoteWeight) || 2);

        st.db.ref(`${ROOT}/votes/${voteKey}`).set({
            target: targetKey,
            role: targetRole,
            voterName: st.myUser,
            weight,
            ts: Date.now()
        }).then(() => showToast(`✅ تم احتساب صوتك لـ ${candName}${weight > 1 ? ` (×${weight})` : ""}!`, 3500, "gold"))
          .catch(() => alert("❌ تعذر تسجيل الصوت."));
    }

    function startCountdownLoop() {
        clearInterval(st.timerId);
        let prevPhase = getPhaseInfo().phase;
        st.timerId = setInterval(() => {
            const modal = document.getElementById("lrc-modal");
            if (!modal || !modal.classList.contains("open")) return;
            const info = getPhaseInfo();
            if (info.phase !== prevPhase) { prevPhase = info.phase; renderMainBody(); return; }
            const cd = document.getElementById("lrc-cd-txt");
            if (cd) cd.textContent = h.fmtTime(info.remaining);
        }, 1000);
    }

    // ==================== لوحة التحكم الإدارية الشاملة (7 تبويبات) ====================
    const royalAdmin = {
        injectStyles() {
            if (document.getElementById("lrca-styles")) return;
            const s = document.createElement("style");
            s.id = "lrca-styles";
            s.textContent = `
            .lrca-ov{position:fixed;inset:0;background:rgba(8,10,18,.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);direction:rtl;font-family:'Segoe UI',tahoma,sans-serif;opacity:0;transition:opacity .22s}
            .lrca-ov.active{opacity:1}
            .lrca-box{background:linear-gradient(180deg,rgba(28,31,56,.99),rgba(14,16,30,.99));border:1px solid rgba(212,175,55,.45);border-radius:20px;width:95%;max-width:680px;max-height:89vh;max-height:89dvh;padding:15px 17px 17px;box-shadow:0 25px 60px rgba(0,0,0,.9);display:flex;flex-direction:column;overflow:hidden;color:#f8fafc;box-sizing:border-box}
            .lrca-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
            .lrca-title{display:flex;align-items:center;gap:8px;color:#D4AF37;font-weight:900;font-size:15.5px}
            .lrca-ctrl{background:rgba(255,255,255,.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px}
            .lrca-ctrl.x:hover{background:#ef4444}
            .lrca-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;flex-shrink:0}
            .lrca-stat{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 4px;text-align:center}
            .lrca-stat-v{font-size:12.5px;font-weight:800;color:#D4AF37}
            .lrca-stat-l{font-size:10px;color:#94a3b8;margin-top:2px}
            .lrca-tabs{display:flex;height:42px;min-height:42px;background:rgba(0,0,0,.34);border-radius:12px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;border:1px solid rgba(255,255,255,.05);flex-shrink:0}
            .lrca-tabs::-webkit-scrollbar{display:none}
            .lrca-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 10px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:bold;cursor:pointer;white-space:nowrap}
            .lrca-tab.active{background:rgba(212,175,55,.16);color:#D4AF37;border-bottom:2px solid #D4AF37}
            .lrca-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding-left:4px;margin-left:-4px;-webkit-overflow-scrolling:touch}
            .lrca-body::-webkit-scrollbar{width:5px}
            .lrca-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
            .lrca-view{display:none}.lrca-view.active{display:block}
            .lrca-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;margin-bottom:9px;text-align:right}
            .lrca-ct{font-size:12.5px;font-weight:800;color:#D4AF37;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
            .lrca-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
            .lrca-g2{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
            .lrca-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
            .lrca-g4{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
            .lrca-inp{width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.11);color:#fff;padding:8px 10px;border-radius:10px;font-family:inherit;font-size:12.5px;outline:none;box-sizing:border-box}
            .lrca-inp:focus{border-color:#D4AF37}
            .lrca-inp option{background:#16182c;color:#fff}
            .lrca-lbl{display:block;font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:4px}
            .lrca-btn{border:none;border-radius:10px;padding:8px 10px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:5px}
            .lrca-b-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;width:100%}
            .lrca-b-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;width:100%}
            .lrca-b-dark{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.08)}
            .lrca-b-ok{background:rgba(16,185,129,.18);color:#6ee7b7;border:1px solid rgba(16,185,129,.35)}
            .lrca-b-info{background:rgba(56,189,248,.16);color:#7dd3fc;border:1px solid rgba(56,189,248,.3)}
            .lrca-b-warn{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35)}
            .lrca-b-dng{background:rgba(239,68,68,.16);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
            .lrca-mini{padding:5px 8px;font-size:11px;border-radius:8px;width:auto}
            .lrca-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700}
            .lrca-t-gold{background:rgba(212,175,55,.18);color:#D4AF37}
            .lrca-t-green{background:rgba(16,185,129,.16);color:#34d399}
            .lrca-t-red{background:rgba(239,68,68,.18);color:#f87171}
            .lrca-t-blue{background:rgba(56,189,248,.18);color:#38bdf8}
            .lrca-srow{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:8px 11px;margin-bottom:7px;gap:10px}
            .lrca-sw{position:relative;width:42px;height:22px;flex-shrink:0}.lrca-sw input{opacity:0;width:0;height:0}
            .lrca-sl{position:absolute;cursor:pointer;inset:0;background:#334155;border-radius:22px;transition:.25s}
            .lrca-sl:before{content:"";position:absolute;height:16px;width:16px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:.25s}
            .lrca-sw input:checked+.lrca-sl{background:#10b981}.lrca-sw input:checked+.lrca-sl:before{transform:translateX(-20px)}
            .lrca-bdg{background:#ef4444;color:#fff;font-size:9.5px;font-weight:900;padding:1px 6px;border-radius:12px;margin-right:3px;display:none}
            `;
            document.head.appendChild(s);
        },

        log(action, target, details = "") {
            if (!st.db) return;
            st.db.ref(`${ROOT}/logs`).push({
                admin: st.myUser || "الإدارة", action, target: target || "-", details,
                ts: firebase.database.ServerValue.TIMESTAMP
            }).catch(() => {});
        },

        sendUserCmd(sanUser, cmd, text = "") {
            if (!st.db || !sanUser) return;
            st.db.ref(`${ROOT}/cmds/${sanUser}`).set({ cmd, text, ts: Date.now(), by: st.myUser || "الإدارة" }).then(() => {
                this.log("kick" === cmd ? "إخراج فوري" : "تنبيه خاص", sanUser, text || cmd);
                showToast("kick" === cmd ? "⚡ تم إخراج العضو من المسابقة" : "📩 تم إرسال التنبيه للعضو");
            });
        },

        patchSettings(part, msg) {
            if (!st.db) return;
            st.db.ref(`${ROOT}/settings`).update(part).then(() => {
                st.settings = Object.assign({}, st.settings, part);
                this.log("تعديل إعدادات", "المسابقة", Object.keys(part).join(", "));
                this.refresh();
                renderMainBody();
                if (msg) showToast(msg, 3000, "gold");
            }).catch(() => alert("❌ فشل الحفظ."));
        },

        open() {
            if (!h.isAdmin()) return alert("هذه اللوحة متاحة للإدارة فقط.");
            ensureBaseStyles();
            this.injectStyles();
            document.getElementById("lrc-admin-modal")?.remove();
            const ov = document.createElement("div");
            ov.id = "lrc-admin-modal";
            ov.className = "lrca-ov";
            ov.innerHTML = `
            <div class="lrca-box">
                <div class="lrca-head">
                    <div class="lrca-title"><i class="fas fa-crown"></i> لوحة تحكم مسابقة ملك وملكة الشات</div>
                    <div class="lrca-row" style="gap:6px;">
                        <button type="button" class="lrca-ctrl" id="lrca-open-app" title="فتح المسابقة"><i class="fas fa-external-link-alt"></i></button>
                        <button type="button" class="lrca-ctrl" id="lrca-ref" title="تحديث"><i class="fas fa-sync-alt"></i></button>
                        <button type="button" class="lrca-ctrl x" id="lrca-close" title="إغلاق"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="lrca-stats">
                    <div class="lrca-stat"><div class="lrca-stat-v" id="lrca-st-ph">...</div><div class="lrca-stat-l">المرحلة</div></div>
                    <div class="lrca-stat"><div class="lrca-stat-v" id="lrca-st-cn">0</div><div class="lrca-stat-l">المرشحون</div></div>
                    <div class="lrca-stat"><div class="lrca-stat-v" id="lrca-st-vt">0</div><div class="lrca-stat-l">الأصوات</div></div>
                    <div class="lrca-stat"><div class="lrca-stat-v" id="lrca-st-on">0</div><div class="lrca-stat-l">متواجدون الآن</div></div>
                </div>
                <div class="lrca-tabs">
                    <button type="button" class="lrca-tab active" data-atab="control"><i class="fas fa-sliders-h"></i> التحكم</button>
                    <button type="button" class="lrca-tab" data-atab="cands"><i class="fas fa-users"></i> المرشحون <span id="lrca-pbdg" class="lrca-bdg">0</span></button>
                    <button type="button" class="lrca-tab" data-atab="votes"><i class="fas fa-vote-yea"></i> الأصوات</button>
                    <button type="button" class="lrca-tab" data-atab="radar"><i class="fas fa-eye"></i> الرادار والحظر</button>
                    <button type="button" class="lrca-tab" data-atab="prizes"><i class="fas fa-gift"></i> الجوائز والقوانين</button>
                    <button type="button" class="lrca-tab" data-atab="settings"><i class="fas fa-cog"></i> الصلاحيات</button>
                    <button type="button" class="lrca-tab" data-atab="analytics"><i class="fas fa-chart-bar"></i> التحليلات والسجل</button>
                </div>
                <div class="lrca-body">
                    <!-- 1. التحكم والمراحل -->
                    <div id="lrca-v-control" class="lrca-view active">
                        <div class="lrca-card" style="border-color:rgba(212,175,55,.4);">
                            <div class="lrca-ct"><span><i class="fas fa-rocket"></i> إطلاق موسم جديد</span></div>
                            <div class="lrca-g2" style="margin-bottom:6px;">
                                <div><label class="lrca-lbl">عنوان الموسم</label><input id="lrca-n-title" class="lrca-inp" value="مسابقة ملك وملكة شات ليل"></div>
                                <div><label class="lrca-lbl">نظام التتويج</label><select id="lrca-n-mode" class="lrca-inp"><option value="single">فائز واحد (ملك أو ملكة)</option><option value="dual">فائزان (ملك + ملكة)</option></select></div>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:8px;">
                                <div><label class="lrca-lbl">مدة الترشيح (ساعة — 48 = يومين)</label><input type="number" id="lrca-n-nomh" class="lrca-inp" value="48" min="1" max="336"></div>
                                <div><label class="lrca-lbl">مدة التصويت (ساعة — 72 = 3 أيام)</label><input type="number" id="lrca-n-voth" class="lrca-inp" value="72" min="1" max="336"></div>
                            </div>
                            <button type="button" id="lrca-start-new" class="lrca-btn lrca-b-gold"><i class="fas fa-play"></i> بدء الموسم الآن (تصفير الموسم السابق)</button>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-clock"></i> التحكم الدقيق بالوقت والمراحل</span><span id="lrca-cur-cd" class="lrca-tag lrca-t-gold" dir="ltr">--:--:--</span></div>
                            <div class="lrca-g4" style="margin-bottom:7px;">
                                <button type="button" class="lrca-btn lrca-b-info lrca-time-adj" data-h="1">+1 س</button>
                                <button type="button" class="lrca-btn lrca-b-info lrca-time-adj" data-h="6">+6 س</button>
                                <button type="button" class="lrca-btn lrca-b-info lrca-time-adj" data-h="24">+24 س</button>
                                <button type="button" class="lrca-btn lrca-b-warn lrca-time-adj" data-h="-1">-1 س</button>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:7px;">
                                <button type="button" id="lrca-pause-btn" class="lrca-btn lrca-b-warn"><i class="fas fa-pause"></i> إيقاف مؤقت / استئناف</button>
                                <button type="button" id="lrca-tog-mode" class="lrca-btn lrca-b-dark"><i class="fas fa-exchange-alt"></i> تبديل (فائز / ملك+ملكة)</button>
                                <button type="button" id="lrca-go-nom" class="lrca-btn lrca-b-dark"><i class="fas fa-undo"></i> العودة للترشيح (+24س)</button>
                                <button type="button" id="lrca-skip-nom" class="lrca-btn lrca-b-ok"><i class="fas fa-forward"></i> بدء التصويت الآن</button>
                                <button type="button" id="lrca-skip-vote" class="lrca-btn lrca-b-ok"><i class="fas fa-flag-checkered"></i> إعلان النتائج الآن</button>
                                <button type="button" id="lrca-save-hof" class="lrca-btn lrca-b-gold"><i class="fas fa-trophy"></i> تخليد بقاعة الشرف</button>
                            </div>
                            <button type="button" id="lrca-reset-all" class="lrca-btn lrca-b-dng" style="width:100%;"><i class="fas fa-power-off"></i> إغلاق وتصفير المسابقة بالكامل</button>
                        </div>

                        <div class="lrca-card" style="border-color:rgba(251,191,36,.4);">
                            <div class="lrca-ct"><span><i class="fas fa-bolt"></i> ساعة التاج الذهبية (مضاعفة الأصوات)</span><span id="lrca-mult-tag" class="lrca-tag lrca-t-gold">×1 عادي</span></div>
                            <div class="lrca-g3">
                                <button type="button" class="lrca-btn lrca-b-dark lrca-set-mult" data-m="1">×1 عادي</button>
                                <button type="button" class="lrca-btn lrca-b-warn lrca-set-mult" data-m="2">🔥 ×2 مضاعف</button>
                                <button type="button" class="lrca-btn lrca-b-red lrca-set-mult" data-m="3">⚡ ×3 ثلاثي</button>
                            </div>
                        </div>

                        <div class="lrca-card" style="border-color:rgba(239,68,68,.35);">
                            <div class="lrca-ct" style="color:#fca5a5;"><span><i class="fas fa-bullhorn"></i> بث توست فوري لجميع المتواجدين بالشات</span></div>
                            <div class="lrca-row">
                                <input id="lrca-bc-inp" class="lrca-inp" style="flex:1;" placeholder="مثلاً: 👑 بدأت ساعة التصويت المضاعف ×2 الآن!">
                                <select id="lrca-bc-th" class="lrca-inp" style="width:86px;"><option value="gold">ذهبي</option><option value="red">عاجل</option><option value="purple">ملكي</option></select>
                                <button type="button" id="lrca-bc-send" class="lrca-btn lrca-b-red lrca-mini" style="padding:8px 13px;"><i class="fas fa-paper-plane"></i> بث</button>
                            </div>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-ribbon"></i> شريط الإعلان الدائم بأعلى المسابقة</span></div>
                            <div class="lrca-row">
                                <input id="lrca-ban-txt" class="lrca-inp" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                                <select id="lrca-ban-th" class="lrca-inp" style="width:86px;"><option value="gold">ذهبي</option><option value="red">أحمر</option><option value="blue">أزرق</option></select>
                                <button type="button" id="lrca-ban-save" class="lrca-btn lrca-b-gold lrca-mini" style="padding:8px 13px;">حفظ</button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. المرشحون -->
                    <div id="lrca-v-cands" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct">
                                <span><i class="fas fa-user-plus"></i> إضافة مرشح يدوياً</span>
                                <button type="button" id="lrca-app-all" class="lrca-btn lrca-b-ok lrca-mini">اعتماد كل المعلّقين ✓</button>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:6px;">
                                <input id="lrca-mc-u" class="lrca-inp" placeholder="اسم المستخدم *">
                                <select id="lrca-mc-r" class="lrca-inp"><option value="king">👑 ملك</option><option value="queen">👸 ملكة</option></select>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:7px;">
                                <input id="lrca-mc-s" class="lrca-inp" placeholder="الشعار (اختياري)">
                                <input id="lrca-mc-av" class="lrca-inp" dir="ltr" placeholder="رابط صورة اختياري (https://...)">
                            </div>
                            <button type="button" id="lrca-mc-add" class="lrca-btn lrca-b-ok" style="width:100%;">إضافة مرشح معتمد</button>
                        </div>
                        <div id="lrca-cands-list"></div>
                    </div>

                    <!-- 3. الأصوات ومكافحة التلاعب -->
                    <div id="lrca-v-votes" class="lrca-view">
                        <div class="lrca-card" style="border-color:rgba(245,158,11,.35);">
                            <div class="lrca-ct"><span><i class="fas fa-shield-alt"></i> أدوات مكافحة التلاعب السريعة</span></div>
                            <div class="lrca-g3">
                                <button type="button" id="lrca-rev-10m" class="lrca-btn lrca-b-warn">سحب آخر 10 د</button>
                                <button type="button" id="lrca-rev-cand" class="lrca-btn lrca-b-dng">تصفير أصوات مرشح</button>
                                <button type="button" id="lrca-wipe-votes" class="lrca-btn lrca-b-red">تصفير كل الأصوات</button>
                            </div>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-search"></i> سجل الأصوات التفصيلي</span></div>
                            <input id="lrca-vq" class="lrca-inp" style="margin-bottom:8px;" placeholder="ابحث باسم المصوّت أو المرشح...">
                            <div id="lrca-votes-list"></div>
                        </div>
                    </div>

                    <!-- 4. الرادار والحظر -->
                    <div id="lrca-v-radar" class="lrca-view">
                        <div class="lrca-card" style="border-color:rgba(16,185,129,.35);">
                            <div class="lrca-ct" style="color:#6ee7b7;">
                                <span><i class="fas fa-eye"></i> المتواجدون داخل المسابقة الآن</span>
                                <button type="button" id="lrca-clr-pres" class="lrca-btn lrca-b-dark lrca-mini">تنظيف الرادار</button>
                            </div>
                            <div id="lrca-pres-list"></div>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct">
                                <span><i class="fas fa-ban"></i> حظر عضو من المسابقة (مؤقت أو دائم)</span>
                                <button type="button" id="lrca-cln-bans" class="lrca-btn lrca-b-ok lrca-mini">تنظيف المنتهي</button>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:6px;">
                                <input id="lrca-bu" class="lrca-inp" placeholder="اسم المستخدم *">
                                <select id="lrca-bs" class="lrca-inp"><option value="all">حظر كامل</option><option value="nom">منع الترشيح فقط</option><option value="vote">منع التصويت فقط</option></select>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:7px;">
                                <select id="lrca-bd" class="lrca-inp"><option value="perm">دائم</option><option value="1h">ساعة</option><option value="6h">6 ساعات</option><option value="24h">24 ساعة</option><option value="3d">3 أيام</option><option value="7d">أسبوع</option></select>
                                <input id="lrca-br" class="lrca-inp" placeholder="السبب (اختياري)">
                            </div>
                            <button type="button" id="lrca-bgo" class="lrca-btn lrca-b-red">تنفيذ الحظر</button>
                        </div>
                        <div id="lrca-bans-list"></div>
                    </div>

                    <!-- 5. الجوائز والقوانين والترحيب -->
                    <div id="lrca-v-prizes" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct">
                                <span><i class="fas fa-gift"></i> إدارة الجوائز الملكية</span>
                                <button type="button" id="lrca-pz-reset" class="lrca-btn lrca-b-warn lrca-mini">استعادة الجوائز الـ 6</button>
                            </div>
                            <div id="lrca-pz-list" style="margin-bottom:8px;"></div>
                            <div class="lrca-g3" style="margin-bottom:6px;">
                                <input id="lrca-np-t" class="lrca-inp" placeholder="عنوان الجائزة *">
                                <input id="lrca-np-d" class="lrca-inp" placeholder="المدة (مثلاً: أسبوع)">
                                <input id="lrca-np-i" class="lrca-inp" dir="ltr" value="fa-crown" placeholder="أيقونة (fa-crown)">
                            </div>
                            <button type="button" id="lrca-np-add" class="lrca-btn lrca-b-ok" style="width:100%;">+ إضافة جائزة للقائمة</button>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-gavel"></i> ضوابط وقوانين المسابقة</span></div>
                            <textarea id="lrca-rules-ta" class="lrca-inp" rows="4" style="margin-bottom:7px;"></textarea>
                            <button type="button" id="lrca-rules-save" class="lrca-btn lrca-b-gold">حفظ القوانين</button>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-comment-alt"></i> رسالة الترحيب المنبثقة عند فتح المسابقة</span></div>
                            <textarea id="lrca-welc-ta" class="lrca-inp" rows="2" style="margin-bottom:7px;" placeholder="تظهر مرة واحدة لكل عضو..."></textarea>
                            <div class="lrca-row">
                                <button type="button" id="lrca-welc-save" class="lrca-btn lrca-b-ok" style="flex:1;">حفظ وإظهار للجميع</button>
                                <button type="button" id="lrca-welc-off" class="lrca-btn lrca-b-dng lrca-mini">تعطيل</button>
                            </div>
                        </div>
                    </div>

                    <!-- 6. الصلاحيات والـ VIP والنسخ الاحتياطي -->
                    <div id="lrca-v-settings" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-cog"></i> ضوابط المسابقة العامة</span></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">تفعيل المسابقة للجميع</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-en"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">التصويت السري (إخفاء العدادات أثناء التصويت)</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-hide"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">مراجعة الإدارة قبل اعتماد المرشح الجديد</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-app"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للمرشح بالتصويت لنفسه</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-self"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للعضو بتغيير صوته قبل انتهاء الوقت</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-chg"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للضيوف بالتصويت</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-gst"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">إظهار التوست الإعلاني عند تغيّر المراحل</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-ad"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-g3" style="margin-bottom:8px;">
                                <div><label class="lrca-lbl">أقصى مرشحين (0=مفتوح)</label><input type="number" id="lrca-s-maxc" class="lrca-inp" min="0" max="500"></div>
                                <div><label class="lrca-lbl">قوة صوت VIP</label><select id="lrca-s-vipw" class="lrca-inp"><option value="1">×1 عادي</option><option value="2">×2 مضاعف</option><option value="3">×3 ثلاثي</option></select></div>
                                <div><label class="lrca-lbl">رسالة الصيانة</label><input id="lrca-s-msg" class="lrca-inp"></div>
                            </div>
                            <button type="button" id="lrca-s-save" class="lrca-btn lrca-b-gold"><i class="fas fa-save"></i> حفظ الإعدادات</button>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-crown"></i> مصوّتو VIP (صوت مضاعف + تجاوز الصيانة)</span></div>
                            <div class="lrca-row" style="margin-bottom:7px;">
                                <input id="lrca-vip-inp" class="lrca-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                <button type="button" id="lrca-vip-add" class="lrca-btn lrca-b-gold lrca-mini" style="padding:8px 13px;">إضافة VIP</button>
                            </div>
                            <div id="lrca-vip-list"></div>
                        </div>

                        <div class="lrca-card" style="border-color:rgba(56,189,248,.3);">
                            <div class="lrca-ct" style="color:#7dd3fc;"><span><i class="fas fa-user-tie"></i> مشرفو المسابقة المساعدون</span></div>
                            <div class="lrca-row" style="margin-bottom:7px;">
                                <input id="lrca-sa-inp" class="lrca-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                <button type="button" id="lrca-sa-add" class="lrca-btn lrca-b-info lrca-mini" style="padding:8px 13px;">إضافة مشرف</button>
                            </div>
                            <div id="lrca-sa-list"></div>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-database"></i> النسخ الاحتياطي</span></div>
                            <div class="lrca-g2">
                                <button type="button" id="lrca-exp" class="lrca-btn lrca-b-info"><i class="fas fa-download"></i> تصدير JSON</button>
                                <button type="button" id="lrca-imp" class="lrca-btn lrca-b-ok"><i class="fas fa-upload"></i> استيراد JSON</button>
                            </div>
                            <input type="file" id="lrca-imp-file" accept=".json" style="display:none;">
                        </div>
                    </div>

                    <!-- 7. التحليلات وقاعة الشرف والسجل -->
                    <div id="lrca-v-analytics" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-chart-pie"></i> إحصائيات الموسم ونسخ الإعلانات</span></div>
                            <div id="lrca-an-box" style="margin-bottom:8px;"></div>
                            <div class="lrca-g2">
                                <button type="button" id="lrca-copy-top" class="lrca-btn lrca-b-gold"><i class="fas fa-list-ol"></i> نسخ الترتيب المباشر للشات</button>
                                <button type="button" id="lrca-copy-promo" class="lrca-btn lrca-b-info"><i class="fas fa-bullhorn"></i> نسخ إعلان الجوائز للشات</button>
                            </div>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-trophy"></i> قاعة الشرف (إضافة يدوية / حذف)</span></div>
                            <div class="lrca-g3" style="margin-bottom:7px;">
                                <input id="lrca-hf-n" class="lrca-inp" placeholder="اسم الفائز *">
                                <select id="lrca-hf-r" class="lrca-inp"><option value="king">👑 ملك</option><option value="queen">👸 ملكة</option></select>
                                <input id="lrca-hf-v" type="number" class="lrca-inp" placeholder="الأصوات">
                            </div>
                            <button type="button" id="lrca-hf-add" class="lrca-btn lrca-b-ok" style="width:100%;margin-bottom:8px;">+ إضافة سجل لقاعة الشرف</button>
                            <div id="lrca-hof-list"></div>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-clipboard-list"></i> سجل العمليات الإدارية</span><button type="button" id="lrca-clr-logs" class="lrca-btn lrca-b-dng lrca-mini">مسح</button></div>
                            <input id="lrca-log-q" class="lrca-inp" style="margin-bottom:7px;" placeholder="🔍 ابحث في السجل...">
                            <div id="lrca-logs-list"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(ov);
            this.bindEvents(ov);
            requestAnimationFrame(() => ov.classList.add("active"));
            this.populateSettings();
            this.bindLiveAdminStreams();
            this.refresh();
        },

        close() {
            if (st.logsRef) { st.logsRef.off(); st.logsRef = null; }
            if (st.presenceRef) { st.presenceRef.off(); st.presenceRef = null; }
            document.getElementById("lrc-admin-modal")?.remove();
        },

        bindLiveAdminStreams() {
            if (!st.db) return;
            st.logsRef?.off();
            st.logsRef = st.db.ref(`${ROOT}/logs`).limitToLast(100);
            st.logsRef.on("value", sn => {
                st.logs = Object.values(sn.val() || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
                this.renderLogs();
            });
            st.presenceRef?.off();
            st.presenceRef = st.db.ref(`${ROOT}/presence`);
            st.presenceRef.on("value", sn => {
                st.presence = sn.val() || {};
                this.refresh();
            });
        },

        populateSettings() {
            const s = st.settings;
            const sc = (id, v) => { const el = document.getElementById(id); if (el) el.checked = Boolean(v); };
            const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            sc("lrca-s-en", !1 !== s.enabled);
            sc("lrca-s-hide", Boolean(s.hideLiveVotes));
            sc("lrca-s-app", Boolean(s.requireApproval));
            sc("lrca-s-self", Boolean(s.allowSelfVote));
            sc("lrca-s-chg", Boolean(s.allowVoteChange));
            sc("lrca-s-gst", Boolean(s.allowGuestsVote));
            sc("lrca-s-ad", !1 !== s.showToastAd);
            sv("lrca-s-maxc", Number(s.maxCandidates) || 0);
            sv("lrca-s-vipw", String(Number(s.vipVoteWeight) || 2));
            sv("lrca-s-msg", s.disabledMsg || "");
            sv("lrca-ban-txt", s.bannerText || "");
            sv("lrca-ban-th", s.bannerTheme || "gold");
            sv("lrca-rules-ta", s.rulesText || DEFAULT_RULES);
            sv("lrca-welc-ta", s.welcomeText || "");
        },

        bindEvents(ov) {
            ov.onclick = e => { if (e.target === ov) this.close(); };
            document.getElementById("lrca-close").onclick = () => this.close();
            document.getElementById("lrca-open-app").onclick = () => { this.close(); window.LaylRoyalContest.open(); };
            document.getElementById("lrca-ref").onclick = () => { this.refresh(); showToast("🔄 تم التحديث"); };

            ov.querySelectorAll("[data-atab]").forEach(b => b.onclick = () => {
                st.adminTab = b.dataset.atab;
                ov.querySelectorAll("[data-atab]").forEach(x => x.classList.toggle("active", x === b));
                ov.querySelectorAll(".lrca-view").forEach(x => x.classList.remove("active"));
                document.getElementById(`lrca-v-${st.adminTab}`)?.classList.add("active");
                this.refresh();
            });

            // 1. التحكم والمراحل
            document.getElementById("lrca-start-new").onclick = () => {
                if (!st.db || !confirm("بدء موسم جديد سيصفّر مرشحي وأصوات الموسم السابق (مع بقاء قاعة الشرف والمحظورين). متابعة؟")) return;
                const title = document.getElementById("lrca-n-title").value.trim() || "مسابقة ملك وملكة شات ليل";
                const mode = document.getElementById("lrca-n-mode").value;
                const nomH = Math.max(1, parseFloat(document.getElementById("lrca-n-nomh").value) || 48);
                const votH = Math.max(1, parseFloat(document.getElementById("lrca-n-voth").value) || 72);
                const now = Date.now(), nextSeason = (Number(st.state?.season) || 0) + 1;
                const nomEnd = now + nomH * 36e5, voteEnd = nomEnd + votH * 36e5;
                st.db.ref(ROOT).update({
                    state: { status: "active", season: nextSeason, title, mode, nomEnd, voteEnd, paused: !1, voteMultiplier: 1, tieBreaker: null, tieBreakerKing: null, tieBreakerQueen: null, startedBy: st.myUser || "الإدارة" },
                    candidates: null, votes: null,
                    broadcast: { text: `👑 انطلق الموسم #${nextSeason} — رشّح نفسك الآن!`, theme: "gold", ts: Date.now(), by: st.myUser || "الإدارة" }
                }).then(() => { this.log("إطلاق موسم", `#${nextSeason}`, `${title} (${mode})`); showToast(`👑 تم إطلاق الموسم #${nextSeason}!`, 4000, "gold"); });
            };

            ov.querySelectorAll(".lrca-time-adj").forEach(b => b.onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return showToast("لا يوجد موسم نشط");
                const hrs = Number(b.dataset.h), delta = hrs * 36e5, info = getPhaseInfo();
                if ("nomination" === info.phase) {
                    st.db.ref(`${ROOT}/state`).update({ nomEnd: s.nomEnd + delta, voteEnd: s.voteEnd + delta }).then(() => { this.log("تعديل وقت الترشيح", `${hrs > 0 ? "+" : ""}${hrs}س`); showToast(`⏱️ تم تعديل وقت الترشيح (${hrs > 0 ? "+" : ""}${hrs}س)`); });
                } else if ("voting" === info.phase) {
                    st.db.ref(`${ROOT}/state`).update({ voteEnd: s.voteEnd + delta }).then(() => { this.log("تعديل وقت التصويت", `${hrs > 0 ? "+" : ""}${hrs}س`); showToast(`⏱️ تم تعديل وقت التصويت (${hrs > 0 ? "+" : ""}${hrs}س)`); });
                } else showToast("لا يمكن التعديل في هذه المرحلة");
            });

            document.getElementById("lrca-pause-btn").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return showToast("لا يوجد موسم نشط");
                if (s.paused) {
                    const rem = s.remainingMs || 0, now = Date.now(), up = { paused: !1, remainingMs: 0 };
                    if ("nomination" === s.pausedPhase) {
                        const vDur = Math.max(36e5, (s.voteEnd || now) - (s.nomEnd || now));
                        up.nomEnd = now + rem; up.voteEnd = up.nomEnd + vDur;
                    } else if ("voting" === s.pausedPhase) up.voteEnd = now + rem;
                    st.db.ref(`${ROOT}/state`).update(up).then(() => { this.log("استئناف المسابقة", `#${s.season}`); showToast("▶️ تم الاستئناف"); });
                } else {
                    const info = getPhaseInfo();
                    if ("nomination" !== info.phase && "voting" !== info.phase) return showToast("لا يمكن إيقاف هذه المرحلة");
                    st.db.ref(`${ROOT}/state`).update({ paused: !0, pausedPhase: info.phase, remainingMs: info.remaining }).then(() => { this.log("إيقاف مؤقت", `#${s.season}`); showToast("⏸️ تم الإيقاف المؤقت"); });
                }
            };

            document.getElementById("lrca-tog-mode").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return;
                const next = "dual" === s.mode ? "single" : "dual";
                st.db.ref(`${ROOT}/state/mode`).set(next).then(() => { this.log("تبديل النظام", next); showToast("dual" === next ? "👑 النظام الآن: ملك + ملكة" : "👑 النظام الآن: فائز واحد"); });
            };

            document.getElementById("lrca-go-nom").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return;
                if (!confirm("إعادة فتح باب الترشيح لمدة 24 ساعة إضافية؟")) return;
                const now = Date.now(), vDur = Math.max(24 * 36e5, (s.voteEnd - s.nomEnd) || 72 * 36e5);
                st.db.ref(`${ROOT}/state`).update({ nomEnd: now + 24 * 36e5, voteEnd: now + 24 * 36e5 + vDur, paused: !1 }).then(() => { this.log("إعادة للترشيح", "+24س"); showToast("🔄 تم فتح باب الترشيح"); });
            };

            document.getElementById("lrca-skip-nom").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status || !confirm("بدء مرحلة التصويت فوراً؟")) return;
                const now = Date.now(), dur = Math.max(36e5, (s.voteEnd - s.nomEnd) || 72 * 36e5);
                st.db.ref(`${ROOT}/state`).update({ nomEnd: now - 1000, voteEnd: now + dur, paused: !1 }).then(() => {
                    st.db.ref(`${ROOT}/broadcast`).set({ text: "🗳️ بدأ التصويت الآن! ادخل وصوّت للأفضل.", theme: "gold", ts: Date.now(), by: st.myUser || "الإدارة" });
                    this.log("بدء التصويت", `#${s.season}`); showToast("🗳️ بدأ التصويت!");
                });
            };

            document.getElementById("lrca-skip-vote").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status || !confirm("إنهاء التصويت وإعلان النتائج فوراً؟")) return;
                st.db.ref(`${ROOT}/state`).update({ nomEnd: Date.now() - 2000, voteEnd: Date.now() - 1000, paused: !1 }).then(() => {
                    st.db.ref(`${ROOT}/broadcast`).set({ text: "🏆 أُعلنت نتائج ملك وملكة الشات!", theme: "gold", ts: Date.now(), by: st.myUser || "الإدارة" });
                    this.log("إعلان النتائج", `#${s.season}`); showToast("🏆 تم إعلان النتائج!");
                });
            };

            ov.querySelectorAll(".lrca-set-mult").forEach(b => b.onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return showToast("لا يوجد موسم نشط");
                const m = Number(b.dataset.m);
                st.db.ref(`${ROOT}/state/voteMultiplier`).set(m).then(() => {
                    this.log("مضاعفة الأصوات", `×${m}`);
                    if (m > 1) st.db.ref(`${ROOT}/broadcast`).set({ text: `⚡ ساعة التاج الذهبية! كل صوت يُحسب ×${m} الآن!`, theme: "purple", ts: Date.now(), by: st.myUser || "الإدارة" });
                    showToast(`⚡ مضاعف الأصوات الآن: ×${m}`, 3000, "gold");
                });
            });

            document.getElementById("lrca-save-hof").onclick = () => {
                const s = st.state; if (!s) return;
                const counts = computeVoteCounts();
                if (s.tieBreaker && void 0 !== counts[s.tieBreaker]) counts[s.tieBreaker]++;
                if (s.tieBreakerKing && void 0 !== counts[s.tieBreakerKing]) counts[s.tieBreakerKing]++;
                if (s.tieBreakerQueen && void 0 !== counts[s.tieBreakerQueen]) counts[s.tieBreakerQueen]++;
                const all = getApprovedCandidates().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
                const list = "dual" === s.mode ? [all.find(x => "king" === x.role), all.find(x => "queen" === x.role)].filter(Boolean) : all.slice(0, 1);
                if (!list.length) return showToast("لا يوجد فائز لحفظه", 3000, "red");
                list.forEach(w => st.db.ref(`${ROOT}/hall_of_fame`).push({ season: s.season || 1, name: w.displayName || w.username, role: w.role, avatar: w.avatar || "", votes: counts[w.key] || 0, date: Date.now() }));
                this.log("حفظ بقاعة الشرف", list.map(x => x.displayName || x.username).join(" & "));
                showToast("🏆 تم التخليد في قاعة الشرف!", 3500, "gold");
            };

            document.getElementById("lrca-reset-all").onclick = () => {
                if (!confirm("⚠️ إغلاق وتصفير المسابقة الحالية بالكامل؟")) return;
                st.db?.ref(ROOT).update({ state: { status: "idle", season: st.state?.season || 0 }, candidates: null, votes: null }).then(() => { this.log("تصفير المسابقة", "النظام"); showToast("🗑️ تم التصفير"); });
            };

            document.getElementById("lrca-bc-send").onclick = () => {
                const inp = document.getElementById("lrca-bc-inp"), txt = inp.value.trim(), theme = document.getElementById("lrca-bc-th").value;
                if (!txt || !st.db) return alert("اكتب نص البث.");
                st.db.ref(`${ROOT}/broadcast`).set({ text: txt, theme, ts: Date.now(), by: st.myUser || "الإدارة" }).then(() => { this.log("بث فوري", "الجميع", txt); inp.value = ""; showToast("📢 تم البث للجميع"); });
            };

            document.getElementById("lrca-ban-save").onclick = () => {
                const txt = document.getElementById("lrca-ban-txt").value.trim(), th = document.getElementById("lrca-ban-th").value;
                this.patchSettings({ bannerText: txt, bannerTheme: th }, txt ? "📢 تم تحديث الشريط" : "تم إخفاء الشريط");
            };

            // 2. المرشحون
            document.getElementById("lrca-app-all").onclick = () => {
                const up = {}; let cnt = 0;
                Object.entries(st.candidates || {}).forEach(([k, c]) => { if (c && "pending" === c.status) { up[`${k}/status`] = "approved"; cnt++; } });
                if (!cnt) return showToast("لا توجد طلبات معلّقة");
                st.db?.ref(`${ROOT}/candidates`).update(up).then(() => { this.log("اعتماد جماعي", `${cnt} مرشح`); showToast(`✅ تم اعتماد ${cnt} مرشح`); });
            };

            document.getElementById("lrca-mc-add").onclick = () => {
                const u = document.getElementById("lrca-mc-u").value.trim(), key = h.san(u);
                if (!key || !st.db) return alert("أدخل اسم المستخدم.");
                const role = document.getElementById("lrca-mc-r").value, slogan = document.getElementById("lrca-mc-s").value.trim(), av = document.getElementById("lrca-mc-av").value.trim();
                const det = h.detectFromDOM(u) || {};
                st.db.ref(`${ROOT}/candidates/${key}`).set({
                    uid: det.uid || "", username: u, displayName: det.displayName || u, html: det.html || h.esc(u),
                    avatar: av || det.avatar || "", role, slogan, badge: "", frozen: !1, status: "approved", bonusVotes: 0, joinedAt: Date.now()
                }).then(() => {
                    this.log("إضافة مرشح", u, role);
                    ["lrca-mc-u", "lrca-mc-s", "lrca-mc-av"].forEach(id => document.getElementById(id).value = "");
                    showToast(`✅ تمت إضافة (${u})`);
                });
            };

            // 3. الأصوات ومكافحة التلاعب
            document.getElementById("lrca-vq").oninput = () => this.renderVotes();
            document.getElementById("lrca-rev-10m").onclick = () => {
                const cut = Date.now() - 10 * 6e4, up = {}; let cnt = 0;
                Object.entries(st.votes || {}).forEach(([k, v]) => { if (v && (v.ts || 0) >= cut) { up[k] = null; cnt++; } });
                if (!cnt) return showToast("لا توجد أصوات خلال آخر 10 دقائق");
                if (confirm(`سحب (${cnt}) صوت تم إرسالها خلال آخر 10 دقائق؟`)) st.db?.ref(`${ROOT}/votes`).update(up).then(() => { this.log("سحب أصوات آخر 10د", `${cnt} صوت`); showToast(`🧹 تم سحب ${cnt} صوت`); });
            };
            document.getElementById("lrca-rev-cand").onclick = () => {
                const target = prompt("اكتب اسم المستخدم (Username) للمرشح المراد تصفير أصواته:");
                if (!target || !target.trim()) return;
                const key = h.san(target), up = {}; let cnt = 0;
                Object.entries(st.votes || {}).forEach(([k, v]) => { if (v && v.target === key) { up[k] = null; cnt++; } });
                if (!cnt) return showToast("لا توجد أصوات مسجلة لهذا المرشح");
                if (confirm(`تصفير (${cnt}) صوت للمرشح (${target})؟`)) st.db?.ref(`${ROOT}/votes`).update(up).then(() => { this.log("تصفير أصوات مرشح", target, `${cnt}`); showToast(`🗑️ تم حذف ${cnt} صوت`); });
            };
            document.getElementById("lrca-wipe-votes").onclick = () => {
                if (confirm("⚠️ حذف جميع الأصوات في هذا الموسم؟")) st.db?.ref(`${ROOT}/votes`).remove().then(() => { this.log("تصفير كل الأصوات", "الجميع"); showToast("🗑️ تم التصفير"); });
            };

            // 4. الرادار والحظر
            document.getElementById("lrca-clr-pres").onclick = () => st.db?.ref(`${ROOT}/presence`).remove().then(() => showToast("🧹 تم تنظيف الرادار"));
            document.getElementById("lrca-bgo").onclick = () => {
                const u = document.getElementById("lrca-bu").value.trim(), key = h.san(u);
                if (!key || !st.db) return alert("أدخل اسم المستخدم.");
                const scope = document.getElementById("lrca-bs").value, dur = document.getElementById("lrca-bd").value, reason = document.getElementById("lrca-br").value.trim();
                const dMap = { "1h": 36e5, "6h": 216e5, "24h": 864e5, "3d": 2592e5, "7d": 6048e5 };
                const expiresAt = dMap[dur] ? Date.now() + dMap[dur] : null;
                st.db.ref(`${ROOT}/banned/${key}`).set({ name: u, scope, reason, expiresAt, by: st.myUser || "الإدارة", ts: Date.now() }).then(() => {
                    this.log("حظر عضو", u, `${scope} | ${dur}`);
                    document.getElementById("lrca-bu").value = ""; document.getElementById("lrca-br").value = "";
                    showToast(`🚫 تم حظر (${u})`);
                });
            };
            document.getElementById("lrca-cln-bans").onclick = () => {
                const up = {}; let cnt = 0;
                Object.entries(st.banned || {}).forEach(([k, b]) => { if (b && b.expiresAt && Date.now() >= b.expiresAt) { up[k] = null; cnt++; } });
                if (!cnt) return showToast("لا يوجد حظر منتهي");
                st.db?.ref(`${ROOT}/banned`).update(up).then(() => showToast(`🧹 تم تنظيف ${cnt}`));
            };

            // 5. الجوائز والقوانين والترحيب
            document.getElementById("lrca-pz-reset").onclick = () => {
                if (confirm("استعادة قائمة الجوائز الملكية الـ 6 الافتراضية؟")) st.db?.ref(`${ROOT}/prizes`).set(DEFAULT_PRIZES).then(() => showToast("✅ تمت الاستعادة"));
            };
            document.getElementById("lrca-np-add").onclick = () => {
                const title = document.getElementById("lrca-np-t").value.trim(), dur = document.getElementById("lrca-np-d").value.trim(), icon = document.getElementById("lrca-np-i").value.trim() || "fa-crown";
                if (!title) return alert("أدخل عنوان الجائزة.");
                const next = (Array.isArray(st.prizes) ? st.prizes : DEFAULT_PRIZES).slice();
                next.push({ title, dur, icon });
                st.db?.ref(`${ROOT}/prizes`).set(next).then(() => {
                    document.getElementById("lrca-np-t").value = ""; document.getElementById("lrca-np-d").value = "";
                    this.log("إضافة جائزة", title); showToast("🎁 تمت إضافة الجائزة");
                });
            };
            document.getElementById("lrca-rules-save").onclick = () => {
                this.patchSettings({ rulesText: document.getElementById("lrca-rules-ta").value.trim() }, "✅ تم حفظ القوانين");
            };
            document.getElementById("lrca-welc-save").onclick = () => {
                const txt = document.getElementById("lrca-welc-ta").value.trim();
                this.patchSettings({ welcomeText: txt, welcomeVersion: Date.now() }, txt ? "✅ تم تفعيل رسالة الترحيب" : "تم التعطيل");
            };
            document.getElementById("lrca-welc-off").onclick = () => {
                document.getElementById("lrca-welc-ta").value = "";
                this.patchSettings({ welcomeText: "" }, "تم تعطيل رسالة الترحيب");
            };

            // 6. الصلاحيات والـ VIP والنسخ الاحتياطي
            document.getElementById("lrca-s-save").onclick = () => {
                this.patchSettings({
                    enabled: document.getElementById("lrca-s-en").checked,
                    hideLiveVotes: document.getElementById("lrca-s-hide").checked,
                    requireApproval: document.getElementById("lrca-s-app").checked,
                    allowSelfVote: document.getElementById("lrca-s-self").checked,
                    allowVoteChange: document.getElementById("lrca-s-chg").checked,
                    allowGuestsVote: document.getElementById("lrca-s-gst").checked,
                    showToastAd: document.getElementById("lrca-s-ad").checked,
                    maxCandidates: Math.max(0, parseInt(document.getElementById("lrca-s-maxc").value, 10) || 0),
                    vipVoteWeight: Math.max(1, parseInt(document.getElementById("lrca-s-vipw").value, 10) || 2),
                    disabledMsg: document.getElementById("lrca-s-msg").value.trim() || DEFAULT_SETTINGS.disabledMsg
                }, "✅ تم حفظ الإعدادات");
            };
            document.getElementById("lrca-vip-add").onclick = () => {
                const inp = document.getElementById("lrca-vip-inp"), u = inp.value.trim(); if (!u) return;
                inp.value = "";
                this.patchSettings({ vipUsers: Array.from(new Set([...(st.settings.vipUsers || []), u])) }, `⭐ أضيف (${u}) لـ VIP`);
            };
            document.getElementById("lrca-sa-add").onclick = () => {
                if (!h.isSuperAdmin()) return alert("إضافة المشرفين المساعدين للمالك فقط.");
                const inp = document.getElementById("lrca-sa-inp"), u = inp.value.trim(); if (!u) return;
                inp.value = "";
                this.patchSettings({ subAdmins: Array.from(new Set([...(st.settings.subAdmins || []), u])) }, `🛡️ أضيف (${u}) كمشرف`);
            };
            document.getElementById("lrca-exp").onclick = () => {
                const blob = new Blob([JSON.stringify({ state: st.state, settings: st.settings, prizes: st.prizes, candidates: st.candidates, votes: st.votes, banned: st.banned, hall_of_fame: st.hof }, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob), a = document.createElement("a");
                a.href = url; a.download = `layl-royal-contest-${new Date().toISOString().split("T")[0]}.json`;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            };
            document.getElementById("lrca-imp").onclick = () => document.getElementById("lrca-imp-file").click();
            document.getElementById("lrca-imp-file").onchange = ev => {
                const f = ev.target.files?.[0]; ev.target.value = "";
                if (!f || !st.db) return;
                const rd = new FileReader();
                rd.onload = () => {
                    try {
                        const p = JSON.parse(rd.result);
                        if (!p || "object" !== typeof p || !confirm("استعادة بيانات المسابقة؟")) return;
                        st.db.ref(ROOT).update(p).then(() => showToast("✅ تمت الاستعادة", 3000, "gold"));
                    } catch (e) { alert("❌ ملف JSON غير صالح."); }
                };
                rd.readAsText(f);
            };

            // 7. التحليلات وقاعة الشرف والسجل
            document.getElementById("lrca-copy-top").onclick = () => {
                const counts = computeVoteCounts();
                const top = getApprovedCandidates().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0)).slice(0, 5);
                if (!top.length) return showToast("لا يوجد مرشحون بعد");
                const txt = `👑 الترتيب المباشر — ${st.state?.title || "ملك وملكة الشات"} 👑\n\n` + top.map((c, i) => `${i + 1}. ${"queen" === c.role ? "👸" : "👑"} ${c.displayName || c.username} — (${counts[c.key] || 0} صوت)`).join("\n") + "\n\n🗳️ صوّت الآن لمرشحك المفضل!";
                h.copy(txt, "📋 تم نسخ الترتيب المباشر للشات!");
            };
            document.getElementById("lrca-copy-promo").onclick = () => {
                const list = Array.isArray(st.prizes) && st.prizes.length ? st.prizes : DEFAULT_PRIZES;
                const txt = `👑✨ مسابقة ملك وملكة شات ليل ✨👑\n\n🎁 الجوائز الملكية:\n` + list.map((p, i) => `${i + 1}. ${p.title}${p.dur ? ` (${p.dur})` : ""}`).join("\n") + "\n\n🔥 ادخل من قائمة الإضافات وشارك الآن!";
                h.copy(txt, "📋 تم نسخ إعلان الجوائز للشات!");
            };
            document.getElementById("lrca-hf-add").onclick = () => {
                const name = document.getElementById("lrca-hf-n").value.trim(), role = document.getElementById("lrca-hf-r").value, votes = parseInt(document.getElementById("lrca-hf-v").value, 10) || 0;
                if (!name || !st.db) return alert("أدخل اسم الفائز.");
                st.db.ref(`${ROOT}/hall_of_fame`).push({ season: st.state?.season || 1, name, role, avatar: "", votes, date: Date.now() }).then(() => {
                    document.getElementById("lrca-hf-n").value = ""; document.getElementById("lrca-hf-v").value = "";
                    this.log("إضافة لقاعة الشرف", name); showToast("🏆 تمت الإضافة");
                });
            };
            document.getElementById("lrca-log-q").oninput = () => this.renderLogs();
            document.getElementById("lrca-clr-logs").onclick = () => { if (confirm("مسح سجل العمليات؟")) st.db?.ref(`${ROOT}/logs`).remove().then(() => { st.logs = []; this.renderLogs(); }); };
        },

        refresh() {
            if (!document.getElementById("lrc-admin-modal")) return;
            const info = getPhaseInfo();
            const phMap = { idle: "متوقفة", nomination: "الترشيح", voting: "التصويت", tiebreaker: "تعادل", results: "النتائج" };
            const phEl = document.getElementById("lrca-st-ph"); if (phEl) phEl.textContent = (info.paused ? "⏸️ " : "") + (phMap[info.phase] || info.phase);
            const cdEl = document.getElementById("lrca-cur-cd"); if (cdEl) cdEl.textContent = info.remaining ? h.fmtTime(info.remaining) : "--:--:--";
            const mtEl = document.getElementById("lrca-mult-tag"); if (mtEl) { const m = Math.max(1, Number(st.state?.voteMultiplier) || 1); mtEl.textContent = m > 1 ? `⚡ ×${m} نشط` : "×1 عادي"; }

            const cands = Object.values(st.candidates || {});
            const pendCnt = cands.filter(c => c && "pending" === c.status).length;
            const onCnt = Object.values(st.presence || {}).filter(x => x && Date.now() - (x.ts || 0) < 18e5).length;
            document.getElementById("lrca-st-cn").textContent = cands.length;
            document.getElementById("lrca-st-vt").textContent = Object.keys(st.votes || {}).length;
            document.getElementById("lrca-st-on").textContent = onCnt;
            const pb = document.getElementById("lrca-pbdg");
            if (pb) { pb.textContent = pendCnt; pb.style.display = pendCnt > 0 ? "inline-block" : "none"; }

            if ("cands" === st.adminTab) this.renderCands();
            else if ("votes" === st.adminTab) this.renderVotes();
            else if ("radar" === st.adminTab) { this.renderPresence(); this.renderBans(); }
            else if ("prizes" === st.adminTab) this.renderPrizesAdmin();
            else if ("settings" === st.adminTab) { this.renderVipList(); this.renderSubAdminList(); }
            else if ("analytics" === st.adminTab) { this.renderAnalytics(); this.renderHof(); this.renderLogs(); }
        },

        renderCands() {
            const c = document.getElementById("lrca-cands-list"); if (!c) return;
            const counts = computeVoteCounts();
            const list = Object.entries(st.candidates || {}).sort((a, b) => ("pending" === a[1].status ? -1 : 1) - ("pending" === b[1].status ? -1 : 1) || (counts[b[0]] || 0) - (counts[a[0]] || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:18px;font-size:12px;">لا يوجد مرشحون حالياً.</div>'; return; }
            c.innerHTML = list.map(([k, it]) => {
                const pend = "pending" === it.status, frz = Boolean(it.frozen);
                return `<div class="lrca-card" style="${pend ? "border-color:#f59e0b;" : frz ? "border-color:#38bdf8;" : ""}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;">
                        <b style="font-size:12.5px;">${"queen" === it.role ? "👸" : "👑"} ${h.esc(it.displayName || it.username)} <span style="color:#64748b;font-size:10px;">(@${h.esc(it.username)})</span></b>
                        <div class="lrca-row" style="gap:4px;">
                            ${frz ? '<span class="lrca-tag lrca-t-blue">❄️ مجمد</span>' : ""}
                            ${it.badge ? `<span class="lrca-tag lrca-t-gold">${h.esc(it.badge)}</span>` : ""}
                            <span class="lrca-tag ${pend ? "lrca-t-red" : "lrca-t-green"}">${pend ? "⏳ معلق" : "✅ معتمد"}</span>
                            <span class="lrca-tag lrca-t-gold">${counts[k] || 0} صوت</span>
                        </div>
                    </div>
                    ${it.slogan ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:7px;">«${h.esc(it.slogan)}»</div>` : ""}
                    <div class="lrca-row" style="gap:4px;">
                        ${pend ? `<button type="button" class="lrca-btn lrca-b-ok lrca-mini lrca-c-app" data-k="${h.esc(k)}">اعتماد ✓</button>` : ""}
                        <button type="button" class="lrca-btn lrca-b-info lrca-mini lrca-c-ed" data-k="${h.esc(k)}">شعار</button>
                        <button type="button" class="lrca-btn lrca-b-dark lrca-mini lrca-c-bdg" data-k="${h.esc(k)}">شارة ⭐</button>
                        <button type="button" class="lrca-btn lrca-b-dark lrca-mini lrca-c-rol" data-k="${h.esc(k)}">اللقب</button>
                        <button type="button" class="lrca-btn lrca-b-warn lrca-mini lrca-c-adj" data-k="${h.esc(k)}">+/-</button>
                        <button type="button" class="lrca-btn ${frz ? "lrca-b-ok" : "lrca-b-info"} lrca-mini lrca-c-frz" data-k="${h.esc(k)}">${frz ? "فك التجميد" : "تجميد ❄️"}</button>
                        <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-c-del" data-k="${h.esc(k)}" style="margin-right:auto;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            }).join("");

            c.querySelectorAll(".lrca-c-app").forEach(b => b.onclick = () => st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/status`).set("approved").then(() => { this.log("اعتماد مرشح", b.dataset.k); showToast("✅ تم الاعتماد"); }));
            c.querySelectorAll(".lrca-c-ed").forEach(b => b.onclick = () => { const nv = prompt("الشعار الجديد:", st.candidates[b.dataset.k]?.slogan || ""); if (null !== nv) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/slogan`).set(nv.trim().slice(0, 90)); });
            c.querySelectorAll(".lrca-c-bdg").forEach(b => b.onclick = () => { const nv = prompt("شارة التمييز (اتركه فارغاً للإزالة):", st.candidates[b.dataset.k]?.badge || ""); if (null !== nv) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/badge`).set(nv.trim().slice(0, 25)); });
            c.querySelectorAll(".lrca-c-rol").forEach(b => b.onclick = () => { const cur = st.candidates[b.dataset.k]?.role; st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/role`).set("queen" === cur ? "king" : "queen"); });
            c.querySelectorAll(".lrca-c-frz").forEach(b => b.onclick = () => { const cur = Boolean(st.candidates[b.dataset.k]?.frozen); st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/frozen`).set(!cur).then(() => { this.log(cur ? "فك تجميد مرشح" : "تجميد مرشح", b.dataset.k); showToast(cur ? "✅ تم فك التجميد" : "❄️ تم تجميد التصويت للمرشح"); }); });
            c.querySelectorAll(".lrca-c-adj").forEach(b => b.onclick = () => { const cur = Number(st.candidates[b.dataset.k]?.bonusVotes) || 0, val = parseInt(prompt("أصوات إضافية (موجب أو سالب):", String(cur)), 10); if (!isNaN(val)) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/bonusVotes`).set(val).then(() => { this.log("تعديل أصوات", b.dataset.k, String(val)); showToast("✅ تم التعديل"); }); });
            c.querySelectorAll(".lrca-c-del").forEach(b => b.onclick = () => { if (confirm(`استبعاد وحذف (${b.dataset.k})؟`)) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}`).remove().then(() => { this.log("استبعاد مرشح", b.dataset.k); showToast("🗑️ تم الاستبعاد"); }); });
        },

        renderVotes() {
            const c = document.getElementById("lrca-votes-list"); if (!c) return;
            const q = (document.getElementById("lrca-vq")?.value || "").trim().toLowerCase();
            const list = Object.entries(st.votes || {})
                .map(([k, v]) => Object.assign({ k, targetName: st.candidates[v.target]?.displayName || v.target }, v))
                .filter(x => !q || `${x.voterName} ${x.targetName} ${x.k}`.toLowerCase().includes(q))
                .sort((a, b) => (b.ts || 0) - (a.ts || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا توجد أصوات.</div>'; return; }
            c.innerHTML = list.slice(0, 140).map(v => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <div style="flex:1;min-width:0;"><b>${h.esc(v.voterName || v.k)}</b> ➔ <b style="color:#D4AF37;">${h.esc(v.targetName)}</b> ${v.weight > 1 ? `<span class="lrca-tag lrca-t-gold">×${v.weight}</span>` : ""} <span style="color:#64748b;font-size:10px;">(${h.fmtDate(v.ts)})</span></div>
                    <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-vdel" data-k="${h.esc(v.k)}" style="padding:3px 7px;">سحب</button>
                </div>`).join("");
            c.querySelectorAll(".lrca-vdel").forEach(b => b.onclick = () => { if (confirm("سحب هذا الصوت؟")) st.db?.ref(`${ROOT}/votes/${b.dataset.k}`).remove().then(() => { this.log("سحب صوت", b.dataset.k); showToast("🗑️ تم السحب"); }); });
        },

        renderPresence() {
            const c = document.getElementById("lrca-pres-list"); if (!c) return;
            const active = Object.entries(st.presence || {}).filter(([, v]) => v && Date.now() - (v.ts || 0) < 18e5);
            if (!active.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;font-size:11.5px;padding:8px;">لا يوجد أعضاء داخل المسابقة حالياً.</div>'; return; }
            c.innerHTML = active.map(([k, v]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:5px;">
                    <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b style="color:#34d399;">●</b> <b>${h.esc(v.name || k)}</b> <span style="color:#94a3b8;">— ${h.esc(v.status || "يتصفح")}</span></div>
                    <div class="lrca-row" style="gap:3px;flex-shrink:0;">
                        <button type="button" class="lrca-btn lrca-b-info lrca-mini lrca-pmsg" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-bell"></i></button>
                        <button type="button" class="lrca-btn lrca-b-warn lrca-mini lrca-pkick" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-sign-out-alt"></i></button>
                        <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-pban" data-u="${h.esc(v.name || k)}" style="padding:3px 6px;">حظر</button>
                    </div>
                </div>`).join("");
            c.querySelectorAll(".lrca-pmsg").forEach(b => b.onclick = () => { const m = prompt("رسالة تنبيه للعضو:"); if (m && m.trim()) this.sendUserCmd(b.dataset.k, "alert", m.trim()); });
            c.querySelectorAll(".lrca-pkick").forEach(b => b.onclick = () => { if (confirm("إخراج العضو من المسابقة الآن؟")) this.sendUserCmd(b.dataset.k, "kick", "تم إغلاق نافذة المسابقة من قبل الإدارة."); });
            c.querySelectorAll(".lrca-pban").forEach(b => b.onclick = () => { const inp = document.getElementById("lrca-bu"); if (inp) { inp.value = b.dataset.u; inp.focus(); } });
        },

        renderBans() {
            const c = document.getElementById("lrca-bans-list"); if (!c) return;
            const list = Object.entries(st.banned || {});
            const sMap = { all: "كامل", nom: "ترشيح فقط", vote: "تصويت فقط" };
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا يوجد محظورون.</div>'; return; }
            c.innerHTML = list.map(([k, b]) => {
                const exp = b.expiresAt && Date.now() >= b.expiresAt;
                return `<div class="lrca-card" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div><b style="font-size:12.5px;">${h.esc(b.name || k)}</b> <span class="lrca-tag lrca-t-red">${sMap[b.scope] || "كامل"}</span> <span class="lrca-tag lrca-t-blue">${exp ? "منتهي" : h.fmtRem(b.expiresAt)}</span><div style="font-size:10.5px;color:#94a3b8;">${h.esc(b.reason || "بدون سبب")}</div></div>
                    <button type="button" class="lrca-btn lrca-b-ok lrca-mini lrca-unb" data-k="${h.esc(k)}">فك الحظر</button>
                </div>`;
            }).join("");
            c.querySelectorAll(".lrca-unb").forEach(b => b.onclick = () => st.db?.ref(`${ROOT}/banned/${b.dataset.k}`).remove().then(() => { this.log("فك حظر", b.dataset.k); showToast("✅ تم فك الحظر"); }));
        },

        renderPrizesAdmin() {
            const c = document.getElementById("lrca-pz-list"); if (!c) return;
            const list = Array.isArray(st.prizes) && st.prizes.length ? st.prizes : DEFAULT_PRIZES;
            c.innerHTML = list.map((p, i) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.24);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <div style="flex:1;min-width:0;"><i class="fas ${h.esc(p.icon || "fa-crown")}" style="color:#D4AF37;margin-left:5px;"></i><b>${h.esc(p.title)}</b> <span style="color:#94a3b8;">(${h.esc(p.dur || "-")})</span></div>
                    <div class="lrca-row" style="gap:3px;">
                        ${i > 0 ? `<button type="button" class="lrca-btn lrca-b-dark lrca-mini lrca-pz-up" data-i="${i}" style="padding:3px 6px;"><i class="fas fa-arrow-up"></i></button>` : ""}
                        <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-pz-del" data-i="${i}" style="padding:3px 6px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`).join("");
            c.querySelectorAll(".lrca-pz-up").forEach(b => b.onclick = () => { const a = list.slice(), i = Number(b.dataset.i); [a[i - 1], a[i]] = [a[i], a[i - 1]]; st.db?.ref(`${ROOT}/prizes`).set(a); });
            c.querySelectorAll(".lrca-pz-del").forEach(b => b.onclick = () => { const a = list.slice(); a.splice(Number(b.dataset.i), 1); st.db?.ref(`${ROOT}/prizes`).set(a); });
        },

        renderVipList() {
            const c = document.getElementById("lrca-vip-list"); if (!c) return;
            const list = st.settings.vipUsers || [];
            c.innerHTML = list.length ? list.map((u, i) => `<span class="lrca-tag lrca-t-gold" style="margin:2px;">⭐ ${h.esc(u)} <i class="fas fa-times lrca-vrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i></span>`).join("") : '<span style="color:#64748b;font-size:11px;">لا يوجد أعضاء VIP.</span>';
            c.querySelectorAll(".lrca-vrm").forEach(el => el.onclick = () => { const n = (st.settings.vipUsers || []).slice(); n.splice(Number(el.dataset.i), 1); this.patchSettings({ vipUsers: n }, "تمت الإزالة"); });
        },

        renderSubAdminList() {
            const c = document.getElementById("lrca-sa-list"); if (!c) return;
            const list = st.settings.subAdmins || [];
            c.innerHTML = list.length ? list.map((u, i) => `<span class="lrca-tag lrca-t-blue" style="margin:2px;">🛡️ ${h.esc(u)} ${h.isSuperAdmin() ? `<i class="fas fa-times lrca-srm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i>` : ""}</span>`).join("") : '<span style="color:#64748b;font-size:11px;">لا يوجد مشرفون مساعدون.</span>';
            c.querySelectorAll(".lrca-srm").forEach(el => el.onclick = () => { if (!h.isSuperAdmin()) return; const n = (st.settings.subAdmins || []).slice(); n.splice(Number(el.dataset.i), 1); this.patchSettings({ subAdmins: n }, "تمت الإزالة"); });
        },

        renderAnalytics() {
            const box = document.getElementById("lrca-an-box"); if (!box) return;
            const counts = computeVoteCounts(), cands = getApprovedCandidates();
            const kCnt = cands.filter(c => "king" === c.role).length, qCnt = cands.filter(c => "queen" === c.role).length;
            const totW = Object.values(counts).reduce((a, b) => a + b, 0);
            const top = cands.slice().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0)).slice(0, 5);
            box.innerHTML = `
                <div class="lrca-g3" style="margin-bottom:8px;">
                    <div class="lrca-stat"><div class="lrca-stat-v">${kCnt} / ${qCnt}</div><div class="lrca-stat-l">ملوك / ملكات</div></div>
                    <div class="lrca-stat"><div class="lrca-stat-v">${Object.keys(st.votes || {}).length}</div><div class="lrca-stat-l">مصوّتون</div></div>
                    <div class="lrca-stat"><div class="lrca-stat-v">${totW}</div><div class="lrca-stat-l">إجمالي النقاط</div></div>
                </div>
                ${top.map((c, i) => `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(0,0,0,.22);border-radius:7px;margin-bottom:3px;font-size:11.5px;"><span>${i + 1}. ${"queen" === c.role ? "👸" : "👑"} <b>${h.esc(c.displayName || c.username)}</b></span><span class="lrca-tag lrca-t-gold">${counts[c.key] || 0}</span></div>`).join("")}`;
        },

        renderHof() {
            const c = document.getElementById("lrca-hof-list"); if (!c) return;
            const list = Object.entries(st.hof || {}).sort((a, b) => (b[1].date || 0) - (a[1].date || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:12px;">قاعة الشرف فارغة.</div>'; return; }
            c.innerHTML = list.map(([k, w]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;">
                    <span>${"queen" === w.role ? "👸" : "👑"} <b>${h.esc(w.name)}</b> (موسم #${h.esc(w.season || 1)} • ${w.votes || 0} صوت)</span>
                    <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-hdel" data-k="${h.esc(k)}" style="padding:3px 7px;"><i class="fas fa-trash"></i></button>
                </div>`).join("");
            c.querySelectorAll(".lrca-hdel").forEach(b => b.onclick = () => { if (confirm("حذف من قاعة الشرف؟")) st.db?.ref(`${ROOT}/hall_of_fame/${b.dataset.k}`).remove(); });
        },

        renderLogs() {
            const c = document.getElementById("lrca-logs-list"); if (!c) return;
            const q = (document.getElementById("lrca-log-q")?.value || "").trim().toLowerCase();
            const list = st.logs.filter(x => !q || `${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:12px;">لا توجد سجلات.</div>'; return; }
            c.innerHTML = list.map(x => `
                <div style="padding:6px 9px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;">
                    <div style="display:flex;justify-content:space-between;"><span class="lrca-tag lrca-t-gold">${h.esc(x.action)}</span><span style="font-size:10px;color:#94a3b8;">${h.fmtDate(x.ts)}</span></div>
                    <div style="margin-top:2px;"><b style="color:#D4AF37;">${h.esc(x.admin)}</b> ➔ <b style="color:#38bdf8;">${h.esc(x.target)}</b> ${x.details ? `<span style="color:#94a3b8;">(${h.esc(x.details)})</span>` : ""}</div>
                </div>`).join("");
        }
    };

    // ==================== الواجهة العامة ====================
    window.LaylRoyalContest = {
        open() {
            if (!h.isAdmin() && !h.isVip() && !1 === st.settings.enabled) return alert(st.settings.disabledMsg || DEFAULT_SETTINGS.disabledMsg);
            const ban = h.getMyBan();
            if (!h.isAdmin() && ban && "all" === ban.scope) return alert(`تم منعك من المسابقة 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
            ensureUserModal();
            document.getElementById("lrc-live-ad")?.classList.remove("show");
            document.getElementById("lrc-mini-fab").style.display = "none";
            document.getElementById("lrc-modal").classList.add("open");
            setPresence("يتصفح المسابقة");
            maybeShowWelcome();
            renderMainBody();
            startCountdownLoop();
        },
        close() {
            clearInterval(st.timerId);
            document.getElementById("lrc-modal")?.classList.remove("open");
            const fab = document.getElementById("lrc-mini-fab");
            if (fab) fab.style.display = "none";
            setPresence(null);
        },
        minimize() {
            document.getElementById("lrc-modal")?.classList.remove("open");
            const fab = document.getElementById("lrc-mini-fab");
            if (fab) fab.style.display = "flex";
        },
        restore() { this.open(); },
        openAdmin: () => royalAdmin.open()
    };

    // ==================== ربط Firebase والهوية و LaylMenu ====================
    function bindCmdListener() {
        if (!st.db) return;
        const k = h.myKey();
        if (!k || st.cmdUser === k) return;
        st.cmdRef?.off();
        st.cmdUser = k;
        st.cmdRef = st.db.ref(`${ROOT}/cmds/${k}`);
        st.cmdRef.on("value", sn => {
            const v = sn.val(); if (!v || !v.cmd) return;
            sn.ref.remove().catch(() => {});
            if (v.ts && Date.now() - v.ts > 6e4) return;
            if ("kick" === v.cmd && !h.isAdmin()) { window.LaylRoyalContest.close(); alert(v.text || "تم إخراجك من المسابقة."); }
            else if ("alert" === v.cmd && v.text) showToast(`📩 تنبيه الإدارة: ${v.text}`, 8000, "gold");
        });
    }

    function initFirebase() {
        if ("undefined" !== typeof firebase && firebase.database) {
            if (!firebase.apps.length) firebase.initializeApp(FB_CFG);
            st.db = firebase.database();

            st.db.ref("admins").on("value", sn => {
                st.admins = Object.keys(sn.val() || {});
                window.LaylMenu?.refresh?.();
                if (!h.isAdmin()) royalAdmin.close();
            });
            st.db.ref(`${ROOT}/settings`).on("value", sn => {
                const v = sn.val();
                st.settings = v && "object" === typeof v ? Object.assign({}, DEFAULT_SETTINGS, v) : Object.assign({}, DEFAULT_SETTINGS);
                window.LaylMenu?.refresh?.();
                renderMainBody();
                royalAdmin.refresh();
            });
            st.db.ref(`${ROOT}/prizes`).on("value", sn => {
                const v = sn.val();
                st.prizes = Array.isArray(v) && v.length ? v : DEFAULT_PRIZES.slice();
                royalAdmin.refresh();
            });
st.db.ref(`${ROOT}/state`).on("value", sn => {
    st.state = sn.val() || null;
    announcePhase(getPhaseInfo().phase);
    renderMainBody();
    royalAdmin.refresh();
});
            st.db.ref(`${ROOT}/candidates`).on("value", sn => { st.candidates = sn.val() || {}; renderMainBody(); royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/votes`).on("value", sn => { st.votes = sn.val() || {}; renderMainBody(); royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/banned`).on("value", sn => { st.banned = sn.val() || {}; royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/hall_of_fame`).on("value", sn => { st.hof = sn.val() || {}; royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/broadcast`).on("value", sn => {
                const v = sn.val();
                if (v && v.text && v.ts > st.bootTs && Date.now() - v.ts < 25000) showBannerToastAd(v.text, v.theme || "gold");
            });
            bindCmdListener();
        } else if (++st.fbTries < 50) {
            setTimeout(initFirebase, 500);
        }
    }

    const syncLogin = id => {
        const val = document.getElementById(id)?.value?.trim();
        if (val && val !== st.myUser) {
            st.myUser = val;
            try { localStorage.setItem("pc_username", val); } catch (e) {}
            window.LaylMenu?.refresh?.();
            bindCmdListener();
        }
    };
    document.addEventListener("click", e => {
        if (e.target.closest("#member-login-btn")) syncLogin("member-username");
        if (e.target.closest("#register-btn")) syncLogin("register-username");
        if (e.target.closest('button[onclick*="renderAddons"]')) setTimeout(pinContestBtnIfBlock, 120);
    });

    document.addEventListener("submit", e => {
        if ("member-login-form" === e.target?.id) syncLogin("member-username");
        if ("register-form" === e.target?.id) syncLogin("register-username");
    });

    const menuItems = [
        {
            id: "btn-layl-royal-contest",
            text: "مسابقة ملك وملكة الشات",
            icon: "fas fa-crown",
            iconColor: "#D4AF37",
            iconBg: "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(181,146,38,0.1))",
            bold: !0,
            onClick: () => window.LaylRoyalContest.open()
        },
        {
            id: "btn-layl-royal-admin",
            text: "لوحة تحكم ملك/ملكة الشات",
            icon: "fas fa-crown",
            iconColor: "#fbbf24",
            iconBg: "linear-gradient(135deg, #422006, #a16207)",
            condition: () => h.isAdmin(),
            onClick: () => royalAdmin.open()
        }
    ];

    menuItems.forEach(item => {
        if (window.LaylMenu) window.LaylMenu.register(item);
        else (window.__laylMenuQueue = window.__laylMenuQueue || []).push(item);
    });

    setTimeout(pinContestBtnIfBlock, 900);
    initFirebase();
}();
