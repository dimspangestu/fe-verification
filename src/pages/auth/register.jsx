// pages/auth/register.jsx
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

/* ─── Password strength ─── */
function StrengthBar({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const labels = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const colors  = ["", "#f87171", "#fbbf24", "#34d399", "#16a34a"];
  return (
    <div>
      <div className="flex gap-1 mt-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
            style={{ backgroundColor: i <= score ? colors[score] : "#e2e8f0" }} />
        ))}
      </div>
      {score > 0 && (
        <div className="text-[11px] font-bold mt-1" style={{ color: colors[score] }}>
          {labels[score]}
        </div>
      )}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition";

export default function RegisterPage() {
  const router = useRouter();

  const [role,     setRole]     = useState("penerima_dana");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [ok,       setOk]       = useState("");

  const isVendor   = role === "penerima_dana";
  const isInvestor = role === "investor";

  /* Dynamic label & placeholder per role */
  const nameLabel       = isVendor   ? "Nama Perusahaan (PT / CV)" : "Nama Lengkap / Nama Perusahaan";
  const namePlaceholder = isVendor   ? "PT Maju Bersama / CV Karya Nusantara"
                                     : "Budi Santoso / PT Prospera Investama";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setOk("");

    if (!name.trim())  { setError("Nama wajib diisi.");            return; }
    if (!email.trim()) { setError("Email wajib diisi.");           return; }
    if (!password)     { setError("Password wajib diisi.");        return; }
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }

    // Vendor: reject if name looks like a personal name (no PT/CV keyword)
    if (isVendor) {
      const upper = name.trim().toUpperCase();
      const hasEntity = ["PT", "CV", "UD", "KOPERASI", "YAYASAN", "FIRMA"].some((k) =>
        upper.startsWith(k) || upper.includes(" " + k + " ") || upper.includes(" " + k + ".")
      );
      if (!hasEntity) {
        setError(
          "Investee harus menggunakan nama entitas usaha (PT, CV, UD, Koperasi, dll). Pendaftaran perorangan tidak diperbolehkan."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", key: API_KEY },
        body: JSON.stringify({
          name: name.trim(), email: email.trim().toLowerCase(),
          phone: phone.trim() || null, role, password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Register gagal.");

      setOk("Registrasi berhasil! Mengarahkan ke halaman login...");
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-[480px]">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#083A57] text-white text-xl font-black shadow-lg mb-4">
            FF
          </div>
          <div className="text-2xl font-black text-slate-900">Fondofund</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">Platform Pendanaan Proyek</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="border-b border-slate-100 px-7 py-5">
            <div className="text-lg font-black text-slate-900">Buat Akun Baru</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-500">
              Pilih peran Anda di platform Fondofund.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-7 py-6 grid gap-4">

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                {error}
              </div>
            )}
            {ok && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                ✓ {ok}
              </div>
            )}

            {/* Role selector — card style */}
            <div className="grid gap-2">
              <span className="text-xs font-extrabold text-slate-700">Daftar sebagai</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "penerima_dana", label: "Investee",  sub: "Perusahaan (PT/CV)",    icon: "🏢" },
                  { value: "investor",      label: "Investor",        sub: "Perorangan / Perusahaan", icon: "💼" },
                ].map((r) => (
                  <button key={r.value} type="button" onClick={() => { setRole(r.value); setName(""); setError(""); }}
                    className={[
                      "rounded-2xl border-2 p-3 text-left transition-all",
                      role === r.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}>
                    <div className="text-base mb-1">{r.icon}</div>
                    <div className={["text-xs font-black", role === r.value ? "text-indigo-800" : "text-slate-800"].join(" ")}>
                      {r.label}
                    </div>
                    <div className={["text-[10px] font-semibold mt-0.5", role === r.value ? "text-indigo-600" : "text-slate-400"].join(" ")}>
                      {r.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info box per role */}
            {isVendor && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-xs font-black text-amber-800 mb-1">⚠ Khusus Entitas Usaha</div>
                <div className="text-xs font-semibold text-amber-700 leading-relaxed">
                  Investee <span className="font-black">hanya boleh berupa badan usaha</span> — PT, CV, UD, Koperasi, Yayasan, atau Firma.
                  Pendaftaran atas nama perorangan tidak diperbolehkan.
                </div>
              </div>
            )}
            {isInvestor && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-xs font-black text-emerald-800 mb-1">✓ Perorangan atau Perusahaan</div>
                <div className="text-xs font-semibold text-emerald-700 leading-relaxed">
                  Investor bisa mendaftar atas nama pribadi maupun badan usaha.
                  Dokumen KYC akan disesuaikan dengan tipe akun yang Anda pilih nanti di profil.
                </div>
              </div>
            )}

            {/* Name */}
            <label className="grid gap-1.5">
              <span className="text-xs font-extrabold text-slate-700">
                {nameLabel}
                <span className="ml-1 text-rose-500">*</span>
              </span>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder} autoComplete="organization"
                className={inputCls} />
              {isVendor && (
                <div className="text-[11px] font-semibold text-slate-400">
                  Contoh: PT Karya Maju Bersama, CV Infrastruktur Nusantara
                </div>
              )}
            </label>

            {/* Email */}
            <label className="grid gap-1.5">
              <span className="text-xs font-extrabold text-slate-700">
                Email <span className="text-rose-500">*</span>
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com" autoComplete="email" className={inputCls} />
            </label>

            {/* Phone */}
            <label className="grid gap-1.5">
              <span className="text-xs font-extrabold text-slate-700">Nomor Telepon</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ""))}
                placeholder="08xx-xxxx-xxxx" autoComplete="tel" inputMode="tel" className={inputCls} />
            </label>

            {/* Password */}
            <label className="grid gap-1.5">
              <span className="text-xs font-extrabold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </span>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter" autoComplete="new-password"
                  className={`${inputCls} pr-24`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 hover:text-slate-600">
                  {showPw ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              <StrengthBar password={password} />
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={[
                "mt-2 h-12 w-full rounded-xl text-sm font-black transition",
                loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-[#083A57] text-white hover:bg-[#0a4a70] active:scale-95",
              ].join(" ")}>
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            <div className="text-center text-sm font-semibold text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="font-black text-indigo-600 hover:underline">
                Masuk
              </Link>
            </div>

          </form>
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-slate-400">
          © {new Date().getFullYear()} Fondofund. All rights reserved.
        </div>
      </div>
    </div>
  );
}