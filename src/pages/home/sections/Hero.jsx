// pages/home/sections/Hero.jsx
import React from "react";

function ArrowRight({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
      {children}
    </span>
  );
}

export default function Hero({ brand, stats }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 15% 10%, rgba(18,185,129,0.18), transparent 60%), radial-gradient(900px 500px at 85% 0%, rgba(11,42,58,0.12), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-5 pt-14 md:pt-20 pb-10 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <Badge>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Verifikator (Bridge) Penerima Dana ↔ Investor
            </Badge>

            <h1 className="mt-5 text-[38px] md:text-[56px] leading-[1.05] font-black tracking-tight text-slate-900">
              FondoFund memverifikasi{" "}
              <span style={{ color: brand.primary }}>penerima dana</span>{" "}
              agar investor lebih aman untuk mendanai.
            </h1>

            {/* <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-600 font-semibold">
              Alur bisnisnya: Customer submit data & dokumen → FondoFund lakukan identity check, business review,
              risk assessment → hasil verifikasi menentukan listing layak didanai atau tidak.
            </p> */}

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
                style={{ backgroundColor: brand.primary }}
              >
                Request Demo <ArrowRight />
              </a>
              <a
                href="#alur"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:shadow-sm"
              >
                Lihat Alur
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.k} className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs font-extrabold text-slate-500">{s.k}</div>
                  <div className="mt-1 text-sm md:text-base font-black text-slate-900">{s.v}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{s.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              {["Approve/Revision/Reject", "Audit Trail", "API-ready Integrations"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-[34px] border border-black/10 bg-white shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="text-sm font-extrabold text-slate-600">Ringkasan Alur</div>
                <div className="mt-3 text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  Customer → FondoFund → Investor
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {[
                    { t: "Customer submit profil & dokumen", s: "KTP, selfie, legalitas, laporan usaha" },
                    { t: "FondoFund verifikasi & scoring", s: "Verifikasi Objek Investasi" },
                    { t: "Investor mendanai listing approved", s: "Hanya yang layak didanai ditampilkan" },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-black/10 bg-slate-50 p-4">
                      <div className="text-sm font-black text-slate-900">{x.t}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">{x.s}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs font-extrabold text-slate-500">Hasil Verifikasi</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-extrabold text-emerald-800">
                      APPROVE
                    </span>
                    <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-extrabold text-amber-800">
                      REVISION
                    </span>
                    <span className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-extrabold text-rose-800">
                      REJECT
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-25" style={{ backgroundColor: brand.accent }} />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-15" style={{ backgroundColor: brand.primary }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}