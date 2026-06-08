'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;padding-bottom:32px;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* PAGE TITLE */\n.page-title-wrap{padding:24px 20px 16px;text-align:center;}\n.page-title{font-size:22px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;margin-bottom:10px;}\n.page-desc{font-size:13px;color:var(--c-text2);line-height:1.6;}\n\n/* FORM SECTION */\n.form-section{padding:0 20px;display:flex;flex-direction:column;gap:20px;}\n\n.field-group{}\n.field-label{font-size:14px;font-weight:700;color:var(--c-primary);text-align:center;margin-bottom:10px;}\n.field-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;transition:border 0.2s;}\n.field-input:focus{border-color:var(--c-primary);}\n.field-input::placeholder{color:var(--c-hint);}\n.field-hint{font-size:11px;color:var(--c-text3);margin-top:6px;line-height:1.5;}\n\n/* MAP */\n#map{height:200px;width:100%;border-radius:10px;overflow:hidden;border:1.5px solid var(--c-border);margin-bottom:8px;}\n.leaflet-control-zoom{display:none;}\n.coord-display{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--c-text2);background:#f9f9f9;font-family:inherit;display:flex;align-items:center;gap:8px;}\n.coord-dot{width:8px;height:8px;border-radius:50%;background:var(--c-primary);flex-shrink:0;}\n\n/* PHONE PREFIX */\n.phone-row{display:flex;border:1.5px solid var(--c-border);border-radius:10px;overflow:hidden;background:#fff;transition:border 0.2s;}\n.phone-row:focus-within{border-color:var(--c-primary);}\n.phone-prefix{background:#f5f5f5;padding:12px 14px;font-size:14px;font-weight:700;color:var(--c-text2);border-right:1.5px solid var(--c-border);white-space:nowrap;}\n.phone-input{flex:1;border:none;background:transparent;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;font-family:inherit;}\n.phone-input::placeholder{color:var(--c-hint);}\n\n/* NEXT BUTTON */\n.next-wrap{padding:20px 20px 0;}\n.next-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 24px rgba(123,21,51,0.45);transition:transform 0.12s;}\n.next-btn::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.next-btn:active{transform:scale(0.985);}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"

const markup = `<div class="page">
<div class="scroll">

<!-- HEADER -->
<div class="header">
  <div class="header-r1">
    <button class="back-btn" onclick="history.back()" title="Kembali"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    <svg viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" style="height:40px;width:auto;">
      <style>.s0{fill:#FFF}.s1{fill:#ADD036}</style>
      <path class="s0" d="M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z"/>
      <path class="s0" d="M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z"/>
      <path class="s0" d="M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z"/>
      <path class="s0" d="M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z"/>
      <path class="s1" d="M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z"/>
      <path class="s1" d="M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z"/>
    </svg>
    <button class="sokong-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      Sokong Pembangun Anda
    </button>
  </div>
  <div class="header-sub"><span>Platform perniagaan lokal setempat</span></div>
  <div class="header-r2">
    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span>Cari kedai atau produk</span>
    </div>
  </div>
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

  <!-- Lokasi Taman -->
  <div class="field-group">
    <div class="field-label">Masukkan Lokasi Taman Kedai Anda</div>
    <input id="inp-taman" class="field-input" type="text" placeholder="Contoh: Taman Desa Baiduri">
    <div class="field-hint">Jika anda seorang tepi jalan, masukkan alamat jalan anda</div>
  </div>

  <!-- Map Pin -->
  <div class="field-group">
    <div class="field-label">Pin Lokasi Rumah atau Kedai anda</div>
    <div id="map"></div>
    <div class="coord-display" id="coord-display">
      <div class="coord-dot"></div>
      <span id="coord-text">Tekan peta atau seret pin untuk pin lokasi</span>
    </div>
    <div class="field-hint">Tekan dan seret pin ke lokasi kedai anda. Koordinat akan disimpan automatik.</div>
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

  if (!shopName || !tamanName || !phoneRaw) {
    alert('Sila lengkapkan nama kedai, lokasi taman dan nombor WhatsApp.');
    return;
  }

  var pin = window.__lokagoPinCoords || { lat: null, lng: null };
  var postcodeMatch = tamanName.match(/\\b\\d{5}\\b/);

  var data = {
    shop_name: shopName,
    taman_name: tamanName,
    kawasan: tamanName,
    postcode: postcodeMatch ? postcodeMatch[0] : '00000',
    whatsapp_number: phoneRaw,
    email: email,
    latitude: pin.lat ? String(pin.lat) : null,
    longitude: pin.lng ? String(pin.lng) : null
  };

  localStorage.setItem('lokalgo_seller_onboarding', JSON.stringify(data));
  window.location.href = '/onboarding/step2';
};`

// Map initialisation with draggable marker + dragend + click handlers
const mapScript = `document.addEventListener('DOMContentLoaded', function() {
  var lat = 3.1025, lng = 101.6565;
  window.__lokagoPinCoords = { lat: lat, lng: lng };

  var map = L.map('map', {
    center: [lat, lng],
    zoom: 15,
    zoomControl: false,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  var icon = L.divIcon({
    className: '',
    html: '<svg width="28" height="36" viewBox="0 0 30 38"><path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 23 15 23S30 26.25 30 15C30 6.72 23.28 0 15 0z" fill="#7B1533"/><circle cx="15" cy="15" r="7" fill="#fff"/><circle cx="15" cy="15" r="3" fill="#7B1533"/></svg>',
    iconSize: [28, 36],
    iconAnchor: [14, 36]
  });

  var marker = L.marker([lat, lng], { icon: icon, draggable: true }).addTo(map);

  function updatePin(latlng) {
    window.__lokagoPinCoords = { lat: latlng.lat, lng: latlng.lng };
    var coordText = document.getElementById('coord-text');
    if (coordText) {
      coordText.textContent = latlng.lat.toFixed(6) + ', ' + latlng.lng.toFixed(6);
    }
  }

  // Drag end — update coords when user finishes dragging
  marker.on('dragend', function(e) {
    updatePin(e.target.getLatLng());
  });

  // Also update live while dragging for immediate feedback
  marker.on('drag', function(e) {
    window.__lokagoPinCoords = { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng };
  });

  // Click on map — move pin to clicked location
  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updatePin(e.latlng);
  });

  // Initialise display with default coords
  updatePin({ lat: lat, lng: lng });
});`

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
      if (!user) { window.location.href = '/auth'; return }
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
