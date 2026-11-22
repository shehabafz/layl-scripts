!function(){"use strict";
if(window.lailCinemaLoaded)return;
window.lailCinemaLoaded=!0;

const TMDB_KEY="4ea87fc327950000b34025bb18140a5c";
const ADMIN_PATH="lail_cinema/admin";

const DEFAULT_SERVERS=[
  {
    id:"srv_default",
    name:"السيرفر الأساسي",
    movie:"https://vidsrc.me/embed/movie?tmdb={id}",
    tv:"https://vidsrc.me/embed/tv?tmdb={id}&season={s}&episode={e}"
  }
];

const DEFAULT_SETTINGS={
  enabled:!0,
  disabledMsg:"سينما ليل متوقفة مؤقتاً للصيانة. نعود قريباً 🍿",
  allowParties:!0,
  allowReactions:!0,
  allowMiniPlayer:!0,
  allowGuests:!0,
  allowUserServerSwitch:!0,
  defaultServerId:"srv_default",
  servers:DEFAULT_SERVERS,
  maxRooms:0,
  maxPlayersPerRoom:0,
  reactionCooldown:1,
  customReactions:"😂,😱,❤️,🔥",
  bannerText:"",
  safeMode:!1,
  minRating:0,
  blockedGenres:[]
};

if(!document.getElementById("lail-cinema-style")){
  let c=document.createElement("style");
  c.id="lail-cinema-style";
  c.textContent=`.lail-cinema-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(8,8,10,0.98);z-index:99998;display:none;justify-content:center;align-items:center;backdrop-filter:blur(15px);direction:rtl;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.lail-cinema-content{background:#0b0b0e;width:95%;max-width:1400px;height:92vh;border-radius:20px;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;overflow:hidden;color:#fff;box-shadow:0 30px 60px rgba(0,0,0,0.9);position:relative}
.lail-cinema-header{padding:16px 26px;display:flex;justify-content:space-between;align-items:center;background:rgba(11,11,14,0.95);border-bottom:1px solid rgba(255,255,255,0.05);z-index:10;flex-shrink:0;gap:10px}
.lail-cinema-header h3{margin:0;font-size:1.55rem;font-weight:900;color:#e50914;display:flex;align-items:center;gap:10px;letter-spacing:1px;text-shadow:0 2px 10px rgba(229,9,20,0.3)}
.lail-header-controls{display:flex;align-items:center;gap:10px;flex-shrink:0}
.lail-adguide-btn{background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.4);color:#6ee7b7;height:36px;padding:0 13px;border-radius:20px;font-size:.84rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:.2s;font-family:inherit;white-space:nowrap}
.lail-adguide-btn:hover{background:rgba(16,185,129,0.28);color:#fff}
.lail-close-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;width:38px;height:38px;border-radius:50%;font-size:1.2rem;cursor:pointer;transition:.3s;display:flex;justify-content:center;align-items:center;flex-shrink:0}
.lail-close-btn:hover{background:#e50914;border-color:#e50914;transform:rotate(90deg)}
.lail-cinema-nav{display:flex;padding:0 30px;gap:20px;background:#0b0b0e;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;flex-wrap:wrap}
.lail-cinema-tabs{display:flex;gap:25px;overflow-x:auto;scrollbar-width:none}
.lail-cinema-tabs::-webkit-scrollbar{display:none}
.lail-c-tab{padding:20px 5px;color:#888;cursor:pointer;font-size:1.05rem;font-weight:bold;border-bottom:3px solid transparent;transition:.3s;white-space:nowrap}
.lail-c-tab:hover{color:#fff}
.lail-c-tab.active{color:#fff;border-bottom-color:#e50914}
.lail-c-actions{display:flex;gap:15px;align-items:center;flex-wrap:wrap}
.lail-btn-sidebar,.lail-btn-party{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:9px 18px;border-radius:8px;cursor:pointer;font-weight:bold;transition:.2s;display:flex;align-items:center;gap:8px;white-space:nowrap}
.lail-btn-sidebar:hover,.lail-btn-party:hover{background:rgba(255,255,255,0.1)}
.lail-btn-party{color:#3b82f6;border-color:rgba(59,130,246,0.3)}
.lail-btn-party:hover{background:rgba(59,130,246,0.1)}
.lail-c-search-area{display:flex;gap:10px;align-items:center;position:relative}
.lail-c-search-area input{height:40px;padding:0 15px 0 40px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);color:#fff;outline:none;transition:.3s;width:220px;font-family:inherit}
.lail-c-search-area input:focus{border-color:#e50914;width:280px;background:rgba(0,0,0,0.6);box-shadow:0 0 15px rgba(229,9,20,0.2)}
.lail-search-icon{position:absolute;left:15px;color:#aaa;pointer-events:none}
.lail-cinema-banner{margin:14px 30px 0;padding:11px 16px;border-radius:12px;background:linear-gradient(135deg,rgba(229,9,20,0.18),rgba(212,175,55,0.16));border:1px solid rgba(212,175,55,0.38);color:#fef3c7;font-size:.93rem;font-weight:600;display:none;align-items:center;gap:10px;line-height:1.5}
.lail-cinema-off-banner{margin:10px 30px 0;padding:8px 14px;border-radius:10px;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.45);color:#fecaca;font-size:.86rem;font-weight:bold;text-align:center;display:none}
.lail-event-strip{margin:16px 30px 22px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,rgba(74,9,26,0.55),rgba(18,20,36,0.92));border:1px solid rgba(212,175,55,0.4);display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;box-shadow:0 10px 25px rgba(0,0,0,0.4)}
.lail-event-cd{background:rgba(0,0,0,0.45);border:1px solid rgba(212,175,55,0.35);color:#D4AF37;padding:7px 14px;border-radius:10px;font-weight:900;font-size:1.05rem;direction:ltr;white-space:nowrap}
.lail-poll-box{margin:0 30px 28px;padding:16px 20px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(212,175,55,0.3)}
.lail-poll-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-top:12px}
.lail-poll-opt{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:9px;cursor:pointer;transition:.2s;text-align:right;color:#fff;font-family:inherit;position:relative;overflow:hidden}
.lail-poll-opt:hover{border-color:#D4AF37}
.lail-poll-opt.voted{border-color:#D4AF37;background:rgba(212,175,55,0.12)}
.lail-poll-opt img{width:42px;height:62px;object-fit:cover;border-radius:6px;flex-shrink:0}
.lail-featured-badge{position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#D4AF37,#b59226);color:#111;padding:3px 8px;border-radius:6px;font-size:.72rem;font-weight:900;z-index:2;max-width:75%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.6)}
.lail-server-select{background:rgba(20,22,36,0.88);color:#fff;border:1px solid rgba(255,255,255,0.22);border-radius:8px;height:36px;padding:0 10px;font-size:.82rem;font-weight:bold;outline:none;cursor:pointer;backdrop-filter:blur(8px);max-width:130px;flex-shrink:0}
.lail-server-select option{background:#121424;color:#fff}
.lail-sidebar-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:15;display:none;opacity:0;transition:.3s;backdrop-filter:blur(5px)}
.lail-cinema-sidebar{position:absolute;top:0;right:-300px;width:280px;height:100%;background:#0b0b0e;border-left:1px solid rgba(255,255,255,0.05);z-index:16;display:flex;flex-direction:column;transition:right .4s cubic-bezier(0.2,0.8,0.2,1);box-shadow:-10px 0 30px rgba(0,0,0,0.8)}
.lail-sidebar-header{padding:25px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.lail-sidebar-header h4{margin:0;color:#fff;font-size:1.2rem}
.lail-genre-list{flex:1;overflow-y:auto;padding:15px 0;scroll-behavior:smooth}
.lail-genre-list::-webkit-scrollbar{width:6px}
.lail-genre-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
.lail-genre-item{padding:14px 30px;color:#999;cursor:pointer;transition:.2s;border-right:3px solid transparent;font-size:1rem;display:flex;align-items:center;gap:12px}
.lail-genre-item:hover{background:rgba(255,255,255,0.03);color:#fff}
.lail-genre-item.active{background:linear-gradient(90deg,rgba(229,9,20,0.1) 0%,transparent 100%);color:#e50914;border-right-color:#e50914;font-weight:bold}
.lail-cinema-main{display:flex;flex:1;overflow:hidden;position:relative}
.lail-cinema-body{flex:1;overflow-y:auto;padding-bottom:50px;background:#0b0b0e;scroll-behavior:smooth;position:relative;height:100%}
.lail-cinema-body::-webkit-scrollbar{width:8px}
.lail-cinema-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
.lail-netflix-view{display:block;padding-top:20px}
.lail-row-container{margin-bottom:40px;padding:0 30px}
.lail-row-title{font-size:1.3rem;font-weight:bold;margin-bottom:18px;color:#fff;display:flex;align-items:center;gap:10px;border-right:4px solid #e50914;padding-right:12px;text-shadow:0 2px 4px rgba(0,0,0,0.5)}
.lail-row-scroller{display:flex;gap:18px;overflow-x:auto;padding-bottom:20px;scroll-behavior:smooth;scrollbar-width:none}
.lail-row-scroller::-webkit-scrollbar{display:none}
.lail-grid-view{display:none}
.lail-grid-header{padding:30px 30px 15px;font-size:1.4rem;font-weight:bold;color:#fff;display:flex;align-items:center;gap:12px}
.lail-cinema-grid{padding:15px 30px;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:25px;align-content:start}
.lail-movie-card{border-radius:12px;overflow:hidden;cursor:pointer;transition:.3s;position:relative;aspect-ratio:2/3;background:#1a1a1f;flex-shrink:0;box-shadow:0 5px 15px rgba(0,0,0,0.4)}
.lail-row-scroller .lail-movie-card{width:170px}
.lail-movie-card:hover{transform:scale(1.06) translateY(-5px);z-index:2;box-shadow:0 15px 30px rgba(0,0,0,0.9)}
.lail-movie-card::after{content:'';position:absolute;inset:0;border-radius:12px;border:2px solid transparent;transition:.3s;pointer-events:none}
.lail-movie-card:hover::after{border-color:#e50914}
.lail-movie-poster{width:100%;height:100%;object-fit:cover;transition:.3s}
.lail-movie-rate{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.85);color:#fbbf24;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:.8rem;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);z-index:2}
.lail-movie-title-overlay{position:absolute;bottom:0;left:0;width:100%;background:linear-gradient(transparent,rgba(0,0,0,0.9) 40%,#000);padding:30px 12px 12px;color:#fff;font-size:.9rem;font-weight:bold;text-align:center;opacity:0;transition:.3s;text-shadow:0 2px 4px rgba(0,0,0,0.8)}
.lail-movie-card:hover .lail-movie-title-overlay{opacity:1}
.lail-loader{grid-column:1/-1;text-align:center;padding:50px;color:#888;font-size:1.2rem;display:flex;flex-direction:column;align-items:center;gap:15px}
.lail-spinner{width:40px;height:40px;border:4px solid rgba(229,9,20,0.2);border-top-color:#e50914;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.lail-details-modal{position:absolute;top:0;left:0;width:100%;height:100%;background:#0b0b0e;z-index:20;display:none;flex-direction:column;overflow-y:auto;scroll-behavior:smooth}
.lail-details-modal::-webkit-scrollbar{width:8px}
.lail-details-modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
.lail-details-hero{position:relative;width:100%;height:68vh;flex-shrink:0;background:#000}
.lail-details-backdrop{width:100%;height:100%;object-fit:cover;opacity:.6;mask-image:linear-gradient(to bottom,black 20%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,black 20%,transparent 100%)}
.lail-details-layout{display:flex;gap:36px;position:relative;z-index:2;padding:0 50px;margin-top:-32vh;align-items:flex-end;margin-bottom:45px}
.lail-details-poster-wrap{flex-shrink:0;width:245px;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.92);border:1px solid rgba(255,255,255,0.14);display:block;aspect-ratio:2/3;background:#1a1a1f}
.lail-details-poster-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.lail-details-content-wrap{flex:1;min-width:0;text-shadow:0 2px 10px rgba(0,0,0,0.8)}
.lail-details-title{font-size:3rem;margin:0 0 15px 0;color:#fff;font-weight:900;line-height:1.2}
.lail-details-meta{color:#ccc;font-size:1.05rem;margin-bottom:18px;display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.lail-match-score{color:#46d369;font-weight:bold}
.lail-age-rating{border:1px solid rgba(255,255,255,0.4);padding:2px 8px;border-radius:4px;font-size:.9rem;font-weight:bold;color:#fff}
.lail-details-genres{display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap}
.lail-genre-badge{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:.85rem;color:#fff;backdrop-filter:blur(4px)}
.lail-details-overview{font-size:1.1rem;line-height:1.8;color:rgba(255,255,255,0.9);max-width:900px;margin-bottom:22px}
.lail-actions-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:15px}
.lail-play-btn{background:#fff;color:#000;border:none;padding:12px 30px;border-radius:8px;font-size:1.05rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.3s;box-shadow:0 10px 20px rgba(255,255,255,0.2)}
.lail-play-btn:hover{background:#e50914;color:#fff;transform:scale(1.04)}
.lail-fav-btn{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:12px 25px;border-radius:8px;font-size:1.05rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.3s;backdrop-filter:blur(5px)}
.lail-fav-btn:hover{background:rgba(255,255,255,0.2)}
.lail-fav-btn.is-fav{color:#ef4444;border-color:#ef4444;background:rgba(239,68,68,0.1)}
.lail-party-btn{background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.4);padding:12px 25px;border-radius:8px;font-size:1.05rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.3s}
.lail-party-btn:hover{background:#3b82f6;color:#fff}
.lail-section-title{font-size:1.4rem;font-weight:bold;margin-bottom:20px;color:#fff;border-right:4px solid #e50914;padding-right:12px}
.lail-recs-section,.lail-episodes-section{padding:0 50px 50px}
.lail-season-selector{background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.1);padding:12px 20px;border-radius:8px;font-size:1.1rem;outline:none;margin-bottom:25px}
.lail-season-selector option{background:#1a1a1f}
.lail-episode-list{display:flex;flex-direction:column;gap:15px;max-width:1000px}
.lail-episode-item{display:flex;align-items:center;gap:20px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);transition:.3s}
.lail-episode-item:hover{background:rgba(255,255,255,0.08);transform:translateX(-5px)}
.lail-ep-img-wrapper{position:relative;width:160px;height:90px;flex-shrink:0;cursor:pointer;border-radius:8px;overflow:hidden}
.lail-ep-img{width:100%;height:100%;object-fit:cover;transition:.3s}
.lail-ep-img-wrapper:hover .lail-ep-img{filter:brightness(0.7)}
.lail-ep-play-icon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:2.5rem;opacity:0;pointer-events:none;transition:.3s}
.lail-ep-img-wrapper:hover .lail-ep-play-icon{opacity:1}
.lail-ep-info{flex:1}
.lail-ep-title{font-size:1.1rem;font-weight:bold;margin:0 0 5px 0;color:#fff;display:flex;justify-content:space-between}
.lail-player-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:999999;display:none;flex-direction:column;transition:all .3s cubic-bezier(0.2,0.8,0.2,1);box-shadow:0 20px 60px rgba(0,0,0,0.9);direction:rtl}
.lail-player-header{padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:12px;background:linear-gradient(rgba(0,0,0,0.92),transparent);position:absolute;top:0;left:0;width:100%;z-index:21;opacity:0;transition:.3s;box-sizing:border-box}
.lail-player-header h4{margin:0;flex:1;min-width:0;color:#fff;font-size:1.05rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 6px rgba(0,0,0,0.95)}
.lail-player-modal:hover .lail-player-header,.lail-player-modal.is-dragging .lail-player-header{opacity:1}
.lail-player-actions{display:flex;gap:8px;align-items:center;flex-wrap:nowrap;flex-shrink:0;position:relative;z-index:30}
.lail-p-btn{background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.14);color:#fff;width:38px;height:38px;border-radius:50%;font-size:1rem;cursor:pointer;transition:.2s;display:flex;justify-content:center;align-items:center;flex-shrink:0;backdrop-filter:blur(8px)}
.lail-p-btn:hover{background:#fff;color:#000;transform:scale(1.06)}
.lail-p-btn-danger:hover{background:#e50914;color:#fff;border-color:#e50914}
.lail-p-btn-party{background:rgba(59,130,246,0.2);color:#93c5fd;border-color:rgba(59,130,246,0.5);border-radius:8px;width:auto;height:36px;padding:0 12px;font-size:.84rem;font-weight:bold;gap:6px;white-space:nowrap}
.lail-p-btn-party:hover{background:#3b82f6;color:#fff}
.lail-iframe-container{flex:1;width:100%;height:100%;background:#000;position:relative;overflow:hidden}
.lail-iframe-container iframe{width:100%;height:100%;border:none}
.lail-iframe-blocker{position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;display:none;cursor:grabbing;background:transparent}
.lail-player-modal.is-dragging .lail-iframe-blocker{display:block}
.lail-player-modal.mini-mode{top:auto;left:20px;bottom:90px;width:380px;height:215px;border-radius:16px;border:1px solid rgba(255,255,255,0.2);overflow:visible;box-shadow:0 15px 40px rgba(0,0,0,0.9);min-width:250px;min-height:150px;max-width:90vw;max-height:90vh;user-select:none;-webkit-user-select:none}
.lail-player-modal.mini-mode .lail-iframe-container{border-radius:16px;overflow:hidden}
.lail-player-modal.mini-mode .lail-player-header{opacity:1;padding:8px 12px;background:linear-gradient(rgba(0,0,0,0.9),rgba(0,0,0,0.4));cursor:grab;border-radius:16px 16px 0 0}
.lail-player-modal.mini-mode .lail-p-btn{width:30px;height:30px;font-size:.85rem}
.lail-player-modal.mini-mode .lail-p-btn-party{height:30px;font-size:.76rem;padding:0 8px}
.lail-player-modal.mini-mode .lail-server-select{display:none!important}
.lail-player-modal.mini-mode h4{font-size:.9rem;font-weight:normal;pointer-events:none}
.lail-resize-handle{position:absolute;bottom:-5px;left:-5px;width:35px;height:35px;cursor:sw-resize;z-index:60;display:none}
.lail-resize-handle::after{content:'';position:absolute;bottom:8px;left:8px;width:0;height:0;border-bottom:12px solid rgba(255,255,255,0.7);border-right:12px solid transparent;filter:drop-shadow(1px 1px 2px #000)}
.lail-player-modal.mini-mode .lail-resize-handle{display:block}
.lail-resize-handle:hover::after{border-bottom-color:#e50914}
.lail-party-modal{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(8,8,10,0.95);z-index:40;display:none;justify-content:center;align-items:center;backdrop-filter:blur(10px)}
.lail-party-box{background:#121424;border:1px solid #3b82f6;border-radius:16px;padding:30px;width:90%;max-width:420px;box-shadow:0 20px 50px rgba(0,0,0,0.8);text-align:center}
.lail-party-box h2{color:#3b82f6;margin:0 0 15px 0;font-size:1.5rem}
.lail-party-box p{color:#94a3b8;font-size:.95rem;margin-bottom:20px;line-height:1.6}
.lail-party-code-display{background:rgba(0,0,0,0.4);border:1px dashed #3b82f6;padding:15px;border-radius:8px;font-size:2rem;letter-spacing:5px;color:#fff;margin-bottom:20px;font-weight:bold}
.lail-party-input{width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px 15px;border-radius:8px;font-size:1.1rem;text-align:center;letter-spacing:2px;margin-bottom:20px;outline:none;transition:.3s;box-sizing:border-box}
.lail-party-input:focus{border-color:#3b82f6}
.lail-users-list{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:20px;max-height:120px;overflow-y:auto}
.lail-user-chip{background:rgba(255,255,255,0.1);padding:5px 12px;border-radius:15px;font-size:.85rem;color:#e2e8f0;border:1px solid rgba(255,255,255,0.1)}
.lail-user-chip.is-host{border-color:#fbbf24;color:#fbbf24;background:rgba(251,191,36,0.1)}
.lail-share-btn{background:rgba(255,255,255,0.1);border:none;color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:.9rem;transition:.2s;display:flex;align-items:center;gap:6px;flex:1;justify-content:center}
.lail-share-btn:hover{background:rgba(255,255,255,0.2)}
.lail-ag-ov{position:fixed;inset:0;background:rgba(8,10,18,0.9);z-index:2147483644;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .22s ease;direction:rtl;font-family:'Segoe UI',tahoma,sans-serif}
.lail-ag-ov.active{opacity:1}
.lail-ag-box{background:linear-gradient(180deg,rgba(26,29,52,0.99) 0%,rgba(14,16,30,0.99) 100%);border:1px solid rgba(16,185,129,0.42);border-radius:20px;width:93%;max-width:450px;max-height:86vh;max-height:86dvh;padding:18px;box-shadow:0 25px 60px rgba(0,0,0,0.88);transform:scale(0.95) translateY(12px);transition:transform .25s ease;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;color:#f8fafc}
.lail-ag-ov.active .lail-ag-box{transform:scale(1) translateY(0)}
.lail-ag-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08)}
.lail-ag-tabs{display:flex;gap:6px;margin-bottom:12px}
.lail-ag-tab{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#94a3b8;padding:9px 8px;border-radius:10px;font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit;transition:.2s}
.lail-ag-tab.active{background:rgba(16,185,129,0.18);border-color:rgba(16,185,129,0.55);color:#6ee7b7}
.lail-ag-body{overflow-y:auto;-webkit-overflow-scrolling:touch}
.lail-ag-dns{display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(0,0,0,0.42);border:1px dashed rgba(16,185,129,0.55);border-radius:12px;padding:10px 12px;margin:8px 0 12px}
.lail-ag-dns code{color:#6ee7b7;font-size:13.5px;font-weight:800;direction:ltr;letter-spacing:.3px;user-select:all}
.lail-ag-copy{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap}
.lail-ag-step{display:flex;align-items:flex-start;gap:9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:11px;padding:10px 11px;margin-bottom:8px;font-size:12.5px;line-height:1.65;color:#e2e8f0}
.lail-ag-num{width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.22);color:#6ee7b7;font-weight:900;font-size:12px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.lail-ag-tip{background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);color:#fde68a;border-radius:10px;padding:9px 11px;font-size:11.5px;line-height:1.6;margin-top:6px}
#party-restore-btn{position:fixed;bottom:100px;right:20px;background:#e50914;color:#fff;width:56px;height:56px;border-radius:50%;box-shadow:0 4px 15px rgba(0,0,0,0.6);display:none;justify-content:center;align-items:center;cursor:pointer;z-index:2147483647;font-size:24px;transition:.3s;animation:pulse-red 2s infinite}
#party-restore-btn:hover{transform:scale(1.1)}
@keyframes pulse-red{0%{box-shadow:0 0 0 0 rgba(229,9,20,0.7)}70%{box-shadow:0 0 0 10px rgba(229,9,20,0)}100%{box-shadow:0 0 0 0 rgba(229,9,20,0)}}
.lail-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:#121424;border:1px solid #3b82f6;color:#fff;padding:12px 25px;border-radius:30px;font-size:.95rem;font-weight:bold;box-shadow:0 10px 30px rgba(0,0,0,0.7);z-index:2147483647;opacity:0;pointer-events:none;transition:all .4s cubic-bezier(0.2,0.8,0.2,1);text-align:center;max-width:88vw}
.lail-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.lail-continue-card{border:2px solid #e50914}
.lail-ep-badge{position:absolute;top:10px;right:10px;background:#e50914;color:#fff;padding:2px 6px;border-radius:4px;font-size:.8rem;font-weight:bold;z-index:2}
.lail-reactions-bar{position:absolute;bottom:20px;right:20px;display:flex;gap:8px;z-index:50;flex-wrap:wrap;max-width:85%}
.lail-reaction-btn{background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.2);border-radius:50%;width:40px;height:40px;font-size:1.2rem;cursor:pointer;transition:.2s;backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center}
.lail-reaction-btn:hover{transform:scale(1.2);border-color:#fff}
.lail-floating-emoji{position:absolute;bottom:60px;font-size:2rem;z-index:45;pointer-events:none;animation:floatUp 3s ease-out forwards}
@keyframes floatUp{0%{transform:translateY(0) scale(1) rotate(0deg);opacity:1}100%{transform:translateY(-200px) scale(1.5) rotate(20deg);opacity:0}}
@media (max-width:899px){.lail-details-hero{height:38vh}.lail-details-layout{flex-direction:column;align-items:center;text-align:center;padding:0 22px;margin-top:-20vh;gap:18px;margin-bottom:32px}.lail-details-poster-wrap{width:155px;margin:0 auto}.lail-details-title{font-size:1.85rem;margin-bottom:10px}.lail-details-meta,.lail-details-genres{justify-content:center}.lail-details-overview{font-size:.98rem;text-align:center}}
@media (max-width:768px){.lail-cinema-content{width:100%;height:100%;border-radius:0;border:none}.lail-cinema-header{padding:13px 16px}.lail-cinema-header h3{font-size:1.25rem}.lail-adguide-btn{height:33px;padding:0 10px;font-size:.76rem}.lail-cinema-nav{flex-direction:column;align-items:stretch;padding:15px 20px;gap:15px}.lail-cinema-tabs{justify-content:center;gap:10px}.lail-c-tab{padding:10px 5px;font-size:.95rem}.lail-c-actions{flex-direction:row;flex-wrap:nowrap;width:100%;gap:10px}.lail-btn-sidebar,.lail-btn-party{flex:0 0 auto;padding:10px;font-size:.9rem}.lail-c-search-area{flex:1}.lail-c-search-area input{width:100%;max-width:none}.lail-cinema-banner,.lail-cinema-off-banner,.lail-event-strip,.lail-poll-box{margin-left:18px;margin-right:18px}.lail-recs-section,.lail-episodes-section{padding:0 20px 30px}.lail-player-header{padding:10px 12px;gap:8px;opacity:1}.lail-player-header h4{font-size:.9rem}.lail-player-actions{gap:6px}.lail-p-btn{width:34px;height:34px;font-size:.9rem}.lail-p-btn-party{height:34px;padding:0 9px;font-size:.78rem}.lail-server-select{height:34px;font-size:.76rem;max-width:105px;padding:0 6px}.lail-player-modal.mini-mode{width:280px;height:160px;left:10px;bottom:90px}.lail-cinema-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;padding:15px 20px}.lail-row-scroller .lail-movie-card{width:130px}.lail-actions-row{flex-direction:column}.lail-actions-row button{width:100%;justify-content:center}}`;
  (document.head||document.documentElement).appendChild(c)
}

let st={
  adminUsers:[],
  settings:Object.assign({},DEFAULT_SETTINGS),
  featured:{},
  blacklist:{},
  schedule:null,
  poll:null,
  myBan:null,
  listenedBanUser:null,
  globalBound:!1,
  roomsCache:{},
  presenceCache:{},
  bannedCache:{},
  logsCache:[],
  roomsRef:null,
  presenceRef:null,
  myPresenceRef:null,
  countdownTimer:null,
  bootTs:Date.now()
};

const h={
  san:x=>x?String(x).replace(/[.#$\[\]\/]/g,"_").trim():"",
  esc:x=>x?String(x).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]||c):"",
  isGuest:()=>!localStorage.getItem("pc_username"),
  isAdmin(){
    let u=window.lailCinema?.myUsername;
    if(!u||!st.adminUsers.length)return!1;
    let s=h.san(u);
    return st.adminUsers.includes(u)||(s&&st.adminUsers.includes(s))
  },
  getActiveBan(){
    let b=st.myBan;
    if(!b)return null;
    if(b.expiresAt&&Date.now()>=b.expiresAt)return null;
    return b
  },
  banMsg(b){
    let map={full:"تم منعك من استخدام سينما ليل من قبل الإدارة 🚫",party_only:"تم منعك من غرف المشاهدة الجماعية من قبل الإدارة 🚫",reactions_only:"تم كتم التفاعلات عنك داخل السينما 🚫"};
    let msg=map[b.scope]||map.full;
    if(b.reason)msg+=`\nالسبب: ${b.reason}`;
    if(b.expiresAt)msg+=`\nالوقت المتبقي: ${h.formatRemaining(b.expiresAt)}`;
    return msg
  },
  isBlacklisted(id,type){
    if(!id)return!1;
    let bl=st.blacklist||{};
    return Boolean(bl[`${type}_${id}`]||bl[String(id)])
  },
  isGenreBlocked(genreIds){
    let bg=st.settings.blockedGenres||[];
    if(!bg.length||!Array.isArray(genreIds))return!1;
    return genreIds.some(gid=>bg.includes(Number(gid)))
  },
  getServers(){
    let list=st.settings.servers;
    return Array.isArray(list)&&list.length?list:DEFAULT_SERVERS
  },
  getServerObj(srvId){
    let list=h.getServers();
    return list.find(x=>x.id===srvId)||list.find(x=>x.id===st.settings.defaultServerId)||list[0]
  },
  buildEmbedUrl(type,id,s=1,e=1,srvId=null){
    let srv=h.getServerObj(srvId);
    let tpl="movie"===type?srv.movie:srv.tv;
    return(tpl||"").replace(/\{id\}/g,id).replace(/\{s\}/g,s||1).replace(/\{e\}/g,e||1)
  },
  formatDate(ts){
    if(!ts)return"-";
    try{return new Date(ts).toLocaleString("ar-EG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"-"}
  },
  formatRemaining(exp){
    if(!exp)return"دائم";
    let diff=exp-Date.now();
    if(diff<=0)return"منتهي";
    let mins=Math.ceil(diff/6e4);
    if(mins<60)return`${mins} دقيقة`;
    let hrs=Math.floor(mins/60),rm=mins%60;
    if(hrs<24)return rm?`${hrs} س و ${rm} د`:`${hrs} ساعة`;
    let days=Math.floor(hrs/24),rh=hrs%24;
    return rh?`${days} ي و ${rh} س`:`${days} يوم`
  }
};

let APP_HTML=`<div id="lail-cinema-app" class="lail-cinema-overlay"><div class="lail-cinema-content"><div class="lail-cinema-header"><h3><i class="fas fa-film"></i> سينما ليل</h3><div class="lail-header-controls"><button type="button" class="lail-adguide-btn" onclick="window.lailCinema.openAdGuide()"><i class="fas fa-shield-alt"></i><span>إيقاف الإعلانات</span></button><button class="lail-close-btn" onclick="window.lailCinema.close()"><i class="fas fa-times"></i></button></div></div><div class="lail-cinema-nav"><div class="lail-cinema-tabs"><div id="tab-movie" class="lail-c-tab active" onclick="window.lailCinema.switchMainTab('movie')">الأفلام</div><div id="tab-tv" class="lail-c-tab" onclick="window.lailCinema.switchMainTab('tv')">المسلسلات</div><div id="tab-fav" class="lail-c-tab" style="color:#ef4444;" onclick="window.lailCinema.switchMainTab('fav')"><i class="fas fa-heart"></i> مفضلاتي</div></div><div class="lail-c-actions"><button class="lail-btn-sidebar" onclick="window.lailCinema.toggleSidebar()"><i class="fas fa-filter"></i> الأقسام</button><button id="cinema-nav-party-btn" class="lail-btn-party" onclick="window.lailCinema.openPartyJoin()"><i class="fas fa-users"></i> غرف المشاهدة</button><div class="lail-c-search-area"><i class="fas fa-search lail-search-icon"></i><input id="cinema-search-input" type="text" placeholder="بحث سريع..." onkeydown="if(event.key==='Enter') window.lailCinema.executeSearch()"></div></div></div><div id="cinema-admin-off-banner" class="lail-cinema-off-banner">🛑 سينما ليل متوقفة حالياً عن جميع الأعضاء (مفتوحة لك بصلاحية الإدارة فقط)</div><div id="cinema-announcement-banner" class="lail-cinema-banner"><i class="fas fa-bullhorn" style="color:#D4AF37;"></i><span id="cinema-announcement-text"></span></div><div class="lail-cinema-main"><div id="sidebar-overlay" class="lail-sidebar-overlay" onclick="window.lailCinema.toggleSidebar()"></div><div id="cinema-sidebar" class="lail-cinema-sidebar"><div class="lail-sidebar-header"><h4><i class="fas fa-list-ul"></i> التصنيفات</h4><button class="lail-close-btn" onclick="window.lailCinema.toggleSidebar()"><i class="fas fa-times"></i></button></div><div id="sidebar-genres" class="lail-genre-list"></div></div><div id="cinema-main-body" class="lail-cinema-body"><div id="cinema-event-area"></div><div id="cinema-poll-area"></div><div id="cinema-netflix-view" class="lail-netflix-view"></div><div id="cinema-grid-view" class="lail-grid-view"><div id="grid-header" class="lail-grid-header"></div><div id="cinema-grid" class="lail-cinema-grid"></div><div id="cinema-loader" class="lail-loader" style="display:none;"><div class="lail-spinner"></div></div></div></div></div><div id="cinema-details" class="lail-details-modal"><button class="lail-close-btn" style="position:fixed; top:25px; right:25px; z-index:30; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px);" onclick="window.lailCinema.closeDetails()"><i class="fas fa-arrow-right"></i></button><div class="lail-details-hero"><img id="details-backdrop" class="lail-details-backdrop" src=""></div><div class="lail-details-layout"><div id="details-poster-wrap" class="lail-details-poster-wrap"><img id="details-poster" src=""></div><div class="lail-details-content-wrap"><h1 id="details-title" class="lail-details-title"></h1><div class="lail-details-meta"><span class="lail-match-score" id="details-score"></span> <span id="details-date"></span> <span class="lail-age-rating" id="details-age"></span> <span class="lail-runtime" id="details-runtime"></span> <span id="details-rate" style="color:#fbbf24; font-weight:bold;"><i class="fas fa-star"></i></span></div><div id="details-genres" class="lail-details-genres"></div><p id="details-overview" class="lail-details-overview"></p><div id="details-cast" class="lail-details-cast"></div><div class="lail-actions-row"><button id="details-play-btn" class="lail-play-btn"><i class="fas fa-play"></i> تشغيل</button> <button id="details-fav-btn" class="lail-fav-btn" onclick="window.lailCinema.toggleFavorite()"><i class="far fa-heart"></i> أضف للمفضلة</button> <button id="details-party-btn" class="lail-party-btn" onclick="window.lailCinema.createParty()"><i class="fas fa-video"></i> إنشاء مشاهدة جماعية</button></div></div></div><div id="tv-episodes-container" class="lail-episodes-section" style="display:none;"><div class="lail-section-title">الحلقات والمواسم</div><select id="season-selector" class="lail-season-selector" onchange="window.lailCinema.loadSeason(this.value)"></select><div id="episodes-list" class="lail-episode-list"></div></div><div id="recs-container" class="lail-recs-section" style="display:none;"><div class="lail-section-title">قد يعجبك أيضاً</div><div id="recs-scroller" class="lail-row-scroller"></div></div></div><div id="cinema-party-modal" class="lail-party-modal"><div class="lail-party-box"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><h2 id="party-modal-title"><i class="fas fa-users"></i> الانضمام لغرفة</h2><div><button class="lail-close-btn" style="width:30px;height:30px;font-size:1rem; display:inline-flex;" onclick="window.lailCinema.minimizeParty()" title="تصغير للذهاب للشات"><i class="fas fa-minus"></i></button> <button class="lail-close-btn" style="width:30px;height:30px;font-size:1rem; display:inline-flex; margin-right:5px;" onclick="window.lailCinema.leaveParty(true)" title="إغلاق الغرفة"><i class="fas fa-times"></i></button></div></div><div id="party-join-ui"><p>أدخل كود الغرفة الذي أرسله المضيف للانضمام للمشاهدة الجماعية.</p><input type="text" id="party-code-input" class="lail-party-input" placeholder="مثال: 4921" maxlength="6" autocomplete="off"> <button class="lail-party-btn" style="width:100%; justify-content:center;" onclick="window.lailCinema.joinParty()">انضمام للغرفة</button></div><div id="party-wait-ui" style="display:none;"><p id="party-wait-msg">تم إنشاء غرفتك! شارك الكود مع الأعضاء:</p><div id="party-code-display" class="lail-party-code-display">----</div><div style="display:flex; gap:10px; margin-bottom:20px;"><button class="lail-share-btn" onclick="window.lailCinema.copyPartyCode()"><i class="fas fa-copy"></i> انسخ الكود وصغر النافذة لإرساله بالدردشة</button></div><p style="font-size:0.85rem; color:#64748b; margin-bottom:5px;">الأعضاء المتواجدون:</p><div id="party-users-list" class="lail-users-list"></div><button id="party-start-btn" class="lail-play-btn" style="width:100%; justify-content:center; display:none;" onclick="window.lailCinema.startParty()">🚀 بدء العرض للجميع</button><p id="party-guest-wait" style="font-size:0.9rem; color:#fbbf24; display:none;"><i class="fas fa-hourglass-half fa-spin"></i> بانتظار المضيف لبدء الفيلم...</p></div></div></div></div></div><div id="cinema-player" class="lail-player-modal"><div id="player-drag-header" class="lail-player-header"><h4 id="player-title"></h4><div class="lail-player-actions"><select id="lail-player-server-sel" class="lail-server-select" style="display:none;" onchange="window.lailCinema.switchPlayerServer(this.value)" title="تبديل السيرفر"></select><button id="party-sync-btn" class="lail-p-btn lail-p-btn-party" style="display:none;" onclick="window.lailCinema.syncPartyTime()" title="تزامن مع المجموعة"><i class="fas fa-sync-alt"></i> مزامنة</button><button id="party-pause-btn" class="lail-p-btn lail-p-btn-party" style="display:none; color:#fbbf24; border-color:#fbbf24;" onclick="window.lailCinema.hostTogglePause()" title="إيقاف مؤقت للجميع"><i class="fas fa-pause"></i> إيقاف للكل</button><button id="lail-pip-btn" class="lail-p-btn" title="تصغير/تكبير المشغل" onclick="window.lailCinema.toggleMiniPlayer()"><i class="fas fa-compress-arrows-alt"></i></button><button class="lail-p-btn lail-p-btn-danger" title="إغلاق المشغل" onclick="window.lailCinema.closePlayer()"><i class="fas fa-times"></i></button></div></div><div class="lail-iframe-container" id="lail-iframe-host"><div id="iframe-blocker" class="lail-iframe-blocker"></div><iframe id="cinema-iframe" src="" allowfullscreen allow="autoplay; fullscreen"></iframe><div id="party-reactions" class="lail-reactions-bar" style="display:none;"></div></div><div id="lail-resize-handle" class="lail-resize-handle" title="اسحب لتغيير الحجم"></div></div><div id="cinema-toast" class="lail-toast"></div><div id="party-restore-btn" onclick="window.lailCinema.restoreParty()" title="العودة لغرفة المشاهدة"><i class="fas fa-users"></i></div>`;

function injectCinemaBtn(){
  let list=document.querySelector(".modern-classic-list");
  if(list&&!list.querySelector("#btn-lail-cinema")){
    list.insertAdjacentHTML("beforeend",`<button id="btn-lail-cinema" class="modern-classic-item" type="button"><div class="modern-classic-item-content"><div class="modern-classic-icon-wrapper" style="background: rgba(229, 9, 20, 0.1);"><i class="fas fa-video" style="color: #e50914;"></i></div><span class="modern-classic-text">سينما ليل</span></div><i class="fas fa-chevron-left modern-classic-chevron"></i></button>`);
    list.querySelector("#btn-lail-cinema").addEventListener("click",()=>window.lailCinema.init())
  }
  injectAdminBtn()
}

function injectAdminBtn(){
  if(!h.isAdmin()){
    document.querySelectorAll("#btn-lail-cinema-admin").forEach(x=>x.remove());
    return
  }
  document.querySelectorAll(".modern-classic-list").forEach(list=>{
    if(!list||list.querySelector("#btn-lail-cinema-admin"))return;
    let b=document.createElement("button");
    b.type="button";
    b.className="modern-classic-item";
    b.id="btn-lail-cinema-admin";
    b.innerHTML=`<div class="modern-classic-item-content"><div class="modern-classic-icon-wrapper" style="background: linear-gradient(135deg, #450a0a, #991b1b); color: #fbbf24;"><i class="fas fa-film"></i></div><span class="modern-classic-text">لوحة تحكم السينما</span></div><i class="fas fa-chevron-left modern-classic-chevron"></i>`;
    b.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();cinemaAdmin.open()});
    let anchor=list.querySelector("#btn-custom-ids-dash")||list.querySelector("#btn-lail-streak-admin")||list.querySelector("#btn-lail-zajel-admin")||list.querySelector("#btn-lail-cinema");
    anchor?anchor.insertAdjacentElement("afterend",b):list.appendChild(b)
  })
}

const cinemaAdmin={
  activeTab:"rooms",
  pollDraft:[],
  schedDraft:null,
  injectStyles(){
    if(document.getElementById("lail-cinema-admin-styles"))return;
    let s=document.createElement("style");
    s.id="lail-cinema-admin-styles";
    s.innerHTML=`
      .lcma-ov{position:fixed;inset:0;background:rgba(8,10,18,0.92);z-index:2147483645;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .25s ease;direction:rtl;font-family:'Segoe UI',tahoma,sans-serif}
      .lcma-ov.active{opacity:1;visibility:visible}
      .lcma-box{background:linear-gradient(180deg,rgba(28,31,56,0.98) 0%,rgba(14,16,30,0.99) 100%);border:1px solid rgba(212,175,55,0.34);border-radius:20px;width:95%;max-width:650px;max-height:89vh;max-height:89dvh;padding:15px 17px 17px;box-shadow:0 25px 60px rgba(0,0,0,0.88);transform:scale(0.94) translateY(15px);opacity:0;transition:all .3s cubic-bezier(0.2,0.8,0.2,1);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;color:#f8fafc}
      .lcma-ov.active .lcma-box{transform:scale(1) translateY(0);opacity:1}
      .lcma-head,.lcma-stats,.lcma-tabs{flex-shrink:0!important}
      .lcma-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.08)}
      .lcma-title{display:flex;align-items:center;gap:8px;color:#D4AF37;font-weight:800;font-size:15.5px}
      .lcma-ctrl{background:rgba(255,255,255,0.09);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;transition:.2s}
      .lcma-ctrl:hover{background:rgba(255,255,255,0.18)}
      .lcma-ctrl-x:hover{background:rgba(239,68,68,0.85)}
      .lcma-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
      .lcma-stat{background:rgba(0,0,0,0.32);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:7px 4px;text-align:center}
      .lcma-stat-v{font-size:13px;font-weight:800;color:#D4AF37;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lcma-stat-l{font-size:10px;color:#94a3b8;margin-top:2px}
      .lcma-tabs{display:flex;height:42px;min-height:42px;background:rgba(0,0,0,0.34);border-radius:12px;margin-bottom:11px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border:1px solid rgba(255,255,255,0.05)}
      .lcma-tabs::-webkit-scrollbar{display:none}
      .lcma-tab{flex:1 0 auto;background:transparent;color:#94a3b8;border:none;padding:0 10px;height:100%;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:bold;cursor:pointer;transition:.2s;white-space:nowrap}
      .lcma-tab.active{background:rgba(212,175,55,0.16);color:#D4AF37;border-bottom:2px solid #D4AF37}
      .lcma-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding-left:4px;margin-left:-4px;-webkit-overflow-scrolling:touch}
      .lcma-body::-webkit-scrollbar{width:5px}
      .lcma-body::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.35);border-radius:10px}
      .lcma-view{display:none}
      .lcma-view.active{display:block}
      .lcma-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 12px;margin-bottom:9px;text-align:right}
      .lcma-card-t{font-size:12.5px;font-weight:700;color:#D4AF37;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
      .lcma-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
      .lcma-g2{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
      .lcma-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .lcma-inp{width:100%;background:rgba(0,0,0,0.34);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:8px 10px;border-radius:10px;font-family:inherit;font-size:12.5px;outline:none;box-sizing:border-box;transition:border .2s}
      .lcma-inp:focus{border-color:#D4AF37}
      .lcma-inp option{background:#16182c;color:#fff}
      .lcma-lbl{display:block;font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:4px}
      .lcma-btn{border:none;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s;display:inline-flex;align-items:center;justify-content:center;gap:5px}
      .lcma-btn:active{transform:scale(0.97)}
      .lcma-btn-gold{background:linear-gradient(135deg,#D4AF37,#b59226);color:#161824;width:100%}
      .lcma-btn-red{background:linear-gradient(135deg,#e50914,#991b1b);color:#fff;width:100%}
      .lcma-btn-dark{background:rgba(255,255,255,0.08);color:#e2e8f0;border:1px solid rgba(255,255,255,0.08)}
      .lcma-btn-dark:hover{background:rgba(255,255,255,0.15)}
      .lcma-btn-danger{background:rgba(239,68,68,0.16);color:#fca5a5;border:1px solid rgba(239,68,68,0.35)}
      .lcma-btn-danger:hover{background:rgba(239,68,68,0.35);color:#fff}
      .lcma-btn-ok{background:rgba(16,185,129,0.18);color:#6ee7b7;border:1px solid rgba(16,185,129,0.35)}
      .lcma-btn-info{background:rgba(56,189,248,0.16);color:#7dd3fc;border:1px solid rgba(56,189,248,0.3)}
      .lcma-btn-warn{background:rgba(245,158,11,0.18);color:#fcd34d;border:1px solid rgba(245,158,11,0.35)}
      .lcma-mini{padding:5px 8px;font-size:11px;border-radius:8px;width:auto}
      .lcma-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700}
      .lcma-t-gold{background:rgba(212,175,55,0.18);color:#D4AF37}
      .lcma-t-green{background:rgba(16,185,129,0.16);color:#34d399}
      .lcma-t-red{background:rgba(239,68,68,0.18);color:#f87171}
      .lcma-t-blue{background:rgba(56,189,248,0.18);color:#38bdf8}
      .lcma-t-gray{background:rgba(148,163,184,0.18);color:#94a3b8}
      .lcma-srow{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.24);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:9px 11px;margin-bottom:7px;gap:10px}
      .lcma-sw{position:relative;width:42px;height:22px;flex-shrink:0}
      .lcma-sw input{opacity:0;width:0;height:0}
      .lcma-sl{position:absolute;cursor:pointer;inset:0;background:#334155;border-radius:22px;transition:.25s}
      .lcma-sl:before{content:"";position:absolute;height:16px;width:16px;right:3px;bottom:3px;background:#fff;border-radius:50%;transition:.25s}
      .lcma-sw input:checked+.lcma-sl{background:#10b981}
      .lcma-sw input:checked+.lcma-sl:before{transform:translateX(-20px)}
      .lcma-subtabs{display:flex;gap:5px;margin-bottom:9px;flex-wrap:wrap}
      .lcma-subtab{flex:1;min-width:85px;background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:7px 6px;font-size:11px;font-weight:bold;cursor:pointer;font-family:inherit}
      .lcma-subtab.active{background:rgba(212,175,55,0.16);color:#D4AF37;border-color:rgba(212,175,55,0.45)}
      .lcma-mrow{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:7px 9px;margin-bottom:6px}
      .lcma-mrow img{width:38px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0;background:#1e293b}
      .lcma-chip-chk{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:4px 8px;border-radius:8px;font-size:11px;cursor:pointer}
      @media (max-width:500px){.lcma-box{padding:12px 13px 14px;width:96%}.lcma-g3{grid-template-columns:repeat(2,1fr)}.lcma-stat-v{font-size:11.5px}}
    `;
    document.head.appendChild(s)
  },
  log(action,target,details){
    if(!window.lailCinema.db)return;
    window.lailCinema.db.ref(`${ADMIN_PATH}/logs`).push({
      admin:window.lailCinema.myUsername||"الإدارة",
      action,target:target||"-",details:details||"",
      timestamp:firebase.database.ServerValue.TIMESTAMP
    }).catch(()=>{})
  },
  open(){
    if(!h.isAdmin())return alert("هذه اللوحة متاحة للإدارة فقط.");
    cinemaAdmin.injectStyles();
    let old=document.getElementById("lail-cinema-admin-modal");
    old&&old.remove();
    let ov=document.createElement("div");
    ov.id="lail-cinema-admin-modal";
    ov.className="lcma-ov";
    ov.innerHTML=`
      <div class="lcma-box">
        <div class="lcma-head">
          <div class="lcma-title"><i class="fas fa-film" style="color:#e50914;"></i> لوحة تحكم سينما ليل</div>
          <div class="lcma-row" style="gap:6px;">
            <button type="button" class="lcma-ctrl" id="lcma-open-app" title="فتح السينما"><i class="fas fa-external-link-alt"></i></button>
            <button type="button" class="lcma-ctrl" id="lcma-refresh" title="تحديث"><i class="fas fa-sync-alt"></i></button>
            <button type="button" class="lcma-ctrl lcma-ctrl-x" id="lcma-close" title="إغلاق"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="lcma-stats">
          <div class="lcma-stat"><div class="lcma-stat-v" id="lcma-st-status">...</div><div class="lcma-stat-l">الحالة</div></div>
          <div class="lcma-stat"><div class="lcma-stat-v" id="lcma-st-online">0 / 0</div><div class="lcma-stat-l">متصلون / غرف</div></div>
          <div class="lcma-stat"><div class="lcma-stat-v" id="lcma-st-feat">0</div><div class="lcma-stat-l">اختياراتنا</div></div>
          <div class="lcma-stat"><div class="lcma-stat-v" id="lcma-st-mod">0 / 0</div><div class="lcma-stat-l">حظر / حجب</div></div>
        </div>
        <div class="lcma-tabs">
          <button type="button" class="lcma-tab active" data-mtab="rooms"><i class="fas fa-broadcast-tower"></i> الغرف والرادار</button>
          <button type="button" class="lcma-tab" data-mtab="events"><i class="fas fa-calendar-alt"></i> السهرة والتصويت</button>
          <button type="button" class="lcma-tab" data-mtab="featured"><i class="fas fa-crown"></i> اختياراتنا</button>
          <button type="button" class="lcma-tab" data-mtab="moderation"><i class="fas fa-user-shield"></i> الرقابة والحظر</button>
          <button type="button" class="lcma-tab" data-mtab="servers"><i class="fas fa-server"></i> السيرفرات والمشغّل</button>
          <button type="button" class="lcma-tab" data-mtab="analytics"><i class="fas fa-chart-line"></i> الإحصائيات</button>
          <button type="button" class="lcma-tab" data-mtab="settings"><i class="fas fa-cog"></i> إعدادات وسجل</button>
        </div>
        <div class="lcma-body">
          <div id="lcma-v-rooms" class="lcma-view active">
            <div class="lcma-card" style="border-color:rgba(16,185,129,0.3);">
              <div class="lcma-card-t" style="color:#6ee7b7;"><span><i class="fas fa-eye"></i> المتواجدون داخل السينما الآن</span><span id="lcma-pres-cnt" class="lcma-tag lcma-t-green">0</span></div>
              <div id="lcma-presence-list"></div>
            </div>
            <div class="lcma-card" style="border-color:rgba(212,175,55,0.3);">
              <div class="lcma-card-t"><span><i class="fas fa-crown"></i> إنشاء غرفة سهرة رسمية من الإدارة</span></div>
              <div class="lcma-row" style="margin-bottom:6px;">
                <input type="text" id="lcma-oroom-q" class="lcma-inp" style="flex:1;" placeholder="ابحث عن فيلم/مسلسل لبدء غرفة سهرة رسمية..." autocomplete="off">
                <button type="button" id="lcma-oroom-search" class="lcma-btn lcma-btn-gold lcma-mini" style="padding:8px 12px;"><i class="fas fa-search"></i> بحث</button>
              </div>
              <div id="lcma-oroom-res" style="max-height:170px; overflow-y:auto;"></div>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t">
                <span><i class="fas fa-users" style="color:#38bdf8;"></i> غرف المشاهدة النشطة حالياً</span>
                <button type="button" id="lcma-close-all-rooms" class="lcma-btn lcma-btn-danger lcma-mini"><i class="fas fa-power-off"></i> إغلاق الكل</button>
              </div>
              <div id="lcma-rooms-list"></div>
            </div>
          </div>

          <div id="lcma-v-events" class="lcma-view">
            <div class="lcma-card" style="border-color:rgba(229,9,20,0.4);">
              <div class="lcma-card-t" style="color:#fca5a5;"><span><i class="fas fa-bullhorn"></i> بث إشعار فوري لجميع زوار السينما الآن</span></div>
              <div class="lcma-row">
                <input type="text" id="lcma-live-bc-inp" class="lcma-inp" style="flex:1;" placeholder="مثلاً: 🍿 تبدأ السهرة الآن! كود الغرفة: 4820">
                <button type="button" id="lcma-live-bc-send" class="lcma-btn lcma-btn-red lcma-mini" style="padding:8px 14px;"><i class="fas fa-paper-plane"></i> بث</button>
              </div>
            </div>
            <div class="lcma-card" style="border-color:rgba(212,175,55,0.35);">
              <div class="lcma-card-t"><span><i class="fas fa-ribbon"></i> شريط الإعلان الدائم بأعلى السينما</span></div>
              <div class="lcma-row">
                <input type="text" id="lcma-banner-inp" class="lcma-inp" style="flex:1;" placeholder="اتركه فارغاً لإخفاء الشريط...">
                <button type="button" id="lcma-banner-save" class="lcma-btn lcma-btn-gold lcma-mini" style="padding:8px 13px;">حفظ</button>
              </div>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t">
                <span><i class="fas fa-clock"></i> جدولة سهرة بعدّاد تنازلي</span>
                <button type="button" id="lcma-sched-clear" class="lcma-btn lcma-btn-danger lcma-mini">إلغاء السهرة</button>
              </div>
              <div id="lcma-sched-cur" style="margin-bottom:7px;"></div>
              <div class="lcma-row" style="margin-bottom:6px;">
                <input type="text" id="lcma-sched-q" class="lcma-inp" style="flex:1;" placeholder="ابحث عن فيلم السهرة...">
                <button type="button" id="lcma-sched-search" class="lcma-btn lcma-btn-info lcma-mini" style="padding:8px 11px;"><i class="fas fa-search"></i></button>
              </div>
              <div id="lcma-sched-res" style="max-height:150px; overflow-y:auto; margin-bottom:6px;"></div>
              <div class="lcma-g2" style="margin-bottom:7px;">
                <div><label class="lcma-lbl">موعد السهرة</label><input type="datetime-local" id="lcma-sched-time" class="lcma-inp" dir="ltr"></div>
                <div><label class="lcma-lbl">عنوان/ملاحظة السهرة</label><input type="text" id="lcma-sched-note" class="lcma-inp" placeholder="سهرة الجمعة الملكية 🍿"></div>
              </div>
              <button type="button" id="lcma-sched-save" class="lcma-btn lcma-btn-gold"><i class="fas fa-calendar-check"></i> تفعيل العدّاد التنازلي للجميع</button>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t">
                <span><i class="fas fa-poll"></i> تصويت «فيلم السهرة» التفاعلي</span>
                <button type="button" id="lcma-poll-end" class="lcma-btn lcma-btn-danger lcma-mini">إنهاء التصويت</button>
              </div>
              <div id="lcma-poll-cur" style="margin-bottom:8px;"></div>
              <input type="text" id="lcma-poll-qtxt" class="lcma-inp" style="margin-bottom:6px;" value="🗳️ صوّت لفيلم سهرة الليلة:" placeholder="سؤال التصويت...">
              <div class="lcma-row" style="margin-bottom:6px;">
                <input type="text" id="lcma-poll-sq" class="lcma-inp" style="flex:1;" placeholder="أضف فيلم/مسلسل لخيارات التصويت (2 إلى 4)...">
                <button type="button" id="lcma-poll-sbtn" class="lcma-btn lcma-btn-info lcma-mini" style="padding:8px 11px;"><i class="fas fa-plus"></i> بحث</button>
              </div>
              <div id="lcma-poll-sres" style="max-height:150px; overflow-y:auto; margin-bottom:6px;"></div>
              <div id="lcma-poll-draft" style="margin-bottom:7px;"></div>
              <button type="button" id="lcma-poll-publish" class="lcma-btn lcma-btn-ok" style="width:100%;"><i class="fas fa-rocket"></i> نشر التصويت داخل السينما</button>
            </div>
          </div>

          <div id="lcma-v-featured" class="lcma-view">
            <div class="lcma-card">
              <div class="lcma-card-t"><span><i class="fas fa-plus-circle"></i> تثبيت عمل في «👑 اختيارات إدارة ليل»</span></div>
              <div class="lcma-row" style="margin-bottom:6px;">
                <input type="text" id="lcma-feat-q" class="lcma-inp" style="flex:1;" placeholder="ابحث بالاسم أو رقم TMDB ID..." autocomplete="off">
                <button type="button" id="lcma-feat-search" class="lcma-btn lcma-btn-info lcma-mini" style="padding:8px 12px;"><i class="fas fa-search"></i> بحث</button>
              </div>
              <input type="text" id="lcma-feat-badge" class="lcma-inp" style="margin-bottom:7px;" placeholder="شارة فوق البوستر (مثلاً: ترشيح الإدارة ⭐ / سهرة الليلة 🍿)">
              <div id="lcma-feat-results" style="max-height:200px; overflow-y:auto;"></div>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t"><span><i class="fas fa-crown"></i> الأعمال المثبّتة حالياً</span></div>
              <div id="lcma-feat-list"></div>
            </div>
          </div>

          <div id="lcma-v-moderation" class="lcma-view">
            <div class="lcma-subtabs">
              <button type="button" class="lcma-subtab active" data-msub="bans"><i class="fas fa-user-slash"></i> الحظر</button>
              <button type="button" class="lcma-subtab" data-msub="blacklist"><i class="fas fa-eye-slash"></i> حجب أعمال</button>
              <button type="button" class="lcma-subtab" data-msub="genres"><i class="fas fa-tags"></i> حجب تصنيفات</button>
              <button type="button" class="lcma-subtab" data-msub="inspect"><i class="fas fa-user-check"></i> فحص عضو</button>
            </div>
            <div id="lcma-msub-bans">
              <div class="lcma-card">
                <div class="lcma-card-t"><span>حظر عضو (مؤقت أو دائم)</span></div>
                <div class="lcma-g2" style="margin-bottom:6px;">
                  <div><label class="lcma-lbl">اسم المستخدم (Username)</label><input type="text" id="lcma-ban-user" class="lcma-inp" placeholder="Username"></div>
                  <div>
                    <label class="lcma-lbl">نطاق الحظر</label>
                    <select id="lcma-ban-scope" class="lcma-inp">
                      <option value="full">حظر كامل من السينما</option>
                      <option value="party_only">منع غرف المشاهدة فقط</option>
                      <option value="reactions_only">كتم التفاعلات فقط</option>
                    </select>
                  </div>
                </div>
                <div class="lcma-g2" style="margin-bottom:7px;">
                  <div>
                    <label class="lcma-lbl">المدة</label>
                    <select id="lcma-ban-dur" class="lcma-inp">
                      <option value="permanent">دائم</option>
                      <option value="1h">ساعة</option>
                      <option value="6h">6 ساعات</option>
                      <option value="24h">24 ساعة</option>
                      <option value="3d">3 أيام</option>
                      <option value="7d">أسبوع</option>
                      <option value="30d">شهر</option>
                    </select>
                  </div>
                  <div><label class="lcma-lbl">السبب (اختياري)</label><input type="text" id="lcma-ban-reason" class="lcma-inp" placeholder="السبب..."></div>
                </div>
                <button type="button" id="lcma-btn-ban" class="lcma-btn lcma-btn-danger" style="width:100%;"><i class="fas fa-ban"></i> تنفيذ الحظر</button>
              </div>
              <div id="lcma-banned-list"></div>
            </div>
            <div id="lcma-msub-blacklist" style="display:none;">
              <div class="lcma-card">
                <div class="lcma-card-t"><span>حجب فيلم أو مسلسل بالكامل</span></div>
                <div class="lcma-row" style="margin-bottom:6px;">
                  <input type="text" id="lcma-bl-q" class="lcma-inp" style="flex:1;" placeholder="اسم العمل أو رقم TMDB ID...">
                  <button type="button" id="lcma-bl-search" class="lcma-btn lcma-btn-danger lcma-mini" style="padding:8px 12px;"><i class="fas fa-search"></i></button>
                </div>
                <div id="lcma-bl-results" style="max-height:180px; overflow-y:auto;"></div>
              </div>
              <div class="lcma-card"><div class="lcma-card-t"><span>الأعمال المحجوبة حالياً</span></div><div id="lcma-bl-list"></div></div>
            </div>
            <div id="lcma-msub-genres" style="display:none;">
              <div class="lcma-card">
                <div class="lcma-card-t"><span>إخفاء تصنيفات محددة من القائمة والتصفح</span></div>
                <div id="lcma-genres-box" class="lcma-row" style="gap:6px; margin-bottom:10px;"></div>
                <button type="button" id="lcma-save-genres" class="lcma-btn lcma-btn-gold"><i class="fas fa-save"></i> حفظ التصنيفات المحجوبة</button>
              </div>
            </div>
            <div id="lcma-msub-inspect" style="display:none;">
              <div class="lcma-card">
                <div class="lcma-card-t"><span>فحص وتنظيف سجل ومفضلة عضو معيّن</span></div>
                <div class="lcma-row" style="margin-bottom:8px;">
                  <input type="text" id="lcma-insp-user" class="lcma-inp" style="flex:1;" placeholder="اكتب اسم المستخدم...">
                  <button type="button" id="lcma-insp-btn" class="lcma-btn lcma-btn-info lcma-mini" style="padding:8px 12px;"><i class="fas fa-search"></i> فحص</button>
                </div>
                <div id="lcma-insp-res"></div>
              </div>
            </div>
          </div>

          <div id="lcma-v-servers" class="lcma-view">
            <div class="lcma-card" style="border-color:rgba(56,189,248,0.3);">
              <div class="lcma-card-t" style="color:#7dd3fc;"><span><i class="fas fa-server"></i> مدير سيرفرات التشغيل (إضافة / حذف / افتراضي)</span></div>
              <div id="lcma-servers-list" style="margin-bottom:10px;"></div>
              <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
                <div style="font-size:11.5px; font-weight:bold; color:#D4AF37; margin-bottom:6px;">+ إضافة سيرفر جديد</div>
                <input type="text" id="lcma-nsrv-name" class="lcma-inp" style="margin-bottom:5px;" placeholder="اسم السيرفر (مثلاً: سيرفر 2 السريع)">
                <input type="text" id="lcma-nsrv-movie" class="lcma-inp" dir="ltr" style="margin-bottom:5px;" placeholder="رابط الأفلام باستخدام {id}">
                <input type="text" id="lcma-nsrv-tv" class="lcma-inp" dir="ltr" style="margin-bottom:7px;" placeholder="رابط المسلسلات باستخدام {id} و {s} و {e}">
                <button type="button" id="lcma-nsrv-add" class="lcma-btn lcma-btn-info" style="width:100%;"><i class="fas fa-plus"></i> إضافة السيرفر للقائمة</button>
              </div>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t"><span><i class="fas fa-sliders-h"></i> صلاحيات المشغّل وغرف المشاهدة</span></div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">مبدّل السيرفرات للعضو داخل المشغّل</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-uswitch"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">غرف المشاهدة الجماعية</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-parties"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">التفاعلات العائمة داخل الغرف</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-reacts"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">المشغّل المصغّر (PiP)</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-pip"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-g3" style="margin-bottom:7px;">
                <div><label class="lcma-lbl">أقصى غرف (0=مفتوح)</label><input type="number" id="lcma-set-maxr" class="lcma-inp" min="0" max="100"></div>
                <div><label class="lcma-lbl">أقصى أعضاء بالغرفة</label><input type="number" id="lcma-set-maxp" class="lcma-inp" min="0" max="200"></div>
                <div><label class="lcma-lbl">انتظار التفاعل (ث)</label><input type="number" id="lcma-set-rcd" class="lcma-inp" min="1" max="60"></div>
              </div>
              <div style="margin-bottom:8px;">
                <label class="lcma-lbl">إيموجي التفاعلات (افصل بفاصلة ,)</label>
                <input type="text" id="lcma-set-remojis" class="lcma-inp" placeholder="😂,😱,❤️,🔥,👏">
              </div>
              <button type="button" id="lcma-save-player" class="lcma-btn lcma-btn-gold"><i class="fas fa-save"></i> حفظ إعدادات المشغّل والغرف</button>
            </div>
          </div>

          <div id="lcma-v-analytics" class="lcma-view">
            <div class="lcma-card" style="text-align:center;">
              <div style="font-size:12px; color:#94a3b8; margin-bottom:8px;">تحليل عند الطلب لسجلات المشاهدة والمفضلات بدون أي استهلاك مستمر.</div>
              <button type="button" id="lcma-run-analytics" class="lcma-btn lcma-btn-gold"><i class="fas fa-chart-pie"></i> توليد التقرير الإحصائي الآن</button>
            </div>
            <div id="lcma-analytics-body"></div>
          </div>

          <div id="lcma-v-settings" class="lcma-view">
            <div class="lcma-card">
              <div class="lcma-card-t"><span><i class="fas fa-power-off"></i> التحكم العام والقيود</span></div>
              <div class="lcma-srow">
                <div><div style="font-size:12.5px; font-weight:bold;">تفعيل سينما ليل للجميع</div><div style="font-size:10.5px; color:#94a3b8;">إيقافها يغلقها عن الأعضاء وتبقى مفتوحة للإدارة</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-enabled"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">السماح للضيوف بدخول السينما</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-guests"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-srow">
                <div><div style="font-size:12px; font-weight:bold;">الوضع العائلي الصارم في البحث</div></div>
                <label class="lcma-sw"><input type="checkbox" id="lcma-set-safe"><span class="lcma-sl"></span></label>
              </div>
              <div class="lcma-g2" style="margin-bottom:8px;">
                <div><label class="lcma-lbl">أدنى تقييم للعرض (0 = الكل)</label><input type="number" id="lcma-set-minrate" class="lcma-inp" min="0" max="9" step="0.5"></div>
                <div><label class="lcma-lbl">رسالة التوقف للصيانة</label><input type="text" id="lcma-set-offmsg" class="lcma-inp"></div>
              </div>
              <button type="button" id="lcma-save-gen" class="lcma-btn lcma-btn-gold"><i class="fas fa-save"></i> حفظ الإعدادات العامة</button>
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t" style="color:#cbd5e1;"><span><i class="fas fa-broom"></i> الصيانة وتخفيف الفايربيس</span></div>
              <div class="lcma-g2" style="margin-bottom:7px;">
                <button type="button" id="lcma-clean-rooms" class="lcma-btn lcma-btn-dark"><i class="fas fa-door-closed"></i> تنظيف الغرف الخاملة</button>
                <button type="button" id="lcma-clean-hist" class="lcma-btn lcma-btn-dark"><i class="fas fa-history"></i> حذف السجل (+30 يوم)</button>
                <button type="button" id="lcma-clean-pres" class="lcma-btn lcma-btn-dark"><i class="fas fa-ghost"></i> تنظيف الرادار العالق</button>
                <button type="button" id="lcma-reset-srvs" class="lcma-btn lcma-btn-warn"><i class="fas fa-undo"></i> استعادة السيرفر الافتراضي</button>
                <button type="button" id="lcma-export" class="lcma-btn lcma-btn-info"><i class="fas fa-download"></i> نسخ احتياطي JSON</button>
                <button type="button" id="lcma-import" class="lcma-btn lcma-btn-ok"><i class="fas fa-upload"></i> استيراد JSON</button>
              </div>
              <input type="file" id="lcma-import-file" accept=".json,application/json" style="display:none;">
            </div>
            <div class="lcma-card">
              <div class="lcma-card-t">
                <span><i class="fas fa-clipboard-list"></i> سجل العمليات الإدارية</span>
                <button type="button" id="lcma-clear-logs" class="lcma-btn lcma-btn-danger lcma-mini"><i class="fas fa-trash"></i> مسح</button>
              </div>
              <input type="text" id="lcma-log-q" class="lcma-inp" style="margin-bottom:7px;" placeholder="🔍 ابحث في السجل...">
              <div id="lcma-logs-list"></div>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&cinemaAdmin.close()});
    document.getElementById("lcma-close").onclick=()=>cinemaAdmin.close();
    document.getElementById("lcma-open-app").onclick=()=>{cinemaAdmin.close();window.lailCinema.init()};
    document.getElementById("lcma-refresh").onclick=()=>{cinemaAdmin.loadBanned();cinemaAdmin.loadLogs();cinemaAdmin.refreshUI();window.lailCinema.showToast("🔄 تم تحديث البيانات")};
    ov.querySelectorAll("[data-mtab]").forEach(b=>b.onclick=()=>cinemaAdmin.switchTab(b.dataset.mtab));
    ov.querySelectorAll("[data-msub]").forEach(b=>b.onclick=()=>{
      let sub=b.dataset.msub;
      ov.querySelectorAll("[data-msub]").forEach(x=>x.classList.toggle("active",x===b));
      ["bans","blacklist","genres","inspect"].forEach(k=>{document.getElementById(`lcma-msub-${k}`).style.display=k===sub?"block":"none"});
      if("genres"===sub)cinemaAdmin.renderGenreBlocker()
    });

    document.getElementById("lcma-close-all-rooms").onclick=()=>cinemaAdmin.closeAllRooms();
    document.getElementById("lcma-oroom-search").onclick=()=>cinemaAdmin.searchTMDB("oroom");
    document.getElementById("lcma-oroom-q").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),cinemaAdmin.searchTMDB("oroom"))});

    document.getElementById("lcma-live-bc-send").onclick=()=>cinemaAdmin.sendLiveBroadcast();
    document.getElementById("lcma-banner-save").onclick=()=>{
      let txt=(document.getElementById("lcma-banner-inp").value||"").trim();
      cinemaAdmin.patchSettings({bannerText:txt},txt?"📢 تم تحديث شريط الإعلان":"تم إخفاء شريط الإعلان")
    };
    document.getElementById("lcma-sched-search").onclick=()=>cinemaAdmin.searchTMDB("sched");
    document.getElementById("lcma-sched-save").onclick=()=>cinemaAdmin.saveSchedule();
    document.getElementById("lcma-sched-clear").onclick=()=>cinemaAdmin.clearSchedule();
    document.getElementById("lcma-poll-sbtn").onclick=()=>cinemaAdmin.searchTMDB("poll");
    document.getElementById("lcma-poll-publish").onclick=()=>cinemaAdmin.publishPoll();
    document.getElementById("lcma-poll-end").onclick=()=>cinemaAdmin.endPoll();

    document.getElementById("lcma-feat-search").onclick=()=>cinemaAdmin.searchTMDB("feat");
    document.getElementById("lcma-feat-q").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),cinemaAdmin.searchTMDB("feat"))});

    document.getElementById("lcma-btn-ban").onclick=()=>cinemaAdmin.banUser();
    document.getElementById("lcma-bl-search").onclick=()=>cinemaAdmin.searchTMDB("bl");
    document.getElementById("lcma-bl-q").addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.preventDefault(),cinemaAdmin.searchTMDB("bl"))});
    document.getElementById("lcma-save-genres").onclick=()=>cinemaAdmin.saveBlockedGenres();
    document.getElementById("lcma-insp-btn").onclick=()=>cinemaAdmin.inspectUser();

    document.getElementById("lcma-nsrv-add").onclick=()=>cinemaAdmin.addServer();
    document.getElementById("lcma-save-player").onclick=()=>cinemaAdmin.savePlayerSettings();

    document.getElementById("lcma-run-analytics").onclick=()=>cinemaAdmin.runAnalytics();

    document.getElementById("lcma-set-enabled").onchange=function(){cinemaAdmin.patchSettings({enabled:this.checked},this.checked?"✅ تم تفعيل سينما ليل":"🛑 تم إيقاف سينما ليل عن الأعضاء")};
    document.getElementById("lcma-set-guests").onchange=function(){cinemaAdmin.patchSettings({allowGuests:this.checked},this.checked?"✅ تم السماح للضيوف":"🔒 السينما للأعضاء فقط")};
    document.getElementById("lcma-set-safe").onchange=function(){cinemaAdmin.patchSettings({safeMode:this.checked},this.checked?"🛡️ تم تفعيل الوضع العائلي":"تم إيقاف الوضع العائلي")};
    document.getElementById("lcma-save-gen").onclick=()=>cinemaAdmin.saveGeneralSettings();
    document.getElementById("lcma-clean-rooms").onclick=()=>cinemaAdmin.cleanIdleRooms();
    document.getElementById("lcma-clean-hist").onclick=()=>cinemaAdmin.cleanOldHistory(30);
    document.getElementById("lcma-clean-pres").onclick=()=>{window.lailCinema.db?.ref("lail_cinema/presence").remove().then(()=>window.lailCinema.showToast("🧹 تم تنظيف الرادار"))};
    document.getElementById("lcma-reset-srvs").onclick=()=>{confirm("استعادة السيرفر الافتراضي فقط؟")&&cinemaAdmin.patchSettings({servers:DEFAULT_SERVERS,defaultServerId:"srv_default"},"✅ تمت الاستعادة")};
    document.getElementById("lcma-export").onclick=()=>cinemaAdmin.exportBackup();
    document.getElementById("lcma-import").onclick=()=>document.getElementById("lcma-import-file").click();
    document.getElementById("lcma-import-file").onchange=ev=>cinemaAdmin.importBackup(ev);
    document.getElementById("lcma-log-q").oninput=()=>cinemaAdmin.renderLogs();
    document.getElementById("lcma-clear-logs").onclick=()=>cinemaAdmin.clearLogs();

    requestAnimationFrame(()=>ov.classList.add("active"));
    cinemaAdmin.activeTab="rooms";
    cinemaAdmin.pollDraft=[];
    cinemaAdmin.schedDraft=null;
    cinemaAdmin.populateInputs();
    cinemaAdmin.bindLiveStreams();
    cinemaAdmin.loadBanned();
    cinemaAdmin.loadLogs();
    cinemaAdmin.refreshUI()
  },
  close(){
    if(st.roomsRef){st.roomsRef.off();st.roomsRef=null}
    if(st.presenceRef){st.presenceRef.off();st.presenceRef=null}
    let ov=document.getElementById("lail-cinema-admin-modal");
    ov&&ov.remove()
  },
  switchTab(tab){
    let ov=document.getElementById("lail-cinema-admin-modal");if(!ov)return;
    cinemaAdmin.activeTab=tab;
    ov.querySelectorAll("[data-mtab]").forEach(x=>x.classList.toggle("active",x.dataset.mtab===tab));
    ov.querySelectorAll(".lcma-view").forEach(x=>x.classList.remove("active"));
    let v=document.getElementById(`lcma-v-${tab}`);v&&v.classList.add("active");
    if("rooms"===tab){cinemaAdmin.renderPresence();cinemaAdmin.renderRooms()}
    else if("events"===tab){cinemaAdmin.populateInputs();cinemaAdmin.renderEventStatus()}
    else if("featured"===tab)cinemaAdmin.renderFeatured();
    else if("moderation"===tab){cinemaAdmin.renderBanned();cinemaAdmin.renderBlacklist()}
    else if("servers"===tab){cinemaAdmin.populateInputs();cinemaAdmin.renderServers()}
    else if("settings"===tab){cinemaAdmin.populateInputs();cinemaAdmin.loadLogs()}
  },
  bindLiveStreams(){
    if(!window.lailCinema.db)return;
    st.roomsRef&&st.roomsRef.off();
    st.roomsRef=window.lailCinema.db.ref("lail_cinema/rooms");
    st.roomsRef.on("value",snap=>{st.roomsCache=snap.val()||{};cinemaAdmin.refreshUI()});
    st.presenceRef&&st.presenceRef.off();
    st.presenceRef=window.lailCinema.db.ref("lail_cinema/presence");
    st.presenceRef.on("value",snap=>{st.presenceCache=snap.val()||{};cinemaAdmin.refreshUI()})
  },
  refreshUI(){
    if(!document.getElementById("lail-cinema-admin-modal"))return;
    let s=st.settings;
    let stEl=document.getElementById("lcma-st-status");
    if(stEl){stEl.textContent=!1===s.enabled?"صيانة":"مفعّلة";stEl.style.color=!1===s.enabled?"#f87171":"#34d399"}
    let presCnt=Object.values(st.presenceCache||{}).filter(x=>x&&Date.now()-(x.ts||0)<18e5).length;
    let rmCnt=Object.keys(st.roomsCache||{}).length;
    let onEl=document.getElementById("lcma-st-online");
    onEl&&(onEl.textContent=`${presCnt} / ${rmCnt}`);
    let ftEl=document.getElementById("lcma-st-feat");
    ftEl&&(ftEl.textContent=Object.keys(st.featured||{}).length);
    let mdEl=document.getElementById("lcma-st-mod");
    if(mdEl){
      let bCnt=Object.values(st.bannedCache||{}).filter(x=>x&&(!x.expiresAt||Date.now()<x.expiresAt)).length;
      mdEl.textContent=`${bCnt} / ${Object.keys(st.blacklist||{}).length}`
    }
    if("rooms"===cinemaAdmin.activeTab){cinemaAdmin.renderPresence();cinemaAdmin.renderRooms()}
    else if("events"===cinemaAdmin.activeTab)cinemaAdmin.renderEventStatus();
    else if("featured"===cinemaAdmin.activeTab)cinemaAdmin.renderFeatured();
    else if("moderation"===cinemaAdmin.activeTab){cinemaAdmin.renderBanned();cinemaAdmin.renderBlacklist()}
    else if("servers"===cinemaAdmin.activeTab)cinemaAdmin.renderServers()
  },
  populateInputs(){
    let s=st.settings;
    let setChk=(id,val)=>{let el=document.getElementById(id);el&&(el.checked=Boolean(val))};
    let setVal=(id,val)=>{let el=document.getElementById(id);el&&(el.value=val)};
    setVal("lcma-banner-inp",s.bannerText||"");
    setChk("lcma-set-uswitch",!1!==s.allowUserServerSwitch);
    setChk("lcma-set-parties",!1!==s.allowParties);
    setChk("lcma-set-reacts",!1!==s.allowReactions);
    setChk("lcma-set-pip",!1!==s.allowMiniPlayer);
    setVal("lcma-set-maxr",Number(s.maxRooms)||0);
    setVal("lcma-set-maxp",Number(s.maxPlayersPerRoom)||0);
    setVal("lcma-set-rcd",Number(s.reactionCooldown)||1);
    setVal("lcma-set-remojis",s.customReactions||"😂,😱,❤️,🔥");
    setChk("lcma-set-enabled",!1!==s.enabled);
    setChk("lcma-set-guests",!1!==s.allowGuests);
    setChk("lcma-set-safe",s.safeMode);
    setVal("lcma-set-minrate",Number(s.minRating)||0);
    setVal("lcma-set-offmsg",s.disabledMsg||"")
  },
  patchSettings(partial,toastMsg){
    if(!window.lailCinema.db)return;
    window.lailCinema.db.ref(`${ADMIN_PATH}/settings`).update(partial).then(()=>{
      st.settings=Object.assign({},st.settings,partial);
      cinemaAdmin.log("تعديل إعدادات","السينما",Object.keys(partial).join(", "));
      window.lailCinema.applyAdminSettings();
      cinemaAdmin.refreshUI();
      toastMsg&&window.lailCinema.showToast(toastMsg)
    }).catch(()=>alert("❌ فشل الحفظ في Firebase."))
  },
  renderPresence(){
    let c=document.getElementById("lcma-presence-list"),cntEl=document.getElementById("lcma-pres-cnt");
    if(!c)return;
    let active=Object.entries(st.presenceCache||{}).filter(([,v])=>v&&Date.now()-(v.ts||0)<18e5);
    cntEl&&(cntEl.textContent=active.length);
    if(!active.length){c.innerHTML='<div style="color:#64748b; font-size:11.5px; text-align:center; padding:8px;">لا يوجد أعضاء داخل السينما حالياً.</div>';return}
    c.innerHTML=active.map(([k,v])=>`
      <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:4px; font-size:11.5px; gap:6px;">
        <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><b style="color:#34d399;">●</b> <b>${h.esc(v.name||k)}</b> <span style="color:#94a3b8;">— ${h.esc(v.watching||"يتصفح السينما")}</span></div>
        <button type="button" class="lcma-btn lcma-btn-danger lcma-mini lcma-qban" data-u="${h.esc(v.name||k)}" style="padding:3px 7px;">حظر</button>
      </div>`).join("");
    c.querySelectorAll(".lcma-qban").forEach(b=>b.onclick=()=>{
      cinemaAdmin.switchTab("moderation");
      let inp=document.getElementById("lcma-ban-user");
      if(inp){inp.value=b.dataset.u;inp.focus()}
    })
  },
  renderRooms(){
    let c=document.getElementById("lcma-rooms-list");if(!c)return;
    let entries=Object.entries(st.roomsCache||{});
    if(!entries.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:18px; font-size:12px;">لا توجد غرف مشاهدة نشطة حالياً.</div>';return}
    c.innerHTML=entries.map(([code,rm])=>{
      let players=Object.keys(rm.players||{});
      let stTag="playing"===rm.status?'<span class="lcma-tag lcma-t-green">▶️ قيد العرض</span>':"paused"===rm.status?'<span class="lcma-tag lcma-t-gold">⏸️ متوقف</span>':'<span class="lcma-tag lcma-t-blue">⏳ انتظار</span>';
      let epStr=rm.season?` (S${rm.season} E${rm.episode})`:"";
      let elapsed="playing"===rm.status&&rm.startTime?` • د ${Math.max(0,Math.floor((Date.now()-rm.startTime)/6e4))}`:"";
      let chips=players.map(p=>`<span style="display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,0.07); padding:2px 7px; border-radius:12px; font-size:10.5px;">${p===rm.host?"👑 ":""}${h.esc(p)}${p!==rm.host?` <i class="fas fa-crown lcma-mkhost" data-code="${h.esc(code)}" data-u="${h.esc(p)}" style="color:#fbbf24; cursor:pointer;" title="نقل المضيف له"></i> <i class="fas fa-times lcma-kick" data-code="${h.esc(code)}" data-u="${h.esc(p)}" style="color:#f87171; cursor:pointer;" title="طرد"></i>`:""}</span>`).join(" ");
      return`
        <div class="lcma-card" style="background:rgba(0,0,0,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap;">
            <div style="font-weight:800; font-size:13px;">${rm.official?"👑 ":""}🎬 ${h.esc(rm.title||"بدون عنوان")}${epStr}</div>
            <div class="lcma-row" style="gap:4px;">${stTag}<span class="lcma-tag lcma-t-gold" dir="ltr">#${h.esc(code)}</span></div>
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">المضيف: <b style="color:#fbbf24;">${h.esc(rm.host||"-")}</b> • المتواجدون (${players.length})${elapsed}</div>
          <div class="lcma-row" style="gap:4px; margin-bottom:8px;">${chips||'<span style="color:#64748b; font-size:11px;">فارغة</span>'}</div>
          <div class="lcma-row" style="gap:5px;">
            <button type="button" class="lcma-btn lcma-btn-info lcma-mini lcma-rm-join" data-code="${h.esc(code)}"><i class="fas fa-sign-in-alt"></i> دخول</button>
            ${"playing"!==rm.status?`<button type="button" class="lcma-btn lcma-btn-ok lcma-mini lcma-rm-play" data-code="${h.esc(code)}"><i class="fas fa-play"></i> تشغيل</button>`:`<button type="button" class="lcma-btn lcma-btn-warn lcma-mini lcma-rm-pause" data-code="${h.esc(code)}"><i class="fas fa-pause"></i> إيقاف</button>`}
            <button type="button" class="lcma-btn lcma-btn-gold lcma-mini lcma-rm-bc" data-code="${h.esc(code)}" data-title="${h.esc(rm.title||"")}" style="width:auto;"><i class="fas fa-bullhorn"></i> بث الكود</button>
            <button type="button" class="lcma-btn lcma-btn-danger lcma-mini lcma-rm-close" data-code="${h.esc(code)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lcma-rm-join").forEach(b=>b.onclick=()=>{
      let code=b.dataset.code;cinemaAdmin.close();
      window.lailCinema.init().then(()=>{window.lailCinema.openPartyJoin();let i=document.getElementById("party-code-input");if(i){i.value=code;window.lailCinema.joinParty()}})
    });
    c.querySelectorAll(".lcma-rm-play").forEach(b=>b.onclick=()=>{
      let code=b.dataset.code,rm=st.roomsCache[code];
      let sTime=rm&&"paused"===rm.status?Date.now()-(rm.pauseElapsed||0):Date.now();
      window.lailCinema.db.ref(`lail_cinema/rooms/${code}`).update({status:"playing",startTime:sTime}).then(()=>{cinemaAdmin.log("تشغيل غرفة",`#${code}`,rm?.title||"");window.lailCinema.showToast(`▶️ تم تشغيل الغرفة #${code}`)})
    });
    c.querySelectorAll(".lcma-rm-pause").forEach(b=>b.onclick=()=>{
      let code=b.dataset.code,rm=st.roomsCache[code];
      window.lailCinema.db.ref(`lail_cinema/rooms/${code}`).update({status:"paused",pauseElapsed:rm?.startTime?Date.now()-rm.startTime:0}).then(()=>{cinemaAdmin.log("إيقاف غرفة",`#${code}`,rm?.title||"");window.lailCinema.showToast(`⏸️ تم إيقاف الغرفة #${code}`)})
    });
    c.querySelectorAll(".lcma-rm-bc").forEach(b=>b.onclick=()=>{
      let txt=`🍿 انضم الآن لغرفة السهرة (${b.dataset.title}) — كود الغرفة: ${b.dataset.code}`;
      window.lailCinema.db.ref(`${ADMIN_PATH}/broadcast`).set({text:txt,ts:Date.now(),by:window.lailCinema.myUsername||"الإدارة"}).then(()=>{cinemaAdmin.log("بث كود غرفة",`#${b.dataset.code}`,txt);window.lailCinema.showToast("📢 تم بث كود الغرفة لزوار السينما")})
    });
    c.querySelectorAll(".lcma-rm-close").forEach(b=>b.onclick=()=>{
      let code=b.dataset.code;
      if(!confirm(`إغلاق الغرفة #${code}؟`))return;
      window.lailCinema.db.ref(`lail_cinema/rooms/${code}`).remove().then(()=>{cinemaAdmin.log("إغلاق غرفة",`#${code}`,"");window.lailCinema.showToast(`🗑️ تم إغلاق #${code}`)})
    });
    c.querySelectorAll(".lcma-kick").forEach(el=>el.onclick=()=>{
      let code=el.dataset.code,u=el.dataset.u;
      if(!confirm(`طرد (${u}) من الغرفة #${code}؟`))return;
      window.lailCinema.db.ref(`lail_cinema/rooms/${code}/players/${u}`).remove().then(()=>{cinemaAdmin.log("طرد من غرفة",u,`#${code}`);window.lailCinema.showToast(`🚫 تم طرد ${u}`)})
    });
    c.querySelectorAll(".lcma-mkhost").forEach(el=>el.onclick=()=>{
      let code=el.dataset.code,u=el.dataset.u;
      if(!confirm(`نقل صلاحية المضيف في الغرفة #${code} إلى (${u})؟`))return;
      window.lailCinema.db.ref(`lail_cinema/rooms/${code}/host`).set(u).then(()=>{cinemaAdmin.log("نقل مضيف غرفة",u,`#${code}`);window.lailCinema.showToast(`👑 أصبح ${u} مضيف الغرفة`)})
    })
  },
  closeAllRooms(){
    let cnt=Object.keys(st.roomsCache||{}).length;
    if(!cnt)return window.lailCinema.showToast("لا توجد غرف نشطة");
    if(!confirm(`إغلاق جميع الغرف (${cnt})؟`))return;
    window.lailCinema.db.ref("lail_cinema/rooms").remove().then(()=>{cinemaAdmin.log("إغلاق كل الغرف",`${cnt} غرفة`,"");window.lailCinema.showToast(`🧹 تم إغلاق ${cnt} غرفة`)})
  },
  sendLiveBroadcast(){
    let inp=document.getElementById("lcma-live-bc-inp"),txt=(inp?.value||"").trim();
    if(!txt||!window.lailCinema.db)return alert("اكتب نص الإشعار أولاً.");
    window.lailCinema.db.ref(`${ADMIN_PATH}/broadcast`).set({text:txt,ts:Date.now(),by:window.lailCinema.myUsername||"الإدارة"}).then(()=>{
      cinemaAdmin.log("بث فوري","الجميع",txt);
      inp.value="";
      window.lailCinema.showToast("📢 تم إرسال البث الفوري")
    })
  },
  renderEventStatus(){
    let sc=document.getElementById("lcma-sched-cur");
    if(sc){
      let sch=st.schedule;
      sc.innerHTML=sch&&sch.active?`<div class="lcma-mrow">${sch.poster_path?`<img src="https://image.tmdb.org/t/p/w200${sch.poster_path}">`:""}<div style="flex:1;"><div style="font-size:12.5px; font-weight:bold; color:#D4AF37;">🎬 ${h.esc(sch.title)}</div><div style="font-size:11px; color:#cbd5e1;">${h.esc(sch.note||"")} • ${h.formatDate(sch.time)}</div></div></div>`:'<div style="font-size:11.5px; color:#64748b;">لا توجد سهرة مجدولة حالياً.</div>'
    }
    let pc=document.getElementById("lcma-poll-cur");
    if(pc){
      let p=st.poll;
      if(p&&p.active&&Array.isArray(p.options)&&p.options.length){
        let votes=Object.values(p.votes||{}),tot=votes.length;
        let rows=p.options.map((o,idx)=>{
          let cnt=votes.filter(v=>Number(v)===idx).length,pct=tot?Math.round(cnt/tot*100):0;
          return`<div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:4px; font-size:11.5px;"><span><b>${h.esc(o.title)}</b></span><div class="lcma-row" style="gap:5px;"><span class="lcma-tag lcma-t-gold">${cnt} صوت (${pct}%)</span><button type="button" class="lcma-btn lcma-btn-ok lcma-mini lcma-pin-win" data-idx="${idx}" style="padding:2px 7px;">تثبيت كفائز</button></div></div>`
        }).join("");
        pc.innerHTML=`<div style="font-size:12px; font-weight:bold; color:#6ee7b7; margin-bottom:5px;">التصويت النشط (${tot} صوت): ${h.esc(p.question||"")}</div>${rows}`;
        pc.querySelectorAll(".lcma-pin-win").forEach(b=>b.onclick=()=>{
          let win=p.options[Number(b.dataset.idx)];
          if(!win)return;
          cinemaAdmin.addFeatured(win,"فائز التصويت 🏆");
          cinemaAdmin.endPoll()
        })
      }else pc.innerHTML='<div style="font-size:11.5px; color:#64748b;">لا يوجد تصويت نشط حالياً.</div>'
    }
    cinemaAdmin.renderPollDraft()
  },
  renderPollDraft(){
    let box=document.getElementById("lcma-poll-draft");if(!box)return;
    if(!cinemaAdmin.pollDraft.length){box.innerHTML="";return}
    box.innerHTML='<div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">مسودة التصويت الجديد:</div>'+cinemaAdmin.pollDraft.map((x,idx)=>`<span class="lcma-tag lcma-t-gold" style="margin:2px;">${h.esc(x.title)} <i class="fas fa-times lcma-pd-rm" data-i="${idx}" style="cursor:pointer; color:#f87171;"></i></span>`).join("");
    box.querySelectorAll(".lcma-pd-rm").forEach(el=>el.onclick=()=>{cinemaAdmin.pollDraft.splice(Number(el.dataset.i),1);cinemaAdmin.renderPollDraft()})
  },
  saveSchedule(){
    if(!window.lailCinema.db)return;
    let d=cinemaAdmin.schedDraft;
    if(!d)return alert("ابحث واختر فيلم/مسلسل السهرة أولاً.");
    let dtVal=document.getElementById("lcma-sched-time")?.value;
    if(!dtVal)return alert("حدد تاريخ ووقت السهرة.");
    let ts=new Date(dtVal).getTime();
    if(isNaN(ts))return alert("وقت غير صالح.");
    let note=(document.getElementById("lcma-sched-note")?.value||"").trim()||"سهرة سينما ليل 🍿";
    window.lailCinema.db.ref(`${ADMIN_PATH}/schedule`).set({
      active:!0,id:d.id,media_type:d.media_type,title:d.title||d.name,poster_path:d.poster_path||"",time:ts,note
    }).then(()=>{
      cinemaAdmin.log("جدولة سهرة",d.title||d.name,note);
      cinemaAdmin.schedDraft=null;
      document.getElementById("lcma-sched-res").innerHTML="";
      window.lailCinema.showToast("🗓️ تم تفعيل عدّاد السهرة للجميع")
    })
  },
  clearSchedule(){
    window.lailCinema.db?.ref(`${ADMIN_PATH}/schedule`).remove().then(()=>{cinemaAdmin.log("إلغاء سهرة","النظام","");window.lailCinema.showToast("تم إلغاء السهرة المجدولة")})
  },
  publishPoll(){
    if(!window.lailCinema.db)return;
    if(cinemaAdmin.pollDraft.length<2)return alert("أضف عملين على الأقل للتصويت (بحد أقصى 4).");
    let q=(document.getElementById("lcma-poll-qtxt")?.value||"").trim()||"🗳️ صوّت لفيلم سهرة الليلة:";
    window.lailCinema.db.ref(`${ADMIN_PATH}/poll`).set({
      active:!0,question:q,options:cinemaAdmin.pollDraft,votes:{},createdAt:Date.now()
    }).then(()=>{
      cinemaAdmin.log("نشر تصويت",`${cinemaAdmin.pollDraft.length} خيارات`,q);
      cinemaAdmin.pollDraft=[];
      cinemaAdmin.renderPollDraft();
      window.lailCinema.showToast("🗳️ تم نشر التصويت داخل السينما")
    })
  },
  endPoll(){
    window.lailCinema.db?.ref(`${ADMIN_PATH}/poll`).remove().then(()=>{cinemaAdmin.log("إنهاء تصويت","النظام","");window.lailCinema.showToast("تم إنهاء التصويت")})
  },
  async searchTMDB(mode){
    let qMap={feat:"lcma-feat-q",bl:"lcma-bl-q",oroom:"lcma-oroom-q",sched:"lcma-sched-q",poll:"lcma-poll-sq"};
    let rMap={feat:"lcma-feat-results",bl:"lcma-bl-results",oroom:"lcma-oroom-res",sched:"lcma-sched-res",poll:"lcma-poll-sres"};
    let q=(document.getElementById(qMap[mode])?.value||"").trim(),resBox=document.getElementById(rMap[mode]);
    if(!q||!resBox)return;
    resBox.innerHTML='<div style="text-align:center; color:#D4AF37; padding:10px;"><i class="fas fa-spinner fa-spin"></i> جاري البحث...</div>';
    try{
      let items=[];
      if(/^\d+$/.test(q)){
        let [mr,tr]=await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${q}?api_key=${TMDB_KEY}&language=ar`).then(x=>x.ok?x.json():null).catch(()=>null),
          fetch(`https://api.themoviedb.org/3/tv/${q}?api_key=${TMDB_KEY}&language=ar`).then(x=>x.ok?x.json():null).catch(()=>null)
        ]);
        mr?.id&&items.push(Object.assign({media_type:"movie"},mr));
        tr?.id&&items.push(Object.assign({media_type:"tv"},tr))
      }else{
        let data=await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ar&query=${encodeURIComponent(q)}`).then(x=>x.json());
        items=(data.results||[]).filter(x=>"movie"===x.media_type||"tv"===x.media_type).slice(0,7)
      }
      if(!items.length){resBox.innerHTML='<div style="text-align:center; color:#94a3b8; padding:8px; font-size:11.5px;">لا توجد نتائج.</div>';return}
      let btnLbl={feat:"تثبيت ⭐",bl:"حجب 🚫",oroom:"إنشاء غرفة 👑",sched:"اختيار 🗓️",poll:"+ إضافة"}[mode];
      let btnCls="bl"===mode?"lcma-btn-danger":"lcma-btn-gold";
      resBox.innerHTML=items.map((it,idx)=>{
        let ttl=it.title||it.name||"بدون اسم",yr=(it.release_date||it.first_air_date||"").slice(0,4);
        let ps=it.poster_path?`https://image.tmdb.org/t/p/w200${it.poster_path}`:"";
        return`<div class="lcma-mrow">${ps?`<img src="${ps}">`:""}<div style="flex:1; min-width:0;"><div style="font-size:12px; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${h.esc(ttl)}</div><div style="font-size:10.5px; color:#94a3b8;">${"movie"===it.media_type?"🎬 فيلم":"📺 مسلسل"} • ${yr||"-"} • #${it.id}</div></div><button type="button" class="lcma-btn ${btnCls} lcma-mini lcma-spick" data-idx="${idx}">${btnLbl}</button></div>`
      }).join("");
      resBox.querySelectorAll(".lcma-spick").forEach(b=>b.onclick=()=>{
        let it=items[Number(b.dataset.idx)];
        if("feat"===mode)cinemaAdmin.addFeatured(it);
        else if("bl"===mode)cinemaAdmin.addBlacklist(it);
        else if("sched"===mode){
          cinemaAdmin.schedDraft=it;
          resBox.innerHTML=`<div style="color:#34d399; font-size:11.5px; padding:5px;">✅ تم اختيار: <b>${h.esc(it.title||it.name)}</b> — حدد الوقت ثم اضغط تفعيل</div>`
        }else if("poll"===mode){
          if(cinemaAdmin.pollDraft.length>=4)return alert("الحد الأقصى 4 خيارات.");
          if(!cinemaAdmin.pollDraft.some(x=>x.id===it.id)){
            cinemaAdmin.pollDraft.push({id:it.id,media_type:it.media_type,title:it.title||it.name,poster_path:it.poster_path||""});
            cinemaAdmin.renderPollDraft()
          }
          resBox.innerHTML=""
        }else if("oroom"===mode){
          let sNum=0,eNum=0;
          if("tv"===it.media_type){sNum=parseInt(prompt("رقم الموسم:","1"))||1;eNum=parseInt(prompt("رقم الحلقة:","1"))||1}
          let code=Math.floor(1e3+9e3*Math.random()).toString(),me=h.san(window.lailCinema.myUsername);
          let ttl=it.title||it.name;
          window.lailCinema.db.ref(`lail_cinema/rooms/${code}`).set({
            host:me,official:!0,movieId:it.id,type:it.media_type,title:ttl,season:sNum,episode:eNum,status:"waiting",startTime:0,pauseElapsed:0,createdAt:Date.now(),players:{[me]:!0}
          }).then(()=>{
            cinemaAdmin.log("غرفة سهرة رسمية",`#${code}`,ttl);
            resBox.innerHTML="";
            if(confirm(`✅ تم إنشاء غرفة السهرة الرسمية #${code} لـ (${ttl}).\nهل تريد بث الكود فوراً لزوار السينما؟`)){
              window.lailCinema.db.ref(`${ADMIN_PATH}/broadcast`).set({text:`👑 غرفة سهرة رسمية مفتوحة الآن لـ (${ttl}) — كود الانضمام: ${code}`,ts:Date.now(),by:window.lailCinema.myUsername||"الإدارة"})
            }
          })
        }
      })
    }catch{resBox.innerHTML='<div style="text-align:center; color:#ef4444; padding:8px;">خطأ في الاتصال.</div>'}
  },
  addFeatured(it,customBadge){
    if(!window.lailCinema.db||!it)return;
    let key=`${it.media_type}_${it.id}`;
    let badge=customBadge||(document.getElementById("lcma-feat-badge")?.value||"").trim()||"اختيار الإدارة ⭐";
    window.lailCinema.db.ref(`${ADMIN_PATH}/featured/${key}`).set({
      id:it.id,media_type:it.media_type,title:it.title||it.name||"",poster_path:it.poster_path||"",vote_average:it.vote_average||0,badge,timestamp:Date.now()
    }).then(()=>{
      cinemaAdmin.log("تثبيت عمل",it.title||it.name,badge);
      let bInp=document.getElementById("lcma-feat-badge");bInp&&(bInp.value="");
      let fr=document.getElementById("lcma-feat-results");fr&&(fr.innerHTML="");
      window.lailCinema.showToast(`⭐ تم تثبيت «${it.title||it.name}»`)
    })
  },
  renderFeatured(){
    let c=document.getElementById("lcma-feat-list");if(!c)return;
    let items=Object.entries(st.featured||{}).sort((x,y)=>(y[1].timestamp||0)-(x[1].timestamp||0));
    if(!items.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:14px; font-size:12px;">لا توجد أعمال مثبّتة.</div>';return}
    c.innerHTML=items.map(([k,it])=>`
      <div class="lcma-mrow">
        ${it.poster_path?`<img src="https://image.tmdb.org/t/p/w200${it.poster_path}">`:""}
        <div style="flex:1; min-width:0;">
          <div style="font-size:12.5px; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${h.esc(it.title)}</div>
          <div class="lcma-row" style="gap:4px; margin-top:3px;"><span class="lcma-tag lcma-t-gold">${h.esc(it.badge||"اختيار الإدارة")}</span><span class="lcma-tag lcma-t-gray">${"movie"===it.media_type?"فيلم":"مسلسل"}</span></div>
        </div>
        <button type="button" class="lcma-btn lcma-btn-info lcma-mini lcma-top-feat" data-k="${h.esc(k)}" title="رفع للأول"><i class="fas fa-arrow-up"></i></button>
        <button type="button" class="lcma-btn lcma-btn-danger lcma-mini lcma-del-feat" data-k="${h.esc(k)}"><i class="fas fa-trash"></i></button>
      </div>`).join("");
    c.querySelectorAll(".lcma-top-feat").forEach(b=>b.onclick=()=>{window.lailCinema.db.ref(`${ADMIN_PATH}/featured/${b.dataset.k}/timestamp`).set(Date.now()).then(()=>window.lailCinema.showToast("⬆️ تم الرفع للمقدمة"))});
    c.querySelectorAll(".lcma-del-feat").forEach(b=>b.onclick=()=>{let k=b.dataset.k;window.lailCinema.db.ref(`${ADMIN_PATH}/featured/${k}`).remove().then(()=>{cinemaAdmin.log("حذف اختيار",st.featured[k]?.title||k,"");window.lailCinema.showToast("تمت الإزالة")})})
  },
  addBlacklist(it){
    if(!window.lailCinema.db||!it)return;
    let key=`${it.media_type}_${it.id}`;
    window.lailCinema.db.ref(`${ADMIN_PATH}/blacklist/${key}`).set({
      id:it.id,media_type:it.media_type,title:it.title||it.name||`#${it.id}`,poster_path:it.poster_path||"",by:window.lailCinema.myUsername||"الإدارة",timestamp:Date.now()
    }).then(()=>{
      cinemaAdmin.log("حجب عمل",it.title||it.name,`#${it.id}`);
      document.getElementById("lcma-bl-results").innerHTML="";
      window.lailCinema.showToast(`🚫 تم حجب «${it.title||it.name}»`)
    })
  },
  renderBlacklist(){
    let c=document.getElementById("lcma-bl-list");if(!c)return;
    let items=Object.entries(st.blacklist||{}).sort((x,y)=>(y[1].timestamp||0)-(x[1].timestamp||0));
    if(!items.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:14px; font-size:12px;">لا توجد أعمال محجوبة.</div>';return}
    c.innerHTML=items.map(([k,it])=>`<div class="lcma-mrow">${it.poster_path?`<img src="https://image.tmdb.org/t/p/w200${it.poster_path}">`:""}<div style="flex:1; min-width:0;"><div style="font-size:12px; font-weight:bold; color:#fecaca;">${h.esc(it.title||k)}</div><div style="font-size:10.5px; color:#94a3b8;">#${it.id} • بواسطة ${h.esc(it.by||"-")}</div></div><button type="button" class="lcma-btn lcma-btn-ok lcma-mini lcma-del-bl" data-k="${h.esc(k)}">فك الحجب</button></div>`).join("");
    c.querySelectorAll(".lcma-del-bl").forEach(b=>b.onclick=()=>{let k=b.dataset.k;window.lailCinema.db.ref(`${ADMIN_PATH}/blacklist/${k}`).remove().then(()=>{cinemaAdmin.log("فك حجب",st.blacklist[k]?.title||k,"");window.lailCinema.showToast("✅ تم فك الحجب")})})
  },
  async renderGenreBlocker(){
    let box=document.getElementById("lcma-genres-box");if(!box)return;
    if(!window.lailCinema.genres.movie.length)await window.lailCinema.fetchGenres();
    let map=new Map;
    [...window.lailCinema.genres.movie,...window.lailCinema.genres.tv].forEach(g=>map.set(g.id,g.name));
    let blocked=st.settings.blockedGenres||[];
    box.innerHTML=Array.from(map.entries()).map(([id,name])=>`<label class="lcma-chip-chk"><input type="checkbox" class="lcma-gb-chk" value="${id}" ${blocked.includes(id)?"checked":""}> ${h.esc(name)}</label>`).join("")
  },
  saveBlockedGenres(){
    let ids=Array.from(document.querySelectorAll(".lcma-gb-chk:checked")).map(x=>Number(x.value));
    cinemaAdmin.patchSettings({blockedGenres:ids},`✅ تم تحديث التصنيفات المحجوبة (${ids.length})`)
  },
  async inspectUser(){
    let raw=(document.getElementById("lcma-insp-user")?.value||"").trim(),san=h.san(raw),box=document.getElementById("lcma-insp-res");
    if(!san||!box||!window.lailCinema.db)return;
    box.innerHTML='<div style="text-align:center; color:#D4AF37; padding:12px;"><i class="fas fa-spinner fa-spin"></i></div>';
    let [hs,fs]=await Promise.all([
      window.lailCinema.db.ref(`lail_cinema/history/${san}`).once("value"),
      window.lailCinema.db.ref(`lail_cinema/favorites/${san}`).once("value")
    ]);
    let hList=Object.values(hs.val()||{}),fList=Object.values(fs.val()||{});
    box.innerHTML=`
      <div class="lcma-g2" style="margin-bottom:8px; text-align:center;">
        <div class="lcma-stat"><div class="lcma-stat-v">${hList.length}</div><div class="lcma-stat-l">سجل المشاهدة</div></div>
        <div class="lcma-stat"><div class="lcma-stat-v">${fList.length}</div><div class="lcma-stat-l">المفضلة</div></div>
      </div>
      <div class="lcma-row" style="gap:6px;">
        <button type="button" id="lcma-clr-uhist" class="lcma-btn lcma-btn-danger lcma-mini" style="flex:1;">مسح سجل مشاهدته</button>
        <button type="button" id="lcma-clr-ufav" class="lcma-btn lcma-btn-danger lcma-mini" style="flex:1;">مسح مفضلته</button>
      </div>`;
    document.getElementById("lcma-clr-uhist").onclick=()=>{if(confirm(`مسح سجل مشاهدة (${raw})؟`))window.lailCinema.db.ref(`lail_cinema/history/${san}`).remove().then(()=>{cinemaAdmin.log("مسح سجل عضو",raw,"");cinemaAdmin.inspectUser();window.lailCinema.showToast("تم المسح")})};
    document.getElementById("lcma-clr-ufav").onclick=()=>{if(confirm(`مسح مفضلة (${raw})؟`))window.lailCinema.db.ref(`lail_cinema/favorites/${san}`).remove().then(()=>{cinemaAdmin.log("مسح مفضلة عضو",raw,"");cinemaAdmin.inspectUser();window.lailCinema.showToast("تم المسح")})}
  },
  loadBanned(){
    window.lailCinema.db?.ref(`${ADMIN_PATH}/banned`).once("value").then(snap=>{st.bannedCache=snap.val()||{};cinemaAdmin.refreshUI()}).catch(()=>{})
  },
  banUser(){
    if(!window.lailCinema.db)return;
    let u=(document.getElementById("lcma-ban-user")?.value||"").trim(),san=h.san(u);
    if(!san)return alert("أدخل اسم المستخدم.");
    let scope=document.getElementById("lcma-ban-scope").value,dur=document.getElementById("lcma-ban-dur").value,reason=(document.getElementById("lcma-ban-reason").value||"").trim();
    let dMap={"1h":36e5,"6h":216e5,"24h":864e5,"3d":2592e5,"7d":6048e5,"30d":2592e6};
    let exp=dMap[dur]?Date.now()+dMap[dur]:null;
    window.lailCinema.db.ref(`${ADMIN_PATH}/banned/${san}`).set({originalName:u,scope,reason,expiresAt:exp,bannedBy:window.lailCinema.myUsername||"الإدارة",timestamp:firebase.database.ServerValue.TIMESTAMP}).then(()=>{
      cinemaAdmin.log("حظر عضو",u,`${scope} | ${exp?h.formatRemaining(exp):"دائم"}`);
      document.getElementById("lcma-ban-user").value="";document.getElementById("lcma-ban-reason").value="";
      cinemaAdmin.loadBanned();window.lailCinema.showToast(`🚫 تم حظر (${u})`)
    })
  },
  renderBanned(){
    let c=document.getElementById("lcma-banned-list");if(!c)return;
    let entries=Object.entries(st.bannedCache||{});
    if(!entries.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:16px; font-size:12px;">لا يوجد محظورون حالياً.</div>';return}
    let sMap={full:"كامل",party_only:"غرف فقط",reactions_only:"تفاعلات فقط"};
    c.innerHTML=entries.map(([k,d])=>{
      let exp=d.expiresAt&&Date.now()>=d.expiresAt;
      return`<div class="lcma-card" style="display:flex; justify-content:space-between; align-items:center; gap:8px;"><div style="min-width:0; flex:1;"><div class="lcma-row" style="gap:5px; margin-bottom:3px;"><b style="font-size:12.5px;">${h.esc(d.originalName||k)}</b><span class="lcma-tag ${exp?"lcma-t-gray":"lcma-t-red"}">${exp?"منتهي":d.expiresAt?h.formatRemaining(d.expiresAt):"دائم"}</span><span class="lcma-tag lcma-t-blue">${sMap[d.scope]||"كامل"}</span></div><div style="font-size:10.5px; color:#94a3b8;">${d.reason?h.esc(d.reason):"بدون سبب"} • ${h.formatDate(d.timestamp)}</div></div><button type="button" class="lcma-btn lcma-btn-ok lcma-mini lcma-unban" data-k="${h.esc(k)}">${exp?"إزالة":"فك الحظر"}</button></div>`
    }).join("");
    c.querySelectorAll(".lcma-unban").forEach(b=>b.onclick=()=>{let k=b.dataset.k;if(confirm(`فك الحظر عن (${k})؟`))window.lailCinema.db.ref(`${ADMIN_PATH}/banned/${k}`).remove().then(()=>{cinemaAdmin.log("فك حظر",k,"");cinemaAdmin.loadBanned();window.lailCinema.showToast("✅ تم فك الحظر")})})
  },
  renderServers(){
    let c=document.getElementById("lcma-servers-list");if(!c)return;
    let srvs=h.getServers(),defId=st.settings.defaultServerId||srvs[0]?.id;
    c.innerHTML=srvs.map((srv,idx)=>{
      let isDef=srv.id===defId;
      return`
        <div class="lcma-card" style="background:rgba(0,0,0,0.25); ${isDef?"border-color:rgba(212,175,55,0.5);":""}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap;">
            <b style="font-size:12.5px;">${h.esc(srv.name)}</b>
            ${isDef?'<span class="lcma-tag lcma-t-gold">الافتراضي ★</span>':""}
          </div>
          <div style="font-size:10px; color:#94a3b8; direction:ltr; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:7px;">${h.esc(srv.movie)}</div>
          <div class="lcma-row" style="gap:5px;">
            ${!isDef?`<button type="button" class="lcma-btn lcma-btn-gold lcma-mini lcma-srv-def" data-id="${h.esc(srv.id)}" style="width:auto;">تعيين كافتراضي</button>`:""}
            ${srvs.length>1?`<button type="button" class="lcma-btn lcma-btn-danger lcma-mini lcma-srv-del" data-i="${idx}"><i class="fas fa-trash"></i> حذف</button>`:""}
          </div>
        </div>`
    }).join("");
    c.querySelectorAll(".lcma-srv-def").forEach(b=>b.onclick=()=>cinemaAdmin.patchSettings({defaultServerId:b.dataset.id},"⭐ تم تغيير السيرفر الافتراضي"));
    c.querySelectorAll(".lcma-srv-del").forEach(b=>b.onclick=()=>{
      let list=h.getServers().map(x=>Object.assign({},x)),i=Number(b.dataset.i);
      if(!confirm(`حذف السيرفر (${list[i].name})؟`))return;
      let removedId=list[i].id;list.splice(i,1);
      let patch={servers:list};
      if(st.settings.defaultServerId===removedId)patch.defaultServerId=list[0].id;
      cinemaAdmin.patchSettings(patch,"🗑️ تم حذف السيرفر")
    })
  },
  addServer(){
    let name=(document.getElementById("lcma-nsrv-name")?.value||"").trim();
    let movie=(document.getElementById("lcma-nsrv-movie")?.value||"").trim();
    let tv=(document.getElementById("lcma-nsrv-tv")?.value||"").trim();
    if(!name||!movie.includes("{id}")||!tv.includes("{id}"))return alert("أدخل اسم السيرفر ورابط الأفلام والمسلسلات وتأكد من وجود {id}.");
    let list=h.getServers().map(x=>Object.assign({},x));
    list.push({id:"srv_"+Date.now(),name,movie,tv});
    cinemaAdmin.patchSettings({servers:list},`✅ تم إضافة السيرفر (${name})`);
    document.getElementById("lcma-nsrv-name").value="";
    document.getElementById("lcma-nsrv-movie").value="";
    document.getElementById("lcma-nsrv-tv").value=""
  },
  savePlayerSettings(){
    cinemaAdmin.patchSettings({
      allowUserServerSwitch:document.getElementById("lcma-set-uswitch").checked,
      allowParties:document.getElementById("lcma-set-parties").checked,
      allowReactions:document.getElementById("lcma-set-reacts").checked,
      allowMiniPlayer:document.getElementById("lcma-set-pip").checked,
      maxRooms:Math.max(0,parseInt(document.getElementById("lcma-set-maxr").value)||0),
      maxPlayersPerRoom:Math.max(0,parseInt(document.getElementById("lcma-set-maxp").value)||0),
      reactionCooldown:Math.max(1,parseInt(document.getElementById("lcma-set-rcd").value)||1),
      customReactions:(document.getElementById("lcma-set-remojis").value||"").trim()||"😂,😱,❤️,🔥"
    },"✅ تم حفظ إعدادات المشغّل والغرف")
  },
  saveGeneralSettings(){
    cinemaAdmin.patchSettings({
      enabled:document.getElementById("lcma-set-enabled").checked,
      allowGuests:document.getElementById("lcma-set-guests").checked,
      safeMode:document.getElementById("lcma-set-safe").checked,
      minRating:Math.max(0,Math.min(9,parseFloat(document.getElementById("lcma-set-minrate").value)||0)),
      disabledMsg:(document.getElementById("lcma-set-offmsg").value||"").trim()||DEFAULT_SETTINGS.disabledMsg
    },"✅ تم حفظ الإعدادات العامة")
  },
  async runAnalytics(){
    let c=document.getElementById("lcma-analytics-body");
    if(!c||!window.lailCinema.db)return;
    c.innerHTML='<div style="text-align:center; color:#D4AF37; padding:22px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    try{
      let [hs,fs]=await Promise.all([window.lailCinema.db.ref("lail_cinema/history").once("value"),window.lailCinema.db.ref("lail_cinema/favorites").once("value")]);
      let hist=hs.val()||{},favs=fs.val()||{},wC={},fC={},uC={},totW=0,totF=0;
      Object.entries(hist).forEach(([u,m])=>{if(!m||"object"!=typeof m)return;let arr=Object.values(m);uC[u]=arr.length;totW+=arr.length;arr.forEach(it=>{if(!it?.id)return;let k=`${it.type}_${it.id}`;wC[k]||(wC[k]={title:it.title||`#${it.id}`,count:0});wC[k].count++})});
      Object.values(favs).forEach(m=>{if(!m||"object"!=typeof m)return;Object.values(m).forEach(it=>{if(!it?.id)return;totF++;let k=`${it.media_type}_${it.id}`;fC[k]||(fC[k]={title:it.title||`#${it.id}`,count:0});fC[k].count++})});
      let topW=Object.values(wC).sort((a,b)=>b.count-a.count).slice(0,10),topF=Object.values(fC).sort((a,b)=>b.count-a.count).slice(0,10),topU=Object.entries(uC).sort((a,b)=>b[1]-a[1]).slice(0,10);
      let med=i=>0===i?"🥇":1===i?"🥈":2===i?"🥉":`${i+1}.`;
      let mk=arr=>arr.length?arr.map((x,i)=>`<div style="display:flex; justify-content:space-between; padding:5px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:4px; font-size:12px;"><span>${med(i)} <b>${h.esc(x.title)}</b></span><span class="lcma-tag lcma-t-gold">${x.count}</span></div>`).join(""):'<div style="color:#64748b; text-align:center; font-size:11.5px;">لا توجد بيانات.</div>';
      c.innerHTML=`
        <div class="lcma-card"><div class="lcma-g3" style="text-align:center;"><div class="lcma-stat"><div class="lcma-stat-v">${Object.keys(hist).length}</div><div class="lcma-stat-l">مشاهدون</div></div><div class="lcma-stat"><div class="lcma-stat-v">${totW}</div><div class="lcma-stat-l">مشاهدات</div></div><div class="lcma-stat"><div class="lcma-stat-v">${totF}</div><div class="lcma-stat-l">مفضلات</div></div></div></div>
        <div class="lcma-card"><div class="lcma-card-t"><span>🔥 الأكثر مشاهدة</span></div>${mk(topW)}</div>
        <div class="lcma-card"><div class="lcma-card-t"><span>❤️ الأكثر تفضيلاً</span></div>${mk(topF)}</div>
        <div class="lcma-card"><div class="lcma-card-t"><span>🍿 أكثر الأعضاء تفاعلاً</span></div>${topU.length?topU.map(([u,cnt],i)=>`<div style="display:flex; justify-content:space-between; padding:5px 8px; background:rgba(0,0,0,0.22); border-radius:8px; margin-bottom:4px; font-size:12px;"><span>${med(i)} <b>${h.esc(u)}</b></span><span class="lcma-tag lcma-t-blue">${cnt}</span></div>`).join(""):'<div style="color:#64748b; text-align:center;">لا توجد بيانات.</div>'}</div>`
    }catch{c.innerHTML='<div style="text-align:center; color:#ef4444; padding:18px;">تعذر التحليل.</div>'}
  },
  cleanIdleRooms(){
    let cut=Date.now()-6*36e5,up={},cnt=0;
    Object.entries(st.roomsCache||{}).forEach(([k,rm])=>{if(!rm||!rm.players||!Object.keys(rm.players).length||(rm.createdAt&&rm.createdAt<cut)||(rm.startTime&&rm.startTime<cut)){up[k]=null;cnt++}});
    if(!cnt)return window.lailCinema.showToast("لا توجد غرف خاملة");
    if(confirm(`تنظيف (${cnt}) غرفة خاملة؟`))window.lailCinema.db.ref("lail_cinema/rooms").update(up).then(()=>{cinemaAdmin.log("تنظيف غرف",`${cnt} غرفة`,"");window.lailCinema.showToast(`🧹 تم تنظيف ${cnt} غرفة`)})
  },
  cleanOldHistory(days){
    if(!window.lailCinema.db||!confirm(`حذف سجلات المشاهدة الأقدم من ${days} يوم؟`))return;
    let cut=Date.now()-days*864e5;
    window.lailCinema.db.ref("lail_cinema/history").once("value").then(snap=>{
      let val=snap.val()||{},up={},cnt=0;
      Object.entries(val).forEach(([u,m])=>{if(m&&"object"==typeof m)Object.entries(m).forEach(([id,it])=>{if(!it?.timestamp||it.timestamp<cut){up[`${u}/${id}`]=null;cnt++}})});
      if(!cnt)return window.lailCinema.showToast("لا توجد سجلات قديمة");
      window.lailCinema.db.ref("lail_cinema/history").update(up).then(()=>{cinemaAdmin.log("تنظيف السجل",`${cnt} سجل`,"");window.lailCinema.showToast(`🧹 تم حذف ${cnt} سجل قديم`)})
    })
  },
  exportBackup(){
    let pack={settings:st.settings,featured:st.featured,blacklist:st.blacklist,banned:st.bannedCache,schedule:st.schedule,poll:st.poll};
    let blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json;charset=utf-8"});
    let url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`lail-cinema-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1e3);
    window.lailCinema.showToast("💾 تم تحميل النسخة الاحتياطية")
  },
  importBackup(ev){
    let f=ev.target.files?.[0];ev.target.value="";if(!f||!window.lailCinema.db)return;
    let rd=new FileReader;
    rd.onload=()=>{
      try{
        let p=JSON.parse(rd.result);
        if(!p||"object"!=typeof p)return alert("ملف غير صالح.");
        if(!confirm("استعادة إعدادات وبيانات إدارة السينما من الملف؟"))return;
        let up={};
        ["settings","featured","blacklist","banned","schedule","poll"].forEach(k=>{if(void 0!==p[k])up[k]=p[k]});
        window.lailCinema.db.ref(ADMIN_PATH).update(up).then(()=>{cinemaAdmin.log("استيراد نسخة","النظام","JSON");cinemaAdmin.loadBanned();window.lailCinema.showToast("✅ تم الاستيراد بنجاح")})
      }catch{alert("❌ ملف JSON غير صالح.")}
    };
    rd.readAsText(f)
  },
  loadLogs(){
    window.lailCinema.db?.ref(`${ADMIN_PATH}/logs`).limitToLast(100).once("value").then(snap=>{
      st.logsCache=Object.entries(snap.val()||{}).map(([id,d])=>Object.assign({id},d)).sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
      cinemaAdmin.renderLogs()
    }).catch(()=>{})
  },
  renderLogs(){
    let c=document.getElementById("lcma-logs-list");if(!c)return;
    let q=(document.getElementById("lcma-log-q")?.value||"").trim().toLowerCase();
    let list=st.logsCache.filter(x=>!q||`${x.admin} ${x.action} ${x.target} ${x.details}`.toLowerCase().includes(q));
    if(!list.length){c.innerHTML='<div style="text-align:center; color:#64748b; padding:12px; font-size:12px;">لا توجد سجلات.</div>';return}
    c.innerHTML=list.map(x=>`<div class="lcma-card" style="padding:7px 10px; background:rgba(0,0,0,0.22);"><div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span class="lcma-tag lcma-t-gold">${h.esc(x.action)}</span><span style="font-size:10px; color:#94a3b8;">${h.formatDate(x.timestamp)}</span></div><div style="font-size:11.5px;"><b style="color:#D4AF37;">${h.esc(x.admin)}</b> ➔ <b style="color:#38bdf8;">${h.esc(x.target)}</b></div>${x.details?`<div style="font-size:11px; color:#94a3b8; margin-top:2px;">${h.esc(x.details)}</div>`:""}</div>`).join("")
  },
  clearLogs(){
    if(confirm("مسح سجل العمليات؟"))window.lailCinema.db?.ref(`${ADMIN_PATH}/logs`).remove().then(()=>{st.logsCache=[];cinemaAdmin.renderLogs();window.lailCinema.showToast("🗑️ تم مسح السجل")})
  }
};

window.lailCinema={
  db:null,
  myUsername:localStorage.getItem("pc_username")||"ضيف_"+Math.floor(1e3*Math.random()),
  currentType:"movie",
  currentGenre:null,
  currentQuery:null,
  currentPage:1,
  isLoading:!1,
  hasMore:!0,
  scrollThrottled:!1,
  currentDetailsItem:null,
  currentVideoData:{id:null,type:null,title:null,s:null,e:null},
  activeServerId:null,
  genres:{movie:[],tv:[]},
  partyCode:null,
  isHost:!1,
  partyListener:null,
  reactionListenerSetup:!1,
  reactionRef:null,
  lastReactionTime:0,
  activeReactionsCount:0,
  _uiBound:!1,

  showToast:function(msg,ms=4e3){
    let el=document.getElementById("cinema-toast");
    if(!el){document.body.insertAdjacentHTML("beforeend",'<div id="cinema-toast" class="lail-toast"></div>');el=document.getElementById("cinema-toast")}
    el&&(el.innerHTML=msg,el.classList.add("show"),setTimeout(()=>el.classList.remove("show"),ms))
  },
  copyDnsHost:function(){
    let host="dns.adguard-dns.com";
    let ok=()=>this.showToast("✅ تم نسخ العنوان: dns.adguard-dns.com");
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(host).then(ok).catch(()=>{
        let ta=document.createElement("textarea");ta.value=host;ta.style.position="fixed";ta.style.opacity="0";
        document.body.appendChild(ta);ta.select();try{document.execCommand("copy");ok()}catch{}ta.remove()
      })
    }else{
      let ta=document.createElement("textarea");ta.value=host;ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.select();try{document.execCommand("copy");ok()}catch{}ta.remove()
    }
  },
  openAdGuide:function(){
    let old=document.getElementById("cinema-adguide-modal");
    old&&old.remove();
    let isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent||"");
    let ov=document.createElement("div");
    ov.id="cinema-adguide-modal";
    ov.className="lail-ag-ov";
    ov.innerHTML=`
      <div class="lail-ag-box">
        <div class="lail-ag-head">
          <div style="display:flex;align-items:center;gap:8px;color:#6ee7b7;font-weight:800;font-size:15px;"><i class="fas fa-shield-alt"></i> إيقاف النوافذ الإعلانية المنبثقة</div>
          <button type="button" class="lail-close-btn" id="lail-ag-close" style="width:30px;height:30px;font-size:13px;"><i class="fas fa-times"></i></button>
        </div>
        <div class="lail-ag-tabs">
          <button type="button" class="lail-ag-tab ${isIOS?"":"active"}" data-agtab="android">📱 أندرويد وسامسونج</button>
          <button type="button" class="lail-ag-tab ${isIOS?"active":""}" data-agtab="ios">🍏 آيفون (iOS)</button>
        </div>
        <div class="lail-ag-body">
          <div id="lail-ag-android" style="display:${isIOS?"none":"block"};">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">بدون برامج — بخطوتين فقط من إعدادات جوالك:</div>
            <div class="lail-ag-dns">
              <code>dns.adguard-dns.com</code>
              <button type="button" class="lail-ag-copy" id="lail-ag-copy-btn"><i class="fas fa-copy"></i> نسخ</button>
            </div>
            <div class="lail-ag-step"><span class="lail-ag-num">1</span><div>افتح <b>الإعدادات</b> ➔ <b>الاتصالات</b> (أو الشبكة والإنترنت) ➔ <b>المزيد من ضبط الاتصال</b> ➔ <b>DNS الخاص (Private DNS)</b>.</div></div>
            <div class="lail-ag-step"><span class="lail-ag-num">2</span><div>اختر <b>اسم مضيف مزود DNS الخاص</b>، الصق العنوان الذي نسخته واضغط <b>حفظ</b>.</div></div>
            <div class="lail-ag-tip">✨ يوقف 99% من النوافذ الإعلانية المنبثقة فوراً بدون التأثير على تشغيل الأفلام أو سرعة الشات.</div>
          </div>
          <div id="lail-ag-ios" style="display:${isIOS?"block":"none"};">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">أسهل طريقتين للآيفون (اختر واحدة فقط):</div>
            <div class="lail-ag-step"><span class="lail-ag-num">1</span><div><b>داخل متصفح سفاري (Safari):</b> حمّل تطبيق <b>AdGuard</b> المجاني من App Store، ثم افتح <b>الإعدادات</b> ➔ <b>التطبيقات</b> ➔ <b>Safari</b> ➔ <b>الملحقات</b> وفعّل خيارات AdGuard.</div></div>
            <div class="lail-ag-step"><span class="lail-ag-num">2</span><div><b>أو عبر متصفح Brave:</b> افتح شات ليل من متصفح <b>Brave</b> المجاني (يحجب جميع النوافذ الإعلانية تلقائياً بدون أي إعدادات).</div></div>
            <div class="lail-ag-tip">✨ تعمل كلتا الطريقتين بصمت دون أن يكتشفها السيرفر أو يتوقف الفيلم.</div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{ev.target===ov&&this.closeAdGuide()});
    document.getElementById("lail-ag-close").onclick=()=>this.closeAdGuide();
    document.getElementById("lail-ag-copy-btn").onclick=()=>this.copyDnsHost();
    ov.querySelectorAll("[data-agtab]").forEach(btn=>{
      btn.onclick=()=>{
        let t=btn.dataset.agtab;
        ov.querySelectorAll("[data-agtab]").forEach(x=>x.classList.toggle("active",x===btn));
        document.getElementById("lail-ag-android").style.display="android"===t?"block":"none";
        document.getElementById("lail-ag-ios").style.display="ios"===t?"block":"none"
      }
    });
    requestAnimationFrame(()=>ov.classList.add("active"))
  },
  closeAdGuide:function(){
    let m=document.getElementById("cinema-adguide-modal");
    m&&(m.classList.remove("active"),setTimeout(()=>m.remove(),200))
  },
  updateIdentity:function(u){
    if(!u||!u.trim())return;
    let clean=u.trim();
    if(this.myUsername!==clean){
      this.myUsername=clean;localStorage.setItem("pc_username",clean);
      injectAdminBtn();this.bindMyBanListener()
    }
  },
  setPresence:function(watchingText){
    if(!this.db)return;
    let san=h.san(this.myUsername);if(!san)return;
    if(!watchingText){
      if(st.myPresenceRef){st.myPresenceRef.remove().catch(()=>{});st.myPresenceRef=null}
      return
    }
    let ref=this.db.ref(`lail_cinema/presence/${san}`);
    st.myPresenceRef=ref;
    ref.onDisconnect().remove();
    ref.set({name:this.myUsername,watching:watchingText,ts:Date.now()}).catch(()=>{})
  },
  setIframeUrl:function(url){
    let ifr=document.getElementById("cinema-iframe");
    ifr&&(ifr.src=url||"")
  },
  switchPlayerServer:function(srvId){
    this.activeServerId=srvId;
    let v=this.currentVideoData;
    if(v&&v.id){
      this.setIframeUrl(h.buildEmbedUrl(v.type,v.id,v.s,v.e,srvId));
      this.showToast("🔄 تم تبديل السيرفر")
    }
  },
  renderReactionButtons:function(){
    let bar=document.getElementById("party-reactions");if(!bar)return;
    let list=(st.settings.customReactions||"😂,😱,❤️,🔥").split(/[,،\s]+/).map(x=>x.trim()).filter(Boolean).slice(0,8);
    bar.innerHTML=list.map(em=>`<button class="lail-reaction-btn" data-em="${h.esc(em)}">${h.esc(em)}</button>`).join("");
    bar.querySelectorAll(".lail-reaction-btn").forEach(b=>b.onclick=()=>this.sendReaction(b.dataset.em))
  },
  renderEventAndPoll:function(){
    let evArea=document.getElementById("cinema-event-area");
    if(st.countdownTimer){clearInterval(st.countdownTimer);st.countdownTimer=null}
    if(evArea){
      let sch=st.schedule;
      if(sch&&sch.active&&sch.time){
        evArea.innerHTML=`
          <div class="lail-event-strip">
            <div style="display:flex; align-items:center; gap:12px;">
              ${sch.poster_path?`<img src="https://image.tmdb.org/t/p/w200${sch.poster_path}" style="width:48px; height:70px; object-fit:cover; border-radius:8px;">`:""}
              <div>
                <div style="color:#D4AF37; font-size:.85rem; font-weight:bold;">👑 ${h.esc(sch.note||"سهرة سينما ليل")}</div>
                <div style="font-size:1.15rem; font-weight:900; margin-top:2px;">${h.esc(sch.title)}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <div id="lail-event-cd-val" class="lail-event-cd">...</div>
              <button type="button" class="lail-play-btn" style="padding:8px 16px; font-size:.9rem;" onclick="window.lailCinema.openDetails(${sch.id},'${sch.media_type}')">التفاصيل</button>
            </div>
          </div>`;
        let tick=()=>{
          let el=document.getElementById("lail-event-cd-val");if(!el)return;
          let diff=sch.time-Date.now();
          if(diff<=0){el.textContent="🎬 بدأت السهرة الآن!";return}
          let d=Math.floor(diff/864e5),hr=Math.floor(diff%864e5/36e5),mn=Math.floor(diff%36e5/6e4),sc=Math.floor(diff%6e4/1e3);
          el.textContent=(d?`${d}d `:"")+`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(sc).padStart(2,"0")}`
        };
        tick();st.countdownTimer=setInterval(tick,1e3)
      }else evArea.innerHTML=""
    }
    let pArea=document.getElementById("cinema-poll-area");
    if(pArea){
      let p=st.poll;
      if(p&&p.active&&Array.isArray(p.options)&&p.options.length){
        let mySan=h.san(this.myUsername),myVote=p.votes&&void 0!==p.votes[mySan]?Number(p.votes[mySan]):-1;
        let allVotes=Object.values(p.votes||{}),tot=allVotes.length;
        pArea.innerHTML=`
          <div class="lail-poll-box">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <div style="font-weight:800; color:#D4AF37; font-size:1rem;">${h.esc(p.question||"🗳️ صوّت لفيلم السهرة")}</div>
              <span style="font-size:.82rem; color:#94a3b8;">${tot} صوت</span>
            </div>
            <div class="lail-poll-grid">
              ${p.options.map((o,idx)=>{
                let cnt=allVotes.filter(v=>Number(v)===idx).length,pct=tot?Math.round(cnt/tot*100):0;
                return`<button type="button" class="lail-poll-opt ${myVote===idx?"voted":""}" data-pidx="${idx}">${o.poster_path?`<img src="https://image.tmdb.org/t/p/w200${o.poster_path}">`:""}<div style="flex:1; min-width:0;"><div style="font-weight:bold; font-size:.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${h.esc(o.title)}</div><div style="font-size:.78rem; color:#D4AF37; margin-top:4px;">${cnt} صوت (${pct}%) ${myVote===idx?"✓":""}</div></div></button>`
              }).join("")}
            </div>
          </div>`;
        pArea.querySelectorAll(".lail-poll-opt").forEach(b=>b.onclick=()=>{
          if(!this.db)return;
          let idx=Number(b.dataset.pidx);
          this.db.ref(`${ADMIN_PATH}/poll/votes/${h.san(this.myUsername)}`).set(idx).then(()=>this.showToast("✅ تم تسجيل صوتك!"))
        })
      }else pArea.innerHTML=""
    }
  },
  applyAdminSettings:function(){
    let s=st.settings,adm=h.isAdmin();
    let app=document.getElementById("lail-cinema-app");
    if(!1===s.enabled&&!adm&&app&&"flex"===app.style.display){
      this.closePlayer();this.close();alert(s.disabledMsg||DEFAULT_SETTINGS.disabledMsg)
    }
    let offB=document.getElementById("cinema-admin-off-banner");
    offB&&(offB.style.display=!1===s.enabled&&adm?"block":"none");
    let annB=document.getElementById("cinema-announcement-banner"),annT=document.getElementById("cinema-announcement-text");
    annB&&annT&&(s.bannerText?(annT.textContent=s.bannerText,annB.style.display="flex"):annB.style.display="none");
    let navP=document.getElementById("cinema-nav-party-btn"),detP=document.getElementById("details-party-btn");
    navP&&(navP.style.display=!1===s.allowParties&&!adm?"none":"flex");
    detP&&(detP.style.display=!1===s.allowParties&&!adm?"none":"flex");
    let pipB=document.getElementById("lail-pip-btn");
    pipB&&(pipB.style.display=!1===s.allowMiniPlayer?"none":"flex");
    let srvSel=document.getElementById("lail-player-server-sel");
    if(srvSel){
      let srvs=h.getServers();
      if((!1!==s.allowUserServerSwitch||adm)&&srvs.length>1){
        srvSel.innerHTML=srvs.map(x=>`<option value="${h.esc(x.id)}">${h.esc(x.name)}</option>`).join("");
        srvSel.value=this.activeServerId||s.defaultServerId||srvs[0].id;
        srvSel.style.display="inline-block"
      }else srvSel.style.display="none"
    }
    this.renderReactionButtons();
    app&&"flex"===app.style.display&&this.renderEventAndPoll()
  },
  bindMyBanListener:function(){
    if(!this.db)return;
    let san=h.san(this.myUsername);if(!san||st.listenedBanUser===san)return;
    st.listenedBanUser&&this.db.ref(`${ADMIN_PATH}/banned/${st.listenedBanUser}`).off();
    st.listenedBanUser=san;
    this.db.ref(`${ADMIN_PATH}/banned/${san}`).on("value",snap=>{
      st.myBan=snap.val()||null;
      let b=h.getActiveBan();
      if(b&&"full"===b.scope&&!h.isAdmin()){
        let app=document.getElementById("lail-cinema-app");
        if(app&&"flex"===app.style.display){this.closePlayer();this.close();alert(h.banMsg(b))}
      }
    })
  },
  initFirebase:function(){
    if(!this.db){
      if("undefined"!=typeof firebase&&firebase.database&&firebase.apps.length>0){
        this.db=firebase.database();this.bindGlobalListeners()
      }else setTimeout(()=>this.initFirebase(),500)
    }else st.globalBound||this.bindGlobalListeners()
  },
  bindGlobalListeners:function(){
    if(!this.db||st.globalBound)return;
    st.globalBound=!0;
    this.db.ref("admins").on("value",snap=>{
      st.adminUsers=Object.keys(snap.val()||{});
      injectAdminBtn();this.applyAdminSettings();
      h.isAdmin()||cinemaAdmin.close()
    });
    this.db.ref(`${ADMIN_PATH}/settings`).on("value",snap=>{
      let v=snap.val();
      st.settings=v&&"object"==typeof v?Object.assign({},DEFAULT_SETTINGS,v):Object.assign({},DEFAULT_SETTINGS);
      this.applyAdminSettings();cinemaAdmin.refreshUI()
    });
    this.db.ref(`${ADMIN_PATH}/featured`).on("value",snap=>{st.featured=snap.val()||{};cinemaAdmin.refreshUI()});
    this.db.ref(`${ADMIN_PATH}/blacklist`).on("value",snap=>{st.blacklist=snap.val()||{};cinemaAdmin.refreshUI()});
    this.db.ref(`${ADMIN_PATH}/schedule`).on("value",snap=>{st.schedule=snap.val()||null;this.renderEventAndPoll();cinemaAdmin.refreshUI()});
    this.db.ref(`${ADMIN_PATH}/poll`).on("value",snap=>{st.poll=snap.val()||null;this.renderEventAndPoll();cinemaAdmin.refreshUI()});
    this.db.ref(`${ADMIN_PATH}/broadcast`).on("value",snap=>{
      let v=snap.val();
      if(v&&v.text&&v.ts>st.bootTs&&Date.now()-v.ts<2e4){
        let app=document.getElementById("lail-cinema-app"),pl=document.getElementById("cinema-player");
        if((app&&"flex"===app.style.display)||(pl&&"flex"===pl.style.display))this.showToast(`📢 ${h.esc(v.text)}`,7e3)
      }
    });
    this.bindMyBanListener()
  },
  init:async function(){
    this.initFirebase();
    let s=st.settings,adm=h.isAdmin();
    if(!adm&&!1===s.enabled)return alert(s.disabledMsg||DEFAULT_SETTINGS.disabledMsg);
    if(!adm&&!1===s.allowGuests&&h.isGuest())return alert("سينما ليل متاحة للأعضاء المسجلين فقط 🎬");
    let ban=h.getActiveBan();
    if(!adm&&ban&&"full"===ban.scope)return alert(h.banMsg(ban));

    let app=document.getElementById("lail-cinema-app");
    app||(document.body.insertAdjacentHTML("beforeend",APP_HTML),app=document.getElementById("lail-cinema-app"));
    app&&(app.style.display="flex");
    if(!this._uiBound){this._uiBound=!0;this.setupScrollListener();this.setupDraggableMiniPlayer()}
    this.setPresence("يتصفح السينما");
    this.applyAdminSettings();
    0===this.genres.movie.length&&await this.fetchGenres();
    let nv=document.getElementById("cinema-netflix-view");
    nv&&""===nv.innerHTML.trim()&&this.switchMainTab(this.currentType)
  },
  close:function(){
    this.closeAdGuide();
    let ifr=document.getElementById("cinema-iframe"),pl=document.getElementById("cinema-player"),ico=document.querySelector("#lail-pip-btn i"),app=document.getElementById("lail-cinema-app");
    if(st.countdownTimer){clearInterval(st.countdownTimer);st.countdownTimer=null}
    if(pl&&"flex"===pl.style.display&&ifr&&ifr.src&&""!==ifr.src&&"about:blank"!==ifr.src&&!1!==st.settings.allowMiniPlayer){
      !pl.classList.contains("mini-mode")&&(pl.classList.add("mini-mode"),ico&&(ico.className="fas fa-expand-arrows-alt"));
      app&&(app.style.display="none")
    }else{
      app&&(app.style.display="none");pl&&(pl.style.display="none");ifr&&(ifr.src="");
      this.setPresence(null);
      let nv=document.getElementById("cinema-netflix-view"),gr=document.getElementById("cinema-grid"),si=document.getElementById("cinema-search-input");
      nv&&(nv.innerHTML="");gr&&(gr.innerHTML="");si&&(si.value="");
      this.currentQuery=null;this.currentGenre=null;this.currentPage=1;this.hasMore=!0
    }
    let rb=document.getElementById("party-restore-btn");rb&&(rb.style.display="none")
  },
  switchMainTab:function(tp){
    this.currentType=tp;this.currentGenre=null;this.currentQuery=null;
    document.querySelectorAll(".lail-c-tab").forEach(x=>x.classList.remove("active"));
    let tab=document.getElementById(`tab-${tp}`);tab&&tab.classList.add("active");
    let si=document.getElementById("cinema-search-input");si&&(si.value="");
    this.renderSidebar();
    if("fav"===tp)this.loadFavorites();
    else{
      let gv=document.getElementById("cinema-grid-view"),nv=document.getElementById("cinema-netflix-view");
      gv&&(gv.style.display="none");nv&&(nv.style.display="block");
      this.buildNetflixLayout(tp)
    }
  },
  appendFeaturedRow:function(c,tp){
    let items=Object.values(st.featured||{}).filter(x=>x&&x.id&&x.media_type===tp&&!h.isBlacklisted(x.id,x.media_type)).sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
    if(!items.length)return;
    let html=`<div class="lail-row-container"><div class="lail-row-title" style="color:#D4AF37; border-right-color:#D4AF37;">👑 اختيارات إدارة ليل</div><div class="lail-row-scroller">`;
    items.forEach(it=>{
      let p=it.poster_path?`https://image.tmdb.org/t/p/w500${it.poster_path}`:"https://via.placeholder.com/500x750/1a1a1f/fff?text=Lail+Cinema";
      html+=`<div class="lail-movie-card" style="border:1px solid rgba(212,175,55,0.45);" onclick="window.lailCinema.openDetails(${it.id}, '${it.media_type}')"><div class="lail-featured-badge">${h.esc(it.badge||"اختيار الإدارة ⭐")}</div><div class="lail-movie-rate"><i class="fas fa-star"></i> ${it.vote_average?Number(it.vote_average).toFixed(1):"N/A"}</div><img class="lail-movie-poster" src="${p}" loading="lazy"><div class="lail-movie-title-overlay">${h.esc(it.title)}</div></div>`
    });
    html+="</div></div>";c.insertAdjacentHTML("beforeend",html)
  },
  buildNetflixLayout:async function(tp){
    let nv=document.getElementById("cinema-netflix-view");if(!nv)return;
    nv.innerHTML='<div class="lail-loader" style="margin-top:100px;"><div class="lail-spinner"></div></div>';
    try{
      let hist=[];
      if(this.db){
        let snap=(await this.db.ref(`lail_cinema/history/${h.san(this.myUsername)}`).once("value")).val();
        snap&&(hist=Object.values(snap).filter(x=>x&&x.type===tp&&!h.isBlacklisted(x.id,x.type)).sort((a,b)=>b.timestamp-a.timestamp).slice(0,15))
      }
      let rows="movie"===tp
        ?[{title:"🔥 توب 10 (اليوم)",url:"trending/movie/day"},{title:"📈 الأكثر شعبية",url:"movie/popular"},{title:"⭐ الأعلى تقييماً",url:"movie/top_rated"},{title:"🆕 أفلام جديدة",url:"movie/now_playing"}]
        :[{title:"🔥 توب 10 (اليوم)",url:"trending/tv/day"},{title:"📈 الأكثر شعبية",url:"tv/popular"},{title:"⭐ الأعلى تقييماً",url:"tv/top_rated"},{title:"📺 يعرض حالياً",url:"tv/on_the_air"}];
      let res=await Promise.all(rows.map(r=>fetch(`https://api.themoviedb.org/3/${r.url}?api_key=${TMDB_KEY}&language=ar`).then(x=>x.json())));
      nv.innerHTML="";
      this.appendFeaturedRow(nv,tp);
      hist.length>0&&this.appendHistoryRow(nv,"▶️ استمر في المشاهدة",hist);
      res.forEach((d,idx)=>{this.appendNetflixRow(nv,rows[idx].title,d.results,tp)})
    }catch{nv.innerHTML='<div style="text-align:center; padding:50px;">حدث خطأ في التحميل.</div>'}
  },
  appendHistoryRow:function(c,title,items){
    let html=`<div class="lail-row-container"><div class="lail-row-title" style="color:#e50914;">${title}</div><div class="lail-row-scroller">`;
    items.forEach(x=>{html+=`<div class="lail-movie-card lail-continue-card" onclick="window.lailCinema.openDetails(${x.id}, '${x.type}')">${x.season?`<div class="lail-ep-badge">S${x.season} E${x.episode}</div>`:""}<img class="lail-movie-poster" src="${x.poster?`https://image.tmdb.org/t/p/w500${x.poster}`:"https://via.placeholder.com/500x750/1a1a1f/fff?text=Lail+Cinema"}" loading="lazy"><div class="lail-movie-title-overlay">${h.esc(x.title)}</div></div>`});
    html+="</div></div>";c.insertAdjacentHTML("beforeend",html)
  },
  appendNetflixRow:function(c,title,items,tp){
    let minR=Number(st.settings.minRating)||0;
    let clean=(items||[]).filter(x=>x&&x.poster_path&&!h.isBlacklisted(x.id,x.media_type||tp)&&!h.isGenreBlocked(x.genre_ids)&&((x.vote_average||0)>=minR||minR===0));
    if(!clean.length)return;
    let html=`<div class="lail-row-container"><div class="lail-row-title">${title}</div><div class="lail-row-scroller">`;
    clean.forEach(x=>{html+=`<div class="lail-movie-card" onclick="window.lailCinema.openDetails(${x.id}, '${x.media_type||tp}')"><div class="lail-movie-rate"><i class="fas fa-star"></i> ${x.vote_average?x.vote_average.toFixed(1):"N/A"}</div><img class="lail-movie-poster" src="https://image.tmdb.org/t/p/w500${x.poster_path}" loading="lazy"><div class="lail-movie-title-overlay">${h.esc(x.title||x.name)}</div></div>`});
    html+="</div></div>";c.insertAdjacentHTML("beforeend",html)
  },
  toggleSidebar:function(){
    let sb=document.getElementById("cinema-sidebar"),ov=document.getElementById("sidebar-overlay");
    sb&&ov&&("0px"===sb.style.right?(sb.style.right="-300px",ov.style.opacity="0",setTimeout(()=>ov.style.display="none",300)):(ov.style.display="block",setTimeout(()=>{ov.style.opacity="1";sb.style.right="0px"},10)))
  },
  fetchGenres:async function(){
    try{
      let [mr,tr]=await Promise.all([fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}&language=ar`),fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_KEY}&language=ar`)]);
      this.genres.movie=(await mr.json()).genres||[];this.genres.tv=(await tr.json()).genres||[];
      this.renderSidebar()
    }catch{}
  },
  renderSidebar:function(){
    let el=document.getElementById("sidebar-genres");if(!el)return;
    el.innerHTML=`<div class="lail-genre-item ${this.currentGenre?"":"active"}" onclick="window.lailCinema.switchMainTab('${this.currentType}')"><i class="fas fa-home"></i> الرئيسية</div>`;
    if("fav"===this.currentType)return;
    let blocked=st.settings.blockedGenres||[],list=("movie"===this.currentType?this.genres.movie:this.genres.tv).filter(g=>!blocked.includes(g.id));
    let icons={28:"fa-fist-raised",12:"fa-compass",16:"fa-child",35:"fa-laugh-squint",80:"fa-user-secret",99:"fa-video",18:"fa-theater-masks",10751:"fa-users",14:"fa-dragon",36:"fa-monument",27:"fa-ghost",10402:"fa-music",9648:"fa-search",10749:"fa-heart",878:"fa-rocket",10770:"fa-tv",53:"fa-running",10752:"fa-fighter-jet",37:"fa-hat-cowboy",10759:"fa-bomb",10765:"fa-meteor"};
    list.forEach(g=>{el.innerHTML+=`<div class="lail-genre-item ${this.currentGenre===g.id?"active":""}" onclick="window.lailCinema.selectGenre(${g.id}, '${g.name}')"><i class="fas ${icons[g.id]||"fa-film"}"></i> ${g.name}</div>`})
  },
  selectGenre:function(id,name){
    this.currentGenre=id;this.currentQuery=null;
    let si=document.getElementById("cinema-search-input"),gh=document.getElementById("grid-header");
    si&&(si.value="");gh&&(gh.innerHTML=`<i class="fas fa-list"></i> تصنيف: ${h.esc(name)}`);
    this.toggleSidebar();this.renderSidebar();
    let nv=document.getElementById("cinema-netflix-view"),gv=document.getElementById("cinema-grid-view");
    nv&&(nv.style.display="none");gv&&(gv.style.display="block");this.loadGridContent(!0)
  },
  executeSearch:function(){
    let si=document.getElementById("cinema-search-input");if(!si)return;
    let q=si.value.trim();if(!q)return;
    this.currentQuery=q;this.currentGenre=null;
    let gh=document.getElementById("grid-header"),nv=document.getElementById("cinema-netflix-view"),gv=document.getElementById("cinema-grid-view");
    gh&&(gh.innerHTML=`<i class="fas fa-search"></i> نتائج: ${h.esc(q)}`);
    nv&&(nv.style.display="none");gv&&(gv.style.display="block");this.loadGridContent(!0)
  },
  loadGridContent:async function(reset=!1){
    if(this.isLoading||(!this.hasMore&&!reset))return;
    this.isLoading=!0;
    let gr=document.getElementById("cinema-grid"),ld=document.getElementById("cinema-loader");
    if(gr&&ld){
      reset&&(this.currentPage=1,this.hasMore=!0,gr.innerHTML="");ld.style.display="flex";
      try{
        let adult=st.settings.safeMode?"&include_adult=false":"",url="";
        this.currentQuery?url=`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ar${adult}&query=${encodeURIComponent(this.currentQuery)}&page=${this.currentPage}`:this.currentGenre&&(url=`https://api.themoviedb.org/3/discover/${this.currentType}?api_key=${TMDB_KEY}&language=ar${adult}&with_genres=${this.currentGenre}&page=${this.currentPage}&sort_by=popularity.desc`);
        let data=await (await fetch(url)).json(),items=data.results||[];
        this.currentQuery&&(items=items.filter(x=>"movie"===x.media_type||"tv"===x.media_type));
        this.appendGridItems(items);
        data.page>=data.total_pages||data.page>=50?this.hasMore=!1:this.currentPage++
      }catch{}
      ld.style.display="none";this.isLoading=!1
    }
  },
  appendGridItems:function(items){
    let gr=document.getElementById("cinema-grid");if(!gr)return;
    let clean=(items||[]).filter(x=>x&&x.poster_path&&!h.isBlacklisted(x.id,x.media_type||this.currentType)&&!h.isGenreBlocked(x.genre_ids));
    if(0===clean.length&&1===this.currentPage){gr.innerHTML='<div style="grid-column:1/-1; text-align:center; padding:50px; color:#aaa;">لا توجد نتائج.</div>';return}
    let frag=document.createDocumentFragment();
    clean.forEach(x=>{
      let mt=x.media_type||this.currentType,img=x.poster_path.startsWith("http")?x.poster_path:`https://image.tmdb.org/t/p/w500${x.poster_path}`,rt=x.vote_average?x.vote_average.toFixed(1):"N/A";
      let card=document.createElement("div");card.className="lail-movie-card";card.onclick=()=>this.openDetails(x.id,mt);
      card.innerHTML=`<div class="lail-movie-rate"><i class="fas fa-star"></i> ${rt}</div><img class="lail-movie-poster" src="${img}" loading="lazy"><div class="lail-movie-title-overlay">${h.esc(x.title||x.name)}</div>`;
      frag.appendChild(card)
    });
    gr.appendChild(frag)
  },
  setupScrollListener:function(){
    let body=document.getElementById("cinema-main-body");
    body&&body.addEventListener("scroll",()=>{this.scrollThrottled||(this.scrollThrottled=!0,setTimeout(()=>{let gv=document.getElementById("cinema-grid-view");gv&&"block"===gv.style.display&&"fav"!==this.currentType&&Math.ceil(body.scrollTop+body.clientHeight)>=body.scrollHeight-400&&this.loadGridContent();this.scrollThrottled=!1},200))})
  },
  loadFavorites:function(){
    let nv=document.getElementById("cinema-netflix-view"),gv=document.getElementById("cinema-grid-view"),gh=document.getElementById("grid-header"),gr=document.getElementById("cinema-grid");
    nv&&(nv.style.display="none");gv&&(gv.style.display="block");gh&&(gh.innerHTML='<i class="fas fa-heart" style="color:#ef4444;"></i> قائمة مفضلاتي');
    if(!gr)return;
    if(gr.innerHTML='<div class="lail-loader" style="margin-top:50px;"><div class="lail-spinner"></div></div>',!this.db){gr.innerHTML='<div style="grid-column:1/-1; text-align:center; padding:50px; color:#ef4444;">جاري الاتصال بالقاعدة...</div>';return}
    this.db.ref(`lail_cinema/favorites/${h.san(this.myUsername)}`).once("value").then(snap=>{
      gr.innerHTML="";let list=Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp);
      if(!list.length){gr.innerHTML='<div style="grid-column:1/-1; text-align:center; padding:50px; color:#aaa;"><i class="far fa-folder-open fa-3x" style="margin-bottom:15px; opacity:0.5;"></i><br>قائمة مفضلاتك فارغة حالياً.</div>';return}
      this.appendGridItems(list)
    }).catch(()=>{gr.innerHTML='<div style="grid-column:1/-1; text-align:center; padding:50px; color:#ef4444;">حدث خطأ.</div>'})
  },
  checkIfFavorite:function(id){
    let btn=document.getElementById("details-fav-btn");if(!btn)return;
    btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التحقق';btn.className="lail-fav-btn";
    if(!this.db)return;
    this.db.ref(`lail_cinema/favorites/${h.san(this.myUsername)}/${id}`).once("value").then(snap=>{
      snap.exists()?(btn.className="lail-fav-btn is-fav",btn.innerHTML='<i class="fas fa-heart"></i> إزالة من المفضلة'):(btn.className="lail-fav-btn",btn.innerHTML='<i class="far fa-heart"></i> أضف للمفضلة')
    })
  },
  toggleFavorite:function(){
    if(!this.db||!this.currentDetailsItem)return this.showToast("خطأ في الاتصال، حاول مجدداً.");
    let it=this.currentDetailsItem,id=it.id,mt=it.title?"movie":"tv",title=it.title||it.name,ref=this.db.ref(`lail_cinema/favorites/${h.san(this.myUsername)}/${id}`),btn=document.getElementById("details-fav-btn");
    if(!btn)return;
    if(btn.classList.contains("is-fav"))ref.remove().then(()=>{btn.className="lail-fav-btn";btn.innerHTML='<i class="far fa-heart"></i> أضف للمفضلة';this.showToast("تمت الإزالة من المفضلة 🗑️");"fav"===this.currentType&&this.loadFavorites()});
    else ref.set({id,media_type:mt,title,poster_path:it.poster_path,vote_average:it.vote_average,timestamp:Date.now()}).then(()=>{btn.className="lail-fav-btn is-fav";btn.innerHTML='<i class="fas fa-heart"></i> إزالة من المفضلة';this.showToast("تمت الإضافة إلى مفضلاتك ❤️")})
  },
  openDetails:async function(id,tp){
    if(h.isBlacklisted(id,tp)&&!h.isAdmin())return this.showToast("🚫 هذا العمل غير متاح حالياً من قبل الإدارة.");
    this.currentDetailsId=id;
    let det=document.getElementById("cinema-details");if(!det)return;
    det.style.display="flex";det.scrollTop=0;
    let tvB=document.getElementById("tv-episodes-container"),rcB=document.getElementById("recs-container"),dt=document.getElementById("details-title"),bd=document.getElementById("details-backdrop"),ps=document.getElementById("details-poster"),pw=document.getElementById("details-poster-wrap");
    tvB&&(tvB.style.display="none");rcB&&(rcB.style.display="none");dt&&(dt.innerText="جاري التحميل...");
    bd&&(bd.removeAttribute("src"),bd.style.opacity="0");
    ps&&ps.removeAttribute("src");
    pw&&(pw.style.display="none");
    document.getElementById("details-genres")&&(document.getElementById("details-genres").innerHTML="");
    document.getElementById("details-cast")&&(document.getElementById("details-cast").innerHTML="");
    this.applyAdminSettings();
    try{
      let o=await (await fetch(`https://api.themoviedb.org/3/${tp}/${id}?api_key=${TMDB_KEY}&language=ar&append_to_response=recommendations,release_dates,content_ratings,credits`)).json();
      this.currentDetailsItem=o;this.checkIfFavorite(id);
      let title=o.title||o.name,date=o.release_date||o.first_air_date||"";
      let bg=o.backdrop_path?`https://image.tmdb.org/t/p/w1280${o.backdrop_path}`:(o.poster_path?`https://image.tmdb.org/t/p/w500${o.poster_path}`:"");
      let pos=o.poster_path?`https://image.tmdb.org/t/p/w500${o.poster_path}`:(o.backdrop_path?`https://image.tmdb.org/t/p/w500${o.backdrop_path}`:"");
      bd&&(bg?(bd.src=bg,bd.style.opacity="0.6"):(bd.removeAttribute("src"),bd.style.opacity="0"));
      if(ps&&pw){pos?(ps.src=pos,pw.style.display="block"):(ps.removeAttribute("src"),pw.style.display="none")}
      dt&&(dt.innerText=title);
      document.getElementById("details-overview")&&(document.getElementById("details-overview").innerText=o.overview||"القصة غير متوفرة باللغة العربية حالياً.");
      document.getElementById("details-rate")&&(document.getElementById("details-rate").innerHTML=`<i class="fas fa-star"></i> ${o.vote_average?o.vote_average.toFixed(1):"N/A"}`);
      document.getElementById("details-date")&&(document.getElementById("details-date").innerText=date.split("-")[0]);
      let sc=Math.floor(10*(o.vote_average||0));document.getElementById("details-score")&&(document.getElementById("details-score").innerText=sc>0?`موصى به ${sc}%`:"موصى به");
      let age="+13";
      if("movie"===tp&&o.release_dates?.results){let f=o.release_dates.results.find(x=>"US"===x.iso_3166_1);f?.release_dates[0]?.certification&&(age=f.release_dates[0].certification)}
      else if("tv"===tp&&o.content_ratings?.results){let g=o.content_ratings.results.find(x=>"US"===x.iso_3166_1);g?.rating&&(age=g.rating)}
      document.getElementById("details-age")&&(document.getElementById("details-age").innerText=age);
      document.getElementById("details-runtime")&&(document.getElementById("details-runtime").innerText="movie"===tp&&o.runtime?`${Math.floor(o.runtime/60)}س ${o.runtime%60}د`:"");
      o.genres&&document.getElementById("details-genres")&&(document.getElementById("details-genres").innerHTML=o.genres.map(g=>`<span class="lail-genre-badge">${h.esc(g.name)}</span>`).join(""));
      o.credits?.cast&&document.getElementById("details-cast")&&(document.getElementById("details-cast").innerHTML=`تمثيل: <span>${h.esc(o.credits.cast.slice(0,4).map(x=>x.name).join("، "))}</span>`);
      let pBtn=document.getElementById("details-play-btn");
      pBtn&&("movie"===tp?(pBtn.innerHTML='<i class="fas fa-play"></i> تشغيل الفيلم',pBtn.onclick=()=>this.playVideo(id,"movie",title)):(pBtn.innerHTML='<i class="fas fa-list"></i> اختر حلقة',pBtn.onclick=()=>{tvB&&tvB.scrollIntoView({behavior:"smooth"})},this.renderTvSeasons(o)));
      o.recommendations?.results?.length>0&&this.renderRecommendations(o.recommendations.results,tp)
    }catch{}
  },
  renderRecommendations:function(items,tp){
    let box=document.getElementById("recs-container"),sc=document.getElementById("recs-scroller");if(!box||!sc)return;
    sc.innerHTML="";box.style.display="block";let cnt=0,frag=document.createDocumentFragment();
    items.forEach(x=>{if(!x.poster_path||cnt>=12||h.isBlacklisted(x.id,tp))return;cnt++;let card=document.createElement("div");card.className="lail-movie-card";card.onclick=()=>{let d=document.getElementById("cinema-details");d&&(d.scrollTop=0);this.openDetails(x.id,tp)};card.innerHTML=`<img class="lail-movie-poster" src="https://image.tmdb.org/t/p/w300${x.poster_path}" loading="lazy">`;frag.appendChild(card)});
    sc.appendChild(frag)
  },
  closeDetails:function(){let d=document.getElementById("cinema-details");d&&(d.style.display="none")},
  renderTvSeasons:function(o){
    let box=document.getElementById("tv-episodes-container"),sel=document.getElementById("season-selector");if(!box||!sel)return;
    box.style.display="block";sel.innerHTML="";
    let list=(o.seasons||[]).filter(x=>x.season_number>0);
    if(!list.length){let el=document.getElementById("episodes-list");el&&(el.innerHTML="<p style='color:#aaa;'>لا توجد مواسم مدرجة.</p>");return}
    list.forEach(s=>{let opt=document.createElement("option");opt.value=s.season_number;opt.innerText=s.name||`الموسم ${s.season_number}`;sel.appendChild(opt)});
    this.loadSeason(list[0].season_number)
  },
  loadSeason:async function(seasonNum){
    let el=document.getElementById("episodes-list");if(!el)return;
    el.innerHTML='<div style="text-align:center; padding:20px;"><div class="lail-spinner"></div></div>';
    try{
      let data=await (await fetch(`https://api.themoviedb.org/3/tv/${this.currentDetailsId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar`)).json();
      el.innerHTML="";let frag=document.createDocumentFragment(),sName=this.currentDetailsItem?this.currentDetailsItem.name||this.currentDetailsItem.title:"";
      let showP=!1!==st.settings.allowParties||h.isAdmin();
      (data.episodes||[]).forEach(ep=>{
        let img=ep.still_path?`https://image.tmdb.org/t/p/w300${ep.still_path}`:"https://via.placeholder.com/300x170/1a1a1f/555?text=Lail+Cinema";
        let row=document.createElement("div");row.className="lail-episode-item";
        row.innerHTML=`<div class="lail-ep-img-wrapper"><img class="lail-ep-img" src="${img}" loading="lazy"><i class="fas fa-play-circle lail-ep-play-icon"></i></div><div class="lail-ep-info"><h4 class="lail-ep-title"><span>${ep.episode_number}. ${h.esc(ep.name)}</span>${showP?'<button class="lail-party-btn lail-ep-pbtn" style="padding:4px 8px; font-size:0.8rem;" title="غرفة جماعية"><i class="fas fa-users"></i></button>':""}</h4><p class="lail-ep-desc">${h.esc(ep.overview||"تفاصيل الحلقة غير متوفرة.")}</p></div>`;
        row.querySelector(".lail-ep-img-wrapper").onclick=()=>this.playVideo(this.currentDetailsId,"tv",sName,seasonNum,ep.episode_number);
        let pb=row.querySelector(".lail-ep-pbtn");pb&&(pb.onclick=()=>this.createParty(this.currentDetailsId,"tv",sName,seasonNum,ep.episode_number));
        frag.appendChild(row)
      });
      el.appendChild(frag)
    }catch{}
  },
  saveHistoryToFirebase:function(id,tp,title,s,ep){
    if(!this.db)return;
    let poster=this.currentDetailsItem&&this.currentDetailsItem.id==id?(this.currentDetailsItem.poster_path||""):"";
    this.db.ref(`lail_cinema/history/${h.san(this.myUsername)}/${id}`).set({id,type:tp,title,season:s||null,episode:ep||null,poster,timestamp:Date.now()})
  },
  playVideo:function(id,tp,title,s=null,ep=null){
    if(h.isBlacklisted(id,tp)&&!h.isAdmin())return this.showToast("🚫 هذا العمل محجوب من قبل الإدارة.");
    this.currentVideoData={id,type:tp,title,s,e:ep};
    let fullTitle=title+(s?` (موسم ${s} - حلقة ${ep})`:""),pt=document.getElementById("player-title");
    pt&&(pt.innerText=fullTitle);
    ["party-sync-btn","party-pause-btn","party-reactions"].forEach(k=>{let el=document.getElementById(k);el&&(el.style.display="none")});
    this.applyAdminSettings();
    this.setIframeUrl(h.buildEmbedUrl(tp,id,s,ep,this.activeServerId));
    let pl=document.getElementById("cinema-player");pl&&(pl.classList.remove("mini-mode"),pl.style.display="flex");
    this.setPresence(`يشاهد: ${fullTitle}`);
    this.saveHistoryToFirebase(id,tp,title,s,ep)
  },
  sendReaction:function(emoji){
    if(!this.db||!this.partyCode||!1===st.settings.allowReactions)return;
    let b=h.getActiveBan();
    if(!h.isAdmin()&&b&&("reactions_only"===b.scope||"full"===b.scope))return this.showToast("🚫 التفاعلات مكتومة لديك.");
    let now=Date.now(),cd=(Number(st.settings.reactionCooldown)||1)*1e3;
    now-this.lastReactionTime<cd||(this.lastReactionTime=now,this.db.ref(`lail_cinema/rooms/${this.partyCode}/reactions`).push({emoji,timestamp:now}))
  },
  spawnReaction:function(emoji){
    if(this.activeReactionsCount>10)return;
    this.activeReactionsCount++;
    let c=document.getElementById("lail-iframe-host");if(!c)return;
    let d=document.createElement("div");d.className="lail-floating-emoji";d.innerText=emoji;d.style.left=80*Math.random()+10+"%";
    c.appendChild(d);setTimeout(()=>{d?.parentNode&&d.remove();this.activeReactionsCount--},3e3)
  },
  closePlayer:function(){
    let pl=document.getElementById("cinema-player");pl&&(pl.style.display="none",pl.classList.remove("mini-mode"));
    this.setIframeUrl("");
    this.leaveParty();
    let app=document.getElementById("lail-cinema-app");
    app&&"flex"===app.style.display?this.setPresence("يتصفح السينما"):this.setPresence(null)
  },
  checkPartyPermission:function(){
    let adm=h.isAdmin();
    if(!adm&&!1===st.settings.allowParties){this.showToast("🚫 غرف المشاهدة متوقفة مؤقتاً.");return!1}
    let b=h.getActiveBan();
    if(!adm&&b&&("full"===b.scope||"party_only"===b.scope)){alert(h.banMsg(b));return!1}
    return!0
  },
  openPartyJoin:function(){
    if(!this.checkPartyPermission())return;
    let m=document.getElementById("cinema-party-modal"),mt=document.getElementById("party-modal-title"),ju=document.getElementById("party-join-ui"),wu=document.getElementById("party-wait-ui"),inp=document.getElementById("party-code-input");
    m&&(m.style.display="flex");mt&&(mt.innerHTML='<i class="fas fa-users"></i> الانضمام لغرفة');ju&&(ju.style.display="block");wu&&(wu.style.display="none");inp&&(inp.value="")
  },
  createParty:function(id=null,tp=null,title=null,s=null,ep=null){
    if(!this.checkPartyPermission())return;
    if(!this.db)return this.showToast("خطأ في الاتصال بالقاعدة.");
    if(!id&&this.currentDetailsItem&&(id=this.currentDetailsItem.id,tp=this.currentDetailsItem.title?"movie":"tv",title=this.currentDetailsItem.title||this.currentDetailsItem.name),!id)return;
    if(h.isBlacklisted(id,tp)&&!h.isAdmin())return this.showToast("🚫 هذا العمل محجوب.");
    let go=()=>{
      let code=Math.floor(1e3+9e3*Math.random()).toString(),me=h.san(this.myUsername);
      this.partyCode=code;this.isHost=!0;this.currentVideoData={id,type:tp,title,s,e:ep};
      this.db.ref(`lail_cinema/rooms/${code}`).set({host:me,movieId:id,type:tp,title,season:s||0,episode:ep||0,status:"waiting",startTime:0,pauseElapsed:0,createdAt:Date.now(),players:{[me]:!0}}).then(()=>{
        let m=document.getElementById("cinema-party-modal"),mt=document.getElementById("party-modal-title"),ju=document.getElementById("party-join-ui"),wu=document.getElementById("party-wait-ui");
        m&&(m.style.display="flex");mt&&(mt.innerHTML='<i class="fas fa-crown" style="color:#fbbf24;"></i> غرفتك جاهزة');ju&&(ju.style.display="none");wu&&(wu.style.display="block");
        document.getElementById("party-code-display")&&(document.getElementById("party-code-display").innerText=code);
        document.getElementById("party-start-btn")&&(document.getElementById("party-start-btn").style.display="flex");
        document.getElementById("party-guest-wait")&&(document.getElementById("party-guest-wait").style.display="none");
        this.listenToPartyRoom(code)
      })
    };
    let maxR=Number(st.settings.maxRooms)||0;
    if(maxR>0&&!h.isAdmin())this.db.ref("lail_cinema/rooms").once("value").then(sn=>Object.keys(sn.val()||{}).length>=maxR?this.showToast(`⚠️ الحد الأقصى للغرف (${maxR}) ممتلئ حالياً.`):go());
    else go()
  },
  joinParty:function(){
    if(!this.checkPartyPermission()||!this.db)return;
    let inp=document.getElementById("party-code-input");if(!inp)return;
    let code=inp.value.trim();if(!code||code.length<4)return this.showToast("يرجى إدخال كود الغرفة الصحيح.");
    let me=h.san(this.myUsername);
    this.db.ref(`lail_cinema/rooms/${code}`).once("value").then(snap=>{
      if(!snap.exists())return this.showToast("الغرفة غير موجودة أو انتهت ❌");
      let rm=snap.val(),maxP=Number(st.settings.maxPlayersPerRoom)||0;
      if(maxP>0&&!h.isAdmin()&&Object.keys(rm.players||{}).length>=maxP&&!rm.players?.[me])return this.showToast(`⚠️ الغرفة ممتلئة (الحد ${maxP} عضو).`);
      this.partyCode=code;this.isHost=rm.host===me;this.currentVideoData={id:rm.movieId,type:rm.type,title:rm.title,s:rm.season,e:rm.episode};
      this.db.ref(`lail_cinema/rooms/${code}/players/${me}`).set(!0).then(()=>{
        let mt=document.getElementById("party-modal-title"),ju=document.getElementById("party-join-ui"),wu=document.getElementById("party-wait-ui");
        mt&&(mt.innerHTML='<i class="fas fa-video"></i> قاعة الانتظار');ju&&(ju.style.display="none");wu&&(wu.style.display="block");
        document.getElementById("party-code-display")&&(document.getElementById("party-code-display").innerText=code);
        document.getElementById("party-start-btn")&&(document.getElementById("party-start-btn").style.display=this.isHost?"flex":"none");
        document.getElementById("party-guest-wait")&&(document.getElementById("party-guest-wait").style.display=this.isHost?"none":"block");
        this.listenToPartyRoom(code);this.showToast("تم الانضمام للغرفة بنجاح! 🍿")
      })
    })
  },
  copyPartyCode:function(){
    navigator.clipboard.writeText(`🍿 انضم لي في سينما ليل لمشاهدة جماعية لـ (${this.currentVideoData.title||"فيلم"})!\nكود الغرفة: ${this.partyCode}`).then(()=>this.showToast("تم نسخ رسالة الدعوة والكود بنجاح 📋"))
  },
  minimizeParty:function(){
    let m=document.getElementById("cinema-party-modal"),app=document.getElementById("lail-cinema-app"),rb=document.getElementById("party-restore-btn");
    m&&(m.style.display="none");app&&(app.style.display="none");rb&&(rb.style.display="flex")
  },
  restoreParty:function(){
    let m=document.getElementById("cinema-party-modal"),app=document.getElementById("lail-cinema-app"),rb=document.getElementById("party-restore-btn");
    rb&&(rb.style.display="none");app&&(app.style.display="flex");m&&(m.style.display="flex")
  },
  listenToPartyRoom:function(code){
    this.partyListener&&this.db.ref(`lail_cinema/rooms/${this.partyCode}`).off("value",this.partyListener);
    this.partyListener=this.db.ref(`lail_cinema/rooms/${code}`).on("value",snap=>{
      let rm=snap.val();if(!rm){this.leaveParty(!0);return}
      let me=h.san(this.myUsername);
      this.isHost=rm.host===me;
      if(!this.isHost&&rm.players&&!rm.players[me]){this.leaveParty(!1);this.showToast("🚫 تم إخراجك من الغرفة.");return}
      let ul=document.getElementById("party-users-list");
      ul&&(ul.innerHTML=Object.keys(rm.players||{}).map(u=>`<div class="lail-user-chip ${u===rm.host?"is-host":""}">${u===rm.host?'<i class="fas fa-crown"></i> ':""}${h.esc(u)}</div>`).join(""));
      document.getElementById("party-start-btn")&&(document.getElementById("party-start-btn").style.display=this.isHost?"flex":"none");
      document.getElementById("party-guest-wait")&&(document.getElementById("party-guest-wait").style.display=this.isHost?"none":"block");
      if("playing"===rm.status){
        let m=document.getElementById("cinema-party-modal"),rb=document.getElementById("party-restore-btn");
        m&&(m.style.display="none");rb&&(rb.style.display="none");
        this.launchPartyVideo(rm)
      }else"paused"===rm.status&&this.handlePartyPause()
    })
  },
  startParty:function(){
    this.isHost&&this.partyCode&&this.db.ref(`lail_cinema/rooms/${this.partyCode}`).update({status:"playing",startTime:Date.now(),pauseElapsed:0})
  },
  launchPartyVideo:function(rm){
    this.currentVideoData={id:rm.movieId,type:rm.type,title:rm.title,s:rm.season,e:rm.episode};
    let full=rm.title+(rm.season?` (موسم ${rm.season} - حلقة ${rm.episode})`:""),pt=document.getElementById("player-title");
    pt&&(pt.innerHTML=`<i class="fas fa-users" style="color:#3b82f6;"></i> ${h.esc(full)}`);
    let sb=document.getElementById("party-sync-btn"),rb=document.getElementById("party-reactions"),pb=document.getElementById("party-pause-btn");
    sb&&(sb.style.display="flex");rb&&(rb.style.display=!1===st.settings.allowReactions?"none":"flex");
    pb&&(this.isHost?(pb.style.display="flex",pb.innerHTML='<i class="fas fa-pause"></i> إيقاف للكل'):pb.style.display="none");
    this.applyAdminSettings();
    this.setIframeUrl(h.buildEmbedUrl(rm.type,rm.movieId,rm.season,rm.episode,this.activeServerId));
    let pl=document.getElementById("cinema-player");pl&&(pl.classList.remove("mini-mode"),pl.style.display="flex");
    this.setPresence(`غرفة #${this.partyCode}: ${rm.title}`);
    if(!this.reactionListenerSetup&&!1!==st.settings.allowReactions){
      this.reactionRef=this.db.ref(`lail_cinema/rooms/${this.partyCode}/reactions`);
      this.reactionRef.on("child_added",sn=>{let v=sn.val();v&&Date.now()-v.timestamp<1e4&&this.spawnReaction(v.emoji)});
      this.reactionListenerSetup=!0
    }
  },
  hostTogglePause:function(){
    this.isHost&&this.partyCode&&this.db&&this.db.ref(`lail_cinema/rooms/${this.partyCode}`).once("value").then(sn=>{
      let rm=sn.val();if(!rm)return;
      if("playing"===rm.status)this.db.ref(`lail_cinema/rooms/${this.partyCode}`).update({status:"paused",pauseElapsed:Date.now()-rm.startTime});
      else if("paused"===rm.status)this.db.ref(`lail_cinema/rooms/${this.partyCode}`).update({status:"playing",startTime:Date.now()-rm.pauseElapsed})
    })
  },
  handlePartyPause:function(){
    this.setIframeUrl("");
    if(this.isHost){let pb=document.getElementById("party-pause-btn");pb&&(pb.innerHTML='<i class="fas fa-play"></i> استئناف')}
    this.showToast("⏸️ تم إيقاف الفيلم مؤقتاً من قبل المضيف...",5e3)
  },
  syncPartyTime:function(){
    this.partyCode&&this.db&&this.db.ref(`lail_cinema/rooms/${this.partyCode}`).once("value").then(sn=>{
      let rm=sn.val();if(!rm)return;
      let ms="playing"===rm.status?Date.now()-rm.startTime:"paused"===rm.status?rm.pauseElapsed:0;
      let sec=Math.floor(ms/1e3),rem=sec%60,str=`${Math.floor(sec/60)}:${rem<10?"0"+rem:rem}`;
      this.setIframeUrl(h.buildEmbedUrl(rm.type,rm.movieId,rm.season,rm.episode,this.activeServerId));
      this.showToast(`🔄 للمزامنة مع المجموعة: قم بتقديم الفيلم للدقيقة <b>${str}</b>`,8e3)
    })
  },
  leaveParty:function(closedByHost=!1){
    if(this.partyCode&&this.db){
      if(this.isHost)this.db.ref(`lail_cinema/rooms/${this.partyCode}`).remove();
      else this.db.ref(`lail_cinema/rooms/${this.partyCode}/players/${h.san(this.myUsername)}`).remove();
      this.partyListener&&this.db.ref(`lail_cinema/rooms/${this.partyCode}`).off("value",this.partyListener);
      this.reactionListenerSetup&&this.reactionRef&&(this.reactionRef.off("child_added"),this.reactionListenerSetup=!1)
    }
    this.partyCode=null;this.isHost=!1;
    ["cinema-party-modal","party-restore-btn","party-sync-btn","party-pause-btn","party-reactions"].forEach(k=>{let el=document.getElementById(k);el&&(el.style.display="none")});
    let pl=document.getElementById("cinema-player");
    if(closedByHost&&pl&&"flex"===pl.style.display){
      this.showToast("⚠️ تم إغلاق الغرفة. المشاهدة فردية الآن.");
      let pt=document.getElementById("player-title");pt&&(pt.innerText=pt.innerText.replace(" 👥",""))
    }
  },
  toggleMiniPlayer:function(){
    if(!1===st.settings.allowMiniPlayer)return;
    let pl=document.getElementById("cinema-player"),ico=document.querySelector("#lail-pip-btn i"),app=document.getElementById("lail-cinema-app");
    pl&&(pl.classList.contains("mini-mode")?(pl.classList.remove("mini-mode"),ico&&(ico.className="fas fa-compress-arrows-alt"),pl.style.left="",pl.style.top="",pl.style.width="",pl.style.height="",pl.style.bottom="",app&&(app.style.display="flex")):(pl.classList.add("mini-mode"),ico&&(ico.className="fas fa-expand-arrows-alt"),app&&(app.style.display="none")))
  },
  setupDraggableMiniPlayer:function(){
    let pl=document.getElementById("cinema-player"),hd=document.getElementById("player-drag-header"),rh=document.getElementById("lail-resize-handle");
    if(!pl||!hd||!rh)return;
    let drag=!1,res=!1,sx,sw,ox,oy;
    let sd=(x,y)=>{if(!pl.classList.contains("mini-mode"))return;drag=!0;pl.classList.add("is-dragging");let rc=pl.getBoundingClientRect();ox=x-rc.left;oy=y-rc.top};
    let mv=(x,y)=>{drag&&(pl.style.left=x-ox+"px",pl.style.top=y-oy+"px",pl.style.bottom="auto",pl.style.right="auto")};
    let ed=()=>{drag=!1;pl.classList.remove("is-dragging")};
    hd.addEventListener("mousedown",ev=>{if(ev.target.closest("button,select"))return;ev.preventDefault();sd(ev.clientX,ev.clientY)});
    document.addEventListener("mousemove",ev=>{drag&&mv(ev.clientX,ev.clientY)});
    document.addEventListener("mouseup",ed);
    hd.addEventListener("touchstart",ev=>{if(ev.target.closest("button,select"))return;sd(ev.touches[0].clientX,ev.touches[0].clientY)},{passive:!1});
    document.addEventListener("touchmove",ev=>{drag&&(ev.preventDefault(),mv(ev.touches[0].clientX,ev.touches[0].clientY))},{passive:!1});
    document.addEventListener("touchend",ed);
    let sr=x=>{pl.classList.contains("mini-mode")&&(res=!0,pl.classList.add("is-dragging"),sx=x,sw=pl.getBoundingClientRect().width)};
    let mr=x=>{if(!res)return;let w=sw+(sx-x);w>=250&&w<=.9*window.innerWidth&&(pl.style.width=w+"px",pl.style.height=w*(9/16)+"px")};
    let er=()=>{res=!1;pl.classList.remove("is-dragging")};
    rh.addEventListener("mousedown",ev=>{ev.preventDefault();sr(ev.clientX)});
    document.addEventListener("mousemove",ev=>{res&&mr(ev.clientX)});
    document.addEventListener("mouseup",er);
    rh.addEventListener("touchstart",ev=>sr(ev.touches[0].clientX),{passive:!1});
    document.addEventListener("touchmove",ev=>{res&&(ev.preventDefault(),mr(ev.touches[0].clientX))},{passive:!1});
    document.addEventListener("touchend",er)
  },
  openAdmin:cinemaAdmin.open,
  closeAdmin:cinemaAdmin.close
};

let setLoginU=id=>{let el=document.getElementById(id);el&&el.value&&window.lailCinema.updateIdentity(el.value)};
document.body.addEventListener("click",ev=>{ev.target.closest("#member-login-btn")&&setLoginU("member-username");ev.target.closest("#register-btn")&&setLoginU("register-username")});
document.body.addEventListener("submit",ev=>{"member-login-form"===ev.target.id&&setLoginU("member-username");"register-form"===ev.target.id&&setLoginU("register-username")});
document.body.addEventListener("keydown",ev=>{"Enter"===ev.key&&(ev.target.closest("#member-login-form")&&setLoginU("member-username"),ev.target.closest("#register-form")&&setLoginU("register-username"))});

let meEl=document.querySelector(".my-message, .msg-self, #profile-header-classic-bar");
if(meEl){
  let uAttr=meEl.getAttribute("data-username")||meEl.querySelector("[data-username]")?.getAttribute("data-username");
  uAttr&&window.lailCinema.updateIdentity(uAttr)
}

let timer,obs=new MutationObserver(()=>{
  if(!document.getElementById("btn-lail-cinema")||(h.isAdmin()&&!document.getElementById("btn-lail-cinema-admin"))){
    clearTimeout(timer);
    timer=setTimeout(()=>{document.querySelector(".modern-classic-list")&&injectCinemaBtn()},150)
  }
});
document.body&&obs.observe(document.body,{childList:!0,subtree:!0});
injectCinemaBtn();
window.lailCinema.initFirebase();
}();
