// pages/home/sections/Flow.jsx
import React from "react";

function Badge({ tone = "slate", children }) {
  const map = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${map[tone]}`}>
      {children}
    </span>
  );
}

function Card({ title, subtitle, items, tone = "slate" }) {
  const toneBar = {
    slate: "bg-slate-900/5",
    emerald: "bg-emerald-600/10",
    amber: "bg-amber-600/10",
  }[tone];

  return (
    <div className="rounded-[28px] border border-black/10 bg-white overflow-hidden">
      <div className={`px-5 py-4 ${toneBar}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-slate-900">{title}</div>
            <div className="text-xs font-semibold text-slate-600">{subtitle}</div>
          </div>
          <Badge tone={tone}>{tone === "emerald" ? "Customer" : tone === "amber" ? "Investor" : "Verifikator"}</Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {items.map((x) => (
          <div key={x.t} className="rounded-2xl border border-black/10 bg-slate-50 p-4">
            <div className="text-sm font-extrabold text-slate-900">{x.t}</div>
            <div className="mt-1 text-xs font-semibold text-slate-600 leading-relaxed">{x.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Flow({ brand, flowSteps }) {
  return (
    <section id="alur" className="py-14 md:py-18" style={{ backgroundColor: brand.soft }}>
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Badge>Alur Bisnis</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              FondoFund sebagai verifikator, jembatan Customer ↔ Investor
            </h2>
            <p className="mt-3 text-slate-600 font-semibold leading-relaxed max-w-2xl">
              Customer submit data & dokumen, FondoFund melakukan verifikasi 3 lapis, lalu investor memilih listing yang sudah
              approved.
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

        {/* Grid cards + arrows */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-4">
            <Card
              tone="emerald"
              title="Customer (Penerima Dana)"
              subtitle="Register • Profil Bisnis • Dokumen"
              items={flowSteps.customer}
            />
          </div>

          <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
            <div className="h-12 w-12 rounded-2xl border border-black/10 bg-white grid place-items-center text-slate-700 font-black">
              →
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card
              tone="slate"
              title="FondoFund (Verifikator)"
              subtitle="Identity • Business • Risk"
              items={flowSteps.verifikator}
            />
          </div>

          <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
            <div className="h-12 w-12 rounded-2xl border border-black/10 bg-white grid place-items-center text-slate-700 font-black">
              →
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card
              tone="amber"
              title="Pemberi Dana (Investor)"
              subtitle="Top up • Select • Fund"
              items={flowSteps.investor}
            />
          </div>
        </div>

        {/* Results bar */}
        <div className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-black text-slate-900">Hasil Verifikasi</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                Menentukan apakah listing layak / tidak layak didanai.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-extrabold text-emerald-800">
                KYC/LISTING APPROVED
              </span>
              <span className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-extrabold text-amber-800">
                REVISION NEEDED
              </span>
              <span className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-extrabold text-rose-800">
                REJECTED / BLOCKED
              </span>
            </div>
          </div>
        </div>

        {/* Image reference */}
        <div className="mt-8 rounded-[28px] border border-black/10 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-black/5">
            <div className="text-sm font-black text-slate-900">Referensi Alur (gambar)</div>
            <div className="text-xs font-semibold text-slate-600">
              Taruh file di <b>public/flow-verification.jpg</b>
            </div>
          </div>
          <img
            src="/flow-verification.jpg"
            alt="Alur Admin Verification - Customer - Investor"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}