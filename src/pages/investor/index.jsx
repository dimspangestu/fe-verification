import { useEffect, useMemo, useState } from "react";
import InvestorLayout from "../../components/investor/InvestorLayout";

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

function onlyDigits(str) {
  return String(str || "").replace(/[^\d]/g, "");
}

function formatIDRInput(raw) {
  const digits = onlyDigits(raw);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function parseIDRInput(raw) {
  const digits = onlyDigits(raw);
  return digits ? Number(digits) : 0;
}

/* ─────────────────────────────────────────────────────────
   Auth
───────────────────────────────────────────────────────── */
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
    headers: {
      key: API_KEY,
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
}

/* ─────────────────────────────────────────────────────────
   Badge
───────────────────────────────────────────────────────── */
const BADGE_MAP = {
  funding_open:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  funding_closed:        "bg-amber-50 text-amber-700 border-amber-200",
  draft:                 "bg-slate-50 text-slate-700 border-slate-200",
  agreement_generated:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  waiting_signed_upload: "bg-orange-50 text-orange-700 border-orange-200",
  signed_uploaded:       "bg-sky-50 text-sky-700 border-sky-200",
  pending_payment:       "bg-amber-50 text-amber-700 border-amber-200",
  paid:                  "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function Badge({ status }) {
  const cls = BADGE_MAP[status] || "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={["inline-flex px-3 py-1 rounded-full border text-xs font-black", cls].join(" ")}>
      {status || "-"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Funding input
   Rules:
   - Value > 0
   - Value ≤ remaining_amount  (hard clamp, cannot exceed)
   - NO minimum-per-investor check — min_funding is a collective
     threshold for admin, not a per-investor floor
───────────────────────────────────────────────────────── */
function FundingInput({ project, value, onChange }) {
  const remaining = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);
  const isOpen    = project?.status === "funding_open" && remaining > 0;
  const numeric   = parseIDRInput(value);

  // only error: exceeds remaining (should not happen due to clamp, but guard anyway)
  const isError = isOpen && numeric > 0 && numeric > remaining;

  let hintMsg = "";
  if (!isOpen) {
    hintMsg = remaining <= 0 ? "Pendanaan penuh" : "";
  } else if (isError) {
    hintMsg = `Maks Rp ${fmtIDR(remaining)}`;
  } else if (numeric > 0) {
    hintMsg = `✓ Rp ${fmtIDR(numeric)}`;
  } else {
    hintMsg = `Maks Rp ${fmtIDR(remaining)}`;
  }

  function handleChange(e) {
    const numeric = parseIDRInput(e.target.value);
    // hard clamp — silently cap at remaining
    const safe = numeric > remaining ? remaining : numeric;
    onChange(safe > 0 ? formatIDRInput(String(safe)) : formatIDRInput(e.target.value));
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        value={value}
        onChange={handleChange}
        placeholder="Nominal funding"
        inputMode="numeric"
        disabled={!isOpen}
        className={[
          "h-10 w-[200px] rounded-xl border px-3 text-sm font-semibold outline-none transition",
          !isOpen
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            : isError
              ? "border-rose-300 bg-rose-50 text-rose-800 focus:ring-2 focus:ring-rose-100"
              : numeric > 0
                ? "border-emerald-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-100"
                : "border-slate-200 bg-white text-slate-900 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100",
        ].join(" ")}
      />
      {hintMsg && (
        <div className={[
          "text-[11px] font-bold",
          isError          ? "text-rose-500"
            : numeric > 0 ? "text-emerald-600"
            : "text-slate-400",
        ].join(" ")}>
          {hintMsg}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Agreement flow modal
───────────────────────────────────────────────────────── */
function AgreementFlowModal({
  open, onClose, project, fundingAmount,
  prepareLoading, preparingError, fundingDraft,
  onGenerateAgreement, onDownloadDraft,
  onSignedFileChange, signedFile,
  uploadLoading, onUploadSigned,
  checkoutLoading, onCheckout,
}) {
  if (!open || !project) return null;

  const canGenerate = Number(fundingAmount || 0) > 0;
  const canUpload   = Boolean(fundingDraft?.funding_id && signedFile);
  const canCheckout = Boolean(fundingDraft?.signed_document);

  function Step({ n, title, sub, children }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white text-xs font-black grid place-items-center shrink-0">
            {n}
          </span>
          <div className="text-sm font-black text-slate-900">{title}</div>
        </div>
        {sub && <div className="ml-8 text-xs font-bold text-slate-400 mb-4">{sub}</div>}
        <div className="ml-8">{children}</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        <div className="border-b border-slate-200 p-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-black text-slate-900">Funding Agreement Investor</div>
            <div className="mt-1 text-sm font-bold text-slate-500">
              Lengkapi dokumen signed sebelum lanjut ke pembayaran.
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="max-h-[75vh] overflow-auto bg-slate-50 p-5 grid gap-4">

          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-black text-slate-900 mb-4">Ringkasan Pendanaan</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Project",         value: project.project_name || project.project_code || "-" },
                { label: "Vendor",          value: project.vendor_company_name || "-" },
                { label: "Nominal Funding", value: `Rp ${fmtIDR(fundingAmount)}`, hi: true },
                { label: "Fixed Return",    value: `${project.fixed_return_pct || 0}%` },
                {
                  label: "Sisa Pendanaan",
                  value: `Rp ${fmtIDR(project.remaining_amount ?? project.funding_needed ?? 0)}`,
                },
                {
                  // show collective minimum as info only — not a per-investor floor
                  label: "Min Total Kolektif",
                  value: `Rp ${fmtIDR(project.min_funding || 0)}`,
                  note: "threshold admin, bukan min per investor",
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="text-xs font-black text-slate-400">{r.label}</div>
                  <div className={["mt-1 text-sm font-black", r.hi ? "text-indigo-700" : "text-slate-900"].join(" ")}>
                    {r.value}
                  </div>
                  {r.note && (
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{r.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {preparingError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {preparingError}
            </div>
          )}

          {/* Step 1 */}
          <Step n="1" title="Generate Draft Agreement" sub="Sistem membuat draft PDF perjanjian investor.">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={!canGenerate || prepareLoading} onClick={onGenerateAgreement}
                className={["h-11 rounded-xl px-4 text-xs font-black",
                  !canGenerate || prepareLoading
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                    : "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700",
                ].join(" ")}>
                {prepareLoading ? "Generating..." : "Generate Dokumen"}
              </button>
              {fundingDraft?.generated_document_id && <Badge status="agreement_generated" />}
            </div>

            {fundingDraft?.generated_document_id && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-400">Generated Document</div>
                <div className="mt-1 text-sm font-black text-slate-900">
                  {fundingDraft.generated_file_name || "Investor Agreement PDF"}
                </div>
                <button type="button" onClick={onDownloadDraft}
                  className="mt-3 h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50">
                  Download Draft PDF
                </button>
              </div>
            )}
          </Step>

          {/* Step 2 */}
          <Step n="2" title="Upload Signed PDF" sub="Tanda tangani + e-meterai di luar sistem, lalu upload PDF final.">
            <div className="flex flex-col gap-3 md:flex-row md:items-center flex-wrap">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100">
                <input type="file" accept=".pdf" className="hidden"
                  onChange={(e) => onSignedFileChange(e.target.files?.[0] || null)} />
                {signedFile ? "Ganti Signed PDF" : "Pilih Signed PDF"}
              </label>
              <div className="text-sm font-bold text-slate-500">
                {signedFile ? signedFile.name : "Belum ada file dipilih"}
              </div>
              <button type="button" disabled={!canUpload || uploadLoading} onClick={onUploadSigned}
                className={["h-11 rounded-xl px-4 text-xs font-black",
                  !canUpload || uploadLoading
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                    : "border border-sky-600 bg-sky-600 text-white hover:bg-sky-700",
                ].join(" ")}>
                {uploadLoading ? "Uploading..." : "Upload Signed PDF"}
              </button>
            </div>
            {fundingDraft?.signed_document && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-black text-emerald-800">✓ Signed document berhasil diupload</div>
                <div className="mt-1 text-xs font-bold text-emerald-700">
                  {fundingDraft.signed_document.file_name || "Signed PDF tersedia"}
                </div>
              </div>
            )}
          </Step>

          {/* Step 3 */}
          <Step n="3" title="Lanjut ke Pembayaran" sub="Pembayaran Midtrans hanya bisa dilakukan setelah signed document tersedia.">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={!canCheckout || checkoutLoading} onClick={onCheckout}
                className={["h-11 rounded-xl px-4 text-xs font-black",
                  !canCheckout || checkoutLoading
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                    : "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
                ].join(" ")}>
                {checkoutLoading ? "Redirecting..." : "Lanjut ke Pembayaran"}
              </button>
              {fundingDraft?.funding_status && <Badge status={fundingDraft.funding_status} />}
            </div>
          </Step>

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
export default function InvestorProjectsPage() {
  const [projects,  setProjects]  = useState([]);
  const [q,         setQ]         = useState("");
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState("");

  const [fundingAmounts, setFundingAmounts] = useState({});

  const [selectedProject, setSelectedProject] = useState(null);
  const [agreementOpen,   setAgreementOpen]   = useState(false);
  const [prepareLoading,  setPrepareLoading]  = useState(false);
  const [uploadLoading,   setUploadLoading]   = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [preparingError,  setPreparingError]  = useState("");
  const [fundingDraft,    setFundingDraft]    = useState(null);
  const [signedFile,      setSignedFile]      = useState(null);

  /* ── load ── */
  async function loadProjects() {
    setLoading(true);
    setErr("");
    try {
      const res  = await authFetch("/investor/projects");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat project investor");
      setProjects(Array.isArray(data) ? data : []);
      // no auto-fill — investor decides their own amount freely
    } catch (e) {
      setErr(e?.message || "Gagal memuat project investor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  /* ── filter ── */
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (projects || []).filter((p) => {
      if (!qq) return true;
      return (
        (p?.project_code        || "").toLowerCase().includes(qq) ||
        (p?.project_name        || "").toLowerCase().includes(qq) ||
        (p?.project_type        || "").toLowerCase().includes(qq) ||
        (p?.vendor_company_name || "").toLowerCase().includes(qq)
      );
    });
  }, [projects, q]);

  /* ── amount change — only constraint: cannot exceed remaining ── */
  function handleAmountChange(project, raw) {
    const remaining = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);
    const numeric   = parseIDRInput(raw);
    // silently clamp to remaining
    const clamped = numeric > remaining ? remaining : numeric;
    setFundingAmounts((prev) => ({
      ...prev,
      [project.id]: clamped > 0 ? formatIDRInput(String(clamped)) : formatIDRInput(raw),
    }));
  }

  /* ── open modal — only gate: amount > 0 and ≤ remaining ── */
  function openAgreementFlow(project) {
    const amount    = parseIDRInput(fundingAmounts[project.id] || "");
    const remaining = Number(project?.remaining_amount ?? project?.funding_needed ?? 0);

    if (!amount || amount <= 0) {
      alert("Masukkan nominal funding terlebih dahulu.");
      return;
    }
    if (amount > remaining) {
      alert(`Nominal tidak boleh melebihi sisa pendanaan Rp ${fmtIDR(remaining)}.`);
      return;
    }

    setSelectedProject(project);
    setFundingDraft(null);
    setSignedFile(null);
    setPreparingError("");
    setAgreementOpen(true);
  }

  function closeAgreementFlow() {
    setAgreementOpen(false);
    setSelectedProject(null);
    setFundingDraft(null);
    setSignedFile(null);
    setPreparingError("");
  }

  /* ── generate ── */
  async function handleGenerateAgreement() {
    if (!selectedProject) return;
    const amount    = parseIDRInput(fundingAmounts[selectedProject.id] || "");
    const remaining = Number(selectedProject?.remaining_amount ?? selectedProject?.funding_needed ?? 0);

    if (!amount || amount <= 0) { setPreparingError("Nominal funding wajib diisi."); return; }
    if (amount > remaining)     { setPreparingError(`Nominal tidak boleh melebihi sisa pendanaan Rp ${fmtIDR(remaining)}.`); return; }

    setPrepareLoading(true);
    setPreparingError("");
    try {
      const res  = await authFetch("/investor/fundings/prepare-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selectedProject.id, funding_amount: amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal generate agreement");
      setFundingDraft(data);
    } catch (e) {
      setPreparingError(e?.message || "Gagal generate agreement");
    } finally {
      setPrepareLoading(false);
    }
  }

  /* ── download draft ── */
  async function handleDownloadDraft() {
    if (!fundingDraft?.generated_document_id) { alert("Dokumen draft belum tersedia."); return; }
    try {
      const res = await authFetch(`/documents/generated/${fundingDraft.generated_document_id}/download`);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.detail || "Gagal download"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = fundingDraft.generated_file_name || "investor-agreement.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e?.message || "Gagal download draft PDF"); }
  }

  /* ── upload signed ── */
  async function handleUploadSigned() {
    if (!fundingDraft?.funding_id || !signedFile) { alert("Signed PDF belum dipilih."); return; }
    setUploadLoading(true);
    setPreparingError("");
    try {
      const fd = new FormData();
      fd.append("signed_file", signedFile);
      const res  = await fetch(
        `${API_BASE}/investor/fundings/${fundingDraft.funding_id}/upload-signed`,
        { method: "POST", headers: { key: API_KEY, Authorization: `Bearer ${getToken()}` }, body: fd }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal upload signed PDF");
      setFundingDraft((prev) => ({
        ...(prev || {}),
        signed_document: data?.signed_document || data,
        funding_status:  data?.funding_status  || prev?.funding_status || "signed_uploaded",
      }));
    } catch (e) {
      setPreparingError(e?.message || "Gagal upload signed PDF");
    } finally {
      setUploadLoading(false);
    }
  }

  /* ── checkout ── */
  async function handleCheckout() {
    if (!fundingDraft?.funding_id) { alert("Funding draft belum tersedia."); return; }
    setCheckoutLoading(true);
    setPreparingError("");
    try {
      const res  = await authFetch(`/investor/fundings/${fundingDraft.funding_id}/checkout`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal lanjut ke pembayaran");
      if (data?.redirect_url) { window.location.href = data.redirect_url; return; }
      if (data?.token)        { alert(`Snap token: ${data.token}`); return; }
      throw new Error("Redirect pembayaran tidak tersedia.");
    } catch (e) {
      setPreparingError(e?.message || "Gagal lanjut ke pembayaran");
    } finally {
      setCheckoutLoading(false);
    }
  }

  /* ─────────────── render ─────────────── */
  return (
    <InvestorLayout title="Projects Open Funding">
      <AgreementFlowModal
        open={agreementOpen}
        onClose={closeAgreementFlow}
        project={selectedProject}
        fundingAmount={selectedProject ? parseIDRInput(fundingAmounts[selectedProject.id] || "") : 0}
        prepareLoading={prepareLoading}
        preparingError={preparingError}
        fundingDraft={fundingDraft}
        onGenerateAgreement={handleGenerateAgreement}
        onDownloadDraft={handleDownloadDraft}
        onSignedFileChange={setSignedFile}
        signedFile={signedFile}
        uploadLoading={uploadLoading}
        onUploadSigned={handleUploadSigned}
        checkoutLoading={checkoutLoading}
        onCheckout={handleCheckout}
      />

      {/* ── Header ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-black text-slate-900">Available Projects</div>
            <div className="text-sm font-bold text-slate-400">
              Project yang sudah dibuka admin untuk pendanaan investor.
            </div>
          </div>
          <div className="w-full md:w-[360px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari project / vendor..."
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
        {err && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {err}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-5 text-sm font-bold text-slate-500">Memuat projects...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Project","Vendor","Type","Target / Sisa","Tenor","Return","Status","Nominal & Aksi"].map((h) => (
                    <th key={h} className={["p-4 text-xs font-black text-slate-500", h === "Nominal & Aksi" ? "text-right" : "text-left"].join(" ")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-sm font-bold text-slate-400">
                      Tidak ada project funding_open.
                    </td>
                  </tr>
                ) : filtered.map((p) => {
                  const remaining  = Number(p?.remaining_amount ?? p?.funding_needed ?? 0);
                  const isOpen     = p.status === "funding_open" && remaining > 0;
                  const numeric    = parseIDRInput(fundingAmounts[p.id] || "");
                  const isInvalid  = !numeric || numeric <= 0 || numeric > remaining;

                  // funding progress pct
                  const funded = Number(p.funded_amount || 0);
                  const target = Number(p.funding_needed || 0);
                  const pct    = target > 0 ? Math.min(Math.round((funded / target) * 100), 100) : 0;

                  return (
                    <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="text-sm font-black text-slate-900">{p.project_name || p.project_code}</div>
                        <div className="text-xs font-bold text-slate-400">{p.project_code}</div>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700">{p.vendor_company_name || "-"}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{p.project_type}</td>

                      {/* Target / Sisa + progress bar */}
                      <td className="p-4 min-w-[180px]">
                        <div className="text-sm font-black text-slate-900">Rp {fmtIDR(remaining)}</div>
                        <div className="text-xs font-bold text-slate-400 mb-1.5">
                          sisa · target Rp {fmtIDR(target)}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={["h-full rounded-full", pct >= 100 ? "bg-emerald-500" : "bg-indigo-400"].join(" ")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">{pct}% terfunding</div>
                      </td>

                      <td className="p-4 text-sm font-black text-slate-900">{p.tenor_months} bln</td>
                      <td className="p-4 text-sm font-black text-slate-900">{p.fixed_return_pct}%</td>
                      <td className="p-4"><Badge status={p.status} /></td>

                      {/* Input + button */}
                      <td className="p-4">
                        <div className="flex items-start justify-end gap-2">
                          <FundingInput
                            project={p}
                            value={fundingAmounts[p.id] || ""}
                            onChange={(val) => handleAmountChange(p, val)}
                          />
                          <button
                            type="button"
                            onClick={() => openAgreementFlow(p)}
                            disabled={!isOpen || isInvalid}
                            className={[
                              "h-10 rounded-xl px-4 text-xs font-black shrink-0",
                              !isOpen || isInvalid
                                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                                : "bg-emerald-600 text-white hover:bg-emerald-700",
                            ].join(" ")}
                          >
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