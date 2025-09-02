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
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isAnimating) return;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'h': // Vim-style
        e.preventDefault();
        if (currentIndex > 0) {
          handleNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
      case 'l': // Vim-style
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

  // Handle navigation with animation
  const handleNavigate = (newIndex: number) => {
    if (isAnimating || newIndex === currentIndex) return;
    
    setIsAnimating(true);
    onNavigate(newIndex);
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end and detect swipe
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < total - 1) {
      handleNavigate(currentIndex + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      handleNavigate(currentIndex - 1);
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigation handlers
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

  // const goToIndex = (index: number) => {
  //   if (index >= 0 && index < total) {
  //     handleNavigate(index);
  //   }
  // };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      

      {/* Navigation buttons - only show if multiple entries */}
      {total > 1 && (
        <>
          {/* Previous button (Older entry) */}
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

          {/* Next button (Newer entry) */}
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

      
      
      {/* Render children content with smooth slide transitions */}
      <div className="w-full h-full flex items-center justify-center">
        <div 
          key={currentIndex}
          className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-out ${
            isAnimating ? 'animate-slide-in' : 'animate-fade-in-up'
          }`}
          style={{
            animationDelay: '0ms',
            animationFillMode: 'both'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SwipeNavigator;