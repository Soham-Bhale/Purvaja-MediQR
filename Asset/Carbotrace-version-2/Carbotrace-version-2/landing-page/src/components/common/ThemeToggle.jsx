import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/70 dark:border-zinc-700/70 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={16} weight="bold" className="text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
        ) : (
          <Moon size={16} weight="bold" className="text-zinc-700 transition-transform duration-200 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
