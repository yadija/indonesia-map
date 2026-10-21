import { Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AboutModal from './components/about-modal';
import ChoroplethLegend from './components/choropleth-legend';
import CompareFloatingBar from './components/compare-floating-bar';
import CompareModal from './components/compare-modal';
import InfoSheet from './components/info-sheet';
import RegencyListModal from './components/regency-list-modal';
import RegencySheet from './components/regency-sheet';
import RegencySVGElement from './components/regency-svg-element';
import SearchBarFilter from './components/search-bar-filter';
import SVGElement from './components/svg-element';
import indonesiaMap from './data/indonesia-map.json';
import {
  getProvinceIdFromSlug,
  getRegenciesByProvinceId,
  getSlugFromProvinceId,
  hasRegenciesData,
} from './data/regencies';
import { useRouter } from './hooks/use-router';
import { useTheme } from './hooks/use-theme';
import { useToast } from './hooks/use-toast';
import { ChoroplethMetric } from './interfaces/choropleth';
import { Province } from './interfaces/province';
import { Regency } from './interfaces/regency';
import { computeChoropleth } from './utils/choropleth';
import { computeRegencyChoropleth } from './utils/regency-choropleth';

const provincesList: Province[] = indonesiaMap as Province[];

export default function App() {
  const { pathname, navigate } = useRouter();

  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState<Province | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<ChoroplethMetric>('none');
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  // drill-down regencies state
  const [drillDownProvince, setDrillDownProvince] = useState<Province | null>(null);
  const [selectedRegency, setSelectedRegency] = useState<Regency | null>(null);
  const [selectedRegencyType, setSelectedRegencyType] = useState<
    'all' | 'kabupaten' | 'kota'
  >('all');
  const [isRegencySheetOpen, setIsRegencySheetOpen] = useState(false);
  const [highlightedRegencyId, setHighlightedRegencyId] = useState<string | null>(null);
  const [isRegencyListModalOpen, setIsRegencyListModalOpen] = useState(false);
  const [hoveredRegencyId, setHoveredRegencyId] = useState<string | null>(null);

  // modal states
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // compare mode states
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  // sync pathname with drill-down state
  useEffect(() => {
    const match = pathname.match(/^\/(?:provinsi|kabupaten)\/([^/?#]+)/i);
    if (match) {
      const slug = match[1];
      const provId = getProvinceIdFromSlug(slug);
      if (provId) {
        const targetProv = provincesList.find((p) => p.id === provId);
        if (targetProv && targetProv.id !== drillDownProvince?.id) {
          setDrillDownProvince(targetProv);
          setSelectedRegencyType('all');
          setOpen(false);
          setHighlightedId(null);
        }
        return;
      }
    }
    // reset when navigating to root
    if (pathname === '/' || pathname === '') {
      if (drillDownProvince !== null) {
        setDrillDownProvince(null);
        setSelectedRegency(null);
        setHighlightedRegencyId(null);
        setSelectedRegencyType('all');
      }
    }
  }, [pathname, drillDownProvince?.id]);

  // selected province regencies data
  const regencyData = useMemo(() => {
    if (!drillDownProvince) return null;
    return getRegenciesByProvinceId(drillDownProvince.id);
  }, [drillDownProvince]);

  // compute choropleth data
  const nationalChoroplethConfig = useMemo(
    () => computeChoropleth(activeMetric, provincesList),
    [activeMetric],
  );

  const regencyChoroplethConfig = useMemo(() => {
    if (!regencyData) return null;
    return computeRegencyChoropleth(activeMetric, regencyData.regencies);
  }, [activeMetric, regencyData]);

  const choroplethConfig = drillDownProvince
    ? regencyChoroplethConfig
    : nationalChoroplethConfig;

  // compared provinces objects
  const comparedProvinces = useMemo(
    () =>
      comparedIds
        .map((id) => provincesList.find((p) => p.id === id))
        .filter((p): p is Province => p !== undefined),
    [comparedIds],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: 'IDN // PETA INTERAKTIF',
        description: 'Sistem informasi spasial & demografi 38 provinsi Indonesia',
        duration: 6000,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [toast]);

  // handle adding or removing province from comparison
  const handleToggleCompare = (prov: Province) => {
    if (comparedIds.includes(prov.id)) {
      setComparedIds((prev) => prev.filter((id) => id !== prov.id));
      toast({
        title: 'DIHAPUS DARI KOMPARASI',
        description: `${prov.name} telah dikeluarkan dari daftar perbandingan.`,
        duration: 3000,
      });
    } else {
      if (comparedIds.length >= 3) {
        toast({
          title: 'BATAS MAKSIMAL TERCAPAI',
          description: 'Maksimal 3 provinsi untuk dibandingkan sekaligus.',
          duration: 4000,
        });
        return;
      }
      setComparedIds((prev) => [...prev, prov.id]);
      setIsCompareMode(true);
      toast({
        title: 'DITAMBAHKAN KE KOMPARASI',
        description: `${prov.name} (${comparedIds.length + 1}/3) masuk daftar komparasi.`,
        duration: 3000,
      });
    }
  };

  const handleRemoveCompared = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleClearCompared = () => {
    setComparedIds([]);
    setIsCompareMode(false);
  };

  const handleReplaceCompared = (oldId: string, newId: string) => {
    setComparedIds((prev) => prev.map((id) => (id === oldId ? newId : id)));
  };

  const handleToggleCompareMode = () => {
    setIsCompareMode((prev) => {
      const next = !prev;
      if (next && comparedIds.length === 0) {
        toast({
          title: 'MODE KOMPARASI AKTIF',
          description: 'Klik 2 atau 3 provinsi di peta untuk mulai membandingkannya.',
          duration: 5000,
        });
      }
      return next;
    });
  };

  const handlePathClick = (id: string) => {
    const selected = provincesList.find((map) => map.id === id);
    if (!selected) return;

    if (isCompareMode) {
      handleToggleCompare(selected);
      return;
    }

    setProvince(selected);
    setHighlightedId(id);
    setOpen(true);
  };

  const handleSelectProvince = (id: string) => {
    const selected = provincesList.find((map) => map.id === id);
    if (selected) {
      if (isCompareMode) {
        handleToggleCompare(selected);
      } else {
        setProvince(selected);
        setHighlightedId(id);
        setOpen(true);
      }
    }
  };

  const handleDrillDown = (prov: Province) => {
    if (!hasRegenciesData(prov.id)) {
      toast({
        title: 'DATA BELUM TERSEDIA',
        description: `Batas kabupaten/kota untuk ${prov.name} sedang dalam proses integrasi.`,
        duration: 3500,
      });
      return;
    }
    const slug = getSlugFromProvinceId(prov.id);
    navigate(`/provinsi/${slug}`);
    setDrillDownProvince(prov);
    setSelectedRegencyType('all');
    setOpen(false);
    setHighlightedId(null);
    setHighlightedRegencyId(null);
    setIsRegencyListModalOpen(false);
    setHoveredRegencyId(null);
    toast({
      title: 'MODE KABUPATEN / KOTA',
      description: `Menampilkan peta batas kabupaten/kota di ${prov.name}`,
      duration: 3500,
    });
  };

  const handleBackToNational = () => {
    navigate('/');
    setDrillDownProvince(null);
    setSelectedRegency(null);
    setHighlightedRegencyId(null);
    setSelectedRegencyType('all');
    setIsRegencyListModalOpen(false);
    setHoveredRegencyId(null);
    toast({
      title: 'PETA NASIONAL',
      description: 'Kembali ke peta 38 provinsi Indonesia',
      duration: 2500,
    });
  };

  const handleSelectRegency = (reg: Regency) => {
    const parentProv = provincesList.find((p) => p.id === reg.provinceId);
    if (parentProv) {
      const slug = getSlugFromProvinceId(parentProv.id);
      navigate(`/provinsi/${slug}`);
      setDrillDownProvince(parentProv);
      setSelectedRegencyType('all');
      setSelectedRegency(reg);
      setHighlightedRegencyId(reg.id);
      setIsRegencySheetOpen(true);
      setOpen(false);
    }
  };

  const handleRegencyClick = (reg: Regency) => {
    setSelectedRegency(reg);
    setHighlightedRegencyId(reg.id);
    setIsRegencySheetOpen(true);
  };

  return (
    <section className='bg-brutalist-grid relative h-screen min-h-dvh select-none overflow-hidden bg-background text-foreground transition-colors duration-200'>
      <div className='pointer-events-none absolute left-4 top-4 z-10 hidden select-none flex-col gap-0.5 font-mono text-[10px] font-bold text-muted-foreground/50 md:flex'>
        <span>[IDN-GRID // 0°47&apos;S 113°55&apos;E]</span>
        <span>[GEODETIC WGS84 // EPSG:4326]</span>
      </div>
      <div className='pointer-events-none absolute right-4 top-4 z-10 hidden select-none flex-col items-end gap-0.5 font-mono text-[10px] font-bold text-muted-foreground/50 md:flex'>
        <span>
          {drillDownProvince
            ? `[KAB/KOTA // ${drillDownProvince.name.toUpperCase()}]`
            : '[38 PROVINSI // 17.000+ PULAU]'}
        </span>
        <span>[BPS RI &amp; KEMENDAGRI DATA]</span>
      </div>
      <div className='pointer-events-none absolute left-2 top-2 font-mono text-sm font-bold text-foreground/30'>
        +
      </div>
      <div className='pointer-events-none absolute right-2 top-2 font-mono text-sm font-bold text-foreground/30'>
        +
      </div>
      <div className='pointer-events-none absolute bottom-8 left-2 font-mono text-sm font-bold text-foreground/30'>
        +
      </div>
      <div className='pointer-events-none absolute bottom-8 right-2 font-mono text-sm font-bold text-foreground/30'>
        +
      </div>

      {/* search bar and controls */}
      <SearchBarFilter
        provinces={provincesList}
        selectedIsland={selectedIsland}
        activeMetric={activeMetric}
        isDark={isDark}
        isCompareActive={isCompareMode}
        compareCount={comparedIds.length}
        currentProvince={drillDownProvince}
        regencies={regencyData?.regencies}
        selectedRegencyType={selectedRegencyType}
        onSelectRegencyType={setSelectedRegencyType}
        onBackToNational={handleBackToNational}
        onSelectOtherProvince={(otherId) => {
          const nextProv = provincesList.find((p) => p.id === otherId);
          if (nextProv) handleDrillDown(nextProv);
        }}
        onToggleTheme={toggleTheme}
        onToggleCompareMode={handleToggleCompareMode}
        onSelectMetric={setActiveMetric}
        onSelectIsland={setSelectedIsland}
        onSelectProvince={handleSelectProvince}
        onSelectRegency={handleSelectRegency}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenRegencyList={() => setIsRegencyListModalOpen(true)}
      />

      {/* map canvas */}
      <div
        className={`absolute inset-x-0 flex items-center justify-center px-3 transition-all duration-200 sm:px-8 md:px-12 ${
          drillDownProvince
            ? 'bottom-8 top-[116px] sm:bottom-9 sm:top-[122px]'
            : 'bottom-8 top-[68px] sm:bottom-9 sm:top-[74px]'
        }`}
      >
        {drillDownProvince && regencyData ? (
          <RegencySVGElement
            provinceData={regencyData}
            highlightedRegencyId={highlightedRegencyId}
            externalHoveredRegencyId={hoveredRegencyId}
            selectedRegencyType={selectedRegencyType}
            isDark={isDark}
            choroplethConfig={choroplethConfig}
            hoveredTier={hoveredTier}
            onRegencyClick={handleRegencyClick}
          />
        ) : (
          <SVGElement
            shapes={provincesList}
            selectedIsland={selectedIsland}
            highlightedId={highlightedId}
            comparedIds={comparedIds}
            isDark={isDark}
            choroplethConfig={choroplethConfig}
            hoveredTier={hoveredTier}
            onPathClick={handlePathClick}
          />
        )}
      </div>

      {/* choropleth legend */}
      <ChoroplethLegend
        config={choroplethConfig}
        isDark={isDark}
        hoveredTier={hoveredTier}
        hasCompareBar={comparedProvinces.length > 0}
        onHoverTier={setHoveredTier}
      />

      {/* floating comparison bar */}
      <CompareFloatingBar
        comparedProvinces={comparedProvinces}
        onRemove={handleRemoveCompared}
        onClear={handleClearCompared}
        onOpenModal={() => setIsCompareModalOpen(true)}
      />

      {/* province detail sheet */}
      <InfoSheet
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setHighlightedId(null);
          }
        }}
        province={province}
        isAlreadyCompared={province ? comparedIds.includes(province.id) : false}
        onAddToCompare={handleToggleCompare}
        onDrillDown={handleDrillDown}
      />

      {/* regency detail sheet */}
      <RegencySheet
        open={isRegencySheetOpen}
        onOpenChange={(isOpen) => {
          setIsRegencySheetOpen(isOpen);
          if (!isOpen) {
            setHighlightedRegencyId(null);
          }
        }}
        regency={selectedRegency}
        provinceName={drillDownProvince?.name}
      />

      {/* comparison modal */}
      <CompareModal
        open={isCompareModalOpen}
        onOpenChange={setIsCompareModalOpen}
        comparedProvinces={comparedProvinces}
        allProvinces={provincesList}
        onAddProvince={(id) => {
          const prov = provincesList.find((p) => p.id === id);
          if (prov) handleToggleCompare(prov);
        }}
        onRemoveProvince={handleRemoveCompared}
        onReplaceProvince={handleReplaceCompared}
      />

      {/* about modal */}
      <AboutModal open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen} />

      {/* regency list modal */}
      <RegencyListModal
        open={isRegencyListModalOpen}
        onOpenChange={setIsRegencyListModalOpen}
        province={drillDownProvince}
        regencies={regencyData?.regencies || []}
        hoveredRegencyId={hoveredRegencyId}
        onHoverRegency={setHoveredRegencyId}
        onSelectRegency={(reg) => {
          setIsRegencyListModalOpen(false);
          handleRegencyClick(reg);
        }}
      />

      {/* marquee ticker */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-7 items-center overflow-hidden border-t-2 border-black bg-red-600 font-mono text-[11px] font-black uppercase tracking-widest text-white shadow-brutal-sm dark:border-white'>
        <div className='flex animate-marquee items-center whitespace-nowrap'>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <Star className='-mt-0.5 size-3 shrink-0 fill-white stroke-none' />
            <span className='leading-none'>REPUBLIK INDONESIA</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>38 PROVINSI RESMI</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>DARI SABANG SAMPAI MERAUKE</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>17.000+ PULAU</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>BHINNEKA TUNGGAL IKA</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>PETA INTERAKTIF DIGITAL</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <Star className='-mt-0.5 size-3 shrink-0 fill-white stroke-none' />
            <span className='leading-none'>REPUBLIK INDONESIA</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>38 PROVINSI RESMI</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>DARI SABANG SAMPAI MERAUKE</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>17.000+ PULAU</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>BHINNEKA TUNGGAL IKA</span>
          </span>
          <span className='mx-4 inline-flex items-center gap-1.5 leading-none'>
            <span className='-mt-0.5 size-1.5 shrink-0 rounded-full bg-white' />
            <span className='leading-none'>PETA INTERAKTIF DIGITAL</span>
          </span>
        </div>
      </div>
    </section>
  );
}
