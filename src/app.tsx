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
        title: 'Info',
        description: 'Peta interaktif 38 provinsi Indonesia',
        duration: 8000,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [toast]);

  // Handle adding or removing province from comparison list
  const handleToggleCompare = (prov: Province) => {
    if (comparedIds.includes(prov.id)) {
      setComparedIds((prev) => prev.filter((id) => id !== prov.id));
      toast({
        title: 'Dihapus dari Komparasi',
        description: `${prov.name} dihapus dari daftar perbandingan.`,
        duration: 3000,
      });
    } else {
      if (comparedIds.length >= 3) {
        toast({
          title: 'Batas Maksimal Tercapai',
          description: 'Maksimal 3 provinsi untuk dibandingkan sekaligus.',
          duration: 4000,
        });
        return;
      }
      setComparedIds((prev) => [...prev, prov.id]);
      setIsCompareMode(true);
      toast({
        title: 'Ditambahkan ke Komparasi',
        description: `${prov.name} (${comparedIds.length + 1}/3) ditambahkan ke daftar perbandingan.`,
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
          title: 'Mode Komparasi Aktif',
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
    <section className='relative grid h-screen place-items-center overflow-hidden bg-background text-foreground transition-colors duration-200'>
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
      <div className='flex size-full items-center justify-center pb-6 pt-24'>
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
    </section>
  );
}
