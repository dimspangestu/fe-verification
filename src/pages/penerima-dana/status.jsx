import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
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
  try { return new Date(v).toLocaleString("id-ID"); } catch { return "-"; }
}

function fmtDateShort(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "-"; }
}

function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function downloadWithAuth({ path, token, fileName }) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { key: API_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let msg = "Gagal download file.";
    try { const d = await res.json(); msg = d?.detail || msg; } catch {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "document.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────
   Badge components
───────────────────────────────────────────────────────── */
const STATUS_MAP = {
  draft:                  { cls: "bg-slate-50 text-slate-600 border-slate-200",    label: "Draft" },
  ongoing:                { cls: "bg-amber-50 text-amber-700 border-amber-200",    label: "On Going" },
  document_generated:     { cls: "bg-blue-50 text-blue-700 border-blue-200",       label: "PDF Draft Ready" },
  waiting_signed_upload:  { cls: "bg-violet-50 text-violet-700 border-violet-200", label: "Menunggu Upload Signed" },
  submitted:              { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Submitted" },
  waiting_admin_review:   { cls: "bg-cyan-50 text-cyan-700 border-cyan-200",       label: "Waiting Admin Review" },
  doc_review:             { cls: "bg-cyan-50 text-cyan-700 border-cyan-200",       label: "Doc Review" },
  accepted:               { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Accepted" },
  funding_open:           { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Funding Open" },
  funding_closed:         { cls: "bg-amber-50 text-amber-700 border-amber-200",    label: "Funding Closed" },
  disbursed_to_vendor:    { cls: "bg-sky-50 text-sky-700 border-sky-200",          label: "Disbursed" },
  repayment_running:      { cls: "bg-violet-50 text-violet-700 border-violet-200", label: "Repayment Running" },
  negosiasi:              { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Negosiasi" },
  reject:                 { cls: "bg-rose-50 text-rose-700 border-rose-200",       label: "Reject" },
  rejected:               { cls: "bg-rose-50 text-rose-700 border-rose-200",       label: "Rejected" },
  final_project:          { cls: "bg-teal-50 text-teal-700 border-teal-200",       label: "Final Project" },
  closed:                 { cls: "bg-slate-100 text-slate-700 border-slate-200",   label: "Closed" },
  completed:              { cls: "bg-teal-50 text-teal-700 border-teal-200",       label: "Completed" },
};

function Badge({ status }) {
  const s = STATUS_MAP[status] || { cls: "bg-slate-50 text-slate-600 border-slate-200", label: status || "-" };
  return (
    <span className={["inline-flex items-center px-3 py-1 rounded-full text-xs font-black border", s.cls].join(" ")}>
      {s.label}
    </span>
  );
}

function SmallBadge({ text, tone = "slate" }) {
  const map = {
    slate:   "bg-slate-50 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber:   "bg-amber-50 text-amber-700 border-amber-200",
    rose:    "bg-rose-50 text-rose-700 border-rose-200",
    indigo:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    sky:     "bg-sky-50 text-sky-700 border-sky-200",
    violet:  "bg-violet-50 text-violet-700 border-violet-200",
    cyan:    "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return (
    <span className={["inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border", map[tone] || map.slate].join(" ")}>
      {text}
    </span>
  );
}

function repaymentStatusBadge(status) {
  const map = {
    unpaid:          { tone: "amber",  text: "Unpaid" },
    partial:         { tone: "indigo", text: "Partial" },
    paid:            { tone: "emerald",text: "Paid" },
    overdue:         { tone: "rose",   text: "Overdue" },
    pending_payment: { tone: "amber",  text: "Pending Payment" },
  };
  return map[status] || { tone: "slate", text: status || "-" };
}

/* ─────────────────────────────────────────────────────────
   Detail Modal  (replaces alert())
───────────────────────────────────────────────────────── */
function DetailModal({ open, onClose, project, signedDoc }) {
  if (!open || !project) return null;

  const p = project;

  // compute progress pct for funding bar
  const fundPct = p.funding_needed
    ? Math.min(Math.round(((p.min_funding || 0) / p.funding_needed) * 100), 100)
    : 0;

  function Row({ label, value, valueClass = "" }) {
    return (
      <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-xs font-bold text-slate-500 shrink-0">{label}</span>
        <span className={["text-xs font-black text-slate-900 text-right", valueClass].join(" ")}>{value}</span>
      </div>
    );
  }

  function MetricCard({ label, value, sub, tone = "slate" }) {
    const tones = {
      slate:   "bg-slate-50 border-slate-200",
      indigo:  "bg-indigo-50 border-indigo-200",
      emerald: "bg-emerald-50 border-emerald-200",
      amber:   "bg-amber-50 border-amber-200",
      rose:    "bg-rose-50 border-rose-200",
      violet:  "bg-violet-50 border-violet-200",
    };
    const textTones = {
      slate:   "text-slate-900",
      indigo:  "text-indigo-700",
      emerald: "text-emerald-700",
      amber:   "text-amber-700",
      rose:    "text-rose-700",
      violet:  "text-violet-700",
    };
    return (
      <div className={["rounded-2xl border p-4", tones[tone] || tones.slate].join(" ")}>
        <div className="text-[10px] font-black tracking-wide text-slate-500 uppercase">{label}</div>
        <div className={["mt-1.5 text-base font-black", textTones[tone] || textTones.slate].join(" ")}>{value}</div>
        {sub && <div className="mt-0.5 text-[11px] font-bold text-slate-400">{sub}</div>}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-base font-black text-slate-900 truncate">
                {p.project_name || p.project_code || "—"}
              </div>
              <Badge status={p.status} />
            </div>
            <div className="mt-1 text-xs font-bold text-slate-400">
              {p.project_code || "—"} · {p.project_type || "—"}{p.project_type_other ? ` (${p.project_type_other})` : ""}
            </div>
            <div className="mt-1 text-[11px] font-bold text-slate-400">
              Diajukan: {fmtDate(p.submitted_at || p.created_at)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Metric grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Total Pendanaan"
              value={`Rp ${fmtIDR(p.funding_needed)}`}
              tone="indigo"
            />
            <MetricCard
              label="Minimum Pendanaan"
              value={`Rp ${fmtIDR(p.min_funding)}`}
              tone="slate"
            />
            <MetricCard
              label="Tenor"
              value={`${p.tenor_months || 0} bulan`}
              tone="slate"
            />
            <MetricCard
              label="Fixed Return"
              value={`${p.fixed_return_pct || 0}%`}
              sub="per tahun"
              tone="amber"
            />
            <MetricCard
              label="Return Total"
              value={`Rp ${fmtIDR(p.return_total_amount)}`}
              tone="emerald"
            />
            <MetricCard
              label="Total Bayar"
              value={`Rp ${fmtIDR(p.payback_total_amount)}`}
              sub={`Rp ${fmtIDR(p.return_monthly_amount)}/bln`}
              tone="violet"
            />
          </div>

          {/* Funding bar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-slate-700">Progress Minimum Funding</span>
              <span className="text-xs font-black text-indigo-700">{fundPct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${fundPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
              <span>Min: Rp {fmtIDR(p.min_funding)}</span>
              <span>Target: Rp {fmtIDR(p.funding_needed)}</span>
            </div>
          </div>

          {/* Detail info */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-black text-slate-700">Informasi Proyek</span>
            </div>
            <div className="px-4">
              <Row label="Project ID" value={p.id || "—"} />
              <Row label="Kode Proyek" value={p.project_code || "—"} />
              <Row label="Nama Proyek" value={p.project_name || "—"} />
              <Row label="Jenis" value={`${p.project_type || "—"}${p.project_type_other ? ` — ${p.project_type_other}` : ""}`} />
              <Row label="Status" value={<Badge status={p.status} />} />
              <Row label="Dibuat" value={fmtDate(p.created_at)} />
              <Row label="Diupdate" value={fmtDate(p.updated_at)} />
            </div>
          </div>

          {/* Signed doc status */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-black text-slate-700">Dokumen Perjanjian</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              {signedDoc ? (
                <>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SmallBadge
                        tone={signedDoc.verification_status === "verified" ? "emerald" : "amber"}
                        text={signedDoc.verification_status || "uploaded"}
                      />
                      <span className="text-xs font-bold text-slate-500 truncate max-w-[260px]">
                        {signedDoc.file_name || "—"}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-slate-400">
                      Diupload: {fmtDateShort(signedDoc.uploaded_at || signedDoc.created_at)}
                    </div>
                  </div>
                  <SmallBadge tone="emerald" text="✓ Sudah Upload" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <SmallBadge tone="rose" text="Belum Upload" />
                  <span className="text-xs font-bold text-slate-400">
                    Signed PDF belum diupload
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Repayment Modal  (unchanged logic, same as original)
───────────────────────────────────────────────────────── */
function RepaymentScheduleModal({ open, onClose, project, schedules, loading, onRefresh, onPayNow, payBusyId }) {
  if (!open || !project) return null;

  const totalDue       = (schedules || []).reduce((a, i) => a + Number(i?.total_due   || 0), 0);
  const totalPaid      = (schedules || []).reduce((a, i) => a + Number(i?.paid_amount || 0), 0);
  const totalRemaining = Math.max(totalDue - totalPaid, 0);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-black text-slate-900">Repayment Schedule Vendor</div>
              <div className="mt-1 text-sm font-bold text-slate-500">
                {project.project_name || project.project_code || "-"}
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[76vh] overflow-auto bg-slate-50 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { label: "Total Payback",    value: `Rp ${fmtIDR(project.payback_total_amount || 0)}`, cls: "text-slate-900" },
              { label: "Tenor",            value: `${project.tenor_months || 0} bulan`,              cls: "text-slate-900" },
              { label: "Sudah Dibayar",    value: `Rp ${fmtIDR(totalPaid)}`,                         cls: "text-emerald-700" },
              { label: "Sisa Kewajiban",   value: `Rp ${fmtIDR(totalRemaining)}`,                    cls: "text-rose-700" },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-black text-slate-400">{card.label}</div>
                <div className={["mt-2 text-lg font-black", card.cls].join(" ")}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div>
                <div className="text-sm font-black text-slate-900">Jadwal Pembayaran</div>
                <div className="text-xs font-bold text-slate-400">
                  Vendor membayar ke admin escrow, lalu sistem membagikan ke investor.
                </div>
              </div>
              <button type="button" onClick={onRefresh}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-sm font-bold text-slate-500">Memuat repayment schedule...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Angsuran","Jatuh Tempo","Pokok","Return","Total Tagihan","Sudah Dibayar","Status","Aksi"].map((h) => (
                        <th key={h} className={["p-4 text-xs font-black text-slate-500", h === "Aksi" ? "text-right" : "text-left"].join(" ")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(schedules || []).map((item) => {
                      const badge     = repaymentStatusBadge(item?.repayment_status);
                      const isBusy    = payBusyId === item.id;
                      const remaining = Math.max(Number(item?.total_due || 0) - Number(item?.paid_amount || 0), 0);
                      const canPay    = remaining > 0;
                      return (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td className="p-4 text-sm font-black text-slate-900">Angsuran {item.installment_no || "-"}</td>
                          <td className="p-4 text-sm font-bold text-slate-700">{fmtDate(item.due_date)}</td>
                          <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(item.principal_amount || 0)}</td>
                          <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(item.return_amount || 0)}</td>
                          <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(item.total_due || 0)}</td>
                          <td className="p-4 text-sm font-black text-emerald-700">Rp {fmtIDR(item.paid_amount || 0)}</td>
                          <td className="p-4"><SmallBadge tone={badge.tone} text={badge.text} /></td>
                          <td className="p-4">
                            <div className="flex items-center justify-end">
                              <button type="button" disabled={!canPay || isBusy} onClick={() => onPayNow(item)}
                                className={["h-10 rounded-xl px-4 text-xs font-black", !canPay || isBusy ? "cursor-not-allowed bg-slate-200 text-slate-500" : "bg-emerald-600 text-white hover:bg-emerald-700"].join(" ")}>
                                {isBusy ? "Processing..." : `Bayar Rp ${fmtIDR(remaining)}`}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!schedules.length && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-sm font-bold text-slate-400">
                          Belum ada repayment schedule untuk project ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-4">
          <button type="button" onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
function StatusPageInner() {
  const [q, setQ]     = useState("");
  const [tab, setTab] = useState("all");

  const [projects,  setProjects]  = useState([]);
  const [hydrated,  setHydrated]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState("");
  const [token,     setToken]     = useState("");

  const [signedDocsByProject, setSignedDocsByProject] = useState({});
  const [uploadFiles,  setUploadFiles]  = useState({});
  const [busyMap,      setBusyMap]      = useState({});

  // Detail modal state
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Repayment modal state
  const [repaymentOpen,      setRepaymentOpen]      = useState(false);
  const [selectedProject,    setSelectedProject]    = useState(null);
  const [repaymentSchedules, setRepaymentSchedules] = useState([]);
  const [repaymentLoading,   setRepaymentLoading]   = useState(false);
  const [payBusyId,          setPayBusyId]          = useState("");

  useEffect(() => {
    setHydrated(true);
    const sess = getStoredSession();
    const t = sess?.token || localStorage.getItem("access_token") || "";
    setToken(t);
  }, []);

  /* ── API calls ── */
  async function loadProjects() {
    const res  = await fetch(`${API_BASE}/projects/my`, { headers: { key: API_KEY, Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.detail || "Gagal memuat data project.");
    return Array.isArray(data) ? data : [];
  }

  async function loadSignedDocs() {
    const res  = await fetch(`${API_BASE}/signed-documents?module_type=vendor_project`, { headers: { key: API_KEY, Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.detail || "Gagal memuat signed documents.");
    const map = {};
    (Array.isArray(data) ? data : []).forEach((row) => { map[row.module_ref_id] = row; });
    return map;
  }

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const [projectRows, signedMap] = await Promise.all([loadProjects(), loadSignedDocs()]);
      setProjects(projectRows);
      setSignedDocsByProject(signedMap);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data.");
      setProjects([]);
      setSignedDocsByProject({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !token) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token]);

  /* ── handlers ── */
  async function handleRefresh() {
    if (!token) return;
    await loadAll();
  }

  // Opens the detail modal — fetches fresh data from /projects/:id
  async function handleDetail(projectId) {
    setDetailLoading(true);
    setDetailProject(null);
    setDetailOpen(true);
    try {
      const res  = await fetch(`${API_BASE}/projects/${projectId}`, { headers: { key: API_KEY, Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal mengambil detail project.");
      setDetailProject(data);
    } catch (e) {
      setErr(e?.message || "Gagal membuka detail.");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleGenerateAndDownloadDraft(projectId) {
    try {
      setBusyMap((prev) => ({ ...prev, [`gen-${projectId}`]: true }));
      setErr("");
      const genRes  = await fetch(`${API_BASE}/documents/vendor-project/${projectId}/generate`, { method: "POST", headers: { key: API_KEY, Authorization: `Bearer ${token}` } });
      const genData = await genRes.json().catch(() => ({}));
      if (!genRes.ok) throw new Error(genData?.detail || "Gagal generate PDF draft.");
      await downloadWithAuth({ path: genData.download_url, token, fileName: genData.file_name || `vendor-project-${projectId}.pdf` });
      await handleRefresh();
    } catch (e) {
      setErr(e?.message || "Gagal generate/download PDF draft.");
    } finally {
      setBusyMap((prev) => ({ ...prev, [`gen-${projectId}`]: false }));
    }
  }

  async function handleDownloadSigned(doc) {
    try {
      setBusyMap((prev) => ({ ...prev, [`signed-${doc.id}`]: true }));
      setErr("");
      await downloadWithAuth({ path: `/signed-documents/${doc.id}/download`, token, fileName: doc.file_name || `signed-${doc.id}.pdf` });
    } catch (e) {
      setErr(e?.message || "Gagal download signed PDF.");
    } finally {
      setBusyMap((prev) => ({ ...prev, [`signed-${doc.id}`]: false }));
    }
  }

  async function handleUploadSigned(projectId) {
    try {
      const file = uploadFiles[projectId];
      if (!file) throw new Error("Pilih file signed PDF terlebih dahulu.");
      setBusyMap((prev) => ({ ...prev, [`upload-${projectId}`]: true }));
      setErr("");
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`${API_BASE}/signed-documents/vendor-project/${projectId}/upload`, { method: "POST", headers: { key: API_KEY, Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal upload signed PDF.");
      setUploadFiles((prev) => { const n = { ...prev }; delete n[projectId]; return n; });
      await handleRefresh();
    } catch (e) {
      setErr(e?.message || "Gagal upload signed PDF.");
    } finally {
      setBusyMap((prev) => ({ ...prev, [`upload-${projectId}`]: false }));
    }
  }

  async function openRepaymentModal(project) {
    try {
      setSelectedProject(project);
      setRepaymentOpen(true);
      setRepaymentLoading(true);
      setErr("");
      const res  = await fetch(`${API_BASE}/vendor/repayment-schedules?project_id=${encodeURIComponent(project.id)}`, { headers: { key: API_KEY, Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat repayment schedule.");
      setRepaymentSchedules(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat repayment schedule.");
      setRepaymentSchedules([]);
    } finally {
      setRepaymentLoading(false);
    }
  }

  async function handlePayRepayment(schedule) {
    if (!selectedProject || !schedule?.id) return;
    try {
      setPayBusyId(schedule.id);
      setErr("");
      const remaining = Math.max(Number(schedule?.total_due || 0) - Number(schedule?.paid_amount || 0), 0);
      if (!remaining) throw new Error("Tagihan ini sudah lunas.");
      const res  = await fetch(`${API_BASE}/vendor/repayments/create-payment`, { method: "POST", headers: { "Content-Type": "application/json", key: API_KEY, Authorization: `Bearer ${token}` }, body: JSON.stringify({ project_id: selectedProject.id, schedule_id: schedule.id, amount: remaining }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal membuat pembayaran repayment.");
      if (data?.redirect_url) { window.location.href = data.redirect_url; return; }
      if (data?.token) { alert(`Snap token: ${data.token}`); return; }
      await openRepaymentModal(selectedProject);
    } catch (e) {
      setErr(e?.message || "Gagal membuat pembayaran repayment.");
    } finally {
      setPayBusyId("");
    }
  }

  /* ── filter / sort ── */
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (projects || [])
      .filter((p) => tab === "all" || (p?.status || "").toLowerCase() === tab)
      .filter((p) => {
        if (!qq) return true;
        return (
          (p?.project_code || "").toLowerCase().includes(qq) ||
          (p?.project_name || "").toLowerCase().includes(qq) ||
          (p?.project_type || "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => new Date(b?.submitted_at || b?.created_at || 0) - new Date(a?.submitted_at || a?.created_at || 0));
  }, [projects, q, tab]);

  const tabs = [
    { id: "all",               label: "All" },
    { id: "draft",             label: "Draft" },
    { id: "ongoing",           label: "On Going" },
    { id: "submitted",         label: "Submitted" },
    { id: "doc_review",        label: "Doc Review" },
    { id: "funding_open",      label: "Funding Open" },
    { id: "disbursed_to_vendor", label: "Disbursed" },
    { id: "repayment_running", label: "Repayment" },
    { id: "completed",         label: "Completed" },
    { id: "closed",            label: "Closed" },
  ];

  /* ─────────────── render ─────────────── */
  return (
    <TailAdminLayout title="Status Pengajuan">

      {/* Detail modal */}
      <DetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailProject(null); }}
        project={detailProject}
        signedDoc={detailProject ? signedDocsByProject[detailProject.id] : null}
      />

      {/* Repayment modal */}
      <RepaymentScheduleModal
        open={repaymentOpen}
        onClose={() => { setRepaymentOpen(false); setSelectedProject(null); setRepaymentSchedules([]); setPayBusyId(""); }}
        project={selectedProject}
        schedules={repaymentSchedules}
        loading={repaymentLoading}
        onRefresh={() => openRepaymentModal(selectedProject)}
        onPayNow={handlePayRepayment}
        payBusyId={payBusyId}
      />

      {/* ── Top controls ── */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="text-base md:text-lg font-black text-slate-900">Status Pengajuan Vendor</div>
            <div className="mt-1 text-sm font-bold text-slate-400">
              Download PDF draft perjanjian, upload signed PDF, lalu lakukan pembayaran repayment per cicilan.
            </div>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="flex flex-1 md:w-[360px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 h-11">
              <span className="text-slate-400 text-base">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kode / nama proyek / jenis..."
                className="w-full outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button type="button" onClick={handleRefresh}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100">
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={["rounded-xl border px-3 py-2 text-xs font-black", active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"].join(" ")}>
                {t.label}
              </button>
            );
          })}
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {err}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-black text-slate-900">Daftar Pengajuan</div>
            <div className="text-xs font-bold text-slate-400">Total: {hydrated ? filtered.length : 0} data</div>
          </div>
          <button className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center text-slate-500">⋮</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1650px] w-full">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                {["Proyek","Jenis","Pendanaan","Minimum","Tenor","Return","Status","Signed PDF","Repayment","Aksi"].map((h) => (
                  <th key={h} className={["p-4 text-xs font-black text-slate-500", h === "Aksi" ? "text-right" : "text-left"].join(" ")}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!hydrated || loading ? (
                <tr><td colSpan={10} className="p-6 text-center text-sm font-bold text-slate-400">Memuat data…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-sm font-bold text-slate-400">Tidak ada data yang cocok.</td></tr>
              ) : (
                filtered.map((p) => {
                  const signedDoc        = signedDocsByProject[p.id];
                  const isGeneratedBusy  = !!busyMap[`gen-${p.id}`];
                  const isUploadBusy     = !!busyMap[`upload-${p.id}`];
                  const isSignedBusy     = signedDoc ? !!busyMap[`signed-${signedDoc.id}`] : false;
                  const canRepay = ["disbursed_to_vendor","repayment_running","completed"].includes(p.status);

                  return (
                    <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/60">
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">{p.project_name || p.project_code || "-"}</div>
                        <div className="mt-1 text-xs font-bold text-slate-400">{fmtDate(p.submitted_at || p.created_at)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-800">{p.project_type || "-"}</div>
                        <div className="mt-1 text-xs font-bold text-slate-400">{p.project_type_other || "-"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">Rp {fmtIDR(p.funding_needed)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">Rp {fmtIDR(p.min_funding)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">{p.tenor_months || 0} bln</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">{p.fixed_return_pct || 0}%</div>
                        <div className="mt-1 text-xs font-bold text-slate-400">Total Rp {fmtIDR(p.return_total_amount)}</div>
                      </td>
                      <td className="p-4"><Badge status={p.status} /></td>

                      {/* Signed PDF */}
                      <td className="p-4">
                        {signedDoc ? (
                          <div className="grid gap-2">
                            <SmallBadge tone={signedDoc.verification_status === "uploaded" ? "amber" : "emerald"} text={signedDoc.verification_status || "uploaded"} />
                            <div className="text-xs font-bold text-slate-500 truncate max-w-[180px]">{signedDoc.file_name}</div>
                            <button type="button" onClick={() => handleDownloadSigned(signedDoc)} disabled={isSignedBusy}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                              {isSignedBusy ? "Downloading..." : "Download Signed"}
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <SmallBadge tone="rose" text="Belum upload" />
                            <div className="text-xs font-bold text-slate-400">Signed PDF belum tersedia</div>
                          </div>
                        )}
                      </td>

                      {/* Repayment */}
                      <td className="p-4">
                        {canRepay ? (
                          <div className="grid gap-2">
                            <SmallBadge tone="violet" text="Repayment Ready" />
                            <button type="button" onClick={() => openRepaymentModal(p)}
                              className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-black text-white hover:bg-violet-700">
                              Lihat Jadwal Bayar
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <SmallBadge tone="slate" text="Belum tersedia" />
                            <div className="text-xs font-bold text-slate-400">Aktif setelah dana dicairkan</div>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-4">
                        <div className="flex flex-col items-end gap-2">
                          {/* Detail — opens designed modal instead of alert() */}
                          <button type="button" onClick={() => handleDetail(p.id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50">
                            {detailLoading && detailOpen ? "Loading..." : "Detail"}
                          </button>

                          <button type="button" onClick={() => handleGenerateAndDownloadDraft(p.id)} disabled={isGeneratedBusy}
                            className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700 disabled:opacity-50">
                            {isGeneratedBusy ? "Generating..." : "Download PDF Draft"}
                          </button>

                          {/* Upload signed PDF */}
                          <div className="w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div className="text-[11px] font-black text-slate-500">Upload Signed PDF</div>
                            <label className="mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50">
                              <input type="file" accept=".pdf" className="hidden"
                                onChange={(e) => setUploadFiles((prev) => ({ ...prev, [p.id]: e.target.files?.[0] || null }))} />
                              {uploadFiles[p.id]?.name ? "Ganti File PDF" : "Pilih File PDF"}
                            </label>
                            <div className="mt-2 truncate text-[11px] font-bold text-slate-500">
                              {uploadFiles[p.id]?.name || "Belum ada file dipilih"}
                            </div>
                            <button type="button" onClick={() => handleUploadSigned(p.id)} disabled={!uploadFiles[p.id] || isUploadBusy}
                              className="mt-3 h-10 w-full rounded-xl bg-slate-900 px-3 text-xs font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                              {isUploadBusy ? "Uploading..." : "Upload Signed PDF"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TailAdminLayout>
  );
}

export default dynamic(() => Promise.resolve(StatusPageInner), { ssr: false });