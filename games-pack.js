/* =========================================================
   حزمة ألعاب شات ليل الموحّدة (الجزء 1 من 2)
   النواة + تحدي الحروف + القنبلة الموقوتة + لعبة البنك
   ========================================================= */
(function () {
    "use strict";
    if (window.__LAYL_GAMES_PACK_LOADED__) return;
    window.__LAYL_GAMES_PACK_LOADED__ = true;

    const FB_CONFIG = {
        apiKey: "AIzaSyC9fdv0xFDVRfUMgBEoI2WVeVi9U5BF3_8",
        authDomain: "layl-codenames.firebaseapp.com",
        projectId: "layl-codenames",
        storageBucket: "layl-codenames.firebasestorage.app",
        messagingSenderId: "651006164506",
        appId: "1:651006164506:web:1541818c0e5a6077415ba3"
    };

    let _db = null;
    let _fbLoading = false;
    const _fbWaiters = [];
    const GAMES = {};

    function getDb() {
        if (!_db && typeof firebase !== "undefined" && firebase.database) {
            if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
            _db = firebase.database();
        }
        return _db;
    }

    function ensureFirebase(cb) {
        const readyDb = getDb();
        if (readyDb) {
            if (cb) cb(readyDb);
            return;
        }
        if (cb) _fbWaiters.push(cb);
        if (_fbLoading) return;
        _fbLoading = true;

        const finish = () => {
            const db = getDb();
            if (!db) return false;
            _fbLoading = false;
            while (_fbWaiters.length) {
                const fn = _fbWaiters.shift();
                try { fn(db); } catch (_) {}
            }
            return true;
        };

        const loadDbScript = () => {
            if (!document.querySelector('script[src*="firebase-database.js"]')) {
                const s2 = document.createElement("script");
                s2.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
                s2.onload = finish;
                document.head.appendChild(s2);
            }
        };

        if (!document.querySelector('script[src*="firebase-app.js"]')) {
            const s1 = document.createElement("script");
            s1.id = "firebase-core-script";
            s1.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
            s1.onload = loadDbScript;
            document.head.appendChild(s1);
        } else {
            loadDbScript();
        }

        const poll = setInterval(() => {
            if (finish()) clearInterval(poll);
        }, 300);
    }

    function injectStyle(id, css) {
        if (document.getElementById(id)) return;
        const st = document.createElement("style");
        st.id = id;
        st.innerHTML = css;
        document.head.appendChild(st);
    }

    /* =========================================================
       1- لعبة تحدي الحروف (StopBus)
       ========================================================= */
    GAMES.stopbus = function openStopBus() {
        const letters = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
        const cats = ["إنسان", "حيوان", "نبات", "جماد", "بلاد"];
        const norm = (e) => {
            if (!e) return "";
            let t = e.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").trim();
            if (t.startsWith("ال") && t.length > 2) t = t.substring(2);
            return t;
        };
        const startsWithLetter = (word, letter) => norm(word).startsWith(norm(letter));

        if (document.getElementById("stopbus-game-modal")) {
            document.getElementById("stopbus-game-modal").style.setProperty("display", "flex", "important");
            const rb = document.getElementById("stopbus-restore-btn");
            if (rb) rb.style.setProperty("display", "none", "important");
            return;
        }

        injectStyle("stopbus-game-styles", `
            #stopbus-game-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 10px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .sb-box { background: #1e293b; border: 2px solid #b76e79; border-radius: 15px; padding: 15px 18px 20px; width: 100%; max-width: 480px; max-height: 92vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .sb-box::-webkit-scrollbar { width: 5px; } .sb-box::-webkit-scrollbar-thumb { background: #b76e79; border-radius: 10px; }
            .sb-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #334155; box-sizing: border-box; flex-shrink: 0; }
            .sb-top-brand { color: #b76e79; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .sb-controls { display: flex; gap: 8px; align-items: center; }
            .sb-icon-btn { color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .sb-icon-btn:hover { color: #b76e79; border-color: #b76e79; }
            .sb-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .sb-title { color: #b76e79; margin: 5px 0 15px; font-size: 21px; }
            .sb-input { width: 100%; padding: 11px; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: white; text-align: center; box-sizing: border-box; font-size: 14px; }
            .sb-input:focus { outline: none; border-color: #b76e79; } .sb-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .sb-input-ans { width: 100%; padding: 9px; margin-bottom: 8px; border: 1px solid #334155; border-radius: 6px; background: #0f172a; color: #fff; font-size: 14px; text-align: right; box-sizing: border-box; }
            .sb-input-ans:focus { outline: none; border-color: #b76e79; }
            .sb-btn { background: #b76e79; color: white; border: none; padding: 11px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; box-sizing: border-box; font-size: 14px; }
            .sb-btn:hover:not([disabled]) { background: #9a5b65; box-shadow: 0 0 10px rgba(183, 110, 121, 0.4); }
            .sb-btn-danger { background: #ef4444 !important; border-color: #ef4444 !important; }
            .sb-btn-danger:hover:not([disabled]) { background: #dc2626 !important; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4) !important; }
            .sb-btn-outline { background: transparent; color: #b76e79; border: 1px solid #b76e79; }
            .sb-btn-stop { background: #ef4444; color: white; border: none; padding: 12px; font-size: 16px; margin-top: 10px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); animation: sb-pulse 1.5s infinite; }
            @keyframes sb-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
            .sb-hidden { display: none !important; }
            .sb-player-chip { background: rgba(183, 110, 121, 0.15); border: 1px solid #b76e79; color: #f1d8dc; padding: 5px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; margin: 3px; display: inline-block; }
            .sb-letter-box { font-size: 40px; font-weight: 900; color: #b76e79; background: #0f172a; border: 2px dashed #b76e79; border-radius: 12px; padding: 10px 25px; display: inline-block; }
            .sb-timer-box { font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; font-family: monospace; }
            .sb-result-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            .sb-result-table th { background: #b76e79; color: white; padding: 8px; border: 1px solid #9a5b65; }
            .sb-result-table td { padding: 8px; border: 1px solid #334155; color: #cbd5e1; }
            .sb-review-cell { cursor: pointer; transition: 0.2s; user-select: none; }
            .sb-review-cell:hover { background: rgba(239, 68, 68, 0.15); }
            .sb-vetoed { text-decoration: line-through; color: #ef4444 !important; background: rgba(239, 68, 68, 0.1) !important; opacity: 0.7; }
            .sb-score-0 { color: #ef4444; text-decoration: line-through; }
            .sb-score-5 { color: #f59e0b; font-weight: bold; }
            .sb-score-10 { color: #10b981; font-weight: bold; }
            .sb-ready-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; padding: 10px 15px; border-radius: 8px; }
            .sb-kick-btn { color: #ef4444; cursor: pointer; padding: 5px; border-radius: 4px; transition: 0.2s; font-size:16px; }
            .sb-kick-btn:hover { background: rgba(239,68,68,0.2); }
        `);

        let playerName = localStorage.getItem("stopbus_playerName") || localStorage.getItem("codenames_playerName") || "";
        let roomCode = "";
        let state = "setup";
        let timerId = null;

        function cleanup() {
            const db = getDb();
            if (roomCode && db) db.ref("stopbus_rooms/" + roomCode).off();
            clearInterval(timerId);
            const m = document.getElementById("stopbus-game-modal");
            if (m) m.remove();
            const r = document.getElementById("stopbus-restore-btn");
            if (r) r.remove();
            roomCode = "";
            state = "setup";
        }

        window.sb_tentativeData = {};
        window.sb_vetoes = {};

        window.sb_minimize = function () {
            if (["playing", "reviewing", "ready_check"].includes(state)) return;
            document.getElementById("stopbus-game-modal").style.setProperty("display", "none", "important");
            let rb = document.getElementById("stopbus-restore-btn");
            if (rb) {
                rb.style.setProperty("display", "flex", "important");
            } else {
                rb = document.createElement("div");
                rb.id = "stopbus-restore-btn";
                rb.innerHTML = '<i class="fas fa-pen-fancy"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#b76e79; color:#fff; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:24px; transition:0.3s;";
                rb.onclick = function () {
                    document.getElementById("stopbus-game-modal").style.setProperty("display", "flex", "important");
                    this.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        window.sb_close = function () {
            if (!["playing", "reviewing", "ready_check"].includes(state) || confirm("خروجك سيعطل الجولة أو يطردك من الغرفة. متأكد من الخروج؟")) {
                const db = getDb();
                if (roomCode && db) db.ref(`stopbus_rooms/${roomCode}/players/${playerName}`).remove();
                cleanup();
            }
        };

        window.sb_kickPlayer = function (p) {
            if (confirm(`هل أنت متأكد من طرد اللاعب (${p})؟`)) {
                const db = getDb();
                if (db) {
                    db.ref(`stopbus_rooms/${roomCode}/players/${p}`).remove();
                    db.ref(`stopbus_rooms/${roomCode}/readies/${p}`).remove();
                }
            }
        };

        const topBar = `
            <div class="sb-top-bar">
                <div class="sb-top-brand"><i class="fas fa-pen-fancy"></i> تحدي الحروف</div>
                <div class="sb-controls">
                    <div class="sb-icon-btn" onclick="sb_toggleRules()" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="sb-icon-btn sb-min-btn" onclick="sb_minimize()" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="sb-icon-btn sb-close-btn" onclick="sb_close()" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "stopbus-game-modal";
        modal.innerHTML = `
            <div id="sb-name-screen" class="sb-box">
                ${topBar}
                <h2 class="sb-title">تحدي الحروف</h2>
                <p style="color:#94a3b8; font-size:13px; margin-bottom:15px;">إنسان، حيوان، نبات، جماد، بلاد</p>
                <input type="text" id="sb-player-name" class="sb-input" placeholder="اكتب اسمك في اللعبة">
                <button id="sb-save-name" class="sb-btn">متابعة</button>
            </div>
            <div id="sb-lobby-screen" class="sb-box sb-hidden">
                ${topBar}
                <h2 class="sb-title">ردهة الانتظار</h2>
                <p id="sb-welcome-msg" style="font-size: 14px; color: #94a3b8; margin-bottom: 18px;"></p>
                <button id="sb-create-room" class="sb-btn">إنشاء غرفة جديدة</button>
                <hr style="border:0; border-top: 1px solid #334155; margin: 15px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/\\D/g, '')" id="sb-room-code" class="sb-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="sb-join-room" class="sb-btn sb-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="sb-room-screen" class="sb-box sb-hidden">
                ${topBar}
                <h2 class="sb-title" style="font-size:18px; display:flex; justify-content:center; align-items:center; gap:8px;">
                    غرفة رقم: <span id="sb-display-code" style="color:white; letter-spacing:2px;"></span>
                    <i class="fas fa-copy" id="sb-copy-code" style="font-size:16px; color:#b76e79; cursor:pointer;" title="نسخ الكود"></i>
                </h2>
                <p style="color:#94a3b8; font-size:12px; margin-bottom:5px;">اللاعبون المتواجدون (والنقاط):</p>
                <div id="sb-players-container" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:15px;"></div>
                <button id="sb-start-game" class="sb-btn sb-hidden">بدء الجولة 🚀</button>
                <p id="sb-wait-msg" style="color:#94a3b8; font-size:13px;">بانتظار المضيف لبدء اللعبة...</p>
            </div>
            <div id="sb-ready-screen" class="sb-box sb-hidden">
                ${topBar}
                <h2 class="sb-title">غرفة الاستعداد</h2>
                <p style="color:#94a3b8; font-size:13px; margin-bottom:15px;">النقاط التراكمية محفوظة. هل أنت مستعد للجولة القادمة؟</p>
                <div id="sb-ready-players-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px; max-height:200px; overflow-y:auto; padding-right:5px;"></div>
                <div id="sb-player-ready-controls" style="display:flex; gap:10px;">
                    <button id="sb-ready-btn" class="sb-btn" style="flex:1;">إستعداد 🟢</button>
                    <button id="sb-withdraw-btn" class="sb-btn sb-btn-danger" style="flex:1;">إنسحاب 🚪</button>
                </div>
                <button id="sb-start-next-round-btn" class="sb-btn sb-hidden" style="margin-top:10px;" disabled>بدء الجولة 🚀</button>
            </div>
            <div id="sb-game-screen" class="sb-box sb-hidden">
                ${topBar}
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding: 0 10px;">
                    <div id="sb-timer-box" class="sb-timer-box">60</div>
                    <div id="sb-letter-box" class="sb-letter-box">أ</div>
                </div>
                <input type="text" id="sb-inp-0" class="sb-input-ans" placeholder="اسم إنسان...">
                <input type="text" id="sb-inp-1" class="sb-input-ans" placeholder="حيوان...">
                <input type="text" id="sb-inp-2" class="sb-input-ans" placeholder="نبات...">
                <input type="text" id="sb-inp-3" class="sb-input-ans" placeholder="جماد...">
                <input type="text" id="sb-inp-4" class="sb-input-ans" placeholder="بلاد...">
                <button id="sb-stop-btn" class="sb-btn sb-btn-stop">ستووووب! 🛑</button>
            </div>
            <div id="sb-review-screen" class="sb-box sb-hidden">
                ${topBar}
                <div id="sb-host-review" class="sb-hidden">
                    <h2 class="sb-title" style="color:#f59e0b;">مرحلة التدقيق والشطب 🧐</h2>
                    <p style="font-size:12px; color:#cbd5e1; margin-bottom:10px;">(للمضيف فقط): اضغط على أي إجابة خاطئة (تأليف) لشطبها وحرمان صاحبها من النقاط!</p>
                    <div style="overflow-x: auto; margin-bottom: 15px; direction: rtl;">
                        <table class="sb-result-table" id="sb-review-table"></table>
                    </div>
                    <button id="sb-publish-btn" class="sb-btn">اعتماد النتائج النهائية ✅</button>
                </div>
                <div id="sb-player-wait-review" class="sb-hidden">
                    <h2 class="sb-title" style="color:#f59e0b;">توقف اللعب! 🛑</h2>
                    <p style="font-size:14px; color:#cbd5e1; line-height: 1.6; margin-top:20px;">المضيف يقوم الآن بمراجعة إجابات الجميع وشطب الكلمات الخاطئة...</p>
                    <i class="fas fa-search fa-bounce" style="font-size:45px; color:#b76e79; margin: 30px 0;"></i>
                </div>
            </div>
            <div id="sb-results-screen" class="sb-box sb-hidden">
                ${topBar}
                <h2 class="sb-title">النتائج</h2>
                <div style="overflow-x: auto; margin-bottom: 15px; direction: rtl;">
                    <table class="sb-result-table" id="sb-results-table"></table>
                </div>
                <div id="sb-host-results-controls" class="sb-hidden" style="display:flex; gap:8px; margin-top:10px;">
                    <button id="sb-continue-game-btn" class="sb-btn" style="flex:2; margin-bottom:0;">الاستمرار للتالية ➡️</button>
                    <button id="sb-end-game-btn" class="sb-btn sb-btn-danger" style="flex:1; margin-bottom:0;">إنهاء 🛑</button>
                </div>
                <p id="sb-wait-next-msg" style="color:#94a3b8; font-size:12px;">بانتظار قرار المضيف...</p>
            </div>
            <div id="sb-rules-screen" class="sb-box sb-hidden" style="z-index:999999;">
                <div class="sb-top-bar">
                    <div class="sb-top-brand"><i class="fas fa-book-open"></i> قوانين اللعبة</div>
                    <div class="sb-controls"><div class="sb-icon-btn sb-close-btn" onclick="sb_toggleRules()"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align:right; font-size:13px; line-height:1.65; color:#cbd5e1; padding-right:5px;">
                    <p style="color:#b76e79; font-weight:bold; margin:0 0 4px;">🎮 فكرة اللعبة:</p>
                    <p style="margin:0 0 10px;">يعطيك النظام حرف عشوائي، لازم تعبي 5 خانات (إنسان، حيوان، نبات، جماد، بلاد) بكلمات تبدأ بنفس الحرف.</p>
                    <p style="color:#b76e79; font-weight:bold; margin:0 0 4px;">🛑 ستوب (Stop):</p>
                    <p style="margin:0 0 10px;">أول شخص يعبي كل الخانات يقدر يضغط زر (ستوب) وينهي الوقت على الجميع فوراً!</p>
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">🧐 التدقيق البشري:</p>
                    <p style="margin:0 0 10px;">الكلمات الخاطئة أو التي تم تأليفها سيشطبها (المضيف) قبل إعلان النتائج.</p>
                    <p style="color:#f59e0b; font-weight:bold; margin:0 0 4px;">💯 النقاط:</p>
                    <p style="margin:0;">- الكلمة الصح الفريدة: 10 نقاط.<br>- الكلمة الصح المكررة: 5 نقاط.<br>- الكلمة المشطوبة أو الفارغة: 0 نقاط.</p>
                </div>
                <button class="sb-btn" style="margin-top:15px;" onclick="sb_toggleRules()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("sb-name-screen"),
            lobby: document.getElementById("sb-lobby-screen"),
            room: document.getElementById("sb-room-screen"),
            game: document.getElementById("sb-game-screen"),
            ready: document.getElementById("sb-ready-screen"),
            review: document.getElementById("sb-review-screen"),
            results: document.getElementById("sb-results-screen"),
            rules: document.getElementById("sb-rules-screen")
        };
        let prevScreen = null;

        function showScreen(key, nameVal = "") {
            for (const k in screens) if (k !== "rules") screens[k].classList.add("sb-hidden");
            screens[key].classList.remove("sb-hidden");
            if (key === "lobby") {
                document.getElementById("sb-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#b76e79; font-weight:bold;">${nameVal}</span> <a href="#" id="sb-edit-name" style="color:#64748b; font-size:12px; margin-right:8px; text-decoration:underline; cursor:pointer;">(تغيير الاسم)</a>`;
                document.getElementById("sb-edit-name").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("stopbus_playerName");
                    document.getElementById("sb-player-name").value = nameVal;
                    showScreen("name");
                });
            }
        }

        function triggerReview() {
            const db = getDb();
            if (db && roomCode) db.ref(`stopbus_rooms/${roomCode}`).update({ status: "reviewing" });
        }

        function listenRoom(code, isHost) {
            const db = getDb();
            state = "room";
            showScreen("room");
            document.getElementById("sb-display-code").innerText = code;
            document.getElementById("sb-copy-code").onclick = () =>
                navigator.clipboard.writeText("📝 انضم للغرفة في لعبة تحدي الحروف!\n🔑 رقم الغرفة: " + code).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));
            if (isHost) {
                document.getElementById("sb-start-game").classList.remove("sb-hidden");
                document.getElementById("sb-wait-msg").classList.add("sb-hidden");
            }

            db.ref(`stopbus_rooms/${code}`).on("value", (snap) => {
                const data = snap.val();
                if (!data) {
                    if (state !== "setup" && state !== "lobby") { alert("تم إغلاق الغرفة."); cleanup(); }
                    return;
                }
                if (data.status === "finished") {
                    alert("🛑 قام المضيف بإنهاء اللعبة للجميع.");
                    cleanup();
                    return;
                }
                if (!data.players || !data.players[playerName]) {
                    if (state !== "setup" && state !== "lobby") { alert("لقد تم استبعادك من اللعبة أو انسحبت."); cleanup(); }
                    return;
                }

                const players = Object.keys(data.players || {});
                const scores = data.scores || {};
                document.getElementById("sb-players-container").innerHTML = players
                    .map((p) => `<div class="sb-player-chip">${p} <span style="color:#fff;">[${scores[p] || 0}]</span></div>`)
                    .join("");

                if (data.status === "ready_check") {
                    if (state !== "ready_check") { state = "ready_check"; showScreen("ready"); }
                    const readies = data.readies || {};
                    let html = "";
                    let allReady = true;
                    players.forEach((p) => {
                        const isR = readies[p];
                        if (!isR) allReady = false;
                        html += `<div class="sb-ready-item">
                            <div><b>${p}</b> <span style="font-size:12px; color:#94a3b8;">(${scores[p] || 0} نقطة)</span></div>
                            <div style="display:flex; align-items:center; gap:10px;">${isR ? "<span style='color:#10b981;'>مستعد ✅</span>" : "<span style='color:#f59e0b;'>بانتظار... ⏳</span>"} ${isHost && p !== playerName ? `<i class="fas fa-user-times sb-kick-btn" title="طرد اللاعب" onclick="sb_kickPlayer('${p}')"></i>` : ""}</div>
                        </div>`;
                    });
                    document.getElementById("sb-ready-players-list").innerHTML = html;
                    const rBtn = document.getElementById("sb-ready-btn");
                    if (readies[playerName]) { rBtn.disabled = true; rBtn.innerText = "أنت مستعد ✅"; }
                    else { rBtn.disabled = false; rBtn.innerText = "إستعداد 🟢"; }

                    if (isHost) {
                        document.getElementById("sb-player-ready-controls").classList.add("sb-hidden");
                        const nxt = document.getElementById("sb-start-next-round-btn");
                        nxt.classList.remove("sb-hidden");
                        if (allReady && players.length > 0) { nxt.disabled = false; nxt.innerText = "بدء الجولة الآن 🚀"; }
                        else { nxt.disabled = true; nxt.innerText = "بانتظار استعداد الجميع..."; }
                    }
                }

                if (data.status === "playing" && state !== "playing") {
                    state = "playing";
                    document.querySelectorAll(".sb-min-btn").forEach((el) => (el.style.display = "none"));
                    showScreen("game");
                    document.getElementById("sb-letter-box").innerText = data.letter;
                    for (let k = 0; k < 5; k++) document.getElementById(`sb-inp-${k}`).value = "";
                    clearInterval(timerId);
                    timerId = setInterval(() => {
                        const left = Math.max(0, Math.floor((data.deadline - Date.now()) / 1000));
                        document.getElementById("sb-timer-box").innerText = left;
                        if (left === 0) triggerReview();
                    }, 1000);
                }

                if (data.status === "reviewing" && state !== "reviewing") {
                    state = "reviewing";
                    clearInterval(timerId);
                    showScreen("review");
                    const myAns = {};
                    cats.forEach((c, idx) => { myAns[c] = document.getElementById(`sb-inp-${idx}`).value.trim(); });
                    db.ref(`stopbus_rooms/${roomCode}/answers/${playerName}`).set(myAns);

                    if (isHost) {
                        document.getElementById("sb-host-review").classList.remove("sb-hidden");
                        document.getElementById("sb-player-wait-review").classList.add("sb-hidden");
                        window.sb_vetoes = {};
                        setTimeout(() => {
                            db.ref(`stopbus_rooms/${roomCode}/answers`).once("value", (aSnap) => {
                                const allAns = aSnap.val() || {};
                                const counts = {};
                                window.sb_tentativeData = {};
                                const targetLetter = norm(data.letter);

                                players.forEach((p) => {
                                    cats.forEach((c) => {
                                        const w = allAns[p]?.[c] || "";
                                        if (w && startsWithLetter(w, data.letter)) {
                                            const nw = norm(w);
                                            counts[c + "_" + nw] = (counts[c + "_" + nw] || 0) + 1;
                                        }
                                    });
                                });

                                players.forEach((p) => {
                                    window.sb_tentativeData[p] = {};
                                    cats.forEach((c) => {
                                        const w = allAns[p]?.[c] || "";
                                        const nw = norm(w);
                                        if (nw && nw.startsWith(targetLetter)) {
                                            const sc = counts[c + "_" + nw] > 1 ? 5 : 10;
                                            window.sb_tentativeData[p][c] = { word: w, score: sc };
                                        } else {
                                            window.sb_tentativeData[p][c] = { word: w || "-", score: 0 };
                                        }
                                    });
                                });

                                let tbl = `<tr><th>اللاعب</th><th>إنسان</th><th>حيوان</th><th>نبات</th><th>جماد</th><th>بلاد</th></tr>`;
                                players.forEach((p) => {
                                    let row = `<td><b>${p}</b></td>`;
                                    cats.forEach((c) => {
                                        const cell = window.sb_tentativeData[p][c];
                                        if (cell.score > 0) {
                                            row += `<td class="sb-review-cell" onclick="sb_toggleVeto('${p}', '${c}', this)" title="اضغط لشطب الكلمة"><span style="color:#10b981; font-weight:bold;">${cell.word} (${cell.score})</span></td>`;
                                        } else {
                                            row += `<td style="color:#ef4444; opacity:0.6; text-decoration:line-through;">${cell.word} (0)</td>`;
                                        }
                                    });
                                    tbl += `<tr>${row}</tr>`;
                                });
                                document.getElementById("sb-review-table").innerHTML = tbl;
                                document.getElementById("sb-publish-btn").onclick = function () {
                                    this.disabled = true;
                                    this.innerText = "جاري الاعتماد...";
                                    const newScores = { ...scores };
                                    players.forEach((p) => {
                                        newScores[p] = newScores[p] || 0;
                                        cats.forEach((c) => {
                                            if (window.sb_vetoes[p] && window.sb_vetoes[p][c]) {
                                                window.sb_tentativeData[p][c].score = 0;
                                            }
                                            newScores[p] += window.sb_tentativeData[p][c].score;
                                        });
                                    });
                                    db.ref(`stopbus_rooms/${roomCode}`).update({
                                        status: "results",
                                        roundResults: window.sb_tentativeData,
                                        scores: newScores
                                    });
                                };
                            });
                        }, 1500);
                    } else {
                        document.getElementById("sb-host-review").classList.add("sb-hidden");
                        document.getElementById("sb-player-wait-review").classList.remove("sb-hidden");
                    }
                }

                if (data.status === "results" && state !== "results") {
                    state = "results";
                    showScreen("results");
                    let tbl = `<tr><th>اللاعب</th><th>إنسان</th><th>حيوان</th><th>نبات</th><th>جماد</th><th>بلاد</th><th style="background:#f59e0b; color:#fff;">الإجمالي</th></tr>`;
                    players.forEach((p) => {
                        const res = data.roundResults?.[p] || {};
                        let gained = 0;
                        let row = `<td><b>${p}</b></td>`;
                        cats.forEach((c) => {
                            const item = res[c];
                            if (item && item.score !== 0) {
                                if (item.score === 5) { row += `<td class="sb-score-5">${item.word} (5)</td>`; gained += 5; }
                                else { row += `<td class="sb-score-10">${item.word} (10)</td>`; gained += 10; }
                            } else {
                                row += `<td class="sb-score-0">${item?.word || "-"} (0)</td>`;
                            }
                        });
                        tbl += `<tr>${row}<td style="font-weight:bold; color:#b76e79;" title="المجموع الكلي">${scores[p] || 0} <span style="font-size:10px; color:#10b981;">(+${gained})</span></td></tr>`;
                    });
                    document.getElementById("sb-results-table").innerHTML = tbl;
                    if (isHost) {
                        document.getElementById("sb-host-results-controls").classList.remove("sb-hidden");
                        document.getElementById("sb-wait-next-msg").classList.add("sb-hidden");
                        const pb = document.getElementById("sb-publish-btn");
                        pb.disabled = false;
                        pb.innerText = "اعتماد النتائج النهائية ✅";
                    } else {
                        document.getElementById("sb-host-results-controls").classList.add("sb-hidden");
                        document.getElementById("sb-wait-next-msg").classList.remove("sb-hidden");
                    }
                }
            });
        }

        window.sb_toggleRules = function () {
            if (screens.rules.classList.contains("sb-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("sb-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("sb-hidden");
                    }
                }
                screens.rules.classList.remove("sb-hidden");
            } else {
                screens.rules.classList.add("sb-hidden");
                if (prevScreen) prevScreen.classList.remove("sb-hidden");
            }
        };

        window.sb_toggleVeto = function (p, c, el) {
            window.sb_vetoes[p] = window.sb_vetoes[p] || {};
            window.sb_vetoes[p][c] = !window.sb_vetoes[p][c];
            el.classList.toggle("sb-vetoed", window.sb_vetoes[p][c]);
        };

        document.getElementById("sb-continue-game-btn").addEventListener("click", () => {
            getDb().ref(`stopbus_rooms/${roomCode}`).update({ status: "ready_check", readies: { [playerName]: true } });
        });
        document.getElementById("sb-end-game-btn").addEventListener("click", () => {
            if (confirm("هل أنت متأكد من إنهاء اللعبة لجميع اللاعبين؟")) getDb().ref(`stopbus_rooms/${roomCode}`).update({ status: "finished" });
        });
        document.getElementById("sb-ready-btn").addEventListener("click", () => {
            getDb().ref(`stopbus_rooms/${roomCode}/readies/${playerName}`).set(true);
        });
        document.getElementById("sb-withdraw-btn").addEventListener("click", () => {
            if (confirm("هل تريد الانسحاب حقاً والخروج للردهة؟")) {
                getDb().ref(`stopbus_rooms/${roomCode}/players/${playerName}`).remove();
                cleanup();
            }
        });
        document.getElementById("sb-stop-btn").addEventListener("click", () => {
            for (let k = 0; k < 5; k++) {
                if (document.getElementById(`sb-inp-${k}`).value.trim() === "") {
                    return alert("لا يمكنك إيقاف الجولة! يجب عليك تعبئة جميع الخانات الخمسة أولاً.");
                }
            }
            triggerReview();
        });

        playerName ? showScreen("lobby", playerName) : showScreen("name");

        document.getElementById("sb-save-name").addEventListener("click", () => {
            const val = document.getElementById("sb-player-name").value.trim();
            if (val.length > 1) {
                playerName = val;
                localStorage.setItem("stopbus_playerName", val);
                showScreen("lobby", val);
            } else alert("يرجى كتابة اسم صحيح");
        });

        document.getElementById("sb-create-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري تحميل السيرفر.. يرجى الانتظار لثانية واحدة والضغط مجدداً.");
            roomCode = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref(`stopbus_rooms/${roomCode}`).set({
                host: playerName, status: "waiting", players: { [playerName]: true }, scores: { [playerName]: 0 }
            }).then(() => listenRoom(roomCode, true));
        });

        document.getElementById("sb-join-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري تحميل السيرفر.. يرجى الانتظار لثانية واحدة والضغط مجدداً.");
            const code = document.getElementById("sb-room-code").value.replace(/\D/g, "");
            if (!code) return alert("أدخل رقم الغرفة.");
            db.ref(`stopbus_rooms/${code}`).once("value", (snap) => {
                if (snap.exists() && snap.val().status !== "finished") {
                    db.ref(`stopbus_rooms/${code}/players/${playerName}`).set(true);
                    db.ref(`stopbus_rooms/${code}/scores/${playerName}`).transaction((v) => v || 0);
                    roomCode = code;
                    listenRoom(code, false);
                } else alert("الغرفة غير موجودة أو منتهية!");
            });
        });

        const startRound = () => {
            const ltr = letters[Math.floor(Math.random() * letters.length)];
            getDb().ref(`stopbus_rooms/${roomCode}`).update({
                status: "playing", letter: ltr, deadline: Date.now() + 62000, answers: null, roundResults: null, readies: null
            });
        };
        document.getElementById("sb-start-game").addEventListener("click", startRound);
        document.getElementById("sb-start-next-round-btn").addEventListener("click", startRound);
    };

    /* =========================================================
       2- لعبة القنبلة الموقوتة (Bomb)
       ========================================================= */
    GAMES.bomb = function openBomb() {
        const categories = ["دول عربية", "عواصم ومدن شهيرة", "ألوان", "حيوانات", "طيور", "فواكه", "خضروات", "أجزاء الجسم", "ملابس", "مهن ووظائف", "أنواع رياضات", "أدوات مطبخ", "أشياء في المدرسة", "ماركات سيارات", "حشرات", "أجهزة إلكترونية", "أسلحة", "برامج تواصل اجتماعي", "مشروبات"];
        const dict = {
            "دول عربية": ["سعوديه","مصر","عمان","قطر","بحرين","كويت","امارات","يمن","سوريا","اردن","لبنان","عراق","فلسطين","مغرب","جزائر","تونس","ليبيا","سودان","موريتانيا","صومال","جيبوتي"],
            "عواصم ومدن شهيرة": ["رياض","قاهره","مسقط","دوحه","منامه","كويت","ابوظبي","صنعاء","دمشق","عمان","بيروت","بغداد","قدس","رباط","جزائر","تونس","طرابلس","خرطوم","نواكشوط","مقديشو","موروني","باريس","لندن","مدريد","روما","برلين","واشنطن","طوكيو","بكين","سيول","موسكو","دبي","جده","مكه","مدينه","اسكندريه","اسطنبول","نيويورك"],
            "ألوان": ["احمر","ازرق","اخضر","اصفر","اسود","ابيض","بنفسجي","برتقالي","وردي","زهري","بني","رمادي","رصاصي","كحلي","سماوي","زيتي","فوشي","قرمزي","ذهبي","فضي","بيج","عنابي"],
            "حيوانات": ["اسد","نمر","فيل","قط","بسه","قطه","قطوه","كلب","ارنب","قرد","غزال","حصان","خيل","مهر","حمار","ذئب","ثعلب","زرافه","دب","فهد","ضبع","تمساح","جمل","بعير","ناقه","خرتيت","وحيد قرن","باندا","كوالا","كانغر","كنغر","فقمه","حوت","دولفين","خنزير","بقره","عجل","ثور","ماعز","تيس","خروف","طلي","غنمه","سنجاب","فار","فأر","جرذ","سلحفاه","ضفدع"],
            "طيور": ["صقر","نسر","بومه","حمام","دجاج","غراب","نعامه","بطريق","بجع","عصفور","بلبل","ببغاء","طاووس","لقلق","سمان","ديك","بط","وز","اوز","نورس","صيصان","صوص"],
            "فواكه": ["تفاح","موز","برتقال","عنب","فراوله","بطيخ","حبحب","رقي","جح","خوخ","مشمش","كرز","مانجو","منجا","رمان","تين","توت","اناناس","كمثرى","يوسفي","افندي","كيوي","افوكادو","ليمون","جوز هند","شمام","بابايا","جوافه","تمر","بلح","رطب"],
            "خضروات": ["طماطم","بندوره","خيار","بصل","ثوم","جزر","بطاطس","بطاطا","باذنجان","كوسا","قرنابيط","زهره","بروكلي","خس","جرجير","بقدونس","كزبره","فجل","سبانخ","فلفل","ملفوف","كرنب","يقطين","قرع","باميه","فاصوليا","بازلاء","ذره","زيتون"],
            "أجزاء الجسم": ["عين","اذن","انف","خشم","فم","شفايف","شفه","لسان","اسنان","ضروس","سن","وجه","رأس","راس","شعر","رقبه","يد","اصبع","ظفر","ذراع","كتف","صدر","بطن","ظهر","رجل","قدم","ركبه","فخذ","كبد","قلب","كليه","معده","رئه","عظم","دم","عصب","عضلات"],
            "ملابس": ["قميص","تيشيرت","بلوزه","بنطلون","سروال","تنوره","فستان","عبايه","شماغ","غتره","عقال","ثوب","دشداشه","كندوره","جاكيت","معطف","كوت","بلوفر","شورت","ملابس داخليه","جورب","شراب","حذاء","جزمه","كعب","صندل","شبشب","نعال","قبعه","طاقيه","كاب","شال","قفاز","بشت","حزام"],
            "مهن ووظائف": ["طبيب","دكتور","مهندس","معلم","استاذ","مدرس","طيار","شرطي","ضابط","عسكري","محامي","قاضي","مبرمج","محاسب","مدير","سكرتير","طباخ","شيف","خباز","نجار","حداد","سباك","كهربائي","فلاح","مزارع","صياد","تاجر","بائع","حلاق","خياط","كاتب","صحفي","مصور","ممثل","مغني","ممرض","صيدلي","رسام"],
            "أنواع رياضات": ["قدم","سله","طائره","تنس","سباحه","جري","ركض","ماراثون","ملاكمه","مصارعه","كاراتيه","جودو","تايكوندو","حديد","كمال اجسام","دراجات","خيل","فروسيه","رمايه","جمباز","تزلج","غوص","بلياردو","بولينج","اسكواش","جولف"],
            "أدوات مطبخ": ["سكين","ملعقه","شوكه","صحن","طبق","قدر","طنجره","مقلاه","كوب","كاس","فنجان","ابريق","غلايه","خلاط","فرن","مايكروويف","ثلاجه","مجمده","فريزر","صينيه","مبشره","قطاعه","مغرفه","مصفاه","مطحنه","لوح","حافظه"],
            "أشياء في المدرسة": ["قلم","مرسم","رصاص","حبر","دفتر","كتاب","سبوره","طاوله","ماصه","كرسي","حقيبه","شنطه","مساحه","ممحاه","برايه","مسطره","مقص","صمغ","غراء","الوان","فرجار","منقله","حاسبه","لوحه","ملف","جرس","ساحه","مقصف"],
            "ماركات سيارات": ["تويوتا","نيسان","هوندا","مازدا","ميتسوبيشي","سوزوكي","سوبارو","لكزس","انفينيتي","كيا","هيونداي","جينيسيس","فورد","شيفروليه","جي ام سي","جمس","كرايسلر","دودج","جيب","تسلا","مرسيدس","بي ام دبليو","اودي","فولكس فاجن","بورش","فيراري","لامبورجيني","استون مارتن","بنتلي","رولز رويس","رينو","بيجو","لاند روفر","رنج روفر","جاكوار","فولفو","كاديلاك"],
            "حشرات": ["نمل","ذباب","بعوض","ناموس","صرصور","عنكبوت","نحل","زنبور","دبور","فراشه","خنفساء","جراد","بق","قمل","برغوث","يعسوب","عقرب","دوده","يرقه"],
            "أجهزة إلكترونية": ["جوال","هاتف","موبايل","ايفون","سامسونج","كمبيوتر","حاسب","لابتوب","ايباد","تابلت","شاشه","تلفزيون","بلايستيشن","اكس بوكس","نينتندو","سماعه","مايك","كاميرا","ساعه","راوتر","مودم","طابعه","بروجكتر"],
            "أسلحة": ["مسدس","رشاش","بندقيه","سيف","خنجر","رمح","سهم","قوس","قنبله","لغم","صاروخ","دبابه","مدفع","طائره","غواصه","درع","فأس"],
            "برامج تواصل اجتماعي": ["واتساب","سناب","سناب شات","انستقرام","انستا","تويتر","اكس","فيسبوك","فيس بوك","تيك توك","يوتيوب","تليجرام","تليغرام","ديسكورد","ريديت","لينكد ان","بنترست","تويتش","سوني"],
            "مشروبات": ["ماء","مويه","شاي","شاهي","قهوه","حليب","عصير","بيبسي","كولا","كوكاكولا","سفن اب","سفن","ميرندا","حمضيات","ديو","ريدبول","كودرد","زنجبيل","نعناع","يانسون","كركديه","كرك","عيران","لبن","موكا","لاتيه","اسبريسو","كابتشينو","فيمتو"]
        };
        const norm = (e) => {
            let t = e.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").trim();
            if (t.startsWith("ال")) t = t.substring(2);
            return t;
        };

        if (document.getElementById("bomb-game-modal")) {
            document.getElementById("bomb-game-modal").style.setProperty("display", "flex", "important");
            const rb = document.getElementById("bomb-restore-btn");
            if (rb) rb.style.setProperty("display", "none", "important");
            return;
        }

        injectStyle("bomb-game-styles", `
            #bomb-game-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 10px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .bm-box { background: #1e293b; border: 2px solid #ef4444; border-radius: 15px; padding: 15px 18px 20px; width: 100%; max-width: 480px; max-height: 92vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .bm-box::-webkit-scrollbar { width: 5px; } .bm-box::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
            .bm-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #334155; box-sizing: border-box; flex-shrink: 0; }
            .bm-top-brand { color: #ef4444; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .bm-controls { display: flex; gap: 8px; align-items: center; }
            .bm-icon-btn { color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .bm-icon-btn:hover { color: #ef4444; border-color: #ef4444; }
            .bm-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .bm-title { color: #ef4444; margin: 5px 0 15px; font-size: 21px; }
            .bm-input { width: 100%; padding: 11px; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: white; text-align: center; box-sizing: border-box; font-size: 14px; }
            .bm-input:focus { outline: none; border-color: #ef4444; } .bm-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .bm-btn { background: #ef4444; color: white; border: none; padding: 11px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; box-sizing: border-box; font-size: 14px; }
            .bm-btn:hover:not([disabled]) { background: #dc2626; box-shadow: 0 0 10px rgba(239,68,68,0.5); }
            .bm-btn-outline { background: transparent; color: #ef4444; border: 1px solid #ef4444; }
            .bm-hidden { display: none !important; }
            .bm-player-chip { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 5px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; }
            .bm-scoreboard-box { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px; margin-bottom: 12px; text-align: right; }
            .bm-score-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed #1e293b; }
            .bm-score-item:last-child { border-bottom: none; }
            @keyframes bomb-pulse { 0% { transform: scale(1); filter: drop-shadow(0 0 5px #ef4444); } 50% { transform: scale(1.15); filter: drop-shadow(0 0 15px #ef4444); color: #fca5a5; } 100% { transform: scale(1); filter: drop-shadow(0 0 5px #ef4444); } }
            .bm-bomb-icon { font-size: 50px; color: #ef4444; margin: 15px 0; animation: bomb-pulse 0.4s infinite; text-shadow: 2px 2px 5px rgba(0,0,0,0.5); }
            .bm-category-box { background: rgba(255, 255, 255, 0.05); border: 1px dashed #94a3b8; padding: 8px; border-radius: 8px; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #f8fafc; }
            .bm-action-log { background: #0f172a; border-radius: 6px; padding: 8px; font-size: 12px; color: #94a3b8; margin-top: 10px; min-height: 20px; }
        `);

        let playerName = localStorage.getItem("bomb_playerName") || localStorage.getItem("codenames_playerName") || "";
        let roomCode = "";
        let state = "setup";
        let timerId = null;
        let exploded = false;
        let lastBombId = null;

        function cleanup() {
            const db = getDb();
            if (roomCode && db) db.ref("bomb_rooms/" + roomCode).off();
            clearInterval(timerId);
            const m = document.getElementById("bomb-game-modal");
            if (m) m.remove();
            const r = document.getElementById("bomb-restore-btn");
            if (r) r.remove();
            roomCode = "";
            state = "setup";
            exploded = false;
        }

        window.bm_minimize = function () {
            document.getElementById("bomb-game-modal").style.setProperty("display", "none", "important");
            let rb = document.getElementById("bomb-restore-btn");
            if (rb) {
                rb.style.setProperty("display", "flex", "important");
            } else {
                rb = document.createElement("div");
                rb.id = "bomb-restore-btn";
                rb.innerHTML = '<i class="fas fa-bomb"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#ef4444; color:#fff; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:24px; transition:0.3s;";
                rb.onclick = function () {
                    document.getElementById("bomb-game-modal").style.setProperty("display", "flex", "important");
                    this.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        window.bm_close = function () {
            const db = getDb();
            if (state === "playing") {
                if (!confirm("خروجك سيعتبر انسحاباً. متأكد من الخروج؟")) return;
                if (roomCode && db) db.ref(`bomb_rooms/${roomCode}/lives/${playerName}`).set(0);
            } else if (state === "waiting" && roomCode && db) {
                db.ref(`bomb_rooms/${roomCode}/players/${playerName}`).remove();
            }
            cleanup();
        };

        const topBar = `
            <div class="bm-top-bar">
                <div class="bm-top-brand"><i class="fas fa-bomb"></i> القنبلة الموقوتة</div>
                <div class="bm-controls">
                    <div class="bm-icon-btn" onclick="bm_toggleRules()" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="bm-icon-btn bm-min-btn" onclick="bm_minimize()" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="bm-icon-btn bm-close-btn" onclick="bm_close()" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "bomb-game-modal";
        modal.innerHTML = `
            <div id="bm-name-screen" class="bm-box">
                ${topBar}
                <h2 class="bm-title">القنبلة الموقوتة</h2>
                <input type="text" id="bm-player-name" class="bm-input" placeholder="اكتب اسمك في اللعبة">
                <button id="bm-save-name" class="bm-btn">متابعة</button>
            </div>
            <div id="bm-lobby-screen" class="bm-box bm-hidden">
                ${topBar}
                <h2 class="bm-title">ردهة الانتظار</h2>
                <p id="bm-welcome-msg" style="font-size: 14px; color: #94a3b8; margin-bottom: 18px;"></p>
                <button id="bm-create-room" class="bm-btn">إنشاء غرفة جديدة</button>
                <hr style="border:0; border-top: 1px solid #334155; margin: 15px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/\\D/g, '')" id="bm-room-code" class="bm-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="bm-join-room" class="bm-btn bm-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="bm-room-screen" class="bm-box bm-hidden">
                ${topBar}
                <h2 class="bm-title" style="font-size:18px; display:flex; justify-content:center; align-items:center; gap:8px;">
                    غرفة رقم: <span id="bm-display-code" style="color:white; letter-spacing:2px;"></span>
                    <i class="fas fa-copy" id="bm-copy-code" style="font-size:16px; color:#ef4444; cursor:pointer;" title="نسخ الكود"></i>
                </h2>
                <div id="bm-players-container" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:15px; margin-top:10px;"></div>
                <button id="bm-start-game" class="bm-btn bm-hidden">بدء اللعبة</button>
                <p id="bm-wait-msg" style="color:#94a3b8; font-size:13px;">بانتظار المضيف لبدء اللعبة (لاعبين كحد أدنى)...</p>
            </div>
            <div id="bm-game-screen" class="bm-box bm-hidden">
                ${topBar}
                <div class="bm-scoreboard-box">
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:6px; font-weight:bold;">❤️ قلوب اللاعبين (3 حياة لكل شخص):</div>
                    <div id="bm-scoreboard-list"></div>
                </div>
                <div id="bm-turn-banner" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 10px; border-radius: 8px; margin-bottom: 5px; font-weight: bold; font-size: 14px; color: #fca5a5;"></div>
                <div class="bm-bomb-icon"><i class="fas fa-bomb"></i></div>
                <div class="bm-category-box">📁 التصنيف المطلوب: <br><span id="bm-category-text" style="color:#ef4444; font-size:20px;"></span></div>
                <div id="bm-action-area" style="display:flex; gap:8px; margin-bottom:10px;">
                    <input type="text" id="bm-word-input" class="bm-input" style="margin-bottom:0; flex:2;" placeholder="اكتب كلمة مناسبة للتصنيف...">
                    <button id="bm-pass-btn" class="bm-btn" style="margin-bottom:0; flex:1;">ارمي القنبلة!</button>
                </div>
                <div id="bm-action-log" class="bm-action-log">بانتظار بدء الجولة...</div>
            </div>
            <div id="bm-rules-screen" class="bm-box bm-hidden" style="z-index:999999;">
                <div class="bm-top-bar">
                    <div class="bm-top-brand"><i class="fas fa-book-open"></i> شرح القوانين</div>
                    <div class="bm-controls"><div class="bm-icon-btn bm-close-btn" onclick="bm_toggleRules()"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align:right; font-size:13px; line-height:1.65; color:#cbd5e1; padding-right:5px;">
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">💣 فكرة اللعبة:</p>
                    <p style="margin:0 0 10px;">النجاة من الانفجار! القنبلة تمر بين اللاعبين ووقتها مخفي ومجهول (ينفجر فجأة في أي لحظة).</p>
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">✍️ طريقة اللعب:</p>
                    <p style="margin:0 0 10px;">عندما تصلك القنبلة، سيظهر لك "تصنيف" (مثلاً: فواكه). يجب أن تكتب كلمة صحيحة وتضغط "ارمي القنبلة" لتمريرها للاعب الذي يليك قبل أن تنفجر!</p>
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">💔 الخسارة:</p>
                    <p style="margin:0;">من تنفجر بيده القنبلة يخسر قلباً. من يفقد قلوبه الثلاثة يخرج من اللعبة، ويفوز آخر شخص يصمد للنهاية!</p>
                </div>
                <button class="bm-btn" style="margin-top:15px;" onclick="bm_toggleRules()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("bm-name-screen"),
            lobby: document.getElementById("bm-lobby-screen"),
            room: document.getElementById("bm-room-screen"),
            game: document.getElementById("bm-game-screen"),
            rules: document.getElementById("bm-rules-screen")
        };
        let prevScreen = null;

        function showScreen(key, nameVal = "") {
            for (const k in screens) if (k !== "rules") screens[k].classList.add("bm-hidden");
            screens[key].classList.remove("bm-hidden");
            if (key === "lobby") {
                document.getElementById("bm-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#ef4444; font-weight:bold;">${nameVal}</span> <a href="#" id="bm-edit-name" style="color:#64748b; font-size:12px; margin-right:8px; text-decoration:underline; cursor:pointer;">(تغيير الاسم)</a>`;
                document.getElementById("bm-edit-name").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("bomb_playerName");
                    document.getElementById("bm-player-name").value = nameVal;
                    showScreen("name");
                });
            }
        }

        function listenRoom(code, isHost) {
            const db = getDb();
            state = "waiting";
            showScreen("room");
            document.getElementById("bm-display-code").innerText = code;
            document.getElementById("bm-copy-code").onclick = () =>
                navigator.clipboard.writeText("💣 انضم للغرفة في لعبة القنبلة الموقوتة!\n🔑 رقم الغرفة: " + code).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));
            document.getElementById("bm-start-game").classList.toggle("bm-hidden", !isHost);
            document.getElementById("bm-wait-msg").classList.toggle("bm-hidden", isHost);

            db.ref(`bomb_rooms/${code}`).on("value", (snap) => {
                const data = snap.val();
                if (!data) return;
                const players = Object.keys(data.players || {});
                document.getElementById("bm-players-container").innerHTML = players.map((p) => `<div class="bm-player-chip">${p}</div>`).join("");

                if (data.status === "finished") {
                    clearInterval(timerId);
                    alert(`🏆 انتهت اللعبة!\nالناجي الأخير والفائز هو: ${data.winner} 🏅`);
                    cleanup();
                    return;
                }

                if (data.status === "playing") {
                    if (state !== "playing") {
                        state = "playing";
                        document.querySelectorAll(".bm-min-btn").forEach((el) => (el.style.display = "none"));
                        showScreen("game");
                    }
                    const lives = data.lives || {};
                    const active = data.activePlayers || [];
                    let sbHtml = "";
                    for (const [p, lv] of Object.entries(lives)) {
                        sbHtml += `<div class="bm-score-item"><span style="${lv <= 0 ? "text-decoration: line-through; color: #475569;" : ""}">👤 ${p}</span> <span>${"❤️".repeat(Math.max(0, lv)) + "🖤".repeat(Math.max(0, 3 - lv))}</span></div>`;
                    }
                    document.getElementById("bm-scoreboard-list").innerHTML = sbHtml;
                    document.getElementById("bm-category-text").innerText = data.category;
                    document.getElementById("bm-action-log").innerText = data.lastAction || "بانتظار بدء الجولة...";

                    const turn = data.turn;
                    const banner = document.getElementById("bm-turn-banner");
                    const inp = document.getElementById("bm-word-input");
                    const btn = document.getElementById("bm-pass-btn");

                    if (turn === playerName && active.includes(playerName)) {
                        banner.innerHTML = "⭐ دورك! القنبلة بيدك، اكتب وارمها بسرعة!";
                        inp.disabled = false; btn.disabled = false;
                        if (document.activeElement !== inp) inp.focus();
                    } else if (active.includes(playerName)) {
                        banner.innerHTML = `⏳ القنبلة بيد (${turn})... استعد!`;
                        inp.disabled = true; btn.disabled = true;
                    } else {
                        banner.innerHTML = "💀 لقد خسرت! شاهد بقية اللاعبين وهم يتفجرون.";
                        inp.disabled = true; btn.disabled = true;
                    }

                    if (lastBombId !== data.bombId) { exploded = false; lastBombId = data.bombId; }
                    clearInterval(timerId);
                    timerId = setInterval(() => {
                        if (playerName === data.host && Date.now() >= data.deadline && !exploded) {
                            exploded = true;
                            const victim = data.turn;
                            const newLv = lives[victim] - 1;
                            const nextLives = { ...lives, [victim]: newLv };
                            let nextActive = active;
                            let msg = `💥 بوووم! انتهى الوقت وانفجرت القنبلة بيد ${victim} وخسر قلب!`;
                            if (newLv <= 0) {
                                nextActive = nextActive.filter((p) => p !== victim);
                                msg = `💥 انفجرت القنبلة! تم إقصاء ${victim} نهائياً 💀`;
                            }
                            if (nextActive.length <= 1) {
                                db.ref(`bomb_rooms/${roomCode}`).update({ status: "finished", winner: nextActive[0] || "لا أحد", lastAction: msg });
                            } else {
                                const idx = data.turnIndex % nextActive.length;
                                db.ref(`bomb_rooms/${roomCode}`).update({
                                    lives: nextLives, activePlayers: nextActive, turnIndex: idx, turn: nextActive[idx],
                                    deadline: Date.now() + Math.floor(15000 * Math.random()) + 15000,
                                    category: categories[Math.floor(Math.random() * categories.length)],
                                    lastAction: msg, bombId: Date.now()
                                });
                            }
                        }
                    }, 300);
                }
            });
        }

        window.bm_toggleRules = function () {
            if (screens.rules.classList.contains("bm-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("bm-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("bm-hidden");
                    }
                }
                screens.rules.classList.remove("bm-hidden");
            } else {
                screens.rules.classList.add("bm-hidden");
                if (prevScreen) prevScreen.classList.remove("bm-hidden");
            }
        };

        document.getElementById("bm-pass-btn").addEventListener("click", () => {
            const word = document.getElementById("bm-word-input").value.trim();
            if (!word) return alert("اكتب كلمة أولاً قبل أن ترمي القنبلة!");
            const db = getDb();
            db.ref(`bomb_rooms/${roomCode}`).once("value", (snap) => {
                const data = snap.val();
                if (!data || data.turn !== playerName) return;
                const list = dict[data.category];
                if (list) {
                    const nw = norm(word);
                    if (!list.some((item) => norm(item) === nw)) {
                        document.getElementById("bm-word-input").value = "";
                        const newLv = data.lives[playerName] - 1;
                        const nextLives = { ...data.lives, [playerName]: newLv };
                        let nextActive = data.activePlayers;
                        let msg = `❌ إجابة خاطئة! (${word}) غير صحيحة! 💥 انفجرت القنبلة بيد ${playerName}`;
                        if (newLv <= 0) {
                            nextActive = nextActive.filter((p) => p !== playerName);
                            msg = `❌ إجابة خاطئة! 💥 تم إقصاء ${playerName} نهائياً 💀`;
                        }
                        if (nextActive.length <= 1) {
                            db.ref(`bomb_rooms/${roomCode}`).update({ status: "finished", winner: nextActive[0] || "لا أحد", lastAction: msg });
                        } else {
                            const idx = data.turnIndex % nextActive.length;
                            db.ref(`bomb_rooms/${roomCode}`).update({
                                lives: nextLives, activePlayers: nextActive, turnIndex: idx, turn: nextActive[idx],
                                deadline: Date.now() + Math.floor(15000 * Math.random()) + 15000,
                                category: categories[Math.floor(Math.random() * categories.length)],
                                lastAction: msg, bombId: Date.now()
                            });
                        }
                        return;
                    }
                }
                const active = data.activePlayers || [];
                const nextIdx = (data.turnIndex + 1) % active.length;
                const nextPlayer = active[nextIdx];
                document.getElementById("bm-word-input").value = "";
                const nextCat = categories[Math.floor(Math.random() * categories.length)];
                db.ref(`bomb_rooms/${roomCode}`).update({
                    turnIndex: nextIdx, turn: nextPlayer, category: nextCat,
                    lastAction: `🗣️ ${playerName} أجاب: (${word}) ورماها لـ ${nextPlayer}!`
                });
            });
        });

        document.getElementById("bm-word-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") document.getElementById("bm-pass-btn").click();
        });

        playerName ? showScreen("lobby", playerName) : showScreen("name");

        document.getElementById("bm-save-name").addEventListener("click", () => {
            const val = document.getElementById("bm-player-name").value.trim();
            if (val.length > 1) {
                playerName = val;
                localStorage.setItem("bomb_playerName", val);
                showScreen("lobby", val);
            } else alert("يرجى كتابة اسم صحيح");
        });

        document.getElementById("bm-create-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            roomCode = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref(`bomb_rooms/${roomCode}`).set({ host: playerName, status: "waiting", players: { [playerName]: true } })
                .then(() => listenRoom(roomCode, true));
        });

        document.getElementById("bm-join-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            const code = document.getElementById("bm-room-code").value.replace(/\D/g, "");
            if (!code) return alert("الرجاء إدخال رقم الغرفة الصحيح.");
            db.ref(`bomb_rooms/${code}`).once("value", (snap) => {
                if (snap.exists() && snap.val().status === "waiting") {
                    db.ref(`bomb_rooms/${code}/players/${playerName}`).set(true);
                    roomCode = code;
                    listenRoom(code, false);
                } else alert("الغرفة غير موجودة أو اللعبة بدأت بالفعل!");
            });
        });

        document.getElementById("bm-start-game").addEventListener("click", () => {
            const db = getDb();
            db.ref(`bomb_rooms/${roomCode}`).once("value", (snap) => {
                const data = snap.val();
                const players = Object.keys((data && data.players) || {});
                if (players.length < 2) return alert("اللعبة تتطلب لاعبين على الأقل!");
                const lives = {};
                players.forEach((p) => (lives[p] = 3));
                db.ref(`bomb_rooms/${roomCode}`).update({
                    status: "playing", lives, activePlayers: players, turnIndex: 0, turn: players[0],
                    category: categories[Math.floor(Math.random() * categories.length)],
                    deadline: Date.now() + Math.floor(20000 * Math.random()) + 15000,
                    bombId: Date.now(), lastAction: "🚨 بدأت الجولة الأولى! القنبلة موقوتة وجاهزة للانفجار!"
                });
            });
        });
    };

    /* =========================================================
       3- لعبة البنك (Bank)
       ========================================================= */
    GAMES.bank = function openBank() {
        if (document.getElementById("bank-game-modal")) {
            document.getElementById("bank-game-modal").style.setProperty("display", "flex", "important");
            const rb = document.getElementById("bank-restore-btn");
            if (rb) rb.style.setProperty("display", "none", "important");
            return;
        }

        injectStyle("bank-game-styles", `
            #bank-game-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 10px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .bk-box { background: #1e293b; border: 2px solid #3b82f6; border-radius: 15px; padding: 15px 18px 20px; width: 100%; max-width: 480px; max-height: 92vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .bk-box::-webkit-scrollbar { width: 5px; } .bk-box::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
            .bk-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #334155; box-sizing: border-box; flex-shrink: 0; }
            .bk-top-brand { color: #3b82f6; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .bk-controls { display: flex; gap: 8px; align-items: center; }
            .bk-icon-btn { color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .bk-icon-btn:hover { color: #3b82f6; border-color: #3b82f6; }
            .bk-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .bk-title { color: #3b82f6; margin: 5px 0 15px; font-size: 21px; }
            .bk-input { width: 100%; padding: 11px; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: white; text-align: center; box-sizing: border-box; font-size: 14px; }
            .bk-input:focus { outline: none; border-color: #3b82f6; } .bk-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .bk-btn { background: #3b82f6; color: #0f172a; border: none; padding: 11px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; box-sizing: border-box; font-size: 14px; }
            .bk-btn:hover:not([disabled]) { background: #2563eb; color: white; }
            .bk-btn-outline { background: transparent; color: #3b82f6; border: 1px solid #3b82f6; }
            .bk-btn-danger { background: #ef4444; color: white; } .bk-btn-danger:hover { background: #dc2626; }
            .bk-hidden { display: none !important; }
            .bk-player-chip { background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; color: #93c5fd; padding: 5px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; }
            .bk-scoreboard-box { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px; margin-bottom: 12px; text-align: right; }
            .bk-score-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed #1e293b; }
            .bk-score-item:last-child { border-bottom: none; }
            .bk-num-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0; }
            .bk-num-btn { background: #334155; border: 1px solid #475569; color: white; padding: 12px 0; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            .bk-num-btn:hover { background: #3b82f6; border-color: #3b82f6; }
        `);

        let playerName = localStorage.getItem("bank_playerName") || localStorage.getItem("codenames_playerName") || "";
        let roomCode = "";
        let state = "setup";

        function cleanup() {
            const db = getDb();
            if (roomCode && db) db.ref("bank_rooms/" + roomCode).off();
            const m = document.getElementById("bank-game-modal");
            if (m) m.remove();
            const r = document.getElementById("bank-restore-btn");
            if (r) r.remove();
            roomCode = "";
            state = "setup";
        }

        window.bk_minimize = function () {
            document.getElementById("bank-game-modal").style.setProperty("display", "none", "important");
            let rb = document.getElementById("bank-restore-btn");
            if (rb) {
                rb.style.setProperty("display", "flex", "important");
            } else {
                rb = document.createElement("div");
                rb.id = "bank-restore-btn";
                rb.innerHTML = '<i class="fas fa-university"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#3b82f6; color:#0f172a; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:24px; transition:0.3s;";
                rb.onclick = function () {
                    document.getElementById("bank-game-modal").style.setProperty("display", "flex", "important");
                    this.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        window.bk_close = function () {
            const db = getDb();
            if (state === "playing") {
                if (!confirm("خروجك سيُعتبر انسحاباً وتصفير لرصيدك. متأكد من الخروج؟")) return;
                if (roomCode && db) db.ref(`bank_rooms/${roomCode}/balances/${playerName}`).remove();
            } else if (state === "waiting" && roomCode && db) {
                db.ref(`bank_rooms/${roomCode}/players/${playerName}`).remove();
            }
            cleanup();
        };

        const topBar = `
            <div class="bk-top-bar">
                <div class="bk-top-brand"><i class="fas fa-university"></i> لعبة البنك</div>
                <div class="bk-controls">
                    <div class="bk-icon-btn" onclick="bk_toggleRules()" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="bk-icon-btn bk-min-btn" onclick="bk_minimize()" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="bk-icon-btn bk-close-btn" onclick="bk_close()" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "bank-game-modal";
        modal.innerHTML = `
            <div id="bk-name-screen" class="bk-box">
                ${topBar}
                <h2 class="bk-title">لعبة البنك</h2>
                <input type="text" id="bk-player-name" class="bk-input" placeholder="اكتب اسمك في اللعبة">
                <button id="bk-save-name" class="bk-btn">متابعة</button>
            </div>
            <div id="bk-lobby-screen" class="bk-box bk-hidden">
                ${topBar}
                <h2 class="bk-title">ردهة الانتظار</h2>
                <p id="bk-welcome-msg" style="font-size: 14px; color: #94a3b8; margin-bottom: 18px;"></p>
                <button id="bk-create-room" class="bk-btn">إنشاء غرفة جديدة</button>
                <hr style="border:0; border-top: 1px solid #334155; margin: 15px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/\\D/g, '')" id="bk-room-code" class="bk-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="bk-join-room" class="bk-btn bk-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="bk-room-screen" class="bk-box bk-hidden">
                ${topBar}
                <h2 class="bk-title" style="font-size:18px; display:flex; justify-content:center; align-items:center; gap:8px;">
                    غرفة رقم: <span id="bk-display-code" style="color:white; letter-spacing:2px;"></span>
                    <i class="fas fa-copy" id="bk-copy-code" style="font-size:16px; color:#3b82f6; cursor:pointer;" title="نسخ الكود"></i>
                </h2>
                <div id="bk-players-container" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:15px; margin-top:10px;"></div>
                <button id="bk-start-game" class="bk-btn bk-hidden">بدء اللعبة</button>
                <p id="bk-wait-msg" style="color:#94a3b8; font-size:13px;">بانتظار المضيف لبدء اللعبة (3 لاعبين كحد أدنى)...</p>
            </div>
            <div id="bk-game-screen" class="bk-box bk-hidden">
                ${topBar}
                <div class="bk-scoreboard-box">
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:6px; font-weight:bold;">📊 أرصدة اللاعبين الحالية:</div>
                    <div id="bk-scoreboard-list"></div>
                </div>
                <div id="bk-turn-banner" style="background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-weight: bold; font-size: 14px; color: #93c5fd;"></div>
                <div id="bk-action-area"></div>
            </div>
            <div id="bk-rules-screen" class="bk-box bk-hidden" style="z-index:999999;">
                <div class="bk-top-bar">
                    <div class="bk-top-brand"><i class="fas fa-book-open"></i> شرح القوانين</div>
                    <div class="bk-controls"><div class="bk-icon-btn bk-close-btn" onclick="bk_toggleRules()"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align:right; font-size:13px; line-height:1.65; color:#cbd5e1; padding-right:5px;">
                    <p style="color:#3b82f6; font-weight:bold; margin:0 0 4px;">💰 فكرة اللعبة:</p>
                    <p style="margin:0 0 10px;">يبدأ الجميع برصيد 2000$. الهدف هو سحب أموال الآخرين والبقاء كآخر شخص يملك رصيداً.</p>
                    <p style="color:#3b82f6; font-weight:bold; margin:0 0 4px;">⚔️ طريقة التحدي:</p>
                    <p style="margin:0 0 10px;">اختر ضحية وتحدها بمبلغ معين (حسب قدرة كلاكما المالية). يختار المدافع رقماً سرياً من 1 إلى 5.</p>
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">🎯 التخمين والفوز:</p>
                    <p style="margin:0;">إذا خمن المهاجم الرقم الصحيح، يأخذ المبلغ من المدافع! وإذا أخطأ، يُخصم المبلغ منه ويذهب للمدافع! من يصل رصيده إلى 0$ يُطرد فوراً.</p>
                </div>
                <button class="bk-btn" style="margin-top:15px;" onclick="bk_toggleRules()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("bk-name-screen"),
            lobby: document.getElementById("bk-lobby-screen"),
            room: document.getElementById("bk-room-screen"),
            game: document.getElementById("bk-game-screen"),
            rules: document.getElementById("bk-rules-screen")
        };
        let prevScreen = null;

        function showScreen(key, nameVal = "") {
            for (const k in screens) if (k !== "rules") screens[k].classList.add("bk-hidden");
            screens[key].classList.remove("bk-hidden");
            if (key === "lobby") {
                document.getElementById("bk-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#3b82f6; font-weight:bold;">${nameVal}</span> <a href="#" id="bk-edit-name" style="color:#64748b; font-size:12px; margin-right:8px; text-decoration:underline; cursor:pointer;">(تغيير الاسم)</a>`;
                document.getElementById("bk-edit-name").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("bank_playerName");
                    document.getElementById("bk-player-name").value = nameVal;
                    showScreen("name");
                });
            }
        }

        function listenRoom(code, isHost) {
            const db = getDb();
            state = "waiting";
            showScreen("room");
            document.getElementById("bk-display-code").innerText = code;
            document.getElementById("bk-copy-code").onclick = () =>
                navigator.clipboard.writeText("🏦 انضم للغرفة في لعبة البنك!\n🔑 رقم الغرفة: " + code).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));
            document.getElementById("bk-start-game").classList.toggle("bk-hidden", !isHost);
            document.getElementById("bk-wait-msg").classList.toggle("bk-hidden", isHost);

            db.ref(`bank_rooms/${code}`).on("value", (snap) => {
                const data = snap.val();
                if (!data) return;
                const players = Object.keys(data.players || {});
                document.getElementById("bk-players-container").innerHTML = players.map((p) => `<div class="bk-player-chip">${p}</div>`).join("");

                if (data.status === "finished") {
                    alert(`🏆 انتهت اللعبة!\nالفائز هو: ${data.winner} برصيد ${data.winnerScore}$!`);
                    cleanup();
                    return;
                }

                if (data.status === "playing") {
                    if (state !== "playing") {
                        state = "playing";
                        document.querySelectorAll(".bk-min-btn").forEach((el) => (el.style.display = "none"));
                        showScreen("game");
                    }
                    const balances = data.balances || {};
                    let sbHtml = "";
                    for (const [p, bal] of Object.entries(balances)) {
                        sbHtml += `<div class="bk-score-item"><span>👤 ${p}</span> <span style="color:${bal > 0 ? "#10b981" : "#ef4444"}; font-weight:bold;">${bal}$</span></div>`;
                    }
                    document.getElementById("bk-scoreboard-list").innerHTML = sbHtml;

                    if (balances[playerName] !== undefined && balances[playerName] <= 0) {
                        alert("لقد صفر رصيدك! تم طردك من اللعبة ❌");
                        db.ref(`bank_rooms/${roomCode}/balances/${playerName}`).remove();
                        cleanup();
                        return;
                    }

                    const alive = Object.keys(balances).filter((p) => balances[p] > 0);
                    if (alive.length === 1 && data.gameStarted) {
                        const w = alive[0];
                        db.ref(`bank_rooms/${roomCode}`).update({ status: "finished", winner: w, winnerScore: balances[w] });
                        return;
                    }

                    const banner = document.getElementById("bk-turn-banner");
                    const area = document.getElementById("bk-action-area");
                    const isMyAction = data.stage === "defender_pick" ? data.defender === playerName : data.attacker === playerName;

                    if (isMyAction) {
                        if (!data.stage || data.stage === "choose_target") {
                            banner.innerHTML = "⭐ دورك الآن! اختر لاعباً لتطرح عليه التحدي.";
                            const targets = alive.filter((p) => p !== playerName);
                            area.innerHTML = `<p style="font-size:13px; color:#cbd5e1; margin-bottom:8px;">اختر خصماً:</p>
                                <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
                                    ${targets.map((p) => `<button class="bk-btn bk-btn-outline" onclick="bk_selectTarget('${p}')">${p}</button>`).join("")}
                                </div>`;
                        } else if (data.stage === "choose_amount") {
                            banner.innerHTML = "⭐ دورك الآن! اختر مبلغ التحدي.";
                            const maxBet = Math.min(balances[data.defender] || 0, balances[playerName] || 0);
                            const mkBtn = (amt) =>
                                maxBet < amt
                                    ? `<button class="bk-btn" disabled style="flex:1; min-width:70px; background:#334155; border:1px solid #475569; color:#94a3b8; cursor:not-allowed;">${amt}$</button>`
                                    : `<button class="bk-btn" style="flex:1; min-width:70px;" onclick="bk_setAmount(${amt})">${amt}$</button>`;
                            area.innerHTML = `<p style="font-size:13px; color:#cbd5e1; margin-bottom:8px;">اختر مبلغ التحدي ضد (${data.defender}):</p>
                                <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">${mkBtn(500)}${mkBtn(1000)}${mkBtn(1500)}${mkBtn(2000)}</div>`;
                        } else if (data.stage === "defender_pick") {
                            banner.innerHTML = "🛡️ أنت في وضع الدفاع يا بطل!";
                            area.innerHTML = `<p style="font-size:13px; color:#cbd5e1; margin-bottom:8px;">(${data.attacker}) يتحداك بـ (${data.amount}$)! اختر رقماً سرياً من 1 إلى 5:</p>
                                <div class="bk-num-grid">${[1, 2, 3, 4, 5].map((n) => `<button class="bk-num-btn" onclick="bk_defenderChoice(${n})">${n}</button>`).join("")}</div>`;
                        } else if (data.stage === "attacker_guess") {
                            banner.innerHTML = "🎯 حان وقت التخمين!";
                            area.innerHTML = `<p style="font-size:13px; color:#cbd5e1; margin-bottom:8px;">(${data.defender}) اختار رقماً سرياً. خمن الرقم الصحيح لتفوز بالـ (${data.amount}$):</p>
                                <div class="bk-num-grid">${[1, 2, 3, 4, 5].map((n) => `<button class="bk-num-btn" onclick="bk_attackerGuess(${n})">${n}</button>`).join("")}</div>`;
                        }
                    } else {
                        banner.innerHTML = `⏳ دور التحدي: (${data.attacker})`;
                        let waitTxt = `اللاعب (${data.attacker}) يختار ضحية للتحدي...`;
                        if (data.stage === "choose_amount") waitTxt = `اللاعب (${data.attacker}) يحدد مبلغ التحدي ضد (${data.defender})...`;
                        else if (data.stage === "defender_pick") waitTxt = `اللاعب (${data.defender}) يختار رقماً سرياً للدفاع...`;
                        else if (data.stage === "attacker_guess") waitTxt = `اللاعب (${data.attacker}) يحاول تخمين الرقم السري...`;
                        area.innerHTML = `<p style="color:#94a3b8; font-size:13px; padding:20px;">${waitTxt}</p>`;
                    }
                }
            });
        }

        window.bk_toggleRules = function () {
            if (screens.rules.classList.contains("bk-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("bk-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("bk-hidden");
                    }
                }
                screens.rules.classList.remove("bk-hidden");
            } else {
                screens.rules.classList.add("bk-hidden");
                if (prevScreen) prevScreen.classList.remove("bk-hidden");
            }
        };

        window.bk_selectTarget = (t) => getDb().ref(`bank_rooms/${roomCode}`).update({ stage: "choose_amount", defender: t });
        window.bk_setAmount = (amt) => getDb().ref(`bank_rooms/${roomCode}`).update({ stage: "defender_pick", amount: amt });
        window.bk_defenderChoice = (num) => getDb().ref(`bank_rooms/${roomCode}`).update({ stage: "attacker_guess", secretNum: num });
        window.bk_attackerGuess = (guess) => {
            const db = getDb();
            db.ref(`bank_rooms/${roomCode}`).once("value", (snap) => {
                const d = snap.val();
                const att = d.attacker, def = d.defender, amt = d.amount, sec = d.secretNum;
                const bals = d.balances || {};
                let attB = bals[att] || 0, defB = bals[def] || 0;
                if (guess === sec) {
                    attB += amt; defB -= amt;
                    alert(`✅ إجابة صحيحة! تم خصم ${amt}$ من المدافع وإضافتها لرصيدك.`);
                } else {
                    attB -= amt; defB += amt;
                    alert(`❌ إجابة خاطئة! الرقم السري كان (${sec}). خسرت ${amt}$ وراحت للضحية.`);
                }
                let nextTurn = def;
                if (defB <= 0) nextTurn = att;
                else if (attB <= 0) nextTurn = def;
                db.ref(`bank_rooms/${roomCode}`).update({
                    [`balances/${att}`]: attB, [`balances/${def}`]: defB,
                    stage: "choose_target", turn: nextTurn, attacker: nextTurn, defender: null, amount: 0, secretNum: 0
                });
            });
        };

        playerName ? showScreen("lobby", playerName) : showScreen("name");

        document.getElementById("bk-save-name").addEventListener("click", () => {
            const val = document.getElementById("bk-player-name").value.trim();
            if (val.length > 1) {
                playerName = val;
                localStorage.setItem("bank_playerName", val);
                showScreen("lobby", val);
            } else alert("يرجى كتابة اسم صحيح");
        });

        document.getElementById("bk-create-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            roomCode = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref(`bank_rooms/${roomCode}`).set({ host: playerName, status: "waiting", gameStarted: false, players: { [playerName]: true } })
                .then(() => listenRoom(roomCode, true));
        });

        document.getElementById("bk-join-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            const code = document.getElementById("bk-room-code").value.replace(/\D/g, "");
            if (!code) return alert("الرجاء إدخال رقم الغرفة الصحيح.");
            db.ref(`bank_rooms/${code}`).once("value", (snap) => {
                if (snap.exists() && !snap.val().gameStarted) {
                    db.ref(`bank_rooms/${code}/players/${playerName}`).set(true);
                    roomCode = code;
                    listenRoom(code, false);
                } else alert("الغرفة غير موجودة أو بدأت بالفعل!");
            });
        });

        document.getElementById("bk-start-game").addEventListener("click", () => {
            const db = getDb();
            db.ref(`bank_rooms/${roomCode}`).once("value", (snap) => {
                const data = snap.val();
                const players = Object.keys((data && data.players) || {});
                if (players.length < 3) return alert("اللعبة تتطلب 3 لاعبين على الأقل!");
                const balances = {};
                players.forEach((p) => (balances[p] = 2000));
                db.ref(`bank_rooms/${roomCode}`).update({
                    status: "playing", gameStarted: true, balances, turn: players[0], attacker: players[0], stage: "choose_target"
                });
            });
        });
    };

 /* =========================================================
       4- لعبة الجاسوس (Spyfall)
       ========================================================= */
    GAMES.spyfall = function openSpyfall() {
        const locations = ["مستشفى","غواصة","قاعدة عسكرية","مدرسة","سفينة قراصنة","محطة فضاء","بنك","فندق","مسرح","سيرك","طائرة","قطار","كازينو","مركز شرطة","مطعم","متحف","مختبر سري","استوديو تصوير","شاطئ","سفينة سياحية","سفارة","مستعمرة نمل","ملعب رياضي","محطة وقود"];

        if (document.getElementById("spyfall-modal")) {
            document.getElementById("spyfall-modal").style.setProperty("display", "flex", "important");
            const rb = document.getElementById("spyfall-restore-btn");
            if (rb) rb.style.setProperty("display", "none", "important");
            return;
        }

        injectStyle("spyfall-styles", `
            #spyfall-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 10px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .sf-box { background: #1e293b; border: 2px solid #10b981; border-radius: 15px; padding: 15px 18px 20px; width: 100%; max-width: 460px; max-height: 92vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .sf-box::-webkit-scrollbar { width: 5px; } .sf-box::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
            .sf-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #334155; box-sizing: border-box; flex-shrink: 0; }
            .sf-top-brand { color: #10b981; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .sf-controls { display: flex; gap: 8px; align-items: center; }
            .sf-icon-btn { color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .sf-icon-btn:hover { color: #10b981; border-color: #10b981; }
            .sf-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .sf-title { color: #10b981; margin: 5px 0 15px; font-size: 21px; }
            .sf-input { width: 100%; padding: 11px; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: white; text-align: center; box-sizing: border-box; font-size: 14px; }
            .sf-input:focus { outline: none; border-color: #10b981; } .sf-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .sf-btn { background: #10b981; color: #0f172a; border: none; padding: 11px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; box-sizing: border-box; font-size: 14px; }
            .sf-btn:hover { background: #059669; color: white; }
            .sf-btn-outline { background: transparent; color: #10b981; border: 1px solid #10b981; }
            .sf-btn-danger { background: #ef4444; color: white; } .sf-btn-danger:hover { background: #dc2626; }
            .sf-hidden { display: none !important; }
            .sf-player-chip { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #a7f3d0; padding: 5px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; }
            .sf-role-banner { background: #0f172a; border: 1px dashed #475569; border-radius: 8px; padding: 6px; margin-bottom: 8px; cursor: pointer; transition: 0.3s; user-select: none; }
            .sf-role-revealed-local { background: linear-gradient(135deg, #0f172a, #064e3b); border: 1px solid #10b981; color: white; cursor: default; }
            .sf-role-revealed-spy { background: linear-gradient(135deg, #450a0a, #7f1d1d); border: 1px solid #ef4444; color: white; cursor: default; }
            .sf-turn-banner { background: #059669; color: white; padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
            .sf-chat-container { display: flex; flex-direction: column; height: 160px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid #334155; margin-bottom: 8px; }
            .sf-chat-messages { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
            .sf-chat-msg { padding: 6px 10px; border-radius: 10px; width: fit-content; max-width: 90%; word-wrap: break-word; }
            .sf-msg-q { background: #3b82f6; color: white; align-self: flex-start; border-bottom-right-radius: 2px; }
            .sf-msg-a { background: #10b981; color: #0f172a; align-self: flex-end; border-bottom-left-radius: 2px; }
            .sf-chat-name { font-size: 10px; opacity: 0.8; margin-bottom: 2px; font-weight: bold; }
            .sf-chat-input-area { display: flex; gap: 5px; padding: 5px; background: #1e293b; border-top: 1px solid #334155; border-radius: 0 0 8px 8px; }
            .sf-chat-input-area input { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: white; font-size: 13px; outline: none; }
            .sf-chat-input-area button { background: #10b981; color: #0f172a; border: none; padding: 0 12px; border-radius: 6px; font-weight: bold; cursor: pointer; } .sf-chat-input-area button:disabled { opacity: 0.5; }
            .sf-loc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; max-height: 100px; overflow-y: auto; padding-right: 3px; }
            .sf-loc-card { background: #334155; border: 1px solid #475569; border-radius: 4px; padding: 6px 2px; font-size: 11px; cursor: pointer; color: #cbd5e1; user-select: none; display: flex; align-items: center; justify-content: center; }
            .sf-loc-crossed { background: #0f172a !important; color: #475569 !important; text-decoration: line-through; }
            .sf-vote-btn { background: #334155; border: 1px solid #475569; color: white; padding: 10px; margin: 4px; border-radius: 6px; cursor: pointer; width: 45%; display: inline-block; }
            .sf-vote-btn:hover { background: #ef4444; border-color: #ef4444; } .sf-vote-selected { background: #ef4444 !important; border-color: #dc2626 !important; font-weight: bold; }
            #sf-timer-box { font-size: 18px; font-weight: bold; color: #10b981; margin-bottom: 8px; font-family: monospace; letter-spacing: 2px; }
        `);

        let playerName = localStorage.getItem("spyfall_playerName") || localStorage.getItem("codenames_playerName") || "";
        let roomCode = "";
        let state = "setup";
        let isHost = false;
        let timerId = null;

        function cleanup() {
            const db = getDb();
            if (roomCode && db) db.ref("spyfall_rooms/" + roomCode).off();
            clearInterval(timerId);
            const m = document.getElementById("spyfall-modal");
            if (m) m.remove();
            const r = document.getElementById("spyfall-restore-btn");
            if (r) r.remove();
            roomCode = "";
            state = "setup";
            isHost = false;
        }

        window.sf_minimize = function () {
            if (state === "playing" || state === "voting" || state === "spy_guess") return;
            document.getElementById("spyfall-modal").style.setProperty("display", "none", "important");
            let rb = document.getElementById("spyfall-restore-btn");
            if (rb) {
                rb.style.setProperty("display", "flex", "important");
            } else {
                rb = document.createElement("div");
                rb.id = "spyfall-restore-btn";
                rb.innerHTML = '<i class="fas fa-mask"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#10b981; color:#0f172a; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:24px; transition:0.3s;";
                rb.onclick = function () {
                    document.getElementById("spyfall-modal").style.setProperty("display", "flex", "important");
                    this.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        window.sf_close = function () {
            const db = getDb();
            if (state === "playing" || state === "voting" || state === "spy_guess") {
                if (!confirm("خروجك الآن قد يعطل اللعبة على البقية. هل أنت متأكد من الخروج؟")) return;
                if (roomCode && db) db.ref("spyfall_rooms/" + roomCode).update({ status: "forfeited", forfeitedBy: playerName });
            } else if (state === "waiting" && roomCode && db) {
                db.ref(`spyfall_rooms/${roomCode}/players/${playerName}`).remove();
            }
            cleanup();
        };

        const topBar = `
            <div class="sf-top-bar">
                <div class="sf-top-brand"><i class="fas fa-mask"></i> الجاسوس (Spyfall)</div>
                <div class="sf-controls">
                    <div class="sf-icon-btn" onclick="sf_toggleRules()" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="sf-icon-btn sf-min-btn" onclick="sf_minimize()" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="sf-icon-btn sf-close-btn" onclick="sf_close()" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "spyfall-modal";
        modal.innerHTML = `
            <div id="sf-name-screen" class="sf-box">
                ${topBar}
                <h2 class="sf-title">لعبة الجاسوس</h2>
                <input type="text" id="sf-player-name" class="sf-input" placeholder="اكتب اسمك في اللعبة">
                <button id="sf-save-name" class="sf-btn">متابعة</button>
            </div>
            <div id="sf-lobby-screen" class="sf-box sf-hidden">
                ${topBar}
                <h2 class="sf-title">ردهة الانتظار</h2>
                <p id="sf-welcome-msg" style="font-size: 14px; color: #94a3b8; margin-bottom: 18px;"></p>
                <button id="sf-create-room" class="sf-btn">إنشاء غرفة جديدة</button>
                <hr style="border:0; border-top: 1px solid #334155; margin: 15px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/\\D/g, '')" id="sf-room-code" class="sf-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="sf-join-room" class="sf-btn sf-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="sf-room-screen" class="sf-box sf-hidden">
                ${topBar}
                <h2 class="sf-title" style="font-size:18px; display:flex; justify-content:center; align-items:center; gap:8px;">
                    غرفة رقم: <span id="sf-display-code" style="color:white; letter-spacing:2px;"></span>
                    <i class="fas fa-copy" id="sf-copy-code" style="font-size:16px; color:#10b981; cursor:pointer;" title="نسخ الكود"></i>
                </h2>
                <div id="sf-players-container" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:15px; margin-top:10px;"></div>
                <button id="sf-start-game" class="sf-btn sf-hidden">بدء اللعبة</button>
                <p id="sf-wait-msg" style="color:#94a3b8; font-size:13px;">بانتظار المضيف لبدء اللعبة...</p>
            </div>
            <div id="sf-game-screen" class="sf-box sf-hidden" style="padding-bottom:10px;">
                ${topBar}
                <div id="sf-timer-box">08:00</div>
                <div id="sf-role-area" class="sf-role-banner" onclick="sf_revealRole()">
                    <div id="sf-role-hidden-content"><i class="fas fa-eye-slash"></i> اضغط لمعرفة دورك السري</div>
                    <div id="sf-role-revealed-content" class="sf-hidden">
                        <h3 id="sf-role-title" style="margin:0 0 3px; font-size:14px;"></h3>
                        <p id="sf-role-desc" style="margin:0; font-size:11px;"></p>
                    </div>
                </div>
                <div id="sf-turn-banner" class="sf-turn-banner">
                    <span id="sf-turn-text">جارِ تحديد الدور...</span>
                    <button id="sf-skip-turn" class="sf-btn-outline sf-hidden" style="padding:2px 8px; border-radius:4px; font-size:11px; cursor:pointer; background:#fff; width:auto; margin:0;">تخطي</button>
                </div>
                <div class="sf-chat-container">
                    <div id="sf-chat-messages" class="sf-chat-messages"></div>
                    <div class="sf-chat-input-area">
                        <input type="text" id="sf-chat-input" placeholder="انتظر دورك..." disabled>
                        <button id="sf-send-msg" disabled><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
                <p style="color:#94a3b8; font-size:11px; margin:0 0 3px 0; text-align:right;">لوحة التخمين (اضغط للشطب):</p>
                <div id="sf-locations-grid" class="sf-loc-grid"></div>
            </div>
            <div id="sf-voting-screen" class="sf-box sf-hidden">
                ${topBar}
                <h2 class="sf-title" style="color:#ef4444;">انتهى الوقت! التصويت</h2>
                <p style="font-size:13px; margin-bottom:15px;">من تعتقد أنه الجاسوس؟ (تصويت إجباري)</p>
                <div id="sf-voting-options" style="margin-bottom:15px;"></div>
                <button id="sf-force-tally" class="sf-btn sf-btn-danger sf-hidden">إنهاء التصويت فوراً وفرز النتائج</button>
                <p id="sf-vote-wait" style="color:#94a3b8; font-size:12px;">بانتظار تصويت الجميع...</p>
            </div>
            <div id="sf-spy-guess-screen" class="sf-box sf-hidden">
                ${topBar}
                <h2 class="sf-title" style="color:#f59e0b;">الفرصة الأخيرة للجاسوس!</h2>
                <p id="sf-spy-guess-msg" style="font-size:13px; margin-bottom:15px;"></p>
                <div id="sf-spy-loc-grid" class="sf-loc-grid sf-hidden" style="max-height: 200px;"></div>
            </div>
            <div id="sf-rules-screen" class="sf-box sf-hidden" style="z-index:999999;">
                <div class="sf-top-bar">
                    <div class="sf-top-brand"><i class="fas fa-book-open"></i> شرح القوانين</div>
                    <div class="sf-controls"><div class="sf-icon-btn sf-close-btn" onclick="sf_toggleRules()"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align:right; font-size:13px; line-height:1.65; color:#cbd5e1; padding-right:5px;">
                    <p style="color:#10b981; font-weight:bold; margin:0 0 4px;">🕵️ فكرة اللعبة:</p>
                    <p style="margin:0 0 10px;">الجميع في مكان واحد (مثلاً مدرسة)، باستثناء الجاسوس لا يعرف المكان.</p>
                    <p style="color:#10b981; font-weight:bold; margin:0 0 4px;">💬 طريقة اللعب:</p>
                    <p style="margin:0 0 10px;">النظام يختار سائل ومجيب، اسألوا أسئلة غامضة لبعضكم لكشف الجاسوس بدون أن تفضحوا المكان.</p>
                    <p style="color:#ef4444; font-weight:bold; margin:0 0 4px;">🎯 الفوز:</p>
                    <p style="margin:0;">يفوز الجاسوس إذا عرف المكان. ويفوز البقية إذا صوتوا لمعرفة الجاسوس بشكل صحيح.</p>
                </div>
                <button class="sf-btn" style="margin-top:15px;" onclick="sf_toggleRules()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("sf-name-screen"),
            lobby: document.getElementById("sf-lobby-screen"),
            room: document.getElementById("sf-room-screen"),
            game: document.getElementById("sf-game-screen"),
            voting: document.getElementById("sf-voting-screen"),
            spyGuess: document.getElementById("sf-spy-guess-screen"),
            rules: document.getElementById("sf-rules-screen")
        };
        let prevScreen = null;

        function showScreen(key, nameVal = "") {
            for (const k in screens) if (k !== "rules") screens[k].classList.add("sf-hidden");
            screens[key].classList.remove("sf-hidden");
            if (key === "lobby") {
                document.getElementById("sf-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#10b981; font-weight:bold;">${nameVal}</span> <a href="#" id="sf-edit-name" style="color:#64748b; font-size:12px; margin-right:8px; text-decoration:underline; cursor:pointer;">(تغيير الاسم)</a>`;
                document.getElementById("sf-edit-name").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("spyfall_playerName");
                    document.getElementById("sf-player-name").value = nameVal;
                    showScreen("name");
                });
            }
        }

        function pickTurn(players) {
            const q = players[Math.floor(Math.random() * players.length)];
            let a = players[Math.floor(Math.random() * players.length)];
            while (a === q) a = players[Math.floor(Math.random() * players.length)];
            return { q, a, phase: "ask" };
        }

        function listenRoom(code, hostFlag) {
            const db = getDb();
            isHost = hostFlag;
            state = "waiting";
            showScreen("room");
            document.getElementById("sf-display-code").innerText = code;
            document.getElementById("sf-copy-code").onclick = () =>
                navigator.clipboard.writeText("🕵️ انضم للغرفة في لعبة الجاسوس!\n🔑 رقم الغرفة: " + code).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));
            document.getElementById("sf-start-game").classList.toggle("sf-hidden", !hostFlag);
            document.getElementById("sf-wait-msg").classList.toggle("sf-hidden", hostFlag);

            db.ref(`spyfall_rooms/${code}`).on("value", (snap) => {
                const data = snap.val();
                if (!data) return;
                const players = Object.keys(data.players || {});
                document.getElementById("sf-players-container").innerHTML = players.map((p) => `<div class="sf-player-chip">${p}</div>`).join("");

                if (data.status === "forfeited" || data.status === "finished") {
                    if (data.status === "forfeited") {
                        alert(`انتهت اللعبة! اللاعب (${data.forfeitedBy}) انسحب من الغرفة.`);
                    } else {
                        alert(`${data.winner === "spy" ? "🕵️‍♂️ فاز الجاسوس!" : "👥 فاز الأعضاء!"}\n\nالسبب: ${data.winnerReason}\n\nالجاسوس كان: ${data.spy}\nالمكان كان: ${data.location}`);
                    }
                    cleanup();
                    return;
                }

                if (data.status === "playing") {
                    if (state !== "playing") {
                        state = "playing";
                        document.querySelectorAll(".sf-min-btn").forEach((el) => (el.style.display = "none"));
                        showScreen("game");
                        const roleArea = document.getElementById("sf-role-area");
                        roleArea.onclick = window.sf_revealRole;
                        document.getElementById("sf-role-hidden-content").classList.remove("sf-hidden");
                        document.getElementById("sf-role-revealed-content").classList.add("sf-hidden");
                        if (data.spy === playerName) {
                            roleArea.className = "sf-role-banner sf-role-revealed-spy";
                            document.getElementById("sf-role-title").innerText = "أنت الجاسوس! 🕵️‍♂️";
                            document.getElementById("sf-role-desc").innerText = "خمن المكان من أسئلتهم واحذر أن تنكشف.";
                        } else {
                            roleArea.className = "sf-role-banner sf-role-revealed-local";
                            document.getElementById("sf-role-title").innerText = `المكان: ${data.location} 📍`;
                            document.getElementById("sf-role-desc").innerText = "أنت مواطن. راقب الأسئلة لتصيد الجاسوس.";
                        }
                        document.getElementById("sf-locations-grid").innerHTML = locations
                            .map((loc) => `<div class="sf-loc-card" onclick="this.classList.toggle('sf-loc-crossed')">${loc}</div>`)
                            .join("");
                        clearInterval(timerId);
                        timerId = setInterval(() => {
                            const left = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
                            const tb = document.getElementById("sf-timer-box");
                            if (tb) tb.innerText = (Math.floor(left / 60) < 10 ? "0" : "") + Math.floor(left / 60) + ":" + (left % 60 < 10 ? "0" : "") + (left % 60);
                            if (isHost && left === 0) {
                                clearInterval(timerId);
                                db.ref(`spyfall_rooms/${code}`).update({ status: "voting", votes: null });
                            }
                        }, 1000);
                    }

                    const turn = data.turn || {};
                    const turnTxt = document.getElementById("sf-turn-text");
                    const chatInp = document.getElementById("sf-chat-input");
                    const sendBtn = document.getElementById("sf-send-msg");
                    if (isHost) document.getElementById("sf-skip-turn").classList.remove("sf-hidden");

                    if (turn.phase === "ask") {
                        turnTxt.innerText = `🎤 دور (${turn.q}) يكتب سؤال لـ (${turn.a})`;
                        if (playerName === turn.q) {
                            chatInp.disabled = false; sendBtn.disabled = false;
                            chatInp.placeholder = `اكتب سؤالك لـ ${turn.a}...`; chatInp.focus();
                        } else {
                            chatInp.disabled = true; sendBtn.disabled = true; chatInp.placeholder = "انتظر دورك...";
                        }
                    } else {
                        turnTxt.innerText = `💬 دور (${turn.a}) يُجيب على سؤال (${turn.q})`;
                        if (playerName === turn.a) {
                            chatInp.disabled = false; sendBtn.disabled = false;
                            chatInp.placeholder = "اكتب إجابتك..."; chatInp.focus();
                        } else {
                            chatInp.disabled = true; sendBtn.disabled = true; chatInp.placeholder = "انتظر دورك...";
                        }
                    }

                    const chatBox = document.getElementById("sf-chat-messages");
                    chatBox.innerHTML = Object.values(data.chat || {})
                        .map((m) => `<div class="sf-chat-msg ${m.type === "q" ? "sf-msg-q" : "sf-msg-a"}"><div class="sf-chat-name">${m.name}</div><div>${m.text}</div></div>`)
                        .join("");
                    chatBox.scrollTop = chatBox.scrollHeight;
                }

                if (data.status === "voting") {
                    if (state !== "voting") {
                        state = "voting";
                        showScreen("voting");
                        clearInterval(timerId);
                        document.getElementById("sf-voting-options").innerHTML = players
                            .filter((p) => p !== playerName)
                            .map((p) => `<button class="sf-vote-btn" onclick="sf_submitVote('${p}')">${p}</button>`)
                            .join("");
                        if (isHost) document.getElementById("sf-force-tally").classList.remove("sf-hidden");
                    }
                    const votes = data.votes || {};
                    if (votes[playerName]) {
                        document.getElementById("sf-vote-wait").innerText = "تم تسجيل تصويتك، بانتظار البقية...";
                        document.querySelectorAll(".sf-vote-btn").forEach((b) => {
                            b.disabled = true;
                            if (b.innerText === votes[playerName]) b.classList.add("sf-vote-selected");
                        });
                    }
                    if (isHost && Object.keys(votes).length === players.length) {
                        window.sf_tallyVotes(votes, players, data.spy);
                    }
                }

                if (data.status === "spy_guess" && state !== "spy_guess") {
                    state = "spy_guess";
                    showScreen("spyGuess");
                    const msgEl = document.getElementById("sf-spy-guess-msg");
                    const gridEl = document.getElementById("sf-spy-loc-grid");
                    if (playerName === data.spy) {
                        msgEl.innerHTML = "🚨 <b>لقد كشفوك!</b><br>فرصتك الأخيرة للنجاة: اختر المكان الصحيح!";
                        gridEl.classList.remove("sf-hidden");
                        gridEl.innerHTML = locations
                            .map((loc) => `<div class="sf-loc-card" style="background:#0f172a; padding:10px; font-weight:bold; font-size:13px;" onclick="sf_spyFinalChoice('${loc}', '${data.location}')">${loc}</div>`)
                            .join("");
                    } else {
                        msgEl.innerHTML = `تم كشف الجاسوس بنجاح وهو <b>(${data.spy})</b>! 👏<br>الجاسوس يحاول الآن تخمين المكان للنجاة...`;
                        gridEl.classList.add("sf-hidden");
                    }
                }
            });
        }

        window.sf_toggleRules = function () {
            if (screens.rules.classList.contains("sf-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("sf-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("sf-hidden");
                    }
                }
                screens.rules.classList.remove("sf-hidden");
            } else {
                screens.rules.classList.add("sf-hidden");
                if (prevScreen) prevScreen.classList.remove("sf-hidden");
            }
        };

        window.sf_revealRole = function () {
            document.getElementById("sf-role-hidden-content").classList.add("sf-hidden");
            document.getElementById("sf-role-revealed-content").classList.remove("sf-hidden");
            document.getElementById("sf-role-area").onclick = null;
        };

        window.sf_submitVote = (v) => getDb().ref(`spyfall_rooms/${roomCode}/votes/${playerName}`).set(v);

        window.sf_tallyVotes = function (votes, players, spy) {
            const counts = {};
            Object.values(votes || {}).forEach((v) => (counts[v] = (counts[v] || 0) + 1));
            let maxV = 0, topP = "";
            for (const p in counts) if (counts[p] > maxV) { maxV = counts[p]; topP = p; }
            if (topP === spy) {
                getDb().ref(`spyfall_rooms/${roomCode}`).update({ status: "spy_guess" });
            } else {
                getDb().ref(`spyfall_rooms/${roomCode}`).update({
                    status: "finished", winner: "spy", winnerReason: `صوّت الأغلبية ضد (${topP}) وهو بريء! نجا الجاسوس.`
                });
            }
        };

        window.sf_spyFinalChoice = function (choice, actual) {
            if (choice === actual) {
                getDb().ref(`spyfall_rooms/${roomCode}`).update({ status: "finished", winner: "spy", winnerReason: "نجح الجاسوس في استنتاج المكان الصحيح في اللحظة الأخيرة!" });
            } else {
                getDb().ref(`spyfall_rooms/${roomCode}`).update({ status: "finished", winner: "locals", winnerReason: "تم كشف الجاسوس، وفشل في تخمين المكان." });
            }
        };

        if (playerName) showScreen("lobby", playerName);

        document.getElementById("sf-save-name").addEventListener("click", () => {
            const val = document.getElementById("sf-player-name").value.trim();
            if (val.length > 1) {
                playerName = val;
                localStorage.setItem("spyfall_playerName", val);
                showScreen("lobby", val);
            } else alert("يرجى كتابة اسم صحيح");
        });

        document.getElementById("sf-create-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            roomCode = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref(`spyfall_rooms/${roomCode}`).set({ host: playerName, status: "waiting", players: { [playerName]: true } })
                .then(() => listenRoom(roomCode, true));
        });

        document.getElementById("sf-join-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            const code = document.getElementById("sf-room-code").value.replace(/\D/g, "");
            if (!code) return alert("الرجاء إدخال رقم الغرفة الصحيح.");
            db.ref(`spyfall_rooms/${code}`).once("value", (snap) => {
                if (snap.exists() && snap.val().status !== "finished" && snap.val().status !== "forfeited") {
                    db.ref(`spyfall_rooms/${code}/players/${playerName}`).set(true);
                    roomCode = code;
                    listenRoom(code, false);
                } else alert("الغرفة غير موجودة أو منتهية!");
            });
        });

        document.getElementById("sf-force-tally").addEventListener("click", () => {
            getDb().ref(`spyfall_rooms/${roomCode}`).once("value", (snap) => {
                const d = snap.val();
                if (d) window.sf_tallyVotes(d.votes, Object.keys(d.players || {}), d.spy);
            });
        });

        document.getElementById("sf-skip-turn").addEventListener("click", () => {
            getDb().ref(`spyfall_rooms/${roomCode}`).once("value", (snap) => {
                const d = snap.val();
                if (d) getDb().ref(`spyfall_rooms/${roomCode}/turn`).set(pickTurn(Object.keys(d.players || {})));
            });
        });

        document.getElementById("sf-send-msg").addEventListener("click", () => {
            const inp = document.getElementById("sf-chat-input");
            const txt = inp.value.trim();
            if (!txt || !roomCode) return;
            const db = getDb();
            db.ref(`spyfall_rooms/${roomCode}`).once("value", (snap) => {
                const d = snap.val();
                if (!d || d.status !== "playing") return;
                if (d.turn.phase === "ask" && playerName === d.turn.q) {
                    db.ref(`spyfall_rooms/${roomCode}/chat`).push({ name: playerName, text: txt, type: "q" });
                    db.ref(`spyfall_rooms/${roomCode}/turn/phase`).set("answer");
                    inp.value = "";
                } else if (d.turn.phase === "answer" && playerName === d.turn.a) {
                    db.ref(`spyfall_rooms/${roomCode}/chat`).push({ name: playerName, text: txt, type: "a" });
                    db.ref(`spyfall_rooms/${roomCode}/turn`).set(pickTurn(Object.keys(d.players || {})));
                    inp.value = "";
                }
            });
        });

        document.getElementById("sf-chat-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") document.getElementById("sf-send-msg").click();
        });

        document.getElementById("sf-start-game").addEventListener("click", () => {
            const db = getDb();
            db.ref(`spyfall_rooms/${roomCode}`).once("value", (snap) => {
                const d = snap.val();
                const players = Object.keys((d && d.players) || {});
                if (players.length < 3) return alert("اللعبة تتطلب 3 لاعبين على الأقل!");
                db.ref(`spyfall_rooms/${roomCode}`).update({
                    status: "playing",
                    location: locations[Math.floor(Math.random() * locations.length)],
                    spy: players[Math.floor(Math.random() * players.length)],
                    endTime: Date.now() + 480000,
                    chat: null,
                    turn: pickTurn(players)
                });
            });
        });
    };

    /* =========================================================
       5- لعبة كودنيمز (Codenames)
       ========================================================= */
    GAMES.codenames = function openCodenames() {
        const wordsPool = ["أسد","بحر","قمر","شمس","جبل","نار","ثلج","قلب","عين","سيف","درع","تاج","ذهب","فضة","نحاس","سفينة","طائرة","سيارة","قطار","حصان","صقر","نسر","حمامة","شجرة","وردة","تفاحة","موز","برتقال","عنب","بطيخ","باب","شباك","كرسي","طاولة","قلم","كتاب","دفتر","مدرسة","جامعة","مستشفى","طبيب","مهندس","معلم","جندي","شرطي","لص","سجن","قصر","كوخ","خيمة","صحراء","غابة","نهر","بحيرة","محيط","جزيرة","قارة","كوكب","نجمة","مجرة","صاروخ","عالم","مختبر","دواء","سم","عسل","سكر","ملح","خبز","لحم","دجاج","سمك","عظم","دم","جلد","شعر","أنف","أذن","فم","سن","لسان","يد","قدم","رأس","عقل","روح","شبح","مارد","جني","ساحر","ملك","ملكة","أمير","أميرة","فارس","فيل","زرافة","قرد","تمساح","ثعبان","غزال","ذئب","ثعلب","أرنب","قطة","كلب","فأر","بقرة","غنمة","ماعز","دلفين","حوت","قرش","أخطبوط","عنكبوت","عقرب","ذبابة","نحلة","نملة","فراشة","بطريق","طاووس","بومة","خفاش","سلحفاة","ضفدع","نعامة","طائر","ديناصور","سماء","أرض","هواء","تراب","رمل","صخرة","حصى","طين","غيم","مطر","رعد","برق","عاصفة","إعصار","زلزال","بركان","واحة","وادي","جرف","شاطئ","موج","شعاع","ظل","نور","ظلام","فضاء","نيزك","ضباب","ندى","جليد","سكين","شوكة","ملعقة","صحن","كأس","إبريق","فنجان","قدر","مقلاة","فرن","ثلاجة","غسالة","مكنسة","سرير","وسادة","بطانية","خزانة","مرآة","ساعة","هاتف","حاسوب","شاشة","لوحة","فرشاة","مقص","إبرة","خيط","حبل","سلسلة","قفل","مفتاح","مطرقة","مسمار","منشار","فأس","مجرفة","عجلة","محرك","جرس","بطارية","مصباح","شمعة","عطر","صابون","مشط","قرية","مدينة","عاصمة","دولة","شارع","طريق","جسر","نفق","سكة","محطة","مطار","ميناء","فندق","مطعم","مقهى","دكان","سوق","مجمع","حديقة","مزرعة","ملعب","مسرح","سينما","متحف","مكتبة","مسجد","قلعة","برج","مستودع","مصنع","مخبز","مسبح","خندق","طيار","قبطان","سائق","ميكانيكي","خباز","جزار","طباخ","حلاق","نجار","حداد","خياط","فلاح","صياد","محامي","قاضي","وزير","رئيس","حارس","جاسوس","محقق","غواص","رائد","فنان","كاتب","شاعر","عازف","تمر","تين","زيتون","رمان","ليمون","بصل","ثوم","جزر","خيار","طماطم","بطاطس","أرز","قمح","شعير","ذرة","قهوة","شاي","حليب","جبن","زبدة","بيض","كعك","شوكولاتة","حلوى","نعناع","زعتر","فلفل","بهارات","جوز","لوز","قميص","بنطال","فستان","تنورة","حذاء","جورب","قبعة","نظارة","خاتم","عقد","سوار","حزام","جيب","زر","سحاب","كم","ياقة","وشاح","معطف","عباءة","وقت","يوم","ليلة","أسبوع","شهر","سنة","قرن","صيف","شتاء","ربيع","خريف","حر","برد","رياضة","فن","موسيقى","رقص","غناء","رسم","لون","شكل","خط","نقطة","مربع","دائرة","مثلث","سر","لغز","حلم","كابوس","حب","سلام","نصر","هزيمة","بطل","صديق","صوت","صورة","كاميرا","راديو","تلفاز","رسالة","ورقة","ملف","جريدة","مجلة","تذكرة","جواز","نقود","فاتورة","هدية"];
        const botGroups = {
            حيوانات: ["أسد","حصان","فيل","زرافة","قرد","تمساح","ثعبان","غزال","ذئب","ثعلب","أرنب","قطة","كلب","فأر","بقرة","غنمة","ماعز","سلحفاة","ضفدع","ديناصور"],
            طيور: ["صقر","نسر","حمامة","بطريق","طاووس","بومة","خفاش","نعامة","طائر"],
            بحار: ["بحر","سفينة","نهر","بحيرة","محيط","جزيرة","سمك","دلفين","حوت","قرش","أخطبوط","شاطئ","موج","ميناء","قبطان","غواص","صياد"],
            فضاء: ["قمر","شمس","كوكب","نجمة","مجرة","صاروخ","سماء","فضاء","نيزك","شعاع","نور","ظلام"],
            فواكه: ["تفاحة","موز","برتقال","عنب","بطيخ","تمر","تين","رمان","ليمون"],
            طعام: ["عسل","سكر","ملح","خبز","لحم","دجاج","سمك","زيتون","بصل","ثوم","جزر","خيار","طماطم","بطاطس","أرز","قمح","شعير","ذرة","جبن","زبدة","بيض","كعك","شوكولاتة","حلوى"],
            مشروبات: ["قهوة","شاي","حليب","عسل","كأس","إبريق","فنجان","مقهى"],
            جسد: ["قلب","عين","عظم","دم","جلد","شعر","أنف","أذن","فم","سن","لسان","يد","قدم","رأس","عقل"],
            ملابس: ["قميص","بنطال","فستان","تنورة","حذاء","جورب","قبعة","نظارة","خاتم","عقد","سوار","حزام","جيب","زر","سحاب","كم","ياقة","وشاح","معطف","عباءة"],
            مطبخ: ["سكين","شوكة","ملعقة","صحن","كأس","إبريق","فنجان","قدر","مقلاة","فرن","ثلاجة","طباخ","مخبز","خباز"],
            منزل: ["باب","شباك","كرسي","طاولة","سرير","وسادة","بطانية","خزانة","مرآة","غسالة","مكنسة","قفل","مفتاح","مصباح","شمعة"],
            تعليم: ["قلم","كتاب","دفتر","مدرسة","جامعة","معلم","عالم","مختبر","مكتبة","ورقة","ملف"],
            مواصلات: ["سفينة","طائرة","سيارة","قطار","عجلة","محرك","شارع","طريق","جسر","نفق","سكة","محطة","مطار","طيار","سائق"],
            معارك: ["سيف","درع","جندي","فارس","قلعة","برج","خندق","نصر","هزيمة","بطل"],
            ملوك: ["تاج","ذهب","فضة","قصر","ملك","ملكة","أمير","أميرة"],
            طبيعة: ["جبل","نار","ثلج","شجرة","وردة","صحراء","غابة","أرض","هواء","تراب","رمل","صخرة","حصى","طين","غيم","مطر","رعد","برق","عاصفة","إعصار","زلزال","بركان","واحة","وادي"],
            زمن: ["وقت","يوم","ليلة","أسبوع","شهر","سنة","قرن","صيف","شتاء","ربيع","خريف","ساعة"]
        };
        const fallbackClues = ["مجموعة","ترابط","مشترك","اختيار","هدف","مهمة","رموز","تلميح","كلمات","إشارة"];

        if (document.getElementById("codenames-modal")) {
            document.getElementById("codenames-modal").style.setProperty("display", "flex", "important");
            return;
        }

        injectStyle("codenames-styles", `
            #codenames-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 10px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .cn-box { background: #1e293b; border: 2px solid #D4AF37; border-radius: 15px; padding: 15px 18px 20px; width: 100%; max-width: 460px; max-height: 92vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .cn-box::-webkit-scrollbar { width: 5px; } .cn-box::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
            #cn-game-screen { max-width: 720px; padding: 12px 15px 18px; }
            .cn-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #334155; box-sizing: border-box; flex-shrink: 0; }
            .cn-top-brand { color: #D4AF37; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .cn-controls { display: flex; gap: 8px; align-items: center; }
            .cn-icon-btn { color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .cn-icon-btn:hover { color: #D4AF37; border-color: #D4AF37; }
            .cn-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .cn-title { color: #D4AF37; margin: 5px 0 15px; font-size: 21px; }
            .cn-input { width: 100%; padding: 11px; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: white; text-align: center; box-sizing: border-box; font-size: 14px; }
            .cn-input:focus { outline: none; border-color: #D4AF37; }
            .cn-btn { background: #D4AF37; color: #0f172a; border: none; padding: 11px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; box-sizing: border-box; font-size: 14px; }
            .cn-btn:hover { background: #b5952f; }
            .cn-btn-outline { background: transparent; color: #D4AF37; border: 1px solid #D4AF37; }
            .cn-btn-bot { background: #334155; color: #f8fafc; border: 1px dashed #D4AF37; margin-top: 8px; }
            .cn-btn-bot:hover { background: #475569; }
            .cn-hidden { display: none !important; }
            .team-container { display: flex; flex-wrap: wrap; justify-content: space-between; margin-top: 10px; gap: 10px; }
            .team-box { flex: 1 1 45%; min-width: 140px; padding: 12px 8px; border-radius: 10px; box-sizing: border-box; }
            .team-blue { background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.35); }
            .team-red { background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.35); }
            .seat-btn { width: 100%; padding: 9px 5px; margin-top: 7px; border-radius: 6px; border: 1px dashed #475569; background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; font-size: 12px; transition: 0.2s; box-sizing: border-box; }
            .seat-taken { border: 1px solid #D4AF37; background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-weight: bold; cursor: pointer; }
            .cn-turn-banner { padding: 9px 12px; border-radius: 8px; font-size: 15px; font-weight: bold; margin-bottom: 8px; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            .turn-blue-active { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; border: 2px solid #93c5fd; }
            .turn-red-active { background: linear-gradient(135deg, #b91c1c, #ef4444); color: #fff; border: 2px solid #fca5a5; }
            .cn-scoreboard { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 15px; font-weight: bold; padding: 8px 12px; background: #0f172a; border-radius: 8px; border: 1px solid #334155; }
            #cn-timer-box { font-size: 16px; color: #D4AF37; background: #1e293b; padding: 4px 10px; border-radius: 6px; border: 1px solid #475569; min-width: 75px; }
            .timer-danger { color: #ef4444 !important; border-color: #ef4444 !important; animation: blink 0.8s infinite; }
            @keyframes blink { 50% { opacity: 0.4; } }
            .cn-log-banner { background: rgba(255,255,255,0.06); padding: 7px 10px; border-radius: 6px; font-size: 12px; color: #e2e8f0; margin-bottom: 8px; border: 1px solid #475569; min-height: 18px; }
            .clue-banner { background: rgba(212, 175, 55, 0.15); border: 1px solid #D4AF37; padding: 8px 12px; border-radius: 8px; margin: 6px 0; font-weight: bold; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
            .clue-input-area { display: flex; gap: 8px; margin-bottom: 10px; justify-content: center; align-items: center; background: #0f172a; padding: 8px; border-radius: 8px; border: 1px solid #D4AF37; }
            .cn-grid { display: grid; gap: 7px; margin-top: 6px; }
            .grid-25 { grid-template-columns: repeat(5, 1fr); }
            .grid-30 { grid-template-columns: repeat(5, 1fr); }
            .grid-36 { grid-template-columns: repeat(6, 1fr); }
            .cn-card { background: #334155; border: 2px solid #475569; border-radius: 7px; padding: 12px 4px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.15s; display: flex; align-items: center; justify-content: center; min-height: 54px; color: #f8fafc; box-sizing: border-box; word-wrap: break-word; user-select: none; }
            .grid-36 .cn-card { font-size: 12px; padding: 8px 2px; min-height: 48px; }
            .cn-card:hover:not(.revealed-blue):not(.revealed-red):not(.revealed-wrong):not(.revealed-assassin) { background: #475569; border-color: #D4AF37; }
            .spymaster-selected { border: 2px solid #D4AF37 !important; box-shadow: 0 0 10px rgba(212, 175, 55, 0.8); background: #0f172a !important; color: #D4AF37 !important; transform: scale(1.03); }
            .spymaster-assassin { background: #1a0505 !important; border: 2px dashed #ef4444 !important; color: #fca5a5 !important; box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.35); }
            .cn-card.revealed-blue { background: #2563eb !important; border-color: #60a5fa !important; color: white !important; cursor: default; }
            .cn-card.revealed-red { background: #dc2626 !important; border-color: #f87171 !important; color: white !important; cursor: default; }
            .cn-card.revealed-wrong { background: #475569 !important; border-color: #334155 !important; color: #94a3b8 !important; opacity: 0.75; cursor: default; text-decoration: line-through; }
            .cn-card.revealed-assassin { background: #000000 !important; border-color: #ef4444 !important; color: #ef4444 !important; cursor: default; box-shadow: 0 0 15px #ef4444; animation: shake 0.4s; }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @media (max-width: 480px) { .cn-grid { gap: 5px; } .cn-card { padding: 8px 2px; font-size: 11px; min-height: 45px; } .grid-36 .cn-card { font-size: 10px; min-height: 40px; } .cn-turn-banner { font-size: 13px; padding: 7px; } }
        `);

        let playerName = localStorage.getItem("codenames_playerName") || "";
        let roomCode = "";
        let state = "setup";
        let myRole = "";
        let currentTurn = "blue";
        let turnState = "waiting_for_clue";
        let blueScore = 0, redScore = 0, targetScore = 8;
        let selectedCards = [];
        let timerId = null, botTimeout = null;
        let lastBotKey = "";
        let currentBoard = [];
        let isHost = false;

        function cleanup() {
            const db = getDb();
            if (roomCode && db) db.ref("rooms/" + roomCode).off();
            clearInterval(timerId);
            clearTimeout(botTimeout);
            const m = document.getElementById("codenames-modal");
            if (m) m.remove();
            const r = document.getElementById("codenames-restore-btn");
            if (r) r.remove();
            roomCode = ""; state = "setup"; myRole = ""; selectedCards = []; lastBotKey = "";
        }

        window.minimizeCodenames = function () {
            if (state === "playing") return;
            document.getElementById("codenames-modal").style.setProperty("display", "none", "important");
            let rb = document.getElementById("codenames-restore-btn");
            if (rb) {
                rb.style.setProperty("display", "flex", "important");
            } else {
                rb = document.createElement("div");
                rb.id = "codenames-restore-btn";
                rb.innerHTML = '<i class="fas fa-user-secret"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#D4AF37; color:#0f172a; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:26px; transition:0.3s;";
                rb.onclick = function () {
                    document.getElementById("codenames-modal").style.setProperty("display", "flex", "important");
                    this.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        window.closeCodenames = function () {
            if (state === "playing") {
                if (!confirm("هل أنت متأكد من الخروج؟ خروجك الآن سيُعتبر انسحاباً ويخسر فريقك!")) return;
                const db = getDb();
                if (roomCode && db) db.ref("rooms/" + roomCode).update({ status: "forfeited", forfeitedBy: playerName });
            }
            cleanup();
        };

        const topBar = `
            <div class="cn-top-bar">
                <div class="cn-top-brand"><i class="fas fa-user-secret"></i> كودنيمز شات ليل</div>
                <div class="cn-controls">
                    <div class="cn-icon-btn" onclick="toggleRules()" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="cn-icon-btn cn-min-btn" onclick="minimizeCodenames()" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="cn-icon-btn cn-close-btn" onclick="closeCodenames()" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "codenames-modal";
        modal.innerHTML = `
            <div id="cn-name-screen" class="cn-box">
                ${topBar}
                <h2 class="cn-title">مرحباً بك في كودنيمز</h2>
                <input type="text" id="cn-player-name" class="cn-input" placeholder="اكتب اسمك في اللعبة">
                <button id="cn-save-name" class="cn-btn">متابعة</button>
            </div>
            <div id="cn-lobby-screen" class="cn-box cn-hidden">
                ${topBar}
                <h2 class="cn-title">ردهه الانتظار</h2>
                <p id="cn-welcome-msg" style="font-size: 14px; color: #94a3b8; margin-bottom: 18px;"></p>
                <button id="cn-create-room" class="cn-btn">إنشاء غرفة جديدة</button>
                <hr style="border:0; border-top: 1px solid #334155; margin: 15px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/\\D/g, '')" id="cn-room-code" class="cn-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="cn-join-room" class="cn-btn cn-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="cn-seats-screen" class="cn-box cn-hidden">
                ${topBar}
                <h2 class="cn-title" style="font-size: 18px; display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 10px;">
                    غرفة رقم: <span id="display-room-code" style="color:white; letter-spacing: 2px;"></span>
                    <i class="fas fa-copy" id="cn-copy-code" style="font-size: 16px; color: #D4AF37; cursor: pointer;" title="نسخ الكود"></i>
                </h2>
                <div id="cn-host-settings" class="cn-hidden" style="margin-bottom: 8px;">
                    <label style="color:#cbd5e1; font-size:13px;">النقاط المطلوبة للفوز:</label>
                    <select id="cn-target-score-select" class="cn-input" style="width: auto; display: inline-block; padding: 5px 10px; margin: 0 5px 0 0;">
                        <option value="8">8 نقاط (25 بطاقة)</option>
                        <option value="10">10 نقاط (30 بطاقة)</option>
                        <option value="12">12 نقطة (36 بطاقة)</option>
                    </select>
                </div>
                <div class="team-container">
                    <div class="team-box team-blue">
                        <h3 style="color:#3b82f6; margin:0 0 6px 0; font-size:14px;">الفريق الأزرق</h3>
                        <button class="seat-btn" id="seat-blue-spy">رئيس جواسيس (فارغ)</button>
                        <button class="seat-btn" id="seat-blue-op">مُخمن (فارغ)</button>
                    </div>
                    <div class="team-box team-red">
                        <h3 style="color:#ef4444; margin:0 0 6px 0; font-size:14px;">الفريق الأحمر</h3>
                        <button class="seat-btn" id="seat-red-spy">رئيس جواسيس (فارغ)</button>
                        <button class="seat-btn" id="seat-red-op">مُخمن (فارغ)</button>
                    </div>
                </div>
                <button id="cn-fill-bots-btn" class="cn-btn cn-btn-bot cn-hidden">🤖 ملء المقاعد الفارغة ببوتات</button>
                <button id="cn-start-game" class="cn-btn" style="margin-top:12px; opacity:0.5; cursor:not-allowed;" disabled>بدء اللعبة</button>
            </div>
            <div id="cn-game-screen" class="cn-box cn-hidden">
                ${topBar}
                <div id="cn-turn-banner" class="cn-turn-banner turn-blue-active">🔵 الدور الآن: الفريق الأزرق</div>
                <div class="cn-scoreboard">
                    <div style="color:#60a5fa;">الأزرق: <span id="cn-score-blue">0</span> / <span class="cn-target-display">8</span></div>
                    <div id="cn-timer-box">⏱️ <span id="cn-timer-display">00:40</span></div>
                    <div style="color:#f87171;">الأحمر: <span id="cn-score-red">0</span> / <span class="cn-target-display">8</span></div>
                </div>
                <div id="cn-action-log" class="cn-log-banner">بانتظار بدء اللعب...</div>
                <p id="cn-role-indicator" style="font-size: 12px; color: #D4AF37; margin: 0 0 8px 0; font-weight: bold;"></p>
                <div id="cn-clue-display" class="clue-banner cn-hidden">
                    <div style="font-size: 14px;">
                        <span style="color: #D4AF37;">التلميحة: </span>
                        <span id="cn-current-clue-text" style="color: white; margin-left: 5px;"></span>
                    </div>
                    <button id="cn-end-turn-btn" class="cn-btn cn-hidden" style="width: auto; padding: 5px 12px; font-size: 12px; margin: 0; background: #ef4444; color: white;">إنهاء الدور والاكتفاء</button>
                </div>
                <div id="cn-clue-input-area" class="clue-input-area cn-hidden">
                    <input type="text" id="cn-clue-word" class="cn-input" style="margin-bottom: 0; flex: 2; padding: 8px;" placeholder="اكتب تلميحة (كلمة واحدة)">
                    <div style="color: white; font-size: 12px; min-width: 55px;"><span id="cn-clue-count-display" style="color: #D4AF37; font-weight: bold; font-size: 15px;">0</span> بطاقة</div>
                    <button id="cn-send-clue-btn" class="cn-btn" style="margin-bottom: 0; width: auto; flex: 1; padding: 8px 12px;">إرسال</button>
                </div>
                <div id="cn-board" class="cn-grid"></div>
            </div>
            <div id="cn-rules-screen" class="cn-box cn-hidden" style="z-index: 999999;">
                <div class="cn-top-bar">
                    <div class="cn-top-brand"><i class="fas fa-book-open"></i> شرح القوانين</div>
                    <div class="cn-controls"><div class="cn-icon-btn cn-close-btn" onclick="toggleRules()" title="إغلاق"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align: right; font-size: 13px; line-height: 1.65; color: #cbd5e1; margin-bottom: 15px; padding-right: 5px; overflow-y: auto;">
                    <p style="color: #D4AF37; font-weight: bold; margin: 0 0 4px;">🎯 فكرة اللعبة:</p>
                    <p style="margin: 0 0 10px;">البطاقات متاحة للجميع بدون ألوان مسبقة. الفريق الذي يصل إلى عدد النقاط المحدد أولاً يفوز باللعبة.</p>
                    <p style="color: #D4AF37; font-weight: bold; margin: 0 0 4px;">👁️‍🗨️ دور رئيس الجواسيس:</p>
                    <p style="margin: 0 0 10px;">يضغط على البطاقات التي يريد من فريقه معرفتها لتحديدها، ثم يكتب (كلمة واحدة فقط) تدل عليها ويرسلها مرة واحدة في الدور.</p>
                    <p style="color: #D4AF37; font-weight: bold; margin: 0 0 4px;">🕵️ دور المُخمن:</p>
                    <p style="margin: 0 0 10px;">يقرأ التلميحة ويختار البطاقات. كل بطاقة يختارها وتكون مطابقة لما حدده الرئيس تُحسب نقطة فورية للفريق ✅. إذا أخطأ في بطاقة واحدة، يحتفظ الفريق بالنقاط التي جمعها وينتقل الدور للفريق الثاني ❌.</p>
                    <p style="color: #ef4444; font-weight: bold; margin: 0 0 4px;">💣 البطاقة القاتلة (الفخ):</p>
                    <p style="margin: 0 0 10px;">توجد بطاقة قاتلة واحدة في الرقعة يراها (رئيس الجواسيس فقط 💀) وتكون مخفية عن المُخمنين! إذا اختارها المُخمن يخسر فريقه فوراً وتنتهي المباراة.</p>
                    <p style="color: #60a5fa; font-weight: bold; margin: 0 0 4px;">⏱️ المؤقت والبوتات:</p>
                    <p style="margin: 0;">لكل لاعب 40 ثانية فقط في دوره. كما يمكن للمضيف إضافة بوتات ذكية للعب في أي وقت!</p>
                </div>
                <button class="cn-btn" onclick="toggleRules()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("cn-name-screen"),
            lobby: document.getElementById("cn-lobby-screen"),
            seats: document.getElementById("cn-seats-screen"),
            game: document.getElementById("cn-game-screen"),
            rules: document.getElementById("cn-rules-screen")
        };
        let prevScreen = null;

        function showScreen(key, nameVal = "") {
            for (const k in screens) if (k !== "rules") screens[k].classList.add("cn-hidden");
            screens[key].classList.remove("cn-hidden");
            if (key === "lobby") {
                document.getElementById("cn-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#D4AF37; font-weight:bold;">${nameVal}</span> <a href="#" id="cn-edit-name" style="color:#64748b; font-size:12px; margin-right:8px; text-decoration:underline; cursor:pointer;">(تغيير الاسم)</a>`;
                document.getElementById("cn-edit-name").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("codenames_playerName");
                    document.getElementById("cn-player-name").value = nameVal;
                    showScreen("name");
                });
            }
        }

        const isBot = (name) => name && name.startsWith("🤖 بوت");
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        function renderSeat(elId, occupant, label, seatKey, hostFlag) {
            const el = document.getElementById(elId);
            if (!el) return;
            if (occupant) {
                el.innerText = occupant;
                el.classList.add("seat-taken");
                el.onclick = (occupant === playerName || (hostFlag && isBot(occupant)))
                    ? () => getDb().ref("rooms/" + roomCode + "/seats/" + seatKey).set("")
                    : null;
            } else {
                el.innerText = label + " (فارغ)";
                el.classList.remove("seat-taken");
                el.onclick = () => getDb().ref("rooms/" + roomCode + "/seats/" + seatKey).set(playerName);
            }
        }

        function processGuess(cardId, data) {
            const db = getDb();
            const card = data.board[cardId];
            if (!card || card.revealed) return;
            const teamAr = data.turn === "blue" ? "الأزرق" : "الأحمر";
            const opp = data.turn === "blue" ? "red" : "blue";
            const oppAr = opp === "blue" ? "الأزرق" : "الأحمر";

            if (card.isAssassin) {
                db.ref("rooms/" + roomCode).update({
                    [`board/${cardId}/revealed`]: true,
                    [`board/${cardId}/revealedBy`]: "assassin",
                    status: "finished",
                    log: `💀 انفجرت البطاقة القاتلة (${card.word})! خسر الفريق ${teamAr} وفاز الفريق ${oppAr}!`,
                    winnerMsg: `💣 انفجرت البطاقة القاتلة (${card.word}) بوجه الفريق ${teamAr}!\n🏆 الفائز هو الفريق ${oppAr}!`
                });
                return;
            }

            const targets = data.currentClue && data.currentClue.targetCards ? data.currentClue.targetCards : [];
            if (targets.includes(cardId)) {
                const newScore = (data.turn === "blue" ? data.blueScore || 0 : data.redScore || 0) + 1;
                const left = (data.guessesLeft || 1) - 1;
                const upd = {
                    [`board/${cardId}/revealed`]: true,
                    [`board/${cardId}/revealedBy`]: data.turn,
                    [data.turn + "Score"]: newScore,
                    log: `✅ إجابة صحيحة (${card.word})! نقطة لصالح الفريق ${teamAr}.`
                };
                if (left <= 0) {
                    upd.turn = opp; upd.turnState = "waiting_for_clue"; upd.turnDeadline = Date.now() + 40000; upd.currentClue = null;
                    upd.log = `👏 أصاب الفريق ${teamAr} جميع بطاقات التلميحة بنجاح! انتقل الدور للفريق ${oppAr}.`;
                } else {
                    upd.guessesLeft = left; upd.turnDeadline = Date.now() + 40000;
                }
                db.ref("rooms/" + roomCode).update(upd);
            } else {
                db.ref("rooms/" + roomCode).update({
                    [`board/${cardId}/revealed`]: true,
                    [`board/${cardId}/revealedBy`]: "wrong",
                    turn: opp, turnState: "waiting_for_clue", currentClue: null, turnDeadline: Date.now() + 40000,
                    log: `❌ اختيار خاطئ (${card.word})! انتهى دور الفريق ${teamAr} مع احتفاظهم بنقاطهم، وانتقل الدور للفريق ${oppAr}.`
                });
            }
        }

        function listenRoom(code, hostFlag) {
            const db = getDb();
            isHost = hostFlag;
            showScreen("seats");
            document.getElementById("display-room-code").innerText = code;
            document.getElementById("cn-copy-code").onclick = () =>
                navigator.clipboard.writeText("🎮 انضم للغرفة في لعبة كودنيمز!\n🔑 رقم الغرفة: " + code).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));

            const startBtn = document.getElementById("cn-start-game");
            const botsBtn = document.getElementById("cn-fill-bots-btn");
            if (hostFlag) {
                document.getElementById("cn-host-settings").classList.remove("cn-hidden");
                botsBtn.classList.remove("cn-hidden");
                botsBtn.onclick = () => {
                    db.ref("rooms/" + code + "/seats").once("value", (sSnap) => {
                        const st = sSnap.val() || {};
                        const upd = {};
                        if (!st.blueSpy) upd.blueSpy = "🤖 بوت ذكي 1";
                        if (!st.blueOp) upd.blueOp = "🤖 بوت ذكي 2";
                        if (!st.redSpy) upd.redSpy = "🤖 بوت ذكي 3";
                        if (!st.redOp) upd.redOp = "🤖 بوت ذكي 4";
                        db.ref("rooms/" + code + "/seats").update(upd);
                    });
                };
            } else {
                startBtn.innerText = "في انتظار المضيف لبدء اللعبة...";
            }

            db.ref("rooms/" + code).on("value", (snap) => {
                const data = snap.val();
                if (!data) return;
                const seats = data.seats || {};
                let filled = 0;
                renderSeat("seat-blue-spy", seats.blueSpy, "رئيس جواسيس", "blueSpy", hostFlag);
                renderSeat("seat-blue-op", seats.blueOp, "مُخمن", "blueOp", hostFlag);
                renderSeat("seat-red-spy", seats.redSpy, "رئيس جواسيس", "redSpy", hostFlag);
                renderSeat("seat-red-op", seats.redOp, "مُخمن", "redOp", hostFlag);
                if (seats.blueSpy) filled++;
                if (seats.blueOp) filled++;
                if (seats.redSpy) filled++;
                if (seats.redOp) filled++;

                myRole = playerName === seats.blueSpy ? "blueSpy"
                    : playerName === seats.blueOp ? "blueOp"
                    : playerName === seats.redSpy ? "redSpy"
                    : playerName === seats.redOp ? "redOp" : "spectator";

                if (hostFlag && data.status === "waiting") {
                    if (filled === 4) {
                        startBtn.style.opacity = "1"; startBtn.style.cursor = "pointer"; startBtn.disabled = false;
                        startBtn.onclick = () => {
                            const tgt = parseInt(document.getElementById("cn-target-score-select").value) || 8;
                            const count = tgt === 8 ? 25 : tgt === 10 ? 30 : 36;
                            const chosen = shuffle([...wordsPool]).slice(0, count);
                            const trapIdx = Math.floor(Math.random() * count);
                            const board = chosen.map((w, idx) => ({ id: idx, word: w, revealed: false, revealedBy: null, isAssassin: idx === trapIdx }));
                            db.ref("rooms/" + roomCode).update({
                                board, turn: "blue", status: "playing", turnState: "waiting_for_clue",
                                blueScore: 0, redScore: 0, targetScore: tgt, turnDeadline: Date.now() + 40000,
                                log: "🟢 بدأت المباراة! 40 ثانية لرئيس الجواسيس الأزرق لتحديد البطاقات وإرسال التلميحة.",
                                currentClue: null, winnerMsg: null
                            });
                        };
                    } else {
                        startBtn.style.opacity = "0.5"; startBtn.style.cursor = "not-allowed"; startBtn.disabled = true;
                    }
                }

                if (data.status === "playing" && state !== "playing") {
                    state = "playing";
                    document.querySelectorAll(".cn-min-btn").forEach((el) => (el.style.display = "none"));
                    showScreen("game");
                } else if (data.status === "forfeited" || data.status === "finished") {
                    if (data.status === "forfeited") alert(`انتهت اللعبة! اللاعب (${data.forfeitedBy}) انسحب من الغرفة.`);
                    else if (data.winnerMsg) alert(data.winnerMsg);
                    cleanup();
                    return;
                }

                if (data.status === "playing") {
                    currentTurn = data.turn;
                    turnState = data.turnState;
                    blueScore = data.blueScore || 0;
                    redScore = data.redScore || 0;
                    targetScore = data.targetScore || 8;
                    currentBoard = data.board || [];

                    const banner = document.getElementById("cn-turn-banner");
                    const phaseAr = turnState === "waiting_for_clue" ? "رئيس الجواسيس يختار التلميحة" : "المُخمن يختار البطاقات";
                    if (currentTurn === "blue") {
                        banner.className = "cn-turn-banner turn-blue-active";
                        banner.innerHTML = `🔵 دور الفريق الأزرق (${phaseAr})`;
                    } else {
                        banner.className = "cn-turn-banner turn-red-active";
                        banner.innerHTML = `🔴 دور الفريق الأحمر (${phaseAr})`;
                    }

                    const deadline = data.turnDeadline || 0;
                    clearInterval(timerId);
                    timerId = setInterval(() => {
                        const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
                        const disp = document.getElementById("cn-timer-display");
                        if (disp) {
                            const mm = Math.floor(left / 60), ss = left % 60;
                            disp.innerText = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
                            disp.parentElement.classList.toggle("timer-danger", left <= 10);
                        }
                        if (left === 0 && isHost) {
                            clearInterval(timerId);
                            if (data.status !== "playing") return;
                            const nextT = data.turn === "blue" ? "red" : "blue";
                            const curAr = data.turn === "blue" ? "الأزرق" : "الأحمر";
                            const roleAr = data.turnState === "waiting_for_clue" ? "رئيس جواسيس" : "مُخمن";
                            selectedCards = [];
                            db.ref("rooms/" + roomCode).update({
                                turn: nextT, turnState: "waiting_for_clue", currentClue: null, turnDeadline: Date.now() + 40000,
                                log: `⏱️ انتهى وقت ${roleAr} الفريق ${curAr} (40 ثانية)! انتقل الدور للفريق الآخر.`
                            });
                        }
                    }, 500);

                    document.getElementById("cn-score-blue").innerText = blueScore;
                    document.getElementById("cn-score-red").innerText = redScore;
                    document.querySelectorAll(".cn-target-display").forEach((el) => (el.innerText = targetScore));
                    document.getElementById("cn-action-log").innerHTML = data.log || "بدأت اللعبة!";

                    if (isHost) {
                        if (blueScore >= targetScore) {
                            db.ref("rooms/" + roomCode).update({ status: "finished", winnerMsg: "🎉 مبروك! فاز الفريق الأزرق بالوصول إلى " + targetScore + " نقاط!" });
                            return;
                        }
                        if (redScore >= targetScore) {
                            db.ref("rooms/" + roomCode).update({ status: "finished", winnerMsg: "🎉 مبروك! فاز الفريق الأحمر بالوصول إلى " + targetScore + " نقاط!" });
                            return;
                        }
                    }

                    const clueDisp = document.getElementById("cn-clue-display");
                    const clueTxt = document.getElementById("cn-current-clue-text");
                    const endBtn = document.getElementById("cn-end-turn-btn");
                    if (data.currentClue && data.currentClue.word && turnState === "guessing") {
                        clueDisp.classList.remove("cn-hidden");
                        clueTxt.innerText = `${data.currentClue.word} (متبقي: ${data.guessesLeft})`;
                        const canEnd = (currentTurn === "blue" && myRole === "blueOp") || (currentTurn === "red" && myRole === "redOp");
                        endBtn.classList.toggle("cn-hidden", !canEnd);
                    } else {
                        clueDisp.classList.add("cn-hidden");
                    }

                    const renderBoard = (board) => {
                        const boardEl = document.getElementById("cn-board");
                        boardEl.innerHTML = "";
                        boardEl.className = board.length === 25 ? "cn-grid grid-25" : board.length === 30 ? "cn-grid grid-30" : "cn-grid grid-36";
                        const isSpy = myRole === "blueSpy" || myRole === "redSpy";
                        const isOp = myRole === "blueOp" || myRole === "redOp";
                        const isMyTeam = (currentTurn === "blue" && myRole.startsWith("blue")) || (currentTurn === "red" && myRole.startsWith("red"));
                        const clueArea = document.getElementById("cn-clue-input-area");
                        const ind = document.getElementById("cn-role-indicator");

                        if (isSpy && isMyTeam && turnState === "waiting_for_clue") {
                            clueArea.classList.remove("cn-hidden"); clueArea.style.display = "flex";
                            ind.innerText = "دورك كرئيس جواسيس: اضغط على البطاقات لتحديدها، وتجنب بطاقة الفخ المميزة بالجمجمة 💀!";
                            document.getElementById("cn-clue-count-display").innerText = selectedCards.length;
                        } else {
                            clueArea.classList.add("cn-hidden"); clueArea.style.display = "none";
                            if (isSpy) ind.innerText = turnState === "guessing" ? "أنت رئيس الجواسيس - تابع تخمين زميلك في الفريق (الفخ مكشوف لك فقط 💀)." : "أنت رئيس الجواسيس - انتظر دور فريقك (الفخ مكشوف لك فقط 💀).";
                            else if (isOp) ind.innerText = isMyTeam && turnState === "guessing" ? "دورك كمُخمن: اضغط على البطاقات التي يقصدها رئيسك!" : "أنت المُخمن - انتظر دورك.";
                            else ind.innerText = "أنت تشاهد المباراة.";
                        }

                        board.forEach((card) => {
                            const div = document.createElement("div");
                            div.className = "cn-card";
                            div.innerText = card.word;
                            if (card.revealed) {
                                if (card.revealedBy === "assassin") {
                                    div.classList.add("revealed-assassin");
                                    div.innerHTML = `<i class="fas fa-skull" style="margin-left:5px;"></i> ${card.word}`;
                                } else if (card.revealedBy === "blue") div.classList.add("revealed-blue");
                                else if (card.revealedBy === "red") div.classList.add("revealed-red");
                                else div.classList.add("revealed-wrong");
                            } else {
                                if (isSpy && card.isAssassin) {
                                    div.classList.add("spymaster-assassin");
                                    div.innerHTML = `<i class="fas fa-skull" style="margin-left:5px; color:#ef4444;"></i> ${card.word}`;
                                }
                                if (isSpy && isMyTeam && turnState === "waiting_for_clue") {
                                    if (card.isAssassin) {
                                        div.onclick = () => alert("⚠️ احذر! هذه بطاقة الفخ (القاتلة)، لا يمكنك تحديدها لفريقك!");
                                    } else {
                                        if (selectedCards.includes(card.id)) div.classList.add("spymaster-selected");
                                        div.onclick = () => {
                                            selectedCards = selectedCards.includes(card.id)
                                                ? selectedCards.filter((id) => id !== card.id)
                                                : [...selectedCards, card.id];
                                            renderBoard(currentBoard);
                                        };
                                    }
                                } else if (isOp && isMyTeam && turnState === "guessing") {
                                    div.onclick = () => {
                                        const canGuess = (currentTurn === "blue" && myRole === "blueOp") || (currentTurn === "red" && myRole === "redOp");
                                        if (canGuess && turnState === "guessing") {
                                            db.ref("rooms/" + roomCode).once("value", (rSnap) => {
                                                const rd = rSnap.val();
                                                if (rd && rd.status === "playing") processGuess(card.id, rd);
                                            });
                                        }
                                    };
                                }
                            }
                            boardEl.appendChild(div);
                        });
                    };
                    renderBoard(currentBoard);

                    if (isHost) {
                        const activeSeatKey = data.turn === "blue"
                            ? (data.turnState === "waiting_for_clue" ? "blueSpy" : "blueOp")
                            : (data.turnState === "waiting_for_clue" ? "redSpy" : "redOp");
                        if (isBot(seats[activeSeatKey])) {
                            const botKey = `${data.turn}_${data.turnState}_${data.guessesLeft || 0}_${data.blueScore}_${data.redScore}`;
                            if (lastBotKey !== botKey) {
                                lastBotKey = botKey;
                                clearTimeout(botTimeout);
                                botTimeout = setTimeout(() => {
                                    if (data.turnState === "waiting_for_clue") {
                                        const bd = data.board || [];
                                        const avail = bd.filter((c) => !c.revealed && !c.isAssassin);
                                        if (!avail.length) return;
                                        let clueW = "", targets = [];
                                        for (const [grp, gWords] of Object.entries(botGroups)) {
                                            const matches = avail.filter((c) => gWords.includes(c.word));
                                            const onBoard = bd.some((c) => !c.revealed && c.word === grp);
                                            if (matches.length >= 2 && !onBoard && matches.length > targets.length) {
                                                clueW = grp; targets = matches.slice(0, 3).map((c) => c.id);
                                            }
                                        }
                                        if (!targets.length) {
                                            const pick = shuffle([...avail]).slice(0, Math.min(2, avail.length));
                                            targets = pick.map((c) => c.id);
                                            clueW = fallbackClues.find((w) => !bd.some((c) => !c.revealed && c.word === w)) || "هدف";
                                        }
                                        const tAr = data.turn === "blue" ? "الأزرق" : "الأحمر";
                                        db.ref("rooms/" + roomCode).update({
                                            currentClue: { word: clueW, count: targets.length, targetCards: targets },
                                            turnState: "guessing", guessesLeft: targets.length, turnDeadline: Date.now() + 40000,
                                            log: `🤖 أرسل رئيس الفريق ${tAr} التلميحة: (${clueW}) لـ ${targets.length} بطاقات.`
                                        });
                                    } else if (data.turnState === "guessing") {
                                        const bd = data.board || [];
                                        const unrev = bd.filter((c) => !c.revealed);
                                        if (!unrev.length) return;
                                        const targets = data.currentClue && data.currentClue.targetCards ? data.currentClue.targetCards : [];
                                        const good = unrev.filter((c) => targets.includes(c.id));
                                        const cw = data.currentClue ? data.currentClue.word : "";
                                        let pick = null;
                                        if (botGroups[cw]) {
                                            const m = unrev.filter((c) => botGroups[cw].includes(c.word));
                                            if (m.length) pick = m[0];
                                        }
                                        if (!pick) {
                                            if (good.length && Math.random() < 0.75) pick = good[Math.floor(Math.random() * good.length)];
                                            else {
                                                const safe = unrev.filter((c) => !c.isAssassin);
                                                const pool = safe.length ? safe : unrev;
                                                pick = pool[Math.floor(Math.random() * pool.length)];
                                            }
                                        }
                                        if (pick) processGuess(pick.id, data);
                                    }
                                }, 2200);
                            }
                        }
                    }
                }
            });
        }

        window.toggleRules = function () {
            if (screens.rules.classList.contains("cn-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("cn-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("cn-hidden");
                    }
                }
                screens.rules.classList.remove("cn-hidden");
            } else {
                screens.rules.classList.add("cn-hidden");
                if (prevScreen) prevScreen.classList.remove("cn-hidden");
            }
        };

        if (playerName) showScreen("lobby", playerName);

        document.getElementById("cn-save-name").addEventListener("click", () => {
            const val = document.getElementById("cn-player-name").value.trim();
            if (val.length > 1) {
                playerName = val;
                localStorage.setItem("codenames_playerName", val);
                showScreen("lobby", val);
            } else alert("يرجى كتابة اسم صحيح");
        });

        document.getElementById("cn-create-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            roomCode = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref("rooms/" + roomCode).set({
                host: playerName, status: "waiting", turn: "blue", turnState: "waiting_for_clue",
                seats: { blueSpy: "", blueOp: "", redSpy: "", redOp: "" }
            }).then(() => listenRoom(roomCode, true));
        });

        document.getElementById("cn-join-room").addEventListener("click", () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر...");
            const code = document.getElementById("cn-room-code").value.replace(/\D/g, "");
            if (!code) return alert("الرجاء إدخال رقم الغرفة الصحيح.");
            db.ref("rooms/" + code).once("value", (snap) => {
                if (snap.exists()) { roomCode = code; listenRoom(code, false); }
                else alert("رقم الغرفة غير صحيح!");
            });
        });

        document.getElementById("cn-end-turn-btn").addEventListener("click", () => {
            const nextT = currentTurn === "blue" ? "red" : "blue";
            getDb().ref("rooms/" + roomCode).update({
                turn: nextT, turnState: "waiting_for_clue", currentClue: null, turnDeadline: Date.now() + 40000,
                log: `⏹️ اكتفى المُخمن بالنقاط الحالية وأنهى الدور. الدور الآن للفريق ${nextT === "blue" ? "الأزرق" : "الأحمر"}.`
            });
        });

        document.getElementById("cn-send-clue-btn").addEventListener("click", () => {
            if (turnState !== "waiting_for_clue") return alert("تم إرسال التلميحة في هذه المرحلة بالفعل!");
            const clueW = document.getElementById("cn-clue-word").value.trim();
            if (!clueW) return alert("الرجاء كتابة كلمة التلميح!");
            if (clueW.split(/\s+/).length > 1) return alert("عذراً! التلميحة يجب أن تكون (كلمة واحدة فقط) بدون مسافات.");
            if (currentBoard.some((c) => !c.revealed && c.word === clueW)) return alert("عذراً! لا يمكنك استخدام كلمة موجودة حالياً في الرقعة.");
            if (!selectedCards.length) return alert("الرجاء الضغط على البطاقات التي تريد من المُخمن اختيارها أولاً!");
            const tAr = currentTurn === "blue" ? "الأزرق" : "الأحمر";
            const targets = [...selectedCards];
            selectedCards = [];
            document.getElementById("cn-clue-word").value = "";
            getDb().ref("rooms/" + roomCode).update({
                currentClue: { word: clueW, count: targets.length, targetCards: targets },
                turnState: "guessing", guessesLeft: targets.length, turnDeadline: Date.now() + 40000,
                log: `📝 أرسل الرئيس التلميحة: (${clueW}). 40 ثانية للمُخمن ${tAr} لاختيار البطاقات.`
            });
        });
    };

    /* =========================================================
       6- لعبة ارسم وخمّن (Draw & Guess)
       ========================================================= */
    GAMES.draw = function openDraw() {
        const wordsPool = ["أسد","فيل","زرافة","بطريق","أخطبوط","سلحفاة","فراشة","عنكبوت","نحلة","تمساح","كنغر","طاووس","بومة","خفاش","دلفين","قرش","جمل","حصان","أرنب","قنفذ","ثعبان","ضفدع","صقر","ديك","غزال","بيتزا","برجر","آيسكريم","دونات","بطيخ","موز","أناناس","فراولة","عنب","جزر","ذرة","فشار","قهوة","شاي","كيك","شوكولاتة","عسل","سمك مشوي","سوشي","بطاطس","ليمون","تفاحة","خبز","بيض مقلي","مظلة","نظارة","ساعة","مفتاح","قفل","مصباح","شمعة","مقص","كتاب","قلم","كاميرا","جوال","سماعة","تلفزيون","ثلاجة","مكنسة","مرآة","وسادة","سرير","كرسي","مروحة","حقيبة","تاج","سيف","بوصلة","مغناطيس","بالون","هدية","طبلة","جيتار","شمس","قمر","نجمة","بركان","قوس قزح","شلال","صحراء","جزيرة","نخلة","صبار","رجل ثلج","إعصار","برق","سحابة","مطر","جبل","بحر","غابة","صاروخ","كوكب","رائد فضاء","صحن طائر","طائرة","سفينة","غواصة","قطار","دراجة","سيارة إسعاف","منطاد","هليكوبتر","برج إيفل","أهرامات","قلعة","خيمة","منارة","جسر","ملعب","مستشفى","مدرسة","مسجد","طبيب","طباخ","قرصان","شبح","روبوت","مهرج","ساحر","رجل إطفاء","كرة قدم","كرة سلة","تنس","ملاكمة","غوص","تزلج","شطرنج","نرد","تخييم","صيد سمك"];
        const colors = ["#0f172a","#ef4444","#3b82f6","#10b981","#f59e0b","#f97316","#a855f7","#92400e"];
        const sizes = [{ label: "رفيع", v: 3 }, { label: "وسط", v: 7 }, { label: "عريض", v: 14 }];
        const escHtml = (e) => String(e || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
        const cleanKey = (e) => String(e || "").replace(/[.#$\[\]\/]/g, "").trim();
        const normAr = (e) => String(e || "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().replace(/^ال(?=\S{2,})/, "");
        const isClose = (a, b) => {
            if (!a || !b || a === b || Math.abs(a.length - b.length) > 1 || b.length < 4) return false;
            let i = 0, j = 0, diff = 0;
            while (i < a.length && j < b.length) {
                if (a[i] === b[j]) { i++; j++; }
                else {
                    if (++diff > 1) return false;
                    if (a.length > b.length) i++;
                    else if (b.length > a.length) j++;
                    else { i++; j++; }
                }
            }
            return diff + (a.length - i) + (b.length - j) === 1;
        };

        const existing = document.getElementById("draw-game-modal");
        if (existing) {
            existing.style.setProperty("display", "flex", "important");
            const rb = document.getElementById("draw-restore-btn");
            if (rb) rb.style.setProperty("display", "none", "important");
            return;
        }

        injectStyle("draw-game-styles", `
            #draw-game-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(15, 23, 42, 0.96) !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; padding: 8px !important; margin: 0 !important; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; box-sizing: border-box !important; }
            .dg-box { background: #1e293b; border: 2px solid #f59e0b; border-radius: 15px; padding: 12px 15px 15px; width: 100%; max-width: 520px; max-height: 95vh !important; overflow-y: auto !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75); text-align: center; color: #f8fafc; position: relative; box-sizing: border-box; margin: auto !important; display: flex; flex-direction: column; }
            .dg-box::-webkit-scrollbar { width: 5px; } .dg-box::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
            .dg-hidden { display: none !important; }
            .dg-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 8px; margin-bottom: 10px; border-bottom: 1px solid #334155; flex-shrink: 0; }
            .dg-top-brand { color: #f59e0b; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; }
            .dg-controls { display: flex; gap: 7px; align-items: center; }
            .dg-icon-btn { color: #cbd5e1; font-size: 15px; cursor: pointer; transition: 0.2s; background: #0f172a; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #475569; }
            .dg-icon-btn:hover { color: #f59e0b; border-color: #f59e0b; }
            .dg-close-btn:hover { color: #fff; background: #ef4444; border-color: #ef4444; }
            .dg-title { color: #f59e0b; margin: 4px 0 12px; font-size: 20px; }
            .dg-input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #475569; border-radius: 8px; background: #0f172a; color: #fff; text-align: center; box-sizing: border-box; font-size: 14px; }
            .dg-input:focus { outline: none; border-color: #f59e0b; }
            .dg-btn { background: #f59e0b; color: #0f172a; border: none; padding: 10px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; transition: 0.2s; font-size: 14px; box-sizing: border-box; }
            .dg-btn:hover:not([disabled]) { background: #d97706; color: #fff; }
            .dg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .dg-btn-outline { background: transparent; color: #f59e0b; border: 1px solid #f59e0b; }
            .dg-btn-outline:hover:not([disabled]) { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
            .dg-btn-danger { background: #ef4444; color: #fff; }
            .dg-btn-danger:hover:not([disabled]) { background: #dc2626; }
            .dg-player-chip { background: rgba(245, 158, 11, 0.14); border: 1px solid #f59e0b; color: #fde68a; padding: 5px 11px; border-radius: 15px; font-size: 12px; font-weight: bold; }
            .dg-settings-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; background: #0f172a; padding: 8px; border-radius: 8px; border: 1px solid #334155; flex-wrap: wrap; }
            .dg-settings-row select { background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 6px; padding: 5px 8px; font-size: 12px; outline: none; }
            .dg-hud { display: flex; justify-content: space-between; align-items: center; gap: 6px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; font-size: 12px; }
            .dg-timer { background: #1e293b; color: #f59e0b; font-weight: bold; font-family: monospace; font-size: 15px; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; min-width: 44px; }
            .dg-timer-danger { color: #ef4444 !important; border-color: #ef4444 !important; animation: dg-blink 0.8s infinite; }
            @keyframes dg-blink { 50% { opacity: 0.4; } }
            .dg-word-bar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 4px; flex: 1; }
            .dg-char-box { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 22px; border-bottom: 2px solid #f59e0b; color: #fff; font-weight: bold; font-size: 14px; padding: 0 2px; }
            .dg-char-space { width: 10px; }
            .dg-secret-badge { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde68a; padding: 2px 10px; border-radius: 6px; font-weight: bold; font-size: 15px; }
            .dg-mini-scores { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 6px; }
            .dg-mini-scores::-webkit-scrollbar { height: 3px; } .dg-mini-scores::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
            .dg-mini-pill { flex-shrink: 0; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 3px 9px; font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 4px; }
            .dg-mini-pill.is-drawer { border-color: #f59e0b; color: #fde68a; }
            .dg-mini-pill.is-guessed { border-color: #10b981; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
            .dg-canvas-wrap { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #475569; margin-bottom: 8px; touch-action: none; user-select: none; }
            #dg-canvas { width: 100%; height: 100%; display: block; cursor: crosshair; touch-action: none; }
            .dg-canvas-readonly { cursor: default !important; }
            .dg-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.92); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 15px; z-index: 5; gap: 10px; }
            .dg-choices-wrap { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; width: 100%; }
            .dg-choice-btn { background: #1e293b; border: 2px solid #f59e0b; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            .dg-choice-btn:hover { background: #f59e0b; color: #0f172a; transform: scale(1.04); }
            .dg-tools { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px; background: #0f172a; padding: 6px 8px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 8px; }
            .dg-colors { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
            .dg-color-dot { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: 0.15s; box-sizing: border-box; }
            .dg-color-dot.active { border-color: #fff; transform: scale(1.18); box-shadow: 0 0 6px rgba(255,255,255,0.6); }
            .dg-actions { display: flex; gap: 5px; align-items: center; }
            .dg-tool-btn { background: #1e293b; color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; height: 26px; padding: 0 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; }
            .dg-tool-btn.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.12); }
            .dg-tool-btn:hover { border-color: #f59e0b; }
            .dg-chat-box { background: #0f172a; border: 1px solid #334155; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
            .dg-chat-list { height: 115px; overflow-y: auto; padding: 6px 8px; text-align: right; display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
            .dg-chat-list::-webkit-scrollbar { width: 4px; } .dg-chat-list::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
            .dg-msg { padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.04); line-height: 1.4; word-break: break-word; }
            .dg-msg-correct { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; font-weight: bold; border-right: 3px solid #10b981; }
            .dg-msg-hint { background: rgba(245, 158, 11, 0.18); color: #fde68a; font-weight: bold; border-right: 3px solid #f59e0b; }
            .dg-msg-close { background: rgba(249, 115, 22, 0.2); color: #fdba74; font-weight: bold; border-right: 3px solid #f97316; }
            .dg-msg-sys { color: #94a3b8; font-style: italic; text-align: center; background: transparent; font-size: 11px; }
            .dg-chat-input-row { display: flex; gap: 6px; padding: 6px; background: #1e293b; border-top: 1px solid #334155; }
            .dg-chat-input-row input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; font-size: 13px; outline: none; }
            .dg-chat-input-row input:focus { border-color: #f59e0b; }
            .dg-chat-input-row button { background: #f59e0b; color: #0f172a; border: none; border-radius: 6px; padding: 0 14px; font-weight: bold; cursor: pointer; font-size: 13px; }
            .dg-chat-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
            .dg-podium-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; font-size: 14px; }
            .dg-podium-item.rank-1 { border-color: #f59e0b; background: rgba(245, 158, 11, 0.12); font-weight: bold; }
            @media (max-width: 480px) { .dg-box { padding: 10px 12px 12px; } .dg-chat-list { height: 95px; } .dg-color-dot { width: 20px; height: 20px; } }
        `);

        let playerName = cleanKey(localStorage.getItem("draw_playerName") || localStorage.getItem("codenames_playerName") || "");
        let roomCode = "", state = "setup", roomData = null, timerId = null, lastRoundKey = "", lastActionKey = "", prevScreen = null;
        let strokesMap = {}, myGroups = [], isDrawing = false, curColor = colors[0], curSize = sizes[1].v, isEraser = false, ptsBuf = [], curGroup = 0;

        const topBar = `
            <div class="dg-top-bar">
                <div class="dg-top-brand"><i class="fas fa-palette"></i> ارسم وخمّن</div>
                <div class="dg-controls">
                    <div class="dg-icon-btn dg-rules-btn" title="طريقة اللعب"><i class="fas fa-question"></i></div>
                    <div class="dg-icon-btn dg-min-btn" title="تصغير"><i class="fas fa-minus"></i></div>
                    <div class="dg-icon-btn dg-close-btn" title="إغلاق"><i class="fas fa-times"></i></div>
                </div>
            </div>
        `;

        const modal = document.createElement("div");
        modal.id = "draw-game-modal";
        modal.innerHTML = `
            <div id="dg-name-screen" class="dg-box">
                ${topBar}
                <h2 class="dg-title">ارسم وخمّن 🎨</h2>
                <p style="color:#94a3b8; font-size:13px; margin:0 0 14px;">ارسم أو اشرح الكلمة السرية ودع البقية يخمنونها!</p>
                <input type="text" id="dg-player-name" class="dg-input" maxlength="18" placeholder="اكتب اسمك في اللعبة">
                <button id="dg-save-name" class="dg-btn">متابعة</button>
            </div>
            <div id="dg-lobby-screen" class="dg-box dg-hidden">
                ${topBar}
                <h2 class="dg-title">ردهة الانتظار</h2>
                <p id="dg-welcome-msg" style="font-size:14px; color:#94a3b8; margin:0 0 15px;"></p>
                <button id="dg-create-room" class="dg-btn">إنشاء غرفة جديدة 🎨</button>
                <hr style="border:0; border-top:1px solid #334155; margin:14px 0;">
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="dg-room-code" class="dg-input" placeholder="رقم الغرفة (أرقام فقط)">
                <button id="dg-join-room" class="dg-btn dg-btn-outline">انضمام للغرفة</button>
            </div>
            <div id="dg-room-screen" class="dg-box dg-hidden">
                ${topBar}
                <h2 class="dg-title" style="font-size:18px; display:flex; justify-content:center; align-items:center; gap:8px;">
                    غرفة رقم: <span id="dg-display-code" style="color:#fff; letter-spacing:2px;"></span>
                    <i class="fas fa-copy" id="dg-copy-code" style="font-size:16px; color:#f59e0b; cursor:pointer;" title="نسخ الكود"></i>
                </h2>
                <div id="dg-host-settings" class="dg-settings-row dg-hidden">
                    <label style="font-size:12px; color:#cbd5e1; display:flex; align-items:center; gap:5px;">
                        الدورات:
                        <select id="dg-rounds-select">
                            <option value="1">دورة واحدة</option>
                            <option value="2" selected>دورتان</option>
                            <option value="3">3 دورات</option>
                        </select>
                    </label>
                    <label style="font-size:12px; color:#cbd5e1; display:flex; align-items:center; gap:5px;">
                        الوقت:
                        <select id="dg-time-select">
                            <option value="60">60 ثانية</option>
                            <option value="75" selected>75 ثانية</option>
                            <option value="90">90 ثانية</option>
                        </select>
                    </label>
                </div>
                <p style="color:#94a3b8; font-size:12px; margin:0 0 6px;">اللاعبون المتواجدون:</p>
                <div id="dg-players-container" style="display:flex; flex-wrap:wrap; gap:7px; justify-content:center; margin-bottom:14px;"></div>
                <button id="dg-start-game" class="dg-btn dg-hidden">بدء اللعبة 🚀</button>
                <p id="dg-wait-msg" style="color:#94a3b8; font-size:13px; margin:4px 0;">بانتظار المضيف لبدء اللعبة (لاعبين كحد أدنى)...</p>
            </div>
            <div id="dg-game-screen" class="dg-box dg-hidden">
                ${topBar}
                <div class="dg-hud">
                    <div id="dg-timer" class="dg-timer">75</div>
                    <div id="dg-word-bar" class="dg-word-bar"></div>
                    <div id="dg-round-badge" style="color:#94a3b8; font-weight:bold; font-size:11px; white-space:nowrap;">دورة 1/2</div>
                </div>
                <div id="dg-mini-scores" class="dg-mini-scores"></div>
                <div class="dg-canvas-wrap">
                    <canvas id="dg-canvas" width="600" height="375"></canvas>
                    <div id="dg-overlay" class="dg-overlay dg-hidden"></div>
                </div>
                <div id="dg-tools" class="dg-tools dg-hidden">
                    <div class="dg-colors" id="dg-colors-bar"></div>
                    <div class="dg-actions">
                        <button class="dg-tool-btn" id="dg-size-btn" title="حجم الفرشاة"><i class="fas fa-circle" style="font-size:8px;"></i></button>
                        <button class="dg-tool-btn" id="dg-eraser-btn" title="ممحاة"><i class="fas fa-eraser"></i></button>
                        <button class="dg-tool-btn" id="dg-undo-btn" title="تراجع"><i class="fas fa-undo"></i></button>
                        <button class="dg-tool-btn" id="dg-clear-btn" title="مسح الكل" style="color:#f87171;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="dg-chat-box">
                    <div id="dg-chat-list" class="dg-chat-list"></div>
                    <div class="dg-chat-input-row">
                        <input type="text" id="dg-chat-input" maxlength="60" placeholder="اكتب تخمينك هنا...">
                        <button id="dg-chat-send">إرسال</button>
                    </div>
                </div>
            </div>
            <div id="dg-finish-screen" class="dg-box dg-hidden">
                ${topBar}
                <h2 class="dg-title">🏆 النتائج النهائية</h2>
                <div id="dg-podium-list" style="margin-bottom:14px;"></div>
                <div id="dg-host-finish-btns" class="dg-hidden" style="display:flex; gap:8px;">
                    <button id="dg-play-again" class="dg-btn" style="flex:2; margin:0;">لعب مرة أخرى 🔄</button>
                    <button id="dg-end-room" class="dg-btn dg-btn-danger" style="flex:1; margin:0;">إنهاء</button>
                </div>
                <p id="dg-wait-restart" style="color:#94a3b8; font-size:12px;">بانتظار قرار المضيف...</p>
            </div>
            <div id="dg-rules-screen" class="dg-box dg-hidden" style="z-index:999999;">
                <div class="dg-top-bar">
                    <div class="dg-top-brand"><i class="fas fa-book-open"></i> قوانين ارسم وخمّن</div>
                    <div class="dg-controls"><div class="dg-icon-btn dg-close-btn" id="dg-close-rules"><i class="fas fa-times"></i></div></div>
                </div>
                <div style="text-align:right; font-size:13px; line-height:1.65; color:#cbd5e1;">
                    <p style="color:#f59e0b; font-weight:bold; margin:0 0 4px;">🎨 دور الرسّام / الشارح:</p>
                    <p style="margin:0 0 10px;">يختار كلمة من 3 خيارات، ثم يحاول توصيلها للبقية عن طريق <b>الرسم على اللوحة</b> أو كتابة <b>شرح وتلميح مختصر</b> بدون ذكر الكلمة نفسها.</p>
                    <p style="color:#10b981; font-weight:bold; margin:0 0 4px;">💡 دور المخمّنين:</p>
                    <p style="margin:0 0 10px;">اكتب تخمينك في الدردشة. كلما كنت أسرع زادت نقاطك، وتُخفى الإجابة الصحيحة تلقائياً حتى لا تنحرق على البقية.</p>
                    <p style="color:#3b82f6; font-weight:bold; margin:0 0 4px;">⭐ النقاط والتلميحات:</p>
                    <p style="margin:0;">يحصل الرسّام على <b>+25 نقطة</b> عن كل لاعب يعرف الكلمة، ويُكشف حرف مساعدة تلقائياً عند منتصف الوقت.</p>
                </div>
                <button class="dg-btn" style="margin-top:14px;" id="dg-ok-rules">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(modal);
        ensureFirebase();

        const screens = {
            name: document.getElementById("dg-name-screen"),
            lobby: document.getElementById("dg-lobby-screen"),
            room: document.getElementById("dg-room-screen"),
            game: document.getElementById("dg-game-screen"),
            finish: document.getElementById("dg-finish-screen"),
            rules: document.getElementById("dg-rules-screen")
        };

        const showScreen = (key) => {
            Object.keys(screens).forEach((k) => { if (k !== "rules") screens[k].classList.add("dg-hidden"); });
            screens[key].classList.remove("dg-hidden");
            if (key === "lobby") {
                document.getElementById("dg-welcome-msg").innerHTML = `أهلاً بك، <span style="color:#f59e0b; font-weight:bold;">${escHtml(playerName)}</span> <a href="#" id="dg-edit-name" style="color:#64748b; font-size:12px; margin-right:6px;">(تغيير الاسم)</a>`;
                document.getElementById("dg-edit-name").onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem("draw_playerName");
                    document.getElementById("dg-player-name").value = playerName;
                    showScreen("name");
                };
            }
        };

        const toggleRules = () => {
            if (screens.rules.classList.contains("dg-hidden")) {
                for (const k in screens) {
                    if (k !== "rules" && !screens[k].classList.contains("dg-hidden")) {
                        prevScreen = screens[k];
                        screens[k].classList.add("dg-hidden");
                    }
                }
                screens.rules.classList.remove("dg-hidden");
            } else {
                screens.rules.classList.add("dg-hidden");
                if (prevScreen) prevScreen.classList.remove("dg-hidden");
            }
        };

        const canvas = document.getElementById("dg-canvas");
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        const clearCanvas = () => { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); };
        clearCanvas();

        const drawStroke = (st) => {
            if (!st || !st.p || st.p.length < 2) return;
            ctx.save();
            ctx.strokeStyle = st.c || "#0f172a"; ctx.fillStyle = st.c || "#0f172a";
            ctx.lineWidth = st.s || 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
            const p = st.p;
            if (p.length === 2) {
                ctx.beginPath(); ctx.arc(p[0] / 1000 * canvas.width, p[1] / 1000 * canvas.height, (st.s || 6) / 2, 0, 2 * Math.PI); ctx.fill();
            } else {
                ctx.beginPath(); ctx.moveTo(p[0] / 1000 * canvas.width, p[1] / 1000 * canvas.height);
                for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] / 1000 * canvas.width, p[i + 1] / 1000 * canvas.height);
                ctx.stroke();
            }
            ctx.restore();
        };

        const redrawAll = () => { clearCanvas(); Object.keys(strokesMap).sort().forEach((k) => drawStroke(strokesMap[k])); };
        const getCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            return [
                Math.max(0, Math.min(1000, Math.round((cx - rect.left) / rect.width * 1000))),
                Math.max(0, Math.min(1000, Math.round((cy - rect.top) / rect.height * 1000)))
            ];
        };
        const canDraw = () => roomData && roomData.status === "drawing" && roomData.drawer === playerName;

        const flushPoints = (keepLast = false) => {
            const db = getDb();
            if (!ptsBuf.length || !roomCode || !db) return;
            db.ref(`draw_rooms/${roomCode}/strokes`).push().set({
                c: isEraser ? "#ffffff" : curColor,
                s: isEraser ? 2.2 * curSize : curSize,
                g: curGroup,
                p: ptsBuf.slice()
            });
            if (!myGroups.includes(curGroup)) myGroups.push(curGroup);
            ptsBuf = keepLast && ptsBuf.length >= 2 ? ptsBuf.slice(ptsBuf.length - 2) : [];
        };

        const onDown = (e) => {
            if (!canDraw()) return;
            e.preventDefault();
            if (canvas.setPointerCapture && e.pointerId !== undefined) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
            isDrawing = true;
            curGroup = Date.now() + Math.floor(999 * Math.random());
            const [x, y] = getCoords(e);
            ptsBuf = [x, y];
            drawStroke({ c: isEraser ? "#ffffff" : curColor, s: isEraser ? 2.2 * curSize : curSize, p: [x, y] });
        };

        const onMove = (e) => {
            if (!isDrawing || !canDraw()) return;
            e.preventDefault();
            const [x, y] = getCoords(e);
            const lx = ptsBuf[ptsBuf.length - 2], ly = ptsBuf[ptsBuf.length - 1];
            if (Math.hypot(x - lx, y - ly) < 7) return;
            drawStroke({ c: isEraser ? "#ffffff" : curColor, s: isEraser ? 2.2 * curSize : curSize, p: [lx, ly, x, y] });
            ptsBuf.push(x, y);
            if (ptsBuf.length >= 56) flushPoints(true);
        };

        const onUp = () => { if (isDrawing) { isDrawing = false; if (ptsBuf.length) flushPoints(false); } };

        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        canvas.addEventListener("touchstart", (e) => { if (canDraw()) e.preventDefault(); }, { passive: false });

        const detachListeners = () => {
            const db = getDb();
            if (roomCode && db) {
                db.ref(`draw_rooms/${roomCode}/state`).off();
                db.ref(`draw_rooms/${roomCode}/strokes`).off();
                db.ref(`draw_rooms/${roomCode}/chat`).off();
            }
            clearInterval(timerId);
        };

        const cleanup = () => {
            detachListeners();
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            const m = document.getElementById("draw-game-modal");
            if (m) m.remove();
            const r = document.getElementById("draw-restore-btn");
            if (r) r.remove();
            roomCode = ""; state = "setup"; roomData = null;
        };

        const minimize = () => {
            if (["choosing", "drawing", "round_end"].includes(state)) return;
            modal.style.setProperty("display", "none", "important");
            let rb = document.getElementById("draw-restore-btn");
            if (rb) rb.style.setProperty("display", "flex", "important");
            else {
                rb = document.createElement("div");
                rb.id = "draw-restore-btn";
                rb.innerHTML = '<i class="fas fa-palette"></i>';
                rb.style.cssText = "position:fixed; bottom:100px; right:20px; background:#f59e0b; color:#0f172a; width:56px; height:56px; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:2147483647; font-size:24px; transition:0.3s;";
                rb.onclick = () => {
                    modal.style.setProperty("display", "flex", "important");
                    rb.style.setProperty("display", "none", "important");
                };
                document.body.appendChild(rb);
            }
        };

        const closeModal = () => {
            if (!["choosing", "drawing", "round_end"].includes(state) || confirm("خروجك سيخرجك من الجولة الحالية. متأكد؟")) {
                const db = getDb();
                if (roomCode && db && roomData) {
                    const others = Object.keys(roomData.players || {}).filter((p) => p !== playerName);
                    if (!others.length) db.ref(`draw_rooms/${roomCode}`).remove();
                    else {
                        const upd = { [`players/${playerName}`]: null };
                        if (roomData.host === playerName) upd.host = others[0];
                        db.ref(`draw_rooms/${roomCode}/state`).update(upd);
                    }
                }
                cleanup();
            }
        };

        modal.querySelectorAll(".dg-rules-btn").forEach((el) => (el.onclick = toggleRules));
        modal.querySelectorAll(".dg-min-btn").forEach((el) => (el.onclick = minimize));
        modal.querySelectorAll(".dg-close-btn").forEach((el) => { if (el.id !== "dg-close-rules") el.onclick = closeModal; });
        document.getElementById("dg-close-rules").onclick = toggleRules;
        document.getElementById("dg-ok-rules").onclick = toggleRules;

        const colorsBar = document.getElementById("dg-colors-bar");
        colors.forEach((c, idx) => {
            const dot = document.createElement("div");
            dot.className = "dg-color-dot" + (idx === 0 ? " active" : "");
            dot.style.background = c;
            dot.onclick = () => {
                isEraser = false; curColor = c;
                document.getElementById("dg-eraser-btn").classList.remove("active");
                colorsBar.querySelectorAll(".dg-color-dot").forEach((d) => d.classList.remove("active"));
                dot.classList.add("active");
            };
            colorsBar.appendChild(dot);
        });

        let sizeIdx = 1;
        const sizeBtn = document.getElementById("dg-size-btn");
        const updateSizeIcon = () => { sizeBtn.innerHTML = `<i class="fas fa-circle" style="font-size:${[6, 10, 14][sizeIdx]}px;"></i>`; };
        updateSizeIcon();
        sizeBtn.onclick = () => { curSize = sizes[(sizeIdx = (sizeIdx + 1) % sizes.length)].v; updateSizeIcon(); };
        document.getElementById("dg-eraser-btn").onclick = function () { isEraser = !isEraser; this.classList.toggle("active", isEraser); };
        document.getElementById("dg-undo-btn").onclick = () => {
            if (!canDraw() || !myGroups.length) return;
            const grp = myGroups.pop();
            const del = {};
            Object.entries(strokesMap).forEach(([k, v]) => { if (v && v.g === grp) del[k] = null; });
            if (Object.keys(del).length) getDb().ref(`draw_rooms/${roomCode}/strokes`).update(del);
        };
        document.getElementById("dg-clear-btn").onclick = () => {
            if (canDraw()) { myGroups = []; getDb().ref(`draw_rooms/${roomCode}/strokes`).set(null); }
        };

        const chatList = document.getElementById("dg-chat-list");
        const appendMsg = (m) => {
            const div = document.createElement("div");
            if (m.type === "correct") { div.className = "dg-msg dg-msg-correct"; div.innerHTML = `🎉 <b>${escHtml(m.name)}</b> عرف الكلمة! (+${m.pts} نقطة)`; }
            else if (m.type === "hint") { div.className = "dg-msg dg-msg-hint"; div.innerHTML = `💡 <b>شرح الرسّام:</b> ${escHtml(m.text)}`; }
            else if (m.type === "close") { div.className = "dg-msg dg-msg-close"; div.innerHTML = `🔥 <b>قريب جداً!</b> (${escHtml(m.text)}) - حاول مرة أخرى`; }
            else if (m.type === "sys") { div.className = "dg-msg dg-msg-sys"; div.textContent = m.text; }
            else { div.className = "dg-msg"; div.innerHTML = `<b style="color:#f59e0b;">${escHtml(m.name)}:</b> ${escHtml(m.text)}`; }
            chatList.appendChild(div);
            chatList.scrollTop = chatList.scrollHeight;
        };

        const sendChat = () => {
            const inp = document.getElementById("dg-chat-input");
            const txt = inp.value.trim();
            if (!txt || !roomData || roomData.status !== "drawing") return;
            const db = getDb();
            const isDrawer = roomData.drawer === playerName;
            const nTxt = normAr(txt), nWord = normAr(roomData.word);
            if (isDrawer) {
                const parts = nWord.split(" ").filter((w) => w.length >= 2);
                if (nTxt.includes(nWord) || parts.some((w) => w.length >= 3 && nTxt.includes(w))) {
                    alert("⚠️ لا يمكنك كتابة الكلمة السرية نفسها داخل الشرح!");
                    return;
                }
                db.ref(`draw_rooms/${roomCode}/chat`).push({ type: "hint", name: playerName, text: txt });
                inp.value = "";
                return;
            }
            if (roomData.guessed && roomData.guessed[playerName]) { inp.value = ""; return; }
            inp.value = "";
            if (nTxt === nWord) {
                const secLeft = Math.max(0, Math.ceil((roomData.roundEnd - Date.now()) / 1000));
                const rt = roomData.roundTime || 75;
                const pts = Math.max(40, Math.round(40 + 80 * (secLeft / rt)));
                db.ref(`draw_rooms/${roomCode}/state/guessed/${playerName}`).set(pts);
                db.ref(`draw_rooms/${roomCode}/state/scores/${playerName}`).transaction((v) => (v || 0) + pts);
                db.ref(`draw_rooms/${roomCode}/state/scores/${roomData.drawer}`).transaction((v) => (v || 0) + 25);
                db.ref(`draw_rooms/${roomCode}/chat`).push({ type: "correct", name: playerName, pts });
            } else if (isClose(nTxt, nWord)) {
                appendMsg({ type: "close", text: txt });
            } else {
                db.ref(`draw_rooms/${roomCode}/chat`).push({ type: "guess", name: playerName, text: txt });
            }
        };
        document.getElementById("dg-chat-send").onclick = sendChat;
        document.getElementById("dg-chat-input").addEventListener("keypress", (e) => { if (e.key === "Enter") sendChat(); });

        const pickThreeWords = (used = []) => {
            let pool = wordsPool.filter((w) => !used.includes(w));
            if (pool.length < 3) pool = [...wordsPool];
            const res = [];
            while (res.length < 3 && pool.length) res.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            return res;
        };

        const startTurn = (order, turnIdx, round, maxRounds, roundTime, usedWords) => {
            const db = getDb();
            db.ref(`draw_rooms/${roomCode}/strokes`).set(null);
            db.ref(`draw_rooms/${roomCode}/chat`).set(null);
            db.ref(`draw_rooms/${roomCode}/state`).update({
                status: "choosing", order, turnIdx, round, maxRounds, roundTime,
                drawer: order[turnIdx], choices: pickThreeWords(usedWords), word: "",
                hintIndices: [], hintRevealed: false, guessed: null,
                roundKey: `${round}_${turnIdx}_${Date.now()}`, chooseDeadline: Date.now() + 15000
            });
        };

        const pickWord = (w) => {
            if (!roomData) return;
            const db = getDb();
            const used = Array.isArray(roomData.usedWords) ? [...roomData.usedWords, w] : [w];
            const rt = roomData.roundTime || 75;
            db.ref(`draw_rooms/${roomCode}/state`).update({
                status: "drawing", word: w, usedWords: used, roundEnd: Date.now() + 1000 * rt,
                hintIndices: [], hintRevealed: false, guessed: null
            });
            db.ref(`draw_rooms/${roomCode}/chat`).push({ type: "sys", text: `🎨 بدأ (${roomData.drawer}) الرسم/الشرح! خمّنوا الكلمة` });
        };

        const endTurn = () => { if (roomData) getDb().ref(`draw_rooms/${roomCode}/state`).update({ status: "round_end", nextDeadline: Date.now() + 5500 }); };

        const advanceTurn = () => {
            if (!roomData) return;
            const db = getDb();
            const players = Object.keys(roomData.players || {});
            if (players.length < 2) { db.ref(`draw_rooms/${roomCode}/state`).update({ status: "finished" }); return; }
            const order = (roomData.order || players).filter((p) => players.includes(p));
            players.forEach((p) => { if (!order.includes(p)) order.push(p); });
            let idx = (roomData.turnIdx || 0) + 1;
            let rnd = roomData.round || 1;
            if (idx >= order.length) { idx = 0; rnd++; }
            if (rnd > (roomData.maxRounds || 2)) db.ref(`draw_rooms/${roomCode}/state`).update({ status: "finished" });
            else startTurn(order, idx, rnd, roomData.maxRounds || 2, roomData.roundTime || 75, roomData.usedWords || []);
        };

        const renderWordBar = (d) => {
            const bar = document.getElementById("dg-word-bar");
            if (d.status === "choosing") { bar.innerHTML = `<span style="color:#94a3b8; font-size:12px;">جاري اختيار الكلمة...</span>`; return; }
            const w = d.word || "";
            if (d.drawer === playerName || (d.guessed && d.guessed[playerName]) || d.status === "round_end") {
                bar.innerHTML = `<span class="dg-secret-badge">${escHtml(w)}</span>`;
                return;
            }
            const hints = d.hintIndices || [];
            let html = "";
            for (let i = 0; i < w.length; i++) {
                html += w[i] === " " ? '<span class="dg-char-space"></span>' : `<span class="dg-char-box">${hints.includes(i) ? escHtml(w[i]) : ""}</span>`;
            }
            html += `<span style="color:#94a3b8; font-size:11px; margin-right:6px;">(${w.replace(/\s+/g, "").length})</span>`;
            bar.innerHTML = html;
        };

        const listenRoom = (code) => {
            const db = getDb();
            roomCode = code; state = "waiting"; showScreen("room");
            document.getElementById("dg-display-code").innerText = code;
            document.getElementById("dg-copy-code").onclick = () =>
                navigator.clipboard.writeText(`🎨 انضم للغرفة في لعبة ارسم وخمّن!\n🔑 رقم الغرفة: ${code}`).then(() => alert("تم نسخ الرسالة! جاهزة للإرسال"));

            const stRef = db.ref(`draw_rooms/${code}/strokes`);
            stRef.on("child_added", (s) => { const v = s.val(); if (v) { strokesMap[s.key] = v; drawStroke(v); } });
            stRef.on("child_removed", (s) => { delete strokesMap[s.key]; redrawAll(); });
            db.ref(`draw_rooms/${code}/chat`).on("child_added", (s) => { const v = s.val(); if (v) appendMsg(v); });

            db.ref(`draw_rooms/${code}/state`).on("value", (snap) => {
                const d = snap.val();
                if (!d) { if (state !== "setup" && state !== "lobby") { alert("تم إغلاق الغرفة."); cleanup(); } return; }
                roomData = d;
                const isHost = d.host === playerName;
                const players = Object.keys(d.players || {});
                const scores = d.scores || {};

                if (d.status === "waiting") {
                    if (state !== "waiting") { state = "waiting"; modal.querySelectorAll(".dg-min-btn").forEach((el) => (el.style.display = "")); showScreen("room"); }
                    document.getElementById("dg-players-container").innerHTML = players.map((p) => `<div class="dg-player-chip">${escHtml(p)}${p === d.host ? " 👑" : ""}</div>`).join("");
                    document.getElementById("dg-start-game").classList.toggle("dg-hidden", !isHost);
                    document.getElementById("dg-host-settings").classList.toggle("dg-hidden", !isHost);
                    document.getElementById("dg-wait-msg").classList.toggle("dg-hidden", isHost);
                    return;
                }

                if (d.status === "finished") {
                    clearInterval(timerId); state = "finished";
                    modal.querySelectorAll(".dg-min-btn").forEach((el) => (el.style.display = ""));
                    showScreen("finish");
                    const sorted = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
                    const medals = ["🥇", "🥈", "🥉"];
                    document.getElementById("dg-podium-list").innerHTML = sorted.map((p, idx) =>
                        `<div class="dg-podium-item ${idx === 0 ? "rank-1" : ""}"><span>${medals[idx] || idx + 1 + "."} ${escHtml(p)}</span><span style="color:#f59e0b; font-weight:bold;">${scores[p] || 0} نقطة</span></div>`
                    ).join("");
                    document.getElementById("dg-host-finish-btns").classList.toggle("dg-hidden", !isHost);
                    document.getElementById("dg-wait-restart").classList.toggle("dg-hidden", isHost);
                    return;
                }

                if (!["choosing", "drawing", "round_end"].includes(state)) {
                    showScreen("game");
                    modal.querySelectorAll(".dg-min-btn").forEach((el) => (el.style.display = "none"));
                }
                state = d.status;
                if (d.roundKey && d.roundKey !== lastRoundKey) { lastRoundKey = d.roundKey; strokesMap = {}; myGroups = []; clearCanvas(); chatList.innerHTML = ""; }
                document.getElementById("dg-round-badge").innerText = `دورة ${d.round || 1}/${d.maxRounds || 2}`;
                renderWordBar(d);

                const guessed = d.guessed || {};
                document.getElementById("dg-mini-scores").innerHTML = players.map((p) => {
                    const cls = p === d.drawer ? "is-drawer" : guessed[p] ? "is-guessed" : "";
                    const ico = p === d.drawer ? "🎨" : guessed[p] ? "✅" : "👤";
                    return `<div class="dg-mini-pill ${cls}">${ico} ${escHtml(p)}: <b>${scores[p] || 0}</b></div>`;
                }).join("");

                const isDrawer = d.drawer === playerName;
                const overlay = document.getElementById("dg-overlay");
                const tools = document.getElementById("dg-tools");
                const inp = document.getElementById("dg-chat-input");
                const btn = document.getElementById("dg-chat-send");
                canvas.classList.toggle("dg-canvas-readonly", !(isDrawer && d.status === "drawing"));
                tools.classList.toggle("dg-hidden", !(isDrawer && d.status === "drawing"));

                if (d.status === "choosing") {
                    overlay.classList.remove("dg-hidden"); inp.disabled = true; btn.disabled = true;
                    if (isDrawer) {
                        const ch = d.choices || [];
                        overlay.innerHTML = `<div style="color:#f59e0b; font-weight:bold; font-size:15px;">🎨 دورك! اختر كلمة لترسمها أو تشرحها:</div>
                            <div class="dg-choices-wrap">${ch.map((w, i) => `<button class="dg-choice-btn" data-idx="${i}">${escHtml(w)}</button>`).join("")}</div>`;
                        overlay.querySelectorAll(".dg-choice-btn").forEach((b) => { b.onclick = () => pickWord(ch[parseInt(b.dataset.idx, 10)]); });
                    } else {
                        overlay.innerHTML = `<i class="fas fa-palette fa-bounce" style="font-size:34px; color:#f59e0b;"></i><div style="font-size:14px; color:#e2e8f0;">يقوم <b>${escHtml(d.drawer)}</b> باختيار كلمة الآن...</div>`;
                    }
                } else if (d.status === "drawing") {
                    overlay.classList.add("dg-hidden");
                    if (isDrawer) { inp.disabled = false; btn.disabled = false; inp.placeholder = "اختياري: اكتب شرح أو تلميح بدون ذكر الكلمة..."; btn.innerText = "تلميح 💡"; }
                    else if (guessed[playerName]) { inp.disabled = true; btn.disabled = true; inp.placeholder = "أحسنت! بانتظار بقية اللاعبين ✅"; btn.innerText = "تم"; }
                    else { inp.disabled = false; btn.disabled = false; inp.placeholder = "اكتب تخمينك هنا..."; btn.innerText = "إرسال"; }
                    if (isHost) {
                        const guessers = players.filter((p) => p !== d.drawer);
                        const drawerGone = !players.includes(d.drawer);
                        const allGuessed = guessers.length > 0 && guessers.every((p) => guessed[p]);
                        const endKey = `end_${d.roundKey}`;
                        if ((drawerGone || allGuessed) && lastActionKey !== endKey) { lastActionKey = endKey; setTimeout(endTurn, 700); }
                    }
                } else if (d.status === "round_end") {
                    overlay.classList.remove("dg-hidden"); inp.disabled = true; btn.disabled = true;
                    const cnt = Object.keys(guessed).length;
                    overlay.innerHTML = `<div style="color:#94a3b8; font-size:13px;">انتهى الدور! الكلمة كانت:</div>
                        <div style="color:#f59e0b; font-size:24px; font-weight:900;">${escHtml(d.word)}</div>
                        <div style="color:#cbd5e1; font-size:12px;">${cnt > 0 ? `عرفها ${cnt} من اللاعبين 👏` : "لم يتمكن أحد من تخمينها 😅"}</div>`;
                }

                clearInterval(timerId);
                const tick = () => {
                    const dl = d.status === "choosing" ? d.chooseDeadline : d.status === "drawing" ? d.roundEnd : d.nextDeadline;
                    const left = Math.max(0, Math.ceil((dl - Date.now()) / 1000));
                    const tEl = document.getElementById("dg-timer");
                    if (tEl) { tEl.innerText = left; tEl.classList.toggle("dg-timer-danger", d.status === "drawing" && left <= 12); }
                    if (isHost) {
                        if (d.status === "drawing" && !d.hintRevealed && d.word && d.word.length >= 3) {
                            const half = Math.floor((d.roundTime || 75) / 2);
                            const hKey = `hint_${d.roundKey}`;
                            if (left <= half && lastActionKey !== hKey) {
                                lastActionKey = hKey;
                                const idxs = [];
                                for (let i = 0; i < d.word.length; i++) if (d.word[i] !== " ") idxs.push(i);
                                if (idxs.length) db.ref(`draw_rooms/${roomCode}/state`).update({ hintIndices: [idxs[Math.floor(Math.random() * idxs.length)]], hintRevealed: true });
                            }
                        }
                        if (left <= 0) {
                            const toKey = `timeout_${d.status}_${d.roundKey}`;
                            if (lastActionKey === toKey) return;
                            lastActionKey = toKey;
                            if (d.status === "choosing") pickWord((d.choices && d.choices[0]) || wordsPool[0]);
                            else if (d.status === "drawing") endTurn();
                            else if (d.status === "round_end") advanceTurn();
                        }
                    }
                };
                tick();
                timerId = setInterval(tick, 500);
            });
        };

        document.getElementById("dg-room-code").addEventListener("input", function () { this.value = this.value.replace(/\D/g, ""); });
        document.getElementById("dg-save-name").onclick = () => {
            const val = cleanKey(document.getElementById("dg-player-name").value);
            if (val.length < 2) return alert("يرجى كتابة اسم صحيح (حرفين على الأقل).");
            playerName = val; localStorage.setItem("draw_playerName", val); showScreen("lobby");
        };
        document.getElementById("dg-create-room").onclick = () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر.. حاول بعد ثانية.");
            const code = Math.floor(10000 + 90000 * Math.random()).toString();
            db.ref(`draw_rooms/${code}/state`).set({ host: playerName, status: "waiting", players: { [playerName]: true }, scores: { [playerName]: 0 } })
                .then(() => listenRoom(code));
        };
        document.getElementById("dg-join-room").onclick = () => {
            const db = getDb();
            if (!db) return alert("جاري الاتصال بالسيرفر.. حاول بعد ثانية.");
            const code = document.getElementById("dg-room-code").value.replace(/\D/g, "");
            if (!code) return alert("أدخل رقم الغرفة.");
            db.ref(`draw_rooms/${code}/state`).once("value", (snap) => {
                const d = snap.val();
                if (!d || d.status === "finished") return alert("الغرفة غير موجودة أو منتهية!");
                db.ref(`draw_rooms/${code}/state/players/${playerName}`).set(true);
                db.ref(`draw_rooms/${code}/state/scores/${playerName}`).transaction((v) => v || 0);
                listenRoom(code);
            });
        };
        document.getElementById("dg-start-game").onclick = () => {
            if (!roomData) return;
            const players = Object.keys(roomData.players || {});
            if (players.length < 2) return alert("اللعبة تتطلب لاعبين على الأقل!");
            const rds = parseInt(document.getElementById("dg-rounds-select").value, 10) || 2;
            const rt = parseInt(document.getElementById("dg-time-select").value, 10) || 75;
            const sc = {};
            players.forEach((p) => (sc[p] = 0));
            getDb().ref(`draw_rooms/${roomCode}/state/scores`).set(sc);
            startTurn(players, 0, 1, rds, rt, []);
        };
        document.getElementById("dg-play-again").onclick = () => {
            if (!roomData) return;
            const sc = {};
            Object.keys(roomData.players || {}).forEach((p) => (sc[p] = 0));
            const db = getDb();
            db.ref(`draw_rooms/${roomCode}/strokes`).set(null);
            db.ref(`draw_rooms/${roomCode}/chat`).set(null);
            db.ref(`draw_rooms/${roomCode}/state`).update({ status: "waiting", scores: sc, usedWords: [] });
        };
        document.getElementById("dg-end-room").onclick = () => {
            if (confirm("إنهاء الغرفة للجميع؟")) getDb().ref(`draw_rooms/${roomCode}`).remove();
        };

        playerName ? showScreen("lobby") : showScreen("name");
    };

    /* =========================================================
       المُشغّل والزارع الموحّد لجميع الأزرار الستة (مراقب واحد فقط)
       ========================================================= */
    const BUTTON_DEFS = [
        { id: "codenames-game-btn", key: "codenames", title: "لعبة كودنيمز (Codenames)", icon: "fa-user-secret", color: "#D4AF37", shadow: "rgba(212, 175, 55, 0.2)" },
        { id: "spyfall-game-btn",   key: "spyfall",   title: "لعبة الجاسوس (Spyfall)",   icon: "fa-mask",        color: "#10b981", shadow: "rgba(16, 185, 129, 0.2)" },
        { id: "bank-game-btn",      key: "bank",      title: "لعبة البنك",               icon: "fa-university",  color: "#3b82f6", shadow: "rgba(59, 130, 246, 0.2)" },
        { id: "bomb-game-btn",      key: "bomb",      title: "القنبلة الموقوتة",         icon: "fa-bomb",        color: "#ef4444", shadow: "rgba(239, 68, 68, 0.2)" },
        { id: "stopbus-game-btn",   key: "stopbus",   title: "تحدي الحروف",              icon: "fa-pen-fancy",   color: "#b76e79", shadow: "rgba(183, 110, 121, 0.2)" },
        { id: "draw-game-btn",      key: "draw",      title: "ارسم وخمّن",               icon: "fa-palette",     color: "#f59e0b", shadow: "rgba(245, 158, 11, 0.22)" }
    ];

    function injectAllButtons() {
        const list = document.getElementById("games-list");
        if (!list) return;

        const frag = document.createDocumentFragment();
        let added = 0;

        for (let i = 0; i < BUTTON_DEFS.length; i++) {
            const def = BUTTON_DEFS[i];
            if (document.getElementById(def.id)) continue;
            const btn = document.createElement("button");
            btn.className = "modern-classic-game-item";
            btn.id = def.id;
            btn.innerHTML =
                `<div class="modern-classic-game-content">` +
                    `<div class="modern-classic-game-icon-wrapper" style="background:#0f172a; color:${def.color}; box-shadow:0 2px 8px ${def.shadow};">` +
                        `<i class="fas ${def.icon}" style="font-size:20px;"></i>` +
                    `</div>` +
                    `<span class="modern-classic-game-title" style="font-weight:bold;">${def.title}</span>` +
                `</div>` +
                `<i class="fas fa-chevron-left modern-classic-game-chevron"></i>`;
            btn.addEventListener("click", GAMES[def.key]);
            frag.appendChild(btn);
            added++;
        }

        if (!added) return;
        if (list.children.length > 1) list.insertBefore(frag, list.children[1]);
        else list.appendChild(frag);
    }

    injectAllButtons();

    let obsTimer = null;
    const observer = new MutationObserver(() => {
        const list = document.getElementById("games-list");
        if (!list || document.getElementById("draw-game-btn")) return;
        clearTimeout(obsTimer);
        obsTimer = setTimeout(injectAllButtons, 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
