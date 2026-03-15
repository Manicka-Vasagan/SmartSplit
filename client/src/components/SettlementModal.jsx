// Modal for confirming and recording a settlement (debt repayment) between two users.
// Pre-fills the payee and amount from the suggested transaction data.

import { useState } from 'react';
import api from '../utils/api';

const SettlementModal = ({ transaction, groupId, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSettle = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/settlements', {
        groupId,
        payee: transaction.to._id,
        amount: transaction.amount,
        note,
      });
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Settlement</h2>
          <button onClick={onClose} id="close-settlement-modal" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-1">
                {transaction.from?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{transaction.from?.name}</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{transaction.amount?.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">pays</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-1">
                {transaction.to?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{transaction.to?.name}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Note (optional)</label>
          <input
            id="settlement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
            placeholder="e.g. Paid via UPI"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSettle}
            id="confirm-settle-btn"
            className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? 'Recording...' : '✓ Confirm Settlement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
