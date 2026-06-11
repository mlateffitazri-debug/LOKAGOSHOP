'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const styles = `
:root{--c-primary:#acd036;--c-bg:#000;--c-surface:#111;--c-border:rgba(255,255,255,0.08);--c-text:#f0f0f0;--c-text2:rgba(240,240,240,0.6);--c-text3:rgba(240,240,240,0.4);--c-hint:rgba(240,240,240,0.25);}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#000;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:#f0f0f0;}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:#000;overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:2px solid rgba(172,208,54,0.2);box-shadow:0 32px 80px rgba(0,0,0,0.95);}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}

/* HEADER */
.header{background:#000;border-bottom:1px solid rgba(255,255,255,0.07);padding:16px 20px 14px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
.admin-badge{background:#acd036;color:#000;font-size:10px;font-weight:800;padding:3px 11px;border-radius:20px;letter-spacing:0.6px;}
.header-sub{font-size:12px;color:rgba(240,240,240,0.35);margin-top:2px;}

/* QUICK STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,0.07);}
.stat-box{padding:12px 6px;text-align:center;border-right:1px solid rgba(255,255,255,0.06);}
.stat-num{font-size:22px;font-weight:800;color:#acd036;line-height:1.1;}
.stat-lbl{font-size:10px;color:rgba(240,240,240,0.4);margin-top:3px;text-transform:uppercase;letter-spacing:0.5px;}
.num-green{color:#acd036;}.num-orange{color:#f0c040;}.num-red{color:#f06060;}.num-blue{color:#7eb8f7;}

/* TABS */
.tabs{display:flex;background:#000;border-bottom:1px solid rgba(255,255,255,0.07);overflow-x:auto;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:12px 15px;font-size:13px;font-weight:700;color:rgba(240,240,240,0.35);cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color 0.15s,border-color 0.15s;letter-spacing:0.2px;}
.tab.active{color:#acd036;border-bottom-color:#acd036;}

/* SECTIONS */
.section{display:none;padding-bottom:40px;}
.section.active{display:block;}
.sec-head{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 10px;}
.sec-title{font-size:14px;font-weight:800;color:#f0f0f0;text-transform:uppercase;letter-spacing:0.6px;}
.count-badge{font-size:12px;background:rgba(255,255,255,0.07);color:rgba(240,240,240,0.55);padding:3px 10px;border-radius:20px;font-weight:700;}
.count-badge.orange{background:rgba(240,192,64,0.12);color:#f0c040;}
.count-badge.red{background:rgba(240,96,96,0.12);color:#f06060;}
.count-badge.green{background:rgba(172,208,54,0.15);color:#acd036;}

/* FILTER BAR — wraps so all chips visible */
.filter-bar{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 12px;}
.f-chip{border:1.5px solid rgba(255,255,255,0.12);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;color:rgba(240,240,240,0.5);cursor:pointer;background:transparent;white-space:nowrap;font-family:inherit;transition:all 0.12s;}
.f-chip.active{background:#acd036;border-color:#acd036;color:#000;}
.f-chip:hover:not(.active){border-color:rgba(255,255,255,0.25);color:rgba(240,240,240,0.8);}

/* SECTION ACTION BUTTON (e.g. + Tambah) */
.sec-action-btn{background:#acd036;color:#000;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;}

/* TABLES */
.tbl-wrap{overflow-x:auto;padding:0 16px 10px;}
.tbl{width:100%;border-collapse:collapse;font-size:12px;min-width:440px;}
.tbl th{background:#0d0d0d;padding:9px 10px;text-align:left;font-size:10px;color:rgba(240,240,240,0.4);font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.08);white-space:nowrap;}
.tbl td{padding:9px 10px;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:middle;}
.tbl tr:hover td{background:rgba(255,255,255,0.03);}
.td-name{font-weight:700;font-size:13px;color:#f0f0f0;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.td-cell{font-size:12px;color:rgba(240,240,240,0.55);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.td-center{text-align:center;}
.td-actions{text-align:right;white-space:nowrap;}
.td-empty{text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;font-weight:500;}

/* ACTION BUTTONS */
.act-btn{border:1px solid transparent;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;margin-left:3px;transition:opacity 0.1s;}
.btn-green{background:#acd036;color:#000;border-color:#acd036;}
.btn-red{background:rgba(240,96,96,0.1);color:rgba(240,140,140,0.8);border-color:rgba(240,96,96,0.2);}
.btn-orange{background:rgba(240,192,64,0.1);color:#f0c040;border-color:rgba(240,192,64,0.2);}
.btn-blue{background:rgba(126,184,247,0.1);color:#7eb8f7;border-color:rgba(126,184,247,0.2);}
.btn-badge{background:rgba(255,255,255,0.06);color:rgba(240,240,240,0.5);border-color:rgba(255,255,255,0.1);}

/* STATUS PILLS */
.status-pill{font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;}
.pill-active{background:rgba(172,208,54,0.15);color:#acd036;border:1px solid rgba(172,208,54,0.3);}
.pill-pending{background:rgba(240,192,64,0.1);border:1px solid rgba(240,192,64,0.25);color:#f0c040;}
.pill-suspended{background:rgba(240,96,96,0.1);border:1px solid rgba(240,96,96,0.2);color:#f06060;}
.pill-deleted{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(240,240,240,0.3);}

/* PLATFORM STATS GRID */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 10px;}
.stat-card{background:#111;border-radius:14px;border:1px solid rgba(255,255,255,0.08);padding:16px;}
.sc-num{font-size:30px;font-weight:800;color:#acd036;line-height:1;}
.sc-lbl{font-size:11px;color:rgba(240,240,240,0.4);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;}
.sc-breakdown{margin-top:10px;display:flex;flex-direction:column;gap:4px;}
.sc-line{font-size:12px;color:rgba(240,240,240,0.6);}
.area-bar-wrap{padding:0 16px 10px;}
.area-card{background:#111;border-radius:12px;border:1px solid rgba(255,255,255,0.08);padding:14px;margin-bottom:8px;}
.area-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.area-name{font-size:13px;font-weight:700;color:#f0f0f0;}
.area-count{font-size:13px;font-weight:800;color:#acd036;}
.area-bar{background:rgba(255,255,255,0.08);border-radius:6px;height:6px;overflow:hidden;}
.area-fill{background:#acd036;height:100%;border-radius:6px;transition:width 0.5s;}

/* DATABASE TAB */
.db-controls{padding:12px 16px;display:flex;gap:8px;align-items:center;}
.db-select{flex:1;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:10px 13px;font-size:13px;color:#f0f0f0;background:#111;outline:none;font-family:inherit;}
.btn-load{background:#acd036;color:#000;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
.db-info{padding:0 16px 8px;font-size:12px;color:rgba(240,240,240,0.4);}
.danger-zone{margin:12px 16px;background:rgba(240,96,96,0.05);border:1px solid rgba(240,96,96,0.15);border-radius:12px;padding:16px;}
.danger-title{font-size:12px;font-weight:800;color:#f06060;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.btn-danger{background:rgba(240,96,96,0.12);color:#f06060;border:1px solid rgba(240,96,96,0.25);border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;}

/* MANUAL ONBOARD MODAL */
.modal-overlay{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);}
.modal-overlay.open{display:flex;align-items:center;justify-content:center;padding:20px;}
.modal-box{background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:22px;width:100%;max-width:390px;max-height:88vh;overflow-y:auto;}
.mo-label{font-size:12px;font-weight:700;color:#acd036;margin-bottom:5px;}
.mo-label-opt{font-size:12px;font-weight:700;color:rgba(240,240,240,0.4);margin-bottom:5px;}
.mo-input{width:100%;border:1px solid rgba(255,255,255,0.12);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;color:#f0f0f0;background:#000;}
.mo-input:focus{border-color:#acd036;}
.mo-hint{font-size:12px;color:rgba(240,240,240,0.6);background:rgba(172,208,54,0.07);border-left:3px solid #acd036;border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:14px;line-height:1.7;}
.btn-mo-submit{width:100%;background:#acd036;border:none;border-radius:11px;padding:14px;color:#000;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-top:16px;}
.btn-mo-cancel{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:11px;padding:12px;color:rgba(240,240,240,0.5);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:8px;}

/* PERFORMANCE CHART */
.chart-section{padding:0 16px 16px;}
.chart-outer{background:#111;border-radius:14px;border:1px solid rgba(255,255,255,0.08);padding:16px 16px 12px;}
.chart-title{font-size:10px;font-weight:800;color:rgba(240,240,240,0.4);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px;}
.chart-bars{display:flex;align-items:flex-end;height:100px;gap:4px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.07);}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;}
.chart-bar-group{display:flex;align-items:flex-end;height:90px;gap:2px;width:100%;}
.chart-bar-wrap{flex:1;display:flex;align-items:flex-end;height:100%;}
.chart-bar{width:100%;border-radius:3px 3px 0 0;min-height:2px;transition:height 0.5s ease;}
.bar-seller{background:#acd036;}
.bar-buyer{background:#7eb8f7;}
.chart-lbl{font-size:9px;color:rgba(240,240,240,0.3);margin-top:5px;white-space:nowrap;}
.chart-legend{display:flex;gap:14px;margin-top:12px;}
.legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(240,240,240,0.5);}
.legend-dot{width:8px;height:8px;border-radius:2px;}
`

/* ─── MARKUP ─────────────────────────────────────────────────────────────── */
const markup = `<div class="page"><div class="scroll">

<div class="header">
  <div class="header-r1">
    <svg viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" style="height:36px;width:auto;">
      <style>.s0{fill:#acd036}.s1{fill:#acd036}</style>
      <path class="s0" d="M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z"/>
      <path class="s0" d="M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z"/>
      <path class="s0" d="M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z"/>
      <path class="s0" d="M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z"/>
      <path class="s1" d="M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z"/>
      <path class="s1" d="M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z"/>
    </svg>
    <span class="admin-badge">ADMIN</span>
  </div>
  <div class="header-sub">LokalGo Admin Panel — NS0308474-A</div>
</div>

<div class="stats-row" id="statsRow">
  <div class="stat-box"><div class="stat-num num-green" id="st-active">—</div><div class="stat-lbl">Aktif</div></div>
  <div class="stat-box"><div class="stat-num num-orange" id="st-pending">—</div><div class="stat-lbl">Pending</div></div>
  <div class="stat-box"><div class="stat-num num-blue" id="st-buyers">—</div><div class="stat-lbl">Buyers</div></div>
  <div class="stat-box"><div class="stat-num num-red" id="st-review">—</div><div class="stat-lbl">Semak</div></div>
</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab(this,'tab-sellers')">SELLERS</div>
  <div class="tab" onclick="switchTab(this,'tab-buyers')">BUYERS</div>
  <div class="tab" onclick="switchTab(this,'tab-testimoni')">TESTIMONI</div>
  <div class="tab" onclick="switchTab(this,'tab-saved')">SAVED</div>
  <div class="tab" onclick="switchTab(this,'tab-stats')">STATS</div>
  <div class="tab" onclick="switchTab(this,'tab-database')">DATABASE</div>
</div>

<!-- TAB: SELLERS -->
<div class="section active" id="tab-sellers">
  <div class="sec-head">
    <span class="sec-title">Sellers</span>
    <div style="display:flex;align-items:center;gap:6px;">
      <button onclick="openManualForm()" style="background:var(--c-primary);color:#fff;border:none;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">+ Tambah</button>
      <span class="count-badge" id="sellers-count">—</span>
    </div>
  </div>
  <div class="filter-bar">
    <button class="f-chip active" onclick="filterSellers(this,'all')">Semua</button>
    <button class="f-chip" onclick="filterSellers(this,'pending')">Pending</button>
    <button class="f-chip" onclick="filterSellers(this,'active')">Aktif</button>
    <button class="f-chip" onclick="filterSellers(this,'suspended')">Suspended</button>
    <button class="f-chip" onclick="filterSellers(this,'deleted')">Dipadam</button>
  </div>
  <div class="tbl-wrap">
    <table class="tbl">
      <thead><tr>
        <th>Nama Kedai</th><th>Kawasan</th><th>Badge</th>
        <th>Buka</th><th>Status</th><th>Tarikh</th><th>Tindakan</th>
      </tr></thead>
      <tbody id="sellers-tbody"><tr><td colspan="7" class="td-empty">Memuatkan...</td></tr></tbody>
    </table>
  </div>
</div>

<!-- TAB: BUYERS -->
<div class="section" id="tab-buyers">
  <div class="sec-head">
    <span class="sec-title">Buyers</span>
    <span class="count-badge green" id="buyers-count">—</span>
  </div>
  <div class="filter-bar">
    <button class="f-chip active" onclick="filterBuyers(this,'all')">Semua</button>
    <button class="f-chip" onclick="filterBuyers(this,'deleted')">Dipadam</button>
  </div>
  <div class="tbl-wrap">
    <table class="tbl">
      <thead><tr>
        <th>Nama</th><th>Email</th><th>Kawasan</th><th>Tarikh Daftar</th><th>Del</th>
      </tr></thead>
      <tbody id="buyers-tbody"><tr><td colspan="5" class="td-empty">Memuatkan...</td></tr></tbody>
    </table>
  </div>
</div>

<!-- TAB: TESTIMONI -->
<div class="section" id="tab-testimoni">
  <div class="sec-head">
    <span class="sec-title">Testimoni</span>
    <span class="count-badge orange" id="testi-count">—</span>
  </div>
  <div class="filter-bar">
    <button class="f-chip active" onclick="filterTesti(this,'all')">Semua</button>
    <button class="f-chip" onclick="filterTesti(this,'pending')">Pending</button>
    <button class="f-chip" onclick="filterTesti(this,'approved')">Diluluskan</button>
    <button class="f-chip" onclick="filterTesti(this,'deleted')">Dipadam</button>
  </div>
  <div class="tbl-wrap">
    <table class="tbl">
      <thead><tr>
        <th>Pembeli</th><th>Kedai</th><th>Ulasan</th><th>★</th><th>Status</th><th>Tindakan</th>
      </tr></thead>
      <tbody id="testi-tbody"><tr><td colspan="6" class="td-empty">Memuatkan...</td></tr></tbody>
    </table>
  </div>
</div>

<!-- TAB: SAVED SHOPS -->
<div class="section" id="tab-saved">
  <div class="sec-head">
    <span class="sec-title">Saved Shops</span>
    <span class="count-badge" id="saved-count">—</span>
  </div>
  <div class="tbl-wrap">
    <table class="tbl">
      <thead><tr><th>Pembeli</th><th>Kedai</th><th>Tarikh Simpan</th></tr></thead>
      <tbody id="saved-tbody"><tr><td colspan="3" class="td-empty">Memuatkan...</td></tr></tbody>
    </table>
  </div>
</div>

<!-- TAB: PLATFORM STATS -->
<div class="section" id="tab-stats">
  <div class="sec-head"><span class="sec-title">Pengguna & Penjual</span></div>
  <div class="stat-grid">
    <div class="stat-card" style="grid-column:1/-1;border-left:4px solid #acd036;display:flex;gap:12px;align-items:center;">
      <div style="flex:1;">
        <div class="sc-num" id="ps-reg-users">—</div>
        <div class="sc-lbl">Jumlah Pengguna Daftar</div>
      </div>
      <div style="flex:1;border-left:1px solid rgba(255,255,255,0.08);padding-left:12px;">
        <div class="sc-num" id="ps-sellers">—</div>
        <div class="sc-lbl">Jumlah Penjual</div>
        <div class="sc-breakdown" id="ps-sellers-detail"></div>
      </div>
    </div>
    <div class="stat-card" style="border-left:4px solid #7eb8f7;">
      <div class="sc-num" style="color:#7eb8f7;" id="ps-buyers">—</div>
      <div class="sc-lbl">Pembeli</div>
    </div>
    <div class="stat-card" style="border-left:4px solid #f0c040;">
      <div class="sc-num" style="color:#f0c040;" id="ps-testi">—</div>
      <div class="sc-lbl">Testimoni</div>
    </div>
    <div class="stat-card" style="border-left:4px solid rgba(172,208,54,0.5);">
      <div class="sc-num" id="ps-saved">—</div>
      <div class="sc-lbl">Kedai Disimpan</div>
    </div>
    <div class="stat-card" style="border-left:4px solid rgba(255,255,255,0.2);">
      <div class="sc-num" id="ps-conv">—</div>
      <div class="sc-lbl">Kadar Penjual Aktif</div>
    </div>
  </div>

  <div class="sec-head"><span class="sec-title">Graf Pendaftaran (6 Bulan)</span></div>
  <div class="chart-section">
    <div class="chart-outer">
      <div class="chart-title">Seller vs Buyer — Bulanan</div>
      <div class="chart-bars" id="reg-chart">
        <div style="color:rgba(240,240,240,0.3);font-size:12px;width:100%;text-align:center;">Memuatkan...</div>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-dot" style="background:#acd036;"></div>Seller</div>
        <div class="legend-item"><div class="legend-dot" style="background:#7eb8f7;"></div>Buyer</div>
      </div>
    </div>
  </div>

  <div class="sec-head"><span class="sec-title">Badge Penjual</span></div>
  <div class="stat-grid">
    <div class="stat-card"><div class="sc-num" style="color:rgba(240,240,240,0.5);" id="ps-b-baharu">—</div><div class="sc-lbl">Seller Baharu</div></div>
    <div class="stat-card"><div class="sc-num" style="color:#7eb8f7;" id="ps-b-aktif">—</div><div class="sc-lbl">Seller Aktif</div></div>
    <div class="stat-card" style="grid-column:1/-1;"><div class="sc-num" id="ps-b-verified">—</div><div class="sc-lbl">Verified Seller</div></div>
  </div>
  <div class="sec-head"><span class="sec-title">Seller by Kawasan</span></div>
  <div class="area-bar-wrap" id="area-bars"><div style="text-align:center;color:rgba(240,240,240,0.3);padding:20px;font-size:13px;">Memuatkan...</div></div>
</div>

<!-- TAB: DATABASE -->
<div class="section" id="tab-database">
  <div class="sec-head"><span class="sec-title">Database Viewer</span></div>
  <div class="db-controls">
    <select class="db-select" id="db-table-select" onchange="loadDbTable(this.value)">
      <option value="">-- Pilih Jadual --</option>
      <option value="sellers">sellers</option>
      <option value="buyers">buyers</option>
      <option value="testimonials">testimonials</option>
      <option value="saved_shops">saved_shops</option>
      <option value="products">products</option>
      <option value="suspended_sellers">suspended_sellers</option>
    </select>
    <button class="btn-load" onclick="loadDbTable(document.getElementById('db-table-select').value)">Muat</button>
  </div>
  <div class="db-info" id="db-info"></div>
  <div id="db-content" style="padding-bottom:10px;"></div>
  <div class="danger-zone">
    <div class="danger-title">⚠ Danger Zone</div>
    <p style="font-size:12px;color:rgba(240,240,240,0.5);margin-bottom:10px;line-height:1.6;">Padam SEMUA rekod dari jadual yang dipilih. Tindakan ini tidak boleh dibatalkan.</p>
    <button class="btn-danger" onclick="clearDbTable()">Padam Semua Rekod dalam Jadual Ini</button>
  </div>
</div>

</div>

<!-- MANUAL ONBOARD MODAL -->
<div id="manual-modal" class="modal-overlay">
  <div class="modal-box">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <span style="font-size:16px;font-weight:800;color:#f0f0f0;">Tambah Penjual Manual</span>
      <button onclick="closeManualForm()" style="border:none;background:none;font-size:20px;color:rgba(240,240,240,0.35);cursor:pointer;line-height:1;padding:0 4px;">✕</button>
    </div>
    <div class="mo-hint">
      Daftarkan penjual atas nama anda sebagai khidmat helpline. Status akan jadi <strong>Pending</strong> — luluskan dari senarai selepas ini. Jika email sudah dalam sistem auth, akaun dikaitkan automatik.
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div>
        <div class="mo-label">Email Google Penjual *</div>
        <input id="mo-email" class="mo-input" type="email" placeholder="contoh@gmail.com">
      </div>
      <div>
        <div class="mo-label">Nama Kedai *</div>
        <input id="mo-shop" class="mo-input" type="text" placeholder="Kedai Kak Ida">
      </div>
      <div>
        <div class="mo-label">Lokasi / Taman *</div>
        <input id="mo-taman" class="mo-input" type="text" placeholder="Taman Desa Baiduri">
      </div>
      <div>
        <div class="mo-label">No. WhatsApp *</div>
        <input id="mo-phone" class="mo-input" type="tel" placeholder="017-1234567">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div>
          <div class="mo-label-opt">Kawasan</div>
          <input id="mo-kawasan" class="mo-input" type="text" placeholder="Bangi">
        </div>
        <div>
          <div class="mo-label-opt">Postcode</div>
          <input id="mo-postcode" class="mo-input" type="text" placeholder="43000" maxlength="5">
        </div>
      </div>
    </div>
    <button class="btn-mo-submit" onclick="submitManualOnboard()">Daftar Penjual (Pending)</button>
    <button class="btn-mo-cancel" onclick="closeManualForm()">Batal</button>
  </div>
</div>

</div>`

/* ─── CLIENT SCRIPTS ─────────────────────────────────────────────────────── */
const scripts = [`
// ── State ────────────────────────────────────────────────────────────────────
var _data = null;
var _dbTable = '';
var _sellersFilter = 'all';
var _buyersFilter = 'all';
var _testiFilter = 'all';

// ── Tab / filter helpers ──────────────────────────────────────────────────────
function switchTab(el, id) {
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.section').forEach(function(s){ s.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById(id).classList.add('active');
}

function filterSellers(el, f) {
  _sellersFilter = f;
  document.querySelectorAll('#tab-sellers .f-chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  renderSellers();
}

function filterBuyers(el, f) {
  _buyersFilter = f;
  document.querySelectorAll('#tab-buyers .f-chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  renderBuyers();
}

function filterTesti(el, f) {
  _testiFilter = f;
  document.querySelectorAll('#tab-testimoni .f-chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  renderTesti();
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setHtml(id, v) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = v;
}

// ── Admin actions ─────────────────────────────────────────────────────────────
function adminActionCall(type, id, action) {
  return "adminAction('" + type + "','" + id + "','" + action + "')";
}

function adminDeleteCall(type, id, label) {
  return "adminDelete('" + type + "','" + id + "','" + label + "')";
}

function adminAction(type, id, action) {
  fetch('/api/admin/moderation', {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ type: type, id: id, action: action })
  }).then(function(r){ return r.json(); }).then(function(payload){
    if (payload.error) { alert('Ralat: ' + payload.error); return; }
    loadAdminData();
  }).catch(function(e){ alert('Ralat rangkaian: ' + e.message); });
}

function adminDelete(type, id, label) {
  if (confirm('Padam ' + label + ' ini?')) adminAction(type, id, 'delete');
}

// ── Render: Sellers ───────────────────────────────────────────────────────────
function renderSellers() {
  if (!_data) return;

  // Deleted view
  if (_sellersFilter === 'deleted') {
    var deleted = _data.deletedSellers || [];
    setText('sellers-count', deleted.length + ' dipadam');
    if (!deleted.length) {
      setHtml('sellers-tbody', '<tr><td colspan="7" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
      return;
    }
    var html = deleted.map(function(s) {
      var shopName = (s.shop_name || s.name || '-').toString().slice(0,22);
      var kawasan = (s.kawasan || '-').toString().slice(0,14);
      var deletedAt = s.deleted_at ? new Date(s.deleted_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('seller', s.id, 'restore')+'">↩</button>';
      return '<tr data-id="'+s.id+'" style="opacity:0.6;">' +
        '<td class="td-name" title="'+(s.shop_name||s.name||'')+'">'+shopName+'</td>' +
        '<td class="td-cell">'+kawasan+'</td>' +
        '<td class="td-center">—</td>' +
        '<td class="td-center">—</td>' +
        '<td class="td-center"><span class="status-pill pill-deleted">dipadam</span></td>' +
        '<td class="td-cell">'+deletedAt+'</td>' +
        '<td class="td-actions">'+restoreBtn+'</td>' +
        '</tr>';
    }).join('');
    setHtml('sellers-tbody', html);
    return;
  }

  // Normal view
  var sellers = _data.sellers || [];
  var filtered = _sellersFilter === 'all' ? sellers : sellers.filter(function(s){
    var st = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    return st === _sellersFilter;
  });
  setText('sellers-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('sellers-tbody', '<tr><td colspan="7" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
    return;
  }
  var html = filtered.map(function(s) {
    var status = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    var badge = s.badge || 'seller_baharu';
    var badgeLabel = badge === 'verified' || badge === 'verified_seller'
      ? '<span style="color:#acd036;font-weight:700;font-size:11px;">Verified</span>'
      : badge === 'seller_aktif'
        ? '<span style="color:#7eb8f7;font-weight:700;font-size:11px;">Aktif</span>'
        : '<span style="color:rgba(240,240,240,0.45);font-weight:700;font-size:11px;">Baharu</span>';
    var approveBtn = status === 'pending' ? '<button class="act-btn btn-green" onclick="'+adminActionCall('seller', s.id, 'approve')+'">OK</button>' : '';
    var suspendBtn = status === 'active'
      ? '<button class="act-btn btn-orange" onclick="'+adminActionCall('seller', s.id, 'suspend')+'">Ban</button>'
      : status === 'suspended'
        ? '<button class="act-btn btn-blue" onclick="'+adminActionCall('seller', s.id, 'unsuspend')+'">On</button>'
        : '';
    var delBtn = '<button class="act-btn btn-red" onclick="'+adminDeleteCall('seller', s.id, 'seller')+'">Del</button>';
    var nextBadge = badge === 'seller_baharu' ? 'badge_aktif' : badge === 'seller_aktif' ? 'badge_verified' : 'badge_baharu';
    var nextLbl = nextBadge === 'badge_aktif' ? 'B-A' : nextBadge === 'badge_verified' ? 'A-V' : 'V-B';
    var badgeBtn = '<button class="act-btn btn-badge" title="Naik badge" onclick="'+adminActionCall('seller', s.id, nextBadge)+'">'+nextLbl+'</button>';
    var shopName = (s.shop_name || s.name || '-').toString().slice(0,22);
    var kawasan = (s.kawasan || '-').toString().slice(0,14);
    var created = s.created_at ? new Date(s.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
    return '<tr data-id="'+s.id+'" data-status="'+status+'">' +
      '<td class="td-name" title="'+(s.shop_name||s.name||'')+'">'+shopName+'</td>' +
      '<td class="td-cell">'+kawasan+'</td>' +
      '<td class="td-center">'+badgeLabel+'</td>' +
      '<td class="td-center">'+(s.is_open ? '<span style="color:#acd036;font-size:11px;">Buka</span>' : '<span style="color:rgba(240,240,240,0.3);font-size:11px;">Tutup</span>')+'</td>' +
      '<td class="td-center"><span class="status-pill '+(status==='active'?'pill-active':status==='pending'?'pill-pending':'pill-suspended')+'">'+status+'</span></td>' +
      '<td class="td-cell">'+created+'</td>' +
      '<td class="td-actions">'+approveBtn+suspendBtn+delBtn+badgeBtn+'</td>' +
      '</tr>';
  }).join('');
  setHtml('sellers-tbody', html);
}

// ── Render: Buyers ────────────────────────────────────────────────────────────
function renderBuyers() {
  if (!_data) return;

  // Deleted view
  if (_buyersFilter === 'deleted') {
    var deleted = _data.deletedBuyers || [];
    setText('buyers-count', deleted.length + ' dipadam');
    if (!deleted.length) {
      setHtml('buyers-tbody', '<tr><td colspan="5" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
      return;
    }
    var html = deleted.map(function(b) {
      var name = (b.name || '-').toString().slice(0,20);
      var email = (b.email || '-').toString().slice(0,22);
      var kawasan = (b.kawasan || '-').toString().slice(0,14);
      var deletedAt = b.deleted_at ? new Date(b.deleted_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('buyer', b.id, 'restore')+'">↩</button>';
      return '<tr style="opacity:0.6;">' +
        '<td class="td-name">'+name+'</td>' +
        '<td class="td-cell" title="'+(b.email||'')+'">'+email+'</td>' +
        '<td class="td-cell">'+kawasan+'</td>' +
        '<td class="td-cell">'+deletedAt+'</td>' +
        '<td class="td-actions">'+restoreBtn+'</td>' +
        '</tr>';
    }).join('');
    setHtml('buyers-tbody', html);
    return;
  }

  // Normal view
  var buyers = _data.buyers || [];
  setText('buyers-count', buyers.length + ' total');
  if (!buyers.length) {
    setHtml('buyers-tbody', '<tr><td colspan="5" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
    return;
  }
  var html = buyers.map(function(b) {
    var name = (b.name || '-').toString().slice(0,20);
    var email = (b.email || '-').toString().slice(0,22);
    var kawasan = (b.kawasan || '-').toString().slice(0,14);
    var created = b.created_at ? new Date(b.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
    return '<tr><td class="td-name">'+name+'</td><td class="td-cell" title="'+(b.email||'')+'">'+email+'</td>' +
      '<td class="td-cell">'+kawasan+'</td><td class="td-cell">'+created+'</td>' +
      '<td class="td-actions"><button class="act-btn btn-red" onclick="'+adminDeleteCall('buyer', b.id, 'buyer')+'">Del</button></td></tr>';
  }).join('');
  setHtml('buyers-tbody', html);
}

// ── Render: Testimoni ─────────────────────────────────────────────────────────
function renderTesti() {
  if (!_data) return;

  var sellers = _data.sellers || [];
  var sellerMap = {};
  sellers.forEach(function(s){ sellerMap[s.id] = s.shop_name || s.name || '-'; });

  // Deleted view
  if (_testiFilter === 'deleted') {
    var deleted = _data.deletedTestimonials || [];
    setText('testi-count', deleted.length + ' dipadam');
    if (!deleted.length) {
      setHtml('testi-tbody', '<tr><td colspan="6" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
      return;
    }
    var html = deleted.map(function(t) {
      var shop = (sellerMap[t.seller_id] || '-').toString().slice(0,16);
      var buyer = (t.buyer_name || '-').toString().slice(0,16);
      var content = (t.content || '-').toString().slice(0,28);
      var deletedAt = t.deleted_at ? new Date(t.deleted_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('testimonial', t.id, 'restore')+'">↩</button>';
      return '<tr style="opacity:0.6;">' +
        '<td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td>' +
        '<td class="td-name" title="'+(t.content||'')+'">'+content+'</td>' +
        '<td class="td-center" style="color:rgba(240,240,240,0.3);font-size:11px;">'+deletedAt+'</td>' +
        '<td class="td-center"><span class="status-pill pill-deleted">dipadam</span></td>' +
        '<td class="td-actions">'+restoreBtn+'</td></tr>';
    }).join('');
    setHtml('testi-tbody', html);
    return;
  }

  // Normal view
  var all = _data.testimonials || [];
  var filtered = _testiFilter === 'all' ? all :
    _testiFilter === 'pending' ? all.filter(function(t){ return !t.is_approved; }) :
    all.filter(function(t){ return t.is_approved; });
  setText('testi-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('testi-tbody', '<tr><td colspan="6" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
    return;
  }
  var html = filtered.map(function(t) {
    var shop = (sellerMap[t.seller_id] || '-').toString().slice(0,16);
    var buyer = (t.buyer_name || '-').toString().slice(0,16);
    var content = (t.content || '-').toString().slice(0,30);
    var rating = 'star '.repeat(t.rating || 0);
    var approved = t.is_approved ? '<span style="color:#acd036;font-weight:700;font-size:11px;">Lulus</span>' : '<span style="color:#f0c040;font-weight:700;font-size:11px;">Pending</span>';
    var approveBtn = !t.is_approved ? '<button class="act-btn btn-green" onclick="'+adminActionCall('testimonial', t.id, 'approve')+'">OK</button>' : '';
    var delBtn = '<button class="act-btn btn-red" onclick="'+adminDeleteCall('testimonial', t.id, 'testimoni')+'">Del</button>';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td>' +
      '<td class="td-name" title="'+(t.content||'')+'">'+content+'</td>' +
      '<td class="td-center" style="color:#f0c040;font-size:13px;">'+rating+'</td>' +
      '<td class="td-center">'+approved+'</td>' +
      '<td class="td-actions">'+approveBtn+delBtn+'</td></tr>';
  }).join('');
  setHtml('testi-tbody', html);
}

// ── Render: Saved ─────────────────────────────────────────────────────────────
function renderSaved() {
  if (!_data) return;
  var saved = _data.savedShops || [];
  setText('saved-count', saved.length + ' rekod');
  if (!saved.length) { setHtml('saved-tbody', '<tr><td colspan="3" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>'); return; }
  var html = saved.map(function(row) {
    var buyer = (row.buyer_display || row.buyer_id || '—').toString().slice(0,22);
    var shop = (row.shop_display || row.shop_id || '—').toString().slice(0,22);
    var created = row.created_at ? new Date(row.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '—';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td><td class="td-cell">'+created+'</td></tr>';
  }).join('');
  setHtml('saved-tbody', html);
}

// ── Render: Stats ─────────────────────────────────────────────────────────────
function renderStats() {
  if (!_data || !_data.stats) return;
  var s = _data.stats;
  setText('ps-reg-users', s.totalRegisteredUsers || (s.totalSellers + s.totalBuyers) || 0);
  setText('ps-sellers', s.totalSellers || 0);
  setText('ps-buyers', s.totalBuyers || 0);
  setText('ps-testi', s.totalTestimonials || 0);
  setText('ps-saved', s.totalSavedShops || 0);
  var conv = s.totalSellers ? Math.round((s.sellersByStatus.active / s.totalSellers) * 100) : 0;
  setText('ps-conv', conv + '%');
  setText('ps-b-baharu', s.sellersByBadge.seller_baharu || 0);
  setText('ps-b-aktif', s.sellersByBadge.seller_aktif || 0);
  setText('ps-b-verified', s.sellersByBadge.verified || 0);
  var sb = s.sellersByStatus;
  setHtml('ps-sellers-detail',
    '<div class="sc-line" style="color:#acd036;">● '+sb.active+' Aktif</div>' +
    '<div class="sc-line" style="color:#f0c040;">● '+sb.pending+' Pending</div>' +
    '<div class="sc-line" style="color:#f06060;">● '+sb.suspended+' Suspended</div>'
  );
  var areas = s.sellersByArea || [];
  var max = areas.length ? areas[0].count : 1;
  var areaHtml = areas.slice(0,8).map(function(a) {
    var pct = Math.round((a.count / max) * 100);
    return '<div class="area-card">' +
      '<div class="area-row"><span class="area-name">'+a.area+'</span><span class="area-count">'+a.count+' seller</span></div>' +
      '<div class="area-bar"><div class="area-fill" style="width:'+pct+'%"></div></div>' +
      '</div>';
  }).join('') || '<div style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</div>';
  setHtml('area-bars', areaHtml);
  renderRegistrationChart(_data.sellers || [], _data.buyers || []);
}

// ── Graf Pendaftaran ───────────────────────────────────────────────────────────
function renderRegistrationChart(sellers, buyers) {
  var now = new Date();
  var months = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push({
      label: d.toLocaleDateString('ms-MY', { month: 'short' }),
      key: key, s: 0, b: 0
    });
  }
  var idx = {};
  months.forEach(function(m, i){ idx[m.key] = i; });
  sellers.forEach(function(s){ if (!s.created_at) return; var k = s.created_at.slice(0,7); if (idx[k] !== undefined) months[idx[k]].s++; });
  buyers.forEach(function(b){ if (!b.created_at) return; var k = b.created_at.slice(0,7); if (idx[k] !== undefined) months[idx[k]].b++; });
  var maxVal = Math.max(1, Math.max.apply(null, months.map(function(m){ return Math.max(m.s, m.b); })));
  var html = months.map(function(m) {
    var sp = Math.max(2, Math.round((m.s / maxVal) * 90));
    var bp = Math.max(2, Math.round((m.b / maxVal) * 90));
    return '<div class="chart-col">' +
      '<div class="chart-bar-group">' +
        '<div class="chart-bar-wrap"><div class="chart-bar bar-seller" style="height:'+sp+'px;" title="'+m.s+' seller"></div></div>' +
        '<div class="chart-bar-wrap"><div class="chart-bar bar-buyer" style="height:'+bp+'px;" title="'+m.b+' buyer"></div></div>' +
      '</div>' +
      '<div class="chart-lbl">'+m.label+'</div>' +
    '</div>';
  }).join('');
  setHtml('reg-chart', html || '<div style="color:rgba(240,240,240,0.3);font-size:13px;padding:20px 0;">Tiada data</div>');
}

// ── Load all admin data ───────────────────────────────────────────────────────
function loadAdminData() {
  fetch('/api/admin/moderation', { cache: 'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(data) {
      if (data.error) { alert('Gagal muat data: ' + data.error); return; }
      _data = data;
      setText('st-active', data.stats.sellersByStatus.active);
      setText('st-pending', data.stats.sellersByStatus.pending);
      setText('st-buyers', data.stats.totalBuyers);
      setText('st-review', (data.pendingTestimonials || []).length + (data.complaints || []).length);
      renderSellers();
      renderBuyers();
      renderTesti();
      renderSaved();
      renderStats();
    })
    .catch(function(e){ alert('Ralat rangkaian: ' + e.message); });
}

// ── Database tab ──────────────────────────────────────────────────────────────
function loadDbTable(table) {
  if (!table) return;
  _dbTable = table;
  setHtml('db-info', 'Memuatkan ' + table + '...');
  setHtml('db-content', '');
  fetch('/api/admin/database?table=' + encodeURIComponent(table) + '&limit=50')
    .then(function(r){ return r.json(); })
    .then(function(data) {
      if (data.error) { setHtml('db-info', 'Ralat: ' + data.error); return; }
      var rows = data.rows || [];
      setHtml('db-info', table + ' — ' + data.count + ' rekod (paparan: ' + rows.length + ')');
      if (!rows.length) { setHtml('db-content', '<div style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Jadual kosong</div>'); return; }
      var cols = Object.keys(rows[0]);
      var html = '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
      cols.forEach(function(c){ html += '<th>'+c+'</th>'; });
      html += '<th>Del</th></tr></thead><tbody>';
      rows.forEach(function(row) {
        html += '<tr>';
        cols.forEach(function(col) {
          var val = row[col];
          if (val === null || val === undefined) val = '—';
          else if (typeof val === 'boolean') val = val ? '✓' : '✗';
          else if (typeof val === 'object') val = JSON.stringify(val).slice(0,30) + '…';
          else val = String(val).slice(0,40);
          html += '<td class="td-cell" title="'+String(row[col]||'')+'">'+val+'</td>';
        });
        html += '<td><button class="act-btn btn-red" data-id="'+row.id+'" onclick="deleteDbRow(this.dataset.id)">Del</button></td></tr>';
      });
      html += '</tbody></table></div>';
      setHtml('db-content', html);
    })
    .catch(function(e){ setHtml('db-info', 'Ralat: ' + e.message); });
}

function deleteDbRow(id) {
  if (!_dbTable) { alert('Pilih jadual dahulu.'); return; }
  if (!confirm('Padam rekod ini dari ' + _dbTable + '?')) return;
  fetch('/api/admin/database', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action: 'delete_row', table: _dbTable, id: id })
  }).then(function(r){ return r.json(); }).then(function(d){
    if (d.error) { alert('Ralat: ' + d.error); return; }
    loadDbTable(_dbTable);
  }).catch(function(e){ alert('Ralat: ' + e.message); });
}

function clearDbTable() {
  if (!_dbTable) { alert('Pilih jadual dahulu.'); return; }
  if (!confirm('AMARAN: Ini akan MEMADAM SEMUA rekod dari jadual "' + _dbTable + '". Tindakan ini tidak boleh dibatalkan. Teruskan?')) return;
  if (!confirm('Sahkan sekali lagi: Padam SEMUA rekod dari "' + _dbTable + '"?')) return;
  fetch('/api/admin/database', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action: 'clear_table', table: _dbTable })
  }).then(function(r){ return r.json(); }).then(function(d){
    if (d.error) { alert('Ralat: ' + d.error); return; }
    alert('Semua rekod dari "' + _dbTable + '" telah dipadam.');
    loadDbTable(_dbTable);
    loadAdminData();
  }).catch(function(e){ alert('Ralat: ' + e.message); });
}

// ── Manual Onboard Modal ──────────────────────────────────────────────────────
function openManualForm() {
  var modal = document.getElementById('manual-modal');
  if (modal) modal.classList.add('open');
}

function closeManualForm() {
  var modal = document.getElementById('manual-modal');
  if (modal) modal.classList.remove('open');
  ['mo-email','mo-shop','mo-taman','mo-phone','mo-kawasan','mo-postcode'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function submitManualOnboard() {
  var email    = ((document.getElementById('mo-email')   || {}).value || '').trim();
  var shopName = ((document.getElementById('mo-shop')    || {}).value || '').trim();
  var taman    = ((document.getElementById('mo-taman')   || {}).value || '').trim();
  var phone    = ((document.getElementById('mo-phone')   || {}).value || '').trim();
  var kawasan  = ((document.getElementById('mo-kawasan') || {}).value || '').trim();
  var postcode = ((document.getElementById('mo-postcode')|| {}).value || '').trim();

  if (!email || !shopName || !taman || !phone) {
    alert('Sila lengkapkan: Email Google, Nama Kedai, Taman dan No. WhatsApp.');
    return;
  }

  fetch('/api/admin/manual-onboard', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email,
      shop_name: shopName,
      taman_name: taman,
      whatsapp_number: phone,
      kawasan: kawasan || taman,
      postcode: postcode || '00000'
    })
  }).then(function(r){ return r.json(); })
  .then(function(d) {
    if (d.error) { alert('Ralat: ' + d.error); return; }
    var msg = 'Penjual berjaya didaftarkan! (Status: Pending)\n\nID: ' + d.sellerId;
    if (d.linked) {
      msg += '\n\nAkaun Google berjaya dikaitkan. Penjual boleh log masuk dan tunggu kelulusan.';
    } else {
      msg += '\n\nEmail tidak dijumpai dalam sistem. Penjual perlu log masuk dengan Google sekali untuk mengaktifkan pautan akaun.';
    }
    alert(msg);
    closeManualForm();
    loadAdminData();
  })
  .catch(function(e){ alert('Ralat rangkaian: ' + e.message); });
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadAdminData();
`]

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function Page() {
  useEffect(() => {
    // Data loading and action handlers are wired in the inline scripts above.
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={scripts}
      externalScripts={[]}
      externalStylesheets={['https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap']}
    />
  )
}
