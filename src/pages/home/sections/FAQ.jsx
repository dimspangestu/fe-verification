import React, { useState } from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
      {children}
    </span>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQ({ brand, items }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-14 md:py-18 bg-slate-50">
      <div className="mx-auto max-w-[900px] px-5">
        <div className="text-center">
          <Badge>Pertanyaan Umum</Badge>

          <h2 className="mt-4 text-3xl md:text-4xl font-black text-slate-900">
            FAQ tentang FondoFund
          </h2>

          <p className="mt-3 text-slate-600 font-semibold">
            Beberapa hal yang sering ditanyakan mengenai proses verifikasi
            penerima dana dan investor di FondoFund.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {items.map((f, i) => {
            const open = openIndex === i;

            return (
              <div
                key={f.q}
                className="rounded-2xl border border-black/10 bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between text-left p-5"
                >
                  <span className="font-black text-slate-900">{f.q}</span>
                  <Chevron open={open} />
                </button>

                {open && (
                  <div className="px-5 pb-5 text-sm font-semibold text-slate-600 leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Masih ada pertanyaan?
          </p>

          <a
            href="#demo"
            className="inline-flex mt-3 items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
            style={{ backgroundColor: brand.primary }}
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}