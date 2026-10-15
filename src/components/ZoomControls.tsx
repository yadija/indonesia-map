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
    <div className='fixed bottom-6 right-6 z-30 flex flex-col items-center rounded-2xl border border-border/80 bg-background/90 p-1.5 shadow-xl backdrop-blur-md transition-all'>
      {/* Zoom In Button */}
      <button
        type='button'
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className='flex size-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
        title='Perbesar (Zoom In)'
        aria-label='Perbesar peta'
      >
        <ZoomIn className='size-4' />
      </button>

      {/* Current Zoom Percentage Badge */}
      <span className='my-0.5 select-none px-1 text-[11px] font-semibold text-muted-foreground'>
        {percentage}%
      </span>

      {/* Zoom Out Button */}
      <button
        type='button'
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className='flex size-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
        title='Perkecil (Zoom Out hingga 75%)'
        aria-label='Perkecil peta'
      >
        <ZoomOut className='size-4' />
      </button>

      {/* Separator */}
      <div className='my-1 h-px w-5 bg-border/80' />

      {/* Reset View Button */}
      <button
        type='button'
        onClick={onReset}
        disabled={scale === 1}
        className='flex size-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
        title='Reset Tampilan (100%)'
        aria-label='Reset posisi dan zoom peta ke 100%'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </div>
  );
}
