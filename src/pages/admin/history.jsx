import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

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

export default function AdminHistoryPage() {
  const [data, setData] = useState({ payments: [], disbursements: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadHistory() {
      setLoading(true);
      setErr("");

      try {
        const raw = localStorage.getItem("auth_session");
        const sess = raw ? JSON.parse(raw) : null;
        const token = sess?.token || localStorage.getItem("access_token") || "";

        const res = await fetch(`${API_BASE}/admin/history`, {
          headers: {
            key: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.detail || "Gagal memuat history");

        if (!alive) return;
        setData(json || { payments: [], disbursements: [] });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Gagal memuat history");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AdminLayout title="History">
      {err ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <div className="text-lg font-black text-slate-900">Payments</div>
            <div className="text-sm font-bold text-slate-400">Investor funding / vendor repayment via Midtrans</div>
          </div>

          {loading ? (
            <div className="p-5 text-sm font-bold text-slate-500">Memuat payment history...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 text-xs font-black text-slate-500">Order ID</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Type</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Amount</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Status</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Payment Type</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.payments || []).map((p) => (
                    <tr key={p.id} className="border-b border-slate-200">
                      <td className="p-4 text-sm font-black text-slate-900">{p.order_id}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{p.payment_for}</td>
                      <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(p.gross_amount)}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{p.transaction_status || "-"}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{p.payment_type || "-"}</td>
                      <td className="p-4 text-sm font-bold text-slate-500">{fmtDate(p.settlement_time || p.created_at)}</td>
                    </tr>
                  ))}

                  {!data.payments?.length ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-sm font-bold text-slate-400">
                        Belum ada payment history.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <div className="text-lg font-black text-slate-900">Disbursements</div>
            <div className="text-sm font-bold text-slate-400">Distribusi funding dari admin escrow ke vendor</div>
          </div>

          {loading ? (
            <div className="p-5 text-sm font-bold text-slate-500">Memuat disbursement history...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 text-xs font-black text-slate-500">Project</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Vendor</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Amount</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Status</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.disbursements || []).map((d) => (
                    <tr key={d.id} className="border-b border-slate-200">
                      <td className="p-4 text-sm font-bold text-slate-700">{d.project_id}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{d.vendor_id}</td>
                      <td className="p-4 text-sm font-black text-slate-900">Rp {fmtIDR(d.amount)}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">{d.disbursement_status}</td>
                      <td className="p-4 text-sm font-bold text-slate-500">{fmtDate(d.disbursed_at || d.created_at)}</td>
                    </tr>
                  ))}

                  {!data.disbursements?.length ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-sm font-bold text-slate-400">
                        Belum ada disbursement history.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}