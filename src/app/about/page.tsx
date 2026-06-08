import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] font-['Plus_Jakarta_Sans',sans-serif] text-[#111111] min-[500px]:flex min-[500px]:items-start min-[500px]:justify-center min-[500px]:p-10 min-[1024px]:items-center">
      <section className="min-h-screen w-full max-w-[430px] bg-[#F5F5F5] px-5 py-5 min-[500px]:min-h-0 min-[500px]:rounded-[36px] min-[500px]:border-8 min-[500px]:border-[#1a1a1a] min-[500px]:shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <Link href="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7B1533] text-white">
          ‹
        </Link>
        <div className="mt-5 rounded-[18px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <h1 className="text-xl font-extrabold text-[#7B1533]">Tentang LokaGo</h1>
          <p className="mt-3 text-sm leading-6 text-[#555555]">
            LokaGo ialah platform penemuan kedai lokal untuk pembeli dan penjual setempat.
          </p>
          <p className="mt-4 text-xs font-semibold text-[#888888]">Versi 1.1 | NS0308474-A</p>
        </div>
      </section>
    </main>
  )
}
