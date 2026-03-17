// app/jadwal-ramadhan/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import photo from "../../assets/logomosque.jpg";

const UIII_GREEN = "#00778B";
const START_ISO = "2026-02-19"; // dianggap 1 Ramadhan
const DAYS = 30;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function addDaysISO(startIso, addDays) {
  const d = new Date(startIso + "T00:00:00");
  d.setDate(d.getDate() + addDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

async function fetchShalat({ provinsi, kabkota, bulan, tahun }) {
  const res = await fetch("https://equran.id/api/v2/shalat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json?.code !== 200) {
    throw new Error(json?.message || `Gagal ambil jadwal (HTTP ${res.status})`);
  }
  return json?.data;
}

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function MobileCard({ r }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 backdrop-blur shadow-lg overflow-hidden">
      {/* header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div>
          <div className="text-sm font-bold text-slate-900">{r.ramadhan}</div>
          <div className="text-xs text-slate-500">{r.tanggal_lengkap}</div>
        </div>
      </div>

      {/* highlight row */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-3">
          <div className="text-[11px] font-semibold text-slate-600">Imsak</div>
          <div
            className="mt-1 inline-flex rounded-xl px-3 py-1 text-sm font-extrabold tabular-nums"
            style={{ background: UIII_GREEN, color: "white" }}
          >
            {r.imsak}
          </div>
        </div>

        <div className="px-4 py-3 text-right">
          <div className="text-[11px] font-semibold text-slate-600">Maghrib</div>
          <div
            className="mt-1 inline-flex rounded-xl px-3 py-1 text-sm font-extrabold tabular-nums"
            style={{ background: UIII_GREEN, color: "white" }}
          >
            {r.maghrib}
          </div>
        </div>
      </div>

      {/* other times */}
      <div className="px-4 pb-4">
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Fajr</span>
            <span className="font-bold tabular-nums text-slate-900">{r.fajr}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Shuruq</span>
            <span className="font-bold tabular-nums text-slate-900">{r.shuruq}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Duha</span>
            <span className="font-bold tabular-nums text-slate-900">{r.duha}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Dhuhr</span>
            <span className="font-bold tabular-nums text-slate-900">{r.dhuhr}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Asr</span>
            <span className="font-bold tabular-nums text-slate-900">{r.asr}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2">
            <span className="text-slate-600 font-semibold">Isha</span>
            <span className="font-bold tabular-nums text-slate-900">{r.isha}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopTable({ rows }) {
  return (
    <div className="rounded-2xl border border-black/10 overflow-hidden bg-white/85 backdrop-blur shadow-xl">
      {/* header bar */}
      <div className="bg-[#083A57] text-white">
        <div className="grid grid-cols-10 text-[12px] font-semibold uppercase tracking-wide">
          <div className="px-3 py-3">Date</div>
          <div className="px-3 py-3 text-center">Imsak</div>
          <div className="px-3 py-3 text-center">Fajr</div>
          <div className="px-3 py-3 text-center">Shuruq</div>
          <div className="px-3 py-3 text-center">Duha</div>
          <div className="px-3 py-3 text-center">Dhuhr</div>
          <div className="px-3 py-3 text-center">Asr</div>
          <div className="px-3 py-3 text-center">Maghrib</div>
          <div className="px-3 py-3 text-center">Isha</div>
        </div>
      </div>

      {/* body */}
      <div className="divide-y divide-black/5">
        {rows.map((r) => (
          <div key={r.tanggal_lengkap} className="grid grid-cols-10 text-[12px]">
            <div className="px-3 py-2">
              <div className="font-semibold text-slate-800">{r.ramadhan}</div>
              <div className="text-[10px] text-slate-500">{r.tanggal_lengkap}</div>
            </div>

            {/* Imsak highlight */}
            <div
              className="px-3 py-2 text-center font-extrabold tabular-nums"
              style={{ background: UIII_GREEN, color: "white" }}
            >
              {r.imsak}
            </div>

            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.fajr}
            </div>

            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.shuruq}
            </div>

            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.duha}
            </div>

            {/* Dhuhr not highlighted */}
            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.dhuhr}
            </div>

            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.asr}
            </div>

            {/* Maghrib highlight */}
            <div
              className="px-3 py-2 text-center font-extrabold tabular-nums"
              style={{ background: UIII_GREEN, color: "white" }}
            >
              {r.maghrib}
            </div>

            <div className="px-3 py-2 text-center font-medium tabular-nums text-slate-800">
              {r.isha}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JadwalRamadhanDepok() {
  const provinsi = "Jawa Barat";
  const kabkota = "Kota Depok";
  const endIso = useMemo(() => addDaysISO(START_ISO, DAYS - 1), []);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [feb, mar] = await Promise.all([
          fetchShalat({ provinsi, kabkota, bulan: 2, tahun: 2026 }),
          fetchShalat({ provinsi, kabkota, bulan: 3, tahun: 2026 }),
        ]);

        const merged = [
          ...(Array.isArray(feb?.jadwal) ? feb.jadwal : []),
          ...(Array.isArray(mar?.jadwal) ? mar.jadwal : []),
        ];

        const filtered = merged
          .filter(
            (x) => x?.tanggal_lengkap >= START_ISO && x?.tanggal_lengkap <= endIso
          )
          .sort((a, b) => (a.tanggal_lengkap > b.tanggal_lengkap ? 1 : -1))
          .slice(0, DAYS)
          .map((x, idx) => ({
            ramadhan: `${idx + 1} Ramadhan`,
            tanggal_lengkap: x.tanggal_lengkap,
            imsak: x.imsak,
            fajr: x.subuh,
            shuruq: x.terbit,
            duha: x.dhuha,
            dhuhr: x.dzuhur,
            asr: x.ashar,
            maghrib: x.maghrib,
            isha: x.isya,
          }));

        setRows(filtered);
      } catch (e) {
        setErr(e?.message || "Error tidak diketahui");
      } finally {
        setLoading(false);
      }
    })();
  }, [endIso, provinsi, kabkota]);

  if (loading) {
    return (
      <main className="relative min-h-screen bg-white p-6">
        <div className="mx-auto max-w-[980px]">
          <div className="animate-pulse h-[140px] rounded-2xl bg-slate-200" />
          <div className="mt-4 animate-pulse h-[520px] rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="relative min-h-screen bg-white p-6">
        <div className="mx-auto max-w-[720px] rounded-2xl border border-red-200 bg-white p-6">
          <div className="text-lg font-semibold text-red-700">
            Gagal memuat jadwal
          </div>
          <p className="mt-2 text-red-600">{err}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen py-6 md:py-8">
      {/* background photo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photo?.src})` }}
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/85" />
      </div>

      <div className="mx-auto max-w-[980px] px-4">
        {/* header responsive */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div>
            <div className="text-[34px] md:text-[44px] leading-[1] font-extrabold tracking-tight text-slate-900">
              5 DAILY
            </div>
            <div className="text-[34px] md:text-[44px] leading-[1] font-extrabold tracking-tight text-slate-900">
              PRAYER TIMES
            </div>

            <div className="mt-2 text-[14px] md:text-[18px] italic text-slate-600">
              <span
                className="font-semibold"
                style={{
                  color: UIII_GREEN,
                  background: `${UIII_GREEN}14`,
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                {kabkota}, {provinsi}
              </span>
            </div>
          </div>

          <div className="md:text-right">
            <div
              className="text-[22px] md:text-[34px] font-semibold"
              style={{ color: UIII_GREEN }}
            >
              Ramadan
            </div>
            <div className="text-slate-600 font-medium text-sm md:text-base">
              1447H / 2026M
            </div>
          </div>
        </div>

        {/* ======= RESPONSIVE RENDER ======= */}
        {/* Mobile: cards */}
        <div className="mt-6 md:hidden space-y-3">
          {rows.map((r) => (
            <MobileCard key={r.tanggal_lengkap} r={r} />
          ))}
        </div>

        {/* Desktop: table */}
        <div className="mt-6 hidden md:block">
          <DesktopTable rows={rows} />
        </div>
      </div>
    </main>
  );
}
