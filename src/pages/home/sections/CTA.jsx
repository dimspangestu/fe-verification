// pages/home/sections/CTA.jsx
import React from "react";

export default function CTA({ brand }) {
  return (
    <section id="demo" className="py-16">
      <div className="mx-auto max-w-[1000px] px-5">
        <div
          className="rounded-[36px] p-10 text-center text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <h2 className="text-3xl md:text-4xl font-black">
            Siap memverifikasi penerima dana dengan lebih aman?
          </h2>

          <p className="mt-4 text-white/90 font-semibold max-w-xl mx-auto">
            Gunakan FondoFund untuk memastikan setiap listing yang muncul ke
            investor sudah melalui proses verifikasi yang transparan.
          </p>

          <div className="mt-8 flex justify-center gap-3 flex-wrap">

            <button className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-extrabold">
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}