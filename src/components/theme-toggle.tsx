import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      type='button'
      onClick={onToggle}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95, y: 1 }}
      className='flex size-9 items-center justify-center rounded-lg border-2 border-black bg-amber-300 text-black shadow-brutal-sm transition-colors hover:bg-amber-400 active:shadow-none dark:border-white dark:bg-zinc-900 dark:text-amber-400 dark:shadow-brutal-white-sm dark:hover:bg-zinc-800'
      title={
        isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'
      }
      aria-label='Ganti tema'
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {isDark ? (
          <Sun className='size-4 text-amber-400' />
        ) : (
          <Moon className='size-4 text-black' />
        )}
      </motion.div>
    </motion.button>
  );
}
