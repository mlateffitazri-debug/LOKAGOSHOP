// LokalGo Admin Panel — client-side logic
// Loaded as a real <script> tag so functions are global (no new Function() transformation)

var _data = null;
var _dbTable = '';
var _sellersFilter = 'all';
var _buyersFilter = 'all';
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

function renderSellers() {
  if (!_data) return;

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
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('seller', s.id, 'restore')+'">Pulih</button>';
      return '<tr data-id="'+s.id+'" style="opacity:0.6;">' +
        '<td class="td-name" title="'+(s.shop_name||s.name||'')+'">'+shopName+'</td>' +
        '<td class="td-cell">'+kawasan+'</td>' +
        '<td class="td-center">-</td>' +
        '<td class="td-center">-</td>' +
        '<td class="td-center"><span class="status-pill pill-deleted">dipadam</span></td>' +
        '<td class="td-cell">'+deletedAt+'</td>' +
        '<td class="td-actions">'+restoreBtn+'</td>' +
        '</tr>';
    }).join('');
    setHtml('sellers-tbody', html);
    return;
  }

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
    var badgeLabel = (badge === 'verified' || badge === 'verified_seller')
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
    var isOpen = s.is_open ? '<span style="color:#acd036;font-size:11px;">Buka</span>' : '<span style="color:rgba(240,240,240,0.3);font-size:11px;">Tutup</span>';
    var pillClass = status === 'active' ? 'pill-active' : status === 'pending' ? 'pill-pending' : 'pill-suspended';
    return '<tr data-id="'+s.id+'" data-status="'+status+'">' +
      '<td class="td-name" title="'+(s.shop_name||s.name||'')+'">'+shopName+'</td>' +
      '<td class="td-cell">'+kawasan+'</td>' +
      '<td class="td-center">'+badgeLabel+'</td>' +
      '<td class="td-center">'+isOpen+'</td>' +
      '<td class="td-center"><span class="status-pill '+pillClass+'">'+status+'</span></td>' +
      '<td class="td-cell">'+created+'</td>' +
      '<td class="td-actions">'+approveBtn+suspendBtn+delBtn+badgeBtn+'</td>' +
      '</tr>';
  }).join('');
  setHtml('sellers-tbody', html);
}

function renderBuyers() {
  if (!_data) return;

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
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('buyer', b.id, 'restore')+'">Pulih</button>';
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

function renderTesti() {
  if (!_data) return;

  var sellers = _data.sellers || [];
  var sellerMap = {};
  sellers.forEach(function(s){ sellerMap[s.id] = s.shop_name || s.name || '-'; });

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
      var restoreBtn = '<button class="act-btn btn-green" title="Pulihkan" onclick="'+adminActionCall('testimonial', t.id, 'restore')+'">Pulih</button>';
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

  var all = _data.testimonials || [];
  var filtered;
  if (_testiFilter === 'pending') {
    filtered = all.filter(function(t){ return !t.is_approved; });
  } else if (_testiFilter === 'approved') {
    filtered = all.filter(function(t){ return t.is_approved; });
  } else {
    filtered = all;
  }
  setText('testi-count', filtered.length + ' rekod');
  if (!filtered.length) {
    setHtml('testi-tbody', '<tr><td colspan="6" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
    return;
  }
  var html = filtered.map(function(t) {
    var shop = (sellerMap[t.seller_id] || '-').toString().slice(0,16);
    var buyer = (t.buyer_name || '-').toString().slice(0,16);
    var content = (t.content || '-').toString().slice(0,30);
    var stars = '';
    for (var i = 0; i < (t.rating || 0); i++) stars += '*';
    var rating = stars || '-';
    var approved = t.is_approved
      ? '<span style="color:#acd036;font-weight:700;font-size:11px;">Lulus</span>'
      : '<span style="color:#f0c040;font-weight:700;font-size:11px;">Pending</span>';
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

function renderSaved() {
  if (!_data) return;
  var saved = _data.savedShops || [];
  setText('saved-count', saved.length + ' rekod');
  if (!saved.length) {
    setHtml('saved-tbody', '<tr><td colspan="3" style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</td></tr>');
    return;
  }
  var html = saved.map(function(row) {
    var buyer = (row.buyer_display || row.buyer_id || '-').toString().slice(0,22);
    var shop = (row.shop_display || row.shop_id || '-').toString().slice(0,22);
    var created = row.created_at ? new Date(row.created_at).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'2-digit'}) : '-';
    return '<tr><td class="td-cell">'+buyer+'</td><td class="td-cell">'+shop+'</td><td class="td-cell">'+created+'</td></tr>';
  }).join('');
  setHtml('saved-tbody', html);
}

function renderStats() {
  if (!_data || !_data.stats) return;
  var s = _data.stats;
  setText('ps-reg-users', s.totalRegisteredUsers || ((s.totalSellers || 0) + (s.totalBuyers || 0)));
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
    '<div class="sc-line" style="color:#acd036;">* '+sb.active+' Aktif</div>' +
    '<div class="sc-line" style="color:#f0c040;">* '+sb.pending+' Pending</div>' +
    '<div class="sc-line" style="color:#f06060;">* '+sb.suspended+' Suspended</div>'
  );
  var areas = s.sellersByArea || [];
  var max = areas.length ? areas[0].count : 1;
  var areaHtml = areas.slice(0,8).map(function(a) {
    var pct = Math.round((a.count / max) * 100);
    return '<div class="area-card">' +
      '<div class="area-row"><span class="area-name">'+a.area+'</span><span class="area-count">'+a.count+' seller</span></div>' +
      '<div class="area-bar"><div class="area-fill" style="width:'+pct+'%"></div></div>' +
      '</div>';
  }).join('');
  if (!areaHtml) areaHtml = '<div style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Tiada data</div>';
  setHtml('area-bars', areaHtml);
  renderRegistrationChart(_data.sellers || [], _data.buyers || []);
}

function renderRegistrationChart(sellers, buyers) {
  var now = new Date();
  var months = [];
  var i;
  for (i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push({ label: d.toLocaleDateString('ms-MY', { month: 'short' }), key: key, s: 0, b: 0 });
  }
  var idx = {};
  months.forEach(function(m, j){ idx[m.key] = j; });
  sellers.forEach(function(s){ if (!s.created_at) return; var k = s.created_at.slice(0,7); if (idx[k] !== undefined) months[idx[k]].s++; });
  buyers.forEach(function(b){ if (!b.created_at) return; var k = b.created_at.slice(0,7); if (idx[k] !== undefined) months[idx[k]].b++; });
  var maxVals = months.map(function(m){ return Math.max(m.s, m.b); });
  var maxVal = Math.max.apply(null, [1].concat(maxVals));
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

function showAdminError(msg) {
  var errEl = document.getElementById('admin-error-banner');
  if (errEl) { errEl.textContent = '[ERROR] ' + msg; errEl.style.display = 'block'; }
  var errRow = '<tr><td colspan="7" style="text-align:center;color:#f06060;padding:20px;font-size:13px;">[ERROR] ' + msg + '</td></tr>';
  setHtml('sellers-tbody', errRow);
  setHtml('buyers-tbody', errRow);
  setHtml('testi-tbody', errRow);
  setHtml('saved-tbody', errRow);
}

function loadAdminData() {
  fetch('/api/admin/moderation', { cache: 'no-store' })
    .then(function(r){
      if (!r.ok) {
        return r.json().then(function(d){ throw new Error(d.error || 'HTTP ' + r.status); });
      }
      return r.json();
    })
    .then(function(data) {
      if (data.error) { showAdminError(data.error); return; }
      var errEl = document.getElementById('admin-error-banner');
      if (errEl) errEl.style.display = 'none';
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
    .catch(function(e){ showAdminError(e.message || 'Ralat rangkaian'); });
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
      setHtml('db-info', table + ' - ' + data.count + ' rekod (paparan: ' + rows.length + ')');
      if (!rows.length) {
        setHtml('db-content', '<div style="text-align:center;color:rgba(240,240,240,0.3);padding:28px 16px;font-size:14px;">Jadual kosong</div>');
        return;
      }
      var cols = Object.keys(rows[0]);
      var html = '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
      cols.forEach(function(c){ html += '<th>'+c+'</th>'; });
      html += '<th>Del</th></tr></thead><tbody>';
      rows.forEach(function(row) {
        html += '<tr>';
        cols.forEach(function(col) {
          var val = row[col];
          var display;
          if (val === null || val === undefined) {
            display = '-';
          } else if (typeof val === 'boolean') {
            display = val ? 'true' : 'false';
          } else if (typeof val === 'object') {
            display = JSON.stringify(val).slice(0,30);
          } else {
            display = String(val).slice(0,40);
          }
          html += '<td class="td-cell" title="'+String(row[col]||'')+'">'+display+'</td>';
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
  var confirmToken = 'CLEAR_' + _dbTable.toUpperCase();
  fetch('/api/admin/database', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action: 'clear_table', table: _dbTable, confirm: confirmToken })
  }).then(function(r){ return r.json(); }).then(function(d){
    if (d.error) { alert('Ralat: ' + d.error); return; }
    alert('Semua rekod dari "' + _dbTable + '" telah dipadam.');
    loadDbTable(_dbTable);
    loadAdminData();
  }).catch(function(e){ alert('Ralat: ' + e.message); });
}

function openManualForm() {
  var modal = document.getElementById('manual-modal');
  if (modal) modal.classList.add('open');
}

function closeManualForm() {
  var modal = document.getElementById('manual-modal');
  if (modal) modal.classList.remove('open');
  var fields = ['mo-email','mo-shop','mo-taman','mo-phone','mo-kawasan','mo-postcode'];
  fields.forEach(function(fid) {
    var el = document.getElementById(fid);
    if (el) el.value = '';
  });
}

function submitManualOnboard() {
  var email    = (document.getElementById('mo-email')    || {value:''}).value.trim();
  var shopName = (document.getElementById('mo-shop')     || {value:''}).value.trim();
  var taman    = (document.getElementById('mo-taman')    || {value:''}).value.trim();
  var phone    = (document.getElementById('mo-phone')    || {value:''}).value.trim();
  var kawasan  = (document.getElementById('mo-kawasan')  || {value:''}).value.trim();
  var postcode = (document.getElementById('mo-postcode') || {value:''}).value.trim();

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
      msg += '\n\nAkaun Google berjaya dikaitkan.';
    } else {
      msg += '\n\nEmail tidak dijumpai dalam sistem. Penjual perlu log masuk dengan Google sekali untuk mengaktifkan pautan akaun.';
    }
    alert(msg);
    closeManualForm();
    loadAdminData();
  })
  .catch(function(e){ alert('Ralat rangkaian: ' + e.message); });
}

// Init — run after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAdminData);
} else {
  loadAdminData();
}
