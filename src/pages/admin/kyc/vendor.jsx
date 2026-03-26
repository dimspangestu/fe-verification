// pages/admin/kyc/vendor.jsx
import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const KYC_DOC_LABELS = {
  buku_tabungan:   { label: "Buku Tabungan",          icon: "🏦" },
  npwp:            { label: "NPWP",                   icon: "📋" },
  akta_perusahaan: { label: "Akta Perusahaan",        icon: "📜" },
  izin_usaha:      { label: "Izin Usaha (SIUP / NIB)", icon: "✅" },
};

const KYC_STATUS = {
  unverified: { label: "Belum Upload",    cls: "border-slate-200 bg-slate-50 text-slate-600",    dot: "bg-slate-400"   },
  pending:    { label: "Menunggu Review", cls: "border-amber-200 bg-amber-50 text-amber-700",    dot: "bg-amber-500"   },
  verified:   { label: "Terverifikasi",   cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected:   { label: "Ditolak",        cls: "border-rose-200 bg-rose-50 text-rose-700",       dot: "bg-rose-500"    },
};

const TABS = [
  { key: "pending",  label: "Perlu Review",  tone: "amber"   },
  { key: "all",      label: "Semua",          tone: "slate"   },
  { key: "verified", label: "Terverifikasi",  tone: "emerald" },
  { key: "rejected", label: "Ditolak",        tone: "rose"    },
];

/* ─────────────── helpers ─────────────── */
function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw  = localStorage.getItem("auth_session");
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

function fmtDate(v) {
  if (!v) return "-";
  try { return new Date(v).toLocaleString("id-ID"); } catch { return "-"; }
}

function fmtBytes(b) {
  const n = Number(b || 0);
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "--";
}

/* ─────────────── KYC Badge ─────────────── */
function KycBadge({ status }) {
  const cfg = KYC_STATUS[status] || KYC_STATUS.unverified;
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold", cfg.cls].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full shrink-0", cfg.dot].join(" ")} />
      {cfg.label}
    </span>
  );
}

/* ─────────────── Doc Preview Modal ─────────────── */
function DocPreviewModal({ open, onClose, vendorId, doc }) {
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !doc) return;
    let objectUrl = "";
    setLoading(true);

    authFetch(`/admin/vendors/${vendorId}/kyc-documents/${doc.id}/download`)
      .then((r) => { if (!r.ok) throw new Error(); return r.blob(); })
      .then((blob) => { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); })
      .catch(() => setUrl(""))
      .finally(() => setLoading(false));

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [open, doc, vendorId]);

  useEffect(() => {
    if (!open && url) { URL.revokeObjectURL(url); setUrl(""); }
  }, [open]);

  if (!open || !doc) return null;

  const cfg     = KYC_DOC_LABELS[doc.doc_type] || {};
  const isPdf   = (doc.mime || "").includes("pdf") || (doc.file_name || "").endsWith(".pdf");
  const isImage = (doc.mime || "").startsWith("image/");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-base font-black text-slate-900">{cfg.icon} {cfg.label || doc.doc_type}</div>
            <div className="mt-0.5 text-sm font-bold text-slate-500 break-all">{doc.file_name}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-400">{fmtBytes(doc.file_size)}</div>
          </div>
          <button onClick={onClose} className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">✕</button>
        </div>
        <div className="min-h-[400px] max-h-[72vh] overflow-auto bg-slate-50 p-5">
          {loading ? (
            <div className="grid h-[400px] place-items-center">
              <div className="flex flex-col items-center gap-3 text-sm font-bold text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
                Memuat dokumen...
              </div>
            </div>
          ) : !url ? (
            <div className="grid h-[400px] place-items-center text-sm font-bold text-slate-500">Gagal memuat dokumen.</div>
          ) : isPdf ? (
            <iframe src={url} title={doc.file_name} className="h-[68vh] w-full rounded-2xl border border-slate-200 bg-white" />
          ) : isImage ? (
            <div className="flex justify-center">
              <img src={url} alt={doc.file_name} className="max-h-[68vh] rounded-2xl border border-slate-200 object-contain" />
            </div>
          ) : (
            <div className="grid h-[400px] place-items-center text-center">
              <div className="text-sm font-black text-slate-900">File tidak bisa dipreview</div>
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white hover:bg-slate-800">Buka File</a>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
          {url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50">Buka Tab Baru</a>}
          <button onClick={onClose} className="h-10 rounded-xl bg-slate-900 px-4 text-xs font-black text-white hover:bg-slate-800">Tutup</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Detail Drawer ─────────────── */
function VendorKycDrawer({ vendor, onClose, onReviewed }) {
  const [detail,     setDetail]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (!vendor) return;
    setLoading(true);
    setShowReject(false);
    setRejectNote("");
    authFetch(`/admin/vendors/${vendor.id}/kyc`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [vendor]);

  async function handleApprove() {
    if (!confirm(`Approve KYC vendor "${vendor.company_name || vendor.id}"?`)) return;
    setSubmitting(true);
    try {
      const res  = await authFetch(`/admin/vendors/${vendor.id}/kyc-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kyc_status: "verified" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal approve KYC");
      onReviewed(vendor.id, "verified");
      onClose();
    } catch (e) { alert(e?.message || "Gagal approve KYC"); }
    finally { setSubmitting(false); }
  }

  async function handleReject() {
    if (!rejectNote.trim()) { alert("Isi alasan penolakan terlebih dahulu."); return; }
    setSubmitting(true);
    try {
      const res  = await authFetch(`/admin/vendors/${vendor.id}/kyc-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kyc_status: "rejected", kyc_note: rejectNote.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal reject KYC");
      onReviewed(vendor.id, "rejected");
      onClose();
    } catch (e) { alert(e?.message || "Gagal reject KYC"); }
    finally { setSubmitting(false); }
  }

  if (!vendor) return null;

  const v    = detail?.vendor || vendor;
  const docs = detail?.kyc_documents || [];
  const docMap = {};
  docs.forEach((d) => { docMap[d.doc_type] = d; });
  const allDocs = Object.keys(KYC_DOC_LABELS).every((t) => docMap[t]);

  return (
    <>
      <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[999] flex w-full max-w-[640px] flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 border border-slate-200">
              {getInitials(v.company_name || v.vendor_code)}
            </div>
            <div>
              <div className="text-base font-black text-slate-900">{v.company_name || "—"}</div>
              <div className="text-xs font-bold text-slate-400">{v.vendor_code || v.id}</div>
              <div className="mt-1"><KycBadge status={v.kyc_status} /></div>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid h-64 place-items-center text-sm font-bold text-slate-500">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
                Memuat data vendor...
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-5">

              {/* Info vendor */}
              <div>
                <div className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Informasi Vendor</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Nama Perusahaan", v.company_name],
                    ["PIC",            v.pic_name],
                    ["Email",          v.email],
                    ["Telepon",        v.phone],
                    ["NPWP",           v.npwp],
                    ["NIK",            v.nik],
                    ["Tipe",           v.vendor_type],
                    ["Kode Vendor",    v.vendor_code],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10px] font-black uppercase text-slate-400">{label}</div>
                      <div className="mt-0.5 text-sm font-bold text-slate-800 break-words">{value || "—"}</div>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-black uppercase text-slate-400">Alamat</div>
                    <div className="mt-0.5 text-sm font-bold text-slate-800">{v.address || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Bank */}
              <div>
                <div className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Rekening Bank</div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[["Bank", v.bank_name], ["No. Rekening", v.bank_account_no], ["Nama Pemilik", v.bank_account_name]].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] font-black uppercase text-slate-400">{label}</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-800">{value || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KYC Docs */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wide text-slate-400">Dokumen KYC</div>
                  <div className="text-xs font-bold text-slate-500">{docs.length} / {Object.keys(KYC_DOC_LABELS).length} dokumen</div>
                </div>
                <div className="space-y-3">
                  {Object.entries(KYC_DOC_LABELS).map(([type, cfg]) => {
                    const doc = docMap[type];
                    return (
                      <div key={type} className={["rounded-2xl border p-4 transition",
                        doc ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50",
                      ].join(" ")}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl shrink-0">{cfg.icon}</span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{cfg.label}</span>
                                {doc ? (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">✓ Terupload</span>
                                ) : (
                                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600">Belum upload</span>
                                )}
                              </div>
                              {doc && (
                                <div className="mt-0.5 text-xs font-semibold text-slate-500 truncate max-w-[240px]">
                                  {doc.file_name} • {fmtBytes(doc.file_size)} • {fmtDate(doc.created_at)}
                                </div>
                              )}
                            </div>
                          </div>
                          {doc && (
                            <button type="button" onClick={() => setPreviewDoc(doc)}
                              className="shrink-0 inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition">
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!allDocs && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-700">
                    ⚠ Vendor belum mengupload semua dokumen.
                  </div>
                )}
              </div>

              {/* Reject note existing */}
              {v.kyc_status === "rejected" && v.kyc_note && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-xs font-black uppercase text-rose-500">Catatan Penolakan Sebelumnya</div>
                  <div className="mt-1 text-sm font-bold text-rose-800">{v.kyc_note}</div>
                </div>
              )}

              {/* Reject form */}
              {showReject && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                  <div className="text-sm font-black text-rose-800">Alasan Penolakan</div>
                  <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3}
                    placeholder="Contoh: Akta perusahaan tidak jelas..."
                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-rose-100 resize-none" />
                  <div className="flex gap-2">
                    <button type="button" disabled={submitting} onClick={handleReject}
                      className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-black text-white hover:bg-rose-700 disabled:opacity-50">
                      {submitting ? "Mengirim..." : "Konfirmasi Tolak"}
                    </button>
                    <button type="button" onClick={() => { setShowReject(false); setRejectNote(""); }}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && v.kyc_status !== "verified" && (
          <div className="border-t border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-bold text-slate-400">Pastikan semua dokumen sudah dicek sebelum approve.</div>
              <div className="flex items-center gap-2">
                {!showReject && (
                  <button type="button" disabled={submitting} onClick={() => setShowReject(true)}
                    className="h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50">
                    Tolak
                  </button>
                )}
                <button type="button" disabled={submitting} onClick={handleApprove}
                  className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                  {submitting ? "Memproses..." : "✓ Approve KYC"}
                </button>
              </div>
            </div>
          </div>
        )}
        {!loading && v.kyc_status === "verified" && (
          <div className="border-t border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            ✓ KYC sudah terverifikasi.
          </div>
        )}
      </div>

      <DocPreviewModal open={!!previewDoc} onClose={() => setPreviewDoc(null)} vendorId={vendor.id} doc={previewDoc} />
    </>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function AdminKycVendorPage() {
  const [vendors,    setVendors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [q,          setQ]          = useState("");
  const [filterTab,  setFilterTab]  = useState("pending");
  const [selected,   setSelected]   = useState(null);

  async function loadVendors(status) {
    setLoading(true);
    setError("");
    try {
      const qs  = status !== "all" ? `?kyc_status=${status}&limit=200` : "?limit=200";
      const res = await authFetch(`/admin/vendors/kyc${qs}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat data KYC vendor");
      setVendors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVendors(filterTab); }, [filterTab]);

  function handleReviewed(vendorId, newStatus) {
    setVendors((prev) =>
      prev.map((v) => v.id === vendorId ? { ...v, kyc_status: newStatus } : v)
          .filter((v) => filterTab === "all" || v.kyc_status === filterTab)
    );
  }

  const counts = useMemo(() => {
    const c = { pending: 0, verified: 0, rejected: 0, unverified: 0 };
    vendors.forEach((v) => { if (c[v.kyc_status] !== undefined) c[v.kyc_status]++; });
    return c;
  }, [vendors]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return vendors;
    return vendors.filter((v) =>
      (v.company_name || "").toLowerCase().includes(qq) ||
      (v.email        || "").toLowerCase().includes(qq) ||
      (v.vendor_code  || "").toLowerCase().includes(qq)
    );
  }, [vendors, q]);

  const tabCls = {
    amber:   { active: "bg-amber-600 text-white",   inactive: "text-slate-600 hover:bg-amber-50 hover:text-amber-700"    },
    slate:   { active: "bg-slate-700 text-white",   inactive: "text-slate-600 hover:bg-slate-50"                         },
    emerald: { active: "bg-emerald-600 text-white", inactive: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" },
    rose:    { active: "bg-rose-600 text-white",    inactive: "text-slate-600 hover:bg-rose-50 hover:text-rose-700"       },
  };

  return (
    <AdminLayout title="KYC Penerima Dana">
      {selected && (
        <VendorKycDrawer vendor={selected} onClose={() => setSelected(null)} onReviewed={handleReviewed} />
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">Verifikasi KYC Penerima Dana</div>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              Review dokumen KYC vendor sebelum mereka bisa mengajukan proyek.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Menunggu", count: counts.pending,  cls: "border-amber-200 bg-amber-50 text-amber-700"     },
              { label: "Verified", count: counts.verified, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
              { label: "Ditolak",  count: counts.rejected, cls: "border-rose-200 bg-rose-50 text-rose-700"         },
            ].map((s) => (
              <div key={s.label} className={["rounded-xl border px-3 py-2 text-center", s.cls].join(" ")}>
                <div className="text-lg font-black">{s.count}</div>
                <div className="text-[10px] font-black">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5">
            {TABS.map((t) => {
              const active = filterTab === t.key;
              const tc     = tabCls[t.tone];
              return (
                <button key={t.key} onClick={() => setFilterTab(t.key)}
                  className={["rounded-xl px-4 py-2 text-sm font-extrabold transition", active ? tc.active : tc.inactive].join(" ")}>
                  {t.label}
                  {t.key === "pending" && counts.pending > 0 && (
                    <span className={["ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-black", active ? "bg-white/30 text-white" : "bg-amber-100 text-amber-700"].join(" ")}>
                      {counts.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / email / kode..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 md:w-[300px]" />
            <button onClick={() => loadVendors(filterTab)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50 shrink-0">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="text-sm font-black text-slate-800">
              {TABS.find((t) => t.key === filterTab)?.label}
            </div>
            <div className="text-xs font-bold text-slate-400">
              {loading ? "Memuat..." : `${filtered.length} vendor`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Vendor", "Email / Telepon", "Bank", "Dokumen", "KYC Status", "Update", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 animate-pulse rounded-md bg-slate-100" /></td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                    {q ? "Tidak ada hasil pencarian." : "Tidak ada vendor di kategori ini."}
                  </td></tr>
                ) : filtered.map((v) => {
                  const uploaded = v.kyc_doc_types_uploaded || [];
                  const total    = Object.keys(KYC_DOC_LABELS).length;
                  const allDone  = uploaded.length >= total;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-700 border border-slate-200">
                            {getInitials(v.company_name)}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{v.company_name || "—"}</div>
                            <div className="text-xs font-bold text-slate-400">{v.vendor_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-slate-700">{v.email || "—"}</div>
                        <div className="text-xs font-semibold text-slate-400">{v.phone || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-slate-700">{v.bank_name || "—"}</div>
                        <div className="text-xs font-semibold text-slate-400">{v.bank_account_no || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div className={["h-1.5 rounded-full", allDone ? "bg-emerald-500" : "bg-slate-400"].join(" ")}
                              style={{ width: `${(uploaded.length / total) * 100}%` }} />
                          </div>
                          <span className="text-xs font-extrabold text-slate-600">{uploaded.length}/{total}</span>
                        </div>
                        <div className="mt-1 flex gap-1">
                          {Object.entries(KYC_DOC_LABELS).map(([t, cfg]) => (
                            <span key={t} title={cfg.label} className={uploaded.includes(t) ? "opacity-100" : "opacity-20"}>
                              {cfg.icon}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4"><KycBadge status={v.kyc_status} /></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">{fmtDate(v.updated_at || v.created_at)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setSelected(v)}
                          className={["inline-flex h-9 items-center rounded-xl px-4 text-xs font-black transition",
                            v.kyc_status === "pending"
                              ? "bg-slate-900 text-white hover:bg-slate-700"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          ].join(" ")}>
                          {v.kyc_status === "pending" ? "Review →" : "Lihat"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}