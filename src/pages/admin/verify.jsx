// pages/admin/verify.jsx
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AdminTailLayout from "../../components/pd/AdminTailLayout";

// ✅ pdStore fallback
import { getPendingVerifyList } from "../../components/pd/pdStore";

function Badge({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function toRow(item) {
  // item dari verify_queue:
  // { id, type, userId, email, name, companyName, status, createdAt, updatedAt }
  const updatedAt = item?.updatedAt
    ? new Date(item.updatedAt).toLocaleString("id-ID")
    : item?.createdAt
      ? new Date(item.createdAt).toLocaleString("id-ID")
      : "-";

  return {
    id: item?.id,
    name: item?.companyName || item?.name || "-",
    email: item?.email || "-",
    status: item?.status || "pending",
    updatedAt,
    _raw: item,
  };
}

function AdminVerifyListInner() {
  const [tab, setTab] = useState("penerima"); // penerima | investor
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [penerima, setPenerima] = useState([]);
  const [investor, setInvestor] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // ✅ 1) coba API dulu
      let apiOk = false;
      try {
        const [a, b] = await Promise.all([
          fetch("/api/admin/verify/penerima")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch("/api/admin/verify/investor")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ]);

        const A = Array.isArray(a) ? a : [];
        const B = Array.isArray(b) ? b : [];

        // kalau minimal salah satu ada data, anggap API valid
        if (A.length > 0 || B.length > 0) {
          setPenerima(A);
          setInvestor(B);
          apiOk = true;
        }
      } catch (e) {
        // ignore
      }

      // ✅ 2) fallback pdStore (localStorage)
      if (!apiOk) {
        try {
          const pd = (getPendingVerifyList("penerima") || []).map(toRow);
          const inv = (getPendingVerifyList("investor") || []).map(toRow);
          setPenerima(pd);
          setInvestor(inv);
        } catch (e) {
          setPenerima([]);
          setInvestor([]);
        }
      }

      setLoading(false);
    })();
  }, []);

  const rows = tab === "penerima" ? penerima : investor;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!qq) return true;
      return (
        String(r.id || "").toLowerCase().includes(qq) ||
        String(r.name || "").toLowerCase().includes(qq) ||
        String(r.email || "").toLowerCase().includes(qq)
      );
    });
  }, [rows, q]);

  return (
    <AdminTailLayout title="List Verifikasi">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-2xl font-black text-slate-900">List Verifikasi</div>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              Data yang menunggu verifikasi admin.
            </div>
          </div>

          <div className="w-full md:w-[420px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari id / nama / email…"
              className="w-full h-11 rounded-2xl bg-white border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl bg-white border border-slate-200 p-2 inline-flex gap-2">
          <button
            onClick={() => setTab("penerima")}
            className={[
              "px-4 py-2 rounded-xl text-sm font-extrabold transition",
              tab === "penerima"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            Penerima Dana
          </button>
          <button
            onClick={() => setTab("investor")}
            className={[
              "px-4 py-2 rounded-xl text-sm font-extrabold transition",
              tab === "investor"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            Investor
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-sm font-black text-slate-800">
              {tab === "penerima"
                ? "Verifikasi Penerima Dana"
                : "Verifikasi Investor"}
            </div>
            <div className="text-xs font-bold text-slate-400">
              {loading ? "Memuat…" : `Total: ${filtered.length}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead>
                <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Update</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500 font-semibold"
                    >
                      {loading ? "Memuat data…" : "Tidak ada data verifikasi."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                        {r.id}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">
                        {r.name}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {r.email}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone="amber">
                          {r.status === "pending" ? "Menunggu Verifikasi" : r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {r.updatedAt || "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs font-extrabold hover:bg-indigo-700"
                          onClick={() => alert(`Open detail verify: ${r.id}`)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-200 text-xs text-slate-500">
            * Aksi “Review” bisa kamu arahkan ke halaman detail verifikasi (/admin/verify/[id]) atau modal.
          </div>
        </div>
      </div>
    </AdminTailLayout>
  );
}

// ✅ aman dari SSR/localStorage mismatch
export default dynamic(() => Promise.resolve(AdminVerifyListInner), { ssr: false });