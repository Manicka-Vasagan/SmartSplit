// Displays two sub-sections: a per-member net balance table (who owes/is owed)
// and a simplified transaction list showing the minimum payments to settle all debts.

const Avatar = ({ user }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
    {user?.avatar ? (
      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
    ) : (
      user?.name?.charAt(0).toUpperCase()
    )}
  </div>
);

const BalanceTable = ({ balances, transactions, onSettle }) => {
  if (!balances || balances.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-4xl mb-3">🎉</p>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">All settled up!</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">No outstanding balances in this group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Member Balances</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {balances.map((item) => (
            <div key={item.user?._id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar user={item.user} />
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.user?.name}</span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-bold ${
                    item.balance > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.balance < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.balance > 0 ? '+' : ''}₹{item.balance?.toFixed(2)}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {item.balance > 0 ? 'gets back' : item.balance < 0 ? 'owes' : 'settled'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Transactions */}
      {transactions && transactions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Suggested Payments
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({transactions.length} transaction{transactions.length !== 1 ? 's' : ''} to settle all)
              </span>
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar user={t.from} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {t.from?.name}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <Avatar user={t.to} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {t.to?.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-red-500 dark:text-red-400">
                    ₹{t.amount?.toFixed(2)}
                  </span>
                  {onSettle && (
                    <button
                      onClick={() => onSettle(t)}
                      id={`settle-btn-${idx}`}
                      className="text-xs btn-primary py-1 px-3"
                    >
                      Settle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceTable;
