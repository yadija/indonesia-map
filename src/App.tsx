import { useEffect, useMemo, useState } from 'react';

// components
import ChoroplethLegend from './components/ChoroplethLegend';
import InfoSheet from './components/InfoSheet';
import SearchBarFilter from './components/SearchBarFilter';
import SVGElement from './components/SVGElement';
// data
import indonesiaMap from './data/indonesia-map.json';
import { useTheme } from './hooks/use-theme';
// hooks
import { useToast } from './hooks/use-toast';
import { ChoroplethMetric } from './interfaces/IChoropleth';
// interfaces
import { IProvince } from './interfaces/IProvince';
import { computeChoropleth } from './utils/choropleth';

export default function App() {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState<IProvince | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<ChoroplethMetric>('none');
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  // Compute choropleth data when metric is active
  const choroplethConfig = useMemo(
    () => computeChoropleth(activeMetric, indonesiaMap),
    [activeMetric],
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

  const handlePathClick = (id: string) => {
    const selected = indonesiaMap.find((map) => map.id === id);
    if (selected) {
      setProvince(selected);
      setHighlightedId(id);
      setOpen(true);
    }
  };

  const handleSelectProvince = (id: string) => {
    const selected = indonesiaMap.find((map) => map.id === id);
    if (selected) {
      setProvince(selected);
      setHighlightedId(id);
      setOpen(true);
    }
  };

  return (
    <section className='relative grid h-screen place-items-center overflow-hidden bg-background text-foreground transition-colors duration-200'>
      {/* Floating Search Bar, Island Filter, Mode Switcher & Theme Switcher */}
      <SearchBarFilter
        provinces={indonesiaMap}
        selectedIsland={selectedIsland}
        activeMetric={activeMetric}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSelectMetric={setActiveMetric}
        onSelectIsland={setSelectedIsland}
        onSelectProvince={handleSelectProvince}
      />

      {/* Map Canvas */}
      <div className='flex size-full items-center justify-center pb-6 pt-24'>
        <SVGElement
          shapes={indonesiaMap}
          selectedIsland={selectedIsland}
          highlightedId={highlightedId}
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
      />
    </section>
  );
}
