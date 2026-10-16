import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Scale, X } from 'lucide-react';

import { IProvince } from '../interfaces/IProvince';

interface CompareFloatingBarProps {
  comparedProvinces: IProvince[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

const BADGE_COLORS = [
  'bg-blue-600 text-white',
  'bg-amber-500 text-white',
  'bg-emerald-600 text-white',
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
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className='pointer-events-none fixed inset-x-0 bottom-5 z-40 mx-auto flex w-full max-w-2xl justify-center px-4'
      >
        <div className='pointer-events-auto flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/95 p-3 shadow-2xl backdrop-blur-md'>
          {/* Left: Mode Title & Selection Chips */}
          <div className='flex flex-1 flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1.5 pr-1 text-xs font-bold text-foreground'>
              <Scale className='size-4 text-red-500' />
              <span className='hidden sm:inline'>Komparasi</span>
              <span className='rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground'>
                {comparedProvinces.length}/3
              </span>
            </div>

            {/* Selected Province Pills */}
            <div className='flex flex-wrap items-center gap-1.5'>
              {comparedProvinces.map((prov, index) => (
                <span
                  key={prov.id}
                  className='flex items-center gap-1.5 rounded-full border border-border bg-muted/60 py-1 pl-1.5 pr-2 text-xs font-medium text-foreground transition-all hover:bg-muted'
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      BADGE_COLORS[index % BADGE_COLORS.length]
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className='max-w-24 truncate sm:max-w-32'>{prov.name}</span>
                  <button
                    type='button'
                    onClick={() => onRemove(prov.id)}
                    className='rounded-full p-0.5 text-muted-foreground transition hover:bg-background hover:text-foreground'
                    aria-label={`Hapus ${prov.name} dari perbandingan`}
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}

              {comparedProvinces.length < 3 && (
                <span className='hidden text-[11px] italic text-muted-foreground md:inline'>
                  + Pilih {3 - comparedProvinces.length} lagi di peta
                </span>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              onClick={onClear}
              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground'
            >
              Batal
            </button>

            <button
              type='button'
              disabled={!canCompare}
              onClick={onOpenModal}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-md transition ${
                canCompare
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                  : 'cursor-not-allowed bg-muted text-muted-foreground opacity-60'
              }`}
            >
              <span>Bandingkan</span>
              <ArrowRight className='size-3.5' />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
