import { useCallback, useEffect, useRef, useState } from 'react';

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export interface UseMapPanZoomOptions {
  onDragMove?: () => void;
}

export function useMapPanZoom(options?: UseMapPanZoomOptions) {
  // zoom and pan states
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

  // sync refs with state on render
  positionRef.current = position;
  scaleRef.current = scale;

  // calculate pan boundaries based on scale and container size
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

  // zoom toward cursor focal point or container center
  const zoomTo = useCallback(
    (nextScaleVal: number, clientPoint?: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container) return;

      const currentScale = scaleRef.current;
      const currentPos = positionRef.current;

      const nextScale = clamp(Number(nextScaleVal.toFixed(2)), 0.75, 6);
      if (nextScale === currentScale) return;

      options?.onDragMove?.();

      if (nextScale <= 1) {
        scaleRef.current = nextScale;
        positionRef.current = { x: 0, y: 0 };
        setScale(nextScale);
        setPosition({ x: 0, y: 0 });
        return;
      }

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const cursorX = clientPoint ? clientPoint.x - rect.left : centerX;
      const cursorY = clientPoint ? clientPoint.y - rect.top : centerY;

      const deltaX = cursorX - centerX;
      const deltaY = cursorY - centerY;

      const r = nextScale / currentScale;

      // maintain content position under cursor
      const targetX = deltaX - r * (deltaX - currentPos.x);
      const targetY = deltaY - r * (deltaY - currentPos.y);

      const bounds = getPanBounds(nextScale);
      const clampedX = clamp(targetX, bounds.minX, bounds.maxX);
      const clampedY = clamp(targetY, bounds.minY, bounds.maxY);

      const nextPos = { x: clampedX, y: clampedY };

      // update refs immediately for rapid consecutive events
      scaleRef.current = nextScale;
      positionRef.current = nextPos;
      setScale(nextScale);
      setPosition(nextPos);
    },
    [getPanBounds, options],
  );

  const handleZoomIn = useCallback(() => {
    const current = scaleRef.current;
    const next = current < 1 ? 1 : Math.min(6, Number((current + 0.5).toFixed(2)));
    zoomTo(next);
  }, [zoomTo]);

  const handleZoomOut = useCallback(() => {
    const current = scaleRef.current;
    const next =
      current <= 1
        ? Math.max(0.75, Number((current - 0.25).toFixed(2)))
        : Math.max(0.75, Number((current - 0.5).toFixed(2)));
    zoomTo(next);
  }, [zoomTo]);

  const handleReset = useCallback(() => {
    scaleRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
    setScale(1);
    setPosition({ x: 0, y: 0 });
    options?.onDragMove?.();
  }, [options]);

  // mouse wheel zoom centered on cursor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentScale = scaleRef.current;

      let delta = 0;
      if (Math.abs(e.deltaY) < 30) {
        // continuous trackpad scrolling
        delta = -e.deltaY * 0.01;
      } else {
        // discrete mouse wheel notches
        delta =
          e.deltaY < 0
            ? currentScale >= 2
              ? 0.5
              : 0.25
            : currentScale > 2
              ? -0.5
              : -0.25;
      }

      const nextScale = currentScale + delta;
      zoomTo(nextScale, { x: e.clientX, y: e.clientY });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  // keyboard navigation (+, -, 0, r)
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

  // mouse drag listeners
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

      const newPos = { x: targetX, y: targetY };
      positionRef.current = newPos;
      setPosition(newPos);
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const currentScale = scaleRef.current;
      const bounds = getPanBounds(currentScale);
      if (currentScale <= 1) {
        positionRef.current = { x: 0, y: 0 };
        setPosition({ x: 0, y: 0 });
      } else {
        const clamped = {
          x: clamp(positionRef.current.x, bounds.minX, bounds.maxX),
          y: clamp(positionRef.current.y, bounds.minY, bounds.maxY),
        };
        positionRef.current = clamped;
        setPosition(clamped);
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

  // touch drag and pinch-to-zoom listeners
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
        setIsDragging(true);
        hasDraggedRef.current = true;
        options?.onDragMove?.();

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

        const newPos = { x: targetX, y: targetY };
        positionRef.current = newPos;
        setPosition(newPos);
      } else if (e.touches.length === 2 && pinchStartDistRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const ratio = dist / pinchStartDistRef.current;
        const nextScale = clamp(
          Number((pinchStartScaleRef.current * ratio).toFixed(2)),
          0.75,
          6,
        );

        zoomTo(nextScale, { x: midX, y: midY });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setIsDragging(false);
        pinchStartDistRef.current = null;

        const currentScale = scaleRef.current;
        const bounds = getPanBounds(currentScale);
        if (currentScale <= 1) {
          positionRef.current = { x: 0, y: 0 };
          setPosition({ x: 0, y: 0 });
        } else {
          const clamped = {
            x: clamp(positionRef.current.x, bounds.minX, bounds.maxX),
            y: clamp(positionRef.current.y, bounds.minY, bounds.maxY),
          };
          positionRef.current = clamped;
          setPosition(clamped);
        }
      } else if (e.touches.length === 1) {
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          startPosX: positionRef.current.x,
          startPosY: positionRef.current.y,
        };
        pinchStartDistRef.current = null;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, getPanBounds, options, zoomTo]);

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
