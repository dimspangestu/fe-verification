// pages/home/sections/Features.jsx
import React from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
      {children}
    </span>
  );
}

function Icon({ name, className = "h-6 w-6" }) {
  const common = { className, fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "shield":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "workflow":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M7 7h10v4H7V7z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 13h10v4H7v-4z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 13h8M8 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "radar":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 21a9 9 0 1 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 3v9l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "link":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 15V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 15v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Features({ brand, features }) {
  return (
    <section id="fitur" className="py-14 md:py-18">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Badge>Fitur Utama</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Keren, cepat, dan aman untuk proses verifikasi
            </h2>
            <p className="mt-3 text-slate-600 font-semibold leading-relaxed max-w-2xl">
              Semua fitur disusun mengikuti alur bisnis: customer submit → verifikasi → listing ke investor.
            </p>
          </div>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
            style={{ backgroundColor: brand.primary }}
          >
            Request Demo
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-[28px] border border-black/10 bg-white p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl grid place-items-center text-white" style={{ backgroundColor: brand.primary }}>
                  <Icon name={f.icon} />
                </div>
                <div className="text-base font-black text-slate-900">{f.title}</div>
              </div>
              <div className="mt-3 text-sm leading-relaxed text-slate-600 font-semibold">{f.desc}</div>
              <div className="mt-4 text-xs font-extrabold text-slate-500">
                Output: status + catatan + audit trail
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}