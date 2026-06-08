'use client'

import Link from 'next/link'

function LogoText() {
  return (
    <div className="inline-flex items-end gap-0.5 text-4xl font-extrabold tracking-normal text-white">
      <span>Loka</span>
      <span className="text-[#ADD036]">Go</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#F3F3F3] px-5 py-4 last:border-b-0">
      <p className="text-[11px] font-extrabold uppercase tracking-normal text-[#888888]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#111111]">{value}</p>
    </div>
  )
}

export default function AboutPage() {
  function goBack() {
    window.history.back()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-['Plus_Jakarta_Sans',sans-serif] text-[#111111] min-[500px]:flex min-[500px]:items-start min-[500px]:justify-center min-[500px]:p-10 min-[1024px]:items-center">
      <section className="min-h-screen w-full max-w-[430px] overflow-hidden bg-[#F5F5F5] min-[500px]:min-h-0 min-[500px]:rounded-[36px] min-[500px]:border-8 min-[500px]:border-[#1a1a1a] min-[500px]:shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="h-[812px] overflow-y-auto pb-6">
          <header className="bg-[#7B1533] px-5 pb-8 pt-4 text-white">
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white"
              aria-label="Kembali"
            >
              {'<'}
            </button>
            <div className="mt-7">
              <LogoText />
              <p className="mt-2 text-xs font-semibold text-white/65">Platform perniagaan lokal setempat</p>
            </div>
          </header>

          <div className="px-5 py-5">
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <InfoRow label="Platform" value="LokaGo Shop" />
              <InfoRow label="Versi" value="1.1" />
              <InfoRow label="SSM" value="NS0308474-A" />
              <InfoRow label="Domain" value="lokago.app" />
              <InfoRow label="Pengasas" value="Mohd Lateffi Tazri" />
              <InfoRow label="Email" value="admin@lokago.app" />
              <InfoRow label="Tagline" value="Platform perniagaan lokal setempat" />
            </div>

            <div className="mt-4 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <Link href="/privacy" className="flex items-center justify-between border-b border-[#F3F3F3] px-5 py-4 text-sm font-bold text-[#111111]">
                <span>Dasar Privasi</span>
                <span className="text-[#BBBBBB]">&gt;</span>
              </Link>
              <Link href="/tnc" className="flex items-center justify-between px-5 py-4 text-sm font-bold text-[#111111]">
                <span>Terma & Syarat</span>
                <span className="text-[#BBBBBB]">&gt;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
