import {
  ArrowLeftRight,
  ChevronsUpDown,
  Clock,
  ExternalLink,
  MapPin,
  Maximize2,
  Plus,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Province } from '../interfaces/province';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparedProvinces: Province[];
  allProvinces: Province[];
  onAddProvince: (id: string) => void;
  onRemoveProvince: (id: string) => void;
  onReplaceProvince: (oldId: string, newId: string) => void;
}

const COLUMN_COLORS = [
  {
    badge: 'bg-blue-600 text-white',
    border: 'border-blue-500/40',
    bar: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    badge: 'bg-amber-500 text-white',
    border: 'border-amber-500/40',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    badge: 'bg-emerald-600 text-white',
    border: 'border-emerald-500/40',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
];

export default function CompareModal({
  open,
  onOpenChange,
  comparedProvinces,
  allProvinces,
  onAddProvince,
  onRemoveProvince,
  onReplaceProvince,
}: CompareModalProps) {
  const [selectedToAdd, setSelectedToAdd] = useState('');

  const formatNumber = (num?: number) => {
    if (!num) return '-';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Find maximum values for comparative visual bars
  const stats = useMemo(() => {
    const list = comparedProvinces.map((p) => {
      const density =
        p.population && p.areaKm2 ? Math.round(p.population / p.areaKm2) : 0;
      return {
        ...p,
        density,
      };
    });

    const maxPop = Math.max(...list.map((p) => p.population || 1), 1);
    const maxArea = Math.max(...list.map((p) => p.areaKm2 || 1), 1);
    const maxDensity = Math.max(...list.map((p) => p.density || 1), 1);

    return { list, maxPop, maxArea, maxDensity };
  }, [comparedProvinces]);

  // Unselected provinces for dropdown
  const availableProvinces = useMemo(() => {
    const selectedIds = new Set(comparedProvinces.map((p) => p.id));
    return allProvinces
      .filter((p) => !selectedIds.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProvinces, comparedProvinces]);

  // Group available unselected provinces by island for organized browsing
  const groupedProvinces = useMemo(() => {
    const groups: Record<string, Province[]> = {};
    availableProvinces.forEach((p) => {
      const island = p.island || 'Lainnya';
      if (!groups[island]) groups[island] = [];
      groups[island].push(p);
    });
    return groups;
  }, [availableProvinces]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToAdd) return;
    onAddProvince(selectedToAdd);
    setSelectedToAdd('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-full max-w-5xl overflow-y-auto p-4 sm:p-6'>
        <DialogHeader className='text-left'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'>
              <Scale className='size-4' />
            </div>
            <div>
              <DialogTitle className='text-xl font-bold tracking-tight'>
                Perbandingan Antar-Provinsi
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Analisis komparatif statistik kependudukan, luas wilayah, dan profil
                daerah
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Add 3rd Province Selector (if less than 3 provinces) */}
        {comparedProvinces.length < 3 && availableProvinces.length > 0 && (
          <form
            onSubmit={handleAdd}
            className='flex flex-wrap items-center gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 p-2.5 sm:p-3'
          >
            <span className='text-xs font-semibold text-muted-foreground'>
              Tambah provinsi ke-3:
            </span>
            <div className='relative min-w-[200px] max-w-xs flex-1'>
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className='h-8 w-full cursor-pointer appearance-none rounded-lg border border-border/80 bg-background py-1.5 pl-3 pr-8 text-xs font-medium text-foreground shadow-sm transition hover:border-foreground/30 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
              >
                <option value=''>-- Pilih Provinsi Lain --</option>
                {Object.entries(groupedProvinces).map(([island, list]) => (
                  <optgroup key={island} label={`── ${island} ──`}>
                    {list.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground'>
                <ChevronsUpDown className='size-3.5 opacity-60' />
              </div>
            </div>
            <button
              type='submit'
              disabled={!selectedToAdd}
              className='flex h-8 items-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50'
            >
              <Plus className='size-3.5' />
              <span>Tambah</span>
            </button>
          </form>
        )}

        {/* Comparative Columns Grid */}
        <div
          className={`mt-2 grid gap-4 ${
            stats.list.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {stats.list.map((prov, index) => {
            const colors = COLUMN_COLORS[index % COLUMN_COLORS.length];
            const isHighestPop =
              stats.list.length > 1 && prov.population === stats.maxPop;
            const isHighestArea = stats.list.length > 1 && prov.areaKm2 === stats.maxArea;
            const isHighestDensity =
              stats.list.length > 1 && prov.density === stats.maxDensity;

            return (
              <div
                key={prov.id}
                className={`relative flex flex-col justify-between rounded-2xl border ${colors.border} bg-card p-4 shadow-sm transition hover:shadow-md`}
              >
                <div>
                  {/* Column Header */}
                  <div className='border-b border-border/60 pb-3'>
                    {/* Top Row: Slot Badge, Full Province Title, Island Badge & Remove Button */}
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                        <span
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors.badge}`}
                        >
                          {index + 1}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <h3 className='break-words text-base font-bold leading-snug text-foreground'>
                            {prov.name}
                          </h3>
                          {prov.island && (
                            <span className='mt-1 inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground'>
                              {prov.island}
                            </span>
                          )}
                        </div>
                      </div>

                      {stats.list.length > 2 && (
                        <button
                          type='button'
                          onClick={() => onRemoveProvince(prov.id)}
                          className='flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground'
                          aria-label={`Hapus ${prov.name}`}
                          title={`Hapus ${prov.name}`}
                        >
                          <X className='size-3.5' />
                        </button>
                      )}
                    </div>

                    {/* Sub Row: Elegant Switch Province Control */}
                    <div className='mt-3'>
                      <div className='group relative flex items-center'>
                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground transition-colors group-hover:text-foreground'>
                          <ArrowLeftRight className='size-3.5 text-blue-500' />
                        </div>
                        <select
                          aria-label={`Ganti provinsi ${prov.name}`}
                          value={prov.id}
                          onChange={(e) => onReplaceProvince(prov.id, e.target.value)}
                          className='h-8 w-full cursor-pointer appearance-none rounded-xl border border-border/80 bg-background/80 px-8 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground focus:border-blue-500 focus:bg-background focus:text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500'
                        >
                          <option value={prov.id} disabled>
                            Ganti dengan provinsi lain...
                          </option>
                          {Object.entries(groupedProvinces).map(([island, list]) => (
                            <optgroup key={island} label={`── ${island} ──`}>
                              {list.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-colors group-hover:text-foreground'>
                          <ChevronsUpDown className='size-3.5 opacity-60' />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Metrics with Relative Progress Bars */}
                  <div className='mt-4 space-y-4 text-xs'>
                    {/* Populasi */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-medium text-muted-foreground'>
                          <Users className='size-3.5 text-blue-500' />
                          Populasi:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-bold text-foreground'>
                            {formatNumber(prov.population)} jiwa
                          </strong>
                          {isHighestPop && (
                            <span className='rounded bg-blue-100 px-1 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                              Tertinggi
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          style={{
                            width: `${((prov.population || 0) / stats.maxPop) * 100}%`,
                          }}
                          className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Luas Wilayah */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-medium text-muted-foreground'>
                          <Maximize2 className='size-3.5 text-emerald-500' />
                          Luas Wilayah:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-bold text-foreground'>
                            {formatNumber(prov.areaKm2)} km²
                          </strong>
                          {isHighestArea && (
                            <span className='rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>
                              Terluas
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          style={{
                            width: `${((prov.areaKm2 || 0) / stats.maxArea) * 100}%`,
                          }}
                          className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Kepadatan Penduduk */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-medium text-muted-foreground'>
                          <TrendingUp className='size-3.5 text-orange-500' />
                          Kepadatan:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-bold text-foreground'>
                            {formatNumber(prov.density)} jiwa/km²
                          </strong>
                          {isHighestDensity && (
                            <span className='rounded bg-orange-100 px-1 py-0.5 text-[9px] font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300'>
                              Terpadat
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          style={{
                            width: `${(prov.density / stats.maxDensity) * 100}%`,
                          }}
                          className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Quick Facts */}
                    <div className='space-y-1.5 border-t border-border/60 pt-3'>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <MapPin className='size-3.5 text-red-500' />
                          Ibu Kota:
                        </span>
                        <span className='font-semibold text-foreground'>
                          {prov.capital || '-'}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <Clock className='size-3.5 text-amber-500' />
                          Zona Waktu:
                        </span>
                        <span className='font-semibold text-foreground'>
                          {prov.timezone || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    {prov.description && (
                      <div className='border-t border-border/60 pt-3'>
                        <p className='line-clamp-3 text-[11px] leading-relaxed text-muted-foreground'>
                          {prov.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wikipedia Link */}
                {prov.wikipediaUrl && (
                  <div className='mt-4 border-t border-border/60 pt-3'>
                    <a
                      href={prov.wikipediaUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-1.5 text-[11px] font-medium text-foreground transition hover:bg-muted'
                    >
                      <span>Profil di Wikipedia</span>
                      <ExternalLink className='size-3' />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer & Source Citation */}
        <div className='mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <ShieldCheck className='size-3.5 text-emerald-500' />
            <span>
              Rujukan Resmi: BPS RI (Proyeksi 2023) & Kemendagri RI (Kepmen No.
              100.1.1-6117 Tahun 2022)
            </span>
          </div>

          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/80'
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
