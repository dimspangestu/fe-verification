"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import InvestorLayout from "../../components/investor/InvestorLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const BANK_OPTIONS = [
  "BCA", "BRI", "BNI", "Mandiri", "CIMB Niaga",
  "Danamon", "Permata Bank", "BSI", "BTN", "Lainnya",
];

const KYC_DOCS_CONFIG = {
  individual: [
    { type: "ktp",           label: "KTP (Kartu Tanda Penduduk)", hint: "Foto KTP yang jelas dan tidak buram",              icon: "🪪", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "npwp",          label: "NPWP Pribadi",               hint: "Kartu NPWP atau dokumen dari DJP",                 icon: "📋", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "selfie_ktp",    label: "Selfie Pegang KTP",          hint: "Foto selfie sambil memegang KTP menghadap kamera", icon: "🤳", accept: ".jpg,.jpeg,.png"       },
    { type: "buku_tabungan", label: "Buku Tabungan",              hint: "Halaman depan buku tabungan (nama & no rekening)", icon: "🏦", accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  company: [
    { type: "akta_perusahaan", label: "Akta Perusahaan",          hint: "Akta pendirian dari notaris",                     icon: "📜", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "npwp",            label: "NPWP Perusahaan",          hint: "NPWP badan usaha",                                icon: "📋", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "siup_nib",        label: "SIUP / NIB",               hint: "SIUP, NIB, atau izin usaha yang berlaku",         icon: "✅", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "buku_tabungan",   label: "Buku Tabungan Perusahaan", hint: "Halaman depan rekening perusahaan",              icon: "🏦", accept: ".pdf,.jpg,.jpeg,.png" },
    { type: "ktp_direksi",     label: "KTP Direksi / Pengurus",   hint: "KTP direktur utama atau pengurus perusahaan",     icon: "🪪", accept: ".pdf,.jpg,.jpeg,.png" },
  ],
};

const KYC_LABEL = {
  unverified: "Belum Diverifikasi",
  pending:    "Menunggu Verifikasi",
  verified:   "Terverifikasi",
  rejected:   "Ditolak",
};

const KYC_CLS = {
  unverified: "border-slate-200 bg-slate-50 text-slate-600",
  pending:    "border-amber-200 bg-amber-50 text-amber-700",
  verified:   "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:   "border-rose-200 bg-rose-50 text-rose-700",
};

const EMPTY_FORM = {
  investor_type: "individual",
  full_name: "", email: "", phone: "", address: "",
  nik: "", birth_date: "", birth_place: "", gender: "", occupation: "", npwp: "",
  company_name: "", pic_name: "", pic_position: "", npwp_company: "", nib: "",
  bank_name: "", bank_account_no: "", bank_account_name: "",
};

/* ─────────────── helpers ─────────────── */
function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("auth_session");
    const sess = raw ? JSON.parse(raw) : null;
    return sess?.token || localStorage.getItem("access_token") || "";
  } catch { return ""; }
}
function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "").slice(0, 2).toUpperCase() || "IN";
}
function fmtBytes(b) {
  const n = Number(b || 0);
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────── UI atoms ─────────────── */
function Toast({ message, type, visible }) {
  if (!visible) return null;
  return (
    <div className={[
      "fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg max-w-xs",
      type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-rose-200 bg-rose-50 text-rose-800",
    ].join(" ")}>
      {type === "success" ? "✓ " : "✕ "}{message}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-slate-700">
          {label}
          {required && (
            <span className="ml-1.5 rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-black text-rose-600">
              Wajib
            </span>
          )}
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
  "outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition",
  "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
].join(" ");

function Inp({ className = "", ...props }) {
  return <input {...props} className={`${inputCls} ${className}`} />;
}
function Sel({ className = "", children, ...props }) {
  return <select {...props} className={`${inputCls} ${className}`}>{children}</select>;
}
function Tex({ className = "", ...props }) {
  return (
    <textarea {...props} className={[
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 resize-none",
      "text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400",
      "outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition",
      "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
      className,
    ].join(" ")} />
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-base">{icon}</div>
        <div>
          <div className="text-sm font-black text-slate-900">{title}</div>
          {subtitle && <div className="text-xs font-bold text-slate-400">{subtitle}</div>}
        </div>
      </div>
      <div className="grid gap-4 p-5">{children}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid gap-1.5">
      <div className="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

/* ─────────────── KYC Progress ─────────────── */
function KycProgress({ kycDocs, investorType, kycStatus }) {
  const configs = KYC_DOCS_CONFIG[investorType] || [];
  const total = configs.length;
  const done  = configs.filter((d) => kycDocs[d.type]).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  if (kycStatus === "verified") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <div className="text-sm font-black text-emerald-800">KYC Terverifikasi</div>
          <div className="text-xs font-semibold text-emerald-700">Semua dokumen diverifikasi. Anda bisa mengakses semua fitur investor.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black text-slate-700">Progress Upload Dokumen KYC</div>
          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {done} dari {total} dokumen terupload
            {kycStatus === "pending"  && " — Sedang direview admin"}
            {kycStatus === "rejected" && " — Ditolak, upload ulang"}
          </div>
        </div>
        <div className="text-lg font-black text-slate-700">{pct}%</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={["h-2 rounded-full transition-all duration-500",
            kycStatus === "pending" ? "bg-amber-500" : "bg-emerald-500",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {done === total && kycStatus === "unverified" && (
        <div className="mt-2 text-[11px] font-bold text-emerald-700">
          ✓ Semua dokumen terupload — status otomatis berubah ke "Menunggu Verifikasi"
        </div>
      )}
    </div>
  );
}

/* ─────────────── KYC Doc Row ─────────────── */
function KycDocRow({ config, uploaded, uploading, disabled, onUpload, onDelete }) {
  const { type, label, hint, accept, icon } = config;
  const has = !!uploaded;

  return (
    <div className={["rounded-2xl border p-4 transition",
      has ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white",
    ].join(" ")}>
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
          {!disabled && (
            <label className={[
              "inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border px-4 text-xs font-black transition",
              uploading
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : has
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            ].join(" ")}>
              <input type="file" accept={accept} className="hidden"
                disabled={uploading || disabled}
                onChange={(e) => onUpload(type, e.target.files?.[0] || null)} />
              {uploading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  Mengupload...
                </span>
              ) : has ? "Ganti File" : "Upload"}
            </label>
          )}
          {has && !disabled && (
            <button type="button" disabled={uploading} onClick={() => onDelete(uploaded.id, type)}
              className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-rose-500 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 transition">
              Hapus
            </button>
          )}
          {disabled && has && (
            <span className="inline-flex h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700">
              🔒 Terkunci
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function InvestorProfilePage() {
  const router = useRouter();

  const [pageLoading,    setPageLoading]    = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [kycStatus,      setKycStatus]      = useState("unverified");
  const [kycNote,        setKycNote]        = useState(null);
  const [investorCode,   setInvestorCode]   = useState(null);
  const [isNewProfile,   setIsNewProfile]   = useState(false);
  const [lastSaved,      setLastSaved]      = useState(null);
  const [kycDocs,        setKycDocs]        = useState({});
  const [kycUploading,   setKycUploading]   = useState({});
  const [kycDocsLoading, setKycDocsLoading] = useState(true);

  const savedFormRef = useRef(EMPTY_FORM);
  const toastTimer   = useRef(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const isVerified  = kycStatus === "verified";
  const kycRequired = router.query.kyc_required === "1";
  const isCompany   = form.investor_type === "company";
  const currentDocs = KYC_DOCS_CONFIG[form.investor_type] || [];
  const displayName = isCompany ? form.company_name : form.full_name;

  function showToast(message, type = "success") {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 4000);
  }

  const set = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

  function handlePhone(e)  { setForm((p) => ({ ...p, phone:           e.target.value.replace(/[^\d+\-\s]/g, "") })); }
  function handleNik(e)    { setForm((p) => ({ ...p, nik:             e.target.value.replace(/\D/g, "").slice(0, 16) })); }
  function handleAccNo(e)  { setForm((p) => ({ ...p, bank_account_no: e.target.value.replace(/\D/g, "") })); }
  function handleReset()   { setForm({ ...savedFormRef.current }); }

  function handleTypeSwitch(newType) {
    if (newType === form.investor_type) return;
    if ((kycStatus === "pending" || kycStatus === "verified") &&
      !confirm("Mengubah tipe investor akan mereset status KYC dan dokumen yang dibutuhkan berubah. Lanjutkan?")
    ) return;
    setForm((p) => ({ ...p, investor_type: newType }));
  }

  function validate() {
    if (!isCompany && !form.full_name?.trim())      return "Nama lengkap wajib diisi.";
    if (isCompany  && !form.company_name?.trim())   return "Nama perusahaan wajib diisi.";
    if (isCompany  && !form.pic_name?.trim())        return "Nama PIC / direktur wajib diisi.";
    if (!form.email?.trim())                         return "Email wajib diisi.";
    if (!form.bank_name)                             return "Nama bank wajib dipilih.";
    if (!form.bank_account_no?.trim())               return "Nomor rekening wajib diisi.";
    if (!form.bank_account_name?.trim())             return "Nama pemilik rekening wajib diisi.";
    return null;
  }

  /* load */
  useEffect(() => {
    async function load() {
      const token = getToken();
      try {
        const res = await fetch(`${API_BASE}/investor/profile`, {
          headers: { Authorization: `Bearer ${token}`, key: API_KEY },
        });
        if (res.status === 404) {
          setIsNewProfile(true);
        } else if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          showToast(d?.detail || "Gagal memuat profil.", "error");
        } else {
          const data = await res.json();
          setKycStatus(data.kyc_status || "unverified");
          setKycNote(data.kyc_note || null);
          setInvestorCode(data.investor_code || null);
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
        const docsRes = await fetch(`${API_BASE}/investor/profile/kyc-documents`, {
          headers: { Authorization: `Bearer ${token}`, key: API_KEY },
        });
        if (docsRes.ok) {
          const list = await docsRes.json();
          const map = {};
          (Array.isArray(list) ? list : []).forEach((d) => { map[d.doc_type] = d; });
          setKycDocs(map);
        }
      } catch {} finally { setKycDocsLoading(false); }
    }
    load();
  }, []);

  /* save */
  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/investor/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, key: API_KEY },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let d = `Gagal menyimpan (HTTP ${res.status}).`;
        try { d = (await res.json())?.detail || d; } catch {}
        throw new Error(d);
      }
      const saved = await res.json();
      setKycStatus(saved.kyc_status || "unverified");
      setKycNote(saved.kyc_note || null);
      setInvestorCode(saved.investor_code || null);
      setIsNewProfile(false);
      savedFormRef.current = { ...form };
      setLastSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      showToast("Profil berhasil disimpan.", "success");
    } catch (err) { showToast(err?.message || "Gagal menyimpan.", "error"); }
    finally { setSaving(false); }
  }

  /* kyc upload */
  async function handleKycUpload(docType, file) {
    if (!file) return;
    setKycUploading((p) => ({ ...p, [docType]: true }));
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("doc_type", docType);
      fd.append("file", file);
      const res  = await fetch(`${API_BASE}/investor/profile/kyc-documents`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, key: API_KEY }, body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal upload.");
      const cfg = currentDocs.find((d) => d.type === docType);
      setKycDocs((p) => ({ ...p, [docType]: { id: data.id, doc_type: docType, file_name: file.name, file_size: data.file_size || file.size } }));
      if (data.kyc_status) setKycStatus(data.kyc_status);
      showToast(`${cfg?.label || docType} berhasil diupload.`, "success");
    } catch (e) { showToast(e?.message || "Gagal upload.", "error"); }
    finally { setKycUploading((p) => ({ ...p, [docType]: false })); }
  }

  /* kyc delete */
  async function handleKycDelete(docId, docType) {
    if (!confirm("Hapus dokumen ini?")) return;
    setKycUploading((p) => ({ ...p, [docType]: true }));
    try {
      const token = getToken();
      const res  = await fetch(`${API_BASE}/investor/profile/kyc-documents/${docId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}`, key: API_KEY },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal hapus.");
      setKycDocs((p) => { const n = { ...p }; delete n[docType]; return n; });
      if (data.kyc_status) setKycStatus(data.kyc_status);
      showToast("Dokumen berhasil dihapus.", "success");
    } catch (e) { showToast(e?.message || "Gagal hapus.", "error"); }
    finally { setKycUploading((p) => ({ ...p, [docType]: false })); }
  }

  /* skeleton */
  if (pageLoading) {
    return (
      <InvestorLayout title="Profil Investor">
        <div className="grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
            <div className="grid gap-2">
              <div className="h-4 w-40 animate-pulse rounded-md bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
          {[2, 6, 3, 4].map((n, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 h-4 w-36 animate-pulse rounded-md bg-slate-100" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: n }).map((_, j) => <SkeletonRow key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </InvestorLayout>
    );
  }

  /* ─────────────── render ─────────────── */
  return (
    <InvestorLayout title="Profil Investor">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {kycRequired && !isVerified && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
          ⚠ Lengkapi profil dan verifikasi KYC terlebih dahulu sebelum bisa mengakses fitur lainnya.
        </div>
      )}
      {isNewProfile && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          ⚠ Profil investor belum dibuat. Pilih tipe, lengkapi form, lalu simpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Identity banner */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-lg font-black text-emerald-600">
              {getInitials(displayName)}
            </div>
            <div>
              <div className="text-base font-black text-slate-900">{displayName || "—"}</div>
              <div className="mt-0.5 text-xs font-bold text-slate-400">{form.email || "—"}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                  {isCompany ? "Badan Usaha" : "Pribadi"}
                </span>
                {investorCode && (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500">
                    {investorCode}
                  </span>
                )}
                <span className={["inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black", KYC_CLS[kycStatus] || KYC_CLS.unverified].join(" ")}>
                  KYC: {KYC_LABEL[kycStatus] || kycStatus}
                </span>
              </div>
              {kycStatus === "rejected" && kycNote && (
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

        {/* ── Tipe Investor — card pilihan ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-base">👤</div>
            <div>
              <div className="text-sm font-black text-slate-900">Tipe Investor</div>
              <div className="text-xs font-bold text-slate-400">
                Pilih sesuai status — dokumen KYC yang dibutuhkan berbeda
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            {[
              {
                value: "individual",
                emoji: "🙋",
                label: "Pribadi",
                desc:  "Perorangan. Dokumen KYC: KTP, NPWP, Selfie KTP, Buku Tabungan.",
              },
              {
                value: "company",
                emoji: "🏢",
                label: "Badan Usaha",
                desc:  "PT / CV / Koperasi. Dokumen KYC: Akta, NPWP, SIUP/NIB, Buku Tabungan, KTP Direksi.",
              },
            ].map((opt) => {
              const active = form.investor_type === opt.value;
              return (
                <button key={opt.value} type="button"
                  disabled={isVerified}
                  onClick={() => handleTypeSwitch(opt.value)}
                  className={[
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30",
                    isVerified ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                  ].join(" ")}>
                  <span className="text-2xl shrink-0 mt-0.5">{opt.emoji}</span>
                  <div>
                    <div className={["text-sm font-black", active ? "text-emerald-800" : "text-slate-800"].join(" ")}>
                      {opt.label}
                      {active && (
                        <span className="ml-2 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                          Dipilih
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Form Pribadi ── */}
        {!isCompany && (
          <Section icon="📋" title="Data Pribadi">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nama Lengkap" required>
                <Inp name="full_name" value={form.full_name} onChange={set("full_name")}
                  placeholder="Budi Santoso" disabled={isVerified} />
              </Field>
              <Field label="Email" required>
                <Inp type="email" name="email" value={form.email} onChange={set("email")}
                  placeholder="email@contoh.com" disabled={isVerified} />
              </Field>
              <Field label="Nomor Telepon" hint="08xx-xxxx-xxxx">
                <Inp name="phone" value={form.phone} onChange={handlePhone}
                  placeholder="0812-3456-7890" inputMode="tel" disabled={isVerified} />
              </Field>
              <Field label="NIK (KTP)" hint="16 digit">
                <Inp name="nik" value={form.nik} onChange={handleNik}
                  placeholder="3201234567890001" inputMode="numeric" maxLength={16} disabled={isVerified} />
              </Field>
              <Field label="Tempat Lahir">
                <Inp name="birth_place" value={form.birth_place} onChange={set("birth_place")}
                  placeholder="Jakarta" disabled={isVerified} />
              </Field>
              <Field label="Tanggal Lahir">
                <Inp type="date" name="birth_date" value={form.birth_date} onChange={set("birth_date")} disabled={isVerified} />
              </Field>
              <Field label="Jenis Kelamin">
                <Sel name="gender" value={form.gender} onChange={set("gender")} disabled={isVerified}>
                  <option value="">— Pilih —</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </Sel>
              </Field>
              <Field label="Pekerjaan">
                <Inp name="occupation" value={form.occupation} onChange={set("occupation")}
                  placeholder="Karyawan Swasta" disabled={isVerified} />
              </Field>
              <Field label="NPWP Pribadi" hint="xx.xxx.xxx.x-xxx.xxx">
                <Inp name="npwp" value={form.npwp} onChange={set("npwp")}
                  placeholder="12.345.678.9-012.345" disabled={isVerified} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Alamat Lengkap">
                  <Tex name="address" value={form.address} onChange={set("address")}
                    placeholder="Jl. Sudirman No. 1, Jakarta" rows={3} disabled={isVerified} />
                </Field>
              </div>
            </div>
          </Section>
        )}

        {/* ── Form Badan Usaha — style vendor ── */}
        {isCompany && (
          <Section icon="🏢" title="Informasi Perusahaan">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nama Perusahaan / Usaha" required>
                <Inp name="company_name" value={form.company_name} onChange={set("company_name")}
                  placeholder="PT. Maju Bersama" disabled={isVerified} />
              </Field>
              <Field label="Nama PIC (Person in Charge)" required>
                <Inp name="pic_name" value={form.pic_name} onChange={set("pic_name")}
                  placeholder="Budi Santoso" disabled={isVerified} />
              </Field>
              <Field label="Jabatan PIC">
                <Inp name="pic_position" value={form.pic_position} onChange={set("pic_position")}
                  placeholder="Direktur Utama" disabled={isVerified} />
              </Field>
              <Field label="Email Perusahaan" required>
                <Inp type="email" name="email" value={form.email} onChange={set("email")}
                  placeholder="info@perusahaan.com" disabled={isVerified} />
              </Field>
              <Field label="Nomor Telepon" hint="Format: 08xx / 021">
                <Inp name="phone" value={form.phone} onChange={handlePhone}
                  placeholder="021-1234-5678" inputMode="tel" disabled={isVerified} />
              </Field>
              <Field label="NPWP Perusahaan" hint="xx.xxx.xxx.x-xxx.xxx">
                <Inp name="npwp_company" value={form.npwp_company} onChange={set("npwp_company")}
                  placeholder="12.345.678.9-012.345" disabled={isVerified} />
              </Field>
              <Field label="NIB (Nomor Induk Berusaha)">
                <Inp name="nib" value={form.nib} onChange={set("nib")}
                  placeholder="1234567890123" disabled={isVerified} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Alamat Perusahaan">
                  <Tex name="address" value={form.address} onChange={set("address")}
                    placeholder="Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10220"
                    rows={3} disabled={isVerified} />
                </Field>
              </div>
            </div>
          </Section>
        )}

        {/* ── Rekening Bank ── */}
        <Section icon="🏦" title="Rekening Bank" subtitle="Untuk pencairan return investasi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nama Bank" required>
              <Sel name="bank_name" value={form.bank_name} onChange={set("bank_name")} disabled={isVerified}>
                <option value="">— Pilih bank —</option>
                {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              </Sel>
            </Field>
            <Field label="Nomor Rekening" required hint="Angka saja">
              <Inp name="bank_account_no" value={form.bank_account_no} onChange={handleAccNo}
                placeholder="1234567890" inputMode="numeric" disabled={isVerified} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Nama Pemilik Rekening" required hint="Sesuai buku tabungan">
                <Inp name="bank_account_name" value={form.bank_account_name} onChange={set("bank_account_name")}
                  placeholder="BUDI SANTOSO" disabled={isVerified} />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Dokumen KYC ── */}
        <Section icon="📎" title="Dokumen KYC"
          subtitle={`Dokumen wajib untuk investor ${isCompany ? "badan usaha" : "pribadi"}`}>

          <KycProgress kycDocs={kycDocs} investorType={form.investor_type} kycStatus={kycStatus} />

          {kycStatus === "pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">⏳</span>
                <div>
                  <div className="text-sm font-black text-amber-800">Sedang direview admin</div>
                  <div className="mt-0.5 text-xs font-semibold text-amber-700">
                    Dokumen Anda sedang diverifikasi. Proses biasanya 1×24 jam kerja.
                    Anda masih bisa mengganti dokumen jika diperlukan.
                  </div>
                </div>
              </div>
            </div>
          )}

          {kycStatus === "rejected" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">✕</span>
                <div>
                  <div className="text-sm font-black text-rose-800">Dokumen ditolak — upload ulang</div>
                  {kycNote && <div className="mt-0.5 text-xs font-semibold text-rose-700">Alasan: {kycNote}</div>}
                </div>
              </div>
            </div>
          )}

          {kycDocsLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {currentDocs.map((cfg) => (
                <KycDocRow key={cfg.type} config={cfg}
                  uploaded={kycDocs[cfg.type] || null}
                  uploading={!!kycUploading[cfg.type]}
                  disabled={isVerified}
                  onUpload={handleKycUpload}
                  onDelete={handleKycDelete}
                />
              ))}
            </div>
          )}

          {!isVerified && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              <span className="font-black text-slate-700">Format:</span> PDF, JPG, PNG • Maks. 10 MB per file.
              Setelah semua dokumen terupload, status otomatis berubah ke{" "}
              <span className="font-black text-amber-700">Menunggu Verifikasi</span>.
            </div>
          )}
        </Section>

        {/* Footer */}
        {!isVerified ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-bold text-slate-400">
              Pastikan semua data sudah benar sebelum menyimpan.
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleReset} disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Reset Perubahan
              </button>
              <button type="submit" disabled={saving}
                className={["h-11 rounded-xl px-6 text-sm font-black transition",
                  saving
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
                ].join(" ")}>
                {saving ? "Menyimpan..." : isNewProfile ? "Buat Profil" : "Simpan Profil"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            🔒 Profil dan dokumen terkunci karena KYC sudah terverifikasi. Hubungi admin jika ada perubahan data.
          </div>
        )}

      </form>
    </InvestorLayout>
  );
}