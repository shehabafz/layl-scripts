!function () {
    "use strict";
    if (window.laylChatShortcutsLoaded) return;
    window.laylChatShortcutsLoaded = !0;

    const ADDONS_CACHE_KEY = "lsc_dynamic_addons_v3";
    const GAMES_CACHE_KEY = "lsc_dynamic_games_v2";
    const RECENT_CACHE_KEY = "lsc_recent_v1";

    const SUPPORTED_INPUT_IDS = new Set([
        "chat-input",
        "quick-chat-input",
        "wall-post-input",
        "private-chat-input"
    ]);

    const MSG_TEXT_SEL = ".message-text, .quoted-text, .quick-chat-text, .wall-post-text, .wall-comment-text, .private-message-text, .private-msg-text, .pm-text";
    const SKIP_PARENT_SEL = ".lsc-chip, .user-identity, .message-time, .quick-chat-time, .wall-post-time, button, a, input, textarea, script, style";

    const norm = s => String(s || "").replace(/\s+/g, " ").trim();
    const stripCount = s => norm(s).replace(/\s*\(\d+\)\s*$/, "").trim();
    const esc = s => String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

    const normAr = s => String(s || "")
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();

    function normIcon(ico, fallback = "fas fa-bolt") {
        const s = norm(ico);
        if (!s) return fallback;
        return /\b(fas|far|fab|fa-solid|fa-regular|fa-brands)\b/.test(s) ? s : `fas ${s}`;
    }

    function safeColor(c, fallback = "#D4AF37") {
        const s = norm(c).toLowerCase();
        if (!s || "#fff" === s || "#ffffff" === s || "rgb(255, 255, 255)" === s || "white" === s) return fallback;
        return c;
    }

    function isRestrictedLabel(txt, id = "") {
        return /لوحة\s*تحكم|لوحه\s*التحكم|لوحات\s*التحكم|لوحة\s*الاقتراحات|(?:^|\s)[إا]دارة\s|إرسال\s*إعلان|ارسال\s*اعلان|إرسال\s*استفتاء|ارسال\s*استفتاء/i.test(txt)
            || /admin|custom-ids-dash/i.test(id);
    }

    // فحص فوري بدون getComputedStyle (صفر Layout Reflow)
    function isElementAllowedFast(el) {
        if (!el || !el.isConnected) return !1;
        if (el.hidden || el.disabled || el.hasAttribute("disabled") || "true" === el.getAttribute("aria-disabled")) return !1;
        return !el.classList.contains("d-none") && "none" !== el.style.display;
    }

    // فحص دقيق لعنصر واحد فقط لحظة الضغط الفعلي
    function isElementAllowed(el) {
        if (!isElementAllowedFast(el)) return !1;
        return "none" !== window.getComputedStyle(el).display;
    }

    // فحص الظهور الفعلي داخل الشاشة (يُستخدم فقط أثناء انتظار فتح القوائم بعد الضغط)
    function isVisibleInDOM(el) {
        return isElementAllowed(el) && el.getClientRects().length > 0;
    }

    function getCleanBtnText(btn) {
        if (!btn) return "";
        const txtEl = btn.querySelector(".modern-classic-text, .modern-classic-game-title");
        if (txtEl) return stripCount(txtEl.textContent);
        const span = btn.querySelector(":scope > span:not([class*='badge']):not([class*='count'])");
        if (span) return stripCount(span.textContent);
        return stripCount(btn.textContent);
    }

    function waitFor(checkFn, maxMs = 1500, stepMs = 80) {
        return new Promise(resolve => {
            const first = checkFn();
            if (first) return resolve(first);
            const t0 = Date.now();
            const id = setInterval(() => {
                const res = checkFn();
                if (res) { clearInterval(id); resolve(res); }
                else if (Date.now() - t0 >= maxMs) { clearInterval(id); resolve(null); }
            }, stepMs);
        });
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const runIdle = fn => "function" === typeof window.requestIdleCallback
        ? window.requestIdleCallback(fn, { timeout: 1800 })
        : setTimeout(fn, 250);

    // ==================== تهيئة الواجهة والكاش عند أول حاجة فعلية فقط ====================
    let uiReady = !1;
    let cachesLoaded = !1;

    function ensureBootedUI() {
        if (!cachesLoaded) {
            cachesLoaded = !0;
            loadCaches();
            absorbLaylMenu();
            wrapHooks();
        }
        if (!uiReady) {
            uiReady = !0;
            injectStyles();
        }
    }

    // ==================== تنبيه خفيف وأدوات فتح القوائم ====================
    let toastTimer = null;
    function showToast(msg, isLock = !1) {
        ensureBootedUI();
        let el = document.getElementById("lsc-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "lsc-toast";
            document.body.appendChild(el);
        }
        clearTimeout(toastTimer);
        el.classList.toggle("lsc-lock", Boolean(isLock));
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add("show"));
        toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
    }

    function denyAccess(msg) {
        showToast(msg || "🔒 هذا الخيار غير متاح لحسابك", !0);
        return !1;
    }

    function isTabOpen(tabId) {
        const sb = document.getElementById("right-sidebar");
        const tab = document.getElementById(tabId);
        return Boolean(
            sb && tab
            && sb.classList.contains("open")
            && !sb.classList.contains("d-none")
            && !tab.classList.contains("d-none")
            && "none" !== tab.style.display
        );
    }

    function getActiveTabId() {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return "";
        const tabs = sb.querySelectorAll("#sidebar-content > .sidebar-tab-content");
        for (let i = 0; i < tabs.length; i++) {
            const t = tabs[i];
            if (!t.classList.contains("d-none") && "none" !== t.style.display) return t.id;
        }
        return "";
    }

    function showSidebarTab(tabId, title) {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return !1;
        sb.classList.remove("d-none");
        if ("none" === sb.style.display) sb.style.display = "";
        sb.classList.add("open");
        const tabs = sb.querySelectorAll("#sidebar-content > .sidebar-tab-content");
        for (let i = 0; i < tabs.length; i++) {
            const el = tabs[i], show = el.id === tabId;
            el.classList.toggle("d-none", !show);
            if (show && "none" === el.style.display) el.style.display = "";
        }
        const ttl = document.getElementById("sidebar-title");
        if (ttl && title) ttl.textContent = title;
        const ws = document.getElementById("wall-settings-container");
        if (ws) ws.style.display = "sidebar-wall-container" === tabId ? "flex" : "none";
        return !0;
    }

    function showContainerOf(el, title) {
        const sb = document.getElementById("right-sidebar");
        if (!sb || !el) return !1;
        const tab = el.closest(".sidebar-tab-content");
        if (tab && tab.id) return showSidebarTab(tab.id, title);
        sb.classList.remove("d-none");
        if ("none" === sb.style.display) sb.style.display = "";
        sb.classList.add("open");
        return !0;
    }

    function closeSidebarSilently() {
        if ("function" === typeof window.closeSidebar) {
            try { window.closeSidebar(); return; } catch (e) {}
        }
        const closeBtn = document.getElementById("close-sidebar");
        if (closeBtn) closeBtn.click();
        else document.getElementById("right-sidebar")?.classList.remove("open");
    }

    function highlightEl(el) {
        if (!el) return;
        el.classList.add("lsc-pulse");
        requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
                try { el.focus({ preventScroll: !0 }); } catch (e) {}
            }
        });
        setTimeout(() => el.classList.remove("lsc-pulse"), 2200);
    }

    // ربط مباشر بأزرار الشريط السفلي الرسمية في الشات
    const NAV_IDS = {
        settings: "settings-btn",
        wall: "wall-tab-btn",
        rooms: "rooms-tab-btn"
    };

    function findNavButton(kind) {
        const id = NAV_IDS[kind];
        if (!id) return null;
        const el = document.getElementById(id);
        return isElementAllowedFast(el) ? el : null;
    }

    async function ensureSettingsView() {
        const cont = document.getElementById("sidebar-settings-container");
        if (!cont) return !1;

        if (isTabOpen("sidebar-settings-container") && cont.querySelector(".classic-settings-container")) {
            return !0;
        }

        if (isTabOpen("sidebar-settings-container")) {
            const backBtn = cont.querySelector(".modern-classic-btn-back");
            if (backBtn) backBtn.click();
            else if ("function" === typeof window.renderSettings) { try { window.renderSettings(); } catch (e) {} }
            const okBack = await waitFor(() => cont.querySelector(".classic-settings-container"), 1200);
            if (okBack) return !0;
        }

        const navBtn = findNavButton("settings");
        if (navBtn && !isTabOpen("sidebar-settings-container")) {
            navBtn.click();
            const okNav = await waitFor(() => cont.querySelector(".classic-settings-container, .modern-classic-addons-container"), 1500);
            if (okNav) {
                if (!cont.querySelector(".classic-settings-container")) {
                    const b2 = cont.querySelector(".modern-classic-btn-back");
                    if (b2) b2.click();
                    else if ("function" === typeof window.renderSettings) { try { window.renderSettings(); } catch (e) {} }
                    await waitFor(() => cont.querySelector(".classic-settings-container"), 1200);
                }
                if (cont.querySelector(".classic-settings-container")) {
                    showSidebarTab("sidebar-settings-container", "الضبط والإعدادات");
                    return !0;
                }
            }
        }

        if ("function" === typeof window.renderSettings) {
            showSidebarTab("sidebar-settings-container", "الضبط والإعدادات");
            try { window.renderSettings(); } catch (e) {}
            const ok = await waitFor(() => cont.querySelector(".classic-settings-container"), 1500);
            if (ok) { showSidebarTab("sidebar-settings-container", "الضبط والإعدادات"); return !0; }
        }
        return !1;
    }

    async function ensureWallView() {
        const cont = document.getElementById("sidebar-wall-container");
        const sb = document.getElementById("right-sidebar");
        if (!cont || !sb) return !1;

        const isWallReady = () => Boolean(
            document.getElementById("btn-tab-quickchat") ||
            document.getElementById("btn-tab-posts") ||
            cont.querySelector(".wall-post-card, .quick-chat-card")
        );

        if (!isTabOpen("sidebar-wall-container")) {
            const navBtn = findNavButton("wall");
            if (navBtn) {
                navBtn.click();
                await waitFor(() => isTabOpen("sidebar-wall-container") && isWallReady(), 1600);
            }
        }

        if (!isWallReady() && "function" === typeof window.loadWallSidebar) {
            showSidebarTab("sidebar-wall-container", "الحائط");
            try { await window.loadWallSidebar(); } catch (e) {}
            await waitFor(isWallReady, 1800);
        }

        if (!isTabOpen("sidebar-wall-container")) {
            showSidebarTab("sidebar-wall-container", "الحائط");
        }

        await delay(140);
        bindWallAndQuickChat();
        return isWallReady();
    }

    async function ensureRoomsLoaded(openView = !1) {
        const cont = document.getElementById("sidebar-rooms-container");
        if (!cont) return !1;
        const isReady = () => cont.querySelector(".room-card");

        if (isReady()) {
            if (openView && !isTabOpen("sidebar-rooms-container")) {
                const navBtn = findNavButton("rooms");
                if (navBtn) navBtn.click();
                else showSidebarTab("sidebar-rooms-container", "الغرف");
            }
            return !0;
        }

        const navBtn = findNavButton("rooms");
        if (navBtn && !isTabOpen("sidebar-rooms-container")) {
            navBtn.click();
            const ok = await waitFor(isReady, 1400);
            if (ok) return !0;
        }

        if ("function" === typeof window.renderRoomsGrid) {
            if (openView) showSidebarTab("sidebar-rooms-container", "الغرف");
            try { await window.renderRoomsGrid(); } catch (e) {}
            return Boolean(await waitFor(isReady, 1500));
        }

        return Boolean(await waitFor(isReady, 1000));
    }

    function findAddonsButtonsInDOM() {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return [];
        const box = sb.querySelector(".modern-classic-addons-container");
        return box ? Array.from(box.querySelectorAll(".modern-classic-list > button.modern-classic-item, button.modern-classic-item")) : [];
    }

    function findAddonsTriggerInSettings() {
        const cont = document.getElementById("sidebar-settings-container");
        if (!cont) return null;
        const direct = cont.querySelector('.classic-btn-addons, button[onclick*="renderAddons"], button[onclick*="loadAddons"]');
        if (direct && isElementAllowed(direct)) return direct;
        const btns = cont.querySelectorAll("button, a, [role='button']");
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if (!isElementAllowedFast(b)) continue;
            const txt = normAr(getCleanBtnText(b));
            if ("الاضافات" === txt || "اضافات" === txt || txt.includes("الاضافات")) {
                if (isElementAllowed(b)) return b;
            }
        }
        return null;
    }

    function findGamesBtnInAddons() {
        const btns = findAddonsButtonsInDOM();
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if (isElementAllowedFast(b) && /openGamesView/i.test(b.getAttribute("onclick") || "")) return b;
        }
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if (!isElementAllowedFast(b)) continue;
            const txt = normAr(getCleanBtnText(b));
            if ("الالعاب" === txt || "العاب" === txt) return b;
        }
        return null;
    }

    async function openAddonsMenu() {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return !1;
        const getBox = () => sb.querySelector(".modern-classic-addons-container");

        if (getBox() && findAddonsButtonsInDOM().length) {
            showContainerOf(getBox(), "الإضافات");
            scanAddonsInDOM();
            return !0;
        }

        const settingsOk = await ensureSettingsView();
        if (settingsOk) {
            const addonsBtn = await waitFor(findAddonsTriggerInSettings, 1200);
            if (addonsBtn) {
                addonsBtn.click();
                const appeared = await waitFor(() => getBox() && findAddonsButtonsInDOM().length > 0, 1000);
                if (!appeared) {
                    if ("function" === typeof window.loadAddons) { try { await window.loadAddons(); } catch (e) {} }
                    else if ("function" === typeof window.renderAddons) { try { window.renderAddons(); } catch (e) {} }
                }
            } else if ("function" === typeof window.loadAddons) {
                try { await window.loadAddons(); } catch (e) {}
            } else if ("function" === typeof window.renderAddons) {
                try { window.renderAddons(); } catch (e) {}
            } else {
                return !1;
            }
        } else if ("function" === typeof window.loadAddons) {
            showSidebarTab("sidebar-settings-container", "الإضافات");
            try { await window.loadAddons(); } catch (e) {}
        } else if ("function" === typeof window.renderAddons) {
            showSidebarTab("sidebar-settings-container", "الإضافات");
            try { window.renderAddons(); } catch (e) {}
        } else {
            return !1;
        }

        const ok = await waitFor(() => getBox() && findAddonsButtonsInDOM().length > 0, 1800);
        if (!ok) return !1;
        await waitFor(() => sb.querySelector('.modern-classic-list [data-lail-controlled="true"]'), 800);
        await delay(150);
        showContainerOf(getBox(), "الإضافات");
        scanAddonsInDOM();
        return !0;
    }

    async function ensureGamesLoaded(openView = !0) {
        const gamesCont = document.getElementById("sidebar-games-container");
        const sb = document.getElementById("right-sidebar");
        if (!gamesCont || !sb) return !1;

        const hasBuiltIn = () => document.querySelectorAll("#games-list button.modern-classic-game-item").length > 0;
        const hasCustom = () => Boolean(document.querySelector('#games-list[data-layl-added="true"]'));

        if (hasBuiltIn() && hasCustom() && (!openView || isTabOpen("sidebar-games-container"))) {
            scanGamesInDOM();
            return !0;
        }

        // تحميل ملفات وتنسيقات الألعاب الرسمية عند الطلب قبل فتح القائمة
        if ("function" === typeof window.ensureGamesStylesLoaded) {
            try { await window.ensureGamesStylesLoaded(); } catch (e) {}
        }
        if ("function" === typeof window.ensureGamesManagerLoaded) {
            try { await window.ensureGamesManagerLoaded(); } catch (e) {}
        }

        if ("function" === typeof window.openGamesView) {
            try { await window.openGamesView(); } catch (e) {}
            await waitFor(hasBuiltIn, 1500);
        }

        if (!hasBuiltIn()) {
            const addonsOk = await openAddonsMenu();
            if (addonsOk) {
                const gamesBtn = await waitFor(findGamesBtnInAddons, 900);
                if (!gamesBtn) return !1;
                gamesBtn.click();
            } else {
                return !1;
            }
        }

        const ok = await waitFor(hasBuiltIn, 2000);
        if (!ok) return !1;
        await waitFor(hasCustom, 1800);
        await delay(140);
        if (openView) showSidebarTab("sidebar-games-container", "الألعاب");
        scanGamesInDOM();
        return !0;
    }

    async function openSettingField(selector, expandPrivacy = !1, clickTarget = !1, label = "") {
        const ok = await ensureSettingsView();
        if (!ok) return denyAccess("🔒 قائمة الضبط غير متاحة لحسابك");

        if (expandPrivacy) {
            const alreadyVisible = isVisibleInDOM(document.querySelector(selector));
            if (!alreadyVisible) {
                const hdr = await waitFor(() => document.querySelector("#privacy-group .settings-group-header, #privacy-group [aria-expanded], #privacy-group button"), 1200);
                if (hdr) {
                    if ("true" !== hdr.getAttribute("aria-expanded")) {
                        hdr.click();
                        await waitFor(() => isVisibleInDOM(document.querySelector(selector)), 650);
                    }
                    if (!isVisibleInDOM(document.querySelector(selector))) {
                        hdr.click();
                        await waitFor(() => isVisibleInDOM(document.querySelector(selector)), 650);
                    }
                } else if ("function" === typeof window.toggleSettingsGroup) {
                    try { window.toggleSettingsGroup("privacy-group"); } catch (e) {}
                    await delay(220);
                }
            }
        }

        const target = await waitFor(() => {
            const el = document.querySelector(selector);
            return isVisibleInDOM(el) ? el : null;
        }, 1600) || (() => {
            const el = document.querySelector(selector);
            return isElementAllowed(el) ? el : null;
        })();

        if (!target) return denyAccess();
        if (clickTarget) target.click();
        else highlightEl(target);
        if (label) showToast(`⚡ تم فتح: ${label}`);
        return !0;
    }

    // ==================== الكاش المجمّع (يُحمّل ويُحفظ عند الحاجة فقط) ====================
    const liveMenuItems = new Map();
    const domAddonsMap = new Map();
    const domGamesMap = new Map();
    let recentList = [];
    let saveAddonsTimer = null;
    let saveGamesTimer = null;

    function loadCaches() {
        try {
            const a = JSON.parse(localStorage.getItem(ADDONS_CACHE_KEY) || "[]");
            if (Array.isArray(a)) a.forEach(x => { if (x?.label && !isRestrictedLabel(x.label, x.id)) domAddonsMap.set(x.label, x); });
        } catch (e) {}
        try {
            const g = JSON.parse(localStorage.getItem(GAMES_CACHE_KEY) || "[]");
            if (Array.isArray(g)) g.forEach(x => { if (x?.label) domGamesMap.set(x.label, x); });
        } catch (e) {}
        try {
            const r = JSON.parse(localStorage.getItem(RECENT_CACHE_KEY) || "[]");
            if (Array.isArray(r)) recentList = r.filter(x => x && x.type && x.label && !isRestrictedLabel(x.label)).slice(0, 3);
        } catch (e) {}
    }

    function recordRecent(type, label) {
        if (!type || !label || isRestrictedLabel(label)) return;
        recentList = [{ type, label }, ...recentList.filter(x => !(x.type === type && x.label === label))].slice(0, 3);
        try { localStorage.setItem(RECENT_CACHE_KEY, JSON.stringify(recentList)); } catch (e) {}
    }

    function scheduleSaveAddons() {
        clearTimeout(saveAddonsTimer);
        saveAddonsTimer = setTimeout(() => {
            try {
                const arr = Array.from(domAddonsMap.values()).filter(a => !isRestrictedLabel(a.label, a.id)).slice(0, 80);
                localStorage.setItem(ADDONS_CACHE_KEY, JSON.stringify(arr));
            } catch (e) {}
        }, 1000);
    }

    function scheduleSaveGames() {
        clearTimeout(saveGamesTimer);
        saveGamesTimer = setTimeout(() => {
            try {
                localStorage.setItem(GAMES_CACHE_KEY, JSON.stringify(Array.from(domGamesMap.values()).slice(0, 60)));
            } catch (e) {}
        }, 1000);
    }

    function registerLiveItem(it) {
        if (!it || !it.text) return !1;
        const label = stripCount(it.text);
        if (!label) return !1;
        liveMenuItems.set(label, it);
        if (isRestrictedLabel(label, it.id || "")) return !1;
        const nextId = it.id || "";
        const nextIcon = normIcon(it.icon, "fas fa-puzzle-piece");
        const nextColor = safeColor(it.iconColor, "#D4AF37");
        const prev = domAddonsMap.get(label);
        if (!prev || prev.id !== nextId || prev.icon !== nextIcon || prev.color !== nextColor) {
            domAddonsMap.set(label, { label, id: nextId, icon: nextIcon, color: nextColor });
            return !0;
        }
        return !1;
    }

    function absorbLaylMenu() {
        let changed = !1;
        if (Array.isArray(window.__laylMenuQueue)) {
            window.__laylMenuQueue.forEach(it => { if (registerLiveItem(it)) changed = !0; });
        }
        const lm = window.LaylMenu;
        if (lm) {
            try {
                Object.keys(lm).forEach(k => {
                    const v = lm[k];
                    if (Array.isArray(v)) v.forEach(x => {
                        if (x && x.text && "function" === typeof x.onClick && registerLiveItem(x)) changed = !0;
                    });
                });
            } catch (e) {}
            if ("function" === typeof lm.register && !lm.register.__lscWrapped) {
                const orig = lm.register.bind(lm);
                const wrapped = function (item) {
                    if (registerLiveItem(item) && cachesLoaded) scheduleSaveAddons();
                    return orig(item);
                };
                wrapped.__lscWrapped = !0;
                lm.register = wrapped;
            }
        }
        if (changed && cachesLoaded) scheduleSaveAddons();
    }

    function scanAddonsInDOM() {
        const btns = findAddonsButtonsInDOM();
        if (!btns.length) return 0;
        let changed = !1, found = 0;
        for (let i = 0; i < btns.length; i++) {
            const btn = btns[i];
            if (!isElementAllowedFast(btn)) continue;
            const label = getCleanBtnText(btn);
            if (!label || label.length < 2 || /العودة|رجوع|إغلاق/.test(label)) continue;
            if ("الألعاب" === label || "الالعاب" === label) continue;
            if (isRestrictedLabel(label, btn.id || "")) continue;
            found++;
            const icoEl = btn.querySelector("i");
            const wrap = btn.querySelector(".modern-classic-icon-wrapper");
            const color = safeColor(icoEl?.style.color || wrap?.style.color, "#D4AF37");
            const icon = normIcon(icoEl?.className, "fas fa-puzzle-piece");
            const prev = domAddonsMap.get(label);
            if (!prev || prev.id !== (btn.id || "") || prev.icon !== icon || prev.color !== color) {
                domAddonsMap.set(label, { label, id: btn.id || "", icon, color });
                changed = !0;
            }
        }
        if (changed) scheduleSaveAddons();
        return found;
    }

    function scanGamesInDOM() {
        const btns = document.querySelectorAll("#games-list button.modern-classic-game-item");
        if (!btns.length) return 0;
        let changed = !1, found = 0;
        for (let i = 0; i < btns.length; i++) {
            const btn = btns[i];
            const label = getCleanBtnText(btn);
            if (!label) continue;
            found++;
            const icoEl = btn.querySelector(".modern-classic-game-icon-wrapper i");
            const wrap = btn.querySelector(".modern-classic-game-icon-wrapper");
            const color = safeColor(wrap?.style.color || icoEl?.style.color, "#06b6d4");
            const icon = normIcon(icoEl?.className, "fas fa-gamepad");
            const prev = domGamesMap.get(label);
            if (!prev || prev.icon !== icon || prev.color !== color) {
                domGamesMap.set(label, { label, icon, color });
                changed = !0;
            }
        }
        if (changed) scheduleSaveGames();
        return found;
    }

    function wrapHooks() {
        if ("function" === typeof window.renderAddons && !window.renderAddons.__lscWrapped) {
            const orig = window.renderAddons;
            let t = null;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                clearTimeout(t);
                t = setTimeout(() => { if (cachesLoaded) scanAddonsInDOM(); }, 550);
                return res;
            };
            wrapped.__lscWrapped = !0;
            window.renderAddons = wrapped;
        }
        if ("function" === typeof window.openGamesView && !window.openGamesView.__lscWrapped) {
            const orig = window.openGamesView;
            let t = null;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                clearTimeout(t);
                t = setTimeout(() => { if (cachesLoaded) scanGamesInDOM(); }, 650);
                return res;
            };
            wrapped.__lscWrapped = !0;
            window.openGamesView = wrapped;
        }
    }

    // ==================== تنفيذ الاختصارات مع فحص الصلاحيات ====================
    async function runDynamicAddon(label) {
        const target = stripCount(label);
        const targetNorm = normAr(target);
        if (isRestrictedLabel(target)) return denyAccess();

        const live = liveMenuItems.get(target);
        if (live) {
            if (isRestrictedLabel(target, live.id || "")) return denyAccess();
            if ("function" === typeof live.condition && !live.condition()) {
                return denyAccess("🔒 هذه الإضافة غير متاحة لصلاحيات حسابك");
            }
            if ("function" === typeof live.onClick) {
                live.onClick();
                showToast(`🧩 تم فتح: ${target}`);
                return !0;
            }
        }

        const findAllowedBtn = () => {
            const cached = domAddonsMap.get(target);
            if (cached?.id) {
                const byId = document.getElementById(cached.id);
                if (byId && isElementAllowed(byId) && !isRestrictedLabel(getCleanBtnText(byId), byId.id)) return byId;
            }
            const btns = findAddonsButtonsInDOM();
            for (let i = 0; i < btns.length; i++) {
                const b = btns[i];
                if (!isElementAllowedFast(b)) continue;
                const txt = getCleanBtnText(b);
                if (!isRestrictedLabel(txt, b.id || "") && normAr(txt) === targetNorm) return isElementAllowed(b) ? b : null;
            }
            for (let i = 0; i < btns.length; i++) {
                const b = btns[i];
                if (!isElementAllowedFast(b)) continue;
                const txt = getCleanBtnText(b);
                const tNorm = normAr(txt);
                if (!isRestrictedLabel(txt, b.id || "") && tNorm && targetNorm && tNorm.includes(targetNorm)) return isElementAllowed(b) ? b : null;
            }
            return null;
        };

        const immediate = findAllowedBtn();
        if (immediate) {
            immediate.click();
            showToast(`🧩 تم فتح: ${target}`);
            return !0;
        }

        const opened = await openAddonsMenu();
        if (!opened) return denyAccess("🔒 قائمة الإضافات غير متاحة لحسابك");

        const btn = await waitFor(findAllowedBtn, 1500);
        if (!btn) return denyAccess("🔒 هذه الإضافة غير متاحة لحسابك");
        btn.click();
        showToast(`🧩 تم فتح: ${target}`);
        return !0;
    }

    async function runDynamicGame(label) {
        const target = stripCount(label);
        const targetNorm = normAr(target);
        const loaded = await ensureGamesLoaded(!0);
        if (!loaded) return denyAccess("🔒 قسم الألعاب غير متاح لحسابك");

        const findBtn = () => {
            const btns = document.querySelectorAll("#games-list button.modern-classic-game-item");
            for (let i = 0; i < btns.length; i++) {
                if (normAr(getCleanBtnText(btns[i])) === targetNorm && isElementAllowed(btns[i])) return btns[i];
            }
            for (let i = 0; i < btns.length; i++) {
                const title = normAr(getCleanBtnText(btns[i]));
                if (title && title.includes(targetNorm) && isElementAllowed(btns[i])) return btns[i];
            }
            return null;
        };

        const btn = await waitFor(findBtn, 1500);
        if (!btn) return denyAccess("🔒 هذه اللعبة غير متاحة لحسابك");
        btn.click();
        showToast(`🎮 تم فتح: ${target}`);
        return !0;
    }

    async function runDynamicRoom(label) {
        const target = norm(label);
        const targetNorm = normAr(target);
        await ensureRoomsLoaded(!1);
        const cards = document.querySelectorAll("#sidebar-rooms-container .room-card");
        let matched = null;
        for (let i = 0; i < cards.length; i++) {
            const name = normAr(cards[i].querySelector(".fw-bold")?.textContent || "");
            if (name === targetNorm) { matched = cards[i]; break; }
        }
        if (!matched) {
            for (let i = 0; i < cards.length; i++) {
                const name = normAr(cards[i].querySelector(".fw-bold")?.textContent || "");
                if (name && name.includes(targetNorm)) { matched = cards[i]; break; }
            }
        }
        if (!matched || !isElementAllowed(matched)) {
            return denyAccess("🔒 هذه الغرفة غير متاحة لحسابك");
        }
        matched.click();
        showToast(`🚪 جاري الدخول إلى: ${target}`);
        return !0;
    }

    // ==================== الاختصارات الأساسية الثابتة ====================
    const CORE_SHORTCUTS = [
        {
            label: "تغيير كلمة المرور", cat: "الضبط", hint: "الضبط ◂ الخصوصية ◂ كلمة المرور",
            icon: "fas fa-key", color: "#f59e0b", keys: "كلمة السر باسورد رمز مرور password",
            run: () => openSettingField("#change-password-trigger-btn", !0, !0, "تغيير كلمة المرور")
        },
        {
            label: "تغيير الصورة الشخصية", cat: "الضبط", hint: "الضبط ◂ تعديل الصورة",
            icon: "fas fa-camera", color: "#38bdf8", keys: "صورة رمزية افتار بروفايل avatar pic",
            run: () => openSettingField("#settings-upload-btn", !1, !0, "تغيير الصورة الشخصية")
        },
        {
            label: "تغيير الاسم والزخرفة", cat: "الضبط", hint: "الضبط ◂ خانة الزخرفة",
            icon: "fas fa-signature", color: "#a855f7", keys: "اسم نك زخرفة لقب name",
            run: () => openSettingField("#set-topic", !1, !1, "تغيير الاسم والزخرفة")
        },
        {
            label: "تعديل الحالة", cat: "الضبط", hint: "الضبط ◂ خانة الحالة",
            icon: "fas fa-pen-nib", color: "#ec4899", keys: "حالة توبك بايو وصف status",
            run: () => openSettingField("#set-msg", !1, !1, "تعديل الحالة")
        },
        {
            label: "تغيير الألوان", cat: "الضبط", hint: "الضبط ◂ ألوان الاسم والخط والخلفية",
            icon: "fas fa-palette", color: "#f43f5e", keys: "لون خط خلفية الوان color",
            run: () => openSettingField("#set-ucol", !1, !1, "تغيير الألوان")
        },
        {
            label: "تغيير الدولة", cat: "الضبط", hint: "الضبط ◂ اختيار علم الدولة",
            icon: "fas fa-flag", color: "#10b981", keys: "علم بلد دولة country",
            run: () => openSettingField("#set-country", !1, !1, "تغيير الدولة")
        },
        {
            label: "حالة التواجد", cat: "الضبط", hint: "الضبط ◂ متاح / مشغول / بالخارج",
            icon: "fas fa-circle", color: "#22c55e", keys: "متاح مشغول صلاة مكالمة بالخارج",
            run: () => openSettingField("#set-manual-status", !1, !1, "حالة التواجد")
        },
        {
            label: "الإشعارات والخصوصية", cat: "الضبط", hint: "الضبط ◂ الخاص، الكاميرا، التنبيهات",
            icon: "fas fa-shield-alt", color: "#6366f1", keys: "خاص كتم اشعارات خصوصية كاميرا",
            run: () => openSettingField("#privacy-group", !0, !1, "الإشعارات والخصوصية")
        },
        {
            label: "إخفاء الشعلة", cat: "الضبط", hint: "الضبط ◂ الخصوصية ◂ الشعلة",
            icon: "fas fa-fire", color: "#f97316", keys: "شعلة ستريك اخفاء streak",
            run: () => openSettingField("#streak-visibility-row", !0, !1, "إخفاء الشعلة")
        },
        {
            label: "حجم الخطوط", cat: "الضبط", hint: "الضبط ◂ تكبير وتصغير الخط",
            icon: "fas fa-text-height", color: "#94a3b8", keys: "خط تكبير تصغير حجم font",
            run: () => openSettingField("#set-font-size", !1, !1, "حجم الخطوط")
        },
        {
            label: "إضافة رابط فيديو", cat: "الضبط", hint: "الضبط ◂ إضافة يوتيوب بالملف",
            icon: "fas fa-play-circle", color: "#ef4444", keys: "يوتيوب اغنية رابط فيديو youtube",
            run: () => openSettingField(".classic-btn-social-video", !1, !0, "إضافة رابط فيديو")
        },
        {
            label: "الاستفتاء الحالي", cat: "الضبط", hint: "عرض الاستفتاء والنتائج",
            icon: "fas fa-chart-pie", color: "#10b981", keys: "استفتاء تصويت نتائج poll",
            run: () => openSettingField('button[onclick*="viewCurrentOrLastPoll"]', !1, !0, "الاستفتاء الحالي")
        },
        {
            label: "الإضافات", cat: "الإضافات", hint: "الضبط ◂ فتح قائمة الإضافات كاملة",
            icon: "fas fa-puzzle-piece", color: "#D4AF37", keys: "اضافات مميزات addons",
            async run() {
                if (await openAddonsMenu()) showToast("🧩 تم فتح قائمة الإضافات");
                else denyAccess("🔒 قائمة الإضافات غير متاحة لحسابك");
            }
        },
        {
            label: "قسم الألعاب", cat: "الألعاب", hint: "قائمة جميع ألعاب الشات",
            icon: "fas fa-gamepad", color: "#06b6d4", keys: "العاب لعب games",
            async run() {
                if (await ensureGamesLoaded(!0)) showToast("🎮 تم فتح قسم الألعاب");
                else denyAccess("🔒 قسم الألعاب غير متاحة لحسابك");
            }
        },
        {
            label: "قائمة الغرف", cat: "الغرف والحائط", hint: "تصفح جميع غرف الشات",
            icon: "fas fa-door-open", color: "#10b981", keys: "غرف رومات rooms",
            async run() {
                if (!(await ensureRoomsLoaded(!0))) {
                    if (!showSidebarTab("sidebar-rooms-container", "الغرف")) return denyAccess();
                }
                showToast("🚪 تم فتح قائمة الغرف");
            }
        },
        {
            label: "إنشاء غرفة جديدة", cat: "الغرف والحائط", hint: "الغرف ◂ إنشاء غرفة خاصة",
            icon: "fas fa-plus-circle", color: "#22c55e", keys: "انشاء غرفة جديدة روم",
            async run() {
                await ensureRoomsLoaded(!0);
                showSidebarTab("sidebar-rooms-container", "الغرف");
                const btn = await waitFor(() => {
                    const el = document.querySelector('#sidebar-rooms-container button[onclick*="openCreateRoomModal"]');
                    return isElementAllowed(el) ? el : null;
                }, 1400);
                if (!btn) return denyAccess("🔒 إنشاء الغرف غير متاح لصلاحيات حسابك");
                btn.click();
                showToast("⚡ تم فتح: إنشاء غرفة جديدة");
            }
        },
        {
            label: "الحائط", cat: "الغرف والحائط", hint: "فتح منشورات الحائط",
            icon: "fas fa-newspaper", color: "#38bdf8", keys: "حائط منشورات بوستات wall",
            async run() {
                if (!(await ensureWallView())) return denyAccess("🔒 الحائط غير متاح لحسابك");
                const postsTab = document.getElementById("btn-tab-posts");
                if (postsTab && isElementAllowed(postsTab)) postsTab.click();
                showToast("⚡ تم فتح: الحائط");
            }
        },
        {
            label: "الدردشة السريعة", cat: "الغرف والحائط", hint: "الحائط ◂ الدردشة السريعة",
            icon: "fas fa-bolt", color: "#f59e0b", keys: "سريعة دردشة حائط",
            async run() {
                if (!(await ensureWallView())) return denyAccess("🔒 الدردشة السريعة غير متاحة لحسابك");
                const tab = await waitFor(() => {
                    const el = document.getElementById("btn-tab-quickchat");
                    return isVisibleInDOM(el) ? el : null;
                }, 2000) || document.getElementById("btn-tab-quickchat");
                if (!isElementAllowed(tab)) return denyAccess("🔒 الدردشة السريعة غير متاحة لحسابك");

                const isQcOpen = () => {
                    const qc = document.getElementById("quick-chat-content");
                    return Boolean(qc && !qc.classList.contains("d-none") && "none" !== qc.style.display);
                };

                if (!isQcOpen()) {
                    for (let i = 0; i < 4; i++) {
                        tab.click();
                        await delay(200);
                        if (isQcOpen()) break;
                    }
                }
                if (!isQcOpen() && "function" === typeof window.switchWallSubTab) {
                    try { window.switchWallSubTab("quickchat"); } catch (e) {}
                    await delay(160);
                    if (!isQcOpen()) {
                        try { window.switchWallSubTab("quick-chat"); } catch (e) {}
                        await delay(160);
                    }
                }
                if (!isQcOpen()) {
                    const qc = document.getElementById("quick-chat-content");
                    const posts = document.getElementById("wall-posts-tab-content");
                    if (qc) qc.classList.remove("d-none");
                    if (posts) posts.classList.add("d-none");
                    tab.classList.add("active");
                    tab.setAttribute("aria-selected", "true");
                    const pTab = document.getElementById("btn-tab-posts");
                    if (pTab) { pTab.classList.remove("active"); pTab.setAttribute("aria-selected", "false"); }
                    tab.click();
                }
                bindWallAndQuickChat();
                showToast("⚡ تم فتح: الدردشة السريعة");
            }
        },
        {
            label: "نشر ستوري", cat: "الغرف والحائط", hint: "الحائط ◂ إضافة ستوري جديد",
            icon: "fas fa-plus-circle", color: "#f43f5e", keys: "ستوري قصة نشر story",
            async run() {
                if (!(await ensureWallView())) return denyAccess("🔒 نشر الستوري غير متاح لحسابك");
                const btn = await waitFor(() => {
                    const el = document.querySelector("#story-add-btn-wall-stories-container, .story-add-btn");
                    return isElementAllowed(el) ? el : null;
                }, 1800);
                if (!btn) return denyAccess("🔒 نشر الستوري غير متاح لحسابك");
                btn.click();
                showToast("⚡ تم فتح: نشر ستوري");
            }
        },
        {
            label: "رفع صورة للشات", cat: "الغرف والحائط", hint: "إرسال صورة أو فيديو بالعام",
            icon: "fas fa-image", color: "#14b8a6", keys: "رفع صورة ارسال فيديو",
            run() {
                const btn = document.getElementById("upload-btn");
                if (!isElementAllowed(btn)) return denyAccess("🔒 رفع الصور غير متاح لحسابك");
                btn.click();
            }
        }
    ];

    const CORE_BY_LABEL = new Map();
    CORE_SHORTCUTS.forEach(item => CORE_BY_LABEL.set(item.label, item));

    // ==================== بناء القائمة الحية عند كتابة / فقط ====================
    function buildSearchText(it) {
        return normAr(`${it.label} ${it.cat} ${it.hint} ${it.keys || ""}`);
    }

    function getLiveItems() {
        ensureBootedUI();
        absorbLaylMenu();
        scanAddonsInDOM();
        scanGamesInDOM();

        const result = CORE_SHORTCUTS.map(c => {
            const it = Object.assign({ type: "إعداد" }, c);
            it._q = buildSearchText(it);
            return it;
        });
        const seenAddons = new Set();

        liveMenuItems.forEach((it, label) => {
            if (isRestrictedLabel(label, it.id || "")) return;
            if ("function" === typeof it.condition && !it.condition()) return;
            seenAddons.add(label);
            const row = {
                type: "إضافة", label, cat: "الإضافات", hint: "الإضافات ◂ فتح مباشر",
                icon: normIcon(it.icon, "fas fa-puzzle-piece"),
                color: safeColor(it.iconColor, "#D4AF37"),
                keys: `اضافة اضافات ${label}`
            };
            row._q = buildSearchText(row);
            result.push(row);
        });

        domAddonsMap.forEach((it, label) => {
            if (seenAddons.has(label) || isRestrictedLabel(label, it.id || "")) return;
            seenAddons.add(label);
            const row = {
                type: "إضافة", label, cat: "الإضافات", hint: "الإضافات ◂ فتح مباشر",
                icon: it.icon || "fas fa-puzzle-piece",
                color: it.color || "#D4AF37",
                keys: `اضافة اضافات ${label}`
            };
            row._q = buildSearchText(row);
            result.push(row);
        });

        domGamesMap.forEach((it, label) => {
            const row = {
                type: "لعبة", label, cat: "الألعاب", hint: "الألعاب ◂ تشغيل مباشر",
                icon: it.icon || "fas fa-gamepad",
                color: it.color || "#22d3ee",
                keys: `لعبة العاب ${label}`
            };
            row._q = buildSearchText(row);
            result.push(row);
        });

        const seenRooms = new Set();
        const cards = document.querySelectorAll("#sidebar-rooms-container .room-card");
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const label = norm(card.querySelector(".fw-bold")?.textContent || "");
            if (!label || seenRooms.has(label)) continue;
            seenRooms.add(label);
            const locked = Boolean(card.querySelector(".fa-lock"));
            const row = {
                type: "غرفة", label, cat: "الغرف والحائط",
                hint: locked ? "دخول للغرفة (برمز سري 🔒)" : "دخول مباشر للغرفة",
                icon: locked ? "fas fa-lock" : "fas fa-door-open",
                color: locked ? "#f59e0b" : "#34d399",
                keys: `روم غرفة غرف ${label}`
            };
            row._q = buildSearchText(row);
            result.push(row);
        }

        return result;
    }

    const CATS = ["الكل", "الضبط", "الإضافات", "الألعاب", "الغرف والحائط"];
    const TOKEN_RE = /«(إعداد|إضافة|لعبة|غرفة):\s*([^»]{1,90})»/g;
    const TRIGGER_RE = /(?:^|[\s\n])\/([^\n\/«»]{0,28})$/;

    function injectStyles() {
        if (document.getElementById("lsc-styles")) return;
        const st = document.createElement("style");
        st.id = "lsc-styles";
        st.textContent = `
        #lsc-menu{
            position:fixed;z-index:2147483645;direction:rtl;
            width:min(355px,calc(100vw - 16px));
            background:#131627;
            border:1px solid rgba(212,175,55,.45);
            border-radius:14px;
            box-shadow:0 12px 30px rgba(0,0,0,.72);
            color:#f8fafc;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;
            display:none;flex-direction:column;overflow:hidden;box-sizing:border-box;
        }
        #lsc-menu.open{display:flex}
        .lsc-mhead{
            display:flex;align-items:center;justify-content:space-between;gap:8px;
            padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08);
            background:rgba(212,175,55,.09);font-size:12px;font-weight:800;color:#fde68a;
        }
        .lsc-mclose{
            background:rgba(255,255,255,.08);border:none;color:#cbd5e1;
            width:24px;height:24px;border-radius:50%;cursor:pointer;
            display:inline-flex;align-items:center;justify-content:center;font-size:11px;
        }
        .lsc-mclose:hover{background:#ef4444;color:#fff}
        .lsc-mcats{
            display:flex;gap:5px;padding:7px 9px;overflow-x:auto;scrollbar-width:none;
            border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.22);flex-shrink:0;
        }
        .lsc-mcats::-webkit-scrollbar{display:none}
        .lsc-cat{
            background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);
            color:#cbd5e1;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
            cursor:pointer;white-space:nowrap;font-family:inherit;
        }
        .lsc-cat.active{background:#D4AF37;color:#111;border-color:#D4AF37}
        .lsc-mlist{max-height:240px;overflow-y:auto;padding:6px;-webkit-overflow-scrolling:touch}
        .lsc-mlist::-webkit-scrollbar{width:5px}
        .lsc-mlist::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lsc-sec-lbl{
            font-size:10.5px;font-weight:800;color:#94a3b8;padding:4px 8px 3px;
            display:flex;align-items:center;gap:5px;
        }
        .lsc-item{
            width:100%;background:transparent;border:1px solid transparent;border-radius:10px;
            padding:7px 9px;display:flex;align-items:center;gap:9px;text-align:right;
            cursor:pointer;color:#f1f5f9;font-family:inherit;box-sizing:border-box;
        }
        .lsc-item:hover,.lsc-item.sel{background:rgba(212,175,55,.15);border-color:rgba(212,175,55,.35)}
        .lsc-sync-btn{
            width:100%;margin-bottom:6px;padding:7px 10px;border-radius:10px;
            background:rgba(56,189,248,.14);border:1px dashed rgba(56,189,248,.45);
            color:#7dd3fc;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;
            display:flex;align-items:center;justify-content:center;gap:6px;
        }
        .lsc-sync-btn:hover{background:rgba(56,189,248,.24)}
        .lsc-iico{
            width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;
            font-size:14px;flex-shrink:0;background:rgba(255,255,255,.08);
        }
        .lsc-itxt{flex:1;min-width:0}
        .lsc-ilbl{font-size:12.5px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .lsc-ihint{font-size:10.5px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
        .lsc-empty{text-align:center;color:#94a3b8;font-size:12px;padding:18px 8px}

        .lsc-chip{
            display:inline-flex;align-items:center;gap:6px;vertical-align:middle;
            margin:2px 3px;padding:4px 11px 4px 9px;border-radius:20px;
            background:#16192b;
            border:1px solid rgba(212,175,55,.65);
            color:#f8fafc!important;font-size:12px;font-weight:800;line-height:1.35;
            cursor:pointer;font-family:inherit;direction:rtl;
            max-width:100%;white-space:nowrap;
        }
        .lsc-chip:active{opacity:.85}
        .lsc-chip-ico{font-size:12px;flex-shrink:0}
        .lsc-chip-go{
            font-size:9.5px;color:#111;background:#D4AF37;
            padding:1px 6px;border-radius:10px;font-weight:900;margin-right:2px;
        }
        .lsc-chip[data-lsc-type="إعداد"]{border-color:rgba(167,139,250,.65)}
        .lsc-chip[data-lsc-type="إعداد"] .lsc-chip-go{background:#a78bfa}
        .lsc-chip[data-lsc-type="لعبة"]{border-color:rgba(34,211,238,.65)}
        .lsc-chip[data-lsc-type="لعبة"] .lsc-chip-go{background:#22d3ee}
        .lsc-chip[data-lsc-type="غرفة"]{border-color:rgba(52,211,153,.65)}
        .lsc-chip[data-lsc-type="غرفة"] .lsc-chip-go{background:#34d399}

        .quoted-text .lsc-chip{padding:2px 7px;font-size:11px}
        .quoted-text .lsc-chip-go{display:none}
        .quick-chat-text .lsc-chip,.wall-post-text .lsc-chip{font-size:11.5px;padding:3px 9px 3px 8px}

        .lsc-pulse{
            outline:2px solid #D4AF37!important;
            outline-offset:2px;
            border-radius:12px;
        }

        #lsc-toast{
            position:fixed;bottom:78px;left:50%;transform:translateX(-50%) translateY(10px);
            background:#121526;border:1px solid rgba(212,175,55,.7);color:#fde68a;
            padding:7px 16px;border-radius:24px;font-size:12px;font-weight:800;
            box-shadow:0 8px 20px rgba(0,0,0,.55);z-index:2147483647;
            opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;direction:rtl;
        }
        #lsc-toast.lsc-lock{background:#2d1118;border-color:#ef4444;color:#fecaca}
        #lsc-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        `;
        (document.head || document.documentElement).appendChild(st);
    }

    // ==================== تحويل النصوص بدون لمس DOM للرسائل العادية ====================
    const processedEls = new WeakSet();

    function resolveVisualMeta(type, label) {
        if ("إعداد" === type) {
            const c = CORE_BY_LABEL.get(label);
            return c ? { icon: c.icon, color: c.color, actionText: "فتح", valid: !0 } : { valid: !1 };
        }
        if ("إضافة" === type) {
            const clean = stripCount(label);
            if (isRestrictedLabel(clean)) return { valid: !1 };
            const live = liveMenuItems.get(clean);
            const cached = domAddonsMap.get(clean);
            return {
                icon: normIcon(live?.icon || cached?.icon, "fas fa-puzzle-piece"),
                color: safeColor(live?.iconColor || cached?.color, "#D4AF37"),
                actionText: "فتح", valid: !0
            };
        }
        if ("لعبة" === type) {
            const cached = domGamesMap.get(stripCount(label));
            return { icon: cached?.icon || "fas fa-gamepad", color: cached?.color || "#22d3ee", actionText: "لعب", valid: !0 };
        }
        if ("غرفة" === type) return { icon: "fas fa-door-open", color: "#34d399", actionText: "دخول", valid: !0 };
        return { valid: !1 };
    }

    function createChipBtn(type, label, meta) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lsc-chip";
        btn.dataset.lscType = type;
        btn.dataset.lscLabel = label;

        const ico = document.createElement("i");
        ico.className = `${meta.icon} lsc-chip-ico`;
        ico.style.color = meta.color;

        const txt = document.createElement("span");
        txt.textContent = label;

        const go = document.createElement("span");
        go.className = "lsc-chip-go";
        go.textContent = meta.actionText;

        btn.append(ico, txt, go);
        return btn;
    }

    function transformMessageEl(el) {
        if (!el || processedEls.has(el)) return;
        processedEls.add(el);
        const txt = el.textContent;
        if (!txt || -1 === txt.indexOf("«") || -1 === txt.indexOf(":")) return;

        ensureBootedUI();

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            const v = node.nodeValue;
            if (!v || -1 === v.indexOf("«") || -1 === v.indexOf(":")) continue;
            if (node.parentElement?.closest(SKIP_PARENT_SEL)) continue;
            textNodes.push(node);
        }

        for (let i = 0; i < textNodes.length; i++) {
            const tn = textNodes[i], val = tn.nodeValue;
            TOKEN_RE.lastIndex = 0;
            let last = 0, match, changed = !1;
            const frag = document.createDocumentFragment();
            while ((match = TOKEN_RE.exec(val))) {
                const type = match[1], label = norm(match[2]);
                const meta = resolveVisualMeta(type, label);
                if (!meta.valid) continue;
                if (match.index > last) frag.appendChild(document.createTextNode(val.slice(last, match.index)));
                frag.appendChild(createChipBtn(type, label, meta));
                last = match.index + match[0].length;
                changed = !0;
            }
            if (changed) {
                if (last < val.length) frag.appendChild(document.createTextNode(val.slice(last)));
                tn.parentNode?.replaceChild(frag, tn);
            }
        }
    }

    function scanNodeFast(node, allowFallback = !1) {
        if (!node || 1 !== node.nodeType) return;
        if (node.matches(MSG_TEXT_SEL)) {
            transformMessageEl(node);
            return;
        }
        const targets = node.querySelectorAll(MSG_TEXT_SEL);
        if (targets.length) {
            for (let i = 0; i < targets.length; i++) transformMessageEl(targets[i]);
        } else if (allowFallback) {
            const raw = node.textContent;
            if (raw && -1 !== raw.indexOf("«") && -1 !== raw.indexOf(":")) transformMessageEl(node);
        }
    }

    // قفل لمنع التكرار عند الضغط السريع مرتين
    let execBusy = !1;
    let execResetTimer = null;
    async function executeChip(type, label) {
        if (execBusy) return;
        execBusy = !0;
        clearTimeout(execResetTimer);
        execResetTimer = setTimeout(() => { execBusy = !1; }, 4000);
        try {
            ensureBootedUI();
            if ("إعداد" === type) {
                const item = CORE_BY_LABEL.get(label);
                if (item) await item.run();
                else denyAccess();
            } else if ("إضافة" === type) await runDynamicAddon(label);
            else if ("لعبة" === type) await runDynamicGame(label);
            else if ("غرفة" === type) await runDynamicRoom(label);
        } catch (err) {
            showToast("⚠️ تعذر فتح الاختصار حالياً", !0);
        } finally {
            clearTimeout(execResetTimer);
            setTimeout(() => { execBusy = !1; }, 220);
        }
    }

    const clickBound = new WeakSet();
    function bindContainerClicks(container) {
        if (!container || clickBound.has(container)) return;
        clickBound.add(container);

        const stopChipEvent = e => {
            if (1 === e.target?.nodeType && e.target.closest(".lsc-chip")) e.stopPropagation();
        };
        container.addEventListener("pointerdown", stopChipEvent, !0);
        container.addEventListener("mousedown", stopChipEvent, !0);
        container.addEventListener("click", e => {
            if (1 !== e.target?.nodeType) return;
            const chip = e.target.closest(".lsc-chip");
            if (!chip) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const type = chip.dataset.lscType, label = chip.dataset.lscLabel;
            setTimeout(() => executeChip(type, label), 15);
        }, !0);
    }

    // ==================== قائمة الاقتراحات بعلامة / (بدون Forced Reflow) ====================
    const menuState = {
        open: !1, cat: "الكل", query: "",
        slashIdx: -1, caretEnd: -1,
        allItems: [], items: [], selIdx: 0,
        inputEl: null, menuEl: null
    };

    function onOutsideTap(e) {
        if (!menuState.open) return;
        if (e.target === menuState.inputEl || e.target?.closest?.("#lsc-menu")) return;
        closeMenu();
    }

    let vpRaf = 0;
    function onViewportChange() {
        if (!menuState.open || vpRaf) return;
        vpRaf = requestAnimationFrame(() => {
            vpRaf = 0;
            positionMenu();
        });
    }

    function ensureMenu() {
        ensureBootedUI();
        if (menuState.menuEl) return menuState.menuEl;
        const m = document.createElement("div");
        m.id = "lsc-menu";
        m.innerHTML = `
            <div class="lsc-mhead">
                <span><i class="fas fa-bolt" style="color:#D4AF37;"></i> اختصارات التوجيه السريع</span>
                <button type="button" class="lsc-mclose" id="lsc-mclose" title="إغلاق"><i class="fas fa-times"></i></button>
            </div>
            <div class="lsc-mcats" id="lsc-mcats">
                ${CATS.map(c => `<button type="button" class="lsc-cat ${c === menuState.cat ? "active" : ""}" data-cat="${c}">${c}</button>`).join("")}
            </div>
            <div class="lsc-mlist" id="lsc-mlist"></div>`;
        document.body.appendChild(m);
        menuState.menuEl = m;

        m.addEventListener("mousedown", e => e.preventDefault());
        m.querySelector("#lsc-mclose").onclick = () => closeMenu();
        m.querySelectorAll(".lsc-cat").forEach(b => {
            b.onclick = () => {
                menuState.cat = b.dataset.cat;
                menuState.selIdx = 0;
                m.querySelectorAll(".lsc-cat").forEach(x => x.classList.toggle("active", x === b));
                renderMenuList(!1);
            };
        });
        return m;
    }

    function measureBar(inp) {
        const bar = inp?.closest(".chat-input-container, .quick-chat-form-container, .wall-post-form-container, .private-chat-input-area") || inp;
        if (!bar) return null;
        const r = bar.getBoundingClientRect();
        const vv = window.visualViewport;
        return {
            top: r.top,
            bottom: r.bottom,
            right: r.right,
            vw: vv ? vv.width : window.innerWidth,
            vTop: vv ? vv.offsetTop : 0,
            vLeft: vv ? vv.offsetLeft : 0,
            vBottom: vv ? (vv.offsetTop + vv.height) : window.innerHeight,
            winH: window.innerHeight
        };
    }

    function applyMenuPosition(rect) {
        const m = menuState.menuEl;
        if (!m || !rect) return;
        const mw = Math.min(355, Math.max(240, rect.vw - 16));
        m.style.width = `${mw}px`;

        let left = rect.right - mw;
        left = Math.max(rect.vLeft + 8, Math.min(left, rect.vLeft + rect.vw - mw - 8));
        m.style.left = `${Math.round(left)}px`;
        m.style.right = "auto";

        const spaceAbove = rect.top - rect.vTop - 10;
        const listEl = m.querySelector("#lsc-mlist");
        if (spaceAbove >= 145) {
            if (listEl) listEl.style.maxHeight = `${Math.min(240, Math.max(95, Math.floor(spaceAbove - 92)))}px`;
            m.style.top = "auto";
            m.style.bottom = `${Math.max(8, Math.round(rect.winH - rect.top + 8))}px`;
        } else {
            const spaceBelow = Math.max(120, rect.vBottom - rect.bottom - 10);
            if (listEl) listEl.style.maxHeight = `${Math.min(220, Math.max(90, Math.floor(spaceBelow - 92)))}px`;
            m.style.bottom = "auto";
            m.style.top = `${Math.max(rect.vTop + 8, Math.round(rect.bottom + 8))}px`;
        }
    }

    function positionMenu() {
        if (!menuState.open || !menuState.inputEl) return;
        applyMenuPosition(measureBar(menuState.inputEl));
    }

    function getFilteredItems() {
        const q = normAr(menuState.query);
        if (q) {
            return { recents: [], main: menuState.allItems.filter(it => it._q.includes(q)) };
        }
        const main = "الكل" === menuState.cat
            ? menuState.allItems
            : menuState.allItems.filter(it => it.cat === menuState.cat);

        let recents = [];
        if ("الكل" === menuState.cat && recentList.length) {
            recents = recentList
                .map(r => menuState.allItems.find(it => it.type === r.type && it.label === r.label))
                .filter(Boolean);
        }
        return { recents, main };
    }

    function insertSelected(item) {
        const inp = menuState.inputEl;
        if (!inp || !item) return;
        recordRecent(item.type, item.label);
        const val = inp.value;
        const start = menuState.slashIdx;
        const end = menuState.caretEnd;
        const token = `«${item.type}: ${item.label}» `;
        closeMenu();
        if (start >= 0 && end >= start) {
            inp.value = val.slice(0, start) + token + val.slice(end);
            const pos = start + token.length;
            requestAnimationFrame(() => {
                inp.focus();
                try { inp.setSelectionRange(pos, pos); } catch (e) {}
                inp.dispatchEvent(new Event("input", { bubbles: !0 }));
            });
        } else {
            inp.value = (val ? val + " " : "") + token;
            requestAnimationFrame(() => {
                inp.focus();
                inp.dispatchEvent(new Event("input", { bubbles: !0 }));
            });
        }
    }

    async function runSilentSync(kind, btn) {
        const sb = document.getElementById("right-sidebar");
        const wasOpen = Boolean(sb?.classList.contains("open"));
        const prevTab = wasOpen ? getActiveTabId() : "";
        btn.disabled = !0;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الجلب...';

        let cnt = 0;
        if ("addons" === kind) {
            if (await openAddonsMenu()) cnt = scanAddonsInDOM();
        } else if ("games" === kind) {
            if (await ensureGamesLoaded(!1)) cnt = scanGamesInDOM();
        } else if ("rooms" === kind) {
            if (await ensureRoomsLoaded(!1)) cnt = document.querySelectorAll("#sidebar-rooms-container .room-card").length;
        }

        if (!wasOpen) closeSidebarSilently();
        else if (prevTab) showSidebarTab(prevTab);

        menuState.allItems = getLiveItems();
        renderMenuList(!1);
        showToast(cnt > 0 ? `✅ تم التحديث (${cnt})` : "⚠️ تعذر الجلب حالياً", cnt <= 0);
    }

    function renderMenuList(fromKeyNav = !1) {
        const m = ensureMenu();
        const listEl = m.querySelector("#lsc-mlist");
        const { recents, main } = getFilteredItems();
        const flat = [...recents, ...main];
        menuState.items = flat;
        if (menuState.selIdx >= flat.length) menuState.selIdx = 0;

        const hasAddons = menuState.allItems.some(x => "إضافة" === x.type);
        const hasGames = menuState.allItems.some(x => "لعبة" === x.type);
        const hasRooms = menuState.allItems.some(x => "غرفة" === x.type);

        let syncHtml = "";
        if ("الإضافات" === menuState.cat) {
            syncHtml = `<button type="button" class="lsc-sync-btn" data-sync="addons"><i class="fas fa-sync-alt"></i> ${hasAddons ? "تحديث قائمة الإضافات" : "جلب قائمة الإضافات الآن"}</button>`;
        } else if ("الألعاب" === menuState.cat) {
            syncHtml = `<button type="button" class="lsc-sync-btn" data-sync="games"><i class="fas fa-sync-alt"></i> ${hasGames ? "تحديث قائمة الألعاب" : "جلب قائمة الألعاب الآن"}</button>`;
        } else if ("الغرف والحائط" === menuState.cat && !hasRooms) {
            syncHtml = `<button type="button" class="lsc-sync-btn" data-sync="rooms"><i class="fas fa-sync-alt"></i> جلب قائمة الغرف الآن</button>`;
        }

        const renderRow = (it, idx) => `
            <button type="button" class="lsc-item ${idx === menuState.selIdx ? "sel" : ""}" data-idx="${idx}">
                <div class="lsc-iico" style="color:${esc(it.color)};"><i class="${esc(it.icon)}"></i></div>
                <div class="lsc-itxt">
                    <div class="lsc-ilbl">${esc(it.label)}</div>
                    <div class="lsc-ihint">${esc(it.hint)}</div>
                </div>
            </button>`;

        if (!flat.length) {
            listEl.innerHTML = syncHtml + '<div class="lsc-empty">لا يوجد اختصار مطابق — جرّب كلمة أخرى</div>';
        } else {
            let html = syncHtml;
            let idx = 0;
            if (recents.length) {
                html += '<div class="lsc-sec-lbl"><i class="fas fa-history" style="color:#D4AF37;"></i> الأخيرة</div>';
                for (let i = 0; i < recents.length; i++) html += renderRow(recents[i], idx++);
                html += '<div class="lsc-sec-lbl"><i class="fas fa-bolt" style="color:#94a3b8;"></i> جميع الاختصارات</div>';
            }
            for (let i = 0; i < main.length; i++) html += renderRow(main[i], idx++);
            listEl.innerHTML = html;
        }

        const syncBtn = listEl.querySelector("[data-sync]");
        if (syncBtn) syncBtn.onclick = () => runSilentSync(syncBtn.dataset.sync, syncBtn);

        listEl.querySelectorAll(".lsc-item").forEach(b => {
            b.onclick = () => insertSelected(menuState.items[Number(b.dataset.idx)]);
        });

        requestAnimationFrame(() => {
            if (!menuState.open) return;
            if (fromKeyNav) listEl.querySelector(".lsc-item.sel")?.scrollIntoView({ block: "nearest" });
            else listEl.scrollTop = 0;
        });
    }

    function openMenu() {
        const rect = measureBar(menuState.inputEl);
        const m = ensureMenu();
        menuState.allItems = getLiveItems();
        if (!menuState.open) {
            menuState.open = !0;
            applyMenuPosition(rect);
            m.classList.add("open");
            document.addEventListener("pointerdown", onOutsideTap, { passive: !0 });
            window.addEventListener("resize", onViewportChange, { passive: !0 });
            window.visualViewport?.addEventListener("resize", onViewportChange, { passive: !0 });
            window.visualViewport?.addEventListener("scroll", onViewportChange, { passive: !0 });
        }
        renderMenuList(!1);
    }

    function closeMenu() {
        if (!menuState.open) return;
        menuState.open = !1;
        if (vpRaf) { cancelAnimationFrame(vpRaf); vpRaf = 0; }
        menuState.menuEl?.classList.remove("open");
        document.removeEventListener("pointerdown", onOutsideTap);
        window.removeEventListener("resize", onViewportChange);
        window.visualViewport?.removeEventListener("resize", onViewportChange);
        window.visualViewport?.removeEventListener("scroll", onViewportChange);
    }

    function inspectInput(inp) {
        menuState.inputEl = inp;
        const val = inp.value;
        if (!val || -1 === val.indexOf("/")) { if (menuState.open) closeMenu(); return; }
        const caret = inp.selectionStart ?? val.length;
        const beforeCaret = val.slice(0, caret);
        const m = beforeCaret.match(TRIGGER_RE);
        if (!m) { if (menuState.open) closeMenu(); return; }
        const q = m[1] || "";
        if (/^\s/.test(q)) { if (menuState.open) closeMenu(); return; }
        menuState.slashIdx = beforeCaret.lastIndexOf("/");
        menuState.caretEnd = caret;
        menuState.query = q;
        menuState.selIdx = 0;
        if (menuState.open) renderMenuList(!1);
        else openMenu();
    }

    // ==================== ربط المدخلات والحاويات بمعالجة مجزّأة (Chunked rAF) ====================
    const inputBound = new WeakSet();
    function attachChatInput(inp) {
        if (!inp || inputBound.has(inp)) return;
        inputBound.add(inp);
        inp.addEventListener("input", () => inspectInput(inp), { passive: !0 });
        inp.addEventListener("click", () => { if (inp.value && -1 !== inp.value.indexOf("/")) inspectInput(inp); }, { passive: !0 });
        inp.addEventListener("keydown", e => {
            if (!menuState.open || menuState.inputEl !== inp) return;
            if ("Escape" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation(); closeMenu();
            } else if ("ArrowDown" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation();
                if (menuState.items.length) {
                    menuState.selIdx = (menuState.selIdx + 1) % menuState.items.length;
                    renderMenuList(!0);
                }
            } else if ("ArrowUp" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation();
                if (menuState.items.length) {
                    menuState.selIdx = (menuState.selIdx - 1 + menuState.items.length) % menuState.items.length;
                    renderMenuList(!0);
                }
            } else if ("Enter" === e.key || "Tab" === e.key) {
                if (menuState.items.length) {
                    e.preventDefault(); e.stopImmediatePropagation();
                    insertSelected(menuState.items[menuState.selIdx]);
                }
            }
        }, !0);
    }

    const obsBound = new WeakSet();
    function observeMessages(container, allowFallback = !1, skipWhenWallClosed = !1) {
        if (!container || obsBound.has(container)) return;
        obsBound.add(container);
        bindContainerClicks(container);

        const isWallClosed = () => {
            if (!skipWhenWallClosed) return !1;
            const sb = document.getElementById("right-sidebar");
            const wc = document.getElementById("sidebar-wall-container");
            return !sb || !sb.classList.contains("open") || !wc || wc.classList.contains("d-none");
        };

        let queue = [];
        let rafId = 0;

        const flush = () => {
            rafId = 0;
            if (isWallClosed()) { queue.length = 0; return; }
            const limit = Math.min(queue.length, 12);
            for (let i = 0; i < limit; i++) scanNodeFast(queue[i], allowFallback);
            if (queue.length > limit) {
                queue = queue.slice(limit);
                rafId = requestAnimationFrame(flush);
            } else {
                queue.length = 0;
            }
        };

        if (!isWallClosed()) {
            runIdle(() => {
                if (isWallClosed()) return;
                const ch = container.children;
                for (let i = 0; i < ch.length; i++) queue.push(ch[i]);
                if (queue.length && !rafId) rafId = requestAnimationFrame(flush);
            });
        }

        const mo = new MutationObserver(muts => {
            if (isWallClosed()) return;
            for (let i = 0; i < muts.length; i++) {
                const nodes = muts[i].addedNodes;
                for (let j = 0; j < nodes.length; j++) {
                    if (1 === nodes[j].nodeType) queue.push(nodes[j]);
                }
            }
            if (queue.length && !rafId) rafId = requestAnimationFrame(flush);
        });
        mo.observe(container, { childList: !0 });
    }

    function scanExistingVisible(container, allowFallback = !1) {
        if (!container) return;
        const ch = container.children;
        let idx = 0;
        const step = () => {
            const end = Math.min(idx + 12, ch.length);
            for (; idx < end; idx++) scanNodeFast(ch[idx], allowFallback);
            if (idx < ch.length) requestAnimationFrame(step);
        };
        if (ch.length) requestAnimationFrame(step);
    }

    function bindWallAndQuickChat() {
        document.querySelectorAll("#quick-chat-messages").forEach(el => {
            observeMessages(el, !1, !0);
            scanExistingVisible(el, !1);
        });
        document.querySelectorAll("#wall-posts-container").forEach(el => {
            observeMessages(el, !1, !0);
            scanExistingVisible(el, !1);
        });
    }

    let wallClassWatched = !1;
    function watchWallOpenOnce() {
        if (wallClassWatched) return;
        const wc = document.getElementById("sidebar-wall-container");
        if (!wc) return;
        wallClassWatched = !0;
        let t = null;
        new MutationObserver(() => {
            if (wc.classList.contains("d-none")) return;
            clearTimeout(t);
            t = setTimeout(bindWallAndQuickChat, 250);
        }).observe(wc, { attributes: !0, attributeFilter: ["class"] });
    }

    // ==================== التشغيل المؤجل لما بعد تسجيل الدخول (صفر مؤقتات دائمة) ====================
    function isLoginHidden() {
        const mc = document.getElementById("messages-container");
        if (!mc) return !1;
        const lo = document.getElementById("login-overlay");
        return !lo || lo.classList.contains("d-none") || "none" === lo.style.display;
    }

    let initialized = !1;
    function startAfterLogin() {
        if (initialized) return;
        initialized = !0;

        const mainInp = document.getElementById("chat-input");
        const mainBox = document.getElementById("messages-container");
        const prvBox = document.getElementById("private-chat-messages-inner");
        if (mainInp) attachChatInput(mainInp);
        if (mainBox) observeMessages(mainBox, !1, !1);
        if (prvBox) observeMessages(prvBox, !0, !1);
        watchWallOpenOnce();

        document.addEventListener("focusin", e => {
            const t = e.target;
            if (!t || !SUPPORTED_INPUT_IDS.has(t.id)) return;
            attachChatInput(t);
            if ("quick-chat-input" === t.id || "wall-post-input" === t.id) bindWallAndQuickChat();
            else if ("private-chat-input" === t.id) {
                const pb = document.getElementById("private-chat-messages-inner");
                if (pb) observeMessages(pb, !0, !1);
            }
        }, { passive: !0 });
    }

    function scheduleStart() {
        setTimeout(() => runIdle(startAfterLogin), 2200);
    }

    if (isLoginHidden()) {
        scheduleStart();
    } else {
        const lo = document.getElementById("login-overlay");
        if (lo) {
            const loginObs = new MutationObserver(() => {
                if (isLoginHidden()) {
                    loginObs.disconnect();
                    scheduleStart();
                }
            });
            loginObs.observe(lo, { attributes: !0, attributeFilter: ["class", "style"] });
        } else {
            let tries = 0;
            const t = setInterval(() => {
                if (isLoginHidden() || ++tries >= 20) {
                    clearInterval(t);
                    if (isLoginHidden()) scheduleStart();
                }
            }, 1500);
        }
    }
}();
