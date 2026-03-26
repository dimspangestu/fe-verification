// pages/home/sections/Features.jsx
import React, { useState } from "react";

/* ─── Icon set ─── */
function Icon({ name }) {
  const p = { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "workflow":
      return (
        <svg {...p}>
          <rect x="3" y="5" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="3" y="14" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M11 7.5h3a2 2 0 0 1 2 2V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M16 12l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 16.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "doc":
      return (
        <svg {...p}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "radar":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 12l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      );
    case "link":
      return (
        <svg {...p}>
          <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 15V9M12 15V6M16 15v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

/* ─── Feature config — icon color & output tag per feature ─── */
const FEATURE_META = {
  shield:   { accent: "#16a34a", light: "#dcfce7", tag: "KYC Compliant"       },
  workflow: { accent: "#15803d", light: "#f0fdf4", tag: "SLA Tracking"         },
  doc:      { accent: "#166534", light: "#dcfce7", tag: "Versioning & Audit"   },
  radar:    { accent: "#0f6e56", light: "#d1fae5", tag: "Fraud Detection"      },
  link:     { accent: "#16a34a", light: "#f0fdf4", tag: "Listing Bridge"       },
  chart:    { accent: "#15803d", light: "#dcfce7", tag: "Real-time Dashboard"  },
};

/* ─── Single feature card ─── */
function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const meta = FEATURE_META[feature.icon] || FEATURE_META.shield;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "group relative rounded-3xl border bg-white p-6 transition-all duration-200 cursor-default",
        hovered ? "border-green-300 shadow-lg shadow-green-100/50 -translate-y-0.5" : "border-slate-200",
      ].join(" ")}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1 rounded-full transition-all duration-200"
        style={{ backgroundColor: hovered ? meta.accent : "#e2e8f0" }}
      />

      {/* Number */}
      <div className="mb-4 text-[11px] font-black tracking-widest uppercase"
        style={{ color: meta.accent }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Icon */}
      <div
        className="mb-4 h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: hovered ? meta.accent : meta.light, color: hovered ? "#fff" : meta.accent }}
      >
        <Icon name={feature.icon} />
      </div>

      {/* Title */}
      <div className="text-base font-black text-slate-900 leading-snug mb-2">
        {feature.title}
      </div>

      {/* Desc */}
      <div className="text-sm font-semibold text-slate-500 leading-relaxed mb-5">
        {feature.desc}
      </div>

      {/* Output tag */}
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: meta.accent }}
        />
        <span className="text-[11px] font-black" style={{ color: meta.accent }}>
          {meta.tag}
        </span>
      </div>
    </div>
  );
}

/* ─── Section ─── */
export default function Features({ brand, features }) {
  return (
    <section id="fitur" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-[1200px] px-5">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-extrabold text-green-800 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Fitur Utama
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Semua yang dibutuhkan untuk verifikasi{" "}
              <span className="text-green-600">end-to-end.</span>
            </h2>
          </div>
          <div>
            <p className="text-slate-500 font-semibold leading-relaxed">
              Dari identity check hingga risk screening — setiap langkah tercatat dengan audit trail lengkap, sehingga investor hanya melihat listing yang sudah terverifikasi.
            </p>
            {/* Status pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { label: "Approve",  bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
                { label: "Revision", bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
                { label: "Reject",   bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
              ].map((s) => (
                <span key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black"
                  style={{ backgroundColor: s.bg, color: s.text, borderColor: s.dot + "55" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  {s.label}
                </span>
              ))}
              <span className="text-xs font-semibold text-slate-400 self-center ml-1">
                — setiap output teraudit
              </span>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}