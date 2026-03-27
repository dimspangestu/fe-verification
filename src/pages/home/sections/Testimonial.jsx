import React, { useState, useEffect, useRef, useCallback } from "react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Budi Hartono",
    role: "Direktur Utama",
    company: "PT Karya Maju Bersama",
    type: "vendor",
    typeLabel: "investee",
    avatar: "BH",
    rating: 5,
    text: "Proses KYC yang saya bayangkan bakal ribet ternyata straightforward. Upload dokumen, tunggu review, dan dalam 1 hari kerja sudah verified. Sekarang proyek saya sudah bisa didanai investor.",
    highlight: "1 hari kerja sudah verified",
  },
  {
    id: 2,
    name: "Sari Dewi Kusuma",
    role: "Fund Manager",
    company: "Kusuma Capital Group",
    type: "investor",
    typeLabel: "Investor",
    avatar: "SK",
    rating: 5,
    text: "Yang saya suka dari Fondofund adalah ketenangan pikiran. Setiap proyek yang muncul di listing sudah melewati verifikasi ketat. Saya bisa fokus analisis return, bukan khawatir soal legalitas vendor.",
    highlight: "fokus analisis return",
  },
  {
    id: 3,
    name: "Ahmad Fauzan",
    role: "CEO & Founder",
    company: "CV Infrastruktur Nusantara",
    type: "vendor",
    typeLabel: "investee",
    avatar: "AF",
    rating: 5,
    text: "Dashboard investee sangat informatif. Saya bisa pantau berapa investor yang sudah masuk, progress funding, dan status proyek secara real-time. Transparansinya bikin investor lebih percaya.",
    highlight: "transparansi bikin investor percaya",
  },
  {
    id: 4,
    name: "Rina Marliana",
    role: "Investment Analyst",
    company: "PT Prospera Investama",
    type: "investor",
    typeLabel: "Investor",
    avatar: "RM",
    rating: 5,
    text: "Dokumen proyek bisa saya preview langsung di platform sebelum memutuskan untuk mendanai. Detail RAB, SPK, semua ada. Ini level transparansi yang tidak saya temukan di platform lain.",
    highlight: "preview dokumen sebelum mendanai",
  },
  {
    id: 5,
    name: "Dimas Prasetyo",
    role: "Direktur Keuangan",
    company: "PT Properti Sukses Indonesia",
    type: "vendor",
    typeLabel: "investee",
    avatar: "DP",
    rating: 5,
    text: "Notifikasi email langsung masuk begitu status KYC berubah. Tidak perlu bolak-balik cek dashboard. Tim admin Fondofund juga responsif dan memberikan catatan yang jelas kalau ada dokumen yang perlu diperbaiki.",
    highlight: "notifikasi email langsung",
  },
  {
    id: 6,
    name: "Lestari Wulandari",
    role: "Portfolio Manager",
    company: "Wulandari Family Office",
    type: "investor",
    typeLabel: "Investor",
    avatar: "LW",
    rating: 5,
    text: "Fixed return yang terprediksi dan proses verifikasi yang transparan membuat saya loyal ke Fondofund. Sudah 3 proyek saya danai dan semuanya berjalan sesuai jadwal.",
    highlight: "3 proyek berjalan sesuai jadwal",
  },
];

const TYPE_COLOR = {
  vendor:   { bg: "#dcfce7", text: "#166534", dot: "#16a34a", border: "#bbf7d0" },
  investor: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", border: "#bfdbfe" },
};

const AVATAR_BG = ["#dcfce7","#d1fae5","#ecfdf5","#f0fdf4","#d1fae5","#dcfce7"];
const AVATAR_TX = ["#166534","#065f46","#047857","#15803d","#065f46","#166534"];

/* How many cards visible per breakpoint — we compute this in JS */
function getVisible() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function Card({ t, idx }) {
  const tc = TYPE_COLOR[t.type];
  const parts = t.text.split(t.highlight);
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 flex flex-col gap-4 select-none">
      <div className="text-5xl font-black leading-none text-green-100 select-none" aria-hidden>"</div>
      <p className="text-sm font-semibold text-slate-700 leading-relaxed -mt-4 flex-1">
        {parts.map((part, i, arr) =>
          i < arr.length - 1 ? (
            <React.Fragment key={i}>
              {part}
              <mark className="bg-green-100 text-green-800 font-black rounded px-0.5 not-italic">
                {t.highlight}
              </mark>
            </React.Fragment>
          ) : part
        )}
      </p>
      <Stars />
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-xs font-black"
          style={{ backgroundColor: AVATAR_BG[idx % 6], color: AVATAR_TX[idx % 6] }}>
          {t.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-slate-900 truncate">{t.name}</div>
          <div className="text-xs font-semibold text-slate-500 truncate">{t.role} · {t.company}</div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black"
          style={{ backgroundColor: tc.bg, color: tc.text, borderColor: tc.border }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tc.dot }} />
          {t.typeLabel}
        </span>
      </div>
    </div>
  );
}

export default function Testimonials({ brand }) {
  const [current,    setCurrent]    = useState(0);
  const [visible,    setVisible]    = useState(3);
  const [paused,     setPaused]     = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [dragStart,  setDragStart]  = useState(0);
  const trackRef   = useRef(null);
  const timerRef   = useRef(null);

  const total  = TESTIMONIALS.length;
  const maxIdx = total - visible;

  /* Sync visible on resize */
  useEffect(() => {
    function onResize() { setVisible(getVisible()); }
    setVisible(getVisible());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Clamp current when visible changes */
  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, total - visible)));
  }, [visible, total]);

  const next = useCallback(() => {
    setCurrent((c) => c >= maxIdx ? 0 : c + 1);
  }, [maxIdx]);

  const prev = useCallback(() => {
    setCurrent((c) => c <= 0 ? maxIdx : c - 1);
  }, [maxIdx]);

  /* Auto-play */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  /* Drag / swipe */
  function onDragStart(clientX) {
    setDragging(true);
    setDragStart(clientX);
    clearInterval(timerRef.current);
  }
  function onDragEnd(clientX) {
    if (!dragging) return;
    setDragging(false);
    const diff = dragStart - clientX;
    if (diff > 50)  next();
    if (diff < -50) prev();
    if (!paused) timerRef.current = setInterval(next, 4000);
  }

  const pct = visible > 0 ? 100 / visible : 33.33;
  const translateX = -(current * pct);

  return (
    <section id="testimoni" className="py-16 md:py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)" }}>
      <div className="mx-auto max-w-[1200px] px-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-extrabold text-green-800 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Testimoni
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Dipercaya investee{" "}
              <span className="text-green-600">dan investor.</span>
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-500 leading-relaxed">
              Pengalaman nyata dari kedua sisi platform — vendor yang mendapat pendanaan dan investor yang mendanai dengan aman.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 shrink-0">
            {[
              { value: "98%",  label: "Kepuasan"        },
              { value: "1 hr", label: "Rata-rata KYC"   },
              { value: "5★",   label: "Rating platform" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-green-700">{s.value}</div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5 whitespace-nowrap">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel viewport */}
        <div className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>

          {/* Track */}
          <div
            ref={trackRef}
            className="overflow-hidden"
            onMouseDown={(e) => onDragStart(e.clientX)}
            onMouseUp={(e) => onDragEnd(e.clientX)}
            onMouseLeave={(e) => { if (dragging) onDragEnd(e.clientX); }}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          >
            <div
              className="flex"
              style={{
                transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateX(${translateX}%)`,
                willChange: "transform",
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={t.id} className="shrink-0 px-2.5"
                  style={{ width: `${pct}%` }}>
                  <Card t={t} idx={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={() => { prev(); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
            className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-green-400 hover:text-green-600 transition z-10">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => { next(); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-green-400 hover:text-green-600 transition z-10">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dots + progress */}
        <div className="mt-7 flex items-center justify-center gap-3">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
              className={[
                "rounded-full transition-all duration-300",
                i === current
                  ? "h-2.5 w-8 bg-green-600"
                  : "h-2.5 w-2.5 bg-slate-200 hover:bg-green-300",
              ].join(" ")}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="mt-4 h-0.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${((current + visible) / total) * 100}%` }}
          />
        </div>

      </div>
    </section>
  );
}