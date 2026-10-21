import { motion } from 'framer-motion';
import {
  BarChart3,
  CloudSun,
  Code2,
  ExternalLink,
  Github,
  Globe,
  Info,
  Instagram,
  Linkedin,
  MapPin,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    handle: 'in/achmad-yuliadi',
    url: 'https://linkedin.com/in/achmad-yuliadi',
    icon: Linkedin,
    iconColor: 'text-[#0A66C2]',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
  },
  {
    name: 'GitHub',
    handle: 'github.com/yadija',
    url: 'https://github.com/yadija',
    icon: Github,
    iconColor: 'text-foreground',
    hoverBg: 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
  },
  {
    name: 'Instagram',
    handle: '@yadija_',
    url: 'https://www.instagram.com/yadija_',
    icon: Instagram,
    iconColor: 'text-pink-600 dark:text-pink-400',
    hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-950/30',
  },
  {
    name: 'Website Portofolio',
    handle: 'yadija.github.io',
    url: 'https://yadija.github.io',
    icon: Globe,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
];

const FEATURES = [
  {
    title: '38 Provinsi Lengkap',
    desc: 'Mencakup 4 provinsi pemekaran baru di Papua (Papua Selatan, Tengah, Pegunungan, dan Papua Barat Daya).',
    icon: MapPin,
    color: 'text-red-600',
  },
  {
    title: 'Peta Tematik (Choropleth)',
    desc: 'Visualisasi kuantil 5 tingkatan untuk populasi, kepadatan penduduk, dan luas wilayah.',
    icon: BarChart3,
    color: 'text-blue-600',
  },
  {
    title: 'Komparasi Multi-Provinsi',
    desc: 'Bandingkan hingga 3 provinsi secara berdampingan untuk analisis statistik demografi.',
    icon: Scale,
    color: 'text-amber-500',
  },
  {
    title: 'Cuaca & Kualitas Udara Real-Time',
    desc: 'Data meteorologi dan indeks AQI langsung dari Open-Meteo dengan zona waktu Indonesia.',
    icon: CloudSun,
    color: 'text-teal-600',
  },
];

export default function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90dvh] w-[96vw] max-w-2xl overflow-y-auto rounded-xl border-2 border-black p-4 shadow-brutal-xl dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white-lg sm:p-6'>
        <DialogHeader className='text-left'>
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-red-600 text-white shadow-brutal-sm dark:border-white sm:size-10'>
              <Info className='size-5 stroke-[2.5]' />
            </div>
            <div>
              <DialogTitle className='font-mono text-base font-black uppercase tracking-tight text-foreground sm:text-xl'>
                IDN // TENTANG &amp; PENGEMBANG
              </DialogTitle>
              <DialogDescription className='font-mono text-[11px] text-muted-foreground sm:text-xs'>
                [SISTEM INFORMASI GEOSPASIAL, DEMOGRAFI &amp; LINGKUNGAN INDONESIA]
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='mt-2 space-y-4'>
          {/* developer profile */}
          <div className='rounded-lg border-2 border-black bg-card p-3.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-4'>
            <div className='mb-3 flex items-center justify-between border-b border-border/60 pb-2'>
              <div className='flex items-center gap-1.5'>
                <Code2 className='size-4 shrink-0 stroke-[2.5] text-red-600' />
                <span className='font-mono text-xs font-black uppercase tracking-wider text-foreground'>
                  PROFIL PENGEMBANG
                </span>
              </div>
              <span className='py-0.2 rounded border border-black bg-amber-300 px-1.5 font-mono text-[9px] font-black uppercase text-black dark:border-white'>
                INDEPENDENT DEV
              </span>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-red-600 font-mono text-lg font-black text-white shadow-brutal-sm dark:border-white sm:size-14'>
                AY
              </div>

              <div className='space-y-0.5'>
                <h3 className='font-mono text-sm font-black text-foreground sm:text-base'>
                  Achmad Yuliadi
                </h3>
                <p className='font-mono text-xs font-semibold text-muted-foreground'>
                  Full-Stack Web Developer &amp; Open Data Enthusiast
                </p>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  Pengembang aplikasi mandiri yang berfokus pada antarmuka web modern,
                  visualisasi geospasial interaktif, dan integrasi data terbuka untuk
                  publik.
                </p>
              </div>
            </div>

            <div className='mt-3.5 border-t border-border/60 pt-3'>
              <p className='mb-2 font-mono text-[11px] font-bold text-muted-foreground'>
                TAUTAN AKUN PENGEMBANG:
              </p>
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {SOCIAL_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target='_blank'
                      rel='noreferrer'
                      whileHover={{ y: -1.5, scale: 1.01 }}
                      whileTap={{ y: 1, scale: 0.99 }}
                      className={`flex items-center justify-between rounded-lg border-2 border-black bg-background px-3 py-2 shadow-brutal-sm transition dark:border-white dark:bg-zinc-950 ${link.hoverBg}`}
                    >
                      <div className='flex items-center gap-2.5'>
                        <div className='flex size-7 shrink-0 items-center justify-center rounded border border-black bg-card shadow-[1px_1px_0px_#000] dark:border-white dark:bg-zinc-900'>
                          <Icon className={`size-4 stroke-[2.2] ${link.iconColor}`} />
                        </div>
                        <div className='leading-tight'>
                          <div className='font-mono text-xs font-bold text-foreground'>
                            {link.name}
                          </div>
                          <div className='font-mono text-[10px] text-muted-foreground'>
                            {link.handle}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className='size-3.5 shrink-0 stroke-[2.2] text-muted-foreground' />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* application features */}
          <div className='rounded-lg border-2 border-black bg-card p-3.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-4'>
            <div className='mb-2.5 flex items-center gap-1.5 border-b border-border/60 pb-2'>
              <span className='font-mono text-xs font-black uppercase tracking-wider text-foreground'>
                FITUR UTAMA APLIKASI
              </span>
            </div>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className='rounded-md border border-border bg-muted/30 p-2.5 font-mono'
                  >
                    <div className='flex items-center gap-1.5 text-xs font-bold text-foreground'>
                      <Icon className={`size-3.5 shrink-0 stroke-[2.5] ${item.color}`} />
                      <span className='leading-none'>{item.title}</span>
                    </div>
                    <p className='mt-1 text-[11px] leading-relaxed text-muted-foreground'>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* data sources & attribution */}
          <div className='rounded-lg border-2 border-black bg-muted/60 p-3.5 text-xs text-muted-foreground dark:border-white dark:bg-zinc-900'>
            <div className='flex items-center gap-1.5 font-mono font-bold text-foreground'>
              <ShieldCheck className='size-4 shrink-0 stroke-[2.5] text-emerald-600' />
              <span className='leading-none'>[SUMBER DATA &amp; ATRIBUSI RESMI]</span>
            </div>
            <ul className='mt-2 space-y-1 font-mono text-[11px] leading-relaxed'>
              <li className='flex items-start gap-1.5'>
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                <span>
                  <strong>Data Spasial &amp; Batas Wilayah:</strong> Badan Informasi
                  Geospasial (BIG).
                </span>
              </li>
              <li className='flex items-start gap-1.5'>
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                <span>
                  <strong>Data Kependudukan:</strong> Sensus &amp; Proyeksi BPS RI
                  (2020–2023).
                </span>
              </li>
              <li className='flex items-start gap-1.5'>
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                <span>
                  <strong>Pemekaran 38 Provinsi:</strong> Regulasi UU Pemekaran Papua
                  &amp; Kemendagri.
                </span>
              </li>
              <li className='flex items-start gap-1.5'>
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                <span>
                  <strong>Cuaca &amp; Kualitas Udara (AQI):</strong> Open-Meteo API
                  (Lisensi CC BY 4.0).
                </span>
              </li>
            </ul>

            <div className='mt-3 border-t border-border/70 pt-2 text-[10px] italic leading-relaxed text-muted-foreground'>
              * Aplikasi ini merupakan karya independen sumber terbuka (open-source) untuk
              edukasi dan visualisasi geospasial publik Indonesia.
            </div>
          </div>
        </div>

        <div className='mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black pt-3 font-mono text-xs dark:border-white'>
          <span className='text-[11px] font-bold text-muted-foreground'>
            INDONESIA-MAP // V1.0.0
          </span>
          <motion.button
            type='button'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChange(false)}
            className='rounded border-2 border-black bg-black px-4 py-1.5 font-mono text-xs font-black uppercase text-white shadow-brutal-sm transition hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black'
          >
            TUTUP
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
