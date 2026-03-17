import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { readSession, seedIfEmpty } from "./pdStore";

const MENUS = [
  { href: "/penerima-dana", label: "Home" },
  { href: "/penerima-dana/form", label: "Pengajuan Proyek" },
  { href: "/penerima-dana/status", label: "Status Pengajuan" },
];

export default function DashboardLayout({ title, children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = readSession();
    setSession(s);

    if (!s?.user) {
      router.push("/auth/login");
      return;
    }
    if (s.user.role !== "penerima_dana") {
      router.push("/auth/login");
      return;
    }
    seedIfEmpty(s.user);
  }, [router]);

  const activeHref = useMemo(() => {
    const p = router.pathname;
    const found = MENUS.find((m) => p === m.href);
    return found?.href || "/penerima-dana";
  }, [router.pathname]);

  function logout() {
    if (typeof window !== "undefined") localStorage.removeItem("auth_session");
    router.push("/auth/login");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 16, background: "#0b2f45", color: "#fff" }}>
        <div style={{ fontWeight: 900, marginBottom: 12 }}>{session?.user?.companyName || "Penerima Dana"}</div>

        <div style={{ display: "grid", gap: 10 }}>
          {MENUS.map((m) => {
            const active = activeHref === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: active ? "rgba(227,161,48,0.22)" : "rgba(255,255,255,0.08)",
                  fontWeight: 900,
                }}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={logout}
          style={{
            marginTop: 16,
            width: "100%",
            height: 40,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ padding: 18, background: "#f6f8fb" }}>
        <h1 style={{ margin: 0, color: "#083A57" }}>{title || "Dashboard"}</h1>
        <div style={{ marginTop: 12 }}>{children}</div>
      </main>
    </div>
  );
}