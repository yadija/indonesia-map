import { Clock, ExternalLink, MapPin, Maximize2, Users } from 'lucide-react';

import { IProvince } from '../interfaces/IProvince';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface InfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province: IProvince | null;
}

export default function InfoSheet({ open, onOpenChange, province }: InfoSheetProps) {
  const formatNumber = (val?: number) => {
    if (!val) return '-';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-md'>
        <SheetHeader className='space-y-2 text-left'>
          {province?.island && (
            <div className='inline-flex w-fit items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300'>
              Wilayah {province.island}
            </div>
          )}
          <SheetTitle className='text-2xl font-bold tracking-tight'>
            {province ? province.name : 'Informasi Wilayah'}
          </SheetTitle>
          <SheetDescription className='text-sm text-muted-foreground'>
            {province
              ? `Profil dan statistik resmi Provinsi ${province.name}`
              : 'Silakan klik salah satu provinsi pada peta untuk melihat detail informasi.'}
          </SheetDescription>
        </SheetHeader>

        {province && (
          <div className='mt-6 space-y-6'>
            {/* Quick Stat Cards */}
            <div className='grid grid-cols-2 gap-3'>
              {/* Ibu Kota */}
              <div className='rounded-lg border bg-card p-3 shadow-sm'>
                <div className='flex items-center space-x-2 text-muted-foreground'>
                  <MapPin className='size-4 text-red-500' />
                  <span className='text-xs font-medium'>Ibu Kota</span>
                </div>
                <p className='mt-1 text-sm font-semibold'>{province.capital || '-'}</p>
              </div>

              {/* Zona Waktu */}
              <div className='rounded-lg border bg-card p-3 shadow-sm'>
                <div className='flex items-center space-x-2 text-muted-foreground'>
                  <Clock className='size-4 text-amber-500' />
                  <span className='text-xs font-medium'>Zona Waktu</span>
                </div>
                <p className='mt-1 text-sm font-semibold'>{province.timezone || '-'}</p>
              </div>

              {/* Penduduk */}
              <div className='rounded-lg border bg-card p-3 shadow-sm'>
                <div className='flex items-center space-x-2 text-muted-foreground'>
                  <Users className='size-4 text-blue-500' />
                  <span className='text-xs font-medium'>Populasi</span>
                </div>
                <p className='mt-1 text-sm font-semibold'>
                  {formatNumber(province.population)} jiwa
                </p>
              </div>

              {/* Luas Wilayah */}
              <div className='rounded-lg border bg-card p-3 shadow-sm'>
                <div className='flex items-center space-x-2 text-muted-foreground'>
                  <Maximize2 className='size-4 text-emerald-500' />
                  <span className='text-xs font-medium'>Luas Wilayah</span>
                </div>
                <p className='mt-1 text-sm font-semibold'>
                  {formatNumber(province.areaKm2)} km²
                </p>
              </div>
            </div>

            {/* Ringkasan & Deskripsi */}
            {province.description && (
              <div className='rounded-lg border bg-muted/40 p-4'>
                <h4 className='mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Tentang Provinsi
                </h4>
                <p className='text-sm leading-relaxed text-foreground/90'>
                  {province.description}
                </p>
              </div>
            )}

            {/* Tautan Wikipedia */}
            {province.wikipediaUrl && (
              <div>
                <a
                  href={province.wikipediaUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <span>Baca Selengkapnya di Wikipedia</span>
                  <ExternalLink className='size-4' />
                </a>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
