// JoinGroup page — handles the /join/:inviteCode route.
// On mount, calls the join API. On success redirects to the group page.
// Works for both new members and existing members who open the link again.
// If the user is not logged in, PrivateRoute redirects them to /login first,
// then they land here after login, preserving the original URL via react-router state.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('joining'); // 'joining' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const join = async () => {
      try {
        const { data } = await api.get(`/groups/join/${inviteCode}`);
        setGroupName(data.group?.name || 'the group');
        setStatus('success');
        // Redirect to the group page after a short delay
        setTimeout(() => navigate(`/groups/${data.group._id}`, { replace: true }), 1800);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Invalid or expired invite link');
        setStatus('error');
      }
    };
    join();
  }, [inviteCode, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card p-10 text-center max-w-sm w-full">
        {status === 'joining' && (
          <>
            <div className="text-5xl mb-4 animate-bounce">🔗</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Joining group...</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait a moment</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              You joined <span className="text-primary-600 dark:text-primary-400">{groupName}</span>!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Taking you to the group...</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Invite link invalid</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="btn-primary mx-auto"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
