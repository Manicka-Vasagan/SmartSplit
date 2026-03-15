// Profile page lets the authenticated user update their name and avatar URL.
// Shows current user info and calls the PUT /api/auth/profile endpoint on save.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const { data } = await api.put('/auth/profile', { name: form.name, avatar: form.avatar });
      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Your Profile</h1>

      {/* Avatar preview */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            form.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{form.name || user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="label">Email (read-only)</label>
            <input
              value={user?.email}
              className="input opacity-60 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="label">Avatar URL</label>
            <input
              id="profile-avatar"
              name="avatar"
              type="url"
              value={form.avatar}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com/your-photo.jpg"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Enter a URL to a profile picture, or leave empty for initials avatar
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ {success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            id="save-profile-btn"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">User ID</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 break-all">{user?._id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
