// Dashboard: fetches all user's groups and expenses (across all groups),
// shows summary stats, Expense Analytics (charts), and group cards.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GroupCard from '../components/GroupCard';
import StatCard from '../components/StatCard';
import AddGroupModal from '../components/AddGroupModal';
import ExpenseCharts from '../components/ExpenseCharts';
import Loader from '../components/Loader';

const Icon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: groupData } = await api.get('/groups');
      setGroups(groupData);

      // Fetch all expenses across every group in parallel for analytics
      if (groupData.length > 0) {
        const results = await Promise.all(
          groupData.map((g) =>
            api.get(`/expenses/group/${g._id}`).then((r) => r.data).catch(() => [])
          )
        );
        setAllExpenses(results.flat());
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => setGroups((prev) => [newGroup, ...prev]);

  const totalSpend = allExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your group expenses and settlements</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Groups"
          value={groups.length}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700"
          icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
        />
        <StatCard
          label="People Splitting"
          value={[...new Set(groups.flatMap((g) => g.members?.map((m) => m._id)))].length}
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          icon={<Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
        />
        <StatCard
          label="Total Expenses"
          value={allExpenses.length}
          gradient="bg-gradient-to-br from-sky-500 to-sky-700"
          icon={<Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
        />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpend.toFixed(0)}`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          icon={<Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
        />
      </div>

      {/* ── Expense Analytics ── */}
      {!loading && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expense Analytics</h2>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
              All groups
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ExpenseCharts expenses={allExpenses} />
          </div>
        </div>
      )}

      {/* ── Groups ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Groups</h2>
        <button onClick={() => setShowAddGroup(true)} id="create-group-btn" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {loading ? (
        <Loader text="Loading your groups..." />
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">💸</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No groups yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create a group to start splitting expenses with friends</p>
          <button onClick={() => setShowAddGroup(true)} className="btn-primary mx-auto">
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      {showAddGroup && (
        <AddGroupModal onClose={() => setShowAddGroup(false)} onSuccess={handleGroupCreated} />
      )}
    </div>
  );
};

export default Dashboard;
