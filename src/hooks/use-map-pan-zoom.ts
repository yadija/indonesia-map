import { useCallback, useEffect, useRef, useState } from 'react';

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export interface UseMapPanZoomOptions {
  onDragMove?: () => void;
}

export function useMapPanZoom(options?: UseMapPanZoomOptions) {
  // Zoom and Pan States: default 1 (100%), min 0.75 (75%), max 6 (600%)
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });
  const hasDraggedRef = useRef(false);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);

  // Sync refs with state
  positionRef.current = position;
  scaleRef.current = scale;

  // Calculate pan boundaries based on current scale and container size
  const getPanBounds = useCallback((currentScale: number) => {
    const container = containerRef.current;
    const w = container ? container.clientWidth : 800;
    const h = container ? container.clientHeight : 400;

    if (currentScale <= 1) {
      return {
        minX: -w * 0.15,
        maxX: w * 0.15,
        minY: -h * 0.15,
        maxY: h * 0.15,
      };
    }

    const limitX = (w * currentScale - w) / 2 + w * 0.15;
    const limitY = (h * currentScale - h) / 2 + h * 0.15;

    return {
      minX: -limitX,
      maxX: limitX,
      minY: -limitY,
      maxY: limitY,
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      if (prev < 1) return 1;
      return Math.min(6, Number((prev + 0.5).toFixed(2)));
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      if (prev <= 1) {
        return Math.max(0.75, Number((prev - 0.25).toFixed(2)));
      }
      return Math.max(0.75, Number((prev - 0.5).toFixed(2)));
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setScale((prev) => {
        const next = Math.min(6, Math.max(0.75, Number((prev + delta).toFixed(2))));
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard navigation (+, -, 0, r)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset]);

  // Mouse drag listeners with stable references
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPosX: positionRef.current.x,
        startPosY: positionRef.current.y,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 5) {
        hasDraggedRef.current = true;
        options?.onDragMove?.();
      }

      const bounds = getPanBounds(scaleRef.current);
      let targetX = dragStartRef.current.startPosX + dx;
      let targetY = dragStartRef.current.startPosY + dy;

      if (targetX < bounds.minX) {
        targetX = bounds.minX + (targetX - bounds.minX) * 0.25;
      } else if (targetX > bounds.maxX) {
        targetX = bounds.maxX + (targetX - bounds.maxX) * 0.25;
      }

      if (targetY < bounds.minY) {
        targetY = bounds.minY + (targetY - bounds.minY) * 0.25;
      } else if (targetY > bounds.maxY) {
        targetY = bounds.maxY + (targetY - bounds.maxY) * 0.25;
      }

      setPosition({ x: targetX, y: targetY });
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const currentScale = scaleRef.current;
      const bounds = getPanBounds(currentScale);
      if (currentScale <= 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((prev) => ({
          x: clamp(prev.x, bounds.minX, bounds.maxX),
          y: clamp(prev.y, bounds.minY, bounds.maxY),
        }));
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, getPanBounds, options]);

  // Touch drag and pinch-to-zoom listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          startPosX: positionRef.current.x,
          startPosY: positionRef.current.y,
        };
      } else if (e.touches.length === 2) {
        setIsDragging(false);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        pinchStartDistRef.current = dist;
        pinchStartScaleRef.current = scaleRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) > 5) {
          hasDraggedRef.current = true;
          options?.onDragMove?.();
        }

        const bounds = getPanBounds(scaleRef.current);
        let targetX = dragStartRef.current.startPosX + dx;
        let targetY = dragStartRef.current.startPosY + dy;

        if (targetX < bounds.minX) {
          targetX = bounds.minX + (targetX - bounds.minX) * 0.25;
        } else if (targetX > bounds.maxX) {
          targetX = bounds.maxX + (targetX - bounds.maxX) * 0.25;
        }

        if (targetY < bounds.minY) {
          targetY = bounds.minY + (targetY - bounds.minY) * 0.25;
        } else if (targetY > bounds.maxY) {
          targetY = bounds.maxY + (targetY - bounds.maxY) * 0.25;
        }

        setPosition({ x: targetX, y: targetY });
      } else if (e.touches.length === 2 && pinchStartDistRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const ratio = dist / pinchStartDistRef.current;
        const next = Math.min(
          6,
          Math.max(0.75, Number((pinchStartScaleRef.current * ratio).toFixed(2))),
        );
        setScale(next);
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    const onTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        const currentScale = scaleRef.current;
        const bounds = getPanBounds(currentScale);
        if (currentScale <= 1) {
          setPosition({ x: 0, y: 0 });
        } else {
          setPosition((prev) => ({
            x: clamp(prev.x, bounds.minX, bounds.maxX),
            y: clamp(prev.y, bounds.minY, bounds.maxY),
          }));
        }
      }
      pinchStartDistRef.current = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, getPanBounds, options]);

  return {
    containerRef,
    scale,
    position,
    isDragging,
    hasDraggedRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
  };
}
