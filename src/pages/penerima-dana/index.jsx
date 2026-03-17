import TailAdminLayout from "../../components/pd/TailAdminLayout";

function StatCard({ title, value, delta, up = true }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm font-extrabold text-slate-700">{title}</div>
        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center text-slate-500">
          ◻
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-black text-slate-900">{value}</div>
        <div
          className={[
            "text-xs font-black px-2 py-1 rounded-full",
            up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
          ].join(" ")}
        >
          {up ? "↑" : "↓"} {delta}
        </div>
      </div>
    </div>
  );
}

function MonthlySalesBar() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = [120, 380, 200, 310, 180, 200, 290, 90, 210, 400, 280, 110];
  const max = Math.max(...data);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-slate-900">Monthly Sales</div>
          <div className="text-xs font-bold text-slate-400">Target you’ve set for each month</div>
        </div>
        <button className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center text-slate-500">
          ⋮
        </button>
      </div>

      <div className="mt-5 h-[180px] flex items-end gap-3">
        {data.map((v, i) => (
          <div key={months[i]} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end">
              <div
                className="w-full rounded-xl bg-indigo-500/80"
                style={{ height: `${Math.round((v / max) * 170) + 10}px` }}
              />
            </div>
            <div className="text-[11px] font-extrabold text-slate-400">{months[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeCard() {
  const percent = 75.55;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-slate-900">Monthly Target</div>
          <div className="text-xs font-bold text-slate-400">Target you’ve set for each month</div>
        </div>
        <button className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center text-slate-500">
          ⋮
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center">
        {/* semi gauge (CSS only) */}
        <div className="relative h-[150px] w-[300px]">
          <div className="absolute inset-x-0 bottom-0 h-[150px] w-[300px] rounded-t-full bg-slate-100" />
          <div
            className="absolute inset-x-0 bottom-0 h-[150px] w-[300px] rounded-t-full"
            style={{
              background:
                `conic-gradient(from 180deg, rgba(99,102,241,0.95) ${percent}%, rgba(226,232,240,1) 0)`,
              mask: "radial-gradient(circle at 50% 100%, transparent 58%, black 59%)",
              WebkitMask: "radial-gradient(circle at 50% 100%, transparent 58%, black 59%)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">{percent.toFixed(2)}%</div>
              <div className="mt-1 text-xs font-black text-emerald-600">+10%</div>
              <div className="mt-2 text-xs font-bold text-slate-400">
                You earn $3287 today, it’s higher than last month.
              </div>
              <div className="text-xs font-bold text-slate-400">Keep up your good work!</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-[11px] font-bold text-slate-400">Target</div>
          <div className="mt-1 text-sm font-black text-slate-900">$20K</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-[11px] font-bold text-slate-400">Revenue</div>
          <div className="mt-1 text-sm font-black text-slate-900">$20K</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-[11px] font-bold text-slate-400">Today</div>
          <div className="mt-1 text-sm font-black text-slate-900">$20K</div>
        </div>
      </div>
    </div>
  );
}

export default function PenerimaDanaHome() {
  return (
    <TailAdminLayout title="Dashboard">
      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard title="Customers" value="3,782" delta="11.01%" up />
        <StatCard title="Orders" value="5,359" delta="9.05%" up={false} />
        <GaugeCard />
      </div>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlySalesBar />
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-slate-900">Statistics</div>
              <div className="text-xs font-bold text-slate-400">Target you’ve set for each month</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
                Overview
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-400">
                Sales
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-400">
                Revenue
              </button>
            </div>
          </div>

          {/* Dummy line area */}
          <div className="mt-5 h-[180px] rounded-2xl bg-gradient-to-b from-indigo-100 to-white border border-slate-200 relative overflow-hidden">
            <svg viewBox="0 0 600 200" className="absolute inset-0 h-full w-full">
              <path
                d="M0 140 C 80 120, 120 160, 200 140 C 280 120, 320 80, 400 95 C 480 110, 520 70, 600 85"
                fill="none"
                stroke="rgba(99,102,241,0.9)"
                strokeWidth="4"
              />
              <path
                d="M0 140 C 80 120, 120 160, 200 140 C 280 120, 320 80, 400 95 C 480 110, 520 70, 600 85 L600 200 L0 200 Z"
                fill="rgba(99,102,241,0.12)"
              />
            </svg>
          </div>
        </div>
      </div>
    </TailAdminLayout>
  );
}