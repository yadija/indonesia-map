import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  const percentage = Math.round(scale * 100);
  const canZoomIn = scale < 6;
  const canZoomOut = scale > 0.75;

  return (
    <div className='fixed bottom-6 right-6 z-30 flex flex-col items-center rounded-xl border-2 border-black bg-background p-1.5 shadow-brutal transition-all dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white'>
      {/* Zoom In Button */}
      <motion.button
        type='button'
        whileHover={{ scale: 1.1, y: -1 }}
        whileTap={{ scale: 0.9, y: 1 }}
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className='flex size-8 items-center justify-center rounded-lg border-2 border-transparent font-bold text-foreground transition-colors hover:border-black hover:bg-amber-300 hover:text-black disabled:pointer-events-none disabled:opacity-30 dark:hover:border-white dark:hover:bg-red-600 dark:hover:text-white'
        title='Perbesar (Zoom In)'
        aria-label='Perbesar peta'
      >
        <ZoomIn className='size-4 stroke-[2.5]' />
      </motion.button>

      {/* Current Zoom Percentage Badge */}
      <span className='my-0.5 select-none font-mono text-[11px] font-black text-foreground'>
        {percentage}%
      </span>

      {/* Zoom Out Button */}
      <motion.button
        type='button'
        whileHover={{ scale: 1.1, y: 1 }}
        whileTap={{ scale: 0.9, y: -1 }}
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className='flex size-8 items-center justify-center rounded-lg border-2 border-transparent font-bold text-foreground transition-colors hover:border-black hover:bg-amber-300 hover:text-black disabled:pointer-events-none disabled:opacity-30 dark:hover:border-white dark:hover:bg-red-600 dark:hover:text-white'
        title='Perkecil (Zoom Out hingga 75%)'
        aria-label='Perkecil peta'
      >
        <ZoomOut className='size-4 stroke-[2.5]' />
      </motion.button>

      {/* Separator */}
      <div className='my-1 h-0.5 w-5 bg-black dark:bg-white' />

      {/* Reset View Button */}
      <motion.button
        type='button'
        whileHover={{ scale: 1.1, rotate: -45 }}
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        disabled={scale === 1}
        className='flex size-8 items-center justify-center rounded-lg border-2 border-transparent font-bold text-foreground transition-colors hover:border-black hover:bg-red-600 hover:text-white disabled:pointer-events-none disabled:opacity-30 dark:hover:border-white dark:hover:bg-red-600 dark:hover:text-white'
        title='Reset Tampilan (100%)'
        aria-label='Reset posisi dan zoom peta ke 100%'
      >
        <RotateCcw className='size-3.5 stroke-[2.5]' />
      </motion.button>
    </div>
  );
}
