import clsx from 'clsx';

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl', xl: 'size-24 text-3xl' };

const Avatar = ({ src, name = '', size = 'md', online, className }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span className={clsx('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={clsx('rounded-full object-cover', SIZES[size])} />
      ) : (
        <span
          className={clsx(
            'flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
            SIZES[size]
          )}
        >
          {initials || '?'}
        </span>
      )}
      {online !== undefined && (
        <span
          className={clsx(
            'absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-white dark:ring-gray-900',
            online ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </span>
  );
};

export default Avatar;
