// pages/home/sections/FAQ.jsx
import React, { useState } from "react";

const FAQ_EXTENDED = [
  {
    q: "FondoFund ini P2P lending atau verifikator?",
    a: "FondoFund berperan sebagai verifikator/jembatan: memverifikasi investee dana dan membantu listing yang siap ditampilkan ke investor. Kami memastikan setiap pihak sudah melewati KYC sebelum bertransaksi.",
    cat: "Umum",
  },
  {
    q: "Apa saja yang diverifikasi?",
    a: "Identity check (KTP, selfie, NPWP), business review (legalitas, akta perusahaan, izin usaha), dan dokumen proyek (SPK, RAB, proposal). Semua dokumen wajib dalam format PDF atau gambar, maksimal 10 MB.",
    cat: "KYC",
  },
  {
    q: "Berapa lama proses verifikasi KYC?",
    a: "Proses verifikasi biasanya selesai dalam 1×24 jam kerja setelah semua dokumen terupload dengan lengkap. Notifikasi email otomatis dikirim saat status KYC berubah.",
    cat: "KYC",
  },
  {
    q: "Bagaimana hasil verifikasi ditampilkan?",
    a: "Tiga status utama: Approved (akun aktif / proyek listing terbuka), Revision Needed (dokumen perlu diperbaiki), atau Rejected (tidak memenuhi syarat). Investor hanya melihat listing yang sudah Approved.",
    cat: "Proyek",
  },
  {
    q: "Apakah profil bisa diubah setelah KYC verified?",
    a: "Bisa. Profil dapat diperbarui kapan saja. Namun perubahan profil akan mereset status KYC ke Menunggu Verifikasi dan admin akan melakukan review ulang sebelum akun aktif kembali.",
    cat: "KYC",
  },
  {
    q: "Dokumen apa yang dibutuhkan investor untuk KYC?",
    a: "Untuk akun Pribadi: KTP, NPWP, foto selfie dengan KTP, dan buku tabungan. Untuk Badan Usaha: akta perusahaan, NPWP, SIUP/NIB, buku tabungan, dan KTP direksi.",
    cat: "Investor",
  },
];

const CAT_COLOR = {
  Umum:     { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#16a34a" },
  KYC:      { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe", dot: "#3b82f6" },
  Proyek:   { bg: "#fef9c3", text: "#854d0e", border: "#fde68a", dot: "#ca8a04" },
  Investor: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe", dot: "#7c3aed" },
};

function CatBadge({ cat }) {
  const c = CAT_COLOR[cat] || CAT_COLOR.Umum;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black shrink-0"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {cat}
    </span>
  );
}

function Item({ item, index, open, onToggle }) {
  return (
    <div className={[
      "rounded-2xl border bg-white overflow-hidden transition-all duration-200",
      open ? "border-green-300 shadow-sm shadow-green-100" : "border-slate-200 hover:border-green-200",
    ].join(" ")}>

      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-5 py-5 text-left"
      >
        {/* Number */}
        <span className={[
          "shrink-0 mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-black transition-colors",
          open ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500",
        ].join(" ")}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question */}
        <span className="flex-1 text-sm font-black text-slate-900 leading-snug">
          {item.q}
        </span>

        {/* Right side: badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block">
            <CatBadge cat={item.cat} />
          </span>
          <div className={[
            "h-7 w-7 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0",
            open ? "border-green-500 bg-green-50 text-green-600 rotate-180" : "border-slate-200 bg-slate-50 text-slate-500",
          ].join(" ")}>
            <svg className="h-4 w-4 transition-transform duration-200" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Answer — smooth height with max-height trick */}
      <div className={[
        "overflow-hidden transition-all duration-300 ease-in-out",
        open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}>
        <div className="px-5 pb-5 pl-[52px]">
          {/* Left accent line */}
          <div className="relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-green-200" />
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              {item.a}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function FAQ({ brand, items }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [catFilter, setCatFilter] = useState("Semua");

  /* Merge passed items with our extended set if needed */
  const source = items && items.length > 0
    ? items.map((it, i) => ({ ...it, cat: FAQ_EXTENDED[i]?.cat || "Umum" }))
    : FAQ_EXTENDED;

  const cats = ["Semua", ...Array.from(new Set(source.map((i) => i.cat)))];
  const filtered = catFilter === "Semua" ? source : source.filter((i) => i.cat === catFilter);

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section id="faq" className="py-16 md:py-24" style={{ background: "linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%)" }}>
      <div className="mx-auto max-w-[1200px] px-5">

        {/* Header — 2 col on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* Left sticky header */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-extrabold text-green-800 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Pertanyaan yang{" "}
              <span className="text-green-600">sering ditanyakan.</span>
            </h2>
            <p className="mt-4 text-sm font-semibold text-slate-500 leading-relaxed">
              Hal-hal yang sering ditanyakan seputar proses KYC, verifikasi, dan pendanaan di Fondofund.
            </p>

            {/* Category filter */}
            <div className="mt-6 flex flex-row lg:flex-col flex-wrap gap-2">
              {cats.map((cat) => {
                const cc = cat === "Semua" ? null : CAT_COLOR[cat];
                const active = catFilter === cat;
                return (
                  <button key={cat} onClick={() => { setCatFilter(cat); setOpenIndex(0); }}
                    className={[
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all text-left",
                      active
                        ? "border-green-500 bg-green-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700",
                    ].join(" ")}>
                    {cc && (
                      <span className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: active ? "#fff" : cc.dot }} />
                    )}
                    {cat}
                    <span className={[
                      "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-black",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                    ].join(" ")}>
                      {cat === "Semua" ? source.length : source.filter((i) => i.cat === cat).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Still got questions */}
            <div className="mt-8 hidden lg:block rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="text-sm font-black text-green-900 mb-1">Masih ada pertanyaan?</div>
              <div className="text-xs font-semibold text-green-700 mb-4">
                Tim kami siap membantu Anda memahami proses lebih lanjut.
              </div>
              <a href="#demo"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white hover:bg-green-700 transition active:scale-95">
                Hubungi Kami
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-8 space-y-3">
            {filtered.map((item, i) => (
              <Item
                key={item.q}
                item={item}
                index={i}
                open={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}

            {/* Mobile CTA */}
            <div className="mt-6 block lg:hidden rounded-2xl border border-green-200 bg-green-50 p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-green-900">Masih ada pertanyaan?</div>
                <div className="text-xs font-semibold text-green-700 mt-0.5">Tim kami siap membantu.</div>
              </div>
              <a href="#demo"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white hover:bg-green-700 transition">
                Hubungi
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}