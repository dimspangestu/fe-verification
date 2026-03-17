import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function fmtIDR(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "-"; }
}

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw  = localStorage.getItem("auth_session");
    const sess = raw ? JSON.parse(raw) : null;
    return sess?.token || localStorage.getItem("access_token") || "";
  } catch { return ""; }
}

/* ─────────────────────────────────────────────────────────
   Status badge
───────────────────────────────────────────────────────── */
const STATUS_CFG = {
  draft:                { cls: "bg-slate-100 text-slate-600",    label: "Draft" },
  ongoing:              { cls: "bg-amber-50 text-amber-700",     label: "On Going" },
  document_generated:   { cls: "bg-blue-50 text-blue-700",       label: "PDF Ready" },
  waiting_signed_upload:{ cls: "bg-violet-50 text-violet-700",   label: "Waiting Signed" },
  submitted:            { cls: "bg-indigo-50 text-indigo-700",   label: "Submitted" },
  waiting_admin_review: { cls: "bg-cyan-50 text-cyan-700",       label: "Waiting Review" },
  doc_review:           { cls: "bg-cyan-50 text-cyan-700",       label: "Doc Review" },
  accepted:             { cls: "bg-emerald-50 text-emerald-700", label: "Accepted" },
  funding_open:         { cls: "bg-emerald-50 text-emerald-700", label: "Funding Open" },
  funding_closed:       { cls: "bg-amber-50 text-amber-700",     label: "Funding Closed" },
  disbursed_to_vendor:  { cls: "bg-sky-50 text-sky-700",         label: "Disbursed" },
  repayment_running:    { cls: "bg-violet-50 text-violet-700",   label: "Repayment" },
  negosiasi:            { cls: "bg-indigo-50 text-indigo-700",   label: "Negosiasi" },
  reject:               { cls: "bg-rose-50 text-rose-700",       label: "Reject" },
  rejected:             { cls: "bg-rose-50 text-rose-700",       label: "Rejected" },
  final_project:        { cls: "bg-teal-50 text-teal-700",       label: "Final Project" },
  closed:               { cls: "bg-slate-100 text-slate-600",    label: "Closed" },
  completed:            { cls: "bg-teal-50 text-teal-700",       label: "Completed" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { cls: "bg-slate-100 text-slate-600", label: status || "-" };
  return (
    <span className={["inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black", cfg.cls].join(" ")}>
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Stat card
───────────────────────────────────────────────────────── */
function StatCard({ icon, title, value, sub, tone = "slate", onClick }) {
  const tones = {
    slate:   { wrap: "border-slate-200 bg-white",           icon: "bg-slate-100 text-slate-600",    val: "text-slate-900" },
    indigo:  { wrap: "border-indigo-100 bg-indigo-50",      icon: "bg-indigo-100 text-indigo-600",   val: "text-indigo-900" },
    emerald: { wrap: "border-emerald-100 bg-emerald-50",    icon: "bg-emerald-100 text-emerald-700", val: "text-emerald-900" },
    amber:   { wrap: "border-amber-100 bg-amber-50",        icon: "bg-amber-100 text-amber-700",     val: "text-amber-900" },
    violet:  { wrap: "border-violet-100 bg-violet-50",      icon: "bg-violet-100 text-violet-700",   val: "text-violet-900" },
    teal:    { wrap: "border-teal-100 bg-teal-50",          icon: "bg-teal-100 text-teal-700",       val: "text-teal-900" },
  };
  const t = tones[tone] || tones.slate;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-5 shadow-sm text-left w-full transition-all",
        t.wrap,
        "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={["h-10 w-10 shrink-0 rounded-xl grid place-items-center text-lg", t.icon].join(" ")}>
          {icon}
        </div>
        <span className="text-slate-300 text-xs mt-1">→</span>
      </div>
      <div className={["mt-3 text-2xl font-black", t.val].join(" ")}>{value}</div>
      <div className="mt-1 text-xs font-black text-slate-500 uppercase tracking-wide">{title}</div>
      {sub && <div className="mt-1 text-xs font-bold text-slate-400">{sub}</div>}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Breakdown row
───────────────────────────────────────────────────────── */
function BreakdownRow({ label, count, total, tone, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColors = {
    slate:   "bg-slate-400",
    indigo:  "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber:   "bg-amber-500",
    violet:  "bg-violet-500",
    rose:    "bg-rose-500",
    sky:     "bg-sky-500",
    teal:    "bg-teal-500",
    cyan:    "bg-cyan-500",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 hover:bg-slate-50 rounded-xl px-2 transition group"
    >
      <div className="w-28 shrink-0 text-left text-xs font-bold text-slate-600 group-hover:text-slate-900 truncate">
        {label}
      </div>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-500", barColors[tone] || barColors.slate].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-14 shrink-0 text-right text-xs font-black text-slate-700">
        {count} <span className="font-bold text-slate-400">({pct}%)</span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={["animate-pulse rounded-xl bg-slate-100", className].join(" ")} />;
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const router = useRouter();

  const [summary,  setSummary]  = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState("");

  /* ── load ── */
  useEffect(() => {
    let alive = true;

    async function loadData() {
      setLoading(true);
      setErr("");
      try {
        const token   = getToken();
        const headers = { key: API_KEY, Authorization: `Bearer ${token}` };

        // projects endpoint sekarang pakai ?limit= dan returns { items, total }
        // jika backend lama masih return array langsung, kedua format ditangani
        const [sumRes, projRes] = await Promise.all([
          fetch(`${API_BASE}/admin/dashboard-summary`, { headers }),
          fetch(`${API_BASE}/admin/projects?limit=8&order=desc`, { headers }),
        ]);

        const sumData  = await sumRes.json().catch(() => ({}));
        const projData = await projRes.json().catch(() => []);

        if (!sumRes.ok) throw new Error(sumData?.detail || "Gagal memuat summary");
        // projects 404/error → tampilkan kosong, jangan crash

        if (!alive) return;
        setSummary(sumData);

        // handle both { items: [...] } and [...] response shapes
        const items = Array.isArray(projData)
          ? projData
          : Array.isArray(projData?.items)
            ? projData.items
            : [];
        setProjects(items.slice(0, 8));
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Gagal memuat dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => { alive = false; };
  }, []);

  /* ── breakdown config ── */
  const breakdown = [
    { status: "ongoing",              label: "On Going",     tone: "amber"   },
    { status: "submitted",            label: "Submitted",    tone: "indigo"  },
    { status: "doc_review",           label: "Doc Review",   tone: "cyan"    },
    { status: "waiting_admin_review", label: "Waiting Review", tone: "cyan"  },
    { status: "accepted",             label: "Accepted",     tone: "emerald" },
    { status: "funding_open",         label: "Funding Open", tone: "emerald" },
    { status: "disbursed_to_vendor",  label: "Disbursed",    tone: "sky"     },
    { status: "repayment_running",    label: "Repayment",    tone: "violet"  },
    { status: "completed",            label: "Completed",    tone: "teal"    },
    { status: "reject",               label: "Rejected",     tone: "rose"    },
    { status: "closed",               label: "Closed",       tone: "slate"   },
  ];

  const totalProjects = summary?.total_projects || 0;

  // status_breakdown tersedia setelah deploy admin_routes.py baru.
  // Sebelum itu, fallback ke {} sehingga bar kosong tapi tidak crash.
  const statusBreakdown = summary?.status_breakdown || {};

  const needsReview =
    (statusBreakdown?.submitted            || 0) +
    (statusBreakdown?.doc_review           || 0) +
    (statusBreakdown?.waiting_admin_review || 0);

  function goProjects(status) {
    const url = status
      ? `/admin/projects?status=${encodeURIComponent(status)}`
      : "/admin/projects";
    router.push(url);
  }

  /* ─────────────── render ─────────────── */
  return (
    <AdminLayout title="Dashboard">

      {err && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {err}
        </div>
      )}

      {/* ── KPI grid — 5 cards, no escrow ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            icon="📁"
            title="Total Projects"
            value={summary?.total_projects ?? 0}
            sub="Semua project masuk"
            tone="slate"
            onClick={() => goProjects(null)}
          />
          <StatCard
            icon="🟢"
            title="Funding Open"
            value={summary?.funding_open_projects ?? 0}
            sub="Sedang open funding"
            tone="emerald"
            onClick={() => goProjects("funding_open")}
          />
          <StatCard
            icon="💰"
            title="Total Fundings"
            value={summary?.total_fundings ?? 0}
            sub="Semua transaksi investor"
            tone="indigo"
            onClick={() => router.push("/admin/fundings")}
          />
          <StatCard
            icon="✅"
            title="Paid Fundings"
            value={summary?.paid_fundings ?? 0}
            sub={`Rp ${fmtIDR(summary?.paid_funding_amount ?? 0)}`}
            tone="teal"
            onClick={() => router.push("/admin/fundings?status=paid")}
          />
          <StatCard
            icon="⏳"
            title="Perlu Review"
            value={needsReview}
            sub="Submitted + doc review"
            tone="amber"
            onClick={() => goProjects("submitted")}
          />
        </div>
      )}

      {/* ── secondary stat row: vendors & investors ── */}
      {!loading && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="🏢"
            title="Total Vendor"
            value={summary?.total_vendors ?? 0}
            sub="Terdaftar di platform"
            tone="violet"
            onClick={() => router.push("/admin/vendors")}
          />
          <StatCard
            icon="👤"
            title="Total Investor"
            value={summary?.total_investors ?? 0}
            sub="User role investor"
            tone="indigo"
            onClick={() => router.push("/admin/investors")}
          />
          <StatCard
            icon="💸"
            title="Total Dana Masuk"
            value={`Rp ${fmtIDR(summary?.paid_funding_amount ?? 0)}`}
            sub="Funding status paid"
            tone="emerald"
            onClick={() => router.push("/admin/fundings?status=paid")}
          />
          <StatCard
            icon="🔑"
            title="KYC Pending"
            value={summary?.kyc_breakdown?.pending ?? 0}
            sub="Vendor menunggu verifikasi"
            tone="amber"
            onClick={() => router.push("/admin/vendors?kyc_status=pending")}
          />
        </div>
      )}

      {/* ── body ── */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Status breakdown */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="text-sm font-black text-slate-900">Status Breakdown</div>
              <div className="text-xs font-bold text-slate-400">
                {Object.keys(statusBreakdown).length === 0
                  ? "Tersedia setelah backend diupdate"
                  : "Klik baris untuk filter project"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goProjects(null)}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800"
            >
              Lihat semua →
            </button>
          </div>

          <div className="px-4 py-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : Object.keys(statusBreakdown).length === 0 ? (
              // breakdown belum tersedia — tampilkan placeholder tanpa crash
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                Deploy <code className="rounded bg-slate-100 px-1">admin_routes.py</code> terbaru<br />
                untuk mengaktifkan breakdown chart.
              </div>
            ) : (
              breakdown.map((b) => (
                <BreakdownRow
                  key={b.status}
                  label={b.label}
                  count={statusBreakdown[b.status] || 0}
                  total={totalProjects}
                  tone={b.tone}
                  onClick={() => goProjects(b.status)}
                />
              ))
            )}
          </div>

          {!loading && totalProjects > 0 && (
            <div className="mx-4 mb-4 mt-1 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <span className="text-xs font-black text-slate-700">Total Semua Project</span>
              <span className="text-sm font-black text-slate-900">{totalProjects}</span>
            </div>
          )}
        </div>

        {/* Recent projects */}
        <div className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="text-sm font-black text-slate-900">Project Terbaru</div>
              <div className="text-xs font-bold text-slate-400">8 project terakhir masuk</div>
            </div>
            <button
              type="button"
              onClick={() => goProjects(null)}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800"
            >
              Lihat semua →
            </button>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <Skeleton className="h-9 w-9 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm font-bold text-slate-400">
              Belum ada project masuk.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => router.push(`/admin/projects/${p.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left group"
                >
                  <div className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-base">
                    {p.project_type === "infrastruktur" ? "🏗️"
                      : p.project_type === "properti"   ? "🏠"
                      : p.project_type === "umkm"       ? "🏪"
                      : "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-700 transition">
                      {p.project_name || p.project_code || "—"}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">
                        Rp {fmtIDR(p.funding_needed)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {p.tenor_months || 0} bln
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {fmtDate(p.submitted_at || p.created_at)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "📋", label: "Semua Project",    sub: "Review & kelola",    href: "/admin/projects"   },
          { icon: "🏢", label: "Semua Vendor",      sub: "KYC & verifikasi",   href: "/admin/vendors"    },
          { icon: "👥", label: "Semua Investor",    sub: "Data & funding",     href: "/admin/investors"  },
          { icon: "💳", label: "Transaksi Funding", sub: "Konfirmasi & bayar", href: "/admin/fundings"   },
        ].map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:border-indigo-200 hover:bg-indigo-50 transition text-left group shadow-sm"
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <div>
              <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition">
                {item.label}
              </div>
              <div className="text-[11px] font-bold text-slate-400">{item.sub}</div>
            </div>
            <span className="ml-auto text-slate-300 group-hover:text-indigo-400 transition">→</span>
          </button>
        ))}
      </div>

    </AdminLayout>
  );
}