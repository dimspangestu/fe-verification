// src/components/pd/InvestorTailAdminLayout.jsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { readSession } from "../../components/pd/pdStore";

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
    case "table":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 10h16M8 6v12M16 6v12" stroke="currentColor" strokeWidth="1.6" />
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
    case "menu":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

const investorMenus = [
  { href: "/investor",        label: "Dashboard", icon: "dashboard" },
  { href: "/investor/status", label: "Status",    icon: "table"     },
];

const normalizePath = (p) => (p.endsWith("/") ? p.slice(0, -1) : p);

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "IN";
}

/* ── Shared sidebar content ── */
function SidebarContent({ router, userName, roleLabel, onNavClick }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-black shrink-0">
            FF
          </div>
          <div className="leading-tight">
            <div className="font-black text-slate-900">Fondofund</div>
            <div className="text-xs font-semibold text-slate-500">Investor</div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-3 text-xs font-bold text-slate-400 tracking-wider">MENU</div>
      <nav className="px-4 space-y-1 flex-1">
        {investorMenus.map((m) => {
          const active = normalizePath(router.pathname) === normalizePath(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNavClick}
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

      {/* Support card */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-500">SUPPORT</div>
          <div className="mt-2 text-sm font-semibold text-slate-700">Perlu bantuan?</div>
          <div className="mt-1 text-xs text-slate-500">
            Hubungi admin untuk akses dokumen & negosiasi.
          </div>
          <button
            className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800 transition"
            onClick={() => alert("Dummy action")}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorTailAdminLayout({ title = "Dashboard", children }) {
  const router = useRouter();

  const [mounted,    setMounted]    = useState(false);
  const [session,    setSession]    = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(readSession());
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const userName = useMemo(() => {
    if (!mounted) return "Investor";
    return session?.user?.companyName || session?.user?.email || "Investor";
  }, [mounted, session]);

  const roleLabel = useMemo(() => {
    if (!mounted) return "Investor";
    return session?.user?.role || "Investor";
  }, [mounted, session]);

  if (!mounted) return null;

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
            userName={userName}
            roleLabel={roleLabel}
            onNavClick={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      <div className="flex">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200 overflow-y-auto">
          <SidebarContent
            router={router}
            userName={userName}
            roleLabel={roleLabel}
            onNavClick={() => {}}
          />
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* Topbar */}
          <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex items-center gap-3">

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center shrink-0"
              >
                <Icon name="menu" className="h-5 w-5 text-slate-600" />
              </button>

              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon name="search" className="h-4 w-4" />
                  </span>
                  <input
                    placeholder="Search..."
                    className="w-full h-10 rounded-2xl bg-white border border-slate-200 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 transition"
                  />
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition">
                  <Icon name="moon" className="h-4 w-4" />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition relative">
                  <Icon name="bell" className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                </button>

                {/* Avatar */}
                <div className="hidden sm:flex ml-1 items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3 py-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 grid place-items-center text-xs font-black text-indigo-600 shrink-0">
                    {getInitials(userName)}
                  </div>
                  <div className="hidden md:block leading-tight max-w-[140px]">
                    <div className="text-sm font-extrabold text-slate-800 truncate">{userName}</div>
                    <div className="text-xs font-bold text-slate-400">{roleLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
            <div className="mb-4">
              <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                {title}
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
        <div className="flex items-stretch">
          {investorMenus.map((m) => {
            const active = normalizePath(router.pathname) === normalizePath(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold transition relative",
                  active ? "text-indigo-600" : "text-slate-400",
                ].join(" ")}
              >
                <Icon name={m.icon} className="h-5 w-5" />
                <span>{m.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}