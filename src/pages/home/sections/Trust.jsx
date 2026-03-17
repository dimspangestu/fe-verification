// pages/home/sections/Trust.jsx
import React from "react";

export default function Trust({ brand }) {
  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="rounded-[28px] border border-black/10 bg-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm font-black text-slate-900">Kepercayaan investor dimulai dari verifikasi</div>
              <div className="mt-1 text-sm text-slate-600 font-semibold">
                FondoFund mengurangi risiko dengan proses verifikasi yang konsisten + audit trail.
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {["Identity", "Business", "Risk", "Audit"].map((x) => (
                <div
                  key={x}
                  className="rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-center text-xs font-extrabold text-slate-700"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 h-[1px] bg-black/5" />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: "Listing lebih berkualitas", d: "Hanya customer approved yang tampil ke investor." },
              { t: "Proses transparan", d: "Revision needed jelas apa yang harus dilengkapi." },
              { t: "Keputusan terdokumentasi", d: "Audit trail memudahkan monitoring & kontrol." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="text-sm font-black text-slate-900">{x.t}</div>
                <div className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">{x.d}</div>
                <div className="mt-4 text-xs font-extrabold" style={{ color: brand.primary }}>
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}