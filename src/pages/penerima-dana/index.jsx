import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TailAdminLayout from "../../components/pd/TailAdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY  =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("auth_session");
    return JSON.parse(raw)?.token || localStorage.getItem("access_token") || "";
  } catch { return localStorage.getItem("access_token") || ""; }
}
const authFetch = (path) => fetch(`${API_BASE}${path}`, {
  headers: { key: API_KEY, Authorization: `Bearer ${getToken()}` },
});
const fmtIDR = (n) => new Intl.NumberFormat("id-ID").format(Number(n || 0));

/* ─── status config ─── */
const STATUS_CFG = {
  ongoing:            { label: "Menunggu Review",   cls: "bg-slate-100 text-slate-600 border-slate-200",      dot: "bg-slate-400"   },
  doc_review:         { label: "Review Dokumen",    cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500"   },
  funding_open:       { label: "Open Funding",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  funding_closed:     { label: "Funding Penuh",     cls: "bg-indigo-50 text-indigo-700 border-indigo-200",    dot: "bg-indigo-500"  },
  disbursed_to_vendor:{ label: "Dana Cair",         cls: "bg-teal-50 text-teal-700 border-teal-200",          dot: "bg-teal-500"    },
  repayment_running:  { label: "Cicilan Berjalan",  cls: "bg-sky-50 text-sky-700 border-sky-200",             dot: "bg-sky-500"     },
  completed:          { label: "Selesai",           cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-600" },
  rejected:           { label: "Ditolak",           cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500"    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black", cfg.cls].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full shrink-0", cfg.dot].join(" ")} />
      {cfg.label}
    </span>
  );
}

/* ─── stat card ─── */
function StatCard({ icon, label, value, sub, color = "slate", loading }) {
  const colors = {
    slate:   "border-slate-200 bg-white",
    emerald: "border-emerald-200 bg-emerald-50",
    indigo:  "border-indigo-200 bg-indigo-50",
    amber:   "border-amber-200 bg-amber-50",
    rose:    "border-rose-200 bg-rose-50",
    teal:    "border-teal-200 bg-teal-50",
  };
  const textColors = {
    slate: "text-slate-900", emerald: "text-emerald-800",
    indigo: "text-indigo-800", amber: "text-amber-800",
    rose: "text-rose-800", teal: "text-teal-800",
  };
  return (
    <div className={["rounded-2xl border p-5 shadow-sm transition", colors[color]].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl">{icon}</div>
        {sub && (
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{sub}</div>
        )}
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <div className={["text-3xl font-black", textColors[color]].join(" ")}>{value}</div>
        )}
        <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

/* ─── project row ─── */
function ProjectRow({ p, onDetail }) {
  const pct = p.funding_needed > 0
    ? Math.min(Math.round((p.funded_amount / p.funding_needed) * 100), 100)
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-black text-slate-900 truncate">{p.project_name || p.project_code}</div>
            <StatusBadge status={p.status} />
          </div>
          <div className="mt-0.5 text-[11px] font-bold text-slate-400">{p.project_code}</div>
        </div>
        <button onClick={() => onDetail(p)}
          className="shrink-0 inline-flex h-8 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-black text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition">
          Detail →
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400">Target Dana</div>
          <div className="mt-0.5 text-sm font-black text-slate-900">Rp {fmtIDR(p.funding_needed)}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400">Terfunding</div>
          <div className="mt-0.5 text-sm font-black text-emerald-700">Rp {fmtIDR(p.funded_amount)}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400">Investor</div>
          <div className="mt-0.5 text-sm font-black text-indigo-700">{p.investor_count || 0} orang</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400">Fixed Return</div>
          <div className="mt-0.5 text-sm font-black text-slate-900">{p.fixed_return_pct}% / {p.tenor_months} bln</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[11px] font-semibold text-slate-400">Progress Pendanaan</div>
          <div className={["text-[11px] font-black", pct >= 100 ? "text-emerald-600" : "text-indigo-600"].join(" ")}>
            {pct}%
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={["h-2 rounded-full transition-all duration-500",
            pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"].join(" ")}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ─── project detail drawer ─── */
function ProjectDetailDrawer({ project, onClose }) {
  if (!project) return null;
  const pct = project.funding_needed > 0
    ? Math.min(Math.round((project.funded_amount / project.funding_needed) * 100), 100)
    : 0;
  const remaining = Math.max((project.funding_needed || 0) - (project.funded_amount || 0), 0);

  return (
    <>
      <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[999] w-full max-w-[560px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-lg font-black text-slate-900">{project.project_name || project.project_code}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="text-xs font-bold text-slate-400">{project.project_code}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-600 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Funding progress */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-black uppercase text-slate-400">Progress Pendanaan</div>
              <div className={["text-base font-black", pct >= 100 ? "text-emerald-600" : "text-indigo-600"].join(" ")}>{pct}%</div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={["h-3 rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"].join(" ")}
                style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                ["Target",    `Rp ${fmtIDR(project.funding_needed)}`],
                ["Terfunding", `Rp ${fmtIDR(project.funded_amount)}`, "text-emerald-700"],
                ["Sisa",      `Rp ${fmtIDR(remaining)}`],
              ].map(([label, value, extra]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400">{label}</div>
                  <div className={["mt-0.5 text-sm font-black", extra || "text-slate-900"].join(" ")}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Return info */}
          <div>
            <div className="text-xs font-black uppercase text-slate-400 mb-3">Informasi Return</div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white">
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Fixed Return",     `${project.fixed_return_pct}%`],
                  ["Tenor",            `${project.tenor_months} bln`],
                  ["Return/Bulan",     `Rp ${fmtIDR(project.return_monthly_amount)}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] font-black uppercase text-indigo-200">{label}</div>
                    <div className="mt-0.5 text-base font-black">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Total Return",       `Rp ${fmtIDR(project.return_total_amount)}`],
                  ["Total Pengembalian", `Rp ${fmtIDR(project.payback_total_amount)}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white/10 px-3 py-2">
                    <div className="text-[10px] font-black text-indigo-200">{label}</div>
                    <div className="mt-0.5 text-sm font-black">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Investor count */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white text-xl font-black">
              {project.investor_count || 0}
            </div>
            <div>
              <div className="text-sm font-black text-emerald-900">Investor aktif mendanai</div>
              <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                Total dana masuk: Rp {fmtIDR(project.funded_amount)}
              </div>
            </div>
          </div>

          {/* Dates */}
          {project.submitted_at && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-black uppercase text-slate-400 mb-2">Informasi Waktu</div>
              <div className="text-sm font-bold text-slate-700">
                Disubmit: {new Date(project.submitted_at).toLocaleString("id-ID")}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main Dashboard ─── */
export default function PenerimaDanaHome() {
  const router = useRouter();

  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [kycStatus,   setKycStatus]   = useState(null);
  const [detailProj,  setDetailProj]  = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load projects
        const res  = await authFetch("/projects/my");
        const data = await res.json().catch(() => []);
        if (res.ok && Array.isArray(data)) {
          // Enrich with funding data
          const enriched = await Promise.all(data.map(async (p) => {
            try {
              const dr  = await authFetch(`/projects/${p.id}`);
              const det = await dr.json().catch(() => ({}));
              return {
                ...p,
                funded_amount:  det.funded_amount  || 0,
                investor_count: det.investor_count || 0,
              };
            } catch { return { ...p, funded_amount: 0, investor_count: 0 }; }
          }));
          setProjects(enriched);
        }

        // Load KYC status
        const vres  = await authFetch("/vendor/me");
        const vdata = await vres.json().catch(() => ({}));
        if (vres.ok) setKycStatus(vdata.kyc_status || "unverified");

      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  // Compute summary stats
  const totalProjects  = projects.length;
  const totalInvestors = projects.reduce((sum, p) => sum + (p.investor_count || 0), 0);
  const totalFunded    = projects.reduce((sum, p) => sum + Number(p.funded_amount || 0), 0);
  const totalTarget    = projects.reduce((sum, p) => sum + Number(p.funding_needed || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "funding_open").length;
  const completedProjects = projects.filter((p) => ["completed", "repayment_running", "disbursed_to_vendor"].includes(p.status)).length;

  const statusGroups = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const isVerified = kycStatus === "verified";

  return (
    <TailAdminLayout title="Dashboard">

      {detailProj && (
        <ProjectDetailDrawer project={detailProj} onClose={() => setDetailProj(null)} />
      )}

      {/* KYC banner */}
      {kycStatus && kycStatus !== "verified" && (
        <div className={[
          "mb-4 flex items-center justify-between gap-4 rounded-2xl border p-4",
          kycStatus === "pending"  ? "border-amber-200 bg-amber-50"
          : kycStatus === "rejected" ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-slate-50",
        ].join(" ")}>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {kycStatus === "pending" ? "⏳" : kycStatus === "rejected" ? "❌" : "⚠️"}
            </span>
            <div>
              <div className={["text-sm font-black",
                kycStatus === "pending" ? "text-amber-800"
                : kycStatus === "rejected" ? "text-rose-800" : "text-slate-800"].join(" ")}>
                {kycStatus === "pending"  ? "KYC sedang direview admin"
                : kycStatus === "rejected" ? "KYC ditolak — upload ulang dokumen"
                : "KYC belum diverifikasi"}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                {kycStatus === "pending" ? "Proses verifikasi 1×24 jam kerja. Anda belum bisa submit project." : "Lengkapi profil dan upload dokumen KYC untuk bisa submit project."}
              </div>
            </div>
          </div>
          <button onClick={() => router.push("/penerima-dana/profile")}
            className="shrink-0 h-9 rounded-xl border border-current bg-white/60 px-3 text-xs font-black hover:bg-white/90 transition">
            Ke Profile →
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="📋" label="Total Project Diajukan"   value={totalProjects}   loading={loading} />
        <StatCard icon="🟢" label="Project Open Funding"    value={activeProjects}  loading={loading} color="emerald" />
        <StatCard icon="👥" label="Total Investor Aktif"    value={totalInvestors}  loading={loading} color="indigo" />
        <StatCard icon="✅" label="Project Selesai/Berjalan" value={completedProjects} loading={loading} color="teal" />
      </div>

      {/* ── Funding summary ── */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-slate-400 mb-1">Total Dana Terkumpul</div>
          {loading ? (
            <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <>
              <div className="text-3xl font-black text-emerald-700">Rp {fmtIDR(totalFunded)}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">
                dari target total Rp {fmtIDR(totalTarget)}
              </div>
              {totalTarget > 0 && (
                <div className="mt-3">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${Math.min(Math.round((totalFunded / totalTarget) * 100), 100)}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">
                    {Math.min(Math.round((totalFunded / totalTarget) * 100), 100)}% dari semua project
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Status Project</div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : Object.entries(statusGroups).length === 0 ? (
            <div className="text-sm font-bold text-slate-400">Belum ada project diajukan.</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(statusGroups).map(([status, count]) => {
                const cfg = STATUS_CFG[status] || { label: status, cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
                return (
                  <div key={status} className={["flex items-center justify-between rounded-xl border px-3 py-2", cfg.cls].join(" ")}>
                    <div className="flex items-center gap-2 text-xs font-black">
                      <span className={["h-2 w-2 rounded-full shrink-0", cfg.dot].join(" ")} />
                      {cfg.label}
                    </div>
                    <span className="text-sm font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Project list ── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-black text-slate-900">Project Saya</div>
          {isVerified && (
            <button onClick={() => router.push("/penerima-dana/form")}
              className="inline-flex h-9 items-center rounded-xl bg-indigo-600 px-4 text-xs font-black text-white hover:bg-indigo-700 transition">
              + Ajukan Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm font-black text-slate-700">Belum ada project diajukan</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">
              {isVerified ? "Klik \"+ Ajukan Project\" untuk mulai." : "Selesaikan verifikasi KYC terlebih dahulu."}
            </div>
            {isVerified && (
              <button onClick={() => router.push("/penerima-dana/form")}
                className="mt-5 inline-flex h-11 items-center rounded-xl bg-indigo-600 px-5 text-xs font-black text-white hover:bg-indigo-700 transition">
                Ajukan Project Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectRow key={p.id} p={p} onDetail={setDetailProj} />
            ))}
          </div>
        )}
      </div>

      {/* ── Tips & suggestions ── */}
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="text-sm font-black text-indigo-900 mb-3">💡 Yang Perlu Dilengkapi</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {[
            { icon: "🪪", title: "Verifikasi KYC", desc: "Upload dokumen KYC agar project bisa diajukan.", href: "/penerima-dana/profile", done: isVerified },
            { icon: "📋", title: "Ajukan Project",  desc: "Submit project dengan dokumen lengkap (PDF).",   href: "/penerima-dana/form",    done: totalProjects > 0 },
            { icon: "✍️", title: "Upload Perjanjian Signed", desc: "Download draft PDF, tanda tangani, lalu upload di halaman Status.", href: "/penerima-dana/status", done: false },
            { icon: "📊", title: "Pantau Pendanaan", desc: "Cek progress funding dan jumlah investor di setiap project.", href: "/penerima-dana/status", done: false },
          ].map((item) => (
            <button key={item.title} onClick={() => router.push(item.href)}
              className={[
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition hover:shadow-md",
                item.done ? "border-emerald-200 bg-emerald-50" : "border-indigo-200 bg-white hover:border-indigo-300",
              ].join(" ")}>
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-black text-slate-900">{item.title}</div>
                  {item.done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">✓ Selesai</span>}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-slate-500">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </TailAdminLayout>
  );
}