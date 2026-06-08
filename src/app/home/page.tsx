'use client'

import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { translations, useLang, type Lang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Seller } from '@/types/database'

type HomeProfile = {
  name: string
  avatarUrl: string | null
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}.logout-link{background:#fff;border:none;border-radius:20px;padding:8px 12px;color:#7B1533;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,0.16);flex-shrink:0;}.home-avatar{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.7);background:#7B1533;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.18);flex-shrink:0;}.home-avatar img{width:100%;height:100%;object-fit:cover;display:block;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap input{border:none;background:transparent;font-size:13px;color:#555;outline:none;width:100%;font-family:inherit;}\n.search-wrap input::placeholder{color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* CATEGORY ICONS */\n.cat-section{background:#fff;padding:14px 20px;border-bottom:1px solid #eee;}\n.cat-scroll{display:flex;gap:12px;overflow-x:auto;}.cat-scroll::-webkit-scrollbar{display:none;}\n.cat-item{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;cursor:pointer;}\n.cat-box{width:68px;height:68px;background:#f0f0f0;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid #eee;}\n.cat-lbl{font-size:10px;color:#555;text-align:center;max-width:70px;line-height:1.3;font-weight:500;}\n\n/* PILLS */\n.pill-row{background:#fff;padding:10px 20px;display:flex;gap:8px;overflow-x:auto;border-bottom:1px solid #eee;}\n.pill-row::-webkit-scrollbar{display:none;}\n.pill{padding:6px 16px;border-radius:20px;border:1.5px solid #ddd;font-size:12px;color:#666;background:#fff;white-space:nowrap;font-weight:500;cursor:pointer;flex-shrink:0;font-family:inherit;}\n.pill.active{background:var(--c-primary);border-color:var(--c-primary);color:#fff;}\n\n/* SECTION HEAD */\n.sec-head{padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;}\n.sec-head-title{font-size:14px;font-weight:700;color:var(--c-text);}\n.sec-head-link{font-size:12px;color:var(--c-primary);font-weight:500;text-decoration:none;display:flex;align-items:center;gap:3px;}\n\n/* SHOP CARDS */\n.shop-list{padding:0 20px 24px;display:flex;flex-direction:column;gap:12px;}\n.shop-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.07);}\n.img-wrap{position:relative;height:150px;}\n.img-bg{position:absolute;inset:0;background-size:cover;background-position:center;}\n.img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.55) 100%);}\n.badge-tl{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.45);color:var(--c-accent);font-size:10px;font-weight:600;padding:4px 10px;border-radius:6px;display:flex;align-items:center;gap:4px;border:1px solid rgba(173,208,54,0.3);}\n.badge-tr{position:absolute;top:10px;right:10px;display:flex;gap:6px;}\n.icon-btn{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}\n.shop-footer{background:var(--c-primary);padding:10px 12px 12px;}\n.shop-name-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;}\n.shop-name{font-size:15px;font-weight:700;color:#fff;}\n.shop-loc{font-size:11px;color:rgba(255,255,255,0.7);display:flex;align-items:center;gap:3px;margin-bottom:7px;}\n.shop-bottom{display:flex;justify-content:space-between;align-items:flex-end;}\n.tags{display:flex;gap:5px;flex-wrap:wrap;}\n.tag{font-size:10px;background:rgba(255,255,255,0.15);color:#fff;padding:3px 9px;border-radius:20px;font-weight:500;}\n.cod-row{display:flex;align-items:center;gap:4px;margin-top:5px;}\n.cod-txt{font-size:10px;color:rgba(255,255,255,0.6);}\n.status-open{background:var(--c-accent);color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:6px;align-self:flex-end;}\n.status-closed{background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;padding:5px 12px;border-radius:6px;align-self:flex-end;}\n.img-bg1{background:linear-gradient(160deg,#5a0e24,#3d0918);}\n.img-bg2{background:linear-gradient(160deg,#4a0b1e,#2d0712);}\n.img-bg3{background:linear-gradient(160deg,#3d0918,#250510);}"
const homeMarkup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003csvg viewBox=\"0 0 1080 365\" xmlns=\"http://www.w3.org/2000/svg\" style=\"height:40px;width:auto;\"\u003e\n      \u003cstyle\u003e.s0{fill:#FFF}.s1{fill:#ADD036}\u003c/style\u003e\n      \u003cpath class=\"s0\" d=\"M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z\"/\u003e\n    \u003c/svg\u003e\n    \u003cbutton class=\"sokong-btn\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n      Sokong Pembangun Anda\n    \u003c/button\u003e\n    \u003cbutton class=\"logout-link\"\u003eLog Keluar\u003c/button\u003e\n    \u003cbutton class=\"home-avatar\" aria-label=\"Profil\"\u003e\u003cspan class=\"home-avatar-initial\"\u003eLG\u003c/span\u003e\u003c/button\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cinput type=\"text\" placeholder=\"Cari kedai atau produk\"\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- CATEGORY --\u003e\n\u003cdiv class=\"cat-section\"\u003e\n  \u003cdiv class=\"cat-scroll\"\u003e\n    \u003cdiv class=\"cat-item\"\u003e\n      \u003cdiv class=\"cat-box\"\u003e\u003csvg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M3 11h18v2a9 9 0 0 1-18 0v-2z\"/\u003e\u003cpath d=\"M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z\"/\u003e\u003cline x1=\"12\" y1=\"3\" x2=\"12\" y2=\"7\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cspan class=\"cat-lbl\"\u003e\u003cspan data-i18n=\"cat_kuih\"\u003eKuih \u0026 Kek\u003c/span\u003e\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"cat-item\"\u003e\n      \u003cdiv class=\"cat-box\"\u003e\u003csvg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3\"/\u003e\u003crect x=\"9\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/\u003e\u003cline x1=\"12\" y1=\"11\" x2=\"12\" y2=\"21\"/\u003e\u003cline x1=\"9\" y1=\"16\" x2=\"23\" y2=\"16\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cspan class=\"cat-lbl\"\u003e\u003cspan data-i18n=\"cat_lauk\"\u003eLauk\u003c/span\u003e\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"cat-item\"\u003e\n      \u003cdiv class=\"cat-box\"\u003e\u003csvg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M17 8h1a4 4 0 1 1 0 8h-1\"/\u003e\u003cpath d=\"M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z\"/\u003e\u003cline x1=\"6\" y1=\"2\" x2=\"6\" y2=\"5\"/\u003e\u003cline x1=\"10\" y1=\"2\" x2=\"10\" y2=\"5\"/\u003e\u003cline x1=\"14\" y1=\"2\" x2=\"14\" y2=\"5\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cspan class=\"cat-lbl\"\u003e\u003cspan data-i18n=\"cat_minuman\"\u003eMinuman\u003c/span\u003e\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"cat-item\"\u003e\n      \u003cdiv class=\"cat-box\"\u003e\u003csvg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z\"/\u003e\u003cpath d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cspan class=\"cat-lbl\"\u003e\u003cspan data-i18n=\"cat_fresh\"\u003eFresh \u0026 Semula Jadi\u003c/span\u003e\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"cat-item\"\u003e\n      \u003cdiv class=\"cat-box\"\u003e\u003csvg width=\"30\" height=\"30\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"12\" y1=\"2\" x2=\"12\" y2=\"22\"/\u003e\u003cpath d=\"m20 6-8 4-8-4\"/\u003e\u003cpath d=\"m20 18-8-4-8 4\"/\u003e\u003cpath d=\"m2 12 10 4 10-4\"/\u003e\u003cpath d=\"m9 4 3 2 3-2\"/\u003e\u003cpath d=\"m9 20 3-2 3 2\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cspan class=\"cat-lbl\"\u003e\u003cspan data-i18n=\"cat_frozen\"\u003eFrozen \u0026 Simpanan\u003c/span\u003e\u003c/span\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- FILTER PILLS --\u003e\n\u003cdiv class=\"pill-row\"\u003e\n  \u003cdiv class=\"pill active\"\u003eCake\u003c/div\u003e\n  \u003cdiv class=\"pill\"\u003ePastry\u003c/div\u003e\n  \u003cdiv class=\"pill\"\u003eKuih\u003c/div\u003e\n  \u003cdiv class=\"pill\"\u003e\u003cspan data-i18n=\"cat_lauk\"\u003eLauk\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"pill\"\u003ePulut\u003c/div\u003e\n  \u003cdiv class=\"pill\"\u003e\u003cspan data-i18n=\"cat_minuman\"\u003eMinuman\u003c/span\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- POPULAR --\u003e\n\u003cdiv class=\"sec-head\"\u003e\n  \u003cspan class=\"sec-head-title\"\u003e\u003cspan data-i18n=\"popular_title\"\u003ePopular di kawasan anda\u003c/span\u003e\u003c/span\u003e\n  \u003ca class=\"sec-head-link\" href=\"#\"\u003eLihat Semuanya \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"6 9 12 15 18 9\"/\u003e\u003c/svg\u003e\u003c/a\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"shop-list\"\u003e\n\n  \u003c!-- Card 1 — BUKA --\u003e\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg img-bg1\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"img-overlay\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"badge-tl\"\u003e\n        \u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"#ADD036\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n        Verified Shop\n      \u003c/div\u003e\n      \u003cdiv class=\"badge-tr\"\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"18\" cy=\"5\" r=\"3\"/\u003e\u003ccircle cx=\"6\" cy=\"12\" r=\"3\"/\u003e\u003ccircle cx=\"18\" cy=\"19\" r=\"3\"/\u003e\u003cline x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/\u003e\u003cline x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name-row\"\u003e\n        \u003cspan class=\"shop-name\"\u003eResepi Kak Mila\u003c/span\u003e\n        \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.7)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\n        \u003cdiv\u003e\n          \u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eKuih\u003c/span\u003e\u003cspan class=\"tag\"\u003ePastry\u003c/span\u003e\u003cspan class=\"tag\"\u003eCake\u003c/span\u003e\u003c/div\u003e\n          \u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n        \u003c/div\u003e\n        \u003cspan class=\"status-open\"\u003e\u003cspan data-i18n=\"buka\"\u003eBUKA\u003c/span\u003e\u003c/span\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- Card 2 — TUTUP --\u003e\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg img-bg2\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"img-overlay\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"badge-tl\"\u003e\n        \u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"#ADD036\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n        Verified Shop\n      \u003c/div\u003e\n      \u003cdiv class=\"badge-tr\"\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"18\" cy=\"5\" r=\"3\"/\u003e\u003ccircle cx=\"6\" cy=\"12\" r=\"3\"/\u003e\u003ccircle cx=\"18\" cy=\"19\" r=\"3\"/\u003e\u003cline x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/\u003e\u003cline x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name-row\"\u003e\n        \u003cspan class=\"shop-name\"\u003eDapur Kak Ros\u003c/span\u003e\n        \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.7)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\n        \u003cdiv\u003e\n          \u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eLunch\u003c/span\u003e\u003cspan class=\"tag\"\u003e\u003cspan data-i18n=\"cat_lauk\"\u003eLauk\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n          \u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n        \u003c/div\u003e\n        \u003cspan class=\"status-closed\"\u003e\u003cspan data-i18n=\"tutup\"\u003eTUTUP\u003c/span\u003e\u003c/span\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- Card 3 — TUTUP --\u003e\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg img-bg3\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"img-overlay\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"badge-tr\"\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"18\" cy=\"5\" r=\"3\"/\u003e\u003ccircle cx=\"6\" cy=\"12\" r=\"3\"/\u003e\u003ccircle cx=\"18\" cy=\"19\" r=\"3\"/\u003e\u003cline x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/\u003e\u003cline x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n        \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name-row\"\u003e\n        \u003cspan class=\"shop-name\"\u003eDapur Budak Gemok\u003c/span\u003e\n        \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.7)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\n        \u003cdiv\u003e\n          \u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eLunch\u003c/span\u003e\u003cspan class=\"tag\"\u003e\u003cspan data-i18n=\"cat_lauk\"\u003eLauk\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n          \u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n        \u003c/div\u003e\n        \u003cspan class=\"status-closed\"\u003e\u003cspan data-i18n=\"tutup\"\u003eTUTUP\u003c/span\u003e\u003c/span\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e\n\u003c/div\u003e"

function copy(key: string, lang: Lang) {
  return translations[key]?.[lang] ?? key
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function firstInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'L'
}

function renderAvatar(profile: HomeProfile | null) {
  if (!profile) {
    return '<span class="home-avatar-initial">L</span>'
  }

  if (profile.avatarUrl) {
    return `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}">`
  }

  return `<span class="home-avatar-initial">${escapeHtml(firstInitial(profile.name))}</span>`
}

function badgeLabel(badge: Seller['badge']) {
  if (badge === 'verified_seller') return 'Verified Shop'
  if (badge === 'seller_aktif') return 'Active Seller'
  return 'New Seller'
}

function sellerTags(seller: Seller) {
  return [seller.badge.replaceAll('_', ' '), seller.kawasan, seller.postcode]
    .filter(Boolean)
    .slice(0, 3)
}

function renderSellerCard(seller: Seller, index: number, lang: Lang) {
  const imageStyle = seller.profile_image_url
    ? ` style="background-image:url('${escapeHtml(seller.profile_image_url)}')"`
    : ''
  const imageClass = seller.profile_image_url ? 'img-bg' : `img-bg img-bg${(index % 3) + 1}`
  const tags = sellerTags(seller)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('')

  return `
  <div class="shop-card" data-seller-id="${escapeHtml(seller.id)}">
    <div class="img-wrap">
      <div class="${imageClass}"${imageStyle}></div>
      <div class="img-overlay"></div>
      <div class="badge-tl">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#ADD036"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ${escapeHtml(badgeLabel(seller.badge))}
      </div>
      <div class="badge-tr">
        <div class="icon-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>
        <div class="icon-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
      </div>
    </div>
    <div class="shop-footer">
      <div class="shop-name-row">
        <span class="shop-name">${escapeHtml(seller.shop_name)}</span>
        <div class="shop-loc"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(seller.taman_name || seller.kawasan)}</div>
      </div>
      <div class="shop-bottom">
        <div>
          <div class="tags">${tags}</div>
          <div class="cod-row"><svg width="14" height="11" viewBox="0 0 36 24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="18" r="4"/><circle cx="28" cy="18" r="4"/><path d="M12 18h12"/><path d="M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z"/><path d="M20 10l2 4"/></svg><span class="cod-txt">${copy('cod_available', lang)}</span></div>
        </div>
        <span class="${seller.is_open ? 'status-open' : 'status-closed'}">${seller.is_open ? copy('buka', lang) : copy('tutup', lang)}</span>
      </div>
    </div>
  </div>`
}

function renderShopList(lang: Lang, sellers: Seller[], isLoading: boolean, error: string | null) {
  if (isLoading) {
    return '<div class="shop-card"><div class="shop-footer"><span class="shop-name">Loading sellers...</span></div></div>'
  }

  if (error) {
    return `<div class="shop-card"><div class="shop-footer"><span class="shop-name">${escapeHtml(error)}</span></div></div>`
  }

  if (sellers.length === 0) {
    return '<div class="shop-card"><div class="shop-footer"><span class="shop-name">No active sellers yet</span></div></div>'
  }

  return sellers.map((seller, index) => renderSellerCard(seller, index, lang)).join('')
}

function replaceShopList(markup: string, content: string) {
  const start = markup.indexOf('<div class="shop-list">')
  const endMarker = '\n</div>\n</div>\n</div>'
  const end = markup.lastIndexOf(endMarker)

  if (start === -1 || end === -1 || end <= start) return markup

  return `${markup.slice(0, start)}<div class="shop-list">\n${content}\n${markup.slice(end)}`
}

function renderHomeMarkup(lang: Lang, sellers: Seller[], isLoading: boolean, error: string | null, profile: HomeProfile | null) {
  let markup = homeMarkup

  Object.keys(translations).forEach((key) => {
    markup = markup.replace(
      new RegExp(`<span data-i18n="${key}">.*?</span>`, 'g'),
      `<span data-i18n="${key}">${copy(key, lang)}</span>`,
    )
  })

  markup = markup
    .replace('placeholder="Cari kedai atau produk"', `placeholder="${copy('search_placeholder', lang)}"`)
    .replace('<span class="lang-btn-txt">English</span>', `<span class="lang-btn-txt">${lang === 'ms' ? 'English' : 'BM'}</span>`)
    .replace('<span class="home-avatar-initial">LG</span>', renderAvatar(profile))
    .replace('onclick="i18n.toggle()"', '')

  return replaceShopList(markup, renderShopList(lang, sellers, isLoading, error))
}

export default function HomePage() {
  const { lang, toggle } = useLang()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [profile, setProfile] = useState<HomeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markup = useMemo(
    () => renderHomeMarkup(lang, sellers, isLoading, error, profile),
    [error, isLoading, lang, profile, sellers],
  )

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadSellers() {
      setIsLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        window.location.href = '/auth'
        return
      }

      const metadata = user.user_metadata ?? {}
      const metadataName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined
      const metadataFallbackName = typeof metadata.name === 'string' ? metadata.name : undefined
      const metadataAvatar = typeof metadata.avatar_url === 'string'
        ? metadata.avatar_url
        : typeof metadata.picture === 'string'
          ? metadata.picture
          : null
      setProfile({
        name: metadataName || metadataFallbackName || user.email || 'LokalGo',
        avatarUrl: metadataAvatar,
      })

      const { data, error: sellersError } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'active')
        .order('is_open', { ascending: false })
        .order('approved_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(10)

      if (cancelled) return

      if (sellersError) {
        setError('Unable to load sellers')
        setSellers([])
      } else {
        setSellers((data ?? []) as Seller[])
      }

      setIsLoading(false)
    }

    loadSellers()

    return () => {
      cancelled = true
    }
  }, [])

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('.lang-btn')) {
      toggle()
      return
    }

    if (target.closest('.sokong-btn')) {
      window.location.href = '/sokong'
      return
    }

    if (target.closest('.logout-link')) {
      void fetch('/auth/signout', { method: 'POST' }).then(() => {
        window.location.href = '/auth'
      })
      return
    }

    if (target.closest('.home-avatar')) {
      window.location.href = '/profile'
      return
    }

    const shopCard = target.closest<HTMLElement>('.shop-card')
    if (shopCard?.dataset.sellerId) {
      window.location.href = `/shop?seller=${shopCard.dataset.sellerId}`
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div onClick={handleClick} dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  )
}
