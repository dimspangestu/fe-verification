// pages/auth/account.jsx
// Bisa dipakai di semua role — letakkan di sidebar masing-masing layout
import { useState } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("auth_session"))?.token
      || localStorage.getItem("access_token") || "";
  } catch { return localStorage.getItem("access_token") || ""; }
}

function clearSession() {
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

function getSession() {
  try { return JSON.parse(localStorage.getItem("auth_session") || "null"); } catch { return null; }
}

/* ─── UI atoms ─── */
function Toast({ visible, message, type }) {
  if (!visible) return null;
  return (
    <div className={["fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg max-w-xs",
      type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                         : "border-rose-200 bg-rose-50 text-rose-800"].join(" ")}>
      {type === "success" ? "✓ " : "✕ "}{message}
    </div>
  );
}

function PasswordInput({ label, value, onChange, autoComplete, hint }) {
  const [show, setShow] = useState(false);
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700">{label}</span>
        {hint && <span className="text-[10px] font-bold text-slate-400">{hint}</span>}
      </div>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-24 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600">
          {show ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>
    </label>
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
  const colors  = ["", "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-600"];
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {[1,2,3,4].map((i) => (
        <div key={i} className={["h-1.5 flex-1 rounded-full transition-all",
          i <= score ? colors[score] : "bg-slate-200"].join(" ")} />
      ))}
      <span className={["text-[11px] font-black shrink-0",
        score <= 1 ? "text-rose-500" : score <= 2 ? "text-amber-500" : "text-emerald-600"].join(" ")}>
        {labels[score]}
      </span>
    </div>
  );
}

/* ─── Change Email Section ─── */
function ChangeEmailSection({ currentEmail, onSuccess }) {
  const [newEmail,  setNewEmail]  = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!newEmail.trim()) { setError("Email baru wajib diisi."); return; }
    if (!password)        { setError("Password saat ini wajib diisi."); return; }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("Email baru sama dengan email saat ini."); return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/me/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", key: API_KEY, Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ new_email: newEmail.trim().toLowerCase(), current_password: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengubah email.");

      // Update session
      const sess = getSession();
      if (sess) {
        sess.user.email = data.email;
        localStorage.setItem("auth_session", JSON.stringify(sess));
      }

      setSuccess(`Email berhasil diubah ke ${data.email}.`);
      setNewEmail(""); setPassword("");
      if (onSuccess) onSuccess(data.email);
    } catch (err) {
      setError(err.message || "Gagal mengubah email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error   && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">✓ {success}</div>}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-[10px] font-black uppercase text-slate-400">Email Saat Ini</div>
        <div className="mt-0.5 text-sm font-black text-slate-900">{currentEmail}</div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-extrabold text-slate-700">Email Baru</span>
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email-baru@contoh.com" autoComplete="email"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
      </label>

      <PasswordInput label="Konfirmasi Password Saat Ini" value={password}
        onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
        hint="Untuk verifikasi identitas" />

      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className={["h-11 rounded-xl px-5 text-sm font-black transition",
            loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"].join(" ")}>
          {loading ? "Menyimpan..." : "Ubah Email"}
        </button>
      </div>
    </form>
  );
}

/* ─── Change Password Section ─── */
function ChangePasswordSection({ onLogout }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!currentPw)          { setError("Password saat ini wajib diisi."); return; }
    if (newPw.length < 8)    { setError("Password baru minimal 8 karakter."); return; }
    if (newPw !== confirmPw) { setError("Konfirmasi password tidak cocok."); return; }
    if (newPw === currentPw) { setError("Password baru tidak boleh sama dengan password lama."); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", key: API_KEY, Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengubah password.");

      setSuccess("Password berhasil diubah. Anda akan logout dalam 3 detik...");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");

      // Auto logout after password change
      setTimeout(() => {
        clearSession();
        if (onLogout) onLogout();
      }, 3000);

    } catch (err) {
      setError(err.message || "Gagal mengubah password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error   && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">✓ {success}</div>}

      <PasswordInput label="Password Saat Ini" value={currentPw}
        onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" />

      <label className="grid gap-1.5">
        <span className="text-xs font-extrabold text-slate-700">Password Baru</span>
        <div className="relative">
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
            placeholder="Minimal 8 karakter" autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition" />
        </div>
        <StrengthBar password={newPw} />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-extrabold text-slate-700">Konfirmasi Password Baru</span>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Ulangi password baru" autoComplete="new-password"
          className={["h-11 w-full rounded-xl border px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition",
            confirmPw && confirmPw !== newPw
              ? "border-rose-300 bg-rose-50 focus:ring-rose-100"
              : confirmPw && confirmPw === newPw
                ? "border-emerald-300 bg-emerald-50 focus:ring-emerald-100"
                : "border-slate-200 bg-white focus:border-indigo-300 focus:ring-indigo-100"].join(" ")} />
        {confirmPw && confirmPw !== newPw && (
          <div className="text-[11px] font-bold text-rose-500">Password tidak cocok.</div>
        )}
        {confirmPw && confirmPw === newPw && (
          <div className="text-[11px] font-bold text-emerald-600">✓ Password cocok.</div>
        )}
      </label>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
        ⚠ Setelah mengubah password, Anda akan otomatis logout dan perlu login ulang.
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className={["h-11 rounded-xl px-5 text-sm font-black transition",
            loading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"].join(" ")}>
          {loading ? "Menyimpan..." : "Ubah Password"}
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ─── */
// Gunakan Layout yang sesuai dengan role user (TailAdminLayout / InvestorLayout / AdminLayout)
// Contoh di bawah menggunakan TailAdminLayout — ganti sesuai kebutuhan
import TailAdminLayout from "../../components/pd/TailAdminLayout";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("email");

  const sess = typeof window !== "undefined" ? getSession() : null;
  const currentEmail = sess?.user?.email || "";
  const currentName  = sess?.user?.name  || "";

  const [displayEmail, setDisplayEmail] = useState(currentEmail);

  const tabs = [
    { key: "email",    label: "Ubah Email",    icon: "📧" },
    { key: "password", label: "Ubah Password", icon: "🔑" },
  ];

  return (
    <TailAdminLayout title="Pengaturan Akun">
      <div className="max-w-[600px]">

        {/* Header */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 border border-indigo-100 text-lg font-black text-indigo-600">
              {(currentName || displayEmail || "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-black text-slate-900">{currentName || "—"}</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-500">{displayEmail}</div>
              <div className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600">
                {sess?.user?.role || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={["flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition",
                activeTab === t.key
                  ? "border-indigo-300 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"].join(" ")}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-sm font-black text-slate-900">
              {tabs.find((t) => t.key === activeTab)?.label}
            </div>
          </div>
          <div className="p-5">
            {activeTab === "email" && (
              <ChangeEmailSection
                currentEmail={displayEmail}
                onSuccess={(newEmail) => setDisplayEmail(newEmail)}
              />
            )}
            {activeTab === "password" && (
              <ChangePasswordSection
                onLogout={() => router.push("/auth/login")}
              />
            )}
          </div>
        </div>

      </div>
    </TailAdminLayout>
  );
}