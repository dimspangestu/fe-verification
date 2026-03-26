import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import InvestorLayout from "../../components/investor/InvestorLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

/* ═══════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════ */
const fmtIDR    = (n) => new Intl.NumberFormat("id-ID").format(Number(n || 0));
const onlyDigs  = (s) => String(s || "").replace(/[^\d]/g, "");
const fmtInput  = (r) => { const d = onlyDigs(r); return d ? new Intl.NumberFormat("id-ID").format(Number(d)) : ""; };
const parseInput = (r) => { const d = onlyDigs(r); return d ? Number(d) : 0; };
const fmtBytes  = (b) => {
  const n = Number(b || 0);
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

function getToken() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(localStorage.getItem("auth_session"))?.token || localStorage.getItem("access_token") || ""; }
  catch { return localStorage.getItem("access_token") || ""; }
}
const authFetch = (path, opts = {}) => fetch(`${API_BASE}${path}`, {
  ...opts,
  headers: { key: API_KEY, Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
});

const TYPE_LABELS = { infrastruktur: "Infrastruktur", properti: "Properti", umkm: "Usaha / UMKM", lainnya: "Lainnya" };
const DOC_LABELS  = { proposal: "Surat Penunjukan + SPK", rab: "RAB", lainnya: "Dokumen Pendukung" };

/* ═══════════════════════════════════════════════════
   Badge
═══════════════════════════════════════════════════ */
const BADGE_CLS = {
  funding_open:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  funding_closed:      "bg-slate-100 text-slate-600 border-slate-200",
  repayment_running:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed:           "bg-teal-50 text-teal-700 border-teal-200",
  agreement_generated: "bg-indigo-50 text-indigo-700 border-indigo-200",
  signed_uploaded:     "bg-sky-50 text-sky-700 border-sky-200",
  pending_payment:     "bg-amber-50 text-amber-700 border-amber-200",
  paid:                "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:            "bg-rose-50 text-rose-700 border-rose-200",
};
function Badge({ status }) {
  return (
    <span className={["inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-black",
      BADGE_CLS[status] || "bg-slate-50 text-slate-600 border-slate-200"].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full shrink-0",
        status === "funding_open" ? "bg-emerald-500" :
        status === "paid"              ? "bg-emerald-500" :
        status === "repayment_running" ? "bg-indigo-500" :
        status === "completed"         ? "bg-teal-500"   :
        status === "rejected"          ? "bg-rose-500"   : "bg-slate-400"].join(" ")} />
      {status?.replace(/_/g, " ") || "-"}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Document Preview Modal
═══════════════════════════════════════════════════ */
function DocPreviewModal({ open, onClose, projectId, doc }) {
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!open || !doc) return;
    let obj = "";
    setError(false);
    setLoading(true);
    setUrl("");
    authFetch(`/investor/projects/${projectId}/documents/${doc.id}/download`)
      .then((r) => { if (!r.ok) throw new Error(); return r.blob(); })
      .then((blob) => { obj = URL.createObjectURL(blob); setUrl(obj); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => { if (obj) URL.revokeObjectURL(obj); };
  }, [open, doc?.id, projectId]);

  useEffect(() => {
    if (!open) { URL.revokeObjectURL(url); setUrl(""); setError(false); }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  if (!open || !doc) return null;

  const isPdf   = (doc.mime || "").includes("pdf") || doc.file_name?.endsWith(".pdf");
  const isImage = (doc.mime || "").startsWith("image/");

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-black/80 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/95 px-6 py-3 shrink-0">
        <div className="min-w-0">
          <div className="text-sm font-black text-white truncate">
            {DOC_LABELS[doc.doc_type] || doc.doc_type}
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="truncate max-w-[240px]">{doc.file_name}</span>
            <span>·</span>
            <span className="shrink-0">{fmtBytes(doc.file_size)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && !error && (
            <a href={url} target="_blank" rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 text-xs font-black text-white hover:bg-slate-700 transition">
              ↗ Buka Tab Baru
            </a>
          )}
          <button onClick={onClose}
            className="h-9 w-9 rounded-xl border border-slate-600 bg-slate-800 font-black text-slate-300 hover:bg-slate-700 transition">
            ✕
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <div className="text-sm font-bold text-white/70">Memuat dokumen...</div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center max-w-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <div className="text-base font-black text-white mb-2">Gagal memuat dokumen</div>
            <div className="text-sm font-semibold text-white/50">Periksa koneksi atau coba lagi</div>
            <button onClick={() => { setError(false); setLoading(true); /* re-trigger useEffect */ }}
              className="mt-6 h-11 rounded-xl bg-white/10 px-5 text-xs font-black text-white hover:bg-white/20 transition">
              Coba Lagi
            </button>
          </div>
        ) : isPdf ? (
          <div className="w-full h-full">
            <iframe src={url} title={doc.file_name}
              className="w-full h-full min-h-[75vh] rounded-2xl border border-white/10 bg-white shadow-2xl" />
          </div>
        ) : isImage ? (
          <img src={url} alt={doc.file_name}
            className="max-h-[80vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl" />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center max-w-sm">
            <div className="text-6xl mb-4">📄</div>
            <div className="text-base font-black text-white mb-1">File tidak bisa dipreview</div>
            <div className="text-sm font-semibold text-white/50 mb-6">Format: {doc.mime || "unknown"}</div>
            {url && (
              <a href={url} target="_blank" rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-black text-slate-900 hover:bg-white/90 transition">
                ↓ Download File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Project Detail Drawer
═══════════════════════════════════════════════════ */
function ProjectDetailDrawer({ project, onClose, onDanai, fundingAmount, onAmountChange }) {
  const [detail,     setDetail]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (!project?.id) return;
    setDetail(null); setLoading(true);
    authFetch(`/investor/projects/${project.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setDetail).catch(() => null)
      .finally(() => setLoading(false));
  }, [project?.id]);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && !previewDoc) onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [previewDoc]);

  if (!project) return null;

  const p         = detail || project;
  const vendor    = detail?.vendor || null;
  const docs      = detail?.documents || [];
  const remaining = Number(p.remaining_amount ?? p.funding_needed ?? 0);
  const funded    = Number(p.funded_amount || 0);
  const target    = Number(p.funding_needed || 0);
  const pct       = target > 0 ? Math.min(Math.round((funded / target) * 100), 100) : 0;
  const isOpen    = p.status === "funding_open" && remaining > 0;
  const numeric   = parseInput(fundingAmount || "");
  const isInvalid = !numeric || numeric <= 0 || numeric > remaining;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[999] flex w-full max-w-[720px] flex-col bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-start gap-4 border-b border-slate-200 px-6 py-5 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black text-slate-900 leading-snug">
              {p.project_name || p.project_code}
            </div>
            <div className="mt-1 text-xs font-bold text-slate-400 tracking-wide">{p.project_code}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge status={p.status} />
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-black text-slate-600">
                {TYPE_LABELS[p.project_type] || p.project_type}
                {p.project_type_other ? ` — ${p.project_type_other}` : ""}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-500 hover:bg-slate-100 transition">
            ✕
          </button>
        </div>

        {/* ── Funding progress bar — sticky ── */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-500">
              <span className="font-black text-slate-800">Rp {fmtIDR(funded)}</span> terfunding
              {" · "}sisa <span className="font-black text-slate-800">Rp {fmtIDR(remaining)}</span>
            </div>
            <div className={[
              "text-sm font-black",
              pct >= 100 ? "text-emerald-600" : "text-indigo-600",
            ].join(" ")}>{pct}%</div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={["h-3 rounded-full transition-all duration-500",
              pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"].join(" ")}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-slate-400">
            Target: Rp {fmtIDR(target)} · {pct >= 100 ? "🎉 Penuh" : `${100 - pct}% lagi`}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">

            {/* Imbal hasil card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-200">
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-200 mb-5">
                💰 Imbal Hasil Investasi
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-black leading-none">{p.fixed_return_pct || 0}%</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-200">Fixed Return</div>
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">{p.tenor_months || 0} bln</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-200">Tenor</div>
                </div>
                <div>
                  <div className="text-lg font-black leading-snug">Rp {fmtIDR(p.return_monthly_amount)}</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-200">Return / Bulan</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Total Return", `Rp ${fmtIDR(p.return_total_amount)}`],
                  ["Total Pengembalian", `Rp ${fmtIDR(p.payback_total_amount)}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-wide text-emerald-200">{label}</div>
                    <div className="mt-0.5 text-sm font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rincian proyek */}
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">📋 Rincian Proyek</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Target Pendanaan",    `Rp ${fmtIDR(target)}`],
                  ["Min. Kolektif",       `Rp ${fmtIDR(p.min_funding)}`, "threshold admin"],
                  ["Status",              p.status?.replace(/_/g, " ")],
                  ["Tipe Proyek",         TYPE_LABELS[p.project_type] || p.project_type],
                ].map(([label, value, note]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div>
                    <div className="mt-0.5 text-sm font-black text-slate-900">{value || "—"}</div>
                    {note && <div className="mt-0.5 text-[10px] font-semibold text-slate-400">{note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor info */}
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">🏢 Penerima Dana</div>
              {loading && !detail ? (
                <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
              ) : vendor ? (
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
                  {/* Vendor header */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white px-5 py-4 border-b border-slate-100">
                    <div className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm grid place-items-center text-xl font-black text-slate-700">
                      {(vendor.company_name || "V").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900">{vendor.company_name || "—"}</div>
                      <div className="mt-0.5 text-xs font-bold text-slate-400">
                        {vendor.vendor_type === "company" ? "Badan Usaha" : "Individu"}
                        {vendor.pic_name ? ` · PIC: ${vendor.pic_name}` : ""}
                      </div>
                    </div>
                  </div>
                  {/* Vendor detail fields */}
                  <div className="divide-y divide-slate-100">
                    {[
                      ["📧 Email",   vendor.email],
                      ["📱 Telepon", vendor.phone],
                      ["📍 Alamat",  vendor.address],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="flex items-start gap-3 px-5 py-3">
                        <div className="text-xs font-black text-slate-400 w-20 shrink-0 pt-0.5">{label}</div>
                        <div className="text-sm font-semibold text-slate-800 flex-1 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="text-sm font-black text-slate-900">{p.vendor_company_name || "—"}</div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  📎 Dokumen Proyek
                </div>
                {!loading && (
                  <div className="text-[11px] font-bold text-slate-400">{docs.length} file tersedia</div>
                )}
              </div>

              {loading && !detail ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : docs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <div className="text-sm font-bold text-slate-400">Belum ada dokumen</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {docs.map((doc) => {
                    const isPdf   = (doc.mime || "").includes("pdf") || doc.file_name?.endsWith(".pdf");
                    const isImage = (doc.mime || "").startsWith("image/");
                    const icon    = isPdf ? "📄" : isImage ? "🖼️" : "📎";
                    const typeClr = isPdf
                      ? "border-indigo-100 bg-indigo-50"
                      : isImage
                        ? "border-pink-100 bg-pink-50"
                        : "border-slate-100 bg-slate-50";

                    return (
                      <div key={doc.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                        {/* Icon */}
                        <div className={["h-12 w-12 shrink-0 rounded-xl border grid place-items-center text-2xl", typeClr].join(" ")}>
                          {icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-slate-900">
                            {DOC_LABELS[doc.doc_type] || doc.doc_type}
                          </div>
                          <div className="mt-0.5 text-xs font-semibold text-slate-400 truncate">
                            {doc.file_name}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                            {fmtBytes(doc.file_size)} · {isPdf ? "PDF" : isImage ? "Gambar" : "File"}
                          </div>
                        </div>

                        {/* Preview button — always visible */}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="shrink-0 inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-black text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-95">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Lihat Dokumen
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <span className="text-xl shrink-0">🛡️</span>
              <div className="text-xs font-semibold text-emerald-800 leading-relaxed">
                Vendor dan seluruh dokumen proyek ini telah melalui proses verifikasi KYC oleh tim Fondofund
                sebelum dibuka untuk pendanaan investor.
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          {isOpen ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black text-slate-500 mb-0.5">Nominal Investasi Anda</div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Maksimum: <span className="font-black text-slate-700">Rp {fmtIDR(remaining)}</span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Nominal (Rp)</label>
                  <input
                    value={fundingAmount}
                    onChange={(e) => {
                      const n = parseInput(e.target.value);
                      const s = n > remaining ? remaining : n;
                      onAmountChange(s > 0 ? fmtInput(String(s)) : fmtInput(e.target.value));
                    }}
                    placeholder="0"
                    inputMode="numeric"
                    className={[
                      "h-12 w-[180px] rounded-2xl border px-4 text-sm font-black outline-none transition",
                      numeric > 0 && !isInvalid
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900 focus:ring-4 focus:ring-emerald-100"
                        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-300 focus:ring-4 focus:ring-slate-100",
                    ].join(" ")}
                  />
                  {numeric > 0 && !isInvalid && (
                    <div className="text-[11px] font-bold text-emerald-600">✓ Rp {fmtIDR(numeric)}</div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isInvalid}
                  onClick={() => { onClose(); onDanai(p); }}
                  className={[
                    "h-12 rounded-2xl px-6 text-sm font-black shrink-0 transition-all",
                    isInvalid
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95",
                  ].join(" ")}>
                  💰 Danai Sekarang
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-400">
              {remaining <= 0 ? "🎉 Pendanaan sudah penuh" : "Proyek tidak sedang membuka pendanaan"}
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        projectId={project.id}
        doc={previewDoc}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Funding Input (table)
═══════════════════════════════════════════════════ */
function FundingInput({ project, value, onChange }) {
  const remaining = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);
  const isOpen    = project?.status === "funding_open" && remaining > 0;
  const numeric   = parseInput(value);
  const isErr     = isOpen && numeric > 0 && numeric > remaining;

  const handleChange = (e) => {
    const n = parseInput(e.target.value);
    const s = n > remaining ? remaining : n;
    onChange(s > 0 ? fmtInput(String(s)) : fmtInput(e.target.value));
  };

  return (
    <div className="flex flex-col gap-1">
      <input value={value} onChange={handleChange} placeholder="Nominal"
        inputMode="numeric" disabled={!isOpen}
        className={[
          "h-10 w-[180px] rounded-xl border px-3 text-sm font-semibold outline-none transition",
          !isOpen    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
          : isErr    ? "border-rose-300 bg-rose-50 text-rose-800 focus:ring-2 focus:ring-rose-100"
          : numeric > 0 ? "border-emerald-300 bg-emerald-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-100"
                        : "border-slate-200 bg-white text-slate-900 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
        ].join(" ")} />
      <div className={["text-[11px] font-bold",
        isErr ? "text-rose-500" : numeric > 0 ? "text-emerald-600" : "text-slate-400"].join(" ")}>
        {!isOpen ? (remaining <= 0 ? "Penuh" : "")
          : isErr   ? `Maks Rp ${fmtIDR(remaining)}`
          : numeric > 0 ? `✓ Rp ${fmtIDR(numeric)}`
          : `Maks Rp ${fmtIDR(remaining)}`}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Agreement Modal
═══════════════════════════════════════════════════ */
function AgreementModal({ open, onClose, project, fundingAmount,
  prepareLoading, error, fundingDraft,
  onGenerate, onDownload,
  onSignedFileChange, signedFile, uploadLoading, onUpload,
  checkoutLoading, onCheckout }) {

  if (!open || !project) return null;
  const canGenerate = Number(fundingAmount || 0) > 0;
  const canUpload   = Boolean(fundingDraft?.funding_id && signedFile);
  const canCheckout = Boolean(fundingDraft?.signed_document);

  const Step = ({ n, done, title, sub, children }) => (
    <div className={["rounded-2xl border p-5 transition", done ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"].join(" ")}>
      <div className="flex items-center gap-2.5 mb-1">
        <span className={["h-7 w-7 rounded-full text-xs font-black grid place-items-center shrink-0",
          done ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"].join(" ")}>
          {done ? "✓" : n}
        </span>
        <div className="text-sm font-black text-slate-900">{title}</div>
      </div>
      {sub && <div className="ml-9 text-xs font-semibold text-slate-400 mb-4">{sub}</div>}
      <div className="ml-9">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-black text-slate-900">Proses Pendanaan</div>
            <div className="text-sm font-semibold text-slate-400">{project.project_name || project.project_code}</div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-500 hover:bg-slate-100">✕</button>
        </div>

        {/* Nominal summary */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500">Nominal Investasi</div>
          <div className="text-xl font-black text-emerald-700">Rp {fmtIDR(fundingAmount)}</div>
        </div>

        <div className="max-h-[65vh] overflow-auto p-6 grid gap-4">

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>
          )}

          <Step n="1" done={!!fundingDraft?.generated_document_id}
            title="Generate Draft Perjanjian"
            sub="Sistem membuat draft PDF perjanjian investor.">
            <div className="flex flex-wrap items-center gap-3">
              <button disabled={!canGenerate || prepareLoading} onClick={onGenerate}
                className={["h-10 rounded-xl px-4 text-xs font-black transition",
                  !canGenerate || prepareLoading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"].join(" ")}>
                {prepareLoading ? "⏳ Generating..." : "Generate Dokumen"}
              </button>
            </div>
            {fundingDraft?.generated_document_id && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="text-sm font-bold text-indigo-800 truncate">
                  📄 {fundingDraft.generated_file_name || "Investor Agreement PDF"}
                </div>
                <button onClick={onDownload}
                  className="shrink-0 h-9 rounded-xl border border-indigo-200 bg-white px-3 text-xs font-black text-indigo-700 hover:bg-indigo-50">
                  Download
                </button>
              </div>
            )}
          </Step>

          <Step n="2" done={!!fundingDraft?.signed_document}
            title="Upload Signed PDF"
            sub="Tanda tangani + e-meterai, lalu upload PDF yang sudah ditandatangani.">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 hover:bg-slate-100 transition">
                <input type="file" accept=".pdf" className="hidden"
                  onChange={(e) => onSignedFileChange(e.target.files?.[0] || null)} />
                📎 {signedFile ? "Ganti PDF" : "Pilih Signed PDF"}
              </label>
              {signedFile && <span className="text-xs font-semibold text-slate-500 truncate max-w-[160px]">{signedFile.name}</span>}
              <button disabled={!canUpload || uploadLoading} onClick={onUpload}
                className={["h-10 rounded-xl px-4 text-xs font-black transition",
                  !canUpload || uploadLoading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-sky-600 text-white hover:bg-sky-700 active:scale-95"].join(" ")}>
                {uploadLoading ? "⏳ Uploading..." : "Upload"}
              </button>
            </div>
            {fundingDraft?.signed_document && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                ✓ Signed PDF terupload
              </div>
            )}
          </Step>

          <Step n="3" done={false}
            title="Pembayaran"
            sub="Lanjut ke pembayaran Midtrans setelah signed document tersedia.">
            <button disabled={!canCheckout || checkoutLoading} onClick={onCheckout}
              className={["h-11 rounded-xl px-6 text-sm font-black transition",
                !canCheckout || checkoutLoading ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95"].join(" ")}>
              {checkoutLoading ? "⏳ Redirecting..." : "💳 Bayar Sekarang"}
            </button>
          </Step>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-600 hover:bg-slate-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════ */
export default function InvestorProjectsPage() {
  const router = useRouter();

  const [projects,  setProjects]  = useState([]);
  const [q,         setQ]         = useState("");
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState("");
  const [amounts,   setAmounts]   = useState({});
  const [detail,    setDetail]    = useState(null);   // for drawer

  const [selected,        setSelected]        = useState(null);
  const [agreementOpen,   setAgreementOpen]   = useState(false);
  const [prepareLoading,  setPrepareLoading]  = useState(false);
  const [uploadLoading,   setUploadLoading]   = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [agreementError,  setAgreementError]  = useState("");
  const [draft,           setDraft]           = useState(null);
  const [signedFile,      setSignedFile]      = useState(null);

  /* load */
  async function load() {
    setLoading(true); setErr("");
    try {
      const res  = await authFetch("/investor/projects");
      const data = await res.json().catch(() => []);
      if (res.status === 403) { router.replace("/investor/profile?kyc_required=1"); return; }
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat project");
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e?.message || "Gagal memuat project"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return projects.filter((p) => !qq ||
      [p.project_code, p.project_name, p.project_type, p.vendor_company_name]
        .some((v) => (v || "").toLowerCase().includes(qq)));
  }, [projects, q]);

  function changeAmount(project, raw) {
    const rem = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);
    const n   = parseInput(raw);
    const c   = n > rem ? rem : n;
    setAmounts((prev) => ({ ...prev, [project.id]: c > 0 ? fmtInput(String(c)) : fmtInput(raw) }));
  }

  function openAgreement(project) {
    const amt = parseInput(amounts[project.id] || "");
    const rem = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);
    if (!amt || amt <= 0) { alert("Masukkan nominal funding terlebih dahulu."); return; }
    if (amt > rem)        { alert(`Maks Rp ${fmtIDR(rem)}.`); return; }
    setSelected(project); setDraft(null); setSignedFile(null);
    setAgreementError(""); setAgreementOpen(true);
  }

  function closeAgreement() {
    setAgreementOpen(false); setSelected(null);
    setDraft(null); setSignedFile(null); setAgreementError("");
  }

  async function handleGenerate() {
    const amt = parseInput(amounts[selected.id] || "");
    const rem = Number(selected?.remaining_amount ?? selected?.funding_needed ?? 0);
    if (!amt) { setAgreementError("Nominal wajib diisi."); return; }
    if (amt > rem) { setAgreementError(`Maks Rp ${fmtIDR(rem)}.`); return; }
    setPrepareLoading(true); setAgreementError("");
    try {
      const res  = await authFetch("/investor/fundings/prepare-agreement", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selected.id, funding_amount: amt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal generate");
      setDraft(data);
    } catch (e) { setAgreementError(e?.message || "Gagal generate"); }
    finally { setPrepareLoading(false); }
  }

  async function handleDownload() {
    if (!draft?.generated_document_id) return;
    const res = await authFetch(`/documents/generated/${draft.generated_document_id}/download`);
    if (!res.ok) { alert("Gagal download"); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = draft.generated_file_name || "agreement.pdf";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    if (!draft?.funding_id || !signedFile) return;
    setUploadLoading(true); setAgreementError("");
    try {
      const fd = new FormData(); fd.append("signed_file", signedFile);
      const res  = await fetch(`${API_BASE}/investor/fundings/${draft.funding_id}/upload-signed`, {
        method: "POST", headers: { key: API_KEY, Authorization: `Bearer ${getToken()}` }, body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal upload");
      setDraft((p) => ({ ...(p || {}), signed_document: data?.signed_document || data }));
    } catch (e) { setAgreementError(e?.message || "Gagal upload"); }
    finally { setUploadLoading(false); }
  }

  async function handleCheckout() {
    if (!draft?.funding_id) return;
    setCheckoutLoading(true); setAgreementError("");
    try {
      const res  = await authFetch(`/investor/fundings/${draft.funding_id}/checkout`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal checkout");
      if (data?.token && typeof window.snap !== "undefined") {
        window.snap.pay(data.token, {
          onSuccess: (r) => { window.location.href = `/payment/finish?order_id=${r.order_id}&transaction_status=${r.transaction_status}`; },
          onPending: (r) => { window.location.href = `/payment/finish?order_id=${r.order_id}&transaction_status=pending`; },
          onError:   ()  => { window.location.href = `/payment/finish?transaction_status=failure`; },
          onClose:   ()  => { window.location.href = `/payment/finish?transaction_status=cancel`; },
        });
        return;
      }
      if (data?.redirect_url) { window.location.href = data.redirect_url; return; }
      throw new Error("Redirect tidak tersedia.");
    } catch (e) { setAgreementError(e?.message || "Gagal checkout"); }
    finally { setCheckoutLoading(false); }
  }

  /* ─── render ─── */
  return (
    <InvestorLayout title="Projects Open Funding">

      {detail && (
        <ProjectDetailDrawer
          project={detail}
          onClose={() => setDetail(null)}
          onDanai={(p) => { setDetail(null); openAgreement(p); }}
          fundingAmount={amounts[detail.id] || ""}
          onAmountChange={(v) => changeAmount(detail, v)}
        />
      )}

      <AgreementModal
        open={agreementOpen} onClose={closeAgreement}
        project={selected}
        fundingAmount={selected ? parseInput(amounts[selected.id] || "") : 0}
        prepareLoading={prepareLoading} error={agreementError} fundingDraft={draft}
        onGenerate={handleGenerate} onDownload={handleDownload}
        onSignedFileChange={setSignedFile} signedFile={signedFile}
        uploadLoading={uploadLoading} onUpload={handleUpload}
        checkoutLoading={checkoutLoading} onCheckout={handleCheckout}
      />

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-black text-slate-900">Available Projects</div>
            <div className="text-sm font-semibold text-slate-400">
              Klik <span className="font-black text-slate-600">"Detail & Dokumen"</span> untuk melihat info lengkap dan preview dokumen.
            </div>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari project / vendor..."
            className="h-11 w-full md:w-[320px] rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100" />
        </div>
        {err && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{err}</div>}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">Memuat projects...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Project", "Vendor", "Tipe", "Progress Funding", "Tenor", "Return", "Status", "Aksi"].map((h) => (
                    <th key={h} className={["px-5 py-3.5 text-xs font-black text-slate-500",
                      h === "Aksi" ? "text-right" : "text-left"].join(" ")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-12 text-center text-sm font-bold text-slate-400">Tidak ada project funding_open.</td></tr>
                ) : filtered.map((p) => {
                  const rem     = Number(p?.remaining_amount ?? p?.funding_needed ?? 0);
                  const isOpen  = p.status === "funding_open" && rem > 0;
                  const numeric = parseInput(amounts[p.id] || "");
                  const invalid = !numeric || numeric <= 0 || numeric > rem;
                  const funded  = Number(p.funded_amount || 0);
                  const target  = Number(p.funding_needed || 0);
                  const pct     = target > 0 ? Math.min(Math.round((funded / target) * 100), 100) : 0;

                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">

                      {/* Project — click to open drawer */}
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-900">{p.project_name || p.project_code}</div>
                        <div className="text-[11px] font-bold text-slate-400 mb-1.5">{p.project_code}</div>
                        <button type="button" onClick={() => setDetail(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 hover:bg-emerald-100 transition active:scale-95">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Detail & Dokumen
                        </button>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.vendor_company_name || "—"}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{TYPE_LABELS[p.project_type] || p.project_type}</td>

                      {/* Progress */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-[11px] font-bold text-slate-500">Rp {fmtIDR(rem)} sisa</div>
                          <div className={["text-[11px] font-black", pct >= 100 ? "text-emerald-600" : "text-indigo-600"].join(" ")}>{pct}%</div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className={["h-2 rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"].join(" ")}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-900">{p.tenor_months} bln</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-base font-black text-emerald-700">{p.fixed_return_pct}%</div>
                        <div className="text-[10px] font-semibold text-slate-400">per periode</div>
                      </td>

                      <td className="px-5 py-4"><Badge status={p.status} /></td>

                      {/* Aksi */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-end gap-2">
                          <FundingInput project={p} value={amounts[p.id] || ""}
                            onChange={(v) => changeAmount(p, v)} />
                          <button type="button" onClick={() => openAgreement(p)}
                            disabled={!isOpen || invalid}
                            className={[
                              "h-10 w-full rounded-xl text-xs font-black transition",
                              !isOpen || invalid
                                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95",
                            ].join(" ")}>
                            Danai
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}