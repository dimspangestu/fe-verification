// pages/home/sections/TopNav.jsx
import React, { useEffect, useState } from "react";
import Link from "next/link";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function ArrowRight({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopNav({ brand }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition",
        scrolled ? "bg-white/85 backdrop-blur border-b border-black/5" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="h-[74px] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl grid place-items-center text-white font-black"
              style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})` }}
            >
              F
            </div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">{brand.name}</div>
              <div className="text-xs font-semibold text-slate-500">{brand.domain}</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-extrabold text-slate-600">
            <a className="hover:text-slate-900" href="#alur">Alur Bisnis</a>
            <a className="hover:text-slate-900" href="#fitur">Fitur</a>
            <a className="hover:text-slate-900" href="#paket">Paket</a>
            <a className="hover:text-slate-900" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:shadow-sm"
            >
              Request Demo
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
              style={{ backgroundColor: brand.primary }}
            >
              Mulai Sekarang <ArrowRight />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}