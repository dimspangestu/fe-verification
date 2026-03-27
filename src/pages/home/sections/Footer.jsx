// pages/home/sections/Footer.jsx
import React from "react";
import logo from "../../../assets/newlogo.png";
import Link from "next/link";

export default function Footer({ brand }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-green-700/30" style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)" }}>
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <img src={logo.src} alt={brand.name} className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-4 text-sm font-semibold text-green-200 leading-relaxed max-w-xs">
              Platform verifikasi yang menghubungkan investee dengan investor secara transparan dan akuntabel.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-sm font-black text-white mb-4">Navigation</div>
            <ul className="space-y-2.5">
              {[
                { label: "Alur",      href: "/alur"     },
                { label: "Fitur",     href: "/#fitur"   },
                { label: "Testimoni", href: "/#testimoni"},
                { label: "FAQ",       href: "/#faq"     },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href}
                    className="flex items-center gap-2 text-sm font-semibold text-green-200 hover:text-white transition group">
                    <span className="h-1 w-1 rounded-full bg-green-500 group-hover:bg-white transition" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-sm font-black text-white mb-4">Contact</div>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm font-semibold text-green-200">
                <svg className="h-4 w-4 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                support.fondofund@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-green-200">
                <svg className="h-4 w-4 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                Depok, Jawa Barat
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-green-700/50" />

        {/* Bottom */}
        <div className="mt-6 text-center text-xs font-semibold text-green-300">
          © {year} {brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}