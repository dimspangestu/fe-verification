// pages/news/index.jsx
import React from "react";
import Link from "next/link";

// ✅ ganti path sesuai folder assets kamu
import news1 from "../../assets/masjid.jpg";
import news2 from "../../assets/masjid.jpg";
import news3 from "../../assets/masjid.jpg";

export default function NewsSection() {
  const posts = [
    {
      title: "Integrasi Teknologi di Masjid: DKM UIII Luncurkan Smart Mosque System",
      meta: "12 Februari 2026 • Admin IT Masjid",
      excerpt:
        "Sistem baru ini memungkinkan jamaah memonitor penggunaan dana umat secara real-time melalui dashboard interaktif di lobi utama.",
      image: news1?.src,
      href: "/news/1",
      category: "Inovasi",
    },
    {
      title: "Diskusi Panel Internasional: Peran Masjid Kampus dalam Diplomasi Budaya",
      meta: "10 Februari 2026 • Humas Kampus",
      excerpt:
        "Menghadirkan pembicara dari Universitas Al-Azhar Mesir dan Oxford University, mendiskusikan masjid sebagai jembatan peradaban.",
      image: news2?.src,
      href: "/news/2",
      category: "Akademik",
    },
    {
      title: "Penerimaan Santri Baru Program Tahfidz Eksklusif Mahasiswa 2026",
      meta: "08 Februari 2026 • Div. Dakwah",
      excerpt:
        "Program beasiswa khusus bagi mahasiswa UIII yang ingin menjadi hafidz Quran tanpa mengabaikan tugas-tugas akademik perkuliahan.",
      image: news3?.src,
      href: "/news/3",
      category: "Program",
    },
  ].filter((p) => p.image);

  return (
    <section id="news" className="py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3DD] px-4 py-2 text-xs font-extrabold tracking-wider text-[#B77910]">
            📰 WARTA &amp; ARTIKEL
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-[#083A57]">
            Berita <span className="text-[#E3A12B] italic">Terkini</span>
          </h2>
        </div>

        <div className="mt-10 space-y-10">
          {posts.map((p) => (
            <div
              key={p.title}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-4">
                <div className="rounded-[26px] overflow-hidden shadow-lg border border-black/5">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-48 md:h-56 object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#5C6B7A]">
                  <span className="inline-flex items-center gap-1 bg-[#EAF2F8] text-[#083A57] px-3 py-1 rounded-full">
                    {p.category}
                  </span>
                  <span className="opacity-80">{p.meta}</span>
                </div>

                <h3 className="mt-3 text-2xl font-extrabold text-[#083A57] leading-snug">
                  {p.title}
                </h3>
                <p className="mt-3 text-[#5C6B7A] leading-relaxed">
                  {p.excerpt}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-2 text-[#083A57] font-extrabold hover:underline"
                  >
                    Baca Selengkapnya <span>→</span>
                  </Link>

                  <button
                    type="button"
                    className="h-10 w-10 rounded-full bg-white border border-black/10 shadow-sm hover:bg-[#F6F8FB]"
                    aria-label="Bookmark"
                  >
                    🔖
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full bg-[#083A57] text-white font-extrabold px-6 py-3 shadow-lg hover:opacity-95"
          >
            Lihat Semua Artikel →
          </Link>
        </div>
      </div>
    </section>
  );
}
