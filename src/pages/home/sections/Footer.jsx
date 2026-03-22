import React from "react";
import logo from "../../../assets/newlogo.png";
import Link from "next/link";

export default function Footer({ brand }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3">
             <img
              src={logo.src}
              alt={brand.name}
              className="h-10 w-auto"
            />
          </Link>
          </div>

          <div>
            <div className="font-black text-slate-900">Navigation</div>

            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>
                <a href="#alur">Alur</a>
              </li>
              <li>
                <a href="#fitur">Fitur</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-black text-slate-900">Contact</div>

            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>support@{brand.domain}</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center text-xs font-semibold text-slate-500">
          © {year} {brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}   