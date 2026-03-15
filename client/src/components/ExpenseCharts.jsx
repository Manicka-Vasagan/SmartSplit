// ExpenseCharts: renders spending analytics across all of a user's groups.
// Pie chart (donut) → spending by category with ₹ amounts.
// Bar chart         → monthly spending for the last 6 months.
// Built with Recharts; supports dark mode natively via className.

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// ── Colour palettes ─────────────────────────────────────
const CATEGORY_COLORS = {
  Food:     '#f97316',  // orange-500
  Travel:   '#3b82f6',  // blue-500
  Stay:     '#a855f7',  // purple-500
  Shopping: '#ec4899',  // pink-500
  Other:    '#64748b',  // slate-500
};
const BAR_COLOR = '#6366f1'; // indigo-500

// ── Helpers ─────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Aggregate expenses → [{name, value}] sorted by value desc */
const buildCategoryData = (expenses) => {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    map[cat] = (map[cat] || 0) + (e.amount || 0);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
};

/** Aggregate expenses → last 6 months [{month, amount}] */
const buildMonthlyData = (expenses) => {
  const now = new Date();
  const monthMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthMap[`${d.getFullYear()}-${d.getMonth()}`] = {
      month: MONTHS[d.getMonth()],
      amount: 0,
    };
  }
  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthMap[key]) {
      monthMap[key].amount = parseFloat((monthMap[key].amount + (e.amount || 0)).toFixed(2));
    }
  });
  return Object.values(monthMap);
};

// ── Custom ₹ tooltip ────────────────────────────────────
const RupeeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
      {label && <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">₹{Number(p.value).toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────
const ExpenseCharts = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card p-10 text-center col-span-2">
        <p className="text-5xl mb-3">📊</p>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No expense data yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add expenses in your groups to see analytics here
        </p>
      </div>
    );
  }

  const categoryData = buildCategoryData(expenses);
  const monthlyData  = buildMonthlyData(expenses);
  const totalSpend   = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const peakMonth    = [...monthlyData].sort((a, b) => b.amount - a.amount)[0];

  return (
    <>
      {/* ── DONUT PIE – Spending by Category ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Spending by Category</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Total: ₹{totalSpend.toFixed(2)}
            </p>
          </div>
          <span className="text-2xl">🥧</span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
              ))}
            </Pie>
            <Tooltip content={<RupeeTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Category rows with ₹ amounts */}
        <div className="mt-3 space-y-2">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.name] || CATEGORY_COLORS.Other }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                ₹{item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BAR CHART – Monthly Spending ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Monthly Spending</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 6 months</p>
          </div>
          <span className="text-2xl">📈</span>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
              width={54}
            />
            <Tooltip content={<RupeeTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Bar
              dataKey="amount"
              name="Spent"
              fill={BAR_COLOR}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>

        {peakMonth && peakMonth.amount > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            🔥 Peak:{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {peakMonth.month}
            </span>{' '}
            — ₹{peakMonth.amount.toFixed(2)}
          </p>
        )}
      </div>
    </>
  );
};

export default ExpenseCharts;
