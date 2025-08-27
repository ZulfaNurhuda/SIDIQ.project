'use client';

interface HeaderBackdropProps {
  heightClass?: string; // tailwind height class, e.g., 'h-24'
  className?: string;
}

export function HeaderBackdrop({ heightClass = 'h-28', className = '' }: HeaderBackdropProps) {
  return (
    <div
      className={[
        'fixed top-0 left-0 right-0 z-30 pointer-events-none',
        'bg-gradient-to-b from-primary-50 to-white/0 dark:from-gray-900 dark:to-gray-900/0',
        heightClass,
        className,
      ].join(' ')}
    />
  );
}

export default HeaderBackdrop;

