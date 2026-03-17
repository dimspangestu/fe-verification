// pages/hero/index.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import hero1 from "../../assets/masjid.jpg";
import hero2 from "../../assets/masjid.jpg";

const cx = (...a) => a.filter(Boolean).join(" ");

// ==== helpers tanggal/waktu Jakarta ====
function formatIdLong(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getJakartaYMD(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;

  return `${y}-${m}-${d}`;
}

function getJakartaYearMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const y = parseInt(parts.find((p) => p.type === "year")?.value || "0", 10);
  const m = parseInt(parts.find((p) => p.type === "month")?.value || "0", 10);
  return { year: y, month: m };
}

function getJakartaHM(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hh = parts.find((p) => p.type === "hour")?.value || "00";
  const mm = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hh}:${mm}`;
}

function toMinutes(hhmm = "") {
  const [h, m] = String(hhmm).split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function diffMinutesWrap(nowMin, targetMin) {
  if (targetMin == null) return null;
  let diff = targetMin - nowMin;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

// ==== Sticky Nav ====
function StickyNav() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > lastY.current && y > 80) setHidden(true);
      if (y < lastY.current) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cx(
        "fixed top-0 left-0 right-0 z-[90] transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="bg-black/25 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center font-bold">
                M
              </div>
              <div className="leading-tight">
                <div className="font-bold">MASJID UIII</div>
                <div className="text-xs opacity-80">
                  UNIVERSITAS ISLAM INTERNASIONAL INDONESIA
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-white/90 font-semibold">
              <a href="#home" className="hover:text-white">
                Home
              </a>
              <a href="#about" className="hover:text-white">
                About
              </a>
              <a href="#donation" className="hover:text-white">
                Donation
              </a>
              <a href="#agenda" className="hover:text-white">
                Events
              </a>
              <a href="#gallery" className="hover:text-white">
                Gallery
              </a>
            </div>

            <a
              href="#donation"
              className="inline-flex items-center gap-2 rounded-full bg-[#E3A12B] hover:bg-[#d59627] px-4 py-2 text-white font-semibold shadow-lg"
            >
              <span className="hidden sm:inline">🤍</span> Donasi Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSlider() {
  // ===== Slider
  const slides = useMemo(
    () =>
      [
        {
          image: hero1?.src,
          title: "Selamat Datang di Masjid\nKampus UIII",
          subtitle:
            "Pusat spiritualitas kontemporer, moderasi beragama, dan ekosistem intelektual Islam di lingkungan akademik internasional.",
          ctaLabel: "Donasi Sekarang",
          ctaHref: "#donation",
        },
        {
          image: hero2?.src,
          title: "Masjid Kampus UIII",
          subtitle: "Informasi shalat, agenda kegiatan, dan berita terbaru semua dalam satu portal.",
          ctaLabel: "Lihat Agenda",
          ctaHref: "#agenda",
        },
      ].filter((s) => s.image),
    []
  );

  const hasSlider = slides.length > 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!hasSlider) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [hasSlider, slides.length]);

  const active = slides[index] || slides[0];

  // ===== realtime tick
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  // ===== sholat state
  const [loadingSholat, setLoadingSholat] = useState(true);
  const [sholatError, setSholatError] = useState("");
  const [todayMeta, setTodayMeta] = useState("");

  const [prayerTimes, setPrayerTimes] = useState({
    imsak: "--:--",
    subuh: "--:--",
    dzuhur: "--:--",
    ashar: "--:--",
    maghrib: "--:--",
    isya: "--:--",
  });

  useEffect(() => {
    let alive = true;

    async function loadSholat() {
      try {
        setLoadingSholat(true);
        setSholatError("");

        const { year, month } = getJakartaYearMonth(new Date());

        // ⚠️ Kalau kena CORS dari browser, gunakan proxy endpoint /api/shalat (Next route handler)
        // const endpoint = "/api/shalat";
        const endpoint = "https://equran.id/api/v2/shalat";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provinsi: "Jawa Barat",
            kabkota: "Kota Depok",
            bulan: month,
            tahun: year,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const jadwal = json?.data?.jadwal || [];
        if (!Array.isArray(jadwal) || jadwal.length === 0) {
          throw new Error("Jadwal kosong");
        }

        const todayStr = getJakartaYMD(new Date());
        const today = jadwal.find((x) => x?.tanggal_lengkap === todayStr) || jadwal[0];

        const metaDate = new Date(`${today?.tanggal_lengkap}T00:00:00+07:00`);
        const metaText = `${formatIdLong(metaDate)} • ${json?.data?.kabkota || "Kota Depok"}`;

        const mapped = {
          imsak: today?.imsak || "--:--",
          subuh: today?.subuh || "--:--",
          dzuhur: today?.dzuhur || "--:--",
          ashar: today?.ashar || "--:--",
          maghrib: today?.maghrib || "--:--",
          isya: today?.isya || "--:--",
        };

        if (!alive) return;
        setTodayMeta(metaText);
        setPrayerTimes(mapped);
      } catch (e) {
        if (!alive) return;
        setSholatError("Gagal ambil jadwal (fallback).");
        setTodayMeta(`${formatIdLong(new Date())} • Kota Depok`);
        setPrayerTimes({
          imsak: "04:30",
          subuh: "04:40",
          dzuhur: "12:10",
          ashar: "15:24",
          maghrib: "18:20",
          isya: "19:30",
        });
      } finally {
        if (!alive) return;
        setLoadingSholat(false);
      }
    }

    loadSholat();
    return () => {
      alive = false;
    };
  }, []);

  // ===== Next prayer calc
  const nowHM = getJakartaHM(new Date(nowTick));
  const nowMin = toMinutes(nowHM) ?? 0;

  const schedule = useMemo(() => {
    const items = [
      { key: "imsak", label: "Imsak", time: prayerTimes.imsak },
      { key: "subuh", label: "Subuh", time: prayerTimes.subuh },
      { key: "dzuhur", label: "Dzuhur", time: prayerTimes.dzuhur },
      { key: "ashar", label: "Ashar", time: prayerTimes.ashar },
      { key: "maghrib", label: "Maghrib", time: prayerTimes.maghrib },
      { key: "isya", label: "Isya", time: prayerTimes.isya },
    ].map((x) => ({ ...x, min: toMinutes(x.time) }));

    return items;
  }, [prayerTimes]);

  const nextKey = useMemo(() => {
    const valid = schedule.filter((x) => x.min != null).sort((a, b) => a.min - b.min);
    const upcoming = valid.find((x) => x.min > nowMin);
    return (upcoming || valid[0] || { key: "subuh" }).key;
  }, [schedule, nowMin]);

  const nextDiff = useMemo(() => {
    const t = schedule.find((x) => x.key === nextKey);
    return diffMinutesWrap(nowMin, t?.min ?? null);
  }, [schedule, nextKey, nowMin]);

  const isApproaching = nextDiff != null && nextDiff <= 30;

  // ===== highlight location bigger
  const LocationPill = () => (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#083A57]/10 text-[#083A57] border border-black/5 px-4 py-2">
      <span className="text-lg">📍</span>
      <span className="text-base md:text-lg font-extrabold">
        <span className="text-[#E3A12B]">Kota Depok</span>
        <span className="text-[#083A57]">, </span>
        <span className="text-[#E3A12B]">Jawa Barat</span>
      </span>
    </span>
  );

  return (
    <section id="home" className="relative">
      <StickyNav />

      {/* HERO BG */}
      <div className="relative overflow-hidden min-h-[520px] md:min-h-[640px]">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${active?.image})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

        <div className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-5 pt-28 md:pt-32 pb-24 md:pb-28">
            <div className="text-center">
              <h1 className="whitespace-pre-line text-white font-extrabold tracking-tight text-4xl md:text-6xl">
                {active?.title}
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-white/85 text-base md:text-lg leading-relaxed">
                {active?.subtitle}
              </p>

              <div className="mt-6 flex justify-center">
                <a
                  href={active?.ctaHref || "#donation"}
                  className="inline-flex items-center justify-center rounded-full bg-[#E3A12B] hover:bg-[#d59627] px-6 py-3 text-white font-extrabold shadow-xl"
                >
                  {active?.ctaLabel || "Donasi Sekarang"} →
                </a>
              </div>
            </div>

            {hasSlider && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)}
                  className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white"
                  aria-label="Prev"
                >
                  ‹
                </button>

                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={cx(
                        "h-2.5 rounded-full transition-all",
                        i === index ? "w-10 bg-[#E3A12B]" : "w-2.5 bg-white/40"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIndex((p) => (p + 1) % slides.length)}
                  className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white"
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD SHOLAT */}
      <div className="relative z-20 -mt-16 md:-mt-20">
        <div className="mx-auto max-w-[1280px] px-5">
          <div className="rounded-[34px] bg-white shadow-2xl border border-black/5 overflow-hidden">
            {/* header */}
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[#083A57] text-white grid place-items-center text-xl">
                  🕒
                </div>

                <div className="leading-tight">
                  <div className="text-lg md:text-xl font-extrabold text-[#083A57]">
                    Jadwal Sholat Hari Ini
                  </div>

                  <div className="mt-2">
                    <LocationPill />
                  </div>

                  <div className="mt-2 text-sm font-semibold text-[#5C6B7A]">
                    Masjid UIII
                    {loadingSholat ? " • memuat..." : ""}
                  </div>

                  {sholatError ? (
                    <div className="mt-1 text-xs font-bold text-[#B77910]">{sholatError}</div>
                  ) : (
                    <div className="mt-1 text-xs font-bold text-[#5C6B7A]">
                      Next:{" "}
                      <span className="text-[#B77910] font-extrabold">
                        {schedule.find((x) => x.key === nextKey)?.label || "-"}
                      </span>
                      {nextDiff != null ? (
                        <span className="ml-2">
                          ({nextDiff} menit lagi){isApproaching ? " ⏳" : ""}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* kanan: tanggal + tombol */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F6F8FB] border border-black/5 px-4 py-2 text-sm font-semibold text-[#083A57]">
                  <span>📅</span>
                  <span>{todayMeta || "—"}</span>
                </div>

                <Link
                  href="/schedule"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#083A57] text-white px-5 py-2 text-sm font-extrabold shadow-lg shadow-black/10 border border-black/5 hover:opacity-95 active:scale-[0.99] transition"
                >
                  More info
                  <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </Link>
              </div>
            </div>

            {/* ✅ GRID JADWAL SHOLAT (muncul) */}
            <div className="px-5 md:px-6 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { key: "imsak", label: "Imsak", time: prayerTimes.imsak },
                  { key: "subuh", label: "Subuh", time: prayerTimes.subuh },
                  { key: "dzuhur", label: "Dzuhur", time: prayerTimes.dzuhur },
                  { key: "ashar", label: "Ashar", time: prayerTimes.ashar },
                  { key: "maghrib", label: "Maghrib", time: prayerTimes.maghrib },
                  { key: "isya", label: "Isya", time: prayerTimes.isya },
                ].map((t) => {
                  const isNext = t.key === nextKey;
                  return (
                    <div
                      key={t.key}
                      className={cx(
                        "rounded-2xl border p-4 text-center shadow-sm transition",
                        isNext
                          ? "border-[#E3A12B]/40 bg-[#E3A12B]/10"
                          : "border-black/5 bg-[#F6F8FB]"
                      )}
                    >
                      <div className="text-xs font-bold text-[#5C6B7A]">{t.label}</div>
                      <div className="mt-1 text-2xl font-extrabold tabular-nums text-[#083A57]">
                        {t.time}
                      </div>
                      {isNext && (
                        <div className="mt-1 text-[11px] font-bold text-[#B77910]">
                          Next • {nextDiff != null ? `${nextDiff} menit` : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-1.5 w-full bg-[#E3A12B]" />
          </div>
        </div>
      </div>

      <div className="h-10 md:h-14" />
    </section>
  );
}
