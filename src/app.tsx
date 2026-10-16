import { useEffect, useMemo, useState } from 'react';

// components
import ChoroplethLegend from './components/choropleth-legend';
import CompareFloatingBar from './components/compare-floating-bar';
import CompareModal from './components/compare-modal';
import InfoSheet from './components/info-sheet';
import SearchBarFilter from './components/search-bar-filter';
import SVGElement from './components/svg-element';
// data
import indonesiaMap from './data/indonesia-map.json';
import { useTheme } from './hooks/use-theme';
// hooks
import { useToast } from './hooks/use-toast';
import { ChoroplethMetric } from './interfaces/choropleth';
// interfaces
import { Province } from './interfaces/province';
import { computeChoropleth } from './utils/choropleth';

const provincesList: Province[] = indonesiaMap as Province[];

export default function App() {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState<Province | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<ChoroplethMetric>('none');
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  // Compare Mode States
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  // Compute choropleth data when metric is active
  const choroplethConfig = useMemo(
    () => computeChoropleth(activeMetric, provincesList),
    [activeMetric],
  );

  // Compared provinces objects
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

  // Handle adding or removing province from comparison list
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

  return (
    <section className='bg-brutalist-grid relative grid h-screen min-h-[100dvh] select-none place-items-center overflow-hidden bg-background text-foreground transition-colors duration-200'>
      {/* Brutalist Architectural Coordinates & Corner Marks */}
      <div className='pointer-events-none absolute left-4 top-4 z-10 hidden select-none flex-col gap-0.5 font-mono text-[10px] font-bold text-muted-foreground/50 md:flex'>
        <span>[IDN-GRID // 0°47&apos;S 113°55&apos;E]</span>
        <span>[GEODETIC WGS84 // EPSG:4326]</span>
      </div>
      <div className='pointer-events-none absolute right-4 top-4 z-10 hidden select-none flex-col items-end gap-0.5 font-mono text-[10px] font-bold text-muted-foreground/50 md:flex'>
        <span>[38 PROVINSI // 17.000+ PULAU]</span>
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

      {/* Floating Search Bar, Island Filter, Mode Switcher & Theme Switcher */}
      <SearchBarFilter
        provinces={provincesList}
        selectedIsland={selectedIsland}
        activeMetric={activeMetric}
        isDark={isDark}
        isCompareActive={isCompareMode}
        compareCount={comparedIds.length}
        onToggleTheme={toggleTheme}
        onToggleCompareMode={handleToggleCompareMode}
        onSelectMetric={setActiveMetric}
        onSelectIsland={setSelectedIsland}
        onSelectProvince={handleSelectProvince}
      />

      {/* Map Canvas */}
      <div className='flex size-full items-center justify-center pb-10 pt-16 sm:pb-8 sm:pt-20'>
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
      </div>

      {/* Thematic Map Choropleth Legend */}
      <ChoroplethLegend
        config={choroplethConfig}
        isDark={isDark}
        hoveredTier={hoveredTier}
        hasCompareBar={comparedProvinces.length > 0}
        onHoverTier={setHoveredTier}
      />

      {/* Floating Comparison Dock (Active when compared provinces exist) */}
      <CompareFloatingBar
        comparedProvinces={comparedProvinces}
        onRemove={handleRemoveCompared}
        onClear={handleClearCompared}
        onOpenModal={() => setIsCompareModalOpen(true)}
      />

      {/* Detail Province Sheet */}
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
      />

      {/* Side-by-Side Province Comparison Dialog Modal */}
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

      {/* Continuous Motion-Driven Marquee Ticker Ribbon */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t-2 border-black bg-red-600 py-1 font-mono text-[11px] font-black uppercase tracking-widest text-white shadow-brutal-sm dark:border-white'>
        <div className='flex animate-marquee whitespace-nowrap'>
          <span className='mx-4'>★ REPUBLIK INDONESIA</span>
          <span className='mx-4'>• 38 PROVINSI RESMI</span>
          <span className='mx-4'>• DARI SABANG SAMPAI MERAUKE</span>
          <span className='mx-4'>• 17.000+ PULAU</span>
          <span className='mx-4'>• BHINNEKA TUNGGAL IKA</span>
          <span className='mx-4'>• PETA INTERAKTIF DIGITAL</span>
          <span className='mx-4'>★ REPUBLIK INDONESIA</span>
          <span className='mx-4'>• 38 PROVINSI RESMI</span>
          <span className='mx-4'>• DARI SABANG SAMPAI MERAUKE</span>
          <span className='mx-4'>• 17.000+ PULAU</span>
          <span className='mx-4'>• BHINNEKA TUNGGAL IKA</span>
          <span className='mx-4'>• PETA INTERAKTIF DIGITAL</span>
        </div>
      </div>
    </section>
  );
}
