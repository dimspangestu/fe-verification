import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 3h-6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 11h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 15H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "forms":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.5M3.5 12h.5M3.5 18h.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "table":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 10h16M8 6v12M16 6v12" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

const menus = [
  { href: "/penerima-dana",         label: "Dashboard", icon: "dashboard" },
  { href: "/penerima-dana/form",    label: "Forms",     icon: "forms"     },
  { href: "/penerima-dana/status",  label: "Status",    icon: "table"     },
  { href: "/penerima-dana/profile", label: "Profile",   icon: "profile"   }, // ← added
];

function roleRedirect(role) {
  if (role === "admin") return "/admin";
  if (role === "investor") return "/investor";
  return "/penerima-dana";
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

export default function TailAdminLayout({ title = "Dashboard", children }) {
  const router = useRouter();

  const [mounted, setMounted]       = useState(false);
  const [token, setToken]           = useState("");
  const [me, setMe]                 = useState(null);
  const [loadingMe, setLoadingMe]   = useState(true);

  const isPenerimaDana = useMemo(() => me?.role === "penerima_dana", [me]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw  = localStorage.getItem("auth_session");
      const sess = raw ? JSON.parse(raw) : null;
      const t    = sess?.token || localStorage.getItem("access_token") || "";
      if (!t) { clearSession(); router.replace("/auth/login"); return; }
      setToken(t);
    } catch {
      clearSession();
      router.replace("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    let alive = true;

    async function loadMe() {
      setLoadingMe(true);
      try {
        const res  = await fetch(`${API_BASE}/auth/me`, {
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) { clearSession(); router.replace("/auth/login"); return; }
        if (!alive) return;

        setMe(data);
        if (data?.role !== "penerima_dana") {
          router.replace(roleRedirect(data?.role));
        }
      } catch {
        clearSession();
        router.replace("/auth/login");
      } finally {
        if (alive) setLoadingMe(false);
      }
    }

    loadMe();
    return () => { alive = false; };
  }, [token, router]);

  async function handleLogout() {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }
    } finally {
      clearSession();
      router.replace("/auth/login");
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-black">
                FF
              </div>
              <div className="leading-tight">
                <div className="font-black text-slate-900">Fondofund</div>
                <div className="text-xs font-semibold text-slate-500">Penerima Dana</div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-3 text-xs font-bold text-slate-400">MENU</div>
          <nav className="px-4 space-y-1">
            {menus.map((m) => {
              const active = router.pathname === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span className={active ? "text-indigo-700" : "text-slate-400"}>
                    <Icon name={m.icon} />
                  </span>
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 space-y-3">
            {/* Account card — clicking name navigates to profile */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">ACCOUNT</div>

              {loadingMe ? (
                <div className="mt-2 space-y-1.5">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
                </div>
              ) : me ? (
                <Link href="/penerima-dana/profile" className="block mt-2 group">
                  <div className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition">
                    {me.name || "User"}
                  </div>
                  <div className="text-xs font-bold text-slate-500">{me.email}</div>
                </Link>
              ) : (
                <div className="mt-2 text-sm font-semibold text-slate-700">Tidak ada sesi</div>
              )}

              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold text-slate-500">SUPPORT</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">Perlu bantuan?</div>
              <div className="mt-1 text-xs text-slate-500">
                Hubungi admin untuk verifikasi dokumen.
              </div>
              <button
                className="mt-3 w-full rounded-xl bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-indigo-500"
                onClick={() => alert("Dummy action")}
              >
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1">
          {/* Topbar */}
          <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex items-center gap-4">
              <button className="lg:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center">
                <span className="text-slate-600">≡</span>
              </button>

              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="search" className="h-5 w-5" />
                  </span>
                  <input
                    placeholder="Search or type command..."
                    className="w-full h-11 rounded-2xl bg-white border border-slate-200 pl-11 pr-24 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ⌘ K
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50">
                  <Icon name="moon" />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 relative">
                  <Icon name="bell" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                </button>

                {/* Avatar — clicking navigates to profile */}
                <Link
                  href="/penerima-dana/profile"
                  className="ml-2 flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2 hover:border-indigo-200 hover:bg-indigo-50 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 grid place-items-center text-xs font-black text-indigo-600 shrink-0">
                    {loadingMe ? "…" : getInitials(me?.name)}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-sm font-extrabold text-slate-800">
                      {loadingMe ? "..." : (me?.name || "User")}
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      {loadingMe ? "" : (isPenerimaDana ? "Penerima Dana" : (me?.role || ""))}
                    </div>
                  </div>
                  <button
                    className="text-slate-400 hover:text-slate-700 text-sm font-black"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    title="Logout"
                  >
                    ⎋
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
            <div className="mb-5">
              <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                {title}
              </div>
            </div>
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

/* ── tiny helper (used in topbar avatar) ── */
function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "--";
}