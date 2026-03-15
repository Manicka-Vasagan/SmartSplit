// Modal for creating a new group. Accepts name, description, and category.
// Posts to the API and calls onSuccess to refresh the parent's group list.

import { useState } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Trip', 'Roommates', 'Friends', 'Other'];

const AddGroupModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', description: '', category: 'Other' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Group name is required');

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/groups', form);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Group</h2>
          <button onClick={onClose} id="close-add-group-modal" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Group Name *</label>
            <input
              id="group-name-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Goa Trip 2025"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              id="group-desc-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input resize-none"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              id="group-category-select"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              id="create-group-btn"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;
