// Animated loading spinner component.
// Accepts a size prop ('sm', 'md', 'lg') and an optional text message.

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} border-primary-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loader;
