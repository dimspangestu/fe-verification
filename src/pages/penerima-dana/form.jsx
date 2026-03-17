// src/pages/penerima-dana/form.jsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

/* ----------------------------- helpers ----------------------------- */
function onlyDigits(str) {
  return String(str || "").replace(/[^\d]/g, "");
}

function toNumber(str) {
  const d = onlyDigits(str);
  return d ? Number(d) : 0;
}

function formatIDRInput(raw) {
  const n = toNumber(raw);
  if (!n) return "";
  return new Intl.NumberFormat("id-ID").format(n);
}

function fmtIDR(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function downloadWithAuth({ path, token, fileName }) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      key: API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let msg = "Gagal download file.";
    try {
      const data = await res.json();
      msg = data?.detail || msg;
    } catch {}
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

/* ----------------------------- ui parts ---------------------------- */
function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-black text-slate-900">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs font-bold text-slate-400">{subtitle}</div>
          ) : null}
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          ◻
        </div>
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
        {hint ? <div className="text-[11px] font-bold text-slate-400">{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3",
        "text-sm font-semibold text-slate-900 placeholder:text-slate-400",
        "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100",
        className,
      ].join(" ")}
    />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3",
        "text-sm font-semibold text-slate-900",
        "outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100",
        className,
      ].join(" ")}
    />
  );
}

function CheckLine({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
      />
      <span className="text-sm font-semibold text-slate-800">{children}</span>
    </label>
  );
}

function UploadRow({ title, accept, file, onChange, optional = false }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-black text-slate-900">{title}</div>

          {optional ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">
              Opsional
            </span>
          ) : (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-black text-rose-700">
              Wajib
            </span>
          )}
        </div>

        <div className="mt-1 truncate text-xs font-bold text-slate-400">Accept: {accept}</div>
        <div className="mt-2 truncate text-xs font-bold text-slate-500">
          File: <span className="text-slate-700">{file ? file.name : "-"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
          {file ? "Ganti File" : "Upload File"}
        </label>

        {file ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:bg-slate-50"
          >
            Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Alert({ type = "error", children }) {
  const cls =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return <div className={["rounded-2xl border p-4 text-sm font-bold", cls].join(" ")}>{children}</div>;
}

function CollectionClauseModal({
  open,
  onClose,
  onAgreeAndSubmit,
  agreeChecked,
  setAgreeChecked,
  submitting,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm md:items-center md:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 md:p-6">
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 md:text-base">
              Konfirmasi Persetujuan — Mekanisme Penagihan
            </div>
            <div className="mt-1 text-xs font-bold text-slate-500 md:text-sm">
              Silakan baca ringkasan klausul berikut sebelum submit.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100"
            aria-label="Tutup"
          >
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
              <div>
                <span className="font-black text-slate-900">Pasal 1 — Prinsip Umum Penagihan</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Itikad baik, transparansi, perlindungan konsumen, patuh OJK.</li>
                  <li>Penerima Dana membayar sesuai jadwal perjanjian.</li>
                  <li>Platform fasilitator penagihan untuk dan atas nama Pemberi Dana.</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 2 — Metode Pembayaran</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Kanal resmi: VA/transfer/auto-debit (jika ada).</li>
                  <li>Sah setelah dana efektif diterima rekening escrow.</li>
                  <li>Tagihan, jatuh tempo, rincian kewajiban ditampilkan transparan.</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 3 — Pengingat Pembayaran</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Pengingat sebelum/ setelah jatuh tempo via email/SMS/WA/notif/telepon.</li>
                  <li>Wajar dan tanpa intimidasi.</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 4 — Keterlambatan</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Telat bila lewat jatuh tempo.</li>
                  <li>Denda/biaya penagihan (jika ada) sesuai perjanjian & transparan.</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 5 — Tahapan Penagihan</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>DPD 1–7: pengingat awal (notif/email/WA/telepon).</li>
                  <li>DPD 8–30: penagihan intensif + surat peringatan.</li>
                  <li>DPD &gt;30: pihak ketiga terdaftar, SLIK, langkah hukum, eksekusi jaminan (jika ada).</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 6 — Ketentuan Etika (Wajib)</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Dilarang ancaman, kekerasan, intimidasi, tekanan fisik/verbal.</li>
                  <li>Dilarang menagih pihak selain Penerima Dana.</li>
                  <li>Penagihan hanya pada waktu wajar sesuai ketentuan.</li>
                  <li>Wajib menjaga kerahasiaan data pribadi.</li>
                </ul>
              </div>

              <div>
                <span className="font-black text-slate-900">Pasal 7 — Pihak Ketiga</span>
                <ul className="mt-1 list-disc pl-5">
                  <li>Platform dapat menunjuk pihak ketiga berbadan hukum & terdaftar/berizin.</li>
                  <li>Platform tetap bertanggung jawab mengawasi.</li>
                </ul>
              </div>

              <div className="text-[11px] font-bold text-slate-500 md:text-xs">
                Catatan: ringkasan ini untuk konfirmasi UI. Versi final perjanjian tetap mengikuti dokumen legal lengkap.
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              checked={agreeChecked}
              onChange={(e) => setAgreeChecked(e.target.checked)}
              id="agree-collection"
            />
            <label htmlFor="agree-collection" className="text-sm font-semibold text-slate-800">
              Saya telah membaca dan menyetujui Mekanisme Penagihan di atas sebagai bagian dari pengajuan ini.
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 md:flex-row md:items-center md:justify-end md:p-6">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50"
            disabled={submitting}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onAgreeAndSubmit}
            disabled={!agreeChecked || submitting}
            className={[
              "h-11 rounded-xl px-4 text-xs font-black",
              !agreeChecked || submitting
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                : "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700",
            ].join(" ")}
          >
            {submitting ? "Mengirim..." : "Setuju & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------- */
export default function FormPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  const [projectNameOrCode, setProjectNameOrCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [projectType, setProjectType] = useState("infrastruktur");
  const [projectTypeOther, setProjectTypeOther] = useState("");
  const [fundingNeededText, setFundingNeededText] = useState("");
  const [minFundingText, setMinFundingText] = useState("");
  const [tenorMonths, setTenorMonths] = useState("");
  const [fixedReturnPct, setFixedReturnPct] = useState("");

  const [proposalFile, setProposalFile] = useState(null);
  const [rabFile, setRabFile] = useState(null);
  const [otherFile, setOtherFile] = useState(null);

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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });
  const [signerName, setSignerName] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [showClause, setShowClause] = useState(false);
  const [agreeClause, setAgreeClause] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const [lastCreatedProject, setLastCreatedProject] = useState(null);
  const [downloadingDraft, setDownloadingDraft] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    setRecipientName((v) => v || s?.user?.name || "");
    setSignerName((v) => v || s?.user?.name || "");
  }, []);

  const fundingNeeded = useMemo(() => toNumber(fundingNeededText), [fundingNeededText]);
  const minFunding = useMemo(() => toNumber(minFundingText), [minFundingText]);
  const tenor = useMemo(() => Number(onlyDigits(tenorMonths || "0")) || 0, [tenorMonths]);
  const fixedReturn = useMemo(() => Number(onlyDigits(fixedReturnPct || "0")) || 0, [fixedReturnPct]);

  const returnTotal = useMemo(() => {
    if (!fundingNeeded || !fixedReturn) return 0;
    return Math.round((fundingNeeded * fixedReturn) / 100);
  }, [fundingNeeded, fixedReturn]);

  const paybackTotal = useMemo(() => fundingNeeded + returnTotal, [fundingNeeded, returnTotal]);

  const returnMonthly = useMemo(() => {
    if (!tenor) return 0;
    return Math.round(returnTotal / tenor);
  }, [returnTotal, tenor]);

  function resetForm() {
    setProjectNameOrCode("");
    setFundingNeededText("");
    setMinFundingText("");
    setTenorMonths("");
    setFixedReturnPct("");
    setProposalFile(null);
    setRabFile(null);
    setOtherFile(null);
    setSt1(false);
    setSt2(false);
    setSt3(false);
    setSt4(false);
    setSt5(false);
    setEc1(false);
    setEc2(false);
    setEc3(false);
    setOtp("");
    setAgreeClause(false);
    setShowClause(false);
  }

  function validate() {
    if (!projectNameOrCode.trim()) return "Nama/Kode proyek wajib diisi.";
    if (!recipientName.trim()) return "Nama penerima dana wajib diisi.";
    if (projectType === "lainnya" && !projectTypeOther.trim()) return "Jenis proyek lainnya wajib diisi.";
    if (!fundingNeeded) return "Nilai pendanaan wajib diisi.";
    if (!minFunding) return "Minimum pendanaan wajib diisi.";
    if (minFunding > fundingNeeded) return "Minimum pendanaan tidak boleh lebih besar dari total pendanaan.";
    if (!tenorMonths) return "Tenor wajib diisi.";
    if (!fixedReturnPct) return "Fixed return wajib diisi.";
    if (!proposalFile) return "Surat Penunjukan + SPK wajib diupload.";
    if (!rabFile) return "RAB wajib diupload.";
    if (!(st1 && st2 && st3 && st4 && st5)) return "Bagian C wajib dicentang semua.";
    if (!(ec1 && ec2 && ec3)) return "Bagian D wajib dicentang semua.";
    if (!submissionDate) return "Tanggal pengajuan wajib diisi.";
    if (!signerName.trim()) return "Nama penerima dana wajib diisi.";
    if (!otp.trim()) return "OTP / eSign wajib diisi.";
    return "";
  }

  async function doSubmitProcess() {
    setLoading(true);

    try {
      const token = session?.token || localStorage.getItem("access_token") || "";
      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
      }

      const fd = new FormData();
      fd.append("projectNameOrCode", projectNameOrCode.trim());
      fd.append("recipientName", recipientName.trim());
      fd.append("projectType", projectType);
      if (projectType === "lainnya") fd.append("projectTypeOther", projectTypeOther.trim());

      fd.append("fundingNeeded", String(fundingNeeded));
      fd.append("minFunding", String(minFunding));
      fd.append("tenorMonths", String(Number(tenorMonths)));
      fd.append("fixedReturnPct", String(Number(fixedReturnPct)));

      fd.append("st1", String(st1));
      fd.append("st2", String(st2));
      fd.append("st3", String(st3));
      fd.append("st4", String(st4));
      fd.append("st5", String(st5));

      fd.append("ec1", String(ec1));
      fd.append("ec2", String(ec2));
      fd.append("ec3", String(ec3));
      fd.append("submissionDate", submissionDate);
      fd.append("signerName", signerName.trim());
      fd.append("otpOrESign", otp.trim());
      fd.append("collectionMechanismAccepted", "true");

      if (proposalFile) fd.append("proposalFile", proposalFile);
      if (rabFile) fd.append("rabFile", rabFile);
      if (otherFile) fd.append("otherFile", otherFile);

      const createRes = await fetch(`${API_BASE}/projects/upload`, {
        method: "POST",
        headers: {
          key: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const createData = await createRes.json().catch(() => ({}));

      if (!createRes.ok) {
        throw new Error(createData?.detail || "Gagal submit project.");
      }

      const projectId = createData?.project_id || createData?.id;
      if (!projectId) {
        throw new Error("Project berhasil dibuat, tetapi project_id tidak ditemukan.");
      }

      const genRes = await fetch(`${API_BASE}/documents/vendor-project/${projectId}/generate`, {
        method: "POST",
        headers: {
          key: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const genData = await genRes.json().catch(() => ({}));

      if (!genRes.ok) {
        throw new Error(genData?.detail || "Project berhasil dibuat, tetapi gagal generate PDF draft.");
      }

      setLastCreatedProject({
        projectId,
        documentId: genData?.document_id,
        fileName: genData?.file_name || `vendor-project-${projectId}.pdf`,
        downloadUrl: genData?.download_url,
      });

      setMsg(
        `Project berhasil dibuat. PDF draft perjanjian vendor sudah disiapkan. Return total Rp ${fmtIDR(
          createData?.return_total_amount || returnTotal
        )} dan total pengembalian Rp ${fmtIDR(createData?.payback_total_amount || paybackTotal)}.`
      );
      setErr("");
      resetForm();
    } catch (e) {
      setErr(e?.message || "Gagal submit.");
      setMsg("");
      setLastCreatedProject(null);
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    if (!agreeClause) {
      setShowClause(true);
      return;
    }

    if (pendingSubmit || loading) return;

    setPendingSubmit(true);
    await doSubmitProcess();
  }

  async function agreeAndSubmit() {
    if (!agreeClause) return;
    if (pendingSubmit || loading) return;

    setErr("");
    setMsg("");

    const v = validate();
    if (v) {
      setShowClause(false);
      setAgreeClause(false);
      setErr(v);
      return;
    }

    setPendingSubmit(true);
    await doSubmitProcess();
  }

  async function handleDownloadDraft() {
    try {
      const token = session?.token || localStorage.getItem("access_token") || "";
      if (!token) throw new Error("Token tidak ditemukan.");
      if (!lastCreatedProject?.downloadUrl) throw new Error("Download URL tidak tersedia.");

      setDownloadingDraft(true);
      await downloadWithAuth({
        path: lastCreatedProject.downloadUrl,
        token,
        fileName: lastCreatedProject.fileName,
      });
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
        onClose={() => {
          if (loading || pendingSubmit) return;
          setShowClause(false);
        }}
        onAgreeAndSubmit={agreeAndSubmit}
        agreeChecked={agreeClause}
        setAgreeChecked={setAgreeClause}
        submitting={loading || pendingSubmit}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-base font-black text-slate-900 md:text-lg">
              Formulir Pengajuan Proyek (Vendor)
            </div>
            <div className="mt-1 text-sm font-bold text-slate-400">
              Submit project → sistem generate PDF draft → download → tanda tangan + e-meterai → upload di halaman status.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
              Penerima Dana
            </div>
          </div>
        </div>

        {(err || msg) && (
          <div className="mt-4 grid gap-3">
            {err ? <Alert type="error">{err}</Alert> : null}
            {msg ? <Alert type="success">{msg}</Alert> : null}
          </div>
        )}

        {lastCreatedProject ? (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <div className="text-sm font-black text-indigo-900">PDF draft perjanjian vendor siap</div>
            <div className="mt-1 text-xs font-bold text-indigo-700">
              Project ID: {lastCreatedProject.projectId}
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleDownloadDraft}
                disabled={downloadingDraft}
                className="h-11 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {downloadingDraft ? "Mendownload..." : "Download PDF Draft"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/penerima-dana/status")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50"
              >
                Lanjut ke Halaman Status
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-4">
        <Section title="A. Informasi Umum Proyek">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nama Proyek / Kode Proyek" hint="Wajib">
              <Input value={projectNameOrCode} onChange={(e) => setProjectNameOrCode(e.target.value)} />
            </Field>

            <Field label="Penerima Dana (Nama Perusahaan / Individu)" hint="Wajib">
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </Field>

            <Field label="Jenis Proyek" hint="Pilih salah satu">
              <div className="grid gap-2">
                <Select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                  <option value="infrastruktur">Infrastruktur</option>
                  <option value="properti">Properti</option>
                  <option value="umkm">Usaha / UMKM</option>
                  <option value="lainnya">Lainnya</option>
                </Select>

                {projectType === "lainnya" ? (
                  <Input
                    value={projectTypeOther}
                    onChange={(e) => setProjectTypeOther(e.target.value)}
                    placeholder="Isi jenis proyek lainnya..."
                  />
                ) : null}
              </div>
            </Field>

            <Field label="Nilai Total Pendanaan Dibutuhkan (Rp)" hint="Format otomatis">
              <Input
                value={fundingNeededText}
                onChange={(e) => setFundingNeededText(formatIDRInput(e.target.value))}
                placeholder="Contoh: 2.500.000.000"
                inputMode="numeric"
              />
            </Field>

            <Field label="Minimum yang dicapai dari pendanaan total (Rp)" hint="Format otomatis">
              <Input
                value={minFundingText}
                onChange={(e) => setMinFundingText(formatIDRInput(e.target.value))}
                placeholder="Contoh: 1.000.000.000"
                inputMode="numeric"
              />
            </Field>

            <Field label="Jangka Waktu Pendanaan (bulan)" hint="Angka saja">
              <Input
                value={tenorMonths}
                onChange={(e) => setTenorMonths(onlyDigits(e.target.value))}
                placeholder="12"
                inputMode="numeric"
              />
            </Field>

            <Field label="Target Fixed Return (%)" hint="Angka saja">
              <Input
                value={fixedReturnPct}
                onChange={(e) => setFixedReturnPct(onlyDigits(e.target.value))}
                placeholder="18"
                inputMode="numeric"
              />
            </Field>

            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">SIMULASI RETURN</div>

              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-bold text-slate-500">Return Total</div>
                  <div className="mt-1 text-sm font-black text-slate-900">Rp {fmtIDR(returnTotal)}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-bold text-slate-500">Total Bayar (Pokok + Return)</div>
                  <div className="mt-1 text-sm font-black text-slate-900">Rp {fmtIDR(paybackTotal)}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-bold text-slate-500">Return / Bulan</div>
                  <div className="mt-1 text-sm font-black text-slate-900">Rp {fmtIDR(returnMonthly)}</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="B. Upload Dokumen Proyek" subtitle="Gunakan file yang jelas dan sesuai format.">
          <div className="grid gap-3">
            <UploadRow
              title="Surat Penunjukan + SPK"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              file={proposalFile}
              onChange={setProposalFile}
            />
            <UploadRow
              title="RAB"
              accept=".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
              file={rabFile}
              onChange={setRabFile}
            />
            <UploadRow
              title="Dokumen pendukung"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              file={otherFile}
              onChange={setOtherFile}
              optional
            />
          </div>
        </Section>

        <Section title="C. Pernyataan Penerima Dana" subtitle="Wajib centang semua untuk lanjut submit.">
          <div className="grid gap-3">
            <CheckLine checked={st1} onChange={setSt1}>
              Informasi & dokumen benar dan akurat.
            </CheckLine>
            <CheckLine checked={st2} onChange={setSt2}>
              Dana digunakan sesuai RAB.
            </CheckLine>
            <CheckLine checked={st3} onChange={setSt3}>
              Proyek sudah dealing dan siap dipresentasikan.
            </CheckLine>
            <CheckLine checked={st4} onChange={setSt4}>
              Bersedia diverifikasi.
            </CheckLine>
            <CheckLine checked={st5} onChange={setSt5}>
              Bertanggung jawab secara hukum.
            </CheckLine>
          </div>
        </Section>

        <Section title="D. Persetujuan Elektronik" subtitle="Wajib centang semua + isi tanggal, nama, dan OTP/eSign.">
          <div className="grid gap-3">
            <CheckLine checked={ec1} onChange={setEc1}>
              Setuju ketentuan & persetujuan elektronik.
            </CheckLine>
            <CheckLine checked={ec2} onChange={setEc2}>
              Memahami kekuatan hukum.
            </CheckLine>
            <CheckLine checked={ec3} onChange={setEc3}>
              Setuju dokumen dipakai evaluasi & presentasi.
            </CheckLine>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tanggal Pengajuan">
              <Input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} />
            </Field>

            <Field label="Nama Penerima Dana">
              <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} />
            </Field>

            <Field label="OTP / eSign">
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" inputMode="numeric" />
            </Field>
          </div>
        </Section>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            disabled={loading}
            type="submit"
            className={[
              "h-12 w-full rounded-xl border border-slate-200 text-sm font-black",
              loading ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-indigo-600 text-white hover:bg-indigo-700",
            ].join(" ")}
          >
            {loading ? "Memproses..." : "SUBMIT PROJECT & GENERATE PDF DRAFT"}
          </button>

          <div className="mt-3 text-center text-xs font-bold text-slate-400">
            Setelah submit, sistem akan membuat <span className="text-slate-700">PDF draft perjanjian vendor</span> untuk didownload dan ditandatangani.
          </div>
        </div>
      </form>
    </TailAdminLayout>
  );
}