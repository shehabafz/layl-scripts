!function () {
    "use strict";
    if (window.laylContestsEngineLoaded) return;
    window.laylContestsEngineLoaded = !0;

    const FB_CFG = {
        apiKey: "AIzaSyC9fdv0xFDVRfUMgBEoI2WVeVi9U5BF3_8",
        authDomain: "layl-codenames.firebaseapp.com",
        projectId: "layl-codenames",
        storageBucket: "layl-codenames.firebasestorage.app",
        messagingSenderId: "651006164506",
        appId: "1:651006164506:web:1541818c0e5a6077415ba3"
    };

    const ROOT = "layl_contests_v2";
    const LEGACY_ROOT = "layl_royal_contest";
    const LEGACY_CID = "royal_live";

    const TEMPLATES = {
        royal: {
            id: "royal", name: "ألقاب وترشيح", icon: "fa-crown",
            desc: "يرشّح العضو نفسه مع شعار انتخابي وصورة اختيارية (فئة واحدة أو فئتين)",
            submitTitle: "مرحلة الترشيح", submitVerb: "رشّح نفسك الآن"
        },
        teams: {
            id: "teams", name: "معركة فريقين (فريق ضد فريق)", icon: "fa-fire-alt",
            desc: "مواجهة جماهيرية بين فريقين (مثل شباب ⚔️ بنات) بشريط شدّ الحبل المباشر وهتافات الداعمين",
            submitTitle: "تجهيز الفريقين", submitVerb: "صوّت لفريقك الآن ⚔️"
        },
        photo: {
            id: "photo", name: "تصوير وصور", icon: "fa-camera",
            desc: "رفع صورة مضغوطة عالية الوضوح مع تصويت أعمى وتكبير Lightbox",
            submitTitle: "مرحلة رفع الصور", submitVerb: "شارك بصورتك الآن"
        },
        talent: {
            id: "talent", name: "نصوص ومواهب", icon: "fa-feather-alt",
            desc: "مشاركات نصية (شعر، خواطر، نكت، قصص) مع قراءة كاملة وتصويت أعمى",
            submitTitle: "مرحلة استلام المواهب", submitVerb: "أضف مشاركتك الآن"
        },
        duo: {
            id: "duo", name: "أفضل ثنائي", icon: "fa-user-friends",
            desc: "يرشّح العضو نفسه مع شريكه ببطاقة ثنائية تجمع صورتيهما وشعاراً مشتركاً",
            submitTitle: "مرحلة تسجيل الثنائيات", submitVerb: "سجّل ثنائيك الآن"
        },
        media: {
            id: "media", name: "ذوق موسيقي ومقاطع", icon: "fa-music",
            desc: "مشاركة رابط يوتيوب (أغنية/شيلة/مشهد) بمشغّل خفيف عند الضغط وتصويت أعمى",
            submitTitle: "مرحلة إضافة المقاطع", submitVerb: "شارك بذوقك الآن"
        },
        raffle: {
            id: "raffle", name: "سحب عشوائي (قرعة)", icon: "fa-dice",
            desc: "دخول بضغطة زر ثم سحب عشوائي رسمي لعدد محدد من الفائزين (بمضاعفة فرص VIP)",
            submitTitle: "باب التسجيل في السحب مفتوح", submitVerb: "احجز تذكرتك الآن 🎟️"
        },
        quiz: {
            id: "quiz", name: "أسرع إجابة / صيد الكود", icon: "fa-bolt",
            desc: "سؤال أو لغز أو كود سري؛ أول من يجيب صح يفوز تلقائياً بالترتيب الزمني",
            submitTitle: "التحدي مفتوح الآن!", submitVerb: "أرسل إجابتك بسرعة ⚡"
        },
        bracket: {
            id: "bracket", name: "بطولة خروج المغلوب (1 ضد 1)", icon: "fa-trophy",
            desc: "مواجهات مباشرة 1 ضد 1 على جولات (ربع نهائي ⬅ نصف نهائي ⬅ نهائي)",
            submitTitle: "التسجيل في البطولة", submitVerb: "انضم لقائمة المتنافسين ⚔️"
        },
        poll: {
            id: "poll", name: "تصويت مباشر / استفتاء", icon: "fa-poll",
            desc: "بدون ترشيح؛ تضيف الإدارة الخيارات وتبدأ مرحلة التصويت فوراً",
            submitTitle: "تجهيز الخيارات", submitVerb: "صوّت الآن"
        },
        prediction: {
            id: "prediction", name: "توقعات وتحدي", icon: "fa-bullseye",
            desc: "يرسل الأعضاء توقعاتهم قبل الإغلاق، وتحدد الإدارة الإجابة الصحيحة لفرز الفائزين",
            submitTitle: "استقبال التوقعات", submitVerb: "سجّل توقعك الآن"
        }
    };

    const THEMES = {
        gold: {
            id: "gold", name: "ذهبي ملكي", accent: "#D4AF37", accent2: "#f59e0b",
            soft: "rgba(212,175,55,.16)", border: "rgba(212,175,55,.46)", text: "#fde68a",
            shellBg: "linear-gradient(180deg,#161829 0%,#0b0c14 100%)", btnText: "#111111"
        },
        obsidian: {
            id: "obsidian", name: "فحمي وذهبي فاخر", accent: "#fbbf24", accent2: "#b45309",
            soft: "rgba(251,191,36,.14)", border: "rgba(251,191,36,.42)", text: "#fef3c7",
            shellBg: "linear-gradient(180deg,#111115 0%,#060608 100%)", btnText: "#111111"
        },
        maroon: {
            id: "maroon", name: "عنابي وذهبي", accent: "#D4AF37", accent2: "#9f1239",
            soft: "rgba(159,18,57,.24)", border: "rgba(212,175,55,.48)", text: "#fecdd3",
            shellBg: "linear-gradient(180deg,#230d16 0%,#10070b 100%)", btnText: "#111111"
        },
        silver: {
            id: "silver", name: "فضي داكن", accent: "#cbd5e1", accent2: "#94a3b8",
            soft: "rgba(203,213,225,.15)", border: "rgba(203,213,225,.42)", text: "#f1f5f9",
            shellBg: "linear-gradient(180deg,#181b22 0%,#0b0d11 100%)", btnText: "#0f172a"
        },
        blue: {
            id: "blue", name: "أزرق ملكي", accent: "#38bdf8", accent2: "#2563eb",
            soft: "rgba(56,189,248,.16)", border: "rgba(56,189,248,.45)", text: "#bae6fd",
            shellBg: "linear-gradient(180deg,#0f1c2e 0%,#080d17 100%)", btnText: "#081220"
        },
        purple: {
            id: "purple", name: "بنفسجي ملكي", accent: "#c084fc", accent2: "#7c3aed",
            soft: "rgba(192,132,252,.16)", border: "rgba(192,132,252,.45)", text: "#e9d5ff",
            shellBg: "linear-gradient(180deg,#1d1230 0%,#0d0816 100%)", btnText: "#11081f"
        },
        emerald: {
            id: "emerald", name: "زمردي فاخر", accent: "#34d399", accent2: "#059669",
            soft: "rgba(16,185,129,.16)", border: "rgba(52,211,153,.45)", text: "#a7f3d0",
            shellBg: "linear-gradient(180deg,#0c211c 0%,#060f0d 100%)", btnText: "#052017"
        }
    };

    const PRESETS = [
        { key: "royal_kq", label: "👑 ملك وملكة الشات", data: { title: "مسابقة ملك وملكة شات ليل", subtitle: "رشّح نفسك وتنافس على التاج والجوائز الملكية الفاخرة", template: "royal", theme: "gold", icon: "fa-crown", mode: "dual", cat1Label: "ملك الشات", cat2Label: "ملكة الشات", nomHours: 48, voteHours: 72, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "teams_battle", label: "⚔️ شباب × بنات", data: { title: "معركة ليل الكبرى (شباب ⚔️ بنات)", subtitle: "انحَز لفريقك وصوّت له مع هتاف تشجيعي — الفوز للفريق الأكثر دعماً!", template: "teams", theme: "maroon", icon: "fa-fire-alt", mode: "single", cat1Label: "فريق الشباب", cat2Label: "فريق البنات", nomHours: 0, voteHours: 48, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "best_photo", label: "📸 أفضل تصوير", data: { title: "مسابقة أفضل تصوير", subtitle: "ارفع أجمل لقطة بعدستك؛ التصويت مجهول الهوية لضمان العدل", template: "photo", theme: "maroon", icon: "fa-camera", mode: "single", nomHours: 48, voteHours: 72, blindVoting: !0, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "best_design", label: "🎨 أجمل تصميم", data: { title: "مسابقة أجمل تصميم وبروفايل", subtitle: "شارك بأجمل تصميم أو لقطة بروفايل وتنافس على اللقب", template: "photo", theme: "purple", icon: "fa-palette", mode: "single", nomHours: 48, voteHours: 48, blindVoting: !0, hideLiveVotes: !1, showInMenu: !0, pinTop: !1, maxWinners: 1 } },
        { key: "best_poet", label: "✍️ شاعر / خاطرة", data: { title: "مسابقة أمير الحرف والقافية", subtitle: "شارك بأجمل بيت شعر أو خاطرة من إبداعك", template: "talent", theme: "silver", icon: "fa-feather-alt", mode: "single", nomHours: 48, voteHours: 48, blindVoting: !0, hideLiveVotes: !1, showInMenu: !0, pinTop: !1, maxWinners: 1 } },
        { key: "best_joke", label: "😂 أفضل نكتة", data: { title: "مسابقة أظرف نكتة وموقف", subtitle: "ارسم البسمة بموقف طريف أو نكتة ذكية واكسب الأصوات", template: "talent", theme: "gold", icon: "fa-laugh-squint", mode: "single", nomHours: 24, voteHours: 24, blindVoting: !0, hideLiveVotes: !1, showInMenu: !0, pinTop: !1, maxWinners: 1 } },
        { key: "best_duo", label: "💑 أفضل ثنائي", data: { title: "مسابقة أفضل ثنائي في ليل", subtitle: "سجّل نفسك مع شريكك المفضل وتنافسوا على لقب الثنائي الذهبي", template: "duo", theme: "maroon", icon: "fa-user-friends", mode: "single", nomHours: 48, voteHours: 72, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "music_taste", label: "🎵 الذوق الموسيقي", data: { title: "مسابقة أفضل ذوق موسيقي", subtitle: "شارك برابط أغنيتك أو شيلتك المفضلة — التصويت أعمى!", template: "media", theme: "purple", icon: "fa-music", mode: "single", nomHours: 48, voteHours: 48, blindVoting: !0, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "lucky_raffle", label: "🎰 سحب عشوائي", data: { title: "السحب العشوائي الكبير", subtitle: "احجز تذكرتك بضغطة زر وادخل القرعة على جوائز شات ليل!", template: "raffle", theme: "emerald", icon: "fa-dice", mode: "single", nomHours: 24, voteHours: 0, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 3 } },
        { key: "fast_quiz", label: "⚡ أسرع إجابة", data: { title: "تحدي اللغز السريع", subtitle: "أول الأعضاء إجابةً بالشكل الصحيح يتوّجون فوراً!", template: "quiz", theme: "blue", icon: "fa-bolt", mode: "single", nomHours: 12, voteHours: 0, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 3, quizPrompt: "اكتب سؤالك أو اللغز هنا...", correctAnswer: "" } },
        { key: "voice_code", label: "🔑 صيد الكود", data: { title: "صيد الكود السري (الصوتي)", subtitle: "استمع للكود السري في الروم الصوتي وسجّله هنا بأسرع وقت!", template: "quiz", theme: "obsidian", icon: "fa-key", mode: "single", nomHours: 6, voteHours: 0, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 3, quizPrompt: "أدخل الكود السري الذي تم ذكره في البث الصوتي:", correctAnswer: "" } },
        { key: "knockout", label: "⚔️ خروج المغلوب", data: { title: "بطولة نجوم ليل (1 ضد 1)", subtitle: "مواجهات إقصائية مباشرة حتى يتوّج بطل واحد على العرش!", template: "bracket", theme: "maroon", icon: "fa-trophy", mode: "single", nomHours: 24, voteHours: 48, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !0, maxWinners: 1 } },
        { key: "quick_poll", label: "🗳️ استفتاء مباشر", data: { title: "استفتاء شات ليل الأسبوعي", subtitle: "شارك برأيك واختر الأفضل من الخيارات المطروحة", template: "poll", theme: "blue", icon: "fa-poll", mode: "single", nomHours: 0, voteHours: 48, blindVoting: !1, hideLiveVotes: !1, showInMenu: !0, pinTop: !1, maxWinners: 1 } },
        { key: "match_predict", label: "🎯 توقع نتيجة", data: { title: "تحدي توقع النتيجة", subtitle: "سجّل توقعك قبل إغلاق الوقت وادخل قائمة الفائزين", template: "prediction", theme: "emerald", icon: "fa-bullseye", mode: "single", nomHours: 24, voteHours: 0, blindVoting: !0, hideLiveVotes: !0, showInMenu: !0, pinTop: !1, maxWinners: 5 } }
    ];

    const DEFAULT_PRIZES = [
        { icon: "fa-medal", title: "وسام خاص ومميز للفائز", dur: "لمدة أسبوع" },
        { icon: "fa-scroll", title: "بنر اسم خاص ومميز", dur: "دائم ♾️" },
        { icon: "fa-hashtag", title: "رقم عضوية مميز (من اختيار الفائز)", dur: "لمدة أسبوع" },
        { icon: "fa-crown", title: "ترقية ولقب خاص في قائمة المتواجدون", dur: "لمدة أسبوع" },
        { icon: "fa-id-card", title: "تصميم خاص لبروفايل العضوية", dur: "لمدة أسبوع" },
        { icon: "fa-comment-dots", title: "تصميم مميز لرسائل الشات العام", dur: "لمدة أسبوع" }
    ];

    const ROYAL_DEFAULT_PRIZES = [
        { icon: "fa-medal", title: "وسام «ملك / ملكة الشات»", dur: "لمدة أسبوع" },
        { icon: "fa-scroll", title: "بنر اسم خاص ومميز", dur: "دائم ♾️" },
        { icon: "fa-hashtag", title: "رقم عضوية مميز (من اختيار الفائز)", dur: "لمدة أسبوع" },
        { icon: "fa-crown", title: "ترقية ملك / ملكة الشات (أعلى نك في قائمة المتواجدون)", dur: "لمدة أسبوع" },
        { icon: "fa-id-card", title: "تصميم ملكي خاص لبروفايل العضوية", dur: "لمدة أسبوع" },
        { icon: "fa-comment-dots", title: "تصميم مميز لرسائل الشات العام", dur: "لمدة أسبوع" }
    ];

    const DEFAULT_RULES = "• يحق لكل عضو المشاركة مرة واحدة فقط في المسابقة.\n• التصويت حق لكل عضو مسجل مرة واحدة (أو حسب نظام الجولات/الفئات).\n• يُمنع التلاعب أو استخدام حسابات وهمية ويؤدي للاستبعاد الفوري.\n• في حال تعادل المركز الأول تحسم الإدارة النتيجة بالصوت الحاسم.";

    const DEFAULT_MANAGER_PERMS = {
        control: !0,
        entries: !0,
        votes: !0,
        radar: !0,
        prizes: !0,
        broadcast: !0
    };

    const DEFAULT_GLOBAL = {
        enabled: !0,
        disabledMsg: "نظام المسابقات متوقف مؤقتاً للصيانة 🏆",
        showHubInMenu: !1,
        hubTitle: "مركز المسابقات",
        showToastAd: !0,
        vipVoteWeight: 2,
        vipUsers: [],
        subAdmins: []
    };

    const DEFAULT_CONTEST_CFG = {
        enabled: !0,
        allowGuestsVote: !1,
        allowSelfVote: !1,
        allowVoteChange: !1,
        allowEditEntry: !0,
        allowVoteTransfer: !0,
        requireApproval: !1,
        blindVoting: !1,
        hideLiveVotes: !1,
        maxEntries: 0,
        allowPhotoWithEntry: !0,
        bannerText: "",
        bannerTheme: "gold",
        welcomeText: "",
        welcomeVersion: 0,
        rulesText: DEFAULT_RULES,
        managers: [],
        managerPerms: Object.assign({}, DEFAULT_MANAGER_PERMS)
    };

    const LEGACY_DEFAULT_SETTINGS = {
        enabled: !0,
        disabledMsg: "مسابقة ملك وملكة الشات متوقفة مؤقتاً للصيانة 👑",
        allowGuestsVote: !1, allowSelfVote: !1, allowVoteChange: !1, allowEditEntry: !0,
        allowVoteTransfer: !0, requireApproval: !1, hideLiveVotes: !1, showToastAd: !0,
        maxCandidates: 0, vipVoteWeight: 2, bannerText: "", bannerTheme: "gold",
        welcomeText: "", welcomeVersion: 0, rulesText: DEFAULT_RULES,
        vipUsers: [], subAdmins: [], managerPerms: Object.assign({}, DEFAULT_MANAGER_PERMS)
    };

    const st = {
        db: null,
        admins: [],
        myUser: null,
        myUid: null,
        myHtml: null,
        myAvatar: "",
        global: Object.assign({}, DEFAULT_GLOBAL),
        index: {},
        legacy: { state: null, settings: Object.assign({}, LEGACY_DEFAULT_SETTINGS), banned: {}, hof: {} },
        activeCid: null,
        adminCid: null,
        viewMode: "hub",
        data: { entries: {}, votes: {}, transfers: {}, prizes: DEFAULT_PRIZES.slice(), presence: {} },
        heavyCid: null,
        heavyRefs: [],
        heavyLoaded: !1,
        heavyDetachTimer: null,
        banned: {},
        hof: {},
        logs: [],
        myPresenceRef: null,
        myBanRef: null,
        myLegacyBanRef: null,
        cmdRef: null,
        legacyCmdRef: null,
        cmdUser: null,
        logsRef: null,
        bansRef: null,
        legacyBansRef: null,
        hofRef: null,
        legacyHofRef: null,
        adminPresenceRef: null,
        uiBuilt: !1,
        adminTab: "contests",
        catFilter: "all",
        searchQuery: "",
        announcedMap: {},
        bootTs: Date.now(),
        timerId: null,
        toastTimer: null,
        adTimer: null,
        renderTimer: null,
        adminRefreshTimer: null,
        menuSyncTimer: null,
        lastVoteAt: 0,
        fbTries: 0,
        confettiFiredKey: null
    };

    try {
        st.myUser = localStorage.getItem("pc_username") || null;
        st.myUid = localStorage.getItem("pc_userid") || null;
        st.myHtml = localStorage.getItem("pc_userhtml") || null;
    } catch (e) {}

    if (!document.getElementById("lce-menu-btn-style")) {
        const ms = document.createElement("style");
        ms.id = "lce-menu-btn-style";
        ms.textContent = `@keyframes lceGoldPulse{0%,100%{opacity:.3}50%{opacity:.95}}@media(prefers-reduced-motion:reduce){.lce-pulse-off::before{animation:none!important}}`;
        (document.head || document.documentElement).appendChild(ms);
    }

    const isLegacy = cid => cid === LEGACY_CID;

    function buildLegacyMeta() {
        const s = st.legacy.state;
        if (!s || "object" !== typeof s || "cleared" === s.status) return null;
        const oSet = Object.assign({}, LEGACY_DEFAULT_SETTINGS, st.legacy.settings || {});
        const isDual = "dual" === s.mode;
        const isActive = "active" === s.status;
        return {
            id: LEGACY_CID,
            isLegacy: !0,
            title: s.title || "مسابقة ملك وملكة الشات",
            subtitle: "رشّح نفسك وتنافس على التاج والجوائز الملكية الفاخرة",
            template: "royal",
            theme: s.theme || "gold",
            icon: "fa-crown",
            mode: isDual ? "dual" : "single",
            cat1Label: "ملك الشات", cat1Icon: "👑",
            cat2Label: "ملكة الشات", cat2Icon: "👸",
            status: isActive ? "active" : ("archived" === s.status ? "archived" : "idle"),
            season: Number(s.season) || 1,
            nomEnd: Number(s.nomEnd) || 0,
            voteEnd: Number(s.voteEnd) || 0,
            paused: Boolean(s.paused),
            pausedPhase: "nomination" === s.pausedPhase ? "submission" : (s.pausedPhase || "submission"),
            remainingMs: Number(s.remainingMs) || 0,
            voteMultiplier: Math.max(1, Number(s.voteMultiplier) || 1),
            tieBreaker: s.tieBreaker || null,
            tieBreakerCat1: s.tieBreakerKing || null,
            tieBreakerCat2: s.tieBreakerQueen || null,
            showInMenu: isActive && !1 !== s.showInMenu,
            pinTop: !1 !== s.pinTop,
            resultsPublished: !1,
            correctAnswer: "",
            quizPrompt: "",
            maxWinners: 1,
            createdBy: s.startedBy || "الإدارة",
            createdAt: Number(s.nomEnd) || 1,
            cfg: Object.assign({}, DEFAULT_CONTEST_CFG, {
                enabled: !1 !== oSet.enabled,
                allowGuestsVote: Boolean(oSet.allowGuestsVote),
                allowSelfVote: Boolean(oSet.allowSelfVote),
                allowVoteChange: Boolean(oSet.allowVoteChange),
                allowEditEntry: !1 !== oSet.allowEditEntry,
                allowVoteTransfer: !1 !== oSet.allowVoteTransfer,
                requireApproval: Boolean(oSet.requireApproval),
                blindVoting: !1,
                hideLiveVotes: Boolean(oSet.hideLiveVotes),
                maxEntries: Number(oSet.maxCandidates) || 0,
                allowPhotoWithEntry: !0,
                bannerText: oSet.bannerText || "",
                bannerTheme: oSet.bannerTheme || "gold",
                welcomeText: oSet.welcomeText || "",
                welcomeVersion: Number(oSet.welcomeVersion) || 0,
                rulesText: oSet.rulesText || DEFAULT_RULES,
                managers: Array.isArray(oSet.subAdmins) ? oSet.subAdmins : [],
                managerPerms: Object.assign({}, DEFAULT_MANAGER_PERMS, oSet.managerPerms || {})
            })
        };
    }

    function getVoteKey(cid, myK, slotCat, isDual, bracketSlot = null) {
        if (bracketSlot) return `${myK}_${bracketSlot}`;
        if (!isDual) return myK;
        if (isLegacy(cid)) return `${myK}_${"cat2" === slotCat ? "queen" : "king"}`;
        return `${myK}_${slotCat}`;
    }

    const h = {
        san: x => x ? String(x).replace(/[.#$\[\]\/]/g, "_").trim() : "",
        esc: x => String(x || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])),
        genId: (p = "cnt") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        isValidImg: av => Boolean(av && /^(https?:\/\/|data:image\/(jpeg|jpg|png|webp|gif);base64,)/i.test(String(av))),
        getTheme: k => THEMES[k] || THEMES.gold,
        normAr(s) {
            return String(s || "")
                .trim().toLowerCase()
                .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
                .replace(/[أإآ]/g, "ا")
                .replace(/ة/g, "ه")
                .replace(/ى/g, "ي")
                .replace(/\s+/g, " ");
        },
        parseYtId(url) {
            const s = String(url || "").trim();
            if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
            const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/|music\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/i);
            return m ? m[1] : "";
        },
        getContest(cid) {
            if (!cid) return null;
            if (isLegacy(cid)) return buildLegacyMeta();
            const raw = st.index ? st.index[cid] : null;
            if (!raw) return null;
            const cfg = Object.assign({}, DEFAULT_CONTEST_CFG, raw.cfg || {});
            cfg.managerPerms = Object.assign({}, DEFAULT_MANAGER_PERMS, raw.cfg?.managerPerms || {});
            return Object.assign({ id: cid, isLegacy: !1 }, raw, { cfg });
        },
        getAllContestIds() {
            const ids = Object.keys(st.index || {});
            if (buildLegacyMeta() && !ids.includes(LEGACY_CID)) ids.unshift(LEGACY_CID);
            return ids;
        },
        makeTeamEntries(cat1Label, cat2Label, now = Date.now()) {
            const n1 = (cat1Label || "فريق الشباب").trim();
            const n2 = (cat2Label || "فريق البنات").trim();
            return {
                team1: {
                    uid: "", username: "team1", displayName: n1, html: h.esc(n1), avatar: "", image: "",
                    partnerName: "", partnerAvatar: "", ytId: "", tickets: 1, category: "cat1",
                    title: "", text: "", badge: "", frozen: !1, isWinner: !1, status: "approved", bonusVotes: 0, joinedAt: now
                },
                team2: {
                    uid: "", username: "team2", displayName: n2, html: h.esc(n2), avatar: "", image: "",
                    partnerName: "", partnerAvatar: "", ytId: "", tickets: 1, category: "cat2",
                    title: "", text: "", badge: "", frozen: !1, isWinner: !1, status: "approved", bonusVotes: 0, joinedAt: now + 1
                }
            };
        },
        compressImg(file, mode = "avatar") {
            return new Promise((resolve, reject) => {
                if (!file || (file.type && !file.type.startsWith("image/"))) return reject("الرجاء اختيار ملف صورة صالح");
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                    try {
                        const cv = document.createElement("canvas");
                        const ctx = cv.getContext("2d");
                        if ("photo" === mode) {
                            const MAX = 680;
                            let w = img.width, ht = img.height;
                            if (w > ht) { if (w > MAX) { ht = Math.round(ht * MAX / w); w = MAX; } }
                            else { if (ht > MAX) { w = Math.round(w * MAX / ht); ht = MAX; } }
                            cv.width = w; cv.height = ht;
                            ctx.drawImage(img, 0, 0, w, ht);
                            let data = cv.toDataURL("image/webp", 0.66);
                            if (!data.startsWith("data:image/webp") || data.length > 135000) data = cv.toDataURL("image/jpeg", 0.66);
                            if (data.length > 165000) data = cv.toDataURL("image/jpeg", 0.5);
                            URL.revokeObjectURL(url);
                            resolve(data);
                        } else {
                            const MAX = 180;
                            const side = Math.min(img.width, img.height);
                            const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
                            cv.width = MAX; cv.height = MAX;
                            ctx.drawImage(img, sx, sy, side, side, 0, 0, MAX, MAX);
                            let data = cv.toDataURL("image/jpeg", 0.72);
                            if (data.length > 40000) data = cv.toDataURL("image/jpeg", 0.55);
                            URL.revokeObjectURL(url);
                            resolve(data);
                        }
                    } catch (err) {
                        URL.revokeObjectURL(url);
                        reject("تعذر معالجة الصورة");
                    }
                };
                img.onerror = () => { URL.revokeObjectURL(url); reject("تعذر قراءة الصورة"); };
                img.src = url;
            });
        },
        sanHtml(html) {
            const t = document.createElement("template");
            t.innerHTML = String(html || "");
            t.content.querySelectorAll("script,style,iframe,object,embed,svg,form,input,link,meta").forEach(n => n.remove());
            t.content.querySelectorAll("*").forEach(el => {
                Array.from(el.attributes).forEach(a => {
                    const n = a.name.toLowerCase(), v = a.value.trim().toLowerCase();
                    if (n.startsWith("on") || v.startsWith("javascript:")) el.removeAttribute(a.name);
                });
                if (el.hasAttribute("style")) {
                    ["background", "background-color", "background-image", "background-clip", "-webkit-background-clip", "-webkit-text-fill-color", "box-shadow", "border", "border-color"].forEach(p => el.style.removeProperty(p));
                }
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
        isGlobalSubAdmin() {
            const list = st.global.subAdmins;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUser || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        isContestManager(cid) {
            const c = h.getContest(cid);
            const list = c?.cfg?.managers;
            if (!Array.isArray(list) || !list.length) return !1;
            const u = st.myUser || "", s = h.san(u);
            return list.some(x => x === u || h.san(x) === s);
        },
        isAdmin(cid = null) {
            if (h.isSuperAdmin() || h.isGlobalSubAdmin()) return !0;
            if (cid) return h.isContestManager(cid);
            return h.getAllContestIds().some(id => h.isContestManager(id));
        },
        canPerm(cid, perm) {
            if (h.isSuperAdmin() || h.isGlobalSubAdmin()) return !0;
            if (!cid || !h.isContestManager(cid)) return !1;
            const c = h.getContest(cid);
            const perms = c?.cfg?.managerPerms || DEFAULT_MANAGER_PERMS;
            return !1 !== perms[perm];
        },
        isVip(cid = null) {
            const u = st.myUser || "", s = h.san(u);
            if (!u) return !1;
            const gList = Array.isArray(st.global.vipUsers) ? st.global.vipUsers : [];
            if (gList.some(x => x === u || h.san(x) === s)) return !0;
            if (!cid || isLegacy(cid)) {
                const lList = Array.isArray(st.legacy.settings?.vipUsers) ? st.legacy.settings.vipUsers : [];
                if (lList.some(x => x === u || h.san(x) === s)) return !0;
            }
            return !1;
        },
        getVipWeight(cid = null) {
            if (isLegacy(cid) && st.legacy.settings?.vipVoteWeight) return Math.max(1, Number(st.legacy.settings.vipVoteWeight) || 2);
            return Math.max(1, Number(st.global.vipVoteWeight) || 2);
        },
        myKey() { return h.san(st.myUser || st.myUid || ""); },
        getMyBan(cid = null) {
            const k = h.myKey();
            if (!k) return null;
            const check = b => {
                if (!b) return null;
                if (b.expiresAt && Date.now() >= b.expiresAt) return null;
                if (b.contestId && cid && "all" !== b.contestId && b.contestId !== cid) return null;
                return b;
            };
            const mainBan = check(st.banned?.[k]);
            if (mainBan) return mainBan;
            if (!cid || isLegacy(cid)) return check(st.legacy.banned?.[k]);
            return null;
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
                        const avatar = imgEl && imgEl.src && h.isValidImg(imgEl.src) ? imgEl.src : "";
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
                window.confetti({ particleCount: window.innerWidth < 600 ? 48 : 105, spread: 78, origin: { y: 0.6 }, colors: ["#D4AF37", "#fbbf24", "#ffffff", "#ef4444", "#a855f7", "#38bdf8", "#34d399"], zIndex: 2147483647 });
            };
            if (window.confetti) return run();
            const sc = document.createElement("script");
            sc.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
            sc.onload = run;
            document.head.appendChild(sc);
        }
    };

    // ==================== محوّل الجسر المباشر (Live Bridge Adapter) ====================
    const dbOps = {
        saveEntry(cid, key, e) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                return st.db.ref(`${LEGACY_ROOT}/candidates/${key}`).set({
                    uid: e.uid || "", username: e.username, displayName: e.displayName || e.username,
                    html: e.html || h.esc(e.displayName || e.username), avatar: e.avatar || "",
                    role: "cat2" === e.category ? "queen" : "king", slogan: e.text || "",
                    badge: e.badge || "", frozen: Boolean(e.frozen), status: e.status || "approved",
                    bonusVotes: Number(e.bonusVotes) || 0, joinedAt: e.joinedAt || Date.now()
                });
            }
            return st.db.ref(`${ROOT}/data/${cid}/entries/${key}`).set(e);
        },
        updateEntry(cid, key, part) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                const up = {};
                if (void 0 !== part.displayName) up.displayName = part.displayName;
                if (void 0 !== part.html) up.html = part.html;
                if (void 0 !== part.avatar) up.avatar = part.avatar;
                if (void 0 !== part.text) up.slogan = part.text;
                if (void 0 !== part.category) up.role = "cat2" === part.category ? "queen" : "king";
                if (void 0 !== part.badge) up.badge = part.badge;
                if (void 0 !== part.frozen) up.frozen = Boolean(part.frozen);
                if (void 0 !== part.status) up.status = part.status;
                if (void 0 !== part.bonusVotes) up.bonusVotes = Number(part.bonusVotes) || 0;
                return st.db.ref(`${LEGACY_ROOT}/candidates/${key}`).update(up);
            }
            return st.db.ref(`${ROOT}/data/${cid}/entries/${key}`).update(part);
        },
        removeEntry(cid, key) {
            if (!st.db) return Promise.reject();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/candidates/${key}` : `${ROOT}/data/${cid}/entries/${key}`).remove();
        },
        approveAllPending(cid, entriesObj) {
            if (!st.db) return Promise.resolve(0);
            const up = {}; let cnt = 0;
            Object.entries(entriesObj || {}).forEach(([k, e]) => { if (e && "pending" === e.status) { up[`${k}/status`] = "approved"; cnt++; } });
            if (!cnt) return Promise.resolve(0);
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/candidates` : `${ROOT}/data/${cid}/entries`).update(up).then(() => cnt);
        },
        saveVote(cid, voteKey, v) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                return st.db.ref(`${LEGACY_ROOT}/votes/${voteKey}`).set({
                    target: v.target, role: "cat2" === v.category ? "queen" : "king",
                    voterName: v.voterName, weight: v.weight, ts: v.ts
                });
            }
            return st.db.ref(`${ROOT}/data/${cid}/votes/${voteKey}`).set(v);
        },
        updateVotes(cid, up) {
            if (!st.db) return Promise.reject();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/votes` : `${ROOT}/data/${cid}/votes`).update(up);
        },
        removeVote(cid, voteKey) {
            if (!st.db) return Promise.reject();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/votes/${voteKey}` : `${ROOT}/data/${cid}/votes/${voteKey}`).remove();
        },
        wipeVotes(cid) {
            if (!st.db) return Promise.reject();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/votes` : `${ROOT}/data/${cid}/votes`).remove();
        },
        requestTransfer(cid, fromKey, payload) {
            if (!st.db) return Promise.reject();
            const path = isLegacy(cid) ? `${LEGACY_ROOT}/transfers/${fromKey}` : `${ROOT}/data/${cid}/transfers/${fromKey}`;
            return st.db.ref(path).set(payload);
        },
        cancelTransfer(cid, fromKey) {
            if (!st.db) return Promise.reject();
            const path = isLegacy(cid) ? `${LEGACY_ROOT}/transfers/${fromKey}` : `${ROOT}/data/${cid}/transfers/${fromKey}`;
            return st.db.ref(path).remove();
        },
        approveTransfer(cid, req) {
            if (!st.db || !req || !req.fromKey || !req.toKey) return Promise.reject("بيانات الطلب غير مكتملة.");
            const entries = st.data.entries || {}, votes = st.data.votes || {}, transfers = st.data.transfers || {};
            const fromE = entries[req.fromKey], toE = entries[req.toKey];
            if (!fromE || !toE) return Promise.reject("أحد المشاركين لم يعد موجوداً في المسابقة.");

            const leg = isLegacy(cid);
            const eNode = leg ? "candidates" : "entries";
            const up = {};
            const fromBonus = Number(fromE.bonusVotes) || 0;
            let movedWeight = fromBonus;

            Object.entries(votes).forEach(([vk, v]) => {
                if (v && v.target === req.fromKey) {
                    movedWeight += Math.max(1, Number(v.weight) || 1);
                    up[`votes/${vk}/target`] = req.toKey;
                    if (leg) up[`votes/${vk}/role`] = "cat2" === toE.category ? "queen" : "king";
                    else up[`votes/${vk}/category`] = toE.category || "cat1";
                }
            });

            if (fromBonus !== 0) {
                up[`${eNode}/${req.toKey}/bonusVotes`] = (Number(toE.bonusVotes) || 0) + fromBonus;
            }
            up[`${eNode}/${req.fromKey}`] = null;
            up[`transfers/${req.fromKey}`] = null;

            Object.entries(transfers).forEach(([tk, tr]) => {
                if (tr && tr.toKey === req.fromKey) up[`transfers/${tk}`] = null;
            });

            const baseRef = st.db.ref(leg ? LEGACY_ROOT : `${ROOT}/data/${cid}`);
            return baseRef.update(up).then(() => ({
                movedWeight,
                fromName: fromE.displayName || fromE.username || req.fromName,
                toName: toE.displayName || toE.username || req.toName
            }));
        },
        rejectTransfer(cid, fromKey) {
            return this.cancelTransfer(cid, fromKey);
        },
        patchContest(cid, part) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                const up = {};
                Object.entries(part).forEach(([k, v]) => {
                    if ("pausedPhase" === k) up.pausedPhase = "submission" === v ? "nomination" : v;
                    else if ("tieBreakerCat1" === k) up.tieBreakerKing = v;
                    else if ("tieBreakerCat2" === k) up.tieBreakerQueen = v;
                    else up[k] = v;
                });
                return st.db.ref(`${LEGACY_ROOT}/state`).update(up);
            }
            return st.db.ref(`${ROOT}/index/${cid}`).update(part);
        },
        patchContestCfg(cid, part) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                const up = {};
                Object.entries(part).forEach(([k, v]) => {
                    if ("maxEntries" === k) up.maxCandidates = v;
                    else if ("managers" === k) up.subAdmins = v;
                    else up[k] = v;
                });
                return st.db.ref(`${LEGACY_ROOT}/settings`).update(up);
            }
            return st.db.ref(`${ROOT}/index/${cid}/cfg`).update(part);
        },
        setPrizes(cid, list) {
            if (!st.db) return Promise.reject();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/prizes` : `${ROOT}/data/${cid}/prizes`).set(list);
        },
        broadcast(cid, text, theme = "gold") {
            if (!st.db) return Promise.reject();
            const payload = { text, theme, cid: cid || null, ts: Date.now(), by: st.myUser || "الإدارة" };
            const ps = [st.db.ref(`${ROOT}/broadcast`).set(payload)];
            if (isLegacy(cid)) ps.push(st.db.ref(`${LEGACY_ROOT}/broadcast`).set({ text, theme, ts: payload.ts, by: payload.by }));
            return Promise.all(ps);
        },
        cloneContest(cid) {
            if (!st.db) return Promise.reject();
            const src = h.getContest(cid);
            if (!src) return Promise.reject();
            const now = Date.now(), newCid = h.genId("cnt");
            const noSub = "poll" === src.template || "teams" === src.template;
            const noVote = ["prediction", "raffle", "quiz"].includes(src.template);
            const nomEnd = noSub ? now - 1000 : now + 48 * 36e5;
            const voteEnd = noVote ? nomEnd : nomEnd + 72 * 36e5;
            const copyMeta = {
                title: `${src.title} (نسخة)`,
                subtitle: src.subtitle || "",
                template: src.template, theme: src.theme, icon: src.icon, mode: "teams" === src.template ? "single" : src.mode,
                cat1Label: src.cat1Label || ("teams" === src.template ? "فريق الشباب" : "الفئة الأولى"),
                cat1Icon: src.cat1Icon || ("teams" === src.template ? "⚡" : "👑"),
                cat2Label: src.cat2Label || ("teams" === src.template ? "فريق البنات" : "الفئة الثانية"),
                cat2Icon: src.cat2Icon || ("teams" === src.template ? "🌸" : "👸"),
                status: "active", season: 1, nomEnd, voteEnd, paused: !1, voteMultiplier: 1,
                showInMenu: !1, pinTop: !1, resultsPublished: !1,
                maxWinners: Number(src.maxWinners) || 1,
                quizPrompt: src.quizPrompt || "", correctAnswer: src.correctAnswer || "",
                createdBy: st.myUser || "الإدارة", createdAt: now,
                cfg: Object.assign({}, src.cfg)
            };
            const up = {};
            up[`index/${newCid}`] = copyMeta;
            up[`data/${newCid}/prizes`] = Array.isArray(st.data.prizes) && st.data.prizes.length ? st.data.prizes : DEFAULT_PRIZES;
            if ("teams" === src.template) up[`data/${newCid}/entries`] = h.makeTeamEntries(copyMeta.cat1Label, copyMeta.cat2Label, now);
            return st.db.ref(ROOT).update(up).then(() => newCid);
        },
        startNewSeason(cid, c) {
            if (!st.db) return Promise.reject();
            const noSub = "poll" === c.template || "teams" === c.template;
            const noVote = ["prediction", "raffle", "quiz"].includes(c.template);
            const nomH = noSub ? 0 : ("quiz" === c.template ? 12 : 48);
            const votH = noVote ? 0 : 72;
            const now = Date.now(), nextSeason = (Number(c.season) || 0) + 1;
            const nomEnd = noSub ? now - 1000 : now + nomH * 36e5;
            const voteEnd = noVote ? nomEnd : nomEnd + votH * 36e5;
            if (isLegacy(cid)) {
                return st.db.ref(LEGACY_ROOT).update({
                    state: {
                        status: "active", season: nextSeason, title: c.title || "مسابقة ملك وملكة شات ليل",
                        mode: c.mode || "single", nomEnd, voteEnd, paused: !1, voteMultiplier: 1,
                        tieBreaker: null, tieBreakerKing: null, tieBreakerQueen: null,
                        showInMenu: !0, pinTop: !0, startedBy: st.myUser || "الإدارة"
                    },
                    candidates: null, votes: null, transfers: null,
                    broadcast: { text: `👑 انطلق الموسم #${nextSeason} — رشّح نفسك الآن!`, theme: "gold", ts: now, by: st.myUser || "الإدارة" }
                });
            }
            const up = {};
            up[`index/${cid}/status`] = "active";
            up[`index/${cid}/season`] = nextSeason;
            up[`index/${cid}/nomEnd`] = nomEnd;
            up[`index/${cid}/voteEnd`] = voteEnd;
            up[`index/${cid}/paused`] = !1;
            up[`index/${cid}/voteMultiplier`] = 1;
            up[`index/${cid}/tieBreaker`] = null;
            up[`index/${cid}/tieBreakerCat1`] = null;
            up[`index/${cid}/tieBreakerCat2`] = null;
            up[`index/${cid}/resultsPublished`] = !1;
            up[`index/${cid}/raffleWinners`] = null;
            up[`index/${cid}/bracket`] = null;
            up[`data/${cid}/entries`] = "teams" === c.template ? h.makeTeamEntries(c.cat1Label, c.cat2Label, now) : null;
            up[`data/${cid}/votes`] = null;
            up[`data/${cid}/transfers`] = null;
            return st.db.ref(ROOT).update(up);
        },
        banUser(key, data) {
            if (!st.db) return Promise.reject();
            const ps = [st.db.ref(`${ROOT}/banned/${key}`).set(data)];
            if ("all" === data.contestId || isLegacy(data.contestId)) {
                ps.push(st.db.ref(`${LEGACY_ROOT}/banned/${key}`).set({
                    name: data.name, scope: data.scope, reason: data.reason,
                    expiresAt: data.expiresAt, by: data.by, ts: data.ts
                }));
            }
            return Promise.all(ps);
        },
        unbanUser(key) {
            if (!st.db) return Promise.reject();
            return Promise.all([
                st.db.ref(`${ROOT}/banned/${key}`).remove(),
                st.db.ref(`${LEGACY_ROOT}/banned/${key}`).remove()
            ]);
        },
        clearPresence(cid) {
            if (!st.db || !cid) return Promise.resolve();
            return st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/presence` : `${ROOT}/data/${cid}/presence`).remove();
        },
        sendCmd(sanUser, cmd, text) {
            if (!st.db || !sanUser) return Promise.reject();
            const payload = { cmd, text, ts: Date.now(), by: st.myUser || "الإدارة" };
            return Promise.all([
                st.db.ref(`${ROOT}/cmds/${sanUser}`).set(payload),
                st.db.ref(`${LEGACY_ROOT}/cmds/${sanUser}`).set(payload)
            ]);
        },
        pushHof(cid, item) {
            if (!st.db) return Promise.reject();
            if (isLegacy(cid)) {
                return st.db.ref(`${LEGACY_ROOT}/hall_of_fame`).push({
                    season: item.season || 1, name: item.name,
                    role: "cat2" === item.catKey ? "queen" : "king",
                    avatar: item.avatar || "", votes: item.votes || 0, date: item.date || Date.now()
                });
            }
            return st.db.ref(`${ROOT}/hall_of_fame`).push(item);
        },
        removeHof(src, key) {
            if (!st.db) return Promise.reject();
            return st.db.ref("legacy" === src ? `${LEGACY_ROOT}/hall_of_fame/${key}` : `${ROOT}/hall_of_fame/${key}`).remove();
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

    function pinTopMenuBtns() {
        const pinnedIds = h.getAllContestIds()
            .sort((a, b) => (h.getContest(b)?.createdAt || 0) - (h.getContest(a)?.createdAt || 0))
            .filter(cid => {
                const c = h.getContest(cid);
                return c && "active" === c.status && !1 !== c.showInMenu && Boolean(c.pinTop);
            });
        if (!pinnedIds.length) return;
        const btn = document.getElementById(`btn-lce-c-${pinnedIds[0]}`);
        if (!btn || !btn.parentElement || null === btn.offsetParent) return;
        const list = btn.parentElement;
        const disp = window.getComputedStyle(list).display || "";
        if (disp.includes("grid")) return;
        const visible = Array.from(list.children).filter(el =>
            el.tagName === "BUTTON" && el !== btn && el.offsetParent !== null
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

    function computeVoteCounts(entriesObj, votesObj, matchKey = null) {
        const counts = {};
        if (entriesObj) {
            for (const k in entriesObj) {
                const e = entriesObj[k];
                if (e) counts[k] = matchKey ? 0 : (Number(e.bonusVotes) || 0);
            }
        }
        if (votesObj) {
            for (const vk in votesObj) {
                const v = votesObj[vk];
                if (!v || !v.target || void 0 === counts[v.target]) continue;
                if (matchKey && v.matchKey !== matchKey) continue;
                counts[v.target] += Math.max(1, Number(v.weight) || 1);
            }
        }
        return counts;
    }

    function getApprovedEntries(entriesObj, catFilter = null) {
        const out = [];
        if (!entriesObj) return out;
        for (const k in entriesObj) {
            const e = entriesObj[k];
            if (e && "pending" !== e.status && (!catFilter || "all" === catFilter || e.category === catFilter)) {
                out.push(Object.assign({ key: k }, e));
            }
        }
        return out;
    }

    function getTiedLeaders(entriesObj, counts, catFilter = null) {
        const list = getApprovedEntries(entriesObj, catFilter);
        if (!list.length) return [];
        let max = -1;
        for (let i = 0; i < list.length; i++) {
            const v = counts[list[i].key] || 0;
            if (v > max) max = v;
        }
        if (max <= 0) return [];
        return list.filter(c => (counts[c.key] || 0) === max);
    }

    function getPhaseInfo(c, entriesObj = null, votesObj = null) {
        if (!c || "idle" === c.status) return { phase: "idle", remaining: 0, paused: !1 };
        if ("archived" === c.status) return { phase: "archived", remaining: 0, paused: !1 };
        if (c.paused) return { phase: c.pausedPhase || "submission", remaining: c.remainingMs || 0, paused: !0 };
        const now = Date.now();
        if ("prediction" === c.template) {
            if (c.resultsPublished) return { phase: "results", remaining: 0, paused: !1 };
            if (now < (c.nomEnd || 0)) return { phase: "submission", remaining: c.nomEnd - now, paused: !1 };
            return { phase: "judging", remaining: 0, paused: !1 };
        }
        if ("raffle" === c.template) {
            if (c.resultsPublished) return { phase: "results", remaining: 0, paused: !1 };
            if (now < (c.nomEnd || 0)) return { phase: "submission", remaining: c.nomEnd - now, paused: !1 };
            return { phase: "drawing", remaining: 0, paused: !1 };
        }
        if ("quiz" === c.template) {
            const maxW = Math.max(1, Number(c.maxWinners) || 3);
            let wonCnt = 0;
            if (entriesObj) { for (const k in entriesObj) { if (entriesObj[k]?.isWinner) wonCnt++; } }
            if (c.resultsPublished || (entriesObj && wonCnt >= maxW) || now >= (c.nomEnd || 0)) {
                return { phase: "results", remaining: 0, paused: !1 };
            }
            return { phase: "submission", remaining: c.nomEnd - now, paused: !1 };
        }
        if ("bracket" === c.template) {
            if (c.resultsPublished || c.bracket?.champion) return { phase: "results", remaining: 0, paused: !1 };
            if (now < (c.nomEnd || 0)) return { phase: "submission", remaining: c.nomEnd - now, paused: !1 };
            return { phase: "voting", remaining: Math.max(0, (c.voteEnd || 0) - now), paused: !1 };
        }
        if ("poll" !== c.template && "teams" !== c.template && now < (c.nomEnd || 0)) {
            return { phase: "submission", remaining: c.nomEnd - now, paused: !1 };
        }
        if (now < (c.voteEnd || 0)) {
            return { phase: "voting", remaining: c.voteEnd - now, paused: !1 };
        }
        if (entriesObj && votesObj) {
            const counts = computeVoteCounts(entriesObj, votesObj);
            if ("dual" === c.mode && "teams" !== c.template) {
                const c1Ties = getTiedLeaders(entriesObj, counts, "cat1");
                const c2Ties = getTiedLeaders(entriesObj, counts, "cat2");
                const n1 = c1Ties.length > 1 && !c.tieBreakerCat1;
                const n2 = c2Ties.length > 1 && !c.tieBreakerCat2;
                if (n1 || n2) return { phase: "tiebreaker", remaining: 0, c1Ties: n1 ? c1Ties : [], c2Ties: n2 ? c2Ties : [] };
            } else {
                const ties = getTiedLeaders(entriesObj, counts, null);
                if (ties.length > 1 && !c.tieBreaker) return { phase: "tiebreaker", remaining: 0, ties };
            }
        }
        return { phase: "results", remaining: 0, paused: !1 };
    }

    function setPresence(cid, statusTxt) {
        if (!st.db) return;
        const k = h.myKey();
        if (!k) return;
        if (st.myPresenceRef) { st.myPresenceRef.remove().catch(() => {}); st.myPresenceRef = null; }
        if (!cid || !statusTxt) return;
        const ref = st.db.ref(isLegacy(cid) ? `${LEGACY_ROOT}/presence/${k}` : `${ROOT}/data/${cid}/presence/${k}`);
        st.myPresenceRef = ref;
        ref.onDisconnect().remove();
        ref.set({ name: st.myUser || k, status: statusTxt, ts: Date.now() }).catch(() => {});
    }

    function showToast(msg, ms = 3600, theme = "") {
        ensureBaseStyles();
        let el = document.getElementById("lce-toast");
        if (!el) {
            document.body.insertAdjacentHTML("beforeend", '<div id="lce-toast" class="lce-toast"></div>');
            el = document.getElementById("lce-toast");
        }
        clearTimeout(st.toastTimer);
        el.className = "lce-toast" + ("gold" === theme ? " th-gold" : "red" === theme ? " th-red" : "");
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add("show"));
        st.toastTimer = setTimeout(() => el.classList.remove("show"), ms);
    }

    function showBannerToastAd(msg, theme = "gold", targetCid = null) {
        if (!1 === st.global.showToastAd) return;
        ensureBaseStyles();
        let ad = document.getElementById("lce-live-ad");
        if (!ad) {
            ad = document.createElement("div");
            ad.id = "lce-live-ad";
            ad.innerHTML = `<div class="lce-ad-ico"><i class="fas fa-crown"></i></div><div id="lce-ad-msg"></div><div class="lce-ad-btns"><button type="button" class="lce-ad-go" id="lce-ad-join">دخول</button><button type="button" class="lce-ad-x" id="lce-ad-hide" title="إغلاق"><i class="fas fa-times"></i></button></div>`;
            document.body.appendChild(ad);
            document.getElementById("lce-ad-hide").onclick = () => ad.classList.remove("show");
        }
        document.getElementById("lce-ad-join").onclick = () => {
            ad.classList.remove("show");
            if (targetCid) window.LaylContests.open(targetCid);
            else window.LaylContests.openHub();
        };
        ad.className = "th-" + (theme || "gold");
        document.getElementById("lce-ad-msg").textContent = msg;
        clearTimeout(st.adTimer);
        requestAnimationFrame(() => ad.classList.add("show"));
        st.adTimer = setTimeout(() => ad.classList.remove("show"), 11000);
    }

   function announceContestPhase(cid, c) {
        if (!c || "active" !== c.status || !1 === c.cfg?.enabled) return;
        const ph = getPhaseInfo(c).phase;
        if ("idle" === ph || "archived" === ph) return;
        const key = `${cid}_${ph}_${c.season || 1}`;
        if (st.announcedMap[cid] === key) return;
        const isFirstLoad = !st.announcedMap[cid];
        st.announcedMap[cid] = key;
        if (isFirstLoad && Object.keys(st.announcedMap).length > 1) return;

        const buildPhaseToast = (curC, phase) => {
            const tName = curC.title || "المسابقة";
            const T = curC.template || "royal";
            const th = curC.theme || "gold";
            const copyMap = {
                royal: {
                    submission: `👑 فُتح باب الترشيح في (${tName})! رشّح نفسك الآن وتنافس على اللقب.`,
                    voting: `🗳️ بدأ التصويت في (${tName})! ادخل وصوّت لمن يستحق التاج الآن.`,
                    results: `👑 تُوّج الفائز في (${tName})! ادخل الآن لتهنئته على اللقب.`
                },
                teams: {
                    voting: `⚔️ اشتعلت المنافسة في (${tName})! ادخل وادعم فريقك بصوتك وهتافك الآن 🔥`,
                    results: `🏆 حُسمت معركة (${tName})! ادخل لتعرف أي فريق انتصر.`
                },
                photo: {
                    submission: `📸 بدأ استقبال الصور في (${tName})! شارك بأجمل لقطة بعدستك.`,
                    voting: `🖼️ بدأ التصويت في (${tName})! استعرض الصور وصوّت لأجمل لقطة.`,
                    results: `🏆 ظهرت نتائج (${tName})! ادخل لمشاهدة الصورة الفائزة وتهنئة صاحبها.`
                },
                talent: {
                    submission: `✍️ فُتح باب المشاركات في (${tName})! أبدعنا بحرفك وموهبتك الآن.`,
                    voting: `🗳️ حان وقت التصويت في (${tName})! اقرأ المشاركات وصوّت لأجمل إبداع.`,
                    results: `🏆 أُعلنت نتائج (${tName})! ادخل لتهنئة صاحب المركز الأول.`
                },
                duo: {
                    submission: `💑 بدأ تسجيل الثنائيات في (${tName})! سجّل نفسك مع شريكك الآن.`,
                    voting: `🗳️ بدأ التصويت في (${tName})! ادخل وصوّت لأفضل ثنائي في الشات.`,
                    results: `🏆 تُوّج الثنائي الذهبي في (${tName})! ادخل لتهنئتهما الآن.`
                },
                media: {
                    submission: `🎵 فُتح باب المشاركة في (${tName})! شاركنا ذوقك بأجمل مقطع الآن.`,
                    voting: `🎧 بدأ التصويت في (${tName})! استمع للمقاطع وصوّت لأفضل ذوق.`,
                    results: `🏆 أُعلنت نتائج (${tName})! ادخل لتعرف صاحب أفضل ذوق.`
                },
                raffle: {
                    submission: `🎟️ باب التسجيل مفتوح في (${tName})! احجز تذكرتك المجانية بضغطة زر.`,
                    drawing: `🎰 أُغلق التسجيل في (${tName}) — جاري السحب العشوائي الآن!`,
                    results: `🎉 ظهرت نتائج القرعة في (${tName})! ادخل لتعرف من حالفه الحظ.`
                },
                quiz: {
                    submission: `⚡ انطلق تحدي (${tName})! أسرع إجابة صحيحة تفوز فوراً.`,
                    results: `🏆 انتهى تحدي (${tName})! ادخل لتعرف الأسرع إجابةً والفائزين.`
                },
                bracket: {
                    submission: `⚔️ التسجيل مفتوح في (${tName})! احجز مقعدك في مواجهات خروج المغلوب.`,
                    voting: `🔥 بدأت مواجهات 1 ضد 1 في (${tName})! ادخل وصوّت لتأهيل الأفضل.`,
                    results: `🏆 تُوّج بطل (${tName})! ادخل الآن لتهنئة البطل.`
                },
                poll: {
                    voting: `🗳️ استفتاء جديد مفتوح في (${tName})! ادخل وشاركنا رأيك الآن.`,
                    results: `📊 ظهرت نتائج استفتاء (${tName})! ادخل لمشاهدة الخيار الفائز.`
                },
                prediction: {
                    submission: `🎯 باب التوقعات مفتوح في (${tName})! سجّل توقعك قبل إغلاق الوقت.`,
                    judging: `⚖️ أُغلق باب التوقعات في (${tName}) وبانتظار إعلان النتيجة الرسمية.`,
                    results: `🏆 ظهرت نتائج التوقعات في (${tName})! ادخل لتعرف من أصاب التوقع.`
                }
            };
            const fallback = {
                submission: `🔥 بدأت (${tName})! شارك الآن قبل انتهاء الوقت.`,
                voting: `🗳️ بدأ التصويت في (${tName})! ادخل وصوّت للأفضل الآن.`,
                drawing: `🎰 أُغلق التسجيل في (${tName}) — جاري السحب الآن!`,
                judging: `⚖️ أُغلق باب التوقعات في (${tName}) وبانتظار النتيجة.`,
                results: `🏆 ظهرت نتائج (${tName})! ادخل لتهنئة الفائزين.`
            };
            const msg = copyMap[T]?.[phase] || fallback[phase] || "";
            const color = "drawing" === phase ? "emerald" : ("judging" === phase ? "purple" : th);
            return msg ? { msg, color } : null;
        };

        const fire = () => {
            if (!1 === st.global.showToastAd) return;
            const curC = h.getContest(cid);
            if (!curC) return;
            if (!h.isAdmin(cid) && !h.isVip(cid) && (!1 === st.global.enabled || !1 === curC.cfg?.enabled)) return;
            if (document.getElementById("lce-modal")?.classList.contains("open")) return;
            const cur = getPhaseInfo(curC).phase;
            const info = buildPhaseToast(curC, cur);
            if (info) showBannerToastAd(info.msg, info.color, cid);
        };

        const isChatReady = () => {
            const mc = document.getElementById("messages-container");
            const lo = document.getElementById("login-overlay");
            return Boolean(mc && null !== mc.offsetParent && (!lo || lo.classList.contains("d-none") || "none" === window.getComputedStyle(lo).display));
        };
        if (isChatReady()) { setTimeout(fire, 1500); return; }
        let tries = 0;
        const iv = setInterval(() => {
            if (isChatReady()) { clearInterval(iv); setTimeout(fire, 1500); }
            else if (++tries >= 100) clearInterval(iv);
        }, 900);
    }
    function ensureBaseStyles() {
        if (document.getElementById("lce-styles")) return;
        const s = document.createElement("style");
        s.id = "lce-styles";
        s.textContent = `
        .lce-ov{--lce-ac:#D4AF37;--lce-ac2:#f59e0b;--lce-soft:rgba(212,175,55,.16);--lce-bd:rgba(212,175,55,.42);--lce-tx:#fde68a;--lce-bt:#111;position:fixed;inset:0;background:rgba(5,7,14,.94);z-index:2147483642;display:none;align-items:center;justify-content:center;direction:rtl;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;padding:12px;box-sizing:border-box}
        @media(min-width:769px){.lce-ov{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}}
        .lce-ov.open{display:flex}
        .lce-shell{background:linear-gradient(180deg,#161829 0%,#0b0c14 100%);border:1px solid var(--lce-bd);border-radius:22px;width:100%;max-width:960px;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;overflow:hidden;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,.88);position:relative;contain:layout style}
        .lce-hdr{padding:13px 18px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(90deg,var(--lce-soft),rgba(255,255,255,.02));border-bottom:1px solid var(--lce-bd);flex-shrink:0;gap:10px}
        .lce-brand{display:flex;align-items:center;gap:9px;font-weight:900;font-size:1.06rem;color:var(--lce-ac);min-width:0}
        .lce-brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .lce-hbtns{display:flex;gap:6px;align-items:center;flex-shrink:0}
        .lce-ibtn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;height:34px;padding:0 10px;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;transition:background .18s,border-color .18s;font-family:inherit}
        .lce-ibtn:hover{background:var(--lce-soft);border-color:var(--lce-ac);color:#fff}
        .lce-ibtn.sq{width:34px;padding:0;justify-content:center}
        .lce-ibtn.x:hover{background:#ef4444;border-color:#ef4444}
        .lce-banner{margin:10px 18px 0;padding:9px 14px;border-radius:12px;background:var(--lce-soft);border:1px solid var(--lce-bd);color:var(--lce-tx);font-size:.85rem;font-weight:700;display:none;align-items:center;gap:8px;flex-shrink:0}
        .lce-banner.th-red{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.42);color:#fecaca}
        .lce-banner.th-blue{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.42);color:#bfdbfe}
        .lce-mult-bar{margin:8px 18px 0;padding:8px 14px;border-radius:10px;background:linear-gradient(90deg,rgba(245,158,11,.22),rgba(236,72,153,.18));border:1px solid rgba(251,191,36,.5);color:#fef08a;font-size:.84rem;font-weight:800;text-align:center;display:none;flex-shrink:0}
        .lce-body{flex:1;overflow-y:auto;padding:18px 20px 26px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
        .lce-body::-webkit-scrollbar{width:6px}
        .lce-body::-webkit-scrollbar-thumb{background:var(--lce-bd);border-radius:10px}
        .lce-hero{text-align:center;padding:18px 16px;background:radial-gradient(circle at top,var(--lce-soft),transparent 72%);border:1px solid var(--lce-bd);border-radius:18px;margin-bottom:16px}
        .lce-hero h2{margin:6px 0 8px;font-size:1.35rem;font-weight:900;color:var(--lce-ac)}
        .lce-hero p{margin:0 auto;max-width:580px;color:#cbd5e1;font-size:.88rem;line-height:1.65}
        .lce-timer{display:inline-flex;align-items:center;gap:8px;margin-top:12px;background:rgba(0,0,0,.5);border:1px solid var(--lce-bd);color:var(--lce-tx);padding:7px 18px;border-radius:30px;font-family:monospace;font-size:1.05rem;font-weight:900;letter-spacing:1px;direction:ltr}
        .lce-btn{background:linear-gradient(135deg,var(--lce-ac),var(--lce-ac2));color:var(--lce-bt);border:none;padding:10px 18px;border-radius:12px;font-weight:900;font-size:.9rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:transform .15s,filter .15s;font-family:inherit;box-shadow:0 4px 14px var(--lce-soft)}
        .lce-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}
        .lce-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .lce-btn-out{background:rgba(255,255,255,.06);color:var(--lce-tx);border:1px solid var(--lce-bd);box-shadow:none}
        .lce-btn-out:hover{background:var(--lce-soft)}
        .lce-btn-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;box-shadow:0 4px 14px rgba(239,68,68,.24)}
        .lce-form{background:rgba(255,255,255,.03);border:1px solid var(--lce-bd);border-radius:16px;padding:16px;margin-bottom:18px}
        .lce-roles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
        .lce-role-opt{background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;cursor:pointer;text-align:center;transition:border-color .18s,background .18s;color:#cbd5e1;font-weight:800;font-size:.9rem}
        .lce-role-opt.sel-c1{border-color:#38bdf8;background:rgba(56,189,248,.14);color:#7dd3fc}
        .lce-role-opt.sel-c2{border-color:#ec4899;background:rgba(236,72,153,.14);color:#f9a8d4}
        .lce-inp{width:100%;box-sizing:border-box;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.14);color:#fff;padding:10px 14px;border-radius:12px;font-family:inherit;font-size:.9rem;outline:none}
        .lce-inp:focus{border-color:var(--lce-ac)}
        .lce-pick-row{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.32);border:1px dashed var(--lce-bd);border-radius:12px;padding:9px 12px;margin-bottom:10px}
        .lce-pick-thumb{width:46px;height:46px;border-radius:50%;border:2px solid var(--lce-ac);background:#1e293b;display:flex;align-items:center;justify-content:center;color:var(--lce-ac);font-size:18px;flex-shrink:0;overflow:hidden}
        .lce-pick-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .lce-upload-zone{border:2px dashed var(--lce-bd);border-radius:15px;padding:24px 16px;background:var(--lce-soft);cursor:pointer;text-align:center;margin-bottom:12px;transition:filter .18s}
        .lce-upload-zone:hover{filter:brightness(1.1)}
        .lce-photo-prev{max-width:100%;max-height:240px;border-radius:12px;border:2px solid var(--lce-ac);display:block;margin:0 auto 12px;cursor:pointer;object-fit:contain;background:#000}
        .lce-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
        .lce-fbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;padding:7px 14px;border-radius:20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s,color .15s}
        .lce-fbtn.active{background:var(--lce-ac);color:var(--lce-bt);border-color:var(--lce-ac)}
        .lce-hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
        .lce-hub-card{background:linear-gradient(180deg,#1c1f32,#0e101c);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px;position:relative;cursor:pointer;transition:transform .18s,border-color .18s;text-align:right;contain:layout style}
        .lce-hub-card:hover{transform:translateY(-2px);border-color:var(--hc-ac,#D4AF37)}
        .lce-hub-top{display:flex;align-items:center;gap:11px}
        .lce-hub-ico{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .lce-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:14px}
        .lce-card{background:linear-gradient(180deg,#1e2136,#111320);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:15px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;transition:border-color .18s;overflow:hidden;contain:layout style}
        .lce-card:hover{border-color:var(--lce-bd)}
        .lce-card.voted{border-color:#10b981;box-shadow:0 0 16px rgba(16,185,129,.2)}
        .lce-card.winner-mark{border-color:#10b981;background:linear-gradient(180deg,#122925,#111320)}
        .lce-card.cat1-card{border-top:3px solid #38bdf8}
        .lce-card.cat2-card{border-top:3px solid #ec4899}
        .lce-photo-card{padding:0}
        .lce-photo-media{width:100%;height:185px;object-fit:cover;display:block;cursor:zoom-in;background:#090b12;border-bottom:1px solid rgba(255,255,255,.08)}
        .lce-yt-wrap{position:relative;width:100%;height:168px;background:#05070e;cursor:pointer;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08)}
        .lce-yt-wrap img{width:100%;height:100%;object-fit:cover;display:block;opacity:.88}
        .lce-yt-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:rgba(239,68,68,.92);color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 4px 16px rgba(0,0,0,.7);border:2px solid rgba(255,255,255,.8)}
        .lce-duo-avs{display:flex;align-items:center;justify-content:center;margin:14px 0 8px}
        .lce-duo-avs .lce-av{margin:0;width:66px;height:66px}
        .lce-duo-avs .lce-av:last-child{margin-right:-16px}
        .lce-duo-heart{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;z-index:2;margin:0 -8px;border:2px solid #131627}
        .lce-match-card{background:linear-gradient(180deg,#1e2136,#0e101c);border:1px solid var(--lce-bd);border-radius:18px;padding:15px;margin-bottom:14px;contain:layout style}
        .lce-match-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
        .lce-vs-badge{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;font-weight:900;font-size:.85rem;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.25)}
        .lce-match-side{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .lce-match-side.voted{border-color:#10b981;background:rgba(16,185,129,.1)}
        .lce-tug-box{background:rgba(0,0,0,.38);border:1px solid var(--lce-bd);border-radius:16px;padding:13px 15px;margin-bottom:14px}
        .lce-tug-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.84rem;font-weight:900;margin-bottom:8px}
        .lce-tug-bar{display:flex;height:16px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
        .lce-tug-t1{background:linear-gradient(90deg,#0284c7,#38bdf8);transition:width .35s ease}
        .lce-tug-t2{background:linear-gradient(90deg,#ec4899,#be185d);transition:width .35s ease}
        .lce-team-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .lce-team-card{background:linear-gradient(180deg,#1e2136,#101220);border:1.5px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;display:flex;flex-direction:column;align-items:center;text-align:center;contain:layout style}
        .lce-team-card.t1{border-top:4px solid #38bdf8;background:linear-gradient(180deg,rgba(14,116,144,.18),#101220)}
        .lce-team-card.t2{border-top:4px solid #ec4899;background:linear-gradient(180deg,rgba(190,24,93,.18),#101220)}
        .lce-team-card.voted{border-color:#10b981;box-shadow:0 0 18px rgba(16,185,129,.22)}
        .lce-team-ico{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:8px}
        .lce-team-card.t1 .lce-team-ico{background:rgba(56,189,248,.16);border:2px solid #38bdf8}
        .lce-team-card.t2 .lce-team-ico{background:rgba(236,72,153,.16);border:2px solid #ec4899}
        .lce-cheer-list{width:100%;max-height:220px;overflow-y:auto;margin-top:12px;text-align:right;display:flex;flex-direction:column;gap:5px;padding-left:2px}
        .lce-cheer-item{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:6px 10px;font-size:.79rem;line-height:1.45}
        .lce-photo-inner{padding:12px 13px 14px;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;flex:1}
        .lce-role-tag{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:12px;font-size:.7rem;font-weight:800;z-index:2}
        .lce-role-tag.cat1{background:rgba(15,23,42,.92);color:#7dd3fc;border:1px solid rgba(56,189,248,.45)}
        .lce-role-tag.cat2{background:rgba(15,23,42,.92);color:#f9a8d4;border:1px solid rgba(236,72,153,.45)}
        .lce-rank-num{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.78);color:var(--lce-ac);font-size:.76rem;font-weight:900;padding:3px 8px;border-radius:10px;border:1px solid var(--lce-bd);z-index:2}
        .lce-spot-bdg{margin-top:4px;background:linear-gradient(135deg,var(--lce-ac),var(--lce-ac2));color:var(--lce-bt);font-size:.7rem;font-weight:900;padding:2px 9px;border-radius:12px}
        .lce-av{width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid var(--lce-ac);background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--lce-ac);margin:14px 0 8px}
        .lce-cname{font-size:.98rem;font-weight:800;color:#fff;margin-bottom:4px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        #lce-modal .lce-cname .user-identity,#lce-modal .lce-cname .user-identity-name,#lce-modal .lce-cname .message-username,#lce-modal .lce-cname span{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;border:none!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
        #lce-modal .lce-cname .user-identity::before,#lce-modal .lce-cname .user-identity::after,#lce-modal .lce-cname .user-identity-name::before,#lce-modal .lce-cname .user-identity-name::after{background:transparent!important;background-image:none!important;box-shadow:none!important}
        .lce-slogan{font-size:.82rem;color:#94a3b8;line-height:1.55;min-height:30px;margin-bottom:9px;word-break:break-word;white-space:pre-line}
        .lce-talent-box{width:100%;box-sizing:border-box;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px;margin:8px 0 10px;text-align:right;font-size:.86rem;line-height:1.7;color:#e2e8f0;max-height:135px;overflow:hidden;position:relative;white-space:pre-line;cursor:pointer}
        .lce-bar-wrap{width:100%;background:rgba(255,255,255,.08);height:7px;border-radius:10px;overflow:hidden;margin-bottom:6px}
        .lce-bar-fill{height:100%;background:linear-gradient(90deg,var(--lce-ac),var(--lce-ac2));border-radius:10px;transition:width .3s ease}
        .lce-vstat{font-size:.78rem;color:var(--lce-tx);font-weight:700;margin-bottom:10px}
        .lce-cacts{display:flex;gap:6px;width:100%;margin-top:auto}
        .lce-podium{background:linear-gradient(135deg,var(--lce-soft),#141626);border:2px solid var(--lce-ac);border-radius:20px;padding:24px 18px;text-align:center;position:relative;margin-bottom:18px}
        .lce-podium .lce-av{width:100px;height:100px;border-width:3px;margin:10px auto 12px}
        .lce-podium-img{max-width:100%;max-height:260px;border-radius:14px;border:2px solid var(--lce-ac);margin:12px auto;display:block;object-fit:contain;background:#000;cursor:zoom-in}
        .lce-prize-grid{display:grid;grid-template-columns:1fr;gap:9px;margin-top:10px}
        .lce-prize-item{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.04);border:1px solid var(--lce-bd);border-radius:14px;padding:10px 13px;text-align:right}
        .lce-prize-ico{width:36px;height:36px;border-radius:10px;background:var(--lce-soft);color:var(--lce-ac);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .lce-subov{position:fixed;inset:0;background:rgba(4,6,12,.94);z-index:2147483646;display:flex;align-items:center;justify-content:center;direction:rtl;padding:14px}
        .lce-subbox{background:linear-gradient(180deg,#1a1d32,#0e101d);border:1px solid rgba(212,175,55,.45);border-radius:20px;width:100%;max-width:540px;max-height:86vh;overflow-y:auto;padding:18px;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.85)}
        .lce-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.96);z-index:2147483647;display:none;flex-direction:column;align-items:center;justify-content:center;padding:18px;direction:rtl}
        .lce-lightbox.open{display:flex}
        .lce-lightbox img{max-width:92vw;max-height:82vh;object-fit:contain;border-radius:12px;border:2px solid rgba(212,175,55,.5)}
        .lce-mini-fab{position:fixed;bottom:95px;right:20px;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;padding:10px 16px;border-radius:30px;font-weight:900;font-size:.86rem;box-shadow:0 8px 20px rgba(0,0,0,.6);display:none;align-items:center;gap:8px;z-index:2147483643;cursor:pointer;direction:rtl;border:2px solid rgba(255,255,255,.3)}
        .lce-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#121424;border:1px solid #D4AF37;color:#fff;padding:10px 20px;border-radius:30px;font-size:.86rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.7);z-index:2147483647;opacity:0;pointer-events:none;transition:transform .28s ease,opacity .28s ease;direction:rtl;max-width:90vw;text-align:center}
        .lce-toast.th-gold{background:linear-gradient(135deg,#2a210a,#121424);color:#fde68a;border-color:#D4AF37}
        .lce-toast.th-red{background:linear-gradient(135deg,#351015,#121424);color:#fecaca;border-color:#ef4444}
        .lce-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        #lce-live-ad{position:fixed;bottom:-120px;left:50%;transform:translateX(-50%);width:min(520px,calc(100vw - 22px));background:linear-gradient(135deg,#1d1a2c 0%,#0f111c 100%);border:1px solid rgba(212,175,55,.65);color:#fff;padding:10px 14px;border-radius:16px;display:flex;align-items:center;gap:10px;z-index:2147483646;opacity:0;visibility:hidden;transition:bottom .35s ease,opacity .25s ease,visibility 0s linear .25s;direction:rtl;box-sizing:border-box;box-shadow:0 12px 28px rgba(0,0,0,.75)}
        #lce-live-ad.th-red{border-color:rgba(239,68,68,.75);background:linear-gradient(135deg,#2e1015,#110c14)}
        #lce-live-ad.th-maroon{border-color:rgba(212,175,55,.7);background:linear-gradient(135deg,#310c18,#12070c)}
        #lce-live-ad.th-purple{border-color:rgba(168,85,247,.75);background:linear-gradient(135deg,#221238,#100d1b)}
        #lce-live-ad.th-blue{border-color:rgba(56,189,248,.75);background:linear-gradient(135deg,#0f2338,#090f18)}
        #lce-live-ad.th-emerald{border-color:rgba(52,211,153,.75);background:linear-gradient(135deg,#0c2c22,#081410)}
        #lce-live-ad.show{bottom:74px;opacity:1;visibility:visible;transition:bottom .35s ease,opacity .25s ease,visibility 0s linear 0s}
        .lce-ad-ico{width:32px;height:32px;border-radius:10px;background:rgba(212,175,55,.18);color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        #lce-ad-msg{flex:1;min-width:0;font-size:12.5px;font-weight:700;line-height:1.45;color:#fef3c7;text-align:right}
        .lce-ad-btns{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lce-ad-go{background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;border:none;padding:6px 13px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap}
        .lce-ad-x{background:rgba(255,255,255,.08);color:#cbd5e1;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:12px}
        .lce-ad-x:hover{background:rgba(239,68,68,.8);color:#fff}
        @media(max-width:650px){
            .lce-ov{padding:0}.lce-shell{max-width:100%;height:100%;max-height:100%;border-radius:0;border:none;box-shadow:none}
            .lce-hdr{padding:11px 13px}.lce-brand{font-size:.96rem}.lce-ibtn span{display:none}.lce-body{padding:13px}
            .lce-grid{grid-template-columns:1fr 1fr;gap:10px}.lce-card{padding:11px}.lce-photo-card{padding:0}.lce-av{width:62px;height:62px}.lce-photo-media{height:140px}.lce-yt-wrap{height:132px}
            .lce-match-grid{grid-template-columns:1fr;gap:8px}.lce-vs-badge{margin:0 auto}.lce-team-grid{grid-template-columns:1fr;gap:12px}
            #lce-live-ad{padding:9px 12px;gap:8px}#lce-ad-msg{font-size:12px}
        }
        @media(max-width:390px){.lce-grid{grid-template-columns:1fr}}
        `;
        document.head.appendChild(s);
    }
    // ====== نهاية الجزء 1 من 3 ======

    // ====== بداية الجزء 2 من 3 ======
    function applyModalTheme(themeKey) {
        const modal = document.getElementById("lce-modal");
        const shell = modal?.querySelector(".lce-shell");
        if (!modal || !shell) return;
        const th = h.getTheme(themeKey);
        modal.style.setProperty("--lce-ac", th.accent);
        modal.style.setProperty("--lce-ac2", th.accent2);
        modal.style.setProperty("--lce-soft", th.soft);
        modal.style.setProperty("--lce-bd", th.border);
        modal.style.setProperty("--lce-tx", th.text);
        modal.style.setProperty("--lce-bt", th.btnText);
        shell.style.background = th.shellBg;
    }

    function openLightbox(src, caption = "") {
        if (!h.isValidImg(src)) return;
        ensureBaseStyles();
        let lb = document.getElementById("lce-lightbox");
        if (!lb) {
            document.body.insertAdjacentHTML("beforeend", `
                <div id="lce-lightbox" class="lce-lightbox">
                    <button type="button" id="lce-lb-close" class="lce-ibtn sq x" style="position:absolute;top:16px;left:16px;width:38px;height:38px;font-size:16px;"><i class="fas fa-times"></i></button>
                    <img id="lce-lb-img" src="" alt="">
                    <div id="lce-lb-cap" style="margin-top:10px;color:#fde68a;font-weight:800;font-size:.9rem;text-align:center;max-width:90vw;"></div>
                </div>
            `);
            lb = document.getElementById("lce-lightbox");
            lb.onclick = e => { if (e.target === lb) lb.classList.remove("open"); };
            document.getElementById("lce-lb-close").onclick = () => lb.classList.remove("open");
        }
        document.getElementById("lce-lb-img").src = src;
        const capEl = document.getElementById("lce-lb-cap");
        capEl.textContent = caption || "";
        capEl.style.display = caption ? "block" : "none";
        lb.classList.add("open");
    }

    function openTextPreview(title, text, author = "") {
        document.getElementById("lce-txt-sub")?.remove();
        const ov = document.createElement("div");
        ov.id = "lce-txt-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `
            <div class="lce-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.02rem;"><i class="fas fa-feather-alt"></i> ${h.esc(title || "تفاصيل المشاركة")}</b>
                    <button type="button" class="lce-ibtn sq x" id="lce-txt-x"><i class="fas fa-times"></i></button>
                </div>
                ${author ? `<div style="font-size:.82rem;color:#94a3b8;margin-bottom:10px;">بواسطة: <b style="color:#fde68a;">${h.esc(author)}</b></div>` : ""}
                <div style="background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;font-size:.94rem;line-height:1.85;color:#f1f5f9;white-space:pre-line;word-break:break-word;">${h.esc(text)}</div>
            </div>`;
        document.body.appendChild(ov);
        ov.onclick = e => { if (e.target === ov) ov.remove(); };
        document.getElementById("lce-txt-x").onclick = () => ov.remove();
    }

    function activateYtEmbed(wrap) {
        const ytId = wrap?.dataset?.yt;
        if (!ytId || wrap.classList.contains("playing")) return;
        document.querySelectorAll("#lce-modal .lce-yt-wrap.playing").forEach(other => {
            if (other === wrap) return;
            const oid = other.dataset.yt;
            other.classList.remove("playing");
            other.innerHTML = `<img loading="lazy" decoding="async" src="https://img.youtube.com/vi/${h.esc(oid)}/hqdefault.jpg" alt=""><div class="lce-yt-play"><i class="fas fa-play"></i></div>`;
        });
        wrap.classList.add("playing");
        wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${h.esc(ytId)}?autoplay=1&rel=0&playsinline=1" style="width:100%;height:100%;border:0;display:block;" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }

    function ensureUserModal() {
        ensureBaseStyles();
        if (st.uiBuilt) return;
        st.uiBuilt = !0;
        document.body.insertAdjacentHTML("beforeend", `
            <div id="lce-modal" class="lce-ov">
                <div class="lce-shell">
                    <div class="lce-hdr">
                        <div class="lce-brand">
                            <button type="button" class="lce-ibtn sq" id="lce-btn-back" title="كل المسابقات" style="display:none;"><i class="fas fa-arrow-right"></i></button>
                            <i id="lce-hdr-ico" class="fas fa-trophy"></i>
                            <span id="lce-hdr-title">مركز المسابقات</span>
                        </div>
                        <div class="lce-hbtns">
                            <button type="button" class="lce-ibtn" id="lce-btn-adm-quick" title="إدارة المسابقة" style="display:none;border-color:rgba(168,85,247,.5);color:#e9d5ff;"><i class="fas fa-sliders-h"></i><span>إدارة</span></button>
                            <button type="button" class="lce-ibtn" id="lce-btn-hof" title="قاعة الشرف"><i class="fas fa-trophy" style="color:#fbbf24;"></i><span>قاعة الشرف</span></button>
                            <button type="button" class="lce-ibtn" id="lce-btn-prizes" title="الجوائز والقوانين" style="display:none;"><i class="fas fa-gift" style="color:#ec4899;"></i><span>الجوائز</span></button>
                            <button type="button" class="lce-ibtn sq" id="lce-btn-min" title="تصغير"><i class="fas fa-minus"></i></button>
                            <button type="button" class="lce-ibtn sq x" id="lce-btn-close" title="إغلاق"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div id="lce-banner" class="lce-banner"><i class="fas fa-bullhorn"></i><span id="lce-banner-txt"></span></div>
                    <div id="lce-mult-bar" class="lce-mult-bar"></div>
                    <div id="lce-body" class="lce-body"></div>
                </div>
            </div>
            <div id="lce-mini-fab" class="lce-mini-fab"><i class="fas fa-trophy"></i><span id="lce-fab-txt">مركز المسابقات</span></div>
        `);
        const modal = document.getElementById("lce-modal");
        modal.addEventListener("click", e => { if (e.target === modal) window.LaylContests.close(); });
        document.getElementById("lce-btn-close").onclick = () => window.LaylContests.close();
        document.getElementById("lce-btn-min").onclick = () => window.LaylContests.minimize();
        document.getElementById("lce-btn-back").onclick = () => window.LaylContests.openHub();
        document.getElementById("lce-btn-prizes").onclick = () => openPrizesModal();
        document.getElementById("lce-btn-hof").onclick = () => openHofModal();
        document.getElementById("lce-btn-adm-quick").onclick = () => {
            const cid = "contest" === st.viewMode ? st.activeCid : null;
            window.LaylContests.close();
            contestsAdmin.open(cid);
        };
        document.getElementById("lce-mini-fab").onclick = () => window.LaylContests.restore();
    }

    function maybeShowWelcome(cid, c) {
        if (!cid || !c) return;
        const txt = (c.cfg?.welcomeText || "").trim(), ver = String(c.cfg?.welcomeVersion || 1);
        const storeKey = isLegacy(cid) ? "lrc_welc_v" : `lce_welc_${cid}`;
        try { if (!txt || localStorage.getItem(storeKey) === ver) return; } catch (e) { return; }
        document.getElementById("lce-welc-sub")?.remove();
        const ov = document.createElement("div");
        ov.id = "lce-welc-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `<div class="lce-subbox" style="text-align:center;max-width:420px;"><div style="font-size:32px;margin-bottom:6px;"><i class="fas ${h.esc(c.icon || "fa-crown")}" style="color:#D4AF37;"></i></div><h3 style="margin:0 0 10px;color:#D4AF37;">رسالة من إدارة ${h.esc(c.title)}</h3><p style="margin:0 0 16px;font-size:.9rem;line-height:1.7;color:#e2e8f0;white-space:pre-line;">${h.esc(txt)}</p><button type="button" id="lce-welc-ok" class="lce-btn" style="width:100%;">حسناً، فهمت</button></div>`;
        document.body.appendChild(ov);
        const done = () => { try { localStorage.setItem(storeKey, ver); } catch (e) {} ov.remove(); };
        ov.onclick = e => { if (e.target === ov) done(); };
        document.getElementById("lce-welc-ok").onclick = done;
    }

    function openPrizesModal() {
        document.getElementById("lce-prizes-sub")?.remove();
        const c = h.getContest(st.activeCid);
        const fallbackP = isLegacy(st.activeCid) ? ROYAL_DEFAULT_PRIZES : DEFAULT_PRIZES;
        const list = Array.isArray(st.data.prizes) && st.data.prizes.length ? st.data.prizes : fallbackP;
        const rules = (c?.cfg?.rulesText || DEFAULT_RULES).trim();
        const ov = document.createElement("div");
        ov.id = "lce-prizes-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `
            <div class="lce-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.06rem;"><i class="fas fa-gift"></i> الجوائز والقوانين — ${h.esc(c?.title || "المسابقة")}</b>
                    <button type="button" class="lce-ibtn sq x" id="lce-pz-x"><i class="fas fa-times"></i></button>
                </div>
                <div class="lce-prize-grid">
                    ${list.map((p, i) => `
                        <div class="lce-prize-item">
                            <div class="lce-prize-ico"><i class="fas ${h.esc(p.icon || "fa-crown")}"></i></div>
                            <div style="flex:1;">
                                <div style="font-weight:800;font-size:.9rem;color:#fff;">${i + 1}. ${h.esc(p.title)}</div>
                                ${p.dur ? `<div style="font-size:.76rem;color:#D4AF37;margin-top:2px;">${h.esc(p.dur)}</div>` : ""}
                            </div>
                        </div>`).join("")}
                </div>
                ${rules ? `<div style="margin-top:14px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 13px;"><div style="color:#fde68a;font-weight:800;font-size:.86rem;margin-bottom:6px;"><i class="fas fa-gavel"></i> ضوابط المسابقة:</div><div style="font-size:.82rem;color:#cbd5e1;line-height:1.7;white-space:pre-line;">${h.esc(rules)}</div></div>` : ""}
                <button type="button" id="lce-pz-ok" class="lce-btn" style="width:100%;margin-top:14px;">مستعد للمنافسة 🔥</button>
            </div>`;
        document.body.appendChild(ov);
        ov.onclick = e => { if (e.target === ov) ov.remove(); };
        document.getElementById("lce-pz-x").onclick = () => ov.remove();
        document.getElementById("lce-pz-ok").onclick = () => ov.remove();
    }

    function getMergedHofList(filterCid = "") {
        const arr = [];
        Object.entries(st.hof || {}).forEach(([k, w]) => {
            if (!w) return;
            arr.push(Object.assign({ _src: "v2", _key: k }, w));
        });
        Object.entries(st.legacy.hof || {}).forEach(([k, w]) => {
            if (!w) return;
            arr.push({
                _src: "legacy", _key: k, contestId: LEGACY_CID,
                contestTitle: "مسابقة ملك وملكة الشات",
                season: w.season || 1, name: w.name || "-",
                categoryLabel: "queen" === w.role ? "👸 ملكة الشات" : "👑 ملك الشات",
                avatar: w.avatar || "", votes: w.votes || 0, date: w.date || 0
            });
        });
        return arr.filter(w => !filterCid || w.contestId === filterCid).sort((a, b) => (b.date || 0) - (a.date || 0));
    }

    function openHofModal(filterCid = "") {
        document.getElementById("lce-hof-sub")?.remove();
        const renderHofBody = () => {
            const box = document.getElementById("lce-hof-list-box");
            if (!box) return;
            const list = getMergedHofList(filterCid);
            box.innerHTML = list.length ? list.map(w => `
                <div class="lce-prize-item" style="margin-bottom:8px;">
                    ${h.isValidImg(w.avatar) ? `<img loading="lazy" decoding="async" src="${h.esc(w.avatar)}" class="lce-hof-zoom" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;cursor:zoom-in;">` : `<div class="lce-prize-ico"><i class="fas fa-crown"></i></div>`}
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:900;color:#fff;font-size:.94rem;">${h.esc(w.categoryLabel || "🏆 الفائز")}: ${h.esc(w.name)}</div>
                        <div style="font-size:.76rem;color:#D4AF37;margin-top:2px;">${h.esc(w.contestTitle || "مسابقة شات ليل")} • الموسم #${h.esc(w.season || 1)} ${w.votes ? `• ${w.votes} صوت` : ""} • ${h.fmtDate(w.date)}</div>
                    </div>
                </div>`).join("") : '<div style="text-align:center;color:#64748b;padding:26px;">قاعة الشرف بانتظار أول متوّج باللقب 👑</div>';
            box.querySelectorAll(".lce-hof-zoom").forEach(img => img.onclick = () => openLightbox(img.src));
        };
        const ov = document.createElement("div");
        ov.id = "lce-hof-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `
            <div class="lce-subbox">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1.06rem;"><i class="fas fa-trophy"></i> قاعة الشرف الموحّدة — أبطال شات ليل</b>
                    <button type="button" class="lce-ibtn sq x" id="lce-hf-x"><i class="fas fa-times"></i></button>
                </div>
                <div id="lce-hof-list-box"><div style="text-align:center;padding:24px;color:#D4AF37;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div></div>
            </div>`;
        document.body.appendChild(ov);
        ov.onclick = e => { if (e.target === ov) ov.remove(); };
        document.getElementById("lce-hf-x").onclick = () => ov.remove();
        if (st.db) {
            Promise.all([
                st.db.ref(`${ROOT}/hall_of_fame`).once("value").then(s => { st.hof = s.val() || {}; }),
                st.db.ref(`${LEGACY_ROOT}/hall_of_fame`).once("value").then(s => { st.legacy.hof = s.val() || {}; })
            ]).then(renderHofBody).catch(renderHofBody);
        } else renderHofBody();
    }

    function openEditMyEntryModal(cid, c, mine) {
        if (!mine || !st.db) return;
        document.getElementById("lce-myedit-sub")?.remove();
        const T = c.template, isPhoto = "photo" === T, isTalent = "talent" === T, isDuo = "duo" === T, isMedia = "media" === T;
        let newMedia = isPhoto ? (mine.image || "") : (mine.avatar || "");
        const ov = document.createElement("div");
        ov.id = "lce-myedit-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `
            <div class="lce-subbox" style="max-width:460px;">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1rem;"><i class="fas fa-edit"></i> تعديل مشاركتي</b>
                    <button type="button" class="lce-ibtn sq x" id="lce-me2-x"><i class="fas fa-times"></i></button>
                </div>
                ${(isPhoto || (!isTalent && !isMedia && !1 !== c.cfg.allowPhotoWithEntry)) ? `
                <div style="text-align:center;margin-bottom:12px;">
                    <div id="lce-me2-prev" style="width:${isPhoto ? "100%" : "82px"};height:${isPhoto ? "160px" : "82px"};margin:0 auto 8px;border-radius:${isPhoto ? "12px" : "50%"};border:2px solid #D4AF37;background:#111320;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#D4AF37;font-size:28px;">
                        ${h.isValidImg(newMedia) ? `<img src="${h.esc(newMedia)}" style="width:100%;height:100%;object-fit:${isPhoto ? "contain" : "cover"};">` : `<i class="fas ${h.esc(c.icon || "fa-camera")}"></i>`}
                    </div>
                    <input type="file" id="lce-me2-file" accept="image/*" style="display:none;">
                    <button type="button" id="lce-me2-pick" class="lce-btn lce-btn-out" style="padding:6px 14px;font-size:.82rem;"><i class="fas fa-images"></i> تغيير الصورة</button>
                </div>` : ""}
                ${isDuo ? `<input id="lce-me2-partner" class="lce-inp" style="margin-bottom:9px;" maxlength="45" placeholder="اسم شريك الثنائي *" value="${h.esc(mine.partnerName || "")}">` : ""}
                ${isMedia ? `<input id="lce-me2-yt" class="lce-inp" dir="ltr" style="margin-bottom:9px;" placeholder="رابط يوتيوب *" value="${mine.ytId ? `https://youtu.be/${h.esc(mine.ytId)}` : ""}">` : ""}
                ${(isTalent || isMedia) ? `<input id="lce-me2-title" class="lce-inp" style="margin-bottom:9px;" maxlength="70" placeholder="العنوان..." value="${h.esc(mine.title || "")}">` : ""}
                ${!isMedia ? `<textarea id="lce-me2-text" class="lce-inp" rows="${isTalent ? 4 : 2}" maxlength="550" style="margin-bottom:12px;" placeholder="النص / الشعار / التوقع...">${h.esc(mine.text || "")}</textarea>` : ""}
                <div style="display:flex;gap:8px;">
                    <button type="button" id="lce-me2-save" class="lce-btn" style="flex:1;"><i class="fas fa-save"></i> حفظ التعديل</button>
                    <button type="button" id="lce-me2-cancel" class="lce-btn lce-btn-out">إلغاء</button>
                </div>
            </div>`;
        document.body.appendChild(ov);
        const close = () => ov.remove();
        ov.onclick = e => { if (e.target === ov) close(); };
        document.getElementById("lce-me2-x").onclick = close;
        document.getElementById("lce-me2-cancel").onclick = close;

        const fInp = document.getElementById("lce-me2-file");
        if (fInp) {
            document.getElementById("lce-me2-pick").onclick = () => fInp.click();
            fInp.onchange = ev => {
                const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                h.compressImg(file, isPhoto ? "photo" : "avatar").then(data => {
                    newMedia = data;
                    document.getElementById("lce-me2-prev").innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:${isPhoto ? "contain" : "cover"};">`;
                    showToast("📷 تم تجهيز الصورة الجديدة");
                }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
            };
        }

        document.getElementById("lce-me2-save").onclick = () => {
            const up = {};
            if (isPhoto) {
                if (!newMedia) return showToast("📸 الصورة مطلوبة", 2800, "red");
                up.image = newMedia;
            } else if (newMedia && newMedia !== mine.avatar) up.avatar = newMedia;
            if (isDuo) {
                const pr = (document.getElementById("lce-me2-partner")?.value || "").trim();
                if (!pr) return showToast("💑 أدخل اسم شريكك", 2800, "red");
                const pd = h.detectFromDOM(pr) || {};
                up.partnerName = pd.displayName || pr;
                if (pd.avatar) up.partnerAvatar = pd.avatar;
            }
            if (isMedia) {
                const yt = h.parseYtId(document.getElementById("lce-me2-yt")?.value || "");
                if (!yt) return showToast("🎵 رابط يوتيوب غير صحيح", 2800, "red");
                up.ytId = yt;
            }
            if (isTalent || isMedia) up.title = (document.getElementById("lce-me2-title")?.value || "").trim().slice(0, 70);
            if (!isMedia) {
                const txt = (document.getElementById("lce-me2-text")?.value || "").trim().slice(0, 550);
                if ((isTalent || "prediction" === T) && !txt) return showToast("✍️ النص مطلوب", 2800, "red");
                up.text = txt;
            }
            dbOps.updateEntry(cid, h.myKey(), up).then(() => {
                close();
                showToast("✅ تم تحديث مشاركتك بنجاح!", 3000, "gold");
            }).catch(() => alert("❌ فشل حفظ التعديل."));
        };
    }

    // نافذة طلب الانسحاب وتحويل الأصوات لمتسابق آخر (تُعتمد من الإدارة)
    function openTransferModal(cid, c, myEntry) {
        if (!myEntry || !st.db) return;
        if (!ensureIdentity()) return;
        const myK = h.myKey();
        const others = getApprovedEntries(st.data.entries).filter(e => e.key !== myK && !e.frozen);
        if (!others.length) return showToast("لا يوجد متسابق آخر متاح لتحويل أصواتك إليه حالياً.", 3500, "red");

        const counts = computeVoteCounts(st.data.entries, st.data.votes);
        const myVotes = counts[myK] || 0;
        const isDual = "dual" === c.mode;

        document.getElementById("lce-tr-sub")?.remove();
        const ov = document.createElement("div");
        ov.id = "lce-tr-sub";
        ov.className = "lce-subov";
        ov.innerHTML = `
            <div class="lce-subbox" style="max-width:460px;">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:12px;">
                    <b style="color:#D4AF37;font-size:1rem;"><i class="fas fa-exchange-alt"></i> طلب انسحاب وتحويل الأصوات</b>
                    <button type="button" class="lce-ibtn sq x" id="lce-tr-x"><i class="fas fa-times"></i></button>
                </div>
                <div style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);border-radius:12px;padding:10px 12px;font-size:.82rem;color:#fde68a;line-height:1.65;margin-bottom:12px;">
                    ⚠️ سيتم إرسال طلبك للإدارة للمراجعة. عند الموافقة سيتم <b>سحب مشاركتك نهائياً</b> ونقل كامل أصواتك الحالية (<b>${myVotes} صوت</b>) للمتسابق الذي تختاره.
                </div>
                <label style="display:block;font-size:.82rem;color:#cbd5e1;font-weight:700;margin-bottom:5px;">اختر المتسابق المستفيد من أصواتك *</label>
                <select id="lce-tr-to" class="lce-inp" style="margin-bottom:10px;">
                    <option value="">-- اختر متسابقاً --</option>
                    ${others.map(e => {
                        const cm = getCatMeta(c, e.category);
                        const nm = "duo" === c.template ? `${e.displayName || e.username} ❤️ ${e.partnerName || ""}` : (e.displayName || e.username);
                        return `<option value="${h.esc(e.key)}">${isDual ? `${cm.icon} ` : ""}${h.esc(nm)}</option>`;
                    }).join("")}
                </select>
                <label style="display:block;font-size:.82rem;color:#cbd5e1;font-weight:700;margin-bottom:5px;">سبب الانسحاب أو كلمة دعم (اختياري)</label>
                <input id="lce-tr-reason" class="lce-inp" maxlength="120" style="margin-bottom:14px;" placeholder="مثلاً: أتنازل بأصواتي دعماً له بالتوفيق...">
                <div style="display:flex;gap:8px;">
                    <button type="button" id="lce-tr-send" class="lce-btn" style="flex:1;"><i class="fas fa-paper-plane"></i> إرسال الطلب للإدارة</button>
                    <button type="button" id="lce-tr-cancel" class="lce-btn lce-btn-out">إلغاء</button>
                </div>
            </div>`;
        document.body.appendChild(ov);
        const close = () => ov.remove();
        ov.onclick = e => { if (e.target === ov) close(); };
        document.getElementById("lce-tr-x").onclick = close;
        document.getElementById("lce-tr-cancel").onclick = close;

        document.getElementById("lce-tr-send").onclick = () => {
            const toKey = document.getElementById("lce-tr-to").value;
            if (!toKey) return showToast("اختر المتسابق أولاً!", 2800, "red");
            const target = st.data.entries?.[toKey];
            if (!target) return showToast("المتسابق غير متاح.", 2800, "red");
            const toName = "duo" === c.template ? `${target.displayName || target.username} ❤️ ${target.partnerName || ""}` : (target.displayName || target.username);
            const fromName = "duo" === c.template ? `${myEntry.displayName || myEntry.username} ❤️ ${myEntry.partnerName || ""}` : (myEntry.displayName || myEntry.username);
            const reason = (document.getElementById("lce-tr-reason").value || "").trim().slice(0, 120);
            if (!confirm(`تأكيد إرسال طلب انسحابك وتحويل أصواتك إلى (${toName}) لموافقة الإدارة؟`)) return;

            dbOps.requestTransfer(cid, myK, {
                fromKey: myK,
                fromName,
                toKey,
                toName,
                reason,
                votesSnapshot: myVotes,
                status: "pending",
                ts: Date.now()
            }).then(() => {
                close();
                showToast("📩 تم إرسال طلب الانسحاب وتحويل الأصوات للإدارة!", 4000, "gold");
            }).catch(() => alert("❌ تعذر إرسال الطلب."));
        };
    }

    function ensureIdentity() {
        if (st.myUser) {
            const det = h.detectFromDOM(st.myUser);
            if (det) { st.myUid = det.uid || st.myUid; st.myHtml = det.html || st.myHtml; st.myAvatar = det.avatar || st.myAvatar; }
            return !0;
        }
        const raw = prompt("لتأمين مشاركتك في المسابقة 🏆\nاكتب اسم المستخدم (Username) الخاص بك في الشات:");
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

    function renderAvatar(av, icon = "fa-crown") {
        if (h.isValidImg(av)) return `<img class="lce-av" loading="lazy" decoding="async" src="${h.esc(av)}" alt="">`;
        return `<div class="lce-av"><i class="fas ${h.esc(icon)}"></i></div>`;
    }

    function renderDuoAvatars(av1, av2) {
        return `<div class="lce-duo-avs">${renderAvatar(av1, "fa-user")}<div class="lce-duo-heart"><i class="fas fa-heart"></i></div>${renderAvatar(av2, "fa-user")}</div>`;
    }

    function getCatMeta(c, catKey) {
        if ("teams" === c.template) {
            if ("cat2" === catKey) return { label: c.cat2Label || "فريق البنات", icon: c.cat2Icon || "🌸", cls: "cat2" };
            return { label: c.cat1Label || "فريق الشباب", icon: c.cat1Icon || "⚡", cls: "cat1" };
        }
        if ("dual" !== c.mode) return { label: c.cat1Label || "مشارك", icon: c.cat1Icon || "👑", cls: "cat1" };
        if ("cat2" === catKey) return { label: c.cat2Label || "الفئة الثانية", icon: c.cat2Icon || "👸", cls: "cat2" };
        return { label: c.cat1Label || "الفئة الأولى", icon: c.cat1Icon || "👑", cls: "cat1" };
    }

    function phaseBadgeHtml(ph, paused) {
        if (paused) return '<span style="background:rgba(245,158,11,.2);color:#fcd34d;border:1px solid rgba(245,158,11,.4);padding:2px 9px;border-radius:12px;font-size:.72rem;font-weight:800;">⏸️ متوقفة مؤقتاً</span>';
        const map = {
            submission: ["rgba(56,189,248,.18)", "#7dd3fc", "📝 باب المشاركة مفتوح"],
            voting: ["rgba(16,185,129,.18)", "#6ee7b7", "🗳️ التصويت مفتوح"],
            drawing: ["rgba(52,211,153,.2)", "#6ee7b7", "🎰 جاري السحب"],
            judging: ["rgba(192,132,252,.18)", "#e9d5ff", "⚖️ مرحلة الفرز"],
            tiebreaker: ["rgba(239,68,68,.2)", "#fca5a5", "⚖️ تعادل بالصدارة"],
            results: ["rgba(212,175,55,.2)", "#fde68a", "🏆 النتائج والتتويج"],
            idle: ["rgba(148,163,184,.16)", "#cbd5e1", "⏳ قريباً"],
            archived: ["rgba(100,116,139,.18)", "#94a3b8", "📦 مؤرشفة"]
        };
        const [bg, fg, txt] = map[ph] || map.idle;
        return `<span style="background:${bg};color:${fg};padding:2px 9px;border-radius:12px;font-size:.72rem;font-weight:800;">${txt}</span>`;
    }

    // ==================== محرك القرعة والسحب العشوائي ====================
    function runRaffleDraw(cid, c) {
        if (!st.db || !h.canPerm(cid, "control")) return showToast("لا تملك صلاحية إجراء السحب", 3000, "red");
        const pool = getApprovedEntries(st.data.entries);
        if (!pool.length) return showToast("لا يوجد مشاركون في السحب بعد!", 3000, "red");
        const count = Math.min(pool.length, Math.max(1, Number(c.maxWinners) || 1));
        if (!confirm(`إجراء السحب العشوائي الآن لاختيار (${count}) فائز من أصل (${pool.length}) مشارك؟`)) return;

        const weighted = [];
        pool.forEach(e => {
            const w = Math.max(1, Number(e.tickets) || 1);
            for (let i = 0; i < w; i++) weighted.push(e.key);
        });
        const picked = [];
        const pickedSet = new Set();
        let guard = 0;
        while (picked.length < count && guard++ < 5000) {
            const k = weighted[Math.floor(Math.random() * weighted.length)];
            if (k && !pickedSet.has(k)) { pickedSet.add(k); picked.push(k); }
        }

        const up = {};
        Object.keys(st.data.entries || {}).forEach(k => { up[`data/${cid}/entries/${k}/isWinner`] = pickedSet.has(k); });
        up[`index/${cid}/resultsPublished`] = !0;
        up[`index/${cid}/raffleWinners`] = picked;
        st.db.ref(ROOT).update(up).then(() => {
            contestsAdmin.log("سحب عشوائي", c.title, picked.join(", "));
            dbOps.broadcast(cid, `🎰 تمت القرعة في (${c.title}) وظهرت أسماء الفائزين!`, c.theme || "emerald");
            showToast("🎉 تم السحب العشوائي وإعلان الفائزين!", 4000, "gold");
        }).catch(() => alert("❌ تعذر حفظ نتيجة السحب."));
    }

    // ==================== محرك بطولة خروج المغلوب (1 ضد 1) ====================
    function buildBracketRound(keysList, roundNum) {
        const arr = keysList.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const matches = [];
        for (let i = 0; i < arr.length; i += 2) {
            const a = arr[i], b = arr[i + 1] || null;
            matches.push({ id: `r${roundNum}_m${matches.length}`, a, b, winner: b ? null : a });
        }
        return matches;
    }

    function startBracketTournament(cid, c) {
        if (!h.canPerm(cid, "control")) return showToast("لا تملك صلاحية إدارة البطولة", 3000, "red");
        const list = getApprovedEntries(st.data.entries).map(e => e.key);
        if (list.length < 2) return showToast("تحتاج على الأقل مشاركين اثنين لبدء البطولة!", 3500, "red");
        if (!confirm(`سحب قرعة الجولة الأولى بين (${list.length}) متنافس وبدء التصويت؟`)) return;
        const matches = buildBracketRound(list, 1);
        const now = Date.now(), dur = Math.max(36e5, ((c.voteEnd || now) - (c.nomEnd || now)) || 24 * 36e5);
        dbOps.patchContest(cid, {
            nomEnd: now - 1000,
            voteEnd: now + dur,
            bracket: { round: 1, matches, champion: null }
        }).then(() => {
            contestsAdmin.log("قرعة بطولة", c.title, `${list.length} متنافس`);
            dbOps.broadcast(cid, `⚔️ بدأت مواجهات الجولة #1 في (${c.title})! صوّت الآن.`, c.theme || "maroon");
            showToast("⚔️ تم سحب القرعة وبدأت المواجهات!", 3500, "gold");
        });
    }

    function advanceBracketRound(cid, c) {
        if (!h.canPerm(cid, "control")) return showToast("لا تملك صلاحية إدارة البطولة", 3000, "red");
        const br = c.bracket;
        if (!br || !Array.isArray(br.matches) || !br.matches.length) return;
        const winners = [];
        for (const m of br.matches) {
            if (!m.b) { winners.push(m.a); continue; }
            if (m.winner) { winners.push(m.winner); continue; }
            const cnts = computeVoteCounts(st.data.entries, st.data.votes, m.id);
            const va = cnts[m.a] || 0, vb = cnts[m.b] || 0;
            if (va === vb) {
                const nA = st.data.entries?.[m.a]?.displayName || m.a;
                const nB = st.data.entries?.[m.b]?.displayName || m.b;
                return showToast(`⚖️ تعادل بين (${nA}) و (${nB})! احسم المواجهة أولاً بزر "حسم وتأهيل".`, 4500, "red");
            }
            winners.push(va > vb ? m.a : m.b);
        }
        if (winners.length === 1) {
            if (!confirm("تتويج بطل البطولة وإعلان النتيجة النهائية؟")) return;
            dbOps.patchContest(cid, { resultsPublished: !0, bracket: { round: br.round, matches: br.matches, champion: winners[0] } }).then(() => {
                contestsAdmin.log("تتويج بطل البطولة", c.title, winners[0]);
                dbOps.broadcast(cid, `🏆 تُوّج بطل (${c.title})! ادخل للتهنئة.`, c.theme || "gold");
                showToast("🏆 تم تتويج البطل بنجاح!", 4000, "gold");
            });
            return;
        }
        if (!confirm(`تأهيل (${winners.length}) متنافس إلى الجولة #${br.round + 1}؟`)) return;
        const nextRound = br.round + 1;
        const nextMatches = buildBracketRound(winners, nextRound);
        dbOps.patchContest(cid, {
            voteEnd: Date.now() + 24 * 36e5,
            bracket: { round: nextRound, matches: nextMatches, champion: null }
        }).then(() => {
            contestsAdmin.log("جولة جديدة بالبطولة", c.title, `الجولة #${nextRound}`);
            dbOps.broadcast(cid, `⚔️ بدأت الجولة #${nextRound} في (${c.title})! صوّت الآن.`, c.theme || "maroon");
            showToast(`⚔️ انطلقت الجولة #${nextRound}!`, 3500, "gold");
        });
    }

    // ==================== عرض مركز المسابقات (Hub) ====================
    function renderHub() {
        const modal = document.getElementById("lce-modal");
        if (!modal || !modal.classList.contains("open")) return;
        applyModalTheme("gold");
        document.getElementById("lce-hdr-title").textContent = st.global.hubTitle || "مركز مسابقات شات ليل";
        document.getElementById("lce-hdr-ico").className = "fas fa-trophy";
        document.getElementById("lce-btn-back").style.display = "none";
        document.getElementById("lce-btn-prizes").style.display = "none";
        document.getElementById("lce-btn-adm-quick").style.display = h.isAdmin() ? "inline-flex" : "none";
        document.getElementById("lce-banner").style.display = "none";
        document.getElementById("lce-mult-bar").style.display = "none";

        const body = document.getElementById("lce-body");
        if (!body) return;
        body.dataset.view = "hub";
        body.dataset.phase = "hub";

        const isAnyAdmin = h.isAdmin();
        const all = h.getAllContestIds()
            .map(id => h.getContest(id))
            .filter(c => c && ("archived" !== c.status || isAnyAdmin) && (!1 !== c.cfg.enabled || h.isAdmin(c.id) || h.isVip(c.id)))
            .sort((a, b) => (Number(b.pinTop) - Number(a.pinTop)) || ((b.createdAt || 0) - (a.createdAt || 0)));

        const liveCount = all.filter(c => "active" === c.status).length;

        body.innerHTML = `
            <div class="lce-hero">
                <div style="font-size:40px;color:#D4AF37;">🏆</div>
                <h2>${h.esc(st.global.hubTitle || "مركز مسابقات شات ليل")}</h2>
                <p>تصفّح جميع المسابقات والفعاليات النشطة وشارك لفرصة التتويج في قاعة الشرف والجوائز الفاخرة.</p>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px;">
                    <span class="lce-fbtn active" style="cursor:default;">🔥 المسابقات النشطة: ${liveCount}</span>
                    <button type="button" class="lce-btn lce-btn-out" id="lce-hub-hof" style="padding:7px 14px;font-size:.84rem;"><i class="fas fa-trophy"></i> قاعة الشرف</button>
                    ${isAnyAdmin ? `<button type="button" class="lce-btn" id="lce-hub-adm" style="padding:7px 14px;font-size:.84rem;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;"><i class="fas fa-plus-circle"></i> إنشاء / إدارة المسابقات</button>` : ""}
                </div>
            </div>
            ${all.length ? `<div class="lce-hub-grid">
                ${all.map(c => {
                    const th = h.getTheme(c.theme), tmpl = TEMPLATES[c.template] || TEMPLATES.royal, info = getPhaseInfo(c);
                    return `
                    <div class="lce-hub-card" data-open-cid="${h.esc(c.id)}" style="--hc-ac:${th.accent};border-color:${th.border};">
                        <div class="lce-hub-top">
                            <div class="lce-hub-ico" style="background:${th.soft};color:${th.accent};border:1px solid ${th.border};"><i class="fas ${h.esc(c.icon || tmpl.icon)}"></i></div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:900;font-size:.98rem;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.esc(c.title)}</div>
                                <div style="font-size:.74rem;color:#94a3b8;margin-top:2px;">${h.esc(tmpl.name)} • الموسم #${h.esc(c.season || 1)}</div>
                            </div>
                        </div>
                        <div style="font-size:.8rem;color:#cbd5e1;line-height:1.55;min-height:36px;">${h.esc(c.subtitle || tmpl.desc)}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px;border-top:1px solid rgba(255,255,255,.07);">
                            ${phaseBadgeHtml(info.phase, info.paused)}
                            ${info.remaining > 0 ? `<span class="lce-hub-cd" data-cid="${h.esc(c.id)}" style="font-family:monospace;font-size:.78rem;color:${th.text};font-weight:800;direction:ltr;">${h.fmtTime(info.remaining)}</span>` : `<span style="font-size:.76rem;color:${th.accent};font-weight:800;">دخول ⬅</span>`}
                        </div>
                    </div>`;
                }).join("")}
            </div>` : `<div style="text-align:center;color:#94a3b8;padding:36px 16px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.12);border-radius:16px;">لا توجد مسابقات نشطة حالياً. ترقّب انطلاق الفعالية القادمة قريباً ✨</div>`}
        `;

        document.getElementById("lce-hub-hof")?.addEventListener("click", () => openHofModal());
        document.getElementById("lce-hub-adm")?.addEventListener("click", () => { window.LaylContests.close(); contestsAdmin.open(); });
        body.querySelectorAll("[data-open-cid]").forEach(card => card.onclick = () => window.LaylContests.open(card.dataset.openCid));
    }

    function scheduleRenderMain(delayMs = 0) {
        if (!document.getElementById("lce-modal")?.classList.contains("open")) return;
        clearTimeout(st.renderTimer);
        if (delayMs <= 0) { renderMainBody(); return; }
        st.renderTimer = setTimeout(renderMainBody, delayMs);
    }

    // ==================== عرض المسابقة النشطة (تحديث ذكي بدون مسح الصور واليوتيوب) ====================
    function renderMainBody() {
        const modal = document.getElementById("lce-modal");
        if (!modal || !modal.classList.contains("open")) return;
        if ("hub" === st.viewMode || !st.activeCid) { renderHub(); return; }

        const cid = st.activeCid;
        const c = h.getContest(cid);
        if (!c) { st.viewMode = "hub"; renderHub(); return; }

        const tmpl = TEMPLATES[c.template] || TEMPLATES.royal;
        const isAdm = h.isAdmin(cid);
        applyModalTheme(c.theme);

        document.getElementById("lce-hdr-title").textContent = c.title || "المسابقة";
        document.getElementById("lce-hdr-ico").className = `fas ${c.icon || tmpl.icon}`;
        const activeCount = h.getAllContestIds().filter(id => "active" === h.getContest(id)?.status).length;
        document.getElementById("lce-btn-back").style.display = activeCount > 1 ? "inline-flex" : "none";
        document.getElementById("lce-btn-prizes").style.display = "inline-flex";
        document.getElementById("lce-btn-adm-quick").style.display = isAdm ? "inline-flex" : "none";

        const banner = document.getElementById("lce-banner"), bTxt = document.getElementById("lce-banner-txt");
        if (banner && bTxt) {
            banner.className = "lce-banner" + (c.cfg.bannerTheme && "gold" !== c.cfg.bannerTheme ? ` th-${c.cfg.bannerTheme}` : "");
            if (c.cfg.bannerText) { bTxt.textContent = c.cfg.bannerText; banner.style.display = "flex"; }
            else banner.style.display = "none";
        }

        const body = document.getElementById("lce-body");
        if (!body) return;
        body.dataset.view = "contest";

        if (!st.heavyLoaded && "idle" !== c.status && st.db) {
            body.innerHTML = '<div style="text-align:center;padding:55px 15px;color:var(--lce-ac);font-weight:800;"><i class="fas fa-spinner fa-spin" style="font-size:26px;margin-bottom:10px;display:block;"></i>جاري تحميل بيانات المسابقة...</div>';
            return;
        }

        const entries = st.data.entries || {};
        const votes = st.data.votes || {};
        const info = getPhaseInfo(c, entries, votes);
        const mult = Math.max(1, Number(c.voteMultiplier) || 1);
        const multBar = document.getElementById("lce-mult-bar");
        if (multBar) {
            if ("voting" === info.phase && mult > 1) {
                multBar.textContent = `⚡ ساعة المضاعفة الذهبية نشطة الآن! كل صوت يُحسب ×${mult} أصوات 🔥`;
                multBar.style.display = "block";
            } else multBar.style.display = "none";
        }

        const myKey = h.myKey();
        const isBlind = Boolean(c.cfg.blindVoting);
        const T = c.template;
        const isTeams = "teams" === T;
        const isDual = "dual" === c.mode && !isTeams;
        const isPhoto = "photo" === T, isTalent = "talent" === T, isDuo = "duo" === T, isMedia = "media" === T;
        const isRaffle = "raffle" === T, isQuiz = "quiz" === T, isBracket = "bracket" === T, isPredict = "prediction" === T;

        // 1. متوقفة / مؤرشفة
        if ("idle" === info.phase || "archived" === info.phase) {
            body.dataset.phase = info.phase;
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="font-size:46px;color:var(--lce-ac);"><i class="fas ${h.esc(c.icon || tmpl.icon)}"></i></div>
                    <h2>${h.esc(c.title)}</h2>
                    <p>${h.esc(c.subtitle || "هذه المسابقة غير نشطة حالياً. ترقّب انطلاق الموسم القادم!")}</p>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                        <button type="button" class="lce-btn" id="lce-idle-pz"><i class="fas fa-gift"></i> الجوائز والقوانين</button>
                        <button type="button" class="lce-btn lce-btn-out" id="lce-idle-hf"><i class="fas fa-trophy"></i> قاعة الشرف</button>
                        ${isAdm ? `<button type="button" class="lce-btn" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;" id="lce-idle-adm"><i class="fas fa-sliders-h"></i> لوحة التحكم</button>` : ""}
                    </div>
                </div>`;
            document.getElementById("lce-idle-pz").onclick = openPrizesModal;
            document.getElementById("lce-idle-hf").onclick = () => openHofModal(cid);
            document.getElementById("lce-idle-adm")?.addEventListener("click", () => { window.LaylContests.close(); contestsAdmin.open(cid); });
            return;
        }

        // 2. مرحلة التقديم / التسجيل / التحدي السريع
        if ("submission" === info.phase) {
            const mine = myKey ? entries[myKey] : null;
            const approved = getApprovedEntries(entries);
            const maxE = Number(c.cfg.maxEntries) || 0;
            const isFull = maxE > 0 && Object.keys(entries).length >= maxE && !isAdm;
            const hideSubGallery = ((isPhoto || isMedia) && isBlind) || isPredict || isQuiz;
            const canEditMine = Boolean(mine && !1 !== c.cfg.allowEditEntry && !isQuiz && !isRaffle && !info.paused);
            const nKey = `${cid}_${Boolean(mine)}_${mine?.status || ""}_${Boolean(mine?.isWinner)}_${mine?.text || ""}_${Boolean(mine?.image)}_${mine?.ytId || ""}_${Boolean(info.paused)}_${isFull}_${c.season || 1}_${T}_${c.mode}_${canEditMine}`;

            const renderSubCards = () => {
                if (isQuiz) {
                    const winnersSoFar = approved.filter(e => e.isWinner).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
                    const maxW = Math.max(1, Number(c.maxWinners) || 3);
                    if (!winnersSoFar.length) {
                        return `<div style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:24px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.12);border-radius:14px;">⚡ بانتظار أول من يصل للإجابة الصحيحة! (${Object.keys(entries).length} محاولة حتى الآن • المقاعد الفائزة: ${maxW})</div>`;
                    }
                    return winnersSoFar.map((e, i) => `
                        <div class="lce-card winner-mark">
                            <span class="lce-rank-num">#${i + 1}</span>
                            ${renderAvatar(e.avatar, "fa-bolt")}
                            <div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>
                            <span class="lce-spot-bdg">⚡ إجابة صحيحة — ${h.fmtDate(e.joinedAt)}</span>
                        </div>`).join("");
                }
                if (hideSubGallery && !isAdm) {
                    return `<div style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:24px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.12);border-radius:14px;">🔒 المشاركات سريّة حتى انتهاء هذه المرحلة لضمان النزاهة (${Object.keys(entries).length} مشاركة مسجلة حتى الآن).</div>`;
                }
                if (!approved.length) return '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:22px;">كن أول من يشارك في هذا الموسم!</div>';
                return approved.map(e => {
                    const cm = getCatMeta(c, e.category);
                    if (isPhoto) {
                        return `<div class="lce-card lce-photo-card ${cm.cls}-card">
                            ${isDual ? `<span class="lce-role-tag ${cm.cls}">${h.esc(cm.icon)} ${h.esc(cm.label)}</span>` : ""}
                            <img loading="lazy" decoding="async" class="lce-photo-media lce-zoomable" src="${h.esc(e.image)}" alt="">
                            <div class="lce-photo-inner"><div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>${e.text ? `<div class="lce-slogan">${h.esc(e.text)}</div>` : ""}</div>
                        </div>`;
                    }
                    if (isMedia && e.ytId) {
                        return `<div class="lce-card lce-photo-card">
                            <div class="lce-yt-wrap" data-yt="${h.esc(e.ytId)}"><img loading="lazy" decoding="async" src="https://img.youtube.com/vi/${h.esc(e.ytId)}/hqdefault.jpg" alt=""><div class="lce-yt-play"><i class="fas fa-play"></i></div></div>
                            <div class="lce-photo-inner"><div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>${e.title ? `<div style="font-size:.82rem;color:var(--lce-tx);font-weight:700;">🎵 ${h.esc(e.title)}</div>` : ""}</div>
                        </div>`;
                    }
                    if (isDuo) {
                        return `<div class="lce-card">
                            ${renderDuoAvatars(e.avatar, e.partnerAvatar)}
                            <div class="lce-cname">${h.esc(e.displayName || e.username)} ❤️ ${h.esc(e.partnerName || "شريك")}</div>
                            <div class="lce-slogan">${e.text ? `«${h.esc(e.text)}»` : "ثنائي رسمي ✨"}</div>
                        </div>`;
                    }
                    if (isRaffle) {
                        return `<div class="lce-card" style="padding:12px;">
                            ${renderAvatar(e.avatar, "fa-ticket-alt")}
                            <div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>
                            <span class="lce-spot-bdg">🎟️ ${Math.max(1, Number(e.tickets) || 1) > 1 ? `×${e.tickets} فرص VIP` : "تذكرة سحب مؤكدة"}</span>
                        </div>`;
                    }
                    return `<div class="lce-card ${cm.cls}-card">
                        ${isDual ? `<span class="lce-role-tag ${cm.cls}">${h.esc(cm.icon)} ${h.esc(cm.label)}</span>` : ""}
                        ${renderAvatar(e.avatar, c.icon || tmpl.icon)}
                        ${e.badge ? `<span class="lce-spot-bdg">${h.esc(e.badge)}</span>` : ""}
                        <div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>
                        ${e.title ? `<div style="font-size:.84rem;font-weight:800;color:var(--lce-tx);margin-bottom:4px;">${h.esc(e.title)}</div>` : ""}
                        ${isTalent || isPredict
                            ? `<div class="lce-talent-box lce-read-more" data-title="${h.esc(e.title || e.displayName)}" data-author="${h.esc(e.displayName || e.username)}" data-txt="${h.esc(e.text || "")}">${h.esc(e.text || "")}</div>`
                            : `<div class="lce-slogan">${e.text ? `«${h.esc(e.text)}»` : "مشارك رسمي ✨"}</div>`}
                    </div>`;
                }).join("");
            };

            const bindSubCardClicks = () => {
                body.querySelectorAll(".lce-zoomable").forEach(img => img.onclick = () => openLightbox(img.src));
                body.querySelectorAll(".lce-read-more").forEach(box => box.onclick = () => openTextPreview(box.dataset.title, box.dataset.txt, box.dataset.author));
                body.querySelectorAll(".lce-yt-wrap").forEach(w => w.onclick = () => activateYtEmbed(w));
            };

            if ("submission" === body.dataset.phase && body.dataset.nkey === nKey && document.getElementById("lce-sub-grid")) {
                const subSig = approved.map(e => `${e.key}:${e.text || ""}:${e.title || ""}:${e.ytId || ""}:${Boolean(e.isWinner)}`).join("|");
                const sg = document.getElementById("lce-sub-grid");
                if (sg.dataset.subSig !== subSig) {
                    sg.dataset.subSig = subSig;
                    const cntEl = document.getElementById("lce-sub-cnt");
                    if (cntEl) cntEl.textContent = hideSubGallery && !isAdm ? Object.keys(entries).length : approved.length;
                    sg.innerHTML = renderSubCards();
                    bindSubCardClicks();
                }
                return;
            }

            body.dataset.phase = "submission";
            body.dataset.nkey = nKey;

            let myFormHtml = "";
            if (mine) {
                const isPend = "pending" === mine.status;
                const cm = getCatMeta(c, mine.category);
                let statusMsg = isPend ? "تم استلام مشاركتك — بانتظار اعتماد الإدارة" : `تم تسجيل مشاركتك بنجاح${isDual ? ` (${cm.icon} ${cm.label})` : ""}!`;
                if (isQuiz) statusMsg = mine.isWinner ? "🎉 إجابتك صحيحة! تم تسجيلك ضمن الفائزين الأوائل 🏆" : (c.correctAnswer ? "❌ إجابتك غير مطابقة — حظاً أوفر في التحدي القادم!" : "✅ تم استلام إجابتك وبانتظار إعلان الإدارة.");
                if (isRaffle) statusMsg = `🎟️ تم حجز تذكرتك في السحب بنجاح${(mine.tickets || 1) > 1 ? ` (×${mine.tickets} فرص VIP ⭐)` : ""}!`;
                myFormHtml = `
                    <div class="lce-form" style="border-color:${isPend ? "#f59e0b" : (isQuiz && c.correctAnswer && !mine.isWinner ? "#ef4444" : "#10b981")};text-align:center;">
                        <div style="font-size:26px;margin-bottom:5px;">${isPend ? "⏳" : (isQuiz && c.correctAnswer && !mine.isWinner ? "❌" : "✅")}</div>
                        <div style="font-weight:900;font-size:1.02rem;color:${isPend ? "#fcd34d" : "#6ee7b7"};">${statusMsg}</div>
                        ${isPhoto && h.isValidImg(mine.image) ? `<img loading="lazy" decoding="async" src="${h.esc(mine.image)}" class="lce-photo-prev lce-zoomable" style="max-height:170px;margin-top:10px;">` : ""}
                        ${isDuo ? `<div style="margin-top:6px;color:var(--lce-tx);font-weight:800;">💑 ${h.esc(mine.displayName)} ❤️ ${h.esc(mine.partnerName || "")}</div>` : ""}
                        ${mine.text && !isQuiz ? `<div style="color:#cbd5e1;font-size:.86rem;margin:6px 0 10px;white-space:pre-line;">«${h.esc(mine.text)}»</div>` : ""}
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
                            ${canEditMine ? `<button type="button" class="lce-btn lce-btn-out" id="lce-edit-mine" style="padding:9px 14px;font-size:.84rem;"><i class="fas fa-edit"></i> تعديل مشاركتي</button>` : ""}
                            ${!isBlind && !isPredict && !isQuiz && !isRaffle ? `<button type="button" class="lce-btn" id="lce-copy-camp" style="padding:9px 14px;font-size:.84rem;"><i class="fas fa-bullhorn"></i> نسخ رسالة حملتي</button>` : ""}
                            ${!isQuiz ? `<button type="button" class="lce-btn lce-btn-red" id="lce-withdraw" style="padding:9px 14px;font-size:.84rem;"><i class="fas fa-sign-out-alt"></i> سحب المشاركة</button>` : ""}
                        </div>
                    </div>`;
            } else {
                const dualPicker = isDual ? `
                    <div class="lce-roles">
                        <div class="lce-role-opt sel-c1" id="lce-pick-c1"><div style="font-size:22px;">${h.esc(c.cat1Icon || "👑")}</div>${h.esc(c.cat1Label || "الفئة الأولى")}</div>
                        <div class="lce-role-opt" id="lce-pick-c2"><div style="font-size:22px;">${h.esc(c.cat2Icon || "👸")}</div>${h.esc(c.cat2Label || "الفئة الثانية")}</div>
                    </div>` : "";

                let fieldsHtml = "";
                if (isPhoto) {
                    fieldsHtml = `
                        <input type="file" id="lce-sub-file" accept="image/*" style="display:none;">
                        <div class="lce-upload-zone" id="lce-upload-zone">
                            <i class="fas fa-cloud-upload-alt" style="font-size:34px;color:var(--lce-ac);margin-bottom:6px;display:block;"></i>
                            <div style="font-weight:800;color:var(--lce-tx);">اضغط لاختيار صورتك من الأستوديو</div>
                            <div style="font-size:.75rem;color:#94a3b8;margin-top:3px;">يتم ضغط الصورة تلقائياً بجودة ممتازة وسرعة عالية</div>
                        </div>
                        <img id="lce-photo-prev" class="lce-photo-prev" style="display:none;" alt="">
                        <input type="text" id="lce-sub-text" class="lce-inp" maxlength="90" placeholder="وصف قصير للصورة (اختياري)..." style="margin-bottom:10px;">`;
                } else if (isTalent) {
                    fieldsHtml = `
                        <input type="text" id="lce-sub-title" class="lce-inp" maxlength="60" placeholder="عنوان المشاركة (مثلاً: قصيدة ليل)..." style="margin-bottom:8px;">
                        <textarea id="lce-sub-text" class="lce-inp" rows="4" maxlength="550" placeholder="اكتب مشاركتك هنا (شعر، خاطرة، قصة، نكتة)..." style="margin-bottom:10px;"></textarea>`;
                } else if (isDuo) {
                    fieldsHtml = `
                        <input type="text" id="lce-sub-partner" class="lce-inp" maxlength="45" placeholder="اسم المستخدم (Username) لشريكك في الثنائي *" style="margin-bottom:8px;">
                        <input type="text" id="lce-sub-text" class="lce-inp" maxlength="90" placeholder="شعار أو وصف الثنائي (اختياري)..." style="margin-bottom:10px;">`;
                } else if (isMedia) {
                    fieldsHtml = `
                        <input type="text" id="lce-sub-yt" class="lce-inp" dir="ltr" placeholder="https://youtu.be/... الصق رابط يوتيوب هنا *" style="margin-bottom:8px;">
                        <input type="text" id="lce-sub-title" class="lce-inp" maxlength="70" placeholder="اسم الأغنية / الشيلة أو تعليق قصير (اختياري)..." style="margin-bottom:10px;">`;
                } else if (isRaffle) {
                    fieldsHtml = `<div style="text-align:center;color:#cbd5e1;font-size:.88rem;margin-bottom:12px;">اضغط الزر بالأسفل لحجز تذكرتك المجانية في السحب العشوائي (${Math.max(1, Number(c.maxWinners) || 1)} فائزين).${h.isVip(cid) ? `<br><b style="color:#fde68a;">⭐ أنت VIP — تحصل على ×${h.getVipWeight(cid)} فرص مضاعفة بالسحب!</b>` : ""}</div>`;
                } else if (isQuiz) {
                    fieldsHtml = `
                        ${c.quizPrompt ? `<div style="background:rgba(0,0,0,.38);border:1px solid var(--lce-bd);border-radius:12px;padding:12px;margin-bottom:10px;font-size:.96rem;font-weight:800;color:#fff;line-height:1.7;white-space:pre-line;">❓ ${h.esc(c.quizPrompt)}</div>` : ""}
                        <input type="text" id="lce-sub-text" class="lce-inp" maxlength="120" placeholder="اكتب الإجابة أو الكود السري هنا بأسرع وقت..." style="margin-bottom:10px;">`;
                } else if (isPredict) {
                    fieldsHtml = `<input type="text" id="lce-sub-text" class="lce-inp" maxlength="120" placeholder="اكتب توقعك بدقة هنا (مثلاً: 2-1 لصالح الفريق الأول)..." style="margin-bottom:10px;">`;
                } else {
                    fieldsHtml = `
                        ${!1 !== c.cfg.allowPhotoWithEntry ? `
                        <div class="lce-pick-row">
                            <div class="lce-pick-thumb" id="lce-sub-av-prev"><i class="fas fa-camera"></i></div>
                            <div style="flex:1;min-width:0;text-align:right;">
                                <div style="font-size:.83rem;font-weight:800;color:#e2e8f0;">صورة المشارك (اختياري)</div>
                                <div style="font-size:.73rem;color:#94a3b8;" id="lce-sub-av-lbl">تُستخدم صورة عضويتك تلقائياً أو اختر من الأستوديو</div>
                            </div>
                            <input type="file" id="lce-sub-file" accept="image/*" style="display:none;">
                            <button type="button" class="lce-btn lce-btn-out" id="lce-sub-av-btn" style="padding:7px 12px;font-size:.8rem;"><i class="fas fa-images"></i> الأستوديو</button>
                            <button type="button" class="lce-ibtn sq x" id="lce-sub-av-clr" style="display:none;" title="إزالة"><i class="fas fa-times"></i></button>
                        </div>` : ""}
                        <input type="text" id="lce-sub-text" class="lce-inp" maxlength="90" placeholder="رسالتك الانتخابية / شعارك (اختياري)..." style="margin-bottom:10px;">`;
                }

                myFormHtml = `
                    <div class="lce-form">
                        <div style="font-weight:800;color:var(--lce-ac);margin-bottom:10px;font-size:.96rem;"><i class="fas ${h.esc(c.icon || tmpl.icon)}"></i> ${h.esc(tmpl.submitVerb)} ${maxE ? `<span style="font-size:.78rem;color:#94a3b8;">(${Object.keys(entries).length}/${maxE})</span>` : ""}</div>
                        ${dualPicker}
                        ${fieldsHtml}
                        <button type="button" id="lce-submit-entry" class="lce-btn" style="width:100%;" ${info.paused || isFull ? "disabled" : ""}><i class="fas fa-check-circle"></i> ${isFull ? "اكتمل العدد المسموح" : (isRaffle ? "دخول السحب الآن 🎟️" : "تأكيد إرسال المشاركة")}</button>
                    </div>`;
            }

            const canCtrl = h.canPerm(cid, "control");
            const admQuickAction = canCtrl && isBracket && approved.length >= 2
                ? `<div style="margin-bottom:14px;text-align:center;"><button type="button" id="lce-br-start" class="lce-btn" style="background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;"><i class="fas fa-random"></i> سحب قرعة المواجهات وبدء الجولة #1 (${approved.length} متنافس)</button></div>`
                : (canCtrl && isRaffle && approved.length >= 1
                    ? `<div style="margin-bottom:14px;text-align:center;"><button type="button" id="lce-rf-draw-now" class="lce-btn"><i class="fas fa-dice"></i> إنهاء التسجيل وإجراء السحب العشوائي الآن</button></div>` : "");

            body.innerHTML = `
                <div class="lce-hero">
                    <div style="color:var(--lce-ac);font-size:.84rem;font-weight:800;">الموسم #${h.esc(c.season || 1)} • ${h.esc(tmpl.submitTitle)}</div>
                    <h2>${h.esc(c.title)}</h2>
                    <p>${h.esc(c.subtitle || tmpl.desc)}</p>
                    <div class="lce-timer"><i class="fas fa-clock"></i> <span id="lce-cd-txt">${h.fmtTime(info.remaining)}</span></div>
                    ${info.paused ? '<div style="color:#fca5a5;font-weight:bold;margin-top:8px;">⏸️ المسابقة متوقفة مؤقتاً</div>' : ""}
                </div>
                ${admQuickAction}
                ${myFormHtml}
                <div style="margin-bottom:10px;"><b style="color:var(--lce-tx);font-size:.95rem;">${isQuiz ? "⚡ الأسرع إجابة حتى الآن" : "📜 المشاركات حتى الآن"} (<span id="lce-sub-cnt">${hideSubGallery && !isAdm ? Object.keys(entries).length : approved.length}</span>)</b></div>
                <div class="lce-grid" id="lce-sub-grid">${renderSubCards()}</div>`;

            bindSubCardClicks();
            document.getElementById("lce-br-start")?.addEventListener("click", () => startBracketTournament(cid, c));
            document.getElementById("lce-rf-draw-now")?.addEventListener("click", () => runRaffleDraw(cid, c));

            if (mine) {
                document.getElementById("lce-edit-mine")?.addEventListener("click", () => openEditMyEntryModal(cid, c, mine));
                document.getElementById("lce-copy-camp")?.addEventListener("click", () => {
                    h.copy(`✨ شاركت في (${c.title}) داخل شات ليل!\n👤 ${isDuo ? `${mine.displayName} ❤️ ${mine.partnerName}` : (mine.displayName || mine.username)}${mine.text ? `\n💬 «${mine.text}»` : ""}\n🔥 ادعموني بأصواتكم!`, "📋 تم نسخ رسالة حملتك!");
                });
                document.getElementById("lce-withdraw")?.addEventListener("click", () => {
                    if (confirm("سحب مشاركتك من المسابقة؟")) dbOps.removeEntry(cid, myKey).then(() => showToast("تم سحب مشاركتك."));
                });
            } else {
                let pickedCat = "cat1", pickedMedia = "";
                const c1b = document.getElementById("lce-pick-c1"), c2b = document.getElementById("lce-pick-c2");
                if (c1b && c2b) {
                    c1b.onclick = () => { pickedCat = "cat1"; c1b.className = "lce-role-opt sel-c1"; c2b.className = "lce-role-opt"; };
                    c2b.onclick = () => { pickedCat = "cat2"; c2b.className = "lce-role-opt sel-c2"; c1b.className = "lce-role-opt"; };
                }
                const fInp = document.getElementById("lce-sub-file");
                if (isPhoto && fInp) {
                    const zone = document.getElementById("lce-upload-zone"), prev = document.getElementById("lce-photo-prev");
                    zone.onclick = () => fInp.click();
                    prev.onclick = () => fInp.click();
                    fInp.onchange = ev => {
                        const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                        h.compressImg(file, "photo").then(data => { pickedMedia = data; prev.src = data; prev.style.display = "block"; zone.style.display = "none"; showToast("📸 تم تجهيز الصورة!", 2500, "gold"); }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
                    };
                } else if (fInp) {
                    const fPrev = document.getElementById("lce-sub-av-prev"), fLbl = document.getElementById("lce-sub-av-lbl"), fClr = document.getElementById("lce-sub-av-clr");
                    document.getElementById("lce-sub-av-btn").onclick = () => fInp.click();
                    fInp.onchange = ev => {
                        const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                        h.compressImg(file, "avatar").then(data => { pickedMedia = data; fPrev.innerHTML = `<img src="${data}" alt="">`; fLbl.textContent = "تم اختيار الصورة ✓"; fClr.style.display = "inline-flex"; }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
                    };
                    fClr.onclick = () => { pickedMedia = ""; fPrev.innerHTML = '<i class="fas fa-camera"></i>'; fLbl.textContent = "تُستخدم صورة عضويتك تلقائياً أو اختر من الأستوديو"; fClr.style.display = "none"; };
                }
                document.getElementById("lce-submit-entry").onclick = () => submitEntry(cid, c, pickedCat, pickedMedia);
            }
            return;
        }

        // 3. مرحلة السحب العشوائي (raffle)
        if ("drawing" === info.phase) {
            body.dataset.phase = "drawing";
            const list = getApprovedEntries(entries);
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="font-size:44px;">🎰</div>
                    <h2>أُغلق التسجيل — بانتظار السحب العشوائي!</h2>
                    <p>عدد التذاكر المسجلة: <b>${list.length}</b> • عدد الفائزين المطلوب: <b>${Math.max(1, Number(c.maxWinners) || 1)}</b></p>
                    ${h.canPerm(cid, "control") ? `<div style="margin-top:14px;"><button type="button" id="lce-do-draw" class="lce-btn"><i class="fas fa-dice"></i> إجراء السحب العشوائي وإعلان الفائزين 🎉</button></div>` : '<div style="margin-top:10px;color:#fde68a;font-weight:800;">جاري تجهيز القرعة بواسطة الإدارة...</div>'}
                </div>
                <div class="lce-grid">
                    ${list.map(e => `<div class="lce-card" style="padding:11px;">${renderAvatar(e.avatar, "fa-ticket-alt")}<div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div><span class="lce-spot-bdg">🎟️ ${(e.tickets || 1) > 1 ? `×${e.tickets} فرص VIP` : "تذكرة سحب"}</span></div>`).join("")}
                </div>`;
            document.getElementById("lce-do-draw")?.addEventListener("click", () => runRaffleDraw(cid, c));
            return;
        }

        // 4. مرحلة فرز التوقعات (prediction)
        if ("judging" === info.phase) {
            body.dataset.phase = "judging";
            const list = getApprovedEntries(entries);
            const canJudge = h.canPerm(cid, "control") || h.canPerm(cid, "entries");
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="font-size:40px;">⚖️</div>
                    <h2>أُغلق باب التوقعات — جاري الفرز!</h2>
                    <p>${canJudge ? "اضغط على التوقعات الصحيحة لتعليمها كفائزة ثم اضغط «اعتماد وإعلان الفائزين»." : "أُغلق باب استقبال التوقعات وبانتظار إعلان الإدارة عن النتيجة الصحيحة."}</p>
                    ${canJudge ? `<div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <input id="lce-pred-ans" class="lce-inp" style="max-width:300px;" placeholder="الإجابة الصحيحة الرسمية..." value="${h.esc(c.correctAnswer || "")}">
                        <button type="button" id="lce-pred-pub" class="lce-btn"><i class="fas fa-flag-checkered"></i> اعتماد وإعلان الفائزين</button>
                    </div>` : ""}
                </div>
                <div class="lce-grid">
                    ${list.length ? list.map(e => `
                        <div class="lce-card ${e.isWinner ? "winner-mark" : ""}">
                            ${renderAvatar(e.avatar, "fa-bullseye")}
                            <div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>
                            <div class="lce-talent-box" style="text-align:center;">${h.esc(e.text || "-")}</div>
                            ${canJudge ? `<button type="button" class="lce-btn ${e.isWinner ? "" : "lce-btn-out"} lce-tog-win" data-k="${h.esc(e.key)}" style="width:100%;padding:7px;font-size:.82rem;">${e.isWinner ? "✅ توقع صحيح (فائز)" : "تحديد كفائز 🏆"}</button>` : (e.isWinner ? '<span class="lce-spot-bdg">✅ فائز</span>' : "")}
                        </div>`).join("") : '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:24px;">لا توجد توقعات مسجلة.</div>'}
                </div>`;
            body.querySelectorAll(".lce-tog-win").forEach(b => b.onclick = () => {
                const cur = Boolean(entries[b.dataset.k]?.isWinner);
                dbOps.updateEntry(cid, b.dataset.k, { isWinner: !cur });
            });
            document.getElementById("lce-pred-pub")?.addEventListener("click", () => {
                const ans = document.getElementById("lce-pred-ans")?.value?.trim() || "";
                if (!confirm("نشر النتيجة الرسمية وإعلان الفائزين الآن؟")) return;
                dbOps.patchContest(cid, { correctAnswer: ans, resultsPublished: !0 }).then(() => {
                    contestsAdmin.log("إعلان نتائج توقعات", c.title, ans);
                    showToast("🏆 تم إعلان نتائج التوقعات!", 4000, "gold");
                });
            });
            return;
        }

        // 5. مرحلة التصويت لبطولة خروج المغلوب (bracket 1v1)
        if ("voting" === info.phase && isBracket) {
            body.dataset.phase = "voting_bracket";
            const br = c.bracket;
            const canCtrl = h.canPerm(cid, "control");
            if (!br || !Array.isArray(br.matches) || !br.matches.length) {
                body.innerHTML = `
                    <div class="lce-hero">
                        <div style="font-size:42px;">⚔️</div>
                        <h2>${h.esc(c.title)} — تجهيز قرعة المواجهات</h2>
                        <p>أُغلق التسجيل (${getApprovedEntries(entries).length} متنافس) وبانتظار سحب قرعة الجولة الأولى.</p>
                        ${canCtrl ? `<button type="button" id="lce-br-init" class="lce-btn" style="margin-top:14px;"><i class="fas fa-random"></i> سحب القرعة وبدء الجولة #1</button>` : ""}
                    </div>`;
                document.getElementById("lce-br-init")?.addEventListener("click", () => startBracketTournament(cid, c));
                return;
            }
            const roundLabel = br.matches.length === 1 ? "🔥 المواجهة النهائية" : (br.matches.length === 2 ? "⚔️ نصف النهائي" : `⚔️ الجولة #${br.round}`);
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="color:var(--lce-ac);font-size:.86rem;font-weight:800;">${roundLabel} • خروج المغلوب (1 ضد 1)</div>
                    <h2>${h.esc(c.title)}</h2>
                    <p>لك صوت واحد في كل مواجهة مستقلة! اختر من يستحق التأهل للجولة التالية.</p>
                    ${info.remaining > 0 ? `<div class="lce-timer"><i class="fas fa-hourglass-half"></i> <span id="lce-cd-txt">${h.fmtTime(info.remaining)}</span></div>` : ""}
                    ${canCtrl ? `<div style="margin-top:12px;"><button type="button" id="lce-br-next" class="lce-btn"><i class="fas fa-forward"></i> ${br.matches.length === 1 ? "تتويج بطل البطولة 🏆" : `إنهاء الجولة وتأهيل الفائزين للجولة #${br.round + 1}`}</button></div>` : ""}
                </div>
                ${br.matches.map((m, idx) => {
                    const ea = entries[m.a], eb = m.b ? entries[m.b] : null;
                    if (!ea) return "";
                    if (!eb) {
                        return `<div class="lce-match-card" style="text-align:center;">
                            <div style="color:var(--lce-tx);font-weight:800;font-size:.86rem;">مواجهة #${idx + 1} — تأهل تلقائي (Bye)</div>
                            <div style="margin-top:8px;font-weight:900;font-size:1.05rem;">👑 ${h.esc(ea.displayName || ea.username)}</div>
                        </div>`;
                    }
                    const cnts = computeVoteCounts(entries, votes, m.id);
                    const va = cnts[m.a] || 0, vb = cnts[m.b] || 0, tot = (va + vb) || 1;
                    const myVk = getVoteKey(cid, myKey, "cat1", !1, m.id);
                    const myPick = myKey && votes[myVk] ? votes[myVk].target : null;
                    const renderSide = (e, k, vCnt) => {
                        const pct = Math.round((vCnt / tot) * 100), voted = myPick === k;
                        const canV = !info.paused && !m.winner && (!myPick || c.cfg.allowVoteChange) && !voted;
                        return `<div class="lce-match-side ${voted ? "voted" : ""}" style="${m.winner === k ? "border-color:#D4AF37;box-shadow:0 0 18px rgba(212,175,55,.28);" : ""}">
                            ${renderAvatar(e.avatar, "fa-user")}
                            <div class="lce-cname">${e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username)}</div>
                            ${!c.cfg.hideLiveVotes || isAdm ? `<div class="lce-bar-wrap" style="margin-top:6px;"><div class="lce-bar-fill" style="width:${pct}%;"></div></div><div class="lce-vstat">🔥 ${vCnt} صوت (${pct}%)</div>` : '<div class="lce-vstat">🔒 سري</div>'}
                            ${m.winner === k ? '<span class="lce-spot-bdg">✅ متأهل</span>' : (voted ? '<button type="button" class="lce-btn" style="width:100%;padding:7px;font-size:.8rem;background:#10b981;color:#fff;" disabled>✓ صوتك هنا</button>' : `<button type="button" class="lce-btn lce-br-vote" data-k="${h.esc(k)}" data-mid="${h.esc(m.id)}" style="width:100%;padding:7px;font-size:.8rem;" ${canV ? "" : "disabled"}>صوّت 🗳️</button>`)}
                            ${canCtrl && !m.winner ? `<button type="button" class="lce-btn lce-btn-out lce-br-force" data-k="${h.esc(k)}" data-mi="${idx}" style="width:100%;padding:5px;font-size:.74rem;margin-top:6px;">حسم وتأهيل ⚖️</button>` : ""}
                        </div>`;
                    };
                    return `<div class="lce-match-card">
                        <div style="text-align:center;color:#94a3b8;font-size:.78rem;font-weight:800;margin-bottom:10px;">مواجهة #${idx + 1}</div>
                        <div class="lce-match-grid">${renderSide(ea, m.a, va)}<div class="lce-vs-badge">VS</div>${renderSide(eb, m.b, vb)}</div>
                    </div>`;
                }).join("")}`;

            document.getElementById("lce-br-next")?.addEventListener("click", () => advanceBracketRound(cid, c));
            body.querySelectorAll(".lce-br-vote").forEach(b => b.onclick = () => castVote(cid, c, b.dataset.k, "cat1", b.dataset.mid));
            body.querySelectorAll(".lce-br-force").forEach(b => b.onclick = () => {
                if (!confirm("حسم هذه المواجهة وتأهيل هذا المتنافس؟")) return;
                const mi = Number(b.dataset.mi);
                st.db?.ref(`${ROOT}/index/${cid}/bracket/matches/${mi}/winner`).set(b.dataset.k).then(() => showToast("✅ تم حسم المواجهة"));
            });
            return;
        }

        // 5.5 مرحلة التصويت لمعركة الفريقين (شباب ⚔️ بنات أو أي فريقين)
        if ("voting" === info.phase && isTeams) {
            const hideVotes = Boolean(c.cfg.hideLiveVotes) && !isAdm;
            const tKey = `${cid}_${Boolean(info.paused)}_${hideVotes}_${c.season || 1}_${h.isVip(cid)}_${Boolean(c.cfg.allowVoteChange)}`;

            const fillTeamsStage = () => {
                const stage = document.getElementById("lce-teams-stage");
                if (!stage) return;
                const tEntries = getApprovedEntries(entries).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
                const t1 = entries.team1 ? Object.assign({ key: "team1" }, entries.team1) : (tEntries[0] || { key: "team1", displayName: c.cat1Label || "فريق الشباب", category: "cat1" });
                const t2 = entries.team2 ? Object.assign({ key: "team2" }, entries.team2) : (tEntries[1] || { key: "team2", displayName: c.cat2Label || "فريق البنات", category: "cat2" });
                const counts = computeVoteCounts(entries, votes);
                const v1 = counts[t1.key] || 0, v2 = counts[t2.key] || 0;
                const sum = v1 + v2;
                const p1 = sum > 0 ? Math.round((v1 / sum) * 100) : 50;
                const p2 = sum > 0 ? (100 - p1) : 50;
                const diff = Math.abs(v1 - v2);
                const vkS = getVoteKey(cid, myKey, "cat1", !1);
                const myPick = myKey && votes[vkS] ? votes[vkS].target : null;

                const votesArr = Object.values(votes || {}).filter(Boolean).sort((a, b) => (b.ts || 0) - (a.ts || 0));
                const sup1 = votesArr.filter(v => v.target === t1.key);
                const sup2 = votesArr.filter(v => v.target === t2.key);

                const renderTeamCard = (tObj, cls, ico, vCnt, pct, supList) => {
                    const voted = myPick === tObj.key;
                    const isFrozen = Boolean(tObj.frozen);
                    const canV = !info.paused && !isFrozen && (!myPick || c.cfg.allowVoteChange) && !voted;
                    return `
                    <div class="lce-team-card ${cls} ${voted ? "voted" : ""}" style="${isFrozen ? "opacity:.72;" : ""}">
                        ${h.isValidImg(tObj.avatar)
                            ? `<img loading="lazy" decoding="async" src="${h.esc(tObj.avatar)}" class="lce-av" style="margin-top:2px;" alt="">`
                            : `<div class="lce-team-ico">${h.esc(ico)}</div>`}
                        <div class="lce-cname" style="font-size:1.12rem;">${h.esc(tObj.displayName || tObj.username)}</div>
                        ${tObj.text ? `<div class="lce-slogan" style="min-height:auto;margin-bottom:8px;">«${h.esc(tObj.text)}»</div>` : ""}
                        ${!hideVotes
                            ? `<div style="font-size:1.15rem;font-weight:900;color:${"t1" === cls ? "#7dd3fc" : "#f9a8d4"};margin:4px 0 8px;">🔥 ${vCnt} نقطة <span style="font-size:.82rem;color:#cbd5e1;">(${pct}%)</span></div>`
                            : '<div class="lce-vstat" style="color:#94a3b8;margin:6px 0 10px;">🔒 النتيجة سرية حتى الإعلان</div>'}
                        ${isFrozen
                            ? `<button type="button" class="lce-btn" style="width:100%;background:#334155;color:#cbd5e1;" disabled>❄️ مجمد مؤقتاً</button>`
                            : (voted
                                ? `<button type="button" class="lce-btn" style="width:100%;background:#10b981;color:#fff;" disabled>✓ صوّتت لهذا الفريق</button>`
                                : `<button type="button" class="lce-btn lce-team-vote" data-k="${h.esc(tObj.key)}" data-cat="${"t1" === cls ? "cat1" : "cat2"}" style="width:100%;${"t1" === cls ? "background:linear-gradient(135deg,#0284c7,#38bdf8);color:#fff;" : "background:linear-gradient(135deg,#db2777,#ec4899);color:#fff;"}" ${canV ? "" : "disabled"}>${myPick && c.cfg.allowVoteChange ? "التحويل لهذا الفريق 🔄" : "صوّت لهذا الفريق 🗳️"}</button>`)}
                        <div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);font-size:.78rem;color:#94a3b8;font-weight:800;">
                            <span>👥 الداعمون (${supList.length})</span>
                            <span>أحدث الهتافات 💬</span>
                        </div>
                        <div class="lce-cheer-list">
                            ${supList.length ? supList.slice(0, 60).map(v => `
                                <div class="lce-cheer-item">
                                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                                        <b style="color:#fff;">${h.esc(v.voterName || "عضو")}</b>
                                        ${v.weight > 1 ? `<span style="background:rgba(212,175,55,.2);color:#fde68a;padding:1px 6px;border-radius:10px;font-size:.68rem;font-weight:800;">×${v.weight}</span>` : ""}
                                    </div>
                                    ${v.cheer ? `<div style="color:${"t1" === cls ? "#bae6fd" : "#fbcfe8"};margin-top:2px;">«${h.esc(v.cheer)}»</div>` : ""}
                                </div>`).join("") : '<div style="text-align:center;color:#64748b;font-size:.78rem;padding:14px 6px;">كن أول من يفتتح الدعم لهذا الفريق 🔥</div>'}
                        </div>
                    </div>`;
                };

                stage.innerHTML = `
                    <div class="lce-tug-box">
                        ${!hideVotes ? `
                        <div class="lce-tug-hdr">
                            <span style="color:#7dd3fc;">${h.esc(c.cat1Icon || "⚡")} ${h.esc(t1.displayName)} (${p1}%)</span>
                            <span style="color:#fde68a;font-size:.76rem;">${diff === 0 ? "⚖️ تعادل مشتعل!" : `الفارق: ${diff} نقطة`}</span>
                            <span style="color:#f9a8d4;">(${p2}%) ${h.esc(t2.displayName)} ${h.esc(c.cat2Icon || "🌸")}</span>
                        </div>
                        <div class="lce-tug-bar">
                            <div class="lce-tug-t1" style="width:${p1}%;"></div>
                            <div class="lce-tug-t2" style="width:${p2}%;"></div>
                        </div>` : `<div style="text-align:center;color:#fcd34d;font-weight:800;font-size:.86rem;">🔒 شريط النتيجة مخفي — ستُكشف المفاجأة عند انتهاء الوقت! (إجمالي المصوّتين: ${votesArr.length})</div>`}
                    </div>
                    <div class="lce-team-grid">
                        ${renderTeamCard(t1, "t1", c.cat1Icon || "⚡", v1, p1, sup1)}
                        ${renderTeamCard(t2, "t2", c.cat2Icon || "🌸", v2, p2, sup2)}
                    </div>`;

                stage.querySelectorAll(".lce-team-vote").forEach(b => b.onclick = () => {
                    const cheerInp = document.getElementById("lce-team-cheer");
                    const cheerTxt = cheerInp ? cheerInp.value.trim().slice(0, 75) : "";
                    castVote(cid, c, b.dataset.k, b.dataset.cat, null, cheerTxt);
                });
            };

            if ("voting_teams" === body.dataset.phase && body.dataset.tkey === tKey && document.getElementById("lce-teams-stage")) {
                fillTeamsStage();
                return;
            }

            body.dataset.phase = "voting_teams";
            body.dataset.tkey = tKey;
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="color:var(--lce-ac);font-size:.84rem;font-weight:800;">الموسم #${h.esc(c.season || 1)} • معركة الفريقين ⚔️</div>
                    <h2>${h.esc(c.title)}</h2>
                    <p>${h.esc(c.subtitle || "اختر فريقك وادعمه بصوتك وهتافك — الفوز للفريق الأكثر نقاطاً!")} ${h.isVip(cid) ? `<br><span style="color:#fde68a;">⭐ أنت عضو VIP — صوتك لفريقك يُحسب ×${h.getVipWeight(cid)}!</span>` : ""}</p>
                    <div class="lce-timer"><i class="fas fa-hourglass-half"></i> <span id="lce-cd-txt">${h.fmtTime(info.remaining)}</span></div>
                    ${info.paused ? '<div style="color:#fca5a5;font-weight:bold;margin-top:8px;">⏸️ التصويت متوقف مؤقتاً</div>' : ""}
                </div>
                <div class="lce-form" style="padding:11px 14px;margin-bottom:14px;">
                    <label style="display:block;font-size:.8rem;color:var(--lce-tx);font-weight:800;margin-bottom:6px;"><i class="fas fa-bullhorn"></i> أضف هتافاً أو كلمة تشجيعية لفريقك قبل التصويت (اختياري):</label>
                    <input type="text" id="lce-team-cheer" class="lce-inp" maxlength="75" placeholder="مثلاً: بالتوفيق لفريقنا 🔥🏆 (أو اتركه فارغاً للتصويت السريع)">
                </div>
                <div id="lce-teams-stage"></div>`;

            fillTeamsStage();
            return;
        }

        // 6. مرحلة التصويت القياسية مع تحديث ذكي للـ DOM (+ شريط طلب الانسحاب وتحويل الأصوات)
        if ("voting" === info.phase) {
            const hideVotes = Boolean(c.cfg.hideLiveVotes) && !isAdm;
            const myEntry = myKey ? entries[myKey] : null;
            const canTransfer = Boolean(myEntry && "pending" !== myEntry.status && !isBlind && "poll" !== T && !isTeams && !1 !== c.cfg.allowVoteTransfer);
            const myTrReq = myKey ? (st.data.transfers || {})[myKey] : null;
            const vKey = `${cid}_${Boolean(info.paused)}_${c.mode}_${hideVotes}_${isBlind}_${c.season || 1}_${h.isVip(cid)}_${T}_${Boolean(c.cfg.allowVoteChange)}_${canTransfer}_${myTrReq?.toKey || ""}`;

            const fillVoteGrid = (forceRebuild = !1) => {
                const grid = document.getElementById("lce-vote-grid");
                if (!grid) return;
                const counts = computeVoteCounts(entries, votes);
                let list = getApprovedEntries(entries, st.catFilter);
                if (st.searchQuery && (!isBlind || isAdm)) {
                    const q = st.searchQuery.toLowerCase();
                    list = list.filter(e => `${e.displayName || ""} ${e.username || ""} ${e.partnerName || ""} ${e.title || ""} ${e.text || ""}`.toLowerCase().includes(q));
                }
                if (hideVotes || isBlind) list.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
                else list.sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0) || (a.joinedAt || 0) - (b.joinedAt || 0));

                const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
                const vkS = getVoteKey(cid, myKey, "cat1", !1);
                const vk1 = getVoteKey(cid, myKey, "cat1", !0);
                const vk2 = getVoteKey(cid, myKey, "cat2", !0);
                const myVoteSingle = myKey && votes[vkS] ? votes[vkS].target : null;
                const myVoteC1 = myKey && votes[vk1] ? votes[vk1].target : null;
                const myVoteC2 = myKey && votes[vk2] ? votes[vk2].target : null;

                const structSig = list.map(e => `${e.key}:${e.displayName || ""}:${e.text || ""}:${e.badge || ""}:${Boolean(e.frozen)}:${e.ytId || ""}`).sort().join("|");

                if (!forceRebuild && list.length && grid.dataset.structSig === structSig) {
                    const cardMap = {};
                    grid.querySelectorAll(":scope > .lce-card[data-ekey]").forEach(el => { cardMap[el.dataset.ekey] = el; });
                    const hasAll = list.every(e => Boolean(cardMap[e.key]));
                    if (hasAll) {
                        const hasPlayingYt = Boolean(grid.querySelector(".lce-yt-wrap.playing"));
                        list.forEach((e, idx) => {
                            const card = cardMap[e.key];
                            const vCnt = counts[e.key] || 0;
                            const pct = Math.min(100, Math.round((vCnt / totalVotes) * 100));
                            const slotCat = "cat2" === e.category ? "cat2" : "cat1";
                            const votedForThis = isDual ? (("cat1" === slotCat ? myVoteC1 : myVoteC2) === e.key) : (myVoteSingle === e.key);
                            const hasVotedSlot = isDual ? Boolean("cat1" === slotCat ? myVoteC1 : myVoteC2) : Boolean(myVoteSingle);
                            const isFrozen = Boolean(e.frozen);
                            const canVoteBtn = !info.paused && !isFrozen && (!hasVotedSlot || c.cfg.allowVoteChange) && !votedForThis;

                            card.classList.toggle("voted", votedForThis);
                            const rk = card.querySelector(".lce-rank-num");
                            if (rk) rk.textContent = `#${idx + 1}`;
                            const bf = card.querySelector(".lce-bar-fill");
                            if (bf) bf.style.width = `${pct}%`;
                            const vs = card.querySelector(".lce-vstat");
                            if (vs && !hideVotes) vs.textContent = `🔥 ${vCnt} صوت (${pct}%)`;

                            const vBtn = card.querySelector(".lce-vbtn-slot");
                            if (vBtn && !isFrozen) {
                                if (votedForThis) {
                                    vBtn.textContent = "✓ تم تصويتك";
                                    vBtn.disabled = !0;
                                    vBtn.style.background = "#10b981";
                                    vBtn.style.color = "#fff";
                                } else {
                                    vBtn.textContent = hasVotedSlot && c.cfg.allowVoteChange ? "تغيير صوتي" : "صوّت 🗳️";
                                    vBtn.disabled = !canVoteBtn;
                                    vBtn.style.background = "";
                                    vBtn.style.color = "";
                                }
                            }
                            if (!hasPlayingYt && grid.children[idx] !== card) {
                                grid.insertBefore(card, grid.children[idx] || null);
                            }
                        });
                        return;
                    }
                }

                grid.dataset.structSig = structSig;
                grid.innerHTML = list.length ? list.map((e, idx) => {
                    const cm = getCatMeta(c, e.category);
                    const vCnt = counts[e.key] || 0;
                    const pct = Math.min(100, Math.round((vCnt / totalVotes) * 100));
                    const slotCat = "cat2" === e.category ? "cat2" : "cat1";
                    const votedForThis = isDual ? (("cat1" === slotCat ? myVoteC1 : myVoteC2) === e.key) : (myVoteSingle === e.key);
                    const hasVotedSlot = isDual ? Boolean("cat1" === slotCat ? myVoteC1 : myVoteC2) : Boolean(myVoteSingle);
                    const isFrozen = Boolean(e.frozen);
                    const canVoteBtn = !info.paused && !isFrozen && (!hasVotedSlot || c.cfg.allowVoteChange) && !votedForThis;
                    const blindLabel = `${isPhoto ? "🖼️ صورة" : isMedia ? "🎵 مقطع" : isTalent ? "✍️ مشاركة" : "🎭 مشارك"} رقم #${idx + 1}`;
                    const showRealName = !isBlind || isAdm;
                    const duoDisp = isDuo ? `${h.esc(e.displayName || e.username)} ❤️ ${h.esc(e.partnerName || "")}` : (e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username));
                    const nameHtml = showRealName
                        ? `${duoDisp}${isBlind && isAdm ? ' <span style="font-size:.7rem;color:#fbbf24;">(مخفي)</span>' : ""}`
                        : h.esc(blindLabel);

                    const voteCtrlHtml = `
                        ${!hideVotes ? `<div class="lce-bar-wrap"><div class="lce-bar-fill" style="width:${pct}%;"></div></div><div class="lce-vstat">🔥 ${vCnt} صوت (${pct}%)</div>` : '<div class="lce-vstat" style="color:#94a3b8;">🔒 الأصوات سرية</div>'}
                        <div class="lce-cacts">
                            ${isFrozen
                                ? `<button type="button" class="lce-btn" style="flex:1;padding:8px;font-size:.82rem;background:#334155;color:#cbd5e1;" disabled>❄️ مجمد مؤقتاً</button>`
                                : `<button type="button" class="lce-btn lce-vote-go lce-vbtn-slot" data-k="${h.esc(e.key)}" data-cat="${slotCat}" style="flex:1;padding:8px;font-size:.82rem;${votedForThis ? "background:#10b981;color:#fff;" : ""}" ${votedForThis || !canVoteBtn ? "disabled" : ""}>${votedForThis ? "✓ تم تصويتك" : (hasVotedSlot && c.cfg.allowVoteChange ? "تغيير صوتي" : "صوّت 🗳️")}</button>`}
                            ${!isBlind ? `<button type="button" class="lce-ibtn sq lce-share-entry" data-name="${h.esc(isDuo ? `${e.displayName} و ${e.partnerName}` : (e.displayName || e.username))}" title="دعم ومشاركة"><i class="fas fa-share-alt"></i></button>` : ""}
                        </div>`;

                    if (isPhoto) {
                        return `<div class="lce-card lce-photo-card ${cm.cls}-card ${votedForThis ? "voted" : ""}" data-ekey="${h.esc(e.key)}" style="${isFrozen ? "opacity:.72;" : ""}">
                            ${isDual ? `<span class="lce-role-tag ${cm.cls}">${h.esc(cm.icon)} ${h.esc(cm.label)}</span>` : ""}
                            ${!hideVotes && !isBlind ? `<span class="lce-rank-num">#${idx + 1}</span>` : ""}
                            <img loading="lazy" decoding="async" class="lce-photo-media lce-zoomable" src="${h.esc(e.image)}" data-cap="${h.esc(isBlind && !isAdm ? blindLabel : (e.displayName || ""))}" alt="" title="اضغط للتكبير">
                            <div class="lce-photo-inner"><div class="lce-cname">${nameHtml}</div>${e.text ? `<div class="lce-slogan">${h.esc(e.text)}</div>` : ""}${voteCtrlHtml}</div>
                        </div>`;
                    }
                    if (isMedia && e.ytId) {
                        return `<div class="lce-card lce-photo-card ${votedForThis ? "voted" : ""}" data-ekey="${h.esc(e.key)}" style="${isFrozen ? "opacity:.72;" : ""}">
                            ${!hideVotes && !isBlind ? `<span class="lce-rank-num">#${idx + 1}</span>` : ""}
                            <div class="lce-yt-wrap" data-yt="${h.esc(e.ytId)}"><img loading="lazy" decoding="async" src="https://img.youtube.com/vi/${h.esc(e.ytId)}/hqdefault.jpg" alt=""><div class="lce-yt-play"><i class="fas fa-play"></i></div></div>
                            <div class="lce-photo-inner"><div class="lce-cname">${nameHtml}</div>${e.title ? `<div class="lce-slogan" style="min-height:22px;color:var(--lce-tx);">🎵 ${h.esc(e.title)}</div>` : ""}${voteCtrlHtml}</div>
                        </div>`;
                    }
                    return `<div class="lce-card ${cm.cls}-card ${votedForThis ? "voted" : ""}" data-ekey="${h.esc(e.key)}" style="${isFrozen ? "opacity:.72;" : ""}">
                        ${isDual ? `<span class="lce-role-tag ${cm.cls}">${h.esc(cm.icon)} ${h.esc(cm.label)}</span>` : ""}
                        ${!hideVotes && !isBlind ? `<span class="lce-rank-num">#${idx + 1}</span>` : ""}
                        ${isDuo ? renderDuoAvatars(e.avatar, e.partnerAvatar) : (!isBlind || isAdm ? renderAvatar(e.avatar, c.icon || tmpl.icon) : `<div class="lce-av"><i class="fas ${h.esc(c.icon || tmpl.icon)}"></i></div>`)}
                        ${e.badge ? `<span class="lce-spot-bdg">${h.esc(e.badge)}</span>` : ""}
                        <div class="lce-cname">${nameHtml}</div>
                        ${e.title ? `<div style="font-size:.86rem;font-weight:800;color:var(--lce-tx);margin-bottom:4px;">${h.esc(e.title)}</div>` : ""}
                        ${isTalent
                            ? `<div class="lce-talent-box lce-read-more" data-title="${h.esc(e.title || blindLabel)}" data-author="${h.esc(showRealName ? (e.displayName || e.username) : blindLabel)}" data-txt="${h.esc(e.text || "")}">${h.esc(e.text || "")}</div>`
                            : `<div class="lce-slogan">${e.text ? `«${h.esc(e.text)}»` : ""}</div>`}
                        ${voteCtrlHtml}
                    </div>`;
                }).join("") : '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:24px;">لا توجد مشاركات مطابقة.</div>';

                grid.querySelectorAll(".lce-zoomable").forEach(img => img.onclick = () => openLightbox(img.src, img.dataset.cap || ""));
                grid.querySelectorAll(".lce-read-more").forEach(box => box.onclick = () => openTextPreview(box.dataset.title, box.dataset.txt, box.dataset.author));
                grid.querySelectorAll(".lce-yt-wrap").forEach(w => w.onclick = () => activateYtEmbed(w));
                grid.querySelectorAll(".lce-vote-go").forEach(b => b.onclick = () => castVote(cid, c, b.dataset.k, b.dataset.cat));
                grid.querySelectorAll(".lce-share-entry").forEach(b => b.onclick = () => {
                    h.copy(`🗳️ صوّت الآن لـ (${b.dataset.name}) في ${c.title} داخل شات ليل! 🏆🔥`, "📋 تم نسخ رسالة الدعم!");
                });
            };

            if ("voting" === body.dataset.phase && body.dataset.vkey === vKey && document.getElementById("lce-vote-grid")) {
                fillVoteGrid(!1);
                return;
            }

            body.dataset.phase = "voting";
            body.dataset.vkey = vKey;
            body.innerHTML = `
                <div class="lce-hero">
                    <div style="color:var(--lce-ac);font-size:.84rem;font-weight:800;">الموسم #${h.esc(c.season || 1)} • ${isBlind ? "التصويت الأعمى 🎭" : "مرحلة التصويت 🗳️"}</div>
                    <h2>${h.esc(c.title)}</h2>
                    <p>${isDual ? `لك صوت لـ <b>${h.esc(c.cat1Label || "الفئة 1")}</b> وصوت لـ <b>${h.esc(c.cat2Label || "الفئة 2")}</b>.` : "اختر الأفضل وصوّت له قبل انتهاء العدّاد."} ${isBlind ? "<br><span style='color:#fbbf24;'>🎭 الأسماء مخفية لضمان العدل وتُكشف عند إعلان النتائج!</span>" : ""} ${h.isVip(cid) ? `<br><span style="color:#fde68a;">⭐ أنت عضو VIP — صوتك يُحسب ×${h.getVipWeight(cid)}!</span>` : ""} ${hideVotes ? "<br><span style='color:#fcd34d;'>🔒 العدادات سرية حتى انتهاء الوقت.</span>" : ""}</p>
                    <div class="lce-timer"><i class="fas fa-hourglass-half"></i> <span id="lce-cd-txt">${h.fmtTime(info.remaining)}</span></div>
                    ${info.paused ? '<div style="color:#fca5a5;font-weight:bold;margin-top:8px;">⏸️ التصويت متوقف مؤقتاً</div>' : ""}
                </div>
                ${canTransfer ? (myTrReq ? `
                <div class="lce-form" style="border-color:#f59e0b;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <div style="font-size:.84rem;color:#fde68a;font-weight:700;">⏳ طلب انسحابك وتحويل أصواتك إلى (<b>${h.esc(myTrReq.toName)}</b>) قيد مراجعة الإدارة...</div>
                    <button type="button" id="lce-tr-abort" class="lce-btn lce-btn-red" style="padding:6px 12px;font-size:.78rem;"><i class="fas fa-times"></i> إلغاء الطلب</button>
                </div>` : (!info.paused ? `
                <div class="lce-form" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <div style="font-size:.83rem;color:#cbd5e1;font-weight:700;"><i class="fas fa-exchange-alt" style="color:var(--lce-ac);"></i> هل ترغب بالانسحاب وإهداء أصواتك لمتسابق آخر؟ <span style="color:#94a3b8;font-size:.75rem;">(يتطلب موافقة الإدارة)</span></div>
                    <button type="button" id="lce-tr-open" class="lce-btn lce-btn-out" style="padding:7px 13px;font-size:.8rem;"><i class="fas fa-hand-holding-heart"></i> طلب انسحاب وتحويل الأصوات</button>
                </div>` : "")) : ""}
                <div class="lce-filters">
                    ${isDual ? `
                        <button type="button" class="lce-fbtn ${"all" === st.catFilter ? "active" : ""}" data-vf="all">الكل</button>
                        <button type="button" class="lce-fbtn ${"cat1" === st.catFilter ? "active" : ""}" data-vf="cat1">${h.esc(c.cat1Icon || "👑")} ${h.esc(c.cat1Label || "الفئة 1")}</button>
                        <button type="button" class="lce-fbtn ${"cat2" === st.catFilter ? "active" : ""}" data-vf="cat2">${h.esc(c.cat2Icon || "👸")} ${h.esc(c.cat2Label || "الفئة 2")}</button>
                    ` : ""}
                    ${!isBlind || isAdm ? `<input type="text" id="lce-vsearch" class="lce-inp" style="flex:1;min-width:150px;padding:7px 12px;font-size:.84rem;" placeholder="🔍 ابحث..." value="${h.esc(st.searchQuery)}">` : ""}
                </div>
                <div class="lce-grid" id="lce-vote-grid"></div>`;

            fillVoteGrid(!0);
            body.querySelectorAll("[data-vf]").forEach(b => b.onclick = () => {
                st.catFilter = b.dataset.vf;
                body.querySelectorAll("[data-vf]").forEach(x => x.classList.toggle("active", x === b));
                fillVoteGrid(!0);
            });
            const vs = document.getElementById("lce-vsearch");
            if (vs) vs.oninput = () => { st.searchQuery = vs.value; fillVoteGrid(!0); };
            document.getElementById("lce-tr-open")?.addEventListener("click", () => openTransferModal(cid, c, myEntry));
            document.getElementById("lce-tr-abort")?.addEventListener("click", () => {
                if (confirm("إلغاء طلب الانسحاب وتحويل الأصوات؟")) {
                    dbOps.cancelTransfer(cid, myKey).then(() => showToast("تم إلغاء الطلب."));
                }
            });
            return;
        }

        // 7. كسر التعادل
        if ("tiebreaker" === info.phase) {
            body.dataset.phase = "tiebreaker";
            const counts = computeVoteCounts(entries, votes);
            const canCtrl = h.canPerm(cid, "control");
            const renderTieGroup = (arr, label, slot) => !arr || !arr.length ? "" : `
                <h3 style="color:#fca5a5;margin:14px 0 10px;text-align:center;">⚖️ تعادل على لقب ${h.esc(label)}</h3>
                <div class="lce-grid">
                    ${arr.map(e => `
                        <div class="lce-card ${isPhoto ? "lce-photo-card" : ""}" style="border-color:#ef4444;">
                            ${isPhoto && h.isValidImg(e.image) ? `<img loading="lazy" decoding="async" class="lce-photo-media lce-zoomable" src="${h.esc(e.image)}" alt="">` : (isDuo ? renderDuoAvatars(e.avatar, e.partnerAvatar) : renderAvatar(e.avatar, c.icon || tmpl.icon))}
                            <div class="${isPhoto ? "lce-photo-inner" : ""}" style="width:100%;">
                                <div class="lce-cname">${isDuo ? `${h.esc(e.displayName)} ❤️ ${h.esc(e.partnerName)}` : (e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username))}</div>
                                <div class="lce-vstat">متعادل بـ ${counts[e.key] || 0} صوت</div>
                                ${canCtrl ? `<button type="button" class="lce-btn lce-btn-red lce-tb-pick" data-k="${h.esc(e.key)}" data-slot="${slot}" style="width:100%;">منح الصوت الحاسم 🏆</button>` : '<span style="font-size:.82rem;color:#fcd34d;">بانتظار حسم الإدارة...</span>'}
                            </div>
                        </div>`).join("")}
                </div>`;

            body.innerHTML = `
                <div class="lce-hero" style="border-color:rgba(239,68,68,.4);">
                    <div style="font-size:40px;">⚖️</div>
                    <h2>تعادل في المركز الأول!</h2>
                    <p>${canCtrl ? "بصفتك من الإدارة، اختر الفائز بالصوت الحاسم الآن." : "بانتظار الصوت الحاسم من الإدارة لإعلان النتيجة النهائية."}</p>
                </div>
                ${isDual ? (renderTieGroup(info.c1Ties, c.cat1Label || "الفئة 1", "tieBreakerCat1") + renderTieGroup(info.c2Ties, c.cat2Label || "الفئة 2", "tieBreakerCat2")) : renderTieGroup(info.ties, c.title, "tieBreaker")}`;

            body.querySelectorAll(".lce-zoomable").forEach(img => img.onclick = () => openLightbox(img.src));
            body.querySelectorAll(".lce-tb-pick").forEach(b => b.onclick = () => {
                if (!confirm("تأكيد منح الصوت الحاسم وتتويج هذا المشارك؟")) return;
                const up = {}; up[b.dataset.slot] = b.dataset.k;
                dbOps.patchContest(cid, up).then(() => {
                    contestsAdmin.log("حسم تعادل", c.title, b.dataset.k);
                    showToast("🏆 تم حسم التعادل وإعلان التتويج!", 4000, "gold");
                });
            });
            return;
        }

        // 8. النتائج والتتويج (جميع الـ 11 نظاماً)
        body.dataset.phase = "results";
        const counts = computeVoteCounts(entries, votes);
        if (c.tieBreaker && void 0 !== counts[c.tieBreaker]) counts[c.tieBreaker]++;
        if (c.tieBreakerCat1 && void 0 !== counts[c.tieBreakerCat1]) counts[c.tieBreakerCat1]++;
        if (c.tieBreakerCat2 && void 0 !== counts[c.tieBreakerCat2]) counts[c.tieBreakerCat2]++;

        const noVotesMode = isPredict || isRaffle || isQuiz || isBracket;
        let allSorted = getApprovedEntries(entries);
        let winners = [];
        if (isBracket && c.bracket?.champion && entries[c.bracket.champion]) {
            winners = [Object.assign({ key: c.bracket.champion }, entries[c.bracket.champion])];
        } else if (isPredict || isRaffle || isQuiz) {
            winners = allSorted.filter(e => e.isWinner).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
            allSorted.sort((a, b) => (Number(Boolean(b.isWinner)) - Number(Boolean(a.isWinner))) || ((a.joinedAt || 0) - (b.joinedAt || 0)));
        } else {
            allSorted.sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
            if (isDual) {
                const top1 = allSorted.find(e => "cat2" !== e.category), top2 = allSorted.find(e => "cat2" === e.category);
                if (top1) winners.push(top1);
                if (top2) winners.push(top2);
            } else if (allSorted[0]) winners.push(allSorted[0]);
        }

        const cKey = `${cid}_${c.season}_${winners.map(w => w.key).join("_")}`;
        if (winners.length && st.confettiFiredKey !== cKey) { st.confettiFiredKey = cKey; h.fireConfetti(); }

        body.innerHTML = `
            <div style="text-align:center;margin-bottom:14px;">
                <h2 style="margin:0;color:var(--lce-ac);font-size:1.4rem;font-weight:900;">🏆 التتويج وكشف النتائج — الموسم #${h.esc(c.season || 1)} 🏆</h2>
                ${(isPredict || isQuiz) && c.correctAnswer ? `<div style="margin-top:8px;display:inline-block;background:rgba(16,185,129,.18);border:1px solid rgba(16,185,129,.45);color:#6ee7b7;padding:5px 16px;border-radius:20px;font-size:.86rem;font-weight:800;">✅ الإجابة المعتمدة: ${h.esc(c.correctAnswer.split("|")[0])}</div>` : ""}
            </div>
            ${winners.length ? `<div style="display:grid;grid-template-columns:${winners.length > 1 ? "repeat(auto-fit,minmax(250px,1fr))" : "1fr"};gap:14px;">
                ${winners.map((w, wi) => {
                    const cm = getCatMeta(c, w.category);
                    const wNameHtml = isDuo ? `${h.esc(w.displayName || w.username)} ❤️ ${h.esc(w.partnerName || "")}` : (w.html ? h.sanHtml(w.html) : h.esc(w.displayName || w.username));
                    const wLabel = isTeams ? "⚔️ الفريق الفائز بالمعركة" : (isDual ? cm.label : (isQuiz ? `⚡ المركز #${wi + 1} (الأسرع)` : (isRaffle ? `🎟️ فائز بالقرعة #${wi + 1}` : (isBracket ? "⚔️ بطل البطولة" : "🏆 المركز الأول"))));
                    const badgeTxt = isQuiz ? `⚡ ${h.fmtDate(w.joinedAt)}` : (isRaffle ? "🎰 فائز بالسحب" : (isPredict ? "✅ توقع صحيح" : (isBracket ? "👑 بطل المواجهات" : `🔥 ${counts[w.key] || 0} ${isTeams ? "نقطة" : "صوت"}`)));
                    return `
                    <div class="lce-podium">
                        <div style="font-size:34px;margin-bottom:4px;">${h.esc(cm.icon)}</div>
                        <div style="color:var(--lce-tx);font-size:.9rem;font-weight:800;">${h.esc(wLabel)}</div>
                        ${isPhoto && h.isValidImg(w.image) ? `<img loading="lazy" decoding="async" class="lce-podium-img lce-zoomable" src="${h.esc(w.image)}" alt="">`
                            : (isMedia && w.ytId ? `<div class="lce-yt-wrap" data-yt="${h.esc(w.ytId)}" style="max-width:380px;margin:12px auto;border-radius:12px;"><img loading="lazy" decoding="async" src="https://img.youtube.com/vi/${h.esc(w.ytId)}/hqdefault.jpg" alt=""><div class="lce-yt-play"><i class="fas fa-play"></i></div></div>`
                            : (isDuo ? renderDuoAvatars(w.avatar, w.partnerAvatar) : renderAvatar(w.avatar, c.icon || tmpl.icon)))}
                        <div class="lce-cname" style="font-size:1.2rem;">${wNameHtml}</div>
                        ${w.title ? `<div style="color:var(--lce-tx);font-weight:800;font-size:.9rem;margin-top:4px;">${h.esc(w.title)}</div>` : ""}
                        ${w.text && !isQuiz ? `<div style="color:#cbd5e1;font-size:.85rem;margin:5px 0 10px;white-space:pre-line;">«${h.esc(w.text)}»</div>` : ""}
                        <div style="display:inline-block;background:var(--lce-ac);color:var(--lce-bt);padding:5px 18px;border-radius:20px;font-weight:900;font-size:.88rem;margin-top:6px;">${badgeTxt}</div>
                    </div>`;
                }).join("")}
            </div>` : '<div class="lce-hero"><p>لم تسجل نتائج فائزة في هذا الموسم.</p></div>'}
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
                <button type="button" class="lce-btn" id="lce-res-copy"><i class="fas fa-copy"></i> نسخ تهنئة التتويج للشات</button>
                <button type="button" class="lce-btn lce-btn-out" id="lce-res-pz"><i class="fas fa-gift"></i> الجوائز المستحقة</button>
            </div>
            ${allSorted.length > winners.length ? `
                <div style="font-weight:800;color:#94a3b8;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:6px;">${isTeams ? "الترتيب النهائي للفريقين:" : "باقي المراكز والمشاركات:"}</div>
                ${allSorted.map((e, i) => {
                    const cm = getCatMeta(c, e.category);
                    const thumb = isPhoto && h.isValidImg(e.image) ? e.image : (h.isValidImg(e.avatar) ? e.avatar : "");
                    return `
                    <div class="lce-prize-item" style="margin-bottom:7px;padding:8px 12px;">
                        <b style="color:var(--lce-ac);width:28px;text-align:center;">#${i + 1}</b>
                        ${thumb ? `<img loading="lazy" decoding="async" src="${h.esc(thumb)}" class="${isPhoto ? "lce-zoomable" : ""}" style="width:42px;height:42px;border-radius:${isPhoto ? "8px" : "50%"};object-fit:cover;border:1px solid var(--lce-ac);${isPhoto ? "cursor:zoom-in;" : ""}">` : `<div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:20px;">${isTeams ? h.esc(cm.icon) : '<i class="fas fa-user-circle" style="color:#64748b;"></i>'}</div>`}
                        <div style="flex:1;min-width:0;">
                            <div class="lce-cname" style="font-size:.9rem;margin:0;text-align:right;">${isDuo ? `${h.esc(e.displayName)} ❤️ ${h.esc(e.partnerName || "")}` : (e.html ? h.sanHtml(e.html) : h.esc(e.displayName || e.username))}</div>
                            <div style="font-size:.74rem;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${isDual ? `${h.esc(cm.icon)} ${h.esc(cm.label)} • ` : ""}${h.esc(e.title || (!isQuiz ? e.text : "") || "")}</div>
                        </div>
                        ${noVotesMode
                            ? `<span style="background:${e.isWinner ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.06)"};color:${e.isWinner ? "#6ee7b7" : "#94a3b8"};padding:4px 10px;border-radius:12px;font-size:.78rem;font-weight:800;">${e.isWinner ? "✅ فائز" : "مشارك"}</span>`
                            : `<span style="background:var(--lce-soft);color:var(--lce-tx);padding:4px 10px;border-radius:12px;font-size:.8rem;font-weight:800;">${counts[e.key] || 0} ${isTeams ? "نقطة" : "صوت"}</span>`}
                    </div>`;
                }).join("")}` : ""}`;

        body.querySelectorAll(".lce-zoomable").forEach(img => img.onclick = () => openLightbox(img.src));
        body.querySelectorAll(".lce-yt-wrap").forEach(w => w.onclick = () => activateYtEmbed(w));
        document.getElementById("lce-res-pz").onclick = openPrizesModal;
        document.getElementById("lce-res-copy").onclick = () => {
            if (!winners.length) return;
            const lines = winners.map(w => {
                const cm = getCatMeta(c, w.category);
                const nm = isDuo ? `${w.displayName || w.username} ❤️ ${w.partnerName || ""}` : (w.displayName || w.username);
                return `${cm.icon} ${isTeams ? "الفريق الفائز" : (isDual ? cm.label : "الفائز")}: ${nm}${!noVotesMode ? ` (${counts[w.key] || 0} ${isTeams ? "نقطة" : "صوت"})` : ""}`;
            }).join("\n");
            h.copy(`🏆✨ ألف مبروك التتويج في (${c.title}) ✨🏆\n\n${lines}\n\n🎁 الجوائز جاهزة للتفعيل! 🎉`, "📋 تم نسخ إعلان التتويج!");
        };
    }

    function submitEntry(cid, c, category, mediaData = "") {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (!ensureIdentity()) return;
        const ban = h.getMyBan(cid);
        if (!h.isAdmin(cid) && ban && ("all" === ban.scope || "nom" === ban.scope)) {
            return alert(`تم منعك من المشاركة 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
        }
        const maxE = Number(c.cfg.maxEntries) || 0;
        if (maxE > 0 && Object.keys(st.data.entries || {}).length >= maxE && !h.isAdmin(cid)) {
            return showToast("⚠️ اكتمل العدد المسموح للمشاركات.", 3500, "red");
        }
        const key = h.myKey();
        if (!key) return;
        const T = c.template;
        const text = (document.getElementById("lce-sub-text")?.value || "").trim().slice(0, 550);
        const title = (document.getElementById("lce-sub-title")?.value || "").trim().slice(0, 70);

        let partnerName = "", partnerAvatar = "", ytId = "", isWinner = !1;
        if ("photo" === T && !mediaData) return showToast("📸 الرجاء اختيار صورة أولاً!", 3000, "red");
        if (("talent" === T || "prediction" === T || "quiz" === T) && !text) return showToast("✍️ الرجاء كتابة مشاركتك قبل الإرسال!", 3000, "red");
        if ("duo" === T) {
            const pRaw = (document.getElementById("lce-sub-partner")?.value || "").trim();
            if (!pRaw) return showToast("💑 الرجاء كتابة اسم شريكك في الثنائي!", 3000, "red");
            const pDet = h.detectFromDOM(pRaw) || {};
            partnerName = pDet.displayName || pRaw;
            partnerAvatar = pDet.avatar || "";
        }
        if ("media" === T) {
            const url = (document.getElementById("lce-sub-yt")?.value || "").trim();
            ytId = h.parseYtId(url);
            if (!ytId) return showToast("🎵 الرجاء لصق رابط يوتيوب صحيح!", 3500, "red");
        }
        if ("quiz" === T && c.correctAnswer) {
            const accepted = String(c.correctAnswer).split("|").map(x => h.normAr(x)).filter(Boolean);
            const maxW = Math.max(1, Number(c.maxWinners) || 3);
            const curWins = Object.values(st.data.entries || {}).filter(e => e && e.isWinner).length;
            if (accepted.includes(h.normAr(text)) && curWins < maxW) isWinner = !0;
        }

        const det = h.detectFromDOM(st.myUser) || {};
        const needsApp = Boolean(c.cfg.requireApproval) && !h.isAdmin(cid) && "raffle" !== T && "quiz" !== T;
        const tickets = "raffle" === T ? (h.isVip(cid) ? h.getVipWeight(cid) : 1) : 1;

        dbOps.saveEntry(cid, key, {
            uid: det.uid || st.myUid || "",
            username: st.myUser,
            displayName: det.displayName || st.myUser,
            html: det.html || st.myHtml || h.esc(st.myUser),
            avatar: "photo" === T ? (det.avatar || st.myAvatar || "") : (mediaData || det.avatar || st.myAvatar || ""),
            image: "photo" === T ? mediaData : "",
            partnerName, partnerAvatar, ytId, tickets,
            category: "dual" === c.mode ? category : "cat1",
            title, text, badge: "", frozen: !1, isWinner,
            status: needsApp ? "pending" : "approved",
            bonusVotes: 0,
            joinedAt: Date.now()
        }).then(() => {
            if ("quiz" === T && isWinner) {
                const maxW = Math.max(1, Number(c.maxWinners) || 3);
                const newWins = Object.values(st.data.entries || {}).filter(e => e && e.isWinner).length + 1;
                if (newWins >= maxW) dbOps.patchContest(cid, { resultsPublished: !0 });
                showToast("🎉 إجابة صحيحة! تم تسجيلك ضمن الأسرع فوزاً 🏆", 4500, "gold");
            } else if ("quiz" === T && c.correctAnswer) {
                showToast("❌ للأسف إجابتك غير مطابقة!", 3500, "red");
            } else {
                showToast(needsApp ? "⏳ تم إرسال مشاركتك لمراجعة الإدارة!" : "✅ تم اعتماد مشاركتك بنجاح!", 3500, "gold");
            }
        }).catch(() => alert("❌ فشل حفظ المشاركة."));
    }

    function castVote(cid, c, targetKey, targetCat, matchKey = null, cheer = "") {
        if (!st.db) return showToast("تعذر الاتصال بالقاعدة", 3000, "red");
        if (Date.now() - st.lastVoteAt < 1200) return showToast("⏳ انتظر لحظة...", 1800);
        if (!c.cfg.allowGuestsVote && h.isGuest() && !h.isAdmin(cid)) return alert("التصويت متاح للأعضاء المسجلين فقط 🏆");
        if (!ensureIdentity()) return;
        const ban = h.getMyBan(cid);
        if (!h.isAdmin(cid) && ban && ("all" === ban.scope || "vote" === ban.scope)) {
            return alert(`تم منعك من التصويت 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
        }
        const target = st.data.entries?.[targetKey];
        if (!target || target.frozen) return showToast("❄️ التصويت لهذه المشاركة مجمد مؤقتاً.", 3000, "red");
        const myK = h.myKey();
        const isTeams = "teams" === c.template;
        if (!isTeams && !c.cfg.allowSelfVote && !h.isAdmin(cid) && myK === targetKey) return showToast("🚫 لا يمكنك التصويت لنفسك!", 3500, "red");
        const isDual = "dual" === c.mode && !matchKey && !isTeams;
        const voteKey = getVoteKey(cid, myK, targetCat, isDual, matchKey);
        if (st.data.votes?.[voteKey] && !c.cfg.allowVoteChange) return showToast("⚠️ لقد استخدمت صوتك مسبقاً.", 3500, "red");
        const label = c.cfg.blindVoting && !h.isAdmin(cid) ? "هذه المشاركة" : `(${target.displayName || targetKey})`;
        if (!confirm(`تأكيد منح صوتك لـ ${label}؟${c.cfg.allowVoteChange ? "" : "\nلا يمكن التراجع بعد التصويت."}`)) return;

        st.lastVoteAt = Date.now();
        let weight = Math.max(1, Number(c.voteMultiplier) || 1);
        if (h.isVip(cid)) weight = Math.max(weight, h.getVipWeight(cid));

        const cleanCheer = String(cheer || "").trim().slice(0, 75);
        dbOps.saveVote(cid, voteKey, {
            target: targetKey,
            category: targetCat,
            matchKey: matchKey || null,
            voterName: st.myUser,
            cheer: cleanCheer,
            weight,
            ts: Date.now()
        }).then(() => {
            const ci = document.getElementById("lce-team-cheer");
            if (ci) ci.value = "";
            showToast(`✅ تم احتساب صوتك بنجاح${weight > 1 ? ` (×${weight})` : ""}!`, 3500, "gold");
        }).catch(() => alert("❌ تعذر تسجيل الصوت."));
    }

    function startCountdownLoop() {
        clearInterval(st.timerId);
        let prevPhase = "contest" === st.viewMode ? getPhaseInfo(h.getContest(st.activeCid)).phase : "hub";
        st.timerId = setInterval(() => {
            const modal = document.getElementById("lce-modal");
            if (!modal || !modal.classList.contains("open")) { clearInterval(st.timerId); return; }
            if ("hub" === st.viewMode) {
                const cds = modal.querySelectorAll(".lce-hub-cd");
                if (!cds.length) { clearInterval(st.timerId); return; }
                cds.forEach(el => {
                    const c = h.getContest(el.dataset.cid);
                    if (c) el.textContent = h.fmtTime(getPhaseInfo(c).remaining);
                });
                return;
            }
            const c = h.getContest(st.activeCid);
            if (!c || c.paused) { clearInterval(st.timerId); return; }
            const fastInfo = getPhaseInfo(c);
            if (fastInfo.phase !== prevPhase) {
                prevPhase = fastInfo.phase;
                renderMainBody();
                if ("submission" !== fastInfo.phase && "voting" !== fastInfo.phase) clearInterval(st.timerId);
                return;
            }
            if ("submission" !== fastInfo.phase && "voting" !== fastInfo.phase) { clearInterval(st.timerId); return; }
            const cd = document.getElementById("lce-cd-txt");
            if (cd) cd.textContent = h.fmtTime(fastInfo.remaining);
        }, 1000);
    }
    // ====== نهاية الجزء 2 من 3 ======

    // ====== بداية الجزء 3 من 3 ======
    const BROADCAST_PRESETS = [
        { label: "🔥 انطلاق المشاركة", theme: "gold", text: t => `🔥 باب المشاركة مفتوح الآن في (${t})! ادخل وسجّل حضورك قبل انتهاء الوقت.` },
        { label: "🗳️ بدأ التصويت", theme: "emerald", text: t => `🗳️ بدأ التصويت الرسمي في (${t})! ادخل وصوّت لمن يستحق اللقب.` },
        { label: "⚔️ حماس الفريقين", theme: "maroon", text: t => `⚔️ المواجهة مشتعلة في (${t})! ادخل الآن وادعم فريقك بصوتك وهتافك 🔥` },
        { label: "⏳ آخر ساعة", theme: "red", text: t => `⏳ باقي أقل من ساعة على إغلاق (${t})! سارع بالمشاركة والتصويت الآن.` },
        { label: "⚡ ساعة مضاعفة", theme: "purple", text: t => `⚡ ساعة المضاعفة الذهبية نشطة الآن في (${t})! صوتك يُحسب مضاعفاً 🔥` },
        { label: "🏆 ظهرت النتائج", theme: "gold", text: t => `🏆 أُعلنت نتائج (${t}) رسمياً! ادخل لتهنئة الفائزين.` }
    ];

    const contestsAdmin = {
        injectStyles() {
            if (document.getElementById("lcea-styles")) return;
            const s = document.createElement("style");
            s.id = "lcea-styles";
            s.textContent = `
            .lcea-ov{position:fixed;inset:0;background:rgba(7,9,16,.94);z-index:2147483645;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;opacity:0;transition:opacity .2s}
            @media(min-width:769px){.lcea-ov{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}}
            .lcea-ov.active{opacity:1}
            .lcea-box{background:linear-gradient(180deg,#1a1d34,#0d0f1c);border:1px solid rgba(212,175,55,.45);border-radius:20px;width:96%;max-width:780px;max-height:90vh;max-height:90dvh;padding:14px 16px 16px;box-shadow:0 20px 55px rgba(0,0,0,.88);display:flex;flex-direction:column;overflow:hidden;color:#f8fafc;box-sizing:border-box;contain:layout style}
            .lcea-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:9px;margin-bottom:9px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;gap:8px;flex-wrap:wrap}
            .lcea-title{display:flex;align-items:center;gap:8px;color:#D4AF37;font-weight:900;font-size:15px}
            .lcea-ctx-bar{display:flex;align-items:center;gap:7px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);border-radius:11px;padding:6px 10px;margin-bottom:9px;flex-shrink:0}
            .lcea-ctrl{background:rgba(255,255,255,.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px}
            .lcea-ctrl.x:hover{background:#ef4444}
            .lcea-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:9px;flex-shrink:0}
            .lcea-stat{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 4px;text-align:center}
            .lcea-stat-v{font-size:12.5px;font-weight:800;color:#D4AF37}
            .lcea-stat-l{font-size:10px;color:#94a3b8;margin-top:2px}
            .lcea-tabs{display:flex;height:40px;min-height:40px;background:rgba(0,0,0,.35);border-radius:12px;margin-bottom:10px;overflow-x:auto;scrollbar-width:none;border:1px solid rgba(255,255,255,.05);flex-shrink:0}
            .lcea-tabs::-webkit-scrollbar{display:none}
            .lcea-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 10px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:bold;cursor:pointer;white-space:nowrap}
            .lcea-tab.active{background:rgba(212,175,55,.16);color:#D4AF37;border-bottom:2px solid #D4AF37}
            .lcea-tab.locked{opacity:.42}
            .lcea-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding-left:4px;margin-left:-4px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
            .lcea-body::-webkit-scrollbar{width:5px}
            .lcea-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
            .lcea-view{display:none}.lcea-view.active{display:block}
            .lcea-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;margin-bottom:9px;text-align:right}
            .lcea-ct{font-size:12.5px;font-weight:800;color:#D4AF37;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
            .lcea-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
            .lcea-g2{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
            .lcea-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
            .lcea-g4{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
            .lcea-inp{width:100%;background:rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.12);color:#fff;padding:7.5px 10px;border-radius:10px;font-family:inherit;font-size:12.2px;outline:none;box-sizing:border-box}
            .lcea-inp:focus{border-color:#D4AF37}
            .lcea-inp option{background:#16182c;color:#fff}
            .lcea-lbl{display:block;font-size:10.8px;color:#cbd5e1;font-weight:700;margin-bottom:3px}
            .lcea-btn{border:none;border-radius:10px;padding:8px 10px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:5px}
            .lcea-b-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;width:100%}
            .lcea-b-red{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;width:100%}
            .lcea-b-dark{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.08)}
            .lcea-b-ok{background:rgba(16,185,129,.18);color:#6ee7b7;border:1px solid rgba(16,185,129,.35)}
            .lcea-b-info{background:rgba(56,189,248,.16);color:#7dd3fc;border:1px solid rgba(56,189,248,.3)}
            .lcea-b-warn{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35)}
            .lcea-b-dng{background:rgba(239,68,68,.16);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
            .lcea-mini{padding:5px 8px;font-size:11px;border-radius:8px;width:auto}
            .lcea-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700}
            .lcea-t-gold{background:rgba(212,175,55,.18);color:#D4AF37}
            .lcea-t-green{background:rgba(16,185,129,.16);color:#34d399}
            .lcea-t-red{background:rgba(239,68,68,.18);color:#f87171}
            .lcea-t-blue{background:rgba(56,189,248,.18);color:#38bdf8}
            .lcea-srow{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:7px 11px;margin-bottom:6px;gap:10px}
            .lcea-sw{position:relative;width:40px;height:21px;flex-shrink:0}.lcea-sw input{opacity:0;width:0;height:0}
            .lcea-sl{position:absolute;cursor:pointer;inset:0;background:#334155;border-radius:21px;transition:.2s}
            .lcea-sl:before{content:"";position:absolute;height:15px;width:15px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
            .lcea-sw input:checked+.lcea-sl{background:#10b981}.lcea-sw input:checked+.lcea-sl:before{transform:translateX(-19px)}
            .lcea-bdg{background:#ef4444;color:#fff;font-size:9.5px;font-weight:900;padding:1px 6px;border-radius:12px;margin-right:3px;display:none}
            .lcea-up-box{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.3);border:1px dashed rgba(212,175,55,.35);border-radius:10px;padding:6px 9px}
            .lcea-up-prev{width:34px;height:34px;border-radius:50%;border:1.5px solid #D4AF37;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#D4AF37;font-size:14px;flex-shrink:0;overflow:hidden}
            .lcea-up-prev img{width:100%;height:100%;object-fit:cover;display:block}
            .lcea-preset-chip{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.35);color:#fde68a;border-radius:18px;padding:4.5px 9px;font-size:10.8px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s,color .15s}
            .lcea-preset-chip:hover{background:#D4AF37;color:#111}
            @media(max-width:650px){.lcea-box{width:100%;height:100%;max-height:100%;border-radius:0;border:none;padding:11px 12px}.lcea-g3{grid-template-columns:1fr 1fr}}
            `;
            document.head.appendChild(s);
        },

        isFullAdmin() { return h.isSuperAdmin() || h.isGlobalSubAdmin(); },

        getManagedContestIds() {
            return h.getAllContestIds()
                .filter(id => h.isAdmin(id))
                .sort((a, b) => ((h.getContest(b)?.createdAt || 0) - (h.getContest(a)?.createdAt || 0)));
        },

        ensureSelectedCid(preferred = null) {
            const ids = this.getManagedContestIds();
            if (preferred && ids.includes(preferred)) st.adminCid = preferred;
            else if (!st.adminCid || !ids.includes(st.adminCid)) st.adminCid = ids[0] || null;
            return st.adminCid;
        },

        scheduleRefresh(delayMs = 200) {
            if (!document.getElementById("lce-admin-modal")) return;
            clearTimeout(st.adminRefreshTimer);
            if (delayMs <= 0) { this.refresh(); return; }
            st.adminRefreshTimer = setTimeout(() => this.refresh(), delayMs);
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
            if (!h.canPerm(st.adminCid, "radar")) return showToast("لا تملك صلاحية أوامر الرادار", 3000, "red");
            dbOps.sendCmd(sanUser, cmd, text).then(() => {
                this.log("kick" === cmd ? "إخراج فوري" : "تنبيه خاص", sanUser, text || cmd);
                showToast("kick" === cmd ? "⚡ تم إخراج العضو من المسابقة" : "📩 تم إرسال التنبيه للعضو");
            });
        },

        patchGlobal(part, msg) {
            if (!st.db || !this.isFullAdmin()) return alert("هذا الإعداد للإدارة العليا فقط.");
            st.db.ref(`${ROOT}/global`).update(part).then(() => {
                st.global = Object.assign({}, st.global, part);
                this.log("إعدادات عامة", "النظام", Object.keys(part).join(", "));
                scheduleSyncMenuItems();
                this.refresh();
                if (msg) showToast(msg, 3000, "gold");
            }).catch(() => alert("❌ فشل الحفظ."));
        },

        patchContest(cid, part, msg) {
            if (!st.db || !cid || !h.isAdmin(cid)) return;
            dbOps.patchContest(cid, part).then(() => {
                this.log("تحديث مسابقة", h.getContest(cid)?.title || cid, Object.keys(part).join(", "));
                if (msg) showToast(msg, 3000, "gold");
            }).catch(() => alert("❌ فشل التحديث."));
        },

        patchContestCfg(cid, part, msg) {
            if (!st.db || !cid || !h.isAdmin(cid)) return;
            dbOps.patchContestCfg(cid, part).then(() => {
                this.log("إعدادات مسابقة", h.getContest(cid)?.title || cid, Object.keys(part).join(", "));
                if (msg) showToast(msg, 3000, "gold");
            }).catch(() => alert("❌ فشل حفظ الإعدادات."));
        },

        exportResultsCSV(cid) {
            const c = h.getContest(cid);
            if (!c) return;
            const counts = computeVoteCounts(st.data.entries, st.data.votes);
            const list = getApprovedEntries(st.data.entries).sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
            if (!list.length) return showToast("لا توجد بيانات للتصدير", 2800, "red");
            const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
            const rows = [["الترتيب", "الاسم", "اسم المستخدم", "الشريك", "الفئة", "الأصوات", "فائز", "الحالة", "النص", "وقت المشاركة"].map(q).join(",")];
            list.forEach((e, i) => {
                rows.push([
                    i + 1, e.displayName || e.username, e.username, e.partnerName || "",
                    "cat2" === e.category ? (c.cat2Label || "فئة 2") : (c.cat1Label || "فئة 1"),
                    counts[e.key] || 0, e.isWinner ? "نعم" : "لا", e.status || "approved",
                    e.text || e.title || "", h.fmtDate(e.joinedAt)
                ].map(q).join(","));
            });
            const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url; a.download = `layl-results-${cid}-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast("📊 تم تصدير جدول النتائج (CSV) بنجاح!", 3200, "gold");
        },

        openEditEntry(cid, key) {
            if (!h.canPerm(cid, "entries")) return showToast("لا تملك صلاحية تعديل المشاركات", 3000, "red");
            const c = h.getContest(cid), it = st.data.entries?.[key];
            if (!c || !it || !st.db) return;
            document.getElementById("lce-edit-entry-sub")?.remove();
            const isPhoto = "photo" === c.template, isTeams = "teams" === c.template;
            const isDual = "dual" === c.mode && !isTeams, isDuo = "duo" === c.template, isMedia = "media" === c.template;
            let editMedia = isPhoto ? (it.image || "") : (it.avatar || "");
            const ov = document.createElement("div");
            ov.id = "lce-edit-entry-sub";
            ov.className = "lce-subov";
            ov.innerHTML = `
                <div class="lce-subbox" style="max-width:460px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px;margin-bottom:13px;">
                        <b style="color:#D4AF37;font-size:1rem;"><i class="fas fa-user-edit"></i> ${isTeams ? "تعديل بيانات الفريق" : "تعديل المشاركة"}</b>
                        <button type="button" class="lce-ibtn sq x" id="lce-ee-x"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:9px;margin-bottom:13px;">
                        <div id="lce-ee-prev" style="width:${isPhoto ? "140px" : "84px"};height:${isPhoto ? "92px" : "84px"};border-radius:${isPhoto ? "12px" : "50%"};border:2px solid #D4AF37;background:#1e293b;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:30px;color:#D4AF37;">
                            ${h.isValidImg(editMedia) ? `<img src="${h.esc(editMedia)}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fas ${h.esc(c.icon || "fa-crown")}"></i>`}
                        </div>
                        <input type="file" id="lce-ee-file" accept="image/*" style="display:none;">
                        <div style="display:flex;gap:7px;">
                            <button type="button" id="lce-ee-pick" class="lcea-btn lcea-b-info lcea-mini"><i class="fas fa-images"></i> تغيير الصورة</button>
                            <button type="button" id="lce-ee-rmav" class="lcea-btn lcea-b-dng lcea-mini" style="${h.isValidImg(editMedia) ? "" : "display:none;"}"><i class="fas fa-trash"></i> إزالة</button>
                        </div>
                    </div>
                    <div style="margin-bottom:9px;"><label class="lcea-lbl">${isTeams ? "اسم الفريق" : "الاسم الظاهر / عنوان الخيار"}</label><input id="lce-ee-name" class="lcea-inp" maxlength="55" value="${h.esc(it.displayName || it.username)}"></div>
                    ${isDuo ? `<div style="margin-bottom:9px;"><label class="lcea-lbl">اسم الشريك (الثنائي)</label><input id="lce-ee-partner" class="lcea-inp" maxlength="45" value="${h.esc(it.partnerName || "")}"></div>` : ""}
                    ${isMedia ? `<div style="margin-bottom:9px;"><label class="lcea-lbl">رابط أو معرف يوتيوب</label><input id="lce-ee-yt" class="lcea-inp" dir="ltr" value="${h.esc(it.ytId || "")}"></div>` : ""}
                    ${("talent" === c.template || isMedia) ? `<div style="margin-bottom:9px;"><label class="lcea-lbl">عنوان الموهبة / الأغنية</label><input id="lce-ee-title" class="lcea-inp" maxlength="70" value="${h.esc(it.title || "")}"></div>` : ""}
                    <div style="margin-bottom:9px;"><label class="lcea-lbl">${isTeams ? "شعار الفريق (اختياري)" : "النص / الشعار / الإجابة"}</label><textarea id="lce-ee-text" class="lcea-inp" rows="3" maxlength="550">${h.esc(it.text || "")}</textarea></div>
                    <div class="lcea-g2" style="margin-bottom:13px;">
                        ${isDual ? `<div><label class="lcea-lbl">الفئة</label><select id="lce-ee-cat" class="lcea-inp"><option value="cat1" ${"cat2" !== it.category ? "selected" : ""}>${h.esc(c.cat1Icon || "👑")} ${h.esc(c.cat1Label || "الفئة 1")}</option><option value="cat2" ${"cat2" === it.category ? "selected" : ""}>${h.esc(c.cat2Icon || "👸")} ${h.esc(c.cat2Label || "الفئة 2")}</option></select></div>` : `<div><label class="lcea-lbl">الحالة</label><select id="lce-ee-st" class="lcea-inp"><option value="approved" ${"pending" !== it.status ? "selected" : ""}>✅ معتمد</option><option value="pending" ${"pending" === it.status ? "selected" : ""}>⏳ معلق</option></select></div>`}
                        <div><label class="lcea-lbl">شارة التمييز (اختياري)</label><input id="lce-ee-badge" class="lcea-inp" maxlength="25" value="${h.esc(it.badge || "")}" placeholder="مثلاً: مرشح مميز"></div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button type="button" id="lce-ee-save" class="lcea-btn lcea-b-gold" style="flex:1;"><i class="fas fa-save"></i> حفظ التعديلات</button>
                        <button type="button" id="lce-ee-cancel" class="lcea-btn lcea-b-dark" style="padding:8px 14px;">إلغاء</button>
                    </div>
                </div>`;
            document.body.appendChild(ov);
            const close = () => ov.remove();
            ov.onclick = e => { if (e.target === ov) close(); };
            document.getElementById("lce-ee-x").onclick = close;
            document.getElementById("lce-ee-cancel").onclick = close;

            const fInp = document.getElementById("lce-ee-file"), prev = document.getElementById("lce-ee-prev"), rmBtn = document.getElementById("lce-ee-rmav");
            const syncPrev = () => {
                if (h.isValidImg(editMedia)) { prev.innerHTML = `<img src="${h.esc(editMedia)}" style="width:100%;height:100%;object-fit:cover;">`; rmBtn.style.display = "inline-flex"; }
                else { prev.innerHTML = `<i class="fas ${h.esc(c.icon || "fa-crown")}"></i>`; rmBtn.style.display = "none"; }
            };
            document.getElementById("lce-ee-pick").onclick = () => fInp.click();
            fInp.onchange = ev => {
                const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                h.compressImg(file, isPhoto ? "photo" : "avatar").then(data => { editMedia = data; syncPrev(); showToast("📷 تم تجهيز الصورة"); }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
            };
            rmBtn.onclick = () => { editMedia = ""; syncPrev(); };

            document.getElementById("lce-ee-save").onclick = () => {
                const newName = document.getElementById("lce-ee-name").value.trim() || it.username;
                const up = {
                    displayName: newName,
                    title: document.getElementById("lce-ee-title")?.value?.trim().slice(0, 70) || it.title || "",
                    text: document.getElementById("lce-ee-text").value.trim().slice(0, 550),
                    badge: document.getElementById("lce-ee-badge").value.trim().slice(0, 25)
                };
                if (isDuo) up.partnerName = document.getElementById("lce-ee-partner")?.value?.trim() || it.partnerName || "";
                if (isMedia) {
                    const yv = document.getElementById("lce-ee-yt")?.value?.trim() || "";
                    const parsed = h.parseYtId(yv);
                    if (parsed) up.ytId = parsed;
                }
                if (isPhoto) up.image = editMedia; else up.avatar = editMedia;
                if (isDual) up.category = document.getElementById("lce-ee-cat").value;
                else if (document.getElementById("lce-ee-st")) up.status = document.getElementById("lce-ee-st").value;
                if (newName !== (it.displayName || it.username)) up.html = h.esc(newName);
                dbOps.updateEntry(cid, key, up).then(() => {
                    if (isTeams) {
                        if ("team1" === key) this.patchContest(cid, { cat1Label: newName });
                        else if ("team2" === key) this.patchContest(cid, { cat2Label: newName });
                    }
                    this.log("تعديل مشاركة", c.title, newName);
                    close();
                    showToast("✅ تم حفظ التعديلات", 3000, "gold");
                }).catch(() => alert("❌ فشل الحفظ."));
            };
        },

        open(preselectCid = null) {
            if (!h.isAdmin()) return alert("هذه اللوحة متاحة للإدارة فقط.");
            ensureBaseStyles();
            this.injectStyles();
            this.ensureSelectedCid(preselectCid);
            if (preselectCid) st.adminTab = "control";
            document.getElementById("lce-admin-modal")?.remove();

            const fullAdm = this.isFullAdmin();
            const ov = document.createElement("div");
            ov.id = "lce-admin-modal";
            ov.className = "lcea-ov";
            ov.innerHTML = `
            <div class="lcea-box">
                <div class="lcea-head">
                    <div class="lcea-title"><i class="fas fa-crown"></i> استوديو إدارة مسابقات شات ليل الشامل</div>
                    <div class="lcea-row" style="gap:6px;">
                        <button type="button" class="lcea-ctrl" id="lcea-open-app" title="فتح المسابقة الحالية"><i class="fas fa-external-link-alt"></i></button>
                        <button type="button" class="lcea-ctrl" id="lcea-ref" title="تحديث"><i class="fas fa-sync-alt"></i></button>
                        <button type="button" class="lcea-ctrl x" id="lcea-close" title="إغلاق"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="lcea-ctx-bar">
                    <span style="font-size:11.5px;font-weight:800;color:#fde68a;white-space:nowrap;"><i class="fas fa-trophy"></i> المسابقة المحددة:</span>
                    <select id="lcea-cid-sel" class="lcea-inp" style="flex:1;padding:5.5px 9px;"></select>
                </div>
                <div class="lcea-stats">
                    <div class="lcea-stat"><div class="lcea-stat-v" id="lcea-st-ph">...</div><div class="lcea-stat-l">المرحلة</div></div>
                    <div class="lcea-stat"><div class="lcea-stat-v" id="lcea-st-en">0</div><div class="lcea-stat-l">المشاركات</div></div>
                    <div class="lcea-stat"><div class="lcea-stat-v" id="lcea-st-vt">0</div><div class="lcea-stat-l">الأصوات</div></div>
                    <div class="lcea-stat"><div class="lcea-stat-v" id="lcea-st-on">0</div><div class="lcea-stat-l">متواجدون الآن</div></div>
                </div>
                <div class="lcea-tabs">
                    <button type="button" class="lcea-tab" data-atab="contests"><i class="fas fa-plus-circle"></i> المسابقات</button>
                    <button type="button" class="lcea-tab" data-atab="control" data-perm="control"><i class="fas fa-sliders-h"></i> التحكم</button>
                    <button type="button" class="lcea-tab" data-atab="entries" data-perm="entries"><i class="fas fa-users"></i> المشاركات <span id="lcea-pbdg" class="lcea-bdg">0</span></button>
                    <button type="button" class="lcea-tab" data-atab="votes" data-perm="votes"><i class="fas fa-vote-yea"></i> الأصوات <span id="lcea-tbdg" class="lcea-bdg">0</span></button>
                    <button type="button" class="lcea-tab" data-atab="radar" data-perm="radar"><i class="fas fa-eye"></i> الرادار والحظر</button>
                    <button type="button" class="lcea-tab" data-atab="prizes" data-perm="prizes"><i class="fas fa-gift"></i> الجوائز</button>
                    <button type="button" class="lcea-tab" data-atab="settings"><i class="fas fa-cog"></i> الصلاحيات</button>
                    <button type="button" class="lcea-tab" data-atab="analytics"><i class="fas fa-chart-bar"></i> التحليلات والسجل</button>
                </div>
                <div class="lcea-body">
                    <!-- 1. إدارة وإنشاء المسابقات -->
                    <div id="lcea-v-contests" class="lcea-view">
                        ${fullAdm ? `
                        <div class="lcea-card" style="border-color:rgba(212,175,55,.45);">
                            <div class="lcea-ct"><span><i class="fas fa-magic"></i> إنشاء مسابقة جديدة (14 قالب جاهز أو تخصيص كامل)</span></div>
                            <div class="lcea-row" style="margin-bottom:9px;gap:5px;">
                                ${PRESETS.map(p => `<button type="button" class="lcea-preset-chip" data-preset="${p.key}">${p.label}</button>`).join("")}
                            </div>
                            <div class="lcea-g2" style="margin-bottom:6px;">
                                <div><label class="lcea-lbl">اسم المسابقة *</label><input id="lcea-cr-title" class="lcea-inp" value="مسابقة ملك وملكة شات ليل"></div>
                                <div><label class="lcea-lbl">نظام المسابقة (11 نظاماً)</label><select id="lcea-cr-tmpl" class="lcea-inp">${Object.values(TEMPLATES).map(t => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
                            </div>
                            <div style="margin-bottom:6px;"><label class="lcea-lbl">وصف مختصر للمسابقة</label><input id="lcea-cr-sub" class="lcea-inp" placeholder="اشرح فكرة المسابقة بسطر جذاب..."></div>
                            <div class="lcea-g3" style="margin-bottom:6px;">
                                <div><label class="lcea-lbl">ثيم الألوان</label><select id="lcea-cr-theme" class="lcea-inp">${Object.values(THEMES).map(t => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
                                <div><label class="lcea-lbl">الأيقونة (FontAwesome)</label><input id="lcea-cr-ico" class="lcea-inp" dir="ltr" value="fa-crown"></div>
                                <div><label class="lcea-lbl">نظام الفئات</label><select id="lcea-cr-mode" class="lcea-inp"><option value="single">فئة واحدة</option><option value="dual">فئتان (مثلاً ملك + ملكة)</option></select></div>
                            </div>
                            <div id="lcea-cr-cats" class="lcea-g2" style="margin-bottom:6px;display:none;">
                                <div><label class="lcea-lbl" id="lcea-cr-c1-lbl">مسمى الفئة الأولى</label><input id="lcea-cr-c1" class="lcea-inp" value="ملك الشات"></div>
                                <div><label class="lcea-lbl" id="lcea-cr-c2-lbl">مسمى الفئة الثانية</label><input id="lcea-cr-c2" class="lcea-inp" value="ملكة الشات"></div>
                            </div>
                            <div id="lcea-cr-quiz-box" style="display:none;margin-bottom:6px;">
                                <div style="margin-bottom:6px;"><label class="lcea-lbl">السؤال / اللغز / وصف الكود السري</label><textarea id="lcea-cr-qprompt" class="lcea-inp" rows="2" placeholder="اكتب السؤال أو اللغز هنا..."></textarea></div>
                                <div><label class="lcea-lbl">الإجابة الصحيحة (يمكن وضع أكثر من صيغة مفصولة بـ |)</label><input id="lcea-cr-qans" class="lcea-inp" placeholder="مثلاً: ليل|شات ليل|layl"></div>
                            </div>
                            <div class="lcea-g3" style="margin-bottom:7px;">
                                <div><label class="lcea-lbl">مدة التقديم/التسجيل (ساعة)</label><input type="number" id="lcea-cr-nomh" class="lcea-inp" value="48" min="0" max="720"></div>
                                <div><label class="lcea-lbl">مدة التصويت (ساعة)</label><input type="number" id="lcea-cr-voth" class="lcea-inp" value="72" min="0" max="720"></div>
                                <div><label class="lcea-lbl">عدد الفائزين (للسحب/اللغز)</label><input type="number" id="lcea-cr-maxw" class="lcea-inp" value="1" min="1" max="20"></div>
                            </div>
                            <div class="lcea-g2" style="margin-bottom:8px;">
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11.5px;font-weight:bold;">🎭 تصويت أعمى (إخفاء الأسماء)</span><label class="lcea-sw"><input type="checkbox" id="lcea-cr-blind"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11.5px;font-weight:bold;">🔒 إخفاء عداد الأصوات</span><label class="lcea-sw"><input type="checkbox" id="lcea-cr-hide"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11.5px;font-weight:bold;">📌 إظهار زر مستقل بالقائمة</span><label class="lcea-sw"><input type="checkbox" id="lcea-cr-menu" checked><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11.5px;font-weight:bold;">✨ تثبيت بتوهج أعلى القائمة</span><label class="lcea-sw"><input type="checkbox" id="lcea-cr-pin" checked><span class="lcea-sl"></span></label></div>
                            </div>
                            <button type="button" id="lcea-create-go" class="lcea-btn lcea-b-gold"><i class="fas fa-rocket"></i> إنشاء ونشر المسابقة فوراً للجميع</button>
                        </div>` : ""}
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-layer-group"></i> جميع المسابقات في النظام</span></div>
                            <div id="lcea-contests-list"></div>
                        </div>
                    </div>

                    <!-- 2. التحكم والمراحل -->
                    <div id="lcea-v-control" class="lcea-view">
                        <div id="lcea-special-act" style="margin-bottom:8px;display:none;"></div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-clock"></i> التحكم الدقيق بالوقت والمراحل</span><span id="lcea-cur-cd" class="lcea-tag lcea-t-gold" dir="ltr">--:--:--</span></div>
                            <div class="lcea-g4" style="margin-bottom:7px;">
                                <button type="button" class="lcea-btn lcea-b-info lcea-time-adj" data-h="1">+1 س</button>
                                <button type="button" class="lcea-btn lcea-b-info lcea-time-adj" data-h="6">+6 س</button>
                                <button type="button" class="lcea-btn lcea-b-info lcea-time-adj" data-h="24">+24 س</button>
                                <button type="button" class="lcea-btn lcea-b-warn lcea-time-adj" data-h="-1">-1 س</button>
                            </div>
                            <div class="lcea-g2" style="margin-bottom:7px;">
                                <button type="button" id="lcea-pause-btn" class="lcea-btn lcea-b-warn"><i class="fas fa-pause"></i> إيقاف مؤقت / استئناف</button>
                                <button type="button" id="lcea-tog-mode" class="lcea-btn lcea-b-dark"><i class="fas fa-exchange-alt"></i> تبديل (فئة / فئتين)</button>
                                <button type="button" id="lcea-go-sub" class="lcea-btn lcea-b-dark"><i class="fas fa-undo"></i> إعادة لمرحلة التقديم (+24س)</button>
                                <button type="button" id="lcea-skip-sub" class="lcea-btn lcea-b-ok"><i class="fas fa-forward"></i> بدء التصويت / الفرز الآن</button>
                                <button type="button" id="lcea-skip-vote" class="lcea-btn lcea-b-ok"><i class="fas fa-flag-checkered"></i> إعلان النتائج الآن</button>
                                <button type="button" id="lcea-save-hof" class="lcea-btn lcea-b-gold"><i class="fas fa-trophy"></i> تخليد الفائز بقاعة الشرف</button>
                            </div>
                            <div class="lcea-g2">
                                <button type="button" id="lcea-new-season" class="lcea-btn lcea-b-info"><i class="fas fa-redo"></i> إطلاق موسم جديد (تصفير)</button>
                                <button type="button" id="lcea-archive-c" class="lcea-btn lcea-b-dng"><i class="fas fa-archive"></i> أرشفة وإخفاء الزر</button>
                            </div>
                        </div>

                        <div class="lcea-card" style="border-color:rgba(251,191,36,.4);">
                            <div class="lcea-ct"><span><i class="fas fa-bolt"></i> ساعة المضاعفة الذهبية (الأصوات)</span><span id="lcea-mult-tag" class="lcea-tag lcea-t-gold">×1 عادي</span></div>
                            <div class="lcea-g3">
                                <button type="button" class="lcea-btn lcea-b-dark lcea-set-mult" data-m="1">×1 عادي</button>
                                <button type="button" class="lcea-btn lcea-b-warn lcea-set-mult" data-m="2">🔥 ×2 مضاعف</button>
                                <button type="button" class="lcea-btn lcea-b-red lcea-set-mult" data-m="3">⚡ ×3 ثلاثي</button>
                            </div>
                        </div>

                        <div class="lcea-card" style="border-color:rgba(239,68,68,.35);">
                            <div class="lcea-ct" style="color:#fca5a5;"><span><i class="fas fa-bullhorn"></i> بث توست فوري لجميع المتواجدين بالشات</span></div>
                            <div class="lcea-row" style="margin-bottom:7px;gap:4px;">
                                ${BROADCAST_PRESETS.map((bp, i) => `<button type="button" class="lcea-preset-chip lcea-bc-pre" data-bi="${i}">${bp.label}</button>`).join("")}
                            </div>
                            <div class="lcea-row">
                                <input id="lcea-bc-inp" class="lcea-inp" style="flex:1;" placeholder="مثلاً: 🔥 بدأت ساعة التصويت المضاعف ×2 الآن!">
                                <select id="lcea-bc-th" class="lcea-inp" style="width:86px;"><option value="gold">ذهبي</option><option value="red">عاجل</option><option value="maroon">عنابي</option><option value="purple">ملكي</option><option value="emerald">زمردي</option></select>
                                <button type="button" id="lcea-bc-send" class="lcea-btn lcea-b-red lcea-mini" style="padding:8px 13px;"><i class="fas fa-paper-plane"></i> بث</button>
                            </div>
                        </div>

                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-ribbon"></i> شريط الإعلان الدائم بأعلى المسابقة</span></div>
                            <div class="lcea-row">
                                <input id="lcea-ban-txt" class="lcea-inp" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                                <select id="lcea-ban-th" class="lcea-inp" style="width:86px;"><option value="gold">ذهبي</option><option value="red">أحمر</option><option value="blue">أزرق</option></select>
                                <button type="button" id="lcea-ban-save" class="lcea-btn lcea-b-gold lcea-mini" style="padding:8px 13px;">حفظ</button>
                            </div>
                        </div>
                    </div>

                    <!-- 3. المشاركات / المرشحون / خيارات الاستفتاء / الفريقان -->
                    <div id="lcea-v-entries" class="lcea-view">
                        <div class="lcea-card">
                            <div class="lcea-ct">
                                <span><i class="fas fa-user-plus"></i> إضافة مشاركة / مرشح / خيار استفتاء يدوياً</span>
                                <button type="button" id="lcea-app-all" class="lcea-btn lcea-b-ok lcea-mini">اعتماد كل المعلّقين ✓</button>
                            </div>
                            <div class="lcea-g2" style="margin-bottom:6px;">
                                <input id="lcea-me-u" class="lcea-inp" placeholder="اسم المستخدم أو عنوان الخيار *">
                                <select id="lcea-me-cat" class="lcea-inp"><option value="cat1">الفئة الأولى</option><option value="cat2">الفئة الثانية</option></select>
                            </div>
                            <div id="lcea-me-extra" style="display:none;margin-bottom:6px;">
                                <input id="lcea-me-extra-inp" class="lcea-inp" placeholder="">
                            </div>
                            <input id="lcea-me-t" class="lcea-inp" style="margin-bottom:7px;" maxlength="550" placeholder="الشعار / الوصف / النص (اختياري)">
                            <div class="lcea-up-box" style="margin-bottom:8px;">
                                <div class="lcea-up-prev" id="lcea-me-prev"><i class="fas fa-camera"></i></div>
                                <div style="flex:1;font-size:11px;color:#94a3b8;" id="lcea-me-lbl">صورة من الأستوديو (اختياري)</div>
                                <input type="file" id="lcea-me-file" accept="image/*" style="display:none;">
                                <button type="button" id="lcea-me-pick" class="lcea-btn lcea-b-info lcea-mini"><i class="fas fa-images"></i> الأستوديو</button>
                                <button type="button" id="lcea-me-clr" class="lcea-btn lcea-b-dng lcea-mini" style="display:none;"><i class="fas fa-times"></i></button>
                            </div>
                            <button type="button" id="lcea-me-add" class="lcea-btn lcea-b-ok" style="width:100%;">إضافة واعتماد فوري</button>
                        </div>
                        <input id="lcea-eq" class="lcea-inp" style="margin-bottom:8px;" placeholder="🔍 ابحث في المشاركات بالاسم أو النص...">
                        <div id="lcea-entries-list"></div>
                    </div>

                    <!-- 4. الأصوات وطلبات تحويل الأصوات ومكافحة التلاعب -->
                    <div id="lcea-v-votes" class="lcea-view">
                        <div class="lcea-card" style="border-color:rgba(212,175,55,.45);">
                            <div class="lcea-ct">
                                <span><i class="fas fa-exchange-alt"></i> طلبات الانسحاب وتحويل الأصوات (بانتظار الموافقة)</span>
                                <span id="lcea-tr-cnt" class="lcea-tag lcea-t-gold">0</span>
                            </div>
                            <div id="lcea-tr-list"></div>
                        </div>
                        <div class="lcea-card" style="border-color:rgba(245,158,11,.35);">
                            <div class="lcea-ct"><span><i class="fas fa-shield-alt"></i> أدوات مكافحة التلاعب السريعة</span></div>
                            <div class="lcea-g3">
                                <button type="button" id="lcea-rev-10m" class="lcea-btn lcea-b-warn">سحب آخر 10 د</button>
                                <button type="button" id="lcea-rev-entry" class="lcea-btn lcea-b-dng">تصفير أصوات مشارك</button>
                                <button type="button" id="lcea-wipe-votes" class="lcea-btn lcea-b-red">تصفير كل الأصوات</button>
                            </div>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-search"></i> سجل الأصوات التفصيلي</span></div>
                            <input id="lcea-vq" class="lcea-inp" style="margin-bottom:8px;" placeholder="ابحث باسم المصوّت أو المشارك أو الهتاف...">
                            <div id="lcea-votes-list"></div>
                        </div>
                    </div>

                    <!-- 5. الرادار والحظر -->
                    <div id="lcea-v-radar" class="lcea-view">
                        <div class="lcea-card" style="border-color:rgba(16,185,129,.35);">
                            <div class="lcea-ct" style="color:#6ee7b7;">
                                <span><i class="fas fa-eye"></i> المتواجدون داخل هذه المسابقة الآن</span>
                                <button type="button" id="lcea-clr-pres" class="lcea-btn lcea-b-dark lcea-mini">تنظيف الرادار</button>
                            </div>
                            <div id="lcea-pres-list"></div>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct">
                                <span><i class="fas fa-ban"></i> حظر عضو (مؤقت أو دائم)</span>
                                <button type="button" id="lcea-cln-bans" class="lcea-btn lcea-b-ok lcea-mini">تنظيف المنتهي</button>
                            </div>
                            <div class="lcea-g3" style="margin-bottom:6px;">
                                <input id="lcea-bu" class="lcea-inp" placeholder="اسم المستخدم *">
                                <select id="lcea-bs" class="lcea-inp"><option value="all">حظر كامل</option><option value="nom">منع المشاركة فقط</option><option value="vote">منع التصويت فقط</option></select>
                                <select id="lcea-bc" class="lcea-inp"><option value="all">جميع المسابقات</option><option value="current">هذه المسابقة فقط</option></select>
                            </div>
                            <div class="lcea-g2" style="margin-bottom:7px;">
                                <select id="lcea-bd" class="lcea-inp"><option value="perm">دائم</option><option value="1h">ساعة</option><option value="6h">6 ساعات</option><option value="24h">24 ساعة</option><option value="3d">3 أيام</option><option value="7d">أسبوع</option></select>
                                <input id="lcea-br" class="lcea-inp" placeholder="السبب (اختياري)">
                            </div>
                            <button type="button" id="lcea-bgo" class="lcea-btn lcea-b-red">تنفيذ الحظر</button>
                        </div>
                        <div id="lcea-bans-list"></div>
                    </div>

                    <!-- 6. الجوائز والقوانين والترحيب -->
                    <div id="lcea-v-prizes" class="lcea-view">
                        <div class="lcea-card">
                            <div class="lcea-ct">
                                <span><i class="fas fa-gift"></i> جوائز المسابقة المحددة</span>
                                <button type="button" id="lcea-pz-reset" class="lcea-btn lcea-b-warn lcea-mini">استعادة الافتراضية</button>
                            </div>
                            <div id="lcea-pz-list" style="margin-bottom:8px;"></div>
                            <div class="lcea-g3" style="margin-bottom:6px;">
                                <input id="lcea-np-t" class="lcea-inp" placeholder="عنوان الجائزة *">
                                <input id="lcea-np-d" class="lcea-inp" placeholder="المدة (مثلاً: أسبوع)">
                                <input id="lcea-np-i" class="lcea-inp" dir="ltr" value="fa-crown" placeholder="أيقونة">
                            </div>
                            <button type="button" id="lcea-np-add" class="lcea-btn lcea-b-ok" style="width:100%;">+ إضافة جائزة</button>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-gavel"></i> ضوابط وقوانين المسابقة</span></div>
                            <textarea id="lcea-rules-ta" class="lcea-inp" rows="4" style="margin-bottom:7px;"></textarea>
                            <button type="button" id="lcea-rules-save" class="lcea-btn lcea-b-gold">حفظ القوانين</button>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-comment-alt"></i> رسالة الترحيب المنبثقة عند فتح المسابقة</span></div>
                            <textarea id="lcea-welc-ta" class="lcea-inp" rows="2" style="margin-bottom:7px;" placeholder="تظهر مرة واحدة لكل عضو..."></textarea>
                            <div class="lcea-row">
                                <button type="button" id="lcea-welc-save" class="lcea-btn lcea-b-ok" style="flex:1;">حفظ وإظهار للجميع</button>
                                <button type="button" id="lcea-welc-off" class="lcea-btn lcea-b-dng lcea-mini">تعطيل</button>
                            </div>
                        </div>
                    </div>

                    <!-- 7. الصلاحيات والإعدادات -->
                    <div id="lcea-v-settings" class="lcea-view">
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-sliders-h"></i> إعدادات المسابقة المحددة</span></div>
                            <div class="lcea-g2" style="margin-bottom:7px;">
                                <div><label class="lcea-lbl">عنوان المسابقة</label><input id="lcea-cs-title" class="lcea-inp"></div>
                                <div><label class="lcea-lbl">الثيم اللوني</label><select id="lcea-cs-theme" class="lcea-inp">${Object.values(THEMES).map(t => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
                            </div>
                            <div id="lcea-cs-quiz-wrap" style="display:none;margin-bottom:7px;">
                                <div style="margin-bottom:6px;"><label class="lcea-lbl">نص السؤال / اللغز</label><input id="lcea-cs-qprompt" class="lcea-inp"></div>
                                <div class="lcea-g2">
                                    <div><label class="lcea-lbl">الإجابة المعتمدة (افصل بـ |)</label><input id="lcea-cs-qans" class="lcea-inp"></div>
                                    <div><label class="lcea-lbl">عدد الفائزين المطلوب</label><input type="number" id="lcea-cs-maxw" class="lcea-inp" min="1" max="20"></div>
                                </div>
                            </div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">تفعيل هذه المسابقة للأعضاء</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-en"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">إظهار زر مستقل لها في قائمة الإضافات</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-menu"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">تثبيت الزر بتوهج بأعلى القائمة</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-pin"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">✏️ السماح للعضو بتعديل مشاركته قبل التصويت</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-edit"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">🔄 السماح بطلب الانسحاب وتحويل الأصوات (بموافقة الإدارة)</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-tr"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">🎭 التصويت الأعمى (إخفاء أسماء المشاركين)</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-blind"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">🔒 التصويت السري (إخفاء عداد الأصوات)</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-hide"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">مراجعة الإدارة قبل اعتماد المشاركة الجديدة</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-app"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">السماح بالتصويت للنفس</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-self"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">السماح بتغيير الصوت قبل انتهاء الوقت</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-chg"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">السماح للضيوف بالتصويت</div><label class="lcea-sw"><input type="checkbox" id="lcea-cs-gst"><span class="lcea-sl"></span></label></div>
                            <div style="margin-bottom:8px;"><label class="lcea-lbl">أقصى عدد مشاركات (0 = مفتوح)</label><input type="number" id="lcea-cs-max" class="lcea-inp" min="0" max="500"></div>
                            <button type="button" id="lcea-cs-save" class="lcea-btn lcea-b-gold"><i class="fas fa-save"></i> حفظ إعدادات المسابقة</button>
                        </div>

                        <div class="lcea-card" style="border-color:rgba(168,85,247,.35);">
                            <div class="lcea-ct" style="color:#e9d5ff;"><span><i class="fas fa-user-shield"></i> مديرو هذه المسابقة وصلاحياتهم المحددة</span></div>
                            ${fullAdm ? `
                            <div class="lcea-row" style="margin-bottom:7px;">
                                <input id="lcea-mgr-inp" class="lcea-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                <button type="button" id="lcea-mgr-add" class="lcea-btn lcea-b-info lcea-mini" style="padding:8px 13px;">تعيين مدير</button>
                            </div>` : ""}
                            <div id="lcea-mgr-list" style="margin-bottom:9px;"></div>
                            ${fullAdm ? `
                            <div style="font-size:11px;color:#cbd5e1;font-weight:800;margin-bottom:6px;">صلاحيات مديري هذه المسابقة:</div>
                            <div class="lcea-g2" style="margin-bottom:7px;">
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">التحكم بالمراحل والوقت</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-control"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">اعتماد وتعديل المشاركات</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-entries"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">إدارة الأصوات والتحويلات</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-votes"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">الرادار والحظر والطرد</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-radar"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">تعديل الجوائز والقوانين</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-prizes"><span class="lcea-sl"></span></label></div>
                                <div class="lcea-srow" style="margin:0;"><span style="font-size:11px;">إرسال بث فوري للشات</span><label class="lcea-sw"><input type="checkbox" id="lcea-mp-broadcast"><span class="lcea-sl"></span></label></div>
                            </div>
                            <button type="button" id="lcea-mp-save" class="lcea-btn lcea-b-info" style="width:100%;">حفظ صلاحيات المديرين</button>` : ""}
                        </div>

                        ${fullAdm ? `
                        <div class="lcea-card" style="border-color:rgba(212,175,55,.4);">
                            <div class="lcea-ct"><span><i class="fas fa-globe"></i> إعدادات نظام المسابقات العامة</span></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">تفعيل نظام المسابقات بالكامل</div><label class="lcea-sw"><input type="checkbox" id="lcea-gs-en"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">إظهار زر «مركز المسابقات» بالقائمة (اختياري)</div><label class="lcea-sw"><input type="checkbox" id="lcea-gs-hub"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-srow"><div style="font-size:12px;font-weight:bold;">إظهار التوست الإعلاني عند تغيّر المراحل</div><label class="lcea-sw"><input type="checkbox" id="lcea-gs-ad"><span class="lcea-sl"></span></label></div>
                            <div class="lcea-g3" style="margin-bottom:8px;">
                                <div><label class="lcea-lbl">اسم مركز المسابقات</label><input id="lcea-gs-htitle" class="lcea-inp"></div>
                                <div><label class="lcea-lbl">قوة صوت / فرص VIP</label><select id="lcea-gs-vipw" class="lcea-inp"><option value="1">×1</option><option value="2">×2 مضاعف</option><option value="3">×3 ثلاثي</option></select></div>
                                <div><label class="lcea-lbl">رسالة الصيانة</label><input id="lcea-gs-msg" class="lcea-inp"></div>
                            </div>
                            <button type="button" id="lcea-gs-save" class="lcea-btn lcea-b-gold"><i class="fas fa-save"></i> حفظ الإعدادات العامة</button>
                        </div>

                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-star"></i> مصوّتو VIP (صوت مضاعف + فرص سحب + تجاوز الصيانة)</span></div>
                            <div class="lcea-row" style="margin-bottom:7px;">
                                <input id="lcea-vip-inp" class="lcea-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                <button type="button" id="lcea-vip-add" class="lcea-btn lcea-b-gold lcea-mini" style="padding:8px 13px;">إضافة VIP</button>
                            </div>
                            <div id="lcea-vip-list"></div>
                        </div>

                        <div class="lcea-card" style="border-color:rgba(56,189,248,.3);">
                            <div class="lcea-ct" style="color:#7dd3fc;"><span><i class="fas fa-user-tie"></i> المشرفون المساعدون العامون (يديرون كل المسابقات)</span></div>
                            <div class="lcea-row" style="margin-bottom:7px;">
                                <input id="lcea-sa-inp" class="lcea-inp" style="flex:1;" placeholder="اسم المستخدم...">
                                <button type="button" id="lcea-sa-add" class="lcea-btn lcea-b-info lcea-mini" style="padding:8px 13px;">إضافة مشرف</button>
                            </div>
                            <div id="lcea-sa-list"></div>
                        </div>

                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-database"></i> النسخ الاحتياطي الشامل</span></div>
                            <div class="lcea-g2">
                                <button type="button" id="lcea-exp" class="lcea-btn lcea-b-info"><i class="fas fa-download"></i> تصدير المسابقة JSON</button>
                                <button type="button" id="lcea-imp" class="lcea-btn lcea-b-ok"><i class="fas fa-upload"></i> استيراد JSON</button>
                            </div>
                            <input type="file" id="lcea-imp-file" accept=".json" style="display:none;">
                        </div>` : ""}
                    </div>

                    <!-- 8. التحليلات وقاعة الشرف والسجل -->
                    <div id="lcea-v-analytics" class="lcea-view">
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-chart-pie"></i> إحصائيات المسابقة ونسخ الإعلانات</span></div>
                            <div id="lcea-an-box" style="margin-bottom:8px;"></div>
                            <div class="lcea-g3">
                                <button type="button" id="lcea-copy-top" class="lcea-btn lcea-b-gold"><i class="fas fa-list-ol"></i> نسخ الترتيب</button>
                                <button type="button" id="lcea-copy-promo" class="lcea-btn lcea-b-info"><i class="fas fa-bullhorn"></i> نسخ الجوائز</button>
                                <button type="button" id="lcea-exp-csv" class="lcea-btn lcea-b-ok"><i class="fas fa-file-csv"></i> تصدير CSV</button>
                            </div>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-trophy"></i> قاعة الشرف الموحّدة</span></div>
                            <div class="lcea-g3" style="margin-bottom:7px;">
                                <input id="lcea-hf-n" class="lcea-inp" placeholder="اسم الفائز *">
                                <input id="lcea-hf-l" class="lcea-inp" placeholder="اللقب (مثلاً: ملك الشات)">
                                <input id="lcea-hf-v" type="number" class="lcea-inp" placeholder="الأصوات">
                            </div>
                            <div class="lcea-up-box" style="margin-bottom:7px;">
                                <div class="lcea-up-prev" id="lcea-hf-prev"><i class="fas fa-camera"></i></div>
                                <div style="flex:1;font-size:11px;color:#94a3b8;" id="lcea-hf-lbl">صورة الفائز من الأستوديو (اختياري)</div>
                                <input type="file" id="lcea-hf-file" accept="image/*" style="display:none;">
                                <button type="button" id="lcea-hf-pick" class="lcea-btn lcea-b-info lcea-mini"><i class="fas fa-images"></i> الأستوديو</button>
                                <button type="button" id="lcea-hf-clr" class="lcea-btn lcea-b-dng lcea-mini" style="display:none;"><i class="fas fa-times"></i></button>
                            </div>
                            <button type="button" id="lcea-hf-add" class="lcea-btn lcea-b-ok" style="width:100%;margin-bottom:8px;">+ إضافة سجل لقاعة الشرف</button>
                            <div id="lcea-hof-list"></div>
                        </div>
                        <div class="lcea-card">
                            <div class="lcea-ct"><span><i class="fas fa-clipboard-list"></i> سجل العمليات الإدارية</span>${fullAdm ? '<button type="button" id="lcea-clr-logs" class="lcea-btn lcea-b-dng lcea-mini">مسح</button>' : ""}</div>
                            <input id="lcea-log-q" class="lcea-inp" style="margin-bottom:7px;" placeholder="🔍 ابحث في السجل...">
                            <div id="lcea-logs-list"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(ov);
            this.bindEvents(ov);
            this.switchTab(st.adminTab || "contests");
            requestAnimationFrame(() => ov.classList.add("active"));
            this.bindLiveAdminStreams();
            this.populateSettings();
            this.refresh();
        },

        switchTab(tab) {
            const ov = document.getElementById("lce-admin-modal");
            if (!ov) return;
            const tabBtn = ov.querySelector(`[data-atab="${tab}"]`);
            const reqPerm = tabBtn?.dataset?.perm;
            if (reqPerm && st.adminCid && !h.canPerm(st.adminCid, reqPerm)) {
                showToast("🔒 هذه الصلاحية غير مفعّلة لمدير المسابقة", 3000, "red");
                return;
            }
            st.adminTab = tab;
            ov.querySelectorAll("[data-atab]").forEach(x => x.classList.toggle("active", x.dataset.atab === tab));
            ov.querySelectorAll(".lcea-view").forEach(x => x.classList.remove("active"));
            document.getElementById(`lcea-v-${tab}`)?.classList.add("active");
            this.refresh();
        },

        close() {
            clearTimeout(st.adminRefreshTimer);
            [st.logsRef, st.bansRef, st.legacyBansRef, st.hofRef, st.legacyHofRef, st.adminPresenceRef].forEach(r => { try { r?.off(); } catch (e) {} });
            st.logsRef = st.bansRef = st.legacyBansRef = st.hofRef = st.legacyHofRef = st.adminPresenceRef = null;
            document.getElementById("lce-edit-entry-sub")?.remove();
            document.getElementById("lce-admin-modal")?.remove();
            syncHeavyStreams();
        },

        bindLiveAdminStreams() {
            if (!st.db) return;
            syncHeavyStreams();
            st.logsRef?.off();
            st.logsRef = st.db.ref(`${ROOT}/logs`).limitToLast(100);
            st.logsRef.on("value", sn => {
                st.logs = Object.values(sn.val() || {}).sort((a, b) => (b.ts || 0) - (a.ts || 0));
                if ("analytics" === st.adminTab) this.renderLogs();
            });
            st.bansRef?.off();
            st.bansRef = st.db.ref(`${ROOT}/banned`);
            st.bansRef.on("value", sn => { st.banned = sn.val() || {}; this.scheduleRefresh(150); });
            st.legacyBansRef?.off();
            st.legacyBansRef = st.db.ref(`${LEGACY_ROOT}/banned`);
            st.legacyBansRef.on("value", sn => { st.legacy.banned = sn.val() || {}; this.scheduleRefresh(150); });
            st.hofRef?.off();
            st.hofRef = st.db.ref(`${ROOT}/hall_of_fame`);
            st.hofRef.on("value", sn => { st.hof = sn.val() || {}; this.scheduleRefresh(150); });
            st.legacyHofRef?.off();
            st.legacyHofRef = st.db.ref(`${LEGACY_ROOT}/hall_of_fame`);
            st.legacyHofRef.on("value", sn => { st.legacy.hof = sn.val() || {}; this.scheduleRefresh(150); });
            this.rebindPresenceStream();
        },

        rebindPresenceStream() {
            st.adminPresenceRef?.off();
            st.adminPresenceRef = null;
            st.data.presence = {};
            if (!st.db || !st.adminCid || !document.getElementById("lce-admin-modal")) return;
            const path = isLegacy(st.adminCid) ? `${LEGACY_ROOT}/presence` : `${ROOT}/data/${st.adminCid}/presence`;
            st.adminPresenceRef = st.db.ref(path);
            st.adminPresenceRef.on("value", sn => { st.data.presence = sn.val() || {}; this.scheduleRefresh(250); });
        },

        populateSettings() {
            const c = h.getContest(st.adminCid);
            const sc = (id, v) => { const el = document.getElementById(id); if (el) el.checked = Boolean(v); };
            const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            if (c) {
                sv("lcea-cs-title", c.title || "");
                sv("lcea-cs-theme", c.theme || "gold");
                sc("lcea-cs-en", !1 !== c.cfg.enabled);
                sc("lcea-cs-menu", !1 !== c.showInMenu);
                sc("lcea-cs-pin", Boolean(c.pinTop));
                sc("lcea-cs-edit", !1 !== c.cfg.allowEditEntry);
                sc("lcea-cs-tr", !1 !== c.cfg.allowVoteTransfer);
                sc("lcea-cs-blind", Boolean(c.cfg.blindVoting));
                sc("lcea-cs-hide", Boolean(c.cfg.hideLiveVotes));
                sc("lcea-cs-app", Boolean(c.cfg.requireApproval));
                sc("lcea-cs-self", Boolean(c.cfg.allowSelfVote));
                sc("lcea-cs-chg", Boolean(c.cfg.allowVoteChange));
                sc("lcea-cs-gst", Boolean(c.cfg.allowGuestsVote));
                sv("lcea-cs-max", Number(c.cfg.maxEntries) || 0);
                sv("lcea-ban-txt", c.cfg.bannerText || "");
                sv("lcea-ban-th", c.cfg.bannerTheme || "gold");
                sv("lcea-rules-ta", c.cfg.rulesText || DEFAULT_RULES);
                sv("lcea-welc-ta", c.cfg.welcomeText || "");

                const mp = c.cfg.managerPerms || DEFAULT_MANAGER_PERMS;
                ["control", "entries", "votes", "radar", "prizes", "broadcast"].forEach(k => sc(`lcea-mp-${k}`, !1 !== mp[k]));

                const qw = document.getElementById("lcea-cs-quiz-wrap");
                if (qw) {
                    const showQ = ["quiz", "raffle", "prediction"].includes(c.template);
                    qw.style.display = showQ ? "block" : "none";
                    sv("lcea-cs-qprompt", c.quizPrompt || "");
                    sv("lcea-cs-qans", c.correctAnswer || "");
                    sv("lcea-cs-maxw", Number(c.maxWinners) || 1);
                }
                const exWrap = document.getElementById("lcea-me-extra"), exInp = document.getElementById("lcea-me-extra-inp");
                if (exWrap && exInp) {
                    if ("duo" === c.template) { exWrap.style.display = "block"; exInp.placeholder = "اسم شريك الثنائي *"; exInp.dir = "rtl"; }
                    else if ("media" === c.template) { exWrap.style.display = "block"; exInp.placeholder = "رابط يوتيوب *"; exInp.dir = "ltr"; }
                    else exWrap.style.display = "none";
                }
            }
            const g = st.global;
            sc("lcea-gs-en", !1 !== g.enabled);
            sc("lcea-gs-hub", Boolean(g.showHubInMenu));
            sc("lcea-gs-ad", !1 !== g.showToastAd);
            sv("lcea-gs-htitle", g.hubTitle || "مركز المسابقات");
            sv("lcea-gs-vipw", String(Number(g.vipVoteWeight) || 2));
            sv("lcea-gs-msg", g.disabledMsg || "");
        },

        bindEvents(ov) {
            ov.onclick = e => { if (e.target === ov) this.close(); };
            document.getElementById("lcea-close").onclick = () => this.close();
            document.getElementById("lcea-open-app").onclick = () => {
                const cid = st.adminCid;
                this.close();
                if (cid) window.LaylContests.open(cid); else window.LaylContests.openHub();
            };
            document.getElementById("lcea-ref").onclick = () => { this.refresh(); showToast("🔄 تم التحديث"); };

            document.getElementById("lcea-cid-sel").onchange = e => {
                st.adminCid = e.target.value || null;
                syncHeavyStreams();
                this.rebindPresenceStream();
                this.populateSettings();
                this.refresh();
            };

            ov.querySelectorAll("[data-atab]").forEach(b => b.onclick = () => this.switchTab(b.dataset.atab));

            // 1. معالج إنشاء المسابقة
            const modeSel = document.getElementById("lcea-cr-mode");
            const catsWrap = document.getElementById("lcea-cr-cats");
            const tmplSel = document.getElementById("lcea-cr-tmpl");
            const quizBox = document.getElementById("lcea-cr-quiz-box");

            const syncCreateFields = () => {
                if (!tmplSel) return;
                const T = tmplSel.value;
                const isTms = "teams" === T;
                if (catsWrap) catsWrap.style.display = ("dual" === modeSel?.value || isTms) ? "grid" : "none";
                const l1 = document.getElementById("lcea-cr-c1-lbl"), l2 = document.getElementById("lcea-cr-c2-lbl");
                if (l1) l1.textContent = isTms ? "اسم الفريق الأول (الأزرق ⚡)" : "مسمى الفئة الأولى";
                if (l2) l2.textContent = isTms ? "اسم الفريق الثاني (الوردي 🌸)" : "مسمى الفئة الثانية";
                if (modeSel) modeSel.disabled = isTms;
                if (quizBox) quizBox.style.display = ("quiz" === T || "prediction" === T) ? "block" : "none";
            };
            if (modeSel) modeSel.onchange = syncCreateFields;
            if (tmplSel) {
                tmplSel.onchange = () => {
                    const T = tmplSel.value, t = TEMPLATES[T];
                    if (t) document.getElementById("lcea-cr-ico").value = t.icon;
                    if ("poll" === T || "teams" === T) document.getElementById("lcea-cr-nomh").value = 0;
                    if ("teams" === T) {
                        document.getElementById("lcea-cr-mode").value = "single";
                        const c1 = document.getElementById("lcea-cr-c1"), c2 = document.getElementById("lcea-cr-c2");
                        if (c1 && (!c1.value.trim() || "ملك الشات" === c1.value.trim())) c1.value = "فريق الشباب";
                        if (c2 && (!c2.value.trim() || "ملكة الشات" === c2.value.trim())) c2.value = "فريق البنات";
                    }
                    if (["prediction", "raffle", "quiz"].includes(T)) document.getElementById("lcea-cr-voth").value = 0;
                    syncCreateFields();
                };
            }
            ov.querySelectorAll("[data-preset]").forEach(btn => btn.onclick = () => {
                const p = PRESETS.find(x => x.key === btn.dataset.preset); if (!p) return;
                const d = p.data;
                document.getElementById("lcea-cr-title").value = d.title;
                document.getElementById("lcea-cr-sub").value = d.subtitle;
                document.getElementById("lcea-cr-tmpl").value = d.template;
                document.getElementById("lcea-cr-theme").value = d.theme;
                document.getElementById("lcea-cr-ico").value = d.icon;
                document.getElementById("lcea-cr-mode").value = d.mode || "single";
                document.getElementById("lcea-cr-c1").value = d.cat1Label || ("teams" === d.template ? "فريق الشباب" : "الفئة الأولى");
                document.getElementById("lcea-cr-c2").value = d.cat2Label || ("teams" === d.template ? "فريق البنات" : "الفئة الثانية");
                document.getElementById("lcea-cr-nomh").value = d.nomHours;
                document.getElementById("lcea-cr-voth").value = d.voteHours;
                document.getElementById("lcea-cr-maxw").value = d.maxWinners || 1;
                document.getElementById("lcea-cr-qprompt").value = d.quizPrompt || "";
                document.getElementById("lcea-cr-qans").value = d.correctAnswer || "";
                document.getElementById("lcea-cr-blind").checked = Boolean(d.blindVoting);
                document.getElementById("lcea-cr-hide").checked = Boolean(d.hideLiveVotes);
                document.getElementById("lcea-cr-menu").checked = Boolean(d.showInMenu);
                document.getElementById("lcea-cr-pin").checked = Boolean(d.pinTop);
                syncCreateFields();
                showToast(`✨ تم تعبئة قالب: ${p.label}`, 2200, "gold");
            });

            document.getElementById("lcea-create-go")?.addEventListener("click", () => {
                if (!st.db || !this.isFullAdmin()) return;
                const title = document.getElementById("lcea-cr-title").value.trim();
                if (!title) return alert("أدخل اسم المسابقة.");
                const template = document.getElementById("lcea-cr-tmpl").value;
                const isTms = "teams" === template;
                const theme = document.getElementById("lcea-cr-theme").value;
                const icon = document.getElementById("lcea-cr-ico").value.trim() || TEMPLATES[template]?.icon || "fa-crown";
                const subtitle = document.getElementById("lcea-cr-sub").value.trim();
                const mode = isTms ? "single" : document.getElementById("lcea-cr-mode").value;
                const cat1Label = document.getElementById("lcea-cr-c1").value.trim() || (isTms ? "فريق الشباب" : "الفئة الأولى");
                const cat2Label = document.getElementById("lcea-cr-c2").value.trim() || (isTms ? "فريق البنات" : "الفئة الثانية");
                const nomH = Math.max(0, parseFloat(document.getElementById("lcea-cr-nomh").value) || 0);
                const votH = Math.max(0, parseFloat(document.getElementById("lcea-cr-voth").value) || 0);
                const maxWinners = Math.max(1, parseInt(document.getElementById("lcea-cr-maxw").value, 10) || 1);
                const quizPrompt = document.getElementById("lcea-cr-qprompt").value.trim();
                const correctAnswer = document.getElementById("lcea-cr-qans").value.trim();
                const now = Date.now();
                const noSub = "poll" === template || isTms;
                const noVote = ["prediction", "raffle", "quiz"].includes(template);
                const nomEnd = noSub ? now - 1000 : now + Math.max(0.25, nomH) * 36e5;
                const voteEnd = noVote ? nomEnd : nomEnd + Math.max(1, votH) * 36e5;
                const cid = h.genId("cnt");
                const cfg = Object.assign({}, DEFAULT_CONTEST_CFG, {
                    blindVoting: isTms ? !1 : document.getElementById("lcea-cr-blind").checked,
                    hideLiveVotes: document.getElementById("lcea-cr-hide").checked
                });
                const showInMenu = document.getElementById("lcea-cr-menu").checked;
                const pinTop = document.getElementById("lcea-cr-pin").checked;

                const meta = {
                    title, subtitle, template, theme, icon, mode,
                    cat1Label, cat1Icon: isTms ? "⚡" : ("royal" === template ? "👑" : "⭐"),
                    cat2Label, cat2Icon: isTms ? "🌸" : ("royal" === template ? "👸" : "✨"),
                    status: "active", season: 1, nomEnd, voteEnd, paused: !1, voteMultiplier: 1,
                    showInMenu, pinTop, resultsPublished: !1, maxWinners, quizPrompt, correctAnswer,
                    createdBy: st.myUser || "الإدارة", createdAt: now, cfg
                };
                const updates = {};
                updates[`index/${cid}`] = meta;
                updates[`data/${cid}/prizes`] = DEFAULT_PRIZES;
                if (isTms) updates[`data/${cid}/entries`] = h.makeTeamEntries(cat1Label, cat2Label, now);
                updates["broadcast"] = {
                    text: isTms ? `⚔️ اشتعلت (${title})! ادخل الآن وصوّت لفريقك المفضل 🔥` : `🔥 انطلقت مسابقة (${title})! ادخل وشارك الآن.`,
                    theme, cid, ts: now, by: st.myUser || "الإدارة"
                };
                st.db.ref(ROOT).update(updates).then(() => {
                    st.adminCid = cid;
                    this.log("إنشاء مسابقة", title, `${template} | ${theme}`);
                    syncHeavyStreams();
                    this.rebindPresenceStream();
                    this.populateSettings();
                    showToast(`🚀 تم نشر (${title}) وظهورها للجميع!`, 4000, "gold");
                    this.switchTab("poll" === template ? "entries" : "control");
                }).catch(() => alert("❌ فشل إنشاء المسابقة."));
            });

            // 2. التحكم والمراحل وقوالب البث
            ov.querySelectorAll(".lcea-time-adj").forEach(b => b.onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!h.canPerm(cid, "control")) return showToast("لا تملك صلاحية تعديل الوقت", 3000, "red");
                if (!c || "active" !== c.status) return showToast("لا توجد مسابقة نشطة");
                const hrs = Number(b.dataset.h), delta = hrs * 36e5, info = getPhaseInfo(c, st.data.entries, st.data.votes);
                if ("submission" === info.phase) {
                    this.patchContest(cid, { nomEnd: c.nomEnd + delta, voteEnd: (c.voteEnd || c.nomEnd) + delta }, `⏱️ تم تعديل وقت التقديم (${hrs > 0 ? "+" : ""}${hrs}س)`);
                } else if ("voting" === info.phase) {
                    this.patchContest(cid, { voteEnd: c.voteEnd + delta }, `⏱️ تم تعديل وقت التصويت (${hrs > 0 ? "+" : ""}${hrs}س)`);
                } else showToast("لا يمكن التعديل في هذه المرحلة");
            });

            document.getElementById("lcea-pause-btn").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || "active" !== c.status || !h.canPerm(cid, "control")) return;
                if (c.paused) {
                    const rem = c.remainingMs || 0, now = Date.now(), up = { paused: !1, remainingMs: 0 };
                    if ("submission" === c.pausedPhase) {
                        const vDur = Math.max(0, (c.voteEnd || now) - (c.nomEnd || now));
                        up.nomEnd = now + rem; up.voteEnd = up.nomEnd + vDur;
                    } else if ("voting" === c.pausedPhase) up.voteEnd = now + rem;
                    this.patchContest(cid, up, "▶️ تم الاستئناف");
                } else {
                    const info = getPhaseInfo(c, st.data.entries, st.data.votes);
                    if ("submission" !== info.phase && "voting" !== info.phase) return showToast("لا يمكن إيقاف هذه المرحلة");
                    this.patchContest(cid, { paused: !0, pausedPhase: info.phase, remainingMs: info.remaining }, "⏸️ تم الإيقاف المؤقت");
                }
            };

            document.getElementById("lcea-tog-mode").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                if ("teams" === c.template) return showToast("معركة الفريقين تعمل بنظام الفريقين المباشر.", 3000);
                const next = "dual" === c.mode ? "single" : "dual";
                this.patchContest(cid, { mode: next }, "dual" === next ? "النظام الآن: فئتان" : "النظام الآن: فئة واحدة");
            };

            document.getElementById("lcea-go-sub").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                if ("teams" === c.template || "poll" === c.template) {
                    if (!confirm("تمديد / إعادة فتح التصويت لمدة 24 ساعة؟")) return;
                    const now = Date.now();
                    return this.patchContest(cid, { status: "active", nomEnd: now - 1000, voteEnd: now + 24 * 36e5, paused: !1, resultsPublished: !1 }, "🔄 تم فتح التصويت لمدة 24 ساعة");
                }
                if (!confirm("إعادة فتح مرحلة التقديم لمدة 24 ساعة؟")) return;
                const now = Date.now(), noVote = ["prediction", "raffle", "quiz"].includes(c.template);
                const vDur = Math.max(24 * 36e5, ((c.voteEnd || now) - (c.nomEnd || now)) || 72 * 36e5);
                this.patchContest(cid, { status: "active", nomEnd: now + 24 * 36e5, voteEnd: noVote ? now + 24 * 36e5 : now + 24 * 36e5 + vDur, paused: !1, resultsPublished: !1 }, "🔄 تم فتح مرحلة التقديم");
            };

            document.getElementById("lcea-skip-sub").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                if ("bracket" === c.template) return startBracketTournament(cid, c);
                if (!confirm("إنهاء التقديم وبدء المرحلة التالية فوراً؟")) return;
                const now = Date.now(), noVote = ["prediction", "raffle", "quiz"].includes(c.template);
                const dur = Math.max(36e5, ((c.voteEnd || now) - (c.nomEnd || now)) || 72 * 36e5);
                this.patchContest(cid, { status: "active", nomEnd: now - 1000, voteEnd: noVote ? now - 1000 : now + dur, paused: !1 }, "🗳️ تم الانتقال للمرحلة التالية!");
                if (!noVote) dbOps.broadcast(cid, `🗳️ بدأ التصويت الآن في (${c.title})!`, c.theme || "gold");
            };

            document.getElementById("lcea-skip-vote").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                if ("raffle" === c.template) return runRaffleDraw(cid, c);
                if (!confirm("إنهاء التصويت وإعلان النتائج فوراً؟")) return;
                const now = Date.now();
                this.patchContest(cid, { status: "active", nomEnd: now - 2000, voteEnd: now - 1000, paused: !1, resultsPublished: !0 }, "🏆 تم إعلان النتائج!");
                dbOps.broadcast(cid, `🏆 أُعلنت نتائج (${c.title})! ادخل للتهنئة.`, c.theme || "gold");
            };

            document.getElementById("lcea-new-season").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control") || !confirm(`إطلاق موسم جديد (#${(c.season || 1) + 1}) لمسابقة (${c.title}) وتصفير مشاركات وأصوات الموسم السابق؟`)) return;
                dbOps.startNewSeason(cid, c).then(() => { this.log("موسم جديد", c.title, `#${(c.season || 1) + 1}`); showToast("🚀 انطلق الموسم الجديد!", 3500, "gold"); });
            };

            document.getElementById("lcea-archive-c").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control") || !confirm(`أرشفة (${c.title}) وإخفاء زرها من قائمة الأعضاء؟`)) return;
                this.patchContest(cid, { status: "archived", showInMenu: !1 }, "📦 تمت الأرشفة وإخفاء الزر");
            };

            ov.querySelectorAll(".lcea-set-mult").forEach(b => b.onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                const m = Number(b.dataset.m);
                this.patchContest(cid, { voteMultiplier: m }, `⚡ مضاعف الأصوات الآن: ×${m}`);
                if (m > 1 && h.canPerm(cid, "broadcast")) dbOps.broadcast(cid, `⚡ ساعة المضاعفة الذهبية في (${c.title})! كل صوت يُحسب ×${m}!`, "purple");
            });

            document.getElementById("lcea-save-hof").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!c || !h.canPerm(cid, "control")) return;
                const entries = st.data.entries || {}, votes = st.data.votes || {};
                const counts = computeVoteCounts(entries, votes);
                if (c.tieBreaker && void 0 !== counts[c.tieBreaker]) counts[c.tieBreaker]++;
                if (c.tieBreakerCat1 && void 0 !== counts[c.tieBreakerCat1]) counts[c.tieBreakerCat1]++;
                if (c.tieBreakerCat2 && void 0 !== counts[c.tieBreakerCat2]) counts[c.tieBreakerCat2]++;
                let list = [];
                if ("bracket" === c.template && c.bracket?.champion && entries[c.bracket.champion]) {
                    list = [Object.assign({ key: c.bracket.champion }, entries[c.bracket.champion])];
                } else if (["prediction", "raffle", "quiz"].includes(c.template)) {
                    list = getApprovedEntries(entries).filter(e => e.isWinner);
                } else {
                    const all = getApprovedEntries(entries).sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
                    list = ("dual" === c.mode && "teams" !== c.template) ? [all.find(x => "cat2" !== x.category), all.find(x => "cat2" === x.category)].filter(Boolean) : all.slice(0, 1);
                }
                if (!list.length) return showToast("لا يوجد فائز لحفظه", 3000, "red");
                list.forEach(w => {
                    const cm = getCatMeta(c, w.category);
                    const wName = "duo" === c.template ? `${w.displayName || w.username} ❤️ ${w.partnerName || ""}` : (w.displayName || w.username);
                    dbOps.pushHof(cid, {
                        contestId: cid, contestTitle: c.title, season: c.season || 1,
                        name: wName, catKey: w.category,
                        categoryLabel: "teams" === c.template ? `${cm.icon} الفريق الفائز` : ("dual" === c.mode ? `${cm.icon} ${cm.label}` : `${cm.icon} بطل المسابقة`),
                        avatar: ("photo" === c.template ? w.image : w.avatar) || "",
                        votes: ["prediction", "raffle", "quiz", "bracket"].includes(c.template) ? 0 : (counts[w.key] || 0),
                        date: Date.now()
                    });
                });
                this.log("تخليد بقاعة الشرف", c.title, list.map(x => x.displayName || x.username).join(" & "));
                showToast("🏆 تم التخليد في قاعة الشرف الموحّدة!", 3500, "gold");
            };

            ov.querySelectorAll(".lcea-bc-pre").forEach(b => b.onclick = () => {
                const bp = BROADCAST_PRESETS[Number(b.dataset.bi)], c = h.getContest(st.adminCid);
                if (!bp) return;
                document.getElementById("lcea-bc-inp").value = bp.text(c?.title || "المسابقة");
                document.getElementById("lcea-bc-th").value = bp.theme;
            });

            document.getElementById("lcea-bc-send").onclick = () => {
                if (!h.canPerm(st.adminCid, "broadcast")) return showToast("لا تملك صلاحية البث الفوري", 3000, "red");
                const inp = document.getElementById("lcea-bc-inp"), txt = inp.value.trim(), theme = document.getElementById("lcea-bc-th").value;
                if (!txt || !st.db) return alert("اكتب نص البث.");
                dbOps.broadcast(st.adminCid, txt, theme).then(() => { this.log("بث فوري", "الجميع", txt); inp.value = ""; showToast("📢 تم البث للجميع"); });
            };

            document.getElementById("lcea-ban-save").onclick = () => {
                if (!st.adminCid || !h.canPerm(st.adminCid, "control")) return;
                const txt = document.getElementById("lcea-ban-txt").value.trim(), th = document.getElementById("lcea-ban-th").value;
                this.patchContestCfg(st.adminCid, { bannerText: txt, bannerTheme: th }, txt ? "📢 تم تحديث الشريط" : "تم إخفاء الشريط");
            };

            // 3. المشاركات والبحث فيها
            document.getElementById("lcea-eq").oninput = () => this.renderEntries();
            let manualMedia = "";
            const meFile = document.getElementById("lcea-me-file"), mePrev = document.getElementById("lcea-me-prev"), meLbl = document.getElementById("lcea-me-lbl"), meClr = document.getElementById("lcea-me-clr");
            const resetMeMedia = () => { manualMedia = ""; mePrev.innerHTML = '<i class="fas fa-camera"></i>'; meLbl.textContent = "صورة من الأستوديو (اختياري)"; meClr.style.display = "none"; };
            document.getElementById("lcea-me-pick").onclick = () => meFile.click();
            meClr.onclick = resetMeMedia;
            meFile.onchange = ev => {
                const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                const c = h.getContest(st.adminCid);
                h.compressImg(file, "photo" === c?.template ? "photo" : "avatar").then(data => {
                    manualMedia = data; mePrev.innerHTML = `<img src="${data}" alt="">`; meLbl.textContent = "تم اختيار الصورة ✓"; meClr.style.display = "inline-flex";
                }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
            };

            document.getElementById("lcea-app-all").onclick = () => {
                const cid = st.adminCid; if (!cid || !h.canPerm(cid, "entries")) return;
                dbOps.approveAllPending(cid, st.data.entries).then(cnt => {
                    if (!cnt) return showToast("لا توجد مشاركات معلّقة");
                    this.log("اعتماد جماعي", h.getContest(cid)?.title, `${cnt}`);
                    showToast(`✅ تم اعتماد ${cnt}`);
                });
            };

            document.getElementById("lcea-me-add").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!h.canPerm(cid, "entries")) return showToast("لا تملك صلاحية إدارة المشاركات", 3000, "red");
                const u = document.getElementById("lcea-me-u").value.trim(), key = h.san(u) || h.genId("opt");
                if (!u || !cid || !st.db) return alert("أدخل اسم المستخدم أو الخيار.");
                const cat = document.getElementById("lcea-me-cat").value;
                const text = document.getElementById("lcea-me-t").value.trim().slice(0, 550);
                const extraVal = (document.getElementById("lcea-me-extra-inp")?.value || "").trim();
                let partnerName = "", partnerAvatar = "", ytId = "";
                if ("duo" === c.template) {
                    const pDet = h.detectFromDOM(extraVal) || {};
                    partnerName = pDet.displayName || extraVal;
                    partnerAvatar = pDet.avatar || "";
                } else if ("media" === c.template) {
                    ytId = h.parseYtId(extraVal);
                    if (!ytId) return alert("أدخل رابط يوتيوب صحيح.");
                }
                const det = h.detectFromDOM(u) || {}, isPhoto = "photo" === c.template;
                dbOps.saveEntry(cid, key, {
                    uid: det.uid || "", username: u, displayName: det.displayName || u, html: det.html || h.esc(u),
                    avatar: isPhoto ? (det.avatar || "") : (manualMedia || det.avatar || ""),
                    image: isPhoto ? manualMedia : "",
                    partnerName, partnerAvatar, ytId, tickets: 1,
                    category: "dual" === c.mode ? cat : "cat1",
                    title: "", text, badge: "", frozen: !1, isWinner: !1, status: "approved", bonusVotes: 0, joinedAt: Date.now()
                }).then(() => {
                    this.log("إضافة مشاركة", c.title, u);
                    document.getElementById("lcea-me-u").value = "";
                    document.getElementById("lcea-me-t").value = "";
                    if (document.getElementById("lcea-me-extra-inp")) document.getElementById("lcea-me-extra-inp").value = "";
                    resetMeMedia();
                    showToast(`✅ تمت إضافة (${u})`);
                });
            };

            // 4. الأصوات
            document.getElementById("lcea-vq").oninput = () => this.renderVotes();
            document.getElementById("lcea-rev-10m").onclick = () => {
                const cid = st.adminCid; if (!cid || !h.canPerm(cid, "votes")) return;
                const cut = Date.now() - 10 * 6e4, up = {}; let cnt = 0;
                Object.entries(st.data.votes || {}).forEach(([k, v]) => { if (v && (v.ts || 0) >= cut) { up[k] = null; cnt++; } });
                if (!cnt) return showToast("لا توجد أصوات خلال آخر 10 دقائق");
                if (confirm(`سحب (${cnt}) صوت خلال آخر 10 دقائق؟`)) dbOps.updateVotes(cid, up).then(() => { this.log("سحب أصوات 10د", h.getContest(cid)?.title, `${cnt}`); showToast(`🧹 تم سحب ${cnt} صوت`); });
            };
            document.getElementById("lcea-rev-entry").onclick = () => {
                const cid = st.adminCid; if (!cid || !h.canPerm(cid, "votes")) return;
                const target = prompt("اكتب اسم المشارك المراد تصفير أصواته:");
                if (!target || !target.trim()) return;
                const key = h.san(target), up = {}; let cnt = 0;
                Object.entries(st.data.votes || {}).forEach(([k, v]) => { if (v && v.target === key) { up[k] = null; cnt++; } });
                if (!cnt) return showToast("لا توجد أصوات لهذا المشارك");
                if (confirm(`تصفير (${cnt}) صوت؟`)) dbOps.updateVotes(cid, up).then(() => { this.log("تصفير أصوات مشارك", target, `${cnt}`); showToast(`🗑️ تم حذف ${cnt} صوت`); });
            };
            document.getElementById("lcea-wipe-votes").onclick = () => {
                const cid = st.adminCid; if (!cid || !h.canPerm(cid, "votes") || !confirm("⚠️ تصفير جميع الأصوات في هذه المسابقة؟")) return;
                dbOps.wipeVotes(cid).then(() => { this.log("تصفير كل الأصوات", h.getContest(cid)?.title); showToast("🗑️ تم التصفير"); });
            };

            // 5. الرادار والحظر
            document.getElementById("lcea-clr-pres").onclick = () => {
                if (!h.canPerm(st.adminCid, "radar")) return;
                dbOps.clearPresence(st.adminCid).then(() => showToast("🧹 تم تنظيف الرادار"));
            };
            document.getElementById("lcea-bgo").onclick = () => {
                if (!h.canPerm(st.adminCid, "radar")) return showToast("لا تملك صلاحية الحظر", 3000, "red");
                const u = document.getElementById("lcea-bu").value.trim(), key = h.san(u);
                if (!key || !st.db) return alert("أدخل اسم المستخدم.");
                const scope = document.getElementById("lcea-bs").value;
                const contestId = "current" === document.getElementById("lcea-bc").value ? (st.adminCid || "all") : (this.isFullAdmin() ? "all" : (st.adminCid || "all"));
                const dur = document.getElementById("lcea-bd").value, reason = document.getElementById("lcea-br").value.trim();
                const dMap = { "1h": 36e5, "6h": 216e5, "24h": 864e5, "3d": 2592e5, "7d": 6048e5 };
                const expiresAt = dMap[dur] ? Date.now() + dMap[dur] : null;
                dbOps.banUser(key, { name: u, scope, contestId, reason, expiresAt, by: st.myUser || "الإدارة", ts: Date.now() }).then(() => {
                    this.log("حظر عضو", u, `${scope} | ${dur}`);
                    document.getElementById("lcea-bu").value = ""; document.getElementById("lcea-br").value = "";
                    showToast(`🚫 تم حظر (${u})`);
                });
            };
            document.getElementById("lcea-cln-bans").onclick = () => {
                if (!h.canPerm(st.adminCid, "radar")) return;
                const up1 = {}, up2 = {}; let cnt = 0;
                Object.entries(st.banned || {}).forEach(([k, b]) => { if (b && b.expiresAt && Date.now() >= b.expiresAt) { up1[k] = null; cnt++; } });
                Object.entries(st.legacy.banned || {}).forEach(([k, b]) => { if (b && b.expiresAt && Date.now() >= b.expiresAt) { up2[k] = null; cnt++; } });
                if (!cnt) return showToast("لا يوجد حظر منتهي");
                Promise.all([
                    Object.keys(up1).length ? st.db?.ref(`${ROOT}/banned`).update(up1) : null,
                    Object.keys(up2).length ? st.db?.ref(`${LEGACY_ROOT}/banned`).update(up2) : null
                ]).then(() => showToast(`🧹 تم تنظيف ${cnt}`));
            };

            // 6. الجوائز والقوانين
            document.getElementById("lcea-pz-reset").onclick = () => {
                if (st.adminCid && h.canPerm(st.adminCid, "prizes") && confirm("استعادة الجوائز الافتراضية؟")) {
                    dbOps.setPrizes(st.adminCid, isLegacy(st.adminCid) ? ROYAL_DEFAULT_PRIZES : DEFAULT_PRIZES).then(() => showToast("✅ تمت الاستعادة"));
                }
            };
            document.getElementById("lcea-np-add").onclick = () => {
                const cid = st.adminCid;
                if (!cid || !h.canPerm(cid, "prizes")) return;
                const title = document.getElementById("lcea-np-t").value.trim(), dur = document.getElementById("lcea-np-d").value.trim(), icon = document.getElementById("lcea-np-i").value.trim() || "fa-crown";
                if (!title) return alert("أدخل عنوان الجائزة.");
                const next = (Array.isArray(st.data.prizes) ? st.data.prizes : DEFAULT_PRIZES).slice();
                next.push({ title, dur, icon });
                dbOps.setPrizes(cid, next).then(() => { document.getElementById("lcea-np-t").value = ""; document.getElementById("lcea-np-d").value = ""; showToast("🎁 تمت إضافة الجائزة"); });
            };
            document.getElementById("lcea-rules-save").onclick = () => { if (st.adminCid && h.canPerm(st.adminCid, "prizes")) this.patchContestCfg(st.adminCid, { rulesText: document.getElementById("lcea-rules-ta").value.trim() }, "✅ تم حفظ القوانين"); };
            document.getElementById("lcea-welc-save").onclick = () => {
                if (!st.adminCid || !h.canPerm(st.adminCid, "prizes")) return;
                const txt = document.getElementById("lcea-welc-ta").value.trim();
                this.patchContestCfg(st.adminCid, { welcomeText: txt, welcomeVersion: Date.now() }, txt ? "✅ تم تفعيل رسالة الترحيب" : "تم التعطيل");
            };
            document.getElementById("lcea-welc-off").onclick = () => {
                if (!st.adminCid || !h.canPerm(st.adminCid, "prizes")) return;
                document.getElementById("lcea-welc-ta").value = "";
                this.patchContestCfg(st.adminCid, { welcomeText: "" }, "تم تعطيل رسالة الترحيب");
            };

            // 7. الصلاحيات والإعدادات
            document.getElementById("lcea-cs-save").onclick = () => {
                const cid = st.adminCid, c = h.getContest(cid);
                if (!cid || !c || !h.canPerm(cid, "control")) return showToast("لا تملك صلاحية تعديل الإعدادات", 3000, "red");
                const title = document.getElementById("lcea-cs-title").value.trim() || c.title;
                const theme = document.getElementById("lcea-cs-theme").value;
                const showInMenu = document.getElementById("lcea-cs-menu").checked;
                const pinTop = document.getElementById("lcea-cs-pin").checked;
                const metaUp = { title, theme, showInMenu, pinTop };
                if (["quiz", "raffle", "prediction"].includes(c.template)) {
                    metaUp.quizPrompt = document.getElementById("lcea-cs-qprompt")?.value?.trim() || "";
                    metaUp.correctAnswer = document.getElementById("lcea-cs-qans")?.value?.trim() || "";
                    metaUp.maxWinners = Math.max(1, parseInt(document.getElementById("lcea-cs-maxw")?.value, 10) || 1);
                }
                this.patchContest(cid, metaUp);
                this.patchContestCfg(cid, {
                    enabled: document.getElementById("lcea-cs-en").checked,
                    allowEditEntry: document.getElementById("lcea-cs-edit").checked,
                    allowVoteTransfer: document.getElementById("lcea-cs-tr").checked,
                    blindVoting: document.getElementById("lcea-cs-blind").checked,
                    hideLiveVotes: document.getElementById("lcea-cs-hide").checked,
                    requireApproval: document.getElementById("lcea-cs-app").checked,
                    allowSelfVote: document.getElementById("lcea-cs-self").checked,
                    allowVoteChange: document.getElementById("lcea-cs-chg").checked,
                    allowGuestsVote: document.getElementById("lcea-cs-gst").checked,
                    maxEntries: Math.max(0, parseInt(document.getElementById("lcea-cs-max").value, 10) || 0)
                }, "✅ تم حفظ إعدادات المسابقة");
            };

            document.getElementById("lcea-mgr-add")?.addEventListener("click", () => {
                const cid = st.adminCid, c = h.getContest(cid); if (!c || !this.isFullAdmin()) return alert("تعيين مديري المسابقة للإدارة العليا فقط.");
                const inp = document.getElementById("lcea-mgr-inp"), u = inp.value.trim(); if (!u) return;
                inp.value = "";
                this.patchContestCfg(cid, { managers: Array.from(new Set([...(c.cfg.managers || []), u])) }, `🛡️ تم تعيين (${u}) مديراً لهذه المسابقة`);
            });

            document.getElementById("lcea-mp-save")?.addEventListener("click", () => {
                const cid = st.adminCid; if (!cid || !this.isFullAdmin()) return;
                const perms = {};
                ["control", "entries", "votes", "radar", "prizes", "broadcast"].forEach(k => {
                    perms[k] = Boolean(document.getElementById(`lcea-mp-${k}`)?.checked);
                });
                this.patchContestCfg(cid, { managerPerms: perms }, "🛡️ تم حفظ صلاحيات مديري المسابقة");
            });

            document.getElementById("lcea-gs-save")?.addEventListener("click", () => {
                this.patchGlobal({
                    enabled: document.getElementById("lcea-gs-en").checked,
                    showHubInMenu: document.getElementById("lcea-gs-hub").checked,
                    showToastAd: document.getElementById("lcea-gs-ad").checked,
                    hubTitle: document.getElementById("lcea-gs-htitle").value.trim() || "مركز المسابقات",
                    vipVoteWeight: Math.max(1, parseInt(document.getElementById("lcea-gs-vipw").value, 10) || 2),
                    disabledMsg: document.getElementById("lcea-gs-msg").value.trim() || DEFAULT_GLOBAL.disabledMsg
                }, "✅ تم حفظ الإعدادات العامة");
            });

            document.getElementById("lcea-vip-add")?.addEventListener("click", () => {
                const inp = document.getElementById("lcea-vip-inp"), u = inp.value.trim(); if (!u) return;
                inp.value = "";
                const next = Array.from(new Set([...(st.global.vipUsers || []), u]));
                this.patchGlobal({ vipUsers: next }, `⭐ أضيف (${u}) لـ VIP`);
            });
            document.getElementById("lcea-sa-add")?.addEventListener("click", () => {
                if (!h.isSuperAdmin()) return alert("إضافة المشرفين العامين للمالك فقط.");
                const inp = document.getElementById("lcea-sa-inp"), u = inp.value.trim(); if (!u) return;
                inp.value = "";
                this.patchGlobal({ subAdmins: Array.from(new Set([...(st.global.subAdmins || []), u])) }, `🛡️ أضيف (${u}) كمشرف عام`);
            });

            document.getElementById("lcea-exp")?.addEventListener("click", () => {
                const cid = st.adminCid, c = h.getContest(cid); if (!c) return;
                const blob = new Blob([JSON.stringify({ contestId: cid, meta: c, data: st.data, hall_of_fame: getMergedHofList() }, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob), a = document.createElement("a");
                a.href = url; a.download = `layl-contest-${cid}-${new Date().toISOString().split("T")[0]}.json`;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            document.getElementById("lcea-imp")?.addEventListener("click", () => document.getElementById("lcea-imp-file").click());
            document.getElementById("lcea-imp-file")?.addEventListener("change", ev => {
                const f = ev.target.files?.[0]; ev.target.value = ""; if (!f || !st.db) return;
                const rd = new FileReader();
                rd.onload = () => {
                    try {
                        const p = JSON.parse(rd.result);
                        if (!p || !p.contestId || !p.meta || !confirm("استعادة هذه المسابقة في قاعدة البيانات؟")) return;
                        const targetId = isLegacy(p.contestId) ? h.genId("imp") : p.contestId;
                        const up = {}; up[`index/${targetId}`] = p.meta;
                        if (p.data) up[`data/${targetId}`] = p.data;
                        st.db.ref(ROOT).update(up).then(() => showToast("✅ تمت الاستعادة بنجاح", 3000, "gold"));
                    } catch (e) { alert("❌ ملف JSON غير صالح."); }
                };
                rd.readAsText(f);
            });

            // 8. التحليلات وقاعة الشرف والسجل
            let hofAv = "";
            const hfFile = document.getElementById("lcea-hf-file"), hfPrev = document.getElementById("lcea-hf-prev"), hfLbl = document.getElementById("lcea-hf-lbl"), hfClr = document.getElementById("lcea-hf-clr");
            const resetHfAv = () => { hofAv = ""; hfPrev.innerHTML = '<i class="fas fa-camera"></i>'; hfLbl.textContent = "صورة الفائز من الأستوديو (اختياري)"; hfClr.style.display = "none"; };
            document.getElementById("lcea-hf-pick").onclick = () => hfFile.click();
            hfClr.onclick = resetHfAv;
            hfFile.onchange = ev => {
                const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                h.compressImg(file, "avatar").then(data => { hofAv = data; hfPrev.innerHTML = `<img src="${data}" alt="">`; hfLbl.textContent = "تم اختيار الصورة ✓"; hfClr.style.display = "inline-flex"; }).catch(err => showToast(`❌ ${err}`, 3000, "red"));
            };

            document.getElementById("lcea-copy-top").onclick = () => {
                const c = h.getContest(st.adminCid); if (!c) return;
                const counts = computeVoteCounts(st.data.entries, st.data.votes);
                const top = getApprovedEntries(st.data.entries).sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0)).slice(0, 5);
                if (!top.length) return showToast("لا توجد مشاركات بعد");
                const unit = "teams" === c.template ? "نقطة" : "صوت";
                const txt = `🏆 الترتيب المباشر — ${c.title} 🏆\n\n` + top.map((e, i) => `${i + 1}. ${"duo" === c.template ? `${e.displayName} ❤️ ${e.partnerName}` : (e.displayName || e.username)} — (${counts[e.key] || 0} ${unit})`).join("\n") + "\n\n🗳️ صوّت الآن!";
                h.copy(txt, "📋 تم نسخ الترتيب للشات!");
            };
            document.getElementById("lcea-copy-promo").onclick = () => {
                const c = h.getContest(st.adminCid); if (!c) return;
                const list = Array.isArray(st.data.prizes) && st.data.prizes.length ? st.data.prizes : DEFAULT_PRIZES;
                const txt = `🏆✨ ${c.title} ✨🏆\n\n🎁 الجوائز:\n` + list.map((p, i) => `${i + 1}. ${p.title}${p.dur ? ` (${p.dur})` : ""}`).join("\n") + "\n\n🔥 ادخل من قائمة الإضافات وشارك الآن!";
                h.copy(txt, "📋 تم نسخ إعلان الجوائز!");
            };
            document.getElementById("lcea-exp-csv").onclick = () => this.exportResultsCSV(st.adminCid);
            document.getElementById("lcea-hf-add").onclick = () => {
                const c = h.getContest(st.adminCid);
                const name = document.getElementById("lcea-hf-n").value.trim(), label = document.getElementById("lcea-hf-l").value.trim() || "🏆 الفائز", votes = parseInt(document.getElementById("lcea-hf-v").value, 10) || 0;
                if (!name || !st.db) return alert("أدخل اسم الفائز.");
                dbOps.pushHof(st.adminCid || "", { contestId: st.adminCid || "", contestTitle: c?.title || "مسابقة شات ليل", season: c?.season || 1, name, categoryLabel: label, avatar: hofAv, votes, date: Date.now() }).then(() => {
                    document.getElementById("lcea-hf-n").value = ""; document.getElementById("lcea-hf-l").value = ""; document.getElementById("lcea-hf-v").value = "";
                    resetHfAv();
                    this.log("إضافة لقاعة الشرف", name); showToast("🏆 تمت الإضافة");
                });
            };
            document.getElementById("lcea-log-q").oninput = () => this.renderLogs();
            document.getElementById("lcea-clr-logs")?.addEventListener("click", () => { if (confirm("مسح سجل العمليات؟")) st.db?.ref(`${ROOT}/logs`).remove().then(() => { st.logs = []; this.renderLogs(); }); });
        },

        refresh() {
            const ov = document.getElementById("lce-admin-modal");
            if (!ov) return;
            this.ensureSelectedCid();
            const sel = document.getElementById("lcea-cid-sel");
            const ids = this.getManagedContestIds();
            if (sel) {
                sel.innerHTML = ids.length ? ids.map(id => {
                    const x = h.getContest(id);
                    const tName = TEMPLATES[x?.template]?.name || "";
                    const tag = x?.isLegacy ? "👑 مباشر • " : ("archived" === x?.status ? "📦 " : "🟢 ");
                    return `<option value="${h.esc(id)}" ${id === st.adminCid ? "selected" : ""}>${tag}${h.esc(x?.title || id)} (${tName})</option>`;
                }).join("") : '<option value="">لا توجد مسابقات — أنشئ مسابقة من تبويب المسابقات</option>';
            }

            ov.querySelectorAll("[data-perm]").forEach(btn => {
                btn.classList.toggle("locked", Boolean(st.adminCid && !h.canPerm(st.adminCid, btn.dataset.perm)));
            });

            const c = h.getContest(st.adminCid);
            const info = c ? getPhaseInfo(c, st.data.entries, st.data.votes) : { phase: "idle", remaining: 0 };
            const phMap = { idle: "متوقفة", archived: "مؤرشفة", submission: "التقديم", voting: "التصويت", drawing: "السحب", judging: "الفرز", tiebreaker: "تعادل", results: "النتائج" };
            document.getElementById("lcea-st-ph").textContent = (info.paused ? "⏸️ " : "") + (phMap[info.phase] || info.phase);
            const cdEl = document.getElementById("lcea-cur-cd"); if (cdEl) cdEl.textContent = info.remaining ? h.fmtTime(info.remaining) : "--:--:--";
            const mtEl = document.getElementById("lcea-mult-tag"); if (mtEl) { const m = Math.max(1, Number(c?.voteMultiplier) || 1); mtEl.textContent = m > 1 ? `⚡ ×${m} نشط` : "×1 عادي"; }

            const spBox = document.getElementById("lcea-special-act");
            if (spBox) {
                if (c && "raffle" === c.template && !c.resultsPublished && h.canPerm(c.id, "control")) {
                    spBox.style.display = "block";
                    spBox.innerHTML = `<button type="button" id="lcea-sp-draw" class="lcea-btn lcea-b-gold"><i class="fas fa-dice"></i> إجراء السحب العشوائي الآن (${Math.max(1, Number(c.maxWinners) || 1)} فائزين)</button>`;
                    document.getElementById("lcea-sp-draw").onclick = () => runRaffleDraw(c.id, c);
                } else if (c && "bracket" === c.template && !c.resultsPublished && h.canPerm(c.id, "control")) {
                    spBox.style.display = "block";
                    const hasBr = Boolean(c.bracket?.matches?.length);
                    spBox.innerHTML = `<button type="button" id="lcea-sp-br" class="lcea-btn lcea-b-red"><i class="fas fa-random"></i> ${hasBr ? `تأهيل الفائزين للجولة #${c.bracket.round + 1}` : "سحب قرعة الجولة #1 وبدء المواجهات"}</button>`;
                    document.getElementById("lcea-sp-br").onclick = () => hasBr ? advanceBracketRound(c.id, c) : startBracketTournament(c.id, c);
                } else spBox.style.display = "none";
            }

            const entriesArr = Object.values(st.data.entries || {});
            const pendCnt = entriesArr.filter(e => e && "pending" === e.status).length;
            const trCnt = Object.keys(st.data.transfers || {}).length;
            const onCnt = Object.values(st.data.presence || {}).filter(x => x && Date.now() - (x.ts || 0) < 18e5).length;
            document.getElementById("lcea-st-en").textContent = entriesArr.length;
            document.getElementById("lcea-st-vt").textContent = Object.keys(st.data.votes || {}).length;
            document.getElementById("lcea-st-on").textContent = onCnt;

            const pb = document.getElementById("lcea-pbdg");
            if (pb) { pb.textContent = pendCnt; pb.style.display = pendCnt > 0 ? "inline-block" : "none"; }
            const tb = document.getElementById("lcea-tbdg");
            if (tb) { tb.textContent = trCnt; tb.style.display = trCnt > 0 ? "inline-block" : "none"; }
            const tc = document.getElementById("lcea-tr-cnt");
            if (tc) tc.textContent = trCnt;

            if ("contests" === st.adminTab) this.renderContestsList();
            else if ("entries" === st.adminTab) this.renderEntries();
            else if ("votes" === st.adminTab) { this.renderTransfers(); this.renderVotes(); }
            else if ("radar" === st.adminTab) { this.renderPresence(); this.renderBans(); }
            else if ("prizes" === st.adminTab) this.renderPrizesAdmin();
            else if ("settings" === st.adminTab) { this.renderMgrList(); this.renderVipList(); this.renderSubAdminList(); }
            else if ("analytics" === st.adminTab) { this.renderAnalytics(); this.renderHof(); this.renderLogs(); }
        },

        renderContestsList() {
            const box = document.getElementById("lcea-contests-list"); if (!box) return;
            const ids = this.getManagedContestIds();
            if (!ids.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:18px;font-size:12px;">لا توجد مسابقات حتى الآن. أنشئ أول مسابقة بالأعلى ✨</div>'; return; }
            const fullAdm = this.isFullAdmin();
            box.innerHTML = ids.map(id => {
                const c = h.getContest(id), tmpl = TEMPLATES[c.template] || TEMPLATES.royal, info = getPhaseInfo(c), isSel = id === st.adminCid;
                return `<div class="lcea-card" style="${isSel ? "border-color:#D4AF37;background:rgba(212,175,55,.06);" : ""}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
                        <b style="font-size:13px;"><i class="fas ${h.esc(c.icon || tmpl.icon)}" style="color:#D4AF37;margin-left:5px;"></i>${h.esc(c.title)} <span style="font-size:10.5px;color:#94a3b8;">(${tmpl.name} • #${c.season || 1})</span></b>
                        <div class="lcea-row" style="gap:4px;">
                            ${c.isLegacy ? '<span class="lcea-tag lcea-t-green">🔗 جسر مباشر</span>' : ""}
                            ${c.showInMenu && "active" === c.status ? '<span class="lcea-tag lcea-t-gold">📌 بالقائمة</span>' : ""}
                            ${phaseBadgeHtml(info.phase, info.paused)}
                        </div>
                    </div>
                    <div class="lcea-row" style="gap:5px;">
                        <button type="button" class="lcea-btn lcea-b-info lcea-mini lcea-sel-c" data-id="${h.esc(id)}"><i class="fas fa-sliders-h"></i> تحكم</button>
                        <button type="button" class="lcea-btn lcea-b-ok lcea-mini lcea-view-c" data-id="${h.esc(id)}"><i class="fas fa-eye"></i> فتح</button>
                        <button type="button" class="lcea-btn lcea-b-dark lcea-mini lcea-tog-menu" data-id="${h.esc(id)}">${c.showInMenu ? "إخفاء الزر" : "إظهار الزر"}</button>
                        ${fullAdm ? `<button type="button" class="lcea-btn lcea-b-warn lcea-mini lcea-clone-c" data-id="${h.esc(id)}" title="نسخ المسابقة بإعداداتها"><i class="fas fa-copy"></i> نسخ</button>` : ""}
                        ${fullAdm ? `<button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-del-c" data-id="${h.esc(id)}" style="margin-right:auto;" title="${c.isLegacy ? "إغلاق وتصفير" : "حذف نهائي"}"><i class="fas fa-trash"></i></button>` : ""}
                    </div>
                </div>`;
            }).join("");

            box.querySelectorAll(".lcea-sel-c").forEach(b => b.onclick = () => {
                st.adminCid = b.dataset.id;
                syncHeavyStreams(); this.rebindPresenceStream(); this.populateSettings(); this.switchTab("control");
            });
            box.querySelectorAll(".lcea-view-c").forEach(b => b.onclick = () => { this.close(); window.LaylContests.open(b.dataset.id); });
            box.querySelectorAll(".lcea-tog-menu").forEach(b => b.onclick = () => {
                const c = h.getContest(b.dataset.id); if (!c || !h.canPerm(b.dataset.id, "control")) return;
                this.patchContest(b.dataset.id, { showInMenu: !c.showInMenu }, !c.showInMenu ? "📌 ظهر الزر في القائمة" : "تم إخفاء الزر من القائمة");
            });
            box.querySelectorAll(".lcea-clone-c").forEach(b => b.onclick = () => {
                const c = h.getContest(b.dataset.id); if (!c || !confirm(`إنشاء نسخة جديدة من (${c.title}) بنفس القوانين والإعدادات؟`)) return;
                dbOps.cloneContest(b.dataset.id).then(newCid => {
                    st.adminCid = newCid;
                    this.log("نسخ مسابقة", c.title);
                    syncHeavyStreams(); this.rebindPresenceStream(); this.populateSettings();
                    showToast("📋 تم نسخ المسابقة بنجاح (مخفية من القائمة حتى تفعّل زرها)!", 4000, "gold");
                }).catch(() => alert("❌ فشل النسخ."));
            });
            box.querySelectorAll(".lcea-del-c").forEach(b => b.onclick = () => {
                const id = b.dataset.id, c = h.getContest(id); if (!c) return;
                if (c.isLegacy) {
                    if (!confirm("⚠️ إغلاق وتصفير مسابقة «ملك وملكة الشات» الحالية وإخفاء زرها؟ (تبقى قاعة الشرف محفوظة)")) return;
                    st.db?.ref(LEGACY_ROOT).update({ state: { status: "cleared", season: c.season || 1, showInMenu: !1 }, candidates: null, votes: null, transfers: null }).then(() => {
                        this.log("إغلاق وتصفير", c.title); showToast("🗑️ تم الإغلاق والتصفير");
                    });
                    return;
                }
                if (!confirm(`⚠️ حذف مسابقة (${c.title}) وجميع مشاركاتها وأصواتها نهائياً؟`)) return;
                const up = {}; up[`index/${id}`] = null; up[`data/${id}`] = null;
                st.db?.ref(ROOT).update(up).then(() => {
                    this.log("حذف مسابقة", c.title);
                    if (st.adminCid === id) st.adminCid = null;
                    showToast("🗑️ تم حذف المسابقة نهائياً");
                });
            });
        },

        renderEntries() {
            const box = document.getElementById("lcea-entries-list"), c = h.getContest(st.adminCid);
            if (!box || !c) return;
            const counts = computeVoteCounts(st.data.entries, st.data.votes);
            const q = (document.getElementById("lcea-eq")?.value || "").trim().toLowerCase();
            const list = Object.entries(st.data.entries || {})
                .filter(([, it]) => it && (!q || `${it.displayName || ""} ${it.username || ""} ${it.partnerName || ""} ${it.text || ""} ${it.title || ""}`.toLowerCase().includes(q)))
                .sort((a, b) => ("pending" === a[1].status ? -1 : 1) - ("pending" === b[1].status ? -1 : 1) || (counts[b[0]] || 0) - (counts[a[0]] || 0));
            if (!list.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:18px;font-size:12px;">لا توجد مشاركات مطابقة.</div>'; return; }
            const isPhoto = "photo" === c.template, isDuo = "duo" === c.template, isTeams = "teams" === c.template;
            const noVotes = ["prediction", "raffle", "quiz"].includes(c.template);
            box.innerHTML = list.map(([k, it]) => {
                const pend = "pending" === it.status, frz = Boolean(it.frozen);
                const thumb = isPhoto ? it.image : it.avatar;
                const avHtml = h.isValidImg(thumb)
                    ? `<img loading="lazy" decoding="async" src="${h.esc(thumb)}" class="lcea-ezoom" style="width:36px;height:36px;border-radius:${isPhoto ? "7px" : "50%"};object-fit:cover;border:1.5px solid #D4AF37;cursor:zoom-in;flex-shrink:0;">`
                    : `<div style="width:36px;height:36px;border-radius:50%;background:#1e293b;border:1.5px solid #D4AF37;color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;"><i class="fas ${h.esc(c.icon || "fa-crown")}"></i></div>`;
                return `<div class="lcea-card" style="${pend ? "border-color:#f59e0b;" : it.isWinner ? "border-color:#10b981;" : frz ? "border-color:#38bdf8;" : ""}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
                        <div style="display:flex;align-items:center;gap:8px;min-width:0;">${avHtml}<b style="font-size:12.5px;">${isDuo ? `${h.esc(it.displayName)} ❤️ ${h.esc(it.partnerName || "")}` : h.esc(it.displayName || it.username)}</b></div>
                        <div class="lcea-row" style="gap:4px;">
                            ${frz ? '<span class="lcea-tag lcea-t-blue">❄️ مجمد</span>' : ""}
                            ${it.isWinner ? '<span class="lcea-tag lcea-t-green">🏆 فائز</span>' : ""}
                            <span class="lcea-tag ${pend ? "lcea-t-red" : "lcea-t-green"}">${pend ? "⏳ معلق" : "✅ معتمد"}</span>
                            ${!noVotes ? `<span class="lcea-tag lcea-t-gold">${counts[k] || 0} ${isTeams ? "نقطة" : "صوت"}</span>` : ""}
                        </div>
                    </div>
                    ${it.text ? `<div style="font-size:11.5px;color:#94a3b8;margin-bottom:7px;white-space:pre-line;">«${h.esc(it.text)}»</div>` : ""}
                    <div class="lcea-row" style="gap:4px;">
                        ${pend ? `<button type="button" class="lcea-btn lcea-b-ok lcea-mini lcea-e-app" data-k="${h.esc(k)}">اعتماد ✓</button>` : ""}
                        ${noVotes ? `<button type="button" class="lcea-btn ${it.isWinner ? "lcea-b-ok" : "lcea-b-warn"} lcea-mini lcea-e-win" data-k="${h.esc(k)}">${it.isWinner ? "إلغاء الفوز" : "تحديد كفائز 🏆"}</button>` : ""}
                        <button type="button" class="lcea-btn lcea-b-info lcea-mini lcea-e-edit" data-k="${h.esc(k)}"><i class="fas fa-edit"></i> تعديل</button>
                        ${!noVotes ? `<button type="button" class="lcea-btn lcea-b-warn lcea-mini lcea-e-adj" data-k="${h.esc(k)}">+/-</button>` : ""}
                        <button type="button" class="lcea-btn ${frz ? "lcea-b-ok" : "lcea-b-dark"} lcea-mini lcea-e-frz" data-k="${h.esc(k)}">${frz ? "فك التجميد" : "تجميد ❄️"}</button>
                        <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-e-del" data-k="${h.esc(k)}" style="margin-right:auto;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            }).join("");

            const cid = st.adminCid;
            box.querySelectorAll(".lcea-ezoom").forEach(img => img.onclick = () => openLightbox(img.src));
            box.querySelectorAll(".lcea-e-app").forEach(b => b.onclick = () => dbOps.updateEntry(cid, b.dataset.k, { status: "approved" }).then(() => showToast("✅ تم الاعتماد")));
            box.querySelectorAll(".lcea-e-win").forEach(b => b.onclick = () => { const cur = Boolean(st.data.entries[b.dataset.k]?.isWinner); dbOps.updateEntry(cid, b.dataset.k, { isWinner: !cur }); });
            box.querySelectorAll(".lcea-e-edit").forEach(b => b.onclick = () => this.openEditEntry(cid, b.dataset.k));
            box.querySelectorAll(".lcea-e-frz").forEach(b => b.onclick = () => { const cur = Boolean(st.data.entries[b.dataset.k]?.frozen); dbOps.updateEntry(cid, b.dataset.k, { frozen: !cur }); });
            box.querySelectorAll(".lcea-e-adj").forEach(b => b.onclick = () => {
                if (!h.canPerm(cid, "votes")) return showToast("لا تملك صلاحية تعديل الأصوات", 3000, "red");
                const cur = Number(st.data.entries[b.dataset.k]?.bonusVotes) || 0, val = parseInt(prompt("أصوات / نقاط إضافية (موجب أو سالب):", String(cur)), 10);
                if (!isNaN(val)) dbOps.updateEntry(cid, b.dataset.k, { bonusVotes: val }).then(() => showToast("✅ تم التعديل"));
            });
            box.querySelectorAll(".lcea-e-del").forEach(b => b.onclick = () => { if (confirm("حذف هذه المشاركة نهائياً؟")) dbOps.removeEntry(cid, b.dataset.k).then(() => { this.log("حذف مشاركة", c.title, b.dataset.k); showToast("🗑️ تم الحذف"); }); });
        },

        renderTransfers() {
            const box = document.getElementById("lcea-tr-list"), cid = st.adminCid, c = h.getContest(cid);
            if (!box || !c) return;
            const list = Object.values(st.data.transfers || {}).filter(Boolean).sort((a, b) => (b.ts || 0) - (a.ts || 0));
            if (!list.length) {
                box.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:11.5px;">لا توجد طلبات انسحاب وتحويل أصوات معلّقة حالياً.</div>';
                return;
            }
            const counts = computeVoteCounts(st.data.entries, st.data.votes);
            box.innerHTML = list.map(req => {
                const liveFrom = counts[req.fromKey] || 0;
                const liveTo = counts[req.toKey] || 0;
                const missing = !st.data.entries?.[req.fromKey] || !st.data.entries?.[req.toKey];
                return `
                <div class="lcea-card" style="border-color:rgba(245,158,11,.45);margin-bottom:7px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px;">
                        <div style="font-size:12px;">
                            <b style="color:#fca5a5;">${h.esc(req.fromName)}</b>
                            <span style="color:#94a3b8;"> ➔ ينسحب ويحول أصواته إلى ➔ </span>
                            <b style="color:#6ee7b7;">${h.esc(req.toName)}</b>
                        </div>
                        <span class="lcea-tag lcea-t-gold">${liveFrom} صوت (${liveTo} ➔ ${liveTo + liveFrom})</span>
                    </div>
                    ${req.reason ? `<div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">💬 «${h.esc(req.reason)}»</div>` : ""}
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:10px;color:#94a3b8;">${h.fmtDate(req.ts)}</span>
                        <div class="lcea-row" style="gap:5px;">
                            ${!missing ? `<button type="button" class="lcea-btn lcea-b-ok lcea-mini lcea-tr-ok" data-fk="${h.esc(req.fromKey)}"><i class="fas fa-check"></i> موافقة وتحويل</button>` : '<span class="lcea-tag lcea-t-red">متسابق محذوف</span>'}
                            <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-tr-no" data-fk="${h.esc(req.fromKey)}"><i class="fas fa-times"></i> رفض</button>
                        </div>
                    </div>
                </div>`;
            }).join("");

            box.querySelectorAll(".lcea-tr-ok").forEach(b => b.onclick = () => {
                if (!h.canPerm(cid, "votes")) return showToast("لا تملك صلاحية إدارة الأصوات", 3000, "red");
                const req = (st.data.transfers || {})[b.dataset.fk];
                if (!req) return;
                const liveV = computeVoteCounts(st.data.entries, st.data.votes)[req.fromKey] || 0;
                if (!confirm(`تأكيد الموافقة على انسحاب (${req.fromName}) وتحويل (${liveV}) صوت إلى (${req.toName})؟\nلا يمكن التراجع بعد التنفيذ.`)) return;

                dbOps.approveTransfer(cid, req).then(res => {
                    this.log("موافقة تحويل أصوات", c.title, `${res.fromName} ➔ ${res.toName} (${res.movedWeight} صوت)`);
                    dbOps.sendCmd(req.fromKey, "alert", `✅ وافقت الإدارة على انسحابك وتحويل أصواتك (${res.movedWeight} صوت) إلى (${res.toName}).`);
                    dbOps.sendCmd(req.toKey, "alert", `🎁 تنازل (${res.fromName}) بأصواته لصالحك! أُضيف لرصيدك (${res.movedWeight} صوت) بموافقة الإدارة.`);
                    showToast(`✅ تم تحويل ${res.movedWeight} صوت إلى ${res.toName}!`, 4000, "gold");
                }).catch(err => alert(`❌ ${err || "تعذر تنفيذ التحويل."}`));
            });

            box.querySelectorAll(".lcea-tr-no").forEach(b => b.onclick = () => {
                if (!h.canPerm(cid, "votes")) return showToast("لا تملك صلاحية إدارة الأصوات", 3000, "red");
                const req = (st.data.transfers || {})[b.dataset.fk];
                if (!req) return;
                const why = prompt(`رفض طلب (${req.fromName}) بتحويل أصواته إلى (${req.toName})؟\nاكتب سبب الرفض (اختياري):`, "");
                if (null === why) return;

                dbOps.rejectTransfer(cid, req.fromKey).then(() => {
                    this.log("رفض تحويل أصوات", c.title, `${req.fromName} ➔ ${req.toName}`);
                    dbOps.sendCmd(req.fromKey, "alert", `❌ تم رفض طلبك بتحويل الأصوات إلى (${req.toName})${why.trim() ? ` — السبب: ${why.trim()}` : ""}.`);
                    showToast("تم رفض الطلب وإشعار العضو.");
                });
            });
        },

        renderVotes() {
            const box = document.getElementById("lcea-votes-list"); if (!box) return;
            const q = (document.getElementById("lcea-vq")?.value || "").trim().toLowerCase();
            const list = Object.entries(st.data.votes || {})
                .map(([k, v]) => Object.assign({ k, targetName: st.data.entries?.[v.target]?.displayName || v.target }, v))
                .filter(x => !q || `${x.voterName} ${x.targetName} ${x.cheer || ""} ${x.k}`.toLowerCase().includes(q))
                .sort((a, b) => (b.ts || 0) - (a.ts || 0));
            if (!list.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:14px;font-size:12px;">لا توجد أصوات.</div>'; return; }
            box.innerHTML = list.slice(0, 140).map(v => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <div style="flex:1;min-width:0;">
                        <b>${h.esc(v.voterName || v.k)}</b> ➔ <b style="color:#D4AF37;">${h.esc(v.targetName)}</b> ${v.weight > 1 ? `<span class="lcea-tag lcea-t-gold">×${v.weight}</span>` : ""} <span style="color:#64748b;font-size:10px;">(${h.fmtDate(v.ts)})</span>
                        ${v.cheer ? `<div style="color:#94a3b8;font-size:10.5px;margin-top:2px;">💬 «${h.esc(v.cheer)}»</div>` : ""}
                    </div>
                    <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-vdel" data-k="${h.esc(v.k)}" style="padding:3px 7px;">سحب</button>
                </div>`).join("");
            box.querySelectorAll(".lcea-vdel").forEach(b => b.onclick = () => { if (st.adminCid && confirm("سحب هذا الصوت؟")) dbOps.removeVote(st.adminCid, b.dataset.k).then(() => showToast("🗑️ تم السحب")); });
        },

        renderPresence() {
            const box = document.getElementById("lcea-pres-list"); if (!box) return;
            const active = Object.entries(st.data.presence || {}).filter(([, v]) => v && Date.now() - (v.ts || 0) < 18e5);
            if (!active.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;font-size:11.5px;padding:8px;">لا يوجد أعضاء داخل المسابقة حالياً.</div>'; return; }
            box.innerHTML = active.map(([k, v]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:5px;">
                    <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b style="color:#34d399;">●</b> <b>${h.esc(v.name || k)}</b> <span style="color:#94a3b8;">— ${h.esc(v.status || "يتصفح")}</span></div>
                    <div class="lcea-row" style="gap:3px;flex-shrink:0;">
                        <button type="button" class="lcea-btn lcea-b-info lcea-mini lcea-pmsg" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-bell"></i></button>
                        <button type="button" class="lcea-btn lcea-b-warn lcea-mini lcea-pkick" data-k="${h.esc(k)}" style="padding:3px 6px;"><i class="fas fa-sign-out-alt"></i></button>
                        <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-pban" data-u="${h.esc(v.name || k)}" style="padding:3px 6px;">حظر</button>
                    </div>
                </div>`).join("");
            box.querySelectorAll(".lcea-pmsg").forEach(b => b.onclick = () => { const m = prompt("رسالة تنبيه للعضو:"); if (m && m.trim()) this.sendUserCmd(b.dataset.k, "alert", m.trim()); });
            box.querySelectorAll(".lcea-pkick").forEach(b => b.onclick = () => { if (confirm("إخراج العضو الآن؟")) this.sendUserCmd(b.dataset.k, "kick", "تم إغلاق نافذة المسابقة من قبل الإدارة."); });
            box.querySelectorAll(".lcea-pban").forEach(b => b.onclick = () => { const inp = document.getElementById("lcea-bu"); if (inp) { inp.value = b.dataset.u; inp.focus(); } });
        },

        renderBans() {
            const box = document.getElementById("lcea-bans-list"); if (!box) return;
            const merged = Object.assign({}, st.legacy.banned || {}, st.banned || {});
            const list = Object.entries(merged), sMap = { all: "كامل", nom: "مشاركة فقط", vote: "تصويت فقط" };
            if (!list.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:12px;font-size:12px;">لا يوجد محظورون.</div>'; return; }
            box.innerHTML = list.map(([k, b]) => {
                const exp = b.expiresAt && Date.now() >= b.expiresAt;
                const scopeTitle = b.contestId && "all" !== b.contestId ? (h.getContest(b.contestId)?.title || "مسابقة محددة") : "كل المسابقات";
                return `<div class="lcea-card" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div><b style="font-size:12.5px;">${h.esc(b.name || k)}</b> <span class="lcea-tag lcea-t-red">${sMap[b.scope] || "كامل"}</span> <span class="lcea-tag lcea-t-gold">${h.esc(scopeTitle)}</span> <span class="lcea-tag lcea-t-blue">${exp ? "منتهي" : h.fmtRem(b.expiresAt)}</span><div style="font-size:10.5px;color:#94a3b8;">${h.esc(b.reason || "بدون سبب")}</div></div>
                    <button type="button" class="lcea-btn lcea-b-ok lcea-mini lcea-unb" data-k="${h.esc(k)}">فك الحظر</button>
                </div>`;
            }).join("");
            box.querySelectorAll(".lcea-unb").forEach(b => b.onclick = () => dbOps.unbanUser(b.dataset.k).then(() => { this.log("فك حظر", b.dataset.k); showToast("✅ تم فك الحظر"); }));
        },

        renderPrizesAdmin() {
            const box = document.getElementById("lcea-pz-list"); if (!box || !st.adminCid) return;
            const fallbackP = isLegacy(st.adminCid) ? ROYAL_DEFAULT_PRIZES : DEFAULT_PRIZES;
            const list = Array.isArray(st.data.prizes) && st.data.prizes.length ? st.data.prizes : fallbackP;
            box.innerHTML = list.map((p, i) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.24);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <div style="flex:1;min-width:0;"><i class="fas ${h.esc(p.icon || "fa-crown")}" style="color:#D4AF37;margin-left:5px;"></i><b>${h.esc(p.title)}</b> <span style="color:#94a3b8;">(${h.esc(p.dur || "-")})</span></div>
                    <div class="lcea-row" style="gap:3px;">
                        ${i > 0 ? `<button type="button" class="lcea-btn lcea-b-dark lcea-mini lcea-pz-up" data-i="${i}" style="padding:3px 6px;"><i class="fas fa-arrow-up"></i></button>` : ""}
                        <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-pz-del" data-i="${i}" style="padding:3px 6px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`).join("");
            box.querySelectorAll(".lcea-pz-up").forEach(b => b.onclick = () => { const a = list.slice(), i = Number(b.dataset.i); [a[i - 1], a[i]] = [a[i], a[i - 1]]; dbOps.setPrizes(st.adminCid, a); });
            box.querySelectorAll(".lcea-pz-del").forEach(b => b.onclick = () => { const a = list.slice(); a.splice(Number(b.dataset.i), 1); dbOps.setPrizes(st.adminCid, a); });
        },

        renderMgrList() {
            const box = document.getElementById("lcea-mgr-list"), c = h.getContest(st.adminCid); if (!box || !c) return;
            const list = c.cfg.managers || [];
            box.innerHTML = list.length ? list.map((u, i) => `<span class="lcea-tag lcea-t-blue" style="margin:2px;">🛡️ ${h.esc(u)} ${this.isFullAdmin() ? `<i class="fas fa-times lcea-mrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i>` : ""}</span>`).join("") : '<span style="color:#64748b;font-size:11px;">لا يوجد مديرون مخصصون لهذه المسابقة.</span>';
            box.querySelectorAll(".lcea-mrm").forEach(el => el.onclick = () => { if (!this.isFullAdmin()) return; const n = list.slice(); n.splice(Number(el.dataset.i), 1); this.patchContestCfg(st.adminCid, { managers: n }, "تمت الإزالة"); });
        },

        renderVipList() {
            const box = document.getElementById("lcea-vip-list"); if (!box) return;
            const list = st.global.vipUsers || [];
            box.innerHTML = list.length ? list.map((u, i) => `<span class="lcea-tag lcea-t-gold" style="margin:2px;">⭐ ${h.esc(u)} <i class="fas fa-times lcea-vrm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i></span>`).join("") : '<span style="color:#64748b;font-size:11px;">لا يوجد أعضاء VIP.</span>';
            box.querySelectorAll(".lcea-vrm").forEach(el => el.onclick = () => { const n = list.slice(); n.splice(Number(el.dataset.i), 1); this.patchGlobal({ vipUsers: n }, "تمت الإزالة"); });
        },

        renderSubAdminList() {
            const box = document.getElementById("lcea-sa-list"); if (!box) return;
            const list = st.global.subAdmins || [];
            box.innerHTML = list.length ? list.map((u, i) => `<span class="lcea-tag lcea-t-blue" style="margin:2px;">🛡️ ${h.esc(u)} ${h.isSuperAdmin() ? `<i class="fas fa-times lcea-srm" data-i="${i}" style="cursor:pointer;color:#f87171;"></i>` : ""}</span>`).join("") : '<span style="color:#64748b;font-size:11px;">لا يوجد مشرفون مساعدون.</span>';
            box.querySelectorAll(".lcea-srm").forEach(el => el.onclick = () => { if (!h.isSuperAdmin()) return; const n = list.slice(); n.splice(Number(el.dataset.i), 1); this.patchGlobal({ subAdmins: n }, "تمت الإزالة"); });
        },

        renderAnalytics() {
            const box = document.getElementById("lcea-an-box"); if (!box) return;
            const counts = computeVoteCounts(st.data.entries, st.data.votes), entries = getApprovedEntries(st.data.entries);
            const totW = Object.values(counts).reduce((a, b) => a + b, 0);
            const top = entries.slice().sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0)).slice(0, 5);
            box.innerHTML = `
                <div class="lcea-g3" style="margin-bottom:8px;">
                    <div class="lcea-stat"><div class="lcea-stat-v">${entries.length}</div><div class="lcea-stat-l">مشاركات معتمدة</div></div>
                    <div class="lcea-stat"><div class="lcea-stat-v">${Object.keys(st.data.votes || {}).length}</div><div class="lcea-stat-l">مصوّتون</div></div>
                    <div class="lcea-stat"><div class="lcea-stat-v">${totW}</div><div class="lcea-stat-l">إجمالي النقاط</div></div>
                </div>
                ${top.map((e, i) => `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(0,0,0,.22);border-radius:7px;margin-bottom:3px;font-size:11.5px;"><span>${i + 1}. <b>${h.esc(e.displayName || e.username)}</b></span><span class="lcea-tag lcea-t-gold">${counts[e.key] || 0}</span></div>`).join("")}`;
        },

        renderHof() {
            const box = document.getElementById("lcea-hof-list"); if (!box) return;
            const list = getMergedHofList();
            if (!list.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:12px;">قاعة الشرف فارغة.</div>'; return; }
            box.innerHTML = list.map(w => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;gap:6px;">
                    <span><b>${h.esc(w.name)}</b> <span style="color:#94a3b8;">(${h.esc(w.contestTitle || "")} • ${h.esc(w.categoryLabel || "")})</span></span>
                    <button type="button" class="lcea-btn lcea-b-dng lcea-mini lcea-hdel" data-src="${h.esc(w._src)}" data-k="${h.esc(w._key)}" style="padding:3px 7px;"><i class="fas fa-trash"></i></button>
                </div>`).join("");
            box.querySelectorAll(".lcea-hdel").forEach(b => b.onclick = () => { if (confirm("حذف من قاعة الشرف؟")) dbOps.removeHof(b.dataset.src, b.dataset.k); });
        },

        renderLogs() {
            const box = document.getElementById("lcea-logs-list"); if (!box) return;
            const q = (document.getElementById("lcea-log-q")?.value || "").trim().toLowerCase();
            const list = st.logs.filter(x => !q || `${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
            if (!list.length) { box.innerHTML = '<div style="text-align:center;color:#64748b;padding:10px;font-size:12px;">لا توجد سجلات.</div>'; return; }
            box.innerHTML = list.map(x => `
                <div style="padding:6px 9px;background:rgba(0,0,0,.22);border-radius:8px;margin-bottom:4px;font-size:11.5px;">
                    <div style="display:flex;justify-content:space-between;"><span class="lcea-tag lcea-t-gold">${h.esc(x.action)}</span><span style="font-size:10px;color:#94a3b8;">${h.fmtDate(x.ts)}</span></div>
                    <div style="margin-top:2px;"><b style="color:#D4AF37;">${h.esc(x.admin)}</b> ➔ <b style="color:#38bdf8;">${h.esc(x.target)}</b> ${x.details ? `<span style="color:#94a3b8;">(${h.esc(x.details)})</span>` : ""}</div>
                </div>`).join("");
        }
    };

    // ==================== تحميل البيانات الثقيلة عند الطلب مع Debounce لمنع التجمّد ====================
    function syncHeavyStreams() {
        if (!st.db) return;
        const userOpen = Boolean(document.getElementById("lce-modal")?.classList.contains("open"));
        const admOpen = Boolean(document.getElementById("lce-admin-modal"));
        const targetCid = admOpen ? st.adminCid : (userOpen && "contest" === st.viewMode ? st.activeCid : null);
        clearTimeout(st.heavyDetachTimer);

        if (targetCid) {
            if (st.heavyCid === targetCid) return;
            (st.heavyRefs || []).forEach(r => { try { r.off(); } catch (e) {} });
            st.heavyRefs = [];
            st.heavyCid = targetCid;
            st.heavyLoaded = !1;
            const defP = isLegacy(targetCid) ? ROYAL_DEFAULT_PRIZES.slice() : DEFAULT_PRIZES.slice();
            st.data = { entries: {}, votes: {}, transfers: {}, prizes: defP, presence: st.data.presence || {} };

            const bind = (fullPath, fn) => {
                const ref = st.db.ref(fullPath);
                ref.on("value", fn);
                st.heavyRefs.push(ref);
            };

            if (isLegacy(targetCid)) {
                bind(`${LEGACY_ROOT}/candidates`, sn => {
                    const raw = sn.val() || {}, norm = {};
                    Object.entries(raw).forEach(([k, c]) => {
                        if (!c) return;
                        norm[k] = {
                            uid: c.uid || "", username: c.username || k, displayName: c.displayName || c.username || k,
                            html: c.html || h.esc(c.displayName || c.username || k), avatar: c.avatar || "", image: "",
                            partnerName: "", partnerAvatar: "", ytId: "", tickets: 1,
                            category: "queen" === c.role ? "cat2" : "cat1", title: "", text: c.slogan || "",
                            badge: c.badge || "", frozen: Boolean(c.frozen), isWinner: !1,
                            status: c.status || "approved", bonusVotes: Number(c.bonusVotes) || 0, joinedAt: c.joinedAt || 0
                        };
                    });
                    st.data.entries = norm;
                    const first = !st.heavyLoaded;
                    st.heavyLoaded = !0;
                    scheduleRenderMain(first ? 0 : 120);
                    contestsAdmin.scheduleRefresh(first ? 0 : 200);
                });
                bind(`${LEGACY_ROOT}/votes`, sn => {
                    const raw = sn.val() || {}, norm = {};
                    Object.entries(raw).forEach(([k, v]) => {
                        if (!v || !v.target) return;
                        norm[k] = {
                            target: v.target, category: "queen" === v.role ? "cat2" : "cat1",
                            matchKey: null, voterName: v.voterName || k, cheer: v.cheer || "",
                            weight: Math.max(1, Number(v.weight) || 1), ts: v.ts || 0
                        };
                    });
                    st.data.votes = norm;
                    if (st.heavyLoaded) scheduleRenderMain(350);
                    contestsAdmin.scheduleRefresh(400);
                });
                bind(`${LEGACY_ROOT}/transfers`, sn => {
                    st.data.transfers = sn.val() || {};
                    if (st.heavyLoaded) scheduleRenderMain(150);
                    contestsAdmin.scheduleRefresh(150);
                });
                bind(`${LEGACY_ROOT}/prizes`, sn => {
                    const v = sn.val();
                    st.data.prizes = Array.isArray(v) && v.length ? v : ROYAL_DEFAULT_PRIZES.slice();
                    contestsAdmin.scheduleRefresh(150);
                });
            } else {
                bind(`${ROOT}/data/${targetCid}/entries`, sn => {
                    st.data.entries = sn.val() || {};
                    const first = !st.heavyLoaded;
                    st.heavyLoaded = !0;
                    scheduleRenderMain(first ? 0 : 120);
                    contestsAdmin.scheduleRefresh(first ? 0 : 200);
                });
                bind(`${ROOT}/data/${targetCid}/votes`, sn => {
                    st.data.votes = sn.val() || {};
                    if (st.heavyLoaded) scheduleRenderMain(350);
                    contestsAdmin.scheduleRefresh(400);
                });
                bind(`${ROOT}/data/${targetCid}/transfers`, sn => {
                    st.data.transfers = sn.val() || {};
                    if (st.heavyLoaded) scheduleRenderMain(150);
                    contestsAdmin.scheduleRefresh(150);
                });
                bind(`${ROOT}/data/${targetCid}/prizes`, sn => {
                    const v = sn.val();
                    st.data.prizes = Array.isArray(v) && v.length ? v : DEFAULT_PRIZES.slice();
                    contestsAdmin.scheduleRefresh(150);
                });
            }
        } else if (st.heavyCid) {
            st.heavyDetachTimer = setTimeout(() => {
                const uo = Boolean(document.getElementById("lce-modal")?.classList.contains("open"));
                const ao = Boolean(document.getElementById("lce-admin-modal"));
                if (ao || (uo && "contest" === st.viewMode)) return;
                (st.heavyRefs || []).forEach(r => { try { r.off(); } catch (e) {} });
                st.heavyRefs = [];
                st.heavyCid = null;
                st.heavyLoaded = !1;
                st.data = { entries: {}, votes: {}, transfers: {}, prizes: DEFAULT_PRIZES.slice(), presence: {} };
            }, 400);
        }
    }

    // ==================== الواجهة البرمجية العامة (+ توافق خلفي مع ملك وملكة الشات) ====================
    window.LaylContests = {
        openHub() {
            if (!h.isAdmin() && !h.isVip() && !1 === st.global.enabled) return alert(st.global.disabledMsg || DEFAULT_GLOBAL.disabledMsg);
            const ban = h.getMyBan(null);
            if (!h.isAdmin() && ban && "all" === ban.scope && (!ban.contestId || "all" === ban.contestId)) {
                return alert(`تم منعك من المسابقات 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
            }
            ensureUserModal();
            st.viewMode = "hub";
            st.activeCid = null;
            document.getElementById("lce-live-ad")?.classList.remove("show");
            document.getElementById("lce-mini-fab").style.display = "none";
            document.getElementById("lce-fab-txt").textContent = st.global.hubTitle || "مركز المسابقات";
            document.getElementById("lce-modal").classList.add("open");
            setPresence(null, null);
            syncHeavyStreams();
            renderHub();
            startCountdownLoop();
        },
        open(cid) {
            if (!cid) return this.openHub();
            const c = h.getContest(cid);
            if (!c) return this.openHub();
            if (!h.isAdmin(cid) && !h.isVip(cid) && (!1 === st.global.enabled || !1 === c.cfg.enabled)) {
                return alert(st.global.disabledMsg || DEFAULT_GLOBAL.disabledMsg);
            }
            const ban = h.getMyBan(cid);
            if (!h.isAdmin(cid) && ban && "all" === ban.scope) {
                return alert(`تم منعك من هذه المسابقة 🚫${ban.reason ? "\nالسبب: " + ban.reason : ""}`);
            }
            ensureUserModal();
            st.viewMode = "contest";
            st.activeCid = cid;
            st.catFilter = "all";
            st.searchQuery = "";
            document.getElementById("lce-live-ad")?.classList.remove("show");
            document.getElementById("lce-mini-fab").style.display = "none";
            document.getElementById("lce-fab-txt").textContent = c.title || "المسابقة";
            document.getElementById("lce-modal").classList.add("open");
            syncHeavyStreams();
            setPresence(cid, `يتصفح ${c.title}`);
            maybeShowWelcome(cid, c);
            renderMainBody();
            startCountdownLoop();
        },
        close() {
            clearInterval(st.timerId);
            clearTimeout(st.renderTimer);
            document.getElementById("lce-modal")?.classList.remove("open");
            const fab = document.getElementById("lce-mini-fab");
            if (fab) fab.style.display = "none";
            setPresence(null, null);
            syncHeavyStreams();
        },
        minimize() {
            clearInterval(st.timerId);
            clearTimeout(st.renderTimer);
            document.getElementById("lce-modal")?.classList.remove("open");
            const fab = document.getElementById("lce-mini-fab");
            if (fab) fab.style.display = "flex";
            syncHeavyStreams();
        },
        restore() {
            if ("contest" === st.viewMode && st.activeCid) this.open(st.activeCid);
            else this.openHub();
        },
        openAdmin: (cid = null) => contestsAdmin.open(cid)
    };

    window.LaylRoyalContest = {
        open: () => window.LaylContests.open(LEGACY_CID),
        close: () => window.LaylContests.close(),
        minimize: () => window.LaylContests.minimize(),
        restore: () => window.LaylContests.restore(),
        openAdmin: () => contestsAdmin.open(LEGACY_CID)
    };

    // ==================== ربط الأزرار تلقائياً في LaylMenu (مُجمّع بـ Debounce لمنع التهنيج) ====================
    const menuItemStore = {};

    function registerOrUpdateMenu(item) {
        if (menuItemStore[item.id]) {
            Object.assign(menuItemStore[item.id], item);
            return;
        }
        menuItemStore[item.id] = item;
        if (window.LaylMenu) window.LaylMenu.register(item);
        else (window.__laylMenuQueue = window.__laylMenuQueue || []).push(item);
    }

    function applyMenuDecorations() {
        let css = "";
        let pinnedSlotUsed = !1;
        h.getAllContestIds()
            .sort((a, b) => (h.getContest(b)?.createdAt || 0) - (h.getContest(a)?.createdAt || 0))
            .forEach(cid => {
                const c = h.getContest(cid);
                if (!c || "active" !== c.status || !1 === c.showInMenu || !c.pinTop) return;
                const th = h.getTheme(c.theme), sel = `#btn-lce-c-${cid}`;
                if (!pinnedSlotUsed) {
                    pinnedSlotUsed = !0;
                    css += `${sel}{grid-row:1!important;grid-column:-2 / -1!important;}`;
                }
                css += `
                ${sel} .modern-classic-icon-wrapper{
                    position:relative!important;overflow:visible!important;
                    border:1.5px solid ${th.accent}!important;
                    box-shadow:0 0 10px ${th.soft}!important;
                }
                ${sel} .modern-classic-icon-wrapper::before{
                    content:"";position:absolute;inset:-2px;border-radius:inherit;
                    border:1.5px solid ${th.accent};opacity:.35;pointer-events:none;
                    animation:lceGoldPulse 2.8s ease-in-out infinite;
                }`;
            });

        let ds = document.getElementById("lce-dynamic-menu-style");
        if (!ds) {
            ds = document.createElement("style");
            ds.id = "lce-dynamic-menu-style";
            (document.head || document.documentElement).appendChild(ds);
        }
        if (ds.textContent !== css) ds.textContent = css;
        pinTopMenuBtns();
    }

    function scheduleSyncMenuItems(delayMs = 120) {
        clearTimeout(st.menuSyncTimer);
        if (delayMs <= 0) { syncMenuItems(); return; }
        st.menuSyncTimer = setTimeout(syncMenuItems, delayMs);
    }

    function syncMenuItems() {
        registerOrUpdateMenu({
            id: "btn-lce-hub",
            text: st.global.hubTitle || "مركز المسابقات",
            icon: "fas fa-trophy",
            iconColor: "#D4AF37",
            iconBg: "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(181,146,38,0.1))",
            bold: !0,
            condition: () => Boolean(st.global.showHubInMenu) && (!1 !== st.global.enabled || h.isAdmin() || h.isVip()),
            onClick: () => window.LaylContests.openHub()
        });

        h.getAllContestIds().forEach(cid => {
            const c = h.getContest(cid);
            if (!c) return;
            const th = h.getTheme(c.theme), tmpl = TEMPLATES[c.template] || TEMPLATES.royal;
            registerOrUpdateMenu({
                id: `btn-lce-c-${cid}`,
                text: c.title || "مسابقة",
                icon: `fas ${c.icon || tmpl.icon}`,
                iconColor: th.accent,
                iconBg: "gold" === c.theme
                    ? "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(181,146,38,0.1))"
                    : `linear-gradient(135deg, ${th.soft}, rgba(15,17,28,0.4))`,
                bold: !0,
                condition: () => {
                    const cur = h.getContest(cid);
                    return Boolean(cur && "active" === cur.status && !1 !== cur.showInMenu && (!1 !== cur.cfg.enabled || h.isAdmin(cid) || h.isVip(cid)) && (!1 !== st.global.enabled || h.isAdmin(cid) || h.isVip(cid)));
                },
                onClick: () => window.LaylContests.open(cid)
            });
        });

        registerOrUpdateMenu({
            id: "btn-lce-admin",
            text: "إدارة المسابقات",
            icon: "fas fa-sliders-h",
            iconColor: "#fbbf24",
            iconBg: "linear-gradient(135deg, #422006, #a16207)",
            condition: () => h.isAdmin(),
            onClick: () => contestsAdmin.open()
        });

        applyMenuDecorations();
        window.LaylMenu?.refresh?.();
    }

    // ==================== ربط Firebase والهوية والجسر المباشر ====================
    function handleIncomingCmd(sn) {
        const v = sn.val(); if (!v || !v.cmd) return;
        sn.ref.remove().catch(() => {});
        if (v.ts && Date.now() - v.ts > 6e4) return;
        if ("kick" === v.cmd && !h.isAdmin()) { window.LaylContests.close(); alert(v.text || "تم إخراجك من المسابقة."); }
        else if ("alert" === v.cmd && v.text) showToast(`📩 تنبيه الإدارة: ${v.text}`, 8000, "gold");
    }

    function checkActiveBanKick(v, legacySource) {
        if (v && "all" === v.scope && (!v.expiresAt || Date.now() < v.expiresAt) && !h.isAdmin(st.activeCid)) {
            const applies = legacySource
                ? isLegacy(st.activeCid)
                : (!v.contestId || "all" === v.contestId || v.contestId === st.activeCid);
            if (applies && document.getElementById("lce-modal")?.classList.contains("open")) {
                window.LaylContests.close();
                alert(`تم حظرك من المسابقة 🚫${v.reason ? "\nالسبب: " + v.reason : ""}`);
            }
        }
    }

    function bindCmdListener() {
        if (!st.db) return;
        const k = h.myKey();
        if (!k || st.cmdUser === k) return;
        [st.cmdRef, st.legacyCmdRef, st.myBanRef, st.myLegacyBanRef].forEach(r => { try { r?.off(); } catch (e) {} });
        st.cmdUser = k;
        st.cmdRef = st.db.ref(`${ROOT}/cmds/${k}`);
        st.cmdRef.on("value", handleIncomingCmd);
        st.legacyCmdRef = st.db.ref(`${LEGACY_ROOT}/cmds/${k}`);
        st.legacyCmdRef.on("value", handleIncomingCmd);

        st.myBanRef = st.db.ref(`${ROOT}/banned/${k}`);
        st.myBanRef.on("value", sn => {
            const v = sn.val();
            if (v) st.banned[k] = v; else delete st.banned[k];
            checkActiveBanKick(v, !1);
        });
        st.myLegacyBanRef = st.db.ref(`${LEGACY_ROOT}/banned/${k}`);
        st.myLegacyBanRef.on("value", sn => {
            const v = sn.val();
            if (v) st.legacy.banned[k] = v; else delete st.legacy.banned[k];
            checkActiveBanKick(v, !0);
        });
    }

    function initFirebase() {
        if ("undefined" !== typeof firebase && firebase.database) {
            if (!firebase.apps.length) firebase.initializeApp(FB_CFG);
            st.db = firebase.database();

            st.db.ref("admins").on("value", sn => {
                st.admins = Object.keys(sn.val() || {});
                scheduleSyncMenuItems(100);
                if (!h.isAdmin()) contestsAdmin.close();
            });
            st.db.ref(`${ROOT}/global`).on("value", sn => {
                const v = sn.val();
                st.global = v && "object" === typeof v ? Object.assign({}, DEFAULT_GLOBAL, v) : Object.assign({}, DEFAULT_GLOBAL);
                scheduleSyncMenuItems(100);
                scheduleRenderMain(120);
                contestsAdmin.scheduleRefresh(150);
            });
            st.db.ref(`${ROOT}/index`).on("value", sn => {
                st.index = sn.val() || {};
                Object.keys(st.index).forEach(cid => announceContestPhase(cid, h.getContest(cid)));
                scheduleSyncMenuItems(100);
                scheduleRenderMain(120);
                contestsAdmin.scheduleRefresh(150);
            });
            st.db.ref(`${ROOT}/broadcast`).on("value", sn => {
                const v = sn.val();
                if (v && v.text && v.ts > st.bootTs && Date.now() - v.ts < 25000) {
                    showBannerToastAd(v.text, v.theme || "gold", v.cid || null);
                }
            });

            // الجسر المباشر الخفيف لمسابقة «ملك وملكة الشات» السارية
            st.db.ref(`${LEGACY_ROOT}/state`).on("value", sn => {
                st.legacy.state = sn.val() || null;
                const lm = buildLegacyMeta();
                if (lm) announceContestPhase(LEGACY_CID, lm);
                scheduleSyncMenuItems(100);
                scheduleRenderMain(120);
                contestsAdmin.scheduleRefresh(150);
            });
            st.db.ref(`${LEGACY_ROOT}/settings`).on("value", sn => {
                const v = sn.val();
                st.legacy.settings = v && "object" === typeof v ? Object.assign({}, LEGACY_DEFAULT_SETTINGS, v) : Object.assign({}, LEGACY_DEFAULT_SETTINGS);
                scheduleSyncMenuItems(100);
                scheduleRenderMain(120);
                contestsAdmin.scheduleRefresh(150);
            });
            st.db.ref(`${LEGACY_ROOT}/broadcast`).on("value", sn => {
                const v = sn.val();
                if (v && v.text && v.ts > st.bootTs && Date.now() - v.ts < 25000) {
                    showBannerToastAd(v.text, v.theme || "gold", LEGACY_CID);
                }
            });

            bindCmdListener();
            syncHeavyStreams();
        } else if (++st.fbTries < 50) {
            setTimeout(initFirebase, 500);
        }
    }

    const syncLogin = id => {
        const val = document.getElementById(id)?.value?.trim();
        if (val && val !== st.myUser) {
            st.myUser = val;
            try { localStorage.setItem("pc_username", val); } catch (e) {}
            scheduleSyncMenuItems(80);
            bindCmdListener();
        }
    };
    document.addEventListener("click", e => {
        if (e.target.closest("#member-login-btn")) syncLogin("member-username");
        if (e.target.closest("#register-btn")) syncLogin("register-username");
        if (e.target.closest('button[onclick*="renderAddons"]')) setTimeout(applyMenuDecorations, 140);
    });
    document.addEventListener("submit", e => {
        if ("member-login-form" === e.target?.id) syncLogin("member-username");
        if ("register-form" === e.target?.id) syncLogin("register-username");
    });

    syncMenuItems();
    initFirebase();
}();
// ====== نهاية الجزء 3 من 3 ======
