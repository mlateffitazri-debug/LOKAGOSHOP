'use client'

import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

const styles = `
:root{
  --bg:#07070a;--surface-1:var(--surface-1);--surface-2:var(--surface-2);--surface-2b:var(--surface-2b);--surface-3:var(--surface-3);
  --text:#f0f0f0;--text-rgb:240,240,240;--border-rgb:255,255,255;
  --overlay-rgb:0,0,0;--th-bg:rgba(0,0,0,0.25);--modal-backdrop:rgba(0,0,0,0.82);
  --scrollbar-thumb:rgba(var(--border-rgb),0.1);
}
[data-theme="light"]{
  --bg:#f4f6f2;--surface-1:#ffffff;--surface-2:#ffffff;--surface-2b:#f7f8f5;--surface-3:#ffffff;
  --text:#16181b;--text-rgb:20,22,26;--border-rgb:15,20,10;
  --overlay-rgb:20,22,26;--th-bg:rgba(20,22,26,0.04);--modal-backdrop:rgba(20,22,26,0.45);
  --scrollbar-thumb:rgba(15,20,10,0.15);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{height:auto!important;overflow:auto!important;overscroll-behavior:auto!important;background:var(--bg);}
body{background:var(--bg);font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh;height:auto!important;overflow:auto!important;overflow-x:hidden!important;overscroll-behavior:auto!important;touch-action:auto!important;padding:0!important;transition:background 0.15s,color 0.15s;}
::-webkit-scrollbar{display:block!important;width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:3px;}
*{scrollbar-width:thin!important;}

/* LAYOUT */
.layout{display:flex;min-height:100vh;}

/* SIDEBAR */
.sidebar{width:230px;background:var(--surface-2);border-right:1px solid rgba(var(--border-rgb),0.07);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:200;transition:width 0.2s,left 0.25s ease;}
.mobile-nav-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:150;}
.mobile-nav-backdrop.open{display:block;}
.hamburger-btn{display:none;border:1px solid rgba(var(--border-rgb),0.12);background:rgba(var(--border-rgb),0.05);color:var(--text);border-radius:9px;width:36px;height:36px;align-items:center;justify-content:center;font-size:17px;cursor:pointer;flex-shrink:0;}
.sb-logo{padding:20px 20px 16px;border-bottom:1px solid rgba(var(--border-rgb),0.07);}
.sb-logo svg{height:32px;width:auto;}
.sb-tag{display:inline-block;background:#acd036;color:#000;font-size:9px;font-weight:800;padding:2px 9px;border-radius:20px;letter-spacing:1px;margin-top:7px;text-transform:uppercase;}
.sb-nav{flex:1;padding:8px 0;overflow-y:auto;}
.sb-nav::-webkit-scrollbar{display:none;}
.sb-section{font-size:10px;font-weight:700;color:rgba(var(--text-rgb),0.18);text-transform:uppercase;letter-spacing:0.9px;padding:14px 20px 5px;}
.nav-item{display:flex;align-items:center;gap:11px;padding:10px 20px;font-size:13px;font-weight:600;color:rgba(var(--text-rgb),0.42);cursor:pointer;transition:all 0.12s;border-left:2px solid transparent;user-select:none;}
.nav-item.active{color:#acd036;background:rgba(172,208,54,0.08);border-left-color:#acd036;}
.nav-item:hover:not(.active){color:rgba(var(--text-rgb),0.75);background:rgba(var(--border-rgb),0.03);}
.nav-item .ni{width:16px;text-align:center;font-size:15px;flex-shrink:0;}
.nav-badge{margin-left:auto;background:rgba(240,192,64,0.15);color:#f0c040;font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px;}
.nav-badge.green{background:rgba(172,208,54,0.14);color:#acd036;}
.nav-badge.red{background:rgba(240,96,96,0.14);color:#f06060;}
.sb-foot{padding:14px 20px;border-top:1px solid rgba(var(--border-rgb),0.06);font-size:11px;color:rgba(var(--text-rgb),0.2);line-height:1.55;}

/* MAIN */
.main{margin-left:230px;flex:1;min-width:0;display:flex;flex-direction:column;}

/* TOP BAR */
.top-bar{background:var(--surface-2);backdrop-filter:blur(12px);border-bottom:1px solid rgba(var(--border-rgb),0.07);padding:13px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;flex-wrap:wrap;gap:8px;}
.top-left{display:flex;align-items:center;gap:12px;min-width:0;}
.top-left-text{display:flex;flex-direction:column;min-width:0;}
.top-title{font-size:16px;font-weight:800;color:var(--text);}
.top-sub{font-size:11px;color:rgba(var(--text-rgb),0.28);margin-top:1px;}
.top-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}

/* CONTENT */
.content{padding:26px 28px;flex:1;}

/* ERROR BANNER */
#admin-error-banner{display:none;background:rgba(240,96,96,0.07);color:#f06060;font-size:13px;font-weight:700;padding:12px 28px;border-bottom:1px solid rgba(240,96,96,0.18);word-break:break-word;line-height:1.5;}

/* STAT STRIP */
.stat-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:24px;}
.stat-card{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;padding:18px 20px;}
.stat-card.g{border-left:3px solid #acd036;}
.stat-card.o{border-left:3px solid #f0c040;}
.stat-card.b{border-left:3px solid #7eb8f7;}
.stat-card.r{border-left:3px solid #f06060;}
.sc-num{font-size:32px;font-weight:800;line-height:1;color:#acd036;}
.sc-num.b{color:#7eb8f7;}.sc-num.o{color:#f0c040;}.sc-num.r{color:#f06060;}
.sc-lbl{font-size:11px;font-weight:600;color:rgba(var(--text-rgb),0.35);margin-top:5px;text-transform:uppercase;letter-spacing:0.5px;}

/* SECTIONS */
.section{display:none;}
.section.active{display:block;}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:8px;}
.sec-title{font-size:17px;font-weight:800;color:var(--text);}
.sec-sub{font-size:12px;color:rgba(var(--text-rgb),0.3);margin-top:2px;}

/* TABLE CARD */
.tbl-card{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;overflow:hidden;}
.tbl-card-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(var(--border-rgb),0.07);flex-wrap:wrap;gap:10px;}
.tbl-card-title{font-size:14px;font-weight:800;color:var(--text);}
.tbl-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

/* FILTER BAR */
.filter-bar{display:flex;align-items:center;gap:7px;padding:12px 20px 8px;flex-wrap:wrap;}
.f-chip{border:1px solid rgba(var(--border-rgb),0.1);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;color:rgba(var(--text-rgb),0.38);cursor:pointer;background:transparent;white-space:nowrap;font-family:inherit;transition:all 0.12s;}
.f-chip.active{background:#acd036;border-color:#acd036;color:#000;}
.f-chip:hover:not(.active){border-color:rgba(var(--border-rgb),0.22);color:rgba(var(--text-rgb),0.75);}

/* SEARCH */
.search-wrap{position:relative;}
.search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:rgba(var(--text-rgb),0.3);pointer-events:none;}
.search-inp{border:1px solid rgba(var(--border-rgb),0.1);border-radius:8px;padding:7px 12px 7px 30px;font-size:13px;color:var(--text);background:rgba(var(--border-rgb),0.04);outline:none;font-family:inherit;width:190px;transition:border-color 0.15s;}
.search-inp:focus{border-color:rgba(172,208,54,0.45);}
.search-inp::placeholder{color:rgba(var(--text-rgb),0.22);}

/* BUTTONS */
.btn{border:none;border-radius:9px;padding:8px 15px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.12s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.btn-primary{background:#acd036;color:#000;}
.btn-primary:hover{background:#bde040;}
.btn-ghost{background:rgba(var(--border-rgb),0.06);color:rgba(var(--text-rgb),0.6);border:1px solid rgba(var(--border-rgb),0.1);}
.btn-ghost:hover{background:rgba(var(--border-rgb),0.1);color:rgba(var(--text-rgb),0.9);}

/* TABLE ACTION BUTTONS */
.act-btn{border:1px solid transparent;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;margin-left:3px;transition:all 0.1s;white-space:nowrap;}
.ab-g{background:rgba(172,208,54,0.1);color:#acd036;border-color:rgba(172,208,54,0.22);}
.ab-g:hover{background:rgba(172,208,54,0.2);}
.ab-r{background:rgba(240,96,96,0.08);color:rgba(240,140,140,0.8);border-color:rgba(240,96,96,0.18);}
.ab-r:hover{background:rgba(240,96,96,0.18);}
.ab-o{background:rgba(240,192,64,0.08);color:#f0c040;border-color:rgba(240,192,64,0.18);}
.ab-o:hover{background:rgba(240,192,64,0.18);}
.ab-b{background:rgba(126,184,247,0.08);color:#7eb8f7;border-color:rgba(126,184,247,0.18);}
.ab-b:hover{background:rgba(126,184,247,0.18);}
.ab-e{background:rgba(var(--border-rgb),0.05);color:rgba(var(--text-rgb),0.5);border-color:rgba(var(--border-rgb),0.1);}
.ab-e:hover{background:rgba(var(--border-rgb),0.1);color:rgba(var(--text-rgb),0.85);}

/* TABLE */
.tbl-wrap{overflow-x:auto;}
.tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:700px;}
.tbl th{background:var(--th-bg);padding:11px 14px;text-align:left;font-size:10px;color:rgba(var(--text-rgb),0.28);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(var(--border-rgb),0.07);white-space:nowrap;}
.tbl td{padding:12px 14px;border-bottom:1px solid rgba(var(--border-rgb),0.04);vertical-align:middle;}
.tbl tr:hover td{background:rgba(var(--border-rgb),0.02);}
.tbl tr:last-child td{border-bottom:none;}
.td-shop{font-weight:700;font-size:14px;color:var(--text);}
.td-sub{font-size:11px;color:rgba(var(--text-rgb),0.32);margin-top:2px;}
.td-cell{color:rgba(var(--text-rgb),0.48);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.td-c{text-align:center;}
.td-r{text-align:right;white-space:nowrap;}
.td-empty{text-align:center;color:rgba(var(--text-rgb),0.22);padding:44px 16px;font-size:14px;font-weight:500;}
.td-logo{width:34px;height:34px;border-radius:8px;object-fit:cover;background:rgba(var(--border-rgb),0.05);border:1px solid rgba(var(--border-rgb),0.08);}

/* PILLS */
.pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;display:inline-block;}
.p-active{background:rgba(172,208,54,0.12);color:#acd036;border:1px solid rgba(172,208,54,0.25);}
.p-pending{background:rgba(240,192,64,0.1);color:#f0c040;border:1px solid rgba(240,192,64,0.2);}
.p-suspended{background:rgba(240,96,96,0.1);color:#f06060;border:1px solid rgba(240,96,96,0.2);}
.p-deleted{background:rgba(var(--border-rgb),0.04);color:rgba(var(--text-rgb),0.28);border:1px solid rgba(var(--border-rgb),0.07);}
.p-verified{background:rgba(172,208,54,0.12);color:#acd036;border:1px solid rgba(172,208,54,0.25);font-size:10px;}
.p-aktif{background:rgba(126,184,247,0.1);color:#7eb8f7;border:1px solid rgba(126,184,247,0.2);font-size:10px;}
.p-baharu{background:rgba(var(--border-rgb),0.04);color:rgba(var(--text-rgb),0.35);border:1px solid rgba(var(--border-rgb),0.1);font-size:10px;}

/* COUNT BADGE */
.cnt{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(var(--border-rgb),0.06);color:rgba(var(--text-rgb),0.42);}
.cnt.g{background:rgba(172,208,54,0.12);color:#acd036;}
.cnt.o{background:rgba(240,192,64,0.12);color:#f0c040;}
.cnt.r{background:rgba(240,96,96,0.12);color:#f06060;}

/* ALERT BANNER */
.alert{display:flex;align-items:center;gap:10px;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:600;margin-bottom:20px;}
.alert-o{background:rgba(240,192,64,0.08);border:1px solid rgba(240,192,64,0.2);color:#f0c040;cursor:pointer;}
.alert-o:hover{background:rgba(240,192,64,0.13);}

/* MODALS */
.modal-overlay{display:none;position:fixed;inset:0;z-index:9999;background:var(--modal-backdrop);backdrop-filter:blur(4px);}
.modal-overlay.open{display:flex;align-items:center;justify-content:center;padding:24px;}
.modal-box{background:var(--surface-3);border:1px solid rgba(var(--border-rgb),0.1);border-radius:20px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
.mo-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.mo-title{font-size:17px;font-weight:800;color:var(--text);}
.mo-close{border:none;background:none;font-size:18px;color:rgba(var(--text-rgb),0.28);cursor:pointer;line-height:1;padding:4px;transition:color 0.1s;}
.mo-close:hover{color:rgba(var(--text-rgb),0.7);}
.mo-fields{display:flex;flex-direction:column;gap:12px;}
.mo-field{display:flex;flex-direction:column;gap:5px;}
.mo-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.mo-lbl{font-size:12px;font-weight:700;color:#acd036;}
.mo-lbl-opt{font-size:12px;font-weight:700;color:rgba(var(--text-rgb),0.36);}
.mo-input{width:100%;border:1px solid rgba(var(--border-rgb),0.1);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;color:var(--text);background:var(--surface-2b);transition:border-color 0.15s;}
.mo-input:focus{border-color:rgba(172,208,54,0.5);}
.mo-textarea{width:100%;border:1px solid rgba(var(--border-rgb),0.1);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;color:var(--text);background:var(--surface-2b);min-height:75px;resize:vertical;transition:border-color 0.15s;}
.mo-textarea:focus{border-color:rgba(172,208,54,0.5);}
.mo-hint{font-size:12px;color:rgba(var(--text-rgb),0.48);background:rgba(172,208,54,0.06);border-left:3px solid rgba(172,208,54,0.35);border-radius:0 8px 8px 0;padding:9px 12px;line-height:1.65;}
.mo-actions{display:flex;flex-direction:column;gap:8px;margin-top:18px;}
.btn-submit{width:100%;background:#acd036;border:none;border-radius:11px;padding:13px;color:#000;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background 0.12s;}
.btn-submit:hover{background:#bde040;}
.btn-cancel{width:100%;background:rgba(var(--border-rgb),0.04);border:1px solid rgba(var(--border-rgb),0.1);border-radius:11px;padding:11px;color:rgba(var(--text-rgb),0.38);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
.mo-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;}
.mo-toggle-lbl{font-size:14px;color:rgba(var(--text-rgb),0.62);font-weight:600;}
.toggle{appearance:none;-webkit-appearance:none;width:44px;height:24px;background:rgba(var(--border-rgb),0.1);border-radius:12px;position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
.toggle::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;background:rgba(var(--text-rgb),0.45);border-radius:50%;transition:transform 0.2s,background 0.2s;}
.toggle:checked{background:#acd036;}
.toggle:checked::before{transform:translateX(20px);background:#000;}

/* DASHBOARD — Feature Cards */
.feat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
.feat-card{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:18px;padding:22px 20px 18px;cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden;}
.feat-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity 0.18s;border-radius:18px;}
.feat-card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5);border-color:rgba(var(--border-rgb),0.14);}
.feat-card:hover::before{opacity:1;}
.feat-card.c-green{border-top:3px solid #acd036;}
.feat-card.c-green::before{background:radial-gradient(ellipse at top,rgba(172,208,54,0.06),transparent 70%);}
.feat-card.c-blue{border-top:3px solid #7eb8f7;}
.feat-card.c-blue::before{background:radial-gradient(ellipse at top,rgba(126,184,247,0.06),transparent 70%);}
.feat-card.c-orange{border-top:3px solid #f0c040;}
.feat-card.c-orange::before{background:radial-gradient(ellipse at top,rgba(240,192,64,0.06),transparent 70%);}
.feat-card.c-purple{border-top:3px solid #b08cf7;}
.feat-card.c-purple::before{background:radial-gradient(ellipse at top,rgba(176,140,247,0.06),transparent 70%);}
.feat-card.c-teal{border-top:3px solid #4ecdc4;}
.feat-card.c-teal::before{background:radial-gradient(ellipse at top,rgba(78,205,196,0.06),transparent 70%);}
.feat-card.c-red{border-top:3px solid #f06060;}
.feat-card.c-red::before{background:radial-gradient(ellipse at top,rgba(240,96,96,0.06),transparent 70%);}
.feat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px;flex-shrink:0;}
.feat-icon.ig{background:rgba(172,208,54,0.12);}
.feat-icon.ib{background:rgba(126,184,247,0.12);}
.feat-icon.io{background:rgba(240,192,64,0.12);}
.feat-icon.ip{background:rgba(176,140,247,0.12);}
.feat-icon.it{background:rgba(78,205,196,0.12);}
.feat-icon.ir{background:rgba(240,96,96,0.12);}
.feat-title{font-size:15px;font-weight:800;color:var(--text);margin-bottom:3px;}
.feat-desc{font-size:12px;color:rgba(var(--text-rgb),0.35);line-height:1.5;margin-bottom:14px;}
.feat-num{font-size:34px;font-weight:800;line-height:1;color:#acd036;margin-bottom:4px;}
.feat-num.blue{color:#7eb8f7;}
.feat-num.orange{color:#f0c040;}
.feat-num.purple{color:#b08cf7;}
.feat-num.teal{color:#4ecdc4;}
.feat-num.red{color:#f06060;}
.feat-sub{font-size:11px;color:rgba(var(--text-rgb),0.3);}
.feat-badge{position:absolute;top:14px;right:14px;background:rgba(240,192,64,0.15);color:#f0c040;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;}
.feat-badge.green{background:rgba(172,208,54,0.14);color:#acd036;}
.feat-badge.red{background:rgba(240,96,96,0.14);color:#f06060;}

/* Recent list (inside dash misc cards) */
.dash-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.dash-card{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;padding:18px 20px;}
.dash-card-title{font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.28);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:14px;}
.ri{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(var(--border-rgb),0.04);}
.ri:last-child{border-bottom:none;}
.ri-av{width:32px;height:32px;border-radius:9px;background:rgba(172,208,54,0.1);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#acd036;flex-shrink:0;}
.ri-av.b{background:rgba(126,184,247,0.1);color:#7eb8f7;}
.ri-name{font-size:13px;font-weight:700;color:var(--text);}
.ri-sub{font-size:11px;color:rgba(var(--text-rgb),0.3);margin-top:1px;}
.ri-time{font-size:11px;color:rgba(var(--text-rgb),0.2);margin-left:auto;flex-shrink:0;}

/* PLATFORM STATS */
.ps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
.ps-card{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;padding:20px;}
.ps-card.s2{grid-column:span 2;}
.ps-card.s3{grid-column:span 3;}
.ps-num{font-size:36px;font-weight:800;line-height:1;color:#acd036;}
.ps-num.b{color:#7eb8f7;}.ps-num.o{color:#f0c040;}
.ps-lbl{font-size:11px;font-weight:600;color:rgba(var(--text-rgb),0.32);margin-top:6px;text-transform:uppercase;letter-spacing:0.5px;}
.ps-detail{margin-top:10px;display:flex;flex-direction:column;gap:4px;}
.ps-line{font-size:12px;color:rgba(var(--text-rgb),0.52);}

/* AREA BARS */
.area-item{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(var(--border-rgb),0.04);}
.area-item:last-child{border-bottom:none;}
.area-name{font-size:13px;font-weight:700;color:var(--text);width:100px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.area-outer{flex:1;background:rgba(var(--border-rgb),0.06);border-radius:4px;height:6px;overflow:hidden;}
.area-fill{background:linear-gradient(90deg,#acd036,#d4f042);height:100%;border-radius:4px;transition:width 0.5s;}
.area-count{font-size:12px;font-weight:700;color:#acd036;width:70px;text-align:right;flex-shrink:0;}

/* CHART */
.chart-wrap{background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;padding:20px;margin-bottom:20px;}
.chart-title{font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.28);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:16px;}
.chart-bars{display:flex;align-items:flex-end;height:110px;gap:6px;border-bottom:1px solid rgba(var(--border-rgb),0.06);padding-bottom:4px;}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;}
.chart-bg{display:flex;align-items:flex-end;height:100px;gap:2px;width:100%;}
.chart-bw{flex:1;display:flex;align-items:flex-end;height:100%;}
.chart-b{width:100%;border-radius:3px 3px 0 0;min-height:2px;transition:height 0.5s ease;}
.chart-b.sl{background:linear-gradient(180deg,#acd036,#8aab22);}
.chart-b.by{background:linear-gradient(180deg,#7eb8f7,#5592d4);}
.chart-lbl{font-size:9px;color:rgba(var(--text-rgb),0.25);margin-top:5px;white-space:nowrap;}
.chart-legend{display:flex;gap:14px;margin-top:14px;}
.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(var(--text-rgb),0.42);}
.legend-dot{width:8px;height:8px;border-radius:2px;}

/* DATABASE TAB */
.db-controls{padding:14px 20px;display:flex;gap:8px;align-items:center;}
.db-select{flex:1;border:1px solid rgba(var(--border-rgb),0.1);border-radius:9px;padding:10px 13px;font-size:13px;color:var(--text);background:var(--surface-2b);outline:none;font-family:inherit;}
.db-info{padding:0 20px 8px;font-size:12px;color:rgba(var(--text-rgb),0.28);}
.danger-zone{margin:14px 20px;background:rgba(240,96,96,0.04);border:1px solid rgba(240,96,96,0.14);border-radius:12px;padding:16px;}
.danger-title{font-size:11px;font-weight:800;color:#f06060;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.btn-danger{background:rgba(240,96,96,0.1);color:#f06060;border:1px solid rgba(240,96,96,0.2);border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;transition:background 0.1s;}
.btn-danger:hover{background:rgba(240,96,96,0.18);}

/* RESPONSIVE */
.stat-strip-wrap{padding:20px 28px 0;}
.stats-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media(max-width:1280px){.feat-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:1024px){.stat-strip{grid-template-columns:repeat(2,1fr);}.feat-grid{grid-template-columns:repeat(2,1fr);}.dash-row{grid-template-columns:1fr;}.ps-grid{grid-template-columns:1fr 1fr;}.ps-card.s2{grid-column:span 1;}.ps-card.s3{grid-column:span 2;}.stats-bottom-grid{grid-template-columns:1fr;}}
@media(max-width:820px){.sidebar{width:58px;}.sb-section,.sb-nav .nav-item span,.sb-foot,.sb-tag{display:none;}.main{margin-left:58px;}.content{padding:16px;}.feat-grid{grid-template-columns:repeat(2,1fr);}.stat-strip-wrap{padding:16px 16px 0;}}
@media(max-width:580px){
  .hamburger-btn{display:inline-flex;}
  .sidebar{width:240px;left:-240px;box-shadow:2px 0 30px rgba(0,0,0,0.4);}
  .sidebar.mobile-open{left:0;}
  .sidebar.mobile-open .sb-section,.sidebar.mobile-open .sb-nav .nav-item span,.sidebar.mobile-open .sb-foot,.sidebar.mobile-open .sb-tag{display:revert;}
  .main{margin-left:0;}
  .top-title{font-size:14px;}
  .top-sub{display:none;}
  .content{padding:14px;}
  .stat-strip{grid-template-columns:1fr 1fr;gap:10px;}
  .feat-grid{grid-template-columns:1fr 1fr;gap:10px;}
  .feat-card{padding:16px 14px 14px;}
  .sec-title{font-size:15px;}
  .modal-overlay.open{padding:10px;}
  .modal-box{padding:16px;border-radius:14px;}
  .mo-row{grid-template-columns:1fr;}
  .act-btn{padding:6px 10px;font-size:12px;margin:2px 3px 2px 0;}
  .sd-actions-row .act-btn,.sd-info-grid{margin-bottom:8px;}
  .tbl-card-head{flex-direction:column;align-items:flex-start;}
  .search-inp{width:100%;}
  .search-wrap{width:100%;}
}

#dq-list .ri{flex-wrap:wrap;}

/* SELLER DETAIL MODAL */
.modal-box.large{max-width:900px;}
.sd-vis-badge{display:inline-block;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:700;margin-bottom:10px;border:1px solid transparent;}
.sd-warn-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:4px;}
.sd-actions-row{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(var(--border-rgb),0.07);}
.sd-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(var(--border-rgb),0.07);}
.sd-field{padding:7px 0;border-bottom:1px solid rgba(var(--border-rgb),0.04);}
.sd-field:last-child{border-bottom:none;}
.sd-field-lbl{font-size:10px;font-weight:700;color:rgba(var(--text-rgb),0.28);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;}
.sd-field-val{font-size:13px;color:var(--text);word-break:break-all;line-height:1.4;}
.sd-field-val.muted{color:rgba(var(--text-rgb),0.3);}
.sd-prod-counts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
.sd-section-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:10px;}
@media(max-width:640px){.sd-info-grid{grid-template-columns:1fr;}}
`

const markup = `
<div class="layout">

<!-- MOBILE NAV BACKDROP -->
<div class="mobile-nav-backdrop" id="mobile-nav-backdrop" onclick="closeMobileSidebar()"></div>

<!-- SIDEBAR -->
<aside class="sidebar" id="admin-sidebar">
  <div class="sb-logo">
    <img src="/icons/Lokalgo-Logo-New.PNG" alt="LokalGo" height="28" style="display:block;width:auto;">
    <div class="sb-tag">Admin Panel</div>
  </div>
  <nav class="sb-nav">
    <div class="sb-section">Utama</div>
    <div class="nav-item active" onclick="switchTab('tab-dashboard',this)"><span class="ni">&#8962;</span><span>Dashboard</span></div>
    <div class="nav-item" onclick="switchTab('tab-sellers',this)" id="nav-sellers"><span class="ni">&#128722;</span><span>Sellers</span><span class="nav-badge" id="nb-pending" style="display:none">0</span></div>
    <div class="nav-item" onclick="switchTab('tab-listings',this)" id="nav-listings"><span class="ni">&#127873;</span><span>Listings</span></div>
    <div class="nav-item" onclick="switchTab('tab-dataquality',this)" id="nav-dataquality"><span class="ni">&#9888;</span><span>Data Quality</span><span class="nav-badge red" id="nb-dq" style="display:none">0</span></div>
    <div class="nav-item" onclick="switchTab('tab-buyers',this)"><span class="ni">&#128100;</span><span>Buyers</span></div>
    <div class="nav-item" onclick="switchTab('tab-testimoni',this)"><span class="ni">&#9733;</span><span>Testimoni</span><span class="nav-badge" id="nb-testi" style="display:none">0</span></div>
    <div class="nav-item" onclick="switchTab('tab-products',this)" id="nav-products"><span class="ni">&#127873;</span><span>Produk</span><span class="nav-badge red" id="nb-products" style="display:none">0</span></div>
    <div class="nav-item" onclick="switchTab('tab-messages',this)"><span class="ni">&#9993;</span><span>Mesej Seller</span></div>
    <div class="nav-item" onclick="switchTab('tab-saved',this)"><span class="ni">&#9825;</span><span>Saved Shops</span></div>
    <div class="sb-section">Analitik</div>
    <div class="nav-item" onclick="switchTab('tab-stats',this)"><span class="ni">&#9783;</span><span>Platform Stats</span></div>
    <div class="sb-section">Sistem</div>
    <div class="nav-item" onclick="switchTab('tab-broadcast',this)"><span class="ni">&#128226;</span><span>Broadcast</span></div>
    <div class="nav-item" onclick="switchTab('tab-database',this)"><span class="ni">&#128451;</span><span>Database</span></div>
    <div class="nav-item" onclick="switchTab('tab-settings',this)"><span class="ni">&#9881;</span><span>Settings</span></div>
  </nav>
  <div class="sb-foot">NS0308474-A<br>LokalGo Admin</div>
</aside>

<!-- MAIN -->
<div class="main">

  <!-- TOP BAR -->
  <div class="top-bar">
    <div class="top-left">
      <button class="hamburger-btn" id="hamburger-btn" onclick="toggleMobileSidebar()" aria-label="Buka menu">&#9776;</button>
      <div class="top-left-text">
        <div class="top-title">Panel Pengurusan</div>
        <div class="top-sub" id="top-sub">Memuatkan data...</div>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn btn-ghost" id="theme-toggle-btn" onclick="toggleAdminTheme()">&#9728; Light Mode</button>
      <button class="btn btn-ghost" onclick="exportSellersCSV()">&#8659; Export CSV</button>
      <button class="btn btn-primary" onclick="loadAdminData()">&#8635; Refresh</button>
    </div>
  </div>

  <!-- ERROR BANNER -->
  <div id="admin-error-banner"></div>

  <!-- STAT STRIP -->
  <div class="stat-strip-wrap">
    <div class="stat-strip">
      <div class="stat-card g"><div class="sc-num" id="st-active">—</div><div class="sc-lbl">Seller Aktif</div></div>
      <div class="stat-card o"><div class="sc-num o" id="st-pending">—</div><div class="sc-lbl">Pending Kelulusan</div></div>
      <div class="stat-card b"><div class="sc-num b" id="st-buyers">—</div><div class="sc-lbl">Pembeli Daftar</div></div>
      <div class="stat-card r"><div class="sc-num r" id="st-review">—</div><div class="sc-lbl">Perlu Semak</div></div>
    </div>
  </div>

  <!-- CONTENT AREA -->
  <div class="content">

    <!-- ── DASHBOARD ── -->
    <div class="section active" id="tab-dashboard">
      <div class="sec-head">
        <div><div class="sec-title">Dashboard</div><div class="sec-sub">Gambaran keseluruhan platform LokalGo</div></div>
      </div>
      <div id="dash-alert"></div>

      <!-- Feature Cards Grid -->
      <div class="feat-grid">
        <!-- Sellers -->
        <div class="feat-card c-green" onclick="switchTab('tab-sellers',document.getElementById('nav-sellers'))">
          <span class="feat-badge" id="fc-pending-badge" style="display:none">0 pending</span>
          <div class="feat-icon ig">&#128722;</div>
          <div class="feat-title">Sellers</div>
          <div class="feat-desc">Urus akaun, lulus & edit profil seller</div>
          <div class="feat-num" id="fc-sellers">—</div>
          <div class="feat-sub" id="fc-sellers-sub">seller berdaftar</div>
        </div>

        <!-- Buyers -->
        <div class="feat-card c-blue" onclick="switchTab('tab-buyers',document.querySelector('[onclick*=tab-buyers]'))">
          <div class="feat-icon ib">&#128100;</div>
          <div class="feat-title">Buyers</div>
          <div class="feat-desc">Semua pembeli yang telah mendaftar</div>
          <div class="feat-num blue" id="fc-buyers">—</div>
          <div class="feat-sub">pembeli daftar</div>
        </div>

        <!-- Testimoni -->
        <div class="feat-card c-orange" onclick="switchTab('tab-testimoni',document.querySelector('[onclick*=tab-testimoni]'))">
          <span class="feat-badge red" id="fc-testi-badge" style="display:none">0 pending</span>
          <div class="feat-icon io">&#9733;</div>
          <div class="feat-title">Testimoni</div>
          <div class="feat-desc">Moderasi ulasan dan rating seller</div>
          <div class="feat-num orange" id="fc-testi">—</div>
          <div class="feat-sub">jumlah ulasan</div>
        </div>

        <!-- Verified Sellers -->
        <div class="feat-card c-purple" onclick="switchTab('tab-sellers',document.getElementById('nav-sellers'))">
          <div class="feat-icon ip">&#10003;</div>
          <div class="feat-title">Verified Seller</div>
          <div class="feat-desc">Seller dengan badge pengesahan rasmi</div>
          <div class="feat-num purple" id="fc-verified">—</div>
          <div class="feat-sub">seller verified</div>
        </div>

        <!-- QR Downloads -->
        <div class="feat-card c-teal" onclick="switchTab('tab-stats',document.querySelector('[onclick*=tab-stats]'))">
          <div class="feat-icon it">&#9638;</div>
          <div class="feat-title">QR Downloads</div>
          <div class="feat-desc">Jumlah QR sokongan yang dimuat turun</div>
          <div class="feat-num teal" id="fc-qr">—</div>
          <div class="feat-sub">jumlah scan/download</div>
        </div>

        <!-- Saved Shops -->
        <div class="feat-card c-green" onclick="switchTab('tab-saved',document.querySelector('[onclick*=tab-saved]'))">
          <div class="feat-icon ig">&#9825;</div>
          <div class="feat-title">Saved Shops</div>
          <div class="feat-desc">Kedai yang disimpan oleh pembeli</div>
          <div class="feat-num" id="fc-saved">—</div>
          <div class="feat-sub">rekod simpanan</div>
        </div>

        <!-- Platform Stats -->
        <div class="feat-card c-blue" onclick="switchTab('tab-stats',document.querySelector('[onclick*=tab-stats]'))">
          <div class="feat-icon ib">&#9783;</div>
          <div class="feat-title">Platform Stats</div>
          <div class="feat-desc">Graf pertumbuhan & statistik kawasan</div>
          <div class="feat-num blue" id="fc-active">—</div>
          <div class="feat-sub">seller aktif sekarang</div>
        </div>

        <!-- Database -->
        <div class="feat-card c-red" onclick="switchTab('tab-database',document.querySelector('[onclick*=tab-database]'))">
          <div class="feat-icon ir">&#128451;</div>
          <div class="feat-title">Database</div>
          <div class="feat-desc">Akses terus data Supabase semua jadual</div>
          <div class="feat-num red" style="font-size:22px;margin-top:6px;">Supabase</div>
          <div class="feat-sub">full data access</div>
        </div>
      </div>

      <!-- Recent activity row -->
      <div class="dash-row">
        <div class="dash-card">
          <div class="dash-card-title">Seller Terbaharu Daftar</div>
          <div id="dash-recent-sellers"><div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:20px;font-size:13px;">Memuatkan...</div></div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">Pembeli Terbaharu Daftar</div>
          <div id="dash-recent-buyers"><div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:20px;font-size:13px;">Memuatkan...</div></div>
        </div>
      </div>
    </div>

    <!-- ── SELLERS ── -->
    <div class="section" id="tab-sellers">
      <div class="sec-head">
        <div><div class="sec-title">Pengurusan Seller</div><div class="sec-sub">Lulus, edit, verify dan urus akaun seller</div></div>
        <button class="btn btn-primary" onclick="openManualForm()">&#43; Tambah Seller</button>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Senarai Seller</span>
            <span class="cnt" id="sellers-count">—</span>
          </div>
          <div class="tbl-controls">
            <div class="search-wrap">
              <span class="search-ico">&#128269;</span>
              <input class="search-inp" type="text" placeholder="Cari nama kedai..." oninput="searchSellers(this.value)" id="sellers-search">
            </div>
          </div>
        </div>
        <div class="filter-bar">
          <button class="f-chip active" onclick="filterSellers(this,'all')">Semua</button>
          <button class="f-chip" onclick="filterSellers(this,'pending')">Pending</button>
          <button class="f-chip" onclick="filterSellers(this,'active')">Aktif</button>
          <button class="f-chip" onclick="filterSellers(this,'suspended')">Suspended</button>
          <button class="f-chip" onclick="filterSellers(this,'rejected')">Ditolak</button>
        </div>
        <div class="filter-bar" id="sellers-type-filter">
          <button class="f-chip active" onclick="filterSellersType(this,'all')">Semua Jenis</button>
          <button class="f-chip" onclick="filterSellersType(this,'FOOD')">Food</button>
          <button class="f-chip" onclick="filterSellersType(this,'SERVICE')">Service</button>
          <button class="f-chip" onclick="filterSellersType(this,'PRODUCT')">Product</button>
          <button class="f-chip" onclick="filterSellersType(this,'HOMESTAY')">Homestay</button>
          <span style="width:1px;background:rgba(var(--border-rgb),0.12);height:18px;margin:0 4px;"></span>
          <button class="f-chip" onclick="filterSellersPlan(this,'free')">Free</button>
          <button class="f-chip" onclick="filterSellersPlan(this,'pro')">Pro</button>
          <button class="f-chip" onclick="filterSellersPlan(this,'postcode_warning')">&#9888; Postcode</button>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Kedai</th>
              <th>Kawasan</th>
              <th>Jenis / Plan</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Klik WA</th>
              <th>Buka</th>
              <th>Tarikh Daftar</th>
              <th>Tindakan</th>
            </tr></thead>
            <tbody id="sellers-tbody"><tr><td colspan="9" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── BUYERS ── -->
    <div class="section" id="tab-buyers">
      <div class="sec-head">
        <div><div class="sec-title">Senarai Pembeli</div><div class="sec-sub">Semua akaun pembeli yang berdaftar</div></div>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Pembeli</span>
            <span class="cnt g" id="buyers-count">—</span>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Nama</th><th>Email</th><th>Kawasan</th><th>Tarikh Daftar</th><th>Tindakan</th></tr></thead>
            <tbody id="buyers-tbody"><tr><td colspan="5" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TESTIMONI ── -->
    <div class="section" id="tab-testimoni">
      <div class="sec-head">
        <div><div class="sec-title">Moderasi Testimoni</div><div class="sec-sub">Lulus atau tolak ulasan daripada pembeli</div></div>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Testimoni</span>
            <span class="cnt o" id="testi-count">—</span>
          </div>
        </div>
        <div class="filter-bar">
          <button class="f-chip active" onclick="filterTesti(this,'all')">Semua</button>
          <button class="f-chip" onclick="filterTesti(this,'pending')">Pending</button>
          <button class="f-chip" onclick="filterTesti(this,'approved')">Diluluskan</button>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Pembeli</th><th>Kedai</th><th>Ulasan</th><th>Bintang</th><th>Status</th><th>Tarikh</th><th>Tindakan</th></tr></thead>
            <tbody id="testi-tbody"><tr><td colspan="7" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── SAVED SHOPS ── -->
    <div class="section" id="tab-saved">
      <div class="sec-head">
        <div><div class="sec-title">Kedai Disimpan</div><div class="sec-sub">Rekod pembeli yang menyimpan kedai</div></div>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Saved Shops</span>
            <span class="cnt" id="saved-count">—</span>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Pembeli</th><th>Kedai</th><th>Tarikh Simpan</th></tr></thead>
            <tbody id="saved-tbody"><tr><td colspan="3" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── PLATFORM STATS ── -->
    <div class="section" id="tab-stats">
      <div class="sec-head">
        <div><div class="sec-title">Statistik Platform</div><div class="sec-sub">Data pertumbuhan dan prestasi LokalGo</div></div>
      </div>
      <div class="ps-grid">
        <div class="ps-card s2" style="border-left:3px solid #acd036;display:flex;gap:24px;">
          <div style="flex:1;">
            <div class="ps-num" id="ps-reg-users">—</div>
            <div class="ps-lbl">Jumlah Pengguna Daftar</div>
          </div>
          <div style="flex:1;border-left:1px solid rgba(var(--border-rgb),0.07);padding-left:20px;">
            <div class="ps-num" id="ps-sellers">—</div>
            <div class="ps-lbl">Jumlah Seller</div>
            <div class="ps-detail" id="ps-sellers-detail"></div>
          </div>
        </div>
        <div class="ps-card" style="border-left:3px solid #7eb8f7;">
          <div class="ps-num b" id="ps-buyers">—</div>
          <div class="ps-lbl">Pembeli</div>
        </div>
        <div class="ps-card" style="border-left:3px solid #f0c040;">
          <div class="ps-num o" id="ps-testi">—</div>
          <div class="ps-lbl">Testimoni</div>
        </div>
        <div class="ps-card" style="border-left:3px solid rgba(172,208,54,0.45);">
          <div class="ps-num" id="ps-saved">—</div>
          <div class="ps-lbl">Kedai Disimpan</div>
        </div>
        <div class="ps-card" style="border-left:3px solid rgba(var(--border-rgb),0.2);">
          <div class="ps-num" id="ps-conv">—</div>
          <div class="ps-lbl">Kadar Seller Aktif</div>
        </div>
      </div>

      <div class="chart-wrap">
        <div class="chart-title">Pendaftaran Seller &amp; Buyer — 6 Bulan Terakhir</div>
        <div class="chart-bars" id="reg-chart">
          <div style="color:rgba(var(--text-rgb),0.2);font-size:12px;width:100%;text-align:center;">Memuatkan...</div>
        </div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#acd036;"></div>Seller</div>
          <div class="legend-item"><div class="legend-dot" style="background:#7eb8f7;"></div>Buyer</div>
        </div>
      </div>

      <div class="stats-bottom-grid">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;">Badge Seller</div>
          <div class="ps-grid" style="grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:0;">
            <div class="ps-card"><div class="ps-num" style="font-size:28px;color:rgba(var(--text-rgb),0.4);" id="ps-b-baharu">—</div><div class="ps-lbl">Baharu</div></div>
            <div class="ps-card"><div class="ps-num" style="font-size:28px;color:#7eb8f7;" id="ps-b-aktif">—</div><div class="ps-lbl">Aktif</div></div>
            <div class="ps-card"><div class="ps-num" style="font-size:28px;" id="ps-b-verified">—</div><div class="ps-lbl">Verified</div></div>
          </div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;">Seller by Kawasan</div>
          <div id="area-bars" style="background:var(--surface-1);border:1px solid rgba(var(--border-rgb),0.08);border-radius:14px;padding:16px 20px;">
            <div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:20px;font-size:13px;">Memuatkan...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PRODUCTS ── -->
    <div class="section" id="tab-products">
      <div class="sec-head">
        <div><div class="sec-title">Semakan Produk</div><div class="sec-sub">Lulus atau tolak produk yang dihantar oleh seller</div></div>
        <button class="btn btn-primary" onclick="loadAdminData()">&#8635; Refresh</button>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Produk Pending</span>
            <span class="cnt" id="products-count">—</span>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Gambar</th>
              <th>Nama / Kategori</th>
              <th>Kedai</th>
              <th>Harga (RM)</th>
              <th>Dihantar</th>
              <th class="td-r">Tindakan</th>
            </tr></thead>
            <tbody id="products-tbody"><tr><td colspan="6" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── MESSAGES ── -->
    <div class="section" id="tab-messages">
      <div class="sec-head">
        <div><div class="sec-title">Mesej Admin ke Seller</div><div class="sec-sub">Hantar notifikasi, amaran atau mesej terus kepada seller</div></div>
        <button class="btn btn-primary" onclick="toggleComposeMsg()">&#43; Hantar Mesej</button>
      </div>

      <!-- Compose form (hidden by default) -->
      <div id="compose-form" class="tbl-card" style="display:none;margin-bottom:16px;max-width:720px;">
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px;">Tulis Mesej Baru</div>
        <div id="compose-status" style="display:none;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;margin-bottom:14px;"></div>
        <div class="mo-field" style="margin-bottom:12px;">
          <div class="mo-lbl" style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Pilih Seller *</div>
          <select id="msg-seller" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--text);font-family:inherit;outline:none;">
            <option value="">-- Pilih Seller --</option>
          </select>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <div style="flex:1;">
            <div class="mo-lbl" style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Jenis *</div>
            <select id="msg-type" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--text);font-family:inherit;outline:none;">
              <option value="info">&#8505; Info</option>
              <option value="success">&#10003; Success</option>
              <option value="warning">&#9888; Warning</option>
              <option value="flag">&#9873; Flag</option>
            </select>
          </div>
          <div style="flex:2;">
            <div class="mo-lbl" style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Tajuk *</div>
            <input id="msg-title" type="text" maxlength="80" placeholder="Cth: Produk anda telah diluluskan" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--text);font-family:inherit;outline:none;">
          </div>
        </div>
        <div class="mo-field" style="margin-bottom:14px;">
          <div class="mo-lbl" style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Kandungan *</div>
          <textarea id="msg-body" rows="3" maxlength="500" placeholder="Tulis mesej lengkap di sini..." style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--text);font-family:inherit;outline:none;resize:vertical;line-height:1.6;"></textarea>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="sendAdminMessage()" style="flex:1;">&#9993; Hantar Mesej</button>
          <button class="btn btn-ghost" onclick="toggleComposeMsg()">Batal</button>
        </div>
      </div>

      <!-- Messages list -->
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Semua Mesej</span>
            <span class="cnt" id="messages-count">—</span>
          </div>
          <button class="btn btn-ghost" onclick="loadMessages()" style="font-size:12px;">&#8635; Muat Semula</button>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Seller</th>
              <th>Jenis</th>
              <th>Tajuk</th>
              <th>Kandungan</th>
              <th>Baca</th>
              <th>Dihantar</th>
              <th class="td-r">Del</th>
            </tr></thead>
            <tbody id="messages-tbody"><tr><td colspan="7" class="td-empty">Klik tab untuk muat mesej</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── BROADCAST ── -->
    <div class="section" id="tab-broadcast">
      <div class="sec-head">
        <div><div class="sec-title">Broadcast kepada Seller</div><div class="sec-sub">Tetapkan teks doa/mesej yang dipaparkan di dashboard semua seller</div></div>
      </div>
      <div class="tbl-card" style="max-width:680px;">
        <div id="broadcast-status" style="display:none;background:rgba(172,208,54,0.1);color:#acd036;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;margin-bottom:16px;"></div>
        <div class="mo-field" style="margin-bottom:16px;">
          <div class="mo-lbl" style="margin-bottom:6px;font-size:12px;font-weight:700;color:rgba(var(--text-rgb),0.5);text-transform:uppercase;letter-spacing:0.5px;">Teks Arab / Doa</div>
          <textarea id="bc-arabic" rows="3" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:12px 14px;font-size:16px;color:var(--text);font-family:'Noto Naskh Arabic',serif;direction:rtl;resize:vertical;outline:none;line-height:1.8;">اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا</textarea>
        </div>
        <div class="mo-field" style="margin-bottom:20px;">
          <div class="mo-lbl" style="margin-bottom:6px;font-size:12px;font-weight:700;color:rgba(var(--text-rgb),0.5);text-transform:uppercase;letter-spacing:0.5px;">Terjemahan / Huraian (dipaparkan di bawah doa)</div>
          <textarea id="bc-trans" rows="3" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);font-family:inherit;resize:vertical;outline:none;line-height:1.6;">Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amalan yang diterima.</textarea>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="saveBroadcast()" style="flex:1;">&#128190; Simpan &amp; Broadcast ke Semua Seller</button>
          <button class="btn btn-ghost" onclick="loadBroadcast()">&#8635; Muat Semula</button>
        </div>
        <div style="font-size:11px;color:rgba(var(--text-rgb),0.25);margin-top:12px;line-height:1.6;">Perubahan akan dipaparkan serta-merta di dashboard seller selepas disimpan. Teks ini dipaparkan dalam kotak doa di halaman utama dashboard seller.</div>
      </div>

      <!-- Seller Broadcast -->
      <div class="tbl-card" style="max-width:680px;margin-top:16px;">
        <div style="padding:18px 20px 0;">
          <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:3px;">&#128226; Broadcast Mesej ke Semua Seller</div>
          <div style="font-size:12px;color:rgba(var(--text-rgb),0.3);margin-bottom:14px;">Mesej akan dihantar ke inbox semua seller melalui sistem admin message sedia ada. Seller akan nampak mesej ini dalam tab Inbox/Notifikasi mereka.</div>
          <div id="bc-seller-status" style="display:none;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;margin-bottom:14px;"></div>
          <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
            <div style="flex:0 0 140px;">
              <div style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Jenis *</div>
              <select id="bc-seller-type" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--text);font-family:inherit;outline:none;">
                <option value="info">&#8505; Maklumat</option>
                <option value="success">&#10003; Pengumuman</option>
                <option value="warning">&#9888; Amaran</option>
                <option value="flag">&#9873; Penting</option>
              </select>
            </div>
            <div style="flex:1;min-width:160px;">
              <div style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Tajuk *</div>
              <input id="bc-seller-title" type="text" maxlength="80" placeholder="Cth: Kemaskini Platform LokalGo" style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--text);font-family:inherit;outline:none;">
            </div>
          </div>
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:rgba(var(--text-rgb),0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Kandungan *</div>
            <textarea id="bc-seller-body" rows="4" maxlength="500" placeholder="Tulis mesej broadcast di sini..." style="width:100%;background:var(--surface-2);border:1px solid rgba(var(--border-rgb),0.12);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--text);font-family:inherit;outline:none;resize:vertical;line-height:1.6;"></textarea>
          </div>
          <button class="btn btn-primary" id="bc-seller-send-btn" onclick="broadcastToAllSellers()" style="width:100%;margin-bottom:16px;">&#128226; Hantar kepada Semua Seller</button>
        </div>
      </div>
    </div>

    <!-- ── DATABASE ── -->
    <div class="section" id="tab-database">
      <div class="sec-head">
        <div><div class="sec-title">Database Viewer</div><div class="sec-sub">Akses dan urus data Supabase secara langsung</div></div>
      </div>
      <div class="tbl-card">
        <div class="db-controls">
          <select class="db-select" id="db-table-select" onchange="loadDbTable(this.value)">
            <option value="">-- Pilih Jadual --</option>
            <option value="sellers">sellers</option>
            <option value="buyers">buyers</option>
            <option value="testimonials">testimonials</option>
            <option value="saved_shops">saved_shops</option>
            <option value="products">products</option>
            <option value="suspended_sellers">suspended_sellers</option>
            <option value="admin_messages">admin_messages</option>
            <option value="platform_settings">platform_settings</option>
          </select>
          <button class="btn btn-primary" onclick="loadDbTable(document.getElementById('db-table-select').value)">Muat</button>
        </div>
        <div class="db-info" id="db-info"></div>
        <div id="db-content" style="padding-bottom:8px;"></div>
        <div class="danger-zone">
          <div class="danger-title">&#9888; Danger Zone</div>
          <p style="font-size:12px;color:rgba(var(--text-rgb),0.45);margin-bottom:12px;line-height:1.6;">Padam SEMUA rekod dari jadual yang dipilih. Tindakan ini tidak boleh dibatalkan.</p>
          <button class="btn-danger" onclick="clearDbTable()">Padam Semua Rekod dalam Jadual Ini</button>
        </div>
      </div>
    </div>

    <!-- ── LISTINGS ── -->
    <div class="section" id="tab-listings">
      <div class="sec-head">
        <div><div class="sec-title">Pengurusan Listing / Produk</div><div class="sec-sub">Semua produk merentas semua status — betulkan listing_type dan kategori di sini</div></div>
        <button class="btn btn-primary" onclick="loadAdminData()">&#8635; Refresh</button>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Senarai Listing</span>
            <span class="cnt" id="listings-count">—</span>
          </div>
          <div class="tbl-controls">
            <div class="search-wrap">
              <span class="search-ico">&#128269;</span>
              <input class="search-inp" type="text" placeholder="Cari nama produk..." oninput="searchListings(this.value)" id="listings-search">
            </div>
          </div>
        </div>
        <div class="filter-bar" id="listings-status-filter">
          <button class="f-chip active" onclick="filterListings(this,'status','all')">Semua Status</button>
          <button class="f-chip" onclick="filterListings(this,'status','pending')">Pending</button>
          <button class="f-chip" onclick="filterListings(this,'status','approved')">Approved</button>
          <button class="f-chip" onclick="filterListings(this,'status','rejected')">Rejected</button>
        </div>
        <div class="filter-bar" id="listings-type-filter">
          <button class="f-chip active" onclick="filterListings(this,'type','all')">Semua Jenis</button>
          <button class="f-chip" onclick="filterListings(this,'type','FOOD')">Food</button>
          <button class="f-chip" onclick="filterListings(this,'type','SERVICE')">Service</button>
          <button class="f-chip" onclick="filterListings(this,'type','PRODUCT')">Product</button>
          <button class="f-chip" onclick="filterListings(this,'type','HOMESTAY')">Homestay</button>
        </div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Gambar</th>
              <th>Nama / Kategori</th>
              <th>Jenis</th>
              <th>Kedai</th>
              <th>Harga (RM)</th>
              <th>Status</th>
              <th>Jual/Preorder</th>
              <th class="td-r">Tindakan</th>
            </tr></thead>
            <tbody id="listings-tbody"><tr><td colspan="8" class="td-empty">Memuatkan...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── DATA QUALITY ── -->
    <div class="section" id="tab-dataquality">
      <div class="sec-head">
        <div><div class="sec-title">Data Quality Center</div><div class="sec-sub">Amaran data yang perlu disemak dan dibetulkan secara manual</div></div>
        <button class="btn btn-primary" onclick="loadAdminData()">&#8635; Refresh</button>
      </div>
      <div class="filter-bar" id="dq-filter">
        <button class="f-chip active" onclick="filterDataQuality(this,'all')">Semua</button>
        <button class="f-chip" onclick="filterDataQuality(this,'seller_postcode')">Postcode</button>
        <button class="f-chip" onclick="filterDataQuality(this,'seller_business_type')">Business Type</button>
        <button class="f-chip" onclick="filterDataQuality(this,'seller_zero_listings')">Zero Listing</button>
        <button class="f-chip" onclick="filterDataQuality(this,'listing_type_mismatch')">Type Mismatch</button>
        <button class="f-chip" onclick="filterDataQuality(this,'listing_category_mismatch')">Category Legacy</button>
        <button class="f-chip" onclick="filterDataQuality(this,'listing_missing_type')">Missing Type</button>
      </div>
      <div class="tbl-card">
        <div class="tbl-card-head">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tbl-card-title">Amaran Data Quality</span>
            <span class="cnt r" id="dq-count">—</span>
          </div>
        </div>
        <div id="dq-list" style="padding:8px 0;"><div class="td-empty">Memuatkan...</div></div>
      </div>
    </div>

    <!-- ── SETTINGS ── -->
    <div class="section" id="tab-settings">
      <div class="sec-head">
        <div><div class="sec-title">Settings / System Info</div><div class="sec-sub">Maklumat sistem dan tetapan admin panel</div></div>
      </div>
      <div class="dash-row">
        <div class="dash-card">
          <div class="dash-card-title">App Info</div>
          <div class="sd-field"><div class="sd-field-lbl">App Version</div><div class="sd-field-val">LokalGo v1.5.2</div></div>
          <div class="sd-field"><div class="sd-field-lbl">Admin Panel Version</div><div class="sd-field-val">Admin Control Center v1.0</div></div>
          <div class="sd-field"><div class="sd-field-lbl">Tema</div><div class="sd-field-val">Light Mode &amp; Dark Mode disokong — <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="toggleAdminTheme()">Toggle Tema</button></div></div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">Database Health</div>
          <div id="settings-db-health"><div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:20px;font-size:13px;">Memuatkan...</div></div>
        </div>
      </div>
      <div class="dash-card" style="margin-top:20px;">
        <div class="dash-card-title">Ringkasan Data</div>
        <div id="settings-data-summary"><div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:20px;font-size:13px;">Memuatkan...</div></div>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /main -->
</div><!-- /layout -->

<!-- MODAL: EDIT SELLER -->
<div id="edit-modal" class="modal-overlay">
  <div class="modal-box">
    <div class="mo-head">
      <span class="mo-title">Edit Profil Seller</span>
      <button class="mo-close" onclick="closeEditSeller()">&#x2715;</button>
    </div>
    <div class="mo-hint" style="margin-bottom:14px;">
      Seller perlu log masuk dengan Google untuk menggunakan akaun mereka. Perubahan akan disimpan serta-merta ke database.
    </div>
    <div class="mo-fields">
      <input type="hidden" id="edit-seller-id">
      <div class="mo-field">
        <div class="mo-lbl">Nama Kedai *</div>
        <input id="edit-shop-name" class="mo-input" type="text" placeholder="Nama kedai seller">
      </div>
      <div class="mo-field">
        <div class="mo-lbl">No. WhatsApp</div>
        <input id="edit-whatsapp" class="mo-input" type="tel" placeholder="017-1234567">
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Kawasan</div>
          <input id="edit-kawasan" class="mo-input" type="text" placeholder="Bangi">
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Postcode</div>
          <input id="edit-postcode" class="mo-input" type="text" placeholder="43000" maxlength="5" oninput="updateEditPostcodeWarning()">
          <div id="edit-postcode-warn" style="display:none;font-size:11px;color:#f0c040;margin-top:3px;">&#9888; Postcode tidak sah / 00000</div>
        </div>
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Business Type (Admin Override)</div>
          <select id="edit-business-type" class="mo-input" onchange="onEditBusinessTypeChange()">
            <option value="FOOD">FOOD</option>
            <option value="SERVICE">SERVICE</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="HOMESTAY">HOMESTAY</option>
          </select>
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Plan Type</div>
          <select id="edit-plan-type" class="mo-input">
            <option value="free">free</option>
            <option value="pro">pro</option>
          </select>
        </div>
      </div>
      <div class="mo-field">
        <div class="mo-lbl-opt">Listing Limit</div>
        <input id="edit-listing-limit" class="mo-input" type="number" min="0" placeholder="5">
      </div>
      <div class="mo-toggle-row" id="edit-cascade-row" style="display:none;">
        <span class="mo-toggle-lbl">Kemaskini listing_type semua produk seller ini juga</span>
        <input type="checkbox" class="toggle" id="edit-cascade-listings">
      </div>
      <div class="mo-toggle-row">
        <span class="mo-toggle-lbl">Status Kedai — Buka Sekarang</span>
        <input type="checkbox" class="toggle" id="edit-is-open">
      </div>
    </div>
    <div class="mo-actions">
      <button class="btn-submit" onclick="submitEditSeller()">Simpan Perubahan</button>
      <button class="btn-ghost" id="edit-view-shop-btn" onclick="viewShopFromEdit()" style="width:100%;justify-content:center;">&#128065; View Shop</button>
      <button class="btn-cancel" onclick="closeEditSeller()">Batal</button>
    </div>
  </div>
</div>

<!-- MODAL: MANUAL ONBOARD -->
<div id="manual-modal" class="modal-overlay">
  <div class="modal-box">
    <div class="mo-head">
      <span class="mo-title">Daftar Seller Manual</span>
      <button class="mo-close" onclick="closeManualForm()">&#x2715;</button>
    </div>
    <div class="mo-hint" style="margin-bottom:14px;">
      Daftarkan seller atas nama anda sebagai khidmat helpline. Status akan jadi <strong>Pending</strong> — lulus dari senarai selepas ini.<br>
      <span style="color:#f0c040;">Seller perlu log masuk dengan Google sekali untuk mengaktifkan akaun.</span>
    </div>
    <div class="mo-fields">
      <div class="mo-field">
        <div class="mo-lbl">Email Google Seller *</div>
        <input id="mo-email" class="mo-input" type="email" placeholder="contoh@gmail.com">
      </div>
      <div class="mo-field">
        <div class="mo-lbl">Nama Kedai *</div>
        <input id="mo-shop" class="mo-input" type="text" placeholder="Kedai Kak Ida">
      </div>
      <div class="mo-field">
        <div class="mo-lbl">Lokasi / Taman *</div>
        <input id="mo-taman" class="mo-input" type="text" placeholder="Taman Desa Baiduri">
      </div>
      <div class="mo-field">
        <div class="mo-lbl">No. WhatsApp *</div>
        <input id="mo-phone" class="mo-input" type="tel" placeholder="017-1234567">
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Kawasan</div>
          <input id="mo-kawasan" class="mo-input" type="text" placeholder="Bangi">
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Postcode</div>
          <input id="mo-postcode" class="mo-input" type="text" placeholder="43000" maxlength="5">
        </div>
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Business Type</div>
          <select id="mo-business-type" class="mo-input">
            <option value="FOOD">FOOD</option>
            <option value="SERVICE">SERVICE</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="HOMESTAY">HOMESTAY</option>
          </select>
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Plan Type</div>
          <select id="mo-plan-type" class="mo-input">
            <option value="free">free</option>
            <option value="pro">pro</option>
          </select>
        </div>
      </div>
      <div class="mo-field">
        <div class="mo-lbl-opt">Listing Limit (free seller default 5)</div>
        <input id="mo-listing-limit" class="mo-input" type="number" min="0" placeholder="5">
      </div>
    </div>
    <div class="mo-actions">
      <button class="btn-submit" onclick="submitManualOnboard()">Daftar Seller (Pending)</button>
      <button class="btn-cancel" onclick="closeManualForm()">Batal</button>
    </div>
  </div>
</div>

<!-- MODAL: SELLER DETAIL -->
<div id="seller-detail-modal" class="modal-overlay">
  <div class="modal-box large">
    <div class="mo-head">
      <span class="mo-title" id="sd-title">Detail Seller</span>
      <button class="mo-close" onclick="closeSellerDetail()">&#x2715;</button>
    </div>
    <!-- Home Visibility Status -->
    <div id="sd-visibility"></div>
    <!-- Warning badges -->
    <div class="sd-warn-row" id="sd-warnings"></div>
    <!-- Action buttons -->
    <div class="sd-actions-row" id="sd-actions"></div>
    <!-- Info grid: left = data fields, right = image + counters -->
    <div class="sd-info-grid" id="sd-info"></div>
    <!-- Products section -->
    <div>
      <div class="sd-section-title">Produk Seller</div>
      <div class="sd-prod-counts" id="sd-prod-counts"></div>
      <div style="overflow-x:auto;" id="sd-products-list">
        <div style="text-align:center;color:rgba(var(--text-rgb),0.2);padding:24px;font-size:13px;">Memuatkan produk...</div>
      </div>
    </div>
    <!-- Footer: message + close -->
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(var(--border-rgb),0.07);display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-ghost" id="sd-msg-btn" style="font-size:12px;">&#9993; Mesej Seller Ini</button>
      <button class="btn btn-ghost" id="sd-view-shop-btn" style="font-size:12px;">&#128065; View Shop</button>
      <button class="btn btn-ghost" onclick="closeSellerDetail()" style="font-size:12px;">&#x2715; Tutup</button>
    </div>
  </div>
</div>

<!-- MODAL: EDIT LISTING -->
<div id="edit-listing-modal" class="modal-overlay">
  <div class="modal-box">
    <div class="mo-head">
      <span class="mo-title">Edit Listing</span>
      <button class="mo-close" onclick="closeEditListing()">&#x2715;</button>
    </div>
    <div class="mo-fields">
      <input type="hidden" id="el-id">
      <div class="mo-field">
        <div class="mo-lbl">Nama Produk</div>
        <input id="el-name" class="mo-input" type="text" placeholder="Nama produk">
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Listing Type</div>
          <select id="el-listing-type" class="mo-input" onchange="onListingTypeChange()">
            <option value="FOOD">FOOD</option>
            <option value="SERVICE">SERVICE</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="HOMESTAY">HOMESTAY</option>
          </select>
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Kategori</div>
          <select id="el-category" class="mo-input"></select>
        </div>
      </div>
      <div class="mo-row">
        <div class="mo-field">
          <div class="mo-lbl-opt">Harga Dari (RM)</div>
          <input id="el-price" class="mo-input" type="number" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="mo-field">
          <div class="mo-lbl-opt">Unit</div>
          <input id="el-unit" class="mo-input" type="text" placeholder="kg / unit / sesi">
        </div>
      </div>
      <div class="mo-field">
        <div class="mo-lbl-opt">Deskripsi</div>
        <textarea id="el-description" class="mo-textarea" placeholder="Penerangan produk"></textarea>
      </div>
      <div class="mo-field">
        <div class="mo-lbl-opt">Status</div>
        <select id="el-status" class="mo-input">
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>
      <div class="mo-toggle-row">
        <span class="mo-toggle-lbl">Available (Jual Terus)</span>
        <input type="checkbox" class="toggle" id="el-available">
      </div>
      <div class="mo-toggle-row">
        <span class="mo-toggle-lbl">Pre-Order</span>
        <input type="checkbox" class="toggle" id="el-preorder">
      </div>
    </div>
    <div class="mo-actions">
      <button class="btn-submit" onclick="submitEditListing()">Simpan Perubahan</button>
      <button class="btn-cancel" onclick="closeEditListing()">Batal</button>
    </div>
  </div>
</div>

<!-- MODAL: SHOP PREVIEW -->
<div id="shop-preview-modal" class="modal-overlay">
  <div class="modal-box large">
    <div class="mo-head">
      <span class="mo-title">Shop Preview</span>
      <button class="mo-close" onclick="closeShopPreview()">&#x2715;</button>
    </div>
    <div style="background:rgba(240,192,64,0.1);border:1px solid rgba(240,192,64,0.25);color:#f0c040;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:700;margin-bottom:16px;">
      &#9888; Admin Preview — distance filter bypassed
    </div>
    <div id="sp-content"><div class="td-empty">Memuatkan...</div></div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(var(--border-rgb),0.07);display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-ghost" onclick="closeShopPreview()" style="font-size:12px;">&#x2715; Tutup</button>
    </div>
  </div>
</div>
`

export default function Page() {
  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={[`
        document.body.style.touchAction = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        try {
          var savedTheme = localStorage.getItem('lokalgo_admin_theme');
          if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
        } catch (e) {}
      `]}
      externalScripts={['/admin-panel.js']}
      externalStylesheets={['https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;700&display=swap']}
    />
  )
}
