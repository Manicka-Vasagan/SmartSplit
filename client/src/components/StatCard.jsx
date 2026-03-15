// Dashboard stat card showing a key metric with an icon, label, value, and optional trend.
// Uses a gradient background and hover animation for a premium feel.

const StatCard = ({ label, value, icon, gradient, trend }) => {
  return (
    <div className={`card p-5 relative overflow-hidden hover:scale-[1.02] transition-transform duration-200 cursor-default`}>
      {/* Background gradient streak */}
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <p className={`mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient} text-white shadow-lg`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
