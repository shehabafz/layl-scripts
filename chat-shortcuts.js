!function () {
    "use strict";
    if (window.laylChatShortcutsLoaded) return;
    window.laylChatShortcutsLoaded = !0;

    const ADDONS_CACHE_KEY = "lsc_dynamic_addons_v3";
    const GAMES_CACHE_KEY = "lsc_dynamic_games_v2";
    const norm = s => String(s || "").replace(/\s+/g, " ").trim();
    const stripCount = s => norm(s).replace(/\s*\(\d+\)\s*$/, "").trim();
    const esc = s => String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

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
        return /لوحة تحكم|لوحه التحكم|لوحات التحكم|لوحة الاقتراحات|إدارة التقويم|ادارة التقويم|إدارة الغرفة|ادارة الغرفة|إرسال إعلان|ارسال اعلان|إرسال استفتاء|ارسال استفتاء/i.test(txt)
            || /admin|custom-ids-dash/i.test(id);
    }

    // فحص الصلاحية بدون التأثر بحركة الـ opacity / visibility أثناء فتح القائمة
    function isElementAllowed(el) {
        if (!el || !el.isConnected) return !1;
        if (el.hidden || el.disabled || el.hasAttribute("disabled") || "true" === el.getAttribute("aria-disabled")) return !1;
        if (el.classList.contains("d-none") || "none" === el.style.display) return !1;
        return "none" !== window.getComputedStyle(el).display;
    }

    function getCleanBtnText(btn) {
        if (!btn) return "";
        const txtEl = btn.querySelector(".modern-classic-text, .modern-classic-game-title");
        if (txtEl) return stripCount(txtEl.textContent);
        const cl = btn.cloneNode(!0);
        cl.querySelectorAll(".badge,.addon-badge,[class*='badge'],[class*='dot'],[class*='count'],.sr-only,.visually-hidden").forEach(x => x.remove());
        return stripCount(cl.textContent);
    }

    function waitFor(checkFn, maxMs = 1800, stepMs = 70) {
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

    // ==================== تنبيه خفيف وأدوات فتح القوائم ====================
    let toastTimer = null;
    function showToast(msg, isLock = !1) {
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
        toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
    }

    function denyAccess(msg) {
        showToast(msg || "🔒 هذا الخيار غير متاح لحسابك", !0);
        return !1;
    }

    function getActiveTabId() {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return "";
        const tabs = sb.querySelectorAll("#sidebar-content > .sidebar-tab-content");
        for (const t of tabs) {
            if (!t.classList.contains("d-none") && "none" !== t.style.display) return t.id;
        }
        return "";
    }

    function openSidebarTab(tabId, title) {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return !1;
        sb.classList.remove("d-none");
        if ("none" === sb.style.display) sb.style.display = "";
        sb.classList.add("open");
        sb.querySelectorAll("#sidebar-content > .sidebar-tab-content").forEach(el => {
            const show = el.id === tabId;
            el.classList.toggle("d-none", !show);
            if (show && "none" === el.style.display) el.style.display = "";
        });
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
        if (tab && tab.id) return openSidebarTab(tab.id, title);
        sb.classList.remove("d-none");
        if ("none" === sb.style.display) sb.style.display = "";
        sb.classList.add("open");
        return !0;
    }

    function closeSidebarSilently() {
        const closeBtn = document.getElementById("close-sidebar");
        if (closeBtn) closeBtn.click();
        else document.getElementById("right-sidebar")?.classList.remove("open");
    }

    function highlightEl(el) {
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.remove("lsc-pulse");
        void el.offsetWidth;
        el.classList.add("lsc-pulse");
        setTimeout(() => el.classList.remove("lsc-pulse"), 2600);
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
            try { el.focus({ preventScroll: !0 }); } catch (e) {}
        }
    }

    // البحث الشامل عن أزرار الشريط الرئيسي للشات (يشمل button و div و li و a)
    function findNavButton(kind) {
        const cfg = {
            settings: {
                sels: [
                    "#settings-btn", "#btn-settings", "#nav-settings", "#sidebar-settings-btn", "#tab-settings",
                    '[data-tab="settings"]', '[data-sidebar-tab="settings"]', '[data-target="settings"]',
                    '[onclick*="renderSettings"]', '[onclick*="openSettings"]', '[onclick*="settings" i]'
                ],
                words: ["الضبط", "الإعدادات", "الاعدادات"],
                icons: [".fa-cog", ".fa-gear", ".fa-sliders-h", ".fa-sliders"]
            },
            wall: {
                sels: [
                    "#wall-btn", "#btn-wall", "#nav-wall", "#sidebar-wall-btn", "#tab-wall",
                    '[data-tab="wall"]', '[data-sidebar-tab="wall"]', '[data-target="wall"]',
                    '[onclick*="openWall"]', '[onclick*="renderWall"]', '[onclick*="wall" i]'
                ],
                words: ["الحائط", "حائط"],
                icons: [".fa-newspaper", ".fa-stream", ".fa-rss", ".fa-th-list"]
            },
            rooms: {
                sels: [
                    "#rooms-btn", "#btn-rooms", "#nav-rooms", "#sidebar-rooms-btn", "#tab-rooms",
                    '[data-tab="rooms"]', '[data-sidebar-tab="rooms"]', '[data-target="rooms"]',
                    '[onclick*="openRooms"]', '[onclick*="renderRooms"]', '[onclick*="rooms" i]'
                ],
                words: ["الغرف", "الرومات"],
                icons: [".fa-door-open", ".fa-home"]
            }
        }[kind];
        if (!cfg) return null;

        const isOuterNav = el => el && isElementAllowed(el)
            && !el.closest("#right-sidebar, #lsc-menu, #messages-container, #chat-form, .modal, .lrc-ov, .lrca-ov, #login-overlay");

        for (const sel of cfg.sels) {
            try {
                for (const el of document.querySelectorAll(sel)) {
                    if (isOuterNav(el)) return el;
                }
            } catch (e) {}
        }
        const candidates = document.querySelectorAll("button, a, li, [role='button'], [onclick], [data-tab], [data-sidebar], [data-target], .nav-item, .nav-link");
        for (const el of candidates) {
            if (!isOuterNav(el)) continue;
            const meta = norm(`${el.getAttribute("title") || ""} ${el.getAttribute("aria-label") || ""} ${getCleanBtnText(el)}`);
            if (meta && meta.length < 30 && cfg.words.some(w => meta.includes(w))) return el;
        }
        for (const el of candidates) {
            if (!isOuterNav(el)) continue;
            if (cfg.icons.some(ic => el.querySelector(ic))) return el;
        }
        return null;
    }

    async function ensureSettingsView() {
        const cont = document.getElementById("sidebar-settings-container");
        if (!cont) return !1;

        if (cont.querySelector(".classic-settings-container")) {
            openSidebarTab("sidebar-settings-container", "الضبط والإعدادات");
            return !0;
        }

        if ("function" === typeof window.renderSettings) {
            openSidebarTab("sidebar-settings-container", "الضبط والإعدادات");
            try { window.renderSettings(); } catch (e) {}
            const ok = await waitFor(() => cont.querySelector(".classic-settings-container"), 1100);
            if (ok) { openSidebarTab("sidebar-settings-container", "الضبط والإعدادات"); return !0; }
        }

        const navBtn = findNavButton("settings");
        if (navBtn) {
            navBtn.click();
            const ok = await waitFor(() => cont.querySelector(".classic-settings-container"), 1600);
            if (ok) { openSidebarTab("sidebar-settings-container", "الضبط والإعدادات"); return !0; }
        }
        return !1;
    }

    async function ensureWallView() {
        const cont = document.getElementById("sidebar-wall-container");
        const sb = document.getElementById("right-sidebar");
        if (!cont || !sb) return !1;

        const isWallOpenNow = () => Boolean(sb.classList.contains("open") && !cont.classList.contains("d-none") && "none" !== cont.style.display);
        const isWallInit = () => Boolean(
            cont.querySelector('#btn-tab-posts[data-events-bound="true"]') ||
            cont.querySelector(".wall-post-card") ||
            cont.querySelector(".quick-chat-card")
        );

        // إذا لم تكن نافذة الحائط مفتوحة فعلياً، نفتحها أولاً عبر زر الحائط الأصلي لتهيئة التبويبات
        if (!isWallOpenNow() || !isWallInit()) {
            const navBtn = findNavButton("wall");
            if (navBtn) {
                navBtn.click();
                await waitFor(() => isWallOpenNow() && isWallInit(), 1600);
            } else if ("function" === typeof window.openWall) {
                try { window.openWall(); } catch (e) {}
                await waitFor(isWallInit, 1400);
            } else if ("function" === typeof window.renderWall) {
                try { window.renderWall(); } catch (e) {}
                await waitFor(isWallInit, 1400);
            }
        }

        openSidebarTab("sidebar-wall-container", "الحائط");
        await delay(100);
        return Boolean(document.getElementById("btn-tab-quickchat") || document.getElementById("wall-posts-container"));
    }

    async function ensureRoomsLoaded() {
        const cont = document.getElementById("sidebar-rooms-container");
        if (!cont) return !1;
        const isReady = () => cont.querySelector(".room-card");
        if (isReady()) return !0;
        const navBtn = findNavButton("rooms");
        if (!navBtn) return !1;
        navBtn.click();
        return Boolean(await waitFor(isReady, 2000));
    }

    function findAddonsButtonsInDOM() {
        const sb = document.getElementById("right-sidebar");
        if (!sb) return [];
        const box = sb.querySelector(".modern-classic-addons-container");
        if (box) {
            return Array.from(box.querySelectorAll(".modern-classic-list > button.modern-classic-item, button.modern-classic-item"));
        }
        const out = [], seen = new Set();
        sb.querySelectorAll(".modern-classic-icon-wrapper").forEach(wrap => {
            const btn = wrap.closest("button");
            if (!btn || seen.has(btn) || btn.closest("#games-list")) return;
            seen.add(btn);
            out.push(btn);
        });
        return out;
    }

    function findGamesBtnInAddons() {
        const btns = findAddonsButtonsInDOM();
        for (const b of btns) {
            if (!isElementAllowed(b)) continue;
            if (/openGamesView/i.test(b.getAttribute("onclick") || "")) return b;
        }
        for (const b of btns) {
            if (!isElementAllowed(b)) continue;
            const txt = getCleanBtnText(b);
            if ("الألعاب" === txt || "الالعاب" === txt) return b;
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

        // التحقق من صلاحية زر الإضافات عبر الضبط أولاً
        const settingsOk = await ensureSettingsView();
        if (settingsOk) {
            const addonsBtn = await waitFor(() => document.querySelector('#sidebar-settings-container .classic-btn-addons, #sidebar-settings-container button[onclick*="renderAddons"]'), 900);
            if (!isElementAllowed(addonsBtn)) return !1;
            addonsBtn.click();
            const appeared = await waitFor(() => getBox() && findAddonsButtonsInDOM().length > 0, 500);
            if (!appeared && "function" === typeof window.renderAddons) {
                try { window.renderAddons(); } catch (e) {}
            }
        } else if ("function" === typeof window.renderAddons) {
            openSidebarTab("sidebar-settings-container", "الإضافات");
            try { window.renderAddons(); } catch (e) {}
        } else {
            return !1;
        }

        const ok = await waitFor(() => getBox() && findAddonsButtonsInDOM().length > 0, 1800);
        if (!ok) return !1;
        await waitFor(() => sb.querySelector('.modern-classic-list [data-lail-controlled="true"]'), 600);
        await delay(180);
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
        const isGamesVisible = () => Boolean(sb.classList.contains("open") && !gamesCont.classList.contains("d-none"));

        if (hasBuiltIn() && hasCustom() && isGamesVisible()) {
            scanGamesInDOM();
            return !0;
        }

        // إذا لم تكن قائمة الألعاب محمّلة بعد، نتأكد أولاً من صلاحية زر الألعاب داخل الإضافات
        if (!hasBuiltIn()) {
            const addonsOk = await openAddonsMenu();
            if (addonsOk) {
                const gamesBtn = findGamesBtnInAddons();
                if (!gamesBtn) return !1;
                gamesBtn.click();
            } else if ("function" === typeof window.openGamesView) {
                try { window.openGamesView(); } catch (e) {}
            } else {
                return !1;
            }
        } else if ("function" === typeof window.openGamesView) {
            // تشغيل الدالة الرسمية حتى تتفعّل مستمعات الألعاب ولو كانت القائمة مغلقة
            try { window.openGamesView(); } catch (e) {}
        }

        const ok = await waitFor(hasBuiltIn, 1800);
        if (!ok) return !1;
        await waitFor(hasCustom, 900);
        await delay(140);
        if (openView) openSidebarTab("sidebar-games-container", "الألعاب");
        attachGamesListObserver();
        scanGamesInDOM();
        return !0;
    }

    async function openSettingField(selector, expandPrivacy = !1, clickTarget = !1, label = "") {
        const ok = await ensureSettingsView();
        if (!ok) return denyAccess("🔒 قائمة الضبط غير متاحة لحسابك");

        if (expandPrivacy) {
            const hdr = document.querySelector("#privacy-group .settings-group-header");
            if (hdr && "true" !== hdr.getAttribute("aria-expanded")) {
                hdr.click();
                await delay(140);
            }
        }
        const target = await waitFor(() => document.querySelector(selector), 900);
        if (!isElementAllowed(target)) return denyAccess();
        if (clickTarget) target.click();
        else highlightEl(target);
        if (label) showToast(`⚡ تم فتح: ${label}`);
        return !0;
    }

    // ==================== الكاش والاكتشاف التلقائي ====================
    const liveMenuItems = new Map();
    const domAddonsMap = new Map();
    const domGamesMap = new Map();

    function loadCaches() {
        try {
            const a = JSON.parse(localStorage.getItem(ADDONS_CACHE_KEY) || "[]");
            if (Array.isArray(a)) a.forEach(x => { if (x?.label && !isRestrictedLabel(x.label, x.id)) domAddonsMap.set(x.label, x); });
        } catch (e) {}
        try {
            const g = JSON.parse(localStorage.getItem(GAMES_CACHE_KEY) || "[]");
            if (Array.isArray(g)) g.forEach(x => { if (x?.label) domGamesMap.set(x.label, x); });
        } catch (e) {}
    }

    function saveAddonsCache() {
        try {
            localStorage.setItem(ADDONS_CACHE_KEY, JSON.stringify(Array.from(domAddonsMap.values()).filter(a => !isRestrictedLabel(a.label, a.id)).slice(0, 80)));
        } catch (e) {}
    }

    function saveGamesCache() {
        try {
            localStorage.setItem(GAMES_CACHE_KEY, JSON.stringify(Array.from(domGamesMap.values()).slice(0, 60)));
        } catch (e) {}
    }

    function registerLiveItem(it) {
        if (!it || !it.text) return;
        const label = stripCount(it.text);
        if (!label) return;
        liveMenuItems.set(label, it);
        if (!isRestrictedLabel(label, it.id || "")) {
            domAddonsMap.set(label, {
                label,
                id: it.id || "",
                icon: normIcon(it.icon, "fas fa-puzzle-piece"),
                color: safeColor(it.iconColor, "#D4AF37")
            });
            saveAddonsCache();
        }
    }

    function absorbLaylMenu() {
        if (Array.isArray(window.__laylMenuQueue)) window.__laylMenuQueue.forEach(registerLiveItem);
        const lm = window.LaylMenu;
        if (!lm) return !1;
        try {
            Object.keys(lm).forEach(k => {
                const v = lm[k];
                if (Array.isArray(v)) v.forEach(x => { if (x && x.text && "function" === typeof x.onClick) registerLiveItem(x); });
            });
        } catch (e) {}
        if ("function" === typeof lm.register && !lm.register.__lscWrapped) {
            const orig = lm.register.bind(lm);
            const wrapped = function (item) { registerLiveItem(item); return orig(item); };
            wrapped.__lscWrapped = !0;
            lm.register = wrapped;
        }
        return !0;
    }

    function scanAddonsInDOM() {
        const btns = findAddonsButtonsInDOM();
        if (!btns.length) return 0;
        let changed = !1, found = 0;
        btns.forEach(btn => {
            if (!isElementAllowed(btn)) return;
            const label = getCleanBtnText(btn);
            if (!label || label.length < 2 || /العودة|رجوع|إغلاق/.test(label)) return;
            if ("الألعاب" === label || "الالعاب" === label) return;
            if (isRestrictedLabel(label, btn.id || "")) return;
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
        });
        if (changed) saveAddonsCache();
        return found;
    }

    function scanGamesInDOM() {
        const btns = document.querySelectorAll("#games-list button.modern-classic-game-item");
        if (!btns.length) return 0;
        let changed = !1, found = 0;
        btns.forEach(btn => {
            const label = getCleanBtnText(btn);
            if (!label) return;
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
        });
        if (changed) saveGamesCache();
        return found;
    }

    function wrapHooks() {
        if ("function" === typeof window.renderAddons && !window.renderAddons.__lscWrapped) {
            const orig = window.renderAddons;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                setTimeout(scanAddonsInDOM, 220);
                setTimeout(scanAddonsInDOM, 650);
                return res;
            };
            wrapped.__lscWrapped = !0;
            window.renderAddons = wrapped;
        }
        if ("function" === typeof window.openGamesView && !window.openGamesView.__lscWrapped) {
            const orig = window.openGamesView;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                setTimeout(() => { attachGamesListObserver(); scanGamesInDOM(); }, 250);
                setTimeout(scanGamesInDOM, 750);
                return res;
            };
            wrapped.__lscWrapped = !0;
            window.openGamesView = wrapped;
        }
    }

    // ==================== تنفيذ الاختصارات مع فحص الصلاحيات ====================
    async function runDynamicAddon(label) {
        const target = stripCount(label);
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
            for (const b of btns) {
                if (!isElementAllowed(b)) continue;
                const txt = getCleanBtnText(b);
                if (!isRestrictedLabel(txt, b.id || "") && txt === target) return b;
            }
            for (const b of btns) {
                if (!isElementAllowed(b)) continue;
                const txt = getCleanBtnText(b);
                if (!isRestrictedLabel(txt, b.id || "") && txt && target && txt.includes(target)) return b;
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

        const btn = await waitFor(findAllowedBtn, 1200);
        if (!btn) return denyAccess("🔒 هذه الإضافة غير متاحة لحسابك");
        btn.click();
        showToast(`🧩 تم فتح: ${target}`);
        return !0;
    }

    async function runDynamicGame(label) {
        const target = stripCount(label);
        const loaded = await ensureGamesLoaded(!0);
        if (!loaded) return denyAccess("🔒 قسم الألعاب غير متاح لحسابك");

        const findBtn = () => {
            const btns = document.querySelectorAll("#games-list button.modern-classic-game-item");
            for (const b of btns) {
                if (getCleanBtnText(b) === target) return b;
            }
            for (const b of btns) {
                const title = getCleanBtnText(b);
                if (title && title.includes(target)) return b;
            }
            return null;
        };

        const btn = await waitFor(findBtn, 1000);
        if (!isElementAllowed(btn)) return denyAccess("🔒 هذه اللعبة غير متاحة لحسابك");
        btn.click();
        showToast(`🎮 تم فتح: ${target}`);
        return !0;
    }

    async function runDynamicRoom(label) {
        const target = norm(label);
        await ensureRoomsLoaded();
        const cards = document.querySelectorAll("#sidebar-rooms-container .room-card");
        let matched = null;
        for (const c of cards) {
            const name = norm(c.querySelector(".fw-bold")?.textContent || "");
            if (name === target) { matched = c; break; }
        }
        if (!matched) {
            for (const c of cards) {
                const name = norm(c.querySelector(".fw-bold")?.textContent || "");
                if (name && name.includes(target)) { matched = c; break; }
            }
        }
        if (!matched || "none" === window.getComputedStyle(matched).display) {
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
                await ensureRoomsLoaded();
                if (!openSidebarTab("sidebar-rooms-container", "الغرف")) return denyAccess();
                showToast("🚪 تم فتح قائمة الغرف");
            }
        },
        {
            label: "إنشاء غرفة جديدة", cat: "الغرف والحائط", hint: "الغرف ◂ إنشاء غرفة خاصة",
            icon: "fas fa-plus-circle", color: "#22c55e", keys: "انشاء غرفة جديدة روم",
            async run() {
                await ensureRoomsLoaded();
                openSidebarTab("sidebar-rooms-container", "الغرف");
                const btn = await waitFor(() => document.querySelector('#sidebar-rooms-container button[onclick*="openCreateRoomModal"]'), 900);
                if (!isElementAllowed(btn)) return denyAccess("🔒 إنشاء الغرف غير متاح لصلاحيات حسابك");
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
                const tab = await waitFor(() => document.getElementById("btn-tab-quickchat"), 1200);
                if (!isElementAllowed(tab)) return denyAccess("🔒 الدردشة السريعة غير متاحة لحسابك");
                for (let i = 0; i < 5; i++) {
                    tab.click();
                    await delay(180);
                    const qc = document.getElementById("quick-chat-content");
                    if (qc && !qc.classList.contains("d-none")) break;
                }
                // خطة احتياطية لإظهار التبويب فوراً مع إبقاء نقر الزر الرسمي
                const qc = document.getElementById("quick-chat-content");
                const posts = document.getElementById("wall-posts-tab-content");
                if (qc && qc.classList.contains("d-none")) {
                    qc.classList.remove("d-none");
                    if (posts) posts.classList.add("d-none");
                    tab.classList.add("active");
                    tab.setAttribute("aria-selected", "true");
                    const pTab = document.getElementById("btn-tab-posts");
                    if (pTab) { pTab.classList.remove("active"); pTab.setAttribute("aria-selected", "false"); }
                    tab.click();
                }
                showToast("⚡ تم فتح: الدردشة السريعة");
            }
        },
        {
            label: "نشر ستوري", cat: "الغرف والحائط", hint: "الحائط ◂ إضافة ستوري جديد",
            icon: "fas fa-plus-circle", color: "#f43f5e", keys: "ستوري قصة نشر story",
            async run() {
                if (!(await ensureWallView())) return denyAccess("🔒 نشر الستوري غير متاح لحسابك");
                const btn = await waitFor(() => document.querySelector("#story-add-btn-wall-stories-container, .story-add-btn"), 1200);
                if (!isElementAllowed(btn)) return denyAccess("🔒 نشر الستوري غير متاح لحسابك");
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

    // ==================== بناء القائمة الحية عند كتابة / ====================
    function getLiveItems() {
        absorbLaylMenu();
        wrapHooks();
        scanAddonsInDOM();
        scanGamesInDOM();

        const result = CORE_SHORTCUTS.map(c => Object.assign({ type: "إعداد" }, c));
        const seenAddons = new Set();

        liveMenuItems.forEach((it, label) => {
            if (isRestrictedLabel(label, it.id || "")) return;
            if ("function" === typeof it.condition && !it.condition()) return;
            seenAddons.add(label);
            result.push({
                type: "إضافة", label, cat: "الإضافات", hint: "الإضافات ◂ فتح مباشر",
                icon: normIcon(it.icon, "fas fa-puzzle-piece"),
                color: safeColor(it.iconColor, "#D4AF37"),
                keys: `اضافة اضافات ${label}`
            });
        });

        domAddonsMap.forEach((it, label) => {
            if (seenAddons.has(label) || isRestrictedLabel(label, it.id || "")) return;
            seenAddons.add(label);
            result.push({
                type: "إضافة", label, cat: "الإضافات", hint: "الإضافات ◂ فتح مباشر",
                icon: it.icon || "fas fa-puzzle-piece",
                color: it.color || "#D4AF37",
                keys: `اضافة اضافات ${label}`
            });
        });

        domGamesMap.forEach((it, label) => {
            result.push({
                type: "لعبة", label, cat: "الألعاب", hint: "الألعاب ◂ تشغيل مباشر",
                icon: it.icon || "fas fa-gamepad",
                color: it.color || "#06b6d4",
                keys: `لعبة العاب ${label}`
            });
        });

        const seenRooms = new Set();
        document.querySelectorAll("#sidebar-rooms-container .room-card").forEach(card => {
            const label = norm(card.querySelector(".fw-bold")?.textContent || "");
            if (!label || seenRooms.has(label)) return;
            seenRooms.add(label);
            const locked = Boolean(card.querySelector(".fa-lock"));
            result.push({
                type: "غرفة", label, cat: "الغرف والحائط",
                hint: locked ? "دخول للغرفة (برمز سري 🔒)" : "دخول مباشر للغرفة",
                icon: locked ? "fas fa-lock" : "fas fa-door-open",
                color: locked ? "#f59e0b" : "#10b981",
                keys: `روم غرفة غرف ${label}`
            });
        });

        return result;
    }

    const CATS = ["الكل", "الضبط", "الإضافات", "الألعاب", "الغرف والحائط"];
    const TOKEN_RE = /«(إعداد|إضافة|لعبة|غرفة):\s*([^»]{1,90})»/g;
    const TRIGGER_RE = /(?:^|[\s\n])\/([^\n\/«»]{0,28})$/;

    // ==================== التنسيقات ====================
    if (!document.getElementById("lsc-styles")) {
        const st = document.createElement("style");
        st.id = "lsc-styles";
        st.textContent = `
        #lsc-menu{
            position:fixed;z-index:2147483640;direction:rtl;
            width:min(365px,calc(100vw - 16px));
            background:linear-gradient(180deg,#171a2d 0%,#0d0f1b 100%);
            border:1px solid rgba(212,175,55,.45);
            border-radius:16px;
            box-shadow:0 16px 40px rgba(0,0,0,.78);
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
        .lsc-mlist{max-height:245px;overflow-y:auto;padding:6px;-webkit-overflow-scrolling:touch}
        .lsc-mlist::-webkit-scrollbar{width:5px}
        .lsc-mlist::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:10px}
        .lsc-item{
            width:100%;background:transparent;border:1px solid transparent;border-radius:11px;
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
            background:linear-gradient(135deg,#1a1d30,#111322);
            border:1px solid rgba(212,175,55,.65);
            color:#fef3c7!important;font-size:12px;font-weight:800;line-height:1.35;
            cursor:pointer;font-family:inherit;direction:rtl;
            box-shadow:0 2px 8px rgba(0,0,0,.22);
            max-width:100%;white-space:nowrap;
        }
        .lsc-chip:active{transform:scale(.96)}
        .lsc-chip-ico{font-size:12px;flex-shrink:0}
        .lsc-chip-go{
            font-size:9.5px;color:#111;background:#D4AF37;
            padding:1px 6px;border-radius:10px;font-weight:900;margin-right:2px;
        }
        .quoted-text .lsc-chip{padding:2px 7px;font-size:11px}
        .quoted-text .lsc-chip-go{display:none}

        .lsc-pulse{
            animation:lscPulseGlow 1.1s ease-in-out 2!important;
            outline:2px solid #D4AF37!important;outline-offset:2px;border-radius:12px;
        }
        @keyframes lscPulseGlow{
            0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.2)}
            50%{box-shadow:0 0 0 7px rgba(212,175,55,.55)}
        }

        #lsc-toast{
            position:fixed;bottom:78px;left:50%;transform:translateX(-50%) translateY(14px);
            background:#121526;border:1px solid rgba(212,175,55,.7);color:#fde68a;
            padding:7px 16px;border-radius:24px;font-size:12px;font-weight:800;
            box-shadow:0 10px 26px rgba(0,0,0,.6);z-index:2147483647;
            opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease;direction:rtl;
        }
        #lsc-toast.lsc-lock{background:#2d1118;border-color:#ef4444;color:#fecaca}
        #lsc-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        `;
        (document.head || document.documentElement).appendChild(st);
    }

    // ==================== تحويل النصوص داخل الرسائل الجديدة فقط ====================
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
            return { icon: cached?.icon || "fas fa-gamepad", color: cached?.color || "#06b6d4", actionText: "لعب", valid: !0 };
        }
        if ("غرفة" === type) return { icon: "fas fa-door-open", color: "#10b981", actionText: "دخول", valid: !0 };
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
        if (!el || "1" === el.dataset.lscDone) return;
        el.dataset.lscDone = "1";
        const txt = el.textContent || "";
        if (!txt.includes("«") || !txt.includes(":")) return;

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.parentElement?.closest(".lsc-chip")) continue;
            if (node.nodeValue && node.nodeValue.includes("«") && node.nodeValue.includes(":")) textNodes.push(node);
        }

        textNodes.forEach(tn => {
            const val = tn.nodeValue;
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
        });
    }

    function scanContainer(root) {
        if (!root) return;
        if (root.matches?.(".message-text, .quoted-text")) transformMessageEl(root);
        else root.querySelectorAll(".message-text:not([data-lsc-done]), .quoted-text:not([data-lsc-done])").forEach(transformMessageEl);
    }

    function executeChip(type, label) {
        try {
            if ("إعداد" === type) {
                const item = CORE_BY_LABEL.get(label);
                if (item) item.run();
                else denyAccess();
            } else if ("إضافة" === type) runDynamicAddon(label);
            else if ("لعبة" === type) runDynamicGame(label);
            else if ("غرفة" === type) runDynamicRoom(label);
        } catch (err) {
            showToast("⚠️ تعذر فتح الاختصار حالياً", !0);
        }
    }

    ["pointerdown", "mousedown"].forEach(evName => {
        document.addEventListener(evName, e => {
            if (e.target.closest?.(".lsc-chip")) e.stopPropagation();
        }, !0);
    });

    document.addEventListener("click", e => {
        const chip = e.target.closest?.(".lsc-chip");
        if (!chip) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const type = chip.dataset.lscType, label = chip.dataset.lscLabel;
        setTimeout(() => executeChip(type, label), 15);
    }, !0);

    // ==================== قائمة الاقتراحات بعلامة / ====================
    const menuState = {
        open: !1, cat: "الكل", query: "",
        slashIdx: -1, caretEnd: -1,
        allItems: [], items: [], selIdx: 0,
        inputEl: null, menuEl: null
    };

    function ensureMenu() {
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
                renderMenuList();
            };
        });
        return m;
    }

    function positionMenu() {
        const m = menuState.menuEl, inp = menuState.inputEl;
        if (!m || !inp || !menuState.open) return;
        const bar = inp.closest(".chat-input-container") || inp;
        const rect = bar.getBoundingClientRect();
        const bottomGap = Math.max(8, window.innerHeight - rect.top + 8);
        const rightGap = Math.max(8, window.innerWidth - rect.right + 4);
        m.style.bottom = `${bottomGap}px`;
        m.style.right = `${Math.min(rightGap, Math.max(8, window.innerWidth - m.offsetWidth - 8))}px`;
        m.style.left = "auto";
    }

    function getFilteredItems() {
        const q = menuState.query.trim().toLowerCase();
        return menuState.allItems.filter(it => {
            if (!q && "الكل" !== menuState.cat && it.cat !== menuState.cat) return !1;
            if (!q) return !0;
            return `${it.label} ${it.cat} ${it.hint} ${it.keys || ""}`.toLowerCase().includes(q);
        });
    }

    function insertSelected(item) {
        const inp = menuState.inputEl;
        if (!inp || !item) return;
        const val = inp.value;
        const start = menuState.slashIdx;
        const end = menuState.caretEnd;
        const token = `«${item.type}: ${item.label}» `;
        if (start >= 0 && end >= start) {
            inp.value = val.slice(0, start) + token + val.slice(end);
            const pos = start + token.length;
            inp.focus();
            try { inp.setSelectionRange(pos, pos); } catch (e) {}
        } else {
            inp.value = (val ? val + " " : "") + token;
            inp.focus();
        }
        inp.dispatchEvent(new Event("input", { bubbles: !0 }));
        closeMenu();
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
            if (await ensureRoomsLoaded()) cnt = document.querySelectorAll("#sidebar-rooms-container .room-card").length;
        }

        if (!wasOpen) closeSidebarSilently();
        else if (prevTab) openSidebarTab(prevTab);

        menuState.allItems = getLiveItems();
        renderMenuList();
        showToast(cnt > 0 ? `✅ تم التحديث (${cnt})` : "⚠️ تعذر الجلب حالياً", cnt <= 0);
    }

    function renderMenuList() {
        const m = ensureMenu();
        const listEl = m.querySelector("#lsc-mlist");
        const items = getFilteredItems();
        menuState.items = items;
        if (menuState.selIdx >= items.length) menuState.selIdx = 0;

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

        if (!items.length) {
            listEl.innerHTML = syncHtml + '<div class="lsc-empty">لا يوجد اختصار مطابق — جرّب كلمة أخرى</div>';
        } else {
            listEl.innerHTML = syncHtml + items.map((it, i) => `
                <button type="button" class="lsc-item ${i === menuState.selIdx ? "sel" : ""}" data-idx="${i}">
                    <div class="lsc-iico" style="color:${esc(it.color)};"><i class="${esc(it.icon)}"></i></div>
                    <div class="lsc-itxt">
                        <div class="lsc-ilbl">${esc(it.label)}</div>
                        <div class="lsc-ihint">${esc(it.hint)}</div>
                    </div>
                </button>`).join("");
        }

        const syncBtn = listEl.querySelector("[data-sync]");
        if (syncBtn) syncBtn.onclick = () => runSilentSync(syncBtn.dataset.sync, syncBtn);

        listEl.querySelectorAll(".lsc-item").forEach(b => {
            b.onclick = () => insertSelected(menuState.items[Number(b.dataset.idx)]);
        });

        const activeRow = listEl.querySelector(".lsc-item.sel");
        if (activeRow) activeRow.scrollIntoView({ block: "nearest" });
        positionMenu();
    }

    function openMenu() {
        const m = ensureMenu();
        menuState.allItems = getLiveItems();
        menuState.open = !0;
        m.classList.add("open");
        renderMenuList();
    }

    function closeMenu() {
        if (!menuState.open) return;
        menuState.open = !1;
        menuState.menuEl?.classList.remove("open");
    }

    function inspectInput(inp) {
        menuState.inputEl = inp;
        const caret = inp.selectionStart ?? inp.value.length;
        const beforeCaret = inp.value.slice(0, caret);
        const m = beforeCaret.match(TRIGGER_RE);
        if (!m) { closeMenu(); return; }
        const q = m[1] || "";
        if (/^\s/.test(q)) { closeMenu(); return; }
        menuState.slashIdx = beforeCaret.lastIndexOf("/");
        menuState.caretEnd = caret;
        menuState.query = q;
        menuState.selIdx = 0;
        if (menuState.open) renderMenuList();
        else openMenu();
    }

    // ==================== المراقبات الخفيفة المعزولة (صفر عمل أثناء الدردشة) ====================
    function attachChatInput(inp) {
        if (!inp || "1" === inp.dataset.lscBound) return;
        inp.dataset.lscBound = "1";
        inp.addEventListener("input", () => inspectInput(inp));
        inp.addEventListener("click", () => { if (inp.value.includes("/")) inspectInput(inp); });
        inp.addEventListener("keydown", e => {
            if (!menuState.open) return;
            if ("Escape" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation(); closeMenu();
            } else if ("ArrowDown" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation();
                if (menuState.items.length) {
                    menuState.selIdx = (menuState.selIdx + 1) % menuState.items.length;
                    renderMenuList();
                }
            } else if ("ArrowUp" === e.key) {
                e.preventDefault(); e.stopImmediatePropagation();
                if (menuState.items.length) {
                    menuState.selIdx = (menuState.selIdx - 1 + menuState.items.length) % menuState.items.length;
                    renderMenuList();
                }
            } else if ("Enter" === e.key || "Tab" === e.key) {
                if (menuState.items.length) {
                    e.preventDefault(); e.stopImmediatePropagation();
                    insertSelected(menuState.items[menuState.selIdx]);
                }
            }
        }, !0);
    }

    function observeMessages(container) {
        if (!container || "1" === container.dataset.lscObs) return;
        container.dataset.lscObs = "1";
        scanContainer(container);
        const mo = new MutationObserver(muts => {
            for (const m of muts) {
                for (const n of m.addedNodes) {
                    if (1 === n.nodeType) scanContainer(n);
                }
            }
        });
        mo.observe(container, { childList: !0 });
    }

    // مراقب خفيف ومعزول على حاوية الضبط/الإضافات فقط (لا يشتغل إلا لحظة فتح الضبط أو الإضافات)
    function attachSettingsObserver() {
        const cont = document.getElementById("sidebar-settings-container");
        if (!cont || "1" === cont.dataset.lscSetObs) return;
        cont.dataset.lscSetObs = "1";
        let t = null;
        const mo = new MutationObserver(() => {
            if (!cont.querySelector(".modern-classic-addons-container")) return;
            clearTimeout(t);
            t = setTimeout(() => {
                if (scanAddonsInDOM() > 0 && menuState.open) {
                    menuState.allItems = getLiveItems();
                    renderMenuList();
                }
                // مسحة ثانية خفيفة لالتقاط إضافات LaylMenu المتأخرة
                setTimeout(scanAddonsInDOM, 450);
            }, 250);
        });
        mo.observe(cont, { childList: !0 });
    }

    // مراقب خفيف ومعزول على قائمة الألعاب فقط (لا يشتغل إلا لحظة تحميل الألعاب)
    function attachGamesListObserver() {
        const gCont = document.getElementById("sidebar-games-container");
        if (gCont && "1" !== gCont.dataset.lscGmObs) {
            gCont.dataset.lscGmObs = "1";
            let t = null;
            new MutationObserver(() => {
                clearTimeout(t);
                t = setTimeout(() => {
                    attachGamesListObserver();
                    if (scanGamesInDOM() > 0 && menuState.open) {
                        menuState.allItems = getLiveItems();
                        renderMenuList();
                    }
                }, 250);
            }).observe(gCont, { childList: !0 });
        }
        const gList = document.getElementById("games-list");
        if (gList && "1" !== gList.dataset.lscGlObs) {
            gList.dataset.lscGlObs = "1";
            let t2 = null;
            new MutationObserver(() => {
                clearTimeout(t2);
                t2 = setTimeout(() => {
                    if (scanGamesInDOM() > 0 && menuState.open) {
                        menuState.allItems = getLiveItems();
                        renderMenuList();
                    }
                }, 250);
            }).observe(gList, { childList: !0 });
        }
    }

    document.addEventListener("pointerdown", e => {
        if (!menuState.open) return;
        if (e.target.closest("#lsc-menu") || e.target === menuState.inputEl) return;
        closeMenu();
    });

    window.addEventListener("resize", () => { if (menuState.open) positionMenu(); });

    loadCaches();
    let lmTries = 0;
    const lmPoll = setInterval(() => {
        wrapHooks();
        if (absorbLaylMenu() || ++lmTries >= 15) clearInterval(lmPoll);
    }, 500);

    let bootTries = 0;
    function boot() {
        const inp = document.getElementById("chat-input");
        const box = document.getElementById("messages-container");
        if (inp) attachChatInput(inp);
        if (box) observeMessages(box);
        const prv = document.getElementById("private-chat-messages-inner");
        if (prv) observeMessages(prv);
        attachSettingsObserver();
        attachGamesListObserver();
        wrapHooks();
        if ((!inp || !box) && ++bootTries < 40) setTimeout(boot, 800);
    }

    boot();
}();
