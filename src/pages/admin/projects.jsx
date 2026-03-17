import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const PAGE_SIZE = 20;

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
   Status config
───────────────────────────────────────────────────────── */
const STATUS_CFG = {
  draft:                { cls: "bg-slate-100 text-slate-600",    dot: "bg-slate-400",    label: "Draft" },
  ongoing:              { cls: "bg-amber-50 text-amber-700",     dot: "bg-amber-500",    label: "On Going" },
  document_generated:   { cls: "bg-blue-50 text-blue-700",       dot: "bg-blue-500",     label: "PDF Ready" },
  waiting_signed_upload:{ cls: "bg-violet-50 text-violet-700",   dot: "bg-violet-500",   label: "Waiting Signed" },
  submitted:            { cls: "bg-indigo-50 text-indigo-700",   dot: "bg-indigo-500",   label: "Submitted" },
  waiting_admin_review: { cls: "bg-cyan-50 text-cyan-700",       dot: "bg-cyan-500",     label: "Waiting Review" },
  doc_review:           { cls: "bg-cyan-50 text-cyan-700",       dot: "bg-cyan-500",     label: "Doc Review" },
  accepted:             { cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500",  label: "Accepted" },
  funding_open:         { cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500",  label: "Funding Open" },
  funding_closed:       { cls: "bg-amber-50 text-amber-700",     dot: "bg-amber-500",    label: "Funding Closed" },
  disbursed_to_vendor:  { cls: "bg-sky-50 text-sky-700",         dot: "bg-sky-500",      label: "Disbursed" },
  repayment_running:    { cls: "bg-violet-50 text-violet-700",   dot: "bg-violet-500",   label: "Repayment" },
  negosiasi:            { cls: "bg-indigo-50 text-indigo-700",   dot: "bg-indigo-500",   label: "Negosiasi" },
  rejected:               { cls: "bg-rose-50 text-rose-700",       dot: "bg-rose-500",     label: "Rejected" },
  rejected:             { cls: "bg-rose-50 text-rose-700",       dot: "bg-rose-500",     label: "Rejected" },
  final_project:        { cls: "bg-teal-50 text-teal-700",       dot: "bg-teal-500",     label: "Final Project" },
  closed:               { cls: "bg-slate-100 text-slate-600",    dot: "bg-slate-400",    label: "Closed" },
  completed:            { cls: "bg-teal-50 text-teal-700",       dot: "bg-teal-500",     label: "Completed" },
};

const STATUS_TABS = [
  { id: "",                    label: "Semua" },
  { id: "ongoing",             label: "On Going" },
  { id: "submitted",           label: "Submitted" },
  { id: "doc_review",          label: "Doc Review" },
  { id: "waiting_admin_review",label: "Waiting Review" },
  { id: "accepted",            label: "Accepted" },
  { id: "funding_open",        label: "Funding Open" },
  { id: "disbursed_to_vendor", label: "Disbursed" },
  { id: "repayment_running",   label: "Repayment" },
  { id: "completed",           label: "Completed" },
  { id: "rejected",              label: "Rejected" },
  { id: "closed",              label: "Closed" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400", label: status || "-" };
  return (
    <span className={["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black", cfg.cls].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full shrink-0", cfg.dot].join(" ")} />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={["animate-pulse rounded-lg bg-slate-100", className].join(" ")} />;
}

function TableSkeleton({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="p-4"><Skeleton className="h-4 w-32" /></td>
          <td className="p-4"><Skeleton className="h-4 w-20" /></td>
          <td className="p-4"><Skeleton className="h-4 w-28" /></td>
          <td className="p-4"><Skeleton className="h-4 w-16" /></td>
          <td className="p-4"><Skeleton className="h-4 w-20" /></td>
          <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
          <td className="p-4"><Skeleton className="h-8 w-16 rounded-xl" /></td>
        </tr>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // show at most 5 page buttons around current
  const pages = [];
  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  if (left > 1) { pages.push(1); if (left > 2) pages.push("…"); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }

  const btn = (label, disabled, active, onClick) => (
    <button
      key={label}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "h-9 min-w-[36px] px-2 rounded-xl text-xs font-black transition",
        active   ? "bg-slate-900 text-white"
                 : disabled ? "text-slate-300 cursor-not-allowed"
                 : "border border-slate-200 text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {btn("←", page === 1, false, () => onChange(page - 1))}
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
          : btn(p, false, p === page, () => onChange(p))
      )}
      {btn("→", page === totalPages, false, () => onChange(page + 1))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Funding progress bar (mini)
───────────────────────────────────────────────────────── */
function FundingBar({ funded, target }) {
  const pct = target > 0 ? Math.min(Math.round((funded / target) * 100), 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-bold text-slate-500">Rp {fmtIDR(funded)}</span>
        <span className="text-[10px] font-black text-slate-700">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={["h-full rounded-full", pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
function AdminProjectsPageInner() {
  const router = useRouter();

  // ── state ──
  const [projects,    setProjects]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [err,         setErr]         = useState("");

  // filters
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState(""); // debounced
  const [statusTab,   setStatusTab]   = useState("");
  const [page,        setPage]        = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── sync ?status= from URL on mount ──
  useEffect(() => {
    const s = router.query?.status || "";
    if (s) setStatusTab(s);
  }, [router.query?.status]);

  // ── debounce search input ──
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // reset page when filter changes
  useEffect(() => { setPage(1); }, [statusTab]);

  /* ── fetch ── */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const token = getToken();

      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
        order:  "desc",
      });
      if (statusTab) params.set("status", statusTab);
      if (search)    params.set("q", search);

      const res  = await fetch(`${API_BASE}/admin/projects?${params}`, {
        headers: { key: API_KEY, Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.detail || `Gagal memuat projects (HTTP ${res.status})`);

      // handle both response shapes:
      // new backend → { total, limit, offset, items: [] }
      // old backend → []
      if (Array.isArray(data)) {
        setProjects(data);
        setTotal(data.length);
      } else {
        setProjects(Array.isArray(data?.items) ? data.items : []);
        setTotal(data?.total ?? 0);
      }
    } catch (e) {
      setErr(e?.message || "Gagal memuat data project.");
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  /* ─────────── render ─────────── */
  return (
    <AdminLayout title="Projects">

      {/* ── Header ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-base font-black text-slate-900">Daftar Project</div>
            <div className="text-xs font-bold text-slate-400 mt-0.5">
              Total <span className="text-slate-700">{total}</span> project
              {statusTab ? ` · filter: ${STATUS_CFG[statusTab]?.label || statusTab}` : ""}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex flex-1 md:w-[320px] items-center gap-2 h-11 rounded-xl border border-slate-200 bg-white px-3">
              <span className="text-slate-400 text-sm">⌕</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama / kode project..."
                className="w-full outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setSearch(""); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-black"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={fetchProjects}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => {
            const active = statusTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setStatusTab(t.id)}
                className={[
                  "h-8 px-3 rounded-xl border text-xs font-black transition",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {err}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-black text-slate-500">Project</th>
                <th className="p-4 text-left text-xs font-black text-slate-500">Jenis</th>
                <th className="p-4 text-left text-xs font-black text-slate-500">Pendanaan</th>
                <th className="p-4 text-left text-xs font-black text-slate-500">Tenor / Return</th>
                <th className="p-4 text-left text-xs font-black text-slate-500">Progress Funding</th>
                <th className="p-4 text-left text-xs font-black text-slate-500">Status</th>
                <th className="p-4 text-right text-xs font-black text-slate-500">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton rows={PAGE_SIZE > 10 ? 10 : PAGE_SIZE} />
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-sm font-bold text-slate-400">
                    {search || statusTab
                      ? "Tidak ada project yang cocok dengan filter."
                      : "Belum ada project masuk."}
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition cursor-pointer"
                    onClick={() => router.push(`/admin/projects/${p.id}`)}
                  >
                    {/* Project */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-sm">
                          {p.project_type === "infrastruktur" ? "🏗️"
                            : p.project_type === "properti"   ? "🏠"
                            : p.project_type === "umkm"       ? "🏪"
                            : "📋"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 truncate max-w-[200px]">
                            {p.project_name || p.project_code || "—"}
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {p.project_code || "—"} · {fmtDate(p.submitted_at || p.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Jenis */}
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-700 capitalize">{p.project_type || "—"}</div>
                      {p.project_type_other && (
                        <div className="text-[11px] font-bold text-slate-400 mt-0.5">{p.project_type_other}</div>
                      )}
                    </td>

                    {/* Pendanaan */}
                    <td className="p-4">
                      <div className="text-sm font-black text-slate-900">Rp {fmtIDR(p.funding_needed)}</div>
                      {p.min_funding != null && (
                        <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                          Min Rp {fmtIDR(p.min_funding)}
                        </div>
                      )}
                    </td>

                    {/* Tenor / Return */}
                    <td className="p-4">
                      <div className="text-sm font-black text-slate-900">{p.tenor_months || 0} bulan</div>
                      <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                        {p.fixed_return_pct || 0}% · Rp {fmtIDR(p.return_monthly_amount)}/bln
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="p-4 min-w-[160px]">
                      <FundingBar funded={p.funded_amount || 0} target={p.funding_needed || 0} />
                      <div className="text-[10px] font-bold text-slate-400 mt-1">
                        Target Rp {fmtIDR(p.funding_needed)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Aksi */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/projects/${p.id}`)}
                        className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                      >
                        Detail →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <div className="text-xs font-bold text-slate-500">
            {loading ? "Memuat..." : (
              <>
                Menampilkan{" "}
                <span className="text-slate-900">
                  {projects.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + projects.length}
                </span>
                {" "}dari <span className="text-slate-900">{total}</span> project
              </>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

export default dynamic(() => Promise.resolve(AdminProjectsPageInner), { ssr: false });