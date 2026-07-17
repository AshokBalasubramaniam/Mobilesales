import clsx from 'clsx';

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl', xl: 'size-24 text-3xl' } as const;

const classes = {
  wrapper: 'relative inline-flex shrink-0',
  image: 'rounded-full object-cover',
  initials:
    'flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
  statusDot: 'absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-white dark:ring-gray-900',
  statusOnline: 'bg-green-500',
  statusOffline: 'bg-gray-400',
};

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: keyof typeof SIZES;
  online?: boolean;
  className?: string;
}

const Avatar = ({ src, name = '', size = 'md', online, className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span className={clsx(classes.wrapper, className)}>
      {src ? (
        <img src={src} alt={name} className={clsx(classes.image, SIZES[size])} />
      ) : (
        <span
          className={clsx(classes.initials, SIZES[size])}
        >
          {initials || '?'}
        </span>
      )}
      {online !== undefined && (
        <span
          className={clsx(classes.statusDot, online ? classes.statusOnline : classes.statusOffline)}
        />
      )}
    </span>
  );
};

export default Avatar;
