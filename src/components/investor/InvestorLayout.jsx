import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const menus = [
  { href: "/investor", label: "Projects" },
  { href: "/investor/fundings", label: "My Fundings" },
];

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_session");
  localStorage.removeItem("access_token");
}

export default function InvestorLayout({ title = "Investor", children }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      try {
        const raw = localStorage.getItem("auth_session");
        const sess = raw ? JSON.parse(raw) : null;
        const token = sess?.token || localStorage.getItem("access_token") || "";

        if (!token) {
          clearSession();
          router.replace("/auth/login");
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            key: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          clearSession();
          router.replace("/auth/login");
          return;
        }

        if (!alive) return;

        if (data?.role !== "investor") {
          router.replace("/");
          return;
        }

        setMe(data);
      } catch {
        clearSession();
        router.replace("/auth/login");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadMe();
    return () => {
      alive = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      const raw = localStorage.getItem("auth_session");
      const sess = raw ? JSON.parse(raw) : null;
      const token = sess?.token || localStorage.getItem("access_token") || "";

      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            key: API_KEY,
            Authorization: `Bearer ${token}`,
          },
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
      <div className="flex">
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-slate-200">
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white grid place-items-center font-black">
                FF
              </div>
              <div>
                <div className="font-black text-slate-900">Fondofund</div>
                <div className="text-xs font-bold text-slate-500">Investor Panel</div>
              </div>
            </div>
          </div>

          <div className="px-6 pt-5 pb-3 text-xs font-black text-slate-400">MENU</div>
          <nav className="px-4 space-y-1">
            {menus.map((m) => {
              const active = router.pathname === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={[
                    "flex items-center rounded-xl px-4 py-3 text-sm font-black transition",
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400">LOGIN AS</div>
              <div className="mt-2 text-sm font-black text-slate-900">{me?.name || "Investor"}</div>
              <div className="text-xs font-bold text-slate-500">{me?.email || "-"}</div>

              <button
                onClick={handleLogout}
                className="mt-4 w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                  Investor
                </div>
                <div className="text-lg font-black text-slate-900">{title}</div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-2">
                <div className="text-sm font-black text-slate-900">{me?.name || "Investor"}</div>
                <div className="text-xs font-bold text-slate-400">Pemberi Dana</div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}