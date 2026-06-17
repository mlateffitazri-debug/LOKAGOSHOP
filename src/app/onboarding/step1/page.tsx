'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}.scroll{height:812px;}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:100dvh;overflow-y:auto;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom,32px);}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:calc(env(safe-area-inset-top,0px) + 14px) 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* PAGE TITLE */\n.page-title-wrap{padding:24px 20px 16px;text-align:center;}\n.page-title{font-size:22px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;margin-bottom:10px;}\n.page-desc{font-size:13px;color:var(--c-text2);line-height:1.6;}\n\n/* FORM SECTION */\n.form-section{padding:0 20px;display:flex;flex-direction:column;gap:20px;}\n\n.field-group{}\n.field-label{font-size:14px;font-weight:700;color:var(--c-primary);text-align:center;margin-bottom:10px;}\n.field-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;transition:border 0.2s;}\n.field-input:focus{border-color:var(--c-primary);}\n.field-input::placeholder{color:var(--c-hint);}\n.field-hint{font-size:11px;color:var(--c-text3);margin-top:6px;line-height:1.5;}\n\n/* MAP */\n.map-wrap{position:relative;margin-bottom:8px;}\n#map{height:240px;width:100%;border-radius:10px;overflow:hidden;border:1.5px solid var(--c-border);}\n#btn-locate{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:1000;background:#fff;border:1.5px solid var(--c-border);border-radius:20px;padding:8px 16px;font-size:12px;font-weight:700;color:var(--c-primary);font-family:inherit;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.18);white-space:nowrap;display:flex;align-items:center;gap:6px;}\n#btn-locate:active{transform:translateX(-50%) scale(0.96);}\n.leaflet-control-zoom{display:none;}\n.coord-display{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--c-text2);background:#f9f9f9;font-family:inherit;display:flex;align-items:center;gap:8px;}\n.coord-dot{width:8px;height:8px;border-radius:50%;background:var(--c-primary);flex-shrink:0;}\n\n/* PHONE PREFIX */\n.phone-row{display:flex;border:1.5px solid var(--c-border);border-radius:10px;overflow:hidden;background:#fff;transition:border 0.2s;}\n.phone-row:focus-within{border-color:var(--c-primary);}\n.phone-prefix{background:#f5f5f5;padding:12px 14px;font-size:14px;font-weight:700;color:var(--c-text2);border-right:1.5px solid var(--c-border);white-space:nowrap;}\n.phone-input{flex:1;border:none;background:transparent;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;font-family:inherit;}\n.phone-input::placeholder{color:var(--c-hint);}\n\n/* NEXT BUTTON */\n.next-wrap{padding:20px 20px 0;}\n.next-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 24px rgba(123,21,51,0.45);transition:transform 0.12s;}\n.next-btn::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.next-btn:active{transform:scale(0.985);}\n.back-btn{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"

const markup = `<div class="page">
<div class="scroll">

<!-- HEADER -->
<div class="header">
  <div class="header-r1">
    <button class="back-btn" onclick="history.back()" title="Kembali"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    <img src="/icons/Logo-LOKALGO.png" alt="LokalGo" style="height:40px;width:auto;display:block;">
    <button class="sokong-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      Sokong Pembangun Anda
    </button>
  </div>
  <div class="header-sub"><span>Platform perniagaan lokal setempat</span></div>
</div>

<!-- PAGE TITLE -->
<div class="page-title-wrap">
  <div class="page-title">Mari aktifkan kedai digital anda</div>
  <div class="page-desc">Sila masukkan butiran berkenaan kedai digital anda, lokasi perniagaan jalanan atau dari rumah anda beserta verifikasi nombor telefon anda.<br><br>Pihak pentadbir akan menjalankan fasa verifikasi secara digital dan anda akan menerima notifikasi dalam masa 3-5 hari.</div>
</div>

<!-- FORM -->
<div class="form-section">

  <!-- Nama Kedai -->
  <div class="field-group">
    <div class="field-label">Masukkan Nama Kedai Digital Anda</div>
    <input id="inp-shop-name" class="field-input" type="text" placeholder="Contoh: Kedai Kak Ida">
    <div class="field-hint">Nama yang akan dipaparkan kepada pembeli.</div>
  </div>

  <!-- Jenis Perniagaan -->
  <div class="field-group">
    <div class="field-label">Pilih Jenis Perniagaan</div>
    <select id="inp-business-type" class="field-input">
      <option value="FOOD">Food</option>
      <option value="SERVICE">Service</option>
      <option value="PRODUCT">Product</option>
      <option value="HOMESTAY">Homestay</option>
    </select>
    <div class="field-hint">Pelan percuma membenarkan satu jenis perniagaan sahaja buat masa ini.</div>
  </div>

  <!-- Lokasi Taman -->
  <div class="field-group">
    <div class="field-label">Masukkan Lokasi Taman Kedai Anda</div>
    <input id="inp-taman" class="field-input" type="text" placeholder="Contoh: Taman Desa Baiduri">
    <div class="field-hint">Jika anda seorang tepi jalan, masukkan alamat jalan anda</div>
  </div>

  <!-- Poskod -->
  <div class="field-group">
    <div class="field-label">Masukkan Poskod Kawasan Anda</div>
    <input id="inp-postcode" class="field-input" type="text" inputmode="numeric" maxlength="5" placeholder="Contoh: 43000">
    <div class="field-hint">Poskod anda membantu pembeli mengenalpasti kawasan jualan anda. Isikan dengan tepat.</div>
  </div>

  <!-- Map Pin -->
  <div class="field-group">
    <div class="field-label">Pin Lokasi Rumah atau Kedai anda</div>
    <div class="map-wrap">
      <div id="map"></div>
      <button id="btn-locate" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        Guna Lokasi Saya
      </button>
    </div>
    <div class="coord-display" id="coord-display">
      <div class="coord-dot"></div>
      <span id="coord-text">Tekan peta atau seret pin untuk pin lokasi</span>
    </div>
    <div class="field-hint">Tekan butang lokasi, atau tekan dan seret pin ke lokasi kedai anda. Koordinat akan disimpan automatik.</div>
  </div>

  <!-- Nombor Telefon -->
  <div class="field-group">
    <div class="field-label">Masukkan Nombor Telefon anda</div>
    <div class="phone-row">
      <div class="phone-prefix">+60</div>
      <input id="inp-phone" class="phone-input" type="tel" placeholder="Contoh: 017-017017017">
    </div>
    <div class="field-hint">Ini adalah nombor rasmi kedai anda, setiap pesanan akan dihubungi melalui nombor Whatsapp ini.</div>
  </div>

  <!-- Email Google -->
  <div class="field-group">
    <div class="field-label">Masukkan email Google anda</div>
    <input id="inp-email" class="field-input" type="email" placeholder="user@gmail.com">
    <div class="field-hint">Ini adalah untuk tujuan verifikasi akaun pengguna.</div>
  </div>

</div>

<!-- NEXT BUTTON -->
<div class="next-wrap">
  <button class="next-btn" onclick="window.__saveSellerStep1()">
    Seterusnya
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
</div>

</div>
</div>`

// Save function — includes lat/lng from the draggable pin
const saveScript = `window.__saveSellerStep1 = function() {
  var shopName = (document.getElementById('inp-shop-name') || {}).value;
  shopName = shopName ? shopName.trim() : '';
  var tamanName = (document.getElementById('inp-taman') || {}).value;
  tamanName = tamanName ? tamanName.trim() : '';
  var phoneRaw = (document.getElementById('inp-phone') || {}).value;
  phoneRaw = phoneRaw ? phoneRaw.trim() : '';
  var email = (document.getElementById('inp-email') || {}).value;
  email = email ? email.trim() : '';
  var businessType = (document.getElementById('inp-business-type') || {}).value || 'FOOD';
  var postcode = (document.getElementById('inp-postcode') || {}).value;
  postcode = postcode ? postcode.trim() : '';

  if (!shopName || !tamanName || !phoneRaw) {
    alert('Sila lengkapkan nama kedai, lokasi taman dan nombor WhatsApp.');
    return;
  }

  if (!/^\\d{5}$/.test(postcode) || postcode === '00000') {
    alert('Poskod anda membantu pembeli mengenalpasti kawasan jualan anda. Isikan dengan tepat.');
    return;
  }

  var pin = window.__lokagoPinCoords || { lat: null, lng: null };
  if (pin.lat == null || pin.lng == null) {
    var proceed = confirm('Anda belum pin lokasi kedai pada peta. Pembeli tidak dapat lihat jarak ke kedai anda.\\n\\nTeruskan tanpa lokasi?');
    if (!proceed) return;
  }

  var data = {
    shop_name: shopName,
    taman_name: tamanName,
    kawasan: tamanName,
    postcode: postcode,
    whatsapp_number: phoneRaw,
    email: email,
    business_type: businessType,
    latitude: pin.lat != null ? String(pin.lat) : null,
    longitude: pin.lng != null ? String(pin.lng) : null
  };

  localStorage.setItem('lokalgo_seller_onboarding', JSON.stringify(data));
  window.location.href = '/onboarding/step2';
};`

// Map initialisation with draggable marker + dragend + click handlers
// Use setTimeout directly — avoids normalizeScript regex cutting nested callbacks
const mapScript = `setTimeout(function() {
  var mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;
  if (mapEl._leaflet_id) return; // already initialised — guard against effect re-runs

  // Default view: KL. Coordinates are only COMMITTED once the user pins
  // (GPS / drag / tap) — never silently save the default location.
  var DEFAULT_LAT = 3.1025, DEFAULT_LNG = 101.6565;
  window.__lokagoPinCoords = { lat: null, lng: null };

  var map = L.map('map', {
    center: [DEFAULT_LAT, DEFAULT_LNG],
    zoom: 15,
    zoomControl: false,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  var icon = L.divIcon({
    className: '',
    html: '<svg width="28" height="36" viewBox="0 0 30 38"><path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 23 15 23S30 26.25 30 15C30 6.72 23.28 0 15 0z" fill="#7B1533"/><circle cx="15" cy="15" r="7" fill="#fff"/><circle cx="15" cy="15" r="3" fill="#7B1533"/></svg>',
    iconSize: [28, 36],
    iconAnchor: [14, 36]
  });

  var marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon: icon, draggable: true }).addTo(map);

  function updatePin(latlng) {
    window.__lokagoPinCoords = { lat: latlng.lat, lng: latlng.lng };
    var coordText = document.getElementById('coord-text');
    if (coordText) {
      coordText.textContent = latlng.lat.toFixed(6) + ', ' + latlng.lng.toFixed(6);
    }
  }

  marker.on('dragend', function(e) {
    updatePin(e.target.getLatLng());
  });

  marker.on('drag', function(e) {
    window.__lokagoPinCoords = { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng };
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updatePin(e.latlng);
  });

  // Re-measure after fonts/layout settle and on viewport changes —
  // prevents grey/offset tiles and a mispositioned pin
  function refreshMapSize() { map.invalidateSize(); }
  setTimeout(refreshMapSize, 50);
  setTimeout(refreshMapSize, 400);
  window.addEventListener('load', refreshMapSize);
  window.addEventListener('resize', refreshMapSize);
  window.addEventListener('orientationchange', function() { setTimeout(refreshMapSize, 250); });

  // GPS — centre map on the seller's device and commit the pin there
  function goToUserLocation(fromButton) {
    var btn = document.getElementById('btn-locate');
    if (!navigator.geolocation) {
      if (fromButton) alert('Peranti anda tidak menyokong GPS. Sila seret pin secara manual.');
      return;
    }
    if (btn && fromButton) btn.textContent = 'Mencari lokasi...';
    navigator.geolocation.getCurrentPosition(function(pos) {
      var latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      marker.setLatLng(latlng);
      map.setView(latlng, 17);
      updatePin(latlng);
      if (btn && fromButton) btn.textContent = 'Lokasi dikesan';
    }, function() {
      if (btn && fromButton) {
        btn.textContent = 'Guna Lokasi Saya';
        alert('Tidak dapat akses lokasi anda. Sila benarkan akses lokasi dalam tetapan, atau seret pin secara manual.');
      }
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 });
  }

  var locateBtn = document.getElementById('btn-locate');
  if (locateBtn) {
    locateBtn.addEventListener('click', function() { goToUserLocation(true); });
  }
}, 0);`

const scripts: string[] = [saveScript, mapScript]
const externalScripts: string[] = ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js']
const externalStylesheets: string[] = ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css']

export default function Page() {
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) return
      const { data: seller } = await supabase
        .from('sellers').select('id').eq('user_id', user.id).maybeSingle()
      if (cancelled) return
      if (seller) { window.location.href = '/seller/dashboard' }
    }

    checkAuth().catch(console.error)
    return () => { cancelled = true }
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={scripts}
      externalScripts={externalScripts}
      externalStylesheets={externalStylesheets}
    />
  )
}
