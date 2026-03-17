import React from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
      {children}
    </span>
  );
}

export default function Pricing({ brand, pricing = [] }) {
  return (
    <section id="pricing" className="py-14 md:py-18">
      <div className="mx-auto max-w-[1200px] px-5">

        <div className="text-center max-w-2xl mx-auto">
          <Badge>Paket Harga</Badge>

          <h2 className="mt-4 text-3xl md:text-4xl font-black text-slate-900">
            Pilih paket yang sesuai kebutuhan
          </h2>

          <p className="mt-3 text-slate-600 font-semibold">
            Dari MVP hingga enterprise compliance.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">

          {pricing?.map((p, i) => (
            <div
              key={i}
              className={`rounded-[28px] border p-6 ${
                p.highlight
                  ? "border-black/20 shadow-lg"
                  : "border-black/10"
              } bg-white`}
            >
              <div className="text-sm font-extrabold text-slate-600">
                {p.name}
              </div>

              <div className="mt-2 text-3xl font-black text-slate-900">
                {p.price}
                <span className="text-base font-semibold text-slate-500">
                  {p.period}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600 font-semibold">
                {p.desc}
              </p>

              <ul className="mt-6 space-y-2">
                {p.items?.map((item, idx) => (
                  <li key={idx} className="text-sm font-semibold text-slate-700">
                    • {item}
                  </li>
                ))}
              </ul>

              <button
                className="mt-6 w-full rounded-2xl py-3 text-sm font-extrabold text-white"
                style={{ backgroundColor: brand?.primary || "#0B2A3A" }}
              >
                {p.cta}
              </button>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}