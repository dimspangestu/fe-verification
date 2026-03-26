"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const BANK_OPTIONS = [
  "BCA","BRI","BNI","Mandiri","CIMB Niaga",
  "Danamon","Permata Bank","BSI","BTN","Lainnya",
];

const KYC_DOCS_CONFIG = [
  { type:"buku_tabungan",   label:"Buku Tabungan",           hint:"Halaman depan buku tabungan (nama & nomor rekening)", accept:".pdf,.jpg,.jpeg,.png", icon:"🏦" },
  { type:"npwp",            label:"NPWP",                    hint:"Kartu NPWP perusahaan atau individu",                  accept:".pdf,.jpg,.jpeg,.png", icon:"📋" },
  { type:"akta_perusahaan", label:"Akta Perusahaan",         hint:"Akta pendirian perusahaan dari notaris",              accept:".pdf,.jpg,.jpeg,.png", icon:"📜" },
  { type:"izin_usaha",      label:"Izin Usaha (SIUP / NIB)", hint:"SIUP, NIB, atau izin usaha yang masih berlaku",       accept:".pdf,.jpg,.jpeg,.png", icon:"✅" },
];

const EMPTY_FORM = {
  vendor_type:"company", company_name:"", pic_name:"",
  email:"", phone:"", npwp:"", nik:"", address:"",
  bank_name:"", bank_account_no:"", bank_account_name:"",
};

const KYC_LABEL = { unverified:"Belum Diverifikasi", pending:"Menunggu Verifikasi", verified:"Terverifikasi", rejected:"Ditolak" };
const KYC_CLS   = {
  unverified:"border-slate-200 bg-slate-50 text-slate-600",
  pending:   "border-amber-200 bg-amber-50 text-amber-700",
  verified:  "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:  "border-rose-200 bg-rose-50 text-rose-700",
};

/* ─── helpers ─── */
function getToken() {
  if (typeof window==="undefined") return null;
  try {
    const sess = JSON.parse(localStorage.getItem("auth_session") || "null");
    return sess?.token || localStorage.getItem("access_token") || null;
  } catch { return localStorage.getItem("access_token") || null; }
}
function getInitials(n="") {
  const p = (n||"").trim().split(" ").filter(Boolean);
  if (p.length>=2) return (p[0][0]+p[1][0]).toUpperCase();
  return (n||"").slice(0,2).toUpperCase() || "--";
}
function fmtBytes(b) {
  const n=Number(b||0);
  if (!n) return "-";
  if (n<1024) return `${n} B`;
  if (n<1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/(1024*1024)).toFixed(1)} MB`;
}

/* ─── UI atoms ─── */
function Toast({ message, type, visible }) {
  if (!visible) return null;
  return (
    <div className={["fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg max-w-xs",
      type==="success"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-rose-200 bg-rose-50 text-rose-800"].join(" ")}>
      {type==="success"?"✓ ":"✕ "}{message}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-slate-700">
          {label}
          {required && <span className="ml-1.5 rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-black text-rose-600">Wajib</span>}
        </span>
        {hint && <span className="text-[10px] font-bold text-slate-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls = [
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3",
  "text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400",
  "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition",
].join(" ");

const Input = ({ className="", ...props }) => <input {...props} className={`${inputCls} ${className}`} />;
const Sel   = ({ className="", children, ...props }) => <select {...props} className={`${inputCls} ${className}`}>{children}</select>;
const Tex   = ({ className="", ...props }) => (
  <textarea {...props} className={["w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 resize-none",
    "text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400",
    "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition", className].join(" ")} />
);

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-base">{icon}</div>
        <div>
          <span className="text-sm font-black text-slate-900">{title}</span>
          {subtitle && <div className="text-xs font-bold text-slate-400">{subtitle}</div>}
        </div>
      </div>
      <div className="grid gap-4 p-5">{children}</div>
    </div>
  );
}

/* ─── Confirm Reset KYC Modal ─── */
function ConfirmResetModal({ open, onConfirm, onCancel, saving }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">⚠️</div>
            <div>
              <div className="text-base font-black text-slate-900">Simpan Perubahan Profil?</div>
              <div className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">
                Karena KYC Anda sudah <span className="font-black text-emerald-700">Terverifikasi</span>,
                menyimpan perubahan akan mengubah status menjadi{" "}
                <span className="font-black text-amber-700">Menunggu Verifikasi</span> kembali.
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-400">
                Admin akan mereview ulang profil dan dokumen Anda. Fitur submit project tetap bisa diakses selama proses review.
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onCancel} disabled={saving}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={saving}
            className={["h-11 rounded-xl px-5 text-xs font-black transition",
              saving?"cursor-not-allowed bg-slate-200 text-slate-500":"bg-amber-600 text-white hover:bg-amber-700"].join(" ")}>
            {saving?"Menyimpan...":"Ya, Simpan & Reset KYC"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── KYC Progress ─── */
function KycProgress({ kycDocs, kycStatus }) {
  const total = KYC_DOCS_CONFIG.length;
  const done  = KYC_DOCS_CONFIG.filter((d) => kycDocs[d.type]).length;
  const pct   = Math.round((done/total)*100);

  if (kycStatus==="verified") return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
      <span className="text-xl">🎉</span>
      <div>
        <div className="text-sm font-black text-emerald-800">KYC Terverifikasi</div>
        <div className="text-xs font-semibold text-emerald-700">Semua dokumen diverifikasi. Perubahan profil akan meminta review ulang.</div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black text-slate-700">Progress Upload Dokumen KYC</div>
          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {done} dari {total} dokumen terupload
            {kycStatus==="pending"  && " — Sedang direview admin"}
            {kycStatus==="rejected" && " — Ditolak, upload ulang dokumen"}
          </div>
        </div>
        <div className="text-lg font-black text-slate-700">{pct}%</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={["h-2 rounded-full transition-all duration-500",
          pct===100&&kycStatus==="pending"?"bg-amber-500":"bg-indigo-500"].join(" ")}
          style={{width:`${pct}%`}} />
      </div>
      {done===total && kycStatus!=="pending" && (
        <div className="mt-2 text-[11px] font-bold text-emerald-700">
          ✓ Semua dokumen terupload — status otomatis berubah ke "Menunggu Verifikasi"
        </div>
      )}
    </div>
  );
}

/* ─── KYC Doc Row ─── */
function KycDocRow({ config, uploaded, uploading, onUpload, onDelete }) {
  const { type, label, hint, accept, icon } = config;
  const has = !!uploaded;
  return (
    <div className={["rounded-2xl border p-4 transition",
      has?"border-emerald-200 bg-emerald-50/40":"border-slate-200 bg-white"].join(" ")}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm">{icon}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-slate-900">{label}</span>
              {has ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">✓ Terupload</span>
              ) : (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600">Wajib</span>
              )}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-400">{hint}</div>
            {has && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="truncate max-w-[200px]">{uploaded.file_name}</span>
                <span>•</span>
                <span>{fmtBytes(uploaded.file_size)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <label className={["inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border px-4 text-xs font-black transition",
            uploading?"cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : has?"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                 :"border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"].join(" ")}>
            <input type="file" accept={accept} className="hidden" disabled={uploading}
              onChange={(e) => onUpload(type, e.target.files?.[0]||null)} />
            {uploading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                Mengupload...
              </span>
            ) : has?"Ganti File":"Upload"}
          </label>
          {has && (
            <button type="button" disabled={uploading} onClick={() => onDelete(uploaded.id, type)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-rose-500 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 transition">
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function VendorProfilePage() {
  const router = useRouter();

  const [pageLoading,    setPageLoading]    = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [kycStatus,      setKycStatus]      = useState("unverified");
  const [kycNote,        setKycNote]        = useState(null);
  const [vendorCode,     setVendorCode]     = useState(null);
  const [isNewProfile,   setIsNewProfile]   = useState(false);
  const [lastSaved,      setLastSaved]      = useState(null);
  const [showConfirm,    setShowConfirm]    = useState(false);

  const [kycDocs,        setKycDocs]        = useState({});
  const [kycUploading,   setKycUploading]   = useState({});
  const [kycDocsLoading, setKycDocsLoading] = useState(true);

  const savedFormRef = useRef(EMPTY_FORM);
  const toastTimer   = useRef(null);
  const [toast, setToast] = useState({ visible:false, message:"", type:"success" });

  const isVerified  = kycStatus==="verified";
  const kycRequired = router.query.kyc_required==="1";

  function showToast(message, type="success") {
    clearTimeout(toastTimer.current);
    setToast({ visible:true, message, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible:false })), 4000);
  }

  const set = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));
  const handlePhone  = (e) => setForm((p) => ({ ...p, phone:           e.target.value.replace(/[^\d+\-\s]/g,"") }));
  const handleNik    = (e) => setForm((p) => ({ ...p, nik:             e.target.value.replace(/\D/g,"").slice(0,16) }));
  const handleAccNo  = (e) => setForm((p) => ({ ...p, bank_account_no: e.target.value.replace(/\D/g,"") }));
  const handleReset  = ()  => setForm({ ...savedFormRef.current });

  function validate() {
    if (!form.company_name?.trim())      return "Nama perusahaan wajib diisi.";
    if (!form.email?.trim())             return "Email wajib diisi.";
    if (!form.bank_name)                 return "Nama bank wajib dipilih.";
    if (!form.bank_account_no?.trim())   return "Nomor rekening wajib diisi.";
    if (!form.bank_account_name?.trim()) return "Nama pemilik rekening wajib diisi.";
    return null;
  }

  /* load */
  useEffect(() => {
    async function load() {
      const token = getToken();
      try {
        const res  = await fetch(`${API_BASE}/vendor/me`, {
          headers: { Authorization:`Bearer ${token||""}`, key:API_KEY },
        });
        if (res.status===404) {
          setIsNewProfile(true);
        } else if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          showToast(d?.detail || "Gagal memuat profil.", "error");
        } else {
          const data = await res.json();
          setKycStatus(data.kyc_status || "unverified");
          setKycNote(data.kyc_note || null);
          setVendorCode(data.vendor_code || null);
          const merged = { ...EMPTY_FORM, ...Object.fromEntries(
            Object.keys(EMPTY_FORM).map((k) => [k, data[k] ?? EMPTY_FORM[k]])
          )};
          setForm(merged);
          savedFormRef.current = merged;
          setIsNewProfile(false);
        }
      } catch { showToast("Gagal memuat data profil.", "error"); }
      finally { setPageLoading(false); }

      try {
        setKycDocsLoading(true);
        const docsRes = await fetch(`${API_BASE}/vendor/me/kyc-documents`, {
          headers: { Authorization:`Bearer ${token||""}`, key:API_KEY },
        });
        if (docsRes.ok) {
          const list = await docsRes.json();
          const map  = {};
          (Array.isArray(list) ? list : []).forEach((d) => { map[d.doc_type] = d; });
          setKycDocs(map);
        }
      } catch {}
      finally { setKycDocsLoading(false); }
    }
    load();
  }, []);

  /* actual save */
  async function doSave() {
    setSaving(true);
    try {
      const token = getToken();
      const payload = {
        vendor_type: form.vendor_type||"company", company_name: form.company_name||null,
        pic_name: form.pic_name||null, email: form.email||null, phone: form.phone||null,
        npwp: form.npwp||null, nik: form.nik||null, address: form.address||null,
        bank_name: form.bank_name||null, bank_account_no: form.bank_account_no||null,
        bank_account_name: form.bank_account_name||null,
      };
      const res = await fetch(`${API_BASE}/vendor/me`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token||""}`, key:API_KEY },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail=`Gagal menyimpan (HTTP ${res.status}).`;
        try { const d=await res.json(); detail=d?.detail||detail; } catch {}
        throw new Error(detail);
      }
      const saved = await res.json();
      setKycStatus(saved.kyc_status || "unverified");
      setKycNote(saved.kyc_note || null);
      setVendorCode(saved.vendor_code || null);
      setIsNewProfile(false);
      savedFormRef.current = { ...form };
      setLastSaved(new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      showToast(
        saved.kyc_status==="pending"
          ? "Profil disimpan. Status KYC direset ke Menunggu Verifikasi."
          : "Profil berhasil disimpan.",
        "success"
      );
    } catch (err) {
      showToast(err?.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  /* submit */
  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    // If already verified, show confirmation modal before saving
    if (isVerified) { setShowConfirm(true); return; }
    await doSave();
  }

  /* kyc upload */
  async function handleKycUpload(docType, file) {
    if (!file) return;
    setKycUploading((p) => ({ ...p, [docType]:true }));
    try {
      const token = getToken();
      const fd    = new FormData();
      fd.append("doc_type", docType);
      fd.append("file", file);
      const res  = await fetch(`${API_BASE}/vendor/me/kyc-documents`, {
        method:"POST", headers:{ Authorization:`Bearer ${token||""}`, key:API_KEY }, body:fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal upload.");
      const cfg = KYC_DOCS_CONFIG.find((d) => d.type===docType);
      setKycDocs((p) => ({ ...p, [docType]:{ id:data.id, doc_type:docType, file_name:file.name, file_size:data.file_size||file.size } }));
      if (data.kyc_status) setKycStatus(data.kyc_status);
      showToast(`${cfg?.label||docType} berhasil diupload.`, "success");
    } catch (e) { showToast(e?.message || "Gagal upload.", "error"); }
    finally { setKycUploading((p) => ({ ...p, [docType]:false })); }
  }

  /* kyc delete */
  async function handleKycDelete(docId, docType) {
    if (!confirm("Hapus dokumen ini?")) return;
    setKycUploading((p) => ({ ...p, [docType]:true }));
    try {
      const token = getToken();
      const res   = await fetch(`${API_BASE}/vendor/me/kyc-documents/${docId}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token||""}`, key:API_KEY },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal hapus.");
      setKycDocs((p) => { const n={...p}; delete n[docType]; return n; });
      if (data.kyc_status) setKycStatus(data.kyc_status);
      showToast("Dokumen berhasil dihapus.", "success");
    } catch (e) { showToast(e?.message || "Gagal hapus.", "error"); }
    finally { setKycUploading((p) => ({ ...p, [docType]:false })); }
  }

  /* skeleton */
  if (pageLoading) {
    return (
      <TailAdminLayout title="Profil Vendor">
        <div className="grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
            <div className="grid gap-2">
              <div className="h-4 w-40 animate-pulse rounded-md bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
          {[7,3,4].map((n,i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 h-4 w-36 animate-pulse rounded-md bg-slate-100" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({length:n}).map((_,j) => (
                  <div key={j} className="grid gap-1.5">
                    <div className="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
                    <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TailAdminLayout>
    );
  }

  return (
    <TailAdminLayout title="Profil Vendor">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <ConfirmResetModal
        open={showConfirm}
        onConfirm={doSave}
        onCancel={() => { if (!saving) setShowConfirm(false); }}
        saving={saving}
      />

      {kycRequired && !isVerified && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
          ⚠ Lengkapi profil dan verifikasi KYC terlebih dahulu.
        </div>
      )}
      {isNewProfile && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          ⚠ Profil vendor belum dibuat. Lengkapi form di bawah lalu simpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Identity banner */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50 text-lg font-black text-indigo-600">
              {getInitials(form.company_name)}
            </div>
            <div>
              <div className="text-base font-black text-slate-900">{form.company_name || "—"}</div>
              <div className="mt-0.5 text-xs font-bold text-slate-400">{form.email || "—"}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600">
                  {form.vendor_type==="company" ? "Company" : "Individual"}
                </span>
                {vendorCode && (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500">{vendorCode}</span>
                )}
                <span className={["inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black", KYC_CLS[kycStatus]||KYC_CLS.unverified].join(" ")}>
                  KYC: {KYC_LABEL[kycStatus]||kycStatus}
                </span>
              </div>
              {kycStatus==="rejected" && kycNote && (
                <div className="mt-1.5 text-[11px] font-bold text-rose-600">Catatan: {kycNote}</div>
              )}
            </div>
          </div>
          {lastSaved && (
            <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              ✓ Tersimpan pukul {lastSaved}
            </div>
          )}
        </div>

        {/* Warning saat verified */}
        {isVerified && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <span className="text-lg shrink-0">⚠️</span>
            <div>
              <div className="text-sm font-black text-amber-800">Profil dapat diubah kapan saja</div>
              <div className="mt-0.5 text-xs font-semibold text-amber-700">
                Menyimpan perubahan akan mengubah status KYC dari <strong>Terverifikasi</strong> menjadi{" "}
                <strong>Menunggu Verifikasi</strong>. Admin akan mereview ulang sebelum status aktif kembali.
              </div>
            </div>
          </div>
        )}

        {/* A. Informasi Perusahaan — TIDAK ada disabled */}
        <Section icon="🏢" title="Informasi Perusahaan">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tipe Vendor">
              <Sel name="vendor_type" value={form.vendor_type} onChange={set("vendor_type")}>
                <option value="company">Company</option>
                <option value="individual">Individual</option>
              </Sel>
            </Field>
            <Field label="Nama Perusahaan / Usaha" required>
              <Input name="company_name" value={form.company_name} onChange={set("company_name")} placeholder="PT. Maju Bersama" />
            </Field>
            <Field label="Nama PIC (Person in Charge)">
              <Input name="pic_name" value={form.pic_name} onChange={set("pic_name")} placeholder="Budi Santoso" />
            </Field>
            <Field label="Email" required>
              <Input type="email" name="email" value={form.email} onChange={set("email")} placeholder="vendor@email.com" />
            </Field>
            <Field label="Nomor Telepon" hint="08xx-xxxx-xxxx">
              <Input name="phone" value={form.phone} onChange={handlePhone} placeholder="0812-3456-7890" inputMode="tel" />
            </Field>
            <Field label="NPWP" hint="xx.xxx.xxx.x-xxx.xxx">
              <Input name="npwp" value={form.npwp} onChange={set("npwp")} placeholder="12.345.678.9-012.345" />
            </Field>
            {form.vendor_type==="individual" && (
              <Field label="NIK (KTP)" hint="16 digit">
                <Input name="nik" value={form.nik} onChange={handleNik} placeholder="3201234567890001" inputMode="numeric" maxLength={16} />
              </Field>
            )}
            <div className={form.vendor_type==="individual" ? "" : "md:col-span-2"}>
              <Field label="Alamat Lengkap">
                <Tex name="address" value={form.address} onChange={set("address")} placeholder="Jl. Sudirman No. 1, Jakarta" rows={3} />
              </Field>
            </div>
          </div>
        </Section>

        {/* B. Rekening Bank */}
        <Section icon="🏦" title="Rekening Bank">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nama Bank" required>
              <Sel name="bank_name" value={form.bank_name} onChange={set("bank_name")}>
                <option value="">— Pilih bank —</option>
                {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              </Sel>
            </Field>
            <Field label="Nomor Rekening" required hint="Angka saja">
              <Input name="bank_account_no" value={form.bank_account_no} onChange={handleAccNo} placeholder="1234567890" inputMode="numeric" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Nama Pemilik Rekening" required hint="Sesuai buku tabungan">
                <Input name="bank_account_name" value={form.bank_account_name} onChange={set("bank_account_name")} placeholder="BUDI SANTOSO" />
              </Field>
            </div>
          </div>
        </Section>

        {/* C. Dokumen KYC */}
        <Section icon="📎" title="Dokumen KYC" subtitle="Upload 4 dokumen wajib untuk verifikasi akun">
          <KycProgress kycDocs={kycDocs} kycStatus={kycStatus} />

          {kycStatus==="pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <span className="text-lg shrink-0">⏳</span>
              <div>
                <div className="text-sm font-black text-amber-800">Sedang direview admin</div>
                <div className="mt-0.5 text-xs font-semibold text-amber-700">Proses verifikasi 1×24 jam kerja. Anda masih bisa mengganti dokumen jika diperlukan.</div>
              </div>
            </div>
          )}
          {kycStatus==="rejected" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
              <span className="text-lg shrink-0">✕</span>
              <div>
                <div className="text-sm font-black text-rose-800">Dokumen ditolak — upload ulang</div>
                {kycNote && <div className="mt-0.5 text-xs font-semibold text-rose-700">Alasan: {kycNote}</div>}
              </div>
            </div>
          )}

          {kycDocsLoading ? (
            <div className="grid gap-3">
              {KYC_DOCS_CONFIG.map((d) => <div key={d.type} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : (
            <div className="grid gap-3">
              {KYC_DOCS_CONFIG.map((cfg) => (
                <KycDocRow key={cfg.type} config={cfg}
                  uploaded={kycDocs[cfg.type]||null}
                  uploading={!!kycUploading[cfg.type]}
                  onUpload={handleKycUpload}
                  onDelete={handleKycDelete}
                />
              ))}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
            <span className="font-black text-slate-700">Format:</span> PDF, JPG, PNG • Maks. 10 MB per file.
            Setelah semua 4 dokumen terupload, status otomatis berubah ke{" "}
            <span className="font-black text-amber-700">Menunggu Verifikasi</span>.
          </div>
        </Section>

        {/* Footer — selalu tampil */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-bold text-slate-400">
            {isVerified
              ? "⚠ Menyimpan perubahan akan mereset status KYC ke Menunggu Verifikasi."
              : "Simpan profil dahulu sebelum upload dokumen KYC."}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleReset} disabled={saving}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Reset Perubahan
            </button>
            <button type="submit" disabled={saving}
              className={["h-11 rounded-xl px-6 text-sm font-black transition",
                saving ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                : isVerified ? "bg-amber-600 text-white hover:bg-amber-700"
                             : "bg-indigo-600 text-white hover:bg-indigo-700"].join(" ")}>
              {saving ? "Menyimpan..."
                : isNewProfile ? "Buat Profil"
                : isVerified   ? "Simpan & Reset KYC"
                               : "Simpan Profil"}
            </button>
          </div>
        </div>

      </form>
    </TailAdminLayout>
  );
}