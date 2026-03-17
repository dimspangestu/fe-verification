// components/RamadhanThemeCalendar.jsx
"use client";

import { useMemo, useState } from "react";

const cx = (...a) => a.filter(Boolean).join(" ");

function formatID(date) {
  // pakai locale id-ID (di browser user Asia/Jakarta biasanya aman)
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function RamadhanThemeCalendar() {
  // ✅ UIII brand-ish palette
  const UIII_NAVY = "#083A57";
  const UIII_GOLD = "#E3A12B";
  const UIII_BG = "#F6F8FB";

  // ✅ start puasa: 18 Feb 2026 (bulan JS: 0=Jan, 1=Feb)
  const START_DATE = useMemo(() => new Date(2026, 1, 18), []);
  const TOTAL_DAYS = 30; // 1 bulan (30 hari)

  // ✅ template kegiatan (boleh kamu edit)
  const templates = useMemo(
    () => [
      { title: "Tarawih Perdana", time: "19:45 WIB", place: "Ruang Utama", note: "Kajian singkat selepas Isya." },
      { title: "Tadarus Malam", time: "20:45 WIB", place: "Serambi", note: "Target 1 juz per malam." },
      { title: "Kajian Ramadhan", time: "16:30 WIB", place: "Main Hall", note: "Tema: Adab & Akhlak." },
      { title: "Buka Puasa Bersama", time: "17:30 WIB", place: "Halaman Masjid", note: "Kuota 300 pax." },
      { title: "Tahsin Intensif", time: "15:30 WIB", place: "Ruang Kelas DKM", note: "Batch mahasiswa." },
      { title: "Santunan Anak Yatim", time: "13:00 WIB", place: "Main Hall", note: "Kolaborasi komunitas." },
      { title: "Khataman Pekanan", time: "20:30 WIB", place: "Ruang Utama", note: "Doa & dzikir." },
      { title: "Kajian Subuh", time: "05:15 WIB", place: "Ruang Utama", note: "Tema: Fiqh Puasa." },
      { title: "Kelas Tafsir Tematik", time: "16:00 WIB", place: "Library Hub", note: "Serial Ramadhan." },
      { title: "Iftar for Ummah", time: "17:20 WIB", place: "Aula", note: "Donasi takjil dibuka." },
      { title: "Qiyamul Lail", time: "03:00 WIB", place: "Ruang Utama", note: "Mulai pekan kedua." },
      { title: "Kajian Muslimah", time: "10:00 WIB", place: "Ruang Kelas", note: "Sesi khusus akhwat." },
      { title: "Pelatihan Relawan", time: "14:00 WIB", place: "Sekretariat DKM", note: "Briefing layanan." },
      { title: "Kajian Sore", time: "16:45 WIB", place: "Main Hall", note: "Tema: Tazkiyatun Nafs." },
      { title: "Bazar Ramadhan", time: "15:00 WIB", place: "Area Parkir", note: "UMKM sekitar kampus." },
      { title: "Tadarus Siang", time: "12:30 WIB", place: "Serambi", note: "Selesai Dzuhur." },
      { title: "Diskusi Etika Digital", time: "14:30 WIB", place: "Library Hub", note: "Ramadhan & adab online." },
      { title: "Kajian Hadits", time: "16:30 WIB", place: "Ruang Utama", note: "Arbain Nawawi." },
      { title: "I’tikaf Weekend", time: "20:30 WIB", place: "Masjid", note: "Registrasi relawan." },
      { title: "Program Wakaf Quran", time: "09:00 WIB", place: "Lobby", note: "Koleksi & distribusi." },
      { title: "Kajian Akhlak", time: "16:30 WIB", place: "Main Hall", note: "Adab bertetangga." },
      { title: "Khotmil Quran", time: "20:30 WIB", place: "Ruang Utama", note: "Doa khatam." },
      { title: "Malam Nuzulul Quran", time: "19:30 WIB", place: "Main Hall", note: "Ceramah & tausiyah." },
      { title: "Sahur Bersama", time: "03:30 WIB", place: "Aula", note: "Pekan terakhir." },
      { title: "Malam Takbiran", time: "19:30 WIB", place: "Masjid", note: "Takbir & doa." },
    ],
    []
  );

  // ✅ generate 30 hari dengan tanggal real (18 Feb 2026 s/d 19 Mar 2026)
  const days = useMemo(() => {
    const out = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = new Date(START_DATE);
      d.setDate(START_DATE.getDate() + i);

      const tpl = templates[i % templates.length];
      out.push({
        dayNum: i + 1,
        dateObj: d,
        dateLabel: formatID(d),
        ...tpl,
      });
    }
    return out;
  }, [START_DATE, templates]);

  const [activeDay, setActiveDay] = useState(null);
  const close = () => setActiveDay(null);

  const rangeText = useMemo(() => {
    const end = new Date(START_DATE);
    end.setDate(START_DATE.getDate() + (TOTAL_DAYS - 1));
    return `${formatID(START_DATE)} — ${formatID(end)}`;
  }, [START_DATE]);

  return (
    <section id="ramadhan-calendar" className="py-16 md:py-20" style={{ background: UIII_BG }}>
      <div className="mx-auto max-w-[1280px] px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-wider"
              style={{ background: "#EAF2F8", color: UIII_NAVY }}
            >
              🌙 THEME CALENDAR RAMADHAN 2026
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: UIII_NAVY }}>
              Kalender <span className="italic" style={{ color: UIII_GOLD }}>Kegiatan</span> Ramadhan
            </h2>
            <div className="mt-3 text-sm font-semibold" style={{ color: "#5C6B7A" }}>
              {rangeText}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-4">
            <div className="text-xs font-extrabold tracking-wider" style={{ color: UIII_NAVY }}>
              HIGHLIGHT
            </div>
            <div className="mt-2 text-sm font-semibold" style={{ color: "#5C6B7A" }}>
              Tarawih • Iftar • Kajian • Tadarus • Qiyamul Lail • I’tikaf
            </div>
          </div>
        </div>

        {/* GRID CALENDAR */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {days.map((d, idx) => {
            const isActive = activeDay === idx;

            return (
              <button
                key={d.dayNum}
                type="button"
                onClick={() => setActiveDay(isActive ? null : idx)}
                className={cx(
                  "group relative w-full aspect-[4/3] rounded-[22px] border shadow-sm overflow-hidden",
                  "transition-transform active:scale-[0.99]"
                )}
                style={{
                  borderColor: "rgba(0,0,0,.06)",
                  background: "white",
                  perspective: "1100px",
                }}
                aria-label={`Hari ${d.dayNum}`}
              >
                <div
                  className={cx("h-full w-full transition-transform duration-500", isActive && "rotate-y-180")}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 p-4 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: "hidden",
                      background: `linear-gradient(180deg, ${UIII_NAVY} 0%, rgba(8,58,87,.88) 70%, rgba(8,58,87,.78) 100%)`,
                      color: "white",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold tracking-wider opacity-90">RAMADHAN</span>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold"
                        style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.16)" }}
                      >
                        🌙
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-3xl font-extrabold leading-none">{d.dayNum}</div>
                      <div className="mt-1 text-[11px] font-bold text-white/80 line-clamp-2">{d.dateLabel}</div>
                      <div className="mt-2 text-sm font-bold opacity-95 line-clamp-2">{d.title}</div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold opacity-90">
                      <span>{d.time}</span>
                      <span className="text-white/80">Tap / Click ↺</span>
                    </div>

                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: UIII_GOLD }} />
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 p-4 flex flex-col"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      background: "linear-gradient(180deg, #fff 0%, #F6F8FB 100%)",
                      color: UIII_NAVY,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-extrabold tracking-wider" style={{ color: UIII_GOLD }}>
                          DETAIL AGENDA
                        </div>
                        <div className="mt-2 font-extrabold leading-snug line-clamp-2">{d.title}</div>
                        <div className="mt-1 text-[11px] font-bold" style={{ color: "#5C6B7A" }}>
                          {d.dateLabel}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-2xl grid place-items-center font-extrabold" style={{ background: "#FFF3DD", color: "#B77910" }}>
                        {d.dayNum}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm font-semibold" style={{ color: "#5C6B7A" }}>
                      <div className="rounded-xl bg-white border border-black/5 p-2.5">
                        🕒 <span className="font-extrabold" style={{ color: UIII_NAVY }}>{d.time}</span>
                      </div>
                      <div className="rounded-xl bg-white border border-black/5 p-2.5">
                        📍 <span className="font-extrabold" style={{ color: UIII_NAVY }}>{d.place}</span>
                      </div>
                      <div className="rounded-xl bg-white border border-black/5 p-2.5">📝 {d.note}</div>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="w-full rounded-2xl py-2.5 text-sm font-extrabold" style={{ background: UIII_NAVY, color: "white" }}>
                        Klik untuk tutup ↩
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* modal read-mode */}
        {activeDay !== null && (
          <div
            className="fixed inset-0 z-[80] grid place-items-center p-4"
            style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)" }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-[760px] max-h-[85vh] rounded-[26px] overflow-hidden bg-white shadow-2xl flex flex-col">
              <div className="relative p-6" style={{ background: UIII_NAVY, color: "white" }}>
                <button
                  type="button"
                  onClick={close}
                  className="absolute top-4 right-4 h-10 w-10 rounded-2xl grid place-items-center font-extrabold"
                  style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.18)" }}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="text-xs font-extrabold tracking-wider opacity-85">RAMADHAN THEME CALENDAR</div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl grid place-items-center font-extrabold" style={{ background: UIII_GOLD, color: "white" }}>
                    {days[activeDay].dayNum}
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-extrabold leading-snug">{days[activeDay].title}</div>
                    <div className="mt-1 text-sm text-white/80 font-semibold">
                      {days[activeDay].dateLabel} • 🕒 {days[activeDay].time} • 📍 {days[activeDay].place}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto" style={{ background: "linear-gradient(180deg,#fff,#F6F8FB)" }}>
                <div className="rounded-2xl border border-black/5 bg-white p-4">
                  <div className="text-xs font-extrabold tracking-wider" style={{ color: UIII_GOLD }}>
                    RINGKASAN
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "#5C6B7A" }}>
                    {days[activeDay].note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
