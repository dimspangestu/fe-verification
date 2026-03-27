// components/layout/AdminTailLayout.jsx
import Link from "next/link";
import { useRouter } from "next/router";

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M20 3h-6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M20 11h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M10 15H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "verify":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M8 7h12M8 12h12M8 17h12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3.5 7h.5M3.5 12h.5M3.5 17h.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "history":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v5l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12a9 9 0 1 0 3-6.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M3 4v4h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "moon":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

const menus = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/verify", label: "List Verifikasi", icon: "verify" },
  { href: "/admin/history", label: "History Transaksi", icon: "history" },
];

export default function AdminTailLayout({ title = "Dashboard", children }) {
  const router = useRouter();

  // biar /admin/history/[id] tetap highlight history, dll
  const activeFor = (href) => {
    if (href === "/admin/history") return router.pathname.startsWith("/admin/history");
    if (href === "/admin/verify") return router.pathname.startsWith("/admin/verify");
    if (href === "/admin") return router.pathname === "/admin";
    return router.pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-black">
                AD
              </div>
              <div className="leading-tight">
                <div className="font-black text-slate-900">TailAdmin</div>
                <div className="text-xs font-semibold text-slate-500">Admin Panel</div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-3 text-xs font-bold text-slate-400">MENU</div>
          <nav className="px-4 space-y-1">
            {menus.map((m) => {
              const active = activeFor(m.href);
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

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">ADMIN</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                Verifikasi Data
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Cek kelengkapan data investor & investee sebelum diproses.
              </div>
              <button
                className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                onClick={() => alert("Dummy action")}
              >
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
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

                <div className="ml-2 flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2">
                  <img
                    src="https://i.pravatar.cc/40?img=12"
                    alt="avatar"
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="hidden sm:block leading-tight">
                    <div className="text-sm font-extrabold text-slate-800">Admin</div>
                    <div className="text-xs font-bold text-slate-400">Verifier</div>
                  </div>
                  <span className="text-slate-400">▾</span>
                </div>
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