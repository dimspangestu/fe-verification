// pages/penerima-dana/account.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function getToken() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(localStorage.getItem("auth_session"))?.token || localStorage.getItem("access_token") || ""; }
  catch { return localStorage.getItem("access_token") || ""; }
}
function getSession() {
  try { return JSON.parse(localStorage.getItem("auth_session") || "null"); } catch { return null; }
}
function clearSession() {
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

/* ─── Toast ─── */
function Toast({ visible, message, type }) {
  if (!visible) return null;
  return (
    <div className={[
      "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold shadow-lg max-w-xs",
      type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                         : "border-rose-200 bg-rose-50 text-rose-800",
    ].join(" ")}>
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition";

function Field({ label, required, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-extrabold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

/* ─── Password Input ─── */
function PwInput({ label, hint, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700">{label}</span>
        {hint && <span className="text-[10px] font-bold text-slate-400">{hint}</span>}
      </div>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          autoComplete={autoComplete} placeholder="••••••••"
          className={`${inputCls} pr-24`} />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 hover:text-slate-600">
          {show ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>
    </label>
  );
}

/* ─── Password Strength Bar ─── */
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
  const texts   = ["", "text-rose-500", "text-amber-500", "text-emerald-600", "text-emerald-700"];
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {[1,2,3,4].map((i) => (
        <div key={i} className={["h-1.5 flex-1 rounded-full transition-all",
          i <= score ? colors[score] : "bg-slate-200"].join(" ")} />
      ))}
      <span className={["text-[11px] font-black shrink-0", texts[score]].join(" ")}>
        {labels[score]}
      </span>
    </div>
  );
}

const btnPrimary = "h-11 rounded-xl px-5 text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition";
const btnDisabled = "h-11 rounded-xl px-5 text-sm font-black cursor-not-allowed bg-slate-200 text-slate-500";

/* ─── Tab: Ubah Profil ─── */
function ChangeProfile({ currentName, currentPhone, onProfileChanged, showToast }) {
  const [name,    setName]    = useState(currentName  || "");
  const [phone,   setPhone]   = useState(currentPhone || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { showToast("Nama tidak boleh kosong.", "error"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/me/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", key: API_KEY, Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengubah profil.");

      const sess = getSession();
      if (sess) {
        sess.user.name  = data.name;
        sess.user.phone = data.phone;
        localStorage.setItem("auth_session", JSON.stringify(sess));
      }
      showToast("Profil berhasil diperbarui.", "success");
      onProfileChanged({ name: data.name, phone: data.phone });
    } catch (err) {
      showToast(err.message || "Gagal mengubah profil.", "error");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Nama Lengkap" required>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap" autoComplete="name" className={inputCls} />
      </Field>
      <Field label="Nomor Telepon">
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ""))}
          placeholder="08xx-xxxx-xxxx" autoComplete="tel" inputMode="tel" className={inputCls} />
      </Field>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className={loading ? btnDisabled : btnPrimary}>
          {loading ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>
    </form>
  );
}

/* ─── Tab: Ubah Email ─── */
function ChangeEmail({ currentEmail, onEmailChanged, showToast }) {
  const [newEmail,  setNewEmail]  = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newEmail.trim()) { showToast("Email baru wajib diisi.", "error"); return; }
    if (!password)        { showToast("Password saat ini wajib diisi.", "error"); return; }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      showToast("Email baru sama dengan email saat ini.", "error"); return;
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

      const sess = getSession();
      if (sess) { sess.user.email = data.email; localStorage.setItem("auth_session", JSON.stringify(sess)); }
      showToast(`Email berhasil diubah ke ${data.email}.`, "success");
      setNewEmail(""); setPassword("");
      onEmailChanged(data.email);
    } catch (err) {
      showToast(err.message || "Gagal mengubah email.", "error");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-[10px] font-black uppercase text-slate-400">Email Saat Ini</div>
        <div className="mt-0.5 text-sm font-black text-slate-900">{currentEmail || "—"}</div>
      </div>
      <Field label="Email Baru" required>
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email-baru@contoh.com" autoComplete="email" className={inputCls} />
      </Field>
      <PwInput label="Konfirmasi Password Saat Ini" hint="Untuk verifikasi"
        value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className={loading ? btnDisabled : btnPrimary}>
          {loading ? "Menyimpan..." : "Ubah Email"}
        </button>
      </div>
    </form>
  );
}

/* ─── Tab: Ubah Password ─── */
function ChangePassword({ showToast, onLogout }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentPw)          { showToast("Password saat ini wajib diisi.", "error"); return; }
    if (newPw.length < 8)    { showToast("Password baru minimal 8 karakter.", "error"); return; }
    if (newPw !== confirmPw) { showToast("Konfirmasi password tidak cocok.", "error"); return; }
    if (newPw === currentPw) { showToast("Password baru tidak boleh sama dengan lama.", "error"); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", key: API_KEY, Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengubah password.");
      showToast("Password berhasil diubah. Logout dalam 3 detik...", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { clearSession(); onLogout(); }, 3000);
    } catch (err) {
      showToast(err.message || "Gagal mengubah password.", "error");
    } finally { setLoading(false); }
  }

  const mismatch = confirmPw && confirmPw !== newPw;
  const match    = confirmPw && confirmPw === newPw;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <PwInput label="Password Saat Ini" value={currentPw}
        onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" />
      <label className="grid gap-1.5">
        <span className="text-xs font-extrabold text-slate-700">Password Baru</span>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
          placeholder="Minimal 8 karakter" autoComplete="new-password" className={inputCls} />
        <StrengthBar password={newPw} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-extrabold text-slate-700">Konfirmasi Password Baru</span>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Ulangi password baru" autoComplete="new-password"
          className={[
            "h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none focus:ring-4 transition",
            mismatch ? "border-rose-300 bg-rose-50 focus:ring-rose-100"
            : match  ? "border-emerald-300 bg-emerald-50 focus:ring-emerald-100"
                     : "border-slate-200 bg-white focus:border-indigo-300 focus:ring-indigo-100",
          ].join(" ")} />
        {mismatch && <span className="text-[11px] font-bold text-rose-500">Password tidak cocok.</span>}
        {match    && <span className="text-[11px] font-bold text-emerald-600">✓ Password cocok.</span>}
      </label>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
        ⚠ Setelah mengubah password, Anda akan otomatis logout dan perlu login ulang.
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className={loading ? btnDisabled : btnPrimary}>
          {loading ? "Menyimpan..." : "Ubah Password"}
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ─── */
export default function VendorAccountPage() {
  const router = useRouter();
  const [tab,   setTab]   = useState("profile");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const sess = typeof window !== "undefined" ? getSession() : null;
  const [name,  setName]  = useState(sess?.user?.name  || "");
  const [email, setEmail] = useState(sess?.user?.email || "");
  const [phone, setPhone] = useState(sess?.user?.phone || "");

  let toastTimer = null;
  function showToast(message, type = "success") {
    clearTimeout(toastTimer);
    setToast({ visible: true, message, type });
    toastTimer = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 5000);
  }

  const TABS = [
    { key: "profile",  label: "Ubah Profil",   icon: "👤" },
    { key: "email",    label: "Ubah Email",     icon: "📧" },
    { key: "password", label: "Ubah Password",  icon: "🔑" },
  ];

  const TAB_DESC = {
    profile:  "Perbarui nama dan nomor telepon akun Anda.",
    email:    "Ubah alamat email untuk login dan notifikasi.",
    password: "Buat password baru yang kuat untuk keamanan akun.",
  };

  return (
    <TailAdminLayout title="Akun & Keamanan">
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <div className="max-w-[600px] space-y-4">

        {/* Profile banner */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50 text-lg font-black text-indigo-600">
            {(name || email || "V").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-base font-black text-slate-900 truncate">{name || "—"}</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-500 truncate">{email}</div>
            {phone && <div className="mt-0.5 text-xs font-semibold text-slate-400">{phone}</div>}
            <span className="mt-1.5 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600">
              Penerima Dana
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={[
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition",
                tab === t.key
                  ? "border-indigo-300 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
              ].join(" ")}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-sm font-black text-slate-900">
              {TABS.find((t) => t.key === tab)?.icon}{" "}
              {TABS.find((t) => t.key === tab)?.label}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-400">{TAB_DESC[tab]}</div>
          </div>
          <div className="p-5">
            {tab === "profile" && (
              <ChangeProfile
                currentName={name} currentPhone={phone}
                showToast={showToast}
                onProfileChanged={({ name: n, phone: p }) => { setName(n || name); setPhone(p || ""); }}
              />
            )}
            {tab === "email" && (
              <ChangeEmail
                currentEmail={email} showToast={showToast}
                onEmailChanged={(e) => setEmail(e)}
              />
            )}
            {tab === "password" && (
              <ChangePassword showToast={showToast} onLogout={() => router.push("/auth/login")} />
            )}
          </div>
        </div>

        {/* Security tips */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black text-slate-600 mb-2">🛡️ Tips Keamanan</div>
          <ul className="space-y-1 text-xs font-semibold text-slate-500">
            <li>• Gunakan password minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol.</li>
            <li>• Jangan gunakan password yang sama di platform lain.</li>
            <li>• Email digunakan untuk notifikasi KYC dan transaksi — pastikan selalu aktif.</li>
            <li>• Segera ubah password jika mencurigai akun Anda diakses orang lain.</li>
          </ul>
        </div>

      </div>
    </TailAdminLayout>
  );
}