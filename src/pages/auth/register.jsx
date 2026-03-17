// src/pages/auth/register.jsx
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const ROLES = [
  { value: "penerima_dana", label: "Penerima Dana" },
  { value: "investor", label: "Investor" },
  { value: "admin", label: "Admin" },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState("penerima_dana");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const roleHint = useMemo(() => {
    const map = {
      admin: "Akun admin sebaiknya dibuat terbatas.",
      investor: "Daftar sebagai investor untuk melihat proyek & menawar pendanaan.",
      penerima_dana: "Daftar sebagai penerima dana untuk mengajukan proyek pendanaan.",
    };
    return map[role] || "";
  }, [role]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!name || !email || !password) {
      setError("Nama, email, dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: API_KEY, // ✅ required by backend
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          role,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.detail ||
          (typeof data === "string" ? data : "Register gagal.");
        throw new Error(msg);
      }

      setOk("Registrasi berhasil. Silakan login.");
      // optional: auto redirect
      setTimeout(() => router.push("/auth/login"), 650);
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>AUTH</div>
          <h1 style={styles.title}>Register</h1>
          <p style={styles.subtitle}>
            Buat akun baru (penerima dana / investor / admin).
          </p>
        </div>

        {error ? <div style={styles.alert}>{error}</div> : null}
        {ok ? <div style={styles.success}>{ok}</div> : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          {roleHint ? <div style={styles.hintBox}>{roleHint}</div> : null}

          <label style={styles.label}>
            Nama
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              autoComplete="name"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            No. Telp
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              autoComplete="tel"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              style={styles.input}
            />
          </label>

          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? "Memproses..." : "Register"}
          </button>

          <div style={styles.helper}>
            <div style={styles.links}>
              Sudah punya akun?{" "}
              <Link href="/auth/login" style={styles.link}>
                Login
              </Link>
            </div>

            <div style={styles.note}>
              API: <b>{API_BASE}</b>
              <br />
              Header: <b>key</b> (wajib)
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "28px 16px",
    background:
      "radial-gradient(900px 400px at 20% 10%, rgba(0, 59, 92, 0.18), transparent), radial-gradient(900px 400px at 80% 30%, rgba(227, 161, 48, 0.18), transparent), #f6f8fb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
    overflow: "hidden",
  },
  header: { padding: 22, borderBottom: "1px solid rgba(0,0,0,0.06)" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0, 59, 92, 0.08)",
    color: "#003B5C",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  title: { margin: "10px 0 4px", fontSize: 28, fontWeight: 900, color: "#083A57" },
  subtitle: { margin: 0, color: "#5C6B7A", fontWeight: 600 },
  alert: {
    margin: "16px 22px 0",
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(220, 38, 38, 0.10)",
    border: "1px solid rgba(220, 38, 38, 0.25)",
    color: "#7f1d1d",
    fontWeight: 700,
    fontSize: 13,
  },
  success: {
    margin: "16px 22px 0",
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.30)",
    color: "#065f46",
    fontWeight: 800,
    fontSize: 13,
  },
  form: { padding: 22, display: "grid", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: 13, fontWeight: 800, color: "#083A57" },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
  },
  button: {
    marginTop: 6,
    height: 46,
    borderRadius: 12,
    border: "none",
    background: "#083A57",
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
  },
  helper: { marginTop: 6, display: "grid", gap: 10 },
  hintBox: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(0,0,0,0.03)",
    border: "1px solid rgba(0,0,0,0.06)",
    color: "#334155",
    fontSize: 12,
    fontWeight: 650,
  },
  links: { fontSize: 13, color: "#475569", fontWeight: 600 },
  link: { color: "#00778B", fontWeight: 900, textDecoration: "none" },
  note: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(0, 119, 139, 0.08)",
    border: "1px solid rgba(0, 119, 139, 0.18)",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 650,
  },
};