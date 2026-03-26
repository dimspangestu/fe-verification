// pages/auth/reset-password.jsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-24 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 transition">
        {show ? "Sembunyikan" : "Tampilkan"}
      </button>
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const colors = ["", "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-600"];

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={["h-1.5 flex-1 rounded-full transition-all",
            i <= score ? colors[score] : "bg-slate-200"].join(" ")} />
        ))}
        <span className={["text-[11px] font-black shrink-0",
          score <= 1 ? "text-rose-500" : score <= 2 ? "text-amber-500" : "text-emerald-600"].join(" ")}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [tokenValid,   setTokenValid]   = useState(null); // null=loading, true/false
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState("");

  // Verify token on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/auth/reset-password/verify?token=${token}`, {
      headers: { key: API_KEY },
    })
      .then((r) => setTokenValid(r.ok))
      .catch(() => setTokenValid(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (newPassword !== confirmPass) { setError("Konfirmasi password tidak cocok."); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", key: API_KEY },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal reset password.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-[420px]">

        <div className="mb-8 text-center">
          <Link href="/auth/login">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#083A57] text-white text-xl font-black shadow-lg mb-4 cursor-pointer hover:opacity-90 transition">
              FF
            </div>
          </Link>
          <div className="text-2xl font-black text-slate-900">Fondofund</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">Reset Password</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">

          {/* Loading token verification */}
          {tokenValid === null && (
            <div className="px-7 py-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mb-4" />
              <div className="text-sm font-bold text-slate-500">Memverifikasi link...</div>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div className="px-7 py-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-base font-black text-slate-900">Link Tidak Valid</div>
              <div className="mt-2 text-sm font-semibold text-slate-500">
                Link reset password sudah expired, sudah digunakan, atau tidak valid.
              </div>
              <div className="mt-6">
                <Link href="/auth/forgot-password"
                  className="inline-flex h-11 items-center rounded-xl bg-[#083A57] px-5 text-sm font-black text-white hover:bg-[#0a4a70] transition">
                  Minta Link Baru
                </Link>
              </div>
            </div>
          )}

          {/* Done */}
          {tokenValid && done && (
            <div className="px-7 py-8 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-3xl">
                ✅
              </div>
              <div className="text-base font-black text-slate-900">Password Berhasil Direset!</div>
              <div className="mt-2 text-sm font-semibold text-slate-500">
                Password baru Anda sudah aktif. Silakan login kembali.
              </div>
              <div className="mt-6">
                <Link href="/auth/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#083A57] text-sm font-black text-white hover:bg-[#0a4a70] transition">
                  Login Sekarang →
                </Link>
              </div>
            </div>
          )}

          {/* Reset form */}
          {tokenValid && !done && (
            <>
              <div className="border-b border-slate-100 px-7 py-5">
                <div className="text-lg font-black text-slate-900">Buat Password Baru</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-500">
                  Buat password baru yang kuat dan mudah diingat.
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-7 py-6 grid gap-4">

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                  </div>
                )}

                <label className="grid gap-1.5">
                  <span className="text-xs font-extrabold text-slate-700">Password Baru</span>
                  <PasswordInput value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password" />
                  <StrengthBar password={newPassword} />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-extrabold text-slate-700">Konfirmasi Password</span>
                  <PasswordInput value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password" />
                  {confirmPass && confirmPass !== newPassword && (
                    <div className="text-[11px] font-bold text-rose-500">Password tidak cocok.</div>
                  )}
                  {confirmPass && confirmPass === newPassword && (
                    <div className="text-[11px] font-bold text-emerald-600">✓ Password cocok.</div>
                  )}
                </label>

                {/* Tips */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                  Tips: gunakan kombinasi huruf besar, angka, dan simbol untuk password yang lebih kuat.
                </div>

                <button type="submit" disabled={loading}
                  className={["h-12 w-full rounded-xl text-sm font-black transition",
                    loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                            : "bg-[#083A57] text-white hover:bg-[#0a4a70] active:scale-95"].join(" ")}>
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>

              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-slate-400">
          © {new Date().getFullYear()} Fondofund. All rights reserved.
        </div>
      </div>
    </div>
  );
}