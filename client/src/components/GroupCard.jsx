// Card component for displaying a group in the dashboard.
// Shows category badge, member avatars, and a hover animation.

import { Link } from 'react-router-dom';

const categoryColors = {
  Trip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Roommates: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Friends: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Other: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const categoryIcons = {
  Trip: '✈️',
  Roommates: '🏠',
  Friends: '👫',
  Other: '📦',
};

const GroupCard = ({ group }) => {
  const colorClass = categoryColors[group.category] || categoryColors.Other;
  const icon = categoryIcons[group.category] || categoryIcons.Other;

  return (
    <Link
      to={`/groups/${group._id}`}
      id={`group-card-${group._id}`}
      className="card p-5 block hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
            {icon} {group.category}
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map((member) => (
            <div
              key={member._id}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold"
              title={member.name}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name?.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {group.members.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
              +{group.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
};

export default GroupCard;
