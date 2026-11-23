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

    const DEFAULT_SETTINGS = {
        enabled: !0,
        disabledMsg: "مسابقة ملك وملكة الشات متوقفة مؤقتاً للصيانة 👑",
        allowGuestsVote: !1,
        allowSelfVote: !1,
        allowVoteChange: !1,
        requireApproval: !1,
        hideLiveVotes: !1,
        showToastAd: !0,
        bannerText: "",
        bannerTheme: "gold"
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
        candidates: {},
        votes: {},
        banned: {},
        hof: {},
        logs: [],
        logsRef: null,
        uiBuilt: !1,
        adminBuilt: !1,
        adminTab: "control",
        voteFilter: "all",
        voteSearch: "",
        lastPhaseAnnounced: null,
        bootTs: Date.now(),
        timerId: null,
        toastTimer: null,
        fbTries: 0,
        confettiFiredKey: null
    };

    try {
        st.myUser = localStorage.getItem("pc_username") || null;
        st.myUid = localStorage.getItem("pc_userid") || null;
        st.myHtml = localStorage.getItem("pc_userhtml") || null;
    } catch (e) {}

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
        isAdmin() {
            const u = st.myUser;
            if (!u || !st.admins.length) return !1;
            const s = h.san(u);
            return st.admins.includes(u) || (s && st.admins.includes(s));
        },
        myKey() { return h.san(st.myUser || st.myUid || ""); },
        getMyBan() {
            const k = h.myKey();
            return (k && st.banned && st.banned[k]) ? st.banned[k] : null;
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

    function computeVoteCounts() {
        const counts = {};
        Object.keys(st.candidates || {}).forEach(k => {
            const c = st.candidates[k];
            if (c) counts[k] = Number(c.bonusVotes) || 0;
        });
        Object.values(st.votes || {}).forEach(v => {
            if (v && v.target && void 0 !== counts[v.target]) counts[v.target]++;
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

    function showToast(msg, ms = 4000, theme = "") {
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

    function showBannerToastAd(msg) {
        if (!1 === st.settings.showToastAd) return;
        ensureBaseStyles();
        let ad = document.getElementById("lrc-live-ad");
        if (!ad) {
            ad = document.createElement("div");
            ad.id = "lrc-live-ad";
            ad.innerHTML = `<span id="lrc-ad-msg"></span><div class="lrc-ad-btns"><button type="button" class="lrc-ad-go" id="lrc-ad-join">الدخول 👑</button><button type="button" class="lrc-ad-skip" id="lrc-ad-hide">تخطي</button></div>`;
            document.body.appendChild(ad);
            document.getElementById("lrc-ad-join").onclick = () => { ad.classList.remove("show"); window.LaylRoyalContest.open(); };
            document.getElementById("lrc-ad-hide").onclick = () => ad.classList.remove("show");
        }
        document.getElementById("lrc-ad-msg").textContent = msg;
        ad.classList.add("show");
        setTimeout(() => ad.classList.remove("show"), 14000);
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
        .lrc-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.15rem;color:#D4AF37;text-shadow:0 2px 10px rgba(212,175,55,.35)}
        .lrc-hbtns{display:flex;gap:7px;align-items:center;flex-shrink:0}
        .lrc-ibtn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;height:34px;padding:0 11px;border-radius:10px;cursor:pointer;font-size:.84rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;transition:.2s;font-family:inherit}
        .lrc-ibtn:hover{background:rgba(212,175,55,.2);border-color:#D4AF37;color:#fff}
        .lrc-ibtn.sq{width:34px;padding:0;justify-content:center}
        .lrc-ibtn.x:hover{background:#ef4444;border-color:#ef4444}
        .lrc-banner{margin:10px 18px 0;padding:10px 14px;border-radius:12px;background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.38);color:#fde68a;font-size:.88rem;font-weight:700;display:none;align-items:center;gap:8px;flex-shrink:0}
        .lrc-banner.th-red{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.4);color:#fecaca}
        .lrc-banner.th-blue{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.4);color:#bfdbfe}
        .lrc-body{flex:1;overflow-y:auto;padding:18px 20px 26px;-webkit-overflow-scrolling:touch}
        .lrc-body::-webkit-scrollbar{width:6px}
        .lrc-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lrc-hero{text-align:center;padding:18px 16px;background:radial-gradient(circle at top,rgba(212,175,55,.16),transparent 70%);border:1px solid rgba(212,175,55,.22);border-radius:18px;margin-bottom:16px}
        .lrc-hero h2{margin:6px 0 8px;font-size:1.45rem;font-weight:900;background:linear-gradient(135deg,#fde68a,#D4AF37,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lrc-hero p{margin:0 auto;max-width:560px;color:#cbd5e1;font-size:.9rem;line-height:1.65}
        .lrc-timer{display:inline-flex;align-items:center;gap:8px;margin-top:12px;background:rgba(0,0,0,.5);border:1px solid rgba(212,175,55,.45);color:#fbbf24;padding:8px 18px;border-radius:30px;font-family:monospace;font-size:1.1rem;font-weight:900;letter-spacing:1px;direction:ltr}
        .lrc-btn{background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;border:none;padding:11px 20px;border-radius:12px;font-weight:900;font-size:.95rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:.2s;font-family:inherit;box-shadow:0 6px 20px rgba(212,175,55,.25)}
        .lrc-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}
        .lrc-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .lrc-btn-out{background:rgba(255,255,255,.06);color:#fde68a;border:1px solid rgba(212,175,55,.4);box-shadow:none}
        .lrc-btn-out:hover{background:rgba(212,175,55,.15)}
        .lrc-btn-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;box-shadow:0 6px 18px rgba(239,68,68,.25)}
        .lrc-form{background:rgba(255,255,255,.03);border:1px solid rgba(212,175,55,.25);border-radius:16px;padding:16px;margin-bottom:18px}
        .lrc-roles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
        .lrc-role-opt{background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;cursor:pointer;text-align:center;transition:.2s;color:#cbd5e1;font-weight:800;font-size:.95rem}
        .lrc-role-opt.sel-king{border-color:#38bdf8;background:rgba(56,189,248,.14);color:#7dd3fc;box-shadow:0 0 18px rgba(56,189,248,.2)}
        .lrc-role-opt.sel-queen{border-color:#ec4899;background:rgba(236,72,153,.14);color:#f9a8d4;box-shadow:0 0 18px rgba(236,72,153,.2)}
        .lrc-inp{width:100%;box-sizing:border-box;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.14);color:#fff;padding:11px 14px;border-radius:12px;font-family:inherit;font-size:.92rem;outline:none}
        .lrc-inp:focus{border-color:#D4AF37}
        .lrc-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
        .lrc-fbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;padding:7px 14px;border-radius:20px;font-size:.84rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s}
        .lrc-fbtn.active{background:#D4AF37;color:#111;border-color:#D4AF37}
        .lrc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
        .lrc-card{background:linear-gradient(180deg,rgba(30,33,54,.95),rgba(17,19,32,.98));border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:15px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;transition:.25s}
        .lrc-card:hover{transform:translateY(-3px);border-color:rgba(212,175,55,.45);box-shadow:0 12px 26px rgba(0,0,0,.45)}
        .lrc-card.voted{border-color:#10b981;box-shadow:0 0 22px rgba(16,185,129,.22)}
        .lrc-card.king-card{border-top:3px solid #38bdf8}
        .lrc-card.queen-card{border-top:3px solid #ec4899}
        .lrc-role-tag{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:12px;font-size:.72rem;font-weight:800}
        .lrc-role-tag.king{background:rgba(56,189,248,.18);color:#7dd3fc;border:1px solid rgba(56,189,248,.35)}
        .lrc-role-tag.queen{background:rgba(236,72,153,.18);color:#f9a8d4;border:1px solid rgba(236,72,153,.35)}
        .lrc-rank-num{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.45);color:#D4AF37;font-size:.78rem;font-weight:900;padding:3px 8px;border-radius:10px;border:1px solid rgba(212,175,55,.3)}
        .lrc-av{width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:28px;color:#D4AF37;margin:14px 0 10px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
        .lrc-cname{font-size:1rem;font-weight:800;color:#fff;margin-bottom:5px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        .lrc-cname .user-identity-name{color:#fff!important}
        .lrc-slogan{font-size:.82rem;color:#94a3b8;line-height:1.5;min-height:36px;margin-bottom:10px;word-break:break-word}
        .lrc-bar-wrap{width:100%;background:rgba(255,255,255,.07);height:7px;border-radius:10px;overflow:hidden;margin-bottom:6px}
        .lrc-bar-fill{height:100%;background:linear-gradient(90deg,#D4AF37,#f59e0b);border-radius:10px;transition:width .4s ease}
        .lrc-vstat{font-size:.8rem;color:#fde68a;font-weight:700;margin-bottom:10px}
        .lrc-cacts{display:flex;gap:6px;width:100%;margin-top:auto}
        .lrc-podium{background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(20,22,38,.95));border:2px solid #D4AF37;border-radius:20px;padding:24px 18px;text-align:center;position:relative;margin-bottom:18px;box-shadow:0 0 35px rgba(212,175,55,.2)}
        .lrc-podium .lrc-av{width:104px;height:104px;border-width:3px;margin:10px auto 12px;box-shadow:0 0 28px rgba(212,175,55,.55)}
        .lrc-prize-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:10px}
        .lrc-prize-item{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.25);border-radius:14px;padding:11px 13px;text-align:right}
        .lrc-prize-ico{width:38px;height:38px;border-radius:10px;background:rgba(212,175,55,.16);color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
        .lrc-subov{position:fixed;inset:0;background:rgba(4,6,12,.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);direction:rtl;padding:14px}
        .lrc-subbox{background:linear-gradient(180deg,#1a1d32,#0e101d);border:1px solid rgba(212,175,55,.45);border-radius:20px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto;padding:18px;color:#fff;box-shadow:0 25px 60px rgba(0,0,0,.9)}
        .lrc-mini-fab{position:fixed;bottom:95px;right:20px;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;padding:11px 18px;border-radius:30px;font-weight:900;font-size:.88rem;box-shadow:0 10px 25px rgba(0,0,0,.6);display:none;align-items:center;gap:8px;z-index:2147483643;cursor:pointer;direction:rtl;border:2px solid rgba(255,255,255,.3)}
        .lrc-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#121424;border:1px solid #D4AF37;color:#fff;padding:11px 22px;border-radius:30px;font-size:.9rem;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.75);z-index:2147483647;opacity:0;pointer-events:none;transition:all .35s ease;direction:rtl;max-width:90vw;text-align:center}
        .lrc-toast.th-gold{background:linear-gradient(135deg,#2a210a,#121424);color:#fde68a;border-color:#D4AF37}
        .lrc-toast.th-red{background:linear-gradient(135deg,#351015,#121424);color:#fecaca;border-color:#ef4444}
        .lrc-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        #lrc-live-ad{position:fixed;bottom:-120px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1e1b2e,#0f111d);border:1px solid rgba(212,175,55,.55);color:#fff;padding:11px 18px;border-radius:30px;display:flex;align-items:center;gap:12px;z-index:2147483646;opacity:0;visibility:hidden;transition:all .4s cubic-bezier(.2,.8,.2,1);direction:rtl;max-width:92vw;box-shadow:0 12px 30px rgba(0,0,0,.7)}
        #lrc-live-ad.show{bottom:78px;opacity:1;visibility:visible}
        #lrc-ad-msg{font-size:.86rem;font-weight:700;color:#fde68a}
        .lrc-ad-btns{display:flex;gap:6px;flex-shrink:0}
        .lrc-ad-go{background:#D4AF37;color:#111;border:none;padding:6px 13px;border-radius:20px;font-weight:900;font-size:.8rem;cursor:pointer;font-family:inherit}
        .lrc-ad-skip{background:transparent;color:#94a3b8;border:1px solid #475569;padding:6px 11px;border-radius:20px;font-weight:700;font-size:.78rem;cursor:pointer;font-family:inherit}
        @media(max-width:650px){
            .lrc-ov{padding:0}.lrc-shell{max-width:100%;height:100%;max-height:100%;border-radius:0;border:none}
            .lrc-hdr{padding:11px 14px}.lrc-brand{font-size:1rem}.lrc-ibtn span{display:none}.lrc-body{padding:14px}
            .lrc-grid{grid-template-columns:1fr 1fr;gap:10px}.lrc-card{padding:11px}.lrc-av{width:62px;height:62px}
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
                            <button type="button" class="lrc-ibtn" id="lrc-btn-prizes" title="الجوائز"><i class="fas fa-gift" style="color:#ec4899;"></i><span>الجوائز</span></button>
                            <button type="button" class="lrc-ibtn sq" id="lrc-btn-min" title="تصغير"><i class="fas fa-minus"></i></button>
                            <button type="button" class="lrc-ibtn sq x" id="lrc-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div id="lrc-banner" class="lrc-banner"><i class="fas fa-bullhorn"></i><span id="lrc-banner-txt"></span></div>
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

    function openPrizesModal() {
        document.getElementById("lrc-prizes-sub")?.remove();
        const ov = document.createElement("div");
        ov.id = "lrc-prizes-sub";
        ov.className = "lrc-subov";
        ov.innerHTML = `
            <div class="lrc-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.1rem;"><i class="fas fa-gift"></i> جوائز لقب ملك / ملكة الشات 👑</b>
                    <button type="button" class="lrc-ibtn sq x" id="lrc-pz-x"><i class="fas fa-times"></i></button>
                </div>
                <p style="font-size:.86rem;color:#94a3b8;margin:0 0 12px;text-align:center;">يحصل الفائز بلقب ملك أو ملكة شات ليل على كافة المميزات الملكية التالية:</p>
                <div class="lrc-prize-grid" style="grid-template-columns:1fr;">
                    ${DEFAULT_PRIZES.map((p, i) => `
                        <div class="lrc-prize-item">
                            <div class="lrc-prize-ico"><i class="fas ${p.icon}"></i></div>
                            <div style="flex:1;">
                                <div style="font-weight:800;font-size:.92rem;color:#fff;">${i + 1}. ${h.esc(p.title)}</div>
                                <div style="font-size:.78rem;color:#D4AF37;margin-top:2px;">${h.esc(p.dur)}</div>
                            </div>
                        </div>`).join("")}
                </div>
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
                    <b style="color:#D4AF37;font-size:1.1rem;"><i class="fas fa-trophy"></i> قاعة الشرف — ملوك وملكات ليل</b>
                    <button type="button" class="lrc-ibtn sq x" id="lrc-hf-x"><i class="fas fa-times"></i></button>
                </div>
                ${list.length ? list.map(w => `
                    <div class="lrc-prize-item" style="margin-bottom:8px;">
                        ${w.avatar ? `<img src="${h.esc(w.avatar)}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;">` : `<div class="lrc-prize-ico"><i class="fas fa-crown"></i></div>`}
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:900;color:#fff;font-size:.96rem;">${"queen" === w.role ? "👸 ملكة الشات:" : "👑 ملك الشات:"} ${h.esc(w.name)}</div>
                            <div style="font-size:.78rem;color:#D4AF37;margin-top:2px;">الموسم #${h.esc(w.season || 1)} • ${w.votes || 0} صوت • ${h.fmtDate(w.date)}</div>
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
            if (det) {
                st.myUid = det.uid || st.myUid;
                st.myHtml = det.html || st.myHtml;
                st.myAvatar = det.avatar || st.myAvatar;
            }
            return !0;
        }
        const raw = prompt("لتأمين مشاركتك في مسابقة ملك وملكة الشات 👑\nيرجى كتابة اسم المستخدم (Username) الخاص بك في الشات:");
        if (!raw || !raw.trim()) return !1;
        const det = h.detectFromDOM(raw.trim());
        if (!det) {
            alert("عذراً، لم يتم العثور على هذا الاسم في الشات حالياً. تأكد من كتابة اسمك بشكل مطابق تماماً.");
            return !1;
        }
        st.myUser = det.username;
        st.myUid = det.uid;
        st.myHtml = det.html;
        st.myAvatar = det.avatar;
        try {
            localStorage.setItem("pc_username", det.username);
            if (det.uid) localStorage.setItem("pc_userid", det.uid);
            if (det.html) localStorage.setItem("pc_userhtml", det.html);
        } catch (e) {}
        return !0;
    }

    function renderAvatar(av, role) {
        if (av && /^https?:\/\//i.test(av)) return `<img class="lrc-av" src="${h.esc(av)}" alt="">`;
        return `<div class="lrc-av"><i class="fas ${"queen" === role ? "fa-chess-queen" : "fa-crown"}"></i></div>`;
    }

    function renderMainBody() {
        const modal = document.getElementById("lrc-modal");
        if (!modal || !modal.classList.contains("open")) return;
        const body = document.getElementById("lrc-body");
        const hdrTitle = document.getElementById("lrc-hdr-title");
        const banner = document.getElementById("lrc-banner"), bTxt = document.getElementById("lrc-banner-txt");
        if (!body) return;

        if (hdrTitle) hdrTitle.textContent = (st.state && st.state.title) || "مسابقة ملك وملكة الشات";
        if (banner && bTxt) {
            banner.className = "lrc-banner" + (st.settings.bannerTheme && "gold" !== st.settings.bannerTheme ? ` th-${st.settings.bannerTheme}` : "");
            if (st.settings.bannerText) { bTxt.textContent = st.settings.bannerText; banner.style.display = "flex"; }
            else banner.style.display = "none";
        }

        const info = getPhaseInfo();
        const myKey = h.myKey();
        const isAdm = h.isAdmin();

        // 1. IDLE
        if ("idle" === info.phase) {
            body.innerHTML = `
                <div class="lrc-hero">
                    <div style="font-size:48px;color:#D4AF37;">👑</div>
                    <h2>مسابقة ملك وملكة شات ليل</h2>
                    <p>لا توجد جولة نشطة في هذه اللحظة. عند انطلاق الموسم الجديد تبدأ مرحلة <b>الترشيح لمدة يومين</b> تليها مرحلة <b>جمع الأصوات لمدة 3 أيام</b> ليتوّج الفائز بلقب الشات وجوائزه الملكية.</p>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                        <button type="button" class="lrc-btn" id="lrc-idle-pz"><i class="fas fa-gift"></i> استعراض الجوائز الـ 6</button>
                        <button type="button" class="lrc-btn lrc-btn-out" id="lrc-idle-hf"><i class="fas fa-trophy"></i> قاعة الشرف</button>
                        ${isAdm ? `<button type="button" class="lrc-btn" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;" id="lrc-idle-adm"><i class="fas fa-sliders-h"></i> فتح لوحة التحكم لإطلاق الموسم</button>` : ""}
                    </div>
                </div>`;
            document.getElementById("lrc-idle-pz").onclick = openPrizesModal;
            document.getElementById("lrc-idle-hf").onclick = openHofModal;
            const admBtn = document.getElementById("lrc-idle-adm");
            if (admBtn) admBtn.onclick = () => { window.LaylRoyalContest.close(); royalAdmin.open(); };
            return;
        }

        // 2. NOMINATION
        if ("nomination" === info.phase) {
            const mine = myKey ? st.candidates[myKey] : null;
            const approved = getApprovedCandidates();
            const pausedTag = info.paused ? '<div style="color:#fca5a5;font-weight:bold;margin-top:8px;">⏸️ المسابقة متوقفة مؤقتاً من قبل الإدارة</div>' : "";
            let myCardHtml = "";
            if (mine) {
                const isPend = "pending" === mine.status;
                const roleLabel = "queen" === mine.role ? "ملكة الشات 👸" : "ملك الشات 👑";
                myCardHtml = `
                    <div class="lrc-form" style="border-color:${isPend ? "#f59e0b" : "#10b981"};text-align:center;">
                        <div style="font-size:28px;margin-bottom:6px;">${isPend ? "⏳" : "✅"}</div>
                        <div style="font-weight:900;font-size:1.05rem;color:${isPend ? "#fcd34d" : "#6ee7b7"};">${isPend ? "تم استلام ترشيحك — بانتظار اعتماد الإدارة" : `أنت مرشح رسمي على لقب ${roleLabel}!`}</div>
                        ${mine.slogan ? `<div style="color:#cbd5e1;font-size:.86rem;margin:6px 0 12px;">«${h.esc(mine.slogan)}»</div>` : ""}
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
                            <button type="button" class="lrc-btn" id="lrc-copy-camp"><i class="fas fa-bullhorn"></i> نسخ رسالة حملتي للشات</button>
                            <button type="button" class="lrc-btn lrc-btn-red" id="lrc-withdraw" style="padding:10px 14px;font-size:.85rem;"><i class="fas fa-sign-out-alt"></i> انسحاب</button>
                        </div>
                    </div>`;
            } else {
                myCardHtml = `
                    <div class="lrc-form">
                        <div style="font-weight:800;color:#D4AF37;margin-bottom:10px;font-size:.98rem;"><i class="fas fa-feather-alt"></i> رشّح نفسك الآن للمنافسة على التاج</div>
                        <div class="lrc-roles">
                            <div class="lrc-role-opt sel-king" id="lrc-pick-king" data-role="king"><div style="font-size:24px;">👑</div>ملك الشات</div>
                            <div class="lrc-role-opt" id="lrc-pick-queen" data-role="queen"><div style="font-size:24px;">👸</div>ملكة الشات</div>
                        </div>
                        <input type="text" id="lrc-slogan-inp" class="lrc-inp" maxlength="90" placeholder="اكتب شعارك الدعائي القصير (اختياري، مثلاً: بدعمكم يكتمل التاج ✨)..." style="margin-bottom:10px;">
                        <button type="button" id="lrc-submit-nom" class="lrc-btn" style="width:100%;" ${info.paused ? "disabled" : ""}><i class="fas fa-crown"></i> تأكيد ترشيح نفسي</button>
                    </div>`;
            }

            body.innerHTML = `
                <div class="lrc-hero">
                    <div style="color:#D4AF37;font-size:.86rem;font-weight:800;">الموسم #${h.esc(st.state.season || 1)} • المرحلة الأولى</div>
                    <h2>👑 باب الترشيح مفتوح الآن!</h2>
                    <p>رشّح نفسك خلال فترة الترشيح لتدخل سباق الأصوات وتنافس على اللقب والجوائز الملكية الست.</p>
                    <div class="lrc-timer"><i class="fas fa-clock"></i> <span id="lrc-cd-txt">${h.fmtTime(info.remaining)}</span></div>
                    ${pausedTag}
                </div>
                ${myCardHtml}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <b style="color:#fde68a;font-size:.98rem;">📜 المرشحون حتى الآن (${approved.length})</b>
                </div>
                <div class="lrc-grid">
                    ${approved.length ? approved.map(c => `
                        <div class="lrc-card ${c.role}-card">
                            <span class="lrc-role-tag ${c.role}">${"queen" === c.role ? "👸 ملكة" : "👑 ملك"}</span>
                            ${renderAvatar(c.avatar, c.role)}
                            <div class="lrc-cname">${c.html ? h.sanHtml(c.html) : h.esc(c.displayName || c.username)}</div>
                            <div class="lrc-slogan">${c.slogan ? `«${h.esc(c.slogan)}»` : "مرشح رسمي للتاج 👑"}</div>
                        </div>`).join("") : '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:24px;">كن أول من يرشّح نفسه هذا الموسم!</div>'}
                </div>`;

            if (mine) {
                document.getElementById("lrc-copy-camp").onclick = () => {
                    const roleTxt = "queen" === mine.role ? "ملكة الشات 👸" : "ملك الشات 👑";
                    h.copy(`✨ رشّحت نفسي في مسابقة شات ليل على لقب ${roleTxt}!\n👤 المرشح: ${mine.displayName || mine.username}${mine.slogan ? `\n💬 «${mine.slogan}»` : ""}\n🔥 ترقبوا بدء التصويت وادعموني بأصواتكم!`, "📋 تم نسخ رسالة حملتك — الصقها في الشات!");
                };
                document.getElementById("lrc-withdraw").onclick = () => {
                    if (confirm("هل أنت متأكد من سحب ترشيحك من المسابقة؟")) {
                        st.db?.ref(`${ROOT}/candidates/${myKey}`).remove().then(() => showToast("تم سحب ترشيحك."));
                    }
                };
            } else {
                let pickedRole = "king";
                const kBtn = document.getElementById("lrc-pick-king"), qBtn = document.getElementById("lrc-pick-queen");
                kBtn.onclick = () => { pickedRole = "king"; kBtn.className = "lrc-role-opt sel-king"; qBtn.className = "lrc-role-opt"; };
                qBtn.onclick = () => { pickedRole = "queen"; qBtn.className = "lrc-role-opt sel-queen"; kBtn.className = "lrc-role-opt"; };
                document.getElementById("lrc-submit-nom").onclick = () => submitNomination(pickedRole);
            }
            return;
        }

        // 3. VOTING
        if ("voting" === info.phase) {
            const counts = computeVoteCounts();
            const isDual = "dual" === st.state.mode;
            const hideVotes = Boolean(st.settings.hideLiveVotes) && !isAdm;
            let list = getApprovedCandidates("all" === st.voteFilter ? null : st.voteFilter);
            if (st.voteSearch) {
                const q = st.voteSearch.toLowerCase();
                list = list.filter(c => `${c.displayName || ""} ${c.username || ""} ${c.slogan || ""}`.toLowerCase().includes(q));
            }
            if (!hideVotes) list.sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
            const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

            const myVoteSingle = myKey && st.votes[myKey] ? st.votes[myKey].target : null;
            const myVoteKing = myKey && st.votes[`${myKey}_king`] ? st.votes[`${myKey}_king`].target : null;
            const myVoteQueen = myKey && st.votes[`${myKey}_queen`] ? st.votes[`${myKey}_queen`].target : null;

            body.innerHTML = `
                <div class="lrc-hero">
                    <div style="color:#D4AF37;font-size:.86rem;font-weight:800;">الموسم #${h.esc(st.state.season || 1)} • المرحلة الثانية</div>
                    <h2>🗳️ التصويت مفتوح الآن — اختر من يستحق التاج!</h2>
                    <p>${isDual ? "يمكنك منح صوت واحد لـ <b>ملك الشات 👑</b> وصوت واحد لـ <b>ملكة الشات 👸</b>." : "لك صوت واحد فقط لاختيار <b>ملك أو ملكة الشات</b>."} ${hideVotes ? "<br><span style='color:#fcd34d;'>🔒 التصويت سري — تُكشف الأرقام عند انتهاء الوقت.</span>" : ""}</p>
                    <div class="lrc-timer"><i class="fas fa-hourglass-half"></i> <span id="lrc-cd-txt">${h.fmtTime(info.remaining)}</span></div>
                    ${info.paused ? '<div style="color:#fca5a5;font-weight:bold;margin-top:8px;">⏸️ التصويت متوقف مؤقتاً</div>' : ""}
                </div>
                <div class="lrc-filters">
                    <button type="button" class="lrc-fbtn ${"all" === st.voteFilter ? "active" : ""}" data-vf="all">الكل</button>
                    <button type="button" class="lrc-fbtn ${"king" === st.voteFilter ? "active" : ""}" data-vf="king">👑 مرشحو الملك</button>
                    <button type="button" class="lrc-fbtn ${"queen" === st.voteFilter ? "active" : ""}" data-vf="queen">👸 مرشحات الملكة</button>
                    <input type="text" id="lrc-vsearch" class="lrc-inp" style="flex:1;min-width:160px;padding:7px 12px;font-size:.84rem;" placeholder="🔍 ابحث عن مرشح..." value="${h.esc(st.voteSearch)}">
                </div>
                <div class="lrc-grid">
                    ${list.length ? list.map((c, idx) => {
                        const vCnt = counts[c.key] || 0;
                        const pct = Math.min(100, Math.round((vCnt / totalVotes) * 100));
                        const votedForThis = isDual ? (("king" === c.role ? myVoteKing : myVoteQueen) === c.key) : (myVoteSingle === c.key);
                        const hasVotedSlot = isDual ? Boolean("king" === c.role ? myVoteKing : myVoteQueen) : Boolean(myVoteSingle);
                        const canVoteBtn = !info.paused && (!hasVotedSlot || st.settings.allowVoteChange) && !votedForThis;
                        return `
                        <div class="lrc-card ${c.role}-card ${votedForThis ? "voted" : ""}">
                            <span class="lrc-role-tag ${c.role}">${"queen" === c.role ? "👸 ملكة" : "👑 ملك"}</span>
                            ${!hideVotes ? `<span class="lrc-rank-num">#${idx + 1}</span>` : ""}
                            ${renderAvatar(c.avatar, c.role)}
                            <div class="lrc-cname">${c.html ? h.sanHtml(c.html) : h.esc(c.displayName || c.username)}</div>
                            <div class="lrc-slogan">${c.slogan ? `«${h.esc(c.slogan)}»` : "ينافس على اللقب الملكي"}</div>
                            ${!hideVotes ? `<div class="lrc-bar-wrap"><div class="lrc-bar-fill" style="width:${pct}%;"></div></div><div class="lrc-vstat">🔥 ${vCnt} صوت (${pct}%)</div>` : '<div class="lrc-vstat" style="color:#94a3b8;">🔒 الأصوات سرية</div>'}
                            <div class="lrc-cacts">
                                ${votedForThis
                                    ? `<button type="button" class="lrc-btn" style="flex:1;padding:8px;font-size:.84rem;background:#10b981;color:#fff;" disabled>✓ تم تصويتك</button>`
                                    : `<button type="button" class="lrc-btn lrc-vote-go" data-k="${h.esc(c.key)}" data-role="${c.role}" style="flex:1;padding:8px;font-size:.84rem;" ${canVoteBtn ? "" : "disabled"}>${hasVotedSlot && st.settings.allowVoteChange ? "تغيير صوتي" : "صوّت 🗳️"}</button>`}
                                <button type="button" class="lrc-ibtn sq lrc-share-cand" data-name="${h.esc(c.displayName || c.username)}" data-role="${c.role}" title="دعم ومشاركة للشات"><i class="fas fa-share-alt"></i></button>
                            </div>
                        </div>`;
                    }).join("") : '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:24px;">لا يوجد مرشحون مطابقون.</div>'}
                </div>`;

            body.querySelectorAll("[data-vf]").forEach(b => b.onclick = () => { st.voteFilter = b.dataset.vf; renderMainBody(); });
            const vs = document.getElementById("lrc-vsearch");
            if (vs) vs.oninput = () => { st.voteSearch = vs.value; renderMainBody(); };
            body.querySelectorAll(".lrc-vote-go").forEach(b => b.onclick = () => castVote(b.dataset.k, b.dataset.role));
            body.querySelectorAll(".lrc-share-cand").forEach(b => b.onclick = () => {
                const rTxt = "queen" === b.dataset.role ? "ملكة الشات 👸" : "ملك الشات 👑";
                h.copy(`🗳️ صوّت الآن لـ (${b.dataset.name}) في مسابقة ${rTxt} داخل شات ليل! 👑🔥`, "📋 تم نسخ رسالة الدعم — الصقها في الشات!");
            });
            return;
        }

        // 4. TIEBREAKER
        if ("tiebreaker" === info.phase) {
            const counts = computeVoteCounts();
            const isDual = "dual" === st.state.mode;
            const renderTieGroup = (arr, label, slot) => !arr || !arr.length ? "" : `
                <h3 style="color:#fca5a5;margin:14px 0 10px;text-align:center;">⚖️ تعادل على لقب ${label}</h3>
                <div class="lrc-grid">
                    ${arr.map(c => `
                        <div class="lrc-card ${c.role}-card" style="border-color:#ef4444;">
                            ${renderAvatar(c.avatar, c.role)}
                            <div class="lrc-cname">${c.html ? h.sanHtml(c.html) : h.esc(c.displayName || c.username)}</div>
                            <div class="lrc-vstat">متعادل بـ ${counts[c.key] || 0} صوت</div>
                            ${isAdm ? `<button type="button" class="lrc-btn lrc-btn-red lrc-tb-pick" data-k="${h.esc(c.key)}" data-slot="${slot}" style="width:100%;">منح اللقب الحاسم 🏆</button>` : '<span style="font-size:.82rem;color:#fcd34d;">بانتظار حسم الإدارة...</span>'}
                        </div>`).join("")}
                </div>`;

            body.innerHTML = `
                <div class="lrc-hero" style="border-color:rgba(239,68,68,.4);">
                    <div style="font-size:42px;">⚖️</div>
                    <h2>تعادل مثير في المركز الأول!</h2>
                    <p>${isAdm ? "بصفتك من الإدارة، اختر المتوّج بالصوت الحاسم الآن لإنهاء التعادل وإعلان النتائج." : "انتهى وقت التصويت بتعادل في الصدارة — بانتظار الصوت الملكي الحاسم من الإدارة."}</p>
                </div>
                ${isDual ? (renderTieGroup(info.kTies, "ملك الشات 👑", "tieBreakerKing") + renderTieGroup(info.qTies, "ملكة الشات 👸", "tieBreakerQueen")) : renderTieGroup(info.ties, "ملك / ملكة الشات 👑", "tieBreaker")}`;

            body.querySelectorAll(".lrc-tb-pick").forEach(b => b.onclick = () => {
                if (!confirm("تأكيد منح الصوت الحاسم وتتويج هذا المرشح باللقب؟")) return;
                st.db?.ref(`${ROOT}/state/${b.dataset.slot}`).set(b.dataset.k).then(() => {
                    royalAdmin.log("حسم تعادل", b.dataset.k, b.dataset.slot);
                    showToast("🏆 تم حسم التعادل وإعلان التتويج!", 4000, "gold");
                });
            });
            return;
        }

        // 5. RESULTS
        const counts = computeVoteCounts();
        const s = st.state;
        const isDual = "dual" === s.mode;
        if (s.tieBreaker && void 0 !== counts[s.tieBreaker]) counts[s.tieBreaker]++;
        if (s.tieBreakerKing && void 0 !== counts[s.tieBreakerKing]) counts[s.tieBreakerKing]++;
        if (s.tieBreakerQueen && void 0 !== counts[s.tieBreakerQueen]) counts[s.tieBreakerQueen]++;

        const allSorted = getApprovedCandidates().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
        const winners = [];
        if (isDual) {
            const topK = allSorted.find(c => "king" === c.role);
            const topQ = allSorted.find(c => "queen" === c.role);
            if (topK) winners.push(topK);
            if (topQ) winners.push(topQ);
        } else if (allSorted[0]) {
            winners.push(allSorted[0]);
        }

        const cKey = `s_${s.season}_${winners.map(w => w.key).join("_")}`;
        if (winners.length && st.confettiFiredKey !== cKey) {
            st.confettiFiredKey = cKey;
            h.fireConfetti();
        }

        body.innerHTML = `
            <div style="text-align:center;margin-bottom:14px;">
                <h2 style="margin:0;color:#D4AF37;font-size:1.5rem;font-weight:900;">🏆 التتويج الرسمي — الموسم #${h.esc(s.season || 1)} 🏆</h2>
            </div>
            ${winners.length ? `<div style="display:grid;grid-template-columns:${winners.length > 1 ? "repeat(auto-fit,minmax(260px,1fr))" : "1fr"};gap:14px;">
                ${winners.map(w => `
                    <div class="lrc-podium">
                        <div style="font-size:38px;margin-bottom:4px;">${"queen" === w.role ? "👸" : "👑"}</div>
                        <div style="color:#fde68a;font-size:.92rem;font-weight:800;">${"queen" === w.role ? "ملكة شات ليل" : "ملك شات ليل"}</div>
                        ${renderAvatar(w.avatar, w.role)}
                        <div class="lrc-cname" style="font-size:1.25rem;">${w.html ? h.sanHtml(w.html) : h.esc(w.displayName || w.username)}</div>
                        ${w.slogan ? `<div style="color:#cbd5e1;font-size:.86rem;margin:4px 0 10px;">«${h.esc(w.slogan)}»</div>` : ""}
                        <div style="display:inline-block;background:#D4AF37;color:#111;padding:5px 18px;border-radius:20px;font-weight:900;font-size:.9rem;">🔥 ${counts[w.key] || 0} صوت</div>
                    </div>`).join("")}
            </div>` : '<div class="lrc-hero"><p>لم تسجل أي مشاركات في هذا الموسم.</p></div>'}
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
                <button type="button" class="lrc-btn" id="lrc-res-copy"><i class="fas fa-copy"></i> نسخ تهنئة التتويج للشات</button>
                <button type="button" class="lrc-btn lrc-btn-out" id="lrc-res-pz"><i class="fas fa-gift"></i> الجوائز المستحقة</button>
            </div>
            ${allSorted.length > winners.length ? `
                <div style="font-weight:800;color:#94a3b8;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:6px;">باقي المراكز والمشاركين:</div>
                ${allSorted.map((c, i) => `
                    <div class="lrc-prize-item" style="margin-bottom:7px;padding:8px 12px;">
                        <b style="color:#D4AF37;width:28px;text-align:center;">#${i + 1}</b>
                        ${c.avatar ? `<img src="${h.esc(c.avatar)}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1px solid #D4AF37;">` : '<i class="fas fa-user-circle" style="font-size:32px;color:#64748b;"></i>'}
                        <div style="flex:1;min-width:0;">
                            <div class="lrc-cname" style="font-size:.9rem;margin:0;text-align:right;">${c.html ? h.sanHtml(c.html) : h.esc(c.displayName || c.username)}</div>
                            <div style="font-size:.74rem;color:#94a3b8;">${"queen" === c.role ? "👸 ملكة" : "👑 ملك"}</div>
                        </div>
                        <span style="background:rgba(212,175,55,.15);color:#fde68a;padding:4px 10px;border-radius:12px;font-size:.8rem;font-weight:800;">${counts[c.key] || 0} صوت</span>
                    </div>`).join("")}` : ""}`;

        document.getElementById("lrc-res-pz").onclick = openPrizesModal;
        document.getElementById("lrc-res-copy").onclick = () => {
            if (!winners.length) return;
            const lines = winners.map(w => `${"queen" === w.role ? "👸 ملكة الشات" : "👑 ملك الشات"}: ${w.displayName || w.username} (${counts[w.key] || 0} صوت)`).join("\n");
            h.copy(`👑✨ ألف مبروك التتويج في شات ليل ✨👑\n\n${lines}\n\n🎁 الجوائز: وسام ملكي + بنر اسم دائم + رقم مميز + أعلى رتبة بالمتواجدين + تصميم بروفايل ورسائل عام! 🎉`, "📋 تم نسخ إعلان التتويج للشات!");
        };
    }

    function submitNomination(role) {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (!ensureIdentity()) return;
        const ban = h.getMyBan();
        if (!h.isAdmin() && ban && ("all" === ban.scope || "nom" === ban.scope)) {
            return alert(`تم منعك من الترشيح في المسابقة 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
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
            role,
            slogan,
            status: needsApp ? "pending" : "approved",
            bonusVotes: 0,
            joinedAt: Date.now()
        }).then(() => {
            showToast(needsApp ? "⏳ تم إرسال ترشيحك لمراجعة الإدارة!" : "👑 تم اعتماد ترشيحك بنجاح! بالتوفيق", 3500, "gold");
        }).catch(() => alert("❌ فشل حفظ الترشيح."));
    }

    function castVote(targetKey, targetRole) {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (!st.settings.allowGuestsVote && h.isGuest() && !h.isAdmin()) {
            return alert("التصويت متاح للأعضاء المسجلين فقط 👑");
        }
        if (!ensureIdentity()) return;
        const ban = h.getMyBan();
        if (!h.isAdmin() && ban && ("all" === ban.scope || "vote" === ban.scope)) {
            return alert(`تم منعك من التصويت في المسابقة 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
        }
        const myK = h.myKey();
        if (!st.settings.allowSelfVote && !h.isAdmin() && myK === targetKey) {
            return showToast("🚫 لا يمكنك التصويت لنفسك!", 3500, "red");
        }
        const isDual = "dual" === st.state?.mode;
        const voteKey = isDual ? `${myK}_${targetRole}` : myK;
        if (st.votes[voteKey] && !st.settings.allowVoteChange) {
            return showToast("⚠️ لقد استخدمت صوتك مسبقاً.", 3000, "red");
        }
        const candName = st.candidates[targetKey]?.displayName || targetKey;
        if (!confirm(`تأكيد منح صوتك للمرشح (${candName})؟${st.settings.allowVoteChange ? "" : "\nلا يمكن التراجع بعد التصويت."}`)) return;
        st.db.ref(`${ROOT}/votes/${voteKey}`).set({
            target: targetKey,
            role: targetRole,
            voterName: st.myUser,
            ts: Date.now()
        }).then(() => showToast(`✅ تم احتساب صوتك لـ ${candName}!`, 3500, "gold"))
          .catch(() => alert("❌ تعذر تسجيل الصوت."));
    }

    function startCountdownLoop() {
        clearInterval(st.timerId);
        let prevPhase = getPhaseInfo().phase;
        st.timerId = setInterval(() => {
            const modal = document.getElementById("lrc-modal");
            if (!modal || !modal.classList.contains("open")) return;
            const info = getPhaseInfo();
            if (info.phase !== prevPhase) {
                prevPhase = info.phase;
                renderMainBody();
                return;
            }
            const cd = document.getElementById("lrc-cd-txt");
            if (cd) cd.textContent = h.fmtTime(info.remaining);
        }, 1000);
    }

    // ==================== لوحة التحكم الإدارية الشاملة ====================
    const royalAdmin = {
        injectStyles() {
            if (document.getElementById("lrca-styles")) return;
            const s = document.createElement("style");
            s.id = "lrca-styles";
            s.textContent = `
            .lrca-ov{position:fixed;inset:0;background:rgba(8,10,18,.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);direction:rtl;font-family:'Segoe UI',tahoma,sans-serif;opacity:0;transition:opacity .22s}
            .lrca-ov.active{opacity:1}
            .lrca-box{background:linear-gradient(180deg,rgba(28,31,56,.99),rgba(14,16,30,.99));border:1px solid rgba(212,175,55,.42);border-radius:20px;width:95%;max-width:670px;max-height:89vh;max-height:89dvh;padding:15px 17px 17px;box-shadow:0 25px 60px rgba(0,0,0,.9);display:flex;flex-direction:column;overflow:hidden;color:#f8fafc;box-sizing:border-box}
            .lrca-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
            .lrca-title{display:flex;align-items:center;gap:8px;color:#D4AF37;font-weight:900;font-size:15.5px}
            .lrca-ctrl{background:rgba(255,255,255,.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px}
            .lrca-ctrl.x:hover{background:#ef4444}
            .lrca-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;flex-shrink:0}
            .lrca-stat{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 4px;text-align:center}
            .lrca-stat-v{font-size:13px;font-weight:800;color:#D4AF37}
            .lrca-stat-l{font-size:10px;color:#94a3b8;margin-top:2px}
            .lrca-tabs{display:flex;height:42px;min-height:42px;background:rgba(0,0,0,.34);border-radius:12px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;border:1px solid rgba(255,255,255,.05);flex-shrink:0}
            .lrca-tabs::-webkit-scrollbar{display:none}
            .lrca-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 11px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:bold;cursor:pointer;white-space:nowrap}
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
            .lrca-inp{width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.11);color:#fff;padding:8px 10px;border-radius:10px;font-family:inherit;font-size:12.5px;outline:none;box-sizing:border-box}
            .lrca-inp:focus{border-color:#D4AF37}
            .lrca-inp option{background:#16182c;color:#fff}
            .lrca-lbl{display:block;font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:4px}
            .lrca-btn{border:none;border-radius:10px;padding:8px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:5px}
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
                admin: st.myUser || "الإدارة",
                action,
                target: target || "-",
                details,
                ts: firebase.database.ServerValue.TIMESTAMP
            }).catch(() => {});
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
                    <div class="lrca-stat"><div class="lrca-stat-v" id="lrca-st-bn">0</div><div class="lrca-stat-l">المحظورون</div></div>
                </div>
                <div class="lrca-tabs">
                    <button type="button" class="lrca-tab active" data-atab="control"><i class="fas fa-sliders-h"></i> التحكم والمراحل</button>
                    <button type="button" class="lrca-tab" data-atab="cands"><i class="fas fa-users"></i> المرشحون <span id="lrca-pbdg" class="lrca-bdg">0</span></button>
                    <button type="button" class="lrca-tab" data-atab="votes"><i class="fas fa-vote-yea"></i> سجل الأصوات</button>
                    <button type="button" class="lrca-tab" data-atab="bans"><i class="fas fa-user-slash"></i> الحظر</button>
                    <button type="button" class="lrca-tab" data-atab="settings"><i class="fas fa-cog"></i> الإعدادات</button>
                    <button type="button" class="lrca-tab" data-atab="logs"><i class="fas fa-trophy"></i> الشرف والسجل</button>
                </div>
                <div class="lrca-body">
                    <!-- 1. التحكم والمراحل -->
                    <div id="lrca-v-control" class="lrca-view active">
                        <div class="lrca-card" style="border-color:rgba(212,175,55,.4);">
                            <div class="lrca-ct"><span><i class="fas fa-rocket"></i> إطلاق موسم جديد</span></div>
                            <div class="lrca-g2" style="margin-bottom:6px;">
                                <div><label class="lrca-lbl">عنوان الموسم</label><input id="lrca-n-title" class="lrca-inp" value="مسابقة ملك وملكة شات ليل"></div>
                                <div>
                                    <label class="lrca-lbl">نظام التتويج</label>
                                    <select id="lrca-n-mode" class="lrca-inp">
                                        <option value="single">فائز واحد (ملك أو ملكة الشات)</option>
                                        <option value="dual">فائزان (ملك الشات + ملكة الشات)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="lrca-g2" style="margin-bottom:8px;">
                                <div><label class="lrca-lbl">مدة الترشيح (ساعة — 48 = يومين)</label><input type="number" id="lrca-n-nomh" class="lrca-inp" value="48" min="1" max="336"></div>
                                <div><label class="lrca-lbl">مدة جمع الأصوات (ساعة — 72 = 3 أيام)</label><input type="number" id="lrca-n-voth" class="lrca-inp" value="72" min="1" max="336"></div>
                            </div>
                            <button type="button" id="lrca-start-new" class="lrca-btn lrca-b-gold"><i class="fas fa-play"></i> بدء الموسم الآن (مسح بيانات الموسم السابق)</button>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-clock"></i> إدارة المرحلة الحالية</span><span id="lrca-cur-cd" class="lrca-tag lrca-t-gold" dir="ltr">--:--:--</span></div>
                            <div class="lrca-g2" style="margin-bottom:7px;">
                                <button type="button" id="lrca-pause-btn" class="lrca-btn lrca-b-warn"><i class="fas fa-pause"></i> إيقاف مؤقت / استئناف</button>
                                <button type="button" id="lrca-ext-24" class="lrca-btn lrca-b-info"><i class="fas fa-plus-circle"></i> تمديد المرحلة +24 ساعة</button>
                                <button type="button" id="lrca-skip-nom" class="lrca-btn lrca-b-ok"><i class="fas fa-forward"></i> إنهاء الترشيح ➔ بدء التصويت</button>
                                <button type="button" id="lrca-skip-vote" class="lrca-btn lrca-b-ok"><i class="fas fa-flag-checkered"></i> إنهاء التصويت ➔ إعلان النتائج</button>
                                <button type="button" id="lrca-save-hof" class="lrca-btn lrca-b-gold"><i class="fas fa-trophy"></i> حفظ الفائز في قاعة الشرف</button>
                                <button type="button" id="lrca-reset-all" class="lrca-btn lrca-b-dng"><i class="fas fa-trash"></i> إغلاق وتصفير المسابقة</button>
                            </div>
                        </div>

                        <div class="lrca-card" style="border-color:rgba(239,68,68,.35);">
                            <div class="lrca-ct" style="color:#fca5a5;"><span><i class="fas fa-bullhorn"></i> بث إشعار فوري لجميع المتواجدين بالشات</span></div>
                            <div class="lrca-row">
                                <input id="lrca-bc-inp" class="lrca-inp" style="flex:1;" placeholder="مثلاً: 👑 بدأ التصويت على لقب ملك وملكة الشات — ادخل وصوّت الآن!">
                                <button type="button" id="lrca-bc-send" class="lrca-btn lrca-b-red lrca-mini" style="padding:8px 13px;"><i class="fas fa-paper-plane"></i> بث</button>
                            </div>
                        </div>

                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-ribbon"></i> شريط الإعلان الدائم بأعلى نافذة المسابقة</span></div>
                            <div class="lrca-row">
                                <input id="lrca-ban-txt" class="lrca-inp" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                                <select id="lrca-ban-th" class="lrca-inp" style="width:88px;"><option value="gold">ذهبي</option><option value="red">أحمر</option><option value="blue">أزرق</option></select>
                                <button type="button" id="lrca-ban-save" class="lrca-btn lrca-b-gold lrca-mini" style="padding:8px 13px;">حفظ</button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. المرشحون -->
                    <div id="lrca-v-cands" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-user-plus"></i> إضافة مرشح يدوياً</span></div>
                            <div class="lrca-g3" style="margin-bottom:6px;">
                                <input id="lrca-mc-u" class="lrca-inp" placeholder="اسم المستخدم *">
                                <select id="lrca-mc-r" class="lrca-inp"><option value="king">👑 ملك</option><option value="queen">👸 ملكة</option></select>
                                <input id="lrca-mc-s" class="lrca-inp" placeholder="الشعار (اختياري)">
                            </div>
                            <button type="button" id="lrca-mc-add" class="lrca-btn lrca-b-ok" style="width:100%;">إضافة مرشح معتمد</button>
                        </div>
                        <div id="lrca-cands-list"></div>
                    </div>

                    <!-- 3. سجل الأصوات -->
                    <div id="lrca-v-votes" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct">
                                <span><i class="fas fa-search"></i> مراقبة وتدقيق الأصوات</span>
                                <button type="button" id="lrca-wipe-votes" class="lrca-btn lrca-b-dng lrca-mini">تصفير كل الأصوات</button>
                            </div>
                            <input id="lrca-vq" class="lrca-inp" style="margin-bottom:8px;" placeholder="ابحث باسم المصوّت أو المرشح...">
                            <div id="lrca-votes-list"></div>
                        </div>
                    </div>

                    <!-- 4. الحظر -->
                    <div id="lrca-v-bans" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-ban"></i> حظر عضو من المسابقة</span></div>
                            <div class="lrca-g3" style="margin-bottom:7px;">
                                <input id="lrca-bu" class="lrca-inp" placeholder="اسم المستخدم *">
                                <select id="lrca-bs" class="lrca-inp"><option value="all">حظر كامل</option><option value="nom">منع الترشيح فقط</option><option value="vote">منع التصويت فقط</option></select>
                                <input id="lrca-br" class="lrca-inp" placeholder="السبب (اختياري)">
                            </div>
                            <button type="button" id="lrca-bgo" class="lrca-btn lrca-b-red">تنفيذ الحظر</button>
                        </div>
                        <div id="lrca-bans-list"></div>
                    </div>

                    <!-- 5. الإعدادات -->
                    <div id="lrca-v-settings" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-cog"></i> صلاحيات وضوابط المسابقة</span></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">تفعيل المسابقة للجميع</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-en"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">إخفاء عدد الأصوات أثناء التصويت (تصويت سري)</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-hide"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">مراجعة الإدارة قبل اعتماد المرشح الجديد</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-app"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للمرشح بالتصويت لنفسه</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-self"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للعضو بتغيير صوته قبل انتهاء الوقت</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-chg"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">السماح للضيوف بالتصويت</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-gst"><span class="lrca-sl"></span></label></div>
                            <div class="lrca-srow"><div style="font-size:12px;font-weight:bold;">إظهار الإعلان العائم (التوست) عند تغيّر المراحل</div><label class="lrca-sw"><input type="checkbox" id="lrca-s-ad"><span class="lrca-sl"></span></label></div>
                            <div style="margin-bottom:8px;"><label class="lrca-lbl">رسالة الإغلاق / الصيانة</label><input id="lrca-s-msg" class="lrca-inp"></div>
                            <button type="button" id="lrca-s-save" class="lrca-btn lrca-b-gold"><i class="fas fa-save"></i> حفظ الإعدادات</button>
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

                    <!-- 6. قاعة الشرف والسجل -->
                    <div id="lrca-v-logs" class="lrca-view">
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-trophy"></i> إدارة قاعة الشرف</span></div>
                            <div id="lrca-hof-list"></div>
                        </div>
                        <div class="lrca-card">
                            <div class="lrca-ct"><span><i class="fas fa-clipboard-list"></i> سجل العمليات الإدارية</span><button type="button" id="lrca-clr-logs" class="lrca-btn lrca-b-dng lrca-mini">مسح</button></div>
                            <div id="lrca-logs-list"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(ov);
            this.bindEvents(ov);
            requestAnimationFrame(() => ov.classList.add("active"));
            this.populateSettings();
            this.bindLogs();
            this.refresh();
        },

        close() {
            if (st.logsRef) { st.logsRef.off(); st.logsRef = null; }
            document.getElementById("lrc-admin-modal")?.remove();
        },

        bindLogs() {
            if (!st.db) return;
            st.logsRef?.off();
            st.logsRef = st.db.ref(`${ROOT}/logs`).limitToLast(80);
            st.logsRef.on("value", sn => {
                st.logs = Object.values(sn.val() || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
                this.renderLogs();
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
            sv("lrca-s-msg", s.disabledMsg || "");
            sv("lrca-ban-txt", s.bannerText || "");
            sv("lrca-ban-th", s.bannerTheme || "gold");
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

            // بدء موسم جديد
            document.getElementById("lrca-start-new").onclick = () => {
                if (!st.db) return;
                if (!confirm("بدء موسم جديد سيقوم بمسح مرشحي وأصوات الموسم السابق (مع الاحتفاظ بقاعة الشرف والمحظورين). متابعة؟")) return;
                const title = document.getElementById("lrca-n-title").value.trim() || "مسابقة ملك وملكة شات ليل";
                const mode = document.getElementById("lrca-n-mode").value;
                const nomH = Math.max(1, parseFloat(document.getElementById("lrca-n-nomh").value) || 48);
                const votH = Math.max(1, parseFloat(document.getElementById("lrca-n-voth").value) || 72);
                const now = Date.now(), nextSeason = (Number(st.state?.season) || 0) + 1;
                const nomEnd = now + nomH * 36e5;
                const voteEnd = nomEnd + votH * 36e5;
                st.db.ref(ROOT).update({
                    state: { status: "active", season: nextSeason, title, mode, nomEnd, voteEnd, paused: !1, tieBreaker: null, tieBreakerKing: null, tieBreakerQueen: null, startedBy: st.myUser || "الإدارة" },
                    candidates: null,
                    votes: null,
                    broadcast: { text: `👑 انطلق الموسم #${nextSeason} من ${title}! رشّح نفسك الآن خلال ${nomH} ساعة.`, ts: Date.now(), by: st.myUser || "الإدارة" }
                }).then(() => { this.log("إطلاق موسم جديد", `#${nextSeason}`, `${title} (${mode})`); showToast(`👑 تم إطلاق الموسم #${nextSeason}!`, 4000, "gold"); });
            };

            // إيقاف مؤقت / استئناف
            document.getElementById("lrca-pause-btn").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return showToast("لا يوجد موسم نشط");
                if (s.paused) {
                    const rem = s.remainingMs || 0;
                    const now = Date.now();
                    const up = { paused: !1, remainingMs: 0 };
                    if ("nomination" === s.pausedPhase) {
                        const voteDur = Math.max(36e5, (s.voteEnd || now) - (s.nomEnd || now));
                        up.nomEnd = now + rem;
                        up.voteEnd = up.nomEnd + voteDur;
                    } else if ("voting" === s.pausedPhase) {
                        up.voteEnd = now + rem;
                    }
                    st.db.ref(`${ROOT}/state`).update(up).then(() => { this.log("استئناف المسابقة", `#${s.season}`); showToast("▶️ تم استئناف المسابقة"); });
                } else {
                    const info = getPhaseInfo();
                    if ("nomination" !== info.phase && "voting" !== info.phase) return showToast("لا يمكن إيقاف هذه المرحلة");
                    st.db.ref(`${ROOT}/state`).update({ paused: !0, pausedPhase: info.phase, remainingMs: info.remaining }).then(() => { this.log("إيقاف مؤقت", `#${s.season}`, info.phase); showToast("⏸️ تم إيقاف المسابقة مؤقتاً"); });
                }
            };

            // تمديد +24 ساعة
            document.getElementById("lrca-ext-24").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return showToast("لا يوجد موسم نشط");
                const info = getPhaseInfo(), add = 24 * 36e5;
                if ("nomination" === info.phase) {
                    st.db.ref(`${ROOT}/state`).update({ nomEnd: s.nomEnd + add, voteEnd: s.voteEnd + add }).then(() => { this.log("تمديد الترشيح", "+24 ساعة"); showToast("⏳ تم تمديد الترشيح 24 ساعة"); });
                } else if ("voting" === info.phase) {
                    st.db.ref(`${ROOT}/state`).update({ voteEnd: s.voteEnd + add }).then(() => { this.log("تمديد التصويت", "+24 ساعة"); showToast("⏳ تم تمديد التصويت 24 ساعة"); });
                } else showToast("لا يمكن التمديد في هذه المرحلة");
            };

            // إنهاء الترشيح ➔ التصويت
            document.getElementById("lrca-skip-nom").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return;
                if (!confirm("إنهاء مرحلة الترشيح فوراً والانتقال للتصويت؟")) return;
                const now = Date.now(), dur = Math.max(36e5, (s.voteEnd - s.nomEnd) || 72 * 36e5);
                st.db.ref(`${ROOT}/state`).update({ nomEnd: now - 1000, voteEnd: now + dur, paused: !1 }).then(() => {
                    st.db.ref(`${ROOT}/broadcast`).set({ text: "🗳️ بدأت الآن مرحلة جمع الأصوات في مسابقة ملك وملكة الشات! ادخل وصوّت للأفضل 👑", ts: Date.now(), by: st.myUser || "الإدارة" });
                    this.log("تسريع للتصويت", `#${s.season}`); showToast("🗳️ بدأت مرحلة التصويت الآن!");
                });
            };

            // إنهاء التصويت ➔ النتائج
            document.getElementById("lrca-skip-vote").onclick = () => {
                const s = st.state; if (!s || "active" !== s.status) return;
                if (!confirm("إنهاء التصويت فوراً وإعلان النتائج؟")) return;
                st.db.ref(`${ROOT}/state`).update({ nomEnd: Date.now() - 2000, voteEnd: Date.now() - 1000, paused: !1 }).then(() => {
                    st.db.ref(`${ROOT}/broadcast`).set({ text: "🏆 ظهرت الآن نتائج مسابقة ملك وملكة الشات! ادخل لتهنئة المتوّج باللقب 👑", ts: Date.now(), by: st.myUser || "الإدارة" });
                    this.log("إعلان النتائج", `#${s.season}`); showToast("🏆 تم إعلان النتائج!");
                });
            };

            // حفظ الفائز بقاعة الشرف
            document.getElementById("lrca-save-hof").onclick = () => {
                const s = st.state; if (!s) return;
                const counts = computeVoteCounts();
                if (s.tieBreaker && void 0 !== counts[s.tieBreaker]) counts[s.tieBreaker]++;
                if (s.tieBreakerKing && void 0 !== counts[s.tieBreakerKing]) counts[s.tieBreakerKing]++;
                if (s.tieBreakerQueen && void 0 !== counts[s.tieBreakerQueen]) counts[s.tieBreakerQueen]++;
                const all = getApprovedCandidates().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
                const list = "dual" === s.mode ? [all.find(x => "king" === x.role), all.find(x => "queen" === x.role)].filter(Boolean) : all.slice(0, 1);
                if (!list.length) return showToast("لا يوجد فائز لحفظه", 3000, "red");
                list.forEach(w => {
                    st.db.ref(`${ROOT}/hall_of_fame`).push({
                        season: s.season || 1, name: w.displayName || w.username, role: w.role,
                        avatar: w.avatar || "", votes: counts[w.key] || 0, date: Date.now()
                    });
                });
                this.log("حفظ بقاعة الشرف", list.map(x => x.displayName || x.username).join(" & "));
                showToast("🏆 تم تخليد الفائز في قاعة الشرف!", 3500, "gold");
            };

            // إغلاق وتصفير
            document.getElementById("lrca-reset-all").onclick = () => {
                if (!confirm("⚠️ إغلاق المسابقة الحالية ومسح المرشحين والأصوات؟")) return;
                st.db?.ref(ROOT).update({ state: { status: "idle", season: st.state?.season || 0 }, candidates: null, votes: null }).then(() => {
                    this.log("تصفير المسابقة", "النظام"); showToast("🗑️ تم إغلاق وتصفير المسابقة");
                });
            };

            // البث والشريط
            document.getElementById("lrca-bc-send").onclick = () => {
                const inp = document.getElementById("lrca-bc-inp"), txt = inp.value.trim();
                if (!txt || !st.db) return alert("اكتب نص البث أولاً.");
                st.db.ref(`${ROOT}/broadcast`).set({ text: txt, ts: Date.now(), by: st.myUser || "الإدارة" }).then(() => {
                    this.log("بث فوري", "الجميع", txt); inp.value = ""; showToast("📢 تم إرسال البث للجميع");
                });
            };
            document.getElementById("lrca-ban-save").onclick = () => {
                const txt = document.getElementById("lrca-ban-txt").value.trim(), th = document.getElementById("lrca-ban-th").value;
                this.patchSettings({ bannerText: txt, bannerTheme: th }, txt ? "📢 تم تحديث الشريط" : "تم إخفاء الشريط");
            };

            // إضافة مرشح يدوي
            document.getElementById("lrca-mc-add").onclick = () => {
                const u = document.getElementById("lrca-mc-u").value.trim(), key = h.san(u);
                if (!key || !st.db) return alert("أدخل اسم المستخدم.");
                const role = document.getElementById("lrca-mc-r").value, slogan = document.getElementById("lrca-mc-s").value.trim();
                const det = h.detectFromDOM(u) || {};
                st.db.ref(`${ROOT}/candidates/${key}`).set({
                    uid: det.uid || "", username: u, displayName: det.displayName || u, html: det.html || h.esc(u),
                    avatar: det.avatar || "", role, slogan, status: "approved", bonusVotes: 0, joinedAt: Date.now()
                }).then(() => {
                    this.log("إضافة مرشح يدوياً", u, role);
                    document.getElementById("lrca-mc-u").value = ""; document.getElementById("lrca-mc-s").value = "";
                    showToast(`✅ تمت إضافة (${u})`);
                });
            };

            // سجل الأصوات
            document.getElementById("lrca-vq").oninput = () => this.renderVotes();
            document.getElementById("lrca-wipe-votes").onclick = () => {
                if (confirm("⚠️ حذف جميع الأصوات في هذا الموسم؟")) st.db?.ref(`${ROOT}/votes`).remove().then(() => { this.log("تصفير الأصوات", "الجميع"); showToast("🗑️ تم تصفير الأصوات"); });
            };

            // الحظر
            document.getElementById("lrca-bgo").onclick = () => {
                const u = document.getElementById("lrca-bu").value.trim(), key = h.san(u);
                if (!key || !st.db) return alert("أدخل اسم المستخدم.");
                const scope = document.getElementById("lrca-bs").value, reason = document.getElementById("lrca-br").value.trim();
                st.db.ref(`${ROOT}/banned/${key}`).set({ name: u, scope, reason, by: st.myUser || "الإدارة", ts: Date.now() }).then(() => {
                    this.log("حظر من المسابقة", u, scope);
                    document.getElementById("lrca-bu").value = ""; document.getElementById("lrca-br").value = "";
                    showToast(`🚫 تم حظر (${u})`);
                });
            };

            // الإعدادات والنسخ الاحتياطي
            document.getElementById("lrca-s-save").onclick = () => {
                this.patchSettings({
                    enabled: document.getElementById("lrca-s-en").checked,
                    hideLiveVotes: document.getElementById("lrca-s-hide").checked,
                    requireApproval: document.getElementById("lrca-s-app").checked,
                    allowSelfVote: document.getElementById("lrca-s-self").checked,
                    allowVoteChange: document.getElementById("lrca-s-chg").checked,
                    allowGuestsVote: document.getElementById("lrca-s-gst").checked,
                    showToastAd: document.getElementById("lrca-s-ad").checked,
                    disabledMsg: document.getElementById("lrca-s-msg").value.trim() || DEFAULT_SETTINGS.disabledMsg
                }, "✅ تم حفظ الإعدادات");
            };
            document.getElementById("lrca-exp").onclick = () => {
                const blob = new Blob([JSON.stringify({ state: st.state, settings: st.settings, candidates: st.candidates, votes: st.votes, banned: st.banned, hall_of_fame: st.hof }, null, 2)], { type: "application/json" });
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
                        if (!p || "object" !== typeof p || !confirm("استعادة بيانات المسابقة من النسخة الاحتياطية؟")) return;
                        st.db.ref(ROOT).update(p).then(() => showToast("✅ تمت الاستعادة بنجاح", 3000, "gold"));
                    } catch (e) { alert("❌ ملف JSON غير صالح."); }
                };
                rd.readAsText(f);
            };
            document.getElementById("lrca-clr-logs").onclick = () => {
                if (confirm("مسح سجل العمليات؟")) st.db?.ref(`${ROOT}/logs`).remove().then(() => { st.logs = []; this.renderLogs(); });
            };
        },

        refresh() {
            if (!document.getElementById("lrc-admin-modal")) return;
            const info = getPhaseInfo();
            const phMap = { idle: "متوقفة", nomination: "الترشيح", voting: "التصويت", tiebreaker: "حسم تعادل", results: "النتائج" };
            const phEl = document.getElementById("lrca-st-ph");
            if (phEl) phEl.textContent = (info.paused ? "⏸️ " : "") + (phMap[info.phase] || info.phase);
            const cdEl = document.getElementById("lrca-cur-cd");
            if (cdEl) cdEl.textContent = info.remaining ? h.fmtTime(info.remaining) : "--:--:--";

            const cands = Object.values(st.candidates || {});
            const pendCnt = cands.filter(c => c && "pending" === c.status).length;
            const cnEl = document.getElementById("lrca-st-cn"); if (cnEl) cnEl.textContent = cands.length;
            const vtEl = document.getElementById("lrca-st-vt"); if (vtEl) vtEl.textContent = Object.keys(st.votes || {}).length;
            const bnEl = document.getElementById("lrca-st-bn"); if (bnEl) bnEl.textContent = Object.keys(st.banned || {}).length;
            const pb = document.getElementById("lrca-pbdg");
            if (pb) { pb.textContent = pendCnt; pb.style.display = pendCnt > 0 ? "inline-block" : "none"; }

            if ("cands" === st.adminTab) this.renderCands();
            else if ("votes" === st.adminTab) this.renderVotes();
            else if ("bans" === st.adminTab) this.renderBans();
            else if ("logs" === st.adminTab) { this.renderHof(); this.renderLogs(); }
        },

        renderCands() {
            const c = document.getElementById("lrca-cands-list"); if (!c) return;
            const counts = computeVoteCounts();
            const list = Object.entries(st.candidates || {}).sort((a, b) => ("pending" === a[1].status ? -1 : 1) - ("pending" === b[1].status ? -1 : 1) || (counts[b[0]] || 0) - (counts[a[0]] || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:18px;font-size:12px;">لا يوجد مرشحون حالياً.</div>'; return; }
            c.innerHTML = list.map(([k, it]) => {
                const pend = "pending" === it.status;
                return `<div class="lrca-card" style="${pend ? "border-color:#f59e0b;" : ""}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;">
                        <b style="font-size:12.5px;">${"queen" === it.role ? "👸" : "👑"} ${h.esc(it.displayName || it.username)} <span style="color:#64748b;font-size:10.5px;">(@${h.esc(it.username)})</span></b>
                        <div class="lrca-row" style="gap:4px;">
                            <span class="lrca-tag ${pend ? "lrca-t-red" : "lrca-t-green"}">${pend ? "⏳ معلق" : "✅ معتمد"}</span>
                            <span class="lrca-tag lrca-t-gold">${counts[k] || 0} صوت ${it.bonusVotes ? `(تعديل: ${it.bonusVotes > 0 ? "+" : ""}${it.bonusVotes})` : ""}</span>
                        </div>
                    </div>
                    ${it.slogan ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:7px;">«${h.esc(it.slogan)}»</div>` : ""}
                    <div class="lrca-row" style="gap:4px;">
                        ${pend ? `<button type="button" class="lrca-btn lrca-b-ok lrca-mini lrca-c-app" data-k="${h.esc(k)}">اعتماد ✓</button>` : ""}
                        <button type="button" class="lrca-btn lrca-b-info lrca-mini lrca-c-ed" data-k="${h.esc(k)}">تعديل الشعار</button>
                        <button type="button" class="lrca-btn lrca-b-warn lrca-mini lrca-c-adj" data-k="${h.esc(k)}">+/- أصوات</button>
                        <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-c-del" data-k="${h.esc(k)}" style="margin-right:auto;"><i class="fas fa-trash"></i> استبعاد</button>
                    </div>
                </div>`;
            }).join("");

            c.querySelectorAll(".lrca-c-app").forEach(b => b.onclick = () => {
                st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/status`).set("approved").then(() => { this.log("اعتماد مرشح", b.dataset.k); showToast("✅ تم اعتماد المرشح"); });
            });
            c.querySelectorAll(".lrca-c-ed").forEach(b => b.onclick = () => {
                const cur = st.candidates[b.dataset.k]?.slogan || "", nv = prompt("الشعار الجديد:", cur);
                if (null !== nv) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/slogan`).set(nv.trim().slice(0, 90));
            });
            c.querySelectorAll(".lrca-c-adj").forEach(b => b.onclick = () => {
                const cur = Number(st.candidates[b.dataset.k]?.bonusVotes) || 0;
                const val = parseInt(prompt("أدخل عدد الأصوات الإضافية (موجب للزيادة أو سالب للخصم):", String(cur)), 10);
                if (!isNaN(val)) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}/bonusVotes`).set(val).then(() => { this.log("تعديل أصوات", b.dataset.k, String(val)); showToast("✅ تم تعديل الرصيد"); });
            });
            c.querySelectorAll(".lrca-c-del").forEach(b => b.onclick = () => {
                if (confirm(`استبعاد وحذف المرشح (${b.dataset.k}) نهائياً؟`)) st.db?.ref(`${ROOT}/candidates/${b.dataset.k}`).remove().then(() => { this.log("استبعاد مرشح", b.dataset.k); showToast("🗑️ تم الاستبعاد"); });
            });
        },

        renderVotes() {
            const c = document.getElementById("lrca-votes-list"); if (!c) return;
            const q = (document.getElementById("lrca-vq")?.value || "").trim().toLowerCase();
            const list = Object.entries(st.votes || {})
                .map(([k, v]) => Object.assign({ k, targetName: st.candidates[v.target]?.displayName || v.target }, v))
                .filter(x => !q || `${x.voterName} ${x.targetName} ${x.k}`.toLowerCase().includes(q))
                .sort((a, b) => (b.ts || 0) - (a.ts || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا توجد أصوات مسجلة.</div>'; return; }
            c.innerHTML = list.slice(0, 120).map(v => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <div style="flex:1;min-width:0;"><b>${h.esc(v.voterName || v.k)}</b> ➔ <b style="color:#D4AF37;">${h.esc(v.targetName)}</b> <span style="color:#64748b;font-size:10px;">(${h.fmtDate(v.ts)})</span></div>
                    <button type="button" class="lrca-btn lrca-b-dng lrca-mini lrca-vdel" data-k="${h.esc(v.k)}" style="padding:3px 7px;">سحب</button>
                </div>`).join("");
            c.querySelectorAll(".lrca-vdel").forEach(b => b.onclick = () => {
                if (confirm("سحب وإلغاء هذا الصوت؟")) st.db?.ref(`${ROOT}/votes/${b.dataset.k}`).remove().then(() => { this.log("سحب صوت", b.dataset.k); showToast("🗑️ تم سحب الصوت"); });
            });
        },

        renderBans() {
            const c = document.getElementById("lrca-bans-list"); if (!c) return;
            const list = Object.entries(st.banned || {});
            const sMap = { all: "كامل", nom: "ترشيح فقط", vote: "تصويت فقط" };
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا يوجد محظورون.</div>'; return; }
            c.innerHTML = list.map(([k, b]) => `
                <div class="lrca-card" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div><b style="font-size:12.5px;">${h.esc(b.name || k)}</b> <span class="lrca-tag lrca-t-red">${sMap[b.scope] || "كامل"}</span><div style="font-size:10.5px;color:#94a3b8;">${h.esc(b.reason || "بدون سبب")}</div></div>
                    <button type="button" class="lrca-btn lrca-b-ok lrca-mini lrca-unb" data-k="${h.esc(k)}">فك الحظر</button>
                </div>`).join("");
            c.querySelectorAll(".lrca-unb").forEach(b => b.onclick = () => st.db?.ref(`${ROOT}/banned/${b.dataset.k}`).remove().then(() => { this.log("فك حظر", b.dataset.k); showToast("✅ تم فك الحظر"); }));
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
            if (!st.logs.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:12px;">لا توجد سجلات.</div>'; return; }
            c.innerHTML = st.logs.map(x => `
                <div style="padding:6px 9px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;">
                    <div style="display:flex;justify-content:space-between;"><span class="lrca-tag lrca-t-gold">${h.esc(x.action)}</span><span style="font-size:10px;color:#94a3b8;">${h.fmtDate(x.ts)}</span></div>
                    <div style="margin-top:2px;"><b style="color:#D4AF37;">${h.esc(x.admin)}</b> ➔ <b style="color:#38bdf8;">${h.esc(x.target)}</b> ${x.details ? `<span style="color:#94a3b8;">(${h.esc(x.details)})</span>` : ""}</div>
                </div>`).join("");
        }
    };

    // ==================== واجهة التطبيق العامة ====================
    window.LaylRoyalContest = {
        open() {
            if (!h.isAdmin() && !1 === st.settings.enabled) return alert(st.settings.disabledMsg || DEFAULT_SETTINGS.disabledMsg);
            const ban = h.getMyBan();
            if (!h.isAdmin() && ban && "all" === ban.scope) return alert(`تم منعك من مسابقة ملك وملكة الشات 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
            ensureUserModal();
            document.getElementById("lrc-mini-fab").style.display = "none";
            document.getElementById("lrc-modal").classList.add("open");
            renderMainBody();
            startCountdownLoop();
        },
        close() {
            clearInterval(st.timerId);
            document.getElementById("lrc-modal")?.classList.remove("open");
            const fab = document.getElementById("lrc-mini-fab");
            if (fab) fab.style.display = "none";
        },
        minimize() {
            document.getElementById("lrc-modal")?.classList.remove("open");
            const fab = document.getElementById("lrc-mini-fab");
            if (fab) fab.style.display = "flex";
        },
        restore() {
            this.open();
        },
        openAdmin: () => royalAdmin.open()
    };

    // ==================== ربط Firebase والهوية و LaylMenu ====================
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
                renderMainBody();
                royalAdmin.refresh();
            });
            st.db.ref(`${ROOT}/state`).on("value", sn => {
                st.state = sn.val() || null;
                const ph = getPhaseInfo().phase;
                if (st.lastPhaseAnnounced && st.lastPhaseAnnounced !== ph) {
                    if ("nomination" === ph) showBannerToastAd("👑 انطلقت مسابقة ملك وملكة الشات! رشّح نفسك الآن.");
                    else if ("voting" === ph) showBannerToastAd("🗳️ بدأ التصويت على لقب ملك وملكة الشات! صوّت للأفضل.");
                    else if ("results" === ph) showBannerToastAd("🏆 تم إعلان الفائز بلقب ملك / ملكة الشات! ادخل للتهنئة.");
                }
                st.lastPhaseAnnounced = ph;
                renderMainBody();
                royalAdmin.refresh();
            });
            st.db.ref(`${ROOT}/candidates`).on("value", sn => { st.candidates = sn.val() || {}; renderMainBody(); royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/votes`).on("value", sn => { st.votes = sn.val() || {}; renderMainBody(); royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/banned`).on("value", sn => { st.banned = sn.val() || {}; royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/hall_of_fame`).on("value", sn => { st.hof = sn.val() || {}; royalAdmin.refresh(); });
            st.db.ref(`${ROOT}/broadcast`).on("value", sn => {
                const v = sn.val();
                if (v && v.text && v.ts > st.bootTs && Date.now() - v.ts < 25000) showBannerToastAd(v.text);
            });
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
        }
    };
    document.addEventListener("click", e => {
        if (e.target.closest("#member-login-btn")) syncLogin("member-username");
        if (e.target.closest("#register-btn")) syncLogin("register-username");
    });

    const menuItems = [
        {
            id: "btn-layl-royal-contest",
            text: "مسابقة ملك وملكة الشات",
            icon: "fas fa-crown",
            iconColor: "#D4AF37",
            iconBg: "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(181,146,38,0.08))",
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

    initFirebase();
}();
