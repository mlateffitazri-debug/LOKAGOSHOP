'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const styles = `
:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#fff;--c-border:#E5E5EA;--c-text:#111;--c-text2:#555;--c-text3:#888;--c-hint:#bbb;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}

/* HEADER */
.header{background:#111;padding:14px 20px 12px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}
.admin-badge{background:#e44;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;}
.header-sub{font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;}

/* STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);background:#eee;border-bottom:1px solid #eee;}
.stat-box{background:#fff;padding:10px 6px;text-align:center;border-right:1px solid #eee;}
.stat-num{font-size:18px;font-weight:800;}
.stat-lbl{font-size:9px;color:var(--c-hint);margin-top:1px;text-transform:uppercase;letter-spacing:0.4px;}
.num-green{color:#3B6D11;}.num-orange{color:#856404;}.num-red{color:#A32D2D;}.num-blue{color:#185FA5;}

/* TABS */
.tabs{display:flex;background:#fff;border-bottom:2px solid #eee;overflow-x:auto;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:11px 14px;font-size:12px;font-weight:700;color:var(--c-hint);cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.15s;letter-spacing:0.3px;}
.tab.active{color:var(--c-primary);border-bottom-color:var(--c-primary);}

/* SECTIONS */
.section{display:none;padding-bottom:32px;}
.section.active{display:block;}
.sec-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 8px;}
.sec-title{font-size:12px;font-weight:800;color:var(--c-text);text-transform:uppercase;letter-spacing:0.5px;}
.count-badge{font-size:11px;background:#f0f0f0;color:var(--c-text3);padding:2px 8px;border-radius:20px;font-weight:700;}
.count-badge.orange{background:#FFF3E0;color:#856404;}
.count-badge.red{background:#FFEBEE;color:#A32D2D;}
.count-badge.green{background:#EAF3DE;color:#3B6D11;}

/* FILTER BAR */
.filter-bar{display:flex;gap:6px;padding:0 14px 10px;overflow-x:auto;}
.filter-bar::-webkit-scrollbar{display:none;}
.f-chip{border:1.5px solid #eee;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#888;cursor:pointer;background:#fff;white-space:nowrap;font-family:inherit;}
.f-chip.active{background:var(--c-primary);border-color:var(--c-primary);color:#fff;}

/* TABLES */
.tbl-wrap{overflow-x:auto;padding:0 14px 10px;}
.tbl{width:100%;border-collapse:collapse;font-size:11px;min-width:460px;}
.tbl th{background:#f8f8f8;padding:7px 8px;text-align:left;font-size:9px;color:#aaa;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eee;white-space:nowrap;}
.tbl td{padding:7px 8px;border-bottom:1px solid #f5f5f5;vertical-align:middle;}
.tbl tr:hover td{background:#fafafa;}
.td-name{font-weight:700;color:var(--c-text);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.td-cell{color:var(--c-text2);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.td-center{text-align:center;}
.td-actions{text-align:right;white-space:nowrap;}
.td-empty{text-align:center;color:var(--c-hint);padding:20px;font-size:12px;}

/* ACTION BUTTONS */
.act-btn{border:none;border-radius:5px;padding:3px 7px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;margin-left:3px;}
.btn-green{background:#EAF3DE;color:#3B6D11;}
.btn-red{background:#FFEBEE;color:#A32D2D;}
.btn-orange{background:#FFF3E0;color:#856404;}
.btn-blue{background:#E3F2FD;color:#185FA5;}
.btn-badge{background:#f5f5f5;color:#555;}

/* STATUS PILLS */
.status-pill{font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;white-space:nowrap;}
.pill-active{background:#EAF3DE;color:#3B6D11;}
.pill-pending{background:#FFF3E0;color:#856404;}
.pill-suspended{background:#FFEBEE;color:#A32D2D;}

/* STATS GRID */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 14px 10px;}
.stat-card{background:#fff;border-radius:12px;border:1px solid #eee;padding:14px;}
.sc-num{font-size:26px;font-weight:800;color:var(--c-text);}
.sc-lbl{font-size:10px;color:var(--c-hint);margin-top:2px;text-transform:uppercase;letter-spacing:0.4px;}
.sc-breakdown{margin-top:8px;display:flex;flex-direction:column;gap:3px;}
.sc-line{font-size:11px;color:var(--c-text2);}
.area-bar-wrap{padding:0 14px 10px;}
.area-card{background:#fff;border-radius:12px;border:1px solid #eee;padding:14px;margin-bottom:8px;}
.area-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.area-name{font-size:13px;font-weight:700;color:var(--c-text);}
.area-count{font-size:13px;font-weight:800;color:var(--c-primary);}
.area-bar{background:#f0f0f0;border-radius:6px;height:7px;overflow:hidden;margin-bottom:4px;}
.area-fill{background:var(--c-primary);height:100%;border-radius:6px;transition:width 0.5s;}

/* DATABASE TAB */
.db-controls{padding:10px 14px;display:flex;gap:8px;align-items:center;}
.db-select{flex:1;border:1.5px solid var(--c-border);border-radius:10px;padding:9px 12px;font-size:13px;color:var(--c-text);background:#fff;outline:none;font-family:inherit;}
.btn-load{background:var(--c-primary);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
.db-info{padding:0 14px 8px;font-size:11px;color:var(--c-hint);}
.danger-zone{margin:10px 14px;background:#FFF5F5;border:1.5px solid #F9C0C0;border-radius:12px;padding:14px;}
.danger-title{font-size:11px;font-weight:800;color:#A32D2D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.btn-danger{background:#A32D2D;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;}
`

/* ─── MARKUP ─────────────────────────────────────────────────────────────── */
const markup = `<div class="page"><div class="scroll">

<div class="header">
  <div class="header-r1">
    <svg viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" style="height:36px;width:auto;">
      <style>.s0{fill:#FFF}.s1{fill:#ADD036}</style>
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
    <span class="count-badge" id="sellers-count">—</span>
  </div>
  <div class="filter-bar">
    <button class="f-chip active" onclick="filterSellers(this,'all')">Semua</button>
    <button class="f-chip" onclick="filterSellers(this,'pending')">Pending</button>
    <button class="f-chip" onclick="filterSellers(this,'active')">Aktif</button>
    <button class="f-chip" onclick="filterSellers(this,'suspended')">Suspended</button>
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
  <div class="sec-head"><span class="sec-title">Platform Stats</span></div>
  <div class="stat-grid">
    <div class="stat-card" style="border-left:4px solid var(--c-primary);">
      <div class="sc-num" id="ps-sellers">—</div>
      <div class="sc-lbl">Total Sellers</div>
      <div class="sc-breakdown" id="ps-sellers-detail"></div>
    </div>
    <div class="stat-card" style="border-left:4px solid #185FA5;">
      <div class="sc-num num-blue" id="ps-buyers">—</div>
      <div class="sc-lbl">Total Buyers</div>
    </div>
    <div class="stat-card" style="border-left:4px solid #F0A500;">
      <div class="sc-num" id="ps-testi">—</div>
      <div class="sc-lbl">Total Testimoni</div>
    </div>
    <div class="stat-card" style="border-left:4px solid #3B6D11;">
      <div class="sc-num num-green" id="ps-saved">—</div>
      <div class="sc-lbl">Total Saved</div>
    </div>
  </div>
  <div class="sec-head"><span class="sec-title">Badge Breakdown</span></div>
  <div class="stat-grid">
    <div class="stat-card"><div class="sc-num" id="ps-b-baharu">—</div><div class="sc-lbl">Seller Baharu</div></div>
    <div class="stat-card"><div class="sc-num num-blue" id="ps-b-aktif">—</div><div class="sc-lbl">Seller Aktif</div></div>
    <div class="stat-card" style="grid-column:1/-1;"><div class="sc-num num-green" id="ps-b-verified">—</div><div class="sc-lbl">Verified Seller</div></div>
  </div>
  <div class="sec-head"><span class="sec-title">Sellers by Kawasan</span></div>
  <div class="area-bar-wrap" id="area-bars"><div style="text-align:center;color:var(--c-hint);padding:20px;font-size:12px;">Memuatkan...</div></div>
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
    <p style="font-size:11px;color:#A32D2D;margin-bottom:10px;line-height:1.6;">Padam SEMUA rekod dari jadual yang dipilih. Tindakan ini tidak boleh dibatalkan.</p>
    <button class="btn-danger" onclick="clearDbTable()">Padam Semua Rekod dalam Jadual Ini</button>
  </div>
</div>

</div></div>`

/* ─── CLIENT SCRIPTS ─────────────────────────────────────────────────────── */
const scripts = [`
// State
var _data = null;
var _dbTable = '';
var _sellersFilter = 'all';
var _testiFilter = 'all';

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

function filterTesti(el, f) {
  _testiFilter = f;
  document.querySelectorAll('#tab-testimoni .f-chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  renderTesti();
}

function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setHtml(id, v) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = v;
}

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

/*
function renderSellers() {
  if (!_data) return;
  var sellers = _data.sellers || [];
  var filtered = _sellersFilter === 'all' ? sellers : sellers.filter(function(s){
    var st = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    return st === _sellersFilter;
  });
  setText('sellers-count', filtered.length + ' rekod');
  // Build rows
  if (!filtered.length) { setHtml('sellers-tbody', '<tr><td colspan="7" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>'); return; }
  var html = filtered.map(function(s) {
    var status = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    var badge = s.badge || 'seller_baharu';
    var badgeLabel = badge === 'verified' ? '<span style="color:#3B6D11;font-weight:700;">Verified</span>' :
      badge === 'seller_aktif' ? '<span style="color:#185FA5;font-weight:700;">Aktif</span>' :
      '<span style="color:#888;font-weight:700;">Baharu</span>';
    var statusStyle = status === 'active' ? 'color:#3B6D11' : status === 'pending' ? 'color:#856404' : 'color:#A32D2D';
    var approveBtn = status === 'pending' ?
      '<button class="act-btn btn-green" onclick="adminAction(\'seller\',\''+s.id+'\',\'approve\')">✓</button>' : '';
    var suspendBtn = status === 'active' ?
      '<button class="act-btn btn-orange" onclick="adminAction(\'seller\',\''+s.id+'\',\'suspend\')">⊘</button>' :
      status === 'suspended' ?
      '<button class="act-btn btn-blue" onclick="adminAction(\'seller\',\''+s.id+'\',\'unsuspend\')">↑</button>' : '';
    var delBtn = '<button class="act-btn btn-red" onclick="if(confirm(\'Padam seller ini?\'))adminAction(\'seller\',\''+s.id+'\',\'delete\')">✕</button>';
    var nextBadge = badge === 'seller_baharu' ? 'badge_aktif' : badge === 'seller_aktif' ? 'badge_verified' : 'badge_baharu';
    var nextLbl = nextBadge === 'badge_aktif' ? 'B→A' : nextBadge === 'badge_verified' ? 'A→V' : 'V→B';
    var badgeBtn = '<button class="act-btn btn-badge" title="Naik badge" onclick="adminAction(\'seller\',\''+s.id+'\',\''+nextBadge+'\')">'+nextLbl+'</button>';
    var shopName = (s.shop_name || s.name || '—').toString().slice(0,22);
    var kawasan = (s.kawasan || '—').toString().slice(0,14);
    var created = s.created_at ? new Date(s.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '—';
    return '<tr data-id="'+s.id+'" data-status="'+status+'">' +
      '<td class="td-name" title="'+(s.shop_name||s.name||'')+'">'+shopName+'</td>' +
      '<td class="td-cell">'+kawasan+'</td>' +
      '<td class="td-center">'+badgeLabel+'</td>' +
      '<td class="td-center">'+(s.is_open ? '<span style="color:#3B6D11">●</span>' : '<span style="color:#bbb">○</span>')+'</td>' +
      '<td class="td-center"><span class="status-pill '+(status==='active'?'pill-active':status==='pending'?'pill-pending':'pill-suspended')+'">'+status+'</span></td>' +
      '<td class="td-cell">'+created+'</td>' +
      '<td class="td-actions">'+approveBtn+suspendBtn+delBtn+badgeBtn+'</td>' +
      '</tr>';
  }).join('');
  setHtml('sellers-tbody', html);
}

function renderBuyers() {
  if (!_data) return;
  var buyers = _data.buyers || [];
  setText('buyers-count', buyers.length + ' total');
  if (!buyers.length) { setHtml('buyers-tbody', '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>'); return; }
  var html = buyers.map(function(b) {
    var name = (b.name || '—').toString().slice(0,20);
    var email = (b.email || '—').toString().slice(0,22);
    var kawasan = (b.kawasan || '—').toString().slice(0,14);
    var created = b.created_at ? new Date(b.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '—';
    return '<tr><td class="td-name">'+name+'</td><td class="td-cell" title="'+(b.email||'')+'">'+email+'</td>' +
      '<td class="td-cell">'+kawasan+'</td><td class="td-cell">'+created+'</td>' +
      '<td class="td-actions"><button class="act-btn btn-red" onclick="if(confirm(\'Padam buyer ini?\'))adminAction(\'buyer\',\''+b.id+'\',\'delete\')">✕</button></td></tr>';
  }).join('');
  setHtml('buyers-tbody', html);
}

function renderTesti() {
  if (!_data) return;
  var all = _data.testimonials || [];
  var filtered = _testiFilter === 'all' ? all :
    _testiFilter === 'pending' ? all.filter(function(t){ return !t.is_approved; }) :
    all.filter(function(t){ return t.is_approved; });
  setText('testi-count', filtered.length + ' rekod');
  if (!filtered.length) { setHtml('testi-tbody', '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>'); return; }
  var sellers = _data.sellers || [];
  var sellerMap = {};
  sellers.forEach(function(s){ sellerMap[s.id] = s.shop_name || s.name || '—'; });
  var html = filtered.map(function(t) {
    var shop = (sellerMap[t.seller_id] || '—').toString().slice(0,16);
    var buyer = (t.buyer_name || '—').toString().slice(0,16);
    var content = (t.content || '—').toString().slice(0,30);
    var rating = '★'.repeat(t.rating || 0);
    var approved = t.is_approved ? '<span style="color:#3B6D11;font-weight:700;font-size:10px;">Approved</span>' : '<span style="color:#856404;font-weight:700;font-size:10px;">Pending</span>';
    var approveBtn = !t.is_approved ? '<button class="act-btn btn-green" onclick="adminAction(\'testimonial\',\''+t.id+'\',\'approve\')">✓</button>' : '';
    var delBtn = '<button class="act-btn btn-red" onclick="if(confirm(\'Padam testimoni ini?\'))adminAction(\'testimonial\',\''+t.id+'\',\'delete\')">✕</button>';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td>' +
      '<td class="td-name" title="'+(t.content||'')+'">'+content+'…</td>' +
      '<td class="td-center" style="color:#F0A500;">'+rating+'</td>' +
      '<td class="td-center">'+approved+'</td>' +
      '<td class="td-actions">'+approveBtn+delBtn+'</td></tr>';
  }).join('');
  setHtml('testi-tbody', html);
}

*/

function renderSellers() {
  if (!_data) return;
  var sellers = _data.sellers || [];
  var filtered = _sellersFilter === 'all' ? sellers : sellers.filter(function(s){
    var st = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    return st === _sellersFilter;
  });
  setText('sellers-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('sellers-tbody', '<tr><td colspan="7" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>');
    return;
  }
  var html = filtered.map(function(s) {
    var status = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    var badge = s.badge || 'seller_baharu';
    var badgeLabel = badge === 'verified' || badge === 'verified_seller'
      ? '<span style="color:#3B6D11;font-weight:700;">Verified</span>'
      : badge === 'seller_aktif'
        ? '<span style="color:#185FA5;font-weight:700;">Aktif</span>'
        : '<span style="color:#888;font-weight:700;">Baharu</span>';
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
      '<td class="td-center">'+(s.is_open ? '<span style="color:#3B6D11">open</span>' : '<span style="color:#bbb">closed</span>')+'</td>' +
      '<td class="td-center"><span class="status-pill '+(status==='active'?'pill-active':status==='pending'?'pill-pending':'pill-suspended')+'">'+status+'</span></td>' +
      '<td class="td-cell">'+created+'</td>' +
      '<td class="td-actions">'+approveBtn+suspendBtn+delBtn+badgeBtn+'</td>' +
      '</tr>';
  }).join('');
  setHtml('sellers-tbody', html);
}

function renderBuyers() {
  if (!_data) return;
  var buyers = _data.buyers || [];
  setText('buyers-count', buyers.length + ' total');
  if (!buyers.length) {
    setHtml('buyers-tbody', '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>');
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

function renderTesti() {
  if (!_data) return;
  var all = _data.testimonials || [];
  var filtered = _testiFilter === 'all' ? all :
    _testiFilter === 'pending' ? all.filter(function(t){ return !t.is_approved; }) :
    all.filter(function(t){ return t.is_approved; });
  setText('testi-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('testi-tbody', '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>');
    return;
  }
  var sellers = _data.sellers || [];
  var sellerMap = {};
  sellers.forEach(function(s){ sellerMap[s.id] = s.shop_name || s.name || '-'; });
  var html = filtered.map(function(t) {
    var shop = (sellerMap[t.seller_id] || '-').toString().slice(0,16);
    var buyer = (t.buyer_name || '-').toString().slice(0,16);
    var content = (t.content || '-').toString().slice(0,30);
    var rating = 'star '.repeat(t.rating || 0);
    var approved = t.is_approved ? '<span style="color:#3B6D11;font-weight:700;font-size:10px;">Approved</span>' : '<span style="color:#856404;font-weight:700;font-size:10px;">Pending</span>';
    var approveBtn = !t.is_approved ? '<button class="act-btn btn-green" onclick="'+adminActionCall('testimonial', t.id, 'approve')+'">OK</button>' : '';
    var delBtn = '<button class="act-btn btn-red" onclick="'+adminDeleteCall('testimonial', t.id, 'testimoni')+'">Del</button>';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td>' +
      '<td class="td-name" title="'+(t.content||'')+'">'+content+'</td>' +
      '<td class="td-center" style="color:#F0A500;">'+rating+'</td>' +
      '<td class="td-center">'+approved+'</td>' +
      '<td class="td-actions">'+approveBtn+delBtn+'</td></tr>';
  }).join('');
  setHtml('testi-tbody', html);
}

function renderSaved() {
  if (!_data) return;
  var saved = _data.savedShops || [];
  setText('saved-count', saved.length + ' rekod');
  if (!saved.length) { setHtml('saved-tbody', '<tr><td colspan="3" style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada rekod</td></tr>'); return; }
  var html = saved.map(function(row) {
    var buyer = (row.buyer_display || row.buyer_id || '—').toString().slice(0,22);
    var shop = (row.shop_display || row.shop_id || '—').toString().slice(0,22);
    var created = row.created_at ? new Date(row.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '—';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td><td class="td-cell">'+created+'</td></tr>';
  }).join('');
  setHtml('saved-tbody', html);
}

function renderStats() {
  if (!_data || !_data.stats) return;
  var s = _data.stats;
  setText('ps-sellers', s.totalSellers || 0);
  setText('ps-buyers', s.totalBuyers || 0);
  setText('ps-testi', s.totalTestimonials || 0);
  setText('ps-saved', s.totalSavedShops || 0);
  setText('ps-b-baharu', s.sellersByBadge.seller_baharu || 0);
  setText('ps-b-aktif', s.sellersByBadge.seller_aktif || 0);
  setText('ps-b-verified', s.sellersByBadge.verified || 0);
  var sb = s.sellersByStatus;
  setHtml('ps-sellers-detail',
    '<div class="sc-line" style="color:#3B6D11;">● '+sb.active+' Aktif</div>' +
    '<div class="sc-line" style="color:#856404;">● '+sb.pending+' Pending</div>' +
    '<div class="sc-line" style="color:#A32D2D;">● '+sb.suspended+' Suspended</div>'
  );
  var areas = s.sellersByArea || [];
  var max = areas.length ? areas[0].count : 1;
  var areaHtml = areas.slice(0,8).map(function(a) {
    var pct = Math.round((a.count / max) * 100);
    return '<div class="area-card">' +
      '<div class="area-row"><span class="area-name">'+a.area+'</span><span class="area-count">'+a.count+' seller</span></div>' +
      '<div class="area-bar"><div class="area-fill" style="width:'+pct+'%"></div></div>' +
      '</div>';
  }).join('') || '<div style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Tiada data kawasan</div>';
  setHtml('area-bars', areaHtml);
}

function loadAdminData() {
  fetch('/api/admin/moderation', { cache: 'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(data) {
      if (data.error) { alert('Gagal muat data: ' + data.error); return; }
      _data = data;
      // Update quick stats
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
      if (!rows.length) { setHtml('db-content', '<div style="text-align:center;color:#bbb;padding:20px;font-size:12px;">Jadual kosong</div>'); return; }
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

// Initial load
loadAdminData();
`]

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function Page() {
  useEffect(() => {
    // Data loading and action handlers are wired in the inline scripts above.
    // We expose them via the scripts[] array so HtmlPrototypePage injects them.
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
