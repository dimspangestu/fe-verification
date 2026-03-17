import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import InvestorLayout from "../../components/investor/InvestorLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "oIS76mgiPYNTv7SDa6KFrknMRfbemtZNKpkDbN9VzvNAlhq2TznxGyBO8btRtZmR";

function fmtIDR(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("id-ID");
  } catch {
    return "-";
  }
}

function Badge({ status }) {
  const map = {
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    agreement_generated: "bg-indigo-50 text-indigo-700 border-indigo-200",
    waiting_signed_upload: "bg-orange-50 text-orange-700 border-orange-200",
    signed_uploaded: "bg-sky-50 text-sky-700 border-sky-200",
    pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deny: "bg-rose-50 text-rose-700 border-rose-200",
    cancel: "bg-rose-50 text-rose-700 border-rose-200",
    expire: "bg-slate-50 text-slate-700 border-slate-200",
    failure: "bg-rose-50 text-rose-700 border-rose-200",
    uploaded: "bg-sky-50 text-sky-700 border-sky-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const cls = map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={["inline-flex px-3 py-1 rounded-full border text-xs font-black", cls].join(" ")}>
      {status || "-"}
    </span>
  );
}

export default function InvestorFundingsPage() {
  const router = useRouter();
  const [fundings, setFundings] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function authFetch(path, options = {}) {
    const raw = localStorage.getItem("auth_session");
    const sess = raw ? JSON.parse(raw) : null;
    const token = sess?.token || localStorage.getItem("access_token") || "";

    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        key: API_KEY,
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  async function loadFundings() {
    setLoading(true);
    setErr("");
    try {
      const res = await authFetch("/investor/fundings");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "Gagal memuat funding investor");
      setFundings(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat funding investor");
    } finally {
      setLoading(false);
    }
  }

  async function syncStatus(orderId) {
    if (!orderId) return;
    setSyncing(true);
    setMsg("");
    setErr("");

    try {
      const res = await authFetch(`/investor/fundings/sync-status?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal sync status pembayaran");
      setMsg(`Status pembayaran untuk ${orderId} berhasil disinkronkan.`);
      await loadFundings();
    } catch (e) {
      setErr(e?.message || "Gagal sync status pembayaran");
    } finally {
      setSyncing(false);
    }
  }

  async function checkSignedDocument(fundingId) {
    try {
      const res = await authFetch(`/investor/fundings/${fundingId}/signed-document`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Gagal cek signed document");
      return data;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    loadFundings();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const orderId = router.query.order_id;
    if (orderId) {
      syncStatus(orderId);
    }
  }, [router.isReady, router.query.order_id]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (fundings || []).filter((f) => {
      if (!qq) return true;
      return (
        (f?.id || "").toLowerCase().includes(qq) ||
        (f?.project_name || "").toLowerCase().includes(qq) ||
        (f?.project_code || "").toLowerCase().includes(qq) ||
        (f?.vendor_company_name || "").toLowerCase().includes(qq) ||
        (f?.funding_status || "").toLowerCase().includes(qq) ||
        (f?.order_id || "").toLowerCase().includes(qq)
      );
    });
  }, [fundings, q]);

  return (
    <InvestorLayout title="My Fundings">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-lg font-black text-slate-900">My Funding History</div>
            <div className="text-sm font-bold text-slate-400">
              Daftar pendanaan, signed document, dan status pembayaran investor.
            </div>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="w-full md:w-[360px]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari project / vendor / order id..."
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none"
              />
            </div>

            <button
              type="button"
              disabled={syncing}
              onClick={loadFundings}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {syncing ? "Sync..." : "Refresh"}
            </button>
          </div>
        </div>

        {msg ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {msg}
          </div>
        ) : null}

        {err ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {err}
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm font-bold text-slate-500">Memuat funding history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 text-xs font-black text-slate-500">Funding ID</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Project</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Vendor</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Order ID</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Funding Amount</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Expected Return</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Expected Total Back</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Signed Document</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Status</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500">Paid At</th>
                  <th className="text-right p-4 text-xs font-black text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-4 text-sm font-black text-slate-900">{f.id}</td>

                    <td className="p-4">
                      <div className="text-sm font-black text-slate-900">
                        {f.project_name || f.project_code || "-"}
                      </div>
                      <div className="text-xs font-bold text-slate-400">{f.project_code || "-"}</div>
                    </td>

                    <td className="p-4 text-sm font-bold text-slate-700">
                      {f.vendor_company_name || "-"}
                    </td>

                    <td className="p-4 text-sm font-bold text-slate-500">
                      {f.order_id || "-"}
                    </td>

                    <td className="p-4 text-sm font-black text-slate-900">
                      Rp {fmtIDR(f.funding_amount)}
                    </td>

                    <td className="p-4 text-sm font-black text-slate-900">
                      Rp {fmtIDR(f.expected_return_amount)}
                    </td>

                    <td className="p-4 text-sm font-black text-slate-900">
                      Rp {fmtIDR(f.expected_total_back)}
                    </td>

                    <td className="p-4">
                      {f.signed_document ? (
                        <div className="grid gap-1">
                          <div className="text-sm font-black text-slate-900">
                            {f.signed_document.file_name || "Signed PDF"}
                          </div>
                          <Badge
                            status={
                              f.signed_document.verification_status ||
                              "uploaded"
                            }
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Belum ada</span>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge status={f.funding_status} />
                    </td>

                    <td className="p-4 text-sm font-bold text-slate-500">
                      {fmtDate(f.paid_at || f.created_at)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {f.order_id ? (
                          <button
                            type="button"
                            onClick={() => syncStatus(f.order_id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                          >
                            Sync Status
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}

                {!filtered.length ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-sm font-bold text-slate-400">
                      Belum ada funding data.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}