import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Scale, X } from 'lucide-react';

import { Province } from '../interfaces/province';

interface CompareFloatingBarProps {
  comparedProvinces: Province[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

const BADGE_COLORS = [
  'bg-blue-600 text-white',
  'bg-amber-400 text-black',
  'bg-emerald-500 text-black',
];

export default function CompareFloatingBar({
  comparedProvinces,
  onRemove,
  onClear,
  onOpenModal,
}: CompareFloatingBarProps) {
  if (comparedProvinces.length === 0) return null;

  const canCompare = comparedProvinces.length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className='pointer-events-none fixed inset-x-0 bottom-9 z-40 mx-auto flex w-full max-w-2xl justify-center px-2 sm:bottom-10 sm:px-4'
      >
        <div className='pointer-events-auto flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-black bg-background p-2 shadow-brutal-lg dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white-lg sm:gap-3 sm:p-3'>
          {/* Left: Mode Title & Selection Chips */}
          <div className='flex flex-1 flex-wrap items-center gap-1.5 sm:gap-2'>
            <div className='flex items-center gap-1 rounded-lg border-2 border-black bg-amber-300 px-2 py-0.5 font-mono text-xs font-black text-black shadow-brutal-sm dark:border-white sm:gap-1.5 sm:py-1'>
              <Scale className='size-3 stroke-[2.5] sm:size-3.5' />
              <span className='xs:inline hidden'>KOMPARASI</span>
              <span className='rounded border border-black bg-black px-1 text-[10px] text-white dark:border-white'>
                {comparedProvinces.length}/3
              </span>
            </div>

            {/* Selected Province Pills */}
            <div className='flex flex-wrap items-center gap-1 sm:gap-1.5'>
              {comparedProvinces.map((prov, index) => (
                <motion.span
                  key={prov.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.04 }}
                  className='flex items-center gap-1 rounded-lg border-2 border-black bg-card px-1.5 py-0.5 font-mono text-xs font-bold text-foreground shadow-[2px_2px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_#fff] sm:py-1 sm:pr-2'
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded border border-black text-[10px] font-black ${
                      BADGE_COLORS[index % BADGE_COLORS.length]
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className='max-w-16 truncate sm:max-w-32'>{prov.name}</span>
                  <motion.button
                    type='button'
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onRemove(prov.id)}
                    className='rounded border border-black bg-background p-0.5 text-muted-foreground transition-colors hover:bg-red-600 hover:text-white dark:border-white dark:hover:bg-red-600'
                    aria-label={`Hapus ${prov.name} dari perbandingan`}
                  >
                    <X className='size-3 stroke-[2.5]' />
                  </motion.button>
                </motion.span>
              ))}

              {comparedProvinces.length < 3 && (
                <span className='hidden font-mono text-[11px] font-semibold text-muted-foreground md:inline'>
                  + Pilih {3 - comparedProvinces.length} lagi di peta
                </span>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
            <motion.button
              type='button'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              className='rounded-lg border-2 border-black bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground shadow-brutal-sm transition-colors hover:bg-muted dark:border-white dark:bg-zinc-900 sm:px-3 sm:py-1.5'
            >
              BATAL
            </motion.button>

            <motion.button
              type='button'
              disabled={!canCompare}
              whileHover={canCompare ? { scale: 1.05, y: -1 } : {}}
              whileTap={canCompare ? { scale: 0.95, y: 1 } : {}}
              onClick={onOpenModal}
              className={`flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase tracking-wider shadow-brutal-sm transition dark:border-white sm:gap-1.5 sm:px-4 sm:py-1.5 ${
                canCompare
                  ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-brutal'
                  : 'cursor-not-allowed bg-muted text-muted-foreground opacity-50 shadow-none'
              }`}
            >
              <span>BANDINGKAN</span>
              <ArrowRight className='size-3 stroke-[2.5] sm:size-3.5' />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
