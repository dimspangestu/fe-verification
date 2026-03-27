// pages/home/sections/WhyFondoFund.jsx
import React from "react";

export default function WhyFondoFund({ brand }) {
  return (
    <section className="py-14 md:py-18" style={{ backgroundColor: brand.soft }}>
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="rounded-[34px] border border-black/10 bg-white p-7 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                Kenapa FondoFund
              </div>
              <h3 className="mt-4 text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Investor butuh instrument investasi terpercaya. Customer butuh transparansi.
              </h3>
              <p className="mt-3 text-slate-600 font-semibold leading-relaxed">
                FondoFund memastikan dua sisi bertemu di titik yang aman: verifikasi identitas, validasi bisnis, dan
                penilaian risiko — semuanya terdokumentasi.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { t: "Kurangi Fraud", d: "Risk & fraud check untuk mengurangi kasus data palsu." },
                { t: "Percepat Funding", d: "Investor cepat memilih karena listing sudah tersaring." },
                { t: "SOP Konsisten", d: "Checklist & workflow meminimalkan human error." },
                { t: "Audit Trail", d: "Setiap aksi reviewer tercatat, siap untuk audit." },
              ].map((x) => (
                <div key={x.t} className="rounded-[26px] border border-black/10 bg-slate-50 p-5">
                  <div className="text-sm font-black text-slate-900">{x.t}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">{x.d}</div>
                  <div className="mt-4 text-xs font-extrabold" style={{ color: brand.primary }}>
                    Explore →
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-8 rounded-[28px] border border-black/10 p-6 text-white"
            style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})` }}
          >
            <div className="text-xl font-black">Ready untuk bikin alur verifikasi seperti gambar itu?</div>
            <div className="mt-2 text-sm font-semibold text-white/85">
              Kita bisa mapping flow + status + role admin/reviewer sesuai kebutuhan fondofund.
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold"
                style={{ color: brand.primary }}
              >
                Request Demo
              </a>
              <a
                href="#alur"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/10"
              >
                Lihat Alur
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}