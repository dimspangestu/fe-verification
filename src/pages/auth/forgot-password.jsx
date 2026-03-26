// pages/auth/forgot-password.jsx
import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Masukkan email Anda."); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", key: API_KEY },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengirim email.");
      setSent(true);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/auth/login">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#083A57] text-white text-xl font-black shadow-lg mb-4 cursor-pointer hover:opacity-90 transition">
              FF
            </div>
          </Link>
          <div className="text-2xl font-black text-slate-900">Fondofund</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">Platform Pendanaan Proyek</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="border-b border-slate-100 px-7 py-5">
            <div className="text-lg font-black text-slate-900">Lupa Password</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-500">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </div>
          </div>

          <div className="px-7 py-6">
            {sent ? (
              /* ── Success state ── */
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-3xl">
                  📬
                </div>
                <div className="text-base font-black text-slate-900">Email Terkirim!</div>
                <div className="mt-2 text-sm font-semibold text-slate-500 leading-relaxed">
                  Jika email <span className="font-black text-slate-700">{email}</span> terdaftar di
                  Fondofund, link reset password akan segera dikirimkan.
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-400">
                  Periksa folder Inbox dan Spam. Link berlaku 1 jam.
                </div>
                <div className="mt-6 grid gap-2">
                  <button onClick={() => { setSent(false); setEmail(""); }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600 hover:bg-slate-100 transition">
                    Kirim Ulang
                  </button>
                  <Link href="/auth/login"
                    className="block h-11 w-full rounded-xl bg-[#083A57] text-center leading-[44px] text-sm font-black text-white hover:bg-[#0a4a70] transition">
                    Kembali ke Login
                  </Link>
                </div>
              </div>
            ) : (
              /* ── Form state ── */
              <form onSubmit={handleSubmit} className="grid gap-4">

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                  </div>
                )}

                <label className="grid gap-1.5">
                  <span className="text-xs font-extrabold text-slate-700">Alamat Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com" autoComplete="email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
                </label>

                <button type="submit" disabled={loading}
                  className={["h-12 w-full rounded-xl text-sm font-black transition",
                    loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                            : "bg-[#083A57] text-white hover:bg-[#0a4a70] active:scale-95"].join(" ")}>
                  {loading ? "Mengirim..." : "Kirim Link Reset Password"}
                </button>

                <div className="text-center">
                  <Link href="/auth/login"
                    className="text-sm font-bold text-indigo-600 hover:underline">
                    ← Kembali ke Login
                  </Link>
                </div>

              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-slate-400">
          © {new Date().getFullYear()} Fondofund. All rights reserved.
        </div>
      </div>
    </div>
  );
}