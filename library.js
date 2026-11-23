!function () {
    "use strict";
    if (window.lailLibraryLoaded) return;
    window.lailLibraryLoaded = !0;

    const DB_BASE = "https://raw.githubusercontent.com/shehabafz/graaam-db/refs/heads/main";
    const ADMIN_PATH = "lail_library/admin";

    const DEFAULT_SETTINGS = {
        enabled: !0,
        disabledMsg: "مكتبة ليل متوقفة مؤقتاً للصيانة. نعود قريباً 📚",
        allowGuests: !0,
        allowShare: !0,
        allowFavorites: !0,
        allowHistory: !0,
        allowCopyText: !0,
        allowNotes: !0,
        allowCustomBooksForVip: !1,
        requireReviewForVipBooks: !0,
        showLocalTab: !0,
        showPublicTab: !0,
        showFavTab: !0,
        showHistoryTab: !0,
        showShelvesRow: !0,
        showQuoteOfDay: !0,
        defaultTab: "local",
        defaultReaderTheme: "dark",
        defaultFontSize: 1.25,
        bannerText: "",
        bannerTheme: "gold",
        welcomePopupText: "",
        welcomePopupVersion: 0,
        featuredTitle: "👑 اختيارات إدارة ليل",
        quoteText: "«القراءة حياةٌ ثانية تمنحك عقولاً وتجارب لا تكفيها حياة واحدة.»",
        quoteAuthor: "مكتبة ليل",
        blockedCategories: [],
        blockedWords: [],
        vipUsers: [],
        subAdmins: []
    };

    const CATEGORIES = [
        { id: "all", name: "الكل (تصفح عام)", icon: "fa-globe" },
        { id: "fiction", name: "روايات خيالية", icon: "fa-book-open" },
        { id: "literature", name: "أدب عربي وعالمي", icon: "fa-pen-nib" },
        { id: "poetry", name: "شعر ودواوين", icon: "fa-feather-alt" },
        { id: "history", name: "تاريخ", icon: "fa-landmark" },
        { id: "science", name: "علوم", icon: "fa-flask" },
        { id: "philosophy", name: "فلسفة ومنطق", icon: "fa-brain" },
        { id: "biography", name: "سير وتراجم", icon: "fa-user-edit" },
        { id: "self-help", name: "تطوير الذات", icon: "fa-seedling" },
        { id: "religion", name: "دين وإسلاميات", icon: "fa-moon" },
        { id: "psychology", name: "علم النفس", icon: "fa-head-side-virus" },
        { id: "political", name: "سياسة وعلاقات", icon: "fa-university" },
        { id: "business", name: "اقتصاد وأعمال", icon: "fa-chart-line" },
        { id: "art", name: "فنون وتصميم", icon: "fa-palette" },
        { id: "medical", name: "طب وصحة", icon: "fa-stethoscope" },
        { id: "computers", name: "تقنية وبرمجة", icon: "fa-laptop-code" },
        { id: "travel", name: "جغرافيا ورحلات", icon: "fa-globe-americas" },
        { id: "cooking", name: "طبخ ووصفات", icon: "fa-utensils" }
    ];

    window.lailLocalNovelsCache = [];

    const st = {
        db: null,
        myUsername: null,
        adminUsers: [],
        settings: Object.assign({}, DEFAULT_SETTINGS),
        featured: {},
        customBooks: {},
        pendingBooks: {},
        shelves: {},
        blacklist: {},
        schedule: null,
        poll: null,
        myBan: null,
        listenedBanUser: null,
        listenedCmdUser: null,
        globalBound: !1,
        presenceCache: {},
        bannedCache: {},
        reportsCache: {},
        logsCache: [],
        presenceRef: null,
        reportsRef: null,
        pendingRef: null,
        myPresenceRef: null,
        countdownTimer: null,
        uiReady: !1,
        bootTs: Date.now(),
        lastRepTs: 0,
        toastTimer: null,
        readerFont: 1.25,
        readerTheme: "dark",
        fbTries: 0
    };

    try {
        st.myUsername = localStorage.getItem("pc_username") || ("ضيف_" + Math.floor(1e3 * Math.random()));
        st.readerFont = parseFloat(localStorage.getItem("lail_lib_font")) || 1.25;
        st.readerTheme = localStorage.getItem("lail_lib_theme") || "dark";
    } catch (e) {
        st.myUsername = "ضيف_" + Math.floor(1e3 * Math.random());
    }

    const h = {
        san: x => x ? String(x).replace(/[.#$\[\]\/]/g, "_").trim() : "",
        esc: x => String(x || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])),
        isGuest: () => { try { return !localStorage.getItem("pc_username"); } catch (e) { return !0; } },
        isSuperAdmin() {
            const u = st.myUsername;
            if (!u || !st.adminUsers.length) return !1;
            const s = h.san(u);
            return st.adminUsers.includes(u) || (s && st.adminUsers.includes(s));
        },
        isSubAdmin() {
            const list = st.settings.subAdmins;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUsername || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        isAdmin() {
            return h.isSuperAdmin() || h.isSubAdmin();
        },
        isVip() {
            const list = st.settings.vipUsers;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUsername || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        getActiveBan() {
            const b = st.myBan;
            if (!b) return null;
            if (b.expiresAt && Date.now() >= b.expiresAt) return null;
            return b;
        },
        banMsg(b) {
            const map = {
                full: "تم منعك من استخدام مكتبة ليل من قبل الإدارة 🚫",
                search_only: "تم إيقاف البحث عنك داخل المكتبة من قبل الإدارة 🚫",
                share_only: "تم إيقاف المشاركة عنك داخل المكتبة من قبل الإدارة 🚫",
                notes_only: "تم إيقاف الملاحظات والتصويت عنك داخل المكتبة 🚫"
            };
            let msg = map[b.scope] || map.full;
            if (b.reason) msg += `\nالسبب: ${b.reason}`;
            if (b.expiresAt) msg += `\nالوقت المتبقي: ${h.formatRemaining(b.expiresAt)}`;
            return msg;
        },
        isBlacklisted(id) {
            if (!id) return !1;
            const bl = st.blacklist || {};
            return Boolean(bl[h.san(id)] || bl[String(id)]);
        },
        isWordBlocked(q) {
            const bw = st.settings.blockedWords || [];
            if (!bw.length || !q) return !1;
            const low = String(q).toLowerCase();
            return bw.some(w => w && low.includes(String(w).toLowerCase()));
        },
        formatDate(ts) {
            if (!ts) return "-";
            try { return new Date(ts).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return "-"; }
        },
        formatRemaining(exp) {
            if (!exp) return "دائم";
            const diff = exp - Date.now();
            if (diff <= 0) return "منتهي";
            const mins = Math.ceil(diff / 6e4);
            if (mins < 60) return `${mins} دقيقة`;
            const hrs = Math.floor(mins / 60), rm = mins % 60;
            if (hrs < 24) return rm ? `${hrs} س و ${rm} د` : `${hrs} ساعة`;
            const days = Math.floor(hrs / 24), rh = hrs % 24;
            return rh ? `${days} ي و ${rh} س` : `${days} يوم`;
        },
        smartEmbed(url) {
            const u = String(url || "").trim();
            if (!u) return "";
            const gd = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
            return u;
        },
        isAudioUrl: u => /\.(mp3|m4a|ogg|wav|aac)(\?.*)?$/i.test(String(u || "").trim()),
        shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },
        copyText(text, onOk) {
            const fallback = () => {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                try { if (document.execCommand("copy") && onOk) onOk(); } catch (e) {}
                ta.remove();
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => { if (onOk) onOk(); }).catch(fallback);
            } else fallback();
        }
    };

    const CSS = `
    .lail-overlay{position:fixed;inset:0;width:100%;height:100%;background:rgba(10,10,12,.95);z-index:99999;display:none;justify-content:center;align-items:center;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);direction:rtl;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
    .lail-main-content{background:#18181b;width:92%;max-width:1100px;height:88vh;border-radius:16px;border:1px solid #27272a;display:flex;flex-direction:column;overflow:hidden;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.7);position:relative}
    .lail-header{padding:16px 25px;display:flex;justify-content:space-between;align-items:center;background:#1f1f22;border-bottom:1px solid #27272a;flex-shrink:0;gap:10px}
    .lail-header h3{margin:0;font-size:1.35rem;font-weight:bold;display:flex;align-items:center;gap:10px;color:#fff}
    .lail-header-acts{display:flex;align-items:center;gap:8px}
    .lail-vip-addbtn{background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.45);color:#fde68a;height:34px;padding:0 12px;border-radius:18px;font-size:.82rem;font-weight:bold;cursor:pointer;display:none;align-items:center;gap:6px;font-family:inherit}
    .lail-vip-addbtn:hover{background:rgba(212,175,55,.28);color:#fff}
    .lail-close-btn{background:transparent;border:none;color:#a1a1aa;font-size:1.4rem;cursor:pointer;transition:.2s}
    .lail-close-btn:hover{color:#ef4444;transform:scale(1.1)}
    .lail-tabs-container{display:flex;background:#1f1f22;border-bottom:1px solid #27272a;padding:0 25px;gap:20px;overflow-x:auto;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch;flex-shrink:0}
    .lail-tabs-container::-webkit-scrollbar{display:none}
    .lail-tab{padding:14px 10px;color:#a1a1aa;cursor:pointer;font-size:1.02rem;font-weight:bold;border-bottom:3px solid transparent;transition:.3s;display:flex;align-items:center;gap:8px;flex-shrink:0}
    .lail-tab:hover{color:#fff}
    .lail-tab.active{color:#8b5cf6;border-bottom-color:#8b5cf6}
    .lail-lib-banner{margin:10px 25px 0;padding:10px 15px;border-radius:12px;background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(212,175,55,.16));border:1px solid rgba(212,175,55,.38);color:#fef3c7;font-size:.9rem;font-weight:600;display:none;align-items:center;gap:10px;flex-shrink:0}
    .lail-lib-banner.th-red{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.45);color:#fecaca}
    .lail-lib-banner.th-blue{background:rgba(59,130,246,.18);border-color:rgba(59,130,246,.45);color:#bfdbfe}
    .lail-lib-banner.th-green{background:rgba(16,185,129,.18);border-color:rgba(16,185,129,.45);color:#a7f3d0}
    .lail-lib-off-banner{margin:8px 25px 0;padding:7px 14px;border-radius:10px;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.45);color:#fecaca;font-size:.85rem;font-weight:bold;text-align:center;display:none;flex-shrink:0}
    .lail-library-section{display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0}
    .lail-search-area{padding:16px 25px 10px;background:#18181b;border-bottom:1px solid #27272a;flex-shrink:0}
    .lail-search-bar{display:flex;flex-direction:row;gap:10px;margin-bottom:8px;width:100%;align-items:center;justify-content:center}
    .lail-search-bar input{flex:1;min-width:0;height:44px;padding:0 15px;border-radius:10px;border:1px solid #3f3f46;background:#27272a;color:#fff;outline:none;font-size:1rem;transition:.2s;box-sizing:border-box}
    .lail-search-bar input:focus{border-color:#8b5cf6;background:#1f1f22;box-shadow:0 0 0 3px rgba(139,92,246,.1)}
    .lail-search-btn{height:44px;background:#8b5cf6;color:#fff;border:none;padding:0 20px;border-radius:10px;font-weight:bold;font-size:.95rem;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;flex-shrink:0}
    .lail-search-btn:hover{background:#7c3aed}
    .lail-sidebar-btn{background:#27272a;color:#e4e4e7;border:1px solid #3f3f46}
    .lail-sidebar-btn:hover{background:#3f3f46}
    .lail-public-search-btn{background:#10b981}
    .lail-public-search-btn:hover{background:#059669}
    .lail-sidebar-overlay{position:absolute;inset:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:50;display:none;opacity:0;transition:opacity .3s}
    .lail-sidebar{position:absolute;top:0;right:-320px;width:300px;height:100%;background:#18181b;z-index:51;transition:right .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;border-left:1px solid #27272a;box-shadow:-5px 0 25px rgba(0,0,0,.5)}
    .lail-sidebar-header{padding:18px 22px;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:center;background:#1f1f22}
    .lail-sidebar-title{color:#fff;font-size:1.1rem;font-weight:bold;margin:0;display:flex;gap:10px;align-items:center}
    .lail-sidebar-close{background:none;border:none;color:#a1a1aa;font-size:1.3rem;cursor:pointer;transition:.2s}
    .lail-sidebar-close:hover{color:#ef4444;transform:rotate(90deg)}
    .lail-sidebar-menu{flex:1;overflow-y:auto;padding:12px 0}
    .lail-sidebar-item{padding:13px 22px;color:#d4d4d8;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:14px;font-size:1rem;border-right:3px solid transparent}
    .lail-sidebar-item:hover{background:#27272a;color:#fff}
    .lail-sidebar-item.active{background:rgba(16,185,129,.1);color:#10b981;border-right-color:#10b981;font-weight:bold}
    .lail-books-grid{padding:20px 25px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:20px;overflow-y:auto;flex:1;background:#18181b;align-content:start;scroll-behavior:smooth}
    .lail-lib-fullrow{grid-column:1/-1;margin-bottom:8px}
    .lail-lib-rowtitle{font-size:1.08rem;font-weight:800;color:#D4AF37;margin:0 0 12px;display:flex;align-items:center;gap:8px;border-right:4px solid #D4AF37;padding-right:10px}
    .lail-lib-hscroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}
    .lail-lib-hscroll::-webkit-scrollbar{display:none}
    .lail-lib-hscroll .lail-book-card{width:155px;flex-shrink:0}
    .lail-lib-quote{grid-column:1/-1;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,rgba(139,92,246,.14),rgba(212,175,55,.08));border:1px solid rgba(139,92,246,.32);margin-bottom:8px;text-align:center}
    .lail-lib-event{grid-column:1/-1;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,rgba(74,9,26,.55),rgba(18,20,36,.92));border:1px solid rgba(212,175,55,.42);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}
    .lail-lib-cd{background:rgba(0,0,0,.45);border:1px solid rgba(212,175,55,.35);color:#D4AF37;padding:6px 13px;border-radius:10px;font-weight:900;font-size:1rem;direction:ltr}
    .lail-lib-pollbox{grid-column:1/-1;padding:14px 18px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(212,175,55,.32);margin-bottom:8px}
    .lail-lib-pollgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px}
    .lail-lib-pollopt{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px 10px;cursor:pointer;transition:.2s;text-align:right;color:#fff;font-family:inherit}
    .lail-lib-pollopt:hover,.lail-lib-pollopt.voted{border-color:#D4AF37;background:rgba(212,175,55,.12)}
    .lail-book-card{background:#27272a;border-radius:14px;overflow:hidden;cursor:pointer;transition:.25s ease;display:flex;flex-direction:column;border:1px solid #3f3f46;height:310px;position:relative}
    .lail-book-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(0,0,0,.4);border-color:#8b5cf6}
    .lail-book-card.is-feat{border-color:rgba(212,175,55,.55)}
    .lail-book-cover{width:100%;height:220px;flex-shrink:0;object-fit:cover;background:#1f1f22;border-bottom:1px solid #3f3f46;display:flex;align-items:center;justify-content:center;font-size:2.8rem;color:#3f3f46}
    .lail-book-info{padding:11px;display:flex;flex-direction:column;justify-content:center;flex:1}
    .lail-book-title{font-size:.92rem;margin:0 0 4px;color:#f4f4f5;font-weight:bold;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.35}
    .lail-book-author{font-size:.78rem;color:#a1a1aa;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .lail-badge{position:absolute;top:9px;right:9px;color:#fff;font-size:.72rem;font-weight:bold;padding:4px 10px;border-radius:10px;backdrop-filter:blur(4px);box-shadow:0 4px 10px rgba(0,0,0,.3);z-index:10;max-width:68%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .badge-local{background:rgba(139,92,246,.95)}
    .badge-google{background:rgba(59,130,246,.95)}
    .badge-archive{background:rgba(16,185,129,.95)}
    .badge-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#111}
    .lail-card-actions{position:absolute;top:9px;left:9px;display:flex;gap:6px;z-index:10}
    .lail-action-btn{background:rgba(0,0,0,.55);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:.88rem;backdrop-filter:blur(4px);transition:.2s;border:1px solid rgba(255,255,255,.12);cursor:pointer}
    .lail-action-btn:hover{background:rgba(0,0,0,.85);transform:scale(1.08)}
    .lail-like-btn.active{color:#ef4444;background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.45)}
    .lail-share-btn.copied{color:#10b981;background:rgba(16,185,129,.18);border-color:rgba(16,185,129,.45)}
    .lail-loader{grid-column:1/-1;text-align:center;color:#a1a1aa;padding:40px;font-size:1.05rem}
    .lail-reader-wrapper{background:#0f0f12;width:95%;max-width:1000px;height:95vh;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.8);border:1px solid #27272a}
    .lail-reader-header{padding:12px 20px;display:flex;justify-content:space-between;align-items:center;background:#18181b;border-bottom:1px solid #27272a;z-index:20;gap:10px}
    .lail-reader-title{margin:0;font-size:1.05rem;font-weight:bold;color:#e4e4e7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;display:flex;align-items:center;gap:8px}
    .lail-reader-actions{display:flex;gap:6px;flex-shrink:0;align-items:center}
    .lail-reader-btn{background:#27272a;border:none;width:35px;height:35px;border-radius:10px;font-size:.98rem;cursor:pointer;color:#a1a1aa;transition:.2s;display:flex;align-items:center;justify-content:center}
    .lail-reader-btn:hover{background:#3f3f46;color:#fff}
    .lail-reader-btn.close:hover{background:rgba(239,68,68,.15);color:#ef4444}
    .lail-reader-btn.rep{color:#fcd34d}
    .lail-reader-btn.rep:hover{background:#f59e0b;color:#111}
    .lail-reader-btn.blk{color:#fca5a5}
    .lail-reader-btn.blk:hover{background:#ef4444;color:#fff}
    .lail-reader-btn.note{color:#93c5fd}
    .lail-reader-btn.note:hover{background:#3b82f6;color:#fff}
    .lail-reader-body{flex:1;width:100%;position:relative;overflow:hidden;background:#fff}
    #lail-iframe-reader{width:100%;height:100%;border:none;position:absolute;inset:0;z-index:2;background:#fff;display:none}
    #lail-text-reader{width:100%;height:100%;background:#0f0f12;color:#d4d4d8;z-index:3;position:absolute;inset:0;overflow-y:auto;padding:0;scroll-behavior:smooth;display:none;transition:background .25s,color .25s}
    #lail-text-reader.th-sepia{background:#f4ecd8;color:#3b2f2f}
    #lail-text-reader.th-sepia .novel-text-content{color:#3b2f2f}
    #lail-text-reader.th-sepia .lail-chapter-glass-header{background:rgba(244,236,216,.92);border-bottom-color:#d8caa8}
    #lail-text-reader.th-sepia .lail-chapter-title{color:#7c3aed}
    #lail-text-reader.th-light{background:#ffffff;color:#18181b}
    #lail-text-reader.th-light .novel-text-content{color:#18181b}
    #lail-text-reader.th-light .lail-chapter-glass-header{background:rgba(255,255,255,.92);border-bottom-color:#e4e4e7}
    #lail-text-reader.th-light .lail-chapter-title{color:#6d28d9}
    .novel-text-content{max-width:800px;margin:0 auto;line-height:2.25;color:#d4d4d8;text-align:justify;padding:28px 20px 60px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;white-space:pre-line}
    .novel-text-content.no-copy{user-select:none;-webkit-user-select:none}
    .novel-text-content img{max-width:100%;border-radius:12px;margin:20px 0}
    .lail-audio-bar{max-width:800px;margin:16px auto 0;padding:12px 18px;background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.35);border-radius:14px;display:flex;align-items:center;gap:12px}
    .lail-chapter-glass-header{position:sticky;top:0;z-index:10;background:rgba(15,15,18,.88);backdrop-filter:blur(12px);border-bottom:1px solid #27272a;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    .lail-chapter-title{color:#d8b4fe;font-size:1.1rem;font-weight:bold;margin:0}
    .lail-reader-tools{display:flex;gap:6px;align-items:center}
    .lail-tool-btn{background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.35);color:#c4b5fd;padding:5px 10px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:.82rem}
    .lail-btn-outline{background:transparent;border:1px solid #3f3f46;color:#e4e4e7;padding:7px 15px;border-radius:10px;cursor:pointer;font-weight:bold;transition:.2s;display:flex;align-items:center;gap:6px;font-size:.9rem}
    .lail-btn-outline:hover{background:#27272a;border-color:#a855f7;color:#a855f7}
    .lail-btn-primary{background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;padding:9px 20px;border-radius:10px;cursor:pointer;font-weight:bold;transition:.2s;display:flex;align-items:center;gap:8px;font-size:.95rem}
    .lail-chapters-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px;max-width:900px;margin:0 auto;padding:0 20px 40px}
    .lail-chapter-card{background:#18181b;border:1px solid #27272a;color:#a1a1aa;padding:16px 10px;border-radius:14px;cursor:pointer;transition:.25s;text-align:center;font-weight:bold;font-size:1rem}
    .lail-chapter-card:hover{background:#27272a;border-color:#8b5cf6;color:#fff;transform:translateY(-3px)}
    .lail-pagination{max-width:800px;margin:20px auto 0;padding:10px 20px 50px;display:flex;justify-content:space-between;align-items:center;border-top:1px dashed #27272a}
    .lail-minimized{position:fixed;bottom:90px;right:30px;background:#18181b;color:#fff;padding:13px 22px;border-radius:30px;box-shadow:0 10px 25px rgba(0,0,0,.6);display:none;align-items:center;gap:10px;z-index:999999;cursor:pointer;font-weight:bold;direction:rtl;border:1px solid #3f3f46;max-width:290px}
    .lail-lib-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:#121424;border:1px solid #8b5cf6;color:#fff;padding:11px 22px;border-radius:30px;font-size:.92rem;font-weight:bold;box-shadow:0 10px 30px rgba(0,0,0,.7);z-index:2147483647;opacity:0;pointer-events:none;transition:all .35s ease;text-align:center;max-width:88vw;direction:rtl}
    .lail-lib-toast.th-gold{border-color:#D4AF37;background:linear-gradient(135deg,#241e0d,#121424);color:#fde68a}
    .lail-lib-toast.th-red{border-color:#ef4444;background:linear-gradient(135deg,#331014,#121424);color:#fecaca}
    .lail-lib-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    .lail-lib-popov{position:fixed;inset:0;background:rgba(8,10,18,.9);z-index:2147483646;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);direction:rtl;font-family:'Segoe UI',tahoma,sans-serif;opacity:0;transition:opacity .2s}
    .lail-lib-popov.active{opacity:1}
    .lail-lib-popbox{background:linear-gradient(180deg,#1c1f38,#101222);border:1px solid rgba(139,92,246,.45);border-radius:18px;width:92%;max-width:450px;max-height:86vh;overflow-y:auto;padding:18px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,.9);box-sizing:border-box}
    @media(max-width:768px){
        .lail-main-content,.lail-reader-wrapper{width:100%;height:100%;max-width:100%;border-radius:0;border:none}
        .lail-header,.lail-search-area,.lail-sidebar-header,.lail-reader-header{padding:11px 14px}
        .lail-tabs-container{padding:0 14px;gap:12px}
        .lail-tab{padding:11px 5px;font-size:.92rem}
        .lail-lib-banner,.lail-lib-off-banner{margin-left:14px;margin-right:14px}
        .lail-books-grid{padding:14px;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
        .lail-book-card{height:245px;border-radius:10px}
        .lail-book-cover{height:155px;font-size:2rem}
        .lail-book-title{font-size:.83rem}
        .lail-reader-btn{width:31px;height:31px;font-size:.9rem}
        .lail-chapter-glass-header{padding:10px 14px}
        .lail-sidebar{width:280px;right:-280px}
        .lail-minimized{bottom:85px;right:18px;padding:10px 15px;font-size:.85rem}
    }`;

    function showToast(msg, ms = 3500, theme = "") {
        let el = document.getElementById("lail-lib-toast");
        if (!el) {
            document.body.insertAdjacentHTML("beforeend", '<div id="lail-lib-toast" class="lail-lib-toast"></div>');
            el = document.getElementById("lail-lib-toast");
        }
        clearTimeout(st.toastTimer);
        el.className = "lail-lib-toast" + ("gold" === theme ? " th-gold" : "red" === theme ? " th-red" : "");
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add("show"));
        st.toastTimer = setTimeout(() => el.classList.remove("show"), ms);
    }

    function setPresence(txt) {
        if (!st.db) return;
        const san = h.san(st.myUsername);
        if (!san) return;
        if (!txt) {
            if (st.myPresenceRef) { st.myPresenceRef.remove().catch(() => {}); st.myPresenceRef = null; }
            return;
        }
        const ref = st.db.ref(`lail_library/presence/${san}`);
        st.myPresenceRef = ref;
        ref.onDisconnect().remove();
        ref.set({ name: st.myUsername, reading: txt, ts: Date.now() }).catch(() => {});
    }

    function makeFallbackCover(isLocal) {
        const d = document.createElement("div");
        d.className = "lail-book-cover";
        d.innerHTML = `<i class="fas ${isLocal ? "fa-book-open" : "fa-globe"}"></i>`;
        return d;
    }

    function createBookCard(opts) {
        const card = document.createElement("div");
        card.className = "lail-book-card" + (opts.isFeatured ? " is-feat" : "");
        card.addEventListener("click", opts.onOpen);

        const badge = document.createElement("div");
        badge.className = "lail-badge " + opts.badgeClass;
        badge.innerHTML = opts.badgeHtml;
        card.appendChild(badge);

        const actions = document.createElement("div");
        actions.className = "lail-card-actions";

        if (!1 !== st.settings.allowFavorites) {
            const likeBtn = document.createElement("div");
            likeBtn.className = "lail-action-btn lail-like-btn" + (window.lailApp.favorites.isFavorite(opts.id) ? " active" : "");
            likeBtn.dataset.bookId = String(opts.id);
            likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
            likeBtn.addEventListener("click", ev => {
                window.lailApp.favorites.toggleFavorite(opts.id, opts.title, opts.author || "", opts.coverUrl || "", opts.type, opts.source || null, ev);
            });
            actions.appendChild(likeBtn);
        }

        if (!1 !== st.settings.allowShare) {
            const shareBtn = document.createElement("div");
            shareBtn.className = "lail-action-btn lail-share-btn";
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
            shareBtn.addEventListener("click", ev => {
                window.lailApp.shareBook(opts.title, opts.author || "غير معروف", opts.type, opts.source || null, ev);
            });
            actions.appendChild(shareBtn);
        }

        card.appendChild(actions);

        if (opts.coverUrl) {
            const img = document.createElement("img");
            img.className = "lail-book-cover";
            img.loading = "lazy";
            img.decoding = "async";
            img.src = opts.coverUrl;
            img.onerror = () => img.replaceWith(makeFallbackCover("local" === opts.type || "custom" === opts.type));
            card.appendChild(img);
        } else {
            card.appendChild(makeFallbackCover("local" === opts.type || "custom" === opts.type));
        }

        const info = document.createElement("div");
        info.className = "lail-book-info";
        const h4 = document.createElement("h4");
        h4.className = "lail-book-title";
        h4.textContent = opts.title || "بدون عنوان";
        info.appendChild(h4);

        if (opts.subText) {
            const sub = document.createElement("p");
            sub.className = "lail-book-author";
            sub.style.color = "#a855f7";
            sub.style.fontWeight = "bold";
            sub.textContent = opts.subText;
            info.appendChild(sub);
        } else if (opts.author) {
            const p = document.createElement("p");
            p.className = "lail-book-author";
            p.textContent = opts.author;
            info.appendChild(p);
        }

        card.appendChild(info);
        return card;
    }

    function renderSidebarCategories() {
        const menu = document.getElementById("lail-public-sidebar-menu");
        if (!menu) return;
        const blocked = st.settings.blockedCategories || [];
        const visible = CATEGORIES.filter(c => "all" === c.id || !blocked.includes(c.id));
        menu.innerHTML = visible.map(c =>
            `<div class="lail-sidebar-item ${"all" === c.id ? "active" : ""}" id="cat-${c.id}" data-cat-id="${c.id}" data-cat-name="${h.esc(c.name)}"><i class="fas ${c.icon}" style="width:24px;text-align:center;color:#a1a1aa;"></i> ${h.esc(c.name)}</div>`
        ).join("");
        menu.querySelectorAll(".lail-sidebar-item").forEach(el => {
            el.addEventListener("click", () => {
                window.lailApp.public.fetchCategory(el.dataset.catId, el.dataset.catName, el);
            });
        });
    }

    function openBookItem(it) {
        if (!it) return;
        if ("custom" === it.type) window.lailApp.reader.openCustomBook(it.id);
        else if ("local" === it.type) window.lailApp.reader.openLocalNovel(it.id, it.title, !1, it.coverUrl || "");
        else window.lailApp.reader.openPublicBook(it.id, it.title, it.source || "google", it.coverUrl || "", it.author || "");
    }

    function renderHomeHighlights(grid) {
        if (!grid) return;
        if (st.countdownTimer) { clearInterval(st.countdownTimer); st.countdownTimer = null; }

        // 1. اقتباس اليوم
        if (!1 !== st.settings.showQuoteOfDay && st.settings.quoteText) {
            const qBox = document.createElement("div");
            qBox.className = "lail-lib-quote";
            qBox.innerHTML = `<div style="color:#c4b5fd;font-size:.82rem;font-weight:bold;margin-bottom:4px;">✨ اقتباس اليوم</div><div style="font-size:1rem;font-weight:700;color:#fff;line-height:1.7;">${h.esc(st.settings.quoteText)}</div>${st.settings.quoteAuthor ? `<div style="font-size:.8rem;color:#D4AF37;margin-top:4px;">— ${h.esc(st.settings.quoteAuthor)}</div>` : ""}`;
            grid.appendChild(qBox);
        }

        // 2. ماراثون / تحدي القراءة المجدول بعدّاد تنازلي
        const sch = st.schedule;
        if (sch && sch.active && sch.time) {
            const evBox = document.createElement("div");
            evBox.className = "lail-lib-event";
            evBox.innerHTML = `
                <div>
                    <div style="color:#D4AF37;font-size:.82rem;font-weight:bold;">👑 ${h.esc(sch.note || "تحدي القراءة في ليل")}</div>
                    <div style="font-size:1.08rem;font-weight:900;margin-top:2px;">📖 ${h.esc(sch.title)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div id="lail-lib-cdval" class="lail-lib-cd">...</div>
                    ${sch.bookId ? `<button type="button" class="lail-search-btn" style="height:36px;padding:0 14px;font-size:.85rem;" id="lail-lib-evopen">ابدأ القراءة</button>` : ""}
                </div>`;
            grid.appendChild(evBox);
            if (sch.bookId) {
                document.getElementById("lail-lib-evopen").onclick = () => openBookItem({
                    id: sch.bookId, title: sch.title, type: sch.bookType || "local", source: sch.source || "google", coverUrl: sch.coverUrl || ""
                });
            }
            const tick = () => {
                const el = document.getElementById("lail-lib-cdval"); if (!el) return;
                const diff = sch.time - Date.now();
                if (diff <= 0) { el.textContent = "📚 انطلق الماراثون!"; return; }
                const d = Math.floor(diff / 864e5), hr = Math.floor(diff % 864e5 / 36e5), mn = Math.floor(diff % 36e5 / 6e4), sc = Math.floor(diff % 6e4 / 1e3);
                el.textContent = (d ? `${d}d ` : "") + `${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}:${String(sc).padStart(2, "0")}`;
            };
            tick();
            st.countdownTimer = setInterval(tick, 1000);
        }

        // 3. التصويت التفاعلي
        const p = st.poll;
        if (p && p.active && Array.isArray(p.options) && p.options.length) {
            const mySan = h.san(st.myUsername),
                myVote = p.votes && void 0 !== p.votes[mySan] ? Number(p.votes[mySan]) : -1,
                allVotes = Object.values(p.votes || {}),
                tot = allVotes.length;
            const pollDiv = document.createElement("div");
            pollDiv.className = "lail-lib-pollbox";
            pollDiv.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div style="font-weight:800;color:#D4AF37;font-size:.98rem;">${h.esc(p.question || "🗳️ صوّت لكتاب الأسبوع")}</div>
                    <span style="font-size:.8rem;color:#94a3b8;">${tot} صوت</span>
                </div>
                <div class="lail-lib-pollgrid">
                    ${p.options.map((o, idx) => {
                        const cnt = allVotes.filter(v => Number(v) === idx).length;
                        const pct = tot ? Math.round((cnt / tot) * 100) : 0;
                        return `<button type="button" class="lail-lib-pollopt ${myVote === idx ? "voted" : ""}" data-pidx="${idx}">
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:bold;font-size:.88rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📖 ${h.esc(o.title)}</div>
                                <div style="font-size:.76rem;color:#D4AF37;margin-top:3px;">${cnt} صوت (${pct}%) ${myVote === idx ? "✓" : ""}</div>
                            </div>
                        </button>`;
                    }).join("")}
                </div>`;
            pollDiv.querySelectorAll(".lail-lib-pollopt").forEach(b => {
                b.onclick = () => {
                    if (!h.isAdmin()) {
                        const ban = h.getActiveBan();
                        if (ban && ("notes_only" === ban.scope || "full" === ban.scope)) return alert(h.banMsg(ban));
                    }
                    if (!st.db) return showToast("تعذر الاتصال بقاعدة البيانات", 3000, "red");
                    st.db.ref(`${ADMIN_PATH}/poll/votes/${h.san(st.myUsername)}`).set(Number(b.dataset.pidx))
                        .then(() => showToast("✅ تم تسجيل صوتك!", 2500, "gold"));
                };
            });
            grid.appendChild(pollDiv);
        }

        // 4. صف اختيارات الإدارة
        const featItems = Object.values(st.featured || {})
            .filter(x => x && x.id && !h.isBlacklisted(x.id))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (featItems.length) {
            const row = document.createElement("div");
            row.className = "lail-lib-fullrow";
            row.innerHTML = `<div class="lail-lib-rowtitle">${h.esc(st.settings.featuredTitle || DEFAULT_SETTINGS.featuredTitle)}</div><div class="lail-lib-hscroll"></div>`;
            const sc = row.querySelector(".lail-lib-hscroll");
            featItems.forEach(it => {
                sc.appendChild(createBookCard({
                    id: it.id, title: it.title, author: it.author || "", coverUrl: it.coverUrl || "",
                    type: it.type || "local", source: it.source || null, isFeatured: !0,
                    badgeClass: "badge-gold", badgeHtml: h.esc(it.badge || "اختيار الإدارة ⭐"),
                    onOpen: () => openBookItem(it)
                }));
            });
            grid.appendChild(row);
        }

        // 5. أرفف الكتب المخصصة (Shelves)
        if (!1 !== st.settings.showShelvesRow) {
            Object.values(st.shelves || {})
                .filter(sh => sh && Array.isArray(sh.items) && sh.items.length)
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .forEach(sh => {
                    const clean = sh.items.filter(x => x && !h.isBlacklisted(x.id));
                    if (!clean.length) return;
                    const row = document.createElement("div");
                    row.className = "lail-lib-fullrow";
                    row.innerHTML = `<div class="lail-lib-rowtitle" style="color:#c4b5fd;border-right-color:#8b5cf6;">📚 ${h.esc(sh.title)}</div><div class="lail-lib-hscroll"></div>`;
                    const sc = row.querySelector(".lail-lib-hscroll");
                    clean.forEach(it => {
                        sc.appendChild(createBookCard({
                            id: it.id, title: it.title, author: it.author || "", coverUrl: it.coverUrl || "",
                            type: it.type || "local", source: it.source || null,
                            badgeClass: "badge-local", badgeHtml: h.esc(sh.badge || "رف مختار"),
                            onOpen: () => openBookItem(it)
                        }));
                    });
                    grid.appendChild(row);
                });
        }

        // 6. إضافات إدارة ليل الخاصة (نصية / صوتية / PDF)
        const customItems = Object.values(st.customBooks || {})
            .filter(x => x && x.id && !h.isBlacklisted(x.id))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (customItems.length) {
            const row = document.createElement("div");
            row.className = "lail-lib-fullrow";
            row.innerHTML = `<div class="lail-lib-rowtitle" style="color:#6ee7b7;border-right-color:#10b981;">💎 مكتبة ليل الخاصة (حصري)</div><div class="lail-lib-hscroll"></div>`;
            const sc = row.querySelector(".lail-lib-hscroll");
            customItems.forEach(it => {
                const lbl = "audio" === it.mode ? "🎧 كتاب صوتي" : "url" === it.mode ? "PDF / رابط" : (Array.isArray(it.chapters) && it.chapters.length > 1 ? `${it.chapters.length} فصل` : "كتاب خاص");
                sc.appendChild(createBookCard({
                    id: it.id, title: it.title, author: it.author || "", coverUrl: it.coverUrl || "",
                    type: "custom", source: null, badgeClass: "badge-archive",
                    badgeHtml: h.esc(it.badge || lbl),
                    onOpen: () => window.lailApp.reader.openCustomBook(it.id)
                }));
            });
            grid.appendChild(row);
        }
    }

    function ensureUI() {
        if (st.uiReady) return;
        st.uiReady = !0;

        if (!document.getElementById("lail-library-style")) {
            const s = document.createElement("style");
            s.id = "lail-library-style";
            s.textContent = CSS;
            document.head.appendChild(s);
        }

        if (!document.getElementById("lail-main-modal")) {
            document.body.insertAdjacentHTML("beforeend", `
            <div id="lail-main-modal" class="lail-overlay">
                <div class="lail-main-content">
                    <div class="lail-header">
                        <h3><i class="fas fa-book-reader" style="color:#8b5cf6;"></i> مكتبة ليل</h3>
                        <div class="lail-header-acts">
                            <button id="lib-vip-submit-btn" class="lail-vip-addbtn" type="button" onclick="window.lailApp.openVipSubmitModal()"><i class="fas fa-feather-alt"></i> اقترح / أضف عملاً</button>
                            <button class="lail-close-btn" type="button" onclick="window.lailApp.closeLibrary()"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="lail-tabs-container">
                        <div id="tab-local" class="lail-tab active" onclick="window.lailApp.switchTab('local')"><i class="fas fa-book-open"></i> ليل للروايات</div>
                        <div id="tab-public" class="lail-tab" onclick="window.lailApp.switchTab('public')"><i class="fas fa-globe"></i> المكتبة العامة</div>
                        <div id="tab-favorites" class="lail-tab" onclick="window.lailApp.switchTab('favorites')"><i class="fas fa-heart"></i> مفضلاتي</div>
                        <div id="tab-history" class="lail-tab" onclick="window.lailApp.switchTab('history')"><i class="fas fa-history"></i> سجل القراءة</div>
                    </div>
                    <div id="lib-admin-off-banner" class="lail-lib-off-banner">🛑 مكتبة ليل متوقفة حالياً عن الأعضاء (مفتوحة لك بصلاحية الإدارة / VIP)</div>
                    <div id="lib-announcement-banner" class="lail-lib-banner"><i class="fas fa-bullhorn" style="color:#D4AF37;"></i><span id="lib-announcement-text"></span></div>

                    <div id="section-local" class="lail-library-section">
                        <div class="lail-search-area">
                            <div class="lail-search-bar">
                                <input id="input-local-search" type="text" placeholder="ابحث عن رواية أو كاتب في مكتبة ليل..." autocomplete="off">
                                <button class="lail-search-btn" type="button" onclick="window.lailApp.local.triggerSearch()"><i class="fas fa-search"></i> بحث</button>
                            </div>
                        </div>
                        <div id="grid-local" class="lail-books-grid"></div>
                    </div>

                    <div id="section-public" class="lail-library-section" style="display:none;position:relative;">
                        <div id="lail-public-sidebar-overlay" class="lail-sidebar-overlay" onclick="window.lailApp.public.toggleSidebar(false)"></div>
                        <div id="lail-public-sidebar" class="lail-sidebar">
                            <div class="lail-sidebar-header">
                                <h4 class="lail-sidebar-title"><i class="fas fa-layer-group" style="color:#10b981;"></i> تصنيفات المكتبة</h4>
                                <button class="lail-sidebar-close" type="button" onclick="window.lailApp.public.toggleSidebar(false)"><i class="fas fa-times"></i></button>
                            </div>
                            <div id="lail-public-sidebar-menu" class="lail-sidebar-menu"></div>
                        </div>
                        <div class="lail-search-area">
                            <div class="lail-search-bar">
                                <button class="lail-search-btn lail-sidebar-btn" type="button" onclick="window.lailApp.public.toggleSidebar(true)"><i class="fas fa-bars"></i> الأقسام</button>
                                <input id="input-public-search" type="text" placeholder="ابحث في الكتب والمراجع..." autocomplete="off">
                                <button class="lail-search-btn lail-public-search-btn" type="button" onclick="window.lailApp.public.triggerSearch()"><i class="fas fa-search"></i> بحث</button>
                            </div>
                        </div>
                        <div id="grid-public" class="lail-books-grid"></div>
                    </div>

                    <div id="section-favorites" class="lail-library-section" style="display:none;">
                        <div class="lail-search-area" style="display:flex;justify-content:space-between;align-items:center;">
                            <h4 style="margin:0;color:#fff;font-size:1.05rem;"><i class="fas fa-heart" style="color:#ef4444;"></i> الكتب المفضلة</h4>
                        </div>
                        <div id="grid-favorites" class="lail-books-grid"></div>
                    </div>

                    <div id="section-history" class="lail-library-section" style="display:none;">
                        <div class="lail-search-area" style="display:flex;justify-content:space-between;align-items:center;">
                            <h4 style="margin:0;color:#fff;font-size:1.05rem;"><i class="fas fa-clock" style="color:#f59e0b;"></i> آخر ما قرأت</h4>
                            <button class="lail-btn-outline" type="button" onclick="window.lailApp.history.clearHistory()" style="padding:6px 12px;border-color:#ef4444;color:#ef4444;font-size:.85rem;"><i class="fas fa-trash"></i> مسح السجل</button>
                        </div>
                        <div id="grid-history" class="lail-books-grid"></div>
                    </div>
                </div>
            </div>

            <div id="lail-unified-reader" class="lail-overlay">
                <div class="lail-reader-wrapper">
                    <div class="lail-reader-header">
                        <h3 id="reader-title" class="lail-reader-title">جاري التحميل...</h3>
                        <div class="lail-reader-actions">
                            <button id="lib-reader-note-btn" class="lail-reader-btn note" type="button" onclick="window.lailApp.openNoteModal()" title="ملاحظاتي واقتباساتي"><i class="fas fa-sticky-note"></i></button>
                            <button id="lib-reader-report-btn" class="lail-reader-btn rep" type="button" onclick="window.lailApp.openReportModal()" title="إبلاغ عن مشكلة"><i class="fas fa-flag"></i></button>
                            <button id="lib-reader-block-btn" class="lail-reader-btn blk" type="button" style="display:none;" onclick="window.lailApp.quickBlockCurrent()" title="حجب سريع (إدارة)"><i class="fas fa-ban"></i></button>
                            <button class="lail-reader-btn" type="button" onclick="window.lailApp.reader.backToLibrary()" title="العودة للمكتبة"><i class="fas fa-arrow-right"></i></button>
                            <button class="lail-reader-btn" type="button" onclick="window.lailApp.reader.minimize()" title="تصغير"><i class="fas fa-minus"></i></button>
                            <button class="lail-reader-btn close" type="button" onclick="window.lailApp.reader.close()" title="إغلاق"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="lail-reader-body">
                        <iframe id="lail-iframe-reader" src="" allowfullscreen></iframe>
                        <div id="lail-text-reader"></div>
                    </div>
                </div>
            </div>

            <div id="lail-minimized-btn" class="lail-minimized" onclick="window.lailApp.reader.restore()">
                <i id="min-icon" class="fas fa-book-reader" style="color:#8b5cf6;"></i>
                <span id="min-title">متابعة القراءة</span>
            </div>`);

            renderSidebarCategories();

            document.getElementById("input-local-search").addEventListener("keydown", e => {
                if ("Enter" === e.key) window.lailApp.local.triggerSearch();
            });
            document.getElementById("input-public-search").addEventListener("keydown", e => {
                if ("Enter" === e.key) window.lailApp.public.triggerSearch();
            });

            const gl = document.getElementById("grid-local"),
                gp = document.getElementById("grid-public"),
                tr = document.getElementById("lail-text-reader");
            let t1, t2, t3;
            gl.addEventListener("scroll", () => {
                clearTimeout(t1);
                t1 = setTimeout(() => {
                    if (gl.scrollTop + gl.clientHeight >= gl.scrollHeight - 100) window.lailApp.local.executeSearch(window.lailApp.local.currentQuery, !0);
                }, 150);
            });
            gp.addEventListener("scroll", () => {
                clearTimeout(t2);
                t2 = setTimeout(() => {
                    if (gp.scrollTop + gp.clientHeight >= gp.scrollHeight - 100) window.lailApp.public.executeSearch(window.lailApp.public.currentQuery, null, !0);
                }, 150);
            });
            tr.addEventListener("scroll", () => {
                const key = window.lailApp.reader.currentScrollKey;
                if (key && "block" === tr.style.display) {
                    clearTimeout(t3);
                    t3 = setTimeout(() => { try { localStorage.setItem(key, String(tr.scrollTop)); } catch (e) {} }, 500);
                }
            });
        }
    }

    function applyAdminSettings() {
        const s = st.settings, adm = h.isAdmin(), vip = h.isVip();
        const modal = document.getElementById("lail-main-modal"),
            reader = document.getElementById("lail-unified-reader");
        if (!1 === s.enabled && !adm && !vip) {
            if ((modal && "flex" === modal.style.display) || (reader && "flex" === reader.style.display)) {
                window.lailApp.reader.close();
                window.lailApp.closeLibrary();
                alert(s.disabledMsg || DEFAULT_SETTINGS.disabledMsg);
            }
        }
        const offB = document.getElementById("lib-admin-off-banner");
        if (offB) offB.style.display = !1 === s.enabled && (adm || vip) ? "block" : "none";

        const annB = document.getElementById("lib-announcement-banner"),
            annT = document.getElementById("lib-announcement-text");
        if (annB && annT) {
            annB.className = "lail-lib-banner" + (s.bannerTheme && "gold" !== s.bannerTheme ? ` th-${s.bannerTheme}` : "");
            if (s.bannerText) { annT.textContent = s.bannerText; annB.style.display = "flex"; }
            else annB.style.display = "none";
        }

        const vipBtn = document.getElementById("lib-vip-submit-btn");
        if (vipBtn) vipBtn.style.display = (adm || (vip && s.allowCustomBooksForVip)) ? "inline-flex" : "none";

        const setVis = (id, flag) => { const el = document.getElementById(id); if (el) el.style.display = !1 === flag ? "none" : ""; };
        setVis("tab-local", s.showLocalTab);
        setVis("tab-public", s.showPublicTab);
        setVis("tab-favorites", s.showFavTab && !1 !== s.allowFavorites);
        setVis("tab-history", s.showHistoryTab && !1 !== s.allowHistory);
        setVis("lib-reader-note-btn", s.allowNotes);

        const blkBtn = document.getElementById("lib-reader-block-btn");
        if (blkBtn) blkBtn.style.display = adm ? "flex" : "none";

        const txtBox = document.querySelector("#lail-text-reader .novel-text-content");
        if (txtBox) txtBox.classList.toggle("no-copy", !1 === s.allowCopyText && !adm);

        renderSidebarCategories();
    }

    function maybeShowWelcome() {
        const txt = (st.settings.welcomePopupText || "").trim(),
            ver = String(st.settings.welcomePopupVersion || 1);
        try { if (!txt || localStorage.getItem("lail_lib_welc_v") === ver) return; } catch (e) { return; }
        document.getElementById("lail-lib-welc")?.remove();
        const ov = document.createElement("div");
        ov.id = "lail-lib-welc";
        ov.className = "lail-lib-popov";
        ov.innerHTML = `<div class="lail-lib-popbox" style="text-align:center;"><div style="font-size:28px;margin-bottom:8px;">📚</div><h3 style="margin:0 0 10px;color:#D4AF37;font-size:17px;">رسالة من إدارة مكتبة ليل</h3><p style="margin:0 0 18px;font-size:13.5px;line-height:1.7;color:#e2e8f0;white-space:pre-line;">${h.esc(txt)}</p><button type="button" id="lail-lib-welc-ok" style="background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;border:none;border-radius:10px;padding:10px 26px;font-weight:800;font-size:13.5px;cursor:pointer;font-family:inherit;">حسناً، فهمت</button></div>`;
        document.body.appendChild(ov);
        const dismiss = () => {
            try { localStorage.setItem("lail_lib_welc_v", ver); } catch (e) {}
            ov.classList.remove("active");
            setTimeout(() => ov.remove(), 200);
        };
        ov.onclick = e => { if (e.target === ov) dismiss(); };
        document.getElementById("lail-lib-welc-ok").onclick = dismiss;
        requestAnimationFrame(() => ov.classList.add("active"));
    }
  // ==================== لوحة التحكم الإدارية لمكتبة ليل ====================
    const libAdmin = {
        activeTab: "radar",
        pollDraft: [],
        shelfDraft: [],
        editCustomId: null,
        repFilter: "open",
        selectedReps: new Set(),

        injectStyles() {
            if (document.getElementById("lail-lib-admin-styles")) return;
            const s = document.createElement("style");
            s.id = "lail-lib-admin-styles";
            s.textContent = `
            .llba-ov{position:fixed;inset:0;background:rgba(8,10,18,.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .25s ease;direction:rtl;font-family:'Segoe UI',tahoma,sans-serif}
            .llba-ov.active{opacity:1;visibility:visible}
            .llba-box{background:linear-gradient(180deg,rgba(28,31,56,.98) 0%,rgba(14,16,30,.99) 100%);border:1px solid rgba(139,92,246,.38);border-radius:20px;width:95%;max-width:660px;max-height:89vh;max-height:89dvh;padding:15px 17px 17px;box-shadow:0 25px 60px rgba(0,0,0,.88);transform:scale(.94) translateY(15px);opacity:0;transition:all .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;color:#f8fafc}
            .llba-ov.active .llba-box{transform:scale(1) translateY(0);opacity:1}
            .llba-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
            .llba-title{display:flex;align-items:center;gap:8px;color:#c4b5fd;font-weight:800;font-size:15.5px}
            .llba-ctrl{background:rgba(255,255,255,.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;transition:.2s}
            .llba-ctrl:hover{background:rgba(255,255,255,.18)}
            .llba-ctrl-x:hover{background:rgba(239,68,68,.85)}
            .llba-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;flex-shrink:0}
            .llba-stat{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 4px;text-align:center}
            .llba-stat-v{font-size:13px;font-weight:800;color:#D4AF37}
            .llba-stat-l{font-size:10px;color:#94a3b8;margin-top:2px}
            .llba-tabs{display:flex;height:42px;min-height:42px;background:rgba(0,0,0,.34);border-radius:12px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;border:1px solid rgba(255,255,255,.05);flex-shrink:0}
            .llba-tabs::-webkit-scrollbar{display:none}
            .llba-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 10px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:bold;cursor:pointer;white-space:nowrap}
            .llba-tab.active{background:rgba(139,92,246,.2);color:#c4b5fd;border-bottom:2px solid #8b5cf6}
            .llba-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding-left:4px;margin-left:-4px;-webkit-overflow-scrolling:touch}
            .llba-body::-webkit-scrollbar{width:5px}
            .llba-body::-webkit-scrollbar-thumb{background:rgba(139,92,246,.4);border-radius:10px}
            .llba-view{display:none}.llba-view.active{display:block}
            .llba-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;margin-bottom:9px;text-align:right}
            .llba-card-t{font-size:12.5px;font-weight:700;color:#D4AF37;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
            .llba-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
            .llba-g2{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
            .llba-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
            .llba-inp{width:100%;background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 10px;border-radius:10px;font-family:inherit;font-size:12.5px;outline:none;box-sizing:border-box}
            .llba-inp:focus{border-color:#8b5cf6}
            .llba-inp option{background:#16182c;color:#fff}
            .llba-lbl{display:block;font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:4px}
            .llba-btn{border:none;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s;display:inline-flex;align-items:center;justify-content:center;gap:5px}
            .llba-btn-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;width:100%}
            .llba-btn-purple{background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;width:100%}
            .llba-btn-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;width:100%}
            .llba-btn-dark{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.08)}
            .llba-btn-danger{background:rgba(239,68,68,.16);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
            .llba-btn-ok{background:rgba(16,185,129,.18);color:#6ee7b7;border:1px solid rgba(16,185,129,.35)}
            .llba-btn-info{background:rgba(56,189,248,.16);color:#7dd3fc;border:1px solid rgba(56,189,248,.3)}
            .llba-btn-warn{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35)}
            .llba-mini{padding:5px 8px;font-size:11px;border-radius:8px;width:auto}
            .llba-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700}
            .llba-t-gold{background:rgba(212,175,55,.18);color:#D4AF37}
            .llba-t-green{background:rgba(16,185,129,.16);color:#34d399}
            .llba-t-red{background:rgba(239,68,68,.18);color:#f87171}
            .llba-t-blue{background:rgba(56,189,248,.18);color:#38bdf8}
            .llba-t-gray{background:rgba(148,163,184,.18);color:#94a3b8}
            .llba-srow{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:9px 11px;margin-bottom:7px;gap:10px}
            .llba-sw{position:relative;width:42px;height:22px;flex-shrink:0}
            .llba-sw input{opacity:0;width:0;height:0}
            .llba-sl{position:absolute;cursor:pointer;inset:0;background:#334155;border-radius:22px;transition:.25s}
            .llba-sl:before{content:"";position:absolute;height:16px;width:16px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:.25s}
            .llba-sw input:checked+.llba-sl{background:#10b981}
            .llba-sw input:checked+.llba-sl:before{transform:translateX(-20px)}
            .llba-subtabs{display:flex;gap:5px;margin-bottom:9px;flex-wrap:wrap}
            .llba-subtab{flex:1;min-width:72px;background:rgba(255,255,255,.05);color:#94a3b8;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:7px 5px;font-size:11px;font-weight:bold;cursor:pointer;font-family:inherit}
            .llba-subtab.active{background:rgba(139,92,246,.2);color:#c4b5fd;border-color:rgba(139,92,246,.45)}
            .llba-mrow{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 9px;margin-bottom:6px}
            .llba-mrow img{width:36px;height:52px;object-fit:cover;border-radius:6px;flex-shrink:0;background:#1e293b}
            .llba-chip-chk{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:4px 8px;border-radius:8px;font-size:11px;cursor:pointer}
            .llba-bdg{background:#ef4444;color:#fff;font-size:9.5px;font-weight:900;padding:1px 6px;border-radius:12px;margin-right:4px;display:none}
            `;
            document.head.appendChild(s);
        },

        log(action, target, details) {
            if (!st.db) return;
            st.db.ref(`${ADMIN_PATH}/logs`).push({
                admin: st.myUsername || "الإدارة",
                action,
                target: target || "-",
                details: details || "",
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).catch(() => {});
        },

        patchSettings(partial, msg) {
            if (!st.db) return;
            st.db.ref(`${ADMIN_PATH}/settings`).update(partial).then(() => {
                st.settings = Object.assign({}, st.settings, partial);
                this.log("تعديل إعدادات", "المكتبة", Object.keys(partial).join(", "));
                applyAdminSettings();
                this.refreshUI();
                if (msg) showToast(msg, 3000, "gold");
            }).catch(() => alert("❌ فشل الحفظ في Firebase."));
        },

        sendUserCmd(sanUser, cmd, text = "") {
            if (!st.db || !sanUser) return;
            st.db.ref(`${ADMIN_PATH}/cmds/${sanUser}`).set({
                cmd, text, ts: Date.now(), by: st.myUsername || "الإدارة"
            }).then(() => {
                this.log("kick" === cmd ? "إخراج فوري" : "تنبيه خاص", sanUser, text || cmd);
                showToast("kick" === cmd ? "⚡ تم إخراج العضو من المكتبة" : "📩 تم إرسال التنبيه للعضو");
            });
        },

        open() {
            if (!h.isAdmin()) return alert("هذه اللوحة متاحة للإدارة فقط.");
            this.injectStyles();
            document.getElementById("lail-lib-admin-modal")?.remove();
            const ov = document.createElement("div");
            ov.id = "lail-lib-admin-modal";
            ov.className = "llba-ov";
            ov.innerHTML = `
            <div class="llba-box">
                <div class="llba-head">
                    <div class="llba-title"><i class="fas fa-book-reader" style="color:#8b5cf6;"></i> لوحة تحكم مكتبة ليل الاحترافية</div>
                    <div class="llba-row" style="gap:6px;">
                        <button type="button" class="llba-ctrl" id="llba-open-app" title="فتح المكتبة"><i class="fas fa-external-link-alt"></i></button>
                        <button type="button" class="llba-ctrl" id="llba-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
                        <button type="button" class="llba-ctrl llba-ctrl-x" id="llba-close" title="إغلاق"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="llba-stats">
                    <div class="llba-stat"><div class="llba-stat-v" id="llba-st-status">...</div><div class="llba-stat-l">الحالة</div></div>
                    <div class="llba-stat"><div class="llba-stat-v" id="llba-st-online">0</div><div class="llba-stat-l">قراء الآن</div></div>
                    <div class="llba-stat"><div class="llba-stat-v" id="llba-st-content">0 / 0</div><div class="llba-stat-l">اختيارات / خاص</div></div>
                    <div class="llba-stat"><div class="llba-stat-v" id="llba-st-mod">0 / 0</div><div class="llba-stat-l">حظر / حجب</div></div>
                </div>
                <div class="llba-tabs">
                    <button type="button" class="llba-tab active" data-ltab="radar"><i class="fas fa-broadcast-tower"></i> الرادار والفعاليات</button>
                    <button type="button" class="llba-tab" data-ltab="content"><i class="fas fa-crown"></i> المحتوى والأرفف <span id="llba-pend-tbdg" class="llba-bdg">0</span></button>
                    <button type="button" class="llba-tab" data-ltab="moderation"><i class="fas fa-user-shield"></i> الرقابة والبلاغات <span id="llba-rep-tbdg" class="llba-bdg">0</span></button>
                    <button type="button" class="llba-tab" data-ltab="analytics"><i class="fas fa-chart-line"></i> الإحصائيات</button>
                    <button type="button" class="llba-tab" data-ltab="settings"><i class="fas fa-cog"></i> إعدادات وسجل</button>
                </div>
                <div class="llba-body">
                    <!-- 1. الرادار والبث والماراثون والاقتباس والتصويت -->
                    <div id="llba-v-radar" class="llba-view active">
                        <div class="llba-card" style="border-color:rgba(16,185,129,.3);">
                            <div class="llba-card-t" style="color:#6ee7b7;"><span><i class="fas fa-eye"></i> المتواجدون داخل المكتبة الآن</span><span id="llba-pres-cnt" class="llba-tag llba-t-green">0</span></div>
                            <div id="llba-presence-list"></div>
                        </div>
                        <div class="llba-card" style="border-color:rgba(239,68,68,.35);">
                            <div class="llba-card-t" style="color:#fca5a5;"><span><i class="fas fa-bullhorn"></i> بث إشعار فوري لجميع قراء المكتبة الآن</span></div>
                            <div class="llba-row">
                                <input type="text" id="llba-bc-inp" class="llba-inp" style="flex:1;" placeholder="مثلاً: 📚 تم إضافة روايات جديدة اليوم!">
                                <select id="llba-bc-th" class="llba-inp" style="width:92px;"><option value="blue">عادي</option><option value="gold">ذهبي VIP</option><option value="red">عاجل</option></select>
                                <button type="button" id="llba-bc-send" class="llba-btn llba-btn-red llba-mini" style="padding:8px 13px;"><i class="fas fa-paper-plane"></i> بث</button>
                            </div>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-ribbon"></i> شريط الإعلان الدائم بأعلى المكتبة</span></div>
                            <div class="llba-row">
                                <input type="text" id="llba-banner-inp" class="llba-inp" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                                <select id="llba-banner-th" class="llba-inp" style="width:88px;"><option value="gold">ذهبي</option><option value="red">أحمر</option><option value="blue">أزرق</option><option value="green">أخضر</option></select>
                                <button type="button" id="llba-banner-save" class="llba-btn llba-btn-gold llba-mini" style="padding:8px 13px;">حفظ</button>
                            </div>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-comment-alt"></i> رسالة الترحيب المنبثقة عند دخول المكتبة</span></div>
                            <textarea id="llba-welc-inp" class="llba-inp" rows="2" style="margin-bottom:7px;" placeholder="رسالة إعلان أو تنبيه تظهر للعضو فور فتح المكتبة..."></textarea>
                            <div class="llba-row">
                                <button type="button" id="llba-welc-save" class="llba-btn llba-btn-ok" style="flex:1;"><i class="fas fa-paper-plane"></i> حفظ وإظهار للجميع</button>
                                <button type="button" id="llba-welc-off" class="llba-btn llba-btn-danger llba-mini">تعطيل</button>
                            </div>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-quote-right"></i> اقتباس اليوم في واجهة المكتبة</span></div>
                            <input type="text" id="llba-qt-txt" class="llba-inp" style="margin-bottom:6px;" placeholder="نص الاقتباس...">
                            <div class="llba-row">
                                <input type="text" id="llba-qt-auth" class="llba-inp" style="flex:1;" placeholder="القائل أو المصدر (اختياري)...">
                                <button type="button" id="llba-qt-save" class="llba-btn llba-btn-gold llba-mini" style="padding:8px 12px;">حفظ</button>
                            </div>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-stopwatch"></i> جدولة ماراثون / تحدي قراءة بعدّاد تنازلي</span><button type="button" id="llba-ev-clr" class="llba-btn llba-btn-danger llba-mini">إلغاء</button></div>
                            <div id="llba-ev-cur" style="margin-bottom:6px;font-size:11.5px;color:#cbd5e1;"></div>
                            <div class="llba-g2" style="margin-bottom:6px;">
                                <div><label class="llba-lbl">اسم التحدي أو الكتاب *</label><input type="text" id="llba-ev-title" class="llba-inp" placeholder="قراءة جماعية: ..."></div>
                                <div><label class="llba-lbl">موعد الانطلاق *</label><input type="datetime-local" id="llba-ev-time" class="llba-inp" dir="ltr"></div>
                            </div>
                            <div class="llba-row" style="margin-bottom:7px;">
                                <input type="text" id="llba-ev-note" class="llba-inp" style="flex:1;" placeholder="وصف قصير للتحدي...">
                                <input type="text" id="llba-ev-bid" class="llba-inp" style="width:120px;" placeholder="معرف كتاب (اختياري)">
                            </div>
                            <button type="button" id="llba-ev-save" class="llba-btn llba-btn-gold"><i class="fas fa-calendar-check"></i> تفعيل العدّاد التنازلي</button>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t">
                                <span><i class="fas fa-poll"></i> تصويت «كتاب / رواية الأسبوع»</span>
                                <div class="llba-row" style="gap:4px;">
                                    <button type="button" id="llba-poll-reset" class="llba-btn llba-btn-warn llba-mini">تصفير</button>
                                    <button type="button" id="llba-poll-end" class="llba-btn llba-btn-danger llba-mini">إنهاء</button>
                                </div>
                            </div>
                            <div id="llba-poll-cur" style="margin-bottom:8px;"></div>
                            <input type="text" id="llba-poll-qtxt" class="llba-inp" style="margin-bottom:6px;" value="🗳️ صوّت لرواية / كتاب الأسبوع:">
                            <div class="llba-row" style="margin-bottom:6px;">
                                <input type="text" id="llba-poll-opt-inp" class="llba-inp" style="flex:1;" placeholder="اكتب اسم كتاب أو رواية لإضافته كخيار (2 إلى 4)...">
                                <button type="button" id="llba-poll-addopt" class="llba-btn llba-btn-info llba-mini" style="padding:8px 12px;">+ إضافة</button>
                            </div>
                            <div id="llba-poll-draft" style="margin-bottom:7px;"></div>
                            <button type="button" id="llba-poll-publish" class="llba-btn llba-btn-ok" style="width:100%;"><i class="fas fa-rocket"></i> نشر التصويت داخل المكتبة</button>
                        </div>
                    </div>

                    <!-- 2. المحتوى والاختيارات والأرفف والكتب الخاصة والطلبات المعلّقة -->
                    <div id="llba-v-content" class="llba-view">
                        <div class="llba-subtabs">
                            <button type="button" class="llba-subtab active" data-csub="picks"><i class="fas fa-crown"></i> اختياراتنا</button>
                            <button type="button" class="llba-subtab" data-csub="custom"><i class="fas fa-plus-circle"></i> إضافة كتاب</button>
                            <button type="button" class="llba-subtab" data-csub="shelves"><i class="fas fa-layer-group"></i> الأرفف</button>
                            <button type="button" class="llba-subtab" data-csub="pending"><i class="fas fa-inbox"></i> الطلبات <span id="llba-pend-sbdg" class="llba-bdg">0</span></button>
                        </div>

                        <div id="llba-csub-picks">
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-heading"></i> عنوان صف الاختيارات</span></div>
                                <div class="llba-row">
                                    <input type="text" id="llba-feat-title" class="llba-inp" style="flex:1;">
                                    <button type="button" id="llba-feat-tsave" class="llba-btn llba-btn-gold llba-mini" style="padding:8px 12px;">حفظ</button>
                                </div>
                            </div>
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-search"></i> تثبيت رواية من مكتبة ليل</span></div>
                                <div class="llba-row" style="margin-bottom:6px;">
                                    <input type="text" id="llba-feat-q" class="llba-inp" style="flex:1;" placeholder="ابحث باسم الرواية أو الكاتب...">
                                    <button type="button" id="llba-feat-search" class="llba-btn llba-btn-info llba-mini" style="padding:8px 12px;"><i class="fas fa-search"></i></button>
                                </div>
                                <input type="text" id="llba-feat-badge" class="llba-inp" style="margin-bottom:7px;" placeholder="شارة فوق الغلاف (مثلاً: ترشيح الإدارة ⭐)">
                                <div id="llba-feat-res" style="max-height:160px;overflow-y:auto;"></div>
                            </div>
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-crown"></i> الأعمال المثبّتة حالياً</span></div>
                                <div id="llba-feat-list"></div>
                            </div>
                        </div>

                        <div id="llba-csub-custom" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-plus-circle"></i> إضافة كتاب أو رواية (نصي / صوتي / PDF)</span></div>
                                <div class="llba-g2" style="margin-bottom:6px;">
                                    <div><label class="llba-lbl">العنوان *</label><input type="text" id="llba-cm-title" class="llba-inp" placeholder="اسم الكتاب أو الرواية"></div>
                                    <div><label class="llba-lbl">المؤلف</label><input type="text" id="llba-cm-author" class="llba-inp" placeholder="اسم الكاتب"></div>
                                </div>
                                <div class="llba-g2" style="margin-bottom:6px;">
                                    <div>
                                        <label class="llba-lbl">طريقة العرض</label>
                                        <select id="llba-cm-mode" class="llba-inp">
                                            <option value="text">نصي (رواية / فصول)</option>
                                            <option value="audio">🎧 كتاب صوتي (MP3 / رابط صوت)</option>
                                            <option value="url">رابط تضمين / PDF / Google Drive</option>
                                        </select>
                                    </div>
                                    <div><label class="llba-lbl">شارة (اختياري)</label><input type="text" id="llba-cm-badge" class="llba-inp" placeholder="مثلاً: حصري ✨"></div>
                                </div>
                                <div style="margin-bottom:6px;"><label class="llba-lbl">رابط صورة الغلاف (اختياري)</label><input type="text" id="llba-cm-cover" class="llba-inp" dir="ltr" placeholder="https://..."></div>
                                <div id="llba-cm-urlbox" style="display:none;margin-bottom:8px;">
                                    <label id="llba-cm-urllbl" class="llba-lbl">رابط الكتاب *</label>
                                    <input type="text" id="llba-cm-url" class="llba-inp" dir="ltr" placeholder="https://...">
                                </div>
                                <div id="llba-cm-txtbox" style="margin-bottom:8px;">
                                    <label class="llba-lbl">المحتوى النصي * (للفصل بين الفصول اكتب سطراً يحتوي على ===)</label>
                                    <textarea id="llba-cm-content" class="llba-inp" rows="4" placeholder="نص الفصل الأول...&#10;===&#10;نص الفصل الثاني..."></textarea>
                                </div>
                                <div class="llba-row">
                                    <button type="button" id="llba-cm-save" class="llba-btn llba-btn-purple" style="flex:1;"><i class="fas fa-plus"></i> حفظ وإضافة للمكتبة</button>
                                    <button type="button" id="llba-cm-cancel" class="llba-btn llba-btn-dark llba-mini" style="display:none;">إلغاء التعديل</button>
                                </div>
                            </div>
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-folder-open"></i> الكتب المضافة يدوياً</span></div>
                                <div id="llba-cm-list"></div>
                            </div>
                        </div>

                        <div id="llba-csub-shelves" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-layer-group"></i> إنشاء رف كتب مخصص</span></div>
                                <div class="llba-g2" style="margin-bottom:6px;">
                                    <div><label class="llba-lbl">اسم الرف *</label><input type="text" id="llba-sh-title" class="llba-inp" placeholder="مثلاً: روائع الأدب العربي"></div>
                                    <div><label class="llba-lbl">شارة الرف (اختياري)</label><input type="text" id="llba-sh-badge" class="llba-inp" placeholder="مختارات"></div>
                                </div>
                                <div class="llba-row" style="margin-bottom:6px;">
                                    <input type="text" id="llba-sh-q" class="llba-inp" style="flex:1;" placeholder="ابحث عن روايات لإضافتها للرف...">
                                    <button type="button" id="llba-sh-search" class="llba-btn llba-btn-info llba-mini" style="padding:8px 12px;"><i class="fas fa-search"></i></button>
                                </div>
                                <div id="llba-sh-res" style="max-height:140px;overflow-y:auto;margin-bottom:6px;"></div>
                                <div id="llba-sh-draft" style="margin-bottom:7px;"></div>
                                <button type="button" id="llba-sh-save" class="llba-btn llba-btn-gold"><i class="fas fa-save"></i> نشر الرف في المكتبة</button>
                            </div>
                            <div class="llba-card">
                                <div class="llba-card-t"><span>الأرفف المنشورة حالياً</span></div>
                                <div id="llba-sh-list"></div>
                            </div>
                        </div>

                        <div id="llba-csub-pending" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-inbox"></i> مساهمات أعضاء VIP بانتظار الاعتماد</span></div>
                                <div id="llba-pend-list"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. الرقابة والبلاغات والحظر والمشرفين وVIP -->
                    <div id="llba-v-moderation" class="llba-view">
                        <div class="llba-subtabs">
                            <button type="button" class="llba-subtab active" data-msub="reports"><i class="fas fa-flag"></i> البلاغات <span id="llba-rep-sbdg" class="llba-bdg">0</span></button>
                            <button type="button" class="llba-subtab" data-msub="bans"><i class="fas fa-user-slash"></i> الحظر</button>
                            <button type="button" class="llba-subtab" data-msub="blacklist"><i class="fas fa-eye-slash"></i> الحجب</button>
                            <button type="button" class="llba-subtab" data-msub="cats"><i class="fas fa-tags"></i> التصنيفات</button>
                            <button type="button" class="llba-subtab" data-msub="inspect"><i class="fas fa-user-check"></i> فحص عضو</button>
                            <button type="button" class="llba-subtab" data-msub="vip"><i class="fas fa-crown"></i> VIP والمشرفون</button>
                        </div>
                        <div id="llba-msub-reports">
                            <div class="llba-card" style="padding:9px 10px;">
                                <div class="llba-row" style="justify-content:space-between;margin-bottom:8px;">
                                    <div class="llba-row" style="gap:4px;">
                                        <button type="button" class="llba-btn llba-btn-gold llba-mini llba-rf" data-rf="open" style="width:auto;">جديدة</button>
                                        <button type="button" class="llba-btn llba-btn-dark llba-mini llba-rf" data-rf="resolved">تم الحل</button>
                                        <button type="button" class="llba-btn llba-btn-dark llba-mini llba-rf" data-rf="all">الكل</button>
                                    </div>
                                    <label style="font-size:11.5px;color:#cbd5e1;cursor:pointer;"><input type="checkbox" id="llba-rep-selall" style="accent-color:#D4AF37;"> تحديد الكل (<span id="llba-rep-selcnt">0</span>)</label>
                                </div>
                                <div class="llba-row" style="gap:5px;">
                                    <button type="button" id="llba-rep-bulk-ok" class="llba-btn llba-btn-ok llba-mini" style="flex:1;">تم الحل للمحدد</button>
                                    <button type="button" id="llba-rep-bulk-del" class="llba-btn llba-btn-danger llba-mini" style="flex:1;">حذف المحدد</button>
                                    <button type="button" id="llba-rep-clr-done" class="llba-btn llba-btn-dark llba-mini">تنظيف المحلولة</button>
                                </div>
                            </div>
                            <div id="llba-reports-list"></div>
                        </div>
                        <div id="llba-msub-bans" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span>حظر عضو من المكتبة</span><button type="button" id="llba-clean-bans" class="llba-btn llba-btn-ok llba-mini">تنظيف المنتهي</button></div>
                                <div class="llba-g2" style="margin-bottom:6px;">
                                    <div><label class="llba-lbl">اسم المستخدم (Username)</label><input type="text" id="llba-ban-user" class="llba-inp" placeholder="Username"></div>
                                    <div><label class="llba-lbl">النطاق</label><select id="llba-ban-scope" class="llba-inp"><option value="full">حظر كامل من المكتبة</option><option value="search_only">منع البحث فقط</option><option value="share_only">منع المشاركة فقط</option><option value="notes_only">منع الملاحظات والتصويت</option></select></div>
                                </div>
                                <div class="llba-g2" style="margin-bottom:7px;">
                                    <div><label class="llba-lbl">المدة</label><select id="llba-ban-dur" class="llba-inp"><option value="permanent">دائم</option><option value="1h">ساعة</option><option value="6h">6 ساعات</option><option value="24h">24 ساعة</option><option value="3d">3 أيام</option><option value="7d">أسبوع</option><option value="30d">شهر</option></select></div>
                                    <div><label class="llba-lbl">السبب (اختياري)</label><input type="text" id="llba-ban-reason" class="llba-inp" placeholder="السبب..."></div>
                                </div>
                                <button type="button" id="llba-btn-ban" class="llba-btn llba-btn-danger" style="width:100%;"><i class="fas fa-ban"></i> تنفيذ الحظر</button>
                            </div>
                            <div id="llba-banned-list"></div>
                        </div>
                        <div id="llba-msub-blacklist" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span>حجب كتاب أو رواية</span></div>
                                <div class="llba-row" style="margin-bottom:6px;">
                                    <input type="text" id="llba-bl-q" class="llba-inp" style="flex:1;" placeholder="ابحث في روايات ليل لحجبها...">
                                    <button type="button" id="llba-bl-search" class="llba-btn llba-btn-danger llba-mini" style="padding:8px 12px;"><i class="fas fa-search"></i></button>
                                </div>
                                <div id="llba-bl-res" style="max-height:150px;overflow-y:auto;"></div>
                            </div>
                            <div class="llba-card"><div class="llba-card-t"><span>الأعمال المحجوبة حالياً</span></div><div id="llba-bl-list"></div></div>
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-filter"></i> كلمات بحث محظورة (افصل بفاصلة ,)</span></div>
                                <div class="llba-row">
                                    <input type="text" id="llba-bwords-inp" class="llba-inp" style="flex:1;" placeholder="كلمة1, كلمة2...">
                                    <button type="button" id="llba-bwords-save" class="llba-btn llba-btn-gold llba-mini" style="padding:8px 12px;">حفظ</button>
                                </div>
                            </div>
                        </div>
                        <div id="llba-msub-cats" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span>إخفاء تصنيفات من المكتبة العامة</span></div>
                                <div id="llba-cats-box" class="llba-row" style="gap:6px;margin-bottom:10px;"></div>
                                <button type="button" id="llba-save-cats" class="llba-btn llba-btn-gold"><i class="fas fa-save"></i> حفظ التصنيفات المحجوبة</button>
                            </div>
                        </div>
                        <div id="llba-msub-inspect" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span>فحص وتنظيف بيانات قارئ</span></div>
                                <div class="llba-row" style="margin-bottom:8px;">
                                    <input type="text" id="llba-insp-u" class="llba-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                    <button type="button" id="llba-insp-btn" class="llba-btn llba-btn-info llba-mini" style="padding:8px 12px;">فحص</button>
                                </div>
                                <div id="llba-insp-res"></div>
                            </div>
                        </div>
                        <div id="llba-msub-vip" style="display:none;">
                            <div class="llba-card">
                                <div class="llba-card-t"><span><i class="fas fa-crown"></i> قائمة VIP (تجاوز الصيانة وقيود الضيوف)</span></div>
                                <div class="llba-row" style="margin-bottom:8px;">
                                    <input type="text" id="llba-vip-inp" class="llba-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                    <button type="button" id="llba-vip-add" class="llba-btn llba-btn-gold llba-mini" style="padding:8px 13px;">إضافة VIP</button>
                                </div>
                                <div id="llba-vip-list"></div>
                            </div>
                            <div class="llba-card" style="border-color:rgba(56,189,248,.3);">
                                <div class="llba-card-t" style="color:#7dd3fc;"><span><i class="fas fa-user-tie"></i> مشرفو المكتبة المساعدون (إدارة المحتوى والبلاغات)</span></div>
                                <div class="llba-row" style="margin-bottom:8px;">
                                    <input type="text" id="llba-subadm-inp" class="llba-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                    <button type="button" id="llba-subadm-add" class="llba-btn llba-btn-info llba-mini" style="padding:8px 13px;">إضافة مشرف</button>
                                </div>
                                <div id="llba-subadm-list"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. الإحصائيات -->
                    <div id="llba-v-analytics" class="llba-view">
                        <div class="llba-card" style="text-align:center;">
                            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">تحليل عند الطلب لسجلات القراءة والمفضلات بدون استهلاك مستمر.</div>
                            <div class="llba-g2">
                                <button type="button" id="llba-run-an" class="llba-btn llba-btn-gold"><i class="fas fa-chart-pie"></i> توليد التقرير</button>
                                <button type="button" id="llba-copy-stars" class="llba-btn llba-btn-info"><i class="fas fa-trophy"></i> نسخ «نجوم القراءة»</button>
                            </div>
                        </div>
                        <div id="llba-an-body"></div>
                    </div>

                    <!-- 5. الإعدادات والصلاحيات والصيانة والسجل -->
                    <div id="llba-v-settings" class="llba-view">
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-power-off"></i> التحكم العام والصلاحيات</span></div>
                            <div class="llba-srow"><div><div style="font-size:12.5px;font-weight:bold;">تفعيل مكتبة ليل للجميع</div><div style="font-size:10.5px;color:#94a3b8;">إيقافها يغلقها عن الأعضاء وتبقى للإدارة والـ VIP</div></div><label class="llba-sw"><input type="checkbox" id="llba-set-enabled"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div style="font-size:12px;font-weight:bold;">السماح للضيوف بدخول المكتبة</div><label class="llba-sw"><input type="checkbox" id="llba-set-guests"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div style="font-size:12px;font-weight:bold;">تفعيل زر مشاركة الكتب</div><label class="llba-sw"><input type="checkbox" id="llba-set-share"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div style="font-size:12px;font-weight:bold;">السماح بنسخ النص داخل القارئ</div><label class="llba-sw"><input type="checkbox" id="llba-set-copy"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div style="font-size:12px;font-weight:bold;">تفعيل دفاتر الملاحظات والاقتباسات للقراء</div><label class="llba-sw"><input type="checkbox" id="llba-set-notes"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div style="font-size:12px;font-weight:bold;">السماح لأعضاء VIP بإضافة / اقتراح كتب</div><label class="llba-sw"><input type="checkbox" id="llba-set-vipadd"><span class="llba-sl"></span></label></div>
                            <div class="llba-srow"><div><div style="font-size:12px;font-weight:bold;">مراجعة الإدارة قبل نشر كتب VIP</div><div style="font-size:10.5px;color:#94a3b8;">إذا أُغلقت يُنشر كتاب VIP مباشرة</div></div><label class="llba-sw"><input type="checkbox" id="llba-set-viprev"><span class="llba-sl"></span></label></div>
                            <div class="llba-g3" style="margin-bottom:8px;">
                                <div><label class="llba-lbl">التبويب الافتراضي</label><select id="llba-set-deftab" class="llba-inp"><option value="local">ليل للروايات</option><option value="public">المكتبة العامة</option></select></div>
                                <div><label class="llba-lbl">مظهر القارئ الافتراضي</label><select id="llba-set-dtheme" class="llba-inp"><option value="dark">ليلي</option><option value="sepia">ورقي</option><option value="light">فاتح</option></select></div>
                                <div><label class="llba-lbl">حجم الخط الافتراضي</label><input type="number" step="0.05" min="0.9" max="2.1" id="llba-set-dfont" class="llba-inp"></div>
                            </div>
                            <div style="margin-bottom:8px;"><label class="llba-lbl">رسالة الصيانة</label><input type="text" id="llba-set-offmsg" class="llba-inp"></div>
                            <button type="button" id="llba-save-gen" class="llba-btn llba-btn-gold"><i class="fas fa-save"></i> حفظ الإعدادات العامة</button>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-eye"></i> إظهار وإخفاء التبويبات والأقسام</span></div>
                            <div class="llba-g2" style="margin-bottom:8px;">
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-loc"> ليل للروايات</label>
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-pub"> المكتبة العامة</label>
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-fav"> مفضلاتي</label>
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-his"> سجل القراءة</label>
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-sh"> أرفف الكتب المخصصة</label>
                                <label class="llba-chip-chk"><input type="checkbox" id="llba-v-qt"> اقتباس اليوم</label>
                            </div>
                            <button type="button" id="llba-save-vis" class="llba-btn llba-btn-dark" style="width:100%;">حفظ إعدادات العرض</button>
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t" style="color:#cbd5e1;"><span><i class="fas fa-broom"></i> الصيانة والنسخ الاحتياطي</span></div>
                            <div class="llba-g2">
                                <button type="button" id="llba-clean-hist" class="llba-btn llba-btn-dark">حذف السجل (+30 يوم)</button>
                                <button type="button" id="llba-clean-pres" class="llba-btn llba-btn-dark">تنظيف الرادار</button>
                                <button type="button" id="llba-wipe-hist" class="llba-btn llba-btn-danger">تصفير سجل القراءة</button>
                                <button type="button" id="llba-wipe-favs" class="llba-btn llba-btn-danger">تصفير كل المفضلات</button>
                                <button type="button" id="llba-export" class="llba-btn llba-btn-info">تصدير JSON</button>
                                <button type="button" id="llba-import" class="llba-btn llba-btn-ok">استيراد JSON</button>
                            </div>
                            <input type="file" id="llba-import-file" accept=".json,application/json" style="display:none;">
                        </div>
                        <div class="llba-card">
                            <div class="llba-card-t"><span><i class="fas fa-clipboard-list"></i> سجل العمليات الإدارية</span><button type="button" id="llba-clear-logs" class="llba-btn llba-btn-danger llba-mini">مسح</button></div>
                            <input type="text" id="llba-log-q" class="llba-inp" style="margin-bottom:7px;" placeholder="🔍 ابحث في السجل...">
                            <div id="llba-logs-list"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(ov);
            this.bindAdminEvents(ov);
            requestAnimationFrame(() => ov.classList.add("active"));
            this.populateInputs();
            this.bindLiveStreams();
            this.loadBanned();
            this.loadLogs();
            this.refreshUI();
        },

        close() {
            if (st.presenceRef) { st.presenceRef.off(); st.presenceRef = null; }
            if (st.reportsRef) { st.reportsRef.off(); st.reportsRef = null; }
            if (st.pendingRef) { st.pendingRef.off(); st.pendingRef = null; }
            this.selectedReps.clear();
            document.getElementById("lail-lib-admin-modal")?.remove();
        },

        bindLiveStreams() {
            if (!st.db) return;
            st.presenceRef?.off();
            st.presenceRef = st.db.ref("lail_library/presence");
            st.presenceRef.on("value", sn => { st.presenceCache = sn.val() || {}; this.refreshUI(); });

            st.reportsRef?.off();
            st.reportsRef = st.db.ref(`${ADMIN_PATH}/reports`);
            st.reportsRef.limitToLast(150).on("value", sn => { st.reportsCache = sn.val() || {}; this.updateBadges(); this.renderReports(); });

            st.pendingRef?.off();
            st.pendingRef = st.db.ref(`${ADMIN_PATH}/pending_books`);
            st.pendingRef.on("value", sn => { st.pendingBooks = sn.val() || {}; this.updateBadges(); this.renderPending(); });
        },

        bindAdminEvents(ov) {
            ov.addEventListener("click", e => { if (e.target === ov) this.close(); });
            document.getElementById("llba-close").onclick = () => this.close();
            document.getElementById("llba-open-app").onclick = () => { this.close(); window.lailApp.openLibrary(); };
            document.getElementById("llba-refresh").onclick = () => { this.loadBanned(); this.loadLogs(); this.refreshUI(); showToast("🔄 تم التحديث"); };

            ov.querySelectorAll("[data-ltab]").forEach(b => b.onclick = () => {
                this.activeTab = b.dataset.ltab;
                ov.querySelectorAll("[data-ltab]").forEach(x => x.classList.toggle("active", x === b));
                ov.querySelectorAll(".llba-view").forEach(x => x.classList.remove("active"));
                document.getElementById(`llba-v-${this.activeTab}`)?.classList.add("active");
                this.refreshUI();
            });

            ov.querySelectorAll("[data-csub]").forEach(b => b.onclick = () => {
                const sub = b.dataset.csub;
                ov.querySelectorAll("[data-csub]").forEach(x => x.classList.toggle("active", x === b));
                ["picks", "custom", "shelves", "pending"].forEach(k => {
                    document.getElementById(`llba-csub-${k}`).style.display = k === sub ? "block" : "none";
                });
                if ("custom" === sub) this.renderCustomList();
                else if ("shelves" === sub) this.renderShelves();
                else if ("pending" === sub) this.renderPending();
            });

            ov.querySelectorAll("[data-msub]").forEach(b => b.onclick = () => {
                const sub = b.dataset.msub;
                ov.querySelectorAll("[data-msub]").forEach(x => x.classList.toggle("active", x === b));
                ["reports", "bans", "blacklist", "cats", "inspect", "vip"].forEach(k => {
                    document.getElementById(`llba-msub-${k}`).style.display = k === sub ? "block" : "none";
                });
                if ("cats" === sub) this.renderCatBlocker();
                else if ("vip" === sub) { this.renderVipList(); this.renderSubAdminList(); }
                else if ("reports" === sub) this.renderReports();
            });

            // الرادار والفعاليات
            document.getElementById("llba-bc-send").onclick = () => {
                const inp = document.getElementById("llba-bc-inp"), txt = inp.value.trim(), th = document.getElementById("llba-bc-th").value;
                if (!txt || !st.db) return alert("اكتب نص الإشعار أولاً.");
                st.db.ref(`${ADMIN_PATH}/broadcast`).set({ text: txt, theme: th, ts: Date.now(), by: st.myUsername || "الإدارة" })
                    .then(() => { this.log("بث فوري", "الجميع", txt); inp.value = ""; showToast("📢 تم البث الفوري"); });
            };
            document.getElementById("llba-banner-save").onclick = () => {
                const txt = document.getElementById("llba-banner-inp").value.trim(), th = document.getElementById("llba-banner-th").value;
                this.patchSettings({ bannerText: txt, bannerTheme: th }, txt ? "📢 تم تحديث الشريط" : "تم إخفاء الشريط");
            };
            document.getElementById("llba-welc-save").onclick = () => {
                const txt = document.getElementById("llba-welc-inp").value.trim();
                this.patchSettings({ welcomePopupText: txt, welcomePopupVersion: Date.now() }, txt ? "✅ تم تفعيل رسالة الترحيب" : "تم التعطيل");
            };
            document.getElementById("llba-welc-off").onclick = () => {
                document.getElementById("llba-welc-inp").value = "";
                this.patchSettings({ welcomePopupText: "" }, "تم تعطيل رسالة الترحيب");
            };
            document.getElementById("llba-qt-save").onclick = () => {
                const qt = document.getElementById("llba-qt-txt").value.trim(), qa = document.getElementById("llba-qt-auth").value.trim();
                this.patchSettings({ quoteText: qt || DEFAULT_SETTINGS.quoteText, quoteAuthor: qa }, "✅ تم تحديث اقتباس اليوم");
            };
            document.getElementById("llba-ev-save").onclick = () => {
                const title = document.getElementById("llba-ev-title").value.trim(),
                    dtVal = document.getElementById("llba-ev-time").value,
                    note = document.getElementById("llba-ev-note").value.trim(),
                    bookId = document.getElementById("llba-ev-bid").value.trim();
                if (!title || !dtVal) return alert("أدخل اسم التحدي والوقت.");
                const ts = new Date(dtVal).getTime();
                if (isNaN(ts)) return alert("وقت غير صالح.");
                st.db?.ref(`${ADMIN_PATH}/schedule`).set({ active: !0, title, time: ts, note, bookId: bookId || null, bookType: "local" })
                    .then(() => { this.log("جدولة ماراثون", title, ""); this.renderEventAdmin(); showToast("⏱️ تم تفعيل عدّاد الماراثون"); });
            };
            document.getElementById("llba-ev-clr").onclick = () => {
                st.db?.ref(`${ADMIN_PATH}/schedule`).remove().then(() => { this.renderEventAdmin(); showToast("تم إلغاء الماراثون"); });
            };
            document.getElementById("llba-poll-addopt").onclick = () => {
                const inp = document.getElementById("llba-poll-opt-inp"), val = inp.value.trim();
                if (!val) return;
                if (this.pollDraft.length >= 4) return alert("الحد الأقصى 4 خيارات.");
                this.pollDraft.push({ title: val });
                inp.value = "";
                this.renderPollAdmin();
            };
            document.getElementById("llba-poll-publish").onclick = () => {
                if (this.pollDraft.length < 2) return alert("أضف خيارين على الأقل.");
                const q = document.getElementById("llba-poll-qtxt").value.trim() || "🗳️ صوّت لكتاب الأسبوع:";
                st.db?.ref(`${ADMIN_PATH}/poll`).set({ active: !0, question: q, options: this.pollDraft, votes: {}, createdAt: Date.now() })
                    .then(() => { this.log("نشر تصويت", `${this.pollDraft.length} خيارات`, q); this.pollDraft = []; this.renderPollAdmin(); showToast("🗳️ تم نشر التصويت"); });
            };
            document.getElementById("llba-poll-reset").onclick = () => {
                if (confirm("تصفير الأصوات؟")) st.db?.ref(`${ADMIN_PATH}/poll/votes`).remove().then(() => showToast("🔄 تم التصفير"));
            };
            document.getElementById("llba-poll-end").onclick = () => {
                st.db?.ref(`${ADMIN_PATH}/poll`).remove().then(() => showToast("تم إنهاء التصويت"));
            };

            // المحتوى والأرفف
            document.getElementById("llba-feat-tsave").onclick = () => {
                const ttl = document.getElementById("llba-feat-title").value.trim() || DEFAULT_SETTINGS.featuredTitle;
                this.patchSettings({ featuredTitle: ttl }, "✅ تم تحديث العنوان");
            };
            document.getElementById("llba-feat-search").onclick = () => this.searchLocalNovels("feat");
            document.getElementById("llba-feat-q").onkeydown = e => { if ("Enter" === e.key) this.searchLocalNovels("feat"); };

            document.getElementById("llba-cm-mode").onchange = function () {
                document.getElementById("llba-cm-txtbox").style.display = "text" === this.value ? "block" : "none";
                document.getElementById("llba-cm-urlbox").style.display = "text" !== this.value ? "block" : "none";
                document.getElementById("llba-cm-urllbl").textContent = "audio" === this.value ? "رابط الملف الصوتي (MP3 / رابط مباشر) *" : "رابط الكتاب (Google Drive / PDF / Embed) *";
            };
            document.getElementById("llba-cm-save").onclick = () => this.saveCustomBook();
            document.getElementById("llba-cm-cancel").onclick = () => this.resetCustomForm();

            document.getElementById("llba-sh-search").onclick = () => this.searchLocalNovels("sh");
            document.getElementById("llba-sh-save").onclick = () => this.saveShelf();

            // البلاغات والرقابة
            ov.querySelectorAll(".llba-rf").forEach(b => b.onclick = () => {
                this.repFilter = b.dataset.rf;
                ov.querySelectorAll(".llba-rf").forEach(x => { x.classList.toggle("llba-btn-gold", x === b); x.classList.toggle("llba-btn-dark", x !== b); x.style.width = "auto"; });
                this.renderReports();
            });
            document.getElementById("llba-rep-selall").onchange = e => {
                this.getFilteredReports().forEach(r => e.target.checked ? this.selectedReps.add(r.id) : this.selectedReps.delete(r.id));
                this.renderReports();
            };
            document.getElementById("llba-rep-bulk-ok").onclick = () => {
                if (!this.selectedReps.size) return;
                const up = {}; this.selectedReps.forEach(id => { up[`${id}/status`] = "resolved"; });
                st.db?.ref(`${ADMIN_PATH}/reports`).update(up).then(() => { this.selectedReps.clear(); showToast("✅ تم الحل للمحدد"); });
            };
            document.getElementById("llba-rep-bulk-del").onclick = () => {
                if (!this.selectedReps.size || !confirm(`حذف (${this.selectedReps.size}) بلاغ؟`)) return;
                const up = {}; this.selectedReps.forEach(id => { up[id] = null; });
                st.db?.ref(`${ADMIN_PATH}/reports`).update(up).then(() => { this.selectedReps.clear(); showToast("🗑️ تم الحذف"); });
            };
            document.getElementById("llba-rep-clr-done").onclick = () => {
                const up = {}; let cnt = 0;
                Object.entries(st.reportsCache || {}).forEach(([id, r]) => { if (r && "resolved" === r.status) { up[id] = null; cnt++; } });
                if (!cnt) return showToast("لا توجد بلاغات محلولة");
                if (confirm(`حذف (${cnt}) بلاغ محلول؟`)) st.db?.ref(`${ADMIN_PATH}/reports`).update(up).then(() => showToast(`🧹 تم حذف ${cnt} بلاغ`));
            };

            document.getElementById("llba-btn-ban").onclick = () => this.banUser();
            document.getElementById("llba-clean-bans").onclick = () => this.cleanExpiredBans();
            document.getElementById("llba-bl-search").onclick = () => this.searchLocalNovels("bl");
            document.getElementById("llba-bwords-save").onclick = () => {
                const arr = document.getElementById("llba-bwords-inp").value.split(/[,،]+/).map(x => x.trim()).filter(Boolean);
                this.patchSettings({ blockedWords: arr }, `✅ تم حفظ الكلمات المحظورة (${arr.length})`);
            };
            document.getElementById("llba-save-cats").onclick = () => {
                const ids = Array.from(document.querySelectorAll(".llba-cat-chk:checked")).map(x => x.value);
                this.patchSettings({ blockedCategories: ids }, `✅ تم حفظ التصنيفات المحجوبة (${ids.length})`);
            };
            document.getElementById("llba-insp-btn").onclick = () => this.inspectUser();
            document.getElementById("llba-vip-add").onclick = () => {
                const inp = document.getElementById("llba-vip-inp"), u = inp.value.trim();
                if (!u) return;
                const next = Array.from(new Set([...(st.settings.vipUsers || []), u]));
                inp.value = "";
                this.patchSettings({ vipUsers: next }, `👑 تمت إضافة (${u}) لـ VIP`);
            };
            document.getElementById("llba-subadm-add").onclick = () => {
                if (!h.isSuperAdmin()) return alert("إضافة المشرفين المساعدين متاحة لصاحب الصلاحية الكاملة فقط.");
                const inp = document.getElementById("llba-subadm-inp"), u = inp.value.trim();
                if (!u) return;
                const next = Array.from(new Set([...(st.settings.subAdmins || []), u]));
                inp.value = "";
                this.patchSettings({ subAdmins: next }, `✅ تمت إضافة (${u}) كمشرف مكتبة`);
            };

            // الإحصائيات
            document.getElementById("llba-run-an").onclick = () => this.runAnalytics();
            document.getElementById("llba-copy-stars").onclick = () => this.copyReadingStars();

            // الإعدادات والصيانة
            document.getElementById("llba-save-gen").onclick = () => {
                this.patchSettings({
                    enabled: document.getElementById("llba-set-enabled").checked,
                    allowGuests: document.getElementById("llba-set-guests").checked,
                    allowShare: document.getElementById("llba-set-share").checked,
                    allowCopyText: document.getElementById("llba-set-copy").checked,
                    allowNotes: document.getElementById("llba-set-notes").checked,
                    allowCustomBooksForVip: document.getElementById("llba-set-vipadd").checked,
                    requireReviewForVipBooks: document.getElementById("llba-set-viprev").checked,
                    defaultTab: document.getElementById("llba-set-deftab").value,
                    defaultReaderTheme: document.getElementById("llba-set-dtheme").value,
                    defaultFontSize: parseFloat(document.getElementById("llba-set-dfont").value) || 1.25,
                    disabledMsg: document.getElementById("llba-set-offmsg").value.trim() || DEFAULT_SETTINGS.disabledMsg
                }, "✅ تم حفظ الإعدادات العامة");
            };
            document.getElementById("llba-save-vis").onclick = () => {
                this.patchSettings({
                    showLocalTab: document.getElementById("llba-v-loc").checked,
                    showPublicTab: document.getElementById("llba-v-pub").checked,
                    showFavTab: document.getElementById("llba-v-fav").checked,
                    showHistoryTab: document.getElementById("llba-v-his").checked,
                    showShelvesRow: document.getElementById("llba-v-sh").checked,
                    showQuoteOfDay: document.getElementById("llba-v-qt").checked
                }, "✅ تم حفظ إعدادات العرض");
            };
            document.getElementById("llba-clean-hist").onclick = () => this.cleanOldHistory(30);
            document.getElementById("llba-clean-pres").onclick = () => st.db?.ref("lail_library/presence").remove().then(() => showToast("🧹 تم تنظيف الرادار"));
            document.getElementById("llba-wipe-hist").onclick = () => { if (confirm("⚠️ تصفير سجل القراءة للجميع؟")) st.db?.ref("lail_library/history").remove().then(() => showToast("🗑️ تم التصفير")); };
            document.getElementById("llba-wipe-favs").onclick = () => { if (confirm("⚠️ تصفير مفضلات الجميع؟")) st.db?.ref("lail_library/favorites").remove().then(() => showToast("🗑️ تم التصفير")); };
            document.getElementById("llba-export").onclick = () => this.exportBackup();
            document.getElementById("llba-import").onclick = () => document.getElementById("llba-import-file").click();
            document.getElementById("llba-import-file").onchange = e => this.importBackup(e);
            document.getElementById("llba-log-q").oninput = () => this.renderLogs();
            document.getElementById("llba-clear-logs").onclick = () => { if (confirm("مسح السجل؟")) st.db?.ref(`${ADMIN_PATH}/logs`).remove().then(() => { st.logsCache = []; this.renderLogs(); }); };
        },

        populateInputs() {
            const s = st.settings;
            const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            const sc = (id, v) => { const el = document.getElementById(id); if (el) el.checked = Boolean(v); };
            sv("llba-banner-inp", s.bannerText || "");
            sv("llba-banner-th", s.bannerTheme || "gold");
            sv("llba-welc-inp", s.welcomePopupText || "");
            sv("llba-qt-txt", s.quoteText || "");
            sv("llba-qt-auth", s.quoteAuthor || "");
            sv("llba-feat-title", s.featuredTitle || DEFAULT_SETTINGS.featuredTitle);
            sv("llba-bwords-inp", (s.blockedWords || []).join(", "));
            sc("llba-set-enabled", !1 !== s.enabled);
            sc("llba-set-guests", !1 !== s.allowGuests);
            sc("llba-set-share", !1 !== s.allowShare);
            sc("llba-set-copy", !1 !== s.allowCopyText);
            sc("llba-set-notes", !1 !== s.allowNotes);
            sc("llba-set-vipadd", Boolean(s.allowCustomBooksForVip));
            sc("llba-set-viprev", !1 !== s.requireReviewForVipBooks);
            sv("llba-set-deftab", s.defaultTab || "local");
            sv("llba-set-dtheme", s.defaultReaderTheme || "dark");
            sv("llba-set-dfont", Number(s.defaultFontSize) || 1.25);
            sv("llba-set-offmsg", s.disabledMsg || "");
            sc("llba-v-loc", !1 !== s.showLocalTab);
            sc("llba-v-pub", !1 !== s.showPublicTab);
            sc("llba-v-fav", !1 !== s.showFavTab);
            sc("llba-v-his", !1 !== s.showHistoryTab);
            sc("llba-v-sh", !1 !== s.showShelvesRow);
            sc("llba-v-qt", !1 !== s.showQuoteOfDay);
        },

        refreshUI() {
            if (!document.getElementById("lail-lib-admin-modal")) return;
            const s = st.settings;
            const stEl = document.getElementById("llba-st-status");
            if (stEl) { stEl.textContent = !1 === s.enabled ? "صيانة" : "مفعّلة"; stEl.style.color = !1 === s.enabled ? "#f87171" : "#34d399"; }
            const presCnt = Object.values(st.presenceCache || {}).filter(x => x && Date.now() - (x.ts || 0) < 18e5).length;
            const onEl = document.getElementById("llba-st-online");
            if (onEl) onEl.textContent = presCnt;
            const cnEl = document.getElementById("llba-st-content");
            if (cnEl) cnEl.textContent = `${Object.keys(st.featured || {}).length} / ${Object.keys(st.customBooks || {}).length}`;
            const mdEl = document.getElementById("llba-st-mod");
            if (mdEl) {
                const bCnt = Object.values(st.bannedCache || {}).filter(x => x && (!x.expiresAt || Date.now() < x.expiresAt)).length;
                mdEl.textContent = `${bCnt} / ${Object.keys(st.blacklist || {}).length}`;
            }
            if ("radar" === this.activeTab) { this.renderPresence(); this.renderEventAdmin(); this.renderPollAdmin(); }
            else if ("content" === this.activeTab) { this.renderFeaturedList(); this.renderCustomList(); this.renderShelves(); this.renderPending(); }
            else if ("moderation" === this.activeTab) { this.renderReports(); this.renderBanned(); this.renderBlacklist(); this.renderVipList(); this.renderSubAdminList(); }
        },

        renderPresence() {
            const c = document.getElementById("llba-presence-list"), cntEl = document.getElementById("llba-pres-cnt");
            if (!c) return;
            const active = Object.entries(st.presenceCache || {}).filter(([, v]) => v && Date.now() - (v.ts || 0) < 18e5);
            if (cntEl) cntEl.textContent = active.length;
            if (!active.length) { c.innerHTML = '<div style="color:#64748b;font-size:11.5px;text-align:center;padding:8px;">لا يوجد قراء داخل المكتبة حالياً.</div>'; return; }
            c.innerHTML = active.map(([k, v]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:5px;">
                    <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;"><b style="color:#34d399;">●</b> <b>${h.esc(v.name || k)}</b> <span style="color:#94a3b8;">— ${h.esc(v.reading || "يتصفح")}</span></div>
                    <div class="llba-row" style="gap:3px;flex-shrink:0;">
                        <button type="button" class="llba-btn llba-btn-info llba-mini llba-qmsg" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-bell"></i></button>
                        <button type="button" class="llba-btn llba-btn-warn llba-mini llba-qkick" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-sign-out-alt"></i></button>
                    </div>
                </div>`).join("");
            c.querySelectorAll(".llba-qmsg").forEach(b => b.onclick = () => { const t = prompt("اكتب تنبيهاً يظهر للعضو داخل المكتبة:"); if (t && t.trim()) this.sendUserCmd(b.dataset.k, "alert", t.trim()); });
            c.querySelectorAll(".llba-qkick").forEach(b => b.onclick = () => { if (confirm("إخراج هذا العضو من المكتبة الآن؟")) this.sendUserCmd(b.dataset.k, "kick", "تم إغلاق المكتبة من قبل الإدارة."); });
        },

        renderEventAdmin() {
            const el = document.getElementById("llba-ev-cur");
            if (!el) return;
            const s = st.schedule;
            el.innerHTML = s && s.active ? `نشط: <b style="color:#D4AF37;">${h.esc(s.title)}</b> • ${h.formatDate(s.time)}` : '<span style="color:#64748b;">لا يوجد ماراثون مجدول حالياً.</span>';
        },

        renderPollAdmin() {
            const cur = document.getElementById("llba-poll-cur"), dr = document.getElementById("llba-poll-draft");
            if (cur) {
                const p = st.poll;
                if (p && p.active && Array.isArray(p.options)) {
                    const votes = Object.values(p.votes || {}), tot = votes.length;
                    cur.innerHTML = `<div style="font-size:12px;color:#6ee7b7;font-weight:bold;margin-bottom:5px;">النشط (${tot} صوت): ${h.esc(p.question)}</div>`
                        + p.options.map((o, i) => {
                            const cnt = votes.filter(v => Number(v) === i).length;
                            return `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(0,0,0,.22);border-radius:7px;margin-bottom:3px;font-size:11.5px;"><span>${h.esc(o.title)}</span><span class="llba-tag llba-t-gold">${cnt}</span></div>`;
                        }).join("");
                } else cur.innerHTML = '<div style="font-size:11.5px;color:#64748b;">لا يوجد تصويت نشط.</div>';
            }
            if (dr) {
                dr.innerHTML = this.pollDraft.map((o, i) => `<span class="llba-tag llba-t-gold" style="margin:2px;">${h.esc(o.title)} <i class="fas fa-times llba-pdrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i></span>`).join("");
                dr.querySelectorAll(".llba-pdrm").forEach(el => el.onclick = () => { this.pollDraft.splice(Number(el.dataset.i), 1); this.renderPollAdmin(); });
            }
        },

        async searchLocalNovels(mode) {
            const inpId = "feat" === mode ? "llba-feat-q" : "sh" === mode ? "llba-sh-q" : "llba-bl-q";
            const boxId = "feat" === mode ? "llba-feat-res" : "sh" === mode ? "llba-sh-res" : "llba-bl-res";
            const q = document.getElementById(inpId).value.trim().toLowerCase();
            const box = document.getElementById(boxId);
            if (!q || !box) return;
            box.innerHTML = '<div style="text-align:center;color:#D4AF37;padding:8px;"><i class="fas fa-spinner fa-spin"></i></div>';
            try {
                if (!window.lailLocalNovelsCache.length) {
                    const r = await fetch(`${DB_BASE}/index.json?nocache=${Date.now()}`);
                    if (r.ok) window.lailLocalNovelsCache = await r.json();
                }
                const matches = window.lailLocalNovelsCache.filter(b =>
                    (b.title && b.title.toLowerCase().includes(q)) || (b.author && b.author.toLowerCase().includes(q))
                ).slice(0, 7);
                if (!matches.length) { box.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:11.5px;padding:6px;">لا توجد نتائج.</div>'; return; }
                const lbl = "feat" === mode ? "تثبيت ⭐" : "sh" === mode ? "+ للرف" : "حجب 🚫";
                const cls = "bl" === mode ? "llba-btn-danger" : "llba-btn-gold";
                box.innerHTML = matches.map((b, i) => `
                    <div class="llba-mrow">
                        ${b.cover ? `<img src="${h.esc(b.cover)}">` : ""}
                        <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.esc(b.title)}</div><div style="font-size:10px;color:#94a3b8;">${h.esc(b.author || "")}</div></div>
                        <button type="button" class="llba-btn ${cls} llba-mini llba-npick" data-i="${i}">${lbl}</button>
                    </div>`).join("");
                box.querySelectorAll(".llba-npick").forEach(btn => btn.onclick = () => {
                    const b = matches[Number(btn.dataset.i)];
                    if ("feat" === mode) {
                        const badge = document.getElementById("llba-feat-badge").value.trim() || "اختيار الإدارة ⭐";
                        st.db?.ref(`${ADMIN_PATH}/featured/${h.san(b.id)}`).set({ id: b.id, title: b.title, author: b.author || "", coverUrl: b.cover || "", type: "local", badge, timestamp: Date.now() })
                            .then(() => { this.log("تثبيت رواية", b.title, badge); box.innerHTML = ""; showToast(`⭐ تم تثبيت «${b.title}»`); });
                    } else if ("sh" === mode) {
                        if (!this.shelfDraft.some(x => String(x.id) === String(b.id))) {
                            this.shelfDraft.push({ id: b.id, title: b.title, author: b.author || "", coverUrl: b.cover || "", type: "local" });
                            this.renderShelfDraft();
                        }
                    } else {
                        st.db?.ref(`${ADMIN_PATH}/blacklist/${h.san(b.id)}`).set({ id: b.id, title: b.title, by: st.myUsername || "الإدارة", timestamp: Date.now() })
                            .then(() => { this.log("حجب رواية", b.title, ""); box.innerHTML = ""; showToast(`🚫 تم حجب «${b.title}»`); });
                    }
                });
            } catch (e) { box.innerHTML = '<div style="color:#ef4444;text-align:center;">خطأ اتصال.</div>'; }
        },

        renderFeaturedList() {
            const c = document.getElementById("llba-feat-list"); if (!c) return;
            const list = Object.entries(st.featured || {}).sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا توجد أعمال مثبّتة.</div>'; return; }
            c.innerHTML = list.map(([k, it]) => `
                <div class="llba-mrow">
                    ${it.coverUrl ? `<img src="${h.esc(it.coverUrl)}">` : ""}
                    <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.esc(it.title)}</div><span class="llba-tag llba-t-gold">${h.esc(it.badge || "اختيار الإدارة")}</span></div>
                    <button type="button" class="llba-btn llba-btn-info llba-mini llba-ftop" data-k="${h.esc(k)}"><i class="fas fa-arrow-up"></i></button>
                    <button type="button" class="llba-btn llba-btn-danger llba-mini llba-fdel" data-k="${h.esc(k)}"><i class="fas fa-trash"></i></button>
                </div>`).join("");
            c.querySelectorAll(".llba-ftop").forEach(b => b.onclick = () => st.db?.ref(`${ADMIN_PATH}/featured/${b.dataset.k}/timestamp`).set(Date.now()));
            c.querySelectorAll(".llba-fdel").forEach(b => b.onclick = () => st.db?.ref(`${ADMIN_PATH}/featured/${b.dataset.k}`).remove().then(() => showToast("تمت الإزالة")));
        },

        resetCustomForm() {
            this.editCustomId = null;
            ["llba-cm-title", "llba-cm-author", "llba-cm-badge", "llba-cm-cover", "llba-cm-url", "llba-cm-content"].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = "";
            });
            document.getElementById("llba-cm-save").innerHTML = '<i class="fas fa-plus"></i> حفظ وإضافة للمكتبة';
            document.getElementById("llba-cm-cancel").style.display = "none";
        },

        saveCustomBook() {
            if (!st.db) return;
            const title = document.getElementById("llba-cm-title").value.trim(),
                author = document.getElementById("llba-cm-author").value.trim(),
                mode = document.getElementById("llba-cm-mode").value,
                badge = document.getElementById("llba-cm-badge").value.trim(),
                coverUrl = document.getElementById("llba-cm-cover").value.trim(),
                url = document.getElementById("llba-cm-url").value.trim(),
                rawTxt = document.getElementById("llba-cm-content").value.trim();

            if (!title) return alert("أدخل عنوان الكتاب أو الرواية.");
            if ("text" !== mode && !url) return alert("أدخل الرابط.");
            if ("text" === mode && !rawTxt) return alert("أدخل المحتوى النصي.");

            const id = this.editCustomId || ("cb_" + Date.now());
            const chapters = "text" === mode
                ? rawTxt.split(/\n===\n/).map((t, i) => ({ num: i + 1, content: t.trim() })).filter(x => x.content)
                : [];

            st.db.ref(`${ADMIN_PATH}/custom_books/${id}`).set({
                id, title, author, mode, badge, coverUrl,
                url: "text" !== mode ? url : "",
                chapters,
                timestamp: Date.now()
            }).then(() => {
                this.log(this.editCustomId ? "تعديل كتاب خاص" : "إضافة كتاب خاص", title, mode);
                showToast(`📚 تم حفظ «${title}» بنجاح`, 3000, "gold");
                this.resetCustomForm();
            }).catch(() => alert("❌ فشل الحفظ."));
        },

        renderCustomList() {
            const c = document.getElementById("llba-cm-list"); if (!c) return;
            const list = Object.values(st.customBooks || {}).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا توجد كتب مضافة يدوياً.</div>'; return; }
            c.innerHTML = list.map(it => `
                <div class="llba-mrow">
                    ${it.coverUrl ? `<img src="${h.esc(it.coverUrl)}">` : ""}
                    <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:bold;">${h.esc(it.title)}</div><div style="font-size:10px;color:#94a3b8;">${h.esc(it.author || "بدون مؤلف")} • ${"audio" === it.mode ? "صوتي" : "url" === it.mode ? "رابط" : `${(it.chapters || []).length} فصل`}</div></div>
                    <button type="button" class="llba-btn llba-btn-info llba-mini llba-cmed" data-id="${h.esc(it.id)}"><i class="fas fa-pen"></i></button>
                    <button type="button" class="llba-btn llba-btn-danger llba-mini llba-cmdel" data-id="${h.esc(it.id)}"><i class="fas fa-trash"></i></button>
                </div>`).join("");
            c.querySelectorAll(".llba-cmed").forEach(b => b.onclick = () => {
                const it = st.customBooks[b.dataset.id]; if (!it) return;
                this.editCustomId = it.id;
                document.getElementById("llba-cm-title").value = it.title || "";
                document.getElementById("llba-cm-author").value = it.author || "";
                document.getElementById("llba-cm-mode").value = it.mode || "text";
                document.getElementById("llba-cm-mode").onchange();
                document.getElementById("llba-cm-badge").value = it.badge || "";
                document.getElementById("llba-cm-cover").value = it.coverUrl || "";
                document.getElementById("llba-cm-url").value = it.url || "";
                document.getElementById("llba-cm-content").value = (it.chapters || []).map(x => x.content).join("\n===\n");
                document.getElementById("llba-cm-save").innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
                document.getElementById("llba-cm-cancel").style.display = "inline-flex";
            });
            c.querySelectorAll(".llba-cmdel").forEach(b => b.onclick = () => {
                if (confirm("حذف هذا الكتاب؟")) st.db?.ref(`${ADMIN_PATH}/custom_books/${b.dataset.id}`).remove().then(() => showToast("🗑️ تم الحذف"));
            });
        },

        renderShelfDraft() {
            const dr = document.getElementById("llba-sh-draft"); if (!dr) return;
            dr.innerHTML = this.shelfDraft.map((x, i) => `<span class="llba-tag llba-t-blue" style="margin:2px;">${h.esc(x.title)} <i class="fas fa-times llba-shdrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i></span>`).join("");
            dr.querySelectorAll(".llba-shdrm").forEach(el => el.onclick = () => { this.shelfDraft.splice(Number(el.dataset.i), 1); this.renderShelfDraft(); });
        },

        saveShelf() {
            const title = document.getElementById("llba-sh-title").value.trim(),
                badge = document.getElementById("llba-sh-badge").value.trim();
            if (!title || !this.shelfDraft.length) return alert("أدخل اسم الرف وأضف رواية واحدة على الأقل.");
            const id = "sh_" + Date.now();
            st.db?.ref(`${ADMIN_PATH}/shelves/${id}`).set({ id, title, badge, items: this.shelfDraft, timestamp: Date.now() })
                .then(() => {
                    this.log("إنشاء رف كتب", title, `${this.shelfDraft.length} كتاب`);
                    this.shelfDraft = []; this.renderShelfDraft();
                    document.getElementById("llba-sh-title").value = ""; document.getElementById("llba-sh-badge").value = "";
                    showToast(`📚 تم نشر الرف «${title}»`);
                });
        },

        renderShelves() {
            const c = document.getElementById("llba-sh-list"); if (!c) return;
            const list = Object.entries(st.shelves || {});
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا توجد أرفف مخصصة.</div>'; return; }
            c.innerHTML = list.map(([k, sh]) => `<div class="llba-mrow"><div style="flex:1;"><b style="font-size:12.5px;">${h.esc(sh.title)}</b> <span class="llba-tag llba-t-gold">${(sh.items || []).length} كتب</span></div><button type="button" class="llba-btn llba-btn-danger llba-mini llba-shdel" data-k="${h.esc(k)}"><i class="fas fa-trash"></i></button></div>`).join("");
            c.querySelectorAll(".llba-shdel").forEach(b => b.onclick = () => {
                if (confirm("حذف الرف؟")) st.db?.ref(`${ADMIN_PATH}/shelves/${b.dataset.k}`).remove().then(() => showToast("🗑️ تم حذف الرف"));
            });
        },

        renderPending() {
            const c = document.getElementById("llba-pend-list"); if (!c) return;
            const list = Object.entries(st.pendingBooks || {});
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا توجد مساهمات معلّقة.</div>'; return; }
            c.innerHTML = list.map(([k, p]) => `
                <div class="llba-card" style="background:rgba(0,0,0,.25);">
                    <div style="font-size:12.5px;font-weight:bold;color:#fde68a;">📖 ${h.esc(p.title)} <span class="llba-tag llba-t-blue">بواسطة: ${h.esc(p.by || "-")}</span></div>
                    <div style="font-size:11px;color:#94a3b8;margin:4px 0 8px;">المؤلف: ${h.esc(p.author || "-")} • النوع: ${"url" === p.mode ? "رابط" : "نصي"}</div>
                    <div class="llba-row" style="gap:5px;">
                        <button type="button" class="llba-btn llba-btn-ok llba-mini llba-papp" data-k="${h.esc(k)}">اعتماد ونشر</button>
                        <button type="button" class="llba-btn llba-btn-danger llba-mini llba-prej" data-k="${h.esc(k)}">رفض</button>
                    </div>
                </div>`).join("");
            c.querySelectorAll(".llba-papp").forEach(b => b.onclick = () => {
                const p = st.pendingBooks[b.dataset.k]; if (!p) return;
                const newId = "cb_" + Date.now();
                st.db?.ref(`${ADMIN_PATH}/custom_books/${newId}`).set({
                    id: newId, title: p.title, author: p.author || "", mode: p.mode || "text",
                    badge: `VIP: ${p.by || ""}`, coverUrl: p.coverUrl || "", url: p.url || "",
                    chapters: p.chapters || [], timestamp: Date.now()
                }).then(() => st.db.ref(`${ADMIN_PATH}/pending_books/${b.dataset.k}`).remove())
                    .then(() => { this.log("اعتماد كتاب VIP", p.title, p.by || ""); showToast("✅ تم اعتماد ونشر الكتاب"); });
            });
            c.querySelectorAll(".llba-prej").forEach(b => b.onclick = () => {
                if (confirm("رفض وحذف الطلب؟")) st.db?.ref(`${ADMIN_PATH}/pending_books/${b.dataset.k}`).remove();
            });
        },

        updateBadges() {
            const rCnt = Object.values(st.reportsCache || {}).filter(r => r && "resolved" !== r.status).length;
            ["llba-rep-tbdg", "llba-rep-sbdg"].forEach(id => {
                const el = document.getElementById(id); if (el) { el.textContent = rCnt; el.style.display = rCnt > 0 ? "inline-block" : "none"; }
            });
            const pCnt = Object.keys(st.pendingBooks || {}).length;
            ["llba-pend-tbdg", "llba-pend-sbdg"].forEach(id => {
                const el = document.getElementById(id); if (el) { el.textContent = pCnt; el.style.display = pCnt > 0 ? "inline-block" : "none"; }
            });
        },

        getFilteredReports() {
            return Object.entries(st.reportsCache || {})
                .map(([id, d]) => Object.assign({ id }, d))
                .filter(r => "all" === this.repFilter || ("open" === this.repFilter ? "resolved" !== r.status : "resolved" === r.status))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        },

        renderReports() {
            const c = document.getElementById("llba-reports-list"); if (!c) return;
            const list = this.getFilteredReports();
            const cntEl = document.getElementById("llba-rep-selcnt");
            if (cntEl) cntEl.textContent = this.selectedReps.size;
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:16px;font-size:12px;">لا توجد بلاغات هنا.</div>'; return; }
            c.innerHTML = list.map(r => {
                const done = "resolved" === r.status;
                return `<div class="llba-card" style="background:rgba(0,0,0,.26);${done ? "opacity:.7;" : ""}">
                    <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                        <input type="checkbox" class="llba-rchk" data-id="${h.esc(r.id)}" ${this.selectedReps.has(r.id) ? "checked" : ""} style="margin-top:3px;accent-color:#D4AF37;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;justify-content:space-between;gap:5px;flex-wrap:wrap;"><b style="font-size:12.5px;">📖 ${h.esc(r.title || "كتاب")}</b><span class="llba-tag ${done ? "llba-t-green" : "llba-t-red"}">${done ? "✅ تم الحل" : "🔴 جديد"}</span></div>
                            <div class="llba-row" style="gap:4px;margin-top:3px;"><span class="llba-tag llba-t-gold">${h.esc(r.reason || "بلاغ")}</span><span style="font-size:10px;color:#94a3b8;">${h.esc(r.reporter || "-")} • ${h.formatDate(r.timestamp)}</span></div>
                            ${r.note ? `<div style="margin-top:4px;font-size:11.5px;color:#e2e8f0;background:rgba(255,255,255,.04);padding:4px 8px;border-radius:4px;border-right:2px solid #f59e0b;">${h.esc(r.note)}</div>` : ""}
                        </div>
                    </div>
                    <div class="llba-row" style="gap:4px;">
                        <button type="button" class="llba-btn llba-btn-danger llba-mini llba-rpblk" data-id="${h.esc(r.id)}">حجب الكتاب</button>
                        <button type="button" class="llba-btn ${done ? "llba-btn-warn" : "llba-btn-ok"} llba-mini llba-rptog" data-id="${h.esc(r.id)}">${done ? "إعادة فتح" : "تم الحل"}</button>
                        ${r.reporterSan ? `<button type="button" class="llba-btn llba-btn-dark llba-mini llba-rprep" data-id="${h.esc(r.id)}">رد</button>` : ""}
                        <button type="button" class="llba-btn llba-btn-danger llba-mini llba-rpdel" data-id="${h.esc(r.id)}" style="margin-right:auto;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            }).join("");

            c.querySelectorAll(".llba-rchk").forEach(el => el.onchange = () => {
                el.checked ? this.selectedReps.add(el.dataset.id) : this.selectedReps.delete(el.dataset.id);
                document.getElementById("llba-rep-selcnt").textContent = this.selectedReps.size;
            });
            c.querySelectorAll(".llba-rpblk").forEach(b => b.onclick = () => {
                const r = st.reportsCache[b.dataset.id]; if (!r || !confirm(`حجب «${r.title}»؟`)) return;
                st.db?.ref(`${ADMIN_PATH}/blacklist/${h.san(r.bookId)}`).set({ id: r.bookId, title: r.title, by: st.myUsername || "الإدارة", timestamp: Date.now() });
                st.db?.ref(`${ADMIN_PATH}/reports/${b.dataset.id}/status`).set("resolved");
                showToast("🚫 تم الحجب وإغلاق البلاغ");
            });
            c.querySelectorAll(".llba-rptog").forEach(b => b.onclick = () => {
                const r = st.reportsCache[b.dataset.id]; if (!r) return;
                st.db?.ref(`${ADMIN_PATH}/reports/${b.dataset.id}/status`).set("resolved" === r.status ? "open" : "resolved");
            });
            c.querySelectorAll(".llba-rprep").forEach(b => b.onclick = () => {
                const r = st.reportsCache[b.dataset.id]; if (!r) return;
                const msg = prompt(`رد على (${r.reporter}):`, `شكراً لبلاغك بخصوص (${r.title})، تمت المعالجة 📚`);
                if (msg && msg.trim()) this.sendUserCmd(r.reporterSan, "alert", msg.trim());
            });
            c.querySelectorAll(".llba-rpdel").forEach(b => b.onclick = () => {
                if (confirm("حذف البلاغ؟")) st.db?.ref(`${ADMIN_PATH}/reports/${b.dataset.id}`).remove();
            });
        },

        loadBanned() { st.db?.ref(`${ADMIN_PATH}/banned`).once("value").then(sn => { st.bannedCache = sn.val() || {}; this.refreshUI(); }).catch(() => {}); },

        banUser() {
            const u = document.getElementById("llba-ban-user").value.trim(), san = h.san(u);
            if (!san || !st.db) return alert("أدخل اسم المستخدم.");
            const scope = document.getElementById("llba-ban-scope").value,
                dur = document.getElementById("llba-ban-dur").value,
                reason = document.getElementById("llba-ban-reason").value.trim();
            const dMap = { "1h": 36e5, "6h": 216e5, "24h": 864e5, "3d": 2592e5, "7d": 6048e5, "30d": 2592e6 };
            const exp = dMap[dur] ? Date.now() + dMap[dur] : null;
            st.db.ref(`${ADMIN_PATH}/banned/${san}`).set({
                originalName: u, scope, reason, expiresAt: exp, bannedBy: st.myUsername || "الإدارة", timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                this.log("حظر عضو", u, scope);
                document.getElementById("llba-ban-user").value = ""; document.getElementById("llba-ban-reason").value = "";
                this.loadBanned(); showToast(`🚫 تم حظر (${u})`);
            });
        },

        cleanExpiredBans() {
            const up = {}; let cnt = 0;
            Object.entries(st.bannedCache || {}).forEach(([k, d]) => { if (d && d.expiresAt && Date.now() >= d.expiresAt) { up[k] = null; cnt++; } });
            if (!cnt) return showToast("لا يوجد حظر منتهي");
            st.db?.ref(`${ADMIN_PATH}/banned`).update(up).then(() => { this.loadBanned(); showToast(`🧹 تم تنظيف ${cnt}`); });
        },

        renderBanned() {
            const c = document.getElementById("llba-banned-list"); if (!c) return;
            const entries = Object.entries(st.bannedCache || {});
            if (!entries.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا يوجد محظورون.</div>'; return; }
            const sMap = { full: "كامل", search_only: "بحث فقط", share_only: "مشاركة فقط", notes_only: "ملاحظات/تصويت" };
            c.innerHTML = entries.map(([k, d]) => {
                const exp = d.expiresAt && Date.now() >= d.expiresAt;
                return `<div class="llba-card" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div><b style="font-size:12.5px;">${h.esc(d.originalName || k)}</b> <span class="llba-tag ${exp ? "llba-t-gray" : "llba-t-red"}">${exp ? "منتهي" : d.expiresAt ? h.formatRemaining(d.expiresAt) : "دائم"}</span> <span class="llba-tag llba-t-blue">${sMap[d.scope] || "كامل"}</span><div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${h.esc(d.reason || "بدون سبب")}</div></div>
                    <button type="button" class="llba-btn llba-btn-ok llba-mini llba-unban" data-k="${h.esc(k)}">فك الحظر</button>
                </div>`;
            }).join("");
            c.querySelectorAll(".llba-unban").forEach(b => b.onclick = () => {
                if (confirm("فك الحظر؟")) st.db?.ref(`${ADMIN_PATH}/banned/${b.dataset.k}`).remove().then(() => { this.loadBanned(); showToast("✅ تم فك الحظر"); });
            });
        },

        renderBlacklist() {
            const c = document.getElementById("llba-bl-list"); if (!c) return;
            const list = Object.entries(st.blacklist || {});
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا توجد أعمال محجوبة.</div>'; return; }
            c.innerHTML = list.map(([k, it]) => `<div class="llba-mrow"><div style="flex:1;"><b style="font-size:12px;color:#fecaca;">${h.esc(it.title || k)}</b></div><button type="button" class="llba-btn llba-btn-ok llba-mini llba-unbl" data-k="${h.esc(k)}">فك الحجب</button></div>`).join("");
            c.querySelectorAll(".llba-unbl").forEach(b => b.onclick = () => st.db?.ref(`${ADMIN_PATH}/blacklist/${b.dataset.k}`).remove().then(() => showToast("✅ تم فك الحجب")));
        },

        renderCatBlocker() {
            const box = document.getElementById("llba-cats-box"); if (!box) return;
            const blocked = st.settings.blockedCategories || [];
            box.innerHTML = CATEGORIES.filter(c => "all" !== c.id).map(c =>
                `<label class="llba-chip-chk"><input type="checkbox" class="llba-cat-chk" value="${c.id}" ${blocked.includes(c.id) ? "checked" : ""}> ${h.esc(c.name)}</label>`
            ).join("");
        },

        renderVipList() {
            const c = document.getElementById("llba-vip-list"); if (!c) return;
            const list = st.settings.vipUsers || [];
            c.innerHTML = list.length
                ? list.map((u, i) => `<span class="llba-tag llba-t-gold" style="margin:3px;">👑 ${h.esc(u)} <i class="fas fa-times llba-vrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i></span>`).join("")
                : '<div style="text-align:center;color:#64748b;font-size:11.5px;padding:8px;">لا يوجد أعضاء VIP.</div>';
            c.querySelectorAll(".llba-vrm").forEach(el => el.onclick = () => {
                const next = (st.settings.vipUsers || []).slice(); next.splice(Number(el.dataset.i), 1);
                this.patchSettings({ vipUsers: next }, "تمت الإزالة من VIP");
            });
        },

        renderSubAdminList() {
            const c = document.getElementById("llba-subadm-list"); if (!c) return;
            const list = st.settings.subAdmins || [];
            c.innerHTML = list.length
                ? list.map((u, i) => `<span class="llba-tag llba-t-blue" style="margin:3px;">🛡️ ${h.esc(u)} ${h.isSuperAdmin() ? `<i class="fas fa-times llba-sarm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i>` : ""}</span>`).join("")
                : '<div style="text-align:center;color:#64748b;font-size:11.5px;padding:8px;">لا يوجد مشرفون مساعدون.</div>';
            c.querySelectorAll(".llba-sarm").forEach(el => el.onclick = () => {
                if (!h.isSuperAdmin()) return;
                const next = (st.settings.subAdmins || []).slice(); next.splice(Number(el.dataset.i), 1);
                this.patchSettings({ subAdmins: next }, "تمت الإزالة");
            });
        },

        async inspectUser() {
            const raw = document.getElementById("llba-insp-u").value.trim(), san = h.san(raw), box = document.getElementById("llba-insp-res");
            if (!san || !box || !st.db) return;
            box.innerHTML = '<div style="text-align:center;color:#D4AF37;padding:10px;"><i class="fas fa-spinner fa-spin"></i></div>';
            const [hs, fs] = await Promise.all([st.db.ref(`lail_library/history/${san}`).once("value"), st.db.ref(`lail_library/favorites/${san}`).once("value")]);
            const hList = Object.values(hs.val() || {}), fList = Object.values(fs.val() || {});
            box.innerHTML = `
                <div class="llba-g2" style="margin-bottom:8px;">
                    <div class="llba-stat"><div class="llba-stat-v">${hList.length}</div><div class="llba-stat-l">سجل القراءة</div></div>
                    <div class="llba-stat"><div class="llba-stat-v">${fList.length}</div><div class="llba-stat-l">المفضلة</div></div>
                </div>
                <div class="llba-row">
                    <button type="button" id="llba-iu-h" class="llba-btn llba-btn-danger llba-mini" style="flex:1;">مسح سجله</button>
                    <button type="button" id="llba-iu-f" class="llba-btn llba-btn-danger llba-mini" style="flex:1;">مسح مفضلته</button>
                </div>`;
            document.getElementById("llba-iu-h").onclick = () => { if (confirm("مسح سجله؟")) st.db.ref(`lail_library/history/${san}`).remove().then(() => this.inspectUser()); };
            document.getElementById("llba-iu-f").onclick = () => { if (confirm("مسح مفضلته؟")) st.db.ref(`lail_library/favorites/${san}`).remove().then(() => this.inspectUser()); };
        },

        async runAnalytics() {
            const c = document.getElementById("llba-an-body"); if (!c || !st.db) return;
            c.innerHTML = '<div style="text-align:center;color:#D4AF37;padding:18px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
            const [hs, fs] = await Promise.all([st.db.ref("lail_library/history").once("value"), st.db.ref("lail_library/favorites").once("value")]);
            const hist = hs.val() || {}, favs = fs.val() || {}, bC = {}, uC = {};
            let totR = 0, totF = 0;
            Object.entries(hist).forEach(([u, m]) => {
                if (!m || "object" !== typeof m) return;
                const arr = Object.values(m); uC[u] = arr.length; totR += arr.length;
                arr.forEach(it => { if (it?.title) bC[it.title] = (bC[it.title] || 0) + 1; });
            });
            Object.values(favs).forEach(m => { if (m && "object" === typeof m) totF += Object.keys(m).length; });
            const topB = Object.entries(bC).sort((a, b) => b[1] - a[1]).slice(0, 8),
                topU = Object.entries(uC).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const row = (arr, cls) => arr.length ? arr.map(([k, v], i) => `<div style="display:flex;justify-content:space-between;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:12px;"><span>${i + 1}. <b>${h.esc(k)}</b></span><span class="llba-tag ${cls}">${v}</span></div>`).join("") : '<div style="color:#64748b;text-align:center;">لا بيانات.</div>';
            c.innerHTML = `
                <div class="llba-card"><div class="llba-g3"><div class="llba-stat"><div class="llba-stat-v">${Object.keys(hist).length}</div><div class="llba-stat-l">قراء</div></div><div class="llba-stat"><div class="llba-stat-v">${totR}</div><div class="llba-stat-l">قراءات</div></div><div class="llba-stat"><div class="llba-stat-v">${totF}</div><div class="llba-stat-l">مفضلات</div></div></div></div>
                <div class="llba-card"><div class="llba-card-t"><span>🔥 الأكثر قراءة</span></div>${row(topB, "llba-t-gold")}</div>
                <div class="llba-card"><div class="llba-card-t"><span>📚 أكثر الأعضاء قراءة</span></div>${row(topU, "llba-t-blue")}</div>`;
        },

        async copyReadingStars() {
            if (!st.db) return;
            const hist = (await st.db.ref("lail_library/history").once("value")).val() || {}, uC = {}, bC = {};
            Object.entries(hist).forEach(([u, m]) => {
                if (!m || "object" !== typeof m) return;
                const arr = Object.values(m); uC[u] = arr.length;
                arr.forEach(it => { if (it?.title) bC[it.title] = (bC[it.title] || 0) + 1; });
            });
            const topU = Object.entries(uC).sort((a, b) => b[1] - a[1]).slice(0, 5),
                topB = Object.entries(bC).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const txt = "📚✨ نجوم مكتبة ليل ✨📚\n\n🏆 أكثر الأعضاء قراءة:\n" + (topU.map(([u, c], i) => `${i + 1}. ${u} (${c} كتاب)`).join("\n") || "-")
                + "\n\n🔥 أكثر الكتب والروايات قراءة:\n" + (topB.map(([t, c], i) => `${i + 1}. ${t} (${c})`).join("\n") || "-");
            h.copyText(txt, () => showToast("📋 تم نسخ تقرير نجوم القراءة للشات!", 3000, "gold"));
        },

        cleanOldHistory(days) {
            if (!st.db || !confirm(`حذف السجلات الأقدم من ${days} يوم؟`)) return;
            const cut = Date.now() - days * 864e5;
            st.db.ref("lail_library/history").once("value").then(sn => {
                const val = sn.val() || {}, up = {}; let cnt = 0;
                Object.entries(val).forEach(([u, m]) => {
                    if (m && "object" === typeof m) Object.entries(m).forEach(([id, it]) => { if (!it?.timestamp || it.timestamp < cut) { up[`${u}/${id}`] = null; cnt++; } });
                });
                if (!cnt) return showToast("لا توجد سجلات قديمة");
                st.db.ref("lail_library/history").update(up).then(() => showToast(`🧹 تم حذف ${cnt} سجل`));
            });
        },

        exportBackup() {
            const pack = { settings: st.settings, featured: st.featured, custom_books: st.customBooks, shelves: st.shelves, blacklist: st.blacklist, banned: st.bannedCache, schedule: st.schedule, poll: st.poll };
            const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url; a.download = `lail-library-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast("💾 تم تحميل النسخة الاحتياطية");
        },

        importBackup(ev) {
            const f = ev.target.files?.[0]; ev.target.value = "";
            if (!f || !st.db) return;
            const rd = new FileReader();
            rd.onload = () => {
                try {
                    const p = JSON.parse(rd.result);
                    if (!p || "object" !== typeof p || !confirm("استعادة بيانات إدارة المكتبة من الملف؟")) return;
                    const up = {};
                    ["settings", "featured", "custom_books", "shelves", "blacklist", "banned", "schedule", "poll"].forEach(k => { if (void 0 !== p[k]) up[k] = p[k]; });
                    st.db.ref(ADMIN_PATH).update(up).then(() => { this.loadBanned(); showToast("✅ تم الاستيراد بنجاح"); });
                } catch (e) { alert("❌ ملف JSON غير صالح."); }
            };
            rd.readAsText(f);
        },

        loadLogs() {
            st.db?.ref(`${ADMIN_PATH}/logs`).limitToLast(100).once("value").then(sn => {
                st.logsCache = Object.entries(sn.val() || {}).map(([id, d]) => Object.assign({ id }, d)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                this.renderLogs();
            }).catch(() => {});
        },

        renderLogs() {
            const c = document.getElementById("llba-logs-list"); if (!c) return;
            const q = (document.getElementById("llba-log-q")?.value || "").trim().toLowerCase();
            const list = st.logsCache.filter(x => !q || `${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
            if (!list.length) { c.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا توجد سجلات.</div>'; return; }
            c.innerHTML = list.map(x => `<div class="llba-card" style="padding:7px 10px;background:rgba(0,0,0,.22);"><div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span class="llba-tag llba-t-gold">${h.esc(x.action)}</span><span style="font-size:10px;color:#94a3b8;">${h.formatDate(x.timestamp)}</span></div><div style="font-size:11.5px;"><b style="color:#D4AF37;">${h.esc(x.admin)}</b> ➔ <b style="color:#38bdf8;">${h.esc(x.target)}</b></div></div>`).join("");
        }
    };

    // ==================== التطبيق الرئيسي (window.lailApp) ====================
    window.lailApp = {
        activeTab: "local",
        openAdmin: () => libAdmin.open(),

        openNoteModal() {
            if (!h.isAdmin()) {
                const ban = h.getActiveBan();
                if (ban && ("notes_only" === ban.scope || "full" === ban.scope)) return alert(h.banMsg(ban));
            }
            const bookId = this.reader.currentOpenedBookId, bookTitle = this.reader.currentBookTitle || "كتاب";
            if (!bookId) return;
            const key = "lail_lib_note_" + h.san(bookId);
            let saved = "";
            try { saved = localStorage.getItem(key) || ""; } catch (e) {}
            document.getElementById("lail-lib-note")?.remove();
            const ov = document.createElement("div");
            ov.id = "lail-lib-note";
            ov.className = "lail-lib-popov";
            ov.innerHTML = `<div class="lail-lib-popbox">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="color:#93c5fd;">📝 ملاحظاتي واقتباساتي</b><button type="button" class="lail-close-btn" id="lail-ln-x"><i class="fas fa-times"></i></button></div>
                <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">📖 ${h.esc(bookTitle)}</div>
                <textarea id="lail-ln-ta" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px;font-family:inherit;font-size:13px;" rows="5" placeholder="اكتب ملاحظاتك أو الاقتباسات التي أعجبتك هنا..."></textarea>
                <div style="display:flex;gap:8px;margin-top:10px;">
                    <button type="button" id="lail-ln-save" style="flex:1;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;border:none;border-radius:10px;padding:9px;font-weight:bold;cursor:pointer;font-family:inherit;">حفظ الملاحظة</button>
                    <button type="button" id="lail-ln-copy" style="background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:10px;padding:9px 14px;font-weight:bold;cursor:pointer;font-family:inherit;">نسخ</button>
                </div>
            </div>`;
            document.body.appendChild(ov);
            document.getElementById("lail-ln-ta").value = saved;
            const close = () => { ov.classList.remove("active"); setTimeout(() => ov.remove(), 200); };
            ov.onclick = e => { if (e.target === ov) close(); };
            document.getElementById("lail-ln-x").onclick = close;
            document.getElementById("lail-ln-save").onclick = () => {
                const v = document.getElementById("lail-ln-ta").value;
                try { localStorage.setItem(key, v); } catch (e) {}
                close();
                showToast("💾 تم حفظ ملاحظتك");
            };
            document.getElementById("lail-ln-copy").onclick = () => {
                const v = document.getElementById("lail-ln-ta").value.trim();
                if (v) h.copyText(`📝 اقتباس من (${bookTitle}):\n${v}`, () => showToast("📋 تم نسخ الملاحظة"));
            };
            requestAnimationFrame(() => ov.classList.add("active"));
        },

        openVipSubmitModal() {
            if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
            const adm = h.isAdmin(), needRev = !adm && !1 !== st.settings.requireReviewForVipBooks;
            document.getElementById("lail-lib-vipsub")?.remove();
            const ov = document.createElement("div");
            ov.id = "lail-lib-vipsub";
            ov.className = "lail-lib-popov";
            ov.innerHTML = `<div class="lail-lib-popbox">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="color:#fde68a;">✨ ${needRev ? "اقتراح / إرسال كتاب للمراجعة" : "إضافة كتاب جديد"}</b><button type="button" class="lail-close-btn" id="lail-vs-x"><i class="fas fa-times"></i></button></div>
                <input id="lail-vs-t" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:9px;padding:8px 10px;font-family:inherit;margin-bottom:6px;" placeholder="عنوان الكتاب أو الرواية *">
                <input id="lail-vs-a" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:9px;padding:8px 10px;font-family:inherit;margin-bottom:6px;" placeholder="اسم المؤلف (اختياري)">
                <input id="lail-vs-c" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:9px;padding:8px 10px;font-family:inherit;margin-bottom:6px;" dir="ltr" placeholder="رابط صورة الغلاف (اختياري)">
                <textarea id="lail-vs-txt" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:9px;padding:8px 10px;font-family:inherit;margin-bottom:10px;" rows="4" placeholder="اكتب النص أو اترك رابطاً..."></textarea>
                <button type="button" id="lail-vs-go" style="width:100%;background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;border:none;border-radius:10px;padding:10px;font-weight:800;cursor:pointer;font-family:inherit;">${needRev ? "إرسال للإدارة للمراجعة" : "نشر مباشرة"}</button>
            </div>`;
            document.body.appendChild(ov);
            const close = () => { ov.classList.remove("active"); setTimeout(() => ov.remove(), 200); };
            ov.onclick = e => { if (e.target === ov) close(); };
            document.getElementById("lail-vs-x").onclick = close;
            document.getElementById("lail-vs-go").onclick = () => {
                const title = document.getElementById("lail-vs-t").value.trim(),
                    author = document.getElementById("lail-vs-a").value.trim(),
                    coverUrl = document.getElementById("lail-vs-c").value.trim(),
                    raw = document.getElementById("lail-vs-txt").value.trim();
                if (!title || !raw) return alert("أدخل العنوان والمحتوى أو الرابط.");
                const isUrl = /^https?:\/\//i.test(raw) && !raw.includes("\n");
                const payload = {
                    title, author, coverUrl,
                    mode: isUrl ? "url" : "text",
                    url: isUrl ? raw : "",
                    chapters: isUrl ? [] : raw.split(/\n===\n/).map((t, i) => ({ num: i + 1, content: t.trim() })).filter(x => x.content),
                    by: st.myUsername || "VIP",
                    timestamp: Date.now()
                };
                if (needRev) {
                    st.db.ref(`${ADMIN_PATH}/pending_books`).push(payload).then(() => { close(); showToast("📨 تم إرسال مساهمتك للإدارة للمراجعة", 3500, "gold"); });
                } else {
                    const id = "cb_" + Date.now();
                    st.db.ref(`${ADMIN_PATH}/custom_books/${id}`).set(Object.assign({ id, badge: `VIP: ${payload.by}` }, payload)).then(() => { close(); showToast("✅ تم نشر الكتاب بنجاح", 3500, "gold"); });
                }
            };
            requestAnimationFrame(() => ov.classList.add("active"));
        },

        openReportModal() {
            if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
            if (!h.isAdmin() && Date.now() - st.lastRepTs < 45e3) {
                return showToast(`⏳ انتظر ${Math.ceil((45e3 - (Date.now() - st.lastRepTs)) / 1000)} ثانية قبل إرسال بلاغ آخر.`);
            }
            const id = this.reader.currentOpenedBookId, title = this.reader.currentBookTitle || "كتاب";
            if (!id) return;
            document.getElementById("lail-lib-rep")?.remove();
            const reasons = ["الكتاب أو الفصل لا يفتح", "خطأ في الترتيب أو النص", "محتوى غير لائق أو مخالف", "ملاحظة أخرى"];
            const ov = document.createElement("div");
            ov.id = "lail-lib-rep";
            ov.className = "lail-lib-popov";
            ov.innerHTML = `<div class="lail-lib-popbox">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="color:#fcd34d;">🚩 الإبلاغ عن مشكلة</b><button type="button" class="lail-close-btn" id="lail-lib-rep-x"><i class="fas fa-times"></i></button></div>
                <div style="font-size:12.5px;color:#cbd5e1;margin-bottom:10px;">📖 ${h.esc(title)}</div>
                ${reasons.map((r, i) => `<label style="display:flex;gap:8px;align-items:center;padding:7px 9px;background:rgba(0,0,0,.3);border-radius:8px;margin-bottom:5px;font-size:12.5px;cursor:pointer;"><input type="radio" name="lail-lrep-r" value="${h.esc(r)}" ${0 === i ? "checked" : ""}><span>${h.esc(r)}</span></label>`).join("")}
                <textarea id="lail-lrep-n" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:8px;padding:8px;font-family:inherit;margin:6px 0 10px;" rows="2" placeholder="تفاصيل إضافية (اختياري)..."></textarea>
                <button type="button" id="lail-lrep-go" style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);color:#111;border:none;border-radius:10px;padding:10px;font-weight:800;cursor:pointer;font-family:inherit;">إرسال البلاغ للإدارة</button>
            </div>`;
            document.body.appendChild(ov);
            const close = () => { ov.classList.remove("active"); setTimeout(() => ov.remove(), 200); };
            ov.onclick = e => { if (e.target === ov) close(); };
            document.getElementById("lail-lib-rep-x").onclick = close;
            document.getElementById("lail-lrep-go").onclick = () => {
                const reason = ov.querySelector('input[name="lail-lrep-r"]:checked')?.value || reasons[0],
                    note = document.getElementById("lail-lrep-n").value.trim();
                st.db.ref(`${ADMIN_PATH}/reports`).push({
                    bookId: String(id), title, reason, note,
                    reporter: st.myUsername || "ضيف", reporterSan: h.san(st.myUsername),
                    status: "open", timestamp: firebase.database.ServerValue.TIMESTAMP
                }).then(() => { st.lastRepTs = Date.now(); close(); showToast("✅ تم إرسال بلاغك للإدارة، شكراً لك!", 3500, "gold"); });
            };
            requestAnimationFrame(() => ov.classList.add("active"));
        },

        quickBlockCurrent() {
            if (!h.isAdmin() || !this.reader.currentOpenedBookId) return;
            const id = this.reader.currentOpenedBookId, title = this.reader.currentBookTitle || id;
            if (!confirm(`حجب «${title}» عن جميع الأعضاء فوراً؟`)) return;
            st.db?.ref(`${ADMIN_PATH}/blacklist/${h.san(id)}`).set({ id, title, by: st.myUsername || "الإدارة", timestamp: Date.now() })
                .then(() => { libAdmin.log("حجب سريع", title, ""); this.reader.backToLibrary(); showToast(`🚫 تم حجب «${title}»`); });
        },

        shareBook(title, author, type, source, ev) {
            if (ev) ev.stopPropagation();
            if (!h.isAdmin()) {
                const b = h.getActiveBan();
                if (b && ("share_only" === b.scope || "full" === b.scope)) return alert(h.banMsg(b));
            }
            const text = `📚 أنصحكم بقراءة هذا الكتاب:\n📖 الاسم: ${title}\n✍️ الكاتب: ${author || "غير معروف"}\n🏢 القسم: ${"local" === type || "custom" === type ? "مكتبة ليل" : "google" === source ? "المكتبة العامة (جوجل)" : "المكتبة العامة (أرشيف)"}`;
            const btn = ev && ev.currentTarget, ic = btn && btn.querySelector("i");
            h.copyText(text, () => {
                if (!btn || !ic) return;
                const prev = ic.className; ic.className = "fas fa-check"; btn.classList.add("copied");
                setTimeout(() => { ic.className = prev; btn.classList.remove("copied"); }, 2000);
            });
        },

        openLibrary() {
            const s = st.settings, adm = h.isAdmin(), vip = h.isVip();
            if (!adm && !vip && !1 === s.enabled) return alert(s.disabledMsg || DEFAULT_SETTINGS.disabledMsg);
            if (!adm && !vip && !1 === s.allowGuests && h.isGuest()) return alert("مكتبة ليل متاحة للأعضاء المسجلين فقط 📚");
            const ban = h.getActiveBan();
            if (!adm && ban && "full" === ban.scope) return alert(h.banMsg(ban));

            ensureUI();
            applyAdminSettings();
            setPresence("يتصفح المكتبة");
            maybeShowWelcome();
            document.getElementById("lail-unified-reader").style.display = "none";
            document.getElementById("lail-main-modal").style.display = "flex";

            if ("local" === this.activeTab && "" === document.getElementById("grid-local").innerHTML.trim()) {
                this.switchTab(s.defaultTab || "local");
            } else if ("favorites" === this.activeTab) this.favorites.renderFavorites();
            else if ("history" === this.activeTab) this.history.renderHistory();
        },

        closeLibrary() {
            if (st.countdownTimer) { clearInterval(st.countdownTimer); st.countdownTimer = null; }
            const m = document.getElementById("lail-main-modal");
            if (m) m.style.display = "none";
            const rd = document.getElementById("lail-unified-reader");
            if (!rd || "flex" !== rd.style.display) setPresence(null);
        },

        switchTab(tab) {
            ensureUI();
            this.activeTab = tab;
            ["local", "public", "history", "favorites"].forEach(t => {
                document.getElementById(`tab-${t}`)?.classList.toggle("active", t === tab);
                const sec = document.getElementById(`section-${t}`);
                if (sec) sec.style.display = t === tab ? "flex" : "none";
            });
            if ("local" === tab && "" === document.getElementById("grid-local").innerHTML.trim()) this.local.executeSearch("", !1);
            else if ("public" === tab && "" === document.getElementById("grid-public").innerHTML.trim()) this.public.fetchCategory("all", "الكل (تصفح عام)", document.getElementById("cat-all"));
            else if ("history" === tab) this.history.renderHistory();
            else if ("favorites" === tab) this.favorites.renderFavorites();
        },

        favorites: {
            storageKey: "lail_favorite_books",
            getFavorites() { try { return JSON.parse(localStorage.getItem(this.storageKey)) || []; } catch (e) { return []; } },
            isFavorite(id) { return this.getFavorites().some(b => String(b.id) === String(id)); },
            toggleFavorite(id, title, author, coverUrl, type, source, ev) {
                if (ev) ev.stopPropagation();
                const list = this.getFavorites(), idx = list.findIndex(b => String(b.id) === String(id));
                let added = !1;
                if (idx > -1) list.splice(idx, 1);
                else { list.unshift({ id, title, author, type, source, coverUrl, timestamp: Date.now() }); added = !0; }
                try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch (e) {}
                if (st.db && !h.isGuest()) {
                    const ref = st.db.ref(`lail_library/favorites/${h.san(st.myUsername)}/${h.san(id)}`);
                    added ? ref.set({ id, title, author, type, source: source || null, coverUrl: coverUrl || "", timestamp: Date.now() }) : ref.remove();
                }
                document.querySelectorAll(".lail-like-btn").forEach(btn => { if (btn.dataset.bookId === String(id)) btn.classList.toggle("active", added); });
                if ("favorites" === window.lailApp.activeTab) this.renderFavorites();
            },
            renderFavorites() {
                const grid = document.getElementById("grid-favorites"), list = this.getFavorites().filter(x => !h.isBlacklisted(x.id));
                if (!list.length) { grid.innerHTML = '<div class="lail-loader"><i class="fas fa-heart-broken fa-2x" style="margin-bottom:15px;color:#3f3f46;"></i><br>لا يوجد كتب في المفضلة حالياً.</div>'; return; }
                grid.innerHTML = "";
                const frag = document.createDocumentFragment();
                list.forEach(item => {
                    const isLoc = "local" === item.type, isCust = "custom" === item.type, isG = "google" === item.source;
                    frag.appendChild(createBookCard({
                        id: item.id, title: item.title, author: item.author || "", coverUrl: item.coverUrl || "",
                        type: item.type, source: item.source,
                        badgeClass: isLoc ? "badge-local" : isCust ? "badge-archive" : isG ? "badge-google" : "badge-archive",
                        badgeHtml: isLoc ? '<i class="fas fa-bookmark"></i> ليل' : isCust ? '<i class="fas fa-gem"></i> خاص' : h.esc(item.source || "عام"),
                        onOpen: () => isCust ? window.lailApp.reader.openCustomBook(item.id)
                            : isLoc ? window.lailApp.reader.openLocalNovel(item.id, item.title, !1, item.coverUrl || "")
                            : window.lailApp.reader.openPublicBook(item.id, item.title, item.source, item.coverUrl || "", item.author || "")
                    }));
                });
                grid.appendChild(frag);
            }
        },

        history: {
            storageKey: "lail_reading_history",
            getHistory() { try { return JSON.parse(localStorage.getItem(this.storageKey)) || []; } catch (e) { return []; } },
            saveEntry(entry) {
                const list = this.getHistory().filter(b => String(b.id) !== String(entry.id));
                list.unshift(entry);
                if (list.length > 25) list.pop();
                try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch (e) {}
                if (st.db && !h.isGuest()) {
                    st.db.ref(`lail_library/history/${h.san(st.myUsername)}/${h.san(entry.id)}`).set(entry).catch(() => {});
                }
            },
            saveLocal(id, title, chapterIndex, chapterName, coverUrl) {
                this.saveEntry({ id, title, type: "local", chapterIndex: chapterIndex ?? null, chapterName: chapterName || "", coverUrl: coverUrl || "", timestamp: Date.now() });
            },
            savePublic(id, title, source, coverUrl, author) {
                this.saveEntry({ id, title, type: "public", source: source || "google", coverUrl: coverUrl || "", author: author || "", timestamp: Date.now() });
            },
            clearHistory() {
                if (!confirm("هل أنت متأكد من مسح سجل القراءة بالكامل؟")) return;
                localStorage.removeItem(this.storageKey);
                if (st.db && !h.isGuest()) st.db.ref(`lail_library/history/${h.san(st.myUsername)}`).remove();
                this.renderHistory();
            },
            renderHistory() {
                const grid = document.getElementById("grid-history"), list = this.getHistory().filter(x => !h.isBlacklisted(x.id));
                if (!list.length) { grid.innerHTML = '<div class="lail-loader"><i class="fas fa-history fa-2x" style="margin-bottom:15px;color:#3f3f46;"></i><br>لا يوجد كتب في سجل القراءة حالياً.</div>'; return; }
                grid.innerHTML = "";
                const frag = document.createDocumentFragment();
                list.forEach(item => {
                    const isLoc = "local" === item.type, isCust = "custom" === item.type, isG = "google" === item.source;
                    frag.appendChild(createBookCard({
                        id: item.id, title: item.title, author: item.author || "",
                        subText: isLoc && item.chapterName ? `مواصلة: ${item.chapterName}` : "",
                        coverUrl: item.coverUrl || "", type: item.type, source: item.source,
                        badgeClass: isLoc ? "badge-local" : isCust ? "badge-archive" : isG ? "badge-google" : "badge-archive",
                        badgeHtml: isLoc ? '<i class="fas fa-bookmark"></i> ليل' : isCust ? '<i class="fas fa-gem"></i> خاص' : h.esc(item.source || "عام"),
                        onOpen: () => isCust ? window.lailApp.reader.openCustomBook(item.id)
                            : isLoc ? window.lailApp.history.resumeLocal(item.id, item.title, item.chapterIndex, item.coverUrl || "")
                            : window.lailApp.reader.openPublicBook(item.id, item.title, item.source, item.coverUrl || "", item.author || "")
                    }));
                });
                grid.appendChild(frag);
            },
            async resumeLocal(id, title, chIdx, coverUrl) {
                await window.lailApp.reader.openLocalNovel(id, title, !0, coverUrl || null);
                const d = window.lailApp.reader.currentNovelData;
                if (null != chIdx && d && d.chapters && d.chapters[chIdx]) window.lailApp.reader.readChapter(chIdx);
            }
        },

        local: {
            isFetching: !1, currentQuery: "", page: 1, hasMore: !0,
            triggerSearch() {
                const q = document.getElementById("input-local-search").value.trim();
                if (!h.isAdmin()) {
                    const b = h.getActiveBan();
                    if (b && ("search_only" === b.scope || "full" === b.scope)) return alert(h.banMsg(b));
                    if (h.isWordBlocked(q)) return showToast("🚫 عبارة البحث غير مسموحة من قبل الإدارة.", 3500, "red");
                }
                this.executeSearch(q, !1);
            },
            async executeSearch(q, append = !1) {
                if (this.isFetching || (!this.hasMore && append)) return;
                if (!append) { this.currentQuery = q; this.page = 1; this.hasMore = !0; }
                const grid = document.getElementById("grid-local");
                this.isFetching = !0;
                if (!append) grid.innerHTML = '<div class="lail-loader"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>جاري جلب الروايات...</div>';
                try {
                    if (!window.lailLocalNovelsCache.length) {
                        const res = await fetch(`${DB_BASE}/index.json?nocache=${Date.now()}`);
                        if (res.ok) window.lailLocalNovelsCache = h.shuffle(await res.json());
                    } else if (!append && !this.currentQuery) h.shuffle(window.lailLocalNovelsCache);

                    let pool = window.lailLocalNovelsCache.filter(b => !h.isBlacklisted(b.id));
                    if (this.currentQuery) {
                        const needle = this.currentQuery.toLowerCase();
                        pool = pool.filter(b => (b.title && b.title.toLowerCase().includes(needle)) || (b.author && b.author.toLowerCase().includes(needle)));
                    }

                    const start = (this.page - 1) * 40, slice = pool.slice(start, start + 40);
                    if (!append) {
                        grid.innerHTML = "";
                        if (!this.currentQuery) renderHomeHighlights(grid);
                    }
                    if (!slice.length && !append) grid.insertAdjacentHTML("beforeend", '<div class="lail-loader">لم نجد رواية مطابقة في مكتبة ليل.</div>');

                    const frag = document.createDocumentFragment();
                    slice.forEach(book => {
                        const lbl = book.chapters_count ? `${book.chapters_count} فصل` : "غرام";
                        frag.appendChild(createBookCard({
                            id: book.id, title: book.title, author: book.author || "", coverUrl: book.cover || "",
                            type: "local", source: null, badgeClass: "badge-local", badgeHtml: `<i class="fas fa-star"></i> ${h.esc(lbl)}`,
                            onOpen: () => window.lailApp.reader.openLocalNovel(book.id, book.title, !1, book.cover || "")
                        }));
                    });
                    grid.appendChild(frag);
                    if (start + 40 >= pool.length) this.hasMore = !1; else this.page++;
                } catch (e) {
                    if (!append) grid.innerHTML = '<div class="lail-loader">حدث خطأ في الاتصال.</div>';
                }
                this.isFetching = !1;
            }
        },

        public: {
            isFetching: !1, currentQuery: "", isCategorySearch: !0, page: 1, hasMore: !0, currentSource: "google", currentOffset: 0, archivePageOffset: 0,
            toggleSidebar(open) {
                const ov = document.getElementById("lail-public-sidebar-overlay"), sb = document.getElementById("lail-public-sidebar");
                if (open) { ov.style.display = "block"; setTimeout(() => { ov.style.opacity = "1"; sb.style.right = "0"; }, 10); }
                else { ov.style.opacity = "0"; sb.style.right = "-320px"; setTimeout(() => { ov.style.display = "none"; }, 300); }
            },
            fetchCategory(id, name, el) {
                this.isCategorySearch = !0;
                this.toggleSidebar(!1);
                document.querySelectorAll(".lail-sidebar-item").forEach(i => i.classList.remove("active"));
                if (el) el.classList.add("active");
                document.getElementById("input-public-search").value = "";
                this.executeSearch(id, null, !1);
            },
            triggerSearch() {
                const q = document.getElementById("input-public-search").value.trim();
                if (!q) return;
                if (!h.isAdmin()) {
                    const b = h.getActiveBan();
                    if (b && ("search_only" === b.scope || "full" === b.scope)) return alert(h.banMsg(b));
                    if (h.isWordBlocked(q)) return showToast("🚫 عبارة البحث غير مسموحة من قبل الإدارة.", 3500, "red");
                }
                document.querySelectorAll(".lail-sidebar-item").forEach(i => i.classList.remove("active"));
                this.isCategorySearch = !1;
                this.executeSearch(q, null, !1);
            },
            async executeSearch(q, _unused = null, append = !1) {
                if (this.isFetching || (!this.hasMore && append)) return;
                if (!append) {
                    this.currentQuery = q; this.page = 1; this.hasMore = !0; this.currentSource = "google";
                    this.currentOffset = this.isCategorySearch ? Math.floor(60 * Math.random()) : 0;
                    this.archivePageOffset = this.isCategorySearch ? Math.floor(4 * Math.random()) : 0;
                }
                const grid = document.getElementById("grid-public");
                this.isFetching = !0;
                if (!append) grid.innerHTML = '<div class="lail-loader"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>جاري البحث في المكاتب العالمية...</div>';
                let found = 0;
                try {
                    if ("google" === this.currentSource) {
                        const startIdx = this.currentOffset + (this.page - 1) * 24,
                            neg = " -إباحي -اباحي -شذوذ -porn -sex -erotica",
                            qStr = this.isCategorySearch ? ("all" === this.currentQuery ? "كتاب" + neg : "subject:" + this.currentQuery + neg) : this.currentQuery + neg;
                        try {
                            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(qStr)}&langRestrict=ar&startIndex=${startIdx}&maxResults=24`);
                            if (!res.ok) throw Error("Google Blocked");
                            const data = await res.json();
                            if (data.items && data.items.length) {
                                if (!append) grid.innerHTML = "";
                                const items = (this.isCategorySearch ? h.shuffle([...data.items]) : data.items).filter(x => !h.isBlacklisted(x.id));
                                const frag = document.createDocumentFragment();
                                items.forEach(item => {
                                    const v = item.volumeInfo || {}, title = v.title || "بدون عنوان",
                                        author = v.authors ? v.authors.join("، ") : "مؤلف غير معروف",
                                        cover = v.imageLinks ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail || "").replace("http:", "https:") : "";
                                    frag.appendChild(createBookCard({
                                        id: item.id, title, author, coverUrl: cover, type: "public", source: "google",
                                        badgeClass: "badge-google", badgeHtml: '<i class="fab fa-google"></i> Google',
                                        onOpen: () => window.lailApp.reader.openPublicBook(item.id, title, "google", cover, author)
                                    }));
                                });
                                grid.appendChild(frag); found = items.length; this.page++;
                            } else {
                                if (this.isCategorySearch && this.currentOffset > 0 && 1 === this.page) { this.currentOffset = 0; this.isFetching = !1; return this.executeSearch(q, _unused, append); }
                                this.currentSource = "archive"; this.page = 1;
                            }
                        } catch (e) { this.currentSource = "archive"; this.page = 1; }
                    }
                    if ("archive" === this.currentSource && (!append || 0 === found)) {
                        let aq = this.isCategorySearch ? ("all" === this.currentQuery ? "language:ara AND mediatype:texts" : `subject:(${this.currentQuery}) AND language:ara AND mediatype:texts`) : `(${this.currentQuery.replace(/['"]/g, "")}) AND language:ara AND mediatype:texts`;
                        aq += " AND NOT (إباحي OR اباحي OR شذوذ OR porn OR sex OR erotica)";
                        try {
                            const res = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(aq)}&fl[]=identifier,title,creator&sort[]=downloads+desc&rows=24&page=${this.archivePageOffset + this.page}&output=json`);
                            if (res.ok) {
                                const data = await res.json();
                                if (data.response && data.response.docs && data.response.docs.length) {
                                    if (!append && 0 === found) grid.innerHTML = "";
                                    const docs = (this.isCategorySearch ? h.shuffle([...data.response.docs]) : data.response.docs).filter(x => !h.isBlacklisted(x.identifier));
                                    const frag = document.createDocumentFragment();
                                    docs.forEach(doc => {
                                        const title = doc.title || "بدون عنوان",
                                            author = doc.creator ? (Array.isArray(doc.creator) ? doc.creator[0] : doc.creator) : "غير معروف",
                                            cover = `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`;
                                        frag.appendChild(createBookCard({
                                            id: doc.identifier, title, author, coverUrl: cover, type: "public", source: "archive",
                                            badgeClass: "badge-archive", badgeHtml: '<i class="fas fa-university"></i> Archive',
                                            onOpen: () => window.lailApp.reader.openPublicBook(doc.identifier, title, "archive", cover, author)
                                        }));
                                        found++;
                                    });
                                    grid.appendChild(frag); this.page++;
                                } else {
                                    if (this.isCategorySearch && this.archivePageOffset > 0 && 1 === this.page) { this.archivePageOffset = 0; this.isFetching = !1; return this.executeSearch(q, _unused, append); }
                                    this.hasMore = !1;
                                }
                            }
                        } catch (e) { this.hasMore = !1; }
                    }
                    if (0 === found && !append) grid.innerHTML = '<div class="lail-loader">لم نجد نتائج مطابقة.</div>';
                } catch (e) { if (!append) grid.innerHTML = '<div class="lail-loader">حدث خطأ في الاتصال.</div>'; }
                this.isFetching = !1;
            }
        },

        reader: {
            currentOpenedBookId: null,
            currentBookTitle: "",
            currentScrollKey: null,
            currentNovelData: null,
            currentCoverUrl: null,

            applyReaderPrefs() {
                const tr = document.getElementById("lail-text-reader");
                if (!tr) return;
                tr.classList.remove("th-sepia", "th-light");
                if ("sepia" === st.readerTheme) tr.classList.add("th-sepia");
                else if ("light" === st.readerTheme) tr.classList.add("th-light");
                const cnt = tr.querySelector(".novel-text-content");
                if (cnt) {
                    cnt.style.fontSize = st.readerFont + "rem";
                    cnt.classList.toggle("no-copy", !1 === st.settings.allowCopyText && !h.isAdmin());
                }
            },
            changeFont(delta) {
                st.readerFont = Math.max(.9, Math.min(2.2, +(st.readerFont + delta).toFixed(2)));
                try { localStorage.setItem("lail_lib_font", String(st.readerFont)); } catch (e) {}
                this.applyReaderPrefs();
            },
            cycleTheme() {
                st.readerTheme = "dark" === st.readerTheme ? "sepia" : "sepia" === st.readerTheme ? "light" : "dark";
                try { localStorage.setItem("lail_lib_theme", st.readerTheme); } catch (e) {}
                this.applyReaderPrefs();
            },
            toolsHtml() {
                return `<div class="lail-reader-tools">
                    <button class="lail-tool-btn" type="button" onclick="window.lailApp.reader.changeFont(0.15)">A+</button>
                    <button class="lail-tool-btn" type="button" onclick="window.lailApp.reader.changeFont(-0.15)">A-</button>
                    <button class="lail-tool-btn" type="button" onclick="window.lailApp.reader.cycleTheme()" title="تبديل وضع القراءة"><i class="fas fa-adjust"></i></button>
                </div>`;
            },

            prepareUI(title, mode) {
                ensureUI();
                applyAdminSettings();
                this.currentBookTitle = title || "";
                setPresence(`يقرأ: ${title}`);
                document.getElementById("lail-main-modal").style.display = "none";
                document.getElementById("lail-minimized-btn").style.display = "none";
                document.getElementById("lail-unified-reader").style.display = "flex";
                const isText = "local" === mode;
                document.getElementById("reader-title").innerHTML = isText
                    ? `<i class="fas fa-book-open" style="color:#8b5cf6;"></i> ${h.esc(title)}`
                    : `<i class="fas fa-globe" style="color:#10b981;"></i> ${h.esc(title)}`;
                document.getElementById("min-title").textContent = title || "متابعة القراءة";
                document.getElementById("min-icon").style.color = isText ? "#8b5cf6" : "#10b981";
                document.getElementById("lail-minimized-btn").style.borderColor = isText ? "#8b5cf6" : "#10b981";
                const fr = document.getElementById("lail-iframe-reader"), tr = document.getElementById("lail-text-reader");
                if (isText) {
                    fr.style.display = "none"; fr.src = "";
                    tr.style.display = "block";
                    tr.innerHTML = "<div style='text-align:center;padding:100px;'><i class='fas fa-circle-notch fa-spin fa-3x' style='color:#8b5cf6;'></i></div>";
                } else {
                    tr.style.display = "none"; fr.style.display = "block"; fr.src = "";
                }
            },

            backToLibrary() {
                document.getElementById("lail-unified-reader").style.display = "none";
                document.getElementById("lail-iframe-reader").src = "";
                document.getElementById("lail-main-modal").style.display = "flex";
                this.currentOpenedBookId = null; this.currentScrollKey = null;
                setPresence("يتصفح المكتبة");
                if ("history" === window.lailApp.activeTab) window.lailApp.history.renderHistory();
            },

            openCustomBook(id) {
                const it = st.customBooks[id];
                if (!it) return showToast("❌ هذا الكتاب غير متوفر.", 3000, "red");
                if (h.isBlacklisted(id) && !h.isAdmin()) return showToast("🚫 هذا الكتاب محجوب من قبل الإدارة.", 3500, "red");
                this.currentOpenedBookId = id;
                this.currentCoverUrl = it.coverUrl || null;
                window.lailApp.history.saveEntry({ id, title: it.title, type: "custom", author: it.author || "", coverUrl: it.coverUrl || "", timestamp: Date.now() });
                if ("audio" === it.mode && h.isAudioUrl(it.url)) {
                    this.prepareUI(it.title, "local");
                    document.getElementById("lail-text-reader").innerHTML = `<div class="lail-chapter-glass-header"><h3 class="lail-chapter-title">🎧 ${h.esc(it.title)}</h3></div><div class="lail-audio-bar"><audio controls autoplay style="width:100%;" src="${h.esc(it.url)}"></audio></div>`;
                } else if ("url" === it.mode || "audio" === it.mode) {
                    this.prepareUI(it.title, "public");
                    document.getElementById("lail-iframe-reader").src = h.smartEmbed(it.url);
                } else {
                    this.currentNovelData = { title: it.title, chapters: it.chapters || [] };
                    this.prepareUI(it.title, "local");
                    if (this.currentNovelData.chapters.length > 1) this.renderChaptersList();
                    else this.readChapter(0);
                }
            },

            async openLocalNovel(id, title, isResume = !1, coverUrl = null) {
                if (h.isBlacklisted(id) && !h.isAdmin()) return showToast("🚫 هذه الرواية محجوبة من قبل الإدارة.", 3500, "red");
                this.currentOpenedBookId = id; this.currentScrollKey = null; this.currentNovelData = null; this.currentCoverUrl = coverUrl || null;
                this.prepareUI(title, "local");
                const tr = document.getElementById("lail-text-reader");
                try {
                    const res = await fetch(`${DB_BASE}/novels/${encodeURIComponent(id)}.json?nocache=${Date.now()}`);
                    if (!res.ok) throw Error("Not found");
                    this.currentNovelData = await res.json();
                    if (this.currentNovelData.chapters && this.currentNovelData.chapters.length) {
                        if (!isResume) this.renderChaptersList();
                    } else {
                        if (!isResume) window.lailApp.history.saveLocal(id, title, null, null, this.currentCoverUrl);
                        this.currentScrollKey = `lail_txt_${id}`;
                        tr.innerHTML = `<div class="lail-chapter-glass-header"><h3 class="lail-chapter-title">${h.esc(title)}</h3>${this.toolsHtml()}</div><div class="novel-text-content">${this.currentNovelData.content || "المحتوى غير متوفر."}</div>`;
                        this.applyReaderPrefs();
                        const saved = localStorage.getItem(this.currentScrollKey);
                        setTimeout(() => { tr.scrollTop = saved ? parseInt(saved, 10) : 0; }, 50);
                    }
                } catch (e) { tr.innerHTML = '<div style="text-align:center;padding:50px;color:#ef4444;">تعذر تحميل الرواية.</div>'; }
            },

            renderChaptersList() {
                this.currentScrollKey = null;
                const tr = document.getElementById("lail-text-reader"), d = this.currentNovelData;
                if (!d || !d.chapters) return;
                let html = `<div style="padding:36px 0;"><div style="text-align:center;margin-bottom:32px;"><div style="display:inline-block;padding:22px 36px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:20px;"><i class="fas fa-layer-group fa-2x" style="color:#8b5cf6;margin-bottom:12px;"></i><h2 style="color:#fff;margin:0 0 12px;">${h.esc(d.title)}</h2><span style="color:#a1a1aa;padding:5px 16px;border-radius:20px;background:#1f1f22;">${d.chapters.length} فصل</span></div></div><div class="lail-chapters-grid">`;
                d.chapters.forEach((ch, idx) => { html += `<div class="lail-chapter-card" onclick="window.lailApp.reader.readChapter(${idx})">الفصل ${h.esc(ch.num || idx + 1)}</div>`; });
                html += "</div></div>";
                tr.innerHTML = html; tr.scrollTop = 0;
            },

            readChapter(idx) {
                const tr = document.getElementById("lail-text-reader"), ch = this.currentNovelData?.chapters?.[idx];
                if (!ch) return;
                const label = `الفصل ${ch.num || idx + 1}`;
                this.currentScrollKey = `lail_txt_${this.currentOpenedBookId}_ch_${idx}`;
                if (!String(this.currentOpenedBookId).startsWith("cb_")) {
                    window.lailApp.history.saveLocal(this.currentOpenedBookId, this.currentNovelData.title, idx, label, this.currentCoverUrl);
                }
                let html = `<div class="lail-chapter-glass-header"><button class="lail-btn-outline" type="button" onclick="window.lailApp.reader.renderChaptersList()"><i class="fas fa-list-ul"></i> الفصول</button><h3 class="lail-chapter-title">${h.esc(label)}</h3>${this.toolsHtml()}</div><div class="novel-text-content">${ch.content || ch.text || "غير متوفر."}</div><div class="lail-pagination">`;
                html += idx > 0 ? `<button class="lail-btn-outline" type="button" onclick="window.lailApp.reader.readChapter(${idx - 1})">السابق</button>` : "<div></div>";
                html += idx < this.currentNovelData.chapters.length - 1 ? `<button class="lail-btn-primary" type="button" onclick="window.lailApp.reader.readChapter(${idx + 1})">التالي</button>` : "<div></div>";
                html += "</div>";
                tr.innerHTML = html;
                this.applyReaderPrefs();
                const saved = localStorage.getItem(this.currentScrollKey);
                setTimeout(() => { tr.scrollTop = saved ? parseInt(saved, 10) : 0; }, 50);
            },

            openPublicBook(id, title, source, coverUrl = "", author = "") {
                if (h.isBlacklisted(id) && !h.isAdmin()) return showToast("🚫 هذا الكتاب محجوب من قبل الإدارة.", 3500, "red");
                this.currentOpenedBookId = id; this.currentScrollKey = null;
                window.lailApp.history.savePublic(id, title, source, coverUrl, author);
                this.prepareUI(title, "public");
                document.getElementById("lail-iframe-reader").src = "google" === source
                    ? `https://books.google.com/books?id=${encodeURIComponent(id)}&lpg=PP1&output=embed`
                    : `https://archive.org/embed/${encodeURIComponent(id)}?ui=embed`;
            },

            minimize() { document.getElementById("lail-unified-reader").style.display = "none"; document.getElementById("lail-minimized-btn").style.display = "flex"; },
            restore() { document.getElementById("lail-minimized-btn").style.display = "none"; document.getElementById("lail-unified-reader").style.display = "flex"; },
            close() {
                document.getElementById("lail-unified-reader").style.display = "none";
                document.getElementById("lail-iframe-reader").src = "";
                this.currentOpenedBookId = null; this.currentScrollKey = null;
                setPresence(null);
            }
        }
    };

    // ==================== ربط Firebase والهوية ومدير القائمة ====================
    function bindUserListeners() {
        if (!st.db) return;
        const san = h.san(st.myUsername);
        if (!san) return;
        if (st.listenedBanUser !== san) {
            if (st.listenedBanUser) st.db.ref(`${ADMIN_PATH}/banned/${st.listenedBanUser}`).off();
            st.listenedBanUser = san;
            st.db.ref(`${ADMIN_PATH}/banned/${san}`).on("value", sn => {
                st.myBan = sn.val() || null;
                const b = h.getActiveBan();
                if (b && "full" === b.scope && !h.isAdmin()) {
                    const m = document.getElementById("lail-main-modal"), r = document.getElementById("lail-unified-reader");
                    if ((m && "flex" === m.style.display) || (r && "flex" === r.style.display)) {
                        window.lailApp.reader.close(); window.lailApp.closeLibrary(); alert(h.banMsg(b));
                    }
                }
            });
        }
        if (st.listenedCmdUser !== san) {
            if (st.listenedCmdUser) st.db.ref(`${ADMIN_PATH}/cmds/${st.listenedCmdUser}`).off();
            st.listenedCmdUser = san;
            st.db.ref(`${ADMIN_PATH}/cmds/${san}`).on("value", sn => {
                const v = sn.val(); if (!v || !v.cmd) return;
                sn.ref.remove().catch(() => {});
                if (v.ts && Date.now() - v.ts > 6e4) return;
                if ("kick" === v.cmd && !h.isAdmin()) {
                    window.lailApp.reader.close(); window.lailApp.closeLibrary();
                    alert(v.text || "تم إخراجك من المكتبة من قبل الإدارة.");
                } else if ("alert" === v.cmd && v.text) {
                    showToast(`📩 تنبيه من الإدارة: ${v.text}`, 8000, "gold");
                }
            });
        }
    }

    function initFirebase() {
        if ("undefined" !== typeof firebase && firebase.database && firebase.apps.length > 0) {
            st.db = firebase.database();
            if (st.globalBound) return;
            st.globalBound = !0;

            st.db.ref("admins").on("value", sn => {
                st.adminUsers = Object.keys(sn.val() || {});
                if (window.LaylMenu) window.LaylMenu.refresh();
                applyAdminSettings();
                if (!h.isAdmin()) libAdmin.close();
            });
            st.db.ref(`${ADMIN_PATH}/settings`).on("value", sn => {
                const v = sn.val();
                st.settings = v && "object" === typeof v ? Object.assign({}, DEFAULT_SETTINGS, v) : Object.assign({}, DEFAULT_SETTINGS);
                if (!localStorage.getItem("lail_lib_theme") && st.settings.defaultReaderTheme) st.readerTheme = st.settings.defaultReaderTheme;
                if (!localStorage.getItem("lail_lib_font") && st.settings.defaultFontSize) st.readerFont = Number(st.settings.defaultFontSize) || 1.25;
                applyAdminSettings();
                libAdmin.refreshUI();
            });
            st.db.ref(`${ADMIN_PATH}/featured`).on("value", sn => { st.featured = sn.val() || {}; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/custom_books`).on("value", sn => { st.customBooks = sn.val() || {}; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/shelves`).on("value", sn => { st.shelves = sn.val() || {}; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/blacklist`).on("value", sn => { st.blacklist = sn.val() || {}; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/schedule`).on("value", sn => { st.schedule = sn.val() || null; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/poll`).on("value", sn => { st.poll = sn.val() || null; libAdmin.refreshUI(); });
            st.db.ref(`${ADMIN_PATH}/broadcast`).on("value", sn => {
                const v = sn.val();
                if (v && v.text && v.ts > st.bootTs && Date.now() - v.ts < 2e4) {
                    const m = document.getElementById("lail-main-modal"), r = document.getElementById("lail-unified-reader");
                    if ((m && "flex" === m.style.display) || (r && "flex" === r.style.display)) showToast(`📢 ${v.text}`, 7000, v.theme || "blue");
                }
            });
            bindUserListeners();
        } else if (++st.fbTries < 40) {
            setTimeout(initFirebase, 500);
        }
    }

    const syncLoginUser = id => {
        const val = document.getElementById(id)?.value?.trim();
        if (val && val !== st.myUsername) {
            st.myUsername = val;
            try { localStorage.setItem("pc_username", val); } catch (e) {}
            if (window.LaylMenu) window.LaylMenu.refresh();
            bindUserListeners();
        }
    };
    document.addEventListener("click", e => {
        if (e.target.closest("#member-login-btn")) syncLoginUser("member-username");
        if (e.target.closest("#register-btn")) syncLoginUser("register-username");
    });

    const items = [
        {
            id: "btn-lail-library",
            text: "مكتبة ليل",
            icon: "fas fa-book-reader",
            iconColor: "#8b5cf6",
            onClick: () => window.lailApp.openLibrary()
        },
        {
            id: "btn-lail-library-admin",
            text: "لوحة تحكم المكتبة",
            icon: "fas fa-book-reader",
            iconColor: "#fbbf24",
            iconBg: "linear-gradient(135deg,#2e1065,#6d28d9)",
            condition: () => h.isAdmin(),
            onClick: () => libAdmin.open()
        }
    ];
    items.forEach(item => {
        if (window.LaylMenu) window.LaylMenu.register(item);
        else (window.__laylMenuQueue = window.__laylMenuQueue || []).push(item);
    });

    initFirebase();
}();
