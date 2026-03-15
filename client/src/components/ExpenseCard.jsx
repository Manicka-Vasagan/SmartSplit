// Card showing a single expense: category icon, payer, amount, date, notes.
// Renders optional ✏️ Edit and Delete buttons passed via props.

const categoryColors = {
  Food:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Travel:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stay:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Other:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const categoryIcons = {
  Food: '🍔', Travel: '🚗', Stay: '🏨', Shopping: '🛍️', Other: '💸',
};

const ExpenseCard = ({ expense, onDelete, onEdit, currentUserId }) => {
  const colorClass = categoryColors[expense.category] || categoryColors.Other;
  const icon = categoryIcons[expense.category] || '💸';

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200 animate-fade-in" id={`expense-${expense._id}`}>
      <div className="flex items-start justify-between gap-3">

        {/* ── Left: icon + info ── */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`text-2xl p-2 rounded-xl ${categoryColors[expense.category]?.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20 flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{expense.title}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                {expense.category}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(expense.date)}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Paid by{' '}
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {expense.paidBy?.name || 'Unknown'}
              </span>
            </p>
            {expense.notes && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic truncate">
                "{expense.notes}"
              </p>
            )}
          </div>
        </div>

        {/* ── Right: amount + actions ── */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{expense.amount?.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
            {expense.splitType} split
          </span>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(expense)}
                id={`edit-expense-${expense._id}`}
                className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(expense._id)}
                id={`delete-expense-${expense._id}`}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExpenseCard;
