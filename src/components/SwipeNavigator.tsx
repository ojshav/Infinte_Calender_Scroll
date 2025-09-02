
import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { SwipeNavigatorProps } from '../types/props';

const SwipeNavigator: React.FC<SwipeNavigatorProps> = ({
  currentIndex,
  total,
  onNavigate,
  children
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const gestureStartXRef = useRef<number | null>(null);
  const gestureStartTimeRef = useRef<number>(0);
  const lastMoveXRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  
 
  const minSwipeDistance = 40; // px
  const minSwipeVelocity = 0.35; // px/ms

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isAnimating) return;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'h': 
        e.preventDefault();
        if (currentIndex > 0) {
          handleNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
      case 'l': 
        e.preventDefault();
        if (currentIndex < total - 1) {
          handleNavigate(currentIndex + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        handleNavigate(0);
        break;
      case 'End':
        e.preventDefault();
        handleNavigate(total - 1);
        break;
    }
  }, [currentIndex, total, isAnimating]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNavigate = (newIndex: number) => {
    if (isAnimating || newIndex === currentIndex) return;
    
    setIsAnimating(true);
    onNavigate(newIndex);
    
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const x = e.targetTouches[0].clientX;
    setTouchEnd(null);
    setTouchStart(x);
    gestureStartXRef.current = x;
    gestureStartTimeRef.current = performance.now();
    lastMoveXRef.current = x;
    lastMoveTimeRef.current = gestureStartTimeRef.current;
    setIsDragging(true);
    setDragDeltaX(0);
  };

 
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const x = e.targetTouches[0].clientX;
    setTouchEnd(x);
    if (gestureStartXRef.current !== null) {
      const delta = x - gestureStartXRef.current;
      // Limit drag so users feel resistance at edges
      const isAtStart = currentIndex === 0 && delta > 0;
      const isAtEnd = currentIndex === total - 1 && delta < 0;
      const dampened = (isAtStart || isAtEnd) ? delta * 0.35 : delta;
      setDragDeltaX(dampened);
      lastMoveTimeRef.current = performance.now();
      lastMoveXRef.current = x;
    }
  };

  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) {
      setIsDragging(false);
      setDragDeltaX(0);
      return;
    }
    const distance = touchEnd - touchStart; // positive: right swipe
    const dt = Math.max(1, performance.now() - gestureStartTimeRef.current);
    const velocity = distance / dt; // px/ms

    const shouldGoPrev = (distance > minSwipeDistance || velocity > minSwipeVelocity) && currentIndex > 0;
    const shouldGoNext = (distance < -minSwipeDistance || velocity < -minSwipeVelocity) && currentIndex < total - 1;

    setIsDragging(false);

    if (shouldGoNext) {
      // animate out to left, then navigate
      setDragDeltaX(-window.innerWidth);
      setTimeout(() => {
        setDragDeltaX(0);
        handleNavigate(currentIndex + 1);
      }, 150);
    } else if (shouldGoPrev) {
      // animate out to right, then navigate
      setDragDeltaX(window.innerWidth);
      setTimeout(() => {
        setDragDeltaX(0);
        handleNavigate(currentIndex - 1);
      }, 150);
    } else {
      // snap back
      setDragDeltaX(0);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    gestureStartXRef.current = null;
  };

  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      handleNavigate(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < total - 1) {
      handleNavigate(currentIndex + 1);
    }
  };



  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      

      
      {total > 1 && (
        <>
     
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isAnimating}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentIndex === 0 ? 'opacity-50' : 'hover:bg-opacity-100'
            }`}
            aria-label="Previous entry (older)"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="sr-only">Older entry</span>
          </button>

        
          <button
            onClick={goToNext}
            disabled={currentIndex === total - 1 || isAnimating}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentIndex === total - 1 ? 'opacity-50' : 'hover:bg-opacity-100'
            }`}
            aria-label="Next entry (newer)"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="sr-only">Newer entry</span>
          </button>
        </>
      )}

      
      
     
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div
          key={currentIndex}
          className={`w-full h-full flex items-center justify-center ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
          style={{ transform: `translateX(${dragDeltaX}px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SwipeNavigator;