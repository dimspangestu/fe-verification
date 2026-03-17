"use client";

import { useEffect, useRef, useState } from "react";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

/* ─────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────── */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const BANK_OPTIONS = [
  "BCA", "BRI", "BNI", "Mandiri", "CIMB Niaga",
  "Danamon", "Permata Bank", "BSI", "BTN", "Lainnya",
];

/**
 * Fields that map exactly to VendorUpsertIn in the backend schema.
 * Do NOT include read-only fields (id, kyc_status, pg_*, created_at, etc.)
 * those come from VendorOut but are not sent back on save.
 */
const EMPTY_FORM = {
  vendor_type: "company",
  company_name: "",
  pic_name: "",
  email: "",
  phone: "",
  npwp: "",
  nik: "",          // required by VendorUpsertIn, was missing before
  address: "",
  bank_name: "",
  bank_account_no: "",
  bank_account_name: "",
};

/* ─────────────────────────────────────────────────────────
   KYC badge config  (maps to KycStatus Literal in schema)
───────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token") || null;
}

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "--";
}

/** Strip read-only VendorOut fields → keep only VendorUpsertIn fields */
function toUpsertPayload(form) {
  return {
    vendor_type:       form.vendor_type       || "company",
    company_name:      form.company_name      || null,
    pic_name:          form.pic_name          || null,
    email:             form.email             || null,
    phone:             form.phone             || null,
    npwp:              form.npwp              || null,
    nik:               form.nik               || null,
    address:           form.address           || null,
    bank_name:         form.bank_name         || null,
    bank_account_no:   form.bank_account_no   || null,
    bank_account_name: form.bank_account_name || null,
  };
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function Toast({ message, type, visible }) {
  if (!visible) return null;
  const cls =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";
  return (
    <div
      className={[
        "fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3",
        "text-xs font-bold shadow-lg",
        cls,
      ].join(" ")}
    >
      {type === "success" ? "✓ " : "✕ "}
      {message}
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
        {hint && (
          <span className="text-[10px] font-bold text-slate-400">{hint}</span>
        )}
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

function Input({ className = "", ...props }) {
  return <input {...props} className={`${inputCls} ${className}`} />;
}

function Select({ className = "", children, ...props }) {
  return (
    <select {...props} className={`${inputCls} ${className}`}>
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5",
        "text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400",
        "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition resize-none",
        className,
      ].join(" ")}
    />
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-base">
          {icon}
        </div>
        <span className="text-sm font-black text-slate-900">{title}</span>
      </div>
      <div className="grid gap-4 p-5">{children}</div>
    </div>
  );
}

function SkeletonInput() {
  return (
    <div className="grid gap-1.5">
      <div className="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function VendorProfilePage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Read-only fields from VendorOut (not editable, not sent on save)
  const [kycStatus, setKycStatus] = useState("unverified");
  const [kycNote, setKycNote] = useState(null);
  const [vendorCode, setVendorCode] = useState(null);

  const [lastSaved, setLastSaved] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(false);

  const savedFormRef = useRef(EMPTY_FORM);
  const toastTimer = useRef(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3500
    );
  }

  /* ── field handlers ── */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhone(e) {
    setForm((prev) => ({
      ...prev,
      phone: e.target.value.replace(/[^\d+\-\s]/g, ""),
    }));
  }

  function handleNik(e) {
    setForm((prev) => ({
      ...prev,
      nik: e.target.value.replace(/\D/g, "").slice(0, 16),
    }));
  }

  function handleAccNo(e) {
    setForm((prev) => ({
      ...prev,
      bank_account_no: e.target.value.replace(/\D/g, ""),
    }));
  }

  function handleReset() {
    setForm({ ...savedFormRef.current });
  }

  /* ── validate ── */
  function validate() {
    if (!form.company_name?.trim())      return "Nama perusahaan / usaha wajib diisi.";
    if (!form.email?.trim())             return "Email wajib diisi.";
    if (!form.bank_name)                 return "Nama bank wajib dipilih.";
    if (!form.bank_account_no?.trim())   return "Nomor rekening wajib diisi.";
    if (!form.bank_account_name?.trim()) return "Nama pemilik rekening wajib diisi.";
    return null;
  }

  /* ── load from API ── */
  useEffect(() => {
    async function loadVendor() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/vendor/me`, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            key: API_KEY,              // matches verify_api_key middleware
          },
        });

        // ✅ 404 = vendor not created yet — show empty form, not an error
        if (res.status === 404) {
          setIsNewProfile(true);
          return;
        }

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          showToast(d?.detail || `Gagal memuat profil (HTTP ${res.status}).`, "error");
          return;
        }

        const data = await res.json(); // VendorOut

        // Sync read-only display fields
        setKycStatus(data.kyc_status || "unverified");
        setKycNote(data.kyc_note || null);
        setVendorCode(data.vendor_code || null);

        // Fill editable form fields only
        const merged = {
          ...EMPTY_FORM,
          vendor_type:       data.vendor_type       || "company",
          company_name:      data.company_name      || "",
          pic_name:          data.pic_name          || "",
          email:             data.email             || "",
          phone:             data.phone             || "",
          npwp:              data.npwp              || "",
          nik:               data.nik               || "",
          address:           data.address           || "",
          bank_name:         data.bank_name         || "",
          bank_account_no:   data.bank_account_no   || "",
          bank_account_name: data.bank_account_name || "",
        };

        setForm(merged);
        savedFormRef.current = merged;
        setIsNewProfile(false);
      } catch (err) {
        console.error("[VendorProfile] load error:", err);
        showToast("Gagal memuat data profil.", "error");
      } finally {
        setPageLoading(false);
      }
    }

    loadVendor();
  }, []);

  /* ── save — POST (backend upsert handles both create & update) ── */
  async function handleSubmit(e) {
    e.preventDefault();

    const err = validate();
    if (err) {
      showToast(err, "error");
      return;
    }

    setSaving(true);
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/vendor/me`, {
        method: "POST",                // ✅ backend only has @router.post("/me")
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
          key: API_KEY,                // ✅ matches verify_api_key middleware
        },
        body: JSON.stringify(toUpsertPayload(form)),
      });

      if (!res.ok) {
        let detail = `Gagal menyimpan profil (HTTP ${res.status}).`;
        try {
          const d = await res.json();
          detail = d?.detail || detail;
        } catch {}
        throw new Error(detail);
      }

      const saved = await res.json(); // VendorOut

      // Sync back read-only fields that backend may have generated
      setKycStatus(saved.kyc_status || "unverified");
      setKycNote(saved.kyc_note || null);
      setVendorCode(saved.vendor_code || null);
      setIsNewProfile(false);

      savedFormRef.current = { ...form };
      const now = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
      setLastSaved(now);
      showToast("Profil berhasil disimpan.", "success");
    } catch (err) {
      showToast(err?.message || "Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  }

  /* ─────────────────────────────────────────────
     Skeleton loading
  ───────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <TailAdminLayout title="Profil Vendor">
        <div className="grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
            <div className="grid gap-2">
              <div className="h-4 w-40 animate-pulse rounded-md bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-slate-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          {[7, 3].map((n, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 h-4 w-36 animate-pulse rounded-md bg-slate-100" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: n }).map((_, j) => <SkeletonInput key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </TailAdminLayout>
    );
  }

  /* ─────────────────────────────────────────────
     Main form
  ───────────────────────────────────────────── */
  return (
    <TailAdminLayout title="Profil Vendor">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* new profile notice */}
      {isNewProfile && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          ⚠ Profil vendor belum dibuat. Lengkapi form di bawah lalu simpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* ── Identity / status banner ── */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50 text-lg font-black text-indigo-600">
              {getInitials(form.company_name)}
            </div>
            <div>
              <div className="text-base font-black text-slate-900">
                {form.company_name || "—"}
              </div>
              <div className="mt-0.5 text-xs font-bold text-slate-400">
                {form.email || "—"}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {/* vendor type */}
                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600">
                  {form.vendor_type === "company" ? "Company" : "Individual"}
                </span>
                {/* vendor code — from VendorOut, read-only */}
                {vendorCode && (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500">
                    {vendorCode}
                  </span>
                )}
                {/* KYC status — from VendorOut, read-only */}
                <span
                  className={[
                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black",
                    KYC_CLS[kycStatus] || KYC_CLS.unverified,
                  ].join(" ")}
                >
                  KYC: {KYC_LABEL[kycStatus] || kycStatus}
                </span>
              </div>
              {/* KYC rejection note */}
              {kycStatus === "rejected" && kycNote && (
                <div className="mt-1.5 text-[11px] font-bold text-rose-600">
                  Catatan verifikator: {kycNote}
                </div>
              )}
            </div>
          </div>

          {lastSaved && (
            <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              ✓ Tersimpan pukul {lastSaved}
            </div>
          )}
        </div>

        {/* ── Section A: Informasi Perusahaan ── */}
        <Section icon="🏢" title="Informasi Perusahaan">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <Field label="Tipe Vendor">
              <Select name="vendor_type" value={form.vendor_type} onChange={handleChange}>
                <option value="company">Company</option>
                <option value="individual">Individual</option>
              </Select>
            </Field>

            <Field label="Nama Perusahaan / Usaha" required>
              <Input
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="PT. Maju Bersama"
              />
            </Field>

            <Field label="Nama PIC (Person in Charge)">
              <Input
                name="pic_name"
                value={form.pic_name}
                onChange={handleChange}
                placeholder="Budi Santoso"
              />
            </Field>

            <Field label="Email" required>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vendor@email.com"
              />
            </Field>

            <Field label="Nomor Telepon" hint="Format: 08xx-xxxx-xxxx">
              <Input
                name="phone"
                value={form.phone}
                onChange={handlePhone}
                placeholder="0812-3456-7890"
                inputMode="tel"
              />
            </Field>

            <Field label="NPWP" hint="xx.xxx.xxx.x-xxx.xxx">
              <Input
                name="npwp"
                value={form.npwp}
                onChange={handleChange}
                placeholder="12.345.678.9-012.345"
              />
            </Field>

            {/* NIK only visible for individual vendor type */}
            {form.vendor_type === "individual" && (
              <Field label="NIK (KTP)" hint="16 digit">
                <Input
                  name="nik"
                  value={form.nik}
                  onChange={handleNik}
                  placeholder="3201234567890001"
                  inputMode="numeric"
                  maxLength={16}
                />
              </Field>
            )}

            <div className={form.vendor_type === "individual" ? "" : "md:col-span-2"}>
              <Field label="Alamat Lengkap">
                <Textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10220"
                  rows={3}
                />
              </Field>
            </div>

          </div>
        </Section>

        {/* ── Section B: Rekening Bank ── */}
        <Section icon="🏦" title="Rekening Bank">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <Field label="Nama Bank" required>
              <Select name="bank_name" value={form.bank_name} onChange={handleChange}>
                <option value="">— Pilih bank —</option>
                {BANK_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </Field>

            <Field label="Nomor Rekening" required hint="Angka saja">
              <Input
                name="bank_account_no"
                value={form.bank_account_no}
                onChange={handleAccNo}
                placeholder="1234567890"
                inputMode="numeric"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Nama Pemilik Rekening" required hint="Sesuai buku tabungan">
                <Input
                  name="bank_account_name"
                  value={form.bank_account_name}
                  onChange={handleChange}
                  placeholder="BUDI SANTOSO"
                />
              </Field>
            </div>

          </div>
        </Section>

        {/* ── Footer action bar ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-bold text-slate-400">
            Pastikan semua data sudah benar sebelum menyimpan.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset Perubahan
            </button>

            <button
              type="submit"
              disabled={saving}
              className={[
                "h-11 rounded-xl px-6 text-sm font-black transition",
                saving
                  ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700",
              ].join(" ")}
            >
              {saving ? "Menyimpan..." : isNewProfile ? "Buat Profil" : "Simpan Profil"}
            </button>
          </div>
        </div>

      </form>
    </TailAdminLayout>
  );
}