// GroupDetail page: shows group info, member list, expenses, balances, and settlement history.
// Orchestrates AddExpenseModal and SettlementModal and refreshes balances after changes.

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ExpenseCard from '../components/ExpenseCard';
import BalanceTable from '../components/BalanceTable';
import AddExpenseModal from '../components/AddExpenseModal';
import SettlementModal from '../components/SettlementModal';
import Loader from '../components/Loader';

const TABS = ['Expenses', 'Balances', 'Settlements'];

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balanceData, setBalanceData] = useState({ balances: [], transactions: [] });
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('Expenses');
  const [loading, setLoading] = useState(true);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberError, setAddMemberError] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [settleTx, setSettleTx] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [groupRes, expenseRes, balanceRes, settlementRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/expenses/balances/${id}`),
        api.get(`/settlements/group/${id}`),
      ]);
      setGroup(groupRes.data);
      setExpenses(expenseRes.data);
      setBalanceData(balanceRes.data);
      setSettlements(settlementRes.data);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail.trim()) return;
    setAddingMember(true);
    setAddMemberError('');
    try {
      const { data } = await api.post(`/groups/${id}/add-member`, { email: addMemberEmail });
      setGroup(data);
      setAddMemberEmail('');
    } catch (err) {
      setAddMemberError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" text="Loading group..." />
      </div>
    );
  }

  if (!group) return null;

  const isCreator = group.creator?._id === user?._id || group.creator === user?._id;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-2 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
            {group.description && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 mt-2">
              {group.category}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddExpense(true)}
              id="add-expense-btn"
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
            {isCreator && (
              <button onClick={handleDeleteGroup} id="delete-group-btn" className="btn-danger">
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Members ({group.members?.length})</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {group.members?.map((m) => (
            <div key={m._id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full pl-1 pr-3 py-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {m.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
            </div>
          ))}
        </div>

        {isCreator && (
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              id="add-member-email"
              type="email"
              value={addMemberEmail}
              onChange={(e) => setAddMemberEmail(e.target.value)}
              className="input flex-1"
              placeholder="Add member by email..."
            />
            <button type="submit" id="add-member-btn" className="btn-primary" disabled={addingMember}>
              {addingMember ? '...' : 'Add'}
            </button>
          </form>
        )}
        {addMemberError && <p className="text-sm text-red-500 mt-2">{addMemberError}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
            {tab === 'Expenses' && <span className="ml-1.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full">{expenses.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Expenses' && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No expenses yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add your first expense to get started</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onDelete={handleDeleteExpense}
                currentUserId={user?._id}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'Balances' && (
        <BalanceTable
          balances={balanceData.balances}
          transactions={balanceData.transactions}
          onSettle={(tx) => setSettleTx(tx)}
        />
      )}

      {activeTab === 'Settlements' && (
        <div className="space-y-3">
          {settlements.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🤝</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No settlements yet</p>
            </div>
          ) : (
            settlements.map((s) => (
              <div key={s._id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.payer?.name}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.payee?.name}</span>
                  {s.note && <span className="text-slate-400 text-xs">• {s.note}</span>}
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                  ₹{s.amount?.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          currentUser={user}
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => { setShowAddExpense(false); fetchAll(); }}
        />
      )}

      {settleTx && (
        <SettlementModal
          transaction={settleTx}
          groupId={id}
          onClose={() => setSettleTx(null)}
          onSuccess={() => { setSettleTx(null); fetchAll(); }}
        />
      )}
    </div>
  );
};

export default GroupDetail;
