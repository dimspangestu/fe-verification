import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function fmtIDR(n) { return new Intl.NumberFormat("id-ID").format(Number(n || 0)); }
function onlyDigits(str) { return String(str || "").replace(/[^\d]/g, ""); }
function formatIDRInput(raw) {
  const d = onlyDigits(raw);
  return d ? new Intl.NumberFormat("id-ID").format(Number(d)) : "";
}
function parseIDRInput(raw) { const d = onlyDigits(raw); return d ? Number(d) : 0; }
function fmtBytes(bytes) {
  const b = Number(bytes || 0);
  if (!b) return "-";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(v) {
  if (!v) return "-";
  try { return new Date(v).toLocaleString("id-ID"); } catch { return "-"; }
}

/* ─────────────────────────────────────────────────────────
   Auth
───────────────────────────────────────────────────────── */
function getToken() {
  try {
    const raw = localStorage.getItem("auth_session");
    const sess = raw ? JSON.parse(raw) : null;
    return sess?.token || localStorage.getItem("access_token") || "";
  } catch { return ""; }
}
async function authFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { key: API_KEY, Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  });
}

/* ─────────────────────────────────────────────────────────
   Components
───────────────────────────────────────────────────────── */
function Badge({ status }) {
  const map = {
    submitted: "bg-slate-50 text-slate-700 border-slate-200",
    doc_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
    funding_open: "bg-emerald-50 text-emerald-700 border-emerald-200",
    funding_closed: "bg-amber-50 text-amber-700 border-amber-200",
    disbursed_to_vendor: "bg-sky-50 text-sky-700 border-sky-200",
    repayment_running: "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deny: "bg-rose-50 text-rose-700 border-rose-200",
    cancel: "bg-rose-50 text-rose-700 border-rose-200",
    expire: "bg-slate-50 text-slate-700 border-slate-200",
    failure: "bg-rose-50 text-rose-700 border-rose-200",
    uploaded: "bg-slate-50 text-slate-700 border-slate-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected_doc: "bg-rose-50 text-rose-700 border-rose-200",
    generated: "bg-indigo-50 text-indigo-700 border-indigo-200",
    signed: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={["inline-flex px-3 py-1 rounded-full border text-xs font-black", map[status] || "bg-slate-50 text-slate-700 border-slate-200"].join(" ")}>
      {status || "-"}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-black text-slate-900">{value || "-"}</div>
    </div>
  );
}

function CardStat({ title, value, subtitle, tone = "slate" }) {
  const wrap = { slate: "border-slate-200 bg-white", emerald: "border-emerald-100 bg-emerald-50", sky: "border-sky-100 bg-sky-50", amber: "border-amber-100 bg-amber-50" };
  const val  = { slate: "text-slate-900", emerald: "text-emerald-800", sky: "text-sky-800", amber: "text-amber-800" };
  return (
    <div className={["rounded-2xl border p-5 shadow-sm", wrap[tone] || wrap.slate].join(" ")}>
      <div className="text-xs font-black uppercase text-slate-400">{title}</div>
      <div className={["mt-2 text-2xl font-black", val[tone] || val.slate].join(" ")}>{value}</div>
      {subtitle && <div className="mt-1 text-xs font-bold text-slate-500">{subtitle}</div>}
    </div>
  );
}

function DocumentPreviewModal({ open, onClose, doc, url, loading }) {
  if (!open) return null;
  const mime = doc?.mime || doc?.mime_type || "";
  const fn   = (doc?.file_name || "").toLowerCase();
  const isPdf  = mime.includes("pdf") || fn.endsWith(".pdf");
  const isImg  = mime.startsWith("image/") || [".jpg",".jpeg",".png",".webp"].some(e => fn.endsWith(e));
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-base font-black text-slate-900">Preview Dokumen</div>
            <div className="mt-1 break-all text-sm font-bold text-slate-500">{doc?.file_name || "-"}</div>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">✕</button>
        </div>
        <div className="min-h-[420px] max-h-[75vh] overflow-auto bg-slate-50 p-5">
          {loading ? <div className="grid h-[420px] place-items-center text-sm font-bold text-slate-500">Memuat preview...</div>
          : !url ? <div className="grid h-[420px] place-items-center text-sm font-bold text-slate-500">Preview tidak tersedia.</div>
          : isPdf ? <iframe src={url} title={doc?.file_name} className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-white" />
          : isImg ? <div className="flex justify-center"><img src={url} alt={doc?.file_name} className="max-h-[70vh] rounded-2xl border border-slate-200 object-contain" /></div>
          : <div className="grid h-[420px] place-items-center"><div className="text-center">
              <div className="text-sm font-black text-slate-900">File tidak bisa dipreview langsung</div>
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white">Buka File</a>
            </div></div>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
          {url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50">Buka Tab Baru</a>}
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-slate-900 px-4 text-xs font-black text-white hover:bg-slate-800">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function DocumentsTable({ title, subtitle, documents, loading, error, onRefresh, onPreview, emptyText = "Belum ada dokumen." }) {
  const dtLabel = t => ({ proposal: "Surat Penunjukan + SPK", rab: "RAB", lainnya: "Dokumen Pendukung" }[t] || t || "-");
  const sdLabel = t => ({ vendor_project: "Signed Vendor", investor_funding: "Signed Investor" }[t] || t || "-");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-base font-black text-slate-900">{title}</div>
          <div className="text-sm font-bold text-slate-400">{subtitle}</div>
        </div>
        {onRefresh && <button type="button" onClick={onRefresh} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100">Refresh</button>}
      </div>
      {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
      {loading ? <div className="text-sm font-bold text-slate-500">Memuat dokumen...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                {["Tipe","Nama File","MIME","Ukuran","Status","Uploaded At","Aksi"].map(h => (
                  <th key={h} className={["p-4 text-xs font-black text-slate-500", h==="Aksi"?"text-right":"text-left"].join(" ")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="p-4 text-sm font-black text-slate-900">{doc.doc_type ? dtLabel(doc.doc_type) : sdLabel(doc.module_type)}</td>
                  <td className="p-4 break-all text-sm font-bold text-slate-700">{doc.file_name || "-"}</td>
                  <td className="p-4 text-sm font-bold text-slate-500">{doc.mime || doc.mime_type || "-"}</td>
                  <td className="p-4 text-sm font-bold text-slate-700">{fmtBytes(doc.file_size)}</td>
                  <td className="p-4"><Badge status={doc.verification_status || doc.document_status || "uploaded"} /></td>
                  <td className="p-4 text-sm font-bold text-slate-500">{fmtDate(doc.created_at || doc.updated_at)}</td>
                  <td className="p-4 text-right">
                    <button type="button" onClick={() => onPreview(doc)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Preview</button>
                  </td>
                </tr>
              ))}
              {!documents.length && <tr><td colSpan={7} className="p-6 text-center text-sm font-bold text-slate-400">{emptyText}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DisburseModal
   
   bank_account_id can be:
   - a real UUID  → from UserBankAccount table
   - "__vendor_profile__" → synthetic entry built from Vendor
     profile fields; backend receives bank_account_id = null
     and falls back to vendor.bank_account_no
───────────────────────────────────────────────────────── */
function DisburseModal({
  open, onClose, projectId,
  vendorBankAccounts, maxDisburseAmount, escrowBalance,
  onSuccess,
}) {
  const [bankAccountId, setBankAccountId] = useState("");
  const [grossText,     setGrossText]     = useState("");
  const [feePct,        setFeePct]        = useState("0");
  const [note,          setNote]          = useState("Admin disbursement to vendor");
  const [submitting,    setSubmitting]    = useState(false);
  const [err,           setErr]           = useState("");
 
  useEffect(() => {
    if (open) {
      setBankAccountId(vendorBankAccounts?.[0]?.id || "");
      setGrossText(maxDisburseAmount > 0 ? formatIDRInput(String(maxDisburseAmount)) : "");
      setFeePct("0");
      setNote("Admin disbursement to vendor");
      setErr("");
    }
  }, [open, maxDisburseAmount, vendorBankAccounts]);
 
  const gross    = parseIDRInput(grossText);
  const feePct_  = Math.max(0, Math.min(100, Number(feePct || 0)));
  const feeAmt   = Math.round(gross * feePct_ / 100);
  const netAmt   = gross - feeAmt;
  const isSynth  = bankAccountId === "__vendor_profile__";
  const selBank  = vendorBankAccounts.find(b => b.id === bankAccountId);
 
  function handleGrossChange(raw) {
    const num = parseIDRInput(raw);
    setGrossText(num > maxDisburseAmount
      ? formatIDRInput(String(maxDisburseAmount))
      : formatIDRInput(raw));
  }
 
  async function handleSubmit() {
    setErr("");
    if (!bankAccountId)            { setErr("Pilih rekening bank vendor."); return; }
    if (!gross || gross <= 0)      { setErr("Nominal disbursement wajib diisi."); return; }
    if (gross > maxDisburseAmount) { setErr(`Maks disbursement Rp ${fmtIDR(maxDisburseAmount)}.`); return; }
    if (netAmt <= 0)               { setErr("Net amount harus > 0. Turunkan fee."); return; }
    if (Number(escrowBalance) < netAmt) {
      setErr(`Saldo escrow Rp ${fmtIDR(escrowBalance)} tidak cukup untuk net Rp ${fmtIDR(netAmt)}.`);
      return;
    }
 
    setSubmitting(true);
    try {
      const res = await authFetch(`/admin/projects/${projectId}/disburse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_id: isSynth ? null : bankAccountId,
          gross_amount:    gross,
          fee_pct:         feePct_,
          note:            note || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal disburse ke vendor");
      onSuccess(data);
      onClose();
    } catch (e) {
      setErr(e?.message || "Gagal disburse ke vendor");
    } finally {
      setSubmitting(false);
    }
  }
 
  if (!open) return null;
 
  return (
    /*
      OVERLAY
      - items-end md:items-center  → bottom sheet on mobile, centered on desktop
      - p-0 md:p-4                 → full-width sheet on mobile, padded on desktop
    */
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/*
        MODAL CONTAINER
        - flex flex-col              → header / body / footer stacked
        - max-h-[calc(100dvh-2rem)] → never taller than viewport (dvh = dynamic viewport)
        - w-full max-w-lg            → responsive width
        - rounded-t-3xl md:rounded-3xl → full round on desktop, only top on mobile sheet
      */}
      <div className="
        flex flex-col
        w-full max-w-lg
        max-h-[calc(100dvh-2rem)]
        overflow-hidden
        rounded-t-3xl md:rounded-3xl
        border border-slate-200
        bg-white shadow-2xl
      ">
 
        {/* ── HEADER — flex-shrink-0 so it never compresses ── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-sm font-black text-slate-900">Disburse ke Vendor</div>
            <div className="mt-0.5 text-xs font-bold text-slate-400">
              Dana terkumpul dari semua investor dikirim ke rekening vendor.
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="h-9 w-9 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>
 
        {/* ── BODY — flex-1 + overflow-y-auto = only this scrolls ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
 
          {/* Escrow + max */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Saldo Escrow</div>
              <div className="mt-1 text-sm font-black text-slate-900">Rp {fmtIDR(escrowBalance)}</div>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Maks Disburse</div>
              <div className="mt-1 text-sm font-black text-indigo-800">Rp {fmtIDR(maxDisburseAmount)}</div>
              <div className="text-[10px] font-bold text-slate-400">funded − disbursed</div>
            </div>
          </div>
 
          {/* Bank account */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              Rekening bank vendor <span className="text-rose-500">*</span>
            </label>
 
            {vendorBankAccounts.length > 0 ? (
              <>
                <select value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                  <option value="">— Pilih rekening —</option>
                  {vendorBankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bank_name} · {b.account_number} · {b.account_name}
                      {b._from_vendor_profile ? " (profil vendor)" : ""}
                      {b.is_default && !b._from_vendor_profile ? " ★" : ""}
                      {b.is_verified ? " ✓" : ""}
                    </option>
                  ))}
                </select>
 
                {isSynth && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    ⚠ Rekening dari profil vendor. Pastikan data benar sebelum disburse.
                  </div>
                )}
 
                {selBank && !isSynth && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                    {selBank.bank_name} · {selBank.account_number} · {selBank.account_name}
                    {selBank.is_verified
                      ? <span className="ml-2 text-emerald-600">✓ Terverifikasi</span>
                      : <span className="ml-2 text-amber-600">Belum diverifikasi</span>}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                Vendor tidak memiliki data rekening. Minta vendor melengkapi profil.
              </div>
            )}
          </div>
 
          {/* Gross amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              Nominal gross (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              value={grossText}
              onChange={e => handleGrossChange(e.target.value)}
              placeholder={`Maks Rp ${fmtIDR(maxDisburseAmount)}`}
              inputMode="numeric"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="text-[11px] font-bold text-slate-400">
              Dibatasi otomatis s/d Rp {fmtIDR(maxDisburseAmount)}
            </div>
          </div>
 
          {/* Fee */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">Platform fee (%)</label>
            <div className="flex items-center gap-2">
              <input
                value={feePct}
                onChange={e => {
                  const v = e.target.value.replace(/[^\d.]/g, "");
                  if (Number(v) <= 100) setFeePct(v);
                }}
                placeholder="0"
                inputMode="decimal"
                className="h-11 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <span className="text-sm font-bold text-slate-500">%</span>
            </div>
          </div>
 
          {/* Net preview — only show when gross > 0 */}
          {gross > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              {[
                { label: "Gross amount",        val: `Rp ${fmtIDR(gross)}`,    cls: "text-slate-900" },
                { label: `Platform fee (${feePct_}%)`, val: `− Rp ${fmtIDR(feeAmt)}`, cls: "text-rose-600" },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">{r.label}</span>
                  <span className={r.cls}>{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2">
                <span className="text-slate-900">Net ke vendor</span>
                <span className="text-emerald-700">Rp {fmtIDR(netAmt)}</span>
              </div>
            </div>
          )}
 
          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">Catatan</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
 
          {err && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              {err}
            </div>
          )}
 
          {/* Extra bottom padding so last field isn't flush with footer */}
          <div className="h-1" />
        </div>
 
        {/* ── FOOTER — flex-shrink-0 so it's always visible ── */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} disabled={submitting}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !bankAccountId ||
              !gross ||
              gross > maxDisburseAmount ||
              netAmt <= 0 ||
              vendorBankAccounts.length === 0
            }
            className="h-11 rounded-xl bg-slate-900 px-5 text-xs font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Memproses..."
              : gross > 0
                ? `Disburse Rp ${fmtIDR(netAmt)} →`
                : "Disburse →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function AdminProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [detail,             setDetail]             = useState(null);
  const [documents,          setDocuments]          = useState([]);
  const [vendorSignedDocs,   setVendorSignedDocs]   = useState([]);
  const [investorSignedDocs, setInvestorSignedDocs] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [docsLoading,        setDocsLoading]        = useState(true);
  const [signedVLoading,     setSignedVLoading]     = useState(true);
  const [signedILoading,     setSignedILoading]     = useState(true);
  const [err,                setErr]                = useState("");
  const [docsErr,            setDocsErr]            = useState("");
  const [signedVErr,         setSignedVErr]         = useState("");
  const [signedIErr,         setSignedIErr]         = useState("");
  const [submitting,         setSubmitting]         = useState(false);
  const [disburseOpen,       setDisburseOpen]       = useState(false);
  const [previewOpen,        setPreviewOpen]        = useState(false);
  const [previewDoc,         setPreviewDoc]         = useState(null);
  const [previewUrl,         setPreviewUrl]         = useState("");
  const [previewLoading,     setPreviewLoading]     = useState(false);

  /* ── derived ── */
  const project        = detail?.project        || {};
  const vendor         = detail?.vendor         || {};
  const fundingSummary = detail?.funding_summary || {};
  const fundings       = detail?.fundings        || [];

  const maxDisburseAmount = useMemo(() => {
    const funded    = Number(fundingSummary?.funded_amount    || 0);
    const disbursed = Number(fundingSummary?.disbursed_amount || 0);
    return Math.max(funded - disbursed, 0);
  }, [fundingSummary]);

  /**
   * Bank accounts to show in DisburseModal.
   *
   * Priority:
   * 1. UserBankAccount table rows (owner_type="vendor") — from vendor_bank_accounts
   * 2. Fallback: synthetic entry built from Vendor profile fields
   *    (bank_name / bank_account_no / bank_account_name)
   *
   * Most vendors only fill their profile form, not the separate
   * UserBankAccount table, so the fallback handles the common case.
   */
  const vendorBankAccounts = useMemo(() => {
    const fromTable = detail?.vendor_bank_accounts || [];
    if (fromTable.length > 0) return fromTable;

    // Build synthetic entry from Vendor profile fields
    const v = detail?.vendor || {};
    if (v.bank_name && v.bank_account_no && v.bank_account_name) {
      return [{
        id:                   "__vendor_profile__",
        bank_name:            v.bank_name,
        bank_code:            null,
        account_number:       v.bank_account_no,
        account_name:         v.bank_account_name,
        is_default:           true,
        is_verified:          false,
        _from_vendor_profile: true,
      }];
    }

    return [];
  }, [detail]);

  /* ── load ── */
  async function loadDetail() {
    if (!id) return;
    setLoading(true); setErr("");
    try {
      const res  = await authFetch(`/admin/projects/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat detail project");
      setDetail(data);
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
      setVendorSignedDocs(Array.isArray(data?.vendor_signed_documents) ? data.vendor_signed_documents.slice(0, 1) : []);
      setInvestorSignedDocs(Array.isArray(data?.investor_signed_documents) ? data.investor_signed_documents.slice(0, 1) : []);
      setDocsErr(""); setSignedVErr(""); setSignedIErr("");
    } catch (e) {
      setErr(e?.message || "Gagal memuat detail project");
    } finally {
      setLoading(false); setDocsLoading(false); setSignedVLoading(false); setSignedILoading(false);
    }
  }

  async function loadDocuments() {
    if (!id) return;
    setDocsLoading(true); setDocsErr("");
    try {
      const res  = await authFetch(`/projects/${id}/documents`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat dokumen");
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) { setDocsErr(e?.message); }
    finally { setDocsLoading(false); }
  }

  async function loadVendorSigned() {
    if (!id) return;
    setSignedVLoading(true); setSignedVErr("");
    try {
      const res  = await authFetch(`/admin/projects/${id}/vendor-signed-documents`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat signed vendor");
      setVendorSignedDocs(Array.isArray(data) ? data.slice(0, 1) : []);
    } catch (e) { setSignedVErr(e?.message); }
    finally { setSignedVLoading(false); }
  }

  async function loadInvestorSigned() {
    if (!id) return;
    setSignedILoading(true); setSignedIErr("");
    try {
      const res  = await authFetch(`/admin/projects/${id}/investor-signed-documents`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat signed investor");
      setInvestorSignedDocs(Array.isArray(data) ? data.slice(0, 1) : []);
    } catch (e) { setSignedIErr(e?.message); }
    finally { setSignedILoading(false); }
  }

  useEffect(() => { if (id) loadDetail(); }, [id]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  /* ── preview ── */
  function closePreview() {
    setPreviewOpen(false); setPreviewDoc(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  }
  async function handlePreviewDocument(doc) {
    try {
      setPreviewLoading(true); setPreviewDoc(doc); setPreviewOpen(true);
      const ep  = doc.doc_type ? `/projects/documents/${doc.id}/download` : `/signed-documents/${doc.id}/download`;
      const res = await authFetch(ep);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.detail || "Gagal membuka dokumen"); }
      setPreviewUrl(URL.createObjectURL(await res.blob()));
    } catch (e) { alert(e?.message || "Gagal preview"); closePreview(); }
    finally { setPreviewLoading(false); }
  }

  /* ── status update ── */
  async function updateStatus(status) {
    setSubmitting(true);
    try {
      const res  = await authFetch(`/admin/projects/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal update status");
      await loadDetail();
    } catch (e) { alert(e?.message || "Gagal update status"); }
    finally { setSubmitting(false); }
  }

  function handleDisburseSuccess(data) {
    alert(`Disbursement berhasil.\nGross: Rp ${fmtIDR(data.gross_amount)}\nFee: Rp ${fmtIDR(data.fee_amount)}\nNet ke vendor: Rp ${fmtIDR(data.net_amount)}`);
    loadDetail();
  }

  /* ── render ── */
  return (
    <AdminLayout title="Project Detail">
      <DocumentPreviewModal open={previewOpen} onClose={closePreview} doc={previewDoc} url={previewUrl} loading={previewLoading} />

      <DisburseModal
        open={disburseOpen}
        onClose={() => setDisburseOpen(false)}
        projectId={id}
        vendorBankAccounts={vendorBankAccounts}
        maxDisburseAmount={maxDisburseAmount}
        escrowBalance={fundingSummary?.admin_escrow_balance || 0}
        onSuccess={handleDisburseSuccess}
      />

      {err && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{err}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Memuat detail project...</div>
      ) : (
        <div className="grid gap-4">

          {/* Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-black text-slate-900">{project.project_name || project.project_code || "-"}</div>
                <div className="mt-1 text-sm font-bold text-slate-400">{project.project_code || "-"}</div>
                <div className="mt-2"><Badge status={project.status} /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "doc_review",       cls: "bg-indigo-600 hover:bg-indigo-700" },
                  { label: "funding_open",      cls: "bg-emerald-600 hover:bg-emerald-700" },
                  { label: "funding_closed",    cls: "bg-amber-600 hover:bg-amber-700" },
                  { label: "repayment_running", cls: "bg-violet-600 hover:bg-violet-700" },
                  { label: "completed",         cls: "bg-teal-600 hover:bg-teal-700" },
                  { label: "rejected",          cls: "bg-rose-600 hover:bg-rose-700" },
                ].map(s => (
                  <button key={s.label} type="button" disabled={submitting} onClick={() => updateStatus(s.label)}
                    className={["h-9 rounded-xl px-3 text-xs font-black text-white disabled:opacity-50", s.cls].join(" ")}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-base font-black text-slate-900 mb-4">Informasi Proyek</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Project Type"        value={project.project_type} />
                <Field label="Type Other"          value={project.project_type_other} />
                <Field label="Funding Needed"      value={`Rp ${fmtIDR(project.funding_needed)}`} />
                <Field label="Min Funding (kolektif)" value={`Rp ${fmtIDR(project.min_funding)}`} />
                <Field label="Tenor"               value={`${project.tenor_months || 0} bulan`} />
                <Field label="Fixed Return"        value={`${project.fixed_return_pct || 0}%`} />
                <Field label="Return Total"        value={`Rp ${fmtIDR(project.return_total_amount)}`} />
                <Field label="Payback Total"       value={`Rp ${fmtIDR(project.payback_total_amount)}`} />
                <Field label="Return / Bulan"      value={`Rp ${fmtIDR(project.return_monthly_amount)}`} />
                <Field label="Submitted At"        value={fmtDate(project.submitted_at || project.created_at)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-base font-black text-slate-900 mb-4">Info Vendor</div>
              <div className="grid gap-3">
                <Field label="Company Name"  value={vendor.company_name} />
                <Field label="PIC"           value={vendor.pic_name} />
                <Field label="Email"         value={vendor.email} />
                <Field label="Phone"         value={vendor.phone} />
                <Field label="KYC Status"    value={vendor.kyc_status} />
                <Field label="Bank"          value={vendor.bank_name} />
                <Field label="Account No"    value={vendor.bank_account_no} />
                <Field label="Account Name"  value={vendor.bank_account_name} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <DocumentsTable title="Dokumen Upload Vendor" subtitle="Dokumen awal saat submit project."
            documents={documents} loading={docsLoading} error={docsErr} onRefresh={loadDocuments} onPreview={handlePreviewDocument} emptyText="Belum ada dokumen." />
          <DocumentsTable title="Dokumen Signed Vendor" subtitle="PDF perjanjian vendor yang sudah ditandatangani."
            documents={vendorSignedDocs} loading={signedVLoading} error={signedVErr} onRefresh={loadVendorSigned} onPreview={handlePreviewDocument} emptyText="Belum ada signed vendor." />
          <DocumentsTable title="Dokumen Signed Investor" subtitle="PDF perjanjian investor yang sudah ditandatangani."
            documents={investorSignedDocs} loading={signedILoading} error={signedIErr} onRefresh={loadInvestorSigned} onPreview={handlePreviewDocument} emptyText="Belum ada signed investor." />

          {/* Funding stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <CardStat title="Target Pendanaan"   value={`Rp ${fmtIDR(fundingSummary.target || 0)}`} />
            <CardStat title="Funded Amount"      value={`Rp ${fmtIDR(fundingSummary.funded_amount || 0)}`}
              subtitle={`${fundingSummary.paid_funding_count || 0} investor paid`} tone="emerald" />
            <CardStat title="Disbursed Amount"   value={`Rp ${fmtIDR(fundingSummary.disbursed_amount || 0)}`} tone="sky" />
            <CardStat title="Maks Disburse Sisa" value={`Rp ${fmtIDR(maxDisburseAmount)}`}
              subtitle={maxDisburseAmount > 0 ? "Siap didisburse" : "Sudah terdistribusi"} tone={maxDisburseAmount > 0 ? "amber" : "slate"} />
          </div>

          {/* Disburse trigger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-base font-black text-slate-900">Disbursement ke Vendor</div>
                <div className="mt-1 text-sm font-bold text-slate-400">
                  Dana dari <span className="text-slate-700">{fundingSummary.paid_funding_count || 0} investor</span> terkumpul{" "}
                  Rp {fmtIDR(fundingSummary.funded_amount || 0)} di escrow. Maks disburse: Rp {fmtIDR(maxDisburseAmount)}.
                </div>
                {/* Show which bank will be used */}
                {vendorBankAccounts.length > 0 && (
                  <div className="mt-2 text-xs font-bold text-slate-500">
                    Rekening tersedia: {vendorBankAccounts[0].bank_name} · {vendorBankAccounts[0].account_number}
                    {vendorBankAccounts[0]._from_vendor_profile ? " (dari profil vendor)" : ""}
                  </div>
                )}
                {vendorBankAccounts.length === 0 && (
                  <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                    Vendor belum memiliki data rekening bank. Minta vendor melengkapi profil.
                  </div>
                )}
              </div>
              <button type="button"
                disabled={maxDisburseAmount <= 0 || vendorBankAccounts.length === 0}
                onClick={() => setDisburseOpen(true)}
                className="h-11 shrink-0 rounded-xl bg-slate-900 px-5 text-xs font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                Buka Form Disburse →
              </button>
            </div>
          </div>

          {/* Investor fundings */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="text-base font-black text-slate-900">List Investor Funding</div>
              <div className="text-sm font-bold text-slate-400">
                {fundings.length} total · {fundings.filter(f => f.funding_status === "paid").length} paid
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["#","Investor ID","Amount","Expected Return","Total Back","Paid At","Status"].map((h, i) => (
                      <th key={h} className={["p-4 text-xs font-black text-slate-500", i===0?"w-10":"", "text-left"].join(" ")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fundings.map((f, idx) => (
                    <tr key={f.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <td className="p-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 text-xs font-bold text-slate-500 max-w-[140px] truncate">{f.investor_user_id}</td>
                      <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(f.funding_amount)}</td>
                      <td className="p-4 text-sm font-black text-slate-700">Rp {fmtIDR(f.expected_return_amount)}</td>
                      <td className="p-4 text-sm font-black text-slate-700">Rp {fmtIDR(f.expected_total_back)}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">{fmtDate(f.paid_at)}</td>
                      <td className="p-4"><Badge status={f.funding_status} /></td>
                    </tr>
                  ))}
                  {!fundings.length && <tr><td colSpan={7} className="p-6 text-center text-sm font-bold text-slate-400">Belum ada investor funding.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}