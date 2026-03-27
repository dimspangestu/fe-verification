// pages/home/sections/Hero.jsx
import React from "react";
import Link from "next/link";
import images from "../../../assets/plant.jpg";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">

      {/* ── Background photo ── */}
      <div className="absolute inset-0 z-0">
        
        <img
          src={images.src}
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-800/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 py-20 md:py-28">
        <div className="max-w-[680px]">

          <h1 className="mt-7 text-[40px] md:text-[58px] lg:text-[64px] font-black leading-[1.04] tracking-tight text-white">
            Bangun portofolio{" "}
            <span className="text-emerald-400">masa depan</span>{" "}
            dengan strategi yang terformulasi.
          </h1>

          <p className="mt-6 text-base md:text-lg font-semibold leading-relaxed text-slate-300 max-w-[560px]">
            Platform kami dirancang untuk investor yang mengutamakan akurasi data
            di atas janji bunga tinggi. Kelola risiko Anda secara nyata, dan
            saksikan aset Anda bertumbuh dengan hasil yang lebih terprediksi.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-95">
              Mulai Investasi
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/10 pt-8">
            {[
              { label: "Data Terverifikasi",  icon: "✓" },
              { label: "Risiko Terprediksi",  icon: "✓" },
              { label: "Audit Trail Lengkap", icon: "✓" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                  {t.icon}
                </span>
                {t.label}
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
    </section>
  );
}