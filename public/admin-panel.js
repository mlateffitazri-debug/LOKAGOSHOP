// LokalGo Admin Panel — client-side logic (public/admin-panel.js)

var _data = null;
var _dbTable = '';
var _sellersFilter = 'all';
var _sellersSearch = '';
var _buyersFilter = 'all';
var _testiFilter = 'all';

/* ── Tab switching ─────────────────────────────────────────────────────────── */

function switchTab(id, navEl) {
  document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  var sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  if (navEl) navEl.classList.add('active');
  // Lazy-load per-tab data
  if (id === 'tab-broadcast') loadBroadcast();
  if (id === 'tab-messages') loadMessages();
}

/* ── Filter / search helpers ───────────────────────────────────────────────── */

function filterSellers(el, f) {
  _sellersFilter = f;
  document.querySelectorAll('#tab-sellers .f-chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  renderSellers();
}

function searchSellers(val) {
  _sellersSearch = (val || '').trim().toLowerCase();
  renderSellers();
}

function filterBuyers(el, f) {
  _buyersFilter = f;
  document.querySelectorAll('#tab-buyers .f-chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  renderBuyers();
}

function filterTesti(el, f) {
  _testiFilter = f;
  document.querySelectorAll('#tab-testimoni .f-chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  renderTesti();
}

/* ── DOM helpers ───────────────────────────────────────────────────────────── */

function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setHtml(id, v) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = v;
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '';
  var diff = Date.now() - new Date(iso).getTime();
  var m = Math.floor(diff / 60000);
  if (m < 1) return 'baru';
  if (m < 60) return m + ' min lalu';
  var h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h / 24) + ' hari lalu';
}

/* ── Admin actions ─────────────────────────────────────────────────────────── */

function adminAction(type, id, action) {
  fetch('/api/admin/moderation', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type, id: id, action: action })
  }).then(function(r) { return r.json(); }).then(function(payload) {
    if (payload.error) { alert('Ralat: ' + payload.error); return; }
    loadAdminData();
  }).catch(function(e) { alert('Ralat rangkaian: ' + e.message); });
}

function adminDelete(type, id, label) {
  if (confirm('Padam ' + label + ' ini? Tindakan tidak boleh dibatalkan.')) {
    adminAction(type, id, 'delete');
  }
}

/* ── Render: Dashboard ─────────────────────────────────────────────────────── */

function renderDashboard() {
  if (!_data) return;
  var s = _data.stats;
  var sellers = _data.sellers || [];
  var pending = (_data.pendingSellers || []).length;
  var pendingTesti = (_data.pendingTestimonials || []).length;
  var totalQr = _data.qrDownloadCount || 0;

  // Alert banners
  var alertHtml = '';
  if (pending > 0) {
    alertHtml += '<div class="alert alert-o" onclick="switchTab(\'tab-sellers\',document.getElementById(\'nav-sellers\'))">'
      + '&#9888;&nbsp; ' + pending + ' seller menunggu kelulusan — klik untuk semak</div>';
  }
  if (pendingTesti > 0) {
    alertHtml += '<div class="alert alert-o" onclick="switchTab(\'tab-testimoni\',document.querySelector(\'[onclick*=tab-testimoni]\'))">'
      + '&#9733;&nbsp; ' + pendingTesti + ' testimoni menunggu kelulusan</div>';
  }
  setHtml('dash-alert', alertHtml);

  // Feature card counts
  if (s) {
    setText('fc-sellers', s.totalSellers || 0);
    setText('fc-sellers-sub', (s.totalSellers === 1 ? 'seller' : 'seller') + ' berdaftar');
    setText('fc-buyers', s.totalBuyers || 0);
    setText('fc-testi', s.totalTestimonials || 0);
    setText('fc-verified', s.sellersByBadge.verified || 0);
    setText('fc-qr', totalQr);
    setText('fc-saved', s.totalSavedShops || 0);
    setText('fc-active', s.sellersByStatus.active || 0);
  }

  // Pending badges on cards
  var pbEl = document.getElementById('fc-pending-badge');
  if (pbEl) {
    if (pending > 0) { pbEl.textContent = pending + ' pending'; pbEl.style.display = 'block'; }
    else pbEl.style.display = 'none';
  }
  var tbEl = document.getElementById('fc-testi-badge');
  if (tbEl) {
    if (pendingTesti > 0) { tbEl.textContent = pendingTesti + ' pending'; tbEl.style.display = 'block'; }
    else tbEl.style.display = 'none';
  }

  // Recent sellers
  var recentSellers = sellers.slice(0, 5);
  setHtml('dash-recent-sellers', recentSellers.length ? recentSellers.map(function(s) {
    var name = esc((s.shop_name || s.name || '—').toString().slice(0, 24));
    var initial = (s.shop_name || s.name || '?').charAt(0).toUpperCase();
    var status = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    var pillCls = status === 'active' ? 'p-active' : status === 'pending' ? 'p-pending' : 'p-suspended';
    return '<div class="ri"><div class="ri-av">' + esc(initial) + '</div>'
      + '<div><div class="ri-name">' + name + '</div><div class="ri-sub">' + esc(s.kawasan || '—') + '</div></div>'
      + '<span class="pill ' + pillCls + '" style="margin-left:auto;font-size:10px;">' + esc(status) + '</span></div>';
  }).join('') : '<div style="text-align:center;color:rgba(240,240,240,0.2);padding:20px;font-size:13px;">Tiada data</div>');

  // Recent buyers
  var recentBuyers = (_data.buyers || []).slice(0, 5);
  setHtml('dash-recent-buyers', recentBuyers.length ? recentBuyers.map(function(b) {
    var name = esc((b.name || b.email || '—').toString().slice(0, 24));
    var initial = (b.name || b.email || '?').charAt(0).toUpperCase();
    return '<div class="ri"><div class="ri-av b">' + esc(initial) + '</div>'
      + '<div><div class="ri-name">' + name + '</div><div class="ri-sub">' + timeAgo(b.created_at) + '</div></div>'
      + '<span class="ri-time">' + fmtDate(b.created_at) + '</span></div>';
  }).join('') : '<div style="text-align:center;color:rgba(240,240,240,0.2);padding:20px;font-size:13px;">Tiada data</div>');
}

/* ── Render: Sellers ────────────────────────────────────────────────────────── */

function renderSellers() {
  if (!_data) return;
  var sellers = _data.sellers || [];

  // Apply status filter
  var filtered = _sellersFilter === 'all' ? sellers : sellers.filter(function(s) {
    var st = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    return st === _sellersFilter;
  });

  // Apply search
  if (_sellersSearch) {
    filtered = filtered.filter(function(s) {
      var name = (s.shop_name || s.name || '').toLowerCase();
      var kawasan = (s.kawasan || '').toLowerCase();
      return name.indexOf(_sellersSearch) !== -1 || kawasan.indexOf(_sellersSearch) !== -1;
    });
  }

  setText('sellers-count', filtered.length + ' rekod');

  if (!filtered.length) {
    setHtml('sellers-tbody', '<tr><td colspan="8" class="td-empty">Tiada seller dijumpai</td></tr>');
    return;
  }

  var html = filtered.map(function(s) {
    var status = s.status || (s.permanent_ban ? 'suspended' : 'pending');
    var badge = s.badge || 'seller_baharu';
    var isVerified = badge === 'verified' || badge === 'verified_seller';
    var isAktif = badge === 'seller_aktif';

    var badgePill = isVerified
      ? '<span class="pill p-verified">&#10003; Verified</span>'
      : isAktif
        ? '<span class="pill p-aktif">Aktif</span>'
        : '<span class="pill p-baharu">Baharu</span>';

    var statusPill = status === 'active'
      ? '<span class="pill p-active">Aktif</span>'
      : status === 'pending'
        ? '<span class="pill p-pending">Pending</span>'
        : status === 'suspended'
          ? '<span class="pill p-suspended">Suspended</span>'
          : '<span class="pill p-deleted">' + esc(status) + '</span>';

    var qrCount = s.wa_click_count != null ? s.wa_click_count : '—';

    var isOpen = s.is_open
      ? '<span style="color:#acd036;font-size:12px;font-weight:700;">Buka</span>'
      : '<span style="color:rgba(240,240,240,0.28);font-size:12px;">Tutup</span>';

    // Action buttons
    var approveBtn = status === 'pending'
      ? '<button class="act-btn ab-g" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'approve\')">Lulus</button>' : '';
    var rejectBtn = status === 'pending'
      ? '<button class="act-btn ab-r" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'reject\')">Tolak</button>' : '';
    var suspendBtn = status === 'active'
      ? '<button class="act-btn ab-o" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'suspend\')">Ban</button>'
      : status === 'suspended'
        ? '<button class="act-btn ab-b" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'unsuspend\')">Aktif</button>'
        : '';
    var verifyBtn = !isVerified
      ? '<button class="act-btn ab-g" title="Berikan Verified" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'badge_verified\')">&#10003; Verify</button>'
      : '<button class="act-btn ab-o" title="Buang Verified" onclick="adminAction(\'seller\',\'' + esc(s.id) + '\',\'badge_aktif\')">Unverify</button>';
    var editBtn = '<button class="act-btn ab-e" onclick="openEditSeller(\'' + esc(s.id) + '\')">&#9998; Edit</button>';
    var delBtn = '<button class="act-btn ab-r" onclick="adminDelete(\'seller\',\'' + esc(s.id) + '\',\'' + esc(s.shop_name || s.name || 'seller') + '\')">Padam</button>';

    var shopName = esc((s.shop_name || s.name || '—').toString());
    var kawasan = esc((s.kawasan || '—').toString());

    return '<tr data-id="' + esc(s.id) + '">'
      + '<td><div class="td-shop" title="' + shopName + '">' + shopName.slice(0, 26) + '</div>'
      + '<div class="td-sub">' + esc(s.email || '') + '</div></td>'
      + '<td class="td-cell">' + kawasan + '</td>'
      + '<td class="td-c">' + badgePill + '</td>'
      + '<td class="td-c">' + statusPill + '</td>'
      + '<td class="td-c" style="font-size:13px;font-weight:700;color:' + (qrCount > 0 ? '#acd036' : 'rgba(240,240,240,0.3)') + ';">' + qrCount + '</td>'
      + '<td class="td-c">' + isOpen + '</td>'
      + '<td class="td-cell">' + fmtDate(s.created_at) + '</td>'
      + '<td class="td-r">' + approveBtn + rejectBtn + suspendBtn + verifyBtn + editBtn + delBtn + '</td>'
      + '</tr>';
  }).join('');

  setHtml('sellers-tbody', html);
}

/* ── Render: Buyers ──────────────────────────────────────────────────────────── */

function renderBuyers() {
  if (!_data) return;
  var buyers = _data.buyers || [];
  setText('buyers-count', buyers.length + ' rekod');
  if (!buyers.length) {
    setHtml('buyers-tbody', '<tr><td colspan="5" class="td-empty">Tiada data</td></tr>');
    return;
  }
  var html = buyers.map(function(b) {
    var name = esc((b.name || '—').toString());
    var email = esc((b.email || '—').toString());
    var kawasan = esc((b.kawasan || '—').toString());
    return '<tr>'
      + '<td><div class="td-shop">' + name.slice(0, 22) + '</div></td>'
      + '<td class="td-cell" title="' + email + '">' + email.slice(0, 28) + '</td>'
      + '<td class="td-cell">' + kawasan + '</td>'
      + '<td class="td-cell">' + fmtDate(b.created_at) + '</td>'
      + '<td class="td-r"><button class="act-btn ab-r" onclick="adminDelete(\'buyer\',\'' + esc(b.id) + '\',\'' + name.slice(0, 20) + '\')">Padam</button></td>'
      + '</tr>';
  }).join('');
  setHtml('buyers-tbody', html);
}

/* ── Render: Testimoni ───────────────────────────────────────────────────────── */

function renderTesti() {
  if (!_data) return;
  var sellerMap = {};
  (_data.sellers || []).forEach(function(s) { sellerMap[s.id] = s.shop_name || s.name || '—'; });
  var all = _data.testimonials || [];
  var filtered = _testiFilter === 'pending' ? all.filter(function(t) { return !t.is_approved; })
    : _testiFilter === 'approved' ? all.filter(function(t) { return t.is_approved; })
    : all;
  setText('testi-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('testi-tbody', '<tr><td colspan="7" class="td-empty">Tiada data</td></tr>');
    return;
  }
  var html = filtered.map(function(t) {
    var shop = esc((sellerMap[t.seller_id] || '—').toString().slice(0, 18));
    var buyer = esc((t.buyer_name || '—').toString().slice(0, 18));
    var content = esc((t.content || '—').toString().slice(0, 35));
    var stars = '';
    for (var i = 0; i < (t.rating || 0); i++) stars += '&#9733;';
    var statusBadge = t.is_approved
      ? '<span class="pill p-active" style="font-size:10px;">Lulus</span>'
      : '<span class="pill p-pending" style="font-size:10px;">Pending</span>';
    var approveBtn = !t.is_approved
      ? '<button class="act-btn ab-g" onclick="adminAction(\'testimonial\',\'' + esc(t.id) + '\',\'approve\')">Lulus</button>' : '';
    var delBtn = '<button class="act-btn ab-r" onclick="adminDelete(\'testimonial\',\'' + esc(t.id) + '\',\'testimoni\')">Padam</button>';
    return '<tr>'
      + '<td class="td-cell">' + buyer + '</td>'
      + '<td class="td-cell">' + shop + '</td>'
      + '<td style="max-width:200px;color:rgba(240,240,240,0.55);font-size:13px;" title="' + esc(t.content || '') + '">' + content + (t.content && t.content.length > 35 ? '…' : '') + '</td>'
      + '<td class="td-c" style="color:#f0c040;font-size:13px;">' + (stars || '—') + '</td>'
      + '<td class="td-c">' + statusBadge + '</td>'
      + '<td class="td-cell">' + fmtDate(t.created_at) + '</td>'
      + '<td class="td-r">' + approveBtn + delBtn + '</td>'
      + '</tr>';
  }).join('');
  setHtml('testi-tbody', html);
}

/* ── Render: Saved Shops ─────────────────────────────────────────────────────── */

function renderSaved() {
  if (!_data) return;
  var saved = _data.savedShops || [];
  setText('saved-count', saved.length + ' rekod');
  if (!saved.length) {
    setHtml('saved-tbody', '<tr><td colspan="3" class="td-empty">Tiada data</td></tr>');
    return;
  }
  var html = saved.map(function(row) {
    var buyer = esc((row.buyer_display || row.buyer_id || '—').toString().slice(0, 26));
    var shop = esc((row.shop_display || row.shop_id || '—').toString().slice(0, 26));
    return '<tr>'
      + '<td class="td-cell">' + buyer + '</td>'
      + '<td class="td-cell">' + shop + '</td>'
      + '<td class="td-cell">' + fmtDate(row.created_at) + '</td>'
      + '</tr>';
  }).join('');
  setHtml('saved-tbody', html);
}

/* ── Render: Platform Stats ──────────────────────────────────────────────────── */

function renderStats() {
  if (!_data || !_data.stats) return;
  var s = _data.stats;
  setText('ps-reg-users', s.totalSellers + s.totalBuyers);
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
    '<div class="ps-line" style="color:#acd036;">&#9679; ' + sb.active + ' Aktif</div>'
    + '<div class="ps-line" style="color:#f0c040;">&#9679; ' + sb.pending + ' Pending</div>'
    + '<div class="ps-line" style="color:#f06060;">&#9679; ' + sb.suspended + ' Suspended</div>'
  );

  var areas = s.sellersByArea || [];
  var max = areas.length ? areas[0].count : 1;
  var areaHtml = areas.slice(0, 10).map(function(a) {
    var pct = Math.round((a.count / max) * 100);
    return '<div class="area-item">'
      + '<div class="area-name" title="' + esc(a.area) + '">' + esc(a.area) + '</div>'
      + '<div class="area-outer"><div class="area-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="area-count">' + esc(a.count) + ' seller</div>'
      + '</div>';
  }).join('');
  setHtml('area-bars', areaHtml || '<div style="text-align:center;color:rgba(240,240,240,0.2);padding:20px;font-size:13px;">Tiada data</div>');

  renderRegistrationChart(_data.sellers || [], _data.buyers || []);
}

function renderRegistrationChart(sellers, buyers) {
  var now = new Date();
  var months = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push({ label: d.toLocaleDateString('ms-MY', { month: 'short' }), key: key, s: 0, b: 0 });
  }
  var idx = {};
  months.forEach(function(m, j) { idx[m.key] = j; });
  sellers.forEach(function(s) {
    if (!s.created_at) return;
    var k = s.created_at.slice(0, 7);
    if (idx[k] !== undefined) months[idx[k]].s++;
  });
  buyers.forEach(function(b) {
    if (!b.created_at) return;
    var k = b.created_at.slice(0, 7);
    if (idx[k] !== undefined) months[idx[k]].b++;
  });
  var maxVal = Math.max(1, Math.max.apply(null, months.map(function(m) { return Math.max(m.s, m.b); })));
  var html = months.map(function(m) {
    var sp = Math.max(2, Math.round((m.s / maxVal) * 90));
    var bp = Math.max(2, Math.round((m.b / maxVal) * 90));
    return '<div class="chart-col">'
      + '<div class="chart-bg">'
      + '<div class="chart-bw"><div class="chart-b sl" style="height:' + sp + 'px;" title="' + m.s + ' seller"></div></div>'
      + '<div class="chart-bw"><div class="chart-b by" style="height:' + bp + 'px;" title="' + m.b + ' buyer"></div></div>'
      + '</div>'
      + '<div class="chart-lbl">' + m.label + '</div>'
      + '</div>';
  }).join('');
  setHtml('reg-chart', html || '<div style="color:rgba(240,240,240,0.2);font-size:12px;padding:20px 0;text-align:center;">Tiada data</div>');
}

/* ── Edit Seller Modal ────────────────────────────────────────────────────────── */

function openEditSeller(id) {
  if (!_data) return;
  var seller = (_data.sellers || []).find(function(s) { return s.id === id; });
  if (!seller) { alert('Seller tidak dijumpai.'); return; }

  var get = function(fid) { return document.getElementById(fid); };
  get('edit-seller-id').value = seller.id || '';
  get('edit-shop-name').value = seller.shop_name || seller.name || '';
  get('edit-whatsapp').value = seller.whatsapp_number || '';
  get('edit-kawasan').value = seller.kawasan || '';
  get('edit-postcode').value = seller.postcode || '';
  get('edit-is-open').checked = !!seller.is_open;

  document.getElementById('edit-modal').classList.add('open');
}

function closeEditSeller() {
  document.getElementById('edit-modal').classList.remove('open');
}

function submitEditSeller() {
  var id = (document.getElementById('edit-seller-id') || {}).value;
  if (!id) return;

  var shopName = ((document.getElementById('edit-shop-name') || {}).value || '').trim();
  if (!shopName) { alert('Nama kedai diperlukan.'); return; }

  var payload = {
    id: id,
    shop_name: shopName,
    whatsapp_number: ((document.getElementById('edit-whatsapp') || {}).value || '').trim() || null,
    kawasan: ((document.getElementById('edit-kawasan') || {}).value || '').trim() || null,
    postcode: ((document.getElementById('edit-postcode') || {}).value || '').trim() || null,
    is_open: !!(document.getElementById('edit-is-open') || {}).checked,
  };

  var btn = document.querySelector('#edit-modal .btn-submit');
  if (btn) { btn.textContent = 'Menyimpan...'; btn.disabled = true; }

  fetch('/api/admin/edit-seller', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (btn) { btn.textContent = 'Simpan Perubahan'; btn.disabled = false; }
    if (d.error) { alert('Ralat: ' + d.error); return; }
    closeEditSeller();
    loadAdminData();
  }).catch(function(e) {
    if (btn) { btn.textContent = 'Simpan Perubahan'; btn.disabled = false; }
    alert('Ralat rangkaian: ' + e.message);
  });
}

/* ── Manual Onboard Modal ─────────────────────────────────────────────────────── */

function openManualForm() {
  document.getElementById('manual-modal').classList.add('open');
}

function closeManualForm() {
  document.getElementById('manual-modal').classList.remove('open');
  ['mo-email', 'mo-shop', 'mo-taman', 'mo-phone', 'mo-kawasan', 'mo-postcode'].forEach(function(fid) {
    var el = document.getElementById(fid);
    if (el) el.value = '';
  });
}

function submitManualOnboard() {
  var email    = ((document.getElementById('mo-email')    || {}).value || '').trim();
  var shopName = ((document.getElementById('mo-shop')     || {}).value || '').trim();
  var taman    = ((document.getElementById('mo-taman')    || {}).value || '').trim();
  var phone    = ((document.getElementById('mo-phone')    || {}).value || '').trim();
  var kawasan  = ((document.getElementById('mo-kawasan')  || {}).value || '').trim();
  var postcode = ((document.getElementById('mo-postcode') || {}).value || '').trim();

  if (!email || !shopName || !taman || !phone) {
    alert('Sila lengkapkan: Email Google, Nama Kedai, Taman dan No. WhatsApp.');
    return;
  }

  var btn = document.querySelector('#manual-modal .btn-submit');
  if (btn) { btn.textContent = 'Mendaftar...'; btn.disabled = true; }

  fetch('/api/admin/manual-onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      shop_name: shopName,
      taman_name: taman,
      whatsapp_number: phone,
      kawasan: kawasan || taman,
      postcode: postcode || '00000'
    })
  }).then(function(r) { return r.json(); })
  .then(function(d) {
    if (btn) { btn.textContent = 'Daftar Seller (Pending)'; btn.disabled = false; }
    if (d.error) { alert('Ralat: ' + d.error); return; }
    var msg = 'Seller berjaya didaftarkan! (Status: Pending)\n\nID: ' + d.sellerId;
    if (d.linked) {
      msg += '\n\nAkaun Google berjaya dikaitkan. Seller boleh log masuk dan tunggu kelulusan.';
    } else {
      msg += '\n\nEmail tidak dijumpai dalam sistem. Seller perlu log masuk dengan Google sekali untuk mengaktifkan pautan akaun.';
    }
    alert(msg);
    closeManualForm();
    loadAdminData();
  }).catch(function(e) {
    if (btn) { btn.textContent = 'Daftar Seller (Pending)'; btn.disabled = false; }
    alert('Ralat rangkaian: ' + e.message);
  });
}

/* ── Database Tab ─────────────────────────────────────────────────────────────── */

function loadDbTable(table) {
  if (!table) return;
  _dbTable = table;
  setHtml('db-info', 'Memuatkan ' + table + '...');
  setHtml('db-content', '');
  fetch('/api/admin/database?table=' + encodeURIComponent(table) + '&limit=100')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { setHtml('db-info', '<span style="color:#f06060;">Ralat: ' + esc(data.error) + '</span>'); return; }
      var rows = data.rows || [];
      setHtml('db-info', table + ' — ' + data.count + ' jumlah rekod (paparan: ' + rows.length + ')');
      if (!rows.length) {
        setHtml('db-content', '<div style="text-align:center;color:rgba(240,240,240,0.2);padding:44px 16px;font-size:14px;">Jadual kosong</div>');
        return;
      }
      var cols = Object.keys(rows[0]);
      var html = '<div class="tbl-wrap"><table class="tbl" style="min-width:none;"><thead><tr>';
      cols.forEach(function(c) { html += '<th>' + esc(c) + '</th>'; });
      html += '<th>Del</th></tr></thead><tbody>';
      rows.forEach(function(row) {
        html += '<tr>';
        cols.forEach(function(col) {
          var val = row[col];
          var display;
          if (val === null || val === undefined) display = '<span style="color:rgba(240,240,240,0.2);">null</span>';
          else if (typeof val === 'boolean') display = val
            ? '<span style="color:#acd036;">true</span>'
            : '<span style="color:rgba(240,240,240,0.3);">false</span>';
          else if (typeof val === 'object') display = '<span style="color:rgba(240,240,240,0.4);font-size:11px;">' + esc(JSON.stringify(val).slice(0, 32)) + '…</span>';
          else display = esc(String(val).slice(0, 45));
          html += '<td class="td-cell" title="' + esc(String(row[col] || '')) + '">' + display + '</td>';
        });
        html += '<td><button class="act-btn ab-r" data-id="' + esc(row.id) + '" onclick="deleteDbRow(this.dataset.id)">Del</button></td></tr>';
      });
      html += '</tbody></table></div>';
      setHtml('db-content', html);
    })
    .catch(function(e) { setHtml('db-info', '<span style="color:#f06060;">Ralat: ' + esc(e.message) + '</span>'); });
}

function deleteDbRow(id) {
  if (!_dbTable) { alert('Pilih jadual dahulu.'); return; }
  if (!confirm('Padam rekod ini dari ' + _dbTable + '?')) return;
  fetch('/api/admin/database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete_row', table: _dbTable, id: id })
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.error) { alert('Ralat: ' + d.error); return; }
    loadDbTable(_dbTable);
  }).catch(function(e) { alert('Ralat: ' + e.message); });
}

function clearDbTable() {
  if (!_dbTable) { alert('Pilih jadual dahulu.'); return; }
  if (!confirm('AMARAN: Ini akan MEMADAM SEMUA rekod dari jadual "' + _dbTable + '". Tindakan tidak boleh dibatalkan. Teruskan?')) return;
  if (!confirm('Sahkan sekali lagi: Padam SEMUA dari "' + _dbTable + '"?')) return;
  fetch('/api/admin/database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clear_table', table: _dbTable, confirm: 'CLEAR_' + _dbTable.toUpperCase() })
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.error) { alert('Ralat: ' + d.error); return; }
    alert('Semua rekod dari "' + _dbTable + '" telah dipadam.');
    loadDbTable(_dbTable);
    loadAdminData();
  }).catch(function(e) { alert('Ralat: ' + e.message); });
}

/* ── Export CSV ───────────────────────────────────────────────────────────────── */

function exportSellersCSV() {
  if (!_data || !_data.sellers || !_data.sellers.length) {
    alert('Tiada data seller untuk diexport.');
    return;
  }
  var sellers = _data.sellers;
  var cols = ['id', 'shop_name', 'email', 'kawasan', 'postcode', 'status', 'badge', 'is_open', 'wa_click_count', 'created_at'];
  var rows = [cols.join(',')];
  sellers.forEach(function(s) {
    rows.push(cols.map(function(c) {
      var v = s[c];
      if (v == null) return '';
      var str = String(v);
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(','));
  });
  var blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'lokalgo-sellers-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Error handling ───────────────────────────────────────────────────────────── */

function showAdminError(msg) {
  var errEl = document.getElementById('admin-error-banner');
  if (errEl) { errEl.textContent = 'RALAT: ' + msg; errEl.style.display = 'block'; }
  var errRow = '<tr><td colspan="8" style="text-align:center;color:#f06060;padding:24px;font-size:13px;">Ralat: ' + esc(msg) + '</td></tr>';
  setHtml('sellers-tbody', errRow);
  setHtml('buyers-tbody', errRow);
  setHtml('testi-tbody', errRow);
  setHtml('saved-tbody', errRow);
}

/* ── Load all admin data ──────────────────────────────────────────────────────── */

function loadAdminData() {
  setText('top-sub', 'Memuatkan...');
  fetch('/api/admin/moderation', { cache: 'no-store' })
    .then(function(r) {
      if (!r.ok) return r.json().then(function(d) { throw new Error(d.error || 'HTTP ' + r.status); });
      return r.json();
    })
    .then(function(data) {
      if (data.error) { showAdminError(data.error); return; }

      var errEl = document.getElementById('admin-error-banner');
      if (errEl) errEl.style.display = 'none';

      _data = data;

      // Top stats
      var s = data.stats;
      setText('st-active', s.sellersByStatus.active);
      setText('st-pending', s.sellersByStatus.pending);
      setText('st-buyers', s.totalBuyers);
      setText('st-review', (data.pendingTestimonials || []).length + (data.complaints || []).length);

      // Nav badges
      var nbPending = document.getElementById('nb-pending');
      if (nbPending) {
        if (s.sellersByStatus.pending > 0) {
          nbPending.textContent = s.sellersByStatus.pending;
          nbPending.style.display = 'inline';
        } else {
          nbPending.style.display = 'none';
        }
      }
      var nbTesti = document.getElementById('nb-testi');
      if (nbTesti) {
        var pt = (data.pendingTestimonials || []).length;
        if (pt > 0) {
          nbTesti.textContent = pt;
          nbTesti.style.display = 'inline';
        } else {
          nbTesti.style.display = 'none';
        }
      }

      // Timestamp
      setText('top-sub', 'Kemaskini: ' + new Date().toLocaleTimeString('ms-MY'));

      renderDashboard();
      renderSellers();
      renderBuyers();
      renderTesti();
      renderSaved();
      renderStats();
      renderProducts();
    })
    .catch(function(e) { showAdminError(e.message || 'Ralat rangkaian'); });
}

/* ── Render: Products ───────────────────────────────────────────────────────── */

function renderProducts() {
  if (!_data) return;
  var products = _data.pendingProducts || [];
  var sellerMap = {};
  (_data.sellers || []).forEach(function(s) { sellerMap[s.id] = s.shop_name || s.name || s.id; });

  setText('products-count', products.length + ' pending');

  var nbProducts = document.getElementById('nb-products');
  if (nbProducts) {
    if (products.length > 0) { nbProducts.textContent = products.length; nbProducts.style.display = 'inline'; }
    else nbProducts.style.display = 'none';
  }

  if (!products.length) {
    setHtml('products-tbody', '<tr><td colspan="6" class="td-empty">Tiada produk pending &#10003;</td></tr>');
    return;
  }

  var typeColors = { warning: '#f0c040', info: '#7eb8f7', flag: '#f06060', success: '#acd036' };

  var html = products.map(function(p) {
    var name = esc((p.name || p.category || '—').toString().slice(0, 32));
    var category = esc((p.category || '—').toString());
    var shop = esc((sellerMap[p.seller_id] || '—').toString().slice(0, 20));
    var price = p.price_from != null ? 'RM ' + Number(p.price_from).toFixed(2) : '—';
    var imgHtml = (p.images && p.images[0])
      ? '<img src="' + esc(p.images[0]) + '" style="width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">'
      : '<div style="width:44px;height:44px;background:#1a1a1e;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">&#127873;</div>';
    return '<tr>'
      + '<td>' + imgHtml + '</td>'
      + '<td><div class="td-shop" style="max-width:180px;" title="' + name + '">' + name + '</div>'
      + '<div class="td-sub">' + category + '</div></td>'
      + '<td class="td-cell">' + shop + '</td>'
      + '<td class="td-cell" style="font-weight:700;color:#acd036;">' + price + '</td>'
      + '<td class="td-cell">' + fmtDate(p.created_at) + '</td>'
      + '<td class="td-r">'
      + '<button class="act-btn ab-g" onclick="adminAction(\'product\',\'' + esc(p.id) + '\',\'approve\')">Lulus</button>'
      + '<button class="act-btn ab-r" onclick="adminAction(\'product\',\'' + esc(p.id) + '\',\'reject\')">Tolak</button>'
      + '</td></tr>';
  }).join('');
  setHtml('products-tbody', html);
}

/* ── Admin Messages ─────────────────────────────────────────────────────────── */

var _messagesLoaded = false;

function loadMessages() {
  _messagesLoaded = false;
  setHtml('messages-tbody', '<tr><td colspan="7" style="text-align:center;color:rgba(240,240,240,0.2);padding:24px;font-size:13px;">Memuatkan...</td></tr>');
  fetch('/api/admin/messages')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _messagesLoaded = true;
      var messages = data.messages || [];
      setText('messages-count', messages.length + ' mesej');
      if (!messages.length) {
        setHtml('messages-tbody', '<tr><td colspan="7" class="td-empty">Tiada mesej dihantar lagi</td></tr>');
        return;
      }
      var typeCls = { warning: 'p-pending', info: 'p-aktif', flag: 'p-suspended', success: 'p-active' };
      var typeLabel = { warning: '&#9888; Warning', info: '&#8505; Info', flag: '&#9873; Flag', success: '&#10003; Success' };
      var html = messages.map(function(m) {
        var shop = esc((m.shop_name || m.seller_id || '—').toString().slice(0, 20));
        var title = esc((m.title || '—').toString().slice(0, 36));
        var body = esc((m.body || '—').toString().slice(0, 50));
        var typePill = '<span class="pill ' + (typeCls[m.type] || 'p-aktif') + '" style="font-size:10px;">' + (typeLabel[m.type] || esc(m.type)) + '</span>';
        var readBadge = m.is_read
          ? '<span style="color:#acd036;font-size:11px;font-weight:700;">Dibaca</span>'
          : '<span style="color:rgba(240,240,240,0.3);font-size:11px;">Belum</span>';
        return '<tr>'
          + '<td class="td-cell">' + shop + '</td>'
          + '<td class="td-c">' + typePill + '</td>'
          + '<td class="td-cell" title="' + title + '">' + title + '</td>'
          + '<td class="td-cell" style="color:rgba(240,240,240,0.45);" title="' + body + '">' + body + (m.body && m.body.length > 50 ? '…' : '') + '</td>'
          + '<td class="td-c">' + readBadge + '</td>'
          + '<td class="td-cell">' + fmtDate(m.sent_at) + '</td>'
          + '<td class="td-r"><button class="act-btn ab-r" onclick="deleteAdminMessage(\'' + esc(m.id) + '\')">Del</button></td>'
          + '</tr>';
      }).join('');
      setHtml('messages-tbody', html);

      // Populate seller dropdown in compose form
      if (_data && _data.sellers) {
        var sel = document.getElementById('msg-seller');
        if (sel && sel.options.length <= 1) {
          (_data.sellers || []).filter(function(s) { return s.status === 'active'; }).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = (s.shop_name || s.name || s.id) + ' — ' + (s.kawasan || '');
            sel.appendChild(opt);
          });
        }
      }
    })
    .catch(function(e) { showAdminError('Gagal muat mesej: ' + e.message); });
}

function toggleComposeMsg() {
  var form = document.getElementById('compose-form');
  if (!form) return;
  var showing = form.style.display !== 'none';
  form.style.display = showing ? 'none' : 'block';
  if (!showing && _data && _data.sellers) {
    var sel = document.getElementById('msg-seller');
    if (sel && sel.options.length <= 1) {
      (_data.sellers || []).filter(function(s) { return s.status === 'active'; }).forEach(function(s) {
        var opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = (s.shop_name || s.name || s.id) + ' — ' + (s.kawasan || '');
        sel.appendChild(opt);
      });
    }
  }
}

function sendAdminMessage() {
  var sellerId = ((document.getElementById('msg-seller') || {}).value || '').trim();
  var type = ((document.getElementById('msg-type') || {}).value || '').trim();
  var title = ((document.getElementById('msg-title') || {}).value || '').trim();
  var body = ((document.getElementById('msg-body') || {}).value || '').trim();
  var statusEl = document.getElementById('compose-status');

  if (!sellerId || !type || !title || !body) {
    if (statusEl) { statusEl.textContent = 'Sila lengkapkan semua medan.'; statusEl.style.display = 'block'; statusEl.style.background = 'rgba(240,96,96,0.1)'; statusEl.style.color = '#f06060'; }
    return;
  }

  var btn = document.querySelector('#compose-form .btn-primary');
  if (btn) { btn.textContent = 'Menghantar...'; btn.disabled = true; }

  fetch('/api/admin/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seller_id: sellerId, type: type, title: title, body: body })
  })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (btn) { btn.textContent = '✉ Hantar Mesej'; btn.disabled = false; }
      if (data.error) {
        if (statusEl) { statusEl.textContent = 'Ralat: ' + data.error; statusEl.style.display = 'block'; statusEl.style.background = 'rgba(240,96,96,0.1)'; statusEl.style.color = '#f06060'; }
        return;
      }
      if (statusEl) { statusEl.textContent = '✓ Mesej berjaya dihantar!'; statusEl.style.display = 'block'; statusEl.style.background = 'rgba(172,208,54,0.1)'; statusEl.style.color = '#acd036'; }
      document.getElementById('msg-title').value = '';
      document.getElementById('msg-body').value = '';
      document.getElementById('msg-seller').value = '';
      setTimeout(function() { if (statusEl) statusEl.style.display = 'none'; }, 3000);
      loadMessages();
    })
    .catch(function(e) {
      if (btn) { btn.textContent = '✉ Hantar Mesej'; btn.disabled = false; }
      if (statusEl) { statusEl.textContent = 'Ralat rangkaian: ' + e.message; statusEl.style.display = 'block'; statusEl.style.color = '#f06060'; }
    });
}

function deleteAdminMessage(id) {
  if (!confirm('Padam mesej ini?')) return;
  fetch('/api/admin/messages', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
  })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { alert('Ralat: ' + data.error); return; }
      loadMessages();
    })
    .catch(function(e) { alert('Ralat: ' + e.message); });
}

/* ── Broadcast / Platform Settings ─────────────────────────────────────────── */

function loadBroadcast() {
  fetch('/api/platform-settings')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var s = data.settings || {};
      var arabic = document.getElementById('bc-arabic');
      var trans = document.getElementById('bc-trans');
      if (arabic && s.broadcast_doa) arabic.value = s.broadcast_doa;
      if (trans && s.broadcast_doa_trans) trans.value = s.broadcast_doa_trans;
    })
    .catch(function(e) { showAdminError('Gagal muat broadcast: ' + e.message); });
}

function saveBroadcast() {
  var arabic = (document.getElementById('bc-arabic') || {}).value || '';
  var trans = (document.getElementById('bc-trans') || {}).value || '';
  var statusEl = document.getElementById('broadcast-status');

  Promise.all([
    fetch('/api/platform-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'broadcast_doa', value: arabic }),
    }),
    fetch('/api/platform-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'broadcast_doa_trans', value: trans }),
    }),
  ])
    .then(function(responses) {
      return Promise.all(responses.map(function(r) { return r.json(); }));
    })
    .then(function(results) {
      var allOk = results.every(function(r) { return r.ok; });
      if (statusEl) {
        statusEl.textContent = allOk ? '✓ Broadcast berjaya disimpan dan akan dipaparkan kepada semua seller.' : 'Ralat: ' + JSON.stringify(results);
        statusEl.style.display = 'block';
        statusEl.style.background = allOk ? 'rgba(172,208,54,0.1)' : 'rgba(240,96,96,0.1)';
        statusEl.style.color = allOk ? '#acd036' : '#f06060';
        setTimeout(function() { if (statusEl) statusEl.style.display = 'none'; }, 4000);
      }
    })
    .catch(function(e) {
      if (statusEl) {
        statusEl.textContent = 'Gagal: ' + e.message;
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(240,96,96,0.1)';
        statusEl.style.color = '#f06060';
      }
    });
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAdminData);
} else {
  loadAdminData();
}
