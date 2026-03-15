// Modal for adding OR editing an expense.
// When `expense` prop is provided, it pre-fills all fields and uses PUT.
// When no `expense` prop is provided, creates a new expense with POST.

import { useState } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Travel', 'Stay', 'Shopping', 'Other'];

const toDateStr = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
};

const AddExpenseModal = ({ group, onClose, onSuccess, currentUser, expense: editExpense }) => {
  const isEditing = !!editExpense;

  const [form, setForm] = useState({
    title:     editExpense?.title || '',
    amount:    editExpense?.amount?.toString() || '',
    paidBy:    editExpense?.paidBy?._id || editExpense?.paidBy || currentUser?._id || '',
    splitType: editExpense?.splitType || 'equal',
    category:  editExpense?.category || 'Other',
    notes:     editExpense?.notes || '',
    date:      toDateStr(editExpense?.date),
  });

  const [customSplits, setCustomSplits] = useState(() => {
    if (isEditing && editExpense.splitType === 'custom' && editExpense.splits?.length) {
      return editExpense.splits.map((s) => ({
        user:   s.user?._id || s.user,
        amount: s.amount?.toString() || '',
      }));
    }
    return group?.members?.map((m) => ({ user: m._id, amount: '' })) || [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCustomSplitChange = (userId, value) =>
    setCustomSplits((prev) => prev.map((s) => (s.user === userId ? { ...s, amount: value } : s)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.paidBy)
      return setError('Title, amount, and payer are required');

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return setError('Amount must be a positive number');

    const payload = {
      groupId:   group._id,
      title:     form.title,
      amount,
      paidBy:    form.paidBy,
      splitType: form.splitType,
      category:  form.category,
      notes:     form.notes,
      date:      form.date,
    };

    if (form.splitType === 'custom') {
      const splits = customSplits.map((s) => ({ user: s.user, amount: parseFloat(s.amount) || 0 }));
      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(total - amount) > 0.01)
        return setError(`Custom splits must total ₹${amount}. Current: ₹${total.toFixed(2)}`);
      payload.splits = splits;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = isEditing
        ? await api.put(`/expenses/${editExpense._id}`, payload)
        : await api.post('/expenses', payload);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} expense`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} id="close-add-expense-modal" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input id="expense-title" name="title" value={form.title} onChange={handleChange} className="input" placeholder="e.g. Dinner at Taj" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹) *</label>
              <input id="expense-amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} className="input" placeholder="0.00" required />
            </div>
            <div>
              <label className="label">Date</label>
              <input id="expense-date" name="date" type="date" value={form.date} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Paid By *</label>
            <select id="expense-paid-by" name="paidBy" value={form.paidBy} onChange={handleChange} className="input">
              {group?.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select id="expense-category" name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Split Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['equal', 'custom'].map((type) => (
                <button key={type} type="button" id={`split-type-${type}`}
                  onClick={() => setForm({ ...form, splitType: type })}
                  className={`py-2 rounded-lg text-sm font-medium capitalize border transition-all ${
                    form.splitType === type
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>

          {form.splitType === 'custom' && (
            <div className="space-y-2">
              <label className="label">Custom Amounts</label>
              {group?.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-24 truncate">{m.name}</span>
                  <input type="number" min="0" step="0.01" className="input flex-1" placeholder="0.00"
                    value={customSplits.find((s) => s.user === m._id)?.amount || ''}
                    onChange={(e) => handleCustomSplitChange(m._id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="label">Notes (optional)</label>
            <input id="expense-notes" name="notes" value={form.notes} onChange={handleChange} className="input" placeholder="Any remarks..." />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" id="save-expense-btn" className="btn-primary flex-1" disabled={loading}>
              {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
