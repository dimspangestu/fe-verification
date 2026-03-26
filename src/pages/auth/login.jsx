// pages/auth/login.jsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function normalizeRole(role) {
  if (role === "penerima_dana") return "penerima";
  return role;
}
function roleRedirectPath(role) {
  if (role === "admin")    return "/admin";
  if (role === "investor") return "/investor";
  return "/penerima-dana";
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }

    setLoading(true);
    try {
      const loginRes  = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", key: API_KEY },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) throw new Error(loginData?.detail || "Login gagal.");

      const token = loginData.access_token;

      const meRes  = await fetch(`${API_BASE}/auth/me`, {
        headers: { key: API_KEY, Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json().catch(() => ({}));
      if (!meRes.ok) throw new Error(meData?.detail || "Gagal mengambil profil.");

      const normalizedRole = normalizeRole(meData.role);

      const session = {
        token,
        token_type: loginData.token_type,
        user: {
          id: meData.id, name: meData.name,
          email: meData.email, phone: meData.phone,
          role: normalizedRole,
        },
      };
      localStorage.setItem("auth_session", JSON.stringify(session));
      localStorage.setItem("access_token", token);

      await router.push(roleRedirectPath(normalizedRole));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-[420px]">

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
            <div className="text-lg font-black text-slate-900">Masuk ke akun Anda</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-500">Gunakan email yang sudah terdaftar.</div>
          </div>

          <form onSubmit={handleSubmit} className="px-7 py-6 grid gap-4">

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                {error}
              </div>
            )}

            <label className="grid gap-1.5">
              <span className="text-xs font-extrabold text-slate-700">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com" autoComplete="email"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
            </label>

            <label className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">Password</span>
                <Link href="/auth/forgot-password"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-xs font-black">
                  {showPw ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading}
              className={["mt-2 h-12 w-full rounded-xl text-sm font-black transition",
                loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-[#083A57] text-white hover:bg-[#0a4a70] active:scale-95"].join(" ")}>
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <div className="text-center text-sm font-semibold text-slate-500">
              Belum punya akun?{" "}
              <Link href="/auth/register" className="font-black text-indigo-600 hover:underline">
                Daftar sekarang
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