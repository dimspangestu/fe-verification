import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

// ─────────────────────────────────────────────
//  Menu definition
//  requiresExact: true  → hanya aktif kalau path persis sama
//  prefix: "/admin/xxx" → aktif untuk semua sub-path
// ─────────────────────────────────────────────
const MENU_GROUPS = [
  {
    label: "UTAMA",
    items: [
      { href: "/admin",          label: "Dashboard", icon: "dashboard", exact: true },
      { href: "/admin/projects", label: "Projects",  icon: "folder"                 },
      { href: "/admin/history",  label: "History",   icon: "clock"                  },
    ],
  },
  {
    label: "VERIFIKASI KYC",
    items: [
      { href: "/admin/kyc/vendor",   label: "KYC Penerima Dana", icon: "kyc-vendor",   badgeKey: "vendor"   },
      { href: "/admin/kyc/investor", label: "KYC Investor",      icon: "kyc-investor", badgeKey: "investor" },
    ],
  },
];

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw  = localStorage.getItem("auth_session");
    const sess = raw ? JSON.parse(raw) : null;
    return sess?.token || localStorage.getItem("access_token") || "";
  } catch { return ""; }
}

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "AD";
}

function Icon({ name, className = "h-5 w-5" }) {
  const p = { className, viewBox: "0 0 24 24", fill: "none" };
  if (name === "dashboard") return (
    <svg {...p}>
      <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 3h-6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 11h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 15H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
  if (name === "folder") return (
    <svg {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
  if (name === "clock") return (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  if (name === "kyc-vendor") return (
    <svg {...p}>
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6V5a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (name === "kyc-investor") return (
    <svg {...p}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 12l1.5 1.5L21 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

// ─────────────────────────────────────────────
//  Sidebar Content
// ─────────────────────────────────────────────
function SidebarContent({ router, me, kycPending, onNavClick, handleLogout }) {
  const totalPending = (kycPending.vendor || 0) + (kycPending.investor || 0);

  function isActive(item) {
    if (item.exact) return router.pathname === item.href;
    return router.pathname.startsWith(item.href);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white grid place-items-center font-black shrink-0">
            FF
          </div>
          <div>
            <div className="font-black text-slate-900">Fondofund</div>
            <div className="text-xs font-bold text-slate-500">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
        {MENU_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2 pb-2 text-[10px] font-black tracking-widest text-slate-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((m) => {
                const active  = isActive(m);
                const pending = m.badgeKey ? (kycPending[m.badgeKey] || 0) : 0;

                return (
                  <Link key={m.href} href={m.href} onClick={onNavClick}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}>
                    <Icon name={m.icon}
                      className={["h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400"].join(" ")} />
                    <span className="flex-1">{m.label}</span>
                    {pending > 0 && (
                      <span className={[
                        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                        active ? "bg-white/20 text-white" : "bg-amber-500 text-white",
                      ].join(" ")}>
                        {pending > 99 ? "99+" : pending}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account card */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black text-slate-400">LOGIN AS</div>
          <div className="mt-2 text-sm font-black text-slate-900 truncate">{me?.name || "Admin"}</div>
          <div className="text-xs font-bold text-slate-500 truncate">{me?.email || "-"}</div>
          <button onClick={handleLogout}
            className="mt-4 w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Layout
// ─────────────────────────────────────────────
export default function AdminLayout({ title = "Admin", children }) {
  const router = useRouter();

  const [me,          setMe]          = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [kycPending,  setKycPending]  = useState({ vendor: 0, investor: 0 });

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Auth check
  useEffect(() => {
    let alive = true;
    async function loadMe() {
      try {
        const token = getToken();
        if (!token) { clearSession(); router.replace("/auth/login"); return; }

        const res  = await fetch(`${API_BASE}/auth/me`, {
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { clearSession(); router.replace("/auth/login"); return; }
        if (!alive) return;
        if (data?.role !== "admin") { router.replace("/"); return; }
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
  }, []);

  // Load KYC pending counts
  useEffect(() => {
    async function loadKycCounts() {
      try {
        const token   = getToken();
        const headers = { key: API_KEY, Authorization: `Bearer ${token}` };

        const [vendorData, investorData] = await Promise.all([
          fetch(`${API_BASE}/admin/vendors/kyc?kyc_status=pending&limit=500`, { headers })
            .then((r) => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/admin/investors/kyc?kyc_status=pending&limit=500`, { headers })
            .then((r) => r.ok ? r.json() : []).catch(() => []),
        ]);

        setKycPending({
          vendor:   Array.isArray(vendorData)   ? vendorData.length   : 0,
          investor: Array.isArray(investorData) ? investorData.length : 0,
        });
      } catch {
        // non-fatal
      }
    }

    // load only after auth is done
    if (!loading) loadKycCounts();
  }, [loading, router.pathname]); // refresh on each navigation

  async function handleLogout() {
    try {
      const token = getToken();
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
        <div className="text-sm font-bold text-slate-500">Memuat admin panel...</div>
      </div>
    );
  }

  const totalPending = (kycPending.vendor || 0) + (kycPending.investor || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={[
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 lg:hidden",
        drawerOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>
        <button onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-500 hover:bg-slate-100">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="h-full overflow-y-auto">
          <SidebarContent router={router} me={me} kycPending={kycPending}
            onNavClick={() => setDrawerOpen(false)} handleLogout={handleLogout} />
        </div>
      </div>

      <div className="flex">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200 overflow-y-auto">
          <SidebarContent router={router} me={me} kycPending={kycPending}
            onNavClick={() => {}} handleLogout={handleLogout} />
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* Topbar */}
          <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setDrawerOpen(true)}
                  className="lg:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center shrink-0">
                  <Icon name="menu" className="h-5 w-5 text-slate-600" />
                </button>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-wider text-slate-400 uppercase">Admin</div>
                  <div className="text-lg font-black text-slate-900 truncate">{title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* KYC pending bell */}
                {totalPending > 0 && (
                  <Link href="/admin/kyc/vendor"
                    className="relative h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                      {totalPending > 99 ? "99+" : totalPending}
                    </span>
                  </Link>
                )}

                {/* User badge */}
                <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-200 grid place-items-center text-xs font-black text-slate-700 shrink-0">
                    {getInitials(me?.name)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-black text-slate-900 max-w-[120px] truncate">{me?.name || "Admin"}</div>
                    <div className="text-xs font-bold text-slate-400">Administrator</div>
                  </div>
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

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
        <div className="flex items-stretch">
          {/* Flatten semua menu untuk mobile bottom nav */}
          {MENU_GROUPS.flatMap((g) => g.items).map((m) => {
            const active  = m.exact
              ? router.pathname === m.href
              : router.pathname.startsWith(m.href);
            const pending = m.badgeKey ? (kycPending[m.badgeKey] || 0) : 0;

            return (
              <Link key={m.href} href={m.href}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold transition relative",
                  active ? "text-slate-900" : "text-slate-400",
                ].join(" ")}>
                <span className="relative">
                  <Icon name={m.icon} className="h-5 w-5" />
                  {pending > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-black text-white">
                      {pending > 9 ? "9+" : pending}
                    </span>
                  )}
                </span>
                <span className="truncate max-w-[52px] text-center">{m.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-slate-900" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}