import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const menus = [
  { href: "/investor",          label: "Projects",    icon: "grid"   },
  { href: "/investor/fundings", label: "My Fundings", icon: "wallet" },
];

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "IN";
}

function Icon({ name, className = "h-5 w-5" }) {
  const p = { className, viewBox: "0 0 24 24", fill: "none" };
  if (name === "grid") return (
    <svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
  if (name === "wallet") return (
    <svg {...p}>
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
  if (name === "menu") return (
    <svg {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  if (name === "x") return (
    <svg {...p}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  return null;
}

/* ── Shared sidebar content ── */
function SidebarContent({ router, me, onNavClick, handleLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white grid place-items-center font-black shrink-0">
            FF
          </div>
          <div>
            <div className="font-black text-slate-900">Fondofund</div>
            <div className="text-xs font-bold text-slate-500">Investor Panel</div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-3 text-xs font-black text-slate-400 tracking-wider">MENU</div>
      <nav className="px-4 space-y-1 flex-1">
        {menus.map((m) => {
          const active = router.pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNavClick}
              className={[
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition",
                active
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              <Icon
                name={m.icon}
                className={["h-4 w-4", active ? "text-white" : "text-slate-400"].join(" ")}
              />
              {m.label}
            </Link>
          );
        })}
      </nav>

      {/* Account card */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black text-slate-400">LOGIN AS</div>
          <div className="mt-2 text-sm font-black text-slate-900 truncate">{me?.name || "Investor"}</div>
          <div className="text-xs font-bold text-slate-500 truncate">{me?.email || "-"}</div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorLayout({ title = "Investor", children }) {
  const router = useRouter();
  const [me,          setMe]          = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    let alive = true;
    async function loadMe() {
      try {
        const raw   = localStorage.getItem("auth_session");
        const sess  = raw ? JSON.parse(raw) : null;
        const token = sess?.token || localStorage.getItem("access_token") || "";
        if (!token) { clearSession(); router.replace("/auth/login"); return; }

        const res  = await fetch(`${API_BASE}/auth/me`, {
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { clearSession(); router.replace("/auth/login"); return; }
        if (!alive) return;
        if (data?.role !== "investor") { router.replace("/"); return; }
        setMe(data);
      } catch {
        clearSession();
        router.replace("/auth/login");
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadMe();
    return () => { alive = false; };
  }, [router]);

  async function handleLogout() {
    try {
      const raw   = localStorage.getItem("auth_session");
      const sess  = raw ? JSON.parse(raw) : null;
      const token = sess?.token || localStorage.getItem("access_token") || "";
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

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-sm font-bold text-slate-500">Memuat investor panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-500 hover:bg-slate-100"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="h-full overflow-y-auto">
          <SidebarContent
            router={router}
            me={me}
            onNavClick={() => setDrawerOpen(false)}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      <div className="flex">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200 overflow-y-auto">
          <SidebarContent
            router={router}
            me={me}
            onNavClick={() => {}}
            handleLogout={handleLogout}
          />
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* Topbar */}
          <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

              <div className="flex items-center gap-3 min-w-0">
                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center shrink-0"
                >
                  <Icon name="menu" className="h-5 w-5 text-slate-600" />
                </button>

                <div className="min-w-0">
                  <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                    Investor
                  </div>
                  <div className="text-lg font-black text-slate-900 truncate">{title}</div>
                </div>
              </div>

              {/* User badge */}
              <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2 flex items-center gap-2 shrink-0">
                <div className="h-7 w-7 rounded-full bg-emerald-100 grid place-items-center text-xs font-black text-emerald-700 shrink-0">
                  {getInitials(me?.name)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-black text-slate-900 max-w-[120px] truncate">
                    {me?.name || "Investor"}
                  </div>
                  <div className="text-xs font-bold text-slate-400">Pemberi Dana</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
        <div className="flex items-stretch">
          {menus.map((m) => {
            const active = router.pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold transition relative",
                  active ? "text-emerald-600" : "text-slate-400",
                ].join(" ")}
              >
                <Icon name={m.icon} className="h-5 w-5" />
                <span>{m.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}