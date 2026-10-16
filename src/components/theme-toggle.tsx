import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className='flex size-9 items-center justify-center rounded-lg border border-border/80 bg-background/80 text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground'
      title={
        isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'
      }
      aria-label='Ganti tema'
    >
      {isDark ? (
        <Sun className='size-4 text-amber-400 transition-transform duration-200 hover:rotate-45' />
      ) : (
        <Moon className='size-4 text-slate-700 transition-transform duration-200 hover:-rotate-12 dark:text-slate-300' />
      )}
    </button>
  );
}
