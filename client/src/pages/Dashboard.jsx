// Dashboard page: fetches all the user's groups, shows summary stats,
// and provides buttons to create new groups. Uses StatCard and GroupCard components.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GroupCard from '../components/GroupCard';
import StatCard from '../components/StatCard';
import AddGroupModal from '../components/AddGroupModal';
import Loader from '../components/Loader';

const DashboardIcon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const totalGroups = groups.length;
  const totalMembers = [...new Set(groups.flatMap((g) => g.members?.map((m) => m._id)))].length;

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your group expenses and settlements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Groups"
          value={totalGroups}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700"
          icon={<DashboardIcon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
        />
        <StatCard
          label="People Splitting"
          value={totalMembers}
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          icon={<DashboardIcon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
        />
        <StatCard
          label="Active Trips"
          value={groups.filter((g) => g.category === 'Trip').length}
          gradient="bg-gradient-to-br from-sky-500 to-sky-700"
          icon={<DashboardIcon path="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />}
        />
        <StatCard
          label="Households"
          value={groups.filter((g) => g.category === 'Roommates').length}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          icon={<DashboardIcon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
        />
      </div>

      {/* Groups Section */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Groups</h2>
        <button
          onClick={() => setShowAddGroup(true)}
          id="create-group-btn"
          className="btn-primary flex items-center gap-2"
        >
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
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            No groups yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Create a group to start splitting expenses with friends
          </p>
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

      {/* Add Group Modal */}
      {showAddGroup && (
        <AddGroupModal
          onClose={() => setShowAddGroup(false)}
          onSuccess={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
