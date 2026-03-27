// pages/home/sections/FlowPreview.jsx
import React from "react";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    role: "investee",
    title: "Daftar & Submit Dokumen",
    desc: "Lengkapi profil, upload KYC, dan ajukan proposal proyek.",
    color: "emerald",
  },
  {
    num: "02",
    role: "Fondofund",
    title: "Verifikasi & Kurasi",
    desc: "Admin memverifikasi identitas, dokumen, dan kelayakan proyek.",
    color: "green",
  },
  {
    num: "03",
    role: "Investor",
    title: "Dana & Pantau Return",
    desc: "Investor memilih proyek approved dan memantau hasil investasi.",
    color: "teal",
  },
];

const DOT = {
  emerald: "bg-emerald-500",
  green:   "bg-green-600",
  teal:    "bg-teal-500",
};
const BADGE = {
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  green:   "bg-green-50 text-green-800 border-green-200",
  teal:    "bg-teal-50 text-teal-800 border-teal-200",
};
const NUM = {
  emerald: "bg-emerald-500",
  green:   "bg-green-600",
  teal:    "bg-teal-500",
};

export default function FlowPreview() {
  return (
    <section id="alur" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-[1200px] px-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-3xl md:max-w-none">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-extrabold text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Alur Platform
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Dari pengajuan hingga pendanaan —{" "}
              <span className="text-green-600">semua terverifikasi.</span>
            </h2>
            <p className="mt-3 text-slate-500 font-semibold leading-relaxed">
              Fondofund memastikan setiap pihak melewati proses KYC sebelum bertransaksi.
            </p>
          </div>
        </div>

        {/* 3-step strip */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-green-100">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative flex flex-col gap-4 px-0 md:px-8 first:pl-0 last:pr-0">
              {/* Mobile connector */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-green-100 md:hidden" />
              )}

              <div className="flex items-start gap-4">
                {/* Number bubble */}
                <div className={["h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-sm", NUM[s.color]].join(" ")}>
                  {s.num}
                </div>

                <div>
                  <span className={["inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black mb-1.5", BADGE[s.color]].join(" ")}>
                    {s.role}
                  </span>
                  <div className="text-sm font-black text-slate-900">{s.title}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500 leading-relaxed">{s.desc}</div>
                </div>
              </div>

              {/* Desktop arrow */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-4 z-10 h-6 w-6 rounded-full bg-white border border-green-200 flex items-center justify-center text-green-500 text-xs font-black shadow-sm">
                  <span className="block text-center leading-none">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result pills */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Hasil verifikasi:</span>
          {[
            { label: "Approved", cls: "bg-emerald-50 border-emerald-200 text-emerald-800", dot: "bg-emerald-500" },
            { label: "Revision", cls: "bg-amber-50 border-amber-200 text-amber-800",       dot: "bg-amber-500"   },
            { label: "Rejected", cls: "bg-rose-50 border-rose-200 text-rose-800",           dot: "bg-rose-500"    },
          ].map((r) => (
            <span key={r.label} className={["inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black", r.cls].join(" ")}>
              <span className={["h-1.5 w-1.5 rounded-full", r.dot].join(" ")} />
              {r.label}
            </span>
          ))}
        </div>

        {/* View more CTA */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/alur"
            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-700 active:scale-95 transition">
            Lihat Alur Lengkap
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Detail setiap langkah, dokumen yang dibutuhkan, dan status verifikasi.
          </span>
        </div>

      </div>
    </section>
  );
}