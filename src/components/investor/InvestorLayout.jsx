import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

// Pages that require KYC verified
const KYC_REQUIRED_PATHS = ["/investor", "/investor/fundings"];

const ALL_MENUS = [
  { href: "/investor",          label: "Projects",       icon: "grid",     requiresKyc: true  },
  { href: "/investor/fundings", label: "My Fundings",    icon: "wallet",   requiresKyc: true  },
  { href: "/investor/profile",  label: "Profile",        icon: "profile",  requiresKyc: false },
  { href: "/investor/account",  label: "Akun & Keamanan", icon: "settings", requiresKyc: false },
];

const KYC_STATUS_CONFIG = {
  unverified: { label: "Belum Verifikasi", cls: "border-slate-200 bg-slate-50 text-slate-600",   dot: "bg-slate-400"   },
  pending:    { label: "Menunggu Review",  cls: "border-amber-200 bg-amber-50 text-amber-700",   dot: "bg-amber-500"   },
  verified:   { label: "Terverifikasi",    cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected:   { label: "Ditolak",          cls: "border-rose-200 bg-rose-50 text-rose-700",      dot: "bg-rose-500"    },
};

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
  if (name === "profile") return (
    <svg {...p}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  if (name === "lock") return (
    <svg {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
  if (name === "settings") return (
    <svg {...p}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

// ─────────────────────────────────────────────
//  KYC Banner (shown on all non-verified pages)
// ─────────────────────────────────────────────
function KycBanner({ kycStatus, kycNote }) {
  if (kycStatus === "verified") return null;

  const banners = {
    unverified: {
      cls:   "border-slate-200 bg-slate-50 text-slate-700",
      icon:  "🔒",
      title: "Lengkapi profil & upload dokumen KYC",
      desc:  "Upload dokumen yang diperlukan di halaman Profile untuk mengaktifkan akses penuh.",
      cta:   { href: "/investor/profile", label: "Lengkapi Sekarang" },
    },
    pending: {
      cls:   "border-amber-200 bg-amber-50 text-amber-800",
      icon:  "⏳",
      title: "Dokumen KYC sedang direview admin",
      desc:  "Kami sedang memverifikasi dokumen Anda. Proses biasanya 1×24 jam kerja.",
      cta:   null,
    },
    rejected: {
      cls:   "border-rose-200 bg-rose-50 text-rose-800",
      icon:  "✕",
      title: "Dokumen KYC ditolak",
      desc:  kycNote ? `Alasan: ${kycNote}` : "Silakan upload ulang dokumen yang sesuai di halaman Profile.",
      cta:   { href: "/investor/profile", label: "Upload Ulang" },
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
        <Link href={b.cta.href}
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-xl border border-current bg-white/60 px-4 text-xs font-black hover:bg-white/90 transition">
          {b.cta.label} →
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Sidebar Content
// ─────────────────────────────────────────────
function SidebarContent({ router, me, kycStatus, kycLoading, onNavClick, handleLogout }) {
  const isVerified = kycStatus === "verified";
  const kycCfg     = KYC_STATUS_CONFIG[kycStatus] || KYC_STATUS_CONFIG.unverified;

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

      {/* KYC status chip */}
      {!kycLoading && (
        <div className="px-4 pt-4">
          <div className={["flex items-center gap-2 rounded-xl border px-3 py-2", kycCfg.cls].join(" ")}>
            <span className={["h-2 w-2 rounded-full shrink-0", kycCfg.dot].join(" ")} />
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-wide uppercase opacity-60">KYC Status</div>
              <div className="text-xs font-extrabold truncate">{kycCfg.label}</div>
            </div>
            {!isVerified && (
              <span className="ml-auto shrink-0 opacity-40">
                <Icon name="lock" className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-6 pt-5 pb-3 text-xs font-black text-slate-400 tracking-wider">MENU</div>

      <nav className="px-4 space-y-1 flex-1">
        {ALL_MENUS.map((m) => {
          const locked = m.requiresKyc && !isVerified;
          const active = router.pathname === m.href;

          if (locked) {
            return (
              <div key={m.href}
                title="Selesaikan verifikasi KYC untuk mengakses menu ini"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-slate-300 cursor-not-allowed select-none">
                <Icon name={m.icon} className="h-4 w-4 text-slate-300" />
                <span className="flex-1">{m.label}</span>
                <Icon name="lock" className="h-3.5 w-3.5 text-slate-300" />
              </div>
            );
          }

          return (
            <Link key={m.href} href={m.href} onClick={onNavClick}
              className={[
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition",
                active ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}>
              <Icon name={m.icon} className={["h-4 w-4", active ? "text-white" : "text-slate-400"].join(" ")} />
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
export default function InvestorLayout({ title = "Investor", children }) {
  const router = useRouter();

  const [me,         setMe]         = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [kycStatus,  setKycStatus]  = useState("unverified");
  const [kycNote,    setKycNote]    = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycToast,   setKycToast]   = useState(false);

  const isVerified = kycStatus === "verified";

  // Toast when polling detects KYC verified
  useEffect(() => {
    function onVerified() {
      setKycToast(true);
      setTimeout(() => setKycToast(false), 7000);
    }
    window.addEventListener("kyc-verified", onVerified);
    return () => window.removeEventListener("kyc-verified", onVerified);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Load auth/me
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
  }, []);

  // Load investor KYC status
  useEffect(() => {
    let alive   = true;
    let timerId = null;

    async function loadKyc(isFirst = false) {
      if (isFirst) setKycLoading(true);
      try {
        const token = getToken();
        const res   = await fetch(`${API_BASE}/investor/profile`, {
          headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        const newStatus = data?.kyc_status || "unverified";
        setKycStatus((prev) => {
          // Show toast when status upgrades to verified
          if (prev !== "verified" && newStatus === "verified") {
            // Trigger a custom event so UI can react
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

    // Poll every 30 seconds — stops once verified (no need to keep polling)
    timerId = setInterval(async () => {
      if (!alive) return;
      setKycStatus((current) => {
        // Stop polling when already verified
        if (current === "verified") {
          clearInterval(timerId);
          return current;
        }
        return current;
      });
      await loadKyc(false);
    }, 30_000);

    return () => {
      alive = false;
      clearInterval(timerId);
    };
  }, []);

  // Guard: redirect KYC-required pages if not verified
  useEffect(() => {
    if (kycLoading) return;
    if (!isVerified && KYC_REQUIRED_PATHS.includes(router.pathname)) {
      router.replace("/investor/profile?kyc_required=1");
    }
  }, [kycLoading, isVerified, router.pathname]);

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
        <div className="text-sm font-bold text-slate-500">Memuat investor panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <div className={[
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 lg:hidden",
        drawerOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>
        <button onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-500 hover:bg-slate-100">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="h-full overflow-y-auto">
          <SidebarContent router={router} me={me} kycStatus={kycStatus} kycLoading={kycLoading}
            onNavClick={() => setDrawerOpen(false)} handleLogout={handleLogout} />
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200 overflow-y-auto">
          <SidebarContent router={router} me={me} kycStatus={kycStatus} kycLoading={kycLoading}
            onNavClick={() => {}} handleLogout={handleLogout} />
        </aside>

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
                  <div className="text-xs font-black tracking-wider text-slate-400 uppercase">Investor</div>
                  <div className="text-lg font-black text-slate-900 truncate">{title}</div>
                </div>
              </div>

              <Link href="/investor/profile"
                className="rounded-2xl bg-white border border-slate-200 px-3 py-2 flex items-center gap-2 shrink-0 hover:border-emerald-200 hover:bg-emerald-50 transition">
                <div className="h-7 w-7 rounded-full bg-emerald-100 grid place-items-center text-xs font-black text-emerald-700 shrink-0">
                  {getInitials(me?.name)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-black text-slate-900 max-w-[120px] truncate">{me?.name || "Investor"}</div>
                  <div className="text-xs font-bold text-slate-400">Pemberi Dana</div>
                </div>
              </Link>
            </div>
          </div>

          {/* KYC verified toast */}
          {kycToast && (
            <div className="fixed bottom-5 right-5 z-[9999] flex items-start gap-3 rounded-2xl border border-emerald-400 bg-emerald-600 px-5 py-4 shadow-2xl text-white max-w-xs">
              <span className="text-2xl shrink-0 mt-0.5">🎉</span>
              <div className="flex-1">
                <div className="text-sm font-black">KYC Terverifikasi!</div>
                <div className="mt-0.5 text-xs font-semibold text-emerald-100 leading-relaxed">
                  Selamat! Akun Anda sudah aktif. Semua fitur investor kini bisa diakses.
                </div>
              </div>
              <button onClick={() => setKycToast(false)} className="shrink-0 text-emerald-200 hover:text-white font-black text-lg leading-none mt-0.5">✕</button>
            </div>
          )}

          {/* Page content */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
            {/* KYC Banner */}
            {!kycLoading && <KycBanner kycStatus={kycStatus} kycNote={kycNote} />}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
        <div className="flex items-stretch">
          {ALL_MENUS.map((m) => {
            const locked = m.requiresKyc && !isVerified;
            const active = router.pathname === m.href;

            if (locked) {
              return (
                <button key={m.href}
                  onClick={() => router.push("/investor/profile?kyc_required=1")}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold text-slate-300 relative"
                  title="Selesaikan KYC untuk akses">
                  <span className="relative">
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
              <Link key={m.href} href={m.href}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold transition relative",
                  active ? "text-emerald-600" : "text-slate-400",
                ].join(" ")}>
                <Icon name={m.icon} className="h-5 w-5" />
                <span>{m.label}</span>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-600" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}