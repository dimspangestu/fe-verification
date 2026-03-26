// pages/alur.jsx
import React, { useState } from "react";
import Link from "next/link";
import TopNav from "../home/sections/TopNav";
import Footer from "../home/sections/Footer";
import Hero from "../home/sections/Hero"
const BRAND = {
  name:    "FondoFund",
  domain:  "fondofund.com",
  primary: "#0B2A3A",
  accent:  "#12B981",
  soft:    "#F3F7FA",
};

/* ─── Flow data ─── */
const FLOWS = [
  {
    id: "vendor",
    role: "Penerima Dana",
    tagline: "Submit & Verifikasi",
    color: "emerald",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M3 21h18M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      {
        n: "01",
        title: "Daftar & Lengkapi Profil",
        desc: "Isi data perusahaan, rekening bank, nama PIC, dan informasi usaha. Profil dapat diperbarui kapan saja — perubahan akan memicu review ulang KYC.",
        docs: [],
      },
      {
        n: "02",
        title: "Upload Dokumen KYC",
        desc: "Upload 4 dokumen wajib untuk verifikasi. Setelah semua terupload, status otomatis berubah ke Menunggu Verifikasi.",
        docs: ["Buku Tabungan", "NPWP", "Akta Perusahaan", "Izin Usaha (SIUP/NIB)"],
      },
      {
        n: "03",
        title: "Tunggu Verifikasi Admin",
        desc: "Admin Fondofund mereview dokumen dan memverifikasi identitas bisnis. Proses 1×24 jam kerja. Email notifikasi dikirim saat status berubah.",
        docs: [],
      },
      {
        n: "04",
        title: "Submit Proposal Proyek",
        desc: "Setelah KYC verified, submit proposal proyek. Sistem akan generate PDF draft perjanjian vendor untuk ditandatangani dan di-upload kembali di halaman Status.",
        docs: ["Surat Penunjukan + SPK (PDF)", "RAB / Rencana Anggaran Biaya (PDF)", "Dokumen pendukung (opsional, PDF)"],
      },
      {
        n: "05",
        title: "Admin Kurasi Proyek",
        desc: "Admin mengevaluasi proposal: kelengkapan dokumen, nilai pendanaan, tenor, dan kelayakan. Proyek yang disetujui akan tampil di listing investor.",
        docs: [],
      },
      {
        n: "06",
        title: "Pantau Pendanaan & Cicilan",
        desc: "Lacak progress pendanaan, jumlah investor aktif, dan status pembayaran cicilan return dari dashboard Penerima Dana.",
        docs: [],
      },
    ],
  },
  {
    id: "fondofund",
    role: "Fondofund",
    tagline: "Verifikasi & Kurasi",
    color: "green",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      {
        n: "01",
        title: "Review KYC Penerima Dana",
        desc: "Admin membuka dashboard KYC Vendor, memeriksa dokumen yang diupload, dan memverifikasi kelayakan bisnis penerima dana.",
        docs: [],
      },
      {
        n: "02",
        title: "Approve / Reject KYC Vendor",
        desc: "Admin dapat Approve, Reject (dengan catatan alasan), atau meminta dokumen ulang. Email notifikasi otomatis terkirim ke vendor.",
        docs: [],
      },
      {
        n: "03",
        title: "Review KYC Investor",
        desc: "Proses yang sama untuk investor — verifikasi identitas pribadi atau perusahaan sebelum investor bisa mendanai proyek.",
        docs: [],
      },
      {
        n: "04",
        title: "Approve / Reject KYC Investor",
        desc: "Investor yang KYC-nya disetujui mendapat akses penuh ke halaman Projects dan My Fundings. Email notifikasi otomatis terkirim.",
        docs: [],
      },
      {
        n: "05",
        title: "Kurasi & Approval Proyek",
        desc: "Admin mengevaluasi proposal dari vendor yang sudah verified: nilai pendanaan, tenor, fixed return, dan kelengkapan dokumen proyek.",
        docs: [],
      },
      {
        n: "06",
        title: "Kelola Pendanaan & Disbursement",
        desc: "Admin memantau progress funding, mengkonfirmasi pembayaran masuk, mengelola disbursement dana ke penerima, dan riwayat transaksi.",
        docs: [],
      },
    ],
  },
  {
    id: "investor",
    role: "Investor",
    tagline: "Dana & Pantau",
    color: "teal",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    steps: [
      {
        n: "01",
        title: "Daftar & Lengkapi Profil",
        desc: "Isi profil investor: tipe akun (Pribadi / Badan Usaha), data diri, dan informasi rekening bank untuk pencairan return.",
        docs: [],
      },
      {
        n: "02",
        title: "Upload Dokumen KYC",
        desc: "Upload dokumen sesuai tipe akun. Setelah semua dokumen terupload, status otomatis berubah ke Menunggu Verifikasi.",
        docs: ["Pribadi: KTP, NPWP, Selfie + KTP, Buku Tabungan", "Badan Usaha: Akta, NPWP, SIUP/NIB, Buku Tabungan, KTP Direksi"],
      },
      {
        n: "03",
        title: "Tunggu Verifikasi Admin",
        desc: "Admin memverifikasi identitas dan dokumen. Email notifikasi dikirim saat KYC disetujui atau ditolak.",
        docs: [],
      },
      {
        n: "04",
        title: "Akses Daftar Proyek",
        desc: "Setelah KYC verified, akses halaman Projects. Tampil semua proyek yang sudah dikurasi Fondofund: funding open, closed, berjalan, hingga selesai.",
        docs: [],
      },
      {
        n: "05",
        title: "Review & Danai Proyek",
        desc: "Baca detail proyek, lihat dokumen (SPK, RAB), progress funding, imbal hasil, dan tenor. Setujui perjanjian dan masukkan nominal pendanaan.",
        docs: [],
      },
      {
        n: "06",
        title: "Pantau Return & Riwayat",
        desc: "Di halaman My Fundings, lacak semua investasi aktif, status cicilan, dan total return yang sudah diterima.",
        docs: [],
      },
    ],
  },
];

const COLOR = {
  emerald: {
    bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500", num: "bg-emerald-500", line: "bg-emerald-200", icon: "bg-emerald-100 text-emerald-700 border-emerald-200",
    tab: "border-emerald-500 bg-emerald-50 text-emerald-800", text: "text-emerald-700",
  },
  green: {
    bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-600", num: "bg-green-600", line: "bg-green-200", icon: "bg-green-100 text-green-700 border-green-200",
    tab: "border-green-600 bg-green-50 text-green-800", text: "text-green-700",
  },
  teal: {
    bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-800 border-teal-200",
    dot: "bg-teal-500", num: "bg-teal-500", line: "bg-teal-200", icon: "bg-teal-100 text-teal-700 border-teal-200",
    tab: "border-teal-500 bg-teal-50 text-teal-800", text: "text-teal-700",
  },
};

function StepRow({ step, color, last }) {
  const c = COLOR[color];
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={["h-9 w-9 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm", c.num].join(" ")}>
          {step.n}
        </div>
        {!last && <div className={["w-0.5 flex-1 mt-1.5 min-h-[24px]", c.line].join(" ")} />}
      </div>
      <div className={["mb-5 flex-1 rounded-2xl border p-4 min-w-0", c.bg, c.border].join(" ")}>
        <div className="text-sm font-black text-slate-900">{step.title}</div>
        <div className="mt-1 text-xs font-semibold text-slate-600 leading-relaxed">{step.desc}</div>
        {step.docs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {step.docs.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <span className={["h-1.5 w-1.5 rounded-full shrink-0", c.dot].join(" ")} />
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlurPage() {
  const [active, setActive] = useState("vendor");
  const flow = FLOWS.find((f) => f.id === active);

  return (
    <>
      <TopNav brand={BRAND} />
      <Hero brand={BRAND}/>
      <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%)" }}>

        {/* Page header */}
        <div className="mx-auto max-w-[1200px] px-5 pt-16 pb-8 md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-extrabold text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Alur Platform Lengkap
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Bagaimana Fondofund{" "}
            <span className="text-green-600">bekerja</span>
          </h1>
          <p className="mt-4 text-base md:text-lg font-semibold text-slate-500 leading-relaxed max-w-2xl">
            Detail lengkap setiap langkah untuk penerima dana, tim Fondofund, dan investor —
            mulai dari pendaftaran hingga pencairan return.
          </p>
        </div>

        {/* Overview strip */}
        <div className="mx-auto max-w-[1200px] px-5 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FLOWS.map((f) => {
              const c = COLOR[f.color];
              const isActive = active === f.id;
              return (
                <button key={f.id} onClick={() => setActive(f.id)}
                  className={[
                    "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md",
                    isActive ? `${c.tab} shadow-md border-2` : "border-slate-200 bg-white hover:border-slate-300",
                  ].join(" ")}>
                  <div className={["h-11 w-11 shrink-0 rounded-2xl border flex items-center justify-center", c.icon].join(" ")}>
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900">{f.role}</div>
                    <div className="text-xs font-semibold text-slate-500">{f.tagline}</div>
                    <div className={["text-[11px] font-bold mt-0.5", c.text].join(" ")}>{f.steps.length} langkah</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active flow detail */}
        <div className="mx-auto max-w-[1200px] px-5 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Steps */}
            <div className="lg:col-span-2">
              <div className={["rounded-3xl border-2 bg-white overflow-hidden", `border-${flow.color === "green" ? "green" : flow.color}-200`].join(" ")}>
                <div className={["px-6 py-5 flex items-center gap-4 border-b", COLOR[flow.color].bg, COLOR[flow.color].border].join(" ")}>
                  <div className={["h-11 w-11 shrink-0 rounded-2xl border flex items-center justify-center", COLOR[flow.color].icon].join(" ")}>
                    {flow.icon}
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{flow.role}</div>
                    <div className="text-xs font-semibold text-slate-500">{flow.tagline} · {flow.steps.length} langkah</div>
                  </div>
                </div>
                <div className="p-6">
                  {flow.steps.map((s, i) => (
                    <StepRow key={s.n} step={s} color={flow.color} last={i === flow.steps.length - 1} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">

              {/* Result card */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="text-sm font-black text-green-900 mb-3">Hasil Verifikasi Admin</div>
                {[
                  { label: "Approved",         cls: "bg-emerald-50 border-emerald-200 text-emerald-800", dot: "bg-emerald-500", note: "Akun aktif / proyek listing" },
                  { label: "Revision Needed",  cls: "bg-amber-50 border-amber-200 text-amber-800",       dot: "bg-amber-500",   note: "Perbaiki dokumen" },
                  { label: "Rejected",         cls: "bg-rose-50 border-rose-200 text-rose-800",           dot: "bg-rose-500",    note: "Tidak memenuhi syarat" },
                ].map((r) => (
                  <div key={r.label} className={["rounded-xl border px-3 py-2.5 mb-2", r.cls].join(" ")}>
                    <div className="flex items-center gap-2">
                      <span className={["h-1.5 w-1.5 rounded-full shrink-0", r.dot].join(" ")} />
                      <span className="text-xs font-black">{r.label}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5 pl-3.5">{r.note}</div>
                  </div>
                ))}
              </div>

              {/* Email notif */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center text-green-700">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">Notifikasi Email Otomatis</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500 leading-relaxed">
                    Dikirim saat status KYC approve / reject, dan saat perubahan email atau password.
                  </div>
                </div>
              </div>

              {/* Docs limit */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">Format Dokumen</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500 leading-relaxed">
                    KYC: PDF, JPG, PNG · Maks 10 MB<br/>
                    Proyek: PDF saja · Maks 10 MB
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-600 to-green-700 p-5 text-white">
                <div className="text-sm font-black mb-1">Siap memulai?</div>
                <div className="text-xs font-semibold text-green-100 leading-relaxed mb-4">
                  Daftar gratis dan lengkapi KYC untuk akses penuh platform.
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/auth/register"
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-green-800 hover:bg-green-50 transition">
                    Daftar Sekarang
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link href="/auth/login"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-black text-white hover:bg-white/20 transition">
                    Masuk ke Akun
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer brand={BRAND} />
    </>
  );
}