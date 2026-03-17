// src/pages/auth/login.jsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function normalizeRole(role) {
  if (role === "penerima_dana") return "penerima";
  return role;
}

function roleRedirectPath(role) {
  if (role === "admin") return "/admin";
  if (role === "investor") return "/investor";
  return "/penerima-dana";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Login → dapat token
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: API_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok) {
        throw new Error(loginData?.detail || "Login gagal.");
      }

      const token = loginData.access_token;

      // 2️⃣ Ambil profile → cek role dari backend
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          key: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const meData = await meRes.json().catch(() => ({}));

      if (!meRes.ok) {
        throw new Error(meData?.detail || "Gagal mengambil profil.");
      }

      const normalizedRole = normalizeRole(meData.role);

      // 3️⃣ Simpan session
      const session = {
        token,
        token_type: loginData.token_type,
        user: {
          id: meData.id,
          name: meData.name,
          email: meData.email,
          phone: meData.phone,
          role: normalizedRole,
        },
      };

      localStorage.setItem("auth_session", JSON.stringify(session));
      localStorage.setItem("access_token", token);

      // 4️⃣ Redirect sesuai role backend
      await router.push(roleRedirectPath(normalizedRole));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>AUTH</div>
          <h1 style={styles.title}>Login</h1>
          <p style={styles.subtitle}>
            Masuk menggunakan akun yang terdaftar.
          </p>
        </div>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={styles.input}
            />
          </label>

          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? "Memproses..." : "Login"}
          </button>

          <div style={styles.links}>
            Belum punya akun?{" "}
            <Link href="/auth/register" style={styles.link}>
              Register
            </Link>
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
    maxWidth: 420,
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
  },
  title: { margin: "10px 0 4px", fontSize: 26, fontWeight: 900, color: "#083A57" },
  subtitle: { margin: 0, color: "#5C6B7A", fontWeight: 600 },
  alert: {
    margin: "16px 22px 0",
    padding: "12px",
    borderRadius: 12,
    background: "rgba(220, 38, 38, 0.10)",
    border: "1px solid rgba(220, 38, 38, 0.25)",
    color: "#7f1d1d",
    fontWeight: 700,
    fontSize: 13,
  },
  form: { padding: 22, display: "grid", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: 13, fontWeight: 800, color: "#083A57" },
  input: {
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "0 12px",
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
    cursor: "pointer",
  },
  links: { marginTop: 10, fontSize: 13, fontWeight: 600 },
  link: { color: "#00778B", fontWeight: 900, textDecoration: "none" },
};