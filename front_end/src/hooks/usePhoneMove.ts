import { useEffect, useState, useRef } from 'react';
import _ from 'lodash';

interface Position {
  x: number;
  y: number;
}

export const useDragHandler = (handleDragUp: () => void, handleDragDown: () => void) => {
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const debouncedHandleDragUp = _.debounce(handleDragUp, 300);
  const debouncedHandleDragDown = _.debounce(handleDragDown, 300);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const handleStart = (x: number, y: number) => {
      setStartPosition({ x, y });
    };

    const handleEnd = (y: number) => {
      if (!startPosition) return;

      if (y < startPosition.y) {
        debouncedHandleDragUp();
      } else if (y > startPosition.y) {
        debouncedHandleDragDown();
      }

      setStartPosition(null);
    };

    const handleMouseDown = (event: MouseEvent) => {
      handleStart(event.clientX, event.clientY);
    };

    const handleMouseUp = (event: MouseEvent) => {
      handleEnd(event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!startPosition) return;
      handleEnd(event.clientY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      handleStart(event.touches[0].clientX, event.touches[0].clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!startPosition || !event.changedTouches[0]) return;
      handleEnd(event.changedTouches[0].clientY);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [startPosition, debouncedHandleDragUp, debouncedHandleDragDown]);

  return elementRef;
};
