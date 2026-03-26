import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

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
    case "x":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

// All menus — requiresKyc: true means hidden until verified
const ALL_MENUS = [
  { href: "/penerima-dana",         label: "Dashboard",    icon: "dashboard", requiresKyc: false },
  { href: "/penerima-dana/form",    label: "Forms",        icon: "forms",     requiresKyc: true  },
  { href: "/penerima-dana/status",  label: "Status",       icon: "table",     requiresKyc: true  },
  { href: "/penerima-dana/profile", label: "Profile",      icon: "profile",   requiresKyc: false },
  { href: "/penerima-dana/account", label: "Akun & Keamanan", icon: "settings", requiresKyc: false },
];

// Pages that require KYC — redirect if not verified
const KYC_REQUIRED_PATHS = ["/penerima-dana/form", "/penerima-dana/status"];

const KYC_STATUS_CONFIG = {
  unverified: {
    label: "Belum Verifikasi",
    cls: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
  pending: {
    label: "Menunggu Review",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  verified: {
    label: "Terverifikasi",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Ditolak",
    cls: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

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

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "--";
}

// ─────────────────────────────────────────────
//  KYC Status Banner (shown inside main content)
// ─────────────────────────────────────────────
function KycBanner({ kycStatus, kycNote }) {
  if (kycStatus === "verified") return null;

  const banners = {
    unverified: {
      cls: "border-slate-200 bg-slate-50 text-slate-700",
      icon: "🔒",
      title: "Lengkapi profil & upload dokumen KYC",
      desc: "Upload buku tabungan, NPWP, akta perusahaan, dan izin usaha di halaman Profile untuk mengaktifkan akses penuh.",
      cta: { href: "/penerima-dana/profile", label: "Lengkapi Sekarang" },
    },
    pending: {
      cls: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "⏳",
      title: "Dokumen KYC sedang direview admin",
      desc: "Kami sedang memverifikasi dokumen Anda. Proses ini biasanya memakan waktu 1×24 jam kerja.",
      cta: null,
    },
    rejected: {
      cls: "border-rose-200 bg-rose-50 text-rose-800",
      icon: "✕",
      title: "Dokumen KYC ditolak",
      desc: kycNote ? `Alasan: ${kycNote}` : "Silakan upload ulang dokumen yang sesuai di halaman Profile.",
      cta: { href: "/penerima-dana/profile", label: "Upload Ulang" },
    },
  };

  const b = banners[kycStatus];
  if (!b) return null;

  return (
    <div className={["mb-4 flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between", b.cls].join(" ")}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
        <div>
          <div className="text-sm font-black">{b.title}</div>
          <div className="mt-0.5 text-xs font-semibold opacity-80">{b.desc}</div>
        </div>
      </div>
      {b.cta && (
        <Link
          href={b.cta.href}
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-xl border border-current bg-white/60 px-4 text-xs font-black hover:bg-white/90 transition"
        >
          {b.cta.label} →
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Sidebar Content
// ─────────────────────────────────────────────
function SidebarContent({ me, loadingMe, kycStatus, kycLoading, router, onNavClick, handleLogout }) {
  const isVerified = kycStatus === "verified";
  const kycCfg = KYC_STATUS_CONFIG[kycStatus] || KYC_STATUS_CONFIG.unverified;

  // Visible menus: always show non-kyc menus; only show kyc-required if verified
  const visibleMenus = ALL_MENUS.filter((m) => !m.requiresKyc || isVerified);

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
            <div className="text-xs font-semibold text-slate-500">Penerima Dana</div>
          </div>
        </div>
      </div>

      {/* KYC status chip in sidebar */}
      {!kycLoading && (
        <div className="px-4 pb-3">
          <div className={[
            "flex items-center gap-2 rounded-xl border px-3 py-2",
            kycCfg.cls,
          ].join(" ")}>
            <span className={["h-2 w-2 rounded-full shrink-0", kycCfg.dot].join(" ")} />
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-wide uppercase opacity-60">KYC Status</div>
              <div className="text-xs font-extrabold truncate">{kycCfg.label}</div>
            </div>
            {!isVerified && (
              <span className="ml-auto shrink-0">
                <Icon name="lock" className="h-3.5 w-3.5 opacity-50" />
              </span>
            )}
            {isVerified && (
              <span className="ml-auto shrink-0">
                <Icon name="shield" className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-6 pb-3 text-xs font-bold text-slate-400 tracking-wider">MENU</div>

      <nav className="px-4 space-y-1 flex-1">
        {/* Visible menus */}
        {visibleMenus.map((m) => {
          const active = router.pathname === m.href;
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

        {/* Locked menus — shown as disabled when not verified */}
        {!isVerified && !kycLoading && ALL_MENUS.filter((m) => m.requiresKyc).map((m) => (
          <div
            key={m.href}
            title="Selesaikan verifikasi KYC untuk mengakses menu ini"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 cursor-not-allowed select-none"
          >
            <span className="text-slate-300">
              <Icon name={m.icon} />
            </span>
            <span className="flex-1">{m.label}</span>
            <Icon name="lock" className="h-3.5 w-3.5 text-slate-300" />
          </div>
        ))}
      </nav>

      {/* Account card */}
      <div className="p-4 space-y-3 mt-auto">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-500">ACCOUNT</div>
          {loadingMe ? (
            <div className="mt-2 space-y-1.5">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
            </div>
          ) : me ? (
            <Link href="/penerima-dana/profile" onClick={onNavClick} className="block mt-2 group">
              <div className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition truncate">
                {me.name || "User"}
              </div>
              <div className="text-xs font-bold text-slate-500 truncate">{me.email}</div>
            </Link>
          ) : (
            <div className="mt-2 text-sm font-semibold text-slate-700">Tidak ada sesi</div>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800 transition"
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
            className="mt-3 w-full rounded-xl bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-indigo-500 transition"
            onClick={() => alert("Dummy action")}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Layout
// ─────────────────────────────────────────────
export default function TailAdminLayout({ title = "Dashboard", children }) {
  const router = useRouter();

  const [mounted,    setMounted]    = useState(false);
  const [token,      setToken]      = useState("");
  const [me,         setMe]         = useState(null);
  const [loadingMe,  setLoadingMe]  = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [kycStatus,  setKycStatus]  = useState("unverified");
  const [kycNote,    setKycNote]    = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycToast,   setKycToast]   = useState(false);

  const isPenerimaDana = useMemo(() => me?.role === "penerima_dana", [me]);
  const isVerified = kycStatus === "verified";

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Bootstrap: get token
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
  }, []);

  // Load /auth/me
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
        if (data?.role !== "penerima_dana") router.replace(roleRedirect(data?.role));
      } catch {
        clearSession();
        router.replace("/auth/login");
      } finally {
        if (alive) setLoadingMe(false);
      }
    }
    loadMe();
    return () => { alive = false; };
  }, [token]);

  // Load /vendor/me — get kyc_status, with 30s polling until verified
  useEffect(() => {
    if (!token) return;
    let alive   = true;
    let timerId = null;

    async function loadKyc(isFirst = false) {
      if (isFirst) setKycLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/vendor/me`, {
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        const newStatus = data?.kyc_status || "unverified";
        setKycStatus((prev) => {
          // Dispatch event when status first becomes verified
          if (prev !== "verified" && newStatus === "verified") {
            window.dispatchEvent(new CustomEvent("kyc-verified"));
          }
          return newStatus;
        });
        setKycNote(data?.kyc_note || null);
      } catch {
        // non-fatal
      } finally {
        if (alive && isFirst) setKycLoading(false);
      }
    }

    loadKyc(true);

    // Poll every 30 seconds while not yet verified
    timerId = setInterval(async () => {
      if (!alive) return;
      // Read current status from state to decide whether to keep polling
      setKycStatus((current) => {
        if (current === "verified") clearInterval(timerId);
        return current;
      });
      await loadKyc(false);
    }, 30_000);

    return () => {
      alive = false;
      clearInterval(timerId);
    };
  }, [token]);

  // Toast when polling detects KYC verified
  useEffect(() => {
    function onVerified() {
      setKycToast(true);
      setTimeout(() => setKycToast(false), 7000);
    }
    window.addEventListener("kyc-verified", onVerified);
    return () => window.removeEventListener("kyc-verified", onVerified);
  }, []);

  // Guard: redirect if trying to access KYC-required page while not verified
  useEffect(() => {
    if (kycLoading) return;
    if (!isVerified && KYC_REQUIRED_PATHS.includes(router.pathname)) {
      router.replace("/penerima-dana/profile?kyc_required=1");
    }
  }, [kycLoading, isVerified, router.pathname]);

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

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
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
            me={me}
            loadingMe={loadingMe}
            kycStatus={kycStatus}
            kycLoading={kycLoading}
            router={router}
            onNavClick={() => setDrawerOpen(false)}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      <div className="flex">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200 overflow-y-auto">
          <SidebarContent
            me={me}
            loadingMe={loadingMe}
            kycStatus={kycStatus}
            kycLoading={kycLoading}
            router={router}
            onNavClick={() => {}}
            handleLogout={handleLogout}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* Topbar */}
          <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex items-center gap-3">

              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center shrink-0"
              >
                <Icon name="menu" className="h-5 w-5 text-slate-600" />
              </button>

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

              <div className="flex items-center gap-2 shrink-0">
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition">
                  <Icon name="moon" className="h-4 w-4" />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition relative">
                  <Icon name="bell" className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                </button>

                <Link
                  href="/penerima-dana/profile"
                  className="hidden sm:flex ml-1 items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3 py-2 hover:border-indigo-200 hover:bg-indigo-50 transition"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-100 grid place-items-center text-xs font-black text-indigo-600 shrink-0">
                    {loadingMe ? "…" : getInitials(me?.name)}
                  </div>
                  <div className="hidden md:block leading-tight max-w-[120px]">
                    <div className="text-sm font-extrabold text-slate-800 truncate">
                      {loadingMe ? "..." : (me?.name || "User")}
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      {loadingMe ? "" : (isPenerimaDana ? "Penerima Dana" : (me?.role || ""))}
                    </div>
                  </div>
                  <button
                    className="text-slate-400 hover:text-slate-700 text-sm font-black ml-1"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    title="Logout"
                  >
                    ⎋
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* KYC verified toast */}
          {kycToast && (
            <div className="fixed bottom-5 right-5 z-[9999] flex items-start gap-3 rounded-2xl border border-emerald-400 bg-emerald-600 px-5 py-4 shadow-2xl text-white max-w-xs">
              <span className="text-2xl shrink-0 mt-0.5">🎉</span>
              <div className="flex-1">
                <div className="text-sm font-black">KYC Terverifikasi!</div>
                <div className="mt-0.5 text-xs font-semibold text-emerald-100 leading-relaxed">
                  Selamat! Akun Anda sudah aktif. Semua fitur penerima dana kini bisa diakses.
                </div>
              </div>
              <button onClick={() => setKycToast(false)} className="shrink-0 text-emerald-200 hover:text-white font-black text-lg leading-none mt-0.5">✕</button>
            </div>
          )}

          {/* Page content */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
            <div className="mb-4">
              <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                {title}
              </div>
            </div>

            {/* KYC Banner — shown on all pages except when verified */}
            {!kycLoading && (
              <KycBanner kycStatus={kycStatus} kycNote={kycNote} />
            )}

            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation — only show accessible menus */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 safe-area-pb">
        <div className="flex items-stretch">
          {ALL_MENUS.map((m) => {
            const locked = m.requiresKyc && !isVerified;
            const active = router.pathname === m.href;

            if (locked) {
              // Show locked item — tappable but redirects to profile
              return (
                <button
                  key={m.href}
                  onClick={() => router.push("/penerima-dana/profile?kyc_required=1")}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-extrabold text-slate-300 transition relative"
                  title="Selesaikan KYC untuk akses"
                >
                  <span className="text-slate-300 relative">
                    <Icon name={m.icon} className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1">
                      <Icon name="lock" className="h-2.5 w-2.5" />
                    </span>
                  </span>
                  <span>{m.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={m.href}
                href={m.href}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-extrabold transition relative",
                  active ? "text-indigo-600" : "text-slate-400",
                ].join(" ")}
              >
                <span className={active ? "text-indigo-600" : "text-slate-400"}>
                  <Icon name={m.icon} className="h-5 w-5" />
                </span>
                <span>{m.label}</span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}