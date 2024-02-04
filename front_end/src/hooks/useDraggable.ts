import { useState, useEffect, useRef } from 'react';

const useDraggable = (initialPos: {x: number, y: number}) => {
  const [pos, setPos] = useState(initialPos);
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });
  let width = document.body.scrollWidth

  useEffect(() => {
    const handleStart = (clientX: number, clientY: number) => {
      draggingRef.current = true;
      originRef.current = { x: clientX - pos.x, y: clientY - pos.y };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!draggingRef.current || !ref.current) return;
      if (width <=700) return
      const { offsetWidth, offsetHeight } = ref.current;
      const { innerWidth, innerHeight } = window;

      let newX = clientX - originRef.current.x;
      let newY = clientY - originRef.current.y;

      // Check boundaries
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + offsetWidth > innerWidth) newX = innerWidth - offsetWidth;
      if (newY + offsetHeight > innerHeight) newY = innerHeight - offsetHeight;

      const newPos = { x: newX, y: newY };
      setPos(newPos);
    };

    const handleEnd = () => {
      draggingRef.current = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    if (ref.current) {
      ref.current.addEventListener('mousedown', handleMouseDown);
      ref.current.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mousedown', handleMouseDown);
        ref.current.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
      }
    };
  });

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return;
      if (width <=700) return
      const { offsetWidth, offsetHeight } = ref.current;
      const { innerWidth, innerHeight } = window;
      if (pos.x + offsetWidth > innerWidth) {
        setPos(prevPos => ({ ...prevPos, x: innerWidth - offsetWidth }));
      }
      if (pos.y + offsetHeight > innerHeight) {
        setPos(prevPos => ({ ...prevPos, y: innerHeight - offsetHeight }));
      }
    };

    window.addEventListener('resize', () => {
      handleResize()
      width = document.body.scrollWidth
    });

    return () => {
      window.removeEventListener('resize', () => {
        handleResize()
        width = document.body.scrollWidth
      });
    };
  });

  return { pos, ref };
};

export default useDraggable;
