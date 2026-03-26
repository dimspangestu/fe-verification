// src/pages/penerima-dana/form.jsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT_DOC   = ".pdf";

/* ─────────────── helpers ─────────────── */
function onlyDigits(str) { return String(str || "").replace(/[^\d]/g, ""); }
function toNumber(str)   { const d = onlyDigits(str); return d ? Number(d) : 0; }
function formatIDRInput(raw) { const n = toNumber(raw); if (!n) return ""; return new Intl.NumberFormat("id-ID").format(n); }
function fmtIDR(n) { return new Intl.NumberFormat("id-ID").format(Number(n || 0)); }

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("auth_session");
    return JSON.parse(raw)?.token || localStorage.getItem("access_token") || "";
  } catch { return localStorage.getItem("access_token") || ""; }
}

function validateFile(file) {
  if (!file) return null;
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return `File harus berformat PDF.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Ukuran file tidak boleh melebihi 10 MB. (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
  }
  return null;
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
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = fileName || "document.pdf";
  document.body.appendChild(a); a.click(); a.remove();
  window.URL.revokeObjectURL(url);
}

/* ─────────────── UI atoms ─────────────── */
function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="text-sm font-black text-slate-900">{title}</div>
        {subtitle && <div className="mt-1 text-xs font-bold text-slate-400">{subtitle}</div>}
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-extrabold text-slate-700">{label}</div>
        {hint && <div className="text-[11px] font-bold text-slate-400">{hint}</div>}
      </div>
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input {...props} className={[
      "h-11 w-full rounded-xl border border-slate-200 bg-white px-3",
      "text-sm font-semibold text-slate-900 placeholder:text-slate-400",
      "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100",
      className,
    ].join(" ")} />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select {...props} className={[
      "h-11 w-full rounded-xl border border-slate-200 bg-white px-3",
      "text-sm font-semibold text-slate-900",
      "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100",
      className,
    ].join(" ")} />
  );
}

function CheckLine({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
      <span className="text-sm font-semibold text-slate-800">{children}</span>
    </label>
  );
}

function Alert({ type = "error", children }) {
  const cls = type === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";
  return <div className={["rounded-2xl border p-4 text-sm font-bold", cls].join(" ")}>{children}</div>;
}

/* ─────────────── Upload Row (PDF only, 10MB) ─────────────── */
function UploadRow({ title, file, onChange, optional = false, fileError }) {
  function handleChange(e) {
    const f = e.target.files?.[0] || null;
    if (f) {
      const err = validateFile(f);
      if (err) { alert(err); e.target.value = ""; return; }
    }
    onChange(f);
  }

  const hasFile = !!file;
  const sizeMB  = file ? (file.size / 1024 / 1024).toFixed(1) : null;

  return (
    <div className={[
      "flex flex-col justify-between gap-4 rounded-2xl border p-4 transition md:flex-row md:items-center",
      fileError     ? "border-rose-300 bg-rose-50"
      : hasFile     ? "border-emerald-200 bg-emerald-50/30"
                    : "border-slate-200 bg-white",
    ].join(" ")}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-black text-slate-900">{title}</div>
          {optional ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-black text-slate-500">
              Opsional
            </span>
          ) : (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-700">
              Wajib
            </span>
          )}
          {hasFile && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">
              ✓ Terupload
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] font-bold text-slate-400">PDF saja · Maks 10 MB</div>
        {hasFile && (
          <div className="mt-1.5 text-xs font-bold text-slate-600 truncate">
            📄 {file.name} <span className="text-slate-400">({sizeMB} MB)</span>
          </div>
        )}
        {fileError && (
          <div className="mt-1 text-xs font-bold text-rose-600">{fileError}</div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <label className={[
          "inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border px-4 text-xs font-black transition",
          hasFile
            ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        ].join(" ")}>
          <input type="file" accept={ACCEPT_DOC} className="hidden" onChange={handleChange} />
          {hasFile ? "Ganti File" : "Upload PDF"}
        </label>
        {hasFile && (
          <button type="button" onClick={() => onChange(null)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition">
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Collection Clause Modal ─────────────── */
function CollectionClauseModal({ open, onClose, onAgreeAndSubmit, agreeChecked, setAgreeChecked, submitting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm md:items-center md:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
      role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 md:p-6">
          <div>
            <div className="text-sm font-black text-slate-900 md:text-base">
              Konfirmasi Persetujuan — Mekanisme Penagihan
            </div>
            <div className="mt-1 text-xs font-bold text-slate-500 md:text-sm">
              Silakan baca ringkasan klausul berikut sebelum submit.
            </div>
          </div>
          <button type="button" onClick={() => { if (!submitting) onClose(); }}
            className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="p-5 md:p-6">
          <div className="max-h-[52vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="text-xs font-black text-slate-900 md:text-sm">📜 KLAUSUL PERJANJIAN</div>
            <div className="mt-1 text-xs font-extrabold text-slate-700 md:text-sm">
              MEKANISME PENAGIHAN PENDANAAN (Sesuai POJK LPBBTI)
            </div>
            <div className="mt-4 grid gap-3 text-[12px] font-semibold leading-relaxed text-slate-700 md:text-sm">
              {[
                ["Pasal 1 — Prinsip Umum", [
                  "Itikad baik, transparansi, perlindungan konsumen, patuh OJK.",
                  "Penerima Dana membayar sesuai jadwal perjanjian.",
                  "Platform fasilitator penagihan untuk dan atas nama Pemberi Dana.",
                ]],
                ["Pasal 2 — Metode Pembayaran", [
                  "Kanal resmi: VA/transfer/auto-debit (jika ada).",
                  "Sah setelah dana efektif diterima rekening escrow.",
                  "Tagihan, jatuh tempo, rincian kewajiban ditampilkan transparan.",
                ]],
                ["Pasal 3 — Pengingat Pembayaran", [
                  "Pengingat sebelum/setelah jatuh tempo via email/SMS/WA/notif/telepon.",
                  "Wajar dan tanpa intimidasi.",
                ]],
                ["Pasal 4 — Keterlambatan", [
                  "Telat bila lewat jatuh tempo.",
                  "Denda/biaya penagihan (jika ada) sesuai perjanjian & transparan.",
                ]],
                ["Pasal 5 — Tahapan Penagihan", [
                  "DPD 1–7: pengingat awal (notif/email/WA/telepon).",
                  "DPD 8–30: penagihan intensif + surat peringatan.",
                  "DPD >30: pihak ketiga terdaftar, SLIK, langkah hukum, eksekusi jaminan (jika ada).",
                ]],
                ["Pasal 6 — Etika (Wajib)", [
                  "Dilarang ancaman, kekerasan, intimidasi, tekanan fisik/verbal.",
                  "Dilarang menagih pihak selain Penerima Dana.",
                  "Penagihan hanya pada waktu wajar sesuai ketentuan.",
                  "Wajib menjaga kerahasiaan data pribadi.",
                ]],
                ["Pasal 7 — Pihak Ketiga", [
                  "Platform dapat menunjuk pihak ketiga berbadan hukum & berizin.",
                  "Platform tetap bertanggung jawab mengawasi.",
                ]],
              ].map(([title, items]) => (
                <div key={title}>
                  <span className="font-black text-slate-900">{title}</span>
                  <ul className="mt-1 list-disc pl-5">
                    {items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </div>
              ))}
              <div className="text-[11px] font-bold text-slate-500">
                Catatan: ringkasan ini untuk konfirmasi UI. Versi final perjanjian tetap mengikuti dokumen legal lengkap.
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              checked={agreeChecked} onChange={(e) => setAgreeChecked(e.target.checked)} id="agree-collection" />
            <label htmlFor="agree-collection" className="text-sm font-semibold text-slate-800 cursor-pointer">
              Saya telah membaca dan menyetujui Mekanisme Penagihan di atas sebagai bagian dari pengajuan ini.
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 md:flex-row md:items-center md:justify-end md:p-6">
          <button type="button" onClick={() => { if (!submitting) onClose(); }} disabled={submitting}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={onAgreeAndSubmit} disabled={!agreeChecked || submitting}
            className={["h-11 rounded-xl px-5 text-xs font-black",
              !agreeChecked || submitting
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                : "bg-indigo-600 text-white hover:bg-indigo-700"].join(" ")}>
            {submitting ? "Mengirim..." : "Setuju & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Page ─────────────── */
export default function FormPage() {
  const router = useRouter();

  const [projectNameOrCode, setProjectNameOrCode] = useState("");
  const [recipientName,     setRecipientName]     = useState("");
  const [projectType,       setProjectType]       = useState("infrastruktur");
  const [projectTypeOther,  setProjectTypeOther]  = useState("");
  const [fundingNeededText, setFundingNeededText] = useState("");
  const [minFundingText,    setMinFundingText]    = useState("");
  const [tenorMonths,       setTenorMonths]       = useState("");
  const [fixedReturnPct,    setFixedReturnPct]    = useState("");

  const [proposalFile, setProposalFile] = useState(null);
  const [rabFile,      setRabFile]      = useState(null);
  const [otherFile,    setOtherFile]    = useState(null);
  const [fileErrors,   setFileErrors]   = useState({});

  const [st1, setSt1] = useState(false);
  const [st2, setSt2] = useState(false);
  const [st3, setSt3] = useState(false);
  const [st4, setSt4] = useState(false);
  const [st5, setSt5] = useState(false);

  const [ec1, setEc1] = useState(false);
  const [ec2, setEc2] = useState(false);
  const [ec3, setEc3] = useState(false);

  const [submissionDate, setSubmissionDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [signerName, setSignerName] = useState("");

  const [loading,          setLoading]          = useState(false);
  const [msg,              setMsg]              = useState("");
  const [err,              setErr]              = useState("");
  const [showClause,       setShowClause]       = useState(false);
  const [agreeClause,      setAgreeClause]      = useState(false);
  const [pendingSubmit,    setPendingSubmit]    = useState(false);
  const [lastProject,      setLastProject]      = useState(null);
  const [downloadingDraft, setDownloadingDraft] = useState(false);

  useEffect(() => {
    try {
      const raw  = localStorage.getItem("auth_session");
      const sess = raw ? JSON.parse(raw) : null;
      const name = sess?.user?.name || "";
      setRecipientName((v) => v || name);
      setSignerName((v) => v || name);
    } catch {}
  }, []);

  const fundingNeeded = useMemo(() => toNumber(fundingNeededText), [fundingNeededText]);
  const minFunding    = useMemo(() => toNumber(minFundingText),    [minFundingText]);
  const tenor         = useMemo(() => Number(onlyDigits(tenorMonths || "0")) || 0, [tenorMonths]);
  const fixedReturn   = useMemo(() => Number(onlyDigits(fixedReturnPct || "0")) || 0, [fixedReturnPct]);

  const returnTotal  = useMemo(() => !fundingNeeded || !fixedReturn ? 0 : Math.round((fundingNeeded * fixedReturn) / 100), [fundingNeeded, fixedReturn]);
  const paybackTotal = useMemo(() => fundingNeeded + returnTotal, [fundingNeeded, returnTotal]);
  const returnMonthly = useMemo(() => !tenor ? 0 : Math.round(returnTotal / tenor), [returnTotal, tenor]);

  function handleFileChange(key, file, setter) {
    const err = file ? validateFile(file) : null;
    setFileErrors((p) => ({ ...p, [key]: err || undefined }));
    if (!err) setter(file);
  }

  function resetForm() {
    setProjectNameOrCode(""); setFundingNeededText(""); setMinFundingText("");
    setTenorMonths(""); setFixedReturnPct("");
    setProposalFile(null); setRabFile(null); setOtherFile(null); setFileErrors({});
    setSt1(false); setSt2(false); setSt3(false); setSt4(false); setSt5(false);
    setEc1(false); setEc2(false); setEc3(false);
    setAgreeClause(false); setShowClause(false);
  }

  function validate() {
    if (!projectNameOrCode.trim()) return "Nama/Kode proyek wajib diisi.";
    if (!recipientName.trim())     return "Nama penerima dana wajib diisi.";
    if (projectType === "lainnya" && !projectTypeOther.trim()) return "Jenis proyek lainnya wajib diisi.";
    if (!fundingNeeded)   return "Nilai pendanaan wajib diisi.";
    if (!minFunding)      return "Minimum pendanaan wajib diisi.";
    if (minFunding > fundingNeeded) return "Minimum pendanaan tidak boleh lebih besar dari total pendanaan.";
    if (!tenorMonths)     return "Tenor wajib diisi.";
    if (!fixedReturnPct)  return "Fixed return wajib diisi.";
    if (!proposalFile)    return "Surat Penunjukan + SPK wajib diupload (PDF).";
    if (!rabFile)         return "RAB wajib diupload (PDF).";

    const propErr = validateFile(proposalFile);
    if (propErr) return `Surat Penunjukan: ${propErr}`;
    const rabErr  = validateFile(rabFile);
    if (rabErr)  return `RAB: ${rabErr}`;
    if (otherFile) {
      const otherErr = validateFile(otherFile);
      if (otherErr) return `Dokumen pendukung: ${otherErr}`;
    }

    if (!(st1 && st2 && st3 && st4 && st5)) return "Bagian C wajib dicentang semua.";
    if (!(ec1 && ec2 && ec3))               return "Bagian D wajib dicentang semua.";
    if (!submissionDate)                     return "Tanggal pengajuan wajib diisi.";
    if (!signerName.trim())                  return "Nama penerima dana wajib diisi.";
    return "";
  }

  async function doSubmitProcess() {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");

      const fd = new FormData();
      fd.append("projectNameOrCode", projectNameOrCode.trim());
      fd.append("recipientName",     recipientName.trim());
      fd.append("projectType",       projectType);
      if (projectType === "lainnya") fd.append("projectTypeOther", projectTypeOther.trim());
      fd.append("fundingNeeded",  String(fundingNeeded));
      fd.append("minFunding",     String(minFunding));
      fd.append("tenorMonths",    String(Number(tenorMonths)));
      fd.append("fixedReturnPct", String(Number(fixedReturnPct)));
      fd.append("st1", String(st1)); fd.append("st2", String(st2));
      fd.append("st3", String(st3)); fd.append("st4", String(st4));
      fd.append("st5", String(st5));
      fd.append("ec1", String(ec1)); fd.append("ec2", String(ec2)); fd.append("ec3", String(ec3));
      fd.append("submissionDate", submissionDate);
      fd.append("signerName",     signerName.trim());
      fd.append("collectionMechanismAccepted", "true");

      if (proposalFile) fd.append("proposalFile", proposalFile);
      if (rabFile)      fd.append("rabFile",      rabFile);
      if (otherFile)    fd.append("otherFile",    otherFile);

      const createRes = await fetch(`${API_BASE}/projects/upload`, {
        method: "POST",
        headers: { key: API_KEY, Authorization: `Bearer ${token}` },
        body: fd,
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(createData?.detail || "Gagal submit project.");

      const projectId = createData?.project_id || createData?.id;
      if (!projectId) throw new Error("Project berhasil dibuat, tetapi project_id tidak ditemukan.");

      const genRes  = await fetch(`${API_BASE}/documents/vendor-project/${projectId}/generate`, {
        method: "POST",
        headers: { key: API_KEY, Authorization: `Bearer ${token}` },
      });
      const genData = await genRes.json().catch(() => ({}));
      if (!genRes.ok) throw new Error(genData?.detail || "Project dibuat, tetapi gagal generate PDF draft.");

      setLastProject({
        projectId,
        documentId:  genData?.document_id,
        fileName:    genData?.file_name || `vendor-project-${projectId}.pdf`,
        downloadUrl: genData?.download_url,
      });

      setMsg(`Project berhasil dibuat. Return total Rp ${fmtIDR(createData?.return_total_amount || returnTotal)}, total pengembalian Rp ${fmtIDR(createData?.payback_total_amount || paybackTotal)}.`);
      setErr("");
      resetForm();
    } catch (e) {
      setErr(e?.message || "Gagal submit."); setMsg(""); setLastProject(null);
    } finally {
      setLoading(false); setPendingSubmit(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    const v = validate();
    if (v) { setErr(v); return; }
    if (!agreeClause) { setShowClause(true); return; }
    if (pendingSubmit || loading) return;
    setPendingSubmit(true);
    await doSubmitProcess();
  }

  async function agreeAndSubmit() {
    if (!agreeClause || pendingSubmit || loading) return;
    setErr(""); setMsg("");
    const v = validate();
    if (v) { setShowClause(false); setAgreeClause(false); setErr(v); return; }
    setPendingSubmit(true);
    await doSubmitProcess();
  }

  async function handleDownloadDraft() {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan.");
      if (!lastProject?.downloadUrl) throw new Error("Download URL tidak tersedia.");
      setDownloadingDraft(true);
      await downloadWithAuth({ path: lastProject.downloadUrl, token, fileName: lastProject.fileName });
    } catch (e) {
      setErr(e?.message || "Gagal download draft PDF.");
    } finally {
      setDownloadingDraft(false);
    }
  }

  return (
    <TailAdminLayout title="Form Pengajuan">
      <CollectionClauseModal
        open={showClause}
        onClose={() => { if (!loading && !pendingSubmit) setShowClause(false); }}
        onAgreeAndSubmit={agreeAndSubmit}
        agreeChecked={agreeClause}
        setAgreeChecked={setAgreeClause}
        submitting={loading || pendingSubmit}
      />

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-base font-black text-slate-900 md:text-lg">
              Formulir Pengajuan Proyek
            </div>
            <div className="mt-1 text-sm font-bold text-slate-400">
              Submit project → sistem generate PDF draft → download → tanda tangan + e-meterai → upload di halaman status.
            </div>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
            Penerima Dana
          </div>
        </div>

        {(err || msg) && (
          <div className="mt-4 grid gap-3">
            {err && <Alert type="error">{err}</Alert>}
            {msg && <Alert type="success">{msg}</Alert>}
          </div>
        )}

        {lastProject && (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="text-sm font-black text-indigo-900">✅ PDF draft perjanjian siap didownload</div>
            <div className="mt-0.5 text-xs font-bold text-indigo-600">Project ID: {lastProject.projectId}</div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <button type="button" onClick={handleDownloadDraft} disabled={downloadingDraft}
                className="h-11 rounded-xl bg-indigo-600 px-5 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {downloadingDraft ? "Mengunduh..." : "Download PDF Draft"}
              </button>
              <button type="button" onClick={() => router.push("/penerima-dana/status")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50">
                Lanjut ke Halaman Status →
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-4">

        {/* A. Informasi Umum */}
        <Section title="A. Informasi Umum Proyek">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nama Proyek / Kode Proyek" hint="Wajib">
              <Input value={projectNameOrCode} onChange={(e) => setProjectNameOrCode(e.target.value)} placeholder="Proyek XYZ" />
            </Field>
            <Field label="Penerima Dana (Nama Perusahaan / Individu)" hint="Wajib">
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="PT. Contoh Jaya" />
            </Field>
            <Field label="Jenis Proyek" hint="Pilih salah satu">
              <div className="grid gap-2">
                <Select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                  <option value="infrastruktur">Infrastruktur</option>
                  <option value="properti">Properti</option>
                  <option value="umkm">Usaha / UMKM</option>
                  <option value="lainnya">Lainnya</option>
                </Select>
                {projectType === "lainnya" && (
                  <Input value={projectTypeOther} onChange={(e) => setProjectTypeOther(e.target.value)}
                    placeholder="Isi jenis proyek lainnya..." />
                )}
              </div>
            </Field>
            <Field label="Nilai Total Pendanaan Dibutuhkan (Rp)" hint="Format otomatis">
              <Input value={fundingNeededText}
                onChange={(e) => setFundingNeededText(formatIDRInput(e.target.value))}
                placeholder="2.500.000.000" inputMode="numeric" />
            </Field>
            <Field label="Minimum Pendanaan yang Dicapai (Rp)" hint="Format otomatis">
              <Input value={minFundingText}
                onChange={(e) => setMinFundingText(formatIDRInput(e.target.value))}
                placeholder="1.000.000.000" inputMode="numeric" />
            </Field>
            <Field label="Jangka Waktu Pendanaan (bulan)" hint="Angka saja">
              <Input value={tenorMonths} onChange={(e) => setTenorMonths(onlyDigits(e.target.value))}
                placeholder="12" inputMode="numeric" />
            </Field>
            <Field label="Target Fixed Return (%)" hint="Angka saja">
              <Input value={fixedReturnPct} onChange={(e) => setFixedReturnPct(onlyDigits(e.target.value))}
                placeholder="18" inputMode="numeric" />
            </Field>

            {/* Simulasi return */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">Simulasi Return</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  ["Return Total",            `Rp ${fmtIDR(returnTotal)}`],
                  ["Total Bayar (Pokok+Return)", `Rp ${fmtIDR(paybackTotal)}`],
                  ["Return / Bulan",          `Rp ${fmtIDR(returnMonthly)}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-bold text-slate-500">{label}</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* B. Upload Dokumen — PDF only, 10MB */}
        <Section title="B. Upload Dokumen Proyek" subtitle="Hanya file PDF · Maksimal 10 MB per file">
          <div className="grid gap-3">
            <UploadRow
              title="Surat Penunjukan + SPK"
              file={proposalFile}
              onChange={(f) => handleFileChange("proposal", f, setProposalFile)}
              fileError={fileErrors.proposal}
            />
            <UploadRow
              title="RAB (Rencana Anggaran Biaya)"
              file={rabFile}
              onChange={(f) => handleFileChange("rab", f, setRabFile)}
              fileError={fileErrors.rab}
            />
            <UploadRow
              title="Dokumen Pendukung"
              file={otherFile}
              onChange={(f) => handleFileChange("other", f, setOtherFile)}
              fileError={fileErrors.other}
              optional
            />
          </div>
        </Section>

        {/* C. Pernyataan */}
        <Section title="C. Pernyataan Penerima Dana" subtitle="Wajib centang semua untuk lanjut submit.">
          <div className="grid gap-3">
            <CheckLine checked={st1} onChange={setSt1}>Informasi & dokumen yang saya berikan benar dan akurat.</CheckLine>
            <CheckLine checked={st2} onChange={setSt2}>Dana akan digunakan sesuai RAB yang telah diupload.</CheckLine>
            <CheckLine checked={st3} onChange={setSt3}>Proyek sudah dalam tahap dealing dan siap dipresentasikan.</CheckLine>
            <CheckLine checked={st4} onChange={setSt4}>Bersedia diverifikasi oleh tim Fondofund kapan saja.</CheckLine>
            <CheckLine checked={st5} onChange={setSt5}>Bertanggung jawab secara hukum atas seluruh informasi yang diberikan.</CheckLine>
          </div>
        </Section>

        {/* D. Persetujuan Elektronik — OTP dihapus */}
        <Section title="D. Persetujuan Elektronik" subtitle="Wajib centang semua + isi tanggal dan nama.">
          <div className="grid gap-3">
            <CheckLine checked={ec1} onChange={setEc1}>Saya setuju dengan ketentuan & persetujuan elektronik Fondofund.</CheckLine>
            <CheckLine checked={ec2} onChange={setEc2}>Saya memahami kekuatan hukum dari dokumen yang ditandatangani secara elektronik.</CheckLine>
            <CheckLine checked={ec3} onChange={setEc3}>Saya setuju dokumen ini digunakan untuk evaluasi & presentasi kepada investor.</CheckLine>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tanggal Pengajuan" hint="Wajib">
              <Input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} />
            </Field>
            <Field label="Nama Penerima Dana" hint="Wajib">
              <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Nama sesuai identitas" />
            </Field>
          </div>
        </Section>

        {/* Submit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <button disabled={loading} type="submit"
            className={["h-12 w-full rounded-xl text-sm font-black transition",
              loading ? "cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"].join(" ")}>
            {loading ? "⏳ Memproses..." : "SUBMIT PROJECT & GENERATE PDF DRAFT"}
          </button>
          <div className="mt-3 text-center text-xs font-bold text-slate-400">
            Setelah submit, sistem akan membuat <span className="text-slate-700">PDF draft perjanjian vendor</span> untuk didownload dan ditandatangani.
          </div>
        </div>

      </form>
    </TailAdminLayout>
  );
}